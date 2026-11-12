import SwiftUI

@main
struct OutpostZeroApp: App {
    var body: some Scene {
        WindowGroup {
            GameView()
                .ignoresSafeArea()
                .statusBarHidden()
        }
    }
}
