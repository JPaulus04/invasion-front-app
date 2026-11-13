"""Synthetic protocol/acceptance fixtures, never simulator gameplay evidence."""
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from analyze_qa_replays import evaluate, PAIRS


def trace_lines(terminal, extra=''):
    digest = 0xcbf29ce484222325
    rows = []
    for tick in range(11):
        payload = f'tick={tick} ' + (f'terminal={terminal} room=20' if tick == 10 else f'state hp=100 {extra}')
        for byte in (payload + '\n').encode():
            digest = ((digest ^ byte) * 0x100000001b3) & ((1 << 64) - 1)
        rows.append(f'[QA REPLAY] {payload} digest={digest:x}')
    return '\n'.join(rows) + '\n'


def fixture(root):
    for profile, seed in PAIRS:
        for batch in (2, 4):
            case = root / f'{profile}-{seed}-{batch}'
            case.mkdir()
            (case / 'run.json').write_text(json.dumps({'profile': profile, 'seed': seed, 'batch': batch,
                'protocol': 1, 'hz': 60, 'source': 'a' * 40, 'app_sha256': 'b' * 64,
                'architecture': 'arm64', 'xcode': 'Xcode test fixture', 'os_version': '15.test',
                'runtime': 'com.apple.CoreSimulator.SimRuntime.iOS-18-5',
                'device_type': 'com.apple.CoreSimulator.SimDeviceType.iPhone-16-Pro'}))
            text = f'[QA CONFIG] protocol=1 seed={seed} hz=60 batch={batch} profile={profile}\n'
            text += f'[PHASE4 QA] profile={profile} started world=1\n'
            if profile == 'moving':
                for room in range(1, 21):
                    kind = 'equipmentDefense' if room == 12 else 'tactical'
                    text += f'[PHASE4 ROOM] entered={room} encounter={kind} hp=100 level=2\n'
                    text += f'[PHASE4 ROOM] cleared={room} encounter={kind} hp=100 level=2 integrity=150\n'
                text += '[PHASE4 BOSS] spawned room=20\n[PHASE4 BOSS] defeated room=20\n'
                text += '[PHASE4 QA] choice=damage accepted=true room=1\n'
            outcome = 'complete' if profile == 'moving' else 'defeat'
            text += trace_lines(outcome)
            text += f'[PHASE4 PLAYTEST] outcome={outcome} world=1 room=20 elapsed=800 damage=100 movement={500 if profile == "moving" else 0} kills=500 upgrades={1 if profile == "moving" else 0} level=2\n'
            (case / f'{profile}.log').write_text(text)


class ReplayAcceptanceTests(unittest.TestCase):
    def case(self, mutation=None):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            fixture(root)
            if mutation:
                mutation(root)
            return evaluate(root)

    def test_all_cases_and_pairs_required(self):
        self.assertTrue(self.case()['passed'])

    def test_valid_but_diverging_trace_fails(self):
        def mutate(root):
            path = root / 'moving-335-4/moving.log'
            text = path.read_text().replace(trace_lines('complete'), trace_lines('complete', 'changed'))
            path.write_text(text)
        result = self.case(mutate)
        self.assertFalse(result['passed'])
        self.assertEqual(result['pairs'][1]['first_difference'], 0)

    def test_corrupt_trace_or_wrong_seed_is_rejected(self):
        for old, new in [('seed=335', 'seed=999'), ('state hp=100', 'state hp=99')]:
            def mutate(root):
                path = root / 'moving-335-2/moving.log'
                path.write_text(path.read_text().replace(old, new))
            with self.subTest(old=old), self.assertRaises(ValueError):
                self.case(mutate)

    def test_identical_moving_defeats_never_pass(self):
        def mutate(root):
            for batch in (2, 4):
                path = root / f'moving-336-{batch}/moving.log'
                text = path.read_text().replace(trace_lines('complete'), trace_lines('defeat'))
                path.write_text(text.replace('outcome=complete', 'outcome=defeat'))
        result = self.case(mutate)
        self.assertFalse(result['passed'])
        self.assertTrue(result['pairs'][2]['identical'])
        self.assertFalse(result['outcomes'][-1]['checks']['moving_completes_world_1'])

    def test_missing_case_or_mismatched_binary_fails(self):
        def missing(root):
            (root / 'moving-336-4/run.json').unlink()
        with self.assertRaises(OSError):
            self.case(missing)
        def changed(root):
            p = root / 'moving-336-4/run.json'
            value = json.loads(p.read_text()); value['app_sha256'] = 'c' * 64
            p.write_text(json.dumps(value))
        self.assertFalse(self.case(changed)['passed'])

    def test_different_terminal_metrics_fail_even_with_equal_trace(self):
        def mutate(root):
            p = root / 'moving-335-4/moving.log'
            p.write_text(p.read_text().replace('kills=500', 'kills=499'))
        result = self.case(mutate)
        self.assertTrue(result['pairs'][1]['identical'])
        self.assertFalse(result['pairs'][1]['terminal_equal'])
        self.assertFalse(result['passed'])
