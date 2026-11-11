/* ============ CARNET DE VOYAGE, SUCCÈS, PARTAGE, RÉACTIONS ============ */
Object.assign(BOT_LINES, {
  sprint: ["J'ai cherché le Burundi pendant 10 secondes", "Le Malawi, je le confonds toujours avec le Mozambique", "Zoomer, ça change tout"],
  capitales: ["Ouagadougou, je l'écris jamais pareil", "J'ai mis Sydney pour l'Australie, honte", "Astana ou Almaty, je ne sais jamais"],
  petitbac: ["Personne n'a mis la même chose que moi, parfait", "Un fleuve en V, sérieusement ?", "J'ai séché sur le métier"],
  plusmoins: ["Le Nigeria plus peuplé que la Russie, je ne savais pas", "Série de 7, je prends", "Ces sommets se ressemblent tous"],
  drapeaux: ["Tchad ou Roumanie ? Toujours le même piège", "J'adore ce jeu", "10 secondes c'est court"],
  intrus: ["Celle sur les traités était vicieuse", "J'ai trouvé l'intrus, c'était moi"],
  quisuisje: ["Trouvé au premier indice, je suis chaud", "J'ai eu besoin des quatre indices…"],
  connexions: ["La famille violette, impossible", "Trois erreurs, j'ai eu chaud", "Le piège avec Hermès, bien vu"],
  motdujour: ["Trouvé en 3 !", "Le mot de 7 lettres m'a achevé", "J'ai commencé par AEIOU, ça marche bien"],
  top10: ["Il m'en manquait deux, rageant", "Les 7 merveilles, je n'en avais que 4"],
  silhouettes: ["Le Chili, on ne peut pas le rater", "Toutes les silhouettes d'Afrique se ressemblent"],
  relier: ["Zéro faute !", "J'ai confondu Manet et Monet, classique"],
  vraifaux: ["Trois erreurs en 10 secondes, record", "Les dates de traités, mon point faible"],
  rebus: ["Le rébus du chat, trop bien", "Je n'ai rien compris aux emojis"],
  voisins: ["La Chine a 14 voisins, j'en ai trouvé 9", "J'avais oublié la Moldavie"],
  citations: ["Je pensais que c'était Napoléon, c'était Clemenceau", "Les citations attribuées, c'est fourbe"],
  classement: ["Ordre parfait du premier coup", "Le Teide plus haut que le mont Cook ?!"],
  blocs: ["La Norvège n'est pas dans l'UE, j'oublie toujours", "La Bulgarie a l'euro maintenant"],
  paysmystere: ["Trouvé en 3, la flèche aide beaucoup", "J'étais à 400 km pendant cinq essais…", "Le joker capitale m'a sauvé"],
  neavant: ["Mozart avant Beethoven, je le savais !", "Les dates de naissance des sportifs, aucune idée", "Trois erreurs en 20 secondes"],
  chaine: ["Les pays en E, j'étais à court", "12 animaux d'affilée !", "Bloqué sur un Y"],
  anagrammes: ["OPPENHEIMER en anagramme, cruel", "J'ai vu PARIS tout de suite", "Les capitales de 9 lettres, l'enfer"],
  comptebon: ["Le compte est bon du premier coup", "À 2 près, rageant", "Les suites logiques, j'adore"],
  sigles: ["Je ne savais pas ce que voulait dire LASER", "URSSAF, personne ne le sait vraiment", "Facile quand on a passé un oral d'ENA"],
  distance: ["Paris-Tokyo, j'étais à 300 km près", "Je pensais Lisbonne beaucoup plus loin", "La France est plus petite que je croyais"]
});

/* ---------- succès ---------- */
const ACH = [
  { id: "first", label: "Premier départ", desc: "Termine ta première partie, entraînement compris.", ico: "compass", test: p => p.plays >= 1 },
  { id: "plays10", label: "Habitué", desc: "Joue 10 parties.", ico: "retry", test: p => p.plays >= 10 },
  { id: "plays30", label: "Pilier du groupe", desc: "Joue 30 parties.", ico: "retry", test: p => p.plays >= 30 },
  { id: "streak3", label: "Sur la lancée", desc: "Joue 3 jours de suite.", ico: "fire", test: p => p.streak >= 3 },
  { id: "streak7", label: "Une semaine pile", desc: "Joue 7 jours de suite.", ico: "fire", test: p => p.streak >= 7 },
  { id: "streak21", label: "Trois semaines", desc: "Joue 21 jours de suite.", ico: "fire", test: p => p.streak >= 21 },
  { id: "win1", label: "Premier du jour", desc: "Gagne un défi du jour.", ico: "trophy", test: p => p.wins >= 1 },
  { id: "win5", label: "Champion", desc: "Gagne 5 défis du jour.", ico: "trophy", test: p => p.wins >= 5 },
  { id: "fmts7", label: "Touche-à-tout", desc: "Joue à 7 jeux différents.", ico: "medal", test: p => p.fmts >= 7 },
  { id: "fmts21", label: "Grand tour", desc: "Joue à 21 jeux différents.", ico: "medal", test: p => p.fmts >= 21 },
  { id: "perfect", label: "Sans faute", desc: "Réussis une manche parfaite.", ico: "medal", test: p => p.perfect >= 1 },
  { id: "carnet25", label: "Globe-trotteur", desc: "Tamponne 25 pays dans ton carnet.", ico: "book", test: p => p.carnet >= 25 },
  { id: "carnet75", label: "Grand voyageur", desc: "Tamponne 75 pays.", ico: "book", test: p => p.carnet >= 75 },
  { id: "carnet150", label: "Tour du monde", desc: "Tamponne 150 pays.", ico: "book", test: p => p.carnet >= 150 },
  { id: "gems500", label: "Boussole d'or", desc: "Gagne 500 boussoles.", ico: "compass", test: p => p.gems >= 500 }
];
function achStats() {
  const p = progress(), played = Object.values(store.stats.fmts || {}).reduce((a, b) => a + b, 0);
  let d = today(), streak = 0; if (!(store.plays[d] || []).length) d = addDays(d, -1);
  while ((store.plays[d] || []).length) { streak++; d = addDays(d, -1); }
  if (srvOn()) streak = p.streak; // en ligne : série calculée par le serveur
  return { ...p, plays: Math.max(p.plays, played), streak, perfect: store.stats.perfect || 0 };
}
function checkAchievements() {
  const st = achStats(), out = [];
  ACH.forEach(a => { if (!store.ach[a.id] && a.test(st)) { store.ach[a.id] = today(); out.push(a); } });
  return out;
}
function achIcon(a, s = 44) {
  const on = !!store.ach[a.id], ico = a.ico === "compass" ? I.compass(s * .5) : a.ico === "fire" ? I.fire(s * .5) : a.ico === "trophy" ? I.trophy(s * .5) : a.ico === "retry" ? I.retry(s * .46) : a.ico === "book" ? I.book(s * .5) : I.medal(s * .5);
  return `<span class="medalic ${on ? "on" : ""}" style="width:${s}px;height:${s}px">${ico}</span>`;
}

/* ---------- partage du score ---------- */
function shareText(challenge) {
  const g = game, F = FORMATS[g.fmt], sq = g.manches.map((m, i) => { const r = g.roundPts[i] / (F.max * CONFIG.mult[g.diffs[i] ?? 0]); return r >= .66 ? "🟩" : r >= .33 ? "🟨" : "🟥"; }).join("");
  const res = dayResults(g.k), me = res.played.find(r => r.me);
  let t = `Méridien · défi n°${issueNo(g.k)} · ${F.name}\n${sq} ${fmtNum(g.score)} pts${me ? ` · n°${me.pos} du groupe` : ""}`;
  if (g.fmt === "motdujour") g.grid.forEach((rows, i) => { if (rows) t += `\nMot ${i + 1} : ${rows.length}/6\n${rows.join("\n")}`; });
  if (challenge) t += `\n\nJe te défie de faire mieux ! Rejoins « ${store.profile.group} » avec le code ${store.profile.code}.`;
  return t;
}
function shareResult(challenge) {
  const text = shareText(challenge);
  const done = msg => { ui.toast = msg; renderGame(); };
  const copy = () => { try { navigator.clipboard.writeText(text).then(() => done("Copié : colle-le dans ta messagerie"), () => done("Copie impossible sur cet appareil")); } catch (e) { done("Copie impossible sur cet appareil"); } };
  if (navigator.share) navigator.share({ text }).catch(err => { if (err && err.name !== "AbortError") copy(); });
  else copy();
}

/* ---------- réactions sur le fil ---------- */
const REACTS = ["👍", "😂", "🔥", "😮", "👏"];
function reactionsOf(k, ev) {
  const counts = {}, r = rng(`${k}|${ev.id}|react`), live = k === today(), now = minutesNow();
  if (ev.type !== "launch") BOTS.forEach(b => {
    if (ev.p && b.id === ev.p.id) return;
    const p = ev.type === "score" ? (ev.p && ev.p.me ? .45 : .22) : .18;
    if (r() < p) { const at = ev.at + 2 + Math.floor(r() * 90); if (!live || at <= now) { const e = ev.type === "score" ? REACTS[2 + Math.floor(r() * 3)] : REACTS[Math.floor(r() * 5)]; counts[e] = (counts[e] || 0) + 1; } }
  });
  const mine = (store.react[k] || {})[ev.id];
  if (mine) counts[mine] = (counts[mine] || 0) + 1;
  return { counts, mine };
}
function reactRow(k, ev) {
  if (srvOn()) return ""; // réactions réelles : étape 6 (les réactions simulées sont retirées en ligne)
  const { counts, mine } = reactionsOf(k, ev), keys = Object.keys(counts);
  const open = ui.reactOpen === ev.id;
  return `${keys.length ? `<span class="reacts">${keys.map(e => `<button class="rx ${mine === e ? "me" : ""}" data-act="react" data-v="${ev.id}|${e}" aria-label="${e} ${counts[e]}">${e}<b class="num">${counts[e]}</b></button>`).join("")}</span>` : ""}
    ${open ? `<span class="rxpick" role="group" aria-label="Réagir">${REACTS.map(e => `<button data-act="react" data-v="${ev.id}|${e}" aria-pressed="${mine === e}">${e}</button>`).join("")}</span>` : ""}`;
}

/* ---------- vue Carnet de voyage ---------- */
function vCarnet() {
  const n = Object.keys(store.carnet).length, tot = COUNTRIES.length, pet = store.profile.pet, Sp = SPECIES[pet.species];
  const byCont = Object.keys(CNAME).map(k => { const all = COUNTRIES.filter(c => c.cont === k), got = all.filter(c => store.carnet[c.id]); return { k, all: all.length, got: got.length }; });
  const recent = Object.entries(store.carnet).sort((a, b) => a[1] < b[1] ? 1 : -1).slice(0, 40);
  const line = n === 0 ? "Notre carnet est vide. Joue à Sprint Carte, Drapeaux ou Capitales pour le remplir !" : n < 20 ? `${n} pays déjà ! On continue ?` : n < 80 ? `${n} pays : on commence à avoir de beaux souvenirs.` : `${n} pays. On est de vrais globe-trotteurs.`;
  return `<div class="rowtop">${backBtn()}<span class="kicker">Carnet de voyage</span><span></span></div>
    <div class="carnethead"><div class="big num">${n}<small>/${tot}</small></div><div><b>pays tamponnés</b><span class="note">Chaque pays trouvé dans Sprint Carte, Capitales, Drapeaux, Silhouettes ou Voisins rejoint ton carnet.</span></div></div>
    ${MAP.ready ? `<div class="mapwrap carnet">${countriesSVG([-170, 180, -56, 78], "", null, id => store.carnet[id] ? "ok" : "", "Carte de tes pays tamponnés")}</div>` : ""}
    <div class="contbars">${byCont.map(b => `<div class="cb"><span>${CNAME[b.k]}</span><div class="bar"><i style="width:${Math.round(100 * b.got / b.all)}%;background:${CONTS[b.k].color}"></i></div><b class="num">${b.got}/${b.all}</b></div>`).join("")}</div>
    <div class="petsay static">${petAv(pet, "lg", petName(pet))}<span class="say2"><b>${esc(petName(pet))}</b><span>${fr(line)}</span></span></div>
    ${recent.length ? `<div class="stampgrid">${recent.map(([id, d]) => `<span class="stampbig"><span class="fl">${flagOf(CBY[id])}</span><b>${esc(CBY[id].name)}</b><small>${shortDate(d)}</small></span>`).join("")}</div>` : ""}`;
}

/* ---------- vue Succès ---------- */
function vTrophees() {
  const st = achStats(), got = ACH.filter(a => store.ach[a.id]).length;
  return `<div class="rowtop">${backBtn()}<span class="kicker">Succès</span><span></span></div>
    <div class="carnethead"><div class="big num">${got}<small>/${ACH.length}</small></div><div><b>succès débloqués</b><span class="note">Ils récompensent ta régularité, ta curiosité et tes exploits.</span></div></div>
    <div class="achlist">${ACH.map(a => `<div class="achrow ${store.ach[a.id] ? "on" : ""}">${achIcon(a, 48)}<div class="grow"><b>${esc(a.label)}</b><span>${esc(a.desc)}</span></div>${store.ach[a.id] ? `<span class="tag num">${shortDate(store.ach[a.id])}</span>` : I.lock}</div>`).join("")}</div>
    <p class="note center">${st.plays} partie${st.plays > 1 ? "s" : ""} · ${st.fmts} jeu${st.fmts > 1 ? "x" : ""} différent${st.fmts > 1 ? "s" : ""} · ${st.perfect} manche${st.perfect > 1 ? "s" : ""} parfaite${st.perfect > 1 ? "s" : ""}</p>`;
}
