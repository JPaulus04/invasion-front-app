import Foundation
import CoreGraphics

@main
struct ProgressCombatTests {
    static func main() {
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
        precondition(CombatRules.enemyType(room: 11, roll: 10) == 5)
        precondition(CombatRules.enemyType(room: 11, roll: 30) == 4)
        precondition(CombatRules.projectileHits(from: .zero, to: CGPoint(x: 100, y: 0), pilot: CGPoint(x: 50, y: 0), radius: 20))
        precondition(!CombatRules.projectileHits(from: .zero, to: CGPoint(x: 100, y: 0), pilot: CGPoint(x: 50, y: 30), radius: 20))
        precondition(CombatRules.blastHits(center: .zero, pilot: CGPoint(x: 20, y: 0), radius: 43))
        precondition(!CombatRules.blastHits(center: .zero, pilot: CGPoint(x: 70, y: 0), radius: 43))
        print("XP carryover, queued choices, run reset, damage ratings, paused attacks, enemy rollout and dodging passed")
    }
}
