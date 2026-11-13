#!/usr/bin/env python3
"""All predeclared cases must meet original acceptance AND replay identically."""
import json
from pathlib import Path
import re
import sys
from analyze_phase4_playtests import assess, parse

PAIRS = [('stationary', 335), ('moving', 335), ('moving', 336)]


def evidence(root, profile, seed, batch):
    path = root / f'{profile}-{seed}-{batch}'
    manifest = json.loads((path / 'run.json').read_text())
    for key, expected in {'profile': profile, 'seed': seed, 'batch': batch,
                          'hz': 60, 'protocol': 1}.items():
        if manifest.get(key) != expected:
            raise ValueError(f'{path}: wrong {key}')
    text = (path / f'{profile}.log').read_text()
    header = f'[QA CONFIG] protocol=1 seed={seed} hz=60 batch={batch} profile={profile}'
    if text.splitlines().count(header) != 1:
        raise ValueError(f'{path}: missing/duplicate/mismatched replay configuration')
    trace = [line for line in text.splitlines() if line.startswith('[QA REPLAY] ')]
    outcome = parse(path / f'{profile}.log')['outcome']
    if len(trace) < 10 or f'terminal={outcome} ' not in trace[-1]:
        raise ValueError(f'{path}: incomplete/inconsistent gameplay trace')
    digest, previous_tick = 0xcbf29ce484222325, -1
    for line in trace:
        match = re.fullmatch(r'\[QA REPLAY\] (tick=(\d+) .+) digest=([0-9a-f]{1,16})', line)
        if not match or int(match[2]) < previous_tick:
            raise ValueError(f'{path}: invalid/nonmonotonic replay event')
        previous_tick = int(match[2])
        for byte in (match[1] + '\n').encode():
            digest = ((digest ^ byte) * 0x100000001b3) & ((1 << 64) - 1)
        if int(match[3], 16) != digest:
            raise ValueError(f'{path}: corrupt replay digest at tick {previous_tick}')
    if not re.fullmatch('[0-9a-f]{40}', manifest.get('source', '')) or not re.fullmatch('[0-9a-f]{64}', manifest.get('app_sha256', '')) or not manifest.get('architecture') or not manifest.get('xcode'):
        raise ValueError(f'{path}: missing source/app/environment provenance')
    return path, manifest, trace


def evaluate(root):
    results, fingerprints = [], set()
    for profile, seed in PAIRS:
        a, ma, ta = evidence(root, profile, seed, 2)
        b, mb, tb = evidence(root, profile, seed, 4)
        for manifest in (ma, mb):
            fingerprints.add((manifest['source'], manifest['app_sha256'], manifest.get('architecture'), manifest.get('xcode')))
        first_difference = next((i for i, (x, y) in enumerate(zip(ta, tb)) if x != y), None)
        identical = ta == tb
        pair = {'profile': profile, 'seed': seed, 'identical': identical,
                'events': [len(ta), len(tb)], 'first_difference': first_difference,
                'last_trace': [ta[-1], tb[-1]]}
        if first_difference is not None:
            pair['difference'] = [ta[first_difference], tb[first_difference]]
        results.append(pair)
    outcomes = []
    for seed in (335, 336):
        for batch in (2, 4):
            result = assess(root / f'stationary-335-{batch}' / 'stationary.log',
                            root / f'moving-{seed}-{batch}' / 'moving.log')
            outcomes.append({'seed': seed, 'batch': batch, **result})
    return {'pairs': results, 'outcomes': outcomes,
            'same_source_app_environment': len(fingerprints) == 1,
            'passed': len(fingerprints) == 1 and all(p['identical'] for p in results)
                      and all(r['passed'] for r in outcomes)}


if __name__ == '__main__':
    try:
        result = evaluate(Path(sys.argv[1]))
    except (OSError, ValueError, KeyError, IndexError) as error:
        result = {'passed': False, 'error': str(error)}
    print(json.dumps(result, indent=2))
    if not result['passed']:
        raise SystemExit('FAIL: gameplay acceptance or replay equivalence failed; no retries')
