/* Déclaration des 6 jeux de la v39 : Histoire de France, Histoire du monde, Sports, Gastronomie, Sciences et nature, Langues du monde.
   La rotation passe de 35 à 41 jeux (41 est premier : tous les pas de rotation des groupes conviennent). Données : pQ_g3a / g3b / g3c. */
Object.assign(FORMATS, {
  histoirefr:    { name: "Histoire de France", color: "#4A5FC1", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                   kinds: { moyen: { label: "Moyen Âge et Renaissance", color: "#4A5FC1" }, revol: { label: "Révolution et Empire", color: "#C2417A" }, contemp: { label: "De 1815 à nos jours", color: "#1E9A73" } },
                   sub: "Rois, batailles et grands tournants de l'histoire de France : 20 secondes par question." },
  histoiremonde: { name: "Histoire du monde", color: "#A0652A", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                   kinds: { antiquite: { label: "Antiquité", color: "#A0652A" }, civs: { label: "Grandes civilisations", color: "#2BA3B8" }, mondial: { label: "Époque moderne", color: "#8A4FD6" } },
                   sub: "De l'Antiquité à nos jours, aux quatre coins du monde : 20 secondes par question." },
  sports:        { name: "Sports", color: "#1E9A73", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                   kinds: { foot: { label: "Football", color: "#1E9A73" }, jo: { label: "Jeux olympiques", color: "#E8A317" }, autres: { label: "Autres sports", color: "#4A72E0" } },
                   sub: "Football, Jeux olympiques et autres sports : 20 secondes par question." },
  gastronomie:   { name: "Gastronomie", color: "#E07B39", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                   kinds: { france: { label: "Cuisine française", color: "#4A72E0" }, monde: { label: "Cuisine du monde", color: "#E07B39" }, produits: { label: "Produits et ingrédients", color: "#5A8F3C" } },
                   sub: "Plats, fromages, épices et spécialités du monde : 20 secondes par question." },
  nature:        { name: "Sciences et nature", color: "#4F9D2D", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                   kinds: { animaux: { label: "Animaux", color: "#4F9D2D" }, espace: { label: "Espace", color: "#8A4FD6" }, terre: { label: "Planète Terre", color: "#2B7BE0" } },
                   sub: "Animaux, espace et planète Terre : 20 secondes par question." },
  langues:       { name: "Langues du monde", color: "#0E8FA6", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                   kinds: { emprunts: { label: "Mots d'ailleurs", color: "#0E8FA6" }, bonjour: { label: "Dire bonjour", color: "#D9534F" }, monde: { label: "Langues et pays", color: "#8A4FD6" } },
                   sub: "D'où vient ce mot ? Comment dit-on bonjour ? 20 secondes par question." }
});
CONFIG.formatOrder.push("histoirefr", "histoiremonde", "sports", "gastronomie", "nature", "langues");

Object.assign(ART2, {
  histoirefr: (r, rot) => bgr("#4A5FC1", "#5A6FD0", rot) + `
    <path d="M236 200V84h22V68h22v16h24V68h22v16h22v116z" fill="#26347C" transform="translate(7 8)"/>
    <path d="M236 200V84h22V68h22v16h24V68h22v16h22v116z" fill="#FFF6EC" stroke="#2A2333" stroke-width="5" stroke-linejoin="round"/>
    <path d="M280 200v-34a16 16 0 0 1 32 0v34z" fill="#4A5FC1" stroke="#2A2333" stroke-width="5"/>
    <path d="M296 66V32" stroke="#2A2333" stroke-width="5" stroke-linecap="round"/><path d="M296 32l34 10-34 10z" fill="#FFD45C" stroke="#2A2333" stroke-width="4" stroke-linejoin="round"/>
    ${spark(210, 60, 8, "#FFD45C")}${spark(386, 170, 7, "#D6DCF6")}`,
  histoiremonde: (r, rot) => bgr("#A0652A", "#B0763A", rot) + `
    <path d="M258 52h76c0 40-30 56-30 72s30 32 30 72h-76c0-40 30-56 30-72s-30-32-30-72z" fill="#6A3F14" transform="translate(7 8)"/>
    <path d="M258 52h76c0 40-30 56-30 72s30 32 30 72h-76c0-40 30-56 30-72s-30-32-30-72z" fill="#FFF6EC" stroke="#2A2333" stroke-width="5" stroke-linejoin="round"/>
    <path d="M272 66h48c-4 24-24 34-24 34s-20-10-24-34z" fill="#FFC24A"/><path d="M266 190h60c-6-20-30-28-30-28s-24 8-30 28z" fill="#FFC24A"/>
    <path d="M246 52h100M246 196h100" stroke="#2A2333" stroke-width="8" stroke-linecap="round"/>
    ${spark(386, 60, 9, "#FFD45C")}${spark(212, 176, 7, "#F0D7B5")}`,
  sports: (r, rot) => bgr("#1E9A73", "#2BA783", rot) + `
    <path d="M262 64h72v40a36 36 0 0 1-72 0z" fill="#0F6B4F" transform="translate(7 8)"/>
    <path d="M262 76h-24a22 22 0 0 0 24 40M334 76h24a22 22 0 0 1-24 40" fill="none" stroke="#2A2333" stroke-width="5" stroke-linecap="round"/>
    <path d="M262 64h72v40a36 36 0 0 1-72 0z" fill="#FFD45C" stroke="#2A2333" stroke-width="5" stroke-linejoin="round"/>
    <rect x="288" y="140" width="20" height="28" fill="#FFD45C" stroke="#2A2333" stroke-width="5"/><rect x="262" y="168" width="72" height="20" rx="6" fill="#FFF6EC" stroke="#2A2333" stroke-width="5"/>
    ${spark(220, 56, 8, "#FFF6EC")}${spark(380, 170, 8, "#FFD45C")}`,
  gastronomie: (r, rot) => bgr("#E07B39", "#E88B4C", rot) + `
    <g transform="translate(7 8)" fill="#9A4B14"><circle cx="266" cy="92" r="30"/><circle cx="296" cy="76" r="34"/><circle cx="328" cy="92" r="30"/><rect x="262" y="104" width="68" height="64" rx="6"/><rect x="258" y="164" width="76" height="22" rx="6"/></g>
    <g fill="#2A2333" stroke="#2A2333" stroke-width="10" stroke-linejoin="round"><circle cx="266" cy="92" r="30"/><circle cx="296" cy="76" r="34"/><circle cx="328" cy="92" r="30"/><rect x="262" y="104" width="68" height="64" rx="6"/><rect x="258" y="164" width="76" height="22" rx="6"/></g>
    <g fill="#FFF6EC"><circle cx="266" cy="92" r="30"/><circle cx="296" cy="76" r="34"/><circle cx="328" cy="92" r="30"/><rect x="262" y="104" width="68" height="64" rx="6"/><rect x="258" y="164" width="76" height="22" rx="6"/></g>
    <path d="M280 120v36M312 120v36" stroke="#F0C9A8" stroke-width="5" stroke-linecap="round"/>
    ${spark(220, 60, 8, "#FFD45C")}${spark(388, 178, 7, "#FBE0C9")}`,
  nature: (r, rot) => bgr("#4F9D2D", "#5DAA3A", rot) + `
    <path d="M296 190C240 170 226 110 250 70c40 0 80 10 96 60 10 36-10 60-50 60z" fill="#2E6A14" transform="translate(7 8)"/>
    <path d="M296 190C240 170 226 110 250 70c40 0 80 10 96 60 10 36-10 60-50 60z" fill="#A6DC7A" stroke="#2A2333" stroke-width="5" stroke-linejoin="round"/>
    <path d="M296 190C290 150 286 120 268 92M290 152l-22-4M292 126l24-10" fill="none" stroke="#2A2333" stroke-width="5" stroke-linecap="round"/>
    ${spark(384, 56, 9, "#FFD45C")}${spark(206, 188, 7, "#DDF2C8")}`,
  langues: (r, rot) => bgr("#0E8FA6", "#1D9DB4", rot) + `
    <g transform="translate(7 8)" fill="#08596A"><rect x="214" y="56" width="112" height="70" rx="20"/><rect x="268" y="112" width="120" height="70" rx="20"/></g>
    <path d="M232 126l-8 22 28-22z" fill="#FFF6EC" stroke="#2A2333" stroke-width="5" stroke-linejoin="round"/>
    <rect x="214" y="56" width="112" height="70" rx="20" fill="#FFF6EC" stroke="#2A2333" stroke-width="5"/>
    <rect x="268" y="112" width="120" height="70" rx="20" fill="#FFD45C" stroke="#2A2333" stroke-width="5"/>
    <text x="270" y="102" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="30" fill="#0E8FA6">Hi</text>
    <text x="328" y="158" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="26" fill="#2A2333">Ciao</text>
    ${spark(392, 56, 9, "#FFD45C")}${spark(206, 190, 7, "#CBEDF3")}`
});
