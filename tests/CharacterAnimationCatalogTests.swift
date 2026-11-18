import Foundation
@main struct CharacterAnimationCatalogTests {
    static func main() {
        typealias C = CharacterAnimationCatalog
        typealias M = EnemyAnimationRules.Motion
        let uploaded = C.profiles.filter { $0.name != "mossbot" }
        precondition(uploaded.reduce(0) { $0+$1.requiredFiles.count } == 400)
        precondition(Set(uploaded.flatMap { $0.requiredFiles }).count == 400)
        precondition(C.commander(-1)==nil && C.commander(4)==nil)
        precondition(C.enemy(world: 1,type: 0)==nil && C.enemy(world: 0,type: 6)==nil)
        for (i,name) in ["mossbot","barkguard","thornrunner","stoneback","sporecaster","rotbomber"].enumerated() {
            precondition(C.enemy(world: 0,type: i)==name)
        }
        for (i,name) in ["vanguard","specter","bulwark","volt"].enumerated() { precondition(C.commander(i)==name) }
        for p in C.profiles {
            for motion in M.allCases {
                let names=p.frameNames(motion)
                precondition(!names.isEmpty && Set(names).count==names.count)
                precondition(names.first!.hasSuffix("_00"))
                precondition(p.canvasSide(motion)>0 && p.registeredGround(motion)<=Double(p.pixels))
            }
            precondition(!p.quarantine.contains(p.sequence(.idle)) && !p.quarantine.contains(p.sequence(.move)))
        }
        let moss=C.profile("mossbot")!
        precondition(moss.requiredFiles.count==40 && moss.canvasSide(.idle)==68 && moss.footY==14)
        for motion in M.allCases { precondition(moss.frameNames(motion).count==motion.expectedFrames) }
        let specter=C.profile("specter")!
        precondition(specter.pixels==512 && specter.frameNames(.attack).count==12 && specter.frameNames(.hit).count==8)
        precondition(specter.quarantine.isEmpty && specter.sequences["victory"]==nil)
        let bark=C.profile("barkguard")!
        precondition(bark.frameNames(.attack,variant: 0).count==10 && bark.frameNames(.attack,variant: 1).count==10)
        precondition(bark.frameNames(.attack,variant: 0) != bark.frameNames(.attack,variant: 1))
        precondition(bark.frameNames(.hit).count==6 && bark.frameNames(.defeat).count==6)
        let rot=C.profile("rotbomber")!
        // The same visible body height and foot point survive its differently
        // registered attack export; no per-frame bounds resizing/body pumping.
        precondition(abs(rot.canvasSide(.idle)*420/512-48)<0.001)
        precondition(abs(rot.canvasSide(.attack)*265/512-48)<0.001)
        precondition(rot.registeredGround(.attack)==388 && rot.quarantine==["hit","defeat"])
        let quarantined=uploaded.reduce(0) { sum,p in sum+p.quarantine.reduce(0) { $0+(p.sequences[$1] ?? 0) } }
        precondition(quarantined==44)
        print("400 unique resources, 9 exact profiles, role/commander maps, 44 quarantined frames, Mossbot compatibility and stable registration passed")
    }
}
