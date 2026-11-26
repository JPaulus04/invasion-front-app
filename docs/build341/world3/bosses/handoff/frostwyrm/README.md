# Frost Wyrm — Room 20

Approved for asset handoff. Includes 64 body frames, 20 separate effect frames and one master.

## Animation and effects

Adds eight tail sweep frames, six burrow frames and six emergence frames. The shortened sweep keeps the head readable during the strike. Neutral and recovery poses are shared where appropriate. The manifest records each state’s timing and loop flag. Use the ground pivot (256, 433) in 512-pixel source coordinates, the authored idle height and the effect cue offsets. Cue frame numbers are zero-based.

Start breath on attack frame 5 and ice shards on frame 6. Trigger the sweep on tail sweep frame 3. Hide the actor after the burrow animation and restore it on emergence. The game controls the underground interval.

## Validation

All referenced PNGs passed decoded frame count, per-sequence uniqueness, filename, integrity, 512 × 512 RGBA, transparent padding, alpha bounds and manifest checks. Effect cues resolved to valid animation frame indices and effect sequences. The full-resolution poses and the desktop playback were reviewed for silhouette, registration, wind-up, contact, recovery and defeat. Playback shows 64, 96 and 128 pixel views against light, dark and frozen backgrounds.

| Category | Weight | Art QA score |
| --- | ---: | ---: |
| Character design consistency | 15% | 95 |
| Animation quality | 25% | 91 |
| Gameplay readability | 20% | 93 |
| Transparency and edge quality | 15% | 93 |
| Scale and registration | 10% | 92 |
| Combat effects | 10% | 93 |
| Technical compliance | 5% | 100 |

**Weighted art QA score — 93.0/100.**
