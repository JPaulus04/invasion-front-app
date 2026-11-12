# World 1 — Swamp Basin authored-art production contract (Build 327)

Status: specification, **not delivered artwork**. Reference: independently reviewed Build 327 landscape screenshots from #558. Ruined Outpost is the visual-direction benchmark, not a texture to recolor.

## Required assets (9 PNGs)
- `world1_swamp_basin_floor_1.png`: first visit (rooms 4–5), quiet central combat field, wet marsh earth, moss, shallow water indications confined to edges.
- `world1_swamp_basin_floor_2.png`: revisit (rooms 11–13), same geography/materials, alternate edge water shapes and root clusters.
- `world1_swamp_basin_floor_3.png`: late return (room 17), distinct but coherent composition.
- `world1_swamp_basin_wall.png`: weathered low stone embankment/wooden retaining structure.
- `world1_swamp_basin_boulder.png`: moss-covered water-worn stone.
- `world1_swamp_basin_vegetation.png`: clustered cattails/reeds with clear transparent cutout.
- `world1_swamp_basin_debris.png`: broken planks, driftwood, scattered wet stones.
- `world1_swamp_basin_lantern.png`: grounded marsh beacon with restrained warm glow.
- `world1_swamp_basin_crate.png`: waterlogged supply crate.

## Art constraints
- Original cohesive dimensional-cartoon mobile art, orthographic overhead floor and matching 3/4 top-down props. No characters, text, portals, HUD, baked-in raised obstacles, or literal road.
- Floor images portrait, >=512x768, fully opaque and compositionally quiet in the central ~70%. Variation and natural navigation cues belong around the perimeter, leaving multiple approaches to the gate.
- Props >=96x96 with fully transparent backgrounds and opaque interior; standardized transparent border/ground-contact reference must be recorded for consistent SpriteKit anchor placement.
- Painted water is **visual only**. It must not imply an impassable region unless the existing TerrainHazards geometry enforces that restriction. Avoid misleading deep-water channels across traversable combat space.
- Lighting and contact shadows consistent with Ruined Outpost. Keep enemy silhouettes, orange directional alerts, XP, projectiles and extraction orb legible at actual iPhone scale.
- Do not draw a single path to the portal. Use reeds, low banks, broken structures and shallow-water edges to suggest 2–3 converging avenues.

## Integration and acceptance
1. Install each PNG in `OutpostZero/Assets.xcassets/world1_swamp_basin_*.imageset` with matching Contents.json. Run `scripts/check_art_sprites.py` and `scripts/audit_world1_art.py`.
2. Confirm `OutpostScene.swift` loads floor 1 on rooms 4–5, floor 2 on rooms 11–13 and floor 3 on room 17; all six props resolve without fallback.
3. Validate contact-shadow/visible-bottom alignment. Do not assume the Ruined Outpost 20px border applies to Swamp Basin without measuring its exported PNGs.
4. Capture and inspect actual simulator first/revisit screenshots, recording run ID and SHA. Validate active combat contrast and portal traversal, not just QA markers or screenshot existence.
5. Gate the nine Swamp Basin files in the compiled simulator bundle only **after** all nine exist. Do not enable the full 36-file release gate prematurely.
6. Keep TestFlight on hold until visual review and gameplay checks pass.

## Process safeguard
CI success means the app compiles and automated checks run. Human inspection of screenshots is a separate acceptance decision. Never use screenshots from a prior commit to approve newly installed assets.
