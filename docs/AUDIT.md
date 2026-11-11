# Audit (11 novembre 2026, sur la v10) — état après le lot 1 (v12)

Légende : ✅ traité · ⏳ à faire (voir ROADMAP)

## Technique
| Constat | État |
|---|---|
| Triche : l'horloge est celle de l'appareil (`today()`) | ⏳ horloge serveur (lot 3) |
| `save()` échouait en silence ; pas de migration de schéma | ✅ alerte + `MIGRATIONS` |
| `localStorage` purgeable sur iOS (web non installé) | ✅ `storage.persist()` demandé ; ⏳ stockage natif avec Capacitor |
| Carte chargée depuis un CDN à l'exécution | ✅ `d7_map.js` embarquée |
| Lexique (590 Ko) décodé d'un bloc au 1er petit bac | ✅ préchauffé en tâche de fond ; ⏳ Worker / fichier binaire |
| Fichiers morts (`app_v1.js`, `app_v5_backup.js`) | ✅ retirés |
| `render()` remplace tout `#app` (perte de focus, relecture lecteur d'écran) | ✅ focus conservé par `setAppHTML` ; ⏳ rendu par zones |
| État global mutable, routeurs de clics dispersés | ⏳ `dispatch(action)` |
| `setInterval` 1 s en arrière-plan ; timers non annulés | ✅ garde `document.hidden` ; registre `later()` |
| Pas de modules ES / bundler | ⏳ Vite |
| Photo de profil en base64 | non critique : déjà réduite à 240 px JPEG (~15 Ko) |

## Accessibilité (WCAG 2.1 AA)
| # | Problème | État |
|---|---|---|
| A1 | pas de `lang="fr"` / viewport | ✅ |
| A2–A4 | contrastes : gris secondaire 4,21, blanc/violet sombre 3,58, doré 3,57 | ✅ (violet de **texte** sur fond sombre ≈ 3,7 : ⏳ `--purple-t`) |
| A5 | textes de 11 px | ✅ 12 px |
| A6 | dialogues sans focus piégé / Échap / retour du focus | ✅ |
| A7 | focus perdu au re-rendu | ✅ |
| A8 | annonces (résultats, chrono) | ✅ `announce()`, `role="timer"`, 10 s et 5 s |
| A9 | cartes sans équivalent clavier | ✅ viseur aux flèches, Entrée = toucher, + − 0 pour zoomer (La Carte, Sprint Carte, Pays mystère ; ce dernier se joue aussi en tapant le nom) |
| A10 | information par la couleur seule | ✅ partiel : ✓/✗ sur les réponses du quiz, mots « Glacial → Brûlant » au Pays mystère ; ⏳ vérifier les autres jeux (relier, classement, vrai/faux…) |
| A11 | description textuelle de l'état du familier | ✅ `petDesc()` (espèce, type, stade, couleurs, caractère) sur l'accueil et la fiche ; humeur à la fin de partie |
| A12 | chronos courts sans alternative | ✅ réglage « Temps de réflexion » ×1, ×1,5, ×2 (menu) ; bonus de rapidité mesuré sur le temps accordé |
| A13 | violet de texte sur fond sombre (3,3:1) | ✅ jeton `--purple-t` (5,6:1 en sombre, 5,6:1 en clair) |

## UX
1. Pas d'aide à la première partie → tutoriel d'essai sans score. ⏳
2. Trop de systèmes d'un coup (boussoles, jokers, familiers, carnet, succès, saison) → introduction progressive. ⏳
3. Écran de fin : récompense peu lisible (points, rang, progression vers l'évolution). ⏳
4. Groupe simulé : le classement perd son sens dès que le joueur s'en aperçoit → multijoueur réel. ⏳
5. Pas de notifications de rappel quotidien. ⏳ (Capacitor)
6. Clavier mobile qui masque le champ et « Valider » (`visualViewport`). ⏳
7. Bouton retour Android : fermer feuille / revenir en arrière sans quitter l'appli. ⏳

## Publication mobile
PWA (test avec amis) puis Capacitor (stores). Prérequis : serveur de groupes + horloge de référence, politique de confidentialité, nom définitif, comptes développeur, justification Apple 4.2, mention CC BY-SA du Wiktionnaire. Détail dans `ROADMAP.md`.
