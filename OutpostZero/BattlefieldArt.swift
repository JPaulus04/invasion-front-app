import SpriteKit

/// Original vector room artwork. No external art dependencies.
enum BattlefieldArt {
    /// Low-profile asymmetrical debris silhouette shared by the static room
    /// floor and zone-specific dressing. No circular terrain stamps.
    static func terrainShape(width: CGFloat, height: CGFloat, variation: Int) -> CGPath {
        let bend = CGFloat(variation % 5) * 0.025
        let path = CGMutablePath()
        path.move(to: CGPoint(x: -width * 0.53, y: -height * 0.09))
        path.addQuadCurve(
            to: CGPoint(x: -width * 0.20, y: height * (0.40 + bend)),
            control: CGPoint(x: -width * 0.51, y: height * 0.33)
        )
        path.addQuadCurve(
            to: CGPoint(x: width * 0.25, y: height * 0.31),
            control: CGPoint(x: width * 0.01, y: height * 0.56)
        )
        path.addQuadCurve(
            to: CGPoint(x: width * 0.50, y: -height * 0.09),
            control: CGPoint(x: width * 0.49, y: height * 0.25)
        )
        path.addQuadCurve(
            to: CGPoint(x: width * 0.13, y: -height * 0.44),
            control: CGPoint(x: width * 0.43, y: -height * 0.36)
        )
        path.addQuadCurve(
            to: CGPoint(x: -width * 0.35, y: -height * (0.25 + bend)),
            control: CGPoint(x: -width * 0.07, y: -height * 0.55)
        )
        path.closeSubpath()
        return path
    }

    static func install(in scene: SKScene, behind gameplay: SKNode) {
        gameplay.childNode(withName: "roomArtwork")?.removeFromParent()
        let artwork = SKNode()
        artwork.name = "roomArtwork"
        artwork.zPosition = -20
        gameplay.addChild(artwork)
        let room = RoomRules.bounds(for: scene.size).insetBy(dx: -12, dy: -12)
        let floor = SKShapeNode(rect: room, cornerRadius: 18)
        floor.fillColor = SKColor(red: 0.27, green: 0.32, blue: 0.25, alpha: 1)
        floor.strokeColor = SKColor(red: 0.47, green: 0.55, blue: 0.43, alpha: 1)
        floor.lineWidth = 7
        artwork.addChild(floor)
        // Transparent lighting over the original room color. Gameplay keeps
        // its original silhouettes and collision limits.
        let forestSurface = SKSpriteNode(texture: FrontierFloorArt.texture(
            for: room.insetBy(dx: 5, dy: 5).size))
        forestSurface.name = "frontierFloorSurface"
        forestSurface.position = CGPoint(x: room.midX, y: room.midY)
        forestSurface.size = room.insetBy(dx: 5, dy: 5).size
        forestSurface.alpha = 0.92
        forestSurface.zPosition = 0.01
        artwork.addChild(forestSurface)
        // The room perimeter replaces the scrolling road and base-defense lane.
        // Keep the forest floor uninterrupted; the old horizontal guide lines
        // made the arena resemble a grid instead of natural terrain.
        // A restrained, irregular forest-floor treatment. The previous broad
        // ellipses read like painted circles at phone scale, and evenly spaced
        // marks looked like guide lines. No collision or scrolling is involved.
        for index in 0..<12 {
            let nx = CGFloat((index * 43 + 9) % 97) / 97
            let ny = CGFloat((index * 59 + 23) % 89) / 89
            let width = CGFloat(23 + (index * 11) % 29)
            let height = CGFloat(9 + (index * 7) % 13)
            let soil = SKShapeNode(path: terrainShape(
                width: width, height: height, variation: index
            ))
            soil.position = CGPoint(
                x: room.minX + 24 + (room.width - 48) * nx,
                y: room.minY + 27 + (room.height - 54) * ny
            )
            soil.zRotation = CGFloat(index % 7 - 3) * 0.12
            soil.fillColor = index.isMultiple(of: 3)
                ? SKColor(red: 0.28, green: 0.24, blue: 0.18, alpha: 0.12)
                : SKColor(red: 0.19, green: 0.33, blue: 0.23, alpha: 0.10)
            soil.strokeColor = .clear
            artwork.addChild(soil)
        }
        // Tiny litter is independent of soil patches and avoids aligned rows.
        // Keeping detail small preserves the pilot and enemy silhouettes.
        for index in 0..<25 {
            let x = CGFloat((index * 41 + 19) % 101) / 101
            let y = CGFloat((index * 67 + 31) % 103) / 103
            let leaf = SKShapeNode(path: terrainShape(
                width: CGFloat(4 + index % 5), height: CGFloat(2 + index % 3),
                variation: index + 2
            ))
            leaf.position = CGPoint(
                x: room.minX + 18 + (room.width - 36) * x,
                y: room.minY + 18 + (room.height - 36) * y
            )
            leaf.zRotation = CGFloat(index % 9) * 0.34
            leaf.fillColor = index.isMultiple(of: 4)
                ? SKColor(red: 0.64, green: 0.49, blue: 0.26, alpha: 0.34)
                : SKColor(red: 0.41, green: 0.57, blue: 0.30, alpha: 0.30)
            leaf.strokeColor = .clear
            artwork.addChild(leaf)
        }
        let entrance = SKShapeNode(rectOf: CGSize(width: 86, height: 12), cornerRadius: 4)
        entrance.fillColor = .systemTeal
        entrance.strokeColor = .white
        entrance.position = CGPoint(x: room.midX, y: room.minY)
        artwork.addChild(entrance)
    }
}
