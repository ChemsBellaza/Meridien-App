#!/usr/bin/env node
// Assemble src/ en un seul fichier HTML autonome : dist/meridien.html
// Ordre des fichiers = ordre d'exécution (les données d'abord, puis le cœur, puis l'interface). La liste est dans scripts/order.json.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.resolve(__dirname, "..");
const SRC = f => path.join(ROOT, "src", f);

const ORDER = JSON.parse(fs.readFileSync(path.join(__dirname, "order.json"), "utf8")); // liste partagée avec build.py et build.ps1 (commentaires : voir docs/ARCHITECTURE.md)

const missing = ORDER.filter(f => !fs.existsSync(SRC(f)));
const extra = fs.readdirSync(path.join(ROOT, "src")).filter(f => f.endsWith(".js") && !ORDER.includes(f));
if (missing.length) { console.error("Fichiers manquants :", missing.join(", ")); process.exit(1); }
if (extra.length) { console.error("Fichiers .js non listés dans ORDER (ajoute-les dans scripts/order.json) :", extra.join(", ")); process.exit(1); }

const js = Buffer.concat(ORDER.map(f => fs.readFileSync(SRC(f))));
const tmp = path.join(ROOT, "dist", ".all.js");
fs.mkdirSync(path.join(ROOT, "dist"), { recursive: true });
fs.writeFileSync(tmp, js);
try { cp.execFileSync(process.execPath, ["--check", tmp], { stdio: "inherit" }); }
catch (e) { console.error("Erreur de syntaxe JavaScript : build annulé."); process.exit(1); }
fs.unlinkSync(tmp);

const html = Buffer.concat([
  fs.readFileSync(SRC("head.html")),
  Buffer.from('<div id="app" class="app"></div>\n<script>\n'),
  js,
  Buffer.from("</script>\n"),
]);
const out = path.join(ROOT, "dist", "meridien.html");
fs.writeFileSync(out, html);
console.log(`dist/meridien.html : ${(html.length / 1024).toFixed(0)} Ko (${ORDER.length} fichiers)`);
