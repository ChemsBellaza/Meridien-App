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
