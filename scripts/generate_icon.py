#!/usr/bin/env python3
"""Generate an original 1024px opaque Outpost Zero app icon using Python stdlib."""
from pathlib import Path
import struct
import zlib

SIZE = 1024
output = Path(__file__).resolve().parents[1] / "OutpostZero/Assets.xcassets/AppIcon.appiconset/AppIcon.png"
output.parent.mkdir(parents=True, exist_ok=True)

def pixel(x, y):
    # Night-blue gradient and subtle grid
    t = y / SIZE
    r, g, b = int(13 + 15 * t), int(36 + 20 * t), int(56 + 24 * t)
    if x % 128 < 3 or y % 128 < 3:
        r, g, b = r + 5, g + 9, b + 10
    # Orange warning ring around defensive tower
    dx, dy = x - 512, y - 510
    radius2 = dx * dx + dy * dy
    if 275 ** 2 <= radius2 <= 320 ** 2:
        r, g, b = 255, 177, 52
    if radius2 < 260 ** 2:
        r, g, b = 37, 83, 100
    # Tower base
    if 350 <= x <= 674 and 560 <= y <= 715:
        r, g, b = 38, 59, 76
    if 365 <= x <= 659 and 575 <= y <= 695:
        r, g, b = 86, 149, 166
    # Turret barrel and center
    if 478 <= x <= 546 and 260 <= y <= 510:
        r, g, b = 237, 188, 73
    if (x - 512) ** 2 + (y - 525) ** 2 <= 120 ** 2:
        r, g, b = 23, 39, 55
    if (x - 512) ** 2 + (y - 525) ** 2 <= 82 ** 2:
        r, g, b = 250, 191, 62
    if (x - 512) ** 2 + (y - 525) ** 2 <= 47 ** 2:
        r, g, b = 24, 48, 64
    return bytes((r, g, b, 255))

def chunk(tag, data):
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)

compressor = zlib.compressobj(level=6)
compressed = []
for y in range(SIZE):
    row = b"\x00" + b"".join(pixel(x, y) for x in range(SIZE))
    compressed.append(compressor.compress(row))
compressed.append(compressor.flush())
png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0))
png += chunk(b"IDAT", b"".join(compressed))
png += chunk(b"IEND", b"")
output.write_bytes(png)
print(f"Generated original app icon: {output} ({len(png)} bytes)")
