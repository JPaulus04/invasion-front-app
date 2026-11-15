"""Validate actual imported frames and their catalog registration."""
import importlib.util
from pathlib import Path
import unittest

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
