#!/usr/bin/env python3
"""Génère les icônes de la PWA dans public/icons/ à partir du dessin du logo (public/logo.svg ; mêmes formes, même plan 512 x 512).
Outil ponctuel, nécessite Pillow : pip install pillow.
Les icônes sont carrées et pleine page (le système arrondit lui-même) ; tout le motif reste dans la « zone de sécurité » maskable
(cercle central de 80 % de la largeur), donc la même image sert pour « any » et « maskable »."""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "icons")
PURPLE, PURPLE_D, CREAM, INK, GOLD = "#6B5BE2", "#4C3EBE", "#FFF6EC", "#2A2333", "#FFC24A"
SS = 4  # suréchantillonnage pour des bords lisses


def draw_logo(size, rounded=False):
    k = size * SS / 512
    n = size * SS
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    S = lambda v: v * k
    if rounded:
        d.rounded_rectangle([0, 0, n - 1, n - 1], radius=S(112), fill=PURPLE)
    else:
        d.rectangle([0, 0, n, n], fill=PURPLE)
    # ombre « lèvre » puis globe
    d.ellipse([S(256 - 144), S(274 - 144), S(256 + 144), S(274 + 144)], fill=PURPLE_D)
    d.ellipse([S(256 - 144), S(256 - 144), S(256 + 144), S(256 + 144)], fill=CREAM, outline=INK, width=round(S(16)))
    w = round(S(12))
    d.ellipse([S(256 - 64), S(256 - 144), S(256 + 64), S(256 + 144)], outline=INK, width=w)
    d.line([S(256), S(112), S(256), S(400)], fill=INK, width=w)
    d.line([S(112), S(256), S(400), S(256)], fill=INK, width=w)
    # étincelle dorée (même tracé que le SVG)
    cx, cy = 370, 146  # centre de l'étincelle ; bras de 46, creux de 10
    pts = [(cx, cy - 46), (cx + 10, cy - 10), (cx + 46, cy), (cx + 10, cy + 10), (cx, cy + 46), (cx - 10, cy + 10), (cx - 46, cy), (cx - 10, cy - 10)]
    sp = [(S(x), S(y)) for x, y in pts]
    d.polygon(sp, fill=GOLD)
    d.line(sp + [sp[0], sp[1]], fill=INK, width=round(S(10)), joint="curve")
    return img.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, size in [("icon-192.png", 192), ("icon-512.png", 512), ("icon-maskable-512.png", 512), ("apple-touch-icon.png", 180)]:
        draw_logo(size).convert("RGB").save(os.path.join(OUT, name), optimize=True)
        print(name, size)
    draw_logo(64, rounded=True).save(os.path.join(OUT, "favicon-64.png"), optimize=True)
    print("favicon-64.png 64")
