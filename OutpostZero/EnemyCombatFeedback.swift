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
        // Cache the authored sprite anchor so rapid hits cannot accumulate
        // recoil displacement or snap offset artwork back to x = 0.
        if art.userData == nil { art.userData = NSMutableDictionary() }
        let anchorKey = "combatRecoilAnchorX"
        let anchor: CGFloat
        if let stored = art.userData?[anchorKey] as? NSNumber {
            anchor = CGFloat(truncating: stored)
        } else {
            anchor = art.position.x
            art.userData?[anchorKey] = NSNumber(value: Double(anchor))
        }
        // A brief silhouette compression reads as physical impact even
        // when small projectiles overlap a detailed enemy illustration.
        // Reset scale before each hit so rapid fire cannot compound it.
        let scaleKey = "combatRecoilAnchorScale"
        let baseline: CGFloat
        if let saved = art.userData?[scaleKey] as? NSNumber {
            baseline = CGFloat(truncating: saved)
        } else {
            baseline = art.yScale
            art.userData?[scaleKey] = NSNumber(value: Double(baseline))
        }
        art.removeAction(forKey: "spriteImpactSquash")
        art.yScale = baseline
        art.run(.sequence([
            .scaleY(to: baseline * 0.92, duration: 0.045),
            .scaleY(to: baseline, duration: 0.11)
        ]), withKey: "spriteImpactSquash")
        art.removeAction(forKey: "spriteImpactRecoil")
        art.position.x = anchor
        let direction: CGFloat = enemy.position.x >= origin.x ? 1 : -1
        art.run(.sequence([
            .moveTo(x: anchor + direction * 3.2, duration: 0.045),
            .moveTo(x: anchor, duration: 0.11)
        ]), withKey: "spriteImpactRecoil")
    }

    /// A layered hit signature: white-hot core, expanding colored shock ring,
    /// and directional streaks. Effects remain visual-only and self-remove.
    static func impact(in parent: SKNode, at position: CGPoint,
                       color: SKColor, destroyed: Bool) {
        let duration: TimeInterval = destroyed ? 0.32 : 0.19
        let ring = SKShapeNode(circleOfRadius: destroyed ? 12 : 7)
        ring.name = "combatImpactRing"
        ring.position = position
        ring.strokeColor = color.withAlphaComponent(0.95)
        ring.fillColor = .clear
        ring.lineWidth = destroyed ? 3.4 : 2.2
        ring.glowWidth = destroyed ? 3 : 1.4
        ring.zPosition = 12
        parent.addChild(ring)
        ring.run(.sequence([
            .group([.scale(to: destroyed ? 2.6 : 2.0, duration: duration),
                    .fadeOut(withDuration: duration)]),
            .removeFromParent()
        ]))

        let core = SKShapeNode(circleOfRadius: destroyed ? 9 : 5.5)
        core.name = "combatImpactCore"
        core.position = position
        core.fillColor = .white
        core.strokeColor = color
        core.lineWidth = 2
        core.glowWidth = destroyed ? 5 : 2.5
        core.zPosition = 13
        parent.addChild(core)
        core.run(.sequence([
            .group([.scale(to: destroyed ? 1.7 : 1.35, duration: 0.07),
                    .fadeOut(withDuration: 0.13)]),
            .removeFromParent()
        ]))

        // Fixed particle budget: normal hits use four streaks, kills eight.
        // Short-lived shapes read clearly at phone scale without emitters.
        let count = destroyed ? 8 : 4
        for i in 0..<count {
            let angle = CGFloat(i) * (.pi * 2 / CGFloat(count)) + 0.22
            let reach: CGFloat = destroyed ? 38 : 19
            let streak = SKShapeNode(rectOf: CGSize(
                width: destroyed ? 3.5 : 2.3,
                height: destroyed ? 14 : 9), cornerRadius: 1)
            streak.name = "combatImpactStreak"
            streak.fillColor = i.isMultiple(of: 2) ? .white : color
            streak.strokeColor = .clear
            streak.glowWidth = destroyed ? 2 : 1
            streak.position = position
            streak.zRotation = angle - .pi / 2
            streak.zPosition = 12.5
            parent.addChild(streak)
            streak.run(.sequence([
                .group([
                    .moveBy(x: cos(angle) * reach,
                            y: sin(angle) * reach, duration: duration),
                    .fadeOut(withDuration: duration),
                    .scale(to: 0.3, duration: duration)
                ]),
                .removeFromParent()
            ]))
        }
        if destroyed {
            let second = SKShapeNode(circleOfRadius: 8)
            second.name = "combatKillAftershock"
            second.position = position
            second.strokeColor = .white.withAlphaComponent(0.6)
            second.fillColor = .clear
            second.lineWidth = 1.8
            second.zPosition = 11.5
            second.alpha = 0
            parent.addChild(second)
            second.run(.sequence([
                .wait(forDuration: 0.07),
                .fadeIn(withDuration: 0.025),
                .group([.scale(to: 4, duration: 0.28),
                        .fadeOut(withDuration: 0.28)]),
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
        if isBoss {
            // A delayed, low-opacity second ground pulse makes boss defeats
            // legible without increasing the particle count during combat.
            let aftershock = SKShapeNode(ellipseOf: CGSize(
                width: radius * 1.5, height: max(8, radius * 0.46)))
            aftershock.position = shock.position
            aftershock.fillColor = .clear
            aftershock.strokeColor = tint.withAlphaComponent(0.45)
            aftershock.lineWidth = 2
            aftershock.zPosition = 10.6
            aftershock.alpha = 0
            parent.addChild(aftershock)
            aftershock.run(.sequence([
                .wait(forDuration: 0.12),
                .fadeIn(withDuration: 0.04),
                .group([.scale(to: 4.1, duration: 0.35),
                        .fadeOut(withDuration: 0.35)]),
                .removeFromParent()
            ]))
        }
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
