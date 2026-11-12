-- =====================================================================================
-- Lot 4 : plusieurs groupes, un jeu par groupe, saison de 21 jours avec bonus de gemmes.
--   1. Un joueur peut être dans jusqu'à 5 groupes. Chaque groupe a SON jeu du jour (rotation propre au groupe :
--      groups.fmt_offset / fmt_stride). Les groupes existants gardent la rotation d'origine (décalage 0, pas 1).
--   2. Chaque essai appartient à un groupe (attempts.group_id) : 2 essais par jour ET PAR GROUPE.
--   3. Les boussoles sont gagnées par groupe et par jour, avec un bonus qui monte avec la saison :
--      jour 1 = +0 %, jour 2 = +5 %, … jour 9 = +40 %, jour 21 = +100 % (saison de 21 jours).
--   4. Les fonctions de lecture acceptent un groupe (p_group) ; sans groupe, elles utilisent le plus ancien
--      (l'ancienne version de l'application continue donc de fonctionner).
-- À appliquer après 20261116000000_photo.sql, AVANT de publier le code qui en dépend.
-- =====================================================================================

-- ---------- 1. Schéma ----------
update public.app_config set season_days = 21 where id = 1;

alter table public.groups
  add column if not exists fmt_offset smallint not null default 0,
  add column if not exists fmt_stride smallint not null default 1;

alter table public.group_members drop constraint if exists group_members_user_id_key;
create index if not exists group_members_user_idx on public.group_members (user_id);

alter table public.attempts add column if not exists group_id uuid references public.groups (id) on delete cascade;
update public.attempts a set group_id = (select gm.group_id from public.group_members gm where gm.user_id = a.user_id order by gm.joined_at limit 1)
  where a.group_id is null;
alter table public.attempts drop constraint if exists attempts_user_id_day_try_idx_key;
create unique index if not exists attempts_user_group_day_try
  on public.attempts (user_id, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid)), day, try_idx);
create index if not exists attempts_group_day on public.attempts (group_id, day);

-- registre des boussoles : une ligne par joueur, jour et groupe (on le recalcule entièrement ci-dessous)
alter table public.gem_ledger drop constraint if exists gem_ledger_pkey;
delete from public.gem_ledger;
delete from public.settled_days;
create unique index if not exists gem_ledger_user_day_group
  on public.gem_ledger (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid)));

-- ---------- 2. Fonctions utilitaires ----------
create or replace function public.my_group() returns uuid       -- compatibilité : le plus ancien groupe
language sql stable security definer set search_path = public as $$
  select group_id from group_members where user_id = auth.uid() order by joined_at, group_id limit 1
$$;

create or replace function public.my_groups() returns setof uuid
language sql stable security definer set search_path = public as $$
  select group_id from group_members where user_id = auth.uid()
$$;

-- groupe visé : celui demandé s'il fait partie de ceux de l'appelant, sinon le plus ancien
create or replace function public._pick_group(p_group uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select case when p_group is null then public.my_group()
              when exists (select 1 from group_members where user_id = auth.uid() and group_id = p_group) then p_group
              else null end
$$;

-- jeu d'un jour pour un groupe : pas premier avec 28, donc aucun jeu ne revient avant 28 jours
create or replace function public.format_of(p_day date, p_group uuid) returns text
language sql stable set search_path = public as $$
  select f.key
  from formats f, app_config c, (select count(*)::int as n from formats) t
  left join groups g on g.id = p_group
  where c.id = 1
    and f.position = (((coalesce(g.fmt_offset, 0)::bigint + coalesce(g.fmt_stride, 1)::bigint * (p_day - c.format_anchor)) % t.n) + t.n) % t.n
$$;

-- ---------- 3. Groupes ----------
create or replace function public.create_group(p_name text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  strides constant smallint[] := array[1,3,5,9,11,13,15,17,19,23,25,27];
  c text; i int; gid uuid; nf int;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  if (select count(*) from group_members where user_id = uid) >= 5 then return jsonb_build_object('ok', false, 'error', 'too_many_groups'); end if;
  if char_length(btrim(p_name)) not between 2 and 24 then return jsonb_build_object('ok', false, 'error', 'bad_name'); end if;
  select count(*) into nf from formats;
  loop
    c := '';
    for i in 1..6 loop c := c || substr(alphabet, 1 + (get_byte(extensions.gen_random_bytes(1), 0) % 32), 1); end loop;
    exit when not exists (select 1 from groups g where g.code = c);
  end loop;
  insert into groups (code, name, owner_id, fmt_offset, fmt_stride)
    values (c, btrim(p_name), uid, floor(random() * nf)::smallint, strides[1 + floor(random() * array_length(strides, 1))::int])
    returning groups.id into gid;
  insert into group_members (group_id, user_id, role) values (gid, uid, 'owner');
  return jsonb_build_object('ok', true, 'group', jsonb_build_object('id', gid, 'code', c, 'name', btrim(p_name)));
end $$;

create or replace function public.join_group(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  g record; n int; fails int;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  select count(*) into fails from join_attempts where user_id = uid and not ok and at > now() - interval '1 hour';
  if fails >= 10 then return jsonb_build_object('ok', false, 'error', 'too_many_attempts'); end if;
  select * into g from groups where code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then
    insert into join_attempts (user_id, ok) values (uid, false);
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;
  if exists (select 1 from group_members where user_id = uid and group_id = g.id) then return jsonb_build_object('ok', false, 'error', 'already_in_group'); end if;
  if (select count(*) from group_members where user_id = uid) >= 5 then return jsonb_build_object('ok', false, 'error', 'too_many_groups'); end if;
  select count(*) into n from group_members where group_id = g.id;
  if n >= g.max_members then return jsonb_build_object('ok', false, 'error', 'group_full'); end if;
  insert into group_members (group_id, user_id) values (g.id, uid);
  insert into join_attempts (user_id, ok) values (uid, true);
  return jsonb_build_object('ok', true, 'group', jsonb_build_object('id', g.id, 'code', g.code, 'name', g.name));
end $$;

drop function if exists public.leave_group();
create function public.leave_group(p_group uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  gid uuid; m record; heir uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  gid := public._pick_group(p_group);
  select * into m from group_members where user_id = uid and group_id = gid;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_in_group'); end if;
  delete from group_members where user_id = uid and group_id = gid;
  select user_id into heir from group_members where group_id = gid order by joined_at limit 1;
  if heir is null then
    delete from groups where id = gid;
  elsif m.role = 'owner' then
    update group_members set role = 'owner' where group_id = gid and user_id = heir;
    update groups set owner_id = heir where id = gid;
  end if;
  return jsonb_build_object('ok', true);
end $$;

drop function if exists public.remove_member(uuid);
create function public.remove_member(p_user uuid, p_group uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); gid uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  gid := public._pick_group(p_group);
  if gid is null or not exists (select 1 from group_members where user_id = uid and group_id = gid and role = 'owner') then
    return jsonb_build_object('ok', false, 'error', 'not_owner');
  end if;
  if p_user = uid then return jsonb_build_object('ok', false, 'error', 'cannot_remove_self'); end if;
  delete from group_members where group_id = gid and user_id = p_user;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare g uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  for g in select group_id from group_members where user_id = auth.uid() loop
    perform public.leave_group(g);
  end loop;
  delete from auth.users where id = auth.uid();
end $$;

-- ---------- 4. Essais : un jeu par groupe ----------
drop function if exists public.start_try();
create function public.start_try(p_group uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  d date := game_day(); f text; n int; maxtries int; a attempts; gid uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  gid := public._pick_group(p_group);
  if p_group is not null and gid is null then return jsonb_build_object('ok', false, 'error', 'not_in_group'); end if;
  perform pg_advisory_xact_lock(hashtext('try:' || uid::text));
  select tries_per_day into maxtries from app_config where id = 1;
  select count(*) into n from attempts where user_id = uid and day = d and group_id is not distinct from gid;
  if n >= maxtries then return jsonb_build_object('ok', false, 'error', 'no_tries_left', 'day', d); end if;
  f := format_of(d, gid);
  insert into attempts (user_id, group_id, day, try_idx, fmt) values (uid, gid, d, n, f) returning * into a;
  return jsonb_build_object('ok', true, 'attempt_id', a.id, 'day', d, 'fmt', f, 'try_idx', n, 'started_at', a.started_at, 'group_id', gid);
end $$;

-- ---------- 5. Classement et boussoles ----------
-- base = gems_per_rank × (N − joueurs ayant au moins le même score + 1) ; bonus = base × 5 % × (jour de saison − 1)
drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text)
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank, season_anchor, season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id, max(a.score) as best, count(*)::int as tries,
           bool_or(a.slow > 1) as slow, max(a.submitted_at) as at
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    where a.group_id = gid and a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  ranked as (
    select p.play_day, p.user_id, p.best, p.tries, p.slow, p.at,
           rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p
  ),
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

drop function if exists public.season_overview(date);
create function public.season_overview(p_day date default null, p_group uuid default null)
returns table (play_day date, player_id uuid, pseudo text, best int, tries int, pos int, n int, gems int, slow boolean, at timestamptz,
               score_key uuid, base int, bonus int, pct int, beaten int, fmt text)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, public.game_day()) - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days
    from cfg c
  )
  select g.play_day, g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.n, g.gems, g.slow, g.at,
         md5(g.play_day::text || g.user_id::text || gx.gid::text)::uuid,
         g.base, g.bonus, g.pct, g.beaten, g.fmt
  from gx, s
  cross join lateral public._group_scores(gx.gid, s.d1, s.d1 + s.season_days - 1) g
  join profiles pr on pr.id = g.user_id
  where gx.gid is not null
  order by g.play_day, g.pos, pr.pseudo
$$;

-- Historique d'un joueur : tous ses jeux joués, tous groupes confondus (« mois glissant » / « all time » filtrés côté appli)
create or replace function public.my_history(p_days int default 3650)
returns table (play_day date, group_id uuid, group_name text, fmt text, best int, pos int, n int, gems int)
language sql stable security definer set search_path = public as $$
  select s.play_day, gm.group_id, g.name, s.fmt, s.best, s.pos, s.n, s.gems
  from group_members gm
  join groups g on g.id = gm.group_id
  cross join lateral public._group_scores(gm.group_id, public.game_day() - greatest(1, least(p_days, 3650)), public.game_day()) s
  where gm.user_id = auth.uid() and s.user_id = auth.uid()
  order by s.play_day desc, g.name
$$;

drop function if exists public.day_results(date);
create function public.day_results(p_day date default null, p_group uuid default null)
returns table (player_id uuid, pseudo text, best int, tries int, pos int, gems int, slow boolean, is_final boolean)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid), cfg as (select timezone from app_config where id = 1),
  dd as (select coalesce(p_day, game_day()) as day)
  select g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.gems, g.slow,
         (((dd.day + 1)::timestamp at time zone cfg.timezone) + interval '1 hour' < now())
  from gx, dd, cfg
  cross join lateral public._group_scores(gx.gid, dd.day, dd.day) g
  join profiles pr on pr.id = g.user_id
  where gx.gid is not null
  order by g.pos, pr.pseudo
$$;

drop function if exists public.season_standings(date);
create function public.season_standings(p_day date default null, p_group uuid default null)
returns table (player_id uuid, pseudo text, total int, days_played int, pos int)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, game_day()) - c.season_anchor) / c.season_days) * c.season_days) as start_day, c.season_days
    from cfg c
  ),
  t as (
    select gm.user_id,
           coalesce(sum(l.amount) filter (where l.day >= s.start_day and l.day < s.start_day + s.season_days), 0)::int as total,
           (count(l.day) filter (where l.day >= s.start_day and l.day < s.start_day + s.season_days and l.amount > 0))::int as days_played
    from gx cross join s
    join group_members gm on gm.group_id = gx.gid
    left join gem_ledger l on l.user_id = gm.user_id and l.group_id = gx.gid
    group by gm.user_id
  )
  select t.user_id, pr.pseudo, t.total, t.days_played, rank() over (order by t.total desc)::int
  from t join profiles pr on pr.id = t.user_id
  order by 5, pr.pseudo
$$;

-- Total tous groupes : boussoles, victoires, jours joués (nourrit l'évolution du familier)
drop function if exists public.my_summary();
create function public.my_summary(p_group uuid default null) returns jsonb
language sql stable security definer set search_path = public as $$
  with sc as (
    select s.* from group_members gm
    cross join lateral public._group_scores(gm.group_id, date '2000-01-01', public.game_day() + 1) s
    where gm.user_id = auth.uid() and s.user_id = auth.uid()
  )
  select jsonb_build_object(
    'gems_total', coalesce((select sum(gems) from sc), 0),
    'wins',       (select count(*) from sc where pos = 1 and n >= 2),
    'days',       (select count(*) from sc),
    'wallet',     public.my_wallet(),
    'streak',     public.my_streak()
  )
$$;

-- Règlement : par groupe, avec la même formule (bonus compris) ; recalcule tout ce qui a été effacé plus haut
create or replace function public.settle_closed_days() returns int
language plpgsql security definer set search_path = public as $$
declare tz text; d date; g uuid; done int := 0;
begin
  select timezone into tz from app_config where id = 1;
  for d in
    select distinct a.day from attempts a
    where a.submitted_at is not null
      and ((a.day + 1)::timestamp at time zone tz) + interval '1 hour' < now()
      and not exists (select 1 from settled_days s where s.day = a.day)
    order by a.day
  loop
    for g in select distinct a.group_id from attempts a where a.day = d and a.submitted_at is not null and a.group_id is not null loop
      insert into gem_ledger (user_id, day, group_id, amount)
      select s.user_id, d, g, s.gems from public._group_scores(g, d, d) s
      on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do nothing;
    end loop;
    insert into settled_days (day) values (d) on conflict do nothing;
    done := done + 1;
  end loop;
  return done;
end $$;

-- ---------- 6. Sécurité par ligne : « un de mes groupes » au lieu de « mon groupe » ----------
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or exists (select 1 from public.group_members gm where gm.user_id = profiles.id and gm.group_id in (select public.my_groups())));

drop policy if exists groups_read on public.groups;
create policy groups_read on public.groups for select to authenticated using (id in (select public.my_groups()));
drop policy if exists members_read on public.group_members;
create policy members_read on public.group_members for select to authenticated using (group_id in (select public.my_groups()));

drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages for select to authenticated
  using (group_id in (select public.my_groups())
         and user_id not in (select b.blocked_id from public.blocks b where b.blocker_id = auth.uid()));
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated
  with check (group_id in (select public.my_groups()) and user_id = auth.uid());

drop policy if exists reactions_read on public.reactions;
create policy reactions_read on public.reactions for select to authenticated using (group_id in (select public.my_groups()));
drop policy if exists reactions_insert on public.reactions;
create policy reactions_insert on public.reactions for insert to authenticated
  with check (group_id in (select public.my_groups()) and user_id = auth.uid());
drop policy if exists reactions_update on public.reactions;
create policy reactions_update on public.reactions for update to authenticated
  using (user_id = auth.uid())
  with check (group_id in (select public.my_groups()) and user_id = auth.uid());

drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and exists (select 1 from public.messages m where m.id = message_id and m.group_id in (select public.my_groups())));

-- ---------- 7. Droits ----------
revoke execute on function public._group_scores(uuid, date, date), public._pick_group(uuid), public.settle_closed_days() from public, anon, authenticated;
revoke execute on function public.my_groups(), public.my_history(int), public.format_of(date, uuid),
  public.start_try(uuid), public.leave_group(uuid), public.remove_member(uuid, uuid),
  public.season_overview(date, uuid), public.day_results(date, uuid), public.season_standings(date, uuid), public.my_summary(uuid)
  from public, anon;
grant execute on function public.my_groups(), public.my_history(int),
  public.start_try(uuid), public.leave_group(uuid), public.remove_member(uuid, uuid),
  public.season_overview(date, uuid), public.day_results(date, uuid), public.season_standings(date, uuid), public.my_summary(uuid)
  to authenticated;

-- Recalcule les boussoles des jours déjà clos avec la nouvelle formule
select public.settle_closed_days();
