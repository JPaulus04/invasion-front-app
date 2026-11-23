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
            var duration: TimeInterval { Double(frames.count) / fps }
        }
        let pixels: Int
        let art_pivot_px: [Double]
        let idle_height_px: Double
        let states: [String: Sequence]
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
