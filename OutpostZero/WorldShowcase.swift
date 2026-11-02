import SpriteKit
import UIKit

/// Shared physical staging for the hub. All coordinates are local; no save or
/// combat state lives here. The island is an irregular mesh, never a card crop.
enum WorldShowcase {
    static func polygon(_ points: [CGPoint], color: SKColor) -> SKShapeNode {
        let path = CGMutablePath()
        guard let first = points.first else { return SKShapeNode() }
        path.move(to: first)
        for point in points.dropFirst() { path.addLine(to: point) }
        path.closeSubpath()
        let node = SKShapeNode(path: path)
        node.fillColor = color
        node.strokeColor = .clear
        return node
    }

    static func island(world: Int, locked: Bool, width: CGFloat,
                       texture: (String) -> SKTexture?) -> SKNode {
        let root = SKNode()
        root.name = "worldDiorama"
        let palettes: [SKColor] = [
            SKColor(red: 0.32, green: 0.57, blue: 0.29, alpha: 1),
            SKColor(red: 0.27, green: 0.42, blue: 0.46, alpha: 1),
            SKColor(red: 0.42, green: 0.36, blue: 0.26, alpha: 1),
            SKColor(red: 0.43, green: 0.66, blue: 0.75, alpha: 1)]
        let tint = palettes[world % palettes.count]
        let outline: [CGPoint] = [CGPoint(x: -153,y: -8), CGPoint(x: -131,y: 40),
            CGPoint(x: -76,y: 66), CGPoint(x: -25,y: 58), CGPoint(x: 21,y: 81),
            CGPoint(x: 83,y: 62), CGPoint(x: 145,y: 25), CGPoint(x: 157,y: -12),
            CGPoint(x: 112,y: -52), CGPoint(x: 57,y: -72), CGPoint(x: 3,y: -63),
            CGPoint(x: -54,y: -76), CGPoint(x: -117,y: -48)]
        let shadow = SKSpriteNode(texture: ProductionPresentation.glow(.black.withAlphaComponent(0.6)))
        shadow.size = CGSize(width: 330, height: 100)
        shadow.position.y = -113
        shadow.zPosition = -3
        root.addChild(shadow)
        // Separate cliff facets expose the thickness of the floating landmass.
        for index in 0..<outline.count {
            let a = outline[index], b = outline[(index + 1) % outline.count]
            let drop = CGFloat(32 + index % 3 * 12)
            let facet = polygon([a,b,CGPoint(x:b.x * 0.82,y:b.y-drop),
                                 CGPoint(x:a.x * 0.82,y:a.y-drop-7)],
                color: SKColor(white: 0.14 + CGFloat(index % 4) * 0.035, alpha: 1))
            facet.zPosition = -2
            root.addChild(facet)
        }
        let ground = polygon(outline, color: tint)
        root.addChild(ground)
        // Discrete raised terraces, not perspective applied to a rectangle.
        for i in 0..<3 {
            let x = CGFloat(i - 1) * 92
            let shelf = polygon([CGPoint(x:x-37,y:20),CGPoint(x:x-12,y:39),
                CGPoint(x:x+34,y:25),CGPoint(x:x+27,y:11),CGPoint(x:x-11,y:4)],
                color: tint.withAlphaComponent(0.75))
            shelf.position.y = CGFloat(i % 2) * 16
            shelf.zPosition = 0.2
            root.addChild(shelf)
        }
        let family = ["ruined_outpost", "swamp_basin", "toxic_caves", "boss_arena"][world % 4]
        let props: [(String, CGFloat, CGFloat, CGFloat)] = world == 0
            ? [("vegetation",-114,23,92),("wall",-64,43,91),("vegetation",111,14,103),
               ("boulder",87,-34,57),("debris",-82,-44,55),("lantern",62,37,63)]
            : [("wall",-100,29,91),("boulder",-60,-36,64),("wall",94,27,104),
               ("crate",104,-32,50),("lantern",-26,52,60),("vegetation",-120,-16,55)]
        for (kind,x,y,height) in props {
            guard let art = texture("world1_\(family)_\(kind)") else { continue }
            let sprite = SKSpriteNode(texture: art)
            let ratio = art.size().width / max(1,art.size().height)
            sprite.size = CGSize(width: min(112,height*ratio),height: min(height,112/max(0.1,ratio)))
            sprite.anchorPoint = CGPoint(x:0.5,y:WorldOneArtMetrics.groundAnchorY(for:"world1_\(family)_\(kind)"))
            sprite.position = CGPoint(x:x,y:y)
            sprite.zPosition = 2 - y / 100
            root.addChild(sprite)
        }
        // Layered world-specific landmarks establish depth at actual phone scale.
        // Keep the portal approach clear and place the skyline behind the playable plateau.
        let skylineColors: [(SKColor, SKColor)] = [
            (SKColor(red:0.19,green:0.42,blue:0.30,alpha:1),
             SKColor(red:0.35,green:0.66,blue:0.42,alpha:1)),
            (SKColor(red:0.16,green:0.34,blue:0.38,alpha:1),
             SKColor(red:0.35,green:0.69,blue:0.64,alpha:1)),
            (SKColor(red:0.36,green:0.25,blue:0.23,alpha:1),
             SKColor(red:0.86,green:0.49,blue:0.25,alpha:1)),
            (SKColor(red:0.32,green:0.51,blue:0.63,alpha:1),
             SKColor(red:0.67,green:0.86,blue:0.96,alpha:1))
        ]
        let palette = skylineColors[world % skylineColors.count]
        for index in 0..<7 {
            let x = CGFloat(index - 3) * 43 + CGFloat(index % 2) * 9
            let y: CGFloat = 23 + CGFloat((index * 11) % 23)
            let tall = CGFloat(18 + (index * 13) % 28)
            let landmark = polygon([
                CGPoint(x:x-11,y:y), CGPoint(x:x-8,y:y+tall*0.68),
                CGPoint(x:x,y:y+tall), CGPoint(x:x+8,y:y+tall*0.66),
                CGPoint(x:x+12,y:y)
            ], color: index.isMultiple(of: 2) ? palette.0 : palette.1)
            landmark.zPosition = 0.45 + CGFloat(index % 3) * 0.04
            root.addChild(landmark)
            let footShadow = SKShapeNode(ellipseOf: CGSize(width:29,height:9))
            footShadow.position = CGPoint(x:x,y:y-2)
            footShadow.fillColor = .black.withAlphaComponent(0.17)
            footShadow.strokeColor = .clear
            footShadow.zPosition = 0.43
            root.addChild(footShadow)
        }
        // Rim-light and small ground fragments give the floating island a clear silhouette.
        let rim = polygon(outline, color: .clear)
        rim.strokeColor = palette.1.withAlphaComponent(0.65)
        rim.lineWidth = 2.4
        rim.zPosition = 0.18
        root.addChild(rim)
        for index in 0..<13 {
            let x = CGFloat((index * 67) % 260) - 130
            let y = CGFloat((index * 31) % 92) - 47
            let pebble = SKShapeNode(ellipseOf: CGSize(width:CGFloat(5+index%4*3),height:CGFloat(2+index%3*2)))
            pebble.fillColor = palette.1.withAlphaComponent(0.22)
            pebble.strokeColor = .clear
            pebble.position = CGPoint(x:x,y:y)
            pebble.zPosition = 0.21
            root.addChild(pebble)
        }
        // Build 331: biome-specific structures rather than identical silhouettes.
        // A skyline alone reads as decoration; recognizable landmarks give each world identity.
        let structures: [(CGFloat, CGFloat, CGFloat)] = [
            (-94, 39, 0.88), (91, 35, 1.12)
        ]
        for (x, y, factor) in structures {
            let monument = SKNode()
            monument.position = CGPoint(x: x, y: y)
            monument.zPosition = 1.1
            root.addChild(monument)
            switch world % 4 {
            case 0:
                // Ruined forest watchtowers, split stone and overgrown crowns.
                let tower = polygon([
                    CGPoint(x:-14,y:0),CGPoint(x:-11,y:45*factor),
                    CGPoint(x:-4,y:51*factor),CGPoint(x:3,y:38*factor),
                    CGPoint(x:12,y:42*factor),CGPoint(x:15,y:0)
                ], color: SKColor(red:0.35,green:0.38,blue:0.32,alpha:1))
                monument.addChild(tower)
                let crown = SKShapeNode(ellipseOf: CGSize(width:42*factor,height:29*factor))
                crown.position.y = 43*factor
                crown.fillColor = SKColor(red:0.14,green:0.39,blue:0.23,alpha:1)
                crown.strokeColor = SKColor(red:0.40,green:0.65,blue:0.31,alpha:1)
                crown.lineWidth = 2
                monument.addChild(crown)
            case 1:
                // Scrapyard: stacked industrial wreckage with a lit antenna.
                let base = polygon([
                    CGPoint(x:-22,y:0),CGPoint(x:-18,y:24*factor),
                    CGPoint(x:8,y:32*factor),CGPoint(x:21,y:0)
                ], color: SKColor(red:0.30,green:0.39,blue:0.42,alpha:1))
                monument.addChild(base)
                let mast = SKShapeNode(rectOf: CGSize(width:5,height:56*factor))
                mast.position = CGPoint(x:5,y:39*factor)
                mast.fillColor = SKColor(red:0.64,green:0.73,blue:0.72,alpha:1)
                mast.strokeColor = .clear
                monument.addChild(mast)
                let beacon = SKShapeNode(circleOfRadius:5)
                beacon.position = CGPoint(x:5,y:69*factor)
                beacon.fillColor = .systemOrange
                beacon.glowWidth = 5
                monument.addChild(beacon)
            case 2:
                // Volcanic ruins: a cracked basalt obelisk with a hot seam.
                let rock = polygon([
                    CGPoint(x:-17,y:0),CGPoint(x:-13,y:36*factor),
                    CGPoint(x:0,y:65*factor),CGPoint(x:15,y:27*factor),
                    CGPoint(x:18,y:0)
                ], color: SKColor(red:0.23,green:0.24,blue:0.28,alpha:1))
                monument.addChild(rock)
                let fissure = SKShapeNode()
                let path = CGMutablePath()
                path.move(to:CGPoint(x:0,y:7))
                path.addLine(to:CGPoint(x:-3,y:24*factor))
                path.addLine(to:CGPoint(x:5,y:38*factor))
                fissure.path = path
                fissure.strokeColor = SKColor(red:1,green:0.43,blue:0.12,alpha:1)
                fissure.lineWidth = 3
                fissure.glowWidth = 4
                monument.addChild(fissure)
            default:
                // Frozen citadel: crystalline spires with cold edge highlights.
                for offset in [-12.0, 8.0] {
                    let crystal = polygon([
                        CGPoint(x:offset-11,y:0),CGPoint(x:offset-8,y:34*factor),
                        CGPoint(x:offset+2,y:65*factor),CGPoint(x:offset+12,y:0)
                    ], color: SKColor(red:0.45,green:0.77,blue:0.89,alpha:0.95))
                    crystal.strokeColor = SKColor(red:0.78,green:0.95,blue:1,alpha:1)
                    crystal.lineWidth = 1.5
                    monument.addChild(crystal)
                }
            }
        }
        // Broken slabs lead into the upright portal without a literal road.
        for i in 0..<5 {
            let y = CGFloat(-54+i*15)
            let slab = polygon([CGPoint(x:-17,y:y),CGPoint(x:1,y:y+7),
                CGPoint(x:24,y:y+3),CGPoint(x:8,y:y-5)],
                color: SKColor(red:0.62,green:0.65,blue:0.52,alpha:0.65))
            slab.position.x = CGFloat(i % 2) * 6
            slab.zPosition = 0.3
            root.addChild(slab)
        }
        if !locked {
            let portal = SKShapeNode(ellipseOf: CGSize(width:62,height:91))
            portal.position = CGPoint(x:5,y:43)
            portal.fillColor = SKColor(red:0.02,green:0.12,blue:0.32,alpha:1)
            portal.strokeColor = .systemCyan
            portal.lineWidth = 6
            portal.glowWidth = 3
            portal.zPosition = 3
            root.addChild(portal)
            for i in 0..<4 {
                let arc = SKShapeNode(ellipseOf: CGSize(width:CGFloat(17+i*10),height:CGFloat(25+i*16)))
                arc.strokeColor = SKColor(red:0.3,green:0.7,blue:1,alpha:0.8)
                arc.lineWidth = 2
                arc.fillColor = .clear
                arc.zRotation = CGFloat(i)*0.6
                portal.addChild(arc)
                if !UIAccessibility.isReduceMotionEnabled {
                    arc.run(.repeatForever(.rotate(byAngle: .pi*2,duration:Double(5+i))))
                }
            }
        } else {
            // The silhouette is visible through drifting mist; no lock card.
            root.children.filter { $0 !== shadow }.forEach { $0.alpha *= 0.32 }
            for i in 0..<5 {
                let mist = SKSpriteNode(texture: ProductionPresentation.glow(SKColor(red:0.52,green:0.68,blue:0.77,alpha:0.85)))
                mist.size = CGSize(width:190,height:125)
                mist.position = CGPoint(x:CGFloat(i-2)*55,y:CGFloat(i%2)*45)
                mist.zPosition = 8
                root.addChild(mist)
                if !UIAccessibility.isReduceMotionEnabled {
                    mist.run(.repeatForever(.sequence([.moveBy(x:18,y:4,duration:3+Double(i)),.moveBy(x:-18,y:-4,duration:3+Double(i))])))
                }
            }
        }
        // A floating landmass should read as a living destination, not a static menu illustration.
        // The entire diorama breathes in place; world navigation remains owned by the scene.
        if !UIAccessibility.isReduceMotionEnabled {
            root.run(.repeatForever(.sequence([
                .moveBy(x: 0, y: 6, duration: 2.4),
                .moveBy(x: 0, y: -6, duration: 2.4)
            ])), withKey: "worldFloat")
        }
        root.setScale(width / 340)
        return root
    }

    static func hangar(width: CGFloat) -> SKNode {
        let root = SKNode()
        root.name = "pilotHangar"
        for side in [-1,1] {
            let x = CGFloat(side)*width*0.40
            let beam = polygon([CGPoint(x:x-12,y:-35),CGPoint(x:x-12,y:143),
                CGPoint(x:x+12,y:169),CGPoint(x:x+12,y:-35)],
                color: SKColor(red:0.08,green:0.15,blue:0.21,alpha:1))
            root.addChild(beam)
            let light = SKShapeNode(rectOf: CGSize(width:3,height:120),cornerRadius:1)
            light.position = CGPoint(x:x,y:62)
            light.fillColor = .systemCyan
            light.strokeColor = .clear
            light.glowWidth = 5
            root.addChild(light)
        }
        for i in (0..<3).reversed() {
            let deck = SKShapeNode(ellipseOf:CGSize(width:width*0.68-CGFloat(i)*17,height:52))
            deck.position.y = -39+CGFloat(i)*6
            deck.fillColor = SKColor(red:0.08+CGFloat(i)*0.035,green:0.17+CGFloat(i)*0.035,blue:0.23+CGFloat(i)*0.045,alpha:1)
            deck.strokeColor = i == 0 ? .systemCyan.withAlphaComponent(0.6) : .clear
            deck.lineWidth = 1.5
            root.addChild(deck)
        }
        return root
    }
}

extension WorldShowcase {
    /// Composed ruins occupy boundary pockets; the central 56% remains open.
    /// Ground mosaics are flush and decorative, never fake collision ledges.
    static func frontierRoom(bounds: CGRect, room: Int, family: String,
                             texture: (String) -> SKTexture?) -> SKNode {
        let root = SKNode()
        root.name = "frontierRoomComposition"
        let variant = (max(1,room)-1) % 4
        let center = CGPoint(x:bounds.midX,y:bounds.midY)
        // Four architectural footprints: broken plaza, offset courtyard,
        // crescent sanctuary and paired platforms. Distinct negative space.
        let anchors: [[CGPoint]] = [
            [CGPoint(x:0.10,y:0.28),CGPoint(x:0.87,y:0.70)],
            [CGPoint(x:0.12,y:0.65),CGPoint(x:0.86,y:0.25)],
            [CGPoint(x:0.10,y:0.48),CGPoint(x:0.89,y:0.50)],
            [CGPoint(x:0.12,y:0.78),CGPoint(x:0.86,y:0.73)]]
        let paving = SKNode()
        paving.zPosition = -1
        root.addChild(paving)
        let stone = family == "toxic_caves"
            ? SKColor(red:0.23,green:0.28,blue:0.32,alpha:0.68)
            : SKColor(red:0.48,green:0.48,blue:0.35,alpha:0.55)
        for row in 0..<7 {
            for column in 0..<5 {
                if (row*7+column*3+variant)%5 == 0 { continue }
                let x = center.x + CGFloat(column-2)*32 + CGFloat(row%2)*12
                let y = bounds.minY + bounds.height*0.27 + CGFloat(row)*28
                if variant == 1 && column > 2 { continue }
                if variant == 2 && row < 3 && column == 2 { continue }
                let tile = polygon([CGPoint(x:-14,y:-8),CGPoint(x:10,y:-10),
                    CGPoint(x:15,y:7),CGPoint(x:-9,y:11)],color:stone)
                tile.position = CGPoint(x:x,y:y)
                paving.addChild(tile)
                let crack = SKShapeNode()
                let path = CGMutablePath()
                path.move(to:CGPoint(x:-8,y:7));path.addLine(to:CGPoint(x:0,y:1));path.addLine(to:CGPoint(x:4,y:-6))
                crack.path = path
                crack.strokeColor = .black.withAlphaComponent(0.18)
                crack.lineWidth = 1
                tile.addChild(crack)
            }
        }
        for (group, anchor) in anchors[variant].enumerated() {
            let origin = CGPoint(x:bounds.minX+bounds.width*anchor.x,
                                 y:bounds.minY+bounds.height*anchor.y)
            for index in 0..<3 {
                let kind = index == 0 ? "wall" : index == 1 ? "vegetation" : "debris"
                let name = "world1_\(family)_\(kind)"
                guard let art = texture(name) else { continue }
                let node = SKSpriteNode(texture:art)
                let maxWidth = bounds.width * (index == 0 ? 0.25 : 0.17)
                let ratio = art.size().height / max(1,art.size().width)
                node.size = CGSize(width:maxWidth,height:maxWidth*ratio)
                node.anchorPoint = CGPoint(x:0.5,y:WorldOneArtMetrics.groundAnchorY(for:name))
                let inward: CGFloat = group == 0 ? 1 : -1
                node.position = CGPoint(x:origin.x+inward*CGFloat(index)*7,
                                        y:origin.y-CGFloat(index)*22)
                node.zPosition = 0.4+CGFloat(index)*0.1
                root.addChild(node)
            }
        }
        // Build 331: architectural floor language changes per room rather than
        // reusing the same square paving across the entire campaign.
        // Keep the middle open: these are visual ground treatments, not collisions.
        let approach = SKNode()
        approach.name = "environmentalApproach"
        approach.zPosition = -0.8
        root.addChild(approach)
        let accent: SKColor = family == "toxic_caves"
            ? SKColor(red:0.42,green:0.81,blue:0.39,alpha:0.45)
            : family == "swamp_basin"
                ? SKColor(red:0.23,green:0.69,blue:0.67,alpha:0.38)
                : SKColor(red:0.78,green:0.67,blue:0.40,alpha:0.45)
        let bend: CGFloat = variant.isMultiple(of: 2) ? 1 : -1
        for step in 0..<7 {
            let progress = CGFloat(step) / 6
            let x = center.x + bend * sin(progress * .pi) * bounds.width * 0.15
            let y = bounds.minY + bounds.height * (0.19 + progress * 0.57)
            let halfWidth: CGFloat = 12 + (1-progress) * 8
            let fragment = polygon([
                CGPoint(x:-halfWidth,y:-5),CGPoint(x:halfWidth*0.63,y:-7),
                CGPoint(x:halfWidth,y:2),CGPoint(x:-halfWidth*0.35,y:8)
            ],color:accent.withAlphaComponent(0.18+progress*0.22))
            fragment.position = CGPoint(x:x + CGFloat(step%3-1)*11,y:y)
            fragment.zRotation = CGFloat((step*17)%11-5) * .pi / 180
            approach.addChild(fragment)
        }
        // Stronger boundary silhouettes frame the play space without covering
        // the pilot or turning the central arena into a corridor.
        for side in [-1, 1] {
            let sign = CGFloat(side)
            let x = center.x + sign * bounds.width * 0.39
            let y = bounds.minY + bounds.height * (variant == 2 ? 0.52 : 0.39)
            let shadow = SKShapeNode(ellipseOf:CGSize(width:bounds.width*0.18,height:24))
            shadow.position = CGPoint(x:x,y:y-9)
            shadow.fillColor = SKColor.black.withAlphaComponent(0.18)
            shadow.strokeColor = .clear
            shadow.zPosition = 0.15
            root.addChild(shadow)
            let monument = polygon([
                CGPoint(x:-16,y:0),CGPoint(x:-13,y:27),
                CGPoint(x:-7,y:39),CGPoint(x:6,y:35),
                CGPoint(x:15,y:0)
            ],color:family == "toxic_caves"
                ? SKColor(red:0.25,green:0.30,blue:0.32,alpha:0.88)
                : SKColor(red:0.37,green:0.40,blue:0.34,alpha:0.85))
            monument.position = CGPoint(x:x,y:y)
            monument.zPosition = 0.25
            root.addChild(monument)
            let edge = SKShapeNode()
            let path = CGMutablePath()
            path.move(to:CGPoint(x:-7,y:5))
            path.addLine(to:CGPoint(x:-5,y:27))
            path.addLine(to:CGPoint(x:0,y:33))
            edge.path = path
            edge.strokeColor = accent.withAlphaComponent(0.75)
            edge.lineWidth = 2
            monument.addChild(edge)
        }
        // Ruined gate shoulders frame the exit and establish its destination.
        for side in [-1,1] {
            guard let art = texture("world1_\(family)_boulder") else { continue }
            let node = SKSpriteNode(texture:art)
            node.size = CGSize(width:58,height:58*art.size().height/max(1,art.size().width))
            node.position = CGPoint(x:bounds.midX+CGFloat(side)*bounds.width*0.29,
                                    y:bounds.maxY-102)
            node.zPosition = 0.8
            root.addChild(node)
        }
        return root
    }
}
