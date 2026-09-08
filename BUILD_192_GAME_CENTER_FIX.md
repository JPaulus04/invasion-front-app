# Last Stand Command — Build 192

## Purpose

Build 192 corrects Game Center synchronization without changing campaign balance, rewards, or saved progression.

## Corrections

- Synchronizes the player’s existing highest legitimately cleared campaign phase after Game Center authentication.
- Backfills achievements that can be proven from saved campaign progress:
  - First Deployment — best phase 1+
  - Sector Secured — best phase 5+
  - Siege Breaker Destroyed — best phase 5+
  - Juggernaut Armor Breached — best phase 10+
  - Outbreak Prime Eliminated — best phase 15+
  - Campaign Phase 25 — best phase 25+
  - Campaign Phase 50 — best phase 50+
- Synchronizes saved manual-best Containment Sweep and Junkyard Recovery levels.
- Backfills the two Level 5 Special Ops achievements when supported by saved manual-best records.
- Fixes the offline reporting queue so multiple scores and achievements submitted together cannot overwrite one another.
- Keeps training replays, losses, auto-clears, and unrewarded repeat operations out of competitive reporting.

## Intentionally not backfilled

HQ Survivor is only reported after a new eligible campaign victory at 25% HQ integrity or lower. Historical HQ integrity is not stored, so awarding it from an old save would be inaccurate.

## App Store Connect action still required

The `*MISSING TITLE*` text is not controlled by the app build. Add at least one localization to each leaderboard in App Store Connect and provide its player-facing Display Name.

Recommended English display names:

1. Highest Campaign Phase
2. Highest Containment Level
3. Highest Junkyard Recovery Level

## TestFlight validation

1. Upload Build 192 using the existing GitHub Actions workflow and signing secrets.
2. Install Build 192 over the existing TestFlight installation. Do not delete the app; deletion may remove the local save used for veteran synchronization.
3. Launch the game while signed into Game Center.
4. Wait several seconds for the Rankings button to show `CONNECTED`.
5. Open Rankings and verify the highest campaign phase is ranked.
6. Open Achievements and verify all achievements supported by the saved record are unlocked.
7. Complete one new eligible campaign phase and confirm the campaign score advances.

