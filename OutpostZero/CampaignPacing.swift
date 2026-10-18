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


/// Explicit, deliberately varied encounter layouts for playable 20-room worlds.
/// Rules are authored separately from SpriteKit to make pacing inspectable
/// before they are wired into movement, hostile spawning and save recovery.
/// A separate mission type: keep a vulnerable field device intact under fire.
/// The player still earns normal kill rewards, but kills do not end the mission.
enum EquipmentDefenseRules {
    static let maximumIntegrity = 150
    static let hitDamage = 4
    static let hitCooldown: TimeInterval = 1.2
    static let enemyCap = 10
    static let spawnCadence: TimeInterval = 2.0

    static func succeeds(elapsed: TimeInterval, duration: TimeInterval,
                         integrity: Int) -> Bool {
        duration > 0 && elapsed >= duration && integrity > 0
    }

    static func fails(integrity: Int) -> Bool { integrity <= 0 }

    static func maySpawn(elapsed: TimeInterval, duration: TimeInterval,
                         integrity: Int, living: Int) -> Bool {
        duration > 0 && elapsed >= 0 && elapsed < duration &&
            integrity > 0 && living < enemyCap
    }

    static func applyHit(integrity: Int) -> Int {
        max(0, integrity - hitDamage)
    }
}

enum SurvivalEncounterRules {
    enum Kind: Equatable {
        case tactical
        case survival
        case equipmentDefense
        case boss

        var isTimed: Bool { self == .survival || self == .equipmentDefense }
    }

    // These placements vary by world. An equipment-defense mission does not
    // replace a boss and must never be confused with a survival XP-farm loop.
    private static let survivalRooms: [[Int]] = [
        [6, 10, 14, 17], [5, 8, 11, 15, 18], [6, 9, 13, 17]
    ]
    private static let defenseRooms: [[Int]] = [
        [12], [], [15]
    ]

    static func kind(world: Int, room: Int) -> Kind {
        guard (1..<CampaignPacing.roomsPerWorld).contains(room) else {
            return room == CampaignPacing.roomsPerWorld ? .boss : .tactical
        }
        guard (0..<survivalRooms.count).contains(world) else { return .tactical }
        if defenseRooms[world].contains(room) { return .equipmentDefense }
        return survivalRooms[world].contains(room) ? .survival : .tactical
    }

    /// Longer battles are deliberate, not room-clear waves. They are
    /// 90-120 seconds and automatically finish their spawning phase.
    static func duration(world: Int, room: Int) -> TimeInterval {
        guard kind(world: world, room: room).isTimed else { return 0 }
        return TimeInterval(min(120, 90 + max(0, room - 5) * 2))
    }

    static func spawnInterval(room: Int) -> TimeInterval {
        // Keep reinforcement cadence moderate to support mobile rendering.
        max(0.85, 1.35 - Double(max(1, room)) * 0.025)
    }

    static func maxLivingEnemies(room: Int) -> Int {
        min(28, 15 + max(0, room - 5))
    }

    static func spawnBatch(room: Int) -> Int {
        room <= 8 ? 1 : 2
    }

    static func canSpawn(world: Int, room: Int, elapsed: TimeInterval,
                         livingEnemies: Int) -> Bool {
        let deadline = duration(world: world, room: room)
        return deadline > 0 && elapsed >= 0 && elapsed < deadline &&
            livingEnemies < maxLivingEnemies(room: room)
    }

    static func extractionActive(world: Int, room: Int,
                                 elapsed: TimeInterval) -> Bool {
        let deadline = duration(world: world, room: room)
        return deadline > 0 && elapsed >= deadline
    }

    enum ExitRoute: Equatable {
        case combatGate
        case extractionPortal
    }

    /// A timed arena must use a distinct extraction structure instead of
    /// silently converting the ordinary between-room combat gate.
    static func exitRoute(world: Int, room: Int) -> ExitRoute {
        kind(world: world, room: room).isTimed ? .extractionPortal : .combatGate
    }

    /// Survival is won by outlasting the timer, NOT by killing every unit.
    /// Enemies remaining in the arena can still give ordinary kill XP/coins
    /// until the pilot exits; they do not block opening the portal.
    static func extractionCanOpen(world: Int, room: Int,
                                  elapsed: TimeInterval,
                                  livingEnemies: Int) -> Bool {
        livingEnemies >= 0 && exitRoute(world: world, room: room) == .extractionPortal &&
            extractionActive(world: world, room: room, elapsed: elapsed)
    }

    /// Standard XP and coins remain available from enemies already present.
    /// No new enemies spawn during extraction and there is NO speed bonus.
    /// Mostly ordinary, fragile units. Occasional raiders diversify the
    /// silhouettes; later arenas gain a sparse shooter every 17 arrivals.
    static func swarmType(room: Int, slot: Int) -> Int {
        guard room >= 1 else { return 0 }
        if room >= 8 && slot > 0 && slot.isMultiple(of: 17) { return 4 }
        return slot.isMultiple(of: 5) ? 2 : 0
    }

    static let fastExtractionBonusCoins = 0
    static let fastExtractionBonusXP = 0
    static let fastExtractionBonusSalvage = 0
}
