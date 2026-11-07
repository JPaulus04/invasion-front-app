#!/usr/bin/env python3
"""Run one fresh simulator campaign; never manufacture gameplay outcomes."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import time

BUNDLE = 'com.paulus.laststandcommand'


def command(*args, timeout=60, check=True):
    return subprocess.run(args, timeout=timeout, check=check, text=True,
                          capture_output=True)


def run(profile, limit):
    output = Path('phase4')
    output.mkdir(exist_ok=True)
    log = (output / f'{profile}.log').resolve()
    errors = (output / f'{profile}-stderr.log').resolve()
    devices = json.loads(command('xcrun', 'simctl', 'list', 'devices', 'available', '-j').stdout)
    device = next(d['udid'] for group in devices['devices'].values() for d in group
                  if d.get('isAvailable', True) and d['name'].startswith('iPhone'))
    command('xcrun', 'simctl', 'boot', device, check=False)
    command('xcrun', 'simctl', 'bootstatus', device, '-b', timeout=240)
    # Uninstall clears all progression, recovery, gear and mastery for EACH run.
    command('xcrun', 'simctl', 'uninstall', device, BUNDLE, check=False)
    command('xcrun', 'simctl', 'install', device, 'simulator-app/OutpostZero.app', timeout=150)
    flag = '-qaStationaryRun' if profile == 'stationary' else '-qaMovingRun'
    command('xcrun', 'simctl', 'launch', '--terminate-running-process',
            '--stdout=' + str(log), '--stderr=' + str(errors), device, BUNDLE, flag, timeout=90)
    start = time.monotonic()
    next_capture = 15
    try:
        while time.monotonic() - start < limit:
            elapsed = int(time.monotonic() - start)
            content = log.read_text(errors='replace') if log.exists() else ''
            terminal = '[PHASE4 PLAYTEST] outcome=' in content
            if terminal or elapsed >= next_capture:
                command('xcrun', 'simctl', 'io', device, 'screenshot',
                        str(output / f'{profile}-{elapsed:04d}.png'), timeout=45)
                next_capture = elapsed + 120
                print(f'{profile}: {elapsed}s; latest log: {content.splitlines()[-1:]}', flush=True)
            if terminal:
                if f'profile={profile} started world=1' not in content:
                    raise RuntimeError('Missing matching QA start marker')
                return
            time.sleep(2)
        raise TimeoutError(f'{profile}: no terminal outcome within {limit}s; incomplete runs fail')
    finally:
        command('xcrun', 'simctl', 'terminate', device, BUNDLE, check=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('profile', choices=['stationary', 'moving'])
    parser.add_argument('--limit', type=int, default=1500)
    args = parser.parse_args()
    run(args.profile, args.limit)
