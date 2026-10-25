import Foundation

/// Permanent upgrades intentionally remain separate from world-run XP, coins,
/// and power cores. Salvage is banked immediately so even a failed attempt
/// makes progress. UserDefaults injection makes purchase rules testable.
final class PersistentProgression {
    static let gear = ["weapon", "armor", "reactor"]
    static let abilities = ["chain", "explosive", "incendiary", "orbit"]
    static let all = gear + abilities
    static let maximumRank = 12
    static func rarity(at rank: Int) -> String {
        switch rank {
        case 0..<3: return "COMMON"
        case 3..<6: return "RARE"
        case 6..<9: return "EPIC"
        default: return "LEGENDARY"
        }
    }
    private let storage: UserDefaults

    init(storage: UserDefaults = .standard) { self.storage = storage }

    var salvage: Int { max(0, storage.integer(forKey: "outpostSalvage")) }
    func rank(_ id: String) -> Int {
        guard Self.all.contains(id) else { return 0 }
        return max(0, min(Self.maximumRank, storage.integer(forKey: "outpostRank_\(id)")))
    }

    static func cost(_ id: String, at rank: Int) -> Int {
        guard all.contains(id), rank >= 0, rank < maximumRank else { return Int.max }
        let base = id == "armor" ? 95 : (id == "weapon" ? 135 : (id == "reactor" ? 155 : 120))
        let step = rank + 1
        let rarityMultiplier = rank >= 9 ? 5 : (rank >= 6 ? 3 : (rank >= 3 ? 2 : 1))
        return base * step * step * rarityMultiplier
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
        guard Self.all.contains(id), rank(id) < Self.maximumRank else { return false }
        let price = cost(id)
        guard salvage >= price else { return false }
        storage.set(salvage - price, forKey: "outpostSalvage")
        storage.set(rank(id) + 1, forKey: "outpostRank_\(id)")
        return true
    }

    static func enemyReward(isHeavy: Bool, isBoss: Bool) -> Int {
        isBoss ? 18 : (isHeavy ? 2 : 1)
    }
    static func roomReward(room: Int) -> Int {
        3 + max(1, min(20, room))
    }
    static let worldCompletionBonus = 45
}
