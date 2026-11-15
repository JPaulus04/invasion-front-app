#!/usr/bin/env python3
"""One simulator, one launch, one continuous real-scene animation recording.

No lifecycle retries. A failure preserves diagnostics and cannot claim approval.
"""
import json
import hashlib
import shutil
import os
from pathlib import Path
import signal
import subprocess
import time
from run_phase4_simulator import fresh_simulator

OUT = Path('enemy-review')
OUT.mkdir(exist_ok=True)


def run(*args, timeout=45, check=True):
    print('RUN', *args, flush=True)
    result = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
    print((result.stdout + result.stderr)[-2000:], flush=True)
    if check and result.returncode:
        raise RuntimeError(f'Command failed ({result.returncode}): {args}')
    return result


def capture(device):
    run('xcrun', 'simctl', 'io', device, 'screenshot', str(OUT / 'prelaunch.png'))
    video_log = (OUT / 'recording.log').open('w')
    recording = subprocess.Popen(['xcrun', 'simctl', 'io', device, 'recordVideo',
                                 '--codec=h264', str(OUT / 'enemy-states.mp4')],
                                stdout=video_log, stderr=subprocess.STDOUT)
    application = None
    try:
        time.sleep(2)
        with (OUT / 'gameplay.log').open('w') as log:
            application = subprocess.Popen(['xcrun', 'simctl', 'launch', '--console', device,
                'com.paulus.laststandcommand', '-captureBuild337EnemySequence', '-requireWorldOneAuthoredArt'],
                stdout=log, stderr=subprocess.STDOUT)
            deadline = time.monotonic() + 120
            while time.monotonic() < deadline:
                text = (OUT / 'gameplay.log').read_text()
                if '[ENEMY REVIEW DONE]' in text:
                    break
                if application.poll() is not None:
                    raise RuntimeError(f'Application console exited early: {application.returncode}')
                time.sleep(0.5)
            else:
                raise TimeoutError('No complete enemy sequence within 120 seconds')
        text = (OUT / 'gameplay.log').read_text()
        for state in ['spawn', 'idle', 'movement', 'attack', 'hit', 'defeat', 'crowded', 'survival', 'reactor', 'boss']:
            if f'[ENEMY REVIEW] stage={state} ' not in text:
                raise RuntimeError(f'Missing gameplay stage: {state}')
        for motion in ['idle', 'move', 'attack', 'hit', 'defeat']:
            if f'[ENEMY ART] motion={motion} ' not in text:
                raise RuntimeError(f'Missing actual controller playback: {motion}')
        (OUT / 'result.json').write_text(json.dumps({'sequence_completed': True,
            'visual_approval': False, 'note': 'Review the actual video; trace checks cannot approve appearance.'}, indent=2))
    finally:
        if recording.poll() is None:
            recording.send_signal(signal.SIGINT)
        try:
            recording.wait(timeout=25)
        except subprocess.TimeoutExpired:
            recording.kill()
            recording.wait()
        video_log.close()
        if application and application.poll() is None:
            application.terminate()
            try:
                application.wait(timeout=10)
            except subprocess.TimeoutExpired:
                application.kill()
        if not (OUT / 'enemy-states.mp4').is_file():
            raise RuntimeError('No simulator video produced')


def main():
    app = Path('DerivedData/Build/Products/Debug-iphonesimulator/OutpostZero.app')
    destination = Path('simulator-app/OutpostZero.app')
    destination.parent.mkdir(exist_ok=True)
    shutil.copytree(app, destination)
    (OUT / 'manifest.json').write_text(json.dumps({
        'source_commit': os.environ.get('GITHUB_SHA'),
        'app_sha256': hashlib.sha256((app / 'OutpostZero').read_bytes()).hexdigest(),
        'recovery': 'one disposable iPhone 16 Pro / iOS 18.5; no outer lifecycle retry',
    }, indent=2))
    # Reuse the existing tested lifecycle, including cold-RPC readiness and
    # positive app registration. One new device only; never retry gameplay.
    with fresh_simulator('enemy-review', OUT, controlled=True) as device:
        capture(device)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        (OUT / 'failure.txt').write_text(repr(error))
        raise
