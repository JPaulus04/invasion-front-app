# Phase 4 gameplay validation

Push one completed batch with `[phase4-review]` to run the existing compile gate,
then the dedicated reusable `phase4-gameplay.yml` workflow. Both simulator jobs
consume the app artifact from that same workflow run; no older binary is selected.

Each profile gets a clean app installation and starts through `enterSelectedWorld`.
Both select earned upgrades through card hit testing and buy checkpoint repairs
through the same guarded function as player input. Cleared-room exits use ordinary
collision-resolved movement. No kills, room clears, XP or victories are injected.

Stationary means stationary during active rooms. Exit transit, including survival
extraction, is permitted and is excluded from the existing active-room movement
metric. Moving uses the existing deterministic weaving driver; this first run
measures that policy, not human skill or statistical win rate.

The acceptance job requires one real terminal outcome per profile: stationary
World 1 defeat, moving Room 20 completion, actual movement and earned upgrades.
A crash, absent outcome, or 25-minute wall-time limit fails validation rather than
being treated as success. Logs, revision, periodic screenshots and JSON acceptance
results are retained for 14 days. Inspect failed runs before changing balance:
a driver navigation failure is not evidence that player difficulty is wrong.

Local checks: source sanity, Python syntax, workflow YAML parsing, and positive /
negative analyzer fixtures. iOS compilation and live simulator outcomes remain CI
checks; parser fixtures are not gameplay evidence.
