# Build 340 physical-device feedback — Build 342 acceptance baseline

User supplied ten actual Build 340 screenshots (IMG_0052.jpeg through IMG_0061.jpeg). This document records observed presentation issues; the original screenshots have not been uploaded to the repository. No claim about Build 341 device behavior is made.

| Observation | Priority | Acceptance criterion |
|---|---|---|
| Toxic Crossing rooms 27, 29, 30: dark flat green ground, repeated primitive tanks/props, polygonal acid pockets | P0 | Authored contaminated ground and grounded scenery; dimensional acid rendering follows authoritative hazard polygons, active/inactive state readable, no oversized effect obscures combat. |
| Iron Wastes rooms 1 and 2: flat blue floor, primitive debris, hard-edged water pockets | P0 | Dedicated metal/industrial ground, grounded scrapyard scenery, dimensional coolant edges, clear navigable space. |
| Portal visually strong but stands over featureless ground, near a primitive obstacle | P1 | Preserve approved portal art and gate geometry; compose scenery so portal reads as grounded, unobstructed landmark. |
| Frontier Forest selector has detailed authored floating island; Toxic Crossing and Iron Wastes have flat polygon platforms, mismatched forest props and visibly disconnected silhouettes | P1 | Unique complete authored dioramas for Toxic Crossing, Frost Expanse and Iron Wastes, matched to stable world IDs and World 1 presentation quality; no generic placeholder platform or reused forest props in playable-world cards. |
| Toxic Crossing rooms 29–30: repeated enemy silhouette in captured encounters; effects and transient ghosted figures overlap | P1 | Review actual composition and temporal effects via video, not isolated screenshots; confirm faction roster variety and distinguish spawn/defeat effects from unintended duplicate sprites. |
| Iron Wastes listed as World 3, 20 rooms; Frontier Forest 20 rooms | Already addressed in Build 341 source | Verify on actual Build 341 device: stable IDs 0,1,3,2 in display order, all four worlds 30 rooms; preserve prior progression. |
| Commander HUD portraits differ from in-game models; health bar beneath commander sometimes separated by visible gap | P2 | Match equipped commander presentation; inspect moving and idle animations at device size and retain health-bar readability. |

Code review: OutpostScene's authored islandAssets mapping includes stable IDs 0 (forest) and 3 (ice), not 1 (Toxic Crossing) or 2 (Iron Wastes). WorldShowcase fallback constructs props from world1_* families. The screenshots are consistent with this fallback. Inspect Frost Expanse on device before diagnosing its island. Do not change progression or replace valid assets simply based on screenshot appearance.

Prioritize gameplay environment artwork first, then complete the selector dioramas. Review representative standard, gate-open and boss scenes at phone scale before enabling production landscape route. Preserve Build 341 release separation. No gameplay, image assets, release controls or main changed by this documentation commit.

## Device correction pass

- Selector: add stable-ID authored island keys 1 (world_toxic_island) and 2 (world_iron_island); use existing production image resolver and proportional fit. Only construct the procedural fallback if no authored image resolves. Actual new island files are not present, so Toxic/Iron retain their fallback until art arrives. Forest/ice asset names preserved.
- Hazard preview: DEBUG launch flag `-previewDimensionalHazards` enables a bounded raster candidate generated directly from each immutable TerrainHazards patch outline. Transparent outside the polygon, recessed colored bank, irregular surface detail, separate pre-rendered active/inactive acid states. Original collision, timing, damage and rubble paths remain untouched. No production activation and no claimed visual approval; review on actual simulator before switching.
- Regression source checks cover routing, proportional scaling, exact outline clipping, texture bounds and acid state dispatch. Hosted compile, tests and screenshot review still required. Existing prop/ground PNG backlog unchanged.

## Focused hazard verification

Added a separate, branch-scoped Debug simulator workflow for six actual captures: legacy vs inactive/active toxic Room 1, active Toxic boss Room 30, Frost Room 1 and Iron Room 1. The fixture asserts preview node existence, dimensions, authoritative polygon bounds and exact acid state; marker is emitted only after the checks. The capture harness observes a delayed launch on the same process, retains unusable frames and fails rather than manufacturing a capture. This is a focused review independent of Build 341 release gates. The workflow and screenshots have not yet been executed on the new commit; visual sign-off remains open. No new scenery PNGs uploaded in this pass.

## Hazard review first execution and art direction

Run 45888169548 at 2d76c66: Debug build passed, real legacy Toxic Room 1 capture passed, new inactive acid fixture stopped at OutpostScene.swift:7824 (exact CGSize/CGRect equality assertion). Artifact 15150578243 contains the original screenshot and stderr. The actual numerical differences were not logged; floating-point bridging is a hypothesis, not a confirmed diagnosis. Replace exact equality with six explicit finite coordinate/size deltas limited to 0.05 world points; include actual geometry in assertion diagnostics. Report app stderr in CI on failures. No change to polygon, raster renderer, collision or damage. Latest iOS compile run 45888169326 passed. Re-run focused validation and inspect actual PNGs before any production enablement.

User selected Image 2 from the latest visual concepts: warmer detailed soil, dimensional industrial surroundings, bright recessed acid and strong visual separation of combat actors. This is art direction, not a simulator capture or approved production package. Retain the actual portrait HUD, auto-fire controls, existing portal/actor art, authoritative collision and clear combat lanes. Avoid copying the concept's landscape orientation, added virtual controls or inaccurate gameplay layout. Remaining asset candidates: boulder, vegetation, wall; no generated concept board will be shipped as an arena image.
