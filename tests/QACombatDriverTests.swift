import Foundation
import CoreGraphics

@main
struct QACombatDriverTests {
    static func main() {
        let origin = CGPoint(x: 250, y: 250)
        let bounds = CGRect(x: 0, y: 0, width: 500, height: 500)
        func target(_ threats: [QACombatDriver.Threat], goal: CGPoint = CGPoint(x: 250, y: 250),
                    resolve: (CGPoint, CGPoint) -> CGPoint = { _, to in to }) -> CGPoint {
            QACombatDriver.target(origin: origin, speed: 180, bounds: bounds,
                                  threats: threats, goal: goal, previous: nil, resolve: resolve)
        }
        let pickup = target([], goal: CGPoint(x: 400, y: 250))
        precondition(pickup.x > origin.x, "Approach XP when safe")
        let shot = QACombatDriver.Threat(position: CGPoint(x: 300, y: 250),
                                        velocity: CGVector(dx: -145, dy: 0), radius: 24)
        let dodge = target([shot], goal: CGPoint(x: 400, y: 250))
        precondition(abs(dodge.y - origin.y) > 20, "Sidestep incoming fire instead of chasing XP")
        let mortar = QACombatDriver.Threat(position: origin, velocity: .zero, radius: 45)
        let escape = target([mortar])
        precondition(hypot(escape.x - origin.x, escape.y - origin.y) > 45,
                     "Leave visible blast radius")
        let blocked = target([], goal: CGPoint(x: 400, y: 250), resolve: { from, _ in from })
        precondition(blocked == origin, "Never bypass collision resolution")
        precondition(hypot(dodge.x - origin.x, dodge.y - origin.y) <= 180 * 0.45 + 0.001,
                     "Never exceed normal movement speed")
        print("PASS: QA steering threat avoidance, pickups, collision and speed")
    }
}
