"""Validate actual imported frames and their catalog registration."""
import importlib.util
from pathlib import Path
import unittest
import tempfile

spec = importlib.util.spec_from_file_location('enemy_audit', Path(__file__).resolve().parents[1] / 'scripts/audit_build337_enemies.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class EnemyAssetTests(unittest.TestCase):
    def test_complete_registered_enemy_sources(self):
        result = audit.audit()
        self.assertEqual({k: len(v) for k, v in result['mossbot_sequences'].items()},
                         {'idle': 8, 'move': 8, 'attack': 10, 'hit': 6, 'defeat': 8})
        self.assertEqual(set(result['native_portraits']), {'grunt', 'scout', 'raider', 'heavy', 'shooter', 'lobber'})
        self.assertEqual(len(result['boss_portraits']), 4)
        self.assertEqual(len(result['browser_enemy_portraits_not_native_entities']), 6)

    def test_corrupted_frame_body_is_rejected_after_a_valid_header(self):
        source = audit.ROOT / "OutpostZero/Assets.xcassets/mossbot_idle_00.imageset/mossbot_idle_00.png"
        data = bytearray(source.read_bytes())
        offset = data.index(b"IDAT") + 4
        data[offset + 10] ^= 1
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "corrupted.png"
            path.write_bytes(data)
            with self.assertRaisesRegex(ValueError, "PNG CRC mismatch"):
                audit.png_info(path)
