# Outpost Zero — Glacier Brute integration assets

Glacier Brute is the World 3 heavy tank and disruption enemy. This pack contains the 512-pixel master, 44 body frames, 12 independent ground slam, shockwave and ice debris effects, an authored manifest, event cues and QA evidence.

## Import and behavior

1. Include `assets/enemies/world3/glacierbrute/` in the application bundle at `enemies/world3/glacierbrute/`, preserving relative paths. Register the profile using its pivot (256, 421), idle-height reference and manifest state timings. Only idle and run loop.
2. Play the attack as a two-fist heavy slam. The 13 fps attack first braces, raises the fists, hits at zero-based frame 6 and then recovers. The integrated gameplay system owns the hit and disruption events.
3. Render the shockwave on the floor behind the body, the impact near fist contact and the debris slightly delayed. The offsets and effect pivots are recorded in `integration/glacierbrute-effect-cues.json`. Match the visible shockwave to the actual hit area during integration. Treat offsets as art coordinates and adapt them to the game’s scale.
4. Validate bundle lookup and a focused simulator capture for ground contact, effect expansion, interrupted wind-up and final collapse.

## Art validation

The 56 animation PNGs and all manifest references passed integrity, frame count, transparency, edge padding, file naming and exact duplicate checks. The 158-frame preview played at 64, 96 and 128 pixels on light, dark and representative frozen backgrounds. The body-only comparison verified that the ground slam, expanding shockwave and debris are independently triggered. A clipped master candidate was replaced with the clean neutral pose from the attack sheet, and the surviving motion art was extracted with a narrow alpha ramp to remove the pale source matte.

| Category | Weight | Art QA score |
| --- | ---: | ---: |
| Character design consistency | 15% | 94 |
| Animation quality | 25% | 90 |
| Gameplay readability | 20% | 94 |
| Transparency and edge quality | 15% | 94 |
| Scale and registration | 10% | 92 |
| Combat effects | 10% | 93 |
| Technical compliance | 5% | 100 |

**Weighted score: 93.0/100.** Idle pulses the chest core. The attack and defeat sequences use separate authored physical poses and brief holds for anticipation, contact and settling. Impact, shockwave and debris remain independent layers for gameplay wiring.
