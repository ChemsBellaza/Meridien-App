# Audit du multijoueur et plan du lot 3 (11 novembre 2026, sur la v18)

Méthode : lecture du code, puis **simulations dans le navigateur avec le vrai moteur** (horloge simulée, partie complète jouée automatiquement, tentatives de triche). Tout a été fait dans un bac à sable local ; aucune donnée réelle touchée.

## 1. État actuel : un multijoueur de façade
- **Aucun échange réseau** : pas de `fetch`, de WebSocket ni de serveur. Les « autres joueurs » sont 5 bots (Yasmine, Théo, Nadia, Karim, Léa) calculés à partir de la date.
- **Session** : un profil (pseudo, groupe, familier) dans `localStorage`. Pas de compte, pas d'identité, pas de récupération. Effacer les données du navigateur = nouvel inconnu.
- **Horloge** : celle de l'appareil (`today()`, `minutesNow()`).
- **Score** : calculé et stocké sur l'appareil ; rien ne le vérifie.

## 2. Simulation : ouvrir une session et rejoindre un groupe
| Étape | Résultat |
|---|---|
| Alice crée « Les Aventuriers » | code `MER-BTCS` généré **sur son téléphone** ; elle apparaît 5e sur 6 avec **896 boussoles sans avoir joué** (jours de « démonstration » inventés) |
| Bob rejoint avec `MER-BTCS` | il arrive dans « **Groupe MER-BTCS** » (le nom est perdu), **Alice n'y est pas**, il voit les mêmes 5 bots |
| Codes acceptés | `ZZZZ`, `1234`, `AAAA-999`… : **tout code de 4 à 8 caractères est valide** |
| Message de défi | « Rejoins X avec le code Y » mène à un **cul-de-sac** : les amis ne se retrouvent jamais |

## 3. Simulation : une partie complète
Jeu du jour « Distance » (n°24), joué en 22 étapes par le moteur réel : 1 120 points (371 + 375 + 374), classement N°1 sur 4, +64 boussoles. L'enchaînement (intro, difficulté, 3 questions, fin, sauvegarde) fonctionne sans erreur.

Évolution du même score selon l'heure (les bots « jouent » au fil de la journée) :
| Heure | Joueurs classés | Boussoles gagnées par Bob |
|---|---|---|
| 10 h | 2 | +32 |
| 12 h | 4 | +64 |
| 18 h | 6 | +96 |

→ **Les récompenses changent selon l'heure où on regarde** : à 10 h « N°1 sur 2 » n'a pas de sens.

**Force des bots** (28 jours simulés, % du maximum possible) : Yasmine 70 %, Nadia 60 %, Théo 53 %, Léa 51 %, Karim 44 %. Un humain à 70 % bat les 5 bots **14 jours sur 28** ; à 85 %, **27 jours sur 28**. Gagner est trop facile : la compétition n'a pas de tension.

## 4. Simulation : triche (matrice)
Facilité = effort pour un joueur ordinaire. Tout est possible parce que **le score, les essais, les boussoles et la date sont décidés par l'appareil**.

| # | Triche testée | Résultat | Facilité | Gravité |
|---|---|---|---|---|
| T1 | Modifier son score dans la sauvegarde | `99 999 pts`, N°1, partageable | outils de développement | Haute |
| T2 | Boussoles infinies (`spent`) | 960 → **100 960** | outils de développement | Haute |
| T3 | **Changer la date du téléphone** | essais remis à zéro ; jeux des jours suivants connus (Silhouettes, Relier, Sigles…) ; **questions de demain visibles** | **réglages du téléphone** | **Haute** |
| T4 | Jouer des jours passés | possible (essai créé à une date passée) ; l'effet dépend de l'historique inventé | réglages du téléphone | Moyenne |
| T5 | « Voyager dans le temps » | série 3 → **8 jours en quelques secondes**, couleurs chromatiques débloquées | réglages du téléphone | Haute |
| T6 | Temps rallongé ×2 en classement | chrono du quiz 15 s → 30 s, **invisible des autres** | menu | À décider (voir §6) |
| T7 | Réponses dans le fichier | `Stalingrad` lisible dans les 1,18 Mo téléchargés | « afficher le code source » | Moyenne |
| — | Effacer les données | nouvelle identité, essais neufs | 2 touchers | Moyenne |
| — | Fausser le texte partagé | impossible à empêcher (c'est du texte) | copier-coller | Faible |

**Les plus probables chez vos amis** : changer la date (T3, T5) et effacer les données. Les modifications de sauvegarde (T1, T2) demandent des outils de développement.

## 5. Expérience de jeu
Points forts : parcours fluide, partie de bout en bout sans accroc, bots plausibles qui donnent de la vie au fil de la journée.

Points à corriger (par priorité) :
1. **L'invitation ne mène nulle part** (code non vérifié, groupe jamais partagé). C'est la promesse centrale du produit.
2. **Historique inventé** (896 boussoles, rang 5 dès l'arrivée) : le joueur comprend vite que c'est faux.
3. **Résultats provisoires non signalés** : rang et boussoles bougent toute la journée.
4. **Bots trop faibles** : victoire quasi garantie.
5. **Pas de récupération de compte** : changer de téléphone = tout perdre.

## 6. Architecture recommandée pour le lot 3
**Principe : le serveur décide de tout ce qui se compare** (jour, nombre d'essais, score enregistré, boussoles, série). Le téléphone reste le moteur de jeu.

| Sujet | Recommandation |
|---|---|
| Service | **Supabase**, région **UE (Francfort)** : Postgres, connexion anonyme, règles de sécurité par ligne, fonctions côté serveur (RPC). Gratuit pour 15 amis. Alternative : Firebase (fonctions serveur payantes, données moins « européennes »). *Tarifs et limites à reconfirmer sur le site au moment du choix.* |
| Identité | connexion **anonyme** (aucune donnée personnelle) + **récupération** facultative par lien e-mail ou code secret |
| Groupes | code validé **côté serveur**, nom conservé, limite de membres, créateur = administrateur (peut retirer un membre) |
| Horloge | **jour décidé par le serveur** (fuseau à fixer, ex. Europe/Paris) : règle T3, T4, T5 |
| Essais | fonction `start_try` : au plus 2 par jour, uniquement pour le jour du serveur |
| Scores | fonction `submit_score` : plafonds par jeu (`max × multiplicateur`), durée minimale plausible, un seul envoi par essai ; marque `temps rallongé` |
| Boussoles, série | **calculées par le serveur** à la clôture du jour (minuit) ; « provisoire » affiché avant ; **suppression de l'historique de démo** |
| Bots | gardés **seulement comme remplisseurs** pour les petits groupes, **clairement étiquetés** « joueur simulé » (honnêteté exigée par les stores), niveau recalibré |
| Réponses | restent dans l'app (compromis assumé entre amis). Phase 2 si une ligue publique existe : questions servies par le serveur |
| Hors-ligne | l'essai démarre en ligne ; le score s'envoie dès le retour du réseau |
| Chat | passe sur le serveur ; **signaler / bloquer exigés par Apple** (contenu généré par les utilisateurs) |
| RGPD | pseudo uniquement, suppression du compte, politique de confidentialité, âge minimum |
| Migration | le profil local devient un profil serveur à la première connexion ; scores locaux non repris |

**Résultat attendu sur la matrice** : T1, T2, T3, T4, T5 neutralisées ; T6 visible ; T7 acceptée (mitigée en phase 2) ; effacement des données atténué par la récupération.

## 7. Étapes proposées (un commit par lot, test à chaque étape)
1. **Maquette de la base** (tables, règles de sécurité, fonctions) validée par Chems avant tout code.
2. **Création de session** : connexion anonyme, profil serveur, récupération.
3. **Groupes réels** : création, rejoindre par code, liste des membres (fin du cul-de-sac).
4. **Jour et essais serveur** : `start_try`, horloge du serveur.
5. **Scores et classement réels** : `submit_score`, classement du jour et de la saison, boussoles à la clôture.
6. **Chat et réactions réels**, signaler / bloquer.
7. **Bots étiquetés** pour les petits groupes, suppression de l'historique de démo.
8. **Test à deux téléphones** (Alice et Bob pour de vrai) puis avec la quinzaine d'amis.

## 8. Décisions à prendre par Chems
1. **Service** : Supabase (recommandé) ou Firebase.
2. **Jour de jeu** : quel fuseau (recommandé : Europe/Paris) et quelle heure de bascule.
3. **Temps rallongé** : le garder dans le classement avec une pastille visible (recommandé, il répond à un besoin d'accessibilité) ou le sortir du classement.
4. **Bots** : les garder (étiquetés) pour les petits groupes, ou les supprimer.
5. **Récupération de compte** : e-mail (lien magique) ou simple code secret à noter.
6. **Compte Supabase** : à créer par vous (aucune clé ne sera dans le dépôt).
