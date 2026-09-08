# Last Stand Command — Build 193

## Install from your phone

Uncompress the ZIP in Files. Replace the existing files at the same repository paths, and add `src/reclamation.js` and `scripts/test-reclamation.cjs`. Do not upload the ZIP itself or rename it to a workflow. Keep only your existing `build-ios.yml` workflow, replaced by this version.

The package is an update for working Build 192, not a standalone game. Preserve existing plugins, signing secrets, assets, and all other source files. Run a new workflow on the updated commit. Install TestFlight over your current app; do not delete your save.

## Play

Open Campaign → RECLAMATION · HQ PERIMETER. Select a tile, then tap or hold RESTORE. Release to stop. The cost shown is charged for every action, including held actions. Holding stops at tile completion and never switches to another tile.

- One fixed 7×7 region with HQ at the center and 48 tiles.
- Three tiles authorized per first-time Campaign phase clear; all are authorized by Phase 16.
- A restored orthogonal neighbor is also required, keeping expansion connected.
- Existing campaign clears authorize tiles but do not restore them or grant free rewards.
- Inner/middle/outer tiles cost 12/48/108 Credits per action and require 4/5/6 actions respectively.
- Six salvage depots award one Tech Part each. Supply caches award 24–72 Credits each. Woodland restores territory without a currency reward.
- Partial work and completed discoveries persist in the existing HQ save. Credit spending and rewards use the same saved snapshot.
- Replays and defeats do not expand authorization; restored territory remains permanent.
- No new currencies, passive income, tile battles, HQ rooms, or combat adjustments in this build.

## Checks

Run `node scripts/test-reclamation.cjs` and `node build.js` from the repository root. These check campaign gates, adjacency, costs, failed-save rollback, reload, and duplicate reward prevention, along with existing build validation.

On TestFlight, verify one tap charges the displayed cost, holding stops on release, a partial tile survives restart, and a completed tile cannot award its discovery twice. Complete a new Campaign phase and confirm the next three tiles gain authorization. An iOS archive and physical-device validation still need the existing GitHub/TestFlight workflow.
