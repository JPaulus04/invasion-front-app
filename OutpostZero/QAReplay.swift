import Foundation

/// Stable SplitMix64 stream. Normal games use SystemRandomNumberGenerator.
struct GameplayRandom: RandomNumberGenerator {
    private var state: UInt64?
    private var system = SystemRandomNumberGenerator()
    private(set) var draws: UInt64 = 0
    init(seed: UInt64?) { state = seed }
    mutating func next() -> UInt64 {
        draws &+= 1
        guard let current = state else { return system.next() }
        let next = current &+ 0x9E3779B97F4A7C15
        state = next
        var z = next
        z = (z ^ (z >> 30)) &* 0xBF58476D1CE4E5B9
        z = (z ^ (z >> 27)) &* 0x94D049BB133111EB
        return z ^ (z >> 31)
    }
}

struct QAReplayConfiguration {
    let seed: UInt64
    let batch: Int
    let profile: String
    static let hz = 60
    enum Invalid: Error { case arguments }
    static func parse(_ args: [String]) throws -> QAReplayConfiguration? {
        let stationary = args.contains("-qaStationaryRun")
        let moving = args.contains("-qaMovingRun")
        // A seed must never turn ordinary gameplay into deterministic QA.
        guard stationary || moving else { return nil }
        func value(_ flag: String) -> String? {
            guard args.filter({ $0 == flag }).count == 1,
                  let i = args.firstIndex(of: flag), i + 1 < args.count else { return nil }
            return args[i + 1]
        }
        guard stationary != moving, let raw = value("-qaSeed"),
              !raw.isEmpty, raw.allSatisfy({ $0.isASCII && $0.isNumber }),
              let seed = UInt64(raw), let b = value("-qaTicksPerRender"),
              let batch = Int(b), [2, 4].contains(batch) else { throw Invalid.arguments }
        return QAReplayConfiguration(seed: seed, batch: batch,
                                     profile: stationary ? "stationary" : "moving")
    }
}

/// Tick-indexed gameplay evidence; display cadence is deliberately not an input.
final class QAReplay {
    let configuration: QAReplayConfiguration
    private(set) var tick: UInt64 = 0
    private(set) var digest: UInt64 = 0xcbf29ce484222325
    init(_ configuration: QAReplayConfiguration) { self.configuration = configuration }
    func nextTime() -> TimeInterval {
        tick += 1
        return Double(tick) / Double(QAReplayConfiguration.hz)
    }
    static func number(_ value: Double) -> String {
        precondition(value.isFinite && abs(value) < 1e12, "Invalid replay state")
        return String(Int64((value * 1_000_000).rounded()))
    }
    func record(_ event: String) {
        let payload = "tick=\(tick) \(event)"
        for byte in (payload + "\n").utf8 { digest = (digest ^ UInt64(byte)) &* 0x100000001b3 }
        print("[QA REPLAY] \(payload) digest=\(String(digest, radix: 16))")
    }
    func header() {
        print("[QA CONFIG] protocol=1 seed=\(configuration.seed) hz=60 batch=\(configuration.batch) profile=\(configuration.profile)")
    }
}
