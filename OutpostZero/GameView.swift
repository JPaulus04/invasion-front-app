import SwiftUI
import SpriteKit

struct GameView: View {
    @Environment(\.scenePhase) private var scenePhase
    @State private var scene = OutpostScene(size: CGSize(width: 390, height: 844))

    var body: some View {
        SpriteView(scene: scene)
            .background(Color(red: 0.06, green: 0.12, blue: 0.18))
            .ignoresSafeArea()
            .onChange(of: scenePhase) { state in
                scene.setAppActive(state == .active)
            }
    }
}
