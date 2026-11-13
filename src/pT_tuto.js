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
  const steps = [
    ["1", "Un défi par jour", `${CONFIG.tries} essais, 3 manches : le meilleur score compte.`],
    ["2", "Tu choisis la difficulté", "Plus c'est dur, plus les points sont multipliés."],
    ["3", "Tu apprends en jouant", "Chaque réponse s'accompagne d'un « Le saviez-vous ? »."]
  ];
  return `<div class="onb welcome">
    <div class="ohead">${petAv(pet, "xl", petName(pet))}<h1 class="display">Bienvenue, ${esc(store.profile.name)}</h1>
      <p class="qsub">${fr(`${petName(pet)} t'accompagne. Voyons comment ça marche en une manche d'essai de 2 minutes.`)}</p></div>
    <ol class="wsteps">${steps.map(([n, t, d]) => `<li><span class="num wn">${n}</span><span><b>${fr(t)}</b><br><span class="muted">${fr(d)}</span></span></li>`).join("")}</ol>
    <button class="btn" data-act="tutostart">Faire la manche d'essai</button>
    <button class="btn ghost" data-act="tutoskip">Passer, je me débrouille</button>
    <p class="note center">Rien ne compte dans cette manche : ni ton classement, ni tes essais du jour.</p>
  </div>`;
}

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
  if (g.phase === "diff") return coach("Avant chaque manche, tu choisis ta difficulté. Plus elle est haute, plus tes points sont multipliés. Pour commencer, Moyen est un bon choix !");
  if (g.phase === "q" && g.qi === 0) return coach("Touche la bonne réponse avant la fin de la barre de temps. Pas de pression : cette manche ne compte pas.");
  if (g.phase === "reveal" && g.qi === 0) return coach(g.answer && g.answer.base > 0
    ? "Bravo ! Tes points sont multipliés par la difficulté. Lis aussi « Le saviez-vous ? » : chaque réponse t'apprend quelque chose."
    : "Raté, ce n'est pas grave ! Lis « Le saviez-vous ? » juste en dessous : chaque réponse t'apprend quelque chose.");
  return "";
}
function tutoIntro(g) {
  const pet = store.profile.pet, F = FORMATS[g.fmt];
  return `<div class="rowtop"><button class="roundbtn" data-g="quit" aria-label="Quitter">${I.close}</button><span class="flag">Manche d'essai · non comptée</span><span></span></div>
    <div class="hcard static">${art(g.fmt, g.k)}${labels("Manche d'essai", F.name)}</div>
    ${coach("Voici le Quiz éclair, l'un des 35 jeux. Chaque jour, un jeu différent t'attend. Ici : 3 questions pour t'échauffer.")}
    <p class="qsub">${fr(F.sub)}</p>
    <button class="btn" data-g="start" style="margin-top:auto">C'est parti</button>`;
}
function vEndTuto() {
  const g = game, pet = store.profile.pet, good = g.score >= 200;
  const next = [
    ["Le défi du jour", `Un nouveau jeu chaque jour, ${CONFIG.tries} essais, 3 manches. Ton meilleur score compte.`],
    ["Les boussoles", "Elles s'ajoutent selon ta place au classement du groupe et servent à acheter des jokers."],
    ["Bientôt", "Les jokers arrivent le 3e jour, le carnet de voyage et les succès le 5e."]
  ];
  return `<div class="react"><span class="rtile">${petSVG(pet, { mood: good ? "joy" : null })}</span><div class="say3"><b>${esc(petName(pet))}</b><span>${fr(good ? "Bien joué ! Tu as compris le principe." : "Tu as compris le principe, et tu t'amélioreras vite !")}</span></div></div>
    <div class="endscore"><div class="v num">${fmtNum(g.score)}</div><div class="u">points (pour l'entraînement)</div></div>
    <ul class="wsteps">${next.map(([t, d]) => `<li><span><b>${fr(t)}</b><br><span class="muted">${fr(d)}</span></span></li>`).join("")}</ul>
    ${g.learned.length ? `<details class="learned"><summary>Ce que tu as appris (${g.learned.length})</summary><ul>${g.learned.slice(0, 6).map(l => `<li><b>${fr(l.t)}</b>${l.f ? ` : ${fr(l.f)}` : ""}</li>`).join("")}</ul></details>` : ""}
    <button class="btn" data-g="exit">Aller à mon groupe</button>`;
}
