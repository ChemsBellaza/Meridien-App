/* ---------- interactions du jeu ---------- */
document.addEventListener("click", e => {
  if (!game) return;
  const el = e.target.closest("[data-g]"); if (!el || el.disabled) return;
  const a = el.dataset.g, v = el.dataset.v, g = game;
  if (a === "quit") {
    if (g.phase === "intro" || g.phase === "end") { exitGame(); return; }
    ui.confirm = { title: g.tuto ? "Quitter le tutoriel ?" : "Quitter la partie ?", text: g.tuto ? "Tu pourras le revoir plus tard depuis le menu." : g.practice ? "Ta partie d'entraînement sera perdue." : `Cet essai reste compté avec les ${fmtNum(g.score)} points déjà gagnés.`, yes: "Quitter", no: "Continuer", run: () => { stopTimer(); exitGame(); } };
    renderGame(); return;
  }
  if (a === "start") { beginTry(); g.phase = "diff"; renderGame(); return; }
  if (a === "diff") { chooseDiff(+v); return; }
  if (a === "next") { nextStep(); return; }
  if (a === "exit") { exitGame(); return; }
  if (a === "replay") { exitGame(); startGame(false); return; }
  if (a === "topet") { exitGame(); go("pet", { prevView: "group" }); return; }
  if (a === "share" || a === "challenge") { shareResult(a === "challenge"); return; }
  if (a === "joker") { useJoker(); return; }
  if (a === "zin" || a === "zout") { const vw = g.view; if (vw) zoomAt(a === "zin" ? 1.7 : 1 / 1.7, vw.x + vw.w / 2, vw.y + vw.h / 2); return; }
  if (a === "zreset") { tweenView(view0()); return; }
  if (E().act) E().act(g, a, v, el);
});
document.addEventListener("input", e => {
  if (!game) return;
  if (e.target.id === "yr") { game.year = +e.target.value; syncYear(); return; }
  if (e.target.dataset && e.target.dataset.cat && game.st && game.st.vals) { game.st.vals[e.target.dataset.cat] = e.target.value; return; }
  if (e.target.id === "typein" && game.phase === "q" && E().type) { if (E().type(game, e.target.value, false)) { const t = document.getElementById("typein"); if (t) t.value = ""; } }
});
document.addEventListener("submit", e => {
  if (!game || e.target.id !== "typeform") return;
  e.preventDefault();
  const inp = document.getElementById("typein"); if (!inp || game.phase !== "q") return;
  const val = inp.value; if (!val.trim()) return;
  if (E().type && E().type(game, val, true)) { const t = document.getElementById("typein"); if (t) { t.value = ""; t.focus(); } }
});
// petit bac : Entrée passe au champ suivant
document.addEventListener("keydown", e => {
  if (!game || e.key !== "Enter" || !e.target.dataset || !e.target.dataset.cat) return;
  e.preventDefault();
  const next = document.getElementById("pb" + (+e.target.id.slice(2) + 1)); if (next) next.focus(); else e.target.blur();
});

function useJoker() {
  const g = game, J = E().joker; if (!J || g.phase !== "q" || g.jokers[g.round]) return;
  if (!g.practice) { if (wallet() < CONFIG.jokerCost) return; store.spent = (store.spent || 0) + CONFIG.jokerCost; save(); }
  g.jokers[g.round] = true;
  J.use(g);
  if (g.phase === "q") { const jl = document.querySelector(".jokerline"); if (jl) jl.innerHTML = jokerBtn(); }
}
function exitGame() {
  const wasPractice = game.practice;
  if (game.tuto) tutoDone();
  stopTimer();
  game = null; ui.confirm = null;
  ui.view = "group"; if (!wasPractice) ui.tab = "scores";
  window.scrollTo(0, 0); render();
}

/* ---------- carte : zoom, déplacement, repères (La Carte et Sprint Carte) ---------- */
const zoomCtl = () => `<div class="zoomctl"><button data-g="zin" aria-label="Zoom avant">+</button><button data-g="zout" aria-label="Zoom arrière">−</button><button data-g="zreset" aria-label="Recentrer la carte" style="font-size:18px">⤢</button></div>`;
function view0() { const { vb } = boxView(game.mbox); return { x: vb[0], y: vb[1], w: vb[2], h: vb[3] }; }
function clampView(v, v0) {
  const ratio = v0.h / v0.w;
  v.w = Math.min(v0.w * 1.4, Math.max(v0.w / 14, v.w)); v.h = v.w * ratio;
  const mx = v0.w * .35, my = v0.h * .35;
  const lx = v0.x - mx, hx = v0.x + v0.w + mx - v.w, ly = v0.y - my, hy = v0.y + v0.h + my - v.h;
  v.x = hx < lx ? (lx + hx) / 2 : Math.min(hx, Math.max(lx, v.x));
  v.y = hy < ly ? (ly + hy) / 2 : Math.min(hy, Math.max(ly, v.y));
  return v;
}
function applyView() {
  const svg = document.getElementById("map"); if (!svg || !game || !game.view) return;
  const v = game.view; svg.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
  drawPins();
}
function zoomAt(factor, cx, cy) {
  const g = game, v = g.view, v0 = view0(), w2 = Math.min(v0.w * 1.4, Math.max(v0.w / 14, v.w / factor)), f = w2 / v.w;
  g.view = clampView({ x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f, w: w2, h: v.h * f }, v0);
  applyView();
}
function toSvg(svg, x, y) { const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
let tweenId = 0;
function tweenView(target) {
  const g = game; if (!g || !g.view) return;
  const from = { ...g.view }, t0 = performance.now(), id = ++tweenId, v0 = view0();
  if (reduceMotion()) { g.view = clampView({ ...target }, v0); applyView(); return; }
  const step = now => {
    if (id !== tweenId || !game || game !== g) return;
    const p = Math.min(1, (now - t0) / 380), e = 1 - Math.pow(1 - p, 3);
    g.view = { x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e };
    applyView();
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function fitReveal() {
  const g = game, q = g.qs[g.qi]; if (!g.pin) return;
  const v0 = view0(), c = boxView(g.mbox).c, ratio = v0.h / v0.w;
  const a = { x: q[3] * c, y: -q[2] }, b = { x: g.pin.lon * c, y: -g.pin.lat };
  const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
  const w = Math.min(v0.w, Math.max(Math.abs(a.x - b.x) * 1.9, Math.abs(a.y - b.y) * 1.9 / ratio, v0.w / 9));
  tweenView(clampView({ x: cx - w / 2, y: cy - w * ratio / 2, w, h: w * ratio }, v0));
}
function bindMap(svg) {
  const g = game, pts = new Map();
  let moved = false, start = null, lastDist = 0, lastTap = { t: 0, x: 0, y: 0 };
  const two = () => { const [p, q] = [...pts.values()]; return { d: Math.hypot(p.x - q.x, p.y - q.y), x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }; };
  svg.addEventListener("pointerdown", e => {
    tweenId++;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { moved = false; start = { x: e.clientX, y: e.clientY }; } else { moved = true; lastDist = two().d; }
  });
  svg.addEventListener("pointermove", e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) {
      if (!moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return;
      if (!moved) { try { svg.setPointerCapture(e.pointerId); } catch (_) {} }
      moved = true;
      const k = 1 / svg.getScreenCTM().a, v = g.view, v0 = view0();
      g.view = clampView({ x: v.x - (e.clientX - prev.x) * k, y: v.y - (e.clientY - prev.y) * k, w: v.w, h: v.h }, v0); applyView();
    } else if (pts.size === 2) {
      const t = two(); if (lastDist > 0) { const c = toSvg(svg, t.x, t.y); zoomAt(t.d / lastDist, c.x, c.y); } lastDist = t.d;
    }
  });
  const up = e => {
    if (!pts.has(e.pointerId)) return;
    const wasTap = !moved && pts.size === 1 && e.type === "pointerup";
    pts.delete(e.pointerId);
    if (pts.size === 1) moved = true;
    if (!wasTap) return;
    const now = performance.now(), dbl = now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30;
    if (dbl && FORMATS[g.fmt].eng === "carte") { const c = toSvg(svg, e.clientX, e.clientY); zoomAt(2, c.x, c.y); lastTap.t = 0; return; }
    lastTap = { t: now, x: e.clientX, y: e.clientY };
    const grp = document.getElementById("mapg"), pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(grp.getScreenCTM().inverse());
    if (E().onTap) E().onTap(g, p, e);
  };
  svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
  bindMapKeys(svg);
  svg.addEventListener("wheel", e => { e.preventDefault(); const c = toSvg(svg, e.clientX, e.clientY); zoomAt(Math.exp(-e.deltaY * 0.0016), c.x, c.y); }, { passive: false });
}
/* ---------- carte au clavier (WCAG 2.1.1) : un viseur se déplace aux flèches, Entrée équivaut à un toucher ---------- */
function bindMapKeys(svg) {
  const g = game, wrap = svg.closest(".mapwrap");
  if (!wrap || g.phase !== "q" || !E().onTap) return; // rien à viser pendant la correction ou dans un jeu sans toucher
  wrap.id = "mapwrap"; wrap.tabIndex = 0; wrap.setAttribute("role", "group");
  wrap.setAttribute("aria-label", "Carte. Au clavier : flèches pour déplacer le viseur, Maj pour aller plus vite, Entrée pour toucher, plus et moins pour zoomer, 0 pour recentrer.");
  const cross = document.createElement("div"); cross.className = "kcursor"; cross.setAttribute("aria-hidden", "true"); wrap.appendChild(cross);
  const place = () => {
    const r = svg.getBoundingClientRect(), w = wrap.getBoundingClientRect(), c = g.kcur || (g.kcur = { x: r.width / 2, y: r.height / 2 });
    cross.style.left = (r.left - w.left + c.x) + "px"; cross.style.top = (r.top - w.top + c.y) + "px";
  };
  place();
  wrap.addEventListener("pointerdown", () => wrap.classList.remove("kbd"));
  wrap.addEventListener("keydown", e => {
    if (e.target !== wrap || e.altKey || e.ctrlKey || e.metaKey || game !== g || g.phase !== "q") return;
    const r = svg.getBoundingClientRect(), c = g.kcur || (g.kcur = { x: r.width / 2, y: r.height / 2 }), step = e.shiftKey ? 56 : 16;
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    const client = () => ({ clientX: r.left + c.x, clientY: r.top + c.y });
    if (dir) {
      let nx = c.x + dir[0] * step, ny = c.y + dir[1] * step, px = 0, py = 0;
      if (nx < 0) { px = nx; nx = 0; } else if (nx > r.width) { px = nx - r.width; nx = r.width; }
      if (ny < 0) { py = ny; ny = 0; } else if (ny > r.height) { py = ny - r.height; ny = r.height; }
      c.x = nx; c.y = ny;
      if ((px || py) && g.view) { const k = g.view.w / r.width, v = g.view; g.view = clampView({ x: v.x + px * k, y: v.y + py * k, w: v.w, h: v.h }, view0()); applyView(); } // au bord : la carte se déplace
    } else if (e.key === "Enter" || e.key === " ") {
      const q = client(), grp = document.getElementById("mapg"), pt = svg.createSVGPoint(); pt.x = q.clientX; pt.y = q.clientY;
      E().onTap(g, pt.matrixTransform(grp.getScreenCTM().inverse()), q);
    } else if (["+", "=", "-", "_"].includes(e.key) && g.view) {
      const q = client(), s = toSvg(svg, q.clientX, q.clientY); zoomAt(["+", "="].includes(e.key) ? 1.7 : 1 / 1.7, s.x, s.y);
    } else if (e.key === "0" && g.view) tweenView(view0());
    else return;
    e.preventDefault(); wrap.classList.add("kbd"); place();
  });
}
function drawPins() {
  const g = game; if (!g || FORMATS[g.fmt].eng !== "carte") return;
  const q = g.qs[g.qi], el = document.getElementById("pins"); if (!el) return;
  const c = boxView(g.mbox).c, s = g.view.w / 42;
  const pinAt = (lon, lat, color) => `<g transform="translate(${lon * c} ${-lat}) scale(${s / 10})"><path d="M0 0c-4-5-7-8.5-7-12a7 7 0 0 1 14 0c0 3.5-3 7-7 12z" fill="${color}" stroke="${INK}" stroke-width="1.8"/><circle cy="-12" r="2.6" fill="#fff"/></g>`;
  let h = "";
  if (g.phase === "reveal") {
    const t = { lon: q[3], lat: q[2] };
    if (g.pin) h += `<line x1="${g.pin.lon * c}" y1="${-g.pin.lat}" x2="${t.lon * c}" y2="${-t.lat}" stroke="${INK}" stroke-width="2.5" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"/>`;
    h += `<circle cx="${t.lon * c}" cy="${-t.lat}" r="${s * 1.1}" fill="#0E7A68" opacity=".25"/>` + (g.pin ? pinAt(g.pin.lon, g.pin.lat, "#2845D6") : "") + pinAt(t.lon, t.lat, "#0E7A68");
  } else if (g.pin) h = pinAt(g.pin.lon, g.pin.lat, "#2845D6");
  el.innerHTML = h;
}

function afterGameRender() {
  const g = game; if (!g) return;
  if (!g._keepScroll) window.scrollTo(0, 0);
  if ((g.phase === "q" || g.phase === "reveal") && E().after) E().after(g);
  if (g.phase === "q" && E().focus) { const ae = document.activeElement; if (!ae || ae === document.body || !ae.isConnected) { const f = document.getElementById(E().focus); if (f) f.focus({ preventScroll: true }); } }
  if (ui.toast && ui.toast !== "copied") { clearTimeout(afterGameRender._t); afterGameRender._t = setTimeout(() => { ui.toast = ""; const t = document.querySelector(".toast"); if (t) t.remove(); }, 1800); }
}

render();

/* décode le dictionnaire du petit bac pendant un moment d'inactivité (évite le gel au premier petit bac) */
(window.requestIdleCallback || (f => setTimeout(f, 1500)))(() => { try { pbDict(); } catch (e) {} });
