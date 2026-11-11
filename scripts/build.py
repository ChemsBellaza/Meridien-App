#!/usr/bin/env python3
"""Assemble src/ en dist/meridien.html (équivalent de build.js, sans Node : Python 3 suffit, aucune installation de paquet)."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = lambda f: os.path.join(ROOT, "src", f)
order = json.load(open(os.path.join(ROOT, "scripts", "order.json"), encoding="utf-8"))
missing = [f for f in order if not os.path.exists(src(f))]
extra = [f for f in os.listdir(os.path.join(ROOT, "src")) if f.endswith(".js") and f not in order]
if missing: sys.exit("Fichiers manquants : " + ", ".join(missing))
if extra: sys.exit("Fichiers .js non listés dans scripts/order.json : " + ", ".join(extra))
read = lambda p: open(p, "rb").read()
js = b"".join(read(src(f)) for f in order)
html = read(src("head.html")) + b'<div id="app" class="app"></div>\n<script>\n' + js + b"</script>\n"
os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
out = os.path.join(ROOT, "dist", "meridien.html")
open(out, "wb").write(html)
open(os.path.join(ROOT, "dist", "index.html"), "wb").write(html)  # page d'accueil des hébergeurs (GitHub Pages…)
import shutil
pub = os.path.join(ROOT, "public")  # manifeste, service worker, icônes : copiés tels quels dans dist/
if os.path.isdir(pub): shutil.copytree(pub, os.path.join(ROOT, "dist"), dirs_exist_ok=True)
print("dist/meridien.html : %d Ko (%d fichiers)" % (len(html) // 1024, len(order)))
