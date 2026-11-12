# Outpost Zero — Build 314 art acceptance gate

Approved visual direction: stylized cartoon sci-fi, thick readable silhouettes, blue/white/orange pilot, red/charcoal robot enemies, lush Frontier Forest.

## Mandatory production requirements
- Export **individual transparent RGBA PNGs**, never crops from a presentation board.
- No baked checkerboard, gradient backdrop, labels, glow around bounding box, or neighboring sprite fragments.
- Consistent 3/4 top-down camera angle and common light direction (upper left).
- Player and enemies should be readable at actual SpriteKit display sizes; test at 1x on iPhone.
- Sprite frames must have stable registration (feet/body center) and consistent canvas sizes within each animation.
- Separate shadows, projectiles, muzzle flashes, and explosions from base sprites.
- Use nearest-neighbor only for intentionally pixel-art assets; cartoon sprites need appropriate filtering.
- Review isolated RGBA sprites against light, dark, and checkerboard backgrounds.
- Verify animations in an actual simulator screenshot/video before declaring art complete.

## First vertical slice
1. Pilot: idle, walk, fire, hurt.
2. Scout: idle, locomotion, attack, death.
3. One pine tree, one bush, one rock and one terrain tile.
4. One playable Frontier Forest room using those sprites.
5. Capture gameplay on simulator and compare to approved cartoon direction.

## Quality gate
**Do not integrate or count** a sprite as finished if it is cropped from a multi-object concept image with incomplete transparency, missing body parts, text, or baked effects.

## Current status
Art direction approved. Production sprite asset set **not yet approved or integrated**. Existing code-generated textures are temporary placeholders.
