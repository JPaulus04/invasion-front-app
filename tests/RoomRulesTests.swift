import Foundation

@main
struct RoomRulesTests {
    static func main() {
        for size in [CGSize(width: 320, height: 568), CGSize(width: 393, height: 852), CGSize(width: 768, height: 1024)] {
            let room = RoomRules.bounds(for: size)
            let entry = RoomRules.entryPoint(for: size)
            precondition(room.contains(entry), "Entry must be inside room")
            precondition(entry.y < room.midY, "Every new room starts at the bottom")
            let gate = CGPoint(x: room.midX, y: room.maxY - 24)
            precondition(room.contains(gate), "Exit must be reachable")
            precondition(hypot(entry.x - gate.x, entry.y - gate.y) > 49, "Entry cannot immediately trigger exit")
            for pilot in [entry, CGPoint(x: room.midX, y: room.midY), gate] {
                for radius in [CGFloat(14), 17, 23, 26, 37] {
                    let candidateSets: [[CGPoint]] = [[], [CGPoint(x: 0.5, y: 0.5)], [CGPoint(x: 0, y: 0), CGPoint(x: 1, y: 1)]]
                    for samples in candidateSets {
                        let point = RoomRules.spawnPoint(in: room, radius: radius, pilot: pilot, candidates: samples)
                        precondition(point.x - radius >= room.minX && point.x + radius <= room.maxX)
                        precondition(point.y - radius >= room.minY && point.y + radius + 12 <= room.maxY)
                        precondition(hypot(point.x - pilot.x, point.y - pilot.y) >= radius + 75,
                                     "Spawns must be separated from the player, including fallback")
                    }
                }
            }
            let clamped = RoomRules.clamp(CGPoint(x: -100, y: 10000), to: room)
            precondition(clamped.x == room.minX && clamped.y == room.maxY)
        }
        precondition(!RoomRules.isCleared(spawned: 0, target: 0, living: 0))
        precondition(!RoomRules.isCleared(spawned: 4, target: 7, living: 0), "Pending spawns keep exit locked")
        precondition(!RoomRules.isCleared(spawned: 7, target: 7, living: 1), "Last enemy keeps exit locked")
        precondition(RoomRules.isCleared(spawned: 7, target: 7, living: 0))
        print("Room geometry, safe spawns, entry placement, and clear conditions passed")
    }
}
