#!/usr/bin/env python3
"""Check the committed iOS icon before the project's existing build steps."""
from pathlib import Path
import struct

icon = Path(__file__).resolve().parents[1] / "OutpostZero/Assets.xcassets/AppIcon.appiconset/AppIcon.png"
header = icon.read_bytes()[:29]
if header[:16] != b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR":
    raise SystemExit(f"Invalid app icon PNG: {icon}")
width, height, depth, color = struct.unpack(">IIBB", header[16:26])
if (width, height, depth, color) != (1024, 1024, 8, 2):
    raise SystemExit("App icon must be a 1024×1024 opaque 8-bit RGB PNG")
print(f"Validated iOS app icon: {icon}")
