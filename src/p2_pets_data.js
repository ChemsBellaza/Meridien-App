/* ---------- familiers ---------- */
const INK = "#1C1C1E";     // traits des illustrations
const ACC = "#2A2333";     // contour des accessoires
const EYE = "#221D2B";     // yeux, bouches
const G0 = { cy: 50, rx: 25, ry: 22, eyeY: 51, eyeDX: 11, eyeR: 4.6, neckY: 72, mouthY: 62, hatDY: 0 };
// expression de base : lid = paupières (0 ouvert → 1 fermé), look = regard, brow = angle des sourcils (+ = inquiet, − = déterminé)
const SPECIES = {
  renard: { name: "Marco", kind: "Renard", traits: ["Rusé", "Curieux"], bg: "pine",
    quote: "Une bonne réponse, ça se flaire.",
    ex: { lid: [.36, .36], look: [1.6, .2], pupil: .55, brow: [-2, -14], browY: [-9.5, -6.5], mouth: "smirk" },
    lines: { hello: ["Psst… j'ai un pressentiment pour aujourd'hui.", "On les piège tous ?", "Je flaire une bonne partie."], good: ["Je le savais. Enfin… je m'en doutais très fort.", "Trop facile. On recommence demain ?"], mid: ["Pas mal. La prochaine fois, on les piège tous.", "Correct. J'ai noté leurs faiblesses."], bad: ["On a été trop honnêtes. Demain, on ruse.", "Personne n'a rien vu, d'accord ?"] } },
  loutre: { name: "Ondine", kind: "Loutre", traits: ["Joueuse", "Vive"], bg: "cobalt", g: { eyeY: 48, eyeR: 5.2, mouthY: 61 },
    quote: "Chaque question est une vague à surfer !",
    ex: { lid: [0, 0], look: [0, .6], pupil: .62, spark: true, brow: [10, 10], browY: [-9.5, -9.5], mouth: "tongue" },
    lines: { hello: ["On plonge ? L'eau est bonne !", "J'ai trop hâte, trop hâte !", "Aujourd'hui, on éclabousse tout le monde."], good: ["Splash ! On a tout éclaboussé !", "Wouhou ! On refait un plongeon ?"], mid: ["Hihi, j'ai appris un truc, ça compte double !", "Pas mal du tout, on flotte !"], bad: ["Bof, on replonge demain !", "Bloup… bon, la mer était agitée."] } },
  lapin: { name: "Pampa", kind: "Lapin", traits: ["Speedé", "Malin"], bg: "vermil", g: { eyeR: 5.3, eyeDX: 10 },
    quote: "Plus vite que mon ombre !",
    ex: { lid: [0, 0], look: [0, 0], pupil: .36, brow: [6, 6], browY: [-9.5, -9.5], mouth: "buck" },
    lines: { hello: ["Vite, vite, le défi est sorti !", "J'ai déjà fini d'attendre !", "Prêt ? Partez !"], good: ["Zoum ! Trop rapide pour eux !", "Hop hop hop, au sommet !"], mid: ["Vite, vite, on rejoue ?", "J'aurais pu courir plus vite…"], bad: ["J'ai couru dans le mauvais sens…", "Pfiou. Je reprends mon souffle."] } },
  ours: { name: "Bjorn", kind: "Ours brun", traits: ["Calme", "Tenace"], bg: "saffron", g: { rx: 27, ry: 23, eyeR: 3.9, eyeY: 50, mouthY: 64 },
    quote: "Lentement, mais sûrement.",
    ex: { lid: [.48, .48], look: [0, .5], pupil: .62, brow: [4, 4], browY: [-7, -7], mouth: "calm" },
    lines: { hello: ["Pas de panique. On a toute la journée.", "Un bon miel, un bon défi.", "On y va tranquille."], good: ["Solide. Comme un chêne.", "Hm. C'était une belle chasse."], mid: ["Lentement mais sûrement.", "Ça ira mieux après le goûter."], bad: ["Une sieste et on recommence.", "Grmbl. Demain, on revient plus fort."] } },
  tortue: { name: "Tao", kind: "Tortue", traits: ["Patiente", "Sage"], bg: "sky", g: { rx: 18, ry: 16, eyeY: 49, eyeDX: 7.5, eyeR: 4, neckY: 68, mouthY: 57.5, hatDY: -3 },
    quote: "Rien ne sert de courir…",
    ex: { lid: [.6, .6], look: [0, .6], pupil: .65, brow: [8, 8], browY: [-6, -6], mouth: "calm" },
    lines: { hello: ["Prends ton temps, jeune pousse.", "J'ai 120 ans, et toujours curieuse.", "Une question à la fois."], good: ["Tu vois ? Rien ne sert de courir.", "La patience paie toujours."], mid: ["Un pas après l'autre.", "Doucement, on progresse."], bad: ["J'ai 120 ans, j'ai connu pire.", "Demain est un autre jour, petit."] } },
  panda: { name: "Bao", kind: "Panda", traits: ["Zen", "Gourmand"], bg: "violet", need: { k: "streak", v: 3 },
    quote: "D'abord le bambou, ensuite les questions.",
    ex: { closed: "serene", mouth: "chew" },
    lines: { hello: ["Respire. Mâche. Joue.", "Un bambou pour la route ?", "Le calme avant la victoire."], good: ["Belle récolte. Je mérite un bambou.", "L'harmonie parfaite."], mid: ["L'équilibre, c'est déjà bien.", "Ni trop, ni trop peu."], bad: ["Même le bambou plie avant de pousser.", "Bon. Je vais manger mes émotions."] } },
  koala: { name: "Kip", kind: "Koala", traits: ["Rêveur", "Câlin"], bg: "cobalt", need: { k: "plays", v: 10 }, g: { eyeR: 4.2, mouthY: 67 },
    quote: "Je réfléchis… les yeux fermés.",
    ex: { lid: [.58, .58], look: [0, 1], pupil: .66, brow: [12, 12], browY: [-7, -7], mouth: "o", zzz: true },
    lines: { hello: ["Mmh… c'est déjà l'heure du défi ?", "Je rêvais de capitales…", "Encore cinq minutes…"], good: ["Oh… on a gagné ? Je rêvais.", "Câlin de victoire !"], mid: ["Je vais réfléchir à ça… demain.", "Pas mal, pour quelqu'un qui dort."], bad: ["Zzz… pardon, j'ai raté quoi ?", "On fait une sieste et on oublie ?"] } },
  tigre: { name: "Tora", kind: "Tigre", traits: ["Compétitrice", "Intrépide"], bg: "night", need: { k: "gems", v: 300 },
    quote: "Deuxième, c'est le premier des perdants.",
    ex: { lid: [.16, .16], look: [0, 0], pupil: .5, brow: [-17, -17], browY: [-6, -6], mouth: "fang" },
    lines: { hello: ["Le classement m'appartient. Point.", "Grrr. On chasse ?", "Je veux la première place."], good: ["Grrr ! Ils n'avaient aucune chance.", "Proie suivante !"], mid: ["Je veux la revanche. Maintenant.", "Insuffisant. On recommence."], bad: ["Je rugirai plus fort demain.", "Ce n'était qu'un échauffement."] } },
  aigle: { name: "Altaïr", kind: "Aigle", traits: ["Perçant", "Précis"], bg: "sky", need: { k: "streak", v: 7 }, g: { cy: 45, rx: 21, ry: 20, eyeY: 43, eyeDX: 9, eyeR: 4.4, neckY: 66, hatDY: -3 },
    quote: "De là-haut, je vois chaque frontière.",
    ex: { lid: [.22, .22], look: [-.4, 0], pupil: .46, iris: "#F2C230", brow: [-20, -20], browY: [-5.5, -5.5], mouth: "none" },
    lines: { hello: ["Cible repérée.", "Je vois la carte d'ici.", "Concentration."], good: ["Vu d'en haut, tout était clair.", "En plein dans le mille."], mid: ["Correct. Je vise plus haut.", "Il faut affûter le regard."], bad: ["Même un aigle rate sa cible parfois.", "Le vent était contre nous."] } },
  lion: { name: "Léon", kind: "Lion", traits: ["Fier", "Meneur"], bg: "vermil", need: { k: "wins", v: 3 }, g: { eyeR: 4.2, mouthY: 63 },
    quote: "Le trône ne se prête pas.",
    ex: { lid: [.32, .32], look: [0, 0], pupil: .55, brow: [-9, -9], browY: [-7, -7], mouth: "smug" },
    lines: { hello: ["Le roi est arrivé. Le défi peut commencer.", "Inclinez-vous, la partie commence.", "Rugissons ensemble."], good: ["Évidemment. Le trône est à nous.", "Longue vie au roi !"], mid: ["Un roi ne se contente pas de ça.", "Correct, mais pas royal."], bad: ["Personne n'a rien vu. Compris ?", "Même les rois ont des jours sans."] } }
};
/* ---------- refonte v9 : créatures à types, trois évolutions, variante chromatique ---------- */
const TYPES = {
  feu:      { label: "Feu",       color: "#EE7B2E" },
  eau:      { label: "Eau",       color: "#4A90E2" },
  plante:   { label: "Plante",    color: "#4FAE4A" },
  electrik: { label: "Électrik",  color: "#E8B417" },
  roche:    { label: "Roche",     color: "#A58A55" },
  glace:    { label: "Glace",     color: "#5EC0DA" },
  vol:      { label: "Vol",       color: "#7F8EE6" },
  combat:   { label: "Combat",    color: "#D2453B" },
  tenebres: { label: "Ténèbres",  color: "#5A4A78" },
  dragon:   { label: "Dragon",    color: "#6E4FD6" }
};
const EVO = {
  renard: { num: 1, type: "feu", names: ["Braisille", "Flamérou", "Pyrénard"],
    dex: ["Le bout de sa queue rougeoie quand il réfléchit. Plus la question est dure, plus il chauffe.", "Une flammèche danse sur son front. On dit qu'elle s'allume quand il flaire la bonne réponse.", "Sa crinière de flammes illumine la nuit. Il ne se trompe jamais deux fois de chemin."],
    ex: { eye: "round", iris: "#F2B035", mouth: "smirk" } },
  loutre: { num: 2, type: "eau", names: ["Ondelou", "Vaguelou", "Marélou"],
    dex: ["Elle garde toujours une goutte d'eau sur la tête, comme porte-bonheur.", "Sa nageoire lui permet de remonter les rivières à contre-courant, en riant.", "Elle chevauche les vagues et connaît le nom de chaque fleuve du monde."],
    ex: { eye: "round", iris: "#2F7FD0", mouth: "open", spark: true } },
  koala: { num: 3, type: "plante", names: ["Feuillon", "Eucalou", "Sylvoala"],
    dex: ["Une pousse grandit sur sa tête pendant qu'il dort. C'est-à-dire tout le temps.", "Les feuilles de ses oreilles frémissent quand il rêve de capitales.", "Une couronne de fleurs éclot chaque fois qu'il apprend quelque chose."],
    ex: { eye: "round", lid: .5, mouth: "o", zzz: true } },
  lapin: { num: 4, type: "electrik", names: ["Zapin", "Voltalapin", "Fulgurine"],
    dex: ["Ses oreilles crépitent quand il est pressé. Il est toujours pressé.", "Il court si vite qu'il laisse des étincelles derrière lui.", "Un éclair zèbre le ciel à chacun de ses bonds. Personne ne l'a jamais rattrapé."],
    ex: { eye: "round", iris: "#2F5FC4", mouth: "buck" } },
  ours: { num: 5, type: "roche", names: ["Caillourson", "Rocours", "Montourse"],
    dex: ["Il dort sur les galets et se réveille un caillou de plus sur le front.", "Ses épaulettes de pierre le rendent inébranlable. Il ne panique jamais.", "Aussi solide qu'une montagne. Il lui faut trois jours pour changer d'avis."],
    ex: { eye: "round", mouth: "smile" } },
  tortue: { num: 6, type: "glace", names: ["Givrette", "Glacortue", "Banquisa"],
    dex: ["Un petit cristal pousse sur sa carapace pendant les nuits froides.", "Elle a vu passer mille hivers et répond toujours avec calme.", "Un iceberg entier repose sur son dos. Elle a la mémoire des glaciers."],
    ex: { eye: "round", iris: "#2B6CB0", mouth: "smile" } },
  aigle: { num: 7, type: "vol", names: ["Plumet", "Rapaçon", "Altaïgle"],
    dex: ["Il voit une fourmi à cent mètres, mais pas ses propres plumes en bataille.", "Sa crête se dresse quand il repère une cible sur la carte.", "D'un battement d'ailes, il fait le tour d'un continent. Il connaît chaque frontière."],
    ex: { eye: "sharp", iris: "#F2C230", mouth: "none" } },
  panda: { num: 8, type: "combat", names: ["Pandoux", "Pandojo", "Grandmaîtrao"],
    dex: ["Il s'entraîne au karaté entre deux siestes et trois bambous.", "Sa ceinture noire, il l'a gagnée en méditant plus longtemps que tout le monde.", "Maître du calme, il brise une planche d'un seul regard. Il préfère la manger."],
    ex: { eye: "ringed", mouth: "smile" } },
  tigre: { num: 9, type: "tenebres", names: ["Ombrigre", "Noctigre", "Éclipsigre"],
    dex: ["Il se cache dans l'ombre des classements pour mieux bondir.", "Ses yeux brillent dans le noir. Ses adversaires aussi, mais de peur.", "Quand il rugit, la lune se voile. Il ne vise que la première place."],
    ex: { eye: "sharp", iris: "#FFE15A", mouth: "fang" } },
  lion: { num: 10, type: "dragon", names: ["Draconceau", "Dragolion", "Rugidragon"],
    dex: ["Ses petites cornes le démangent. Il rêve déjà de voler.", "Ses ailes ont poussé d'un coup, un matin de victoire.", "Moitié lion, moitié dragon, entièrement roi. Le trône ne se prête pas."],
    ex: { eye: "round", iris: "#C2410C", mouth: "smug" } }
};
Object.keys(EVO).forEach(k => Object.assign(SPECIES[k], EVO[k], { name: EVO[k].names[0], kind: "Type " + TYPES[EVO[k].type].label }));
const PAL = {
  renard: { main: "#F7893A", shade: "#DB6A1F", belly: "#FFEBC9", dark: "#5B2717", fl1: "#FFD43B", fl2: "#FF8A2A", fl3: "#E8401C", cheek: "#FF9F7A" },
  loutre: { main: "#52A9E8", shade: "#2E82C6", belly: "#E4F6FF", dark: "#173A63", accent: "#9BE3FF", accentS: "#5FC3EE", cheek: "#FF9FB8" },
  koala:  { main: "#A2B6AA", shade: "#7E9587", belly: "#ECF3E9", dark: "#2D3B33", leaf: "#5CC24A", leafS: "#3C9131", flower: "#FF8FB4", flowerC: "#FFD84A", inner: "#F6E8EC", cheek: "#FFB0C0" },
  lapin:  { main: "#8FC8FF", shade: "#5EA2E8", belly: "#F3F9FF", dark: "#22345E", bolt: "#FFD23F", boltS: "#E2A70F", inner: "#FFE59A", cheek: "#FFD23F" },
  ours:   { main: "#A8825E", shade: "#85613F", belly: "#E8CFAA", dark: "#3A281A", rock: "#9493A2", rockS: "#6B6979", rockL: "#C4C2CE", cheek: "#F2A08A" },
  tortue: { main: "#A7E2F5", shade: "#79C3DD", belly: "#EFFBFF", dark: "#1E4560", shell: "#3F7DC0", shellS: "#2C5F99", ice: "#F0FCFF", iceS: "#A9E7F8", cheek: "#FFB3C7" },
  aigle:  { main: "#79B4EC", shade: "#4E8ED0", belly: "#FFF6E6", dark: "#1F3558", beak: "#F7B733", beakS: "#D48D10", wing: "#3E76C2", wingS: "#2A5A9E", crest: "#FF8A3D", crestS: "#E0621E", cheek: "#FFB3A0" },
  panda:  { main: "#FFFFFF", shade: "#D9DAE3", belly: "#FFFFFF", dark: "#2A2A36", band: "#E5393B", bandS: "#B12428", bamboo: "#6CBF4A", bambooS: "#4A9A33", cheek: "#FFB3C0" },
  tigre:  { main: "#7262B6", shade: "#53428F", belly: "#D2C8F0", dark: "#221A3B", glow: "#FFE15A", wisp: "#3B2D6E", wispL: "#9C8CF0", cheek: "#C9B6FF" },
  lion:   { main: "#F4BC4F", shade: "#D79A2B", belly: "#FFEBB8", dark: "#4E2C14", mane: "#E0582E", maneS: "#B53F1E", horn: "#FFF3D9", hornS: "#D9C49A", wing: "#4DB89C", wingS: "#2D8C72", cheek: "#FF9F7A" }
};
// variantes chromatiques : seules les couleurs listées changent
const SHINY = {
  renard: { main: "#F3F1EC", shade: "#CFCAC0", fl1: "#BFF2FF", fl2: "#4FB2FF", fl3: "#2C6BE0" },
  loutre: { main: "#F6A8CB", shade: "#DB7CA9", accent: "#FFE0F0", accentS: "#F5A8CF" },
  koala:  { main: "#E9C47C", shade: "#CAA157", leaf: "#E85A8A", leafS: "#B83C66" },
  lapin:  { main: "#C9A9FF", shade: "#A07EE8", bolt: "#7DF0C8", boltS: "#3FBF93" },
  ours:   { main: "#7C818E", shade: "#5D6270", rock: "#E2BE52", rockS: "#B8932C", rockL: "#F6DE8C" },
  tortue: { main: "#FFD7EA", shade: "#F0AECB", shell: "#8E5BD6", shellS: "#6B3CB0" },
  aigle:  { main: "#F5D35A", shade: "#D9B035", wing: "#E08A2E", wingS: "#B5661A" },
  panda:  { main: "#F6E6CF", shade: "#DCC6A6", dark: "#7A4426", band: "#2E7DE0", bandS: "#1D5AB0" },
  tigre:  { main: "#ECE8F5", shade: "#C6BEDB", belly: "#FFFFFF", glow: "#7FD8FF", wispL: "#BFE9FF" },
  lion:   { main: "#A3D5F2", shade: "#73B2DE", mane: "#3E5FCB", maneS: "#2B4399", wing: "#E06AA0", wingS: "#B5477C" }
};
const BGS = { type: null, pine: "#2FA36B", cobalt: "#4F78E8", vermil: "#EF7262", sky: "#45B2E2", saffron: "#F2B33E", violet: "#8C79EE", night: "#33334A" };
const EVO_NEED = [null, { k: "games", v: 8 }, { k: "games", v: 30 }];
const defaultPet = sp => ({ species: sp, stage: "1", shiny: "normal", bg: "type" });
const stageOf = pet => Math.max(1, Math.min(3, +pet.stage || 1));
const petName = pet => SPECIES[pet.species in SPECIES ? pet.species : "renard"].names[stageOf(pet) - 1];
const ITEMS = {
  species: { label: "Familier", list: Object.entries(SPECIES).map(([id, S]) => ({ id, label: S.names[0], need: S.need })) },
  stage: { label: "Évolution", list: [{ id: "1", label: "Stade 1" }, { id: "2", label: "Stade 2", need: EVO_NEED[1] }, { id: "3", label: "Stade 3", need: EVO_NEED[2] }] },
  shiny: { label: "Couleurs", list: [{ id: "normal", label: "Normales" }, { id: "shiny", label: "Chromatiques", need: { k: "streak", v: 5 } }] },
  bg: { label: "Fond", list: [
    { id: "type", label: "Couleur du type" },
    { id: "pine", label: "Vert" }, { id: "cobalt", label: "Bleu" }, { id: "vermil", label: "Corail" }, { id: "sky", label: "Ciel" }, { id: "saffron", label: "Soleil" },
    { id: "violet", label: "Lilas", need: { k: "streak", v: 3 } },
    { id: "night", label: "Nuit", need: { k: "gems", v: 300 } }
  ] }
};
const PET_CATS = ["species", "stage", "shiny", "bg"];
// description textuelle pour les lecteurs d'écran : espèce, type, stade, couleurs, caractère
const petDesc = pet => { const S = SPECIES[pet.species in SPECIES ? pet.species : "renard"]; return `${petName(pet)}, familier de type ${TYPES[S.type].label}, stade ${stageOf(pet)} sur 3${pet.shiny === "shiny" ? ", aux couleurs chromatiques" : ""}.${S.traits && S.traits.length ? " Caractère : " + S.traits.join(", ") + "." : ""}`; };
const reqText = n => n.k === "games" ? `${n.v} parties terminées` : n.k === "gems" ? `${n.v} boussoles` : n.k === "streak" ? `Série de ${n.v} jours` : n.k === "wins" ? `${n.v} victoire${n.v > 1 ? "s" : ""} du jour` : `${n.v} parties jouées`;

const BOTS = [
  { id: "b1", name: "Yasmine", skill: .80, color: "#EF6F68", pet: { species: "tigre",  stage: "3", shiny: "normal", bg: "type" } },
  { id: "b2", name: "Théo",    skill: .66, color: "#17977F", pet: { species: "ours",   stage: "2", shiny: "normal", bg: "type" } },
  { id: "b3", name: "Nadia",   skill: .73, color: "#F0993B", pet: { species: "lapin",  stage: "3", shiny: "shiny", bg: "type" } },
  { id: "b4", name: "Karim",   skill: .57, color: "#4A86EE", pet: { species: "loutre", stage: "2", shiny: "normal", bg: "type" } },
  { id: "b5", name: "Léa",     skill: .63, color: "#D9579E", pet: { species: "tortue", stage: "1", shiny: "normal", bg: "type" } }
];
const ME_COLOR = "#8D78F0";

const BOT_LINES = {
  any: ["Allez, qui me bat aujourd'hui ?", "J'ai tenté le difficile partout, grosse erreur", "Le « saviez-vous » de la manche 2, je ne le savais pas du tout", "Je rejoue ce soir, j'ai raté la dernière", "Facile partout, je joue la sécurité", "Ce classement est un scandale", "Bien joué tout le monde", "J'apprends un truc à chaque partie, j'adore"],
  carte: ["J'ai cliqué en plein océan", "Mes 400 km d'écart me hantent", "Qui a eu 100 sur le deuxième lieu ?", "Je confonds toujours l'Asie centrale"],
  frise: ["J'étais à 200 ans près, presque", "Je mélange toutes les dates de traités", "La frise c'est mon jeu préféré"],
  quiz: ["Le chrono m'a eu", "15 secondes c'est trop court !", "J'ai hésité entre deux réponses à chaque fois"]
};

