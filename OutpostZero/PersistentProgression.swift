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
    /// Shared by the live character stats and purchase previews.
    static func gearBenefit(_ id: String, rank: Int) -> Int {
        let rank = max(0, min(maximumRank, rank))
        switch id {
        case "armor": return min(5, rank) * 15 + max(0, rank - 5) * 5
        case "weapon", "reactor": return min(5, rank) + max(0, rank - 5) / 3
        default: return 0
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

/// Exact previews of existing core mechanics, including non-benefit steps.
/// Costs remain one earned core; do not imply every threshold upgrade fires now.
enum RestorationBenefits {
    static func preview(branch: Int, level: Int) -> String {
        let rank = min(10, max(0, level))
        if rank == 10 { return "Fully restored • permanent benefit active" }
        let next = rank + 1
        if ([0, 1].contains(branch) && rank >= 9) || (branch == 4 && rank >= 8) {
            return "Restoration only • no further stat gain"
        }
        switch branch {
        case 0:
            return next / 3 > rank / 3 ? "+1 weapon damage now" :
                "Next +1 damage in \(3 - rank % 3) cores"
        case 1:
            return next / 3 > rank / 3 ? "+1 incendiary burn damage now" :
                "Next +1 burn damage in \(3 - rank % 3) cores"
        case 2: return "+\(rank * 2) → +\(next * 2) maximum HP"
        case 3:
            return "+\(rank * 3) → +\(next * 3) move speed" +
                (next / 4 > rank / 4 ? " • +1 fire rate" : "")
        case 4:
            return next / 4 > rank / 4 ? "+1 chain target now" :
                "Next +1 chain target in \(4 - rank % 4) cores"
        default: return ""
        }
    }
}
