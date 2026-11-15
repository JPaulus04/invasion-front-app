import Foundation

@main
struct EnemyAnimationRulesTests {
    static func main() {
        typealias M = EnemyAnimationRules.Motion
        precondition(M.allCases.reduce(0) { $0 + $1.expectedFrames } == 40)
        for m in [M.attack, .hit, .defeat] {
            precondition(!m.repeats && m.duration > 0)
            precondition(!EnemyAnimationRules.canTransition(from: m, to: .idle))
            precondition(!EnemyAnimationRules.canTransition(from: m, to: .move))
        }
        precondition(EnemyAnimationRules.canTransition(from: .attack, to: .hit))
        precondition(!EnemyAnimationRules.canTransition(from: .hit, to: .hit), "Rapid hits must not perpetually restart the reaction")
        precondition(!EnemyAnimationRules.canTransition(from: .hit, to: .attack))
        precondition(EnemyAnimationRules.canTransition(from: .hit, to: .defeat))
        for m in M.allCases {
            precondition(!EnemyAnimationRules.canTransition(from: .defeat, to: m))
            precondition(EnemyAnimationRules.canTransition(from: nil, to: m))
        }
        precondition(abs(M.defeat.duration - 2.0/3) < 0.0001)
        print("Animation priority, noninterruptible defeat, loop ownership and 40-frame timing passed")
    }
}
