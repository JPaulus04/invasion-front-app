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
