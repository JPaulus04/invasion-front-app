import Foundation

/// Presentation policy only. No combat clocks, damage or movement live here.
enum EnemyAnimationRules {
    enum Motion: String, CaseIterable {
        case idle, move, attack, hit, defeat
        var expectedFrames: Int {
            switch self {
            case .idle, .move, .defeat: return 8
            case .attack: return 10
            case .hit: return 6
            }
        }
        var framesPerSecond: Double {
            switch self {
            case .idle: return 8
            case .move, .defeat: return 12
            case .attack, .hit: return 15
            }
        }
        var repeats: Bool { self == .idle || self == .move }
        var duration: TimeInterval { Double(expectedFrames) / framesPerSecond }
    }

    static func canTransition(from current: Motion?, to next: Motion) -> Bool {
        guard current != .defeat, current != next else { return false }
        if next == .defeat || next == .hit { return true }
        if current == .hit || current == .attack { return false }
        return true
    }
}
