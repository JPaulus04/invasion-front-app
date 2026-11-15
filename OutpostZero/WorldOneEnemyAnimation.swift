import SpriteKit
import UIKit

/// Approved World 1 grunt artwork. Loading is all-or-nothing, cached per motion;
/// the original polished grunt remains a fallback if the bundle is incomplete.
enum WorldOneEnemyAnimation {
    typealias Motion = EnemyAnimationRules.Motion
    private static var cache: [String: [SKTexture]] = [:]
    private static var unavailable: Set<String> = []
    private static let actionKey = "build337.enemy.motion"
    private static let motionKey = "build337Motion"
    private static var preloaded = false

    static func preload() {
        guard !preloaded else { return }
        preloaded = true
        guard mossbotAvailable else { return }
        let frames = Motion.allCases.flatMap { textures(enemy: "mossbot", motion: $0) ?? [] }
        SKTexture.preload(frames) {}
    }

    static func textures(enemy: String, motion: Motion) -> [SKTexture]? {
        let key = "\(enemy).\(motion.rawValue)"
        if let frames = cache[key] { return frames }
        if unavailable.contains(key) { return nil }
        var frames: [SKTexture] = []
        for index in 0..<motion.expectedFrames {
            let name = String(format: "%@_%@_%02d", enemy, motion.rawValue, index)
            guard let image = UIImage(named: name), let pixels = image.cgImage,
                  pixels.width == 512, pixels.height == 512 else {
                unavailable.insert(key)
                return nil
            }
            let texture: SKTexture
            if enemy == "mossbot", motion == .move, let source = image.cgImage {
                // Uploaded move exports contain a second character's fragments
                // beyond x=416. Mask that strip without resizing/recentering the
                // approved body or editing the originals. The clipped left arm
                // is a source defect and still needs a corrected artist export.
                let format = UIGraphicsImageRendererFormat()
                format.scale = 1
                let canvas = CGSize(width: source.width, height: source.height)
                let cleaned = UIGraphicsImageRenderer(size: canvas, format: format).image { context in
                    context.cgContext.clip(to: CGRect(x: 0, y: 0, width: 416, height: canvas.height))
                    image.draw(in: CGRect(origin: .zero, size: canvas))
                }
                texture = SKTexture(image: cleaned)
            } else {
                texture = SKTexture(image: image)
            }
            texture.filteringMode = .linear
            frames.append(texture)
        }
        cache[key] = frames
        return frames
    }

    static var mossbotAvailable: Bool {
        Motion.allCases.allSatisfy { textures(enemy: "mossbot", motion: $0) != nil }
    }

    @discardableResult
    static func install(on sprite: SKSpriteNode, facingLeft: Bool) -> Bool {
        guard mossbotAvailable else { return false }
        if sprite.userData == nil { sprite.userData = NSMutableDictionary() }
        sprite.userData?["animatedEnemy"] = "mossbot"
        sprite.userData?["desiredLocomotion"] = Motion.idle.rawValue
        // Square source canvas is preserved; its visible idle silhouette is
        // ~77% of this height, comparable to the 70-point player illustration.
        sprite.size = CGSize(width: 68, height: 68)
        sprite.position.y = 14
        sprite.colorBlendFactor = 0
        sprite.xScale = facingLeft ? -1 : 1
        play(.idle, enemy: "mossbot", on: sprite)
        return true
    }

    static func isMossbot(_ sprite: SKSpriteNode) -> Bool {
        sprite.userData?["animatedEnemy"] as? String == "mossbot"
    }

    static func updateLocomotion(on sprite: SKSpriteNode, moving: Bool, dx: CGFloat) {
        guard isMossbot(sprite) else { return }
        let next: Motion = moving ? .move : .idle
        sprite.userData?["desiredLocomotion"] = next.rawValue
        // Only a right-facing three-quarter export exists. Mirror horizontally;
        // never rotate the chassis, health bar, collision body or attack cues.
        let active = (sprite.userData?[motionKey] as? String).flatMap(Motion.init(rawValue:))
        if abs(dx) > 0.1, EnemyAnimationRules.allowsTravelFacing(during: active) {
            sprite.xScale = dx < 0 ? -abs(sprite.xScale) : abs(sprite.xScale)
        }
        play(next, enemy: "mossbot", on: sprite)
    }

    @discardableResult
    static func play(_ motion: Motion, enemy: String, on sprite: SKSpriteNode,
                     completion: (() -> Void)? = nil) -> Bool {
        let current = (sprite.userData?[motionKey] as? String).flatMap(Motion.init(rawValue:))
        guard EnemyAnimationRules.canTransition(from: current, to: motion),
              let frames = textures(enemy: enemy, motion: motion) else { return false }
        if sprite.userData == nil { sprite.userData = NSMutableDictionary() }
        sprite.userData?[motionKey] = motion.rawValue
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-captureBuild337EnemySequence") {
            print("[ENEMY ART] motion=\(motion.rawValue) frames=\(frames.count)")
            fflush(stdout)
        }
        #endif
        sprite.removeAction(forKey: actionKey)
        sprite.texture = frames[0]
        let animate = SKAction.animate(with: frames,
            timePerFrame: 1 / motion.framesPerSecond, resize: false, restore: false)
        if motion.repeats {
            sprite.run(.repeatForever(animate), withKey: actionKey)
        } else {
            sprite.run(.sequence([animate, .run { [weak sprite] in
                completion?()
                guard let sprite else { return }
                if motion == .defeat { return }
                sprite.userData?.removeObject(forKey: motionKey)
                let desired = (sprite.userData?["desiredLocomotion"] as? String)
                    .flatMap(Motion.init(rawValue:)) ?? .idle
                play(desired, enemy: enemy, on: sprite)
            }]), withKey: actionKey)
        }
        return true
    }

    static func attack(on sprite: SKSpriteNode, towardX: CGFloat) {
        guard isMossbot(sprite) else { return }
        if abs(towardX) > 0.1 { sprite.xScale = towardX < 0 ? -abs(sprite.xScale) : abs(sprite.xScale) }
        play(.attack, enemy: "mossbot", on: sprite)
    }

    @discardableResult
    static func defeatCopy(of source: SKSpriteNode, at position: CGPoint,
                           in parent: SKNode, depth: CGFloat) -> Bool {
        guard isMossbot(source), textures(enemy: "mossbot", motion: .defeat) != nil else { return false }
        let visual = SKSpriteNode(texture: source.texture, size: source.size)
        visual.name = "enemyDefeatVisual"
        visual.position = CGPoint(x: position.x + source.position.x, y: position.y + source.position.y)
        visual.zPosition = depth
        visual.xScale = source.xScale
        // The authored defeat contains its own collapse. Do not inherit a
        // transient hit squash, glow, health bar or procedural recoil action.
        parent.addChild(visual)
        play(.defeat, enemy: "mossbot", on: visual) { [weak visual] in visual?.removeFromParent() }
        return true
    }
}
