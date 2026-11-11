"""Phase 4 campaign and simulator setup regression tests (no macOS required)."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
import simulator_lifecycle as lifecycle

spec = importlib.util.spec_from_file_location("phase4_runner", SCRIPTS / "run_phase4_simulator.py")
sim = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sim)

PNG = bytes.fromhex("89504e470d0a1a0a") + b"test"


class SetupTests(unittest.TestCase):
    def test_fresh_device_is_created_and_destroyed(self):
        calls = []

        def fake_command(*args, **kwargs):
            action = args[2]
            calls.append((action, args))
            if action == "list":
                return subprocess.CompletedProcess(args, 0, json.dumps({"devices": {
                    "runtime-ios": [{"name": "iPhone 17", "isAvailable": True,
                                     "deviceTypeIdentifier": "type-iphone"}]}}), "")
            if action == "create":
                return subprocess.CompletedProcess(args, 0, "new-device\n", "")
            if action == "screenshot":
                Path(args[-1]).write_bytes(PNG)
            return subprocess.CompletedProcess(args, 0, "", "")

        with tempfile.TemporaryDirectory() as folder, patch.object(lifecycle, "command", side_effect=fake_command):
            with lifecycle.fresh_simulator("moving", folder) as device:
                self.assertEqual(device, "new-device")
                identity = json.loads((Path(folder) / "moving-device.json").read_text())
                self.assertTrue(identity["fresh_device"])
        self.assertEqual([action for action, _ in calls],
                         ["list", "create", "boot", "bootstatus", "screenshot",
                          "install", "shutdown", "delete"])
        self.assertTrue(all("existing-device" not in str(args) for _, args in calls))

    def test_failed_boot_does_not_install(self):
        calls = []

        def fake_command(*args, **kwargs):
            action = args[2]
            calls.append(action)
            if action == "list":
                return subprocess.CompletedProcess(args, 0, json.dumps({"devices": {
                    "runtime-ios": [{"name": "iPhone 17", "deviceTypeIdentifier": "type-iphone"}]}}), "")
            if action == "create":
                return subprocess.CompletedProcess(args, 0, "new-device\n", "")
            if action == "bootstatus":
                raise RuntimeError("SIMULATOR_INFRASTRUCTURE: boot timeout")
            return subprocess.CompletedProcess(args, 0, "", "")

        with tempfile.TemporaryDirectory() as folder, patch.object(lifecycle, "command", side_effect=fake_command):
            with self.assertRaisesRegex(RuntimeError, "SIMULATOR_INFRASTRUCTURE"):
                lifecycle.prepare_simulator("moving", folder)
        self.assertNotIn("install", calls)
        self.assertEqual(calls[-2:], ["shutdown", "delete"])

    def test_app_install_error_is_not_retried(self):
        calls = []

        def fake_command(*args, **kwargs):
            action = args[2]
            calls.append(action)
            if action == "list":
                return subprocess.CompletedProcess(args, 0, json.dumps({"devices": {
                    "runtime-ios": [{"name": "iPhone 17", "deviceTypeIdentifier": "type-iphone"}]}}), "")
            if action == "create":
                return subprocess.CompletedProcess(args, 0, "new-device\n", "")
            if action == "screenshot":
                Path(args[-1]).write_bytes(PNG)
            if action == "install":
                raise RuntimeError("GAME_OR_HARNESS_FAILURE: invalid app")
            return subprocess.CompletedProcess(args, 0, "", "")

        with tempfile.TemporaryDirectory() as folder, patch.object(lifecycle, "command", side_effect=fake_command):
            with self.assertRaisesRegex(RuntimeError, "GAME_OR_HARNESS_FAILURE"):
                lifecycle.prepare_simulator("moving", folder)
        self.assertEqual(calls.count("create"), 1)
        self.assertEqual(calls[-2:], ["shutdown", "delete"])


class CaptureTests(unittest.TestCase):
    def test_capture_failure_preserves_real_terminal_outcome(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            log = root / "moving.log"
            log.write_text("[PHASE4 QA] profile=moving started world=1\n"
                           "[PHASE4 PLAYTEST] outcome=complete world=1 room=20\n")

            def fake_command(*args, **kwargs):
                if "screenshot" in args:
                    raise RuntimeError("SIMULATOR_INFRASTRUCTURE: screenshot timed out")
                return subprocess.CompletedProcess(args, 0, "", "")

            with patch.object(sim, "command", side_effect=fake_command):
                sim.run_campaign("moving", 10, root, log, root / "stderr.log", "device")
            self.assertTrue((root / "moving-capture-errors.log").exists())

    def test_missing_outcome_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            log = root / "moving.log"
            log.write_text("[PHASE4 QA] profile=moving started world=1\n")
            with patch.object(sim, "command", return_value=subprocess.CompletedProcess([], 0, "", "")):
                with self.assertRaisesRegex(TimeoutError, "no terminal outcome"):
                    sim.run_campaign("moving", 0, root, log, root / "stderr.log", "device")


if __name__ == "__main__":
    unittest.main()
