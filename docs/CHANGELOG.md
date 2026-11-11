# Journal des versions

- **v13.2** — Logo : globe crème à contours épais, ombre « lèvre » et étincelle dorée (`public/logo.svg`, fonction `logoMark()` dans `p5_ui.js`, icônes régénérées par `scripts/make-icons.py`, favicon). Affiché sur le premier écran. Motif neutre (indépendant du nom définitif, qui reste à choisir).

- **v13.1** — Polices Nunito (latin + latin-ext) et Unbounded (latin) embarquées dans `public/fonts/` (polices variables, 3 fichiers, ~220 Ko) ; Google Fonts supprimé ; précache hors ligne (`sw.js`, cache v2). Vérifié : polices chargées, zéro requête externe.

- **v13 (lot 2b, partie 1)** — PWA installable : `public/` (manifeste, service worker « réseau d'abord », icônes 192/512/maskable/Apple générées par `scripts/make-icons.py`) copié dans `dist/` par les trois builds, qui écrivent aussi `dist/index.html` (GitHub Pages). Vérifié : service worker actif, cache de 6 fichiers, page ouverte serveur coupé. Restent : polices embarquées, drapeaux SVG.

- **v12.1** — Page autonome valide : `head.html` déclare désormais doctype, `lang="fr"`, `<meta charset="utf-8">` et viewport (jusque-là fournis par l'artefact claude.ai ; sans eux, l'écran restait vide hors artefact quand le serveur n'indiquait pas l'encodage).

- **v12** — Carte du monde embarquée (plus de CDN) ; correction de l'ordre d'initialisation de la carte.
- **v11 (lot 1)** — Sauvegarde avec alerte et migrations de schéma ; accessibilité : `lang="fr"`, contrastes AA, textes ≥ 12 px, fenêtres modales (focus piégé, Échap, retour du focus), focus conservé au re-rendu, annonces lecteur d'écran, chrono `role="timer"` ; registre de minuteries ; compte à rebours suspendu en arrière-plan ; dictionnaire du petit bac décodé en tâche de fond.
- **v10** — Crédit Wiktionnaire dans le menu.
- **v9** — Refonte des familiers (10 créatures originales de style Pokémon, 3 évolutions, variantes chromatiques, fiche détaillée) ; petit bac : lexique Wiktionnaire (~77 000 mots), mots inventés à 0 point, mot d'une autre catégorie refusé avec la raison, affichage compact des catégories.
- **v8** — Design épuré façon Playus ; 7 nouveaux jeux : Pays mystère, Qui est né avant ?, Chaîne de mots, Anagrammes, Le compte est bon, Sigles, Distance.
- **v1–v7** — Prototype : formats, manches et difficultés, groupe simulé, saisons, boussoles et jokers, carnet de voyage, succès, première génération de familiers.
