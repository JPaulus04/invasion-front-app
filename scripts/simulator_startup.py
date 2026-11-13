"""Bounded, fail-closed recovery before a campaign starts. Never drive gameplay."""
import json
from pathlib import Path
import shutil
import subprocess
import time

BUNDLE = 'com.paulus.laststandcommand'
START_MARKERS = ('[QA CONFIG]', '[QA REPLAY]', '[PHASE4')


class RecoverableStartupError(RuntimeError):
    """Only boot/install failures or a proven unstarted launch may raise this."""


def content(path):
    return path.read_text(errors='replace') if path.exists() else ''


def started(log):
    # Even a partial/wrong configuration is a one-way latch, never a retry.
    return any(marker in content(log) for marker in START_MARKERS)


def registered_app(info):
    """Positive installed-app identity, not just a container on disk."""
    return (isinstance(info, dict) and
            info.get('CFBundleIdentifier') == BUNDLE and
            info.get('CFBundleExecutable') == 'OutpostZero' and
            info.get('ApplicationType') == 'User' and
            not info.get('IsPlaceholder', False) and
            not info.get('isPlaceholder', False))


def wait_for_app_registration(command, device, output):
    # Run 43434500196 returned an app container before LaunchServices had
    # finished placeholder -> installed registration. Launching in that gap
    # stalled twice. Read appinfo instead; never launch/reinstall in this loop.
    root = output / 'registration'
    root.mkdir(exist_ok=True)
    deadline = time.monotonic() + 180
    stable, attempt = 0, 0
    while time.monotonic() < deadline:
        attempt += 1
        raw = root / f'appinfo-{attempt}.plist'
        try:
            reply = command('xcrun', 'simctl', 'appinfo', device, BUNDLE,
                            timeout=min(20, max(1, deadline - time.monotonic())), check=False)
            raw.write_text(reply.stdout)
            (root / f'appinfo-{attempt}-stderr.log').write_text(reply.stderr)
            info = None
            if reply.returncode == 0:
                # simctl emits an OpenStep plist, not XML/JSON. macOS plutil
                # parses it without brittle regexes or executing its content.
                parsed = command('plutil', '-convert', 'json', '-o', '-', str(raw),
                                 timeout=min(10, max(1, deadline - time.monotonic())))
                info = json.loads(parsed.stdout)
                (root / f'appinfo-{attempt}.json').write_text(json.dumps(info, indent=2))
            stable = stable + 1 if registered_app(info) else 0
            if stable == 2 and time.monotonic() < deadline:
                (root / 'ready.json').write_text(json.dumps({
                    'device': device, 'polls': attempt, 'stable_samples': stable,
                    'bundle': BUNDLE, 'ready': True}, indent=2))
                return
        except (subprocess.SubprocessError, OSError, ValueError) as error:
            stable = 0
            (root / f'appinfo-{attempt}-error.log').write_text(str(error))
        time.sleep(min(5, max(0, deadline - time.monotonic())))
    raise RecoverableStartupError('App registration not ready within 180s; no launch attempted')


def snapshot(command, device, output, label, since):
    """Diagnostics must not mask the original failure; unknown state fails closed."""
    root = output / label
    root.mkdir(parents=True, exist_ok=True)
    results = {}
    probes = {
        'devices': ('xcrun', 'simctl', 'list', 'devices', '-j'),
        'services': ('xcrun', 'simctl', 'spawn', device, 'launchctl', 'list'),
        'processes': ('ps', '-axo', 'pid,ppid,state,etime,comm'),
        'launch-log': ('xcrun', 'simctl', 'spawn', device, 'log', 'show',
                       '--last', '3m', '--style', 'compact', '--predicate',
                       'process == "OutpostZero" OR eventMessage CONTAINS "com.paulus.laststandcommand"'),
    }
    for name, args in probes.items():
        try:
            result = command(*args, timeout=20, check=False)
            results[name] = result.stdout if result.returncode == 0 else None
            (root / f'{name}.log').write_text(result.stdout + '\n' + result.stderr)
        except (subprocess.SubprocessError, OSError) as error:
            results[name] = None
            (root / f'{name}.log').write_text(str(error))
    crashes = []
    try:
        for report in (Path.home() / 'Library/Logs/DiagnosticReports').glob('OutpostZero*'):
            if report.is_file() and report.stat().st_mtime >= since:
                crashes.append(report.name)
                shutil.copyfile(report, root / report.name)
    except OSError as error:
        crashes.append(f'unknown: {error}')
    processes, services = results.get('processes'), results.get('services')
    # Do not infer absence from a failed probe, missing logs, or a missing PID reply.
    absent = processes is not None and services is not None and not crashes
    absent = absent and not any(line.rstrip().endswith('/OutpostZero') or
                                line.rstrip().endswith(' OutpostZero')
                                for line in processes.splitlines())
    absent = absent and not any(BUNDLE in line and line.split()[0].isdigit()
                                for line in services.splitlines())
    state = {'device': device, 'captured_at': time.time(),
             'app_proven_absent': bool(absent), 'crash_reports': crashes,
             'probe_ok': {key: value is not None for key, value in results.items()}}
    (root / 'state.json').write_text(json.dumps(state, indent=2))
    return state


def launch_initial(command, profile, seed, batch, device, output, log, errors):
    """One launch per device. A late start is observed on the SAME process."""
    flag = '-qaStationaryRun' if profile == 'stationary' else '-qaMovingRun'
    launched_at = time.time()
    failure = None
    reply = None
    try:
        reply = command('xcrun', 'simctl', 'launch', '--stdout=' + str(log),
                '--stderr=' + str(errors), device, BUNDLE, flag,
                '-qaSeed', str(seed), '-qaTicksPerRender', str(batch), timeout=120)
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError) as error:
        failure = error
    client_seconds = time.time() - launched_at
    # simctl's client can time out while the app continues to launch. Never
    # relaunch it merely because the client failed to return a PID.
    deadline = time.monotonic() + 60
    while not started(log) and time.monotonic() < deadline:
        time.sleep(2)
    launch_record = {'started': started(log), 'client_error': str(failure) if failure else None,
                     'pid_reply': reply.stdout if reply else None,
                     'client_seconds': client_seconds,
                     'continued_same_process': failure is not None and started(log)}
    (output / 'launch.json').write_text(json.dumps(launch_record, indent=2))
    if started(log):
        return
    state = snapshot(command, device, output, 'launch-failure', launched_at)
    if started(log):
        launch_record.update(started=True, continued_same_process=True)
        (output / 'launch.json').write_text(json.dumps(launch_record, indent=2))
        return  # Diagnostics raced a late start; observe, never restart.
    partial_reply = getattr(failure, 'stdout', None) or b''
    if failure and not partial_reply and not content(log) and not content(errors) and state['app_proven_absent']:
        raise RecoverableStartupError(f'Initial launch never started: {failure}') from failure
    raise RuntimeError('Initial launch unconfirmed; app alive, acknowledged, crashed, '
                       'produced output or process state unknown. Recovery forbidden.') from failure
