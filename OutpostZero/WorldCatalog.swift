import Foundation

/// Twenty destinations arranged into five regions. The first four worlds are
/// playable in this milestone; later world cards remain visible but unreleased.
struct WorldInfo {
    // These IDs are the original on-disk keys and faction resource indices.
    let id: Int
    var roomCount: Int = 0
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
        WorldInfo(id: 0, roomCount: 20, title: "FRONTIER FOREST", region: "FRONTIER", boss: "ROOT LORD",
                  brief: "Learn the movement and combat basics", biome: 0, bossStyle: 0, bossHealth: 180, enemyHealthBonus: 0),
        WorldInfo(id: 1, roomCount: 30, title: "TOXIC CROSSING", region: "FRONTIER", boss: "TOXIC TYRANT",
                  brief: "Poisoned ruins: dodge acid volleys and mutant swarms", biome: 2, bossStyle: 2, bossHealth: 235, enemyHealthBonus: 1),
        WorldInfo(id: 3, roomCount: 30, title: "FROST EXPANSE", region: "FRONTIER", boss: "FROST WRAITH",
                  brief: "Frozen frontier: find safe lanes between ice volleys", biome: 4, bossStyle: 3, bossHealth: 300, enemyHealthBonus: 3),
        WorldInfo(id: 2, roomCount: 30, title: "IRON WASTES", region: "FRONTIER", boss: "WARFORGE",
                  brief: "Industrial stronghold: read volleys and dodge machines", biome: 1, bossStyle: 1, bossHealth: 275, enemyHealthBonus: 2),
        WorldInfo(id: 4, title: "ASHEN APPROACH", region: "ASHEN WASTES", boss: "ASH STALKER",
                  brief: "Future world", biome: 3, bossStyle: 0, bossHealth: 330, enemyHealthBonus: 4),
        WorldInfo(id: 5, title: "FURNACE CHANNEL", region: "ASHEN WASTES", boss: "FURNACE CORE",
                  brief: "Future world", biome: 3, bossStyle: 0, bossHealth: 355, enemyHealthBonus: 5),
        WorldInfo(id: 6, title: "MOLTEN QUARRY", region: "ASHEN WASTES", boss: "QUARRY TITAN",
                  brief: "Future world", biome: 3, bossStyle: 0, bossHealth: 380, enemyHealthBonus: 6),
        WorldInfo(id: 7, title: "ASHEN CITADEL", region: "ASHEN WASTES", boss: "ASH COMMANDER",
                  brief: "Future world", biome: 3, bossStyle: 0, bossHealth: 405, enemyHealthBonus: 7),
        WorldInfo(id: 8, title: "FROZEN PASS", region: "FROZEN RIDGE", boss: "FROST WARDEN",
                  brief: "Future world", biome: 4, bossStyle: 0, bossHealth: 430, enemyHealthBonus: 8),
        WorldInfo(id: 9, title: "ICEBOUND RELAY", region: "FROZEN RIDGE", boss: "RELAY SENTINEL",
                  brief: "Future world", biome: 4, bossStyle: 0, bossHealth: 455, enemyHealthBonus: 9),
        WorldInfo(id: 10, title: "GLACIAL TRENCH", region: "FROZEN RIDGE", boss: "ICE COLOSSUS",
                  brief: "Future world", biome: 4, bossStyle: 0, bossHealth: 480, enemyHealthBonus: 10),
        WorldInfo(id: 11, title: "FROZEN CITADEL", region: "FROZEN RIDGE", boss: "FROZEN OVERSEER",
                  brief: "Future world", biome: 4, bossStyle: 0, bossHealth: 505, enemyHealthBonus: 11),
        WorldInfo(id: 12, title: "NEON THRESHOLD", region: "NEON CITADEL", boss: "GRID HUNTER",
                  brief: "Future world", biome: 5, bossStyle: 0, bossHealth: 530, enemyHealthBonus: 12),
        WorldInfo(id: 13, title: "DRONE DISTRICT", region: "NEON CITADEL", boss: "SWARM DIRECTOR",
                  brief: "Future world", biome: 5, bossStyle: 0, bossHealth: 555, enemyHealthBonus: 13),
        WorldInfo(id: 14, title: "REACTOR GRID", region: "NEON CITADEL", boss: "REACTOR GUARD",
                  brief: "Future world", biome: 5, bossStyle: 0, bossHealth: 580, enemyHealthBonus: 14),
        WorldInfo(id: 15, title: "NEON CITADEL", region: "NEON CITADEL", boss: "CITADEL CORE",
                  brief: "Future world", biome: 5, bossStyle: 0, bossHealth: 605, enemyHealthBonus: 15),
        WorldInfo(id: 16, title: "VOID LANDING", region: "VOID FRONTIER", boss: "VOID SENTINEL",
                  brief: "Future world", biome: 6, bossStyle: 0, bossHealth: 630, enemyHealthBonus: 16),
        WorldInfo(id: 17, title: "FRACTURE FIELDS", region: "VOID FRONTIER", boss: "RIFT HUNTER",
                  brief: "Future world", biome: 6, bossStyle: 0, bossHealth: 655, enemyHealthBonus: 17),
        WorldInfo(id: 18, title: "RIFT CORRIDOR", region: "VOID FRONTIER", boss: "FRACTURE TITAN",
                  brief: "Future world", biome: 6, bossStyle: 0, bossHealth: 680, enemyHealthBonus: 18),
        WorldInfo(id: 19, title: "VOID FRONTIER", region: "VOID FRONTIER", boss: "VOID COMMANDER",
                  brief: "Future world", biome: 6, bossStyle: 0, bossHealth: 720, enemyHealthBonus: 20)
    ]

    static let playableCount = worlds.prefix { $0.roomCount > 0 }.count
    static let ironIndex = worlds.firstIndex { $0.id == 2 }!
    static let frostIndex = worlds.firstIndex { $0.id == 3 }!

    static func roomCount(_ world: Int) -> Int {
        worlds.indices.contains(world) ? worlds[world].roomCount : 0
    }

    static func index(forID id: Int) -> Int? { worlds.firstIndex { $0.id == id } }

    static func isFinalRoom(world: Int, room: Int) -> Bool {
        room > 0 && room == roomCount(world)
    }
    static func info(_ index: Int) -> WorldInfo { worlds[max(0, min(worlds.count - 1, index))] }

    private static func starsKey(_ index: Int) -> String { "outpostZero.world.\(worlds[index].id).stars" }
    private static func clearKey(_ index: Int) -> String { "outpostZero.world.\(worlds[index].id).complete" }
    private static func bestRoomKey(_ index: Int) -> String { "outpostZero.world.\(worlds[index].id).bestRoom" }

    /// Personal best is world-specific; older players keep their World 1
    /// "bestWave" record. World 2 cannot inherit that previous result.
    static func bestRoom(_ index: Int, storage: UserDefaults = .standard) -> Int {
        guard worlds.indices.contains(index) else { return 0 }
        let value = storage.integer(forKey: bestRoomKey(index))
        let legacy = index == 0 ? storage.integer(forKey: "bestWave") : 0
        return min(roomCount(index), max(0, max(value, legacy)))
    }

    /// Record defeat/attempt progress, retaining the highest room reached.
    @discardableResult
    static func recordBestRoom(_ index: Int, room: Int,
                               storage: UserDefaults = .standard) -> Int {
        guard worlds.indices.contains(index), room > 0, room <= roomCount(index) else {
            return bestRoom(index, storage: storage)
        }
        let best = max(bestRoom(index, storage: storage), room)
        storage.set(best, forKey: bestRoomKey(index))
        if index == 0 { storage.set(best, forKey: "bestWave") }
        return best
    }

    static func stars(_ index: Int, storage: UserDefaults = .standard) -> Int {
        guard worlds.indices.contains(index) else { return 0 }
        let saved = storage.integer(forKey: starsKey(index))
        let legacy = index == 0 ? storage.integer(forKey: "frontierForestStars") : 0
        return min(3, max(0, max(saved, legacy)))
    }

    static func completed(_ index: Int, storage: UserDefaults = .standard) -> Bool {
        guard worlds.indices.contains(index) else { return false }
        let legacy = index == 0 && storage.bool(forKey: "frontierForestComplete")
        return legacy || storage.bool(forKey: clearKey(index))
    }

    static func unlocked(_ index: Int, storage: UserDefaults = .standard) -> Bool {
        guard (0..<playableCount).contains(index) else { return false }
        // Build 340 put Iron Wastes first. A player who entered it keeps
        // access after the reorder, even if Frost Expanse is still unfinished.
        let previouslyPlayedIron = index == ironIndex &&
            (bestRoom(index, storage: storage) > 0 ||
             completed(index, storage: storage) || stars(index, storage: storage) > 0)
        return index == 0 || previouslyPlayedIron ||
            completed(index - 1, storage: storage) || stars(index - 1, storage: storage) > 0
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

    /// Diagnostic snapshot for the world-select UI and progression tests.
    /// A victory must persist before the next world can be offered.
    static func progressionState(_ index: Int, storage: UserDefaults = .standard) -> (completed: Bool, stars: Int, nextUnlocked: Bool) {
        let next = index + 1
        return (completed(index, storage: storage), stars(index, storage: storage),
                unlocked(next, storage: storage))
    }

    static func enemyType(world: Int, room: Int, roll: Int) -> Int {
        if isFinalRoom(world: world, room: room) { return 1 }
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
