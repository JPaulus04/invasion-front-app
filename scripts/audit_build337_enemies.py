#!/usr/bin/env python3
"""Inventory shipped enemy sources; contact sheets are source review, not gameplay evidence."""
from pathlib import Path
import argparse
import hashlib
import json
import struct

ROOT = Path(__file__).resolve().parents[1]
COUNTS = {'idle': 8, 'move': 8, 'attack': 10, 'hit': 6, 'defeat': 8}


def png_info(path):
    data = path.read_bytes()
    if data[:8] != b'\x89PNG\r\n\x1a\n' or data[12:16] != b'IHDR':
        raise ValueError(f'Invalid PNG: {path}')
    w, h, depth, color = struct.unpack('>IIBB', data[16:26])
    return {'path': str(path.relative_to(ROOT)), 'width': w, 'height': h,
            'depth': depth, 'color_type': color, 'sha256': hashlib.sha256(data).hexdigest()}


def audit():
    sequences = {}
    for motion, count in COUNTS.items():
        frames = []
        for index in range(count):
            name = f'mossbot_{motion}_{index:02d}'
            folder = ROOT / 'OutpostZero/Assets.xcassets' / f'{name}.imageset'
            path = folder / f'{name}.png'
            info = png_info(path)
            if (info['width'], info['height'], info['depth'], info['color_type']) != (512, 512, 8, 6):
                raise ValueError(f'Incorrect Mossbot format: {path}')
            images = json.loads((folder / 'Contents.json').read_text())['images']
            if not any(x.get('filename') == path.name and x.get('idiom') == 'universal' for x in images):
                raise ValueError(f'Unregistered frame: {path}')
            frames.append(info)
        extras = list((ROOT / 'OutpostZero/Assets.xcassets').glob(f'mossbot_{motion}_*.imageset'))
        if len(extras) != count:
            raise ValueError(f'Unexpected sequence frames: {motion}')
        sequences[motion] = frames
    roles = ['grunt', 'scout', 'raider', 'heavy', 'shooter', 'lobber']
    native = {role: png_info(ROOT / f'OutpostZero/ArtAssets/{role}_polished.png') for role in roles}
    bosses = {role: png_info(ROOT / f'OutpostZero/ArtAssets/boss_{role}.png')
              for role in ['root_lord', 'toxic_matriarch', 'warforge', 'frost_wraith']}
    browser = [png_info(p) for p in sorted((ROOT / 'assets/enemies').glob('*.png'))]
    return {'mossbot_sequences': sequences, 'native_portraits': native, 'boss_portraits': bosses,
            'browser_enemy_portraits_not_native_entities': browser,
            'other_sources': ['assets/unit-animation-atlas.png', 'assets/prototype4/Zombie-Scout.fbx'],
            'source_defects': {
                'move_00_to_07': 'Left arm clipped at x=56; unrelated right-edge fragments beyond x=416. Runtime masks only the unrelated strip; artist re-export required for lost arm pixels.',
                'attack_03_to_06': 'Character/effect abruptly cut along left boundary x=54/56; cannot reconstruct missing approved pixels.',
                'defeat_03_to_06': 'Collapse intersects canvas bottom; confirm sinking/cropping is intentional with artist.',
                'defeat_07': 'Fully transparent final frame, retained as authored terminal disappearance.'},
            'unavailable_authored_sequences': {r: 'Only one portrait; no idle/move/attack/hit/defeat frame sequences or directional sheets found.' for r in roles + list(bosses)}}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = audit()
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(f"PASS: {sum(map(len, result['mossbot_sequences'].values()))} catalog frames, {len(result['native_portraits'])} native roles, {len(result['boss_portraits'])} bosses, {len(result['browser_enemy_portraits_not_native_entities'])} separate browser roles")
