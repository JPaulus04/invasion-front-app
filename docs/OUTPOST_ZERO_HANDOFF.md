# Outpost Zero — Current handoff (October 17, 2026)

## Why this file exists
ChatGPT project discussions have become extremely long. Open this file and inspect the live `outpost-zero` branch before coding in a new conversation. Never assume the last conversation's build number or green status is current.

## Repository / release
- GitHub: `JPaulus04/invasion-front-app`
- Active implementation branch: `outpost-zero` (do **not** edit `main` for gameplay).
- Latest user-reported uploaded TestFlight release: **317**.
- Work after that upload exists on the development branch. **Do not reuse build number 317 for the next upload.** Choose the next release number after confirming App Store Connect.
- Baseline examined here: `596dcf201f697f272d2ae6cc177665075460ad82`, workflow 341: compile tests **pass**, iOS simulator compile **pass**, and simulator capture validation **pass**. Workflow: https://github.com/JPaulus04/invasion-front-app/actions/runs/39053735827
- QA is automated screenshot/content/freshness checking, **not** human artwork approval. Inspect real frames against the artistic reference before releasing.

## Non-negotiable design choices
- Genre: polished, stylized 3/4 top-down cartoon sci-fi, with visual quality benchmarked to Archero 2. Avoid horizontal terrain seams and flat procedural-looking props. Pilot and trees must be readable at actual phone size.
- Player starts *inside* each room at the bottom; auto-fire with full movement freedom. Enter a gate to proceed after combat.
- Separate *angled circular deep-blue* entry/combat gate vs **visually distinct extraction portal**. Shared portal silhouette across biomes with biome-specific materials/lighting and a brief entry energy effect.
- 20 rooms per world, with a final boss. World 1 Frontier Forest; World 2 Flooded Outpost (water blocks movement); World 3 Toxic Crossing (acid/terrain hazard). The first 50 levels restore original systems; later cores unlock specialization/modules/builds, not endless raw core upgrades.
- Around **3–5 timed survival encounters** per world, usually **90–120 seconds**. At most 0–1 equipment-defense mission/world. Timed swarms should not become nonstop bullet-sponge fights.
- On survival timeout: **stop new spawns, open extraction, allow immediate exit even if enemies remain**, and allow only normal coins/XP from enemies actually killed before exiting. Never invent extraction-time XP/coin bonuses.
- Clear rooms do **not** grant an automatic combat upgrade. XP from enemy kills (+ small room rewards) accumulates; upgrades are selected when the character levels up.
- Ordinary players should often reach the world boss with practiced skill. Challenge should be fun, not punitive. Early waves reduced and contact hits tuned; avoid unavoidable mass ranged fire.
- Production art sprites are individual properly transparent RGBA with stable animation registration, matching the approved look. Art acceptance gate in `docs/build-314-art-acceptance.md`.

## Verified development as of baseline
- Full three-world campaign rules, enemy formation compositions, ranged telegraphs, water movement collision/navigation, character motion, ability synergies and enemy visual feedback present.
- Expanded survival arena & tracking camera are validated in **QA scenarios**; ordinary campaign still uses traditional tactical room flow.
- A live timed-swarm simulator QA fixture spawns real enemies, including screenshots captured over time.
- The currently missing production handoff is **real timed-survival extraction / equipment-defense completion and save/recovery integration**. Do not claim the production timed encounters are enabled.
- Pure rules explicitly distinguish `combatGate` from `extractionPortal` and verify the latter can open with living enemies at timer expiry (this handoff's extraction contract).

## October 17 continuation — production survival extraction
- Playable scheduled survival rooms now use expanded arenas, active swarm limits, the combat-clock timer and a distinct round extraction portal. The portal opens when the timer ends even while foes remain; exiting removes un-killed enemies without paying their XP/coins.
- Survival pays earned kill XP/coins and standard room Salvage, but no timed completion XP/coin bonus. Tactical clear rewards are unchanged.
- An optional elapsed-time value is encoded in schema-4 run snapshots without invalidating old TestFlight saves. Recovery resumes the timer and reopens cleared extraction portals.
- CI includes an actual production-path screenshot flag: -captureSurvivalExtractionScreenshot, with live enemies still in the room.
- Equipment-defense rooms are still ordinary tactical rooms until proper defense objective mechanics arrive.
- IMPORTANT: confirm CI pass and human visual review before release; no new TestFlight upload was requested.

## October 17 — extraction accessibility and UI acceptance
- Baseline extraction screenshot from workflow #343 (run 39059362674) passed but revealed overlapping status/portal instructions. Original workflow run: https://github.com/JPaulus04/invasion-front-app/actions/runs/39059362674
- Corrected extraction UI: position the banner below HUD corner controls, remove the redundant overlaid instruction, and clear banner state on entry to the next room.
- Added pure collision-safe portal placement that samples the full 12-point-radius walking approach and chooses a nearby accessible position; a trapped pilot evacuates from their current location rather than softlocking.
- Added geometry tests across screen sizes/biomes, live extraction path assertion, and an end-to-end screenshot fixture that starts Room 6, opens the timed portal while four enemies remain, enters it, and asserts Room 7 is tactical with a reset camera and no stale enemies/UI.
- No TestFlight upload. CI checks and screenshot inspection required before claiming this pass complete.

## October 17 follow-up — extraction combat and recovery
- Confirmed previous run 39063786781 fully passed simulator and iOS validation and inspected real extraction/Room 7 screenshots; visual cleanup succeeded. Art-sprite production approval remains separate.
- Fixed active combat after survival timeout: normal kill XP/coins, gunfire, damage and timed save continue while walking toward the portal; new spawns remain forbidden. The standard tactical gate remains peaceful.
- Survival snapshots now persist optional elapsed, spawned count and living count (schema-4 backward compatible). On resume, only the saved bounded living swarm is reconstructed; retained XP/coin/Salvage replay credits prevent duplicate farming. A missing legacy count is safely accepted.
- Extraction simulator capture now kills a real live enemy after opening the exit and asserts XP/coins gained, no additional spawns, and portal remains visible. ProgressCombatTests covers valid saved count and impossible swarm values.
- Final CI and simulator screenshot pass required; next milestone after validation is deeper extraction save/recovery lifecycle QA.

## October 17 — user-confirmed visual corrections
- Normal campaign exit: large elliptical/circular blue energy portal with in-world metallic mounting, swirling internal energy and visible ENTER prompt. Rectangular gate art removed.
- Survival timeout: small glowing orb with narrow vertical beacon, preferably at the arena center and repositioned only to a reachable nearby spot when terrain obstructs the direct route. Enemies still award ordinary kill XP/coins and do not respawn after timeout.
- Remove procedural dangling broadleaf vines and straight survival-arena floor outline. Hide forest room edge strokes.
- Simulator captures must show actual updated normal portal, survival orb and clean overgrown forest. No generic image substitutions and no TestFlight upload.

## Visual QA correction following the first October 17 simulator pass
- Full CI 39075581821 passed, but manual inspection found the survival extraction screenshot was actually the iOS home screen! The prior validator incorrectly accepted any colorful PNG at this filename. A magenta simulator-only identity square must now be present, just as in the live swarm QA frames; crashed apps cannot pass review.
- Fixed the QA-only extraction fixture's completion flag (direct completeWave now marks survival spawning finished as real expiry does); keep the legitimate post-extraction kill+reward assertion.
- Even without a border stroke, the opaque expanded-arena ground showed a horizontal lower edge. Oversize visual ground far outside collision bounds so its cutoff is never inside the visible gameplay viewport.
- Require a second genuine screenshot/artifact inspection before final approval.

## October 17 — Upright campaign portal (user confirmed)
- Previous circular campaign portal in run 39075581821 was too flat; user explicitly requires a **standing, upright ring** rather than an oval laid on the ground.
- Campaign portal now has a vertically extended elliptical ring with a grounded footplate, rear rim showing depth, side legs, tall blue energy field, vertically distributed swirling currents, and physical entry at the base. Separate small center-area survival extraction orb unchanged.
- The gate QA fixture checks the actual rendered ring's >140-point standing height, <120-point width, and base/structural elements before screenshot capture.
- Keep checking the *actual* simulator screenshot instead of judging by source assertions. No TestFlight upload.

## October 17/18 — survivor-only recovery rewards and lifecycle QA
- In modern survival saves, only still-living foes are recreated on resume. Previously earned coins and XP remain in the snapshot, and previously killed enemies never return. Their old kill reward credits **must not** suppress XP/coins from first-time kills of surviving enemies. Clear only XP/coin replay credits when an explicit saved living population is restored; retain Salvage credit and original replay protection for ordinary tactical and legacy saves.
- Added pure progression regression checks for full payouts of newly defeated survivors and tactical anti-duplication behavior.
- Expanded the existing **actual iOS simulator recovery fixture** to cover mid-timer interruption, an expired clock saved as battle state, a saved open extraction with live enemies remaining, and recovery with a pending level-up. It asserts timer, population, coins, XP, UI phase and portal recovery, without user save changes.
- Development commits: `685afbc2`, `ff5e587b`, `de80595f`, `8307ada3` on `outpost-zero`. CI run for final scene QA commit: https://github.com/JPaulus04/invasion-front-app/actions/runs/39096816547 . Unit tests passed as of initial inspection; **full CI and actual simulator screenshots still require verification**.
- No new TestFlight release. Continue with full simulator and screenshot acceptance; then implement actual equipment-defense mechanics as a separately named change.

## October 17/18 — Equipment Defense first playable implementation (pending full CI and art review)
- Scheduled 0–1/world equipment-defense missions are activated as **real defend-the-field-reactor objectives**, not renamed tactical rooms: World 1 Room 12, World 3 Room 15. World 2 has none.
- The ordinary tactical-size battlefield now presents a protected reactor with an on-device integrity meter and a HUD countdown. Melee units pursue the objective; ranged threats continue targeting the pilot. Reactor contact has bounded damage and grace period; reactor destruction ends the run with a distinct "DEFENSE OBJECTIVE LOST" reason. Enemy concurrency and spawn cadence are capped.
- Holding the reactor to the encounter deadline ends the attack, despawns un-killed enemies **without awarding kill rewards**, pays standard room completion rewards, and opens the normal **upright campaign portal** (never the small survival orb). Previous survival and boss routes remain separate. Equipment defense pauses during level-up and interruption.
- RunRecovery schema-4 optional `defenseObjectiveIntegrity` saves reactor HP and the timed population/clock; missing fields remain compatible. Survival/defense survivor-only reconstruction permits new legitimate kill payouts without duplicating previously killed enemies.
- Pure tests verify mode schedule, object integrity/defeat, spawn limits and separate exit routes; progress tests verify persisted integrity validity and backwards compatibility.
- Added real simulator screenshots for active reactor contact (`outpost-zero-defense-active.png`) and successful defense opening a normal portal (`outpost-zero-defense-cleared.png`); require a simulator identity marker so iOS home-screen captures cannot pass by mistake.
- **Status:** changes committed on `outpost-zero`; CI validation and actual screenshot/art inspection are **not yet complete**, so no TestFlight upload or release approval. Continue by checking the latest HEAD workflow first, resolving any compile/simulator failures, and inspecting both actual frames before adding new work.

## October 18 — reactor art review, stale-frame QA fix
- Reactor visual pass is now grounded in actual simulator captures: more dimensional armored reactor with vents, circular glowing energy cell, grounded footplate, green **SECURED** state and objective-loss overlay. The screenshots from completed workflow `39100387421` were unpacked and inspected.
- **Critical evidence issue:** `outpost-zero-defense-active.png` from that successful workflow actually showed **World 1 Room 6 survival extraction**, not defense. The old generic magenta QA identity marker mistakenly accepted the stale screen. Successful CI alone therefore did **not** establish active-defense visual approval. `outpost-zero-defense-cleared.png` and `outpost-zero-defense-failed.png` did correctly show the redesigned reactor.
- Corrective commits `0e8dae56` and `99676f48`: defense-active, secured and failed now use distinct red/green/blue simulator-only marker squares; screenshot PNG validator demands the right channel and rejects other defense states, old magenta survival frames and unrelated screenshots. Restored the reusable integrity bar's visibility at every new defense start.
- Verified on the previous artifacts that all three old frames sample RGB `(255,0,255)` at the expected marker location. Thus the new per-defense marker checks reject those stale captures. Separate CI run for `99676f48` is pending iOS/screenshot completion; do not claim new screenshots passed until inspected.
- No TestFlight upload. **Next checkpoint:** examine fresh active/secured/failed images from new run and confirm active room 12, integrity lower than maximum, green secured text and objective-loss overlay. Keep normal upright campaign gate after successful defense and separate survival orb.
- In future CI iterations, consider a fast, focused three-scene equipment screenshot job to avoid waiting for the full 35-image regression suite; preserve the comprehensive nightly/full-run coverage.

## October 18 — Equipment Defense accepted screenshots + first combat-fairness pass
- GitHub Actions green on commit `882a3ab5`: **build**, **full simulator-review**, **focused defense-visual-review**, https://github.com/JPaulus04/invasion-front-app/actions/runs/39102726936 .
- Downloaded actual focused artifact `outpost-zero-defense-visual-review` (artifact ID `12127138589`): active image correctly shows World 1 Room 12, reactor at **146/150** with three enemies; cleared image shows green **SECURED** reactor, upright regular campaign portal, no active attackers; failed image shows **DEFENSE OBJECTIVE LOST** overlay. State-specific red/green/blue pixels were independently inspected, correcting stale image acceptance. This clears automated visual capture; **user art taste/sign-off still pending**.
- Next named work: **Reactor Combat Fairness**. Original `spawnEnemy` could generate attack reinforcements directly against device; added `EquipmentDefenseRules.safeSpawn(distanceFromReactor:enemyRadius:)` with minimum 155pt + unit-radius exclusion, and filtered candidate positions. Added QA assertion that four defense enemies spawned outside this range. Added explicit on-hit floating damage feedback and **REACTOR CRITICAL** indication at/below 50 of 150 health, while keeping initial cap, hit amount, cooldown and 90–120sec timer unchanged until real device playtesting.
- Regression tests now assert exclusion boundaries and critical health threshold. **Latest combat-fairness CI after the pass must still be checked**, and active screenshot must show fair attacker positioning.
- Branch `outpost-zero`, latest TestFlight 317; **do not upload a new TestFlight build per subtask**. User review and performance/difficulty remain necessary before next release.

## October 18 — User-approved exclusive exit visuals
- User approves the current upright campaign portal and small survival extraction orb appearance, but asks that **they never appear together in the same gameplay room**. Composite comparisons are acceptable for review only; future screenshots should be large/readable and show one encounter at a time.
- Confirmed survival `showExtractionPortal()` already hides the campaign gate. Hardened ordinary `showZoneGate()` so it explicitly hides the extraction orb before revealing the upright campaign portal (also used after successful equipment defense).
- The actual iOS campaign gate fixture now deliberately exposes a stale orb first and asserts that normal portal activation hides it, preventing this state leak from regressing. Commit `6f797ee0` on `outpost-zero`; CI run https://github.com/JPaulus04/invasion-front-app/actions/runs/39130079392 pending at edit time. No TestFlight upload.

## October 18 — Reactor defense spawn safety on smaller screens
- Spawn review identified a fallback defect: random lane samples could all fail the reactor standoff rule, after which ordinary room fallback ignored the reactor entirely. Compact displays are especially vulnerable.
- Defender enemies now use a 9×9 deterministic safety search in addition to broader upper/lower random arrival lanes. Search filters terrain, keeps the pilot's 75pt + radius clearance, and prefers the full 155pt + radius reactor standoff when the geometry permits. On very compact rooms it chooses the furthest feasible approach, never closer than 105pt + radius; no valid location means deferring the reinforcement rather than spawning on the reactor.
- Normal tactical/survival spawns are unchanged. Pure regression tests cover 320×568, 393×852, 768×1024, and an impossible spawn. CI + physical frame review required; no TestFlight upload.

## October 18 — World 1 test-readiness scope lock / campaign CI compile correction
- User directed development to **World 1 (Frontier Forest) exclusively** until its 20-room loop, survival, reactor defense, boss, recovery, visual quality and controls are ready for an actual new TestFlight playtest. Freeze new Worlds 2–3 gameplay additions and other speculative features; only shared bug fixes necessary for World 1 are permitted.
- Latest head `ac315ed2` was **red**, workflow 39131013024, because the campaign test file referenced `RoomRules` (excluded from that pure Swift compile target) and used overly complex Swift collection expressions. Replace those dependencies with explicit test-local CGRect geometry/loops; no production-gameplay change in this fix. Check new CI rather than assuming success.
- **World 1 release gate:** compile/unit tests green; simulator review including real tactical/6/10/14/17 survival frames, Room 12 reactor defend/secure/fail, portal/orb exclusivity, Room 20 boss, saves/recovery; inspect actual frames, then user TestFlight playtest. No mini-step TestFlight uploads.

## October 18 — World 1 playtest: Guardian phase/art + star scoring
- User completed World 1 (Room 20) with upgraded gear; Guardian died in ~4 seconds. User reported no observed gameplay freeze, so presumed freeze in screen recording is not a confirmed gameplay bug. World 1's 112 total damage earned one star under old 10/50 damage cutoffs, judged excessively harsh.
- Focused World 1 changes: Guardian gains named armor/roots/foliage/core silhouette in actual SpriteKit boss; at half health its armor visibly breaks, core lights orange, and a warning mortar fires. Short 1.45s armor-break transition prevents a heavily upgraded gun from skipping phase two; exposed boss follows with telegraphed split mortar attacks. Worlds 2–3 boss rules unchanged. No global boss HP multiplier.
- World 1 stars are now 3 at <=75 damage, 2 at <=180, otherwise 1 (112 damage => 2 stars). Other worlds retain original scoring. WorldCoreRewards still awards only the difference against historical best stars, max 3 per world, so previous 3/3 scores cannot be farmed.
- Tests assert Guardian phase rules, World 1 scoring and unchanged star-based anti-duplication. This is a code update; actual simulator screenshot and real iPhone gameplay acceptance pending. No TestFlight upload.

## October 18 — World 1 reactor pressure and live Guardian QA
- Room 12 defense uses 1.75-second reinforcement cadence (rather than 2 seconds) and a durable armored melee every eighth attacker. World 2 and 3 defense values unchanged. Must test with starter gear before declaring balance.
- Real Room 20 simulator QA now captures armored Guardian and glowing exposed-core states separately. Each scene asserts its own gameplay state and has a distinct screenshot identity marker; screenshot workflow validates both frames differ. Final screenshot inspection remains necessary.
- No TestFlight upload; check latest branch CI before judging this update.

## October 18 — Future equipment progression rules (approved direction; not World 1 scope)
- User wants a **long-lived legendary equipment grind**: Legendary Level 50 must represent substantial gameplay over many complete runs and later-world content, not something attainable by replaying Frontier Forest a few times. A fully upgraded Legendary should be an uncommon long-term achievement, with individually upgraded named weapons retained permanently when swapped out.
- **All rarities share Level 50 cap.** Rarity determines the number, character and milestones of weapon-specific ability unlocks (proposal: Basic 1, Rare 2, Epic 3, Legendary 4); rarity and progress should change playstyle, not just inflate base damage. These ability counts/milestone levels remain provisional pending balance.
- Keep existing Gear Bay Level 5 purchased **shared technology** as a separate always-on global bonus, and preserve old progress. Future individual weapon ranks are per item, never reset or transferred on weapon swap; a new weapon starts its own track, with a usable base state and fair early ranks.
- **Pacing requirement:** quick first few weapon levels, steadily slower afterward, and expensive/meaningful final Legendary ranks 40–50. Tentative *design benchmark only* for one Legendary to Lv 50: many dozens of hours across varied worlds (e.g. 40–60+ active-play hours), to be adjusted with actual time-to-level telemetry and reasonable player expectations. Never commit the entire curve to fixed Salvage costs without testing earning rates and replay behavior.
- Progress should reward actually *equipping/using* the weapon and clearing appropriately challenging content, not cheap repetitive farming of early rooms or collecting passive currency. Avoid arbitrary hard gates to a specific world if progression across content supplies good difficulty scaling; consider diminishing low-world XP, per-weapon mastery XP, and progressively rarer material sources. No destructive resets; weapon level 50 is a long-term aspiration.
- **World 1 scope remains locked:** document the future economy and schema, but do NOT implement new equipment types / rarity rolls / late-tier levels until World 1 vertical slice and next TestFlight playtest are accepted.

## October 18 — Rarity-scaled per-weapon upgrade resources (user clarification)
- **User requirement:** Level 10 of a Legendary weapon must require **substantially more resources** (RSS) than Level 10 of a Basic weapon. Equal maximum level of 50 does **not** mean equal cumulative resource/time cost. This is fundamental to the equipment economy, alongside rarity-specific ability unlock milestones.
- Each item has its own permanent level and expenditure ledger. All rarities level 1–50 with the same displayed maximum, but each rarity has its **own increasing per-level cost curve**, Legendary >> Epic > Rare > Basic at the same level. Costs apply to upgrading that specific weapon; switching gear preserves levels and does not transfer invested resources.
- **Initial relative-cost benchmark only, pending economic simulations:** for cumulative level 1→10 cost, Basic=1×, Rare≈1.6×, Epic≈2.5×, Legendary≈4–5×; higher ranks become progressively more expensive, especially Legendary 40–50. Example: if Basic costs 1,000 Salvage total to level 10, Legendary should take around 4,000–5,000 Salvage-equivalent, not the same 1,000. These are examples, **not yet production prices**.
- Later Legendary ranks should additionally draw on appropriate later-world materials / weapon mastery from using the item; avoid pure currency farming of easy World 1 rooms. Keep lower-rarity gear practical and useful, Legendary Level 1 immediately usable, and each rarity's distinctive abilities actually valuable. Do not rely on equal cost + an arbitrarily slower XP bar as a substitute for actual rarer/more costly resource investment.
- Preserve previously purchased Gear Bay Level 5 **shared weapon technology**, distinct from individual item upgrading; no resets. Keep the World 1 quality-gate scope lock: record design only, implement future equipment economy after World 1 is accepted.

## October 18 — Home navigation redesign benchmark
- User provided a benchmark screenshot of a mobile game's campaign home showing central world diorama + prominent Start, resource header, persistent bottom navigation, and quick upgrade destinations. Reconfigure *functional* Outpost Zero home accordingly, not identical art, notifications or fake social/store sections.
- World 1-focused new home layout: compact OUTPOST ZERO + real Salvage/Cores bar, current-world progress, stylized world preview using actual forest/pilot assets and upright blue circular ring, single START CAMPAIGN or saved RESUME, five bottom shortcuts: WORLDS, GEAR, HQ, ABILITIES, RESTORE. Existing world-map card retained as separate selectable swipe-enabled screen with BACK TO HOME; other destinations use existing functions and preserve saved run.
- Responsive sizing for compact iPhones; QA launch flags for true SpriteKit home and world selector screenshots, and assertions that live navigational hit targets exist. No spurious notification badges, no gameplay equipment changes, and no TestFlight upload. Review frames and ensure current-head CI succeeds before release.

## October 18 — Home screenshot inspection and polish
- Inspected real iPhone simulator frames captured in workflow 39145778590 (all three jobs green) rather than treating screenshot generation as visual sign-off. Home hub/navigation is readable and functional, but physical combat pilot leaked below the dock as a second character. The region caption "FRONTIER" intersected the decorative platform border; home portal energy was too flat.
- Fixed menu presentation: hide real in-arena pilot on Home and World Selector; explicitly show it when combat starts/recovery resumes; keep staged home pilot separate. Move region caption to open sky above the upright portal. Add animated translucent blue currents to the existing upright circular portal (no rectangular gate or floor circle).
- Hardened home simulator fixture: asserts physical pilot hidden, staged pilot present, energy currents present, five working dock routes and one primary Start. New CI and screenshots required. The current pass is visual/navigational only, no TestFlight upload.

## October 18 — World 1 Guardian legibility / live-frame illustration pass
- Actual latest run 39148788312 **all three green**; inspected home and boss captures, confirmed home duplicate-pilot, label overlap and portal fixes. Earlier Guardian QA froze enemy during 0.28-alpha spawning, which misleadingly made boss translucent; fixed fixture to show a materialized fully opaque boss without spawn-warning circle.
- Replaced World 1 Guardian's generic color-circle/rectangles with a single intentionally composed fully opaque layered forest automaton silhouette built from angular mossy stone, bark roots, glowing green eyes, foliage, separate armor shoulders and a prominent reactor, while keeping existing SpriteKit node hierarchy, gameplay collision radius and phase timing. Increased only the Guardian HP bar's art offset; other-world bosses untouched.
- Existing phase-2 still breaks named left/right armor and turns nested reactor orange, with telegraphed attacks. Inspect both actual simulator frames before claiming visual acceptance; gameplay screenshots do not substitute for user TestFlight judgment.
- No TestFlight upload. Continue World 1 only.

## October 18 — Guardian Clearing arena and boss readability
- Workflow 39163122128 **all three jobs passed**. Inspected actual screenshot archive: Frontier Guardian is now an opaque, recognizable forest automaton, and both armor/core phases render distinctly; home fixes look clean.
- Actual Room 20 screenshot exposed remaining issue: boss looked small relative to sparse brown scene with repetitive red posts (also noted in user's World 1 playtest). Focused follow-up: enlarge only World 1 Guardian artwork 14% via separate visual-only art node; preserve collision and behavior. Move phase armor lookup to named descendant nodes.
- Room 16–20 World 1 Guardian Clearing props changed from red posts to illustrated forest pines/broadleaf trees on arena perimeter with stone/soft mint highlights and subtle foliage scatter. No collision/hazard changes; other-world marker visuals unchanged.
- World 1 Guardian gains a clearer wide boss health meter and named identifier above its art, leaving other bosses' meters unchanged. Screenshot fixtures assert stage art and boss identifier. Latest build/simulator screenshots must pass before any readiness claims.
- Do not upload TestFlight on this pass; next hands-on real-device round after visual acceptance.

## October 19 — World 1 Guardian phase-two dodgeable attack review
- Last World 1 presentation commit `df56a817` had all three GitHub CI jobs green (workflow 39185104069). Reviewed actual simulator frames: Guardian silhouette, colored core, forest environment and new health bar read correctly; home navigation remains intact.
- This pass targets boss gameplay, not cosmetic expansion. At half health the Guardian transitions to its exposed core for **2.95 combat-clock seconds** instead of 1.45, so an over-geared pilot cannot erase it before the telegraphed phase-two volley resolves. This is **not** an arbitrary HP inflation and remains paused in menus.
- Its first exposed-core warning places two fixed orange countdown impact circles, at the pilot's locked position and 92px laterally (clamped to room bounds). Ordinary follow-up exposed-core attacks use the same flank placement. The player can evade both by moving once the signals appear. Enemy/boss timing in other worlds unchanged.
- Simulator fixture validates that both actual mortars warn at distinct locations. Pure Swift tests validate left/right offset within compact iPhone bounds and finite phase transition. Inspect new phase-two screen and re-evaluate actual boss difficulty in a later real-device TestFlight playtest; no upload in this mini-step.

## October 19 — World 1 Guardian fully resolved attack QA
- The previous World 1 commit `5eb22afd` / workflow 39202729760 passed all three CI jobs and actual simulator review: intact and exposed-core Guardian frames show legible 2-zone warned attacks, no home regression.
- Added a **third genuine SpriteKit Room 20 QA state** `-captureFrontierGuardianResolvedScreenshot`: after triggering armor break and confirming both live countdown circles, move the pilot into a safe lateral dodge lane, advance the existing paused combat clock past both impacts and the 2.95s protection, process actual lobs, confirm both are gone and pilot HP unchanged, then apply damage below the half-health threshold and confirm Guardian remains vulnerable (no unintended immunity). This does not run in normal builds.
- CI now captures and image-validates separate intact / warnings active / warning impacts resolved screenshots, asserting each differs. Pure Swift pacing test confirms a safe lane even on the compact 320px room.
- Do not treat passing screenshots as a substitute for player-led TestFlight fun/difficulty acceptance. No TestFlight upload in mini-steps. Keep further content to World 1.

## October 19 — TestFlight build 319 successfully uploaded
- User explicitly authorized next internal TestFlight release. GitHub Actions **TestFlight Release** workflow run 39240125855 completed **success**, including the signing/export/identity and **Upload to App Store Connect** step; uploader log: `UPLOAD SUCCEEDED with no errors`.
- Signed IPA verified `com.paulus.laststandcommand` with `CFBundleVersion=319` and nine required production sprites. Code pinned to latest fully validated World 1 source `b11c3e8514e6315da1693ca286983f95a1695b29` (all three iOS CI jobs green at workflow 39204717870).
- Prior signed build **318** had been uploaded in run 39133359063, so **319** is the correct new build number. Allow Apple processing time before declaring the build visible to testers; upload succeeded, processing status not yet verified.
- GitHub Actions integration did not expose manual workflow dispatch; a narrow single-use push trigger in `.github/workflows/testflight.yml` launched the validated release, and **is restored to its manual-only original state after success**. No additional auto-release trigger should remain.

## October 19 — Ability and mastery rule foundation (no new TestFlight)
- Approved direction: stats (damage/fire-rate/HP/heal) do not consume tactical slots. Start each world without preselected abilities; discover random fixed-rarity traits during combat. Rarity weights must make Common more attainable than Rare/Epic/Legendary, and players may choose stats to wait for better abilities. Slots begin at 2; Mastery Level 20 permanently unlocks slot 3; ranks cap at 3; acquired skills cannot be swapped during a run.
- New rule layer includes `AbilityLoadout.acquire(... capacity:)`, weighted pick, 15 fixed-rarity roadmap entries, and separately persisted `PlayerMastery` with 8-ish full World 1 runs' worth of XP to reach rank 20. Only 4 actual effects are presently implemented; never draw nonexistent skills. `RunProgress.masteryCreditedRooms` is optional for backward-compatible saves.
- World 1 combat UI integration and timed warned flanking swarms follow as separate changes with CI validation. **Never upload to TestFlight until user explicitly approves next build** (current tested build 319).

## October 19 — Phase 2: playable direct entry and rarity-weighted in-run drafts
- Home/World Selector START now enters Room 1 directly with no preselected abilities. New game/next-world/retry starts reset tactical choices. Old three-skill TestFlight saves remain valid. Legacy loadout screen code still exists but is not on any normal gameplay route; QA's former pre-run screenshot now captures real in-game Level 2 random cards.
- Level-up: three unique, weighted random options; common Incendiary > rare Explosive/Orbit > epic Chain, plus stat/healing choices which never consume tactical slots. New abilities commit on selection to first two beginner slots; existing abilities may upgrade to rank 3, third new ability becomes eligible after persistent mastery level 20. The other 11 of planned 15 abilities are NOT randomly offered until their effects are implemented.
- Once-per-room-per-run mastery XP credits on genuine room completion and uses backward-compatible snapshot tracking. Existing persistent Gear Bay remains unchanged. Next focus World 1 warned high-speed flanking swarms with visual validation.
- Must pass full current-head iOS and simulator checks; no TestFlight upload until user approves.

## October 19 — Phase 3: World 1 warned flanking raiders
- Added actual World 1 tactical-room flank bursts starting at Room 5, excluding timed survival and defense rooms and all other worlds. Up to two raiders early, three later; at most two selected burst points per late room, drawn from normal remaining room enemy counts rather than extra hidden population.
- Orange side indicators and a FLANK ATTACK banner warn for 1.65 **real presentation seconds**, including at 2x gameplay speed; arena pause also freezes their countdown. Raider positions are staggered left/right around the warned pilot location with >=95px spawn clearance; fast raiders move ~28% quicker after entry, encouraging player repositioning instead of stationary auto-fire. Existing contact damage and room clear counts unchanged.
- World 1 actual SpriteKit screenshots now include separate pre-arrival warning and post-arrival enemies with assertions, plus tests for encounter exclusions and safe compact-device spawn geometry. Current-head CI and screenshot review required before playtest readiness.
- User-facing Build 319 stays unchanged. No new TestFlight upload without user approval.

## October 19 — Phase 4: first new implemented tactical skill, Common Frost Rounds
- Following screenshot review of fully green combined branch `ada8423c`, the ordinary Home->Room1 and fresh level-up screenshots looked good, as did distinct warned/flank-raider arrivals. Old Level 2 QA fixture erroneously showed TACTICAL 3/2; it now starts with empty ability selection, matching the real gameplay.
- Implemented **Common Frost Rounds** as a fifth *real* ability, not a concept-only card. Its three ranks slow non-boss enemy movement to 78% / 69% / 58% briefly, with an independent visible icy ring and cyan hit effect. Does not stack extra damage or stun the Forest Guardian. Continues through the run once chosen, occupies one tactical slot, and rerolls at Common weight for rank upgrades.
- Frost rank is optional in schema-4 saved snapshots to preserve old TestFlight recovery, and status timers use the combat clock (pause-safe); expiry, room changes, defeat, and retry clear temporary effects. Added unit tests, a genuine live SpriteKit Frost screenshot fixture, and screenshot validation in CI.
- Still *no TestFlight upload*: user wants chat screenshot review before release. Next: inspect new frost imagery and test fairness of rarity/late-run option count, then select next skill to implement.

## October 19 — UI consistency and late-run stat choice polish
- Review found flank-warning arrow asymmetry: iOS rendered the old right-arrow glyph as a blue emoji while the left was orange. Both now use orange/yellow vector SKShapeNode arrows pointing inward with identical dimensions. This changes no collision, warning time, or enemy count.
- Random ability draw cards now display **rarity-colored rims** (Common silver / Rare blue / Epic purple / Legendary gold). The center icon keeps its effect color; stat cards keep their original functional category colors.
- Added a small capped **Mobility** stat option (+6 movement units per rank, max 5) and an always-available **Supply Cache** stat option (+40 in-run coins for healing/checkpoint costs). Together with damage and armor, these ensure at least three meaningful stat choices at late run levels even after two tactical abilities and regular fire-rate upgrades hit caps. No new tactical ability slots, no large DPS power increase.
- Mobility rank is optional in schema-4 run recovery (pre-existing saves load as 0), persists between rooms, and resets between runs; rank bounds tested. Unmodified existing TestFlight upload **319**. Review iOS CI/screenshots again before further work.
- Balance note: supply pick spends a full level-up choice for limited in-run cash, preserving the tradeoff between combat power and recovery. Frost remains a common control ability, not more damage.

## Next development sequence (no TestFlight upload per mini-step)
1. **Timed Encounter Completion** — wire true time-based extraction and different extraction structure into ordinary `OutpostScene` gameplay, with no live enemy requirement, no new spawns after timer, clean transit with remaining enemies, and correct rewards. Keep room combat intact. Avoid gate/phase paths that strand the player.
2. **Save/recovery** — verify resume during timed encounter, after timer but before extraction, and while level-up modal is present; no reward/XP duplication and no accidentally refilled active swarm.
3. **Screenshot review** — capture normal tactical room, timed survival early/mid/late, extraction-open with enemies remaining, transition back to room, one boss, and world-biome comparisons. Review scale, camera, pilot visibility, effects, terrain, UI. Distinguish CI capture from visual art sign-off.
4. **Equipment defense validation** — inspect live reactor gameplay, failure and successful normal-portal exit; tune density/HP from evidence.
5. **Combat feel and performance**, **multi-stage bosses**, **progression/specialization**, **art acceptance** as separately reviewed passes.
6. Only after all relevant iOS/logic/screenshots pass and user reviews current visuals, prepare next numbered TestFlight bundle.

## Chat rhythm
- On each "Continue": inspect branch HEAD, make *one coherent named-area improvement*, run relevant tests/CI, report what changed, pass/fail, remaining blocker, whether the user must act, and current TestFlight readiness grounded in evidence.
- Do not label mini-steps as numeric builds. Reserve iOS build numbers for TestFlight uploads.
- When context gets long, update this document; in a fresh project chat user can say: "Continue Outpost Zero from `docs/OUTPOST_ZERO_HANDOFF.md` on `outpost-zero`."

## October 19 — Approved survival-format direction
- User approved **both** formats: occasional timed encounters in regular 20-room campaign worlds, plus **optional dedicated endurance missions** unlocked through campaign progression. Dedicated missions must not replace campaign worlds or disrupt the 50+ level restoration progression.
- **Campaign target: 2–3 timed survival encounters per 20-room world**, 90–120 seconds each, spaced to avoid repetitive back-to-back endurance. Existing timed extraction contract remains: no new spawns after expiry, small central orb, immediate exit even with surviving enemies, and only earned kill XP/coins.
- **Dedicated endurance target: 4–5 minutes**, escalating waves, meaningful in-mission upgrades, and a distinct optional entry point and rewards. Design/implement as a separate reviewed feature; do not silently convert campaign rooms or upload to TestFlight.
- **Immediate next work:** inspect the real `SurvivalEncounterRules.kind(world:room:)` scheduling, especially World 2 (Flooded Outpost), audit all 20 rooms in every playable world, implement a maximum 3 well-spaced campaign survival encounters, and add deterministic per-world schedule tests. Then design the optional endurance mode separately, with screenshots and validation. Continue playable tactical abilities as an independent development sequence.
- This section records the approved design only; **the encounter schedule and dedicated mode are not yet implemented or validated by this note**.

## October 20 — Campaign survival pacing correction and CI checkpoint
- Confirmed actual prior schedule: World 1 four survival rooms [6,10,14,17], World 2 five [5,8,11,15,18], World 3 four [6,9,13,17]. Player correctly noticed World 2's repetition.
- Implemented **three campaign survival rooms each**: World 1 [6,9,17], World 2 [5,11,17], World 3 [6,12,18]. Existing equipment defense remains World 1 room 12 and World 3 room 15; final boss remains room 20. At least two regular rooms separate any timed encounters.
- Updated deterministic `tests/CampaignPacingTests.swift` to assert counts, spacing, timer/extraction behavior. Branch HEAD for gameplay correction `c93d385c58d6286397edd82002dbf905a8319054`.
- GitHub Actions run 39367625913: iOS build, project checks, combat/world/pacing unit tests, and equipment-defense screenshot capture/validation **passed**; general simulator screenshot review **in progress** at last check. Do not mark whole workflow green until it completes. Link: https://github.com/JPaulus04/invasion-front-app/actions/runs/39367625913
- Next: finish current-head screenshot validation, inspect actual gameplay images for visual approval, confirm release build in App Store Connect, and request user approval before any TestFlight upload. Dedicated 4–5 minute optional endurance mode remains separately planned, not a blocker for the next TestFlight review.

## October 20 — Build 320 video review / Build 321 approved scope
User reviewed two actual Build 320 gameplay recordings. Approved Build 321 corrections: (1) replace ineffective square orbital blades with luminous circular Energy Orbit orbs, wider orbit, continuously following pilot even after exit portal opens; later elemental fire/lightning variations; (2) improve projectile hit and enemy impact feedback; (3) HUD large current FLOOR number **only** (no /20), health bar immediately above pilot and visible before/after clear, large survival countdown switching to EXTRACTION READY at zero; (4) show two circular tactical ability slots on left of upgrade selection, filled with selected ability icons, stat upgrades do not fill, third slot at mastery unlock; (5) validate survival pacing and extraction, inspect simulator gameplay screenshots. Later: environment density/biome detail, character/enemy readability, UI simplification and ability variants. No TestFlight upload without approval.
First implementation commit `88e8c8e9703e0e77bd7a4e256e06238a0b4ef6b4` changes orbital geometry from 10x23 rectangles to 10-radius circles, glow 2→7, orbit radius 46→82, updates while roomCleared; **not yet validated**. Check whether orbit update is called after clear and whether arena paused; visual QA required. Remaining Build 321 items above still pending implementation; do not report complete.

### Build 321 implementation checkpoint (October 20)
- `b07079cd`: fixes peaceful portal gate orbit animation by updating orbs before early return and using live scene clock during gate phase.
- `ca1f77ad`: adds large standalone floor number, player-attached HP bar, prominent survival MM:SS timer and EXTRACTION READY label; renames upgrade card Energy Orbit.
- `f18dea8f`: draws 2 (or mastery-unlocked 3) circular tactical-slot indicators on level-up overlay, showing selected ability icons; stats don't consume slots.
- `8969858c`: projectile impact tint distinguishes normal/chain/incendiary/explosive.
All changes require fresh CI build and actual simulator screenshot review on latest SHA. Inspect header spacing, slot circles/card overlap, HP bar positioning/scale, survival timer overlapping controls, orbit animation in peaceful gate. No TestFlight upload until user approves. Note earlier CI on previous commits was cancelled by newer commits.


## October 20 — Build 321 eight-direction pilot integration
- Added eight generated transparent 256px pilot views (`pilot_e/ne/n/nw/w/sw/s/se.png`) with consistent blue armor/orange visor and registered feet. Runtime textures are cached; no per-frame image loading. Built-in image generation prompt: same armored pilot, fixed elevated orthographic camera, eight compass headings, consistent scale/light, transparent background, no labels/floor.
- Actual displacement selects travel heading; existing stationary target heading selects firing view. Removed horizontal flipping and fake back-view tint; directional recoil and existing bounded stride/breath motion affect artwork only. Joystick, collision, speed and combat rules unchanged. Six-degree sector hysteresis reduces boundary flicker.
- Added compass/wraparound/hysteresis tests and simulator-only `-capturePilotDirectionsScreenshot` showing all eight production views in-world. CI validates a blue identity marker and requires all eight PNGs in compiled bundle.
- Local source/PNG checks pass. **iOS CI and simulator artifacts not yet reviewed at this checkpoint.** No TestFlight upload. Existing motion is procedural bob/lean/recoil, not an authored multi-frame walk cycle; judge it in motion before claiming final animation acceptance.
- Next: inspect current-head CI, directional simulator frame plus live gameplay sequence, HUD, orbit, survival orb and upright campaign portal. Build 321 remains held for user approval.

## October 21 — Directional simulator review and presentation corrections
- Verified `eaaa0395a654ae7055e7916ae399284fd2d80779` against workflow **39506569276**: build, defense visual review and full simulator review all **passed**. Downloaded artifact **12305780176** and inspected actual eight-direction, motion, gate, extraction, survival and level-up images. Front/side/back pilot silhouettes are distinct at gameplay scale; upright campaign portal and separate survival orb remain intact.
- Review found tactical circles overlapping the level-up footer, duplicate EXTRACTION READY text, and an excessive pilot/health-bar gap. This pass reserves separate slot/footer rows, preserves the single prominent extraction-ready announcement with foes/coins retained in the header, and lowers the health bar by 8 points. Simulator asserts slots cannot intersect the footer.
- Found a presentation-clock defect: the combat clock freezes at peaceful gates, freezing stride and potentially recoil while walking to the exit. Added a separate real-time pilot animation clock advanced only in gameplay/gate phases; combat, movement speed and collision rules remain unchanged.
- Gate screenshot fixture now equips two Energy Orbit orbs and verifies angular movement and 82-point following radius after clear; previous gate captures had no equipped orbs and could not demonstrate this visually.
- These corrections require fresh current-head iOS/simulator validation. No TestFlight upload. Animation remains eight directional views with procedural stride/breath/recoil; no authored limb walk cycle or continuous 3D turn is claimed.
