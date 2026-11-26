# Toxic Crossing — ground material candidate, 2026-11-26

Status: **Local candidate only. Not uploaded, integrated, visually approved, or release ready.**

Four ground variants were extracted from a generated 1254×1254 RGB source sheet, normalized to opaque 1024×1024 RGBA, color-balanced and processed to share opposing edge pixels. The source quadrants are about 627 pixels before resampling; output resolution does not imply native 1024 detail.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| world2_ground_0.png | 988647 | 5d03043bd360012ef2039dbe5d94f636ba004ff76ffb29902b436f878adb2cff |
| world2_ground_1.png | 1070126 | 161e5913edaae33c67ee53398afabd064b5f1f0b2dc426c3ee5973511301afae |
| world2_ground_2.png | 904175 | 69347d5bb8e442adc791cd4bd928355c1b77e6ad8df4921cf09f6777d19a5483 |
| world2_ground_3.png | 991069 | caa335a1261074a2cb5acb7246e15171748070924180af0eae04d8500d2595b7 |

Technical checks: all PNGs decoded and verified, dimensions and RGBA mode passed, alpha entirely 255, all 16 ordered tile pairs checked in both horizontal and vertical directions (32 comparisons), maximum edge pixel delta zero. A 4×4 local composite was inspected: repeated diagonal material motifs remain apparent, so variation needs further improvement before visual approval. This is not a simulator capture.

Outstanding: six transparent props (tank, pipe, debris, boulder, vegetation, wall), acid hazard artwork matched to actual runtime polygons, integration, measured contact anchors, simulator validation and performance. Two attempted prop generations returned non-production dashboard mockups; both rejected. Do not rely on any progress claims in those images.

The connected GitHub interface does not accept local binary file references for upload. Actual PNG bytes have not been committed; this file records candidate provenance only. Keep the debug preview asset gate and live legacy renderer unchanged until the complete validated package is available.

## Revision 2 — recovered source and actual local candidates

Rebuilt four material files from the original 1254-square source. The first revision's excessively soft edge band produced a visible grid in a 4x4 composite. Revised blending narrows the band, incorporates source-derived high-frequency texture, and preserves identical opposite edge pixels. The revised composite is improved but still exhibits recognizable repeated motifs, so retain candidate status. Separately changed only ToxicEnvironmentPlan tile selection to coordinate hashing with checkerboard parity, maintaining distinct immediate neighbors while breaking the fixed four-column cycle. Native tests extended to require all four variants and nonperiodic four-column sampling; hosted verification pending. World 1 tiling unchanged. The local composite used a prototype coordinate selection, not the newly committed Swift hash; a new actual runtime review is required.

A dedicated isolated tank sprite was generated, cleaned of detached alpha noise, normalized to 512x512 RGBA and aligned to measured contact row 479 (anchor 32/512). Reviewed at 82, 106, 160 and 240 pixels; clear silhouette and material separation at small sizes. Still a candidate pending matched prop set and in-engine review. Another multi-prop generation produced a labeled presentation sheet, not runtime evidence or approved sprite files.

| Candidate | Bytes | SHA-256 |
| --- | ---: | --- |
| world2_ground_0.png | 1017682 | f49e2b60be02c9582afc000a5741a2c38bb8e6372dc1253d71c3aaa9843e8566 |
| world2_ground_1.png | 1114082 | 9b22e4e3f791bd349b6b1242266121f247ab0abc9539b90833060c500e1e3745 |
| world2_ground_2.png | 943416 | f2ae24ed1309a75e645e688a52946f437db877a2cdecac0521de063e52aa1831 |
| world2_ground_3.png | 1031545 | dc8ccf53d6dff4417bdb68717c5525f64ddbd7667ca977fadc09ee6f40115e89 |
| world2_prop_tank.png | 262783 | dcec353eae540ddd41670d67f41bb0704872b220e3b1367e197f0109269e8b91 |

All five PNGs decoded and verified. 32 ordered edge comparisons pass with zero pixel delta. The tank alpha bbox is (74,36,437,484). These hashes supersede the prior local ground candidates. No binary asset upload yet. Five remaining props and exact-polygon hazard artwork remain open; production landscape gate stays closed.

Previous commit cbc30ed passed hosted compile (45871337015), World 2 (45871336931), and campaign (45871336964). Those runs did not validate the replacement art.
