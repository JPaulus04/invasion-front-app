# Build 338 — World 1 review

Branch: `feature/build338-unified-world1`. Baseline: `3987f2c11f3acac28f2dbbbb56098bd468d17d62` on main.

## Why the previous presentation regressed

World 1 was assembled by several overlapping systems: an arena painting, biome scenery, a showcase composition, corridor masonry and a separate portal frame. The 512×768 family paintings were enlarged over an entire room, changing the apparent paving scale and softening their detail. Repeated clipped wall courses exposed the rectangular collision shoulders. Forest artwork existed but was largely replaced or hidden by those systems. Portal artwork was forced into a square and surrounded by procedural rectangular framing.

The actual main screenshot baseline comes from [successful run 43768308294](https://github.com/JPaulus04/invasion-front-app/actions/runs/43768308294), artifact 14184096534. It shows the enlarged floor and repeated shoulder masonry. Earlier [handoff run 43680764511](https://github.com/JPaulus04/invasion-front-app/actions/runs/43680764511) failed during screenshot capture; it is not evidence of visual approval.

## Architecture and artwork

`WorldOneEnvironmentPlan` is a deterministic world-space description; `WorldOneEnvironment` is the sole World 1 renderer. Physics remains in `WorldOneRoomGeometry` and `TerrainHazards`. The plan validates full sprite frames against solid shoulders or the exterior, keeping scenery out of navigation lanes. It constructs scenery at room entry, not every frame. Other worlds keep their existing rendering.

The shared ground uses 512-point cells containing 1024-pixel materials. Four edge-compatible variants per theme prevent neighboring duplicate cells and texture stretching. These are derived from the interior of the existing `world1_overgrown_stone_arena.png`, with organic wear from the existing family floor artwork. Source pixels, crop, resolution and hashes are recorded in [ground-provenance.json](ground-provenance.json). The [source preview](derived-materials-source-preview.jpg) is an asset comparison, **not gameplay evidence**.

Restored assets:

- `world1_overgrown_stone_arena.png`: weathered paving, moss and grass source.
- `forest_pine_polished.png`, `forest_broadleaf_polished.png`: surrounding forest belts and solid grove clusters, at measured root anchors.
- `world1_{ruined_outpost,swamp_basin,toxic_caves,boss_arena}_{wall,boulder,vegetation,debris}`: authored boundary and far-wall landmarks.
- `outpost_zero_portal_approved_transparent.png`: unchanged approved pixels, uniform aspect ratio, transparent background, grounded ring and clear approach. Rectangular portal overlays are removed; the corrected `portalRecessEnergy` identifier from main is preserved.

Added assets: 16 `build338_ground_{outpost,swamp,caves,sanctuary}_{0...3}` imagesets and one transparent 640×426 `build338_forest_pool` component. The latter is a generated reusable pool matching the source art treatment, placed outside collision bounds. It creates no new walkable hazard behavior. Approved source artwork is retained. Mossbot animation assets are unchanged.

Room themes share paving proportions and forest silhouettes: outpost rooms 1–5/16 use reclaimed masonry; swamp rooms 6–10/17 use damp stone, plants and shallow exterior pools; caves 11–15/18 use dark stone, corrupt vegetation and tinted exterior pools; sanctuary 19–20 uses warmer weathered paving and forest ruins. Encounter geometry remains independent of theme. Six tactical proportions preserve approximately the original room area; survival, defense and boss retain their authored objective layouts.

Camera zoom remains unchanged. Horizontal exterior allowance exposes surrounding terrain. A cleared room keeps following the player until the far portal and player can fit together below the HUD, then applies portal headroom. Gate interaction still uses the existing room-exit rules.

## Validation status

Initial [routine run 43782099180](https://github.com/JPaulus04/invasion-front-app/actions/runs/43782099180): Python tests and native Swift suites passed; iOS compilation caught a dangling legacy `else`. Corrected in the next commit.

The dedicated workflow runs source checks, 53 Python tests, native room/environment/animation/replay/driver/pacing tests, iOS compilation and actual compiled-bundle asset verification. The manual visual milestone uses the ARM runner configuration from the successful main capture. It creates one disposable device and records one continuous ten-stage live scene tour, including real camera movement and portal interaction. A successful trace is explicitly **not visual approval**.

Visual review and final validation outcomes are pending. No quality score, release acceptance or TestFlight readiness is claimed. This branch must not be merged or uploaded without user approval.
