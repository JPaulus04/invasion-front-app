# World 4 v18 — engine review candidate, not approved

Unmodified v17 PNGs, renamed for globally unique texture basenames. Manifests mirror the required fields of WorldTwoCampaign.Manifest at main 5ba22b2d4b533eb96c9c128da677bcad52b57d6e. This is a schema comparison, not a Swift or simulator test. Do not merge or release.

- 11 character manifests; 661 PNGs; 15 attacks with variable frame durations, warning/active/recovery frames and explicit active time.
- Current World 2 decoder uses uniform fps; the additional timing field is not consumed by that decoder. Codex must implement or explicitly reconcile variable timing before enabling damage events.
- All texture basenames globally unique: avoids collisions when resolving basename without directory.
- Art pivot measured from median idle alpha bottom; vertical axis is image-space down. Confirm placement and actual contact point in engine, especially phase layers and Sentry.
- Extra projectiles and phase layers are not animation states; see asset map and phase/projectile handoff. Phase reference images must not be composited as effect layers.
- Visual review: some movement remains procedural and attacks subtle. This candidate is not approved for GitHub upload or release. No actual gameplay or performance evidence.
- PR #21 target: 30 rooms in all four playable worlds. World 3 asset package missing. No game source changes here.
