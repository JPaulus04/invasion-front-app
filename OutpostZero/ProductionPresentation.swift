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
            // Distinct low-relief landforms, baked below actors and warnings.
            // No painted ledge or stain introduces invisible collision.
            for bank in 0..<4 {
                let side: CGFloat = bank.isMultiple(of: 2) ? 0.04 : 0.73
                let x = size.width * side
                let y = size.height * CGFloat(bank + 1) / 5
                let w = size.width * 0.23
                let h: CGFloat = cave ? 54 : (wet ? 38 : 27)
                let shape = UIBezierPath()
                shape.move(to: CGPoint(x: x, y: y))
                shape.addCurve(to: CGPoint(x: x + w, y: y + h * 0.3),
                    controlPoint1: CGPoint(x: x + w * 0.25, y: y - h),
                    controlPoint2: CGPoint(x: x + w * 0.78, y: y - h * 0.45))
                shape.addQuadCurve(to: CGPoint(x: x, y: y),
                    controlPoint: CGPoint(x: x + w * 0.62, y: y + h))
                context.saveGState()
                context.setShadow(offset: CGSize(width: 5, height: 7), blur: 9,
                    color: UIColor.black.withAlphaComponent(0.24).cgColor)
                UIColor(red: cave ? 0.13 : 0.20, green: wet ? 0.26 : 0.22,
                        blue: cave ? 0.25 : 0.15, alpha: 0.20).setFill()
                shape.fill()
                context.restoreGState()
                if cave {
                    UIColor(red: 0.42, green: 0.50, blue: 0.66, alpha: 0.19).setStroke()
                    shape.lineWidth = 2
                    shape.stroke()
                } else if wet {
                    let reflection = UIBezierPath(ovalIn: CGRect(x: x + 12, y: y,
                        width: w * 0.65, height: h * 0.24))
                    UIColor(red: 0.31, green: 0.53, blue: 0.49, alpha: 0.16).setFill()
                    reflection.fill()
                }
            }
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
                UIColor(red: wet ? 0.09 : 0.28, green: cave ? 0.32 : 0.30, blue: wet ? 0.23 : 0.24, alpha: 0.16).setFill()
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
        let key = "ability-\(id)-\(tint.description)" as NSString
        if let texture = textures.object(forKey: key) { return texture }
        let format = UIGraphicsImageRendererFormat()
        format.scale = 2
        let image = UIGraphicsImageRenderer(size: CGSize(width: 72, height: 72), format: format).image { renderer in
            let c = renderer.cgContext
            // Recessed equipment medallion: bevel, shaded material, rim light.
            let bezel = UIBezierPath(roundedRect: CGRect(x: 5, y: 5, width: 62, height: 62), cornerRadius: 16)
            c.saveGState()
            c.setShadow(offset: CGSize(width: 0, height: 3), blur: 4, color: UIColor.black.cgColor)
            UIColor(red: 0.025, green: 0.045, blue: 0.08, alpha: 1).setFill()
            bezel.fill()
            c.restoreGState()
            c.saveGState()
            bezel.addClip()
            let colors = [tint.withAlphaComponent(0.38).cgColor,
                          UIColor(red: 0.035, green: 0.055, blue: 0.10, alpha: 1).cgColor] as CFArray
            if let gradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: colors, locations: [0, 1]) {
                c.drawLinearGradient(gradient, start: CGPoint(x: 10, y: 5), end: CGPoint(x: 60, y: 68), options: [])
            }
            c.restoreGState()
            tint.withAlphaComponent(0.7).setStroke()
            bezel.lineWidth = 1.5
            bezel.stroke()
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
            if id != "orbit" && id != "evolveOrbit" && id != "frost" && id != "mobility" {
                tint.withAlphaComponent(0.22).setFill()
                p.fill()
            }
            p.stroke()
            c.setShadow(offset: .zero, blur: 0)
            UIColor.white.withAlphaComponent(0.8).setFill()
            UIBezierPath(ovalIn: CGRect(x: 32, y: 32, width: 8, height: 8)).fill()
        }
        let texture = SKTexture(image: image)
        textures.setObject(texture, forKey: key)
        return texture
    }
}

extension ProductionPresentation {
    /// Layered equipment illustrations, built once for the live draft screen.
    static func abilityArtwork(_ id: String, tint: UIColor) -> SKTexture {
        let key = "illustration-\(id)-\(tint.description)" as NSString
        if let cached = textures.object(forKey: key) { return cached }
        let format = UIGraphicsImageRendererFormat()
        format.scale = 2
        let image = UIGraphicsImageRenderer(size: CGSize(width: 120, height: 120), format: format).image { renderer in
            let c = renderer.cgContext
            func sphere(_ center: CGPoint, _ radius: CGFloat, _ color: UIColor) {
                c.saveGState()
                c.setShadow(offset: CGSize(width: 2, height: 5), blur: 6, color: UIColor.black.withAlphaComponent(0.7).cgColor)
                let circle = UIBezierPath(ovalIn: CGRect(x: center.x-radius, y: center.y-radius, width: radius*2, height: radius*2))
                color.setFill(); circle.fill()
                c.setShadow(offset: .zero, blur: 0)
                circle.addClip()
                let colors = [UIColor.white.cgColor, color.cgColor, UIColor(red: 0.01, green: 0.03, blue: 0.10, alpha: 1).cgColor] as CFArray
                if let gradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: colors, locations: [0, 0.36, 1]) {
                    c.drawRadialGradient(gradient, startCenter: CGPoint(x: center.x-radius*0.3, y: center.y-radius*0.4), startRadius: 0, endCenter: center, endRadius: radius*1.3, options: [])
                }
                c.restoreGState()
            }
            // Large halo sits behind the equipment, never over the description.
            let colors = [tint.withAlphaComponent(0.32).cgColor, tint.withAlphaComponent(0).cgColor] as CFArray
            if let gradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: colors, locations: [0,1]) {
                c.drawRadialGradient(gradient, startCenter: CGPoint(x:60,y:60), startRadius:0, endCenter:CGPoint(x:60,y:60), endRadius:59, options:[])
            }
            if id == "orbit" || id == "evolveOrbit" {
                c.saveGState()
                c.translateBy(x:60,y:60); c.rotate(by:-0.35)
                let ring = UIBezierPath(ovalIn:CGRect(x:-42,y:-22,width:84,height:44))
                tint.withAlphaComponent(0.8).setStroke(); ring.lineWidth = id == "orbit" ? 3 : 8; ring.stroke()
                c.restoreGState()
                sphere(CGPoint(x:60,y:60),14,UIColor(red:0.16,green:0.26,blue:0.42,alpha:1))
                for point in [CGPoint(x:24,y:73),CGPoint(x:79,y:34),CGPoint(x:91,y:76)] { sphere(point,13,tint) }
            } else if id == "incendiary" {
                // A burning fuel canister has a different silhouette from ammunition.
                sphere(CGPoint(x:60,y:75),26,UIColor(red:0.22,green:0.27,blue:0.32,alpha:1))
                let flame = UIBezierPath()
                flame.move(to:CGPoint(x:63,y:8))
                flame.addCurve(to:CGPoint(x:91,y:57),controlPoint1:CGPoint(x:47,y:37),controlPoint2:CGPoint(x:94,y:32))
                flame.addCurve(to:CGPoint(x:29,y:59),controlPoint1:CGPoint(x:89,y:92),controlPoint2:CGPoint(x:19,y:92))
                flame.addQuadCurve(to:CGPoint(x:44,y:30),controlPoint:CGPoint(x:22,y:41))
                flame.addLine(to:CGPoint(x:47,y:49))
                flame.addQuadCurve(to:CGPoint(x:63,y:8),controlPoint:CGPoint(x:64,y:38))
                flame.close()
                c.setShadow(offset:.zero,blur:12,color:UIColor.systemOrange.cgColor)
                UIColor.systemOrange.setFill();flame.fill()
                UIColor.systemYellow.setStroke();flame.lineWidth=3;flame.stroke()
                c.setShadow(offset:.zero,blur:0)
                sphere(CGPoint(x:60,y:62),11,.systemYellow)
            } else if id == "reactor" {
                for i in 0..<3 {
                    c.saveGState();c.translateBy(x:60,y:60);c.rotate(by:CGFloat(i) * .pi / 3)
                    let ring=UIBezierPath(ovalIn:CGRect(x:-43,y:-19,width:86,height:38))
                    UIColor.systemCyan.setStroke();ring.lineWidth=4;ring.stroke();c.restoreGState()
                }
                sphere(CGPoint(x:60,y:60),22,.systemCyan)
                sphere(CGPoint(x:60,y:60),9,.white)
            } else if id == "rate" {
                // A spinning multi-barrel accelerator, not another ammunition icon.
                c.saveGState()
                c.translateBy(x: 60, y: 60)
                c.rotate(by: -0.28)
                let housing = UIBezierPath(roundedRect: CGRect(x: -35, y: -26, width: 70, height: 52), cornerRadius: 13)
                c.setShadow(offset: CGSize(width: 3, height: 6), blur: 7, color: UIColor.black.cgColor)
                UIColor(red: 0.11, green: 0.19, blue: 0.29, alpha: 1).setFill()
                housing.fill()
                tint.setStroke(); housing.lineWidth = 3; housing.stroke()
                c.setShadow(offset: .zero, blur: 0)
                for offset in [-16.0, 0.0, 16.0] {
                    let barrel = UIBezierPath(roundedRect: CGRect(x: 0, y: offset - 5, width: 47, height: 10), cornerRadius: 4)
                    UIColor(red: 0.46, green: 0.59, blue: 0.67, alpha: 1).setFill(); barrel.fill()
                    UIColor.white.withAlphaComponent(0.65).setStroke(); barrel.lineWidth = 1.5; barrel.stroke()
                }
                sphere(CGPoint(x: -13, y: 0), 20, tint)
                sphere(CGPoint(x: -13, y: 0), 9, UIColor(red: 0.09, green: 0.15, blue: 0.23, alpha: 1))
                c.restoreGState()
                for index in 0..<3 {
                    let y = CGFloat(41 + index * 18)
                    let streak = UIBezierPath()
                    streak.move(to: CGPoint(x: 97, y: y))
                    streak.addLine(to: CGPoint(x: 113, y: y - 5))
                    tint.withAlphaComponent(0.85).setStroke()
                    streak.lineWidth = 3; streak.stroke()
                }
            } else if id == "explosive" {
                // A single heavy warhead and an unmistakable blast silhouette.
                let blast = UIBezierPath()
                for index in 0..<16 {
                    let angle = CGFloat(index) * .pi / 8
                    let radius: CGFloat = index.isMultiple(of: 2) ? 51 : 29
                    let point = CGPoint(x: 62 + cos(angle) * radius, y: 57 + sin(angle) * radius)
                    if index == 0 { blast.move(to: point) } else { blast.addLine(to: point) }
                }
                blast.close()
                UIColor(red: 1, green: 0.46, blue: 0.12, alpha: 0.72).setFill(); blast.fill()
                UIColor(red: 1, green: 0.86, blue: 0.36, alpha: 0.9).setStroke()
                blast.lineWidth = 3; blast.stroke()
                c.saveGState()
                c.translateBy(x: 55, y: 60); c.rotate(by: -0.65)
                let body = UIBezierPath(roundedRect: CGRect(x: -13, y: -34, width: 26, height: 58), cornerRadius: 7)
                UIColor(red: 0.18, green: 0.24, blue: 0.29, alpha: 1).setFill(); body.fill()
                tint.setStroke(); body.lineWidth = 3; body.stroke()
                let nose = UIBezierPath()
                nose.move(to: CGPoint(x: -13, y: -34))
                nose.addLine(to: CGPoint(x: 0, y: -52))
                nose.addLine(to: CGPoint(x: 13, y: -34))
                nose.close()
                UIColor(red: 1, green: 0.81, blue: 0.35, alpha: 1).setFill(); nose.fill()
                UIColor.white.withAlphaComponent(0.8).setFill()
                UIBezierPath(roundedRect: CGRect(x: -5, y: -25, width: 4, height: 35), cornerRadius: 2).fill()
                c.restoreGState()
            } else if ["damage","rate","explosive","incendiary","frost"].contains(id) {
                for index in 0..<3 {
                    c.saveGState(); c.translateBy(x:CGFloat(35+index*24),y:CGFloat(67-index*8)); c.rotate(by:0.38)
                    c.setShadow(offset:CGSize(width:3,height:4),blur:5,color:UIColor.black.cgColor)
                    let shell = UIBezierPath(roundedRect:CGRect(x:-9,y:-24,width:18,height:48),cornerRadius:4)
                    UIColor(red:0.28,green:0.35,blue:0.43,alpha:1).setFill(); shell.fill()
                    tint.setStroke(); shell.lineWidth=2; shell.stroke()
                    let tip=UIBezierPath();tip.move(to:CGPoint(x:-9,y:-24));tip.addLine(to:CGPoint(x:0,y:-40));tip.addLine(to:CGPoint(x:9,y:-24));tip.close()
                    tint.setFill();tip.fill()
                    c.setShadow(offset:.zero,blur:0)
                    UIColor.white.withAlphaComponent(0.6).setFill();UIBezierPath(roundedRect:CGRect(x:-5,y:-21,width:3,height:32),cornerRadius:1).fill()
                    tint.setFill();UIBezierPath(rect:CGRect(x:-9,y:13,width:18,height:5)).fill()
                    c.restoreGState()
                }
                if id == "explosive" || id == "incendiary" {
                    for i in 0..<7 { let a=CGFloat(i) * .pi / 3.5; sphere(CGPoint(x:60+cos(a)*46,y:60+sin(a)*46),CGFloat(i%2+2),tint) }
                } else if id == "frost" {
                    for i in 0..<5 {
                        let x=CGFloat(18+i*21);let crystal=UIBezierPath();crystal.move(to:CGPoint(x:x,y:16));crystal.addLine(to:CGPoint(x:x+5,y:26));crystal.addLine(to:CGPoint(x:x,y:36));crystal.addLine(to:CGPoint(x:x-5,y:26));crystal.close();tint.withAlphaComponent(0.7).setFill();crystal.fill()
                    }
                }
            } else if id == "chain" {
                sphere(CGPoint(x:29,y:80),17,tint);sphere(CGPoint(x:91,y:33),17,tint)
                let arc=UIBezierPath();arc.move(to:CGPoint(x:30,y:78));arc.addLine(to:CGPoint(x:62,y:66));arc.addLine(to:CGPoint(x:47,y:48));arc.addLine(to:CGPoint(x:90,y:33))
                c.setShadow(offset:.zero,blur:8,color:tint.cgColor);tint.setStroke();arc.lineWidth=8;arc.stroke();UIColor.white.setStroke();arc.lineWidth=2;arc.stroke()
            } else {
                // Armor, repair, mobility and supply equipment retain recognizable
                // emblems within a dimensional steel module rather than bare glyphs.
                c.saveGState();c.translateBy(x:60,y:60);c.rotate(by:-0.12)
                let plate=UIBezierPath(roundedRect:CGRect(x:-37,y:-40,width:74,height:80),cornerRadius:18)
                c.setShadow(offset:CGSize(width:4,height:6),blur:7,color:UIColor.black.cgColor)
                UIColor(red:0.10,green:0.17,blue:0.25,alpha:1).setFill();plate.fill();tint.setStroke();plate.lineWidth=3;plate.stroke();c.restoreGState()
                do {
                    let cg = abilityIcon(id, tint: tint).cgImage()
                    UIImage(cgImage:cg).draw(in:CGRect(x:28,y:28,width:64,height:64))
                }
                for point in [CGPoint(x:29,y:25),CGPoint(x:88,y:20),CGPoint(x:35,y:99),CGPoint(x:94,y:90)] { sphere(point,3,UIColor.lightGray) }
            }
        }
        let texture=SKTexture(image:image);textures.setObject(texture,forKey:key);return texture
    }
}
