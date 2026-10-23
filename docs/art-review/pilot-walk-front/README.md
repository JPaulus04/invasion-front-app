# Front walk-cycle prototype

These four RGBA frames are artwork candidates. Copies are bundled under
`ArtAssets/pilot_walk_s_0...3.png` for the simulator-only `-previewPilotWalk` launch flag.
Normal gameplay does not select them. The preview alternates real southward
movement and idle, using displacement to select frames and restoring the south
idle pose on stop. Collision and movement speed use the normal scene path.

Order: `walk_s_0.png`, `walk_s_1.png`, `walk_s_2.png`, `walk_s_3.png`.
The poses alternate forward-reaching boots and passing knees. Judge the
cycle for marching/foot sliding, armor/weapon consistency, and idle-to-walk
transition before generating the remaining directions.

Built-in image-generation prompt: exact `pilot_s.png` identity; front-facing
four-pose walk cycle in a transparent 2x2 sheet, left boot forward / right knee
passing / right boot forward / left knee passing, steady helmet and upper body,
same right-hand pistol, blue armor, white trim and orange visor/core, elevated
orthographic camera, no floor/shadow/text/grid. Generated source:
`exec-24501d89-4e6b-4a8c-8eb6-c4ff49255f52.png` (1254x1254).

Extraction: four 627x627 cells, near-transparent alpha noise removed, common
40% scale. Registered helmet centers at x=128 and helmet tops near y=16 on
256x256 canvases. Frame offsets after scaling: (-18,0), (20,0), (-18,8), (20,8).
Do not independently trim/scale each frame; that would change helmet size and
introduce jitter. Foot positions vary with the authored step projection.

The user approved the pose artwork. In-motion acceptance remains pending.
The sixteen-direction build passed all three CI jobs and its actual compass
grid and gameplay frames were inspected on October 23. Adjacent northwest
sectors remain too similar for final turn acceptance. Authored walk frames for
the other directions remain outstanding. Do not enable a front-only cycle in
normal gameplay or upload Build 322 without release approval.
