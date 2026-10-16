import Foundation
import CoreGraphics

enum CombatRules {
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
