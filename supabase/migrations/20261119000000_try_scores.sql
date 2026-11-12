-- =====================================================================================
-- Score de chaque essai : _group_scores / season_overview renvoient aussi la liste des scores des essais (dans l'ordre),
-- pour afficher « Essai 1 : 410 pts · Essai 2 : 527 pts » dans le détail d'un score.
-- Ne change aucune règle de classement ni de boussoles. À appliquer après 20261118000000_catchup.sql,
-- AVANT de publier le code qui en dépend (l'ancien code ignore simplement la colonne en plus).
-- =====================================================================================

drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[])
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank, season_anchor, season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id, max(a.score) as best, count(*)::int as tries,
           bool_or(a.slow > 1) as slow, max(a.submitted_at) as at, bool_or(a.catchup) as late,
           array_agg(a.score order by a.try_idx) as try_scores
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
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
           (select count(*) from reg r where r.play_day = p.play_day and r.best > p.best)::int + 1 as pos,
           (select count(*) from reg r where r.play_day = p.play_day)::int + 1 as n,
           (select count(*) from reg r where r.play_day = p.play_day and r.best >= p.best)::int + 1 as at_least
    from played p where p.late
  ),
  ranked as (select * from reg union all select * from lat),
  calc as (
    select r.*, case when r.n >= 2 then cfg.gems_per_rank * (r.n - r.at_least + 1) else 0 end as base,
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base + round(c.base * c.pct / 100.0)::int, c.base, round(c.base * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid), c.try_scores
  from calc c
$$;

drop function if exists public.season_overview(date, uuid);
create function public.season_overview(p_day date default null, p_group uuid default null)
returns table (play_day date, player_id uuid, pseudo text, best int, tries int, pos int, n int, gems int, slow boolean, at timestamptz,
               score_key uuid, base int, bonus int, pct int, beaten int, fmt text, try_scores int[])
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, public.game_day()) - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days
    from cfg c
  )
  select g.play_day, g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.n, g.gems, g.slow, g.at,
         md5(g.play_day::text || g.user_id::text || gx.gid::text)::uuid,
         g.base, g.bonus, g.pct, g.beaten, g.fmt, g.try_scores
  from gx, s
  cross join lateral public._group_scores(gx.gid, s.d1, s.d1 + s.season_days - 1) g
  join profiles pr on pr.id = g.user_id
  where gx.gid is not null
  order by g.play_day, g.pos, pr.pseudo
$$;

revoke execute on function public._group_scores(uuid, date, date) from public, anon, authenticated;
revoke execute on function public.season_overview(date, uuid) from public, anon;
grant execute on function public.season_overview(date, uuid) to authenticated;
