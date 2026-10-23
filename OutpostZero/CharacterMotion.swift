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
    static let pilotDirections = ["e", "ene", "ne", "nne", "n", "nnw", "nw", "wnw",
                                  "w", "wsw", "sw", "ssw", "s", "sse", "se", "ese"]
    static let pilotSouthDirection = 12

    /// Rotate artwork along the shortest arc without delaying joystick motion.
    /// A full reversal settles in about 0.16 seconds at any frame rate.
    static func turnHeading(from current: CGFloat, toward target: CGFloat,
                            delta: TimeInterval) -> CGFloat {
        guard current.isFinite, target.isFinite, delta.isFinite else { return 0 }
        let difference = atan2(sin(target - current), cos(target - current))
        let maximumStep = CGFloat(max(0, delta)) * 20
        let step = min(abs(difference), maximumStep) * (difference < 0 ? -1 : 1)
        return atan2(sin(current + step), cos(current + step))
    }

    static func pilotDirection(heading: CGFloat, previous: Int? = nil) -> Int {
        guard heading.isFinite else { return previous ?? pilotSouthDirection }
        let full = CGFloat.pi * 2
        let angle = (heading.truncatingRemainder(dividingBy: full) + full)
            .truncatingRemainder(dividingBy: full)
        let sector = full / CGFloat(pilotDirections.count)
        // Three degrees of hysteresis stabilize the narrower 22.5° sectors.
        if let previous, pilotDirections.indices.contains(previous) {
            let center = CGFloat(previous) * sector
            let difference = atan2(sin(angle - center), cos(angle - center))
            if abs(difference) < sector / 2 + .pi / 60 { return previous }
        }
        return Int((angle / sector).rounded()) % pilotDirections.count
    }

    static func pilot(time: TimeInterval, moving: Bool, facing: CGFloat,
                      timeSinceShot: TimeInterval, stridePhase: CGFloat? = nil,
                      movementBlend: CGFloat? = nil) -> PilotVisualPose {
        let t = CGFloat(time)
        let stride = stridePhase ?? t * 15
        let walk = min(1, max(0, movementBlend ?? (moving ? 1 : 0)))
        let breath = sin(t * 2.4)
        let kick = CGFloat(max(0, 1 - max(0, timeSinceShot) / 0.17))
        let side: CGFloat = facing < 0 ? -1 : 1
        let verticalOffset = walk * 2.0 * abs(sin(stride * 0.5)) +
            (1 - walk) * 0.6 * breath - 1.6 * kick
        let lean = (walk * 0.037 * sin(stride * 0.5) + (1 - walk) * 0.006 * breath) -
                   side * 0.024 * kick
        let width = 1 + walk * 0.019 * cos(stride) + (1 - walk) * 0.006 * breath -
                    0.028 * kick
        let height = 1 + walk * 0.028 * sin(stride + .pi / 3) +
            (1 - walk) * 0.010 * breath + 0.018 * kick
        let shadow = 1 - walk * 0.065 * abs(sin(stride * 0.5))
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
