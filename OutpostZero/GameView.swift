import SwiftUI
import SpriteKit

struct GameView: View {
    @State private var scene = OutpostScene(size: CGSize(width: 390, height: 844))

    var body: some View {
        SpriteView(scene: scene)
            .background(Color(red: 0.06, green: 0.12, blue: 0.18))
            .ignoresSafeArea()
    }
}
