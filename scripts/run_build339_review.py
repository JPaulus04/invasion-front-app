#!/usr/bin/env python3
"""Nine focused actual SpriteKit captures; one disposable simulator, no campaigns."""
import argparse
import json
from pathlib import Path
import subprocess
import time
from PIL import Image
import run_phase4_simulator as sim

OUT=Path('build339-review');OUT.mkdir(exist_ok=True)

def command(*args,timeout=60,check=True):
    try:
        r=subprocess.run(args,text=True,capture_output=True,timeout=timeout,check=check)
    except subprocess.SubprocessError as e:
        with (OUT/'setup.log').open('a') as f:f.write(str(e)+'\n')
        raise
    with (OUT/'setup.log').open('a') as f:f.write(' '.join(args)+'\n'+r.stdout+'\n'+r.stderr+'\n')
    return r


def validate(path,index):
    with Image.open(path) as im:
        im=im.convert('RGB');w,h=im.size
        if w<320 or h<568:raise ValueError('Too small')
        for fraction,bits in [(.94,index+1),(.90,(index+1)>>3)]:
            rgb=im.getpixel((round(w*fraction),round(h*.54)))
            if any((rgb[c]<170 if bits&(1<<c) else rgb[c]>90) for c in range(3)):
                raise ValueError(f'Stale/blank/wrong capture {index}: {rgb}')


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--replacements',action='store_true');args=parser.parse_args()
    sim.command=command
    results=[]
    with sim.fresh_simulator('build339',OUT,controlled=True) as device:
        for index,name in enumerate(['vanguard-idle','specter-move','bulwark-attack','volt-hit',
                                     'enemies-idle','enemies-move','enemies-attack','enemies-hit','enemies-defeat']):
            if args.replacements and index<4:continue
            launch_flags=['-qa339Replacements'] if args.replacements else []
            log=(OUT/f'{name}.log').resolve();err=(OUT/f'{name}-stderr.log').resolve()
            command('xcrun','simctl','launch','--terminate-running-process','--stdout='+str(log),
                '--stderr='+str(err),device,sim.BUNDLE,'-captureBuild339Animation','-qa339Index',str(index),*launch_flags,timeout=90)
            deadline=time.monotonic()+90
            while time.monotonic()<deadline:
                errors=err.read_text(errors='replace') if err.exists() else ''
                if 'Precondition failed' in errors or 'Fatal error:' in errors:raise RuntimeError(errors[-3000:])
                text=log.read_text(errors='replace') if log.exists() else ''
                if f'[BUILD339 READY] index={index} ' in text:break
                time.sleep(.2)
            else:raise TimeoutError(f'{name}: fixture never became ready; no relaunch')
            # Read-only render polling on the SAME process, never a scene retry.
            image=OUT/(name+'.png');deadline=time.monotonic()+30
            while True:
                command('xcrun','simctl','io',device,'screenshot',str(image),timeout=35)
                try:validate(image,index);break
                except ValueError:
                    if time.monotonic()>=deadline:raise
                    time.sleep(1)
            results.append({'index':index,'scene':name,'file':image.name,'native_ready':True})
            print('Captured',name,flush=True)
    (OUT/'captures.json').write_text(json.dumps({'captures':results,'visual_approval':False,'replacement_review':args.replacements,
        'note':'Actual frames must be reviewed; fixture captures are not a campaign outcome.'},indent=2)+'\n')

if __name__=='__main__':main()
