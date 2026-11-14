#!/usr/bin/env python3
"""Prepare and audit Build 337 Mossbot prototype PNGs for Xcode asset catalogs.

Usage:
  python3 scripts/import_build337_mossbot.py /path/to/40/pngs --output /tmp/mossbot-assets

The script intentionally does not write to the game's live Assets.xcassets by
default. Import the generated imagesets only for controlled visual validation.
"""
import argparse
import json
import shutil
import struct
from pathlib import Path

COUNTS = {"idle": 8, "move": 8, "attack": 10, "hit": 6, "defeat": 8}
PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


def check_png(path: Path):
    with path.open("rb") as file:
        header = file.read(26)
    if len(header) < 26 or header[:8] != PNG_MAGIC or header[12:16] != b"IHDR":
        raise ValueError(f"Not a valid PNG: {path}")
    width, height, depth, color = struct.unpack(">IIBB", header[16:26])
    if (width, height, depth, color) != (512, 512, 8, 6):
        raise ValueError(f"Expected 512x512 8-bit RGBA PNG: {path.name}, got {(width, height, depth, color)}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if not args.source.is_dir():
        parser.error("Source directory does not exist")
    expected = [f"mossbot_{motion}_{index:02d}.png"
                for motion, count in COUNTS.items() for index in range(count)]
    existing = {path.name for path in args.source.glob("*.png")}
    missing = sorted(set(expected) - existing)
    unexpected = sorted(existing - set(expected))
    if missing or unexpected:
        raise SystemExit(f"Sprite inventory mismatch: missing={missing}, unexpected={unexpected}")
    for name in expected:
        check_png(args.source / name)
    if args.output.resolve() == args.source.resolve():
        parser.error("Output must be separate from source")
    args.output.mkdir(parents=True, exist_ok=True)
    for name in expected:
        asset = args.output / (Path(name).stem + ".imageset")
        asset.mkdir(parents=True, exist_ok=True)
        shutil.copy2(args.source / name, asset / name)
        (asset / "Contents.json").write_text(
            json.dumps({"images": [{"filename": name, "idiom": "universal"}],
                        "info": {"author": "xcode", "version": 1}}, indent=2) + "\n"
        )
    print(f"PASS: {len(expected)} PNGs checked; {len(expected)} Xcode imagesets written to {args.output}")
    print("NOTE: Inventory/header checks only. Visual quality and iOS compilation are not verified.")


if __name__ == "__main__":
    main()
