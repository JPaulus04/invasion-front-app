import Foundation
import CoreGraphics

/// Run with the existing Swift test harness alongside CombatRules.swift.
enum CombatEvolutionGeometryTests {
    static func verifyEarlyEncounterVariety() {
        precondition(EncounterDirector.style(room: 1) == .patrol)
        precondition(EncounterDirector.style(room: 2) == .flank)
        precondition(EncounterDirector.style(room: 3) == .crossfire)
        precondition(EncounterDirector.style(room: 4) == .flank)
        precondition(EncounterDirector.style(room: 5) == .flank)
        precondition(EncounterDirector.style(room: 6) == .crossfire)
        precondition(EncounterDirector.style(room: 7) == .flank)
        precondition(EncounterDirector.style(room: 8) == .crossfire)
        precondition(EncounterDirector.style(room: 9) == .flank)
        precondition(EncounterDirector.style(room: 10) == .crossfire)
        // Verify the encounter label changes actual enemy composition.
        // Slots divisible by five remain the single telegraphed shooter.
        for room in 1...3 {
            precondition(EncounterDirector.enemyRoll(world: 0, room: room, slot: 0) < 15)
            for slot in 1...4 {
                precondition(EncounterDirector.enemyRoll(world: 0, room: room, slot: slot) >= 35)
            }
        }
        precondition(EncounterDirector.enemyRoll(world: 0, room: 1, slot: 2) < 60)
        precondition(EncounterDirector.enemyRoll(world: 0, room: 2, slot: 2) >= 60)
        precondition(EncounterDirector.enemyRoll(world: 0, room: 3, slot: 3) >= 60)
        precondition(EncounterDirector.spawnLane(room: 2, slot: 0) == .left)
        precondition(EncounterDirector.spawnLane(room: 2, slot: 2) == .right)
        precondition(EncounterDirector.spawnLane(room: 3, slot: 0) == .left)
        precondition(EncounterDirector.spawnLane(room: 3, slot: 1) == .right)
    }

    static func verifyRangedRepositioning() {
        let origin = CGPoint(x: 0, y: 0)
        let pilot = CGPoint(x: 180, y: 0)
        let left = CombatRules.enemySteering(
            behavior: 4, origin: origin, pilot: pilot,
            elapsed: 0, phase: .pi / 2, ranged: true, aiming: false)
        let right = CombatRules.enemySteering(
            behavior: 4, origin: origin, pilot: pilot,
            elapsed: 0, phase: -.pi / 2, ranged: true, aiming: false)
        precondition(left.dy > 0 && right.dy < 0,
                     "Ranged flankers must establish opposing firing angles")
        precondition(hypot(left.dx, left.dy) <= 1.001,
                     "Ranged steering must not exceed the enemy speed cap")
        let telegraph = CombatRules.enemySteering(
            behavior: 4, origin: origin, pilot: pilot,
            elapsed: 5, phase: .pi / 2, ranged: true, aiming: true)
        precondition(telegraph.dx == 0 && telegraph.dy == 0,
                     "Telegraphing shooters must remain stationary")
    }

    static func verifyEnergyWheelGeometry() {
        let pilot = CGPoint(x: 0, y: 0)
        func hit(_ x: CGFloat, _ radius: CGFloat = 10) -> Bool {
            CombatRules.energyWheelHits(
                pilot: pilot, enemy: CGPoint(x: x, y: 0),
                enemyRadius: radius, wheelRadius: 82, bandWidth: 14)
        }
        precondition(hit(82), "A foe on the ring must be struck")
        precondition(hit(65), "Enemy collision radius must count")
        precondition(hit(99), "Outer collision edge must count")
        precondition(!hit(0), "The hollow center must remain vulnerable")
        precondition(!hit(120), "Distant enemies must not be struck")
        precondition(!CombatRules.energyWheelHits(
            pilot: pilot, enemy: CGPoint(x: 82, y: 0),
            enemyRadius: 10, wheelRadius: 82, bandWidth: 0),
            "Zero-width effects must not deal damage")
    }
}
