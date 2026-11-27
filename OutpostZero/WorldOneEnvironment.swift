import SpriteKit
import UIKit

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


/// Authored Toxic Crossing scenery.
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
        // A single world-space material wash interrupts recurring motifs
        // without rotating tiles or disturbing their verified shared edges.
        root.addChild(materialVariation(plan))
        for prop in plan.props {
            AuthoredEnvironmentRenderer.installGroundedProp(asset: prop.asset,
                position: prop.position, size: prop.size, anchorY: prop.anchorY,
                bounds: plan.bounds, in: root, texture: texture)
        }
        return root
    }

    private static func materialVariation(_ plan: ToxicEnvironmentPlan.Plan) -> SKSpriteNode {
        let bounds = plan.groundBounds
        let extent = max(bounds.width, bounds.height)
        let format = UIGraphicsImageRendererFormat()
        format.opaque = false
        // One bounded raster per room, independent of camera movement.
        format.scale = min(1, 768/max(1,extent))
        let renderer = UIGraphicsImageRenderer(size: bounds.size, format: format)
        let image = renderer.image { context in
            let cg = context.cgContext
            var state = UInt64(truncatingIfNeeded: plan.room) &+ 0x9E3779B185EBCA87
            func random() -> CGFloat {
                state = state &* 6364136223846793005 &+ 1442695040888963407
                return CGFloat((state >> 32) % 10000)/10000
            }
            let cs = CGColorSpaceCreateDeviceRGB()
            let colors = [
                UIColor(red: 0.19, green: 0.13, blue: 0.08, alpha: 1),
                UIColor(red: 0.41, green: 0.34, blue: 0.24, alpha: 1),
                UIColor(red: 0.30, green: 0.29, blue: 0.19, alpha: 1)
            ]
            let count = min(36, max(12, Int(bounds.width*bounds.height/60000)))
            for index in 0..<count {
                let color = colors[index % colors.count]
                let radius: CGFloat = 95 + random()*125
                let opacity: CGFloat = 0.10 + random()*0.12
                let x = random()*bounds.width
                let y = random()*bounds.height
                let angle = random()*CGFloat.pi
                guard let gradient = CGGradient(colorsSpace: cs,
                    colors: [color.withAlphaComponent(opacity).cgColor,
                             color.withAlphaComponent(opacity*0.48).cgColor,
                             color.withAlphaComponent(0).cgColor] as CFArray,
                    locations: [0,0.48,1]) else { continue }
                cg.saveGState()
                cg.translateBy(x: x,y: y)
                cg.rotate(by: angle)
                cg.scaleBy(x: 1,y: 0.55+random()*0.40)
                cg.drawRadialGradient(gradient, startCenter: .zero, startRadius: 0,
                                      endCenter: .zero, endRadius: radius, options: [])
                cg.restoreGState()
            }
        }
        let node = SKSpriteNode(texture: SKTexture(image: image))
        node.texture?.filteringMode = .linear
        node.name = "toxicMaterialVariation"
        node.size = bounds.size
        node.position = CGPoint(x: bounds.midX,y: bounds.midY)
        node.zPosition = -17.5
        return node
    }

}


/// Rasterized liquid presentation generated once per room, from the same
/// immutable polygon that gameplay uses. No collision or per-frame drawing.
enum DimensionalLiquidPreview {
    static func install(on node: SKShapeNode, patch: TerrainHazards.Patch,
                        seed: Int, bank: UIColor? = nil) -> Bool {
        let size = patch.frame.size
        guard patch.kind != .rubble, size.width.isFinite, size.height.isFinite,
              size.width > 1, size.height > 1 else { return false }
        let acid = patch.kind == .acid
        let idle = surface(patch: patch, seed: seed, active: false, bank: bank)
        let active = acid ? surface(patch: patch, seed: seed, active: true, bank: nil) : nil
        node.fillColor = .clear
        node.strokeColor = .clear
        node.glowWidth = 0
        func add(_ image: UIImage, name: String, hidden: Bool) {
            let sprite = SKSpriteNode(texture: SKTexture(image: image))
            sprite.texture?.filteringMode = .linear
            sprite.name = name
            sprite.size = size
            sprite.zPosition = 0.1
            sprite.isHidden = hidden
            node.addChild(sprite)
        }
        add(idle, name: "dimensionalLiquidIdle", hidden: false)
        if let active { add(active, name: "dimensionalLiquidActive", hidden: true) }
        return true
    }

    static func updateAcid(on node: SKShapeNode, active: Bool) -> Bool {
        guard let idle = node.childNode(withName: "dimensionalLiquidIdle"),
              let danger = node.childNode(withName: "dimensionalLiquidActive") else { return false }
        idle.isHidden = active
        danger.isHidden = !active
        return true
    }

    private static func surface(patch: TerrainHazards.Patch, seed: Int,
                                active: Bool, bank: UIColor?) -> UIImage {
        let size = patch.frame.size
        let w = size.width, h = size.height
        let acid = patch.kind == .acid
        let format = UIGraphicsImageRendererFormat()
        format.opaque = false
        // Limit raster allocation, including on larger tablet/expanded rooms.
        format.scale = min(2, 768/max(w,h))
        let renderer = UIGraphicsImageRenderer(size: size, format: format)
        return renderer.image { context in
            let cg = context.cgContext
            cg.translateBy(x: w/2, y: h/2)
            cg.scaleBy(x: 1, y: -1)
            let path = patch.outlinePath()
            cg.addPath(path)
            cg.clip() // Everything, including the bright edge, stays inside the hit polygon.
            let low = acid ? UIColor(red: 0.08,green: 0.17,blue: 0.035,alpha: 1)
                           : UIColor(red: 0.035,green: 0.12,blue: 0.19,alpha: 1)
            let high = acid ? (active ? UIColor(red: 0.43,green: 0.86,blue: 0.095,alpha: 1)
                                      : UIColor(red: 0.20,green: 0.40,blue: 0.095,alpha: 1))
                            : UIColor(red: 0.12,green: 0.38,blue: 0.48,alpha: 1)
            let cs = CGColorSpaceCreateDeviceRGB()
            if let gradient = CGGradient(colorsSpace: cs, colors: [low.cgColor,high.cgColor,low.cgColor] as CFArray,
                                         locations: [0,0.48,1]) {
                cg.drawLinearGradient(gradient, start: CGPoint(x: -w/2,y: -h/2),
                    end: CGPoint(x: w/2,y: h/2), options: [.drawsBeforeStartLocation,.drawsAfterEndLocation])
            }
            var state = UInt64(truncatingIfNeeded: seed)
            func random() -> CGFloat {
                state = state &* 6364136223846793005 &+ 1442695040888963407
                return CGFloat((state >> 32) % 10000)/10000
            }
            // Broad irregular caustics; no evenly spaced artificial lines.
            for _ in 0..<22 {
                let x = (random()-0.5)*w, y = (random()-0.5)*h
                let rw = (0.12+random()*0.28)*w
                let rh = (0.025+random()*0.08)*h
                cg.setFillColor(high.withAlphaComponent(0.06+random()*0.12).cgColor)
                cg.fillEllipse(in: CGRect(x: x-rw/2,y: y-rh/2,width: rw,height: rh))
            }
            if let bank {
                blendWaterShoreline(in: cg, path: path, patch: patch,
                                    bank: bank, random: random)
                return
            }
            // Recessed bank and narrow, restrained surface rim, clipped inward.
            cg.setLineJoin(.round)
            cg.addPath(path)
            cg.setLineWidth(12)
            cg.setStrokeColor(low.withAlphaComponent(0.85).cgColor)
            cg.strokePath()
            if acid {
                // Vary the inward bank thickness and mineral deposits, rather
                // than tracing a bright, uniform polygon like a UI icon.
                // All raster marks remain clipped to the authoritative path.
                cg.setLineCap(.round)
                let vertices = patch.outline.map { CGPoint(x: $0.x*w, y: $0.y*h) }
                let unit = min(w,h)
                let bank = UIColor(red: 0.26, green: 0.23, blue: 0.12, alpha: 1)
                let mineral = UIColor(red: 0.49, green: 0.47, blue: 0.24, alpha: 1)
                let lip = UIColor(red: 0.66, green: 0.79, blue: 0.27, alpha: 1)
                for index in vertices.indices {
                    let a = vertices[index]
                    let b = vertices[(index+1)%vertices.count]
                    let length = hypot(b.x-a.x,b.y-a.y)
                    guard length > 0.01 else { continue }
                    let steps = max(1, Int(ceil(length/max(3,unit*0.055))))
                    for part in 0..<steps {
                        let t0 = CGFloat(part)/CGFloat(steps)
                        let t1 = CGFloat(part+1)/CGFloat(steps)
                        let start = CGPoint(x: a.x+(b.x-a.x)*t0,y: a.y+(b.y-a.y)*t0)
                        let end = CGPoint(x: a.x+(b.x-a.x)*t1,y: a.y+(b.y-a.y)*t1)
                        let width = max(2,unit*(0.055+random()*0.085))
                        cg.move(to: start)
                        cg.addLine(to: end)
                        cg.setLineWidth(width)
                        cg.setStrokeColor(bank.withAlphaComponent(0.56+random()*0.32).cgColor)
                        cg.strokePath()
                        let radius = max(0.8,unit*(0.008+random()*0.018))
                        cg.setFillColor(mineral.withAlphaComponent(0.25+random()*0.40).cgColor)
                        cg.fillEllipse(in: CGRect(x: end.x-radius,y: end.y-radius,
                                                  width: radius*2,height: radius*2))
                        if random() > 0.50 {
                            cg.move(to: start)
                            cg.addLine(to: end)
                            cg.setLineWidth(max(0.8,width*0.22))
                            cg.setStrokeColor(lip.withAlphaComponent(active ? 0.66 : 0.32).cgColor)
                            cg.strokePath()
                        }
                    }
                }
                // Thin continuous dark contact line communicates the exact
                // damage boundary even where the mineral highlights break.
                cg.addPath(path)
                cg.setLineWidth(1.4)
                cg.setStrokeColor(low.withAlphaComponent(0.9).cgColor)
                cg.strokePath()
            } else {
                cg.addPath(path)
                cg.setLineWidth(3.0)
                cg.setStrokeColor(UIColor(red: 0.34,green: 0.57,blue: 0.59,alpha: 0.65).cgColor)
                cg.strokePath()
            }
            for _ in 0..<(acid ? 12 : 7) {
                let x = (random()-0.5)*w, y = (random()-0.5)*h
                guard path.contains(CGPoint(x: x,y: y)) else { continue }
                let radius = max(1.5,min(w,h)*(0.018+random()*0.025))
                let bubble = CGRect(x: x-radius,y: y-radius*0.55,width: radius*2,height: radius*1.1)
                cg.setFillColor(low.withAlphaComponent(0.35).cgColor)
                cg.fillEllipse(in: bubble)
                cg.setStrokeColor(high.withAlphaComponent(active ? 0.8 : 0.45).cgColor)
                cg.setLineWidth(0.8)
                cg.strokeEllipse(in: bubble)
            }
        }
    }

    private static func blendWaterShoreline(in cg: CGContext, path: CGPath,
                                             patch: TerrainHazards.Patch,
                                             bank: UIColor, random: () -> CGFloat) {
        let size = patch.frame.size
        let shallows = min(12, max(4, min(size.width, size.height)*0.16))
        cg.setLineJoin(.round)

        // Tint the transparent shallows with the local ground palette.
        // Layered low-opacity bands taper into the deeper water.
        for step in (1...16).reversed() {
            cg.addPath(path)
            cg.setLineWidth(2*shallows*CGFloat(step)/16)
            cg.setStrokeColor(bank.withAlphaComponent(0.035).cgColor)
            cg.strokePath()
        }

        // Let the floor tiles show through near the shoreline. The clip
        // remains the exact collision path and keeps every mark inside it.
        cg.setBlendMode(.destinationOut)
        for step in (1...24).reversed() {
            cg.addPath(path)
            cg.setLineWidth(1.5*shallows*CGFloat(step)/24)
            cg.setStrokeColor(UIColor.black.withAlphaComponent(0.065).cgColor)
            cg.strokePath()
        }

        // Soft pockets of exposed floor break up straight edges without
        // adding a continuous rim or changing the playable shoreline.
        let colors = [UIColor.black.withAlphaComponent(0.28).cgColor,
                      UIColor.black.withAlphaComponent(0).cgColor]
        guard let feather = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(),
                                       colors: colors as CFArray, locations: [0, 1]) else { return }
        let vertices = patch.outline.map { CGPoint(x: $0.x*size.width, y: $0.y*size.height) }
        for index in vertices.indices {
            let a = vertices[index]
            let b = vertices[(index+1)%vertices.count]
            let count = max(1, Int(hypot(b.x-a.x, b.y-a.y)/(shallows*1.8)))
            for offset in 0..<count {
                let fraction = (CGFloat(offset) + 0.2 + random()*0.6)/CGFloat(count)
                let center = CGPoint(x: a.x+(b.x-a.x)*fraction, y: a.y+(b.y-a.y)*fraction)
                cg.drawRadialGradient(feather, startCenter: center, startRadius: 0,
                                      endCenter: center, endRadius: shallows*(0.8+random()*0.65),
                                      options: [])
            }
        }
    }

}


/// Authored Frost Expanse presentation; never changes gameplay geometry.
enum FrostEnvironment {
    static func make(_ plan: FrostEnvironmentPlan.Plan,
                     texture: (String) -> SKTexture?) -> SKNode {
        let root = SKNode()
        root.name = "authoredFrostWorld"
        let ground = AuthoredEnvironmentRenderer.tiledGround(
            bounds: plan.groundBounds, origin: plan.bounds.origin,
            cell: WorldOneEnvironmentPlan.cellSize,
            materialName: { column, row in
                FrostEnvironmentPlan.materials[plan.variant(column: column,row: row)]
            }, texture: texture)
        // A uniform slate tint quiets the ice highlights without introducing
        // seams or changing the cool colors of the enemies and landmarks.
        let slate = SKColor(red: 0.24, green: 0.32, blue: 0.41, alpha: 1)
        for case let tile as SKSpriteNode in ground.children {
            tile.color = slate
            tile.colorBlendFactor = 0.22
        }
        root.addChild(ground)
        for prop in plan.landmarks {
            AuthoredEnvironmentRenderer.installGroundedProp(asset: prop.asset,
                position: prop.position,size: prop.size,anchorY: prop.anchorY,
                bounds: plan.bounds,in: root,texture: texture)
        }
        for snow in plan.snowbanks {
            guard let art = texture(snow.asset) else { continue }
            let sprite = SKSpriteNode(texture: art)
            sprite.name = "frostGroundSnow"
            sprite.position = snow.position
            sprite.size = snow.size
            sprite.zPosition = -12
            sprite.alpha = 0.82
            root.addChild(sprite)
        }
        return root
    }
}


/// Authored Iron Wastes presentation; never changes gameplay geometry.
enum IronEnvironment {
    static func make(_ plan: IronEnvironmentPlan.Plan,
                     texture: (String) -> SKTexture?) -> SKNode {
        let root = SKNode()
        root.name = "authoredIronWorld"
        root.addChild(AuthoredEnvironmentRenderer.tiledGround(
            bounds: plan.groundBounds, origin: plan.bounds.origin,
            cell: WorldOneEnvironmentPlan.cellSize,
            materialName: { column, row in
                IronEnvironmentPlan.materials[plan.variant(column: column,row: row)]
            }, texture: texture))
        for prop in plan.landmarks {
            AuthoredEnvironmentRenderer.installGroundedProp(asset: prop.asset,
                position: prop.position,size: prop.size,anchorY: prop.anchorY,
                bounds: plan.bounds,in: root,texture: texture)
        }
        for (index, fragment) in plan.fragments.enumerated() {
            guard let art = texture(fragment.asset) else { continue }
            let sprite = SKSpriteNode(texture: art)
            sprite.name = "ironGroundDebris"
            sprite.position = fragment.position
            // The displayed sprite stays inside the reserved square even
            // after rotation, so fragments still clear hazards and objectives.
            sprite.size = CGSize(width: fragment.size.width*0.79, height: fragment.size.height*0.79)
            sprite.zRotation = CGFloat((plan.room+index*3)%7-3)*0.10
            sprite.xScale = index.isMultiple(of: 2) ? 1 : -1
            sprite.zPosition = -12
            sprite.alpha = 0.56 + CGFloat(index%4)*0.07
            root.addChild(sprite)
        }
        return root
    }
}
