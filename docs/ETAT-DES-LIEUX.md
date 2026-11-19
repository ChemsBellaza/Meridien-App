# État des lieux : ce qui existe et comment c'est configuré

> Photo de la situation au **19 novembre 2026 (v43)**. À mettre à jour à chaque changement d'infrastructure.
> Aucun secret ici : ni mot de passe, ni clé privée. Les clés publiques (publishable Supabase, Giphy) sont publiques par conception.

## 1. Les pièces du système

| Pièce | Où | État |
|---|---|---|
| Application (PWA) | GitHub Pages, dépôt `ChemsBellaza/Meridien-App`, branche `main` ; chaque envoi lance `.github/workflows/pages.yml` (~25 s) | En ligne, v43 |
| Code source | `src/*.js` assemblés dans l'ordre de `scripts/order.json` → `dist/meridien.html` | Voir « Construire » |
| Serveur | Supabase, projet `objfbehephvvaogmblhj` (URL `https://objfbehephvvaogmblhj.supabase.co`), clé **publishable** `sb_publishable_…` dans `src/pS_server.js` | En ligne |
| Base de données | 16 migrations dans `supabase/migrations/` (tout est appliqué) ; `supabase/apply_all.sql` = reconstruction d'une base VIDE | À jour |
| Fonction Edge | slug **`dynamic-handler`** (nom affiché « push notification »), code `supabase/functions/push/index.ts`, **Verify JWT désactivé** | Déployée ; la version avec « GIF » et message exact reste à redéployer (voir `A-FAIRE.md`) |
| Tâches planifiées (pg_cron) | `meridien-settle-days` (règle les jours), `meridien-purge-chat` (3 h 30), `meridien-settle-seasons` (récompenses de saison), `meridien-push-daily-winter` (13 h 30 UTC) et `meridien-push-daily-summer` (12 h 30 UTC) | Actives |
| Extensions | `pg_cron`, `pg_net` | Activées |
| Connexion anonyme | Authentication > Providers > « Anonymous sign-ins » | Activée |
| E-mails (récupération de compte) | SMTP Brevo (`smtp-relay.brevo.com:587`) + modèles « Magic Link » et « Change Email Address » avec `{{ .Token }}` | Modèles faits ; **test de bout en bout à confirmer** |
| GIF | Giphy, clé dans `src/pK_stickers.js` (`GIPHY_KEY`), clé gratuite d'environ 100 recherches par heure | Actif |
| Notifications push | `public/sw.js` (service worker v6), `src/pP_push.js`, table `push_subs`, clés VAPID créées par la fonction Edge dans `push_keys` | En ligne ; **premier test réel sur téléphone à confirmer** |

## 2. Réglages côté serveur (table `app_config`, une seule ligne `id = 1`)
`season_anchor = 2026-10-19`, `season_days = 21`, `timezone = Europe/Madrid`, `day_start_min = 870` (14 h 30), `catchup_days = 3`, `rot_from = 2026-11-20` et `rot_old_n = 35` (bascule à 41 jeux), `gems_per_rank = 16`, `joker_cost = 25`, `push_url = …/functions/v1/dynamic-handler`.

## 3. Contenu actuel
- **41 jeux en rotation** (positions 0 à 40, table `formats`) + **Méga-quiz du dimanche** (position 100, spécial). Liste dans `CONFIG.formatOrder` (`src/p1_config.js` + ajouts dans `pQ_more`, `pQ_pop`, `pQ_g3reg`).
- **Questions** : bases d'origine (`d*.js`) + `pQ_more.js` (288) + `pQ_pop.js` (216) + `pQ_extra.js` (≈ 490) + `pQ_g3a/b/c.js` (432). Rébus, Qui suis-je, Connexions, Top 10 et Sigles restent les plus courts.
- **Familiers** : 19 espèces (`pP2_newpets.js`, `p4_draw.js`), 8 types de plus que les 10 d'origine, histoire dans `pH_story.js`, galerie `?galerie` ou `docs/familiers-galerie.html`.
- **Autocollants** : 71 en 8 thèmes (`pK_stickers.js`) ; GIF via Giphy.
- **Saison** : 21 jours ; la saison 1 s'est terminée le 8 novembre ; la saison 2 va du 9 au 29 novembre 2026.

## 4. Construire, tester, publier
- Construire : `powershell -ExecutionPolicy Bypass -File scripts\build.ps1` (ou `build.cmd`) → `dist/meridien.html`.
- Aperçu local : `.claude/launch.json` (serveur Python sur `dist/`, port 8000). Avant chaque test : désinscrire le service worker et vider les caches.
- Test serveur : `supabase/tests/e2e.ps1` (variables `MERIDIEN_SUPABASE_URL` et `MERIDIEN_SUPABASE_KEY`) ; il crée des comptes de test et les supprime. À lancer **après 14 h 30** (changement de jour).
- Publier : **migration SQL d'abord** (SQL Editor de Supabase), puis commit et « Push origin » dans GitHub Desktop.
- Regénérer la base complète : `python scripts/gen-supabase-seed.py` puis `scripts\gen-apply-all.ps1`.

## 5. Ce qui n'a pas été vérifié sur de vrais appareils
Installation sur iPhone et Android, rappel `.ics`, clavier mobile, notification push reçue, lien d'invitation `?code=`, jeu de la veille et rattrapage avec un vrai nouvel arrivant, e-mail de récupération (SMTP), `apply_all.sql` sur un projet neuf, exactitude factuelle des questions (seule la structure est vérifiée), tests automatiques Node (`tests/`, en retard depuis le lot 3).

## 6. Limites connues
- Offre gratuite Supabase : **pas de sauvegardes automatiques** (voir `SAUVEGARDE.md`) ; le projet se met en pause après environ une semaine d'inactivité.
- Giphy gratuit : environ 100 recherches par heure.
- iPhone : l'application installée a son propre stockage (installer avant de créer son profil, sinon passer par « J'ai déjà un compte ») ; notifications seulement une fois l'application sur l'écran d'accueil (iOS 16.4 ou plus).
- Le dépôt GitHub est **public** : jamais de clé secrète dedans.
