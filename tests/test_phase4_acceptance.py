"""Synthetic parser fixtures only; these are not simulator gameplay evidence."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location(
    'acceptance', Path(__file__).resolve().parents[1] / 'scripts/analyze_phase4_playtests.py')
acceptance = importlib.util.module_from_spec(spec)
spec.loader.exec_module(acceptance)


class AcceptanceTests(unittest.TestCase):
    def fixture(self):
        stationary = ('[PHASE4 QA] profile=stationary started world=1\n'
                      '[PHASE4 PLAYTEST] outcome=defeat world=1 room=4 elapsed=60 '
                      'damage=100 movement=0 kills=25 upgrades=2 level=3\n')
        moving = '[PHASE4 QA] profile=moving started world=1\n'
        for room in range(1, 21):
            encounter = 'equipmentDefense' if room == 6 else 'tactical'
            moving += f'[PHASE4 ROOM] entered={room} encounter={encounter} hp=50 level=10\n'
            moving += f'[PHASE4 ROOM] cleared={room} encounter={encounter} hp=50 level=10 integrity=50\n'
        moving += ('[PHASE4 BOSS] spawned room=20\n[PHASE4 BOSS] defeated room=20\n'
                   '[PHASE4 QA] choice=damage accepted=true room=1\n'
                   '[PHASE4 PLAYTEST] outcome=complete world=1 room=20 elapsed=800 '
                   'damage=50 movement=50000 kills=500 upgrades=1 level=2\n')
        return stationary, moving

    def assess(self, stationary, moving):
        with tempfile.TemporaryDirectory() as temp:
            paths = [Path(temp) / name for name in ('stationary.log', 'moving.log')]
            for path, content in zip(paths, (stationary, moving)):
                path.write_text(content)
            return acceptance.assess(*paths)

    def test_complete_evidence(self):
        self.assertTrue(self.assess(*self.fixture())['passed'])

    def test_terminal_claim_cannot_replace_room_or_boss_evidence(self):
        stationary, moving = self.fixture()
        for removed in ('[PHASE4 ROOM] entered=13', '[PHASE4 ROOM] cleared=13',
                        '[PHASE4 BOSS] defeated room=20', '[PHASE4 QA] choice=damage'):
            with self.subTest(removed=removed):
                altered = '\n'.join(line for line in moving.splitlines() if not line.startswith(removed))
                self.assertFalse(self.assess(stationary, altered)['passed'])

    def test_missing_terminal_is_rejected(self):
        stationary, moving = self.fixture()
        with self.assertRaises(ValueError):
            self.assess(stationary, moving.split('[PHASE4 PLAYTEST]')[0])

    def test_dead_reactor_is_rejected(self):
        stationary, moving = self.fixture()
        self.assertFalse(self.assess(stationary, moving.replace('integrity=50', 'integrity=0'))['passed'])
