# Build 339 animation integration

**Current replacement status:** 44 updated PNGs imported unchanged from the two subsequent main uploads. Rotbomber's 16 corrected hit/defeat frames pass and are restored with reaction-specific registration; Sporecaster's 28 updated attack/hit/defeat frames remain quarantined because clipping/FX defects persist. See [current replacement review](replacements/REPORT.md). The original integration/capture evidence below records the earlier 44-frame quarantine and is historical.

Base: main `4c636d8c94b5b5d0adcb59a8cbac01616e800e07`.
Branch: `feature/build339-animation-integration`. No merge or TestFlight upload authorized.

## Inventory and gameplay identities

All 400 uploaded animation PNGs remain byte-identical. Six older `enemy_*.png` portraits in the same directory are separate fallback resources. `asset-inventory.json` pins every animation filename, dimensions, alpha range, source SHA-256 and quarantine decision. Bundle validation requires all 400 originals, including quarantined frames. The two original asset directories are folder resources, not duplicate image sets.

| Character | Gameplay identity | Dimensions | Authored sequences |
| --- | --- | --- | --- |
| Vanguard | Commander 0 | 256 square | idle 8, run 8, attack 8, hit 4, defeat 8, victory 8 |
| Specter | Commander 1 | 512 square | idle 8, run 8, attack 12, hit 8, defeat 8 |
| Bulwark | Commander 2 | 256 square | idle 8, run 8, attack 8, hit 4, defeat 8, victory 8 |
| Volt | Commander 3 | 256 square | idle 8, run 8, attack 8, hit 4, defeat 8, victory 8 |
| Barkguard | World 1 type 1, armored melee | 512 square | idle 8, run 8, attack_combo 10, attack_slam 10, hit 6, defeat 6 |
| Thornrunner | World 1 type 2, fast melee | 512 square | idle 8, run 8, attack_slash 12, hit 8, defeat 8 |
| Stoneback | World 1 type 3, heavy melee | 512 square | idle 8, run 8, attack 12, hit 8, defeat 8 |
| Sporecaster | World 1 type 4, ranged | 512 square | idle 8, run 8, attack 12, hit 8, defeat 8 |
| Rotbomber | World 1 type 5, lobber | 512 square | idle 8, run 8, attack_lob 12, hit 8, defeat 8 |

World 1 type 0 remains Mossbot: original 40 imageset frames, move mask, scale, timing and priority policy. Other worlds and bosses retain existing artwork. The 24 bonus victory exports are bundled/catalogued; this change does not add victory UI or change progression.

## Artwork requiring replacement

Manual contact-sheet inspection reviewed all 44 Specter frames on contrasting backgrounds ([Specter sheet](artwork-audit/specter.jpg)). No remaining rectangular background contamination was found. Its fading defeat alpha is intentional and valid.

These source defects are preserved and quarantined rather than edited ([Rotbomber sheet](artwork-audit/rotbomber.jpg), [Sporecaster sheet](artwork-audit/sporecaster.jpg)). These sheets are source-art previews, not simulator screenshots:

* `rotbomber_hit_00.png` through `_07.png`, `rotbomber_defeat_00.png` through `_07.png`: visible translucent gray rectangular background residue (16 frames).
* `sporecaster_attack_00.png` through `_11.png`, `sporecaster_hit_00.png` through `_07.png`, `sporecaster_defeat_00.png` through `_07.png`: foreign sprite fragments, detached marks and clipped effect rectangles (28 frames).

Those 44 files remain in the application bundle for traceability but are never displayed. The controller uses that character's clean idle artwork with existing combat cues, a hit flash or a defeat fade. This is a safe presentation fallback, not approval of the defective clips. Clean run/idle and Rotbomber's clean attack remain animated. Full authored reaction playback for these two characters requires replacement artwork.

## Implementation and scope

`WorldOneEnemyAnimation` remains the single SpriteKit action controller. `CharacterAnimationCatalog` defines actual state filenames/counts, Barkguard's alternating attacks, per-character scale/feet registration and quarantine. Rotbomber's smaller attack export has its own registration so its body does not shrink or float. Enemy health bars sit above the authored silhouettes. Commander equipment selects the matching profile and immediately refreshes its HUD portrait; player fire/hit/defeat and enemy melee/projectile/lob/hit/defeat use existing gameplay events. Death presentation does not postpone game-over or allow paused combat to continue.

Missing/invalid movement or idle resources keep the existing static portrait. Missing/invalid reaction clips use the same clean identity fallback. Source dimensions, transparent corners and nonempty alpha are checked at load time. New frames decode lazily at display resolution with a 48 MiB cache ownership budget; active SpriteKit actions and existing Mossbot textures retain their resources independently. This budget is not a total process-memory guarantee; device memory/performance still needs normal QA.

Combat damage, HP, movement speeds, difficulty, collision/navigation, room progression, landscape renderer, camera and `CharacterMotion`/`EnemyAnimationRules` are unchanged.

## Validation

Local: inventory/PNG/transparency/hash audit passed; all 76 Python tests passed; project checks and diff whitespace checks passed. Native Swift tests, compilation, compiled-bundle byte verification and actual simulator captures run in the dedicated Build 339 workflow.

Only commits marked `[animation-review]` (or a manual dispatch) start its focused simulator milestone. Ordinary development commits compile/test without starting a simulator. The milestone uses one disposable iPhone 16 Pro / iOS 18.5 and nine fixed SpriteKit animation views. These are actual application rendering fixtures, not proof of campaign completion; screenshots require human review. Captures cover four commanders and the enemy roster in all five required states. No broad campaign or simulator retry loop is introduced.

Initial validation passed at `da9b8c9350e9f92a236e52dfb05c9a902a613f7e`: [focused animation run](https://github.com/JPaulus04/invasion-front-app/actions/runs/44421256272) and [standard PR checks](https://github.com/JPaulus04/invasion-front-app/actions/runs/44422091066). All nine actual iPhone 16 Pro / iOS 18.5 captures were inspected. Character scale, ground registration, clean Specter transparency and same-character fallbacks were visible. This review exposed the stale HUD portrait on commander selection; the follow-up refreshes it, shows enemy bars in the fixture, and freezes after child actions have evaluated. The native full-loader audit runs once per binary rather than repeating it for every view. The completed follow-up is recorded below. Integration is not fully visually approved while the two replacement-art requests remain open. No visual-quality score is claimed.


## Reviewed final simulator evidence

Visual source: `41ec2b04479bc972a9faeac02b7693fc4decab33`.

| Validation | Actual result |
| --- | --- |
| [Initial focused run](https://github.com/JPaulus04/invasion-front-app/actions/runs/44421256272) | Passed; all nine screenshots inspected; exposed stale commander HUD portrait |
| [Initial standard PR checks](https://github.com/JPaulus04/invasion-front-app/actions/runs/44422091066) | Passed |
| [Revised focused run](https://github.com/JPaulus04/invasion-front-app/actions/runs/44424062746) | Passed: 76 Python tests, three native animation/motion executables, iOS Debug compilation, 400 original PNG hashes in actual bundle, nine fresh actual screenshots |
| [Revised standard PR checks](https://github.com/JPaulus04/invasion-front-app/actions/runs/44424073279) | Passed: room/collision, pursuit/navigation/portal framing, replay/driver, recoil, combat/XP, campaign pacing, world progression, compilation and existing authored-art bundle checks |

All nine revised 1206 x 2622 captures were inspected. One disposable iPhone 16 Pro / iOS 18.5 was used per milestone. Both runs completed successfully. The first cold boot spent several minutes in simulator data migration; its first read-only readiness probe timed out after 60 seconds, and the existing bounded 30-second poll succeeded on the same device. The revised run had no setup errors. No device restart or runner retry campaign was needed.

* [Four commander views](screenshots/commanders-overview.jpg) and [character detail](screenshots/commanders-detail.jpg).
* [Five enemy-state views](screenshots/enemies-overview.jpg) and [enemy details](screenshots/enemies-detail.jpg).
* [Initial versus revised commander HUD](screenshots/hud-comparison.jpg).
* [Capture identities, original PNG hashes and bundle provenance](simulator-evidence.json).
* [Original screenshot/log/bundle artifact](https://github.com/JPaulus04/invasion-front-app/actions/runs/44424062746/artifacts/14484132300), subject to GitHub's 14-day retention. Committed JPGs are labeled crops/contact sheets of those original captures.

Enemy rows run bottom to top: Mossbot/Barkguard, Thornrunner/Stoneback, Sporecaster/Rotbomber. Bars are deliberately visible in the fixture; normal gameplay visibility rules are unchanged. The revised captures show actual run, attack, hit and collapse poses, stable feet/body scale, clean Specter transparency, health bars clear of clean-frame silhouettes, and same-identity fallback artwork without the quarantined residue/fragments. The two quarantined defeat copies were sampled at alpha `0.13075673580169678` in native logs, confirming the clean fade fallback advances. Native full-loader assertions cover every clean required state and both Barkguard attacks.

These paused SpriteKit fixtures establish resource/rendering integration, not campaign completion or a device performance benchmark. The captured Bulwark/Volt HP values retain the prior launch's initial health because the fixture selects its character after scene initialization. The final fixture setup resets its own HP to the existing `maximumHealth`; that capture-only initialization correction follows the visual source above and has not been recaptured. It does not change shipping health calculations, the controller, artwork or gameplay. No third simulator milestone is needed for that diagnostic assignment. Normal device QA should still assess animation feel, real combat interactions and peak memory.

Modified production artwork: **none**. Integrated directories: `assets/commanders260/` and `assets/enemies/`. All 400 original payloads are unchanged; the JPGs in this document are review evidence only.

Recommendation: ready for code review with explicit safe fallbacks. Full authored animation/art approval remains blocked by the 44 Rotbomber/Sporecaster replacement frames listed above. No visual-quality score, merge or TestFlight approval is claimed.
