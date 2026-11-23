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
