-- v39 : six jeux de plus (la rotation passe de 35 à 41 jeux) et rattrapage du jeu de la veille.
--
-- 1. Nouveaux jeux : Histoire de France, Histoire du monde, Sports, Gastronomie, Sciences et nature, Langues du monde.
--    41 est un nombre premier : tous les pas de rotation des groupes conviennent (avec 35, les pas 5, 15 et 25 faisaient revenir
--    les mêmes 7 jeux en boucle). La bascule se fait à partir du jour de jeu app_config.rot_from
--    (20 novembre 2026) : les jours avant gardent la rotation à 35 jeux, donc la journée en cours n'est pas touchée et la migration
--    peut s'appliquer à toute heure.
-- 2. format_of(jour, groupe) rend d'abord le jeu réellement joué ce jour-là dans le groupe (table attempts) : ajouter des jeux ne
--    change plus l'historique ni le jeu d'une journée déjà entamée. Sans partie ce jour-là, la rotation s'applique comme avant.
-- 3. Jeu de la veille : un membre qui n'a pas joué le jeu d'hier (jour de jeu précédent, dans la saison en cours, depuis son arrivée)
--    peut en jouer UN essai, comme un rattrapage (classé sans bousculer les autres, boussoles de ce jour, la série l'ignore).
--
-- À appliquer AVANT de publier le code v39, à n'importe quelle heure (la journée en cours ne change pas).

-- ---------- 1. les six jeux ----------
insert into public.formats (position, key, max_points, special) values
  (35, 'histoirefr', 300, false),
  (36, 'histoiremonde', 300, false),
  (37, 'sports', 300, false),
  (38, 'gastronomie', 300, false),
  (39, 'nature', 300, false),
  (40, 'langues', 300, false)
on conflict (position) do update set key = excluded.key, max_points = excluded.max_points, special = excluded.special;

-- bascule : 35 jeux avant rot_from, tous les jeux ensuite
alter table public.app_config add column if not exists rot_old_n int not null default 35;
alter table public.app_config add column if not exists rot_from date not null default date '2026-11-20';

-- ---------- 2. le jeu déjà joué prime sur la rotation ----------
create or replace function public.format_of(p_day date, p_group uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select a.fmt from attempts a where a.group_id = p_group and a.day = p_day and a.fmt is not null order by a.started_at limit 1),
    case when extract(dow from p_day) = 0 then 'megaquiz' else (
      select f.key
      from app_config c
      cross join lateral (select case when p_day < c.rot_from then least(c.rot_old_n, x.n) else x.n end as n
                          from (select count(*)::int as n from formats where not special) x) t
      left join groups g on g.id = p_group
      join formats f on not f.special
        and f.position = (((coalesce(g.fmt_offset, 0)::bigint + coalesce(g.fmt_stride, 1)::bigint * (p_day - c.format_anchor)) % t.n) + t.n) % t.n
      where c.id = 1
    ) end
  )
$$;

-- ---------- 3. rattrapage : les jours avant l'arrivée (3 au plus) + le jeu de la veille manqué ----------
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
  )
  select cand.day from cand
  where not exists (select 1 from attempts a where a.user_id = p_user and a.group_id = p_group and a.day = cand.day)
$$;

revoke execute on function public._catchup_days(uuid, uuid) from public, anon, authenticated;
