"""Setup failure regressions; mocked simctl is not gameplay evidence."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))

spec = importlib.util.spec_from_file_location(
    'simulator', Path(__file__).resolve().parents[1] / 'scripts/run_phase4_simulator.py')
sim = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sim)


class SetupTests(unittest.TestCase):
    def test_controlled_case_cannot_fall_back_to_another_device_or_runtime(self):
        result = subprocess.CompletedProcess('list', 0, json.dumps({'devices': {'other-runtime': [
            {'name': 'iPhone', 'deviceTypeIdentifier': 'other-type'}]}}), '')
        with patch.object(sim, 'command', return_value=result) as command, tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(RuntimeError, 'No available iPhone'):
                with sim.fresh_simulator('moving', Path(temp), controlled=True):
                    self.fail('Wrong environment must not be used')
            self.assertEqual(command.call_count, 1)

    def test_cold_discovery_retries_before_creating_any_device(self):
        with patch.object(sim, 'command') as command, patch.object(sim.time, 'sleep') as sleep:
            command.side_effect = [subprocess.TimeoutExpired('list', 120),
                                   subprocess.CompletedProcess('list', 0, '{"devices": {}}', '')]
            with tempfile.TemporaryDirectory() as temp:
                with self.assertRaisesRegex(RuntimeError, 'No available iPhone'):
                    with sim.fresh_simulator('stationary', Path(temp)):
                        self.fail('No device should be created')
            self.assertEqual(command.call_count, 2)
            self.assertTrue(all(c.kwargs['timeout'] == 120 for c in command.call_args_list))
            sleep.assert_called_once_with(12)

    def test_discovery_exhaustion_is_a_failure(self):
        with patch.object(sim, 'command', side_effect=subprocess.TimeoutExpired('list', 120)) as command, patch.object(sim.time, 'sleep'):
            with tempfile.TemporaryDirectory() as temp:
                with self.assertRaises(subprocess.TimeoutExpired):
                    with sim.fresh_simulator('stationary', Path(temp)):
                        self.fail('Unready simulator must fail')
            self.assertEqual(command.call_count, 3)

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
                with self.assertRaises(RuntimeError):
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
        self.assertEqual(actions, ['list', 'create', 'boot', 'bootstatus', 'spawn', 'install', 'get_app_container', 'shutdown', 'delete'])
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
            log.write_text('[QA CONFIG] protocol=1 seed=335 hz=60 batch=2 profile=moving\n'
                           '[PHASE4 QA] profile=moving started world=1\n'
                           '[PHASE4 PLAYTEST] outcome=complete world=1 room=20\n')
            def command(*args, **kwargs):
                if 'screenshot' in args:
                    raise subprocess.TimeoutExpired(args, 45)
                return subprocess.CompletedProcess(args, 0, '', '')
            with patch.object(sim, 'command', side_effect=command):
                sim.run_campaign('moving', 10, root, log, root / 'stderr.log', 'device')
            self.assertTrue((root / 'moving-capture-errors.log').exists())

    def test_real_defeat_or_wrong_seed_fails_without_relaunch(self):
        for outcome, seed in [('defeat', 335), ('complete', 999)]:
            with self.subTest(outcome=outcome, seed=seed), tempfile.TemporaryDirectory() as temp:
                root = Path(temp)
                log = root / 'moving.log'
                log.write_text(f'[QA CONFIG] protocol=1 seed={seed} hz=60 batch=2 profile=moving\n'
                               '[PHASE4 QA] profile=moving started world=1\n'
                               f'[PHASE4 PLAYTEST] outcome={outcome} world=1 room=9\n')
                with patch.object(sim, 'command', return_value=subprocess.CompletedProcess('launch', 0, 'pid', '')) as command:
                    with self.assertRaises(RuntimeError):
                        sim.run_campaign('moving', 10, root, log, root / 'stderr.log', 'device')
                    launches = [call for call in command.call_args_list if 'launch' in call.args]
                    self.assertEqual(len(launches), 1)
                    self.assertIn('-qaSeed', launches[0].args)

    def test_missing_outcome_still_fails(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            log = root / 'moving.log'
            log.write_text('[PHASE4 QA] profile=moving started world=1\n')
            with patch.object(sim, 'command', return_value=subprocess.CompletedProcess('launch', 0, 'pid', '')):
                with self.assertRaisesRegex(TimeoutError, 'no terminal outcome'):
                    sim.run_campaign('moving', 0, root, log, root / 'stderr.log', 'device')


if __name__ == '__main__':
    unittest.main()
