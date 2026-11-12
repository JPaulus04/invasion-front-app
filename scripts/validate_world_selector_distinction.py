#!/usr/bin/env python3
"""Guard against restoring a separate World Selector screen.

Both captures intentionally use Home. Animation timing can shift the island
and atmospheric effects, so permit a small whole-image pixel difference.
"""
from pathlib import Path
import sys
from PIL import Image, ImageChops, ImageStat

if len(sys.argv) != 3:
    sys.exit("Usage: validate_world_selector_distinction.py HOME.png SELECTOR.png")
home_path, selector_path = map(Path, sys.argv[1:])
with Image.open(home_path) as home_image, Image.open(selector_path) as selector_image:
    home = home_image.convert("RGB").resize((120, 260))
    selector = selector_image.convert("RGB").resize((120, 260))
    differences = ImageStat.Stat(ImageChops.difference(home, selector)).mean
    mean_difference = sum(differences) / len(differences)
    print(f"Home/World Selector mean pixel difference: {mean_difference:.2f}")
    if mean_difference > 6.0:
        sys.exit("Legacy selector capture differs substantially from unified Home")
