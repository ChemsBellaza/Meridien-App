# Architecture

Application web **monofichier** : `scripts/build.js` (ou `build.py` / `build.ps1` / `build.cmd`, équivalents sans Node ; liste ordonnée dans `scripts/order.json`) concatène `src/*.js` (un seul scope global, pas de modules) derrière `src/head.html` (CSS + `<title>`), dans `dist/meridien.html`.

## Fichiers (ordre d'exécution)
| Fichier | Rôle |
|---|---|
| `d0_data.js` | `DATA` : banque de questions des formats quiz/carte/frise |
| `p1_config.js` | `CONFIG` (essais, multiplicateurs, saisons, ordre des 28 formats), `FORMATS`, `THEMES` |
| `d1_countries.js` | pays (noms, alias, capitale, continent) |
| `d2_content.js`, `d3_bank.js`, `d5_new.js` | banques de contenu (listes, faits, `BORN`, `SIGLES`, `CITIES`…) |
| `d4_dict.js` | dictionnaires du petit bac (`PB_RAW` rédigés à la main, catégories, pools par difficulté) |
| `d6_lex.js` | lexique Wiktionnaire compressé par préfixes (`PB_LEX`) |
| `d7_map.js` | `WORLD_TOPO` : carte du monde TopoJSON (datamaps 0.5.9, MIT) |
| `p2_pets_data.js` | familiers : `SPECIES`, `EVO`, `TYPES`, `ITEMS`, `EVO_NEED`, `defaultPet`, `stageOf` |
| `pA_core.js` | utilitaires, calendrier (`fmtOf`, `seasonOf`, `manchesOf`), **stockage** (`store`, `save`, migrations), **accessibilité** (`announce`, `later`, `setAppHTML`, dialogues), carte (`MAP`, `topoToPaths`) |
| `p3_art.js`, `p4_draw.js` | illustrations des jeux ; dessin SVG des familiers (`DRAW`, `creatureSVG`, `petSVG`) |
| `p5_ui.js` | `render()` et les vues (accueil, menu, familier, saison, carnet…) ; clics `data-act` |
| `pC_events.js`, `pR_retention.js` | événements globaux, compte à rebours ; bots, messages, succès |
| `pJ_game.js`, `pG_gameviews.js` | cycle de partie (`startGame`, `finishTry`, chrono, `award`) ; vues de partie (`renderGame`) |
| `pE_engines.js`, `pN_engines.js` | moteurs de jeux `ENG.*` |
| `pB_logic.js` | actions de partie (`data-g`), joker, réchauffage du dictionnaire |

## Cycle d'une partie
`FORMATS[f].eng` désigne un moteur `ENG[eng]`. Le moteur fournit `build(g)` (questions), `view(g)` (HTML), `act`/`type`/`onTap` (entrées), `joker`. Il appelle `award(points, {ans, fact, learn…})` pour passer à la phase « reveal ». `finishTry()` enregistre le score, les déblocages et les évolutions.

## Données du joueur
`store` (localStorage `meridien.v1`) : `profile` (name, group, code, pet, photo), `plays` (par jour), `chat`, `carnet`, `spent`, `stats`, `react`, `ach`. Schéma versionné (`SCHEMA`), migrations dans `MIGRATIONS`.

## Familiers
10 espèces, 3 stades (évolution à 8 et 30 parties terminées), variante chromatique après 5 jours de série, fonds. `DRAW[espèce](P, R, stade)` renvoie des calques SVG assemblés par `creatureSVG`.

## Temps et jeu quotidien
Le jeu du jour = `fmtOf(date)`, déterministe à partir de `CONFIG.formatAnchor`. **L'horloge est celle de l'appareil** (triche possible : à remplacer par une horloge serveur avec le multijoueur).
