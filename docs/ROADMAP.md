# Feuille de route

## Fait
- v1–v10 : 28 formats, familiers, saisons, carnet, succès, petit bac étendu (Wiktionnaire), design épuré.
- **v11 (lot 1)** : sauvegarde fiable (alerte, migrations), accessibilité A1–A8 (langue, contrastes, dialogues, focus, annonces, chrono), registre de minuteries, dictionnaire préchauffé.
- **v12** : carte du monde embarquée (plus aucune requête réseau pour la carte).

## Lot 2 — PWA installable (prochain)
- Manifeste (`name`, icônes 192/512 + maskable, `theme_color`, `display: standalone`), service worker (cache hors-ligne du HTML), icône d'écran d'accueil.
- ~~Embarquer les polices~~ (fait, v13.1). Restent : manifeste ✅, service worker ✅ ; drapeaux SVG à faire.
- **Tutoriel de première partie** (manche d'essai sans score) ; introduction progressive des systèmes (jokers au jour 3, carnet au jour 5…).
- Écran de fin de partie plus lisible (points, rang, progression vers l'évolution).
- Mode clavier pour les cartes (Pays mystère, géographie) : saisie ou liste de pays (WCAG 2.1.1) ; icônes/mots en plus des couleurs chaud/froid (1.4.1).
- Option « temps rallongé » pour les chronos courts (WCAG 2.2.1).
- Texte violet sur fond sombre (~3,7:1) : ajouter un jeton `--purple-t` ≥ 4,5:1.
- Clavier mobile : garder champ + « Valider » visibles (`visualViewport`) ; bouton retour Android = fermer feuille / écran précédent.
- Politique de confidentialité (page publique).

## Lot 3 — Multijoueur réel
Nécessite un serveur (Firebase ou Supabase) : comptes, groupes, scores du jour, défi identique pour tous, **horloge serveur** (supprime la triche par changement de date), classement réel. Remplacer les bots. RGPD : suppression de compte, fiche de données stores.

## Lot 4 — Publication mobile
- Capacitor (Android + iOS) autour de `dist/`, stockage natif, notifications de rappel quotidien.
- Comptes développeur (Google Play 25 € une fois ; Apple 99 €/an) — à créer par le propriétaire.
- Nom définitif de l'application, icône 1024 px, captures, description, classification d'âge.
- Règle Apple 4.2 : justifier l'app native (notifications, stockage, hors-ligne).
- Tests sur vrais téléphones (un Android d'entrée de gamme, un iPhone).

## Dette technique
- Rendu par zones (ou petit DOM-diff) au lieu de remplacer tout `#app`.
- Passer à des modules ES + Vite ; lexique en fichier binaire compressé chargé à la demande.
- État global (`store`, `game`, `ui`) → `dispatch(action)` unique ; routeur d'actions unique.
- Vérifier : flèches du Pays mystère (centroïdes), drapeaux emoji sous Windows, polices réelles, comportement sur téléphones physiques (non testés).
- Wiktionnaire : quelques mots rares ou étranges, certains mots valides absents ; listes de célébrités/films/marques/chanteurs faites à la main (signaler les oublis).
