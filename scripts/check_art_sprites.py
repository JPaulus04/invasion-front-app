#!/usr/bin/env python3
"""Validate production PNG sprites without third-party dependencies."""
from pathlib import Path
import struct
import sys
import zlib

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "OutpostZero" / "ArtAssets"
PNG = b"\x89PNG\r\n\x1a\n"
def alpha_range(data, width, height, color):
    """Decode PNG scanline filters and report minimum/maximum actual alpha."""
    channels = 4 if color == 6 else 2
    stride = width * channels
    offset = 8
    compressed = bytearray()
    while offset + 12 <= len(data):
        size = struct.unpack(">I", data[offset:offset + 4])[0]
        kind = data[offset + 4:offset + 8]
        end = offset + 12 + size
        if end > len(data):
            raise ValueError("truncated PNG chunk")
        if kind == b"IDAT":
            compressed.extend(data[offset + 8:offset + 8 + size])
        offset = end
        if kind == b"IEND":
            break
    raw = zlib.decompress(compressed)
    if len(raw) != height * (stride + 1):
        raise ValueError("unexpected decoded pixel length")
    prev = bytearray(stride)
    minimum, maximum = 255, 0
    pos = 0
    for _ in range(height):
        filt = raw[pos]
        pos += 1
        row = bytearray(raw[pos:pos + stride])
        pos += stride
        if filt not in (0, 1, 2, 3, 4):
            raise ValueError("invalid PNG filter")
        for i in range(stride):
            left = row[i - channels] if i >= channels else 0
            up = prev[i]
            upper_left = prev[i - channels] if i >= channels else 0
            if filt == 1:
                predictor = left
            elif filt == 2:
                predictor = up
            elif filt == 3:
                predictor = (left + up) // 2
            elif filt == 4:
                p = left + up - upper_left
                distances = (abs(p - left), abs(p - up), abs(p - upper_left))
                predictor = (left, up, upper_left)[distances.index(min(distances))]
            else:
                predictor = 0
            row[i] = (row[i] + predictor) & 255
        alpha = row[channels - 1::channels]
        minimum = min(minimum, min(alpha))
        maximum = max(maximum, max(alpha))
        prev = row
    return minimum, maximum


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
    # Floor illustrations are full-bleed opaque backgrounds; props and
    # characters must have transparent cutout edges. Do not reject valid
    # authored floor artwork for lacking transparency.
    is_floor = "_floor_" in path.stem or path.stem.endswith("_floor")
    allowed_colors = (2, 6) if is_floor else (4, 6)
    if color not in allowed_colors:
        errors.append(f"{label}: unexpected PNG color type {color} for {'floor' if is_floor else 'sprite'}")
    if depth != 8:
        errors.append(f"{label}: expected 8-bit channels, got {depth}")
    if interlace:
        errors.append(f"{label}: interlaced PNG unsupported")
    if color in (4, 6) and depth == 8 and not interlace:
        try:
            minimum, maximum = alpha_range(data, width, height, color)
            if not is_floor and minimum != 0:
                errors.append(f"{label}: no fully transparent pixels; background may be baked in")
            if maximum != 255:
                errors.append(f"{label}: no fully opaque pixels; artwork may be faint or empty")
        except (ValueError, zlib.error) as exc:
            errors.append(f"{label}: cannot decode transparency: {exc}")
print(f"Checked {len(files)} production PNG sprites in {ASSETS.relative_to(ROOT)}")
if errors:
    print("\n".join("ERROR: " + item for item in errors))
    sys.exit(1)
print("PASS: existing sprites meet PNG format, minimum-size, and pixel-transparency checks")
