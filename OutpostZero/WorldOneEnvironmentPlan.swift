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
            case 1...5, 16: return .outpost
            case 6...10, 17: return .swamp
            case 11...15, 18: return .caves
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
        var materialNames: [String] { (0..<4).map { "build338_ground_\(theme.rawValue)_\($0)" } }
        var requiredAssets: [String] {
            Array(Set(materialNames + props.map { $0.asset } +
                    ["outpost_zero_portal_approved_transparent", "world1_\(theme.family)_floor_1"] +
                    (pools.isEmpty ? [] : ["build338_forest_pool"]))).sorted()
        }
        func variant(column: Int, row: Int) -> Int {
            // Four neighboring materials; no identical adjacent cells and a
            // repeat period larger than the traversable length of a room.
            ((column + 3*row + room) % 4 + 4) % 4
        }
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
                let distance = 8 + random()*30
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
            let rows = max(1, Int(patch.height/58))
            for row in 0..<rows {
                let kinds = ["vegetation", "boulder", "wall", "vegetation", "debris"]
                let kind = kinds[(row+index+room)%kinds.count]
                let name = "world1_\(theme.family)_\(kind)"
                let height = min(72, (patch.width-4)/max(0.5, aspect(name)))
                let y = patch.minY + CGFloat(row+1)*patch.height/CGFloat(rows+1)
                add(name, x: patch.midX + (random()-0.5)*min(10, patch.width*0.2),
                    y: y, height: max(14, height), inside: patch)
                if patch.width >= 70, row.isMultiple(of: 2) {
                    add("forest_broadleaf_polished", x: patch.midX, y: y,
                        height: min(105, patch.width/aspect("forest_broadleaf_polished")-4), inside: patch)
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
        // Atmospheric liquids live beyond combat bounds. Existing gameplay
        // hazards remain authoritative; these never create undamaging pools inside a lane.
        let pools: [CGRect] = (theme == .swamp || theme == .caves)
            ? [CGRect(x: bounds.minX-185, y: bounds.minY+bounds.height*0.25,
                      width: 130, height: 170),
               CGRect(x: bounds.maxX+45, y: bounds.minY+bounds.height*0.65,
                      width: 120, height: 145)] : []
        return Plan(room: room, theme: theme, bounds: bounds, groundBounds: ground,
            blocked: blocked, props: props, pools: pools,
            groundOrigin: CGPoint(x: bounds.midX-256, y: bounds.minY-128))
    }
}
