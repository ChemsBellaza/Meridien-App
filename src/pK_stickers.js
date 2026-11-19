/* =================== AUTOCOLLANTS ANIMÉS ET GIF POUR LE CHAT ===================
   1) Autocollants : catalogue intégré (v38 : une soixantaine, rangés par thèmes). Le familier de l'expéditeur joue une émotion,
      animée en CSS (aucune image externe, aucune clé, marche hors ligne). Un autocollant est un message ordinaire dont le texte
      est « ::s:<id> » ; chaque téléphone le dessine avec le familier de l'auteur.
   2) GIF (Giphy) : onglet « GIF » avec recherche, actif seulement si GIPHY_KEY est renseignée (clé publique par conception, comme
      celle de Supabase, à créer sur developers.giphy.com). Un GIF est un message « ::g:<identifiant Giphy> » ; les images viennent de
      media.giphy.com. Seuls les profils en ligne l'utilisent. Seuls les GIF classés « pg » sont proposés. */
const GIPHY_KEY = "H9BpKyAedVHMXt3CqpZS60KsdpXFKvus"; // clé Giphy du propriétaire (publique par conception) ; vide = pas d'onglet GIF
const STK_CATS = [["joie", "Joie", "🎉"], ["rire", "Rire", "😂"], ["surprise", "Idées", "😮"], ["humeur", "Humeur", "😢"], ["amour", "Amour", "❤️"], ["salut", "Salut", "👋"], ["jeu", "Jeu", "🧭"], ["vie", "Vie", "☕"]];
const STICKERS = [
  // joie
  { id: "bravo", cat: "joie", label: "Bravo !", ico: "👏", mood: "joy", anim: "bounce" },
  { id: "gg", cat: "joie", label: "GG !", ico: "🏆", mood: "joy", anim: "pulse" },
  { id: "fete", cat: "joie", label: "On fête ça", ico: "🎉", mood: "joy", anim: "bounce" },
  { id: "top", cat: "joie", label: "Top !", ico: "👍", mood: "joy", anim: "wiggle" },
  { id: "yes", cat: "joie", label: "Yes !", ico: "✅", mood: "joy", anim: "pop" },
  { id: "danse", cat: "joie", label: "On danse", ico: "💃", mood: "joy", anim: "wiggle" },
  { id: "content", cat: "joie", label: "Content", ico: "😄", mood: "joy", anim: "pulse" },
  { id: "cool", cat: "joie", label: "Trop cool", ico: "😎", mood: "joy", anim: "tilt" },
  { id: "etoile", cat: "joie", label: "Étoile", ico: "⭐", mood: "joy", anim: "pulse" },
  { id: "champion", cat: "joie", label: "Champion", ico: "🥇", mood: "joy", anim: "bounce" },
  { id: "bravoi", cat: "joie", label: "Bien joué", ico: "🤝", mood: "joy", anim: "tilt" },
  { id: "feu", cat: "joie", label: "En feu", ico: "🔥", mood: null, anim: "pulse" },
  // rire
  { id: "rire", cat: "rire", label: "Mort de rire", ico: "😂", mood: "joy", anim: "shake" },
  { id: "haha", cat: "rire", label: "Haha", ico: "😆", mood: "joy", anim: "bounce" },
  { id: "larmes", cat: "rire", label: "Aux larmes", ico: "🤣", mood: "joy", anim: "shake" },
  { id: "clown", cat: "rire", label: "Je fais le clown", ico: "🤡", mood: "joy", anim: "wiggle" },
  { id: "malin", cat: "rire", label: "Petit malin", ico: "😏", mood: null, anim: "tilt" },
  { id: "oupsrire", cat: "rire", label: "Oups", ico: "🙈", mood: "joy", anim: "pop" },
  { id: "blague", cat: "rire", label: "C'était une blague", ico: "😜", mood: "joy", anim: "wiggle" },
  // idées et surprises
  { id: "wow", cat: "surprise", label: "Wow !", ico: "😮", mood: null, anim: "pop" },
  { id: "choc", cat: "surprise", label: "Choc", ico: "😱", mood: "sad", anim: "shake" },
  { id: "tete", cat: "surprise", label: "Incroyable", ico: "🤯", mood: null, anim: "pop" },
  { id: "hmm", cat: "surprise", label: "Hmm…", ico: "🤔", mood: null, anim: "tilt" },
  { id: "idee", cat: "surprise", label: "Idée !", ico: "💡", mood: "joy", anim: "pulse" },
  { id: "cerveau", cat: "surprise", label: "Je réfléchis", ico: "🧠", mood: null, anim: "tilt" },
  { id: "loupe", cat: "surprise", label: "J'enquête", ico: "🔎", mood: null, anim: "wiggle" },
  { id: "pasur", cat: "surprise", label: "Pas sûr…", ico: "🤨", mood: null, anim: "tilt" },
  { id: "sanvoix", cat: "surprise", label: "Sans voix", ico: "😶", mood: null, anim: "droop" },
  // humeur (tristesse, colère)
  { id: "aie", cat: "humeur", label: "Aïe", ico: "😢", mood: "sad", anim: "droop" },
  { id: "snif", cat: "humeur", label: "Snif", ico: "🥲", mood: "sad", anim: "droop" },
  { id: "pleure", cat: "humeur", label: "Je pleure", ico: "😭", mood: "sad", anim: "shake" },
  { id: "rate", cat: "humeur", label: "Raté", ico: "💔", mood: "sad", anim: "droop" },
  { id: "pluie", cat: "humeur", label: "Journée grise", ico: "🌧️", mood: "sad", anim: "droop" },
  { id: "argh", cat: "humeur", label: "Argh !", ico: "😤", mood: "sad", anim: "shake" },
  { id: "grr", cat: "humeur", label: "Grr", ico: "😠", mood: "sad", anim: "shake" },
  { id: "diable", cat: "humeur", label: "Vengeance", ico: "😈", mood: null, anim: "wiggle" },
  { id: "fatigue", cat: "humeur", label: "Fatigué", ico: "🥱", mood: "sad", anim: "droop" },
  // amour et merci
  { id: "amour", cat: "amour", label: "Merci", ico: "❤️", mood: "joy", anim: "pulse" },
  { id: "bisou", cat: "amour", label: "Bisou", ico: "😘", mood: "joy", anim: "pop" },
  { id: "calin", cat: "amour", label: "Câlin", ico: "🤗", mood: "joy", anim: "bounce" },
  { id: "coeur", cat: "amour", label: "Je t'adore", ico: "💖", mood: "joy", anim: "pulse" },
  { id: "merci2", cat: "amour", label: "Merci beaucoup", ico: "🙏", mood: "joy", anim: "tilt" },
  { id: "courage", cat: "amour", label: "Courage !", ico: "💪", mood: "joy", anim: "pulse" },
  { id: "desole", cat: "amour", label: "Désolé", ico: "🥺", mood: "sad", anim: "droop" },
  // salutations
  { id: "salut", cat: "salut", label: "Salut", ico: "👋", mood: "joy", anim: "wiggle" },
  { id: "coucou", cat: "salut", label: "Coucou", ico: "🙋", mood: "joy", anim: "bounce" },
  { id: "bonjour", cat: "salut", label: "Bonjour", ico: "☀️", mood: "joy", anim: "pulse" },
  { id: "bye", cat: "salut", label: "À demain", ico: "🫡", mood: "joy", anim: "tilt" },
  { id: "nuit", cat: "salut", label: "Bonne nuit", ico: "🌙", mood: null, anim: "droop" },
  { id: "dodo", cat: "salut", label: "Dodo", ico: "😴", mood: null, anim: "droop" },
  { id: "bienvenue", cat: "salut", label: "Bienvenue !", ico: "🎈", mood: "joy", anim: "bounce" },
  // jeu
  { id: "pret", cat: "jeu", label: "Prêt ?", ico: "🚀", mood: null, anim: "pop" },
  { id: "facile", cat: "jeu", label: "Trop facile", ico: "😌", mood: "joy", anim: "tilt" },
  { id: "dur", cat: "jeu", label: "Trop dur", ico: "🥵", mood: "sad", anim: "shake" },
  { id: "savais", cat: "jeu", label: "Je le savais", ico: "😉", mood: "joy", anim: "wiggle" },
  { id: "piege", cat: "jeu", label: "Question piège", ico: "🪤", mood: null, anim: "pop" },
  { id: "boussole", cat: "jeu", label: "Boussoles !", ico: "🧭", mood: "joy", anim: "pulse" },
  { id: "podium", cat: "jeu", label: "Sur le podium", ico: "🏅", mood: "joy", anim: "bounce" },
  { id: "temps", cat: "jeu", label: "Plus de temps", ico: "⏱️", mood: "sad", anim: "shake" },
  { id: "triche", cat: "jeu", label: "Tu as triché ?", ico: "🕵️", mood: null, anim: "tilt" },
  { id: "revanche", cat: "jeu", label: "Revanche !", ico: "⚔️", mood: null, anim: "wiggle" },
  { id: "monde", cat: "jeu", label: "Le monde entier", ico: "🌍", mood: "joy", anim: "pulse" },
  { id: "serie", cat: "jeu", label: "Ma série continue", ico: "📅", mood: "joy", anim: "pop" },
  // vie de tous les jours
  { id: "cafe", cat: "vie", label: "Un café ?", ico: "☕", mood: null, anim: "tilt" },
  { id: "miam", cat: "vie", label: "Miam", ico: "😋", mood: "joy", anim: "wiggle" },
  { id: "pizza", cat: "vie", label: "Pizza ?", ico: "🍕", mood: "joy", anim: "bounce" },
  { id: "sport", cat: "vie", label: "Sport", ico: "🏃", mood: "joy", anim: "bounce" },
  { id: "soleil", cat: "vie", label: "Grand soleil", ico: "🌞", mood: "joy", anim: "pulse" },
  { id: "musique", cat: "vie", label: "Musique", ico: "🎵", mood: "joy", anim: "wiggle" },
  { id: "film", cat: "vie", label: "Soirée ciné", ico: "🍿", mood: "joy", anim: "pop" },
  { id: "bureau", cat: "vie", label: "Au boulot", ico: "💻", mood: null, anim: "tilt" }
];
const stickerOf = text => { const m = /^::s:([a-z0-9]+)$/.exec(text || ""); return m && STICKERS.some(s => s.id === m[1]) ? m[1] : null; };
const gifOf = text => { const m = /^::g:([A-Za-z0-9]{5,32})$/.exec(text || ""); return m ? m[1] : null; };
const gifUrl = id => `https://media.giphy.com/media/${id}/200w.gif`;
const msgKind = text => (stickerOf(text) ? "sticker" : gifOf(text) ? "gifmsg" : "");
function stickerHTML(id, pet) {
  const s = STICKERS.find(x => x.id === id); if (!s) return "";
  return `<span class="stk ${s.anim}" role="img" aria-label="${esc(s.label)}"><span class="stkpet">${petSVG(pet, { plain: true, mood: s.mood })}</span><i class="stkico" aria-hidden="true">${s.ico}</i><b class="stklab">${esc(s.label)}</b></span>`;
}
// contenu d'une bulle de message : autocollant, GIF ou texte
const msgBody = e => { const id = stickerOf(e.text), g = gifOf(e.text); return id ? stickerHTML(id, (e.p && e.p.pet) || store.profile.pet) : g ? `<img class="gifimg" src="${gifUrl(g)}" alt="GIF" loading="lazy" referrerpolicy="no-referrer">` : esc(e.text); };

/* ---------- panneau : onglets de thèmes + GIF ---------- */
const GIF = { q: "", res: [], busy: false, err: "", cache: {}, t: 0 };
const gifOn = () => !!GIPHY_KEY && srvOn();
function stickerPanel() {
  const cats = STK_CATS.map(([id, lab, ico]) => ({ id, lab, ico })); if (gifOn()) cats.push({ id: "gif", lab: "GIF", ico: "🎞️" });
  const cur = cats.some(c => c.id === ui.stkCat) ? ui.stkCat : cats[0].id;
  const tabs = `<div class="stktabs" role="tablist" aria-label="Thèmes">${cats.map(c => `<button type="button" role="tab" class="stktab ${c.id === cur ? "on" : ""}" aria-selected="${c.id === cur}" data-act="stkcat" data-v="${c.id}"><span aria-hidden="true">${c.ico}</span><b>${esc(c.lab)}</b></button>`).join("")}</div>`;
  let body;
  if (cur === "gif") {
    body = `<div class="gifbox"><input id="gifq" type="search" class="gifq" maxlength="40" placeholder="Chercher un GIF (ex. : bravo, rire…)" aria-label="Chercher un GIF" value="${esc(GIF.q)}" autocomplete="off"><div class="gifgrid" id="gifgrid">${gifGridHTML()}</div><small class="giphycred">Propulsé par GIPHY · les recherches passent par Giphy</small></div>`;
    if (!GIF.res.length && !GIF.busy && !GIF.err) setTimeout(() => gifFetch(GIF.q), 0);
  } else body = `<div class="stkgrid">${STICKERS.filter(s => s.cat === cur).map(s => `<button type="button" class="stkbtn" data-act="stksend" data-v="${s.id}" aria-label="Envoyer : ${esc(s.label)}">${stickerHTML(s.id, store.profile.pet)}</button>`).join("")}</div>`;
  return `<div class="stkpanel" role="group" aria-label="Autocollants et GIF">${tabs}${body}</div>`;
}
function gifGridHTML() {
  if (GIF.busy && !GIF.res.length) return `<p class="note">Recherche…</p>`;
  if (GIF.err) return `<p class="note" role="status">${esc(GIF.err)}</p>`;
  if (!GIF.res.length) return `<p class="note">Aucun GIF trouvé.</p>`;
  return GIF.res.map(g => `<button type="button" class="gifbtn" data-act="gifsend" data-v="${g.id}" aria-label="Envoyer ce GIF : ${esc(g.title || "GIF")}"><img src="${esc(g.t)}" alt="" loading="lazy" referrerpolicy="no-referrer"></button>`).join("");
}
function gifPaint() { const el = document.getElementById("gifgrid"); if (el) el.innerHTML = gifGridHTML(); }
async function gifFetch(q) {
  if (!gifOn()) return;
  const key = String(q || "").trim().toLowerCase();
  if (GIF.cache[key]) { GIF.res = GIF.cache[key]; GIF.err = ""; return gifPaint(); }
  GIF.busy = true; GIF.err = ""; gifPaint();
  try {
    const url = key ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(key)}&limit=24&rating=pg&lang=fr` : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=24&rating=pg`;
    const c = new AbortController(), t = setTimeout(() => c.abort(), 10000), r = await fetch(url, { signal: c.signal }); clearTimeout(t);
    const j = await r.json();
    GIF.res = (j.data || []).map(x => ({ id: x.id, t: x.images && (x.images.fixed_width_small || x.images.fixed_width || {}).url || "", title: x.title || "" })).filter(g => g.t && /^[A-Za-z0-9]{5,32}$/.test(g.id));
    GIF.cache[key] = GIF.res;
  } catch (e) { GIF.err = "Impossible de charger les GIF pour le moment."; GIF.res = []; }
  GIF.busy = false; gifPaint();
}
document.addEventListener("input", e => { // recherche de GIF : on attend une pause dans la frappe
  if (!e.target || e.target.id !== "gifq") return;
  GIF.q = e.target.value; clearTimeout(GIF.t); GIF.t = setTimeout(() => gifFetch(GIF.q), 450);
});
function sendSticker(id) {
  ui.stickers = false;
  if (srvOn()) { srvSendMessage("::s:" + id, null); render(); return; }
  const k = today(); (store.chat[k] = store.chat[k] || []).push({ from: "me", text: "::s:" + id, at: minutesNow() }); save(); render(); window.scrollTo(0, document.body.scrollHeight);
}
function sendGif(id) {
  if (!gifOn() || !/^[A-Za-z0-9]{5,32}$/.test(id || "")) return;
  ui.stickers = false; srvSendMessage("::g:" + id, null); render();
}
