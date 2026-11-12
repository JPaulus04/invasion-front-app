# Phase 4 gameplay validation

Push one completed batch with `[phase4-review]` to run the existing compile gate,
then the dedicated reusable `phase4-gameplay.yml` workflow. Both simulator jobs
consume the app artifact from that same workflow run; no older binary is selected.

Each profile creates a disposable iPhone simulator with empty app data, waits for
boot readiness, installs the app, and starts through `enterSelectedWorld`.
This avoids the first-boot uninstall timeout observed in run 42418889345.
Setup command output and device identity are retained with the artifacts.
Shutdown/delete are bounded, restricted to the new device, and cannot mask
a setup or gameplay failure.
Both select earned upgrades through card hit testing and buy checkpoint repairs
through the same guarded function as player input. Cleared-room exits use ordinary
collision-resolved movement. No kills, room clears, XP or victories are injected.

Stationary means stationary during active rooms. Exit transit, including survival
extraction, is permitted and is excluded from the existing active-room movement
metric. Moving samples collision-resolved directions every 150 ms, avoids nearby enemies,
incoming projectiles and visible mortar circles, and approaches XP when safe.
Its 450 ms prediction uses current visible threats, not future spawn schedules.
This measures that policy, not human skill or statistical win rate.
Run 42431522703 confirmed setup recovery but failed moving acceptance in Room 5;
the reactive policy replaces the fixed weave without changing game difficulty.

The acceptance job requires one real terminal outcome per profile: stationary
World 1 defeat, moving Room 20 completion, actual movement and earned upgrades.
A crash, absent outcome, or 25-minute wall-time limit fails validation rather than
being treated as success. Logs, revision, periodic screenshots and JSON acceptance
results are retained for 14 days. Inspect failed runs before changing balance:
a driver navigation failure is not evidence that player difficulty is wrong.

Local checks: source sanity, Python syntax, workflow YAML parsing, and positive /
negative analyzer fixtures. iOS compilation and live simulator outcomes remain CI
checks; parser fixtures are not gameplay evidence.

## Phase 4 presentation acceptance checkpoint

The compact physical campaign exit beacon replaces the oversized blue upright portal. Verify screenshots of the cleared tactical room exit, settled upgrade cards, reactor integrity label, and World 1 victory overlay. Source compilation alone does not establish visual approval; inspect screenshots for obscured text, gameplay bleed-through, and exit readability before closing Phase 4.
