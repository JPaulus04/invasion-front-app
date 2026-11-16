# Build 338 — final visual polish

Branch: `feature/build338-unified-world1` · [PR #11](https://github.com/JPaulus04/invasion-front-app/pull/11)

Approved application baseline: `eee6d3a6afecc301563ebf492279fb9a244aa590`

Polish implementation: `791b1e29917fd2cfb041c6d5ff1348f3b6cb2ad7`

Compiler collection fix / first capture: `ed6a214c687402346567233ccbc19eb0acfbf570`

Final opacity refinement / reviewed application: `4762951f062ead5affdb5a57b3a01576cce4651d`

## Finishing changes

The approved World 1 renderer, paving and room layouts are retained. The pass adds connected moss/soil banks across the side portions of open combat areas, with small plants tied to those beds. Soil beds interrupt the original paving; irregular feathered margins blend grass and moss back into it. Every new 512×512 overlay covers 256 world points, preserving two source pixels per world point. The original 16 paving textures and four understory textures are unchanged.

The banks follow a small set of composed runs, rather than scattered prop placement. Portal and objective reserves stay clear, the boss staging area remains open, and low plants are capped at 12 points (15 for wetland reeds), below actors and combat cues. The new beds and plants add no collision or hazard behavior.

Existing authored ruin sprites now form larger exterior groups:

- **Outpost:** broken defensive walls, collapsed stone and rooted moss-covered boulders.
- **Swamp:** damp moss/soil, low reeds, fallen root/wood remnants and masonry flanking the existing exterior water shelves.
- **Caves:** larger rock and crystal outcrops, dark authored earth, and small fungal growth; identity depends on silhouettes/materials as well as color.
- **Sanctuary:** rooted ruined walls and fallen pillars frame the broad boss clearing, with restrained moss/soil beds below the boss staging area.

Full solid-sprite frames remain outside movement bounds or within existing solid shoulders. Collision rectangles, authored geometry, camera code, portal code/pixels, actor scale, Mossbot frames, reactor, HUD, encounter rules and room progression are unchanged from the approved application baseline.

## Assets

Eight new supplemental RGBA imagesets, all 512×512:

- `build338_reclaim_outpost_0`, `build338_reclaim_outpost_1`
- `build338_reclaim_swamp_0`, `build338_reclaim_swamp_1`
- `build338_reclaim_caves_0`, `build338_reclaim_caves_1`
- `build338_reclaim_sanctuary_0`, `build338_reclaim_sanctuary_1`

These use existing family floor pixels with derived alpha. No original artwork is replaced. Source/output hashes and dimensions are in [reclamation-provenance.json](reclamation-provenance.json); [approved-inputs.json](approved-inputs.json) pins the unchanged approved paving, understory and portal files. [Material preview](reclamation-material-preview.jpg) is an asset preview, not simulator evidence.

Reused sprites add instances, not modified asset files: `world1_ruined_outpost_{wall,debris}`, rooted `world1_boss_arena_boulder`, `world1_swamp_basin_{wall,debris,vegetation}`, `world1_toxic_caves_{boulder,debris,vegetation}`, and `world1_boss_arena_{wall,debris,boulder}`. Existing family vegetation supplies the low planted beds.

## Actual before/after review

Reviewed the final run’s actual frames 14, 17, 20, 26 and 32, selected by their visible stage badges. Also inspected reactor frame 23, long-camera frame 36 and the completed 1→2 transition at frame 40.

- Outpost: connected moss banks and soil breaks soften the previously uninterrupted stone; broken walls and rooted stones frame the combat lanes.
- Swamp: damp mottled banks, reeds and exterior water read as a wetland clearing, with enemies still visible against the ground.
- Caves: rock/crystal silhouettes and fungal accents strengthen the perimeter; translucent dark-earth banks retain paving relief. This remains the most restrained ground transformation.
- Sanctuary: rooted masonry and fallen structures frame the boss; the central approach and boss silhouette stay readable.
- Portal: the approved round portal and far-wall placement remain intact; side banks lead toward an unobstructed paved approach. Reactor integrity and the player remain visually separated in the additional check.

The first captured pass made the cave banks too opaque and blue, and the grass too bright. The final revision reduces their opacity; these comparisons show that final revision. Ground coverage is composed in banks, not loose decorative clutter. Broad central paving intentionally remains for combat readability. No major new HUD, artwork or objective overlap was visible in the reviewed frames.

| View | Actual simulator comparison |
| --- | --- |
| Ruined Outpost combat | [Before / after](outpost-combat-comparison.jpg) |
| Swamp Basin | [Before / after](swamp-comparison.jpg) |
| Toxic Caves | [Before / after](toxic-caves-comparison.jpg) |
| Boss Sanctuary | [Before / after](boss-comparison.jpg) |
| Portal approach | [Before / after](portal-approach-comparison.jpg) |

[Frame indices and raw PNG SHA-256 hashes](reviewed-frames.json) identify the exact source images. The side-by-side JPGs are resized presentation copies. Original final PNGs and recording are in [artifact 14200185249](https://github.com/JPaulus04/invasion-front-app/actions/runs/43808310655/artifacts/14200185249).

The before images are the documented `fc6ddc0` simulator captures. The renderer and environment plan at that revision are identical to the approved `eee6d3a` baseline. Camera, geometry and staged room positions are unchanged; combat actor poses can differ between recordings. Comparisons use actual simulator pixels, with no generated scene previews.

## Validation

- Local source checks and **59 Python tests passed**.
- Native room/environment, collision/navigation, animation, replay, reactive-driver and pacing suites passed.
- iOS compilation and **89 compiled catalog resource** checks passed, including all 40 Mossbot frames and the new banks. Approved bundled portal alpha/pixel comparison passed.
- New all-room checks verify unchanged collision rectangles, complete prop clearance, reserved portal/objective space, bounded bank/plant counts and plant heights. Existing camera, spawn and entry/exit navigation tests remain intact.
- [First routine run 43806593111](https://github.com/JPaulus04/invasion-front-app/actions/runs/43806593111) stopped before simulator startup when Swift could not type-check the expanded asset-name expression. `ed6a214` replaces that expression with explicit collection steps; no tests were disabled.
- [First visual milestone 43806839950](https://github.com/JPaulus04/invasion-front-app/actions/runs/43806839950): **passed**, including actual simulator capture; reviewed before refining opacity.
- [Final visual milestone 43808310655](https://github.com/JPaulus04/invasion-front-app/actions/runs/43808310655): **passed** on exact source `4762951`, including all 59 Python tests, native suites, iOS compilation, bundle verification and the ten-stage simulator tour. All five requested views and the additional integration frames were reviewed from its artifact.
- [PR checks 43808315629](https://github.com/JPaulus04/invasion-front-app/actions/runs/43808315629): **build passed**. The broad simulator matrix is intentionally skipped for the draft PR; this is not a dynamic campaign pass.

Each visual milestone used the established focused tour on one disposable simulator. No runner cycling or extra simulator recovery attempts were needed. The evidence-only follow-up commit does not change the captured application source.

## Remaining checks

The new overlay inputs total 8 MiB uncompressed if all are resident. The renderer adds at most eight beds, sixteen low plant sprites and twelve exterior landmark sprites (with their contact shadows); all are built on room entry/resize and reuse the existing texture cache. No per-frame scenery generation, crop pass or gameplay collision is added. Physical-device frame time and peak memory remain unprofiled.

This finishing pass does not repeat the previously blocked full dynamic campaign matrix. Existing gameplay-rule tests pass, but a complete physical-device World 1 run and compact-iPhone/iPad visual checks remain outstanding as recorded in the [baseline report](../REPORT.md). No merge or TestFlight upload is authorized or performed. Final visual approval remains with the reviewer; no unqualified 9.5/10 certification is claimed.
