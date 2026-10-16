import Foundation

/// Permanent upgrades intentionally remain separate from world-run XP, coins,
/// and power cores. Salvage is banked immediately so even a failed attempt
/// makes progress. UserDefaults injection makes purchase rules testable.
final class PersistentProgression {
    static let gear = ["weapon", "armor", "reactor"]
    static let abilities = ["chain", "explosive", "incendiary", "orbit"]
    static let all = gear + abilities
    private let storage: UserDefaults

    init(storage: UserDefaults = .standard) { self.storage = storage }

    var salvage: Int { max(0, storage.integer(forKey: "outpostSalvage")) }
    func rank(_ id: String) -> Int {
        guard Self.all.contains(id) else { return 0 }
        return max(0, min(5, storage.integer(forKey: "outpostRank_\(id)")))
    }

    static func cost(_ id: String, at rank: Int) -> Int {
        guard all.contains(id), rank >= 0, rank < 5 else { return Int.max }
        if id == "armor" { return 45 + rank * 45 }
        if id == "weapon" { return 65 + rank * 65 }
        if id == "reactor" { return 75 + rank * 65 }
        return 55 + rank * 55
    }

    func cost(_ id: String) -> Int { Self.cost(id, at: rank(id)) }

    /// Return actual value banked, never creating currency from a negative input.
    @discardableResult
    func bank(_ amount: Int) -> Int {
        let reward = max(0, amount)
        guard reward > 0 else { return 0 }
        storage.set(salvage + reward, forKey: "outpostSalvage")
        return reward
    }

    @discardableResult
    func purchase(_ id: String) -> Bool {
        guard Self.all.contains(id), rank(id) < 5 else { return false }
        let price = cost(id)
        guard salvage >= price else { return false }
        storage.set(salvage - price, forKey: "outpostSalvage")
        storage.set(rank(id) + 1, forKey: "outpostRank_\(id)")
        return true
    }

    static func enemyReward(isHeavy: Bool, isBoss: Bool) -> Int {
        isBoss ? 28 : (isHeavy ? 3 : 2)
    }
    static func roomReward(room: Int) -> Int {
        8 + max(1, min(20, room)) * 3
    }
    static let worldCompletionBonus = 100
}
