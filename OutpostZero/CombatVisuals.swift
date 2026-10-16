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
}
