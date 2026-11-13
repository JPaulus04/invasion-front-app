#!/usr/bin/env python3
"""One missing Build 335 case, exact old app, all six original acceptance checks."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

from analyze_qa_replays import evidence, evaluate
from analyze_phase4_playtests import assess

BASE = '05e81452924aa36eecb815f242df0ea791f4280d'
APP_SOURCE = 'b7da5a48c3db4114f5169cab5d60a5832c2027fd'
APP_HASH = '308eb99a248d8d94656f9484ad3a0274906583f49abc6de87d53cc599bc15795'
CASES = [('stationary', 335, 2), ('stationary', 335, 4),
         ('moving', 335, 2), ('moving', 336, 2), ('moving', 336, 4)]
ALLOWED = {'scripts/run_phase4_simulator.py', 'scripts/simulator_startup.py',
           'scripts/run_startup_recovery.py', 'tests/test_phase4_simulator.py',
           'tests/test_simulator_startup.py', 'tests/test_startup_recovery.py',
           '.github/workflows/ios-build.yml', '.github/workflows/simulator-startup-recovery.yml',
           'docs/BUILD_335_STARTUP_RECOVERY.md'}


def verify(baseline):
    # Reusing old gameplay is valid only while ALL app and acceptance sources
    # remain unchanged. Never relabel an old executable as the new harness SHA.
    changed = set(subprocess.check_output(
        ['git', 'diff', '--name-only', BASE, 'HEAD'], text=True).splitlines())
    if changed - ALLOWED:
        raise ValueError(f'App/acceptance may have changed; fresh full validation required: {changed - ALLOWED}')
    app = Path('simulator-app/OutpostZero.app/OutpostZero')
    if hashlib.sha256(app.read_bytes()).hexdigest() != APP_HASH:
        raise ValueError('Compiled app differs from run 43417058233')
    for profile, seed, batch in CASES:
        _, manifest, _ = evidence(baseline, profile, seed, batch)
        if manifest['source'] != APP_SOURCE or manifest['app_sha256'] != APP_HASH:
            raise ValueError('Historical evidence does not identify the exact source/app')
    for seed, batch in [(335, 2), (336, 2), (336, 4)]:
        if not assess(baseline / f'stationary-335-{batch}/stationary.log',
                      baseline / f'moving-{seed}-{batch}/moving.log')['passed']:
            raise ValueError('Historical gameplay did not pass; it cannot be retried here')


def main():
    baseline, output = Path('baseline'), Path('phase4')
    verify(baseline)
    output.mkdir(exist_ok=False)
    for profile, seed, batch in CASES:
        case = f'{profile}-{seed}-{batch}'
        shutil.copytree(baseline / case, output / case)
    env = {**os.environ, 'QA_APP_SOURCE': APP_SOURCE}
    # Exactly one runner invocation; that runner can recover STARTUP only.
    result = subprocess.run([sys.executable, 'scripts/run_phase4_simulator.py',
        'moving', '--seed', '335', '--batch', '4', '--output',
        str(output / 'moving-335-4')], env=env)
    try:
        acceptance = evaluate(output)
    except (OSError, ValueError, KeyError, IndexError) as error:
        acceptance = {'passed': False, 'error': str(error)}
    (output / 'acceptance.json').write_text(json.dumps(acceptance, indent=2))
    print(json.dumps(acceptance, indent=2), flush=True)
    if result.returncode or not acceptance['passed']:
        raise SystemExit('FAIL: startup or original gameplay/replay acceptance; no campaign retries')


if __name__ == '__main__':
    main()
