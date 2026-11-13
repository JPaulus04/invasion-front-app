#!/usr/bin/env python3
"""Capture defense/landscapes on a disposable simulator, preserving failures."""
import os
from pathlib import Path
import subprocess

from run_phase4_simulator import fresh_simulator


def run():
    output = Path('diagnostics')
    output.mkdir(exist_ok=True)
    # Reuse the bounded, tested lifecycle used by fresh campaign acceptance.
    # Hosted pre-existing devices can stall indefinitely during migration.
    for attempt in range(2):
        try:
            with fresh_simulator('defense', output) as device:
                subprocess.run(
                    ['bash', 'scripts/capture_defense_visual_review.sh'],
                    env={**os.environ, 'OUTPOST_ZERO_SIMULATOR_UDID': device},
                    check=True, timeout=25 * 60)
            return
        except subprocess.CalledProcessError as error:
            # 75 means simctl never completed any launch for a requested scene.
            # A rendered but incorrect frame/assertion remains a hard failure.
            if error.returncode != 75 or attempt == 1:
                raise
            print('::warning::Launch service unavailable; retry on one new disposable device',
                  flush=True)


if __name__ == '__main__':
    run()
