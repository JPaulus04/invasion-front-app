import SpriteKit

final class OutpostScene: SKScene {
    private enum Phase { case ready, playing, levelUp, checkpoint, gate, worldComplete, restoration, gameOver }
    private struct Enemy {
        let node: SKShapeNode
        var health: Int
        let maxHealth: Int
        let healthBar: SKShapeNode
        let speed: CGFloat
        let reward: Int
        let behavior: Int
        let radius: CGFloat
        let activeAt: TimeInterval
        let weavePhase: CGFloat
        var nextAttack: TimeInterval
        var shotTarget: CGPoint? = nil
        var fireAt: TimeInterval = 0
    }
    private var worldMapSwipeStart: CGPoint?
    private var worldMapSwipeMoved = false
    private var worldMapIndex = 0
    private let worldMapNames = ["FRONTIER FOREST", "ASHEN WASTES", "FROZEN RIDGE", "NEON CITADEL", "VOID FRONTIER"]
    private var phase: Phase = .ready
    private var restorationReturnPhase: Phase = .ready
    private struct XPDrop {
        let node: SKShapeNode
        let amount: Int
    }
    private var xpDrops: [XPDrop] = []
    private var enemies: [Enemy] = []
    private var wave = 0
    private var gateUnlocked = false
    private let passageGate = SKShapeNode(rectOf: CGSize(width: 100, height: 46), cornerRadius: 12)
    private let zoneBanner = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let zoneScenery = SKNode()
    private let zoneColors: [SKColor] = [
        SKColor(red: 0.17, green: 0.29, blue: 0.23, alpha: 1),
        SKColor(red: 0.20, green: 0.31, blue: 0.17, alpha: 1),
        SKColor(red: 0.15, green: 0.17, blue: 0.22, alpha: 1),
        SKColor(red: 0.22, green: 0.12, blue: 0.13, alpha: 1)
    ]
    private var lastRestoredBranch = 0
    private let zoneNames = ["FOREST EDGE", "OVERGROWN PATH", "RUINED OUTPOST", "GUARDIAN CLEARING"]
    private var zoneIndex: Int { min(max(0, wave - 1) / 5, 3) }
    private var spawned = 0
    private var waveTarget = 0
    private var spawnClock: TimeInterval = 0
    private var lastUpdate: TimeInterval = 0
    private var coins = 0
    private var health = 100
    private var damage = 1
    private var fireRate = 1
    private var lastShot: TimeInterval = -100
    private var clock: TimeInterval = 0
    private var combatClock = CombatClock()
    private var combatTime: TimeInterval { combatClock.time }
    private var progress = RunProgress()
    private var runArmor = 0
    private var roomCleared = false
    private var levelUpReturnPhase: Phase = .playing
    private var levelChoices: [String] = []
    private var checkpointUsed = false
    private let xpTrack = SKShapeNode()
    private let xpFill = SKShapeNode()
    private let xpLabel = SKLabelNode(fontNamed: "AvenirNext-DemiBold")
    private let checkpointButton = SKShapeNode(rectOf: CGSize(width: 130, height: 36), cornerRadius: 9)
    private struct Projectile {
        let node: SKShapeNode
        let velocity: CGVector
        let expiresAt: TimeInterval
    }
    private struct Lob {
        let marker: SKShapeNode
        let shell: SKShapeNode
        let origin: CGPoint
        let target: CGPoint
        let launchedAt: TimeInterval
        let impactAt: TimeInterval
        let radius: CGFloat
    }
    private var projectiles: [Projectile] = []
    private var lobs: [Lob] = []
    private let hud = SKNode()
    private let hudPanel = SKShapeNode()
    private let overlay = SKNode()
    private let overlayBackdrop = SKShapeNode()
    private var overlayButtons: [String: CGRect] = [:]
    private var streak = 0
    private var waveElapsed: TimeInterval = 0
    // QA/TestFlight convenience toggle; disable before public App Store release.
    private let qaFastForwardEnabled = ProcessInfo.processInfo.arguments.contains("-enableQASpeed")
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
    private var pilotSpeed: CGFloat { 144 + CGFloat(branchLevel(3) * 3) }
    private let autoFireRange: CGFloat = 260
    private var pilotShieldUntil: TimeInterval = 0
    private var pilotHitCount = 0
    private var chainLevel = 0
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
    private var maximumHealth: Int { 100 + permanentArmorBonus + runArmor }
    private var permanentRateBonus: Int { branchLevel(3) / 4 }
    private var permanentReactorBonus: Int { branchLevel(1) / 3 }
    private var permanentSystemsBonus: Int { branchLevel(4) / 4 }
    private var chosenAbilities: Int { [chainLevel, explosiveLevel, incendiaryLevel].filter { $0 > 0 }.count }
    private var awaitingMenuRelease = false
    private let damageFlash = SKShapeNode()
    private let warning = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let arena = SKNode()
    private var roomBounds: CGRect { RoomRules.bounds(for: size) }
    private var entryPoint: CGPoint { RoomRules.entryPoint(for: size) }
    private var coreAwardedThisRun = false
    private let title = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let subtitle = SKLabelNode(fontNamed: "AvenirNext-DemiBold")
    private let info = SKLabelNode(fontNamed: "AvenirNext-Bold")

    override func didMove(to view: SKView) {
        scaleMode = .resizeFill
        backgroundColor = SKColor(red: 0.07, green: 0.15, blue: 0.21, alpha: 1)
        addChild(arena)
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
        xpTrack.fillColor = SKColor(white: 0.2, alpha: 1)
        xpTrack.strokeColor = .clear
        xpFill.fillColor = .systemMint
        xpFill.strokeColor = .clear
        xpFill.zPosition = 1
        hud.addChild(xpTrack)
        hud.addChild(xpFill)
        xpLabel.fontSize = 11
        xpLabel.fontColor = .white
        hud.addChild(xpLabel)
        checkpointButton.fillColor = .systemGreen
        checkpointButton.strokeColor = .white
        checkpointButton.isHidden = true
        let checkpointLabel = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        checkpointLabel.text = "HEALING STATION"
        checkpointLabel.fontSize = 11
        checkpointLabel.verticalAlignmentMode = .center
        checkpointButton.addChild(checkpointLabel)
        hud.addChild(checkpointButton)
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
        pilot.fillColor = .systemCyan
        pilot.strokeColor = .white
        pilot.lineWidth = 3
        pilot.zPosition = 9
        // Illustrated armor plate covers the original collision body without changing gameplay.
        let pilotArmor = SKSpriteNode(texture: productionTexture(named: "pilot_idle", fallback: pilotArmorTexture))
        pilotArmor.size = CGSize(width: 41, height: 49)
        pilotArmor.zPosition = 0.5
        pilot.addChild(pilotArmor)
        // Ground contact and a soft offset shadow give the pilot depth at phone scale.
        let pilotShadow = SKShapeNode(ellipseOf: CGSize(width: 33, height: 11))
        pilotShadow.fillColor = SKColor.black.withAlphaComponent(0.32)
        pilotShadow.strokeColor = .clear
        pilotShadow.position = CGPoint(x: 4, y: -23)
        pilotShadow.zPosition = -0.6
        pilot.addChild(pilotShadow)
        pilot.fillColor = .clear
        pilot.strokeColor = .clear
        let visor = SKShapeNode(rectOf: CGSize(width: 19, height: 9), cornerRadius: 3)
        visor.fillColor = .systemBlue
        visor.strokeColor = .white
        visor.position.y = 6
        pilot.addChild(visor)
        // Armored shoulder silhouette and chest reactor for a recognizable hero.
        for side: CGFloat in [-1, 1] {
            let pauldron = SKShapeNode(rectOf: CGSize(width: 10, height: 13), cornerRadius: 3)
            pauldron.position = CGPoint(x: side * 15, y: 5)
            pauldron.fillColor = .systemIndigo
            pauldron.strokeColor = .cyan
            pauldron.lineWidth = 1.5
            pauldron.zPosition = 1
            pilot.addChild(pauldron)
        }
        let reactor = SKShapeNode(circleOfRadius: 4)
        reactor.position = CGPoint(x: 0, y: -7)
        reactor.fillColor = .systemYellow
        reactor.strokeColor = .white
        reactor.glowWidth = 2
        reactor.zPosition = 2
        pilot.addChild(reactor)
        reactor.run(.repeatForever(.sequence([
            .group([.scale(to: 1.22, duration: 0.6), .fadeAlpha(to: 0.72, duration: 0.6)]),
            .group([.scale(to: 1, duration: 0.6), .fadeAlpha(to: 1, duration: 0.6)])
        ])))
        pilotGun.fillColor = .darkGray
        pilotGun.strokeColor = .systemYellow
        pilotGun.position = CGPoint(x: 14, y: 11)
        pilotGun.zPosition = 2
        pilot.addChild(pilotGun)
        // Keep the procedural accessories only for the placeholder pilot.
        // A finished character PNG already contains its visor, shoulders and weapon.
        if productionImage(named: "pilot_idle") != nil {
            visor.isHidden = true
            reactor.isHidden = true
            pilotGun.isHidden = true
            for child in pilot.children where child is SKShapeNode && child !== pilotGun && child !== visor && child !== reactor {
                child.isHidden = true
            }
        }
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
        for label in [title, subtitle, info] {
            label.horizontalAlignmentMode = .center
            hud.addChild(label)
        }
        title.fontSize = 22
        title.fontColor = .white
        subtitle.fontSize = 14
        subtitle.fontColor = .systemYellow
        info.fontSize = 13
        info.fontColor = .white
        health = maximumHealth
        layout()
        showReady()
        // CI-only launch flag: capture real combat rather than the world-map menu.
        if ProcessInfo.processInfo.arguments.contains("-captureCombatScreenshot") {
            startWave()
        }
    }

    override func didChangeSize(_ oldSize: CGSize) { layout() }

    private func layout() {
        if arena.parent != nil { BattlefieldArt.install(in: self, behind: arena) }
        passageGate.position = CGPoint(x: size.width / 2, y: roomBounds.maxY - 24)
        if !zoneScenery.children.isEmpty { updateZoneScenery(zoneIndex) }
        if wave == 0 && phase == .ready { pilot.position = entryPoint }
        hudPanel.path = CGPath(roundedRect: CGRect(x: 10, y: size.height - 183, width: max(1, size.width - 20), height: 112), cornerWidth: 13, cornerHeight: 13, transform: nil)
        title.position = CGPoint(x: size.width / 2, y: size.height - 89)
        subtitle.position = CGPoint(x: size.width / 2, y: size.height - 112)
        info.position = CGPoint(x: size.width / 2, y: size.height - 132)
        overlay.position = CGPoint(x: size.width / 2, y: size.height * 0.52)
        overlayBackdrop.path = CGPath(roundedRect: CGRect(x: -min(size.width - 28, 390) / 2, y: -245, width: min(size.width - 28, 390), height: 430), cornerWidth: 18, cornerHeight: 18, transform: nil)
        damageFlash.path = CGPath(rect: CGRect(origin: .zero, size: size), transform: nil)
        warning.position = CGPoint(x: size.width / 2, y: max(170, size.height * 0.23))
        zoneBanner.position = CGPoint(x: size.width / 2, y: roomBounds.maxY - 90)
        let xpWidth = max(1, size.width - 48)
        xpTrack.path = CGPath(roundedRect: CGRect(x: 0, y: 0, width: xpWidth, height: 6), cornerWidth: 3, cornerHeight: 3, transform: nil)
        xpFill.path = xpTrack.path
        xpTrack.position = CGPoint(x: 24, y: size.height - 158)
        xpFill.position = xpTrack.position
        xpLabel.position = CGPoint(x: size.width / 2, y: size.height - 174)
        checkpointButton.position = CGPoint(x: size.width / 2, y: roomBounds.minY + 25)
        updateHUD()
    }

    private func updateHUD() {
        speedLabel.text = fastForward ? "2× SPEED" : "1× SPEED"
        speedButton.fillColor = fastForward ? .systemOrange : .systemBlue
        speedButton.isHidden = !qaFastForwardEnabled || phase != .playing
        // Keep the QA speed toggle below the HUD, never on top of the XP bar.
        speedButton.position = CGPoint(x: size.width - 56, y: size.height - 199)
        xpFill.xScale = max(0.001, CGFloat(progress.xp) / CGFloat(progress.nextLevelXP))
        xpLabel.text = "LEVEL \(progress.level)  •  \(progress.xp)/\(progress.nextLevelXP) XP"
        checkpointButton.isHidden = phase != .gate || !wave.isMultiple(of: 5) || checkpointUsed
        title.text = "OUTPOST ZERO"
        subtitle.text = "ROOM \(wave)/\(worldWaveCount)  •  \(coins) COINS  •  \(max(0, waveTarget - spawned) + enemies.count) FOES"
        info.text = "HP \(health)/\(maximumHealth)  •  DMG \(damage)  •  RATE \(fireRate)"
        info.fontColor = health <= maximumHealth / 3 ? .systemRed : (health <= maximumHealth * 2 / 3 ? .systemYellow : .white)
    }

    private func clearOverlay() {
        speedButton.isHidden = true
        checkpointButton.isHidden = true
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
        // Brief expanding shock ring gives hits a readable silhouette at game speed.
        let ring = SKShapeNode(circleOfRadius: destroyed ? 12 : 7)
        ring.position = point
        ring.fillColor = .clear
        ring.strokeColor = color
        ring.lineWidth = destroyed ? 3 : 2
        ring.alpha = 0.85
        ring.zPosition = 11
        arena.addChild(ring)
        ring.run(.sequence([
            .group([.scale(to: destroyed ? 3.2 : 2.2, duration: 0.23),
                    .fadeOut(withDuration: 0.23)]),
            .removeFromParent()
        ]))
        // A short-lived luminous flash adds impact weight without persistent screen clutter.
        let flash = SKShapeNode(circleOfRadius: destroyed ? 18 : 10)
        flash.position = point
        flash.fillColor = color.withAlphaComponent(destroyed ? 0.48 : 0.30)
        flash.strokeColor = .white.withAlphaComponent(0.65)
        flash.lineWidth = 1
        flash.zPosition = 10.5
        arena.addChild(flash)
        flash.run(.sequence([
            .group([.scale(to: destroyed ? 2.1 : 1.5, duration: 0.13),
                    .fadeOut(withDuration: 0.13)]),
            .removeFromParent()
        ]))
        // Direction-neutral fragments scatter briefly on a kill, then disappear.
        if destroyed {
            for index in 0..<5 {
                let fragment = SKShapeNode(rectOf: CGSize(width: 5, height: 8), cornerRadius: 1)
                fragment.fillColor = color.withAlphaComponent(0.9)
                fragment.strokeColor = .white.withAlphaComponent(0.35)
                fragment.lineWidth = 0.5
                fragment.position = point
                fragment.zPosition = 12
                arena.addChild(fragment)
                let angle = CGFloat(index) * (.pi * 2 / 5) + 0.3
                let endpoint = CGPoint(x: point.x + cos(angle) * 39, y: point.y + sin(angle) * 39)
                fragment.run(.sequence([
                    .group([.move(to: endpoint, duration: 0.32),
                            .rotate(byAngle: angle + 1.5, duration: 0.32),
                            .fadeOut(withDuration: 0.32)]),
                    .removeFromParent()
                ]))
            }
        }
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
        movementOrigin = nil
        movementTarget = nil
    }

    private func showReady() {
        hud.isHidden = true
        phase = .ready
        ArcadeMusic.shared.play(.headquarters)
        clearOverlay()
        let selected = worldMapIndex
        let unlocked = selected == 0
        let bestStars = min(3, max(0, UserDefaults.standard.integer(forKey: "frontierForestStars")))
        overlayText("WORLD MAP", y: 174, fontSize: 23)
        overlayText("◀  \(selected + 1) / \(worldMapNames.count)  ▶", y: 133, fontSize: 15)
        let worldCard = SKShapeNode(rect: CGRect(x: -min(size.width - 90, 310) / 2, y: -18,
                                                 width: min(size.width - 90, 310), height: 128), cornerRadius: 18)
        worldCard.fillColor = unlocked ? SKColor.systemGreen.withAlphaComponent(0.22) : SKColor.systemGray.withAlphaComponent(0.18)
        worldCard.strokeColor = unlocked ? .systemTeal : .gray
        worldCard.lineWidth = 2
        overlay.addChild(worldCard)
        // Layered destination illustration, rendered entirely in SpriteKit.
        let palettes: [(SKColor, SKColor)] = [
            (.systemGreen, .systemTeal), (.systemOrange, .systemRed),
            (.systemCyan, .systemBlue), (.systemPurple, .systemPink),
            (.darkGray, .systemIndigo)
        ]
        let colors = palettes[selected]
        let horizon = SKShapeNode(rect: CGRect(x: -124, y: -12, width: 248, height: 56), cornerRadius: 12)
        horizon.fillColor = colors.0.withAlphaComponent(0.23)
        horizon.strokeColor = .clear
        horizon.zPosition = 0.5
        overlay.addChild(horizon)
        for index in 0..<5 {
            let x = CGFloat(index - 2) * 52
            let peak = SKShapeNode()
            let height: CGFloat = CGFloat(25 + ((index * 19 + selected * 11) % 32))
            let path = CGMutablePath()
            path.move(to: CGPoint(x: x - 35, y: -12))
            path.addLine(to: CGPoint(x: x, y: -12 + height * 0.75))
            path.addLine(to: CGPoint(x: x + 35, y: -12))
            path.closeSubpath()
            peak.path = path
            peak.fillColor = colors.1.withAlphaComponent(index.isMultiple(of: 2) ? 0.6 : 0.38)
            peak.strokeColor = .clear
            peak.zPosition = 0.7
            overlay.addChild(peak)
        }
        let beacon = SKShapeNode(circleOfRadius: 10)
        beacon.position = CGPoint(x: 0, y: 22)
        beacon.fillColor = colors.1
        beacon.strokeColor = .white
        beacon.glowWidth = 4
        beacon.zPosition = 0.9
        overlay.addChild(beacon)
        overlayText(worldMapNames[selected], y: 81, fontSize: 18)
        overlayText(unlocked ? "AVAILABLE  •  \(bestStars)/3 STARS" : "COMING SOON", y: 55, fontSize: 13)
        overlayText(unlocked ? "\(3 - bestStars) CORES STILL EARNABLE" : "NEW ENEMIES AND REWARDS", y: -11, fontSize: 11)
        actionButton("◀ PREVIOUS", key: "world_prev", y: -62, tint: .systemBlue, enabled: selected > 0)
        actionButton("NEXT ▶", key: "world_next", y: -110, tint: .systemBlue, enabled: selected < worldMapNames.count - 1)
        if unlocked {
            actionButton("ENTER WORLD", key: "start", y: -160, tint: .systemTeal)
        }
        actionButton("CHARACTER RESTORATION", key: "restore", y: -212, tint: .systemIndigo)
        overlayText("POWER CORES: \(availableCores)", y: -256, fontSize: 12)
    }

    private func startWave() {
        hud.isHidden = false
        if wave > 0 && wave < worldWaveCount && !gateUnlocked {
            showZoneGate()
            return
        }
        gateUnlocked = false
        passageGate.isHidden = false
        passageGate.fillColor = .darkGray
        (passageGate.children.first as? SKLabelNode)?.text = "LOCKED"
        passageGate.childNode(withName: "gateArrow")?.isHidden = true
        passageGate.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.position = CGPoint(x: 0, y: -40)
        passageGate.alpha = 1
        guard wave < worldWaveCount else {
            showWorldCompleteSummary()
            return
        }
        phase = .playing
        arena.isPaused = false
        clearHostileAttacks()
        roomCleared = false
        checkpointUsed = false
        ArcadeMusic.shared.play(wave + 1 == worldWaveCount ? .boss : .forest)
        heldTouch = nil
        aimPoint = nil
        movementTarget = nil
        movementOrigin = nil
        pilot.position = entryPoint
        pilotGun.zRotation = 0
        pilotShieldUntil = combatTime + 1.2
        lastShot = combatTime
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
        waveTarget = wave == worldWaveCount ? 1 : min(40, 5 + wave * 2)
        // Shorten the empty opening without increasing enemy count or attack damage.
        spawnClock = 0.9
        waveElapsed = 0
        streak = 0
        updateHUD()
    }

    private lazy var forestPineTexture: SKTexture = {
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: 72, height: 100))
        let image = renderer.image { context in
            let cg = context.cgContext
            cg.setFillColor(UIColor(red: 0.27, green: 0.19, blue: 0.13, alpha: 1).cgColor)
            cg.fill(CGRect(x: 32, y: 67, width: 9, height: 28))
            for (level, width) in [(0, 26.0), (1, 31.0), (2, 35.0)] {
                let y = CGFloat(8 + level * 21)
                let half = CGFloat(width)
                let path = UIBezierPath()
                path.move(to: CGPoint(x: 36, y: y))
                path.addLine(to: CGPoint(x: 36 - half, y: y + 39))
                path.addQuadCurve(to: CGPoint(x: 36 + half, y: y + 39),
                                  controlPoint: CGPoint(x: 36, y: y + 32))
                path.close()
                UIColor(red: 0.08 + CGFloat(level) * 0.025, green: 0.31 + CGFloat(level) * 0.045,
                        blue: 0.24 + CGFloat(level) * 0.015, alpha: 1).setFill()
                path.fill()
                cg.setStrokeColor(UIColor(red: 0.32, green: 0.65, blue: 0.48, alpha: 0.6).cgColor)
                cg.setLineWidth(1.5)
                cg.move(to: CGPoint(x: 35, y: y + 6))
                cg.addLine(to: CGPoint(x: 21, y: y + 30))
                cg.strokePath()
            }
        }
        return SKTexture(image: image)
    }()

    private func updateZoneScenery(_ zone: Int) {
        zoneScenery.removeAllChildren()
        // Alternate prop placement between rooms so successive arenas feel less repetitive.
        let count = 5 + (wave % 3)
        let roomVariant = (wave - 1) % 4
        for index in 0..<count {
            let leftSide = (index + roomVariant).isMultiple(of: 2)
            let side: CGFloat = zone == 0 ? (leftSide ? 0.15 : 0.85) : (leftSide ? 0.09 : 0.91)
            let x = size.width * side + CGFloat(((index * 7 + roomVariant * 3) % 5) - 2) * 8
            let y = roomBounds.minY + 55 + CGFloat(index) * max(25, (roomBounds.height - 100) / CGFloat(count)) + CGFloat(((index * 11 + wave * 7) % 19) - 9)
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
            prop.alpha = zone == 0 ? 0.95 : 0.55
            prop.position = CGPoint(x: x, y: y)
            zoneScenery.addChild(prop)
            if zone == 3 {
                // Guardian clearing markers emit a slow warning beacon.
                let beacon = SKShapeNode(circleOfRadius: 5)
                beacon.position.y = 15
                beacon.fillColor = .systemOrange
                beacon.strokeColor = .systemYellow
                beacon.glowWidth = 3
                beacon.zPosition = 2
                prop.addChild(beacon)
                beacon.run(.repeatForever(.sequence([
                    .fadeAlpha(to: 0.25, duration: 0.75),
                    .fadeAlpha(to: 1, duration: 0.75)
                ])))
            }
            if zone == 2 {
                // Weathered ruins: cracked capstone and recessed masonry joint.
                let cap = SKShapeNode(rectOf: CGSize(width: 30, height: 6), cornerRadius: 1)
                cap.fillColor = SKColor(red: 0.43, green: 0.47, blue: 0.45, alpha: 1)
                cap.strokeColor = .clear
                cap.position.y = 9
                cap.zPosition = 1
                prop.addChild(cap)
                let seam = SKShapeNode(rectOf: CGSize(width: 2, height: 14))
                seam.fillColor = .black.withAlphaComponent(0.4)
                seam.strokeColor = .clear
                seam.position = CGPoint(x: -3, y: -5)
                seam.zPosition = 1
                prop.addChild(seam)
            }
            if zone == 1 {
                // Dense overgrowth uses layered leaves rather than a single mint oval.
                prop.fillColor = .clear
                prop.strokeColor = .clear
                for leafIndex in 0..<5 {
                    let leaf = SKShapeNode(ellipseOf: CGSize(width: 17, height: 11))
                    leaf.fillColor = SKColor(red: 0.10 + CGFloat(leafIndex % 2) * 0.04,
                                             green: 0.36 + CGFloat(leafIndex % 3) * 0.06,
                                             blue: 0.22, alpha: 0.85)
                    leaf.strokeColor = .clear
                    leaf.position = CGPoint(x: CGFloat(leafIndex - 2) * 6,
                                            y: CGFloat((leafIndex * 7) % 11) - 5)
                    leaf.zRotation = CGFloat(leafIndex - 2) * 0.22
                    prop.addChild(leaf)
                }
            }
            if zone == 0 {
                // Render a shaded, irregular pine sprite instead of exposing the triangle primitive.
                prop.fillColor = .clear
                prop.strokeColor = .clear
                let shadow = SKShapeNode(ellipseOf: CGSize(width: 43, height: 14))
                shadow.fillColor = SKColor.black.withAlphaComponent(0.32)
                shadow.strokeColor = .clear
                shadow.position = CGPoint(x: 9, y: -22)
                shadow.zPosition = -0.5
                prop.addChild(shadow)
                let hasPineArt = productionImage(named: "forest_pine") != nil
                let tree = SKSpriteNode(texture: productionTexture(named: "forest_pine", fallback: forestPineTexture))
                tree.size = CGSize(width: 43 + CGFloat((index * 7 + wave) % 5) * 6, height: 59 + CGFloat((index * 3 + wave) % 5) * 8)
                tree.xScale = (index + wave).isMultiple(of: 3) ? -1 : 1
                tree.zRotation = CGFloat(((index * 7 + wave * 3) % 9) - 4) * 0.018
                tree.position.y = 5
                tree.zPosition = 1
                prop.addChild(tree)
                // Layered pine foliage and trunk add depth without blocking movement.
                let trunk = SKShapeNode(rectOf: CGSize(width: 6, height: 17), cornerRadius: 2)
                trunk.fillColor = .brown
                trunk.strokeColor = .clear
                trunk.position = CGPoint(x: 0, y: -15)
                trunk.zPosition = -0.1
                trunk.isHidden = hasPineArt
                prop.addChild(trunk)
                let canopy = SKShapeNode(ellipseOf: CGSize(width: 20, height: 12))
                canopy.fillColor = .systemMint.withAlphaComponent(0.65)
                canopy.strokeColor = .clear
                canopy.position = CGPoint(x: -3, y: 3)
                canopy.zPosition = 1
                canopy.isHidden = hasPineArt
                prop.addChild(canopy)
            }
        }
        // A sparse forest-floor layer adds depth without obstructing the playable center.
        if zone <= 1 {
            for index in 0..<18 {
                let fraction = CGFloat(index + 1) / 19
                let x = roomBounds.minX + roomBounds.width * fraction
                let y = roomBounds.minY + 40 + CGFloat((index * 47 + wave * 23) % max(1, Int(roomBounds.height - 85)))
                let patch = SKShapeNode(ellipseOf: CGSize(width: CGFloat(16 + (index % 4) * 9), height: CGFloat(7 + (index % 3) * 3)))
                patch.fillColor = SKColor(red: 0.10, green: 0.25, blue: 0.16, alpha: 0.38)
                patch.strokeColor = .clear
                patch.position = CGPoint(x: x, y: y)
                patch.zPosition = -0.7
                zoneScenery.addChild(patch)
                // Small illustrated leaf clusters break up the flat floor patches.
                if index.isMultiple(of: 2) {
                    for leafIndex in 0..<3 {
                        let leaf = SKShapeNode(ellipseOf: CGSize(width: 9, height: 4))
                        leaf.fillColor = SKColor(
                            red: 0.16 + CGFloat(leafIndex) * 0.045,
                            green: 0.35 + CGFloat((index + leafIndex) % 3) * 0.06,
                            blue: 0.19,
                            alpha: 0.72
                        )
                        leaf.strokeColor = .clear
                        leaf.position = CGPoint(
                            x: x + CGFloat(leafIndex - 1) * 7,
                            y: y + CGFloat((leafIndex * 5 + index) % 7) - 3
                        )
                        leaf.zRotation = CGFloat(leafIndex - 1) * 0.55
                        leaf.zPosition = -0.55
                        zoneScenery.addChild(leaf)
                    }
                }
                if index.isMultiple(of: 3) {
                    let stone = SKShapeNode(ellipseOf: CGSize(width: 10 + CGFloat(index % 3) * 3, height: 6))
                    stone.fillColor = SKColor(red: 0.32, green: 0.39, blue: 0.36, alpha: 0.7)
                    stone.strokeColor = .clear
                    stone.position = CGPoint(x: x + 5, y: y - 3)
                    stone.zPosition = -0.6
                    zoneScenery.addChild(stone)
                }
            }
        }
        // Narrow broken trail ties the room together without adding collision obstacles.
        if zone <= 1 {
            for index in 0..<9 {
                let trail = SKShapeNode(ellipseOf: CGSize(width: CGFloat(28 + index % 3 * 8), height: 14))
                trail.fillColor = SKColor(red: 0.32, green: 0.30, blue: 0.22, alpha: 0.20)
                trail.strokeColor = .clear
                trail.position = CGPoint(x: size.width * 0.5 + CGFloat((index * 17 + wave * 7) % 49 - 24),
                                         y: roomBounds.minY + 48 + CGFloat(index) * max(18, (roomBounds.height - 90) / 9))
                trail.zPosition = -0.85
                zoneScenery.addChild(trail)
            }
        }
        // Fern silhouettes frame the path and vary by room without adding collision.
        if zone == 0 {
            for index in 0..<7 {
                let side: CGFloat = index.isMultiple(of: 2) ? -1 : 1
                let x = size.width * (side < 0 ? 0.18 : 0.82)
                    + CGFloat(((index * 13 + wave * 5) % 21) - 10)
                let y = roomBounds.minY + 80
                    + CGFloat(index) * max(28, (roomBounds.height - 150) / 7)
                let fern = SKNode()
                fern.position = CGPoint(x: x, y: y)
                fern.zPosition = -0.45
                let stem = SKShapeNode(rectOf: CGSize(width: 2, height: 19), cornerRadius: 1)
                stem.fillColor = SKColor(red: 0.13, green: 0.34, blue: 0.18, alpha: 0.8)
                stem.strokeColor = .clear
                fern.addChild(stem)
                for leafIndex in 0..<6 {
                    let leaf = SKShapeNode(ellipseOf: CGSize(width: 12, height: 4))
                    leaf.fillColor = SKColor(red: 0.13 + CGFloat(leafIndex % 2) * 0.04,
                                             green: 0.40 + CGFloat(leafIndex % 3) * 0.04,
                                             blue: 0.22, alpha: 0.82)
                    leaf.strokeColor = .clear
                    leaf.position = CGPoint(x: leafIndex.isMultiple(of: 2) ? -6 : 6,
                                            y: CGFloat(leafIndex - 3) * 3)
                    leaf.zRotation = (leafIndex.isMultiple(of: 2) ? 1 : -1) * 0.32
                    fern.addChild(leaf)
                }
                zoneScenery.addChild(fern)
            }
        }
        // Small ground accents provide visual texture while keeping the center clear.
        for index in 0..<12 {
            let accent = SKShapeNode(ellipseOf: CGSize(width: 10 + CGFloat(index % 3) * 4, height: 4))
            accent.fillColor = zone == 0 ? .systemGreen.withAlphaComponent(0.19) : .white.withAlphaComponent(0.09)
            accent.strokeColor = .clear
            let fraction = CGFloat(index + 1) / 13
            accent.position = CGPoint(x: roomBounds.minX + roomBounds.width * fraction,
                                      y: roomBounds.minY + 28 + CGFloat((index * 37 + wave * 11) % 70))
            accent.zPosition = -0.2
            zoneScenery.addChild(accent)
        }
    }

    // Production art takes precedence when a validated PNG is bundled in the app.
    // Until then, existing procedural textures keep the game fully playable.
    // XcodeGen can copy ArtAssets either to the bundle root or into an ArtAssets folder.
    // Resolve both layouts so a successful bundle check also means the game can display the PNG.
    private func productionImage(named name: String) -> UIImage? {
        if let image = UIImage(named: name) { return image }
        for subdirectory in [nil, "ArtAssets"] as [String?] {
            if let url = Bundle.main.url(forResource: name, withExtension: "png", subdirectory: subdirectory),
               let image = UIImage(contentsOfFile: url.path) {
                return image
            }
        }
        return nil
    }

    private func productionTexture(named name: String, fallback: SKTexture) -> SKTexture {
        guard let image = productionImage(named: name) else { return fallback }
        let texture = SKTexture(image: image)
        texture.filteringMode = .linear
        return texture
    }

    private lazy var pilotArmorTexture: SKTexture = {
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: 96, height: 112))
        let image = renderer.image { _ in
            let torso = UIBezierPath()
            torso.move(to: CGPoint(x: 31, y: 12))
            torso.addLine(to: CGPoint(x: 65, y: 12))
            torso.addLine(to: CGPoint(x: 80, y: 29))
            torso.addLine(to: CGPoint(x: 73, y: 86))
            torso.addLine(to: CGPoint(x: 60, y: 104))
            torso.addLine(to: CGPoint(x: 36, y: 104))
            torso.addLine(to: CGPoint(x: 23, y: 86))
            torso.addLine(to: CGPoint(x: 16, y: 29))
            torso.close()
            UIColor(red: 0.12, green: 0.26, blue: 0.36, alpha: 1).setFill()
            torso.fill()
            UIColor(red: 0.59, green: 0.88, blue: 0.89, alpha: 1).setStroke()
            torso.lineWidth = 4
            torso.stroke()
            let chest = UIBezierPath(roundedRect: CGRect(x: 32, y: 49, width: 32, height: 33), cornerRadius: 6)
            UIColor(red: 0.07, green: 0.13, blue: 0.22, alpha: 1).setFill()
            chest.fill()
            let helmet = UIBezierPath(roundedRect: CGRect(x: 28, y: 15, width: 40, height: 33), cornerRadius: 10)
            UIColor(red: 0.18, green: 0.35, blue: 0.46, alpha: 1).setFill()
            helmet.fill()
            UIColor(red: 0.60, green: 0.89, blue: 0.95, alpha: 1).setStroke()
            helmet.lineWidth = 2
            helmet.stroke()
            let visor = UIBezierPath(roundedRect: CGRect(x: 32, y: 28, width: 32, height: 9), cornerRadius: 4)
            UIColor(red: 0.24, green: 0.88, blue: 0.98, alpha: 1).setFill()
            visor.fill()
        }
        return SKTexture(image: image)
    }()

    private lazy var enemyChassisTexture: SKTexture = {
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: 80, height: 90))
        let image = renderer.image { _ in
            let outline = UIBezierPath()
            outline.move(to: CGPoint(x: 19, y: 17))
            outline.addLine(to: CGPoint(x: 32, y: 7))
            outline.addLine(to: CGPoint(x: 48, y: 7))
            outline.addLine(to: CGPoint(x: 61, y: 17))
            outline.addLine(to: CGPoint(x: 70, y: 47))
            outline.addLine(to: CGPoint(x: 58, y: 78))
            outline.addLine(to: CGPoint(x: 22, y: 78))
            outline.addLine(to: CGPoint(x: 10, y: 47))
            outline.close()
            UIColor(red: 0.20, green: 0.28, blue: 0.32, alpha: 1).setFill()
            outline.fill()
            UIColor(red: 0.65, green: 0.82, blue: 0.84, alpha: 1).setStroke()
            outline.lineWidth = 3
            outline.stroke()
            let panel = UIBezierPath(roundedRect: CGRect(x: 24, y: 24, width: 32, height: 29), cornerRadius: 5)
            UIColor(red: 0.07, green: 0.12, blue: 0.17, alpha: 1).setFill()
            panel.fill()
            let slit = UIBezierPath(roundedRect: CGRect(x: 25, y: 29, width: 30, height: 7), cornerRadius: 3)
            UIColor(red: 0.68, green: 0.96, blue: 0.91, alpha: 1).setFill()
            slit.fill()
        }
        return SKTexture(image: image)
    }()

    private func spawnEnemy() {
        let isBoss = wave == worldWaveCount
        // Shooters arrive in room 6; lobbers join mixed groups from room 11.
        let roll = Int.random(in: 0..<100)
        let type = CombatRules.enemyType(room: wave, roll: roll)
        let radius: CGFloat = isBoss ? 37 : (type == 1 ? 23 : (type == 2 ? 17 : (type == 3 ? 26 : 14)))
        let node = SKShapeNode(circleOfRadius: radius)
        node.fillColor = type == 1 ? .systemRed : (type == 2 ? .systemPurple : (type == 3 ? .systemGray : .systemOrange))
        if type == 4 { node.fillColor = .systemBlue }
        if type == 5 { node.fillColor = .systemOrange }
        node.strokeColor = type == 1 ? .systemYellow : .white
        node.lineWidth = type == 1 ? 4 : 2
        let usesIllustratedEnemy = !isBoss && productionImage(named: (type == 1 || type == 2) ? "scout_idle" : (type == 3 ? "heavy_idle" : "enemy_default")) != nil
        // Textured chassis overlay: preserves collision geometry while changing the visible silhouette.
        if !isBoss {
            // Use class-specific artwork only for matching roles; never recolor finished illustrations.
            let assetName = (type == 1 || type == 2) ? "scout_idle" : (type == 3 ? "heavy_idle" : "enemy_default")
            let hasProductionArt = productionImage(named: assetName) != nil
            // The collision circle must not show through transparent character art.
            if hasProductionArt {
                node.fillColor = .clear
                node.strokeColor = .clear
            }
            let armor = SKSpriteNode(texture: productionTexture(named: assetName, fallback: enemyChassisTexture))
            armor.size = CGSize(width: radius * 2.1, height: radius * 2.35)
            armor.color = (type == 1 || type == 2) ? .systemRed : (type == 3 ? .gray : (type == 4 ? .systemBlue : .orange))
            armor.colorBlendFactor = hasProductionArt ? 0 : 0.72
            armor.zPosition = 0.8
            node.addChild(armor)
            if hasProductionArt {
                // Ground shadow anchors illustrated enemies without obscuring their silhouette.
                let contactShadow = SKShapeNode(ellipseOf: CGSize(width: radius * 1.7, height: radius * 0.48))
                contactShadow.fillColor = SKColor.black.withAlphaComponent(0.34)
                contactShadow.strokeColor = .clear
                contactShadow.position = CGPoint(x: 3, y: -radius * 0.86)
                contactShadow.zPosition = -0.5
                node.addChild(contactShadow)
            }
            // Silhouette accents distinguish roles even when enemy colors are similar.
            if type == 2 && !hasProductionArt {
                // Fast scouts: swept-back fins, narrow frame.
                armor.xScale = 0.78
                for side: CGFloat in [-1, 1] {
                    let fin = SKShapeNode()
                    let path = CGMutablePath()
                    path.move(to: CGPoint(x: side * radius * 0.45, y: radius * 0.35))
                    path.addLine(to: CGPoint(x: side * radius * 1.5, y: radius * 0.95))
                    path.addLine(to: CGPoint(x: side * radius * 1.1, y: -radius * 0.35))
                    path.closeSubpath()
                    fin.path = path
                    fin.fillColor = .systemRed
                    fin.strokeColor = .white.withAlphaComponent(0.6)
                    fin.lineWidth = 1
                    fin.zPosition = 0.7
                    node.addChild(fin)
                }
            } else if type == 3 && !hasProductionArt {
                // Heavy units: broad angular shoulder armor.
                for side: CGFloat in [-1, 1] {
                    let plate = SKShapeNode(rectOf: CGSize(width: radius * 0.75, height: radius * 1.1), cornerRadius: 3)
                    plate.position = CGPoint(x: side * radius * 0.85, y: 0)
                    plate.fillColor = .darkGray
                    plate.strokeColor = .lightGray
                    plate.lineWidth = 2
                    plate.zPosition = 1.1
                    node.addChild(plate)
                }
            } else if type == 4 {
                // Shooters: narrow antennae distinguish precision threats.
                for side: CGFloat in [-1, 1] {
                    let antenna = SKShapeNode(rectOf: CGSize(width: 3, height: radius * 0.85), cornerRadius: 1)
                    antenna.position = CGPoint(x: side * radius * 0.65, y: radius * 0.9)
                    antenna.fillColor = .cyan
                    antenna.strokeColor = .clear
                    antenna.zPosition = 1.2
                    node.addChild(antenna)
                }
            } else if type == 5 {
                // Lobbers: oversized rear mortar housing.
                let mortar = SKShapeNode(ellipseOf: CGSize(width: radius * 1.55, height: radius * 0.8))
                mortar.position.y = radius * 0.8
                mortar.fillColor = .brown
                mortar.strokeColor = .systemYellow
                mortar.lineWidth = 2
                mortar.zPosition = 1.2
                node.addChild(mortar)
            }
        }
        // Layered armor plates and glowing eyes make silhouettes readable at phone scale.
        if !isBoss && !usesIllustratedEnemy {
            let shoulderWidth = radius * (type == 3 ? 1.5 : 1.25)
            let shoulder = SKShapeNode(rectOf: CGSize(width: shoulderWidth, height: radius * 0.43), cornerRadius: 3)
            shoulder.position.y = radius * 0.45
            shoulder.fillColor = type == 3 ? .darkGray : .black.withAlphaComponent(0.45)
            shoulder.strokeColor = node.strokeColor.withAlphaComponent(0.65)
            shoulder.lineWidth = 1
            shoulder.zPosition = 1.5
            node.addChild(shoulder)
            let visor = SKShapeNode(rectOf: CGSize(width: radius * 0.8, height: max(3, radius * 0.22)), cornerRadius: 2)
            visor.position.y = radius * 0.10
            visor.fillColor = type == 4 ? .cyan : (type == 5 ? .yellow : .systemRed)
            visor.strokeColor = .clear
            visor.glowWidth = 2
            visor.zPosition = 3
            node.addChild(visor)
        }
        let core = SKShapeNode(circleOfRadius: radius * 0.47)
        core.fillColor = type == 1 ? .darkGray : (type == 2 ? .magenta : .brown)
        core.strokeColor = .clear
        core.zPosition = 1
        if !usesIllustratedEnemy { node.addChild(core) }
        if isBoss {
            // A distinct guardian silhouette makes the final encounter recognizable at a glance.
            let crown = SKShapeNode(rectOf: CGSize(width: radius * 1.7, height: 12), cornerRadius: 3)
            crown.fillColor = .systemOrange
            crown.strokeColor = .white
            crown.lineWidth = 2
            crown.position.y = radius * 0.8
            crown.zPosition = 2
            node.addChild(crown)
            let eye = SKShapeNode(rectOf: CGSize(width: radius * 0.9, height: 10), cornerRadius: 3)
            eye.fillColor = .systemCyan
            eye.strokeColor = .white
            eye.position.y = radius * 0.14
            eye.zPosition = 3
            node.addChild(eye)
            // Guardian side armor and reactor make the World 1 boss stand out.
            for side: CGFloat in [-1, 1] {
                let guardPlate = SKShapeNode(rectOf: CGSize(width: 18, height: 28), cornerRadius: 5)
                guardPlate.position = CGPoint(x: side * radius * 0.83, y: -5)
                guardPlate.fillColor = .systemRed
                guardPlate.strokeColor = .systemYellow
                guardPlate.lineWidth = 2
                guardPlate.zPosition = 2
                node.addChild(guardPlate)
            }
            let reactor = SKShapeNode(circleOfRadius: 9)
            reactor.position = CGPoint(x: 0, y: -radius * 0.42)
            reactor.fillColor = .systemOrange
            reactor.strokeColor = .white
            reactor.glowWidth = 5
            reactor.zPosition = 4
            node.addChild(reactor)
        }
        if type >= 4 {
            let weapon = SKShapeNode(rectOf: CGSize(width: type == 5 ? 22 : 8, height: 26), cornerRadius: 3)
            weapon.fillColor = type == 5 ? .systemYellow : .systemCyan
            weapon.strokeColor = .white
            weapon.position.y = 15
            node.addChild(weapon)
        }
        // Distinct silhouettes help players recognize ranged threats before they attack.
        if type == 4 {
            let visor = SKShapeNode(rectOf: CGSize(width: radius * 1.55, height: 5), cornerRadius: 2)
            visor.fillColor = .systemCyan
            visor.strokeColor = .white
            visor.position.y = radius * 0.28
            visor.zPosition = 3
            node.addChild(visor)
            let barrel = SKShapeNode(rectOf: CGSize(width: 7, height: radius * 1.7), cornerRadius: 2)
            barrel.fillColor = .systemBlue
            barrel.strokeColor = .white
            barrel.position = CGPoint(x: radius * 0.9, y: 0)
            barrel.zPosition = 2
            node.addChild(barrel)
        } else if type == 5 {
            let mortar = SKShapeNode(circleOfRadius: radius * 0.5)
            mortar.fillColor = .systemYellow
            mortar.strokeColor = .white
            mortar.lineWidth = 2
            mortar.position.y = radius * 0.25
            mortar.zPosition = 3
            node.addChild(mortar)
            let base = SKShapeNode(rectOf: CGSize(width: radius * 2.2, height: 7), cornerRadius: 3)
            base.fillColor = .systemOrange
            base.strokeColor = .white
            base.position.y = -radius * 0.65
            node.addChild(base)
        }
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
        // Telegraphed materialization inside the room, never on the pilot.
        let candidates = (0..<32).map { _ in
            CGPoint(x: CGFloat.random(in: 0...1), y: CGFloat.random(in: 0...1))
        }
        node.position = RoomRules.spawnPoint(in: roomBounds, radius: radius,
                                            pilot: pilot.position, candidates: candidates)
        node.alpha = 0.28
        let spawnRing = SKShapeNode(circleOfRadius: radius + 9)
        spawnRing.name = "spawnWarning"
        spawnRing.strokeColor = .systemOrange
        spawnRing.lineWidth = 3
        spawnRing.fillColor = .clear
        node.addChild(spawnRing)
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
        enemies.append(Enemy(node: node, health: enemyHP, maxHealth: enemyHP, healthBar: healthBar, speed: speed, reward: isBoss ? 250 : (type == 3 ? 20 : (type == 1 ? 12 : 6)), behavior: type, radius: radius, activeAt: combatTime + 0.9, weavePhase: CGFloat.random(in: 0...(2 * .pi)), nextAttack: combatTime + 1.7))
    }

    override func update(_ currentTime: TimeInterval) {
        if lastUpdate == 0 { lastUpdate = currentTime; clock = currentTime }
        let dt = min(0.05, max(0, currentTime - lastUpdate))
        let gameDt = dt * (fastForward ? 2.0 : 1.0)
        lastUpdate = currentTime
        clock += dt
        combatClock.advance(gameDt, playing: phase == .playing)
        if phase == .playing { collectXP() }
        guard phase == .playing || phase == .gate else { return }
        if let heldTouch, let movementOrigin {
            let point = heldTouch.location(in: self)
            let dx = point.x - movementOrigin.x
            let dy = point.y - movementOrigin.y
            let length = hypot(dx, dy)
            movementTarget = length > 9 ? CGPoint(x: min(max(pilot.position.x + dx / length * 90, roomBounds.minX), roomBounds.maxX), y: min(max(pilot.position.y + dy / length * 90, roomBounds.minY), roomBounds.maxY)) : nil
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
        // Lightweight movement animation: idle stance settles, moving stance tilts and bobs.
        let isMoving = movementTarget.map { distance($0, pilot.position) > 3 } ?? false
        let desiredTilt: CGFloat = isMoving ? (movementTarget!.x >= pilot.position.x ? -0.075 : 0.075) : 0
        pilot.zRotation += (desiredTilt - pilot.zRotation) * min(1, CGFloat(dt) * 10)
        pilot.yScale = isMoving ? 1 + 0.035 * sin(CGFloat(clock) * 17) : 1
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
        // Auto-fire only at active enemies; spawning enemies cannot deal or take damage.
        let reachable = enemies.filter { combatTime >= $0.activeAt && distance($0.node.position, pilot.position) <= autoFireRange }
        if let target = reachable.min(by: {
            distance($0.node.position, pilot.position) < distance($1.node.position, pilot.position)
        }) {
            shoot(at: target.node.position)
        }
        if presentPendingLevelUp(returningTo: .playing) { return }
        spawnClock += gameDt
        waveElapsed += gameDt
        applyBurns()
        if presentPendingLevelUp(returningTo: .playing) { return }
        let spawnInterval = max(0.42, 1.20 - Double(wave) * 0.032)
        if spawned < waveTarget && spawnClock >= spawnInterval {
            spawnClock -= spawnInterval
            spawned += 1
            spawnEnemy()
        }
        for index in enemies.indices.reversed() {
            let current = enemies[index].node.position
            let enemy = enemies[index]
            guard combatTime >= enemy.activeAt else { continue }
            enemy.node.alpha = 1
            enemy.node.childNode(withName: "spawnWarning")?.removeFromParent()
            let dx = pilot.position.x - current.x
            let dy = pilot.position.y - current.y
            let length = max(0.001, hypot(dx, dy))
            let ranged = enemy.behavior >= 4 || enemy.node === bossNode
            if ranged {
                updateRangedAttack(at: index)
            }
            let desiredRange: CGFloat = enemy.behavior == 5 ? 190 : 155
            let movement: CGFloat = ranged ? (length < desiredRange - 25 ? -0.55 : (length > desiredRange + 35 ? 0.55 : 0)) : 1
            let weave: CGFloat = enemy.behavior == 2 ? sin(CGFloat(waveElapsed) * 3.2 + enemy.weavePhase) * 0.6 : 0
            let heading = atan2(dy, dx) + weave
            let step = min(length, enemy.speed * CGFloat(gameDt)) * movement
            if enemies[index].shotTarget == nil {
                enemy.node.position = RoomRules.clamp(
                    CGPoint(x: current.x + cos(heading) * step, y: current.y + sin(heading) * step),
                    to: roomBounds.insetBy(dx: enemy.radius, dy: enemy.radius))
            }
            if distance(enemy.node.position, pilot.position) < enemy.radius + 14 {
                damagePilot(enemy.node === bossNode ? 12 : (enemy.behavior == 3 ? 8 : 5))
            }
        }
        updateHostileAttacks(delta: gameDt)
        if health == 0 { endGame(); return }
        if RoomRules.isCleared(spawned: spawned, target: waveTarget, living: enemies.count) {
            completeWave()
        }
    }

    private func damagePilot(_ amount: Int) {
        guard phase == .playing, combatTime >= pilotShieldUntil, health > 0 else { return }
        let actual = min(health, amount)
        health -= actual
        progress.recordDamage(actual)
        pilotShieldUntil = combatTime + 1.1
        pilotHitCount += 1
        damageFlash.removeAllActions()
        damageFlash.alpha = 0.7
        damageFlash.run(.fadeOut(withDuration: 0.32))
        pilot.removeAction(forKey: "hitFlash")
        pilot.run(.sequence([.fadeAlpha(to: 0.3, duration: 0.1), .fadeAlpha(to: 1, duration: 0.1),
                             .fadeAlpha(to: 0.3, duration: 0.1), .fadeAlpha(to: 1, duration: 0.1)]), withKey: "hitFlash")
        warning.removeAllActions()
        warning.fontColor = .systemRed
        warning.fontSize = 16
        warning.position = CGPoint(x: size.width / 2, y: roomBounds.minY + 90)
        warning.text = "PLAYER HIT!  -\(actual) HP"
        warning.alpha = 1
        warning.isHidden = false
        warning.run(.sequence([.wait(forDuration: 0.45), .fadeOut(withDuration: 0.4)]))
        updateHUD()
    }

    private func updateRangedAttack(at index: Int) {
        let enemy = enemies[index]
        if let target = enemy.shotTarget {
            guard combatTime >= enemy.fireAt else { return }
            enemy.node.childNode(withName: "aimLine")?.removeFromParent()
            fireProjectile(from: enemy.node.position, toward: target)
            enemies[index].shotTarget = nil
            enemies[index].nextAttack = combatTime + CombatRules.shooterCooldown(room: wave)
        } else if combatTime >= enemy.nextAttack {
            if enemy.behavior == 5 {
                launchLob(from: enemy.node.position, target: pilot.position)
                enemies[index].nextAttack = combatTime + CombatRules.lobberCooldown(room: wave)
            } else {
                // Lock the aim before firing so the player can sidestep it.
                enemies[index].shotTarget = pilot.position
                enemies[index].fireAt = combatTime + CombatRules.shooterTelegraph(room: wave)
                let aim = SKShapeNode()
                let path = CGMutablePath()
                path.move(to: .zero)
                path.addLine(to: CGPoint(x: pilot.position.x - enemy.node.position.x,
                                        y: pilot.position.y - enemy.node.position.y))
                aim.path = path
                aim.name = "aimLine"
                aim.strokeColor = .systemPink.withAlphaComponent(0.85)
                aim.lineWidth = 3
                aim.zPosition = 6
                enemy.node.addChild(aim)
                aim.run(.repeatForever(.sequence([
                    .fadeAlpha(to: 0.35, duration: 0.15),
                    .fadeAlpha(to: 1, duration: 0.15)
                ])))
                if enemy.node === bossNode { launchLob(from: enemy.node.position, target: pilot.position) }
            }
        }
    }

    private func fireProjectile(from origin: CGPoint, toward target: CGPoint) {
        let dx = target.x - origin.x
        let dy = target.y - origin.y
        let length = max(1, hypot(dx, dy))
        let node = SKShapeNode(circleOfRadius: 6)
        node.fillColor = .systemPink
        node.strokeColor = .white
        node.lineWidth = 2
        node.position = origin
        node.zPosition = 11
        arena.addChild(node)
        projectiles.append(Projectile(node: node, velocity: CGVector(dx: dx / length * 145, dy: dy / length * 145),
                                      expiresAt: combatTime + 6))
    }

    private func launchLob(from origin: CGPoint, target: CGPoint) {
        let radius: CGFloat = 43
        let marker = SKShapeNode(circleOfRadius: radius)
        marker.position = target
        marker.fillColor = .systemOrange.withAlphaComponent(0.18)
        marker.strokeColor = .systemOrange
        marker.lineWidth = 3
        marker.zPosition = 4
        marker.run(.repeatForever(.sequence([
            .group([.scale(to: 0.83, duration: 0.35), .fadeAlpha(to: 0.55, duration: 0.35)]),
            .group([.scale(to: 1, duration: 0.35), .fadeAlpha(to: 1, duration: 0.35)])
        ])))
        let cross = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        cross.text = "!"
        cross.fontColor = .systemOrange
        cross.fontSize = 25
        cross.verticalAlignmentMode = .center
        marker.addChild(cross)
        arena.addChild(marker)
        let shell = SKShapeNode(circleOfRadius: 8)
        shell.fillColor = .systemYellow
        shell.strokeColor = .white
        shell.position = origin
        shell.zPosition = 13
        arena.addChild(shell)
        lobs.append(Lob(marker: marker, shell: shell, origin: origin, target: target,
                        launchedAt: combatTime, impactAt: combatTime + 1.4, radius: radius))
    }

    private func updateHostileAttacks(delta: TimeInterval) {
        for index in projectiles.indices.reversed() {
            let shot = projectiles[index]
            let start = shot.node.position
            let end = CGPoint(x: start.x + shot.velocity.dx * CGFloat(delta),
                              y: start.y + shot.velocity.dy * CGFloat(delta))
            shot.node.position = end
            let hit = CombatRules.projectileHits(from: start, to: end, pilot: pilot.position, radius: 20)
            if hit { damagePilot(7) }
            if hit || combatTime >= shot.expiresAt || !roomBounds.insetBy(dx: -20, dy: -20).contains(end) {
                shot.node.removeFromParent()
                projectiles.remove(at: index)
            }
        }
        for index in lobs.indices.reversed() {
            let lob = lobs[index]
            let fraction = min(1, max(0, (combatTime - lob.launchedAt) / (lob.impactAt - lob.launchedAt)))
            let t = CGFloat(fraction)
            lob.shell.position = CGPoint(x: lob.origin.x + (lob.target.x - lob.origin.x) * t,
                                         y: lob.origin.y + (lob.target.y - lob.origin.y) * t + sin(t * .pi) * 55)
            lob.marker.alpha = 0.5 + 0.5 * t
            if combatTime >= lob.impactAt {
                if CombatRules.blastHits(center: lob.target, pilot: pilot.position, radius: lob.radius) { damagePilot(12) }
                impact(at: lob.target, color: .systemOrange, destroyed: true)
                lob.marker.removeFromParent()
                lob.shell.removeFromParent()
                lobs.remove(at: index)
            }
        }
    }

    private func clearHostileAttacks() {
        for shot in projectiles { shot.node.removeFromParent() }
        for lob in lobs { lob.marker.removeFromParent(); lob.shell.removeFromParent() }
        projectiles.removeAll()
        lobs.removeAll()
    }

    private func shoot(at point: CGPoint) {
        guard combatTime - lastShot >= 0.42 / Double(fireRate + permanentRateBonus) else { return }
        guard let index = enemies.indices.filter({ combatTime >= enemies[$0].activeAt }).min(by: {
            distance(enemies[$0].node.position, point) < distance(enemies[$1].node.position, point)
        }), distance(enemies[index].node.position, point) < 45 else { return }
        lastShot = combatTime
        let target = enemies[index].node.position
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
        // Brief enemy hit flash makes successful shots readable at normal game speed.
        let struckNode = enemies[index].node
        struckNode.removeAction(forKey: "enemyHitFeedback")
        struckNode.run(.sequence([
            .colorize(with: .white, colorBlendFactor: 0.85, duration: 0.045),
            .colorize(withColorBlendFactor: 0, duration: 0.14)
        ]), withKey: "enemyHitFeedback")
        if incendiaryLevel > 0 {
            burns[ObjectIdentifier(enemies[index].node)] = (damage: incendiaryLevel + permanentReactorBonus, until: combatTime + 2.5, nextTick: combatTime + 0.5)
        }
        if explosiveLevel > 0 {
            for other in enemies.indices where other != index && combatTime >= enemies[other].activeAt && distance(enemies[other].node.position, target) < CGFloat(35 + explosiveLevel * 15) {
                enemies[other].health -= max(1, damage * explosiveLevel / 3)
                if incendiaryLevel > 0 {
                    burns[ObjectIdentifier(enemies[other].node)] = (damage: incendiaryLevel, until: combatTime + 2.5, nextTick: combatTime + 0.5)
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
                .filter({ !visited.contains(ObjectIdentifier(enemies[$0].node)) && combatTime >= enemies[$0].activeAt && distance(enemies[$0].node.position, previous) <= 115 })
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
                burns[ObjectIdentifier(enemy.node)] = (damage: incendiaryLevel, until: combatTime + 2.5, nextTick: combatTime + 0.5)
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
            let xpAmount = enemies[index].node === bossNode ? 60 : (enemies[index].behavior >= 3 ? 10 : 6)
            // XP belongs to the kill immediately; it must not wait for a pickup or room clear.
            progress.earnXP(xpAmount)
            let xpLabel = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            xpLabel.text = "+\(xpAmount) XP"
            xpLabel.fontSize = 13
            xpLabel.fontColor = .cyan
            xpLabel.position = enemies[index].node.position
            xpLabel.zPosition = 14
            arena.addChild(xpLabel)
            xpLabel.run(.sequence([
                .group([.moveBy(x: 0, y: 25, duration: 0.55), .fadeOut(withDuration: 0.55)]),
                .removeFromParent()
            ]))
            burns.removeValue(forKey: ObjectIdentifier(enemies[index].node))
            if enemies[index].node === bossNode { bossNode = nil }
            // A short expanding defeat ring remains after the enemy disappears.
            let defeatedPosition = enemies[index].node.position
            let defeatRing = SKShapeNode(circleOfRadius: enemies[index].radius * 0.65)
            defeatRing.strokeColor = .systemYellow
            defeatRing.fillColor = .clear
            defeatRing.lineWidth = 3
            defeatRing.position = defeatedPosition
            defeatRing.zPosition = 11
            arena.addChild(defeatRing)
            defeatRing.run(.sequence([
                .group([.scale(to: 2.1, duration: 0.24), .fadeOut(withDuration: 0.24)]),
                .removeFromParent()
            ]))
            enemies[index].node.removeFromParent()
            enemies.remove(at: index)
        }
        // Pause for a level-up as soon as the earned XP crosses a threshold,
        // even when other enemies remain in the current room.
        if phase == .playing && progress.pendingChoices > 0 {
            updateHUD()
            _ = presentPendingLevelUp(returningTo: .playing)
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
            if combatTime >= burn.until { burns.removeValue(forKey: key); continue }
            if combatTime >= burn.nextTick {
                enemies[index].health -= burn.damage
                burn.nextTick = combatTime + 0.5
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

    private var repairCost: Int { 40 + wave * 8 }

    private func collectXP(collectAll: Bool = false) {
        for index in xpDrops.indices.reversed() {
            let drop = xpDrops[index]
            let distance = hypot(drop.node.position.x - pilot.position.x, drop.node.position.y - pilot.position.y)
            if collectAll || distance < 38 {
                progress.earnXP(drop.amount)
                drop.node.removeFromParent()
                xpDrops.remove(at: index)
            } else if distance < 100 {
                let fraction: CGFloat = 0.12
                drop.node.position.x += (pilot.position.x - drop.node.position.x) * fraction
                drop.node.position.y += (pilot.position.y - drop.node.position.y) * fraction
            }
        }
    }

    private func completeWave() {
        guard !roomCleared else { return }
        roomCleared = true
        clearHostileAttacks()
        coins += 12 + wave * 2
        collectXP(collectAll: true)
        progress.earnXP(6 + wave)
        let destination: Phase = wave == worldWaveCount ? .worldComplete : .gate
        if presentPendingLevelUp(returningTo: destination) { return }
        if destination == .worldComplete { completeWorld() } else { showZoneGate() }
    }

    @discardableResult
    private func presentPendingLevelUp(returningTo destination: Phase) -> Bool {
        guard progress.pendingChoices > 0 else { return false }
        levelUpReturnPhase = destination
        showLevelUp()
        return true
    }

    private func showLevelUp() {
        phase = .levelUp
        arena.isPaused = true
        lockMenuBriefly()
        clearOverlay()
        let choiceLevel = progress.level - progress.pendingChoices + 1
        overlayText("LEVEL \(choiceLevel)!", y: 125, fontSize: 28)
        overlayText("CHOOSE ONE FREE UPGRADE", y: 87, fontSize: 15)
        var pool = ["armor"]
        if fireRate < 5 { pool.append("rate") }
        if chainLevel < 3 { pool.append("chain") }
        if explosiveLevel < 3 { pool.append("explosive") }
        if incendiaryLevel < 3 { pool.append("incendiary") }
        if health < maximumHealth { pool.append("heal") }
        levelChoices = ["damage"] + Array(pool.shuffled().prefix(2))
        for (index, choice) in levelChoices.enumerated() {
            let label: String
            let detail: String
            switch choice {
            case "damage": label = "DAMAGE \(damage) → \(damage + 1)"; detail = "Stronger weapon hits"
            case "rate": label = "FIRE RATE \(fireRate) → \(fireRate + 1)"; detail = "Shoot more often"
            case "chain": label = "CHAIN LIGHTNING  LV \(chainLevel + 1)"; detail = "Hits additional nearby enemies"
            case "explosive": label = "EXPLOSIVE ROUNDS  LV \(explosiveLevel + 1)"; detail = "Weapon hits splash nearby enemies"
            case "incendiary": label = "INCENDIARY ROUNDS  LV \(incendiaryLevel + 1)"; detail = "Weapon hits inflict lasting burn damage"
            case "heal": label = "RECOVER 40 HP"; detail = "Restore health, up to your maximum"
            default: label = "ARMOR +20 MAX HP"; detail = "Raise maximum health and restore 20 HP"
            }
            let y = CGFloat(30 - index * 80)
            let cardWidth = min(size.width - 64, 324)
            let card = SKShapeNode(rect: CGRect(x: -cardWidth / 2, y: y - 48, width: cardWidth, height: 76), cornerRadius: 12)
            card.fillColor = index == 0 ? SKColor.systemOrange.withAlphaComponent(0.24) : SKColor.systemIndigo.withAlphaComponent(0.3)
            card.strokeColor = index == 0 ? .systemYellow : .systemCyan
            card.lineWidth = 2.5
            card.zPosition = 1
            overlay.addChild(card)
            let accent = SKShapeNode(rect: CGRect(x: -cardWidth / 2 + 7, y: y - 38, width: 4, height: 56), cornerRadius: 2)
            accent.fillColor = index == 0 ? .systemYellow : .systemCyan
            accent.strokeColor = .clear
            accent.zPosition = 2
            overlay.addChild(accent)
            overlayText(label, y: y + 6, fontSize: 15)
            overlayText(detail, y: y - 19, fontSize: 12)
            overlayButtons[choice] = CGRect(x: -cardWidth / 2, y: y - 48, width: cardWidth, height: 76)
        }
        overlayText("COMBAT PAUSED", y: -200, fontSize: 13)
        updateHUD()
    }

    private func chooseLevelUpgrade(_ choice: String) {
        guard phase == .levelUp, levelChoices.contains(choice), progress.chooseUpgrade() else { return }
        switch choice {
        case "damage": damage += 1
        case "rate": fireRate = min(5, fireRate + 1)
        case "chain": chainLevel = min(3, chainLevel + 1)
        case "explosive": explosiveLevel = min(3, explosiveLevel + 1)
        case "incendiary": incendiaryLevel = min(3, incendiaryLevel + 1)
        case "heal": health = min(maximumHealth, health + 40)
        default: runArmor += 20; health = min(maximumHealth, health + 20)
        }
        if progress.pendingChoices > 0 { showLevelUp(); return }
        arena.isPaused = false
        clearOverlay()
        overlayBackdrop.isHidden = true
        heldTouch = nil
        movementOrigin = nil
        movementTarget = nil
        switch levelUpReturnPhase {
        case .gate: showZoneGate()
        case .worldComplete: completeWorld()
        default:
            phase = .playing
            pilotShieldUntil = max(pilotShieldUntil, combatTime + 0.5)
            updateHUD()
        }
    }

    private func showCheckpoint() {
        guard phase == .gate, wave.isMultiple(of: 5), !checkpointUsed else { return }
        phase = .checkpoint
        arena.isPaused = true
        lockMenuBriefly()
        clearOverlay()
        overlayText("HEALING STATION", y: 75, fontSize: 23)
        overlayText("\(health)/\(maximumHealth) HP  •  \(coins) COINS", y: 35, fontSize: 17)
        actionButton("HEAL 40 HP  •  \(repairCost) COINS", key: "heal", y: -30, tint: .systemGreen,
                     enabled: health < maximumHealth && coins >= repairCost)
        actionButton("BACK TO EXIT", key: "back", y: -95, tint: .systemTeal)
        overlayText("ONE PURCHASE PER CHECKPOINT", y: -155, fontSize: 12)
    }

    private func showZoneGate() {
        guard RoomRules.isCleared(spawned: spawned, target: waveTarget, living: enemies.count) else { return }
        phase = .gate
        arena.isPaused = false
        heldTouch = nil
        movementOrigin = nil
        movementTarget = nil
        clearOverlay()
        overlayBackdrop.isHidden = true
        passageGate.isHidden = false
        passageGate.fillColor = .systemCyan
        (passageGate.children.first as? SKLabelNode)?.text = "ENTER"
        passageGate.childNode(withName: "gateArrow")?.isHidden = false
        passageGate.alpha = 1
        passageGate.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.position = CGPoint(x: 0, y: -40)
        passageGate.childNode(withName: "gateArrow")?.run(.repeatForever(.sequence([.moveBy(x: 0, y: 7, duration: 0.45), .moveBy(x: 0, y: -7, duration: 0.45)])))
        passageGate.run(.repeatForever(.sequence([.fadeAlpha(to: 0.5, duration: 0.65), .fadeAlpha(to: 1, duration: 0.65)])))
        warning.text = "ROOM CLEAR — EXIT OPEN"
        warning.fontColor = .systemGreen
        warning.fontSize = 13
        warning.position = CGPoint(x: passageGate.position.x, y: passageGate.position.y - 65)
        warning.removeAllActions()
        warning.alpha = 1
        warning.isHidden = false
        updateHUD()
    }

    private var lastWorldCoreReward = 0

    private func awardWorldCompletionCores(stars: Int) {
        guard !coreAwardedThisRun else { return }
        coreAwardedThisRun = true
        let previousBest = min(3, max(0, UserDefaults.standard.integer(forKey: "frontierForestStars")))
        let newBest = WorldCoreRewards.bestStars(previousBest: previousBest, completedStars: stars)
        lastWorldCoreReward = WorldCoreRewards.newlyEarned(previousBest: previousBest, completedStars: stars)
        UserDefaults.standard.set(newBest, forKey: "frontierForestStars")
        UserDefaults.standard.set(true, forKey: "frontierForestCoreClaimed")
        if lastWorldCoreReward > 0 {
            UserDefaults.standard.set(availableCores + lastWorldCoreReward, forKey: "powerCoresAvailable")
        }
    }

    private func completeWorld() {
        phase = .worldComplete
        ArcadeMusic.shared.play(.headquarters)
        lockMenuBriefly()
        clearOverlay()
        awardWorldCompletionCores(stars: progress.stars)
        UserDefaults.standard.set(true, forKey: "frontierForestComplete")
        showWorldCompleteSummary()
    }

    private func showWorldCompleteSummary() {
        hud.isHidden = true
        phase = .worldComplete
        ArcadeMusic.shared.play(.headquarters)
        lockMenuBriefly()
        clearOverlay()
        let stars = progress.stars
        overlayText("FRONTIER FOREST CLEARED", y: 85, fontSize: 21)
        overlayText("LEVEL \(progress.level)  •  \(progress.damageTaken) DAMAGE TAKEN", y: 40, fontSize: 16)
        // A prominent star display makes the permanent world reward legible.
        for index in 0..<3 {
            let star = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            star.text = index < stars ? "★" : "☆"
            star.fontSize = 35
            star.fontColor = index < stars ? .systemYellow : .lightGray
            star.position = CGPoint(x: CGFloat(index - 1) * 51, y: -11)
            star.zPosition = 3
            overlay.addChild(star)
        }
        overlayText("PLAYER \(health) HP", y: -30, fontSize: 13)
        if lastWorldCoreReward > 0 {
            let core = SKShapeNode(circleOfRadius: 13)
            core.fillColor = .systemCyan
            core.strokeColor = .white
            core.lineWidth = 2
            core.glowWidth = 5
            core.position = CGPoint(x: -105, y: -76)
            core.zPosition = 3
            overlay.addChild(core)
            overlayText("NEW REWARD: +\\(lastWorldCoreReward) CORES", y: -81, fontSize: 14)
        } else {
            overlayText("NO NEW CORES — EARN MORE STARS", y: -75, fontSize: 12)
        }
        overlayText("AVAILABLE POWER CORES: \(availableCores)", y: -48, fontSize: 15)
        actionButton("RESTORE CHARACTER", key: "restore", y: -105, tint: .systemIndigo)
        actionButton("PLAY AGAIN", key: "restart", y: -160, tint: .systemTeal)
    }

    private func showRestoration() {
        hud.isHidden = true
        if phase != .restoration { restorationReturnPhase = phase }
        phase = .restoration
        ArcadeMusic.shared.play(.headquarters)
        lockMenuBriefly()
        clearOverlay()
        let total = (0..<coreBranches.count).reduce(0) { $0 + branchLevel($1) }
        overlayText("CHARACTER RESTORATION", y: 160, fontSize: 20)
        overlayText("\(total)/50 RESTORED  •  \(availableCores) CORES AVAILABLE", y: 124, fontSize: 14)
        let effects = ["Weapons: +1 damage every 3 cores", "Reactor: stronger combat abilities", "Armor: +2 player HP per core", "Mobility: +3 move speed per core", "Systems: extra chain targets every 4 cores"]
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
        arena.isPaused = true
        clearHostileAttacks()
        ArcadeMusic.shared.play(.headquarters)
        heldTouch = nil
        aimPoint = nil
        lockMenuBriefly()
        clearOverlay()
        let best = max(wave, UserDefaults.standard.integer(forKey: "bestWave"))
        UserDefaults.standard.set(best, forKey: "bestWave")
        overlayText("PILOT DEFEATED", y: 55)
        overlayText("Room \(wave)  •  Best \(best)", y: 10, fontSize: 18)
        actionButton("RESTART", key: "restart", y: -55, tint: .systemTeal)
    }

    private func restart() {
        for drop in xpDrops { drop.node.removeFromParent() }
        xpDrops.removeAll()
        for enemy in enemies { enemy.node.removeFromParent() }
        enemies.removeAll()
        bossNode = nil
        wave = 0
        progress = RunProgress()
        combatClock = CombatClock()
        runArmor = 0
        roomCleared = false
        checkpointUsed = false
        clearHostileAttacks()
        arena.isPaused = false
        coreAwardedThisRun = false
        lastWorldCoreReward = 0
        passageGate.isHidden = true
        warning.isHidden = true
        zoneBanner.removeAllActions()
        zoneBanner.alpha = 0
        backgroundColor = zoneColors[0]
        updateZoneScenery(0)
        pilot.position = entryPoint
        movementTarget = nil
        movementOrigin = nil
        pilotShieldUntil = 0
        pilotHitCount = 0
        pilot.alpha = 1
        pilot.removeAction(forKey: "hitFlash")
        passageGate.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.position = CGPoint(x: 0, y: -40)
        passageGate.alpha = 1
        gateUnlocked = false
        fastForward = false
        coins = 0
        health = maximumHealth
        damage = 1
        fireRate = 1
        chainLevel = 0
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
            if phase == .gate && !checkpointButton.isHidden && checkpointButton.contains(touch.location(in: hud)) {
                showCheckpoint()
                return
            }
            if qaFastForwardEnabled && phase == .playing && speedButton.contains(touch.location(in: hud)) {
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
        if phase == .ready {
            worldMapSwipeStart = point
            worldMapSwipeMoved = false
        }
        menuNeedsFreshTouch = false
        let local = touch.location(in: overlay)
        let tapped = overlayButtons.first(where: { $0.value.contains(local) })?.key
        switch (phase, tapped) {
        case (.ready, "start") where worldMapIndex == 0: startWave()
        case (.ready, "world_prev"):
            worldMapIndex = max(0, worldMapIndex - 1)
            showReady()
        case (.ready, "world_next"):
            worldMapIndex = min(worldMapNames.count - 1, worldMapIndex + 1)
            showReady()
        case (.ready, "music"):
            ArcadeMusic.shared.toggle()
            showReady()
        case (.ready, "restore"), (.worldComplete, "restore"): showRestoration()
        case (.restoration, "back"):
            if restorationReturnPhase == .worldComplete { showWorldCompleteSummary() }
            else { showReady() }
        case (.restoration, let key?) where key.hasPrefix("branch_"):
            if let index = Int(key.dropFirst(7)) { investCore(index) }
        case (.gameOver, "restart"), (.worldComplete, "restart"): restart()
        case (.levelUp, let choice?): chooseLevelUpgrade(choice)
        case (.checkpoint, "heal") where !checkpointUsed && health < maximumHealth && coins >= repairCost:
            coins -= repairCost
            health = min(maximumHealth, health + 40)
            checkpointUsed = true
            showZoneGate()
        case (.checkpoint, "back"): showZoneGate()
        default: break
        }
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        if phase == .ready, let start = worldMapSwipeStart, let touch = touches.first {
            if abs(touch.location(in: self).x - start.x) > 30 { worldMapSwipeMoved = true }
        }
        if (phase == .playing || phase == .gate), let heldTouch, touches.contains(heldTouch) {
            let point = heldTouch.location(in: self)
            if let movementOrigin {
                let dx = point.x - movementOrigin.x
                let dy = point.y - movementOrigin.y
                let length = hypot(dx, dy)
                if length > 9 {
                    let directionX = dx / length
                    let directionY = dy / length
                    movementTarget = CGPoint(x: min(max(pilot.position.x + directionX * 90, roomBounds.minX), roomBounds.maxX), y: min(max(pilot.position.y + directionY * 90, roomBounds.minY), roomBounds.maxY))
                } else { movementTarget = nil }
            }
        }
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        if phase == .ready, let start = worldMapSwipeStart, let touch = touches.first {
            let dx = touch.location(in: self).x - start.x
            if abs(dx) > 65 {
                worldMapIndex = min(worldMapNames.count - 1, max(0, worldMapIndex + (dx < 0 ? 1 : -1)))
                showReady()
            }
        }
        worldMapSwipeStart = nil
        worldMapSwipeMoved = false
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
            movementOrigin = nil
            movementTarget = nil
            aimPoint = nil
        }
        awaitingMenuRelease = false
        menuNeedsFreshTouch = false
    }

}
