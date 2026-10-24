import SpriteKit

/// Isolated southwest articulation experiment. Pixel coordinates refer to the
/// existing 256px idle texture; no authored walk sheet or gameplay state is used.
final class PilotLegRigPreview: SKNode {
    private let farLeg = SKNode()
    private let nearLeg = SKNode()
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
        farLeg.position = farOrigin
        farLeg.addChild(piece(points([(68,169),(103,156),(143,174),(143,256),(61,256)]), pivot: farOrigin))
        addChild(farLeg)
        nearLeg.position = nearOrigin
        nearLeg.addChild(piece(points([(143,174),(145,164),(169,164),(214,182),(214,256),(143,256)]), pivot: nearOrigin))
        addChild(nearLeg)
        // Complementary silhouette retains the original hands and torso.
        let body = piece(points([(0,0),(256,0),(256,256),(214,256),(214,182),
                                 (169,164),(145,164),(143,174),(103,156),(68,169),
                                 (61,256),(0,256)]), pivot: .zero)
        body.zPosition = 2
        addChild(body)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    func update(stridePhase: CGFloat) {
        // Two opposed swings per full authored four-frame stride.
        let swing = sin(stridePhase / 2)
        farLeg.zRotation = swing * 0.10
        nearLeg.zRotation = -swing * 0.10
        farLeg.position = CGPoint(x: farOrigin.x - swing * 4 * unit,
                                  y: farOrigin.y + max(0, swing) * 3 * unit)
        nearLeg.position = CGPoint(x: nearOrigin.x + swing * 4 * unit,
                                   y: nearOrigin.y + max(0, -swing) * 3 * unit)
    }
}
