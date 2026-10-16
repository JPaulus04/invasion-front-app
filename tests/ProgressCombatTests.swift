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
        // Locked loadouts constrain tactical upgrades in every level-up menu.
        var loadout = AbilityLoadout()
        precondition(!loadout.isReady)
        precondition(!loadout.toggle("invalid"))
        precondition(loadout.toggle("chain"))
        precondition(loadout.toggle("explosive"))
        precondition(loadout.toggle("orbit"))
        precondition(loadout.isReady)
        precondition(!loadout.toggle("incendiary"))
        precondition(loadout.selected == ["chain", "explosive", "orbit"])
        precondition(loadout.availableTacticalUpgrades(
            chain: 0, explosive: 0, incendiary: 0, orbit: 0
        ) == ["chain", "explosive", "orbit"])
        precondition(loadout.availableTacticalUpgrades(
            chain: 3, explosive: 2, incendiary: 0, orbit: 3
        ) == ["explosive"])
        precondition(loadout.toggle("explosive"))
        precondition(!loadout.isReady)
        precondition(loadout.toggle("incendiary"))
        precondition(loadout.selected == ["chain", "orbit", "incendiary"])
        precondition(AbilityLoadout(selected: ["orbit", "orbit", "invalid", "chain"])
                     .selected == ["orbit", "chain"])
        // Salvage survives failed attempts, and purchase benefits are
        // independent of run XP and exclusive world-core currency.
        let suite = "outpost.zero.progression.test"
        let store = UserDefaults(suiteName: suite)!
        store.removePersistentDomain(forName: suite)
        let permanent = PersistentProgression(storage: store)
        precondition(permanent.salvage == 0 && permanent.rank("weapon") == 0)
        precondition(!permanent.purchase("weapon"))
        precondition(permanent.bank(-25) == 0)
        precondition(permanent.bank(64) == 64)
        precondition(!permanent.purchase("weapon"))
        precondition(permanent.bank(1) == 1)
        precondition(permanent.purchase("weapon"))
        precondition(permanent.salvage == 0 && permanent.rank("weapon") == 1)
        precondition(permanent.cost("weapon") == 130)
        precondition(!permanent.purchase("invalid"))
        precondition(permanent.bank(300) == 300)
        precondition(permanent.purchase("armor"))
        precondition(permanent.purchase("chain"))
        precondition(permanent.rank("armor") == 1 && permanent.rank("chain") == 1)
        let restarted = PersistentProgression(storage: store)
        precondition(restarted.rank("weapon") == 1 && restarted.rank("chain") == 1)
        precondition(restarted.salvage == permanent.salvage)
        precondition(PersistentProgression.roomReward(room: 12) >
                     PersistentProgression.roomReward(room: 3))
        precondition(PersistentProgression.enemyReward(isHeavy: false, isBoss: true) >
                     PersistentProgression.enemyReward(isHeavy: false, isBoss: false))
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
            orbitLevel: 2, runArmor: 20, checkpointUsed: false,
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
                     reopened?.progress.level == 2 &&
                     reopened?.abilities == ["chain", "incendiary", "orbit"])
        let bad = RunSnapshot(
            version: 999, worldIndex: 0, room: 12, location: .battle,
            health: 21, coins: 1506, damage: 4, fireRate: 3,
            chainLevel: 1, explosiveLevel: 0, incendiaryLevel: 1,
            orbitLevel: 2, runArmor: 20, checkpointUsed: false,
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
            orbitLevel: 3, runArmor: 80, checkpointUsed: true,
            progress: restoredProgress,
            abilities: ["chain", "incendiary", "orbit"],
            earnedSalvage: 1100, roomSalvageCredit: 88,
            roomCoinCredit: 42, roomXPCredit: 62)
        precondition(completedRoom.isValid && recover.save(completedRoom))
        precondition(recover.load()?.location == .clearedGate)
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
        run.recordDamage(40)
        precondition(run.stars == 1 && run.damageTaken == 51)
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
