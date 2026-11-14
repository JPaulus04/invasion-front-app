# Build 337 — World 1 Environment Layout Contract

Status: Implementation specification. NOT simulator-validated or approved for release.
Baseline: main at branch creation.
Design goal: 10/10; user approval threshold: 9/10.

## Non-negotiable
- Do not stretch a baked courtyard painting to room dimensions.
- Maintain a constant stone-to-character ratio in world units, independent of camera framing.
- Do not randomly scatter incompatible floor materials. Use one dominant surface and organic perimeter transitions.
- Preserve current player, portal, reactor, combat, HUD and collision behavior until targeted changes are validated.
- Never use a visual concept score as proof of simulator quality.

## Regular passageway
- Long forward-moving traversable path with narrower connectors and wider combat pockets.
- Player-follow camera reveals scenery ahead; never zoom to shrink the entire route into view.
- Walls and props define passage boundaries but leave attack and dodge space.
- Portal is a destination integrated with the far wall; no isolated portal in the combat lane.
- Validate entrance, mid-route combat, exit, enemy movement, and camera follow.

## Survival courtyard
- Large, open arena with minimal central obstacles and multi-directional spawn approaches.
- Continuous dominant stone-and-moss ground; variation concentrates at the perimeter.
- Camera follows the player; terrain density remains fixed as arena size changes.
- Perimeter landmarks are distinct but do not occlude enemies or pickups.
- Validate wave movement, edge visibility, enemy spawn paths, and repeated texture patterns.

## Reactor defense
- Dedicated defensive arena; reactor is immediately identifiable as the objective.
- Directed enemy approaches with unobstructed movement and a visible reactor perimeter.
- Integrity and countdown remain readable during attacks.
- Reactor, player and scenery must not visually overlap or obscure objectives.
- Validate approach routes, target selection, objective survival and loss states.

## Root Lord boss arena
- Monumental root architecture, corrupted lighting, deliberate boss staging area.
- Clearly different silhouette and atmosphere from survival courtyard.
- Large unobstructed central attack space and readable hazard telegraphs.
- Boss intro must communicate scale and threat without blocking gameplay.
- Validate boss footprint, movement, projectiles, telegraphs and exit transition.

## Asset integration
- Use extracted wall, tree, ruin and vegetation sprites only after alpha-edge cleanup.
- Existing floor composites are references, not production-ready seamless tiles.
- Prefer fixed world-space floor density and authored organic composition masks.
- Variation must be deterministic and room-type-specific.

## Release gate
1. Implement each room's distinct geometry and asset composition.
2. Pass compile and automated gameplay.
3. Capture real simulator screenshots for regular, survival, defense and boss.
4. Review character scale, repetition, movement clearance, readability and intimidating boss identity.
5. Do not merge or upload without user approval.
