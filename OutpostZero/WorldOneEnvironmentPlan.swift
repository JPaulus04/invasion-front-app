import Foundation
import CoreGraphics

/// One world-space contract for materials, silhouettes, exterior scenery and
/// landmark placement. Physics remains owned by WorldOneRoomGeometry/TerrainHazards.
enum WorldOneEnvironmentPlan {
    enum Theme: String, CaseIterable {
        case outpost, swamp, caves, sanctuary
        var family: String {
            switch self {
            case .outpost: return "ruined_outpost"
            case .swamp: return "swamp_basin"
            case .caves: return "toxic_caves"
            case .sanctuary: return "boss_arena"
            }
        }
        static func forRoom(_ room: Int) -> Theme {
            switch room {
            case 1...5, 16, 21, 24, 27: return .outpost
            case 6...10, 17, 22, 25, 28: return .swamp
            case 11...15, 18, 23, 26, 29: return .caves
            default: return .sanctuary
            }
        }
    }
    struct Prop {
        let asset: String
        let position: CGPoint
        let size: CGSize
        let anchorY: CGFloat
        let foreground: Bool
        var frame: CGRect {
            CGRect(x: position.x-size.width/2, y: position.y-anchorY*size.height,
                   width: size.width, height: size.height)
        }
    }
    struct Plan {
        let room: Int
        let theme: Theme
        let bounds: CGRect
        let groundBounds: CGRect
        let blocked: [CGRect]
        let props: [Prop]
        let pools: [CGRect]
        let groundOrigin: CGPoint
        let reclamation: [GroundPatch]
        let groundPlants: [GroundPlant]
        var materialNames: [String] { (0..<4).map { "build338_ground_\(theme.rawValue)_\($0)" } }
        var requiredAssets: [String] {
            var names = materialNames
            names.append(contentsOf: props.map { $0.asset })
            names.append(contentsOf: reclamation.map { $0.asset })
            names.append(contentsOf: groundPlants.map { $0.asset })
            names.append("outpost_zero_portal_approved_transparent")
            names.append("world1_\(theme.family)_floor_1")
            if !pools.isEmpty { names.append("build338_forest_pool") }
            if !blocked.isEmpty { names.append("build338_understory_\(theme.rawValue)") }
            return Array(Set(names)).sorted()
        }
        func variant(column: Int, row: Int) -> Int {
            // Four neighboring materials; no identical adjacent cells and a
            // repeat period larger than the traversable length of a room.
            ((column + 3*row + room) % 4 + 4) % 4
        }
    }
    /// Flat wear and ankle-height plants are presentation, never obstacles.
    struct GroundPatch {
        let asset: String
        let position: CGPoint
        let angle: CGFloat
        let opacity: CGFloat
        var frame: CGRect { CGRect(x: position.x-128,y: position.y-128,width: 256,height: 256) }
    }
    struct GroundPlant {
        let asset: String
        let position: CGPoint
        let size: CGSize
        var frame: CGRect { CGRect(x: position.x-size.width/2,y: position.y-size.height/2,
                                  width: size.width,height: size.height) }
    }
    static let cellSize: CGFloat = 512

    static func make(room: Int, layout: WorldOneRoomGeometry.Layout, origin: CGPoint,
                     aspect: (String) -> CGFloat) -> Plan {
        let bounds = layout.bounds.offsetBy(dx: origin.x, dy: origin.y)
        let theme = Theme.forRoom(room)
        let ground = bounds.insetBy(dx: -300, dy: -300)
        let blocked = layout.boundaryObstacles.map { $0.offsetBy(dx: origin.x, dy: origin.y) }
        var props: [Prop] = []
        var seed = UInt64(room * 338 + 71)
        func random() -> CGFloat {
            seed = seed &* 6364136223846793005 &+ 1442695040888963407
            return CGFloat((seed >> 32) % 10000) / 10000
        }
        func add(_ name: String, x: CGFloat, y: CGFloat, height: CGFloat,
                 foreground: Bool = false, inside: CGRect? = nil) {
            let item = Prop(asset: name, position: CGPoint(x: x, y: y),
                size: CGSize(width: height*aspect(name), height: height),
                anchorY: WorldOneArtMetrics.groundAnchorY(for: name), foreground: foreground)
            if let inside, !inside.contains(item.frame) { return }
            props.append(item)
        }
        // Two staggered forest belts on all four sides. Every silhouette is
        // outside the playable rectangle, so scenery never conceals a walkable lane.
        for side in 0..<4 {
            let length = side < 2 ? bounds.height : bounds.width
            let count = max(3, Int(length/86))
            for index in 0..<count {
                let t = (CGFloat(index)+0.35+random()*0.3)/CGFloat(count)
                let tree = (index+side+room).isMultiple(of: 3) ? "forest_pine_polished" : "forest_broadleaf_polished"
                let height: CGFloat = 104 + random()*42
                let width = height*aspect(tree)
                let anchor = WorldOneArtMetrics.groundAnchorY(for: tree)
                // Set the forest back behind the north/south water shelves.
                let along = bounds.minX+length*t
                let shelfStart = side == 2 ? bounds.midX-190 : bounds.midX+10
                let wetShelf = (theme == .swamp || theme == .caves) && side >= 2 &&
                    along > shelfStart-20 && along < shelfStart+200
                let distance = 8 + random()*30 + (wetShelf ? 100 : 0)
                var x: CGFloat, y: CGFloat
                switch side {
                case 0: x = bounds.minX-distance-width/2; y = bounds.minY + length*t
                case 1: x = bounds.maxX+distance+width/2; y = bounds.minY + length*t
                case 2: x = bounds.minX+length*t; y = bounds.minY-distance-height*(1-anchor)
                default: x = bounds.minX+length*t; y = bounds.maxY+distance+height*anchor
                }
                add(tree, x: x, y: y, height: height)
                let plant = "world1_\(theme.family)_vegetation"
                if side < 2 {
                    let plantHeight = 42+random()*22
                    let half = plantHeight*aspect(plant)/2
                    x = side == 0 ? bounds.minX-half-4 : bounds.maxX+half+4
                    add(plant, x: x, y: y-24, height: plantHeight)
                }
            }
        }
        // Dense, irregular forest/ruin clusters occupy existing solid shoulders.
        // A sprite's full frame must fit a blocked rectangle. No column courses,
        // repeated wall rails, new invisible obstacles or mid-lane decorations.
        for (index, patch) in blocked.enumerated() {
            let rows = max(1, Int(patch.height/34))
            for row in 0..<rows {
                let kinds = ["vegetation", "boulder", "wall", "vegetation", "debris"]
                let kind = kinds[Int(random()*CGFloat(kinds.count))]
                let name = "world1_\(theme.family)_\(kind)"
                let height = min(72, (patch.width-4)/max(0.5, aspect(name)))*(0.65+random()*0.35)
                let y = patch.minY + (CGFloat(row+1)+(random()-0.5)*0.5)*patch.height/CGFloat(rows+1)
                add(name, x: patch.midX + (random()-0.5)*min(10, patch.width*0.2),
                    y: y, height: max(14, height), inside: patch)
                if patch.width >= 70, random() > 0.3 {
                    let tree = (row+index+room).isMultiple(of: 2) ? "forest_pine_polished" : "forest_broadleaf_polished"
                    let height = min(110,(patch.width-4)/aspect(tree))*(0.58+random()*0.42)
                    let freeWidth = max(0,patch.width-height*aspect(tree)-4)
                    add(tree, x: patch.midX+(random()-0.5)*freeWidth, y: y,
                        height: height, inside: patch)
                }
            }
        }
        // Authored far-wall landmarks flank a clear, permanent round gateway.
        for side: CGFloat in [-1, 1] {
            let wall = "world1_\(theme.family)_wall"
            add(wall, x: bounds.midX+side*118,
                y: bounds.maxY+WorldOneArtMetrics.groundAnchorY(for: wall)*94+2, height: 94)
            let vegetation = "world1_\(theme.family)_vegetation"
            add(vegetation, x: bounds.midX+side*174,
                y: bounds.maxY+WorldOneArtMetrics.groundAnchorY(for: vegetation)*72+2, height: 72)
        }
        // Composed exterior buttresses, shore remnants and cave outcrops.
        // Every complete sprite stays beyond the movement rectangle; existing
        // portal masonry remains at its approved location above.
        func exterior(_ asset: String, x: CGFloat, north: Bool, height: CGFloat) {
            let anchor = WorldOneArtMetrics.groundAnchorY(for: asset)
            let y = north ? bounds.maxY+height*anchor+3 : bounds.minY-height*(1-anchor)-3
            add(asset,x: x,y: y,height: height)
        }
        for north in [false,true] {
            for side: CGFloat in [-1,1] {
                let x = bounds.midX+side*(north ? 222 : 170)
                switch theme {
                case .outpost:
                    exterior("world1_ruined_outpost_wall",x: x,north: north,height: 105)
                    exterior("world1_boss_arena_boulder",x: x+side*60,north: north,height: 88)
                    exterior("world1_ruined_outpost_debris",x: x-side*42,north: north,height: 52)
                case .swamp:
                    // Leave the water shelf open: ruins/root mats flank its bank.
                    let bank = bounds.midX+side*230
                    exterior("world1_swamp_basin_wall",x: bank,north: north,height: 94)
                    exterior("world1_swamp_basin_debris",x: bank-side*45,north: north,height: 54)
                    exterior("world1_swamp_basin_vegetation",x: bank+side*48,north: north,height: 62)
                case .caves:
                    exterior("world1_toxic_caves_boulder",x: x,north: north,height: 152)
                    exterior("world1_toxic_caves_debris",x: x+side*65,north: north,height: 92)
                    exterior("world1_toxic_caves_vegetation",x: x-side*42,north: north,height: 62)
                case .sanctuary:
                    exterior("world1_boss_arena_wall",x: x,north: north,height: 125)
                    exterior("world1_boss_arena_debris",x: x+side*60,north: north,height: 84)
                    exterior("world1_boss_arena_boulder",x: x-side*48,north: north,height: 108)
                }
            }
        }
        // Reclaimed banks follow the old paving seams in connected runs.
        // Fixed 256-point patches use 512-pixel authored textures, retaining
        // the approved two-pixels/point density. No room-sized texture stretch.
        var reclamation: [GroundPatch] = []
        var groundPlants: [GroundPlant] = []
        let rows: [CGFloat] = theme == .sanctuary ? [0.18,0.36] : [0.18,0.40,0.62,0.80]
        let bankDistance: CGFloat = layout.kind == .defense ? 264 :
            (layout.kind == .passage ? min(175,bounds.width*0.40) : 184)
        let gateClear = CGRect(x: bounds.midX-96,y: bounds.maxY-160,width: 192,height: 310)
        let objectiveClear = layout.objective.map {
            CGRect(x: $0.x+origin.x-100,y: $0.y+origin.y-110,width: 200,height: 240)
        }
        for (index,fraction) in rows.enumerated() {
            for side: CGFloat in [-1,1] {
                let drift: CGFloat = [0,22,-14,12][index]
                let position = CGPoint(x: bounds.midX+side*(bankDistance+drift),
                    y: bounds.minY+bounds.height*fraction+(side < 0 ? -24 : 32))
                let variant = (index+(side > 0 ? 1 : 0))%2
                // Corruption remains fractured paving, not an apparent water
                // hazard. Grass retains the approved stone relief underneath.
                let opacity: CGFloat = theme == .caves ? 0.58 :
                    (theme == .swamp ? 0.96 : (variant == 0 ? 0.78 : 0.94))
                let patch = GroundPatch(asset: "build338_reclaim_\(theme.rawValue)_\(variant)",
                    position: position,angle: side*(index.isMultiple(of: 2) ? 0.12 : -0.15),opacity: opacity)
                // The reserve includes the rotated patch's entire bounding box.
                let envelope = patch.frame.insetBy(dx: -20,dy: -20)
                if envelope.intersects(gateClear) || (objectiveClear.map { envelope.intersects($0) } ?? false) { continue }
                reclamation.append(patch)
                for offset: CGFloat in [-34,30] {
                    let plantName = "world1_\(theme.family)_vegetation"
                    let height: CGFloat = theme == .swamp ? 15 : 12
                    let plant = GroundPlant(asset: plantName,
                        position: CGPoint(x: position.x+offset,y: position.y+side*28),
                        size: CGSize(width: height*aspect(plantName),height: height))
                    if bounds.insetBy(dx: 24,dy: 24).contains(plant.frame) &&
                        !blocked.contains(where: { $0.intersects(plant.frame) }) &&
                        !plant.frame.intersects(gateClear) &&
                        !(objectiveClear.map { plant.frame.intersects($0) } ?? false) {
                        groundPlants.append(plant)
                    }
                }
            }
        }
        // Atmospheric liquids live beyond combat bounds. Existing gameplay
        // hazards remain authoritative; these never create undamaging pools inside a lane.
        let pools: [CGRect] = (theme == .swamp || theme == .caves)
            ? [CGRect(x: bounds.minX-130, y: bounds.minY+bounds.height*0.25,
                      width: 130, height: 170),
               CGRect(x: bounds.maxX, y: bounds.minY+bounds.height*0.65,
                      width: 120, height: 145),
               CGRect(x: bounds.midX-190, y: bounds.minY-120, width: 180, height: 120),
               CGRect(x: bounds.midX+10, y: bounds.maxY, width: 180, height: 120)] : []
        return Plan(room: room, theme: theme, bounds: bounds, groundBounds: ground,
            blocked: blocked, props: props, pools: pools,
            groundOrigin: CGPoint(x: bounds.midX-256, y: bounds.minY-128),
            reclamation: reclamation,groundPlants: groundPlants)
    }
}


/// Toxic Crossing production contract. Uses the existing live room bounds;
/// no terrain, collision, spawn, or progression changes. Art is staged separately.
enum ToxicEnvironmentPlan {
    enum Theme: String, CaseIterable {
        case containment, runoff, ruins, boss
        static func forRoom(_ room: Int) -> Theme {
            if [10, 20, 30].contains(room) { return .boss }
            switch (max(1, room)-1)/5 {
            case 0, 3: return .containment
            case 1, 4: return .runoff
            default: return .ruins
            }
        }
    }
    struct Plan {
        let room: Int
        let theme: Theme
        let bounds: CGRect
        let groundBounds: CGRect
        let props: [WorldOneEnvironmentPlan.Prop]
        var materialNames: [String] { (0..<4).map { "world2_ground_\($0)" } }
        var requiredAssets: [String] {
            Array(Set(materialNames + props.map { $0.asset })).sorted()
        }
        func variant(column: Int, row: Int) -> Int {
            ((column + 3*row + room) % 4 + 4) % 4
        }
    }
    // All props must be delivered with visible contact 32px from the base
    // of a normalized 512px canvas, subject to actual alpha inspection.
    static let propAnchorY: CGFloat = 32.0/512.0
    static let propNames = ["tank", "pipe", "debris", "boulder", "vegetation", "wall"]
    static var productionAssets: [String] {
        (0..<4).map { "world2_ground_\($0)" } + propNames.map { "world2_prop_\($0)" }
    }
    static func make(room: Int, bounds: CGRect, aspect: (String) -> CGFloat) -> Plan {
        precondition(room > 0 && bounds.width > 0 && bounds.height > 0)
        let theme = Theme.forRoom(room)
        let sequence: [Int]
        switch theme {
        case .containment: sequence = [0, 1, 2, 5, 4, 3]
        case .runoff: sequence = [1, 4, 3, 0, 2, 5]
        case .ruins: sequence = [5, 2, 3, 4, 1, 0]
        case .boss: sequence = [0, 5, 1, 3, 2, 4]
        }
        var props: [WorldOneEnvironmentPlan.Prop] = []
        for side in 0..<4 {
            let length = side < 2 ? bounds.height : bounds.width
            let count = max(2, Int(length/112))
            for index in 0..<count {
                let kind = sequence[(index + side + room) % sequence.count]
                let asset = "world2_prop_\(propNames[kind])"
                let height: CGFloat = (theme == .boss ? 106 : 82) + CGFloat((index*13+room*7+side*3)%25)
                let ratio = aspect(asset)
                let width = height * (ratio.isFinite && ratio > 0 ? ratio : 1)
                let t = (CGFloat(index)+0.5)/CGFloat(count)
                let gap = CGFloat(8+(index*17+room*11)%18)
                let x: CGFloat, y: CGFloat
                switch side {
                case 0: x = bounds.minX-gap-width/2; y = bounds.minY+length*t
                case 1: x = bounds.maxX+gap+width/2; y = bounds.minY+length*t
                case 2: x = bounds.minX+length*t; y = bounds.minY-gap-height*(1-propAnchorY)
                default: x = bounds.minX+length*t; y = bounds.maxY+gap+height*propAnchorY
                }
                // Leave a wide north/south center opening for the existing
                // entry, exit portal and boss presentation.
                if side >= 2 && abs(x-bounds.midX) < 90+width/2 { continue }
                let prop = WorldOneEnvironmentPlan.Prop(asset: asset,
                    position: CGPoint(x: x,y: y), size: CGSize(width: width,height: height),
                    anchorY: propAnchorY, foreground: false)
                precondition(!prop.frame.intersects(bounds))
                props.append(prop)
            }
        }
        return Plan(room: room, theme: theme, bounds: bounds,
                    groundBounds: bounds.insetBy(dx: -300,dy: -300), props: props)
    }
}
