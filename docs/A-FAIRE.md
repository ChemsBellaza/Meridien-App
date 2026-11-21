# À faire : tout ce qui reste (feuille de route vivante)

> Mis à jour le 19 novembre 2026 (après la v43). Cocher (✅) ou déplacer dans « Fait » à chaque lot. Remplace progressivement `ROADMAP.md` (ancien plan par lots).

## 1. À faire par Chems (je ne peux pas le faire à sa place)
- [ ] **Redéployer la fonction Edge** (Supabase > Edge Functions > `dynamic-handler` > Code > coller `supabase/functions/push/index.ts` > Deploy) : pour que la notification d'un GIF le dise et ouvre le message exact.
- [ ] **Tester la notification** sur un téléphone : Réglages > Notifications > Activer ; vérifier une ligne dans `push_subs` ; envoyer un message depuis un autre compte.
- [ ] **Confirmer l'envoi d'e-mails** : service SMTP Brevo configuré et test de « J'ai déjà un compte » jusqu'au code à 6 chiffres.
- [ ] **Tests sur de vrais téléphones** (un iPhone, un Android) avec 2 ou 3 amis : installation, clavier, notifications, rattrapage d'un nouvel arrivant.
- [ ] **Sauvegardes tous les 3 jours** (décision du 19 nov.) : archive du projet (`scripts\backup-projet.ps1`) + export des données (`supabase\export_all.sql`) + Push origin (voir `SAUVEGARDE.md`). Archive du projet : automatique (tâche Windows, tous les 3 jours à 20 h) ; reste à faire à la main : export des données et Push origin.
- [ ] **Page de confidentialité** publique (RGPD) avant d'inviter beaucoup de monde.
- [ ] **Nom définitif** de l'application et vérification INPI.
- [ ] Publication sur les stores (comptes développeur : Google Play 25 € une fois, Apple 99 €/an) : plus tard.
- [ ] Vérifier demain 14 h 30 la **bascule à 41 jeux** (premier jour avec les nouveaux jeux).

## 2. À faire par Claude (prochaines semaines)
- [x] **Audit UX du 19 nov.** : lots 1 et 2 faits (v47). Lot 3 (historique par semaine, barre d'onglets dans le groupe, squelettes de chargement) seulement si retours des joueurs.
- [ ] **« Qui suis-je » : un peu plus de temps** (note du 18 nov.) : voir `CHRONO` dans `src/pJ_game.js` et la durée du format `quisuisje`.
- [ ] Agrandir les petites réserves : Rébus, Qui suis-je, Connexions, Top 10, Sigles.
- [ ] Relecture factuelle des 432 nouvelles questions (un échantillon, ou avec Chems).
- [ ] Ajouter des étapes manquantes dans le test serveur : jeu de la veille et rattrapage avec un vrai nouvel arrivant (en simulant une arrivée dans le passé).
- [ ] Réparer les tests automatiques `tests/` (profil local injecté) quand Node portable sera disponible.
- [ ] Mettre à jour `ROADMAP.md` (ancien) ou le retirer, une fois ce fichier adopté.

## 3. Idées proposées, pas encore décidées
- Rappel à 20 h : « il te reste 3 h pour jouer ».
- Défi entre deux amis : « bats mon score » par lien.
- Message d'encouragement automatique quand quelqu'un bat son record.
- Statistiques personnelles : jeux préférés, meilleure catégorie, évolution.
- Mode difficile « sans joker » avec bonus.
- Bouton « télécharger mes données » (RGPD).
- Vote du thème de la saison suivante (avait été écarté pour manque d'infrastructure).
- Nouveaux jeux : Géographie du quotidien, Art et peinture, Cinéma et séries (déjà en partie dans Pop culture), Mots croisés express, Devine l'année.

## 4. Dette technique
- Rendu par zones plutôt que remplacement complet de `#app`.
- Modules ES + bundler ; état global → un seul `dispatch(action)`.
- Lexique en fichier compressé chargé à la demande.
- Nettoyer l'ancien `ROADMAP.md`, `AUDIT*.md` et `LOT3-MAQUETTE.md` (documents de travail anciens, à archiver).

## 5. Fait récemment (voir `HISTORIQUE.md` pour le reste)
✅ Notifications push · ✅ 41 jeux · ✅ jeu de la veille · ✅ fin de saison · ✅ 19 familiers avec histoire · ✅ GIF Giphy · ✅ révélation du jeu du jour · ✅ fin de partie plus claire · ✅ graphique épuré · ✅ page d'installation · ✅ rattrapage des 3 derniers jeux.

- [ ] **v56 (Chems)** : 1) coller supabase/migrations/20261128000000_push_plays.sql dans le SQL Editor ; 2) redéployer la fonction Edge dynamic-handler avec supabase/functions/push/index.ts ; 3) Push origin ; 4) tester à deux comptes : un essai, un record, un dépassement.

- [ ] **v60 (Chems)** : coller supabase/migrations/20261129000000_catchup_ranking.sql dans le SQL Editor AVANT le Push origin, puis vérifier un classement de rattrapages (places et boussoles différentes selon le score).

- [ ] **Agrandir les banques de questions** : Top 10 (fait en v64 : 14 par difficulté), Voisins, Connexions (6 listes par difficulté), Rebus (6 par case), Carte, Frise, Qui suis-je (4 par case), puis les 12 jeux de culture (8 par case, viser 24). Elles reviennent dès le 2e passage (~41 jours).
