-- =====================================================================================
-- v27 : Boost (une fois par saison et par joueur), Méga-quiz du dimanche (jeu spécial, 1 seul essai, boussoles ×2),
--       3 jeux de plus dans la rotation (Pop culture, Chanson, Mythes et littérature → 35 jeux).
--   - formats.special : un jeu spécial ne fait pas partie de la rotation ; le dimanche, TOUS les groupes jouent « megaquiz ».
--   - boosts : un joueur peut, une fois par saison, faire compter son score ×1,5 sur UN jeu (ses 2 essais, dans le
--     classement du jour). Il faut l'activer AVANT le premier essai du jour dans ce groupe.
--   - le dimanche, les boussoles gagnées sont doublées (avant le bonus de saison).
-- À appliquer après 20261120000000_more_formats.sql, AVANT de publier le code v27.
-- =====================================================================================

alter table public.formats add column if not exists special boolean not null default false;
insert into public.formats (position, key, max_points, special) values
  (32, 'popculture', 300, false),
  (33, 'chanson', 300, false),
  (34, 'mythes', 300, false),
  (100, 'megaquiz', 400, true)
on conflict (position) do update set key = excluded.key, max_points = excluded.max_points, special = excluded.special;

-- jeu du jour : le dimanche = méga-quiz pour tout le monde, sinon la rotation (sur les jeux non spéciaux)
create or replace function public.format_of(p_day date) returns text
language sql stable set search_path = public as $$
  select case when extract(dow from p_day) = 0 then 'megaquiz' else (
    select f.key from formats f, app_config c, (select count(*)::int as n from formats where not special) t
    where c.id = 1 and not f.special and f.position = (((p_day - c.format_anchor) % t.n) + t.n) % t.n
  ) end
$$;

create or replace function public.format_of(p_day date, p_group uuid) returns text
language sql stable set search_path = public as $$
  select case when extract(dow from p_day) = 0 then 'megaquiz' else (
    select f.key
    from formats f, app_config c, (select count(*)::int as n from formats where not special) t
    left join groups g on g.id = p_group
    where c.id = 1 and not f.special
      and f.position = (((coalesce(g.fmt_offset, 0)::bigint + coalesce(g.fmt_stride, 1)::bigint * (p_day - c.format_anchor)) % t.n) + t.n) % t.n
  ) end
$$;

-- ---------- boosts ----------
create table if not exists public.boosts (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  group_id     uuid not null references public.groups (id) on delete cascade,
  day          date not null,
  season_start date not null,
  created_at   timestamptz not null default now(),
  primary key (user_id, season_start)           -- un seul boost par saison et par joueur
);
alter table public.boosts enable row level security;
drop policy if exists boosts_read_own on public.boosts;
create policy boosts_read_own on public.boosts for select to authenticated using (user_id = auth.uid());
revoke all on public.boosts from anon;
revoke insert, update, delete, truncate on public.boosts from authenticated;

create or replace function public.my_boost(p_group uuid default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := auth.uid(); gid uuid := public._pick_group(p_group); d date := game_day(); c record; s0 date; b record; started boolean;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select season_anchor, season_days into c from app_config where id = 1;
  s0 := c.season_anchor + (((d - c.season_anchor) / c.season_days) * c.season_days);
  select * into b from boosts where user_id = uid and season_start = s0;
  select exists (select 1 from attempts a where a.user_id = uid and a.group_id is not distinct from gid and a.day = d) into started;
  return jsonb_build_object('season_start', s0, 'season_end', s0 + c.season_days - 1,
    'used', b.user_id is not null, 'used_day', b.day, 'used_group', b.group_id,
    'active_today', b.user_id is not null and b.day = d and b.group_id is not distinct from gid,
    'can_use', gid is not null and b.user_id is null and not started);
end $$;

create or replace function public.use_boost(p_group uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid(); gid uuid := public._pick_group(p_group); d date := game_day(); c record; s0 date;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if gid is null then return jsonb_build_object('ok', false, 'error', 'not_in_group'); end if;
  perform pg_advisory_xact_lock(hashtext('boost:' || uid::text));
  select season_anchor, season_days into c from app_config where id = 1;
  s0 := c.season_anchor + (((d - c.season_anchor) / c.season_days) * c.season_days);
  if exists (select 1 from boosts where user_id = uid and season_start = s0) then return jsonb_build_object('ok', false, 'error', 'boost_already_used'); end if;
  if exists (select 1 from attempts a where a.user_id = uid and a.group_id = gid and a.day = d) then return jsonb_build_object('ok', false, 'error', 'already_started'); end if;
  insert into boosts (user_id, group_id, day, season_start) values (uid, gid, d, s0);
  return jsonb_build_object('ok', true, 'day', d, 'group_id', gid);
end $$;

-- ---------- start_try : un jeu spécial n'a qu'un essai ----------
drop function if exists public.start_try(uuid, date);
create function public.start_try(p_group uuid default null, p_day date default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  d date := game_day(); f text; n int; maxtries int; a attempts; gid uuid; late boolean := false; sp boolean;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  gid := public._pick_group(p_group);
  if p_group is not null and gid is null then return jsonb_build_object('ok', false, 'error', 'not_in_group'); end if;
  perform pg_advisory_xact_lock(hashtext('try:' || uid::text));
  select tries_per_day into maxtries from app_config where id = 1;
  if p_day is not null and p_day <> d then
    if gid is null or not exists (select 1 from public._catchup_days(uid, gid) x where x.day = p_day) then
      return jsonb_build_object('ok', false, 'error', 'catchup_unavailable');
    end if;
    d := p_day; maxtries := 1; late := true;
  end if;
  f := format_of(d, gid);
  select special into sp from formats where key = f;
  if sp then maxtries := 1; end if;
  select count(*) into n from attempts where user_id = uid and day = d and group_id is not distinct from gid;
  if n >= maxtries then return jsonb_build_object('ok', false, 'error', 'no_tries_left', 'day', d); end if;
  insert into attempts (user_id, group_id, day, try_idx, fmt, catchup) values (uid, gid, d, n, f, late) returning * into a;
  return jsonb_build_object('ok', true, 'attempt_id', a.id, 'day', d, 'fmt', f, 'try_idx', n, 'started_at', a.started_at, 'group_id', gid, 'catchup', late);
end $$;

-- ---------- classement : boost ×1,5 sur le score, dimanche ×2 sur les boussoles ----------
drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank, season_anchor, season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id,
           max(round(a.score * case when bo.user_id is not null then 1.5 else 1 end)::int) as best,
           count(*)::int as tries, bool_or(a.slow > 1) as slow, max(a.submitted_at) as at, bool_or(a.catchup) as late,
           array_agg(round(a.score * case when bo.user_id is not null then 1.5 else 1 end)::int order by a.try_idx) as try_scores,
           bool_or(bo.user_id is not null) as boost
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    left join boosts bo on bo.user_id = a.user_id and bo.group_id = a.group_id and bo.day = a.day
    where a.group_id = gid and a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  reg as (
    select p.*, rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p where not p.late
  ),
  lat as (
    select p.*,
           (select count(*) from reg r where r.play_day = p.play_day and r.best > p.best)::int + 1 as pos,
           (select count(*) from reg r where r.play_day = p.play_day)::int + 1 as n,
           (select count(*) from reg r where r.play_day = p.play_day and r.best >= p.best)::int + 1 as at_least
    from played p where p.late
  ),
  ranked as (select * from reg union all select * from lat),
  calc as (
    select r.*, case when r.n >= 2 then cfg.gems_per_rank * (r.n - r.at_least + 1) else 0 end as base,
           case when extract(dow from r.play_day) = 0 then 2 else 1 end as mult,
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base * c.mult + round(c.base * c.mult * c.pct / 100.0)::int, c.base, round(c.base * c.mult * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid), c.try_scores, c.mult, c.boost
  from calc c
$$;

drop function if exists public.season_overview(date, uuid);
create function public.season_overview(p_day date default null, p_group uuid default null)
returns table (play_day date, player_id uuid, pseudo text, best int, tries int, pos int, n int, gems int, slow boolean, at timestamptz,
               score_key uuid, base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, public.game_day()) - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days
    from cfg c
  )
  select g.play_day, g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.n, g.gems, g.slow, g.at,
         md5(g.play_day::text || g.user_id::text || gx.gid::text)::uuid,
         g.base, g.bonus, g.pct, g.beaten, g.fmt, g.try_scores, g.mult, g.boost
  from gx, s
  cross join lateral public._group_scores(gx.gid, s.d1, s.d1 + s.season_days - 1) g
  join profiles pr on pr.id = g.user_id
  where gx.gid is not null
  order by g.play_day, g.pos, pr.pseudo
$$;

-- droits
revoke execute on function public._group_scores(uuid, date, date) from public, anon, authenticated;
revoke execute on function public.my_boost(uuid), public.use_boost(uuid), public.start_try(uuid, date), public.season_overview(date, uuid) from public, anon;
grant execute on function public.my_boost(uuid), public.use_boost(uuid), public.start_try(uuid, date), public.season_overview(date, uuid) to authenticated;
