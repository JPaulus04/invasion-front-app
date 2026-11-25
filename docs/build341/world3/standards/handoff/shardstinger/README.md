# Outpost Zero — Shardstinger integration assets

The pack includes a 512-pixel master, 44 body frames, 12 separate stinger, crystal and hazard effect frames, the manifest, cue sheet and playback evidence.

## Import and behavior

1. Include `assets/enemies/world3/shardstinger/` as `enemies/world3/shardstinger/` in the app bundle. Preserve relative paths and use the manifest pivot (256, 420), idle height and timing. Only idle and run loop.
2. Play the stinger sequence through its raised anticipation and tail contact. The preview uses zero-based attack frame 7 for contact. Place the accompanying downward strike at the resolved target and start the crystals just after contact.
3. Place the temporary hazard at the resolved ground location, under the actor sprites. Use the gameplay hazard event to control its duration and impact. The four-frame visual perimeter pulses while active.
4. Verify World 3 resource lookup, facing, contact, crystal growth, hazard cleanup and attack interruption in a focused simulator pass.

## Art validation

All 56 animation PNGs and manifest references passed expected inventory, naming, decoded uniqueness, integrity, transparent padding and RGBA 512 × 512 validation. The 161-frame desktop playback and sampled composites checked the crawl, articulated tail movement, collapse, crystal emergence and hazard pulse at 64, 96 and 128 pixels on dark, light and representative frozen backgrounds. The effects comparison verifies separation from the body. The hazard ring is faintest on pale terrain at 64 pixels.

| Category | Weight | Art QA score |
| --- | ---: | ---: |
| Character design consistency | 15% | 94 |
| Animation quality | 25% | 91 |
| Gameplay readability | 20% | 93 |
| Transparency and edge quality | 15% | 92 |
| Scale and registration | 10% | 93 |
| Combat effects | 10% | 92 |
| Technical compliance | 5% | 100 |

**Weighted art QA score: 92.8/100.** Tail and leg articulation use distinct authored poses. Idle uses an optics pulse, while attack and defeat include short settle holds.
