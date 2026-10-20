import Foundation
import CoreGraphics

@main
struct CharacterMotionTests {
    static func main() {
        for direction in 0..<8 {
            let angle = CGFloat(direction) * .pi / 4
            precondition(CharacterMotion.pilotDirection(heading: angle) == direction)
            precondition(CharacterMotion.pilotDirection(heading: angle - 2 * .pi) == direction)
        }
        precondition(CharacterMotion.pilotDirection(heading: .pi / 8 + 0.02, previous: 0) == 0)
        precondition(CharacterMotion.pilotDirection(heading: .pi / 4, previous: 0) == 1)
        precondition(CharacterMotion.pilotDirection(heading: -.pi / 2) == 6)
        let idle = CharacterMotion.pilot(
            time: 0, moving: false, facing: 1, timeSinceShot: 2)
        let running = CharacterMotion.pilot(
            time: 0.17, moving: true, facing: 1, timeSinceShot: 2)
        let reversed = CharacterMotion.pilot(
            time: 0.17, moving: true, facing: -1, timeSinceShot: 2)
        let firing = CharacterMotion.pilot(
            time: 0.17, moving: true, facing: 1, timeSinceShot: 0)
        let settled = CharacterMotion.pilot(
            time: 0.17, moving: true, facing: 1, timeSinceShot: 0.2)
        precondition(idle.widthScale > 0 && reversed.widthScale < 0)
        precondition(running.widthScale > 0)
        precondition(running.heightScale > 0.9 && running.heightScale < 1.1)
        precondition(running.shadowScale < 1 && running.shadowScale > 0.8)
        precondition(abs(firing.verticalOffset - settled.verticalOffset) > 1)
        precondition(firing.heightScale > settled.heightScale)
        let heavy = CharacterMotion.enemy(time: 0.12, behavior: 3, phase: 0,
                                          moving: true, aiming: false)
        let raider = CharacterMotion.enemy(time: 0.12, behavior: 2, phase: 0,
                                           moving: true, aiming: false)
        precondition(abs(heavy.verticalOffset) < abs(raider.verticalOffset))
        let shooter = CharacterMotion.enemy(time: 0.12, behavior: 4, phase: 0,
                                            moving: false, aiming: true)
        let relaxed = CharacterMotion.enemy(time: 0.12, behavior: 4, phase: 0,
                                            moving: false, aiming: false)
        precondition(shooter.heightScale > relaxed.heightScale)
        for index in 0..<100 {
            let seconds = Double(index) / 30
            let pose = CharacterMotion.pilot(
                time: seconds, moving: index.isMultiple(of: 2),
                facing: index.isMultiple(of: 3) ? -1 : 1,
                timeSinceShot: seconds.truncatingRemainder(dividingBy: 1))
            precondition(pose.heightScale > 0.8 && pose.heightScale < 1.2)
            precondition(abs(pose.widthScale) > 0.8 && abs(pose.widthScale) < 1.2)
            let enemy = CharacterMotion.enemy(
                time: seconds, behavior: index % 6, phase: 0.5,
                moving: index.isMultiple(of: 2), aiming: index.isMultiple(of: 5))
            precondition(enemy.heightScale > 0.8 && enemy.heightScale < 1.2)
        }
        print("Character pose timing, mirror, recoil, silhouettes and safe scale tests passed")
    }
}
