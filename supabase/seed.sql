-- GÉNÉRÉ par scripts/gen-supabase-seed.py à partir de src/p1_config.js : ne pas modifier à la main.

insert into public.app_config (id, tries_per_day, gems_per_rank, joker_cost, mult, format_anchor, season_anchor, season_days, timezone)
values (1, 2, 16, 25, '{1,1.25,1.5}', date '2026-10-25', date '2026-10-19', 21, 'Europe/Paris')
on conflict (id) do update set tries_per_day = excluded.tries_per_day, gems_per_rank = excluded.gems_per_rank, joker_cost = excluded.joker_cost,
  mult = excluded.mult, format_anchor = excluded.format_anchor, season_anchor = excluded.season_anchor, season_days = excluded.season_days;

insert into public.formats (position, key, max_points) values
  (0, 'sprint', 300),
  (1, 'quiz', 300),
  (2, 'motdujour', 300),
  (3, 'carte', 200),
  (4, 'petitbac', 300),
  (5, 'paysmystere', 300),
  (6, 'drapeaux', 300),
  (7, 'connexions', 300),
  (8, 'anagrammes', 300),
  (9, 'frise', 200),
  (10, 'capitales', 300),
  (11, 'neavant', 300),
  (12, 'intrus', 300),
  (13, 'plusmoins', 300),
  (14, 'comptebon', 300),
  (15, 'quisuisje', 200),
  (16, 'top10', 300),
  (17, 'distance', 300),
  (18, 'silhouettes', 300),
  (19, 'relier', 300),
  (20, 'sigles', 300),
  (21, 'vraifaux', 300),
  (22, 'rebus', 300),
  (23, 'chaine', 300),
  (24, 'voisins', 300),
  (25, 'citations', 200),
  (26, 'classement', 300),
  (27, 'blocs', 300),
  (28, 'expressions', 300),
  (29, 'inventions', 300),
  (30, 'monuments', 300),
  (31, 'corps', 300),
  (32, 'popculture', 300),
  (33, 'chanson', 300),
  (34, 'mythes', 300)
on conflict (position) do update set key = excluded.key, max_points = excluded.max_points;
