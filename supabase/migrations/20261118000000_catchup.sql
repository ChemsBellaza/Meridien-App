-- =====================================================================================
-- Rattrapage : un joueur qui arrive dans un groupe en cours de saison peut jouer UN SEUL essai sur chacun des jeux
-- précédents de la saison (jours depuis le début de la saison ou la création du groupe, jusqu'à la veille de son arrivée).
--   - le score de rattrapage est classé face aux joueurs qui ont joué ce jour-là, SANS changer leur place ni leurs boussoles ;
--   - le bonus de saison est celui du jour rattrapé ;
--   - les boussoles du joueur sont inscrites dans son registre au moment de l'envoi du score ;
--   - un rattrapage ne compte pas dans la série (flamme).
-- À appliquer après 20261117000000_multigroups.sql, AVANT de publier le code qui en dépend.
-- =====================================================================================

alter table public.attempts add column if not exists catchup boolean not null default false;

-- jours rattrapables par un joueur dans un groupe (interne)
create or replace function public._catchup_days(p_user uuid, p_group uuid)
returns table (day date)
language sql stable security definer set search_path = public as $$
  with c as (select season_anchor, season_days, timezone from app_config where id = 1),
  t as (select (now() at time zone c.timezone)::date as today, c.* from c),
  b as (
    select greatest(
             t.season_anchor + (((t.today - t.season_anchor) / t.season_days) * t.season_days),
             (select (g.created_at at time zone t.timezone)::date from groups g where g.id = p_group)
           ) as first_day,
           least(t.today - 1,
                 (select (gm.joined_at at time zone t.timezone)::date from group_members gm where gm.group_id = p_group and gm.user_id = p_user) - 1) as last_day
    from t
  )
  select d::date
  from b, generate_series(b.first_day::timestamp, b.last_day::timestamp, interval '1 day') d
  where not exists (select 1 from attempts a where a.user_id = p_user and a.group_id = p_group and a.day = d::date)
$$;

create or replace function public.my_catchup(p_group uuid default null)
returns table (day date, fmt text)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid)
  select x.day, public.format_of(x.day, gx.gid)
  from gx cross join lateral public._catchup_days(auth.uid(), gx.gid) x
  where gx.gid is not null
  order by x.day desc
$$;

-- start_try : p_day (facultatif) = jour à rattraper ; sans lui, le jeu du jour comme avant
drop function if exists public.start_try(uuid);
create function public.start_try(p_group uuid default null, p_day date default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  d date := game_day(); f text; n int; maxtries int; a attempts; gid uuid; late boolean := false;
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
  select count(*) into n from attempts where user_id = uid and day = d and group_id is not distinct from gid;
  if n >= maxtries then return jsonb_build_object('ok', false, 'error', 'no_tries_left', 'day', d); end if;
  f := format_of(d, gid);
  insert into attempts (user_id, group_id, day, try_idx, fmt, catchup) values (uid, gid, d, n, f, late) returning * into a;
  return jsonb_build_object('ok', true, 'attempt_id', a.id, 'day', d, 'fmt', f, 'try_idx', n, 'started_at', a.started_at, 'group_id', gid, 'catchup', late);
end $$;

-- classement : les rattrapages se placent face aux joueurs « normaux » du jour sans les déplacer
drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text)
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank, season_anchor, season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id, max(a.score) as best, count(*)::int as tries,
           bool_or(a.slow > 1) as slow, max(a.submitted_at) as at, bool_or(a.catchup) as late
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
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
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base + round(c.base * c.pct / 100.0)::int, c.base, round(c.base * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid)
  from calc c
$$;

-- envoi du score : un rattrapage inscrit tout de suite les boussoles du joueur (le jour est déjà réglé pour les autres)
create or replace function public.submit_score(p_attempt uuid, p_rounds jsonb, p_slow numeric default 1) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  a attempts; mx int; mults numeric[]; r jsonb; d int; p int; total int := 0; elapsed interval; fl text[] := '{}';
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into a from attempts where id = p_attempt and user_id = uid for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'unknown_attempt'); end if;
  if a.submitted_at is not null then return jsonb_build_object('ok', false, 'error', 'already_submitted'); end if;
  if p_slow not in (1, 1.5, 2) then return jsonb_build_object('ok', false, 'error', 'bad_slow'); end if;
  elapsed := now() - a.started_at;
  if elapsed > interval '60 minutes' then return jsonb_build_object('ok', false, 'error', 'expired'); end if;
  if elapsed < interval '20 seconds' then return jsonb_build_object('ok', false, 'error', 'too_fast'); end if;
  if jsonb_typeof(p_rounds) <> 'array' or jsonb_array_length(p_rounds) <> 3 then return jsonb_build_object('ok', false, 'error', 'bad_rounds'); end if;
  select max_points into mx from formats where key = a.fmt;
  select mult into mults from app_config where id = 1;
  begin
    for r in select * from jsonb_array_elements(p_rounds) loop
      d := (r ->> 'diff')::int; p := (r ->> 'pts')::int;
      if d is null or d not between 0 and 2 or p is null or p < 0 or p > ceil(mx * mults[d + 1]) then
        return jsonb_build_object('ok', false, 'error', 'bad_rounds');
      end if;
      total := total + p;
    end loop;
  exception when invalid_text_representation or numeric_value_out_of_range then
    return jsonb_build_object('ok', false, 'error', 'bad_rounds');
  end;
  if elapsed < interval '45 seconds' then fl := array_append(fl, 'fast'); end if;
  update attempts set submitted_at = now(), score = total, rounds = p_rounds, slow = p_slow, flags = fl where id = a.id;
  if a.catchup and a.group_id is not null then
    insert into gem_ledger (user_id, day, group_id, amount)
    select s.user_id, a.day, a.group_id, s.gems from public._group_scores(a.group_id, a.day, a.day) s where s.user_id = uid
    on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do nothing;
  end if;
  return jsonb_build_object('ok', true, 'score', total);
end $$;

-- la série (flamme) ignore les rattrapages
create or replace function public.my_streak() returns int
language sql stable security definer set search_path = public as $$
  with d as (select distinct day from attempts where user_id = auth.uid() and submitted_at is not null and not catchup),
  g as (select day, day - (row_number() over (order by day))::int as grp from d),
  runs as (select max(day) as last_day, count(*)::int as len from g group by grp order by max(day) desc limit 1)
  select coalesce((select len from runs where last_day >= game_day() - 1), 0)
$$;

-- droits
revoke execute on function public._catchup_days(uuid, uuid), public._group_scores(uuid, date, date) from public, anon, authenticated;
revoke execute on function public.my_catchup(uuid), public.start_try(uuid, date) from public, anon;
grant execute on function public.my_catchup(uuid), public.start_try(uuid, date) to authenticated;
