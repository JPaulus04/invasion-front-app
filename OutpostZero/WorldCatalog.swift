import Foundation

/// Twenty destinations arranged into five regions. The first four worlds are
/// playable in this milestone; later world cards remain visible but unreleased.
struct WorldInfo {
    let title: String
    let region: String
    let boss: String
    let brief: String
    let biome: Int
    let bossStyle: Int
    let bossHealth: Int
    let enemyHealthBonus: Int
}

enum WorldCatalog {
    static let worlds: [WorldInfo] = [
        WorldInfo(title: "FRONTIER FOREST", region: "FRONTIER", boss: "ROOT LORD",
                  brief: "Learn the movement and combat basics", biome: 0, bossStyle: 0, bossHealth: 180, enemyHealthBonus: 0),
        WorldInfo(title: "TOXIC CROSSING", region: "FRONTIER", boss: "TOXIC MATRIARCH",
                  brief: "Poisoned ruins: dodge acid volleys and mutant swarms", biome: 2, bossStyle: 2, bossHealth: 235, enemyHealthBonus: 1),
        WorldInfo(title: "IRON WASTES", region: "FRONTIER", boss: "WARFORGE",
                  brief: "Industrial stronghold: read volleys and dodge machines", biome: 1, bossStyle: 1, bossHealth: 275, enemyHealthBonus: 2),
        WorldInfo(title: "FROST EXPANSE", region: "FRONTIER", boss: "FROST WRAITH",
                  brief: "Frozen frontier: find safe lanes between ice volleys", biome: 4, bossStyle: 3, bossHealth: 300, enemyHealthBonus: 3),
        WorldInfo(title: "ASHEN APPROACH", region: "ASHEN WASTES", boss: "ASH STALKER",
                  brief: "Future world", biome: 3, bossStyle: 0, bossHealth: 330, enemyHealthBonus: 4),
        WorldInfo(title: "FURNACE CHANNEL", region: "ASHEN WASTES", boss: "FURNACE CORE",
                  brief: "Future world", biome: 3, bossStyle: 0, bossHealth: 355, enemyHealthBonus: 5),
        WorldInfo(title: "MOLTEN QUARRY", region: "ASHEN WASTES", boss: "QUARRY TITAN",
                  brief: "Future world", biome: 3, bossStyle: 0, bossHealth: 380, enemyHealthBonus: 6),
        WorldInfo(title: "ASHEN CITADEL", region: "ASHEN WASTES", boss: "ASH COMMANDER",
                  brief: "Future world", biome: 3, bossStyle: 0, bossHealth: 405, enemyHealthBonus: 7),
        WorldInfo(title: "FROZEN PASS", region: "FROZEN RIDGE", boss: "FROST WARDEN",
                  brief: "Future world", biome: 4, bossStyle: 0, bossHealth: 430, enemyHealthBonus: 8),
        WorldInfo(title: "ICEBOUND RELAY", region: "FROZEN RIDGE", boss: "RELAY SENTINEL",
                  brief: "Future world", biome: 4, bossStyle: 0, bossHealth: 455, enemyHealthBonus: 9),
        WorldInfo(title: "GLACIAL TRENCH", region: "FROZEN RIDGE", boss: "ICE COLOSSUS",
                  brief: "Future world", biome: 4, bossStyle: 0, bossHealth: 480, enemyHealthBonus: 10),
        WorldInfo(title: "FROZEN CITADEL", region: "FROZEN RIDGE", boss: "FROZEN OVERSEER",
                  brief: "Future world", biome: 4, bossStyle: 0, bossHealth: 505, enemyHealthBonus: 11),
        WorldInfo(title: "NEON THRESHOLD", region: "NEON CITADEL", boss: "GRID HUNTER",
                  brief: "Future world", biome: 5, bossStyle: 0, bossHealth: 530, enemyHealthBonus: 12),
        WorldInfo(title: "DRONE DISTRICT", region: "NEON CITADEL", boss: "SWARM DIRECTOR",
                  brief: "Future world", biome: 5, bossStyle: 0, bossHealth: 555, enemyHealthBonus: 13),
        WorldInfo(title: "REACTOR GRID", region: "NEON CITADEL", boss: "REACTOR GUARD",
                  brief: "Future world", biome: 5, bossStyle: 0, bossHealth: 580, enemyHealthBonus: 14),
        WorldInfo(title: "NEON CITADEL", region: "NEON CITADEL", boss: "CITADEL CORE",
                  brief: "Future world", biome: 5, bossStyle: 0, bossHealth: 605, enemyHealthBonus: 15),
        WorldInfo(title: "VOID LANDING", region: "VOID FRONTIER", boss: "VOID SENTINEL",
                  brief: "Future world", biome: 6, bossStyle: 0, bossHealth: 630, enemyHealthBonus: 16),
        WorldInfo(title: "FRACTURE FIELDS", region: "VOID FRONTIER", boss: "RIFT HUNTER",
                  brief: "Future world", biome: 6, bossStyle: 0, bossHealth: 655, enemyHealthBonus: 17),
        WorldInfo(title: "RIFT CORRIDOR", region: "VOID FRONTIER", boss: "FRACTURE TITAN",
                  brief: "Future world", biome: 6, bossStyle: 0, bossHealth: 680, enemyHealthBonus: 18),
        WorldInfo(title: "VOID FRONTIER", region: "VOID FRONTIER", boss: "VOID COMMANDER",
                  brief: "Future world", biome: 6, bossStyle: 0, bossHealth: 720, enemyHealthBonus: 20)
    ]

    static let playableCount = 4
    static func info(_ index: Int) -> WorldInfo { worlds[max(0, min(worlds.count - 1, index))] }

    private static func starsKey(_ index: Int) -> String { "outpostZero.world.\(index).stars" }
    private static func clearKey(_ index: Int) -> String { "outpostZero.world.\(index).complete" }
    private static func bestRoomKey(_ index: Int) -> String { "outpostZero.world.\(index).bestRoom" }

    /// Personal best is world-specific; older players keep their World 1
    /// "bestWave" record. World 2 cannot inherit that previous result.
    static func bestRoom(_ index: Int, storage: UserDefaults = .standard) -> Int {
        guard worlds.indices.contains(index) else { return 0 }
        let value = storage.integer(forKey: bestRoomKey(index))
        let legacy = index == 0 ? storage.integer(forKey: "bestWave") : 0
        return min(20, max(0, max(value, legacy)))
    }

    /// Record defeat/attempt progress, retaining the highest room reached.
    @discardableResult
    static func recordBestRoom(_ index: Int, room: Int,
                               storage: UserDefaults = .standard) -> Int {
        guard worlds.indices.contains(index), (1...20).contains(room) else {
            return bestRoom(index, storage: storage)
        }
        let best = max(bestRoom(index, storage: storage), room)
        storage.set(best, forKey: bestRoomKey(index))
        if index == 0 { storage.set(best, forKey: "bestWave") }
        return best
    }

    static func stars(_ index: Int, storage: UserDefaults = .standard) -> Int {
        let saved = storage.integer(forKey: starsKey(index))
        let legacy = index == 0 ? storage.integer(forKey: "frontierForestStars") : 0
        return min(3, max(0, max(saved, legacy)))
    }

    static func completed(_ index: Int, storage: UserDefaults = .standard) -> Bool {
        let legacy = index == 0 && storage.bool(forKey: "frontierForestComplete")
        return legacy || storage.bool(forKey: clearKey(index))
    }

    static func unlocked(_ index: Int, storage: UserDefaults = .standard) -> Bool {
        guard (0..<playableCount).contains(index) else { return false }
        return index == 0 || completed(index - 1, storage: storage) || stars(index - 1, storage: storage) >= 1
    }

    /// Award incremental stars only. Existing World 1 saves retain the
    /// original keys so previously earned cores cannot be claimed again.
    @discardableResult
    static func recordVictory(_ index: Int, stars earned: Int,
                              storage: UserDefaults = .standard) -> Int {
        guard (0..<playableCount).contains(index),
              unlocked(index, storage: storage) else { return 0 }
        let prior = stars(index, storage: storage)
        let newBest = WorldCoreRewards.bestStars(previousBest: prior, completedStars: earned)
        let additional = WorldCoreRewards.newlyEarned(previousBest: prior, completedStars: earned)
        storage.set(newBest, forKey: starsKey(index))
        storage.set(true, forKey: clearKey(index))
        if index == 0 {
            storage.set(newBest, forKey: "frontierForestStars")
            storage.set(true, forKey: "frontierForestComplete")
            storage.set(true, forKey: "frontierForestCoreClaimed")
        }
        return additional
    }

    static func enemyType(world: Int, room: Int, roll: Int) -> Int {
        if room == 20 { return 1 }
        if world == 0 { return CombatRules.enemyType(room: room, roll: roll) }
        if world == 1 {
            if room >= 9 && roll < 17 { return 5 }
            if room >= 4 && roll < min(48, 23 + room) { return 4 }
            if room >= 10 && roll >= 82 { return 3 }
            return roll >= 58 ? 2 : 0
        }
        if room >= 7 && roll < min(30, 15 + room) { return 5 }
        if room >= 5 && roll < min(52, 22 + room) { return 4 }
        if room >= 4 && roll >= 72 { return 3 }
        return roll >= 60 ? 2 : 0
    }
}
