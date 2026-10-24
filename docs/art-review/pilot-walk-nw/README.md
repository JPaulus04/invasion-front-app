# Northwest walk candidate — October 23, 2026

## Status
Review source only. Not bundled, not selected in ordinary gameplay, and not yet registered into 256px frames or integrated in a simulator fixture. Build 322 remains development-only; no TestFlight upload or profile reset.

The current development head is 989d5ead1f949680c4fc55ab322696b88cd1eb50. Focused run 40046564065 completed successfully: build and defense-visual-review passed; simulator-review was skipped as designed. Artifact 12542046452 contains walk footage, but this session did NOT download or visually inspect it. Northeast motion acceptance remains pending.

## Artwork
source-sheet.png is a 1254x1254 RGBA 2x2 sheet, row-major. Original identity reference: OutpostZero/ArtAssets/pilot_nw.png at the development head above. Built-in image generation; not mirrored from northeast.

Initial generation repeated the same trailing leg in poses 0 and 2. First correction moved the exposed sole to the opposite leg in pose 2. Second correction replaced the sideways kick in pose 3 with a compact passing pose. All are candidates: pose 2 has a broad stride and passing poses are similar; continuous animation must establish cadence and foot contact before acceptance.

Alpha range is 0–255. Visible bounds at alpha >=20, in 627px cells:
- Pose 0: (120,41,552,604)
- Pose 1: (70,41,496,593)
- Pose 2: (124,31,550,585)
- Pose 3: (70,30,500,571)
No visible content touches a cell boundary. Bounds/transparency checks do not establish animation quality.

## Prompt set
Initial: Create a transparent 2x2 sprite sheet of four chronological WALK frames for the exact reference pilot. Rear three-quarter view facing upper LEFT; same orange visor left edge, white helmet trim, blue armor, orange backpack battery, short pistol pointing upper left in same hands. Never mirror. Upper body helmet backpack arms and gun identical local positions proportions and size; only legs change. Top-left near leg extended rearward, far leg forward; top-right near knee passing, far foot planted; bottom-left opposite gait phase; bottom-right far knee passing, near foot planted. Distinct alternating phases. Same full-body scale and ample transparent gutters. Dimensional cartoon 3D, upper-left lighting. No floor, shadow, text, borders or grid.

Correction 1: Edit only bottom-row legs; preserve other artwork. Bottom-left screen-left leg extends toward camera with black sole visible at lower-left. Screen-right leg reaches forward and tucks beneath backpack; no sole at lower-right. Bottom-right should be a passing pose.

Correction 2: Edit only bottom-right legs. Replace sideways kicking leg with compact passing pose: both boots beneath hips, screen-left boot planted, screen-right knee bent and tucked beneath body with toe pointing upper left, no large camera-facing sole or sideways projection. Preserve upper body, other poses, camera, scale and transparency.

Final built-in output: exec-c581144b-3fc2-4607-b8fd-6ffa2f1528d9.png.

## Next
1. Inspect existing NE continuous capture.
2. Register NW frame helmet tops/centers against pilot_nw.png with a single common scale; avoid individual frame resizing that causes breathing.
3. Review four-frame loop and idle transition, especially pose 2 stride length and distinction of passing poses.
4. Batch remaining diagonal assets before a coherent simulator integration/CI run. Do not enable incomplete authored cycles in ordinary gameplay.
