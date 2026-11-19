# Audit UX/UI (19 novembre 2026)

Objectif : rendre l'appli plus fluide et agréable **sans changer le format** (pas de gros changement qui perturbe les joueurs). Mesures faites sur un écran de 375 × 812 px.

## Ce qui marche (à ne pas toucher)
- Identité forte : couleurs, familiers, ton. Le format « un jeu par jour » est clair.
- Zones tactiles : aucune cible sous 44 px.
- Accueil « Mes groupes » en cartes, barre d'onglets en bas, bouton retour toujours présent.
- Fin de partie : bouton Classement en haut, détails repliés.

## Problèmes constatés
| # | Écran | Constat | Gravité |
|---|---|---|---|
| 1 | Groupe | Le bouton **Jouer** est à 1 044 px : il faut scroller plus d'un tiers d'écran pour atteindre l'action principale. Avant lui : en-tête, 3 pastilles, série, « Quoi de neuf ? », bandeaux. | Haute |
| 2 | Groupe | Les bandeaux s'empilent (saison, nouveautés, tutoriel, installation, notifications, récap) : jusqu'à 5 cartes avant le jeu. | Haute |
| 3 | Groupe | La série est affichée deux fois (pastille 🔥 et bande des 7 jours). | Moyenne |
| 4 | E-mail | « Relier mon e-mail » est enterré : Réglages, puis Compte, après un long scroll (la fenêtre fait 1 334 px). Pourtant c'est le réglage le plus important. | Haute |
| 5 | Familier | La fiche fait 2 547 px (3 écrans) : aperçu, onglets, grille, évolutions, histoire. On perd l'aperçu du familier en scrollant. | Moyenne |
| 6 | Réglages | 5 sections et des raccourcis dans une seule fenêtre : l'important (compte, notifications) est noyé avec les réglages rares. Aucun état affiché (« e-mail relié », « notifications actives »). | Moyenne |
| 7 | Navigation | Dans un groupe, plus de barre d'onglets : pour aller au profil, il faut revenir à l'accueil. Trois façons de bouger (retour, puces, icônes du haut). | Moyenne |
| 8 | Icônes | L'horloge (historique) et le menu sont sans texte : l'horloge n'est pas évidente. | Basse |
| 9 | Vocabulaire | « Défi » (en-tête), « jeu » (bouton), « manche », « essai » : plusieurs mots pour la même chose. | Basse |
| 10 | Classement | Avec 12 joueurs, la liste est longue et ta ligne peut sortir de l'écran. | Moyenne |
| 11 | Historique | 2 369 px de liste continue, sans regroupement. | Basse |

## Propositions (du plus rentable au moins urgent, tout reste dans le format actuel)
**A. Sans risque, à faire en premier**
1. **Jouer plus haut** : mettre la carte du jeu juste sous l'en-tête et pousser série et bandeaux en dessous. Ou, sans rien déplacer, une barre « Jouer » collée en bas quand la carte n'est plus visible.
2. **Un seul bandeau à la fois** : ordre de priorité (fin de saison, tutoriel, installation / notifications, nouveautés). Le reste attend.
3. **Dédoubler la série** : garder la bande des 7 jours, retirer la pastille 🔥.
4. **E-mail en un toucher** : « Relie ton e-mail » ouvre directement la fenêtre de liaison (pas tout Réglages). Ajouter l'état dans Réglages : « E-mail relié : c***@gmail.com ».
5. **Réglages avec états** : Compte et Notifications en premier, avec leur état en clair (« activé », « à faire ») ; vibrations, pseudo, rappel calendrier repliés sous « Plus ».

**B. Confort**
6. **Fiche familier plus courte** : aperçu qui reste en haut, évolutions et histoire repliables (ouvertes sur le stade courant).
7. **Classement** : top 5 + ta ligne toujours visible, « Voir tout » pour le reste.
8. **Mots uniques** : « Jeu du jour n°32 » partout (plus de « défi »). Le mot « manche » reste.
9. **Historique** : regrouper par semaine.
10. **Icône horloge** : ajouter le mot « Historique » dessous (ou en infobulle).

**C. À voir plus tard (plus visible)**
11. Barre d'onglets aussi dans le groupe (en la masquant quand le clavier du chat est ouvert).
12. Squelettes de chargement sur l'accueil (au lieu de « Chargement… »).

## Ordre conseillé
Lot 1 (1 jour) : 1, 2, 3, 4, 5. Lot 2 : 6, 7, 8, 10. Lot 3 : 9, 11, 12 si les retours le demandent.
