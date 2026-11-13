import Foundation

@main
struct QAReplayTests {
    static func main() throws {
        var rng = GameplayRandom(seed: 0)
        precondition(rng.next() == 0xe220a8397b1dcdaf)
        precondition(rng.next() == 0x6e789e6aa1b965f4)
        precondition(rng.next() == 0x06c45d188009454f)
        var a = GameplayRandom(seed: 335), b = GameplayRandom(seed: 335)
        var other = GameplayRandom(seed: 336)
        var differs = false
        for _ in 0..<1000 {
            let x = a.next()
            precondition(x == b.next(), "Same seed must replay")
            differs = differs || x != other.next()
        }
        precondition(differs)
        // Normal play cannot be seeded just by injecting a seed flag.
        let normal = try QAReplayConfiguration.parse(["app", "-qaSeed", "335"])
        precondition(normal == nil)
        for args in [["-qaMovingRun"], ["-qaMovingRun", "-qaSeed", "-1", "-qaTicksPerRender", "2"],
                     ["-qaMovingRun", "-qaStationaryRun", "-qaSeed", "335", "-qaTicksPerRender", "2"]] {
            do { _ = try QAReplayConfiguration.parse(args); preconditionFailure("Invalid QA flags accepted") }
            catch { }
        }
        let config = try QAReplayConfiguration.parse(["-qaMovingRun", "-qaSeed", "335", "-qaTicksPerRender", "2"])!
        let replay = QAReplay(config)
        for tick in 1...120 { precondition(replay.nextTime() == Double(tick) / 60) }
        precondition(replay.tick == 120)
        print("PASS: stable RNG vectors, seed isolation, fail-closed QA config and fixed tick clock")
    }
}
