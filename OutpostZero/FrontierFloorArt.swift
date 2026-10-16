import SpriteKit
import UIKit

/// Soft, prerendered forest-ground lighting and microtexture. One GPU sprite
/// replaces hundreds of per-frame shape nodes; no artificial road/grid bands.
/// This is artwork only: combat bounds and collision geometry are unchanged.
enum FrontierFloorArt {
    private static var textures: [String: SKTexture] = [:]

    static func texture(for size: CGSize) -> SKTexture {
        let width = max(128, Int(ceil(size.width)))
        let height = max(128, Int(ceil(size.height)))
        let key = "\(width)x\(height)"
        if let existing = textures[key] { return existing }

        let canvas = CGSize(width: width, height: height)
        let format = UIGraphicsImageRendererFormat()
        format.opaque = false
        format.scale = 1
        let renderer = UIGraphicsImageRenderer(size: canvas, format: format)
        let image = renderer.image { output in
            let ctx = output.cgContext
            let bounds = CGRect(origin: .zero, size: canvas)
            let space = CGColorSpaceCreateDeviceRGB()

            // Broad atmospheric washes create readable volume instead of
            // repetitive checkerboard terrain or opaque color patches.
            let wash = CGGradient(colorsSpace: space, colors: [
                UIColor(red: 0.07, green: 0.14, blue: 0.12, alpha: 0.08).cgColor,
                UIColor(red: 0.16, green: 0.25, blue: 0.16, alpha: 0.31).cgColor,
                UIColor(red: 0.07, green: 0.18, blue: 0.12, alpha: 0.14).cgColor
            ] as CFArray, locations: [0, 0.48, 1])!
            ctx.drawLinearGradient(wash, start: CGPoint(x: 0, y: 0),
                                   end: CGPoint(x: width, y: height), options: [])

            for (x, y, r, alpha) in [
                (0.24, 0.33, 0.57, 0.18),
                (0.79, 0.73, 0.51, 0.12),
                (0.51, 0.58, 0.42, 0.09)
            ] {
                let highlight = CGGradient(colorsSpace: space, colors: [
                    UIColor(red: 0.66, green: 0.81, blue: 0.47, alpha: alpha).cgColor,
                    UIColor(red: 0.47, green: 0.61, blue: 0.31, alpha: 0).cgColor
                ] as CFArray, locations: [0, 1])!
                let center = CGPoint(x: CGFloat(x) * canvas.width,
                                     y: CGFloat(y) * canvas.height)
                ctx.drawRadialGradient(highlight, startCenter: center, startRadius: 0,
                    endCenter: center, endRadius: canvas.width * CGFloat(r), options: [])
            }

            // Deterministic clustered litter, pebbles and grass. No matching
            // horizontal rows and no obstacle silhouettes in the center lane.
            var seed: UInt32 = 0x41C64E6D
            func random() -> CGFloat {
                seed = 1_664_525 &* seed &+ 1_013_904_223
                return CGFloat(seed % 10_000) / 10_000
            }
            for index in 0..<115 {
                let point = CGPoint(x: 14 + random() * (canvas.width - 28),
                                    y: 14 + random() * (canvas.height - 28))
                let length = 2 + random() * 5
                ctx.setLineWidth(index.isMultiple(of: 3) ? 1.6 : 0.9)
                ctx.setStrokeColor(UIColor(
                    red: index.isMultiple(of: 4) ? 0.66 : 0.18,
                    green: index.isMultiple(of: 4) ? 0.57 : 0.35,
                    blue: 0.20, alpha: 0.12 + random() * 0.16).cgColor)
                ctx.move(to: point)
                ctx.addLine(to: CGPoint(x: point.x + length * (random() - 0.4),
                                        y: point.y - length))
                ctx.strokePath()
            }
            for index in 0..<28 {
                let center = CGPoint(x: 18 + random() * (canvas.width - 36),
                                     y: 16 + random() * (canvas.height - 32))
                let w = 3 + random() * 7
                let h = 2 + random() * 3
                let pebble = CGRect(x: center.x - w / 2, y: center.y - h / 2,
                                    width: w, height: h)
                ctx.setFillColor(UIColor(red: 0.33, green: 0.35, blue: 0.27,
                                          alpha: index.isMultiple(of: 4) ? 0.34 : 0.19).cgColor)
                ctx.fillEllipse(in: pebble)
                ctx.setStrokeColor(UIColor(white: 0.71, alpha: 0.13).cgColor)
                ctx.setLineWidth(0.6)
                ctx.strokeEllipse(in: pebble.offsetBy(dx: -0.6, dy: -0.5))
            }

            // A second material scale breaks up the flat painted surface.
            // Organic moss shadows are rendered into one texture instead of
            // dozens of independently animated or overlapping SpriteKit nodes.
            // Keep the middle open: all foreground detail belongs near edges.
            for index in 0..<30 {
                let onLeft = index.isMultiple(of: 2)
                let edgeX = onLeft ? canvas.width * (0.07 + random() * 0.24)
                                   : canvas.width * (0.69 + random() * 0.24)
                let center = CGPoint(
                    x: edgeX,
                    y: canvas.height * (0.09 + random() * 0.83)
                )
                let wide = 12 + random() * 22
                let tall = 6 + random() * 11
                let path = CGMutablePath()
                path.move(to: CGPoint(x: center.x - wide * 0.56,
                                      y: center.y - tall * 0.12))
                path.addQuadCurve(
                    to: CGPoint(x: center.x - wide * 0.10,
                                y: center.y + tall * 0.58),
                    control: CGPoint(x: center.x - wide * 0.55,
                                     y: center.y + tall * 0.75))
                path.addQuadCurve(
                    to: CGPoint(x: center.x + wide * 0.57,
                                y: center.y + tall * 0.05),
                    control: CGPoint(x: center.x + wide * 0.19,
                                     y: center.y + tall * 0.73))
                path.addQuadCurve(
                    to: CGPoint(x: center.x + wide * 0.05,
                                y: center.y - tall * 0.49),
                    control: CGPoint(x: center.x + wide * 0.46,
                                     y: center.y - tall * 0.52))
                path.addQuadCurve(
                    to: CGPoint(x: center.x - wide * 0.56,
                                y: center.y - tall * 0.12),
                    control: CGPoint(x: center.x - wide * 0.30,
                                     y: center.y - tall * 0.64))
                ctx.addPath(path)
                ctx.setFillColor(UIColor(
                    red: index.isMultiple(of: 4) ? 0.36 : 0.08,
                    green: index.isMultiple(of: 4) ? 0.43 : 0.24,
                    blue: index.isMultiple(of: 4) ? 0.23 : 0.16,
                    alpha: index.isMultiple(of: 4) ? 0.13 : 0.24
                ).cgColor)
                ctx.fillPath()

                // A few individually angled leaf facets give each patch
                // small-scale relief; none form horizontal rows or grids.
                for blade in 0..<3 {
                    let bx = center.x + (random() - 0.5) * wide
                    let by = center.y + (random() - 0.5) * tall
                    let tip = 3 + random() * 5
                    let direction: CGFloat = onLeft ? 1 : -1
                    let leaf = CGMutablePath()
                    leaf.move(to: CGPoint(x: bx - direction * tip * 0.6, y: by - 1))
                    leaf.addLine(to: CGPoint(x: bx + direction * tip, y: by - tip))
                    leaf.addLine(to: CGPoint(x: bx + direction * tip * 0.6, y: by + 2))
                    leaf.closeSubpath()
                    ctx.addPath(leaf)
                    ctx.setFillColor(UIColor(
                        red: 0.31, green: 0.48, blue: 0.26,
                        alpha: 0.16 + random() * 0.16
                    ).cgColor)
                    ctx.fillPath()
                }
            }

            // Broken stones have a dark lower plane and a small lit upper
            // facet. Their asymmetry makes them read as natural debris,
            // without resembling circular footprints or collision markers.
            for index in 0..<16 {
                let side = index.isMultiple(of: 2)
                let x = canvas.width * (side ? (0.04 + random() * 0.26)
                                             : (0.70 + random() * 0.26))
                let y = canvas.height * (0.10 + random() * 0.80)
                let extent = 4 + random() * 6
                let silhouette = CGMutablePath()
                silhouette.move(to: CGPoint(x: x - extent, y: y + 1))
                silhouette.addLine(to: CGPoint(x: x - extent * 0.44,
                                               y: y - extent * 0.68))
                silhouette.addLine(to: CGPoint(x: x + extent * 0.75,
                                               y: y - extent * 0.38))
                silhouette.addLine(to: CGPoint(x: x + extent, y: y + extent * 0.32))
                silhouette.addLine(to: CGPoint(x: x - extent * 0.46,
                                               y: y + extent * 0.48))
                silhouette.closeSubpath()
                ctx.addPath(silhouette)
                ctx.setFillColor(UIColor(red: 0.13, green: 0.20,
                                         blue: 0.19, alpha: 0.38).cgColor)
                ctx.fillPath()

                let facet = CGMutablePath()
                facet.move(to: CGPoint(x: x - extent * 0.77, y: y))
                facet.addLine(to: CGPoint(x: x - extent * 0.40,
                                          y: y - extent * 0.54))
                facet.addLine(to: CGPoint(x: x + extent * 0.41,
                                          y: y - extent * 0.29))
                facet.addLine(to: CGPoint(x: x + extent * 0.17,
                                          y: y + extent * 0.12))
                facet.closeSubpath()
                ctx.addPath(facet)
                ctx.setFillColor(UIColor(red: 0.51, green: 0.56,
                                         blue: 0.43, alpha: 0.25).cgColor)
                ctx.fillPath()
            }

            // A restrained warm break in the canopy provides a focal point
            // for the player. This is lighting only, never an enemy indicator.
            let canopyLight = CGGradient(colorsSpace: space, colors: [
                UIColor(red: 0.75, green: 0.81, blue: 0.45, alpha: 0.12).cgColor,
                UIColor(red: 0.47, green: 0.69, blue: 0.39, alpha: 0.04).cgColor,
                UIColor(red: 0.40, green: 0.52, blue: 0.31, alpha: 0).cgColor
            ] as CFArray, locations: [0, 0.55, 1])!
            let clearing = CGPoint(x: canvas.width * 0.43,
                                   y: canvas.height * 0.43)
            ctx.drawRadialGradient(canopyLight,
                startCenter: clearing, startRadius: 0,
                endCenter: clearing, endRadius: canvas.width * 0.58,
                options: [])

            // Subtle edge shadow reinforces depth without obscuring characters.
            let vignette = CGGradient(colorsSpace: space, colors: [
                UIColor(white: 0, alpha: 0).cgColor,
                UIColor(red: 0.01, green: 0.04, blue: 0.04, alpha: 0.34).cgColor
            ] as CFArray, locations: [0.53, 1])!
            let center = CGPoint(x: bounds.midX, y: bounds.midY)
            ctx.drawRadialGradient(vignette, startCenter: center, startRadius: 0,
                                   endCenter: center, endRadius: hypot(
                                    canvas.width / 2, canvas.height / 2),
                                   options: [])
        }
        let texture = SKTexture(image: image)
        texture.filteringMode = .linear
        textures[key] = texture
        return texture
    }

    /// Flooded Outpost has its own desaturated maritime floor, rather than
    /// reusing forest litter or a featureless opaque blue rectangle.
    /// Render once per resolution: no new per-frame nodes or game mechanics.
    static func floodedTexture(for size: CGSize) -> SKTexture {
        let width = max(128, Int(ceil(size.width)))
        let height = max(128, Int(ceil(size.height)))
        let key = "flooded:\(width)x\(height)"
        if let cached = textures[key] { return cached }
        let canvas = CGSize(width: width, height: height)
        let rendererFormat = UIGraphicsImageRendererFormat()
        rendererFormat.opaque = true
        rendererFormat.scale = 1
        let renderer = UIGraphicsImageRenderer(size: canvas, format: rendererFormat)
        let image = renderer.image { output in
            let ctx = output.cgContext
            let bounds = CGRect(origin: .zero, size: canvas)
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            ctx.setFillColor(UIColor(red: 0.105, green: 0.205,
                                     blue: 0.245, alpha: 1).cgColor)
            ctx.fill(bounds)

            // Submerged concrete, cooler toward the upper half. This remains
            // deliberately quieter than the hazard indicators above it.
            let bed = CGGradient(colorsSpace: colorSpace, colors: [
                UIColor(red: 0.15, green: 0.27, blue: 0.29, alpha: 0.62).cgColor,
                UIColor(red: 0.07, green: 0.18, blue: 0.24, alpha: 0.54).cgColor,
                UIColor(red: 0.10, green: 0.19, blue: 0.20, alpha: 0.40).cgColor
            ] as CFArray, locations: [0, 0.48, 1])!
            ctx.drawLinearGradient(bed, start: .zero,
                                   end: CGPoint(x: canvas.width * 0.28,
                                                y: canvas.height),
                                   options: [])

            // Silt banks and staining frame the playable corridor. Uneven
            // silhouettes prevent them from reading as water-hazard circles.
            var seed: UInt32 = 0x0F10D04C
            func random() -> CGFloat {
                seed = 1_664_525 &* seed &+ 1_013_904_223
                return CGFloat(seed % 10_000) / 10_000
            }
            for index in 0..<36 {
                let left = index.isMultiple(of: 2)
                let x = canvas.width * (left ? (0.04 + random() * 0.22)
                                               : (0.74 + random() * 0.22))
                let y = canvas.height * (0.12 + random() * 0.78)
                let w = 12 + random() * 28
                let h = 6 + random() * 11
                let silt = CGMutablePath()
                silt.move(to: CGPoint(x: x - w * 0.55, y: y))
                silt.addLine(to: CGPoint(x: x - w * 0.24, y: y - h * 0.54))
                silt.addQuadCurve(to: CGPoint(x: x + w * 0.48,
                                               y: y - h * 0.22),
                                  control: CGPoint(x: x + w * 0.10,
                                                   y: y - h * 0.78))
                silt.addLine(to: CGPoint(x: x + w * 0.62, y: y + h * 0.40))
                silt.addLine(to: CGPoint(x: x - w * 0.24, y: y + h * 0.45))
                silt.closeSubpath()
                ctx.addPath(silt)
                ctx.setFillColor(UIColor(
                    red: index.isMultiple(of: 4) ? 0.37 : 0.055,
                    green: index.isMultiple(of: 4) ? 0.34 : 0.15,
                    blue: index.isMultiple(of: 4) ? 0.23 : 0.19,
                    alpha: index.isMultiple(of: 4) ? 0.19 : 0.21).cgColor)
                ctx.fillPath()
            }
            // Directional light scattered on wet flooring. Thin irregular
            // glints, not outlines around hazards or repeatable road markings.
            for index in 0..<88 {
                let x = canvas.width * (0.06 + random() * 0.88)
                let y = canvas.height * (0.12 + random() * 0.78)
                let length = 3 + random() * (index.isMultiple(of: 5) ? 18 : 8)
                let tilt = (random() - 0.5) * 2.5
                ctx.setLineWidth(index.isMultiple(of: 4) ? 1.1 : 0.65)
                ctx.setStrokeColor(UIColor(
                    red: 0.41, green: 0.67, blue: 0.69,
                    alpha: 0.08 + random() * 0.16).cgColor)
                ctx.move(to: CGPoint(x: x, y: y))
                ctx.addLine(to: CGPoint(x: x + length, y: y + tilt))
                ctx.strokePath()
            }
            // Half-buried masonry fragments at the two sides read as an old
            // flooded installation, without claiming the path is blocked.
            for index in 0..<21 {
                let left = index.isMultiple(of: 2)
                let x = canvas.width * (left ? 0.02 + random() * 0.18
                                               : 0.80 + random() * 0.18)
                let y = canvas.height * (0.12 + random() * 0.77)
                let width = 6 + random() * 13
                let height = 4 + random() * 6
                let shard = CGMutablePath()
                shard.move(to: CGPoint(x: x - width / 2, y: y - height / 2))
                shard.addLine(to: CGPoint(x: x + width * 0.26,
                                          y: y - height * 0.60))
                shard.addLine(to: CGPoint(x: x + width / 2,
                                          y: y + height * 0.34))
                shard.addLine(to: CGPoint(x: x - width * 0.32,
                                          y: y + height / 2))
                shard.closeSubpath()
                ctx.addPath(shard)
                ctx.setFillColor(UIColor(red: 0.30, green: 0.39,
                                         blue: 0.39, alpha: 0.37).cgColor)
                ctx.fillPath()
                ctx.setLineWidth(0.8)
                ctx.setStrokeColor(UIColor(red: 0.56, green: 0.66,
                                           blue: 0.63, alpha: 0.28).cgColor)
                ctx.move(to: CGPoint(x: x - width / 2, y: y - height / 2))
                ctx.addLine(to: CGPoint(x: x - width * 0.32,
                                        y: y + height / 2))
                ctx.strokePath()
            }
            // Soft reflected skylight anchors the middle without a bright
            // spotlight underneath the pilot or obscuring telegraphs.
            let centerLight = CGGradient(colorsSpace: colorSpace, colors: [
                UIColor(red: 0.38, green: 0.60, blue: 0.64, alpha: 0.10).cgColor,
                UIColor(red: 0.17, green: 0.36, blue: 0.42, alpha: 0).cgColor
            ] as CFArray, locations: [0, 1])!
            let glowCenter = CGPoint(x: canvas.width * 0.49,
                                     y: canvas.height * 0.53)
            ctx.drawRadialGradient(centerLight, startCenter: glowCenter,
                startRadius: 0, endCenter: glowCenter,
                endRadius: canvas.width * 0.64, options: [])
        }
        let texture = SKTexture(image: image)
        texture.filteringMode = .linear
        textures[key] = texture
        return texture
    }
}
