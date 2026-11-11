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
- **Un seul fichier de sortie, aucune dépendance réseau à l'exécution** (hors polices Google Fonts, à embarquer plus tard). Pas de CDN, pas de `fetch`.
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

## Publication
- Version de test en ligne : artefact claude.ai https://claude.ai/artifact/N8GkW6nxPUin8HEqqo37wL (republier `dist/meridien.html` au même lien ; dernière version publiée : v12).
- Publication mobile : voir `docs/ROADMAP.md` (PWA puis Capacitor).

## État et décisions
- Dernière version : **v12** (lot 1 terminé : accessibilité, sauvegarde fiable, carte embarquée).
- Décisions du propriétaire : pas de « duel entre amis » ; **multijoueur réel reporté** (les groupes sont aujourd'hui simulés par des « bots ») ; nom de l'application **non décidé** (« Méridien » est provisoire).
- Limites connues : voir `docs/ROADMAP.md`.
