import Foundation
import CoreGraphics

@main
struct WorldOneEnvironmentTests {
    static func main() {
        let passage = WorldOneRoomGeometry.make(room: 1, playerWidth: 28, encounter: .tactical)
        let swamp = WorldOneRoomGeometry.make(room: 6, playerWidth: 28, encounter: .survival)
        let defense = WorldOneRoomGeometry.make(room: 12, playerWidth: 28, encounter: .equipmentDefense)
        let boss = WorldOneRoomGeometry.make(room: 20, playerWidth: 28, encounter: .tactical)
        precondition(Set([passage, swamp, defense, boss].map { $0.artFamily }).count == 4)
        precondition(SurvivalEncounterRules.kind(world: 0, room: 6) == .survival)
        precondition(SurvivalEncounterRules.kind(world: 0, room: 12) == .equipmentDefense)
        precondition(passage.bounds.height > passage.bounds.width * 2.8)
        precondition(swamp.bounds.width > passage.bounds.width * 2)
        precondition(defense.objective != defense.entry && boss.objective != boss.entry)
        precondition(passage.exit!.y == passage.bounds.maxY - 14)
        let walls = passage.boundaryObstacles.map {
            TerrainHazards.Patch(kind: .rubble, frame: $0, outline: [])
        }
        // Walk the complete entry-to-portal path through both widened pockets.
        var point = passage.entry
        while point.y < passage.exit!.y {
            let target = CGPoint(x: point.x, y: min(passage.exit!.y, point.y + 4))
            let resolved = TerrainHazards.resolveMovement(from: point, to: target,
                patches: walls, radius: 12)
            precondition(hypot(resolved.x-target.x, resolved.y-target.y) < 0.01)
            point = resolved
        }
        // The pocket permits lateral dodging; its narrower connector stops it.
        let lateral = CGPoint(x: 56, y: passage.combatPockets[0].midY)
        precondition(!TerrainHazards.blocksMovement(lateral, patches: walls, radius: 12))
        precondition(TerrainHazards.blocksMovement(CGPoint(x: 56, y: 100), patches: walls, radius: 12))
        // Enemies must actually navigate out of a wide pocket into the connector.
        for start in [CGPoint(x: 55, y: 350), CGPoint(x: 309, y: 760)] {
            var enemy = start
            for _ in 0..<2000 {
                let target = TerrainHazards.navigationTarget(from: enemy, toward: passage.entry,
                    patches: walls, bounds: passage.bounds, radius: 15)
                let d = hypot(target.x-enemy.x, target.y-enemy.y)
                if d < 1 { break }
                let step = min(3, d)
                let proposed = CGPoint(x: enemy.x + (target.x-enemy.x)/d*step,
                    y: enemy.y + (target.y-enemy.y)/d*step)
                enemy = TerrainHazards.resolveMovement(from: enemy, to: proposed,
                    patches: walls, radius: 15)
            }
            precondition(hypot(enemy.x-passage.entry.x, enemy.y-passage.entry.y) < 25,
                "Pocket enemies must reach the entrance without sticking against a shoulder")
        }
        // Check framed objective, portal headroom and player health at phone/tablet sizes.
        for size in [CGSize(width: 320, height: 568), CGSize(width: 393, height: 852), CGSize(width: 768, height: 1024)] {
            for layout in [passage, swamp, defense, boss] {
                let offset = WorldOneFraming.offset(pilot: layout.cameraTarget(for: layout.entry), room: layout.bounds,
                    size: size, safeTop: 62, safeBottom: 34)
                let zoom = WorldOneFraming.scale(size: size, safeTop: 62, safeBottom: 34)
                let view = WorldOneFraming.viewport(size: size, safeTop: 62, safeBottom: 34)
                precondition(layout.entry.y * zoom + offset.y - 44*zoom >= view.minY)
                if let exit = layout.exit {
                    let end = WorldOneFraming.offset(pilot: layout.cameraTarget(for: exit), room: layout.bounds,
                        size: size, safeTop: 62, safeBottom: 34)
                    precondition((exit.y + 128)*zoom + end.y <= view.maxY + 0.01)
                }
            }
        }
        let bossReviewPilot = CGPoint(x: boss.bounds.midX, y: boss.bounds.midY - 100)
        let phone = CGSize(width: 393, height: 852)
        let bossOffset = WorldOneFraming.offset(pilot: boss.cameraTarget(for: bossReviewPilot),
            room: boss.bounds, size: phone, safeTop: 62, safeBottom: 34)
        let bossZoom = WorldOneFraming.scale(size: phone, safeTop: 62, safeBottom: 34)
        let bossViewport = WorldOneFraming.viewport(size: phone, safeTop: 62, safeBottom: 34)
        precondition((boss.objective!.y + 148)*bossZoom + bossOffset.y <= bossViewport.maxY,
            "Boss artwork and its name/health must fit below the HUD on approach")
        precondition(swamp.cameraTarget(for: swamp.entry) == swamp.entry)
        precondition(defense.cameraTarget(for: defense.entry) == defense.entry)
        print("Four environment identities, corridor traversal, pocket navigation and safe framing passed")
    }
}
