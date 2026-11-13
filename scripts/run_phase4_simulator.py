#!/usr/bin/env python3
"""Run one fresh simulator campaign; never manufacture gameplay outcomes."""
import argparse
import json
import hashlib
import os
import platform
import shutil
from pathlib import Path
import subprocess
import time
from contextlib import contextmanager
from simulator_startup import (RecoverableStartupError, content, launch_initial,
                               snapshot, wait_for_app_registration)

BUNDLE = 'com.paulus.laststandcommand'


def ready_command(*args):
    # bootstatus does not warm the first child-spawn/registration RPC. In
    # run 43424711019 the first read-only probe timed out on BOTH fresh
    # devices, then the diagnostic repeat immediately succeeded. Poll the
    # same device before abandoning it; never launch or install in this loop.
    for timeout in (60, 30):
        try:
            return command(*args, timeout=timeout)
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
            if timeout == 30:
                raise
            print('::warning::Cold simulator readiness RPC; one bounded read-only poll remains', flush=True)


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
def fresh_simulator(profile, output, controlled=False):
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
    if controlled:
        candidates = [(runtime, device) for runtime, device in candidates
                      if runtime.endswith('.iOS-18-5') and
                      device['deviceTypeIdentifier'].endswith('.iPhone-16-Pro')]
    if not candidates:
        raise RuntimeError('No available iPhone device type/runtime for a fresh simulator')
    runtime, template = candidates[0]
    # A new device has no app data. Do not uninstall an absent app on a
    # just-booted shared device: that operation stalled before gameplay in CI.
    device = command('xcrun', 'simctl', 'create', f'OutpostZero-Phase4-{profile}',
                     template['deviceTypeIdentifier'], runtime).stdout.strip()
    if not device:
        raise RuntimeError('simctl create returned no device UUID')
    startup_failed = False
    try:
        (output / f'{profile}-device.json').write_text(json.dumps({
            'udid': device, 'runtime': runtime,
            'device_type': template['deviceTypeIdentifier'], 'fresh_device': True,
        }, indent=2))
        for stage, actions in (
            ('boot', [('xcrun', 'simctl', 'boot', device),
                      ('xcrun', 'simctl', 'bootstatus', device, '-b')]),
            ('install', [('xcrun', 'simctl', 'install', device,
                          'simulator-app/OutpostZero.app')]),
        ):
            began = time.time()
            try:
                for args in actions:
                    command(*args, timeout=240 if args[2] == 'bootstatus' else
                            150 if stage == 'install' else 60)
                if stage == 'boot':
                    # Probe process-control responsiveness without enumerating
                    # every launchd service on a cold simulator. A full
                    # launchctl list stalled during defense visual review.
                    ready_command('xcrun', 'simctl', 'spawn', device,
                                  '/usr/bin/true')
                if stage == 'install':
                    # Installation returning is not proof that launch services
                    # can resolve the bundle. Fail before asking it to launch.
                    ready_command('xcrun', 'simctl', 'get_app_container', device,
                                  BUNDLE, 'app')
                    if controlled:
                        wait_for_app_registration(command, device, output)
            except (subprocess.TimeoutExpired, subprocess.CalledProcessError,
                    RecoverableStartupError) as error:
                snapshot(command, device, output, f'{stage}-failure', began)
                raise RecoverableStartupError(f'{stage} failed before launch: {error}') from error
        yield device
    except RecoverableStartupError:
        startup_failed = True
        raise
    finally:
        # Cleanup is bounded and must never replace a gameplay/setup failure.
        # Only touch the disposable device created by this invocation.
        cleanup_failed = False
        for action in ('shutdown', 'delete'):
            try:
                command('xcrun', 'simctl', action, device, timeout=30)
            except (subprocess.SubprocessError, OSError) as error:
                cleanup_failed = True
                print(f'::warning::Simulator cleanup {action}: {error}', flush=True)
        if startup_failed and cleanup_failed:
            raise RuntimeError('Could not fence failed device; startup recovery forbidden')


def run(profile, limit, seed, batch, output):
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    log = (output / f'{profile}.log').resolve()
    errors = (output / f'{profile}-stderr.log').resolve()
    if (output / 'startup.json').exists() or (log.exists() and log.stat().st_size):
        raise FileExistsError('Existing campaign evidence must not be overwritten or retried')
    # New invocation only. Individual startup attempts retain separate files.
    log.write_text('')
    errors.write_text('')
    xcode = command('xcodebuild', '-version').stdout
    manifest = {'seed': seed, 'batch': batch, 'profile': profile, 'hz': 60,
                'protocol': 1, 'harness_source': os.environ.get('GITHUB_SHA') or
                subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
                'source': os.environ.get('QA_APP_SOURCE') or os.environ.get('GITHUB_SHA') or
                subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
                'app_sha256': hashlib.sha256(Path('simulator-app/OutpostZero.app/OutpostZero').read_bytes()).hexdigest(),
                'architecture': platform.machine(), 'os_version': platform.mac_ver()[0], 'xcode': xcode}
    (output / 'run.json').write_text(json.dumps(manifest, indent=2))
    history = []
    for attempt in (1, 2):
        attempt_dir = output / f'startup-{attempt}'
        attempt_dir.mkdir(exist_ok=False)
        attempt_log = (attempt_dir / f'{profile}.log').resolve()
        attempt_errors = (attempt_dir / f'{profile}-stderr.log').resolve()
        attempt_log.write_text('')
        attempt_errors.write_text('')
        record = {'attempt': attempt, 'began_at': time.time()}
        history.append(record)
        try:
            with fresh_simulator(profile, attempt_dir, controlled=True) as device:
                identity = json.loads((attempt_dir / f'{profile}-device.json').read_text())
                manifest.update(runtime=identity['runtime'], device_type=identity['device_type'])
                (output / 'run.json').write_text(json.dumps(manifest, indent=2))
                run_campaign(profile, limit, attempt_dir, attempt_log, attempt_errors,
                             device, seed, batch)
            record['result'] = 'campaign_completed'
            return
        except RecoverableStartupError as error:
            # The old device has now been shut down/deleted. Recheck its files
            # after that fence: any late output forbids starting another device.
            if content(attempt_log) or content(attempt_errors):
                record['result'] = 'late_output_recovery_forbidden'
                raise RuntimeError('Late app output; refusing a startup retry') from error
            record.update(result='startup_failed', error=str(error))
            if attempt == 2:
                raise
            print(f'::warning::Startup-only recovery on a new disposable device: {error}', flush=True)
        except BaseException as error:
            record.update(result='failed_no_retry', error=str(error))
            raise
        finally:
            record['ended_at'] = time.time()
            (output / 'startup.json').write_text(json.dumps(history, indent=2))
            # Preserve each attempt, and expose only this invocation's final
            # observed campaign at the canonical paths used by strict analysis.
            shutil.copyfile(attempt_log, log)
            shutil.copyfile(attempt_errors, errors)


def run_campaign(profile, limit, output, log, errors, device, seed=335, batch=2):
    launch_initial(command, profile, seed, batch, device, output, log, errors)
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
