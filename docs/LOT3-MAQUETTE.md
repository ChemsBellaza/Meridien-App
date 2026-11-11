# Lot 3 : maquette du multijoueur réel (Supabase)

**Statut : maquette écrite, pas encore appliquée.** Le SQL n'a pas été exécuté (aucun accès Supabase à ce jour). Il sera relu, appliqué sur un **projet de test**, et vérifié par `supabase/tests/smoke.sql` avant toute intégration dans l'application.

Fichiers : `supabase/migrations/20261112000000_lot3_init.sql` (base), `supabase/seed.sql` (généré depuis le code par `scripts/gen-supabase-seed.py`), `supabase/tests/smoke.sql` (test des triches).

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
