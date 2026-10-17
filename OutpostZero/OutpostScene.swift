import SpriteKit

final class OutpostScene: SKScene {
    private enum Phase { case ready, headquarters, gearBay, abilityLab, loadout, playing, levelUp, checkpoint, gate, settings, interrupted, worldComplete, restoration, gameOver }
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
    private var selectedWorld: WorldInfo { WorldCatalog.info(worldMapIndex) }
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
    private let extractionPortal = SKShapeNode(circleOfRadius: 43)
    private let zoneBanner = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let controlsHint = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let zoneScenery = SKNode()
    private let hazardScenery = SKNode()
    // Cache only toxic pool nodes, and only repaint when the hazard phase
    // actually changes. Water-only rooms require no acid work per frame.
    private var acidVisualNodes: [SKShapeNode] = []
    private var displayedAcidActive: Bool?
    private var roomHazards: [TerrainHazards.Patch] = []
    private var nextAcidDamageAt: TimeInterval = 0
    private var enemyAcidDamageAt: [ObjectIdentifier: TimeInterval] = [:]
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
    private let permanent = PersistentProgression()
    private let recovery = RunRecoveryStore()
    private var salvageBankedThisRun = 0
    private var roomSalvageEarned = 0
    private var roomSalvageRecoveredCredit = 0
    private var roomCoinsEarned = 0
    private var roomCoinsRecoveredCredit = 0
    private var roomXPEarned = 0
    private var roomXPRecoveredCredit = 0
    private var isRestoringRun = false
    private var nextRunSaveAt: TimeInterval = 0
    private var discardRunArmed = false
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
    private var draftLoadout = AbilityLoadout()
    // Simulator QA scenes bypass menus, so their deterministic default uses
    // only existing skills. Normal gameplay locks the user's exact selection.
    private var lockedLoadout = AbilityLoadout.simulatorDefault
    private var orbitLevel = 0
    private var orbitalNodes: [SKShapeNode] = []
    private var lastOrbitalHit: [ObjectIdentifier: TimeInterval] = [:]
    private var nextBladeArcAt: TimeInterval = 0
    private var checkpointUsed = false
    private var checkpointPresented = false
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
    private let settingsShortcut = SKShapeNode(rectOf: CGSize(width: 44, height: 42), cornerRadius: 10)
    private var settingsReturnPhase: Phase = .ready
    private var interruptedReturnPhase: Phase = .playing
    private let overlayBackdrop = SKShapeNode()
    private var overlayButtons: [String: CGRect] = [:]
    private var streak = 0
    private var waveElapsed: TimeInterval = 0
    // A real player setting: never hide this behind a QA launch argument.
    // Remember the selected pace between runs and application launches.
    private var fastForward = UserDefaults.standard.bool(forKey: "outpostZeroDoubleSpeed")
    private let speedButton = SKShapeNode(rectOf: CGSize(width: 72, height: 34), cornerRadius: 9)
    private let speedLabel = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private var menuUnlockTime: TimeInterval = 0
    private var menuNeedsFreshTouch = false
    private var heldTouch: UITouch?
    private var aimPoint: CGPoint?
    private let pilot = SKShapeNode(rectOf: CGSize(width: 28, height: 34), cornerRadius: 7)
    private let pilotGun = SKShapeNode(rectOf: CGSize(width: 9, height: 23), cornerRadius: 3)
    private var pilotFacing: CGFloat = 1
    private var nextFootstepAt: TimeInterval = 0
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
    private let worldWaveCount = CampaignPacing.roomsPerWorld
    private let coreBranches = ["WEAPONS", "REACTOR", "ARMOR", "MOBILITY", "SYSTEMS"]
    private var availableCores: Int { UserDefaults.standard.integer(forKey: "powerCoresAvailable") }
    private func branchLevel(_ index: Int) -> Int {
        UserDefaults.standard.integer(forKey: "coreBranch_\(index)")
    }
    private var permanentDamageBonus: Int { branchLevel(0) / 3 }
    private var permanentArmorBonus: Int { branchLevel(2) * 2 }
    private var gearWeaponBonus: Int { permanent.rank("weapon") }
    private var gearReactorBonus: Int { permanent.rank("reactor") }
    private var maximumHealth: Int { 100 + permanentArmorBonus + permanent.rank("armor") * 15 + runArmor }
    private var permanentRateBonus: Int { branchLevel(3) / 4 }
    private var permanentReactorBonus: Int { branchLevel(1) / 3 }
    private var permanentSystemsBonus: Int { branchLevel(4) / 4 }
    private var chosenAbilities: Int { [chainLevel, explosiveLevel, incendiaryLevel].filter { $0 > 0 }.count }
    private var awaitingMenuRelease = false
    private let damageFlash = SKShapeNode()
    private let warning = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let arena = SKNode()
    // First validate three camera positions in isolated simulator captures.
    // Enabling live survival mode waits for encounter/recovery integration.
    private var expandedArenaPreview = false
    // Live survival spawning is first exercised through the simulator QA
    // fixture. Normal campaign progression stays tactical until extraction
    // and save recovery are implemented and validated together.
    private var activeEncounter: SurvivalEncounterRules.Kind = .tactical
    private var survivalSpawnPhaseFinished = false
    private var roomBounds: CGRect {
        expandedArenaPreview ? ArenaLayout.bounds(for: size) : RoomRules.bounds(for: size)
    }
    private var entryPoint: CGPoint {
        expandedArenaPreview
            ? CGPoint(x: roomBounds.midX, y: roomBounds.minY + 48)
            : RoomRules.entryPoint(for: size)
    }
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
        speedLabel.fontSize = 12
        speedLabel.fontColor = .white
        speedLabel.verticalAlignmentMode = .center
        speedLabel.text = "1× SPEED"
        speedButton.addChild(speedLabel)
        hud.addChild(speedButton)
        xpTrack.fillColor = SKColor(red: 0.04, green: 0.10, blue: 0.12, alpha: 0.96)
        xpTrack.strokeColor = .clear
        xpFill.fillColor = SKColor(red: 0.38, green: 0.85, blue: 0.68, alpha: 1)
        xpFill.strokeColor = .clear
        xpFill.zPosition = 1
        hud.addChild(xpTrack)
        hud.addChild(xpFill)
        xpLabel.fontSize = 10
        xpLabel.fontColor = SKColor(white: 0.86, alpha: 1)
        xpLabel.horizontalAlignmentMode = .right
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
        hudPanel.fillColor = SKColor(red: 0.035, green: 0.08, blue: 0.11, alpha: 0.91)
        hudPanel.strokeColor = SKColor(red: 0.27, green: 0.51, blue: 0.54, alpha: 0.29)
        hudPanel.lineWidth = 1
        hudPanel.zPosition = -1
        hud.addChild(hudPanel)
        addChild(overlay)
        overlay.zPosition = 40
        settingsShortcut.name = "settingsShortcut"
        settingsShortcut.fillColor = SKColor(red: 0.07, green: 0.16, blue: 0.23, alpha: 0.95)
        settingsShortcut.strokeColor = .systemTeal
        settingsShortcut.lineWidth = 1.5
        settingsShortcut.zPosition = 50
        let settingsIcon = SKLabelNode(fontNamed: "HelveticaNeue-Bold")
        settingsIcon.text = "⚙"
        settingsIcon.fontSize = 29
        settingsIcon.fontColor = .white
        settingsIcon.verticalAlignmentMode = .center
        settingsShortcut.addChild(settingsIcon)
        addChild(settingsShortcut)
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
        // Visual scale only: give the hero enough screen presence to read
        // its face, shoulder plates and reactor at normal phone size.
        // The 28x34 collision container and movement physics do not change.
        pilotArmor.size = CGSize(width: 53, height: 63)
        pilotArmor.zPosition = 0.5
        pilotArmor.name = "pilotArt"
        pilot.addChild(pilotArmor)
        // Ground contact and a soft offset shadow give the pilot depth at phone scale.
        let pilotShadow = SKShapeNode(ellipseOf: CGSize(width: 43, height: 13))
        pilotShadow.fillColor = SKColor.black.withAlphaComponent(0.42)
        pilotShadow.strokeColor = .clear
        pilotShadow.position = CGPoint(x: 4, y: -27)
        pilotShadow.name = "pilotGroundShadow"
        pilotShadow.zPosition = -0.6
        pilot.addChild(pilotShadow)
        // A soft reflected patch differentiates blue-white armor from the
        // olive forest floor. No bright selection ring or collision marker.
        let armorBounce = SKShapeNode(ellipseOf: CGSize(width: 30, height: 8))
        armorBounce.name = "pilotArmorBounce"
        armorBounce.position = CGPoint(x: -3, y: -26)
        armorBounce.fillColor = SKColor(
            red: 0.31, green: 0.71, blue: 0.83, alpha: 0.16)
        armorBounce.strokeColor = .clear
        armorBounce.zPosition = -0.45
        pilot.addChild(armorBounce)
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
            for child in pilot.children where child is SKShapeNode &&
                    child !== pilotGun && child !== visor &&
                    child !== reactor && child.name != "pilotGroundShadow" &&
                    child.name != "pilotArmorBounce" {
                child.isHidden = true
            }
        }
        arena.addChild(zoneScenery)
        zoneScenery.zPosition = -1
        arena.addChild(hazardScenery)
        hazardScenery.zPosition = -0.6
        arena.addChild(pilot)
        refreshPilotAppearance()
        passageGate.fillColor = SKColor(red: 0.07, green: 0.12, blue: 0.17, alpha: 1)
        passageGate.strokeColor = .systemCyan
        passageGate.lineWidth = 4
        passageGate.zPosition = 3
        passageGate.isHidden = true
        arena.addChild(passageGate)
        let gateText = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        gateText.text = "ENTER"
        gateText.fontSize = 13
        gateText.fontColor = .white
        gateText.verticalAlignmentMode = .center
        gateText.zPosition = 4
        passageGate.addChild(gateText)
        // Illustrated structural details make this an in-world doorway,
        // not a floating rectangular menu button.
        let portalWindow = SKShapeNode(rectOf: CGSize(width: 76, height: 33), cornerRadius: 8)
        portalWindow.fillColor = SKColor(red: 0.06, green: 0.23, blue: 0.33, alpha: 1)
        portalWindow.strokeColor = .systemCyan
        portalWindow.lineWidth = 1.5
        portalWindow.zPosition = 0.5
        passageGate.addChild(portalWindow)
        let portalEnergy = SKShapeNode(rectOf: CGSize(width: 62, height: 21), cornerRadius: 7)
        portalEnergy.name = "portalEnergy"
        portalEnergy.fillColor = SKColor(red: 0.19, green: 0.76, blue: 0.88, alpha: 0.48)
        portalEnergy.strokeColor = .clear
        portalEnergy.zPosition = 1
        passageGate.addChild(portalEnergy)
        for side: CGFloat in [-1, 1] {
            let pylon = SKShapeNode(rectOf: CGSize(width: 12, height: 67), cornerRadius: 3)
            pylon.position = CGPoint(x: side * 52, y: 0)
            pylon.fillColor = SKColor(red: 0.19, green: 0.28, blue: 0.36, alpha: 1)
            pylon.strokeColor = .systemTeal
            pylon.lineWidth = 2
            pylon.zPosition = 3
            passageGate.addChild(pylon)
            let indicator = SKShapeNode(rectOf: CGSize(width: 4, height: 17), cornerRadius: 1)
            indicator.fillColor = .systemCyan
            indicator.strokeColor = .clear
            indicator.position.y = 4
            pylon.addChild(indicator)
        }
        let lintel = SKShapeNode(rectOf: CGSize(width: 115, height: 10), cornerRadius: 3)
        lintel.position.y = 32
        lintel.fillColor = SKColor(red: 0.23, green: 0.33, blue: 0.39, alpha: 1)
        lintel.strokeColor = .systemTeal
        lintel.lineWidth = 2
        lintel.zPosition = 3
        passageGate.addChild(lintel)
        let threshold = SKShapeNode(rectOf: CGSize(width: 116, height: 9), cornerRadius: 3)
        threshold.position.y = -31
        threshold.fillColor = SKColor(red: 0.21, green: 0.31, blue: 0.36, alpha: 1)
        threshold.strokeColor = .systemTeal
        threshold.lineWidth = 1.5
        threshold.zPosition = 3
        passageGate.addChild(threshold)
        let gateArrow = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        gateArrow.text = "▲"
        gateArrow.fontSize = 22
        gateArrow.fontColor = .systemCyan
        gateArrow.position = CGPoint(x: 0, y: -40)
        gateArrow.name = "gateArrow"
        passageGate.addChild(gateArrow)
        // Round, luminous evacuation pad is intentionally separate from
        // the metal combat door. Color highlights vary by world.
        extractionPortal.name = "extractionPortal"
        extractionPortal.fillColor = SKColor(red: 0.025, green: 0.07, blue: 0.20, alpha: 0.97)
        extractionPortal.strokeColor = .systemCyan
        extractionPortal.lineWidth = 7
        extractionPortal.zPosition = 6
        extractionPortal.isHidden = true
        let innerRing = SKShapeNode(circleOfRadius: 29)
        innerRing.name = "extractionRing"
        innerRing.fillColor = SKColor(red: 0.06, green: 0.24, blue: 0.44, alpha: 0.90)
        innerRing.strokeColor = SKColor(red: 0.58, green: 0.91, blue: 1, alpha: 0.88)
        innerRing.lineWidth = 3
        extractionPortal.addChild(innerRing)
        let core = SKShapeNode(circleOfRadius: 14)
        core.name = "extractionCore"
        core.fillColor = SKColor(red: 0.10, green: 0.66, blue: 0.98, alpha: 0.85)
        core.strokeColor = .white
        core.lineWidth = 1.5
        core.glowWidth = 4
        core.zPosition = 2
        extractionPortal.addChild(core)
        let exitGlyph = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        exitGlyph.text = "EXIT"
        exitGlyph.fontColor = .white
        exitGlyph.fontSize = 12
        exitGlyph.verticalAlignmentMode = .center
        exitGlyph.zPosition = 3
        extractionPortal.addChild(exitGlyph)
        for index in 0..<4 {
            let angle = CGFloat(index) * .pi / 2 + .pi / 4
            let beacon = SKShapeNode(circleOfRadius: 4.5)
            beacon.position = CGPoint(x: cos(angle) * 36, y: sin(angle) * 36)
            beacon.fillColor = index.isMultiple(of: 2) ? .systemOrange : .systemCyan
            beacon.strokeColor = .white
            beacon.lineWidth = 1
            beacon.zPosition = 3
            extractionPortal.addChild(beacon)
        }
        arena.addChild(extractionPortal)
        zoneBanner.fontSize = 20
        zoneBanner.fontColor = .white
        zoneBanner.zPosition = 18
        zoneBanner.alpha = 0
        hud.addChild(zoneBanner)
        controlsHint.text = "DRAG TO MOVE  •  AUTO-FIRE"
        controlsHint.fontSize = 12
        controlsHint.fontColor = .white
        controlsHint.zPosition = 19
        controlsHint.isHidden = true
        hud.addChild(controlsHint)
        for label in [title, subtitle, info] {
            label.horizontalAlignmentMode = .center
            hud.addChild(label)
        }
        title.fontSize = 18
        title.fontColor = .white
        subtitle.fontSize = 12
        subtitle.fontColor = SKColor(red: 0.98, green: 0.78, blue: 0.37, alpha: 1)
        info.fontSize = 11
        info.fontColor = .white
        health = maximumHealth
        layout()
        showReady()
        // CI-only settings and lifecycle integration: a call must pause
        // hostile attacks, and resuming must require deliberate input.
        if ProcessInfo.processInfo.arguments.contains("-captureRecoveryScreenshot") {
            // Simulator QA verifies the player-facing recovery route. The
            // isolated capture device has no real-world save to overwrite.
            let snapshot = RunSnapshot(
                version: RunSnapshot.schema, worldIndex: 0,
                room: 12, location: .battle,
                health: 21, coins: 1506, damage: 4, fireRate: 3,
                chainLevel: 1, explosiveLevel: 0, incendiaryLevel: 1,
                orbitLevel: 2, runArmor: 20, checkpointUsed: false,
                checkpointPresented: false,
                progress: RunProgress(), abilities: ["chain", "orbit", "incendiary"],
                earnedSalvage: 290, roomSalvageCredit: 24,
                roomCoinCredit: 75, roomXPCredit: 68)
            precondition(recovery.save(snapshot))
            showReady()
            precondition(overlayButtons["recover_run"] != nil,
                         "Saved runs must be visible on the world map")
            recoverSavedRun()
            precondition(wave == 12 && health == 21 && coins == 1506 &&
                         phase == .interrupted && arena.isPaused &&
                         lockedLoadout.contains("orbit") && runArmor == 20,
                         "Recovery must preserve loadout, stats and room")
            // Avoid leaving a QA fixture in the simulator defaults.
            recovery.clear()
            let laterWorld = RunSnapshot(
                version: RunSnapshot.schema, worldIndex: 2,
                room: 12, location: .battle,
                health: 24, coins: 406, damage: 4, fireRate: 2,
                chainLevel: 1, explosiveLevel: 0, incendiaryLevel: 1,
                orbitLevel: 1, runArmor: 20, checkpointUsed: false,
                checkpointPresented: false,
                progress: RunProgress(), abilities: ["chain", "orbit", "incendiary"],
                earnedSalvage: 140, roomSalvageCredit: 18,
                roomCoinCredit: 32, roomXPCredit: 40)
            precondition(recovery.save(laterWorld))
            worldMapIndex = 0
            showReady()
            precondition(overlayButtons["recover_run"] != nil,
                         "Any selected world must offer the existing saved run")
            recoverSavedRun()
            precondition(worldMapIndex == 2 && wave == 12 &&
                         phase == .interrupted && health == 24,
                         "Resume must reopen the actual world, not the selected map card")
            recovery.clear()
            showReady()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureHeadquartersScreenshot") {
            showHeadquarters()
            precondition(overlayButtons["gear_bay"] != nil &&
                         overlayButtons["ability_lab"] != nil,
                         "Headquarters must expose both permanent upgrade areas")
            showGearBay()
            precondition(phase == .gearBay && overlayButtons["hq_back"] != nil,
                         "Gear Bay must be reachable and have a way out")
            showAbilityLab()
            precondition(phase == .abilityLab && overlayButtons["hq_back"] != nil,
                         "Ability Lab must be reachable and have a way out")
            showHeadquarters()
        }
        if ProcessInfo.processInfo.arguments.contains("-capturePausedRunScreenshot") {
            startWave()
            setAppActive(false)
            precondition(phase == .interrupted && arena.isPaused &&
                         overlayButtons["resume_run"] != nil,
                         "Interruption must display tappable RESUME RUN")
        }
        if ProcessInfo.processInfo.arguments.contains("-captureSettingsScreenshot") {
            startWave()
            setAppActive(false)
            precondition(phase == .interrupted && arena.isPaused &&
                         overlayButtons["resume_run"] != nil,
                         "Backgrounding must freeze combat until resume")
            resumeInterruptedRun()
            precondition(phase == .playing && !arena.isPaused &&
                         combatTime < pilotShieldUntil,
                         "Resuming must protect the pilot and restart combat")
            showSettings()
            precondition(phase == .settings && arena.isPaused &&
                         overlayButtons["toggle_music"] != nil &&
                         overlayButtons["toggle_speed"] != nil &&
                         overlayButtons["close_settings"] != nil,
                         "Settings must provide both audio and gameplay speed")
            let originalSpeed = fastForward
            toggleSpeedPreference()
            precondition(fastForward != originalSpeed, "Speed toggle must change gameplay pace")
            toggleSpeedPreference()
            precondition(fastForward == originalSpeed, "Speed toggle must support restoring pace")
            showSettings()
        }
        // Capture the new world-entry loadout and verify the real lock route.
        // Screenshots show a complete selection, not empty prototype buttons.
        if ProcessInfo.processInfo.arguments.contains("-captureLoadoutScreenshot") {
            draftLoadout = AbilityLoadout(selected: ["chain", "incendiary", "orbit"])
            showLoadout()
            precondition(draftLoadout.isReady &&
                         overlayButtons["pick_explosive"] == nil &&
                         overlayButtons["lock_loadout"] != nil,
                         "Three selected abilities must unlock entry and disable a fourth")
            precondition(enterSelectedWorld() && wave == 1 &&
                         lockedLoadout.contains("orbit") &&
                         !lockedLoadout.contains("explosive"),
                         "Entering a world must lock exactly the selected abilities")
            showLoadout()
        }
        // Expanded arena camera QA: three independently captured positions.
        // Not yet a shipped timed-survival encounter. Validate full arena
        // coverage, HUD anchoring, and distinct scenery in each viewport.
        let cameraFlags = [
            "-captureExpandedArenaLeftScreenshot",
            "-captureExpandedArenaCenterScreenshot",
            "-captureExpandedArenaRightScreenshot"
        ]
        if let slot = cameraFlags.firstIndex(where: {
            ProcessInfo.processInfo.arguments.contains($0)
        }) {
            expandedArenaPreview = true
            worldMapIndex = 0
            gateUnlocked = true
            startWave()
            precondition(roomBounds.width > RoomRules.bounds(for: size).width &&
                         roomBounds.height > RoomRules.bounds(for: size).height,
                         "Survival field must be larger than a traditional room")
            installArenaPreviewGround()
            let fractions: [CGFloat] = [0.10, 0.50, 0.90]
            pilot.position = CGPoint(
                x: roomBounds.minX + roomBounds.width * fractions[slot],
                y: roomBounds.minY + roomBounds.height * (slot == 1 ? 0.68 : 0.48))
            let expected = ArenaLayout.offset(for: pilot.position,
                                               viewportSize: size)
            arena.position = expected
            let visible = ArenaLayout.visibleWorldRect(
                at: arena.position, viewportSize: size)
            // Rectangular boundary arithmetic has floating-point rounding:
            // an exact shoreline camera clamp may be a subpixel outside
            // CGRect.contains. Use a one-point rendering tolerance; strict
            // geometry is already checked by deterministic unit tests.
            precondition(roomBounds.insetBy(dx: -1, dy: -1).contains(visible) &&
                         abs(pilot.position.x + arena.position.x -
                             size.width / 2) < size.width * 0.41,
                         "Camera must show the pilot and keep world edges covered")
            for kind in [0, 2, 4, 1, 3] {
                spawned += 1
                spawnEnemy(artReviewType: kind)
            }
            for enemy in enemies {
                enemy.node.removeAllActions()
                enemy.node.alpha = 1
                enemy.node.childNode(withName: "spawnWarning")?.isHidden = true
            }
            // A small QA-only viewport marker certifies which capture
            // actually launched; the simulator home screen or stale previous
            // game scene must never pass as an arena screenshot.
            let qaMarker = SKShapeNode(rectOf: CGSize(width: 26, height: 26))
            qaMarker.name = "arenaCaptureIdentity"
            let markerColors: [SKColor] = [
                SKColor(red: 1, green: 0, blue: 0, alpha: 1),
                SKColor(red: 0, green: 1, blue: 0, alpha: 1),
                SKColor(red: 0, green: 0, blue: 1, alpha: 1)
            ]
            qaMarker.fillColor = markerColors[slot]
            qaMarker.strokeColor = .white
            qaMarker.lineWidth = 2
            qaMarker.zPosition = 65
            qaMarker.position = CGPoint(x: size.width * 0.90,
                                        y: size.height * 0.60)
            hud.addChild(qaMarker)
            zoneBanner.removeAllActions()
            zoneBanner.text = ["WESTERN APPROACH",
                               "CENTRAL FRONT",
                               "EASTERN FLANK"][slot]
            // World banners must never obscure the middle of a large fight.
            zoneBanner.position = CGPoint(x: size.width / 2,
                                           y: size.height - 216)
            zoneBanner.fontSize = 13
            zoneBanner.alpha = 1
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureSurvivalSwarmFrames") {
            expandedArenaPreview = true
            worldMapIndex = 0
            wave = 5
            gateUnlocked = true
            startWave()  // Room 6: same encounter entry path as real gameplay.
            activeEncounter = .survival
            installArenaPreviewGround()
            pilot.position = CGPoint(x: roomBounds.midX,
                                      y: roomBounds.midY - roomBounds.height * 0.13)
            arena.position = ArenaLayout.offset(for: pilot.position,
                                                 viewportSize: size)
            // Prime the battlefield with actual enemy objects before the
            // continuous spawn loop takes over. No extra art-only sprites.
            for index in 0..<9 {
                spawned += 1
                spawnEnemy(artReviewType: SurvivalEncounterRules.swarmType(
                    room: wave, slot: index))
                if let enemy = enemies.last {
                    let x = CGFloat(index % 3 - 1) * 76
                    let y = CGFloat(index / 3 - 1) * 83
                    enemy.node.position = CGPoint(
                        x: pilot.position.x + x,
                        y: pilot.position.y + y + 130)
                }
            }
            let marker = SKShapeNode(rectOf: CGSize(width: 26, height: 26))
            marker.name = "survivalQAIdentity"
            marker.fillColor = SKColor(red: 1, green: 0, blue: 1, alpha: 1)
            marker.strokeColor = .white
            marker.lineWidth = 2
            marker.zPosition = 65
            marker.position = CGPoint(x: size.width * 0.90,
                                      y: size.height * 0.60)
            hud.addChild(marker)
            pilotShieldUntil = combatTime + 120
            // Running combat and tracking camera: CI captures actual frames
            // and verifies changed images instead of a posed static menu.
            zoneBanner.text = "SWARM ASSAULT"
            zoneBanner.position = CGPoint(x: size.width / 2,
                                           y: size.height - 216)
            zoneBanner.fontSize = 13
            zoneBanner.alpha = 1
            phase = .playing
            arena.isPaused = false
            updateHUD()
        }
        // Fixture exercises actual production entry and timer completion,
        // rather than a mock drawing of an extraction portal.
        if ProcessInfo.processInfo.arguments.contains(
            "-captureSurvivalExtractionScreenshot") {
            worldMapIndex = 0
            wave = 5
            gateUnlocked = true
            startWave()
            precondition(activeEncounter == .survival && expandedArenaPreview,
                         "World 1 Room 6 must launch a playable timed arena")
            for index in 0..<5 {
                spawned += 1
                spawnEnemy(artReviewType: SurvivalEncounterRules.swarmType(
                    room: wave, slot: index))
            }
            let living = enemies.count
            waveElapsed = SurvivalEncounterRules.duration(
                world: worldMapIndex, room: wave)
            precondition(SurvivalEncounterRules.extractionCanOpen(
                world: worldMapIndex, room: wave, elapsed: waveElapsed,
                livingEnemies: living))
            completeWave()
            precondition(roomCleared && phase == .gate &&
                         enemies.count == living &&
                         !extractionPortal.isHidden && passageGate.isHidden &&
                         !SurvivalEncounterRules.canSpawn(
                             world: worldMapIndex, room: wave,
                             elapsed: waveElapsed, livingEnemies: enemies.count),
                         "Timed extraction must open with living enemies")
            arena.isPaused = true
        }
        // Art review for Rooms 6-10: stage actual forest-overgrowth scenery
        // without changing combat balance or the launch state seen by players.
        // Real SpriteKit boss integration: stage the final room and
        // confirm each world's attack behavior, health and telegraphs.
        if ProcessInfo.processInfo.arguments.contains("-captureFloodedBossScreenshot") {
            worldMapIndex = 1
            wave = 19
            gateUnlocked = true
            startWave()
            spawned = waveTarget
            spawnEnemy()
            precondition(wave == 20 && enemies.count == 1 &&
                         bossNode != nil && enemies[0].health == selectedWorld.bossHealth &&
                         zoneBanner.text == "BOSS: TIDAL WARDEN",
                         "Flooded boss must spawn as the correct final encounter")
            combatClock.advance(2.2, playing: true)
            updateRangedAttack(at: 0)
            precondition(enemies[0].shotTarget != nil &&
                         bossNode?.childNode(withName: "aimLineLeft") != nil &&
                         bossNode?.childNode(withName: "aimLineRight") != nil,
                         "Tidal Warden needs visibly warned fan attack")
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureToxicBossScreenshot") {
            worldMapIndex = 2
            wave = 19
            gateUnlocked = true
            startWave()
            spawned = waveTarget
            spawnEnemy()
            precondition(wave == 20 && enemies.count == 1 &&
                         bossNode != nil && enemies[0].health == selectedWorld.bossHealth &&
                         zoneBanner.text == "BOSS: TOXIC SENTINEL" &&
                         roomHazards.contains(where: { $0.kind == .acid }),
                         "Toxic boss must spawn with active terrain hazards")
            combatClock.advance(2.2, playing: true)
            updateRangedAttack(at: 0)
            precondition(lobs.count == 1 &&
                         lobs[0].marker.childNode(withName: "mortarCountdown") != nil,
                         "Toxic Sentinel must signal its mortar impact")
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureWorldExpansionScreenshot") {
            // Validate the first newly playable world with its actual water
            // patches, its entry route and a distinct world presentation.
            UserDefaults.standard.set(true, forKey: "frontierForestComplete")
            worldMapIndex = 1
            showReady()
            precondition(WorldCatalog.unlocked(1) && overlayButtons["start"] != nil,
                         "Clearing World 1 must unlock Flooded Outpost")
            draftLoadout = AbilityLoadout(selected: ["chain", "explosive", "orbit"])
            showLoadout()
            precondition(enterSelectedWorld() && wave == 1 &&
                         roomHazards.contains(where: { $0.kind == .water }) &&
                         !roomHazards.contains(where: { $0.kind == .acid }),
                         "World 2 must launch with water and distinct terrain")
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
            UserDefaults.standard.removeObject(forKey: "frontierForestComplete")
        }
        if ProcessInfo.processInfo.arguments.contains("-captureWorldTransitionScreenshot") {
            // CI-only completed World 2 -> World 3 route. The app must reset
            // run XP and equipment while retaining the unlocked destination.
            UserDefaults.standard.set(true, forKey: "frontierForestComplete")
            worldMapIndex = 1
            draftLoadout = AbilityLoadout(selected: ["chain", "explosive", "orbit"])
            showLoadout()
            precondition(enterSelectedWorld() && wave == 1)
            // The integration route is deliberately fast-forwarded to the
            // reward screen; no artificial enemy kills or user-side rewards.
            progress = RunProgress()
            completeWorld()
            precondition(phase == .worldComplete &&
                         WorldCatalog.unlocked(2) &&
                         overlayButtons["next_world"] != nil &&
                         WorldCatalog.completed(1),
                         "Defeating World 2 must unlock a next-world button")
            advanceToNextWorld()
            precondition(worldMapIndex == 2 && wave == 0 &&
                         phase == .loadout && draftLoadout.selected.isEmpty,
                         "Next World must reset the run and open World 3 loadout")
            draftLoadout = AbilityLoadout(selected: ["chain", "incendiary", "orbit"])
            showLoadout()
            precondition(enterSelectedWorld() && wave == 1 &&
                         roomHazards.contains(where: { $0.kind == .acid }) &&
                         !roomHazards.contains(where: { $0.kind == .water }),
                         "Toxic Crossing must start with only acid and rubble")
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        // Simulated active acid screenshot: exercise real phase-timed hazard
        // art and damage boundaries in the same World 3 room as the inactive
        // capture. This is a deterministic QA-only fixture, never a cheat or
        // tutorial bypass in regular gameplay.
        if ProcessInfo.processInfo.arguments.contains("-captureAcidActiveScreenshot") {
            worldMapIndex = 2
            wave = 0
            gateUnlocked = true
            startWave()
            precondition(wave == 1 && phase == .playing &&
                         roomHazards.contains(where: { $0.kind == .acid }) &&
                         acidVisualNodes.count == 1,
                         "World 3 acid fixture must use real room terrain")
            waveElapsed = 2.5
            updateTerrainHazards()
            precondition(displayedAcidActive == true &&
                         acidVisualNodes[0].childNode(
                            withName: "acidActiveVeins")?.isHidden == false &&
                         TerrainHazards.acidTouches(
                            CGPoint(x: roomHazards[0].frame.midX,
                                    y: roomHazards[0].frame.midY),
                            patches: roomHazards, at: waveElapsed),
                         "Active acid must show its damaging-phase warning")
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureTerrainHazardsScreenshot") {
            wave = 11
            gateUnlocked = true
            startWave()
            precondition(roomHazards.count == 3 &&
                         hazardScenery.children.count == 3 &&
                         TerrainHazards.blocksMovement(
                             CGPoint(x: roomHazards[0].frame.midX,
                                     y: roomHazards[0].frame.midY),
                             patches: roomHazards),
                         "Preview must render water, acid, and blocked terrain")
            // Stage the terrain without live enemy attacks in the screenshot.
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureOvergrownScreenshot") {
            wave = 5
            gateUnlocked = true
            startWave()
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        // CI-only room-clear screenshot: verify that combat hides the exit and
        // defeating the last foe exposes a readable ENTER gate.
        if ProcessInfo.processInfo.arguments.contains("-captureGateScreenshot") {
            startWave()
            spawned = waveTarget
            showZoneGate()
            // Keep the exit fully visible for a stable visual regression frame.
            passageGate.removeAllActions()
            passageGate.alpha = 1
            passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        }
        // CI-only motion review: run real combat and movement instead of
        // freezing an art-review frame. This never executes in normal play.
        if ProcessInfo.processInfo.arguments.contains("-captureGameplayFrames") {
            startWave()
        }
        // CI-only ranged combat review: jump directly to the first room
        // featuring both shooters and lobbers. These enemies have extra
        // health only for observation; shipped combat stats are unchanged.
        if ProcessInfo.processInfo.arguments.contains("-captureRangedCombatFrames") {
            wave = 10
            gateUnlocked = true
            startWave()
            waveTarget = 3
            spawned = 3
            for (index, kind) in [4, 5, 4].enumerated() {
                spawnEnemy(artReviewType: kind)
                if let enemy = enemies.last {
                    enemy.node.position = CGPoint(
                        x: roomBounds.midX + CGFloat(index - 1) * roomBounds.width * 0.30,
                        y: roomBounds.midY + roomBounds.height * 0.20
                    )
                    enemies[enemies.count - 1].nextAttack = combatTime + 1.2
                }
            }
            updateHUD()
        }
        // CI-only level-up integration review: an actual heavy-enemy kill
        // crosses the XP threshold while two enemies remain alive. This
        // exercises kill rewards, pause/menu presentation, selection, and
        // return to live combat without modifying TestFlight progression.
        let qaLevelUp = ProcessInfo.processInfo.arguments.contains("-captureLevelUpScreenshot")
        let qaLevelUpResume = ProcessInfo.processInfo.arguments.contains("-captureLevelUpResumeScreenshot")
        if qaLevelUp || qaLevelUpResume {
            startWave()
            waveTarget = 3
            spawned = 3
            for (index, kind) in [3, 0, 1].enumerated() {
                spawnEnemy(artReviewType: kind)
                enemies[enemies.count - 1].node.position = CGPoint(
                    x: roomBounds.midX + CGFloat(index - 1) * roomBounds.width * 0.25,
                    y: roomBounds.midY + roomBounds.height * 0.20
                )
            }
            // Heavy units award ten XP; the six-point overflow must carry.
            let threshold = progress.nextLevelXP
            progress.earnXP(threshold - 4)
            enemies[0].health = 0
            removeDefeatedEnemies()
            precondition(progress.level == 2 && progress.xp == 6 &&
                         progress.pendingChoices == 1 && phase == .levelUp,
                         "A combat kill must immediately pause for a level-up")
            // Check the actual card rectangles before selecting. This uses
            // the same hit-test and action route as a user's screen touch.
            for choice in levelChoices {
                guard let rect = overlayButtons[choice] else {
                    preconditionFailure("Missing visible level-up card hitbox")
                }
                precondition(levelChoice(at: CGPoint(x: rect.midX, y: rect.midY)) == choice,
                             "Tap must resolve to its visible card")
            }
            precondition(levelChoice(at: CGPoint(x: 0, y: 200)) == nil,
                         "Empty overlay space must not select an upgrade")
            if qaLevelUpResume {
                precondition(!levelChoices.isEmpty, "No level-up choices offered")
                let choice = levelChoices[0]
                guard let rect = overlayButtons[choice] else {
                    preconditionFailure("Selected card has no hitbox")
                }
                precondition(activateLevelUp(at: CGPoint(x: rect.midX, y: rect.midY)),
                             "On-screen upgrade card must be tappable")
                precondition(phase == .playing && progress.pendingChoices == 0,
                             "Upgrade choice must resume combat exactly once")
            }
        }
        // CI-only launch flag: capture real combat rather than the world-map menu.
        if ProcessInfo.processInfo.arguments.contains("-captureCombatScreenshot") ||
           ProcessInfo.processInfo.arguments.contains("-captureCombatFeedbackScreenshot") ||
           ProcessInfo.processInfo.arguments.contains("-captureTacticalFXScreenshot") {
            startWave()
            // The six posed QA enemies comprise the whole displayed test room.
            waveTarget = 6
            spawned = 6
            // CI art review: hold a real room with living enemies on screen.
            // This launch-only mode does not affect normal play or TestFlight.
            for (index, kind) in [1, 2, 3, 0, 4, 5].enumerated() {
                spawnEnemy(artReviewType: kind)
                // Three enemies per row: melee threats above and the
                // ordinary grunt plus ranged threats below.
                if let enemy = enemies.last {
                    let column = index % 3
                    let row = index / 3
                    enemy.node.position = CGPoint(
                        x: roomBounds.midX + CGFloat(column - 1) * roomBounds.width * 0.28,
                        y: roomBounds.midY + roomBounds.height * (row == 0 ? 0.23 : 0.01)
                    )
                }
            }
            if ProcessInfo.processInfo.arguments.contains("-captureCombatFeedbackScreenshot"),
               let first = enemies.first {
                EnemyCombatFeedback.hit(first.node, from: pilot.position)
                EnemyCombatFeedback.impact(in: arena, at: first.node.position,
                                           color: .systemYellow, destroyed: true)
                EnemyCombatFeedback.defeat(in: arena, enemy: first.node,
                                           radius: first.radius,
                                           role: first.behavior, isBoss: false)
                precondition(arena.children.contains(where: {
                    $0.name == "enemyDefeatEcho"
                }), "Visual QA requires illustrated enemy destruction")
            }
            if ProcessInfo.processInfo.arguments.contains("-captureTacticalFXScreenshot"),
               enemies.count >= 3 {
                let point = enemies[0].node.position
                CombatVisuals.explosiveBurst(in: arena, at: point,
                                             rank: 3, burning: true)
                CombatVisuals.markBurning(enemies[0].node, radius: enemies[0].radius)
                CombatVisuals.chainArc(in: arena, from: point,
                                       to: enemies[1].node.position, rank: 3)
                precondition(arena.childNode(withName: "explosiveBurst") != nil &&
                             arena.childNode(withName: "chainLightningCore") != nil &&
                             enemies[0].node.childNode(withName: "burnIndicator") != nil,
                             "Tactical effects must be distinctive and visible")
            }
            // Spawns normally fade in from 28% opacity. For a frozen art-review
            // frame, reveal the finished sprites and hide their warning rings.
            for enemy in enemies {
                enemy.node.removeAllActions()
                enemy.node.alpha = 1
                enemy.node.childNode(withName: "spawnWarning")?.isHidden = true
            }
            arena.isPaused = true
            // Freeze the entire QA scene: gameplay update must not clear the
            // room after these deliberately staged enemies are installed.
            phase = .levelUp
            updateHUD()
        }
    }

    /// The floor travels with the camera: a static screen backdrop would
    /// otherwise appear disconnected from moving terrain and enemies.
    private func installArenaPreviewGround() {
        arena.childNode(withName: "expandedArenaPreviewGround")?.removeFromParent()
        let floor = SKShapeNode(rect: roomBounds, cornerRadius: 18)
        floor.name = "expandedArenaPreviewGround"
        floor.fillColor = SKColor(red: 0.12, green: 0.22, blue: 0.19, alpha: 1)
        floor.strokeColor = SKColor(red: 0.30, green: 0.49, blue: 0.40, alpha: 0.65)
        floor.lineWidth = 7
        floor.zPosition = -8
        // Large, irregular material patches establish scale without the
        // left-to-right grid lines that previously looked artificial.
        for index in 0..<54 {
            let x = roomBounds.minX + 35 +
                CGFloat((index * 137 + 47) % max(1, Int(roomBounds.width - 70)))
            let y = roomBounds.minY + 35 +
                CGFloat((index * 89 + 61) % max(1, Int(roomBounds.height - 70)))
            let stone = SKShapeNode(ellipseOf: CGSize(
                width: CGFloat(9 + index % 5 * 6),
                height: CGFloat(3 + index % 4 * 3)))
            stone.position = CGPoint(x: x, y: y)
            stone.zRotation = CGFloat(index % 6) * 0.22
            stone.fillColor = index.isMultiple(of: 3)
                ? SKColor(red: 0.43, green: 0.50, blue: 0.40, alpha: 0.22)
                : SKColor(red: 0.07, green: 0.15, blue: 0.13, alpha: 0.29)
            stone.strokeColor = .clear
            floor.addChild(stone)
        }
        // Distinctive landmarks make camera movement apparent and help
        // orient the player across the wider battlefield. Decorative only:
        // these do not create unimplemented collision barriers.
        for index in 0..<4 {
            let x = roomBounds.minX + roomBounds.width *
                CGFloat([0.13, 0.83, 0.21, 0.77][index])
            let y = roomBounds.minY + roomBounds.height *
                CGFloat([0.27, 0.32, 0.73, 0.79][index])
            let shadow = SKShapeNode(ellipseOf: CGSize(width: 90, height: 30))
            shadow.position = CGPoint(x: x + 5, y: y - 11)
            shadow.fillColor = SKColor.black.withAlphaComponent(0.27)
            shadow.strokeColor = .clear
            floor.addChild(shadow)
            let pad = SKShapeNode(rectOf: CGSize(width: 73, height: 34),
                                  cornerRadius: 6)
            pad.position = CGPoint(x: x, y: y)
            pad.zRotation = index.isMultiple(of: 2) ? 0.10 : -0.16
            pad.fillColor = SKColor(red: 0.21, green: 0.28,
                                    blue: 0.25, alpha: 0.9)
            pad.strokeColor = SKColor(red: 0.38, green: 0.47,
                                      blue: 0.39, alpha: 0.8)
            pad.lineWidth = 2
            floor.addChild(pad)
            for stripe in [-1, 1] {
                let rail = SKShapeNode(rectOf: CGSize(width: 8, height: 28),
                                       cornerRadius: 2)
                rail.position.x = CGFloat(stripe) * 25
                rail.fillColor = SKColor(red: 0.31, green: 0.38,
                                         blue: 0.34, alpha: 1)
                rail.strokeColor = .clear
                pad.addChild(rail)
            }
            let signal = SKShapeNode(circleOfRadius: 4)
            signal.position = CGPoint(x: 0, y: 10)
            signal.fillColor = .systemOrange
            signal.strokeColor = .clear
            signal.glowWidth = 2
            pad.addChild(signal)
        }
        arena.addChild(floor)
    }

    private func updateArenaCamera(delta: TimeInterval) {
        guard expandedArenaPreview else {
            if arena.position != .zero { arena.position = .zero }
            return
        }
        let target = ArenaLayout.offset(for: pilot.position, viewportSize: size)
        arena.position = ArenaLayout.follow(
            current: arena.position, target: target, frameDelta: delta)
    }

    override func didChangeSize(_ oldSize: CGSize) { layout() }

    private func layout() {
        if arena.parent != nil { BattlefieldArt.install(in: self, behind: arena) }
        passageGate.position = CGPoint(x: roomBounds.midX, y: roomBounds.maxY - 24)
        if !zoneScenery.children.isEmpty { updateZoneScenery(zoneIndex) }
        if !hazardScenery.children.isEmpty { rebuildTerrainHazards() }
        if wave == 0 && phase == .ready { pilot.position = entryPoint }
        updateArenaCamera(delta: 1)
        // Compact three-line combat header; the slim XP bar shares its last
        // row with the XP value. All information remains visible, but the
        // arena gains vertical breathing room.
        hudPanel.path = CGPath(roundedRect: CGRect(
            x: 12, y: size.height - 171,
            width: max(1, size.width - 24), height: 96),
            cornerWidth: 13, cornerHeight: 13, transform: nil)
        title.position = CGPoint(x: size.width / 2, y: size.height - 99)
        subtitle.position = CGPoint(x: size.width / 2, y: size.height - 121)
        info.position = CGPoint(x: size.width / 2, y: size.height - 141)
        overlay.position = CGPoint(x: size.width / 2, y: size.height * 0.52)
        overlayBackdrop.path = CGPath(roundedRect: CGRect(x: -min(size.width - 28, 390) / 2, y: -245, width: min(size.width - 28, 390), height: 430), cornerWidth: 18, cornerHeight: 18, transform: nil)
        damageFlash.path = CGPath(rect: CGRect(origin: .zero, size: size), transform: nil)
        warning.position = CGPoint(x: size.width / 2, y: max(170, size.height * 0.23))
        zoneBanner.position = CGPoint(x: size.width / 2, y: roomBounds.maxY - 90)
        controlsHint.position = CGPoint(x: roomBounds.midX, y: roomBounds.minY + 66)
        // Reserve the right side of the progress row for the level counter,
        // avoiding an additional line below the panel.
        let xpWidth = max(1, size.width - 169)
        xpTrack.path = CGPath(roundedRect: CGRect(
            x: 0, y: 0, width: xpWidth, height: 5),
            cornerWidth: 2.5, cornerHeight: 2.5, transform: nil)
        xpFill.path = xpTrack.path
        xpTrack.position = CGPoint(x: 24, y: size.height - 160)
        xpFill.position = xpTrack.position
        xpLabel.position = CGPoint(x: size.width - 25, y: size.height - 162)
        checkpointButton.position = CGPoint(x: size.width / 2,
                                            y: RoomRules.bounds(for: size).minY + 25)
        settingsShortcut.position = CGPoint(x: 36, y: size.height - 195)
        updateHUD()
    }

    private func updateHUD() {
        let speedText = fastForward ? "2× SPEED" : "1× SPEED"
        if speedLabel.text != speedText { speedLabel.text = speedText }
        speedButton.fillColor = fastForward ? .systemOrange : .systemBlue
        speedButton.isHidden = phase != .playing && phase != .gate
        settingsShortcut.isHidden = ![Phase.ready, .loadout, .playing, .gate].contains(phase)
        // Player controls sit below the compact header.
        speedButton.position = CGPoint(x: size.width - 56, y: size.height - 195)
        if phase == .ready || phase == .loadout {
            // In menus, keep the gear inside the panel rather than
            // floating over its top-left border.
            settingsShortcut.position = CGPoint(
                x: size.width - 52, y: overlay.position.y + 155)
        } else {
            settingsShortcut.position = CGPoint(x: 36, y: size.height - 195)
        }
        let desiredXPScale = max(0.001, CGFloat(progress.xp) / CGFloat(progress.nextLevelXP))
        if abs(xpFill.xScale - desiredXPScale) > 0.0005 { xpFill.xScale = desiredXPScale }
        let xpText = "LEVEL \(progress.level)  •  \(progress.xp)/\(progress.nextLevelXP) XP"
        if xpLabel.text != xpText { xpLabel.text = xpText }
        checkpointButton.isHidden = phase != .gate || !wave.isMultiple(of: 5) || checkpointUsed
        // Preserve the selected world's identity while combat is paused
        // for upgrades or QA captures. Only pre-run screens use the game title.
        let titleText = wave == worldWaveCount && phase == .playing
            ? selectedWorld.boss
            : (wave > 0 && phase != .ready && phase != .loadout
               ? selectedWorld.title : "OUTPOST ZERO")
        if title.text != titleText { title.text = titleText }
        let subtitleText: String
        if activeEncounter == .survival && phase == .playing {
            let remaining = max(0, Int(ceil(
                SurvivalEncounterRules.duration(world: worldMapIndex, room: wave) -
                    waveElapsed)))
            subtitleText = "SURVIVE \(remaining)S  •  \(enemies.count) FOES  •  \(coins) COINS"
        } else if activeEncounter == .survival && roomCleared {
            subtitleText = "ROOM \(wave)/\(worldWaveCount)  •  EXTRACTION READY"
        } else {
            subtitleText = "ROOM \(wave)/\(worldWaveCount)  •  \(coins) COINS  •  \(max(0, waveTarget - spawned) + enemies.count) FOES"
        }
        if subtitle.text != subtitleText { subtitle.text = subtitleText }
        let infoText = "HP \(health)/\(maximumHealth)  •  DMG \(damage + permanentDamageBonus + gearWeaponBonus)  •  RATE \(fireRate)"
        if info.text != infoText { info.text = infoText }
        info.fontColor = health <= maximumHealth / 3 ? .systemRed : (health <= maximumHealth * 2 / 3 ? .systemYellow : .white)
    }

    private func clearOverlay() {
        speedButton.isHidden = true
        checkpointButton.isHidden = true
        overlay.removeAllChildren()
        overlayButtons.removeAll()
        // Every menu begins with the standard card. The world map and
        // interruption screens override its height without affecting others.
        overlayBackdrop.path = CGPath(roundedRect: CGRect(
            x: -min(size.width - 28, 390) / 2, y: -245,
            width: min(size.width - 28, 390), height: 430),
            cornerWidth: 18, cornerHeight: 18, transform: nil)
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
        EnemyCombatFeedback.impact(in: arena, at: point, color: color,
                                   destroyed: destroyed)
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
        discardRunArmed = false
        hud.isHidden = true
        phase = .ready
        ArcadeMusic.shared.play(.headquarters)
        clearOverlay()
        // The previous panel clipped WORLD MAP at its top and left the
        // power-core counter outside its bottom. Keep both inside the card.
        overlayBackdrop.path = CGPath(roundedRect: CGRect(
            x: -min(size.width - 28, 390) / 2, y: -293,
            width: min(size.width - 28, 390), height: 489),
            cornerWidth: 18, cornerHeight: 18, transform: nil)
        let selected = worldMapIndex
        let world = selectedWorld
        let unlocked = WorldCatalog.unlocked(selected)
        let released = selected < WorldCatalog.playableCount
        let bestStars = WorldCatalog.stars(selected)
        overlayText("WORLD MAP", y: 159, fontSize: 23)
        overlayText("◀  WORLD \(selected + 1) / \(WorldCatalog.worlds.count)  ▶", y: 133, fontSize: 15)
        let worldCard = SKShapeNode(rect: CGRect(x: -min(size.width - 90, 310) / 2, y: -18,
                                                 width: min(size.width - 90, 310), height: 128), cornerRadius: 18)
        worldCard.fillColor = unlocked ? SKColor.systemGreen.withAlphaComponent(0.22) : SKColor.systemGray.withAlphaComponent(0.18)
        worldCard.strokeColor = unlocked ? .systemTeal : .gray
        worldCard.lineWidth = 2
        overlay.addChild(worldCard)
        // Layered destination illustration, rendered entirely in SpriteKit.
        let palettes: [(SKColor, SKColor)] = [
            (.systemGreen, .systemTeal), (.systemBlue, .systemCyan),
            (.systemGreen, .systemYellow), (.systemOrange, .systemRed),
            (.systemCyan, .systemBlue), (.systemPurple, .systemPink),
            (.darkGray, .systemIndigo)
        ]
        let colors = palettes[min(world.biome, palettes.count - 1)]
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
        overlayText(world.title, y: 81, fontSize: 17)
        overlayText(released
            ? (unlocked ? "AVAILABLE  •  \(bestStars)/3 STARS" : "LOCKED — CLEAR PREVIOUS WORLD")
            : "PLANNED — NOT YET PLAYABLE", y: 55, fontSize: 12)
        overlayText("REGION: \(world.region)", y: -27, fontSize: 11)
        overlayText(released ? (unlocked ? "\(3 - bestStars) CORES STILL EARNABLE" : world.brief)
                             : "MORE WORLDS IN DEVELOPMENT", y: -43, fontSize: 10)
        if released && unlocked {
            overlayText("BEST ROOM: \(WorldCatalog.bestRoom(selected))/\(worldWaveCount)",
                        y: -59, fontSize: 10)
        }
        actionButton("◀ PREVIOUS", key: "world_prev", y: -83, tint: .systemBlue, enabled: selected > 0)
        actionButton("NEXT ▶", key: "world_next", y: -132, tint: .systemBlue, enabled: selected < WorldCatalog.worlds.count - 1)
        if let storedRun = recovery.load() {
            // Always offer Resume, even when the world map starts at World 1.
            // The saved snapshot restores its own world index and room.
            actionButton("RESUME WORLD \(storedRun.worldIndex + 1) • ROOM \(storedRun.room)",
                         key: "recover_run", y: -181, tint: .systemTeal)
        } else if unlocked {
            actionButton("PREPARE LOADOUT", key: "start", y: -181, tint: .systemTeal)
        }
        actionButton("HEADQUARTERS & UPGRADES", key: "headquarters", y: -232, tint: .systemIndigo)
        overlayText("POWER CORES: \(availableCores)", y: -272, fontSize: 12)
        updateHUD()
    }

    private func bankSalvage(_ amount: Int) {
        // An interrupted room may be replayed. Credit only rewards earned
        // beyond the amount previously banked in this room.
        let freshReward = RunRecoveryStore.incrementalReward(
            earnedOnReplay: roomSalvageEarned,
            previouslyCredited: roomSalvageRecoveredCredit,
            reward: amount)
        roomSalvageEarned += max(0, amount)
        salvageBankedThisRun += permanent.bank(freshReward)
    }

    @discardableResult
    private func awardRoomCoins(_ reward: Int) -> Int {
        let paid = RunRecoveryStore.incrementalReward(
            earnedOnReplay: roomCoinsEarned,
            previouslyCredited: roomCoinsRecoveredCredit,
            reward: reward)
        roomCoinsEarned += max(0, reward)
        coins += paid
        return paid
    }

    @discardableResult
    private func awardRoomXP(_ reward: Int) -> Int {
        let paid = RunRecoveryStore.incrementalReward(
            earnedOnReplay: roomXPEarned,
            previouslyCredited: roomXPRecoveredCredit,
            reward: reward)
        roomXPEarned += max(0, reward)
        progress.earnXP(paid)
        return paid
    }

    private var isCaptureMode: Bool {
        ProcessInfo.processInfo.arguments.contains { $0.hasPrefix("-capture") }
    }

    private func saveRunRecovery() {
        guard !isRestoringRun, !isCaptureMode, health > 0,
              (phase == .playing || phase == .gate ||
               phase == .checkpoint || phase == .levelUp),
              wave >= 1 else { return }
        let location: RunSnapshot.Location =
            (phase == .gate || phase == .checkpoint || roomCleared)
                ? .clearedGate : .battle
        let snapshot = RunSnapshot(
            version: RunSnapshot.schema, worldIndex: worldMapIndex,
            room: wave, location: location,
            health: health, coins: coins, damage: damage, fireRate: fireRate,
            chainLevel: chainLevel, explosiveLevel: explosiveLevel,
            incendiaryLevel: incendiaryLevel, orbitLevel: orbitLevel,
            runArmor: runArmor, checkpointUsed: checkpointUsed,
            checkpointPresented: checkpointPresented,
            progress: progress, abilities: lockedLoadout.selected,
            earnedSalvage: salvageBankedThisRun,
            roomSalvageCredit: max(roomSalvageRecoveredCredit, roomSalvageEarned),
            roomCoinCredit: max(roomCoinsRecoveredCredit, roomCoinsEarned),
            roomXPCredit: max(roomXPRecoveredCredit, roomXPEarned),
            timedEncounterElapsed: activeEncounter == .survival
                ? min(waveElapsed, SurvivalEncounterRules.duration(
                    world: worldMapIndex, room: wave)) : nil)
        _ = recovery.save(snapshot)
    }

    private func recoverSavedRun() {
        guard let snapshot = recovery.load() else { showReady(); return }
        isRestoringRun = true
        worldMapIndex = snapshot.worldIndex
        restart()  // Clear remaining nodes without clearing saved recovery.
        progress = snapshot.progress
        lockedLoadout = AbilityLoadout(selected: snapshot.abilities)
        draftLoadout = lockedLoadout
        runArmor = snapshot.runArmor
        coins = snapshot.coins
        health = min(snapshot.health, maximumHealth)
        damage = snapshot.damage
        fireRate = snapshot.fireRate
        chainLevel = snapshot.chainLevel
        explosiveLevel = snapshot.explosiveLevel
        incendiaryLevel = snapshot.incendiaryLevel
        orbitLevel = snapshot.orbitLevel
        salvageBankedThisRun = snapshot.earnedSalvage
        wave = snapshot.room - 1
        gateUnlocked = true
        startWave()
        checkpointUsed = snapshot.checkpointUsed
        checkpointPresented = snapshot.checkpointPresented
        roomSalvageRecoveredCredit = snapshot.roomSalvageCredit
        roomSalvageEarned = 0
        roomCoinsRecoveredCredit = snapshot.roomCoinCredit
        roomCoinsEarned = 0
        roomXPRecoveredCredit = snapshot.roomXPCredit
        roomXPEarned = 0
        // Optional schema-4 clock: old TestFlight runs still load.
        if activeEncounter == .survival {
            waveElapsed = min(snapshot.timedEncounterElapsed ?? 0,
                              SurvivalEncounterRules.duration(
                                  world: worldMapIndex, room: wave))
        }
        rebuildOrbitingDefenses()
        if snapshot.location == .clearedGate {
            roomCleared = true
            spawned = waveTarget
            if wave < worldWaveCount { showZoneGate() }
        }
        isRestoringRun = false
        if progress.pendingChoices > 0 {
            let destination: Phase = snapshot.location == .clearedGate
                ? (wave == worldWaveCount ? .worldComplete : .gate)
                : .playing
            _ = presentPendingLevelUp(returningTo: destination)
        } else if snapshot.location == .clearedGate && wave == worldWaveCount {
            // The boss was defeated, but iOS terminated the app before the
            // victory summary. Complete it once; do not create an exit gate.
            completeWorld()
        } else {
            // Return frozen until the player explicitly chooses to resume.
            setAppActive(false)
        }
        saveRunRecovery()
    }

    private func discardSavedRun() {
        if !discardRunArmed {
            discardRunArmed = true
            showHeadquarters()
            return
        }
        discardRunArmed = false
        recovery.clear()
        // Discarding an old save cannot change permanently banked Salvage.
        restart()
        showHeadquarters()
    }

    private func showHeadquarters() {
        phase = .headquarters
        hud.isHidden = true
        ArcadeMusic.shared.play(.headquarters)
        clearOverlay()
        overlayText("HEADQUARTERS", y: 156, fontSize: 24)
        overlayText("\(permanent.salvage) SALVAGE  •  \(availableCores) CORES", y: 117, fontSize: 15)
        overlayText("PERMANENT UPGRADES BETWEEN RUNS", y: 88, fontSize: 12)
        actionButton("GEAR BAY", key: "gear_bay", y: 35, tint: .systemTeal)
        actionButton("ABILITY LAB", key: "ability_lab", y: -23, tint: .systemIndigo)
        actionButton("CHARACTER RESTORATION", key: "restore", y: -81, tint: .systemPurple)
        if recovery.load() != nil {
            actionButton(discardRunArmed ? "CONFIRM DISCARD RUN" : "DISCARD SAVED RUN",
                         key: "discard_run", y: -128, tint: .systemRed)
        }
        actionButton("BACK TO WORLD MAP", key: "hq_back", y: -182, tint: .systemBlue)
        updateHUD()
    }

    private func showGearBay() {
        discardRunArmed = false
        phase = .gearBay
        hud.isHidden = true
        clearOverlay()
        overlayText("GEAR BAY", y: 162, fontSize: 24)
        overlayText("\(permanent.salvage) SALVAGE AVAILABLE", y: 128, fontSize: 14)
        overlayText("EQUIPMENT STAYS UPGRADED AFTER DEFEAT", y: 104, fontSize: 11)
        let labels = ["WEAPON", "ARMOR", "REACTOR"]
        for (index, id) in PersistentProgression.gear.enumerated() {
            let level = permanent.rank(id)
            let price = permanent.cost(id)
            let label = level == 5 ? "\(labels[index])  LV 5  •  MAX" :
                "\(labels[index])  LV \(level)  •  \(price) SALVAGE"
            actionButton(label, key: "buy_\(id)", y: CGFloat(50 - index * 63),
                         tint: index == 0 ? .systemOrange : (index == 1 ? .systemTeal : .systemIndigo),
                         enabled: level < 5 && permanent.salvage >= price)
        }
        overlayText("WEAPON: +1 DMG / LV", y: -133, fontSize: 11)
        overlayText("ARMOR: +15 HP / LV  •  REACTOR: ABILITY POWER", y: -155, fontSize: 10)
        actionButton("BACK TO HEADQUARTERS", key: "hq_back", y: -209, tint: .systemBlue)
        updateHUD()
    }

    private func showAbilityLab() {
        discardRunArmed = false
        phase = .abilityLab
        hud.isHidden = true
        clearOverlay()
        overlayText("ABILITY LAB", y: 159, fontSize: 24)
        overlayText("\(permanent.salvage) SALVAGE AVAILABLE", y: 125, fontSize: 14)
        overlayText("MASTERY ONLY WORKS WHEN EQUIPPED", y: 101, fontSize: 11)
        let labels = ["CHAIN LIGHTNING", "EXPLOSIVES", "INCENDIARY", "ORBITAL BLADES"]
        for (index, id) in PersistentProgression.abilities.enumerated() {
            let level = permanent.rank(id)
            let price = permanent.cost(id)
            let label = level == 5 ? "\(labels[index])  LV 5 MAX" :
                "\(labels[index])  LV \(level)  •  \(price)"
            actionButton(label, key: "buy_\(id)", y: CGFloat(61 - index * 56),
                         tint: index.isMultiple(of: 2) ? .systemTeal : .systemIndigo,
                         enabled: level < 5 && permanent.salvage >= price)
        }
        overlayText("SELECT 3 ABILITIES BEFORE EACH WORLD", y: -158, fontSize: 11)
        actionButton("BACK TO HEADQUARTERS", key: "hq_back", y: -209, tint: .systemBlue)
        updateHUD()
    }

    private func purchasePermanentUpgrade(_ id: String) {
        guard phase == .gearBay || phase == .abilityLab else { return }
        let currentScreen = phase
        guard permanent.purchase(id) else { return }
        refreshPilotAppearance()
        if currentScreen == .gearBay { showGearBay() } else { showAbilityLab() }
    }

    private func showLoadout() {
        phase = .loadout
        hud.isHidden = true
        clearOverlay()
        overlayText("MISSION LOADOUT", y: 162, fontSize: 23)
        overlayText("PRIMARY: AUTO RIFLE  •  ALWAYS EQUIPPED", y: 126, fontSize: 11)
        overlayText("WORLD \(worldMapIndex + 1)  •  LOCKED FOR 20 ROOMS", y: 99, fontSize: 12)
        overlayText("\(draftLoadout.selected.count)/3 TACTICAL ABILITIES SELECTED",
                    y: 76, fontSize: 12)
        let options: [(String, String)] = [
            ("chain", "CHAIN LIGHTNING  •  CROWDS"),
            ("explosive", "EXPLOSIVE ROUNDS  •  AREA"),
            ("incendiary", "INCENDIARY ROUNDS  •  BOSS"),
            ("orbit", "ORBITAL BLADES  •  DEFENSE")
        ]
        for (index, option) in options.enumerated() {
            let chosen = draftLoadout.contains(option.0)
            actionButton("\(chosen ? "✓ " : "＋ ")\(option.1)",
                         key: "pick_\(option.0)", y: CGFloat(42 - index * 53),
                         tint: chosen ? .systemTeal : .systemIndigo,
                         enabled: chosen || draftLoadout.selected.count < 3)
            // Full loadouts remain editable: remove an ability to swap.
            // Disabled unselected cards are displayed but don't accept taps.
        }
        actionButton("LOCK LOADOUT & ENTER", key: "lock_loadout", y: -181,
                     tint: .systemGreen, enabled: draftLoadout.isReady)
        actionButton("BACK TO WORLDS", key: "back_loadout", y: -228, tint: .systemBlue)
        updateHUD()
    }

    private func toggleSpeedPreference() {
        fastForward.toggle()
        UserDefaults.standard.set(fastForward, forKey: "outpostZeroDoubleSpeed")
        updateHUD()
    }

    private func showSettings() {
        guard phase != .settings || settingsReturnPhase != .settings else { return }
        if phase != .settings {
            saveRunRecovery()
            settingsReturnPhase = phase
        }
        phase = .settings
        arena.isPaused = true
        hud.isHidden = true
        lockMenuBriefly()
        clearOverlay()
        overlayText("SETTINGS", y: 137, fontSize: 27)
        overlayText("AUDIO & GAMEPLAY", y: 98, fontSize: 13)
        actionButton(ArcadeMusic.shared.isEnabled ? "MUSIC: ON" : "MUSIC: OFF",
                     key: "toggle_music", y: 42, tint: .systemTeal)
        actionButton(fastForward ? "GAME SPEED: 2×" : "GAME SPEED: 1×",
                     key: "toggle_speed", y: -16, tint: .systemIndigo)
        overlayText("PREFERENCES SAVED AUTOMATICALLY", y: -83, fontSize: 11)
        actionButton(settingsReturnPhase == .playing || settingsReturnPhase == .gate
                     ? "RESUME GAME" : "BACK",
                     key: "close_settings", y: -143, tint: .systemBlue)
        updateHUD()
    }

    private func closeSettings() {
        guard phase == .settings else { return }
        let destination = settingsReturnPhase
        switch destination {
        case .playing, .gate:
            hud.isHidden = false
            arena.isPaused = false
            clearOverlay()
            overlayBackdrop.isHidden = true
            phase = destination
            pilotShieldUntil = max(pilotShieldUntil, combatTime + 1.2)
            updateHUD()
        case .loadout: showLoadout()
        default: showReady()
        }
    }

    // A phone call, app switch or lock must never let enemies damage a
    // stationary pilot. Even after becoming active we remain paused until
    // the player explicitly taps RESUME.
    func setAppActive(_ active: Bool) {
        guard !active && (phase == .playing || phase == .gate) else { return }
        saveRunRecovery()
        interruptedReturnPhase = phase
        phase = .interrupted
        arena.isPaused = true
        lockMenuBriefly()
        clearOverlay()
        // Focused pause card leaves the room visible instead of covering
        // nearly the entire battlefield with a tall black rectangle.
        overlayBackdrop.path = CGPath(roundedRect: CGRect(
            x: -min(size.width - 28, 390) / 2, y: -155,
            width: min(size.width - 28, 390), height: 310),
            cornerWidth: 18, cornerHeight: 18, transform: nil)
        overlayText("RUN PAUSED", y: 92, fontSize: 27)
        overlayText("ROOM \(wave)  •  \(health) HP", y: 45, fontSize: 17)
        overlayText("COMBAT FROZEN UNTIL YOU RESUME", y: -9, fontSize: 12)
        actionButton("RESUME RUN", key: "resume_run", y: -86, tint: .systemTeal)
        updateHUD()
    }

    private func resumeInterruptedRun() {
        guard phase == .interrupted else { return }
        phase = interruptedReturnPhase
        arena.isPaused = false
        clearOverlay()
        overlayBackdrop.isHidden = true
        pilotShieldUntil = max(pilotShieldUntil, combatTime + 1.5)
        updateHUD()
    }

    @discardableResult
    private func enterSelectedWorld() -> Bool {
        guard phase == .loadout, draftLoadout.isReady,
              WorldCatalog.unlocked(worldMapIndex),
              recovery.load() == nil else { return false }
        lockedLoadout = draftLoadout
        recovery.clear()
        // Ensure newly purchased armor is active from the first room.
        health = maximumHealth
        salvageBankedThisRun = 0
        startWave()
        return true
    }

    private func rebuildTerrainHazards() {
        hazardScenery.removeAllChildren()
        acidVisualNodes.removeAll()
        displayedAcidActive = nil
        roomHazards = TerrainHazards.patches(
            world: worldMapIndex, room: wave, bounds: roomBounds,
            preview: ProcessInfo.processInfo.arguments.contains("-captureTerrainHazardsScreenshot"))
        for patch in roomHazards {
            // Shared polygon outline drives both visuals and physical
            // slowdown/damage. Only solid rubble retains the block silhouette.
            let shape = SKShapeNode(path: patch.outlinePath())
            shape.name = "terrain_\(patch.kind.rawValue)"
            shape.position = CGPoint(x: patch.frame.midX, y: patch.frame.midY)
            shape.lineWidth = 1.65
            shape.zPosition = 0
            switch patch.kind {
            case .water:
                shape.fillColor = SKColor(red: 0.065, green: 0.29, blue: 0.43, alpha: 0.66)
                shape.strokeColor = SKColor(red: 0.36, green: 0.66, blue: 0.72, alpha: 0.43)
                decorateLiquidHazard(shape, kind: .water, size: patch.frame.size)
            case .acid:
                shape.fillColor = SKColor(red: 0.19, green: 0.43, blue: 0.13, alpha: 0.66)
                shape.strokeColor = SKColor(red: 0.64, green: 0.72, blue: 0.29, alpha: 0.45)
                decorateLiquidHazard(shape, kind: .acid, size: patch.frame.size)
                acidVisualNodes.append(shape)
            case .rubble:
                // The collision patch stays rectangular, but the illustration
                // reads as a damaged material object instead of a UI warning.
                shape.path = CGPath(roundedRect: CGRect(
                    x: -patch.frame.width / 2, y: -patch.frame.height / 2,
                    width: patch.frame.width, height: patch.frame.height),
                    cornerWidth: 4, cornerHeight: 4, transform: nil)
                shape.fillColor = worldMapIndex == 1
                    ? SKColor(red: 0.20, green: 0.32, blue: 0.35, alpha: 1)
                    : SKColor(red: 0.30, green: 0.33, blue: 0.29, alpha: 1)
                shape.strokeColor = worldMapIndex == 1
                    ? SKColor(red: 0.12, green: 0.23, blue: 0.26, alpha: 1)
                    : SKColor(red: 0.13, green: 0.19, blue: 0.18, alpha: 1)
                shape.lineWidth = 2
                decorateRubbleObstacle(shape, size: patch.frame.size)
            }
            hazardScenery.addChild(shape)
            // No permanent WATER/ACID debug text. Coastline materials and
            // the pulsing hazardous edge communicate the threat in-world.
        }
    }


    /// Authored shorelines, shallow bays and reactive industrial runoff use
    /// the same polygon silhouette as game logic; all details are decorative.
    private func decorateLiquidHazard(_ pool: SKShapeNode,
                                      kind: TerrainHazards.Kind, size: CGSize) {
        let acid = kind == .acid
        let w = size.width
        let h = size.height
        let highlight = acid
            ? SKColor(red: 0.65, green: 0.88, blue: 0.29, alpha: 1)
            : SKColor(red: 0.64, green: 0.88, blue: 0.94, alpha: 1)
        let deep = acid
            ? SKColor(red: 0.05, green: 0.29, blue: 0.09, alpha: 1)
            : SKColor(red: 0.025, green: 0.23, blue: 0.36, alpha: 1)

        // Clip the interior weathering to precisely the same polygon as
        // slowdown and damage. One static crop per room section; nothing is
        // sampled or redrawn during movement/combat frames.
        guard let bankPath = pool.path else { return }

        // A translucent bank/lip extends a few points beyond the water line.
        // The physical polygon remains exact; this rim is visual sediment and
        // replaces the previous strong, continuous neon-blue/yellow outline.
        let groundBank = SKShapeNode(path: bankPath)
        groundBank.name = "softTerrainBank"
        groundBank.setScale(1.035)
        groundBank.fillColor = .clear
        groundBank.strokeColor = acid
            ? SKColor(red: 0.33, green: 0.28, blue: 0.13, alpha: 0.37)
            : SKColor(red: 0.12, green: 0.25, blue: 0.28, alpha: 0.39)
        groundBank.lineWidth = 7
        groundBank.zPosition = -0.3
        pool.addChild(groundBank)

        let textureMask = SKShapeNode(path: bankPath)
        textureMask.fillColor = .white
        textureMask.strokeColor = .clear
        let interior = SKCropNode()
        interior.name = "liquidSurfaceDetail"
        interior.maskNode = textureMask
        interior.zPosition = 0.15
        pool.addChild(interior)

        // Three broken vertical material veins run along each section.
        // For flooded terrain they are deeper channels and submerged silt;
        // for acid they are corroded runoff and oxidized chemical residue.
        for lane in 0..<3 {
            let laneOffset = CGFloat(lane) - 1
            let middleX = w * laneOffset * 0.22
            let broad: CGFloat = lane == 1 ? 0.16 : 0.12
            let ribbon = CGMutablePath()
            ribbon.move(to: CGPoint(x: middleX - w * broad / 2 - w * 0.05,
                                    y: -h * 0.56))
            ribbon.addLine(to: CGPoint(x: middleX - w * broad / 2,
                                       y: -h * 0.29))
            ribbon.addLine(to: CGPoint(x: middleX - w * broad / 2 + w * 0.06,
                                       y: -h * 0.07))
            ribbon.addLine(to: CGPoint(x: middleX - w * broad / 2 - w * 0.03,
                                       y: h * 0.19))
            ribbon.addLine(to: CGPoint(x: middleX - w * broad / 2 + w * 0.05,
                                       y: h * 0.53))
            ribbon.addLine(to: CGPoint(x: middleX + w * broad / 2 + w * 0.05,
                                       y: h * 0.53))
            ribbon.addLine(to: CGPoint(x: middleX + w * broad / 2 - w * 0.03,
                                       y: h * 0.17))
            ribbon.addLine(to: CGPoint(x: middleX + w * broad / 2 + w * 0.06,
                                       y: -h * 0.08))
            ribbon.addLine(to: CGPoint(x: middleX + w * broad / 2,
                                       y: -h * 0.31))
            ribbon.addLine(to: CGPoint(x: middleX + w * broad / 2 - w * 0.05,
                                       y: -h * 0.56))
            ribbon.closeSubpath()
            let material = SKShapeNode(path: ribbon)
            material.fillColor = (acid
                ? SKColor(red: lane == 1 ? 0.35 : 0.39,
                          green: 0.28, blue: 0.105, alpha: 0.18)
                : SKColor(red: 0.05, green: 0.17,
                          blue: lane == 1 ? 0.31 : 0.27, alpha: 0.23))
            material.strokeColor = .clear
            material.zPosition = 0.1
            interior.addChild(material)
        }

        // Small irregular mineral chips / submerged grit add texture and
        // shape without looking like circular debug markers. Deterministic
        // placement means screenshots are stable across simulator runs.
        for index in 0..<19 {
            let nx = CGFloat((index * 17 + 7) % 43) / 43 - 0.5
            let ny = CGFloat((index * 29 + 11) % 47) / 47 - 0.5
            let chipX = nx * w * 0.92
            let chipY = ny * h * 0.93
            let length = CGFloat(2 + (index % 5)) * (acid ? 1.3 : 1)
            let stroke = CGMutablePath()
            stroke.move(to: CGPoint(x: chipX, y: chipY))
            stroke.addLine(to: CGPoint(x: chipX + length,
                                       y: chipY + CGFloat(index % 3) - 1))
            if index.isMultiple(of: 3) {
                stroke.addLine(to: CGPoint(x: chipX + length * 0.65,
                                           y: chipY + CGFloat(index % 4) + 2))
            }
            let fleck = SKShapeNode(path: stroke)
            fleck.strokeColor = (acid
                ? SKColor(red: 0.85, green: 0.65, blue: 0.28, alpha: 0.27)
                : SKColor(red: 0.56, green: 0.79, blue: 0.78, alpha: 0.18))
            fleck.lineWidth = index.isMultiple(of: 4) ? 1.4 : 0.8
            fleck.fillColor = .clear
            fleck.zPosition = 0.25
            interior.addChild(fleck)
        }

        // Angular shore shelves tie the side-channel to nearby ground and
        // equipment. They render inside the clipped physical polygon, so the
        // movement lane remains open and untouched.
        for index in 0..<7 {
            let y = h * (CGFloat(index) / 6 - 0.5) * 0.75
            let innerX = w * (acid ? -0.19 : 0.17)
            let stagger = CGFloat(index % 3 - 1) * w * 0.025
            let x = innerX + stagger
            let width = w * (index.isMultiple(of: 2) ? 0.14 : 0.105)
            let shelfPath = CGMutablePath()
            shelfPath.move(to: CGPoint(x: x - width * 0.6, y: y - 4))
            shelfPath.addLine(to: CGPoint(x: x - width * 0.26, y: y + 3))
            shelfPath.addLine(to: CGPoint(x: x + width * 0.43, y: y + 2))
            shelfPath.addLine(to: CGPoint(x: x + width * 0.57, y: y - 2))
            shelfPath.closeSubpath()
            let shelf = SKShapeNode(path: shelfPath)
            shelf.fillColor = acid
                ? SKColor(red: 0.53, green: 0.34, blue: 0.18, alpha: 0.29)
                : SKColor(red: 0.38, green: 0.48, blue: 0.46, alpha: 0.25)
            shelf.strokeColor = .clear
            shelf.zPosition = 0.3
            interior.addChild(shelf)
        }

        // A narrow, quiet inner contour suggests depth without outlining the
        // entire playable section in an artificial hazard warning color.
        let shoreline = SKShapeNode(path: bankPath)
        shoreline.setScale(0.92)
        shoreline.fillColor = .clear
        shoreline.strokeColor = highlight.withAlphaComponent(0.12)
        shoreline.lineWidth = 1.3
        shoreline.zPosition = 0.2
        pool.addChild(shoreline)

        // Submerged silt / oily deposit follows the flow direction rather
        // than appearing as another floating circle.
        let depositPath = CGMutablePath()
        depositPath.move(to: CGPoint(x: -w * 0.34, y: -h * 0.32))
        depositPath.addLine(to: CGPoint(x: -w * 0.11, y: -h * 0.29))
        depositPath.addLine(to: CGPoint(x: w * 0.17, y: -h * 0.13))
        depositPath.addLine(to: CGPoint(x: w * 0.07, y: h * 0.06))
        depositPath.addLine(to: CGPoint(x: -w * 0.23, y: -h * 0.09))
        depositPath.closeSubpath()
        let deposit = SKShapeNode(path: depositPath)
        deposit.fillColor = deep.withAlphaComponent(0.27)
        deposit.strokeColor = .clear
        deposit.zPosition = 0.1
        pool.addChild(deposit)

        for index in 0..<5 {
            let span = w * (0.11 + CGFloat(index % 2) * 0.055)
            let centerX = w * (acid ? 0.17 : -0.17)
            let centerY = h * (0.37 - CGFloat(index) * 0.18)
            let line = CGMutablePath()
            line.move(to: CGPoint(x: centerX - span * 0.52,
                                  y: centerY - 1.7))
            line.addQuadCurve(
                to: CGPoint(x: centerX + span * 0.50, y: centerY + 0.2),
                control: CGPoint(x: centerX - span * 0.07,
                                 y: centerY + 3.8))
            let glint = SKShapeNode(path: line)
            glint.strokeColor = highlight.withAlphaComponent(
                index == 1 ? 0.42 : 0.25)
            glint.lineWidth = index == 1 ? 1.7 : 1.1
            glint.fillColor = .clear
            glint.zPosition = 0.4
            pool.addChild(glint)
        }

        if acid {
            // When the six-second pulse enters its damaging phase these
            // branched energy lines appear with the existing red warning rim.
            // Visibility changes only on a phase transition, never each frame.
            let veinsPath = CGMutablePath()
            veinsPath.move(to: CGPoint(x: -w * 0.29, y: h * 0.04))
            veinsPath.addLine(to: CGPoint(x: -w * 0.17, y: h * 0.17))
            veinsPath.addLine(to: CGPoint(x: -w * 0.04, y: h * 0.07))
            veinsPath.addLine(to: CGPoint(x: w * 0.12, y: h * 0.24))
            veinsPath.move(to: CGPoint(x: w * 0.09, y: h * 0.02))
            veinsPath.addLine(to: CGPoint(x: w * 0.27, y: -h * 0.09))
            let veins = SKShapeNode(path: veinsPath)
            veins.name = "acidActiveVeins"
            veins.strokeColor = SKColor(
                red: 0.87, green: 0.97, blue: 0.34, alpha: 0.80)
            veins.lineWidth = 1.8
            veins.glowWidth = 1.4
            veins.fillColor = .clear
            veins.zPosition = 1.3
            veins.isHidden = true
            pool.addChild(veins)
        }
    }

    /// Three material facets sit inside the existing rectangular rubble
    /// footprint. This is artwork only; TerrainHazards still owns collision.
    private func decorateRubbleObstacle(_ obstacle: SKShapeNode, size: CGSize) {
        let w = size.width
        let h = size.height
        let maritime = worldMapIndex == 1
        let rim = maritime
            ? SKColor(red: 0.55, green: 0.66, blue: 0.64, alpha: 1)
            : SKColor(red: 0.52, green: 0.57, blue: 0.45, alpha: 1)
        let rust = maritime
            ? SKColor(red: 0.56, green: 0.38, blue: 0.25, alpha: 1)
            : SKColor(red: 0.52, green: 0.32, blue: 0.17, alpha: 1)
        let deep = SKColor(red: 0.09, green: 0.16, blue: 0.17, alpha: 1)

        let upper = CGMutablePath()
        upper.move(to: CGPoint(x: -w * 0.45, y: h * 0.19))
        upper.addLine(to: CGPoint(x: -w * 0.35, y: h * 0.39))
        upper.addLine(to: CGPoint(x: w * 0.28, y: h * 0.39))
        upper.addLine(to: CGPoint(x: w * 0.44, y: h * 0.20))
        upper.addLine(to: CGPoint(x: w * 0.34, y: h * 0.08))
        upper.addLine(to: CGPoint(x: -w * 0.35, y: h * 0.08))
        upper.closeSubpath()
        let top = SKShapeNode(path: upper)
        top.fillColor = rim.withAlphaComponent(0.72)
        top.strokeColor = .clear
        top.zPosition = 0.5
        obstacle.addChild(top)

        let recess = SKShapeNode(rectOf: CGSize(
            width: w * 0.63, height: h * 0.29), cornerRadius: 3)
        recess.position = CGPoint(x: 0, y: -h * 0.17)
        recess.fillColor = deep.withAlphaComponent(0.80)
        recess.strokeColor = rim.withAlphaComponent(0.35)
        recess.lineWidth = 1
        recess.zPosition = 0.6
        obstacle.addChild(recess)

        // Sloped joints and missing corners give the block a silhouette that
        // is readable without a bright white outline or debug text.
        for side: CGFloat in [-1, 1] {
            let brace = SKShapeNode(rectOf: CGSize(
                width: max(4, w * 0.085), height: h * 0.64),
                cornerRadius: 1)
            brace.position = CGPoint(x: side * w * 0.36, y: -h * 0.04)
            brace.zRotation = side * 0.11
            brace.fillColor = rim.withAlphaComponent(side < 0 ? 0.44 : 0.28)
            brace.strokeColor = .clear
            brace.zPosition = 0.7
            obstacle.addChild(brace)

            let bolt = SKShapeNode(circleOfRadius: 2.1)
            bolt.position = CGPoint(x: side * w * 0.34, y: h * 0.17)
            bolt.fillColor = rust
            bolt.strokeColor = deep
            bolt.lineWidth = 0.7
            bolt.zPosition = 1
            obstacle.addChild(bolt)
        }
        let fracture = CGMutablePath()
        fracture.move(to: CGPoint(x: -w * 0.09, y: h * 0.31))
        fracture.addLine(to: CGPoint(x: -w * 0.02, y: h * 0.16))
        fracture.addLine(to: CGPoint(x: -w * 0.06, y: h * 0.07))
        let crack = SKShapeNode(path: fracture)
        crack.strokeColor = deep.withAlphaComponent(0.65)
        crack.lineWidth = 1.5
        crack.zPosition = 0.85
        obstacle.addChild(crack)
    }

    private func updateTerrainHazards() {
        guard !acidVisualNodes.isEmpty else { return }
        let acidOn = TerrainHazards.acidActive(at: waveElapsed)
        if displayedAcidActive != acidOn {
            displayedAcidActive = acidOn
            for shape in acidVisualNodes {
                shape.fillColor = acidOn
                    ? SKColor(red: 0.24, green: 0.70, blue: 0.16, alpha: 0.77)
                    : SKColor(red: 0.19, green: 0.43, blue: 0.13, alpha: 0.66)
                shape.strokeColor = acidOn
                    ? SKColor.systemRed.withAlphaComponent(0.91)
                    : SKColor(red: 0.64, green: 0.72, blue: 0.29, alpha: 0.45)
                shape.glowWidth = acidOn ? 1.7 : 0
                shape.childNode(withName: "acidActiveVeins")?.isHidden = !acidOn
            }
        }
        guard phase == .playing else { return }
        if TerrainHazards.acidTouches(pilot.position, patches: roomHazards, at: waveElapsed),
           combatTime >= nextAcidDamageAt {
            nextAcidDamageAt = combatTime + 1.0
            damagePilot(5)
        }
        // Enemies also take acid damage. A pilot can lure them into an active
        // pool, but damage is modest so terrain does not trivialize combat.
        if acidOn {
            var enemyDamaged = false
            for index in enemies.indices {
                let node = enemies[index].node
                let identifier = ObjectIdentifier(node)
                guard enemies[index].health > 0,
                      combatTime >= enemies[index].activeAt,
                      TerrainHazards.acidTouches(node.position, patches: roomHazards,
                                                at: waveElapsed),
                      combatTime >= (enemyAcidDamageAt[identifier] ?? 0) else { continue }
                enemies[index].health -= 2
                enemyDamaged = true
                enemyAcidDamageAt[identifier] = combatTime + 1.0
                impact(at: node.position, color: .systemGreen,
                       destroyed: enemies[index].health <= 0)
                EnemyCombatFeedback.hit(enemies[index].node, from: node.position)
                updateEnemyHealthBar(at: index)
            }
            if enemyDamaged { removeDefeatedEnemies() }
        }
    }

    private func startWave() {
        hud.isHidden = false
        if wave > 0 && wave < worldWaveCount && !gateUnlocked {
            showZoneGate()
            return
        }
        gateUnlocked = false
        // Keep the exit hidden during combat; the gate only appears after
        // the room is cleared, avoiding a distracting LOCKED banner.
        passageGate.isHidden = true
        passageGate.fillColor = .darkGray
        (passageGate.children.first as? SKLabelNode)?.text = "LOCKED"
        passageGate.childNode(withName: "gateArrow")?.isHidden = true
        passageGate.removeAllActions()
        passageGate.childNode(withName: "portalEnergy")?.removeAllActions()
        passageGate.childNode(withName: "portalEnergy")?.alpha = 1
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
        // Surviving enemies cannot accompany a departing pilot. Discard
        // without treating them as kills or paying extra XP/coins.
        for enemy in enemies { enemy.node.removeFromParent() }
        enemies.removeAll()
        for drop in xpDrops { drop.node.removeFromParent() }
        xpDrops.removeAll()
        bossNode = nil
        burns.removeAll()
        lastOrbitalHit.removeAll()
        enemyAcidDamageAt.removeAll()
        roomCleared = false
        checkpointUsed = false
        checkpointPresented = false
        ArcadeMusic.shared.play(wave + 1 == worldWaveCount ? .boss : .forest)
        heldTouch = nil
        aimPoint = nil
        movementTarget = nil
        movementOrigin = nil
        pilot.position = entryPoint
        pilotGun.zRotation = 0
        pilotShieldUntil = combatTime + 1.2
        lastShot = combatTime
        nextBladeArcAt = combatTime + 0.7
        clearOverlay()
        overlayBackdrop.isHidden = true
        wave += 1
        // Equipment defense needs a real separate objective. Until added,
        // its scheduled slots retain the ordinary tactical encounter.
        activeEncounter = SurvivalEncounterRules.kind(
            world: worldMapIndex, room: wave) == .survival ? .survival : .tactical
        let retainQACamera = isCaptureMode && expandedArenaPreview
        expandedArenaPreview = activeEncounter == .survival || retainQACamera
        arena.childNode(withName: "expandedArenaPreviewGround")?.removeFromParent()
        if expandedArenaPreview { installArenaPreviewGround() }
        pilot.position = entryPoint
        arena.position = expandedArenaPreview
            ? ArenaLayout.offset(for: pilot.position, viewportSize: size) : .zero
        passageGate.position = CGPoint(x: roomBounds.midX, y: roomBounds.maxY - 24)
        extractionPortal.isHidden = true
        checkpointButton.position = CGPoint(
            x: size.width / 2, y: RoomRules.bounds(for: size).minY + 25)
        if !isCaptureMode {
            _ = WorldCatalog.recordBestRoom(worldMapIndex, room: wave)
        }
        roomSalvageEarned = 0
        roomSalvageRecoveredCredit = 0
        roomCoinsEarned = 0
        roomCoinsRecoveredCredit = 0
        roomXPEarned = 0
        roomXPRecoveredCredit = 0
        controlsHint.removeAllActions()
        controlsHint.isHidden = wave != 1
        controlsHint.alpha = 1
        if wave == 1 {
            controlsHint.run(.sequence([.wait(forDuration: 3.0),
                                        .fadeOut(withDuration: 0.5)]))
        }
        warning.removeAllActions()
        warning.isHidden = true
        warning.alpha = 1
        let activeZone = min((wave - 1) / 5, 3)
        backgroundColor = worldColor(for: activeZone)
        updateZoneScenery(activeZone)
        rebuildTerrainHazards()
        nextAcidDamageAt = combatTime + 1.0
        enemyAcidDamageAt.removeAll()
        if wave == 1 || (wave - 1) % 5 == 0 || wave == worldWaveCount ||
           [4, 9, 14, 19].contains(wave) {
            zoneBanner.removeAllActions()
            let labels = worldMapIndex == 0 ? zoneNames :
                (worldMapIndex == 1
                    ? ["OUTER DOCKS", "FLOODED CHANNEL", "PUMP STATION", "WARDEN PLATFORM"]
                    : ["TOXIC PERIMETER", "CORROSIVE PASS", "WASTE PROCESSING", "SENTINEL CHAMBER"])
            zoneBanner.text = wave == worldWaveCount
                ? "BOSS: \(selectedWorld.boss)"
                : ([4, 9, 14, 19].contains(wave)
                    ? EncounterDirector.title(room: wave)
                    : labels[activeZone])
            zoneBanner.fontColor = wave == worldWaveCount ? .systemYellow : .white
            zoneBanner.alpha = 1
            zoneBanner.run(.sequence([.wait(forDuration: 1.6), .fadeOut(withDuration: 0.5)]))
        }
        spawned = 0
        waveTarget = CampaignPacing.targetEnemies(room: wave)
        if activeEncounter == .survival {
            zoneBanner.text = "SURVIVE • HOLD THE ARENA"
            zoneBanner.fontColor = .systemCyan
            zoneBanner.alpha = 1
            zoneBanner.run(.sequence([
                .wait(forDuration: 2.0), .fadeOut(withDuration: 0.5)
            ]))
        }
        survivalSpawnPhaseFinished = false
        // Shorten the empty opening without increasing enemy count or attack damage.
        spawnClock = 0.9
        waveElapsed = 0
        streak = 0
        updateHUD()
        saveRunRecovery()
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

    private func worldColor(for zone: Int) -> SKColor {
        if worldMapIndex == 0 { return zoneColors[min(3, max(0, zone))] }
        let colors: [SKColor] = worldMapIndex == 1 ? [
            SKColor(red: 0.11, green: 0.22, blue: 0.29, alpha: 1),
            SKColor(red: 0.10, green: 0.20, blue: 0.25, alpha: 1),
            SKColor(red: 0.13, green: 0.19, blue: 0.24, alpha: 1),
            SKColor(red: 0.13, green: 0.18, blue: 0.27, alpha: 1)
        ] : [
            SKColor(red: 0.22, green: 0.26, blue: 0.13, alpha: 1),
            SKColor(red: 0.25, green: 0.22, blue: 0.12, alpha: 1),
            SKColor(red: 0.21, green: 0.22, blue: 0.17, alpha: 1),
            SKColor(red: 0.21, green: 0.18, blue: 0.18, alpha: 1)
        ]
        return colors[min(3, max(0, zone))]
    }



    /// Edge-only containment machinery. Decorative shapes carry no physics
    /// bodies and cannot interfere with environmental hazard telegraphs.
    private func addToxicEdgeProp(to prop: SKShapeNode, index: Int,
                                  leftSide: Bool, guardian: Bool) {
        prop.fillColor = .clear
        prop.strokeColor = .clear
        let dark = SKColor(red: 0.15, green: 0.21, blue: 0.20, alpha: 1)
        let steel = SKColor(red: 0.34, green: 0.40, blue: 0.36, alpha: 1)
        let light = SKColor(red: 0.52, green: 0.60, blue: 0.46, alpha: 1)
        let rust = SKColor(red: 0.54, green: 0.30, blue: 0.15, alpha: 1)
        let shadow = SKShapeNode(ellipseOf: CGSize(width: 45, height: 12))
        shadow.fillColor = SKColor.black.withAlphaComponent(0.32)
        shadow.strokeColor = .clear
        shadow.position = CGPoint(x: 3, y: -17)
        shadow.zPosition = -0.6
        prop.addChild(shadow)
        if index % 3 == 0 {
            // Faceted containment tank with shaded side and oxidized seam.
            let tank = SKShapeNode(rectOf: CGSize(width: 29, height: 41),
                                   cornerRadius: 5)
            tank.fillColor = steel
            tank.strokeColor = dark
            tank.lineWidth = 2
            tank.zRotation = leftSide ? -0.09 : 0.09
            tank.zPosition = 0.5
            prop.addChild(tank)
            let side = SKShapeNode(rectOf: CGSize(width: 9, height: 34))
            side.fillColor = dark.withAlphaComponent(0.45)
            side.strokeColor = .clear
            side.position.x = 9
            tank.addChild(side)
            let cap = SKShapeNode(ellipseOf: CGSize(width: 29, height: 8))
            cap.fillColor = light
            cap.strokeColor = dark
            cap.lineWidth = 1
            cap.position.y = 19
            tank.addChild(cap)
            let seam = SKShapeNode(rectOf: CGSize(width: 29, height: 6))
            seam.fillColor = rust.withAlphaComponent(0.77)
            seam.strokeColor = .clear
            seam.position.y = -8
            tank.addChild(seam)
        } else if index % 3 == 1 {
            // Broken ventilation box with dark grille and corroded lip.
            let housing = SKShapeNode(rectOf: CGSize(width: 47, height: 29),
                                      cornerRadius: 3)
            housing.fillColor = dark
            housing.strokeColor = light.withAlphaComponent(0.76)
            housing.lineWidth = 2
            housing.zPosition = 0.5
            prop.addChild(housing)
            let grille = SKShapeNode(rectOf: CGSize(width: 32, height: 17),
                                     cornerRadius: 2)
            grille.fillColor = SKColor(red: 0.07, green: 0.13,
                                      blue: 0.12, alpha: 1)
            grille.strokeColor = rust.withAlphaComponent(0.65)
            grille.lineWidth = 1
            housing.addChild(grille)
            for slat in -1...1 {
                let vent = SKShapeNode(rectOf: CGSize(width: 4, height: 13))
                vent.fillColor = steel
                vent.strokeColor = .clear
                vent.position.x = CGFloat(slat) * 9
                grille.addChild(vent)
            }
            let corrosion = SKShapeNode(rectOf: CGSize(width: 26, height: 3))
            corrosion.fillColor = rust
            corrosion.strokeColor = .clear
            corrosion.position = CGPoint(x: leftSide ? -6 : 6, y: 11)
            housing.addChild(corrosion)
        } else {
            // Leaning pipeline fragments, with exposed joint rings.
            let pipe = SKShapeNode(rectOf: CGSize(width: 51, height: 10),
                                   cornerRadius: 2)
            pipe.fillColor = steel
            pipe.strokeColor = dark
            pipe.lineWidth = 1.8
            pipe.zRotation = leftSide ? 0.20 : -0.20
            pipe.zPosition = 0.5
            prop.addChild(pipe)
            let ring = SKShapeNode(rectOf: CGSize(width: 8, height: 17),
                                   cornerRadius: 1)
            ring.fillColor = light
            ring.strokeColor = dark
            ring.lineWidth = 1
            ring.position.x = leftSide ? 16 : -16
            pipe.addChild(ring)
            let stain = SKShapeNode(rectOf: CGSize(width: 28, height: 3))
            stain.fillColor = rust.withAlphaComponent(0.87)
            stain.strokeColor = .clear
            stain.position = CGPoint(x: 2, y: -2)
            pipe.addChild(stain)
        }
        if guardian {
            // Existing guardian warning beacon is layered separately.
            let marking = SKShapeNode(rectOf: CGSize(width: 27, height: 3),
                                      cornerRadius: 1)
            marking.fillColor = SKColor(red: 0.73, green: 0.52,
                                        blue: 0.17, alpha: 0.80)
            marking.strokeColor = .clear
            marking.position.y = -18
            marking.zPosition = 0.8
            prop.addChild(marking)
        }
    }

    /// Maritime silhouettes have a low node count and stay at the sides.
    /// No added collision shapes, touch targets or hazard indicators.
    private func addFloodedEdgeProp(to prop: SKShapeNode, index: Int,
                                    leftSide: Bool) {
        prop.fillColor = .clear
        prop.strokeColor = .clear
        let shadow = SKShapeNode(ellipseOf: CGSize(width: 43, height: 11))
        shadow.fillColor = SKColor.black.withAlphaComponent(0.32)
        shadow.strokeColor = .clear
        shadow.position = CGPoint(x: 4, y: -17)
        shadow.zPosition = -0.6
        prop.addChild(shadow)

        let steel = SKColor(red: 0.29, green: 0.39, blue: 0.41, alpha: 1)
        let edge = SKColor(red: 0.53, green: 0.64, blue: 0.60, alpha: 1)
        let rust = SKColor(red: 0.52, green: 0.32, blue: 0.21, alpha: 1)
        switch index % 3 {
        case 0:
            // Leaning mooring post and its corroded reinforced base.
            let support = SKShapeNode(rectOf: CGSize(width: 13, height: 51),
                                      cornerRadius: 3)
            support.fillColor = steel
            support.strokeColor = SKColor(red: 0.11, green: 0.22,
                                           blue: 0.26, alpha: 1)
            support.lineWidth = 2
            support.position = CGPoint(x: 0, y: 5)
            support.zRotation = leftSide ? -0.10 : 0.10
            support.zPosition = 0.6
            prop.addChild(support)
            let cap = SKShapeNode(rectOf: CGSize(width: 23, height: 8),
                                  cornerRadius: 2)
            cap.fillColor = edge
            cap.strokeColor = .clear
            cap.position = CGPoint(x: 0, y: 25)
            support.addChild(cap)
            let oxidation = SKShapeNode(rectOf: CGSize(width: 8, height: 10),
                                        cornerRadius: 1)
            oxidation.fillColor = rust.withAlphaComponent(0.82)
            oxidation.strokeColor = .clear
            oxidation.position = CGPoint(x: leftSide ? -3 : 3, y: -7)
            support.addChild(oxidation)
        case 1:
            // Broken concrete dock plinth with a chipped raised top.
            let block = SKShapeNode(path: {
                let path = CGMutablePath()
                path.move(to: CGPoint(x: -21, y: -16))
                path.addLine(to: CGPoint(x: -17, y: 7))
                path.addLine(to: CGPoint(x: -5, y: 14))
                path.addLine(to: CGPoint(x: 19, y: 9))
                path.addLine(to: CGPoint(x: 22, y: -13))
                path.closeSubpath()
                return path
            }())
            block.fillColor = SKColor(red: 0.29, green: 0.38,
                                     blue: 0.39, alpha: 1)
            block.strokeColor = SKColor(red: 0.13, green: 0.25,
                                       blue: 0.27, alpha: 1)
            block.lineWidth = 1.5
            block.zPosition = 0.6
            prop.addChild(block)
            let top = SKShapeNode(path: {
                let path = CGMutablePath()
                path.move(to: CGPoint(x: -17, y: 7))
                path.addLine(to: CGPoint(x: -5, y: 14))
                path.addLine(to: CGPoint(x: 19, y: 9))
                path.addLine(to: CGPoint(x: 9, y: 4))
                path.closeSubpath()
                return path
            }())
            top.fillColor = edge.withAlphaComponent(0.82)
            top.strokeColor = .clear
            top.zPosition = 0.7
            prop.addChild(top)
            let crack = SKShapeNode()
            let fracture = CGMutablePath()
            fracture.move(to: CGPoint(x: -1, y: 5))
            fracture.addLine(to: CGPoint(x: 2, y: -1))
            fracture.addLine(to: CGPoint(x: -2, y: -8))
            crack.path = fracture
            crack.strokeColor = SKColor.black.withAlphaComponent(0.33)
            crack.lineWidth = 1.5
            crack.zPosition = 0.8
            prop.addChild(crack)
        default:
            // Driftwood and a rusting metal rail sunk into the waterfront.
            let beam = SKShapeNode(rectOf: CGSize(width: 52, height: 9),
                                   cornerRadius: 2)
            beam.fillColor = SKColor(red: 0.33, green: 0.37,
                                     blue: 0.36, alpha: 1)
            beam.strokeColor = SKColor(red: 0.14, green: 0.24,
                                       blue: 0.27, alpha: 1)
            beam.lineWidth = 1.5
            beam.zRotation = leftSide ? 0.14 : -0.14
            beam.position = CGPoint(x: 0, y: -3)
            beam.zPosition = 0.6
            prop.addChild(beam)
            let corrodedEdge = SKShapeNode(rectOf: CGSize(width: 33, height: 2))
            corrodedEdge.fillColor = rust.withAlphaComponent(0.88)
            corrodedEdge.strokeColor = .clear
            corrodedEdge.position = CGPoint(x: 4, y: -2)
            beam.addChild(corrodedEdge)
        }
        // Small reeds are silhouette accents, not water hazard markers.
        for reedIndex in 0..<3 {
            let reed = SKShapeNode()
            let path = CGMutablePath()
            let baseX = CGFloat(reedIndex * 8 - 12)
            path.move(to: CGPoint(x: baseX, y: -18))
            path.addQuadCurve(
                to: CGPoint(x: baseX + (leftSide ? 5 : -5), y: -7 - CGFloat(reedIndex * 3)),
                control: CGPoint(x: baseX - 4, y: -11))
            reed.path = path
            reed.strokeColor = SKColor(
                red: 0.35, green: 0.50, blue: 0.37, alpha: 0.58)
            reed.lineWidth = 1.4
            reed.zPosition = 0.8
            prop.addChild(reed)
        }
    }

    private func updateZoneScenery(_ requestedZone: Int) {
        // Later worlds emphasize industrial ruins rather than using the
        // forest's illustrated pines for every environment.
        let zone = worldMapIndex == 0 ? requestedZone :
            (worldMapIndex == 1 ? max(1, requestedZone) : max(2, requestedZone))
        zoneScenery.removeAllChildren()
        // Forest art is atmospheric, not terrain geometry. Only World 1
        // displays the continuous forest texture; later worlds retain their
        // distinct opaque industrial and toxic environment palettes.
        let roomArt = arena.childNode(withName: "roomArtwork")
        let nonForestWorld = worldMapIndex != 0
        roomArt?.childNode(withName: "forestAmbientBackdrop")?.isHidden = nonForestWorld
        roomArt?.childNode(withName: "floodedAmbientBackdrop")?.isHidden = worldMapIndex != 1
        roomArt?.childNode(withName: "toxicAmbientBackdrop")?.isHidden = worldMapIndex != 2
        if let floor = roomArt?.childNode(withName: "roomFloor") as? SKShapeNode {
            floor.fillColor = worldMapIndex == 2
                ? SKColor(red: 0.18, green: 0.22, blue: 0.14, alpha: 0.13)
                : (worldMapIndex == 1
                    ? SKColor(red: 0.10, green: 0.19, blue: 0.23, alpha: 0.14)
                    : (zone == 1
                    ? SKColor(red: 0.16, green: 0.25, blue: 0.20, alpha: 0.16)
                    : SKColor(red: 0.18, green: 0.28, blue: 0.20, alpha: 0.12)))
            floor.strokeColor = nonForestWorld
                ? SKColor(red: 0.10, green: 0.18, blue: 0.19, alpha: 0.70)
                : SKColor(red: 0.10, green: 0.19, blue: 0.17, alpha: 0.18)
        }
        roomArt?.childNode(withName: "roomContactEdge")?.alpha = nonForestWorld ? 1 : 0.55
        // Alternate prop placement between rooms so successive arenas feel less repetitive.
        let count = worldMapIndex == 1 ? 6 + (wave % 2) : (zone <= 1 ? 8 + (wave % 3) : 5 + (wave % 3))
        let roomVariant = (wave - 1) % 4
        for index in 0..<count {
            let leftSide = (index + roomVariant).isMultiple(of: 2)
            let side: CGFloat = zone == 0 ? (leftSide ? 0.12 : 0.88) :
                (zone == 1 ? (leftSide ? 0.16 : 0.84) : (leftSide ? 0.09 : 0.91))
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
            prop.alpha = worldMapIndex == 2 ? 0.94 :
                (zone == 0 ? 0.95 : (zone == 1 ? 0.92 : 0.55))
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
            if zone == 2 && worldMapIndex != 2 {
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
            if worldMapIndex == 2 {
                addToxicEdgeProp(to: prop, index: index,
                                 leftSide: leftSide, guardian: zone == 3)
            }
            if zone == 1 && worldMapIndex == 1 {
                // Flooded Outpost has metal piers, eroded blocks and driftwood,
                // not broadleaf trees borrowed from the forest. These are
                // decorative edge props; water slowdowns come from hazards.
                addFloodedEdgeProp(to: prop, index: index, leftSide: leftSide)
            }
            if zone == 1 && worldMapIndex == 0 {
                // Overgrown Path has a distinct canopy: broadleaf trees,
                // hanging vines and larger layered thickets. All remain on
                // the perimeter, outside the player's movement corridor.
                prop.fillColor = .clear
                prop.strokeColor = .clear
                let canopy = (index + roomVariant) % 3 != 1
                if canopy {
                    let shadow = SKShapeNode(ellipseOf: CGSize(width: 48, height: 13))
                    shadow.fillColor = .black.withAlphaComponent(0.32)
                    shadow.strokeColor = .clear
                    shadow.position = CGPoint(x: 5, y: -24)
                    shadow.zPosition = -0.6
                    prop.addChild(shadow)
                    let tree = SKSpriteNode(texture: productionTexture(
                        named: "forest_broadleaf", fallback: forestPineTexture))
                    tree.size = CGSize(width: 70, height: 94)
                    tree.position = CGPoint(x: leftSide ? -5 : 5, y: 8)
                    tree.xScale = leftSide ? 1 : -1
                    tree.zRotation = CGFloat((index + wave) % 5 - 2) * 0.025
                    tree.zPosition = 0.8
                    prop.addChild(tree)
                    for vineIndex in 0..<2 {
                        let vine = SKShapeNode(path: {
                            let p = CGMutablePath()
                            let vx = CGFloat(vineIndex == 0 ? -16 : 19)
                            p.move(to: CGPoint(x: vx, y: 13))
                            p.addQuadCurve(to: CGPoint(x: vx + 4, y: -29),
                                           control: CGPoint(x: vx - 9, y: -10))
                            return p
                        }())
                        vine.strokeColor = SKColor(red: 0.24, green: 0.55, blue: 0.30, alpha: 0.9)
                        vine.lineWidth = 2
                        vine.zPosition = 1.2
                        prop.addChild(vine)
                    }
                } else {
                    let underbrush = SKShapeNode(path: BattlefieldArt.terrainShape(
                        width: 53, height: 17, variation: index + wave))
                    underbrush.fillColor = SKColor(red: 0.08, green: 0.21, blue: 0.14, alpha: 0.9)
                    underbrush.strokeColor = .clear
                    underbrush.position.y = -12
                    prop.addChild(underbrush)
                    for leafIndex in 0..<8 {
                        let leaf = SKShapeNode(ellipseOf: CGSize(
                            width: CGFloat(15 + leafIndex % 3 * 4),
                            height: CGFloat(10 + leafIndex % 2 * 4)))
                        leaf.fillColor = SKColor(
                            red: 0.09 + CGFloat(leafIndex % 3) * 0.025,
                            green: 0.32 + CGFloat(leafIndex % 4) * 0.045,
                            blue: 0.17 + CGFloat(leafIndex % 2) * 0.04, alpha: 0.96)
                        leaf.strokeColor = .clear
                        leaf.position = CGPoint(
                            x: CGFloat((leafIndex * 11) % 60 - 29),
                            y: CGFloat((leafIndex * 13) % 21 - 7))
                        leaf.zRotation = CGFloat((leafIndex * 3 + wave) % 7 - 3) * 0.20
                        leaf.zPosition = 0.2 + CGFloat(leafIndex) * 0.01
                        prop.addChild(leaf)
                    }
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
                // Roughly every third tree is a broadleaf: intentionally distinct
                // outline, with a consistent side placement and clear center lane.
                let isBroadleaf = (index + roomVariant).isMultiple(of: 3)
                let treeAsset = isBroadleaf ? "forest_broadleaf" : "forest_pine"
                let hasTreeArt = productionImage(named: treeAsset) != nil
                let tree = SKSpriteNode(texture: productionTexture(named: treeAsset, fallback: forestPineTexture))
                tree.size = CGSize(
                    width: 43 + CGFloat((index * 7 + wave) % 5) * 6,
                    height: 59 + CGFloat((index * 3 + wave) % 5) * 8
                )
                tree.xScale = (index + wave).isMultiple(of: 3) ? -1 : 1
                tree.zRotation = CGFloat(((index * 7 + wave * 3) % 9) - 4) * 0.018
                tree.position = CGPoint(x: isBroadleaf ? (leftSide ? 5 : -5) : 0, y: 5)
                tree.zPosition = 1
                prop.addChild(tree)
                // Layered pine foliage and trunk add depth without blocking movement.
                let trunk = SKShapeNode(rectOf: CGSize(width: 6, height: 17), cornerRadius: 2)
                trunk.fillColor = .brown
                trunk.strokeColor = .clear
                trunk.position = CGPoint(x: 0, y: -15)
                trunk.zPosition = -0.1
                trunk.isHidden = hasTreeArt
                prop.addChild(trunk)
                let canopy = SKShapeNode(ellipseOf: CGSize(width: 20, height: 12))
                canopy.fillColor = .systemMint.withAlphaComponent(0.65)
                canopy.strokeColor = .clear
                canopy.position = CGPoint(x: -3, y: 3)
                canopy.zPosition = 1
                canopy.isHidden = hasTreeArt
                prop.addChild(canopy)
            }
        }
        // Sparse, asymmetrical forest dressing. Avoid evenly spaced ellipses:
        // they created obvious rows and dark round spots in the simulator.
        if worldMapIndex == 0 && zone <= 1 {
            for index in 0..<17 {
                let fx = CGFloat((index * 37 + wave * 17 + 11) % 97) / 97
                let fy = CGFloat((index * 53 + wave * 29 + 7) % 89) / 89
                let x = roomBounds.minX + 21 + (roomBounds.width - 42) * fx
                let y = roomBounds.minY + 37 + (roomBounds.height - 85) * fy
                let patch = SKShapeNode(path: BattlefieldArt.terrainShape(
                    width: CGFloat(13 + (index * 7) % 20),
                    height: CGFloat(5 + (index * 3) % 7),
                    variation: wave + index
                ))
                patch.fillColor = SKColor(
                    red: 0.10, green: 0.24, blue: 0.16, alpha: 0.24
                )
                patch.strokeColor = .clear
                patch.position = CGPoint(x: x, y: y)
                patch.zRotation = CGFloat((index * 3 + wave) % 9 - 4) * 0.16
                patch.zPosition = -0.7
                zoneScenery.addChild(patch)
                if index.isMultiple(of: 2) {
                    for leafIndex in 0..<2 {
                        let leaf = SKShapeNode(path: BattlefieldArt.terrainShape(
                            width: 7, height: 3, variation: index + leafIndex
                        ))
                        leaf.fillColor = SKColor(
                            red: 0.17 + CGFloat(leafIndex) * 0.04,
                            green: 0.36 + CGFloat(index % 3) * 0.05,
                            blue: 0.20, alpha: 0.57
                        )
                        leaf.strokeColor = .clear
                        leaf.position = CGPoint(
                            x: x + CGFloat(leafIndex * 7 - 4),
                            y: y + CGFloat((index * 5 + leafIndex) % 7 - 3)
                        )
                        leaf.zRotation = CGFloat((index + leafIndex) % 5) * 0.31
                        leaf.zPosition = -0.55
                        zoneScenery.addChild(leaf)
                    }
                }
                if index.isMultiple(of: 5) {
                    let stone = SKShapeNode(path: BattlefieldArt.terrainShape(
                        width: 11, height: 6, variation: index
                    ))
                    stone.fillColor = SKColor(
                        red: 0.32, green: 0.37, blue: 0.33, alpha: 0.57
                    )
                    stone.strokeColor = .clear
                    stone.position = CGPoint(x: x + 6, y: y - 4)
                    stone.zPosition = -0.6
                    zoneScenery.addChild(stone)
                }
            }
            // The broken path is only a handful of subdued scuffs. No
            // repeated horizontal bands, straight road markings or obstacles.
            for index in 0..<6 {
                let scuff = SKShapeNode(path: BattlefieldArt.terrainShape(
                    width: CGFloat(20 + (index * 5) % 15),
                    height: CGFloat(6 + index % 4),
                    variation: index + wave
                ))
                scuff.fillColor = SKColor(
                    red: 0.30, green: 0.27, blue: 0.19, alpha: 0.11
                )
                scuff.strokeColor = .clear
                scuff.position = CGPoint(
                    x: roomBounds.midX + CGFloat((index * 23 + wave * 11) % 67 - 33),
                    y: roomBounds.minY + 55 + CGFloat(index) *
                        max(25, (roomBounds.height - 110) / 6)
                )
                scuff.zRotation = CGFloat((index * 3 + wave) % 7 - 3) * 0.12
                scuff.zPosition = -0.85
                zoneScenery.addChild(scuff)
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
        // No uniformly spaced horizontal accent dashes: the forest is not a grid.
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

    private func spawnEnemy(artReviewType: Int? = nil) {
        let isBoss = wave == worldWaveCount
        // Shooters arrive in room 6; lobbers join mixed groups from room 11.
        let roll = EncounterDirector.enemyRoll(
            world: worldMapIndex, room: wave, slot: spawned)
        let type = artReviewType ?? WorldCatalog.enemyType(
            world: worldMapIndex, room: wave, roll: roll)
        let radius: CGFloat = isBoss ? 37 : (type == 1 ? 23 : (type == 2 ? 17 : (type == 3 ? 26 : 14)))
        let node = SKShapeNode(circleOfRadius: radius)
        node.fillColor = type == 1 ? .systemRed : (type == 2 ? .systemPurple : (type == 3 ? .systemGray : .systemOrange))
        if type == 4 { node.fillColor = .systemBlue }
        if type == 5 { node.fillColor = .systemOrange }
        node.strokeColor = type == 1 ? .systemYellow : .white
        node.lineWidth = type == 1 ? 4 : 2
        let usesIllustratedEnemy = !isBoss && productionImage(named: type == 1 ? "scout_idle" : (type == 2 ? "raider_idle" : (type == 3 ? "heavy_idle" : (type == 4 ? "shooter_idle" : (type == 5 ? "lobber_idle" : "grunt_idle"))))) != nil
        // Textured chassis overlay: preserves collision geometry while changing the visible silhouette.
        if !isBoss {
            // Use class-specific artwork only for matching roles; never recolor finished illustrations.
            let assetName = type == 1 ? "scout_idle" : (type == 2 ? "raider_idle" : (type == 3 ? "heavy_idle" : (type == 4 ? "shooter_idle" : (type == 5 ? "lobber_idle" : "grunt_idle"))))
            let hasProductionArt = productionImage(named: assetName) != nil
            // The collision circle must not show through transparent character art.
            if hasProductionArt {
                node.fillColor = .clear
                node.strokeColor = .clear
            }
            let armor = SKSpriteNode(texture: productionTexture(named: assetName, fallback: enemyChassisTexture))
            // A modest art-only enlargement preserves the threat silhouette
            // without modifying radius, overlap tests or ranged attack rules.
            armor.size = CGSize(
                width: radius * (hasProductionArt ? 2.48 : 2.3),
                height: radius * (hasProductionArt ? 2.74 : 2.55))
            armor.color = (type == 1 || type == 2) ? .systemRed : (type == 3 ? .gray : (type == 4 ? .systemBlue : .orange))
            armor.colorBlendFactor = hasProductionArt ? 0 : 0.72
            armor.zPosition = 0.8
            armor.name = "enemyArt"
            // Production sprites carry their own silhouette; do not draw
            // an ellipse around the artwork (it reads as a collision ring).
            node.addChild(armor)
            if hasProductionArt {
                // Ground shadow anchors illustrated enemies without obscuring their silhouette.
                let contactShadow = SKShapeNode(ellipseOf: CGSize(
                    width: radius * 1.85, height: radius * 0.51))
                contactShadow.fillColor = SKColor.black.withAlphaComponent(0.39)
                contactShadow.strokeColor = .clear
                contactShadow.position = CGPoint(x: 3, y: -radius * 0.99)
                contactShadow.name = "enemyGroundShadow"
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
            } else if type == 4 && !hasProductionArt {
                // Shooters: narrow antennae distinguish precision threats.
                for side: CGFloat in [-1, 1] {
                    let antenna = SKShapeNode(rectOf: CGSize(width: 3, height: radius * 0.85), cornerRadius: 1)
                    antenna.position = CGPoint(x: side * radius * 0.65, y: radius * 0.9)
                    antenna.fillColor = .cyan
                    antenna.strokeColor = .clear
                    antenna.zPosition = 1.2
                    node.addChild(antenna)
                }
            } else if type == 5 && !hasProductionArt {
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
            crown.fillColor = worldMapIndex == 0 ? .systemOrange :
                (worldMapIndex == 1 ? .systemBlue : .systemGreen)
            crown.strokeColor = .white
            crown.lineWidth = 2
            crown.position.y = radius * 0.8
            crown.zPosition = 2
            node.addChild(crown)
            let eye = SKShapeNode(rectOf: CGSize(width: radius * 0.9, height: 10), cornerRadius: 3)
            eye.fillColor = worldMapIndex == 2 ? .systemGreen : .systemCyan
            eye.strokeColor = .white
            eye.position.y = radius * 0.14
            eye.zPosition = 3
            node.addChild(eye)
            // Guardian side armor and reactor make the World 1 boss stand out.
            for side: CGFloat in [-1, 1] {
                let guardPlate = SKShapeNode(rectOf: CGSize(width: 18, height: 28), cornerRadius: 5)
                guardPlate.position = CGPoint(x: side * radius * 0.83, y: -5)
                guardPlate.fillColor = worldMapIndex == 0 ? .systemRed :
                    (worldMapIndex == 1 ? .systemBlue : .systemGreen)
                guardPlate.strokeColor = worldMapIndex == 2 ? .systemYellow : .white
                guardPlate.lineWidth = 2
                guardPlate.zPosition = 2
                node.addChild(guardPlate)
            }
            let reactor = SKShapeNode(circleOfRadius: 9)
            reactor.position = CGPoint(x: 0, y: -radius * 0.42)
            reactor.fillColor = worldMapIndex == 0 ? .systemOrange :
                (worldMapIndex == 1 ? .systemCyan : .systemGreen)
            reactor.strokeColor = .white
            reactor.glowWidth = 5
            reactor.zPosition = 4
            node.addChild(reactor)
        }
        if type >= 4 && !usesIllustratedEnemy {
            let weapon = SKShapeNode(rectOf: CGSize(width: type == 5 ? 22 : 8, height: 26), cornerRadius: 3)
            weapon.fillColor = type == 5 ? .systemYellow : .systemCyan
            weapon.strokeColor = .white
            weapon.position.y = 15
            node.addChild(weapon)
        }
        // Distinct silhouettes help players recognize ranged threats before they attack.
        if type == 4 && !usesIllustratedEnemy {
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
        } else if type == 5 && !usesIllustratedEnemy {
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
        if type == 1 && !usesIllustratedEnemy {
            let armor = SKShapeNode(rectOf: CGSize(width: radius * 1.5, height: 7), cornerRadius: 3)
            armor.fillColor = .systemYellow
            armor.strokeColor = .clear
            armor.position.y = radius * 0.52
            node.addChild(armor)
        } else if type == 2 && !usesIllustratedEnemy {
            let wing = SKShapeNode(rectOf: CGSize(width: radius * 2.5, height: 5), cornerRadius: 2)
            wing.fillColor = .systemPurple
            wing.strokeColor = .white
            node.addChild(wing)
        }
        // Telegraphed materialization inside the room, never on the pilot.
        let candidateBounds = roomBounds.insetBy(dx: radius + 10, dy: radius + 18)
        let candidates = (0..<32).compactMap { _ -> CGPoint? in
            // Orchestrated arrival lanes distinguish flanks, crossfire, and
            // mortar groups. Every candidate still respects terrain and
            // the pilot's minimum spawn separation.
            let lane = EncounterDirector.spawnLane(room: wave, slot: spawned)
            let x: CGFloat
            switch lane {
            case .left: x = CGFloat.random(in: 0.08...0.36)
            case .right: x = CGFloat.random(in: 0.64...0.92)
            case .center: x = CGFloat.random(in: 0.34...0.66)
            }
            let sample = CGPoint(x: x, y: CGFloat.random(in: 0.48...0.94))
            let location = CGPoint(
                x: candidateBounds.minX + candidateBounds.width * sample.x,
                y: candidateBounds.minY + candidateBounds.height * sample.y)
            return TerrainHazards.spawnAllowed(location, radius: radius,
                                               patches: roomHazards) ? sample : nil
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
        let enemyHP = ProcessInfo.processInfo.arguments.contains("-captureRangedCombatFrames")
            ? 70 : CampaignPacing.enemyHealth(world: worldMapIndex, room: wave, type: type)
        let speed = isBoss ? CGFloat(20) : CGFloat(type == 2 ? 105 : (type == 3 ? 32 : (type == 1 ? 38 : 65))) + CGFloat(min(wave * 3, 45))
        // Keep the track and fill together above the larger illustrated sprite.
        let healthBarOffset: CGFloat = usesIllustratedEnemy
            ? radius * 1.39 + 9 : radius + 12
        let healthTrack = SKShapeNode(rectOf: CGSize(width: radius * 2.2, height: 5), cornerRadius: 2)
        healthTrack.fillColor = SKColor.black.withAlphaComponent(0.7)
        healthTrack.strokeColor = .clear
        healthTrack.position.y = healthBarOffset
        node.addChild(healthTrack)
        let healthBar = SKShapeNode(rectOf: CGSize(width: radius * 2.2, height: 5), cornerRadius: 2)
        healthBar.fillColor = .systemGreen
        healthBar.strokeColor = .clear
        healthBar.position.y = healthBarOffset
        healthBar.zPosition = 1
        node.addChild(healthBar)
        enemies.append(Enemy(node: node, health: enemyHP, maxHealth: enemyHP, healthBar: healthBar, speed: speed, reward: CampaignPacing.killCoins(type: type, isBoss: isBoss), behavior: type, radius: radius, activeAt: combatTime + 0.9, weavePhase: CGFloat.random(in: 0...(2 * .pi)), nextAttack: combatTime + 1.7))
    }

    override func update(_ currentTime: TimeInterval) {
        if lastUpdate == 0 { lastUpdate = currentTime; clock = currentTime }
        let dt = min(0.05, max(0, currentTime - lastUpdate))
        let gameDt = dt * (fastForward ? 2.0 : 1.0)
        lastUpdate = currentTime
        clock += dt
        combatClock.advance(gameDt, playing: phase == .playing)
        // A lethal hazard/contact hit wins over an already-earned XP choice.
        if phase == .playing && health <= 0 { endGame(); return }
        if phase == .playing && combatTime >= nextRunSaveAt {
            nextRunSaveAt = combatTime + 4.0
            saveRunRecovery()
        }
        if phase == .playing {
            collectXP()
            if progress.pendingChoices > 0 {
                _ = presentPendingLevelUp(returningTo: .playing)
                return
            }
        }
        guard phase == .playing || phase == .gate else { return }
        // QA-only guided movement sweeps across the combat lane so consecutive
        // simulator frames show actual locomotion, dodging and automatic fire.
        // This launch argument is never used in the shipped game.
        if phase == .playing && (
            ProcessInfo.processInfo.arguments.contains("-captureGameplayFrames") ||
            ProcessInfo.processInfo.arguments.contains("-captureRangedCombatFrames") ||
            ProcessInfo.processInfo.arguments.contains("-captureSurvivalSwarmFrames")
        ) {
            let t = CGFloat(combatTime)
            movementTarget = CGPoint(
                x: roomBounds.midX + sin(t * 0.86) * roomBounds.width * 0.25,
                y: roomBounds.minY + roomBounds.height * (0.28 + 0.11 * sin(t * 0.49))
            )
        }
        if let heldTouch, let movementOrigin {
            let point = heldTouch.location(in: self)
            let dx = point.x - movementOrigin.x
            let dy = point.y - movementOrigin.y
            let length = hypot(dx, dy)
            movementTarget = length > 9 ? CGPoint(x: min(max(pilot.position.x + dx / length * 90, roomBounds.minX), roomBounds.maxX), y: min(max(pilot.position.y + dy / length * 90, roomBounds.minY), roomBounds.maxY)) : nil
        }
        let pilotBeforeMovement = pilot.position
        if let movementTarget {
            let dx = movementTarget.x - pilot.position.x
            let dy = movementTarget.y - pilot.position.y
            let distanceToTarget = hypot(dx, dy)
            if distanceToTarget > 2 {
                // Water now blocks movement; it no longer reduces speed.
                let step = min(distanceToTarget, pilotSpeed * CGFloat(gameDt))
                let requested = CGPoint(
                    x: pilot.position.x + dx / distanceToTarget * step,
                    y: pilot.position.y + dy / distanceToTarget * step)
                pilot.position = TerrainHazards.resolveMovement(
                    from: pilot.position, to: requested, patches: roomHazards, radius: 12)
            }
        }
        // Animate the visible sprite, not its parent collision container.
        // An actual displacement check prevents walking-in-place into rubble.
        updateArenaCamera(delta: dt)
        let isMoving = distance(pilotBeforeMovement, pilot.position) > 0.35
        let pose = CharacterMotion.pilot(
            time: combatTime, moving: isMoving, facing: pilotFacing,
            timeSinceShot: combatTime - lastShot)
        pilot.zRotation = 0
        pilot.yScale = 1
        if let pilotArt = pilot.childNode(withName: "pilotArt") as? SKSpriteNode {
            pilotArt.position.y = pose.verticalOffset
            pilotArt.zRotation = pose.lean
            pilotArt.xScale = pose.widthScale
            pilotArt.yScale = pose.heightScale
        }
        if let ground = pilot.childNode(withName: "pilotGroundShadow") as? SKShapeNode {
            ground.xScale = pose.shadowScale
        }
        if let bounce = pilot.childNode(withName: "pilotArmorBounce") as? SKShapeNode {
            bounce.xScale = pose.shadowScale
        }
        if isMoving && worldMapIndex == 0 && clock >= nextFootstepAt {
            nextFootstepAt = clock + 0.19
            let footprint = SKShapeNode(ellipseOf: CGSize(width: 7, height: 3))
            footprint.fillColor = SKColor(red: 0.62, green: 0.64, blue: 0.46, alpha: 0.24)
            footprint.strokeColor = .clear
            footprint.position = CGPoint(
                x: pilot.position.x + (sin(CGFloat(clock) * 15) > 0 ? -6 : 6),
                y: pilot.position.y - 21)
            footprint.zPosition = pilot.zPosition - 1
            arena.addChild(footprint)
            footprint.run(.sequence([.group([
                .scale(to: 1.6, duration: 0.3),
                .fadeOut(withDuration: 0.3)
            ]), .removeFromParent()]))
        }
        if phase == .gate {
            let isExtracting = activeEncounter == .survival
            let exitPosition = isExtracting ? extractionPortal.position : passageGate.position
            let entered = isExtracting
                ? distance(pilot.position, exitPosition) <= 34
                : RoomRules.enteredGate(pilot: pilot.position, gate: exitPosition)
            if entered {
                passageGate.isHidden = true
                extractionPortal.isHidden = true
                gateUnlocked = true
                heldTouch = nil
                movementOrigin = nil
                movementTarget = nil
                startWave()
            }
            return
        }
        // Scan once per available shot, without allocating an enemy array or
        // rechecking target distance inside the weapon routine.
        if combatTime - lastShot >= 0.42 / Double(fireRate + permanentRateBonus),
           let index = CombatRules.nearestActiveTarget(
                count: enemies.count, origin: pilot.position, range: autoFireRange,
                isActive: { combatTime >= enemies[$0].activeAt && enemies[$0].health > 0 },
                position: { enemies[$0].node.position }) {
            shoot(at: enemies[index].node.position, selectedIndex: index)
        }
        if presentPendingLevelUp(returningTo: .playing) { return }
        updateOrbitingDefenses()
        if phase != .playing { return }
        spawnClock += gameDt
        waveElapsed += gameDt
        updateTerrainHazards()
        if health <= 0 { endGame(); return }
        if phase != .playing { return }
        applyBurns()
        if presentPendingLevelUp(returningTo: .playing) { return }
        if activeEncounter.isTimed {
            let interval = SurvivalEncounterRules.spawnInterval(room: wave)
            if SurvivalEncounterRules.canSpawn(
                world: worldMapIndex, room: wave, elapsed: waveElapsed,
                livingEnemies: enemies.count), spawnClock >= interval {
                spawnClock -= interval
                let available = SurvivalEncounterRules.maxLivingEnemies(
                    room: wave) - enemies.count
                for _ in 0..<min(available, SurvivalEncounterRules.spawnBatch(room: wave)) {
                    spawned += 1
                    spawnEnemy(artReviewType: SurvivalEncounterRules.swarmType(
                        room: wave, slot: spawned))
                }
            }
            if !survivalSpawnPhaseFinished &&
                SurvivalEncounterRules.extractionActive(
                    world: worldMapIndex, room: wave, elapsed: waveElapsed) {
                survivalSpawnPhaseFinished = true
                // Timer expiry opens extraction without killing the swarm.
                // No additional attack tick or spawn runs afterward.
                completeWave()
                return
            }
        } else {
            let interval = CampaignPacing.spawnInterval(room: wave)
            if spawned < waveTarget && spawnClock >= interval {
                spawnClock -= interval
                spawned += 1
                spawnEnemy()
            }
        }
        for index in enemies.indices.reversed() {
            let current = enemies[index].node.position
            let enemy = enemies[index]
            guard combatTime >= enemy.activeAt else { continue }
            enemy.node.alpha = 1
            enemy.node.childNode(withName: "spawnWarning")?.removeFromParent()
            let ranged = enemy.behavior >= 4 || enemy.node === bossNode
            if ranged { updateRangedAttack(at: index) }
            let waypoint = TerrainHazards.navigationTarget(
                from: current, toward: pilot.position,
                patches: roomHazards, bounds: roomBounds,
                radius: enemy.radius)
            let intent = CombatRules.enemySteering(
                behavior: enemy.behavior, origin: current, pilot: waypoint,
                elapsed: combatTime, phase: enemy.weavePhase,
                ranged: ranged && waypoint == pilot.position,
                aiming: enemies[index].shotTarget != nil)
            let step = enemy.speed * CGFloat(gameDt)
            let target = RoomRules.clamp(
                CGPoint(x: current.x + intent.dx * step,
                        y: current.y + intent.dy * step),
                to: roomBounds.insetBy(dx: enemy.radius, dy: enemy.radius))
            enemy.node.position = TerrainHazards.resolveMovement(
                from: current, to: target, patches: roomHazards,
                radius: enemy.radius)
            // Different movement silhouettes: heavies lumber, raiders
            // dart, ranged units visibly brace while telegraphing.
            // Only art transforms change; hitboxes and health bars stay fixed.
            let advancing = distance(current, enemy.node.position) > 0.25
            let enemyPose = CharacterMotion.enemy(
                time: combatTime, behavior: enemy.behavior,
                phase: enemy.weavePhase, moving: advancing,
                aiming: enemies[index].shotTarget != nil)
            if let enemyArt = enemy.node.childNode(withName: "enemyArt") as? SKSpriteNode {
                enemyArt.position.y = enemyPose.verticalOffset
                enemyArt.zRotation = enemyPose.lean
                enemyArt.yScale = enemyPose.heightScale
            }
            if let ground = enemy.node.childNode(withName: "enemyGroundShadow") as? SKShapeNode {
                ground.xScale = enemyPose.shadowScale
            }
            if distance(enemy.node.position, pilot.position) < enemy.radius + 14 {
                damagePilot(enemy.node === bossNode ? 12 : (enemy.behavior == 3 ? 8 : 5))
            }
        }
        updateHostileAttacks(delta: gameDt)
        if health == 0 { endGame(); return }
        // Level-up can interrupt combat during damage resolution. Do not clear
        // the room while its upgrade selection is still open.
        guard phase == .playing else { return }
        if activeEncounter != .survival &&
           RoomRules.isCleared(spawned: spawned, target: waveTarget, living: enemies.count) {
            completeWave()
        }
    }

    private func damagePilot(_ amount: Int) {
        guard phase == .playing, combatTime >= pilotShieldUntil, health > 0 else { return }
        let actual = min(health, CampaignPacing.incomingDamage(
            amount: amount, room: wave))
        health -= actual
        progress.recordDamage(actual)
        pilotShieldUntil = combatTime + CampaignPacing.hitGracePeriod(room: wave)
        pilotHitCount += 1
        // Combat feedback takes precedence over the one-time control hint.
        controlsHint.removeAllActions()
        controlsHint.isHidden = true
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
            enemy.node.childNode(withName: "aimReticle")?.removeFromParent()
            if enemy.node === bossNode && selectedWorld.bossStyle == 1 {
                for direction in CombatRules.wardenVolleyTargets(
                    origin: enemy.node.position, target: target) {
                    fireProjectile(from: enemy.node.position, toward: direction)
                }
                enemy.node.childNode(withName: "aimLineLeft")?.removeFromParent()
                enemy.node.childNode(withName: "aimLineRight")?.removeFromParent()
            } else {
                fireProjectile(from: enemy.node.position, toward: target)
            }
            enemies[index].shotTarget = nil
            enemies[index].nextAttack = combatTime + CombatRules.shooterCooldown(room: wave)
        } else if combatTime >= enemy.nextAttack {
            // Aim markers, shots in flight and mortar warnings all count
            // toward the same readable combat-pressure budget.
            let threatening = enemies.filter { $0.shotTarget != nil }.count +
                projectiles.count + lobs.count
            guard CombatRules.mayBeginRangedAttack(
                room: wave, activeThreats: threatening) else { return }
            if enemy.behavior == 5 || (enemy.node === bossNode && selectedWorld.bossStyle == 2) {
                launchLob(from: enemy.node.position, target: pilot.position)
                enemies[index].nextAttack = combatTime +
                    (enemy.node === bossNode ? 2.8 : CombatRules.lobberCooldown(room: wave))
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
                if enemy.node === bossNode && selectedWorld.bossStyle == 1 {
                    let targets = CombatRules.wardenVolleyTargets(
                        origin: enemy.node.position, target: pilot.position)
                    for (index, direction) in [targets[0], targets[2]].enumerated() {
                        let side = SKShapeNode()
                        let sidePath = CGMutablePath()
                        sidePath.move(to: .zero)
                        sidePath.addLine(to: CGPoint(
                            x: direction.x - enemy.node.position.x,
                            y: direction.y - enemy.node.position.y))
                        side.path = sidePath
                        side.name = index == 0 ? "aimLineLeft" : "aimLineRight"
                        side.strokeColor = .systemCyan.withAlphaComponent(0.78)
                        side.lineWidth = 2.5
                        side.zPosition = 6
                        enemy.node.addChild(side)
                    }
                }
                aim.run(.repeatForever(.sequence([
                    .fadeAlpha(to: 0.35, duration: 0.15),
                    .fadeAlpha(to: 1, duration: 0.15)
                ])))
                // Lock an unmistakable pink target ring to the shooter’s
                // chosen firing point. The player can step away while the
                // short warning is displayed; the ring does not chase them.
                let aimReticle = SKShapeNode(circleOfRadius: 11)
                aimReticle.name = "aimReticle"
                aimReticle.position = CGPoint(x: pilot.position.x - enemy.node.position.x,
                                             y: pilot.position.y - enemy.node.position.y)
                aimReticle.strokeColor = .systemPink
                aimReticle.lineWidth = 3
                aimReticle.fillColor = .clear
                aimReticle.zPosition = 7
                enemy.node.addChild(aimReticle)
                aimReticle.run(.repeatForever(.sequence([
                    .group([.scale(to: 0.65, duration: 0.18), .fadeAlpha(to: 0.55, duration: 0.18)]),
                    .group([.scale(to: 1.0, duration: 0.18), .fadeAlpha(to: 1.0, duration: 0.18)])
                ])))
                if enemy.node === bossNode && selectedWorld.bossStyle == 0 {
                    launchLob(from: enemy.node.position, target: pilot.position)
                }
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
        marker.fillColor = .systemOrange.withAlphaComponent(0.23)
        marker.strokeColor = .systemOrange
        marker.lineWidth = 4
        marker.zPosition = 4
        // A shrinking yellow countdown ring indicates *when* the mortar will
        // land; the orange perimeter indicates *where*. Unlike a generic
        // flash, it gives players actionable information while dodging.
        let countdown = SKShapeNode(circleOfRadius: radius * 0.82)
        countdown.name = "mortarCountdown"
        countdown.fillColor = .clear
        countdown.strokeColor = .systemYellow
        countdown.lineWidth = 3
        countdown.zPosition = 1
        marker.addChild(countdown)
        // The countdown scale is advanced from combatTime in
        // updateHostileAttacks; SKAction time is not accelerated at 2× speed.
        countdown.setScale(1)
        marker.run(.repeatForever(.sequence([
            .group([.scale(to: 0.83, duration: 0.35), .fadeAlpha(to: 0.55, duration: 0.35)]),
            .group([.scale(to: 1, duration: 0.35), .fadeAlpha(to: 1, duration: 0.35)])
        ])))
        let cross = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        cross.text = "!"
        cross.fontColor = .systemYellow
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
            lob.marker.childNode(withName: "mortarCountdown")?.setScale(
                CombatRules.mortarWarningScale(
                    elapsed: combatTime - lob.launchedAt,
                    flightTime: lob.impactAt - lob.launchedAt))
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

    private func rebuildOrbitingDefenses() {
        for blade in orbitalNodes { blade.removeFromParent() }
        orbitalNodes.removeAll()
        for index in 0..<orbitLevel {
            let blade = SKShapeNode(rectOf: CGSize(width: 10, height: 23), cornerRadius: 3)
            blade.name = "orbitalBlade"
            blade.fillColor = SKColor(red: 0.22, green: 0.88, blue: 0.95, alpha: 1)
            blade.strokeColor = .systemCyan
            blade.lineWidth = 1.5
            blade.glowWidth = 2
            blade.zPosition = 11
            arena.addChild(blade)
            orbitalNodes.append(blade)
        }
    }

    private func updateOrbitingDefenses() {
        guard orbitLevel > 0, !orbitalNodes.isEmpty, phase == .playing else { return }
        // All positions derive from the same paused combat clock as hostile
        // projectiles. No free orbital strikes while choosing a level-up.
        for (index, blade) in orbitalNodes.enumerated() {
            let angle = CGFloat(combatTime) * 2.65 +
                CGFloat(index) * (2 * .pi / CGFloat(orbitalNodes.count))
            blade.position = CGPoint(
                x: pilot.position.x + cos(angle) * 46,
                y: pilot.position.y + sin(angle) * 46
            )
            blade.zRotation = angle + .pi / 2
            for enemyIndex in enemies.indices {
                let enemy = enemies[enemyIndex]
                guard enemy.health > 0, combatTime >= enemy.activeAt,
                      CombatRules.orbitalBladeHits(blade: blade.position,
                                                   enemy: enemy.node.position,
                                                   enemyRadius: enemy.radius) else {
                    continue
                }
                let key = ObjectIdentifier(enemy.node)
                guard combatTime - (lastOrbitalHit[key] ?? -100) >= 0.50 else { continue }
                lastOrbitalHit[key] = combatTime
                // Reliable modest contact damage, not projectile invulnerability.
                enemies[enemyIndex].health -= 1 + orbitLevel +
                    permanent.rank("orbit") + gearReactorBonus
                impact(at: blade.position, color: .systemCyan,
                       destroyed: enemies[enemyIndex].health <= 0)
                EnemyCombatFeedback.hit(enemies[enemyIndex].node, from: pilot.position)
                updateEnemyHealthBar(at: enemyIndex)
                // ARC BLADES: limited single-target lightning from the struck
                // enemy, with a global cooldown across all orbiting blades.
                let reach = AbilitySynergies.bladeArcReach(
                    chain: chainLevel, orbit: orbitLevel)
                if reach > 0, combatTime >= nextBladeArcAt,
                   let arcIndex = enemies.indices
                    .filter({ $0 != enemyIndex && enemies[$0].health > 0 &&
                        combatTime >= enemies[$0].activeAt &&
                        distance(enemies[$0].node.position, enemy.node.position) <= reach })
                    .min(by: { distance(enemies[$0].node.position, enemy.node.position) <
                                distance(enemies[$1].node.position, enemy.node.position) }) {
                    nextBladeArcAt = combatTime + AbilitySynergies.bladeArcCooldown
                    let discharge = AbilitySynergies.bladeArcDamage(
                        chain: chainLevel, orbit: orbitLevel)
                    let arcPosition = enemies[arcIndex].node.position
                    CombatVisuals.chainArc(in: arena, from: enemy.node.position,
                                           to: arcPosition, rank: chainLevel)
                    enemies[arcIndex].health -= discharge
                    impact(at: arcPosition, color: .systemCyan,
                           destroyed: enemies[arcIndex].health <= 0)
                    EnemyCombatFeedback.hit(enemies[arcIndex].node,
                                            from: enemy.node.position)
                    updateEnemyHealthBar(at: arcIndex)
                }
            }
        }
        removeDefeatedEnemies()
        updateHUD()
    }

    private func shoot(at point: CGPoint, selectedIndex index: Int) {
        guard combatTime - lastShot >= 0.42 / Double(fireRate + permanentRateBonus) else { return }
        guard enemies.indices.contains(index), enemies[index].health > 0,
              combatTime >= enemies[index].activeAt,
              distance(enemies[index].node.position, point) < 45 else { return }
        lastShot = combatTime
        let target = enemies[index].node.position
        let shotAngle = atan2(target.y - pilot.position.y, target.x - pilot.position.x)
        if abs(target.x - pilot.position.x) > 10 {
            pilotFacing = target.x < pilot.position.x ? -1 : 1
        }
        pilotGun.zRotation = shotAngle - .pi / 2
        CombatVisuals.rifleTracer(in: arena, origin: pilot.position,
                                 target: target, incendiary: incendiaryLevel > 0,
                                 explosive: explosiveLevel > 0)
        if explosiveLevel > 0 {
            CombatVisuals.explosiveBurst(in: arena, at: target,
                                         rank: explosiveLevel,
                                         burning: incendiaryLevel > 0)
        }
        let totalBulletDamage = damage + permanentDamageBonus + gearWeaponBonus
        impact(at: target, color: .systemYellow, destroyed: enemies[index].health <= totalBulletDamage)
        enemies[index].health -= totalBulletDamage
        EnemyCombatFeedback.hit(enemies[index].node, from: pilot.position)
        if incendiaryLevel > 0 {
            burns[ObjectIdentifier(enemies[index].node)] = (damage: incendiaryLevel + permanentReactorBonus + gearReactorBonus + permanent.rank("incendiary"), until: combatTime + AbilitySynergies.burnDuration(
                incendiary: incendiaryLevel, explosive: explosiveLevel),
                nextTick: combatTime + 0.5)
            CombatVisuals.markBurning(enemies[index].node, radius: enemies[index].radius)
        }
        if explosiveLevel > 0 {
            for other in enemies.indices where other != index && combatTime >= enemies[other].activeAt && distance(enemies[other].node.position, target) < CGFloat(35 + explosiveLevel * 15 + permanent.rank("explosive") * 5) {
                let alreadyBurning = (burns[ObjectIdentifier(enemies[other].node)]?.until ?? 0) > combatTime
                let thermiteBonus = AbilitySynergies.thermiteBonus(
                    explosive: explosiveLevel, incendiary: incendiaryLevel,
                    burning: alreadyBurning)
                enemies[other].health -= max(1, damage * explosiveLevel / 3 +
                    permanent.rank("explosive") + gearReactorBonus) + thermiteBonus
                if incendiaryLevel > 0 {
                    burns[ObjectIdentifier(enemies[other].node)] = (damage: incendiaryLevel, until: combatTime + AbilitySynergies.burnDuration(
                incendiary: incendiaryLevel, explosive: explosiveLevel),
                nextTick: combatTime + 0.5)
                    CombatVisuals.markBurning(enemies[other].node,
                                               radius: enemies[other].radius)
                }
                impact(at: enemies[other].node.position, color: .systemOrange,
                       destroyed: enemies[other].health <= 0)
                EnemyCombatFeedback.hit(enemies[other].node, from: target)
                updateEnemyHealthBar(at: other)
            }
        }
        let fraction = CGFloat(max(0, enemies[index].health)) / CGFloat(enemies[index].maxHealth)
        enemies[index].healthBar.xScale = max(0.001, fraction)
        enemies[index].healthBar.fillColor = fraction > 0.5 ? .systemGreen : (fraction > 0.25 ? .systemYellow : .systemRed)
        if chainLevel > 0 {
            chainAttack(from: target, excluding: enemies[index].node)
        }
        removeDefeatedEnemies()
        updateHUD()
    }

    private func chainAttack(from origin: CGPoint, excluding initialNode: SKShapeNode) {
        var previous = origin
        var visited: Set<ObjectIdentifier> = [ObjectIdentifier(initialNode)]
        for _ in 0..<min(chainLevel + permanentSystemsBonus + permanent.rank("chain") / 2, 6) {
            guard let targetIndex = enemies.indices
                .filter({ !visited.contains(ObjectIdentifier(enemies[$0].node)) && combatTime >= enemies[$0].activeAt && distance(enemies[$0].node.position, previous) <=
                    AbilitySynergies.chainReach(chain: chainLevel,
                                                incendiary: incendiaryLevel) })
                .min(by: { distance(enemies[$0].node.position, previous) < distance(enemies[$1].node.position, previous) }) else { break }
            let enemy = enemies[targetIndex]
            let endpoint = enemy.node.position
            CombatVisuals.chainArc(in: arena, from: previous,
                                   to: endpoint, rank: chainLevel)
            let conductiveBonus = AbilitySynergies.conductiveBonus(
                chain: chainLevel, incendiary: incendiaryLevel,
                burning: (burns[ObjectIdentifier(enemy.node)]?.until ?? 0) > combatTime)
            let chainDamage = max(1, damage / 2 + permanent.rank("chain") +
                gearReactorBonus) + conductiveBonus
            impact(at: endpoint, color: .systemCyan, destroyed: enemy.health <= chainDamage)
            enemies[targetIndex].health -= chainDamage
            EnemyCombatFeedback.hit(enemies[targetIndex].node, from: previous)
            if incendiaryLevel > 0 {
                burns[ObjectIdentifier(enemy.node)] = (damage: incendiaryLevel, until: combatTime + AbilitySynergies.burnDuration(
                incendiary: incendiaryLevel, explosive: explosiveLevel),
                nextTick: combatTime + 0.5)
                CombatVisuals.markBurning(enemy.node, radius: enemy.radius)
            }
            let fraction = CGFloat(max(0, enemies[targetIndex].health)) / CGFloat(enemies[targetIndex].maxHealth)
            enemies[targetIndex].healthBar.xScale = max(0.001, fraction)
            enemies[targetIndex].healthBar.fillColor = fraction > 0.5 ? .systemGreen : (fraction > 0.25 ? .systemYellow : .systemRed)
            visited.insert(ObjectIdentifier(enemy.node))
            previous = endpoint
        }
    }

    private func removeDefeatedEnemies() {
        var defeatedCount = 0
        for index in enemies.indices.reversed() where enemies[index].health <= 0 {
            defeatedCount += 1
            streak += 1
            awardRoomCoins(enemies[index].reward)
            bankSalvage(PersistentProgression.enemyReward(
                isHeavy: enemies[index].behavior >= 3,
                isBoss: enemies[index].node === bossNode))
            let xpAmount = CampaignPacing.killXP(
                type: enemies[index].behavior, isBoss: enemies[index].node === bossNode)
            // XP belongs to the kill immediately; it must not wait for a pickup or room clear.
            let paidXP = awardRoomXP(xpAmount)
            let xpLabel = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            xpLabel.text = paidXP > 0 ? "+\(paidXP) XP" : "XP RECOVERED"
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
            lastOrbitalHit.removeValue(forKey: ObjectIdentifier(enemies[index].node))
            enemyAcidDamageAt.removeValue(forKey: ObjectIdentifier(enemies[index].node))
            let defeatedBoss = enemies[index].node === bossNode
            if defeatedBoss { bossNode = nil }
            EnemyCombatFeedback.defeat(in: arena, enemy: enemies[index].node,
                                       radius: enemies[index].radius,
                                       role: enemies[index].behavior,
                                       isBoss: defeatedBoss)
            enemies[index].node.removeFromParent()
            enemies.remove(at: index)
        }
        // Save all kill rewards together to align permanent Salvage
        // with the replay-safe XP and coin credits.
        if defeatedCount > 0 { saveRunRecovery() }
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
            if combatTime >= burn.until {
                burns.removeValue(forKey: key)
                enemies[index].node.childNode(withName: "burnIndicator")?.removeFromParent()
                continue
            }
            if combatTime >= burn.nextTick {
                enemies[index].health -= burn.damage
                burn.nextTick = combatTime + 0.5
                burns[key] = burn
                impact(at: enemies[index].node.position, color: .systemOrange,
                       destroyed: enemies[index].health <= 0)
                EnemyCombatFeedback.hit(enemies[index].node, from: pilot.position)
                updateEnemyHealthBar(at: index)
            }
        }
        removeDefeatedEnemies()
        updateHUD()
    }

    private func distance(_ a: CGPoint, _ b: CGPoint) -> CGFloat {
        hypot(a.x - b.x, a.y - b.y)
    }

    private var repairCost: Int { CampaignPacing.healingCost(room: wave) }

    private func collectXP(collectAll: Bool = false) {
        for index in xpDrops.indices.reversed() {
            let drop = xpDrops[index]
            let distance = hypot(drop.node.position.x - pilot.position.x, drop.node.position.y - pilot.position.y)
            if collectAll || distance < 38 {
                awardRoomXP(drop.amount)
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
        bankSalvage(PersistentProgression.roomReward(room: wave))
        if activeEncounter != .survival {
            awardRoomCoins(CampaignPacing.clearCoins(room: wave))
            collectXP(collectAll: true)
            awardRoomXP(CampaignPacing.clearXP(room: wave))
        }
        // Survival grants normal kill rewards, never timed-exit XP or coins.
        let destination: Phase = wave == worldWaveCount ? .worldComplete : .gate
        saveRunRecovery()
        if presentPendingLevelUp(returningTo: destination) { return }
        if destination == .worldComplete { completeWorld() } else { showZoneGate() }
    }

    @discardableResult
    private func presentPendingLevelUp(returningTo destination: Phase) -> Bool {
        guard health > 0, progress.pendingChoices > 0 else { return false }
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
        let tacticalOptions = lockedLoadout.availableTacticalUpgrades(
            chain: chainLevel, explosive: explosiveLevel,
            incendiary: incendiaryLevel, orbit: orbitLevel)
        pool += tacticalOptions
        if health < maximumHealth { pool.append("heal") }
        // All three choices should rotate; damage remains in the pool but is not mandatory.
        pool.append("damage")
        // A tactical card is always offered through the opening levels;
        // players retain three real choices and can still favor defense.
        var choices: [String] = []
        if let featured = AbilitySynergies.featuredTactical(
            available: tacticalOptions, characterLevel: progress.level,
            chain: chainLevel, explosive: explosiveLevel,
            incendiary: incendiaryLevel, orbit: orbitLevel) {
            choices.append(featured)
        }
        choices += pool.filter { !choices.contains($0) }
            .shuffled().prefix(3 - choices.count)
        levelChoices = choices.shuffled()
        // Module-style choices use role colors rather than highlighting the
        // first random choice. No rarity tiers are implied by these accents.
        // Tappable rectangles match the full illustrated card exactly.
        for (index, choice) in levelChoices.enumerated() {
            let label: String
            let detail: String
            let category: String
            let symbol: String
            let tint: SKColor
            switch choice {
            case "damage":
                label = "DAMAGE \(damage) → \(damage + 1)"
                detail = "Stronger weapon hits"
                category = "WEAPON"
                symbol = "DMG"
                tint = SKColor(red: 1, green: 0.67, blue: 0.29, alpha: 1)
            case "rate":
                label = "FIRE RATE \(fireRate) → \(fireRate + 1)"
                detail = "Shoot more often"
                category = "WEAPON"
                symbol = "SPD"
                tint = SKColor(red: 1, green: 0.67, blue: 0.29, alpha: 1)
            case "chain":
                label = "CHAIN LIGHTNING  LV \(chainLevel + 1)"
                detail = AbilitySynergies.preview(
                    ability: "chain", chain: chainLevel,
                    explosive: explosiveLevel, incendiary: incendiaryLevel,
                    orbit: orbitLevel) ?? "Hits additional nearby enemies"
                category = "TACTICAL"
                symbol = "ARC"
                tint = SKColor(red: 0.51, green: 0.74, blue: 1, alpha: 1)
            case "explosive":
                label = "EXPLOSIVE ROUNDS  LV \(explosiveLevel + 1)"
                detail = AbilitySynergies.preview(
                    ability: "explosive", chain: chainLevel,
                    explosive: explosiveLevel, incendiary: incendiaryLevel,
                    orbit: orbitLevel) ?? "Weapon hits splash nearby enemies"
                category = "ORDNANCE"
                symbol = "AOE"
                tint = SKColor(red: 1, green: 0.57, blue: 0.38, alpha: 1)
            case "incendiary":
                label = "INCENDIARY ROUNDS  LV \(incendiaryLevel + 1)"
                detail = AbilitySynergies.preview(
                    ability: "incendiary", chain: chainLevel,
                    explosive: explosiveLevel, incendiary: incendiaryLevel,
                    orbit: orbitLevel) ?? "Weapon hits inflict lasting burn damage"
                category = "ORDNANCE"
                symbol = "HOT"
                tint = SKColor(red: 1, green: 0.57, blue: 0.38, alpha: 1)
            case "orbit":
                label = "ORBITAL BLADES  LV \(orbitLevel + 1)"
                detail = AbilitySynergies.preview(
                    ability: "orbit", chain: chainLevel,
                    explosive: explosiveLevel, incendiary: incendiaryLevel,
                    orbit: orbitLevel) ?? "Spinning blades strike nearby foes"
                category = "TACTICAL"
                symbol = "ORB"
                tint = SKColor(red: 0.63, green: 0.70, blue: 1, alpha: 1)
            case "heal":
                label = "RECOVER 40 HP"
                detail = "Restore health, up to your maximum"
                category = "DEFENSE"
                symbol = "HP"
                tint = SKColor(red: 0.41, green: 0.89, blue: 0.61, alpha: 1)
            default:
                label = "ARMOR +20 MAX HP"
                detail = "Raise maximum health and restore 20 HP"
                category = "DEFENSE"
                symbol = "ARM"
                tint = SKColor(red: 0.41, green: 0.89, blue: 0.61, alpha: 1)
            }
            let cardWidth = min(size.width - 64, 324)
            let cardCenterY = CGFloat(23 - index * 86)
            let frame = CGRect(x: -cardWidth / 2, y: cardCenterY - 39,
                               width: cardWidth, height: 78)
            let card = SKShapeNode(rect: frame, cornerRadius: 13)
            card.name = "upgradeModuleCard"
            card.fillColor = SKColor(
                red: 0.08, green: 0.14, blue: 0.20, alpha: 0.94)
            card.strokeColor = tint.withAlphaComponent(0.74)
            card.lineWidth = 1.8
            card.zPosition = 1
            overlay.addChild(card)

            // A restrained lower-edge light reflects the upgrade's function;
            // the same weight is given to each of the three random choices.
            let lowerEdge = SKShapeNode(rect: CGRect(
                x: -cardWidth / 2 + 13, y: cardCenterY - 33,
                width: cardWidth - 26, height: 2), cornerRadius: 1)
            lowerEdge.fillColor = tint.withAlphaComponent(0.22)
            lowerEdge.strokeColor = .clear
            lowerEdge.zPosition = 2
            overlay.addChild(lowerEdge)

            let emblem = SKShapeNode(circleOfRadius: 17)
            emblem.position = CGPoint(x: -cardWidth / 2 + 33, y: cardCenterY)
            emblem.fillColor = tint.withAlphaComponent(0.16)
            emblem.strokeColor = tint
            emblem.lineWidth = 1.6
            emblem.zPosition = 2
            overlay.addChild(emblem)
            let symbolLabel = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            symbolLabel.text = symbol
            symbolLabel.fontSize = symbol.count > 2 ? 9 : 12
            symbolLabel.fontColor = tint
            symbolLabel.verticalAlignmentMode = .center
            symbolLabel.zPosition = 1
            emblem.addChild(symbolLabel)

            let textLeft = -cardWidth / 2 + 64
            let titleLabel = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            titleLabel.text = label
            titleLabel.fontSize = 13
            titleLabel.fontColor = .white
            titleLabel.horizontalAlignmentMode = .left
            titleLabel.position = CGPoint(x: textLeft, y: cardCenterY + 3)
            titleLabel.zPosition = 3
            overlay.addChild(titleLabel)

            let detailLabel = SKLabelNode(fontNamed: "AvenirNext-Medium")
            detailLabel.text = detail
            detailLabel.fontSize = 10
            detailLabel.fontColor = SKColor(white: 0.83, alpha: 1)
            detailLabel.horizontalAlignmentMode = .left
            detailLabel.position = CGPoint(x: textLeft, y: cardCenterY - 19)
            detailLabel.zPosition = 3
            overlay.addChild(detailLabel)

            let categoryLabel = SKLabelNode(fontNamed: "AvenirNext-DemiBold")
            categoryLabel.text = category
            categoryLabel.fontSize = 8
            categoryLabel.fontColor = tint
            categoryLabel.horizontalAlignmentMode = .right
            categoryLabel.position = CGPoint(
                x: cardWidth / 2 - 14, y: cardCenterY + 24)
            categoryLabel.zPosition = 3
            overlay.addChild(categoryLabel)
            overlayButtons[choice] = frame
        }
        overlayText("COMBAT PAUSED  •  SELECT TO RESUME", y: -214, fontSize: 11)
        updateHUD()
    }

    /// Single hit-testing path shared by real touches and simulator QA.
    /// Keep the visible card and its tappable region in the same coordinates.
    private func levelChoice(at point: CGPoint) -> String? {
        guard phase == .levelUp else { return nil }
        return levelChoices.first(where: { overlayButtons[$0]?.contains(point) == true })
    }

    @discardableResult
    private func activateLevelUp(at point: CGPoint) -> Bool {
        guard let choice = levelChoice(at: point) else { return false }
        chooseLevelUpgrade(choice)
        return true
    }

    private func chooseLevelUpgrade(_ choice: String) {
        guard phase == .levelUp, levelChoices.contains(choice), progress.chooseUpgrade() else { return }
        let isNewTactical = (choice == "chain" && chainLevel == 0) ||
            (choice == "explosive" && explosiveLevel == 0) ||
            (choice == "incendiary" && incendiaryLevel == 0) ||
            (choice == "orbit" && orbitLevel == 0)
        let unlockedCombo = isNewTactical ? AbilitySynergies.preview(
            ability: choice, chain: chainLevel, explosive: explosiveLevel,
            incendiary: incendiaryLevel, orbit: orbitLevel) : nil
        switch choice {
        case "damage": damage += 1
        case "rate": fireRate = min(5, fireRate + 1)
        case "chain": chainLevel = min(3, chainLevel + 1)
        case "explosive": explosiveLevel = min(3, explosiveLevel + 1)
        case "incendiary": incendiaryLevel = min(3, incendiaryLevel + 1)
        case "orbit":
            orbitLevel = min(3, orbitLevel + 1)
            rebuildOrbitingDefenses()
        case "heal": health = min(maximumHealth, health + 40)
        default: runArmor += 20; health = min(maximumHealth, health + 20)
        }
        if let unlockedCombo {
            let banner = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            banner.name = "abilityComboUnlocked"
            banner.text = unlockedCombo.replacingOccurrences(
                of: "COMBO:", with: "NEW COMBO:")
            banner.fontSize = 17
            banner.fontColor = .systemCyan
            banner.position = CGPoint(x: pilot.position.x,
                                      y: pilot.position.y + 48)
            banner.zPosition = 19
            arena.addChild(banner)
            banner.run(.sequence([
                .group([.moveBy(x: 0, y: 33, duration: 1.2),
                        .sequence([.wait(forDuration: 0.6),
                                   .fadeOut(withDuration: 0.6)])]),
                .removeFromParent()
            ]))
        }
        if progress.pendingChoices > 0 {
            saveRunRecovery()
            showLevelUp()
            return
        }
        saveRunRecovery()
        // A final enemy may have died on the same frame as the level-up.
        // Finish that cleared room after the upgrade choice, not before it.
        if levelUpReturnPhase == .playing && !roomCleared &&
           (activeEncounter == .survival
            ? SurvivalEncounterRules.extractionActive(
                world: worldMapIndex, room: wave, elapsed: waveElapsed)
            : RoomRules.isCleared(
                spawned: spawned, target: waveTarget, living: enemies.count)) {
            arena.isPaused = false
            clearOverlay()
            overlayBackdrop.isHidden = true
            completeWave()
            return
        }
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
        saveRunRecovery()
    }

    private func showExtractionPortal() {
        guard activeEncounter == .survival && roomCleared else { return }
        phase = .gate
        arena.isPaused = false
        clearHostileAttacks()
        heldTouch = nil
        movementOrigin = nil
        movementTarget = nil
        clearOverlay()
        overlayBackdrop.isHidden = true
        passageGate.isHidden = true
        // Spawn within walking distance, but not on top of the pilot, water
        // or rubble. This does not require killing the remaining enemies.
        let safe = roomBounds.insetBy(dx: 65, dy: 65)
        let approaches: [CGPoint] = [
            CGPoint(x: pilot.position.x, y: pilot.position.y + 125),
            CGPoint(x: pilot.position.x + 125, y: pilot.position.y),
            CGPoint(x: pilot.position.x - 125, y: pilot.position.y),
            CGPoint(x: pilot.position.x, y: pilot.position.y - 125)
        ].map { RoomRules.clamp($0, to: safe) }
        extractionPortal.position = approaches.first(where: {
            !TerrainHazards.blocksMovement($0, patches: roomHazards)
        }) ?? CGPoint(x: roomBounds.midX, y: roomBounds.midY)
        extractionPortal.strokeColor = worldMapIndex == 1 ? .systemTeal :
            (worldMapIndex == 2 ? .systemGreen : .systemCyan)
        extractionPortal.childNode(withName: "extractionCore")?.removeAllActions()
        extractionPortal.childNode(withName: "extractionCore")?.run(
            .repeatForever(.sequence([
                .scale(to: 1.22, duration: 0.65),
                .scale(to: 1, duration: 0.65)
            ])))
        extractionPortal.isHidden = false
        zoneBanner.removeAllActions()
        zoneBanner.text = "EXTRACTION OPEN"
        zoneBanner.fontColor = .systemCyan
        zoneBanner.alpha = 1
        zoneBanner.position = CGPoint(x: size.width / 2, y: size.height - 216)
        warning.removeAllActions()
        warning.text = "SURVIVED — MOVE INTO BLUE PORTAL"
        warning.fontColor = .systemCyan
        warning.fontSize = 13
        warning.position = CGPoint(x: size.width / 2, y: size.height * 0.27)
        warning.alpha = 1
        warning.isHidden = false
        controlsHint.isHidden = true
        updateHUD()
        saveRunRecovery()
    }

    private func showZoneGate() {
        if activeEncounter == .survival {
            showExtractionPortal()
            return
        }
        guard RoomRules.isCleared(spawned: spawned, target: waveTarget, living: enemies.count) else { return }
        phase = .gate
        arena.isPaused = false
        heldTouch = nil
        movementOrigin = nil
        movementTarget = nil
        clearOverlay()
        overlayBackdrop.isHidden = true
        passageGate.isHidden = false
        passageGate.fillColor = SKColor(red: 0.07, green: 0.12, blue: 0.17, alpha: 1)
        (passageGate.children.first as? SKLabelNode)?.text = "ENTER"
        passageGate.childNode(withName: "gateArrow")?.isHidden = false
        passageGate.alpha = 1
        passageGate.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.position = CGPoint(x: 0, y: -40)
        passageGate.childNode(withName: "gateArrow")?.run(.repeatForever(.sequence([.moveBy(x: 0, y: 7, duration: 0.45), .moveBy(x: 0, y: -7, duration: 0.45)])))
        // Pulse only the portal energy, keeping its metal doorway solid.
        let energy = passageGate.childNode(withName: "portalEnergy")
        energy?.removeAllActions()
        energy?.run(.repeatForever(.sequence([
            .fadeAlpha(to: 0.35, duration: 0.65),
            .fadeAlpha(to: 0.88, duration: 0.65)
        ])))
        warning.text = wave == 1 ? "ROOM CLEAR — WALK INTO GATE" : "ROOM CLEAR — EXIT OPEN"
        controlsHint.isHidden = true
        warning.fontColor = .systemGreen
        warning.fontSize = 13
        warning.position = CGPoint(x: passageGate.position.x, y: passageGate.position.y - 65)
        warning.removeAllActions()
        warning.alpha = 1
        warning.isHidden = false
        updateHUD()
        saveRunRecovery()
        // Make the optional repair opportunity discoverable at milestones;
        // this is NOT an XP upgrade and never grants a free room-clear perk.
        // Only present once, and only to a wounded pilot.
        if wave.isMultiple(of: 5), wave < worldWaveCount,
           !checkpointPresented, !checkpointUsed, health < maximumHealth {
            checkpointPresented = true
            showCheckpoint()
        }
    }

    private var lastWorldCoreReward = 0

    private func awardWorldCompletionCores(stars: Int) {
        guard !coreAwardedThisRun else { return }
        coreAwardedThisRun = true
        lastWorldCoreReward = WorldCatalog.recordVictory(worldMapIndex, stars: stars)
        if lastWorldCoreReward > 0 {
            UserDefaults.standard.set(availableCores + lastWorldCoreReward, forKey: "powerCoresAvailable")
        }
    }

    /// One transition path serves both the next-world button and the simulator
    /// integration check. An unfinished or unreleased world cannot be entered.
    private func advanceToNextWorld() {
        guard phase == .worldComplete, WorldCatalog.unlocked(worldMapIndex + 1),
              recovery.load() == nil else { return }
        worldMapIndex += 1
        restart()
    }

    private func completeWorld() {
        phase = .worldComplete
        ArcadeMusic.shared.play(.headquarters)
        lockMenuBriefly()
        clearOverlay()
        if !isCaptureMode {
            _ = WorldCatalog.recordBestRoom(worldMapIndex, room: worldWaveCount)
        }
        awardWorldCompletionCores(stars: progress.stars)
        // A completed-world bonus is not replayed enemy/room income.
        // In particular, resuming a cleared final boss room must receive the
        // full bonus, independent of its recorded roomSalvageCredit.
        salvageBankedThisRun += permanent.bank(PersistentProgression.worldCompletionBonus)
        recovery.clear()
        showWorldCompleteSummary()
    }

    private func showWorldCompleteSummary() {
        hud.isHidden = true
        phase = .worldComplete
        ArcadeMusic.shared.play(.headquarters)
        lockMenuBriefly()
        clearOverlay()
        let stars = progress.stars
        overlayText("\(selectedWorld.title) CLEARED", y: 85, fontSize: 18)
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
        overlayText("PLAYER \(health) HP  •  +\(salvageBankedThisRun) SALVAGE", y: -30, fontSize: 13)
        if lastWorldCoreReward > 0 {
            let core = SKShapeNode(circleOfRadius: 13)
            core.fillColor = .systemCyan
            core.strokeColor = .white
            core.lineWidth = 2
            core.glowWidth = 5
            core.position = CGPoint(x: -105, y: -76)
            core.zPosition = 3
            overlay.addChild(core)
            overlayText("NEW REWARD: +\(lastWorldCoreReward) CORES", y: -81, fontSize: 14)
        } else {
            overlayText("NO NEW CORES — EARN MORE STARS", y: -75, fontSize: 12)
        }
        overlayText("AVAILABLE POWER CORES: \(availableCores)", y: -48, fontSize: 15)
        actionButton("HEADQUARTERS", key: "headquarters", y: -105, tint: .systemIndigo)
        actionButton("PLAY AGAIN", key: "restart", y: -160, tint: .systemTeal)
        if WorldCatalog.unlocked(worldMapIndex + 1) {
            actionButton("NEXT WORLD", key: "next_world", y: -212, tint: .systemGreen)
        }
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
        // The illustrated character entirely replaces the original cyan
        // prototype body. Restoring a white stroke here drew a square halo
        // around the PNG on real phones.
        if productionImage(named: "pilot_idle") != nil {
            pilot.fillColor = .clear
            pilot.strokeColor = .clear
            pilot.lineWidth = 0
        } else {
            pilot.fillColor = .systemCyan
            pilot.strokeColor = branchLevel(2) > 0 ? .systemGreen : .white
            pilot.lineWidth = branchLevel(3) > 0 ? 4 : 3
        }
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
        recovery.clear()
        phase = .gameOver
        arena.isPaused = true
        clearHostileAttacks()
        ArcadeMusic.shared.play(.headquarters)
        heldTouch = nil
        aimPoint = nil
        lockMenuBriefly()
        clearOverlay()
        let best = WorldCatalog.recordBestRoom(worldMapIndex, room: wave)
        overlayText("PILOT DEFEATED", y: 97)
        overlayText(selectedWorld.title, y: 68, fontSize: 14)
        overlayText("ROOM \(wave)  •  WORLD BEST \(best)", y: 42, fontSize: 15)
        overlayText("+\(salvageBankedThisRun) SALVAGE BANKED", y: 14, fontSize: 17)
        overlayText("TOTAL SALVAGE: \(permanent.salvage)", y: -23, fontSize: 13)
        actionButton("HEADQUARTERS & UPGRADES", key: "headquarters", y: -87, tint: .systemIndigo)
        actionButton("RETRY WORLD", key: "restart", y: -157, tint: .systemTeal)
    }

    private func restart() {
        for drop in xpDrops { drop.node.removeFromParent() }
        xpDrops.removeAll()
        for enemy in enemies { enemy.node.removeFromParent() }
        enemies.removeAll()
        bossNode = nil
        activeEncounter = .tactical
        survivalSpawnPhaseFinished = false
        expandedArenaPreview = false
        arena.position = .zero
        arena.childNode(withName: "expandedArenaPreviewGround")?.removeFromParent()
        extractionPortal.isHidden = true
        wave = 0
        progress = RunProgress()
        combatClock = CombatClock()
        runArmor = 0
        roomCleared = false
        checkpointUsed = false
        checkpointPresented = false
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
        roomHazards.removeAll()
        hazardScenery.removeAllChildren()
        acidVisualNodes.removeAll()
        displayedAcidActive = nil
        enemyAcidDamageAt.removeAll()
        nextAcidDamageAt = 0
        pilot.position = entryPoint
        movementTarget = nil
        movementOrigin = nil
        pilotShieldUntil = 0
        pilotHitCount = 0
        pilot.alpha = 1
        pilotFacing = 1
        nextFootstepAt = 0
        pilot.removeAction(forKey: "hitFlash")
        pilot.childNode(withName: "pilotArt")?.xScale = 1
        pilot.childNode(withName: "pilotArt")?.yScale = 1
        passageGate.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.position = CGPoint(x: 0, y: -40)
        passageGate.alpha = 1
        gateUnlocked = false
        // Speed is a persistent preference, not a per-run upgrade.
        coins = 0
        salvageBankedThisRun = 0
        roomSalvageEarned = 0
        roomSalvageRecoveredCredit = 0
        roomCoinsEarned = 0
        roomCoinsRecoveredCredit = 0
        roomXPEarned = 0
        roomXPRecoveredCredit = 0
        nextRunSaveAt = 0
        health = maximumHealth
        damage = 1
        fireRate = 1
        chainLevel = 0
        explosiveLevel = 0
        incendiaryLevel = 0
        orbitLevel = 0
        lastOrbitalHit.removeAll()
        nextBladeArcAt = 0
        rebuildOrbitingDefenses()
        burns.removeAll()
        heldTouch = nil
        aimPoint = nil
        lastShot = -100
        streak = 0
        updateHUD()
        draftLoadout = AbilityLoadout()
        showLoadout()
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let point = touch.location(in: self)
        if !settingsShortcut.isHidden && settingsShortcut.contains(point) {
            showSettings()
            return
        }
        if phase == .playing || phase == .gate {
            if phase == .gate && !checkpointButton.isHidden && checkpointButton.contains(touch.location(in: hud)) {
                showCheckpoint()
                return
            }
            if !speedButton.isHidden && speedButton.contains(touch.location(in: hud)) {
                toggleSpeedPreference()
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
        case (.settings, "toggle_music"):
            ArcadeMusic.shared.toggle()
            showSettings()
        case (.settings, "toggle_speed"):
            toggleSpeedPreference()
            showSettings()
        case (.settings, "close_settings"): closeSettings()
        case (.interrupted, "resume_run"): resumeInterruptedRun()
        case (.ready, "recover_run"): recoverSavedRun()
        case (.ready, "headquarters"): showHeadquarters()
        case (.headquarters, "discard_run"): discardSavedRun()
        case (.gameOver, "headquarters"), (.worldComplete, "headquarters"):
            // Failed/completed runs must reset before choosing another world.
            // The already-banked Salvage and purchased gear persist.
            restart()
            showHeadquarters()
        case (.headquarters, "gear_bay"): showGearBay()
        case (.headquarters, "ability_lab"): showAbilityLab()
        case (.headquarters, "restore"): showRestoration()
        case (.headquarters, "hq_back"): showReady()
        case (.gearBay, "hq_back"), (.abilityLab, "hq_back"): showHeadquarters()
        case (.gearBay, let key?) where key.hasPrefix("buy_"):
            purchasePermanentUpgrade(String(key.dropFirst(4)))
        case (.abilityLab, let key?) where key.hasPrefix("buy_"):
            purchasePermanentUpgrade(String(key.dropFirst(4)))
        case (.ready, "start") where WorldCatalog.unlocked(worldMapIndex) && recovery.load() == nil:
            draftLoadout = AbilityLoadout()
            showLoadout()
        case (.loadout, "back_loadout"): showReady()
        case (.loadout, let key?) where key.hasPrefix("pick_"):
            if draftLoadout.toggle(String(key.dropFirst(5))) { showLoadout() }
        case (.loadout, "lock_loadout") where draftLoadout.isReady:
            _ = enterSelectedWorld()
        case (.ready, "world_prev"):
            worldMapIndex = max(0, worldMapIndex - 1)
            showReady()
        case (.ready, "world_next"):
            worldMapIndex = min(WorldCatalog.worlds.count - 1, worldMapIndex + 1)
            showReady()
        case (.ready, "restore"), (.worldComplete, "restore"): showRestoration()
        case (.restoration, "back"):
            if restorationReturnPhase == .worldComplete { showWorldCompleteSummary() }
            else if restorationReturnPhase == .headquarters { showHeadquarters() }
            else { showReady() }
        case (.restoration, let key?) where key.hasPrefix("branch_"):
            if let index = Int(key.dropFirst(7)) { investCore(index) }
        case (.worldComplete, "next_world"): advanceToNextWorld()
        case (.gameOver, "restart"), (.worldComplete, "restart"): restart()
        case (.levelUp, _): _ = activateLevelUp(at: local)
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
                worldMapIndex = min(WorldCatalog.worlds.count - 1, max(0, worldMapIndex + (dx < 0 ? 1 : -1)))
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
