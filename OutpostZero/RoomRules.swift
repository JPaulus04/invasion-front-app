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

    /// A room advances only when the character actually steps into the open
    /// portal, not when approaching from almost a character-length away.
    static func enteredGate(pilot: CGPoint, gate: CGPoint) -> Bool {
        abs(pilot.x - gate.x) <= 36 &&
        pilot.y >= gate.y - 14 &&
        pilot.y <= gate.y + 36
    }

    static func isCleared(spawned: Int, target: Int, living: Int) -> Bool {
        target > 0 && spawned == target && living == 0
    }
}


/// Expanded survival battlefield and constrained camera geometry.
///
/// All geometry is expressed in the SAME world space as the existing battle
/// scene. The HUD and menus stay rooted to SKScene; only the arena node moves.
/// The feature remains in QA preview until timed-survival rules are complete.
enum ArenaLayout {
    static func bounds(for viewportSize: CGSize) -> CGRect {
        let view = RoomRules.bounds(for: viewportSize)
        // Survival is broader than tactical play, but remains portrait-oriented.
        // Keep proportions stable across iPhone and iPad viewports.
        // Camera coverage tests require room-scale traversal in both axes.
        // The previous 1.28× width could not contain the visible viewport
        // at the arena edges and contradicted the survival layout contract.
        let width = view.width * 1.75
        let height = max(view.height * 1.65, width * 1.35)
        return CGRect(x: view.midX - width / 2, y: view.midY - height / 2,
                      width: width, height: height)
    }

    /// Arena translation that keeps the visible combat viewport covered by
    /// valid world space. A centered target stops tracking at the boundaries.
    static func offset(for pilot: CGPoint, viewportSize: CGSize) -> CGPoint {
        let view = RoomRules.bounds(for: viewportSize)
        let world = bounds(for: viewportSize)
        let requestedX = view.midX - pilot.x
        let requestedY = view.midY - pilot.y
        let minX = view.maxX - world.maxX
        let maxX = view.minX - world.minX
        let minY = view.maxY - world.maxY
        let maxY = view.minY - world.minY
        return CGPoint(x: min(max(requestedX, minX), maxX),
                       y: min(max(requestedY, minY), maxY))
    }

    static func visibleWorldRect(at offset: CGPoint,
                                 viewportSize: CGSize) -> CGRect {
        RoomRules.bounds(for: viewportSize).offsetBy(
            dx: -offset.x, dy: -offset.y)
    }

    static func follow(current: CGPoint, target: CGPoint,
                       frameDelta: TimeInterval) -> CGPoint {
        let alpha = CGFloat(min(1, max(0, frameDelta) * 7.5))
        return CGPoint(x: current.x + (target.x - current.x) * alpha,
                       y: current.y + (target.y - current.y) * alpha)
    }
}

/// Tactical camera keeps combat coordinates unchanged and leaves HUD in screen space.
enum CampaignCamera {
    static func offset(for pilot: CGPoint, viewportSize: CGSize) -> CGPoint {
        let room = RoomRules.bounds(for: viewportSize)
        let top = viewportSize.height - 140
        let bottom: CGFloat = 40
        let requested = viewportSize.height * 0.42 - pilot.y
        let lower = top - (room.maxY + 145)
        let upper = bottom - (room.minY - 110)
        return CGPoint(x: 0, y: min(max(requested, lower), upper))
    }
}

/// Build 335 presentation only. Never changes collision, spawn or encounter bounds.
/// Tactical rooms fit below the HUD; larger survival rooms use the SAME scale
/// and bounded follow. Portal headroom belongs to the world, not to HUD space.
enum WorldOneFraming {
    static func viewport(size: CGSize, safeTop: CGFloat, safeBottom: CGFloat) -> CGRect {
        let bottom = max(18, safeBottom + 12)
        return CGRect(x: 8, y: bottom, width: size.width - 16,
                      height: max(160, size.height - safeTop - 106 - bottom))
    }
    static func worldFrame(room: CGRect) -> CGRect {
        CGRect(x: room.minX - 20, y: room.minY - 34,
               width: room.width + 40, height: room.height + 166)
    }
    static func scale(size: CGSize, safeTop: CGFloat, safeBottom: CGFloat) -> CGFloat {
        let frame = worldFrame(room: RoomRules.bounds(for: size))
        let view = viewport(size: size, safeTop: safeTop, safeBottom: safeBottom)
        return min(0.90, min(view.width / frame.width, view.height / frame.height))
    }
    static func offset(pilot: CGPoint, room: CGRect, size: CGSize,
                       safeTop: CGFloat, safeBottom: CGFloat) -> CGPoint {
        let view = viewport(size: size, safeTop: safeTop, safeBottom: safeBottom)
        let frame = worldFrame(room: room)
        let zoom = scale(size: size, safeTop: safeTop, safeBottom: safeBottom)
        func axis(_ p: CGFloat, _ low: CGFloat, _ high: CGFloat,
                  _ vlow: CGFloat, _ vhigh: CGFloat) -> CGFloat {
            if (high - low) * zoom <= vhigh - vlow {
                return (vlow + vhigh) / 2 - (low + high) / 2 * zoom
            }
            return min(max((vlow + vhigh) / 2 - p * zoom, vhigh - high * zoom),
                       vlow - low * zoom)
        }
        return CGPoint(x: axis(pilot.x, frame.minX, frame.maxX, view.minX, view.maxX),
                       y: axis(pilot.y, frame.minY, frame.maxY, view.minY, view.maxY))
    }
    static func visibleWorldRect(offset: CGPoint, size: CGSize,
                                 safeTop: CGFloat, safeBottom: CGFloat) -> CGRect {
        let view = viewport(size: size, safeTop: safeTop, safeBottom: safeBottom)
        let zoom = scale(size: size, safeTop: safeTop, safeBottom: safeBottom)
        return CGRect(x: (view.minX - offset.x) / zoom, y: (view.minY - offset.y) / zoom,
                      width: view.width / zoom, height: view.height / zoom)
    }
}
