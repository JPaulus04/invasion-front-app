# Build 191 Game Center Setup

Build 191 contains the native GameKit bridge, offline-safe report queue, Command Base rankings button, and competitive reporting rules. Complete these one-time Apple-side steps before uploading the build.

## Apple Developer

1. Enable the **Game Center** capability for App ID `com.paulus.laststandcommand`.
2. Regenerate the App Store distribution provisioning profile after enabling the capability.
3. Replace the GitHub secret `PROVISIONING_PROFILE_BASE64` with the regenerated profile.

The Build 191 workflow writes the Game Center entitlement into the generated Capacitor iOS project automatically.

## App Store Connect leaderboards

Create three Classic leaderboards using these exact IDs:

- `com.paulus.laststandcommand.leaderboard.campaign` — Highest Campaign Phase
- `com.paulus.laststandcommand.leaderboard.containment` — Highest Containment Level
- `com.paulus.laststandcommand.leaderboard.junkyard` — Highest Junkyard Recovery Level

Use descending/high-to-low score order. Score values are whole-number phase or level records.

## App Store Connect achievements

Create achievements using these exact IDs:

- `com.paulus.laststandcommand.achievement.first_deployment` — First Deployment
- `com.paulus.laststandcommand.achievement.sector_secured` — Sector Secured
- `com.paulus.laststandcommand.achievement.siege_breaker` — Siege Breaker Destroyed
- `com.paulus.laststandcommand.achievement.juggernaut_breached` — Juggernaut Armor Breached
- `com.paulus.laststandcommand.achievement.outbreak_prime` — Outbreak Prime Contained
- `com.paulus.laststandcommand.achievement.hq_survivor` — Headquarters Survivor
- `com.paulus.laststandcommand.achievement.containment_specialist` — Containment Specialist
- `com.paulus.laststandcommand.achievement.convoy_crusher` — Convoy Crusher
- `com.paulus.laststandcommand.achievement.phase_25` — Campaign Phase 25
- `com.paulus.laststandcommand.achievement.phase_50` — Campaign Phase 50

All are one-time, 100-percent completion achievements. Suggested points: 5, 10, 10, 10, 10, 15, 15, 15, 20, and 25 respectively.

## Competitive eligibility rules

- New campaign first clears submit the highest campaign phase and eligible achievements.
- Training replays never submit scores or achievements.
- Special Operations submit only after a legitimate manual rewarded clear.
- Unrewarded practice clears and auto-clears never submit.
- Reports are queued on-device when the player is offline or not authenticated and retried after Game Center authentication.

## Test checklist

1. Use a sandbox Game Center account on a physical iPhone.
2. Launch Build 191 and complete the Game Center sign-in sheet.
3. Confirm the Command Base **RANKINGS** control reads **CONNECTED** and opens the dashboard.
4. Complete a new campaign phase, then verify its leaderboard score.
5. Replay that phase and verify the score and achievements do not change.
6. Complete the active daily Special Operation for its first rewarded clear and verify the corresponding level leaderboard.
7. Repeat the operation after the reward is claimed and verify no new competitive report occurs.
