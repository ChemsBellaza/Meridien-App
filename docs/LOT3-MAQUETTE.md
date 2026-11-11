# Lot 3 : multijoueur réel (Supabase)

**Statut (11 novembre 2026) : base appliquée sur le projet de test `objfbehephvvaogmblhj` et vérifiée.** Appliquée par Chems via le SQL Editor (`supabase/apply_all.sql`), puis testée de bout en bout par `supabase/tests/e2e.ps1` : **43 contrôles sur 43 passent** (groupes, codes faux et freinage, 2 essais maximum, score truqué ou instantané refusé, écritures directes refusées, confidentialité, classement du jour, boussoles, chat, blocage, signalement, propriété du groupe, suppression de compte). Aucune intégration dans l'application pour l'instant : le jeu fonctionne toujours en local.

**Pas encore vérifié** : le règlement des boussoles (`settle_closed_days`) et sa tâche planifiée horaire (`pg_cron`), qui demandent d'attendre un jour clos ou d'ouvrir l'éditeur SQL ; le classement de saison ; l'expiration d'un essai après 60 minutes ; la limite de messages par minute ; les avertissements du « Security Advisor » du tableau de bord. La région du projet (Europe attendue) est à confirmer.

Fichiers : `supabase/migrations/20261112000000_lot3_init.sql` (base), `supabase/seed.sql` (généré depuis le code par `scripts/gen-supabase-seed.py`), `supabase/tests/smoke.sql` (test des triches).

## Avancement des étapes
- **Étape 1 (base)** : ✅ appliquée et vérifiée (43/43).
- **Étape 2 (v19) : ✅ code écrit et testé contre le vrai projet** (`src/pS_server.js`) : session anonyme, profil et groupes réels (création, rejoindre par code, erreurs en français, hors ligne), passage en ligne des profils existants, réinitialisation qui supprime aussi le compte en ligne, liste réelle des membres dans le menu. **Récupération par e-mail : code écrit, non testé de bout en bout** (il faut un vrai e-mail et le réglage des modèles ci-dessous).
- **Étapes 4 et 5 (v20) : code écrit, à valider.** Pour un profil en ligne, **le serveur décide de tout ce qui se compare** : jour et heure (horloge du serveur, fuseau Europe/Paris, insensible à la date du téléphone), essais (`start_try` au moment du « C'est parti »), score (`submit_score` en fin de partie, ou à l'abandon avec les points déjà gagnés ; remis à plus tard s'il n'y a pas de réseau), classement du jour et de la saison (`season_overview`), boussoles, série et victoires (`my_summary`), joker acheté sur le serveur. **Plus aucun joueur simulé pour ces profils** ; les profils locaux gardent l'ancien fonctionnement. Le chat et les réactions sont retirés en attendant l'étape 6.
  **Ordre d'application obligatoire : d'abord la base, ensuite le site.** Coller `supabase/migrations/20261113000000_season_overview.sql` dans le SQL Editor (Run) AVANT de publier la v20 : sans elle, les profils en ligne ne pourraient pas lancer le défi du jour. Test : `supabase/tests/e2e.ps1` (46 contrôles dont les nouvelles fonctions).
- Étapes 6 (chat), 7 (bots étiquetés, fin des jours de démonstration), 8 (test à deux téléphones) : à faire.

### Réglage requis pour l'e-mail (tableau de bord Supabase → Authentication → Email Templates)
L'application envoie un **code à 6 chiffres** (pas de lien : un lien ouvrirait le navigateur, pas l'application installée). Pour qu'il apparaisse dans l'e-mail, ajouter `{{ .Token }}` dans deux modèles :
1. **Magic Link** (connexion sur un autre téléphone). Objet : `Ton code Méridien`. Corps : `<h2>Ton code Méridien</h2><p>Voici ton code de connexion : <b>{{ .Token }}</b></p><p>Il est valable une heure. Si tu n'as rien demandé, ignore ce message.</p>`
2. **Change Email Address** (sauvegarde du compte depuis le menu). Objet : `Confirme ton adresse Méridien`. Corps : `<h2>Confirme ton adresse</h2><p>Ton code : <b>{{ .Token }}</b></p>`
Limite : l'envoi d'e-mails par défaut de Supabase est très restreint en volume ; un SMTP personnalisé sera nécessaire pour plus de quelques joueurs.

## 1. L'idée en une phrase
Le téléphone **joue** ; le serveur **décide** de ce qui se compare : quel jour on est, combien d'essais il reste, quel score est enregistré, combien de boussoles on gagne. Le téléphone n'écrit jamais lui-même dans ces tables : il demande à une fonction du serveur, qui vérifie.

## 2. Ce que contient la base
| Table | Rôle | Qui peut écrire |
|---|---|---|
| `profiles` | pseudo et familier | le joueur, pour son propre profil |
| `groups`, `group_members` | groupes (code à 6 caractères, 30 membres max, **un seul groupe par joueur**) | uniquement les fonctions du serveur |
| `attempts` | les essais : jour et jeu du serveur, score, manches, pastille « temps rallongé » | uniquement les fonctions du serveur |
| `gem_ledger`, `gem_spend` | registre des boussoles gagnées / dépensées | uniquement le serveur |
| `messages`, `reactions` | discussion du groupe | les membres du groupe |
| `blocks`, `reports` | bloquer un joueur, signaler un message (exigé par Apple et Google) | le joueur |
| `app_config`, `formats` | règles du jeu : 2 essais, ×1 / ×1,25 / ×1,5, 16 boussoles par place, ordre et barème des 28 jeux | personne (copie du code) |

## 3. Les fonctions que l'application appellera
| Fonction | Ce qu'elle fait |
|---|---|
| `create_group(nom)` / `join_group(code)` | crée un groupe / en rejoint un. Le code est **vérifié** ; 10 codes faux en une heure bloquent les tentatives |
| `leave_group()`, `remove_member(joueur)` | quitter ; le propriétaire peut retirer quelqu'un. Si le propriétaire part, le plus ancien membre reprend le groupe |
| `start_try()` | démarre un essai : **jour et jeu choisis par le serveur**, 2 par jour maximum |
| `submit_score(essai, manches, temps)` | enregistre le score : plafonds par jeu, durée minimale, un seul envoi par essai ; **le total est recalculé par le serveur** |
| `day_results(jour)` | classement du jour du groupe, avec boussoles et pastille « temps rallongé » |
| `season_standings()` | classement de la saison |
| `my_wallet()`, `spend_gems('joker')` | solde ; achat d'un joker au prix fixé (25) |
| `my_streak()` | série de jours jouée |
| `delete_my_account()` | efface le compte et toutes ses données (RGPD) |
| `settle_closed_days()` | règle les boussoles des jours clos ; lancée **chaque heure** par le serveur, sans risque de doublon |

## 4. Comment chaque triche de l'audit est bloquée
| Triche (audit) | Défense |
|---|---|
| Modifier son score | impossible : aucun droit d'écriture sur `attempts` ; le serveur recalcule le total et plafonne chaque manche |
| Boussoles infinies | impossible : registre écrit par le serveur seul ; solde = gains − dépenses |
| Changer la date du téléphone | sans effet : le jour vient du serveur ; essais et jeu aussi |
| Voir les questions de demain | la date du téléphone ne les débloque plus (voir limites ci-dessous) |
| Série fabriquée | calculée par le serveur à partir des essais réellement enregistrés |
| Envoyer un score instantané ou en double | refusé (moins de 20 s ; un seul envoi par essai) |
| Chercher des codes de groupe au hasard | 10 échecs par heure maximum |
| Effacer ses données pour avoir de nouveaux essais | **atténué** : un nouveau compte devient un nouveau membre à rejoindre avec le code ; le propriétaire peut le retirer. La récupération du compte (e-mail facultatif) évitera d'en arriver là |
| Temps rallongé invisible | l'essai porte la pastille, visible dans le classement |

## 5. Ce que cette version ne bloque pas (à savoir)
- **Les réponses restent dans l'application.** Quelqu'un qui lit le code source peut les trouver. Acceptable entre amis ; pour une ligue publique, il faudrait que le serveur envoie les questions sans les réponses (phase 2).
- **Un joueur peut jouer le bon score avec de l'aide** (un autre téléphone, un moteur de recherche). Aucune application ne peut l'empêcher.
- **Les scores restent calculés par l'application** : la base vérifie qu'ils sont *possibles*, pas qu'ils sont *vrais*. Un score valide mais trop parfait est marqué `fast` si l'essai dure moins de 45 s.

## 6. Choix retenus par défaut (à confirmer par Chems)
1. **Service** : Supabase, région Europe (Francfort).
2. **Jour de jeu** : fuseau **Europe/Paris**, bascule à minuit ; les scores arrivent jusqu'à 1 h après le début de l'essai ; les boussoles sont réglées 1 h après minuit.
3. **Temps rallongé** : gardé dans le classement, avec une pastille visible.
4. **Bots** : conservés seulement pour les petits groupes, **étiquetés « joueur simulé »** (étape 7).
5. **Boussoles** : aucune si le groupe compte moins de 2 joueurs (évite d'en fabriquer en jouant seul).
6. **Connexion** : anonyme (aucun e-mail) ; récupération par e-mail facultative, ajoutée à l'étape 2.
7. **Fin des « jours de démonstration »** : plus d'historique inventé.

## 6 bis. Décision prise (11 novembre 2026)
- **Récupération du compte par lien e-mail : OUI** (facultative, ajoutée à l'étape 2). Le compte anonyme est lié à une adresse e-mail ; sur un nouveau téléphone, un lien de connexion le retrouve. Point à régler : l'envoi d'e-mails par défaut de Supabase est très limité en volume ; prévoir un **SMTP personnalisé** (inclus dans l'offre gratuite) avant d'ouvrir à beaucoup de joueurs.

## 6 ter. Limites de l'offre gratuite (page officielle supabase.com/pricing, lue le 11 novembre 2026 : à reconfirmer avant tout engagement)
| Ressource | Limite gratuite | Remarque pour Méridien |
|---|---|---|
| Utilisateurs actifs par mois | **50 000** | pas de limite d'« amis » en soi |
| Base de données | **500 Mo** | quelques centaines de joueurs pendant des mois sans difficulté (estimation) |
| Transfert de données (egress) | **5 Go / mois** | l'application elle-même est servie par GitHub Pages et ne compte pas ; seules les données de jeu passent par Supabase |
| Chat en direct | **200 connexions simultanées**, 2 millions de messages / mois | limite à surveiller si le chat utilise le temps réel ; l'interrogation périodique n'a pas cette limite |
| Connexions anonymes, SMTP personnalisé | incluses | |
| **Sauvegardes automatiques** | **non incluses** | prévoir un export régulier des données |
| **Mise en pause** | après **1 semaine sans activité** | sans risque avec un jeu quotidien ; le projet se rallume manuellement |
| Projets actifs | 2 maximum | |
| Offre Pro | à partir de 25 $ / mois (100 000 utilisateurs actifs, 8 Go de base, 250 Go de transfert, sauvegardes quotidiennes) | passage naturel si le jeu grandit |

Limite **fixée par Méridien** (pas par Supabase) : 30 membres par groupe (`groups.max_members`, modifiable).

## 7. Ce que Chems doit faire
1. **Créer un compte Supabase** (supabase.com) et un **projet de test** en région « West EU (Frankfurt) ». Je ne crée jamais de compte à votre place.
2. **Activer le connecteur Supabase** dans cette conversation (la carte « Connect » affichée plus haut). Il demande votre autorisation ; je n'ai accès qu'à ce que vous autorisez. Le connecteur peut créer ou mettre en pause des projets et appliquer des migrations : n'autorisez que le projet de test.
3. Ne **jamais** coller dans le dépôt ni dans une conversation la clé « service_role » ou le mot de passe de la base. L'application n'utilise que l'URL du projet et la clé « anon » (publique par conception, protégée par la sécurité par ligne).

## 8. Étapes suivantes (un commit par étape, test à chaque fois)
1. Relire cette maquette, puis l'appliquer sur le projet de test et lancer `supabase/tests/smoke.sql`.
2. Connexion anonyme, création du profil, récupération par e-mail.
3. Groupes réels : création, code, liste des membres.
4. `start_try` et jour du serveur à la place de `today()`.
5. `submit_score`, classement du jour et de la saison, boussoles réglées.
6. Chat et réactions en direct, signaler et bloquer.
7. Bots étiquetés, suppression des jours de démonstration.
8. Test avec deux vrais téléphones, puis la quinzaine d'amis.
