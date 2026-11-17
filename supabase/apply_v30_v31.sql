-- ######## 20261123 day_start ########
-- =====================================================================================
-- Le jeu du jour change chaque jour à 14 h 30, heure de Barcelone (Europe/Madrid, UTC+1 l'hiver, UTC+2 l'été).
-- Un « jour de jeu » D commence le jour D à 14 h 30 et se termine le jour D+1 à 14 h 30. Tout ce qui dépend du jour
-- (jeu, essais, classement, boussoles, série, boost, rattrapage, Méga-quiz du dimanche) suit game_day().
--   - app_config.day_start_min : heure de début du jour de jeu, en minutes (870 = 14 h 30) ; timezone passe à Europe/Madrid.
--   - day_end(jour) : instant où le jour de jeu se termine ; le règlement des boussoles a lieu 1 h après.
-- À APPLIQUER APRÈS 14 h 30 (heure de Barcelone) : le jour de jeu en cours ne change alors pas (il se prolonge jusqu'au
-- lendemain 14 h 30). Appliquée avant 14 h 30, la migration ferait revenir l'application au jour précédent.
-- À appliquer après 20261122000000_groups_overview.sql ; publier le code v30 tout de suite après.
-- =====================================================================================

alter table public.app_config add column if not exists day_start_min int not null default 870 check (day_start_min between 0 and 1439);
update public.app_config set timezone = 'Europe/Madrid', day_start_min = 870 where id = 1;

create or replace function public.game_day() returns date
language sql stable set search_path = public as $$
  select ((now() at time zone c.timezone) - make_interval(mins => c.day_start_min))::date from app_config c where c.id = 1
$$;

-- instant de fin d'un jour de jeu (= début du suivant)
create or replace function public.day_end(p_day date) returns timestamptz
language sql stable set search_path = public as $$
  select (((p_day + 1)::timestamp + make_interval(mins => c.day_start_min)) at time zone c.timezone) from app_config c where c.id = 1
$$;

-- résultats du jour : le jour est « final » 1 h après sa fin
drop function if exists public.day_results(date, uuid);
create function public.day_results(p_day date default null, p_group uuid default null)
returns table (player_id uuid, pseudo text, best int, tries int, pos int, gems int, slow boolean, is_final boolean)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  dd as (select coalesce(p_day, game_day()) as day)
  select g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.gems, g.slow, (public.day_end(dd.day) + interval '1 hour' < now())
  from gx, dd
  cross join lateral public._group_scores(gx.gid, dd.day, dd.day) g
  join profiles pr on pr.id = g.user_id
  where gx.gid is not null
  order by g.pos, pr.pseudo
$$;

-- règlement des boussoles des jours clos (1 h après la fin du jour de jeu)
create or replace function public.settle_closed_days() returns int
language plpgsql security definer set search_path = public as $$
declare d date; g uuid; done int := 0;
begin
  for d in
    select distinct a.day from attempts a
    where a.submitted_at is not null
      and public.day_end(a.day) + interval '1 hour' < now()
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

-- jours rattrapables : même logique, avec les jours de jeu (14 h 30) pour la création du groupe et l'arrivée du joueur
create or replace function public._catchup_days(p_user uuid, p_group uuid)
returns table (day date)
language sql stable security definer set search_path = public as $$
  with c as (select season_anchor, season_days, timezone, day_start_min from app_config where id = 1),
  t as (select public.game_day() as today, c.* from c),
  b as (
    select greatest(
             t.season_anchor + (((t.today - t.season_anchor) / t.season_days) * t.season_days),
             (select ((g.created_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date from groups g where g.id = p_group)
           ) as first_day,
           least(t.today - 1,
                 (select ((gm.joined_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date
                  from group_members gm where gm.group_id = p_group and gm.user_id = p_user) - 1) as last_day
    from t
  )
  select d::date
  from b, generate_series(b.first_day::timestamp, b.last_day::timestamp, interval '1 day') d
  where not exists (select 1 from attempts a where a.user_id = p_user and a.group_id = p_group and a.day = d::date)
$$;

revoke execute on function public.day_end(date), public._catchup_days(uuid, uuid), public.settle_closed_days() from public, anon, authenticated;
grant execute on function public.day_end(date) to authenticated;
revoke execute on function public.day_results(date, uuid) from public, anon;
grant execute on function public.day_results(date, uuid) to authenticated;

-- ######## 20261124 season_end ########
-- Fin de saison (v31) : cérémonie, récompenses, palmarès.
-- À appliquer APRÈS 20261123000000_day_start.sql (utilise day_end()).
--   season_awards            : récompenses de fin de saison (boussoles), inscrites une seule fois par groupe et par saison
--   _season_totals(gid)      : total, jours joués et rang de chaque joueur pour chaque saison terminée du groupe
--   _settle_group_season     : distribue les récompenses (podium 150 / 100 / 60, assiduité +20 à partir de 14 jours joués)
--   settle_seasons()         : tâche planifiée (toutes les heures) ; season_recap la déclenche aussi à la demande
--   season_recap(groupe, n)  : tout ce qu'il faut pour la cérémonie d'une saison terminée (joueurs, scores jour par jour)
--   season_hall(groupe)      : palmarès du groupe (podium de chaque saison terminée)
--   my_trophies()            : mes places sur le podium, tous groupes confondus
--   my_wallet()              : inclut désormais les récompenses de saison

create table if not exists public.season_awards (
  group_id  uuid not null references public.groups (id) on delete cascade,
  season    int  not null,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  rk        int  not null,
  gems      int  not null check (gems >= 0),
  primary key (group_id, season, user_id)
);
alter table public.season_awards enable row level security;
-- aucune politique : seules les fonctions ci-dessous (security definer) lisent et écrivent cette table

create or replace function public._season_totals(gid uuid)
returns table (season int, user_id uuid, total int, days int, rk int)
language sql stable security definer set search_path = public as $$
  with c as (select season_anchor as a, season_days as n from app_config where id = 1),
  d as (select c.a, c.n, greatest(0, (public.game_day() - c.a) / c.n) as done from c),
  e as (
    select a, n, case when done > 0 and public.day_end(a + done * n - 1) + interval '1 hour' > now() then done - 1 else done end as done
    from d
  )
  select (((g.play_day - e.a) / e.n) + 1)::int, g.user_id, sum(g.gems)::int, count(*)::int,
         (rank() over (partition by ((g.play_day - e.a) / e.n) order by sum(g.gems) desc))::int
  from e
  cross join lateral public._group_scores(gid, e.a, e.a + e.done * e.n - 1) g
  group by ((g.play_day - e.a) / e.n), g.user_id
$$;

create or replace function public._settle_group_season(gid uuid, s int) returns int
language plpgsql security definer set search_path = public as $$
declare c int := 0;
begin
  if exists (select 1 from season_awards a where a.group_id = gid and a.season = s) then return 0; end if;
  if (select count(*) from public._season_totals(gid) t where t.season = s and t.total > 0) < 2 then return 0; end if;
  insert into season_awards (group_id, season, user_id, rk, gems)
  select gid, s, t.user_id, t.rk,
         (case t.rk when 1 then 150 when 2 then 100 when 3 then 60 else 0 end) + (case when t.days >= 14 then 20 else 0 end)
  from public._season_totals(gid) t
  where t.season = s and t.total > 0 and (t.rk <= 3 or t.days >= 14)
  on conflict do nothing;
  get diagnostics c = row_count;
  return c;
end $$;

create or replace function public.settle_seasons() returns int
language plpgsql security definer set search_path = public as $$
declare r record; n int := 0;
begin
  for r in select g.id as gid, t.season from public.groups g
           cross join lateral (select distinct x.season from public._season_totals(g.id) x) t
  loop
    n := n + public._settle_group_season(r.gid, r.season);
  end loop;
  return n;
end $$;

-- portefeuille : boussoles du registre + récompenses de saison - dépenses
create or replace function public.my_wallet() returns int
language sql stable security definer set search_path = public as $$
  select (coalesce((select sum(amount) from gem_ledger where user_id = auth.uid()), 0)
        + coalesce((select sum(gems) from season_awards where user_id = auth.uid()), 0)
        - coalesce((select sum(amount) from gem_spend where user_id = auth.uid()), 0))::int
$$;

-- cérémonie : une saison terminée (par défaut la dernière)
create or replace function public.season_recap(p_group uuid default null, p_season int default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  gid uuid; cfg app_config; cur int; s int; d1 date; d2 date; pl jsonb; rw jsonb; gname text;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  gid := public._pick_group(p_group);
  if gid is null then return jsonb_build_object('ok', false, 'error', 'no_group'); end if;
  select * into cfg from app_config where id = 1;
  cur := ((public.game_day() - cfg.season_anchor) / cfg.season_days) + 1;
  s := coalesce(p_season, cur - 1);
  if s < 1 or s >= cur then return jsonb_build_object('ok', false, 'error', 'no_season'); end if;
  d1 := cfg.season_anchor + (s - 1) * cfg.season_days; d2 := d1 + cfg.season_days - 1;
  if public.day_end(d2) + interval '1 hour' > now() then return jsonb_build_object('ok', false, 'error', 'not_final'); end if;
  perform public._settle_group_season(gid, s);
  select name into gname from groups where id = gid;

  with sc as (select * from public._group_scores(gid, d1, d2)),
  tm as (
    select a.user_id, avg(extract(epoch from a.submitted_at - a.started_at)) as secs
    from attempts a
    where a.group_id = gid and a.day between d1 and d2 and a.submitted_at is not null and not a.catchup
    group by a.user_id
  ),
  ag as (
    select user_id, count(*)::int as days, (count(*) filter (where pos = 1 and n >= 2))::int as wins,
           round(avg(best))::int as avg, max(best) as top, coalesce(sum(beaten), 0)::int as beaten,
           avg((pos - 1)::numeric / greatest(n - 1, 1)) filter (where play_day < d1 + 10) as early,
           avg((pos - 1)::numeric / greatest(n - 1, 1)) filter (where play_day >= d1 + 11) as late
    from sc group by user_id
  )
  select jsonb_agg(jsonb_build_object(
           'id', pr.id, 'name', pr.pseudo, 'pet', pr.pet, 'total', t.total, 'rank', t.rk, 'days', ag.days, 'wins', ag.wins,
           'avg', ag.avg, 'top', ag.top, 'beaten', ag.beaten, 'early', round(ag.early, 3), 'late', round(ag.late, 3),
           'secs', round(tm.secs), 'award', coalesce(aw.gems, 0)) order by t.rk, pr.pseudo)
  into pl
  from public._season_totals(gid) t
  join ag on ag.user_id = t.user_id
  join profiles pr on pr.id = t.user_id
  left join tm on tm.user_id = t.user_id
  left join season_awards aw on aw.group_id = gid and aw.season = s and aw.user_id = t.user_id
  where t.season = s;

  select jsonb_agg(jsonb_build_object('u', x.user_id, 'd', x.play_day, 'b', x.best, 'p', x.pos, 'n', x.n, 'g', x.gems, 'f', x.fmt) order by x.play_day, x.pos)
  into rw from public._group_scores(gid, d1, d2) x;

  return jsonb_build_object('ok', true, 'group_id', gid, 'group', gname, 'season', s, 'd1', d1, 'd2', d2,
                            'players', coalesce(pl, '[]'::jsonb), 'rows', coalesce(rw, '[]'::jsonb));
end $$;

-- palmarès du groupe : podium de chaque saison terminée
create or replace function public.season_hall(p_group uuid default null) returns jsonb
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  t as (
    select x.season, jsonb_agg(jsonb_build_object('id', pr.id, 'name', pr.pseudo, 'pet', pr.pet, 'total', x.total, 'rank', x.rk) order by x.rk, pr.pseudo) as top
    from gx, lateral public._season_totals(gx.gid) x
    join profiles pr on pr.id = x.user_id
    where gx.gid is not null and x.rk <= 3 and x.total > 0
    group by x.season
  )
  select coalesce(jsonb_agg(jsonb_build_object('season', t.season, 'top', t.top) order by t.season desc), '[]'::jsonb) from t
$$;

-- mes places sur le podium, tous groupes confondus
create or replace function public.my_trophies() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('group_id', gm.group_id, 'group', g.name, 'season', t.season, 'rank', t.rk, 'total', t.total) order by t.season desc, g.name), '[]'::jsonb)
  from group_members gm
  join groups g on g.id = gm.group_id
  cross join lateral public._season_totals(gm.group_id) t
  where gm.user_id = auth.uid() and t.user_id = auth.uid() and t.rk <= 3 and t.total > 0
$$;

revoke execute on function public._season_totals(uuid), public._settle_group_season(uuid, int), public.settle_seasons() from public, anon, authenticated;
revoke execute on function public.season_recap(uuid, int), public.season_hall(uuid), public.my_trophies() from public, anon;
grant execute on function public.season_recap(uuid, int), public.season_hall(uuid), public.my_trophies() to authenticated;

do $$ begin
  perform cron.schedule('meridien-settle-seasons', '17 * * * *', 'select public.settle_seasons()');
exception when others then
  raise notice 'pg_cron indisponible (%). Planifier select public.settle_seasons() chaque heure (facultatif : season_recap le fait aussi à la demande).', sqlerrm;
end $$;

select public.settle_seasons();
