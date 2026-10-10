import SpriteKit

/// Original vector-drawn battlefield artwork. No external art dependencies.
enum BattlefieldArt {
    static func install(in scene: SKScene, behind gameplay: SKNode) {
        let ground = SKShapeNode(rectOf: scene.size)
        ground.position = CGPoint(x: scene.size.width / 2, y: scene.size.height / 2)
        ground.fillColor = SKColor(red: 0.13, green: 0.27, blue: 0.25, alpha: 1)
        ground.strokeColor = .clear
        ground.zPosition = -20
        gameplay.addChild(ground)

        let road = SKShapeNode(rectOf: CGSize(width: scene.size.width * 0.56, height: scene.size.height))
        road.position = CGPoint(x: scene.size.width / 2, y: scene.size.height / 2)
        road.fillColor = SKColor(red: 0.46, green: 0.38, blue: 0.27, alpha: 1)
        road.strokeColor = SKColor(red: 0.34, green: 0.30, blue: 0.24, alpha: 1)
        road.lineWidth = 4
        road.zPosition = -18
        gameplay.addChild(road)

        for index in 0..<18 {
            let side: CGFloat = index.isMultiple(of: 2) ? 0.11 : 0.89
            let tree = SKShapeNode(circleOfRadius: CGFloat(13 + index % 4 * 3))
            tree.position = CGPoint(x: scene.size.width * side, y: CGFloat(index) * scene.size.height / 17)
            tree.fillColor = SKColor(red: 0.08, green: CGFloat(0.30 + Double(index % 3) * 0.05), blue: 0.21, alpha: 1)
            tree.strokeColor = SKColor(red: 0.05, green: 0.19, blue: 0.15, alpha: 1)
            tree.lineWidth = 3
            tree.zPosition = -16
            gameplay.addChild(tree)
        }
    }
}
