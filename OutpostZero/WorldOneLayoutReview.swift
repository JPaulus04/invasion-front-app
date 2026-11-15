import SpriteKit

/// Simulator-only layout visualization for Build 337. These overlays are
/// noninteractive: they do not modify physics, spawning, camera or movement.
enum WorldOneLayoutReview {
    static func make(_ layout: WorldOneRoomGeometry.Layout) -> SKNode {
        let root = SKNode()
        root.name = "build337LayoutReview"
        root.zPosition = 80

        func outline(_ rect: CGRect, color: SKColor, width: CGFloat = 2) {
            let node = SKShapeNode(rect: rect)
            node.fillColor = .clear
            node.strokeColor = color
            node.lineWidth = width
            node.zPosition = 0
            root.addChild(node)
        }

        func marker(_ point: CGPoint, color: SKColor, radius: CGFloat = 8) {
            let node = SKShapeNode(circleOfRadius: radius)
            node.position = point
            node.fillColor = color.withAlphaComponent(0.85)
            node.strokeColor = .white
            node.lineWidth = 1.5
            root.addChild(node)
        }

        outline(layout.bounds, color: .cyan, width: 3)
        for pocket in layout.combatPockets {
            outline(pocket, color: .green)
        }
        outline(layout.decorationExclusion, color: .yellow)
        marker(layout.entry, color: .systemBlue)
        if let exit = layout.exit { marker(exit, color: .systemGreen) }
        if let objective = layout.objective {
            marker(objective, color: .systemOrange, radius: 15)
        }
        for approach in layout.approachPoints {
            marker(approach, color: .systemRed, radius: 6)
        }

        let label = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        label.text = "337 / \(layout.kind) — QA ONLY"
        label.fontSize = 17
        label.fontColor = .white
        label.horizontalAlignmentMode = .center
        label.position = CGPoint(x: layout.bounds.midX, y: layout.bounds.maxY + 24)
        root.addChild(label)
        return root
    }
}
