#!/usr/bin/env python3
"""Fast, dependency-free repository sanity checks before Xcode compilation."""
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
sources = sorted((root / "OutpostZero").glob("*.swift"))
required = {"OutpostZeroApp.swift", "GameView.swift", "OutpostScene.swift", "BattlefieldArt.swift", "RoomRules.swift", "RunProgress.swift", "CombatRules.swift"}
errors = []
if not required.issubset({p.name for p in sources}):
    errors.append("Missing required Swift source files")
for file in sources:
    text = file.read_text(encoding="utf-8")
    if not text.strip():
        errors.append(f"Empty source file: {file.name}")
    if any(line.startswith(("<<<<<<< ", ">>>>>>> ", "=======")) for line in text.splitlines()):
        errors.append(f"Merge conflict marker: {file.name}")
    if text.count("{") != text.count("}"):
        errors.append(f"Unbalanced braces: {file.name}")
scene = (root / "OutpostZero" / "OutpostScene.swift").read_text(encoding="utf-8")
for feature in ("spawnEnemy()", "shoot(at:", "completeWave()", "endGame()", "restart()", "actionButton(", "overlayButtons", "impact(at:", "healthBar.xScale", "damageFlash.run", "warning.text", "waveElapsed", "heldTouch = touch", "override func touchesMoved", "chainAttack(from: target", "chainLevel", "progress.earnXP", "showLevelUp()", "updateHostileAttacks", "repairCost", "BattlefieldArt.install"):
    if feature not in scene:
        errors.append(f"Missing gameplay feature: {feature}")
# Guard the XP-on-kill and mid-room level-up contract against regressions.
kill_section = scene.split("private func removeDefeatedEnemies()", 1)[-1].split("private func updateEnemyHealthBar", 1)[0]
choice_section = scene.split("private func chooseLevelUpgrade", 1)[-1].split("private func showCheckpoint", 1)[0]
if "progress.earnXP(xpAmount)" not in kill_section:
    errors.append("Kills must grant XP immediately")
if "presentPendingLevelUp(returningTo: .playing)" not in kill_section:
    errors.append("Mid-room kills must trigger pending level-up choices")
if "RoomRules.isCleared(spawned: spawned, target: waveTarget, living: enemies.count)" not in choice_section:
    errors.append("Level-up completion must recheck whether the room was cleared")
if 'levelChoices = Array(pool.shuffled().prefix(3))' not in scene:
    errors.append("Level-up must offer three rotating upgrade choices")
# Ranged attacks must communicate both the selected shot target and
# the mortar's time-to-impact without changing actual combat damage.
ranged_attack = scene.split("private func updateRangedAttack(at index: Int)", 1)[-1].split("private func fireProjectile", 1)[0]
lob_attack = scene.split("private func launchLob(from origin: CGPoint, target: CGPoint)", 1)[-1].split("private func updateHostileAttacks", 1)[0]
if 'aimReticle.name = "aimReticle"' not in ranged_attack:
    errors.append("Shooters need a visible, fixed target reticle before firing")
if 'childNode(withName: "aimReticle")?.removeFromParent()' not in ranged_attack:
    errors.append("Shooter reticle must be removed when its shot fires")
if 'countdown.name = "mortarCountdown"' not in lob_attack or "countdown.run(.scale(to: 0.18, duration: 1.4))" not in lob_attack:
    errors.append("Mortar attack must show a readable time-to-impact countdown")
# Room transitions must remain player-driven: no exit during combat,
# and a visible exit only after the room-clear condition is satisfied.
start_wave = scene.split("private func startWave()", 1)[-1].split("private lazy var forestPineTexture", 1)[0]
gate_section = scene.split("private func showZoneGate()", 1)[-1].split("private func ", 1)[0]
if "passageGate.isHidden = true" not in start_wave:
    errors.append("Exit gate must stay hidden during active combat")
if "RoomRules.isCleared(spawned: spawned, target: waveTarget, living: enemies.count)" not in gate_section:
    errors.append("Exit gate must require a cleared room")
if "passageGate.isHidden = false" not in gate_section or "phase = .gate" not in gate_section:
    errors.append("Cleared rooms must expose a walk-through exit gate")
for sprite in ("grunt_idle", "scout_idle", "raider_idle", "heavy_idle", "shooter_idle", "lobber_idle"):
    if sprite not in scene:
        errors.append(f"Missing illustrated enemy mapping: {sprite}")
# CI snapshots must stage all six distinct enemy silhouettes for review.
if "for (index, kind) in [1, 2, 3, 0, 4, 5].enumerated()" not in scene:
    errors.append("Combat screenshot must stage all six enemy classes")
if 'ProcessInfo.processInfo.arguments.contains("-captureGateScreenshot")' not in scene:
    errors.append("Missing gate-open screenshot mode")
# Finished enemy illustrations must not be covered by prototype geometry.
enemy_section = scene.split("private func spawnEnemy(artReviewType: Int? = nil)", 1)[-1].split("// Telegraphed materialization inside the room", 1)[0]
for guard in (
    "if type >= 4 && !usesIllustratedEnemy",
    "if type == 4 && !usesIllustratedEnemy",
    "if type == 5 && !usesIllustratedEnemy",
    "if type == 1 && !usesIllustratedEnemy",
    "if type == 2 && !usesIllustratedEnemy",
):
    if guard not in enemy_section:
        errors.append(f"Illustrated enemy has an unguarded prototype overlay: {guard}")
if (root / "project.yml").is_file() and "CODE_SIGNING_ALLOWED: NO" in (root / "project.yml").read_text(encoding="utf-8"):
    errors.append("Device signing must not be disabled in project.yml")
art = (root / "OutpostZero" / "BattlefieldArt.swift").read_text(encoding="utf-8")
if "room perimeter" not in art:
    errors.append("Missing room boundary artwork")
if "behind.addChild(" in art:
    errors.append("BattlefieldArt references an undefined behind node")
if "gameplay.addChild(" not in art:
    errors.append("BattlefieldArt must attach its nodes to gameplay")
if "upgradeConfirmed ? 35 : 140" in scene:
    errors.append("Legacy upgrade touch bands must not return")
if not (root / "project.yml").is_file():
    errors.append("Missing XcodeGen project.yml")
if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)
print(f"Sanity checks passed: {len(sources)} Swift files")
