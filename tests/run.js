#!/usr/bin/env node
// Lance les tests et vérifie leurs résultats. Usage : node tests/run.js [smoke|a11y|maps|formats|evolution]...
const { spawnSync } = require("child_process"), path = require("path");
const run = (file, args = []) => { const r = spawnSync(process.execPath, [path.join(__dirname, file), ...args], { encoding: "utf8", timeout: 12 * 60 * 1000 }); return (r.stdout || "") + (r.stderr || ""); };
const json = s => { const m = s.match(/\{[\s\S]*\}\s*$/); return m ? JSON.parse(m[0]) : null; };

const SUITES = {
  smoke: () => { const o = run("smoke.test.js"); return [/light no errors/.test(o) && /dark no errors/.test(o), o.split("\n").filter(l => /error/i.test(l)).join("\n")]; },
  a11y: () => { const o = run("a11y.test.js"), j = json(o); if (!j) return [false, o.slice(-600)];
    const ok = j.lang === "fr" && j.viewport && j.migrated[0] === 2 && j.dlgFocus[1] === "inside" && j.tabTrapped === "inside" && j.afterEsc[1] === "menu" && j.warn && j.warn[0] === "alert" && j.timerRole === "timer" && j.focusKept === "quit" && !j.errors.length;
    return [ok, JSON.stringify(j)]; },
  maps: () => { const o = run("maps.test.js"), j = json(o); return [!!j && j.ready[0] === true && !j.ready[1] && !j.errors.length && !j.hosts.some(h => /cdnjs/.test(h)), o.slice(-400)]; },
  evolution: () => { const o = run("evolution.test.js"); return [/light no errors/.test(o) && /dark no errors/.test(o) && !/EVOLUTION ATTENDUE|Error/.test(o), o.slice(-500)]; },
  formats: () => { const o = run("formats.test.js"), n = (o.match(/stamps/g) || []).length;
    const bad = o.split("\n").filter(l => /^(PAGEERR|CONSOLE)/.test(l));          // les lignes STEP/TEST sont des avertissements du script, pas des bugs
    return [n >= 28 && !bad.length, `${n} formats joués${bad.length ? "\n" + bad.join("\n") : ""}`]; },
};
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : ["smoke", "a11y", "maps"];
let failed = 0;
for (const name of wanted) {
  if (!SUITES[name]) { console.error("Suite inconnue :", name); failed++; continue; }
  process.stdout.write(`• ${name} … `); const [ok, info] = SUITES[name]();
  console.log(ok ? "OK" : "ÉCHEC"); if (!ok) { failed++; console.log(info); }
}
process.exit(failed ? 1 : 0);
