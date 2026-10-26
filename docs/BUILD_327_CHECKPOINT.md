# Build 327 development checkpoint

## Status
Development checkpoint only. Not compiled or visually accepted. No TestFlight action.
Stable baseline: c1fc125da825d558a84d0fd05939c6348ad942f2 on outpost-zero.
Baseline iOS workflow 40255010062 completed successfully.
Changes are isolated on local branch build-327; the remote development baseline is unchanged.

## Implemented in source
- Four transparent production boss sprites: Root Lord, Toxic Matriarch, Warforge, Frost Wraith.
- Cached textures, aspect-preserving sizing, contact shadows, procedural breathing/hover, pulsing cores, hit feedback, named health bars and phase feedback.
- Replaced the active procedural boss assembly with production sprites. Existing forest phase transition and mechanical overdrive rules retained.
- World identities match the approved board: Frontier Forest, Toxic Crossing, Iron Wastes, Frost Expanse. Save indices, star keys and reward identity remain stable. Existing World 2/3 saves therefore retain progress but receive the revised biome identity.
- Four playable worlds; completed legacy saves also satisfy the next-world unlock without minting stars or cores.
- World 4 has a twenty-room schedule, three spaced survival rooms, icy baked ground, crystal edge props and a boss combining a warned fan volley with a separately warned flank impact.
- Removed obsolete Ability Lab instruction to select three abilities before each world.
- Added production-boss capture fixtures and the World 3 victory -> World 4 entry fixture to hosted validation.
- Updated catalog, repeat-reward, persisted-unlock, terrain and pacing tests for the revised four-world scope.

## Executed checks
- scripts/check_project.py: passed, 21 Swift files.
- scripts/check_art_sprites.py: passed, 65 production PNGs.
- Workflow YAML parse: passed; original three validation jobs retained.
- git diff --check: passed.
- Inspected a contact sheet of the four production sprites locally. This is asset review only.

## Not yet verified
- Swift compilation and Swift executable tests: unavailable locally (no Swift/Xcode).
- Actual SpriteKit screenshots and motion review: not captured.
- Device performance, combat fairness, visual contact/occlusion and save migration in the running application.
- Existing full screenshot suite compatibility with the revised identities.

## Blocker
Automatic approval review rejected git push to JPaulus04/invasion-front-app, branch build-327, citing potential export of source and generated assets to an unverified public remote without explicit publication authorization. Do not retry through another tool. Request explicit approval for this exact source/art payload and destination. This blocks hosted iOS compile/simulator capture, not local version control. No release action is needed or authorized.

## Critical art assessment
New sprites substantially better match the approved character silhouettes, materials and depth than the earlier shape assemblies. That does not establish gameplay quality. Animation is whole-sprite procedural motion, not authored limb articulation. Current Warforge uses the existing warned projectile fan rather than the target laser sweep; Matriarch does not yet have the full acid-breath/swarm encounter; Frost Wraith does not yet have the complete ice-spike/blizzard kit. Environment detail remains below the concept board. No final art acceptance is claimed.

## Remaining directive work
- Run hosted validation and inspect actual boss/world captures; fix layout, contact and animation issues before expanding scope.
- Develop the bosses' complete distinct attack kits, limb motion and performance acceptance.
- Complete broader environment and menu art work.
- Implement the branching permanent Level 1–5 ability system, dual prerequisites, expanded playable effects and rarity eligibility.
- Rework resource economy with fresh-character simulations and actual fresh runs.
- Add later-world aerial/laser/boomerang/shield/elite behavior combinations.
- Redesign Ability Lab; complete Home/Pilot/world selector polish.
- Consolidated validation and user gameplay review before any TestFlight request.

## Asset provenance and generation specification
Tool: built-in image generation, transparent output, approved boss board used as reference.
Reference: Outpost Zero: Boss Designs Worlds 1–4.png (Library libfile_94bff9119f308191b322ad8805dc237f).
Project assets: OutpostZero/ArtAssets/boss_root_lord.png, boss_toxic_matriarch.png, boss_warforge.png, boss_frost_wraith.png.
Generated outputs were converted to RGBA and aspect-preservingly reduced to a maximum 512px edge with Lanczos; alpha preserved.
Shared prompt constraints: single complete character, elevated orthographic camera looking down 40 degrees toward front/bottom, polished dimensional cartoon 3D mobile rendering, upper-left illumination, strong 180px silhouette, transparent background, no UI/text/floor/scenery/ground shadow. These are game assets, not gameplay previews.
Character prompts: Root Lord—ancient bark guardian, broad wooden fists, branching antler crown, moss leaves, green glowing eyes/chest seed. Toxic Matriarch—six-legged mutant arachnid queen, purple crystal talons, cracked charcoal carapace, acid-green sacs/mandibles. Warforge—quadruped mechanical assault platform, graphite armor, orange furnace core, shoulder missile pods and cannons. Frost Wraith—compact curled ice dragon, blue crystal spine/horns, clawed forelimbs, sapphire scales and luminous cyan mouth/eyes.
