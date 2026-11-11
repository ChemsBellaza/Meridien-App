# Méridien

Un défi de culture générale par jour, à jouer entre amis : 28 jeux en rotation (quiz, cartes, petit bac, Pays mystère, Le compte est bon, anagrammes…), 3 manches à difficulté choisie, classement de saison, carnet de voyage et familiers collectionnables qui évoluent.

Application web **monofichier** (HTML + CSS + JavaScript, sans dépendance ni réseau à l'exécution).

## Démarrer (aucune installation)
Double-clic sur **`build.cmd`** (ou `python scripts/build.py`, ou `npm run build`) → `dist/meridien.html`. Ouvrir ce fichier dans un navigateur, idéalement en mode mobile (F12 → icône téléphone). Détails, vérification manuelle et tests sans droits administrateur : `docs/SANS-INSTALLATION.md`.

## Tests automatiques (Node.js requis, version portable possible)
```bash
npm install
```
| Commande | Contenu | Durée |
|---|---|---|
| `npm test` | build + fumée (clair/sombre) + accessibilité + cartes | ~1 min |
| `npm run test:full` | idem + évolution des familiers + les 28 formats | ~8 min |
| `npm run gallery` | galerie des créatures (captures dans `tests/out/`) | ~10 s |

Les captures d'écran sont écrites dans `tests/out/` (ignoré par git). Variable `CHROME_PATH` pour utiliser un Chrome déjà installé.

## Documentation
- `CLAUDE.md` — contexte et règles du projet (lu automatiquement par Claude Code)
- `docs/SANS-INSTALLATION.md` — travailler sans droits administrateur
- `docs/ARCHITECTURE.md` — fichiers, moteurs de jeux, stockage
- `docs/ROADMAP.md` — lots à venir (PWA, multijoueur, publication mobile)
- `docs/AUDIT.md` — audit technique, accessibilité et UX
- `docs/CHANGELOG.md` — historique des versions
- `CREDITS.md` — licences (Wiktionnaire CC BY-SA, carte MIT)
