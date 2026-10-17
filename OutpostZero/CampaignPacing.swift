import Foundation

/// Values shared by live combat and deterministic full-campaign QA. Keeping
/// these rules together prevents tests from drifting away from actual runs.
enum CampaignPacing {
    static let roomsPerWorld = 20

    static func targetEnemies(room: Int) -> Int {
        guard (1...roomsPerWorld).contains(room) else { return 0 }
        if room == roomsPerWorld { return 1 }
        // First five rooms teach dodging and upgrades without overwhelming
        // the player. Pressure then ramps continuously into the final rooms.
        if room <= 5 { return 4 + room }
        if room <= 10 { return 9 + (room - 5) * 2 }
        return min(38, 19 + (room - 10) * 2)
    }

    static func spawnInterval(room: Int) -> TimeInterval {
        let established = max(0.42, 1.20 - Double(max(1, room)) * 0.032)
        return established + (room <= 10 ? 0.08 : 0)
    }

    static func enemyHealth(world: Int, room: Int, type: Int) -> Int {
        if room == roomsPerWorld { return WorldCatalog.info(world).bossHealth }
        let scaling = max(0, room - 1)
        let baseline = type == 3 ? 12 + scaling * 3 :
            (type == 1 ? 5 + scaling * 2 : 2 + scaling)
        return baseline + WorldCatalog.info(world).enemyHealthBonus
    }

    static func killXP(type: Int, isBoss: Bool) -> Int {
        // With smaller, less punishing waves, every regular kill remains
        // rewarding. Players still earn upgrades from kills, not a room-clear
        // choice that bypasses XP leveling.
        isBoss ? 60 : (type >= 3 ? 10 : 9)
    }

    static func killCoins(type: Int, isBoss: Bool) -> Int {
        isBoss ? 250 : (type == 3 ? 20 : (type == 1 ? 12 : 6))
    }

    /// Early rooms contain fewer foes, so a modest clear bonus preserves
    /// character level-ups and the fun of selecting new combat abilities.
    static func clearXP(room: Int) -> Int {
        6 + room + (room <= 10 ? 8 : 0)
    }

    /// Make early exploration more forgiving without making late bosses a
    /// guaranteed win. Values are identical at 1× and 2× game clock speeds.
    static func incomingDamage(amount: Int, room: Int) -> Int {
        if room <= 5 { return max(1, Int(ceil(Double(amount) * 0.75))) }
        if room <= 10 { return max(1, Int(ceil(Double(amount) * 0.85))) }
        return amount
    }

    static func hitGracePeriod(room: Int) -> TimeInterval {
        if room <= 5 { return 1.5 }
        if room <= 10 { return 1.3 }
        return 1.1
    }
    static func clearCoins(room: Int) -> Int { 12 + room * 2 }
    static func healingCost(room: Int) -> Int { 40 + room * 8 }
}
