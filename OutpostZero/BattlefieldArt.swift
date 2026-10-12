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
        floor.fillColor = SKColor(red: 0.23, green: 0.27, blue: 0.23, alpha: 1)
        floor.strokeColor = SKColor(red: 0.47, green: 0.55, blue: 0.43, alpha: 1)
        floor.lineWidth = 7
        artwork.addChild(floor)
        // The room perimeter replaces the scrolling road and base-defense lane.
        for row in 0..<Int(room.height / 48) {
            let line = SKShapeNode(rectOf: CGSize(width: room.width - 18, height: 1))
            line.fillColor = SKColor.white.withAlphaComponent(0.05)
            line.strokeColor = .clear
            line.position = CGPoint(x: room.midX, y: room.minY + CGFloat(row) * 48 + 24)
            artwork.addChild(line)
        }
        let entrance = SKShapeNode(rectOf: CGSize(width: 86, height: 12), cornerRadius: 4)
        entrance.fillColor = .systemTeal
        entrance.strokeColor = .white
        entrance.position = CGPoint(x: room.midX, y: room.minY)
        artwork.addChild(entrance)
    }
}
