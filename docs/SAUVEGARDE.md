# Sauvegarde : ne rien perdre

> **Rythme décidé par le propriétaire : une sauvegarde tous les 3 jours** (archive du projet + export des données). Claude vérifie la date de la dernière sauvegarde en début de session (`Documents\Meridien App\Sauvegardes\journal-sauvegardes.txt`) et la rappelle dès que 3 jours sont passés.

Trois choses à protéger : **le code**, **les données des joueurs** (Supabase) et **la mémoire du projet** (documents).

## 1. Le code et les documents
| Copie | Comment | Quand |
|---|---|---|
| **GitHub** (référence) | « Push origin » dans GitHub Desktop | à chaque lot ; le dépôt contient le code, les migrations SQL, les documents |
| **Archive locale datée** | `powershell -ExecutionPolicy Bypass -File scripts\backup-projet.ps1` → `Documents\Meridien App\Sauvegardes\meridien-AAAA-MM-JJ_HHMM.zip` (contient aussi l'historique git, garde les 15 dernières ; une ligne est ajoutée au `journal-sauvegardes.txt`) | **tous les 3 jours**, et avant un gros changement |
| **Copie hors du PC** | copier le dernier .zip sur OneDrive, une clé USB ou un autre disque (`-Dest "D:\Sauvegardes"` pour choisir le dossier) | chaque mois |

**Automatique** : une tâche Windows `Meridien-Sauvegarde-3-jours` (Planificateur de tâches, compte de Chems) lance cette archive **tous les 3 jours à 20 h** (et au prochain démarrage si le PC était éteint). Créée et testée le 19 novembre 2026. Pour la voir ou la supprimer : Planificateur de tâches, ou `Unregister-ScheduledTask -TaskName Meridien-Sauvegarde-3-jours`. Elle ne remplace pas l'export des données ni le Push origin, qui restent manuels.

## 2. Les données des joueurs (Supabase)
L'offre gratuite **n'a pas de sauvegarde automatique**. Si le projet est supprimé ou corrompu, les comptes, scores et messages sont perdus.

**Export complet en un document (recommandé, 2 minutes)**
1. Supabase > **SQL Editor** > nouvelle requête > coller `supabase/export_all.sql` > **Run**.
2. Cliquer la cellule `export` du résultat, copier sa valeur et l'enregistrer dans un fichier `export-AAAA-MM-JJ.json` à côté des archives.
3. Les photos de profil ne sont pas incluses ; les clés et abonnements aux notifications ne sont jamais exportés.

**Export table par table (si le document est trop gros pour la cellule)** : Table Editor > ouvrir la table > menu **⋯** > **Export** (CSV) pour `profiles`, `groups`, `group_members`, `attempts`, `gem_ledger`, `gem_spend`, `boosts`, `season_awards`, `messages`.

**À faire tous les 3 jours.** Avant la fin de la saison (récompenses distribuées) et avant tout changement du schéma, faire un export de plus.

## 3. Reconstruire en cas de perte
1. **Nouveau projet Supabase** : activer la connexion anonyme (Authentication > Providers), puis coller `supabase/apply_all.sql` dans le SQL Editor (reconstruit une base VIDE).
2. Adapter `SRV_URL` et la clé publishable dans `src/pS_server.js`, et `app_config.push_url`.
3. Redéployer la fonction Edge (`supabase/functions/push/index.ts`, Verify JWT désactivé) ; les clés VAPID se régénèrent toutes seules (les abonnés devront réactiver leurs notifications).
4. Ré-importer les données depuis les exports (les comptes anonymes sont liés à des identifiants Supabase : prévoir de faire « J'ai déjà un compte » par e-mail, d'où l'importance d'inviter chacun à relier son adresse e-mail).
5. Reconstruire l'application (`scripts\build.ps1`) et pousser sur GitHub.

> Limite connue : `apply_all.sql` n'a pas encore été testé sur un projet neuf. À faire une fois (projet de test gratuit), pour être sûr de la procédure.

## 4. À faire par les joueurs
- **Relier son e-mail** (Réglages > Compte) pour retrouver son compte sur un autre téléphone ou après avoir réinstallé l'application. Sans cela, un profil perdu est perdu.
