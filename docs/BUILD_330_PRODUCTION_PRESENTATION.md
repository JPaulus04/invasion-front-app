# Build 330 — production presentation batch

Baseline: `6f713a1` on `build-327`, the validated source associated with the user's Build 329 review. Older commit titles still say Build 328. This batch sets the project build number to 330; it does not archive or upload to TestFlight.

## Comparison with Build 329

| Area | Baseline | Build 330 implementation |
| --- | --- | --- |
| World 1 terrain | Authored floor stretched to bounds; limited added depth | Aspect-fill preserves painting proportions. Cached material relief adds recessed stone/sediment edges, soft perimeter shade, shallow reflective stains for swamp/caves, and off-center skylight. |
| Room composition | Props distributed along almost uniform vertical spacing | Landscape-seeded clusters with open gaps and depth ordering; original props and boss illustrations retained. |
| Lighting/grounding | Two ellipse shadows per prop | Authored silhouette projected into a directional cast shadow, retained contact shadow, warm lantern light pools. Lighting follows the scrolling arena. |
| Combat | Full-width red hit message competes with objective | One bounded local HP-loss label at pilot position; quieter screen flash; short muzzle ground illumination tied to real shots. Existing telegraphs, damage, collision and boss behavior retained. |
| HUD | Solid 62-point header box | Open utility row with separate floor/currency capsules, centered level, thin safe-area XP track, separate objective pill and pause control. |
| Ability choices | Text abbreviations in small circles, single-line detail | Original rendered vector illustrations, rarity/category hierarchy, fitted titles, wrapped descriptions, card depth and staggered reveals. Reduce Motion skips reveals. Full-card touch targets remain shared with QA; combat stays paused. |
| Player locomotion | Eight moving headings, idle textures at eight intermediate headings | Every movement bearing selects a nearest authored walk cycle with hysteresis. Sixteen-way idle/aim views remain. Displacement still drives stride; blocked movement does not walk in place. |
| Restoration | Only selected branch explanation, no per-button price | Every branch shows one-core price, next benefit/threshold, max/unaffordable state and explicit no-stat-gain steps. Explains that only newly earned world stars award cores. Purchase feedback highlights the purchased row. |
| Gear | General benefit formula below purchase list | Before/after benefit at each purchase; runtime and preview share the same calculation. Existing prices, saves and diminishing returns preserved. |
| Review parity | Survival capture recreates fallback over authored terrain | Capture uses normal encounter setup and asserts that the production terrain layer remains installed. Direction capture also exercises production moving presentations. |

## Production integration

Terrain is installed by `updateZoneScenery`, also used by live room entry and layout changes. Cards are built by the real `showLevelUp` flow reached by XP gain. `updatePilotPresentation` selects walk art independently of preview flags. Restoration uses the existing `investCore` transaction. Experimental southwest leg-rig preview is not promoted to production; production uses the shipped authored frames.

`ProductionPresentation` caches rasterized vector/material textures with count and memory limits. Terrain detail is baked once per size/landscape/visit rather than rebuilt every frame. Combat lights and damage labels are short lived and replace prior named nodes, limiting accumulation. No new terrain collision, reward rules, enemy mechanics or boss artwork changes.

## Verification and remaining work

Local: source sanity checks, required sprite/World 1 asset audits, and diff whitespace checks. All 101 production PNG assets and 36 World 1 authored assets pass their existing checks. No local Swift/Xcode SDK is available in this environment.

Added to the existing Swift test entry points: exhaustive movement bearings, direction-boundary hysteresis, invalid heading handling, gear formula parity across all ranks, clamping, and restoration milestone/no-gain descriptions. Existing simulator selection/resume and direction captures exercise the changed production paths. These Swift and iOS runtime checks are pending the single full GitHub validation.

This is an implementation comparison, not a verified before/after visual score. Remaining: review new screenshots and motion captures against Build 329, verify text/layout on compact devices and on device, and assess GPU/texture cost in gameplay. No claim that 9.5/10 has been achieved without that evidence. Economy prices have not been rebalanced without fresh-character play evidence. No new boss assets or experimental rig shipment.

Push this entire batch once with `[full-review]`, which requests the existing compile and full simulator review jobs. Do not monitor the workflow afterward. Do not upload to TestFlight.
