import subprocess
import sys
import tempfile
from contextlib import contextmanager
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from check_campaign341 import capture, capture_visible_frame, record_video
from run_phase4_simulator import focused_simulator
from simulator_startup import RecoverableStartupError


class Campaign341SurfaceTests(unittest.TestCase):
    def test_retries_only_the_surface_and_preserves_the_black_frame(self):
        blank = Image.new("RGB", (120, 200))
        ready = Image.new("RGB", (120, 200))
        ready.putdata([(x, y, 0) for y in range(200) for x in range(120)])
        frames = iter((blank, ready))

        def take_screenshot(*args, **kwargs):
            self.assertEqual(args[2:5], ("io", "phone", "screenshot"))
            next(frames).save(args[-1])

        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder)
            with patch("check_campaign341.command", side_effect=take_screenshot) as command, patch("check_campaign341.time.sleep"):
                capture_visible_frame("phone", output, "legacy-iron")
                self.assertEqual(command.call_count, 2)
            self.assertTrue((output / "legacy-iron.png").is_file())
            self.assertTrue((output / "rejected-surfaces/legacy-iron-1.png").is_file())

    def test_four_blank_surfaces_fail_without_claiming_evidence(self):
        def take_screenshot(*args, **kwargs):
            Image.new("RGB", (120, 200)).save(args[-1])

        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder)
            with patch("check_campaign341.command", side_effect=take_screenshot) as command, patch("check_campaign341.time.sleep"):
                with self.assertRaisesRegex(RuntimeError, "did not present a usable frame"):
                    capture_visible_frame("phone", output, "legacy-iron")
                self.assertEqual(command.call_count, 4)
            self.assertFalse((output / "legacy-iron.png").exists())
            self.assertEqual(len(list((output / "rejected-surfaces").glob("*.png"))), 4)


    def test_observes_original_app_after_launch_client_times_out(self):
        def launch(*args, **kwargs):
            self.assertEqual(args[2], "launch")
            log = next(arg for arg in args if arg.startswith("--stdout="))
            Path(log.removeprefix("--stdout=")).write_text("[READY]")
            raise subprocess.TimeoutExpired(args, 90)

        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder)
            with patch("check_campaign341.command", side_effect=launch) as command, patch(
                "check_campaign341.capture_visible_frame"
            ) as frame, patch("check_campaign341.time.sleep"):
                capture("phone", output, "iron", "-captureIron", "[READY]")
                command.assert_called_once()
                frame.assert_called_once_with("phone", output, "iron")

    def test_does_not_stop_recorder_before_encoding_starts(self):
        recorder = Mock()
        recorder.poll.side_effect = (None, None, 0)
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder)
            movie = output / "stoneback.mp4"
            log = output / "video.log"

            def delay(seconds):
                if seconds == 1:
                    self.assertFalse(recorder.send_signal.called)
                    log.write_text("Recording started")
                elif seconds == 7:
                    movie.write_bytes(b"frame" * 1024)

            with patch("check_campaign341.subprocess.Popen", return_value=recorder), patch(
                "check_campaign341.time.sleep", side_effect=delay
            ) as sleep:
                record_video("phone", movie, log)
            self.assertEqual([item.args[0] for item in sleep.call_args_list], [1, 7])
            recorder.send_signal.assert_called_once()

    def test_first_fixture_requires_positive_process_absence(self):
        for proven_absent in (True, False):
            with self.subTest(proven_absent=proven_absent), tempfile.TemporaryDirectory() as folder:
                timeout = subprocess.TimeoutExpired("simctl", 120)
                expected = RecoverableStartupError if proven_absent else TimeoutError
                with patch("check_campaign341.command", side_effect=timeout) as launch, patch(
                    "check_campaign341.time.monotonic", side_effect=(0, 61)
                ), patch("check_campaign341.snapshot", return_value={"app_proven_absent": proven_absent}):
                    with self.assertRaises(expected):
                        capture("phone", Path(folder), "iron", "-captureIron", "[READY]", first=True)
                self.assertNotIn("--terminate-running-process", launch.call_args.args)

    def test_fresh_device_retry_waits_for_fence_and_rejects_late_output(self):
        for late_output in (False, True):
            with self.subTest(late_output=late_output), tempfile.TemporaryDirectory() as folder:
                events = []

                @contextmanager
                def fresh(profile, startup, *, controlled, device_type, warm_before_spawn):
                    events.append(("start", device_type))
                    try:
                        yield device_type
                    finally:
                        events.append(("fenced", device_type))
                        if late_output:
                            (startup / "initial-fixture" / "iron.log").write_text("[READY]")

                def prepare(device, output):
                    if device == "iPhone-16-Pro":
                        raise RecoverableStartupError("proven unstarted first fixture")

                with patch("run_phase4_simulator.fresh_simulator", side_effect=fresh):
                    if late_output:
                        with self.assertRaisesRegex(RuntimeError, "during cleanup"):
                            with focused_simulator("build341", Path(folder), prepare=prepare):
                                self.fail("The alternate device was started")
                    else:
                        with focused_simulator("build341", Path(folder), prepare=prepare) as device:
                            self.assertEqual(device, "iPhone-16")
                expected = [("start", "iPhone-16-Pro"), ("fenced", "iPhone-16-Pro")]
                if not late_output:
                    expected += [("start", "iPhone-16"), ("fenced", "iPhone-16")]
                self.assertEqual(events, expected)
