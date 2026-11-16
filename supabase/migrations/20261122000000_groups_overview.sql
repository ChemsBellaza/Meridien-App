-- =====================================================================================
-- Écran d'accueil « Mes groupes » (comme Playus) : une seule requête rend, pour chacun de mes groupes,
-- le nombre de membres, mon rang et mon total de boussoles dans la saison, et si j'ai déjà joué aujourd'hui.
-- Lecture seule (aucune règle changée). À appliquer après 20261121000000_boost_sunday.sql, AVANT de publier le code.
-- =====================================================================================
create or replace function public.my_groups_overview()
returns table (group_id uuid, name text, code text, members int, my_rank int, my_total int, played_today boolean, best_today int)
language sql stable security definer set search_path = public as $$
  with cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((public.game_day() - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days from cfg c
  ),
  mine as (select gm.group_id as gid from group_members gm where gm.user_id = auth.uid()),
  tot as (
    select m.gid, sc.user_id, coalesce(sum(sc.gems), 0)::int as total
    from mine m cross join s
    cross join lateral public._group_scores(m.gid, s.d1, s.d1 + s.season_days - 1) sc
    group by m.gid, sc.user_id
  ),
  everyone as (
    select gm.group_id as gid, gm.user_id, coalesce(t.total, 0) as total
    from group_members gm join mine m on m.gid = gm.group_id
    left join tot t on t.gid = gm.group_id and t.user_id = gm.user_id
  ),
  ranked as (select e.*, rank() over (partition by e.gid order by e.total desc)::int as rk from everyone e),
  today as (
    select m.gid, sc.best from mine m
    cross join lateral public._group_scores(m.gid, public.game_day(), public.game_day()) sc
    where sc.user_id = auth.uid()
  )
  select g.id, g.name, g.code, (select count(*)::int from group_members x where x.group_id = g.id),
         r.rk, r.total, t.best is not null, t.best
  from groups g
  join mine m on m.gid = g.id
  left join ranked r on r.gid = g.id and r.user_id = auth.uid()
  left join today t on t.gid = g.id
  order by g.created_at
$$;
revoke execute on function public.my_groups_overview() from public, anon;
grant execute on function public.my_groups_overview() to authenticated;
