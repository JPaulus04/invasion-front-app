import SpriteKit
import UIKit

/// Baked once per viewport: icy strata, snow banks and cracks cost one draw.
enum FrostFloorArt {
    private static var cache: [String: SKTexture] = [:]
    static func texture(for size: CGSize) -> SKTexture {
        let key = "\(Int(size.width))x\(Int(size.height))"
        if let texture = cache[key] { return texture }
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let image = UIGraphicsImageRenderer(size: size, format: format).image { context in
            let ctx = context.cgContext
            let colors = [UIColor(red: 0.12, green: 0.25, blue: 0.39, alpha: 1).cgColor,
                          UIColor(red: 0.34, green: 0.53, blue: 0.64, alpha: 1).cgColor] as CFArray
            if let gradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: colors, locations: [0, 1]) {
                ctx.drawLinearGradient(gradient, start: .zero,
                    end: CGPoint(x: size.width, y: size.height), options: [])
            }
            for i in 0..<52 {
                let x = CGFloat((i * 83 + 19) % 997) / 997 * size.width
                let y = CGFloat((i * 157 + 53) % 991) / 991 * size.height
                let w = CGFloat(22 + i * 7 % 47)
                let h = CGFloat(14 + i * 11 % 32)
                let slab = UIBezierPath()
                slab.move(to: CGPoint(x: x-w/2, y: y))
                slab.addLine(to: CGPoint(x: x-w/4, y: y-h/2))
                slab.addLine(to: CGPoint(x: x+w/2, y: y-h/3))
                slab.addLine(to: CGPoint(x: x+w/3, y: y+h/2))
                slab.close()
                UIColor(white: 0.88, alpha: 0.045).setFill(); slab.fill()
                UIColor(red: 0.04, green: 0.16, blue: 0.29, alpha: 0.16).setStroke()
                slab.lineWidth = 1.2; slab.stroke()
            }
            for i in 0..<22 {
                let side = i % 2 == 0
                let x = side ? CGFloat(-18 + i % 4 * 8) : size.width - CGFloat(i % 4 * 8)
                let y = CGFloat(i) / 22 * size.height
                let drift = UIBezierPath(ovalIn: CGRect(x: x-35, y: y, width: 100, height: 55))
                UIColor(red: 0.77, green: 0.89, blue: 0.94, alpha: 0.22).setFill(); drift.fill()
            }
        }
        let texture = SKTexture(image: image)
        cache[key] = texture
        return texture
    }
}
