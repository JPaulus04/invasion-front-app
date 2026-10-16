import Foundation
import CoreGraphics

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
            precondition(!RoomRules.enteredGate(pilot: entry, gate: gate),
                         "New room must not auto-advance from entry")
            precondition(!RoomRules.enteredGate(
                pilot: CGPoint(x: gate.x, y: gate.y - 36), gate: gate),
                         "Approaching the gate is not entering it")
            precondition(!RoomRules.enteredGate(
                pilot: CGPoint(x: gate.x + 44, y: gate.y), gate: gate),
                         "Passing beside the door cannot advance")
            precondition(RoomRules.enteredGate(
                pilot: CGPoint(x: gate.x, y: gate.y - 8), gate: gate),
                         "Stepping into the doorway must advance")
            precondition(RoomRules.enteredGate(
                pilot: CGPoint(x: gate.x + 30, y: gate.y + 10), gate: gate),
                         "A diagonal approach inside portal bounds must advance")
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
        // Terrain does not change World 1 until balancing is validated.
        let reference = RoomRules.bounds(for: CGSize(width: 393, height: 852))
        let entry = RoomRules.entryPoint(for: CGSize(width: 393, height: 852))
        let exit = CGPoint(x: reference.midX, y: reference.maxY - 24)
        precondition(TerrainHazards.patches(world: 0, room: 18, bounds: reference).isEmpty)
        for room in 1...20 {
            let hazards = TerrainHazards.patches(world: 1, room: room, bounds: reference)
            precondition(hazards.count == 2)
            precondition(!hazards.contains { $0.kind == .acid })
            precondition(!hazards.contains { $0.contains(entry, margin: 16) })
            precondition(!hazards.contains { $0.contains(exit, margin: 16) })
            // Entire center lane remains unobstructed, not just two endpoints.
            for fraction in 0...20 {
                let point = CGPoint(x: reference.midX,
                    y: reference.minY + reference.height * CGFloat(fraction) / 20)
                precondition(!hazards.contains { $0.contains(point, margin: 14) },
                             "Every room requires a guaranteed escape corridor")
            }
            let water = hazards[0]
            let submerged = CGPoint(x: water.frame.midX, y: water.frame.midY)
            precondition(TerrainHazards.waterSpeed(at: submerged, patches: hazards) == 0.62)
            precondition(TerrainHazards.waterSpeed(at: entry, patches: hazards) == 1)
            let rubble = hazards[1]
            let center = CGPoint(x: rubble.frame.midX, y: rubble.frame.midY)
            precondition(TerrainHazards.hitsObstacle(center, patches: hazards))
            precondition(TerrainHazards.resolveMovement(
                from: entry, to: center, patches: hazards) != center,
                "Blocked terrain must stop movement")
        }
        // Pool physics exactly follows the visible elliptical silhouette.
        let patches = TerrainHazards.patches(world: 1, room: 12, bounds: reference)
        let watery = patches[0]
        let poolCorner = CGPoint(x: watery.frame.minX + 2, y: watery.frame.minY + 2)
        precondition(!watery.contains(poolCorner))
        precondition(TerrainHazards.waterSpeed(at: poolCorner, patches: patches) == 1)
        let blockedCenter = CGPoint(x: patches[1].frame.midX, y: patches[1].frame.midY)
        precondition(!TerrainHazards.spawnAllowed(blockedCenter, radius: 15, patches: patches))
        precondition(TerrainHazards.spawnAllowed(entry, radius: 15, patches: patches))
        let toxicPatches = TerrainHazards.patches(world: 2, room: 12, bounds: reference)
        precondition(toxicPatches.count == 2)
        precondition(!toxicPatches.contains { $0.kind == .water })
        let toxic = CGPoint(x: toxicPatches[0].frame.midX, y: toxicPatches[0].frame.midY)
        precondition(!TerrainHazards.acidTouches(toxic, patches: toxicPatches, at: 1.5))
        precondition(TerrainHazards.acidTouches(toxic, patches: toxicPatches, at: 2.5))
        precondition(!TerrainHazards.acidTouches(toxic, patches: toxicPatches, at: 5.5))
        precondition(!TerrainHazards.acidTouches(entry, patches: toxicPatches, at: 2.5))
        // Active-state transitions, not every simulation frame, should drive
        // a redraw. Two 6-second cycles contain four visual transitions.
        var priorAcidOn = TerrainHazards.acidActive(at: 0)
        var visualTransitions = 0
        for frame in 1...720 {
            let acidOn = TerrainHazards.acidActive(at: Double(frame) / 60)
            if acidOn != priorAcidOn {
                visualTransitions += 1
                priorAcidOn = acidOn
            }
        }
        precondition(visualTransitions == 4)
        // Both small and large phones retain the guaranteed safe corridor.
        for screen in [CGSize(width: 320, height: 568), CGSize(width: 768, height: 1024)] {
            let arena = RoomRules.bounds(for: screen)
            let localPatches = TerrainHazards.patches(world: 1, room: 17, bounds: arena)
            for i in 0...25 {
                let p = CGPoint(x: arena.midX,
                    y: arena.minY + arena.height * CGFloat(i) / 25)
                precondition(!localPatches.contains { $0.contains(p, margin: 14) })
            }
        }
        precondition(!RoomRules.isCleared(spawned: 0, target: 0, living: 0))
        precondition(!RoomRules.isCleared(spawned: 4, target: 7, living: 0), "Pending spawns keep exit locked")
        precondition(!RoomRules.isCleared(spawned: 7, target: 7, living: 1), "Last enemy keeps exit locked")
        precondition(RoomRules.isCleared(spawned: 7, target: 7, living: 0))
        print("Room geometry, safe spawns, physical portal entry, and clear conditions passed")
    }
}
