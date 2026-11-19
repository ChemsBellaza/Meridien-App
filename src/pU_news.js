/* ============ « QUOI DE NEUF ? » (v44) ============
   Une carte sur l'accueil et dans le groupe raconte les nouveautés et les bonnes pratiques. Un point « Nouveau » s'affiche tant que la dernière
   entrée n'a pas été ouverte (profile.newsSeen). À CHAQUE LOT VISIBLE PAR LES JOUEURS : ajouter une entrée EN TÊTE de NEWS (id unique, jamais
   réutilisé), 2 à 4 phrases courtes, tutoiement, ton simple. Les bonnes pratiques (TIPS) se complètent quand on en découvre une.
   Uniquement des fonctions déclarées et des données : fichier chargé avant p5_ui. */
const NEWS = [
  { id: "v44", date: "19 nov.", title: "Quoi de neuf ? et notifications plus claires", items: ["Cette page raconte les nouveautés et les bonnes pratiques.", "Les notifications te préviennent à chaque message reçu dans ton groupe.", "Quand un ami t'envoie un GIF ou un autocollant, la notification dit « a envoyé un GIF » ou « a envoyé un autocollant »."] },
  { id: "v43", date: "19 nov.", title: "De nouveaux familiers, chacun avec son histoire", items: ["9 nouveaux familiers ont été ajoutés : Fennec, Tortue ninja, Singe Wukong, Paon, Aigle des vents, Chouette, Faon fleuri, Dragon-perle et Colibri. Il y en a maintenant 19 à débloquer.", "Chacun a une histoire personnalisée, en 3 chapitres qui se débloquent quand il évolue : Mon familier, puis Histoire.", "Le Panda passe au kung-fu et le Lion se pare d'or.", "Une petite animation accompagne chaque nouveau familier, chaque nouvelle couleur et chaque nouveau fond."] },
  { id: "v41", date: "19 nov.", title: "Les GIF sont disponibles, graphique plus clair", items: ["Les GIF sont disponibles dans le chat : touche le bouton GIF à côté du 😀, cherche ou choisis une idée en un toucher (Bravo, Rire, Wow…).", "Le graphique de la saison montre toi et le top 3 ; « Voir tous les joueurs » affiche les autres."] },
  { id: "v39", date: "19 nov.", title: "41 jeux et le jeu de la veille", items: ["6 nouveaux jeux : Histoire de France, Histoire du monde, Sports, Gastronomie, Sciences et nature, Langues du monde (à partir de demain 14 h 30).", "Tu as raté un jour ? Tu peux jouer le jeu de la veille, un seul essai, classé sans bousculer les autres.", "À 14 h 30, une courte animation révèle le nouveau jeu du jour."] },
  { id: "v38", date: "19 nov.", title: "71 autocollants", items: ["Les autocollants sont rangés par thèmes (Joie, Rire, Idées, Humeur, Amour, Salut, Jeu, Vie) : ton familier joue chaque émotion."] },
  { id: "v37", date: "19 nov.", title: "Fin de partie plus claire", items: ["Le bouton « Classement » reste en haut de l'écran de fin de partie ; le reste se replie.", "Touche 👥 sous un message pour voir qui a réagi.", "Une notification de message t'amène directement au message."] },
  { id: "v36", date: "19 nov.", title: "Notifications", items: ["Tu es prévenu quand un nouveau jeu arrive (14 h 30) et à chaque message reçu dans ton groupe.", "Active-les dans Réglages, puis Notifications (sur iPhone : après avoir ajouté l'application à l'écran d'accueil)."] }
];
const TIPS = [
  ["📧", "Relie ton e-mail", "Réglages, puis Compte : c'est ta seule façon de retrouver ton profil sur un autre téléphone."],
  ["📲", "Ajoute Méridien à ton écran d'accueil", "Elle s'ouvre en plein écran, comme une vraie application."],
  ["🔔", "Active les notifications", "Pour ne pas rater le nouveau jeu de 14 h 30 ni les messages de ton groupe."],
  ["🕑", "Le jeu change à 14 h 30 (heure de Barcelone)", "Tu as un jour complet pour jouer. Raté ? Le jeu de la veille se rattrape."],
  ["⚡", "Garde ton boost pour le bon jeu", "Une fois par saison, ton score compte ×1,5 : à activer avant ton premier essai."],
  ["🌟", "Le dimanche, c'est le Méga-quiz", "Un seul essai, points doublés : prends ton temps."],
  ["🔄", "Un souci d'affichage ? Recharge", "Ferme et rouvre l'application (deux fois) pour avoir la dernière version."]
];
const newsFresh = () => !!(store.profile && NEWS.length && store.profile.newsSeen !== NEWS[0].id);

function vNewsCard() {
  if (!store.profile || !store.profile.pet || !tutoState().done) return "";
  const n = NEWS[0], fresh = newsFresh();
  return `<button class="newscard ${fresh ? "fresh" : ""}" data-act="news" aria-label="Quoi de neuf ? ${esc(n.title)}${fresh ? ", nouveau" : ""}"><span class="nico" aria-hidden="true">✨</span><span class="ntx"><b>Quoi de neuf ?</b><small>${esc(n.title)}</small></span>${fresh ? `<i class="ndot">Nouveau</i>` : `<span class="nchev" aria-hidden="true">›</span>`}</button>`;
}
function vNewsSheet() {
  const seen = (ui.newsBefore !== undefined ? ui.newsBefore : (store.profile && store.profile.newsSeen)) || "";
  const idx = NEWS.findIndex(n => n.id === seen), unseen = idx < 0 ? NEWS.length : idx; // les entrées au-dessus de la dernière vue sont « nouvelles »
  const entries = NEWS.map((n, i) => `<li class="nentry ${i < unseen ? "new" : ""}"><div class="nh"><b>${esc(n.title)}</b><span>${esc(n.date)}${i < unseen ? ` · <em>Nouveau</em>` : ""}</span></div><ul>${n.items.map(t => `<li>${esc(t)}</li>`).join("")}</ul></li>`).join("");
  const tips = TIPS.map(([ic, t, d]) => `<li><span class="wic" aria-hidden="true">${ic}</span><div><b>${esc(t)}</b><span>${esc(d)}</span></div></li>`).join("");
  return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Quoi de neuf ?" data-stop>
    <div class="sheethead"><div><h3>Quoi de neuf ?</h3><div class="muted">L'application évolue presque chaque jour.</div></div></div>
    <div class="kicker">Les nouveautés</div><ul class="nlist">${entries}</ul>
    <div class="kicker">Les bonnes pratiques</div><ul class="perks">${tips}</ul>
    <button class="btn ghost" data-act="closesheet">Fermer</button></div></div>`;
}
function openNews() {
  if (!store.profile) return;
  ui.newsBefore = store.profile.newsSeen || ""; // pour garder le repère « Nouveau » le temps de la lecture
  store.profile.newsSeen = NEWS[0].id; save(); ui.sheet = "news"; render();
}
