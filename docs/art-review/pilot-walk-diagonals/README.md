# Diagonal walk preview batch — October 23, 2026

Twelve 256px RGBA frames under OutpostZero/ArtAssets: pilot_walk_nw_0...3.png, pilot_walk_se_0...3.png, pilot_walk_sw_0...3.png. Candidates for simulator review only; ordinary gameplay still uses sixteen directional static poses.

## Creation and registration
Built-in image-generation tool; original pilot_nw.png, pilot_se.png and pilot_sw.png were separate identity/facing references. No mirrored direction assets.

Prompt for each direction:
Use case: stylized-concept. Asset type: game animation sprite sheet. Reference image defines exact pilot identity, facing angle, camera, proportions, armor, weapon and lighting. Produce a transparent square 2x2 sheet of FOUR animation frames, each centered in equal cell with generous transparent margin, identical scale and helmet registration. Same exact facing as reference throughout. A restrained WALK, not run. Reading order: frame0 left leg forward planted/right trailing heel lifted; frame1 left supporting leg under body/right swinging past; frame2 RIGHT leg forward planted/LEFT trailing heel lifted (opposite of frame0); frame3 right supporting leg under body/left swinging past. Explicitly alternate which leg leads in the bottom row; never repeat the top row leg phase. Natural ankle alignment with knees and movement direction, no twisted sideways feet. Keep helmet, torso, arms and pistol nearly identical and steady; move articulated legs only. Preserve reference gun in same hand. Orthographic elevated game camera. Blue armor white trim orange visor/core, glossy shaded volumes and dark outlines identical reference. No text, labels, grid, ground, cast shadows, decorations. Genuine transparent alpha background. Full bodies and boots never clipped.

NW requested rear three-quarter up-left with visible backpack. SE and SW requested matching front three-quarter views, preserving chest core and visor.

NW first sheet repeated its leading leg; a targeted bottom-row leg edit produced exec-ec373c82-66d3-4bd8-ad36-43b4fd589813.png. SW source: exec-010af075-7670-4c9b-a7bc-9da23d2ec32c.png. SE required two targeted corrections; final source: exec-4e0ee9f0-0cef-4225-9e8f-876ece252062.png. Final SE correction changed only bottom-left legs, extending the leg under the empty hand forward/down-right and moving the gun-side leg back/up, preserving the upper body. Rejected sheets were not integrated.

Each sheet has four 627px cells. Clean alpha below 20; resize all cells with one common scale per direction (NW 44%, SE 44%, SW 43%); align helmet center and top to the original idle view; composite to 256px canvas. No independent per-frame scaling. Final extracted PNGs are committed as the reusable assets.

## Validation and limitations
- All twelve PNGs have transparent and opaque pixels and fit strictly within the canvas. Four distinct images per direction.
- Compared candidates with idle at equal, undistorted scale. NW and SE leg phase corrections are visible. Minor upper-body and walk/idle proportion differences remain for motion polish; static sheets are not final animation acceptance.
- New simulator-only flags: -previewPilotWalkNW, -previewPilotWalkSE, -previewPilotWalkSW. Routes use equal absolute X/Y travel, with initial heading derived from actual route. Sectors 6, 14 and 10 respectively; displacement selects the existing four-frame cadence.
- YAML, embedded recorder Python and portrait/landscape route geometry checked locally. iOS compilation and the new continuous footage remain pending CI.
- Preceding run 40046564065 passed build and focused captures, with broad simulator-review correctly skipped. Previous full run 40045774250 passed all three jobs. NE footage was sampled at preserved aspect ratio and showed authored stepping and idle restoration; scale continuity still needs polish.

Next: inspect all three new continuous videos, focusing on foot contact, NW sole angles, SE phase order, SW vertical reach and idle transitions. Intermediate eight headings still lack authored cycles. No TestFlight upload or character reset.
