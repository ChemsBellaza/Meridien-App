-- Rattrapage limité aux 3 jeux qui précèdent l'arrivée (v34).
-- Un joueur qui arrive le jour D peut jouer UN SEUL essai de chacun des jeux D-1, D-2 et D-3 (jamais avant le début de la saison
-- ni avant la création du groupe). La fenêtre se compte depuis le jour d'arrivée : elle reste ouverte les jours suivants,
-- jusqu'à la fin de la saison. Réglable : update app_config set catchup_days = N where id = 1;

alter table public.app_config add column if not exists catchup_days int not null default 3 check (catchup_days between 0 and 30);

create or replace function public._catchup_days(p_user uuid, p_group uuid)
returns table (day date)
language sql stable security definer set search_path = public as $$
  with c as (select season_anchor, season_days, timezone, day_start_min, catchup_days from app_config where id = 1),
  t as (select public.game_day() as today, c.* from c),
  j as (
    select t.*,
           (select ((gm.joined_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date
              from group_members gm where gm.group_id = p_group and gm.user_id = p_user) as join_day,
           (select ((g.created_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date from groups g where g.id = p_group) as created_day
    from t
  ),
  b as (
    select greatest(j.season_anchor + (((j.today - j.season_anchor) / j.season_days) * j.season_days), j.created_day, j.join_day - j.catchup_days) as first_day,
           least(j.today - 1, j.join_day - 1) as last_day
    from j
    where j.join_day is not null
  )
  select d::date
  from b, generate_series(b.first_day::timestamp, b.last_day::timestamp, interval '1 day') d
  where not exists (select 1 from attempts a where a.user_id = p_user and a.group_id = p_group and a.day = d::date)
$$;

revoke execute on function public._catchup_days(uuid, uuid) from public, anon, authenticated;
