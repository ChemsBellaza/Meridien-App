/* =================== RÉCAP DE SAISON (aperçu, adresse ?recap) ===================
   Écrans plein cadre qu'on parcourt en touchant la droite (suivant) ou la gauche (précédent), comme des stories.
   Pour l'instant : données de démonstration, pour valider le rendu. Pas encore branché sur les vraies données du groupe. */
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
function rcMeridians(c = "#fff") { // motif de fond : méridiens du globe
  return `<svg class="rcgrid" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="${c}" stroke-width="1.2">
    <ellipse cx="200" cy="400" rx="60" ry="380"/><ellipse cx="200" cy="400" rx="130" ry="380"/><ellipse cx="200" cy="400" rx="200" ry="380"/><ellipse cx="200" cy="400" rx="270" ry="380"/>
    <path d="M-20 400H420M0 250Q200 290 400 250M0 550Q200 510 400 550"/></svg>`;
}
function rcLines() { // courbes de la saison (démo) : toi et tes deux adversaires les plus proches
  const W = 320, H = 260, N = 21, series = [["#FFC24A", "fla", .86], ["#8DE0C0", "yas", 1.08], ["#FF8E7A", "me", 1.0]];
  const out = series.map(([c, k, f], si) => {
    const r = rng("rc" + k); let t = 0; const pts = [];
    for (let d = 0; d <= N; d++) { pts.push(t); t += (60 + r() * 120) * f * (si === 0 && d > 12 ? .3 : 1); }
    return { c, k, pts };
  });
  const mx = Math.max(...out.map(s => s.pts[N]));
  const xy = (d, v) => [(d / N * W).toFixed(1), (H - v / mx * (H - 14) - 4).toFixed(1)];
  const paths = out.map(s => `<polyline fill="none" stroke="${s.c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${s.pts.map((v, d) => xy(d, v).join(",")).join(" ")}"/><circle cx="${xy(N, s.pts[N])[0]}" cy="${xy(N, s.pts[N])[1]}" r="6" fill="${s.c}"/>`).join("");
  return { svg: `<svg viewBox="-6 -4 ${W + 12} ${H + 8}" class="rcchart" role="img" aria-label="Courbes de boussoles cumulées sur la saison">${[0, 1, 2, 3].map(i => `<line x1="0" x2="${W}" y1="${(i * H / 3).toFixed(1)}" y2="${(i * H / 3).toFixed(1)}" stroke="rgba(255,255,255,.14)" stroke-dasharray="3 6"/>`).join("")}${paths}</svg>`, totals: out.map(s => [s.k, Math.round(s.pts[N] / 10) * 10]) };
}
function vRecap() {
  const i = Math.max(0, Math.min(RC_N - 1, ui.rc || 0));
  const P = k => petAv(RC_PETS[k], "xl", k);
  const bars = `<div class="rcbars" aria-hidden="true">${Array.from({ length: RC_N }, (_, n) => `<i class="${n <= i ? "on" : ""}"></i>`).join("")}</div>`;
  const aw = (ic, ttl, who, why, pet) => `<li class="rcaw"><span class="rcic" aria-hidden="true">${ic}</span><span class="rctx"><b>${ttl}</b><em>${who}</em><small>${why}</small></span><span class="rcpet">${petAv(RC_PETS[pet], "md", who)}</span></li>`;
  const ln = rcLines();
  const pod = (rk, name, pet, gems, cls) => `<div class="rcpod ${cls}"><span class="rcpodpet">${petAv(RC_PETS[pet], "xl", name)}</span><b>${name}</b><span class="rcg">${I.compass(16)}${gems}</span><span class="rcstep"><i>${rk}</i></span></div>`;
  const S = [
    /* 0 ouverture */
    { bg: "linear-gradient(165deg,#2A1F6B,#15102E 70%)", html: `<div class="rcmid">${logoMark(104)}<div class="rckick">Récap</div><h1>Saison 4</h1><p class="rcsub">3 – 23 novembre</p></div><div class="rcfoot"><b class="rcgold">Barça Gang</b><span>Touche pour continuer</span></div>` },
    /* 1 tes chiffres */
    { bg: "linear-gradient(165deg,#6B5BE2,#3B2FA0 75%)", html: `<div class="rctop"><div class="rckick">Ta saison</div></div><div class="rcmid"><div class="rcbig">3<sup>e</sup></div><p class="rcsub">au classement final, sur 11 joueurs</p>
      <div class="rctiles"><div><b class="num">1 840</b><span>${I.compass(16)} boussoles</span></div><div><b class="num">20<small>/21</small></b><span>jeux joués</span></div><div><b class="num">4</b><span>victoires du jour</span></div></div>
      <p class="rcnote">Rang moyen : <b>4,2</b></p></div>` },
    /* 2 la course */
    { bg: "linear-gradient(165deg,#1F2A4D,#15102E 75%)", html: `<div class="rctop"><h2>C'était serré</h2><p class="rcsub">Toi et tes deux adversaires les plus proches</p></div><div class="rcmid">${ln.svg}<div class="rcleg">${ln.totals.map(([k, t]) => `<span>${petAv(RC_PETS[k], "md", k)}<b>${t.toLocaleString("fr-FR")}</b>${I.compass(14)}</span>`).join("")}</div></div>` },
    /* 3 rival */
    { bg: "linear-gradient(165deg,#E8685F,#9E2F5E 80%)", html: `<div class="rctop"><div class="rckick">Ton rival</div></div><div class="rcmid"><div class="rcduel">${P("me")}<span class="rcx" aria-hidden="true">⚔</span>${P("yas")}</div><p class="rcsub"><b>Toi</b> contre <b>Yasmine</b></p>
      <div class="rctiles three"><div><b class="num">9</b><span>victoires</span></div><div><b class="num">1</b><span>égalité</span></div><div><b class="num">11</b><span>défaites</span></div></div><p class="rcnote">Vos scores ne diffèrent que de 6 % en moyenne.</p></div>` },
    /* 4 jeu signature */
    { bg: "linear-gradient(165deg,#F2B33E,#C46A1B 85%)", dark: 1, html: `<div class="rctop"><h2>Ton jeu signature</h2><p class="rcsub">Là où tu as fait le mieux, par rapport aux autres.</p></div><div class="rcmid"><div class="rcgame">${art("carte", "recap")}<span class="rcgname">La Carte</span></div><p class="rcnote">Meilleur du groupe 3 fois sur 4 · 612 pts de moyenne</p></div>` },
    /* 5 récompenses */
    { bg: "linear-gradient(165deg,#17977F,#0D5C57 85%)", html: `<div class="rctop"><h2>Récompenses</h2><p class="rcsub">Les performances marquantes du groupe</p></div><ul class="rcaws">${aw("🥇", "Roi du podium", "Yasmine", "15 podiums", "yas")}${aw("🔥", "Remontada", "Nadia", "A grimpé de 11 places en un jeu", "nad")}${aw("🎯", "Métronome", "Théo", "Écart de rang : seulement 2,4", "theo")}${aw("💪", "Jamais absent", "Karim", "100 % de participation", "kar")}${aw("🌱", "Éclosion tardive", "Léa", "3,5 places gagnées en 2e moitié", "lea")}${aw("🧭", "Globe-trotteur", "Toi", "46 pays tamponnés au carnet", "me")}</ul>` },
    /* 6 mon familier */
    { bg: "linear-gradient(165deg,#3B2FA0,#15102E 80%)", html: `<div class="rctop"><div class="rckick">Ton familier</div><h2>Caillourson a grandi</h2></div><div class="rcmid"><div class="rcevo"><span class="rcev">${petAv({ species: "ours", stage: "1", shiny: "normal", bg: "type" }, "xl", "Caillourson")}<small>Caillourson</small></span><i aria-hidden="true">›</i><span class="rcev now">${petAv(RC_PETS.me, "xl", "Rocours")}<small>Rocours ✦</small></span></div>
      <div class="rctiles three"><div><b class="num">20</b><span>parties à deux</span></div><div><b class="num">2</b><span>stade sur 3</span></div><div><b class="num">✦</b><span>chromatique</span></div></div><p class="rcnote">Prochaine évolution dans 10 parties.</p></div>` },
    /* 7 ménagerie */
    { bg: "linear-gradient(165deg,#6B5BE2,#2A1F6B 85%)", html: `<div class="rctop"><h2>La ménagerie du groupe</h2><p class="rcsub">Les familiers de la saison et leur stade</p></div><div class="rcmid"><div class="rczoo">${["yas", "nad", "theo", "kar", "fla", "lea"].map(k => `<span class="rcz">${petAv(RC_PETS[k], "xl", k)}<i>Stade ${RC_PETS[k].stage}</i>${RC_PETS[k].shiny === "shiny" ? `<em>✦</em>` : ""}</span>`).join("")}</div><p class="rcnote">2 chromatiques, 3 familiers au stade final.</p></div>` },
    /* 8 podium */
    { bg: "linear-gradient(165deg,#2A1F6B,#15102E 70%)", html: `<div class="rctop"><div class="rckick">Podium final</div><h2>Saison 4</h2></div><div class="rcmid"><div class="rcpodium">${pod(2, "Nadia", "nad", "2 710", "p2")}${pod(1, "Yasmine", "yas", "3 260", "p1")}${pod(3, "Toi", "me", "1 840", "p3 me")}</div></div><div class="rcfoot"><button class="btn" data-act="rcnone">Voir le classement</button></div>` }
  ];
  const s = S[i];
  return `<div class="rcp ${s.dark ? "dark" : ""}" style="--rbg:${s.bg}" role="region" aria-label="Récap de saison, écran ${i + 1} sur ${RC_N}">${rcMeridians(s.dark ? "#4a2800" : "#fff")}${bars}<div class="rcbody">${s.html}</div>
    <button class="rczone l" data-act="rc" data-v="-1" aria-label="Écran précédent"></button><button class="rczone r" data-act="rc" data-v="1" aria-label="Écran suivant"></button></div>`;
}
