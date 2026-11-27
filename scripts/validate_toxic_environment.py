"""Validate authored environment candidates; technical checks never grant visual approval."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

# Asset prefixes use display-world numbering, NOT stable gameplay IDs.
# World 2 -> ID 1; World 3 (Frost Expanse) -> ID 3; World 4 (Iron Wastes) -> ID 2.
PROP_KINDS = {
    2: ('tank', 'pipe', 'debris', 'boulder', 'vegetation', 'wall'),
    3: ('ice_crystal', 'frozen_boulder', 'wreckage', 'snowbank', 'frozen_pillar', 'ruin_wall'),
    4: ('scrap_heap', 'broken_machine', 'steel_barrier', 'rusted_tank', 'pipe', 'debris'),
}


def asset_names(world):
    return ([f'world{world}_ground_{i}.png' for i in range(4)],
            [f'world{world}_prop_{kind}.png' for kind in PROP_KINDS[world]])


# Preserve existing import and command-line behavior for Toxic Crossing.
GROUND, PROPS = asset_names(2)


def validate(root, world=2, bundle=None):
    ground_names, prop_names = asset_names(world)
    errors, missing, assets, ground = [], [], {}, {}
    for name in ground_names + prop_names:
        path = root / name
        if not path.is_file():
            missing.append(name)
            continue
        try:
            with Image.open(path) as im:
                im.verify()
            with Image.open(path) as im:
                im.load()
                size = 1024 if name in ground_names else 512
                if im.format != 'PNG' or im.mode != 'RGBA' or im.size != (size, size):
                    raise ValueError(f'expected {size}x{size} RGBA PNG')
                alpha = im.getchannel('A')
                bbox = alpha.getbbox()
                if name in ground_names:
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
    if bundle is not None:
        bundled = {name: [] for name in ground_names + prop_names}
        for path in bundle.rglob('*.png'):
            if path.name in bundled:
                bundled[path.name].append(path)
        for name, copies in bundled.items():
            if len(copies) != 1:
                errors.append(f'{name}: expected one app bundle resource, found {len(copies)}')
            elif name in assets and hashlib.sha256(copies[0].read_bytes()).hexdigest() != assets[name]['sha256']:
                errors.append(f'{name}: app bundle bytes differ from source')
    return {'world_display_number': world, 'assets': assets, 'missing': missing, 'errors': errors, 'edge_comparisons': pairs,
            'technical_complete': not errors and not missing and pairs == 32,
            'visual_approved': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('folder', type=Path)
    parser.add_argument('--world', type=int, choices=sorted(PROP_KINDS), default=2,
                        help='display world number; defaults to Toxic Crossing (2)')
    parser.add_argument('--allow-incomplete', action='store_true', help='candidate review only; never implies completeness')
    parser.add_argument('--bundle', type=Path, help='require byte-identical assets in the built app')
    args = parser.parse_args()
    report = validate(args.folder, args.world, args.bundle)
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if (report['technical_complete'] or (args.allow_incomplete and not report['errors'])) else 1)
