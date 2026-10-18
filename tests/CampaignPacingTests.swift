import Foundation

/// Deterministic 20-room resource/XP integration checks for all playable
/// worlds. This is NOT a simulated human or a claim about dodge skill.
@main
struct CampaignPacingTests {
    static func main() {
        // Survival and optional defense are deliberately interspersed.
        // The boss remains Room 20, regardless of encounter density.
        let expectedSurvival = [4, 5, 4]
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
                    precondition(room - priorArena >= 2,
                                 "Survival encounters must not occur back to back")
                    priorArena = room
                    let duration = SurvivalEncounterRules.duration(
                        world: world, room: room)
                    precondition(duration >= 90 && duration <= 120)
                    precondition(SurvivalEncounterRules.canSpawn(
                        world: world, room: room, elapsed: 0,
                        livingEnemies: 0))
                    precondition(!SurvivalEncounterRules.canSpawn(
                        world: world, room: room, elapsed: duration,
                        livingEnemies: 0), "Extraction must stop all new spawns")
                    precondition(SurvivalEncounterRules.extractionActive(
                        world: world, room: room, elapsed: duration))
                    precondition(!SurvivalEncounterRules.extractionActive(
                        world: world, room: room, elapsed: duration - 0.01))
                    precondition(SurvivalEncounterRules.exitRoute(
                        world: world, room: room) == .extractionPortal)
                    precondition(!SurvivalEncounterRules.extractionCanOpen(
                        world: world, room: room, elapsed: duration - 0.01,
                        livingEnemies: 0))
                    // The timer opens extraction even if the arena still has
                    // its maximum active swarm; killing them is optional.
                    for living in [0, 1, SurvivalEncounterRules.maxLivingEnemies(room: room)] {
                        precondition(SurvivalEncounterRules.extractionCanOpen(
                            world: world, room: room, elapsed: duration,
                            livingEnemies: living))
                        precondition(!SurvivalEncounterRules.canSpawn(
                            world: world, room: room, elapsed: duration,
                            livingEnemies: living))
                    }
                    precondition(!SurvivalEncounterRules.extractionCanOpen(
                        world: world, room: room, elapsed: duration,
                        livingEnemies: -1))
                    precondition(!SurvivalEncounterRules.canSpawn(
                        world: world, room: room, elapsed: 10,
                        livingEnemies: SurvivalEncounterRules.maxLivingEnemies(
                            room: room)), "Active enemy cap must prevent overload")
                    precondition((15...28).contains(
                        SurvivalEncounterRules.maxLivingEnemies(room: room)))
                    precondition((1...2).contains(
                        SurvivalEncounterRules.spawnBatch(room: room)))
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
            precondition(survival == expectedSurvival[world] &&
                         defenses == expectedDefense[world])
            precondition(timed == survival + defenses)
        }
        precondition(SurvivalEncounterRules.kind(world: 1, room: 5) == .survival)
        precondition(SurvivalEncounterRules.kind(world: 0, room: 12) == .equipmentDefense)
        // Equipment defense is distinct from combat waves and extraction.
        precondition(EquipmentDefenseRules.maximumIntegrity >= 100)
        precondition(EquipmentDefenseRules.hitDamage > 0 &&
                     EquipmentDefenseRules.hitCooldown >= 1.0)
        precondition(EquipmentDefenseRules.enemyCap <= 12)
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
