import Foundation
import CoreGraphics

/// Deterministic battlefield patches, independent of SpriteKit. The central
/// entrance-to-gate lane stays free of every hazard and obstacle.
enum TerrainHazards {
    enum Kind: String { case water, acid, rubble }

    struct Patch {
        let kind: Kind
        let frame: CGRect

        func contains(_ point: CGPoint, margin: CGFloat = 0) -> Bool {
            if kind == .rubble {
                return frame.insetBy(dx: -margin, dy: -margin).contains(point)
            }
            // Water and acid render as elliptical pools; their interaction
            // regions must match the artwork instead of invisible rectangles.
            let radiusX = max(1, frame.width / 2 + margin)
            let radiusY = max(1, frame.height / 2 + margin)
            let x = (point.x - frame.midX) / radiusX
            let y = (point.y - frame.midY) / radiusY
            return x * x + y * y <= 1
        }
    }

    /// The first world intentionally stays hazard-free for baseline balance.
    /// Further worlds and the simulator preview use the same runtime rules.
    static func patches(world: Int, room: Int, bounds: CGRect,
                        preview: Bool = false) -> [Patch] {
        guard preview || world > 0 else { return [] }
        // Every patch is off the central 26%-wide safe corridor. Rotate
        // placement between rooms without ever trapping the entry or gate.
        let alternate = room.isMultiple(of: 2)
        let left: CGFloat = alternate ? 0.19 : 0.22
        let right: CGFloat = alternate ? 0.81 : 0.78
        let water = patch(.water, x: left, y: 0.34, width: 0.31, height: 0.16, bounds: bounds)
        let acid = patch(.acid, x: right, y: 0.59, width: 0.29, height: 0.16, bounds: bounds)
        let barrier = patch(.rubble, x: left, y: 0.76, width: 0.24, height: 0.11, bounds: bounds)
        switch world {
        case 1: return [water, acid, barrier]
        case 2: return [water, barrier] // Frozen region reserves acid for toxic zones
        default: return [water, acid, barrier]
        }
    }

    private static func patch(_ kind: Kind, x: CGFloat, y: CGFloat,
                              width: CGFloat, height: CGFloat,
                              bounds: CGRect) -> Patch {
        let w = bounds.width * width
        let h = bounds.height * height
        return Patch(kind: kind, frame: CGRect(
            x: bounds.minX + bounds.width * x - w / 2,
            y: bounds.minY + bounds.height * y - h / 2,
            width: w, height: h))
    }

    static func waterSpeed(at point: CGPoint, patches: [Patch]) -> CGFloat {
        patches.contains { $0.kind == .water && $0.contains(point) } ? 0.62 : 1
    }

    /// 2 seconds of visible warning, 3 seconds active, 1 second recovery.
    /// The same game clock controls visuals and damage at 1× and 2× speed.
    static func acidActive(at time: TimeInterval) -> Bool {
        let phase = max(0, time).truncatingRemainder(dividingBy: 6)
        return phase >= 2 && phase < 5
    }

    static func acidTouches(_ point: CGPoint, patches: [Patch],
                            at time: TimeInterval) -> Bool {
        acidActive(at: time) &&
            patches.contains { $0.kind == .acid && $0.contains(point) }
    }

    static func hitsObstacle(_ point: CGPoint, patches: [Patch],
                             radius: CGFloat = 10) -> Bool {
        patches.contains { $0.kind == .rubble && $0.contains(point, margin: radius) }
    }

    static func spawnAllowed(_ point: CGPoint, radius: CGFloat,
                             patches: [Patch]) -> Bool {
        !hitsObstacle(point, patches: patches, radius: radius + 8)
    }

    /// Sliding collision: try the requested movement, then each axis. A
    /// blocked direct step must never teleport the pilot through rubble.
    static func resolveMovement(from current: CGPoint, to target: CGPoint,
                                patches: [Patch], radius: CGFloat = 10) -> CGPoint {
        if !hitsObstacle(target, patches: patches, radius: radius) { return target }
        let alongX = CGPoint(x: target.x, y: current.y)
        let alongY = CGPoint(x: current.x, y: target.y)
        let dx = abs(target.x - current.x)
        let dy = abs(target.y - current.y)
        if dx >= dy {
            if !hitsObstacle(alongX, patches: patches, radius: radius) { return alongX }
            if !hitsObstacle(alongY, patches: patches, radius: radius) { return alongY }
        } else {
            if !hitsObstacle(alongY, patches: patches, radius: radius) { return alongY }
            if !hitsObstacle(alongX, patches: patches, radius: radius) { return alongX }
        }
        return current
    }
}
