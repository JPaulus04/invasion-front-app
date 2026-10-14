#!/usr/bin/env python3
"""Validate production PNG sprites without third-party dependencies."""
from pathlib import Path
import struct
import sys

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "OutpostZero" / "ArtAssets"
PNG = b"\x89PNG\r\n\x1a\n"
errors = []
files = sorted(ASSETS.rglob("*.png")) if ASSETS.exists() else []
for path in files:
    data = path.read_bytes()
    label = str(path.relative_to(ROOT))
    if len(data) < 33 or not data.startswith(PNG) or data[12:16] != b"IHDR":
        errors.append(f"{label}: invalid PNG header")
        continue
    width, height, depth, color, compression, filtering, interlace = struct.unpack(">IIBBBBB", data[16:29])
    if width < 96 or height < 96:
        errors.append(f"{label}: too small ({width}x{height}); need at least 96x96")
    if color not in (4, 6):
        errors.append(f"{label}: no alpha channel (PNG color type {color})")
    if depth != 8:
        errors.append(f"{label}: expected 8-bit channels, got {depth}")
    if interlace:
        errors.append(f"{label}: interlaced PNG unsupported")
print(f"Checked {len(files)} production PNG sprites in {ASSETS.relative_to(ROOT)}")
if errors:
    print("\n".join("ERROR: " + item for item in errors))
    sys.exit(1)
print("PASS: all existing sprites meet PNG format and minimum-size checks")
