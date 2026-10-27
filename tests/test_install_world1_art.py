#!/usr/bin/env python3
"""Regression tests for the World 1 art installer; no Xcode required."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "install_world1_art.py"
spec = importlib.util.spec_from_file_location("install_world1_art", SCRIPT)
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


class InstallWorldOneArtTests(unittest.TestCase):
    def test_single_landscape_does_not_require_other_landscapes(self):
        with tempfile.TemporaryDirectory() as root:
            base = Path(root)
            source = base / "source"
            destination = base / "Assets.xcassets"
            source.mkdir()
            destination.mkdir()
            selected = [name for name in installer.NAMES
                        if name.startswith("world1_ruined_outpost_")]
            self.assertEqual(len(selected), 9)
            for name in selected:
                (source / (name + ".png")).write_bytes(b"test fixture")
            with patch.object(installer, "DESTINATION", destination), patch(
                "sys.argv", ["install_world1_art.py", str(source), "ruined_outpost"]
            ):
                self.assertEqual(installer.main(), 0)
            self.assertEqual(len(list(destination.glob("*.imageset"))), 9)
            self.assertTrue((destination / "world1_ruined_outpost_wall.imageset" /
                             "Contents.json").is_file())

    def test_missing_asset_does_not_write_partial_catalog(self):
        with tempfile.TemporaryDirectory() as root:
            base = Path(root)
            source = base / "source"
            destination = base / "Assets.xcassets"
            source.mkdir()
            destination.mkdir()
            with patch.object(installer, "DESTINATION", destination), patch(
                "sys.argv", ["install_world1_art.py", str(source), "ruined_outpost"]
            ):
                self.assertEqual(installer.main(), 1)
            self.assertEqual(list(destination.iterdir()), [])

    def test_invalid_landscape_is_rejected(self):
        with tempfile.TemporaryDirectory() as root:
            base = Path(root)
            source = base / "source"
            destination = base / "Assets.xcassets"
            source.mkdir()
            destination.mkdir()
            with patch.object(installer, "DESTINATION", destination), patch(
                "sys.argv", ["install_world1_art.py", str(source), "unknown"]
            ):
                self.assertEqual(installer.main(), 2)


if __name__ == "__main__":
    unittest.main()
