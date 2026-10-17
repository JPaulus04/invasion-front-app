import Foundation
import CoreGraphics

enum CombatRules {
    /// Select the nearest active enemy in one allocation-free pass. A tie
    /// retains the earlier enemy, matching the game's prior target behavior.
    static func nearestActiveTarget(
        count: Int, origin: CGPoint, range: CGFloat,
        isActive: (Int) -> Bool, position: (Int) -> CGPoint
    ) -> Int? {
        guard count > 0, range > 0 else { return nil }
        var best: Int?
        var closestSquared = range * range
        for index in 0..<count {
            guard isActive(index) else { continue }
            let point = position(index)
            let dx = point.x - origin.x
            let dy = point.y - origin.y
            let distanceSquared = dx * dx + dy * dy
            if distanceSquared <= closestSquared &&
               (best == nil || distanceSquared < closestSquared) {
                best = index
                closestSquared = distanceSquared
            }
        }
        return best
    }

    /// Ranged enemies are introduced gently rather than replacing half the
    /// enemy population the instant shooters appear. The threat increases
    /// through late rooms, with mixed melee enemies still present.
    static func enemyType(room: Int, roll: Int) -> Int {
        if room == 20 { return 1 }
        if room >= 11 && roll < min(26, 12 + (room - 11) * 2) { return 5 }
        if room >= 6 && roll < (room <= 10 ? 25 : min(55, 38 + (room - 11) * 2)) { return 4 }
        if room >= 4 && roll >= 85 { return 1 }
        if room >= 11 && roll >= 70 { return 3 }
        return roll >= 60 ? 2 : 0
    }

    /// Role-based enemy movement: distinct tactics but never faster than the
    /// existing enemy speed stat. Attack telegraphs stay stationary.
    static func enemySteering(behavior: Int, origin: CGPoint, pilot: CGPoint,
                              elapsed: TimeInterval, phase: CGFloat,
                              ranged: Bool, aiming: Bool) -> CGVector {
        if aiming { return .zero }
        let dx = pilot.x - origin.x
        let dy = pilot.y - origin.y
        let distance = hypot(dx, dy)
        if distance < 0.01 { return .zero }
        let fx = dx / distance
        let fy = dy / distance
        let forward: CGFloat
        let lateral: CGFloat
        if ranged {
            let hold: CGFloat = behavior == 5 ? 190 : 155
            forward = distance < hold - 25 ? -0.55 :
                (distance > hold + 35 ? 0.55 : 0)
            lateral = (sin(phase) >= 0 ? 1 : -1) *
                (abs(forward) < 0.1 ? 0.27 : 0.16)
        } else {
            forward = behavior == 2 ? 0.83 : 1
            switch behavior {
            case 1: lateral = sin(CGFloat(elapsed) * 2.1 + phase) * 0.19
            case 2: lateral = sin(CGFloat(elapsed) * 1.25 + phase) * 0.52
            default: lateral = 0
            }
        }
        let scale = max(1, hypot(forward, lateral))
        return CGVector(dx: (fx * forward - fy * lateral) / scale,
                        dy: (fy * forward + fx * lateral) / scale)
    }

    /// A screen filled with ranged enemies should not produce an unavoidable
    /// wall of simultaneous projectiles and marked mortars. Difficulty grows
    /// through additional threats, not instant overlapping attacks.
    static func maximumConcurrentRangedThreats(room: Int) -> Int {
        if room <= 10 { return 1 }
        if room <= 15 { return 2 }
        return 3
    }

    static func mayBeginRangedAttack(room: Int, activeThreats: Int) -> Bool {
        activeThreats < maximumConcurrentRangedThreats(room: room)
    }

    /// The mortar warning must advance on the same combat clock as impact
    /// resolution, including when the player uses 2× game speed.
    static func mortarWarningScale(elapsed: TimeInterval, flightTime: TimeInterval) -> CGFloat {
        let fraction = CGFloat(max(0, min(1, elapsed / max(0.001, flightTime))))
        return max(0.18, 1 - fraction * 0.82)
    }

    /// The Tidal Warden fires three separately telegraphed projectiles in a
    /// 24-degree fan. Players can dodge through gaps; no hidden side shots.
    static func wardenVolleyTargets(origin: CGPoint, target: CGPoint) -> [CGPoint] {
        let direction = atan2(target.y - origin.y, target.x - origin.x)
        let reach = max(1, hypot(target.x - origin.x, target.y - origin.y))
        return [-CGFloat.pi / 7.5, 0, CGFloat.pi / 7.5].map { offset in
            CGPoint(x: origin.x + cos(direction + offset) * reach,
                    y: origin.y + sin(direction + offset) * reach)
        }
    }

    // Gradually tighten attacks without removing the player's dodge window.
    static func shooterTelegraph(room: Int) -> TimeInterval {
        max(0.48, 0.7 - Double(max(0, room - 6)) * 0.012)
    }

    static func shooterCooldown(room: Int) -> TimeInterval {
        max(1.7, 2.2 - Double(max(0, room - 6)) * 0.03)
    }

    static func lobberCooldown(room: Int) -> TimeInterval {
        max(2.8, 3.4 - Double(max(0, room - 11)) * 0.06)
    }

    static func projectileHits(from start: CGPoint, to end: CGPoint, pilot: CGPoint, radius: CGFloat) -> Bool {
        let dx = end.x - start.x
        let dy = end.y - start.y
        let lengthSquared = dx * dx + dy * dy
        let t = lengthSquared > 0 ? min(1, max(0, ((pilot.x - start.x) * dx + (pilot.y - start.y) * dy) / lengthSquared)) : 0
        return hypot(start.x + t * dx - pilot.x, start.y + t * dy - pilot.y) <= radius
    }

    // Orbital blades are modeled as short-range contact equipment, not
    // invulnerability. They only strike when they physically reach a foe.
    static func orbitalBladeHits(blade: CGPoint, enemy: CGPoint, enemyRadius: CGFloat) -> Bool {
        hypot(blade.x - enemy.x, blade.y - enemy.y) < enemyRadius + 13
    }

    static func blastHits(center: CGPoint, pilot: CGPoint, radius: CGFloat) -> Bool {
        hypot(center.x - pilot.x, center.y - pilot.y) <= radius + 14
    }
}


/// Purposeful room compositions instead of independent random enemy rolls.
/// A fixed composition per world/room makes balancing reproducible, while the
/// random valid spawn positions still make each fight feel organic.
enum EncounterDirector {
    enum Style: Int {
        case patrol, flank, crossfire, siege, gauntlet, boss
    }

    enum Lane { case left, right, center }

    static func style(room: Int) -> Style {
        if room >= 20 { return .boss }
        if room <= 3 { return .patrol }
        if room <= 5 { return .flank }
        if room <= 10 { return room.isMultiple(of: 3) ? .crossfire : .flank }
        if room <= 15 {
            return room.isMultiple(of: 3) ? .siege :
                (room.isMultiple(of: 2) ? .crossfire : .flank)
        }
        switch room % 4 {
        case 0: return .crossfire
        case 1: return .flank
        case 2: return .siege
        default: return .gauntlet
        }
    }

    static func title(room: Int) -> String {
        switch style(room: room) {
        case .patrol: return "PATROL"
        case .flank: return "FLANKING RAID"
        case .crossfire: return "CROSSFIRE"
        case .siege: return "MORTAR SUPPORT"
        case .gauntlet: return "MIXED ASSAULT"
        case .boss: return "BOSS ENCOUNTER"
        }
    }

    /// Give each encounter an intentional unit mixture without overriding
    /// world-specific enemy unlocks or spawning excessive ranged attackers.
    static func enemyRoll(world: Int, room: Int, slot: Int) -> Int {
        let seed = (max(0, slot) * 37 + max(0, room) * 17 +
                    max(0, world) * 11) % 100
        // Rooms 1-5 should be readable even in Worlds 2/3. Keep the roll
        // above the ranged threshold and below the armored-heavy threshold.
        if room <= 5 { return 35 + seed % 35 }
        // Controlled ranged slots avoid accidentally making 50% of late
        // encounters shooters when the enemy unlock thresholds increase.
        let supportRoll = room >= 11 ? 55 + seed % 45 : 34 + seed % 66
        switch style(room: room) {
        case .patrol: return 35 + seed % 55
        case .flank:
            return slot.isMultiple(of: 3) ? 63 + seed % 9 : supportRoll
        case .crossfire:
            // Reserve one shooter slot for approximately every five enemies.
            // Avoid the earlier lobber thresholds in Flooded/Toxic worlds:
            // those worlds should display crossfire as actual rifle fire.
            let shooterRoll: Int
            switch world {
            case 1: shooterRoll = 19 + seed % 7
            case 2: shooterRoll = max(25, min(30, 15 + room) + 2)
            default: shooterRoll = room >= 11
                ? min(39, 15 + room) : 6 + seed % 8
            }
            return slot.isMultiple(of: 5) ? shooterRoll : supportRoll
        case .siege:
            // One telegraphed lobber in each ~six-enemy group; other slots
            // remain mixed melee so players can dodge through gaps.
            return slot.isMultiple(of: 6) ? 3 + seed % 9 : supportRoll
        case .gauntlet:
            if slot % 8 == 0 { return 8 + seed % 7 }
            if slot % 8 == 4 { return 70 + seed % 12 }
            return supportRoll
        case .boss: return 50
        }
    }

    static func spawnLane(room: Int, slot: Int) -> Lane {
        switch style(room: room) {
        case .patrol, .boss: return .center
        case .flank:
            // Pairs coming from alternate sides are easier to understand
            // and more interesting to dodge than a random full-screen mix.
            return (slot / 2).isMultiple(of: 2) ? .left : .right
        case .crossfire: return slot.isMultiple(of: 2) ? .left : .right
        case .siege: return slot.isMultiple(of: 6) ? .center :
            (slot.isMultiple(of: 2) ? .left : .right)
        case .gauntlet:
            switch slot % 3 {
            case 0: return .center
            case 1: return .left
            default: return .right
            }
        }
    }
}


/// Upgrading matching modules transforms an existing three-slot loadout.
/// Modifiers are intentionally bounded and independently testable.
enum AbilitySynergies {
    static func chainReach(chain: Int, incendiary: Int) -> CGFloat {
        guard chain > 0 else { return 0 }
        return 115 + (incendiary > 0 ? CGFloat(17 + min(3, chain) * 6) : 0)
    }
    static func conductiveBonus(chain: Int, incendiary: Int, burning: Bool) -> Int {
        guard chain > 0, incendiary > 0, burning else { return 0 }
        return 1 + min(3, chain)
    }
    static func thermiteBonus(explosive: Int, incendiary: Int, burning: Bool) -> Int {
        guard explosive > 0, incendiary > 0 else { return 0 }
        return 1 + min(3, incendiary) + (burning ? 2 : 0)
    }
    static func burnDuration(incendiary: Int, explosive: Int) -> TimeInterval {
        guard incendiary > 0 else { return 0 }
        return explosive > 0 ? 3.25 : 2.5
    }
    static func bladeArcDamage(chain: Int, orbit: Int) -> Int {
        guard chain > 0, orbit > 0 else { return 0 }
        return min(4, 1 + min(chain, orbit))
    }
    static func bladeArcReach(chain: Int, orbit: Int) -> CGFloat {
        guard chain > 0, orbit > 0 else { return 0 }
        return CGFloat(65 + min(3, chain) * 8)
    }
    static let bladeArcCooldown: TimeInterval = 1.45


    /// A tactical choice remains visible on early level-ups. When possible,
    /// prioritize a newly available combo so progression feels meaningful,
    /// without automatically selecting any upgrade for the player.
    static func featuredTactical(available: [String], characterLevel: Int,
                                 chain: Int, explosive: Int,
                                 incendiary: Int, orbit: Int) -> String? {
        guard characterLevel <= 8, !available.isEmpty else { return nil }
        func currentRank(_ choice: String) -> Int {
            switch choice {
            case "chain": return chain
            case "explosive": return explosive
            case "incendiary": return incendiary
            case "orbit": return orbit
            default: return 99
            }
        }
        return available.min {
            let leftBonus = currentRank($0) == 0 &&
                preview(ability: $0, chain: chain, explosive: explosive,
                        incendiary: incendiary, orbit: orbit) != nil
            let rightBonus = currentRank($1) == 0 &&
                preview(ability: $1, chain: chain, explosive: explosive,
                        incendiary: incendiary, orbit: orbit) != nil
            if leftBonus != rightBonus { return leftBonus }
            return currentRank($0) < currentRank($1)
        }
    }
    static func preview(ability: String, chain: Int, explosive: Int,
                        incendiary: Int, orbit: Int) -> String? {
        switch ability {
        case "chain":
            if incendiary > 0 { return "COMBO: VOLTAIC FLAMES" }
            if orbit > 0 { return "COMBO: ARC BLADES" }
        case "explosive":
            if incendiary > 0 { return "COMBO: THERMITE BURST" }
        case "incendiary":
            if explosive > 0 { return "COMBO: THERMITE BURST" }
            if chain > 0 { return "COMBO: VOLTAIC FLAMES" }
        case "orbit":
            if chain > 0 { return "COMBO: ARC BLADES" }
        default: break
        }
        return nil
    }
}
