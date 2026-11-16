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
import sys
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
        'app_launcher_sha256':hashlib.sha256((app/'OutpostZero').read_bytes()).hexdigest(),
        'code_payload_sha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(app.glob('*.dylib'))},
        'basis':'successful main ARM macos-15 presentation run 43768308294'},indent=2))
    recorder=None
    try:
        run(['xcrun','simctl','boot',device],90)
        run(['xcrun','simctl','bootstatus',device,'-b'],300)
        run(['xcrun','simctl','install',device,str(app)],150)
        if '--fixtures' in sys.argv:
            fixtures=[('-captureEquipmentDefenseClearScreenshot','phase4-reactor-secured'),
                      ('-captureEquipmentDefenseFailureScreenshot','phase4-reactor-lost'),
                      ('-captureSurvivalTransitionScreenshot','survival-transition'),
                      ('-captureExpandedArenaCenterScreenshot','expanded-survival')]
            for flag,name in fixtures:
                stdout=(OUT/(name+'-stdout.log')).resolve();stderr=(OUT/(name+'-stderr.log')).resolve()
                run(['xcrun','simctl','launch','--terminate-running-process','--stdout='+str(stdout),
                    '--stderr='+str(stderr),device,'com.paulus.laststandcommand',flag],90)
                deadline=time.monotonic()+65
                while time.monotonic()<deadline:
                    text=stdout.read_text() if stdout.exists() else ''
                    errors=stderr.read_text() if stderr.exists() else ''
                    if 'Precondition failed' in errors or 'Fatal error:' in errors:
                        raise RuntimeError(f'Actual fixture assertion failed: {name}: {errors[-2000:]}')
                    if f'[BUILD338 FIXTURE READY] flag={flag}' in text: break
                    time.sleep(.25)
                else: raise TimeoutError(f'Actual fixture never reached its assertions: {name}')
                image=OUT/(name+'.png')
                run(['xcrun','simctl','io',device,'screenshot',str(image)],65)
                run(['python3','scripts/validate_simulator_screenshots.py',str(image)],120)
            (OUT/'fixture-results.json').write_text(json.dumps({'assertions_completed':[x[0] for x in fixtures],
                'visual_approval':False,'note':'Actual captured pixels still require review.'},indent=2))
            return
        stdout=(OUT/'gameplay.log').resolve();stderr=(OUT/'stderr.log').resolve()
        with (OUT/'video.log').open('w') as log:
            recorder=subprocess.Popen(['xcrun','simctl','io',device,'recordVideo','--codec=h264',str(OUT/'world1-tour.mp4')],
                stdout=log,stderr=subprocess.STDOUT)
            ready_deadline=time.monotonic()+60
            while time.monotonic()<ready_deadline:
                if recorder.poll() is not None: raise RuntimeError('Video recorder exited before launch')
                if 'Recording started' in (OUT/'video.log').read_text(): break
                time.sleep(.2)
            else: raise TimeoutError('Simulator recorder never became ready; app was not launched')
            print('Recorder ready before app launch',flush=True)
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
