#!/usr/bin/env python3
"""Inventory shipped enemy sources; contact sheets are source review, not gameplay evidence."""
from pathlib import Path
import argparse
import hashlib
import json
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1]
COUNTS = {'idle': 8, 'move': 8, 'attack': 10, 'hit': 6, 'defeat': 8}


def png_info(path):
    data = path.read_bytes()
    if data[:8] != b'\x89PNG\r\n\x1a\n' or data[12:16] != b'IHDR':
        raise ValueError(f'Invalid PNG: {path}')
    w, h, depth, color = struct.unpack('>IIBB', data[16:26])
    position, compressed, ended = 8, bytearray(), False
    while position + 12 <= len(data):
        length = struct.unpack('>I', data[position:position+4])[0]
        tag = data[position+4:position+8]
        payload = data[position+8:position+8+length]
        if position + length + 12 > len(data):
            raise ValueError(f'Truncated PNG: {path}')
        crc = struct.unpack('>I', data[position+8+length:position+12+length])[0]
        if zlib.crc32(tag + payload) & 0xffffffff != crc:
            raise ValueError(f'PNG CRC mismatch: {path}')
        if tag == b'IDAT': compressed.extend(payload)
        if tag == b'IEND':
            ended = True
            break
        position += length + 12
    if not ended or not compressed:
        raise ValueError(f'Incomplete PNG: {path}')
    decoded = zlib.decompress(compressed)
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}.get(color)
    if depth != 8 or data[28] != 0 or channels is None or len(decoded) != (w*channels+1)*h:
        raise ValueError(f'Unexpected decoded PNG format/length: {path}')
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
    browser = [png_info(p) for p in sorted((ROOT / 'assets/enemies').glob('enemy_*.png'))]
    return {'mossbot_sequences': sequences, 'native_portraits': native, 'boss_portraits': bosses,
            'browser_enemy_portraits_not_native_entities': browser,
            'browser_atlases': [png_info(ROOT / name) for name in
                ['assets/unit-animation-atlas.png', 'assets/visual144/combat-atlas.png']],
            'legacy_native_fallbacks': [png_info(ROOT / name) for name in
                ['OutpostZero/ArtAssets/scout_idle.png', 'OutpostZero/ArtAssets/heavy_idle.png']],
            'other_sources': [str(p.relative_to(ROOT)) for p in
                sorted((ROOT / 'assets/prototype4').glob('Zombie-*.fbx'))],
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
