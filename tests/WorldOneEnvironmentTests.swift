import Foundation
import CoreGraphics

@main
struct WorldOneEnvironmentTests {
    static func main() {
        let passage = WorldOneRoomGeometry.make(room: 1, playerWidth: 28, encounter: .tactical)
        let swamp = WorldOneRoomGeometry.make(room: 6, playerWidth: 28, encounter: .survival)
        let defense = WorldOneRoomGeometry.make(room: 12, playerWidth: 28, encounter: .equipmentDefense)
        let boss = WorldOneRoomGeometry.make(room: WorldCatalog.roomCount(0), playerWidth: 28, encounter: .finalBoss)
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
        // Candidate Toxic scenery must not enter the actual navigable bounds.
        let toxicBounds = [CGRect(x: 28,y: 70,width: 337,height: 557),
                           CGRect(x: -110,y: 40,width: 620,height: 850),
                           CGRect(x: 0,y: 0,width: 120,height: 160)]
        precondition(ToxicEnvironmentPlan.productionAssets.count == 10)
        precondition(Set(ToxicEnvironmentPlan.productionAssets).count == 10)
        for bounds in toxicBounds {
            for room in 1...30 {
                let p = ToxicEnvironmentPlan.make(room: room, bounds: bounds, aspect: { _ in 1 })
                precondition(p.bounds == bounds && p.groundBounds.contains(bounds))
                precondition(!p.props.isEmpty && p.props.allSatisfy { !$0.frame.intersects(bounds) })
                precondition(Set(p.requiredAssets).isSubset(of: Set(ToxicEnvironmentPlan.productionAssets)))
                let repeatPlan = ToxicEnvironmentPlan.make(room: room, bounds: bounds, aspect: { _ in 1 })
                precondition(p.props.map { $0.position } == repeatPlan.props.map { $0.position })
                for column in -3...3 {
                    for row in -3...3 {
                        precondition(p.variant(column: column,row: row) != p.variant(column: column+1,row: row))
                        precondition(p.variant(column: column,row: row) != p.variant(column: column,row: row+1))
                    }
                }
                let sample = (-6...6).flatMap { y in (-6...6).map { x in p.variant(column: x,row: y) } }
                precondition(Set(sample) == Set(0..<4))
                precondition((-6...6).contains { y in (-6...2).contains { x in
                    p.variant(column: x,row: y) != p.variant(column: x+4,row: y)
                } }, "Toxic ground must not repeat every four columns")
                if [10,20,30].contains(room) { precondition(p.theme == .boss) }
                // Existing hazard geometry still has authority and the scene
                // preview does not replace its nodes or damage rules.
                let hazards = TerrainHazards.patches(world: 1,room: room,bounds: bounds)
                precondition(hazards.filter { $0.kind == .acid }.count == 2)
                precondition(hazards.allSatisfy { h in p.props.allSatisfy { !$0.frame.intersects(h.frame) } })
            }
        }
        precondition(FrostEnvironmentPlan.productionAssets.count == 10)
        precondition(Set(FrostEnvironmentPlan.productionAssets).count == 10)
        precondition(Set(FrostEnvironmentPlan.productionAssets).isDisjoint(with: Set(ToxicEnvironmentPlan.productionAssets)))
        for (index,bounds) in toxicBounds.enumerated() {
            let expanded = index == 1
            let band = CGRect(x:bounds.minX,y:bounds.maxY,width:bounds.width,height:110)
            let reserved = [CGRect(x:bounds.midX-64,y:bounds.minY,width:128,height:128),
                            CGRect(x:bounds.midX-64,y:bounds.maxY-128,width:128,height:128)]
            for room in 1...30 {
                let patches = TerrainHazards.patches(world:3,room:room,bounds:bounds)
                let p = FrostEnvironmentPlan.make(room:room,bounds:bounds,northBand:band,
                    patches:patches,reserved:reserved,expanded:expanded)
                precondition(p.groundBounds.contains(bounds))
                precondition(p.landmarks.allSatisfy { band.contains($0.frame) && !$0.frame.intersects(bounds) })
                if expanded { precondition(p.landmarks.isEmpty) }
                if index == 0 { precondition(p.landmarks.count == 2) }
                precondition(p.rubble.count == patches.filter { $0.kind == .rubble }.count)
                precondition(p.rubble.allSatisfy { prop in
                    patches.contains { $0.kind == .rubble && $0.frame.contains(prop.frame) }
                })
                precondition(p.snowbanks.allSatisfy { snow in
                    bounds.contains(snow.frame) && !reserved.contains { $0.intersects(snow.frame) } &&
                    !patches.contains { $0.frame.insetBy(dx:-8,dy:-8).intersects(snow.frame) }
                })
                let repeatPlan = FrostEnvironmentPlan.make(room:room,bounds:bounds,northBand:band,
                    patches:patches,reserved:reserved,expanded:expanded)
                precondition(p.snowbanks.map { $0.position } == repeatPlan.snowbanks.map { $0.position })
                for col in -3...3 {
                    for row in -3...3 {
                        precondition(p.variant(column:col,row:row) != p.variant(column:col+1,row:row))
                        precondition(p.variant(column:col,row:row) != p.variant(column:col,row:row+1))
                    }
                }
            }
        }
        print("Frost candidate: 90 room/bounds plans, safe landmarks, snow cover and rubble skin")
        precondition(IronEnvironmentPlan.productionAssets.count == 10)
        precondition(Set(IronEnvironmentPlan.productionAssets).count == 10)
        precondition(Set(IronEnvironmentPlan.productionAssets).isDisjoint(with: Set(ToxicEnvironmentPlan.productionAssets)))
        precondition(Set(IronEnvironmentPlan.productionAssets).isDisjoint(with: Set(FrostEnvironmentPlan.productionAssets)))
        for (index,bounds) in toxicBounds.enumerated() {
            let expanded = index == 1
            let band = CGRect(x:bounds.minX,y:bounds.maxY,width:bounds.width,height:110)
            let reserved = [CGRect(x:bounds.midX-64,y:bounds.minY,width:128,height:128),
                            CGRect(x:bounds.midX-64,y:bounds.maxY-128,width:128,height:128)]
            for room in 1...30 {
                let patches = TerrainHazards.patches(world:2,room:room,bounds:bounds)
                let p = IronEnvironmentPlan.make(room:room,bounds:bounds,northBand:band,
                    patches:patches,reserved:reserved,expanded:expanded)
                precondition(p.groundBounds.contains(bounds))
                precondition(p.landmarks.allSatisfy { band.contains($0.frame) && !$0.frame.intersects(bounds) })
                if expanded { precondition(p.landmarks.isEmpty) }
                if index == 0 { precondition(p.landmarks.count == 2) }
                precondition(p.rubble.count == patches.filter { $0.kind == .rubble }.count)
                precondition(p.rubble.allSatisfy { prop in
                    patches.contains { $0.kind == .rubble && $0.frame.contains(prop.frame) }
                })
                precondition(p.fragments.allSatisfy { snow in
                    bounds.contains(snow.frame) && !reserved.contains { $0.intersects(snow.frame) } &&
                    !patches.contains { $0.frame.insetBy(dx:-8,dy:-8).intersects(snow.frame) }
                })
                let repeatPlan = IronEnvironmentPlan.make(room:room,bounds:bounds,northBand:band,
                    patches:patches,reserved:reserved,expanded:expanded)
                precondition(p.fragments.map { $0.position } == repeatPlan.fragments.map { $0.position })
                for col in -3...3 {
                    for row in -3...3 {
                        precondition(p.variant(column:col,row:row) != p.variant(column:col+1,row:row))
                        precondition(p.variant(column:col,row:row) != p.variant(column:col,row:row+1))
                    }
                }
            }
        }
        print("Iron candidate: 90 room/bounds plans, safe landmarks, debris and rubble skin")
        print("Toxic candidate: 90 room/bounds plans, deterministic props and hazard clearance")
        print("Four environment identities, corridor traversal, pocket navigation and safe framing passed")
    }
}
