import SpriteKit

/// Sole World 1 environment renderer. Material cells are authored-pixel,
/// seam-compatible components in fixed world units; no stretched arena painting.
enum WorldOneEnvironment {
    static func make(_ plan: WorldOneEnvironmentPlan.Plan,
                     texture: (String) -> SKTexture?) -> SKNode {
        let root = SKNode()
        root.name = "build338World"
        let ground = SKNode()
        ground.name = "unifiedGround"
        ground.zPosition = -18
        let cell = WorldOneEnvironmentPlan.cellSize
        let minColumn = Int(floor((plan.groundBounds.minX-plan.groundOrigin.x)/cell))
        let maxColumn = Int(ceil((plan.groundBounds.maxX-plan.groundOrigin.x)/cell))
        let minRow = Int(floor((plan.groundBounds.minY-plan.groundOrigin.y)/cell))
        let maxRow = Int(ceil((plan.groundBounds.maxY-plan.groundOrigin.y)/cell))
        for row in minRow..<maxRow {
            for column in minColumn..<maxColumn {
                let name = plan.materialNames[plan.variant(column: column, row: row)]
                guard let material = texture(name) else {
                    preconditionFailure("Missing Build 338 ground material: \(name)")
                }
                let tile = SKSpriteNode(texture: material)
                tile.name = name
                tile.anchorPoint = .zero
                tile.size = CGSize(width: cell, height: cell)
                tile.position = CGPoint(x: plan.groundOrigin.x+CGFloat(column)*cell,
                                        y: plan.groundOrigin.y+CGFloat(row)*cell)
                ground.addChild(tile)
            }
        }
        root.addChild(ground)
        // A textured, softly shaded forest floor identifies solid shoulders.
        // The collision union is unchanged; transparent sprites describe its
        // contents instead of drawing repeated rectangular masonry rails.
        if !plan.blocked.isEmpty {
            let grove = SKCropNode()
            grove.name = "solidForestShoulders"
            let path = CGMutablePath()
            for rect in plan.blocked { path.addRect(rect) }
            let mask = SKShapeNode(path: path)
            mask.fillColor = .white
            mask.strokeColor = .clear
            grove.maskNode = mask
            if let moss = texture("world1_\(plan.theme.family)_floor_1") {
                for rect in plan.blocked {
                    let art = SKSpriteNode(texture: moss)
                    // These are low-frequency shaded understory, never the
                    // playable paving. All walkable ground retains 2 pixels/point.
                    art.size = CGSize(width: 256, height: 384)
                    art.position = CGPoint(x: rect.midX, y: rect.midY)
                    art.color = .black
                    art.colorBlendFactor = 0.32
                    grove.addChild(art)
                }
            }
            grove.zPosition = -16
            root.addChild(grove)
        }
        for frame in plan.pools {
            if let art = texture("build338_forest_pool") {
                let pool = SKSpriteNode(texture: art)
                pool.name = plan.theme == .caves ? "corruptedExteriorPool" : "shallowExteriorPool"
                let aspect = art.size().width/max(1, art.size().height)
                pool.size = CGSize(width: frame.width, height: frame.width/aspect)
                pool.position = CGPoint(x: frame.midX, y: frame.midY)
                if plan.theme == .caves {
                    pool.color = SKColor(red: 0.56, green: 0.86, blue: 0.18, alpha: 1)
                    pool.colorBlendFactor = 0.48
                }
                pool.zPosition = -14
                root.addChild(pool)
            }
        }
        for prop in plan.props {
            guard let material = texture(prop.asset) else {
                preconditionFailure("Missing Build 338 scenery: \(prop.asset)")
            }
            let sprite = SKSpriteNode(texture: material)
            sprite.name = "unifiedScenery_\(prop.asset)"
            sprite.size = prop.size
            sprite.anchorPoint = CGPoint(x: 0.5, y: prop.anchorY)
            sprite.position = prop.position
            // All solid sprites stay outside navigable space. Low depth keeps
            // combat actors and their cues readable even at the forest edge.
            sprite.zPosition = 0.4 - (prop.position.y-plan.bounds.minY)/max(1, plan.bounds.height)*0.3
            let shadow = SKSpriteNode(texture: ProductionPresentation.glow(.black.withAlphaComponent(0.3)))
            shadow.size = CGSize(width: prop.size.width*0.72, height: prop.size.height*0.16)
            shadow.position = CGPoint(x: prop.position.x+7, y: prop.position.y)
            shadow.zPosition = -0.3
            root.addChild(shadow)
            root.addChild(sprite)
        }
        return root
    }

    /// Keep the exact transparent ring and uniform scale. Masonry belongs to
    /// the environment at either side, not rectangular shapes layered over it.
    static func installPortal(in gate: SKShapeNode, texture: SKTexture) {
        gate.removeAllChildren()
        gate.fillColor = .clear
        gate.strokeColor = .clear
        let art = SKSpriteNode(texture: texture)
        art.name = "approvedCampaignPortalArt"
        let ratio = texture.size().width/max(1, texture.size().height)
        art.size = CGSize(width: 124*ratio, height: 124)
        art.anchorPoint = CGPoint(x: 0.5, y: 8/texture.size().height)
        art.position = .zero
        gate.addChild(art)
        let label = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        label.name = "exitPortalLabel"
        label.text = "ENTER"
        label.fontSize = 11
        label.fontColor = .white
        label.position = CGPoint(x: 0, y: 62)
        label.zPosition = 2
        gate.addChild(label)
        let arrow = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        arrow.name = "gateArrow"
        arrow.text = "▲"
        arrow.fontSize = 14
        arrow.fontColor = .cyan
        arrow.position.y = -24
        gate.addChild(arrow)
        // Retain the corrected energy-node identifier from 3987f2c. It is a
        // transparent glow over the ring interior, never a solid background.
        let energy = SKSpriteNode(texture: ProductionPresentation.glow(.cyan.withAlphaComponent(0.08)))
        energy.name = "portalRecessEnergy"
        energy.size = CGSize(width: 64, height: 64)
        energy.position.y = 62
        energy.blendMode = .add
        energy.zPosition = 1
        gate.addChild(energy)
    }
}
