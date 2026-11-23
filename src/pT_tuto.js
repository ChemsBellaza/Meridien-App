/* =================== TUTORIEL ET INTRODUCTION PROGRESSIVE ===================
   1) Écran de bienvenue, puis une manche d'essai guidée (3 questions du Quiz éclair, sans score ni essai consommé).
   2) Les systèmes avancés apparaissent peu à peu : jokers au 3e jour, carnet de voyage et succès au 5e jour.
   Les profils créés avant le tutoriel (migration v3, `legacy`) gardent tout débloqué et ne voient pas le tutoriel.
   État : store.profile.tuto = { done, seen: { joker, carnet }, legacy? } */

const TUTO_UNLOCK = { joker: 2, carnet: 4, trophees: 4 }; // index du jour de jeu (0 = jour de la création du profil)
const TUTO_NEWS = {
  joker: { title: "Les jokers sont débloqués", text: "Une fois par manche, un joker t'aide pour un petit prix en boussoles. Tu le verras en haut de la manche." },
  carnet: { title: "Carnet de voyage et succès", text: "Chaque pays rencontré dans un jeu est tamponné dans ton carnet, et les succès récompensent tes séries. Ils sont dans le menu." }
};

const tutoState = () => (store.profile && store.profile.tuto) || { done: true, seen: {}, legacy: true };
const dayDiff = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 864e5);
const daysIn = () => store.profile ? Math.max(0, dayDiff(store.profile.created || today(), today())) : 0;
const featureOn = f => tutoState().legacy || daysIn() >= (TUTO_UNLOCK[f] ?? 0);

function tutoDone() { if (store.profile && store.profile.tuto && !store.profile.tuto.done) { store.profile.tuto.done = true; save(); } }

/* ---------- nouveautés débloquées avec les jours ---------- */
function tutoNotice() {
  const t = tutoState();
  if (!t.done) return "";
  const key = ["joker", "carnet"].find(k => featureOn(k) && !(t.seen || {})[k] && !t.legacy);
  if (!key) return "";
  const n = TUTO_NEWS[key];
  return `<div class="tnotice" role="note"><span class="kicker">Nouveau</span><b>${fr(n.title)}</b><span>${fr(n.text)}</span><button class="smallbtn" data-act="tutoseen" data-v="${key}">Compris</button></div>`;
}

/* ---------- écran de bienvenue ---------- */
function vWelcome() {
  const pet = store.profile.pet;
  return `<div class="onb welcome tutowelcome">
    <div class="ohead">${petAv(pet, "xl", petName(pet))}<h1 class="display">Bienvenue, ${esc(store.profile.name)} !</h1>
      <p class="qsub">${fr(`${petName(pet)} te montre comment jouer.`)}</p></div>
    <div class="tw3" aria-hidden="true"><span>👆<small>Tu touches</small></span><span>🧠<small>Tu apprends</small></span><span>🏆<small>Tu gagnes</small></span></div>
    <p class="center"><b>Une petite manche d'essai : 3 questions, 2 minutes.</b><br><span class="muted">Rien ne compte : ni ton classement, ni tes essais.</span></p>
    <button class="btn pulse" data-act="tutostart">Essayer maintenant</button>
    <button class="linkbtn plainlink" data-act="tutoskip">Passer, je me débrouille</button>
  </div>`;
}

/* ---------- installation sur l'écran d'accueil : page d'accueil, bandeau, fenêtre des réglages ---------- */
const isMobileDev = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
const installWanted = () => isMobileDev() && !isStandalone();
const SHARE_ICO = `<svg class="ishare" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>`;
function installSteps() {
  if (isIOS()) return [[SHARE_ICO, "Touche <b>Partager</b>", "le carré avec une flèche, en bas de Safari"], ["➕", "Choisis <b>« Sur l'écran d'accueil »</b>", "fais défiler la liste si besoin"], ["✅", "Touche <b>Ajouter</b>", "l'icône Méridien apparaît sur ton écran"]];
  return [["⋮", "Touche <b>le menu ⋮</b>", "en haut à droite de ton navigateur"], ["📲", "Choisis <b>« Installer l'application »</b>", "ou « Ajouter à l'écran d'accueil »"], ["✅", "Touche <b>Installer</b>", "l'icône Méridien apparaît sur ton écran"]];
}
function installBody(withSkip) {
  const perks = [["⚡", "Un toucher et tu joues", "L'icône Méridien est sur ton écran, comme n'importe quelle appli."], ["🖥️", "Plein écran", "Sans barre de navigateur, c'est bien plus agréable à jouer."], ["📶", "Marche même sans réseau", "Elle s'ouvre toujours, même dans le métro."]];
  const steps = installSteps();
  const direct = deferredInstall ? `<button class="btn pulse" data-act="install">Ajouter à l'écran d'accueil</button><p class="note center">Ou suis les 3 étapes ci-dessous.</p>` : "";
  const warn = store.profile && store.profile.srv && isIOS() ? `<p class="note">Sur iPhone, l'application installée est une nouvelle copie : relie d'abord ton e-mail (Réglages, Compte) pour retrouver tes scores, puis choisis « J'ai déjà un compte » dans l'application installée.</p>` : "";
  return `<ul class="perks">${perks.map(([i, t, d]) => `<li><span class="wic" aria-hidden="true">${i}</span><div><b>${t}</b><span>${d}</span></div></li>`).join("")}</ul>
    ${direct}
    <ol class="isteps" aria-label="Comment faire">${steps.map(([ic, t, d], i) => `<li><span class="in num">${i + 1}</span><span class="ic" aria-hidden="true">${ic}</span><span class="tx"><span>${t}</span><small>${d}</small></span></li>`).join("")}</ol>${warn}`;
}
function vInstallPage() { // étape de l'accueil, avant la création du compte
  return `<div class="onb install">
    <div class="whero"><span class="phone" aria-hidden="true"><span class="screen">${logoMark(44)}<small>Méridien</small></span></span><h1 class="display">Encore mieux sur ton écran d'accueil</h1><p class="wtag">Ajoute Méridien à ton téléphone : c'est comme une vraie application, et tu ne rates plus ton jeu du jour.</p></div>
    ${installBody()}
    <button class="btn" data-act="instnext">${deferredInstall ? "Plus tard, je continue" : "C'est fait, je continue"}</button>
    <button class="linkbtn plainlink" data-act="instnext">Passer cette étape</button>
  </div>`;
}
function vInstallSheet() {
  return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Ajouter à l'écran d'accueil" data-stop>
    <div class="sheethead"><div><h3>Encore mieux sur ton écran d'accueil</h3><div class="muted">3 gestes, 20 secondes</div></div></div>
    ${installBody()}
    <button class="btn ghost" data-act="closesheet">Fermer</button></div></div>`;
}
function installNotice() { // bandeau discret, une fois le tutoriel terminé ; « Plus tard » le masque 7 jours
  if (!store.profile || !store.profile.pet || !tutoState().done || !installWanted()) return "";
  const until = store.profile.installLater || ""; if (until && today() < until) return "";
  return `<div class="tnotice" role="note"><span class="kicker">Astuce</span><b>Mets Méridien sur ton écran d'accueil</b><span>Un toucher pour jouer, en plein écran. Ça prend 20 secondes.</span><span class="btnline"><button class="smallbtn" data-act="installpage">Comment faire</button><button class="smallbtn ghost" data-act="installlater">Plus tard</button></span></div>`;
}
// premier lancement : aucune vraie partie jouée encore → on guide le doigt
const firstRun = () => !!(store.profile && tutoState().done && !tutoState().legacy && progress().plays === 0);

/* ---------- partie guidée ---------- */
function startTuto() {
  const k = today(), seed = "tuto" + Date.now();
  game = { k, fmt: "quiz", seed, practice: true, tuto: true, tryIdx: 0, manches: manchesOf(seed, "quiz").slice(0, 1), round: 0, phase: "intro", diffs: [], qs: [], qi: 0, score: 0, roundPts: [0, 0, 0],
    learned: [], answer: null, playIdx: null, newUnlocks: [], newAch: [], jokers: [false, false, false], stamps: [], mlabel: [], grid: [], usedLetters: [] };
  ui.sheet = false; renderGame();
}

// bulle du familier qui commente chaque étape
function coach(text) {
  const pet = store.profile.pet;
  return `<div class="coach" role="note">${petAv(pet, "md", petName(pet))}<p>${fr(text)}</p></div>`;
}
function tutoCoach(g) {
  if (!g.tuto) return "";
  if (g.phase === "diff") return coach("Choisis ta difficulté : plus c'est dur, plus ça rapporte. Touche « Moyen » pour commencer 👇");
  if (g.phase === "q" && g.qi === 0) return coach("Touche la bonne réponse ! Pas de pression, ça ne compte pas.");
  if (g.phase === "reveal" && g.qi === 0) return coach(g.answer && g.answer.base > 0
    ? "Bravo ! Lis « Le saviez-vous ? » : tu apprends un truc à chaque réponse."
    : "Raté, pas grave ! Lis « Le saviez-vous ? » : tu apprends un truc à chaque réponse.");
  return "";
}
function tutoIntro(g) {
  const pet = store.profile.pet, F = FORMATS[g.fmt];
  return `<div class="rowtop"><button class="roundbtn" data-g="quit" aria-label="Quitter">${I.close}</button><span class="flag">Manche d'essai · non comptée</span><span></span></div>
    <div class="hcard static">${art(g.fmt, g.k)}${labels("Manche d'essai", F.name)}</div>
    ${coach("Chaque jour, un jeu différent t'attend. Aujourd'hui : 3 questions pour t'échauffer !")}
    <p class="qsub">${fr(F.sub)}</p>
    <button class="btn" data-g="start" style="margin-top:auto">C'est parti</button>`;
}
function vEndTuto() {
  const g = game, pet = store.profile.pet, good = g.score >= 200;
  const next = [
    ["🎯", "Un jeu par jour", "Ton meilleur essai compte."],
    ["🧭", "Des boussoles", "Ta place et ton score t'en rapportent."],
    ["🔓", "À débloquer", "Jokers dès le 3e jour, carnet au 5e."]
  ];
  return `<div class="react"><span class="rtile">${petSVG(pet, { mood: good ? "joy" : null })}</span><div class="say3"><b>${esc(petName(pet))}</b><span>${fr(good ? "Bien joué ! Tu as compris le principe." : "Tu as compris le principe, et tu t'amélioreras vite !")}</span></div></div>
    <div class="endscore"><div class="v num">${fmtNum(g.score)}</div><div class="u">points (pour l'entraînement)</div></div>
    <ul class="wsteps">${next.map(([ic, t, d]) => `<li><span class="wic" aria-hidden="true">${ic}</span><span><b>${fr(t)}</b><br><span class="muted">${fr(d)}</span></span></li>`).join("")}</ul>
    ${g.learned.length ? `<details class="learned"><summary>Ce que tu as appris (${g.learned.length})</summary><ul>${g.learned.slice(0, 6).map(l => `<li><b>${fr(l.t)}</b>${l.f ? ` : ${fr(l.f)}` : ""}</li>`).join("")}</ul></details>` : ""}
    <button class="btn pulse" data-g="exit">Jouer mon premier défi</button>`;
}
