# Outpost Zero — Frostfang integration assets

Frostfang is the World 3 agile melee enemy. This package contains the master, 44 body frames, 32 independent effect frames, the animation manifest, suggested effect cues and review evidence.

## Import

1. Add `assets/enemies/world3/frostfang/` to the game resource bundle at `enemies/world3/frostfang/`. Preserve the case and relative paths. The manifest follows the per-enemy authored animation layout in the checked source at `6f5739e`. If the active branch uses flat source storage, stage the files using its copy convention and preserve the manifest paths in the app bundle.
2. Register Frostfang in the World 3 enemy animation profile. Keep the artwork at 512 × 512, the source pivot at (256, 417), and the idle-height reference at 267. Use the existing World 3 presentation and gameplay scale.
3. Bind the animation states to movement, attack, hit and defeat. Victory is supplied for any existing celebratory presentation that consumes it. Only the 8 fps idle and 12 fps run states loop. Attack has 12 frames at 15 fps, hit has 4 at 12 fps, defeat has 8 at 9 fps, and victory has 4 at 7 fps.
4. Read the authored cues in `integration/frostfang-effect-cues.json` as a presentation starting point. Use the lunge trail behind the sprite, the claw slash forward of the snout, the ice impact only on a confirmed contact, and the burst during the final collapse. Use the actual contact position for the impact when available. Mirror cue x offsets when facing left. Drive damage, ranges and transitions from existing gameplay events.
5. Validate bundle resource lookup and a focused simulator capture after wiring. Check wind-up, strike, impact, interrupted attack, turn direction and defeat. The package includes desktop playback evidence and leaves simulator and gameplay validation to the integration step.

## Art validation

All 77 PNGs passed decoding, 512 × 512 RGBA, transparency, edge padding and uniqueness checks. All 76 animation paths resolved. The attack and defeat effects were synchronized and reviewed in playback at 64, 96 and 128 pixels. The final matte cleanup was re-encoded and inspected against light, dark and frozen backgrounds.

| Category | Weight | Art QA score |
| --- | ---: | ---: |
| Character design consistency | 15% | 94 |
| Animation quality | 25% | 91 |
| Gameplay readability | 20% | 94 |
| Transparency and edge quality | 15% | 93 |
| Scale and registration | 10% | 93 |
| Combat effects | 10% | 93 |
| Technical compliance | 5% | 100 |

**Weighted score: 93.2/100.** The lunge has some pose-to-pose variation in the shoulder silhouette. The strike and recovery remain readable at gameplay scale. Matte cleanup retains the bright highlights and fades the effect tails independently of the body.
