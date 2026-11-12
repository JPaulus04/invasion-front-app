# Build 322 final motion review — October 24, 2026

## Baseline and acceptance
- Preserve the existing production NW, SE and SW walk frames until corrected candidates are proven better in continuous playback at gameplay scale.
- Existing corrected northwest source (`outpost-zero-walk-nw-review`) is a source sheet, **not** a registered/bundled replacement. The corrected boot direction is promising, but the two passing phases remain close; no approval yet.
- SE/SW revised proportions (`outpost-zero-diagonal-proportion-review`) are alternate frames on a diverged review branch; prior notes flag shortened SW leg reach and insufficient separation between SE phases. Do not merge blindly.
- GitHub Actions run 40046564065 provided N/E/W/NE continuous recordings, not NW/SE/SW. It cannot establish acceptance for those directions.

## Required final review
1. Capture NW/SE/SW full continuous gameplay videos using existing `-previewPilotWalkNW`, `-previewPilotWalkSE`, `-previewPilotWalkSW` simulator fixtures; include walking, contact/passing, idle transitions.
2. Compare each against the alternate artwork at identical registration/scale. Reject boot twists, phase duplication, scale breathing, weapon/body drift, foot sliding or reduced idle continuity.
3. Keep current assets when alternatives fail any criterion; do not overwrite runtime PNGs merely because the static sheet looks better.
4. Verify iOS compile, project/sprite checks, motion tests, defense captures, and full simulator screenshots on this commit. Build 322 must not be uploaded without review of actual footage and green validation.

This checkpoint intentionally makes no gameplay/art changes. It requests the existing full CI workflow and preserves the last working production frames until footage is inspected.
