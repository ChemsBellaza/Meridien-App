# Méridien — contexte pour Claude Code

Méridien est un jeu communautaire quotidien de culture générale (inspiré de Playus) : **un jeu par jour** en rotation parmi 28 formats, 3 manches avec choix de difficulté (×1 / ×1,25 / ×1,5), 2 essais par jour, pseudo + code de groupe, classement de saison, carnet de voyage, jokers (boussoles), succès et familiers collectionnables à évoluer.
Le propriétaire (Chems) parle **français** : toute l'interface, les messages, les commits et les échanges sont en français. Fuseau Europe/Madrid.

## Commandes
- **Construire** (aucune installation requise) : `build.cmd` (double-clic) ou `powershell -ExecutionPolicy Bypass -File scripts\build.ps1` ou `python scripts/build.py` ; avec Node : `npm run build`. Les quatre donnent le même `dist/meridien.html` (~1,2 Mo, un seul fichier HTML autonome).
- Fichiers assemblés : liste ordonnée dans `scripts/order.json` ; tout nouveau `src/*.js` doit y être ajouté (sinon le build échoue volontairement).
- **Tests automatiques** (nécessitent Node.js) : `npm test` (fumée + a11y + cartes, ~1 min), `npm run test:full` (+ évolution + 28 formats, ~8 min). `npm install` une fois ; `BROWSER_CHANNEL=msedge` ou `CHROME_PATH` pour utiliser un navigateur déjà installé.
- **Poste sans Node.js** (cas du propriétaire : pas de droits administrateur) : construire avec `build.ps1`/`build.py`, puis vérifier avec le navigateur intégré ou à la main (liste dans `docs/SANS-INSTALLATION.md`) : console sans erreur, parcours onboarding → partie d'entraînement → menu/Échap, clair et sombre. Ne jamais demander d'installer Node avec des droits administrateur ; proposer Node portable (zip) si des tests automatiques sont utiles.
- Pas de bundler, pas de framework : JavaScript « classique » en un seul scope global.

## Règles à respecter
- **Un seul fichier de sortie, aucune dépendance réseau à l'exécution** (polices embarquées dans `public/fonts/`, vérifié : zéro requête externe). Pas de CDN, pas de `fetch`.
- Texte de l'interface en français correct (accents, espaces insécables avant `: ; ? !` via `fr()` quand le texte vient de données).
- **Accessibilité WCAG 2.1 AA** : vrais `<button>`, `aria-label` sur les boutons-icônes, focus visible, contrastes ≥ 4,5:1, textes ≥ 12 px, annonces via `announce()`, fenêtres via le gestionnaire de `pA_core.js` (focus piégé, Échap). Un test (`tests/a11y.test.js`) le vérifie : ne pas le casser.
- Rendu : `render()` / `renderGame()` remplacent le DOM via `setAppHTML()` (qui conserve le focus). Ne jamais écrire `$app.innerHTML =` directement.
- Minuteries : `later(fn, ms)` (annulées à chaque changement d'écran) ; chrono de manche via `startTimer`.
- Sauvegarde : `save()` (localStorage `meridien.v1`, schéma `SCHEMA` + `MIGRATIONS` dans `pA_core.js`). **Tout changement de structure du `store` exige une migration** pour ne jamais effacer le profil d'un joueur.
- Petit bac : un mot inventé vaut 0 point (jamais de néologisme accepté) ; un mot d'une autre catégorie est refusé avec la raison ; flou uniquement sur les entrées « curated » (`x` absent).
- Les familiers sont des **créations originales** inspirées du style Pokémon, sans reprendre de vraie créature ni de nom protégé (pas de « Pokédex » dans l'UI publique).
- Données de contenu (questions, dictionnaires) : ne jamais copier du texte de sources soumises à droits (Larousse refusé : réservation TDM). Sources autorisées : Wiktionnaire (CC BY-SA, crédit dans le menu), contenu rédigé à la main.

## Architecture (voir docs/ARCHITECTURE.md)
Tout est dans `src/` : `p*` = programme, `d*` = données. Moteurs de jeux = objet `ENG` (`build/start/view/act/type/onTap/after/joker`) ; formats déclarés dans `FORMATS` (`p1_config.js`).

## Avant de dire « c'est fini »
1. le build sans erreur ; 2. `npm test` vert **ou**, sans Node, la vérification manuelle (console sans erreur JavaScript, clair et sombre) ; 3. si l'interface a changé, regarder une capture (`tests/out/`) ; 4. commit en français, un lot = un commit.

## Piège : fichier autonome
`src/head.html` doit rester un document complet (doctype, `lang`, charset, viewport) : l'artefact claude.ai les ajoutait avant, mais pas un serveur, une PWA ni un store. Aperçu local : `.claude/launch.json` (serveur Python sur `dist/`, port 8000). Pour republier l'artefact, vérifier d'abord que le wrapper accepte un document complet.

## PWA
Fichiers statiques dans `public/` (manifeste, `sw.js`, `icons/`), copiés dans `dist/` par les builds ; `dist/` entier est à publier (GitHub Pages), pas seulement le HTML. Le service worker (seule exception à « pas de fetch », uniquement pour les fichiers de l'appli) est « réseau d'abord » ; changer `CACHE` dans `sw.js` pour vider les caches. Les icônes se régénèrent avec `python scripts/make-icons.py` (Pillow).

## Lot 3 : multijoueur (Supabase) — état et règles
- Maquette et état dans `docs/LOT3-MAQUETTE.md`, base dans `supabase/` (migration, seed généré par `scripts/gen-supabase-seed.py`, `apply_all.sql` = tout en un à coller dans le SQL Editor, tests `smoke.sql` et `e2e.ps1`). **Appliquée et vérifiée (43/43) sur le projet de test `objfbehephvvaogmblhj`** ; l'application n'est pas encore branchée dessus (étape 2). Le connecteur Supabase de la session ne voit pas ce projet (autre organisation) : l'accès passe par l'API publique et le SQL Editor de Chems.
- **Étape 2 faite (v19)** : `src/pS_server.js` (placé après `pM_mobile.js`) gère session, profil, groupes et récupération. Règle : le profil local garde `store.profile.srv = { uid }` quand il est lié au compte en ligne ; la session est dans `localStorage` (`meridien.auth`), à part. Tout appel serveur passe par `srvRpc` / `srvGet` / `srvFetch` (messages d'erreur : `SRV_MSG`).
- **Étapes 4-5 (v20)** : `srvOn()` (profil lié à un compte) fait basculer `players`, `dayResults`, `progress`, `wallet`, `feed` (pA_core.js) sur les données du serveur (`onlineX()` dans pS_server.js) ; `today()` / `minutesNow()` utilisent l'horloge du serveur. Règles : en ligne, ne jamais lire `store.plays` pour les essais (utiliser `playsOf(k)`), ne jamais écrire un score en local (`persistScore` l'ignore), démarrer le défi par `playToday()` (jamais `startGame(false)` direct), terminer par `srvSubmit(g)`. Toute migration de base doit être appliquée AVANT de publier le code qui en dépend.
- Le client utilise l'URL du projet et la clé **publishable** (publique par conception ; elle peut figurer dans le code). Les appels réseau se limitent à ce projet : la règle « pas de `fetch` » vaut pour tout le reste.
- Règle d'or : le serveur décide (jour, essais, score, boussoles) ; le téléphone n'écrit jamais dans `attempts`, `groups`, `group_members`, `gem_*` : il appelle les fonctions (`start_try`, `submit_score`…). Toute nouvelle règle de jeu qui se compare passe côté serveur.
- **Secrets** : jamais de clé `service_role`, de mot de passe de base ni de jeton dans le dépôt (public) ni dans une conversation. Le client n'a besoin que de l'URL du projet et de la clé `anon`. Je ne crée pas de compte à la place de Chems.
- Les règles du jeu (`CONFIG`, `FORMATS`) restent la source de vérité dans le code ; après toute modification, relancer `python scripts/gen-supabase-seed.py` et réappliquer le seed.

## Smartphone d'abord (le jeu se joue au doigt)
- Toute zone tapable fait **au moins 44 × 44 px** (hauteur minimale ou zone invisible `::after` élargie). Champs de saisie ≥ 16 px (sinon iOS zoome).
- Écran de jeu : `.game` est `position: fixed` et s'arrête à `bottom: var(--kb)` (hauteur du clavier, `pM_mobile.js`) ; un bouton d'action sous des champs de saisie reçoit `.stickybtn`.
- Bouton retour : `syncBack()` est appelé à la fin de `render()` et `renderGame()`. Tout nouvel « écran » ou fenêtre doit faire partie de `backDepth()` et être refermable par le bouton retour dans le gestionnaire `popstate`.
- Retour tactile : `buzz(ms)` (Android seulement, réglable). Pas de survol (`:hover`) comme seule indication.
- `pM_mobile.js` est placé juste après `pA_core.js` dans `order.json` (même raison que `pT_tuto.js`).

## Accessibilité : acquis à ne pas casser
- Texte violet : `var(--purple-t)` (≥ 4,5:1 clair et sombre), jamais `var(--purple)` pour du texte.
- Une carte avec toucher (`E().onTap`) est focusable (`#mapwrap`) et pilotable au clavier via `bindMapKeys` : tout nouveau jeu à carte doit passer par `bindMap(svg)`.
- Les chronos passent par `startTimer` (qui applique `timeFactor()`, réglage `store.prefs.time`) ; tout bonus de rapidité se calcule sur `g.T.ms + g.T.bonus`, jamais sur `FORMATS[..].secs`.
- Un état ne se signale jamais par la couleur seule : ajouter symbole ou mot (✓/✗, « Brûlant »…).
- Le familier se décrit avec `petDesc(pet)` dans les `aria-label`.

## Tutoriel et déblocage progressif
`src/pT_tuto.js` (placé juste après `pA_core.js` dans `order.json` : `render()` l'appelle dès le chargement). `profile.tuto = { done, seen, legacy? }` ; `featureOn("joker"|"carnet"|"trophees")` selon les jours depuis `profile.created` (`TUTO_UNLOCK`). Toute nouvelle fonctionnalité à introduire progressivement : l'ajouter à `TUTO_UNLOCK` et `TUTO_NEWS`. La partie guidée a `game.tuto = true` (1 manche, `practice` vrai) : ne jamais l'enregistrer dans stats/carnet. Dans les textes d'interface, écrire les espaces insécables en ` ` (jamais copiés-collés : ils se transforment en espaces normaux).

## Drapeaux
Les données gardent des emojis (`flagOf`) ; `src/pF_flags.js` les remplace à l'écran par `public/flags/*.svg` (Twemoji, CC BY 4.0 : mention obligatoire, déjà dans le menu et `CREDITS.md`). Ne pas écrire `<img>` à la main dans les moteurs. Le texte partagé (messageries) garde l'emoji.

## Logo
Source : `public/logo.svg` (globe + ombre + étincelle ; couleurs `#6B5BE2`, `#4C3EBE`, `#FFF6EC`, `#2A2333`, `#FFC24A`). Le même tracé est dans `logoMark()` (`p5_ui.js`) et dans `scripts/make-icons.py` : modifier les trois ensemble. Pas de texte dans le logo (nom provisoire) ; le mot « Méridien » s'écrit en Unbounded à côté.

## Publication
- **Version en ligne (PWA)** : https://chemsbellaza.github.io/Meridien-App/ — dépôt public https://github.com/ChemsBellaza/Meridien-App ; chaque envoi sur `main` déclenche `.github/workflows/pages.yml` (build Python + déploiement, ~25 s). Je committe en local ; **c'est Chems qui envoie (Push) depuis GitHub Desktop**. Git est celui de GitHub Desktop (`%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`, pas dans le PATH).
- Version de test en ligne : artefact claude.ai https://claude.ai/artifact/N8GkW6nxPUin8HEqqo37wL (republier `dist/meridien.html` au même lien ; dernière version publiée : v12).
- Publication mobile : voir `docs/ROADMAP.md` (PWA puis Capacitor).

## État et décisions
- Dernière version : **v12** (lot 1 terminé : accessibilité, sauvegarde fiable, carte embarquée).
- Décisions du propriétaire : pas de « duel entre amis » ; **multijoueur réel reporté** (les groupes sont aujourd'hui simulés par des « bots ») ; nom de l'application **non décidé** (« Méridien » est provisoire).
- Limites connues : voir `docs/ROADMAP.md`.
