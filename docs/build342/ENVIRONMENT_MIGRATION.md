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
