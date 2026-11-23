-- Boussoles plus méritocratiques (v82).
-- Avant : base = 16 × (nombre de joueurs battus + 1) : le gain dépendait de la taille du groupe (1er d'un jeu à 5 = 80, 5e d'un jeu à 10 = 96).
-- Maintenant : base = gems_max × ( moitié selon la PLACE en pourcentage + moitié selon le SCORE sur le maximum possible ) :
--     place   = (N − place) / (N − 1)            1er = 1, dernier = 0, ex æquo = même place, quelle que soit la taille du groupe ;
--     score   = meilleur score / (3 manches × points max × ×1,5), plafonné à 1 ;
--   le bonus de saison (+5 % par jour) et le ×2 du dimanche s'appliquent ensuite comme avant. Toujours rien s'il y a moins de 2 joueurs.
-- Le serveur reste seul juge : tout passe par _group_scores. Les jours déjà réglés de la SAISON EN COURS sont recalculés pour que les totaux
-- et les jours affichés restent cohérents (les saisons terminées ne bougent pas).
-- À appliquer AVANT de publier le code v82.
alter table public.app_config add column if not exists gems_max int not null default 200 check (gems_max between 20 and 2000);

drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select app_config.gems_max, app_config.mult[3] as m3, app_config.season_anchor, app_config.season_days from app_config where id = 1),
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
           ((select count(*) from reg r where r.play_day = p.play_day and r.best > p.best)
            + (select count(*) from played l where l.play_day = p.play_day and l.late and l.best > p.best))::int + 1 as pos,
           ((select count(*) from reg r where r.play_day = p.play_day)
            + (select count(*) from played l where l.play_day = p.play_day and l.late))::int as n,
           ((select count(*) from reg r where r.play_day = p.play_day and r.best >= p.best)
            + (select count(*) from played l where l.play_day = p.play_day and l.late and l.best >= p.best))::int as at_least
    from played p where p.late
  ),
  ranked as (select * from reg union all select * from lat),
  calc as (
    select r.*,
           case when r.n >= 2 then
             round(cfg.gems_max * (
               0.5 * (r.n - r.pos)::numeric / (r.n - 1)
               + 0.5 * least(1::numeric, r.best::numeric / greatest(1::numeric,
                   3 * coalesce((select f.max_points from formats f where f.key = public.format_of(r.play_day, gid)), 100) * cfg.m3))
             ))::int
           else 0 end as base,
           case when extract(dow from r.play_day) = 0 then 2 else 1 end as mult,
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base * c.mult + round(c.base * c.mult * c.pct / 100.0)::int, c.base, round(c.base * c.mult * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid), c.try_scores, c.mult, c.boost
  from calc c
$$;
revoke execute on function public._group_scores(uuid, date, date) from public, anon, authenticated;

-- une fois : recalcul des jours déjà réglés de la saison en cours (même formule partout)
insert into gem_ledger (user_id, day, group_id, amount)
select s.user_id, x.day, x.group_id, s.gems
from (
  select distinct a.day, a.group_id
  from attempts a, app_config c
  where a.submitted_at is not null and a.group_id is not null
    and a.day >= c.season_anchor + (((public.game_day() - c.season_anchor) / c.season_days) * c.season_days)
    and exists (select 1 from settled_days sd where sd.day = a.day)
) x
cross join lateral public._group_scores(x.group_id, x.day, x.day) s
on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do update set amount = excluded.amount;
