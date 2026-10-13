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

    static func projectileHits(from start: CGPoint, to end: CGPoint, pilot: CGPoint, radius: CGFloat) -> Bool {
        let dx = end.x - start.x
        let dy = end.y - start.y
        let lengthSquared = dx * dx + dy * dy
        let t = lengthSquared > 0 ? min(1, max(0, ((pilot.x - start.x) * dx + (pilot.y - start.y) * dy) / lengthSquared)) : 0
        return hypot(start.x + t * dx - pilot.x, start.y + t * dy - pilot.y) <= radius
    }

    static func blastHits(center: CGPoint, pilot: CGPoint, radius: CGFloat) -> Bool {
        hypot(center.x - pilot.x, center.y - pilot.y) <= radius + 14
    }
}
