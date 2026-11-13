"""Failure-injection tests, never synthetic gameplay validation evidence."""
from contextlib import contextmanager
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import simulator_startup as startup
import run_phase4_simulator as sim


class LaunchTests(unittest.TestCase):
    def exercise(self, failure=True, absent=True, text='', stderr='', late=False):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            log, errors = root / 'moving.log', root / 'stderr.log'
            log.write_text(text)
            errors.write_text(stderr)
            command = Mock(return_value=subprocess.CompletedProcess('launch', 0, 'pid', ''))
            if failure:
                command.side_effect = subprocess.TimeoutExpired('launch', 90)
            def sleep(_):
                if late:
                    log.write_text('[PHASE4 QA] profile=moving started world=1\n')
            with patch.object(startup, 'snapshot', return_value={'app_proven_absent': absent}), \
                 patch.object(startup.time, 'monotonic', side_effect=[0, 0, 61]), \
                 patch.object(startup.time, 'sleep', side_effect=sleep):
                try:
                    startup.launch_initial(command, 'moving', 335, 4, 'device', root, log, errors)
                    error = None
                except RuntimeError as caught:
                    error = caught
            self.assertEqual(command.call_count, 1)
            return error

    def test_only_failed_empty_launch_with_proven_absence_is_recoverable(self):
        self.assertIsInstance(self.exercise(), startup.RecoverableStartupError)
        for args in ({'absent': False}, {'stderr': 'app error'},
                     {'text': 'partial app output'}, {'failure': False}):
            with self.subTest(args=args):
                error = self.exercise(**args)
                self.assertIsInstance(error, RuntimeError)
                self.assertNotIsInstance(error, startup.RecoverableStartupError)

    def test_late_start_after_client_timeout_continues_same_process(self):
        self.assertIsNone(self.exercise(late=True))

    def test_any_qa_evidence_including_defeat_or_wrong_config_latches(self):
        for text in ('[QA CONFIG] malformed', '[QA REPLAY] tick=1',
                     '[PHASE4 PLAYTEST] outcome=defeat'):
            self.assertIsNone(self.exercise(text=text))

    def test_real_defeat_after_timed_out_client_is_not_retried(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            log = root / 'moving.log'
            log.write_text('[QA CONFIG] protocol=1 seed=335 hz=60 batch=4 profile=moving\n'
                           '[PHASE4 QA] profile=moving started world=1\n'
                           '[PHASE4 PLAYTEST] outcome=defeat world=1 room=9\n')
            def command(*args, **kwargs):
                if 'launch' in args:
                    raise subprocess.TimeoutExpired(args, 90)
                return subprocess.CompletedProcess(args, 0, '', '')
            with patch.object(sim, 'command', side_effect=command) as calls:
                with self.assertRaisesRegex(RuntimeError, 'real gameplay outcome failed'):
                    sim.run_campaign('moving', 10, root, log, root / 'stderr.log', 'device', 335, 4)
                self.assertEqual(sum('launch' in call.args for call in calls.call_args_list), 1)

    def test_failed_process_probes_or_crash_report_forbid_recovery(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'Library/Logs/DiagnosticReports').mkdir(parents=True)
            report = root / 'Library/Logs/DiagnosticReports/OutpostZero.crash'
            for unknown, alive, crash in [(True, False, False), (False, True, False),
                                          (False, False, True), (False, False, False)]:
                report.unlink(missing_ok=True)
                if crash:
                    report.write_text('crash')
                def command(*args, **kwargs):
                    if unknown:
                        raise subprocess.TimeoutExpired(args, 20)
                    return subprocess.CompletedProcess(args, 0,
                        '123 /app/OutpostZero' if alive else '123 /sbin/launchd', '')
                with patch.object(startup.Path, 'home', return_value=root):
                    state = startup.snapshot(command, 'device', root, 'probe', 0)
                self.assertEqual(state['app_proven_absent'], not (unknown or alive or crash))


class RecoveryTests(unittest.TestCase):
    def exercise(self, failure, late_output=False):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            devices = []
            @contextmanager
            def fresh(profile, output, controlled=False):
                devices.append(output)
                (output / 'moving-device.json').write_text(json.dumps({
                    'runtime': 'iOS-18-5', 'device_type': 'iPhone-16-Pro'}))
                if failure in ('boot', 'install'):
                    raise startup.RecoverableStartupError(failure)
                try:
                    yield 'device'
                finally:
                    if late_output:
                        (output / 'moving.log').write_text('[QA CONFIG] late')
            def campaign(*args):
                if failure == 'once' and len(devices) == 2:
                    return  # Lifecycle fixture, not simulator outcome evidence.
                if failure in ('launch', 'once'):
                    raise startup.RecoverableStartupError('launch')
                raise RuntimeError('real defeat')
            with patch.object(sim, 'fresh_simulator', side_effect=fresh), \
                 patch.object(sim, 'run_campaign', side_effect=campaign) as campaigns, \
                 patch.object(sim, 'command', return_value=subprocess.CompletedProcess('xcode', 0, 'Xcode', '')), \
                 patch.object(sim.Path, 'read_bytes', return_value=b'app'), \
                 patch.object(sim.subprocess, 'check_output', return_value='a' * 40):
                if failure == 'once':
                    sim.run('moving', 10, 335, 4, root)
                else:
                    with self.assertRaises(RuntimeError):
                        sim.run('moving', 10, 335, 4, root)
            history = json.loads((root / 'startup.json').read_text())
            self.assertTrue((root / 'startup-1/moving.log').exists())
            return len(devices), campaigns.call_count, history

    def test_boot_and_initial_launch_recovery_exhaust_after_two_devices(self):
        for failure in ('boot', 'install', 'launch'):
            with self.subTest(failure=failure):
                devices, calls, history = self.exercise(failure)
                self.assertEqual(devices, 2)
                self.assertEqual(len(history), 2)

    def test_startup_failure_can_recover_once_and_preserves_both_attempts(self):
        devices, calls, history = self.exercise('once')
        self.assertEqual((devices, calls), (2, 2))
        self.assertEqual([h['result'] for h in history], ['startup_failed', 'campaign_completed'])

    def test_existing_campaign_cannot_be_overwritten(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            log = root / 'moving.log'
            log.write_text('[PHASE4 PLAYTEST] outcome=defeat')
            with self.assertRaises(FileExistsError), patch.object(sim, 'command') as calls:
                sim.run('moving', 10, 335, 4, root)
            calls.assert_not_called()
            self.assertIn('defeat', log.read_text())

    def test_gameplay_failure_never_creates_another_device(self):
        devices, calls, history = self.exercise('gameplay')
        self.assertEqual((devices, calls), (1, 1))
        self.assertEqual(history[0]['result'], 'failed_no_retry')

    def test_late_output_after_cleanup_forbids_another_device(self):
        devices, calls, history = self.exercise('launch', late_output=True)
        self.assertEqual((devices, calls), (1, 1))
        self.assertEqual(history[0]['result'], 'late_output_recovery_forbidden')


if __name__ == '__main__':
    unittest.main()
