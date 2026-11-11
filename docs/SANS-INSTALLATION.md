# Travailler sans installer Node.js (poste sans droits administrateur)

Le projet n'a **besoin d'aucune installation** pour être construit et ouvert. Node.js ne sert qu'aux tests automatiques, et il existe une version qui s'installe sans droits administrateur.

## 1. Construire l'application (aucune installation)
Au choix, depuis le dossier du projet :
| Méthode | Commande |
|---|---|
| Double-clic | `build.cmd` |
| PowerShell (présent sur tout Windows) | `powershell -ExecutionPolicy Bypass -File scripts\build.ps1` |
| Python 3 (si déjà installé) | `python scripts\build.py` |

Résultat : `dist\meridien.html` (≈ 1,2 Mo). Les trois méthodes produisent exactement le même fichier. Les fichiers à assembler sont listés dans `scripts\order.json` (un nouveau fichier `src\*.js` doit y être ajouté, sinon le build refuse).

## 2. L'ouvrir et le vérifier à la main
- Double-clic sur `dist\meridien.html`, ou, avec Python : `python -m http.server 8000 --directory dist` puis `http://localhost:8000/meridien.html`.
- Mode téléphone : F12 → icône « appareil mobile ».
- **Liste de vérification rapide (3 minutes)** :
  1. F12 → onglet Console : aucune ligne rouge au chargement.
  2. Créer un profil, choisir un familier, ouvrir le menu (☰), fermer avec Échap : le focus revient sur ☰.
  3. Jouer le défi du jour en entier (3 manches) : aucune erreur, l'écran de fin s'affiche. (Il n'y a plus d'entraînement libre : un seul jeu par jour. Pour tester un autre jeu en développement : console du navigateur, `startGame(true, 'quiz')`.)
  4. Pays mystère et un jeu de carte : la carte s'affiche, même réseau coupé.
  5. Petit bac : un mot inventé donne 0 point.
  6. Mode sombre (réglage du système) : textes lisibles.

## 3. Tests automatiques : Node.js « portable » (sans admin)
1. Télécharger l'archive **Windows Binary (.zip)** sur https://nodejs.org/fr/download (et non l'installeur `.msi`).
2. La décompresser dans `C:\Users\<toi>\outils\node`.
3. Dans PowerShell, pour la session en cours seulement :
   ```powershell
   $env:Path = "$env:USERPROFILE\outils\node;" + $env:Path
   npm install
   $env:BROWSER_CHANNEL = "msedge"      # utilise Edge, déjà installé : pas de téléchargement de navigateur
   npm test
   ```
`npm install` ne télécharge que la bibliothèque Playwright ; le navigateur est celui de la machine (`msedge` ou `chrome`). Si un proxy d'entreprise bloque `npm`, rester sur la vérification manuelle (section 2) : elle couvre l'essentiel.

## 4. Claude Code sans Node.js
- **Application Claude (bureau)** : l'onglet « Code » ouvre le dossier du projet et fonctionne sans Node.js.
- **Installeur natif de Claude Code** : il s'installe dans le profil utilisateur, sans droits administrateur. Voir la page d'installation officielle : https://docs.claude.com/en/docs/claude-code/setup .
- Dans les deux cas, Claude Code reconstruit avec `scripts\build.ps1` ou `scripts\build.py` et peut vérifier l'application dans un navigateur.

## 5. Git sans installation
Si Git n'est pas installé : « GitHub Desktop » s'installe sans droits administrateur (installation par utilisateur) ; ou envoyer le dossier sur GitHub par glisser-déposer depuis le site web (sans historique).
