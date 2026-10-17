#!/usr/bin/env python3
"""Fast, dependency-free repository sanity checks before Xcode compilation."""
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
sources = sorted((root / "OutpostZero").glob("*.swift"))
required = {"OutpostZeroApp.swift", "GameView.swift", "OutpostScene.swift", "BattlefieldArt.swift", "RoomRules.swift", "RunProgress.swift", "CombatRules.swift", "AbilityLoadout.swift", "PersistentProgression.swift", "RunRecovery.swift", "TerrainHazards.swift", "WorldCatalog.swift", "CampaignPacing.swift", "FrontierFloorArt.swift", "CombatVisuals.swift", "CharacterMotion.swift", "EnemyCombatFeedback.swift"}
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
if 'FrontierFloorArt.texture(' not in (root / "OutpostZero" / "BattlefieldArt.swift").read_text(encoding="utf-8"):
    errors.append("Frontier Forest needs a pre-rendered ground-lighting layer")
if 'child.name != "pilotGroundShadow"' not in scene:
    errors.append("Do not accidentally hide the pilot's ground shadow with placeholder shapes")
if 'forestAmbientBackdrop' not in scene or 'worldMapIndex != 0' not in scene:
    errors.append("Full-screen forest ground must be hidden in the later worlds")
if '"frontierFloorSurface"' in (root / "OutpostZero" / "BattlefieldArt.swift").read_text(encoding="utf-8"):
    errors.append("Do not reintroduce a second forest texture inside the room")
if "CombatVisuals.rifleTracer(in: arena" not in scene:
    errors.append("Rifle attacks must use layered, short-lived tracer artwork")
if "facing: pilotFacing" not in scene or "pilotFacing = 1" not in scene:
    errors.append("Pilot combat-facing animation must reset safely between runs")
if "CharacterMotion.pilot(" not in scene or "CharacterMotion.enemy(" not in scene:
    errors.append("Character motion must use shared art-only pose timing")
if "let isMoving = distance(pilotBeforeMovement, pilot.position) > 0.35" not in scene:
    errors.append("Pilot must not show a walking animation when blocked by rubble")
if 'childNode(withName: "pilotGroundShadow")' not in scene:
    errors.append("The pilot shadow must stay grounded during sprite motion")
if "EnemyCombatFeedback.hit(enemies[index].node" not in scene:
    errors.append("Rifle impacts must recoil the visible sprite only")
if "EnemyCombatFeedback.defeat(in: arena" not in scene:
    errors.append("Enemy destruction must retain an illustrated visual echo")
if "scale(to: 1.2, duration: 0.06)" in scene:
    errors.append("Hit feedback must not scale collision containers")
if "-captureCombatFeedbackScreenshot" not in scene:
    errors.append("Simulator review must include combat-hit artwork")
# The published pilot PNG must not be outlined by the old rectangle.
pilot_visual = scene.split("private func refreshPilotAppearance()", 1)[-1].split("private func drawRestorationRobot()", 1)[0]
if 'productionImage(named: "pilot_idle") != nil' not in pilot_visual or "pilot.strokeColor = .clear" not in pilot_visual:
    errors.append("Illustrated pilot must never restore the prototype white outline")
if 'case (.ready, "start") where WorldCatalog.unlocked(worldMapIndex) && recovery.load() == nil:' not in scene:
    errors.append("World entry must first open loadout selection")
if "case (.loadout, \"lock_loadout\") where draftLoadout.isReady:" not in scene:
    errors.append("Cannot enter a world without three committed tactical abilities")
if "lockedLoadout.availableTacticalUpgrades(" not in scene:
    errors.append("XP choices must be restricted to committed abilities")
if "private func updateOrbitingDefenses()" not in scene:
    errors.append("Orbital blade must have a real contact damage effect")
if "private func showSettings()" not in scene or "key: \"toggle_music\"" not in scene:
    errors.append("Player-facing settings and music toggle must be visible")
if "settingsShortcut.contains(point)" not in scene or "key: \"close_settings\"" not in scene:
    errors.append("Settings shortcut must have a touch route and exit")
if "private func toggleSpeedPreference()" not in scene or "outpostZeroDoubleSpeed" not in scene:
    errors.append("Speed selector must be player-accessible and persistent")
if "qaFastForwardEnabled" in scene:
    errors.append("Speed control must not depend on a QA launch argument")
if "func setAppActive(_ active: Bool)" not in scene or "case (.interrupted, \"resume_run\")" not in scene:
    errors.append("Interruption must pause combat until explicit resume")
if 'ProcessInfo.processInfo.arguments.contains("-captureSettingsScreenshot")' not in scene:
    errors.append("Simulator must verify settings and interruption recovery")
if 'ProcessInfo.processInfo.arguments.contains("-capturePausedRunScreenshot")' not in scene:
    errors.append("Simulator must validate the focused pause card")
if 'y: -293,' not in scene or 'y: -272, fontSize: 12)' not in scene:
    errors.append("World map must fit power-core status inside its panel")
if "COMBAT FROZEN UNTIL YOU RESUME" not in scene:
    errors.append("Pause message must not promise unsaved progress protection")
if "settingsShortcut.position = CGPoint(" not in scene or "y: overlay.position.y + 155" not in scene:
    errors.append("World-map settings button must remain inside its panel")
if "CombatRules.orbitalBladeHits(" not in scene:
    errors.append("Orbital combat must use tested physical contact rules")
if 'ProcessInfo.processInfo.arguments.contains("-captureOvergrownScreenshot")' not in scene:
    errors.append("Overgrown Path must have a simulator art-review scene")
if 'ProcessInfo.processInfo.arguments.contains("-captureLoadoutScreenshot")' not in scene:
    errors.append("Build 315 must capture the actual pre-world loadout selection")
if "private func enterSelectedWorld() -> Bool" not in scene or "_ = enterSelectedWorld()" not in scene:
    errors.append("Loadout simulator QA and touch route must share a lock action")
if "bankSalvage(PersistentProgression.roomReward(room: wave))" not in scene:
    errors.append("Each cleared room must bank permanent Salvage immediately")
if "salvageBankedThisRun += permanent.bank(PersistentProgression.worldCompletionBonus)" not in scene:
    errors.append("World-completion Salvage must bypass recovered-room reward caps")
if "bankSalvage(PersistentProgression.enemyReward(" not in scene:
    errors.append("Enemy defeats must bank Salvage immediately")
if '(.gameOver, "headquarters")' not in scene or 'restart()\n            showHeadquarters()' not in scene:
    errors.append("Defeated players must reach upgrade headquarters")
if 'private func showGearBay()' not in scene or 'private func showAbilityLab()' not in scene:
    errors.append("Permanent gear and ability masteries need usable menus")
if "gearWeaponBonus" not in scene or 'permanent.rank("armor") * 15' not in scene:
    errors.append("Purchased gear must affect next-run combat stats")
if 'ProcessInfo.processInfo.arguments.contains("-captureHeadquartersScreenshot")' not in scene:
    errors.append("Simulator must capture the headquarters upgrade menu")
if 'private func recoverSavedRun()' not in scene or 'key: "recover_run"' not in scene:
    errors.append("Saved runs must be recoverable from the world map")
if "saveRunRecovery()" not in scene or "recovery.clear()" not in scene:
    errors.append("Run recovery must be saved and cleared deliberately")
if "awardRoomXP(xpAmount)" not in scene or "awardRoomCoins(enemies[index].reward)" not in scene:
    errors.append("Recovered rooms must not double-pay XP or coins")
if 'ProcessInfo.processInfo.arguments.contains("-captureRecoveryScreenshot")' not in scene:
    errors.append("Simulator must test run-recovery lifecycle")
if "checkpointPresented: checkpointPresented" not in scene or "checkpointPresented = snapshot.checkpointPresented" not in scene:
    errors.append("Checkpoint presentation state must persist across app termination")
if "CombatRules.mayBeginRangedAttack(" not in scene:
    errors.append("Concurrent ranged attacks must respect a tested readable threat cap")
if "CombatRules.mortarWarningScale(" not in scene:
    errors.append("2x game speed must accelerate the mortar warning clock with the impact")
if "checkpointPresented = true" not in scene or "showCheckpoint()" not in scene:
    errors.append("Milestone healing stations must be presented to wounded pilots")
if "TerrainHazards.resolveMovement(" not in scene or "updateTerrainHazards()" not in scene:
    errors.append("Terrain hazards must control real movement and damage, not just scenery")
if 'ProcessInfo.processInfo.arguments.contains("-captureTerrainHazardsScreenshot")' not in scene:
    errors.append("Simulator must include a hazardous arena preview")
if "TerrainHazards.acidTouches(" not in scene or "TerrainHazards.waterSpeed(" not in scene:
    errors.append("Water slowdown and acid damage must be connected to gameplay")
if 'decorateLiquidHazard(shape, kind: .water' not in scene or 'decorateLiquidHazard(shape, kind: .acid' not in scene:
    errors.append("Hazard artwork must visually differentiate slow water and pulsing acid")
if 'shape.childNode(withName: "acidActiveVeins")?.isHidden = !acidOn' not in scene:
    errors.append("Acid pulse visuals must update alongside actual damage timing")
if "WorldCatalog.recordVictory(worldMapIndex, stars: stars)" not in scene:
    errors.append("Each world must award its own stars and power cores")
if "WorldCatalog.enemyType(world: worldMapIndex" not in scene:
    errors.append("World-specific enemies must be drawn from tested rules")
if 'ProcessInfo.processInfo.arguments.contains("-captureWorldExpansionScreenshot")' not in scene:
    errors.append("Simulator must capture an actual unlocked Flooded Outpost arena")
if 'ProcessInfo.processInfo.arguments.contains("-captureWorldTransitionScreenshot")' not in scene:
    errors.append("Simulator must validate the World 2 -> World 3 transition and new loadout")
if "private func advanceToNextWorld()" not in scene:
    errors.append("World-completion buttons must use a guarded next-world transition")
if 'aimLineLeft' not in scene or 'aimLineRight' not in scene or "wardenVolleyTargets(" not in scene:
    errors.append("Tidal Warden fan must warn visibly before firing three shots")
if "-captureFloodedBossScreenshot" not in scene or "-captureToxicBossScreenshot" not in scene:
    errors.append("Both new worlds must have simulator boss-spawn and attack coverage")
if '? selectedWorld.title : "OUTPOST ZERO"' not in scene and 'selectedWorld.title : "OUTPOST ZERO")' not in scene:
    if 'wave > 0 && phase != .ready && phase != .loadout' not in scene:
        errors.append("Combat HUD must identify the selected world during upgrades")
if "WorldCatalog.recordBestRoom(worldMapIndex, room: wave)" not in scene:
    errors.append("Best room must be tracked as each new room begins")
if "WorldCatalog.recordBestRoom(worldMapIndex, room: worldWaveCount)" not in scene:
    errors.append("Completed worlds must record Room 20 as their best result")
if '"RESUME WORLD \\(storedRun.worldIndex + 1)' not in scene:
    errors.append("Saved runs from later worlds must be directly resumable on the default world map")
if "CampaignPacing.targetEnemies(room: wave)" not in scene or "CampaignPacing.enemyHealth(world: worldMapIndex" not in scene:
    errors.append("20-room QA tests must use the same enemy pacing as actual gameplay")
if "CampaignPacing.clearCoins(room: wave)" not in scene or "CampaignPacing.clearXP(room: wave)" not in scene:
    errors.append("Full-run XP and coin tests must match the game")
if "guard health > 0, progress.pendingChoices > 0" not in scene:
    errors.append("A lethal hit must end the run before a level-up can interrupt death")
if "if displayedAcidActive != acidOn" not in scene or "guard !acidVisualNodes.isEmpty else { return }" not in scene:
    errors.append("Acid artwork must update only on phase transitions and skip water-only rooms")
if "if subtitle.text != subtitleText" not in scene or "if info.text != infoText" not in scene:
    errors.append("Combat HUD should not rerender labels whose values have not changed")
if "if enemyDamaged { removeDefeatedEnemies() }" not in scene:
    errors.append("Hazard updates must avoid full enemy-death sweeps without actual damage")
if "CombatRules.nearestActiveTarget(" not in scene or "selectedIndex: index" not in scene:
    errors.append("Auto-fire must reuse a single tested nearest-target scan")
if "let reachable = enemies.filter" in scene:
    errors.append("Auto-fire must not allocate a filtered enemy array every combat frame")
# Guard the XP-on-kill and mid-room level-up contract against regressions.
kill_section = scene.split("private func removeDefeatedEnemies()", 1)[-1].split("private func updateEnemyHealthBar", 1)[0]
choice_section = scene.split("private func chooseLevelUpgrade", 1)[-1].split("private func showCheckpoint", 1)[0]
if "awardRoomXP(xpAmount)" not in kill_section:
    errors.append("Kills must grant replay-safe XP immediately")
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
if 'countdown.name = "mortarCountdown"' not in lob_attack or "countdown.setScale(1)" not in lob_attack:
    errors.append("Mortar attack must install a readable time-to-impact countdown")
if "CombatRules.mortarWarningScale(" not in scene:
    errors.append("Mortar warning must advance from combat time even at 2x speed")
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
# CI must exercise the real XP-on-kill -> upgrade menu -> combat resume transition.
for flag in ("-captureLevelUpScreenshot", "-captureLevelUpResumeScreenshot"):
    if flag not in scene:
        errors.append(f"Missing level-up simulator capture: {flag}")
qa_scene = scene.split("// CI-only level-up integration review:", 1)[-1].split("// CI-only launch flag:", 1)[0]
for statement in ("removeDefeatedEnemies()", "progress.pendingChoices == 1", "activateLevelUp(at: CGPoint(x: rect.midX, y: rect.midY))", "progress.pendingChoices == 0"):
    if statement not in qa_scene:
        errors.append(f"Level-up integration regression: {statement}")
# The same upgrade-card hit testing must be used by simulator QA and real taps.
if "private func levelChoice(at point: CGPoint)" not in scene:
    errors.append("Level-up hit-test helper missing")
if "private func activateLevelUp(at point: CGPoint)" not in scene:
    errors.append("Level-up tap action helper missing")
if "case (.levelUp, _): _ = activateLevelUp(at: local)" not in scene:
    errors.append("Touch selection must use tested card hitboxes")
if "activateLevelUp(at: CGPoint(x: rect.midX, y: rect.midY))" not in qa_scene:
    errors.append("Simulator must trigger the production level-up tap route")
if "controlsHint.text = \"DRAG TO MOVE  •  AUTO-FIRE\"" not in scene:
    errors.append("First room needs concise touch and auto-fire guidance")
if "ROOM CLEAR — WALK INTO GATE" not in scene:
    errors.append("First-room exit must explain physical portal entry")
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
if ("room = RoomRules.bounds" not in art or
        'contactEdge.name = "roomContactEdge"' not in art):
    errors.append("Missing room boundary artwork")
if "let entrance = SKShapeNode" in art:
    errors.append("Static horizontal entrance stripe must not return")
if "behind.addChild(" in art:
    errors.append("BattlefieldArt references an undefined behind node")
if "gameplay.addChild(" not in art:
    errors.append("BattlefieldArt must attach its nodes to gameplay")
# Protect the mobile art pass from returning to round terrain stamps and
# evenly spaced left-to-right floor markings.
if "static func terrainShape(width: CGFloat, height: CGFloat, variation: Int)" not in art:
    errors.append("Organic floor silhouette helper missing")
if "let patches: [(CGFloat, CGFloat, CGFloat, CGFloat)]" in art:
    errors.append("Old circular floor patches must not return")
if "SKShapeNode(ellipseOf:" in art:
    errors.append("Large ellipse terrain stamps must not return")
if 'flooded.name = "floodedAmbientBackdrop"' not in art:
    errors.append("World 2 must have its own prerendered maritime surface")
if 'if zone == 1 && worldMapIndex == 1' not in scene:
    errors.append("Flooded Outpost must not reuse forest broadleaf props")
if 'toxic.name = "toxicAmbientBackdrop"' not in art:
    errors.append("Toxic Crossing needs a unique ground material")
if 'addToxicEdgeProp(to: prop' not in scene:
    errors.append("Toxic Crossing needs unique industrial equipment")
if '"BLOCKED"' in scene:
    errors.append("Placeholder BLOCKED UI must not cover rubble obstacles")
if 'decorateRubbleObstacle(shape, size: patch.frame.size)' not in scene:
    errors.append("Rubble collision patches must use dimensional artwork")
if 'if worldMapIndex == 0 && zone <= 1' not in scene:
    errors.append("Forest litter must not be painted into flooded rooms")
forest_floor = scene.split("// Sparse, asymmetrical forest dressing.", 1)[-1].split("// Fern silhouettes", 1)[0]
if "BattlefieldArt.terrainShape(" not in forest_floor:
    errors.append("Forest floor must use irregular debris silhouettes")
if "let fraction = CGFloat(index + 1) / 13" in scene:
    errors.append("Equidistant horizontal ground marks must not return")
if "upgradeConfirmed ? 35 : 140" in scene:
    errors.append("Legacy upgrade touch bands must not return")
# Keep the manual TestFlight flow in parity with the simulator workflow:
# otherwise a green debug build can release placeholder artwork.
release_workflow = root / ".github" / "workflows" / "testflight.yml"
if release_workflow.is_file():
    release = release_workflow.read_text(encoding="utf-8")
    for command in ("scripts/generate_forest_art.py", "scripts/generate_pilot_art.py",
                    "scripts/generate_enemy_art.py", "scripts/check_art_sprites.py"):
        if command not in release:
            errors.append(f"TestFlight workflow missing art preparation: {command}")
    if "Exported IPA missing production artwork" not in release:
        errors.append("TestFlight export must verify all bundled artwork")
if not (root / "project.yml").is_file():
    errors.append("Missing XcodeGen project.yml")
if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)
print(f"Sanity checks passed: {len(sources)} Swift files")
