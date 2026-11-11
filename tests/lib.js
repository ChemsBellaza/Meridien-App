// Aides communes aux tests : navigateur, URL de la page construite, dossier de captures.
const path = require("path"), fs = require("fs"), { pathToFileURL } = require("url");
const { chromium: pw } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "tests", "out");           // captures d'écran (ignoré par git)
fs.mkdirSync(OUT, { recursive: true });
process.chdir(OUT);                                      // les scripts écrivent leurs captures dans le dossier courant
const exe = process.env.CHROME_PATH || undefined;        // CHROME_PATH pour utiliser un Chrome/Chromium déjà installé
exports.chromium = { launch: (o = {}) => pw.launch({ ...o, ...(exe ? { executablePath: exe } : {}) }) };
exports.URL = pathToFileURL(path.join(ROOT, "dist", "meridien.html")).href;
exports.OUT = OUT;
