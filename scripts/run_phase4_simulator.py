#!/usr/bin/env python3
"""Run one fresh simulator campaign; never manufacture gameplay outcomes."""
import argparse
import os
import json
from pathlib import Path
import subprocess
import time
from contextlib import contextmanager

BUNDLE = 'com.paulus.laststandcommand'


from simulator_lifecycle import command, fresh_simulator


def run(profile, limit):
    output = Path('phase4')
    output.mkdir(exist_ok=True)
    os.environ.setdefault('OUTPOST_SIM_DIAGNOSTICS', str(output / f'{profile}-simulator-diagnostics.jsonl'))
    log = (output / f'{profile}.log').resolve()
    errors = (output / f'{profile}-stderr.log').resolve()
    # Truncate any host logs left by a local retry before starting a new run.
    log.write_text('')
    errors.write_text('')
    command('xcodebuild', '-version')
    with fresh_simulator(profile, output) as device:
        run_campaign(profile, limit, output, log, errors, device)


def run_campaign(profile, limit, output, log, errors, device):
    flag = '-qaStationaryRun' if profile == 'stationary' else '-qaMovingRun'
    # This device is fresh: there is no running app to terminate. A launch
    # failure remains a failure; never restart a partially played campaign.
    command('xcrun', 'simctl', 'launch',
            '--stdout=' + str(log), '--stderr=' + str(errors), device, BUNDLE, flag, timeout=90)
    start = time.monotonic()
    next_capture = 15
    while time.monotonic() - start < limit:
        elapsed = int(time.monotonic() - start)
        content = log.read_text(errors='replace') if log.exists() else ''
        terminal = '[PHASE4 PLAYTEST] outcome=' in content
        if terminal or elapsed >= next_capture:
            capture = output / f'{profile}-{elapsed:04d}.png'
            try:
                command('xcrun', 'simctl', 'io', device, 'screenshot',
                        str(capture), timeout=45)
            except RuntimeError as error:
                # A diagnostic capture must not terminate a live campaign.
                # Preserve the gap for visual review; terminal outcome checks
                # below remain mandatory and are never inferred from images.
                capture.unlink(missing_ok=True)
                with (output / f'{profile}-capture-errors.log').open('a') as report:
                    report.write(f'{elapsed}s {capture.name}: {error}\n')
                print(f'::warning::Screenshot unavailable; gameplay continues: {error}', flush=True)
            next_capture = elapsed + 120
            print(f'{profile}: {elapsed}s; latest log: {content.splitlines()[-1:]}', flush=True)
        if terminal:
            if f'profile={profile} started world=1' not in content:
                raise RuntimeError('Missing matching QA start marker')
            return
        time.sleep(2)
    raise TimeoutError(f'{profile}: no terminal outcome within {limit}s; incomplete runs fail')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('profile', choices=['stationary', 'moving'])
    parser.add_argument('--limit', type=int, default=1500)
    args = parser.parse_args()
    run(args.profile, args.limit)
