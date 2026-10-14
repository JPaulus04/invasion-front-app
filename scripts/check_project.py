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
