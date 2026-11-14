import SpriteKit
import UIKit

/// Re-samples only the paving of the approved courtyard painting. The frame,
/// walls, world coverage and gameplay coordinates stay at their original size.
/// Baked once per layout class, never rebuilt by the frame/update loop.
enum WorldOneStoneFloor {
    private static var cache: [Bool: SKTexture] = [:]

    static func texture(from source: SKTexture, expanded: Bool) -> SKTexture {
        #if DEBUG
        // Paired simulator evidence uses the exact Build 335 rendering path.
        if ProcessInfo.processInfo.arguments.contains("-baselineStoneScale") {
            return source
        }
        #endif
        if let texture = cache[expanded] { return texture }
        let original = source.cgImage()
        let canvas = CGSize(width: original.width, height: original.height)
        let bounds = CGRect(origin: .zero, size: canvas)
        let image = UIImage(cgImage: original)
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = false
        // Independent of room dimensions: changing coverage must never inflate
        // the paving. Tactical stones are 40% smaller; arena stones 12% smaller.
        let ratio: CGFloat = expanded ? 0.88 : 0.60
        let cropSize = CGSize(width: canvas.width * 0.38,
                              height: canvas.height * 0.38)
        let patchSize = CGSize(width: cropSize.width * ratio,
                               height: cropSize.height * ratio)
        let feather: CGFloat = 22
        let step = CGSize(width: patchSize.width - feather * 2,
                          height: patchSize.height - feather * 2)
        let surface = UIGraphicsImageRenderer(size: canvas, format: format).image { output in
            let ctx = output.cgContext
            image.draw(in: bounds)
            // Staggered, deterministic samples avoid a repeated square grid.
            // Samples contain the original cracks, damaged slabs, grass and moss;
            // no extra scene nodes, obstacles or new artwork dependencies.
            let rows = Int(ceil(canvas.height / step.height)) + 2
            let columns = Int(ceil(canvas.width / step.width)) + 2
            var patches: [Int: UIImage] = [:]
            for row in -1..<rows {
                for column in -1..<columns {
                    let variant = abs(row * 17 + column * 31) % 6
                    let sample = CGRect(
                        x: canvas.width * (0.25 + CGFloat(variant % 3) * 0.035),
                        y: canvas.height * (0.29 + CGFloat(variant / 3) * 0.055),
                        width: cropSize.width, height: cropSize.height)
                    guard let crop = original.cropping(to: sample) else { continue }
                    let patch = patches[variant] ?? UIGraphicsImageRenderer(size: patchSize, format: format).image { tile in
                        let c = tile.cgContext
                        c.saveGState()
                        if variant.isMultiple(of: 2) {
                            c.translateBy(x: patchSize.width, y: 0)
                            c.scaleBy(x: -1, y: 1)
                        }
                        UIImage(cgImage: crop).draw(in: CGRect(origin: .zero, size: patchSize))
                        c.restoreGState()
                        // Feather the patch edges into adjacent stone samples.
                        c.setBlendMode(.destinationIn)
                        let space = CGColorSpaceCreateDeviceRGB()
                        let colors = [UIColor.clear.cgColor, UIColor.white.cgColor,
                                      UIColor.white.cgColor, UIColor.clear.cgColor] as CFArray
                        for horizontal in [true, false] {
                            let length = horizontal ? patchSize.width : patchSize.height
                            let gradient = CGGradient(colorsSpace: space, colors: colors,
                                locations: [0, feather / length, 1 - feather / length, 1])!
                            c.drawLinearGradient(gradient, start: .zero,
                                end: horizontal ? CGPoint(x: length, y: 0) : CGPoint(x: 0, y: length),
                                options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])
                        }
                    }
                    patches[variant] = patch
                    let x = CGFloat(column) * step.width + (row.isMultiple(of: 2) ? 0 : step.width * 0.43)
                    patch.draw(at: CGPoint(x: x, y: CGFloat(row) * step.height))
                }
            }
            // Keep the original wall/tree perimeter. Blend only the paving
            // boundary so the ground does not look pasted onto the courtyard.
            ctx.setBlendMode(.destinationIn)
            let space = CGColorSpaceCreateDeviceRGB()
            let colors = [UIColor.clear.cgColor, UIColor.white.cgColor,
                          UIColor.white.cgColor, UIColor.clear.cgColor] as CFArray
            let horizontal = CGGradient(colorsSpace: space, colors: colors,
                                         locations: [0.12, 0.23, 0.77, 0.88])!
            let vertical = CGGradient(colorsSpace: space, colors: colors,
                                       locations: [0.16, 0.27, 0.80, 0.91])!
            ctx.drawLinearGradient(horizontal, start: .zero,
                end: CGPoint(x: canvas.width, y: 0), options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])
            ctx.drawLinearGradient(vertical, start: .zero,
                end: CGPoint(x: 0, y: canvas.height), options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])
        }
        let result = UIGraphicsImageRenderer(size: canvas, format: format).image { _ in
            image.draw(in: bounds)
            surface.draw(in: bounds)
        }
        let texture = SKTexture(image: result)
        texture.filteringMode = .linear
        cache[expanded] = texture
        return texture
    }
}
