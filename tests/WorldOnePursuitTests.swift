import Foundation
import CoreGraphics

@main
struct WorldOnePursuitTests {
    static func main() {
        func pursue(layout: WorldOneRoomGeometry.Layout, origin: CGPoint,
                    start: CGPoint, pilot: CGPoint, radius: CGFloat,
                    behavior: Int, phase: CGFloat) {
            let bounds = layout.bounds.offsetBy(dx: origin.x, dy: origin.y)
            let patches = layout.boundaryObstacles.map {
                TerrainHazards.Patch(kind: .rubble,
                    frame: $0.offsetBy(dx: origin.x, dy: origin.y), outline: [])
            }
            var point = start
            for tick in 0..<7200 {
                if hypot(point.x-pilot.x, point.y-pilot.y) < radius+14 { return }
                let waypoint = TerrainHazards.navigationTarget(from: point, toward: pilot,
                    patches: patches, bounds: bounds, radius: radius)
                let intent = CombatRules.enemySteering(behavior: behavior, origin: point,
                    pilot: waypoint, elapsed: Double(tick)/60, phase: phase,
                    ranged: false, aiming: false)
                let requested = RoomRules.clamp(CGPoint(x: point.x+intent.dx*111/60,
                    y: point.y+intent.dy*111/60), to: bounds.insetBy(dx: radius, dy: radius))
                point = TerrainHazards.resolveMovement(from: point, to: requested,
                    patches: patches, radius: radius)
                precondition(!TerrainHazards.blocksMovement(point, patches: patches, radius: radius),
                    "Pursuit must never cross a shoulder")
            }
            preconditionFailure("Unreachable pilot: start=\(start), last=\(point), pilot=\(pilot), radius=\(radius), behavior=\(behavior)")
        }
        // Exact stationary Room 2 checkpoint from both failed cadence logs.
        let room2 = WorldOneRoomGeometry.make(room: 2, playerWidth: 28, encounter: .tactical)
        for x: CGFloat in [56.660038,57.551506] {
            pursue(layout: room2, origin: CGPoint(x: -43,y: -61.5),
                start: CGPoint(x: x,y: 468.644440), pilot: CGPoint(x: 195,y: -5.5),
                radius: 17, behavior: 2, phase: 1.7)
        }
        // Every tactical proportion, both banks, both pockets, real melee
        // steering and collision. Endpoint-only clearance missed this defect.
        for room in 1...6 {
            let layout = WorldOneRoomGeometry.make(room: room, playerWidth: 28, encounter: .tactical)
            for (behavior,radius) in [(0,CGFloat(14)),(1,CGFloat(23)),(2,CGFloat(17)),(3,CGFloat(26))] {
                for pocket in layout.combatPockets {
                    for right in [false,true] {
                        let start = CGPoint(x: right ? pocket.maxX-radius-2 : pocket.minX+radius+2,
                                            y: pocket.midY)
                        for target in [layout.entry,layout.exit!,
                            CGPoint(x: right ? pocket.minX+radius+2 : pocket.maxX-radius-2,y: pocket.midY)] {
                            pursue(layout: layout, origin: .zero, start: start, pilot: target,
                                radius: radius, behavior: behavior, phase: right ? -1.7 : 1.7)
                        }
                    }
                }
            }
        }
        for size in [CGSize(width: 320,height: 568),CGSize(width: 393,height: 852),CGSize(width: 768,height: 1024)] {
            let layout = WorldOneRoomGeometry.make(room: 1, playerWidth: 28, encounter: .tactical)
            let viewport = WorldOneFraming.viewport(size: size,safeTop: 62,safeBottom: 34)
            let zoom = WorldOneFraming.scale(size: size,safeTop: 62,safeBottom: 34)
            var prior: CGFloat?
            for y in stride(from: layout.entry.y, through: layout.exit!.y, by: 1) {
                let pilot = CGPoint(x: layout.bounds.midX,y: y)
                let offset = WorldOneFraming.offset(pilot: layout.cameraTarget(for: pilot),
                    room: layout.bounds,size: size,safeTop: 62,safeBottom: 34)
                let result = WorldOnePortalFraming.make(pilot: pilot,gate: layout.exit!,
                    viewport: viewport,scale: zoom,offset: offset)
                if let previous = prior {
                    precondition(abs(result.offset.y-previous) <= zoom+0.001,
                        "Portal reveal must be continuous through its fit threshold")
                }
                precondition((pilot.y-44)*zoom+result.offset.y >= viewport.minY-0.001)
                if result.visible {
                    precondition((layout.exit!.y+128)*zoom+result.offset.y <= viewport.maxY+0.001)
                }
                prior = result.offset.y
            }
        }
        print("Exact Room 2 stalled raider and 288 compound-shoulder pursuits reached real contact; portal camera reveal is continuous")
    }
}
