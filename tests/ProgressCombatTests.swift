import Foundation
import CoreGraphics

@main
struct ProgressCombatTests {
    static func main() {
        precondition(WorldCoreRewards.newlyEarned(previousBest: 0, completedStars: 1) == 1)
        precondition(WorldCoreRewards.newlyEarned(previousBest: 1, completedStars: 2) == 1)
        precondition(WorldCoreRewards.newlyEarned(previousBest: 1, completedStars: 3) == 2)
        precondition(WorldCoreRewards.newlyEarned(previousBest: 3, completedStars: 3) == 0)
        precondition(WorldCoreRewards.newlyEarned(previousBest: 3, completedStars: 1) == 0)
        precondition(WorldCoreRewards.newlyEarned(previousBest: 0, completedStars: 9) == 3)
        precondition(WorldCoreRewards.bestStars(previousBest: 3, completedStars: 1) == 3)
        precondition(WorldCoreRewards.bestStars(previousBest: 1, completedStars: 3) == 3)
        // Rarity-weighted in-run selection: common early choices are more
        // accessible, and a committed ability occupies a beginner slot.
        var loadout = AbilityLoadout()
        precondition(loadout.selected.isEmpty)
        precondition(!loadout.acquire("invalid", capacity: 2))
        precondition(loadout.acquire("incendiary", capacity: 2))
        precondition(loadout.acquire("explosive", capacity: 2))
        precondition(!loadout.acquire("chain", capacity: 2))
        precondition(loadout.selected == ["incendiary", "explosive"])
        precondition(loadout.availableTacticalUpgrades(
            chain: 0, explosive: 1, incendiary: 2, orbit: 0, capacity: 2
        ) == ["explosive", "incendiary"])
        precondition(loadout.availableTacticalUpgrades(
            chain: 0, explosive: 3, incendiary: 3, orbit: 0, capacity: 2
        ).isEmpty)
        precondition(AbilityLoadout(selected: ["orbit", "orbit", "invalid", "chain"])
                     .selected == ["orbit", "chain"])
        precondition(TacticalDraftRules.futureCatalog.count == 15)
        precondition(TacticalDraftRules.baseStatChoices.count == 3)
        precondition(TacticalDraftRules.baseStatChoices.allSatisfy {
            TacticalDraftRules.weight(for: $0) > 0
        })
        precondition(TacticalDraftRules.weight(for: "mobility") > 0)
        precondition(TacticalDraftRules.weight(for: "supplies") > 0)
        precondition(TacticalDraftRules.rarity(for: "incendiary") == .common)
        precondition(AbilityLoadout.catalog.contains("frost"))
        precondition(TacticalDraftRules.rarity(for: "frost") == .common)
        precondition(FrostRoundsRules.speedMultiplier(rank: 0) == 1)
        precondition(FrostRoundsRules.speedMultiplier(rank: 1) < 1)
        precondition(FrostRoundsRules.speedMultiplier(rank: 3) <
                     FrostRoundsRules.speedMultiplier(rank: 1))
        precondition(FrostRoundsRules.duration(rank: 3) >
                     FrostRoundsRules.duration(rank: 1))
        var frostBuild = AbilityLoadout()
        precondition(frostBuild.acquire("frost", capacity: 2))
        precondition(frostBuild.availableTacticalUpgrades(
            chain: 0, explosive: 0, incendiary: 0, orbit: 0, frost: 1,
            capacity: 1
        ) == ["frost"])
        precondition(!frostBuild.acquire("chain", capacity: 1))
        precondition(TacticalDraftRules.rarity(for: "chain") == .epic)
        precondition(TacticalDraftRules.rarity(for: "drone") == .legendary)
        precondition(TacticalDraftRules.weight(for: "incendiary") >
                     TacticalDraftRules.weight(for: "chain"))
        precondition(TacticalDraftRules.pick(
            from: ["incendiary", "chain"], roll: 0) == "incendiary")
        precondition(TacticalDraftRules.pick(
            from: ["incendiary", "chain"], roll: 19) == "chain")
        // Energy Wheel is a deliberate late-world evolution, not an early
        // free upgrade. Its card must carry a nonzero draft weight.
        precondition(TacticalDraftRules.weight(for: "evolveOrbit") > 0)
        precondition(!TacticalDraftRules.canEvolve(
            "orbit", rank: 2, masteryLevel: 20, world: 3, synergyRank: 2))
        precondition(!TacticalDraftRules.canEvolve(
            "orbit", rank: 3, masteryLevel: 19, world: 3, synergyRank: 2))
        precondition(!TacticalDraftRules.canEvolve(
            "orbit", rank: 3, masteryLevel: 20, world: 2, synergyRank: 2))
        precondition(TacticalDraftRules.canEvolve(
            "orbit", rank: 3, masteryLevel: 20, world: 3, synergyRank: 2))
        let evolutionLoadout = AbilityLoadout(selected: ["orbit", "chain"])
        precondition(TacticalDraftRules.evolutionChoices(
            for: evolutionLoadout, ranks: ["orbit": 3, "chain": 2],
            masteryLevel: 20, world: 3, synergyRanks: ["orbit": 2],
            alreadyEvolved: []).contains("orbit"))
        precondition(!TacticalDraftRules.evolutionChoices(
            for: evolutionLoadout, ranks: ["orbit": 3, "chain": 2],
            masteryLevel: 20, world: 3, synergyRanks: ["orbit": 2],
            alreadyEvolved: ["orbit"]).contains("orbit"))
        CombatEvolutionGeometryTests.verifyEnergyWheelGeometry()
        var earnedRun = RunProgress()
        precondition(earnedRun.claimMastery(room: 1))
        precondition(!earnedRun.claimMastery(room: 1))
        precondition(!earnedRun.claimMastery(room: 25))
        let suiteMastery = "outpost.zero.mastery.test"
        let masteryStore = UserDefaults(suiteName: suiteMastery)!
        masteryStore.removePersistentDomain(forName: suiteMastery)
        let mastery = PlayerMastery(storage: masteryStore)
        precondition(mastery.level == 1 && mastery.capacity == 2)
        for _ in 0..<8 {
            for room in 1...20 { _ = mastery.awardClearedRoom(room) }
        }
        precondition(mastery.level >= 20 && mastery.capacity == 3)
        // Salvage survives failed attempts, and purchase benefits are
        // independent of run XP and exclusive world-core currency.
        let suite = "outpost.zero.progression.test"
        let store = UserDefaults(suiteName: suite)!
        store.removePersistentDomain(forName: suite)
        let permanent = PersistentProgression(storage: store)
        precondition(permanent.salvage == 0 && permanent.rank("weapon") == 0)
        precondition(!permanent.purchase("weapon"))
        precondition(permanent.bank(-25) == 0)
        let initialWeaponCost = PersistentProgression.cost("weapon", at: 0)
        precondition(initialWeaponCost == 135)
        precondition(permanent.bank(initialWeaponCost - 1) == initialWeaponCost - 1)
        precondition(!permanent.purchase("weapon"))
        precondition(permanent.bank(1) == 1)
        precondition(permanent.purchase("weapon"))
        precondition(permanent.salvage == 0 && permanent.rank("weapon") == 1)
        precondition(permanent.cost("weapon") == 540)
        precondition(!permanent.purchase("invalid"))
        precondition(permanent.bank(1_000) == 1_000)
        precondition(permanent.purchase("armor"))
        precondition(permanent.purchase("chain"))
        precondition(permanent.rank("armor") == 1 && permanent.rank("chain") == 1)
        precondition(PersistentProgression.maximumRank == 12)
        precondition(PersistentProgression.cost("weapon", at: 9) >
                     PersistentProgression.cost("weapon", at: 5))
        precondition(PersistentProgression.cost("weapon", at: 12) == Int.max)
        let restarted = PersistentProgression(storage: store)
        precondition(restarted.rank("weapon") == 1 && restarted.rank("chain") == 1)
        precondition(restarted.salvage == permanent.salvage)
        precondition(PersistentProgression.roomReward(room: 12) >
                     PersistentProgression.roomReward(room: 3))
        precondition(PersistentProgression.enemyReward(isHeavy: false, isBoss: true) >
                     PersistentProgression.enemyReward(isHeavy: false, isBoss: false))
        // The reduced completion bonus must match the live economy.
        precondition(PersistentProgression.worldCompletionBonus == 45)
        let completionSuite = "outpost.zero.completion.test"
        let completionStorage = UserDefaults(suiteName: completionSuite)!
        completionStorage.removePersistentDomain(forName: completionSuite)
        let completionProgress = PersistentProgression(storage: completionStorage)
        let paidBonus = completionProgress.bank(PersistentProgression.worldCompletionBonus)
        precondition(paidBonus == 45 && completionProgress.salvage == 45)
        completionStorage.removePersistentDomain(forName: completionSuite)
        store.removePersistentDomain(forName: suite)
        // Persist and recover a Room 12 battle without losing the chosen
        // abilities or re-paying rewards for already cleared rooms.
        let recoverySuite = "outpost.zero.recovery.test"
        let recoveryStorage = UserDefaults(suiteName: recoverySuite)!
        recoveryStorage.removePersistentDomain(forName: recoverySuite)
        let recover = RunRecoveryStore(storage: recoveryStorage)
        precondition(recover.load() == nil)
        var restoredProgress = RunProgress()
        restoredProgress.earnXP(100)
        let saved = RunSnapshot(
            version: RunSnapshot.schema, worldIndex: 0, room: 12, location: .battle,
            health: 21, coins: 1506, damage: 4, fireRate: 3,
            chainLevel: 1, explosiveLevel: 0, incendiaryLevel: 1,
            orbitLevel: 2, runArmor: 20, checkpointUsed: false, checkpointPresented: false,
            progress: restoredProgress, abilities: ["chain", "incendiary", "orbit"],
            earnedSalvage: 297, roomSalvageCredit: 24,
            roomCoinCredit: 84, roomXPCredit: 58)
        precondition(saved.isValid && recover.save(saved))
        let reopened = RunRecoveryStore(storage: recoveryStorage).load()
        precondition(reopened?.worldIndex == 0 && reopened?.room == 12 && reopened?.health == 21 &&
                     reopened?.coins == 1506 && reopened?.runArmor == 20 &&
                     reopened?.earnedSalvage == 297 &&
                     reopened?.roomCoinCredit == 84 &&
                     reopened?.roomXPCredit == 58 &&
                     reopened?.checkpointPresented == false &&
                     reopened?.progress.level == 2 &&
                     reopened?.abilities == ["chain", "incendiary", "orbit"])
        precondition(reopened?.timedEncounterElapsed == nil)
        // Legacy schema-4 saves omit the evolution field and must decode.
        precondition(reopened?.energyWheelEvolved == nil)
        var evolvedSave = saved
        evolvedSave.energyWheelEvolved = true
        // A World 1 save with insufficient synergy cannot claim evolution.
        precondition(!evolvedSave.isValid)
        evolvedSave = RunSnapshot(
            version: RunSnapshot.schema, worldIndex: 2, room: 12,
            location: .battle, health: 75, coins: 200, damage: 4, fireRate: 3,
            chainLevel: 2, explosiveLevel: 0, incendiaryLevel: 0,
            orbitLevel: 3, runArmor: 0, checkpointUsed: false,
            checkpointPresented: false, progress: restoredProgress,
            abilities: ["orbit", "chain"], earnedSalvage: 0,
            roomSalvageCredit: 0, roomCoinCredit: 0, roomXPCredit: 0)
        evolvedSave.energyWheelEvolved = true
        precondition(evolvedSave.isValid && recover.save(evolvedSave))
        precondition(recover.load()?.energyWheelEvolved == true)
        // Restore the baseline save before testing timed-room recovery.
        precondition(recover.save(saved))

        var timedSave = saved
        timedSave.timedEncounterElapsed = 83.5
        timedSave.timedEncounterSpawned = 42
        timedSave.timedEncounterLiving = 14
        precondition(timedSave.isValid && recover.save(timedSave))
        precondition(abs((recover.load()?.timedEncounterElapsed ?? 0) - 83.5) < 0.0001)
        precondition(recover.load()?.timedEncounterSpawned == 42)
        precondition(recover.load()?.timedEncounterLiving == 14)
        // Restoring only surviving enemies must not suppress rewards from
        // their *first* death. Tactical/legacy full-room replays keep credits.
        let survivingOnlyCoinCredit = RunRecoveryStore.recoveredKillCredit(
            previouslyCredited: timedSave.roomCoinCredit,
            restoredOnlyLivingEnemies: true)
        let survivingOnlyXPCredit = RunRecoveryStore.recoveredKillCredit(
            previouslyCredited: timedSave.roomXPCredit,
            restoredOnlyLivingEnemies: true)
        precondition(survivingOnlyCoinCredit == 0 && survivingOnlyXPCredit == 0)
        precondition(RunRecoveryStore.incrementalReward(
            earnedOnReplay: 0, previouslyCredited: survivingOnlyCoinCredit,
            reward: 11) == 11)
        precondition(RunRecoveryStore.incrementalReward(
            earnedOnReplay: 0, previouslyCredited: survivingOnlyXPCredit,
            reward: 9) == 9)
        precondition(RunRecoveryStore.recoveredKillCredit(
            previouslyCredited: timedSave.roomCoinCredit,
            restoredOnlyLivingEnemies: false) == timedSave.roomCoinCredit)
        precondition(RunRecoveryStore.incrementalReward(
            earnedOnReplay: 0, previouslyCredited: timedSave.roomCoinCredit,
            reward: 11) == 0)
        timedSave.defenseObjectiveIntegrity = 88
        precondition(timedSave.isValid && recover.save(timedSave))
        precondition(recover.load()?.defenseObjectiveIntegrity == 88)
        timedSave.defenseObjectiveIntegrity = 0
        precondition(timedSave.isValid && recover.save(timedSave))
        precondition(recover.load()?.defenseObjectiveIntegrity == 0,
                     "A failed optional defense must remain recoverable")
        timedSave.defenseObjectiveIntegrity = -1
        precondition(!timedSave.isValid && !recover.save(timedSave))
        timedSave.defenseObjectiveIntegrity = EquipmentDefenseRules.maximumIntegrity + 1
        precondition(!timedSave.isValid)
        timedSave.defenseObjectiveIntegrity = nil
        timedSave.timedEncounterLiving = 29
        precondition(!timedSave.isValid && !recover.save(timedSave),
                     "Survival recovery must reject live swarms above the cap")
        timedSave.timedEncounterLiving = 43
        precondition(!timedSave.isValid)
        timedSave.timedEncounterLiving = 14
        timedSave.timedEncounterSpawned = 10
        precondition(!timedSave.isValid,
                     "Survivor count cannot exceed the total spawned")
        timedSave.timedEncounterSpawned = 42
        timedSave.timedEncounterElapsed = 121
        precondition(!timedSave.isValid && !recover.save(timedSave))
        precondition(recover.save(saved))
        let bad = RunSnapshot(
            version: 999, worldIndex: 0, room: 12, location: .battle,
            health: 21, coins: 1506, damage: 4, fireRate: 3,
            chainLevel: 1, explosiveLevel: 0, incendiaryLevel: 1,
            orbitLevel: 2, runArmor: 20, checkpointUsed: false, checkpointPresented: false,
            progress: restoredProgress, abilities: ["chain", "incendiary", "orbit"],
            earnedSalvage: 297, roomSalvageCredit: 24,
            roomCoinCredit: 84, roomXPCredit: 58)
        precondition(!recover.save(bad))
        precondition(RunRecoveryStore.incrementalReward(
            earnedOnReplay: 0, previouslyCredited: 24, reward: 12) == 0)
        precondition(RunRecoveryStore.incrementalReward(
            earnedOnReplay: 12, previouslyCredited: 24, reward: 12) == 0)
        precondition(RunRecoveryStore.incrementalReward(
            earnedOnReplay: 24, previouslyCredited: 24, reward: 6) == 6)
        precondition(RunRecoveryStore.incrementalReward(
            earnedOnReplay: 25, previouslyCredited: 24, reward: -10) == 0)
        precondition(RunRecoveryStore.incrementalReward(
            earnedOnReplay: 0, previouslyCredited: 84, reward: 50) == 0)
        precondition(RunRecoveryStore.incrementalReward(
            earnedOnReplay: 80, previouslyCredited: 84, reward: 8) == 4)
        let completedRoom = RunSnapshot(
            version: RunSnapshot.schema, worldIndex: 0, room: 20, location: .clearedGate,
            health: 15, coins: 2500, damage: 9, fireRate: 5,
            chainLevel: 3, explosiveLevel: 3, incendiaryLevel: 3,
            orbitLevel: 3, runArmor: 80, checkpointUsed: true, checkpointPresented: true,
            progress: restoredProgress,
            abilities: ["chain", "incendiary", "orbit"],
            earnedSalvage: 1100, roomSalvageCredit: 88,
            roomCoinCredit: 42, roomXPCredit: 62)
        precondition(completedRoom.isValid && recover.save(completedRoom))
        precondition(recover.load()?.location == .clearedGate)
        precondition(recover.load()?.checkpointPresented == true)
        // A cleared milestone is recovered with its healing offer already
        // recorded; returning to its open gate must not show it again.
        let offeredCheckpoint = RunSnapshot(
            version: RunSnapshot.schema, worldIndex: 1, room: 10,
            location: .clearedGate, health: 32, coins: 240,
            damage: 3, fireRate: 2,
            chainLevel: 1, explosiveLevel: 0, incendiaryLevel: 1,
            orbitLevel: 2, runArmor: 10,
            checkpointUsed: false, checkpointPresented: true,
            progress: restoredProgress,
            abilities: ["chain", "incendiary", "orbit"],
            earnedSalvage: 220, roomSalvageCredit: 24,
            roomCoinCredit: 42, roomXPCredit: 62)
        precondition(offeredCheckpoint.isValid && recover.save(offeredCheckpoint))
        precondition(recover.load()?.worldIndex == 1)
        precondition(recover.load()?.room == 10)
        precondition(recover.load()?.checkpointPresented == true)
        recover.clear()
        precondition(recover.load() == nil)
        recoveryStorage.removePersistentDomain(forName: recoverySuite)
        var run = RunProgress()
        let firstThreshold = run.nextLevelXP
        run.earnXP(firstThreshold - 1)
        precondition(run.level == 1 && run.pendingChoices == 0)
        run.earnXP(7) // A kill crosses the threshold and retains excess XP.
        precondition(run.level == 2 && run.xp == 6 && run.pendingChoices == 1)
        precondition(run.chooseUpgrade() && !run.chooseUpgrade())
        let next = run.nextLevelXP
        run.earnXP(next - run.xp - 1)
        run.earnXP(7) // Room bonus can also trigger a level-up.
        precondition(run.level == 3 && run.xp == 6)
        var burst = RunProgress()
        burst.earnXP(firstThreshold + next + 5)
        precondition(burst.level == 3 && burst.xp == 5 && burst.pendingChoices == 2)
        precondition(burst.chooseUpgrade() && burst.chooseUpgrade() && !burst.chooseUpgrade())
        let xpBefore = burst.xp
        burst.earnXP(-50)
        precondition(burst.xp == xpBefore)
        run.recordDamage(11)
        precondition(run.stars == 2)
        precondition(run.stars(forWorld: 0) == 3)
        run.recordDamage(40)
        precondition(run.stars == 1 && run.damageTaken == 51)
        precondition(run.stars(forWorld: 0) == 3)
        var firstWorldClear = RunProgress()
        firstWorldClear.recordDamage(112)
        precondition(firstWorldClear.stars(forWorld: 0) == 2)
        precondition(firstWorldClear.stars(forWorld: 1) == 1,
                     "Unrevised worlds must retain their original thresholds")
        firstWorldClear.recordDamage(69)
        precondition(firstWorldClear.stars(forWorld: 0) == 1)
        precondition(WorldCoreRewards.newlyEarned(
            previousBest: 3, completedStars: firstWorldClear.stars(forWorld: 0)) == 0)
        // Healing changes health in the scene; it cannot subtract damage from this record.
        run.recordDamage(-51)
        precondition(run.damageTaken == 51)
        run = RunProgress()
        precondition(run.level == 1 && run.xp == 0 && run.pendingChoices == 0 && run.damageTaken == 0)
        var clock = CombatClock()
        clock.advance(1, playing: true)
        let attackDeadline = clock.time + 1.4
        clock.advance(30, playing: false) // Time spent choosing an upgrade.
        precondition(clock.time == 1 && clock.time < attackDeadline)
        clock.advance(1.39, playing: true)
        precondition(clock.time < attackDeadline)
        clock.advance(0.02, playing: true)
        precondition(clock.time >= attackDeadline)
        for room in 1...5 {
            for roll in 0..<100 { precondition(CombatRules.enemyType(room: room, roll: roll) < 4) }
        }
        precondition(CombatRules.enemyType(room: 6, roll: 20) == 4)
        precondition(CombatRules.enemyType(room: 6, roll: 30) != 4)
        precondition(CombatRules.maximumConcurrentRangedThreats(room: 6) == 1)
        precondition(CombatRules.maximumConcurrentRangedThreats(room: 12) == 2)
        precondition(CombatRules.maximumConcurrentRangedThreats(room: 19) == 3)
        precondition(CombatRules.mayBeginRangedAttack(room: 6, activeThreats: 0))
        precondition(!CombatRules.mayBeginRangedAttack(room: 6, activeThreats: 1))
        precondition(CombatRules.mayBeginRangedAttack(room: 19, activeThreats: 2))
        precondition(!CombatRules.mayBeginRangedAttack(room: 19, activeThreats: 3))
        precondition(CombatRules.enemyType(room: 11, roll: 10) == 5)
        precondition(CombatRules.enemyType(room: 11, roll: 30) == 4)
        // Enemies use independent pursuit and flank patterns; the steering
        // vector can never increase a role's configured movement speed.
        let gruntMotion = CombatRules.enemySteering(
            behavior: 0, origin: .zero, pilot: CGPoint(x: 120, y: 0),
            elapsed: 2, phase: 1, ranged: false, aiming: false)
        let raiderMotion = CombatRules.enemySteering(
            behavior: 2, origin: .zero, pilot: CGPoint(x: 120, y: 0),
            elapsed: 2, phase: 1, ranged: false, aiming: false)
        let shooterMotion = CombatRules.enemySteering(
            behavior: 4, origin: .zero, pilot: CGPoint(x: 120, y: 0),
            elapsed: 2, phase: 1, ranged: true, aiming: false)
        precondition(gruntMotion.dx == 1 && gruntMotion.dy == 0)
        precondition(abs(raiderMotion.dy) > 0.05)
        precondition(shooterMotion.dx < 0 && abs(shooterMotion.dy) > 0.05)
        for role in 0...5 {
            let motion = CombatRules.enemySteering(
                behavior: role, origin: .zero,
                pilot: CGPoint(x: 120, y: 0),
                elapsed: 3, phase: 1.1, ranged: role >= 4,
                aiming: false)
            precondition(hypot(motion.dx, motion.dy) <= 1.001)
        }
        precondition(CombatRules.enemySteering(
            behavior: 4, origin: .zero, pilot: CGPoint(x: 120, y: 0),
            elapsed: 3, phase: 1, ranged: true, aiming: true).dx == 0)
        // Balanced encounters must be deterministic and evolve from simple
        // patrols to flanking groups, separated ranged fire and siege units.
        precondition(EncounterDirector.style(room: 1) == .patrol)
        precondition(EncounterDirector.style(room: 4) == .flank)
        precondition(EncounterDirector.style(room: 6) == .crossfire)
        precondition(EncounterDirector.style(room: 12) == .siege)
        precondition(EncounterDirector.style(room: 20) == .boss)
        precondition(EncounterDirector.spawnLane(room: 4, slot: 0) == .left)
        precondition(EncounterDirector.spawnLane(room: 4, slot: 2) == .right)
        precondition(EncounterDirector.spawnLane(room: 6, slot: 0) == .left)
        precondition(EncounterDirector.spawnLane(room: 6, slot: 1) == .right)
        for world in 0..<WorldCatalog.playableCount {
            for room in 1...5 {
                for slot in 0..<CampaignPacing.targetEnemies(room: room) {
                    let role = WorldCatalog.enemyType(
                        world: world, room: room,
                        roll: EncounterDirector.enemyRoll(
                            world: world, room: room, slot: slot))
                    precondition(role < 3, "No armored or ranged unit during tutorial rooms")
                }
            }
            for room in 6...19 {
                let types = (0..<CampaignPacing.targetEnemies(room: room)).map {
                    WorldCatalog.enemyType(world: world, room: room,
                        roll: EncounterDirector.enemyRoll(
                            world: world, room: room, slot: $0))
                }
                let rangedCount = types.filter { $0 >= 4 }.count
                precondition(rangedCount <= (types.count + 2) / 3,
                             "Ranged enemies must never dominate an encounter")
                if EncounterDirector.style(room: room) == .crossfire {
                    precondition(types.contains(4),
                                 "Crossfire rooms must contain ranged attackers")
                }
                if EncounterDirector.style(room: room) == .siege {
                    precondition(types.contains(5),
                                 "Siege rooms must contain telegraphed mortars")
                }
            }
        }
        // True gameplay modifiers, not just alternate effect colors.
        precondition(AbilitySynergies.chainReach(chain: 0, incendiary: 3) == 0)
        precondition(AbilitySynergies.chainReach(chain: 1, incendiary: 0) == 115)
        precondition(AbilitySynergies.chainReach(chain: 2, incendiary: 1) == 144)
        precondition(AbilitySynergies.chainReach(chain: 3, incendiary: 3) == 150)
        precondition(AbilitySynergies.conductiveBonus(
            chain: 2, incendiary: 1, burning: true) == 3)
        precondition(AbilitySynergies.conductiveBonus(
            chain: 2, incendiary: 1, burning: false) == 0)
        precondition(AbilitySynergies.thermiteBonus(
            explosive: 2, incendiary: 1, burning: false) == 2)
        precondition(AbilitySynergies.thermiteBonus(
            explosive: 2, incendiary: 1, burning: true) == 4)
        precondition(AbilitySynergies.thermiteBonus(
            explosive: 0, incendiary: 1, burning: true) == 0)
        precondition(AbilitySynergies.burnDuration(
            incendiary: 0, explosive: 3) == 0)
        precondition(AbilitySynergies.burnDuration(
            incendiary: 1, explosive: 0) == 2.5)
        precondition(AbilitySynergies.burnDuration(
            incendiary: 1, explosive: 1) == 3.25)
        precondition(AbilitySynergies.bladeArcDamage(chain: 0, orbit: 3) == 0)
        precondition(AbilitySynergies.bladeArcDamage(chain: 1, orbit: 1) == 2)
        precondition(AbilitySynergies.bladeArcDamage(chain: 3, orbit: 3) == 4)
        precondition(AbilitySynergies.bladeArcReach(chain: 3, orbit: 3) == 89)
        precondition(AbilitySynergies.bladeArcCooldown >= 1.2)
        precondition(AbilitySynergies.preview(
            ability: "incendiary", chain: 0, explosive: 1,
            incendiary: 0, orbit: 0) == "COMBO: THERMITE BURST")
        precondition(AbilitySynergies.preview(
            ability: "orbit", chain: 1, explosive: 0,
            incendiary: 0, orbit: 0) == "COMBO: ARC BLADES")
        precondition(AbilitySynergies.preview(
            ability: "chain", chain: 0, explosive: 0,
            incendiary: 1, orbit: 0) == "COMBO: VOLTAIC FLAMES")
        precondition(AbilitySynergies.preview(
            ability: "orbit", chain: 0, explosive: 0,
            incendiary: 0, orbit: 0) == nil)
        // Early level-up menus guarantee tactical agency, with combos
        // prioritized when another equipped module already has ranks.
        precondition(AbilitySynergies.featuredTactical(
            available: ["chain", "incendiary", "orbit"],
            characterLevel: 2, chain: 0, explosive: 0,
            incendiary: 0, orbit: 0) == "chain")
        precondition(AbilitySynergies.featuredTactical(
            available: ["chain", "incendiary", "orbit"],
            characterLevel: 3, chain: 1, explosive: 0,
            incendiary: 0, orbit: 0) == "incendiary")
        precondition(AbilitySynergies.featuredTactical(
            available: ["chain", "explosive"],
            characterLevel: 9, chain: 0, explosive: 0,
            incendiary: 0, orbit: 0) == nil)
        precondition(AbilitySynergies.featuredTactical(
            available: [], characterLevel: 2, chain: 0,
            explosive: 0, incendiary: 0, orbit: 0) == nil)
        // A single target scan must select the closest active enemy,
        // ignore spawning/dead enemies and respect the rifle's 260pt range.
        let positions = [
            CGPoint(x: 0, y: 90), CGPoint(x: 0, y: 15),
            CGPoint(x: 0, y: 25), CGPoint(x: 300, y: 0),
            CGPoint(x: 0, y: 15)
        ]
        let active = [true, false, true, true, true]
        let nearest = CombatRules.nearestActiveTarget(
            count: positions.count, origin: .zero, range: 260,
            isActive: { active[$0] }, position: { positions[$0] })
        precondition(nearest == 4, "Nearest active target should win")
        precondition(CombatRules.nearestActiveTarget(
            count: positions.count, origin: .zero, range: 260,
            isActive: { $0 == 2 || $0 == 4 }, position: { positions[$0] }) == 4)
        precondition(CombatRules.nearestActiveTarget(
            count: positions.count, origin: .zero, range: 10,
            isActive: { active[$0] }, position: { positions[$0] }) == nil)
        precondition(CombatRules.nearestActiveTarget(
            count: 0, origin: .zero, range: 260,
            isActive: { _ in true }, position: { _ in .zero }) == nil)
        precondition(CombatRules.nearestActiveTarget(
            count: positions.count, origin: .zero, range: 260,
            isActive: { _ in false }, position: { positions[$0] }) == nil)
        // Tidal Warden side shots must be symmetric about a visible center
        // line, with enough angular separation to dodge them.
        let fanOrigin = CGPoint(x: 50, y: 80)
        let fan = CombatRules.wardenVolleyTargets(
            origin: fanOrigin, target: CGPoint(x: 50, y: 220))
        precondition(fan.count == 3)
        precondition(abs(fan[1].x - 50) < 0.001)
        precondition(abs(fan[1].y - 220) < 0.001)
        precondition(abs(fan[0].x + fan[2].x - 100) < 0.001)
        precondition(abs(fan[0].y - fan[2].y) < 0.001)
        precondition(fan[0].x > 50 && fan[2].x < 50)
        // The telegraphed mortar ring reaches impact on combat time even when
        // the entire simulation runs at twice the ordinary wall-clock pace.
        precondition(CombatRules.mortarWarningScale(elapsed: 0, flightTime: 1.4) == 1)
        precondition(abs(CombatRules.mortarWarningScale(elapsed: 0.7, flightTime: 1.4) - 0.59) < 0.001)
        precondition(abs(CombatRules.mortarWarningScale(elapsed: 1.4, flightTime: 1.4) - 0.18) < 0.001)
        precondition(abs(CombatRules.mortarWarningScale(elapsed: 5, flightTime: 1.4) - 0.18) < 0.001)
        // Attack windows shorten gradually, while never becoming instant.
        precondition(CombatRules.shooterTelegraph(room: 1) == 0.7)
        precondition(CombatRules.shooterTelegraph(room: 20) >= 0.48)
        precondition(CombatRules.shooterTelegraph(room: 20) < CombatRules.shooterTelegraph(room: 6))
        precondition(CombatRules.shooterCooldown(room: 20) < CombatRules.shooterCooldown(room: 6))
        precondition(CombatRules.lobberCooldown(room: 20) < CombatRules.lobberCooldown(room: 11))
        precondition(CombatRules.lobberCooldown(room: 20) >= 2.8)
        // The first ranged rooms should be manageable with a fresh character.
        let rangedEarly = (0..<100).filter { CombatRules.enemyType(room: 6, roll: $0) >= 4 }.count
        let rangedMid = (0..<100).filter { CombatRules.enemyType(room: 11, roll: $0) >= 4 }.count
        let rangedLast = (0..<100).filter { CombatRules.enemyType(room: 19, roll: $0) >= 4 }.count
        precondition(rangedEarly <= 25)
        precondition(rangedMid > rangedEarly && rangedMid < rangedLast)
        precondition(rangedLast <= 55)
        // Room 1-5 remain melee-only; later rooms introduce progressively more ranged pressure.
        let shootersEarly = (0..<100).filter { CombatRules.enemyType(room: 6, roll: $0) == 4 }.count
        let shootersLate = (0..<100).filter { CombatRules.enemyType(room: 19, roll: $0) == 4 }.count
        let lobbersEarly = (0..<100).filter { CombatRules.enemyType(room: 11, roll: $0) == 5 }.count
        let lobbersLate = (0..<100).filter { CombatRules.enemyType(room: 19, roll: $0) == 5 }.count
        precondition(shootersLate > shootersEarly - lobbersLate)
        precondition(lobbersLate > lobbersEarly)
        precondition(CombatRules.projectileHits(from: .zero, to: CGPoint(x: 100, y: 0), pilot: CGPoint(x: 50, y: 0), radius: 20))
        precondition(!CombatRules.projectileHits(from: .zero, to: CGPoint(x: 100, y: 0), pilot: CGPoint(x: 50, y: 30), radius: 20))
        precondition(CombatRules.orbitalBladeHits(blade: CGPoint(x: 46, y: 0),
                                                 enemy: CGPoint(x: 62, y: 0), enemyRadius: 10))
        precondition(!CombatRules.orbitalBladeHits(blade: CGPoint(x: 46, y: 0),
                                                  enemy: CGPoint(x: 80, y: 0), enemyRadius: 10))
        precondition(CombatRules.blastHits(center: .zero, pilot: CGPoint(x: 20, y: 0), radius: 43))
        precondition(!CombatRules.blastHits(center: .zero, pilot: CGPoint(x: 70, y: 0), radius: 43))
        print("XP carryover, queued choices, run reset, damage ratings, paused attacks, enemy rollout and dodging passed")
    }
}
