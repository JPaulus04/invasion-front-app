# Build 323 — consolidated implementation scope (work in progress)

## Release policy
- Implement all agreed features before initiating comprehensive GitHub Actions validation.
- Do not upload to TestFlight without explicit subsequent approval.
- This is a scope checkpoint, not a claim that the features below are implemented.

## Headquarters and navigation
- Visually distinct headquarters scene, not a World 1 battlefield with a menu on top.
- Clear home navigation to campaign, gear, abilities, restoration, and settings.
- Consistent back navigation; retain saved-run recovery where appropriate.
- Confirm safe transition into and out of active gameplay.

## End Run
- In-run settings provide an End Run action.
- Confirmation screen offers Cancel/Resume and Confirm End Run.
- Confirm only once; no accidental tap-through.
- Protect earned rewards against duplication or loss.
- Remove or finalize the active run recovery snapshot correctly.
- Return to the distinct headquarters, not to a live World 1 scene.
- Cover active combat and peaceful portal/gate phases.

## World 1
- Improve floor textures, biome variety, prop placement and depth/readability.
- Ensure terrain collision matches visible objects.
- Preserve an accessible upright circular campaign portal.
- Raise late-floor tension while accounting for a maximally upgraded test character.
- Add support waves during final boss encounter, without excessive unfair damage.
- Assess fresh-account difficulty separately from the maxed test profile.

## World 2 — scrapyard
- Distinct scrapyard terrain, silhouettes, props and hazard language.
- New enemy behavior patterns and differentiated boss.
- Difficulty increase from World 1 with reasonable early floors.
- Validate spawn locations, traversability, extraction/portal access and reward progression.

## Quality and completion gates
- Check animation and directional movement, collision, UI layering, pause/resume, reward persistence and progression.
- Review source changes and assets before any CI run.
- After full implementation, run one consolidated iOS compilation, gameplay test and simulator visual review cycle.
- Address validation failures before requesting TestFlight approval.

## Source recovery note
The previously reported local commit `deb8190` is not present in the connected GitHub repository. Reconcile against the remote `outpost-zero` branch and do not assert that local-only changes were recovered.
