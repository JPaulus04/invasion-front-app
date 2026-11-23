import SwiftUI
import SpriteKit

struct GameView: View {
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var scene = OutpostScene(size: CGSize(width: 390, height: 844))
    @State private var sceneReady = false

    var body: some View {
        SpriteView(scene: scene)
            .background(Color(red: 6 / 255, green: 13 / 255, blue: 26 / 255))
            .overlay {
                if !sceneReady {
                    BrandedLaunchView()
                        .allowsHitTesting(false)
                        .accessibilityHidden(true)
                        .transition(.opacity)
                }
            }
            .ignoresSafeArea()
            .onAppear {
                guard !sceneReady else { return }
                scene.onFirstFrame = {
                    DispatchQueue.main.async {
                        #if DEBUG
                        if ProcessInfo.processInfo.arguments.contains("-captureBrandLaunch") {
                            print("[BRAND LAUNCH] storyboard visible")
                            fflush(stdout)
                            return
                        }
                        #endif
                        withAnimation(reduceMotion ? nil : .easeOut(duration: 0.16)) {
                            sceneReady = true
                        }
                    }
                }
            }
            .onChange(of: scenePhase) { state in
                scene.setAppActive(state == .active)
            }
    }
}

private struct BrandedLaunchView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        let storyboard = UIStoryboard(name: "LaunchScreen", bundle: .main)
        guard let controller = storyboard.instantiateInitialViewController() else {
            preconditionFailure("LaunchScreen requires an initial view controller")
        }
        return controller
    }

    func updateUIViewController(_ controller: UIViewController, context: Context) {}
}
