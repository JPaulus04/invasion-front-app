import Foundation

/// Deterministic 20-room resource/XP integration checks for all playable
/// worlds. This is NOT a simulated human or a claim about dodge skill.
@main
struct CampaignPacingTests {
    static func main() {
        // Survival and optional defense are deliberately interspersed.
        // The boss remains Room 20, regardless of encounter density.
        let bounds = CGRect(x: 26, y: 70, width: 264, height: 300)
        precondition(!FlankSwarmRules.shouldWarn(
            world: 0, room: 1, nextSlot: 4))
        precondition(FlankSwarmRules.shouldWarn(
            world: 0, room: 5, nextSlot: 4))
        precondition(!FlankSwarmRules.shouldWarn(
            world: 0, room: 6, nextSlot: 4))
        precondition(!FlankSwarmRules.shouldWarn(
            world: 1, room: 5, nextSlot: 4))
        precondition(FlankSwarmRules.shouldWarn(
            world: 0, room: 13, nextSlot: 13))
        precondition(FlankSwarmRules.arrivalCount(room: 5, remaining: 1) == 1)
        precondition(FlankSwarmRules.arrivalCount(room: 14, remaining: 7) == 3)
        precondition(FlankSwarmRules.warningSeconds >= 1.5)
        let flankPilot = CGPoint(x: bounds.minX + 25, y: bounds.midY)
        for index in 0..<3 {
            let entry = FlankSwarmRules.entry(
                bounds: bounds, warnedPilot: flankPilot, index: index)
            precondition(bounds.contains(entry))
            precondition(hypot(entry.x - flankPilot.x, entry.y - flankPilot.y) >= 95)
        }
        let expectedSurvival = [3, 3, 3]
        let expectedDefense = [1, 0, 1]
        for world in 0..<WorldCatalog.playableCount {
            var timed = 0
            var survival = 0
            var defenses = 0
            var priorArena = 0
            for room in 1...CampaignPacing.roomsPerWorld {
                let kind = SurvivalEncounterRules.kind(world: world, room: room)
                if room == 20 {
                    precondition(kind == .boss)
                    continue
                }
                if kind == .survival { survival += 1 }
                if kind == .equipmentDefense { defenses += 1 }
                if kind.isTimed {
                    timed += 1
                    precondition(room - priorArena >= 3,
                                 "Timed encounters need at least two ordinary rooms between them")
                    priorArena = room
                    let duration = SurvivalEncounterRules.duration(
                        world: world, room: room)
                    precondition(duration >= 90 && duration <= 120)
                    if kind == .survival {
                        precondition(SurvivalEncounterRules.canSpawn(
                            world: world, room: room, elapsed: 0, livingEnemies: 0))
                        precondition(!SurvivalEncounterRules.canSpawn(
                            world: world, room: room, elapsed: duration, livingEnemies: 0))
                        precondition(SurvivalEncounterRules.extractionActive(
                            world: world, room: room, elapsed: duration))
                        precondition(!SurvivalEncounterRules.extractionActive(
                            world: world, room: room, elapsed: duration - 0.01))
                        precondition(SurvivalEncounterRules.exitRoute(
                            world: world, room: room) == .extractionPortal)
                        for living in [0, 1, SurvivalEncounterRules.maxLivingEnemies(room: room)] {
                            precondition(SurvivalEncounterRules.extractionCanOpen(
                                world: world, room: room, elapsed: duration,
                                livingEnemies: living))
                            precondition(!SurvivalEncounterRules.canSpawn(
                                world: world, room: room, elapsed: duration, livingEnemies: living))
                        }
                        precondition(!SurvivalEncounterRules.extractionCanOpen(
                            world: world, room: room, elapsed: duration, livingEnemies: -1))
                        precondition(!SurvivalEncounterRules.canSpawn(
                            world: world, room: room, elapsed: 10,
                            livingEnemies: SurvivalEncounterRules.maxLivingEnemies(room: room)))
                        precondition((15...28).contains(
                            SurvivalEncounterRules.maxLivingEnemies(room: room)))
                        precondition((1...2).contains(SurvivalEncounterRules.spawnBatch(room: room)))
                    } else {
                        // Device defense has its own enemy and integrity rules;
                        // it is not an extraction-orb survival encounter.
                        precondition(kind == .equipmentDefense)
                        precondition(SurvivalEncounterRules.exitRoute(
                            world: world, room: room) == .combatGate)
                        precondition(!SurvivalEncounterRules.extractionCanOpen(
                            world: world, room: room, elapsed: duration,
                            livingEnemies: 0))
                        precondition(!SurvivalEncounterRules.canSpawn(
                            world: world, room: room, elapsed: 0, livingEnemies: 0))
                        precondition(EquipmentDefenseRules.maySpawn(
                            elapsed: 0, duration: duration,
                            integrity: EquipmentDefenseRules.maximumIntegrity, living: 0))
                        precondition(EquipmentDefenseRules.succeeds(
                            elapsed: duration, duration: duration, integrity: 1))
                    }
                } else {
                    precondition(SurvivalEncounterRules.exitRoute(
                        world: world, room: room) == .combatGate)
                    precondition(!SurvivalEncounterRules.extractionCanOpen(
                        world: world, room: room, elapsed: 10_000,
                        livingEnemies: 0))
                    precondition(SurvivalEncounterRules.duration(
                        world: world, room: room) == 0)
                    precondition(!SurvivalEncounterRules.canSpawn(
                        world: world, room: room, elapsed: 10,
                        livingEnemies: 0))
                }
            }
            precondition((2...3).contains(survival), "Campaign survival frequency exceeds approved limit")
            precondition(survival == expectedSurvival[world] &&
                         defenses == expectedDefense[world])
            precondition(timed == survival + defenses)
        }
        precondition(SurvivalEncounterRules.kind(world: 1, room: 5) == .survival)
        precondition(SurvivalEncounterRules.kind(world: 0, room: 12) == .equipmentDefense)
        // Equipment defense is distinct from combat waves and extraction.
        precondition(FrontierGuardianRules.armorBreakHealth(maxHealth: 180) == 90)
        precondition(!FrontierGuardianRules.shouldBreakArmor(
            health: 91, maxHealth: 180, alreadyBroken: false))
        precondition(FrontierGuardianRules.shouldBreakArmor(
            health: 90, maxHealth: 180, alreadyBroken: false))
        precondition(!FrontierGuardianRules.shouldBreakArmor(
            health: 0, maxHealth: 180, alreadyBroken: true))
        precondition(FrontierGuardianRules.transitionSeconds >= 2.8)
        precondition(FrontierGuardianRules.transitionSeconds <= 3.5)
        let compactArena = CGRect(x: 28, y: 70, width: 264, height: 273)
        let leftPilot = CGPoint(x: 100, y: 180)
        let rightPilot = CGPoint(x: 220, y: 180)
        let leftFlank = FrontierGuardianRules.flankTarget(
            pilot: leftPilot, bounds: compactArena)
        let rightFlank = FrontierGuardianRules.flankTarget(
            pilot: rightPilot, bounds: compactArena)
        precondition(leftFlank.y == leftPilot.y &&
                     leftFlank.x - leftPilot.x >= 70)
        precondition(rightFlank.y == rightPilot.y &&
                     rightPilot.x - rightFlank.x >= 70)
        precondition(compactArena.contains(leftFlank) &&
                     compactArena.contains(rightFlank))
        // At the compact arena's lower-center spawn, the opposite-side dodge
        // lane must avoid BOTH marked impact zones (blast + pilot hit radius).
        let marked = [CGPoint(x: compactArena.midX, y: 110),
                      FrontierGuardianRules.flankTarget(
                          pilot: CGPoint(x: compactArena.midX, y: 110),
                          bounds: compactArena)]
        let dodgeLane = CGPoint(x: compactArena.minX + 42, y: 110)
        precondition(marked.allSatisfy {
            hypot(dodgeLane.x - $0.x, dodgeLane.y - $0.y) > 43 + 14
        }, "A normal iPhone arena must leave a fair exit lane")
        precondition(EquipmentDefenseRules.maximumIntegrity >= 100)
        precondition(EquipmentDefenseRules.hitDamage > 0 &&
                     EquipmentDefenseRules.hitCooldown >= 1.0)
        precondition(EquipmentDefenseRules.enemyCap <= 12)
        precondition(EquipmentDefenseRules.spawnCadence(world: 0) <
                     EquipmentDefenseRules.spawnCadence(world: 1))
        precondition(EquipmentDefenseRules.attackerType(
            world: 0, room: 12, slot: 8) == 3)
        precondition(EquipmentDefenseRules.attackerType(
            world: 2, room: 15, slot: 8) ==
            SurvivalEncounterRules.swarmType(room: 15, slot: 8))
        // Spawn exclusion applies independently of whether a hostile can
        // pathfind; reactor attackers must never appear at striking distance.
        let separation = EquipmentDefenseRules.minimumReactorSpawnDistance
        precondition(!EquipmentDefenseRules.safeSpawn(
            distanceFromReactor: separation, enemyRadius: 14))
        precondition(EquipmentDefenseRules.safeSpawn(
            distanceFromReactor: separation + 14, enemyRadius: 14))
        precondition(!EquipmentDefenseRules.safeSpawn(
            distanceFromReactor: 0, enemyRadius: 26))
        precondition(EquipmentDefenseRules.safeSpawn(
            distanceFromReactor: separation + 26, enemyRadius: 26))
        // Use the actual room-size formula but avoid importing SpriteKit's
        // RoomRules into this lightweight, pure-rules Swift test target.
        // Explicit loops also keep Swift type-checking predictable in CI.
        for screen in [CGSize(width: 320, height: 568),
                       CGSize(width: 393, height: 852),
                       CGSize(width: 768, height: 1024)] {
            let roomWidth = max(CGFloat(120), screen.width - 56)
            let roomHeight = max(CGFloat(160), screen.height - 295)
            let room = CGRect(x: 28, y: 70, width: roomWidth, height: roomHeight)
            let spawnBounds = room.insetBy(dx: 24, dy: 32)
            let reactor = CGPoint(x: room.midX, y: room.midY + room.height * 0.08)
            let pilot = CGPoint(x: room.midX, y: room.minY + 25)
            var positions: [CGPoint] = []
            for row in 0...8 {
                for col in 0...8 {
                    let fractionX = CGFloat(col) / 8
                    let fractionY = CGFloat(row) / 8
                    let x = spawnBounds.minX + spawnBounds.width * fractionX
                    let y = spawnBounds.minY + spawnBounds.height * fractionY
                    positions.append(CGPoint(x: x, y: y))
                }
            }
            guard let chosen = EquipmentDefenseRules.defenseSpawnPosition(
                candidates: positions, pilot: pilot, reactor: reactor, enemyRadius: 14
            ) else {
                preconditionFailure("No safe reactor approach on a supported device")
            }
            let reactorDistance = hypot(chosen.x - reactor.x, chosen.y - reactor.y)
            var longest: CGFloat = 0
            for position in positions {
                let distanceFromPilot = hypot(position.x - pilot.x, position.y - pilot.y)
                if distanceFromPilot < 89 { continue }
                let distanceFromReactor = hypot(position.x - reactor.x,
                                                position.y - reactor.y)
                longest = max(longest, distanceFromReactor)
            }
            let pilotDistance = hypot(chosen.x - pilot.x, chosen.y - pilot.y)
            precondition(pilotDistance >= 89)
            precondition(reactorDistance + 0.001 >= min(separation + 14, longest))
            precondition(reactorDistance >= 119,
                         "Compact defense must give the pilot reaction time")
            if screen.width >= 393 {
                precondition(EquipmentDefenseRules.safeSpawn(
                    distanceFromReactor: reactorDistance, enemyRadius: 14))
            }
        }
        precondition(EquipmentDefenseRules.defenseSpawnPosition(
            candidates: [], pilot: .zero, reactor: .zero,
            enemyRadius: 14) == nil)
        precondition(EquipmentDefenseRules.defenseSpawnPosition(
            candidates: [CGPoint(x: 40, y: 40)],
            pilot: CGPoint(x: 0, y: 300), reactor: .zero,
            enemyRadius: 14) == nil,
            "An impossible lane must not force a reactor-adjacent spawn")
        precondition(!EquipmentDefenseRules.criticalIntegrity(
            EquipmentDefenseRules.maximumIntegrity))
        precondition(!EquipmentDefenseRules.criticalIntegrity(0))
        precondition(EquipmentDefenseRules.criticalIntegrity(50))
        precondition(!EquipmentDefenseRules.criticalIntegrity(51))
        let deadline = SurvivalEncounterRules.duration(world: 0, room: 12)
        precondition(EquipmentDefenseRules.maySpawn(
            elapsed: 0, duration: deadline, integrity: 150, living: 0))
        precondition(!EquipmentDefenseRules.maySpawn(
            elapsed: 12, duration: deadline, integrity: 150,
            living: EquipmentDefenseRules.enemyCap))
        precondition(!EquipmentDefenseRules.maySpawn(
            elapsed: deadline, duration: deadline, integrity: 150, living: 0))
        precondition(!EquipmentDefenseRules.maySpawn(
            elapsed: 10, duration: deadline, integrity: 0, living: 0))
        precondition(EquipmentDefenseRules.applyHit(integrity: 3) == 0)
        precondition(EquipmentDefenseRules.fails(integrity: 0))
        precondition(EquipmentDefenseRules.completionSalvage(room: 12, integrity: 0) == 0)
        precondition(EquipmentDefenseRules.completionSalvage(room: 12, integrity: 1) ==
                     PersistentProgression.roomReward(room: 12),
                     "Successful defense must retain its existing payout")
        precondition(!EquipmentDefenseRules.succeeds(
            elapsed: deadline, duration: deadline, integrity: 0))
        precondition(EquipmentDefenseRules.succeeds(
            elapsed: deadline, duration: deadline, integrity: 1))
        precondition(!EquipmentDefenseRules.succeeds(
            elapsed: deadline - 0.01, duration: deadline, integrity: 150))
        precondition(SurvivalEncounterRules.kind(world: 2, room: 15) == .equipmentDefense)
        for room in 1...20 {
            for slot in 0..<100 {
                let unit = SurvivalEncounterRules.swarmType(
                    room: room, slot: slot)
                precondition([0, 2, 4].contains(unit))
                if room < 8 { precondition(unit != 4) }
                if unit == 4 { precondition(slot > 0 && slot.isMultiple(of: 17)) }
            }
        }
        precondition(SurvivalEncounterRules.fastExtractionBonusCoins == 0)
        precondition(SurvivalEncounterRules.fastExtractionBonusXP == 0)
        precondition(SurvivalEncounterRules.fastExtractionBonusSalvage == 0)

        precondition(CampaignPacing.targetEnemies(room: 0) == 0)
        precondition(CampaignPacing.targetEnemies(room: 1) == 5)
        precondition(CampaignPacing.targetEnemies(room: 5) == 9)
        precondition(CampaignPacing.targetEnemies(room: 10) == 19)
        precondition(CampaignPacing.targetEnemies(room: 19) == 37)
        precondition(CampaignPacing.incomingDamage(amount: 12, room: 3) == 9)
        precondition(CampaignPacing.incomingDamage(amount: 12, room: 8) == 11)
        precondition(CampaignPacing.incomingDamage(amount: 12, room: 19) == 12)
        precondition(CampaignPacing.hitGracePeriod(room: 2) >
                     CampaignPacing.hitGracePeriod(room: 17))
        precondition(CampaignPacing.targetEnemies(room: 20) == 1)
        precondition(CampaignPacing.spawnInterval(room: 19) <=
                     CampaignPacing.spawnInterval(room: 6))
        precondition(CampaignPacing.killXP(type: 0, isBoss: false) == 9)
        precondition(CampaignPacing.killXP(type: 3, isBoss: false) == 10)
        precondition(CampaignPacing.killXP(type: 0, isBoss: true) == 60)
        precondition(CampaignPacing.killCoins(type: 1, isBoss: false) == 12)
        precondition(CampaignPacing.killCoins(type: 0, isBoss: true) == 250)
        for world in 0..<WorldCatalog.playableCount {
            var run = RunProgress()
            var coins = 0
            var salvage = 0
            var chosenUpgrades = 0
            var healingPurchases = 0
            var previousLevel = run.level
            for room in 1...CampaignPacing.roomsPerWorld {
                let target = CampaignPacing.targetEnemies(room: room)
                precondition(target > 0 && target <= 40)
                precondition(room != 20 || target == 1)
                // Stable, varied rolls for a reproducible ideal completion.
                // Every enemy is assumed defeated; no player hit rate,
                // movement, kill time or actual encounter survival is modeled.
                for index in 0..<target {
                    let type = WorldCatalog.enemyType(
                        world: world, room: room,
                        roll: EncounterDirector.enemyRoll(
                            world: world, room: room, slot: index))
                    let boss = room == CampaignPacing.roomsPerWorld
                    let hp = CampaignPacing.enemyHealth(
                        world: world, room: room, type: type)
                    precondition(hp > 0)
                    if boss { precondition(hp == WorldCatalog.info(world).bossHealth) }
                    run.earnXP(CampaignPacing.killXP(type: type, isBoss: boss))
                    coins += CampaignPacing.killCoins(type: type, isBoss: boss)
                    salvage += PersistentProgression.enemyReward(
                        isHeavy: type >= 3, isBoss: boss)
                }
                run.earnXP(CampaignPacing.clearXP(room: room))
                coins += CampaignPacing.clearCoins(room: room)
                salvage += PersistentProgression.roomReward(room: room)
                while run.pendingChoices > 0 {
                    precondition(run.chooseUpgrade())
                    chosenUpgrades += 1
                }
                precondition(run.level >= previousLevel)
                previousLevel = run.level
                if room == 5 || room == 10 || room == 15 {
                    // A player who takes damage has sufficient optional
                    // in-run coins for milestone healing without old gear.
                    let price = CampaignPacing.healingCost(room: room)
                    precondition(coins >= price)
                    coins -= price
                    healingPurchases += 1
                }
                if room == 10 { precondition(run.level >= 5) }
                if room == 19 { precondition(run.level >= 10) }
            }
            salvage += PersistentProgression.worldCompletionBonus
            precondition(run.level >= 11 && chosenUpgrades == run.level - 1)
            precondition(healingPurchases == 3)
            precondition(coins > 0 && salvage > 0)
            print("World \(world + 1): all 20 rooms; level \(run.level); \(chosenUpgrades) upgrade choices; \(healingPurchases) optional heals affordable; \(coins) spare coins; \(salvage) earned Salvage")
        }
        print("Idealized 20-room XP/reward pacing passed; survival still requires device playtesting.")
    }
}
