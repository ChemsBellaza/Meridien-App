-- Export de TOUTES les données de Méridien en un seul document JSON (sauvegarde manuelle).
-- Usage : Supabase > SQL Editor > coller ce script > Run > dans le résultat, cliquer la cellule « export » > copier la valeur
-- et la coller dans un fichier `export-AAAA-MM-JJ.json` (ou utiliser « Download CSV »). Voir docs/SAUVEGARDE.md.
-- Les photos de profil (base64, volumineuses) sont exclues ; les abonnements aux notifications et les clés ne sont jamais exportés.
select jsonb_pretty(jsonb_build_object(
  'exporte_le',     now(),
  'app_config',     (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.app_config t),
  'formats',        (select coalesce(jsonb_agg(to_jsonb(t) order by t.position), '[]') from public.formats t),
  'profiles',       (select coalesce(jsonb_agg(to_jsonb(t) - 'photo'), '[]') from public.profiles t),
  'groups',         (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.groups t),
  'group_members',  (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.group_members t),
  'attempts',       (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.attempts t),
  'gem_ledger',     (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.gem_ledger t),
  'gem_spend',      (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.gem_spend t),
  'boosts',         (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.boosts t),
  'season_awards',  (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.season_awards t),
  'messages',       (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.messages t),
  'reactions',      (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.reactions t),
  'blocks',         (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.blocks t),
  'settled_days',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.settled_days t)
)) as export;
