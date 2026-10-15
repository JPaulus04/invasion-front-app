import Foundation

/// World-entry commitments: a primary rifle is always equipped; the player
/// can lock exactly three tactical abilities for the entire 20-room run.
/// An upgrade can never introduce an unequipped tactical skill mid-run.
struct AbilityLoadout {
    static let maximumSlots = 3
    static let catalog = ["chain", "explosive", "incendiary", "orbit"]
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

    @discardableResult
    mutating func toggle(_ ability: String) -> Bool {
        guard Self.catalog.contains(ability) else { return false }
        if let index = selected.firstIndex(of: ability) {
            selected.remove(at: index)
            return true
        }
        guard selected.count < Self.maximumSlots else { return false }
        selected.append(ability)
        return true
    }

    func availableTacticalUpgrades(chain: Int, explosive: Int,
                                   incendiary: Int, orbit: Int) -> [String] {
        selected.filter { ability in
            switch ability {
            case "chain": return chain < 3
            case "explosive": return explosive < 3
            case "incendiary": return incendiary < 3
            case "orbit": return orbit < 3
            default: return false
            }
        }
    }
}
