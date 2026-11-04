#!/usr/bin/env python3
"""Reject obviously incorrect SpringBoard screenshots from focused menu review.

A simulator can successfully return a PNG while showing the iOS launcher.
The launcher has a bright, mostly light upper half, unlike the authored
Outpost Zero hub. This is a conservative supplementary guard, not proof
that the correct in-game scene rendered.
"""
from pathlib import Path
import sys
from PIL import Image

path = Path(sys.argv[1])
image = Image.open(path).convert("RGB").resize((120, 260))
pixels = [image.getpixel((x, y)) for y in range(20, 115) for x in range(10, 110)]
mean_luma = sum(sum(rgb) / 3 for rgb in pixels) / len(pixels)
bright_fraction = sum(min(rgb) > 190 for rgb in pixels) / len(pixels)
print(f"Capture foreground guard: mean={mean_luma:.1f}, bright={bright_fraction:.3f}")
if mean_luma > 145 and bright_fraction > 0.12:
    sys.exit("Capture resembles the bright iOS launcher, not the Outpost Zero hub")
