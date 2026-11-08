#!/usr/bin/env python3
"""Run one fresh simulator campaign; never manufacture gameplay outcomes."""
import argparse
import json
from pathlib import Path
import subprocess
import time
from contextlib import contextmanager

BUNDLE = 'com.paulus.laststandcommand'


def command(*args, timeout=60, check=True):
    print(f"Simulator command ({timeout}s limit): {' '.join(args)}", flush=True)
    try:
        result = subprocess.run(args, timeout=timeout, check=check, text=True,
                                capture_output=True)
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError) as error:
        print(f"Simulator command failed: {error}", flush=True)
        for detail in (error.stdout, error.stderr):
            if detail:
                print(detail, flush=True)
        raise
    if result.stdout:
        print(result.stdout, flush=True)
    if result.stderr:
        print(result.stderr, flush=True)
    return result


@contextmanager
def fresh_simulator(profile, output):
    devices = json.loads(command('xcrun', 'simctl', 'list', 'devices', 'available', '-j').stdout)
    candidates = [(runtime, device) for runtime, group in devices['devices'].items()
                  for device in group if device.get('isAvailable', True)
                  and device['name'].startswith('iPhone')
                  and device.get('deviceTypeIdentifier')]
    if not candidates:
        raise RuntimeError('No available iPhone device type/runtime for a fresh simulator')
    runtime, template = candidates[0]
    # A new device has no app data. Do not uninstall an absent app on a
    # just-booted shared device: that operation stalled before gameplay in CI.
    device = command('xcrun', 'simctl', 'create', f'OutpostZero-Phase4-{profile}',
                     template['deviceTypeIdentifier'], runtime).stdout.strip()
    if not device:
        raise RuntimeError('simctl create returned no device UUID')
    try:
        (output / f'{profile}-device.json').write_text(json.dumps({
            'udid': device, 'runtime': runtime,
            'device_type': template['deviceTypeIdentifier'], 'fresh_device': True,
        }, indent=2))
        command('xcrun', 'simctl', 'boot', device)
        command('xcrun', 'simctl', 'bootstatus', device, '-b', timeout=240)
        command('xcrun', 'simctl', 'install', device,
                'simulator-app/OutpostZero.app', timeout=150)
        yield device
    finally:
        # Cleanup is bounded and must never replace a gameplay/setup failure.
        # Only touch the disposable device created by this invocation.
        for action in ('shutdown', 'delete'):
            try:
                command('xcrun', 'simctl', action, device, timeout=30)
            except (subprocess.SubprocessError, OSError) as error:
                print(f'::warning::Simulator cleanup {action}: {error}', flush=True)


def run(profile, limit):
    output = Path('phase4')
    output.mkdir(exist_ok=True)
    log = (output / f'{profile}.log').resolve()
    errors = (output / f'{profile}-stderr.log').resolve()
    # Truncate any host logs left by a local retry before starting a new run.
    log.write_text('')
    errors.write_text('')
    with fresh_simulator(profile, output) as device:
        run_campaign(profile, limit, output, log, errors, device)


def run_campaign(profile, limit, output, log, errors, device):
    flag = '-qaStationaryRun' if profile == 'stationary' else '-qaMovingRun'
    command('xcrun', 'simctl', 'launch', '--terminate-running-process',
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
            except (subprocess.SubprocessError, OSError) as error:
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
