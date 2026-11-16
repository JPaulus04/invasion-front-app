#!/usr/bin/env python3
"""Supplement approved paving with authored, transparent moss/soil banks.

Existing paving and source artwork are never rewritten. Every patch stays at
two source pixels per world point; only its alpha boundary is derived.
"""
from pathlib import Path
import hashlib
import json
import math
import random
from PIL import Image, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SOURCES={
    'outpost':['ruined_outpost_floor_2','boss_arena_floor_3'],
    'swamp':['swamp_basin_floor_2','swamp_basin_floor_3'],
    'caves':['toxic_caves_floor_2','toxic_caves_floor_3'],
    'sanctuary':['ruined_outpost_floor_3','boss_arena_floor_2'],
}


def main():
    inputs={};outputs=[]
    preview=Image.new('RGB',(1024,1024),'#314330')
    for row,(theme,names) in enumerate(SOURCES.items()):
        for variant,name in enumerate(names):
            source=ROOT/f'OutpostZero/Assets.xcassets/world1_{name}.imageset/world1_{name}.png'
            inputs[str(source.relative_to(ROOT))]=hashlib.sha256(source.read_bytes()).hexdigest()
            material=Image.open(source).convert('RGBA').crop((0,128,512,640))
            alpha=Image.new('L',(512,512));values=[]
            rng=random.Random(33870+row*17+variant*83)
            noise=Image.new('L',(9,9));noise.putdata([rng.randrange(256) for _ in range(81)])
            noise=noise.resize((512,512),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(15))
            for y in range(512):
                v=(y-255.5)/255.5
                for x in range(512):
                    u=(x-255.5)/255.5
                    # Uneven soil banks and frayed grass margins. The coarse
                    # erosion field avoids geometric stamps or repeated glyphs.
                    bend=.18*math.sin(v*3.8+variant*1.3)
                    radius=math.sqrt(((u-bend)*(.88+variant*.08))**2+(v*.91)**2)
                    erosion=(noise.getpixel((x,y))/255-.5)*.38
                    strength=max(0,min(1,(.78-radius+erosion)/.20))
                    values.append(round(255*strength*strength*(3-2*strength)))
            alpha.putdata(values)
            alpha=alpha.filter(ImageFilter.GaussianBlur(5))
            # Exactly transparent borders make each bank an isolated overlay.
            edge=Image.new('L',(512,512));edge.putdata([
                min(255,max(0,min(x,y,511-x,511-y)*24)) for y in range(512) for x in range(512)])
            from PIL import ImageChops
            material.putalpha(ImageChops.multiply(alpha,edge))
            asset=f'build338_reclaim_{theme}_{variant}'
            folder=ROOT/f'OutpostZero/Assets.xcassets/{asset}.imageset';folder.mkdir(exist_ok=True)
            target=folder/(asset+'.png');material.save(target,optimize=True)
            (folder/'Contents.json').write_text(json.dumps({'images':[{'idiom':'universal','filename':target.name}],
                'info':{'author':'xcode','version':1}},indent=2)+'\n')
            outputs.append({'asset':asset,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
            thumb=material.resize((512,256));preview.paste(thumb,(variant*512,row*256),thumb)
    docs=ROOT/'docs/build338/polish';docs.mkdir(exist_ok=True)
    (docs/'reclamation-provenance.json').write_text(json.dumps({'inputs_sha256':inputs,'outputs':outputs,
        'pixels_per_world_point':2,'texture_pixels':512,'world_size':256,
        'note':'Authored soil/moss pixels with derived alpha; original paving and source art unchanged.'},indent=2)+'\n')
    preview.save(docs/'reclamation-material-preview.jpg',quality=93)
    print('Baked 8 supplemental reclamation banks; approved paving unchanged')


if __name__=='__main__':main()
