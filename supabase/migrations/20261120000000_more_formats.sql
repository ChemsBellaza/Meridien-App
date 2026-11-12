-- =====================================================================================
-- 4 nouveaux jeux de culture générale (v26) : Expressions françaises, Inventions et découvertes, Monuments du monde,
-- Corps humain et santé. Le serveur compte les jeux dans la table formats : la rotation passe de 28 à 32 jeux
-- (le jeu du jour de chaque groupe change donc une fois, à l'application de cette migration).
-- Les pas de rotation des groupes sont tous impairs, donc premiers avec 32 : un jeu ne revient pas avant 32 jours.
-- À appliquer AVANT de publier le code v26 (ou immédiatement avant : l'ancien code, qui connaît 28 jeux, afficherait
-- « Le jour a changé » au lancement d'un essai tant que la page n'est pas rechargée).
-- =====================================================================================
insert into public.formats (position, key, max_points) values
  (28, 'expressions', 300),
  (29, 'inventions', 300),
  (30, 'monuments', 300),
  (31, 'corps', 300)
on conflict (position) do update set key = excluded.key, max_points = excluded.max_points;
