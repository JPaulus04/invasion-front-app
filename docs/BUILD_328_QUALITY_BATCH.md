# Build 328 presentation quality batch — October 30

Baseline: 5439092a5bee5843cddd099a96e6f3ca16c54ba7. Run 41060862494 passed build, defense-visual-review and simulator-review. All seven World 1 landscape PNGs from artifact 12980771855 were inspected before this batch.

Working scorecard: 7.4/10 provisional overall; target 8.5/10 before the next major TestFlight review. Do not raise grades based only on compilation or this implementation.

## Changes

- Compact combat panel: 72 to 62 scene points, quieter coin text and pause outline, closer objective row, and removal of the duplicate boss title above the existing boss nameplate. Pause hit area remains 44x42. XP/level row retains clearance from the control.
- Grounded scenery: new WorldOneArtMetrics records visible-base anchors for all 24 props. The old 20px transparent border could include faint pixels well below the visible artwork (notably the cave wall). Measurements use the last PNG row containing alpha >=128 across at least 5% of image width. Normalized values are independent of UIImage/texture scale. Contact shadows are smaller and softer; cast shadows are quieter.
- Room composition: World 1 perimeter props span the available vertical band instead of stopping one spacing interval short. No hitbox, hazard, navigation or encounter geometry changes.
- Combat readability: ordinary enemies show compact health bars when injured instead of persistent full green bars. Boss bars remain visible. Fills drain from a fixed left edge, and HUD updates synchronize splash/burn health presentation as well as direct hits. No enemy stat or attack changes.

## Local verification

- check_project.py: 22 Swift files passed source sanity checks.
- REQUIRE_WORLD_ONE_ART=1 check_art_sprites.py: all 101 PNGs passed; all required World 1 assets present.
- audit_world1_art.py: 36/36 passed.
- Independently recomputed all 24 visible-base measurements from shipped PNG alpha; all match the Swift data. Ground-contact equation checked at rendered heights 32, 48 and 78.
- HUD progress/level row clearance checked for widths 320, 375, 390, 430 and 768; whitespace clean.
- Swift/Xcode compilation unavailable locally. These checks do not establish visual approval.

## Next review

One consolidated [full-review] push for this complete batch. User explicitly requested: start validation and stop; do not monitor the run. TestFlight is not authorized.

Inspect grounding of cave walls and Guardian debris, compact HUD readability, upper perimeter overlap, injured-enemy bars and persistent boss health. Review live combat separately from frozen landscape fixtures. Economy/fresh-character pacing, Home navigation and animation grades remain provisional and are outside this presentation batch.


## Consolidated combat and arena validation — October 30, 2026

Scope since prior passing review: hostile projectile silhouettes and directional tails; mortar impact telegraphs; projectile-hit confirmation; larger objective HUD clock; reactor critical-state pulse and grounded shockwave; ranged shooter wind-up halos; World 1 staggered perimeter pockets; direction-aware enemy lean and contact-shadow response.

Full review acceptance gates:
1. Source checks, character motion and combat tests, iOS compile, and visual capture must pass.
2. Verify no overlapping HUD labels or obscured objective timer on narrow devices.
3. Inspect projectile and mortar warnings for visibility without obscuring enemy silhouettes.
4. Inspect perimeter prop bounds and central movement clearance in all World 1 landscapes.
5. Confirm reactor warnings and enemy wind-ups remain readable during busy encounters.

This checkpoint is a validation trigger, not visual approval or TestFlight authorization.
