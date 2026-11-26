-- TOUT CE QUI RESTE À APPLIQUER (généré) : mérite, coefficients par jour, saison par groupe, classement unique. À coller en une fois.
-- Si une erreur apparaît, rien n'est appliqué.

-- ===================== 20261202000000_gems_merit.sql =====================
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


-- ===================== 20261203000000_mult_by_day.sql =====================
-- Multiplicateurs de difficulté par jour de jeu (v84) : ×1 / ×1,5 / ×2 à partir du 30 novembre 2026 (début de la saison 3), ×1 / ×1,25 / ×1,5 avant.
-- « Gros risque, grosse récompense » : le moyen passe de ×1,25 à ×1,5 et le difficile de ×1,5 à ×2.
-- Chaque jour de jeu est évalué avec les coefficients de SON jour (_mult_at) : un rattrapage d'un jour ancien garde les anciens coefficients,
-- et le téléphone et le serveur bascule le même jour (14 h 30). Pour changer la date ou les coefficients :
--   update app_config set mult_from = date 'AAAA-MM-JJ', mult_new = '{1,1.5,2}' where id = 1;
-- (sur une base vide, rejouer cette ligne après le seed.) À appliquer AVANT le 30 novembre ; sans danger avant : rien ne change jusque-là.
alter table public.app_config add column if not exists mult_from date, add column if not exists mult_new numeric[];
update public.app_config set mult_new = '{1,1.5,2}', mult_from = date '2026-11-30' where id = 1;

create or replace function public._mult_at(p_day date) returns numeric[]
language sql stable security definer set search_path = public as $$
  select case when c.mult_from is not null and c.mult_new is not null and p_day >= c.mult_from then c.mult_new else c.mult end
  from app_config c where c.id = 1
$$;
revoke execute on function public._mult_at(date) from public, anon, authenticated;

-- le score est validé avec les coefficients du jour de l'essai
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
  mults := public._mult_at(a.day); -- coefficients du jour de jeu (v84)
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
    select s.user_id, a.day, a.group_id, s.gems from public._group_scores(a.group_id, a.day, a.day) s
    where s.user_id in (select t.user_id from attempts t where t.group_id = a.group_id and t.day = a.day and t.catchup and t.submitted_at is not null)
    on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do update set amount = excluded.amount;
  end if;
  return jsonb_build_object('ok', true, 'score', total);
end $$;


-- la part « score » des boussoles se mesure au maximum possible du jour
drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select app_config.gems_max, app_config.season_anchor, app_config.season_days from app_config where id = 1),
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
                   3 * coalesce((select f.max_points from formats f where f.key = public.format_of(r.play_day, gid)), 100) * (public._mult_at(r.play_day))[3]))
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


-- ===================== 20261204000000_group_seasons.sql =====================
-- Une saison par groupe (v85) : la saison de 21 jours commence au lancement du groupe.
--   Groupe lancé le 1er décembre -> saison 1 du 1er au 21 décembre ; lancé le 3 -> du 3 au 23 ; la saison 2 suit, etc.
--   Le « lancement » est le jour de jeu (14 h 30) de la création du groupe : c'est le premier jeu que le groupe peut jouer.
-- Les groupes DÉJÀ créés gardent leur calendrier actuel (ancre globale du 19 octobre 2026) : rien ne bouge en cours de saison.
--   Pour réaligner un groupe existant sur sa date de création :  update groups set season_anchor = date 'AAAA-MM-JJ' where code = 'XXXXXX';
--   (à ne faire qu'au début d'une saison : les saisons déjà jouées gardent leurs numéros d'après l'ancienne ancre.)
-- Le bonus de boussoles (+5 % par jour), les classements de saison, les récompenses et les trophées, le boost « une fois par saison »,
-- le rattrapage et l'accueil « Mes groupes » suivent maintenant l'ancre du groupe (groups.season_anchor, repli sur app_config.season_anchor).
-- Corrige aussi : les victoires et les boussoles qui débloquent les familiers ne comptent que les jours CLOS (my_summary) :
--   être premier avant la fin du jour de jeu n'est plus une victoire.
-- À appliquer AVANT de publier le code v85.
alter table public.groups add column if not exists season_anchor date;
update public.groups g set season_anchor = (select c.season_anchor from public.app_config c where c.id = 1) where g.season_anchor is null;

create or replace function public._season_anchor(gid uuid) returns date
language sql stable security definer set search_path = public as $$
  select coalesce((select g.season_anchor from groups g where g.id = gid), (select c.season_anchor from app_config c where c.id = 1))
$$;
-- début de la saison d'un groupe qui contient le jour d (division entière vers le bas)
create or replace function public._season_start(gid uuid, d date) returns date
language sql stable security definer set search_path = public as $$
  select x.a + (floor((d - x.a)::numeric / x.n)::int) * x.n
  from (select public._season_anchor(gid) as a, c.season_days as n from app_config c where c.id = 1) x
$$;
-- un nouveau groupe démarre sa saison 1 à son jour de lancement
create or replace function public._groups_season_anchor() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.season_anchor is null then new.season_anchor := public.game_day(); end if;
  return new;
end $$;
drop trigger if exists groups_season_anchor on public.groups;
create trigger groups_season_anchor before insert on public.groups for each row execute function public._groups_season_anchor();
revoke execute on function public._season_anchor(uuid), public._season_start(uuid, date), public._groups_season_anchor() from public, anon, authenticated;
drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select app_config.gems_max, public._season_anchor(gid) as season_anchor, app_config.season_days from app_config where id = 1),
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
                   3 * coalesce((select f.max_points from formats f where f.key = public.format_of(r.play_day, gid)), 100) * (public._mult_at(r.play_day))[3]))
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

create or replace function public.season_overview(p_day date default null, p_group uuid default null)
returns table (play_day date, player_id uuid, pseudo text, best int, tries int, pos int, n int, gems int, slow boolean, at timestamptz,
               score_key uuid, base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  cfg as (select public._season_anchor(gx.gid) as season_anchor, season_days from app_config, gx where id = 1),
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

create or replace function public.season_standings(p_day date default null, p_group uuid default null)
returns table (player_id uuid, pseudo text, total int, days_played int, pos int)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  cfg as (select public._season_anchor(gx.gid) as season_anchor, season_days from app_config, gx where id = 1),
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

create or replace function public.my_boost(p_group uuid default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := auth.uid(); gid uuid := public._pick_group(p_group); d date := game_day(); c record; s0 date; b record; started boolean;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select public._season_anchor(gid) as season_anchor, season_days into c from app_config where id = 1;
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
  select public._season_anchor(gid) as season_anchor, season_days into c from app_config where id = 1;
  s0 := c.season_anchor + (((d - c.season_anchor) / c.season_days) * c.season_days);
  if exists (select 1 from boosts where user_id = uid and season_start = s0) then return jsonb_build_object('ok', false, 'error', 'boost_already_used'); end if;
  if exists (select 1 from attempts a where a.user_id = uid and a.group_id = gid and a.day = d) then return jsonb_build_object('ok', false, 'error', 'already_started'); end if;
  insert into boosts (user_id, group_id, day, season_start) values (uid, gid, d, s0);
  return jsonb_build_object('ok', true, 'day', d, 'group_id', gid);
end $$;

create or replace function public._catchup_days(p_user uuid, p_group uuid)
returns table (day date)
language sql stable security definer set search_path = public as $$
  with c as (select public._season_anchor(p_group) as season_anchor, season_days, timezone, day_start_min, catchup_days from app_config where id = 1),
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

create or replace function public._season_totals(gid uuid)
returns table (season int, user_id uuid, total int, days int, rk int)
language sql stable security definer set search_path = public as $$
  with c as (select public._season_anchor(gid) as a, season_days as n from app_config where id = 1),
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

create or replace function public.season_recap(p_group uuid default null, p_season int default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  gid uuid; cfg app_config; cur int; s int; d1 date; d2 date; pl jsonb; rw jsonb; gname text;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  gid := public._pick_group(p_group);
  if gid is null then return jsonb_build_object('ok', false, 'error', 'no_group'); end if;
  select * into cfg from app_config where id = 1;
  cfg.season_anchor := public._season_anchor(gid); -- saison propre au groupe (v85)
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

-- accueil « Mes groupes » : rang et total dans la saison EN COURS de chaque groupe (chacun a sa propre saison)
create or replace function public.my_groups_overview()
returns table (group_id uuid, name text, code text, members int, my_rank int, my_total int, played_today boolean, best_today int)
language sql stable security definer set search_path = public as $$
  with cfg as (select season_days from app_config where id = 1),
  mine as (select gm.group_id as gid, public._season_start(gm.group_id, public.game_day()) as d1 from group_members gm where gm.user_id = auth.uid()),
  tot as (
    select m.gid, sc.user_id, coalesce(sum(sc.gems), 0)::int as total
    from mine m cross join cfg
    cross join lateral public._group_scores(m.gid, m.d1, m.d1 + cfg.season_days - 1) sc
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

-- total du joueur : les boussoles et les victoires qui nourrissent les familiers ne comptent que les jours CLOS
create or replace function public.my_summary(p_group uuid default null) returns jsonb
language sql stable security definer set search_path = public as $$
  with sc as (
    select s.* from group_members gm
    cross join lateral public._group_scores(gm.group_id, date '2000-01-01', public.game_day() + 1) s
    where gm.user_id = auth.uid() and s.user_id = auth.uid()
  )
  select jsonb_build_object(
    'gems_total', coalesce((select sum(gems) from sc where play_day < public.game_day()), 0),
    'wins',       (select count(*) from sc where pos = 1 and n >= 2 and play_day < public.game_day()),
    'days',       (select count(*) from sc),
    'wallet',     public.my_wallet(),
    'streak',     public.my_streak()
  )
$$;


-- ===================== 20261205000000_one_ranking.sql =====================
-- Un seul classement par jour, rattrapages compris (v86).
-- Avant : les joueurs du jour étaient classés entre eux, les rattrapages face à tout le monde : un rattrapage pouvait recevoir plus de boussoles
-- que le gagnant du jour, sans que personne n'en perde. Maintenant tout le monde est dans le même classement : un meilleur score en rattrapage
-- fait reculer les autres (leurs boussoles et leur victoire du jour peuvent changer). La formule au mérite ne change pas.
-- Les jours de la saison en cours de chaque groupe sont recalculés. Les saisons terminées ne bougent pas.
-- Dépend des migrations 20261202 (mérite), 20261203 (coefficients par jour) et 20261204 (saison par groupe).
drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select app_config.gems_max, public._season_anchor(gid) as season_anchor, app_config.season_days from app_config where id = 1),
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
  -- UN SEUL classement par jour : joueurs du jour et rattrapages ensemble
  ranked as (
    select p.*, rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p
  ),
  calc as (
    select r.*,
           case when r.n >= 2 then
             round(cfg.gems_max * (
               0.5 * (r.n - r.pos)::numeric / (r.n - 1)
               + 0.5 * least(1::numeric, r.best::numeric / greatest(1::numeric,
                   3 * coalesce((select f.max_points from formats f where f.key = public.format_of(r.play_day, gid)), 100) * (public._mult_at(r.play_day))[3]))
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

-- envoi d'un score : même validation, boussoles du jour réécrites pour tous quand le classement d'un jour passé change
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
  mults := public._mult_at(a.day); -- coefficients du jour de jeu (v84)
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
  -- un rattrapage (ou un score envoyé après le règlement du jour) change la place de tout le monde : on réécrit les boussoles de TOUS les joueurs du jour
  if a.group_id is not null and (a.catchup or exists (select 1 from settled_days sd where sd.day = a.day)) then
    insert into gem_ledger (user_id, day, group_id, amount)
    select s.user_id, a.day, a.group_id, s.gems from public._group_scores(a.group_id, a.day, a.day) s
    on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do update set amount = excluded.amount;
  end if;
  return jsonb_build_object('ok', true, 'score', total);
end $$;

-- règlement d'un jour clos : le dernier calcul fait foi (un rattrapage joué avant le règlement ne doit pas figer d'anciennes valeurs)
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
      on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do update set amount = excluded.amount;
    end loop;
    insert into settled_days (day) values (d) on conflict do nothing;
    done := done + 1;
  end loop;
  return done;
end $$;

-- une fois : recalcul de la saison en cours de chaque groupe avec le classement unique
insert into gem_ledger (user_id, day, group_id, amount)
select s.user_id, x.day, x.group_id, s.gems
from (
  select distinct a.day, a.group_id
  from attempts a
  where a.submitted_at is not null and a.group_id is not null
    and a.day >= public._season_start(a.group_id, public.game_day())
    and (exists (select 1 from settled_days sd where sd.day = a.day)
         or exists (select 1 from attempts c where c.group_id = a.group_id and c.day = a.day and c.catchup and c.submitted_at is not null))
) x
cross join lateral public._group_scores(x.group_id, x.day, x.day) s
on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do update set amount = excluded.amount;


