import Foundation
import CoreGraphics

@main
struct QACombatDriverTests {
    static func main() {
        let origin = CGPoint(x: 250, y: 250)
        let bounds = CGRect(x: 0, y: 0, width: 500, height: 500)
        func target(_ threats: [QACombatDriver.Threat],
                    warnings: [QACombatDriver.AimWarning] = [],
                    goal: CGPoint = CGPoint(x: 250, y: 250),
                    resolve: (CGPoint, CGPoint) -> CGPoint = { _, to in to }) -> CGPoint {
            QACombatDriver.target(origin: origin, speed: 180, bounds: bounds,
                                  threats: threats, aimWarnings: warnings,
                                  goal: goal, previous: nil, resolve: resolve)
        }
        let pickup = target([], goal: CGPoint(x: 400, y: 250))
        precondition(pickup.x > origin.x, "Approach XP when safe")
        let shot = QACombatDriver.Threat(position: CGPoint(x: 300, y: 250),
                                        velocity: CGVector(dx: -145, dy: 0), radius: 24)
        let dodge = target([shot], goal: CGPoint(x: 400, y: 250))
        // Test the entire relative-motion segment, not a preferred direction.
        // Retreat is valid when the pilot can outrun the projectile.
        func clearance(endpoint: CGPoint, shot: QACombatDriver.Threat) -> CGFloat {
            let horizon: CGFloat = 0.9
            let rx = origin.x - shot.position.x
            let ry = origin.y - shot.position.y
            let vx = (endpoint.x - origin.x) / horizon - shot.velocity.dx
            let vy = (endpoint.y - origin.y) / horizon - shot.velocity.dy
            let speedSquared = vx * vx + vy * vy
            let closest = speedSquared > 0
                ? min(horizon, max(0, -(rx * vx + ry * vy) / speedSquared)) : 0
            return hypot(rx + vx * closest, ry + vy * closest) - shot.radius
        }
        precondition(clearance(endpoint: dodge, shot: shot) > 0,
                     "Avoid incoming fire throughout the movement, including retreat")
        precondition(clearance(endpoint: pickup, shot: shot) < 0,
                     "Fixture must make directly chasing XP unsafe")
        let fastShot = QACombatDriver.Threat(position: CGPoint(x: 330, y: 250),
                                            velocity: CGVector(dx: -300, dy: 0), radius: 24)
        let fastDodge = target([fastShot], goal: CGPoint(x: 400, y: 250))
        precondition(clearance(endpoint: fastDodge, shot: fastShot) > 0,
                     "Avoid a projectile that is faster than the pilot")
        print("Dodge clearance: slow=\(clearance(endpoint: dodge, shot: shot)), fast=\(clearance(endpoint: fastDodge, shot: fastShot))")
        let mortar = QACombatDriver.Threat(position: origin, velocity: .zero, radius: 45)
        let escape = target([mortar])
        precondition(hypot(escape.x - origin.x, escape.y - origin.y) > 45,
                     "Leave visible blast radius")
        // A visible locked aiming line must change the planned route.
        let warning = QACombatDriver.AimWarning(
            origin: CGPoint(x: 250, y: 425), target: origin,
            radius: 28, firesIn: 0.45)
        let unaware = target([], goal: CGPoint(x: 250, y: 400))
        let warned = target([], warnings: [warning], goal: CGPoint(x: 250, y: 400))
        func laneClearance(_ point: CGPoint) -> CGFloat {
            let nearestY = min(505, max(250, point.y))
            return hypot(point.x - 250, point.y - nearestY) - warning.radius
        }
        precondition(laneClearance(warned) > laneClearance(unaware) + 15,
                     "React to the visible aiming line before firing")
        precondition(hypot(warned.x - origin.x, warned.y - origin.y) <= 180 * 0.9 + 0.001,
                     "Warning dodge must respect player speed")
        let blocked = target([], goal: CGPoint(x: 400, y: 250), resolve: { from, _ in from })
        precondition(blocked == origin, "Never bypass collision resolution")
        let corner = CGPoint(x: 18, y: 18)
        let leaveCorner = QACombatDriver.target(origin: corner, speed: 180, bounds: bounds,
            threats: [], goal: corner, previous: nil, resolve: { _, to in to })
        precondition(leaveCorner.x > 90 && leaveCorner.y > 90,
                     "Do not chase an edge pickup into a corner with no escape space")
        precondition(hypot(dodge.x - origin.x, dodge.y - origin.y) <= 180 * 0.9 + 0.001,
                     "Never exceed normal movement speed")
        print("PASS: QA steering threat avoidance, pickups, collision and speed")
    }
}
