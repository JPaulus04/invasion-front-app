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
        TacticalDraftRules.playablePool(for: self, capacity: capacity, ranks: [
            "chain": chain, "explosive": explosive, "incendiary": incendiary,
            "orbit": orbit, "frost": frost
        ])
    }
}

enum TacticalRarity: Int {
    case common = 0, rare, epic, legendary
}

/// Fixed-rarity design pool. Only the five implemented tactical abilities
/// can appear in live draws; other entries are future design hooks.
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
            case "mobility": return 11
            case "supplies": return 6
            case "rate": return 12
            case "armor": return 14
            case "heal": return 10
            default: return 0
            }
        }
    }
    static let baseStatChoices = ["armor", "damage", "supplies"]

    /// An evolution is a late-game reward, not a free fourth tactical slot.
    /// All prerequisites must be met before it may replace the base effect.
    static func canEvolve(_ id: String, rank: Int, masteryLevel: Int,
                          world: Int, synergyRank: Int) -> Bool {
        guard rank >= 3, masteryLevel >= 20, world >= 3,
              synergyRank >= 2 else { return false }
        switch id {
        case "orbit", "chain", "explosive", "incendiary", "frost":
            return true
        default:
            return false
        }
    }

    /// Present a distinct evolution choice only after all prerequisites are
    /// satisfied. This does not silently change the combat effect or grant a
    /// free upgrade when a rank milestone is crossed.
    static func evolutionLabel(for id: String) -> String? {
        switch id {
        case "orbit": return "Energy Wheel"
        case "chain": return "Storm Network"
        case "explosive": return "Cluster Barrage"
        case "incendiary": return "Inferno Rounds"
        case "frost": return "Glacial Rounds"
        default: return nil
        }
    }

    /// Evolutions require a separate in-run choice; reaching the
    /// prerequisites alone never activates an evolved combat effect.
    static func evolutionChoices(for loadout: AbilityLoadout,
                                 ranks: [String: Int],
                                 masteryLevel: Int, world: Int,
                                 synergyRanks: [String: Int],
                                 alreadyEvolved: Set<String>) -> [String] {
        loadout.selected.filter { id in
            !alreadyEvolved.contains(id) &&
            canEvolve(id, rank: ranks[id] ?? 0,
                      masteryLevel: masteryLevel, world: world,
                      synergyRank: synergyRanks[id] ?? 0)
        }
    }


    /// Only implemented abilities are eligible for a live tactical draft.
    /// Design-only entries in futureCatalog must never enter playable rolls.
    static func playablePool(for loadout: AbilityLoadout, capacity: Int,
                             ranks: [String: Int]) -> [String] {
        let slots = min(AbilityLoadout.maximumSlots, max(0, capacity))
        return AbilityLoadout.catalog.filter { id in
            let rank = max(0, ranks[id] ?? 0)
            return rank < 3 && (loadout.contains(id) || loadout.selected.count < slots)
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
