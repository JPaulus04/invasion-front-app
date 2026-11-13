"""Lifecycle orchestration must preserve capture failures and device isolation."""
from contextlib import contextmanager
import importlib.util
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import run_defense_visual_review as review


class DefenseReviewTests(unittest.TestCase):
    def test_only_launch_service_failure_can_retry_on_new_device(self):
        devices = []
        @contextmanager
        def device(profile, output):
            uuid = f'device-{len(devices)}'
            devices.append(uuid)
            yield uuid
        with tempfile.TemporaryDirectory() as temp, patch.object(review, 'fresh_simulator', device), patch.object(review.subprocess, 'run') as run, patch.object(review, 'Path', return_value=Path(temp)):
            run.side_effect = [subprocess.CalledProcessError(75, 'launch'), None]
            review.run()
            self.assertEqual(devices, ['device-0', 'device-1'])
            self.assertEqual([c.kwargs['env']['OUTPOST_ZERO_SIMULATOR_UDID'] for c in run.call_args_list], devices)

    def test_launch_service_retry_is_bounded(self):
        @contextmanager
        def device(profile, output):
            yield 'disposable'
        with tempfile.TemporaryDirectory() as temp, patch.object(review, 'fresh_simulator', device), patch.object(review.subprocess, 'run', side_effect=subprocess.CalledProcessError(75, 'launch')) as run, patch.object(review, 'Path', return_value=Path(temp)):
            with self.assertRaises(subprocess.CalledProcessError):
                review.run()
            self.assertEqual(run.call_count, 2)

    def test_capture_failure_propagates_and_disposable_device_is_cleaned(self):
        cleaned = []
        @contextmanager
        def device(profile, output):
            self.assertEqual(profile, 'defense')
            try:
                yield 'disposable-uuid'
            finally:
                cleaned.append(True)
        with tempfile.TemporaryDirectory() as temp, patch.object(review, 'fresh_simulator', device), patch.object(review.subprocess, 'run') as run, patch.object(review, 'Path', return_value=Path(temp)):
            run.side_effect = subprocess.CalledProcessError(1, 'capture')
            with self.assertRaises(subprocess.CalledProcessError):
                review.run()
            self.assertEqual(run.call_args.kwargs['env']['OUTPOST_ZERO_SIMULATOR_UDID'], 'disposable-uuid')
            self.assertTrue(run.call_args.kwargs['check'])
        self.assertEqual(cleaned, [True])
