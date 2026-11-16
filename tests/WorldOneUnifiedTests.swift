import Foundation
import CoreGraphics

@main
struct WorldOneUnifiedTests {
    static func main() throws {
        func aspect(_ name: String) -> CGFloat {
            let paths = ["OutpostZero/Assets.xcassets/\(name).imageset/\(name).png",
                         "OutpostZero/ArtAssets/\(name).png"]
            guard let data = paths.compactMap({ try? Data(contentsOf: URL(fileURLWithPath: $0)) }).first else {
                preconditionFailure("Missing actual scenery asset: \(name)")
            }
            func word(_ at: Int) -> UInt32 { data[at..<at+4].reduce(0) { ($0<<8)|UInt32($1) } }
            return CGFloat(word(16))/CGFloat(word(20))
        }
        var silhouettes = Set<String>()
        var propSignatures = Set<String>()
        for room in 1...20 {
            let kind = SurvivalEncounterRules.kind(world: 0, room: room)
            let encounter: WorldOneRoomGeometry.Encounter = kind == .survival ? .survival :
                (kind == .equipmentDefense ? .equipmentDefense : .tactical)
            let layout = WorldOneRoomGeometry.make(room: room, playerWidth: 28, encounter: encounter)
            let origin = CGPoint(x: -137, y: 41)
            let plan = WorldOneEnvironmentPlan.make(room: room, layout: layout, origin: origin, aspect: aspect)
            precondition(plan.bounds == layout.bounds.offsetBy(dx: origin.x, dy: origin.y))
            precondition(plan.groundBounds.contains(plan.bounds.insetBy(dx: -20, dy: -132)))
            precondition(plan.props.count < 220, "Bound dense forest sprite creation per room")
            precondition(plan.blocked == layout.boundaryObstacles.map { $0.offsetBy(dx: origin.x,dy: origin.y) },
                "Polish cannot add movement obstructions")
            precondition(!plan.reclamation.isEmpty && plan.reclamation.count <= 8 && plan.groundPlants.count <= 16)
            let portalReserve = CGRect(x: plan.bounds.midX-96,y: plan.bounds.maxY-160,width: 192,height: 310)
            let objectiveReserve = layout.objective.map {
                CGRect(x: $0.x+origin.x-100,y: $0.y+origin.y-110,width: 200,height: 240)
            }
            for bed in plan.reclamation {
                let envelope = bed.frame.insetBy(dx: -20,dy: -20)
                precondition(plan.groundBounds.contains(envelope) && !envelope.intersects(portalReserve))
                precondition(!(objectiveReserve.map { envelope.intersects($0) } ?? false))
            }
            for plant in plan.groundPlants {
                precondition(plant.size.height <= 15 && plan.bounds.insetBy(dx: 24,dy: 24).contains(plant.frame))
                precondition(!plan.blocked.contains { $0.intersects(plant.frame) })
                precondition(!plant.frame.intersects(portalReserve) &&
                    !(objectiveReserve.map { plant.frame.intersects($0) } ?? false))
            }
            for prop in plan.props where prop.frame.intersects(plan.bounds) {
                precondition(plan.blocked.contains { $0.contains(prop.frame) },
                    "Scenery cannot occupy a navigable lane: \(prop.asset), room \(room)")
            }
            for pool in plan.pools { precondition(!pool.intersects(plan.bounds)) }
            for name in plan.requiredAssets { _ = aspect(name) }
            for row in -2...3 {
                for column in -2...3 {
                    precondition(plan.variant(column: column, row: row) != plan.variant(column: column+1, row: row))
                    precondition(plan.variant(column: column, row: row) != plan.variant(column: column, row: row+1))
                }
            }
            let repeatPlan = WorldOneEnvironmentPlan.make(room: room, layout: layout, origin: origin, aspect: aspect)
            precondition(plan.props.map { $0.position } == repeatPlan.props.map { $0.position })
            propSignatures.insert(plan.props.map { "\($0.position.x),\($0.position.y)" }.joined(separator: ";"))
            if layout.kind == .passage {
                silhouettes.insert("\(layout.bounds.width)x\(layout.bounds.height)")
                precondition(abs(layout.bounds.width*layout.bounds.height/(28*28)-494) <= 11,
                    "Room variety must preserve the tactical area budget")
                let walls = layout.boundaryObstacles.map { TerrainHazards.Patch(kind: .rubble, frame: $0, outline: []) }
                precondition(TerrainHazards.extractionApproachIsClear(from: layout.entry,
                    to: layout.exit!, patches: walls, collisionRadius: 12))
                for radius: CGFloat in [14,17,23,26] {
                    let spawn = RoomRules.spawnPoint(in: layout.bounds, radius: radius, pilot: layout.entry,
                        candidates: [CGPoint(x: 0.5,y: 0.8),CGPoint(x: 0.5,y: 0.55),CGPoint(x: 0.5,y: 0.25)])
                    precondition(TerrainHazards.spawnAllowed(spawn, radius: radius, patches: walls))
                }
            }
            for size in [CGSize(width: 320,height: 568), CGSize(width: 393,height: 852), CGSize(width: 768,height: 1024)] {
                let exit = layout.exit ?? CGPoint(x: layout.bounds.midX,y: layout.bounds.maxY-14)
                let offset = WorldOneFraming.offset(pilot: layout.cameraTarget(for: exit),
                    room: layout.bounds,size: size,safeTop: 62,safeBottom: 34,horizontalMargin: 84)
                let scale = WorldOneFraming.scale(size: size,safeTop: 62,safeBottom: 34)
                let viewport = WorldOneFraming.viewport(size: size,safeTop: 62,safeBottom: 34)
                precondition((exit.y+128)*scale+offset.y <= viewport.maxY+0.01)
                precondition(RoomRules.enteredGate(pilot: CGPoint(x: exit.x,y: exit.y-14),gate: exit))
                for fraction: CGFloat in [0, 0.25, 0.5, 0.75, 1] {
                    let pilot = CGPoint(x: layout.bounds.midX,
                        y: layout.entry.y+(exit.y-layout.entry.y)*fraction)
                    let follow = WorldOneFraming.offset(pilot: layout.cameraTarget(for: pilot),
                        room: layout.bounds,size: size,safeTop: 62,safeBottom: 34,horizontalMargin: 84)
                    let visible = WorldOneFraming.visibleWorldRect(offset: follow,
                        size: size, safeTop: 62, safeBottom: 34)
                    precondition(layout.bounds.insetBy(dx: -300,dy: -300).contains(visible),
                        "The landscape must cover camera exterior margins")
                    let presentation = WorldOnePortalFraming.make(pilot: pilot,gate: exit,
                        viewport: viewport,scale: scale,offset: follow)
                    precondition((pilot.y-44)*scale+presentation.offset.y >= viewport.minY-0.01,
                        "Opening a distant gate must not lose the pilot below the viewport")
                    if presentation.visible {
                        precondition((exit.y+128)*scale+presentation.offset.y <= viewport.maxY+0.01)
                    }
                    if fraction == 1 { precondition(presentation.visible) }
                }
            }
        }
        precondition(silhouettes.count >= 5 && propSignatures.count == 20)
        print("20 authored layouts: deterministic scenery clearance, varied silhouettes, area budgets, safe spawns, portal/camera and fixed material scale passed")
    }
}
