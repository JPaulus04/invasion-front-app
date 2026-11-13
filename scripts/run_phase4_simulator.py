#!/usr/bin/env python3
"""Run one fresh simulator campaign; never manufacture gameplay outcomes."""
import argparse
import json
import hashlib
import os
import platform
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
    # Match the proven presentation setup: cold CoreSimulator discovery can
    # exceed 60 seconds before the app has even been installed. Retry setup
    # only; never restart a campaign or manufacture a missing outcome.
    for attempt in range(3):
        try:
            devices = json.loads(command(
                'xcrun', 'simctl', 'list', 'devices', 'available', '-j',
                timeout=120).stdout)
            break
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
            if attempt == 2:
                raise
            time.sleep(12)
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


def run(profile, limit, seed, batch, output):
    output = Path(output)
    output.mkdir(exist_ok=True)
    log = (output / f'{profile}.log').resolve()
    errors = (output / f'{profile}-stderr.log').resolve()
    # Truncate any host logs left by a local retry before starting a new run.
    log.write_text('')
    errors.write_text('')
    xcode = command('xcodebuild', '-version').stdout
    manifest = {'seed': seed, 'batch': batch, 'profile': profile, 'hz': 60,
                'protocol': 1, 'source': os.environ.get('GITHUB_SHA') or
                subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
                'app_sha256': hashlib.sha256(Path('simulator-app/OutpostZero.app/OutpostZero').read_bytes()).hexdigest(),
                'architecture': platform.machine(), 'xcode': xcode}
    (output / 'run.json').write_text(json.dumps(manifest, indent=2))
    with fresh_simulator(profile, output) as device:
        run_campaign(profile, limit, output, log, errors, device, seed, batch)


def run_campaign(profile, limit, output, log, errors, device, seed=335, batch=2):
    flag = '-qaStationaryRun' if profile == 'stationary' else '-qaMovingRun'
    # This device is fresh: there is no running app to terminate. A launch
    # failure remains a failure; never restart a partially played campaign.
    command('xcrun', 'simctl', 'launch',
            '--stdout=' + str(log), '--stderr=' + str(errors), device, BUNDLE, flag,
            '-qaSeed', str(seed), '-qaTicksPerRender', str(batch), timeout=90)
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
            expected = f'[QA CONFIG] protocol=1 seed={seed} hz=60 batch={batch} profile={profile}'
            if expected not in content:
                raise RuntimeError('Missing/mismatched controlled QA configuration')
            wanted = 'complete' if profile == 'moving' else 'defeat'
            if f'[PHASE4 PLAYTEST] outcome={wanted} ' not in content:
                raise RuntimeError(f'{profile}: real gameplay outcome failed acceptance (no retry)')
            return
        time.sleep(2)
    raise TimeoutError(f'{profile}: no terminal outcome within {limit}s; incomplete runs fail')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('profile', choices=['stationary', 'moving'])
    parser.add_argument('--limit', type=int, default=1500)
    parser.add_argument('--seed', type=int, required=True)
    parser.add_argument('--batch', type=int, choices=[2, 4], required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    if not 0 <= args.seed <= 2**64 - 1:
        parser.error('seed must be an unsigned 64-bit integer')
    run(args.profile, args.limit, args.seed, args.batch, args.output)
