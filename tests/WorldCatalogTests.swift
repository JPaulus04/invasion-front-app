import Foundation

@main
struct WorldCatalogTests {
    static func main() {
        precondition(WorldCatalog.worlds.count == 20)
        precondition(WorldCatalog.worlds.map(\.title).count == 20)
        precondition(Set(WorldCatalog.worlds.map(\.title)).count == 20)
        precondition(WorldCatalog.worlds[0].title == "FRONTIER FOREST")
        precondition(WorldCatalog.worlds[1].title == "FLOODED OUTPOST")
        precondition(WorldCatalog.worlds[2].title == "TOXIC CROSSING")
        precondition(WorldCatalog.worlds[19].region == "VOID FRONTIER")
        precondition(WorldCatalog.worlds.map(\.region).filter { $0 == "FRONTIER" }.count == 4)
        let suite = "outpost.zero.world.catalog.test"
        let store = UserDefaults(suiteName: suite)!
        store.removePersistentDomain(forName: suite)
        precondition(WorldCatalog.unlocked(0, storage: store))
        precondition(WorldCatalog.bestRoom(0, storage: store) == 0)
        precondition(WorldCatalog.recordBestRoom(0, room: 13, storage: store) == 13)
        precondition(WorldCatalog.recordBestRoom(0, room: 9, storage: store) == 13)
        precondition(store.integer(forKey: "bestWave") == 13)
        precondition(WorldCatalog.bestRoom(1, storage: store) == 0)
        precondition(WorldCatalog.recordBestRoom(1, room: 7, storage: store) == 7)
        precondition(WorldCatalog.recordBestRoom(1, room: 4, storage: store) == 7)
        precondition(WorldCatalog.bestRoom(0, storage: store) == 13)
        precondition(WorldCatalog.bestRoom(2, storage: store) == 0)
        precondition(WorldCatalog.recordBestRoom(2, room: 18, storage: store) == 18)
        precondition(WorldCatalog.recordBestRoom(2, room: 20, storage: store) == 20)
        precondition(WorldCatalog.bestRoom(2, storage: store) == 20)
        precondition(WorldCatalog.recordBestRoom(19, room: 21, storage: store) == 0)
        precondition(!WorldCatalog.unlocked(1, storage: store))
        precondition(!WorldCatalog.unlocked(2, storage: store))
        precondition(!WorldCatalog.unlocked(3, storage: store))
        precondition(WorldCatalog.recordVictory(1, stars: 3, storage: store) == 0)
        precondition(WorldCatalog.recordVictory(0, stars: 1, storage: store) == 1)
        precondition(WorldCatalog.completed(0, storage: store))
        precondition(WorldCatalog.unlocked(1, storage: store))
        precondition(WorldCatalog.recordVictory(0, stars: 1, storage: store) == 0)
        precondition(WorldCatalog.recordVictory(0, stars: 3, storage: store) == 2)
        precondition(WorldCatalog.recordVictory(0, stars: 3, storage: store) == 0)
        precondition(WorldCatalog.recordVictory(1, stars: 1, storage: store) == 1)
        precondition(WorldCatalog.unlocked(2, storage: store))
        precondition(WorldCatalog.recordVictory(2, stars: 2, storage: store) == 2)
        precondition(WorldCatalog.recordVictory(1, stars: 3, storage: store) == 2)
        precondition(WorldCatalog.recordVictory(2, stars: 3, storage: store) == 1)
        precondition(!WorldCatalog.unlocked(3, storage: store))
        precondition(WorldCatalog.recordVictory(3, stars: 3, storage: store) == 0)
        // Preserve historical completed-world rewards when older versions
        // used the original Frontier Forest keys.
        store.removePersistentDomain(forName: suite)
        store.set(true, forKey: "frontierForestComplete")
        store.set(2, forKey: "frontierForestStars")
        store.set(16, forKey: "bestWave")
        precondition(WorldCatalog.bestRoom(0, storage: store) == 16)
        precondition(WorldCatalog.bestRoom(1, storage: store) == 0)
        precondition(WorldCatalog.recordBestRoom(0, room: 14, storage: store) == 16)
        precondition(WorldCatalog.recordBestRoom(0, room: 19, storage: store) == 19)
        precondition(WorldCatalog.unlocked(1, storage: store))
        precondition(WorldCatalog.stars(0, storage: store) == 2)
        precondition(WorldCatalog.recordVictory(0, stars: 3, storage: store) == 1)
        precondition(WorldCatalog.recordVictory(0, stars: 3, storage: store) == 0)
        store.removePersistentDomain(forName: suite)
        // World 1 rules stay exactly the same. World 2 and 3 introduce
        // early but telegraphed shooters, lobbers and armored threats.
        for room in 1...20 {
            for roll in 0..<100 {
                precondition(WorldCatalog.enemyType(world: 0, room: room, roll: roll) ==
                             CombatRules.enemyType(room: room, roll: roll))
            }
        }
        precondition(WorldCatalog.enemyType(world: 1, room: 6, roll: 10) == 4)
        precondition(WorldCatalog.enemyType(world: 1, room: 9, roll: 10) == 5)
        precondition(WorldCatalog.enemyType(world: 2, room: 8, roll: 10) == 5)
        precondition(WorldCatalog.info(1).boss == "TIDAL WARDEN")
        precondition(WorldCatalog.info(2).boss == "TOXIC SENTINEL")
        precondition(WorldCatalog.info(1).bossStyle == 1)
        precondition(WorldCatalog.info(2).bossStyle == 2)
        print("Twenty-world roadmap, three playable unlocks, legacy progress and per-world core rewards passed")
    }
}
