# Build 338 — issue #12 fixes and validation evidence

**Release hold: complete gameplay validation remains incomplete.** The final build and manually reviewed camera traversal passed. Three jobs were cancelled before receiving runners; remaining gameplay/defense checks continue. See [the live final run](https://github.com/JPaulus04/invasion-front-app/actions/runs/43913375739) for subsequent status.

[PR #13](https://github.com/JPaulus04/invasion-front-app/pull/13) · branch `fix/build338-release-blockers` · release baseline `5453d2e3119576eb5ee18d2f07d6b3b75725f81f`.

## Room 2 deadlock: reproduced and corrected

The original [failed run 43868500372](https://github.com/JPaulus04/invasion-front-app/actions/runs/43868500372) was inspected through logs and actual artifacts. Both stationary seed-335 recordings share their first 314 replay events. After ten kills, one type-2 raider remains alive at y=468.644440, oscillating near x=56–58, while the pilot stays at (195,−5.5), 58 HP. The tactical completion gate correctly waits for that enemy. [Baseline findings](baseline-findings.json) pin the original jobs/artifacts and raw screenshot hashes; [late screenshots](baseline-stationary-stall.jpg) show the same stall in both batches.

Pursuers now use the existing clear central lane around compound passage shoulders, checking all three route legs against actual collision shapes. Steering clearance prevents lateral flanking from turning back into a barely cleared corner. The final contact segment retains physical clearance so players beside a wall remain reachable. No collision rectangle, geometry, enemy count, damage, health, spawn cadence, encounter timer or outcome rule changes.

The first native regression caught a second corner trap before any simulator started; the final regression retains that case coverage. Native tests exercise the exact stalled checkpoint plus 288 real steering/collision pursuits across six tactical proportions, both pockets/banks and all four melee radii. Portal framing is tested in one-point traversal increments on compact iPhone, standard iPhone and iPad dimensions.

## Verified first runtime milestone

[Run 43906741184](https://github.com/JPaulus04/invasion-front-app/actions/runs/43906741184), application implementation `054c3d756b10d64edcef4a9f0bc4e41c916c284e`, produced these actual outcomes:

| Trial | Actual result | Trace |
| --- | --- | --- |
| Stationary 335, batch 2 | Real defeat in Room 5, 87s combat time, zero combat movement, 29 kills | 57 events |
| Stationary 335, batch 4 | Identical Room 5 defeat | 57 events, byte-identical pair |
| Moving 335, batch 2 | All 20 rooms complete, 698s, zero damage, 846 kills, 13 upgrades | 10,159 events |
| Moving 335, batch 4 | Identical World 1 completion | 10,159 events, byte-identical pair |

Both moving runs entered and cleared rooms 1–20 in order, defeated the boss and preserved reactor integrity. All original acceptance checks passed for those four cases. The seed-336 cases never received runners before this milestone was superseded; no result is claimed for them.

[Actual before/after progression](stationary-progression-comparison.jpg) shows the original Room 2 stall, the fresh Room 2 clear and the real Room 5 defeat. [Reviewed hashes and exact trace](stationary2-reviewed.json) pin the source. Room 2 clears at tick 2550, combat time 34.316667s, with the same 58 HP and no living foes. This is real campaign progression, not a staged victory fixture.

Stationary batch 2 needed its single fenced prelaunch recovery after a 120-second client timeout with no app start. Moving batch 2 completed on its first device. Startup therefore remains flaky; the new prelaunch surface probe is not represented as a complete infrastructure cure. Started gameplay was not retried.

## Camera: actual review rejected an automated green result

The old portal clamp introduced an observed ~337-point camera step when the portal first fit. Framing now approaches the portal ceiling continuously while retaining the player/health-bar floor. The approved far-wall portal position, scale and pixels are unchanged.

The first corrected milestone’s focused presentation job was green, but actual video inspection rejected its evidence. [Artifact 14248870379](https://github.com/JPaulus04/invasion-front-app/actions/runs/43906741184/artifacts/14248870379) contains a 14.953333s/385-frame recording dominated by launch screens, with only about 2.5s of the game at the start of traversal. [Actual extracted frames](rejected-camera-extract.jpg) show the short coverage. The fixed 12-second sleep stopped recording before movement finished; later motion logs accumulated while decoding ran.

The final revision rejects that exact real recording locally. Capture waits for recorder readiness, preserves recorder output, observes the actual traversal endpoint and retains the final view. A four-second QA-only entry hold allows an initial rendered view. The video must decode at least eight seconds of changing frames bearing the existing focused-scene identity, and native rendered entry/middle/approach markers must appear in order. Operating-system screen changes do not count. These markers and the hold are simulator-review controls, not gameplay changes.

The final focused presentation job **passed**, and its actual video was manually reviewed through the triptych and one-second frame sequence. [Original artifact 14254165304](https://github.com/JPaulus04/invasion-front-app/actions/runs/43913375739/artifacts/14254165304) contains 20.413333s / 1,199 decoded frames. There are 31 frames sampled at 2 Hz bearing the native traversal markers from 5.0s through 20.0s: entry, middle and approach in order. The pilot moves from y=−131.5 to y=811.5 while the fixed HUD, portal headroom and player remain readable. [Actual reviewed progression](camera-traversal-review.jpg) and [video hash/probe/endpoint/selection metadata](camera-reviewed.json) pin this evidence. Initial prelaunch/white-screen frames are not counted as traversal approval.

## Startup and broad review

The original moving-335-2 failure exhausted two prelaunch devices: stable installed-app registration, no app output, proven process/service absence and no crash reports. The second SpringBoard service showed a previous −9 exit. The original cancelled simulator-review job had no runner or steps; its cancellation trigger could not be established from the API.

The first corrective broad-review job did run. It failed to render the fourth-world transition after the legacy three-attempt loop and two service resets. Old app stdout/stderr were not retained, so its cause cannot be certified as infrastructure. The final workflow retains per-attempt app streams, fails immediately on app assertions, caps service recovery at one and does not relaunch an ambiguous live-motion launch. Campaign startup still permits only one fenced recovery before gameplay; timeout/incomplete outcomes remain failures.

Seven first-milestone World 1 landscape captures and the focused HUD, upgrades, victory and reactor states were inspected. Approved environments remain intact. Existing walk-preview poses can overlay the reactor silhouette; these screenshots do not certify every gameplay pose as overlap-free. Physical-device performance and compact-device visual review remain outstanding.

## Final candidate checks and provenance

Final candidate: `018501c69e77e6b1a03a69485d85ea8afb01acc4`. PR merge candidate: `b32b4606690a932d27565f1211e18cf9805799a1`. Both have tree `ae9e06e39ef719e064d8788f53eadc551b35a786`, verified through GitHub’s commit API. The [final build](https://github.com/JPaulus04/invasion-front-app/actions/runs/43913375739/job/133461127720) checked out that merge candidate and passed 68 Python tests, native pursuit/camera/replay/gameplay suites, iOS compilation and bundled/source artwork checks.

Final runtime status: focused presentation **passed and visually reviewed**; moving seed 335 batch 4 **passed** all 20 rooms. Broad simulator review and both stationary jobs were cancelled with empty runner names and zero steps while other jobs in the same workflow continued. No simulator/gameplay ran in those jobs. One targeted queue-recovery attempt is planned after the first attempt ends; successful gameplay will not be replayed. Remaining moving/defense jobs are still running or queued. No full same-SHA pass is claimed. The earlier seed-335 results do not replace those final gates. Documentation is published separately to keep the validated application candidate immutable.

Implementation commits:

- `4dda857e49b5b7e707a47a164af327541c161da5` — compound pursuit, continuous portal framing, real recorder lifecycle, startup probes and regressions.
- `c9afe9cafa5b6464abf162489dbc00ae61f3435a` — lateral steering clearance.
- `054c3d756b10d64edcef4a9f0bc4e41c916c284e` — close-contact access beside walls; verified seed-335 runtime milestone.
- `018501c69e77e6b1a03a69485d85ea8afb01acc4` — complete rendered traversal coverage, native review markers and bounded broad-review recovery.

No asset files changed. Approved paving/overgrowth, portal artwork, Mossbot, landscape renderer, environment plans and authored geometry match the release baseline byte-for-byte. Acceptance analyzers, the six-case matrix and TestFlight gate remain intact.

**Recommendation: hold merge/release approval and TestFlight.** Final complete same-source gameplay/broad-review validation remains required. Manual camera traversal review passed. No merge or upload was performed; no numerical visual-quality certification is claimed.
