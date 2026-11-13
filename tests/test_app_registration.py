"""Readiness fault injection; these fixtures are not gameplay evidence."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import simulator_startup as startup
import run_phase4_simulator as sim

VALID = {'CFBundleIdentifier': startup.BUNDLE,
         'CFBundleExecutable': 'OutpostZero', 'ApplicationType': 'User'}


class RegistrationTests(unittest.TestCase):
    def exercise(self, states, expected=True, failure=None):
        now, calls, pending = [0], [], list(states)
        def command(*args, **kwargs):
            calls.append(args)
            self.assertLessEqual(kwargs['timeout'], 20)
            if 'appinfo' in args:
                if failure == 'timeout':
                    now[0] += kwargs['timeout']
                    raise subprocess.TimeoutExpired(args, kwargs['timeout'])
                return subprocess.CompletedProcess(args, 1 if failure == 'missing' else 0, '{}', '')
            self.assertEqual(args[0], 'plutil')
            info = pending.pop(0) if len(pending) > 1 else pending[0]
            return subprocess.CompletedProcess(args, 0,
                'invalid plist' if failure == 'malformed' else json.dumps(info), '')
        with tempfile.TemporaryDirectory() as temp, \
             patch.object(startup.time, 'monotonic', side_effect=lambda: now[0]), \
             patch.object(startup.time, 'sleep', side_effect=lambda seconds: now.__setitem__(0, now[0] + seconds)):
            root = Path(temp)
            if expected:
                startup.wait_for_app_registration(command, 'owned-device', root)
                self.assertTrue(json.loads((root / 'registration/ready.json').read_text())['ready'])
            else:
                with self.assertRaisesRegex(startup.RecoverableStartupError, 'no launch attempted'):
                    startup.wait_for_app_registration(command, 'owned-device', root)
                self.assertFalse((root / 'registration/ready.json').exists())
                self.assertEqual(now[0], 180)
            self.assertTrue(list((root / 'registration').iterdir()))
        self.assertFalse(any('launch' in args or 'install' in args for args in calls))
        return calls

    def test_requires_two_consecutive_installed_identity_samples(self):
        placeholder = {**VALID, 'IsPlaceholder': True}
        calls = self.exercise([placeholder, VALID, placeholder, VALID, VALID])
        self.assertEqual(sum('appinfo' in args for args in calls), 5)

    def test_wrong_identity_or_placeholder_cannot_be_ready(self):
        for info in (None, {}, {**VALID, 'CFBundleExecutable': 'AnotherApp'},
                     {**VALID, 'CFBundleIdentifier': 'other.bundle'},
                     {**VALID, 'ApplicationType': 'Placeholder'},
                     {**VALID, 'isPlaceholder': True}):
            with self.subTest(info=info):
                self.assertFalse(startup.registered_app(info))
        self.exercise([{**VALID, 'IsPlaceholder': True}], expected=False)

    def test_missing_malformed_and_unresponsive_registry_fail_closed_at_deadline(self):
        for failure in ('missing', 'malformed', 'timeout'):
            with self.subTest(failure=failure):
                self.exercise([VALID], expected=False, failure=failure)

    def test_controlled_device_does_not_yield_before_registration(self):
        def command(*args, **kwargs):
            action = args[2]
            stdout = ''
            if action == 'list':
                stdout = json.dumps({'devices': {'com.apple.CoreSimulator.SimRuntime.iOS-18-5': [{
                    'name': 'iPhone 16 Pro', 'deviceTypeIdentifier':
                    'com.apple.CoreSimulator.SimDeviceType.iPhone-16-Pro'}]}})
            elif action == 'create':
                stdout = 'owned-device'
            return subprocess.CompletedProcess(args, 0, stdout, '')
        with tempfile.TemporaryDirectory() as temp, patch.object(sim, 'command', side_effect=command), \
             patch.object(sim, 'wait_for_app_registration', side_effect=startup.RecoverableStartupError('not registered')) as wait, \
             patch.object(sim, 'snapshot'):
            with self.assertRaises(startup.RecoverableStartupError):
                with sim.fresh_simulator('moving', Path(temp), controlled=True):
                    self.fail('Unregistered app must not be launched')
            wait.assert_called_once()


if __name__ == '__main__':
    unittest.main()
