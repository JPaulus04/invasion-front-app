import SpriteKit

final class OutpostScene: SKScene {
    private enum Phase { case ready, playing, upgrades, milestone, gate, worldComplete, restoration, gameOver }
    private struct Enemy {
        let node: SKShapeNode
        var health: Int
        let maxHealth: Int
        let healthBar: SKShapeNode
        let speed: CGFloat
        let reward: Int
        let behavior: Int
        let spawnX: CGFloat
    }
    private var phase: Phase = .ready
    private var restorationReturnPhase: Phase = .ready
    private var enemies: [Enemy] = []
    private var wave = 0
    private var gateUnlocked = false
    private let passageGate = SKShapeNode(rectOf: CGSize(width: 100, height: 46), cornerRadius: 12)
    private let zoneBanner = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let zoneScenery = SKNode()
    private let zoneColors: [SKColor] = [
        SKColor(red: 0.08, green: 0.19, blue: 0.15, alpha: 1),
        SKColor(red: 0.13, green: 0.22, blue: 0.10, alpha: 1),
        SKColor(red: 0.15, green: 0.17, blue: 0.22, alpha: 1),
        SKColor(red: 0.22, green: 0.12, blue: 0.13, alpha: 1)
    ]
    private var lastRestoredBranch = 0
    private let zoneNames = ["FOREST EDGE", "OVERGROWN PATH", "RUINED OUTPOST", "GUARDIAN CLEARING"]
    private var zoneIndex: Int { min(max(0, wave - 1) / 5, 3) }
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
    private var overlayButtons: [String: CGRect] = [:]
    private var streak = 0
    private var damageUpgrades = 0
    private var rateUpgrades = 0
    private var waveElapsed: TimeInterval = 0
    private var fastForward = false
    private let speedButton = SKShapeNode(rectOf: CGSize(width: 72, height: 34), cornerRadius: 9)
    private let speedLabel = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private var menuUnlockTime: TimeInterval = 0
    private var menuNeedsFreshTouch = false
    private var heldTouch: UITouch?
    private var aimPoint: CGPoint?
    private let pilot = SKShapeNode(rectOf: CGSize(width: 28, height: 34), cornerRadius: 7)
    private let pilotGun = SKShapeNode(rectOf: CGSize(width: 9, height: 23), cornerRadius: 3)
    private var movementOrigin: CGPoint?
    private var movementTarget: CGPoint?
    private var pilotSpeed: CGFloat { 205 + CGFloat(branchLevel(3) * 5) }
    private let autoFireRange: CGFloat = 260
    private var pilotShieldUntil: TimeInterval = 0
    private var pilotHitCount = 0
    private var chainLevel = 0
    private var chainUpgrades = 0
    private var explosiveLevel = 0
    private var incendiaryLevel = 0
    private var burns: [ObjectIdentifier: (damage: Int, until: TimeInterval, nextTick: TimeInterval)] = [:]
    private var bossNode: SKShapeNode?
    private let worldWaveCount = 20
    private let coreBranches = ["WEAPONS", "REACTOR", "ARMOR", "MOBILITY", "SYSTEMS"]
    private var availableCores: Int { UserDefaults.standard.integer(forKey: "powerCoresAvailable") }
    private func branchLevel(_ index: Int) -> Int {
        UserDefaults.standard.integer(forKey: "coreBranch_\(index)")
    }
    private var permanentDamageBonus: Int { branchLevel(0) / 3 }
    private var permanentArmorBonus: Int { branchLevel(2) * 2 }
    private var maximumHealth: Int { 100 + permanentArmorBonus }
    private var permanentRateBonus: Int { branchLevel(3) / 4 }
    private var permanentReactorBonus: Int { branchLevel(1) / 3 }
    private var permanentSystemsBonus: Int { branchLevel(4) / 4 }
    private var chosenAbilities: Int { [chainLevel, explosiveLevel, incendiaryLevel].filter { $0 > 0 }.count }
    private var awaitingMenuRelease = false
    private let damageFlash = SKShapeNode()
    private let warning = SKLabelNode(fontNamed: "AvenirNext-Heavy")
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
        speedButton.fillColor = .systemBlue
        speedButton.strokeColor = .white
        speedButton.lineWidth = 1
        speedButton.zPosition = 5
        speedLabel.fontSize = 15
        speedLabel.fontColor = .white
        speedLabel.verticalAlignmentMode = .center
        speedLabel.text = "1× SPEED"
        speedButton.addChild(speedLabel)
        hud.addChild(speedButton)
        hudPanel.fillColor = SKColor(red: 0.04, green: 0.09, blue: 0.13, alpha: 0.94)
        hudPanel.strokeColor = SKColor(red: 0.3, green: 0.6, blue: 0.65, alpha: 0.6)
        hudPanel.lineWidth = 1
        hudPanel.zPosition = -1
        hud.addChild(hudPanel)
        addChild(overlay)
        overlay.zPosition = 40
        damageFlash.fillColor = SKColor.red.withAlphaComponent(0.24)
        damageFlash.strokeColor = .clear
        damageFlash.zPosition = 35
        damageFlash.alpha = 0
        addChild(damageFlash)
        warning.fontSize = 18
        warning.fontColor = .systemRed
        warning.zPosition = 36
        warning.alpha = 0
        addChild(warning)
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
        pilot.fillColor = .systemCyan
        pilot.strokeColor = .white
        pilot.lineWidth = 3
        pilot.zPosition = 9
        let visor = SKShapeNode(rectOf: CGSize(width: 19, height: 9), cornerRadius: 3)
        visor.fillColor = .systemBlue
        visor.strokeColor = .white
        visor.position.y = 6
        pilot.addChild(visor)
        pilotGun.fillColor = .darkGray
        pilotGun.strokeColor = .systemYellow
        pilotGun.position = CGPoint(x: 14, y: 11)
        pilotGun.zPosition = 2
        pilot.addChild(pilotGun)
        arena.addChild(zoneScenery)
        zoneScenery.zPosition = -1
        arena.addChild(pilot)
        refreshPilotAppearance()
        passageGate.fillColor = .systemCyan
        passageGate.strokeColor = .white
        passageGate.lineWidth = 5
        passageGate.zPosition = 3
        passageGate.isHidden = true
        arena.addChild(passageGate)
        let gateText = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        gateText.text = "ENTER"
        gateText.fontSize = 13
        gateText.fontColor = .black
        gateText.verticalAlignmentMode = .center
        gateText.zPosition = 1
        passageGate.addChild(gateText)
        let gateArrow = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        gateArrow.text = "▲"
        gateArrow.fontSize = 22
        gateArrow.fontColor = .systemCyan
        gateArrow.position = CGPoint(x: 0, y: -40)
        gateArrow.name = "gateArrow"
        passageGate.addChild(gateArrow)
        zoneBanner.fontSize = 20
        zoneBanner.fontColor = .white
        zoneBanner.zPosition = 18
        zoneBanner.alpha = 0
        hud.addChild(zoneBanner)
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
        health = maximumHealth
        layout()
        showReady()
    }

    override func didChangeSize(_ oldSize: CGSize) { layout() }

    private func layout() {
        base.position = CGPoint(x: size.width / 2, y: max(90, size.height * 0.13))
        passageGate.position = CGPoint(x: size.width / 2, y: size.height - 230)
        if !zoneScenery.children.isEmpty { updateZoneScenery(zoneIndex) }
        if wave == 0 && phase == .ready { pilot.position = CGPoint(x: size.width / 2, y: base.position.y + 92) }
        hudPanel.path = CGPath(roundedRect: CGRect(x: 10, y: size.height - 173, width: max(1, size.width - 20), height: 111), cornerWidth: 13, cornerHeight: 13, transform: nil)
        title.position = CGPoint(x: size.width / 2, y: size.height - 94)
        subtitle.position = CGPoint(x: size.width / 2, y: size.height - 120)
        info.position = CGPoint(x: size.width / 2, y: size.height - 150)
        overlay.position = CGPoint(x: size.width / 2, y: size.height * 0.52)
        overlayBackdrop.path = CGPath(roundedRect: CGRect(x: -min(size.width - 28, 390) / 2, y: -245, width: min(size.width - 28, 390), height: 430), cornerWidth: 18, cornerHeight: 18, transform: nil)
        damageFlash.path = CGPath(rect: CGRect(origin: .zero, size: size), transform: nil)
        warning.position = CGPoint(x: size.width / 2, y: max(170, size.height * 0.23))
        zoneBanner.position = CGPoint(x: size.width / 2, y: size.height - 205)
        updateHUD()
    }

    private func updateHUD() {
        speedLabel.text = fastForward ? "2× SPEED" : "1× SPEED"
        speedButton.fillColor = fastForward ? .systemOrange : .systemBlue
        speedButton.isHidden = phase != .playing
        speedButton.position = CGPoint(x: size.width - 55, y: size.height - 160)
        title.text = "OUTPOST ZERO"
        subtitle.text = "\(zoneNames[zoneIndex])  •  \(wave)/\(worldWaveCount)  •  \(coins) COINS"
        info.text = "BASE \(health) HP  •  DAMAGE \(damage)  •  RATE \(fireRate)"
    }

    private func clearOverlay() {
        speedButton.isHidden = true
        overlay.removeAllChildren()
        overlayButtons.removeAll()
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

    private func actionButton(_ label: String, key: String, y: CGFloat, tint: SKColor, enabled: Bool = true) {
        let width = min(size.width - 72, 300)
        let frame = CGRect(x: -width / 2, y: y - 20, width: width, height: 42)
        let button = SKShapeNode(rect: frame, cornerRadius: 11)
        button.fillColor = enabled ? tint : SKColor(white: 0.23, alpha: 1)
        button.strokeColor = enabled ? SKColor.white.withAlphaComponent(0.6) : .clear
        button.lineWidth = 1.2
        button.zPosition = 1
        overlay.addChild(button)
        let text = SKLabelNode(fontNamed: "AvenirNext-DemiBold")
        text.text = label
        text.fontSize = 17
        text.fontColor = enabled ? .white : .lightGray
        text.verticalAlignmentMode = .center
        text.position = CGPoint(x: 0, y: y)
        text.zPosition = 2
        overlay.addChild(text)
        if enabled { overlayButtons[key] = frame }
    }

    private func impact(at point: CGPoint, color: SKColor, destroyed: Bool) {
        let count = destroyed ? 9 : 4
        for index in 0..<count {
            let spark = SKShapeNode(circleOfRadius: destroyed ? 3.5 : 2.2)
            spark.fillColor = color
            spark.strokeColor = .clear
            spark.position = point
            spark.zPosition = 12
            arena.addChild(spark)
            let angle = CGFloat(index) * .pi * 2 / CGFloat(count)
            let radius: CGFloat = destroyed ? 31 : 13
            let target = CGPoint(x: point.x + cos(angle) * radius, y: point.y + sin(angle) * radius)
            spark.run(.sequence([.group([.move(to: target, duration: 0.22), .fadeOut(withDuration: 0.22), .scale(to: 0.2, duration: 0.22)]), .removeFromParent()]))
        }
    }

    private func lockMenuBriefly() {
        menuUnlockTime = clock + 1.0
        menuNeedsFreshTouch = true
        awaitingMenuRelease = heldTouch != nil
        heldTouch = nil
        aimPoint = nil
    }

    private func grantStarterCoreIfNeeded() {
        guard !UserDefaults.standard.bool(forKey: "starterCoreGranted") else { return }
        UserDefaults.standard.set(true, forKey: "starterCoreGranted")
        UserDefaults.standard.set(availableCores + 1, forKey: "powerCoresAvailable")
    }

    private func showReady() {
        grantStarterCoreIfNeeded()
        phase = .ready
        ArcadeMusic.shared.play(.headquarters)
        clearOverlay()
        overlayText("DEFEND THE OUTPOST", y: 65, fontSize: 22)
        overlayText("Drag to move  •  Weapons auto-fire", y: 20, fontSize: 15)
        overlayText("POWER CORES: \(availableCores)  •  RESTORE YOUR PILOT", y: -15, fontSize: 13)
        if availableCores > 0 { overlayText("STARTER CORE READY — RESTORE A PART", y: -190, fontSize: 12) }
        actionButton("CHARACTER RESTORATION", key: "restore", y: -100, tint: .systemIndigo)
        actionButton("START DEFENSE", key: "start", y: -45, tint: .systemTeal)
        actionButton(ArcadeMusic.shared.isEnabled ? "MUSIC: ON" : "MUSIC: OFF", key: "music", y: -155, tint: .systemBlue)
    }

    private func startWave() {
        if wave > 0 && wave % 5 == 0 && wave < worldWaveCount && !gateUnlocked {
            showZoneGate()
            return
        }
        gateUnlocked = false
        passageGate.isHidden = true
        guard wave < worldWaveCount else {
            showWorldCompleteSummary()
            return
        }
        phase = .playing
        ArcadeMusic.shared.play(wave + 1 == worldWaveCount ? .boss : .forest)
        heldTouch = nil
        aimPoint = nil
        movementTarget = nil
        clearOverlay()
        overlayBackdrop.isHidden = true
        wave += 1
        warning.removeAllActions()
        warning.isHidden = true
        warning.alpha = 1
        let activeZone = min((wave - 1) / 5, 3)
        backgroundColor = zoneColors[activeZone]
        updateZoneScenery(activeZone)
        if wave == 1 || (wave - 1) % 5 == 0 {
            zoneBanner.removeAllActions()
            zoneBanner.text = zoneNames[activeZone]
            zoneBanner.alpha = 1
            zoneBanner.run(.sequence([.wait(forDuration: 1.6), .fadeOut(withDuration: 0.5)]))
        }
        spawned = 0
        upgradePurchased = false
        upgradeConfirmed = false
        waveTarget = wave == worldWaveCount ? 1 : min(40, 5 + wave * 2)
        spawnClock = 1.2
        waveElapsed = 0
        streak = 0
        updateHUD()
    }

    private func updateZoneScenery(_ zone: Int) {
        zoneScenery.removeAllChildren()
        let count = 7
        for index in 0..<count {
            let side: CGFloat = index.isMultiple(of: 2) ? 0.12 : 0.88
            let x = size.width * side + CGFloat((index % 3) - 1) * 12
            let y = base.position.y + 95 + CGFloat(index) * max(25, (size.height - base.position.y - 310) / CGFloat(count))
            let prop: SKShapeNode
            switch zone {
            case 0: // Tall pines along the forest approach.
                prop = SKShapeNode(path: {
                    let path = CGMutablePath()
                    path.move(to: CGPoint(x: 0, y: 23))
                    path.addLine(to: CGPoint(x: -15, y: -18))
                    path.addLine(to: CGPoint(x: 15, y: -18))
                    path.closeSubpath()
                    return path
                }())
                prop.fillColor = .systemGreen
            case 1: // Dense overgrowth.
                prop = SKShapeNode(ellipseOf: CGSize(width: 30, height: 17))
                prop.fillColor = .systemMint
            case 2: // Ruined concrete blocks.
                prop = SKShapeNode(rectOf: CGSize(width: 27, height: 21), cornerRadius: 2)
                prop.fillColor = .darkGray
            default: // Red guardian markers.
                prop = SKShapeNode(rectOf: CGSize(width: 12, height: 34), cornerRadius: 3)
                prop.fillColor = .systemRed
            }
            prop.strokeColor = .white.withAlphaComponent(0.22)
            prop.lineWidth = 1
            prop.alpha = 0.55
            prop.position = CGPoint(x: x, y: y)
            zoneScenery.addChild(prop)
        }
    }

    private func spawnEnemy() {
        let isBoss = wave == worldWaveCount
        // Zone-specific enemy composition introduces behaviors before raw stat inflation.
        let roll = Int.random(in: 0..<100)
        let type: Int
        if isBoss {
            type = 1
        } else if wave <= 3 {
            type = roll < 75 ? 0 : 2
        } else if wave <= 5 {
            type = roll < 15 ? 1 : (roll < 75 ? 0 : 2)
        } else if wave <= 10 {
            type = roll < 48 ? 2 : (roll < 82 ? 0 : 1)
        } else if wave <= 15 {
            type = roll < 28 ? 3 : (roll < 55 ? 1 : (roll < 80 ? 2 : 0))
        } else {
            type = roll < 36 ? 3 : (roll < 72 ? 1 : (roll < 89 ? 2 : 0))
        }
        let radius: CGFloat = isBoss ? 37 : (type == 1 ? 23 : (type == 2 ? 17 : (type == 3 ? 26 : 14)))
        let node = SKShapeNode(circleOfRadius: radius)
        node.fillColor = type == 1 ? .systemRed : (type == 2 ? .systemPurple : (type == 3 ? .systemGray : .systemOrange))
        node.strokeColor = type == 1 ? .systemYellow : .white
        node.lineWidth = type == 1 ? 4 : 2
        let core = SKShapeNode(circleOfRadius: radius * 0.47)
        core.fillColor = type == 1 ? .darkGray : (type == 2 ? .magenta : .brown)
        core.strokeColor = .clear
        core.zPosition = 1
        node.addChild(core)
        if type == 1 {
            let armor = SKShapeNode(rectOf: CGSize(width: radius * 1.5, height: 7), cornerRadius: 3)
            armor.fillColor = .systemYellow
            armor.strokeColor = .clear
            armor.position.y = radius * 0.52
            node.addChild(armor)
        } else if type == 2 {
            let wing = SKShapeNode(rectOf: CGSize(width: radius * 2.5, height: 5), cornerRadius: 2)
            wing.fillColor = .systemPurple
            wing.strokeColor = .white
            node.addChild(wing)
        }
        let laneHalfWidth = min(size.width * 0.25, max(1, size.width / 2 - radius - 8))
        node.position = CGPoint(x: CGFloat.random(in: (size.width / 2 - laneHalfWidth)...(size.width / 2 + laneHalfWidth)), y: size.height - 198)
        node.zPosition = 5
        arena.addChild(node)
        if isBoss { bossNode = node }
        let scaling = max(0, wave - 1)
        let enemyHP = isBoss ? 180 : (type == 3 ? 12 + scaling * 3 : (type == 1 ? 5 + scaling * 2 : 2 + scaling))
        let speed = isBoss ? CGFloat(20) : CGFloat(type == 2 ? 105 : (type == 3 ? 32 : (type == 1 ? 38 : 65))) + CGFloat(min(wave * 3, 45))
        let healthTrack = SKShapeNode(rectOf: CGSize(width: radius * 2.2, height: 5), cornerRadius: 2)
        healthTrack.fillColor = SKColor.black.withAlphaComponent(0.7)
        healthTrack.strokeColor = .clear
        healthTrack.position.y = radius + 12
        node.addChild(healthTrack)
        let healthBar = SKShapeNode(rectOf: CGSize(width: radius * 2.2, height: 5), cornerRadius: 2)
        healthBar.fillColor = .systemGreen
        healthBar.strokeColor = .clear
        healthBar.position.y = radius + 12
        healthBar.zPosition = 1
        node.addChild(healthBar)
        enemies.append(Enemy(node: node, health: enemyHP, maxHealth: enemyHP, healthBar: healthBar, speed: speed, reward: isBoss ? 250 : (type == 3 ? 20 : (type == 1 ? 12 : 6)), behavior: type, spawnX: node.position.x))
    }

    override func update(_ currentTime: TimeInterval) {
        if lastUpdate == 0 { lastUpdate = currentTime; clock = currentTime }
        let dt = min(0.05, max(0, currentTime - lastUpdate))
        let gameDt = dt * (fastForward ? 2.0 : 1.0)
        lastUpdate = currentTime
        clock += gameDt
        guard phase == .playing || phase == .gate else { return }
        if let heldTouch, let movementOrigin {
            let point = heldTouch.location(in: self)
            let dx = point.x - movementOrigin.x
            let dy = point.y - movementOrigin.y
            let length = hypot(dx, dy)
            movementTarget = length > 9 ? CGPoint(x: min(max(pilot.position.x + dx / length * 90, 24), size.width - 24), y: min(max(pilot.position.y + dy / length * 90, base.position.y + 55), size.height - 215)) : nil
        }
        if let movementTarget {
            let dx = movementTarget.x - pilot.position.x
            let dy = movementTarget.y - pilot.position.y
            let distanceToTarget = hypot(dx, dy)
            if distanceToTarget > 2 {
                let step = min(distanceToTarget, pilotSpeed * CGFloat(gameDt))
                pilot.position.x += dx / distanceToTarget * step
                pilot.position.y += dy / distanceToTarget * step
            }
        }
        if phase == .gate {
            if distance(pilot.position, passageGate.position) < 49 {
                passageGate.isHidden = true
                gateUnlocked = true
                heldTouch = nil
                movementOrigin = nil
                movementTarget = nil
                startWave()
            }
            return
        }
        // Prefer the nearest reachable threat, breaking ties toward the outpost.
        let reachable = enemies.filter { distance($0.node.position, pilot.position) <= autoFireRange }
        if let target = reachable.min(by: {
            let first = distance($0.node.position, pilot.position) + $0.node.position.y * 0.12
            let second = distance($1.node.position, pilot.position) + $1.node.position.y * 0.12
            return first < second
        }) {
            shoot(at: target.node.position)
        }
        spawnClock += gameDt
        waveElapsed += gameDt
        applyBurns()
        let spawnInterval = max(0.42, 1.20 - Double(wave) * 0.032)
        if spawned < waveTarget && spawnClock >= spawnInterval {
            spawnClock -= spawnInterval
            spawned += 1
            spawnEnemy()
        }
        for index in enemies.indices.reversed() {
            let current = enemies[index].node.position
            let enemy = enemies[index]
            // Fast scouts weave; armored elites track the player before returning toward the base.
            let destinationX: CGFloat
            if enemy.behavior == 2 {
                destinationX = enemy.spawnX + sin(CGFloat(waveElapsed) * 3.2 + CGFloat(index)) * min(48, size.width * 0.12)
            } else if enemy.behavior == 3 && current.y > base.position.y + 180 {
                destinationX = pilot.position.x
            } else {
                destinationX = base.position.x
            }
            let horizontalStep = min(abs(destinationX - current.x), CGFloat(gameDt) * enemy.speed * (enemy.behavior == 3 ? 0.65 : 0.45))
            let direction: CGFloat = destinationX >= current.x ? 1 : -1
            enemies[index].node.position.x += horizontalStep * direction
            enemies[index].node.position.y -= enemies[index].speed * CGFloat(gameDt)
            if distance(enemies[index].node.position, pilot.position) < (enemies[index].behavior == 3 ? 43 : 31) && clock >= pilotShieldUntil {
                pilotShieldUntil = clock + 1.1
                pilotHitCount += 1
                let contactDamage = enemies[index].behavior == 3 ? 6 : 3
                health = max(0, health - contactDamage)
                impact(at: pilot.position, color: .systemCyan, destroyed: false)
                pilot.removeAction(forKey: "hitFlash")
                pilot.run(.sequence([.fadeAlpha(to: 0.3, duration: 0.1), .fadeAlpha(to: 1, duration: 0.1), .fadeAlpha(to: 0.3, duration: 0.1), .fadeAlpha(to: 1, duration: 0.1)]), withKey: "hitFlash")
                warning.removeAllActions()
                warning.text = "ROBOT HIT!  -\(contactDamage) BASE HP"
                warning.alpha = 1
                warning.isHidden = false
                warning.run(.sequence([.wait(forDuration: 0.45), .fadeOut(withDuration: 0.4)]))
                updateHUD()
            }
            if enemies[index].node.position.y <= base.position.y + 30 {
                impact(at: enemies[index].node.position, color: .systemRed, destroyed: true)
                streak = 0
                let impactDamage = max(5, 12 - branchLevel(2) / 2)
                health = max(0, health - impactDamage)
                base.run(.sequence([.moveBy(x: -7, y: 0, duration: 0.04), .moveBy(x: 14, y: 0, duration: 0.08), .moveBy(x: -7, y: 0, duration: 0.04)]))
                damageFlash.removeAllActions()
                damageFlash.alpha = 0.85
                damageFlash.run(.fadeOut(withDuration: 0.32))
                warning.removeAllActions()
                warning.text = "OUTPOST HIT!  -\(impactDamage) HP"
                warning.alpha = 1
                warning.run(.sequence([.wait(forDuration: 0.4), .fadeOut(withDuration: 0.4)]))
                let bossBreached = enemies[index].node === bossNode
                if bossBreached { bossNode = nil }
                burns.removeValue(forKey: ObjectIdentifier(enemies[index].node))
                enemies[index].node.removeFromParent()
                enemies.remove(at: index)
                updateHUD()
                if bossBreached { endGame(); return }
            }
        }
        if health == 0 { endGame(); return }
        if spawned == waveTarget && enemies.isEmpty {
            if wave == worldWaveCount { completeWorld() }
            else if wave % 5 == 0 { showMilestone() }
            else { completeWave() }
        }
    }

    private func shoot(at point: CGPoint) {
        guard clock - lastShot >= 0.42 / Double(fireRate + permanentRateBonus) else { return }
        guard let index = enemies.indices.min(by: {
            distance(enemies[$0].node.position, point) < distance(enemies[$1].node.position, point)
        }), distance(enemies[index].node.position, point) < 45 else { return }
        lastShot = clock
        let target = enemies[index].node.position
        turretNode?.removeAction(forKey: "recoil")
        turretNode?.run(.sequence([.scale(to: 0.87, duration: 0.035), .scale(to: 1.0, duration: 0.08)]), withKey: "recoil")
        pilotGun.zRotation = atan2(target.y - pilot.position.y, target.x - pilot.position.x) - .pi / 2
        let tracer = SKShapeNode()
        let path = CGMutablePath()
        path.move(to: pilot.position)
        path.addLine(to: target)
        tracer.path = path
        tracer.strokeColor = .systemYellow
        tracer.lineWidth = 2
        tracer.zPosition = 8
        arena.addChild(tracer)
        tracer.run(.sequence([.fadeOut(withDuration: 0.055), .removeFromParent()]))
        impact(at: target, color: .systemYellow, destroyed: enemies[index].health <= damage + permanentDamageBonus)
        enemies[index].health -= damage + permanentDamageBonus
        if incendiaryLevel > 0 {
            burns[ObjectIdentifier(enemies[index].node)] = (damage: incendiaryLevel + permanentReactorBonus, until: clock + 2.5, nextTick: clock + 0.5)
        }
        if explosiveLevel > 0 {
            for other in enemies.indices where other != index && distance(enemies[other].node.position, target) < CGFloat(35 + explosiveLevel * 15) {
                enemies[other].health -= max(1, damage * explosiveLevel / 3)
                if incendiaryLevel > 0 {
                    burns[ObjectIdentifier(enemies[other].node)] = (damage: incendiaryLevel, until: clock + 2.5, nextTick: clock + 0.5)
                }
                impact(at: enemies[other].node.position, color: .systemOrange, destroyed: false)
                updateEnemyHealthBar(at: other)
            }
        }
        let fraction = CGFloat(max(0, enemies[index].health)) / CGFloat(enemies[index].maxHealth)
        enemies[index].healthBar.xScale = max(0.001, fraction)
        enemies[index].healthBar.fillColor = fraction > 0.5 ? .systemGreen : (fraction > 0.25 ? .systemYellow : .systemRed)
        enemies[index].node.run(.sequence([.scale(to: 1.2, duration: 0.06), .scale(to: 1.0, duration: 0.08)]))
        if chainLevel > 0 {
            chainAttack(from: target, excluding: enemies[index].node)
        }
        removeDefeatedEnemies()
        updateHUD()
    }

    private func chainAttack(from origin: CGPoint, excluding initialNode: SKShapeNode) {
        var previous = origin
        var visited: Set<ObjectIdentifier> = [ObjectIdentifier(initialNode)]
        for _ in 0..<min(chainLevel + permanentSystemsBonus, 5) {
            guard let targetIndex = enemies.indices
                .filter({ !visited.contains(ObjectIdentifier(enemies[$0].node)) && distance(enemies[$0].node.position, previous) <= 115 })
                .min(by: { distance(enemies[$0].node.position, previous) < distance(enemies[$1].node.position, previous) }) else { break }
            let enemy = enemies[targetIndex]
            let endpoint = enemy.node.position
            let bolt = SKShapeNode()
            let path = CGMutablePath()
            path.move(to: previous)
            let midpoint = CGPoint(x: (previous.x + endpoint.x) / 2 + CGFloat.random(in: -9...9),
                                   y: (previous.y + endpoint.y) / 2 + CGFloat.random(in: -9...9))
            path.addLine(to: midpoint)
            path.addLine(to: endpoint)
            bolt.path = path
            bolt.strokeColor = .systemCyan
            bolt.lineWidth = 3
            bolt.glowWidth = 4
            bolt.zPosition = 12
            arena.addChild(bolt)
            bolt.run(.sequence([.fadeOut(withDuration: 0.16), .removeFromParent()]))
            impact(at: endpoint, color: .systemCyan, destroyed: enemy.health <= max(1, damage / 2))
            enemies[targetIndex].health -= max(1, damage / 2)
            if incendiaryLevel > 0 {
                burns[ObjectIdentifier(enemy.node)] = (damage: incendiaryLevel, until: clock + 2.5, nextTick: clock + 0.5)
            }
            let fraction = CGFloat(max(0, enemies[targetIndex].health)) / CGFloat(enemies[targetIndex].maxHealth)
            enemies[targetIndex].healthBar.xScale = max(0.001, fraction)
            enemies[targetIndex].healthBar.fillColor = fraction > 0.5 ? .systemGreen : (fraction > 0.25 ? .systemYellow : .systemRed)
            visited.insert(ObjectIdentifier(enemy.node))
            previous = endpoint
        }
    }

    private func removeDefeatedEnemies() {
        for index in enemies.indices.reversed() where enemies[index].health <= 0 {
            streak += 1
            coins += enemies[index].reward
            burns.removeValue(forKey: ObjectIdentifier(enemies[index].node))
            if enemies[index].node === bossNode { bossNode = nil }
            enemies[index].node.removeFromParent()
            enemies.remove(at: index)
        }
    }

    private func updateEnemyHealthBar(at index: Int) {
        let fraction = CGFloat(max(0, enemies[index].health)) / CGFloat(enemies[index].maxHealth)
        enemies[index].healthBar.xScale = max(0.001, fraction)
        enemies[index].healthBar.fillColor = fraction > 0.5 ? .systemGreen : (fraction > 0.25 ? .systemYellow : .systemRed)
    }

    private func applyBurns() {
        for index in enemies.indices {
            let key = ObjectIdentifier(enemies[index].node)
            guard var burn = burns[key] else { continue }
            if clock >= burn.until { burns.removeValue(forKey: key); continue }
            if clock >= burn.nextTick {
                enemies[index].health -= burn.damage
                burn.nextTick = clock + 0.5
                burns[key] = burn
                impact(at: enemies[index].node.position, color: .systemOrange, destroyed: false)
                updateEnemyHealthBar(at: index)
            }
        }
        removeDefeatedEnemies()
        updateHUD()
    }

    private func distance(_ a: CGPoint, _ b: CGPoint) -> CGFloat {
        hypot(a.x - b.x, a.y - b.y)
    }

    private var damageCost: Int { 60 + damageUpgrades * 65 + damageUpgrades * damageUpgrades * 12 }
    private var rateCost: Int { 85 + rateUpgrades * 115 }
    private var repairCost: Int { 40 + wave * 8 }
    private var chainCost: Int { 110 + chainUpgrades * 150 }

    private func completeWave() {
        phase = .upgrades
        coins += 12 + wave * 2
        showUpgradeChoices()
    }

    private func showUpgradeChoices() {
        phase = .upgrades
        lockMenuBriefly()
        clearOverlay()
        overlayText("WAVE \(wave) COMPLETE", y: 95, fontSize: 23)
        overlayText("DMG \(damage)  •  RATE \(fireRate)  •  SKILLS \(chosenAbilities)/3", y: 55, fontSize: 16)
        actionButton("DAMAGE \(damage) → \(damage + 1)    \(damageCost) COINS", key: "damage", y: 10, tint: .systemOrange, enabled: coins >= damageCost)
        actionButton("RATE \(fireRate) → \(fireRate + 1)    \(rateCost) COINS", key: "rate", y: -35, tint: .systemBlue, enabled: coins >= rateCost && fireRate < 5)
        overlayText(wave % 5 == 0 ? "ZONE GATE READY AFTER UPGRADES" : "NEXT ABILITY AT WAVE \(((wave / 5) + 1) * 5)", y: -80, fontSize: 13)
        actionButton("REPAIR HP    \(repairCost) COINS", key: "repair", y: -125, tint: .systemGreen, enabled: coins >= repairCost && health < maximumHealth)
        if availableCores > 0 { actionButton("SPEND POWER CORES", key: "restore", y: -222, tint: .systemIndigo) }
        actionButton(wave % 5 == 0 ? "OPEN ZONE GATE" : "NEXT WAVE", key: "next", y: -178, tint: .systemTeal)
        updateHUD()
    }


    private func showZoneGate() {
        phase = .gate
        heldTouch = nil
        movementOrigin = nil
        movementTarget = nil
        clearOverlay()
        overlayBackdrop.isHidden = true
        passageGate.isHidden = false
        passageGate.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.run(.repeatForever(.sequence([.moveBy(x: 0, y: 7, duration: 0.45), .moveBy(x: 0, y: -7, duration: 0.45)])))
        passageGate.run(.repeatForever(.sequence([.fadeAlpha(to: 0.5, duration: 0.65), .fadeAlpha(to: 1, duration: 0.65)])))
        warning.text = "GATE OPEN — WALK THROUGH TO CONTINUE"
        warning.removeAllActions()
        warning.alpha = 1
        warning.isHidden = false
        updateHUD()
    }

    private func showMilestone() {
        phase = .milestone
        lockMenuBriefly()
        clearOverlay()
        overlayText("WAVE \(wave)  •  CHOOSE AN ABILITY", y: 104, fontSize: 19)
        overlayText("EQUIPPED \(chosenAbilities)/3  •  MAX LEVEL 3", y: 66, fontSize: 14)
        let abilities: [(key: String, title: String, level: Int, tint: SKColor)] = [
            ("chain", "CHAIN LIGHTNING", chainLevel, .systemCyan),
            ("explosive", "EXPLOSIVE ROUNDS", explosiveLevel, .systemOrange),
            ("incendiary", "INCENDIARY ROUNDS", incendiaryLevel, .systemRed)
        ]
        for (index, ability) in abilities.enumerated() {
            let available = ability.level > 0 ? ability.level < 3 : chosenAbilities < 3
            let description = ability.level == 0 ? "UNLOCK" : "LV \(ability.level) → \(ability.level + 1)"
            actionButton("\(ability.title)  •  \(description)", key: ability.key,
                         y: CGFloat(15 - index * 55), tint: ability.tint, enabled: available)
            let nextLevel = min(ability.level + 1, 3)
            let detail: String
            switch ability.key {
            case "chain":
                detail = "Chains to \(nextLevel + permanentSystemsBonus) nearby enemies"
            case "explosive":
                detail = "Blast radius \(35 + nextLevel * 15) • splash \(nextLevel)/3 weapon damage"
            default:
                detail = "Burn \(nextLevel + permanentReactorBonus) damage every 0.5s for 2.5s"
            }
            overlayText(detail, y: CGFloat(-13 - index * 55), fontSize: 11)
        }
        overlayText("FREE MILESTONE ABILITY", y: -168, fontSize: 14)
    }

    private func chooseMilestone(_ ability: String) {
        switch ability {
        case "chain":
            guard chainLevel < 3 && (chainLevel > 0 || chosenAbilities < 3) else { return }
            chainLevel += 1
        case "explosive":
            guard explosiveLevel < 3 && (explosiveLevel > 0 || chosenAbilities < 3) else { return }
            explosiveLevel += 1
        case "incendiary":
            guard incendiaryLevel < 3 && (incendiaryLevel > 0 || chosenAbilities < 3) else { return }
            incendiaryLevel += 1
        default: return
        }
        completeWave()
    }

    private func awardWorldCompletionCore() {
        guard !UserDefaults.standard.bool(forKey: "frontierForestCoreClaimed") else { return }
        UserDefaults.standard.set(true, forKey: "frontierForestCoreClaimed")
        UserDefaults.standard.set(availableCores + 1, forKey: "powerCoresAvailable")
    }

    private func completeWorld() {
        phase = .worldComplete
        ArcadeMusic.shared.play(.headquarters)
        lockMenuBriefly()
        clearOverlay()
        awardWorldCompletionCore()
        UserDefaults.standard.set(true, forKey: "frontierForestComplete")
        let stars = health * 10 >= maximumHealth * 9 ? 3 : (health * 2 >= maximumHealth ? 2 : 1)
        let previous = UserDefaults.standard.integer(forKey: "frontierForestStars")
        UserDefaults.standard.set(max(stars, previous), forKey: "frontierForestStars")
        showWorldCompleteSummary()

    }

    private func showWorldCompleteSummary() {
        phase = .worldComplete
        ArcadeMusic.shared.play(.headquarters)
        lockMenuBriefly()
        clearOverlay()
        let stars = UserDefaults.standard.integer(forKey: "frontierForestStars")
        overlayText("FRONTIER FOREST CLEARED", y: 85, fontSize: 21)
        overlayText("20 WAVES DEFEATED", y: 40, fontSize: 19)
        overlayText("\(stars) / 3 STARS  •  BASE \(health) HP", y: -5, fontSize: 18)
        overlayText("AVAILABLE POWER CORES: \(availableCores)", y: -48, fontSize: 15)
        actionButton("RESTORE CHARACTER", key: "restore", y: -105, tint: .systemIndigo)
        actionButton("PLAY AGAIN", key: "restart", y: -160, tint: .systemTeal)
    }

    private func showRestoration() {
        if phase != .restoration { restorationReturnPhase = phase }
        phase = .restoration
        ArcadeMusic.shared.play(.headquarters)
        lockMenuBriefly()
        clearOverlay()
        let total = (0..<coreBranches.count).reduce(0) { $0 + branchLevel($1) }
        overlayText("CHARACTER RESTORATION", y: 160, fontSize: 20)
        overlayText("\(total)/50 RESTORED  •  \(availableCores) CORES AVAILABLE", y: 124, fontSize: 14)
        let effects = ["Weapons: +1 damage every 3 cores", "Reactor: stronger combat abilities", "Armor: +2 base HP per core", "Mobility: +5 move speed per core", "Systems: extra chain targets every 4 cores"]
        overlayText(effects[min(lastRestoredBranch, 4)], y: -176, fontSize: 11)
        drawRestorationRobot()
        for index in coreBranches.indices {
            let level = branchLevel(index)
            actionButton("\(coreBranches[index])   \(level)/10", key: "branch_\(index)",
                         y: CGFloat(42 - index * 44), tint: .systemIndigo,
                         enabled: availableCores > 0 && level < 10)
        }
        actionButton("BACK", key: "back", y: -222, tint: .systemTeal)
    }

    private func refreshPilotAppearance() {
        pilot.fillColor = .systemCyan
        pilot.strokeColor = branchLevel(2) > 0 ? .systemGreen : .white
        pilot.lineWidth = branchLevel(3) > 0 ? 4 : 3
        pilotGun.strokeColor = branchLevel(0) > 0 ? .systemOrange : .systemYellow
        pilotGun.lineWidth = branchLevel(4) > 0 ? 4 : 1
        if let visor = pilot.children.first as? SKShapeNode {
            visor.fillColor = branchLevel(1) > 0 ? .systemPurple : .systemBlue
        }
    }

    private func drawRestorationRobot() {
        // Reuse the battlefield robot silhouette so upgrades are visibly attached to the pilot.
        let preview = SKNode()
        preview.name = "restorationRobot"
        preview.position = CGPoint(x: 0, y: 86)
        preview.setScale(0.95)
        preview.zPosition = 5
        let body = SKShapeNode(rectOf: CGSize(width: 28, height: 34), cornerRadius: 7)
        body.fillColor = .systemCyan
        body.strokeColor = .white
        body.lineWidth = 3
        preview.addChild(body)
        let visor = SKShapeNode(rectOf: CGSize(width: 19, height: 9), cornerRadius: 3)
        visor.fillColor = .systemBlue
        visor.strokeColor = .white
        visor.position.y = 6
        body.addChild(visor)
        let gun = SKShapeNode(rectOf: CGSize(width: 9, height: 23), cornerRadius: 3)
        gun.fillColor = .darkGray
        gun.strokeColor = .systemYellow
        gun.position = CGPoint(x: 14, y: 11)
        body.addChild(gun)
        if branchLevel(2) > 0 { body.strokeColor = .systemGreen }
        if branchLevel(0) > 0 { gun.strokeColor = .systemOrange }
        if branchLevel(1) > 0 { visor.fillColor = .systemPurple }
        if branchLevel(3) > 0 { body.lineWidth = 4 }
        if branchLevel(4) > 0 { gun.lineWidth = 4 }
        overlay.addChild(preview)
    }

    private func investCore(_ index: Int) {
        guard coreBranches.indices.contains(index), availableCores > 0, branchLevel(index) < 10 else { return }
        UserDefaults.standard.set(availableCores - 1, forKey: "powerCoresAvailable")
        UserDefaults.standard.set(branchLevel(index) + 1, forKey: "coreBranch_\(index)")
        lastRestoredBranch = index
        refreshPilotAppearance()
        showRestoration()
        // Highlight the restored hardware instead of flashing the entire character.
        let offset: CGPoint
        let tint: SKColor
        switch index {
        case 0: offset = CGPoint(x: 14, y: 11); tint = .systemOrange // weapon mount
        case 1: offset = CGPoint(x: 0, y: 6); tint = .systemPurple // reactor visor
        case 2: offset = CGPoint(x: 0, y: -6); tint = .systemGreen // armor shell
        case 3: offset = CGPoint(x: 0, y: -17); tint = .systemCyan // mobility feet
        default: offset = CGPoint(x: 14, y: 0); tint = .systemYellow // systems module
        }
        let origin = CGPoint(x: offset.x * 0.95, y: 86 + offset.y * 0.95)
        for ringIndex in 0..<3 {
            let ring = SKShapeNode(circleOfRadius: CGFloat(8 + ringIndex * 5))
            ring.fillColor = .clear
            ring.strokeColor = tint
            ring.lineWidth = 3
            ring.position = origin
            ring.zPosition = 20
            ring.alpha = 0.95
            overlay.addChild(ring)
            ring.run(.sequence([
                .wait(forDuration: Double(ringIndex) * 0.11),
                .group([.scale(to: 2.1, duration: 0.48), .fadeOut(withDuration: 0.48)]),
                .removeFromParent()
            ]))
        }
        overlay.childNode(withName: "restorationRobot")?.run(.sequence([
            .scale(to: 1.18, duration: 0.18),
            .scale(to: 0.95, duration: 0.24)
        ]))
    }

    private func endGame() {
        phase = .gameOver
        ArcadeMusic.shared.play(.headquarters)
        heldTouch = nil
        aimPoint = nil
        lockMenuBriefly()
        clearOverlay()
        let best = max(wave, UserDefaults.standard.integer(forKey: "bestWave"))
        UserDefaults.standard.set(best, forKey: "bestWave")
        overlayText("OUTPOST LOST", y: 55)
        overlayText("Wave \(wave)  •  Best \(best)", y: 10, fontSize: 18)
        actionButton("RESTART", key: "restart", y: -55, tint: .systemTeal)
    }

    private func restart() {
        for enemy in enemies { enemy.node.removeFromParent() }
        enemies.removeAll()
        bossNode = nil
        wave = 0
        passageGate.isHidden = true
        warning.isHidden = true
        zoneBanner.removeAllActions()
        zoneBanner.alpha = 0
        backgroundColor = zoneColors[0]
        updateZoneScenery(0)
        pilot.position = CGPoint(x: size.width / 2, y: base.position.y + 92)
        movementTarget = nil
        movementOrigin = nil
        pilotShieldUntil = 0
        pilotHitCount = 0
        pilot.alpha = 1
        pilot.removeAction(forKey: "hitFlash")
        passageGate.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        passageGate.alpha = 1
        gateUnlocked = false
        fastForward = false
        coins = 0
        health = maximumHealth
        damage = 1
        fireRate = 1
        damageUpgrades = 0
        rateUpgrades = 0
        chainLevel = 0
        chainUpgrades = 0
        explosiveLevel = 0
        incendiaryLevel = 0
        burns.removeAll()
        heldTouch = nil
        aimPoint = nil
        lastShot = -100
        streak = 0
        updateHUD()
        startWave()
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let point = touch.location(in: self)
        if phase == .playing || phase == .gate {
            if phase == .playing && speedButton.contains(touch.location(in: hud)) {
                fastForward.toggle()
                updateHUD()
                return
            }
            guard heldTouch == nil else { return }
            heldTouch = touch
            movementOrigin = point
            movementTarget = nil
            return
        }
        if clock < menuUnlockTime || awaitingMenuRelease { return }
        menuNeedsFreshTouch = false
        let local = touch.location(in: overlay)
        let tapped = overlayButtons.first(where: { $0.value.contains(local) })?.key
        switch (phase, tapped) {
        case (.ready, "start"): startWave()
        case (.ready, "music"):
            ArcadeMusic.shared.toggle()
            showReady()
        case (.ready, "restore"), (.worldComplete, "restore"), (.upgrades, "restore"): showRestoration()
        case (.restoration, "back"):
            if restorationReturnPhase == .worldComplete { showWorldCompleteSummary() }
            else if restorationReturnPhase == .upgrades {
                if upgradePurchased { completeUpgrade() } else { showUpgradeChoices() }
            }
            else { showReady() }
        case (.restoration, let key?) where key.hasPrefix("branch_"):
            if let index = Int(key.dropFirst(7)) { investCore(index) }
        case (.gameOver, "restart"), (.worldComplete, "restart"): restart()
        case (.gate, "enterGate"):
            gateUnlocked = true
            startWave()
        case (.milestone, "chain"): chooseMilestone("chain")
        case (.milestone, "explosive"): chooseMilestone("explosive")
        case (.milestone, "incendiary"): chooseMilestone("incendiary")
        case (.upgrades, "damage") where !upgradePurchased && coins >= damageCost:
            coins -= damageCost; damage += 1; damageUpgrades += 1; completeUpgrade()
        case (.upgrades, "rate") where !upgradePurchased && coins >= rateCost && fireRate < 5:
            coins -= rateCost; fireRate += 1; rateUpgrades += 1; completeUpgrade()
        case (.upgrades, "repair") where !upgradePurchased && coins >= repairCost && health < maximumHealth:
            coins -= repairCost; health = min(maximumHealth, health + 30); completeUpgrade()
        case (.upgrades, "next"): startWave()
        default: break
        }
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        if (phase == .playing || phase == .gate), let heldTouch, touches.contains(heldTouch) {
            let point = heldTouch.location(in: self)
            if let movementOrigin {
                let dx = point.x - movementOrigin.x
                let dy = point.y - movementOrigin.y
                let length = hypot(dx, dy)
                if length > 9 {
                    let directionX = dx / length
                    let directionY = dy / length
                    movementTarget = CGPoint(x: min(max(pilot.position.x + directionX * 90, 24), size.width - 24), y: min(max(pilot.position.y + directionY * 90, base.position.y + 55), size.height - 215))
                } else { movementTarget = nil }
            }
        }
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        if let heldTouch, touches.contains(heldTouch) {
            self.heldTouch = nil
            movementTarget = nil
            movementOrigin = nil
            aimPoint = nil
        }
        awaitingMenuRelease = false
        if clock >= menuUnlockTime { menuNeedsFreshTouch = false }
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        if let heldTouch, touches.contains(heldTouch) {
            self.heldTouch = nil
            aimPoint = nil
        }
        awaitingMenuRelease = false
        menuNeedsFreshTouch = false
    }

    private func completeUpgrade() {
        upgradePurchased = true
        upgradeConfirmed = true
        lockMenuBriefly()
        updateHUD()
        clearOverlay()
        overlayText("UPGRADE PURCHASED", y: 35, fontSize: 22)
        actionButton(wave % 5 == 0 ? "OPEN ZONE GATE" : "NEXT WAVE", key: "next", y: -35, tint: .systemTeal)
        if availableCores > 0 { actionButton("SPEND POWER CORES", key: "restore", y: -100, tint: .systemIndigo) }
    }
}
