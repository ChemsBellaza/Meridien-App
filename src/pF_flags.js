/* =================== Drapeaux : emojis → images SVG ===================
   Les emojis de drapeau (🇫🇷) ne s'affichent pas sous Windows (deux lettres à la place). Le texte des données reste en emoji
   (c'est aussi ce qu'on partage dans les messageries) ; à l'écran, chaque paire est remplacée par une image embarquée
   dans public/flags/ (Twemoji, CC BY 4.0, voir CREDITS.md). Un observateur traite tout nouveau texte ajouté à la page,
   avant l'affichage : aucun appel à faire dans les moteurs de jeux. */
const FLAG_ANY = /[\u{1F1E6}-\u{1F1FF}]/u, FLAG_PAIR = /[\u{1F1E6}-\u{1F1FF}]{2}/gu;
const flagFile = pair => `flags/${pair.codePointAt(0).toString(16)}-${pair.codePointAt(2).toString(16)}.svg`;

function flagifyText(node) {
  const txt = node.nodeValue;
  if (!FLAG_ANY.test(txt)) return;
  const frag = document.createDocumentFragment();
  let last = 0;
  for (const m of txt.matchAll(FLAG_PAIR)) {
    if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
    const img = document.createElement("img");
    img.className = "flagimg"; img.src = flagFile(m[0]); img.alt = ""; img.draggable = false;
    img.onerror = () => img.replaceWith(document.createTextNode(m[0])); // image absente : on remet l'emoji
    frag.appendChild(img);
    last = m.index + m[0].length;
  }
  if (last === 0) return;
  if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
  node.replaceWith(frag);
}

function flagify(root) {
  if (root.nodeType === 3) { if (!root.parentElement || !root.parentElement.closest("svg,script,style,textarea")) flagifyText(root); return; }
  if (root.nodeType !== 1 || root.closest("svg,script,style,textarea")) return;
  const found = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) if (FLAG_ANY.test(n.nodeValue) && !n.parentElement.closest("svg,script,style,textarea")) found.push(n);
  found.forEach(flagifyText);
}

new MutationObserver(recs => {
  for (const r of recs) {
    if (r.type === "characterData") flagify(r.target);
    else r.addedNodes.forEach(flagify);
  }
}).observe(document.body, { childList: true, subtree: true, characterData: true });
flagify(document.body);
