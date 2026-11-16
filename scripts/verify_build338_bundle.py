#!/usr/bin/env python3
"""Check actual compiled CAR names and loose approved resources, not only source files."""
import hashlib
import json
from pathlib import Path
import subprocess
from approved_bundle_pixels import compare_portal_pixels

app=Path('DerivedData/Build/Products/Debug-iphonesimulator/OutpostZero.app')
info=json.loads(subprocess.check_output(['xcrun','assetutil','--info',str(app/'Assets.car')],text=True))
names={item.get('Name') for item in info}
expected={f'build338_ground_{family}_{i}' for family in ['outpost','swamp','caves','sanctuary'] for i in range(4)}
expected.add('build338_forest_pool')
for motion,count in [('idle',8),('move',8),('attack',10),('hit',6),('defeat',8)]:
    expected.update(f'mossbot_{motion}_{i:02d}' for i in range(count))
missing=expected-names
if missing: raise SystemExit(f'Missing compiled catalog assets: {sorted(missing)}')
raw_names={'outpost_zero_portal_approved_transparent','forest_pine_polished','forest_broadleaf_polished',
           'boss_root_lord','outpost_zero_reactor_approved_transparent'}
for family in ['ruined_outpost','swamp_basin','toxic_caves','boss_arena']:
    expected.update(f'world1_{family}_{kind}' for kind in ['floor_1','wall','boulder','vegetation','debris'])
missing=expected-names
if missing: raise SystemExit(f'Missing compiled environment resources: {sorted(missing)}')
raw_hashes={}
for name in sorted(raw_names):
    paths=list(app.rglob(name+'.png'))
    if not paths: raise SystemExit(f'Missing approved bundled resource: {name}')
    raw_hashes[name]=hashlib.sha256(paths[0].read_bytes()).hexdigest()
reference=json.loads(Path('docs/build338/approved-assets.json').read_text())
source=Path('OutpostZero/ArtAssets/outpost_zero_portal_approved_transparent.png')
if hashlib.sha256(source.read_bytes()).hexdigest() != reference['portal_sha256']:
    raise SystemExit('Approved portal source hash changed')
portal_pixels=compare_portal_pixels(source,next(app.rglob(source.name)))
report={'compiled_catalog_names':sorted(expected),'bundled_resource_sha256':raw_hashes,
        'approved_portal_source_hash_matches':True,'bundled_portal_pixels':portal_pixels}
Path('build338-bundle-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'PASS: {len(expected)} compiled catalog names and actual bundled portal appearance: {portal_pixels}')
