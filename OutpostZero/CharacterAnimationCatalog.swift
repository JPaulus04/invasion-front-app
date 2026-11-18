import Foundation

/// Authored presentation data only. Gameplay identities/stats remain in their owners.
enum CharacterAnimationCatalog {
    typealias Motion = EnemyAnimationRules.Motion
    struct Profile {
        let name: String
        let folder: String
        let pixels: Int
        let ground: Double
        let idleHeight: Double
        let bodyHeight: Double
        let footY: Double
        let sequences: [String: Int]
        let quarantine: Set<String>

        func sequence(_ motion: Motion, variant: Int = 0) -> String {
            if motion == .move { return name == "mossbot" ? "move" : "run" }
            if motion == .attack {
                if name == "barkguard" { return variant.isMultiple(of: 2) ? "attack_combo" : "attack_slam" }
                if name == "rotbomber" { return "attack_lob" }
                if name == "thornrunner" { return "attack_slash" }
            }
            return motion.rawValue
        }
        func frameNames(sequence: String) -> [String] {
            (0..<(sequences[sequence] ?? 0)).map { String(format: "%@_%@_%02d",name,sequence,$0) }
        }
        func frameNames(_ motion: Motion, variant: Int = 0) -> [String] {
            frameNames(sequence: sequence(motion,variant: variant))
        }
        func registeredGround(_ motion: Motion) -> Double {
            name == "rotbomber" && motion == .attack ? 388 : ground
        }
        func canvasSide(_ motion: Motion) -> Double {
            let reference = name == "rotbomber" && motion == .attack ? 265 : idleHeight
            return Double(pixels)*bodyHeight/reference
        }
        var requiredFiles: [String] {
            sequences.keys.sorted().flatMap { frameNames(sequence: $0).map { folder+"/"+$0+".png" } }
        }
    }
    static let profiles: [Profile] = [
        .init(name:"mossbot",folder:"",pixels:512,ground:512,idleHeight:512,bodyHeight:68,footY:14,
              sequences:["idle":8,"move":8,"attack":10,"hit":6,"defeat":8],quarantine:[]),
        .init(name:"vanguard",folder:"commanders260",pixels:256,ground:232,idleHeight:205,bodyHeight:64,footY:-27,
              sequences:["idle":8,"run":8,"attack":8,"hit":4,"defeat":8,"victory":8],quarantine:[]),
        .init(name:"specter",folder:"commanders260",pixels:512,ground:465,idleHeight:380,bodyHeight:64,footY:-27,
              sequences:["idle":8,"run":8,"attack":12,"hit":8,"defeat":8],quarantine:[]),
        .init(name:"bulwark",folder:"commanders260",pixels:256,ground:236,idleHeight:212,bodyHeight:64,footY:-27,
              sequences:["idle":8,"run":8,"attack":8,"hit":4,"defeat":8,"victory":8],quarantine:[]),
        .init(name:"volt",folder:"commanders260",pixels:256,ground:242,idleHeight:226,bodyHeight:64,footY:-27,
              sequences:["idle":8,"run":8,"attack":8,"hit":4,"defeat":8,"victory":8],quarantine:[]),
        .init(name:"barkguard",folder:"enemies",pixels:512,ground:374,idleHeight:251,bodyHeight:64,footY:-17,
              sequences:["idle":8,"run":8,"attack_combo":10,"attack_slam":10,"hit":6,"defeat":6],quarantine:[]),
        .init(name:"thornrunner",folder:"enemies",pixels:512,ground:450,idleHeight:226,bodyHeight:48,footY:-13,
              sequences:["idle":8,"run":8,"attack_slash":12,"hit":8,"defeat":8],quarantine:[]),
        .init(name:"stoneback",folder:"enemies",pixels:512,ground:480,idleHeight:326,bodyHeight:72,footY:-20,
              sequences:["idle":8,"run":8,"attack":12,"hit":8,"defeat":8],quarantine:[]),
        .init(name:"sporecaster",folder:"enemies",pixels:512,ground:450,idleHeight:320,bodyHeight:46,footY:-11,
              sequences:["idle":8,"run":8,"attack":12,"hit":8,"defeat":8],quarantine:["attack","hit","defeat"]),
        .init(name:"rotbomber",folder:"enemies",pixels:512,ground:460,idleHeight:420,bodyHeight:48,footY:-11,
              sequences:["idle":8,"run":8,"attack_lob":12,"hit":8,"defeat":8],quarantine:["hit","defeat"])
    ]
    static func healthBarY(_ name: String) -> Double? {
        let positions: [String:Double] = ["mossbot": 47, "barkguard": 67, "thornrunner": 55, "stoneback": 79, "sporecaster": 45, "rotbomber": 51]
        return positions[name]
    }
    static func profile(_ name: String) -> Profile? { profiles.first { $0.name == name } }
    static func commander(_ index: Int) -> String? {
        let names=["vanguard","specter","bulwark","volt"]
        return names.indices.contains(index) ? names[index] : nil
    }
    static func enemy(world: Int, type: Int) -> String? {
        let names=["mossbot","barkguard","thornrunner","stoneback","sporecaster","rotbomber"]
        return world == 0 && names.indices.contains(type) ? names[type] : nil
    }
}
