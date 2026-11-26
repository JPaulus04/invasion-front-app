import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from check_campaign341 import capture_visible_frame


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
