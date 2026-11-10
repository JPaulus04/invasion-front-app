import Foundation
import CoreGraphics

@main
struct BoundedCombatCameraTests {
    static func main() {
        for size in [CGSize(width: 320, height: 568),
                     CGSize(width: 393, height: 852),
                     CGSize(width: 768, height: 1024)] {
            let config = BoundedCombatCamera.Configuration.standard(for: size)
            let view = config.viewport
            let world = config.arena
            precondition(world.width > view.width && world.height > view.height)
            var offset = CGPoint(x: view.midX - world.midX,
                                 y: view.midY - world.midY)
            let center = CGPoint(x: world.midX, y: world.midY)
            let still = BoundedCombatCamera.target(player: center,
                                                    current: offset, configuration: config)
            precondition(abs(still.x - offset.x) < 0.01 &&
                         abs(still.y - offset.y) < 0.01,
                         "Dead zone must prevent idle camera drift")
            for player in [CGPoint(x: world.minX, y: world.minY),
                           CGPoint(x: world.maxX, y: world.maxY),
                           CGPoint(x: world.minX, y: world.maxY),
                           CGPoint(x: world.maxX, y: world.minY)] {
                for _ in 0..<180 {
                    offset = BoundedCombatCamera.step(
                        current: offset, player: player, delta: 1.0 / 60,
                        configuration: config)
                }
                let visible = view.offsetBy(dx: -offset.x, dy: -offset.y)
                precondition(visible.minX >= world.minX - 0.01 &&
                             visible.maxX <= world.maxX + 0.01 &&
                             visible.minY >= world.minY - 0.01 &&
                             visible.maxY <= world.maxY + 0.01,
                             "Camera must never reveal outside the arena")
            }
        }
        print("Bounded follow-camera dead zone, movement and edge clamping passed")
    }
}
