import Foundation

@main
enum CampaignEnvironmentTests {
    static func main() {
        let bounds = CGRect(x: 28, y: 70, width: 334, height: 540)
        precondition(CampaignEnvironmentPlan(world: 0, wave: 1) == nil)
        precondition(CampaignEnvironmentPlan(world: 1, wave: 0) == nil)
        precondition(CampaignEnvironmentPlan(world: 3, wave: 31) == nil)
        for biome in CampaignEnvironmentPlan.Biome.allCases {
            let plans = (1...30).map { CampaignEnvironmentPlan(world: biome.rawValue, wave: $0)! }
            precondition(Set(plans.map(\.layout)).count == 6)
            precondition(zip(plans, plans.dropFirst()).allSatisfy { $0.0.layout != $0.1.layout })
            precondition(plans[9].landmark == .firstArena && plans[19].landmark == .secondArena)
            precondition(plans[28].landmark == .refuge && plans[28].features.isEmpty &&
                         !plans[28].hasEncounterHazard)
            precondition(plans[29].landmark == .finalArena && plans[29].hasEncounterHazard)
            for plan in plans {
                for feature in plan.features {
                    let frame = feature.frame(in: bounds)
                    precondition(bounds.contains(frame), "Terrain outside room at \(biome) \(plan.wave)")
                    precondition(!frame.intersects(bounds.insetBy(dx: bounds.width * 0.38, dy: 0)),
                                 "Blocked central route at \(biome) \(plan.wave)")
                }
            }
        }
        let cover = TerrainHazards.Patch(kind: .rubble, frame: CGRect(x: 4, y: 2, width: 2, height: 6), outline: [])
        let water = TerrainHazards.Patch(kind: .water, frame: CGRect(x: 1, y: 2, width: 2, height: 6), outline: [])
        let patches = [water, cover]
        precondition(TerrainHazards.coverImpact(from: CGPoint(x: 0, y: 5),
            to: CGPoint(x: 10, y: 5), patches: patches) == CGPoint(x: 4, y: 5))
        precondition(TerrainHazards.coverImpact(from: CGPoint(x: 10, y: 5),
            to: CGPoint(x: 0, y: 5), patches: patches) == CGPoint(x: 6, y: 5))
        precondition(TerrainHazards.coverImpact(from: CGPoint(x: 3, y: 0),
            to: CGPoint(x: 3, y: 9), patches: patches) == nil)
        print("Campaign environment checks passed for all 90 waves")
    }
}
