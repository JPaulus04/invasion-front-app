import Foundation

/// New runs begin without a tactical loadout. In-run random draws commit
/// abilities until capacity is reached; leveling a known trait is slot-free.
struct AbilityLoadout {
    static let maximumSlots = 3
    static let catalog = ["chain", "explosive", "incendiary", "orbit", "frost"]
    static let simulatorDefault = AbilityLoadout(selected: ["chain", "explosive", "incendiary"])
    private(set) var selected: [String]

    init(selected: [String] = []) {
        var unique: [String] = []
        for ability in selected where Self.catalog.contains(ability) {
            if !unique.contains(ability) && unique.count < Self.maximumSlots {
                unique.append(ability)
            }
        }
        self.selected = unique
    }

    var isReady: Bool { selected.count == Self.maximumSlots }
    func contains(_ ability: String) -> Bool { selected.contains(ability) }

    mutating func acquire(_ id: String, capacity: Int) -> Bool {
        guard Self.catalog.contains(id), !contains(id),
              selected.count < min(Self.maximumSlots, max(0, capacity)) else { return false }
        selected.append(id)
        return true
    }

    // Only legacy simulator fixtures use the old editable selection mechanism.
    @discardableResult
    mutating func toggle(_ ability: String) -> Bool {
        guard Self.catalog.contains(ability) else { return false }
        if let i = selected.firstIndex(of: ability) {
            selected.remove(at: i)
            return true
        }
        return acquire(ability, capacity: Self.maximumSlots)
    }

    func availableTacticalUpgrades(chain: Int, explosive: Int,
                                   incendiary: Int, orbit: Int, frost: Int = 0,
                                   capacity: Int = maximumSlots) -> [String] {
        Self.catalog.filter { id in
            let rank: Int
            switch id {
            case "chain": rank = chain
            case "explosive": rank = explosive
            case "incendiary": rank = incendiary
            case "orbit": rank = orbit
            case "frost": rank = frost
            default: return false
            }
            return rank < 3 && (contains(id) || selected.count < capacity)
        }
    }
}

enum TacticalRarity: Int {
    case common = 0, rare, epic, legendary
}

/// Fixed-rarity design pool. Only the four catalog entries with actual combat
/// behavior can appear in live draws; other entries are future design hooks.
enum TacticalDraftRules {
    static let futureCatalog: [(id: String, rarity: TacticalRarity)] = [
        ("incendiary", .common), ("frost", .common),
        ("piercing", .common), ("turret", .common), ("mines", .common),
        ("explosive", .rare), ("orbit", .rare),
        ("ricochet", .rare), ("repulsion", .rare),
        ("chain", .epic), ("shock", .epic),
        ("kineticShield", .epic), ("phaseDash", .epic),
        ("gravityWell", .legendary), ("drone", .legendary)
    ]
    static func rarity(for id: String) -> TacticalRarity? {
        futureCatalog.first(where: { $0.id == id })?.rarity
    }
    static func weight(for id: String) -> Int {
        switch rarity(for: id) {
        case .common: return 17
        case .rare: return 9
        case .epic: return 4
        case .legendary: return 1
        case nil:
            switch id {
            case "damage": return 15
            case "rate": return 12
            case "armor": return 14
            case "heal": return 10
            default: return 0
            }
        }
    }
    static func pick(from offered: [String], roll: Int) -> String? {
        let weighted = offered.map { max(0, weight(for: $0)) }
        let total = weighted.reduce(0, +)
        guard total > 0 else { return nil }
        var ticket = ((roll % total) + total) % total
        for (index, weight) in weighted.enumerated() {
            if ticket < weight { return offered[index] }
            ticket -= weight
        }
        return nil
    }
}

/// A persistent player level, independent of XP ranks earned within runs.
final class PlayerMastery {
    private let storage: UserDefaults
    init(storage: UserDefaults = .standard) { self.storage = storage }
    var totalXP: Int { max(0, storage.integer(forKey: "outpostPlayerMasteryXP")) }
    static func xpForLevel(_ level: Int) -> Int { 95 + max(1, level) * 24 }
    var level: Int {
        var remaining = totalXP
        var rank = 1
        while rank < 100 && remaining >= Self.xpForLevel(rank) {
            remaining -= Self.xpForLevel(rank)
            rank += 1
        }
        return rank
    }
    var capacity: Int { level >= 20 ? 3 : 2 }
    @discardableResult
    func awardClearedRoom(_ room: Int) -> Int {
        guard (1...20).contains(room) else { return 0 }
        let amount = 25 + room * 2
        storage.set(min(1_000_000, totalXP + amount),
                    forKey: "outpostPlayerMasteryXP")
        return amount
    }
}

/// Frost Rounds offer control, not extra damage. Normal foes remain mobile;
/// even a fully ranked Frost shot is only a moderate temporary slowdown.
/// The Forest Guardian is immune to slows to preserve its telegraphed phases.
enum FrostRoundsRules {
    static func speedMultiplier(rank: Int) -> Double {
        switch rank {
        case 1: return 0.78
        case 2: return 0.69
        case 3...: return 0.58
        default: return 1
        }
    }
    static func duration(rank: Int) -> TimeInterval {
        rank > 0 ? 0.85 + TimeInterval(min(3, rank)) * 0.35 : 0
    }
}
