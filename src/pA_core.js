/* ---------- utilitaires ---------- */
const $app = document.getElementById("app");
const pad = n => String(n).padStart(2, "0");
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const diffDays = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 864e5);
// En ligne, le jour et l'heure viennent du SERVEUR (srvToday / srvMinutes, pS_server.js) : changer la date du téléphone ne sert plus à rien.
const today = () => (typeof srvToday === "function" && srvToday()) || keyOf(new Date());
const minutesNow = () => { const m = typeof srvMinutes === "function" ? srvMinutes() : null; if (m !== null) return m; const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const hm = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const mod = (a, n) => ((a % n) + n) % n;
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MONTHS_FULL = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DOW = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const shortDate = k => { const d = parseKey(k); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const longDate = k => { const d = parseKey(k); return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS_FULL[d.getMonth()]}`; };
const issueNo = k => Math.max(1, diffDays(CONFIG.seasonAnchor, k) + 1);
const fmtNum = n => Math.round(n).toLocaleString("fr-FR");
const fmtMult = m => "×" + String(m).replace(".", ",");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fr = s => esc(s).replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« "); // espaces insécables à la française (écrits en   : un copier-coller les perdrait)
const yearTxt = y => y < 0 ? `${-y} av. J.-C.` : String(y);
const reduceMotion = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}
function rng(seed) {
  let a = hashSeed(seed);
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle(arr, r = Math.random) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pickN = (arr, n, r = Math.random) => shuffle(arr, r).slice(0, n);

/* ---------- saisie tolérante ---------- */
function norm(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae")
    .replace(/[’'`´]/g, " ").replace(/[^a-z0-9]+/g, " ").replace(/\b(st)\b/g, "saint").replace(/\b(ste)\b/g, "sainte")
    .replace(/^(le|la|les|l|the|el|un|une|des|du|de) /, "").trim();
}
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length; if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
const tolOf = len => len >= 9 ? 2 : len >= 5 ? 1 : 0;
// renvoie true si la saisie correspond à l'une des clés (déjà normalisées)
function matchKeys(input, keys, fuzzy = true) {
  const x = norm(input); if (!x) return false;
  for (const k of keys) {
    if (x === k) return true;
    if (fuzzy && Math.abs(x.length - k.length) <= 2 && lev(x, k) <= tolOf(k.length)) return true;
  }
  return false;
}
const exactKeys = (input, keys) => { const x = norm(input); return !!x && keys.includes(x); };
const countryKeys = c => [c.name, ...c.alt].map(norm);
const capKeys = c => [c.cap, ...c.capAlt].filter(Boolean).map(norm);

/* ---------- stockage local ---------- */
const LS_KEY = "meridien.v1";
const SCHEMA = 4;
const emptyStore = () => ({ v: SCHEMA, profile: null, plays: {}, chat: {}, carnet: {}, spent: 0, stats: { fmts: {}, perfect: 0, best: {} }, react: {}, ach: {}, prefs: { time: 1 }, pending: [] });
// migrations : chaque entrée fait passer de la version N à N+1 sans jamais effacer le profil
// v2 → v3 : les profils existants n'ont pas de tutoriel et gardent tous les systèmes débloqués (`legacy`)
const MIGRATIONS = {
  1: s => Object.assign(s, { v: 2 }),
  2: s => { if (s.profile && !s.profile.tuto) s.profile.tuto = { done: true, legacy: true, seen: {} }; return Object.assign(s, { v: 3 }); },
  3: s => Object.assign(s, { v: 4, prefs: Object.assign({ time: 1 }, s.prefs) }) // v3 → v4 : réglages d'accessibilité (temps de réflexion)
};
function loadStore() {
  try {
    let s = JSON.parse(localStorage.getItem(LS_KEY));
    if (s && typeof s === "object") {
      while (s.v < SCHEMA && MIGRATIONS[s.v]) s = MIGRATIONS[s.v](s);
      if (s.v === SCHEMA) return Object.assign(emptyStore(), s);
    }
  } catch (e) { console.warn("Lecture de la sauvegarde impossible", e); }
  return emptyStore();
}
let store = loadStore();
if (store.profile && store.profile.pet && !(store.profile.pet.species in SPECIES)) store.profile.pet = null; // anciens familiers
let saveFailed = false;
function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(store)); if (saveFailed) { saveFailed = false; showSaveWarn(false); } }
  catch (e) { if (!saveFailed) { saveFailed = true; showSaveWarn(true); } }
}
function showSaveWarn(on) {
  let el = document.getElementById("savewarn");
  if (!on) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement("div"); el.id = "savewarn"; el.className = "savewarn"; el.setAttribute("role", "alert"); document.body.appendChild(el); }
  el.textContent = "Sauvegarde impossible : l'espace de ton appareil est plein ou bloqué. Tes progrès risquent d'être perdus.";
}
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} // demande un stockage non purgeable
try { if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(() => {}); } catch (e) {} // hors ligne (PWA)

/* ---------- accessibilité : langue, annonces, minuteries, focus ---------- */
document.documentElement.lang = "fr";
if (!document.querySelector('meta[name="viewport"]')) { const m = document.createElement("meta"); m.name = "viewport"; m.content = "width=device-width,initial-scale=1,viewport-fit=cover"; document.head.appendChild(m); }
function announce(text) { // région vocale unique, lue par les lecteurs d'écran sans déplacer le focus
  let el = document.getElementById("live");
  if (!el) { el = document.createElement("div"); el.id = "live"; el.className = "sr"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); el.setAttribute("aria-atomic", "true"); document.body.appendChild(el); }
  el.textContent = ""; setTimeout(() => { el.textContent = String(text).replace(/<[^>]+>/g, ""); }, 40);
}
const timers = new Set(); // registre : tout est annulé quand on change d'écran
function later(fn, ms) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; }
function clearLater() { timers.forEach(clearTimeout); timers.clear(); }
// remplace le contenu de #app en gardant le focus sur le même contrôle (clavier et lecteur d'écran)
function focusKey(el) {
  if (!el || el === document.body || !el.closest || !el.closest("#app")) return null;
  if (el.id) return "#" + CSS.escape(el.id);
  const d = el.dataset || {};
  for (const k of ["act", "g", "pick", "id"]) if (d[k] !== undefined) return `[data-${k}="${CSS.escape(d[k])}"]` + (d.v !== undefined ? `[data-v="${CSS.escape(d.v)}"]` : "");
  return null;
}
/* fenêtres modales : focus piégé, Échap pour fermer, retour du focus à l'ouverture */
let dlgOpener = null, dlgOpen = false, dlgLabel = "";
const FOCUSABLE = 'button:not([disabled]),a[href],input:not([disabled]):not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])';
function currentDialog() { return document.querySelector(".confirm [role=dialog]") || document.querySelector(".sheet[role=dialog]"); }
function manageDialog(openerKey) {
  const d = currentDialog();
  if (d && (!dlgOpen || d.getAttribute("aria-label") !== dlgLabel)) {
    if (!dlgOpen) dlgOpener = openerKey;
    dlgOpen = true; dlgLabel = d.getAttribute("aria-label");
    d.setAttribute("aria-modal", "true"); d.setAttribute("tabindex", "-1");
    const f = [...d.querySelectorAll(FOCUSABLE)].find(n => !n.hidden && n.type !== "file" && !n.closest("[hidden]")); (f || d).focus({ preventScroll: true });
  } else if (!d && dlgOpen) {
    dlgOpen = false; const k = dlgOpener; dlgOpener = null;
    let o = null; try { o = k && $app.querySelector(k); } catch (e) {}
    (o || document.querySelector('[data-act="menu"]') || {focus() {}}).focus({ preventScroll: true });
  } else if (d) { d.setAttribute("aria-modal", "true"); }
}
document.addEventListener("keydown", e => {
  const d = currentDialog(); if (!d) return;
  if (e.key === "Escape") {
    e.preventDefault();
    const b = d.querySelector('[data-act="confirm-no"],[data-act="closesheet"]'); if (b) b.click();
  } else if (e.key === "Tab") {
    const f = [...d.querySelectorAll(FOCUSABLE)].filter(n => !n.hidden && n.type !== "file" && n.offsetParent !== null); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!d.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
function setAppHTML(html) {
  const key = focusKey(document.activeElement), had = document.activeElement;
  $app.innerHTML = html;
  manageDialog(key);
  if (!dlgOpen && key && had && !(had.tagName === "INPUT" || had.tagName === "TEXTAREA")) { try { const n = $app.querySelector(key); if (n) n.focus({ preventScroll: true }); } catch (e) {} }
}

/* ---------- calendrier : jeu, saison et manches du jour ---------- */
const fmtOf = k => CONFIG.formatOrder[mod(diffDays(CONFIG.formatAnchor, k), CONFIG.formatOrder.length)];
function seasonOf(k) {
  const i = Math.max(0, Math.floor(diffDays(CONFIG.seasonAnchor, k) / CONFIG.seasonDays));
  const start = addDays(CONFIG.seasonAnchor, i * CONFIG.seasonDays);
  return { n: i + 1, start, end: addDays(start, CONFIG.seasonDays - 1) };
}
function manchesOf(seed, fmt) {
  const F = FORMATS[fmt], r = rng(seed + "|" + fmt + "|man");
  if (F.man === "themes") return shuffle(F.themes, r).slice(0, 3).map(t => ({ type: "theme", key: t, label: THEMES[t].label, color: THEMES[t].color }));
  if (F.man === "conts") return shuffle(F.conts, r).slice(0, 3).map(c => ({ type: "cont", key: c, label: CONTS[c].label, color: CONTS[c].color }));
  if (F.man === "stats") return shuffle(F.stats, r).slice(0, 3).map(s => ({ type: "stat", key: s, label: STATS[s].label, color: STATS[s].color }));
  if (F.man === "kinds") return shuffle(Object.keys(F.kinds), r).slice(0, 3).map(s => ({ type: "kind", key: s, label: F.kinds[s].label, color: F.kinds[s].color }));
  return [0, 1, 2].map(i => ({ type: "slot", key: "s" + i, label: `${F.slot} ${i + 1}`, color: F.color }));
}

/* ---------- joueurs simulés ---------- */
function players() { if (srvOn()) return onlinePlayers(); return [{ id: "me", name: store.profile.name, color: ME_COLOR, me: true, pet: store.profile.pet, photo: store.profile.photo }, ...BOTS]; }

function simTry(skill, k, tag) {
  const F = FORMATS[fmtOf(k)], r = rng(`${k}|${tag}|try`);
  let total = 0;
  for (let m = 0; m < 3; m++) {
    const u = r(), pHard = Math.max(.05, skill - .45);
    const d = u < pHard ? 2 : u < pHard + .4 ? 1 : 0;
    const pen = [0, .09, .18][d];
    const f = Math.min(1, Math.max(0, skill - pen + (r() - .5) * .5));
    total += Math.round(F.max * Math.pow(f, 1.2) * CONFIG.mult[d]);
  }
  return total;
}
function botPlays(bot, k) {
  const r = rng(`${k}|${bot.id}|day`);
  if (r() > .93) return [];
  const start = 7 * 60 + 30 + Math.floor(r() * 15 * 60);
  const out = [{ at: start, score: simTry(bot.skill, k, bot.id + "|0") }];
  if (r() < .45) out.push({ at: Math.min(start + 5 + Math.floor(r() * 120), 23 * 60 + 55), score: simTry(bot.skill, k, bot.id + "|1") });
  return out;
}
function myPlays(k) {
  const real = store.plays[k];
  if (real && real.length) return real.map(p => ({ at: p.at, score: p.score }));
  if (k < store.profile.created) return botPlays({ id: "me-demo", skill: .66 }, k); // jours passés de démonstration
  return [];
}

/* ---------- résultats du jour et saison ---------- */
function dayResults(k) {
  if (srvOn()) return onlineDayResults(k);
  const live = k === today(), now = minutesNow();
  const rows = players().map(p => {
    let plays = p.me ? myPlays(k) : botPlays(p, k);
    if (live && !p.me) plays = plays.filter(x => x.at <= now);
    const best = plays.length ? Math.max(...plays.map(x => x.score)) : null;
    return { ...p, plays, best, tries: plays.length };
  });
  const played = rows.filter(r => r.best !== null).sort((a, b) => b.best - a.best);
  const N = played.length;
  played.forEach(r => {
    r.pos = played.findIndex(x => x.best === r.best) + 1;
    const worst = played.filter(x => x.best >= r.best).length;
    r.gems = CONFIG.gemsPerRank * (N - worst + 1);
    r.win = r.pos === 1;
  });
  return { played, waiting: rows.filter(r => r.best === null), N };
}
function standings(upTo) {
  const S = seasonOf(upTo), days = [];
  for (let d = S.start; d <= upTo; d = addDays(d, 1)) days.push(d);
  const acc = {};
  players().forEach(p => acc[p.id] = { ...p, total: 0, wins: 0, played: 0, series: [0] });
  days.forEach(d => {
    const res = dayResults(d), g = {};
    res.played.forEach(r => { g[r.id] = r.gems; acc[r.id].played++; if (r.win) acc[r.id].wins++; });
    players().forEach(p => { acc[p.id].total += g[p.id] || 0; acc[p.id].series.push(acc[p.id].total); });
  });
  const list = Object.values(acc).sort((a, b) => b.total - a.total);
  list.forEach(r => r.rank = list.findIndex(x => x.total === r.total) + 1);
  return { S, days, list };
}

/* ---------- progression du familier ---------- */
function progress() {
  if (srvOn()) return onlineProgress();
  const k = today();
  let gems = 0, wins = 0;
  for (let d = CONFIG.seasonAnchor; d <= k; d = addDays(d, 1)) {
    const me = dayResults(d).played.find(r => r.me);
    if (me) { gems += me.gems; if (me.win) wins++; }
  }
  let d = k; if (!myPlays(d).length) d = addDays(d, -1);
  let streak = 0; while (d >= CONFIG.seasonAnchor && myPlays(d).length) { streak++; d = addDays(d, -1); }
  const plays = Object.values(store.plays).reduce((n, a) => n + a.length, 0);
  const games = Object.values(store.stats.fmts || {}).reduce((n, v) => n + v, 0);
  return { gems, wins, streak, plays, games, carnet: Object.keys(store.carnet || {}).length, fmts: Object.keys(store.stats.fmts || {}).length };
}
const wallet = prog => srvOn() ? onlineWallet() : Math.max(0, (prog || progress()).gems - (store.spent || 0));
const isUnlocked = (it, prog) => !it.need || prog[it.need.k] >= it.need.v;
function unlockedIds(prog) {
  const out = [];
  PET_CATS.forEach(c => ITEMS[c].list.forEach(it => { if (it.need && isUnlocked(it, prog)) out.push(`${c}:${it.id}`); }));
  return out;
}
function nextUnlock(prog) {
  let best = null;
  PET_CATS.forEach(c => ITEMS[c].list.forEach(it => {
    if (!it.need || isUnlocked(it, prog)) return;
    const left = it.need.v - prog[it.need.k], frac = left / it.need.v;
    if (!best || frac < best.frac) best = { cat: c, it, left, frac, have: prog[it.need.k] };
  }));
  return best;
}

/* ---------- fil de discussion ---------- */
function feed(k) {
  if (srvOn()) return onlineFeed(k);
  const live = k === today(), now = minutesNow(), ev = [];
  const res = dayResults(k);
  res.played.forEach(p => p.plays.forEach((pl, i) => ev.push({ id: `s-${p.id}-${i}`, type: "score", at: pl.at, p, score: pl.score, best: pl.score === p.best && p.plays.findIndex(x => x.score === p.best) === i })));
  const pool = shuffle([...BOT_LINES.any, ...(BOT_LINES[fmtOf(k)] || [])], rng(k + "|lines"));
  BOTS.forEach((b, i) => {
    const r = rng(`${k}|${b.id}|msg`), pl = botPlays(b, k);
    if (!pl.length || r() > .55) return;
    const at = pl[pl.length - 1].at + 1 + Math.floor(r() * 25);
    if (!live || at <= now) ev.push({ id: `b-${b.id}`, type: "msg", at, p: b, text: pool[i % pool.length] });
  });
  (store.chat[k] || []).forEach((m, i) => ev.push({ id: `c-${i}`, type: "msg", at: m.at, p: m.from === "me" ? players()[0] : BOTS.find(b => b.id === m.from), text: m.text, mine: m.from === "me" }));
  ev.sort((a, b) => a.at - b.at || (a.type === "score" ? -1 : 1));
  const first = ev.find(e => e.type === "score");
  if (first) ev.unshift({ id: "launch", type: "launch", at: first.at, p: first.p });
  return ev;
}

/* ---------- carte du monde (chargée depuis cdnjs) ---------- */
const MAP = { ready: false, failed: false, land: "", borders: "", shapes: {} };
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
function topoToPaths(topo) {
  const t = topo.transform;
  const arcs = topo.arcs.map(arc => { let x = 0, y = 0; return arc.map(p => { if (!t) return p; x += p[0]; y += p[1]; return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]]; }); });
  const arcPts = i => i < 0 ? arcs[~i].slice().reverse() : arcs[i];
  const line = pts => { let s = "", prev = null; pts.forEach(p => { const cmd = (!prev || Math.abs(p[0] - prev[0]) > 180) ? "M" : "L"; s += cmd + p[0].toFixed(2) + " " + (-p[1]).toFixed(2); prev = p; }); return s; };
  const ringPts = r => { const out = []; r.forEach(i => arcPts(i).forEach((p, j) => { if (j === 0 && out.length) return; out.push(p); })); return out; };
  const area = P => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s / 2); };
  const centroid = P => { let a = 0, x = 0, y = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length], k = p[0] * q[1] - q[0] * p[1]; a += k; x += (p[0] + q[0]) * k; y += (p[1] + q[1]) * k; } if (Math.abs(a) < 1e-9) { const b = bbox(P); return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; } return [x / (3 * a), y / (3 * a)]; };
  const bbox = P => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; P.forEach(p => { a = Math.min(a, p[0]); b = Math.min(b, p[1]); c = Math.max(c, p[0]); d = Math.max(d, p[1]); }); return [a, b, c, d]; };
  const obj = topo.objects.world || Object.values(topo.objects)[0];
  let land = "", use = new Map();
  const shapes = {};
  obj.geometries.forEach((g, gi) => {
    const polys = g.type === "Polygon" ? [g.arcs] : g.type === "MultiPolygon" ? g.arcs : [];
    const name = g.properties && g.properties.name, key = (g.id === "-99" || !g.id) ? (MAP_ALIAS[name] || name) : g.id;
    const sh = shapes[key] = shapes[key] || { d: "", main: "", mainA: -1, mb: null };
    polys.forEach(poly => {
      poly.forEach((r, ri) => {
        const P = ringPts(r), d = line(P) + "Z";
        land += d; sh.d += d;
        if (ri === 0) { const A = area(P); if (A > sh.mainA) { sh.mainA = A; sh.main = d; sh.mb = bbox(P); sh.cen = centroid(P); } }
        r.forEach(i => { const a = i < 0 ? ~i : i; if (!use.has(a)) use.set(a, new Set()); use.get(a).add(gi); });
      });
    });
  });
  let borders = "";
  use.forEach((set, a) => { if (set.size > 1) borders += line(arcs[a]); });
  return { land, borders, shapes };
}
function idbOpen() { return new Promise((res, rej) => { const r = indexedDB.open("meridien-cache", 1); r.onupgradeneeded = () => r.result.createObjectStore("kv"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function idbGet(k) { try { const db = await idbOpen(); return await new Promise(res => { const q = db.transaction("kv").objectStore("kv").get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); } catch (e) { return null; } }
async function idbSet(k, v) { try { const db = await idbOpen(); db.transaction("kv", "readwrite").objectStore("kv").put(v, k); } catch (e) {} }
(async function initMap() {
  await Promise.resolve(); // laisse le reste du script (état du jeu) s'initialiser avant de dessiner
  try {
    window.d3 = window.d3 || {}; // datamaps n'en a besoin que pour dessiner, pas pour ses données
    const topo = WORLD_TOPO; // embarquée dans le fichier : fonctionne hors ligne dès la première visite
    if (!topo) throw new Error("topologie absente");
    Object.assign(MAP, topoToPaths(topo), { ready: true });
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    defs.setAttribute("width", "0"); defs.setAttribute("height", "0"); defs.setAttribute("aria-hidden", "true"); defs.style.position = "absolute";
    defs.innerHTML = `<defs><path id="landp" d="${MAP.land}" vector-effect="non-scaling-stroke"/><path id="bordp" d="${MAP.borders}" fill="none" vector-effect="non-scaling-stroke"/></defs>`;
    document.body.appendChild(defs);
  } catch (e) { MAP.failed = true; console.warn("Carte indisponible", e); }
  if (!game || game.phase === "intro") render(); else if (game.phase === "q" && ENG[FORMATS[game.fmt].eng].needsMap) renderGame();
})();

function boxView(box) {
  const [l0, l1, a0, a1] = box, c = Math.cos(((a0 + a1) / 2) * Math.PI / 180);
  return { c, vb: [l0 * c, -a1, (l1 - l0) * c, a1 - a0] };
}
function regionView(rk) { return { ...boxView(REGIONS[rk].box), R: REGIONS[rk] }; }
function mapGrat() {
  let grat = "";
  for (let lo = -180; lo <= 180; lo += 10) grat += `M${lo} -90V90`;
  for (let la = -80; la <= 80; la += 10) grat += `M-180 ${-la}H180`;
  return `<path d="${grat}" fill="none" stroke="var(--grat)" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
}
function mapSVG(rk, extra, id, view) {
  const { c, vb } = regionView(rk), v = view || { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
  return `<svg ${id ? `id="${id}"` : ""} viewBox="${v.x} ${v.y} ${v.w} ${v.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Carte : ${esc(REGIONS[rk].label)}">
    <rect x="-2000" y="-2000" width="4000" height="4000" fill="var(--ocean)"/>
    <g id="mapg" transform="scale(${c} 1)">${mapGrat()}
      <use href="#landp" fill="var(--land)" stroke="var(--border-c)" stroke-width="1"/>
      <use href="#bordp" stroke="var(--border-c)" stroke-width=".7" stroke-dasharray="3 2"/>
    </g>${extra}</svg>`;
}
// carte où chaque pays est une forme distincte (sprint, carnet)
function countriesSVG(box, id, view, fillOf, label) {
  const { c, vb } = boxView(box), v = view || { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
  let shapes = "";
  for (const key in MAP.shapes) { const f = fillOf(key); shapes += `<path d="${MAP.shapes[key].d}" data-id="${key}" class="cty ${f || ""}" vector-effect="non-scaling-stroke"/>`; }
  return `<svg ${id ? `id="${id}"` : ""} viewBox="${v.x} ${v.y} ${v.w} ${v.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(label || "Carte")}">
    <rect x="-2000" y="-2000" width="4000" height="4000" fill="var(--ocean)"/>
    <g id="mapg" transform="scale(${c} 1)">${mapGrat()}${shapes}</g><g id="pins"></g></svg>`;
}
function silhouetteSVG(key) {
  const s = MAP.shapes[key]; if (!s || !s.mb) return "";
  const [l0, a0, l1, a1] = s.mb, c = Math.cos(((a0 + a1) / 2) * Math.PI / 180);
  const w = (l1 - l0) * c, h = a1 - a0, m = Math.max(w, h) * .08;
  return `<svg viewBox="${f1(l0 * c - m)} ${f1(-a1 - m)} ${f1(w + 2 * m)} ${f1(h + 2 * m)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="${s.main}" transform="scale(${c} 1)" fill="var(--ink)" stroke="var(--ink)" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`;
}
function haversine(a, b) {
  const R = 6371, t = Math.PI / 180, dLa = (b.lat - a.lat) * t, dLo = (b.lon - a.lon) * t;
  const s = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
