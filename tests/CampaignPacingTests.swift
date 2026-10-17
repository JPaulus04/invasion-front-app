import Foundation

/// Deterministic 20-room resource/XP integration checks for all playable
/// worlds. This is NOT a simulated human or a claim about dodge skill.
@main
struct CampaignPacingTests {
    static func main() {
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
        precondition(CampaignPacing.killXP(type: 0, isBoss: false) == 8)
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
