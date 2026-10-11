import SpriteKit

final class OutpostScene: SKScene {
    private enum Phase { case ready, playing, upgrades, gameOver }
    private struct Enemy {
        let node: SKShapeNode
        var health: Int
        let speed: CGFloat
        let reward: Int
    }
    private var phase: Phase = .ready
    private var enemies: [Enemy] = []
    private var wave = 0
    private var spawned = 0
    private var upgradePurchased = false
    private var upgradeConfirmed = false
    private var waveTarget = 0
    private var spawnClock: TimeInterval = 0
    private var lastUpdate: TimeInterval = 0
    private var coins = 0
    private var health = 100
    private var damage = 1
    private var fireRate = 1
    private var lastShot: TimeInterval = -100
    private var turretNode: SKNode?
    private var clock: TimeInterval = 0
    private let hud = SKNode()
    private let hudPanel = SKShapeNode()
    private let overlay = SKNode()
    private let overlayBackdrop = SKShapeNode()
    private let arena = SKNode()
    private let base = SKShapeNode(rectOf: CGSize(width: 160, height: 60), cornerRadius: 15)
    private let title = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let subtitle = SKLabelNode(fontNamed: "AvenirNext-DemiBold")
    private let info = SKLabelNode(fontNamed: "AvenirNext-Bold")

    override func didMove(to view: SKView) {
        scaleMode = .resizeFill
        backgroundColor = SKColor(red: 0.07, green: 0.15, blue: 0.21, alpha: 1)
        addChild(arena)
        BattlefieldArt.install(in: self, behind: arena)
        addChild(hud)
        hud.zPosition = 30
        hudPanel.fillColor = SKColor(red: 0.04, green: 0.09, blue: 0.13, alpha: 0.94)
        hudPanel.strokeColor = SKColor(red: 0.3, green: 0.6, blue: 0.65, alpha: 0.6)
        hudPanel.lineWidth = 1
        hudPanel.zPosition = -1
        hud.addChild(hudPanel)
        addChild(overlay)
        overlay.zPosition = 40
        overlayBackdrop.fillColor = SKColor(white: 0.05, alpha: 0.82)
        overlayBackdrop.strokeColor = SKColor(white: 0.9, alpha: 0.22)
        overlayBackdrop.lineWidth = 2
        overlayBackdrop.zPosition = -1
        overlay.addChild(overlayBackdrop)
        base.fillColor = SKColor(red: 0.22, green: 0.43, blue: 0.59, alpha: 1)
        base.strokeColor = .cyan
        base.zPosition = 3
        base.lineWidth = 3
        arena.addChild(base)
        let turret = SKShapeNode(circleOfRadius: 20)
        turret.fillColor = SKColor(red: 0.13, green: 0.22, blue: 0.32, alpha: 1)
        turret.strokeColor = .systemYellow
        turret.lineWidth = 3
        turret.position = CGPoint(x: 0, y: 10)
        turret.zPosition = 4
        base.addChild(turret)
        turretNode = turret
        let barrel = SKShapeNode(rectOf: CGSize(width: 11, height: 35), cornerRadius: 4)
        barrel.fillColor = .darkGray
        barrel.strokeColor = .systemYellow
        barrel.position = CGPoint(x: 0, y: 22)
        barrel.zPosition = 3
        turret.addChild(barrel)
        for label in [title, subtitle, info] {
            label.horizontalAlignmentMode = .center
            hud.addChild(label)
        }
        title.fontSize = 27
        title.fontColor = .white
        subtitle.fontSize = 16
        subtitle.fontColor = .systemYellow
        info.fontSize = 15
        info.fontColor = .white
        layout()
        showReady()
    }

    override func didChangeSize(_ oldSize: CGSize) { layout() }

    private func layout() {
        base.position = CGPoint(x: size.width / 2, y: max(90, size.height * 0.13))
        hudPanel.path = CGPath(roundedRect: CGRect(x: 10, y: size.height - 173, width: max(1, size.width - 20), height: 111), cornerWidth: 13, cornerHeight: 13, transform: nil)
        title.position = CGPoint(x: size.width / 2, y: size.height - 94)
        subtitle.position = CGPoint(x: size.width / 2, y: size.height - 120)
        info.position = CGPoint(x: size.width / 2, y: size.height - 150)
        overlay.position = CGPoint(x: size.width / 2, y: size.height * 0.52)
        overlayBackdrop.path = CGPath(roundedRect: CGRect(x: -min(size.width - 28, 390) / 2, y: -205, width: min(size.width - 28, 390), height: 345), cornerWidth: 18, cornerHeight: 18, transform: nil)
        updateHUD()
    }

    private func updateHUD() {
        title.text = "OUTPOST ZERO"
        subtitle.text = "WAVE \(wave)  •  COINS \(coins)"
        info.text = "BASE \(health) HP  •  DAMAGE \(damage)  •  RATE \(fireRate)"
    }

    private func clearOverlay() {
        overlay.removeAllChildren()
        overlay.addChild(overlayBackdrop)
        overlayBackdrop.isHidden = false
    }

    private func overlayText(_ text: String, y: CGFloat, fontSize: CGFloat = 24, name: String? = nil) {
        let label = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        label.text = text
        label.fontSize = fontSize
        label.fontColor = .white
        label.position = CGPoint(x: 0, y: y)
        label.zPosition = 2
        label.name = name
        overlay.addChild(label)
    }

    private func showReady() {
        phase = .ready
        clearOverlay()
        overlayText("DEFEND THE OUTPOST", y: 65, fontSize: 22)
        overlayText("Tap enemies to shoot", y: 20, fontSize: 17)
        overlayText("▶ START", y: -45, name: "start")
    }

    private func startWave() {
        phase = .playing
        clearOverlay()
        overlayBackdrop.isHidden = true
        wave += 1
        spawned = 0
        upgradePurchased = false
        upgradeConfirmed = false
        waveTarget = 5 + wave * 3
        spawnClock = 1.2
        updateHUD()
    }

    private func spawnEnemy() {
        let type = Int.random(in: 0...2)
        let radius: CGFloat = type == 1 ? 23 : (type == 2 ? 17 : 14)
        let node = SKShapeNode(circleOfRadius: radius)
        node.fillColor = type == 1 ? .systemRed : (type == 2 ? .systemPurple : .systemOrange)
        node.strokeColor = .white
        node.lineWidth = 2
        let laneHalfWidth = min(size.width * 0.25, max(1, size.width / 2 - radius - 8))
        node.position = CGPoint(x: CGFloat.random(in: (size.width / 2 - laneHalfWidth)...(size.width / 2 + laneHalfWidth)), y: size.height - 198)
        node.zPosition = 5
        arena.addChild(node)
        enemies.append(Enemy(node: node, health: type == 1 ? 4 + wave / 3 : (type == 2 ? 2 : 1), speed: CGFloat(type == 2 ? 105 : (type == 1 ? 38 : 65)) + CGFloat(wave * 3), reward: type == 1 ? 25 : 10))
    }

    override func update(_ currentTime: TimeInterval) {
        if lastUpdate == 0 { lastUpdate = currentTime }
        let dt = min(0.05, max(0, currentTime - lastUpdate))
        lastUpdate = currentTime
        clock = currentTime
        guard phase == .playing else { return }
        spawnClock += dt
        if spawned < waveTarget && spawnClock >= max(0.35, 1.15 - Double(wave) * 0.04) {
            spawnClock = 0
            spawned += 1
            spawnEnemy()
        }
        for index in enemies.indices.reversed() {
            let current = enemies[index].node.position
            let horizontalStep = min(abs(base.position.x - current.x), CGFloat(dt) * enemies[index].speed * 0.45)
            let direction: CGFloat = base.position.x >= current.x ? 1 : -1
            enemies[index].node.position.x += horizontalStep * direction
            enemies[index].node.position.y -= enemies[index].speed * CGFloat(dt)
            if enemies[index].node.position.y <= base.position.y + 30 {
                health = max(0, health - 12)
                enemies[index].node.removeFromParent()
                enemies.remove(at: index)
                updateHUD()
            }
        }
        if health == 0 { endGame(); return }
        if spawned == waveTarget && enemies.isEmpty { completeWave() }
    }

    private func shoot(at point: CGPoint) {
        guard clock - lastShot >= 0.42 / Double(fireRate) else { return }
        guard let index = enemies.indices.min(by: {
            distance(enemies[$0].node.position, point) < distance(enemies[$1].node.position, point)
        }), distance(enemies[index].node.position, point) < 45 else { return }
        lastShot = clock
        let target = enemies[index].node.position
        turretNode?.zRotation = atan2(target.y - base.position.y, target.x - base.position.x) - .pi / 2
        let tracer = SKShapeNode()
        let path = CGMutablePath()
        path.move(to: CGPoint(x: base.position.x, y: base.position.y + 30))
        path.addLine(to: target)
        tracer.path = path
        tracer.strokeColor = .systemYellow
        tracer.lineWidth = 2
        tracer.zPosition = 8
        arena.addChild(tracer)
        tracer.run(.sequence([.fadeOut(withDuration: 0.055), .removeFromParent()]))
        enemies[index].health -= damage
        enemies[index].node.run(.sequence([.scale(to: 1.2, duration: 0.06), .scale(to: 1.0, duration: 0.08)]))
        if enemies[index].health <= 0 {
            coins += enemies[index].reward
            enemies[index].node.removeFromParent()
            enemies.remove(at: index)
        }
        updateHUD()
    }

    private func distance(_ a: CGPoint, _ b: CGPoint) -> CGFloat {
        hypot(a.x - b.x, a.y - b.y)
    }

    private func completeWave() {
        phase = .upgrades
        coins += 15 + wave * 3
        clearOverlay()
        overlayText("WAVE \(wave) COMPLETE", y: 95, fontSize: 23)
        overlayText("Choose an upgrade", y: 55, fontSize: 16)
        overlayText("DAMAGE +1  •  60", y: 10, fontSize: 19, name: "damage")
        overlayText("FIRE RATE +1  •  75", y: -35, fontSize: 19, name: "rate")
        overlayText("REPAIR 30 HP  •  40", y: -80, fontSize: 19, name: "repair")
        overlayText("▶ NEXT WAVE", y: -140, fontSize: 20, name: "next")
        updateHUD()
    }

    private func endGame() {
        phase = .gameOver
        clearOverlay()
        let best = max(wave, UserDefaults.standard.integer(forKey: "bestWave"))
        UserDefaults.standard.set(best, forKey: "bestWave")
        overlayText("OUTPOST LOST", y: 55)
        overlayText("Wave \(wave)  •  Best \(best)", y: 10, fontSize: 18)
        overlayText("↻ RESTART", y: -55, name: "restart")
    }

    private func restart() {
        for enemy in enemies { enemy.node.removeFromParent() }
        enemies.removeAll()
        wave = 0
        coins = 0
        health = 100
        damage = 1
        fireRate = 1
        lastShot = -100
        updateHUD()
        startWave()
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let point = touch.location(in: self)
        if phase == .playing { shoot(at: point); return }
        let local = touch.location(in: overlay)
        // Use generous touch bands rather than requiring a precise text glyph tap.
        let tapped: String?
        switch phase {
        case .ready:
            tapped = abs(local.y + 45) < 38 ? "start" : nil
        case .gameOver:
            tapped = abs(local.y + 55) < 38 ? "restart" : nil
        case .upgrades:
            if abs(local.y + (upgradeConfirmed ? 35 : 140)) < 30 { tapped = "next" }
            else if abs(local.y - 10) < 22 { tapped = "damage" }
            else if abs(local.y + 35) < 22 { tapped = "rate" }
            else if abs(local.y + 80) < 22 { tapped = "repair" }
            else { tapped = nil }
        case .playing:
            tapped = nil
        }
        switch (phase, tapped) {
        case (.ready, "start"): startWave()
        case (.gameOver, "restart"): restart()
        case (.upgrades, "damage") where !upgradePurchased && coins >= 60:
            coins -= 60; damage += 1; completeUpgrade()
        case (.upgrades, "rate") where !upgradePurchased && coins >= 75:
            coins -= 75; fireRate += 1; completeUpgrade()
        case (.upgrades, "repair") where !upgradePurchased && coins >= 40:
            coins -= 40; health = min(100, health + 30); completeUpgrade()
        case (.upgrades, "next"): startWave()
        default: break
        }
    }

    private func completeUpgrade() {
        upgradePurchased = true
        upgradeConfirmed = true
        updateHUD()
        clearOverlay()
        overlayText("UPGRADE PURCHASED", y: 35, fontSize: 22)
        overlayText("▶ NEXT WAVE", y: -35, name: "next")
    }
}
