import SpriteKit

/// Isolated southwest articulation experiment. Pixel coordinates refer to the
/// existing 256px idle texture; no authored walk sheet or gameplay state is used.
final class PilotLegRigPreview: SKNode {
    private let farLeg = SKNode()
    private let nearLeg = SKNode()
    private let farShin = SKNode()
    private let nearShin = SKNode()
    private let farBoot = SKNode()
    private let nearBoot = SKNode()
    private let farOrigin: CGPoint
    private let nearOrigin: CGPoint
    private let unit: CGFloat

    init(texture: SKTexture, size: CGSize) {
        unit = size.width / 256
        func point(_ x: CGFloat, _ y: CGFloat) -> CGPoint {
            CGPoint(x: (x / 256 - 0.5) * size.width,
                    y: (0.5 - y / 256) * size.height)
        }
        farOrigin = point(110, 166)
        nearOrigin = point(172, 170)
        super.init()
        func piece(_ vertices: [CGPoint], pivot: CGPoint) -> SKCropNode {
            let path = CGMutablePath()
            for (index, vertex) in vertices.enumerated() {
                let p = point(vertex.x, vertex.y)
                let local = CGPoint(x: p.x - pivot.x, y: p.y - pivot.y)
                if index == 0 { path.move(to: local) } else { path.addLine(to: local) }
            }
            path.closeSubpath()
            let mask = SKShapeNode(path: path)
            mask.fillColor = .white
            mask.strokeColor = .clear
            mask.lineWidth = 0
            let crop = SKCropNode()
            crop.maskNode = mask
            let sprite = SKSpriteNode(texture: texture, color: .white, size: size)
            sprite.position = CGPoint(x: -pivot.x, y: -pivot.y)
            crop.addChild(sprite)
            return crop
        }
        func points(_ values: [(CGFloat, CGFloat)]) -> [CGPoint] {
            values.map { CGPoint(x: $0.0, y: $0.1) }
        }
        // Clip the original leg silhouette into articulated pieces. Adjacent
        // pieces share the same cut, restoring original registration at rest.
        func clipped(_ polygon: [CGPoint], low: CGFloat, high: CGFloat) -> [CGPoint] {
            var result = polygon
            for (boundary, keepAbove) in [(low, true), (high, false)] {
                let input = result
                result = []
                guard var previous = input.last else { return [] }
                for current in input {
                    let previousInside = keepAbove ? previous.y >= boundary : previous.y <= boundary
                    let currentInside = keepAbove ? current.y >= boundary : current.y <= boundary
                    if previousInside != currentInside {
                        let t = (boundary - previous.y) / (current.y - previous.y)
                        result.append(CGPoint(x: previous.x + t * (current.x - previous.x), y: boundary))
                    }
                    if currentInside { result.append(current) }
                    previous = current
                }
            }
            return result
        }
        func assemble(leg: SKNode, shin: SKNode, boot: SKNode, polygon: [CGPoint],
                      hip: CGPoint, kneePixel: CGPoint, anklePixel: CGPoint) {
            let knee = point(kneePixel.x, kneePixel.y)
            let ankle = point(anklePixel.x, anklePixel.y)
            leg.position = hip
            leg.addChild(piece(clipped(polygon, low: 0, high: kneePixel.y), pivot: hip))
            shin.position = CGPoint(x: knee.x - hip.x, y: knee.y - hip.y)
            shin.addChild(piece(clipped(polygon, low: kneePixel.y, high: anklePixel.y), pivot: knee))
            leg.addChild(shin)
            boot.position = CGPoint(x: ankle.x - knee.x, y: ankle.y - knee.y)
            boot.addChild(piece(clipped(polygon, low: anklePixel.y, high: 256), pivot: ankle))
            shin.addChild(boot)
            addChild(leg)
        }
        assemble(leg: farLeg, shin: farShin, boot: farBoot,
                 polygon: points([(68,169),(103,156),(143,174),(143,256),(61,256)]),
                 hip: farOrigin, kneePixel: CGPoint(x: 108, y: 193),
                 anklePixel: CGPoint(x: 96, y: 214))
        assemble(leg: nearLeg, shin: nearShin, boot: nearBoot,
                 polygon: points([(143,174),(145,164),(169,164),(214,182),(214,256),(143,256)]),
                 hip: nearOrigin, kneePixel: CGPoint(x: 174, y: 195),
                 anklePixel: CGPoint(x: 178, y: 224))
        // Complementary silhouette retains the original hands and torso.
        let body = piece(points([(0,0),(256,0),(256,256),(214,256),(214,182),
                                 (169,164),(145,164),(143,174),(103,156),(68,169),
                                 (61,256),(0,256)]), pivot: .zero)
        body.zPosition = 2
        addChild(body)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    func update(stridePhase: CGFloat, movementBlend: CGFloat) {
        // Two opposed swings per full authored four-frame stride.
        // Reuse displacement-driven acceleration/deceleration from the scene.
        // At rest the pieces return to their exact original pixel registration.
        let blend = min(1, max(0, movementBlend))
        let cycle = sin(stridePhase / 2)
        farLeg.zRotation = cycle * 0.13 * blend
        nearLeg.zRotation = -cycle * 0.13 * blend
        // Flex only the advancing knee. Counter-rotate each boot so its sole
        // remains level rather than kicking toward the camera.
        farShin.zRotation = -max(0, cycle) * 0.28 * blend
        nearShin.zRotation = -max(0, -cycle) * 0.28 * blend
        farBoot.zRotation = -(farLeg.zRotation + farShin.zRotation)
        nearBoot.zRotation = -(nearLeg.zRotation + nearShin.zRotation)
        farLeg.position = farOrigin
        nearLeg.position = nearOrigin
    }
}
