#!/usr/bin/env python3
"""Reject blank iOS simulator captures instead of accepting a valid PNG header."""
from pathlib import Path
import struct
import sys
import zlib

PNG = b"\x89PNG\r\n\x1a\n"

def verify(path: Path) -> None:
    data = path.read_bytes()
    if not data.startswith(PNG) or len(data) < 33:
        raise ValueError("invalid PNG header")
    width, height, depth, color, _, _, interlace = struct.unpack(">IIBBBBB", data[16:29])
    if width < 320 or height < 568 or depth != 8 or color not in (2, 6) or interlace:
        raise ValueError(f"unexpected PNG format {width}x{height}, depth={depth}, color={color}")
    channels = 4 if color == 6 else 3
    compressed = bytearray()
    position = 8
    while position + 12 <= len(data):
        length = struct.unpack(">I", data[position:position + 4])[0]
        tag = data[position + 4:position + 8]
        if position + 12 + length > len(data):
            raise ValueError("truncated PNG")
        if tag == b"IDAT":
            compressed.extend(data[position + 8:position + 8 + length])
        position += 12 + length
        if tag == b"IEND":
            break
    raw = zlib.decompress(compressed)
    stride = width * channels
    if len(raw) != (stride + 1) * height:
        raise ValueError("incorrect decoded PNG length")
    previous = bytearray(stride)
    colors = set()
    arena_marker = None
    expected_markers = {
        "outpost-zero-pilot-directions.png": 2,
        "outpost-zero-arena-west.png": 0,
        "outpost-zero-arena-center.png": 1,
        "outpost-zero-arena-east.png": 2,
        # Each defense state receives a DIFFERENT one-hot color. The old
        # shared magenta marker allowed a stale survival frame to pass as
        # a live reactor screenshot, despite the scene being incorrect.
        "outpost-zero-defense-active.png": 0,
        "outpost-zero-defense-cleared.png": 1,
        "outpost-zero-defense-failed.png": 2
    }
    if path.name.startswith("outpost-zero-walk-preview-"):
        expected_markers[path.name] = 2
    is_survival = (path.name.startswith("outpost-zero-survival-") or
                   path.name == "outpost-zero-extraction-open.png")
    # Ignore static phone notch/home bar; sample the game area.
    # A denser grid catches small, moving sprites in intentionally sparse
    # ranged arenas without treating real gameplay as an unrendered frame.
    x_positions = range(width // 8, width * 7 // 8, max(1, width // 40))
    y_step = max(1, height // 35)
    for y in range(height):
        offset = y * (stride + 1)
        mode = raw[offset]
        row = bytearray(raw[offset + 1: offset + 1 + stride])
        if mode == 1:
            for i in range(channels, stride):
                row[i] = (row[i] + row[i - channels]) & 255
        elif mode == 2:
            for i in range(stride):
                row[i] = (row[i] + previous[i]) & 255
        elif mode == 3:
            for i in range(stride):
                row[i] = (row[i] + ((row[i - channels] if i >= channels else 0) + previous[i]) // 2) & 255
        elif mode == 4:
            for i in range(stride):
                left = row[i - channels] if i >= channels else 0
                up = previous[i]
                upper_left = previous[i - channels] if i >= channels else 0
                p = left + up - upper_left
                pa, pb, pc = abs(p - left), abs(p - up), abs(p - upper_left)
                predictor = left if pa <= pb and pa <= pc else (up if pb <= pc else upper_left)
                row[i] = (row[i] + predictor) & 255
        elif mode != 0:
            raise ValueError(f"unsupported PNG filter {mode}")
        if (path.name in expected_markers or is_survival) and y == round(height * 0.40):
            cx = round(width * 0.90)
            arena_marker = tuple(row[cx * channels:cx * channels + 3])
        if height // 7 < y < height * 13 // 14 and y % y_step == 0:
            colors.update(bytes(row[x * channels:x * channels + 3]) for x in x_positions)
        previous = row
    # A blank simulator frame has one battlefield color. Rendered gameplay
    # has scenery, characters, gate and HUD with many distinct colors.
    # A truly blank canvas stays nearly monochrome. Low-prop ranged rooms
    # legitimately produce fewer colors than dense forest/gate screenshots.
    if len(colors) < 15:
        raise ValueError(f"blank or unrendered simulator capture ({len(colors)} sampled colors)")
    if path.name in expected_markers:
        # The simulator sometimes captures the colorful iOS home screen when
        # the game crashed after a successful simctl launch. It must NEVER
        # count as a successful arena visual review. The distinct RGB marker
        # also rejects an unrelated or stale survival/extraction frame.
        channel = expected_markers[path.name]
        if arena_marker is None or arena_marker[channel] < 170 or any(
            arena_marker[other] > 90 for other in range(3) if other != channel
        ):
            raise ValueError(
                f"missing or incorrect arena game identity marker: "
                f"expected RGB channel {channel}, sampled {arena_marker}")
    if is_survival and (
        arena_marker is None or arena_marker[0] < 170 or
        arena_marker[1] > 90 or arena_marker[2] < 170
    ):
        raise ValueError(
            f"not a live survival/extraction capture, marker {arena_marker}")
    print(f"PASS: {path} {width}x{height}, {len(colors)} battlefield colors")

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            raise ValueError("provide at least one screenshot")
        for arg in sys.argv[1:]:
            verify(Path(arg))
    except (OSError, ValueError, zlib.error) as error:
        print(f"ERROR: screenshot verification failed: {error}", file=sys.stderr)
        sys.exit(1)
