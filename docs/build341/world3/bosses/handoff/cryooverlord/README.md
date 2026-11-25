# Cryo Overlord — Room 30

Approved for asset handoff. Includes 68 body frames, 24 separate effect frames and one master.

## Animation and effects

Adds eight frames each for heavy slam, phase transition and freeze cast. The walk and cannon poses were re-exported after removal of a pale matte. Neutral and recovery poses are shared where appropriate. The manifest records each state’s timing and loop flag. Use the ground pivot (256, 433) in 512-pixel source coordinates, the authored idle height and the effect cue offsets. Cue frame numbers are zero-based.

Start phase 1 with the cannon barrage, add the heavy slam in phase 2, and add freeze cast in phase 3. Use the transition pulse at phase boundaries. Cannon cues start on attack frames 3 and 6. Ground the freeze hazard and use the game event to control its lifetime.

## Validation

All referenced PNGs passed decoded frame count, per-sequence uniqueness, filename, integrity, 512 × 512 RGBA, transparent padding, alpha bounds and manifest checks. Effect cues resolved to valid animation frame indices and effect sequences. The full-resolution poses and the desktop playback were reviewed for silhouette, registration, wind-up, contact, recovery and defeat. Playback shows 64, 96 and 128 pixel views against light, dark and frozen backgrounds.

| Category | Weight | Art QA score |
| --- | ---: | ---: |
| Character design consistency | 15% | 94 |
| Animation quality | 25% | 91 |
| Gameplay readability | 20% | 94 |
| Transparency and edge quality | 15% | 92 |
| Scale and registration | 10% | 92 |
| Combat effects | 10% | 93 |
| Technical compliance | 5% | 100 |

**Weighted art QA score — 93.0/100.**
