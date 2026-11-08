"""Setup failure regressions; mocked simctl is not gameplay evidence."""
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    'simulator', Path(__file__).resolve().parents[1] / 'scripts/run_phase4_simulator.py')
sim = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sim)


class SetupTests(unittest.TestCase):
    def exercise(self, failing_action=None, cleanup_timeout=False, gameplay_error=False):
        calls = []

        def command(*args, **kwargs):
            action = args[2]
            calls.append((args, kwargs))
            if action == failing_action or (cleanup_timeout and action in ('shutdown', 'delete')):
                raise subprocess.TimeoutExpired(args, kwargs.get('timeout', 60))
            stdout = ''
            if action == 'list':
                stdout = json.dumps({'devices': {'runtime-ios': [
                    {'name': 'iPhone 17', 'isAvailable': True,
                     'deviceTypeIdentifier': 'type-iphone', 'udid': 'existing-device'}]}})
            elif action == 'create':
                stdout = 'new-device\n'
            return subprocess.CompletedProcess(args, 0, stdout, '')

        with tempfile.TemporaryDirectory() as temp, patch.object(sim, 'command', side_effect=command):
            def start():
                with sim.fresh_simulator('moving', Path(temp)) as device:
                    self.assertEqual(device, 'new-device')
                    identity = json.loads((Path(temp) / 'moving-device.json').read_text())
                    self.assertTrue(identity['fresh_device'])
                    if gameplay_error:
                        raise RuntimeError('original gameplay failure')
            if failing_action:
                with self.assertRaises(subprocess.TimeoutExpired):
                    start()
            elif gameplay_error:
                with self.assertRaisesRegex(RuntimeError, 'original gameplay failure'):
                    start()
            else:
                start()
        return calls

    def test_fresh_device_never_uninstalls_or_touches_existing_device(self):
        calls = self.exercise()
        actions = [args[2] for args, _ in calls]
        self.assertEqual(actions, ['list', 'create', 'boot', 'bootstatus', 'install', 'shutdown', 'delete'])
        self.assertFalse(any('existing-device' in args for args, _ in calls))

    def test_boot_readiness_timeout_blocks_install_and_cleans_up(self):
        calls = self.exercise(failing_action='bootstatus')
        actions = [args[2] for args, _ in calls]
        self.assertNotIn('install', actions)
        self.assertEqual(actions[-2:], ['shutdown', 'delete'])

    def test_install_failure_preserved_when_cleanup_also_times_out(self):
        self.exercise(failing_action='install', cleanup_timeout=True)

    def test_gameplay_failure_preserved_when_cleanup_times_out(self):
        self.exercise(cleanup_timeout=True, gameplay_error=True)

    def test_cleanup_timeout_does_not_fail_completed_campaign(self):
        calls = self.exercise(cleanup_timeout=True)
        self.assertTrue(all(kwargs['timeout'] == 30 for args, kwargs in calls
                            if args[2] in ('shutdown', 'delete')))


class CaptureTests(unittest.TestCase):
    def test_capture_timeout_does_not_discard_real_terminal_outcome(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            log = root / 'moving.log'
            log.write_text('[PHASE4 QA] profile=moving started world=1\n'
                           '[PHASE4 PLAYTEST] outcome=complete world=1 room=20\n')
            def command(*args, **kwargs):
                if 'screenshot' in args:
                    raise subprocess.TimeoutExpired(args, 45)
                return subprocess.CompletedProcess(args, 0, '', '')
            with patch.object(sim, 'command', side_effect=command):
                sim.run_campaign('moving', 10, root, log, root / 'stderr.log', 'device')
            self.assertTrue((root / 'moving-capture-errors.log').exists())

    def test_missing_outcome_still_fails(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            log = root / 'moving.log'
            log.write_text('[PHASE4 QA] profile=moving started world=1\n')
            with patch.object(sim, 'command'):
                with self.assertRaisesRegex(TimeoutError, 'no terminal outcome'):
                    sim.run_campaign('moving', 0, root, log, root / 'stderr.log', 'device')


if __name__ == '__main__':
    unittest.main()
