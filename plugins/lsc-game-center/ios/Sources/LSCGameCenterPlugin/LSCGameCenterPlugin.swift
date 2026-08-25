import Foundation
import Capacitor
import GameKit

@objc(LSCGameCenterPlugin)
public class LSCGameCenterPlugin: CAPPlugin, CAPBridgedPlugin, GKGameCenterControllerDelegate {
    public let identifier = "LSCGameCenterPlugin"
    public let jsName = "LSCGameCenter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reportScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reportAchievement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showDashboard", returnType: CAPPluginReturnPromise)
    ]

    private func playerPayload() -> [String: Any] {
        let player = GKLocalPlayer.local
        return [
            "authenticated": player.isAuthenticated,
            "playerName": player.isAuthenticated ? player.displayName : ""
        ]
    }

    @objc func authenticate(_ call: CAPPluginCall) {
        if GKLocalPlayer.local.isAuthenticated {
            call.resolve(playerPayload())
            return
        }
        var completed = false
        GKLocalPlayer.local.authenticateHandler = { [weak self] viewController, error in
            guard let self = self, !completed else { return }
            if let viewController = viewController {
                DispatchQueue.main.async {
                    self.bridge?.viewController?.present(viewController, animated: true)
                }
                return
            }
            completed = true
            if let error = error {
                call.resolve(["authenticated": false, "error": error.localizedDescription])
            } else {
                call.resolve(self.playerPayload())
            }
        }
    }

    @objc func status(_ call: CAPPluginCall) {
        call.resolve(playerPayload())
    }

    @objc func reportScore(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Game Center player is not authenticated")
            return
        }
        guard let leaderboardId = call.getString("leaderboardId"),
              let score = call.getInt("score") else {
            call.reject("leaderboardId and score are required")
            return
        }
        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [leaderboardId]) { error in
            if let error = error { call.reject(error.localizedDescription) }
            else { call.resolve(["submitted": true]) }
        }
    }

    @objc func reportAchievement(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Game Center player is not authenticated")
            return
        }
        guard let achievementId = call.getString("achievementId") else {
            call.reject("achievementId is required")
            return
        }
        let achievement = GKAchievement(identifier: achievementId)
        achievement.percentComplete = min(100, max(0, call.getDouble("percentComplete") ?? 100))
        achievement.showsCompletionBanner = achievement.percentComplete >= 100
        GKAchievement.report([achievement]) { error in
            if let error = error { call.reject(error.localizedDescription) }
            else { call.resolve(["submitted": true]) }
        }
    }

    @objc func showDashboard(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Game Center player is not authenticated")
            return
        }
        let section = call.getString("section") ?? "dashboard"
        let state: GKGameCenterViewControllerState = section == "leaderboards" ? .leaderboards : section == "achievements" ? .achievements : .dashboard
        DispatchQueue.main.async {
            let controller = GKGameCenterViewController(state: state)
            controller.gameCenterDelegate = self
            self.bridge?.viewController?.present(controller, animated: true) {
                call.resolve(["presented": true])
            }
        }
    }

    public func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}
