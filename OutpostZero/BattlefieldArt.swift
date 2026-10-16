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
        floor.strokeColor = SKColor(red: 0.12, green: 0.20, blue: 0.19, alpha: 1)
        floor.lineWidth = 8
        artwork.addChild(floor)
        // Transparent lighting over the original room color. Gameplay keeps
        // its original silhouettes and collision limits.
        let forestSurface = SKSpriteNode(texture: FrontierFloorArt.texture(
            for: room.insetBy(dx: 5, dy: 5).size))
        forestSurface.name = "frontierFloorSurface"
        forestSurface.position = CGPoint(x: room.midX, y: room.midY)
        forestSurface.size = room.insetBy(dx: 5, dy: 5).size
        forestSurface.alpha = 0.97
        forestSurface.zPosition = 0.01
        artwork.addChild(forestSurface)
        // Keep the action zone visually framed, but not like a bright game
        // board. The original repeated terrain stamps, regularly spaced litter
        // and teal entrance stripe competed with combat indicators. Fine
        // environmental detail now lives in the single prerendered forest
        // texture, where it can be layered, asymmetrical and GPU-cheap.
        // This thin contact edge remains neutral for later non-forest worlds.
        let contactEdge = SKShapeNode(
            rect: room.insetBy(dx: 4, dy: 4), cornerRadius: 14)
        contactEdge.name = "roomContactEdge"
        contactEdge.fillColor = .clear
        contactEdge.strokeColor = SKColor(
            red: 0.06, green: 0.13, blue: 0.14, alpha: 0.42)
        contactEdge.lineWidth = 2
        contactEdge.zPosition = 0.03
        artwork.addChild(contactEdge)
    }
}
