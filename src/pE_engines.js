/* ============ MOTEURS DE JEU ============
   Chaque moteur : build (contenu de la manche), start (état d'une étape), view (affichage),
   act (actions data-g), after (après affichage), joker (facultatif). */
const ENG = {};
const unitOf = g => FORMATS[g.fmt].max / (g.qs.length || 1);
const CNAME = { af: "Afrique", eu: "Europe", as: "Asie", am: "Amérique", oc: "Océanie" };
const okIco = `<span class="okk" aria-hidden="true">✓</span>`, koIco = `<span class="kok" aria-hidden="true">✗</span>`;
function flashMsg(id, html, cls = "", ms = 1600) {
  const el = document.getElementById(id); if (!el) return;
  el.innerHTML = html; el.className = "typemsg " + cls; announce(html);
  clearTimeout(el._t); el._t = setTimeout(() => { if (el.isConnected) { el.innerHTML = ""; el.className = "typemsg"; } }, ms);
}
// pays d'un continent, rangés pour la difficulté : facile = célèbres, difficile = méconnus
function countryQueue(cont, d, r, filter) {
  const all = COUNTRIES.filter(c => (cont === "as" ? contGroup(c) === "as" : c.cont === cont) && (!filter || filter(c)));
  const pref = c => d === 0 ? (c.tier === 1 ? 0 : c.tier) : d === 1 ? (c.tier <= 2 ? 0 : 2) : (c.tier >= 2 ? 0 : 1);
  return all.map(c => ({ c, w: pref(c) + r() * .9 })).sort((a, b) => a.w - b.w).map(x => x.c);
}
function distractors(c, n, r, pool) {
  const same = pool.filter(o => o.id !== c.id && Math.abs(o.tier - c.tier) <= 1);
  return shuffle(same.length >= n ? same : pool.filter(o => o.id !== c.id), r).slice(0, n);
}

/* ===================== QCM ===================== */
ENG.mcq = {
  build(g, m, d) {
    const F = FORMATS[g.fmt], r = roundRng(g), per = F.per;
    if (g.fmt === "quiz") return fromPool(g, DATA.quiz[m.key][d], per, `quiz|${m.key}|${d}`).map(q => ({ kind: "text", prompt: q[0], opts: q[1], fact: q[2], learn: { t: q[1][0], f: q[2] } }));
    if (g.fmt === "intrus") return fromPool(g, INTRUS[m.key][d], per, `intrus|${m.key}|${d}`).map(q => ({ kind: "text", prompt: "Trouve l'intrus.", opts: q.slice(0, 4), fact: q[4], learn: { t: "Intrus : " + q[0], f: q[4] } }));
    if (g.fmt === "rebus") return fromPool(g, REBUS[m.key][d], per, `rebus|${m.key}|${d}`).map(q => ({ kind: "emoji", big: q[0], prompt: m.key === "cine" ? "Quel film ?" : m.key === "geo" ? "Quel lieu ?" : "Quelle expression ?", opts: q[1], fact: q[2], learn: { t: `${q[0]} ${q[1][0]}`, f: q[2] } }));
    if (g.fmt === "citations") return fromPool(g, QUOTES[m.key][d], per, `quote|${m.key}|${d}`).map(q => ({ kind: "quote", quote: q[0], prompt: "Qui a dit ça ?", opts: q[1], fact: q[2], learn: { t: `« ${q[0]} »`, f: `${q[1][0]}. ${q[2]}` } }));
    if (g.fmt === "sigles") return fromPool(g, SIGLES[m.key][d], per, `sig|${m.key}|${d}`).map(q => ({ kind: "sigle", big: q[0], opts: q.slice(1, 5), fact: q[5], learn: { t: q[0], f: q[1] } }));
    if (g.fmt === "megaquiz") return fromPool(g, DATA.quiz[m.key][d], per, `mega|${m.key}|${d}`).map(q => ({ kind: "text", prompt: q[0], opts: q[1], fact: q[2], learn: { t: q[1][0], f: q[2] } }));
    if (NEWQ[g.fmt]) return fromPool(g, NEWQ[g.fmt][m.key][d], per, `${g.fmt}|${m.key}|${d}`).map(q => ({ kind: "text", prompt: q[0], opts: q[1], fact: q[2], learn: { t: q[1][0], f: q[2] } }));
    if (g.fmt === "drapeaux") {
      const pool = COUNTRIES.filter(c => contGroup(c) === m.key);
      return countryQueue(m.key, d, r).slice(0, per).map(c => ({ kind: "flag", flag: flagOf(c), id: c.id, opts: [c.name, ...distractors(c, 3, r, pool).map(o => o.name)], stamp: c.id,
        fact: c.cap ? `Capitale : ${c.cap}. ${fmtPop(c.pop)}.` : `${fmtPop(c.pop)}.`, learn: { t: `${flagOf(c)} ${c.name}`, f: c.cap ? `capitale ${c.cap}` : "" } }));
    }
    if (g.fmt === "silhouettes") {
      const ok = c => c.area >= [60, 20, 5][d] && !["RUS", "FJI", "KIR"].includes(c.id) && (!MAP.ready || (MAP.shapes[c.id] && MAP.shapes[c.id].mb && MAP.shapes[c.id].mb[2] - MAP.shapes[c.id].mb[0] < 90));
      const pool = COUNTRIES.filter(c => contGroup(c) === m.key && ok(c));
      return countryQueue(m.key, d, r, ok).slice(0, per).map(c => ({ kind: "shape", id: c.id, opts: [c.name, ...distractors(c, 3, r, pool).map(o => o.name)], stamp: c.id,
        fact: `${LeN(c)} : ${fmtArea(c.area)}${c.cap ? `, capitale ${c.cap}` : ""}.`, learn: { t: c.name, f: fmtArea(c.area) } }));
    }
    return [];
  },
  start(g) {
    const q = g.qs[g.qi];
    g.st = { order: shuffle(q.opts.map((_, i) => i)), hidden: [], choice: undefined };
    if (q.kind === "shape" && !MAP.ready) { g.st.wait = true; return; }
    startTimer(FORMATS[g.fmt].secs, () => mcqAnswer(null));
  },
  view(g) {
    const q = g.qs[g.qi], rev = g.phase === "reveal", st = g.st;
    let top = "";
    if (q.kind === "text") top = `<h2 class="qtitle">${fr(q.prompt)}</h2>`;
    if (q.kind === "emoji") top = `<div class="bigemoji" role="img" aria-label="Rébus emoji">${q.big}</div><p class="qsub center">${q.prompt}</p>`;
    if (q.kind === "quote") top = `<blockquote class="quote">${fr("« " + q.quote + " »")}</blockquote><p class="qsub">${q.prompt}</p>`;
    if (q.kind === "sigle") top = `<div class="bigsigle" role="img" aria-label="Sigle ${esc(q.big)}">${esc(q.big)}</div><p class="qsub center">Que signifie ce sigle ?</p>`;
    if (q.kind === "flag") top = `<div class="bigflag" role="img" aria-label="Drapeau">${q.flag}</div><p class="qsub center">De quel pays est ce drapeau ?</p>`;
    if (q.kind === "shape") top = MAP.ready ? `<div class="shapebox">${silhouetteSVG(q.id)}</div><p class="qsub center">Quel est ce pays ?</p>` : `<div class="mapwrap"><div class="mapfail">${MAP.failed ? `La carte n'a pas pu se charger.<br><br><button class="smallbtn" data-g="mcqskip">Passer (0 pt)</button>` : "Chargement de la carte…"}</div></div>`;
    return `${top}${rev ? "" : timerHTML(false)}
      <div class="opts">${st.order.map((i, pos) => {
        if (!rev && st.hidden.includes(i)) return `<button class="opt gone" disabled aria-hidden="true"><span class="k">${"ABCD"[pos]}</span><span class="tx">—</span></button>`;
        let cls = ""; if (rev) { if (i === 0) cls = "ok"; else if (st.choice === i) cls = "bad"; }
        return `<button class="opt ${cls}" data-g="opt" data-v="${i}" ${rev ? "disabled" : ""}><span class="k">${"ABCD"[pos]}</span><span class="tx">${fr(q.opts[i])}</span>${cls === "ok" ? `<span class="mk" aria-hidden="true">✓</span><span class="sr">Bonne réponse</span>` : cls === "bad" ? `<span class="mk" aria-hidden="true">✗</span><span class="sr">Ta réponse, fausse</span>` : ""}</button>`;
      }).join("")}</div>`;
  },
  act(g, a, v) {
    if (a === "opt") { mcqAnswer(+v); return true; }
    if (a === "mcqskip" && g.phase === "q") { g.st.choice = null; award(0, { ans: "Question passée.", fact: g.qs[g.qi].fact }); return true; }
  },
  after(g) { if (g.st.wait && MAP.ready && g.phase === "q") { g.st.wait = false; renderGame(); startTimer(FORMATS[g.fmt].secs, () => mcqAnswer(null)); } },
  joker: { label: "50/50", help: "Retire deux mauvaises réponses.", use(g) { g.st.hidden = shuffle([1, 2, 3]).slice(0, 2); renderGame(); } }
};
function mcqAnswer(choice) {
  const g = game; if (!g || g.phase !== "q") return;
  const q = g.qs[g.qi], secs = g.T ? (g.T.ms + g.T.bonus) / 1000 : FORMATS[g.fmt].secs, left = timeLeft(); // le bonus de rapidité se mesure sur le temps réellement accordé
  g.st.choice = choice;
  const base = choice === 0 ? Math.round(unitOf(g) * (.5 + .5 * left / secs)) : 0;
  const ans = choice === 0 ? `Bonne réponse en ${(secs - left).toFixed(1).replace(".", ",")} s.` : choice == null ? `Temps écoulé. Réponse : ${fr(q.opts[0])}.` : `Raté. Réponse : ${fr(q.opts[0])}.`;
  award(base, { ans, fact: q.fact, learn: [q.learn], stamps: choice === 0 && q.stamp ? [q.stamp] : [] });
}
const fmtPop = p => p >= 1 ? `${String(+p.toFixed(p >= 10 ? 0 : 1)).replace(".", ",")} million${p >= 2 ? "s" : ""} d'habitants` : `${fmtNum(p * 1e6)} habitants`;
const fmtArea = a => a >= 1 ? `${fmtNum(a * 1000)} km²` : `${String(+(a * 1000).toFixed(a < .01 ? 2 : 0)).replace(".", ",")} km²`;

/* ===================== LA CARTE ===================== */
ENG.carte = {
  needsMap: true,
  build(g, m, d) { return fromPool(g, DATA.carte[m.key][d], 2, `carte|${m.key}|${d}`); },
  start(g) { const q = g.qs[g.qi]; g.mbox = REGIONS[q[4]].box; g.view = view0(); g.pin = null; },
  view(g) {
    const q = g.qs[g.qi], rev = g.phase === "reveal", rk = q[4];
    let html = `<div><h2 class="qtitle">${fr(q[0])}</h2><p class="qsub" style="margin-top:4px">${fr(q[1])}</p></div>`;
    if (MAP.ready) {
      html += `<div class="mapwrap">${mapSVG(rk, `<g id="pins"></g>`, "map", g.view)}<span class="maphint">${esc(REGIONS[rk].label)}${rev ? "" : " · touche pour placer"}</span>${zoomCtl()}</div>
        ${rev ? "" : `<p class="note">Pince ou molette pour zoomer, glisse pour te déplacer.</p>`}`;
    } else html += `<div class="mapwrap"><div class="mapfail">${MAP.failed ? `La carte n'a pas pu se charger. Vérifie ta connexion puis recharge la page.${rev ? "" : `<br><br><button class="smallbtn" data-g="skipmap">Passer cette question (0 pt)</button>`}` : "Chargement de la carte…"}</div></div>`;
    if (!rev) html += `<button class="btn" data-g="validate" id="valbtn" ${g.pin ? "" : "disabled"}>Valider</button>`;
    return html;
  },
  act(g, a) {
    if (a === "validate") { answerCarte(); return true; }
    if (a === "skipmap" && g.phase === "q") { award(0, { ans: "Question passée.", fact: g.qs[g.qi][5] }); return true; }
  },
  onTap(g, p) { if (g.phase !== "q") return; g.pin = { lon: p.x, lat: -p.y }; drawPins(); const vb = document.getElementById("valbtn"); if (vb) vb.disabled = false; },
  after(g) {
    if (!MAP.ready) return;
    const svg = document.getElementById("map"); if (!svg) return;
    drawPins(); bindMap(svg);
    if (g.phase === "reveal") fitReveal();
  }
};
function answerCarte() {
  const g = game, q = g.qs[g.qi]; if (g.phase !== "q" || !g.pin) return;
  const truth = { lat: q[2], lon: q[3] }, dist = haversine(g.pin, truth), k = REGIONS[q[4]].k;
  const base = Math.round(unitOf(g) * (dist < k * .15 ? 1 : Math.exp(-dist / k)));
  g.dist = Math.round(dist);
  award(base, { ans: `Tu étais à ${fmtNum(dist)} km.`, fact: q[5], learn: [{ t: q[0], f: q[5] }] });
}

/* ===================== LA FRISE ===================== */
const yearHTML = y => y < 0 ? `${-y} <small>AV. J.-C.</small>` : `${y}`;
ENG.frise = {
  build(g, m, d) { return fromPool(g, DATA.frise[m.key][d], 2, `frise|${m.key}|${d}`); },
  start(g) { // départ du curseur au hasard, loin de la réponse
    const q = g.qs[g.qi], [, ans, min, max] = q, r = rng(g.k + "|" + q[0]), span = max - min;
    let y = min, n = 0;
    do { y = Math.round(min + r() * span); n++; } while (Math.abs(y - ans) < span * .2 && n < 20);
    g.year = y;
  },
  view(g) {
    const q = g.qs[g.qi], rev = g.phase === "reveal", [, , min, max] = q, y = g.year;
    return `<div><div class="mono muted" style="margin-bottom:4px">En quelle année ?</div><h2 class="qtitle">${fr(q[0])}</h2></div>
      <div class="yearbig num" id="yearbig">${yearHTML(y)}</div>
      <input type="range" id="yr" min="${min}" max="${max}" step="1" value="${y}" ${rev ? "disabled" : ""} aria-label="Année">
      <div class="axis">${axisSVG(min, max, rev ? q[1] : null, y)}</div>
      ${rev ? "" : `<div class="yearctl"><button data-g="yr" data-v="-10">−10</button><button data-g="yr" data-v="-1">−1</button><button data-g="yr" data-v="1">+1</button><button data-g="yr" data-v="10">+10</button></div>
      <button class="btn" data-g="validate">Valider</button>`}`;
  },
  act(g, a, v) {
    const q = g.qs[g.qi];
    if (a === "yr") { g.year = Math.min(q[3], Math.max(q[2], g.year + (+v))); syncYear(); return true; }
    if (a === "validate" && g.phase === "q") {
      const diff = Math.abs(g.year - q[1]), k = Math.max(3, (q[3] - q[2]) / 20);
      const base = Math.round(unitOf(g) * (diff === 0 ? 1 : Math.exp(-diff / k)));
      award(base, { ans: diff === 0 ? `Pile la bonne année : ${yearTxt(q[1])} !` : `Réponse : ${yearTxt(q[1])}. Écart : ${fmtNum(diff)} an${diff > 1 ? "s" : ""}.`, fact: q[4], learn: [{ t: `${q[0]} (${yearTxt(q[1])})`, f: q[4] }] });
      return true;
    }
  }
};
function axisSVG(min, max, truth, guess) {
  const W = 360, x = v => 10 + (W - 20) * (v - min) / (max - min);
  const span = max - min, step = span > 600 ? 100 : span > 250 ? 50 : span > 100 ? 25 : 10;
  let t = "";
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) t += `<line x1="${x(v)}" x2="${x(v)}" y1="16" y2="27" stroke="var(--ink)" stroke-width="2"/><text x="${x(v)}" y="41" text-anchor="middle" font-size="10.5" font-family="Nunito, sans-serif" font-weight="700" fill="var(--ink-2)">${v < 0 ? -v : v}</text>`;
  let marks = `<rect x="${x(guess) - 7}" y="13" width="14" height="16" fill="var(--cobalt)" stroke="var(--ink)" stroke-width="2.5"/>`;
  if (truth != null) marks = `<line x1="${x(guess)}" x2="${x(truth)}" y1="21" y2="21" stroke="var(--bad)" stroke-width="3"/><rect x="${x(truth) - 7}" y="13" width="14" height="16" fill="var(--ok)" stroke="var(--ink)" stroke-width="2.5"/>` + marks;
  return `<svg viewBox="0 0 ${W} 46" aria-hidden="true"><line x1="10" x2="${W - 10}" y1="21" y2="21" stroke="var(--ink)" stroke-width="4"/>${t}${marks}</svg>`;
}
function syncYear() {
  const g = game, q = g.qs[g.qi];
  const yb = document.getElementById("yearbig"); if (yb) yb.innerHTML = yearHTML(g.year);
  const yr = document.getElementById("yr"); if (yr && +yr.value !== g.year) yr.value = g.year;
  const ax = document.querySelector(".axis"); if (ax) ax.innerHTML = axisSVG(q[2], q[3], null, g.year);
}

/* ===================== SPRINT CARTE ===================== */
const SPRINT_FACTS = {
  af: "L'Afrique compte 54 États reconnus par l'ONU : c'est le continent qui en a le plus.",
  eu: "Le plus petit pays d'Europe, et du monde, est le Vatican : 0,44 km².",
  as: "L'Asie rassemble près de 60 % de l'humanité.",
  am: "Les Amériques comptent 35 États indépendants, du Canada à l'Argentine."
};
ENG.sprint = {
  needsMap: true, board: true,
  build(g, m, d) { g.mbox = CONTS[m.key].box; return [{ cont: m.key }]; },
  start(g) {
    g.mbox = CONTS[g.qs[0].cont].box; g.view = view0();
    g.st = { queue: null, i: 0, found: [], missed: [], wrong: 0, lock: false };
    if (MAP.ready) sprintGo(g); else g.st.wait = true;
  },
  view(g) {
    const st = g.st, rev = g.phase === "reveal", cont = g.qs[0].cont;
    if (!MAP.ready) return `<div class="mapwrap"><div class="mapfail">${MAP.failed ? `La carte n'a pas pu se charger.<br><br><button class="smallbtn" data-g="spfail">Passer la manche (0 pt)</button>` : "Chargement de la carte…"}</div></div>`;
    const target = st.queue && CBY[st.queue[st.i]];
    const fill = id => st.found.includes(id) ? "ok" : st.missed.includes(id) ? "miss" : "";
    return `${rev ? "" : `<div class="sprinthead"><div class="target"><span class="mono">Touche</span><b id="sptarget">${target ? esc(target.name) : "…"}</b></div><span class="count num" id="spcount">${st.found.length}<small> trouvé${st.found.length > 1 ? "s" : ""}</small></span></div>${timerHTML(true)}`}
      <div class="mapwrap sprint">${countriesSVG(CONTS[cont].box, "map", g.view, fill, "Carte : " + CONTS[cont].label)}<div class="mapmsg" id="mapmsg" role="status"></div>${zoomCtl()}</div>
      ${rev ? "" : `<div class="btnline center"><button class="smallbtn" data-g="spskip">Passer ce pays</button></div>`}`;
  },
  act(g, a) {
    if (a === "spskip" && g.phase === "q" && g.st.queue) { sprintMiss(g, true); return true; }
    if (a === "spfail" && g.phase === "q") { award(0, { ans: "Manche passée." }); return true; }
  },
  onTap(g, p, e) {
    const st = g.st; if (g.phase !== "q" || !st.queue || st.lock) return;
    const tid = st.queue[st.i], el = document.elementFromPoint(e.clientX, e.clientY), hit = el && el.closest && el.closest("path[data-id]");
    const hid = hit && hit.dataset.id;
    if (hid === tid || nearTarget(tid, e)) return sprintHit(g);
    if (hid && CBY[hid]) { flashCountry(hid, "bad"); mapMsg(`C'est ${leN(CBY[hid])}`, "bad"); }
    else mapMsg("Raté", "bad");
    if (++st.wrong >= 2) sprintMiss(g, false);
  },
  after(g) {
    if (g.st.wait && MAP.ready && g.phase === "q") { g.st.wait = false; sprintGo(g); renderGame(); return; }
    const svg = document.getElementById("map"); if (svg) bindMap(svg);
  },
  joker: { label: "+15 s", help: "Ajoute 15 secondes au chrono.", use() { addTime(15); } }
};
function sprintGo(g) {
  const cont = g.qs[0].cont, d = g.diffs[g.round];
  g.st.queue = countryQueue(cont, d, roundRng(g, "q"), c => MAP.shapes[c.id] && c.cont === cont).map(c => c.id);
  startTimer(FORMATS.sprint.secs, sprintEnd);
}
function nearTarget(id, e) {
  const s = MAP.shapes[id], grp = document.getElementById("mapg"); if (!s || !s.mb || !grp) return false;
  const [l0, a0, l1, a1] = s.mb, pt = grp.ownerSVGElement.createSVGPoint();
  pt.x = (l0 + l1) / 2; pt.y = -(a0 + a1) / 2;
  const sp = pt.matrixTransform(grp.getScreenCTM());
  const small = (l1 - l0) * (a1 - a0) < 6;
  return Math.hypot(sp.x - e.clientX, sp.y - e.clientY) < (small ? 22 : 10);
}
function flashCountry(id, cls) {
  document.querySelectorAll(`#map path[data-id="${id}"]`).forEach(p => { p.classList.add(cls); if (cls === "bad" || cls === "hint") setTimeout(() => p.classList.remove(cls), 700); });
}
function mapMsg(t, cls) { flashMsg("mapmsg", esc(t), cls, 1100); const el = document.getElementById("mapmsg"); if (el) el.className = "mapmsg on " + (cls || ""); clearTimeout(mapMsg._t); mapMsg._t = setTimeout(() => { const e2 = document.getElementById("mapmsg"); if (e2) e2.className = "mapmsg"; }, 1100); }
function sprintHit(g) {
  const st = g.st, id = st.queue[st.i];
  st.found.push(id); flashCountry(id, "ok"); mapMsg("✓ " + CBY[id].name, "ok");
  sprintNext(g);
}
function sprintMiss(g, skipped) {
  const st = g.st, id = st.queue[st.i];
  st.missed.push(id); flashCountry(id, "miss"); mapMsg(skipped ? `C'était ici : ${CBY[id].name}` : `Le voici : ${CBY[id].name}`, "miss");
  sprintNext(g);
}
function sprintNext(g) {
  const st = g.st; st.wrong = 0; st.i++;
  if (st.i >= st.queue.length) { sprintEnd(); return; }
  const t = document.getElementById("sptarget"); if (t) t.textContent = CBY[st.queue[st.i]].name;
  const c = document.getElementById("spcount"); if (c) c.innerHTML = `${st.found.length}<small> trouvé${st.found.length > 1 ? "s" : ""}</small>`;
}
function sprintEnd() {
  const g = game; if (!g || g.phase !== "q") return;
  const st = g.st, cont = g.qs[0].cont;
  const chips = (ids, cls) => ids.map(id => `<span class="pchip ${cls}">${flagOf(CBY[id])} ${esc(CBY[id].name)}</span>`).join("");
  award(st.found.length * 15, {
    ans: `${st.found.length} pays trouvé${st.found.length > 1 ? "s" : ""} en 60 secondes.`,
    extra: `${st.found.length ? `<div class="pchips">${chips(st.found, "ok")}</div>` : ""}${st.missed.length ? `<div class="mono muted">Manqués</div><div class="pchips">${chips(st.missed, "miss")}</div>` : ""}`,
    fact: SPRINT_FACTS[cont], stamps: st.found,
    learn: st.missed.length ? [{ t: "Pays à revoir sur la carte", f: st.missed.slice(0, 5).map(id => CBY[id].name).join(", ") }] : []
  });
}

/* ===================== SPRINT CAPITALES ===================== */
ENG.capitales = {
  board: true, focus: "typein",
  build(g, m, d) { return [{ queue: countryQueue(m.key, d, roundRng(g), c => !!c.cap).map(c => c.id) }]; },
  start(g) { g.st = { i: 0, found: [], missed: [] }; startTimer(FORMATS.capitales.secs, capEnd); },
  view(g) {
    const st = g.st, rev = g.phase === "reveal", c = CBY[g.qs[0].queue[st.i]];
    if (rev) return "";
    return `<div class="capcard"><span class="bigflag sm" id="capflag">${flagOf(c)}</span><div class="grow"><span class="mono">Capitale de</span><b id="capname">${esc(LeN(c))}</b></div><span class="count num" id="capcount">${st.found.length}<small> ✓</small></span></div>
      ${timerHTML(true)}
      ${typeBox("Capitale…")}
      <div class="btnline center"><button class="smallbtn" data-g="capskip">Passer ce pays</button></div>
      <div class="pchips" id="foundlist">${st.found.slice().reverse().map(id => `<span class="pchip ok">${esc(CBY[id].cap)}</span>`).join("")}</div>`;
  },
  type(g, val, submit) {
    const st = g.st, c = CBY[g.qs[0].queue[st.i]], keys = capKeys(c);
    if (submit ? matchKeys(val, keys) : exactKeys(val, keys)) {
      st.found.push(c.id); flashMsg("typemsg", `${okIco} ${esc(c.cap)}`, "ok");
      const fl = document.getElementById("foundlist"); if (fl) fl.insertAdjacentHTML("afterbegin", `<span class="pchip ok">${esc(c.cap)}</span>`);
      capNext(g); return true;
    }
    if (submit) flashMsg("typemsg", `${koIco} Ce n'est pas ça`, "bad");
  },
  act(g, a) { if (a === "capskip" && g.phase === "q") { const c = CBY[g.qs[0].queue[g.st.i]]; g.st.missed.push(c.id); flashMsg("typemsg", `C'était ${esc(c.cap)}`, "bad"); capNext(g); return true; } },
  joker: { label: "+15 s", help: "Ajoute 15 secondes au chrono.", use() { addTime(15); } }
};
function capNext(g) {
  const st = g.st, q = g.qs[0]; st.i++;
  if (st.i >= q.queue.length) { capEnd(); return; }
  const c = CBY[q.queue[st.i]];
  const n = document.getElementById("capname"); if (n) n.textContent = LeN(c);
  const f = document.getElementById("capflag"); if (f) f.textContent = flagOf(c);
  const k = document.getElementById("capcount"); if (k) k.innerHTML = `${st.found.length}<small> ✓</small>`;
  const inp = document.getElementById("typein"); if (inp) { inp.value = ""; inp.focus(); }
}
function capEnd() {
  const g = game; if (!g || g.phase !== "q") return;
  const st = g.st, q = g.qs[0], cur = q.queue[st.i];
  const missed = st.missed.concat(cur && !st.found.includes(cur) ? [cur] : []);
  const row = (id, ok) => `<div class="lrow ${ok ? "ok" : "miss"}"><span>${flagOf(CBY[id])} ${esc(CBY[id].name)}</span><b>${esc(CBY[id].cap)}</b></div>`;
  award(st.found.length * 15, {
    ans: `${st.found.length} capitale${st.found.length > 1 ? "s" : ""} trouvée${st.found.length > 1 ? "s" : ""}.`,
    extra: `<div class="lrows">${st.found.map(id => row(id, true)).join("")}${missed.map(id => row(id, false)).join("")}</div>`,
    stamps: st.found, learn: missed.slice(0, 4).map(id => ({ t: `Capitale ${deN(CBY[id])}`, f: CBY[id].cap }))
  });
}
const typeBox = ph => `<form class="typebox" id="typeform" autocomplete="off"><input id="typein" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="${esc(ph)}" enterkeyhint="done" aria-label="${esc(ph)}"><button type="submit">OK</button></form><div class="typemsg" id="typemsg" role="status"></div>`;

/* ===================== LISTES À CITER : TOP 10, VOISINS ===================== */
function parseItem(s) {
  if (s[0] === "@") { const [id, ...ex] = s.slice(1).split("|"); const c = CBY[id]; return { label: c.name, keys: [...countryKeys(c), ...ex.map(norm)], id }; }
  const parts = s.split("|"); return { label: parts[0], keys: parts.map(norm) };
}
ENG.listtype = {
  board: true, focus: "typein",
  build(g, m, d) {
    if (g.fmt === "top10") { const L = fromPool(g, TOPS[d], 1, `top|${d}`, true)[0]; return [{ title: L.t, items: L.items.map(parseItem), opt: [], fact: L.f }]; }
    const N = fromPool(g, NEIGHBORS[d], 1, `vois|${d}`, true)[0], c = CBY[N.id];
    g.mlabel[g.round] = c.name;
    return [{ title: `Les ${N.n.length} pays voisins ${deN(c)}`, flag: flagOf(c), items: N.n.map(id => parseItem("@" + id)), opt: (N.opt || []).map(id => parseItem("@" + id)), fact: N.f, country: c.id }];
  },
  start(g) { g.st = { found: [], bonus: [] }; startTimer(FORMATS[g.fmt].secs, listEnd); },
  view(g) {
    const q = g.qs[0], st = g.st, rev = g.phase === "reveal";
    const slots = q.items.map((it, i) => { const ok = st.found.includes(i); return `<span class="slot ${ok ? "ok" : rev ? "miss" : ""}" id="slot${i}">${ok || rev ? esc(it.label) : `<i class="num">${i + 1}</i>`}</span>`; }).join("");
    return `<div class="listhead">${q.flag ? `<span class="bigflag sm">${q.flag}</span>` : `<span class="lico">${I.list(30)}</span>`}<h2 class="qtitle">${fr(q.title)}</h2></div>
      ${rev ? "" : timerHTML(true) + typeBox(g.fmt === "voisins" ? "Un pays voisin…" : "Ta réponse…")}
      <div class="slots">${slots}</div>
      ${st.bonus.length ? `<div class="pchips">${st.bonus.map(i => `<span class="pchip">${esc(q.opt[i].label)} · bonus</span>`).join("")}</div>` : ""}
      ${rev ? "" : `<div class="btnline center"><span class="count num" id="lcount">${st.found.length} / ${q.items.length}</span><button class="smallbtn ghost" data-g="listdone">J'arrête</button></div>`}`;
  },
  type(g, val, submit) {
    const q = g.qs[0], st = g.st, test = keys => submit ? matchKeys(val, keys) : exactKeys(val, keys);
    const i = q.items.findIndex(it => test(it.keys));
    if (i >= 0) {
      if (st.found.includes(i)) { if (submit) flashMsg("typemsg", "Déjà trouvé", ""); return submit; }
      st.found.push(i); flashMsg("typemsg", `${okIco} ${esc(q.items[i].label)}`, "ok");
      const s = document.getElementById("slot" + i); if (s) { s.className = "slot ok pop"; s.textContent = q.items[i].label; }
      const c = document.getElementById("lcount"); if (c) c.textContent = `${st.found.length} / ${q.items.length}`;
      if (st.found.length === q.items.length) later(listEnd, 350);
      return true;
    }
    const j = q.opt.findIndex(it => test(it.keys));
    if (j >= 0 && !st.bonus.includes(j)) { st.bonus.push(j); flashMsg("typemsg", `Exact, en bonus : ${esc(q.opt[j].label)}`, "ok"); return true; }
    if (submit) flashMsg("typemsg", `${koIco} Pas dans la liste`, "bad");
  },
  act(g, a) { if (a === "listdone" && g.phase === "q") { listEnd(); return true; } },
  joker: { label: "+15 s", help: "Ajoute 15 secondes au chrono.", use() { addTime(15); } }
};
function listEnd() {
  const g = game; if (!g || g.phase !== "q") return;
  const q = g.qs[0], st = g.st, n = q.items.length, miss = q.items.filter((_, i) => !st.found.includes(i));
  award(Math.round(FORMATS[g.fmt].max * st.found.length / n), {
    ans: `${st.found.length} sur ${n}.`, fact: q.fact,
    stamps: g.fmt === "voisins" ? st.found.map(i => q.items[i].id) : [],
    learn: miss.length ? [{ t: q.title, f: "il manquait " + miss.map(it => it.label).join(", ") }] : []
  });
}

/* ===================== LE PETIT BAC ===================== */
let PB_DICT = null, PB_ANY = null;
const PB_PART = new Set(["de", "du", "des", "d", "et", "van", "von", "der", "le", "la"]);
function pbDict() {
  if (PB_DICT) return PB_DICT;
  const person = k => k === "celeb" || k === "chanteur";
  const mk = (list, k) => list.map(s => {
    const al = s.split("/"), keys = al.map(norm);
    if (person(k)) al.forEach(a => { const w = norm(a).split(" "); if (w.length > 1) { const sur = w.slice(1).filter(x => !PB_PART.has(x)).join(" "); if (sur.length >= 3 && !keys.includes(sur)) keys.push(sur); } });
    return { label: al[0], al, keys };
  });
  PB_DICT = {};
  for (const k in PB_RAW) PB_DICT[k] = mk(PB_RAW[k].split("|"), k);
  // les chanteurs comptent aussi comme personnalités
  const seenC = new Set(PB_DICT.celeb.map(e => e.keys[0]));
  PB_DICT.chanteur.forEach(e => { if (!seenC.has(e.keys[0])) PB_DICT.celeb.push(e); });
  PB_DICT.pays = COUNTRIES.map(c => ({ label: c.name, al: [c.name, ...c.alt], keys: countryKeys(c) }));
  PB_DICT.capitale = COUNTRIES.filter(c => c.cap).map(c => ({ label: c.cap, al: [c.cap, ...c.capAlt], keys: capKeys(c) }));
  const seen = new Set(PB_DICT.ville.map(e => e.keys[0]));
  PB_DICT.capitale.forEach(e => { if (!seen.has(e.keys[0])) PB_DICT.ville.push(e); });
  // lexique étendu (Wiktionnaire) : ajouté après nos listes, marqué x pour que les joueurs simulés gardent les mots courants
  const A = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
  for (const k in PB_LEX) {
    const have = new Set(PB_DICT[k].flatMap(e => e.keys)); let prev = "";
    PB_LEX[k].split("|").forEach(t => {
      const w = prev.slice(0, A.indexOf(t[0])) + t.slice(1); prev = w;
      const key = norm(w); if (!key || have.has(key)) return; have.add(key);
      const label = w[0].toUpperCase() + w.slice(1);
      PB_DICT[k].push({ label, al: [label], keys: [key], x: true });
    });
  }
  // index de tous les mots connus → catégories (pour repérer « Brésil » écrit dans Animal)
  PB_ANY = new Map();
  for (const k in PB_DICT) PB_DICT[k].forEach(e => e.keys.forEach(x => { if (!PB_ANY.has(x)) PB_ANY.set(x, new Set()); PB_ANY.get(x).add(k); }));
  return PB_DICT;
}
// une entrée vaut pour la lettre si l'un de ses noms commence par elle (prénom ou nom pour les personnes)
const startsWith = (e, L) => e.keys.some(k => k[0] === L);
const pbLetterOk = (val, L, cat) => { const w = norm(val).split(" "); return w[0][0] === L || ((cat === "celeb" || cat === "chanteur") && w.slice(1).some(x => !PB_PART.has(x) && x[0] === L)); };
const pbPlausible = x => x.replace(/ /g, "").length >= 3 && /[aeiouy]/.test(x) && !/(.)\1\1/.test(x);
const pbAnswerOf = (e, L) => e.al.find(a => norm(a)[0] === L) || e.al.find(a => norm(a).split(" ").some(w => w[0] === L)) || e.label;
ENG.petitbac = {
  board: true, focus: "pb0",
  diffHint: ["6 catégories, lettres faciles", "8 catégories", "10 catégories, lettres plus rares"],
  build(g, m, d) {
    const D = pbDict(), r = roundRng(g), N = PB_N[d];
    const avail = L => PB_POOL_D[d].filter(c => D[c].filter(e => !e.x && startsWith(e, L)).length >= 3);
    const letters = shuffle(PB_LETTERS[d].split("").filter(L => !g.usedLetters.includes(L)), r);
    let L = letters.find(x => avail(x.toLowerCase()).filter(c => c !== "capitale").length >= N) || "M";
    let pool = shuffle(avail(L.toLowerCase()), r), cats = [];
    for (const c of pool) { if (cats.length >= N) break; if ((c === "ville" && cats.includes("capitale")) || (c === "capitale" && cats.includes("ville"))) continue; cats.push(c); }
    cats.sort((a, b) => PB_POOL.indexOf(a) - PB_POOL.indexOf(b));
    g.usedLetters.push(L); g.mlabel[g.round] = "Lettre " + L;
    return [{ L, cats }];
  },
  start(g) { g.st = { vals: {} }; startTimer(FORMATS.petitbac.secs, pbEnd); },
  view(g) {
    const q = g.qs[0], st = g.st, rev = g.phase === "reveal";
    if (rev) return `<div class="pbhead"><span class="bigletter">${q.L}</span><span class="qsub">Tes réponses et celles du groupe.</span></div>
      <div class="pbres">${st.res.map(r => `<div class="pbrow ${r.pts ? (r.half ? "half" : "ok") : "miss"}"><div class="pbtop"><span class="mono">${esc(PB_CATS[r.cat].label)}</span><span class="pbpts num">${r.pts ? "+" + r.pts : r.val ? "✗" : "—"}</span></div>
        <b>${r.val ? esc(r.val) : "<span class='muted'>Rien</span>"}${r.val && !r.valid ? ` <small class="muted">${esc(r.why)}</small>` : r.pts ? ` <small class="muted">${r.same ? `aussi trouvé par ${r.same}` : "personne d'autre !"}</small>` : ""}</b>
        ${r.bots.length ? `<div class="pbbots">${r.bots.map(b => `<span class="pchip"><i style="background:${b.color}"></i>${esc(b.name)} : ${esc(b.ans)}</span>`).join("")}</div>` : ""}</div>`).join("")}</div>`;
    return `<div class="pbhead sticky"><span class="bigletter">${q.L}</span><div class="grow">${timerHTML(true)}<span class="note">${q.cats.length} catégories · tout en ${q.L}</span></div></div>
      <div class="pbrows">${q.cats.map((c, i) => `<label class="pbl"><span>${esc(PB_CATS[c].label)}</span><input id="pb${i}" data-cat="${c}" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" enterkeyhint="${i === q.cats.length - 1 ? "done" : "next"}" placeholder="${q.L}…" value="${esc(st.vals[c] || "")}"></label>`).join("")}</div>
      <button class="btn stickybtn" data-g="pbdone">J'ai fini</button>`;
  },
  act(g, a) { if (a === "pbdone" && g.phase === "q") { pbEnd(); return true; } },
  joker: { label: "+15 s", help: "Ajoute 15 secondes au chrono.", use() { addTime(15); } }
};
function pbEnd() {
  const g = game; if (!g || g.phase !== "q") return;
  const q = g.qs[0], st = g.st, D = pbDict(), L = q.L.toLowerCase(), r = roundRng(g, "bots"), unit = FORMATS.petitbac.max / q.cats.length;
  document.querySelectorAll(".pbrows input").forEach(inp => st.vals[inp.dataset.cat] = inp.value);
  let base = 0;
  st.res = q.cats.map(cat => {
    const list = D[cat].map((e, i) => ({ e, i })).filter(x => !x.e.x && startsWith(x.e, L));
    const bots = [];
    BOTS.forEach(b => { if (r() < b.skill * .92 && list.length) { const x = list[Math.floor(Math.pow(r(), 2.2) * Math.min(14, list.length))]; bots.push({ name: b.name, color: b.color, idx: x.i, ans: pbAnswerOf(x.e, L) }); } });
    const val = (st.vals[cat] || "").trim(), x = norm(val);
    let valid = false, half = false, why = "", idx = -1;
    if (val) {
      if (!x) why = "illisible";
      else if (!pbLetterOk(val, L, cat)) why = `ne commence pas par ${q.L}`;
      else {
        // 1) mot exact de la catégorie ; 2) mot exact d'une autre catégorie → refusé ; 3) faute de frappe tolérée sur nos listes courantes
        const other = PB_ANY.get(x), o = other && !other.has(cat) && [...other].find(k => !(cat === "celeb" && k === "chanteur"));
        let hit = D[cat].findIndex(e => e.keys.includes(x));
        if (hit < 0 && !o) hit = D[cat].findIndex(e => !e.x && matchKeys(val, e.keys));
        if (hit >= 0) { valid = true; idx = hit; }
        else {
          if (o) why = `c'est plutôt : ${PB_CATS[o].label.toLowerCase()}`;
          else if (PB_CLOSED.has(cat)) why = cat === "pays" ? "ce n'est pas un pays reconnu" : "ce n'est pas une capitale";
          else why = "absent du dictionnaire";
        }
      }
    }
    const same = valid && !half ? bots.filter(b => b.idx === idx).length : 0;
    const pts = !valid ? 0 : Math.round(unit * (half ? .5 : same === 0 ? 1 : same === 1 ? .7 : .45));
    base += pts;
    return { cat, val, valid, half, why, pts, same, bots, ex: list.slice(0, 3).map(x => pbAnswerOf(x.e, L)) };
  });
  const nOk = st.res.filter(r0 => r0.valid).length, missed = st.res.filter(r0 => !r0.valid);
  award(base, {
    ans: `${nOk} réponse${nOk > 1 ? "s" : ""} valide${nOk > 1 ? "s" : ""} sur ${q.cats.length}.`,
    fact: "Une réponse que personne d'autre n'a trouvée vaut tous les points de la case, 70 % si un autre l'a eue, 45 % au-delà. Les mots inventés ne rapportent rien : nos listes s'appuient sur le Wiktionnaire.",
    learn: missed.slice(0, 3).map(r0 => ({ t: `${PB_CATS[r0.cat].label} en ${q.L}`, f: r0.ex.join(", ") }))
  });
}

/* ===================== PLUS OU MOINS ===================== */
const PM_TXT = {
  pop: { q: "Le second est-il plus ou moins peuplé ?", b: ["Plus peuplé", "Moins peuplé"], f: "La population mondiale a dépassé 8 milliards d'habitants en novembre 2022." },
  area: { q: "Le second est-il plus grand ou plus petit ?", b: ["Plus grand", "Plus petit"], f: "La Russie couvre à elle seule plus de 11 % des terres émergées." },
  alt: { q: "Le second est-il plus haut ou moins haut ?", b: ["Plus haut", "Moins haut"], f: "En 2020, la Chine et le Népal ont fixé ensemble l'altitude de l'Everest à 8 848,86 m." },
  len: { q: "Le second est-il plus long ou plus court ?", b: ["Plus long", "Plus court"], f: "La longueur d'un fleuve dépend de la source retenue : le Nil et l'Amazone se disputent la première place." }
};
function statItems(stat, d) {
  if (stat === "pop" || stat === "area") return COUNTRIES.filter(c => d === 2 || c.tier <= 2).map(c => ({ name: c.name, flag: flagOf(c), v: stat === "pop" ? c.pop : c.area, id: c.id }));
  if (stat === "alt") return PEAKS.map(([n, v]) => ({ name: n, v }));
  if (stat === "len") return RIVERS.map(([n, v]) => ({ name: n, v }));
  return [];
}
const statFmt = (stat, v) => stat === "pop" ? fmtPop(v) : stat === "area" ? fmtArea(v) : stat === "alt" ? `${fmtNum(v)} m` : stat === "len" ? `${fmtNum(v)} km` : yearTxt(v);
const PM_BANDS = [[1.8, 1e9], [1.25, 2.6], [1.08, 1.45]];
ENG.plusmoins = {
  board: true,
  build(g, m, d) {
    const r = roundRng(g), items = statItems(m.key, d), [lo, hi] = PM_BANDS[d];
    const chain = [items[Math.floor(r() * items.length)]];
    for (let i = 0; i < 10; i++) {
      const a = chain[chain.length - 1];
      let c = items.filter(x => !chain.includes(x) && Math.max(x.v, a.v) / Math.min(x.v, a.v) >= lo && Math.max(x.v, a.v) / Math.min(x.v, a.v) <= hi);
      if (!c.length) c = items.filter(x => !chain.includes(x) && x.v !== a.v);
      chain.push(c[Math.floor(r() * c.length)]);
    }
    return [{ stat: m.key, chain }];
  },
  start(g) { g.st = { i: 0, streak: 0, lock: false, last: null }; },
  view(g) {
    const q = g.qs[0], st = g.st, rev = g.phase === "reveal", T = PM_TXT[q.stat];
    if (rev) return `<div class="pmsum">${q.chain.slice(0, st.i + 2).map((x, k) => `<div class="lrow ${k <= st.streak ? "ok" : "miss"}"><span>${x.flag || ""} ${esc(x.name)}</span><b>${statFmt(q.stat, x.v)}</b></div>`).join("")}</div>`;
    const A = q.chain[st.i], B = q.chain[st.i + 1], shown = st.last != null;
    return `<div class="pmhead"><span class="mono">Série</span><span class="pmdots">${Array.from({ length: 10 }, (_, k) => `<i class="${k < st.streak ? "on" : ""}"></i>`).join("")}</span><b class="num">${st.streak}/10</b></div>
      <div class="pmcard"><span class="pmflag">${A.flag || mIcon({ type: "stat", key: q.stat }, 34)}</span><div><b>${esc(A.name)}</b><span class="num">${statFmt(q.stat, A.v)}</span></div></div>
      <div class="pmvs">VS</div>
      <div class="pmcard ${shown ? (st.last ? "ok" : "bad") : ""}" id="pmB"><span class="pmflag">${B.flag || mIcon({ type: "stat", key: q.stat }, 34)}</span><div><b>${esc(B.name)}</b><span class="num" id="pmBv">${shown ? statFmt(q.stat, B.v) : "?"}</span></div></div>
      <p class="qsub center">${T.q}</p>
      <div class="pmbtns"><button class="btn" data-g="pm" data-v="up" ${shown ? "disabled" : ""}>▲ ${T.b[0]}</button><button class="btn alt" data-g="pm" data-v="down" ${shown ? "disabled" : ""}>▼ ${T.b[1]}</button></div>`;
  },
  act(g, a, v) {
    if (a !== "pm" || g.phase !== "q" || g.st.lock) return;
    const q = g.qs[0], st = g.st, A = q.chain[st.i], B = q.chain[st.i + 1];
    const ok = (B.v > A.v) === (v === "up");
    st.lock = true; st.last = ok; if (ok) st.streak++;
    renderGame();
    setTimeout(() => {
      if (!game || game !== g || g.phase !== "q") return;
      st.lock = false; st.last = null;
      if (ok && st.streak < 10) { st.i++; renderGame(); return; }
      if (!ok) st.i = Math.max(st.i, 0);
      award(st.streak * 30, { ans: st.streak === 10 ? "Série parfaite : 10 sur 10 !" : `Série de ${st.streak}.`, fact: PM_TXT[q.stat].f,
        learn: [{ t: `${B.name}`, f: statFmt(q.stat, B.v) }] });
    }, ok ? 850 : 1300);
    return true;
  }
};

/* ===================== CLASSEMENT ===================== */
const ORD_TXT = { pop: "Du plus peuplé au moins peuplé", area: "Du plus grand au plus petit", alt: "Du plus haut au moins haut", len: "Du plus long au plus court", chrono: "Du plus ancien au plus récent" };
function chronoItems() { const out = []; for (const t in DATA.frise) DATA.frise[t].forEach(lv => lv.forEach(q => out.push({ name: q[0], v: q[1] }))); return out; }
ENG.order = {
  stepWord: "Classement", nextWord: "Classement suivant",
  build(g, m, d) {
    const r = roundRng(g), items = m.key === "chrono" ? chronoItems() : statItems(m.key, d);
    const minR = [1.6, 1.25, 1.08][d], minGap = [40, 15, 4][d];
    const used = new Set();
    return [0, 1].map(() => {
      let pick = [];
      for (let relax = 1; relax >= 0 && pick.length < 5; relax -= .25) { // on assouplit l'écart minimum si la réserve est trop petite
        pick = [];
        const ok = (a, b) => m.key === "chrono" ? Math.abs(a.v - b.v) >= Math.max(1, minGap * relax) : a.v !== b.v && Math.max(a.v, b.v) / Math.min(a.v, b.v) >= 1 + (minR - 1) * relax;
        for (const x of shuffle(items, r)) { if (used.has(x.name)) continue; if (pick.every(p => ok(p, x))) pick.push(x); if (pick.length === 5) break; }
      }
      pick.forEach(p => used.add(p.name));
      return { stat: m.key, items: pick };
    });
  },
  start(g) { g.st = { order: [] }; },
  view(g) {
    const q = g.qs[g.qi], st = g.st, rev = g.phase === "reveal";
    const sorted = q.items.slice().sort((a, b) => q.stat === "chrono" ? a.v - b.v : b.v - a.v);
    return `<h2 class="qtitle">${ORD_TXT[q.stat]}</h2><p class="qsub">${rev ? "Le bon ordre :" : "Touche les éléments dans l'ordre. Touche à nouveau pour retirer."}</p>
      <div class="ord">${(rev ? sorted : q.items).map(x => {
        const i = q.items.indexOf(x), pos = st.order.indexOf(i), truePos = sorted.indexOf(x);
        const cls = rev ? (pos === truePos ? "ok" : "bad") : pos >= 0 ? "on" : "";
        return `<button class="orditem ${cls}" data-g="ord" data-v="${i}" ${rev ? "disabled" : ""}><span class="rk num">${rev ? truePos + 1 : pos >= 0 ? pos + 1 : ""}</span><span class="nm">${x.flag ? x.flag + " " : ""}${esc(x.name)}</span>${rev ? `<span class="val num">${statFmt(q.stat, x.v)}${pos !== truePos ? ` · tu l'avais ${pos + 1}e` : ""}</span>` : ""}</button>`;
      }).join("")}</div>
      ${rev ? "" : `<div class="btnrow"><button class="btn ghost" data-g="ordreset">Recommencer</button><button class="btn" data-g="ordok" ${st.order.length === q.items.length ? "" : "disabled"}>Valider</button></div>`}`;
  },
  act(g, a, v) {
    if (g.phase !== "q") return;
    const st = g.st;
    if (a === "ord") { const i = +v, p = st.order.indexOf(i); if (p >= 0) st.order.splice(p, 1); else if (st.order.length < g.qs[g.qi].items.length) st.order.push(i); renderGame(); return true; }
    if (a === "ordreset") { st.order = []; renderGame(); return true; }
    if (a === "ordok" && st.order.length === g.qs[g.qi].items.length) {
      const q = g.qs[g.qi], sorted = q.items.slice().sort((a2, b) => q.stat === "chrono" ? a2.v - b.v : b.v - a2.v);
      const good = st.order.filter((i, p) => sorted.indexOf(q.items[i]) === p).length;
      const n = q.items.length;
      award(Math.round(unitOf(g) * good / n), { ans: good === n ? "Ordre parfait !" : `${good} élément${good > 1 ? "s" : ""} sur ${n} à la bonne place.`,
        learn: [{ t: ORD_TXT[q.stat], f: sorted.map(x => `${x.name} (${statFmt(q.stat, x.v)})`).join(", ") }] });
      return true;
    }
  }
};

/* ===================== RAFALES : VRAI OU FAUX, BLOCS ===================== */
const TRANS = new Set(["TUR", "RUS", "KAZ", "AZE", "GEO", "ARM", "CYP", "EGY"]);
const CURR = { POL: "le złoty", CZE: "la couronne tchèque", HUN: "le forint", ROU: "le leu", SWE: "la couronne suédoise", DNK: "la couronne danoise" };
const REALMS = new Set(["ATG", "BHS", "BLZ", "CAN", "GRD", "JAM", "KNA", "LCA", "VCT", "AUS", "NZL", "PNG", "SLB", "TUV"]);
function tierOk(c, d) { return d === 0 ? c.tier === 1 : d === 1 ? c.tier <= 2 : true; }
function rafaleItems(g, kind, d) {
  const r = roundRng(g), out = [], pick = a => a[Math.floor(r() * a.length)];
  if (RAF_EXTRA[kind]) return RAF_EXTRA[kind](g, d, r);
  const events = keys => { const ev = []; keys.forEach(t => (DATA.frise[t] || []).forEach((lv, li) => { if (li <= d) lv.forEach(q => ev.push(q)); })); return shuffle(ev, r); };
  const dateItems = keys => events(keys).map(q => {
    const truth = r() < .5, [lo, hi] = [[25, 80], [8, 25], [2, 7]][d], delta = Math.round(lo + r() * (hi - lo)) * (r() < .5 ? -1 : 1);
    const y = truth ? q[1] : q[1] + delta;
    return { text: `${q[0]} : ${yearTxt(y)}.`, ans: truth ? 0 : 1, info: truth ? `Exact : ${yearTxt(q[1])}.` : `C'était en ${yearTxt(q[1])}.` };
  });
  if (kind === "hist") return dateItems(["hist", "geopo"]);
  if (kind === "culture") return dateItems(["sport", "sciences", "cine"]);
  const pool = shuffle(COUNTRIES.filter(c => tierOk(c, d)), r);
  if (kind === "geo") return pool.filter(c => c.cap).map(c => {
    const t = r(), truth = r() < .5;
    if (t < .5) { const o = pick(COUNTRIES.filter(x => x.cap && x.id !== c.id && contGroup(x) === contGroup(c) && Math.abs(x.tier - c.tier) <= 1)); return { text: `${(truth ? c : o).cap} est la capitale ${deN(c)}.`, ans: truth ? 0 : 1, info: `La capitale ${deN(c)} est ${c.cap}.` }; }
    if (t < .8 && !TRANS.has(c.id)) { const k = truth ? c.cont : pick(["af", "eu", "as", "am", "oc"].filter(x => x !== c.cont)); return { text: `${LeN(c)} se trouve en ${CNAME[k]}.`, ans: truth ? 0 : 1, info: `${LeN(c)} est en ${CNAME[c.cont]}.` }; }
    return { text: `${LeN(c)} n'a aucun accès à la mer.`, ans: c.land ? 0 : 1, info: c.land ? "Exact, ce pays est enclavé." : "Faux, ce pays a une façade maritime." };
  });
  if (kind === "pays") { const [lo, hi] = PM_BANDS[d]; return pool.map(a => {
    const area = r() < .5, val = x => area ? x.area : x.pop;
    const cands = COUNTRIES.filter(b => b.id !== a.id && tierOk(b, d) && Math.max(val(a), val(b)) / Math.min(val(a), val(b)) >= lo && Math.max(val(a), val(b)) / Math.min(val(a), val(b)) <= hi);
    if (!cands.length) return null; const b = pick(cands);
    return area ? { text: `La superficie ${deN(a)} dépasse celle ${deN(b)}.`, ans: a.area > b.area ? 0 : 1, info: `${fmtArea(a.area)} contre ${fmtArea(b.area)}.` }
      : { text: `${LeN(a)} compte plus d'habitants que ${leN(b)}.`, ans: a.pop > b.pop ? 0 : 1, info: `${fmtPop(a.pop)} contre ${fmtPop(b.pop)}.` };
  }).filter(Boolean); }
  if (kind === "ueotan") return shuffle(COUNTRIES.filter(c => (c.cont === "eu" || ["USA", "CAN"].includes(c.id)) && tierOk(c, d)), r).map(c => ({
    text: LeN(c), flag: flagOf(c), ans: c.eu && c.nato ? 2 : c.eu ? 0 : c.nato ? 1 : 3,
    info: `${c.eu ? "Membre de l'UE" : "Hors de l'UE"}, ${c.nato ? "membre de l'OTAN" : "hors de l'OTAN"}.` }));
  if (kind === "euro") return shuffle(COUNTRIES.filter(c => (c.eu || ["CHE", "NOR", "GBR", "ISL"].includes(c.id) || (d === 2 && ["MCO", "MNE", "AND", "SMR", "VAT"].includes(c.id))) && (d === 2 || c.tier <= 2 || c.eu)), r).map(c => ({
    text: LeN(c), flag: flagOf(c), ans: c.euro ? 0 : 1,
    info: c.id === "BGR" ? "Oui, depuis le 1er janvier 2026." : c.euro ? "Oui, il utilise l'euro." : CURR[c.id] ? `Non : membre de l'UE, il garde ${CURR[c.id]}.` : ["MCO", "MNE", "AND", "SMR", "VAT"].includes(c.id) ? "Non : il utilise l'euro, mais n'est pas membre de la zone euro." : "Non, ce pays n'est pas dans l'Union européenne." }));
  if (kind === "mon") return pool.map(c => ({
    text: LeN(c), flag: flagOf(c), ans: c.mon ? 0 : 1,
    info: c.id === "VAT" ? "Monarchie élective : le pape en est le souverain." : c.id === "AND" ? "Coprincipauté : le président français et l'évêque d'Urgell en sont les coprinces." : c.id === "JPN" ? "Monarchie : le Japon a un empereur." : REALMS.has(c.id) ? "Monarchie : le roi Charles III est aussi son roi." : c.mon ? "Monarchie." : "République." }));
  return out;
}
ENG.rafale = {
  board: true,
  build(g, m) { return [{ kind: m.key, items: rafaleItems(g, m.key, g.diffs[g.round]) }]; },
  start(g) { g.st = { i: 0, ok: 0, ko: 0, hist: [], lock: false }; startTimer(FORMATS[g.fmt].secs, rafaleEnd); },
  view(g) {
    const q = g.qs[0], st = g.st, rev = g.phase === "reveal", K = FORMATS[g.fmt].kinds[q.kind];
    if (rev) return `<div class="lrows">${st.hist.slice(-14).map(h => `<div class="lrow ${h.ok ? "ok" : "miss"}"><span>${h.it.flag ? h.it.flag + " " : ""}${esc(h.it.text)}</span><b>${h.ok ? "✓" : "✗"}</b>${h.ok ? "" : `<small>${esc(h.it.info)}</small>`}</div>`).join("")}</div>`;
    const it = q.items[st.i];
    return `<div class="rfhead"><span class="lives" aria-label="${3 - st.ko} vies">${[0, 1, 2].map(k => `<i class="${k < 3 - st.ko ? "" : "off"}">${I.heart(20)}</i>`).join("")}</span><span class="count num" id="rfcount">${st.ok}<small> ✓</small></span></div>
      ${timerHTML(true)}
      <div class="rfcard ${it.opts ? "q" : ""}" id="rfcard">${rfCardHTML(it)}</div>
      <div class="typemsg" id="rffb" role="status"></div>
      <div class="rfbtns n${(it.opts || K.btn).length} ${it.opts ? "pick" : ""}" id="rfbtns">${rfBtnsHTML(it, K)}</div>`;
  },
  act(g, a, v) {
    if (a !== "rf" || g.phase !== "q" || g.st.lock) return;
    const q = g.qs[0], st = g.st, it = q.items[st.i], ok = +v === it.ans;
    st.hist.push({ it, ok }); ok ? st.ok++ : st.ko++;
    const card = document.getElementById("rfcard"); if (card) card.className = "rfcard " + (ok ? "ok" : "bad");
    flashMsg("rffb", ok ? `${okIco} ${esc(it.info)}` : `${koIco} ${esc(it.info)}`, ok ? "ok" : "bad", ok ? 400 : 1400);
    const cnt = document.getElementById("rfcount"); if (cnt) cnt.innerHTML = `${st.ok}<small> ✓</small>`;
    st.lock = true;
    setTimeout(() => {
      if (!game || game !== g || g.phase !== "q") return;
      st.lock = false;
      if (st.ko >= 3 || st.i + 1 >= q.items.length) { rafaleEnd(); return; }
      st.i++;
      if (!ok) { renderGame(); return; }
      const n = q.items[st.i], c2 = document.getElementById("rfcard"), bb = document.getElementById("rfbtns");
      if (c2) { c2.className = "rfcard " + (n.opts ? "q" : ""); c2.innerHTML = rfCardHTML(n); }
      if (bb && n.opts) bb.innerHTML = rfBtnsHTML(n, FORMATS[g.fmt].kinds[q.kind]);
    }, ok ? 420 : 900);
    return true;
  },
  joker: { label: "+15 s", help: "Ajoute 15 secondes au chrono.", use() { addTime(15); } }
};
const rfCardHTML = it => `${it.flag ? `<span class="bigflag sm">${it.flag}</span>` : ""}<p id="rftext" class="${it.big ? "rfbig num" : ""}">${fr(it.text)}</p>`;
const rfBtnsHTML = (it, K) => (it.opts || K.btn).map((b, i) => `<button class="btn ${it.opts ? (it.opts.length === 2 ? "ghost pickbtn" : "ghost opt4 num") : K.btn.length === 2 ? (i ? "no" : "yes") : "opt4"}" data-g="rf" data-v="${i}">${esc(String(b))}</button>`).join("");
function rafaleEnd() {
  const g = game; if (!g || g.phase !== "q") return;
  const st = g.st, wrong = st.hist.filter(h => !h.ok);
  award(st.ok * 20, { ans: `${st.ok} bonne${st.ok > 1 ? "s" : ""} réponse${st.ok > 1 ? "s" : ""}${st.ko >= 3 ? ", trois erreurs" : ""}.`,
    learn: wrong.slice(0, 4).map(h => ({ t: h.it.text, f: h.it.info })) });
}

/* ===================== CONNEXIONS ===================== */
const CX_COL = ["#F2C94C", "#6FCF97", "#56A8E8", "#B07CE0"];
ENG.connex = {
  stepWord: "Grille",
  build(g, m, d) { const P = fromPool(g, CONNEX[d], 1, `cx|${d}`, true)[0]; return [{ groups: P.map(([label, words]) => ({ label, words })) }]; },
  start(g) {
    const q = g.qs[0];
    g.st = { words: shuffle(q.groups.flatMap((gr, gi) => gr.words.map(w => ({ w, gi })))), sel: [], solved: [], mist: 0 };
  },
  view(g) {
    const q = g.qs[0], st = g.st, rev = g.phase === "reveal";
    const solved = (rev ? q.groups.map((_, gi) => gi) : st.solved).map(gi => `<div class="cxrow" style="--c:${CX_COL[gi]}"><b>${esc(q.groups[gi].label)}</b><span>${q.groups[gi].words.map(esc).join(" · ")}</span>${rev && !st.solved.includes(gi) ? `<small>non trouvée</small>` : ""}</div>`).join("");
    if (rev) return `<div class="cxsolved">${solved}</div>`;
    const left = st.words.filter(x => !st.solved.includes(x.gi));
    return `<p class="qsub">Trouve quatre groupes de quatre mots qui vont ensemble.</p>
      <div class="cxsolved">${solved}</div>
      <div class="cxgrid">${left.map(x => { const i = st.words.indexOf(x); return `<button class="cxw ${st.sel.includes(i) ? "on" : ""}" data-g="cxw" data-v="${i}" id="cx${i}">${esc(x.w)}</button>`; }).join("")}</div>
      <div class="cxmist"><span class="mono">Erreurs</span>${[0, 1, 2, 3].map(k => `<i class="${k < st.mist ? "off" : ""}"></i>`).join("")}</div>
      <div class="typemsg" id="cxmsg" role="status"></div>
      <div class="btnrow3"><button class="btn ghost" data-g="cxmix">Mélanger</button><button class="btn ghost" data-g="cxclr">Effacer</button><button class="btn" data-g="cxok" id="cxok" ${st.sel.length === 4 ? "" : "disabled"}>Valider</button></div>`;
  },
  act(g, a, v) {
    if (g.phase !== "q") return;
    const st = g.st, q = g.qs[0];
    if (a === "cxw") {
      const i = +v, p = st.sel.indexOf(i);
      if (p >= 0) st.sel.splice(p, 1); else if (st.sel.length < 4) st.sel.push(i);
      const el = document.getElementById("cx" + i); if (el) el.classList.toggle("on", st.sel.includes(i));
      const ok = document.getElementById("cxok"); if (ok) ok.disabled = st.sel.length !== 4;
      return true;
    }
    if (a === "cxmix") { const fixed = st.words; st.words = shuffle(fixed); st.sel = st.sel.map(i => st.words.indexOf(fixed[i])); renderGame(); return true; }
    if (a === "cxclr") { st.sel = []; renderGame(); return true; }
    if (a === "cxok" && st.sel.length === 4) {
      const gis = st.sel.map(i => st.words[i].gi), counts = {};
      gis.forEach(x => counts[x] = (counts[x] || 0) + 1);
      const top = Math.max(...Object.values(counts));
      if (top === 4) { st.solved.push(gis[0]); st.sel = []; if (st.solved.length === 4) return cxEnd(g), true; renderGame(); return true; }
      st.mist++;
      if (st.mist >= 4) return cxEnd(g), true;
      renderGame(); flashMsg("cxmsg", top === 3 ? "Presque ! Un seul mot n'est pas à sa place." : "Ces quatre mots ne vont pas ensemble.", "bad", 1800);
      return true;
    }
  }
};
function cxEnd(g) {
  const q = g.qs[0], st = g.st, miss = q.groups.filter((_, gi) => !st.solved.includes(gi));
  award(Math.max(0, st.solved.length * 75 - st.mist * 15), { ans: st.solved.length === 4 ? `Grille complète, avec ${st.mist} erreur${st.mist > 1 ? "s" : ""}.` : `${st.solved.length} famille${st.solved.length > 1 ? "s" : ""} trouvée${st.solved.length > 1 ? "s" : ""} sur 4.`,
    learn: miss.map(gr => ({ t: gr.label, f: gr.words.join(", ") })) });
}

/* ===================== LE MOT DU JOUR ===================== */
const KB = ["AZERTYUIOP", "QSDFGHJKLM", "<WXCVBN>"];
function wordleEval(guess, word) {
  const res = Array(word.length).fill("x"), left = {};
  for (let i = 0; i < word.length; i++) { if (guess[i] === word[i]) res[i] = "g"; else left[word[i]] = (left[word[i]] || 0) + 1; }
  for (let i = 0; i < word.length; i++) if (res[i] !== "g" && left[guess[i]]) { res[i] = "y"; left[guess[i]]--; }
  return res;
}
ENG.wordle = {
  stepWord: "Mot",
  diffHint: ["Mots de 5 lettres", "Mots de 6 lettres", "Mots de 7 lettres"],
  build(g, m, d) { const W = fromPool(g, WORDS[d], 1, `wd|${d}`, true)[0]; g.mlabel[g.round] = `Mot de ${W[0].length} lettres`; return [{ word: W[0], hint: W[1], fact: W[2] }]; },
  start(g) { g.st = { rows: [], cur: "", keys: {}, hint: null }; },
  view(g) {
    const q = g.qs[0], st = g.st, L = q.word.length, rev = g.phase === "reveal";
    const rows = [];
    for (let r = 0; r < 6; r++) {
      const row = st.rows[r], cur = r === st.rows.length && !rev ? st.cur : "";
      rows.push(`<div class="wrow" style="--n:${L}">${Array.from({ length: L }, (_, i) => { const ch = row ? row.w[i] : cur[i] || ""; return `<span class="wt ${row ? row.res[i] : ch ? "typed" : ""}">${ch}</span>`; }).join("")}</div>`);
    }
    const kb = rev ? "" : `<div class="kb">${KB.map(line => `<div class="kbl">${line.split("").map(k => k === "<" ? `<button class="kk wide" data-g="key" data-v="BK" aria-label="Effacer">⌫</button>` : k === ">" ? `<button class="kk wide ok" data-g="key" data-v="OK">Entrée</button>` : `<button class="kk ${st.keys[k] || ""}" data-g="key" data-v="${k}">${k}</button>`).join("")}</div>`).join("")}</div>`;
    return `<div class="whint"><span class="mono">Indice</span><b>${esc(q.hint)}</b><span class="num">${L} lettres${st.hint ? ` · lettre ${st.hint.pos + 1} : ${st.hint.ch}` : ""}</span></div>
      <div class="wgrid">${rows.join("")}</div><div class="typemsg" id="wmsg" role="status"></div>${kb}`;
  },
  act(g, a, v) { if (a === "key" && g.phase === "q") { wordleKey(g, v); return true; } },
  joker: { label: "Une lettre", help: "Révèle une lettre bien placée.", use(g) {
    const q = g.qs[0], st = g.st, known = new Set(); st.rows.forEach(r => r.res.forEach((x, i) => { if (x === "g") known.add(i); }));
    const pos = [...q.word].findIndex((_, i) => !known.has(i)); if (pos >= 0) st.hint = { pos, ch: q.word[pos] }; renderGame();
  } }
};
function wordleKey(g, k) {
  const q = g.qs[0], st = g.st, L = q.word.length;
  if (k === "BK") st.cur = st.cur.slice(0, -1);
  else if (k === "OK") {
    if (st.cur.length < L) { renderGame(); flashMsg("wmsg", `Il faut ${L} lettres.`, "bad"); return; }
    const res = wordleEval(st.cur, q.word);
    st.rows.push({ w: st.cur, res });
    [...st.cur].forEach((ch, i) => { const rank = { g: 3, y: 2, x: 1 }, cur = st.keys[ch]; if (!cur || rank[res[i]] > rank[cur]) st.keys[ch] = res[i]; });
    const win = st.cur === q.word; st.cur = "";
    if (win || st.rows.length === 6) {
      g.grid[g.round] = st.rows.map(r => r.res.map(x => x === "g" ? "🟩" : x === "y" ? "🟨" : "⬜").join(""));
      award(win ? [300, 260, 220, 180, 140, 100][st.rows.length - 1] : 0, { ans: win ? `Trouvé en ${st.rows.length} essai${st.rows.length > 1 ? "s" : ""} : ${q.word}.` : `Le mot était ${q.word}.`, fact: q.fact, learn: [{ t: q.word, f: q.fact }] });
      return;
    }
  } else if (/^[A-Z]$/.test(k) && st.cur.length < L) st.cur += k;
  renderGame();
}
document.addEventListener("keydown", e => {
  if (!game || game.phase !== "q" || FORMATS[game.fmt].eng !== "wordle" || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "Enter") { e.preventDefault(); wordleKey(game, "OK"); }
  else if (e.key === "Backspace") { e.preventDefault(); wordleKey(game, "BK"); }
  else { const k = norm(e.key).toUpperCase(); if (/^[A-Z]$/.test(k)) wordleKey(game, k); }
});

/* ===================== QUI SUIS-JE ? ===================== */
const CLUE_PTS = [1, .75, .5, .25];
ENG.clues = {
  focus: "typein", stepWord: "Énigme",
  build(g, m, d) {
    return fromPool(g, CLUES[m.key][d], 2, `cl|${m.key}|${d}`).map(c => ({ ans: c[0], keys: [c[0], ...c[1]].map(norm), clues: c[2], fact: c[3] }));
  },
  start(g) { g.st = { shown: 1, initial: false }; },
  view(g) {
    const q = g.qs[g.qi], st = g.st, rev = g.phase === "reveal", unit = unitOf(g);
    const shown = rev ? 4 : st.shown;
    return `<h2 class="qtitle">Qui suis-je ?</h2>
      <ol class="clues">${q.clues.map((c, i) => i < shown ? `<li class="${i === shown - 1 && !rev ? "new" : ""}"><span class="cp num">${Math.round(unit * CLUE_PTS[i])}</span>${fr(c)}</li>` : `<li class="hidden"><span class="cp num">${Math.round(unit * CLUE_PTS[i])}</span>Indice ${i + 1}</li>`).join("")}</ol>
      ${rev ? "" : `${st.initial ? `<p class="note">Initiale : <b>${esc(q.ans[0])}</b> · ${q.ans.replace(/[^A-Za-zÀ-ÿ]/g, "").length} lettres</p>` : ""}${typeBox("Ta réponse…")}
      <div class="btnrow"><button class="btn ghost" data-g="clnext" ${st.shown >= 4 ? "disabled" : ""}>Indice suivant</button><button class="btn ghost" data-g="clpass">Je passe</button></div>`}`;
  },
  type(g, val, submit) {
    if (!submit) return;
    const q = g.qs[g.qi], st = g.st;
    if (matchKeys(val, q.keys)) { award(Math.round(unitOf(g) * CLUE_PTS[st.shown - 1]), { ans: `Bravo : ${fr(q.ans)}, avec ${st.shown} indice${st.shown > 1 ? "s" : ""}.`, fact: q.fact, learn: [{ t: q.ans, f: q.fact }] }); return true; }
    if (st.shown >= 4) { award(0, { ans: `Raté. C'était ${fr(q.ans)}.`, fact: q.fact, learn: [{ t: q.ans, f: q.fact }] }); return true; }
    st.shown++; renderGame(); flashMsg("typemsg", `${koIco} Non… voici un autre indice.`, "bad"); return true;
  },
  act(g, a) {
    if (g.phase !== "q") return;
    const q = g.qs[g.qi];
    if (a === "clnext" && g.st.shown < 4) { g.st.shown++; renderGame(); return true; }
    if (a === "clpass") { award(0, { ans: `C'était ${fr(q.ans)}.`, fact: q.fact, learn: [{ t: q.ans, f: q.fact }] }); return true; }
  },
  joker: { label: "Initiale", help: "Donne la première lettre et la longueur de la réponse.", use(g) { g.st.initial = true; renderGame(); } }
};

/* ===================== RELIER ===================== */
const PAIR_COL = ["#6B5BE2", "#1FA36A", "#E08A2E", "#2BA3B8", "#C2417A"];
ENG.pairs = {
  stepWord: "Grille",
  build(g, m, d) {
    if (m.key === "geo") {
      const r = roundRng(g), list = countryQueue(["af", "eu", "as", "am"][Math.floor(r() * 4)], d, r, c => !!c.cap).slice(0, 5);
      return [{ h: ["Pays", "Capitale"], pairs: list.map(c => [c.name, c.cap]) }];
    }
    const P = PAIRS[m.key];
    return [{ h: P.hh[d], pairs: fromPool(g, P.d[d], 5, `pairs|${m.key}|${d}`) }];
  },
  start(g) { const q = g.qs[0]; g.st = { right: shuffle(q.pairs.map((_, i) => i)), selL: null, selR: null, done: [], mist: 0, bad: null }; },
  view(g) {
    const q = g.qs[0], st = g.st, rev = g.phase === "reveal";
    const colOf = i => st.done.includes(i) ? `style="--c:${PAIR_COL[st.done.indexOf(i)]}"` : "";
    return `<p class="qsub">Touche un élément de gauche, puis son partenaire à droite.</p>
      <div class="pairs"><div class="pcol"><span class="mono">${esc(q.h[0])}</span>${q.pairs.map((p, i) => `<button class="pbtn ${st.done.includes(i) ? "done" : st.selL === i ? "on" : ""} ${st.bad && st.bad[0] === i ? "bad" : ""}" ${colOf(i)} data-g="pl" data-v="${i}" ${st.done.includes(i) || rev ? "disabled" : ""}>${esc(p[0])}</button>`).join("")}</div>
      <div class="pcol"><span class="mono">${esc(q.h[1])}</span>${st.right.map(j => `<button class="pbtn ${st.done.includes(j) ? "done" : st.selR === j ? "on" : ""} ${st.bad && st.bad[1] === j ? "bad" : ""}" ${colOf(j)} data-g="pr" data-v="${j}" ${st.done.includes(j) || rev ? "disabled" : ""}>${esc(q.pairs[j][1])}</button>`).join("")}</div></div>
      ${rev ? "" : `<p class="note center">Erreurs : ${st.mist}</p>`}`;
  },
  act(g, a, v) {
    if (g.phase !== "q" || (a !== "pl" && a !== "pr")) return;
    const st = g.st, q = g.qs[0];
    if (a === "pl") st.selL = +v; else st.selR = +v;
    st.bad = null;
    if (st.selL != null && st.selR != null) {
      if (st.selL === st.selR) st.done.push(st.selL); else { st.mist++; st.bad = [st.selL, st.selR]; }
      st.selL = st.selR = null;
      if (st.done.length === q.pairs.length) { award(Math.max(0, FORMATS.relier.max - st.mist * 15), { ans: st.mist ? `Tout relié, avec ${st.mist} erreur${st.mist > 1 ? "s" : ""}.` : "Sans faute !", learn: q.pairs.map(p => ({ t: p[0], f: p[1] })) }); return true; }
    }
    renderGame(); return true;
  }
};
