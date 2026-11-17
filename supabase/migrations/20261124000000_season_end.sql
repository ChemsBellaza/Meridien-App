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
