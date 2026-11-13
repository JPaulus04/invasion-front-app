# Build 335 final QA: controlled gameplay replay

## Historical evidence

Both runs used app source 60591634957fd52aeef775193efe799f0339d97e and the same compiled simulator artifact in workflow 43365313014. They were not controlled replays: neither a seed nor per-frame deltas were recorded.

| Trial | First choices | Outcome | Combat seconds | Damage | Kills | Upgrades |
|---|---|---|---:|---:|---:|---:|
| Attempt 1 moving | Orbit, Explosive, Explosive | Defeat, Room 9 | 287 | 160 | 262 | 8 |
| Attempt 2 moving | Damage, Orbit, Damage, Fire Rate | Complete, Room 20 | 673 | 10 | 847 | 13 |

Evidence: https://github.com/JPaulus04/invasion-front-app/actions/runs/43365313014/attempts/1 and /attempts/2. The original logs and screenshots remain artifacts on that run. The failed pilot was moving and taking real damage; it was not a simulator launch failure or an invented terminal result.

The input policy prioritizes Damage then Fire Rate. Choosing Orbit first in the losing trial therefore already demonstrates different available upgrade draws before the difficult survival encounters. Spawn candidate positions and enemy weave phases also used system randomness. This supports random encounter/progression differences as a contributor; absent old seeds and frame telemetry, it does not prove a sole cause or permit reconstructing those exact two histories.

Timing was also uncontrolled: update used variable frame deltas capped at 0.05, reactive steering sampled combat time, reward reveal completion used a wall-clock SKAction, and flank deployment used a wall-clock SKAction paused with the arena. The driver heuristic can fail against some threat/loadout combinations. No balance or driver-policy code changed between the two old trials. A win after a loss is not evidence that either balance or QA robustness is correct.

## Focused correction

Normal play retains system randomness, variable frame timing, animations, and existing flank scheduling. Only a simulator QA profile with an explicit valid seed and render batch enables replay. A seed flag without a QA profile cannot enable replay; physical-device play cannot enable it.

- SplitMix64 v1 supplies independent spawn/phase and upgrade/shuffle streams. Normal streams delegate to SystemRandomNumberGenerator; weighted draws, eligibility, shuffle algorithm and combat values are unchanged.
- Controlled QA advances the same update logic at 60 fixed simulation ticks per second. Two or four ticks are processed per render callback. This changes test throughput, not damage, speeds, cooldowns or world-time durations.
- Reward reveal uses its existing 1.35-second duration on the replay clock, then calls the shared reveal/choice methods. Flank deployment uses its existing warning duration on the paused combat clock. Cosmetic actions remain cosmetic. No health, outcome, rewards, enemy counts, driver priorities or speed limits are overridden.
- Header records seed, tick rate, batch, profile and protocol. Events record upgrade offers, accepted inputs, spawning, state checkpoints and actual terminal state with a tick-indexed rolling checksum. Positions are canonicalized to 1e-6 world units. The trace covers gameplay observables, not every cosmetic node or arbitrary cross-platform floating-point bit patterns.
- Manifests record source SHA, SHA-256 of the exact installed executable, architecture, Xcode and simulator identity. Pairs must share source, executable and environment.

## Predeclared validation, not retries

Seeds 335 and 336 were selected from the build number and its successor before observing any seeded result. CI runs six independent fresh-device cases: stationary/335 at batches 2 and 4, moving/335 at batches 2 and 4, and moving/336 at batches 2 and 4. Every moving case must complete all 20 rooms, defeat the boss, choose upgrades and preserve the reactor under the original acceptance checks. Stationary must lose with zero movement. Every same-seed pair must produce an identical valid gameplay trace across render cadences.

A reproducible moving defeat still FAILS. A divergent pair FAILS even if both win. Missing cases, wrong seed/configuration, corrupt traces, mixed source/binary/environment, incomplete logs and simulator failures FAIL. There is no gameplay retry loop and no successful-run selection. All cases upload evidence even when another case fails. The future release gate requires all six jobs plus the stricter assessment; it is not executed by this work.

Run one diagnostic case on macOS after unpacking the exact workflow app:

```sh
python3 scripts/run_phase4_simulator.py moving --seed 335 --batch 2 --output phase4/moving-335-2
```

Analyze all downloaded case artifacts:

```sh
python3 scripts/analyze_qa_replays.py phase4
```

Seeded failures must remain visible and be investigated as driver/encounter robustness or balance evidence. Do not search for winning seeds, change expected outcomes, or rerun until green. These tests do not by themselves establish real-player difficulty or device performance. No merge or TestFlight upload is part of final QA.
