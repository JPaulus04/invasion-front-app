# Outpost Zero — World 3 boss integration

Use Part 2 with Part 1 to import the eight World 3 enemies. Part 2 contains 184 boss body frames and 60 separate effect frames, plus three masters.

| Room | Boss | Presentation to verify |
| --- | --- | --- |
| 10 | Permafrost Crusher | Mammoth charge, stomp contact and the expanding frost shockwave |
| 20 | Frost Wyrm | Breath, low tail sweep and the complete burrow and emergence cycle |
| 30 | Cryo Overlord | Cannon barrage, slam, freeze hazard, both phase transitions and defeat |

## Codex handoff

Start from the current main of JPaulus04/invasion-front-app on a feature branch. Import both archives and register the eight enemy folders with the existing animation catalog and resource loader. Preserve manifest-relative paths, names and PNG order. Match current loader behavior when translating source paths into bundled resources. Use the manifest FPS, loop flags, art pivots and idle height. Bind effects to resolved gameplay events and honor the separate foreground and background cue placements. Preserve existing progression, balance, commander, World 1 and World 2 assets.

Verify that every manifest reference resolves from the built iOS bundle. Run the iOS compile and focused simulator captures for the eight enemies, including the three boss encounters in the table. Review each capture at actual game scale. Report the commit, checks, screenshots and any release blockers in a PR against main. Leave merging and TestFlight for a separate step.

The supplied MP4s are desktop art playback evidence at 64, 96 and 128 pixels on dark, light and frozen backgrounds. In-app gameplay wiring and simulator validation belong to the integration pass.
