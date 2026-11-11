// Aides communes aux tests : navigateur, URL de la page construite, dossier de captures.
const path = require("path"), fs = require("fs"), { pathToFileURL } = require("url");
const { chromium: pw } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "tests", "out");           // captures d'écran (ignoré par git)
fs.mkdirSync(OUT, { recursive: true });
process.chdir(OUT);                                      // les scripts écrivent leurs captures dans le dossier courant
const exe = process.env.CHROME_PATH || undefined;        // chemin d'un Chrome/Chromium déjà installé
const channel = process.env.BROWSER_CHANNEL || undefined; // ou "msedge" / "chrome" : utilise Edge ou Chrome déjà présents (aucun téléchargement)
exports.chromium = { launch: (o = {}) => pw.launch({ ...o, ...(exe ? { executablePath: exe } : {}), ...(channel ? { channel } : {}) }) };
exports.URL = pathToFileURL(path.join(ROOT, "dist", "meridien.html")).href;
exports.OUT = OUT;
