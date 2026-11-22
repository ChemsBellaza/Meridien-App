-- =====================================================================================
-- Familiers synchronisés entre appareils (v78).
-- profiles.pet (déjà présent) reçoit désormais le familier équipé à chaque changement ; pet_book garde l'expérience de
-- chaque familier ({ espèce: { games, days, stage, shiny, bg } }). Lecture : soi-même (le client ne le demande que pour
-- son propre profil) ; écriture : le joueur sur son propre profil (règle profiles_update existante).
-- À appliquer AVANT de publier le code v78 ; sans effet sur les données existantes.
-- =====================================================================================
alter table public.profiles
  add column if not exists pet_book jsonb check (pet_book is null or pg_column_size(pet_book) < 20000);
