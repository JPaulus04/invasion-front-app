import Foundation
import CoreGraphics

/// Deterministic battlefield patches, independent of SpriteKit. The central
/// entrance-to-gate lane stays free of every hazard and obstacle.
enum TerrainHazards {
    enum Kind: String { case water, acid, rubble }

    struct Patch {
        let kind: Kind
        let frame: CGRect
        /// Shoreline coordinates in local half-frame units (-0.5 ... +0.5).
        /// Shared by drawing and hit testing: no circular graphic hiding an
        /// invisible rectangle, and no damage outside the actual spill.
        let outline: [CGPoint]

        func outlinePath() -> CGPath {
            let path = CGMutablePath()
            guard let first = outline.first else { return path }
            path.move(to: CGPoint(x: first.x * frame.width,
                                  y: first.y * frame.height))
            for vertex in outline.dropFirst() {
                path.addLine(to: CGPoint(x: vertex.x * frame.width,
                                         y: vertex.y * frame.height))
            }
            path.closeSubpath()
            return path
        }

        func contains(_ point: CGPoint, margin: CGFloat = 0) -> Bool {
            if kind == .rubble {
                return frame.insetBy(dx: -margin, dy: -margin).contains(point)
            }
            let local = CGPoint(x: point.x - frame.midX,
                                y: point.y - frame.midY)
            let profile = outlinePath()
            if profile.contains(local) { return true }
            guard margin > 0, outline.count >= 3 else { return false }
            // Clearance around the polygon is the distance to its real
            // shoreline, not an enlarged bounding rectangle.
            for index in outline.indices {
                let a = outline[index]
                let b = outline[(index + 1) % outline.count]
                let ax = a.x * frame.width
                let ay = a.y * frame.height
                let dx = (b.x - a.x) * frame.width
                let dy = (b.y - a.y) * frame.height
                let lengthSquared = dx * dx + dy * dy
                if lengthSquared < 0.0001 { continue }
                let fraction = max(0, min(1,
                    ((local.x - ax) * dx + (local.y - ay) * dy) / lengthSquared))
                let closeX = ax + fraction * dx
                let closeY = ay + fraction * dy
                if hypot(local.x - closeX, local.y - closeY) <= margin {
                    return true
                }
            }
            return false
        }
    }

    /// The first world intentionally stays hazard-free for baseline balance.
    /// Further worlds and the simulator preview use the same runtime rules.
    static func patches(world: Int, room: Int, bounds: CGRect,
                        preview: Bool = false) -> [Patch] {
        guard preview || world > 0 else { return [] }
        // Each non-forest world has a dedicated side-of-room terrain section:
        // a long, broken flood channel in World 2 and a leaking industrial
        // runoff trench in World 3. Their irregular banks vary by room but
        // leave the center corridor clear at every supported screen size.
        let alternate = room.isMultiple(of: 2)
        let water = patch(.water, x: 0.145, y: 0.425,
                          width: 0.39, height: 0.47,
                          bounds: bounds, alternate: alternate)
        let acid = patch(.acid, x: 0.855, y: 0.535,
                         width: 0.37, height: 0.45,
                         bounds: bounds, alternate: alternate)
        let barrier = patch(.rubble, x: alternate ? 0.18 : 0.21,
                            y: 0.79, width: 0.24, height: 0.11,
                            bounds: bounds, alternate: alternate)
        switch world {
        case 1: return [water, barrier] // Flooded Outpost: slowdown and blocked paths
        case 2: return [acid, barrier] // Toxic Crossing: pulsing acid without water slowdown
        default: return [water, acid, barrier]
        }
    }

    private static func patch(_ kind: Kind, x: CGFloat, y: CGFloat,
                              width: CGFloat, height: CGFloat,
                              bounds: CGRect, alternate: Bool) -> Patch {
        let w = bounds.width * width
        let h = bounds.height * height
        return Patch(kind: kind, frame: CGRect(
            x: bounds.minX + bounds.width * x - w / 2,
            y: bounds.minY + bounds.height * y - h / 2,
            width: w, height: h),
            outline: profile(for: kind, alternate: alternate))
    }

    private static func profile(for kind: Kind, alternate: Bool) -> [CGPoint] {
        func vertices(_ points: [(CGFloat, CGFloat)]) -> [CGPoint] {
            points.map { CGPoint(x: $0.0, y: $0.1) }
        }
        switch kind {
        case .water:
            // The bank is broken into bays and narrow inlets rather than
            // forming a symmetric oval. Water runs off the left room edge.
            return vertices(alternate ? [
                (-0.50, -0.50), (-0.23, -0.48), (0.13, -0.39),
                (0.39, -0.31), (0.30, -0.16), (0.46, 0.04),
                (0.29, 0.20), (0.42, 0.34), (0.17, 0.49),
                (-0.14, 0.44), (-0.36, 0.50), (-0.50, 0.43)
            ] : [
                (-0.50, -0.48), (-0.31, -0.50), (0.10, -0.42),
                (0.42, -0.32), (0.25, -0.14), (0.44, 0.02),
                (0.30, 0.17), (0.40, 0.36), (0.12, 0.48),
                (-0.10, 0.45), (-0.38, 0.50), (-0.50, 0.39)
            ])
        case .acid:
            // A ruptured containment route connected to the right-hand
            // machinery. Jagged interior edge gives tactical banks.
            return vertices(alternate ? [
                (-0.08, -0.50), (0.34, -0.46), (0.50, -0.49),
                (0.50, 0.48), (0.22, 0.43), (0.01, 0.50),
                (-0.32, 0.33), (-0.16, 0.18), (-0.44, -0.02),
                (-0.24, -0.13), (-0.43, -0.27), (-0.18, -0.39)
            ] : [
                (-0.18, -0.47), (0.27, -0.50), (0.50, -0.44),
                (0.50, 0.50), (0.26, 0.44), (0.04, 0.49),
                (-0.27, 0.36), (-0.13, 0.20), (-0.46, 0.03),
                (-0.24, -0.12), (-0.39, -0.30), (-0.12, -0.36)
            ])
        case .rubble:
            return []
        }
    }

    /// Deep water is a solid terrain boundary, not a slowdown zone. The
    /// same geometric outline controls collision and the visible shoreline.
    static func blocksMovement(_ point: CGPoint, patches: [Patch],
                               radius: CGFloat = 10) -> Bool {
        patches.contains {
            ($0.kind == .water || $0.kind == .rubble) &&
                $0.contains(point, margin: radius)
        }
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
        blocksMovement(point, patches: patches, radius: radius)
    }

    static func spawnAllowed(_ point: CGPoint, radius: CGFloat,
                             patches: [Patch]) -> Bool {
        !blocksMovement(point, patches: patches, radius: radius + 8)
    }

    /// Continuous swept collision checks prevent walking through narrow
    /// shoreline tips at 2× speed or when the game briefly drops a frame.
    /// Preserve smooth sliding along the water and rubble boundaries.
    static func resolveMovement(from current: CGPoint, to target: CGPoint,
                                patches: [Patch], radius: CGFloat = 10) -> CGPoint {
        let dx = target.x - current.x
        let dy = target.y - current.y
        let distance = hypot(dx, dy)
        if distance < 0.001 { return current }

        // Players who resume a save from the old slowdown implementation
        // must be able to walk out of water instead of being trapped inside.
        if let submerged = patches.first(where: {
            $0.kind == .water && $0.contains(current, margin: radius)
        }) {
            let oldDistance = hypot(current.x - submerged.frame.midX,
                                    current.y - submerged.frame.midY)
            let newDistance = hypot(target.x - submerged.frame.midX,
                                    target.y - submerged.frame.midY)
            if newDistance > oldDistance + 0.001 &&
                !patches.contains(where: {
                    $0.kind == .rubble && $0.contains(target, margin: radius)
                }) {
                return target
            }
        }

        func advance(from start: CGPoint, to end: CGPoint) -> CGPoint {
            let span = hypot(end.x - start.x, end.y - start.y)
            let steps = max(1, Int(ceil(span / max(3, radius * 0.4))))
            var last = start
            for index in 1...steps {
                let t = CGFloat(index) / CGFloat(steps)
                let p = CGPoint(x: start.x + (end.x - start.x) * t,
                                y: start.y + (end.y - start.y) * t)
                if blocksMovement(p, patches: patches, radius: radius) {
                    break
                }
                last = p
            }
            return last
        }
        let direct = advance(from: current, to: target)
        if hypot(direct.x - target.x, direct.y - target.y) < 0.001 {
            return direct
        }
        // After reaching the shoreline, spend unused motion sliding along
        // the longer requested axis rather than freezing at the edge.
        let remainingX = target.x - direct.x
        let remainingY = target.y - direct.y
        let firstX = abs(remainingX) >= abs(remainingY)
        let first = firstX
            ? CGPoint(x: target.x, y: direct.y)
            : CGPoint(x: direct.x, y: target.y)
        let slid = advance(from: direct, to: first)
        let second = firstX
            ? CGPoint(x: slid.x, y: target.y)
            : CGPoint(x: target.x, y: slid.y)
        return advance(from: slid, to: second)
    }
}
