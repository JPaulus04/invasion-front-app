#!/usr/bin/env python3
"""Derive reusable periodic materials from approved artwork, never whole arena paintings.

This is deterministic texture processing, not newly generated replacement art.
All variants share an identical edge band; unrotated neighboring cells match.
"""
from pathlib import Path
import hashlib
import json
import math
import random
from PIL import Image, ImageChops, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SIZE = 1024
SOURCE = ROOT / 'OutpostZero/ArtAssets/world1_overgrown_stone_arena.png'
CROP = (280, 200, 1256, 824)  # excludes baked wall/portal/arena border
THEMES = {'outpost': (1.0, 1.0, 1.0), 'swamp': (.77, .88, .82),
          'caves': (.72, .76, .81), 'sanctuary': (.94, .92, .77)}


def quilt(source, seed):
    rng = random.Random(seed)
    canvas = Image.new('RGB', (SIZE, SIZE), (69, 83, 48))
    # Periodic overlapping authored patches preserve native stone density.
    # Soft overlapping boundaries avoid turning the painting into a tile grid.
    for y in range(-128, SIZE, 128):
        for x in range(-128, SIZE, 128):
            edge = rng.choice([256, 288, 320])
            sx = rng.randrange(source.width-edge)
            sy = rng.randrange(source.height-edge)
            patch = source.crop((sx, sy, sx+edge, sy+edge))
            if rng.randrange(2): patch = patch.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            mask = Image.new('L', (edge, edge), 0)
            inner = Image.new('L', (edge-72, edge-72), 255)
            mask.paste(inner, (36, 36))
            mask = mask.filter(ImageFilter.GaussianBlur(18))
            px, py = x + rng.randrange(-28, 29), y + rng.randrange(-28, 29)
            for ox in [-SIZE, 0, SIZE]:
                for oy in [-SIZE, 0, SIZE]:
                    xx, yy = px+ox, py+oy
                    if xx < SIZE and yy < SIZE and xx+edge > 0 and yy+edge > 0:
                        canvas.paste(patch, (xx, yy), mask)
    # Each patch is pasted across the toroidal boundary in the same order.
    # The common collar below guarantees that different variants also join.
    return canvas


def periodic(image):
    # The quilt already wraps; do not mirror quadrants. Mirroring introduced
    # conspicuous paired stone seams in the first actual simulator capture.
    # Match only the outermost samples to make filtering at cell edges exact.
    out = image.copy()
    column = Image.blend(out.crop((0,0,1,SIZE)),out.crop((SIZE-1,0,SIZE,SIZE)),0.5)
    out.paste(column,(0,0));out.paste(column,(SIZE-1,0))
    row = Image.blend(out.crop((0,0,SIZE,1)),out.crop((0,SIZE-1,SIZE,SIZE)),0.5)
    out.paste(row,(0,0));out.paste(row,(0,SIZE-1))
    return out


def main():
    source = Image.open(SOURCE).convert('RGB').crop(CROP)
    common = periodic(quilt(source, 338))
    collar = Image.new('L', (SIZE, SIZE))
    collar.putdata([round(255*min(1, max(0, (min(x, y, SIZE-1-x, SIZE-1-y)-24)/72)))
                    for y in range(SIZE) for x in range(SIZE)])
    outputs = []
    secondary_sources = {}
    previews = Image.new('RGB', (4*256, 4*256))
    for row, (theme, tint) in enumerate(THEMES.items()):
        for variant in range(4):
            center = quilt(source, 33800 + variant*73)
            material = Image.composite(center, common, collar)
            # Worn paving transitions into actual authored soil/moss, not
            # separate grass decals or geometrical missing-stone rectangles.
            family = {'outpost':'ruined_outpost', 'swamp':'swamp_basin',
                      'caves':'toxic_caves', 'sanctuary':'boss_arena'}[theme]
            soil_path = ROOT / f'OutpostZero/Assets.xcassets/world1_{family}_floor_1.imageset/world1_{family}_floor_1.png'
            secondary_sources[str(soil_path.relative_to(ROOT))] = hashlib.sha256(soil_path.read_bytes()).hexdigest()
            soil_source = Image.open(soil_path).convert('RGB').crop((32,100,480,660))
            soil = quilt(soil_source, 8338+variant*29)
            rng = random.Random(77338+variant*31)
            small = Image.new('L', (8,8))
            small.putdata([rng.randrange(256) for _ in range(64)])
            worn = small.resize((SIZE,SIZE), Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(20))
            worn = worn.point(lambda v: min(210,max(0,(v-115)*2)))
            center = Image.composite(soil, material, worn)
            # Preserve exactly the same common edge collar for every variant.
            material = Image.composite(center, material, collar)
            channels = material.split()
            material = Image.merge('RGB', tuple(channel.point(lambda v, factor=factor: round(v*factor))
                                                for channel, factor in zip(channels, tint)))
            name = f'build338_ground_{theme}_{variant}'
            folder = ROOT / 'OutpostZero/Assets.xcassets' / f'{name}.imageset'
            folder.mkdir(exist_ok=True)
            path = folder / f'{name}.png'
            material.convert('RGBA').save(path, optimize=True)
            (folder / 'Contents.json').write_text(json.dumps({'images': [{'idiom': 'universal', 'filename': path.name}],
                'info': {'author': 'xcode', 'version': 1}}, indent=2)+'\n')
            outputs.append({'name': name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
            previews.paste(material.resize((256, 256)), (variant*256, row*256))
    target = ROOT / 'docs/build338'
    target.mkdir(exist_ok=True)
    previews.save(target / 'derived-materials-source-preview.jpg', quality=92)
    (target / 'ground-provenance.json').write_text(json.dumps({'source': str(SOURCE.relative_to(ROOT)),
        'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'source_crop': CROP,
        'secondary_sources_sha256': secondary_sources,
        'pixels_per_world_point': 2, 'cell_world_size': 512, 'shared_edge_pixels': 24,
        'note': 'Derived material preview only; not simulator or gameplay evidence.', 'outputs': outputs}, indent=2)+'\n')
    print(f'Baked {len(outputs)} authored-pixel materials with shared periodic edges')


if __name__ == '__main__': main()
