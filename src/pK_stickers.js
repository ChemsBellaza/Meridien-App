/* =================== AUTOCOLLANTS ANIMÉS POUR LE CHAT ===================
   Catalogue intégré : le familier de l'expéditeur joue une émotion, animée en CSS (aucune image externe, aucune clé, marche hors ligne).
   Un autocollant est un message ordinaire dont le texte est « ::s:<id> » ; chaque téléphone le dessine avec le familier de l'auteur.
   Le serveur ne voit qu'un court texte : aucun changement de base. (Une vraie bibliothèque de GIF externe demanderait une clé Giphy/Tenor.) */
const STICKERS = [
  { id: "bravo", label: "Bravo !", ico: "👏", mood: "joy", anim: "bounce" },
  { id: "gg", label: "GG !", ico: "🏆", mood: "joy", anim: "pulse" },
  { id: "rire", label: "Mort de rire", ico: "😂", mood: "joy", anim: "shake" },
  { id: "wow", label: "Wow !", ico: "😮", mood: null, anim: "pop" },
  { id: "top", label: "Top !", ico: "👍", mood: "joy", anim: "wiggle" },
  { id: "fete", label: "On fête ça", ico: "🎉", mood: "joy", anim: "bounce" },
  { id: "feu", label: "En feu", ico: "🔥", mood: null, anim: "pulse" },
  { id: "amour", label: "Merci", ico: "❤️", mood: "joy", anim: "pulse" },
  { id: "salut", label: "Salut", ico: "👋", mood: "joy", anim: "wiggle" },
  { id: "pret", label: "Prêt ?", ico: "🚀", mood: null, anim: "pop" },
  { id: "hmm", label: "Hmm…", ico: "🤔", mood: null, anim: "tilt" },
  { id: "aie", label: "Aïe", ico: "😢", mood: "sad", anim: "droop" },
  { id: "argh", label: "Argh !", ico: "😤", mood: "sad", anim: "shake" },
  { id: "dodo", label: "Dodo", ico: "😴", mood: null, anim: "droop" },
  { id: "bravoi", label: "Bien joué", ico: "🤝", mood: "joy", anim: "tilt" },
  { id: "nuit", label: "Bonne nuit", ico: "🌙", mood: null, anim: "droop" }
];
const stickerOf = text => { const m = /^::s:([a-z0-9]+)$/.exec(text || ""); return m && STICKERS.some(s => s.id === m[1]) ? m[1] : null; };
function stickerHTML(id, pet) {
  const s = STICKERS.find(x => x.id === id); if (!s) return "";
  return `<span class="stk ${s.anim}" role="img" aria-label="${esc(s.label)}"><span class="stkpet">${petSVG(pet, { plain: true, mood: s.mood })}</span><i class="stkico" aria-hidden="true">${s.ico}</i><b class="stklab">${esc(s.label)}</b></span>`;
}
// contenu d'une bulle de message : autocollant ou texte
const msgBody = e => { const id = stickerOf(e.text); return id ? stickerHTML(id, (e.p && e.p.pet) || store.profile.pet) : esc(e.text); };
const stickerPanel = () => `<div class="stkpanel" role="group" aria-label="Choisir un autocollant">${STICKERS.map(s => `<button type="button" class="stkbtn" data-act="stksend" data-v="${s.id}" aria-label="Envoyer : ${esc(s.label)}">${stickerHTML(s.id, store.profile.pet)}</button>`).join("")}</div>`;
function sendSticker(id) {
  ui.stickers = false;
  if (srvOn()) { srvSendMessage("::s:" + id, null); render(); return; }
  const k = today(); (store.chat[k] = store.chat[k] || []).push({ from: "me", text: "::s:" + id, at: minutesNow() }); save(); render(); window.scrollTo(0, document.body.scrollHeight);
}
