-- Statistiques d'usage (lecture seule). À coller dans Supabase > SQL Editor, un bloc à la fois.
-- Ne modifie rien. Aucune donnée personnelle sensible : pseudos seulement.

-- 1. Par jour : joueurs actifs, essais, score moyen, messages (30 derniers jours)
with j as (
  select day, count(distinct user_id) joueurs, count(*) essais, round(avg(score)) score_moyen
  from public.attempts where submitted_at is not null and day >= current_date - 30 group by day
), m as (
  select (created_at at time zone 'Europe/Madrid')::date as day, count(*) messages, count(distinct user_id) ecrivains
  from public.messages where created_at >= now() - interval '30 days' group by 1
)
select coalesce(j.day, m.day) as jour, j.joueurs, j.essais, j.score_moyen, m.messages, m.ecrivains
from j full join m on m.day = j.day order by jour desc;

-- 2. Par joueur : jours joués, essais, meilleur et moyenne, dernier jeu
select p.pseudo, count(distinct a.day) jours_joues, count(*) essais, max(a.score) meilleur,
       round(avg(a.score)) moyenne, max(a.day) dernier_jour
from public.attempts a join public.profiles p on p.id = a.user_id
where a.submitted_at is not null group by p.pseudo order by jours_joues desc, essais desc;

-- 3. Heure de jeu (heure de Barcelone) : quand les gens jouent
select extract(hour from started_at at time zone 'Europe/Madrid')::int as heure, count(*) essais
from public.attempts group by 1 order by 1;

-- 4. Durée d'un essai (début à fin), en secondes : médiane et moyenne
select round(percentile_cont(0.5) within group (order by extract(epoch from submitted_at - started_at))) mediane_s,
       round(avg(extract(epoch from submitted_at - started_at))) moyenne_s
from public.attempts where submitted_at is not null and submitted_at - started_at < interval '30 minutes';

-- 5. Inscriptions par jour, et total
select created_at::date as jour, count(*) as nouveaux, sum(count(*)) over (order by created_at::date) total
from public.profiles group by 1 order by 1 desc;

-- 6. Notifications activées (appareils)
select count(*) appareils, count(distinct user_id) joueurs from public.push_subs;

-- 7. Points par difficulté (pour calibrer les coefficients) : manches jouées, points moyens, et taux de réussite (points / maximum possible à cette difficulté)
select (r ->> 'diff')::int as difficulte,
       count(*) as manches,
       round(avg((r ->> 'pts')::numeric)) as points_moyens,
       round(avg((r ->> 'pts')::numeric / f.max_points) * 100, 1) as pct_du_max_de_base,
       round(avg((r ->> 'pts')::numeric / (f.max_points * c.mult[(r ->> 'diff')::int + 1])) * 100, 1) as taux_reussite_pct
from public.attempts a
cross join lateral jsonb_array_elements(a.rounds) r
join public.formats f on f.key = a.fmt
cross join public.app_config c
where a.submitted_at is not null and a.rounds is not null and c.id = 1
group by 1 order by 1;

-- 8. Coefficients actuels
select mult as coefficients_par_difficulte, gems_per_rank from public.app_config where id = 1;