#!/usr/bin/env python3
"""Validate shipped World 1 PNG art, not empty asset-catalog placeholders.

Run from repository root: python3 scripts/audit_world1_art.py
Checks asset names, actual PNG bytes, image dimensions, and transparency
for props. A passing audit does not replace simulator/art-direction review.
"""
import json
from pathlib import Path
import struct
import sys

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "OutpostZero"
LANDSCAPES = ("ruined_outpost", "swamp_basin", "toxic_caves", "boss_arena")
PROPS = ("wall", "boulder", "vegetation", "debris", "lantern", "crate")
REQUIRED = [(f"world1_{landscape}_{prop}", "prop")
            for landscape in LANDSCAPES for prop in PROPS]
REQUIRED += [(f"world1_{landscape}_floor_{variant}", "floor")
             for landscape in LANDSCAPES for variant in (1, 2, 3)]


def resolve_png(name):
    # SpriteKit's imageNamed resolves imagesets by their catalog name.
    for imageset in ASSET_ROOT.rglob(name + ".imageset"):
        manifest = imageset / "Contents.json"
        if not manifest.is_file():
            continue
        try:
            metadata = json.loads(manifest.read_text(encoding="utf-8"))
        except (ValueError, OSError):
            continue
        for entry in metadata.get("images", []):
            filename = entry.get("filename")
            if filename:
                path = imageset / filename
                if path.is_file() and path.suffix.lower() == ".png":
                    return path
    # Standalone PNGs can also be resolved by their basename.
    return next((p for p in ASSET_ROOT.rglob(name + ".png") if p.is_file()), None)


def png_metadata(path):
    with path.open("rb") as stream:
        header = stream.read(26)
    if len(header) < 26 or header[:8] != b"\\x89PNG\\r\\n\\x1a\\n" or header[12:16] != b"IHDR":
        raise ValueError("invalid PNG signature or IHDR")
    width, height = struct.unpack(">II", header[16:24])
    color_type = header[25]
    if width < 1 or height < 1:
        raise ValueError("zero-size PNG")
    return width, height, color_type


def main():
    errors = []
    valid = 0
    for name, kind in REQUIRED:
        path = resolve_png(name)
        if path is None:
            errors.append(f"MISSING {name}: no PNG payload")
            continue
        try:
            width, height, color_type = png_metadata(path)
        except (ValueError, OSError) as exc:
            errors.append(f"INVALID {name}: {exc}")
            continue
        minimum = 256 if kind == "floor" else 64
        if width < minimum or height < minimum:
            errors.append(f"TOO SMALL {name}: {width}x{height} (minimum {minimum}x{minimum})")
        elif kind == "prop" and color_type not in (4, 6, 3):
            # Palette PNGs may carry transparency via tRNS; inspect in art review.
            errors.append(f"NO ALPHA {name}: PNG color type {color_type}")
        else:
            valid += 1
    print(f"World 1 authored art: {valid}/{len(REQUIRED)} PNG assets validated")
    for error in errors:
        print(error)
    if errors:
        print("FAIL: World 1 artwork is incomplete; do not approve visual capture.")
        return 1
    print("PASS: Asset payloads exist. Simulator appearance and art quality remain unverified.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
