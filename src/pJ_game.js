/* ============ JEU : démarrage, manches, barème, chrono ============ */
function startGame(practice, fmtForced, catchDay) {
  const k = catchDay || today(); // catchDay : rattrapage d'un jeu précédent de la saison (1 seul essai, en ligne)
  const fmt = practice ? fmtForced : fmtOf(k);
  const online = !practice && srvOn(); // en ligne : essais et jour décidés par le serveur
  let tryIdx = 0;
  if (catchDay && !online) return;
  if (!practice && !catchDay) {
    const mine = online ? (SRV.attempts[k] || []) : (store.plays[k] = store.plays[k] || []);
    if (mine.length >= CONFIG.tries) return;
    tryIdx = mine.length;
  }
  const seed = practice ? "p" + Date.now() : k;
  game = { k, fmt, seed, practice, online, tryIdx, catchup: !!catchDay, manches: manchesOf(seed, fmt), round: 0, phase: "intro", diffs: [], qs: [], qi: 0, score: 0, roundPts: [0, 0, 0],
    learned: [], answer: null, playIdx: null, newUnlocks: [], newAch: [], jokers: [false, false, false], stamps: [], mlabel: [], grid: [], usedLetters: [] };
  renderGame();
}
const E = () => ENG[FORMATS[game.fmt].eng];
// générateur pseudo-aléatoire propre à la manche (différent à chaque essai)
const roundRng = (g, extra = "") => g.practice ? Math.random : rng(`${g.k}|${g.fmt}|${g.manches[g.round].key}|${g.diffs[g.round]}|${g.tryIdx}|${g.round}|${extra}`);
// tire « per » éléments d'une réserve : ordre fixe du jour, tranche différente à chaque essai
function fromPool(g, pool, per, poolKey, shared) {
  if (!pool || !pool.length) return [];
  if (g.practice) return shuffle(pool).slice(0, per);
  const order = shuffle(pool.map((_, i) => i), rng(`${g.k}|${g.fmt}|${poolKey}`));
  const off = shared ? (g.tryIdx * 3 + g.round) * per : g.tryIdx * per;
  return Array.from({ length: per }, (_, i) => pool[order[(off + i) % order.length]]);
}
function beginTry() {
  // l'essai compte dès qu'il commence (évite d'abandonner pour retenter)
  if (!game.practice) { const mine = store.plays[game.k]; mine.push({ at: minutesNow(), score: 0, rounds: [] }); game.playIdx = mine.length - 1; save(); }
}
function persistScore() {
  if (game.practice || game.online) return; // en ligne, le score n'est enregistré qu'à la fin, par le serveur (srvSubmit)
  const p = store.plays[game.k][game.playIdx];
  p.score = game.score; p.rounds = game.manches.map((m, i) => ({ m: m.key, diff: game.diffs[i] ?? null, pts: game.roundPts[i] }));
  save();
}
function chooseDiff(d) {
  const g = game; g.diffs[g.round] = d;
  g.qs = E().build(g, g.manches[g.round], d) || [];
  g.qi = 0; persistScore(); startQuestion();
}
function startQuestion() {
  const g = game;
  stopTimer();
  g.phase = "q"; g.answer = null; g.st = {};
  if (E().start) E().start(g);
  renderGame();
}
/* attribue les points d'une question ou d'une manche et passe à la correction */
function award(base, o = {}) {
  const g = game; if (g.phase !== "q") return;
  stopTimer();
  const d = g.diffs[g.round], pts = Math.round(base * CONFIG.mult[d]);
  g.score += pts; g.roundPts[g.round] += pts;
  (o.learn || []).forEach(l => g.learned.push(l));
  (o.stamps || []).forEach(id => { if (!g.stamps.includes(id)) g.stamps.push(id); });
  g.answer = { base, pts, ans: o.ans || "", fact: o.fact || "", extra: o.extra || "" };
  g.phase = "reveal";
  buzz(base > 0 ? 12 : [30, 40, 30]); // retour tactile : court si juste, double si raté
  persistScore(); renderGame();
}
function nextStep() {
  const g = game; clearLater();
  if (g.qi < g.qs.length - 1) { g.qi++; startQuestion(); return; }
  if (g.round < (g.tuto ? 0 : 2)) { g.round++; g.phase = "diff"; renderGame(); return; }
  g.phase = "end"; finishTry(); renderGame();
}

/* ---------- chrono pour les jeux qui n'en avaient pas (v23) : une durée par question ou par manche, fin de chrono propre à chaque jeu ---------- */
const CHRONO = { carte: 30, frise: 25, plusmoins: 60, classement: 45, connexions: 150, motdujour: 90, quisuisje: 45, relier: 75, paysmystere: 180, distance: 20 }; // secondes
const chronoLabel = fmt => CHRONO[fmt] ? (CHRONO[fmt] >= 60 ? `${Math.floor(CHRONO[fmt] / 60)} min${CHRONO[fmt] % 60 ? " " + CHRONO[fmt] % 60 + " s" : ""}` : `${CHRONO[fmt]} s`) : "";
function chronoTimeout(g) { // temps écoulé : on valide ce qui est en cours, ou 0 point
  const q = g.qs[g.qi], st = g.st || {}, eng = FORMATS[g.fmt].eng, out = { ans: "Temps écoulé." };
  if (eng === "carte") { if (g.pin) answerCarte(); else award(0, { ...out, fact: q[5] }); }
  else if (eng === "frise") E().act(g, "validate");
  else if (eng === "plusmoins") { if (!st.lock) award(st.streak * 30, { ans: `Temps écoulé. Série de ${st.streak}.`, fact: PM_TXT[q.stat].f }); }
  else if (eng === "order") { if (st.order && st.order.length === q.items.length) E().act(g, "ordok"); else award(0, out); }
  else if (eng === "connex") cxEnd(g);
  else if (eng === "wordle") award(0, { ans: `Temps écoulé. Le mot était ${q.word}.`, fact: q.fact, learn: [{ t: q.word, f: q.fact }] });
  else if (eng === "clues") award(0, { ans: `Temps écoulé. C'était ${fr(q.ans)}.`, fact: q.fact, learn: [{ t: q.ans, f: q.fact }] });
  else if (eng === "pairs") award(Math.max(0, Math.round(FORMATS.relier.max * st.done.length / q.pairs.length) - st.mist * 15), { ans: `Temps écoulé : ${st.done.length} paire${st.done.length > 1 ? "s" : ""} sur ${q.pairs.length}.`, learn: q.pairs.map(p => ({ t: p[0], f: p[1] })) });
  else if (eng === "mystere") E().act(g, "myfail");
  else if (eng === "distance") E().act(g, "kmok");
  else award(0, out);
}
// appelée après chaque affichage : démarre le chrono de la question / manche, et l'affiche s'il manque
function chronoEnsure() {
  const g = game, secs = g && CHRONO[g.fmt]; if (!g || !secs || g.phase !== "q" || g.tuto) return;
  const key = g.round + ":" + g.qi;
  if (g.chronoKey !== key && !g.T && (!E().needsMap || MAP.ready) && !(g.st && g.st.wait)) { g.chronoKey = key; startTimer(secs, () => { if (game === g && g.phase === "q") chronoTimeout(g); }); }
  if (g.T && !document.getElementById("timer")) { const anchor = document.querySelector(".jokerline") || document.querySelector(".roundtag"); if (anchor) { anchor.insertAdjacentHTML("afterend", timerHTML(true)); tickTimer(); } }
}

/* ---------- chrono (barre animée, fin automatique) ---------- */
const timeFactor = () => 1; // « temps de réflexion » annulé (décision du propriétaire, 12 nov. 2026) : les chronos sont identiques pour tous
function startTimer(secs, onEnd) {
  const g = game; stopTimer();
  g.T = { t0: performance.now(), ms: secs * 1000 * timeFactor(), onEnd, bonus: 0 };
  tickTimer();
}
function addTime(secs) { if (game && game.T) game.T.bonus += secs * 1000; }
function timeLeft() { const T = game && game.T; return T ? Math.max(0, T.ms + T.bonus - (performance.now() - T.t0)) / 1000 : 0; }
function stopTimer() { if (game && game.T) { cancelAnimationFrame(game.T.raf); game.T = null; } }
function tickTimer() {
  const g = game, T = g && g.T; if (!T) return;
  const left = timeLeft(), tot = (T.ms + T.bonus) / 1000;
  const bar = document.getElementById("timerbar"), box = document.getElementById("timer"), txt = document.getElementById("timertxt");
  if (bar) bar.style.transform = `scaleX(${Math.max(0, left / tot)})`;
  if (box) box.classList.toggle("low", left < Math.min(5, tot / 3));
  if (txt) txt.textContent = Math.ceil(left) + " s";
  for (const th of [10, 5]) if (left <= th && tot > th + 2 && !(T.said || (T.said = {}))[th]) { T.said[th] = 1; announce(th + " secondes restantes"); }
  if (left <= 0) { const f = T.onEnd; g.T = null; f(); return; }
  T.raf = requestAnimationFrame(tickTimer);
}
const timerHTML = (big) => `<div class="timerrow ${big ? "big" : ""}"><div class="timer" id="timer" role="timer" aria-label="Temps restant" aria-live="off"><i id="timerbar"></i></div>${big ? `<span class="ttxt num" id="timertxt"></span>` : ""}</div>`;

/* ---------- fin d'essai : déblocages, carnet, succès, messages ---------- */
function finishTry() {
  const g = game;
  stopTimer();
  if (g.tuto) { g.newStamps = []; g.newUnlocks = []; g.newAch = []; return; } // manche d'essai : rien ne compte (ni carnet, ni stats, ni évolution)
  // carnet de voyage (aussi en entraînement)
  g.newStamps = g.stamps.filter(id => !store.carnet[id]);
  g.newStamps.forEach(id => store.carnet[id] = g.k);
  const st = store.stats; st.fmts[g.fmt] = (st.fmts[g.fmt] || 0) + 1;
  g.manches.forEach((m, i) => { if (g.roundPts[i] >= FORMATS[g.fmt].max * CONFIG.mult[g.diffs[i] ?? 0] * .999) st.perfect++; });
  { // déblocages et évolution : aussi après une partie d'entraînement
    const prog = progress(), seen = store.profile.seen || [];
    const now = unlockedIds(prog);
    g.newUnlocks = now.filter(id => !seen.includes(id)).map(id => { const [cat, iid] = id.split(":"); return { cat, it: ITEMS[cat].list.find(i => i.id === iid) }; });
    store.profile.seen = now;
    // évolution automatique quand un nouveau stade se débloque
    const evo = g.newUnlocks.filter(u => u.cat === "stage").map(u => +u.it.id);
    if (evo.length && store.profile.pet) store.profile.pet.stage = String(Math.max(...evo));
  }
  if (g.online) srvSubmit(g); // score envoyé au serveur (recalculé et plafonné là-bas)
  if (!g.practice && !g.online) {
    persistScore();
    const res = dayResults(g.k), me = res.played.find(r => r.me), r = rng(g.k + "|react|" + g.tryIdx);
    const others = BOTS.filter(b => res.played.some(p => p.id === b.id));
    if (others.length && me) {
      const b = others[Math.floor(r() * others.length)];
      const lines = me.pos === 1 ? [`${store.profile.name} qui prend la tête, on se calme`, `${fmtNum(me.best)} ?! Respect`] : [`Bien joué ${store.profile.name} !`, `Pas mal du tout ${store.profile.name}`, `Tu peux faire mieux au 2e essai`];
      (store.chat[g.k] = store.chat[g.k] || []).push({ from: b.id, text: lines[Math.floor(r() * lines.length)], at: Math.min(minutesNow() + 1, 1439) });
    }
  }
  g.newAch = checkAchievements();
  save();
}
