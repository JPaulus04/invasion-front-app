# v19 native compatibility addendum — NOT APPROVED FOR RELEASE

All 11 manifests decode with the existing WorldTwoCampaign.Manifest field definitions under Swift Foundation. All 636 unique sequence references resolve, and 15 attack timing records agree with their authored frame-duration sums. All 661 PNGs match v18 bytes and decode correctly. No artwork was changed. This is not an iOS simulator or Xcode test.

**Required Codex action:** implement per-frame durations for character and FX sequences, or explicitly adopt uniform timing and recompute every gameplay event and warning from the chosen schedule. Do not combine authored millisecond damage events with uniform playback: measured drift ranges from -26 to +40 ms. Use a single authoritative clock and fire damage/projectile once on crossing the active event, including when a render frame is skipped. Test at multiple update step sizes. Preserve the existing World 2 animation behavior. Phase and projectile cues remain proposals until tested. Keep the build in draft until visual approval, World 3 assets, 30-room progression in all four worlds and performance checks are complete.

To reproduce: `swift qa/verify_manifest.swift assets/enemies/world4` from package root. The checker mirrors the existing decoder and does not run the game.
