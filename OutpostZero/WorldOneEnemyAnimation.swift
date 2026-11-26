import SpriteKit
import UIKit
import ImageIO

/// One presentation controller for Mossbot, World 1 roles and equipped commanders.
/// Event ownership/priority remains the established Build 337 policy.
enum WorldOneEnemyAnimation {
    typealias Motion = EnemyAnimationRules.Motion
    private static var cache: [String: [SKTexture]] = [:]
    private static var unavailable: Set<String> = []
    private static var costs: [String: Int] = [:]
    private static var recent: [String] = []
    private static let actionKey = "build337.enemy.motion"
    private static let motionKey = "build337Motion"
    private static var preloaded = false
    private static var memoryObserver: NSObjectProtocol?

    static func preload() {
        guard !preloaded else { return }
        preloaded = true
        memoryObserver = NotificationCenter.default.addObserver(forName: UIApplication.didReceiveMemoryWarningNotification,
            object: nil, queue: .main) { _ in
                for key in costs.keys { cache.removeValue(forKey: key) }
                costs.removeAll(); recent.removeAll()
            }
        guard mossbotAvailable else { return }
        // Keep the existing forty Mossbot frames/mask/timing unchanged. New
        // characters load lazily at display resolution, not all 400 at startup.
        SKTexture.preload(Motion.allCases.flatMap { textures(enemy: "mossbot",motion: $0) ?? [] }) {}
    }

    private static func remember(_ frames: [SKTexture], key: String, bytes: Int) {
        cache[key] = frames
        guard !key.hasPrefix("mossbot.") else { return }
        costs[key] = bytes
        recent.removeAll { $0 == key }; recent.append(key)
        // Active SKActions retain their own textures; evict only cache ownership.
        while costs.values.reduce(0,+) > 48*1024*1024, recent.count > 1 {
            let old = recent.removeFirst()
            cache.removeValue(forKey: old); costs.removeValue(forKey: old)
        }
    }

    private static func validAlpha(_ image: CGImage) -> Bool {
        guard [CGImageAlphaInfo.first,.last,.premultipliedFirst,.premultipliedLast].contains(image.alphaInfo) else { return false }
        var pixels = [UInt8](repeating: 0,count: 32*32*4)
        let valid = pixels.withUnsafeMutableBytes { buffer -> Bool in
            guard let context = CGContext(data: buffer.baseAddress,width: 32,height: 32,
                bitsPerComponent: 8,bytesPerRow: 128,space: CGColorSpaceCreateDeviceRGB(),
                bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return false }
            context.draw(image,in: CGRect(x: 0,y: 0,width: 32,height: 32))
            return true
        }
        guard valid else { return false }
        let alpha = stride(from: 3,to: pixels.count,by: 4).map { pixels[$0] }
        return alpha.contains { $0 > 0 } && [0,31,992,1023].allSatisfy { alpha[$0] == 0 }
    }

    private static func profile(_ name: String) -> CharacterAnimationCatalog.Profile? {
        if let existing = CharacterAnimationCatalog.profile(name) { return existing }
        guard let manifest = FrontierFactionArt.manifest(name) else { return nil }
        let height: Double
        switch name {
        case "corrosionravager", "blighthydra", "permafrostcrusher", "frostwyrm", "press_giant", "gantry_warden": height = 101
        case "toxictyrant", "cryooverlord", "warforge": height = 126
        case "toxicbrute", "glacierbrute", "bulkhead", "overclock": height = 70
        default: height = 52
        }
        return .init(name: name, folder: FrontierFactionArt.folder(name) ?? WorldTwoCampaign.folder, pixels: manifest.pixels,
                     ground: manifest.art_pivot_px[1], idleHeight: manifest.idle_height_px,
                     bodyHeight: height, footY: -16,
                     sequences: manifest.states.mapValues { $0.frames.count }, quarantine: [])
    }

    static func worldTwoFrames(enemy: String, sequence: String) -> [SKTexture]? {
        guard FrontierFactionArt.manifest(enemy)?.sequence(sequence) != nil else { return nil }
        return textures(enemy: enemy, motion: .idle, sequence: sequence)
    }

    static func textures(enemy: String, motion: Motion, variant: Int = 0, sequence override: String? = nil) -> [SKTexture]? {
        guard let profile = profile(enemy) else { return nil }
        let sequence = override ?? profile.sequence(motion,variant: variant)
        let manifest = FrontierFactionArt.manifest(enemy)
        let key = enemy+"."+sequence
        if let frames = cache[key] {
            if costs[key] != nil { recent.removeAll { $0 == key }; recent.append(key) }
            return frames
        }
        if unavailable.contains(key) { return nil }
        // Quarantine source defects, never silently paint/crop approved uploads.
        // QA-only override: permit the newly uploaded Sporecaster reaction frames
        // in the focused simulator capture, without exposing them in normal play.
        #if DEBUG
        let sporecasterReview = enemy == "sporecaster" &&
            ProcessInfo.processInfo.arguments.contains("-qa339SporecasterReview")
        #else
        let sporecasterReview = false
        #endif
        guard !profile.quarantine.contains(sequence) || sporecasterReview else {
            unavailable.insert(key); return nil
        }
        var frames: [SKTexture] = []; var bytes = 0
        let paths = manifest?.sequence(sequence)?.frames
        let names = paths?.map(WorldTwoCampaign.frameName) ?? profile.frameNames(sequence: sequence)
        for (index, name) in names.enumerated() {
            let texture: SKTexture
            if enemy == "mossbot" {
                guard let image = UIImage(named: name), let source = image.cgImage,
                      source.width == 512, source.height == 512 else { unavailable.insert(key); return nil }
                if motion == .move {
                    // Existing approved Mossbot integration: mask foreign fragments
                    // beyond x=416 without resizing/recentering its original body.
                    let format = UIGraphicsImageRendererFormat(); format.scale = 1
                    let canvas = CGSize(width: source.width,height: source.height)
                    let cleaned = UIGraphicsImageRenderer(size: canvas,format: format).image { context in
                        context.cgContext.clip(to: CGRect(x: 0,y: 0,width: 416,height: canvas.height))
                        image.draw(in: CGRect(origin: .zero,size: canvas))
                    }
                    texture = SKTexture(image: cleaned)
                } else { texture = SKTexture(image: image) }
                bytes += 512*512*4
            } else {
                let subfolder = FrontierFactionArt.folder(enemy).flatMap { folder in paths.map { folder + "/" + ($0[index] as NSString).deletingLastPathComponent } } ?? profile.folder
                guard let url = Bundle.main.url(forResource: name,withExtension: "png",subdirectory: subfolder),
                      let source = CGImageSourceCreateWithURL(url as CFURL,nil),
                      let props = CGImageSourceCopyPropertiesAtIndex(source,0,nil) as? [CFString:Any],
                      (props[kCGImagePropertyPixelWidth] as? NSNumber)?.intValue == profile.pixels,
                      (props[kCGImagePropertyPixelHeight] as? NSNumber)?.intValue == profile.pixels else {
                    unavailable.insert(key); return nil
                }
                let size = min(profile.pixels,Int(ceil(profile.canvasSide(motion)*Double(UIScreen.main.scale))))
                let options: [CFString:Any] = [kCGImageSourceCreateThumbnailFromImageAlways:true,
                    kCGImageSourceThumbnailMaxPixelSize:size,kCGImageSourceShouldCacheImmediately:true]
                guard let image = CGImageSourceCreateThumbnailAtIndex(source,0,options as CFDictionary),
                      (manifest != nil || validAlpha(image)) else { unavailable.insert(key); return nil }
                texture = SKTexture(cgImage: image); bytes += image.width*image.height*4
            }
            texture.filteringMode = .linear; frames.append(texture)
        }
        guard !frames.isEmpty else { unavailable.insert(key); return nil }
        remember(frames,key: key,bytes: bytes)
        return frames
    }

    static var mossbotAvailable: Bool { Motion.allCases.allSatisfy { textures(enemy: "mossbot",motion: $0) != nil } }
    static func character(on sprite: SKSpriteNode) -> String? { sprite.userData?["animatedEnemy"] as? String }
    static func isAnimated(_ sprite: SKSpriteNode) -> Bool { character(on: sprite) != nil }
    static func isMossbot(_ sprite: SKSpriteNode) -> Bool { character(on: sprite) == "mossbot" }
    static func reset(on sprite: SKSpriteNode) {
        sprite.removeAction(forKey: actionKey)
        for key in ["animatedEnemy","desiredLocomotion",motionKey,"animationAttackOrdinal"] { sprite.userData?.removeObject(forKey: key) }
        sprite.anchorPoint = CGPoint(x: 0.5,y: 0.5); sprite.xScale = 1; sprite.yScale = 1; sprite.zRotation = 0
    }
    @discardableResult
    static func install(on sprite: SKSpriteNode, facingLeft: Bool, character name: String = "mossbot") -> Bool {
        guard let p = profile(name),
              (name != "mossbot" || mossbotAvailable),
              textures(enemy: name,motion: .idle) != nil, textures(enemy: name,motion: .move) != nil else { return false }
        reset(on: sprite)
        if sprite.userData == nil { sprite.userData = NSMutableDictionary() }
        sprite.userData?["animatedEnemy"] = name
        sprite.userData?["desiredLocomotion"] = Motion.idle.rawValue
        sprite.position = CGPoint(x: 0,y: p.footY)
        sprite.colorBlendFactor = 0; sprite.xScale = facingLeft ? -1 : 1
        play(.idle,enemy: name,on: sprite)
        return true
    }
    private static func geometry(_ p: CharacterAnimationCatalog.Profile, motion: Motion, on sprite: SKSpriteNode) {
        if p.name == "mossbot" { sprite.size = CGSize(width: 68,height: 68); sprite.anchorPoint = CGPoint(x: 0.5,y: 0.5); return }
        let side = p.canvasSide(motion)
        sprite.size = CGSize(width: side,height: side)
        sprite.anchorPoint = CGPoint(x: 0.5,y: 1-p.registeredGround(motion)/Double(p.pixels))
    }
    static func updateLocomotion(on sprite: SKSpriteNode, moving: Bool, dx: CGFloat) {
        guard let name = character(on: sprite) else { return }
        let next: Motion = moving ? .move : .idle
        sprite.userData?["desiredLocomotion"] = next.rawValue
        let active = (sprite.userData?[motionKey] as? String).flatMap(Motion.init(rawValue:))
        if abs(dx) > 0.1, EnemyAnimationRules.allowsTravelFacing(during: active) {
            sprite.xScale = dx < 0 ? -abs(sprite.xScale) : abs(sprite.xScale)
        }
        play(next,enemy: name,on: sprite)
    }
    @discardableResult
    static func play(_ motion: Motion, enemy: String, on sprite: SKSpriteNode,
                     sequence: String? = nil, frameDuration: TimeInterval? = nil,
                     completion: (() -> Void)? = nil) -> Bool {
        let current = (sprite.userData?[motionKey] as? String).flatMap(Motion.init(rawValue:))
        let authored = FrontierFactionArt.manifest(enemy)?.sequence(sequence ?? (motion == .move ? "run" : motion.rawValue))
        guard (sequence != nil && current != .defeat ||
               EnemyAnimationRules.canTransition(from: current,to: motion)),
              let p = profile(enemy) else { return false }
        let ordinal = sprite.userData?["animationAttackOrdinal"] as? Int ?? 0
        let frames = textures(enemy: enemy,motion: motion,variant: ordinal,sequence: sequence)
        // A bad optional/reaction export retains the same approved identity.
        // Defeat fades an idle copy; hit flashes; attack holds idle with existing
        // combat cues. These visual fallbacks never delay or produce damage.
        guard let first = frames?.first ?? textures(enemy: enemy,motion: .idle)?.first else { return false }
        if sprite.userData == nil { sprite.userData = NSMutableDictionary() }
        sprite.userData?[motionKey] = motion.rawValue
        if motion == .attack { sprite.userData?["animationAttackOrdinal"] = ordinal+1 }
        sprite.removeAction(forKey: actionKey); sprite.texture = first
        geometry(p,motion: frames == nil ? .idle : motion,on: sprite)
        if let manifest = FrontierFactionArt.manifest(enemy) {
            sprite.anchorPoint.x = manifest.art_pivot_px[0] / Double(manifest.pixels)
        }
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-captureBuild337EnemySequence") {
            print("[ENEMY ART] motion=\(motion.rawValue) frames=\(frames?.count ?? 0)")
            fflush(stdout)
        }
        #endif
        let action: SKAction
        if let frames {
            let timePerFrame = frameDuration ?? 1/(authored?.fps ?? motion.framesPerSecond)
            if frameDuration == nil, let durations = authored?.frame_durations_ms, durations.count == frames.count {
                action = .sequence(zip(frames, durations).flatMap { texture, milliseconds in
                    [SKAction.setTexture(texture), SKAction.wait(forDuration: milliseconds / 1000)]
                })
            } else {
                action = .animate(with: frames, timePerFrame: timePerFrame, resize: false, restore: false)
            }
        } else if motion == .defeat {
            action = .fadeOut(withDuration: 0.35)
        } else if motion == .hit {
            action = .sequence([.colorize(with: .white,colorBlendFactor: 0.7,duration: 0.04),
                                .colorize(withColorBlendFactor: 0,duration: 0.16)])
        } else {
            action = .wait(forDuration: Double(p.frameNames(motion,variant: ordinal).count)/motion.framesPerSecond)
        }
        if authored?.loop ?? motion.repeats { sprite.run(.repeatForever(action),withKey: actionKey) }
        else {
            sprite.run(.sequence([action,.run { [weak sprite] in
                completion?()
                guard let sprite, motion != .defeat else { return }
                sprite.userData?.removeObject(forKey: motionKey)
                let desired = (sprite.userData?["desiredLocomotion"] as? String).flatMap(Motion.init(rawValue:)) ?? .idle
                play(desired,enemy: enemy,on: sprite)
            }]),withKey: actionKey)
        }
        return true
    }
    static func attack(on sprite: SKSpriteNode, towardX: CGFloat) {
        guard let name = character(on: sprite) else { return }
        let active = (sprite.userData?[motionKey] as? String).flatMap(Motion.init(rawValue:))
        // Preserve legacy Mossbot facing; new one-shots cannot flip on rejected restarts.
        if abs(towardX) > 0.1, name == "mossbot" || EnemyAnimationRules.canTransition(from: active,to: .attack) {
            sprite.xScale = towardX < 0 ? -abs(sprite.xScale) : abs(sprite.xScale)
        }
        play(.attack,enemy: name,on: sprite)
    }
    @discardableResult
    static func defeatCopy(of source: SKSpriteNode, at position: CGPoint,in parent: SKNode,depth: CGFloat) -> Bool {
        guard let name = character(on: source) else { return false }
        if name == "mossbot", textures(enemy: name,motion: .defeat) == nil { return false }
        let visual = SKSpriteNode(texture: source.texture,size: source.size)
        visual.name = "enemyDefeatVisual"
        visual.userData = NSMutableDictionary(dictionary: ["animatedEnemy":name])
        visual.position = CGPoint(x: position.x+source.position.x,y: position.y+source.position.y)
        visual.zPosition = depth; visual.xScale = source.xScale
        parent.addChild(visual)
        if !play(.defeat,enemy: name,on: visual,completion: { [weak visual] in visual?.removeFromParent() }) {
            visual.removeFromParent(); return false
        }
        return true
    }
}
