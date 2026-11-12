import SpriteKit
import UIKit

/// Four cached production sprites; presentation never changes combat geometry.
/// Small keyed actions pause with the arena and allocate nothing per frame.
enum BossArtwork {
    static let names = ["boss_root_lord", "boss_toxic_matriarch", "boss_warforge", "boss_frost_wraith"]
    static let colors: [SKColor] = [.systemGreen, .systemGreen, .systemOrange, .systemCyan]
    private static var textures: [Int: SKTexture] = [:]

    static func install(on node: SKShapeNode, world: Int) {
        let index = max(0, min(3, world))
        let texture: SKTexture
        if let cached = textures[index] { texture = cached }
        else {
            texture = SKTexture(imageNamed: names[index])
            texture.filteringMode = .linear
            textures[index] = texture
        }
        node.fillColor = .clear
        node.strokeColor = .clear
        let shadow = SKShapeNode(ellipseOf: CGSize(width: 116, height: 38))
        shadow.name = "bossContactShadow"
        shadow.position.y = -25
        shadow.fillColor = .black.withAlphaComponent(0.32)
        shadow.strokeColor = .clear
        shadow.zPosition = -0.1
        node.addChild(shadow)
        let sprite = SKSpriteNode(texture: texture)
        sprite.name = "bossArt"
        let size = texture.size()
        sprite.size = CGSize(width: 184, height: 184 * size.height / max(1, size.width))
        sprite.position.y = 22
        sprite.zPosition = 1
        node.addChild(sprite)
        // Subtle breathing/hover avoids the old whole-character bouncing.
        // This is procedural motion, not an authored limb animation cycle.
        let rise: CGFloat = index == 3 ? 4 : 1.5
        sprite.run(.repeatForever(.sequence([
            .moveBy(x: 0, y: rise, duration: 1.25),
            .moveBy(x: 0, y: -rise, duration: 1.25)
        ])), withKey: "bossBreathing")
        let core = SKShapeNode(circleOfRadius: index == 2 ? 7 : 5)
        core.name = "bossCoreGlow"
        core.position = CGPoint(x: 0, y: index == 3 ? -7 : 17)
        core.fillColor = colors[index].withAlphaComponent(0.30)
        core.strokeColor = .clear
        core.glowWidth = 4
        core.zPosition = 2
        node.addChild(core)
        core.run(.repeatForever(.sequence([
            .fadeAlpha(to: 0.35, duration: 0.8),
            .fadeAlpha(to: 0.8, duration: 0.8)
        ])), withKey: "bossCorePulse")
    }

    static func enrage(_ node: SKNode) {
        guard let core = node.childNode(withName: "bossCoreGlow") as? SKShapeNode else { return }
        core.fillColor = .systemOrange
        core.glowWidth = 7
        core.setScale(1.3)
    }
}
