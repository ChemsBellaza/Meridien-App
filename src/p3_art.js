/* ---------- illustrations des jeux (une image par format) ---------- */
function rays(cx, cy, col, rot = 0, n = 18) {
  let d = "";
  for (let i = 0; i < n; i += 2) {
    const a0 = (i / n) * 2 * Math.PI + rot, a1 = ((i + 1) / n) * 2 * Math.PI + rot;
    d += `M${cx} ${cy}L${f1(cx + 700 * Math.cos(a0))} ${f1(cy + 700 * Math.sin(a0))}L${f1(cx + 700 * Math.cos(a1))} ${f1(cy + 700 * Math.sin(a1))}Z`;
  }
  return `<path d="${d}" fill="${col}"/>`;
}
const spark = (x, y, s, c) => `<path d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z" fill="${c}"/>`;
function art(fmt, seed = "x") {
  const r = rng(seed + fmt), rot = r() * .35;
  const open = `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">`;
  if (fmt === "carte") {
    const px = 292 + r() * 24, py = 104 + r() * 10;
    return open + `<rect width="400" height="240" fill="#1E8C72"/>${rays(285, 125, "#24997E", rot)}
      <path d="M196 68L256 83L316 68L376 83V203L316 188L256 203L196 188Z" fill="#146B57" transform="translate(7 9)"/>
      <path d="M196 68L256 83V203L196 188Z" fill="#F7EDD6"/><path d="M256 83L316 68V188L256 203Z" fill="#E9DBBB"/><path d="M316 68L376 83V203L316 188Z" fill="#F7EDD6"/>
      <path d="M206 96Q222 84 238 94Q250 102 244 118Q236 132 220 126Q204 120 206 96Z" fill="#8CC56C"/>
      <path d="M266 120Q284 108 300 118Q312 128 304 148Q292 164 276 156Q262 146 266 120Z" fill="#7DB85E"/>
      <path d="M328 92Q346 86 360 96Q368 110 356 124Q340 132 330 120Q322 106 328 92Z" fill="#8CC56C"/>
      <path d="M214 172C236 140 262 168 282 140S330 112 ${f1(px)} ${f1(py + 4)}" fill="none" stroke="#E8483B" stroke-width="3.4" stroke-dasharray="7 6" stroke-linecap="round"/>
      <ellipse cx="${f1(px)}" cy="${f1(py + 6)}" rx="13" ry="4.5" fill="#000" opacity=".2"/>
      <g transform="translate(${f1(px)} ${f1(py + 4)}) scale(2.3)"><path d="M0 0c-8-10-14-17-14-24a14 14 0 0 1 28 0c0 7-6 14-14 24z" fill="#E8483B"/><circle cy="-24" r="5.5" fill="#fff"/><path d="M-9 -30a10 10 0 0 1 6-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/></g>
      ${spark(172, 48, 9, "#FFD45C")}${spark(386, 40, 7, "#FFD45C")}${spark(372, 216, 8, "#FFD45C")}${spark(150, 120, 5, "#BFF0DF")}</svg>`;
  }
  if (fmt === "frise") {
    const y1 = ["1492", "1789", "1914", "1969", "1453", "1648"][Math.floor(r() * 6)], y2 = ["800", "1515", "1871", "1989", "1945"][Math.floor(r() * 5)];
    const ticket = (x, y, a, t) => `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-38" y="-17" width="76" height="34" rx="9" fill="#143C80" transform="translate(4 5)"/><rect x="-38" y="-17" width="76" height="34" rx="9" fill="#F7EDD6"/><text y="8" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="20" fill="#2F5AA8">${t}</text></g>`;
    return open + `<rect width="400" height="240" fill="#2F5AA8"/>${rays(292, 120, "#3564B5", rot)}
      <g transform="translate(6 9)" fill="#1F4689"><rect x="246" y="36" width="92" height="14" rx="7"/><rect x="246" y="184" width="92" height="14" rx="7"/><rect x="254" y="44" width="8" height="146"/><rect x="322" y="44" width="8" height="146"/></g>
      <path d="M262 50Q262 94 292 116Q322 94 322 50Z" fill="#DCEEFB"/><path d="M262 186Q262 142 292 120Q322 142 322 186Z" fill="#DCEEFB"/>
      <path d="M271 70Q276 96 292 110Q308 96 313 70Z" fill="#F4C44F"/><path d="M292 110V176" stroke="#F4C44F" stroke-width="3"/><path d="M268 186Q292 146 316 186Z" fill="#F4C44F"/>
      <path d="M270 58Q270 80 280 92" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/>
      <rect x="246" y="36" width="92" height="14" rx="7" fill="#C98A4B"/><rect x="246" y="184" width="92" height="14" rx="7" fill="#C98A4B"/><rect x="254" y="44" width="8" height="146" fill="#A86E37"/><rect x="322" y="44" width="8" height="146" fill="#A86E37"/>
      ${ticket(184, 70, -8, y1)}${ticket(366, 168, 9, y2)}
      ${spark(214, 150, 8, "#FFD45C")}${spark(384, 50, 9, "#FFD45C")}${spark(150, 40, 6, "#CFE2FF")}</svg>`;
  }
  if (fmt !== "quiz" && ART2[fmt]) return open + ART2[fmt](r, rot) + "</svg>";
  return open + `<rect width="400" height="240" fill="#6A4FD6"/>${rays(290, 118, "#7258DD", rot)}
    <g transform="translate(6 8)" fill="#4B36A8"><rect x="214" y="40" width="132" height="104" rx="28"/><path d="M238 136L232 168L270 140Z"/></g>
    <rect x="214" y="40" width="132" height="104" rx="28" fill="#fff"/><path d="M238 136L232 168L270 140Z" fill="#fff"/>
    <text x="280" y="122" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="78" fill="#6A4FD6">?</text>
    <path d="M352 76L314 148H340L318 214L378 124H350L372 76Z" fill="#4B36A8" transform="translate(6 7)"/>
    <path d="M352 76L314 148H340L318 214L378 124H350L372 76Z" fill="#FFD23F"/><path d="M356 82L326 140" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    ${spark(190, 54, 9, "#FFD23F")}${spark(392, 40, 7, "#FFD23F")}${spark(196, 180, 6, "#D9CFFF")}${spark(250, 200, 8, "#FFD23F")}</svg>`;
}

/* ---------- icônes ---------- */
const sv = (inner, s = 24, extra = "") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" ${extra} aria-hidden="true">${inner}</svg>`;
const I = {
  menu: sv(`<path d="M4 7h16M4 12h16M4 17h16"/>`, 26),
  history: sv(`<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/><path d="M12 7.5V12l3 2"/>`, 28),
  back: sv(`<path d="M15 5l-7 7 7 7"/>`, 24, `stroke-width="2.8"`),
  down: sv(`<path d="M6 9l6 6 6-6"/>`, 20, `stroke-width="2.8"`),
  close: sv(`<path d="M6 6l12 12M18 6L6 18"/>`, 22, `stroke-width="2.8"`),
  chev: sv(`<path d="M9 5l7 7-7 7"/>`, 20),
  lock: `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10.5" rx="3" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>`,
  camera: sv(`<path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13.3" r="3.4"/>`, 20),
  compass: (s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#F5B82E"/><circle cx="12" cy="12" r="10.5" fill="none" stroke="#D99A14" stroke-width="1.6"/><path d="M12 4.5l2.4 7.5L12 19.5 9.6 12z" fill="#2A2333"/><path d="M12 4.5l2.4 7.5H9.6z" fill="#E5472A"/></svg>`,
  trophy: (s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v4.5a6 6 0 0 1-12 0z" fill="#FFC24A"/><path d="M6 6H3.5a3.5 3.5 0 0 0 3.6 4.4M18 6h2.5a3.5 3.5 0 0 1-3.6 4.4" fill="none" stroke="#E9A21E" stroke-width="1.9" stroke-linecap="round"/><path d="M10.4 14h3.2l.6 3.4H9.8z" fill="#E9A21E"/><rect x="7.5" y="17.2" width="9" height="3.6" rx="1.2" fill="#C98415"/><path d="M9 6.2v2.6a3 3 0 0 0 1.6 2.6" fill="none" stroke="#FFE7A6" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  fire: (s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c-4.4 0-7.5-3-7.5-7 0-3.6 2.6-6 3.9-8.6.3 1.9 1.2 3 2.3 3.6C10.6 6.5 12.4 3.6 15 2c-.4 3 1 5 2.6 7 1.2 1.6 1.9 3.6 1.9 6 0 4-3.1 7-7.5 7z" fill="#FF6A2B"/><path d="M12 22c-2.5 0-4.2-1.7-4.2-4 0-2.2 1.6-3.6 2.6-5.3.4 1.2 1.1 1.9 1.9 2.2.1-1.9.9-3.5 2.2-4.6-.1 1.9.7 3.2 1.6 4.4.6.9 1 1.9 1 3.3 0 2.3-2 4-5.1 4z" fill="#FFC23D"/><path d="M12 22c-1.2 0-2-.8-2-1.9 0-1.1.8-1.8 1.4-2.7.6 1 1.4 1.3 1.9 2 .4.5.7.9.7 1.3 0 .8-.9 1.3-2 1.3z" fill="#FFF0B8"/></svg>`,
  retry: (s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.1-5" fill="none" stroke="#FFC23D" stroke-width="3" stroke-linecap="round"/><path d="M19.5 3.5v5h-5" fill="none" stroke="#FFC23D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  theme: (t, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${
    t === "hist" ? `<path d="M2.5 9.5L12 3.8l9.5 5.7z"/><rect x="4.8" y="11" width="2.8" height="7" rx=".8"/><rect x="10.6" y="11" width="2.8" height="7" rx=".8"/><rect x="16.4" y="11" width="2.8" height="7" rx=".8"/><rect x="3" y="19" width="18" height="2.6" rx="1.2"/>`
    : t === "geopo" ? `<rect x="3.6" y="2.5" width="2.4" height="19" rx="1.2"/><path d="M6 4.2c3-1.2 5.4 1.3 8.2.8 2.2-.4 3.8-1.6 5.8-1.2v9.4c-2-.4-3.6.8-5.8 1.2-2.8.5-5.2-2-8.2-.8z"/>`
    : `<path d="M1.5 20.5L9 7.5l4 6.6 2.4-3.6 7.1 10z"/><path d="M9 7.5l2.4 4.1-1.3-.8L9 12l-1.2-1.3-1.1.7z" fill="#fff" opacity=".85"/><circle cx="18.5" cy="5.5" r="2.4"/>`}</svg>`,
  laurel: (flip = false) => `<svg width="34" height="56" viewBox="0 0 34 56" aria-hidden="true" style="${flip ? "transform:scaleX(-1)" : ""}"><path d="M26 52C12 46 6 32 10 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>${[[11, 10, -30], [8, 19, -10], [8, 29, 10], [11, 38, 30], [17, 46, 55]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="6.8" transform="rotate(${a} ${x} ${y})" fill="currentColor"/><ellipse cx="${x + 7}" cy="${y + 2}" rx="3.2" ry="6" transform="rotate(${a + 60} ${x + 7} ${y + 2})" fill="currentColor"/>`).join("")}</svg>`
};


/* ---------- illustrations des nouveaux jeux ---------- */
const bgr = (c, ray, rot, cx = 290, cy = 120) => `<rect width="400" height="240" fill="${c}"/>${rays(cx, cy, ray, rot)}`;
const ART2 = {
  sprint: (r, rot) => bgr("#E0663A", "#E8764B", rot) + `
    <g fill="#fff" opacity=".85"><rect x="150" y="96" width="62" height="9" rx="4.5"/><rect x="166" y="120" width="46" height="9" rx="4.5"/><rect x="156" y="144" width="56" height="9" rx="4.5"/></g>
    <circle cx="297" cy="134" r="64" fill="#A8461F"/><rect x="276" y="44" width="28" height="18" rx="6" fill="#2A2333"/><rect x="284" y="58" width="12" height="14" fill="#2A2333"/>
    <circle cx="290" cy="126" r="64" fill="#FFF6E8" stroke="#2A2333" stroke-width="7"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${f1(290 + 50 * Math.cos(a))}" y1="${f1(126 + 50 * Math.sin(a))}" x2="${f1(290 + 57 * Math.cos(a))}" y2="${f1(126 + 57 * Math.sin(a))}" stroke="#2A2333" stroke-width="${i % 3 ? 3 : 5}" stroke-linecap="round"/>`; }).join("")}
    <path d="M290 126L290 82" stroke="#E8483B" stroke-width="7" stroke-linecap="round"/><path d="M290 126L322 140" stroke="#2A2333" stroke-width="6" stroke-linecap="round"/><circle cx="290" cy="126" r="8" fill="#2A2333"/>
    <path d="M247 92A56 56 0 0 1 290 70" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    ${spark(384, 44, 9, "#FFD45C")}${spark(206, 50, 7, "#FFD45C")}${spark(376, 212, 7, "#FFE9D6")}`,
  capitales: (r, rot) => bgr("#C2417A", "#CC528A", rot) + `
    <g transform="translate(7 8)" fill="#8E2C59"><rect x="214" y="92" width="152" height="112" rx="6"/><path d="M290 22c-40 0-62 32-62 70h124c0-38-22-70-62-70z"/></g>
    <rect x="214" y="190" width="152" height="16" rx="5" fill="#F7EDD6"/><rect x="222" y="104" width="136" height="86" fill="#FFF6EC"/>
    ${[234, 258, 282, 306, 330].map(x => `<rect x="${x}" y="114" width="12" height="70" rx="4" fill="#E9DBBB"/>`).join("")}
    <path d="M210 104L290 78L370 104Z" fill="#F7EDD6"/><rect x="250" y="70" width="80" height="10" rx="4" fill="#F7EDD6"/>
    <path d="M290 22c-36 0-56 26-56 50h112c0-24-20-50-56-50z" fill="#FFD45C"/><path d="M262 64c0-14 10-28 28-30" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    <rect x="288" y="0" width="4" height="26" fill="#2A2333"/><path d="M292 2h26l-7 7 7 7h-26z" fill="#E8483B"/>
    ${spark(386, 56, 9, "#FFD45C")}${spark(186, 66, 7, "#FFD45C")}${spark(196, 182, 6, "#F8D2E3")}`,
  petitbac: (r, rot) => bgr("#D99A12", "#E2A82A", rot) + `
    <g transform="rotate(-7 290 124)"><rect x="216" y="38" width="154" height="176" rx="12" fill="#9C6D08" transform="translate(7 8)"/><rect x="216" y="38" width="154" height="176" rx="12" fill="#FFFDF5"/>
    ${[88, 116, 144, 172].map(y => `<line x1="232" x2="354" y1="${y}" y2="${y}" stroke="#E6D9B8" stroke-width="3"/>`).join("")}<line x1="252" x2="252" y1="48" y2="206" stroke="#F2A8A0" stroke-width="3"/>
    <circle cx="300" cy="74" r="25" fill="none" stroke="#E8483B" stroke-width="5"/><text x="300" y="88" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="38" fill="#2A2333">A</text>
    <rect x="262" y="104" width="70" height="8" rx="4" fill="#4A72E0"/><rect x="262" y="132" width="52" height="8" rx="4" fill="#4A72E0"/><rect x="262" y="160" width="80" height="8" rx="4" fill="#4A72E0"/></g>
    <g transform="rotate(38 352 168)"><rect x="300" y="160" width="110" height="18" rx="4" fill="#FFD45C"/><rect x="300" y="160" width="20" height="18" fill="#F2A8A0"/><path d="M410 160l22 9-22 9z" fill="#F7EDD6"/><path d="M424 166l8 3-8 3z" fill="#2A2333"/></g>
    ${spark(186, 54, 8, "#FFF4C9")}${spark(388, 40, 8, "#FFF4C9")}`,
  plusmoins: (r, rot) => bgr("#2E8FC6", "#3C9BD0", rot) + `
    <circle cx="263" cy="94" r="54" fill="#1C6A97" /><circle cx="256" cy="86" r="54" fill="#22B573"/><path d="M256 50l32 36h-20v34h-24V86h-20z" fill="#fff"/>
    <circle cx="335" cy="168" r="48" fill="#1C6A97"/><circle cx="328" cy="160" r="48" fill="#F25C54"/><path d="M328 192l-28-32h17v-30h22v30h17z" fill="#fff"/>
    ${spark(190, 172, 9, "#FFD45C")}${spark(386, 60, 9, "#FFD45C")}${spark(176, 60, 6, "#D6EEFB")}`,
  drapeaux: (r, rot) => bgr("#D9483B", "#E05A4D", rot) + `
    <rect x="232" y="40" width="7" height="176" rx="3" fill="#2A2333"/><circle cx="235" cy="38" r="7" fill="#FFD45C"/>
    <path d="M239 50c26-10 50 10 80 0s46-8 56 0v74c-10-8-30-10-56 0s-54-10-80 0z" fill="#9E2C22" transform="translate(6 7)"/>
    <path d="M239 50c26-10 50 10 80 0s46-8 56 0v74c-10-8-30-10-56 0s-54-10-80 0z" fill="#fff"/>
    <path d="M239 50c14-5 28-4 42 0v74c-14-4-28-5-42 0z" fill="#2F5AA8"/><path d="M330 49c16-4 32-5 45 1v74c-13-6-29-5-45-1z" fill="#FFD23F"/>
    <rect x="170" y="110" width="6" height="110" rx="3" fill="#2A2333"/>
    <path d="M176 118c18-8 34 6 54 0v44c-20 6-36-8-54 0z" fill="#22B573"/><path d="M176 133c18-8 34 6 54 0v14c-20 6-36-8-54 0z" fill="#fff"/>
    ${spark(386, 166, 9, "#FFD45C")}${spark(200, 52, 7, "#FFD45C")}`,
  intrus: (r, rot) => bgr("#7A5BD0", "#8568D6", rot) + [[230, 70, "#FFD45C", 1], [320, 78, "#FFD45C", 1], [236, 160, "#FFD45C", 1], [330, 166, "#FF7AA8", -1]].map(([x, y, c, dir]) => `<g transform="translate(${x} ${y}) scale(${dir} 1)"><path d="M-36 0c10-22 46-24 60 0-14 24-50 22-60 0z" fill="#4E3A9A" transform="translate(5 6)"/><path d="M-36 0c10-22 46-24 60 0-14 24-50 22-60 0z" fill="${c}"/><path d="M24 0l20-16v32z" fill="${c}"/><circle cx="-20" cy="-4" r="5" fill="#2A2333"/><circle cx="-21" cy="-5" r="1.8" fill="#fff"/></g>`).join("") +
    `<circle cx="330" cy="166" r="52" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="9 7"/>${spark(186, 112, 8, "#FFD45C")}${spark(388, 36, 8, "#FFD45C")}`,
  quisuisje: (r, rot) => bgr("#3D7DD8", "#4B89DD", rot) + `
    <path d="M232 214c0-40 12-58 18-80-14-8-20-26-14-48 8-30 36-48 66-44 36 4 58 34 52 70-3 18-12 30-22 38 4 20 10 38 10 64z" fill="#2A5CA8" transform="translate(7 7)"/>
    <path d="M232 214c0-40 12-58 18-80-14-8-20-26-14-48 8-30 36-48 66-44 36 4 58 34 52 70-3 18-12 30-22 38 4 20 10 38 10 64z" fill="#FFF6E8"/>
    <text x="300" y="138" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="74" fill="#3D7DD8">?</text>
    <circle cx="198" cy="160" r="28" fill="none" stroke="#2A2333" stroke-width="9"/><circle cx="198" cy="160" r="22" fill="#CFE2FF" opacity=".7"/><path d="M178 180l-22 24" stroke="#2A2333" stroke-width="11" stroke-linecap="round"/>
    ${spark(388, 50, 9, "#FFD45C")}${spark(214, 46, 7, "#FFD45C")}`,
  connexions: (r, rot) => bgr("#8E44AD", "#9A55B8", rot) + `
    <rect x="216" y="30" width="170" height="182" rx="16" fill="#5E2876" transform="translate(6 7)"/>
    ${[0, 1, 2, 3].map(row => [0, 1, 2, 3].map(col => { const c = row === 0 ? "#F2C94C" : row === 1 && col < 4 ? (col % 2 ? "#fff" : "#fff") : "#fff"; return `<rect x="${222 + col * 41}" y="${36 + row * 43}" width="36" height="38" rx="8" fill="${row === 0 ? "#F2C94C" : row === 1 ? "#6FCF97" : c}"/>`; }).join("")).join("")}
    <rect x="222" y="36" width="159" height="38" rx="9" fill="none" stroke="#2A2333" stroke-width="3"/>
    <rect x="263" y="122" width="36" height="38" rx="8" fill="#56A8E8"/><rect x="345" y="165" width="36" height="38" rx="8" fill="#B07CE0"/>
    ${spark(192, 60, 8, "#FFD45C")}${spark(196, 190, 7, "#EBD3F5")}`,
  motdujour: (r, rot) => bgr("#3A9D5D", "#45A967", rot) + [["M", "#6AAA64"], ["O", "#C9B458"], ["T", "#6AAA64"], ["S", "#787C7E"]].map(([ch, c], i) => `<g transform="translate(${208 + i * 46} ${80 + (i % 2) * 22}) rotate(${i % 2 ? 6 : -5})"><rect width="40" height="44" rx="7" fill="#24663B" transform="translate(4 5)"/><rect width="40" height="44" rx="7" fill="${c}"/><text x="20" y="32" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="26" fill="#fff">${ch}</text></g>`).join("") +
    `<g transform="translate(226 150)">${[0, 1, 2, 3, 4].map(i => `<rect x="${i * 30}" y="0" width="26" height="26" rx="5" fill="${i === 2 ? "#C9B458" : "#fff"}" opacity="${i === 2 ? 1 : .85}"/>`).join("")}</g>${spark(386, 44, 9, "#FFD45C")}${spark(190, 60, 7, "#FFD45C")}`,
  top10: (r, rot) => bgr("#E5534B", "#EA645C", rot) + `
    <g transform="translate(6 7)" fill="#A93A33"><rect x="222" y="150" width="50" height="62"/><rect x="272" y="120" width="54" height="92"/><rect x="326" y="168" width="50" height="44"/></g>
    <rect x="222" y="150" width="50" height="62" fill="#F7EDD6"/><rect x="272" y="120" width="54" height="92" fill="#FFF6EC"/><rect x="326" y="168" width="50" height="44" fill="#E9DBBB"/>
    <text x="299" y="176" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="30" fill="#E5534B">1</text>
    <path d="M286 40l-10 34h16zM312 40l10 34h-16z" fill="#2F5AA8"/><circle cx="299" cy="86" r="30" fill="#FFC24A" stroke="#C98415" stroke-width="5"/><text x="299" y="96" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="24" fill="#7A4D05">10</text>
    ${spark(196, 60, 9, "#FFD45C")}${spark(386, 112, 8, "#FFD45C")}${spark(380, 40, 6, "#FFE1DF")}`,
  silhouettes: (r, rot) => bgr("#4C5BD4", "#5967DA", rot) + `
    <path d="M226 70c18-20 46-14 60-24 18-12 40-8 52 6 12 14 32 14 36 34 4 22-14 30-10 50 4 22-12 40-34 40-16 0-24 14-44 12-22-2-26-20-44-26-20-6-34-20-30-42 2-18 2-34 14-50z" fill="#2E3A9C" transform="translate(7 8)"/>
    <path d="M226 70c18-20 46-14 60-24 18-12 40-8 52 6 12 14 32 14 36 34 4 22-14 30-10 50 4 22-12 40-34 40-16 0-24 14-44 12-22-2-26-20-44-26-20-6-34-20-30-42 2-18 2-34 14-50z" fill="#1C1C1E"/>
    <path d="M226 70c18-20 46-14 60-24 18-12 40-8 52 6 12 14 32 14 36 34 4 22-14 30-10 50 4 22-12 40-34 40-16 0-24 14-44 12-22-2-26-20-44-26-20-6-34-20-30-42 2-18 2-34 14-50z" fill="none" stroke="#FFD45C" stroke-width="4" stroke-dasharray="10 8" transform="translate(-10 -10) scale(1.04)"/>
    <circle cx="352" cy="176" r="26" fill="none" stroke="#fff" stroke-width="8"/><path d="M370 194l18 18" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
    ${spark(190, 172, 8, "#FFD45C")}${spark(388, 44, 8, "#FFD45C")}`,
  relier: (r, rot) => bgr("#1F9E8F", "#2BAA9B", rot) + `
    ${[52, 98, 144, 190].map(y => `<circle cx="226" cy="${y}" r="13" fill="#FFF6EC" stroke="#2A2333" stroke-width="4"/><circle cx="364" cy="${y}" r="13" fill="#FFF6EC" stroke="#2A2333" stroke-width="4"/>`).join("")}
    <path d="M239 52C300 52 300 144 351 144" fill="none" stroke="#FFD45C" stroke-width="7" stroke-linecap="round"/><path d="M239 98C300 98 300 52 351 52" fill="none" stroke="#FF7AA8" stroke-width="7" stroke-linecap="round"/>
    <path d="M239 144C300 144 300 190 351 190" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M239 190C290 190 300 98 351 98" fill="none" stroke="#7FD6FF" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 12"/>
    ${spark(190, 120, 8, "#FFD45C")}${spark(388, 28, 7, "#FFD45C")}`,
  vraifaux: (r, rot) => bgr("#F07A2D", "#F38A42", rot) + `
    <circle cx="263" cy="104" r="58" fill="#B5571A"/><circle cx="256" cy="96" r="58" fill="#22B573"/><path d="M228 98l20 20 38-42" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="344" cy="166" r="44" fill="#B5571A"/><circle cx="338" cy="160" r="44" fill="#F25C54"/><path d="M320 142l36 36M356 142l-36 36" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
    ${spark(190, 180, 9, "#FFD45C")}${spark(386, 52, 9, "#FFD45C")}`,
  rebus: (r, rot) => bgr("#E8A317", "#EDB031", rot) + `
    <g transform="translate(7 8)" fill="#A9740A"><rect x="206" y="44" width="176" height="112" rx="30"/><path d="M240 150l-8 36 40-34z"/></g>
    <rect x="206" y="44" width="176" height="112" rx="30" fill="#fff"/><path d="M240 150l-8 36 40-34z" fill="#fff"/>
    <circle cx="246" cy="100" r="22" fill="#FFC23D"/><circle cx="239" cy="94" r="3.5" fill="#2A2333"/><circle cx="253" cy="94" r="3.5" fill="#2A2333"/><path d="M236 105c6 8 14 8 20 0" fill="none" stroke="#2A2333" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M294 82l7 14 15 2-11 10 3 15-14-7-14 7 3-15-11-10 15-2z" fill="#F2B01E" stroke="#C98415" stroke-width="2.5"/>
    <path d="M350 118c-16-10-22-18-22-26 0-7 5-12 11-12 5 0 9 3 11 7 2-4 6-7 11-7 6 0 11 5 11 12 0 8-6 16-22 26z" fill="#E8483B"/>
    ${spark(188, 60, 8, "#FFF4C9")}${spark(388, 190, 8, "#FFF4C9")}`,
  voisins: (r, rot) => bgr("#5A8F3C", "#669B47", rot) + `
    <path d="M220 60h56v18a12 12 0 1 0 24 0V60h0v56h-18a12 12 0 1 0 0 24h18v56h-80z" fill="#3B6326" transform="translate(7 8)"/>
    <path d="M220 60h80v56h-18a12 12 0 1 0 0 24h18v56h-80z" fill="#FFD45C"/>
    <path d="M300 60h76v136h-76v-56h-18a12 12 0 1 1 0-24h18z" fill="#FFF6EC" transform="translate(4 0)"/>
    <path d="M304 60h72v60h-24a12 12 0 1 1-24 0h-24z" fill="#F27C8E"/>
    <circle cx="258" cy="120" r="6" fill="#2A2333"/><circle cx="342" cy="164" r="6" fill="#2A2333"/>
    ${spark(192, 70, 8, "#FFD45C")}${spark(390, 208, 8, "#FFF4C9")}`,
  citations: (r, rot) => bgr("#B8577A", "#C2678A", rot) + `
    <g transform="translate(7 8)" fill="#82334F"><rect x="206" y="46" width="176" height="120" rx="26"/><path d="M340 160l20 36-50-34z"/></g>
    <rect x="206" y="46" width="176" height="120" rx="26" fill="#FFF6EC"/><path d="M340 160l20 36-50-34z" fill="#FFF6EC"/>
    <text x="294" y="150" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="150" fill="#B8577A">“</text>
    ${spark(188, 54, 8, "#FFD45C")}${spark(386, 210, 8, "#FFD45C")}${spark(392, 36, 6, "#F7D6E3")}`,
  classement: (r, rot) => bgr("#6B7D24", "#788A2E", rot) + `
    <g transform="translate(6 7)" fill="#47541A"><rect x="222" y="150" width="34" height="60" rx="6"/><rect x="264" y="118" width="34" height="92" rx="6"/><rect x="306" y="86" width="34" height="124" rx="6"/><rect x="348" y="54" width="34" height="156" rx="6"/></g>
    <rect x="222" y="150" width="34" height="60" rx="6" fill="#FFF6EC"/><rect x="264" y="118" width="34" height="92" rx="6" fill="#FFF6EC"/><rect x="306" y="86" width="34" height="124" rx="6" fill="#FFF6EC"/><rect x="348" y="54" width="34" height="156" rx="6" fill="#FFD45C"/>
    ${["4", "3", "2", "1"].map((n, i) => `<text x="${239 + i * 42}" y="${200}" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="20" fill="#6B7D24">${n}</text>`).join("")}
    ${spark(192, 70, 8, "#FFD45C")}${spark(214, 120, 6, "#E8F0C8")}`,
  blocs: (r, rot) => bgr("#2D5BA8", "#3A67B2", rot) + `
    <path d="M236 50l50 16v50c0 36-24 58-50 70-26-12-50-34-50-70V66z" fill="#1D3E78" transform="translate(7 8)"/>
    <path d="M236 50l50 16v50c0 36-24 58-50 70-26-12-50-34-50-70V66z" fill="#FFD45C"/><path d="M236 70l32 10v34c0 24-15 40-32 48z" fill="#F2B01E"/>
    <path d="M330 76l50 16v50c0 36-24 58-50 70-26-12-50-34-50-70V92z" fill="#1D3E78" transform="translate(7 8)"/>
    <path d="M330 76l50 16v50c0 36-24 58-50 70-26-12-50-34-50-70V92z" fill="#FFF6EC"/><path d="M330 112l7 14 15 2-11 10 3 15-14-7-14 7 3-15-11-10 15-2z" fill="#2D5BA8"/>
    <rect x="270" y="120" width="34" height="16" rx="8" fill="none" stroke="#fff" stroke-width="6"/>
    ${spark(386, 40, 9, "#FFD45C")}${spark(186, 196, 7, "#D6E2F5")}`,
  paysmystere: (r, rot) => bgr("#0E8C9A", "#1A99A6", rot) + `
    <circle cx="297" cy="128" r="78" fill="#075F69"/><circle cx="290" cy="120" r="78" fill="#BFE6EE"/>
    <path d="M238 92c14-10 30-6 38 4 6 8 18 6 22 16 4 12-8 18-6 30 2 10-8 18-18 14-8-4-12 4-22 0-12-4-10-16-18-22-8-8-12-30 4-42z" fill="#F5B82E"/>
    <path d="M300 64c12-4 26 2 30 12 4 8 14 10 14 22 0 10-10 12-14 20-4 6-14 4-18-4-4-10-16-8-20-18-4-12-4-28 8-32z" fill="#F07A2D"/>
    <path d="M296 150c10-4 22 0 26 10 4 12 18 14 14 28-6 14-22 6-30 2-10-6-24-2-26-14-2-12 6-22 16-26z" fill="#E8483B"/>
    <circle cx="290" cy="120" r="78" fill="none" stroke="#2A2333" stroke-width="6"/>
    <circle cx="232" cy="190" r="30" fill="#FFF6EC" stroke="#2A2333" stroke-width="6"/><text x="232" y="203" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="36" fill="#0E8C9A">?</text>
    ${spark(386, 46, 9, "#FFD45C")}${spark(196, 56, 7, "#FFD45C")}`,
  neavant: (r, rot) => bgr("#C25A2E", "#CC6A3E", rot) + [[226, 64, "#FFF6EC", "1"], [314, 92, "#FFD45C", "2"]].map(([x, y, c, n]) => `
    <rect x="${x + 6}" y="${y + 7}" width="76" height="100" rx="12" fill="#8A3A18"/><rect x="${x}" y="${y}" width="76" height="100" rx="12" fill="${c}"/>
    <circle cx="${x + 38}" cy="${y + 38}" r="17" fill="#2A2333"/><path d="M${x + 12} ${y + 92}c2-20 12-30 26-30s24 10 26 30z" fill="#2A2333"/>
    <circle cx="${x + 64}" cy="${y + 10}" r="13" fill="#2A2333"/><text x="${x + 64}" y="${y + 16}" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="16" fill="#fff">${n}</text>`).join("") + `
    <path d="M282 196h40M282 222h40M286 196c0 8 14 10 14 13s-14 5-14 13M318 196c0 8-14 10-14 13s14 5 14 13" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    ${spark(390, 48, 9, "#FFD45C")}${spark(196, 196, 7, "#FFE1CF")}`,
  chaine: (r, rot) => bgr("#3B8F6E", "#47997A", rot) + [["P", 0], ["O", 1], ["N", 2], ["T", 3]].map(([ch, i]) => `
    <g transform="translate(${206 + i * 46} ${76 + (i % 2) * 46})"><rect x="5" y="6" width="54" height="54" rx="14" fill="#225C45"/><rect width="54" height="54" rx="14" fill="${i % 2 ? "#FFD45C" : "#FFF6EC"}"/>
    <text x="27" y="38" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="28" fill="#2A2333">${ch}</text></g>`).join("") + `
    <path d="M254 112l10 10M300 140l10-10M346 112l10 10" stroke="#2A2333" stroke-width="7" stroke-linecap="round"/>
    ${spark(390, 42, 9, "#FFD45C")}${spark(196, 196, 7, "#D6F0E4")}`,
  anagrammes: (r, rot) => bgr("#B5476B", "#BF587A", rot) + [["R", -12, 210, 70], ["O", 8, 262, 54], ["M", -4, 318, 72], ["A", 10, 236, 132], ["E", -8, 296, 138], ["S", 6, 348, 128]].map(([ch, a, x, y]) => `
    <g transform="translate(${x} ${y}) rotate(${a})"><rect x="4" y="6" width="46" height="50" rx="9" fill="#7A2A45"/><rect width="46" height="50" rx="9" fill="#FFF6EC"/>
    <text x="23" y="36" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="26" fill="#B5476B">${ch}</text></g>`).join("") + `
    <path d="M220 214c30-16 120-16 150 0" fill="none" stroke="#FFD45C" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 14"/>${spark(390, 40, 9, "#FFD45C")}`,
  comptebon: (r, rot) => bgr("#4D6BC6", "#5A77CE", rot) + `
    <rect x="228" y="34" width="132" height="62" rx="14" fill="#2E4590" transform="translate(6 7)"/><rect x="228" y="34" width="132" height="62" rx="14" fill="#2A2333"/>
    <text x="294" y="78" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="34" fill="#FFD45C">763</text>
    ${[[214, 120, "100"], [274, 120, "25"], [334, 120, "7"], [214, 172, "4"], [274, 172, "9"], [334, 172, "50"]].map(([x, y, n]) => `<rect x="${x + 4}" y="${y + 5}" width="52" height="42" rx="9" fill="#2E4590"/><rect x="${x}" y="${y}" width="52" height="42" rx="9" fill="#FFF6EC"/><text x="${x + 26}" y="${y + 29}" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="${n.length > 2 ? 17 : 20}" fill="#2A2333">${n}</text>`).join("")}
    ${spark(390, 52, 9, "#FFD45C")}${spark(192, 70, 7, "#D9E2FA")}`,
  sigles: (r, rot) => bgr("#7B4FC9", "#8660D0", rot) + `
    <rect x="206" y="62" width="180" height="96" rx="20" fill="#4F2F8E" transform="translate(7 8)"/><rect x="206" y="62" width="180" height="96" rx="20" fill="#FFF6EC"/>
    <text x="296" y="128" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="44" letter-spacing="4" fill="#7B4FC9">ONU</text>
    ${[0, 1, 2].map(i => `<rect x="${224 + i * 52}" y="176" width="40" height="8" rx="4" fill="#FFD45C" opacity="${1 - i * .2}"/>`).join("")}
    ${spark(390, 40, 9, "#FFD45C")}${spark(196, 196, 7, "#E6DAFA")}`,
  distance: (r, rot) => bgr("#2C7FB8", "#3A8BC2", rot) + `
    <path d="M222 168C250 70 330 60 362 96" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="4 14"/>
    ${[[222, 168, "#FFD45C"], [362, 96, "#E8483B"]].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><path d="M0 0c-12-15-21-26-21-36a21 21 0 0 1 42 0c0 10-9 21-21 36z" fill="#1C5A85" transform="translate(5 6)"/><path d="M0 0c-12-15-21-26-21-36a21 21 0 0 1 42 0c0 10-9 21-21 36z" fill="${c}" stroke="#2A2333" stroke-width="5"/><circle cy="-36" r="7" fill="#fff"/></g>`).join("")}
    <g transform="rotate(-8 300 200)"><rect x="236" y="190" width="132" height="26" rx="6" fill="#FFF6EC" stroke="#2A2333" stroke-width="4"/>${Array.from({ length: 9 }, (_, i) => `<line x1="${250 + i * 13}" y1="190" x2="${250 + i * 13}" y2="${i % 2 ? 199 : 205}" stroke="#2A2333" stroke-width="3"/>`).join("")}</g>
    ${spark(390, 40, 9, "#FFD45C")}${spark(196, 60, 7, "#D6EEFB")}`
};

/* ---------- icônes de manche, de joker, de partage ---------- */
Object.assign(I, {
  joker: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.7 6 6.5.6-4.9 4.3 1.5 6.4L12 16.5l-5.8 3.3 1.5-6.4L2.8 9.1l6.5-.6z" fill="#F5B82E" stroke="#C98415" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  share: (s = 20) => sv(`<path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 13v6h14v-6"/>`, s),
  duel: (s = 20) => sv(`<path d="M4 20L15 9"/><path d="M15 9l2-5 3 3-5 2"/><path d="M20 20L9 9"/><path d="M9 9L7 4 4 7l5 2"/>`, s),
  heart: (s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21c-6-4.4-9.5-8-9.5-12A5 5 0 0 1 12 6.3 5 5 0 0 1 21.5 9c0 4-3.5 7.6-9.5 12z" fill="currentColor"/></svg>`,
  list: (s = 24) => sv(`<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.4" fill="currentColor"/><circle cx="4.5" cy="12" r="1.4" fill="currentColor"/><circle cx="4.5" cy="18" r="1.4" fill="currentColor"/>`, s),
  globe: (s = 18) => sv(`<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>`, s, `stroke-width="2.2"`),
  book: (s = 24) => sv(`<path d="M4 5.5C7 4 10 4.5 12 6c2-1.5 5-2 8-.5V19c-3-1.5-6-1-8 .5-2-1.5-5-2-8-.5z"/><path d="M12 6v13.5"/>`, s),
  medal: (s = 24) => sv(`<path d="M8 3l4 6 4-6"/><circle cx="12" cy="15" r="6"/><path d="M12 12.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z" fill="currentColor" stroke="none"/>`, s)
});
const THEME_ICO = {
  cine: `<rect x="3" y="8.5" width="18" height="12" rx="2"/><path d="M3 8.5l2.2-5 3.3 1.2-2.2 4.8M10 7l2.2-4.9 3.3 1.2L13.3 8M17 8.5l1.7-4 2.3.8-1.2 3.2" />`,
  musique: `<path d="M9 18.5a3 3 0 1 1-2-2.8V5l12-2.5v12.3a3 3 0 1 1-2-2.8V6.3L9 8z"/>`,
  sport: `<circle cx="12" cy="12" r="9"/><path d="M12 7.5l3.4 2.5-1.3 4h-4.2l-1.3-4z" fill="#fff" opacity=".85"/>`,
  sciences: `<path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3"/><path d="M7.5 15h9" stroke="#fff" stroke-width="1.6" opacity=".8"/>`,
  arts: `<path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-.8 2-1.8 0-1.5-1.2-1.8-1.2-3 0-1 .8-1.7 1.9-1.7H17a4 4 0 0 0 4-4C21 6.2 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.4" fill="#fff"/><circle cx="10" cy="7" r="1.4" fill="#fff"/><circle cx="15" cy="7.5" r="1.4" fill="#fff"/>`,
  gastro: `<path d="M7 3v8a2 2 0 0 1-4 0V3M5 11v10M17 3c-2 0-3.5 2.5-3.5 6 0 2.2 1.3 3.4 3 3.6V21h1.5V3z"/>`,
  nature: `<path d="M20 4c-9 0-15 4-15 11 0 2 .6 3.5 1.6 4.6C8 15 11 11 16 9c-4 3-7 6.5-8.3 11.2.9.5 2 .8 3.3.8 7 0 9-7 9-17z"/>`,
  expr: `<path d="M4 5h16v11H10l-5 4v-4H4z"/><circle cx="9" cy="10.5" r="1.3" fill="#fff"/><circle cx="12" cy="10.5" r="1.3" fill="#fff"/><circle cx="15" cy="10.5" r="1.3" fill="#fff"/>`
};
const STAT_ICO = {
  pop: `<circle cx="8" cy="8" r="3.2"/><circle cx="16.5" cy="8.5" r="2.7"/><path d="M2.5 20c.5-4 2.8-6.3 5.5-6.3s5 2.3 5.5 6.3zM13.5 20c.3-2.4 1.1-4.5 3-5.5 2.6.3 4.3 2.4 4.8 5.5z"/>`,
  area: `<path d="M4 4h16v16H4z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M4 9h5M15 20v-5M9 4v3M20 15h-3"/>`,
  alt: `<path d="M1.5 20.5L9 7.5l4 6.6 2.4-3.6 7.1 10z"/>`,
  len: `<path d="M2 8c3 0 3-3 6-3s3 3 6 3 3-3 6-3M2 14c3 0 3-3 6-3s3 3 6 3 3-3 6-3M2 20c3 0 3-3 6-3s3 3 6 3 3-3 6-3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  chrono: `<path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9" fill="none" stroke="currentColor" stroke-width="2.2"/>`
};
const KIND_ICO = {
  nperso: `<circle cx="12" cy="8" r="4.2"/><path d="M4 21c.6-5 3.8-7.8 8-7.8s7.4 2.8 8 7.8z"/>`, prenom: `<circle cx="12" cy="8" r="4.2"/><path d="M4 21c.6-5 3.8-7.8 8-7.8s7.4 2.8 8 7.8z"/>`,
  nevent: `<path d="M2.5 9.5L12 3.8l9.5 5.7z"/><rect x="4.8" y="11" width="2.8" height="7" rx=".8"/><rect x="10.6" y="11" width="2.8" height="7" rx=".8"/><rect x="16.4" y="11" width="2.8" height="7" rx=".8"/><rect x="3" y="19" width="18" height="2.6" rx="1.2"/>`,
  nculture: `<path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
  eclair: `<path d="M13.5 2L4 14h7l-1.5 8L20 10h-7z"/>`,
  compte: `<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2" opacity=".5"/>`,
  suite: `<circle cx="4" cy="12" r="2.4"/><circle cx="10" cy="12" r="2.4"/><circle cx="16" cy="12" r="2.4"/><path d="M19.5 8.5l3.5 3.5-3.5 3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  quot: `<path d="M3 11l9-7.5 9 7.5v10H14v-6h-4v6H3z"/>`,
  tech: `<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" stroke="currentColor" stroke-width="2"/>`,
  ville: `<path d="M3 21V10l5-3v14zM9 21V4h7v17zM17 21v-9h4v9z"/>`, capitale: `<path d="M3 21V10l5-3v14zM9 21V4h7v17zM17 21v-9h4v9z"/>`,
  animal: `<circle cx="6" cy="10" r="2.3"/><circle cx="10" cy="6" r="2.3"/><circle cx="14.5" cy="6" r="2.3"/><circle cx="18.5" cy="10" r="2.3"/><path d="M12.2 11.5c3 0 5.8 3.6 5.8 6.2 0 2.2-2 2.8-3.6 2.3-1.1-.3-1.5-.7-2.2-.7s-1.1.4-2.2.7c-1.6.5-3.6-.1-3.6-2.3 0-2.6 2.8-6.2 5.8-6.2z"/>`,
  film: `<rect x="3" y="8.5" width="18" height="12" rx="2"/><path d="M3 8.5l2.2-5 3.3 1.2-2.2 4.8M10 7l2.2-4.9 3.3 1.2L13.3 8M17 8.5l1.7-4 2.3.8-1.2 3.2" />`
};
function mIcon(m, s = 18) {
  if (m.type === "theme") return THEMES[m.key] && ["hist", "geopo", "geo"].includes(m.key) ? I.theme(m.key, s) : `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${THEME_ICO[m.key] || ""}</svg>`;
  if (m.type === "cont") return I.globe(s);
  if (m.type === "stat") return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0" aria-hidden="true">${STAT_ICO[m.key] || ""}</svg>`;
  if (m.type === "kind" && KIND_ICO[m.key]) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${KIND_ICO[m.key]}</svg>`;
  if (m.type === "kind" && ["france", "europe", "monde", "inst"].includes(m.key)) return m.key === "inst" ? I.theme("geopo", s) : I.globe(s);
  if (m.type === "kind") return m.key === "geo" || m.key === "pays" ? I.globe(s) : m.key === "hist" || m.key === "culture" ? `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${STAT_ICO.chrono}</svg>` : sv(`<path d="M12 3l8 3v6c0 4.5-3.4 7.6-8 9-4.6-1.4-8-4.5-8-9V6z"/>`, s);
  return sv(`<path d="M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16"/>`, s);
}
