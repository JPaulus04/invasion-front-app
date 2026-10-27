#!/usr/bin/env python3
"""Install approved World 1 art PNGs into Xcode image sets.

Usage:
  python3 scripts/install_world1_art.py /path/to/approved/pngs [ruined_outpost|swamp_basin|toxic_caves|boss_arena|all]

Source directory must contain files named world1_<landscape>_<kind>.png
and world1_<landscape>_floor_<1..3>.png. This script never generates
placeholder images or crops a complete-scene concept into game artwork.
"""
import json
from pathlib import Path
import shutil
import sys

LANDSCAPES = ("ruined_outpost", "swamp_basin", "toxic_caves", "boss_arena")
PROPS = ("wall", "boulder", "vegetation", "debris", "lantern", "crate")
NAMES = [f"world1_{landscape}_{kind}" for landscape in LANDSCAPES for kind in PROPS]
NAMES += [f"world1_{landscape}_floor_{variant}" for landscape in LANDSCAPES for variant in (1, 2, 3)]
DESTINATION = Path(__file__).resolve().parents[1] / "OutpostZero" / "Assets.xcassets"


def main():
    if len(sys.argv) not in (2, 3):
        print("Usage: install_world1_art.py <approved-png-directory> [landscape|all]", file=sys.stderr)
        return 2
    source = Path(sys.argv[1]).resolve()
    missing = [name for name in NAMES if not (source / (name + ".png")).is_file()]
    if missing:
        print("Artwork incomplete; no assets installed:", file=sys.stderr)
        for name in missing:
            print("  " + name, file=sys.stderr)
        return 1
    if not DESTINATION.is_dir():
        print(f"Xcode asset catalog not found: {DESTINATION}", file=sys.stderr)
        return 1
    for name in selected:
        imageset = DESTINATION / (name + ".imageset")
        imageset.mkdir(exist_ok=True)
        shutil.copyfile(source / (name + ".png"), imageset / (name + ".png"))
        manifest = {
            "images": [{"filename": name + ".png", "idiom": "universal"}],
            "info": {"author": "xcode", "version": 1},
        }
        (imageset / "Contents.json").write_text(
            json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
        )
    print(f"Installed {len(selected)} authored PNGs into {DESTINATION}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
