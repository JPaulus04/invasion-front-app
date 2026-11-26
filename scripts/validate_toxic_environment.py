"""Validate Toxic Crossing candidate PNGs; this does not grant visual approval."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

GROUND = [f'world2_ground_{i}.png' for i in range(4)]
PROPS = [f'world2_prop_{kind}.png' for kind in ('tank', 'pipe', 'debris', 'boulder', 'vegetation', 'wall')]


def validate(root):
    errors, missing, assets, ground = [], [], {}, {}
    for name in GROUND + PROPS:
        path = root / name
        if not path.is_file():
            missing.append(name)
            continue
        try:
            with Image.open(path) as im:
                im.verify()
            with Image.open(path) as im:
                im.load()
                size = 1024 if name in GROUND else 512
                if im.format != 'PNG' or im.mode != 'RGBA' or im.size != (size, size):
                    raise ValueError(f'expected {size}x{size} RGBA PNG')
                alpha = im.getchannel('A')
                bbox = alpha.getbbox()
                if name in GROUND:
                    if alpha.getextrema() != (255, 255):
                        raise ValueError('ground must be opaque')
                    ground[name] = {side: im.crop(rect).tobytes() for side, rect in {
                        'left': (0, 0, 1, size), 'right': (size-1, 0, size, size),
                        'top': (0, 0, size, 1), 'bottom': (0, size-1, size, size)}.items()}
                else:
                    if not bbox or min(bbox[0], bbox[1], size-bbox[2], size-bbox[3]) < 8:
                        raise ValueError('prop is empty or has less than 8px transparent clearance')
                    minimum = max(1, round((bbox[2]-bbox[0]) * 0.05))
                    rows = [y for y in range(size) if sum(v >= 128 for v in alpha.crop((0,y,size,y+1)).getdata()) >= minimum]
                    if not rows or abs(rows[-1]-479) > 1:
                        raise ValueError('visible ground contact must be row 479 +/- 1')
                assets[name] = {'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'alpha_bbox': bbox}
        except (OSError, ValueError, SyntaxError) as exc:
            errors.append(f'{name}: {exc}')
    pairs = 0
    for a, ae in ground.items():
        for b, be in ground.items():
            for start, end in [('right','left'), ('bottom','top')]:
                pairs += 1
                if ae[start] != be[end]:
                    errors.append(f'edge mismatch: {a} {start} / {b} {end}')
    return {'assets': assets, 'missing': missing, 'errors': errors, 'edge_comparisons': pairs,
            'technical_complete': not errors and not missing and pairs == 32,
            'visual_approved': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('folder', type=Path)
    parser.add_argument('--allow-incomplete', action='store_true', help='candidate review only; never implies completeness')
    args = parser.parse_args()
    report = validate(args.folder)
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if (report['technical_complete'] or (args.allow_incomplete and not report['errors'])) else 1)
