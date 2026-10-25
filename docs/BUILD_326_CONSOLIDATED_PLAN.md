# Build 326 — Consolidated implementation and acceptance plan

Status: scoped, not implemented. Baseline: outpost-zero at 5457b6d. No release or CI run authorized until implementation is complete.

## User-approved workflow
- Make all related code/art changes before a full validation run; avoid repeated full-review commits.
- Run inexpensive static/local checks as needed. One final current-HEAD CI suite after changes, rerun only after a material fix.
- Do not equate green CI with visual approval. Review real simulator captures and user gameplay before TestFlight upload.

## Integrated work packages
1. **Home and navigation:** keep the bright Archero-inspired main hub, obvious Play entry, Gear and Abilities distinct, Restoration under Pilot; avoid gesture conflicts on buttons.
2. **World selection:** clear locked/unlocked states, progression arrows and swipes, distinct biome identities without revealing unreached artwork, readable entry requirements.
3. **Economy and upgrades:** preserve twelve-rank persistence and rarity milestones from 325. Audit coins and salvage earned per world against actual upgrade costs and starting resources. Coin costs should remain the primary pacing constraint; do not allow one early session to max a loadout. Do not change existing save schema without migration tests.
4. **Tactical ability evolution:** keep regular stat cards separate from tactical abilities. Gate evolved forms behind level/world milestones and prerequisites; e.g. Energy Orbit's late evolved form becomes a continuous ring, not independent orbiting balls. Preserve meaningful choice between earlier common upgrades and later rarities. No early release of high-power forms.
5. **Combat and art:** improve World 2 boss silhouette and telegraph readability, pilot depth/turning, World 1 floor detail, collisions with reactor and terrain, extraction visuals, and frame-time budgets. Do not alter gameplay hitboxes merely to match decoration without tests.
6. **Difficulty:** tune World 1 for unupgraded players; use escalating enemy mixes, timing and attacks across later worlds rather than HP inflation alone. Evaluate with clean-save and maxed-save profiles.

## Final validation gate
- Build iOS from final SHA; run Swift unit and progression tests.
- Verify save migrations, coin/salvage arithmetic, upgrade caps, milestone gates, and no duplicate rewards.
- Simulator captures: Home, Gear, Abilities, Pilot, locked/unlocked worlds, World 1/2 combat and bosses, level-up, survival/extraction, resume.
- Visually inspect captures for leg alignment, occlusion, collision, text clipping, contrast and animation coherence.
- Report exact SHA, CI URL and job outcomes. Hold TestFlight until explicitly approved.

## Release blockers
Any broken navigation, inaccessible unlock, corrupted save, duplicate currency, reactor pass-through, portal/extraction softlock, missing boss asset, or failed iOS CI blocks release.
