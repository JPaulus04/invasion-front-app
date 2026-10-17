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

## Next development sequence (no TestFlight upload per mini-step)
1. **Timed Encounter Completion** — wire true time-based extraction and different extraction structure into ordinary `OutpostScene` gameplay, with no live enemy requirement, no new spawns after timer, clean transit with remaining enemies, and correct rewards. Keep room combat intact. Avoid gate/phase paths that strand the player.
2. **Save/recovery** — verify resume during timed encounter, after timer but before extraction, and while level-up modal is present; no reward/XP duplication and no accidentally refilled active swarm.
3. **Screenshot review** — capture normal tactical room, timed survival early/mid/late, extraction-open with enemies remaining, transition back to room, one boss, and world-biome comparisons. Review scale, camera, pilot visibility, effects, terrain, UI. Distinguish CI capture from visual art sign-off.
4. **Equipment defense** — add actual distinct defense objective and verification (0–1/world), not a renamed survival timer.
5. **Combat feel and performance**, **multi-stage bosses**, **progression/specialization**, **art acceptance** as separately reviewed passes.
6. Only after all relevant iOS/logic/screenshots pass and user reviews current visuals, prepare next numbered TestFlight bundle.

## Chat rhythm
- On each "Continue": inspect branch HEAD, make *one coherent named-area improvement*, run relevant tests/CI, report what changed, pass/fail, remaining blocker, whether the user must act, and current TestFlight readiness grounded in evidence.
- Do not label mini-steps as numeric builds. Reserve iOS build numbers for TestFlight uploads.
- When context gets long, update this document; in a fresh project chat user can say: "Continue Outpost Zero from `docs/OUTPOST_ZERO_HANDOFF.md` on `outpost-zero`."
