#!/usr/bin/env python3
"""Génère supabase/seed.sql (réglages et table des formats) à partir de src/p1_config.js.
La source de vérité des règles reste CONFIG / FORMATS dans le code : relancer ce script après toute modification, puis appliquer le seed."""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = open(os.path.join(ROOT, "src", "p1_config.js"), encoding="utf-8").read()

def num(name):
    m = re.search(rf"{name}:\s*([\d.]+)", cfg)
    if not m: sys.exit("Réglage introuvable : " + name)
    return m.group(1)

def text(name):
    m = re.search(rf'{name}:\s*"([^"]+)"', cfg)
    if not m: sys.exit("Réglage introuvable : " + name)
    return m.group(1)

order = re.search(r"formatOrder:\s*\[(.*?)\]", cfg, re.S)
keys = re.findall(r'"([a-z0-9]+)"', order.group(1))
more = open(os.path.join(ROOT, "src", "pQ_more.js"), encoding="utf-8").read()   # jeux ajoutés après coup (v26)
push = re.search(r"formatOrder\.push\((.*?)\)", more, re.S)
if push: keys += re.findall(r'"([a-z0-9]+)"', push.group(1))
cfg += "\n" + more
if len(set(keys)) != len(keys): sys.exit("Format en double dans formatOrder")
mult = re.search(r"mult:\s*\[([^\]]+)\]", cfg).group(1).replace(" ", "")

maxes = {}
for k in keys:
    m = re.search(rf"^\s{{2}}{k}:\s*\{{[^\n]*?\bmax:\s*(\d+)", cfg, re.M)
    if not m: sys.exit("Barème introuvable pour " + k)
    maxes[k] = int(m.group(1))

out = ["-- GÉNÉRÉ par scripts/gen-supabase-seed.py à partir de src/p1_config.js : ne pas modifier à la main.", ""]
out.append("insert into public.app_config (id, tries_per_day, gems_per_rank, joker_cost, mult, format_anchor, season_anchor, season_days, timezone)")
out.append(f"values (1, {num('tries')}, {num('gemsPerRank')}, {num('jokerCost')}, '{{{mult}}}', date '{text('formatAnchor')}', date '{text('seasonAnchor')}', {num('seasonDays')}, 'Europe/Paris')")
out.append("on conflict (id) do update set tries_per_day = excluded.tries_per_day, gems_per_rank = excluded.gems_per_rank, joker_cost = excluded.joker_cost,")
out.append("  mult = excluded.mult, format_anchor = excluded.format_anchor, season_anchor = excluded.season_anchor, season_days = excluded.season_days;")
out.append("")
out.append("insert into public.formats (position, key, max_points) values")
out.append(",\n".join(f"  ({i}, '{k}', {maxes[k]})" for i, k in enumerate(keys)))
out.append("on conflict (position) do update set key = excluded.key, max_points = excluded.max_points;")
out.append("")

dest = os.path.join(ROOT, "supabase")
os.makedirs(dest, exist_ok=True)
open(os.path.join(dest, "seed.sql"), "w", encoding="utf-8", newline="\n").write("\n".join(out))
print("supabase/seed.sql écrit :", len(keys), "formats ; barèmes", sorted(set(maxes.values())))
