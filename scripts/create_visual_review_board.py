#!/usr/bin/env python3
"""Create a consistent, labeled Build 331 visual-review board from simulator PNGs."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
import os
import re

ROOT = Path("screenshots")
SCENES = [
    ("Home / floating world", "outpost-zero-home-navigation.png"),
    ("World selector", "outpost-zero-world-selector.png"),
    ("Headquarters", "outpost-zero-headquarters.png"),
    ("Gear Bay", "outpost-zero-gear-bay.png"),
    ("Ability Lab", "outpost-zero-ability-lab.png"),
    ("Mission loadout", "outpost-zero-loadout.png"),
    ("Recovery / Pilot", "outpost-zero-recovery.png"),
    ("Pause menu", "outpost-zero-paused-run.png"),
    ("Settings", "outpost-zero-settings.png"),
    ("Combat / HUD", "outpost-zero-simulator.png"),
    ("Combat feedback", "outpost-zero-combat-feedback.png"),
    ("Tactical abilities", "outpost-zero-tactical-abilities.png"),
    ("Ranged combat 1", "outpost-zero-ranged-1.png"),
    ("Ranged combat 2", "outpost-zero-ranged-2.png"),
    ("Flank warning", "outpost-zero-flank-warning.png"),
    ("Flank arrival", "outpost-zero-flank-arrival.png"),
    ("Level-up cards", "outpost-zero-level-up.png"),
    ("Boss / Root Lord", "build327-root-lord.png"),
    ("Defense active", "outpost-zero-defense-active.png"),
    ("Survival encounter", "outpost-zero-survival-2.png"),
]
W, H, PAD, LABEL, COLS = 276, 490, 18, 54, 4
rows = (len(SCENES) + COLS - 1) // COLS
board = Image.new("RGB", (COLS * (W + PAD) + PAD,
                          rows * (H + LABEL + PAD) + PAD + 75), "#101c29")
draw = ImageDraw.Draw(board)
project = Path("project.yml").read_text()
match = re.search(r'CURRENT_PROJECT_VERSION:\s*"?(\d+)', project)
build = match.group(1) if match else "UNKNOWN"
draw.text((PAD, 18), f"OUTPOST ZERO  |  BUILD {build}  |  SIMULATOR VISUAL REVIEW",
          fill="#ffffff")
draw.text((PAD, 44), "Actual simulator captures • missing images explicitly marked",
          fill="#aabccc")
manifest = []
for index, (title, filename) in enumerate(SCENES):
    x = PAD + (index % COLS) * (W + PAD)
    y = 75 + PAD + (index // COLS) * (H + LABEL + PAD)
    path = ROOT / filename
    exists = path.is_file()
    manifest.append({"scene": title, "file": filename, "captured": exists})
    draw.rounded_rectangle((x, y, x + W, y + H + LABEL),
                           radius=9, fill="#213346")
    if exists:
        with Image.open(path) as src:
            img = src.convert("RGB")
            img.thumbnail((W - 12, H - 12), Image.Resampling.LANCZOS)
            board.paste(img, (x + (W - img.width) // 2,
                              y + (H - img.height) // 2))
    else:
        draw.text((x + 15, y + H // 2), "CAPTURE MISSING", fill="#ffb5a5")
    draw.text((x + 10, y + H + 12), title, fill="#ffffff")
    draw.text((x + 10, y + H + 31), filename[:37], fill="#aabccc")
ROOT.mkdir(exist_ok=True)
board.save(ROOT / "outpost-zero-review-board.png", optimize=True)
(ROOT / "outpost-zero-review-manifest.json").write_text(
    json.dumps({"build": build, "commit": os.environ.get("GITHUB_SHA", "unknown"),
                "scenes": manifest}, indent=2) + "\n")
print(f"Review board: {sum(x['captured'] for x in manifest)}/{len(manifest)} scenes")
