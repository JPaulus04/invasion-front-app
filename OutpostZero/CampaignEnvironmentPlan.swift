import Foundation

struct CampaignEnvironmentPlan {
    enum Biome: Int, CaseIterable { case toxic = 1, iron, frost }
    enum Layout: Int, CaseIterable { case banks, crossing, shelves, switchback, yard, approach }
    enum Landmark { case regular, firstArena, secondArena, refuge, finalArena }
    enum Surface { case liquid, cover }

    struct Feature {
        let surface: Surface
        let x: CGFloat
        let y: CGFloat
        let width: CGFloat
        let height: CGFloat

        func frame(in bounds: CGRect) -> CGRect {
            CGRect(x: bounds.minX + bounds.width * (x - width / 2),
                   y: bounds.minY + bounds.height * (y - height / 2),
                   width: bounds.width * width, height: bounds.height * height)
        }
    }

    let biome: Biome
    let wave: Int
    let layout: Layout
    let landmark: Landmark

    // Introduce each motif in isolation, revisit it in different company,
    // then concentrate the industrial or glacial silhouettes near the boss.
    private static let progression: [Layout] = [
        .banks, .crossing, .banks, .shelves, .crossing,
        .switchback, .shelves, .yard, .switchback, .crossing,
        .shelves, .yard, .banks, .switchback, .shelves,
        .approach, .yard, .crossing, .approach, .yard,
        .switchback, .shelves, .approach, .yard, .switchback,
        .approach, .shelves, .approach, .banks, .yard
    ]

    init?(world: Int, wave: Int) {
        guard let biome = Biome(rawValue: world), (1...30).contains(wave) else { return nil }
        self.biome = biome
        self.wave = wave
        layout = Self.progression[wave - 1]
        switch wave {
        case 10: landmark = .firstArena
        case 20: landmark = .secondArena
        case 29: landmark = .refuge
        case 30: landmark = .finalArena
        default: landmark = .regular
        }
    }

    var development: CGFloat { CGFloat(wave - 1) / 29 }
    var mirrored: Bool { (wave + biome.rawValue).isMultiple(of: 2) }
    var hasEncounterHazard: Bool {
        switch wave {
        case 1, 5, 8, 10, 13, 15, 17, 19, 20, 22, 24, 25, 26, 28, 30: return true
        default: return false
        }
    }

    func point(_ x: CGFloat, _ y: CGFloat, in bounds: CGRect) -> CGPoint {
        CGPoint(x: bounds.minX + x * bounds.width, y: bounds.minY + y * bounds.height)
    }

    func detail(_ index: Int, channel: Int) -> CGFloat {
        let roomSeed = wave * 47 + biome.rawValue * 89 + channel * 71
        let linear = index * (137 + 52 * channel)
        let quadratic = index * index * (53 + 18 * channel)
        return CGFloat((roomSeed + linear + quadratic) % 997) / 997
    }

    var features: [Feature] {
        var positions: [(CGFloat, CGFloat)] = []
        switch layout {
        case .banks: positions = [(0.16, 0.51), (0.80, 0.28), (0.82, 0.76)]
        case .crossing: positions = [(0.17, 0.62), (0.84, 0.58), (0.19, 0.30)]
        case .shelves: positions = [(0.15, 0.69), (0.78, 0.41), (0.18, 0.24)]
        case .switchback: positions = [(0.21, 0.43), (0.82, 0.67), (0.18, 0.75)]
        case .yard: positions = [(0.15, 0.37), (0.84, 0.75), (0.77, 0.30)]
        case .approach: positions = [(0.15, 0.70), (0.88, 0.48), (0.20, 0.32)]
        }
        switch landmark {
        case .firstArena: positions = [(0.14, 0.61), (0.86, 0.61), (0.20, 0.31)]
        case .secondArena: positions = [(0.16, 0.35), (0.84, 0.70), (0.23, 0.71)]
        case .finalArena: positions = [(0.14, 0.68), (0.86, 0.68), (0.21, 0.33)]
        case .refuge: return []
        case .regular: break
        }
        func feature(_ surface: Surface, _ index: Int, _ w: CGFloat, _ h: CGFloat) -> Feature {
            let (x, y) = positions[index]
            let shift = landmark == .regular ? (detail(index, channel: 3) - 0.5) * 0.042 : 0
            return Feature(surface: surface, x: mirrored ? 1 - x : x, y: y + shift,
                           width: w, height: h)
        }
        switch biome {
        case .toxic:
            return [feature(.liquid, 0, 0.25, layout == .crossing ? 0.29 : 0.21),
                    feature(.liquid, 1, 0.19, 0.15), feature(.cover, 2, 0.21, 0.085)]
        case .iron:
            let cover = [feature(.cover, 0, 0.23, 0.085), feature(.cover, 1, 0.23, 0.085),
                         feature(.cover, 2, 0.20, 0.075)]
            return landmark == .finalArena ? Array(cover.prefix(2)) : cover
        case .frost:
            return [feature(.liquid, 0, 0.22, 0.24), feature(.liquid, 1, 0.18, 0.19),
                    feature(.cover, 2, 0.19, 0.095)]
        }
    }
}
