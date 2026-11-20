#!/usr/bin/env python3
"""Verify every original animation payload really exists in the built app."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

p=argparse.ArgumentParser();p.add_argument('app',type=Path);a=p.parse_args()
report=json.loads(Path('docs/build339/asset-inventory.json').read_text());verified=[]
for frame in report['frames']:
    relative=frame['path'].removeprefix('assets/');file=a.app/relative
    if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest()!=frame['sha256']:
        raise SystemExit(f'Missing/changed actual bundled animation: {relative}')
    with Image.open(file) as im:
        im.load()
        if im.size!=(frame['pixels'],frame['pixels']) or im.mode!='RGBA':raise SystemExit(f'Invalid bundled PNG: {relative}')
    verified.append(relative)
Path('build339-bundle.json').write_text(json.dumps({'verified':verified,'count':len(verified),
    'original_png_bytes_preserved':True,'quarantined_but_bundled':report['quarantined']},indent=2)+'\n')
print(f'PASS: all {len(verified)} PNGs are present in the compiled app, byte-identical to approved uploads')
