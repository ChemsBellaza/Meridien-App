-- Rattrapage exceptionnel (v80) : jusqu'à une date donnée, chaque joueur peut rattraper TOUS les jeux de la saison en cours qu'il n'a pas joués
-- (au lieu de : hier + les 3 jours avant son arrivée). Même règles qu'un rattrapage normal : 1 seul essai par jeu, classé sans bousculer les
-- autres, boussoles du jour rattrapé, ne compte pas dans la série.
-- app_config.catchup_all_until = dernier jour de jeu (heure du jeu, 14 h 30) où l'ouverture reste valable ; null = fonctionnement normal.
--   Rouvrir un autre jour :  update app_config set catchup_all_until = public.game_day() where id = 1;
--   Fermer tout de suite :   update app_config set catchup_all_until = null where id = 1;
-- À appliquer AVANT de publier le code v80.
alter table public.app_config add column if not exists catchup_all_until date;

create or replace function public._catchup_days(p_user uuid, p_group uuid)
returns table (day date)
language sql stable security definer set search_path = public as $$
  with c as (select season_anchor, season_days, timezone, day_start_min, catchup_days, catchup_all_until from app_config where id = 1),
  t as (select public.game_day() as today, c.* from c),
  j as (
    select t.*,
           (select ((gm.joined_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date
              from group_members gm where gm.group_id = p_group and gm.user_id = p_user) as join_day,
           (select ((g.created_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date from groups g where g.id = p_group) as created_day
    from t
  ),
  b as (
    select j.*,
           j.season_anchor + (((j.today - j.season_anchor) / j.season_days) * j.season_days) as season_start,
           greatest(j.season_anchor + (((j.today - j.season_anchor) / j.season_days) * j.season_days), j.created_day, j.join_day - j.catchup_days) as first_day,
           least(j.today - 1, j.join_day - 1) as last_day
    from j
    where j.join_day is not null
  ),
  cand as (
    select d::date as day from b, generate_series(b.first_day::timestamp, b.last_day::timestamp, interval '1 day') d
    union
    select b.today - 1 from b
    where b.today - 1 >= b.season_start and b.today - 1 >= b.created_day and b.today - 1 >= b.join_day
    union
    -- ouverture exceptionnelle : tous les jours de la saison en cours, du début (ou de la création du groupe) à hier
    select d::date from b, generate_series(greatest(b.season_start, b.created_day)::timestamp, (b.today - 1)::timestamp, interval '1 day') d
    where b.catchup_all_until is not null and b.today <= b.catchup_all_until
  )
  select cand.day from cand
  where not exists (select 1 from attempts a where a.user_id = p_user and a.group_id = p_group and a.day = cand.day)
$$;
revoke execute on function public._catchup_days(uuid, uuid) from public, anon, authenticated;

-- ouverture pour aujourd'hui (jusqu'à la prochaine bascule de 14 h 30)
update public.app_config set catchup_all_until = public.game_day() where id = 1;
