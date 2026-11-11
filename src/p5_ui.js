/* ---------- état de l'interface ---------- */
const ui = { view: store.profile ? "group" : "onboard", tab: "chat", sheet: false, onbTab: "create", onbStep: "pet", petTab: "species", dayKey: null, confirm: null, toast: "", draftPet: "renard", draftName: "", draftGroup: "Les Cartographes", draftCode: "", draftPhoto: null, prevView: "group" };
let game = null;

function go(view, extra = {}) { Object.assign(ui, { view, ...extra }); window.scrollTo(0, 0); render(); }
function captureDrafts() {
  const v = id => { const el = document.getElementById(id); return el ? el.value : null; };
  const a = v("pseudo"), b = v("gname"), c = v("gcode");
  if (a !== null) ui.draftName = a; if (b !== null) ui.draftGroup = b; if (c !== null) ui.draftCode = c;
}
const meP = () => players()[0];

/* ============ RENDUS ============ */
function render() {
  if (game) { renderGame(); return; }
  clearLater();
  if (store.profile && store.profile.pet && !store.profile.pet.stage) { // anciens familiers : on garde l'espèce, on calcule l'évolution
    const pp = progress(); Object.assign(store.profile.pet, { stage: String(ITEMS.stage.list.filter(it => isUnlocked(it, pp)).length), shiny: "normal", bg: "type" }); save();
  }
  let html = "";
  if (!store.profile) html = vOnboard();
  else if (!store.profile.pet) html = vPickPet();
  else if (ui.view === "welcome" || (ui.view === "group" && !tutoState().done)) html = vWelcome();
  else if (ui.view === "history") html = vHistory();
  else if (ui.view === "season") html = vSeason();
  else if (ui.view === "day") html = vDay(ui.dayKey);
  else if (ui.view === "pet") html = vPet();
  else if (ui.view === "carnet") html = vCarnet();
  else if (ui.view === "trophees") html = vTrophees();
  else html = vGroup();
  if (ui.sheet && store.profile && store.profile.pet) html += vSheet();
  if (ui.confirm) html += vConfirm();
  setAppHTML(html);
  $app.className = "app" + (ui.view === "season" && store.profile ? " dotted" : "");
  bindAfterRender();
}

const backBtn = (act = "back", label = "Retour") => `<button class="roundbtn" data-act="${act}" aria-label="${label}">${I.back}</button>`;
const photoBtn = (label) => `<label class="smallbtn">${I.camera}<span>${label}</span><input type="file" id="photoInput" accept="image/*" hidden></label>`;
const pill = (icon, val, act, aria) => `<button class="spill" data-act="${act}" aria-label="${esc(aria)}"><span class="v num">${val}</span>${icon}</button>`;
const labels = (small, big) => `<span class="labels">${small ? `<span class="lab sm">${small}</span>` : ""}<span class="lab">${big}</span></span>`;
const toi = `<span class="toi">TOI</span>`;

// Logo : même dessin que public/logo.svg (globe, ombre « lèvre », étincelle). Décoratif : le nom est écrit à côté.
const logoMark = (px = 44) => `<svg class="logomark" width="${px}" height="${px}" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><rect width="512" height="512" rx="112" fill="#6B5BE2"/><circle cx="256" cy="274" r="144" fill="#4C3EBE"/><circle cx="256" cy="256" r="144" fill="#FFF6EC" stroke="#2A2333" stroke-width="16"/><g fill="none" stroke="#2A2333" stroke-width="12" stroke-linecap="round"><ellipse cx="256" cy="256" rx="64" ry="144"/><path d="M256 112V400M112 256H400"/></g><path d="M370 100l10 36 36 10-36 10-10 36-10-36-36-10 36-10z" fill="#FFC24A" stroke="#2A2333" stroke-width="10" stroke-linejoin="round"/></svg>`;

function vOnboard() {
  if (ui.onbStep === "pet") return `<div class="onb">
    <div class="ohead"><span class="brand">${logoMark(52)}<span class="kicker">Méridien</span></span><h1 class="display">Choisis ton familier</h1><p class="qsub">Il t'accompagne, réagit à tes parties et se personnalise au fil des jours.</p></div>
    ${petPicker()}
    <button class="btn" data-act="onbnext">Partir avec ${esc(SPECIES[ui.draftPet].names[0])}</button>
    <p class="note center">Les familiers verrouillés se gagnent en jouant : séries, parties, victoires et boussoles.</p>
  </div>`;
  const t = ui.onbTab, S = SPECIES[ui.draftPet];
  const preview = { name: ui.draftName || "Toi", photo: ui.draftPhoto, pet: defaultPet(ui.draftPet) };
  return `<div class="onb">
    <div class="rowtop">${backBtn("onbback")}<span class="kicker">Étape 2 sur 2</span><span></span></div>
    <div class="ohead"><h1 class="display">Méridien</h1><p class="qsub">Un défi de culture générale par jour, à jouer entre amis.</p></div>
    <form class="form" id="onbForm" novalidate>
      <div class="chosen">${avatar(preview, "xl")}<div class="grow"><b>${esc(S.names[0])}</b> ${typeBadge(S.type, 12)}<p class="note">${ui.draftPhoto ? `Ta photo, avec ${esc(S.names[0])} en médaillon.` : `Ajoute une photo si tu veux : ${esc(S.names[0])} se posera dessus.`}</p>
        <div class="btnline">${photoBtn(ui.draftPhoto ? "Changer" : "Ajouter ma photo")}${ui.draftPhoto ? `<button type="button" class="smallbtn ghost" data-act="photo-rm">Retirer</button>` : ""}</div></div></div>
      <div class="field"><label for="pseudo">Ton pseudo</label><input id="pseudo" maxlength="16" autocomplete="nickname" placeholder="Ex. : Chems" value="${esc(ui.draftName)}"></div>
      <div class="seg light" role="group" aria-label="Groupe">
        <button type="button" data-act="onbtab" data-v="create" aria-pressed="${t === "create"}">Créer un groupe</button>
        <button type="button" data-act="onbtab" data-v="join" aria-pressed="${t === "join"}">Rejoindre</button>
      </div>
      ${t === "create"
        ? `<div class="field"><label for="gname">Nom du groupe</label><input id="gname" maxlength="24" value="${esc(ui.draftGroup)}"></div>`
        : `<div class="field"><label for="gcode">Code du groupe</label><input id="gcode" maxlength="8" placeholder="Ex. : MER-4K7Q" style="text-transform:uppercase" value="${esc(ui.draftCode)}"></div>`}
      <p class="err" id="onbErr" hidden></p>
      <button class="btn" type="submit">${t === "create" ? "Créer le groupe" : "Rejoindre"}</button>
    </form>
    <p class="note center">Prototype : les autres membres du groupe sont simulés pour tester le jeu.</p>
  </div>`;
}

function vPickPet() {
  if (!ui.draftPet || !(ui.draftPet in SPECIES)) ui.draftPet = "renard";
  return `<div class="onb">
    <div class="ohead"><span class="kicker">Nouveau</span><h1 class="display">Choisis ton familier</h1><p class="qsub">Les familiers ont été redessinés. Chacun a son caractère et réagit à tes parties.</p></div>
    ${petPicker()}
    <button class="btn" data-act="pickpet-ok">Partir avec ${esc(SPECIES[ui.draftPet].names[0])}</button>
  </div>`;
}

function myToday() {
  const k = today(), mine = store.plays[k] || [];
  return { used: mine.length, best: mine.length ? Math.max(...mine.map(p => p.score)) : null };
}

function vGroup() {
  const k = today(), fmt = fmtOf(k), F = FORMATS[fmt], mans = manchesOf(k, fmt);
  const st = standings(k), me = st.list.find(r => r.me), prog = progress();
  const mt = myToday(), left = CONFIG.tries - mt.used, pet = store.profile.pet, S = SPECIES[pet.species];
  let btn;
  if (left === CONFIG.tries) btn = `<button class="btn" data-act="play"><span class="stack">Jouer<small>${CONFIG.tries} essais · le meilleur compte</small></span></button>`;
  else if (left > 0) btn = `<button class="btn" data-act="play"><span class="stack">Rejouer<small>Dernier essai · nouvelles questions · meilleur : ${fmtNum(mt.best)} pts</small></span></button>`;
  else btn = `<button class="btn" disabled><span class="stack">Défi terminé<small>Ton meilleur score : ${fmtNum(mt.best)} pts</small></span></button>`;
  const hello = mt.used ? (left > 0 ? petLine(pet.species, "mid", k) : petLine(pet.species, mt.best >= 400 ? "good" : "mid", k + "d")) : petLine(pet.species, "hello", k);
  return `
  <header class="top">
    <button class="plain" data-act="menu" aria-label="Menu">${I.menu}</button>
    <button class="crew" data-act="season" aria-label="${players().length} membres, voir la saison"><span class="avstack">${players().slice(0, 5).map(p => avatar(p, "md")).join("")}</span></button>
    <button class="plain" data-act="history" aria-label="Jeux précédents">${I.history}</button>
  </header>
  <div class="gname"><b>${esc(store.profile.group)}</b><span>Défi n°${issueNo(k)} · ${longDate(k)}</span></div>
  <div class="pills">
    ${pill(I.compass(26), fmtNum(me.total), "season", `${fmtNum(me.total)} boussoles`)}
    ${pill(I.trophy(26), "#" + me.rank, "season", `Rang ${me.rank} sur ${st.list.length}`)}
    ${pill(I.fire(26), prog.streak, "pet", `Série de ${prog.streak} jour${prog.streak > 1 ? "s" : ""}`)}
  </div>
  ${tutoNotice()}
  <section class="today" aria-label="Défi du jour">
    <div class="cover">${art(fmt, k)}${labels(`Défi du jour · 3 manches`, F.name)}</div>
    <div class="tbody">
      <p class="sub">${fr(F.sub)}</p>
      <div class="rounds">${mans.map((m, i) => roundChip(m, i)).join("")}</div>
      ${btn}
      <div class="countdown">Prochain défi dans <b id="cd" class="num">--:--:--</b></div>
    </div>
  </section>
  <button class="petline" data-act="pet" aria-label="Mon familier. ${esc(petDesc(pet))}">${petAv(pet, "md", petName(pet))}<span><b>${esc(petName(pet))}</b> ${fr(hello)}</span></button>
  <div class="seg light" role="group" aria-label="Affichage"><button data-act="tab" data-v="chat" aria-pressed="${ui.tab === "chat"}">Chat</button><button data-act="tab" data-v="scores" aria-pressed="${ui.tab === "scores"}">Scores</button></div>
  ${ui.tab === "chat" ? vFeed(k) : vRanking(k)}
  ${ui.tab === "chat" ? `<div class="composer"><form id="msgForm"><input id="msg" maxlength="200" placeholder="Message" autocomplete="off" aria-label="Message au groupe"><button type="submit">Envoyer</button></form></div>` : ""}`;
}

function vFeed(k) {
  const ev = feed(k), lead = dayResults(k).played[0];
  if (!ev.length) return `<div class="feed"><p class="note center">Personne n'a encore joué aujourd'hui. Lance le défi !</p></div>`;
  return `<div class="feed">${ev.map(e => {
    if (e.type === "launch") return `<div class="fpill">${avatar(e.p, "sm")}<span><b>Défi lancé</b><small>${esc(e.p.name)} ${hm(e.at)}</small></span></div>`;
    if (e.type === "score") return `<div class="fitem"><button class="fpill ${e.best && lead && e.p.id === lead.id ? "best" : ""}" data-act="reactopen" data-v="${e.id}" aria-label="Réagir au score de ${esc(e.p.name)}">${avatar(e.p, "sm")}<span><b>Score : ${fmtNum(e.score)} pts</b><small>${esc(e.p.name)} ${hm(e.at)}</small></span></button>${reactRow(k, e)}</div>`;
    return `<div class="msg ${e.mine ? "me" : ""}">${e.mine ? "" : avatar(e.p, "md")}<div class="mcol"><button class="bubble" data-act="reactopen" data-v="${e.id}">${e.mine ? "" : `<span class="who" style="color:${e.p.color}">${esc(e.p.name)}</span>`}<span class="tx">${esc(e.text)}</span><span class="at num">${hm(e.at)}</span></button>${reactRow(k, e)}</div></div>`;
  }).join("")}</div>`;
}

function vRanking(k) {
  const res = dayResults(k);
  if (!res.played.length) return `<p class="note center">Aucun score pour l'instant.</p>`;
  let out = "", sep = false;
  res.played.forEach(r => {
    if (r.pos > 3 && !sep) { out += `<hr class="podium">`; sep = true; }
    out += `<div class="rkp" style="--c:${r.color}">
      <span class="pos num">#${r.pos}</span>
      <span class="main">${avatar(r, "md")}<span class="info"><b class="num">${fmtNum(r.best)} pts</b><span class="nm">${esc(r.name)}${r.me ? toi : ""}</span></span></span>
      <span class="badges">${r.tries > 1 ? `<i class="num">${r.tries} ${I.retry(13)}</i>` : ""}<i class="num">+${r.gems} ${I.compass(13)}</i></span>
    </div>`;
  });
  return `<div class="rank">${out}
  ${res.waiting.length ? `<div class="waiting">${res.waiting.map(w => `<span class="w">${avatar(w, "sm")}${esc(w.name)} · pas encore joué</span>`).join("")}</div>` : ""}</div>`;
}

function vHistory() {
  const k = today(), S = seasonOf(k), days = [];
  for (let d = k; d >= S.start; d = addDays(d, -1)) days.push(d);
  return `<div class="sheetpage">
    <button class="closepill" data-act="back">${I.down}<span>Fermer</span></button>
    <div class="sheetbody">
      <h1 class="bigtitle">Jeux précédents</h1><div class="spaced">Saison ${S.n}</div>
      <button class="row" data-act="season">${I.trophy(26)}<span class="grow">Stats de la saison</span>${I.chev}</button>
      <div class="list">${days.map(d => {
        const res = dayResults(d), f = fmtOf(d);
        return `<button class="hcard" data-act="day" data-v="${d}" aria-label="${FORMATS[f].name}, ${longDate(d)}">${art(f, d)}
          <span class="avrow">${res.played.slice(0, 6).map(p => avatar(p, "md")).join("")}</span>
          ${labels(`${res.N} joueur${res.N > 1 ? "s" : ""} · ${d === k ? "aujourd'hui" : shortDate(d)}`, FORMATS[f].name)}</button>`;
      }).join("")}</div>
    </div></div>`;
}

function vDay(d) {
  const f = fmtOf(d), res = dayResults(d);
  return `<div class="sheetpage">
    <button class="closepill" data-act="history">${I.back}<span>Jeux précédents</span></button>
    <div class="sheetbody">
      <div class="hcard static">${art(f, d)}${labels(`Défi n°${issueNo(d)} · ${longDate(d)}`, FORMATS[f].name)}</div>
      <div class="rounds center">${manchesOf(d, f).map((m, i) => roundChip(m, i)).join("")}</div>
      ${vRanking(d)}
    </div></div>`;
}

function vSeason() {
  const k = today(), st = standings(k), prev = diffDays(st.S.start, k) > 0 ? standings(addDays(k, -1)) : null;
  const leftDays = diffDays(k, st.S.end);
  const n = st.days.length, W = 360, H = 260, L = 6, Rr = 44, T = 14, B = 10;
  const maxV = Math.max(100, ...st.list.map(r => r.total));
  const step = maxV > 1500 ? 500 : maxV > 600 ? 250 : 100, top = Math.ceil(maxV / step) * step;
  const X = i => L + (W - L - Rr) * (i / Math.max(1, n)), Y = v => T + (H - T - B) * (1 - v / top);
  let grid = "";
  for (let v = 0; v <= top; v += step) grid += `<line x1="${L}" x2="${W - Rr}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="var(--grid)" stroke-width="1.4" stroke-dasharray="5 5"/><text x="${W - Rr + 8}" y="${f1(Y(v) + 4.5)}" font-size="12.5" font-weight="700" font-family="Nunito, sans-serif" fill="var(--ink-2)">${fmtNum(v)}</text>`;
  for (let i = 0; i <= 3; i++) { const x = X(i * n / 3); grid += `<line x1="${f1(x)}" x2="${f1(x)}" y1="${T}" y2="${H - B}" stroke="var(--grid)" stroke-width="1.4" stroke-dasharray="5 5"/>`; }
  const lines = st.list.slice().reverse().map(r => {
    const pts = r.series.map((v, i) => [X(i), Y(v)]);
    return `<polyline points="${pts.map(p => p.map(f1).join(",")).join(" ")}" fill="none" stroke="${r.color}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>${pts.map(p => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="3.6" fill="${r.color}"/>`).join("")}`;
  }).join("");
  return `
  <div class="shead">${backBtn()}<div class="stitle">${I.laurel()}<div><h1>Saison ${st.S.n}</h1><p>${leftDays === 0 ? "dernier jour" : `encore ${leftDays} jour${leftDays > 1 ? "s" : ""}`}</p></div>${I.laurel(true)}</div><span class="roundbtn" aria-hidden="true">${I.compass(26)}</span></div>
  <div class="datepill">${shortDate(st.S.start)} – ${shortDate(st.S.end)}</div>
  <div class="chartbox"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution des boussoles cumulées par joueur">${grid}${lines}</svg></div>
  <div class="spanel">${st.list.map(r => {
    const pr = prev && prev.list.find(x => x.id === r.id);
    const mv = pr ? (pr.rank > r.rank ? `<span class="up" aria-label="monte">↑</span>` : pr.rank < r.rank ? `<span class="down" aria-label="descend">↓</span>` : "") : "";
    return `<div class="srow" style="--c:${r.color}">${avatar(r, "lg")}<div class="info"><div class="rk num">#${r.rank} ${mv}${r.me ? toi : ""}</div><b>${esc(r.name)}</b><span>${r.wins} jeu${r.wins > 1 ? "x" : ""} gagné${r.wins > 1 ? "s" : ""} (sur ${r.played})</span></div><div class="tot">${I.compass(34)}<b class="num">${fmtNum(r.total)}</b></div></div>`;
  }).join("")}
  <p class="note center light">Chaque jour, ${CONFIG.gemsPerRank} boussoles par place devancée. Les jours précédant ton arrivée sont simulés pour la démo.</p></div>`;
}

function vPet() {
  const pet = store.profile.pet, S = SPECIES[pet.species], prog = progress(), cat = ["species", "shiny", "bg"].includes(ui.petTab) ? ui.petTab : "species", nx = nextUnlock(prog);
  const me = meP(), st = stageOf(pet), T = TYPES[S.type];
  const evo = [1, 2, 3].map(n => {
    const it = ITEMS.stage.list[n - 1], open = isUnlocked(it, prog), on = st === n, p2 = { ...pet, stage: String(n) };
    return `${n > 1 ? `<span class="evoarr" aria-hidden="true">›</span>` : ""}<${open ? "button" : "div"} class="evo ${on ? "on" : ""} ${open ? "" : "locked"}" ${open ? `data-act="equip" data-v="stage|${n}" aria-pressed="${on}"` : ""}>
      ${petAv(p2, "lg", S.names[n - 1], { sil: !open })}<b>${open ? esc(S.names[n - 1]) : "???"}</b><span>${open ? `Stade ${n}` : reqText(it.need)}</span></${open ? "button" : "div"}>`;
  }).join("");
  return `
  <div class="rowtop">${backBtn()}<span class="kicker">Fiche n°${String(S.num).padStart(3, "0")}</span><span></span></div>
  <div class="dexcard" style="--c:${T.color}">
    <div class="stage" role="img" aria-label="${esc(petDesc(pet))}">${petSVG(pet)}</div>
    <div class="dexhead"><h1 class="display">${esc(petName(pet))}</h1><div class="dexmeta">${typeBadge(S.type)}<span class="tchip">Stade ${st}</span>${pet.shiny === "shiny" ? `<span class="tchip shiny">✦ Chromatique</span>` : ""}</div></div>
    <p class="dextext">${fr(S.dex[st - 1])}</p>
    <div class="traits">${S.traits.map(t => `<span>${t}</span>`).join("")}</div>
  </div>
  <div class="evorow"><span class="kicker">Évolutions</span><div class="evos">${evo}</div></div>
  <div class="avprev">${avatar(me, "xl")}<div class="grow"><b>Ton avatar</b><p class="note">${me.photo ? `Ta photo, avec ${esc(petName(pet))} en médaillon.` : `Ajoute ta photo : ${esc(petName(pet))} se posera en médaillon.`}</p><div class="btnline">${photoBtn(me.photo ? "Changer" : "Ajouter ma photo")}${me.photo ? `<button class="smallbtn ghost" data-act="photo-rm">Retirer</button>` : ""}</div></div></div>
  <div class="pills four">
    ${pill(I.compass(22), fmtNum(prog.gems), "noop", `${fmtNum(prog.gems)} boussoles gagnées`)}
    ${pill(I.fire(22), prog.streak, "noop", `Série de ${prog.streak} jours`)}
    ${pill(I.trophy(22), prog.wins, "noop", `${prog.wins} victoires`)}
    ${pill(`<span class="pl">partie${prog.games > 1 ? "s" : ""}</span>`, prog.games, "noop", `${prog.games} parties terminées`)}
  </div>
  <div class="homerow"><button class="hrow" data-act="trophees">${I.medal(24)}<span class="grow"><b>Succès</b></span><b class="num">${Object.keys(store.ach).length}<small>/${ACH.length}</small></b></button><button class="hrow" data-act="carnet">${I.book(24)}<span class="grow"><b>Carnet</b></span><b class="num">${prog.carnet}</b></button></div>
  ${nx ? `<div class="nextup"><span class="kicker">Prochain déblocage</span><b>${esc(nx.cat === "species" ? `${SPECIES[nx.it.id].names[0]} · nouveau familier` : nx.cat === "stage" ? `Évolution en ${S.names[+nx.it.id - 1]}` : `${nx.it.label} · ${ITEMS[nx.cat].label.toLowerCase()}`)}</b><span class="note">${reqText(nx.it.need)} : encore ${fmtNum(nx.left)}.</span><div class="bar" aria-hidden="true"><i style="width:${Math.min(100, Math.round(100 * nx.have / nx.it.need.v))}%"></i></div></div>` : `<div class="nextup"><b>Tout est débloqué. Bravo !</b></div>`}
  <div class="chips" role="group" aria-label="Catégorie">${["species", "shiny", "bg"].map(c => `<button data-act="pettab" data-v="${c}" aria-pressed="${cat === c}">${ITEMS[c].label}</button>`).join("")}</div>
  <div class="items">${(cat === "species" ? SPECIES_ORDER().map(id => ITEMS.species.list.find(i => i.id === id)) : ITEMS[cat].list).map(it => {
    const open = isUnlocked(it, prog), on = pet[cat] === it.id, sil = cat === "species" && !open;
    const shown = { ...pet, [cat]: it.id };
    const lbl = cat === "species" ? SPECIES[it.id].names[stageOf(pet) - 1] : it.label;
    return `<${open ? "button" : "div"} class="item ${open ? "" : "locked"}" ${open ? `data-act="equip" data-v="${cat}|${it.id}" aria-pressed="${on}"` : ""}>
      ${petAv(shown, "", lbl, { sil })}<span class="lbl">${esc(sil ? "???" : lbl)}</span>${cat === "species" && !sil ? `<span class="req">${esc(TYPES[SPECIES[it.id].type].label)}</span>` : ""}${open ? (on ? `<span class="req on">Choisi</span>` : "") : `<span class="req">${reqText(it.need)}</span><span class="lock">${I.lock}</span>`}</${open ? "button" : "div"}>`;
  }).join("")}</div>`;
}

function vSheet() {
  const me = meP();
  return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Menu" data-stop>
    <div class="sheethead">${avatar(me, "lg")}<div><h3>${esc(store.profile.name)}</h3><div class="muted">${esc(store.profile.group)}</div></div></div>
    <div class="btnline">${photoBtn(me.photo ? "Changer ma photo" : "Ajouter ma photo")}<button class="smallbtn" data-act="pet">Mon familier</button>${featureOn("carnet") ? `<button class="smallbtn" data-act="carnet">${I.book(16)}Carnet · ${progress().carnet}</button>` : ""}${featureOn("trophees") ? `<button class="smallbtn" data-act="trophees">${I.medal(16)}Succès · ${Object.keys(store.ach).length}/${ACH.length}</button>` : ""}</div>
    <div class="walletline">${I.compass(18)}<span>${featureOn("joker") ? "Boussoles disponibles pour les jokers" : "Tes boussoles"} : <b class="num">${fmtNum(wallet())}</b></span></div>
    <div><div class="kicker" style="margin-bottom:6px">Temps de réflexion</div>
      <div class="seg light" role="group" aria-label="Temps de réflexion">${[[1, "Normal"], [1.5, "× 1,5"], [2, "× 2"]].map(([v, l]) => `<button data-act="timepref" data-v="${v}" aria-pressed="${timeFactor() === v}">${l}</button>`).join("")}</div>
      <p class="note">Allonge tous les chronos pour jouer à ton rythme. Le bonus de rapidité se calcule sur le temps que tu as.</p></div>
    <div><div class="kicker" style="margin-bottom:6px">Code d'invitation</div><div class="codebox"><code id="gcodeTxt">${esc(store.profile.code)}</code><button class="smallbtn" data-act="copy">${ui.toast === "copied" ? "Copié" : "Copier"}</button></div></div>
    <div><div class="kicker" style="margin-bottom:8px">Entraînement · non compté</div><div class="fmtgrid">${Object.keys(FORMATS).map(f => `<button class="fmtbtn" data-act="practice" data-v="${f}">${art(f, "p" + f)}<span class="lab">${FORMATS[f].name}</span></button>`).join("")}</div></div>
    <button class="smallbtn" data-act="tuto">Revoir le tutoriel</button>
    <button class="btn ghost" data-act="closesheet">Fermer</button>
    <p class="note center">Dictionnaire du petit bac enrichi grâce au Wiktionnaire (licence CC BY-SA).</p>
    <p class="note center">Drapeaux : Twemoji, © Twitter, Inc. et contributeurs (licence CC BY 4.0).</p>
    <button class="linkbtn" data-act="askreset">Réinitialiser le prototype</button>
  </div></div>`;
}

function vConfirm() {
  const c = ui.confirm;
  return `<div class="confirm"><div class="form" role="dialog" aria-label="${esc(c.title)}"><h3 class="display">${esc(c.title)}</h3><p class="muted">${esc(c.text)}</p><div class="btnrow"><button class="btn ghost" data-act="confirm-no">${esc(c.no)}</button><button class="btn danger" data-act="confirm-yes">${esc(c.yes)}</button></div></div></div>`;
}

/* ---------- photo de profil ---------- */
function readPhoto(file, done) {
  const rd = new FileReader();
  rd.onload = () => {
    const img = new Image();
    img.onload = () => {
      const S = 240, c = document.createElement("canvas"), s = Math.min(img.width, img.height);
      c.width = c.height = S;
      c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, S, S);
      try { done(c.toDataURL("image/jpeg", .82)); } catch (e) { done(null); }
    };
    img.onerror = () => done(null);
    img.src = rd.result;
  };
  rd.onerror = () => done(null);
  rd.readAsDataURL(file);
}
document.addEventListener("change", e => {
  if (e.target.id !== "photoInput" || !e.target.files || !e.target.files[0]) return;
  captureDrafts();
  readPhoto(e.target.files[0], url => {
    if (!url) return;
    if (store.profile) { store.profile.photo = url; save(); } else ui.draftPhoto = url;
    render();
  });
});

/* ---------- interactions générales ---------- */
document.addEventListener("click", e => {
  const stopper = e.target.closest("[data-stop]");
  const el = e.target.closest("[data-act]");
  if (!el) return;
  if (stopper && el.dataset.act === "closesheet" && el.classList.contains("scrim")) return;
  const a = el.dataset.act, v = el.dataset.v;
  switch (a) {
    case "onbtab": captureDrafts(); ui.onbTab = v; render(); break;
    case "pickpet": captureDrafts(); if (speciesOpen(v, store.profile ? progress() : null)) { ui.draftPet = v; render(); } break;
    case "onbnext": ui.onbStep = "form"; render(); break;
    case "onbback": captureDrafts(); ui.onbStep = "pet"; render(); break;
    case "pickpet-ok": store.profile.pet = defaultPet(ui.draftPet); store.profile.seen = unlockedIds(progress()); save(); go("group"); break;
    case "photo-rm": captureDrafts(); if (store.profile) { delete store.profile.photo; save(); } else ui.draftPhoto = null; render(); break;
    case "menu": ui.sheet = true; ui.toast = ""; render(); break;
    case "closesheet": ui.sheet = false; render(); break;
    case "history": ui.sheet = false; go("history"); break;
    case "season": go("season"); break;
    case "pet": ui.sheet = false; go("pet"); break;
    case "pettab": ui.petTab = v; render(); break;
    case "carnet": ui.sheet = false; go("carnet"); break;
    case "trophees": ui.sheet = false; go("trophees"); break;
    case "reactopen": ui.reactOpen = ui.reactOpen === v ? null : v; render(); break;
    case "react": { const [id, emo] = v.split("|"), k = today(), m = store.react[k] = store.react[k] || {}; m[id] = m[id] === emo ? undefined : emo; if (!m[id]) delete m[id]; ui.reactOpen = null; save(); render(); break; }
    case "equip": { const [c, id] = v.split("|"); if (c === "species") { store.profile.pet.species = id; } else store.profile.pet[c] = id; save(); render(); break; }
    case "back": go(["season", "pet", "carnet", "trophees"].includes(ui.view) ? (ui.prevView && ui.prevView !== ui.view ? ui.prevView : "group") : "group"); break;
    case "day": go("day", { dayKey: v }); break;
    case "tab": ui.tab = v; render(); break;
    case "timepref": store.prefs = Object.assign({ time: 1 }, store.prefs, { time: +v }); save(); render(); announce(+v === 1 ? "Temps normal" : `Temps multiplié par ${String(+v).replace(".", ",")}`); break;
    case "tutostart": case "tuto": startTuto(); break;
    case "tutoskip": tutoDone(); go("group"); break;
    case "tutoseen": { const t = store.profile.tuto; if (t) { t.seen = t.seen || {}; t.seen[v] = true; if (v === "carnet") t.seen.trophees = true; save(); } render(); break; }
    case "play": startGame(false); break;
    case "practice": ui.sheet = false; startGame(true, v); break;
    case "copy": copyCode(); break;
    case "askreset": ui.sheet = false; ui.confirm = { title: "Réinitialiser ?", text: "Ton pseudo, ta photo, ton groupe, ton familier, tes scores et tes messages seront effacés de cet appareil.", yes: "Effacer", no: "Annuler", run: () => { store = emptyStore(); save(); ui.view = "onboard"; ui.onbStep = "pet"; ui.draftPet = "renard"; ui.draftName = ""; ui.draftPhoto = null; } }; render(); break;
    case "confirm-no": ui.confirm = null; game ? renderGame() : render(); break;
    case "confirm-yes": { const run = ui.confirm.run; ui.confirm = null; run(); game ? renderGame() : render(); break; }
  }
});
