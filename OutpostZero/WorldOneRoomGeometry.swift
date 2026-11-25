import CoreGraphics

/// Build 337 authored room geometry. All distances are in SpriteKit world points,
/// never source-image pixels. These layouts now drive live room bounds,
/// entry and authored objective placement; gameplay verification is required.
enum WorldOneRoomGeometry {
    enum Kind: Equatable {
        case passage, survival, defense, rootLord
    }

    struct Layout {
        var artFamily: String {
            switch kind {
            case .passage: return "ruined_outpost"
            case .survival: return "swamp_basin"
            case .defense: return "toxic_caves"
            case .rootLord: return "boss_arena"
            }
        }

        /// Forward routes reserve more screen space for threats ahead. Open
        /// survival/defense arenas retain centered, multidirectional tracking.
        func cameraTarget(for pilot: CGPoint) -> CGPoint {
            let u = unit
            let lead: CGFloat = kind == .passage ? 2*u : (kind == .rootLord ? 4*u : 0)
            return CGPoint(x: pilot.x, y: pilot.y + lead)
        }

        /// Solid boundary shoulders leave a continuous central route and open
        /// into the authored combat pockets. Rendering and navigation share these.
        var boundaryObstacles: [CGRect] {
            guard kind == .passage else { return [] }
            let u = unit
            let segments: [(CGFloat, CGFloat, CGFloat)] = [
                (0, combatPockets[0].minY, 3*u),
                (combatPockets[0].minY, combatPockets[0].maxY, u),
                (combatPockets[0].maxY, combatPockets[1].minY, 3*u),
                (combatPockets[1].minY, combatPockets[1].maxY, u),
                (combatPockets[1].maxY, bounds.height, 3*u)
            ]
            return segments.flatMap { low, high, inset in
                [CGRect(x: bounds.minX, y: bounds.minY + low, width: inset, height: high-low),
                 CGRect(x: bounds.maxX-inset, y: bounds.minY + low, width: inset, height: high-low)]
            }
        }

        let kind: Kind
        let unit: CGFloat
        let bounds: CGRect
        let entry: CGPoint
        let exit: CGPoint?
        let combatPockets: [CGRect]
        let objective: CGPoint?
        let approachPoints: [CGPoint]
        let decorationExclusion: CGRect
    }

    private static func kind(encounter: Encounter) -> Kind {
        switch encounter {
        case .tactical: return .passage
        case .survival: return .survival
        case .equipmentDefense: return .defense
        case .finalBoss: return .rootLord
        }
    }

    enum Encounter { case tactical, survival, equipmentDefense, finalBoss }

    /// A layout contract, not an arena resizing operation. The caller supplies
    /// a fixed world-space unit (typically the live player's collision width).
    static func make(room: Int, playerWidth: CGFloat,
                     encounter: Encounter) -> Layout {
        precondition(room > 0)
        precondition(playerWidth > 0 && playerWidth.isFinite)
        let kind = kind(encounter: encounter)
        let u = playerWidth
        switch kind {
        case .passage:
            // Passage is elongated with two wider pockets, not a compact arena.
            // Comparable area, distinct route/clearing silhouettes. Encounter
            // schedule, actor sizes, camera zoom and objective rules are unchanged.
            let dimensions: [(CGFloat, CGFloat)] = [(13,38),(17,29),(19,26),(15,33),(21,24),(18,28)]
            let shape = dimensions[(room-1)%dimensions.count]
            let b = CGRect(x: 0, y: 0, width: shape.0*u, height: shape.1*u)
            let pockets = [
                CGRect(x: u, y: b.height*9/38, width: b.width-2*u, height: b.height*7/38),
                CGRect(x: u, y: b.height*24/38, width: b.width-2*u, height: b.height*7/38)
            ]
            return Layout(kind: kind, unit: u, bounds: b,
                entry: CGPoint(x: b.midX, y: 2*u),
                exit: CGPoint(x: b.midX, y: b.maxY - 14),
                combatPockets: pockets, objective: nil,
                approachPoints: [CGPoint(x: b.midX, y: pockets[0].midY),
                                 CGPoint(x: b.midX, y: pockets[1].midY)],
                decorationExclusion: b.insetBy(dx: 2*u, dy: 2*u))
        case .survival:
            let b = CGRect(x: 0, y: 0, width: 33*u, height: 29*u)
            return Layout(kind: kind, unit: u, bounds: b,
                entry: CGPoint(x: b.midX, y: 4*u), exit: nil,
                combatPockets: [b.insetBy(dx: 4*u, dy: 4*u)],
                objective: nil,
                approachPoints: [
                    CGPoint(x: 2*u, y: b.midY), CGPoint(x: b.maxX-2*u, y: b.midY),
                    CGPoint(x: b.midX, y: b.maxY-2*u), CGPoint(x: b.midX, y: 2*u)],
                decorationExclusion: b.insetBy(dx: 4*u, dy: 4*u))
        case .defense:
            let b = CGRect(x: 0, y: 0, width: 27*u, height: 27*u)
            return Layout(kind: kind, unit: u, bounds: b,
                entry: CGPoint(x: b.midX, y: 3*u), exit: nil,
                combatPockets: [b.insetBy(dx: 3*u, dy: 3*u)],
                objective: CGPoint(x: b.midX, y: b.midY),
                approachPoints: [
                    CGPoint(x: 2*u, y: b.midY), CGPoint(x: b.maxX-2*u, y: b.midY),
                    CGPoint(x: b.midX, y: b.maxY-2*u)],
                decorationExclusion: b.insetBy(dx: 3*u, dy: 3*u))
        case .rootLord:
            let b = CGRect(x: 0, y: 0, width: 37*u, height: 32*u)
            let bossPosition = CGPoint(x: b.midX, y: b.maxY - 13*u)
            return Layout(kind: kind, unit: u, bounds: b,
                entry: CGPoint(x: b.midX, y: 3*u), exit: nil,
                combatPockets: [b.insetBy(dx: 5*u, dy: 5*u)],
                objective: bossPosition, approachPoints: [bossPosition],
                decorationExclusion: b.insetBy(dx: 5*u, dy: 5*u))
        }
    }
}
