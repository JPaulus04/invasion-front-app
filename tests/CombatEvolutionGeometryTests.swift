import Foundation
import CoreGraphics

/// Run with the existing Swift test harness alongside CombatRules.swift.
enum CombatEvolutionGeometryTests {
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
