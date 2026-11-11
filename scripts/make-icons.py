#!/usr/bin/env python3
"""Génère les icônes de la PWA dans public/icons/ (outil ponctuel, nécessite Pillow : pip install pillow).
Motif neutre (globe et méridiens) : ne dépend pas du nom définitif de l'application.
Le contenu reste dans la « zone de sécurité » (cercle central de 80 %) pour que la version maskable ne soit jamais rognée."""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "icons")
PURPLE, WHITE, GOLD = (107, 91, 226, 255), (255, 255, 255, 255), (255, 200, 74, 255)
SS = 4  # suréchantillonnage pour des bords lisses


def draw_icon(size, scale):
    """scale = taille du motif par rapport au carré (maskable : un peu plus petit)."""
    n = size * SS
    img = Image.new("RGBA", (n, n), PURPLE)
    d = ImageDraw.Draw(img)
    c, r = n / 2, n * scale / 2
    w = max(2, int(n * 0.034))
    d.ellipse([c - r, c - r, c + r, c + r], outline=WHITE, width=w)  # globe
    d.ellipse([c - r * 0.46, c - r, c + r * 0.46, c + r], outline=WHITE, width=w)  # méridien oblique
    d.line([c, c - r, c, c + r], fill=WHITE, width=w)  # méridien central
    d.line([c - r, c, c + r, c], fill=WHITE, width=w)  # équateur
    pr = n * 0.052  # repère doré sur le globe
    px, py = c + r * 0.62, c - r * 0.62
    d.ellipse([px - pr, py - pr, px + pr, py + pr], fill=GOLD)
    return img.resize((size, size), Image.LANCZOS)


os.makedirs(OUT, exist_ok=True)
for name, size, scale in [("icon-192.png", 192, 0.62), ("icon-512.png", 512, 0.62), ("icon-maskable-512.png", 512, 0.56), ("apple-touch-icon.png", 180, 0.62)]:
    draw_icon(size, scale).convert("RGB").save(os.path.join(OUT, name), optimize=True)
    print(name, size)
