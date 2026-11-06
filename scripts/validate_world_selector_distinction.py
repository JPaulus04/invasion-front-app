#!/usr/bin/env python3
"""Ensure World Selector is visibly distinct from the Home screen.

This guards against the regression where showWorldSelector merely changed
the phase while drawing the exact same Home presentation.
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
    if mean_difference < 2.0:
        sys.exit("World Selector is visually indistinguishable from Home")
