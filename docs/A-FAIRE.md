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

- [ ] **Agrandir les banques de questions** : Top 10 (fait en v64 : 14 par difficulté), Voisins (fait en v70 : 14 par difficulté), Connexions (fait en v65 : 14 grilles par difficulté), Rebus (fait en v66 : 12 par case), Carte (fait en v67 : 8 par case), Frise (fait en v68 : 8 par case), Qui suis-je (fait en v69 : 8 par case), puis les jeux de culture (histoirefr, histoiremonde faits en v71, mythes et sports en v72, gastronomie et nature en v73, monuments et corps en v74, langues, expressions et inventions en v75, chanson et popculture en v76 : 16 par case ; TERMINÉ : 8 par case, viser 16). Elles reviennent dès le 2e passage (~41 jours).
- [ ] **v78 : appliquer `supabase/migrations/20261130000000_pet_book.sql`** dans le SQL Editor AVANT le Push, puis ouvrir l'appli sur l'iPhone (réparer l'expérience de Caillourson si besoin), puis sur le PC.
- [ ] **v82 : appliquer `supabase/migrations/20261202000000_gems_merit.sql`** (boussoles au mérite ; recalcule les jours réglés de la saison en cours) AVANT le Push, après `20261130000000_pet_book.sql`. Ensuite : récap de saison (aperçu visuel d'abord, avec les familiers).
- [ ] **v84 : appliquer `supabase/migrations/20261203000000_mult_by_day.sql` avant le 30 novembre** (multiplicateurs ×1 / ×1,5 / ×2 à partir de la saison 3, par jour de jeu). Après la saison 3, relancer le bloc 7 de `stats.sql` et comparer les taux de réussite par difficulté pour réajuster si besoin.
- [ ] **v85 : appliquer `supabase/migrations/20261204000000_group_seasons.sql`** (saison par groupe, victoires au jour clos) AVANT le Push. Les groupes existants gardent leur calendrier actuel ; pour réaligner l'un d'eux sur sa date de création, voir l'en-tête de la migration (au début d'une saison seulement).
- [ ] **v86 : coller `supabase/a_appliquer.sql` dans le SQL Editor** (remplace l'application séparée de 20261202, 20261203, 20261204 et 20261205), puis Push. Prévenir le groupe : la saison en cours est recalculée.
