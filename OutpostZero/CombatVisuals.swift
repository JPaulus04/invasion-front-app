import SpriteKit

/// Short-lived layered muzzle and tracer artwork. Instant-hit combat
/// intentionally remains unchanged: these are visual nodes only, created
/// on successful shots and removed when their actions finish.
enum CombatVisuals {
    static func rifleTracer(in parent: SKNode, origin: CGPoint,
                            target: CGPoint, incendiary: Bool,
                            explosive: Bool) {
        let color: SKColor = incendiary ? .systemOrange :
            (explosive ? .systemCyan : .systemYellow)
        let path = CGMutablePath()
        path.move(to: origin)
        path.addLine(to: target)

        // Wide, translucent bloom behind a thin bright center is readable
        // on a phone without turning the whole room into a laser screen.
        let halo = SKShapeNode(path: path)
        halo.strokeColor = color.withAlphaComponent(0.36)
        halo.lineWidth = 6
        halo.glowWidth = 3
        halo.lineCap = .round
        halo.zPosition = 7.9
        parent.addChild(halo)
        halo.run(.sequence([.fadeOut(withDuration: 0.15), .removeFromParent()]))

        let core = SKShapeNode(path: path)
        core.strokeColor = SKColor.white.withAlphaComponent(0.9)
        core.lineWidth = 1.7
        core.lineCap = .round
        core.zPosition = 8
        parent.addChild(core)
        core.run(.sequence([.fadeOut(withDuration: 0.095), .removeFromParent()]))

        // Brief hot muzzle flash adds direction even when the full pilot PNG
        // faces forward. It fades fast enough not to hide enemy warnings.
        let angle = atan2(target.y - origin.y, target.x - origin.x)
        let flash = SKShapeNode()
        let silhouette = CGMutablePath()
        silhouette.move(to: CGPoint(x: -5, y: -4))
        silhouette.addLine(to: CGPoint(x: 17, y: 0))
        silhouette.addLine(to: CGPoint(x: -5, y: 4))
        silhouette.closeSubpath()
        flash.path = silhouette
        flash.position = CGPoint(
            x: origin.x + cos(angle) * 15,
            y: origin.y + sin(angle) * 15)
        flash.zRotation = angle
        flash.fillColor = color.withAlphaComponent(0.92)
        flash.strokeColor = .white.withAlphaComponent(0.8)
        flash.lineWidth = 1
        flash.glowWidth = 1.2
        flash.zPosition = 12
        parent.addChild(flash)
        flash.run(.sequence([.group([
            .scale(to: 1.25, duration: 0.085),
            .fadeOut(withDuration: 0.085)
        ]), .removeFromParent()]))
    }

    /// Explosive rounds draw a brief open shock ring and glowing shrapnel,
    /// visually distinct from ordinary hits but with no independent damage.
    static func explosiveBurst(in parent: SKNode, at point: CGPoint,
                               rank: Int, burning: Bool) {
        let reach = CGFloat(min(40, 22 + rank * 4))
        let color: SKColor = burning ? .systemOrange : .systemYellow
        let blast = SKShapeNode(circleOfRadius: reach)
        blast.name = "explosiveBurst"
        blast.position = point
        blast.fillColor = .clear
        blast.strokeColor = color.withAlphaComponent(0.75)
        blast.lineWidth = 1.5
        blast.glowWidth = 0.8
        blast.setScale(0.34)
        blast.zPosition = 8.6
        parent.addChild(blast)
        blast.run(.sequence([
            .group([.scale(to: 1, duration: 0.23),
                    .fadeOut(withDuration: 0.23)]), .removeFromParent()
        ]))
        for i in 0..<4 {
            let angle = CGFloat(i) * .pi / 2 + .pi / 7
            let shard = SKShapeNode(rectOf: CGSize(width: 3, height: 8),
                                    cornerRadius: 1)
            shard.fillColor = i.isMultiple(of: 2) ? color : .white
            shard.strokeColor = .clear
            shard.position = point
            shard.zRotation = angle
            shard.zPosition = 12
            parent.addChild(shard)
            shard.run(.sequence([
                .group([.moveBy(x: cos(angle) * reach * 0.8,
                                y: sin(angle) * reach * 0.8, duration: 0.25),
                        .fadeOut(withDuration: 0.25)]), .removeFromParent()
            ]))
        }
    }

    /// One persistent, reusable indicator marks an active burn debuff.
    static func markBurning(_ enemy: SKShapeNode, radius: CGFloat) {
        guard enemy.childNode(withName: "burnIndicator") == nil else { return }
        let path = CGMutablePath()
        path.move(to: CGPoint(x: 0, y: 11))
        path.addQuadCurve(to: CGPoint(x: -7, y: -5),
                          control: CGPoint(x: -11, y: 3))
        path.addQuadCurve(to: CGPoint(x: 6, y: -3),
                          control: CGPoint(x: -2, y: -10))
        path.addQuadCurve(to: CGPoint(x: 0, y: 11),
                          control: CGPoint(x: 10, y: 6))
        let flame = SKShapeNode(path: path)
        flame.name = "burnIndicator"
        flame.fillColor = .systemOrange
        flame.strokeColor = .systemYellow
        flame.lineWidth = 1.2
        flame.glowWidth = 1.8
        flame.position = CGPoint(x: radius * 0.65, y: radius)
        flame.zPosition = 4
        enemy.addChild(flame)
        flame.run(.repeatForever(.sequence([
            .group([.scale(to: 1.1, duration: 0.24),
                    .fadeAlpha(to: 0.7, duration: 0.24)]),
            .group([.scale(to: 0.8, duration: 0.24),
                    .fadeAlpha(to: 1, duration: 0.24)])
        ])))
    }

    /// Branching dual-layer lightning remains a fast transient effect.
    static func chainArc(in parent: SKNode, from start: CGPoint,
                         to end: CGPoint, rank: Int) {
        let dx = end.x - start.x, dy = end.y - start.y
        let length = max(1, hypot(dx, dy))
        let offset = CGFloat(min(15, 6 + rank * 2))
        let px = -dy / length * offset, py = dx / length * offset
        let path = CGMutablePath()
        path.move(to: start)
        path.addLine(to: CGPoint(x: start.x + dx * 0.32 + px,
                                 y: start.y + dy * 0.32 + py))
        path.addLine(to: CGPoint(x: start.x + dx * 0.67 - px,
                                 y: start.y + dy * 0.67 - py))
        path.addLine(to: end)
        for layer in 0..<2 {
            let bolt = SKShapeNode(path: path)
            bolt.name = layer == 0 ? "chainLightningHalo" : "chainLightningCore"
            bolt.strokeColor = layer == 0 ? .systemCyan : .white
            bolt.lineWidth = layer == 0 ? 3.5 : 1.2
            bolt.glowWidth = layer == 0 ? 1.5 : 0.4
            bolt.zPosition = 12 + CGFloat(layer) * 0.1
            parent.addChild(bolt)
            bolt.run(.sequence([.fadeOut(withDuration: 0.18),
                                .removeFromParent()]))
        }
    }
}
