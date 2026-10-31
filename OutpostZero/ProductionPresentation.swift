import SpriteKit
import UIKit

/// Baked, deterministic presentation layers. No physics, random combat state,
/// per-frame texture generation, or preview flags belong in this renderer.
enum ProductionPresentation {
    private static let textures: NSCache<NSString, SKTexture> = {
        let cache = NSCache<NSString, SKTexture>()
        cache.countLimit = 24
        cache.totalCostLimit = 32 * 1024 * 1024
        return cache
    }()

    static func glow(_ color: UIColor) -> SKTexture {
        let key = "glow-\(color.description)" as NSString
        if let texture = textures.object(forKey: key) { return texture }
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        let image = UIGraphicsImageRenderer(size: CGSize(width: 128, height: 128), format: format).image { renderer in
            let colors = [color.cgColor, color.withAlphaComponent(0).cgColor] as CFArray
            if let gradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: colors, locations: [0, 1]) {
                renderer.cgContext.drawRadialGradient(gradient, startCenter: CGPoint(x: 64, y: 64), startRadius: 0,
                    endCenter: CGPoint(x: 64, y: 64), endRadius: 64, options: [])
            }
        }
        let texture = SKTexture(image: image)
        textures.setObject(texture, forKey: key)
        return texture
    }

    /// Transparent material relief over the original painting. Edges carry
    /// detail; the central combat lane stays quiet and telegraphs stay above it.
    static func terrain(size: CGSize, landscape: String, visit: Int) -> SKTexture {
        let key = "terrain-\(Int(size.width))-\(Int(size.height))-\(landscape)-\(visit)" as NSString
        if let texture = textures.object(forKey: key) { return texture }
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        let image = UIGraphicsImageRenderer(size: size, format: format).image { renderer in
            let context = renderer.cgContext
            let wet = landscape == "swamp_basin"
            let cave = landscape == "toxic_caves"
            // Broad canopy shadows and an off-center warm skylight establish
            // a consistent upper-left light source across all room furniture.
            for i in 0..<12 {
                let left = i.isMultiple(of: 2)
                let x = left ? -size.width * 0.12 : size.width * 0.88
                let y = CGFloat((i * 173 + visit * 59) % max(1, Int(size.height)))
                let rect = CGRect(x: x, y: y - 85, width: size.width * 0.37, height: 210)
                context.saveGState()
                context.setShadow(offset: .zero, blur: 24, color: UIColor.black.withAlphaComponent(0.24).cgColor)
                context.setFillColor(UIColor(red: 0.015, green: 0.035, blue: 0.045, alpha: 0.13).cgColor)
                context.fillEllipse(in: rect)
                context.restoreGState()
            }
            // Broken sediment/stone clusters with recessed edges and lit lips.
            for i in 0..<64 {
                let seed = i * 79 + visit * 43
                let side = i.isMultiple(of: 2)
                let x = size.width * (side ? 0.05 : 0.76) + CGFloat(seed % max(1, Int(size.width * 0.16)))
                let y = CGFloat((seed * 17) % max(1, Int(size.height)))
                let width = CGFloat(14 + seed % 36)
                let height = CGFloat(5 + seed % 13)
                let path = UIBezierPath()
                path.move(to: CGPoint(x: x, y: y))
                path.addLine(to: CGPoint(x: x + width * 0.7, y: y - height * 0.2))
                path.addLine(to: CGPoint(x: x + width, y: y + height * 0.6))
                path.addLine(to: CGPoint(x: x + width * 0.35, y: y + height))
                path.close()
                context.saveGState()
                context.setShadow(offset: CGSize(width: 3, height: 4), blur: 3,
                                  color: UIColor.black.withAlphaComponent(0.27).cgColor)
                UIColor(red: wet ? 0.09 : 0.28, green: cave ? 0.32 : 0.30, blue: wet ? 0.23 : 0.24, alpha: 0.32).setFill()
                path.fill()
                context.restoreGState()
                let lip = UIBezierPath()
                lip.move(to: CGPoint(x: x, y: y))
                lip.addLine(to: CGPoint(x: x + width * 0.7, y: y - height * 0.2))
                UIColor(red: 0.66, green: 0.71, blue: 0.55, alpha: 0.18).setStroke()
                lip.lineWidth = 1
                lip.stroke()
            }
            if wet || cave {
                // Shallow reflective stains, never collision or damage zones.
                for i in 0..<5 {
                    let x = size.width * (i.isMultiple(of: 2) ? 0.10 : 0.77)
                    let y = size.height * CGFloat(i + 1) / 6
                    let rect = CGRect(x: x, y: y, width: size.width * 0.15, height: 18)
                    UIColor(red: 0.12, green: 0.35, blue: 0.34, alpha: 0.16).setFill()
                    UIBezierPath(ovalIn: rect).fill()
                    UIColor(white: 0.8, alpha: 0.10).setStroke()
                    let glint = UIBezierPath()
                    glint.move(to: CGPoint(x: rect.minX + 8, y: rect.minY + 4))
                    glint.addLine(to: CGPoint(x: rect.maxX - 12, y: rect.minY + 4))
                    glint.stroke()
                }
            }
        }
        let texture = SKTexture(image: image)
        textures.setObject(texture, forKey: key, cost: Int(size.width * size.height) * 4)
        return texture
    }

    /// Original vector emblems share materials but retain distinct silhouettes.
    /// Rasterized once at 2x; no emoji or three-letter placeholder artwork.
    static func abilityIcon(_ id: String, tint: UIColor) -> SKTexture {
        let key = "ability-\(id)" as NSString
        if let texture = textures.object(forKey: key) { return texture }
        let format = UIGraphicsImageRendererFormat()
        format.scale = 2
        let image = UIGraphicsImageRenderer(size: CGSize(width: 72, height: 72), format: format).image { renderer in
            let c = renderer.cgContext
            c.setShadow(offset: .zero, blur: 7, color: tint.withAlphaComponent(0.7).cgColor)
            tint.setStroke()
            tint.withAlphaComponent(0.22).setFill()
            let p = UIBezierPath()
            p.lineWidth = 3
            p.lineJoinStyle = .round
            p.lineCapStyle = .round
            switch id {
            case "chain", "rate":
                p.move(to: CGPoint(x: 43, y: 12)); p.addLine(to: CGPoint(x: 21, y: 39))
                p.addLine(to: CGPoint(x: 35, y: 39)); p.addLine(to: CGPoint(x: 29, y: 61))
                p.addLine(to: CGPoint(x: 53, y: 30)); p.addLine(to: CGPoint(x: 39, y: 30)); p.close()
            case "orbit", "evolveOrbit":
                p.append(UIBezierPath(ovalIn: CGRect(x: 15, y: 22, width: 43, height: 29)))
                p.append(UIBezierPath(ovalIn: CGRect(x: 27, y: 13, width: 19, height: 46)))
                p.stroke()
                for point in [CGPoint(x: 17, y: 30), CGPoint(x: 55, y: 42), CGPoint(x: 36, y: 17)] {
                    tint.setFill(); UIBezierPath(ovalIn: CGRect(x: point.x - 4, y: point.y - 4, width: 8, height: 8)).fill()
                }
            case "frost":
                for i in 0..<6 {
                    let a = CGFloat(i) * .pi / 3
                    let tip = CGPoint(x: 36 + cos(a) * 25, y: 36 + sin(a) * 25)
                    p.move(to: CGPoint(x: 36, y: 36)); p.addLine(to: tip)
                    for sign in [CGFloat(-1), CGFloat(1)] {
                        p.move(to: CGPoint(x: 36 + cos(a) * 16, y: 36 + sin(a) * 16))
                        p.addLine(to: CGPoint(x: 36 + cos(a) * 11 + sin(a) * 7 * sign,
                                              y: 36 + sin(a) * 11 - cos(a) * 7 * sign))
                    }
                }
            case "incendiary":
                p.move(to: CGPoint(x: 38, y: 10))
                p.addCurve(to: CGPoint(x: 53, y: 49), controlPoint1: CGPoint(x: 27, y: 33), controlPoint2: CGPoint(x: 62, y: 32))
                p.addCurve(to: CGPoint(x: 19, y: 45), controlPoint1: CGPoint(x: 48, y: 68), controlPoint2: CGPoint(x: 15, y: 62))
                p.addQuadCurve(to: CGPoint(x: 38, y: 10), controlPoint: CGPoint(x: 17, y: 29)); p.close()
            case "heal":
                p.append(UIBezierPath(roundedRect: CGRect(x: 14, y: 14, width: 44, height: 44), cornerRadius: 12))
                p.move(to: CGPoint(x: 36, y: 24)); p.addLine(to: CGPoint(x: 36, y: 48))
                p.move(to: CGPoint(x: 24, y: 36)); p.addLine(to: CGPoint(x: 48, y: 36))
            case "armor":
                p.move(to: CGPoint(x: 36, y: 12)); p.addLine(to: CGPoint(x: 56, y: 21))
                p.addQuadCurve(to: CGPoint(x: 36, y: 60), controlPoint: CGPoint(x: 59, y: 48))
                p.addQuadCurve(to: CGPoint(x: 16, y: 21), controlPoint: CGPoint(x: 13, y: 48)); p.close()
            case "mobility":
                for i in 0..<3 {
                    let y = CGFloat(17 + i * 16)
                    p.move(to: CGPoint(x: 20, y: y + 8)); p.addLine(to: CGPoint(x: 36, y: y))
                    p.addLine(to: CGPoint(x: 52, y: y + 8))
                }
            case "supplies":
                p.append(UIBezierPath(roundedRect: CGRect(x: 15, y: 22, width: 42, height: 34), cornerRadius: 5))
                p.move(to: CGPoint(x: 15, y: 34)); p.addLine(to: CGPoint(x: 57, y: 34))
                p.move(to: CGPoint(x: 36, y: 22)); p.addLine(to: CGPoint(x: 36, y: 56))
            default:
                // Ballistic cartridge / explosive star.
                for i in 0..<12 {
                    let a = CGFloat(i) * .pi / 6
                    let r: CGFloat = i.isMultiple(of: 2) ? 26 : 13
                    let point = CGPoint(x: 36 + cos(a) * r, y: 36 + sin(a) * r)
                    if i == 0 { p.move(to: point) } else { p.addLine(to: point) }
                }
                p.close()
            }
            p.fill(); p.stroke()
            c.setShadow(offset: .zero, blur: 0)
            UIColor.white.withAlphaComponent(0.8).setFill()
            UIBezierPath(ovalIn: CGRect(x: 32, y: 32, width: 8, height: 8)).fill()
        }
        let texture = SKTexture(image: image)
        textures.setObject(texture, forKey: key)
        return texture
    }
}
