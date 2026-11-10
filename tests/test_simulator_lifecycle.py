#!/usr/bin/env python3
"""Regression tests for simulator command failure categories; no Xcode required."""
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import simulator_lifecycle as lifecycle


class SimulatorLifecycleTests(unittest.TestCase):
    def test_app_failure_is_not_infrastructure(self):
        failure = subprocess.CompletedProcess(["xcrun"], 1, "", "app assertion failed")
        with patch.object(lifecycle.subprocess, "run", return_value=failure):
            with self.assertRaisesRegex(RuntimeError, "GAME_OR_HARNESS_FAILURE"):
                lifecycle.command("xcrun", "simctl", "launch", "device")

    def test_service_failure_is_infrastructure(self):
        failure = subprocess.CompletedProcess(["xcrun"], 1, "", "CoreSimulator service connection lost")
        with patch.object(lifecycle.subprocess, "run", return_value=failure):
            with self.assertRaisesRegex(RuntimeError, "SIMULATOR_INFRASTRUCTURE"):
                lifecycle.command("xcrun", "simctl", "boot", "device")

    def test_timeout_is_infrastructure(self):
        with patch.object(lifecycle.subprocess, "run", side_effect=subprocess.TimeoutExpired("simctl", 2)):
            with self.assertRaisesRegex(RuntimeError, "SIMULATOR_INFRASTRUCTURE"):
                lifecycle.command("xcrun", "simctl", "list", timeout=2)

    def test_jsonl_diagnostics(self):
        success = subprocess.CompletedProcess(["xcrun"], 0, "ok", "")
        with tempfile.TemporaryDirectory() as folder:
            with patch.dict(os.environ, {"OUTPOST_SIM_DIAGNOSTICS": folder + "/log.jsonl"}):
                with patch.object(lifecycle.subprocess, "run", return_value=success):
                    lifecycle.command("xcrun", "simctl", "list")
            self.assertIn('"exit_code": 0', Path(folder, "log.jsonl").read_text())


if __name__ == "__main__":
    unittest.main()
