# Build 327 development checkpoint

## October 28 — Toxic Caves candidate integrated

- Added three 512x768 slate/violet floor compositions and six transparent cave props using built-in image generation. Prompts and source IDs are recorded under docs/art-review/toxic-caves-*.
- Exported props with max 472px content edge, preserved proportions and measured 20px transparent borders; extended ground-contact anchors to this pack. Existing room selection loads variants on 9–10, 14–15 and 18.
- Next hosted validation now requires all 27 delivered textures in Assets.car. Swamp/Cave first and revisit captures require authored floors and six resolvable props. Guardian fallback remains allowed during development.
- Local validation: cave audit 9/9; 92 PNG format/alpha checks; all nine cave PNG checksums; 21 Swift source checks; YAML parse and compiled-catalog acceptance/rejection exercise. One incomplete debris PNG export was caught and corrected.
- World 1 artwork coverage is 27/36; Guardian Clearing remains missing. Swamp and Caves remain candidates with simulator scale, contact, projectile contrast, traversal and performance review deferred. No CI run or TestFlight action; batch commit uses [skip ci] at user request.


## October 28 — Swamp Basin candidate integrated

- Added three 512x768 opaque ground compositions and six transparent props using built-in image generation. Source IDs and exported sizes are recorded in `docs/art-review/swamp-basin-generated-sources.json`.
- Props preserve aspect ratio, max 472px content edge, and measured 20px transparent border. Extended the existing visible-bottom anchor to Swamp Basin. Floor selection already maps rooms 4–5, 11–13 and 17 to the three variants.
- Local checks passed: Swamp audit 9/9; 83 present sprites meet format checks; 21 Swift source sanity checks; whitespace. World 1 now has 18/36 required assets.
- No hosted validation launched: user requested batching to avoid repeated 20-minute runs. New pack is NOT simulator-validated or visually accepted. Review scale, shadows, water readability and projectile contrast in the next necessary batched run. TestFlight remains on hold.


## October 28 — Verified Build 327 visual baseline and production decision

- iOS Compile Check #558 on 33eb38f passed build, simulator-review and defense-visual-review; all seven World 1 landscape PNGs were independently inspected from the uploaded `outpost-zero-world1-landscape-review.zip` artifact. This is a visual observation, not an assertion that all authored art is complete.
- Floor 1 and Floor 7 Ruined Outpost show the new bright textured ground and authored stone/vegetation/debris props, with open combat space and readable player/enemy silhouettes. Accept the **visual direction** as the benchmark; retain candidate status pending live portal traversal, contact-shadow and projectile-contrast review.
- Floor 4 Swamp Basin, Floor 9 Toxic Caves, Floor 12 Swamp revisit, Floor 15 Caves revisit, and Floor 20 Guardian Clearing still show mostly procedural/dark ground. They are not visually approved. Boss character artwork is stronger than the generic boss arena.
- Distinguish **CI pass** (compiled, capture fixtures and validation passed) from **art acceptance** (human review of actual captured frames). Never infer appearance from a stale run; record screenshot source commit/run and preserve the landscape ZIP.
- Production order: Swamp Basin, Toxic Caves, Guardian Clearing. For each: ground compositions + six integrated props, visual review at first/revisit where applicable, enemy/projectile contrast, open dodging lanes, and natural portal approaches without a literal road. Only then move to the next biome.
- No TestFlight release or save reset at this checkpoint.


## October 27 — First complete Ruined Outpost asset candidate

- Published the previously approved correction via the GitHub connector as d0afe5548a4aebfbb75b6e94781e207d9bbfde13 (same tree as local 5bc736c). Shell push lacked credentials; connector publication succeeded. Run 40591065946 passed compile/logic; simulator jobs remained running at this checkpoint.
- Generated and installed all nine Ruined Outpost assets: three separate ground compositions plus wall, boulder, vegetation, debris, lantern and crate. This is the first landscape candidate, not final art acceptance. Swamp Basin, Toxic Caves and boss arena still need 27 assets.
- Normalized props with preserved alpha and a known 20px border; runtime bottom anchors now align this pack with its contact shadows. Reviewed all six props at small display sizes locally.
- Authored floors cover expanded survival bounds, and the higher fallback survival ground is hidden when an illustrated floor is present. Existing extraction fixture checks coverage and absence of the fallback overlay.
- First/revisit Ruined Outpost captures now require the real floor and all six bundled props, preventing silent fallback acceptance.
- Corrected the sprite validator to inspect installed image-set payloads as well as standalone ArtAssets. Local checks: 21 Swift source checks pass; 74 PNGs pass format/alpha checks; Ruined Outpost audit 9/9; complete World 1 still 9/36.
- Candidate images are full-room ground compositions, not verified seamless tiles. Runtime currently uses one composition per room; do not claim tile seam acceptance. Floor contrast, projectile readability, prop grounding, survival camera motion and performance still require actual simulator/device review.
- Next: inspect real first/revisit Ruined Outpost and survival captures at this revision. Resolve visual defects before making other landscape packs. No TestFlight upload or save reset.

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
