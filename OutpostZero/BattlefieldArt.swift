import SpriteKit

/// Original vector room artwork. No external art dependencies.
enum BattlefieldArt {
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
        // The room perimeter replaces the scrolling road and base-defense lane.
        // Keep the forest floor uninterrupted; the old horizontal guide lines
        // made the arena resemble a grid instead of natural terrain.
        // Low-contrast organic patches break up the flat floor without
        // reintroducing the horizontal guide lines the art review rejected.
        // Deterministic placement keeps screenshots comparable between builds.
        let patches: [(CGFloat, CGFloat, CGFloat, CGFloat)] = [
            (0.17, 0.22, 0.19, 0.10), (0.74, 0.28, 0.22, 0.12),
            (0.38, 0.43, 0.24, 0.11), (0.81, 0.59, 0.17, 0.09),
            (0.22, 0.72, 0.21, 0.10), (0.58, 0.82, 0.26, 0.12)
        ]
        for (index, patch) in patches.enumerated() {
            let (x, y, width, height) = patch
            let soil = SKShapeNode(ellipseOf: CGSize(
                width: room.width * width, height: room.height * height))
            soil.position = CGPoint(
                x: room.minX + room.width * x,
                y: room.minY + room.height * y)
            soil.fillColor = index.isMultiple(of: 2)
                ? SKColor(red: 0.35, green: 0.30, blue: 0.22, alpha: 0.16)
                : SKColor(red: 0.42, green: 0.51, blue: 0.29, alpha: 0.13)
            soil.strokeColor = .clear
            artwork.addChild(soil)
        }
        // Broad, extremely subtle color variation comes from the soil patches
        // above. Do not add hard-edged circular light spots: the simulator
        // review showed those read as painted dots, not natural sunlight.
        // Small isolated leaf clusters are intentionally irregular, not rows.
        for index in 0..<28 {
            let x = CGFloat((index * 37 + 11) % 97) / 97
            let y = CGFloat((index * 53 + 29) % 101) / 101
            let leaf = SKShapeNode(ellipseOf: CGSize(
                width: CGFloat(4 + index % 4), height: CGFloat(2 + index % 3)))
            leaf.position = CGPoint(
                x: room.minX + 18 + (room.width - 36) * x,
                y: room.minY + 18 + (room.height - 36) * y)
            leaf.zRotation = CGFloat(index % 7) * 0.38
            leaf.fillColor = index.isMultiple(of: 3)
                ? SKColor(red: 0.71, green: 0.55, blue: 0.25, alpha: 0.37)
                : SKColor(red: 0.51, green: 0.65, blue: 0.34, alpha: 0.30)
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
