/* ---------- état de l'interface ---------- */
const ui = { view: store.profile ? "group" : "onboard", tab: "chat", sheet: false, onbTab: "create", onbStep: "welcome", petTab: "species", dayKey: null, confirm: null, toast: "", draftPet: "renard", draftName: "", draftGroup: "Les Cartographes", draftCode: "", draftPhoto: null, prevView: "group" };
let game = null;

function go(view, extra = {}) { Object.assign(ui, { view, ...extra }); window.scrollTo(0, 0); render(); }
function captureDrafts() {
  const v = id => { const el = document.getElementById(id); return el ? el.value : null; };
  const a = v("pseudo"), b = v("gname"), c = v("gcode"), m = v("obmail");
  if (a !== null) ui.draftName = a; if (b !== null) ui.draftGroup = b; if (c !== null) ui.draftCode = c; if (m !== null) ui.draftMail = m;
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
  if (ui.view === "recover") html = vRecover();
  else if (ui.view === "emailcode" && store.profile) html = vEmailCode();
  else if (!store.profile) html = vOnboard();
  else if (!store.profile.pet) html = vPickPet();
  else if (ui.view === "online") html = vOnline();
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
  if (ui.evo) html += vEvo();
  setAppHTML(html);
  $app.className = "app" + (ui.view === "season" && store.profile ? " dotted" : "");
  bindAfterRender();
  syncBack();
}

const backBtn = (act = "back", label = "Retour") => `<button class="roundbtn" data-act="${act}" aria-label="${label}">${I.back}</button>`;
const photoBtn = (label) => `<label class="smallbtn">${I.camera}<span>${label}</span><input type="file" id="photoInput" accept="image/*" hidden></label>`;
const pill = (icon, val, act, aria) => `<button class="spill" data-act="${act}" aria-label="${esc(aria)}"><span class="v num">${val}</span>${icon}</button>`;
const labels = (small, big) => `<span class="labels">${small ? `<span class="lab sm">${small}</span>` : ""}<span class="lab">${big}</span></span>`;
const toi = `<span class="toi">TOI</span>`;

// Logo : même dessin que public/logo.svg (globe, ombre « lèvre », étincelle). Décoratif : le nom est écrit à côté.
const logoMark = (px = 44) => `<svg class="logomark" width="${px}" height="${px}" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><rect width="512" height="512" rx="112" fill="#6B5BE2"/><circle cx="256" cy="274" r="144" fill="#4C3EBE"/><circle cx="256" cy="256" r="144" fill="#FFF6EC" stroke="#2A2333" stroke-width="16"/><g fill="none" stroke="#2A2333" stroke-width="12" stroke-linecap="round"><ellipse cx="256" cy="256" rx="64" ry="144"/><path d="M256 112V400M112 256H400"/></g><path d="M370 100l10 36 36 10-36 10-10 36-10-36-36-10 36-10z" fill="#FFC24A" stroke="#2A2333" stroke-width="10" stroke-linejoin="round"/></svg>`;

function vOnboard() {
  if (ui.onbStep === "welcome") return `<div class="onb welcome">
    <div class="whero"><span class="brand">${logoMark(88)}</span><h1 class="display">Méridien</h1><p class="wtag">Une énigme par jour, la même pour tous tes amis.</p></div>
    <ol class="wsteps">
      <li><span class="wic" aria-hidden="true">🌍</span><div><b>Un défi par jour</b><span>Un seul jeu de culture générale, une surprise chaque matin. 3 manches, 2 essais.</span></div></li>
      <li><span class="wic" aria-hidden="true">👥</span><div><b>Un groupe d'amis</b><span>Crée ton groupe ou rejoins celui d'un ami avec son code. Même jeu, même classement.</span></div></li>
      <li><span class="wic" aria-hidden="true">🧭</span><div><b>Des boussoles à gagner</b><span>Plus tu devances d'amis, plus tu en gagnes, et plus la saison avance, plus elles valent.</span></div></li>
      <li><span class="wic" aria-hidden="true">🦊</span><div><b>Un familier à faire grandir</b><span>Il évolue à chaque partie, réagit à tes scores et se débloque en jouant.</span></div></li>
    </ol>
    <button class="btn" data-act="onbstart">C'est parti</button>
    <button class="linkbtn plainlink" data-act="recover">J'ai déjà un compte</button>
  </div>`;
  if (ui.onbStep === "pet") return `<div class="onb">
    <div class="rowtop">${backBtn("onbwelcome")}<span class="kicker">Étape 1 sur 2</span><span></span></div>
    <div class="ohead"><span class="brand">${logoMark(52)}<span class="kicker">Méridien</span></span><h1 class="display">Choisis ton familier</h1><p class="qsub">Il t'accompagne, réagit à tes parties et se personnalise au fil des jours.</p></div>
    ${petPicker()}
    <button class="btn" data-act="onbnext">Partir avec ${esc(SPECIES[ui.draftPet].names[0])}</button>
    <button class="linkbtn plainlink" data-act="recover">J'ai déjà un compte</button>
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
      <div class="field"><label for="pseudo">Ton pseudo</label><input id="pseudo" maxlength="16" autocomplete="nickname" placeholder="Ex. : Guerrier astral" value="${esc(ui.draftName)}"><button type="button" class="ideabtn" data-act="pseudoidea">🎲 Une idée de pseudo</button></div>
      <div class="field"><label for="obmail">E-mail <small>(facultatif)</small></label><input id="obmail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="Pour retrouver ton compte si tu changes de téléphone" value="${esc(ui.draftMail || "")}"></div>
      <div class="seg light" role="group" aria-label="Groupe">
        <button type="button" data-act="onbtab" data-v="create" aria-pressed="${t === "create"}">Créer un groupe</button>
        <button type="button" data-act="onbtab" data-v="join" aria-pressed="${t === "join"}">Rejoindre</button>
      </div>
      ${t === "create"
        ? `<div class="field"><label for="gname">Nom du groupe</label><input id="gname" maxlength="24" value="${esc(ui.draftGroup)}"></div>`
        : `<div class="field"><label for="gcode">Code du groupe</label><input id="gcode" maxlength="8" placeholder="Ex. : K7Q4ZP" autocapitalize="characters" autocomplete="off" style="text-transform:uppercase" value="${esc(ui.draftCode)}"></div>`}
      <p class="err" id="onbErr" role="alert" hidden></p>
      <button class="btn" type="submit">${t === "create" ? "Créer le groupe" : "Rejoindre"}</button>
    </form>
    <p class="note center">Une connexion est nécessaire pour créer ton profil. Les autres membres de ton groupe sont de vrais joueurs.</p>
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
  const k = today(), mine = playsOf(k);
  return { used: mine.length, best: mine.length ? Math.max(...mine.map(p => p.score)) : null };
}

function vGroup() {
  const k = today(), fmt = fmtOf(k), F = FORMATS[fmt], mans = manchesOf(k, fmt);
  const st = standings(k), me = st.list.find(r => r.me), prog = progress();
  const mt = myToday(), left = triesOf(k) - mt.used, pet = store.profile.pet, S = SPECIES[pet.species];
  let btn;
  if (ui.busyPlay) btn = `<button class="btn" disabled><span class="stack">Connexion…<small>Vérification de ton défi du jour</small></span></button>`;
  else if (left === triesOf(k)) btn = `<button class="btn" data-act="play"><span class="stack">Jouer<small>${triesOf(k) > 1 ? triesOf(k) + " essais · le meilleur compte" : "1 seul essai · jeu spécial du dimanche"}</small></span></button>`;
  else if (left > 0) btn = `<button class="btn" data-act="play"><span class="stack">Rejouer<small>Dernier essai · nouvelles questions · meilleur : ${fmtNum(mt.best)} pts</small></span></button>`;
  else btn = `<button class="btn" disabled><span class="stack">Défi terminé<small>Ton meilleur score : ${fmtNum(mt.best)} pts</small></span></button>`;
  const hello = mt.used ? (left > 0 ? petLine(pet.species, "mid", k) : petLine(pet.species, mt.best >= 400 ? "good" : "mid", k + "d")) : petLine(pet.species, "hello", k);
  return `
  <header class="top">
    <button class="plain" data-act="menu" aria-label="Menu">${I.menu}</button>
    <button class="crew" data-act="season" aria-label="${players().length} membres, voir la saison"><span class="avstack">${players().slice(0, 5).map(p => avatar(p, "md")).join("")}</span></button>
    <button class="plain" data-act="history" aria-label="Jeux précédents">${I.history}</button>
  </header>
  ${srvOn() ? `<button class="gname gswitch" data-act="groups" aria-label="Mes groupes : ${esc(store.profile.group)}. Changer de groupe"><b>${esc(store.profile.group)}<span class="gchev" aria-hidden="true">▾</span></b><span>Défi n°${issueNo(k)} · ${longDate(k)}${SRV.groups.length > 1 ? ` · ${SRV.groups.length} groupes` : ""}</span></button>` : `<div class="gname"><b>${esc(store.profile.group)}</b><span>Défi n°${issueNo(k)} · ${longDate(k)}</span></div>`}
  <div class="pills">
    ${pill(I.compass(26), fmtNum(me.total), "season", `${fmtNum(me.total)} boussoles`)}
    ${pill(I.trophy(26), "#" + me.rank, "season", `Rang ${me.rank} sur ${st.list.length}`)}
    ${pill(I.fire(26), prog.streak, "pet", `Série de ${prog.streak} jour${prog.streak > 1 ? "s" : ""}`)}
  </div>
  ${streakStrip()}
  ${tutoNotice()}${onlineNotice()}${recapCard()}
  <section class="today" aria-label="Défi du jour">
    <div class="cover">${art(fmt, k)}${labels(`Défi du jour · 3 manches`, F.name)}</div>
    <div class="tbody">
      <p class="sub">${fr(F.sub)}</p>
      <div class="rounds">${mans.map((m, i) => roundChip(m, i)).join("")}</div>
      ${btn}
      ${vBoost()}
      ${ui.homeMsg ? `<p class="err" role="alert">${esc(ui.homeMsg)}</p>` : ""}
      <div class="countdown">Prochain défi dans <b id="cd" class="num">--:--:--</b></div>
    </div>
  </section>
  ${vCatchup()}
  <button class="petline" data-act="pet" aria-label="Mon familier. ${esc(petDesc(pet))}">${petAv(pet, "md", petName(pet))}<span><b>${esc(petName(pet))}</b> ${fr(hello)}</span></button>
  <div class="seg light" role="group" aria-label="Affichage"><button data-act="tab" data-v="chat" aria-pressed="${ui.tab === "chat"}">Chat</button><button data-act="tab" data-v="scores" aria-pressed="${ui.tab === "scores"}">Scores</button></div>
  ${ui.tab === "chat" ? vFeed(k) : vRanking(k)}
  ${ui.tab === "chat" ? `<div class="composer">${ui.chatMsg ? `<p class="chatmsg" id="chatmsg" role="status">${esc(ui.chatMsg)}</p>` : ""}${ui.stickers ? stickerPanel() : ""}<form id="msgForm"><button type="button" class="stkopen" data-act="stkopen" aria-label="Autocollants" aria-expanded="${!!ui.stickers}">😀</button><input id="msg" maxlength="200" placeholder="Message" autocomplete="off" aria-label="Message au groupe"><button type="submit">Envoyer</button></form></div>` : ""}`;
}

function vFeed(k) {
  const ev = feed(k), lead = dayResults(k).played[0];
  if (!ev.length) return `<div class="feed"><p class="note center">${srvOn() ? "Personne n'a encore joué ni écrit aujourd'hui. Lance le défi, ou dis bonjour à ton groupe !" : "Personne n'a encore joué aujourd'hui. Lance le défi !"}</p></div>`;
  return `<div class="feed">${ev.map(e => {
    if (e.type === "launch") return `<div class="fpill">${avatar(e.p, "sm")}<span><b>Défi lancé</b><small>${esc(e.p.name)} ${hm(e.at)}</small></span></div>`;
    if (e.type === "score") return `<div class="fitem"><button class="fpill ${e.best && lead && e.p.id === lead.id ? "best" : ""}" data-act="reactopen" data-v="${e.id}" aria-label="Réagir au score de ${esc(e.p.name)}">${avatar(e.p, "sm")}<span><b>Score : ${fmtNum(e.score)} pts</b><small>${esc(e.p.name)} ${hm(e.at)}</small></span></button>${reactRow(k, e)}</div>`;
    return `<div class="msg ${e.mine ? "me" : ""}">${e.mine ? "" : avatar(e.p, "md")}<div class="mcol"><button class="bubble" data-act="reactopen" data-v="${e.id}">${e.mine ? "" : `<span class="who" style="color:${e.p.color}">${esc(e.p.name)}</span>`}<span class="tx ${stickerOf(e.text) ? "sticker" : ""}">${msgBody(e)}</span><span class="at num">${hm(e.at)}</span></button>${reactRow(k, e)}</div></div>`;
  }).join("")}</div>`;
}

function vRanking(k) {
  const res = dayResults(k);
  if (!res.played.length) return `<p class="note center">Aucun score pour l'instant.</p>`;
  let out = "", sep = false;
  res.played.forEach(r => {
    if (r.pos > 3 && !sep) { out += `<hr class="podium">`; sep = true; }
    out += `<button class="rkp" data-act="detail" data-v="${esc(r.id)}|${k}" aria-label="Détail des points de ${esc(r.name)}, ${fmtNum(r.best)} points, rang ${r.pos}" style="--c:${r.color}">
      <span class="pos num">#${r.pos}</span>
      <span class="main">${avatar(r, "md")}<span class="info"><b class="num">${fmtNum(r.best)} pts</b><span class="nm">${esc(r.name)}${r.me ? toi : ""}</span></span></span>
      <span class="badges">${r.boost ? `<i class="num" title="Boost ×1,5">⚡×1,5</i>` : ""}${r.tries > 1 ? `<i class="num">${r.tries} ${I.retry(13)}</i>` : ""}<i class="num">+${r.gems} ${I.compass(13)}</i></span>
    </button>`;
  });
  return `<div class="rank">${out}
  ${res.waiting.length ? `<div class="waiting">${res.waiting.map(w => `<span class="w">${avatar(w, "sm")}${esc(w.name)} · pas encore joué</span>`).join("")}</div>` : ""}</div>`;
}

// historique en ligne : tous mes jeux joués (tous groupes), sur le mois glissant (30 jours) ou depuis le début
function vHistoryOnline() {
  const k = today(), all = ui.hmode === "all", h = SRV.hist;
  const rows = (h || []).filter(r => all || diffDays(r.play_day, k) < 30), S = seasonOf(k);
  const wins = rows.filter(r => r.pos === 1 && r.n >= 2).length;
  const card = r => {
    const f = r.fmt, F = FORMATS[f]; if (!F) return "";
    const open = r.group_id === SRV.gid && r.play_day >= S.start;
    const top = r.n >= 2 ? `<span class="htop num">#${r.pos}/${r.n}</span>` : "";
    const lab = labels(`${r.play_day === k ? "aujourd'hui" : shortDate(r.play_day)} · ${fmtNum(r.best)} pts`, F.name);
    const aria = `${F.name}, ${longDate(r.play_day)}, groupe ${r.group_name}, ton score : ${fmtNum(r.best)} points${r.n >= 2 ? ", rang " + r.pos + " sur " + r.n : ""}`;
    return `<${open ? `button data-act="day" data-v="${r.play_day}"` : "div"} class="hcard sq" aria-label="${esc(aria)}">${art(f, r.play_day)}${top}<span class="hgrp">${esc(r.group_name)}</span>${lab}</${open ? "button" : "div"}>`;
  };
  return `<div class="sheetpage">
    <button class="closepill" data-act="back">${I.down}<span>Fermer</span></button>
    <div class="sheetbody">
      <h1 class="bigtitle">Mes jeux joués</h1>
      <div class="hstats"><div class="hs"><b class="num">${rows.length}</b><span>Joués</span></div><div class="hs"><b class="num">${wins}</b><span>Gagnés</span></div><div class="hs"><b class="num">${SRV.groups.length}</b><span>Groupe${SRV.groups.length > 1 ? "s" : ""}</span></div></div>
      <div class="seg light" role="group" aria-label="Période"><button data-act="hmode" data-v="month" aria-pressed="${!all}">30 derniers jours</button><button data-act="hmode" data-v="all" aria-pressed="${all}">Depuis le début</button></div>
      <button class="row" data-act="season">${I.trophy(26)}<span class="grow">Stats de la saison</span>${I.chev}</button>
      <p class="note center">Un seul jeu par jour et par groupe, et c'est la surprise : les jeux passés se consultent, mais ne se rejouent pas.</p>
      ${h === null || h === undefined ? `<p class="note center">Chargement…</p>` : rows.length ? `<div class="hgrid">${rows.map(card).join("")}</div>` : `<p class="note center">Aucun jeu joué sur cette période. Lance le défi du jour !</p>`}
    </div></div>`;
}

function vHistory() {
  if (srvOn()) return vHistoryOnline();
  const k = today(), S = seasonOf(k), days = [];
  for (let d = k; d >= S.start; d = addDays(d, -1)) days.push(d);
  // jeux déjà joués par le groupe ; le jeu du jour n'apparaît qu'une fois joué (la surprise reste entière)
  const past = days.map(d => { const res = dayResults(d); return { d, res, f: fmtOf(d), me: res.played.find(r => r.me) }; }).filter(x => x.res.N > 0 && (x.d !== k || x.me));
  return `<div class="sheetpage">
    <button class="closepill" data-act="back">${I.down}<span>Fermer</span></button>
    <div class="sheetbody">
      <h1 class="bigtitle">Jeux précédents</h1><div class="spaced">Saison ${S.n}</div>
      <button class="row" data-act="season">${I.trophy(26)}<span class="grow">Stats de la saison</span>${I.chev}</button>
      <p class="note center">Un seul jeu par jour, et c'est la surprise : les jeux passés se consultent, mais ne se rejouent pas.</p>
      ${past.length ? `<div class="list">${past.map(({ d, res, f, me }) => {
        const mine = me ? `${fmtNum(me.best)} pts` : "non joué";
        return `<button class="hcard" data-act="day" data-v="${d}" aria-label="${FORMATS[f].name}, ${longDate(d)}, ${res.N} joueur${res.N > 1 ? "s" : ""}, ${me ? "ton score : " + fmtNum(me.best) + " points" : "tu n'as pas joué"}">${art(f, d)}
          <span class="avrow">${res.played.slice(0, 6).map(p => avatar(p, "md")).join("")}</span>
          ${labels(`${d === k ? "aujourd'hui" : shortDate(d)} · ${mine}`, FORMATS[f].name)}</button>`;
      }).join("")}</div>` : `<p class="note center">Aucun jeu précédent pour l'instant. Reviens demain !</p>`}
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
      <p class="note center">Ce jeu ne se rejoue pas : un nouveau défi t'attend chaque jour.</p>
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
  <p class="note center light">Chaque jour, ${CONFIG.gemsPerRank} boussoles par place devancée, avec un bonus qui monte au fil de la saison (+5 % par jour, jusqu'à +100 % le dernier jour)${srvOn() ? ". Les boussoles du jour sont provisoires jusqu'à la fin de la journée." : ". Les jours précédant ton arrivée sont simulés pour la démo."}</p></div>`;
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
  <div class="avprev">${avatar(me, "xl")}<div class="grow"><b>${esc(store.profile.name)}</b><p class="note">${me.photo ? `Ta photo, avec ${esc(petName(pet))} en médaillon.` : `Ajoute ta photo : ${esc(petName(pet))} se posera en médaillon.`}</p><div class="btnline"><button class="smallbtn" data-act="rename">Changer de pseudo</button>${photoBtn(me.photo ? "Changer" : "Ajouter ma photo")}${me.photo ? `<button class="smallbtn ghost" data-act="photo-rm">Retirer</button>` : ""}</div></div></div>
  <div class="kicker pers">Personnaliser ton familier</div>
  <div class="chips" role="group" aria-label="Catégorie">${["species", "shiny", "bg"].map(c => `<button data-act="pettab" data-v="${c}" aria-pressed="${cat === c}">${ITEMS[c].label}</button>`).join("")}</div>
  <div class="items">${(cat === "species" ? SPECIES_ORDER().map(id => ITEMS.species.list.find(i => i.id === id)) : ITEMS[cat].list).map(it => {
    const open = isUnlocked(it, prog), on = pet[cat] === it.id, sil = cat === "species" && !open;
    const shown = { ...pet, [cat]: it.id };
    const lbl = cat === "species" ? SPECIES[it.id].names[stageOf(pet) - 1] : it.label;
    return `<${open ? "button" : "div"} class="item ${open ? "" : "locked"}" ${open ? `data-act="equip" data-v="${cat}|${it.id}" aria-pressed="${on}"` : ""}>
      ${petAv(shown, "", lbl, { sil })}<span class="lbl">${esc(sil ? "???" : lbl)}</span>${cat === "species" && !sil ? `<span class="req">${esc(TYPES[SPECIES[it.id].type].label)}</span>` : ""}${open ? (on ? `<span class="req on">Choisi</span>` : "") : `<span class="req">${reqText(it.need)}</span><span class="lock">${I.lock}</span>`}</${open ? "button" : "div"}>`;
  }).join("")}</div>
  <div class="evorow"><span class="kicker">Évolutions</span><div class="evos">${evo}</div>${st > 1 ? `<button class="smallbtn" data-act="evoreplay">Revoir l'évolution</button>` : ""}</div>
  <div class="pills four">
    ${pill(I.compass(22), fmtNum(prog.gems), "noop", `${fmtNum(prog.gems)} boussoles gagnées`)}
    ${pill(I.fire(22), prog.streak, "noop", `Série de ${prog.streak} jours`)}
    ${pill(I.trophy(22), prog.wins, "noop", `${prog.wins} victoires`)}
    ${pill(`<span class="pl">partie${prog.games > 1 ? "s" : ""}</span>`, prog.games, "noop", `${prog.games} parties terminées`)}
  </div>
  <div class="homerow"><button class="hrow" data-act="trophees">${I.medal(24)}<span class="grow"><b>Succès</b></span><b class="num">${Object.keys(store.ach).length}<small>/${ACH.length}</small></b></button><button class="hrow" data-act="carnet">${I.book(24)}<span class="grow"><b>Carnet</b></span><b class="num">${prog.carnet}</b></button></div>
  ${nx ? `<div class="nextup"><span class="kicker">Prochain déblocage</span><b>${esc(nx.cat === "species" ? `${SPECIES[nx.it.id].names[0]} · nouveau familier` : nx.cat === "stage" ? `Évolution en ${S.names[+nx.it.id - 1]}` : `${nx.it.label} · ${ITEMS[nx.cat].label.toLowerCase()}`)}</b><span class="note">${reqText(nx.it.need)} : encore ${fmtNum(nx.left)}.</span><div class="bar" aria-hidden="true"><i style="width:${Math.min(100, Math.round(100 * nx.have / nx.it.need.v))}%"></i></div></div>` : `<div class="nextup"><b>Tout est débloqué. Bravo !</b></div>`}
`;
}

function vSheet() {
  if (ui.sheet === "groups") return vGroupsSheet();
  if (ui.sheet === "detail") return vDetailSheet();
  if (ui.sheet === "recap") return vRecapSheet();
  if (ui.sheet === "rename") return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Changer de pseudo" data-stop>
    <div class="sheethead"><div><h3>Changer de pseudo</h3><div class="muted">Tes amis verront ce nouveau nom (2 à 16 caractères).</div></div></div>
    <form id="renameForm" class="plainform" novalidate><div class="field"><label for="newName">Pseudo</label><input id="newName" maxlength="16" autocomplete="nickname" value="${esc(store.profile.name)}"></div>${ui.renameMsg ? `<p class="err" role="alert">${esc(ui.renameMsg)}</p>` : ""}<div class="btnline"><button class="smallbtn" type="submit">Enregistrer</button><button class="smallbtn ghost" type="button" data-act="closesheet">Annuler</button></div></form>
  </div></div>`;
  const me = meP();
  return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Menu" data-stop>
    <div class="sheethead">${avatar(me, "lg")}<div><h3>${esc(store.profile.name)}</h3><div class="muted">${esc(store.profile.group)}</div></div></div>
    <div class="btnline">${photoBtn(me.photo ? "Changer ma photo" : "Ajouter ma photo")}<button class="smallbtn" data-act="pet">Mon familier</button>${featureOn("carnet") ? `<button class="smallbtn" data-act="carnet">${I.book(16)}Carnet · ${progress().carnet}</button>` : ""}${featureOn("trophees") ? `<button class="smallbtn" data-act="trophees">${I.medal(16)}Succès · ${Object.keys(store.ach).length}/${ACH.length}</button>` : ""}</div>
    <div class="walletline">${I.compass(18)}<span>${featureOn("joker") ? "Boussoles disponibles pour les jokers" : "Tes boussoles"} : <b class="num">${fmtNum(wallet())}</b></span></div>
    ${mobileSheetBlocks()}
    <button class="smallbtn" data-act="recap">Récap de la semaine</button>
    ${reminderBlock()}
    ${srvOn() ? `<button class="smallbtn" data-act="groups">Mes groupes (${SRV.groups.length || 1})</button>` : ""}
    ${accountSheetBlock()}
    <div><div class="kicker" style="margin-bottom:6px">Code d'invitation</div><div class="codebox"><code id="gcodeTxt">${esc(fmtCode(store.profile.code))}</code><button class="smallbtn" data-act="copy">${ui.toast === "copied" ? "Copié" : "Copier"}</button></div></div>
    <button class="smallbtn" data-act="tuto">Revoir le tutoriel</button>
    <button class="btn ghost" data-act="closesheet">Fermer</button>
    <p class="note center">Dictionnaire du petit bac enrichi grâce au Wiktionnaire (licence CC BY-SA).</p>
    <p class="note center">Drapeaux : Twemoji, © Twitter, Inc. et contributeurs (licence CC BY 4.0).</p>
    <button class="linkbtn" data-act="askreset">Réinitialiser le prototype</button>
  </div></div>`;
}

const tryList = r => { const l = r.tryScores || (r.plays && r.plays.length > 1 ? r.plays.map(p => p.score) : null); return l && l.length > 1 ? l : null; };
// détail d'un score (clic sur une ligne du classement) : points du jeu, rang et décompte des boussoles
function vDetailSheet() {
  const d = ui.detail || {}, k = d.k || today(), res = dayResults(k), r = res.played.find(x => String(x.id) === String(d.pid));
  if (!r) return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Détail" data-stop><p class="note">Ce score n'est plus disponible.</p><button class="btn ghost" data-act="closesheet">Fermer</button></div></div>`;
  const tot = (standings(k).list.find(x => String(x.id) === String(r.id)) || {}).total;
  const g = CONFIG.gemsPerRank, f = fmtOf(k), n = r.beaten || 0;
  const line = (ic, label, v) => `<li class="dline"><span class="dic" aria-hidden="true">${ic}</span><span>${label}</span><b class="num">${v}</b></li>`;
  return `<div class="scrim" data-act="closesheet"><div class="sheet detail" role="dialog" aria-label="Détail des points de ${esc(r.name)}" data-stop>
    <div class="dhead">${avatar(r, "lg")}<div><h3>${esc(r.name)}${r.me ? toi : ""}</h3><div class="muted">${esc(FORMATS[f].name)} · ${shortDate(k)}</div></div></div>
    <div class="dpills"><span class="dpill">${I.trophy(18)}Classement <b class="num">#${r.pos}</b></span><span class="dpill">${I.compass(18)}Boussoles <b class="num">${fmtNum(tot || 0)}</b></span></div>
    ${r.boost ? `<p class="boostnote on"><span aria-hidden="true">⚡</span> Boost ×1,5 activé : les scores ci-dessous en tiennent compte.</p>` : ""}
    <div class="dscore"><b class="num">${fmtNum(r.best)} pts</b><span>${r.tries > 1 ? `meilleur de ${r.tries} essais` : "1 essai"}</span></div>
    ${tryList(r) ? `<ul class="dtries" aria-label="Score de chaque essai">${tryList(r).map((s, i) => `<li class="${s === r.best ? "top" : ""}"><span>Essai ${i + 1}</span><b class="num">${fmtNum(s)} pts</b>${s === r.best ? `<i>meilleur</i>` : ""}</li>`).join("")}</ul>` : ""}
    ${res.N >= 2 ? `<ul class="dlines">
      ${line("✓", "Partie jouée", "+" + g)}
      ${line(I.trophy(16), `${n} autre${n > 1 ? "s" : ""} battu${n > 1 ? "s" : ""}`, "+" + (g * n))}
      ${r.mult === 2 ? line("☀", "Jeu du dimanche : boussoles ×2", "+" + (r.base || 0)) : ""}
      ${line("↗", `Jour ${dayInSeason(k)} (+${r.pct != null ? r.pct : dayBonusPct(k)} %)`, "+" + (r.bonus || 0))}
      <li class="dline total"><span class="dic" aria-hidden="true">${I.compass(18)}</span><span>Total</span><b class="num">+${r.gems}</b></li>
    </ul>` : `<p class="note">Il faut au moins 2 joueurs ce jour-là pour gagner des boussoles.</p>`}
    <p class="note">Plus la saison avance, plus les boussoles rapportent : les derniers jours comptent le plus.</p>
    <button class="btn ghost" data-act="closesheet">Fermer</button>
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
    if (store.profile) { store.profile.photo = url; save(); srvPushPhoto(); } else ui.draftPhoto = url; // en ligne : la photo est envoyée au serveur pour que les amis la voient
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
    case "onbstart": ui.onbStep = "pet"; render(); break;
    case "onbwelcome": ui.onbStep = "welcome"; render(); break;
    case "onbnext": ui.onbStep = "form"; render(); break;
    case "onbback": captureDrafts(); ui.onbStep = "pet"; render(); break;
    case "pickpet-ok": store.profile.pet = defaultPet(ui.draftPet); store.profile.seen = unlockedIds(progress()); save(); go("group"); break;
    case "photo-rm": captureDrafts(); if (store.profile) { delete store.profile.photo; save(); srvPushPhoto(); } else ui.draftPhoto = null; render(); break;
    case "evoclose": ui.evo = null; game ? renderGame() : render(); break;
    case "evoreplay": { const pet = store.profile.pet, st = stageOf(pet); if (st > 1) { openEvo(pet, st - 1, st); render(); } break; }
    case "menu": ui.sheet = true; ui.toast = ""; render(); srvRefreshGroup(); break;
    case "detail": { const [pid, dk] = String(v).split("|"); ui.detail = { pid, k: dk }; ui.sheet = "detail"; render(); break; }
    case "pseudoidea": { captureDrafts(); const A = ["Guerrier", "Capitaine", "Ninja", "Pirate", "Sorcier", "Explorateur", "Chevalier", "Dragon", "Renard", "Astronaute"], B = ["astral", "cosmique", "des étoiles", "électrique", "mystère", "turbo", "lunaire", "sauvage", "zen", "solaire"]; let s = ""; for (let i = 0; i < 20; i++) { s = A[Math.floor(Math.random() * A.length)] + " " + B[Math.floor(Math.random() * B.length)]; if (s.length <= 16) break; } ui.draftName = s.slice(0, 16); render(); break; }
    case "catchup": playCatchup(v); break;
    case "boostask": ui.confirm = { title: "Activer ton boost ?", text: `Une seule fois par saison. Ton score de ce jeu dans « ${(SRV.group && SRV.group.name) || "ce groupe"} » comptera ×1,5 dans le classement. Impossible de l'annuler, et à faire avant ton premier essai.`, yes: "Activer le boost", no: "Plus tard", run: () => srvUseBoost() }; render(); break;
    case "recap": ui.sheet = "recap"; render(); break;
    case "recapclose": if (store.profile) { store.profile.recapSeen = weekKeyOf(today()); save(); } render(); break;
    case "remindics": { const el2 = document.getElementById("remindTime"); remindICS(el2 ? el2.value : "08:00"); ui.remindMsg = "Fichier envoyé : ouvre-le pour l'ajouter à ton calendrier (sur iPhone, touche « Ajouter »)."; render(); break; }
    case "rename": ui.sheet = "rename"; ui.renameMsg = ""; render(); break;
    case "groups": ui.sheet = "groups"; ui.gadd = null; render(); srvLoadGroups().then(() => { if (ui.sheet === "groups" && !game) render(); }); break;
    case "gswitch": srvSwitchGroup(v); break;
    case "gaddmode": ui.gadd = { mode: v, msg: "" }; render(); break;
    case "gaddno": ui.gadd = null; render(); break;
    case "gleave": { const gr = SRV.groups.find(x => x.id === v); if (!gr) break; ui.confirm = { title: `Quitter « ${gr.name} » ?`, text: "Tes scores dans ce groupe ne compteront plus pour lui. Tu pourras le rejoindre avec son code.", yes: "Quitter", no: "Annuler", run: () => srvLeaveGroup(gr.id) }; render(); break; }
    case "goonline": ui.sheet = false; go("online"); break;
    case "emailskip": go("welcome"); break;
    case "stkopen": ui.stickers = !ui.stickers; render(); break;
    case "stksend": sendSticker(v); break;
    case "recover": ui.sheet = false; ui.rec = { step: 0, email: "", msg: "" }; go("recover"); break;
    case "recoverback": ui.rec = null; ui.view = store.profile ? "group" : "onboard"; go(ui.view); break;
    case "recoveragain": ui.rec = { step: 0, email: (ui.rec && ui.rec.email) || "", msg: "" }; render(); break;
    case "acctagain": ui.acct = { step: 0, email: (ui.acct && ui.acct.email) || "", msg: "" }; render(); break;
    case "closesheet": ui.sheet = false; render(); break;
    case "history": ui.sheet = false; go("history"); if (srvOn()) srvLoadHistory(); break;
    case "hmode": ui.hmode = v; render(); break;
    case "season": go("season"); break;
    case "pet": ui.sheet = false; go("pet"); break;
    case "pettab": ui.petTab = v; render(); break;
    case "carnet": ui.sheet = false; go("carnet"); break;
    case "trophees": ui.sheet = false; go("trophees"); break;
    case "reactopen": ui.reactOpen = ui.reactOpen === v ? null : v; render(); break;
    case "msgreport": srvAskMod("report", v); break;
    case "msgblock": srvAskMod("block", v); break;
    case "msgdel": srvAskMod("del", v); break;
    case "unblock": srvUnblock(v); break;
    case "react": { if (srvOn()) { const [rid, remo] = v.split("|"); srvReact(rid, remo); break; } const [id, emo] = v.split("|"), k = today(), m = store.react[k] = store.react[k] || {}; m[id] = m[id] === emo ? undefined : emo; if (!m[id]) delete m[id]; ui.reactOpen = null; save(); render(); break; }
    case "equip": { const [c, id] = v.split("|"); if (c === "species") { store.profile.pet.species = id; } else store.profile.pet[c] = id; save(); render(); break; }
    case "back": go(["season", "pet", "carnet", "trophees"].includes(ui.view) ? (ui.prevView && ui.prevView !== ui.view ? ui.prevView : "group") : "group"); break;
    case "day": go("day", { dayKey: v }); break;
    case "tab": ui.tab = v; render(); break;
    case "hapticpref": store.prefs = Object.assign({ time: 1 }, store.prefs, { haptics: v === "true" }); save(); render(); buzz(30); break;
    case "install": installNow(); break;
    case "tutostart": case "tuto": startTuto(); break;
    case "tutoskip": tutoDone(); go("group"); break;
    case "tutoseen": { const t = store.profile.tuto; if (t) { t.seen = t.seen || {}; t.seen[v] = true; if (v === "carnet") t.seen.trophees = true; save(); } render(); break; }
    case "play": playToday(); break;
    case "copy": copyCode(); break;
    case "askreset": ui.sheet = false; ui.confirm = { title: "Réinitialiser ?", text: store.profile && store.profile.srv ? "Ton compte en ligne, ta place dans le groupe, ton familier et tes scores seront supprimés, ici et sur le serveur. Cette action est définitive." : "Ton pseudo, ta photo, ton groupe, ton familier, tes scores et tes messages seront effacés de cet appareil.", yes: "Effacer", no: "Annuler", run: () => { srvResetAccount(); store = emptyStore(); save(); ui.view = "onboard"; ui.onbStep = "pet"; ui.draftPet = "renard"; ui.draftName = ""; ui.draftPhoto = null; } }; render(); break;
    case "confirm-no": ui.confirm = null; game ? renderGame() : render(); break;
    case "confirm-yes": { const run = ui.confirm.run; ui.confirm = null; run(); game ? renderGame() : render(); break; }
  }
});
