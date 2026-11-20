/* ============ RÉVÉLATION DU JEU DU JOUR (v33) ============
   À la première ouverture d'un groupe après le changement de jeu (14 h 30, heure de Barcelone), une courte animation aux couleurs
   de Méridien dévoile le nouveau jeu : ciel étoilé, globe qui tourne, deux rideaux « ? » que la ligne du méridien écarte, étincelles,
   puis le jeu avec son nom. Un toucher passe l'animation. Une seule fois par groupe et par jour (profile.revealSeen).
   Uniquement des fonctions déclarées (hoisting). */
const revKey = () => (srvOn() ? SRV.gid || "" : "local");
function revealDue() {
  if (!store.profile || !store.profile.pet || !tutoState().done || game || ui.sheet || ui.confirm || ui.evo || ui.view !== "group") return false;
  if (srvOn() && (!SRV.group || !SRV.syncedAt)) return false; // en ligne : on attend le groupe et l'horloge du serveur
  const k = today(), key = revKey(); if (!key) return false;
  if ((store.profile.revealSeen || {})[key] === k) return false;
  return true;
}
// appelée au début de render() : ouvre la révélation si elle est due, et la marque comme vue
function revealCheck() {
  if (!revealDue()) return;
  const k = today(), key = revKey(), f = fmtOf(k);
  store.profile.revealSeen = { ...(store.profile.revealSeen || {}), [key]: k }; save();
  if (!FORMATS[f] || myToday().used > 0) return; // déjà joué (autre appareil, ou jour déjà entamé) : pas de révélation
  ui.reveal = { f, k, skip: false }; ui.sheet = "reveal";
  setTimeout(() => { if (ui.sheet === "reveal" && !ui.reveal.skip) buzz([25, 40, 70]); }, 2500);
}
function revStars() {
  let s = "";
  for (let i = 0; i < 46; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1, y = (Math.sin(i * 78.233) * 12543.123) % 1, d = (Math.sin(i * 3.7) * 99.1) % 1;
    s += `<i style="left:${Math.abs(x * 100).toFixed(1)}%;top:${Math.abs(y * 100).toFixed(1)}%;--d:${Math.abs(d * 3).toFixed(2)}s;--s:${(1 + Math.abs(x) * 2.2).toFixed(1)}px"></i>`;
  }
  return s;
}
function revSparks() {
  let s = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + (i % 2) * 0.2, r = 120 + (i % 3) * 38;
    s += `<b style="--x:${Math.round(Math.cos(a) * r)}px;--y:${Math.round(Math.sin(a) * r * 0.75)}px;--c:${i % 3 === 0 ? "#FFC24A" : i % 3 === 1 ? "#fff" : "#B4AAFF"}"></b>`;
  }
  return s;
}
// confettis : 44 morceaux qui tombent après l'ouverture des rideaux (positions fixes, pas de hasard : rendu stable)
function revConfetti() {
  let s = "";
  const cols = ["#FFC24A", "#fff", "#B4AAFF", "#6B5BE2", "#FF8FA3", "#5FD1B0"];
  for (let i = 0; i < 44; i++) {
    const x = Math.abs((Math.sin(i * 7.31) * 9301.7) % 1), w = 6 + (i % 4) * 2, d = 2.55 + Math.abs((Math.sin(i * 2.7) * 77.3) % 1) * 0.9, t = 1.6 + (i % 5) * 0.35;
    s += `<b style="left:${(x * 100).toFixed(1)}%;width:${w}px;height:${w * 1.6}px;background:${cols[i % cols.length]};--d:${d.toFixed(2)}s;--t:${t.toFixed(2)}s;--r:${(i % 2 ? 1 : -1) * (240 + i * 13)}deg"></b>`;
  }
  return s;
}
function vReveal() {
  const R = ui.reveal; if (!R) return "";
  const F = FORMATS[R.f], sunday = isSunday(R.k);
  const globe = `<svg viewBox="0 0 512 512" width="150" height="150" aria-hidden="true"><circle cx="256" cy="256" r="150" fill="#251E52" stroke="#FFC24A" stroke-width="10"/><g fill="none" stroke="#FFC24A" stroke-width="9" stroke-linecap="round"><ellipse class="spin" cx="256" cy="256" rx="64" ry="150"/><ellipse class="spin s2" cx="256" cy="256" rx="64" ry="150"/><path d="M256 106V406M106 256H406"/></g><path d="M392 84l12 40 40 12-40 12-12 40-12-40-40-12 40-12z" fill="#fff"/></svg>`;
  return `<div class="scrim rvroot ${R.skip ? "skip" : ""}" role="dialog" aria-modal="true" aria-label="Nouveau jeu du jour" data-act="revskip">
    <div class="rvsky" aria-hidden="true">${revStars()}</div>
    <p class="sr" role="status">${sunday ? "Jeu spécial du dimanche" : "Nouveau jeu du jour"} : ${esc(F.name)}. ${esc(fr(F.sub))}</p>
    <div class="rvglobe" aria-hidden="true">${globe}</div>
    <p class="rvq" aria-hidden="true">Quel sera le jeu du jour ?</p>
    <span class="rvflash" aria-hidden="true"></span>
    <div class="rvwrap" aria-hidden="true"><span class="rvrays"></span><i class="rvring"></i><i class="rvring r2"></i>
    <div class="rvstage">
      <div class="rvcard"><div class="cover">${art(R.f, R.k)}</div></div>
      <div class="rvcurt l"><span>?</span></div><div class="rvcurt r"><span>?</span></div>
      <span class="rvline"></span><div class="rvsparks">${revSparks()}</div>
    </div></div>
    <div class="rvconf" aria-hidden="true">${revConfetti()}</div>
    <div class="rvtext"><span class="kicker">${sunday ? "Jeu spécial du dimanche · points ×2" : `Jeu du jour n°${issueNo(R.k)}`}</span><h2 class="rvname">${esc(F.name)}</h2><p class="rvsub">${fr(F.sub)}</p></div>
    <button class="btn rvgo" data-act="revgo">C'est parti !</button>
    <p class="rvhint" aria-hidden="true">Touche pour passer l'animation</p>
  </div>`;
}
