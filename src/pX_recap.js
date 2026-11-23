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
const RC_N = 9;
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
  return `<svg class="rcstamp" viewBox="0 0 200 200" role="img" aria-label="${small}">
    <defs><path id="rcarc" d="M100 100m-71 0a71 71 0 1 1 142 0a71 71 0 1 1-142 0"/></defs>
    <g fill="none" stroke="currentColor"><circle cx="100" cy="100" r="95" stroke-width="5"/><circle cx="100" cy="100" r="86" stroke-width="1.8"/><circle cx="100" cy="100" r="52" stroke-width="1.8" stroke-dasharray="3 5"/></g>
    <text font-family="Unbounded,sans-serif" font-weight="800" font-size="12.5" fill="currentColor"><textPath href="#rcarc" textLength="436" lengthAdjust="spacing">${ring}</textPath></text>
    <text x="100" y="124" text-anchor="middle" font-family="Unbounded,sans-serif" font-weight="800" font-size="70" fill="currentColor">${big}</text></svg>`;
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
function vRecap() {
  const i = Math.max(0, Math.min(RC_N - 1, ui.rc || 0));
  const P = k => petAv(RC_PETS[k], "xl", k);
  // la progression est une route pointillée avec une escale par écran (pas des barres de stories)
  const route = `<div class="rcroute" aria-hidden="true">${Array.from({ length: RC_N }, (_, n) => `${n ? `<i class="l ${n <= i ? "on" : ""}"></i>` : ""}<b class="s ${n < i ? "on" : ""} ${n === i ? "cur" : ""}"></b>`).join("")}</div><div class="rctag" aria-hidden="true">Escale ${i + 1} / ${RC_N} · Méridien 0°</div>`;
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
  const s = S[i];
  return `<div class="rcp ${s.dark ? "dark" : ""}" style="--rbg:${s.bg}" role="region" aria-label="Récap de saison, écran ${i + 1} sur ${RC_N}">${rcMeridians(s.dark ? "#4a2800" : "#fff")}<div class="rchead">${route}</div><div class="rcbody">${s.html}</div>
    <button class="rczone l" data-act="rc" data-v="-1" aria-label="Écran précédent"></button><button class="rczone r" data-act="rc" data-v="1" aria-label="Écran suivant"></button></div>`;
}
