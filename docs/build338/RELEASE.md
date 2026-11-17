# Build 338 release decision

Owner authorized PR #13 merge and internal TestFlight release on 2026-11-16 using existing evidence, without another full simulator campaign.

Approved application source: `4e5d4494d45e389c88a038c03e61c6358b6c1dc3`.
Evidence: https://github.com/JPaulus04/invasion-front-app/actions/runs/43994798717

Compilation, broad simulator review, defense review, focused presentation and five gameplay configurations passed. Moving seed 335 batch 2 failed at CoreSimulator boot readiness (`simctl spawn /usr/bin/true` timed out before app launch). Acceptance failed because that replay was missing. This is an explicit owner-accepted infrastructure gap, not a full campaign pass.

The Build-338-only release option pins the run, source, required job results and unchanged application tree. Only the listed release tooling/documents may differ. Compilation, signed Release archive, approved bundle contents, production entitlements, app identity, unused Apple build number and upload/processing checks remain mandatory. Other releases retain the normal complete-campaign gate.

Merge message `[release338-existing-evidence]` suppresses only redundant simulator jobs on the main push; compile and native tests still run. Release archive remains built from the final merged main SHA. No product code, assets, game balance or approved environment geometry changes in release preparation.

Build 339 device follow-up: difficulty, health-bar placement, victory rewards/progression, HUD/visual polish. Compact-device review and physical-device profiling remain necessary.
