#!/usr/bin/env python3
"""Audit World 1 production scenery assets without treating fallbacks as finished art.

Run from repository root: python3 scripts/audit_world1_art.py
Exit 0 when all required asset names are present; exit 1 when any are missing.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "OutpostZero"
LANDSCAPES = ("ruined_outpost", "swamp_basin", "toxic_caves", "boss_arena")
PROPS = ("wall", "boulder", "vegetation", "debris", "lantern", "crate")
REQUIRED = [f"world1_{landscape}_{prop}" for landscape in LANDSCAPES for prop in PROPS]
REQUIRED += [f"world1_{landscape}_floor_{variant}" for landscape in LANDSCAPES for variant in (1, 2, 3)]

def existing_names():
    names = set()
    for file in ASSET_ROOT.rglob("*"):
        if file.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}:
            names.add(file.stem)
        if file.name.endswith(".imageset"):
            names.add(file.name.removesuffix(".imageset"))
    return names

def main():
    found = existing_names()
    missing = [name for name in REQUIRED if name not in found]
    print(f"World 1 authored art: {len(REQUIRED) - len(missing)}/{len(REQUIRED)} required asset names found")
    for name in missing:
        print(f"MISSING {name}")
    if missing:
        print("FAIL: Existing procedural fallbacks must not count as the visual overhaul.")
        return 1
    print("PASS: Required names present. Simulator rendering and art quality still require review.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
