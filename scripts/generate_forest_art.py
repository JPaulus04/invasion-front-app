#!/usr/bin/env python3
"""Generate a layered, transparent cartoon conifer for Frontier Forest."""
import math
import pathlib
import struct
import zlib

W, H = 160, 208
pixels = bytearray(W * H * 4)

def paint(x, y, rgba):
    if not (0 <= x < W and 0 <= y < H):
        return
    p = (y * W + x) * 4
    alpha = rgba[3] / 255.0
    old_alpha = pixels[p + 3] / 255.0
    total = alpha + old_alpha * (1 - alpha)
    if total <= 0:
        return
    for k in range(3):
        pixels[p + k] = round((rgba[k] * alpha + pixels[p + k] * old_alpha * (1 - alpha)) / total)
    pixels[p + 3] = round(total * 255)

def polygon(points, color):
    ymin = max(0, int(min(y for _, y in points)))
    ymax = min(H, int(max(y for _, y in points)) + 1)
    for y in range(ymin, ymax):
        intersections = []
        for a, b in zip(points, points[1:] + points[:1]):
            x1, y1 = a
            x2, y2 = b
            if (y1 <= y + .5 < y2) or (y2 <= y + .5 < y1):
                intersections.append(x1 + (y + .5 - y1) * (x2 - x1) / (y2 - y1))
        intersections.sort()
        for lo, hi in zip(intersections[::2], intersections[1::2]):
            for x in range(max(0, math.ceil(lo)), min(W, math.ceil(hi))):
                paint(x, y, color)

def ellipse(cx, cy, rx, ry, color):
    for y in range(max(0, int(cy - ry)), min(H, int(cy + ry) + 1)):
        width = rx * math.sqrt(max(0, 1 - ((y - cy) / ry) ** 2))
        for x in range(max(0, int(cx - width)), min(W, int(cx + width) + 1)):
            paint(x, y, color)

# Canvas is top-down. A subtle dark silhouette creates a bold illustrated edge.
ellipse(80, 197, 35, 7, (12, 40, 38, 68))
polygon([(72, 92), (90, 92), (92, 192), (83, 200), (70, 195)], (36, 49, 48, 255))
polygon([(76, 94), (86, 94), (85, 192), (77, 193)], (112, 81, 56, 255))
polygon([(78, 105), (81, 108), (80, 184), (77, 185)], (161, 113, 72, 255))

# Layered irregular branch tiers, dark outline, shade, then sunlit left facets.
tiers = [(9, 79, 32), (35, 104, 49), (63, 130, 63), (92, 156, 74), (119, 182, 78)]
for index, (top, bottom, half) in enumerate(tiers):
    lean = [-2, 2, -1, 3, 0][index]
    cx = 80 + lean
    edge = [
        (cx, top - 4), (cx + 11, top + 20), (cx + half // 2, bottom - 24),
        (cx + half + 4, bottom - 4), (cx + half // 2, bottom - 7),
        (cx + 15, bottom - 2), (cx - 7, bottom - 5),
        (cx - half // 2, bottom - 1), (cx - half - 5, bottom - 4),
        (cx - half // 2, bottom - 24), (cx - 10, top + 18)
    ]
    polygon(edge, (14, 54, 52, 255))
    polygon([(cx, top), (cx + 9, top + 22), (cx + half - 2, bottom - 9),
             (cx + 10, bottom - 7), (cx - half + 4, bottom - 9),
             (cx - 8, top + 20)], (27, 100 + index * 2, 79, 255))
    polygon([(cx - 4, top + 6), (cx - 13, top + 27),
             (cx - half + 13, bottom - 12), (cx - 14, bottom - 16),
             (cx + 1, bottom - 11)], (48, 145 + index * 2, 104, 255))
    polygon([(cx - 8, top + 25), (cx - half // 2, bottom - 27),
             (cx - half + 17, bottom - 14), (cx - half // 2 + 10, bottom - 22)],
            (91, 178, 125, 255))
    polygon([(cx + 7, top + 28), (cx + half - 12, bottom - 13),
             (cx + 18, bottom - 17)], (17, 77, 73, 210))
    # Short diagonal branch facets avoid the flat triangle silhouette.
    for branch in range(3):
        offset = 17 + branch * 13
        yy = min(bottom - 15, top + offset)
        extent = (yy - top) / (bottom - top) * half
        polygon([(cx - 5, yy - 7), (cx - extent + 8, yy + 8),
                 (cx - extent + 17, yy + 5)], (117, 192, 136, 220))
        polygon([(cx + 5, yy - 6), (cx + extent - 7, yy + 8),
                 (cx + extent - 18, yy + 5)], (12, 67, 68, 200))

def chunk(tag, data):
    return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

raw = b''.join(b'\x00' + pixels[y * W * 4:(y + 1) * W * 4] for y in range(H))
png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
out = pathlib.Path('OutpostZero/ArtAssets/forest_pine.png')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_bytes(png)
print('Generated', out, W, H)

# A second environment silhouette: broadleaf canopy, warm trunk, rounded leaves.
# Reuse the same palette, canvas, and PNG encoder as the pine above.
pixels = bytearray(W * H * 4)
polygon([(69, 105), (93, 106), (94, 173), (105, 191), (95, 198),
         (83, 186), (78, 200), (70, 196), (61, 190), (68, 171)], (30, 44, 43, 255))
polygon([(73, 111), (87, 109), (89, 174), (98, 189), (90, 189),
         (82, 180), (77, 193), (68, 187), (76, 171)], (114, 78, 53, 255))
polygon([(76, 119), (81, 117), (82, 176), (78, 184), (74, 174)], (170, 111, 65, 255))
polygon([(67, 138), (45, 120), (49, 114), (75, 131)], (41, 54, 43, 255))
polygon([(92, 133), (112, 114), (119, 118), (94, 143)], (43, 50, 42, 255))
# Chunky overlapping lobes produce an organic silhouette, not a pine triangle.
lobes = [(45, 91, 34, 35), (66, 53, 37, 34), (103, 57, 36, 35),
         (123, 89, 34, 37), (91, 107, 53, 40), (69, 86, 50, 49)]
for x, y, rx, ry in lobes:
    ellipse(x, y + 3, rx + 4, ry + 3, (15, 54, 52, 255))
for x, y, rx, ry in lobes:
    ellipse(x, y, rx, ry, (34, 107, 76, 255))
# Off-centre light catches and dark underside layers create canopy volume.
for x, y, rx, ry in [(40, 75, 19, 16), (61, 44, 21, 15),
                     (100, 47, 21, 18), (123, 79, 18, 18),
                     (77, 77, 23, 19), (91, 101, 27, 13)]:
    ellipse(x - 4, y - 4, rx, ry, (70, 149, 98, 255))
for x, y, rx, ry in [(46, 66, 12, 8), (67, 34, 15, 8),
                     (105, 37, 12, 9), (116, 71, 11, 8),
                     (77, 65, 13, 10), (69, 89, 15, 7)]:
    ellipse(x - 3, y, rx, ry, (121, 184, 116, 255))
for x, y, rx, ry in [(39, 113, 22, 9), (75, 122, 30, 12),
                     (120, 105, 21, 11)]:
    ellipse(x, y, rx, ry, (18, 75, 66, 195))
# Broken highlights: small individual leaf groups, not a smooth green ball.
for x, y in [(38, 57), (58, 27), (95, 29), (123, 59),
             (49, 87), (78, 51), (106, 88)]:
    polygon([(x - 6, y + 3), (x, y - 4), (x + 8, y + 1),
             (x + 1, y + 7)], (153, 200, 129, 245))
raw = b''.join(b'\x00' + pixels[y * W * 4:(y + 1) * W * 4] for y in range(H))
png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
out = pathlib.Path('OutpostZero/ArtAssets/forest_broadleaf.png')
out.write_bytes(png)
print('Generated', out, W, H)
