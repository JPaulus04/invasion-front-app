#!/usr/bin/env python3
"""Build 339 Vanguard asset gate. Run after adding authored PNG frames."""
from pathlib import Path
import struct
import sys

ROOT = Path(__file__).resolve().parents[1] / "OutpostZero" / "ArtAssets"
STATES = {"idle": 8, "run": 8, "attack": 8, "hit": 4, "defeat": 8, "victory": 8}
errors = []
for state, count in STATES.items():
    for index in range(count):
        path = ROOT / f"vanguard_{state}_{index:02d}.png"
        if not path.is_file():
            errors.append(f"{path.name}: missing")
            continue
        data = path.read_bytes()
        if len(data) < 33 or data[:8] != b"\x89PNG\r\n\x1a\n":
            errors.append(f"{path.name}: invalid PNG signature")
            continue
        width, height, depth, color = struct.unpack_from(">IIBB", data, 16)
        if (width, height, depth, color) != (128, 128, 8, 6):
            errors.append(f"{path.name}: expected 128x128 8-bit RGBA")
if errors:
    print("Build 339 artwork NOT READY:")
    print("\n".join(errors))
    sys.exit(1)
print("Build 339: all 44 RGBA frame files found; inspect alpha, alignment and appearance manually.")
