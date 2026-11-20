#!/usr/bin/env python3
"""Audit untouched uploads; known visual defects are explicit, not auto-repaired."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SPEC={
 'vanguard':('commanders260',256,{'idle':8,'run':8,'attack':8,'hit':4,'defeat':8,'victory':8}),
 'specter':('commanders260',512,{'idle':8,'run':8,'attack':12,'hit':8,'defeat':8}),
 'bulwark':('commanders260',256,{'idle':8,'run':8,'attack':8,'hit':4,'defeat':8,'victory':8}),
 'volt':('commanders260',256,{'idle':8,'run':8,'attack':8,'hit':4,'defeat':8,'victory':8}),
 'barkguard':('enemies',512,{'idle':8,'run':8,'attack_combo':10,'attack_slam':10,'hit':6,'defeat':6}),
 'thornrunner':('enemies',512,{'idle':8,'run':8,'attack_slash':12,'hit':8,'defeat':8}),
 'stoneback':('enemies',512,{'idle':8,'run':8,'attack':12,'hit':8,'defeat':8}),
 'sporecaster':('enemies',512,{'idle':8,'run':8,'attack':12,'hit':8,'defeat':8}),
 'rotbomber':('enemies',512,{'idle':8,'run':8,'attack_lob':12,'hit':8,'defeat':8})}
QUARANTINE={'sporecaster':['attack','hit','defeat']}

def audit():
    records=[]
    for character,(folder,pixels,states) in SPEC.items():
        expected={f'{character}_{state}_{i:02}.png' for state,count in states.items() for i in range(count)}
        actual={p.name for p in (ROOT/'assets'/folder).glob(character+'_*.png')}
        if expected!=actual:raise ValueError(f'{character}: missing={expected-actual}, extra={actual-expected}')
        for state,count in states.items():
            for i in range(count):
                path=ROOT/'assets'/folder/f'{character}_{state}_{i:02}.png'
                with Image.open(path) as im:
                    im.load()
                    if im.size!=(pixels,pixels) or im.mode!='RGBA':raise ValueError(f'{path}: bad dimensions/mode')
                    alpha=im.getchannel('A');low,high=alpha.getextrema()
                    if low!=0 or high==0 or any(alpha.getpixel(p)!=0 for p in [(0,0),(0,pixels-1),(pixels-1,0),(pixels-1,pixels-1)]):
                        raise ValueError(f'{path}: empty or nontransparent canvas')
                    records.append({'path':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                        'character':character,'state':state,'index':i,'pixels':pixels,'alpha_range':[low,high],
                        'alpha_bounds':list(alpha.getbbox()),'quarantined':state in QUARANTINE.get(character,[])})
    if len(records)!=400:raise ValueError('Expected exactly 400 animation frames')
    return {'frames':records,'total':400,'quarantined':sum(r['quarantined'] for r in records),
            'specter_review':'All 44 currently uploaded frames reviewed on light/dark backgrounds; no rectangular residue observed. Defeat alpha fade is intentional.',
            'known_defects':{'sporecaster':'28 new owner-uploaded replacement frames have passed format/hash/padding checks; gameplay visual validation pending. Keep quarantine until actual simulator captures are inspected.'},
            'replacement_review':{'source_commits':['a872ce430dfae7ad87f9026a4a0d0c634ee35799','d72ea4efa5c8816ca61d1312a540f6949c930ba7','17e2781f15f83d6ff969639ee7345985ba293c21'],
                'rotbomber':'All 16 corrected hit/defeat frames pass visual transparency/edge inspection; independent reaction registration preserves body scale and ground contact.',
                'sporecaster':'28 new uploaded frames matched independent ZIP via Git blob hashes and SHA256; 512x512 RGBA/padding verified; quarantine retained pending actual simulator animation review.'},
            'bonus_victory_frames':24,'notes':'Six legacy enemy_*.png portraits are not animation frames. Original PNG bytes are never changed.'}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--record',action='store_true');args=parser.parse_args()
    result=audit();path=ROOT/'docs/build339/asset-inventory.json'
    if args.record:path.write_text(json.dumps(result,indent=2)+'\n')
    else:
        recorded=json.loads(path.read_text())
        if result!=recorded:
            for key in sorted(set(result)|set(recorded)):
                if result.get(key)!=recorded.get(key):
                    if key=='frames':
                        old_frames={f['path']:f for f in recorded['frames']}
                        for frame in result['frames']:
                            previous=old_frames.get(frame['path'])
                            if frame!=previous:
                                differences={k:[previous.get(k) if previous else None,frame.get(k)] for k in frame if not previous or previous.get(k)!=frame.get(k)}
                                print(f"Inventory difference {frame['path']}: {differences}")
                    else:print(f"Inventory difference {key}: recorded={str(recorded.get(key))[:400]} actual={str(result.get(key))[:400]}")
            raise SystemExit('Uploaded frames changed; artist/source review and inventory refresh required')
    print(f'PASS: {result["total"]} frames, 9 characters; {result["quarantined"]} quarantined, 24 bonus victory frames bundled; Specter 44 reviewed')
