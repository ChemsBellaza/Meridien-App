/* ============ RITUELS (v27) : série visible, récap hebdomadaire du groupe, rappel quotidien, bilan de fin de partie ============
   Uniquement des fonctions déclarées (hoisting) : ce fichier est chargé après les écrans qui les appellent. */
const WD_INITIAL = ["D", "L", "M", "M", "J", "V", "S"];
const dowOf = k => new Date(k + "T12:00:00").getDay();

/* ---------- jours joués par moi (7 derniers jours) ---------- */
function myPlayedDays() {
  const set = new Set();
  if (srvOn()) { (SRV.recent || []).forEach(r => set.add(r.play_day)); const t = today(); if (playsOf(t).some(p => p.score > 0 || p.at)) set.add(t); }
  else Object.keys(store.plays || {}).forEach(d => { if ((store.plays[d] || []).length) set.add(d); });
  return set;
}
// série visible : flamme + 7 pastilles (une par jour), jalons 3 / 7 / 14 / 30 jours
function streakStrip() {
  const k = today(), played = myPlayedDays(), n = progress().streak;
  const dots = [6, 5, 4, 3, 2, 1, 0].map(i => { const d = addDays(k, -i), on = played.has(d), isT = i === 0;
    return `<span class="sd ${on ? "on" : ""} ${isT ? "today" : ""}" role="img" aria-label="${WD_INITIAL[dowOf(d)]} : ${on ? "joué" : isT ? "à jouer aujourd'hui" : "pas joué"}"><i>${on ? "✓" : ""}</i><small>${WD_INITIAL[dowOf(d)]}</small></span>`; }).join("");
  const next = [3, 7, 14, 30, 60, 100].find(m => m > n);
  const msg = n === 0 ? "Joue aujourd'hui pour lancer ta série." : playedToday(played, k) ? (n >= 3 ? `Série de ${n} jours : reviens demain pour la prolonger.` : `Bien joué ! Reviens demain.`) : `Joue aujourd'hui pour garder ta série de ${n} jour${n > 1 ? "s" : ""} !`;
  return `<section class="streak" aria-label="Ma série"><div class="sflame">${I.fire(26)}<b class="num">${n}</b></div><div class="smid"><div class="sdots">${dots}</div><p class="note">${msg}${next && n > 0 ? ` Prochain palier : ${next} jours.` : ""}</p></div></section>`;
}
const playedToday = (set, k) => set.has(k);

/* ---------- récap hebdomadaire du groupe (calculé sur les 7 derniers jours terminés) ---------- */
function weekRecapData() {
  const k = today(), S = seasonOf(k), acc = {}; let days = 0, topScore = null;
  players().forEach(p => { acc[p.id] = { p, gems: 0, wins: 0, days: 0, best: 0 }; });
  for (let i = 7; i >= 1; i--) {
    const d = addDays(k, -i); if (d < S.start) continue;
    const res = dayResults(d); if (!res.played.length) continue;
    days++;
    res.played.forEach(r => {
      const a = acc[r.id]; if (!a) return;
      a.gems += r.gems || 0; a.days++; if (r.win) a.wins++; a.best = Math.max(a.best, r.best);
      if (!topScore || r.best > topScore.best) topScore = { name: r.name, best: r.best, fmt: fmtOf(d), d };
    });
  }
  const list = Object.values(acc).filter(a => a.days);
  if (!list.length) return null;
  const byGems = list.slice().sort((a, b) => b.gems - a.gems || b.wins - a.wins), byDays = list.slice().sort((a, b) => b.days - a.days || b.gems - a.gems);
  return { days, star: byGems[0], regular: byDays[0], top: topScore, me: list.find(a => a.p.me) || null, list: byGems };
}
function weekKeyOf(k) { return addDays(k, -((dowOf(k) + 6) % 7)); } // lundi de la semaine
function recapCard() { // carte de l'accueil : le lundi, tant qu'elle n'est pas fermée
  if (!store.profile || dowOf(today()) !== 1 || store.profile.recapSeen === weekKeyOf(today())) return "";
  const r = weekRecapData(); if (!r) return "";
  return `<div class="tnotice" role="note"><span class="kicker">Récap de la semaine</span><b>${esc(r.star.p.name)} a dominé la semaine</b><span>${r.star.gems} boussoles, ${r.star.wins} victoire${r.star.wins > 1 ? "s" : ""}. Voici le bilan de ton groupe.</span><span class="btnline"><button class="smallbtn" data-act="recap">Voir le récap</button><button class="smallbtn ghost" data-act="recapclose">Fermer</button></span></div>`;
}
function vRecapSheet() {
  const r = weekRecapData(), k = today(), a = addDays(k, -7), b = addDays(k, -1);
  if (!r) return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Récap de la semaine" data-stop><div class="sheethead"><div><h3>Récap de la semaine</h3><div class="muted">Pas encore de jeux terminés cette semaine.</div></div></div><button class="btn ghost" data-act="closesheet">Fermer</button></div></div>`;
  const row = (rank, x) => `<li class="grow3"><span class="num">#${rank}</span>${avatar(x.p, "sm")}<b>${esc(x.p.name)}${x.p.me ? toi : ""}</b><span class="num">${x.gems} ${I.compass(14)}</span></li>`;
  return `<div class="scrim" data-act="closesheet"><div class="sheet detail" role="dialog" aria-label="Récap de la semaine" data-stop>
    <div class="sheethead"><div><h3>Récap de la semaine</h3><div class="muted">${shortDate(a)} – ${shortDate(b)} · ${r.days} jeu${r.days > 1 ? "x" : ""} joué${r.days > 1 ? "s" : ""}</div></div></div>
    <div class="rhero">${avatar(r.star.p, "lg")}<div><span class="kicker">Joueur de la semaine</span><b>${esc(r.star.p.name)}</b><span>${r.star.gems} boussoles · ${r.star.wins} victoire${r.star.wins > 1 ? "s" : ""}</span></div></div>
    <ul class="hl">
      <li><span aria-hidden="true">📅</span><span>Le plus régulier : <b>${esc(r.regular.p.name)}</b>, ${r.regular.days} jour${r.regular.days > 1 ? "s" : ""} sur ${r.days}</span></li>
      ${r.top ? `<li><span aria-hidden="true">⭐</span><span>Meilleur score : <b>${esc(r.top.name)}</b>, ${fmtNum(r.top.best)} pts (${esc(FORMATS[r.top.fmt] ? FORMATS[r.top.fmt].name : "")})</span></li>` : ""}
      ${r.me ? `<li><span aria-hidden="true">🧭</span><span>Ton bilan : <b>${r.me.gems} boussoles</b>, ${r.me.wins} victoire${r.me.wins > 1 ? "s" : ""}, ${r.me.days} jour${r.me.days > 1 ? "s" : ""} joué${r.me.days > 1 ? "s" : ""}</span></li>` : ""}
    </ul>
    <ol class="glist3">${r.list.slice(0, 6).map((x, i) => row(i + 1, x)).join("")}</ol>
    <button class="btn ghost" data-act="closesheet">Fermer</button></div></div>`;
}

/* ---------- rappel quotidien : événement récurrent avec alarme dans le calendrier du téléphone ---------- */
function reminderBlock() {
  const t = (store.profile && store.profile.remindAt) || "08:00";
  return `<div><div class="kicker" style="margin-bottom:6px">Rappel quotidien</div><p class="note">Ajoute un rappel chaque jour dans le calendrier de ton téléphone : une alarme te prévient que le défi t'attend.</p><div class="btnline"><label class="timelab"><span class="sr">Heure du rappel</span><input type="time" id="remindTime" value="${esc(t)}" aria-label="Heure du rappel"></label><button class="smallbtn" data-act="remindics">Ajouter au calendrier</button></div>${ui.remindMsg ? `<p class="note" role="status">${esc(ui.remindMsg)}</p>` : ""}</div>`;
}
function remindICS(hhmm) {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm || "") ? hhmm : "08:00", [h, mi] = m.split(":"), d = new Date(), p = n => String(n).padStart(2, "0");
  const day = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`, stamp = `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`;
  const url = location.origin + location.pathname;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Meridien//FR", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", "UID:rappel-quotidien@meridien", "DTSTAMP:" + stamp,
    `DTSTART:${day}T${h}${mi}00`, "DURATION:PT10M", "RRULE:FREQ=DAILY", "SUMMARY:Méridien : ton défi du jour", "DESCRIPTION:Un jeu par jour, la même énigme pour tout ton groupe. " + url, "URL:" + url,
    "BEGIN:VALARM", "TRIGGER:PT0S", "ACTION:DISPLAY", "DESCRIPTION:Méridien : ton défi du jour t'attend", "END:VALARM", "END:VEVENT", "END:VCALENDAR"];
  const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" }), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "meridien-rappel.ics"; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  if (store.profile) { store.profile.remindAt = m; save(); }
}

/* ---------- bilan de fin de partie : temps forts, classement général, meilleur rival ---------- */
function endRecap(g, res, me, record) {
  if (g.practice || g.tuto || !res || !me) return "";
  const lead = res.played[0], items = [], prog = progress();
  let bi = 0; g.roundPts.forEach((p, i) => { if (p > g.roundPts[bi]) bi = i; });
  if (g.roundPts[bi] > 0) items.push(["⭐", `Meilleure manche : <b>${esc(g.mlabel[bi] || g.manches[bi].label)}</b>, ${fmtNum(g.roundPts[bi])} pts`]);
  if (res.N >= 2) {
    items.push(["🏆", me.pos === 1 ? "Tu es <b>en tête</b> du jour" : `Tu es <b>n°${me.pos}</b> sur ${res.N}, à ${fmtNum(lead.best - me.best)} pts du premier`]);
    const beaten = me.beaten != null ? me.beaten : res.played.filter(x => x.best < me.best).length;
    if (beaten > 0) items.push(["⚔️", `Tu as devancé <b>${beaten} joueur${beaten > 1 ? "s" : ""}</b>`]);
  }
  if (record) items.push(["📈", "Nouveau record du jour"]);
  if (prog.streak > 1) items.push(["🔥", `Série de <b>${prog.streak} jours</b>`]);
  if (me.gems) items.push(["🧭", `<b>+${me.gems} boussoles</b>${me.bonus ? ` dont +${me.bonus} de bonus de saison` : ""}`]);
  const st = standings(g.k), my = st.list.find(r => r.me);
  let general = "", rival = "";
  if (my && st.list.length > 1) {
    const top = st.list.slice(0, 3), shown = top.some(r => r.me) ? top : [...top, my];
    general = `<div class="kicker">Classement général · saison ${st.S.n}</div><ol class="gen">${shown.map(r => `<li class="${r.me ? "me" : ""}"><span class="num">#${r.rank}</span>${avatar(r, "sm")}<b>${esc(r.name)}${r.me ? toi : ""}</b><span class="num">${fmtNum(r.total)} ${I.compass(14)}</span></li>`).join("")}</ol>`;
    const others = st.list.filter(r => !r.me).sort((a, b) => Math.abs(a.total - my.total) - Math.abs(b.total - my.total) || b.total - a.total), rv = others[0];
    if (rv) {
      const gap = rv.total - my.total, today1 = res.played.find(x => x.id === rv.id);
      rival = `<div class="kicker">Ton meilleur rival</div><div class="rival">${avatar(rv, "lg")}<div><b>${esc(rv.name)}</b><span>${gap > 0 ? `Il te devance de <b>${fmtNum(gap)}</b> boussoles` : gap < 0 ? `Tu le devances de <b>${fmtNum(-gap)}</b> boussoles` : "Vous êtes à égalité"} (n°${rv.rank} au général).</span>${today1 ? `<span>Aujourd'hui : toi <b>${fmtNum(me.best)}</b> · lui <b>${fmtNum(today1.best)}</b>.</span>` : `<span>Il n'a pas encore joué aujourd'hui.</span>`}</div></div>`;
    }
  }
  return `<section class="recap" aria-label="Bilan de la partie"><div class="kicker">Temps forts</div><ul class="hl">${items.map(([ic, t]) => `<li><span aria-hidden="true">${ic}</span><span>${t}</span></li>`).join("")}</ul>${general}${rival}</section>`;
}
