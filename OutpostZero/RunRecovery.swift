import Foundation

/// Recoverable between-room state. Active enemies, projectiles and pickup
/// positions are deliberately reconstructed from the current room's beginning.
struct RunSnapshot: Codable {
    enum Location: String, Codable { case battle, clearedGate }
    static let schema = 2

    let version: Int
    let room: Int
    let location: Location
    let health: Int
    let coins: Int
    let damage: Int
    let fireRate: Int
    let chainLevel: Int
    let explosiveLevel: Int
    let incendiaryLevel: Int
    let orbitLevel: Int
    let runArmor: Int
    let checkpointUsed: Bool
    let progress: RunProgress
    let abilities: [String]
    let earnedSalvage: Int
    /// Salvage already earned in this room (including any prior recovery).
    /// A restarted room must not pay these rewards twice.
    let roomSalvageCredit: Int
    let roomCoinCredit: Int
    let roomXPCredit: Int

    var isValid: Bool {
        version == Self.schema && (1...20).contains(room) &&
        health > 0 && health <= 1_500 && coins >= 0 && coins <= 1_000_000 &&
        (1...100).contains(damage) && (1...5).contains(fireRate) &&
        (0...3).contains(chainLevel) && (0...3).contains(explosiveLevel) &&
        (0...3).contains(incendiaryLevel) && (0...3).contains(orbitLevel) &&
        (0...1_000).contains(runArmor) && (1...100).contains(progress.level) &&
        progress.xp >= 0 && progress.xp < progress.nextLevelXP &&
        (0...50).contains(progress.pendingChoices) &&
        earnedSalvage >= 0 && roomSalvageCredit >= 0 &&
        roomCoinCredit >= 0 && roomXPCredit >= 0 &&
        AbilityLoadout(selected: abilities).isReady && Set(abilities).count == 3
    }
}

final class RunRecoveryStore {
    /// Amount payable after replaying a partially completed room. This
    /// prevents force-quitting from duplicating XP, coins or Salvage.
    static func incrementalReward(earnedOnReplay: Int, previouslyCredited: Int, reward: Int) -> Int {
        let previous = max(0, earnedOnReplay - previouslyCredited)
        let updated = max(0, earnedOnReplay + max(0, reward) - previouslyCredited)
        return max(0, updated - previous)
    }

    private let storage: UserDefaults
    private let key = "outpostZeroRunSnapshotV1"
    init(storage: UserDefaults = .standard) { self.storage = storage }

    func load() -> RunSnapshot? {
        guard let data = storage.data(forKey: key) else { return nil }
        guard let value = try? JSONDecoder().decode(RunSnapshot.self, from: data),
              value.isValid else {
            clear()
            return nil
        }
        return value
    }

    @discardableResult
    func save(_ snapshot: RunSnapshot) -> Bool {
        guard snapshot.isValid, let data = try? JSONEncoder().encode(snapshot) else { return false }
        storage.set(data, forKey: key)
        return true
    }

    func clear() { storage.removeObject(forKey: key) }
}
