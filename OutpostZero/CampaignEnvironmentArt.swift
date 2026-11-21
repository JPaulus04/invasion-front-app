import SpriteKit
import UIKit

enum CampaignEnvironmentArt {
    static func make(_ plan: CampaignEnvironmentPlan, bounds: CGRect, viewport: CGSize) -> SKNode {
        let root = SKNode()
        root.name = "campaignEnvironment"
        let canvas = bounds.insetBy(dx: -42, dy: -max(110, viewport.height * 0.30))
        let format = UIGraphicsImageRendererFormat()
        format.opaque = true
        format.scale = min(2, 2048 / max(canvas.width, canvas.height))
        let image = UIGraphicsImageRenderer(size: canvas.size, format: format).image { renderer in
            let cg = renderer.cgContext
            cg.translateBy(x: -canvas.minX, y: canvas.maxY)
            cg.scaleBy(x: 1, y: -1)
            Painter(cg: cg, plan: plan, room: bounds).draw(canvas: canvas)
        }
        let floor = SKSpriteNode(texture: SKTexture(image: image), size: canvas.size)
        floor.position = CGPoint(x: canvas.midX, y: canvas.midY)
        floor.zPosition = -2
        root.addChild(floor)
        addAtmosphere(to: root, plan: plan, bounds: bounds)
        return root
    }

    private static func addAtmosphere(to root: SKNode, plan: CampaignEnvironmentPlan, bounds: CGRect) {
        let frost = plan.biome == .frost
        let iron = plan.biome == .iron
        let count = plan.landmark == .refuge ? 4 : (frost ? 16 : 10)
        for index in 0..<count {
            let color = frost ? UIColor.white : (iron ? UIColor.systemOrange : UIColor.systemYellow)
            let mote = SKShapeNode(ellipseOf: CGSize(width: frost ? 5 : 2.5, height: frost ? 1.7 : 3))
            let side: CGFloat = index.isMultiple(of: 2) ? 0.09 : 0.91
            mote.position = plan.point(side + (plan.detail(index, channel: 2) - 0.5) * 0.12,
                                       0.12 + plan.detail(index, channel: 4) * 0.76, in: bounds)
            mote.strokeColor = .clear
            mote.fillColor = color
            mote.alpha = 0
            root.addChild(mote)
            let duration = 1.5 + Double(plan.detail(index, channel: 0)) * 2.2
            mote.run(.repeatForever(.sequence([
                .wait(forDuration: Double(plan.detail(index, channel: 1)) * 3),
                .group([.fadeAlpha(to: frost ? 0.44 : 0.62, duration: duration * 0.4),
                        .moveBy(x: frost ? 17 : 6, y: frost ? -7 : 9, duration: duration * 0.4)]),
                .group([.fadeOut(withDuration: duration * 0.6),
                        .moveBy(x: frost ? 26 : 9, y: frost ? -10 : 14, duration: duration * 0.6)]),
                .moveBy(x: frost ? -43 : -15, y: frost ? 17 : -23, duration: 0)
            ])))
        }
    }

    private struct Painter {
        let cg: CGContext
        let plan: CampaignEnvironmentPlan
        let room: CGRect

        var colors: (outside: UInt32, floor: UInt32, high: UInt32, shade: UInt32, accent: UInt32) {
            switch plan.biome {
            case .toxic: return (0x152720, 0x344036, 0x68754c, 0x26332b, 0xbbce57)
            case .iron: return (0x1b262e, 0x35434f, 0x647581, 0x27333e, 0xe2aa60)
            case .frost: return (0x233b52, 0x526e84, 0xabc9d7, 0x3b566f, 0xa4e2ef)
            }
        }

        func color(_ hex: UInt32, _ alpha: CGFloat = 1) -> CGColor {
            UIColor(red: CGFloat((hex >> 16) & 255) / 255,
                    green: CGFloat((hex >> 8) & 255) / 255,
                    blue: CGFloat(hex & 255) / 255, alpha: alpha).cgColor
        }

        func fill(_ rect: CGRect, _ hex: UInt32, _ alpha: CGFloat = 1) {
            cg.setFillColor(color(hex, alpha))
            cg.fill(rect)
        }

        func ellipse(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat,
                     _ hex: UInt32, _ alpha: CGFloat = 1) {
            cg.setFillColor(color(hex, alpha))
            cg.fillEllipse(in: CGRect(x: x-w/2, y: y-h/2, width: w, height: h))
        }

        func path(_ points: [CGPoint], _ hex: UInt32, _ alpha: CGFloat = 1, stroke: CGFloat? = nil) {
            cg.beginPath()
            cg.addLines(between: points)
            if let stroke {
                cg.setStrokeColor(color(hex, alpha))
                cg.setLineWidth(stroke)
                cg.setLineCap(.round)
                cg.setLineJoin(.round)
                cg.strokePath()
            } else {
                cg.closePath()
                cg.setFillColor(color(hex, alpha))
                cg.fillPath()
            }
        }

        func draw(canvas: CGRect) {
            fill(canvas, colors.outside)
            if plan.biome == .iron {
                industrialApron(canvas)
            } else {
                wildApron(canvas)
            }
            cg.saveGState()
            if plan.biome == .iron {
                cg.addPath(CGPath(roundedRect: room, cornerWidth: 9, cornerHeight: 9, transform: nil))
                cg.clip()
                fill(room, colors.floor)
            }
            ground()
            routes()
            lighting()
            arena()
            cg.restoreGState()
            if plan.biome == .iron {
                for side in [CGFloat(-1), 1] {
                    let x = room.midX + side * (room.width / 2 + 4)
                    path([CGPoint(x: x, y: room.minY - 8), CGPoint(x: x, y: room.maxY + 11)],
                         colors.high, 0.44, stroke: 2)
                }
            }
            boundaries()
        }

        func industrialApron(_ canvas: CGRect) {
            let apron = room.insetBy(dx: -17, dy: -28)
            fill(canvas, 0x212c37)
            let rows = Int(canvas.height / 43) + 1
            for i in 0..<rows {
                let y = canvas.minY + CGFloat(i) * 43
                fill(CGRect(x: canvas.minX, y: y, width: canvas.width, height: 1.5),
                     0x0d1b22, 0.56)
                for offset in [CGFloat(-65), 64] {
                    let x = room.midX + offset + (i.isMultiple(of: 2) ? 0 : 22)
                    fill(CGRect(x: x, y: y, width: 1.2, height: 43), 0x617382, 0.31)
                }
            }
            cg.addPath(CGPath(roundedRect: apron.offsetBy(dx: 3, dy: -8),
                              cornerWidth: 16, cornerHeight: 16, transform: nil))
            cg.setFillColor(color(0x0a1218, 0.68))
            cg.fillPath()
            cg.addPath(CGPath(roundedRect: apron, cornerWidth: 14, cornerHeight: 14, transform: nil))
            cg.setFillColor(color(colors.shade))
            cg.fillPath()
            for y in [room.minY - 13, room.maxY + 14] {
                block(x: room.midX, y: y, w: room.width * 0.77, h: 14, rise: 5, top: 0x526473)
                for i in -7...7 {
                    let x = room.midX + CGFloat(i) * room.width * 0.045
                    path([CGPoint(x: x, y: y-2), CGPoint(x: x+7, y: y+7)],
                         0xc89d65, 0.62, stroke: 2)
                }
            }
            let top = room.maxY + 62
            let supports: [CGFloat] = plan.wave < 10 ? [0.19, 0.81] : [0.13, 0.50, 0.87]
            for fraction in supports {
                machine(plan.point(fraction, 1, in: room).x, top, top: 0x4d6173, size: 1.26)
            }
        }

        func wildApron(_ canvas: CGRect) {
            let snow = plan.biome == .frost
            fill(canvas, snow ? 0x536f82 : 0x414b35)
            let terrain: [UInt32] = snow
                ? [0x69899e, 0x91abb8, 0x48647b, 0xb2c7ce]
                : [0x667151, 0x747359, 0x303f2b, 0x59704b]
            for i in 0..<230 {
                let u = plan.detail(i, channel: 0)
                let v = plan.detail(i, channel: 1)
                let x = canvas.minX + u * canvas.width
                let y = canvas.minY + v * canvas.height
                let scale = 17 + plan.detail(i, channel: 3) * 62
                let edge = abs(x-room.midX) > room.width * 0.31 || y < room.minY || y > room.maxY
                let p = CGPoint(x: x, y: y)
                let w = scale * (edge ? 1.3 : 0.75)
                let h = scale * (snow ? 0.38 : 0.49)
                let alpha: CGFloat = edge ? 0.42 : 0.24
                path([p + CGPoint(x: -w*0.49, y: -h*0.14), p + CGPoint(x: -w*0.30, y: h*0.35),
                      p + CGPoint(x: w*0.16, y: h*0.45), p + CGPoint(x: w*0.48, y: h*0.15),
                      p + CGPoint(x: w*0.34, y: -h*0.28), p + CGPoint(x: -w*0.18, y: -h*0.45)],
                     terrain[i % terrain.count], alpha)
                if edge && i.isMultiple(of: 5) {
                    path([p + CGPoint(x: -w*0.25, y: h*0.28), p + CGPoint(x: w*0.04, y: h*0.39),
                          p + CGPoint(x: w*0.27, y: h*0.30)], terrain[3], 0.49, stroke: 1.3)
                }
            }
            for side: CGFloat in [-1, 1] {
                var upperBank: [CGPoint] = []
                var lowerBank: [CGPoint] = []
                for i in 0...14 {
                    let y = canvas.minY + CGFloat(i) * canvas.height / 14
                    let inset = plan.detail(i + (side < 0 ? 12 : 31), channel: 4) * 19
                    let x = room.midX + side * (room.width / 2 - inset)
                    upperBank.append(CGPoint(x: x, y: y))
                    lowerBank.append(CGPoint(x: x + side * 16, y: y - 4))
                }
                let extent = room.midX + side * (canvas.width / 2 + 12)
                path(upperBank + [CGPoint(x: extent, y: canvas.maxY),
                                  CGPoint(x: extent, y: canvas.minY)],
                     snow ? 0x9abac8 : 0x263c28, snow ? 0.35 : 0.60)
                path(lowerBank, snow ? 0xc8dce3 : 0x8b9361, 0.36, stroke: 5)
                path(upperBank, snow ? 0xc3dbe4 : 0x667958, 0.48, stroke: 2.2)
            }
            let far = room.maxY + 44
            let near = room.minY - 38
            for i in 0..<8 {
                let x = canvas.minX + (CGFloat(i) + 0.25) * canvas.width / 8
                let rise = plan.detail(i, channel: 1)
                if snow {
                    ice(x, far + 22 * rise, size: 0.76 + rise * 0.58)
                    if i.isMultiple(of: 2) {
                        ice(x+10, near + 17 * rise, size: 0.70 + rise * 0.33)
                    }
                } else if plan.development < 0.46 || i.isMultiple(of: 2) {
                    growth(x, far + 25 * rise, size: 0.85 + rise * 0.50)
                    growth(x+10, near + 11 * rise, size: 0.52 + rise * 0.33)
                } else {
                    pipe(x, far + 13 * rise, size: 0.74 + rise * 0.45)
                }
            }
        }

        func lighting() {
            let staging = plan.landmark == .finalArena || plan.wave >= 26
            let center = plan.point(0.51, staging ? 0.77 : 0.60, in: room)
            let space = CGColorSpaceCreateDeviceRGB()
            let glow = [color(colors.accent, staging ? 0.16 : 0.09), color(colors.accent, 0)]
            if let gradient = CGGradient(colorsSpace: space, colors: glow as CFArray, locations: nil) {
                cg.drawRadialGradient(gradient, startCenter: center, startRadius: 1,
                    endCenter: center, endRadius: room.width * 0.62, options: [])
            }
            let haze = [color(colors.outside, 0.30), color(colors.outside, 0)]
            if let gradient = CGGradient(colorsSpace: space, colors: haze as CFArray, locations: nil) {
                cg.drawLinearGradient(gradient, start: CGPoint(x: room.midX, y: room.minY),
                    end: CGPoint(x: room.midX, y: room.midY), options: [])
            }
        }

        func ground() {
            if plan.biome == .iron {
                let step: CGFloat = 36 - plan.development * 9
                var row = 0
                var y = room.minY
                while y < room.maxY {
                    path([CGPoint(x: room.minX, y: y), CGPoint(x: room.maxX, y: y)],
                         colors.outside, 0.76, stroke: 1.4)
                    fill(CGRect(x: room.minX, y: y + 1, width: room.width, height: 1),
                         0x8090a2, 0.34)
                    let offset: CGFloat = row.isMultiple(of: 2) ? 0 : 21
                    for column in 0...Int(room.width / 42) {
                        let x = room.minX + CGFloat(column) * 42 + offset
                        fill(CGRect(x: x, y: y, width: 1, height: step), colors.high, 0.28)
                        ellipse(x + 5, y + 5, 2.5, 2.5, colors.high, 0.52)
                    }
                    row += 1
                    y += step
                }
            }
            for index in 0..<175 {
                let p = plan.point(plan.detail(index, channel: 0), plan.detail(index, channel: 1), in: room)
                let width = plan.detail(index, channel: 2)
                let light = index.isMultiple(of: 3)
                if plan.biome == .iron {
                    path([p, p + CGPoint(x: 2 + width * 9, y: 1)],
                         light ? colors.high : colors.shade, 0.29, stroke: 1)
                } else {
                    ellipse(p.x, p.y, 3 + width * 36, 1 + width * 7,
                            light ? colors.high : colors.shade, 0.10 + width * 0.21)
                    if plan.biome == .frost, index.isMultiple(of: 7) {
                        path([p, p + CGPoint(x: 6, y: 4), p + CGPoint(x: 12, y: 1)],
                             colors.high, 0.23, stroke: 0.8)
                    }
                }
            }
        }

        func routes() {
            let profiles: [[CGFloat]] = [
                [0.50, 0.43, 0.52, 0.50], [0.50, 0.50, 0.50, 0.50],
                [0.50, 0.63, 0.64, 0.50], [0.50, 0.62, 0.36, 0.50],
                [0.50, 0.39, 0.40, 0.50], [0.50, 0.50, 0.56, 0.50]
            ]
            let xs = plan.landmark == .regular ? profiles[plan.layout.rawValue] : profiles[1]
            let y: [CGFloat] = [0, 0.30, 0.68, 1]
            let points = zip(xs, y).map { plan.point(plan.mirrored ? 1 - $0.0 : $0.0, $0.1, in: room) }
            path(points, colors.shade, 0.55, stroke: plan.layout == .yard ? 97 : 72)
            path(points, colors.high, plan.biome == .frost ? 0.28 : 0.16, stroke: 55)
            if plan.biome == .toxic && plan.layout == .crossing {
                for index in 0..<13 {
                    let p = plan.point(0.50, 0.32 + CGFloat(index) * 0.027, in: room)
                    let spread: CGFloat = index == 3 || index == 8 ? 18 : 31
                    block(x: p.x, y: p.y, w: spread * 2, h: 8, rise: 2, top: 0x596755)
                }
            } else if plan.biome == .iron {
                let x = plan.mirrored ? 0.07 : 0.93
                let p = plan.point(x, 0.49, in: room)
                block(x: p.x, y: p.y, w: 21, h: 163, rise: 4, top: 0x26313b)
                for index in 0..<15 {
                    let y = p.y - 71 + CGFloat(index) * 10
                    path([CGPoint(x: p.x-8, y: y), CGPoint(x: p.x+8, y: y+2)], colors.high, 0.65, stroke: 2)
                }
            }
        }

        func block(x: CGFloat, y: CGFloat, w: CGFloat, h: CGFloat, rise: CGFloat, top: UInt32) {
            let a = CGPoint(x: x-w/2, y: y-h/2)
            let b = CGPoint(x: x+w/2-5, y: y-h/2)
            let c = CGPoint(x: x+w/2, y: y+h/2)
            let d = CGPoint(x: x-w/2+5, y: y+h/2)
            let up = CGPoint(x: 0, y: rise)
            ellipse(x+3, y-h*0.24, w+13, h*0.95+8, 0x0b1923, 0.44)
            path([a, b, b+up, a+up], colors.outside)
            path([b, c, c+up, b+up], colors.shade)
            path([a+up, b+up, c+up, d+up], top)
            path([a+up, d+up, c+up], colors.high, 0.60, stroke: 1.2)
        }

        func boundaries() {
            let count = plan.landmark == .refuge ? 4 : 6 + Int(plan.development * 5)
            for i in 0..<count {
                let side: CGFloat = i.isMultiple(of: 2) ? 0 : 1
                let fraction = 0.08 + (CGFloat(i / 2) + 0.34 * plan.detail(i, channel: 5))
                    / CGFloat((count + 1) / 2) * 0.86
                let p = plan.point(side, fraction, in: room)
                let x = p.x + (side == 0 ? -9 : 9)
                let magnitude = plan.detail(i, channel: 3)
                switch plan.biome {
                case .toxic:
                    if magnitude < (0.74 - plan.development * 0.50) {
                        growth(x, p.y, size: 0.63 + magnitude)
                    } else {
                        if i.isMultiple(of: 3) {
                            pipe(x, p.y, size: 0.72 + magnitude * 0.36)
                        } else {
                            machine(x, p.y, top: 0x4f6250, size: 0.78 + magnitude * 0.30)
                        }
                    }
                case .iron:
                    machine(x, p.y, top: 0x536573, size: 0.68 + magnitude * 0.48)
                case .frost:
                    if magnitude < 0.82 - plan.development * 0.42 {
                        ice(x, p.y, size: 0.67 + magnitude * 0.75)
                    } else {
                        machine(x, p.y, top: 0x8bacbd, size: 0.80 + magnitude * 0.28)
                        ellipse(x-4, p.y-10, 29, 11, 0xafcdd7, 0.83)
                    }
                }
            }
        }

        func growth(_ x: CGFloat, _ y: CGFloat, size: CGFloat) {
            ellipse(x+3, y, 33*size, 15*size, 0x10221a, 0.87)
            for i in -2...2 {
                let f = CGFloat(i)
                let top = y + (32 - abs(f) * 6) * size
                let offset = f * 7 * size
                path([CGPoint(x: x+f*3, y: y), CGPoint(x: x+offset-4, y: top-10),
                      CGPoint(x: x+offset, y: top), CGPoint(x: x+offset+5, y: top-9)],
                     i.isMultiple(of: 2) ? 0x658441 : 0x3e623d)
                ellipse(x+offset, top-3, 5*size, 4*size, 0xb6c968, 0.8)
            }
        }

        func ice(_ x: CGFloat, _ y: CGFloat, size: CGFloat) {
            ellipse(x+4, y-2, 42*size, 17*size, 0x24465f, 0.73)
            for i in -1...1 {
                let f = CGFloat(i)
                let base = CGPoint(x: x+f*10*size, y: y-abs(f)*4)
                let apex = base + CGPoint(x: -6*size, y: (39-abs(f)*12)*size)
                let left = base + CGPoint(x: -9*size, y: 5*size)
                let right = base + CGPoint(x: 10*size, y: 8*size)
                path([left, apex, base], 0x94c7d7, 0.90)
                path([base, apex, right], 0x4791b2, 0.95)
                path([left, apex, apex+CGPoint(x: 3*size, y: -12*size)], 0xd0ebee, 0.85, stroke: 1.15)
            }
        }

        func pipe(_ x: CGFloat, _ y: CGFloat, size: CGFloat) {
            ellipse(x+7, y-5, 40*size, 18*size, 0x11291e, 0.72)
            let points = [CGPoint(x: x-14*size, y: y-5*size),
                          CGPoint(x: x+8*size, y: y),
                          CGPoint(x: x+8*size, y: y+20*size),
                          CGPoint(x: x+16*size, y: y+26*size)]
            path(points, 0x182c28, 1, stroke: 13*size)
            path(points, 0x6d7452, 1, stroke: 9*size)
            path(points.map { $0 + CGPoint(x: -2*size, y: 2*size) },
                 0xaaab76, 0.78, stroke: 2.1*size)
            ellipse(x+17*size, y+26*size, 10*size, 8*size, 0x32482d)
            ellipse(x+18*size, y+26*size, 5*size, 4*size, 0x9fc158, 0.86)
        }

        func machine(_ x: CGFloat, _ y: CGFloat, top: UInt32, size: CGFloat) {
            block(x: x, y: y, w: 33*size, h: 23*size, rise: 14*size, top: top)
            block(x: x-4, y: y+11*size, w: 18*size, h: 14*size, rise: 13*size, top: top)
            ellipse(x-5, y+25*size, 11*size, 6*size, colors.outside)
            ellipse(x-6, y+26*size, 6*size, 3*size, colors.accent, 0.9)
            for i in -1...1 {
                let p = CGPoint(x: x + CGFloat(i)*7*size, y: y-7*size)
                path([p, p+CGPoint(x: 3, y: 5*size)], colors.accent, 0.68, stroke: 1.5)
            }
        }

        func arena() {
            switch plan.landmark {
            case .regular:
                if plan.wave >= 26 {
                    for x: CGFloat in [0.16, 0.84] {
                        let p = plan.point(x, 0.89, in: room)
                        monument(p, size: 0.8)
                    }
                }
            case .refuge:
                let p = plan.point(0.5, 0.64, in: room)
                ellipse(p.x, p.y, room.width * 0.64, 119, colors.high, 0.18)
                for x: CGFloat in [0.11, 0.89] {
                    let lamp = plan.point(x, 0.71, in: room)
                    ellipse(lamp.x, lamp.y, 26, 13, 0xffdf9e, 0.22)
                    ellipse(lamp.x, lamp.y, 6, 4, 0xffdf9e, 0.90)
                }
            case .firstArena, .secondArena, .finalArena:
                let final = plan.landmark == .finalArena
                let first = plan.landmark == .firstArena
                let p = plan.point(0.50, final ? 0.70 : 0.60, in: room)
                let half = room.width * (final ? 0.36 : first ? 0.28 : 0.34)
                let rise: CGFloat = final ? 116 : first ? 59 : 88
                let points: [CGPoint] = (0..<8).map { i in
                    let angle = CGFloat(i)*CGFloat.pi/4 + CGFloat.pi/8
                    return p + CGPoint(x: cos(angle)*half, y: sin(angle)*rise)
                }
                if plan.biome == .frost {
                    ellipse(p.x, p.y, half * 2.07, rise * 2.04, colors.high, 0.26)
                    for i in 0..<points.count {
                        let edge = points[i]
                        let bend = p + CGPoint(x: (edge.x - p.x) * 0.45 + 9, y: (edge.y - p.y) * 0.46)
                        path([edge, bend, p], colors.high, 0.47, stroke: 1.2)
                    }
                } else if plan.biome == .iron {
                    path(points, colors.outside, 0.64)
                    path(points + [points[0]], colors.high, 0.74, stroke: 3)
                    if !first {
                        for i in 0..<7 {
                            let x = p.x + CGFloat(i - 3) * half / 4
                            path([CGPoint(x: x, y: p.y-rise*0.67), CGPoint(x: x, y: p.y+rise*0.67)],
                                 colors.high, 0.35, stroke: 1.5)
                        }
                    }
                } else {
                    path(points, colors.outside, 0.51)
                    path(points + [points[0]], colors.accent, 0.38, stroke: final ? 4 : 2)
                    let inner = points.map { p + CGPoint(x: ($0.x-p.x)*0.83, y: ($0.y-p.y)*0.83) }
                    path(inner + [inner[0]], colors.high, 0.68, stroke: 2)
                }
                let y = final ? CGFloat(0.94) : first ? 0.75 : 0.86
                for x: CGFloat in [0.12, 0.88] {
                    monument(plan.point(x, y, in: room), size: final ? 1.46 : first ? 0.91 : 1.22)
                }
            }
        }

        func monument(_ p: CGPoint, size: CGFloat) {
            switch plan.biome {
            case .toxic:
                machine(p.x, p.y, top: 0x536850, size: size)
                growth(p.x - 11, p.y-10, size: size*0.63)
            case .iron:
                machine(p.x, p.y, top: 0x627383, size: size)
                path([p + CGPoint(x: -14, y: 16), p + CGPoint(x: -29, y: 23)],
                     colors.high, 0.92, stroke: 5)
            case .frost:
                ice(p.x, p.y, size: size)
                ice(p.x + 11, p.y-8, size: size*0.66)
            }
        }
    }
}

private func + (lhs: CGPoint, rhs: CGPoint) -> CGPoint {
    CGPoint(x: lhs.x + rhs.x, y: lhs.y + rhs.y)
}
