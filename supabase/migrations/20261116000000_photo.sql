-- =====================================================================================
-- Photo de profil visible par les amis du groupe.
-- La photo (JPEG 240 px, environ 15 Ko) est stockée dans le profil ; photo_v est sa « version » : les téléphones ne
-- retéléchargent une photo que lorsque sa version change (économie de transfert sur l'offre gratuite).
-- Lecture : membres du même groupe seulement (règle profiles_read existante). Écriture : le joueur, sur son propre profil
-- (règle profiles_update existante). À appliquer après 20261115000000_reactions_fix.sql.
-- =====================================================================================
alter table public.profiles
  add column if not exists photo text
    check (photo is null or (length(photo) < 60000 and photo like 'data:image/jpeg;base64,%')),
  add column if not exists photo_v int not null default 0;
