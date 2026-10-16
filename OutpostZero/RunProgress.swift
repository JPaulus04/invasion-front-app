import Foundation

/// Run-only progress. Permanent power-core restoration is stored separately.
struct RunProgress: Codable {
    private(set) var level = 1
    private(set) var xp = 0
    private(set) var pendingChoices = 0
    private(set) var damageTaken = 0
    var nextLevelXP: Int { 60 + level * 22 + level * level * 5 }
    var stars: Int { damageTaken <= 10 ? 3 : (damageTaken <= 50 ? 2 : 1) }

    mutating func earnXP(_ amount: Int) {
        xp += max(0, amount)
        while xp >= nextLevelXP {
            xp -= nextLevelXP
            level += 1
            pendingChoices += 1
        }
    }

    mutating func chooseUpgrade() -> Bool {
        guard pendingChoices > 0 else { return false }
        pendingChoices -= 1
        return true
    }

    mutating func recordDamage(_ amount: Int) { damageTaken += max(0, amount) }
}

/// All hostile timers share this clock, so menus freeze every attack deadline.
struct CombatClock {
    private(set) var time: TimeInterval = 0
    mutating func advance(_ delta: TimeInterval, playing: Bool) {
        if playing { time += max(0, delta) }
    }
}

/// Rewards are based on the highest stars ever earned in a world, never on repeat clears.
enum WorldCoreRewards {
    static func newlyEarned(previousBest: Int, completedStars: Int) -> Int {
        let previous = min(3, max(0, previousBest))
        let current = min(3, max(0, completedStars))
        return max(0, current - previous)
    }

    static func bestStars(previousBest: Int, completedStars: Int) -> Int {
        min(3, max(0, max(previousBest, completedStars)))
    }
}
