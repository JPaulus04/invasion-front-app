import SpriteKit
import UIKit

/// Build 337: optional illustrated enemy animation playback.
///
/// Asset naming contract:
///   mossbot_idle_00 ... mossbot_idle_07
///   mossbot_move_00 ... mossbot_move_07
///   mossbot_attack_00 ... mossbot_attack_09
///   mossbot_hit_00 ... mossbot_hit_05
///   mossbot_defeat_00 ... mossbot_defeat_07
///
/// Missing or incomplete sequences never replace the current enemy artwork.
/// This keeps the existing combat and collision implementation intact while
/// individual enemy animation sets are being validated.
enum WorldOneEnemyAnimation {
    enum Motion: String, CaseIterable {
        case idle, move, attack, hit, defeat

        var expectedFrames: Int {
            switch self {
            case .idle, .move, .defeat: return 8
            case .attack: return 10
            case .hit: return 6
            }
        }

        var framesPerSecond: Double {
            switch self {
            case .idle: return 8
            case .move: return 12
            case .attack: return 15
            case .hit: return 15
            case .defeat: return 12
            }
        }

        var repeats: Bool { self == .idle || self == .move }
    }

    static func textures(enemy: String, motion: Motion) -> [SKTexture]? {
        let names = (0..<motion.expectedFrames).map {
            String(format: "%@_%@_%02d", enemy, motion.rawValue, $0)
        }
        // SKTexture(imageNamed:) does not reliably signal missing assets.
        // Verify every image first to avoid flashing missing-texture placeholders.
        guard names.allSatisfy({ UIImage(named: $0) != nil }) else {
            return nil
        }
        return names.map { SKTexture(imageNamed: $0) }
    }

    @discardableResult
    static func play(
        _ motion: Motion,
        enemy: String,
        on sprite: SKSpriteNode,
        completion: (() -> Void)? = nil
    ) -> Bool {
        guard let frames = textures(enemy: enemy, motion: motion) else {
            return false
        }
        let key = "build337.enemy.motion"
        sprite.removeAction(forKey: key)
        let animate = SKAction.animate(
            with: frames,
            timePerFrame: 1.0 / motion.framesPerSecond,
            resize: false,
            restore: false
        )
        if motion.repeats {
            sprite.run(.repeatForever(animate), withKey: key)
        } else if let completion {
            sprite.run(.sequence([animate, .run(completion)]), withKey: key)
        } else {
            sprite.run(animate, withKey: key)
        }
        return true
    }
}
