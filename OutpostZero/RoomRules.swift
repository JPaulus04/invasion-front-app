import Foundation
import CoreGraphics

/// Shared room geometry and progression rules, independent of rendering.
enum RoomRules {
    static func bounds(for size: CGSize) -> CGRect {
        CGRect(x: 28, y: 70, width: max(120, size.width - 56), height: max(160, size.height - 295))
    }

    static func entryPoint(for size: CGSize) -> CGPoint {
        let room = bounds(for: size)
        return CGPoint(x: room.midX, y: room.minY + 25)
    }

    static func clamp(_ point: CGPoint, to rect: CGRect) -> CGPoint {
        CGPoint(x: min(max(point.x, rect.minX), rect.maxX),
                y: min(max(point.y, rect.minY), rect.maxY))
    }

    static func spawnPoint(in room: CGRect, radius: CGFloat, pilot: CGPoint,
                           candidates: [CGPoint]) -> CGPoint {
        // Include the health bar and warning ring in the spawn margin.
        let safe = room.insetBy(dx: radius + 10, dy: radius + 18)
        let points = candidates.map {
            CGPoint(x: safe.minX + min(max($0.x, 0), 1) * safe.width,
                    y: safe.minY + min(max($0.y, 0), 1) * safe.height)
        }
        let separation = radius + 75
        if let point = points.first(where: { hypot($0.x - pilot.x, $0.y - pilot.y) >= separation }) {
            return point
        }
        // A crowded entry must never force a spawn onto the player.
        let corners = [CGPoint(x: safe.minX, y: safe.minY), CGPoint(x: safe.maxX, y: safe.minY),
                       CGPoint(x: safe.minX, y: safe.maxY), CGPoint(x: safe.maxX, y: safe.maxY)]
        return corners.max(by: {
            hypot($0.x - pilot.x, $0.y - pilot.y) < hypot($1.x - pilot.x, $1.y - pilot.y)
        })!
    }

    static func isCleared(spawned: Int, target: Int, living: Int) -> Bool {
        target > 0 && spawned == target && living == 0
    }
}
