# World 1 art replacement — implementation acceptance contract

Status: production assets NOT YET integrated. Do not mark the visual rebuild complete from layout, screenshot automation, or procedural geometry changes.

## Target
Match the approved bright, dimensional cartoon-3D visual references in real SpriteKit gameplay at native portrait scale. World 1 is Frontier Forest, stages 1–20. The approved landscape set is Ruined Outpost, Swamp Basin, Toxic Caves, plus a dedicated Root Lord arena.

## Required deliverables
- Separate, alpha-transparent, gameplay-ready PNG sprites for wall segments, broken columns, stones, crates, lamps, vegetation, bridges, and environmental accents; no baked-in characters, enemies, HUD, or shadows that conflict with layering.
- Seamless illustrated ground tiles for each landscape, with at least three variations per landscape. Avoid visible repetition and procedural polygon fallback in approved rooms.
- Foreground and background prop layers with consistent isometric/top-down camera angle, light direction, edge treatment, and sprite scale.
- At least three meaningfully distinct navigable standard-room arrangements per landscape; verify paths, enemy spawns, pickups, portals, and hitboxes.
- Three survival configurations per world, approximately 28% wider than standard rooms while remaining taller than wide; open central combat space and sparse perimeter obstacles.
- A distinct stage-20 boss arena.

## Integration gates
1. Import the actual artwork into the Xcode asset catalog with deterministic names and verify that SpriteKit resolves each texture (no silent placeholder fallback).
2. Preserve collision and hazard logic independently of decorative sprites; World 1 liquids are atmospheric unless explicitly configured otherwise.
3. Capture a real simulator screenshot for Ruined Outpost first, with normal HUD, player, and enemies; review it at phone scale against the approved rendering.
4. Only after Ruined Outpost passes, integrate and capture Swamp Basin, Toxic Caves, and boss arena.
5. Verify both normal and survival arenas, movement, enemy visibility, performance, and no obstructed exits before TestFlight.

## Explicit non-goals
- Another pass of colored shapes, polygon outlines, or gradient-only floor fills.
- Concept renders presented as proof of in-game integration.
- Declaring completion solely because CI is green or screenshot jobs exist.
