# Build 342 environment migration — phase 1

Base: 350d35b0c6c528633eb36fa675a5fdbcb7bf8d4b (Build 341 merged gameplay). Separate draft; do not merge into the Build 341 release.

## Retired in phase 1
- Unreachable procedural World 1 pine, fern, guardian and overgrowth decoration after the authored World 1 renderer's early return.
- Later-world zone zero cannot occur because its lower bound is one (industrial) or two (other biomes). Remove dead zone-zero variants and unused forest helpers.
- Preserve active toxic, frost and industrial presentation, hazard polygons, collision, portals, enemies and save migration. No asset deletion yet: older named files may be shared by menus, fixture modes or bundle validators.

## Next migration gates
1. Inventory actual environment PNGs and runtime references, including catalog aliases, generated resources and bundle resolution. Do not confuse world1_toxic_caves with a complete World 2 production environment.
2. Add an authored faction environment plan for Worlds 2–4; share rendering primitives with World 1 while keeping distinct palettes and deterministic room layouts. Preserve gameplay geometry as authoritative.
3. Validate all required art in the built bundle; replace each active legacy scenery path only once its authored equivalent passes simulator review.
4. Audit unused resources after all replacements land, then remove only proven unreferenced assets and update tooling contracts.
5. Compare representative standard, passage, defense, survival and boss arenas for each world, including performance and hazard readability.

Phase 1 is intentionally behavior-preserving, not the landscape visual upgrade. Hosted compile and gameplay tests are still required.

## Phase 2 — asset dependency audit

| Asset family | Disposition | Reason |
| --- | --- | --- |
| forest_undergrowth_polished.png | Remove from app resources and obsolete CI file-presence assertion | Only runtime call sites were removed in phase 1; repository search found historical documentation and that assertion only. |
| forest_pine_polished / forest_broadleaf_polished | Retain | Authored World 1 environment plan still uses them. |
| world1_overgrown_stone_arena.png | Retain for now | Ground material baking uses this source; provenance must be preserved. It is a candidate for relocation outside the runtime bundle, not deletion. |
| world1_* family assets | Retain | World 1 layout and world-selector dioramas use dynamically constructed names. |
| boss_toxic_matriarch / boss_frost_wraith / boss_warforge | Retain for now | BossArtwork.install still serves the no-manifest/fallback path. Verify actual fallback policy and update tests before removal. Root Lord artwork remains live. |
| legacy pilot and generic enemy PNGs | Retain for now | Still reachable through HUD, procedural presentation and fallback paths; need an explicit runtime coverage audit. |
| repeated Mossbot frames | Retain | Identical file hashes alone do not prove redundant animation timeline slots. |

The world-selector passes the stable faction ID to WorldShowcase. Its old shared world1_* prop families also need replacement with dedicated faction art, but the ordering is not itself evidence of a faction-ID bug. No active later-world landscape, gameplay, or save behavior is changed by this pass.

## Phase 3 — shared authored environment primitives

Extracted the active World 1 fixed-size ground tiling and grounded-prop presentation into AuthoredEnvironmentRenderer. World 1 still supplies the same material variant, world origin, bounds, texture provider, positions, sizes and anchors. Ground depth, shadows and portal presentation are unchanged. This prepares reuse by all factions without introducing a second renderer or changing collision.

### Toxic Crossing production inputs (proposed filenames, not existing/approved art)

- Four seamless 1024×1024 ground material variants at a common authored density: dark contaminated soil, worn stone, corrosion and subtle mineral staining. Use deterministic tile choice, not room-sized stretching.
- Transparent perimeter props: corroded containment tank, broken pipe, industrial debris, acid-stained boulder, toxic vegetation and damaged retaining wall. Measure visible grounding anchors.
- Acid hazard art: small dimensional pits and narrow streams, irregular feathered rims, recessed fluid, bubbles and subdued glow. Use existing hazard polygon/damage geometry as authority; keep damage boundary visible. No unexplained boxes or lines, no large flat green pools.
- Boss, passage and defense dressing should vary without masking the exit, reactor, hit warnings or walkable lanes.

No complete approved World 2 landscape set was found in the available prior context. Do not simply tint World 1 forest artwork and call it production Toxic Crossing. Active legacy World 2–4 paths remain until replacements are visually verified. New source guards cover the shared primitives; hosted iOS validation is required to establish behavior equivalence.

## Phase 4 — Toxic Crossing staging

Added ToxicEnvironmentPlan and ToxicEnvironment using the shared tile/prop primitives. The plan uses live room bounds, four deterministic tile variants, six prop kinds and four dressing themes; Rooms 10/20/30 are boss-dressed. Full prop frames stay outside the navigable rectangle, with north/south central clearance. The existing hazard renderer and its collision/damage polygon remain authoritative. The DEBUG-only launch argument `-previewAuthoredToxicEnvironment` activates the candidate only if all ten required textures exist; missing inputs log a blocker and keep the live legacy renderer intact. No production route change, no new PNGs, no environment visual approval.

Asset contract: world2_ground_0…3 (1024 square seamless RGBA) and world2_prop_{tank,pipe,debris,boulder,vegetation,wall} (transparent normalized 512 canvas with intended contact 32 px above the bottom; check actual alpha and revise measured anchor before approval). Hazard art remains a separate next step; do not paint damaging acid into ground tiles. The existing native environment test now covers 90 room/bounds combinations, tile adjacency, deterministic placement, prop clearance and preserved acid geometry. Native hosted execution pending.
