import Foundation
import CoreGraphics

/// Simulator driver geometry. This chooses inputs, never combat outcomes.
enum QACombatDriver {
    struct Threat {
        let position: CGPoint
        let velocity: CGVector
        let radius: CGFloat
    }

    static func target(origin: CGPoint, speed: CGFloat, bounds: CGRect,
                       threats: [Threat], goal: CGPoint,
                       previous: CGPoint?, resolve: (CGPoint, CGPoint) -> CGPoint) -> CGPoint {
        let horizon: CGFloat = 0.45
        var best = origin
        var bestScore = -CGFloat.greatestFiniteMagnitude
        // Include standing still so avoiding fire does not require constant motion.
        for index in 0...16 {
            let angle = CGFloat(index) * .pi / 8
            let velocity = index == 16 ? CGVector.zero
                : CGVector(dx: cos(angle) * speed, dy: sin(angle) * speed)
            var point = origin
            var risk: CGFloat = 0
            for sample in 1...6 {
                let dt = horizon / 6
                let requested = CGPoint(x: point.x + velocity.dx * dt,
                                        y: point.y + velocity.dy * dt)
                let clamped = CGPoint(x: min(max(requested.x, bounds.minX), bounds.maxX),
                                      y: min(max(requested.y, bounds.minY), bounds.maxY))
                point = resolve(point, clamped)
                let time = CGFloat(sample) * dt
                for threat in threats {
                    let x = threat.position.x + threat.velocity.dx * time
                    let y = threat.position.y + threat.velocity.dy * time
                    let clearance = hypot(point.x - x, point.y - y) - threat.radius
                    risk += max(0, 55 - clearance) * 2
                    if clearance < 0 { risk += 2000 }
                }
            }
            let edge = min(point.x - bounds.minX, bounds.maxX - point.x,
                           point.y - bounds.minY, bounds.maxY - point.y)
            var score = -risk - hypot(point.x - goal.x, point.y - goal.y) * 0.12
                - max(0, 35 - edge) * 2
            if let previous {
                score -= hypot(point.x - previous.x, point.y - previous.y) * 0.04
            }
            if score > bestScore { bestScore = score; best = point }
        }
        return best
    }
}
