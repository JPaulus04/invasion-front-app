import Foundation
import CoreGraphics

enum CombatRules {
    static func enemyType(room: Int, roll: Int) -> Int {
        if room == 20 { return 1 }
        if room >= 11 && roll < min(36, 22 + (room - 11)) { return 5 } // lobber frequency increases in late rooms
        if room >= 6 && roll < min(60, 45 + (room - 6)) { return 4 } // more ranged pressure as rooms advance
        if room >= 4 && roll >= 85 { return 1 } // armored melee
        if room >= 11 && roll >= 70 { return 3 } // heavy melee
        return roll >= 60 ? 2 : 0
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
