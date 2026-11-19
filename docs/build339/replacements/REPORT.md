# Build 339 replacement review

PR #15, branch `feature/build339-animation-integration`. Updated sources are imported unchanged from main uploads `a872ce430dfae7ad87f9026a4a0d0c634ee35799` (28 Sporecaster PNGs) and `d72ea4efa5c8816ca61d1312a540f6949c930ba7` (16 Rotbomber PNGs). No artwork is repainted, cropped or otherwise modified by this integration.

## Inspection results

All 44 filenames match the originally requested replacement ranges. All are 512 x 512 RGBA PNGs with nonempty alpha, fully transparent outer padding and unchanged frame counts. The other 356 animation PNGs are unchanged. All 400 current source files are pinned in the refreshed main inventory and must match their compiled-bundle bytes.

| Character / clip | Frames | Decision |
| --- | --- | --- |
| Rotbomber hit | 8 | Restore: gray rectangular backdrop removed; clean composited transparency and consistent body artwork |
| Rotbomber defeat | 8 | Restore: gray rectangular backdrop removed; coherent collapse/smoke poses |
| Sporecaster attack | 12 | Retain clip quarantine: hard cap clipping and rectangular FX remnants persist |
| Sporecaster hit | 8 | Retain clip quarantine: cap is visibly truncated at the interior y=130 cut, especially frame 02 |
| Sporecaster defeat | 8 | Retain clip quarantine: frames 03–05 still truncate the left silhouette at an interior vertical boundary |

[All 16 Rotbomber replacements](rotbomber-uploaded.jpg), [all 28 Sporecaster replacements](sporecaster-uploaded.jpg), and [full-size defect examples on contrasting backgrounds](sporecaster-remaining-defects.jpg) were reviewed. These are source-art composites, not simulator captures. Transparent RGB values are assessed through alpha compositing, so invisible RGB noise is not mistaken for rendered background contamination.

A transparent outer PNG border does not establish that the character inside that border is complete. The Sporecaster cuts occur inside the 512-pixel canvas, and the updated alpha mask cannot restore the lost subject pixels. Whole-clip quarantine avoids jumping between damaged poses; its clean idle/run and existing reaction fallbacks remain available. No partially approved Sporecaster sequence is enabled.

Rotbomber's repaired hit/defeat exports use a smaller body than its idle/run exports. The shared controller's profile now registers hit at 259 source-pixel body height/383 ground, and defeat at 258/383, preserving a 48-point initial visible body and the same world-space foot position. Existing attack registration remains 265/388. Body registration is fixed per sequence, not recomputed per frame. Mossbot, commanders, all combat values, movement, collision, camera and landscapes remain unchanged.

[Per-frame before/uploaded hashes and decisions](replacement-inventory.json) identify all 44 exact replacements. An independent correction-package ZIP or checksum manifest was not supplied or found in available repository/attachment sources. Its location was requested; a byte-for-byte package match is not claimed without that reference. The available uploaded bytes are fully traceable to the two owner commits above.

## CI failure diagnosis

[Main run 44432430253](https://github.com/JPaulus04/invasion-front-app/actions/runs/44432430253) and [main run 44445719608](https://github.com/JPaulus04/invasion-front-app/actions/runs/44445719608) both fail `test_complete_registered_enemy_sources` with `AssertionError: 230 != 6`.

The old audit glob treats all 224 uploaded enemy animation frames plus six browser portraits as 230 browser portraits. PR #15 already narrows this separate legacy inventory to `enemy_*.png`, preserving the original six-portrait assertion while the dedicated Build 339 audit independently checks all 400 animation frames. No test or gate is disabled. Both failures happen during Python tests before iOS compilation or real simulator startup. The cleanup/readiness warning lines in that step are emitted by mocked failure-handling tests, not crashes of the application. These runs establish a test-inventory classification failure; fresh application compilation/bundle/rendering are validated independently.

## Validation

Local: all 77 Python tests, actual 400-frame inventory audit, project sanity checks and whitespace checks pass. Native catalog tests now require clean Rotbomber hit/defeat clips and reaction geometry while retaining exactly 28 quarantined Sporecaster frames.

A focused milestone captures only Rotbomber and Sporecaster in five states (idle, movement, attack, hit, defeat) on one fresh simulator. Native resource assertions still inspect all clean required clips and both Barkguard attacks once. Sporecaster's quarantined states deliberately show clean fallbacks rather than damaged source frames. Compilation, all 400 bundled PNG hashes and actual screenshots are required evidence; results are pending this milestone.

Release remains on hold for the retained Sporecaster clipping/FX defects and the unavailable independent correction-package reference. No merge or TestFlight upload is authorized.
