-- =====================================================================================
-- Lot 3, étape 4 : lecture du classement réel.
--   server_now()       : heure du serveur (l'application s'en sert pour ignorer l'horloge du téléphone)
--   _group_scores()    : calcul unique des rangs et des boussoles d'un groupe (interne, non appelable par l'application)
--   season_overview()  : toute la saison du groupe de l'appelant en une seule requête (classement du jour,
--                        jours précédents, totaux, victoires, courbes)
--   my_summary()       : boussoles totales, victoires, série, solde disponible
-- Même formule que le jeu : boussoles = gems_per_rank × (N − joueurs ayant au moins le même score + 1), rien si N < 2.
-- Aucune donnée écrite : lecture seule. À appliquer après 20261112000000_lot3_init.sql.
-- =====================================================================================

create or replace function public.server_now() returns timestamptz
language sql stable as $$ select now() $$;

create or replace function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int)
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id, max(a.score) as best, count(*)::int as tries,
           bool_or(a.slow > 1) as slow, max(a.submitted_at) as at
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    where a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  ranked as (
    select p.play_day, p.user_id, p.best, p.tries, p.slow, p.at,
           rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p
  )
  select r.play_day, r.user_id, r.best, r.tries, r.slow, r.at, r.pos, r.n,
         case when r.n >= 2 then cfg.gems_per_rank * (r.n - r.at_least + 1) else 0 end
  from ranked r, cfg
$$;

create or replace function public.season_overview(p_day date default null)
returns table (play_day date, player_id uuid, pseudo text, best int, tries int, pos int, n int, gems int, slow boolean, at timestamptz)
language sql stable security definer set search_path = public as $$
  with cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, public.game_day()) - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days
    from cfg c
  )
  select g.play_day, g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.n, g.gems, g.slow, g.at
  from s
  cross join lateral public._group_scores(public.my_group(), s.d1, s.d1 + s.season_days - 1) g
  join profiles pr on pr.id = g.user_id
  order by g.play_day, g.pos, pr.pseudo
$$;

create or replace function public.my_summary() returns jsonb
language sql stable security definer set search_path = public as $$
  with sc as (
    select * from public._group_scores(public.my_group(), date '2000-01-01', public.game_day() + 1) where user_id = auth.uid()
  )
  select jsonb_build_object(
    'gems_total', coalesce((select sum(gems) from sc), 0),
    'wins',       (select count(*) from sc where pos = 1 and n >= 2),
    'days',       (select count(*) from sc),
    'wallet',     public.my_wallet(),
    'streak',     public.my_streak()
  )
$$;

-- droits : réservées aux utilisateurs connectés ; _group_scores reste interne
revoke execute on function public._group_scores(uuid, date, date) from public, anon, authenticated;
revoke execute on function public.server_now(), public.season_overview(date), public.my_summary() from public, anon;
grant execute on function public.server_now(), public.season_overview(date), public.my_summary() to authenticated;
