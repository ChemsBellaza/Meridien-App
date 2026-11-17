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
