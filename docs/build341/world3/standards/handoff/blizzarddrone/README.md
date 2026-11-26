# Outpost Zero — Blizzard Drone integration assets

The pack contains the approved four-disc aerial design, a 512-pixel master, 44 body frames, 12 independent effect frames, an authored manifest, event cues and playback evidence.

## Import and behavior

1. Include `assets/enemies/world3/blizzarddrone/` in the application bundle at `enemies/world3/blizzarddrone/`, preserving the relative paths. Register the ground pivot (256, 425), the manifest idle-height reference and state timing. The exported hover offset is already part of the artwork.
2. Apply the propulsion loop behind the body at the two lower disc offsets supplied in `integration/blizzarddrone-effect-cues.json`. Adapt these to the actual rig and facing. Disable propulsion when defeat begins.
3. Bind frost projectile launch to a combat event. The preview shows launches around zero-based attack frames 4 and 8. Use the intended game balance for actual projectile cadence and movement. This package reuses the same frost projectile artwork as Cryo Gunner and includes local copies so its manifest resolves independently.
4. Show the freezing area at the resolved ground target. The supplied area animation grows and fades. The duration and gameplay effects belong to the game system.
5. During integration, check bundle lookups, emitter placement during banking, hazard registration, the transition out of hover, and the final defeated frame.

## Art validation

The 56 animation PNGs passed file integrity, expected inventory, dimensions, RGBA, nonempty alpha, padding, identical-frame checks and manifest resolution. The 160-frame preview played at 64, 96 and 128 pixels on dark, light and frozen backgrounds. The preview also verifies that propulsion shuts off on defeat. The projectile was enlarged and moved toward the leading edge in the review to improve readability beside the rotating discs.

| Category | Weight | Art QA score |
| --- | ---: | ---: |
| Character design consistency | 15% | 95 |
| Animation quality | 25% | 91 |
| Gameplay readability | 20% | 94 |
| Transparency and edge quality | 15% | 94 |
| Scale and registration | 10% | 93 |
| Combat effects | 10% | 91 |
| Technical compliance | 5% | 100 |

**Weighted score: 93.3/100.** The primary hover uses a controlled bob and optics pulse. Travel, recoil and collapse use authored disc articulation, and the defeat adds a vertical fall between its key poses.
