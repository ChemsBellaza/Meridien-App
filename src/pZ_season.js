/* ============ FIN DE SAISON (v31) : cérémonie, titres, trophées, palmarès, carte à partager, bandeaux de saison ============
   Les données viennent du serveur (season_recap, season_hall, my_trophies) ; les titres, forts / faibles et le rival se calculent ici,
   à partir des mêmes données pour tout le monde. Uniquement des fonctions déclarées (hoisting) : fichier chargé avant pB_logic. */
SRV.trophies = []; SRV.hall = {}; SRV.cerBusy = false;
const CER_STEPS = ["intro", "podium", "bilan", "forts", "rival", "titres", "prix"];

/* ---------- chargement ---------- */
async function srvLoadTrophies() {
  const r = await srvRpc("my_trophies");
  if (Array.isArray(r)) SRV.trophies = r;
}
async function srvLoadHall(gid) {
  const r = await srvRpc("season_hall", { p_group: gid });
  if (Array.isArray(r)) SRV.hall[gid] = r;
  if (ui.sheet === "hall" && !game) render();
}
const cerSeen = () => (store.profile && store.profile.seasonSeen) || {};
function cerMarkSeen(gid, n) { if (!store.profile) return; store.profile.seasonSeen = { ...cerSeen(), [gid]: n }; save(); }
// au lancement : une cérémonie à voir pour chaque groupe dont une saison est terminée depuis ma dernière visite
async function srvCheckCeremony() {
  if (!srvOn() || srvLost() || SRV.cerBusy || game || ui.sheet || ui.confirm) return;
  const cur = seasonOf(today()).n; if (cur < 2) return;
  SRV.cerBusy = true;
  try {
    for (const g of SRV.groups) {
      const last = cur - 1; if ((cerSeen()[g.id] || 0) >= last) continue;
      const r = await srvRpc("season_recap", { p_group: g.id, p_season: last });
      if (!r || r.error === "not_final" || r.error === "offline") continue; // on réessaiera
      if (!r.ok || game || ui.sheet) { if (r.ok === false) cerMarkSeen(g.id, last); continue; }
      const me = (r.players || []).find(p => p.id === myUid());
      if (!me || (r.players || []).length < 2) { cerMarkSeen(g.id, last); continue; } // pas joué cette saison, ou joué seul : pas de cérémonie
      cerMarkSeen(g.id, last); cerShow(r); await srvLoadTrophies(); break;
    }
  } catch (e) {} finally { SRV.cerBusy = false; }
}
async function cerOpen(gid, season) {
  ui.toast = ""; const r = await srvRpc("season_recap", { p_group: gid, p_season: +season });
  if (!r || !r.ok) { ui.hallMsg = "Cette cérémonie n'est pas disponible pour le moment."; if (ui.sheet === "hall") render(); return; }
  cerShow(r);
}
function cerShow(r) { ui.cer = { step: 0, d: r, a: cerAnalyse(r, myUid()) }; ui.sheet = "cer"; render(); }

/* ---------- analyse : titres, forts, faibles, rival ---------- */
const cerFmtName = f => (FORMATS[f] && FORMATS[f].name) || f || "un jeu";
const cerRel = r => (r.n > 1 ? (r.p - 1) / (r.n - 1) : null); // 0 = 1er, 1 = dernier
const CER_TITLES = [
  { id: "regulier", ico: "📅", name: "Le Régulier", min: p => p.days >= 10, score: p => p.days * 1e6 + p.total, why: p => `${p.days} jours joués sur ${CONFIG.seasonDays}` },
  { id: "sprinteur", ico: "⚡", name: "Le Sprinteur", min: p => p.days >= 8 && p.secs > 0, score: p => -p.secs, why: p => `${p.secs} s de réflexion par partie en moyenne` },
  { id: "erudit", ico: "🎓", name: "L'Érudit", min: p => p.days >= 8, score: p => p.avg, why: p => `${fmtNum(p.avg)} points de moyenne` },
  { id: "revenant", ico: "🔥", name: "Le Revenant", min: p => p.early != null && p.late != null && p.early - p.late >= 0.15, score: p => p.early - p.late, why: p => "il a remonté le classement du jour au fil de la saison" },
  { id: "poison", ico: "🗡️", name: "Le Poison", min: p => p.beaten >= 5, score: p => p.beaten, why: p => `${p.beaten} places devancées sur la saison` }
];
function cerTitles(P) {
  const out = {}; // id joueur -> { ico, name, why }
  P.filter(p => p.rank === 1).forEach(p => { out[p.id] = { ico: "👑", name: p.rank === 1 && P.filter(x => x.rank === 1).length > 1 ? "Co-champion" : "Le Champion", why: "1re place de la saison" }; });
  CER_TITLES.forEach(t => {
    const pool = P.filter(p => !out[p.id] && t.min(p)).sort((a, b) => t.score(b) - t.score(a));
    if (pool[0]) out[pool[0].id] = { ico: t.ico, name: t.name, why: t.why(pool[0]) };
  });
  P.forEach(p => { if (!out[p.id]) out[p.id] = p.wins > 0 ? { ico: "⚔️", name: "Le Chasseur de victoires", why: `${p.wins} victoire${p.wins > 1 ? "s" : ""} du jour` } : p.days >= 10 ? { ico: "💙", name: "Le Fidèle", why: `${p.days} jours joués` } : { ico: "🌱", name: "L'Outsider", why: "la saison prochaine sera la bonne" }; });
  return out;
}
function cerAnalyse(d, meId) {
  const P = d.players, R = d.rows, me = P.find(p => p.id === meId) || null, mine = R.filter(r => r.u === meId).sort((a, b) => (a.d < b.d ? -1 : 1));
  const A = { P, me, titles: cerTitles(P), mine, highs: [], lows: [], rival: null };
  const multi = mine.filter(r => r.n > 1);
  if (me) {
    const bestRow = mine.reduce((m, r) => (!m || r.b > m.b ? r : m), null), win = multi.filter(r => r.p === 1);
    if (bestRow) A.highs.push(["⭐", `Meilleur score : <b>${fmtNum(bestRow.b)} pts</b> (${esc(cerFmtName(bestRow.f))}, ${shortDate(bestRow.d)})`]);
    if (win.length) A.highs.push(["🏆", `<b>${win.length} victoire${win.length > 1 ? "s" : ""}</b> du jour${win.length === 1 ? ` : ${esc(cerFmtName(win[0].f))}, ${shortDate(win[0].d)}` : ""}`]);
    let run = 1, best = mine.length ? 1 : 0; for (let i = 1; i < mine.length; i++) { run = mine[i].d === addDays(mine[i - 1].d, 1) ? run + 1 : 1; best = Math.max(best, run); }
    if (best >= 2) A.highs.push(["🔥", `Plus longue série : <b>${best} jours</b> de suite`]);
    if (me.beaten > 0) A.highs.push(["⚔️", `<b>${me.beaten}</b> place${me.beaten > 1 ? "s" : ""} devancée${me.beaten > 1 ? "s" : ""} en tout`]);
    const gain = mine.reduce((m, r) => (!m || r.g > m.g ? r : m), null);
    if (gain && gain.g > 0) A.highs.push(["🧭", `Plus gros gain : <b>+${fmtNum(gain.g)} boussoles</b> le ${shortDate(gain.d)}`]);
    A.best = best;
    const worst = multi.reduce((m, r) => (!m || cerRel(r) > cerRel(m) || (cerRel(r) === cerRel(m) && r.b < m.b) ? r : m), null);
    if (worst && cerRel(worst) >= 0.5) A.lows.push(["🌧️", `Ton jour sans : <b>${esc(cerFmtName(worst.f))}</b>, ${shortDate(worst.d)} (n°${worst.p} sur ${worst.n})`]);
    const byF = {}; multi.forEach(r => { (byF[r.f] = byF[r.f] || []).push(cerRel(r)); });
    const fl = Object.entries(byF).map(([f, a]) => [f, a.reduce((s, x) => s + x, 0) / a.length, a.length]).sort((a, b) => b[1] - a[1] || b[2] - a[2])[0];
    if (fl && fl[1] >= 0.4) A.lows.push(["💀", `Ta bête noire : <b>${esc(cerFmtName(fl[0]))}</b> (rang moyen dans le bas du classement)`]);
    const miss = CONFIG.seasonDays - mine.length;
    if (miss > 0) A.lows.push(["📭", `<b>${miss} jour${miss > 1 ? "s" : ""}</b> sans jouer : il y a de la place pour la saison suivante`]);
    if (!A.lows.length) A.lows.push(["✨", "Rien à signaler : une saison sans faute !"]);
    // rival : le joueur le plus proche de ton total (à égalité, celui qui est devant)
    const others = P.filter(p => p.id !== meId).sort((a, b) => Math.abs(a.total - me.total) - Math.abs(b.total - me.total) || a.rank - b.rank), rv = others[0];
    if (rv) {
      const theirs = new Map(R.filter(r => r.u === rv.id).map(r => [r.d, r])); let ahead = 0, behind = 0, tie = 0, together = 0;
      mine.forEach(r => { const o = theirs.get(r.d); if (!o) return; together++; if (r.b > o.b) ahead++; else if (r.b < o.b) behind++; else tie++; });
      A.rival = { p: rv, ahead, behind, tie, together, gap: rv.total - me.total };
    }
  }
  const top = R.reduce((m, r) => (!m || r.b > m.b ? r : m), null);
  A.groupTop = top ? { r: top, p: P.find(p => p.id === top.u) } : null;
  A.games = R.length;
  return A;
}

/* ---------- affichage ---------- */
function cerPerson(p, cls = "md") { return avatar({ id: p.id, name: p.name, color: colorOf(p.id), pet: p.pet || defaultPet("renard"), photo: p.id === myUid() ? store.profile.photo : (SRV.photos[p.id] || {}).d }, cls); }
const CER_MEDAL = ["🥇", "🥈", "🥉"];
function cerStep(c) {
  const d = c.d, A = c.a, me = A.me, st = CER_STEPS[c.step], P = A.P, toiTag = p => (p.id === myUid() ? toi : "");
  if (st === "intro") {
    const n = P.length;
    return `<div class="cerhero"><span class="kicker">${esc(d.group)}</span><h2 class="cerbig">Saison ${d.season} terminée</h2><p class="muted">${shortDate(d.d1)} – ${shortDate(d.d2)}</p>
      <div class="certrophy" aria-hidden="true">🏆</div>
      <p>${n} joueurs, ${fmtNum(A.games)} parties jouées${A.groupTop ? `.<br>Meilleur score de la saison : <b>${fmtNum(A.groupTop.r.b)} pts</b> par <b>${esc(A.groupTop.p ? A.groupTop.p.name : "?")}</b> (${esc(cerFmtName(A.groupTop.r.f))}).` : "."}</p>
      <p class="note">Prêt à découvrir le podium ?</p></div>`;
  }
  if (st === "podium") {
    const top = P.filter(p => p.rank <= 3), col = i => top.filter(p => p.rank === i + 1);
    const slot = i => col(i).map(p => `<div class="pod pod${i + 1}" style="--d:${(2 - i) * 0.9 + 0.2}s"><span class="medal" aria-hidden="true">${CER_MEDAL[i]}</span>${cerPerson(p, "lg")}<b>${esc(p.name)}${toiTag(p)}</b><span class="num">${fmtNum(p.total)} ${I.compass(14)}</span><i class="bar"></i></div>`).join("");
    const order = [1, 0, 2].map(i => slot(i)).join("");
    const meLine = me && me.rank > 3 ? `<p class="note center">Toi : n°${me.rank} sur ${P.length}, ${fmtNum(me.total)} boussoles.</p>` : "";
    return `<div class="cerhero"><span class="kicker">Le podium</span><h2 class="cerbig">${P[0] ? esc(P[0].name) : ""} remporte la saison !</h2></div><div class="podium3">${order}</div>${meLine}`;
  }
  if (st === "bilan") {
    if (!me) return `<p class="note">Tu n'as pas joué cette saison.</p>`;
    const tile = (ic, v, l) => `<div class="ctile"><span aria-hidden="true">${ic}</span><b class="num">${v}</b><small>${l}</small></div>`;
    return `<div class="cerhero"><span class="kicker">Ton bilan</span><h2 class="cerbig">n°${me.rank} sur ${P.length}</h2></div>
      <div class="ctiles">${tile("🧭", fmtNum(me.total), "boussoles")}${tile("📅", me.days + "/" + CONFIG.seasonDays, "jours joués")}${tile("🏆", me.wins, me.wins > 1 ? "victoires" : "victoire")}${tile("🔥", A.best || 0, "jours de série max")}${tile("⭐", fmtNum(me.top), "meilleur score")}${tile("🎯", fmtNum(me.avg), "moyenne")}</div>`;
  }
  if (st === "forts") {
    const li = a => a.map(([ic, t]) => `<li><span aria-hidden="true">${ic}</span><span>${t}</span></li>`).join("");
    return `<div class="cerhero"><span class="kicker">Ta saison en détail</span></div><div class="cerbox good"><b>Temps forts</b><ul class="hl">${li(A.highs)}</ul></div><div class="cerbox bad"><b>Temps faibles</b><ul class="hl">${li(A.lows)}</ul></div>`;
  }
  if (st === "rival") {
    const rv = A.rival; if (!rv) return `<p class="note">Pas de rival cette saison.</p>`;
    const verdict = rv.together === 0 ? "Vous ne vous êtes jamais croisés sur un même jeu." : rv.ahead > rv.behind ? "Dans le face-à-face, tu l'emportes." : rv.ahead < rv.behind ? "Dans le face-à-face, c'est lui qui l'emporte." : "Duel parfaitement équilibré.";
    return `<div class="cerhero"><span class="kicker">Ton meilleur rival</span><h2 class="cerbig">Le duel de la saison</h2></div>
      <div class="duel"><div class="side">${cerPerson(me && P.find(p => p.id === myUid()) || rv.p, "lg")}<b>Toi</b><span class="num">${rv.ahead}</span></div><span class="vs">VS</span><div class="side">${cerPerson(rv.p, "lg")}<b>${esc(rv.p.name)}</b><span class="num">${rv.behind}</span></div></div>
      <p class="center">${rv.together ? `Sur <b>${rv.together}</b> jeu${rv.together > 1 ? "x" : ""} joué${rv.together > 1 ? "s" : ""} tous les deux${rv.tie ? ` (dont ${rv.tie} égalité${rv.tie > 1 ? "s" : ""})` : ""}.` : ""} ${verdict}</p>
      <p class="note center">${rv.gap > 0 ? `Il termine ${fmtNum(rv.gap)} boussoles devant toi (n°${rv.p.rank}).` : rv.gap < 0 ? `Tu termines ${fmtNum(-rv.gap)} boussoles devant lui (n°${rv.p.rank}).` : `Vous finissez à égalité (n°${rv.p.rank}).`}</p>`;
  }
  if (st === "titres") {
    const mt = A.titles[myUid()];
    const rows = P.slice().sort((a, b) => a.rank - b.rank).map(p => { const t = A.titles[p.id]; return `<li class="${p.id === myUid() ? "me" : ""}">${cerPerson(p, "sm")}<span class="tt"><b>${esc(p.name)}${toiTag(p)}</b><small>${t.ico} ${esc(t.name)} · ${esc(t.why)}</small></span></li>`; }).join("");
    return `<div class="cerhero"><span class="kicker">Les titres de la saison</span>${mt ? `<div class="mytitle"><span aria-hidden="true">${mt.ico}</span><h2 class="cerbig">${esc(mt.name)}</h2><p class="muted">${esc(mt.why)}</p></div>` : ""}</div><ul class="ttlist">${rows}</ul>`;
  }
  // prix
  const aw = me ? me.award : 0, rk = me ? me.rank : 0;
  const pr = rk === 1 ? `Fond de familier <b>« Or de champion »</b> débloqué.` : rk > 1 && rk <= 3 ? `Fond de familier <b>« Podium »</b> débloqué.` : "";
  return `<div class="cerhero"><span class="kicker">Ta récompense</span><div class="certrophy" aria-hidden="true">${rk && rk <= 3 ? CER_MEDAL[rk - 1] : "🧭"}</div>
    ${aw ? `<h2 class="cerbig">+${fmtNum(aw)} boussoles</h2><p class="muted">${rk && rk <= 3 ? `Podium : ${[150, 100, 60][rk - 1]}` : ""}${me && me.days >= 14 ? `${rk && rk <= 3 ? " + " : ""}20 d'assiduité (14 jours joués ou plus)` : ""}. Elles sont déjà dans ton portefeuille.</p>` : `<h2 class="cerbig">Merci d'avoir joué !</h2><p class="muted">Joue au moins 14 jours sur 21 pour gagner un bonus d'assiduité la prochaine fois.</p>`}
    ${pr ? `<p>${pr}</p>` : ""}</div>
    <div class="btnline cerend"><button class="btn" data-act="cershare">Partager ma saison</button></div>
    <p class="note center">La saison ${d.season + 1} commence avec un bonus à +0 %. Bonne chance !</p>`;
}
function vCeremony() {
  const c = ui.cer; if (!c) return "";
  const last = c.step === CER_STEPS.length - 1, first = c.step === 0;
  const dots = CER_STEPS.map((s, i) => `<i class="${i === c.step ? "on" : i < c.step ? "past" : ""}"></i>`).join("");
  return `<div class="scrim cer" role="presentation"><div class="sheet cersheet" role="dialog" aria-modal="true" aria-label="Fin de la saison ${c.d.season}" data-stop>
    <div class="cerdots" role="img" aria-label="Étape ${c.step + 1} sur ${CER_STEPS.length}">${dots}</div>
    <div class="cerbody" aria-live="polite" key="${c.step}">${cerStep(c)}</div>
    <div class="btnline cernav">${first ? `<button class="smallbtn ghost" data-act="cerclose">Passer</button>` : `<button class="smallbtn ghost" data-act="cerprev">Retour</button>`}${last ? `<button class="smallbtn" data-act="cerclose">Terminer</button>` : `<button class="smallbtn" data-act="cernext">${first ? "Révéler le podium" : "Suivant"}</button>`}</div>
  </div></div>`;
}

/* ---------- palmarès du groupe ---------- */
function vHall() {
  const g = SRV.group, hall = g && SRV.hall[g.id], uid = myUid();
  const items = !hall ? `<p class="note">Chargement du palmarès…</p>` : !hall.length ? `<p class="note">Pas encore de saison terminée dans ce groupe : le premier podium arrive à la fin de la saison ${seasonOf(today()).n}.</p>`
    : hall.map(h => `<li class="hallrow"><div class="hh"><b>Saison ${h.season}</b><button class="smallbtn ghost" data-act="ceropen" data-v="${esc(g.id)}|${h.season}">Revoir la cérémonie</button></div><ol class="hpod">${h.top.map(p => `<li class="${p.id === uid ? "me" : ""}"><span aria-hidden="true">${CER_MEDAL[p.rank - 1] || ""}</span>${cerPerson(p, "sm")}<b>${esc(p.name)}${p.id === uid ? toi : ""}</b><span class="num">${fmtNum(p.total)}</span></li>`).join("")}</ol></li>`).join("");
  return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Palmarès" data-stop>
    <div class="sheethead"><div><h3>Palmarès</h3><div class="muted">${esc(g ? g.name : "")} · les champions de chaque saison</div></div></div>
    ${ui.hallMsg ? `<p class="err" role="alert">${esc(ui.hallMsg)}</p>` : ""}
    <ul class="halllist">${items}</ul>
    <button class="btn ghost" data-act="closesheet">Fermer</button></div></div>`;
}
// trophées du profil : mes places sur un podium, tous groupes confondus
function trophyBlock() {
  const t = SRV.trophies || []; if (!srvOn()) return "";
  const body = t.length ? `<ul class="trlist">${t.map(x => `<li><button class="hrow" data-act="ceropen" data-v="${esc(x.group_id)}|${x.season}"><span class="medal" aria-hidden="true">${CER_MEDAL[x.rank - 1]}</span><span class="grow"><b>Saison ${x.season}</b><small>${esc(x.group)}</small></span><b class="num">${fmtNum(x.total)}<small> 🧭</small></b></button></li>`).join("")}</ul>` : `<p class="note">Termine sur le podium d'une saison pour décrocher ton premier trophée. Chaque saison dure ${CONFIG.seasonDays} jours.</p>`;
  return `<section class="trophies" aria-label="Trophées de saison"><div class="kicker">Trophées de saison</div>${body}</section>`;
}

/* ---------- bandeaux de saison (dernier jour, nouvelle saison) ---------- */
function seasonLeft(k) { return CONFIG.seasonDays - dayInSeason(k); }
const seasonMasked = k => seasonLeft(k) <= 2 && dayInSeason(k) >= 19; // les 3 derniers jours : le classement général est masqué
function seasonBanner() {
  const k = today(), left = seasonLeft(k), n = seasonOf(k).n; if (!store.profile || !store.profile.pet) return "";
  if (left === 0) return `<div class="sbanner gold" role="note"><b>🏁 Dernier jour de la saison ${n}</b><span>Bonus à +100 % : chaque place compte double. Le classement final est dévoilé demain à 14 h 30.</span></div>`;
  if (left <= 2) return `<div class="sbanner" role="note"><b>⏳ Plus que ${left + 1} jours</b><span>Le classement général est masqué jusqu'à la fin de la saison : suspense jusqu'au bout !</span></div>`;
  if (dayInSeason(k) === 1 && n > 1) {
    const g = srvOn() && SRV.group, has = g && (SRV.hall[g.id] || []).some(h => h.season === n - 1);
    return `<div class="sbanner" role="note"><b>🌱 Nouvelle saison : la saison ${n}</b><span>Les compteurs repartent à zéro, le bonus aussi. Revanche pour tout le monde !${has ? "" : ""}</span>${g ? `<button class="smallbtn ghost" data-act="ceropen" data-v="${esc(g.id)}|${n - 1}">Revoir la cérémonie de la saison ${n - 1}</button>` : ""}</div>`;
  }
  return "";
}

/* ---------- carte à partager (image) ---------- */
function cerShareCard(c) {
  const A = c.a, me = A.me, d = c.d, W = 1080, H = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const x = cv.getContext("2d"), t = me && A.titles[myUid()];
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#1C1850"); g.addColorStop(1, "#4C3EBE"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,194,74,.18)"; x.beginPath(); x.arc(880, 220, 330, 0, 7); x.fill();
  x.textAlign = "center"; x.fillStyle = "#FFC24A"; x.font = "800 44px Nunito, sans-serif"; x.fillText("MÉRIDIEN", W / 2, 120);
  x.fillStyle = "#fff"; x.font = "700 84px Unbounded, Nunito, sans-serif"; x.fillText("Saison " + d.season, W / 2, 250);
  x.fillStyle = "rgba(255,255,255,.75)"; x.font = "600 44px Nunito, sans-serif"; x.fillText(d.group, W / 2, 316);
  const rk = me ? me.rank : 0;
  x.fillStyle = "#FFC24A"; x.font = "800 300px Unbounded, Nunito, sans-serif"; x.fillText(rk ? "#" + rk : "", W / 2, 700);
  x.fillStyle = "#fff"; x.font = "800 66px Nunito, sans-serif"; x.fillText(me ? me.name : "", W / 2, 790);
  if (t) { x.fillStyle = "#FFC24A"; x.font = "700 60px Nunito, sans-serif"; x.fillText(t.ico + "  " + t.name, W / 2, 880); }
  const stats = me ? [[fmtNum(me.total), "boussoles"], [me.days + "/" + CONFIG.seasonDays, "jours joués"], [String(me.wins), me.wins > 1 ? "victoires" : "victoire"]] : [];
  stats.forEach(([v, l], i) => { const cx = 240 + i * 300; x.fillStyle = "#fff"; x.font = "800 80px Nunito, sans-serif"; x.fillText(v, cx, 1060); x.fillStyle = "rgba(255,255,255,.7)"; x.font = "600 38px Nunito, sans-serif"; x.fillText(l, cx, 1115); });
  x.fillStyle = "rgba(255,255,255,.6)"; x.font = "600 36px Nunito, sans-serif"; x.fillText("Un jeu par jour, entre amis", W / 2, 1270);
  return new Promise(res => cv.toBlob(b => res(b), "image/png"));
}
async function cerShare() {
  const c = ui.cer; if (!c) return;
  const blob = await cerShareCard(c); if (!blob) return;
  const file = new File([blob], `meridien-saison-${c.d.season}.png`, { type: "image/png" });
  const text = `Ma saison ${c.d.season} sur Méridien : n°${c.a.me ? c.a.me.rank : "?"} dans « ${c.d.group} » !`;
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  ui.toast = "saved"; render();
}

/* ---------- graphique de la saison (v41, épuré) : part de la gauche, 3 repères horizontaux, toi + le top 3 en couleur ;
   « Voir tous les joueurs » ajoute les autres en traits discrets ---------- */
function seasonChart(st) {
  const W = 360, H = 250, L = 34, Rr = 36, T = 14, B = 26, list = st.list, all = !!ui.chartAll;
  let first = Infinity; list.forEach(r => { const j = r.series.findIndex(v => v > 0); if (j >= 0) first = Math.min(first, j); });
  const start = isFinite(first) ? Math.max(0, first - 1) : 0; // on commence la veille du premier jour joué
  const ser = r => { const s = r.series.slice(start); return s.length < 2 ? [0, ...s] : s; };
  const m = Math.max(1, ...list.map(r => ser(r).length - 1));
  const maxV = Math.max(100, ...list.map(r => r.total)), step = maxV > 1000 ? 500 : maxV > 400 ? 200 : maxV > 200 ? 100 : 50;
  let top = Math.ceil(maxV / step) * step; if (top / step > 4) top = Math.ceil(maxV / (step * 2)) * step * 2; // 3 à 4 repères au plus
  const X = i => L + (W - L - Rr) * (i / m), Y = v => T + (H - T - B) * (1 - v / top), yb = H - B;
  const f = (n, d = 1) => (+n).toFixed(d);
  let grid = ""; const gstep = top / Math.min(4, Math.round(top / step));
  for (let v = 0; v <= top + 0.1; v += gstep) grid += `<line x1="${L}" x2="${W - Rr}" y1="${f(Y(v))}" y2="${f(Y(v))}" stroke="var(--grid)" stroke-width="1" opacity="${v === 0 ? .9 : .4}"/><text x="${L - 6}" y="${f(Y(v) + 4)}" text-anchor="end" font-size="11" font-weight="800" font-family="Nunito, sans-serif" fill="var(--ink-2)">${fmtNum(v)}</text>`;
  [[1, "start"], [m, "end"]].forEach(([i, anc]) => { const d = st.days[start + i - 1]; if (d && (i === m || m > 2)) grid += `<text x="${f(X(i))}" y="${H - 7}" text-anchor="${anc}" font-size="11" font-weight="800" font-family="Nunito, sans-serif" fill="var(--ink-2)">${shortDate(d)}</text>`; });
  const smooth = pts => pts.reduce((s, p, i) => (i === 0 ? `M${f(p[0])} ${f(p[1])}` : `${s} C${f((pts[i - 1][0] + p[0]) / 2)} ${f(pts[i - 1][1])} ${f((pts[i - 1][0] + p[0]) / 2)} ${f(p[1])} ${f(p[0])} ${f(p[1])}`), "");
  const podium = new Set(list.slice(0, 3).map(r => r.id)), shown = r => r.me || podium.has(r.id);
  const draw = list.filter(r => all || shown(r)).sort((a, b) => (shown(a) ? 1 : 0) - (shown(b) ? 1 : 0) || (a.me ? 1 : 0) - (b.me ? 1 : 0) || a.total - b.total); // les lignes importantes au-dessus
  let lines = "", defs = "", ends = [];
  draw.forEach(r => {
    const pts = ser(r).map((v, i) => [X(i), Y(v)]), d = smooth(pts), last = pts[pts.length - 1], key = shown(r);
    if (r.me) { defs += `<linearGradient id="gme" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r.color}" stop-opacity=".26"/><stop offset="1" stop-color="${r.color}" stop-opacity="0"/></linearGradient>`; lines += `<path class="carea" d="${d} L${f(last[0])} ${yb} L${f(pts[0][0])} ${yb} Z" fill="url(#gme)"/>`; }
    lines += `<path class="cline" pathLength="1" d="${d}" fill="none" stroke="${key ? r.color : "var(--ink-2)"}" stroke-width="${r.me ? 4 : key ? 2.8 : 1.4}" stroke-linecap="round" stroke-linejoin="round" opacity="${key ? 1 : .35}"/>`;
    if (key) ends.push({ r, x: last[0], y: last[1], ly: last[1] });
  });
  ends.sort((a, b) => a.y - b.y); for (let i = 1; i < ends.length; i++) if (ends[i].ly - ends[i - 1].ly < 22) ends[i].ly = ends[i - 1].ly + 22;
  const over = ends.length ? ends[ends.length - 1].ly - (yb - 10) : 0; if (over > 0) ends.forEach(e => { e.ly -= over; });
  const marks = ends.map(e => { const cx = W - Rr + 17, c = e.r.color, ini = esc(((e.r.name || "?").trim()[0] || "?").toUpperCase());
    return `<circle cx="${f(e.x)}" cy="${f(e.y)}" r="${e.r.me ? 5 : 4}" fill="${c}" stroke="var(--paper)" stroke-width="2"/><line x1="${f(e.x + 5)}" y1="${f(e.y)}" x2="${cx - 12}" y2="${f(e.ly)}" stroke="${c}" stroke-width="1.4" opacity=".6"/><circle cx="${cx}" cy="${f(e.ly)}" r="12" fill="${c}" stroke="${e.r.me ? "#FFC24A" : "var(--paper)"}" stroke-width="2.4"/><text x="${cx}" y="${f(e.ly + 4.3)}" text-anchor="middle" font-size="12" font-weight="900" font-family="Nunito, sans-serif" fill="#fff" stroke="rgba(0,0,0,.35)" stroke-width=".6" paint-order="stroke">${ini}</text>`; }).join("");
  const lead = list[0], aria = `Évolution des boussoles cumulées. ${lead ? `${lead.name} est premier avec ${fmtNum(lead.total)} boussoles.` : ""}`;
  const toggle = list.length > 4 ? `<button type="button" class="smallbtn ghost chartall" data-act="chartall" aria-pressed="${all}">${all ? "Voir le top 3 et moi" : "Voir tous les joueurs"}</button>` : "";
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}"><defs>${defs}</defs>${grid}${lines}${marks}</svg>${toggle}`;
}