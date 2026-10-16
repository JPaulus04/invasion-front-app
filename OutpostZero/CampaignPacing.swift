import Foundation

/// Values shared by live combat and deterministic full-campaign QA. Keeping
/// these rules together prevents tests from drifting away from actual runs.
enum CampaignPacing {
    static let roomsPerWorld = 20

    static func targetEnemies(room: Int) -> Int {
        guard (1...roomsPerWorld).contains(room) else { return 0 }
        return room == roomsPerWorld ? 1 : min(40, 5 + room * 2)
    }

    static func spawnInterval(room: Int) -> TimeInterval {
        max(0.42, 1.20 - Double(max(1, room)) * 0.032)
    }

    static func enemyHealth(world: Int, room: Int, type: Int) -> Int {
        if room == roomsPerWorld { return WorldCatalog.info(world).bossHealth }
        let scaling = max(0, room - 1)
        let baseline = type == 3 ? 12 + scaling * 3 :
            (type == 1 ? 5 + scaling * 2 : 2 + scaling)
        return baseline + WorldCatalog.info(world).enemyHealthBonus
    }

    static func killXP(type: Int, isBoss: Bool) -> Int {
        isBoss ? 60 : (type >= 3 ? 10 : 6)
    }

    static func killCoins(type: Int, isBoss: Bool) -> Int {
        isBoss ? 250 : (type == 3 ? 20 : (type == 1 ? 12 : 6))
    }

    static func clearXP(room: Int) -> Int { 6 + room }
    static func clearCoins(room: Int) -> Int { 12 + room * 2 }
    static func healingCost(room: Int) -> Int { 40 + room * 8 }
}
