import SpriteKit

/// Shared authored scenery primitives. Callers own the faction asset names,
/// room bounds, collision and hazard rules. Nothing here creates physics bodies.
enum AuthoredEnvironmentRenderer {
    static func tiledGround(bounds: CGRect, origin: CGPoint, cell: CGFloat,
                            materialName: (Int, Int) -> String,
                            texture: (String) -> SKTexture?) -> SKNode {
        precondition(cell > 0)
        let ground = SKNode()
        ground.name = "unifiedGround"
        ground.zPosition = -18
        let minColumn = Int(floor((bounds.minX-origin.x)/cell))
        let maxColumn = Int(ceil((bounds.maxX-origin.x)/cell))
        let minRow = Int(floor((bounds.minY-origin.y)/cell))
        let maxRow = Int(ceil((bounds.maxY-origin.y)/cell))
        for row in minRow..<maxRow {
            for column in minColumn..<maxColumn {
                let name = materialName(column, row)
                guard let material = texture(name) else {
                    preconditionFailure("Missing authored ground material: \(name)")
                }
                let tile = SKSpriteNode(texture: material)
                tile.name = name
                tile.anchorPoint = .zero
                tile.size = CGSize(width: cell, height: cell)
                tile.position = CGPoint(x: origin.x+CGFloat(column)*cell,
                                        y: origin.y+CGFloat(row)*cell)
                ground.addChild(tile)
            }
        }
        return ground
    }

    static func installGroundedProp(asset: String, position: CGPoint, size: CGSize,
                                   anchorY: CGFloat, bounds: CGRect, in root: SKNode,
                                   texture: (String) -> SKTexture?) {
        guard let material = texture(asset) else {
            preconditionFailure("Missing authored scenery: \(asset)")
        }
        let sprite = SKSpriteNode(texture: material)
        sprite.name = "unifiedScenery_\(asset)"
        sprite.size = size
        sprite.anchorPoint = CGPoint(x: 0.5, y: anchorY)
        sprite.position = position
        // Low depth keeps combat actors and their cues readable.
        sprite.zPosition = 0.4 - (position.y-bounds.minY)/max(1, bounds.height)*0.3
        let shadow = SKSpriteNode(texture: ProductionPresentation.glow(.black.withAlphaComponent(0.3)))
        shadow.size = CGSize(width: size.width*0.72, height: size.height*0.16)
        shadow.position = CGPoint(x: position.x+7, y: position.y)
        shadow.zPosition = -0.3
        root.addChild(shadow)
        root.addChild(sprite)
    }
}

/// Sole World 1 environment renderer. Material cells are authored-pixel,
/// seam-compatible components in fixed world units; no stretched arena painting.
enum WorldOneEnvironment {
    static func make(_ plan: WorldOneEnvironmentPlan.Plan,
                     texture: (String) -> SKTexture?) -> SKNode {
        let root = SKNode()
        root.name = "build338World"
        root.addChild(AuthoredEnvironmentRenderer.tiledGround(
            bounds: plan.groundBounds, origin: plan.groundOrigin,
            cell: WorldOneEnvironmentPlan.cellSize,
            materialName: { column, row in
                plan.materialNames[plan.variant(column: column, row: row)]
            }, texture: texture))
        for patch in plan.reclamation {
            guard let art = texture(patch.asset) else { preconditionFailure("Missing authored reclamation bed") }
            let bed = SKSpriteNode(texture: art)
            bed.name = "reclaimedPavingBed"
            bed.size = CGSize(width: 256,height: 256)
            bed.position = patch.position
            bed.zRotation = patch.angle
            bed.alpha = patch.opacity
            bed.zPosition = -17
            root.addChild(bed)
        }
        for plant in plan.groundPlants {
            guard let art = texture(plant.asset) else { preconditionFailure("Missing low ground vegetation") }
            let sprite = SKSpriteNode(texture: art)
            sprite.name = "ankleHeightGroundVegetation"
            sprite.size = plant.size
            sprite.position = plant.position
            sprite.zPosition = -12
            root.addChild(sprite)
        }
        // Pre-baked alpha feathering is real blending. SKCropNode uses an
        // alpha cutoff and produced hard soil lobes in the actual capture.
        for rect in plan.blocked {
            guard let moss = texture("build338_understory_\(plan.theme.rawValue)") else {
                preconditionFailure("Missing authored forest understory")
            }
            let cover = SKSpriteNode(texture: moss)
            cover.name = "featheredForestUnderstory"
            cover.size = rect.size
            cover.position = CGPoint(x: rect.midX,y: rect.midY)
            cover.zPosition = -16
            root.addChild(cover)
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
            AuthoredEnvironmentRenderer.installGroundedProp(asset: prop.asset,
                position: prop.position, size: prop.size, anchorY: prop.anchorY,
                bounds: plan.bounds, in: root, texture: texture)
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


/// Staged World 2 presentation; activated only by the explicit DEBUG preview.
enum ToxicEnvironment {
    static func make(_ plan: ToxicEnvironmentPlan.Plan,
                     texture: (String) -> SKTexture?) -> SKNode {
        let root = SKNode()
        root.name = "authoredToxicWorld"
        root.addChild(AuthoredEnvironmentRenderer.tiledGround(
            bounds: plan.groundBounds, origin: plan.bounds.origin,
            cell: WorldOneEnvironmentPlan.cellSize,
            materialName: { column, row in
                plan.materialNames[plan.variant(column: column, row: row)]
            }, texture: texture))
        for prop in plan.props {
            AuthoredEnvironmentRenderer.installGroundedProp(asset: prop.asset,
                position: prop.position, size: prop.size, anchorY: prop.anchorY,
                bounds: plan.bounds, in: root, texture: texture)
        }
        return root
    }
}
