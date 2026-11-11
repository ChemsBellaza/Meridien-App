/* ============ MOTEURS DES NOUVEAUX JEUX ============ */

/* ---------- rafales supplémentaires : Qui est né avant ?, calcul éclair, suites ---------- */
const NA_GAP = [[50, 1e5], [12, 50], [1, 12]];
function duelItems(list, d, r, q, info) {
  const [lo, hi] = NA_GAP[d], out = [], used = new Set();
  const pool = shuffle(list, r);
  for (const a of pool) {
    if (out.length >= 40) break;
    if (used.has(a.name)) continue;
    const b = pool.find(x => x !== a && !used.has(x.name) && Math.abs(x.v - a.v) >= lo && Math.abs(x.v - a.v) < hi);
    if (!b) continue;
    used.add(a.name); used.add(b.name);
    const pair = r() < .5 ? [a, b] : [b, a], old = pair[0].v < pair[1].v ? 0 : 1;
    out.push({ text: q, opts: pair.map(x => x.name), ans: old, info: info(pair[old], pair[1 - old]) });
  }
  return out;
}
function friseEvents(keys, d) { const ev = []; keys.forEach(t => (DATA.frise[t] || []).forEach((lv, li) => { if (li <= Math.max(1, d)) lv.forEach(q => ev.push({ name: q[0], v: q[1] })); })); return ev; }
const RAF_EXTRA = {
  nperso: (g, d, r) => duelItems(BORN.map(([name, v]) => ({ name, v })), d, r, "Qui est né en premier ?", (a, b) => `${a.name} (${yearTxt(a.v)}) avant ${b.name} (${yearTxt(b.v)}).`),
  nevent: (g, d, r) => duelItems(friseEvents(["hist", "geopo"], d), d, r, "Lequel s'est passé en premier ?", (a, b) => `${yearTxt(a.v)}, puis ${yearTxt(b.v)}.`),
  nculture: (g, d, r) => duelItems(friseEvents(["sport", "sciences", "cine"], d), d, r, "Lequel est arrivé en premier ?", (a, b) => `${yearTxt(a.v)}, puis ${yearTxt(b.v)}.`),
  eclair: (g, d, r) => Array.from({ length: 40 }, () => calcItem(d, r)),
  suite: (g, d, r) => Array.from({ length: 30 }, () => suiteItem(d, r))
};
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
function numOpts(ans, r, near) {
  const set = new Set([ans]);
  const cands = shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ...(near || [])].filter(x => x > 0 && x !== ans), r);
  for (const c of cands) { if (set.size >= 4) break; set.add(c); }
  while (set.size < 4) set.add(ans + set.size * 3);
  const opts = shuffle([...set], r);
  return { opts: opts.map(fmtNum), ans: opts.indexOf(ans) };
}
function calcItem(d, r) {
  let text, ans, near = [];
  const t = r();
  if (d === 0) {
    if (t < .35) { const a = ri(r, 12, 69), b = ri(r, 8, 49); text = `${a} + ${b}`; ans = a + b; }
    else if (t < .65) { const a = ri(r, 30, 99), b = ri(r, 6, a - 5); text = `${a} − ${b}`; ans = a - b; }
    else { const a = ri(r, 3, 9), b = ri(r, 3, 12); text = `${a} × ${b}`; ans = a * b; near = [a * (b + 1), a * (b - 1)]; }
  } else if (d === 1) {
    if (t < .25) { const a = ri(r, 120, 899), b = ri(r, 25, 99); text = `${a} + ${b}`; ans = a + b; near = [ans + 100, ans - 100]; }
    else if (t < .5) { const a = ri(r, 200, 999), b = ri(r, 30, 199); text = `${a} − ${b}`; ans = a - b; near = [ans + 100, ans - 100]; }
    else if (t < .8) { const a = ri(r, 12, 29), b = ri(r, 3, 9); text = `${a} × ${b}`; ans = a * b; near = [a * (b + 1), a * (b - 1), ans + b]; }
    else { const b = ri(r, 3, 9), q = ri(r, 6, 19); text = `${b * q} ÷ ${b}`; ans = q; near = [q + 1, q - 1, q + 2]; }
  } else {
    if (t < .3) { const a = ri(r, 13, 49), b = ri(r, 11, 29); text = `${a} × ${b}`; ans = a * b; near = [ans + 10, ans - 10, a * (b + 1)]; }
    else if (t < .55) { const p = [5, 10, 15, 20, 25, 30, 40, 60, 75][ri(r, 0, 8)], n = ri(r, 2, 24) * 20; text = `${p} % de ${n}`; ans = p * n / 100; near = [ans + 5, ans - 5, ans * 2]; }
    else if (t < .8) { const b = ri(r, 6, 19), q = ri(r, 7, 26); text = `${b * q} ÷ ${b}`; ans = q; near = [q + 1, q - 1]; }
    else { const a = ri(r, 11, 25); text = `${a}²`; ans = a * a; near = [ans + a, ans - a, ans + 1]; }
  }
  const o = numOpts(ans, r, near);
  return { text: text + " = ?", big: true, opts: o.opts, ans: o.ans, info: `${text} = ${fmtNum(ans)}.` };
}
function suiteItem(d, r) {
  const kinds = [["add", "mul2"], ["add", "sub", "mul", "sq", "inc", "alt"], ["fib", "cube", "prime", "dbl1", "tri", "inter", "sq", "alt"]][d];
  const k = kinds[ri(r, 0, kinds.length - 1)];
  let s = [], why = "", near = [];
  if (k === "add") { const a = ri(r, 1, 20), st = ri(r, 2, 9); s = Array.from({ length: 6 }, (_, i) => a + st * i); why = `On ajoute ${st} à chaque fois.`; }
  if (k === "sub") { const st = ri(r, 3, 12), a = st * 6 + ri(r, 5, 40); s = Array.from({ length: 6 }, (_, i) => a - st * i); why = `On retire ${st} à chaque fois.`; }
  if (k === "mul2") { const a = ri(r, 1, 5); s = Array.from({ length: 6 }, (_, i) => a * 2 ** i); why = "On multiplie par 2 à chaque fois."; }
  if (k === "mul") { const a = ri(r, 1, 3), m = ri(r, 3, 4); s = Array.from({ length: 6 }, (_, i) => a * m ** i); why = `On multiplie par ${m} à chaque fois.`; }
  if (k === "sq") { const a = ri(r, 1, 6); s = Array.from({ length: 6 }, (_, i) => (a + i) ** 2); why = "Ce sont des carrés : " + (a) + "², " + (a + 1) + "², etc."; }
  if (k === "inc") { const a = ri(r, 1, 10), st = ri(r, 1, 3); s = [a]; for (let i = 1; i < 6; i++) s.push(s[i - 1] + st * i); why = `L'écart augmente de ${st} à chaque fois.`; }
  if (k === "alt") { const a = ri(r, 10, 30), p = ri(r, 4, 9), m = ri(r, 1, p - 1); s = [a]; for (let i = 1; i < 6; i++) s.push(s[i - 1] + (i % 2 ? p : -m)); why = `On ajoute ${p}, puis on retire ${m}, et ainsi de suite.`; near = [s[5] + p + m, s[5] - p - m]; }
  if (k === "fib") { const a = ri(r, 1, 4), b = ri(r, a, 6); s = [a, b]; for (let i = 2; i < 6; i++) s.push(s[i - 1] + s[i - 2]); why = "Chaque nombre est la somme des deux précédents."; }
  if (k === "cube") { const a = ri(r, 1, 3); s = Array.from({ length: 6 }, (_, i) => (a + i) ** 3); why = "Ce sont des cubes : " + a + "³, " + (a + 1) + "³, etc."; }
  if (k === "prime") { const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43], o = ri(r, 0, 7); s = P.slice(o, o + 6); why = "Ce sont les nombres premiers à la suite."; near = [s[5] + 2, s[5] - 2, s[5] + 1]; }
  if (k === "dbl1") { const a = ri(r, 1, 4); s = [a]; for (let i = 1; i < 6; i++) s.push(s[i - 1] * 2 + 1); why = "On multiplie par 2, puis on ajoute 1."; }
  if (k === "tri") { const o = ri(r, 1, 4); s = Array.from({ length: 6 }, (_, i) => (o + i) * (o + i + 1) / 2); why = "Nombres triangulaires : on ajoute 2, puis 3, puis 4…"; }
  if (k === "inter") { const a = ri(r, 1, 9), b = ri(r, 20, 40), p = ri(r, 2, 5), q = ri(r, 2, 6); s = [a, b, a + p, b - q, a + 2 * p, b - 2 * q]; why = `Deux suites mêlées : ${a}, ${a + p}, ${a + 2 * p}… et ${b}, ${b - q}, ${b - 2 * q}…`; near = [b - 3 * q, a + 4 * p]; }
  const ans = s[5], o = numOpts(ans, r, near);
  return { text: s.slice(0, 5).map(fmtNum).join(", ") + ", ?", big: true, opts: o.opts, ans: o.ans, info: `${fmtNum(ans)}. ${why}` };
}

/* ---------- Le compte est bon : une manche « calcul » avec trois sous-jeux ---------- */
const calcSub = () => (game && game.manches[game.round] && game.manches[game.round].key === "compte") ? ENG.compte : ENG.rafale;
ENG.calc = new Proxy({}, { get: (t, p) => calcSub()[p] });
const CB_BIG = [25, 50, 75, 100];
function cbPuzzle(d, r) {
  const ranges = [[20, 150], [100, 500], [101, 999]], ops = [[2, 3], [3, 4], [4, 5]][d];
  for (let tries = 0; tries < 400; tries++) {
    const nBig = [1, 2, 1][d] + (d === 2 && r() < .5 ? 1 : 0);
    const tiles = [...shuffle(CB_BIG, r).slice(0, nBig), ...Array.from({ length: 6 - nBig }, () => ri(r, 1, 10))];
    let pool = tiles.slice(), sol = [];
    const n = ri(r, ops[0], ops[1]);
    for (let k = 0; k < n && pool.length > 1; k++) {
      const i = Math.floor(r() * pool.length); let j = Math.floor(r() * (pool.length - 1)); if (j >= i) j++;
      let a = pool[i], b = pool[j]; if (b > a) [a, b] = [b, a];
      const op = ["+", "−", "×", "÷"][Math.floor(r() * 4)];
      let v = null;
      if (op === "+") v = a + b; else if (op === "−") v = a - b; else if (op === "×") v = (b === 1 ? null : a * b); else v = (b > 1 && a % b === 0 ? a / b : null);
      if (!v || v <= 0) { k--; if (r() < .1) break; continue; }
      pool = pool.filter((_, x) => x !== i && x !== j); pool.push(v); sol.push(`${a} ${op} ${b} = ${v}`);
    }
    const target = pool[pool.length - 1], [lo, hi] = ranges[d];
    if (target >= lo && target <= hi && !tiles.includes(target) && sol.length >= ops[0]) return { tiles: shuffle(tiles, r), target, sol };
  }
  return { tiles: [100, 25, 6, 5, 3, 2], target: 133, sol: ["100 + 25 = 125", "5 + 3 = 8", "125 + 8 = 133"] };
}
ENG.compte = {
  stepWord: "Tirage", nextWord: "Tirage suivant",
  diffHint: ["Cible jusqu'à 150, en 2 ou 3 calculs", "Cible de 100 à 500", "Cible jusqu'à 999, avec 4 ou 5 calculs"],
  build(g, m, d) { const r = roundRng(g); return [cbPuzzle(d, r), cbPuzzle(d, r)]; },
  start(g) {
    const q = g.qs[g.qi];
    g.st = { tiles: q.tiles.map((v, i) => ({ v, id: i, used: false, made: false })), sel: null, op: null, steps: [] };
    startTimer(60, compteEnd);
  },
  view(g) {
    const q = g.qs[g.qi], st = g.st, rev = g.phase === "reveal", best = cbBest(st, q.target);
    return `<div class="cbtarget"><span class="mono">Cible</span><b class="num">${q.target}</b><span class="note">Ton plus proche : <b class="num">${best}</b>${best === q.target ? " · le compte est bon !" : ""}</span></div>
      ${rev ? "" : timerHTML(true)}
      <div class="cbtiles">${st.tiles.filter(t => !t.used).map(t => `<button class="cbt ${t.made ? "made" : ""} ${st.sel === t.id ? "on" : ""}" data-g="cbt" data-v="${t.id}" ${rev ? "disabled" : ""}>${t.v}</button>`).join("")}</div>
      ${rev ? "" : `<div class="cbops">${["+", "−", "×", "÷"].map(o => `<button class="cbo ${st.op === o ? "on" : ""}" data-g="cbo" data-v="${o}" ${st.sel == null ? "disabled" : ""}>${o}</button>`).join("")}</div>`}
      <div class="typemsg" id="cbmsg" role="status">${st.sel != null && !rev ? (st.op ? "Touche le second nombre." : "Choisis une opération.") : ""}</div>
      ${st.steps.length ? `<ol class="cbsteps">${st.steps.map(s => `<li class="num">${s.txt}</li>`).join("")}</ol>` : `<p class="note center">${rev ? "" : "Touche un nombre, une opération, puis un autre nombre. Le résultat devient une nouvelle plaque."}</p>`}
      ${rev ? "" : `<div class="btnrow"><button class="btn ghost" data-g="cbundo" ${st.steps.length ? "" : "disabled"}>Annuler</button><button class="btn" data-g="cbok">Valider ${best}</button></div>`}`;
  },
  act(g, a, v) {
    if (g.phase !== "q") return;
    const st = g.st, q = g.qs[g.qi];
    if (a === "cbt") {
      const id = +v, t = st.tiles.find(x => x.id === id);
      if (st.sel == null || st.sel === id) { st.sel = st.sel === id ? null : id; st.op = null; renderGame(); return true; }
      if (!st.op) { st.sel = id; renderGame(); return true; }
      let x = st.tiles.find(y => y.id === st.sel).v, y = t.v, op = st.op, res = null;
      if (op === "+") res = x + y; else if (op === "×") res = x * y;
      else if (op === "−") { if (y > x) [x, y] = [y, x]; res = x - y; }
      else { if (y > x) [x, y] = [y, x]; res = x % y === 0 ? x / y : null; }
      if (!res || res <= 0) { flashMsg("cbmsg", op === "÷" ? `${koIco} La division doit tomber juste.` : `${koIco} Le résultat doit être positif.`, "bad"); return true; }
      const a1 = st.tiles.find(z => z.id === st.sel); a1.used = true; t.used = true;
      const nid = st.tiles.length; st.tiles.push({ v: res, id: nid, used: false, made: true });
      st.steps.push({ txt: `${x} ${op} ${y} = ${res}`, a: a1.id, b: t.id, n: nid });
      st.sel = null; st.op = null;
      if (res === q.target) { compteEnd(); return true; }
      renderGame(); return true;
    }
    if (a === "cbo") { if (st.sel != null) { st.op = st.op === v ? null : v; renderGame(); } return true; }
    if (a === "cbundo") { const s = st.steps.pop(); if (s) { st.tiles = st.tiles.filter(z => z.id !== s.n); st.tiles.forEach(z => { if (z.id === s.a || z.id === s.b) z.used = false; }); } st.sel = null; st.op = null; renderGame(); return true; }
    if (a === "cbok") { compteEnd(); return true; }
  },
  joker: { label: "+15 s", help: "Ajoute 15 secondes au chrono.", use() { addTime(15); } }
};
function cbBest(st, target) { let best = null; st.tiles.forEach(t => { if (!t.used && (best == null || Math.abs(t.v - target) < Math.abs(best - target))) best = t.v; }); return best; }
function compteEnd() {
  const g = game; if (!g || g.phase !== "q") return;
  const q = g.qs[g.qi], best = cbBest(g.st, q.target), diff = Math.abs(best - q.target);
  const f = diff === 0 ? 1 : diff <= 2 ? .7 : diff <= 5 ? .5 : diff <= 10 ? .3 : 0;
  award(Math.round(unitOf(g) * f), {
    ans: diff === 0 ? "Le compte est bon !" : `Tu arrives à ${best}, à ${diff} de la cible.`,
    fact: `Une solution : ${q.sol.join(" ; ")}.`,
    learn: diff ? [{ t: `Atteindre ${q.target}`, f: q.sol.join(" ; ") }] : []
  });
}

/* ---------- Pays mystère ---------- */
const MY_MAX = 8;
const myCen = id => { const s = MAP.shapes[id]; return s && s.cen ? { lon: s.cen[0], lat: s.cen[1] } : null; };
function bearing(a, b) {
  const t = Math.PI / 180, y = Math.sin((b.lon - a.lon) * t) * Math.cos(b.lat * t);
  const x = Math.cos(a.lat * t) * Math.sin(b.lat * t) - Math.sin(a.lat * t) * Math.cos(b.lat * t) * Math.cos((b.lon - a.lon) * t);
  return (Math.atan2(y, x) / t + 360) % 360;
}
const ARROWS = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"], DIRS = ["nord", "nord-est", "est", "sud-est", "sud", "sud-ouest", "ouest", "nord-ouest"];
const heatOf = km => km < 500 ? 4 : km < 1000 ? 3 : km < 2000 ? 2 : km < 3500 ? 1 : 0;
ENG.mystere = {
  needsMap: true, board: true, focus: "typein",
  diffHint: ["Des pays connus", "Des pays moins évidents", "Des pays méconnus"],
  build(g, m) { return [{ cont: m.key }]; },
  start(g) {
    const cont = g.qs[0].cont;
    g.mbox = CONTS[cont].box; g.view = view0();
    g.st = { guesses: [], target: null, sel: null, cap: false, done: false };
    if (MAP.ready) myPick(g); else g.st.wait = true;
  },
  view(g) {
    const st = g.st, rev = g.phase === "reveal", cont = g.qs[0].cont;
    if (!MAP.ready) return `<div class="mapwrap"><div class="mapfail">${MAP.failed ? `La carte n'a pas pu se charger.<br><br><button class="smallbtn" data-g="myfail">Passer la manche (0 pt)</button>` : "Chargement de la carte…"}</div></div>`;
    const T = CBY[st.target], heat = {};
    st.guesses.forEach(x => heat[x.id] = x.id === st.target ? "ok" : "h" + heatOf(x.km));
    if (rev && !heat[st.target]) heat[st.target] = "miss";
    const list = st.guesses.slice().sort((a, b) => a.km - b.km);
    return `${rev ? "" : `<div class="myhead"><span class="mono">Essais</span><span class="mydots">${Array.from({ length: MY_MAX }, (_, k) => `<i class="${k < st.guesses.length ? "on" : ""}"></i>`).join("")}</span><b class="num">${st.guesses.length}/${MY_MAX}</b></div>`}
      ${st.cap && !rev ? `<p class="note center">Indice : sa capitale est <b>${esc(T.cap || "—")}</b>.</p>` : ""}
      <div class="mapwrap sprint">${countriesSVG(CONTS[cont].box, "map", g.view, id => heat[id] || "", "Carte : " + CONTS[cont].label)}${zoomCtl()}</div>
      ${rev ? "" : `<div id="mysel" class="mysel">${mySelHTML(st)}</div>${typeBox("Un pays…")}<div class="pchips" id="mysug"></div>`}
      ${list.length ? `<div class="mylist">${list.map(x => `<div class="myrow h${x.id === st.target ? "ok" : heatOf(x.km)}"><span>${flagOf(CBY[x.id])} ${esc(CBY[x.id].name)}</span>${x.id === st.target ? `<b>Trouvé !</b>` : `<b class="num">${fmtNum(x.km)} km <span class="arr" aria-label="vers le ${DIRS[x.dir]}">${ARROWS[x.dir]}</span></b>`}</div>`).join("")}</div>` : rev ? "" : `<p class="note center">Écris un pays ou touche-le sur la carte. La flèche indique la direction du pays mystère.</p>`}`;
  },
  type(g, val, submit) {
    const st = g.st; if (g.phase !== "q" || !st.target) return;
    if (!submit) { mySuggest(val); return false; }
    const c = myFind(val);
    if (!c) { flashMsg("typemsg", `${koIco} Pays inconnu`, "bad"); return false; }
    return myGuess(g, c.id);
  },
  act(g, a, v) {
    if (a === "myfail" && g.phase === "q") { award(0, { ans: "Manche passée." }); return true; }
    if (a === "mysug" || a === "mygo") { if (g.phase === "q") { const t = document.getElementById("typein"); if (t) t.value = ""; myGuess(g, v); } return true; }
  },
  onTap(g, p, e) {
    const st = g.st; if (g.phase !== "q" || !st.target) return;
    const el = document.elementFromPoint(e.clientX, e.clientY), hit = el && el.closest && el.closest("path[data-id]");
    const id = hit && hit.dataset.id; if (!id || !CBY[id]) return;
    st.sel = id; const box = document.getElementById("mysel"); if (box) box.innerHTML = mySelHTML(st);
  },
  after(g) {
    if (g.st.wait && MAP.ready && g.phase === "q") { g.st.wait = false; myPick(g); renderGame(); return; }
    const svg = document.getElementById("map"); if (svg) bindMap(svg);
  },
  joker: { label: "Capitale", help: "Révèle la capitale du pays mystère.", use(g) { g.st.cap = true; renderGame(); } }
};
function myPick(g) {
  const cont = g.qs[0].cont, d = g.diffs[g.round];
  const q = countryQueue(cont, d, roundRng(g, "q"), c => c.cont === cont && myCen(c.id));
  g.st.target = q.length ? q[0].id : "FRA";
}
const mySelHTML = st => st.sel ? `<button class="smallbtn" data-g="mygo" data-v="${st.sel}">${flagOf(CBY[st.sel])} Proposer : ${esc(CBY[st.sel].name)}</button>` : "";
function myFind(val) {
  const x = norm(val); if (!x) return null;
  return COUNTRIES.find(c => countryKeys(c).includes(x)) || COUNTRIES.find(c => matchKeys(val, countryKeys(c)));
}
function mySuggest(val) {
  const box = document.getElementById("mysug"); if (!box) return;
  const x = norm(val); if (x.length < 2) { box.innerHTML = ""; return; }
  const used = new Set(game.st.guesses.map(y => y.id));
  const hits = COUNTRIES.filter(c => myCen(c.id) && !used.has(c.id) && countryKeys(c).some(k => k.startsWith(x))).slice(0, 4);
  box.innerHTML = hits.map(c => `<button class="pchip sug" data-g="mysug" data-v="${c.id}">${flagOf(c)} ${esc(c.name)}</button>`).join("");
}
function myGuess(g, id) {
  const st = g.st;
  if (st.guesses.some(x => x.id === id)) { flashMsg("typemsg", "Déjà proposé", ""); return true; }
  const a = myCen(id), b = myCen(st.target);
  if (!a) { flashMsg("typemsg", "Ce pays est trop petit pour la carte : essaie un voisin.", ""); return true; }
  const km = Math.round(haversine(a, b) / 10) * 10, dir = Math.round(bearing(a, b) / 45) % 8;
  st.guesses.push({ id, km, dir }); st.sel = null;
  const T = CBY[st.target], n = st.guesses.length;
  if (id === st.target) {
    award(Math.round(unitOf(g) * Math.max(.3, 1 - .1 * (n - 1))), { ans: `Trouvé en ${n} essai${n > 1 ? "s" : ""} : ${T.name}.`, fact: T.cap ? `Capitale : ${T.cap}. ${fmtPop(T.pop)}.` : "", stamps: [T.id], learn: [{ t: `${flagOf(T)} ${T.name}`, f: T.cap ? `capitale ${T.cap}` : "" }] });
    return true;
  }
  if (n >= MY_MAX) { award(0, { ans: `Raté. C'était ${leN(T)}.`, fact: T.cap ? `Capitale : ${T.cap}. ${fmtPop(T.pop)}.` : "", learn: [{ t: `${flagOf(T)} ${T.name}`, f: T.cap ? `capitale ${T.cap}` : "" }] }); return true; }
  g._keepScroll = true; renderGame(); g._keepScroll = false;
  return true;
}

/* ---------- Distance ---------- */
const DIST_MIN = { france: 150, europe: 400, monde: 2000 }, DIST_MAX = { france: 1200, europe: 5000, monde: 20000 };
const DIST_STEP = { france: [10, 50], europe: [50, 250], monde: [100, 1000] }, DIST_REG = { france: "france", europe: "europe", monde: "world" };
const DIST_TOL = [.1, .06, .03];
ENG.distance = {
  diffHint: ["Tous les points à 10 % près", "Tous les points à 6 % près", "Tous les points à 3 % près"],
  build(g, m, d) {
    const r = roundRng(g), L = CITIES[m.key], out = [], used = new Set();
    for (let t = 0; t < 300 && out.length < 3; t++) {
      const a = L[Math.floor(r() * L.length)], b = L[Math.floor(r() * L.length)];
      if (a === b || used.has(a[0]) || used.has(b[0])) continue;
      const km = haversine({ lat: a[1], lon: a[2] }, { lat: b[1], lon: b[2] });
      if (km < DIST_MIN[m.key] || km > DIST_MAX[m.key] * .95) continue;
      used.add(a[0]); used.add(b[0]);
      out.push({ a, b, km: Math.round(km), kind: m.key });
    }
    return out;
  },
  start(g) {
    const q = g.qs[g.qi], max = DIST_MAX[q.kind], r = rng(g.k + "|" + q.a[0] + q.b[0]), st = DIST_STEP[q.kind][0];
    let v; do { v = Math.round((max * (.05 + .9 * r())) / st) * st; } while (Math.abs(v - q.km) < q.km * .3);
    g.km = v;
  },
  view(g) {
    const q = g.qs[g.qi], rev = g.phase === "reveal", [s1, s2] = DIST_STEP[q.kind];
    return `<div><div class="mono muted" style="margin-bottom:4px">À vol d'oiseau</div><h2 class="qtitle">${esc(q.a[0])} – ${esc(q.b[0])}</h2></div>
      ${rev && MAP.ready ? `<div class="mapwrap">${distMap(q)}</div>` : ""}
      <div class="yearbig num" id="kmbig">${fmtNum(g.km)} <small>KM</small></div>
      ${rev ? "" : `<input type="range" id="kmr" min="0" max="${DIST_MAX[q.kind]}" step="${s1}" value="${g.km}" aria-label="Distance en kilomètres">
      <div class="yearctl"><button data-g="km" data-v="-${s2}">−${fmtNum(s2)}</button><button data-g="km" data-v="-${s1}">−${s1}</button><button data-g="km" data-v="${s1}">+${s1}</button><button data-g="km" data-v="${s2}">+${fmtNum(s2)}</button></div>
      <button class="btn" data-g="kmok">Valider</button>`}`;
  },
  act(g, a, v) {
    if (g.phase !== "q") return;
    const q = g.qs[g.qi];
    if (a === "km") { g.km = Math.max(0, Math.min(DIST_MAX[q.kind], g.km + (+v))); distSync(); return true; }
    if (a === "kmok") {
      const err = Math.abs(g.km - q.km) / q.km, tol = DIST_TOL[g.diffs[g.round]];
      const f = err <= tol ? 1 : Math.max(0, 1 - (err - tol) / .45);
      award(Math.round(unitOf(g) * f), { ans: `Réponse : ${fmtNum(q.km)} km. Tu as dit ${fmtNum(g.km)} km, soit ${Math.round(err * 100)} % d'écart.`,
        fact: `${q.a[0]} et ${q.b[0]} sont séparées par ${fmtNum(q.km)} km à vol d'oiseau.`, learn: [{ t: `${q.a[0]} – ${q.b[0]}`, f: `${fmtNum(q.km)} km` }] });
      return true;
    }
  }
};
document.addEventListener("input", e => { if (game && e.target.id === "kmr") { game.km = +e.target.value; distSync(); } });
function distSync() { const b = document.getElementById("kmbig"); if (b) b.innerHTML = `${fmtNum(game.km)} <small>KM</small>`; const r = document.getElementById("kmr"); if (r && +r.value !== game.km) r.value = game.km; }
function distMap(q) {
  const rk = DIST_REG[q.kind], c = regionView(rk).c, A = { x: q.a[2] * c, y: -q.a[1] }, B = { x: q.b[2] * c, y: -q.b[1] };
  const s = Math.min(regionView(rk).vb[2], Math.max(Math.abs(A.x - B.x) * 1.5, regionView(rk).vb[2] / 2.5)) / 34;
  const dot = (p, name) => `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(s * .45)}" fill="#E8483B" style="stroke:var(--ink)" stroke-width="2" vector-effect="non-scaling-stroke"/><text x="${f1(p.x)}" y="${f1(p.y - s * .8)}" text-anchor="middle" font-size="${f1(s * 1.1)}" font-weight="900" font-family="Nunito, sans-serif" style="fill:var(--ink);stroke:var(--paper);stroke-width:${f1(s * .3)}px;paint-order:stroke">${esc(name)}</text>`;
  let line;
  if (Math.abs(q.a[2] - q.b[2]) > 180) { // passe par le Pacifique : deux segments
    const sh = q.a[2] < q.b[2] ? 360 * c : -360 * c;
    line = `<line x1="${f1(A.x)}" y1="${f1(A.y)}" x2="${f1(B.x - sh)}" y2="${f1(B.y)}" vector-effect="non-scaling-stroke"/><line x1="${f1(A.x + sh)}" y1="${f1(A.y)}" x2="${f1(B.x)}" y2="${f1(B.y)}" vector-effect="non-scaling-stroke"/>`;
  } else line = `<line x1="${f1(A.x)}" y1="${f1(A.y)}" x2="${f1(B.x)}" y2="${f1(B.y)}" vector-effect="non-scaling-stroke"/>`;
  // cadrage sur les deux villes (sans dépasser la région)
  const vb = regionView(rk).vb, ratio = vb[3] / vb[2], wrap = Math.abs(q.a[2] - q.b[2]) > 180;
  let view = null;
  if (!wrap) {
    const w = Math.min(vb[2], Math.max(Math.abs(A.x - B.x) * 1.5, Math.abs(A.y - B.y) * 1.5 / ratio, vb[2] / 2.5)), h = w * ratio;
    view = { x: (A.x + B.x) / 2 - w / 2, y: (A.y + B.y) / 2 - h / 2, w, h };
  }
  return mapSVG(rk, `<g style="stroke:var(--ink)" stroke-width="2.5" stroke-dasharray="6 4">${line}</g>${dot(A, q.a[0])}${dot(B, q.b[0])}`, "", view);
}

/* ---------- Chaîne de mots ---------- */
const CH_MIN = [0, 5, 7];
const chLetters = s => norm(s).replace(/[^a-z]/g, "");
const chLast = s => { const x = chLetters(s); return x[x.length - 1]; };
ENG.chaine = {
  board: true, focus: "typein",
  diffHint: ["Tous les mots comptent", "Mots de 5 lettres ou plus", "Mots de 7 lettres ou plus"],
  build(g, m, d) { return [{ kind: m.key, min: CH_MIN[d] }]; },
  start(g) {
    const q = g.qs[0];
    g.st = { chain: [], used: new Set(), found: 0, r: roundRng(g, "ch") };
    chRestart(g, true);
    startTimer(FORMATS.chaine.secs, chEnd);
  },
  view(g) {
    const q = g.qs[0], st = g.st, rev = g.phase === "reveal";
    const cur = st.chain[st.chain.length - 1], L = cur ? chLast(cur.w).toUpperCase() : "";
    const chips = st.chain.map((x, i) => `<span class="pchip ${x.start ? "" : "ok"}">${esc(x.w)}</span>`).join(`<span class="charr" aria-hidden="true">›</span>`);
    if (rev) return `<div class="chchain">${chips}</div>`;
    return `${timerHTML(true)}
      <div class="chcur"><span class="mono">${esc(FORMATS.chaine.kinds[q.kind].label)}${q.min ? ` · ${q.min} lettres ou plus` : ""}</span><b id="chword">${chWordHTML(cur)}</b><span class="note" id="chhint">${chHint(g)}</span></div>
      ${typeBox(`Un mot en ${L}…`)}
      <div class="btnline center"><span class="count num" id="chcount">${st.found}<small> mot${st.found > 1 ? "s" : ""}</small></span><button class="smallbtn ghost" data-g="chskip">Autre mot de départ</button></div>
      <div class="chchain" id="chchain">${chips}</div>`;
  },
  type(g, val, submit) {
    const q = g.qs[0], st = g.st, cur = st.chain[st.chain.length - 1], L = chLast(cur.w), x = norm(val);
    if (!x) return;
    const list = chList(q);
    const hit = list.find(e => (submit ? matchKeys(val, e.keys) : e.keys.includes(x)));
    if (!hit) { if (submit) flashMsg("typemsg", x[0] !== L ? `${koIco} Il faut un mot en ${L.toUpperCase()}` : `${koIco} Pas dans notre liste`, "bad"); return; }
    const key = e => e.keys[0];
    if (chLetters(e2w(hit, x))[0] !== L) { if (submit) flashMsg("typemsg", `${koIco} Il faut un mot en ${L.toUpperCase()}`, "bad"); return submit; }
    if (st.used.has(key(hit))) { if (submit) flashMsg("typemsg", "Déjà dans la chaîne", ""); return submit; }
    st.used.add(key(hit)); st.found++;
    st.chain.push({ w: e2w(hit, x), start: false });
    flashMsg("typemsg", `${okIco} ${esc(e2w(hit, x))}`, "ok");
    if (!chOptions(g).length) { flashMsg("typemsg", "Impasse : nouveau mot de départ", ""); chRestart(g, false); }
    chRefresh(g);
    return true;
  },
  act(g, a) { if (a === "chskip" && g.phase === "q") { chRestart(g, false); chRefresh(g); const t = document.getElementById("typein"); if (t) { t.value = ""; t.focus(); } return true; } },
  joker: { label: "+15 s", help: "Ajoute 15 secondes au chrono.", use() { addTime(15); } }
};
// mot affiché : l'alias tapé s'il correspond exactement, sinon le nom principal
const e2w = (e, x) => { const i = e.keys.indexOf(x); return i >= 0 && e.al && e.al[i] ? e.al[i] : e.label; };
function chList(q) {
  const D = pbDict(), src = D[q.kind] || [];
  const key = "_ch" + q.kind + q.min; if (chList[key]) return chList[key];
  return chList[key] = src.filter(e => chLetters(e.label).length >= q.min && chLetters(e.label).length >= 3);
}
// mots courants seulement (départs, compteur d'aide)
function chCommon(q) { const key = "_cc" + q.kind + q.min; return chList[key] || (chList[key] = chList(q).filter(e => !e.x));
}
function chOptions(g) {
  const q = g.qs[0], st = g.st, cur = st.chain[st.chain.length - 1], L = chLast(cur.w);
  return chCommon(q).filter(e => !st.used.has(e.keys[0]) && chLetters(e.label)[0] === L);
}
function chRestart(g, first) {
  const q = g.qs[0], st = g.st, list = chCommon(q);
  const ok = list.filter(e => !st.used.has(e.keys[0]) && list.filter(f => f !== e && !st.used.has(f.keys[0]) && chLetters(f.label)[0] === chLast(e.label)).length >= 3);
  const e = (ok.length ? ok : list)[Math.floor(st.r() * (ok.length || list.length))];
  st.used.add(e.keys[0]); st.chain.push({ w: e.label, start: true });
}
const chWordHTML = cur => { if (!cur) return ""; const w = cur.w, i = w.length - [...w].reverse().findIndex(ch => /[a-zà-ÿ]/i.test(ch)) - 1; return `${esc(w.slice(0, i))}<span class="last">${esc(w[i])}</span>${esc(w.slice(i + 1))}`; };
const chHint = g => { const n = chOptions(g).length; return `${n} mot${n > 1 ? "s" : ""} possible${n > 1 ? "s" : ""} en ${chLast(g.st.chain[g.st.chain.length - 1].w).toUpperCase()}`; };
function chRefresh(g) {
  const st = g.st, cur = st.chain[st.chain.length - 1];
  const w = document.getElementById("chword"); if (w) w.innerHTML = chWordHTML(cur);
  const h = document.getElementById("chhint"); if (h) h.textContent = chHint(g);
  const c = document.getElementById("chcount"); if (c) c.innerHTML = `${st.found}<small> mot${st.found > 1 ? "s" : ""}</small>`;
  const ch = document.getElementById("chchain"); if (ch) ch.innerHTML = st.chain.map(x => `<span class="pchip ${x.start ? "" : "ok"}">${esc(x.w)}</span>`).join(`<span class="charr" aria-hidden="true">›</span>`);
  const t = document.getElementById("typein"); if (t) t.placeholder = `Un mot en ${chLast(cur.w).toUpperCase()}…`;
}
function chEnd() {
  const g = game; if (!g || g.phase !== "q") return;
  const st = g.st, n = st.found;
  award(n * 25, { ans: `${n} mot${n > 1 ? "s" : ""} enchaîné${n > 1 ? "s" : ""}.`, fact: "Les lettres finales les plus piégeuses sont souvent le E, le A et le I : beaucoup de mots finissent par elles.", learn: [] });
}

/* ---------- Anagrammes ---------- */
const AN_LEN = [[4, 6], [7, 8], [9, 30]];
const oneWord = s => /^[A-Za-zÀ-ÿ]+$/.test(s);
function anPool(kind, d) {
  const [lo, hi] = AN_LEN[d], D = pbDict();
  const src = kind === "pays" ? COUNTRIES.map(c => ({ label: c.name, keys: countryKeys(c) }))
    : kind === "capitale" ? COUNTRIES.filter(c => c.cap).map(c => ({ label: c.cap, keys: capKeys(c) }))
    : kind === "animal" ? D.animal.filter(e => !e.x).map(e => ({ label: e.label, keys: e.keys }))
    : FILMS1.map(f => ({ label: f, keys: [norm(f)] }));
  return src.filter(e => oneWord(e.label) && chLetters(e.label).length >= lo && chLetters(e.label).length <= hi);
}
function scramble(w, r) {
  const L = chLetters(w).toUpperCase().split("");
  for (let t = 0; t < 30; t++) { const s = shuffle(L, r).join(""); if (s !== L.join("") && s !== L.slice().reverse().join("")) return s; }
  return L.slice().reverse().join("");
}
ENG.anagram = {
  board: true, focus: "typein",
  diffHint: ["Mots de 4 à 6 lettres", "Mots de 7 ou 8 lettres", "Mots de 9 lettres et plus"],
  build(g, m, d) {
    const r = roundRng(g), items = fromPool(g, anPool(m.key, d), 5, `an|${m.key}|${d}`);
    return [{ kind: m.key, items: items.map(e => ({ ...e, mix: scramble(e.label, r) })) }];
  },
  start(g) { g.st = { i: 0, found: [], missed: [], first: false }; startTimer(FORMATS.anagrammes.secs, anEnd); },
  view(g) {
    const q = g.qs[0], st = g.st, rev = g.phase === "reveal";
    if (rev) return "";
    const it = q.items[st.i], K = FORMATS.anagrammes.kinds[q.kind];
    return `${timerHTML(true)}
      <div class="anhead"><span class="mono">${esc(K.label)} · mot ${st.i + 1}/${q.items.length} · ${it.mix.length} lettres</span><span class="count num">${st.found.length}<small> ✓</small></span></div>
      <div class="antiles" id="antiles">${anTiles(it, st)}</div>
      ${typeBox("Ta réponse…")}
      <div class="btnline center"><button class="smallbtn ghost" data-g="anskip">Passer ce mot</button></div>`;
  },
  type(g, val, submit) {
    const q = g.qs[0], st = g.st, it = q.items[st.i];
    if (submit ? matchKeys(val, it.keys) : exactKeys(val, it.keys)) { st.found.push(st.i); flashMsg("typemsg", `${okIco} ${esc(it.label)}`, "ok"); anNext(g); return true; }
    if (submit) flashMsg("typemsg", `${koIco} Ce n'est pas ça`, "bad");
  },
  act(g, a) { if (a === "anskip" && g.phase === "q") { const it = g.qs[0].items[g.st.i]; g.st.missed.push(g.st.i); flashMsg("typemsg", `C'était ${esc(it.label)}`, "bad"); anNext(g); return true; } },
  joker: { label: "1re lettre", help: "Montre la première lettre de chaque mot restant.", use(g) { g.st.first = true; const t = document.getElementById("antiles"); if (t) t.innerHTML = anTiles(g.qs[0].items[g.st.i], g.st); } }
};
function anTiles(it, st) {
  const first = chLetters(it.label)[0].toUpperCase(); let used = false;
  return it.mix.split("").map(ch => { const hl = st.first && !used && ch === first; if (hl) used = true; return `<span class="ant ${hl ? "hl" : ""}">${ch}</span>`; }).join("");
}
function anNext(g) {
  const st = g.st, q = g.qs[0]; st.i++;
  if (st.i >= q.items.length) { later(anEnd, 350); return; }
  g._keepScroll = true; renderGame(); g._keepScroll = false;
  const t = document.getElementById("typein"); if (t) t.focus();
}
function anEnd() {
  const g = game; if (!g || g.phase !== "q") return;
  const st = g.st, q = g.qs[0];
  const row = (i, ok) => `<div class="lrow ${ok ? "ok" : "miss"}"><span class="num">${esc(q.items[i].mix)}</span><b>${esc(q.items[i].label)}</b></div>`;
  const miss = q.items.map((_, i) => i).filter(i => !st.found.includes(i));
  award(st.found.length * 60, { ans: `${st.found.length} mot${st.found.length > 1 ? "s" : ""} sur ${q.items.length}.`,
    extra: `<div class="lrows">${st.found.map(i => row(i, true)).join("")}${miss.map(i => row(i, false)).join("")}</div>`,
    learn: miss.length ? [{ t: "Anagrammes manquées", f: miss.map(i => `${q.items[i].mix} → ${q.items[i].label}`).join(", ") }] : [] });
}
