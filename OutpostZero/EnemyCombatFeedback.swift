import SpriteKit

/// Combat-only visuals. All hitboxes, damage values and reward logic stay in
/// OutpostScene. Bounded fragments keep late-game effects mobile-friendly.
enum EnemyCombatFeedback {
    static func hit(_ enemy: SKShapeNode, from origin: CGPoint) {
        enemy.removeAction(forKey: "enemyHitFeedback")
        enemy.run(.sequence([
            .colorize(with: .white, colorBlendFactor: 0.72, duration: 0.035),
            .colorize(withColorBlendFactor: 0, duration: 0.13)
        ]), withKey: "enemyHitFeedback")
        guard let art = (enemy.childNode(withName: "enemyArt") ?? enemy.childNode(withName: "bossArt")) as? SKSpriteNode else { return }
        art.removeAction(forKey: "spriteHitFeedback")
        art.run(.sequence([
            .colorize(with: .white, colorBlendFactor: 0.88, duration: 0.045),
            .colorize(withColorBlendFactor: 0, duration: 0.13)
        ]), withKey: "spriteHitFeedback")
        // Repeated hits should not snap the sprite to an arbitrary X origin.
        // Reset only the previous recoil displacement before applying a new one.
        art.removeAction(forKey: "spriteImpactRecoil")
        let direction: CGFloat = enemy.position.x >= origin.x ? 1 : -1
        art.run(.sequence([
            .moveTo(x: direction * 3.2, duration: 0.045),
            .moveTo(x: 0, duration: 0.11)
        ]), withKey: "spriteImpactRecoil")
    }

    static func impact(in parent: SKNode, at position: CGPoint,
                       color: SKColor, destroyed: Bool) {
        let ring = SKShapeNode(circleOfRadius: destroyed ? 10 : 5)
        ring.position = position
        ring.strokeColor = color.withAlphaComponent(0.9)
        ring.fillColor = .clear
        ring.lineWidth = destroyed ? 2 : 1.3
        ring.glowWidth = destroyed ? 1.5 : 0.6
        ring.zPosition = 11
        parent.addChild(ring)
        ring.run(.sequence([
            .group([.scale(to: destroyed ? 1.8 : 1.4, duration: 0.22),
                    .fadeOut(withDuration: 0.22)]), .removeFromParent()
        ]))
        let flash = SKShapeNode(circleOfRadius: destroyed ? 8 : 4)
        flash.position = position
        flash.fillColor = color.withAlphaComponent(destroyed ? 0.35 : 0.22)
        flash.strokeColor = .clear
        flash.lineWidth = 1
        flash.zPosition = 11.2
        parent.addChild(flash)
        flash.run(.sequence([
            .group([.scale(to: 1.6, duration: 0.11),
                    .fadeOut(withDuration: 0.11)]), .removeFromParent()
        ]))
        let count = destroyed ? 5 : 2
        for i in 0..<count {
            let spark = SKShapeNode(rectOf: CGSize(
                width: destroyed ? 3 : 2, height: destroyed ? 7 : 4),
                cornerRadius: 1)
            spark.fillColor = i.isMultiple(of: 2) ? color : .white
            spark.strokeColor = .clear
            spark.position = position
            spark.zPosition = 12
            parent.addChild(spark)
            let angle = CGFloat(i) * .pi * 2 / CGFloat(count) + 0.35
            let length: CGFloat = destroyed ? 30 : 12
            spark.zRotation = angle
            spark.run(.sequence([
                .group([.moveBy(x: cos(angle) * length,
                                y: sin(angle) * length, duration: 0.22),
                        .fadeOut(withDuration: 0.22),
                        .scale(to: 0.4, duration: 0.22)]),
                .removeFromParent()
            ]))
        }
    }

    static func defeat(in parent: SKNode, enemy: SKShapeNode,
                       radius: CGFloat, role: Int, isBoss: Bool) {
        let point = enemy.position
        let tint: SKColor = isBoss ? .systemYellow :
            (role == 4 ? .systemCyan :
             (role == 5 ? .systemOrange :
              (role == 2 ? .systemPurple : .systemRed)))
        if let sprite = (enemy.childNode(withName: "enemyArt") ?? enemy.childNode(withName: "bossArt")) as? SKSpriteNode,
           let texture = sprite.texture {
            let echo = SKSpriteNode(texture: texture)
            echo.name = "enemyDefeatEcho"
            echo.size = sprite.size
            echo.position = CGPoint(x: point.x + sprite.position.x,
                                    y: point.y + sprite.position.y)
            echo.xScale = sprite.xScale
            echo.yScale = sprite.yScale
            echo.zRotation = sprite.zRotation
            echo.zPosition = 12.5
            parent.addChild(echo)
            echo.run(.sequence([
                .group([.scaleX(to: sprite.xScale * 1.18, duration: 0.28),
                        .scaleY(to: sprite.yScale * 1.18, duration: 0.28),
                        .colorize(with: tint, colorBlendFactor: 0.78, duration: 0.19),
                        .fadeOut(withDuration: 0.28),
                        .moveBy(x: 0, y: 9, duration: 0.28)]),
                .removeFromParent()
            ]))
        }
        let shock = SKShapeNode(ellipseOf: CGSize(
            width: radius * 1.5, height: max(8, radius * 0.46)))
        shock.position = CGPoint(x: point.x, y: point.y - radius * 0.6)
        shock.fillColor = .clear
        shock.strokeColor = tint.withAlphaComponent(0.75)
        shock.lineWidth = isBoss ? 4 : 2.5
        shock.zPosition = 10.7
        parent.addChild(shock)
        shock.run(.sequence([
            .group([.scale(to: isBoss ? 3.5 : 2.3, duration: 0.32),
                    .fadeOut(withDuration: 0.32)]), .removeFromParent()
        ]))
        let count = isBoss ? 5 : 3
        for i in 0..<count {
            let piece = SKShapeNode(rectOf: CGSize(
                width: isBoss ? 7 : 4, height: isBoss ? 13 : 8),
                cornerRadius: 1)
            piece.position = point
            piece.zPosition = 13
            piece.fillColor = i.isMultiple(of: 2) ? tint : .systemGray
            piece.strokeColor = .clear
            let angle = CGFloat(i) * .pi * 2 / CGFloat(count) + 0.2
            let reach: CGFloat = isBoss ? 48 : 26
            parent.addChild(piece)
            piece.run(.sequence([
                .group([.moveBy(x: cos(angle) * reach,
                                y: sin(angle) * reach - 9, duration: 0.33),
                        .rotate(byAngle: 1.5, duration: 0.33),
                        .fadeOut(withDuration: 0.33)]),
                .removeFromParent()
            ]))
        }
    }
}
