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
        installGroundContact(asset: asset, position: position, size: size,
                             zPosition: -0.3, in: root)
        root.addChild(sprite)
    }

    /// A footprint is relative to the visible base, in displayed sprite units.
    /// These profiles follow the existing source silhouettes rather than their
    /// transparent canvas. They affect presentation only.
    private struct ContactFootprint {
        let x: CGFloat
        let y: CGFloat
        let width: CGFloat
        let depth: CGFloat
        init(_ x: CGFloat, _ y: CGFloat, _ width: CGFloat, _ depth: CGFloat) {
            self.x = x; self.y = y; self.width = width; self.depth = depth
        }
    }

    private static func contactProfile(_ name: String) -> [ContactFootprint] {
        switch name {
        // Angled forest masonry has different ground-contact heights on
        // either end. Follow the inspected source silhouette, not its box.
        case "world1_ruined_outpost_wall":
            return [.init(-0.32, 0.23, 0.27, 0.14), .init(-0.02, 0.12, 0.38, 0.15),
                    .init(0.30, 0.025, 0.29, 0.13)]
        case "world1_swamp_basin_wall":
            return [.init(-0.32, 0.02, 0.30, 0.16), .init(0, 0.12, 0.39, 0.16),
                    .init(0.32, 0.25, 0.28, 0.16)]
        case "world1_toxic_caves_wall":
            return [.init(-0.33, 0.20, 0.29, 0.15), .init(-0.02, 0.055, 0.37, 0.17),
                    .init(0.29, 0.015, 0.29, 0.15)]
        case "world1_boss_arena_wall":
            return [.init(-0.32, 0.20, 0.27, 0.15), .init(-0.02, 0.095, 0.38, 0.16),
                    .init(0.29, 0.025, 0.30, 0.16)]
        case "world1_swamp_basin_debris":
            return [.init(-0.26, 0.13, 0.36, 0.15), .init(0.015, 0.02, 0.35, 0.13),
                    .init(0.30, 0.14, 0.26, 0.17)]
        case "world1_boss_arena_debris", "world1_toxic_caves_debris":
            return [.init(-0.23, 0.10, 0.36, 0.16), .init(0.02, 0.025, 0.39, 0.17),
                    .init(0.29, 0.12, 0.28, 0.15)]
        case "world1_swamp_basin_boulder", "world1_toxic_caves_boulder":
            return [.init(0, 0.035, 0.53, 0.19)]
        case "world1_boss_arena_boulder":
            return [.init(-0.23, 0.09, 0.32, 0.17), .init(0.03, 0.02, 0.41, 0.18),
                    .init(0.27, 0.08, 0.26, 0.15)]
        case "world2_prop_pipe":
            return [.init(-0.15, 0.035, 0.56, 0.15)]
        case "world2_prop_tank":
            return [.init(-0.25, 0.06, 0.23, 0.13), .init(-0.10, 0, 0.23, 0.12),
                    .init(0.16, 0, 0.24, 0.12)]
        case "world2_prop_wall", "world4_prop_steel_barrier":
            return [.init(-0.29, 0.015, 0.28, 0.15), .init(0.29, 0.06, 0.28, 0.15),
                    .init(0, 0.045, 0.48, 0.12)]
        case "world4_prop_rusted_tank":
            return [.init(-0.25, 0.03, 0.25, 0.14), .init(0.31, 0.04, 0.25, 0.14)]
        case "world4_prop_pipe":
            return [.init(-0.34, 0.015, 0.20, 0.10), .init(-0.13, 0, 0.19, 0.10),
                    .init(0.06, 0.015, 0.15, 0.09), .init(0.34, 0.02, 0.19, 0.10)]
        case "world3_prop_ice_crystal", "world3_prop_frozen_boulder",
             "world3_prop_frozen_pillar", "world3_prop_ruin_wall",
             "world3_prop_wreckage", "world2_prop_boulder",
             "world2_prop_vegetation", "world2_prop_debris",
             "world4_prop_scrap_heap", "world4_prop_broken_machine", "world4_prop_debris":
            return [.init(-0.24, 0.035, 0.37, 0.16), .init(0.05, 0.015, 0.42, 0.18),
                    .init(0.29, 0.055, 0.29, 0.14)]
        case "world3_prop_snowbank":
            return [.init(-0.23, 0.035, 0.43, 0.11), .init(0.19, 0.04, 0.55, 0.13)]
        default:
            if name.contains("pine") || name.contains("broadleaf") || name.contains("lantern") {
                return [.init(0, 0.015, 0.26, 0.13)]
            }
            if name.contains("wall") || name.contains("boulder") ||
                name.contains("debris") || name.contains("vegetation") {
                return [.init(-0.22, 0.025, 0.38, 0.16), .init(0.18, 0.04, 0.42, 0.15)]
            }
            return [.init(0, 0.02, 0.70, 0.15)]
        }
    }

    /// A terrain-tinted penumbra and localized contacts, with a soft material
    /// wash beneath natural bases. Cached gradients are reused across rooms.
    /// No baked artwork is modified and no collision shapes are created.
    static func installGroundContact(asset: String, position: CGPoint, size: CGSize,
                                     zPosition: CGFloat, in root: SKNode,
                                     rotation: CGFloat = 0, mirrored: Bool = false,
                                     lowProfile: Bool = false) {
        let name = asset.lowercased()
        let frost = name.hasPrefix("world3_") || name.contains("frostrubble")
        let iron = name.hasPrefix("world4_") || name.contains("ironrubble")
        let toxic = name.hasPrefix("world2_") || name.contains("toxicrubble")
        let tone: UIColor
        let material: UIColor
        if frost {
            tone = UIColor(red: 0.16, green: 0.22, blue: 0.30, alpha: 1)
            material = UIColor(red: 0.62, green: 0.72, blue: 0.81, alpha: 1)
        } else if iron {
            tone = UIColor(red: 0.12, green: 0.095, blue: 0.075, alpha: 1)
            material = UIColor(red: 0.39, green: 0.29, blue: 0.21, alpha: 1)
        } else if toxic {
            tone = UIColor(red: 0.10, green: 0.15, blue: 0.07, alpha: 1)
            material = UIColor(red: 0.31, green: 0.34, blue: 0.18, alpha: 1)
        } else if name.hasPrefix("world1_toxic_caves_") {
            tone = UIColor(red: 0.14, green: 0.13, blue: 0.22, alpha: 1)
            material = UIColor(red: 0.26, green: 0.25, blue: 0.35, alpha: 1)
        } else {
            tone = UIColor(red: 0.12, green: 0.15, blue: 0.10, alpha: 1)
            material = UIColor(red: 0.31, green: 0.36, blue: 0.21, alpha: 1)
        }
        let contacts = contactProfile(name)
        let natural = frost || name.hasPrefix("world1_") || name.contains("boulder") || name.contains("vegetation") ||
            name.contains("debris") || name.contains("wreckage") || name.contains("scrap") ||
            name.contains("pine") || name.contains("broadleaf")
        let minX = contacts.map { $0.x - $0.width / 2 }.min() ?? -0.3
        let maxX = contacts.map { $0.x + $0.width / 2 }.max() ?? 0.3
        let span = maxX - minX
        let center = (minX + maxX) / 2

        func layer(_ suffix: String, color: UIColor, opacity: CGFloat,
                   x: CGFloat, y: CGFloat, width: CGFloat, depth: CGFloat, z: CGFloat) {
            let node = SKSpriteNode(texture: ProductionPresentation.glow(color.withAlphaComponent(opacity)))
            node.name = "propGroundContact_\(suffix)"
            node.size = CGSize(width: max(1, size.width * width), height: max(1, size.height * depth))
            let dx = size.width * x * (mirrored ? -1 : 1)
            let dy = size.height * y
            node.position = CGPoint(x: position.x + dx * cos(rotation) - dy * sin(rotation),
                                    y: position.y + dx * sin(rotation) + dy * cos(rotation))
            node.zRotation = rotation
            node.zPosition = z
            root.addChild(node)
        }

        // Follow sloped foundations with overlapping local penumbras rather
        // than drawing one detached horizontal strip below the full object.
        let contactYs = contacts.map { $0.y }
        let sloped = (contactYs.max() ?? 0) - (contactYs.min() ?? 0) > 0.085
        if sloped {
            for (index, foot) in contacts.enumerated() {
                layer("ambient_\(index)", color: tone, opacity: 0.22,
                      x: foot.x, y: foot.y, width: foot.width * 1.35,
                      depth: foot.depth * 1.45, z: zPosition)
                if natural {
                    layer("material_\(index)", color: material, opacity: 0.12,
                          x: foot.x, y: foot.y - 0.025, width: foot.width * 1.45,
                          depth: foot.depth * 1.45, z: zPosition + 0.01)
                }
            }
        } else {
            layer("ambient", color: tone, opacity: lowProfile ? 0.14 : 0.26,
                  x: center, y: 0.015, width: span * 1.20, depth: 0.23, z: zPosition)
            if natural {
                layer("material", color: material, opacity: lowProfile ? 0.20 : 0.14,
                      x: center, y: -0.015, width: span * 1.30, depth: 0.23, z: zPosition + 0.01)
            }
        }
        for (index, foot) in contacts.enumerated() {
            layer("core_\(index)", color: tone,
                  opacity: lowProfile ? 0.15 : frost ? 0.32 : 0.42,
                  x: foot.x, y: foot.y, width: foot.width, depth: foot.depth,
                  z: zPosition + 0.04)
        }
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
    enum Shoreline: Equatable {
        case ice, metal, toxic
    }

    static func install(on node: SKShapeNode, patch: TerrainHazards.Patch,
                        seed: Int, shoreline: Shoreline? = nil) -> Bool {
        let size = patch.frame.size
        guard patch.kind != .rubble, size.width.isFinite, size.height.isFinite,
              size.width > 1, size.height > 1 else { return false }
        let acid = patch.kind == .acid
        let idle = surface(patch: patch, seed: seed, active: false, shoreline: shoreline)
        let active = acid ? surface(patch: patch, seed: seed, active: true, shoreline: shoreline) : nil
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
                                active: Bool, shoreline: Shoreline?) -> UIImage {
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
            let low = shoreline == .metal ? UIColor(red: 0.065, green: 0.105, blue: 0.12, alpha: 1)
                           : acid ? UIColor(red: 0.08,green: 0.17,blue: 0.035,alpha: 1)
                           : UIColor(red: 0.035,green: 0.12,blue: 0.19,alpha: 1)
            let high = shoreline == .metal ? UIColor(red: 0.18, green: 0.30, blue: 0.33, alpha: 1)
                            : acid ? (active ? UIColor(red: 0.43,green: 0.86,blue: 0.095,alpha: 1)
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
            if let shoreline, shoreline != .toxic {
                drawWaterReflections(in: cg, path: path, size: size,
                                     shoreline: shoreline, random: random)
                blendWaterShoreline(in: cg, path: path, patch: patch,
                                    shoreline: shoreline, random: random)
                return
            }
            // Broad irregular caustics for the original liquid preview.
            for _ in 0..<22 {
                let x = (random()-0.5)*w, y = (random()-0.5)*h
                let rw = (0.12+random()*0.28)*w
                let rh = (0.025+random()*0.08)*h
                cg.setFillColor(high.withAlphaComponent(0.06+random()*0.12).cgColor)
                cg.fillEllipse(in: CGRect(x: x-rw/2,y: y-rh/2,width: rw,height: rh))
            }
            // Preserve the comparison preview's old dark bank only. The
            // authored toxic ground already provides the bank material;
            // painting a continuous dark strip makes acid look like a decal.
            cg.setLineJoin(.round)
            if shoreline == nil {
                cg.addPath(path)
                cg.setLineWidth(12)
                cg.setStrokeColor(low.withAlphaComponent(0.85).cgColor)
                cg.strokePath()
            }
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
                        let bankOpacity = shoreline == .toxic
                            ? 0.14 + random()*0.20 : 0.56 + random()*0.32
                        cg.setStrokeColor(bank.withAlphaComponent(bankOpacity).cgColor)
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
                // Preserve the old comparison preview, but do not draw a
                // continuous artificial border over authored toxic terrain.
                if shoreline != .toxic {
                    cg.addPath(path)
                    cg.setLineWidth(1.4)
                    cg.setStrokeColor(low.withAlphaComponent(0.9).cgColor)
                    cg.strokePath()
                }
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
            if shoreline == .toxic {
                blendWaterShoreline(in: cg, path: path, patch: patch,
                                    shoreline: .toxic, random: random)
            }
        }
    }

    private static func drawWaterReflections(in cg: CGContext, path: CGPath, size: CGSize,
                                             shoreline: Shoreline, random: () -> CGFloat) {
        let width = size.width
        let height = size.height
        let span = min(width, height)
        let reflectedLight = UIColor(red: 0.63, green: 0.79, blue: 0.81, alpha: 1)
        cg.setLineCap(.round)
        for _ in 0..<(shoreline == .metal ? 24 : 16) {
            let x = (random() - 0.5) * width
            let y = (random() - 0.5) * height
            let length = span * (0.07 + random() * 0.19)
            let start = CGPoint(x: x - length / 2, y: y)
            let end = CGPoint(x: x + length / 2, y: y + length * 0.05)
            guard path.contains(start), path.contains(end) else { continue }
            cg.move(to: start)
            cg.addQuadCurve(to: end, control: CGPoint(x: x, y: y + length * 0.09))
            cg.setLineWidth(0.6 + random() * 0.8)
            cg.setStrokeColor(reflectedLight.withAlphaComponent(0.12 + random() * 0.26).cgColor)
            cg.strokePath()
        }
    }

    private static func blendWaterShoreline(in cg: CGContext, path: CGPath,
                                             patch: TerrainHazards.Patch,
                                             shoreline: Shoreline, random: () -> CGFloat) {
        let size = patch.frame.size
        let metal = shoreline == .metal
        let toxic = shoreline == .toxic
        let span = min(size.width, size.height)
        // Broad, bounded transition across the inner shoreline. Keep
        // most of the hazard opaque; small pockets must remain readable.
        let shallows = min(span * 0.19, min(metal ? 8 : 10,
                           max(3, span * (toxic ? 0.15 : 0.13))))
        let bank = toxic ? UIColor(red: 0.32, green: 0.27, blue: 0.17, alpha: 1)
                         : metal ? UIColor(red: 0.28, green: 0.23, blue: 0.19, alpha: 1)
                                 : UIColor(red: 0.37, green: 0.47, blue: 0.54, alpha: 1)
        cg.setLineJoin(.round)

        // Tint the shallows while allowing the actual floor art to show through.
        for step in (1...8).reversed() {
            cg.addPath(path)
            cg.setLineWidth(2 * shallows * CGFloat(step) / 8)
            cg.setStrokeColor(bank.withAlphaComponent(0.045).cgColor)
            cg.strokePath()
        }

        let vertices = patch.outline.map { CGPoint(x: $0.x * size.width, y: $0.y * size.height) }
        let contact = toxic ? UIColor(red: 0.35, green: 0.31, blue: 0.16, alpha: 1)
                            : metal ? UIColor(red: 0.07, green: 0.065, blue: 0.06, alpha: 1)
                                    : UIColor(red: 0.66, green: 0.80, blue: 0.86, alpha: 1)
        // Broken contact marks give the shoreline depth without tracing the polygon.
        for index in vertices.indices {
            let a = vertices[index]
            let b = vertices[(index + 1) % vertices.count]
            let dx = b.x - a.x
            let dy = b.y - a.y
            guard hypot(dx, dy) >= 6 else { continue }
            let start = 0.12 + random() * 0.32
            let end = start + 0.16 + random() * 0.26
            cg.move(to: CGPoint(x: a.x + dx * start, y: a.y + dy * start))
            cg.addLine(to: CGPoint(x: a.x + dx * end, y: a.y + dy * end))
            cg.setLineWidth(metal ? 2.6 : 2.2)
            cg.setStrokeColor(contact.withAlphaComponent(metal ? 0.24 : 0.28).cgColor)
            cg.strokePath()
        }

        cg.setBlendMode(.destinationOut)
        for step in (1...16).reversed() {
            cg.addPath(path)
            cg.setLineWidth(2 * shallows * CGFloat(step) / 16)
            cg.setStrokeColor(UIColor.black.withAlphaComponent(0.19).cgColor)
            cg.strokePath()
        }

        // Soft pockets of exposed floor break up straight edges without
        // adding a continuous rim or changing the playable shoreline.
        let colors = [UIColor.black.withAlphaComponent(0.52).cgColor,
                      UIColor.black.withAlphaComponent(0).cgColor]
        guard let feather = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(),
                                       colors: colors as CFArray, locations: [0, 1]) else { return }
        for index in vertices.indices {
            let a = vertices[index]
            let b = vertices[(index+1)%vertices.count]
            let count = max(1, Int(hypot(b.x-a.x, b.y-a.y)/(shallows*1.9)))
            for offset in 0..<count {
                let fraction = (CGFloat(offset) + 0.2 + random()*0.6)/CGFloat(count)
                let center = CGPoint(x: a.x+(b.x-a.x)*fraction, y: a.y+(b.y-a.y)*fraction)
                cg.drawRadialGradient(feather, startCenter: center, startRadius: 0,
                                      endCenter: center, endRadius: shallows*(0.65+random()*0.85),
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
            sprite.alpha = 0.92
            sprite.color = slate
            sprite.colorBlendFactor = 0.12
            // Full-canvas art has a measured base at 32/512 from the bottom.
            let contact = CGPoint(x: snow.position.x,
                                  y: snow.position.y + snow.size.height * (FrostEnvironmentPlan.anchorY - 0.5))
            AuthoredEnvironmentRenderer.installGroundContact(asset: snow.asset,
                position: contact, size: snow.size, zPosition: -12.2, in: root, lowProfile: true)
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
            sprite.alpha = 0.80 + CGFloat(index%4)*0.04
            sprite.color = SKColor(red: 0.36, green: 0.30, blue: 0.26, alpha: 1)
            sprite.colorBlendFactor = 0.12
            let dy = sprite.size.height * (IronEnvironmentPlan.anchorY - 0.5)
            let contact = CGPoint(x: fragment.position.x - dy * sin(sprite.zRotation),
                                  y: fragment.position.y + dy * cos(sprite.zRotation))
            AuthoredEnvironmentRenderer.installGroundContact(asset: fragment.asset,
                position: contact, size: sprite.size, zPosition: -12.2, in: root,
                rotation: sprite.zRotation, mirrored: sprite.xScale < 0, lowProfile: true)
            root.addChild(sprite)
        }
        return root
    }
}
