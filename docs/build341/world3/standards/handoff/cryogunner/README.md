# Outpost Zero — Cryo Gunner integration assets

Cryo Gunner is the World 3 ranged standard enemy. The pack uses the approved four-legged orange, gray and white cannon platform silhouette and includes 44 body poses, 12 separate effect frames and a master sprite.

## Import and behavior

1. Add `assets/enemies/world3/cryogunner/` at `enemies/world3/cryogunner/` in the resource bundle. Preserve the per-enemy manifest and its relative effect and body paths.
2. Register the enemy using the manifest pivot, idle-height reference and timing. Idle and run loop. Attack, hit, defeat and victory play once. Position the tank on its ground pivot. The effects have independent pivots in `integration/cryogunner-effect-cues.json`.
3. Use the firing preview cues at zero-based body frames 3 and 7 to associate the brief cannon flash and bolt launch with the brace and recoil. Use the active gameplay behavior to decide how many shots fire. Projectile movement and collision come from the game. The preview speed is for desktop art review.
4. Trigger the impact effect on confirmed contact. Mirror muzzle offsets and the right-facing projectile art as needed. Suppression and repositioning should use existing World 3 combat tuning.
5. Confirm bundle lookup, muzzle alignment, projectile contact and interruption behavior during Codex integration.

## Art validation

All 56 animation PNGs passed RGBA 512 × 512, decoded integrity, genuine transparency, padding and identical-frame checks. The manifest resolves every animation path. The 198-frame animation preview was played at 64, 96 and 128 pixels on pale, dark and representative frozen backgrounds. The preview includes fire, confirmed impact, miss, hit reaction and defeat. The local impact and miss checks verified the effect gate. The master is the first planted walk pose.

| Category | Weight | Art QA score |
| --- | ---: | ---: |
| Character design consistency | 15% | 92 |
| Animation quality | 25% | 90 |
| Gameplay readability | 20% | 95 |
| Transparency and edge quality | 15% | 94 |
| Scale and registration | 10% | 92 |
| Combat effects | 10% | 92 |
| Technical compliance | 5% | 100 |

**Weighted score: 92.8/100.** Idle uses an optics pulse on the master silhouette. Attack uses eight authored body poses with four short settle or recoil holds. Defeat uses four authored stages with short settling holds. The hit sequence temporarily dims the cyan cannon illumination.
