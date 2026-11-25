# Permafrost Crusher — Room 10

Approved for asset handoff. Includes 52 body frames, 16 separate effect frames and one master.

## Animation and effects

Adds eight charge frames. The mammoth silhouette, frozen tusks and orange reactor carry through the leg and trunk poses. Short holds mark the stomp wind-up and recovery. Neutral and recovery poses are shared where appropriate. The manifest records each state’s timing and loop flag. Use the ground pivot (256, 433) in 512-pixel source coordinates, the authored idle height and the effect cue offsets. Cue frame numbers are zero-based.

Play the charge trail from frame 2, behind the boss. The stomp and ground shockwave start on attack frame 6. Let the game drive charge travel, impact and shockwave reach.

## Validation

All referenced PNGs passed decoded frame count, per-sequence uniqueness, filename, integrity, 512 × 512 RGBA, transparent padding, alpha bounds and manifest checks. Effect cues resolved to valid animation frame indices and effect sequences. The full-resolution poses and the desktop playback were reviewed for silhouette, registration, wind-up, contact, recovery and defeat. Playback shows 64, 96 and 128 pixel views against light, dark and frozen backgrounds.

| Category | Weight | Art QA score |
| --- | ---: | ---: |
| Character design consistency | 15% | 94 |
| Animation quality | 25% | 90 |
| Gameplay readability | 20% | 94 |
| Transparency and edge quality | 15% | 93 |
| Scale and registration | 10% | 93 |
| Combat effects | 10% | 92 |
| Technical compliance | 5% | 100 |

**Weighted art QA score — 92.8/100.**
