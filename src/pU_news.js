/* ============ « QUOI DE NEUF ? » et « LES INDISPENSABLES » (v44, réécrit en v45) ============
   Sur l'accueil, deux blocs séparés : « Les indispensables » (ce qu'il faut pour que le jeu se passe bien) ouvre sa propre fenêtre,
   « Quoi de neuf ? » ouvre la sienne. Un point « Nouveau » reste affiché tant que la dernière entrée n'a pas été ouverte (profile.newsSeen).
   À CHAQUE LOT VISIBLE PAR LES JOUEURS : ajouter une entrée EN TÊTE de NEWS (id unique, jamais réutilisé).
   Ton : tutoiement, phrases courtes et concrètes, pas d'emoji décoratif, pas de point d'exclamation, pas de liste de trois mots creux.
   Typographie : apostrophe courbe ’, guillemets « … » avec espaces insécables ( ).
   Uniquement des fonctions déclarées et des données : fichier chargé avant p5_ui. */
const MUST = [
  ["Relie ton e-mail.", "Réglages, puis Compte. Sans ça, un téléphone perdu, c’est un profil perdu."],
  ["Installe l’appli.", "Ajoute Méridien à l’écran d’accueil : plein écran, un geste pour l’ouvrir."],
  ["Active les notifications.", "Réglages, puis Notifications. Tu sauras quand le jeu change et quand ton groupe écrit."],
  ["Joue avant 14 h 30.", "Un jeu par jour, à l’heure de Barcelone. Raté ? Le jeu de la veille se rattrape, un seul essai."],
  ["Pas à jour ?", "Ferme l’appli et rouvre-la, deux fois."]
];
const NEWS = [
  { id: "v82", date: "23 nov.", title: "Boussoles plus justes", text: "Les boussoles d’un jeu dépendent maintenant de ta place en pourcentage et de ton score, plus du nombre de joueurs : finir premier rapporte autant dans un petit groupe que dans un grand. Les jours déjà passés de la saison sont recalculés." },
  { id: "v81", date: "23 nov.", title: "Historique par groupe", text: "Dans Mes jeux joués, choisis un groupe : les jeux et les classements ne se mélangent plus. Le bouton Tous les réunit si tu préfères." },
  { id: "v78", date: "22 nov.", title: "Ton familier te suit", text: "Ton familier et son expérience sont enregistrés sur ton compte : tu les retrouves sur ton autre téléphone ou sur l’ordinateur. Tes amis voient aussi le familier que tu joues vraiment." },
  { id: "v77", date: "22 nov.", title: "Un familier, sa progression", text: "Chaque familier gagne son expérience tout seul : évolution, couleurs chromatiques et fonds se débloquent avec celui que tu joues. Change de familier quand tu veux, chacun garde son niveau." },
  { id: "v54", date: "20 nov.", title: "Graphique de saison", text: "Deux affichages : Course, avec une barre par joueur et un curseur pour revoir chaque jour, ou Courbes. Touche un joueur dans la liste pour l’afficher ou le masquer." },
  { id: "v52", date: "20 nov.", title: "Graphique de saison", text: "Les familiers avancent au bout de leur ligne, jour après jour. Une étincelle marque chaque jour gagné. Un bouton Classement mène au détail de la saison." },
  { id: "v48", date: "20 nov.", title: "Classement et jeux précédents", text: "Le classement d’un jeu affiche un podium, puis une ligne simple par joueur. Les jeux précédents se parcourent jour par jour, avec ton rang sur chaque jour. Le graphique de saison a plus de dates." },
  { id: "v47", date: "19 nov.", title: "Accueil plus rapide", text: "Le bouton Jouer remonte en haut de l’écran. Un seul bandeau s’affiche à la fois. Dans Réglages, l’essentiel passe en premier. Le classement montre le top 5 et ta ligne, et la fiche de ton familier est plus courte." },
  { id: "v44", date: "19 nov.", title: "Notifications", text: "Chaque message de ton groupe te notifie. Un GIF reçu s’annonce clairement : « Naïs a envoyé un GIF »." },
  { id: "v43", date: "19 nov.", title: "Neuf nouveaux familiers", text: "Fennec, tortue ninja, singe Wukong, paon, aigle des vents, chouette, faon, dragon-perle et colibri. Chacun a son histoire, en trois chapitres qui se débloquent à l’évolution. Le panda fait du kung-fu, le lion s’habille d’or." },
  { id: "v41", date: "19 nov.", title: "GIF et autocollants", text: "Les GIF sont là : le bouton GIF est à côté du 😀. Il y a aussi 71 autocollants, rangés par thème." },
  { id: "v39", date: "19 nov.", title: "Six jeux de plus", text: "Histoire de France, histoire du monde, sports, gastronomie, sciences et nature, langues : 41 jeux en tout, à partir du 20 novembre. Tu as raté un jour ? Rejoue le jeu de la veille." },
  { id: "v37", date: "19 nov.", title: "Fin de partie et classement", text: "Le bouton Classement reste en haut de l’écran de fin. Le 👥 sous un message montre qui a réagi. Le graphique de saison ne garde que toi et le top 3." }
];
const newsFresh = () => !!(store.profile && NEWS.length && store.profile.newsSeen !== NEWS[0].id);

function vNewsCard() {
  if (!store.profile || !store.profile.pet || !tutoState().done) return "";
  const n = NEWS[0], fresh = newsFresh();
  return `<button class="newscard ${fresh ? "fresh" : ""}" data-act="news" aria-label="Quoi de neuf ? ${esc(n.title)}${fresh ? ", nouveau" : ""}"><span class="ntx"><b>Quoi de neuf ?</b><small>${esc(n.title)}</small></span>${fresh ? `<i class="ndot">Nouveau</i>` : `<span class="nchev" aria-hidden="true">›</span>`}</button>`;
}
function vNewsSheet() { // « Quoi de neuf ? » : uniquement les nouveautés
  const seen = (ui.newsBefore !== undefined ? ui.newsBefore : (store.profile && store.profile.newsSeen)) || "";
  const idx = NEWS.findIndex(n => n.id === seen), unseen = idx < 0 ? NEWS.length : idx; // les entrées au-dessus de la dernière vue sont « nouvelles »
  const entries = NEWS.map((n, i) => `<li class="nentry ${i < unseen ? "new" : ""}"><div class="nh"><b>${esc(n.title)}</b><span>${esc(n.date)}${i < unseen ? ` · <em>nouveau</em>` : ""}</span></div><p>${esc(n.text)}</p></li>`).join("");
  return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Quoi de neuf\u00a0?" data-stop>
    <div class="sheethead"><div><h3>Quoi de neuf\u00a0?</h3></div></div>
    <ul class="nlist">${entries}</ul>
    <button class="btn ghost" data-act="closesheet">Fermer</button></div></div>`;
}
function vMustSheet() { // « Les indispensables » : uniquement ce qu'il faut pour que le jeu se passe bien
  const must = MUST.map(([t, d], i) => `<li><span class="in num">${i + 1}</span><span class="tx"><span><b>${esc(t)}</b></span><small>${esc(d)}</small></span></li>`).join("");
  return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Les indispensables" data-stop>
    <div class="sheethead"><div><h3>Les indispensables</h3><div class="muted">Pour que le jeu se passe bien.</div></div></div>
    <ol class="isteps">${must}</ol>
    <button class="btn ghost" data-act="closesheet">Fermer</button></div></div>`;
}function openNews() {
  if (!store.profile) return;
  ui.newsBefore = store.profile.newsSeen || ""; // pour garder le repère « nouveau » le temps de la lecture
  store.profile.newsSeen = NEWS[0].id; save(); ui.sheet = "news"; render();
}

/* ---------- « Les indispensables » sur l'accueil : les 3 réglages qui comptent, cochés quand c'est fait ---------- */
function mustState() { // [{ ok, title, small, act }] : seulement ce qui s'applique à cet appareil
  const rows = [];
  if (srvOn()) rows.push({ ok: !!(SRV.sess && SRV.sess.user && SRV.sess.user.email), title: "Relie ton e-mail", small: "Sans ça, un téléphone perdu, c’est un profil perdu.", act: "acct" });
  if (typeof installWanted === "function" && isMobileDev()) rows.push({ ok: isStandalone(), title: "Installe l’appli", small: "Sur l’écran d’accueil, en plein écran.", act: "installpage" });
  if (srvOn() && typeof pushSupported === "function" && PUSH.checked && (pushSupported() || pushNeedsInstall())) rows.push({ ok: !!PUSH.on, title: "Active les notifications", small: "Jeu à 14\u00a0h\u00a030, messages du groupe.", act: pushNeedsInstall() ? "installpage" : "pushon" });
  return rows;
}
function vMust() {
  if (!store.profile || !store.profile.pet || !tutoState().done) return "";
  const rows = mustState(), todo = rows.filter(r => !r.ok);
  if (!todo.length) return `<button class="newscard mustok" data-act="must" aria-label="Les indispensables : tout est en ordre"><span class="ntx"><b>Les indispensables</b><small>Tout est en ordre.</small></span><span class="nchev" aria-hidden="true">›</span></button>`;
  return `<section class="must" aria-label="Les indispensables"><div class="musttop"><b>Les indispensables</b><button class="linkbtn" data-act="must">Tout voir</button></div>${rows.map(r => `<button class="mrow ${r.ok ? "ok" : ""}" data-act="${r.act}"><span class="mchk" aria-hidden="true">${r.ok ? "✓" : ""}</span><span class="ntx"><b>${esc(r.title)}</b><small>${esc(r.small)}</small></span>${r.ok ? "" : `<span class="nchev" aria-hidden="true">›</span>`}</button>`).join("")}</section>`;
}
/* ---------- un seul bandeau à la fois dans le groupe (priorité : fin de saison, nouveauté débloquée, récap, installation, notifications, accueil en ligne, nouveautés) ---------- */
function groupNotice() {
  return [seasonBanner(), tutoNotice(), recapCard(), installNotice(), pushNotice(), onlineNotice(), vNewsCard()].find(Boolean) || "";
}
/* ---------- fenêtre « Sauvegarde du compte » : relier son e-mail en un toucher ---------- */
function vAcctSheet() {
  return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Sauvegarde du compte" data-stop>
    <div class="sheethead"><div><h3>Relie ton e-mail</h3><div class="muted">Pour retrouver ton profil sur un autre téléphone.</div></div></div>
    ${accountSheetBlock()}
    <button class="btn ghost" data-act="closesheet">Fermer</button></div></div>`;
}
/* ---------- Réglages : l'essentiel d'abord, avec l'état de chaque point ---------- */
function vEssentiel() {
  const online = srvOn(), email = online && SRV.sess && SRV.sess.user && SRV.sess.user.email, rows = [];
  if (online) rows.push({ ok: !!email, t: "Compte", v: email ? `E-mail relié · ${maskEmail(email)}` : "E-mail à relier", act: email ? "" : "acct" });
  if (online && typeof pushSupported === "function" && (pushSupported() || pushNeedsInstall())) rows.push({ ok: !!PUSH.on, t: "Notifications", v: PUSH.on ? "Activées" : "À activer", act: PUSH.on ? "" : (pushNeedsInstall() ? "installpage" : "pushon") });
  if (isMobileDev()) rows.push({ ok: isStandalone(), t: "Application", v: isStandalone() ? "Installée" : "À installer sur l’écran d’accueil", act: isStandalone() ? "" : "installpage" });
  if (!rows.length) return "";
  return `<div class="essentiel" role="group" aria-label="État du compte et des notifications">${rows.map(r => `<${r.act ? "button" : "div"} class="mrow ${r.ok ? "ok" : ""}" ${r.act ? `data-act="${r.act}"` : ""}><span class="mchk" aria-hidden="true">${r.ok ? "✓" : ""}</span><span class="ntx"><b>${esc(r.t)}</b><small>${esc(r.v)}</small></span>${r.act ? `<span class="nchev" aria-hidden="true">›</span>` : ""}</${r.act ? "button" : "div"}>`).join("")}</div>`;
}