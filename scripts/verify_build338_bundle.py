#!/usr/bin/env python3
"""Check actual compiled CAR names and loose approved resources, not only source files."""
import json
from pathlib import Path
import subprocess

app=Path('DerivedData/Build/Products/Debug-iphonesimulator/OutpostZero.app')
info=json.loads(subprocess.check_output(['xcrun','assetutil','--info',str(app/'Assets.car')],text=True))
names={item.get('Name') for item in info}
expected={f'build338_ground_{family}_{i}' for family in ['outpost','swamp','caves','sanctuary'] for i in range(4)}
expected.add('build338_forest_pool')
for motion,count in [('idle',8),('move',8),('attack',10),('hit',6),('defeat',8)]:
    expected.update(f'mossbot_{motion}_{i:02d}' for i in range(count))
missing=expected-names
if missing: raise SystemExit(f'Missing compiled catalog assets: {sorted(missing)}')
for name in ['outpost_zero_portal_approved_transparent','forest_pine_polished','forest_broadleaf_polished',
             'boss_root_lord','outpost_zero_reactor_approved_transparent']:
    if not list(app.rglob(name+'.png')): raise SystemExit(f'Missing approved bundled resource: {name}')
print(f'PASS: {len(expected)} compiled catalog names, approved round portal, trees, reactor and boss resources')
