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
        // Continuous, pre-rendered ground outside and inside the playable
        // room. The former green exterior made the arena look like a floating
        // board; this backdrop is purely visual and has no gameplay contact.
        // Only the forest world displays this layer (later worlds hide it).
        let ambient = SKSpriteNode(texture: FrontierFloorArt.texture(for: scene.size))
        ambient.name = "forestAmbientBackdrop"
        ambient.position = CGPoint(x: scene.size.width * 0.5,
                                   y: scene.size.height * 0.5)
        ambient.size = scene.size
        ambient.alpha = 0.90
        ambient.zPosition = -2
        artwork.addChild(ambient)
        // A separate matte maritime bed makes World 2 readable even outside
        // the gameplay boundary. It never participates in hit testing.
        let flooded = SKSpriteNode(texture: FrontierFloorArt.floodedTexture(
            for: scene.size))
        flooded.name = "floodedAmbientBackdrop"
        flooded.position = CGPoint(x: scene.size.width * 0.5,
                                   y: scene.size.height * 0.5)
        flooded.size = scene.size
        flooded.alpha = 1
        flooded.zPosition = -2
        flooded.isHidden = true
        artwork.addChild(flooded)

        let toxic = SKSpriteNode(texture: FrontierFloorArt.toxicTexture(
            for: scene.size))
        toxic.name = "toxicAmbientBackdrop"
        toxic.position = CGPoint(x: scene.size.width * 0.5,
                                 y: scene.size.height * 0.5)
        toxic.size = scene.size
        toxic.alpha = 1
        toxic.zPosition = -2
        toxic.isHidden = true
        artwork.addChild(toxic)

        let floor = SKShapeNode(rect: room, cornerRadius: 18)
        floor.name = "roomFloor"
        // Only a quiet tonal mask marks the permitted movement boundary in
        // the forest; later worlds can still use a fully opaque room fill.
        floor.fillColor = SKColor(red: 0.18, green: 0.28, blue: 0.20, alpha: 0.12)
        floor.strokeColor = SKColor(red: 0.10, green: 0.19, blue: 0.17, alpha: 0.19)
        floor.lineWidth = 4
        artwork.addChild(floor)
        // One continuous prerendered texture now covers the forest world.
        // Rendering a second smaller texture inside the room produced a
        // visible rectangle with a different debris pattern and lighting.
        // Collision boundaries remain entirely in RoomRules.
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
            red: 0.06, green: 0.13, blue: 0.14, alpha: 0.14)
        contactEdge.lineWidth = 2
        contactEdge.zPosition = 0.03
        artwork.addChild(contactEdge)
    }
}
