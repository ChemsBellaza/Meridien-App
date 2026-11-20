# Audit UX/UI n°2 (20 novembre 2026)

Inspiration : captures d'une autre appli de jeu du jour (classement du jour, jeux précédents, stats de saison). On reprend les principes (clarté, peu de texte, une idée par écran), pas le look. Le format ne change pas.

## Constats
| # | Écran | Constat |
|---|---|---|
| 1 | Graphique de saison | Les courbes se mêlent, l'axe du bas n'a que 2 dates, pas de lien avec le détail. En mobile, avatars en bout de ligne seulement. |
| 2 | Scores par jeu | Chaque ligne cumule rang, points, avatar, nom, essais, boussoles : 5 infos par ligne. Le podium n'est pas distingué de la suite. |
| 3 | Jeux précédents | Longue liste de grandes cartes (1 jeu = 1 écran). On ne voit ni son rang ni la semaine d'un coup d'œil. |
| 4 | Saison | Les lignes des joueurs sont lourdes (carte colorée par joueur). |
| 5 | Navigation | Pas de barre d'onglets dans un groupe. |
| 6 | Chargement | Écrans blancs courts au chargement en ligne. |

## Propositions
1. **Graphique de saison épuré** : toi + top 3 en couleur, les autres en gris fin ; dates sur l'axe tous les 7 jours ; toucher un point = jour et score ; fond clair, grille discrète.
2. **Scores par jeu épurés** : podium visuel (3 avatars, couronne sur le 1er, points dessous) ; ensuite une ligne simple par joueur : rang, avatar, nom, points. Essais et boussoles passent dans le détail au toucher.
3. **Jeux précédents** : bandeau horizontal des jours de la semaine (jour, date, ton rang `#2`), le jeu choisi en grand dessous avec rang, score et top 3 ; lien « Voir le classement ».
4. **Saison** : lignes sobres (rang, avatar, nom, boussoles), pastille ↑ ↓, ta ligne mise en avant.
5. **Barre d'onglets dans le groupe** (déjà prévu, lot 3).
6. **Squelettes de chargement** (déjà prévu, lot 3).

## Ordre conseillé
A. Scores par jeu (2) puis Jeux précédents (3) : même écran de détail.
B. Graphique et lignes de saison (1, 4).
C. Lot 3 (5, 6) seulement si retours.
