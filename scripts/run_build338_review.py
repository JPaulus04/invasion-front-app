#!/usr/bin/env python3
"""One continuous World 1 tour using the proven main ARM presentation process.

One disposable device and one launch. No simulator lifecycle retry loop.
"""
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import time

OUT=Path('build338-review');OUT.mkdir(exist_ok=True)


def run(args, timeout=60, check=True):
    print('RUN',*args,flush=True)
    result=subprocess.run(args,capture_output=True,text=True,timeout=timeout)
    print((result.stdout+result.stderr)[-3000:],flush=True)
    if check and result.returncode: raise RuntimeError(f'Exit {result.returncode}: {args}')
    return result


def main():
    devices=json.loads(run(['xcrun','simctl','list','devices','available','-j'],120).stdout)['devices']
    choices=[(runtime,d) for runtime,group in devices.items() for d in group
             if d.get('isAvailable',True) and d.get('name','').startswith('iPhone') and d.get('deviceTypeIdentifier')]
    if not choices: raise RuntimeError('No iPhone simulator template available')
    runtime,template=choices[0]
    device=run(['xcrun','simctl','create','OutpostZero-Build338',template['deviceTypeIdentifier'],runtime],90).stdout.strip()
    app=Path('DerivedData/Build/Products/Debug-iphonesimulator/OutpostZero.app')
    (OUT/'manifest.json').write_text(json.dumps({'source_commit':os.environ.get('GITHUB_SHA'),
        'runtime':runtime,'template':template['deviceTypeIdentifier'],'device':device,
        'app_sha256':hashlib.sha256((app/'OutpostZero').read_bytes()).hexdigest(),
        'basis':'successful main ARM macos-15 presentation run 43768308294'},indent=2))
    recorder=None
    try:
        run(['xcrun','simctl','boot',device],90)
        run(['xcrun','simctl','bootstatus',device,'-b'],300)
        run(['xcrun','simctl','install',device,str(app)],150)
        stdout=(OUT/'gameplay.log').resolve();stderr=(OUT/'stderr.log').resolve()
        with (OUT/'video.log').open('w') as log:
            recorder=subprocess.Popen(['xcrun','simctl','io',device,'recordVideo','--codec=h264',str(OUT/'world1-tour.mp4')],
                stdout=log,stderr=subprocess.STDOUT)
            run(['xcrun','simctl','launch','--stdout='+str(stdout),'--stderr='+str(stderr),device,
                 'com.paulus.laststandcommand','-captureBuild338WorldTour','-requireWorldOneAuthoredArt'],90)
            deadline=time.monotonic()+150
            while time.monotonic()<deadline:
                text=stdout.read_text() if stdout.exists() else ''
                if '[BUILD338 DONE]' in text: break
                time.sleep(.5)
            else: raise TimeoutError('The actual scene never completed its World 1 tour')
        for stage in ['outpost-entry','outpost-combat','swamp','toxic-caves','reactor','boss',
                      'far-wall-portal','portal-approach','long-camera','transition']:
            if f'[BUILD338] stage={stage} ' not in text: raise RuntimeError(f'Missing actual scene stage: {stage}')
        (OUT/'trace-result.json').write_text(json.dumps({'tour_completed':True,'visual_approval':False,
            'note':'Actual video/screenshots must be reviewed; a trace is not visual approval.'},indent=2))
    finally:
        if recorder is not None and recorder.poll() is None:
            recorder.send_signal(signal.SIGINT)
            try: recorder.wait(timeout=30)
            except subprocess.TimeoutExpired:
                recorder.kill();recorder.wait()
        for command in ['shutdown','delete']:
            try: run(['xcrun','simctl',command,device],30,False)
            except Exception as error: print('Cleanup failed:',error,flush=True)


if __name__=='__main__':
    try: main()
    except Exception as error:
        (OUT/'failure.txt').write_text(repr(error));raise
