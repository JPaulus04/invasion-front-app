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

The dedicated workflow runs source checks, 57 Python tests, native room/environment/animation/replay/driver/pacing tests, iOS compilation and actual compiled-bundle asset verification. The manual visual milestone uses the ARM runner configuration from the successful main capture. It creates one disposable device and records one continuous ten-stage live scene tour, including real camera movement and portal interaction. A successful trace is explicitly **not visual approval**.

The [first live milestone at 380171f](https://github.com/JPaulus04/invasion-front-app/actions/runs/43782721778) **passed** compilation, bundle verification and the continuous scene tour, including a real 1→2 transition. Its downloaded video was reviewed. The approved portal is round and seated between authored ruins; reactor integrity is readable with the player below it; the Root Lord has a clear combat approach. The images exposed hard rectangular shoulder soil, mirrored material-edge motifs, insufficient water visibility and a QA badge overlapping the boss label. The next revision softens the soil mask, increases rooted foliage density inside the same collision shoulders, removes reflected material quadrants, adds north/south exterior water shelves, and moves the debug badge to the footer. Resizing also rebuilds the shoulder collision patches even though those patches no longer create hazard drawing nodes.

The entrance hold is extended because the first video encoder missed that initial two-second stage. The next milestone extracts ten full-resolution PNGs from the actual simulator video; frame timing metadata is retained, and visible stage badges must be inspected. No additional scenery is reconstructed for these images.

**Current validation outcomes, final screenshot review, exact tested revision and release recommendation are maintained in [PR #11](https://github.com/JPaulus04/invasion-front-app/pull/11).** The immutable first-milestone result above applies to its recorded source revision. No 9.5/10 score or automatic visual approval is claimed here. This branch must not be merged or uploaded without user approval.

The repository's uploaded arena painting and approved portal are available references. No separate external approval board or reference images were supplied in this request; an exact match to such an external reference cannot be certified. Physical-device performance and compact-device combat presentation remain separate checks from source tests or one simulator tour.

The broader first PR presentation job exposed a stale fixture assertion requiring the removed rectangular portal opening. It is replaced by actual approved-sprite size/aspect, transparent background, grounded-base and ENTER-label assertions. App assertion failures now stop that harness immediately; infrastructure recovery is limited to one additional attempt. The strengthened bundle verifier also accounts for Xcode's CgBI optimization: it checks decoded alpha and premultiplied visible colors rather than requiring identical compressed PNG bytes. The downloaded actual compiled portal at the first milestone has exact alpha and zero visible-channel error against the approved source. Four regression tests reject altered alpha or colors and accept ordinary/CgBI packaging.
