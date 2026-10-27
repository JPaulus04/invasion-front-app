# Build 327 development checkpoint

## October 27 — Portal guidance and trustworthy landscape capture

This section supersedes the older status/blocker below; older entries remain historical.

- Resumed from remote build-327 at 9b795efa6d31a78ededcdb39348db99be8e00641. Its run 40588740569 passed build/logic tests; visual jobs were still running when this correction was prepared.
- Inspected all seven actual baseline landscape images from run 40498084160, artifact 12732318123. The swamp filename contained Floor 1 instead of Floor 4. Other images included ongoing combat damage. File existence/color checks were insufficient to establish the intended scene. These images predate portal guidance and cannot establish its visual acceptance.
- Landscape fixtures now hold the scene update as well as SpriteKit actions, stage up to three production enemies, and stamp seven distinct QA-only RGB identities. Screenshot validation requires the expected identity, rejecting stale frames from another landscape.
- Removed upper-gate guidance from survival encounters, whose extraction orb spawns near the player. Added an assertion in the existing production survival-extraction fixture. Tactical, defense and boss exits retain their guidance.
- Local source and 65-sprite format checks pass; whitespace passes. Screenshot validator exercise accepted all 7 matching identities and rejected all 42 mismatches; it also rejected the actual mislabeled baseline swamp image.
- Authored-art audit FAILS: 0/36 planned World 1 floor/prop PNGs present. Existing character/boss/tree art does not satisfy that environment asset contract. Procedural fallback polish is not completion of the agreed production-art standard.
- Fresh iOS compile, full simulator validation and actual corrected-frame review remain required for this patch. No TestFlight upload or player reset.
- Next: review the corrected seven-frame artifact and portal approach/extraction captures, then complete the authored World 1 environment asset integration and navigation/performance acceptance before extending the same foundation to other worlds.

## Historical initial checkpoint

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
