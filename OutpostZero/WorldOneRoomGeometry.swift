import CoreGraphics

/// Build 337 authored room geometry. All distances are in SpriteKit world points,
/// never source-image pixels. This planner deliberately does not modify combat
/// or collision until its camera and path clearances have been simulator-tested.
enum WorldOneRoomGeometry {
    enum Kind: Equatable {
        case passage, survival, defense, rootLord
    }

    struct Layout {
        let kind: Kind
        let bounds: CGRect
        let entry: CGPoint
        let exit: CGPoint?
        let combatPockets: [CGRect]
        let objective: CGPoint?
        let approachPoints: [CGPoint]
        let decorationExclusion: CGRect
    }

    static func kind(room: Int, encounter: Encounter) -> Kind {
        if room == 20 { return .rootLord }
        switch encounter {
        case .tactical: return .passage
        case .survival: return .survival
        case .equipmentDefense: return .defense
        }
    }

    enum Encounter { case tactical, survival, equipmentDefense }

    /// A layout contract, not an arena resizing operation. The caller supplies
    /// a fixed world-space unit (typically the live player's collision width).
    static func make(room: Int, playerWidth: CGFloat,
                     encounter: Encounter) -> Layout {
        precondition((1...20).contains(room))
        precondition(playerWidth > 0 && playerWidth.isFinite)
        let kind = kind(room: room, encounter: encounter)
        let u = playerWidth
        switch kind {
        case .passage:
            // Passage is elongated with two wider pockets, not a compact arena.
            let b = CGRect(x: 0, y: 0, width: 13*u, height: 38*u)
            let pockets = [
                CGRect(x: 1*u, y: 9*u, width: 11*u, height: 7*u),
                CGRect(x: 1*u, y: 24*u, width: 11*u, height: 7*u)
            ]
            return Layout(kind: kind, bounds: b,
                entry: CGPoint(x: b.midX, y: 2*u),
                exit: CGPoint(x: b.midX, y: 36*u),
                combatPockets: pockets, objective: nil,
                approachPoints: [CGPoint(x: b.midX, y: 12*u),
                                 CGPoint(x: b.midX, y: 27*u)],
                decorationExclusion: b.insetBy(dx: 2*u, dy: 2*u))
        case .survival:
            let b = CGRect(x: 0, y: 0, width: 33*u, height: 29*u)
            return Layout(kind: kind, bounds: b,
                entry: CGPoint(x: b.midX, y: 4*u), exit: nil,
                combatPockets: [b.insetBy(dx: 4*u, dy: 4*u)],
                objective: nil,
                approachPoints: [
                    CGPoint(x: 2*u, y: b.midY), CGPoint(x: b.maxX-2*u, y: b.midY),
                    CGPoint(x: b.midX, y: b.maxY-2*u), CGPoint(x: b.midX, y: 2*u)],
                decorationExclusion: b.insetBy(dx: 4*u, dy: 4*u))
        case .defense:
            let b = CGRect(x: 0, y: 0, width: 27*u, height: 27*u)
            return Layout(kind: kind, bounds: b,
                entry: CGPoint(x: b.midX, y: 3*u), exit: nil,
                combatPockets: [b.insetBy(dx: 3*u, dy: 3*u)],
                objective: CGPoint(x: b.midX, y: b.midY),
                approachPoints: [
                    CGPoint(x: 2*u, y: b.midY), CGPoint(x: b.maxX-2*u, y: b.midY),
                    CGPoint(x: b.midX, y: b.maxY-2*u)],
                decorationExclusion: b.insetBy(dx: 3*u, dy: 3*u))
        case .rootLord:
            let b = CGRect(x: 0, y: 0, width: 37*u, height: 32*u)
            return Layout(kind: kind, bounds: b,
                entry: CGPoint(x: b.midX, y: 3*u), exit: nil,
                combatPockets: [b.insetBy(dx: 5*u, dy: 5*u)],
                objective: CGPoint(x: b.midX, y: b.maxY-9*u),
                approachPoints: [CGPoint(x: b.midX, y: b.maxY-9*u)],
                decorationExclusion: b.insetBy(dx: 5*u, dy: 5*u))
        }
    }
}
