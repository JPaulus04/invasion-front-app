import Foundation

enum WorldTwoCampaign {
    static let world = 1
    static let bosses = [10: "corrosionravager", 20: "blighthydra", 30: "toxictyrant"]
    static let bossNames = [10: "CORROSION RAVAGER", 20: "BLIGHT HYDRA", 30: "TOXIC TYRANT"]
    static let regulars = [0: "causticcrawler", 2: "toxicstalker", 3: "toxicbrute",
                           4: "toxindrone", 5: "venomspitter"]

    struct Manifest: Decodable {
        struct Sequence: Decodable {
            let fps: Double
            let loop: Bool
            let frames: [String]
            let frame_durations_ms: [Double]?
            var duration: TimeInterval { frame_durations_ms.map { $0.reduce(0, +) / 1000 } ?? Double(frames.count) / fps }
        }
        let pixels: Int
        let art_pivot_px: [Double]
        let idle_height_px: Double
        let states: [String: Sequence]
        let effects: [String: Sequence]?
        private enum CodingKeys: String, CodingKey { case pixels, art_pivot_px, idle_height_px, states, effects }
        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            pixels = try container.decode(Int.self, forKey: .pixels)
            art_pivot_px = try container.decode([Double].self, forKey: .art_pivot_px)
            idle_height_px = try container.decode(Double.self, forKey: .idle_height_px)
            states = try container.decode([String: Sequence].self, forKey: .states)
            effects = try? container.decode([String: Sequence].self, forKey: .effects)
        }
        func sequence(_ name: String) -> Sequence? { states[name] ?? effects?[name] }
    }

    static let folder = "enemies/world2"

    static func frameName(_ path: String) -> String {
        let filename = URL(fileURLWithPath: path).deletingPathExtension().lastPathComponent
        return filename
    }

    static let manifests: [String: Manifest] = {
        let names = Array(bosses.values) + Array(regulars.values)
        return names.reduce(into: [:]) { result, name in
            guard let url = Bundle.main.url(forResource: name + ".manifest",
                                            withExtension: "json", subdirectory: folder),
                  let data = try? Data(contentsOf: url),
                  let manifest = try? JSONDecoder().decode(Manifest.self, from: data),
                  manifest.pixels > 0, manifest.art_pivot_px.count == 2,
                  manifest.idle_height_px > 0 else { return }
            result[name] = manifest
        }
    }()
}

/// Display indices are deliberately independent of the persisted faction IDs.
enum FrontierFactionArt {
    static let frostBosses = [10: "permafrostcrusher", 20: "frostwyrm", 30: "cryooverlord"]
    static let ironBosses = [10: "press_giant", 20: "gantry_warden", 30: "warforge"]
    static let frostRegulars = [0: "frostfang", 2: "shardstinger", 3: "glacierbrute", 4: "cryogunner", 5: "blizzarddrone"]
    static let ironRegulars = [0: "grunt", 1: "rail_skater", 2: "raider", 3: "bulkhead", 4: "sentry", 5: "lobber"]
    static let chargeTravel: [String: CGFloat] = ["grunt": 74, "rail_skater": 116]
    static let speedScale: [String: CGFloat] = ["rail_skater": 1.18, "scrapper": 0.82, "overclock": 1.28]

    static func character(world: Int, room: Int, type: Int, slot: Int, boss: Bool) -> String? {
        if world == WorldCatalog.frostIndex { return boss ? frostBosses[room] : frostRegulars[type] }
        guard world == WorldCatalog.ironIndex else { return nil }
        if boss { return ironBosses[room] }
        if room >= 21 && type == 3 && slot.isMultiple(of: 3) { return "overclock" }
        if type == 2 && slot.isMultiple(of: 2) { return "rail_skater" }
        if type == 0 && room >= 6 && slot.isMultiple(of: 3) { return "scrapper" }
        return ironRegulars[type]
    }
    static func activeFrame(character: String, sequence: String) -> Int {
        if ironNames.contains(character) { return character == "rail_skater" ? 3 : 4 }
        switch character {
        case "frostwyrm": return sequence == "attack" ? 5 : 3
        case "cryooverlord", "cryogunner": return 3
        case "permafrostcrusher": return sequence == "charge" ? 2 : 6
        case "frostfang", "shardstinger": return 7
        case "glacierbrute": return 6
        case "blizzarddrone": return 8
        default: return 4
        }
    }
    static func emissionFrames(character: String, sequence: String) -> [Int] {
        if character == "cryogunner" { return [3, 7] }
        if character == "cryooverlord" && sequence == "attack" { return [3, 6] }
        if character == "sentry" { return [4, 5, 6] }
        return [activeFrame(character: character, sequence: sequence)]
    }
    static func groundAttack(character: String, sequence: String) -> Bool {
        switch character {
        case "press_giant", "gantry_warden", "permafrostcrusher", "blizzarddrone": return true
        case "frostwyrm": return sequence == "tail_sweep"
        case "cryooverlord": return sequence != "attack"
        case "warforge": return sequence != "attack_2"
        default: return false
        }
    }
    static func frameTime(_ frame: Int, state: WorldTwoCampaign.Manifest.Sequence) -> TimeInterval {
        let active = max(0, min(frame, state.frames.count - 1))
        if let durations = state.frame_durations_ms { return durations.prefix(active).reduce(0, +) / 1000 }
        return Double(active) / state.fps
    }
    static func attackDelay(character: String, sequence: String, state: WorldTwoCampaign.Manifest.Sequence) -> TimeInterval {
        frameTime(activeFrame(character: character, sequence: sequence), state: state)
    }
    static func bossName(world: Int, room: Int) -> String? {
        guard let name = character(world: world, room: room, type: 1, slot: 0, boss: true) else { return nil }
        return ["permafrostcrusher": "PERMAFROST CRUSHER", "frostwyrm": "FROST WYRM", "cryooverlord": "CRYO OVERLORD"][name] ?? name.replacingOccurrences(of: "_", with: " ").uppercased()
    }
    static let frostNames = Set(frostRegulars.values).union(frostBosses.values)
    static let ironNames = Set(ironRegulars.values).union(ironBosses.values).union(["scrapper", "overclock"])
    static func folder(_ name: String) -> String? {
        if frostNames.contains(name) { return "enemies/world3/" + name }
        if ironNames.contains(name) { return "enemies/world4" }
        return nil
    }
    static let manifests: [String: WorldTwoCampaign.Manifest] = {
        (frostNames.union(ironNames)).reduce(into: [:]) { result, name in
            guard let folder = folder(name),
                  let url = Bundle.main.url(forResource: frostNames.contains(name) ? "manifest" : name + ".manifest", withExtension: "json", subdirectory: folder),
                  let data = try? Data(contentsOf: url),
                  let manifest = try? JSONDecoder().decode(WorldTwoCampaign.Manifest.self, from: data),
                  manifest.pixels == 512, manifest.art_pivot_px.count == 2, manifest.idle_height_px > 0 else { return }
            result[name] = manifest
        }
    }()
    static func manifest(_ name: String) -> WorldTwoCampaign.Manifest? {
        manifests[name] ?? WorldTwoCampaign.manifests[name]
    }
}
