import Foundation
import CoreGraphics

/// Artwork-only poses. All hitboxes, movement speeds and combat clocks
/// remain controlled by OutpostScene rather than sprite transforms.
struct PilotVisualPose {
    let verticalOffset: CGFloat
    let lean: CGFloat
    let widthScale: CGFloat
    let heightScale: CGFloat
    let shadowScale: CGFloat
}

struct EnemyVisualPose {
    let verticalOffset: CGFloat
    let lean: CGFloat
    let heightScale: CGFloat
    let shadowScale: CGFloat
}

enum CharacterMotion {
    /// Counterclockwise sectors in SpriteKit world coordinates, east first.
    static let pilotDirections = ["e", "ne", "n", "nw", "w", "sw", "s", "se"]

    static func pilotDirection(heading: CGFloat, previous: Int? = nil) -> Int {
        guard heading.isFinite else { return previous ?? 6 }
        let full = CGFloat.pi * 2
        let angle = (heading.truncatingRemainder(dividingBy: full) + full)
            .truncatingRemainder(dividingBy: full)
        // A 6-degree dead band prevents flicker at diagonal boundaries.
        if let previous, (0..<8).contains(previous) {
            let center = CGFloat(previous) * .pi / 4
            let difference = atan2(sin(angle - center), cos(angle - center))
            if abs(difference) < .pi / 8 + .pi / 30 { return previous }
        }
        return Int((angle / (.pi / 4)).rounded()) % 8
    }

    static func pilot(time: TimeInterval, moving: Bool, facing: CGFloat,
                      timeSinceShot: TimeInterval) -> PilotVisualPose {
        let t = CGFloat(time)
        let stride = t * 15
        let breath = sin(t * 2.4)
        let kick = CGFloat(max(0, 1 - max(0, timeSinceShot) / 0.17))
        let side: CGFloat = facing < 0 ? -1 : 1
        let verticalOffset = moving
            ? 2.0 * abs(sin(stride * 0.5)) - 1.6 * kick
            : 0.6 * breath - 1.6 * kick
        let lean = (moving ? 0.037 * sin(stride * 0.5) : 0.006 * breath) -
                   side * 0.024 * kick
        let width = (moving ? 1 + 0.019 * cos(stride) : 1 + 0.006 * breath) -
                    0.028 * kick
        let height = (moving ? 1 + 0.028 * sin(stride + .pi / 3)
                             : 1 + 0.010 * breath) + 0.018 * kick
        let shadow = moving ? 1 - 0.065 * abs(sin(stride * 0.5)) : 1
        return PilotVisualPose(verticalOffset: verticalOffset, lean: lean,
                               widthScale: side * width, heightScale: height,
                               shadowScale: shadow)
    }

    static func enemy(time: TimeInterval, behavior: Int, phase: CGFloat,
                      moving: Bool, aiming: Bool) -> EnemyVisualPose {
        let t = CGFloat(time)
        let pace: CGFloat = behavior == 3 ? 5.5 :
            (behavior == 2 ? 15 : (behavior >= 4 ? 7 : 10))
        let stride = t * pace + phase
        let amplitude: CGFloat = behavior == 3 ? 0.7 : (behavior == 2 ? 2.3 : 1.4)
        let bob = moving ? amplitude * sin(stride) : 0.28 * sin(t * 2.2 + phase)
        let warningPulse: CGFloat = aiming ? 0.025 * (1 + sin(t * 8)) : 0
        let height = moving ? 1 + 0.024 * sin(stride + .pi / 3) : 1 + warningPulse
        let lean = moving ? 0.028 * sin(stride * 0.5) : 0
        let shadow = moving ? 1 - 0.035 * abs(sin(stride)) : 1
        return EnemyVisualPose(verticalOffset: bob, lean: lean,
                               heightScale: height, shadowScale: shadow)
    }
}
