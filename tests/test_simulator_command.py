"""Regression tests for shared simulator command classification."""
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import subprocess
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from simulator_command import execute


class SimulatorCommandTests(unittest.TestCase):
    def test_success(self):
        with patch("simulator_command.subprocess.run", return_value=subprocess.CompletedProcess(["xcrun", "simctl"], 0, "", "")):
            self.assertEqual(execute(["xcrun", "simctl", "list"], 5, "list"), 0)

    def test_timeout_is_infrastructure(self):
        with patch("simulator_command.subprocess.run", side_effect=subprocess.TimeoutExpired("simctl", 5)):
            self.assertEqual(execute(["xcrun", "simctl", "boot"], 5, "boot"), 70)

    def test_assertion_failure_is_not_retried_as_infrastructure(self):
        failure = subprocess.CompletedProcess(["xcrun", "simctl"], 1, "", "Precondition failed: camera lost pilot")
        with patch("simulator_command.subprocess.run", return_value=failure):
            self.assertEqual(execute(["xcrun", "simctl", "launch"], 5, "launch"), 71)

    def test_service_failure_is_infrastructure(self):
        failure = subprocess.CompletedProcess(["xcrun", "simctl"], 1, "", "CoreSimulator service connection interrupted")
        with patch("simulator_command.subprocess.run", return_value=failure):
            self.assertEqual(execute(["xcrun", "simctl", "launch"], 5, "launch"), 70)

    def test_structured_diagnostics(self):
        with tempfile.TemporaryDirectory() as folder:
            with patch.dict(os.environ, {"OUTPOST_SIM_DIAGNOSTICS": str(Path(folder) / "diagnostics.jsonl")}):
                with patch("simulator_command.subprocess.run", return_value=subprocess.CompletedProcess(["echo"], 0, "", "")):
                    execute(["echo", "hello"], 5, "health")
            self.assertIn('"category": "success"', (Path(folder) / "diagnostics.jsonl").read_text())


if __name__ == "__main__":
    unittest.main()
