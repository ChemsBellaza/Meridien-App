/* =================== RÉCAP DE SAISON (aperçu, adresse ?recap) ===================
   La saison racontée comme un carnet de voyage : méridiens du globe, tampons, tickets, cartes postales, compagnon de route.
   On parcourt les écrans en touchant le bord droit (suivant) ou gauche (précédent). Données de démonstration pour l'instant. */
const RC_PETS = {
  me:  { species: "ours", stage: "2", shiny: "shiny", bg: "type" },
  yas: { species: "tigre", stage: "3", shiny: "normal", bg: "type" },
  theo: { species: "ours", stage: "2", shiny: "normal", bg: "type" },
  nad: { species: "lapin", stage: "3", shiny: "shiny", bg: "type" },
  kar: { species: "loutre", stage: "2", shiny: "normal", bg: "type" },
  lea: { species: "tortue", stage: "1", shiny: "normal", bg: "type" },
  fla: { species: "renard", stage: "2", shiny: "normal", bg: "type" }
};
const RC_CREAM = "#FFF6EC", RC_INK = "#2A2333", RC_GOLD = "#FFD66B";
function rcMeridians(c = "#fff") { // motif de fond : méridiens et parallèles du globe
  return `<svg class="rcgrid" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="${c}" stroke-width="1.2">
    <ellipse cx="200" cy="400" rx="60" ry="380"/><ellipse cx="200" cy="400" rx="130" ry="380"/><ellipse cx="200" cy="400" rx="200" ry="380"/><ellipse cx="200" cy="400" rx="270" ry="380"/>
    <path d="M-20 400H420M0 250Q200 290 400 250M0 550Q200 510 400 550M30 130Q200 170 370 130M30 670Q200 630 370 670"/></svg>`;
}
function rcGlobe(sz = 230) { // globe du logo, grand, avec une orbite pointillée et un éclat doré
  return `<svg class="rcglobe" width="${sz}" height="${sz}" viewBox="0 0 240 240" role="img" aria-label="Globe Méridien">
    <defs><radialGradient id="rcgg" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#9A8CFF"/><stop offset="1" stop-color="#4C3EBE"/></radialGradient></defs>
    <ellipse cx="120" cy="120" rx="112" ry="40" fill="none" stroke="${RC_GOLD}" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round" transform="rotate(-24 120 120)"/>
    <circle cx="120" cy="120" r="78" fill="url(#rcgg)" stroke="${RC_INK}" stroke-width="5"/>
    <g fill="none" stroke="${RC_CREAM}" stroke-width="3.5" stroke-linecap="round"><ellipse cx="120" cy="120" rx="30" ry="78"/><path d="M42 120H198M52 84Q120 96 188 84M52 156Q120 144 188 156"/></g>
    <path d="M196 38l5 13 13 5-13 5-5 13-5-13-13-5 13-5z" fill="${RC_GOLD}" stroke="${RC_INK}" stroke-width="3" stroke-linejoin="round"/></svg>`;
}
function rcStamp(big, small, ring) { // tampon circulaire : texte courbe autour, gros chiffre au centre
  const fs = String(big).length > 2 ? 52 : 70;
  return `<svg class="rcstamp" viewBox="0 0 200 200" role="img" aria-label="${small}">
    <defs><path id="rcarc" d="M100 100m-71 0a71 71 0 1 1 142 0a71 71 0 1 1-142 0"/></defs>
    <g fill="none" stroke="currentColor"><circle cx="100" cy="100" r="95" stroke-width="5"/><circle cx="100" cy="100" r="86" stroke-width="1.8"/><circle cx="100" cy="100" r="52" stroke-width="1.8" stroke-dasharray="3 5"/></g>
    <text font-family="Unbounded,sans-serif" font-weight="800" font-size="12.5" fill="currentColor"><textPath href="#rcarc" textLength="436" lengthAdjust="spacing">${ring}</textPath></text>
    <text x="100" y="124" text-anchor="middle" font-family="Unbounded,sans-serif" font-weight="800" font-size="${fs}" fill="currentColor">${big}</text></svg>`;
}
function rcLines() { // courbes de la saison (démo) : toi et tes deux adversaires les plus proches
  const W = 320, H = 250, N = 21, series = [["#FFD66B", "fla", .86], ["#8DE0C0", "yas", 1.08], ["#FF9C8A", "me", 1.0]];
  const out = series.map(([c, k, f], si) => {
    const r = rng("rc" + k); let t = 0; const pts = [];
    for (let d = 0; d <= N; d++) { pts.push(t); t += (60 + r() * 120) * f * (si === 0 && d > 12 ? .3 : 1); }
    return { c, k, pts };
  });
  const mx = Math.max(...out.map(s => s.pts[N]));
  const xy = (d, v) => [(d / N * W).toFixed(1), (H - v / mx * (H - 16) - 6).toFixed(1)];
  const paths = out.map(s => `<polyline fill="none" stroke="${s.c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${s.pts.map((v, d) => xy(d, v).join(",")).join(" ")}"/><circle cx="${xy(N, s.pts[N])[0]}" cy="${xy(N, s.pts[N])[1]}" r="6.5" fill="${s.c}" stroke="${RC_INK}" stroke-width="2.5"/>`).join("");
  const grid = [0, 1, 2, 3].map(i => `<line x1="0" x2="${W}" y1="${(i * H / 3).toFixed(1)}" y2="${(i * H / 3).toFixed(1)}" stroke="rgba(255,255,255,.16)" stroke-dasharray="2 6" stroke-linecap="round"/>`).join("") + [0, 7, 14, 21].map(d => `<line y1="0" y2="${H}" x1="${d / N * W}" x2="${d / N * W}" stroke="rgba(255,255,255,.1)"/>`).join("");
  return { svg: `<svg viewBox="-6 -4 ${W + 12} ${H + 8}" class="rcchart" role="img" aria-label="Courbes de boussoles cumulées sur la saison">${grid}${paths}</svg>`, totals: out.map(s => [s.k, Math.round(s.pts[N] / 10) * 10]) };
}
function rcDemoSlides() {
  const P = k => petAv(RC_PETS[k], "xl", k);
  const aw = (ic, ttl, who, why, pet) => `<li class="rcaw"><span class="rcmedal" aria-hidden="true">${ic}</span><span class="rctx"><b>${ttl}</b><em>${who}</em><small>${why}</small></span><span class="rcpet">${petAv(RC_PETS[pet], "md", who)}</span></li>`;
  const ln = rcLines();
  const pod = (rk, name, pet, gems, cls) => `<div class="rcpod ${cls}">${rk === 1 ? `<span class="rcflag" aria-hidden="true">⚑</span>` : ""}<span class="rcpodpet">${petAv(RC_PETS[pet], "xl", name)}</span><b>${name}</b><span class="rcg">${I.compass(16)}${gems}</span><span class="rcstep"><i>${rk}</i></span></div>`;
  const S = [
    /* 0 départ */
    { bg: "linear-gradient(165deg,#3A2C8C,#15102E 72%)", html: `<div class="rctop"><div class="rckick">Carnet de bord</div></div><div class="rcmid">${rcGlobe(232)}<h1>Saison 4</h1><p class="rcsub">Ton voyage du 3 au 23 novembre</p></div><div class="rcfoot"><b class="rcgold">Barça Gang</b><span>Touche pour embarquer</span></div>` },
    /* 1 arrivée au classement */
    { bg: "linear-gradient(165deg,#6B5BE2,#3B2FA0 78%)", html: `<div class="rctop"><div class="rckick">Ta saison</div></div><div class="rcmid"><div class="rcstampw">${rcStamp("3e", "3e place au classement final", "CLASSEMENT FINAL · SAISON 4 · MÉRIDIEN ·")}</div><p class="rcsub">sur 11 voyageurs</p>
      <div class="rctiles"><div><b class="num">1 840</b><span>${I.compass(16)} boussoles</span></div><div><b class="num">20<small>/21</small></b><span>escales jouées</span></div><div><b class="num">4</b><span>jours gagnés</span></div></div>
      <p class="rcnote">Rang moyen : <b>4,2</b></p></div>` },
    /* 2 la route */
    { bg: "linear-gradient(165deg,#1B2A55,#15102E 78%)", html: `<div class="rctop"><h2>C'était serré</h2><p class="rcsub">Ta route face aux deux voyageurs les plus proches</p></div><div class="rcmid">${ln.svg}<div class="rcends"><span>Départ</span><span>Arrivée</span></div><div class="rcleg">${ln.totals.map(([k, t]) => `<span>${petAv(RC_PETS[k], "md", k)}<b>${t.toLocaleString("fr-FR")}</b>${I.compass(14)}</span>`).join("")}</div></div>` },
    /* 3 rival */
    { bg: "linear-gradient(165deg,#E8685F,#8E2F66 82%)", html: `<div class="rctop"><div class="rckick">Ton rival de route</div></div><div class="rcmid"><div class="rcduel">${P("me")}<span class="rcneedle" aria-hidden="true">${I.compass(46)}</span>${P("yas")}</div><p class="rcsub"><b>Toi</b> face à <b>Yasmine</b></p>
      <div class="rctiles three"><div><b class="num">9</b><span>victoires</span></div><div><b class="num">1</b><span>égalité</span></div><div><b class="num">11</b><span>défaites</span></div></div><p class="rcnote">Vos scores ne diffèrent que de 6 % en moyenne.</p></div>` },
    /* 4 carte postale */
    { bg: "linear-gradient(165deg,#F2B33E,#C46A1B 88%)", dark: 1, html: `<div class="rctop"><h2>Ta carte postale</h2><p class="rcsub">Le jeu où tu as le plus brillé</p></div><div class="rcmid"><div class="rcpost"><div class="rcphoto">${art("carte", "recap")}</div><div class="rcpostbar"><span><b>La Carte</b><small>Meilleur du groupe 3 fois sur 4</small></span><span class="rcpstamp" aria-hidden="true">✦<small>612</small></span></div></div></div>` },
    /* 5 médailles */
    { bg: "linear-gradient(165deg,#17977F,#0D5C57 88%)", html: `<div class="rctop"><h2>Médailles du voyage</h2><p class="rcsub">Les moments marquants du groupe</p></div><ul class="rcaws">${aw("🥇", "Roi du podium", "Yasmine", "15 podiums", "yas")}${aw("🔥", "Remontada", "Nadia", "11 places gagnées en un jeu", "nad")}${aw("🎯", "Métronome", "Théo", "Écart de rang : 2,4 seulement", "theo")}${aw("💪", "Jamais absent", "Karim", "100 % de participation", "kar")}${aw("🌱", "Éclosion tardive", "Léa", "3,5 places gagnées en 2e moitié", "lea")}${aw("🧭", "Globe-trotteur", "Toi", "46 pays tamponnés au carnet", "me")}</ul>` },
    /* 6 compagnon de voyage */
    { bg: "linear-gradient(165deg,#3B2FA0,#15102E 82%)", html: `<div class="rctop"><div class="rckick">Ton compagnon de voyage</div><h2>Caillourson a grandi</h2></div><div class="rcmid"><div class="rcevo"><span class="rcev">${petAv({ species: "ours", stage: "1", shiny: "normal", bg: "type" }, "xl", "Caillourson")}<small>Caillourson</small></span><i aria-hidden="true">›</i><span class="rcev now">${petAv(RC_PETS.me, "xl", "Rocours")}<small>Rocours ✦</small></span></div>
      <div class="rctiles three"><div><b class="num">20</b><span>escales à deux</span></div><div><b class="num">2</b><span>stade sur 3</span></div><div><b class="num">✦</b><span>chromatique</span></div></div><p class="rcnote">Prochaine évolution dans 10 parties.</p></div>` },
    /* 7 équipage */
    { bg: "linear-gradient(165deg,#6B5BE2,#2A1F6B 88%)", html: `<div class="rctop"><h2>L'équipage</h2><p class="rcsub">Les compagnons du groupe et leur stade</p></div><div class="rcmid"><div class="rczoo">${["yas", "nad", "theo", "kar", "fla", "lea"].map(k => `<span class="rcz">${petAv(RC_PETS[k], "xl", k)}<i>Stade ${RC_PETS[k].stage}</i>${RC_PETS[k].shiny === "shiny" ? `<em>✦</em>` : ""}</span>`).join("")}</div><p class="rcnote">2 chromatiques, 3 compagnons au stade final.</p></div>` },
    /* 8 arrivée */
    { bg: "linear-gradient(165deg,#3A2C8C,#15102E 72%)", html: `<div class="rctop"><div class="rckick">Arrivée</div><h2>Saison 4</h2></div><div class="rcmid"><div class="rcpodium">${pod(2, "Nadia", "nad", "2 710", "p2")}${pod(1, "Yasmine", "yas", "3 260", "p1")}${pod(3, "Toi", "me", "1 840", "p3 me")}</div></div><div class="rcfoot"><button class="btn" data-act="rcnone">Voir le classement</button></div>` }
  ];
  return S;
}

/* coque commune : route à escales, motif de fond, zones tactiles. mode réel = cérémonie de fin de saison ; démo = adresse ?recap */
function rcShell(s, i, n, real, label) {
  const route = `<div class="rcroute" aria-hidden="true">${Array.from({ length: n }, (_, k) => `${k ? `<i class="l ${k <= i ? "on" : ""}"></i>` : ""}<b class="s ${k < i ? "on" : ""} ${k === i ? "cur" : ""}"></b>`).join("")}</div><div class="rctag" aria-hidden="true">Escale ${i + 1} / ${n} · Méridien 0°</div>`;
  const zl = real ? `data-act="cerprev"` : `data-act="rc" data-v="-1"`, zr = real ? `data-act="cernext"` : `data-act="rc" data-v="1"`;
  return `<div class="rcp ${s.dark ? "dark" : ""}" style="--rbg:${s.bg}" role="${real ? "dialog" : "region"}" aria-label="${esc(label)}, écran ${i + 1} sur ${n}">${rcMeridians(s.dark ? "#4a2800" : "#fff")}<div class="rchead">${real ? `<button class="rcclose" data-act="cerclose" aria-label="Fermer le récap">✕</button>` : ""}${route}</div><div class="rcbody">${s.html}</div>
    <button class="rczone l" ${zl} aria-label="Écran précédent"></button><button class="rczone r" ${zr} aria-label="Écran suivant"></button></div>`;
}
function vRecap() { // aperçu avec données de démonstration
  const S = rcDemoSlides(), i = Math.max(0, Math.min(S.length - 1, ui.rc || 0));
  return rcShell(S[i], i, S.length, false, "Récap de saison (aperçu)");
}
// courbes cumulées de la saison : series = [{ c: couleur, pts: [...] }]
function rcChart(series) {
  const W = 320, H = 250, N = Math.max(1, series[0].pts.length - 1), mx = Math.max(1, ...series.map(s => s.pts[s.pts.length - 1]));
  const xy = (d, v) => [(d / N * W).toFixed(1), (H - v / mx * (H - 16) - 6).toFixed(1)];
  const paths = series.map(s => `<polyline fill="none" stroke="${s.c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${s.pts.map((v, d) => xy(d, v).join(",")).join(" ")}"/><circle cx="${xy(N, s.pts[N])[0]}" cy="${xy(N, s.pts[N])[1]}" r="6.5" fill="${s.c}" stroke="${RC_INK}" stroke-width="2.5"/>`).join("");
  const grid = [0, 1, 2, 3].map(i => `<line x1="0" x2="${W}" y1="${(i * H / 3).toFixed(1)}" y2="${(i * H / 3).toFixed(1)}" stroke="rgba(255,255,255,.16)" stroke-dasharray="2 6" stroke-linecap="round"/>`).join("") + [0, 7, 14, 21].filter(d => d <= N).map(d => `<line y1="0" y2="${H}" x1="${d / N * W}" x2="${d / N * W}" stroke="rgba(255,255,255,.1)"/>`).join("");
  return `<svg viewBox="-6 -4 ${W + 12} ${H + 8}" class="rcchart" role="img" aria-label="Courbes de boussoles cumulées sur la saison">${grid}${paths}</svg>`;
}
/* écrans réels, à partir des données de la cérémonie (season_recap) et de leur analyse (cerAnalyse) */
function rcRealSlides(c) {
  const d = c.d, A = c.a, P = A.P, me = A.me, R = d.rows || [], uid = myUid(), S = [];
  const sd = Math.max(1, CONFIG.seasonDays), cnt = (n, one, many) => n + " " + (n > 1 ? many : one);
  const petOf = p => (p.id === uid && store.profile && store.profile.pet) || p.pet || defaultPet("renard");
  const av = (p, sz = "xl") => petAv(petOf(p), sz, p.name);
  const nm = p => (p.id === uid ? "Toi" : esc(p.name));
  const mine = A.mine.filter(r => r.n > 1), fix1 = x => (Math.round(x * 10) / 10).toString().replace(".", ",");
  const days = []; for (let k = d.d1; k <= d.d2; k = addDays(k, 1)) days.push(k);
  const cum = id => { const g = {}; R.filter(r => r.u === id).forEach(r => { g[r.d] = (g[r.d] || 0) + r.g; }); let t = 0; return [0, ...days.map(k => (t += g[k] || 0))]; };
  /* 0 · départ */
  S.push({ bg: "linear-gradient(165deg,#3A2C8C,#15102E 72%)", html: `<div class="rctop"><div class="rckick">Carnet de bord</div></div><div class="rcmid">${rcGlobe(232)}<h1>Saison ${d.season}</h1><p class="rcsub">Ton voyage du ${shortDate(d.d1)} au ${shortDate(d.d2)}</p></div><div class="rcfoot"><b class="rcgold">${esc(d.group)}</b><span>Touche pour embarquer</span></div>` });
  /* 1 · classement final */
  if (me) {
    const avgRank = mine.length ? mine.reduce((s, r) => s + r.p, 0) / mine.length : 0, wins = me.wins;
    S.push({ bg: "linear-gradient(165deg,#6B5BE2,#3B2FA0 78%)", html: `<div class="rctop"><div class="rckick">Ta saison</div></div><div class="rcmid"><div class="rcstampw">${rcStamp(me.rank + (me.rank === 1 ? "er" : "e"), me.rank + "e place au classement final", `CLASSEMENT FINAL · SAISON ${d.season} · MÉRIDIEN ·`)}</div><p class="rcsub">sur ${cnt(P.length, "voyageur", "voyageurs")}</p>
      <div class="rctiles"><div><b class="num">${fmtNum(me.total)}</b><span>${I.compass(16)} boussoles</span></div><div><b class="num">${me.days}<small>/${sd}</small></b><span>escales jouées</span></div><div><b class="num">${wins}</b><span>${wins > 1 ? "jours gagnés" : "jour gagné"}</span></div></div>
      ${avgRank ? `<p class="rcnote">Rang moyen : <b>${fix1(avgRank)}</b></p>` : ""}</div>` });
  }
  /* 2 · la route (toi et les deux plus proches) */
  if (me && P.length >= 2) {
    const near = P.filter(p => p.id !== uid).sort((a, b) => Math.abs(a.total - me.total) - Math.abs(b.total - me.total) || a.rank - b.rank).slice(0, 2);
    const pal = ["#FF9C8A", "#FFD66B", "#8DE0C0"], grp = [me, ...near], ser = grp.map((p, k) => ({ c: pal[k], pts: cum(p.id), p }));
    const tight = near[0] && Math.abs(near[0].total - me.total) <= Math.max(60, me.total * .05);
    S.push({ bg: "linear-gradient(165deg,#1B2A55,#15102E 78%)", html: `<div class="rctop"><h2>${tight ? "C'était serré" : "Ta route"}</h2><p class="rcsub">Toi${near.length > 1 ? " et les deux voyageurs les plus proches" : " et ton plus proche voyageur"}</p></div><div class="rcmid">${rcChart(ser)}<div class="rcends"><span>Départ</span><span>Arrivée</span></div><div class="rcleg">${ser.map(s => `<span>${av(s.p, "md")}<b>${fmtNum(s.p.total)}</b>${I.compass(14)}</span>`).join("")}</div></div>` });
  }
  /* 3 · rival */
  if (A.rival) {
    const rv = A.rival, verdict = rv.together === 0 ? "Vous ne vous êtes jamais croisés sur un même jeu." : rv.ahead > rv.behind ? "Dans le face-à-face, tu l'emportes." : rv.ahead < rv.behind ? "Dans le face-à-face, c'est lui qui l'emporte." : "Duel parfaitement équilibré.";
    S.push({ bg: "linear-gradient(165deg,#E8685F,#8E2F66 82%)", html: `<div class="rctop"><div class="rckick">Ton rival de route</div></div><div class="rcmid"><div class="rcduel">${av(me)}<span class="rcneedle" aria-hidden="true">${I.compass(46)}</span>${av(rv.p)}</div><p class="rcsub"><b>Toi</b> face à <b>${esc(rv.p.name)}</b></p>
      <div class="rctiles three"><div><b class="num">${rv.ahead}</b><span>${rv.ahead > 1 ? "victoires" : "victoire"}</span></div><div><b class="num">${rv.tie}</b><span>${rv.tie > 1 ? "égalités" : "égalité"}</span></div><div><b class="num">${rv.behind}</b><span>${rv.behind > 1 ? "défaites" : "défaite"}</span></div></div><p class="rcnote">${rv.together ? `Sur ${cnt(rv.together, "jeu joué", "jeux joués")} tous les deux. ` : ""}${verdict}</p></div>` });
  }
  /* 4 · carte postale : le jeu où ton rang relatif est le meilleur */
  {
    const byF = {}; mine.forEach(r => { (byF[r.f] = byF[r.f] || []).push(r); });
    const best = Object.entries(byF).filter(([f]) => FORMATS[f]).map(([f, a]) => ({ f, a, rel: a.reduce((s, r) => s + cerRel(r), 0) / a.length, first: a.filter(r => r.p === 1).length, avg: Math.round(a.reduce((s, r) => s + r.b, 0) / a.length) })).sort((x, y) => x.rel - y.rel || y.a.length - x.a.length || y.avg - x.avg)[0];
    if (best) S.push({ bg: "linear-gradient(165deg,#F2B33E,#C46A1B 88%)", dark: 1, html: `<div class="rctop"><h2>Ta carte postale</h2><p class="rcsub">Le jeu où tu as le plus brillé</p></div><div class="rcmid"><div class="rcpost"><div class="rcphoto">${art(best.f, "recap")}</div><div class="rcpostbar"><span><b>${esc(cerFmtName(best.f))}</b><small>${best.first ? `Meilleur du groupe ${best.first} fois sur ${best.a.length}` : `${cnt(best.a.length, "jour joué", "jours joués")}`}</small></span><span class="rcpstamp" aria-hidden="true">✦<small>${fmtNum(best.avg)}</small></span></div></div></div>` });
  }
  /* 5 · médailles du voyage (calculées sur tout le groupe) */
  {
    const multi = R.filter(r => r.n > 1), byU = {}; multi.forEach(r => (byU[r.u] = byU[r.u] || []).push(r));
    const pOf = id => P.find(p => p.id === id), aws = [];
    { let b = null; Object.entries(byU).forEach(([id, a]) => { const v = a.filter(r => r.p <= 3 && r.n >= 3).length; if (v >= 3 && (!b || v > b.v)) b = { id, v }; }); if (b && pOf(b.id)) aws.push(["🥇", "Roi du podium", pOf(b.id), cnt(b.v, "podium", "podiums")]); }
    { // remontada : plus grosse remontée au classement général d'un jour à l'autre
      const cu = {}; P.forEach(p => { cu[p.id] = cum(p.id); }); let b = null;
      const rankAt = (id, t) => 1 + P.filter(q => cu[q.id][t] > cu[id][t]).length;
      P.forEach(p => { for (let t = 2; t <= days.length; t++) { const g = rankAt(p.id, t - 1) - rankAt(p.id, t); if (g >= 3 && (!b || g > b.v)) b = { p, v: g }; } });
      if (b) aws.push(["🔥", "Remontada", b.p, `${b.v} places gagnées en un jeu`]);
    }
    { let b = null; Object.entries(byU).forEach(([id, a]) => { if (a.length < 10) return; const m = a.reduce((s, r) => s + r.p, 0) / a.length, sdv = Math.sqrt(a.reduce((s, r) => s + (r.p - m) ** 2, 0) / a.length); if (!b || sdv < b.v) b = { id, v: sdv }; }); if (b && pOf(b.id)) aws.push(["🎯", "Métronome", pOf(b.id), `Écart de rang : ${fix1(b.v)} seulement`]); }
    { const b = P.slice().sort((x, y) => y.days - x.days || x.rank - y.rank)[0]; if (b && b.days >= 15) aws.push(["💪", "Jamais absent", b, b.days >= sd ? "100 % de participation" : `${b.days} jours sur ${sd}`]); }
    { const b = P.filter(p => p.early != null && p.late != null && p.early - p.late >= .15).sort((x, y) => (y.early - y.late) - (x.early - x.late))[0]; if (b) aws.push(["🌱", "Éclosion tardive", b, "A remonté le classement en 2e moitié"]); }
    { const sun = {}; multi.filter(r => r.p === 1 && parseKey(r.d).getDay() === 0).forEach(r => { sun[r.u] = (sun[r.u] || 0) + 1; }); const e = Object.entries(sun).sort((x, y) => y[1] - x[1])[0]; if (e && pOf(e[0])) aws.push(["☀", "Roi du dimanche", pOf(e[0]), cnt(e[1], "Méga-quiz gagné", "Méga-quiz gagnés")]); }
    if (aws.length) S.push({ bg: "linear-gradient(165deg,#17977F,#0D5C57 88%)", html: `<div class="rctop"><h2>Médailles du voyage</h2><p class="rcsub">Les moments marquants du groupe</p></div><ul class="rcaws">${aws.slice(0, 6).map(([ic, t, p, why]) => `<li class="rcaw"><span class="rcmedal" aria-hidden="true">${ic}</span><span class="rctx"><b>${t}</b><em>${nm(p)}</em><small>${why}</small></span><span class="rcpet">${av(p, "md")}</span></li>`).join("")}</ul>` });
  }
  /* 6 · compagnon de voyage */
  if (me) {
    const pet = petOf(me), st = stageOf(pet), Sp = SPECIES[pet.species], pg = store.profile ? petProg(pet.species) : { games: 0 };
    const nx = st < 3 ? `Prochaine évolution dans ${Math.max(0, EVO_NEED[st].v - pg.games)} parties.` : "Stade final atteint.";
    const evo = st > 1 ? `<div class="rcevo"><span class="rcev">${petAv({ ...pet, stage: String(st - 1) }, "xl", Sp.names[st - 2])}<small>${esc(Sp.names[st - 2])}</small></span><i aria-hidden="true">›</i><span class="rcev now">${petAv(pet, "xl", petName(pet))}<small>${esc(petName(pet))}${pet.shiny === "shiny" ? " ✦" : ""}</small></span></div>` : `<div class="rcevo"><span class="rcev now">${petAv(pet, "xl", petName(pet))}<small>${esc(petName(pet))}${pet.shiny === "shiny" ? " ✦" : ""}</small></span></div>`;
    S.push({ bg: "linear-gradient(165deg,#3B2FA0,#15102E 82%)", html: `<div class="rctop"><div class="rckick">Ton compagnon de voyage</div><h2>${st > 1 ? `${esc(Sp.names[st - 2])} a grandi` : esc(petName(pet))}</h2></div><div class="rcmid">${evo}
      <div class="rctiles three"><div><b class="num">${me.days}</b><span>escales à deux</span></div><div><b class="num">${st}</b><span>stade sur 3</span></div><div><b class="num">${pet.shiny === "shiny" ? "✦" : "–"}</b><span>${pet.shiny === "shiny" ? "chromatique" : "couleurs normales"}</span></div></div><p class="rcnote">${nx}</p></div>` });
  }
  /* 7 · l'équipage */
  if (P.length >= 2) {
    const crew = P.slice().sort((a, b) => stageOf(petOf(b)) - stageOf(petOf(a)) || a.rank - b.rank).slice(0, 6), shiny = P.filter(p => petOf(p).shiny === "shiny").length, fin = P.filter(p => stageOf(petOf(p)) === 3).length;
    S.push({ bg: "linear-gradient(165deg,#6B5BE2,#2A1F6B 88%)", html: `<div class="rctop"><h2>L'équipage</h2><p class="rcsub">Les compagnons du groupe et leur stade</p></div><div class="rcmid"><div class="rczoo">${crew.map(p => `<span class="rcz">${av(p)}<i>${p.id === uid ? "Toi" : esc(p.name)} · ${stageOf(petOf(p))}</i>${petOf(p).shiny === "shiny" ? `<em>✦</em>` : ""}</span>`).join("")}</div><p class="rcnote">${cnt(shiny, "chromatique", "chromatiques")}, ${cnt(fin, "compagnon", "compagnons")} au stade final.</p></div>` });
  }
  /* 8 · arrivée : podium et récompense */
  {
    const top = P.slice(0, 3), by = k => top[k], order = [by(1), by(0), by(2)].filter(Boolean);
    const pod = p => `<div class="rcpod p${Math.min(p.rank, 3)} ${p.id === uid ? "me" : ""}">${p.rank === 1 ? `<span class="rcflag" aria-hidden="true">⚑</span>` : ""}<span class="rcpodpet">${av(p)}</span><b>${nm(p)}</b><span class="rcg">${I.compass(16)}${fmtNum(p.total)}</span><span class="rcstep"><i>${p.rank}</i></span></div>`;
    const aw = me && me.award ? `<p class="rcnote">+${fmtNum(me.award)} boussoles de récompense, déjà dans ton portefeuille.${me.rank === 1 ? " Fond de familier « Or de champion » débloqué." : me.rank <= 3 ? " Fond de familier « Podium » débloqué." : ""}</p>` : "";
    S.push({ bg: "linear-gradient(165deg,#3A2C8C,#15102E 72%)", html: `<div class="rctop"><div class="rckick">Arrivée</div><h2>${P[0] ? `${nm(P[0])} remporte la saison` : `Saison ${d.season}`}</h2></div><div class="rcmid"><div class="rcpodium">${order.map(pod).join("")}</div>${aw}</div><div class="rcfoot"><button class="btn" data-act="cershare">Partager ma saison</button><button class="smallbtn ghost rcfin" data-act="cerclose">Fermer</button></div>` });
  }
  return S;
}
function vRecapReal() {
  const c = ui.cer; if (!c) return "";
  if (!c.slides) c.slides = rcRealSlides(c);
  c.n = c.slides.length; c.step = Math.max(0, Math.min(c.step || 0, c.n - 1));
  return rcShell(c.slides[c.step], c.step, c.n, true, `Récap de la saison ${c.d.season}`);
}
