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
}
