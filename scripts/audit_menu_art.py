#!/usr/bin/env python3
"""Audit production menu art before simulator capture.

Missing art is reported separately from malformed art because the UI has
intentional procedural fallbacks during staged asset integration.
"""
from pathlib import Path
import struct
import sys

ROOT = Path("OutpostZero/ArtAssets")
COMMANDERS = ("vanguard", "specter", "bulwark", "volt")
EXPECTED = (
    *(f"commander_{name}_{state}.png" for name in COMMANDERS
      for state in ("card", "locked")),
    "world_forest_island.png",
    "world_ice_island.png",
    "world_lava_island.png",
    "world_void_island.png",
)
missing = []
errors = []
for name in EXPECTED:
    path = ROOT / name
    if not path.is_file():
        missing.append(name)
        continue
    data = path.read_bytes()
    if len(data) < 33 or data[:8] != b"\x89PNG\r\n\\x1a\n":
        errors.append(f"{name}: not a PNG")
        continue
    width, height, bit_depth, color_type = struct.unpack(">IIBB", data[16:26])
    if width < 64 or height < 64:
        errors.append(f"{name}: resolution {width}x{height} is too small")
    if color_type not in (4, 6):
        errors.append(f"{name}: no alpha channel (PNG color type {color_type})")
    print(f"MENU ART: {name}: {width}x{height}, color type {color_type}")
print(f"MENU ART: {len(EXPECTED)-len(missing)}/{len(EXPECTED)} assets present")
for name in missing:
    print(f"::warning::Menu artwork not uploaded: {name}")
for issue in errors:
    print(f"::error::Menu artwork invalid: {issue}")
if errors or (missing and "--require-all" in sys.argv):
    sys.exit(1)
