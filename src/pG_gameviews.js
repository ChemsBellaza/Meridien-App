/* ============ ÉCRANS DU JEU ============ */
const mancheChip = m => `<span class="chip" style="--c:${m.color}">${mIcon(m, 14)}${esc(m.label)}</span>`;
const pips = d => `<span class="pips" aria-hidden="true">${[0, 1, 2].map(i => `<i class="${i <= d ? "on" : ""}"></i>`).join("")}</span>`;
const diffChip = d => `<span class="chip d" style="--c:${DIFFS[d].color}">${DIFFS[d].label} ${fmtMult(CONFIG.mult[d])}</span>`;

function gameTop() {
  const g = game;
  const bars = g.manches.map((t, i) => `<i class="${i < g.round ? "done" : i === g.round ? "on" : ""}"></i>`).join("");
  return `<div class="gtop"><button class="roundbtn" data-g="quit" aria-label="Quitter">${I.close}</button><div class="prog" aria-label="Manche ${g.round + 1} sur 3">${bars}</div><span class="scorepill num">${fmtNum(g.score)}<small>PTS</small></span></div>`;
}
function jokerBtn() {
  const g = game, J = E().joker; if (!J || g.tuto || !featureOn("joker") || g.phase !== "q" || (J.can && !J.can(g))) return "";
  if (g.jokers[g.round]) return `<span class="joker used">${I.joker(15)}Joker utilisé</span>`;
  const ok = g.practice || wallet() >= CONFIG.jokerCost;
  return `<button class="joker" data-g="joker" ${ok ? "" : "disabled"} aria-label="Joker ${esc(J.label)}, ${CONFIG.jokerCost} boussoles">${I.joker(15)}${esc(J.label)}<span class="cost num">${g.practice ? "offert" : CONFIG.jokerCost}${g.practice ? "" : I.compass(13)}</span></button>`;
}
function roundTag() {
  const g = game, m = g.manches[g.round], d = g.diffs[g.round], E0 = E();
  const count = E0.board ? "" : `<span class="mono muted">${E0.stepWord || "Question"} ${g.qi + 1}/${g.qs.length}</span>`;
  return `<div class="roundtag">${mancheChip({ ...m, label: g.mlabel[g.round] || m.label })}${diffChip(d)}${count}</div>${jokerBtn() ? `<div class="jokerline">${jokerBtn()}</div>` : ""}`;
}

function renderGame() {
  const g = game;
  let body = "";
  const F = FORMATS[g.fmt];
  if (g.phase === "intro" && g.tuto) {
    body = tutoIntro(g);
  } else if (g.phase === "intro") {
    const pet = store.profile.pet, Sp = SPECIES[pet.species];
    body = `
      <div class="rowtop"><button class="roundbtn" data-g="quit" aria-label="Quitter">${I.close}</button>${g.practice ? `<span class="flag">Entraînement · non compté</span>` : `<span class="kicker">Défi n°${issueNo(g.k)} · essai ${g.tryIdx + 1}/${CONFIG.tries}</span>`}<span></span></div>
      <div class="hcard static">${art(g.fmt, g.k)}${labels("3 manches", F.name)}</div>
      <p class="qsub">${fr(F.sub)}</p>
      <div class="rounds center">${g.manches.map((m, i) => roundChip(m, i)).join("")}</div>
      <div class="facts">
        <div class="f"><span class="kicker">Difficulté</span><span><b>À choisir avant chaque manche.</b> Facile ${fmtMult(CONFIG.mult[0])}, Moyen ${fmtMult(CONFIG.mult[1])}, Difficile ${fmtMult(CONFIG.mult[2])}.</span></div>
        <div class="f"><span class="kicker">${g.practice ? "Entraînement" : "Essais"}</span><span>${g.practice ? "Contenu au hasard, sans effet sur ton classement." : `<b>Essai ${g.tryIdx + 1} sur ${CONFIG.tries}.</b> Seul ton meilleur score compte${g.tryIdx === 0 ? ", et le 2e essai change le contenu" : ""}. L'essai est compté dès que tu commences.`}</span></div>
        ${E().joker && featureOn("joker") ? `<div class="f"><span class="kicker">Joker</span><span><b>${esc(E().joker.label)}</b>, une fois par manche, pour ${CONFIG.jokerCost} boussoles. ${esc(E().joker.help || "")}</span></div>` : ""}
      </div>
      <div class="petsay static">${petAv(pet, "lg", petName(pet))}<span class="say2"><b>${esc(petName(pet))}</b><span>${fr(petLine(pet.species, "hello", g.k + "i" + g.tryIdx))}</span></span></div>
      <button class="btn" data-g="start" style="margin-top:auto">C'est parti</button>`;
  } else if (g.phase === "diff") {
    const m = g.manches[g.round];
    body = `${gameTop()}
      <div class="theme-banner" style="--c:${m.color}"><div><div class="kicker">Manche ${g.round + 1} sur 3</div><h2 class="display">${esc(m.label)}</h2></div><span class="bico">${mIcon(m, 58)}</span></div>
      ${tutoCoach(g)}
      <p class="qsub">Choisis ta difficulté pour cette manche.</p>
      <div class="diffs">${DIFFS.map((d, i) => `<button class="diff" data-g="diff" data-v="${i}"><span class="mult num" style="--c:${d.color}">${fmtMult(CONFIG.mult[i])}</span><span><span class="lbl">${d.label}</span><br><span class="s">${esc((E().diffHint && E().diffHint[i]) || d.sub)}</span></span>${pips(i)}</button>`).join("")}</div>`;
  } else if (g.phase === "q" || g.phase === "reveal") {
    body = gameTop() + roundTag() + (g.phase === "q" ? tutoCoach(g) : "") + E().view(g) + (g.phase === "reveal" ? tutoCoach(g) + revealBox() : "");
  } else if (g.phase === "end") {
    body = vEnd();
  }
  $app.className = "";
  setAppHTML(`<div class="game"><div class="gwrap">${body}</div></div>${ui.confirm ? vConfirm() : ""}${ui.toast && ui.toast !== "copied" ? `<div class="toast" role="status">${esc(ui.toast)}</div>` : ""}`);
  afterGameRender();
  if (g.phase === "reveal") { const r = document.querySelector(".reveal"); if (r) { const t = r.querySelector(".gain b"), a = r.querySelector(".ans"); announce(`${t ? t.textContent + " points. " : ""}${a ? a.textContent : ""}`); } }
}
const roundChip = (m, i) => `<span class="rnd" style="--c:${m.color}"><i class="num">${i + 1}</i>${mIcon(m, 16)}${esc(m.label)}</span>`;

function revealBox() {
  const g = game, a = g.answer, d = g.diffs[g.round];
  const last = g.qi === g.qs.length - 1;
  return `<div class="reveal" role="status">
    <div class="gain"><b class="num" style="color:${a.base > 0 ? "var(--ok)" : "var(--bad)"}">+${fmtNum(a.pts)}</b><span class="mono muted num">${fmtNum(a.base)} × ${String(CONFIG.mult[d]).replace(".", ",")}</span></div>
    ${a.ans ? `<div class="ans">${a.ans}</div>` : ""}
    ${a.extra || ""}
    ${a.fact ? `<div class="fact"><div class="mono">Le saviez-vous ?</div><p>${fr(a.fact)}</p></div>` : ""}
    <button class="btn" data-g="next">${last ? (g.round === (g.tuto ? 0 : 2) ? "Voir mon score" : "Manche suivante") : (E().nextWord || "Question suivante")}</button>
  </div>`;
}

function vEnd() {
  if (game.tuto) return vEndTuto();
  const g = game, F = FORMATS[g.fmt], mine = g.practice ? [] : store.plays[g.k];
  const best = g.practice ? g.score : Math.max(...mine.map(p => p.score));
  const res = g.practice ? null : dayResults(g.k);
  const me = res && res.played.find(r => r.me);
  const left = g.practice ? 0 : CONFIG.tries - mine.length;
  const pet = store.profile.pet, Sp = SPECIES[pet.species];
  const maxP = g.manches.reduce((s, m, i) => s + F.max * CONFIG.mult[g.diffs[i] ?? 0], 0), ratio = g.score / maxP, kind = ratio >= .6 ? "good" : ratio >= .3 ? "mid" : "bad";
  const stamps = g.newStamps || [];
  return `
    <div style="display:flex;justify-content:space-between;align-items:center"><span class="mono muted">${esc(F.name)} · ${g.practice ? "entraînement" : "essai " + (g.tryIdx + 1)}</span>${g.practice ? `<span class="flag mono">Non compté</span>` : ""}</div>
    <div class="react"><span class="rtile">${petSVG(pet, { mood: kind === "good" ? "joy" : kind === "bad" ? "sad" : null })}</span><div class="say3"><b>${esc(petName(pet))}</b><span>${fr(petLine(pet.species, kind, g.k + g.tryIdx))}</span></div></div>
    <div class="endscore"><div class="v num">${fmtNum(g.score)}</div><div class="u">points</div>
      ${me ? `<div class="tags" style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><span class="tag num" style="font-size:14px;padding:3px 9px">N°${me.pos} du jour</span><span class="tag num" style="font-size:14px;padding:3px 9px">+${me.gems} ${I.compass(15)}</span></div>` : ""}
      ${!g.practice && best > g.score ? `<p class="muted" style="font-weight:700;margin-top:6px">Ton meilleur score du jour reste ${fmtNum(best)} pts.</p>` : ""}
      ${!g.practice && g.tryIdx === 1 && mine.length > 1 && mine[0].score < g.score ? `<p style="font-weight:800;color:var(--ok);margin-top:6px">Nouveau record du jour !</p>` : ""}
    </div>
    <div class="breakdown">${g.manches.map((m, i) => `<div class="bd">${mancheChip({ ...m, label: g.mlabel[i] || m.label })}<span>${g.diffs[i] != null ? diffChip(g.diffs[i]) : ""}</span><span class="num">${fmtNum(g.roundPts[i])}</span></div>`).join("")}</div>
    ${g.practice ? "" : `<div class="sharerow"><button class="btn ghost" data-g="share">${I.share(20)}Partager</button><button class="btn ghost" data-g="challenge">${I.duel(20)}Défier un ami</button></div>`}
    ${stamps.length ? `<div class="stampcard"><div class="mono">Carnet de voyage · +${stamps.length} pays</div><div class="stamps">${stamps.slice(0, 18).map(id => `<span class="stamp" title="${esc(CBY[id] ? CBY[id].name : id)}">${CBY[id] ? flagOf(CBY[id]) : ""}</span>`).join("")}${stamps.length > 18 ? `<span class="stamp more num">+${stamps.length - 18}</span>` : ""}</div><span class="note">${Object.keys(store.carnet).length} pays tamponnés sur ${COUNTRIES.length}.</span></div>` : ""}
    ${(g.newAch || []).map(a => `<div class="unlock ach"><span class="medal">${achIcon(a, 46)}</span><div><span class="mono">Succès débloqué</span><b>${esc(a.label)}</b><span style="font-size:13px;font-weight:600">${esc(a.desc)}</span></div></div>`).join("")}
    ${g.newUnlocks.filter(u => u.cat === "stage").map(u => `<div class="unlock evolve" style="--c:${TYPES[Sp.type].color}"><span class="evopair">${petAv({ ...pet, stage: String(+u.it.id - 1) }, "lg", "Avant")}<i aria-hidden="true">›</i>${petAv({ ...pet, stage: u.it.id }, "lg", "Après")}</span><div><span class="mono">Évolution !</span><b>${esc(Sp.names[+u.it.id - 2])} évolue en ${esc(Sp.names[+u.it.id - 1])}</b><span style="font-size:13px;font-weight:600">Stade ${u.it.id} · ${reqText(u.it.need)}</span></div></div>`).join("")}
    ${g.newUnlocks.filter(u => u.cat !== "stage").map(u => `<div class="unlock">${petAv(u.cat === "species" ? { ...store.profile.pet, species: u.it.id } : { ...store.profile.pet, [u.cat]: u.it.id }, "lg", u.it.label)}<div><span class="mono">${u.cat === "species" ? "Nouveau familier" : u.cat === "shiny" ? "Couleurs chromatiques" : "Nouveau fond"}</span><b>${esc(u.it.label)}</b><span style="font-size:13px;font-weight:600">${esc(ITEMS[u.cat].label)} · ${reqText(u.it.need)}</span></div></div>`).join("")}
    ${g.learned.length ? `<details class="learned" open><summary>Ce que tu as appris (${g.learned.length})</summary><ul>${g.learned.slice(0, 14).map(l => `<li><b>${fr(l.t)}</b>${l.f ? ` : ${fr(l.f)}` : ""}</li>`).join("")}</ul></details>` : ""}
    ${g.newUnlocks.length ? `<button class="btn ghost" data-g="topet">Voir mon familier</button>` : ""}
    <button class="btn" data-g="exit">${g.practice ? "Retour" : "Voir le classement"}</button>
    ${left > 0 ? `<p class="note">Il te reste ${left} essai aujourd'hui, avec un nouveau contenu.</p>` : ""}`;
}
