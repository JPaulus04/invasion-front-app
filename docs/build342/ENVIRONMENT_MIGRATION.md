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
