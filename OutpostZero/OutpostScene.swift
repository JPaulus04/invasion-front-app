import SpriteKit

final class OutpostScene: SKScene {
    private enum Phase { case ready, worldSelect, headquarters, gearBay, abilityLab, loadout, playing, levelUp, checkpoint, gate, settings, interrupted, worldComplete, restoration, gameOver }
    private struct Enemy {
        let node: SKShapeNode
        var health: Int
        let maxHealth: Int
        let healthBar: SKShapeNode
        let speed: CGFloat
        let reward: Int
        let behavior: Int
        let radius: CGFloat
        var activeAt: TimeInterval
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
    // Local origin is the ground-level entrance. The ring extends UP from it.
    // A wide ellipse centered on the floor looked like a horizontal pool.
    private let passageGate = SKShapeNode(path: CGPath(ellipseIn: CGRect(
        x: -52, y: 8, width: 104, height: 148), transform: nil))
    private let extractionPortal = SKShapeNode(circleOfRadius: 21)
    private let defenseDevice = SKShapeNode(rectOf: CGSize(width: 58, height: 66), cornerRadius: 12)
    private let defenseIntegrityBar = SKShapeNode(rectOf: CGSize(width: 55, height: 6), cornerRadius: 3)
    private var defenseIntegrity = EquipmentDefenseRules.maximumIntegrity
    private var nextDefenseHitAt: TimeInterval = 0
    // Capture-only: hold the exact asserted combat frame stable until screenshot.
    private var holdDefenseQAScreenshot = false
    private let zoneBanner = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let controlsHint = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let zoneScenery = SKNode()
    // Authored scenery is reused across rooms. Cache decoded SpriteKit textures
    // rather than recreating them for every perimeter prop on every wave.
    private var worldOneArtTextures: [String: SKTexture] = [:]
    private var missingWorldOneArtNames: Set<String> = []
    private func worldOneTexture(named name: String) -> SKTexture? {
        if let cached = worldOneArtTextures[name] { return cached }
        // Do not repeatedly decode/search the bundle for artwork that has not
        // shipped yet. Each missing asset is checked once per scene instance.
        if missingWorldOneArtNames.contains(name) { return nil }
        guard let image = productionImage(named: name) else {
            missingWorldOneArtNames.insert(name)
            return nil
        }
        let texture = SKTexture(image: image)
        texture.filteringMode = .linear
        worldOneArtTextures[name] = texture
        return texture
    }

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
        // Guardian Clearing stays shadowed but recognizably forest green.
        SKColor(red: 0.14, green: 0.23, blue: 0.19, alpha: 1)
    ]
    private var lastRestoredBranch = 0
    private let zoneNames = ["FOREST EDGE", "OVERGROWN PATH", "RUINED OUTPOST", "GUARDIAN CLEARING"]
    private var zoneIndex: Int { min(max(0, wave - 1) / 5, 3) }
    private var spawned = 0
    private var waveTarget = 0
    private var spawnClock: TimeInterval = 0
    private struct PendingFlankSwarm {
        let room: Int
        let warnedPilot: CGPoint
        let count: Int
    }
    private var pendingFlankSwarm: PendingFlankSwarm?
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
    private var profileSwitchArmed = false
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
    private let playerMastery = PlayerMastery()
    // Simulator QA scenes bypass menus, so their deterministic default uses
    // only existing skills. Normal gameplay locks the user's exact selection.
    private var lockedLoadout = AbilityLoadout.simulatorDefault
    private var orbitLevel = 0
    private var orbitalNodes: [SKShapeNode] = []
    private var energyWheelEvolved = false
    private var energyWheelNode: SKShapeNode?
    private var lastEnergyWheelHit: [ObjectIdentifier: TimeInterval] = [:]

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
    private var endRunConfirmationVisible = false
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
    private var pilotHeading: CGFloat = -.pi / 2
    private var pilotAimHeading: CGFloat? = nil
    private var pilotVisualDirection = CharacterMotion.pilotSouthDirection
    private var pilotTraveling = false
    private var pilotShotHeading: CGFloat = -.pi / 2
    private var pilotAnimationTime: TimeInterval = 0
    private var pilotLastVisualShot: TimeInterval = -10
    private var pilotRenderedHeading: CGFloat = -.pi / 2
    private var pilotStridePhase: CGFloat = 0
    private var pilotWalkBlend: CGFloat = 0
    // Authored walk cycles are candidates, available only in simulator QA.
    private var previewPilotWalk: Bool {
        #if targetEnvironment(simulator)
        return ProcessInfo.processInfo.arguments.contains("-previewPilotWalk") ||
            ProcessInfo.processInfo.arguments.contains("-previewPilotWalkNorth") ||
            ProcessInfo.processInfo.arguments.contains("-previewPilotWalkEast") ||
            ProcessInfo.processInfo.arguments.contains("-previewPilotWalkWest") ||
            ProcessInfo.processInfo.arguments.contains("-previewPilotWalkNE") ||
            ProcessInfo.processInfo.arguments.contains("-previewPilotWalkNW") ||
            ProcessInfo.processInfo.arguments.contains("-previewPilotWalkSE") ||
            ProcessInfo.processInfo.arguments.contains("-previewPilotWalkSW") ||
            ProcessInfo.processInfo.arguments.contains("-previewPilotLegRigSW")
        #else
        return false
        #endif
    }
    private lazy var pilotWalkPrototypeTextures: [SKTexture] = {
        (0..<4).map { productionTexture(named: "pilot_walk_s_\($0)", fallback: pilotArmorTexture) }
    }()
    private var previewPilotWalkNorth: Bool {
        previewPilotWalk && ProcessInfo.processInfo.arguments.contains("-previewPilotWalkNorth")
    }
    private lazy var pilotWalkNorthTextures: [SKTexture] = {
        (0..<4).map { productionTexture(named: "pilot_walk_n_\($0)", fallback: pilotArmorTexture) }
    }()
    private var previewPilotWalkEast: Bool {
        previewPilotWalk && ProcessInfo.processInfo.arguments.contains("-previewPilotWalkEast")
    }
    private var previewPilotWalkWest: Bool {
        previewPilotWalk && ProcessInfo.processInfo.arguments.contains("-previewPilotWalkWest")
    }
    private var previewPilotWalkNE: Bool {
        previewPilotWalk && ProcessInfo.processInfo.arguments.contains("-previewPilotWalkNE")
    }
    private var previewPilotWalkNW: Bool {
        previewPilotWalk && ProcessInfo.processInfo.arguments.contains("-previewPilotWalkNW")
    }
    private var previewPilotWalkSE: Bool {
        previewPilotWalk && ProcessInfo.processInfo.arguments.contains("-previewPilotWalkSE")
    }
    private var previewPilotLegRigSW: Bool {
        #if targetEnvironment(simulator)
        return ProcessInfo.processInfo.arguments.contains("-previewPilotLegRigSW")
        #else
        return false
        #endif
    }
    private var pilotLegRigPreview: PilotLegRigPreview?
    private var previewPilotWalkSW: Bool {
        previewPilotWalk && (ProcessInfo.processInfo.arguments.contains("-previewPilotWalkSW") || previewPilotLegRigSW)
    }
    private var previewWalkDiagonal: CGVector? {
        if previewPilotWalkNE { return CGVector(dx: 1, dy: 1) }
        if previewPilotWalkNW { return CGVector(dx: -1, dy: 1) }
        if previewPilotWalkSE { return CGVector(dx: 1, dy: -1) }
        if previewPilotWalkSW { return CGVector(dx: -1, dy: -1) }
        return nil
    }
    private var previewWalkStart: CGPoint {
        if let diagonal = previewWalkDiagonal {
            let offset = min(roomBounds.width, roomBounds.height) * 0.2
            return CGPoint(x: roomBounds.midX - offset * diagonal.dx, y: roomBounds.midY - offset * diagonal.dy)
        }
        if previewPilotWalkEast || previewPilotWalkWest {
            return CGPoint(x: roomBounds.minX + roomBounds.width * (previewPilotWalkWest ? 0.7 : 0.3),
                           y: roomBounds.midY)
        }
        return CGPoint(x: roomBounds.midX,
                       y: roomBounds.minY + roomBounds.height * (previewPilotWalkNorth ? 0.25 : 0.65))
    }
    private var previewWalkTarget: CGPoint {
        if let diagonal = previewWalkDiagonal {
            let offset = min(roomBounds.width, roomBounds.height) * 0.2
            return CGPoint(x: roomBounds.midX + offset * diagonal.dx, y: roomBounds.midY + offset * diagonal.dy)
        }
        if previewPilotWalkEast || previewPilotWalkWest {
            return CGPoint(x: roomBounds.minX + roomBounds.width * (previewPilotWalkWest ? 0.3 : 0.7),
                           y: roomBounds.midY)
        }
        return CGPoint(x: roomBounds.midX,
                       y: roomBounds.minY + roomBounds.height * (previewPilotWalkNorth ? 0.65 : 0.25))
    }
    private lazy var pilotWalkEastTextures: [SKTexture] = {
        (0..<4).map { productionTexture(named: "pilot_walk_e_\($0)", fallback: pilotArmorTexture) }
    }()
    private lazy var pilotWalkWestTextures: [SKTexture] = {
        (0..<4).map { productionTexture(named: "pilot_walk_w_\($0)", fallback: pilotArmorTexture) }
    }()
    private lazy var pilotWalkNETextures: [SKTexture] = {
        (0..<4).map { productionTexture(named: "pilot_walk_ne_\($0)", fallback: pilotArmorTexture) }
    }()
    private lazy var pilotWalkNWTextures: [SKTexture] = {
        (0..<4).map { productionTexture(named: "pilot_walk_nw_\($0)", fallback: pilotArmorTexture) }
    }()
    private lazy var pilotWalkSETextures: [SKTexture] = {
        (0..<4).map { productionTexture(named: "pilot_walk_se_\($0)", fallback: pilotArmorTexture) }
    }()
    private lazy var pilotWalkSWTextures: [SKTexture] = {
        (0..<4).map { productionTexture(named: "pilot_walk_sw_\($0)", fallback: pilotArmorTexture) }
    }()
    private lazy var pilotDirectionalTextures: [SKTexture] = {
        CharacterMotion.pilotDirections.map {
            productionTexture(named: "pilot_" + $0, fallback: pilotArmorTexture)
        }
    }()
    private var nextFootstepAt: TimeInterval = 0
    private var movementOrigin: CGPoint?
    private var movementTarget: CGPoint?
    // A small in-run positioning bonus, distinct from tactical abilities.
    private var mobilityRank = 0
    private var pilotSpeed: CGFloat {
        144 + CGFloat(branchLevel(3) * 3 + mobilityRank * 6)
    }
    private let autoFireRange: CGFloat = 260
    private var pilotShieldUntil: TimeInterval = 0
    private var pilotHitCount = 0
    private var chainLevel = 0
    private var explosiveLevel = 0
    private var incendiaryLevel = 0
    private var frostLevel = 0
    private var chilledUntil: [ObjectIdentifier: TimeInterval] = [:]
    private var burns: [ObjectIdentifier: (damage: Int, until: TimeInterval, nextTick: TimeInterval)] = [:]
    private var bossNode: SKShapeNode?
    private var guardianArmorBroken = false
    private var guardianSupportDeployed = false
    private var scrapyardWardenEnraged = false
    private var guardianTransitionUntil: TimeInterval = 0
    private let worldWaveCount = CampaignPacing.roomsPerWorld
    private let coreBranches = ["WEAPONS", "REACTOR", "ARMOR", "MOBILITY", "SYSTEMS"]
    private var availableCores: Int { UserDefaults.standard.integer(forKey: "powerCoresAvailable") }
    private func branchLevel(_ index: Int) -> Int {
        UserDefaults.standard.integer(forKey: "coreBranch_\(index)")
    }
    private var permanentDamageBonus: Int { branchLevel(0) / 3 }
    private var permanentArmorBonus: Int { branchLevel(2) * 2 }
    private var gearWeaponBonus: Int { min(5, permanent.rank("weapon")) + max(0, permanent.rank("weapon") - 5) / 3 }
    private var gearReactorBonus: Int { min(5, permanent.rank("reactor")) + max(0, permanent.rank("reactor") - 5) / 3 }
    private var maximumHealth: Int { 100 + permanentArmorBonus + (min(5, permanent.rank("armor")) * 15 + max(0, permanent.rank("armor") - 5) * 5) + runArmor }
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
    // Extraction is not a peaceful tactical gate: remaining enemies can
    // still fight and pay their ordinary kill rewards until the pilot leaves.
    private var extractionCombatActive: Bool {
        phase == .gate && activeEncounter == .survival && roomCleared
    }
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
    private let floorNumber = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let survivalClock = SKLabelNode(fontNamed: "AvenirNext-Heavy")
    private let pilotHealthTrack = SKShapeNode(rectOf: CGSize(width: 42, height: 6), cornerRadius: 3)
    private let pilotHealthFill = SKShapeNode(rectOf: CGSize(width: 42, height: 6), cornerRadius: 3)


    override func didMove(to view: SKView) {
        scaleMode = .resizeFill
        backgroundColor = SKColor(red: 0.07, green: 0.15, blue: 0.21, alpha: 1)
        addChild(arena)
        addChild(hud)
        floorNumber.fontSize = 35
        floorNumber.fontColor = .white
        floorNumber.horizontalAlignmentMode = .left
        floorNumber.zPosition = 4
        hud.addChild(floorNumber)
        survivalClock.fontSize = 32
        survivalClock.fontColor = .systemYellow
        survivalClock.zPosition = 4
        hud.addChild(survivalClock)
        pilotHealthTrack.fillColor = SKColor.black.withAlphaComponent(0.8)
        pilotHealthTrack.strokeColor = .white.withAlphaComponent(0.5)
        pilotHealthTrack.position = CGPoint(x: 0, y: 36)
        pilotHealthTrack.zPosition = 15
        pilot.addChild(pilotHealthTrack)
        pilotHealthFill.fillColor = .systemGreen
        pilotHealthFill.strokeColor = .clear
        pilotHealthFill.position = .zero
        pilotHealthTrack.addChild(pilotHealthFill)

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
        let pilotArmor = SKSpriteNode(texture: pilotDirectionalTextures[CharacterMotion.pilotSouthDirection])
        // Visual scale only: give the hero enough screen presence to read
        // its face, shoulder plates and reactor at normal phone size.
        // The 28x34 collision container and movement physics do not change.
        pilotArmor.size = CGSize(width: 63, height: 63)
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
        // CAMPAIGN: upright circular portal anchored to the ground, not a
        // flat round pad. Its tall energy plane faces the player from above.
        passageGate.name = "campaignUprightPortal"
        passageGate.fillColor = SKColor(red: 0.045, green: 0.12, blue: 0.25, alpha: 1)
        passageGate.strokeColor = SKColor(red: 0.46, green: 0.84, blue: 0.97, alpha: 1)
        passageGate.lineWidth = 9
        passageGate.glowWidth = 3
        passageGate.zPosition = 5
        passageGate.isHidden = true
        arena.addChild(passageGate)

        // The footplate and contact shadow show a physical structure resting
        // vertically ON the terrain. They are behind the energy plane.
        let groundShadow = SKShapeNode(ellipseOf: CGSize(width: 134, height: 26))
        groundShadow.name = "campaignPortalGroundShadow"
        groundShadow.position = CGPoint(x: 7, y: -4)
        groundShadow.fillColor = SKColor.black.withAlphaComponent(0.36)
        groundShadow.strokeColor = .clear
        groundShadow.zPosition = -2
        passageGate.addChild(groundShadow)
        let footing = SKShapeNode(ellipseOf: CGSize(width: 118, height: 19))
        footing.name = "campaignPortalFootplate"
        footing.position = CGPoint(x: 0, y: 0)
        footing.fillColor = SKColor(red: 0.20, green: 0.31, blue: 0.37, alpha: 1)
        footing.strokeColor = .systemTeal
        footing.lineWidth = 2
        footing.zPosition = -1.4
        passageGate.addChild(footing)
        // The offset rear rim is structural thickness viewed in 3/4 perspective.
        let rearRim = SKShapeNode(path: CGPath(ellipseIn: CGRect(
            x: -49, y: 7, width: 104, height: 148), transform: nil))
        rearRim.name = "campaignPortalRearRim"
        rearRim.position = CGPoint(x: 8, y: -3)
        rearRim.fillColor = SKColor(red: 0.10, green: 0.20, blue: 0.28, alpha: 1)
        rearRim.strokeColor = SKColor(red: 0.20, green: 0.44, blue: 0.55, alpha: 1)
        rearRim.lineWidth = 8
        rearRim.zPosition = -0.9
        passageGate.addChild(rearRim)
        for side: CGFloat in [-1, 1] {
            let leg = SKShapeNode(rectOf: CGSize(width: 13, height: 67),
                                  cornerRadius: 4)
            leg.position = CGPoint(x: side * 45, y: 33)
            leg.fillColor = SKColor(red: 0.23, green: 0.37, blue: 0.43, alpha: 1)
            leg.strokeColor = SKColor(red: 0.19, green: 0.68, blue: 0.77, alpha: 1)
            leg.lineWidth = 2
            leg.zPosition = -0.7
            passageGate.addChild(leg)
        }
        let innerFrame = SKShapeNode(ellipseOf: CGSize(width: 88, height: 131))
        innerFrame.name = "campaignPortalInnerFrame"
        innerFrame.position = CGPoint(x: 0, y: 82)
        innerFrame.fillColor = SKColor(red: 0.12, green: 0.20, blue: 0.30, alpha: 1)
        innerFrame.strokeColor = SKColor(red: 0.30, green: 0.56, blue: 0.69, alpha: 1)
        innerFrame.lineWidth = 4
        innerFrame.zPosition = 0.5
        passageGate.addChild(innerFrame)
        let portalEnergy = SKShapeNode(ellipseOf: CGSize(width: 72, height: 113))
        portalEnergy.name = "portalEnergy"
        portalEnergy.position = CGPoint(x: 0, y: 82)
        portalEnergy.fillColor = SKColor(red: 0.06, green: 0.24, blue: 0.58, alpha: 1)
        portalEnergy.strokeColor = SKColor(red: 0.19, green: 0.69, blue: 0.97, alpha: 0.93)
        portalEnergy.lineWidth = 2
        portalEnergy.glowWidth = 5
        portalEnergy.zPosition = 1
        passageGate.addChild(portalEnergy)
        // Currents rise inside the vertical energy field, rather than
        // radiating outward like ripples on a horizontal puddle.
        for index in 0..<5 {
            let y = CGFloat(index - 2) * 19
            let path = CGMutablePath()
            path.move(to: CGPoint(x: -22, y: y - 7))
            path.addQuadCurve(
                to: CGPoint(x: 20, y: y + 10),
                control: CGPoint(x: 2 + CGFloat(index % 2) * 7, y: y + 13))
            let swirl = SKShapeNode(path: path)
            swirl.name = "campaignEnergyCurrent"
            swirl.strokeColor = index.isMultiple(of: 2)
                ? SKColor(red: 0.43, green: 0.91, blue: 1, alpha: 0.79)
                : SKColor(red: 0.16, green: 0.64, blue: 0.99, alpha: 0.89)
            swirl.lineWidth = 3.1
            swirl.lineCap = .round
            swirl.glowWidth = 1.3
            swirl.zPosition = 2
            portalEnergy.addChild(swirl)
            swirl.run(.repeatForever(.sequence([
                .fadeAlpha(to: 0.37, duration: 0.55 + Double(index) * 0.10),
                .fadeAlpha(to: 0.95, duration: 0.64 + Double(index) * 0.10)
            ])))
        }
        // Clamps around a tall standing ring; their height makes the
        // orientation readable even at phone size.
        for anchor in [
            CGPoint(x: -48, y: 86), CGPoint(x: 48, y: 86),
            CGPoint(x: 0, y: 13), CGPoint(x: 0, y: 151)
        ] {
            let clasp = SKShapeNode(rectOf: CGSize(width: 16, height: 13),
                                    cornerRadius: 3)
            clasp.position = anchor
            clasp.zRotation = abs(anchor.x) > 0 ? 0 : .pi / 2
            clasp.fillColor = SKColor(red: 0.23, green: 0.36, blue: 0.43, alpha: 1)
            clasp.strokeColor = .systemTeal
            clasp.lineWidth = 2
            clasp.zPosition = 3
            passageGate.addChild(clasp)
        }
        let gateText = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        gateText.text = "ENTER"
        gateText.fontSize = 12
        gateText.fontColor = .white
        gateText.position.y = 81
        gateText.verticalAlignmentMode = .center
        gateText.zPosition = 4
        passageGate.addChild(gateText)
        let gateArrow = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        gateArrow.text = "▲"
        gateArrow.fontSize = 17
        gateArrow.fontColor = .systemCyan
        gateArrow.position = CGPoint(x: 0, y: -24)
        gateArrow.zPosition = 4
        gateArrow.name = "gateArrow"
        passageGate.addChild(gateArrow)

        // Survival: a modest energy orb and thin vertical rescue beacon.
        extractionPortal.name = "survivalExtractionOrb"
        extractionPortal.fillColor = SKColor(red: 0.08, green: 0.51, blue: 0.82, alpha: 0.95)
        extractionPortal.strokeColor = SKColor(red: 0.73, green: 0.99, blue: 1, alpha: 1)
        extractionPortal.lineWidth = 3
        extractionPortal.glowWidth = 4
        extractionPortal.zPosition = 7
        extractionPortal.isHidden = true
        let base = SKShapeNode(ellipseOf: CGSize(width: 53, height: 17))
        base.name = "extractionBeaconBase"
        base.position = CGPoint(x: 0, y: -19)
        base.fillColor = SKColor(red: 0.07, green: 0.28, blue: 0.37, alpha: 0.55)
        base.strokeColor = SKColor(red: 0.22, green: 0.76, blue: 0.91, alpha: 0.85)
        base.lineWidth = 2
        base.zPosition = -1
        extractionPortal.addChild(base)
        let beam = SKShapeNode(rectOf: CGSize(width: 7, height: 68), cornerRadius: 3)
        beam.name = "extractionBeaconBeam"
        beam.position = CGPoint(x: 0, y: 39)
        beam.fillColor = SKColor(red: 0.18, green: 0.88, blue: 1, alpha: 0.23)
        beam.strokeColor = .clear
        beam.glowWidth = 7
        beam.zPosition = -1
        extractionPortal.addChild(beam)
        beam.run(.repeatForever(.sequence([
            .fadeAlpha(to: 0.36, duration: 0.85),
            .fadeAlpha(to: 0.90, duration: 0.95)
        ])))
        let core = SKShapeNode(circleOfRadius: 7)
        core.name = "extractionCore"
        core.fillColor = SKColor(red: 0.69, green: 0.97, blue: 1, alpha: 1)
        core.strokeColor = .white
        core.lineWidth = 1
        core.glowWidth = 2
        core.zPosition = 2
        extractionPortal.addChild(core)
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
        // Validate real navigation keys and stage geometry in a simulator,
        // rather than accepting a static presentation-board illustration.
        if ProcessInfo.processInfo.arguments.contains("-captureHomeNavigationScreenshot") {
            validateHubNavigation()
            let keys = ["nav_gear", "nav_pilot",
                        "nav_abilities", "nav_home"]
            precondition(phase == .ready && pilot.isHidden &&
                         keys.allSatisfy({ overlayButtons[$0] != nil }) &&
                         overlay.childNode(withName: "homeUprightPortal") != nil &&
                         overlay.childNode(withName: "//homePortalCurrent") != nil &&
                         overlay.childNode(withName: "homeResourceBar") != nil &&
                         overlay.childNode(withName: "homePilotPreview") != nil &&
                         overlayButtons["start"] != nil,
                         "Home must render one pilot, animated portal and working dock")
        }
        if ProcessInfo.processInfo.arguments.contains("-captureWorldSelectorScreenshot") {
            showWorldSelector()
            precondition(phase == .worldSelect &&
                         overlayButtons["world_next"] != nil &&
                         overlayButtons["nav_home"] != nil,
                         "World map must support selection and return to home")
        }
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
            // Run the *real* recovery path through all three survival
            // interruption states, not just the serializable snapshot type.
            // Simulator capture mode skips periodic saving, so these fixtures
            // explicitly write snapshots and never touch a player's save.
            func resumeSurvivalFixture(elapsed: TimeInterval,
                                       location: RunSnapshot.Location,
                                       pendingUpgrade: Bool) {
                var savedProgress = RunProgress()
                if pendingUpgrade {
                    savedProgress.earnXP(savedProgress.nextLevelXP)
                    precondition(savedProgress.pendingChoices == 1)
                }
                var survivorSave = RunSnapshot(
                    version: RunSnapshot.schema, worldIndex: 0,
                    room: 6, location: location,
                    health: 75, coins: 175, damage: 3, fireRate: 2,
                    chainLevel: 1, explosiveLevel: 0, incendiaryLevel: 1,
                    orbitLevel: 1, runArmor: 10, checkpointUsed: false,
                    checkpointPresented: false,
                    progress: savedProgress,
                    abilities: ["chain", "orbit", "incendiary"],
                    earnedSalvage: 110, roomSalvageCredit: 0,
                    roomCoinCredit: 63, roomXPCredit: 55)
                survivorSave.timedEncounterElapsed = elapsed
                survivorSave.timedEncounterSpawned = 7
                survivorSave.timedEncounterLiving = 3
                precondition(recovery.save(survivorSave))
                worldMapIndex = 2 // Resume must select the saved world.
                showReady()
                recoverSavedRun()
                precondition(worldMapIndex == 0 && wave == 6 &&
                             activeEncounter == .survival &&
                             abs(waveElapsed - elapsed) < 0.001 &&
                             spawned >= 7 && enemies.count == 3 &&
                             coins == 175 && health == 75 &&
                             roomCoinsRecoveredCredit == 0 &&
                             roomXPRecoveredCredit == 0,
                             "Survival recovery must keep only the live swarm and pay new kills")
                if pendingUpgrade {
                    precondition(phase == .levelUp && arena.isPaused &&
                                 progress.pendingChoices == 1 &&
                                 levelUpReturnPhase == .playing &&
                                 !levelChoices.isEmpty,
                                 "Interrupted level-up must return with its choice intact")
                    chooseLevelUpgrade(levelChoices[0])
                    precondition(phase == .playing &&
                                 progress.pendingChoices == 0 &&
                                 abs(waveElapsed - elapsed) < 0.001,
                                 "Choosing recovered upgrade must resume the same timer")
                } else {
                    precondition(phase == .interrupted && arena.isPaused,
                                 "Recovery must wait for explicit player resume")
                    resumeInterruptedRun()
                    if location == .clearedGate {
                        precondition(phase == .gate && roomCleared &&
                                     !extractionPortal.isHidden &&
                                     enemies.count == 3 &&
                                     survivalSpawnPhaseFinished,
                                     "Saved timeout must restore open orb with live enemies")
                    } else if SurvivalEncounterRules.extractionActive(
                        world: worldMapIndex, room: wave, elapsed: elapsed) {
                        // Legacy battle-state interruption exactly on timeout.
                        update(2_000)
                        update(2_000.03)
                        precondition(phase == .gate && roomCleared &&
                                     !extractionPortal.isHidden &&
                                     enemies.count == 3,
                                     "Expired battle snapshot must open evacuation on resume")
                    } else {
                        let beforeCoins = coins
                        let beforeXP = progress.xp
                        precondition(phase == .playing && !roomCleared &&
                                     awardRoomCoins(11) == 11 &&
                                     awardRoomXP(9) == 9 &&
                                     coins == beforeCoins + 11 &&
                                     progress.xp == beforeXP + 9,
                                     "Surviving enemy rewards cannot be withheld after resume")
                    }
                }
                recovery.clear()
            }
            resumeSurvivalFixture(elapsed: 43, location: .battle,
                                  pendingUpgrade: false)
            let deadline = SurvivalEncounterRules.duration(world: 0, room: 6)
            resumeSurvivalFixture(elapsed: deadline, location: .battle,
                                  pendingUpgrade: false)
            resumeSurvivalFixture(elapsed: deadline, location: .clearedGate,
                                  pendingUpgrade: false)
            resumeSurvivalFixture(elapsed: 41, location: .battle,
                                  pendingUpgrade: true)
            showReady()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureHeadquartersScreenshot") {
            showHeadquarters()
            validateHubNavigation()
            precondition(overlayButtons["nav_gear"] != nil &&
                         overlayButtons["nav_abilities"] != nil,
                         "Headquarters must expose both permanent upgrade areas")
            showGearBay()
            validateHubNavigation()
            precondition(phase == .gearBay && overlayButtons["hq_back"] != nil,
                         "Gear Bay must be reachable and have a way out")
            showAbilityLab()
            validateHubNavigation()
            precondition(phase == .abilityLab && overlayButtons["hq_back"] != nil,
                         "Ability Lab must be reachable and have a way out")
            showHeadquarters()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureGearBayScreenshot") {
            showGearBay()
            validateHubNavigation()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureAbilityLabScreenshot") {
            showAbilityLab()
            validateHubNavigation()
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
            showReady()
            precondition(enterSelectedWorld() && wave == 1 &&
                         lockedLoadout.selected.isEmpty && phase == .playing,
                         "World 1 must enter without a pre-run ability menu")
            progress.earnXP(progress.nextLevelXP)
            precondition(presentPendingLevelUp(returningTo: .playing) &&
                         phase == .levelUp && levelChoices.count == 3,
                         "First ability choice must be an in-game XP draw")
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
            // A tiny QA-only identity pixel cluster certifies which capture
            // actually launched; the simulator home screen or stale previous
            // game scene must never pass as an arena screenshot.
            let qaMarker = SKShapeNode(rectOf: CGSize(width: 8, height: 8))
            qaMarker.name = "arenaCaptureIdentity"
            let markerColors: [SKColor] = [
                SKColor(red: 1, green: 0, blue: 0, alpha: 1),
                SKColor(red: 0, green: 1, blue: 0, alpha: 1),
                SKColor(red: 0, green: 0, blue: 1, alpha: 1)
            ]
            qaMarker.fillColor = markerColors[slot]
            qaMarker.strokeColor = .white
            qaMarker.lineWidth = 1
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
            let marker = SKShapeNode(rectOf: CGSize(width: 8, height: 8))
            marker.name = "survivalQAIdentity"
            marker.fillColor = SKColor(red: 1, green: 0, blue: 1, alpha: 1)
            marker.strokeColor = .white
            marker.lineWidth = 1
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
        // Real campaign equipment-defense fixtures: a damaged reactor and
        // a timed victory that opens the normal upright campaign portal.
        let defenseInProgress = ProcessInfo.processInfo.arguments.contains(
            "-captureEquipmentDefenseScreenshot")
        let defenseWon = ProcessInfo.processInfo.arguments.contains(
            "-captureEquipmentDefenseClearScreenshot")
        let defenseFailed = ProcessInfo.processInfo.arguments.contains(
            "-captureEquipmentDefenseFailureScreenshot")
        if defenseInProgress || defenseWon || defenseFailed {
            worldMapIndex = 0
            wave = 11
            gateUnlocked = true
            startWave()
            precondition(activeEncounter == .equipmentDefense &&
                         defenseDevice.parent === arena &&
                         defenseIntegrity == EquipmentDefenseRules.maximumIntegrity,
                         "Room 12 must load a real reactor protection objective")
            let base = reactorMovementPatch!.frame
            for direction in [CGPoint(x: 1, y: 0), CGPoint(x: -1, y: 0),
                              CGPoint(x: 0, y: 1), CGPoint(x: 0, y: -1)] {
                let start = CGPoint(x: base.midX + direction.x * 90,
                                    y: base.midY + direction.y * 90)
                let end = CGPoint(x: base.midX - direction.x * 90,
                                  y: base.midY - direction.y * 90)
                let stopped = resolvePilotMovement(from: start, to: end)
                precondition(distance(stopped, end) > 30 &&
                             !reactorMovementPatch!.contains(stopped, margin: 12),
                             "Pilot must not tunnel through any side of reactor base")
            }
            let savedPilot = pilot.position
            pilot.position = CGPoint(x: base.midX, y: base.maxY + 20)
            updateReactorOcclusion()
            precondition(defenseDevice.zPosition > pilot.zPosition &&
                         defenseDevice.alpha < 1 &&
                         pilot.zPosition + pilotHealthTrack.zPosition >
                            defenseDevice.zPosition + 1,
                         "Reactor must fade over a rear pilot and preserve health visibility")
            pilot.position.y = base.minY - 20
            updateReactorOcclusion()
            precondition(defenseDevice.zPosition + 0.5 < pilot.zPosition &&
                         defenseDevice.alpha == 1,
                         "Front pilot must render over the entire reactor")
            let recovered = resolvePilotMovement(
                from: CGPoint(x: base.midX, y: base.midY), to: savedPilot)
            precondition(!reactorMovementPatch!.contains(recovered, margin: 12),
                         "Legacy overlapping saves must escape the reactor")
            pilot.position = savedPilot
            updateReactorOcclusion()
            for slot in 0..<4 {
                spawned += 1
                spawnEnemy(artReviewType: SurvivalEncounterRules.swarmType(
                    room: wave, slot: slot))
            }
            precondition(enemies.count == 4)
            precondition(enemies.allSatisfy {
                EquipmentDefenseRules.safeSpawn(
                    distanceFromReactor: distance($0.node.position, defenseDevice.position),
                    enemyRadius: $0.radius)
            }, "Enemy reinforcements must not materialize directly on the reactor")
            if defenseFailed {
                // Prior earned rewards survive the optional objective loss.
                awardRoomCoins(9)
                bankSalvage(2)
                _ = awardRoomXP(9)
                let healthBefore = health
                let salvageBefore = salvageBankedThisRun
                let coinsBefore = coins
                let xpBefore = progress.xp
                for _ in 0..<38 {
                    combatClock.advance(EquipmentDefenseRules.hitCooldown + 0.1,
                                        playing: true)
                    nextDefenseHitAt = combatTime
                    damageDefenseDevice()
                }
                precondition(phase == .gate && roomCleared && defenseIntegrity == 0 &&
                             !passageGate.isHidden && extractionPortal.isHidden &&
                             enemies.isEmpty && health == healthBefore &&
                             salvageBankedThisRun == salvageBefore &&
                             coins == coinsBefore + CampaignPacing.clearCoins(room: wave) &&
                             progress.xp == xpBefore + CampaignPacing.clearXP(room: wave),
                             "Lost reactor must open campaign exit without its Salvage bonus")
                precondition((defenseDevice.childNode(withName: "fieldReactorLabel")
                              as? SKLabelNode)?.text == "BONUS LOST",
                             "Failed defense must not masquerade as a secured reactor")
            } else if defenseWon {
                waveElapsed = SurvivalEncounterRules.duration(world: 0, room: wave)
                update(1_000)
                update(1_000.04)
                precondition(roomCleared && phase == .gate &&
                             !passageGate.isHidden && extractionPortal.isHidden &&
                             enemies.isEmpty && defenseIntegrity > 0,
                             "Protecting reactor until deadline must open standard portal")
            } else {
                combatClock.advance(2, playing: true)
                nextDefenseHitAt = combatTime
                enemies[0].node.position = CGPoint(
                    x: defenseDevice.position.x + 12,
                    y: defenseDevice.position.y + 9)
                pilotShieldUntil = combatTime + 120
                let before = defenseIntegrity
                update(1_000)
                update(1_000.04)
                precondition(phase == .playing &&
                             defenseIntegrity == before - EquipmentDefenseRules.hitDamage &&
                             !roomCleared && passageGate.isHidden,
                             "Live enemy contact must damage equipment, not complete room")
            }
            // Capture the previously unpictured overlap case as well as checking
            // it numerically: active defense shows rear occlusion, secured front.
            if !defenseFailed {
                pilot.position = CGPoint(x: base.midX + 20,
                    y: defenseInProgress ? base.maxY + 20 : base.minY - 28)
                updateReactorOcclusion()
            }
            // State-specific, screenshot-only identity. A stale survival or
            // prior defense screenshot must fail verification rather than
            // masquerade as another test's result.
            let identity = SKShapeNode(rectOf: CGSize(width: 12, height: 12))
            identity.name = defenseInProgress ? "defenseActiveIdentity" :
                (defenseWon ? "defenseSecuredIdentity" : "defenseFailedIdentity")
            identity.fillColor = defenseInProgress ? .red :
                (defenseWon ? .green : .blue)
            identity.strokeColor = .clear
            identity.position = CGPoint(x: size.width * 0.90,
                                        y: size.height * 0.60)
            identity.zPosition = 65
            hud.addChild(identity)
            arena.isPaused = true
            // SKScene.update runs even if arena actions are paused. Freeze this
            // QA-only frame after assertions so screenshots are deterministic.
            holdDefenseQAScreenshot = true
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
            // Keep the central extraction orb in the actual screenshot,
            // not outside the camera view at the southern arena entrance.
            pilot.position = CGPoint(x: roomBounds.midX - 105,
                                     y: roomBounds.midY - 85)
            arena.position = ArenaLayout.offset(
                for: pilot.position, viewportSize: size)
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
            precondition(TerrainHazards.extractionApproachIsClear(
                         from: pilot.position, to: extractionPortal.position,
                         patches: roomHazards),
                         "Production portal must be reachable without crossing water")
            precondition(roomCleared && phase == .gate &&
                         enemies.count == living &&
                         !extractionPortal.isHidden && passageGate.isHidden &&
                         !SurvivalEncounterRules.canSpawn(
                             world: worldMapIndex, room: wave,
                             elapsed: waveElapsed, livingEnemies: enemies.count),
                         "Timed extraction must open with living enemies")
            // Regression for the previous peaceful-gate bug: the player can
            // still auto-fire to earn legitimate kill XP and coins, without
            // ever spawning another enemy once extraction is available.
            enemies[0].health = 1
            enemies[0].node.position = CGPoint(
                x: pilot.position.x + 45, y: pilot.position.y + 22)
            combatClock.advance(2, playing: true)
            lastShot = combatTime - 1
            let coinsBefore = coins
            let xpBefore = progress.xp
            let foeCountBefore = enemies.count
            update(1_000)
            update(1_000.03)
            precondition(enemies.count == foeCountBefore - 1 &&
                         coins > coinsBefore &&
                         (progress.xp != xpBefore || progress.pendingChoices > 0) &&
                         phase == .gate && !extractionPortal.isHidden &&
                         survivalSpawnPhaseFinished,
                         "Timed evacuation must allow earned kills, not new spawns")
            // Reject screenshots of the iOS home screen or a crashed process.
            // Tiny test-only identity pixel cluster is absent from shipped play.
            let identity = SKShapeNode(rectOf: CGSize(width: 8, height: 8))
            identity.fillColor = SKColor(red: 1, green: 0, blue: 1, alpha: 1)
            identity.strokeColor = .white
            identity.lineWidth = 1
            identity.zPosition = 65
            identity.position = CGPoint(x: size.width * 0.90,
                                        y: size.height * 0.60)
            hud.addChild(identity)
            arena.isPaused = true
        }
        // Scene-level end-to-end regression: walk into extraction with live
        // enemies present, then confirm that Room 7 uses a normal fixed camera
        // and none of the old survival UI/enemies follow the pilot.
        if ProcessInfo.processInfo.arguments.contains(
            "-captureSurvivalTransitionScreenshot") {
            worldMapIndex = 0
            wave = 5
            gateUnlocked = true
            startWave()
            precondition(activeEncounter == .survival)
            for index in 0..<4 {
                spawned += 1
                spawnEnemy(artReviewType: SurvivalEncounterRules.swarmType(
                    room: wave, slot: index))
            }
            waveElapsed = SurvivalEncounterRules.duration(
                world: worldMapIndex, room: wave)
            completeWave()
            precondition(phase == .gate && !extractionPortal.isHidden &&
                         enemies.count == 4,
                         "Extraction must stay open with four active enemies")
            pilot.position = extractionPortal.position
            update(1_000)
            precondition(wave == 7 && activeEncounter == .tactical &&
                         phase == .playing && !expandedArenaPreview &&
                         arena.position == .zero && enemies.isEmpty &&
                         extractionPortal.isHidden && passageGate.isHidden &&
                         zoneBanner.text != "EXTRACTION OPEN",
                         "Room 7 must reset camera, enemies and extraction UI")
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        // Art review for Rooms 6-10: stage actual forest-overgrowth scenery
        // without changing combat balance or the launch state seen by players.
        // Capture both states of the live World 1 Guardian before art approval.
        let guardianBase = ProcessInfo.processInfo.arguments.contains(
            "-captureFrontierGuardianScreenshot")
        let guardianExposed = ProcessInfo.processInfo.arguments.contains(
            "-captureFrontierGuardianExposedScreenshot")
        let guardianResolved = ProcessInfo.processInfo.arguments.contains(
            "-captureFrontierGuardianResolvedScreenshot")
        if guardianBase || guardianExposed || guardianResolved {
            worldMapIndex = 0
            wave = 19
            gateUnlocked = true
            startWave()
            spawned = waveTarget
            spawnEnemy()
            // Wait until the spawn materialization would have finished in
            // live play. The old review froze 28%-opaque silhouettes before
            // the first active frame and falsely made all the art look ghostly.
            bossNode?.alpha = 1
            bossNode?.childNode(withName: "spawnWarning")?.removeFromParent()
            precondition(wave == 20 && enemies.count == 1 && bossNode != nil &&
                         bossNode?.alpha == 1 &&
                         enemies[0].health == selectedWorld.bossHealth &&
                         bossNode?.childNode(withName: "bossArt") != nil &&
                         bossNode?.childNode(withName: "guardianBossNameplate") != nil,
                         "World 1 boss must show enlarged illustrated Guardian and nameplate")
            if guardianExposed || guardianResolved {
                enemies[0].health = FrontierGuardianRules.armorBreakHealth(
                    maxHealth: enemies[0].maxHealth)
                updateFrontierGuardianPhase()
                precondition(guardianArmorBroken && lobs.count == 2 &&
                             enemies[0].health == enemies[0].maxHealth / 2 &&
                             guardianTransitionUntil > combatTime &&
                             lobs[0].marker.childNode(withName: "mortarCountdown") != nil &&
                             lobs[1].marker.childNode(withName: "mortarCountdown") != nil &&
                             hypot(lobs[0].target.x - lobs[1].target.x,
                                   lobs[0].target.y - lobs[1].target.y) >= 70,
                             "Guardian must warn in two distinct phase-two impact zones")
                if guardianResolved {
                    // QA proves the attacks resolve on the active combat clock,
                    // both indicators clean up, and a pilot who actually dodges
                    // avoids damage. This is a state transition, not a mock image.
                    let initialHealth = health
                    let safePoint = CGPoint(
                        x: roomBounds.minX + 42,
                        y: pilot.position.y)
                    precondition(lobs.allSatisfy {
                        hypot(safePoint.x - $0.target.x,
                              safePoint.y - $0.target.y) > $0.radius + 14
                    }, "The World 1 boss must leave a reachable dodge lane")
                    pilot.position = safePoint
                    combatClock.advance(
                        FrontierGuardianRules.transitionSeconds + 0.1,
                        playing: true)
                    updateHostileAttacks(delta: 0)
                    precondition(lobs.isEmpty && health == initialHealth &&
                                 guardianArmorBroken &&
                                 combatTime > guardianTransitionUntil,
                                 "Both warnings must resolve harmlessly after a dodge")
                    let vulnerableHealth = enemies[0].maxHealth / 2 - 8
                    enemies[0].health = vulnerableHealth
                    updateFrontierGuardianPhase()
                    precondition(enemies[0].health == vulnerableHealth,
                                 "The Guardian must be damageable after phase two")
                }
            } else {
                precondition(!guardianArmorBroken && lobs.isEmpty,
                             "New Guardian begins with intact armor")
            }
            let marker = SKShapeNode(rectOf: CGSize(width: 12, height: 12))
            marker.name = guardianResolved ? "guardianResolvedIdentity" :
                (guardianExposed ? "guardianExposedIdentity" :
                    "guardianArmoredIdentity")
            marker.fillColor = guardianResolved ? .green :
                (guardianExposed ? .yellow : .cyan)
            marker.strokeColor = .clear
            marker.position = CGPoint(x: size.width * 0.90, y: size.height * 0.60)
            marker.zPosition = 65
            hud.addChild(marker)
            arena.isPaused = true
            holdDefenseQAScreenshot = true
            updateHUD()
        }
        // World 1 flank warning and live arrival are separate genuine
        // simulator states, proving there is a pause before fast raiders.
        let flankWarningQA = ProcessInfo.processInfo.arguments.contains(
            "-captureFlankWarningScreenshot")
        let flankArrivalQA = ProcessInfo.processInfo.arguments.contains(
            "-captureFlankArrivalScreenshot")
        if flankWarningQA || flankArrivalQA {
            worldMapIndex = 0
            wave = 4
            gateUnlocked = true
            startWave()
            spawned = 3
            precondition(FlankSwarmRules.shouldWarn(
                world: worldMapIndex, room: wave, nextSlot: spawned + 1))
            scheduleFlankSwarm(count: 2)
            precondition(pendingFlankSwarm != nil &&
                         arena.childNode(withName: "flankSwarmWarning") != nil &&
                         arena.childNode(withName: "//flankIncomingArrow") != nil,
                         "Approaching raiders must display actual flank warnings")
            if flankArrivalQA {
                deployFlankSwarm()
                precondition(pendingFlankSwarm == nil &&
                             enemies.count == 2 &&
                             enemies.allSatisfy { $0.node.name == "flankRaider" },
                             "Two flank raiders must enter after the warning")
                for enemy in enemies {
                    enemy.node.alpha = 1
                    enemy.node.childNode(withName: "spawnWarning")?.removeFromParent()
                }
                arena.childNode(withName: "flankSwarmWarning")?.removeFromParent()
            }
            holdDefenseQAScreenshot = true
            arena.isPaused = true
            updateHUD()
        }
        // New real combat trait: an illustrated frozen raider and genuine
        // movement speed rule, not merely a mock preview card.
        if ProcessInfo.processInfo.arguments.contains("-captureFrostRoundsScreenshot") {
            worldMapIndex = 0
            wave = 7
            gateUnlocked = true
            lockedLoadout = AbilityLoadout(selected: ["frost"])
            frostLevel = 2
            startWave()
            spawned = waveTarget
            spawnEnemy(artReviewType: 2)
            guard let target = enemies.indices.first else {
                preconditionFailure("Frost QA raider missing")
            }
            enemies[target].node.position = CGPoint(
                x: roomBounds.midX + 48, y: roomBounds.midY + 75)
            applyFrost(to: target)
            enemies[target].node.alpha = 1
            enemies[target].node.childNode(withName: "spawnWarning")?.removeFromParent()
            precondition(lockedLoadout.contains("frost") &&
                         enemies[target].node.childNode(withName: "frostIndicator") != nil &&
                         (chilledUntil[ObjectIdentifier(enemies[target].node)] ?? 0) > combatTime &&
                         FrostRoundsRules.speedMultiplier(rank: frostLevel) < 1,
                         "Frost rounds must apply readable real slow debuff")
            holdDefenseQAScreenshot = true
            arena.isPaused = true
            updateHUD()
        }
        #if targetEnvironment(simulator)
        if ProcessInfo.processInfo.arguments.contains("-capturePilotDirectionsScreenshot") {
            worldMapIndex = 0
            wave = 0
            startWave()
            for name in CharacterMotion.pilotDirections {
                precondition(productionImage(named: "pilot_" + name) != nil,
                             "Missing directional pilot texture")
            }
            for direction in CharacterMotion.pilotDirections.indices {
                pilotHeading = CGFloat(direction) * .pi / 8
                pilotRenderedHeading = pilotHeading
                updatePilotPresentation(pose: CharacterMotion.pilot(
                    time: 0, moving: false, facing: 1, timeSinceShot: 2))
                precondition(pilotVisualDirection == direction)
                let sample = pilot.copy() as! SKShapeNode
                sample.position = CGPoint(
                    x: roomBounds.minX + roomBounds.width * CGFloat(direction % 4 + 1) / 5,
                    y: roomBounds.minY + roomBounds.height * CGFloat(direction / 4 + 1) / 5)
                arena.addChild(sample)
                let label = SKLabelNode(fontNamed: "AvenirNext-Bold")
                label.text = CharacterMotion.pilotDirections[direction].uppercased()
                label.fontSize = 12
                label.position = CGPoint(x: 0, y: -42)
                sample.addChild(label)
            }
            pilot.isHidden = true
            let identity = SKShapeNode(rectOf: CGSize(width: 12, height: 12))
            identity.fillColor = .blue
            identity.strokeColor = .clear
            identity.position = CGPoint(x: size.width * 0.90, y: size.height * 0.60)
            identity.zPosition = 65
            hud.addChild(identity)
            holdDefenseQAScreenshot = true
            arena.isPaused = true
            updateHUD()
        }
        #endif
        // Real SpriteKit boss integration: stage the final room and
        // confirm each world's attack behavior, health and telegraphs.
        let bossCaptureFlags = ["-captureRootLordScreenshot", "-captureToxicMatriarchScreenshot",
                                "-captureWarforgeScreenshot", "-captureFrostWraithScreenshot"]
        if let index = bossCaptureFlags.firstIndex(where: { ProcessInfo.processInfo.arguments.contains($0) }) {
            worldMapIndex = index
            wave = 19
            gateUnlocked = true
            startWave()
            spawned = waveTarget
            spawnEnemy()
            bossNode?.alpha = 1
            bossNode?.childNode(withName: "spawnWarning")?.removeFromParent()
            bossNode?.position = CGPoint(x: roomBounds.midX, y: roomBounds.midY + 75)
            pilot.position = CGPoint(x: roomBounds.midX, y: roomBounds.midY - 100)
            precondition(enemies.count == 1 && wave == 20 &&
                         enemies[0].health == selectedWorld.bossHealth &&
                         bossNode?.childNode(withName: "bossArt") != nil &&
                         zoneBanner.text == "BOSS: \(selectedWorld.boss)",
                         "Boss capture must use the production encounter and artwork")
            combatClock.advance(2.2, playing: true)
            updateRangedAttack(at: 0)
            precondition(!lobs.isEmpty || enemies[0].shotTarget != nil,
                         "Every boss must present a real combat telegraph")
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
            precondition(enterSelectedWorld() && wave == 1 &&
                         lockedLoadout.selected.isEmpty &&
                         roomHazards.contains(where: { $0.kind == .acid }) &&
                         !roomHazards.contains(where: { $0.kind == .water }),
                         "World 2 must launch with acid and distinct terrain")
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
            showReady()
            precondition(enterSelectedWorld() && wave == 1 &&
                         lockedLoadout.selected.isEmpty)
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
            precondition(worldMapIndex == 2 && wave == 1 &&
                         phase == .playing && lockedLoadout.selected.isEmpty &&
                         roomHazards.contains(where: { $0.kind == .water }) &&
                         !roomHazards.contains(where: { $0.kind == .acid }),
                         "Next world must enter Room 1 with fresh empty abilities")
            precondition(roomHazards.contains(where: { $0.kind == .water }),
                         "Iron Wastes must start with blocked water channels")
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        // Simulated active acid screenshot: exercise real phase-timed hazard
        // art and damage boundaries in the same World 3 room as the inactive
        // capture. This is a deterministic QA-only fixture, never a cheat or
        // tutorial bypass in regular gameplay.
        if ProcessInfo.processInfo.arguments.contains("-captureFourthWorldTransitionScreenshot") {
            for index in 0..<2 { _ = WorldCatalog.recordVictory(index, stars: 1) }
            worldMapIndex = 2
            showReady()
            precondition(enterSelectedWorld())
            completeWorld()
            precondition(WorldCatalog.unlocked(3) && overlayButtons["next_world"] != nil)
            advanceToNextWorld()
            precondition(worldMapIndex == 3 && wave == 1 && phase == .playing &&
                         lockedLoadout.selected.isEmpty && selectedWorld.biome == 4,
                         "World 3 victory must enter the playable Frost Expanse")
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureAcidActiveScreenshot") {
            worldMapIndex = 1
            wave = 0
            gateUnlocked = true
            startWave()
            precondition(wave == 1 && phase == .playing &&
                         roomHazards.contains(where: { $0.kind == .acid }) &&
                         acidVisualNodes.count == 2,
                         "Toxic Crossing preview must render both acid pockets")
            waveElapsed = 2.5
            updateTerrainHazards()
            precondition(displayedAcidActive == true &&
                         (acidVisualNodes[0].childNode(
                            withName: "illustratedTerrain") != nil ||
                          acidVisualNodes[0].childNode(
                            withName: "acidActiveVeins")?.isHidden == false) &&
                         TerrainHazards.acidTouches(
                            CGPoint(x: roomHazards[0].frame.midX,
                                    y: roomHazards[0].frame.midY),
                            patches: roomHazards, at: waveElapsed),
                         "Active acid must show its damaging-phase warning")
            arena.isPaused = true
            phase = .levelUp
            updateHUD()
        }
        // Deterministic real-game captures for reviewing each new biome.
        // These are the actual gameplay scenes, not concept mockups.
        // Real simulator captures for each approved World 1 landscape.
        // These exercise the same scene and authored-art lookup as gameplay.
        let worldOneCaptures: [(String, Int)] = [
            ("-captureWorldOneOutpostScreenshot", 1),
            ("-captureWorldOneSwampScreenshot", 4),
            ("-captureWorldOneCavesScreenshot", 9),
            ("-captureWorldOneBossScreenshot", 20),
            // Revisit captures exercise alternate authored floor compositions,
            // not only the first appearance of each landscape.
            ("-captureWorldOneOutpostRevisitScreenshot", 7),
            ("-captureWorldOneSwampRevisitScreenshot", 12),
            ("-captureWorldOneCavesRevisitScreenshot", 15)
        ]
        if let selection = worldOneCaptures.first(where: {
            ProcessInfo.processInfo.arguments.contains($0.0)
        }) {
            worldMapIndex = 0
            wave = selection.1 - 1
            gateUnlocked = true
            startWave()
            zoneBanner.removeAllActions()
            zoneBanner.alpha = 0
            controlsHint.removeAllActions()
            controlsHint.isHidden = true
            arena.isPaused = true
            updateHUD()
        }
        if ProcessInfo.processInfo.arguments.contains("-captureToxicTerrainScreenshot") ||
           ProcessInfo.processInfo.arguments.contains("-captureIronTerrainScreenshot") ||
           ProcessInfo.processInfo.arguments.contains("-captureFrostTerrainScreenshot") {
            let arguments = ProcessInfo.processInfo.arguments
            worldMapIndex = arguments.contains("-captureToxicTerrainScreenshot") ? 1
                : (arguments.contains("-captureIronTerrainScreenshot") ? 2 : 3)
            wave = 0
            gateUnlocked = true
            startWave()
            precondition(roomHazards.count == 3 &&
                         hazardScenery.children.count == 3,
                         "Biome screenshot must contain both pockets and rubble")
            // Keep the playable HUD visible without a level-up overlay.
            // Hide only temporary room-introduction labels so the screenshot
            // reveals the terrain and character at true gameplay scale.
            zoneBanner.removeAllActions()
            zoneBanner.alpha = 0
            controlsHint.removeAllActions()
            controlsHint.isHidden = true
            arena.isPaused = true
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
            // Recreate a stale orb from a previous encounter to prove opening
            // the normal campaign exit forcibly hides the other structure.
            extractionPortal.isHidden = false
            showZoneGate()
            precondition(!passageGate.isHidden && extractionPortal.isHidden,
                         "Normal campaign exit must never coexist with survival orb")
            // A true upright gate has a much taller silhouette than its
            // footprint, with a base at the physical entry location.
            precondition(passageGate.path?.boundingBox.height ?? 0 > 140 &&
                         passageGate.path?.boundingBox.width ?? 0 < 120 &&
                         (passageGate.path?.boundingBox.minY ?? -1) >= 0 &&
                         passageGate.childNode(withName: "campaignPortalGroundShadow") != nil &&
                         passageGate.childNode(withName: "campaignPortalRearRim") != nil,
                         "Campaign exit must render as a grounded UPRIGHT portal")
            // Keep the exit fully visible for a stable visual regression frame.
            passageGate.removeAllActions()
            passageGate.alpha = 1
            passageGate.childNode(withName: "gateArrow")?.removeAllActions()
            // Exercise the real orbit updater after combat has stopped.
            roomCleared = true
            orbitLevel = 2
            rebuildOrbitingDefenses()
            updateOrbitingDefenses()
            let firstOrbPosition = orbitalNodes[0].position
            let savedClock = clock
            clock += 0.25
            pilot.position.x += 12
            updateOrbitingDefenses()
            precondition(distance(firstOrbPosition, orbitalNodes[0].position) > 10,
                         "Energy Orbit must keep moving at the peaceful portal")
            for orb in orbitalNodes {
                precondition(abs(distance(orb.position, pilot.position) - 82) < 0.1,
                             "Energy Orbit must follow the pilot at its wider radius")
            }
            clock = savedClock
            pilot.position.x -= 12
            updateOrbitingDefenses()
        }
        // CI-only motion review: run real combat and movement instead of
        // freezing an art-review frame. This never executes in normal play.
        if ProcessInfo.processInfo.arguments.contains("-captureGameplayFrames") {
            startWave()
        }
        if previewPilotWalk {
            for facing in ["s", "n", "e", "w", "ne", "nw", "se", "sw"] {
                for frame in 0..<4 {
                    precondition(productionImage(named: "pilot_walk_\(facing)_\(frame)") != nil,
                                 "Walk review requires all authored frames")
                }
            }
            startWave()
            phase = .gate
            roomCleared = true
            passageGate.isHidden = true
            pilot.position = previewWalkStart
            let walkTarget = previewWalkTarget
            pilotHeading = atan2(walkTarget.y - pilot.position.y,
                                 walkTarget.x - pilot.position.x)
            pilotRenderedHeading = pilotHeading
            pilotAnimationTime = 0
            pilotStridePhase = 0
            let caption = SKLabelNode(fontNamed: "AvenirNext-Bold")
            let facingName: String
            if previewPilotWalkNW { facingName = "NORTHWEST" }
            else if previewPilotWalkSE { facingName = "SOUTHEAST" }
            else if previewPilotWalkSW { facingName = "SOUTHWEST" }
            else if previewPilotWalkNE { facingName = "NORTHEAST" }
            else if previewPilotWalkWest { facingName = "WEST" }
            else if previewPilotWalkEast { facingName = "EAST" }
            else if previewPilotWalkNorth { facingName = "NORTH" }
            else { facingName = "SOUTH" }
            caption.text = previewPilotLegRigSW ? "SOUTHWEST LEG RIG • SIMULATOR ONLY" : "\(facingName) WALK • SIMULATOR ONLY"
            caption.fontSize = 12
            caption.position = CGPoint(x: roomBounds.midX, y: roomBounds.minY + 30)
            caption.zPosition = 65
            hud.addChild(caption)
            let marker = SKShapeNode(rectOf: CGSize(width: 12, height: 12))
            marker.fillColor = .blue
            marker.strokeColor = .clear
            marker.position = CGPoint(x: size.width * 0.9, y: size.height * 0.6)
            marker.zPosition = 65
            hud.addChild(marker)
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
            // Exercise genuine new-run draws with zero preselected skills,
            // not the old simulator-default 3-skill loadout (3/2 slots).
            lockedLoadout = AbilityLoadout()
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
        // Render well beyond the movement boundary: otherwise the lower
        // edge creates a conspicuous straight green stripe on an iPhone.
        // Gameplay collision still uses roomBounds, not this visual rect.
        let floor = SKShapeNode(
            rect: roomBounds.insetBy(dx: -size.width, dy: -size.height))
        floor.name = "expandedArenaPreviewGround"
        floor.fillColor = SKColor(red: 0.12, green: 0.22, blue: 0.19, alpha: 1)
        floor.strokeColor = .clear
        floor.lineWidth = 0
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
        // Three open survival compositions, selected deterministically per
        // world and wave. Landmarks remain decorative and close to the edge:
        // none can obstruct movement or create invisible collision.
        let survivalLayout = (max(0, wave - 1) + worldMapIndex) % 3
        let landmarkPositions: [(CGFloat, CGFloat)]
        switch survivalLayout {
        case 0: // Ruined perimeter: asymmetric corners.
            landmarkPositions = [(0.11, 0.24), (0.88, 0.34),
                                 (0.18, 0.75), (0.84, 0.86)]
        case 1: // Staggered edges: alternate approaches remain open.
            landmarkPositions = [(0.14, 0.16), (0.83, 0.48),
                                 (0.12, 0.65), (0.87, 0.91)]
        default: // Open clearing: landmarks grouped near far corners.
            landmarkPositions = [(0.10, 0.13), (0.89, 0.16),
                                 (0.11, 0.87), (0.90, 0.89)]
        }
        for index in landmarkPositions.indices {
            let x = roomBounds.minX + roomBounds.width * landmarkPositions[index].0
            let y = roomBounds.minY + roomBounds.height * landmarkPositions[index].1
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
        passageGate.position = CGPoint(x: roomBounds.midX, y: roomBounds.maxY - 110)
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
        floorNumber.position = CGPoint(x: 27, y: size.height - 121)
        survivalClock.position = CGPoint(x: size.width / 2, y: size.height - 246)
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
        floorNumber.text = wave > 0 ? "\(wave)" : ""
        floorNumber.isHidden = wave <= 0 || phase == .ready || phase == .loadout
        let survivalActive = activeEncounter == .survival &&
            (phase == .playing || phase == .gate)
        survivalClock.isHidden = !survivalActive
        if survivalActive {
            let seconds = max(0, Int(ceil(
                SurvivalEncounterRules.duration(world: worldMapIndex, room: wave) - waveElapsed)))
            survivalClock.text = roomCleared ? "EXTRACTION READY" :
                String(format: "%02d:%02d", seconds / 60, seconds % 60)
            survivalClock.fontSize = roomCleared ? 19 : 32
            survivalClock.fontColor = seconds <= 10 ? .systemOrange : .systemYellow
        }
        pilotHealthFill.xScale = max(0.001, min(1,
            CGFloat(health) / CGFloat(max(1, maximumHealth))))
        pilotHealthFill.fillColor = health <= maximumHealth / 3 ? .systemRed : .systemGreen
        pilotHealthTrack.isHidden = phase == .ready || phase == .loadout
        let speedText = fastForward ? "2× SPEED" : "1× SPEED"
        if speedLabel.text != speedText { speedLabel.text = speedText }
        speedButton.fillColor = fastForward ? .systemOrange : .systemBlue
        speedButton.isHidden = phase != .playing && phase != .gate
        settingsShortcut.isHidden = ![Phase.ready, .worldSelect, .loadout, .playing, .gate].contains(phase)
        // Player controls sit below the compact header.
        speedButton.position = CGPoint(x: size.width - 56, y: size.height - 195)
        if phase == .ready || phase == .worldSelect {
            let homeScale = min(1, size.height / 780)
            settingsShortcut.position = CGPoint(
                x: size.width - 39, y: overlay.position.y + 255 * homeScale)
        } else if phase == .loadout {
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
        if activeEncounter == .survival && (phase == .playing || roomCleared) {
            subtitleText = "\(enemies.count) FOES  •  \(coins) COINS"
        } else if activeEncounter == .equipmentDefense && roomCleared {
            subtitleText = defenseIntegrity > 0 ? "REACTOR SECURED" : "REACTOR LOST • BONUS LOST"
        } else if activeEncounter == .equipmentDefense && !roomCleared {
            let remaining = max(0, Int(ceil(
                SurvivalEncounterRules.duration(world: worldMapIndex, room: wave) - waveElapsed)))
            subtitleText = "DEFEND \(remaining)S  •  REACTOR \(defenseIntegrity)/\(EquipmentDefenseRules.maximumIntegrity)"
        } else {
            subtitleText = "\(coins) COINS  •  \(max(0, waveTarget - spawned) + enemies.count) FOES"
        }
        if subtitle.text != subtitleText { subtitle.text = subtitleText }
        let infoText = "HP \(health)/\(maximumHealth)  •  DMG \(damage + permanentDamageBonus + gearWeaponBonus)  •  RATE \(fireRate)"
        if info.text != infoText { info.text = infoText }
        info.fontColor = health <= maximumHealth / 3 ? .systemRed : (health <= maximumHealth * 2 / 3 ? .systemYellow : .white)
    }

    private func clearOverlay() {
        speedButton.isHidden = true
        checkpointButton.isHidden = true
        overlay.setScale(1)
        overlay.removeAllChildren()
        overlayBackdrop.fillColor = SKColor(white: 0.05, alpha: 0.82)
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
        // Fit long labels inside the touch target on narrow screens.
        // This sizing is shared by headquarters, upgrades and mission menus.
        let estimatedWidth = CGFloat(label.count) * 9.1
        text.fontSize = estimatedWidth > width - 22
            ? max(11, 17 * (width - 22) / estimatedWidth) : 17
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

    private func validateHubNavigation() {
        let keys = ["nav_gear", "nav_abilities", "nav_home", "nav_pilot"]
        precondition(overlay.childNode(withName: "hubSky") != nil,
                     "Hub destinations need an opaque dedicated background")
        for key in keys {
            guard let frame = overlayButtons[key] else {
                preconditionFailure("Missing hub destination: \(key)")
            }
            let bottom = overlay.convert(CGPoint(x: frame.minX, y: frame.minY), to: self)
            let top = overlay.convert(CGPoint(x: frame.maxX, y: frame.maxY), to: self)
            precondition(bottom.x >= 0 && bottom.y >= 20 && top.x <= size.width && top.y <= size.height,
                         "Hub navigation must stay inside the visible screen")
            for (otherKey, otherFrame) in overlayButtons where otherKey != key {
                precondition(!frame.intersects(otherFrame), "Hub controls must not overlap: \(key), \(otherKey)")
            }
        }
    }

    /// Shared shell keeps every pre-run destination separate from combat.
    private func installHubShell(active: String, scale: CGFloat = 1) {
        pilot.isHidden = true
        let pageScale: CGFloat = active == "nav_home" ? 1 : min(1, size.height / 780)
        overlay.setScale(pageScale)
        let background = SKShapeNode(rect: CGRect(
            x: -overlay.position.x / pageScale, y: -overlay.position.y / pageScale,
            width: size.width / pageScale, height: size.height / pageScale))
        background.name = "hubSky"
        background.fillColor = SKColor(red: 0.20, green: 0.58, blue: 0.76, alpha: 1)
        background.strokeColor = .clear
        background.zPosition = -20
        overlay.addChild(background)
        for index in 0..<4 {
            let hill = SKShapeNode(ellipseOf: CGSize(width: size.width * 1.4,
                                                     height: size.height * 0.48))
            hill.position = CGPoint(x: CGFloat(index % 2 == 0 ? -1 : 1) * size.width * 0.32,
                                    y: -size.height * 0.36 - CGFloat(index) * 25)
            hill.fillColor = index < 2
                ? SKColor(red: 0.29, green: 0.66, blue: 0.65, alpha: 1)
                : SKColor(red: 0.19, green: 0.45, blue: 0.53, alpha: 1)
            hill.strokeColor = .clear
            hill.zPosition = -19 + CGFloat(index)
            overlay.addChild(hill)
        }
        overlayBackdrop.fillColor = SKColor(red: 0.10, green: 0.24, blue: 0.36, alpha: 1)
        let tabs = [("GEAR", "shippingbox.fill", "nav_gear"),
                    ("ABILITIES", "bolt.fill", "nav_abilities"),
                    ("HOME", "house.fill", "nav_home"),
                    ("PILOT", "person.fill", "nav_pilot")]
        let width = min((size.width - 20) / 4, 96)
        let y = -294 * scale
        for (index, tab) in tabs.enumerated() {
            let x = (CGFloat(index) - 1.5) * width
            let selected = tab.2 == active
            let rect = CGRect(x: x - width / 2 + 2, y: y - 30 * scale,
                              width: width - 4, height: 64 * scale)
            let tile = SKShapeNode(rect: rect, cornerRadius: 12)
            tile.name = "homeNav_\(tab.2)"
            tile.fillColor = selected ? SKColor(red: 1, green: 0.78, blue: 0.28, alpha: 1)
                : SKColor(red: 0.90, green: 0.96, blue: 0.98, alpha: 1)
            tile.strokeColor = selected ? .white : .clear
            tile.lineWidth = 2
            tile.zPosition = 10
            overlay.addChild(tile)
            if let image = UIImage(systemName: tab.1)?.withTintColor(
                UIColor(red: 0.12, green: 0.28, blue: 0.40, alpha: 1), renderingMode: .alwaysOriginal) {
                let icon = SKSpriteNode(texture: SKTexture(image: image))
                icon.size = CGSize(width: 24 * scale, height: 24 * scale)
                icon.position = CGPoint(x: x, y: y + 10 * scale)
                icon.zPosition = 11
                overlay.addChild(icon)
            }
            let label = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            label.text = tab.0
            label.fontColor = SKColor(red: 0.12, green: 0.28, blue: 0.40, alpha: 1)
            label.fontSize = 10 * scale
            label.position = CGPoint(x: x, y: y - 20 * scale)
            label.zPosition = 11
            overlay.addChild(label)
            overlayButtons[tab.2] = rect
        }
    }

    /// Distinct home screen: concise resources, one highlighted world and a
    /// single primary Play/Resume action. No marketing notifications or fake
    /// currencies copied from the visual navigation benchmark.
    private func showReady() {
        discardRunArmed = false
        hud.isHidden = true
        phase = .ready
        // The physical combat pilot remains underneath menu overlays and
        // looked like a second character below the dock in real screenshots.
        // Only the larger staged illustration should appear on the home.
        pilot.isHidden = true
        ArcadeMusic.shared.play(.headquarters)
        clearOverlay()
        overlayBackdrop.isHidden = true
        let scale = min(1, size.height / 780)
        installHubShell(active: "nav_home", scale: scale)
        let world = selectedWorld
        let playable = worldMapIndex < WorldCatalog.playableCount
        let unlocked = playable && WorldCatalog.unlocked(worldMapIndex)
        let saved = recovery.load()

        overlayText("OUTPOST ZERO", y: 255 * scale, fontSize: 24 * scale)
        let stripWidth = min(size.width - 30, 362)
        let strip = SKShapeNode(rect: CGRect(
            x: -stripWidth / 2, y: 185 * scale,
            width: stripWidth, height: 46 * scale), cornerRadius: 12 * scale)
        strip.name = "homeResourceBar"
        strip.fillColor = SKColor(red: 0.06, green: 0.16, blue: 0.22, alpha: 0.95)
        strip.strokeColor = .systemTeal.withAlphaComponent(0.7)
        strip.lineWidth = 1.2
        strip.zPosition = 1
        overlay.addChild(strip)
        overlayText("\(permanent.salvage) SALVAGE    •    \(availableCores) CORES",
                    y: 199 * scale, fontSize: 12 * scale)
        overlayText(unlocked ? "WORLD \(worldMapIndex + 1)  •  \(world.title)" : "WORLD \(worldMapIndex + 1)  •  UNKNOWN",
                    y: 151 * scale, fontSize: 17 * scale)
        overlayText(unlocked
            ? "\(String(repeating: "★", count: WorldCatalog.stars(worldMapIndex)))\(String(repeating: "☆", count: 3 - WorldCatalog.stars(worldMapIndex)))   •   BEST ROOM \(WorldCatalog.bestRoom(worldMapIndex))/20"
            : (playable ? "LOCKED  •  EARN 1 STAR IN PREVIOUS WORLD" : "UNKNOWN  •  EXPLORE LATER"),
            y: 127 * scale, fontSize: 11 * scale)

        let stageWidth = min(size.width - 36, 352)
        let stage = SKShapeNode(rect: CGRect(
            x: -stageWidth / 2, y: -120 * scale,
            width: stageWidth, height: 230 * scale),
            cornerRadius: 20 * scale)
        stage.name = "homeWorldPreview"
        stage.fillColor = !unlocked ? SKColor(red: 0.13, green: 0.17, blue: 0.23, alpha: 1) : worldMapIndex == 0
            ? SKColor(red: 0.29, green: 0.66, blue: 0.40, alpha: 1)
            : (worldMapIndex == 1
                ? SKColor(red: 0.24, green: 0.61, blue: 0.78, alpha: 1)
                : SKColor(red: 0.48, green: 0.55, blue: 0.36, alpha: 1))
        stage.strokeColor = .systemTeal.withAlphaComponent(0.72)
        stage.lineWidth = 2
        overlay.addChild(stage)
        let island = SKShapeNode(ellipseOf: CGSize(width: stageWidth * 0.8,
                                                    height: 59 * scale))
        island.position = CGPoint(x: 0, y: -78 * scale)
        island.fillColor = unlocked ? SKColor(red: 0.26, green: 0.42, blue: 0.32, alpha: 1) : SKColor(red: 0.18, green: 0.22, blue: 0.27, alpha: 1)
        island.strokeColor = unlocked ? .systemTeal.withAlphaComponent(0.72) : .gray.withAlphaComponent(0.5)
        island.lineWidth = 2
        island.zPosition = 0.5
        overlay.addChild(island)
        if unlocked && worldMapIndex == 0 {
        for (i, horizontal) in [CGFloat(-0.38), -0.25, 0.28, 0.4].enumerated() {
            let tree = SKSpriteNode(texture: productionTexture(
                named: i.isMultiple(of: 2) ? "forest_pine" : "forest_broadleaf",
                fallback: forestPineTexture))
            tree.size = CGSize(width: 88 * scale, height: 88 * scale)
            tree.position = CGPoint(x: stageWidth * horizontal,
                                    y: CGFloat(-21 + (i % 2) * 13) * scale)
            tree.zPosition = 1
            overlay.addChild(tree)
        }
        }
        if unlocked && worldMapIndex > 0 {
            // Industrial destination models replace forest trees in later worlds.
            for (index, horizontal) in [CGFloat(-0.36), -0.20, 0.29, 0.39].enumerated() {
                let height = CGFloat(35 + index % 2 * 25) * scale
                let tower = SKShapeNode(rectOf: CGSize(width: 33 * scale, height: height), cornerRadius: 5)
                tower.position = CGPoint(x: stageWidth * horizontal, y: -50 * scale + height / 2)
                tower.fillColor = selectedWorld.biome == 1
                    ? SKColor(red: 0.38, green: 0.49, blue: 0.57, alpha: 1)
                    : SKColor(red: 0.46, green: 0.39, blue: 0.52, alpha: 1)
                if selectedWorld.biome == 4 { tower.fillColor = .systemCyan }
                tower.strokeColor = SKColor.white.withAlphaComponent(0.55)
                tower.zPosition = 1
                overlay.addChild(tower)
                let light = SKShapeNode(rectOf: CGSize(width: 20 * scale, height: 6 * scale), cornerRadius: 2)
                light.position.y = height * 0.24
                light.fillColor = selectedWorld.biome == 1 ? .systemCyan : .systemGreen
                light.strokeColor = .clear
                tower.addChild(light)
            }
            let channel = SKShapeNode(ellipseOf: CGSize(width: stageWidth * 0.64, height: 23 * scale))
            channel.position = CGPoint(x: 0, y: -76 * scale)
            channel.fillColor = selectedWorld.biome == 1 ? .systemCyan : .systemGreen
            channel.strokeColor = .white.withAlphaComponent(0.6)
            channel.zPosition = 0.8
            overlay.addChild(channel)
        }
        if !unlocked {
            for index in 0..<6 {
                let cloud = SKShapeNode(ellipseOf: CGSize(width: CGFloat(100 + index % 3 * 34) * scale,
                                                            height: CGFloat(38 + index % 2 * 19) * scale))
                cloud.name = "homeUnknownCloud"
                cloud.position = CGPoint(x: CGFloat((index % 3 - 1) * 92) * scale,
                                         y: CGFloat(-74 + index / 3 * 76) * scale)
                cloud.fillColor = SKColor(red: 0.39, green: 0.46, blue: 0.53, alpha: 0.97)
                cloud.strokeColor = .white.withAlphaComponent(0.12)
                cloud.zPosition = 5
                overlay.addChild(cloud)
            }
        }
        if unlocked {
        // The same upright ring language as our campaign exit, never a
        // rectangular gate or a floor circle.
        let portal = SKShapeNode(ellipseOf: CGSize(width: 96 * scale,
                                                    height: 138 * scale))
        portal.name = "homeUprightPortal"
        portal.position = CGPoint(x: 0, y: -4 * scale)
        portal.fillColor = SKColor(red: 0.035, green: 0.29,
                                   blue: 0.59, alpha: 1)
        portal.strokeColor = SKColor(red: 0.53, green: 0.81,
                                     blue: 0.85, alpha: 1)
        portal.lineWidth = 9 * scale
        portal.glowWidth = 3
        portal.zPosition = 2
        overlay.addChild(portal)
        let energy = SKShapeNode(ellipseOf: CGSize(width: 70 * scale,
                                                    height: 113 * scale))
        energy.fillColor = SKColor(red: 0.07, green: 0.52,
                                   blue: 0.83, alpha: 1)
        energy.strokeColor = .systemCyan
        energy.lineWidth = 2.2
        energy.zPosition = 1
        portal.addChild(energy)
        // Four curved, translucent currents create a liquid-energy surface,
        // without flattening the ring or obscuring the pilot's silhouette.
        for index in 0..<4 {
            let offset = CGFloat(index) * 17 * scale
            let path = CGMutablePath()
            path.move(to: CGPoint(x: -19 * scale, y: -43 * scale + offset))
            path.addCurve(
                to: CGPoint(x: 18 * scale, y: -23 * scale + offset),
                control1: CGPoint(x: 25 * scale, y: -37 * scale + offset),
                control2: CGPoint(x: -23 * scale, y: -20 * scale + offset))
            let current = SKShapeNode(path: path)
            current.name = "homePortalCurrent"
            current.strokeColor = index.isMultiple(of: 2)
                ? SKColor(red: 0.66, green: 0.93, blue: 1, alpha: 0.77)
                : SKColor(red: 0.13, green: 0.37, blue: 0.94, alpha: 0.86)
            current.lineWidth = 3.2 * scale
            current.lineCap = .round
            current.glowWidth = 1.8
            current.zPosition = 2
            energy.addChild(current)
            current.run(.repeatForever(.sequence([
                .fadeAlpha(to: 0.38, duration: 0.6 + Double(index) * 0.11),
                .fadeAlpha(to: 0.94, duration: 0.7 + Double(index) * 0.10)
            ])))
        }
        let pilotPreview = SKSpriteNode(texture: pilotDirectionalTextures[10])
        pilotPreview.name = "homePilotPreview"
        pilotPreview.size = CGSize(width: 69 * scale, height: 69 * scale)
        pilotPreview.position = CGPoint(x: 67 * scale, y: -67 * scale)
        pilotPreview.zPosition = 3
        overlay.addChild(pilotPreview)
        }
        // The region label belongs in the open sky, not across the green
        // oval platform outline at the bottom of the world preview.
        overlayText(unlocked ? world.region.uppercased() : "UNEXPLORED",
                    y: 88 * scale, fontSize: 11 * scale)

        if let saved {
            actionButton("RESUME WORLD \(saved.worldIndex + 1) • ROOM \(saved.room)", key: "recover_run",
                         y: -187 * scale, tint: .systemOrange)
        } else {
            actionButton(unlocked ? "PLAY" : "WORLD LOCKED",
                         key: "start", y: -187 * scale, tint: .systemOrange,
                         enabled: unlocked)
        }
        for (direction, key, enabled) in [(-1, "world_prev", worldMapIndex > 0),
                                           (1, "world_next", worldMapIndex < WorldCatalog.worlds.count - 1)] {
            let x = CGFloat(direction) * (stageWidth / 2 - 23)
            let rect = CGRect(x: x - 22, y: -28 * scale, width: 44, height: 56 * scale)
            let arrow = SKShapeNode(rect: rect, cornerRadius: 12)
            arrow.fillColor = SKColor(red: 0.10, green: 0.26, blue: 0.39, alpha: enabled ? 0.90 : 0.30)
            arrow.strokeColor = .clear
            arrow.zPosition = 7
            overlay.addChild(arrow)
            let label = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            label.text = direction < 0 ? "‹" : "›"
            label.fontSize = 32 * scale
            label.fontColor = .white.withAlphaComponent(enabled ? 1 : 0.3)
            label.verticalAlignmentMode = .center
            label.position = CGPoint(x: x, y: 0)
            label.zPosition = 8
            overlay.addChild(label)
            if enabled { overlayButtons[key] = rect }
        }
        overlayText("SWIPE LEFT OR RIGHT TO EXPLORE WORLDS",
                    y: -233 * scale, fontSize: 10 * scale)
        updateHUD()
    }

    private func showWorldSelector() {
        showReady()
        phase = .worldSelect
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
        previewPilotWalk || ProcessInfo.processInfo.arguments.contains { $0.hasPrefix("-capture") }
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
            timedEncounterElapsed: activeEncounter.isTimed
                ? min(waveElapsed, SurvivalEncounterRules.duration(
                    world: worldMapIndex, room: wave)) : nil,
            timedEncounterSpawned: activeEncounter.isTimed ? spawned : nil,
            timedEncounterLiving: activeEncounter.isTimed ? enemies.count : nil,
            defenseObjectiveIntegrity: activeEncounter == .equipmentDefense
                ? defenseIntegrity : nil,
            frostLevel: frostLevel,
            mobilityRank: mobilityRank, energyWheelEvolved: energyWheelEvolved)
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
        frostLevel = snapshot.frostLevel ?? 0
        mobilityRank = snapshot.mobilityRank ?? 0
        orbitLevel = snapshot.orbitLevel
        salvageBankedThisRun = snapshot.earnedSalvage
        wave = snapshot.room - 1
        gateUnlocked = true
        startWave()
        checkpointUsed = snapshot.checkpointUsed
        checkpointPresented = snapshot.checkpointPresented
        roomSalvageRecoveredCredit = snapshot.roomSalvageCredit
        roomSalvageEarned = 0
        // Modern survival recovery recreates only the *living* foes. Their
        // previous kills already remain in snapshot.coins/progress, and no
        // defeated enemy is recreated. Never withhold the next legitimate
        // kill reward behind credits for absent enemies. Older tactical and
        // legacy full-room replay snapshots retain anti-duplication credits.
        let onlyLivingFoesRestored = activeEncounter.isTimed &&
            snapshot.timedEncounterLiving != nil
        roomCoinsRecoveredCredit = RunRecoveryStore.recoveredKillCredit(
            previouslyCredited: snapshot.roomCoinCredit,
            restoredOnlyLivingEnemies: onlyLivingFoesRestored)
        roomCoinsEarned = 0
        roomXPRecoveredCredit = RunRecoveryStore.recoveredKillCredit(
            previouslyCredited: snapshot.roomXPCredit,
            restoredOnlyLivingEnemies: onlyLivingFoesRestored)
        roomXPEarned = 0
        // Optional schema-4 clock: old TestFlight runs still load.
        if activeEncounter.isTimed {
            waveElapsed = min(snapshot.timedEncounterElapsed ?? 0,
                              SurvivalEncounterRules.duration(
                                  world: worldMapIndex, room: wave))
            // A snapshot written after timeout but before portal completion
            // can still be .battle. Do not suppress its completion trigger:
            // the first resumed combat frame must open extraction.
            survivalSpawnPhaseFinished = activeEncounter == .survival &&
                snapshot.location == .clearedGate &&
                SurvivalEncounterRules.extractionActive(
                    world: worldMapIndex, room: wave, elapsed: waveElapsed)
            if activeEncounter == .equipmentDefense {
                defenseIntegrity = snapshot.defenseObjectiveIntegrity ??
                    EquipmentDefenseRules.maximumIntegrity
                updateDefenseDeviceDisplay()
            }
            // No refill on resume. Only the still-living swarm is rebuilt;
            // previously defeated foes cannot be killed or rewarded again.
            if let savedLiving = snapshot.timedEncounterLiving {
                spawned = snapshot.timedEncounterSpawned ?? savedLiving
                for index in 0..<savedLiving {
                    let slot = max(1, spawned - savedLiving + index + 1)
                    spawnEnemy(artReviewType: SurvivalEncounterRules.swarmType(
                        room: wave, slot: slot))
                }
            }
        }
        rebuildOrbitingDefenses()
        if snapshot.energyWheelEvolved == true {
            // RunSnapshot.isValid has already verified this earned evolution.
            _ = activateEnergyWheel(masteryLevel: playerMastery.level,
                                    world: worldMapIndex + 1,
                                    synergyRank: min(chainLevel, orbitLevel),
                                    restoringSavedEvolution: true)
        }
        if snapshot.location == .clearedGate {
            roomCleared = true
            spawned = waveTarget
            if wave < worldWaveCount { showZoneGate() }
        }
        isRestoringRun = false
        if activeEncounter == .equipmentDefense && defenseIntegrity == 0 && !roomCleared {
            // A zero-integrity battle snapshot must resolve to a traversable
            // gate, including interruption during the final objective hit.
            completeWave()
            return
        }
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

    private func switchPilotProfile() {
        // Preserve the complete original progression in a separate local slot.
        // The snapshot uses property-list compatible values already in UserDefaults.
        let defaults = UserDefaults.standard
        let fresh = defaults.bool(forKey: "ozFreshPilotActive")
        let keys = defaults.dictionaryRepresentation().keys.filter {
            $0.hasPrefix("outpost") || $0.hasPrefix("frontierForest") ||
            $0.hasPrefix("coreBranch_") || $0 == "powerCoresAvailable" ||
            $0 == "bestWave"
        }
        let current = Dictionary(uniqueKeysWithValues: keys.compactMap { key -> (String, Any)? in
            guard let value = defaults.object(forKey: key) else { return nil }
            return (key, value)
        })
        let slot = fresh ? "ozFreshPilotSnapshot" : "ozOriginalPilotSnapshot"
        defaults.set(current, forKey: slot)
        for key in keys { defaults.removeObject(forKey: key) }
        let destination = fresh ? "ozOriginalPilotSnapshot" : "ozFreshPilotSnapshot"
        if let saved = defaults.dictionary(forKey: destination) {
            for (key, value) in saved { defaults.set(value, forKey: key) }
        }
        defaults.set(!fresh, forKey: "ozFreshPilotActive")
        // Each profile keeps its own recoverable run in its saved slot.
        profileSwitchArmed = false
        restart()
        worldMapIndex = 0
        showHeadquarters()
    }

    private func showHeadquarters() {
        phase = .headquarters
        hud.isHidden = true
        pilot.isHidden = true
        ArcadeMusic.shared.play(.headquarters)
        clearOverlay()
        installHubShell(active: "nav_pilot")
        overlayText("PILOT", y: 162, fontSize: 26)
        overlayText("\(availableCores) POWER CORES", y: 128, fontSize: 14)
        let portrait = SKSpriteNode(texture: pilotDirectionalTextures[10])
        portrait.name = "hubPilotPortrait"
        portrait.size = CGSize(width: 132, height: 132)
        portrait.position = CGPoint(x: 0, y: 39)
        portrait.zPosition = 3
        overlay.addChild(portrait)
        actionButton("RESTORATION & SPECIALIZATION", key: "restore", y: -72, tint: .systemIndigo)
        let fresh = UserDefaults.standard.bool(forKey: "ozFreshPilotActive")
        if profileSwitchArmed {
            overlayText("SAVE CURRENT PROGRESS AND SWITCH?", y: -123, fontSize: 10)
            actionButton("CONFIRM PILOT SWITCH", key: "confirm_pilot_switch", y: -164, tint: .systemRed)
            actionButton("CANCEL", key: "cancel_pilot_switch", y: -218, tint: .systemBlue)
        } else {
            actionButton(fresh ? "RETURN TO ORIGINAL PILOT" : "START FRESH PILOT",
                         key: "switch_pilot", y: -143, tint: .systemOrange)
            actionButton("BACK TO HOME", key: "hq_back", y: -201, tint: .systemBlue)
        }
        updateHUD()
    }

    private func showGearBay() {
        discardRunArmed = false
        phase = .gearBay
        hud.isHidden = true
        clearOverlay()
        installHubShell(active: "nav_gear")
        overlayText("GEAR BAY", y: 162, fontSize: 24)
        overlayText("\(permanent.salvage) SALVAGE AVAILABLE", y: 128, fontSize: 14)
        overlayText("EQUIPMENT STAYS UPGRADED AFTER DEFEAT", y: 104, fontSize: 11)
        let labels = ["WEAPON", "ARMOR", "REACTOR"]
        for (index, id) in PersistentProgression.gear.enumerated() {
            let level = permanent.rank(id)
            let price = permanent.cost(id)
            let label = level == PersistentProgression.maximumRank ? "\(labels[index])  LV \(level)  •  MAX" :
                "\(labels[index])  LV \(level)  \(PersistentProgression.rarity(at: level))  •  \(price) SALVAGE"
            actionButton(label, key: "buy_\(id)", y: CGFloat(50 - index * 63),
                         tint: index == 0 ? .systemOrange : (index == 1 ? .systemTeal : .systemIndigo),
                         enabled: level < PersistentProgression.maximumRank && permanent.salvage >= price)
        }
        overlayText("WEAPON: +1/RANK TO 5, THEN +1/3 RANKS", y: -133, fontSize: 10)
        overlayText("ARMOR: +15 HP TO RANK 5, THEN +5 HP/RANK", y: -155, fontSize: 10)
        actionButton("BACK TO HOME", key: "hq_back", y: -209, tint: .systemBlue)
        updateHUD()
    }

    private func showAbilityLab() {
        discardRunArmed = false
        phase = .abilityLab
        hud.isHidden = true
        clearOverlay()
        installHubShell(active: "nav_abilities")
        overlayText("ABILITY LAB", y: 159, fontSize: 24)
        overlayText("\(permanent.salvage) SALVAGE AVAILABLE", y: 125, fontSize: 14)
        overlayText("MASTERY BOOSTS ABILITIES YOU DISCOVER", y: 101, fontSize: 11)
        let labels = ["CHAIN LIGHTNING", "EXPLOSIVES", "INCENDIARY", "ORBITAL BLADES"]
        for (index, id) in PersistentProgression.abilities.enumerated() {
            let level = permanent.rank(id)
            let price = permanent.cost(id)
            let label = level == PersistentProgression.maximumRank ? "\(labels[index])  LV \(level) MAX" :
                "\(labels[index])  LV \(level)  \(PersistentProgression.rarity(at: level))  •  \(price)"
            actionButton(label, key: "buy_\(id)", y: CGFloat(61 - index * 56),
                         tint: index.isMultiple(of: 2) ? .systemTeal : .systemIndigo,
                         enabled: level < PersistentProgression.maximumRank && permanent.salvage >= price)
        }
        overlayText("DISCOVER ABILITIES DURING EACH RUN", y: -158, fontSize: 11)
        actionButton("BACK TO HOME", key: "hq_back", y: -209, tint: .systemBlue)
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
        installHubShell(active: "nav_abilities")
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
            endRunConfirmationVisible = false
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
        let activeRun = settingsReturnPhase == .playing || settingsReturnPhase == .gate
        if endRunConfirmationVisible && activeRun {
            overlayText("END THIS RUN?", y: -73, fontSize: 17)
            overlayText("BANKED SALVAGE IS SAFE", y: -100, fontSize: 11)
            actionButton("CONFIRM END RUN", key: "confirm_end_run", y: -144, tint: .systemRed)
            actionButton("CANCEL", key: "cancel_end_run", y: -202, tint: .systemBlue)
        } else {
            overlayText("PREFERENCES SAVED AUTOMATICALLY", y: -83, fontSize: 11)
            if activeRun {
                actionButton("END RUN", key: "end_run", y: -137, tint: .systemRed)
            }
            actionButton(activeRun ? "RESUME GAME" : "BACK",
                         key: "close_settings", y: activeRun ? -203 : -143, tint: .systemBlue)
        }
        updateHUD()
    }

    private func confirmEndRun() {
        guard phase == .settings, endRunConfirmationVisible,
              settingsReturnPhase == .playing || settingsReturnPhase == .gate else { return }
        // Rewards are credited to permanent progression when earned.
        // Do not bank them again here. Remove the recovery snapshot so an
        // abandoned run cannot be resumed and credited a second time.
        recovery.clear()
        endRunConfirmationVisible = false
        restart()
        showHeadquarters()
    }

    private func closeSettings() {
        endRunConfirmationVisible = false
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
        guard phase == .ready || phase == .worldSelect,
              WorldCatalog.unlocked(worldMapIndex),
              worldMapIndex < WorldCatalog.playableCount,
              recovery.load() == nil else { return false }
        lockedLoadout = AbilityLoadout()
        draftLoadout = AbilityLoadout()
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
        for (hazardIndex, patch) in roomHazards.enumerated() {
            // Shared polygon outline drives both visuals and physical
            // slowdown/damage. Only solid rubble retains the block silhouette.
            let shape = SKShapeNode(path: patch.outlinePath())
            shape.name = "terrain_\(patch.kind.rawValue)"
            shape.position = CGPoint(x: patch.frame.midX, y: patch.frame.midY)
            shape.lineWidth = 1.65
            shape.zPosition = 0
            switch patch.kind {
            case .water:
                shape.fillColor = SKColor(red: 0.035, green: 0.17, blue: 0.25, alpha: 0.96)
                shape.strokeColor = SKColor(red: 0.36, green: 0.66, blue: 0.72, alpha: 0.43)
                decorateLiquidHazard(shape, kind: .water, size: patch.frame.size)
            case .acid:
                shape.fillColor = SKColor(red: 0.10, green: 0.25, blue: 0.07, alpha: 0.96)
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
            // Prefer authored transparent terrain illustrations when bundled.
            // They are presentation-only: the exact polygon above remains the
            // authoritative collision and damage boundary.
            if patch.kind != .rubble {
                let material = patch.kind == .acid ? "acid" : "water"
                let biome = worldMapIndex == 1 ? "toxic"
                    : (worldMapIndex == 2 ? "industrial" : "frost")
                let assetName = "terrain_\(biome)_\(material)_\(hazardIndex)"
                if let illustration = productionImage(named: assetName) {
                    let texture = SKTexture(image: illustration)
                    texture.filteringMode = .linear
                    let art = SKSpriteNode(texture: texture)
                    art.name = "illustratedTerrain"
                    art.size = CGSize(width: patch.frame.width * 1.14,
                                      height: patch.frame.height * 1.22)
                    art.position = CGPoint(x: 0, y: -patch.frame.height * 0.025)
                    art.zPosition = 0.9
                    shape.addChild(art)
                    // Avoid doubling up the placeholder rockwork and veins
                    // underneath a finished transparent terrain illustration.
                    for child in shape.children where child !== art {
                        child.isHidden = true
                    }
                    shape.fillColor = .clear
                    shape.strokeColor = .clear
                }
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

        // Recess the pool below the walkable floor. The offset dark shelf and
        // inner bevel create an isometric sidewall without changing the
        // collision polygon or covering combat telegraphs.
        let recessedWall = SKShapeNode(path: bankPath)
        recessedWall.name = "recessedTerrainSidewall"
        recessedWall.position = CGPoint(x: 0, y: -3.5)
        recessedWall.fillColor = .clear
        recessedWall.strokeColor = acid
            ? SKColor(red: 0.12, green: 0.17, blue: 0.08, alpha: 0.86)
            : SKColor(red: 0.06, green: 0.17, blue: 0.21, alpha: 0.83)
        recessedWall.lineWidth = 6.5
        recessedWall.zPosition = -0.25
        pool.addChild(recessedWall)

        // A dark inset shelf reads as the vertical cut beneath the rim,
        // rather than a second flat outline on the arena floor.
        let innerShelf = SKShapeNode(path: bankPath)
        innerShelf.name = "terrainInnerShelf"
        innerShelf.setScale(0.94)
        innerShelf.position = CGPoint(x: 0, y: -1.8)
        innerShelf.fillColor = .clear
        innerShelf.strokeColor = acid
            ? SKColor(red: 0.10, green: 0.20, blue: 0.07, alpha: 0.80)
            : SKColor(red: 0.04, green: 0.19, blue: 0.25, alpha: 0.76)
        innerShelf.lineWidth = 4
        innerShelf.zPosition = 0.08
        pool.addChild(innerShelf)

        let illuminatedRim = SKShapeNode(path: bankPath)
        illuminatedRim.name = "terrainCutEdge"
        illuminatedRim.position = CGPoint(x: 0, y: 1.6)
        illuminatedRim.fillColor = .clear
        illuminatedRim.strokeColor = acid
            ? SKColor(red: 0.56, green: 0.52, blue: 0.22, alpha: 0.58)
            : SKColor(red: 0.40, green: 0.57, blue: 0.58, alpha: 0.50)
        illuminatedRim.lineWidth = 2.3
        illuminatedRim.zPosition = 0.12
        pool.addChild(illuminatedRim)

        // Small detached pools need fewer shoreline slabs: eight full-sized
        // slabs overwhelm a pocket and conceal the liquid surface.
        let compactPocket = min(w, h) < 75
        let slabCount = compactPocket ? 5 : 8
        // Directional terrain masonry: raised top faces and shaded sides.
        for index in 0..<slabCount {
            let angle = CGFloat(index) * (2 * .pi / CGFloat(slabCount))
                + (acid ? 0.18 : 0.04)
            let x = cos(angle) * w * 0.43
            let y = sin(angle) * h * 0.43
            let slabWidth = max(7, min(w, h) * (index.isMultiple(of: 3) ? 0.19 : 0.14))
            let slabHeight = max(4, slabWidth * 0.40)
            let topPath = CGMutablePath()
            topPath.move(to: CGPoint(x: -slabWidth * 0.55, y: 0))
            topPath.addLine(to: CGPoint(x: -slabWidth * 0.26, y: slabHeight * 0.65))
            topPath.addLine(to: CGPoint(x: slabWidth * 0.36, y: slabHeight * 0.55))
            topPath.addLine(to: CGPoint(x: slabWidth * 0.54, y: -slabHeight * 0.12))
            topPath.addLine(to: CGPoint(x: slabWidth * 0.12, y: -slabHeight * 0.42))
            topPath.closeSubpath()
            let shadow = SKShapeNode(path: topPath)
            shadow.position = CGPoint(x: x + 2.4, y: y - 5.5)
            shadow.fillColor = SKColor(white: 0.04, alpha: 0.54)
            shadow.strokeColor = .clear
            shadow.zPosition = 0.42
            pool.addChild(shadow)
            let side = SKShapeNode(path: topPath)
            side.position = CGPoint(x: x, y: y - 3.2)
            side.fillColor = acid
                ? SKColor(red: 0.19, green: 0.20, blue: 0.11, alpha: 1)
                : SKColor(red: 0.13, green: 0.24, blue: 0.27, alpha: 1)
            side.strokeColor = .clear
            side.zPosition = 0.43
            pool.addChild(side)
            let top = SKShapeNode(path: topPath)
            top.position = CGPoint(x: x, y: y + 1.4)
            top.fillColor = acid
                ? SKColor(red: 0.42 + CGFloat(index % 3) * 0.035,
                          green: 0.39, blue: 0.25, alpha: 1)
                : SKColor(red: 0.35, green: 0.46 + CGFloat(index % 3) * 0.025,
                          blue: 0.45, alpha: 1)
            top.strokeColor = SKColor(white: 0.80, alpha: 0.20)
            top.lineWidth = 0.8
            top.zPosition = 0.44
            pool.addChild(top)
        }

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
        let maritime = selectedWorld.biome == 1
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
                // Illustrated pools must remain transparent above their
                // authored texture when the hazard toggles on/off.
                if let illustration = shape.childNode(withName: "illustratedTerrain")
                    as? SKSpriteNode {
                    shape.fillColor = .clear
                    shape.strokeColor = .clear
                    shape.glowWidth = 0
                    illustration.color = acidOn
                        ? SKColor(red: 0.72, green: 1.0, blue: 0.62, alpha: 1)
                        : .white
                    illustration.colorBlendFactor = acidOn ? 0.22 : 0
                    continue
                }
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

    private var reactorMovementPatch: TerrainHazards.Patch?

    private func resolvePilotMovement(from current: CGPoint, to target: CGPoint) -> CGPoint {
        var patches = roomHazards
        if defenseDevice.parent === arena, let footprint = reactorMovementPatch {
            patches.append(footprint)
            // Old saves allowed standing inside the reactor. Recover to the
            // nearest clear edge before applying ordinary swept movement.
            if footprint.contains(current, margin: 12) {
                let edge = footprint.frame.insetBy(dx: -13, dy: -13)
                let exits = [CGPoint(x: edge.minX, y: current.y),
                             CGPoint(x: edge.maxX, y: current.y),
                             CGPoint(x: current.x, y: edge.minY),
                             CGPoint(x: current.x, y: edge.maxY)]
                if let exit = exits.filter({ roomBounds.contains($0) &&
                    !TerrainHazards.blocksMovement($0, patches: patches, radius: 12)
                }).min(by: { distance($0, current) < distance($1, current) }) {
                    return exit
                }
            }
        }
        return TerrainHazards.resolveMovement(from: current, to: target,
                                               patches: patches, radius: 12)
    }

    private func updateReactorOcclusion() {
        guard defenseDevice.parent === arena else { return }
        // Feet are 27 points below the pilot origin; the reactor base is -37.
        let behind = pilot.position.y - 27 > defenseDevice.position.y - 37
        defenseDevice.zPosition = behind ? 10 : 8
        let overlaps = abs(pilot.position.x - defenseDevice.position.x) < 65 &&
            pilot.position.y < defenseDevice.position.y + 65
        defenseDevice.alpha = behind && overlaps ? 0.55 : 1
    }

    private func installDefenseDevice() {
        // A readable field-power reactor, not a flat blue prototype tile.
        // All parts are visual children of the unchanged objective hit target.
        let desired = CGPoint(x: roomBounds.midX,
                              y: roomBounds.midY + roomBounds.height * 0.08)
        defenseDevice.position = TerrainHazards.extractionPosition(
            near: desired, in: roomBounds, patches: roomHazards)
        // Collision in pilot-origin coordinates: the visible feet sit at -27.
        // Only the grounded base blocks walking, not the tall illustration.
        reactorMovementPatch = TerrainHazards.Patch(kind: .rubble,
            frame: CGRect(x: defenseDevice.position.x - 48,
                          y: defenseDevice.position.y - 24,
                          width: 96, height: 28), outline: [])
        defenseDevice.name = "fieldReactorDefenseObjective"
        defenseDevice.fillColor = .clear
        defenseDevice.strokeColor = .clear
        defenseDevice.lineWidth = 0
        defenseDevice.zPosition = 8
        defenseDevice.removeAllChildren()

        let shadow = SKShapeNode(ellipseOf: CGSize(width: 110, height: 27))
        shadow.name = "reactorGroundContact"
        shadow.position = CGPoint(x: 6, y: -46)
        shadow.fillColor = .black.withAlphaComponent(0.50)
        shadow.strokeColor = .clear
        shadow.zPosition = -2
        defenseDevice.addChild(shadow)

        let footplate = SKShapeNode(rectOf: CGSize(width: 96, height: 23), cornerRadius: 7)
        footplate.position.y = -37
        footplate.fillColor = SKColor(red: 0.17, green: 0.26, blue: 0.29, alpha: 1)
        footplate.strokeColor = SKColor(red: 0.41, green: 0.59, blue: 0.63, alpha: 1)
        footplate.lineWidth = 2
        footplate.zPosition = -1
        defenseDevice.addChild(footplate)

        let chassis = SKShapeNode(rectOf: CGSize(width: 67, height: 77), cornerRadius: 12)
        chassis.name = "reactorArmorChassis"
        chassis.fillColor = SKColor(red: 0.13, green: 0.20, blue: 0.25, alpha: 1)
        chassis.strokeColor = SKColor(red: 0.40, green: 0.57, blue: 0.62, alpha: 1)
        chassis.lineWidth = 3
        chassis.zPosition = 1
        defenseDevice.addChild(chassis)

        let upperCap = SKShapeNode(rectOf: CGSize(width: 53, height: 12), cornerRadius: 4)
        upperCap.position = CGPoint(x: 0, y: 30)
        upperCap.fillColor = SKColor(red: 0.50, green: 0.66, blue: 0.69, alpha: 1)
        upperCap.strokeColor = .clear
        upperCap.zPosition = 2
        defenseDevice.addChild(upperCap)

        for side: CGFloat in [-1, 1] {
            let armor = SKShapeNode(rectOf: CGSize(width: 16, height: 61), cornerRadius: 4)
            armor.position = CGPoint(x: side * 34, y: -4)
            armor.zRotation = side * 0.08
            armor.fillColor = SKColor(red: 0.28, green: 0.39, blue: 0.44, alpha: 1)
            armor.strokeColor = SKColor(red: 0.52, green: 0.64, blue: 0.66, alpha: 1)
            armor.lineWidth = 1.5
            armor.zPosition = 3
            defenseDevice.addChild(armor)

            for index in 0..<3 {
                let vent = SKShapeNode(rectOf: CGSize(width: 8, height: 3), cornerRadius: 1)
                vent.position = CGPoint(x: side * 34, y: CGFloat(index * 11) - 17)
                vent.fillColor = SKColor(red: 0.05, green: 0.12, blue: 0.16, alpha: 1)
                vent.strokeColor = .clear
                vent.zPosition = 4
                defenseDevice.addChild(vent)
            }
            let bolt = SKShapeNode(circleOfRadius: 3)
            bolt.position = CGPoint(x: side * 28, y: 31)
            bolt.fillColor = .systemYellow
            bolt.strokeColor = .black
            bolt.lineWidth = 1
            bolt.zPosition = 5
            defenseDevice.addChild(bolt)
        }

        let socket = SKShapeNode(circleOfRadius: 24)
        socket.fillColor = SKColor(red: 0.025, green: 0.10, blue: 0.16, alpha: 1)
        socket.strokeColor = SKColor(red: 0.45, green: 0.75, blue: 0.80, alpha: 1)
        socket.lineWidth = 4
        socket.zPosition = 4
        defenseDevice.addChild(socket)

        let housingImage = productionImage(named: "field_reactor_polished")
        if let image = housingImage {
            // Keep the old chassis as a fallback, but render the authored
            // housing as one proportional image in the same depth band.
            for child in defenseDevice.children where child !== shadow {
                child.isHidden = true
            }
            let housing = SKSpriteNode(texture: SKTexture(image: image))
            housing.name = "fieldReactorHousingArt"
            housing.size = CGSize(width: 112, height: 112)
            // Visible base meets the existing grounded movement footprint.
            housing.position.y = -8
            housing.zPosition = 4
            defenseDevice.addChild(housing)
        }
        let core = SKShapeNode(circleOfRadius: 15)
        core.name = "fieldReactorCore"
        core.position.y = housingImage == nil ? 0 : -10
        core.fillColor = SKColor(red: 0.18, green: 0.80, blue: 0.96, alpha: 1)
        core.strokeColor = .white.withAlphaComponent(0.90)
        core.lineWidth = 2
        core.glowWidth = 5
        core.zPosition = 5
        defenseDevice.addChild(core)
        core.run(.repeatForever(.sequence([
            .fadeAlpha(to: 0.65, duration: 0.65),
            .fadeAlpha(to: 1, duration: 0.65)
        ])), withKey: "reactorEnergyPulse")

        let lens = SKShapeNode(circleOfRadius: 6)
        lens.fillColor = .white.withAlphaComponent(0.80)
        lens.strokeColor = .clear
        core.addChild(lens)

        let label = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        label.name = "fieldReactorLabel"
        label.text = "DEFEND"
        label.fontSize = 11
        label.fontColor = .white
        label.position.y = 65
        label.zPosition = 7
        defenseDevice.addChild(label)

        let track = SKShapeNode(rectOf: CGSize(width: 76, height: 8), cornerRadius: 4)
        track.name = "fieldReactorIntegrityTrack"
        track.fillColor = .black.withAlphaComponent(0.85)
        track.strokeColor = SKColor(white: 0.63, alpha: 1)
        track.lineWidth = 1.5
        track.position = CGPoint(x: 0, y: 50)
        track.zPosition = 7
        defenseDevice.addChild(track)
        defenseIntegrityBar.position = track.position
        defenseIntegrityBar.zPosition = 8
        defenseIntegrityBar.fillColor = .systemGreen
        defenseIntegrityBar.strokeColor = .clear
        // A prior secured defense hides this reused node; a new mission
        // must always expose its integrity indicator again.
        defenseIntegrityBar.isHidden = false
        defenseIntegrityBar.path = CGPath(
            roundedRect: CGRect(x: -37, y: -3, width: 74, height: 6),
            cornerWidth: 3, cornerHeight: 3, transform: nil)
        defenseDevice.addChild(defenseIntegrityBar)
        // Keep the whole chassis in one depth band relative to pilot artwork.
        // Child z values otherwise cross the pilot even when the parent is behind.
        for child in defenseDevice.children { child.zPosition *= 0.01 }
        arena.addChild(defenseDevice)
        updateReactorOcclusion()
        updateDefenseDeviceDisplay()
    }

    private func markDefenseDeviceResolved() {
        guard activeEncounter == .equipmentDefense else { return }
        defenseDevice.children.filter { $0.name == "fieldReactorHitLabel" }
            .forEach { $0.removeFromParent() }
        let secured = defenseIntegrity > 0
        let core = defenseDevice.childNode(withName: "fieldReactorCore") as? SKShapeNode
        core?.removeAction(forKey: "reactorEnergyPulse")
        core?.removeAction(forKey: "objectiveHit")
        core?.fillColor = secured ? SKColor(red: 0.25, green: 0.78, blue: 0.53, alpha: 1)
            : SKColor(red: 0.25, green: 0.10, blue: 0.08, alpha: 1)
        core?.strokeColor = secured ? .systemGreen : .systemOrange
        core?.alpha = 1
        (defenseDevice.childNode(withName: "fieldReactorLabel") as? SKLabelNode)?
            .text = secured ? "SECURED" : "BONUS LOST"
        (defenseDevice.childNode(withName: "fieldReactorLabel") as? SKLabelNode)?
            .fontColor = secured ? .systemGreen : .systemOrange
        defenseDevice.childNode(withName: "fieldReactorIntegrityTrack")?.isHidden = true
        defenseIntegrityBar.isHidden = true
    }

    private func updateDefenseDeviceDisplay() {
        let ratio = CGFloat(max(0, defenseIntegrity)) /
            CGFloat(EquipmentDefenseRules.maximumIntegrity)
        defenseIntegrityBar.xScale = max(0.001, ratio)
        defenseIntegrityBar.fillColor = ratio > 0.5 ? .systemGreen :
            (ratio > 0.25 ? .systemYellow : .systemRed)
        let critical = EquipmentDefenseRules.criticalIntegrity(defenseIntegrity)
        if let label = defenseDevice.childNode(withName: "fieldReactorLabel") as? SKLabelNode {
            label.text = critical ? "REACTOR CRITICAL" : "DEFEND"
            label.fontColor = critical ? .systemRed : .white
        }
        if let core = defenseDevice.childNode(withName: "fieldReactorCore") as? SKShapeNode {
            core.fillColor = critical ? .systemOrange :
                SKColor(red: 0.18, green: 0.80, blue: 0.96, alpha: 1)
            core.alpha = critical ? 0.85 : 1
        }
        updateHUD()
    }

    private func damageDefenseDevice() {
        guard phase == .playing && activeEncounter == .equipmentDefense &&
              combatTime >= nextDefenseHitAt && defenseIntegrity > 0 else { return }
        nextDefenseHitAt = combatTime + EquipmentDefenseRules.hitCooldown
        defenseIntegrity = EquipmentDefenseRules.applyHit(integrity: defenseIntegrity)
        let core = defenseDevice.childNode(withName: "fieldReactorCore")
        core?.removeAction(forKey: "objectiveHit")
        core?.run(.sequence([.fadeAlpha(to: 0.2, duration: 0.08),
                             .fadeAlpha(to: 1, duration: 0.18)]), withKey: "objectiveHit")
        // Make each earned hit conspicuous without flashing the entire screen
        // or altering the reactor's gameplay collision area.
        let hitLabel = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        hitLabel.name = "fieldReactorHitLabel"
        hitLabel.text = "-\(EquipmentDefenseRules.hitDamage)"
        hitLabel.fontColor = .systemOrange
        hitLabel.fontSize = 16
        hitLabel.position = CGPoint(x: 28, y: 69)
        hitLabel.zPosition = 12
        defenseDevice.addChild(hitLabel)
        hitLabel.run(.sequence([
            .group([.moveBy(x: 9, y: 24, duration: 0.56),
                    .fadeOut(withDuration: 0.56)]),
            .removeFromParent()
        ]))
        updateDefenseDeviceDisplay()
        if EquipmentDefenseRules.fails(integrity: defenseIntegrity) {
            completeWave()
        } else {
            saveRunRecovery()
        }
    }

    private func startWave() {
        hud.isHidden = false
        // Returning from Home/World Map must restore the actual playable
        // pilot, not just the home preview art.
        pilot.isHidden = false
        if wave > 0 && wave < worldWaveCount && !gateUnlocked {
            showZoneGate()
            return
        }
        gateUnlocked = false
        // Keep the exit hidden during combat; the gate only appears after
        // the room is cleared, avoiding a distracting LOCKED banner.
        passageGate.isHidden = true
        passageGate.fillColor = .darkGray
        (passageGate.children.first(where: { $0 is SKLabelNode }) as? SKLabelNode)?.text = "LOCKED"
        passageGate.childNode(withName: "gateArrow")?.isHidden = true
        passageGate.removeAllActions()
        passageGate.childNode(withName: "portalEnergy")?.removeAllActions()
        passageGate.childNode(withName: "portalEnergy")?.alpha = 1
        passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.position = CGPoint(x: 0, y: -24)
        passageGate.alpha = 1
        guard wave < worldWaveCount else {
            showWorldCompleteSummary()
            return
        }
        phase = .playing
        arena.isPaused = false
        clearHostileAttacks()
        defenseDevice.removeFromParent()
        // Surviving enemies cannot accompany a departing pilot. Discard
        // without treating them as kills or paying extra XP/coins.
        for enemy in enemies { enemy.node.removeFromParent() }
        enemies.removeAll()
        for drop in xpDrops { drop.node.removeFromParent() }
        xpDrops.removeAll()
        bossNode = nil
        guardianArmorBroken = false
        guardianSupportDeployed = false
        scrapyardWardenEnraged = false
        guardianTransitionUntil = 0
        pendingFlankSwarm = nil
        arena.children.filter { $0.name == "flankSwarmWarning" }
            .forEach { $0.removeFromParent() }
        burns.removeAll()
        chilledUntil.removeAll()
        lastOrbitalHit.removeAll()
        // Hit throttles are keyed by enemy node identity. Reset them between
        // rooms so no defeated enemy or stale node survives in cooldown maps.
        lastEnergyWheelHit.removeAll()
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
        let scheduled = SurvivalEncounterRules.kind(world: worldMapIndex, room: wave)
        activeEncounter = scheduled == .survival || scheduled == .equipmentDefense
            ? scheduled : .tactical
        // Only explicit expanded-arena review fixtures may retain a large
        // camera in a tactical room; live survival -> tactical must reset it.
        let retainQACamera = ProcessInfo.processInfo.arguments.contains {
            $0.hasPrefix("-captureExpandedArena") ||
                $0 == "-captureSurvivalSwarmFrames"
        }
        expandedArenaPreview = activeEncounter == .survival || retainQACamera
        arena.childNode(withName: "expandedArenaPreviewGround")?.removeFromParent()
        if expandedArenaPreview { installArenaPreviewGround() }
        pilot.position = entryPoint
        arena.position = expandedArenaPreview
            ? ArenaLayout.offset(for: pilot.position, viewportSize: size) : .zero
        passageGate.position = CGPoint(x: roomBounds.midX, y: roomBounds.maxY - 110)
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
        // Extraction banners must never leak into the next tactical room.
        zoneBanner.removeAllActions()
        zoneBanner.text = ""
        zoneBanner.alpha = 0
        zoneBanner.position = CGPoint(x: size.width / 2, y: size.height - 216)
        let activeZone = min((wave - 1) / 5, 3)
        backgroundColor = worldColor(for: activeZone)
        updateZoneScenery(activeZone)
        rebuildTerrainHazards()
        defenseIntegrity = EquipmentDefenseRules.maximumIntegrity
        nextDefenseHitAt = combatTime + 1.5
        if activeEncounter == .equipmentDefense { installDefenseDevice() }
        nextAcidDamageAt = combatTime + 1.0
        enemyAcidDamageAt.removeAll()
        if wave == 1 || (wave - 1) % 5 == 0 || wave == worldWaveCount ||
           [4, 9, 14, 19].contains(wave) {
            zoneBanner.removeAllActions()
            let labels: [String]
            switch selectedWorld.biome {
            case 2: labels = ["TOXIC PERIMETER", "CORROSIVE PASS", "WASTE PROCESSING", "MATRIARCH NEST"]
            case 1: labels = ["IRON APPROACH", "COOLANT CHANNEL", "FORGE WORKS", "WARFORGE PLATFORM"]
            case 4: labels = ["FROZEN PASS", "ICEBOUND RELAY", "GLACIAL TRENCH", "WRAITH SANCTUM"]
            default: labels = zoneNames
            }
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
        // Boss rooms contain exactly one boss. Phase-two escorts are
        // spawned explicitly and must not be counted as extra bosses.
        waveTarget = wave == worldWaveCount ? 1 : CampaignPacing.targetEnemies(room: wave)
        if activeEncounter == .equipmentDefense {
            zoneBanner.text = "PROTECT THE FIELD REACTOR"
            zoneBanner.fontColor = .systemCyan
            zoneBanner.alpha = 1
            zoneBanner.run(.sequence([.wait(forDuration: 2), .fadeOut(withDuration: 0.5)]))
        }
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
        if selectedWorld.biome == 4 { return SKColor(red: 0.16, green: 0.30, blue: 0.44, alpha: 1) }
        let colors: [SKColor] = selectedWorld.biome == 1 ? [
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
            (selectedWorld.biome == 1 ? max(1, requestedZone) : max(2, requestedZone))
        zoneScenery.removeAllChildren()
        // Forest art is atmospheric, not terrain geometry. Only World 1
        // displays the continuous forest texture; later worlds retain their
        // distinct opaque industrial and toxic environment palettes.
        let roomArt = arena.childNode(withName: "roomArtwork")
        let nonForestWorld = worldMapIndex != 0
        if selectedWorld.biome == 4 {
            let frost = SKSpriteNode(texture: FrostFloorArt.texture(for: size))
            frost.name = "frostAmbientBackdrop"
            frost.size = size
            frost.position = CGPoint(x: size.width / 2, y: size.height / 2)
            frost.zPosition = -19
            zoneScenery.addChild(frost)
        }
        // World 1 art direction: three authored landscape families, rotated
        // through the campaign. An illustration must be shipped before this
        // path replaces the legacy backdrop; never substitute a placeholder.
        if worldMapIndex == 0 {
            let landscape: String
            switch wave {
            case 1...3, 6...8: landscape = "ruined_outpost"
            case 4...5, 11...13: landscape = "swamp_basin"
            case 9...10, 14...15: landscape = "toxic_caves"
            case 16...19:
                landscape = ["ruined_outpost", "swamp_basin", "toxic_caves"][(wave - 16) % 3]
            case 20: landscape = "boss_arena"
            default: landscape = "ruined_outpost"
            }
            // Keep the same illustrated floor for consecutive rooms in a
            // landscape, while rotating its three compositions on revisits.
            // Global wave modulo would change the floor every room and make
            // each location feel visually unstable.
            let landscapeVisit: Int
            switch wave {
            case 1...3: landscapeVisit = 0
            case 4...5: landscapeVisit = 0
            case 6...8: landscapeVisit = 1
            case 9...10: landscapeVisit = 0
            case 11...13: landscapeVisit = 1
            case 14...15: landscapeVisit = 1
            case 16...19: landscapeVisit = 2
            case 20: landscapeVisit = 0
            default: landscapeVisit = 0
            }
            let artName = "world1_\(landscape)_floor_\(landscapeVisit + 1)"
            let authoredFloorTexture = worldOneTexture(named: artName)
            if ProcessInfo.processInfo.arguments.contains("-requireWorldOneAuthoredArt"),
               authoredFloorTexture == nil {
                preconditionFailure("Missing authored World 1 floor: \(artName)")
            }
            if let texture = authoredFloorTexture {
                let floorArt = (roomArt?.childNode(withName: "world1AuthoredFloor") as? SKSpriteNode)
                    ?? SKSpriteNode(texture: texture)
                floorArt.name = "world1AuthoredFloor"
                floorArt.texture = texture
                floorArt.size = size
                floorArt.position = CGPoint(x: size.width / 2, y: size.height / 2)
                floorArt.zPosition = -18.5
                if floorArt.parent == nil { roomArt?.addChild(floorArt) }
            } else {
                roomArt?.childNode(withName: "world1AuthoredFloor")?.removeFromParent()
            }
            roomArt?.childNode(withName: "forestAmbientBackdrop")?.isHidden =
                roomArt?.childNode(withName: "world1AuthoredFloor") != nil
        }
        // Remove any authored floor left from a previous World 1 room when
        // switching to a different world; do not let its texture bleed through.
        if worldMapIndex != 0 {
            roomArt?.childNode(withName: "world1AuthoredFloor")?.removeFromParent()
        }
        roomArt?.childNode(withName: "forestAmbientBackdrop")?.isHidden = nonForestWorld || roomArt?.childNode(withName: "world1AuthoredFloor") != nil
        roomArt?.childNode(withName: "floodedAmbientBackdrop")?.isHidden = selectedWorld.biome != 1
        roomArt?.childNode(withName: "toxicAmbientBackdrop")?.isHidden = selectedWorld.biome != 2
        if let floor = roomArt?.childNode(withName: "roomFloor") as? SKShapeNode {
            // Preserve authored floor colors; the legacy procedural tint must
            // not wash out the new painted environment artwork.
            if worldMapIndex == 0 && roomArt?.childNode(withName: "world1AuthoredFloor") != nil {
                floor.fillColor = .clear
                floor.strokeColor = .clear
            } else {
            floor.fillColor = selectedWorld.biome == 2
                ? SKColor(red: 0.18, green: 0.22, blue: 0.14, alpha: 0.13)
                : (selectedWorld.biome == 1
                    ? SKColor(red: 0.10, green: 0.19, blue: 0.23, alpha: 0.14)
                    : (zone == 1
                    ? SKColor(red: 0.16, green: 0.25, blue: 0.20, alpha: 0.16)
                    : SKColor(red: 0.18, green: 0.28, blue: 0.20, alpha: 0.12)))
            floor.strokeColor = nonForestWorld
                ? SKColor(red: 0.10, green: 0.18, blue: 0.19, alpha: 0.25)
                : .clear
            }
        }
        // Keep procedural edge decoration off the painted floor.
        roomArt?.childNode(withName: "roomContactEdge")?.alpha =
            worldMapIndex == 0 && roomArt?.childNode(withName: "world1AuthoredFloor") != nil
            ? 0 : (nonForestWorld ? 0.32 : 0)
        // Scrapyard floors need a separate visual identity from the forest.
        // Faded plate seams and scattered bolt heads are purely atmospheric;
        // they do not modify water hazard geometry or movement collision.
        if selectedWorld.biome == 1 {
            let floorDetail = SKNode()
            floorDetail.name = "scrapyardFloorDetail"
            floorDetail.zPosition = -0.75
            zoneScenery.addChild(floorDetail)
            for index in 0..<17 {
                let seed = index * 41 + wave * 23
                let fx = CGFloat((seed * 31 + 7) % 101) / 101
                let fy = CGFloat((seed * 17 + 11) % 97) / 97
                let mark = SKShapeNode(rectOf: CGSize(
                    width: CGFloat(13 + seed % 13), height: 4),
                    cornerRadius: 1)
                mark.name = "scrapyardFloorSeam"
                mark.position = CGPoint(
                    x: roomBounds.minX + 38 + (roomBounds.width - 76) * fx,
                    y: roomBounds.minY + 40 + (roomBounds.height - 80) * fy)
                mark.zRotation = CGFloat(seed % 5 - 2) * 0.27
                mark.fillColor = SKColor(red: 0.38, green: 0.42,
                                         blue: 0.43, alpha: 0.19)
                mark.strokeColor = .clear
                floorDetail.addChild(mark)
                if index.isMultiple(of: 3) {
                    let bolt = SKShapeNode(circleOfRadius: 2)
                    bolt.name = "scrapyardFloorBolt"
                    bolt.position = CGPoint(x: 7, y: 0)
                    bolt.fillColor = SKColor(red: 0.59, green: 0.48,
                                             blue: 0.32, alpha: 0.4)
                    bolt.strokeColor = .clear
                    mark.addChild(bolt)
                }
            }
        }
        // Forest floor: low-contrast, deterministic leaf litter and worn
        // earth marks break up the flat ground without hiding projectiles.
        // Ground marks are strictly decorative and never alter collision.
        if worldMapIndex == 0 && roomArt?.childNode(withName: "world1AuthoredFloor") == nil {
            let floorDetail = SKNode()
            floorDetail.name = "forestFloorDetail"
            floorDetail.zPosition = -0.8
            zoneScenery.addChild(floorDetail)
            for index in 0..<24 {
                let seed = index * 37 + wave * 19
                let fx = CGFloat((seed * 53) % 97) / 97
                let fy = CGFloat((seed * 29 + 13) % 89) / 89
                let point = CGPoint(
                    x: roomBounds.minX + 32 + (roomBounds.width - 64) * fx,
                    y: roomBounds.minY + 35 + (roomBounds.height - 70) * fy)
                let mark = SKShapeNode(ellipseOf: CGSize(
                    width: CGFloat(7 + seed % 8),
                    height: CGFloat(3 + seed % 4)))
                mark.name = "forestFloorMark"
                mark.position = point
                mark.zRotation = CGFloat(seed % 7 - 3) * 0.19
                mark.fillColor = index.isMultiple(of: 3)
                    ? SKColor(red: 0.48, green: 0.39, blue: 0.24, alpha: 0.21)
                    : SKColor(red: 0.16, green: 0.29, blue: 0.17, alpha: 0.23)
                mark.strokeColor = .clear
                floorDetail.addChild(mark)
            }
        }
        // Alternate prop placement between rooms so successive arenas feel less repetitive.
        let count = worldMapIndex == 0 ? (zone <= 1 ? 8 : 6) :
            (selectedWorld.biome == 1 ? 6 + (wave % 2) : (zone <= 1 ? 8 + (wave % 3) : 5 + (wave % 3)))
        // Keep a landscape's perimeter composition stable for consecutive
        // waves; change the layout when the player enters another location.
        let landscapeLayoutSeed: Int
        if worldMapIndex == 0 {
            switch wave {
            case 1...3: landscapeLayoutSeed = 0
            case 4...5: landscapeLayoutSeed = 1
            case 6...8: landscapeLayoutSeed = 2
            case 9...10: landscapeLayoutSeed = 3
            case 11...13: landscapeLayoutSeed = 4
            case 14...15: landscapeLayoutSeed = 5
            case 16...19: landscapeLayoutSeed = wave - 10
            case 20: landscapeLayoutSeed = 10
            default: landscapeLayoutSeed = 0
            }
        } else {
            landscapeLayoutSeed = wave - 1
        }
        let roomVariant = ((landscapeLayoutSeed % 4) + 4) % 4
        for index in 0..<count {
            let leftSide = (index + roomVariant).isMultiple(of: 2)
            // World 1 gets genuinely different perimeter compositions:
            // alternating ruins, staggered clearings, and paired alcoves.
            // All props remain outside the central combat/movement lane.
            let worldOneSide: CGFloat
            switch roomVariant {
            case 0: worldOneSide = leftSide ? 0.10 : 0.90
            case 1: worldOneSide = leftSide ? 0.17 : 0.83
            case 2: worldOneSide = leftSide ? 0.07 : 0.93
            default: worldOneSide = leftSide ? 0.14 : 0.86
            }
            let side: CGFloat = worldMapIndex == 0 ? worldOneSide :
                (zone == 0 ? (leftSide ? 0.12 : 0.88) :
                    (zone == 1 ? (leftSide ? 0.16 : 0.84) : (leftSide ? 0.09 : 0.91)))
            let x = size.width * side + CGFloat(((index * 7 + roomVariant * 3) % 5) - 2) * 8
            let spacing = max(25, (roomBounds.height - 100) / CGFloat(count))
            let layoutShift = worldMapIndex == 0
                ? CGFloat(((index * (roomVariant + 3) * 13 + landscapeLayoutSeed * 7) % 31) - 15)
                : CGFloat(((index * 11 + wave * 7) % 19) - 9)
            let y = roomBounds.minY + 55 + CGFloat(index) * spacing + layoutShift
            let prop: SKShapeNode
            // When illustrated prop PNGs are not yet shipped, World 1 must
            // still read as ruins, swamp, or caves rather than generic forest.
            // These are visual fallbacks only; no new collision is introduced.
            if worldMapIndex == 0 {
                switch wave {
                case 4...5, 11...13:
                    prop = SKShapeNode(ellipseOf: CGSize(width: 32, height: 15))
                    prop.fillColor = SKColor(red: 0.20, green: 0.39, blue: 0.28, alpha: 1)
                case 9...10, 14...15:
                    prop = SKShapeNode(rectOf: CGSize(width: 29, height: 25), cornerRadius: 7)
                    prop.fillColor = SKColor(red: 0.30, green: 0.36, blue: 0.31, alpha: 1)
                case 16...19:
                    if (wave - 16) % 3 == 1 {
                        prop = SKShapeNode(ellipseOf: CGSize(width: 32, height: 15))
                        prop.fillColor = SKColor(red: 0.20, green: 0.39, blue: 0.28, alpha: 1)
                    } else {
                        prop = SKShapeNode(rectOf: CGSize(width: 29, height: 25), cornerRadius: 5)
                        prop.fillColor = SKColor(red: 0.36, green: 0.39, blue: 0.37, alpha: 1)
                    }
                case 20:
                    prop = SKShapeNode(rectOf: CGSize(width: 30, height: 20), cornerRadius: 4)
                    prop.fillColor = SKColor(red: 0.34, green: 0.30, blue: 0.29, alpha: 1)
                default:
                    prop = SKShapeNode(rectOf: CGSize(width: 30, height: 22), cornerRadius: 3)
                    prop.fillColor = SKColor(red: 0.42, green: 0.43, blue: 0.38, alpha: 1)
                }
            } else {
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
            default:
                prop = SKShapeNode(rectOf: CGSize(width: 12, height: 34), cornerRadius: 3)
                prop.fillColor = .systemRed
                }
            }
            prop.strokeColor = .white.withAlphaComponent(0.22)
            prop.lineWidth = 1
            // The old guardian-zone props were intentionally ghostly red
            // beacons; their illustrated tree replacements must be opaque.
            prop.alpha = worldMapIndex == 0 && zone == 3 ? 0.94 :
                (selectedWorld.biome == 2 ? 0.94 :
                    (zone == 0 ? 0.95 : (zone == 1 ? 0.92 : 0.55)))
            prop.position = CGPoint(x: x, y: y)
            zoneScenery.addChild(prop)
            // Production World 1 scenery is composed from individually
            // illustrated transparent sprites. Keep gameplay geometry and
            // placement independent of the image artwork.
            if worldMapIndex == 0 {
                let landscape: String
                switch wave {
                case 4...5, 11...13: landscape = "swamp_basin"
                case 9...10, 14...15: landscape = "toxic_caves"
                case 16...19:
                    landscape = ["ruined_outpost", "swamp_basin", "toxic_caves"][(wave - 16) % 3]
                case 20: landscape = "boss_arena"
                default: landscape = "ruined_outpost"
                }
                let propKinds = ["wall", "boulder", "vegetation", "debris", "lantern", "crate"]
                // Keep prop identity stable within a landscape sequence.
                // Otherwise the same perimeter location switches from a
                // wall to a lantern or crate every time a wave advances.
                let landscapePhase: Int
                switch wave {
                case 1...3: landscapePhase = 0
                case 4...5: landscapePhase = 1
                case 6...8: landscapePhase = 2
                case 9...10: landscapePhase = 3
                case 11...13: landscapePhase = 4
                case 14...15: landscapePhase = 5
                case 16...19: landscapePhase = wave - 10
                default: landscapePhase = 10
                }
                let kind = propKinds[(index + landscapePhase) % propKinds.count]
                let assetName = "world1_\(landscape)_\(kind)"
                let authoredTexture = worldOneTexture(named: assetName)
                if ProcessInfo.processInfo.arguments.contains("-requireWorldOneAuthoredArt"),
                   authoredTexture == nil {
                    preconditionFailure("Missing authored World 1 prop: \(assetName)")
                }
                if let texture = authoredTexture {
                    let sprite = SKSpriteNode(texture: texture)
                    sprite.name = "world1AuthoredProp"
                    let height: CGFloat = kind == "wall" ? 78 : (kind == "vegetation" ? 62 : 48)
                    let ratio = max(0.45, min(1.9, texture.size().width / max(1, texture.size().height)))
                    sprite.size = CGSize(width: height * ratio, height: height)
                    sprite.position.y = height * 0.27
                    sprite.zPosition = 0.8
                    prop.fillColor = .clear
                    prop.strokeColor = .clear
                    prop.alpha = 1
                    prop.addChild(sprite)
                    continue
                }
            }
            if selectedWorld.biome == 4 {
                prop.fillColor = .clear
                prop.strokeColor = .clear
                prop.alpha = 0.95
                for shard in 0..<3 {
                    let h = CGFloat(24 + (index * 11 + shard * 17) % 35)
                    let path = CGMutablePath()
                    path.move(to: CGPoint(x: -7, y: -8))
                    path.addLine(to: CGPoint(x: -5, y: h * 0.65))
                    path.addLine(to: CGPoint(x: 1, y: h))
                    path.addLine(to: CGPoint(x: 9, y: h * 0.55))
                    path.addLine(to: CGPoint(x: 7, y: -8))
                    path.closeSubpath()
                    let crystal = SKShapeNode(path: path)
                    crystal.fillColor = SKColor(red: 0.18, green: 0.51, blue: 0.74, alpha: 1)
                    crystal.strokeColor = SKColor(red: 0.65, green: 0.90, blue: 1, alpha: 1)
                    crystal.lineWidth = 1.5
                    crystal.position.x = CGFloat(shard - 1) * 12
                    crystal.zRotation = CGFloat(shard - 1) * -0.15
                    prop.addChild(crystal)
                }
                continue
            }
            if zone == 3 && worldMapIndex == 0 {
                // Organic side framing leaves the pilot's central travel lane
                // clear and restores recognizable Frontier Forest identity
                // throughout the final five rooms. Nothing here blocks movement.
                prop.fillColor = .clear
                prop.strokeColor = .clear
                let tree = SKSpriteNode(texture: productionTexture(
                    named: index.isMultiple(of: 3) ? "forest_broadleaf" : "forest_pine",
                    fallback: forestPineTexture))
                tree.name = "guardianClearingTree"
                tree.size = CGSize(width: 80 + CGFloat(index % 2) * 13,
                                   height: 80 + CGFloat(index % 2) * 13)
                tree.position.y = 6
                tree.zPosition = 0.8
                prop.addChild(tree)
                let stone = SKShapeNode(path: BattlefieldArt.terrainShape(
                    width: 32, height: 12, variation: index + wave))
                stone.fillColor = SKColor(red: 0.35, green: 0.39,
                                          blue: 0.29, alpha: 0.92)
                stone.strokeColor = .clear
                stone.position.y = -35
                stone.zPosition = 0.9
                prop.addChild(stone)
                if index.isMultiple(of: 3) {
                    let glow = SKShapeNode(circleOfRadius: 4)
                    glow.position = CGPoint(x: leftSide ? 15 : -15, y: -29)
                    glow.fillColor = .systemMint
                    glow.strokeColor = .clear
                    glow.glowWidth = 3
                    glow.zPosition = 1.3
                    prop.addChild(glow)
                }
            } else if zone == 3 {
                // Existing later-world industrial guardian markers remain.
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
            if zone == 2 && selectedWorld.biome != 2 {
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
            if selectedWorld.biome == 2 {
                addToxicEdgeProp(to: prop, index: index,
                                 leftSide: leftSide, guardian: zone == 3)
            }
            if selectedWorld.biome == 1 && index.isMultiple(of: 2) {
                // World 2 scrapyard identity: layered salvaged plating and
                // riveted beams frame the flooded industrial arena. Decorative
                // only: the existing water hazard owns collision and slowdown.
                let scrap = SKShapeNode(rectOf: CGSize(
                    width: CGFloat(26 + index % 3 * 7), height: 15),
                    cornerRadius: 2)
                scrap.name = "scrapyardPlating"
                scrap.fillColor = SKColor(red: 0.31, green: 0.36,
                                         blue: 0.39, alpha: 0.96)
                scrap.strokeColor = SKColor(red: 0.56, green: 0.43,
                                           blue: 0.27, alpha: 0.9)
                scrap.lineWidth = 2
                scrap.zRotation = CGFloat(index % 3 - 1) * 0.18
                scrap.position = CGPoint(x: leftSide ? 8 : -8, y: -13)
                scrap.zPosition = 1.4
                prop.addChild(scrap)
                for side: CGFloat in [-1, 1] {
                    let rivet = SKShapeNode(circleOfRadius: 1.8)
                    rivet.fillColor = .lightGray
                    rivet.strokeColor = .clear
                    rivet.position = CGPoint(x: side * 9, y: 0)
                    scrap.addChild(rivet)
                }
                if index.isMultiple(of: 4) {
                    let beam = SKShapeNode(rectOf: CGSize(width: 9, height: 40),
                                           cornerRadius: 2)
                    beam.name = "scrapyardBeam"
                    beam.fillColor = SKColor(red: 0.28, green: 0.30,
                                             blue: 0.31, alpha: 1)
                    beam.strokeColor = .systemOrange.withAlphaComponent(0.7)
                    beam.lineWidth = 1.5
                    beam.zRotation = leftSide ? -0.12 : 0.12
                    beam.position.y = 11
                    beam.zPosition = 1.2
                    prop.addChild(beam)
                }
            }
            if zone == 1 && selectedWorld.biome == 1 {
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
                    tree.size = CGSize(width: 94, height: 94)
                    tree.position = CGPoint(x: leftSide ? -5 : 5, y: 8)
                    // Mirroring reverses the authored upper-left lighting.
                    tree.xScale = 1
                    tree.zRotation = CGFloat((index + wave) % 5 - 2) * 0.025
                    tree.zPosition = 0.8
                    prop.addChild(tree)
                    // Visible broadleaf roots end above the nominal canvas
                    // border; transparent edge noise is not ground contact.
                    let root = tree.convert(CGPoint(x: 0, y: -tree.size.height * 0.395), to: prop)
                    shadow.position = CGPoint(x: root.x + tree.size.width * 0.06, y: root.y)
                    // Remove disconnected vine strokes; illustrated canopy stays.
                } else if !addForestUndergrowth(to: prop, width: 70) {
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
                    width: 59 + CGFloat((index * 3 + wave) % 5) * 8,
                    height: 59 + CGFloat((index * 3 + wave) % 5) * 8
                )
                tree.xScale = 1
                tree.zRotation = CGFloat(((index * 7 + wave * 3) % 9) - 4) * 0.018
                tree.position = CGPoint(x: isBroadleaf ? (leftSide ? 5 : -5) : 0, y: 5)
                tree.zPosition = 1
                prop.addChild(tree)
                // Follow the visible root, including sprite size and rotation;
                // a fixed y offset makes the smaller authored trees float.
                let rootDepth: CGFloat = isBroadleaf ? 0.395 : 0.42
                let root = tree.convert(CGPoint(x: 0, y: -tree.size.height * rootDepth), to: prop)
                shadow.position = CGPoint(x: root.x + tree.size.width * 0.06, y: root.y)
                shadow.xScale = tree.size.width * 0.48 / 43
                shadow.yScale = tree.size.height * 0.14 / 14
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
        if worldMapIndex == 0 && (zone <= 1 || zone == 3) {
            // Final clearing is greener, but less busy so telegraphed
            // boss attacks remain legible beneath the player and enemy.
            for index in 0..<(zone == 3 ? 10 : 17) {
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
                if addForestUndergrowth(to: fern, width: 42 + CGFloat(index % 3) * 6) {
                    zoneScenery.addChild(fern)
                    continue
                }
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

    /// Decorative only: keep undergrowth outside collision and combat logic.
    /// Authored highlights always face upper-left; never mirror the texture.
    @discardableResult
    private func addForestUndergrowth(to parent: SKNode, width: CGFloat) -> Bool {
        guard worldMapIndex == 0,
              let image = productionImage(named: "forest_undergrowth_polished") else {
            return false
        }
        let shadow = SKShapeNode(ellipseOf: CGSize(width: width * 0.70,
                                                  height: width * 0.13))
        shadow.name = "forestUndergrowthContact"
        shadow.position = CGPoint(x: width * 0.035, y: 0)
        shadow.fillColor = .black.withAlphaComponent(0.22)
        shadow.strokeColor = .clear
        shadow.zPosition = -0.1
        parent.addChild(shadow)
        let shrub = SKSpriteNode(texture: SKTexture(image: image))
        shrub.name = "forestUndergrowthArt"
        shrub.size = CGSize(width: width, height: width)
        // The normalized 256px canvas has a 57px lower transparent margin.
        shrub.anchorPoint = CGPoint(x: 0.5, y: 57.0 / 256.0)
        shrub.zPosition = 0.2
        parent.addChild(shrub)
        return true
    }

    // Production art takes precedence when a validated PNG is bundled in the app.
    // Until then, existing procedural textures keep the game fully playable.
    // XcodeGen can copy ArtAssets either to the bundle root or into an ArtAssets folder.
    // Resolve both layouts so a successful bundle check also means the game can display the PNG.
    private func productionImage(named name: String) -> UIImage? {
        // Authored assets stay separate so CI generators cannot overwrite them.
        let authored = ["grunt_idle": "grunt_polished",
                        "scout_idle": "scout_polished",
                        "raider_idle": "raider_polished",
                        "heavy_idle": "heavy_polished",
                        "shooter_idle": "shooter_polished",
                        "lobber_idle": "lobber_polished",
                        "forest_pine": "forest_pine_polished",
                        "forest_broadleaf": "forest_broadleaf_polished"]
        if let replacement = authored[name],
           let image = productionImage(named: replacement) { return image }
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

    /// The Frontier Guardian's illustrated layers are arranged as one
    /// deliberate boss silhouette. Fully opaque rock, dark undercuts, curved
    /// roots and foliage replace the previous stack of see-through rectangles.
    /// Keeping this visual helper separate preserves combat radius/timers.
    private func installFrontierGuardianArtwork(on node: SKShapeNode) {
        let outline = SKColor(red: 0.085, green: 0.17, blue: 0.14, alpha: 1)
        let shadow = SKColor(red: 0.13, green: 0.25, blue: 0.20, alpha: 1)
        let bark = SKColor(red: 0.22, green: 0.34, blue: 0.25, alpha: 1)
        let stone = SKColor(red: 0.38, green: 0.46, blue: 0.35, alpha: 1)
        let highlight = SKColor(red: 0.57, green: 0.60, blue: 0.40, alpha: 1)
        let moss = SKColor(red: 0.27, green: 0.55, blue: 0.29, alpha: 1)
        let darkMoss = SKColor(red: 0.15, green: 0.38, blue: 0.22, alpha: 1)
        let bronze = SKColor(red: 0.76, green: 0.57, blue: 0.32, alpha: 1)

        func plate(_ vertices: [CGPoint], color: SKColor, edge: SKColor,
                   width: CGFloat = 2.3, depth: CGFloat = 1) -> SKShapeNode {
            let contour = CGMutablePath()
            if let first = vertices.first {
                contour.move(to: first)
                for point in vertices.dropFirst() { contour.addLine(to: point) }
                contour.closeSubpath()
            }
            let shape = SKShapeNode(path: contour)
            shape.fillColor = color
            shape.strokeColor = edge
            shape.lineWidth = width
            shape.lineJoin = .round
            shape.zPosition = depth
            node.addChild(shape)
            return shape
        }
        let shadowPad = SKShapeNode(ellipseOf: CGSize(width: 145, height: 25))
        shadowPad.position = CGPoint(x: 0, y: -75)
        shadowPad.fillColor = .black.withAlphaComponent(0.38)
        shadowPad.strokeColor = .clear
        shadowPad.zPosition = -0.5
        node.addChild(shadowPad)

        // The broad legs and hooked root-knuckles anchor a heavyweight boss.
        for side: CGFloat in [-1, 1] {
            plate([CGPoint(x: side * 10, y: -31),
                   CGPoint(x: side * 34, y: -28),
                   CGPoint(x: side * 39, y: -61),
                   CGPoint(x: side * 27, y: -71),
                   CGPoint(x: side * 9, y: -66)],
                  color: shadow, edge: outline, depth: 0.2)
            plate([CGPoint(x: side * 16, y: -58),
                   CGPoint(x: side * 36, y: -53),
                   CGPoint(x: side * 51, y: -72),
                   CGPoint(x: side * 22, y: -76),
                   CGPoint(x: side * 9, y: -67)],
                  color: stone, edge: outline, depth: 1.2)
            plate([CGPoint(x: side * 31, y: 27),
                   CGPoint(x: side * 66, y: 24),
                   CGPoint(x: side * 70, y: -13),
                   CGPoint(x: side * 55, y: -47),
                   CGPoint(x: side * 44, y: -41),
                   CGPoint(x: side * 48, y: 0),
                   CGPoint(x: side * 24, y: -9)],
                  color: bark, edge: outline, depth: 0.3)
            plate([CGPoint(x: side * 53, y: -35),
                   CGPoint(x: side * 64, y: -33),
                   CGPoint(x: side * 75, y: -53),
                   CGPoint(x: side * 69, y: -67),
                   CGPoint(x: side * 56, y: -56)],
                  color: stone, edge: outline, depth: 1.1)
            plate([CGPoint(x: side * 61, y: -54),
                   CGPoint(x: side * 78, y: -71),
                   CGPoint(x: side * 66, y: -73)],
                  color: highlight, edge: outline, width: 1.5, depth: 1.4)
        }
        plate([CGPoint(x: -41, y: 42), CGPoint(x: -22, y: 56),
               CGPoint(x: 19, y: 56), CGPoint(x: 43, y: 34),
               CGPoint(x: 40, y: -32), CGPoint(x: 19, y: -54),
               CGPoint(x: -25, y: -51), CGPoint(x: -45, y: -26)],
              color: shadow, edge: outline, width: 4, depth: 1)
        plate([CGPoint(x: -33, y: 30), CGPoint(x: -18, y: 47),
               CGPoint(x: 17, y: 46), CGPoint(x: 35, y: 29),
               CGPoint(x: 31, y: -26), CGPoint(x: 11, y: -39),
               CGPoint(x: -14, y: -38), CGPoint(x: -34, y: -19)],
              color: stone, edge: highlight, width: 3, depth: 2)
        // Asymmetric cliff-rock shoulder plates read differently from the
        // normal unit sprites even on small mobile screens.
        for side: CGFloat in [-1, 1] {
            let shoulder = plate([
                CGPoint(x: side * 23, y: 42),
                CGPoint(x: side * 44, y: 58),
                CGPoint(x: side * 68, y: 43),
                CGPoint(x: side * 62, y: 10),
                CGPoint(x: side * 35, y: -7),
                CGPoint(x: side * 19, y: 18)],
                color: stone, edge: outline, width: 3, depth: 3)
            shoulder.name = side < 0 ? "guardianArmorLeft" : "guardianArmorRight"
            plate([CGPoint(x: side * 29, y: 36),
                   CGPoint(x: side * 44, y: 50),
                   CGPoint(x: side * 58, y: 37),
                   CGPoint(x: side * 41, y: 26)],
                  color: highlight, edge: .clear, width: 0, depth: 3.1)
            // Branch-like crown points give the silhouette a forest identity.
            plate([CGPoint(x: side * 15, y: 45),
                   CGPoint(x: side * 24, y: 73),
                   CGPoint(x: side * 37, y: 87),
                   CGPoint(x: side * 35, y: 58),
                   CGPoint(x: side * 44, y: 69),
                   CGPoint(x: side * 43, y: 39)],
                  color: bark, edge: outline, width: 3, depth: 1.7)
        }
        // A carved face, separated bright eyes, and heavy upper brow.
        plate([CGPoint(x: -28, y: 42), CGPoint(x: -18, y: 59),
               CGPoint(x: 17, y: 61), CGPoint(x: 30, y: 41),
               CGPoint(x: 21, y: 5), CGPoint(x: 0, y: -3),
               CGPoint(x: -21, y: 8)],
              color: bark, edge: outline, width: 3, depth: 3.2)
        plate([CGPoint(x: -30, y: 44), CGPoint(x: -12, y: 54),
               CGPoint(x: 9, y: 54), CGPoint(x: 28, y: 44),
               CGPoint(x: 17, y: 37), CGPoint(x: -19, y: 35)],
              color: stone, edge: outline, depth: 3.5)
        for side: CGFloat in [-1, 1] {
            let eye = SKShapeNode(ellipseOf: CGSize(width: 12, height: 9))
            eye.position = CGPoint(x: side * 13, y: 27)
            eye.fillColor = .systemGreen
            eye.strokeColor = SKColor(red: 0.79, green: 1, blue: 0.56, alpha: 1)
            eye.lineWidth = 1.5
            eye.glowWidth = 3
            eye.zPosition = 4
            node.addChild(eye)
        }
        // Varied leaf masses and little growths are foreground silhouette
        // details, not a flat horizontal decal over the arena.
        for (index, position) in [
            CGPoint(x: -48, y: 56), CGPoint(x: -32, y: 72),
            CGPoint(x: -8, y: 68), CGPoint(x: 16, y: 74),
            CGPoint(x: 44, y: 58), CGPoint(x: 54, y: 37),
            CGPoint(x: -55, y: 34)
        ].enumerated() {
            let tuft = SKShapeNode(ellipseOf: CGSize(
                width: index.isMultiple(of: 2) ? 25 : 21,
                height: index.isMultiple(of: 3) ? 17 : 14))
            tuft.position = position
            tuft.zRotation = CGFloat(index - 3) * 0.13
            tuft.fillColor = index.isMultiple(of: 2) ? moss : darkMoss
            tuft.strokeColor = SKColor(red: 0.41, green: 0.61,
                                       blue: 0.32, alpha: 1)
            tuft.lineWidth = 1.7
            tuft.zPosition = 5
            node.addChild(tuft)
        }
        // The center reactor is intentionally high-contrast and separately
        // addressable by the existing armor-break visual transition.
        let housing = SKShapeNode(circleOfRadius: 24)
        housing.position = CGPoint(x: 0, y: -14)
        housing.fillColor = outline
        housing.strokeColor = bronze
        housing.lineWidth = 5
        housing.zPosition = 5.2
        node.addChild(housing)
        let reactor = SKShapeNode(circleOfRadius: 16)
        reactor.name = "guardianCore"
        reactor.fillColor = SKColor(red: 0.16, green: 0.95, blue: 0.66, alpha: 1)
        reactor.strokeColor = .white
        reactor.lineWidth = 2.5
        reactor.glowWidth = 7
        reactor.zPosition = 1
        housing.addChild(reactor)
        let glint = SKShapeNode(ellipseOf: CGSize(width: 8, height: 15))
        glint.position = CGPoint(x: -4, y: 5)
        glint.fillColor = .white.withAlphaComponent(0.62)
        glint.strokeColor = .clear
        glint.zPosition = 2
        reactor.addChild(glint)
    }

    /// Visible directional warnings precede fast angled raiders. The SKAction
    /// waits in wall-clock time, and pauses with the arena on interruptions.
    private func scheduleFlankSwarm(count: Int) {
        guard pendingFlankSwarm == nil, count > 0,
              activeEncounter == .tactical, phase == .playing else { return }
        let pending = PendingFlankSwarm(
            room: wave, warnedPilot: pilot.position, count: count)
        pendingFlankSwarm = pending
        let notice = SKNode()
        notice.name = "flankSwarmWarning"
        notice.zPosition = 16
        for index in 0..<count {
            let entry = FlankSwarmRules.entry(bounds: roomBounds,
                warnedPilot: pending.warnedPilot, index: index)
            let fromLeft = entry.x < roomBounds.midX
            // Use vector paths, not text glyphs: the left/right symbols
            // previously rendered as mismatched orange and blue emoji on iOS.
            let arrowPath = CGMutablePath()
            let direction: CGFloat = fromLeft ? 1 : -1
            arrowPath.move(to: CGPoint(x: -20 * direction, y: -5))
            arrowPath.addLine(to: CGPoint(x: -4 * direction, y: -5))
            arrowPath.addLine(to: CGPoint(x: -4 * direction, y: -12))
            arrowPath.addLine(to: CGPoint(x: 19 * direction, y: 0))
            arrowPath.addLine(to: CGPoint(x: -4 * direction, y: 12))
            arrowPath.addLine(to: CGPoint(x: -4 * direction, y: 5))
            arrowPath.addLine(to: CGPoint(x: -20 * direction, y: 5))
            arrowPath.closeSubpath()
            let arrow = SKShapeNode(path: arrowPath)
            arrow.name = "flankIncomingArrow"
            arrow.fillColor = .systemOrange
            arrow.strokeColor = .systemYellow
            arrow.lineWidth = 1.5
            arrow.position = CGPoint(x: entry.x, y: entry.y + 4)
            arrow.zPosition = 2
            notice.addChild(arrow)
            let beam = SKShapeNode(rectOf: CGSize(width: 7, height: 45),
                                   cornerRadius: 3)
            beam.position = CGPoint(x: entry.x, y: entry.y)
            beam.fillColor = .systemOrange.withAlphaComponent(0.52)
            beam.strokeColor = .systemYellow
            beam.lineWidth = 1.4
            notice.addChild(beam)
        }
        let alert = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        alert.name = "flankSwarmAlert"
        alert.text = "FLANK ATTACK!"
        alert.fontSize = 17
        alert.fontColor = .systemOrange
        alert.position = CGPoint(x: roomBounds.midX, y: roomBounds.maxY - 58)
        notice.addChild(alert)
        arena.addChild(notice)
        notice.run(.sequence([
            .wait(forDuration: FlankSwarmRules.warningSeconds),
            .run { [weak self] in self?.deployFlankSwarm() },
            .removeFromParent()
        ]))
    }

    private func deployFlankSwarm() {
        guard let pending = pendingFlankSwarm else { return }
        pendingFlankSwarm = nil
        guard wave == pending.room, phase == .playing,
              activeEncounter == .tactical, !roomCleared else { return }
        for index in 0..<min(pending.count, max(0, waveTarget - spawned)) {
            spawned += 1
            let before = enemies.count
            spawnEnemy(artReviewType: 2)
            guard enemies.count > before else { continue }
            let target = FlankSwarmRules.entry(bounds: roomBounds,
                warnedPilot: pending.warnedPilot, index: index)
            enemies[enemies.count - 1].node.position = target
            enemies[enemies.count - 1].node.name = "flankRaider"
            enemies[enemies.count - 1].activeAt = combatTime + 0.35
        }
        spawnClock = 0
    }

    private func spawnEnemy(artReviewType: Int? = nil) {
        let isBoss = wave == worldWaveCount && artReviewType == nil
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
        if isBoss {
            node.fillColor = .clear
            node.strokeColor = .clear
        }
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
            if (0...5).contains(type) && hasProductionArt {
                armor.size.width = armor.size.height
            }
            if type == 4 && hasProductionArt {
                // The long railgun and antennae leave a narrow body inside
                // the square canvas. Enlarge only its visible illustration.
                armor.size.width *= 1.12
                armor.size.height *= 1.12
                armor.position.y = radius * 0.14
            }
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
        // Salvage raiders wear mismatched scrap plates in World 2.
        // Overlay-only detail keeps enemy behavior and collision unchanged.
        if worldMapIndex == 1 && !isBoss {
            let shoulder = SKShapeNode(rectOf: CGSize(
                width: radius * 1.7, height: radius * 0.42), cornerRadius: 2)
            shoulder.name = "scrapyardEnemyArmor"
            shoulder.fillColor = SKColor(red: 0.40, green: 0.37,
                                         blue: 0.31, alpha: 0.95)
            shoulder.strokeColor = .systemOrange.withAlphaComponent(0.8)
            shoulder.lineWidth = 1
            shoulder.zPosition = 2.2
            shoulder.position.y = radius * 0.48
            shoulder.zRotation = type.isMultiple(of: 2) ? 0.08 : -0.08
            node.addChild(shoulder)
            let rivet = SKShapeNode(circleOfRadius: 2)
            rivet.fillColor = .lightGray
            rivet.strokeColor = .clear
            rivet.position.x = radius * 0.55
            shoulder.addChild(rivet)
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
        if !usesIllustratedEnemy && !isBoss {
            node.addChild(core)
        }
        if isBoss { BossArtwork.install(on: node, world: worldMapIndex) }
        if type >= 4 && !usesIllustratedEnemy && !isBoss {
            let weapon = SKShapeNode(rectOf: CGSize(width: type == 5 ? 22 : 8, height: 26), cornerRadius: 3)
            weapon.fillColor = type == 5 ? .systemYellow : .systemCyan
            weapon.strokeColor = .white
            weapon.position.y = 15
            node.addChild(weapon)
        }
        // Distinct silhouettes help players recognize ranged threats before they attack.
        if type == 4 && !usesIllustratedEnemy && !isBoss {
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
        } else if type == 5 && !usesIllustratedEnemy && !isBoss {
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
        if type == 1 && !usesIllustratedEnemy && !isBoss {
            let armor = SKShapeNode(rectOf: CGSize(width: radius * 1.5, height: 7), cornerRadius: 3)
            armor.fillColor = .systemYellow
            armor.strokeColor = .clear
            armor.position.y = radius * 0.52
            node.addChild(armor)
        } else if type == 2 && !usesIllustratedEnemy && !isBoss {
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
            let vertical: ClosedRange<CGFloat> = activeEncounter == .equipmentDefense
                ? 0.06...0.94 : 0.48...0.94
            let sample = CGPoint(x: x, y: CGFloat.random(in: vertical))
            let location = CGPoint(
                x: candidateBounds.minX + candidateBounds.width * sample.x,
                y: candidateBounds.minY + candidateBounds.height * sample.y)
            guard TerrainHazards.spawnAllowed(location, radius: radius,
                                              patches: roomHazards) else { return nil }
            return sample
        }
        if activeEncounter == .equipmentDefense {
            // Random lanes are often too short on compact phones. Sample
            // the entire terrain-approved field, including its safe edges.
            let grid = (0...8).flatMap { row in
                (0...8).map { col in
                    CGPoint(x: CGFloat(col) / 8, y: CGFloat(row) / 8)
                }
            }
            let positions = (candidates + grid).map {
                CGPoint(x: candidateBounds.minX + candidateBounds.width * $0.x,
                        y: candidateBounds.minY + candidateBounds.height * $0.y)
            }.filter {
                TerrainHazards.spawnAllowed($0, radius: radius, patches: roomHazards)
            }
            guard let placement = EquipmentDefenseRules.defenseSpawnPosition(
                candidates: positions, pilot: pilot.position,
                reactor: defenseDevice.position, enemyRadius: radius) else {
                // Retry later; an impossible spawn must not count as an arrival.
                spawned = max(0, spawned - 1)
                return
            }
            node.position = placement
        } else {
            node.position = RoomRules.spawnPoint(
                in: roomBounds, radius: radius,
                pilot: pilot.position, candidates: candidates)
        }
        if isBoss {
            node.position = CGPoint(x: roomBounds.midX,
                                    y: min(roomBounds.maxY - 140, roomBounds.midY + 70))
        }
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
        // World pacing: a fresh pilot gets breathing room early, while
        // late rooms demand more from upgraded loadouts. Boss health and
        // screenshot capture fixtures retain their established values.
        let baseEnemyHP = CampaignPacing.enemyHealth(world: worldMapIndex, room: wave, type: type)
        let healthFactor: Double
        if isBoss {
            healthFactor = 1
        } else if worldMapIndex == 0 {
            healthFactor = wave <= 5 ? 0.92 : (wave >= 16 ? 1.12 : 1)
        } else if worldMapIndex == 1 {
            healthFactor = wave <= 5 ? 0.95 : (wave >= 16 ? 1.15 : 1)
        } else {
            healthFactor = 1
        }
        let enemyHP = ProcessInfo.processInfo.arguments.contains("-captureRangedCombatFrames")
            ? 70 : max(1, Int((Double(baseEnemyHP) * healthFactor).rounded()))
        let speed = isBoss ? CGFloat(20) : CGFloat(type == 2 ? 105 : (type == 3 ? 32 : (type == 1 ? 38 : 65))) + CGFloat(min(wave * 3, 45))
        // Keep the track and fill together above the larger illustrated sprite.
        let healthBarOffset: CGFloat = isBoss ? 118 :
            (usesIllustratedEnemy ? radius * 1.39 + 9 : radius + 12)
        let barWidth: CGFloat = isBoss ? 148 : radius * 2.2
        let barHeight: CGFloat = isBoss ? 8 : 5
        let healthTrack = SKShapeNode(rectOf: CGSize(
            width: barWidth, height: barHeight), cornerRadius: barHeight / 2)
        healthTrack.fillColor = SKColor.black.withAlphaComponent(0.7)
        healthTrack.strokeColor = .clear
        healthTrack.position.y = healthBarOffset
        node.addChild(healthTrack)
        let healthBar = SKShapeNode(rectOf: CGSize(
            width: barWidth, height: barHeight), cornerRadius: barHeight / 2)
        healthBar.fillColor = .systemGreen
        healthBar.strokeColor = .clear
        healthBar.position.y = healthBarOffset
        healthBar.zPosition = 2
        node.addChild(healthBar)
        if isBoss {
            // The named boss bar is legible at iPhone scale, unlike the same
            // tiny anonymous bar used for grunts.
            let nameplate = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            nameplate.name = "guardianBossNameplate"
            nameplate.text = selectedWorld.boss
            nameplate.fontSize = 11
            nameplate.fontColor = .systemYellow
            nameplate.position.y = healthBarOffset + 13
            nameplate.zPosition = 2
            node.addChild(nameplate)
        }
        enemies.append(Enemy(node: node, health: enemyHP, maxHealth: enemyHP, healthBar: healthBar, speed: speed, reward: CampaignPacing.killCoins(type: type, isBoss: isBoss), behavior: type, radius: radius, activeAt: combatTime + 0.9, weavePhase: CGFloat.random(in: 0...(2 * .pi)), nextAttack: combatTime + 1.7))
    }

    override func update(_ currentTime: TimeInterval) {
        if holdDefenseQAScreenshot { return }
        if lastUpdate == 0 { lastUpdate = currentTime; clock = currentTime }
        let dt = min(0.05, max(0, currentTime - lastUpdate))
        let gameDt = dt * (fastForward ? 2.0 : 1.0)
        lastUpdate = currentTime
        clock += dt
        combatClock.advance(gameDt, playing: phase == .playing || extractionCombatActive)
        // Choosing to fight after extraction opens still carries combat risk.
        if (phase == .playing || extractionCombatActive) && health <= 0 {
            endGame()
            return
        }
        if (phase == .playing || extractionCombatActive) &&
           combatTime >= nextRunSaveAt {
            nextRunSaveAt = combatTime + 4.0
            saveRunRecovery()
        }
        if phase == .playing || extractionCombatActive {
            collectXP()
            if progress.pendingChoices > 0 {
                _ = presentPendingLevelUp(
                    returningTo: extractionCombatActive ? .gate : .playing)
                return
            }
        }
        guard phase == .playing || phase == .gate else { return }
        // Presentation continues through a peaceful exit, while combat damage
        // timers remain stopped. Menus return above and freeze this clock.
        pilotAnimationTime += dt
        // QA-only guided movement sweeps across the combat lane so consecutive
        // simulator frames show actual locomotion, dodging and automatic fire.
        // This launch argument is never used in the shipped game.
        let capturePilotMotion = ProcessInfo.processInfo.arguments.contains("-captureGameplayFrames")
        if (capturePilotMotion && (phase == .playing || phase == .gate)) ||
            (phase == .playing && (
            ProcessInfo.processInfo.arguments.contains("-captureRangedCombatFrames") ||
            ProcessInfo.processInfo.arguments.contains("-captureSurvivalSwarmFrames")
        )) {
            // Keep the real movement path running after room clear so the
            // later frames exercise portal-approach animation as well.
            let t = CGFloat(capturePilotMotion ? pilotAnimationTime : combatTime)
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
        if previewPilotWalk {
            // Two seconds of real locomotion, then two seconds of idle.
            // Review north and south separately, using the same collision path.
            let lap = pilotAnimationTime.truncatingRemainder(dividingBy: 4)
            if lap < dt {
                pilot.position = previewWalkStart
                pilotStridePhase = 0
            }
            movementTarget = lap < 2 ? previewWalkTarget : nil
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
                pilot.position = resolvePilotMovement(from: pilot.position, to: requested)
            }
        }
        // Animate the visible sprite, not its parent collision container.
        // An actual displacement check prevents walking-in-place into rubble.
        updateArenaCamera(delta: dt)
        let movementDX = pilot.position.x - pilotBeforeMovement.x
        let movementDY = pilot.position.y - pilotBeforeMovement.y
        let isMoving = hypot(movementDX, movementDY) > 0.35
        pilotTraveling = isMoving
        // Travel direction takes priority during movement; firing direction is
        // used only when stationary. Keep the collision node unrotated.
        if isMoving {
            pilotHeading = atan2(movementDY, movementDX)
            pilotAimHeading = nil
        } else if let aimHeading = pilotAimHeading {
            pilotHeading = aimHeading
        }
        pilotRenderedHeading = CharacterMotion.turnHeading(
            from: pilotRenderedHeading, toward: pilotHeading, delta: dt)
        // Distance drives stride, so faster travel animates faster while
        // pushing against blocked terrain never advances the walk cycle.
        if isMoving {
            pilotStridePhase = (pilotStridePhase + hypot(movementDX, movementDY) *
                (2 * .pi / 70)).truncatingRemainder(dividingBy: 4 * .pi)
        }
        let walkTarget: CGFloat = isMoving ? 1 : 0
        pilotWalkBlend += (walkTarget - pilotWalkBlend) * CGFloat(1 - exp(-18 * dt))
        let pose = CharacterMotion.pilot(
            time: pilotAnimationTime, moving: isMoving, facing: pilotFacing,
            timeSinceShot: pilotAnimationTime - pilotLastVisualShot,
            stridePhase: pilotStridePhase, movementBlend: pilotWalkBlend)
        pilot.zRotation = 0
        pilot.yScale = 1
        updatePilotPresentation(pose: pose)
        updateReactorOcclusion()
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
                return
            }
            // Continue orbiting the moving pilot during peaceful gate approach.
            // The combat clock is intentionally paused here, so advance the visual
            // angle from the live scene clock rather than leaving the orbs frozen.
            if !isExtracting {
                updateOrbitingDefenses()
                return
            }
            // Survival extraction continues combat and normal orbit damage.
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
        if phase == .levelUp { return }
        if presentPendingLevelUp(
            returningTo: extractionCombatActive ? .gate : .playing) { return }
        updateOrbitingDefenses()
        if phase != .playing && !extractionCombatActive { return }
        spawnClock += gameDt
        waveElapsed += gameDt
        updateTerrainHazards()
        if health <= 0 { endGame(); return }
        if phase != .playing && !extractionCombatActive { return }
        applyBurns()
        if phase == .levelUp { return }
        if presentPendingLevelUp(
            returningTo: extractionCombatActive ? .gate : .playing) { return }
        if activeEncounter == .equipmentDefense {
            let deadline = SurvivalEncounterRules.duration(world: worldMapIndex, room: wave)
            if EquipmentDefenseRules.maySpawn(elapsed: waveElapsed, duration: deadline,
                integrity: defenseIntegrity, living: enemies.count),
                spawnClock >= EquipmentDefenseRules.spawnCadence(world: worldMapIndex) {
                spawnClock -= EquipmentDefenseRules.spawnCadence(world: worldMapIndex)
                spawned += 1
                spawnEnemy(artReviewType: EquipmentDefenseRules.attackerType(
                    world: worldMapIndex, room: wave, slot: spawned))
            }
            if !roomCleared && EquipmentDefenseRules.succeeds(
                elapsed: waveElapsed, duration: deadline, integrity: defenseIntegrity) {
                completeWave()
                return
            }
        } else if activeEncounter.isTimed {
            let interval = SurvivalEncounterRules.spawnInterval(room: wave)
            if !roomCleared && SurvivalEncounterRules.canSpawn(
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
            if !roomCleared && !survivalSpawnPhaseFinished &&
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
            if pendingFlankSwarm == nil &&
               spawned < waveTarget && spawnClock >= interval {
                spawnClock -= interval
                if FlankSwarmRules.shouldWarn(
                    world: worldMapIndex, room: wave,
                    nextSlot: spawned + 1) {
                    let count = FlankSwarmRules.arrivalCount(
                        room: wave, remaining: waveTarget - spawned)
                    scheduleFlankSwarm(count: count)
                } else {
                    spawned += 1
                    spawnEnemy()
                }
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
            // Melee foes attack the device. Shooters still target the pilot.
            let pursuitTarget = activeEncounter == .equipmentDefense &&
                enemy.behavior < 4 ? defenseDevice.position : pilot.position
            let waypoint = TerrainHazards.navigationTarget(
                from: current, toward: pursuitTarget,
                patches: roomHazards, bounds: roomBounds,
                radius: enemy.radius)
            let intent = CombatRules.enemySteering(
                behavior: enemy.behavior, origin: current, pilot: waypoint,
                elapsed: combatTime, phase: enemy.weavePhase,
                ranged: ranged && waypoint == pursuitTarget,
                aiming: enemies[index].shotTarget != nil)
            let chillKey = ObjectIdentifier(enemy.node)
            let chillExpires = chilledUntil[chillKey] ?? 0
            if chillExpires > 0 && chillExpires <= combatTime {
                chilledUntil.removeValue(forKey: chillKey)
                enemy.node.childNode(withName: "frostIndicator")?.removeFromParent()
            }
            let chillMultiplier: CGFloat = chillExpires > combatTime
                ? CGFloat(FrostRoundsRules.speedMultiplier(rank: frostLevel)) : 1
            let step = enemy.speed * CGFloat(gameDt) *
                (enemy.node.name == "flankRaider"
                    ? FlankSwarmRules.speedMultiplier : 1) * chillMultiplier
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
            if activeEncounter == .equipmentDefense && enemy.behavior < 4 &&
                distance(enemy.node.position, defenseDevice.position) < enemy.radius + 28 {
                damageDefenseDevice()
                if phase != .playing { return }
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
        if activeEncounter == .tactical &&
           RoomRules.isCleared(spawned: spawned, target: waveTarget, living: enemies.count) {
            completeWave()
        }
    }

    private func damagePilot(_ amount: Int) {
        guard (phase == .playing || extractionCombatActive),
              combatTime >= pilotShieldUntil, health > 0 else { return }
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

    private func updatePilotPresentation(pose: PilotVisualPose) {
        guard let art = pilot.childNode(withName: "pilotArt") as? SKSpriteNode else { return }
        let direction = CharacterMotion.pilotDirection(
            heading: pilotRenderedHeading, previous: pilotVisualDirection)
        pilotVisualDirection = direction
        let walkFrame = previewPilotWalk && (direction == CharacterMotion.pilotSouthDirection ||
                                             direction == 4 || direction == 0 || direction == 8 || direction == 2 ||
                                             direction == 6 || direction == 10 || direction == 14)
            ? CharacterMotion.pilotWalkFrame(stridePhase: pilotStridePhase,
                                             moving: pilotTraveling) : nil
        if let walkFrame {
            if direction == 6 {
                art.texture = pilotWalkNWTextures[walkFrame]
            } else if direction == 14 {
                art.texture = pilotWalkSETextures[walkFrame]
            } else if direction == 10 {
                art.texture = pilotWalkSWTextures[walkFrame]
            } else if direction == 2 {
                art.texture = pilotWalkNETextures[walkFrame]
            } else if direction == 0 {
                art.texture = pilotWalkEastTextures[walkFrame]
            } else if direction == 8 {
                art.texture = pilotWalkWestTextures[walkFrame]
            } else if direction == 4 {
                art.texture = pilotWalkNorthTextures[walkFrame]
            } else {
                art.texture = pilotWalkPrototypeTextures[walkFrame]
            }
        } else {
            // Also restore idle when a walk stops without changing direction.
            art.texture = pilotDirectionalTextures[direction]
        }
        // Authored views must never be mirrored. Recoil follows the actual
        // firing heading while feet and collision stay in world coordinates.
        let kick = CGFloat(max(0, 1 - max(0, pilotAnimationTime - pilotLastVisualShot) / 0.17))
        let recoilHeading = pilotShotHeading
        // Authored steps already contain leg and body motion. Do not stack the
        // static-pose squash, bob and lean on top of them. Keep the same neutral
        // transform on preview idle so stopping cannot introduce a scale jump.
        let authoredPreview = previewPilotWalk
        art.position = CGPoint(x: -cos(recoilHeading) * kick * 1.5,
                               y: (authoredPreview ? 0 : pose.verticalOffset) -
                                  sin(recoilHeading) * kick * 1.5)
        art.xScale = authoredPreview ? 1 : abs(pose.widthScale)
        art.yScale = authoredPreview ? 1 : pose.heightScale
        art.zRotation = authoredPreview ? 0 : pose.lean
        art.colorBlendFactor = 0
        if previewPilotLegRigSW && direction == 10 && (pilotTraveling || pilotWalkBlend > 0.01) {
            if pilotLegRigPreview == nil || pilotLegRigPreview?.parent == nil {
                let rig = PilotLegRigPreview(texture: pilotDirectionalTextures[10], size: art.size)
                rig.zPosition = art.zPosition
                pilot.addChild(rig)
                pilotLegRigPreview = rig
            }
            pilotLegRigPreview?.position = art.position
            pilotLegRigPreview?.isHidden = false
            pilotLegRigPreview?.update(stridePhase: pilotStridePhase, movementBlend: pilotWalkBlend)
            art.isHidden = true
        } else {
            pilotLegRigPreview?.isHidden = true
            art.isHidden = false
        }
    }

    private func updateRangedAttack(at index: Int) {
        let enemy = enemies[index]
        if let target = enemy.shotTarget {
            guard combatTime >= enemy.fireAt else { return }
            enemy.node.childNode(withName: "aimLine")?.removeFromParent()
            enemy.node.childNode(withName: "aimReticle")?.removeFromParent()
            if enemy.node === bossNode && (selectedWorld.bossStyle == 1 || selectedWorld.bossStyle == 3) {
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
            // The scrapyard warden accelerates its already-telegraphed
            // three-lane volley once its armor is badly damaged. This
            // changes attack cadence, not projectile speed or warning time.
            let damagedWarden = enemy.node === bossNode &&
                worldMapIndex == 2 && selectedWorld.bossStyle == 1 &&
                scrapyardWardenEnraged
            let baseCooldown = CombatRules.shooterCooldown(room: wave)
            enemies[index].nextAttack = combatTime +
                (damagedWarden ? max(1.4, baseCooldown * 0.78) : baseCooldown)
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
                if enemy.node === bossNode && selectedWorld.bossStyle == 3 {
                    let flank = FrontierGuardianRules.flankTarget(pilot: pilot.position, bounds: roomBounds)
                    launchLob(from: enemy.node.position, target: flank)
                }
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
                // The scrapyard boss has a distinct orange warning language.
                // Keep all three volley lanes visible for the full wind-up.
                let wardenOverdrive = enemy.node === bossNode &&
                    worldMapIndex == 2 && scrapyardWardenEnraged
                aim.strokeColor = wardenOverdrive
                    ? .systemOrange.withAlphaComponent(0.95)
                    : .systemPink.withAlphaComponent(0.85)
                aim.lineWidth = wardenOverdrive ? 3.5 : 3
                aim.zPosition = 6
                enemy.node.addChild(aim)
                if enemy.node === bossNode && (selectedWorld.bossStyle == 1 || selectedWorld.bossStyle == 3) {
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
                        side.strokeColor = wardenOverdrive
                            ? .systemOrange.withAlphaComponent(0.9)
                            : .systemCyan.withAlphaComponent(0.78)
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
                    if worldMapIndex == 0 && guardianArmorBroken {
                        // The exposed guardian sends a second, separately
                        // telegraphed blast down one flank. A lateral dodge
                        // remains possible; there is no instant area damage.
                        let secondary = FrontierGuardianRules.flankTarget(
                            pilot: pilot.position, bounds: roomBounds)
                        launchLob(from: enemy.node.position, target: secondary)
                    }
                }
            }
        }
    }

    private func fireProjectile(from origin: CGPoint, toward target: CGPoint) {
        let dx = target.x - origin.x
        let dy = target.y - origin.y
        let length = max(1, hypot(dx, dy))
        let node = SKShapeNode(circleOfRadius: 6)
        node.fillColor = wave == worldWaveCount ? BossArtwork.colors[min(3, worldMapIndex)] : .systemPink
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
        for _ in 0..<orbitLevel {
            let blade = SKShapeNode(circleOfRadius: 10)
            blade.name = "energyOrbit"
            blade.fillColor = SKColor(red: 0.04, green: 0.43, blue: 0.64, alpha: 1)
            blade.strokeColor = SKColor(red: 0.23, green: 0.89, blue: 1, alpha: 0.9)
            blade.lineWidth = 1.2
            blade.glowWidth = 2.5
            blade.zPosition = 11
            let core = SKShapeNode(circleOfRadius: 5)
            core.name = "energyOrbitCore"
            core.fillColor = SKColor(red: 0.72, green: 0.99, blue: 1, alpha: 1)
            core.strokeColor = .clear
            core.glowWidth = 1.5
            core.zPosition = 0.2
            blade.addChild(core)
            let glint = SKShapeNode(circleOfRadius: 1.8)
            glint.position = CGPoint(x: -2.5, y: 2.5)
            glint.fillColor = .white
            glint.strokeColor = .clear
            glint.zPosition = 0.3
            blade.addChild(glint)
            // Local +x follows the tangent set by the orbit updater. A short
            // dotted wake shows travel without painting a persistent ring.
            for index in 0..<3 {
                let wake = SKShapeNode(circleOfRadius: 2.4 - CGFloat(index) * 0.55)
                wake.name = "energyOrbitWake"
                wake.position = CGPoint(x: -13 - CGFloat(index) * 6,
                                        y: CGFloat(index * index))
                wake.fillColor = SKColor.cyan.withAlphaComponent(0.42 - CGFloat(index) * 0.11)
                wake.strokeColor = .clear
                wake.zPosition = -0.1
                blade.addChild(wake)
            }
            blade.isHidden = energyWheelEvolved
            arena.addChild(blade)
            orbitalNodes.append(blade)
        }
    }

    /// Called only after a separately selected, eligible evolution. Existing
    /// Orbit players retain discrete blades until that selection occurs.
    private func activateEnergyWheel(masteryLevel: Int, world: Int,
                                     synergyRank: Int,
                                     restoringSavedEvolution: Bool = false) -> Bool {
        guard !energyWheelEvolved,
              (restoringSavedEvolution
                ? (orbitLevel >= 3 && chainLevel >= 2 && world >= 3)
                : TacticalDraftRules.canEvolve("orbit", rank: orbitLevel,
                                               masteryLevel: masteryLevel,
                                               world: world,
                                               synergyRank: synergyRank)) else { return false }
        energyWheelEvolved = true
        for blade in orbitalNodes { blade.isHidden = true }
        // Defensive cleanup also covers scene restoration/reentry.
        energyWheelNode?.removeFromParent()
        let wheel = SKShapeNode(circleOfRadius: 82)
        wheel.name = "energyWheel"
        wheel.fillColor = .clear
        wheel.strokeColor = SKColor(red: 0.20, green: 0.88, blue: 1, alpha: 0.85)
        wheel.lineWidth = 14
        wheel.glowWidth = 5
        // A perfect circle looks stationary when rotated. Four bright
        // segments give the evolved wheel an unmistakable spinning motion.
        for index in 0..<4 {
            let startAngle = CGFloat(index) * (.pi / 2)
            let endAngle = startAngle + (.pi / 5)
            let arcPath = CGMutablePath()
            arcPath.addArc(center: .zero, radius: 82,
                           startAngle: startAngle, endAngle: endAngle,
                           clockwise: false)
            let accent = SKShapeNode(path: arcPath)
            accent.strokeColor = SKColor(red: 0.88, green: 1, blue: 1, alpha: 1)
            accent.lineWidth = 17
            accent.glowWidth = 7
            accent.zPosition = 1
            wheel.addChild(accent)
        }
        wheel.zPosition = 11
        wheel.position = pilot.position
        arena.addChild(wheel)
        energyWheelNode = wheel
        lastEnergyWheelHit.removeAll()
        return true
    }

    private func updateEnergyWheel() {
        guard energyWheelEvolved, let wheel = energyWheelNode else { return }
        wheel.position = pilot.position
        wheel.zRotation = CGFloat(combatTime * 2.65)
        for index in enemies.indices {
            let enemy = enemies[index]
            guard enemy.health > 0, combatTime >= enemy.activeAt,
                  CombatRules.energyWheelHits(pilot: pilot.position,
                                              enemy: enemy.node.position,
                                              enemyRadius: enemy.radius,
                                              wheelRadius: 82, bandWidth: 14) else { continue }
            let key = ObjectIdentifier(enemy.node)
            guard combatTime - (lastEnergyWheelHit[key] ?? -100) >= 0.50 else { continue }
            lastEnergyWheelHit[key] = combatTime
            enemies[index].health -= 1 + orbitLevel +
                permanent.rank("orbit") + gearReactorBonus
            impact(at: enemy.node.position, color: .systemCyan,
                   destroyed: enemies[index].health <= 0)
            EnemyCombatFeedback.hit(enemies[index].node, from: pilot.position)
            updateEnemyHealthBar(at: index)
            // Retain the Arc Blades combination when the individual orbiting
            // projectiles evolve. Evolution must not remove earned synergies.
            let reach = AbilitySynergies.bladeArcReach(
                chain: chainLevel, orbit: orbitLevel)
            if reach > 0, combatTime >= nextBladeArcAt,
               let arcIndex = enemies.indices
                .filter({ $0 != index && enemies[$0].health > 0 &&
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
        removeDefeatedEnemies()
        updateHUD()
    }

    private func updateOrbitingDefenses() {
        guard orbitLevel > 0,
              (phase == .playing || extractionCombatActive || roomCleared) else { return }
        if energyWheelEvolved {
            updateEnergyWheel()
            return
        }
        guard !orbitalNodes.isEmpty else { return }
        // All positions derive from the same paused combat clock as hostile
        // projectiles. No free orbital strikes while choosing a level-up.
        for (index, blade) in orbitalNodes.enumerated() {
            let angle = CGFloat(phase == .gate && !extractionCombatActive ? clock : combatTime) * 2.65 +
                CGFloat(index) * (2 * .pi / CGFloat(orbitalNodes.count))
            blade.position = CGPoint(
                x: pilot.position.x + cos(angle) * 82,
                y: pilot.position.y + sin(angle) * 82
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

    private func applyFrost(to index: Int) {
        guard frostLevel > 0, enemies.indices.contains(index),
              enemies[index].health > 0, enemies[index].node !== bossNode else {
            return
        }
        let foe = enemies[index]
        let key = ObjectIdentifier(foe.node)
        chilledUntil[key] = combatTime + FrostRoundsRules.duration(rank: frostLevel)
        let indicator: SKShapeNode
        if let old = foe.node.childNode(withName: "frostIndicator") as? SKShapeNode {
            indicator = old
        } else {
            indicator = SKShapeNode(circleOfRadius: foe.radius + 5)
            indicator.name = "frostIndicator"
            indicator.fillColor = .systemCyan.withAlphaComponent(0.12)
            indicator.strokeColor = SKColor(red: 0.60, green: 0.92,
                                            blue: 1.00, alpha: 0.94)
            indicator.lineWidth = 2.2
            indicator.glowWidth = 2.5
            indicator.zPosition = 4
            foe.node.addChild(indicator)
        }
        indicator.alpha = 1
        impact(at: foe.node.position, color: .systemCyan, destroyed: false)
    }

    private func shoot(at point: CGPoint, selectedIndex index: Int) {
        guard combatTime - lastShot >= 0.42 / Double(fireRate + permanentRateBonus) else { return }
        guard enemies.indices.contains(index), enemies[index].health > 0,
              combatTime >= enemies[index].activeAt,
              distance(enemies[index].node.position, point) < 45 else { return }
        lastShot = combatTime
        pilotLastVisualShot = pilotAnimationTime
        let target = enemies[index].node.position
        let shotAngle = atan2(target.y - pilot.position.y, target.x - pilot.position.x)
        pilotShotHeading = shotAngle
        if !pilotTraveling {
            pilotAimHeading = shotAngle
        }
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
        // Elemental hits must read differently from ordinary kinetic shots.
        let hitColor: SKColor = explosiveLevel > 0 ? .systemOrange :
            (incendiaryLevel > 0 ? .systemRed :
             (chainLevel > 0 ? .systemCyan : .systemYellow))
        impact(at: target, color: hitColor,
               destroyed: enemies[index].health <= totalBulletDamage)
        enemies[index].health -= totalBulletDamage
        EnemyCombatFeedback.hit(enemies[index].node, from: pilot.position)
        if incendiaryLevel > 0 {
            burns[ObjectIdentifier(enemies[index].node)] = (damage: incendiaryLevel + permanentReactorBonus + gearReactorBonus + permanent.rank("incendiary"), until: combatTime + AbilitySynergies.burnDuration(
                incendiary: incendiaryLevel, explosive: explosiveLevel),
                nextTick: combatTime + 0.5)
            CombatVisuals.markBurning(enemies[index].node, radius: enemies[index].radius)
        }
        if frostLevel > 0 { applyFrost(to: index) }
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

    private func updateFrontierGuardianPhase() {
        guard worldMapIndex == 0, wave == worldWaveCount, !roomCleared,
              let bossNode,
              let index = enemies.firstIndex(where: { $0.node === bossNode }) else { return }
        let threshold = FrontierGuardianRules.armorBreakHealth(
            maxHealth: enemies[index].maxHealth)
        if FrontierGuardianRules.shouldBreakArmor(
            health: enemies[index].health, maxHealth: enemies[index].maxHealth,
            alreadyBroken: guardianArmorBroken) {
            guardianArmorBroken = true
            // One bounded reinforcement wave at the phase transition.
            // These are ordinary enemies, never duplicate boss entities.
            if !guardianSupportDeployed && !isCaptureMode {
                guardianSupportDeployed = true
                for role in [0, 2, 0] {
                    spawnEnemy(artReviewType: role)
                }
            }
            guardianTransitionUntil = combatTime + FrontierGuardianRules.transitionSeconds
            enemies[index].health = threshold
            BossArtwork.enrage(bossNode)
            let alert = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            alert.name = "guardianCoreAwakened"
            alert.text = "CORE EXPOSED"
            alert.fontColor = .systemYellow
            alert.fontSize = 16
            alert.position.y = 86
            alert.zPosition = 17
            bossNode.addChild(alert)
            alert.run(.sequence([
                .wait(forDuration: 1.8),
                .fadeOut(withDuration: 0.30),
                .removeFromParent()
            ]))
            // Break open two clearly warned, independent impact zones.
            // Neither marker chases the player after the positions lock.
            let primary = pilot.position
            let secondary = FrontierGuardianRules.flankTarget(
                pilot: primary, bounds: roomBounds)
            launchLob(from: bossNode.position, target: primary)
            launchLob(from: bossNode.position, target: secondary)
        }
        // Even a heavily upgraded weapon cannot skip the first phase-two
        // impact. The short safeguard uses the existing paused combat clock,
        // and ends without creating another hidden boss-health pool.
        if guardianArmorBroken && combatTime < guardianTransitionUntil {
            enemies[index].health = max(threshold, enemies[index].health)
        }
        updateEnemyHealthBar(at: index)
    }

    private func updateScrapyardWardenPhase() {
        guard worldMapIndex == 2, wave == worldWaveCount,
              !scrapyardWardenEnraged, !roomCleared,
              let bossNode,
              let enemy = enemies.first(where: { $0.node === bossNode }),
              enemy.health > 0, enemy.health * 2 <= enemy.maxHealth else { return }
        scrapyardWardenEnraged = true
        // The overdrive phase is authoritative for both the visual warning
        // and the faster volley cadence. Avoid a silent speed-up before the
        // player has received the phase-change cue.
        BossArtwork.enrage(bossNode)
        let alert = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        alert.name = "scrapyardOverdriveWarning"
        alert.text = "OVERDRIVE"
        alert.fontSize = 15
        alert.fontColor = .systemOrange
        alert.position.y = 98
        alert.zPosition = 16
        bossNode.addChild(alert)
        alert.run(.sequence([
            .wait(forDuration: 1.7),
            .fadeOut(withDuration: 0.3),
            .removeFromParent()
        ]))
    }

    private func removeDefeatedEnemies() {
        updateFrontierGuardianPhase()
        updateScrapyardWardenPhase()
        var defeatedCount = 0
        var paidXPTotal = 0
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
            paidXPTotal += paidXP
            burns.removeValue(forKey: ObjectIdentifier(enemies[index].node))
            chilledUntil.removeValue(forKey: ObjectIdentifier(enemies[index].node))
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
        if paidXPTotal > 0 {
            // One accumulating toast per kill burst keeps XP feedback out
            // of enemy silhouettes. Rewards above are still paid per kill.
            let existing = arena.childNode(withName: "combatXPSummary") as? SKLabelNode
            let toast = existing ?? SKLabelNode(fontNamed: "AvenirNext-DemiBold")
            let total = (toast.userData?["amount"] as? Int ?? 0) + paidXPTotal
            toast.userData = NSMutableDictionary(dictionary: ["amount": total])
            toast.name = "combatXPSummary"
            toast.text = "+\(total) XP"
            toast.fontSize = 11
            toast.fontColor = .systemCyan
            toast.position = CGPoint(x: pilot.position.x, y: pilot.position.y + 57)
            toast.zPosition = 14
            toast.alpha = 1
            toast.removeAction(forKey: "xpToast")
            if existing == nil { arena.addChild(toast) }
            toast.run(.sequence([
                .wait(forDuration: 0.25),
                .group([.moveBy(x: 0, y: 12, duration: 0.35),
                        .fadeOut(withDuration: 0.35)]),
                .removeFromParent()
            ]), withKey: "xpToast")
        }
        if defeatedCount > 0 { saveRunRecovery() }
        // Pause for a level-up as soon as the earned XP crosses a threshold,
        // even when other enemies remain in the current room.
        if (phase == .playing || extractionCombatActive) &&
           progress.pendingChoices > 0 {
            let destination: Phase = extractionCombatActive ? .gate : .playing
            updateHUD()
            _ = presentPendingLevelUp(returningTo: destination)
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
        if activeEncounter == .survival {
            survivalSpawnPhaseFinished = true
        }
        clearHostileAttacks()
        let completionSalvage = activeEncounter == .equipmentDefense
            ? EquipmentDefenseRules.completionSalvage(room: wave, integrity: defenseIntegrity)
            : PersistentProgression.roomReward(room: wave)
        bankSalvage(completionSalvage)
        if activeEncounter == .equipmentDefense {
            markDefenseDeviceResolved()
            // Timer completion, never enemy elimination. Remove remaining foes
            // without awarding XP, coins or Salvage for unearned kills.
            for enemy in enemies { enemy.node.removeFromParent() }
            enemies.removeAll()
            for drop in xpDrops { drop.node.removeFromParent() }
            xpDrops.removeAll()
        }
        if activeEncounter != .survival {
            awardRoomCoins(CampaignPacing.clearCoins(room: wave))
            collectXP(collectAll: true)
            awardRoomXP(CampaignPacing.clearXP(room: wave))
        }
        // Survival grants normal kill rewards, never timed-exit XP or coins.
        let destination: Phase = wave == worldWaveCount ? .worldComplete : .gate
        if !isCaptureMode && progress.claimMastery(room: wave) {
            _ = playerMastery.awardClearedRoom(wave)
        }
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
        // Reserve separate rows for tactical slots and the resume hint.
        // The old footer crossed the circles at y=-220 on real devices.
        overlayBackdrop.path = CGPath(roundedRect: CGRect(
            x: -min(size.width - 28, 390) / 2, y: -278,
            width: min(size.width - 28, 390), height: 463),
            cornerWidth: 18, cornerHeight: 18, transform: nil)
        let choiceLevel = progress.level - progress.pendingChoices + 1
        overlayText("LEVEL \(choiceLevel)!", y: 125, fontSize: 28)
        overlayText("RANDOM DRAW • CHOOSE ONE", y: 87, fontSize: 15)
        overlayText("MASTERY \(playerMastery.level)", y: 67, fontSize: 10)
        // Each filled circle represents an equipped tactical ability, not a
        // stat upgrade. A third slot appears only when mastery permits it.
        let slotIcons = ["chain": "ARC", "explosive": "AOE",
                         "incendiary": "HOT", "orbit": "ORB", "frost": "ICE"]
        let slots = max(2, playerMastery.capacity)
        for index in 0..<slots {
            let circle = SKShapeNode(circleOfRadius: 16)
            circle.name = "tacticalSlot\(index)"
            circle.position = CGPoint(
                x: CGFloat(index) * 43 - CGFloat(slots - 1) * 21.5,
                y: -220)
            circle.fillColor = index < lockedLoadout.selected.count
                ? SKColor(red: 0.12, green: 0.42, blue: 0.61, alpha: 0.95)
                : SKColor(red: 0.10, green: 0.14, blue: 0.20, alpha: 0.85)
            circle.strokeColor = index < lockedLoadout.selected.count
                ? .systemCyan : SKColor(white: 0.65, alpha: 0.8)
            circle.lineWidth = 2
            let icon = SKLabelNode(fontNamed: "AvenirNext-Heavy")
            icon.fontSize = 9
            icon.fontColor = .white
            icon.verticalAlignmentMode = .center
            icon.text = index < lockedLoadout.selected.count
                ? (slotIcons[lockedLoadout.selected[index]] ?? "●") : "+"
            circle.addChild(icon)
            overlay.addChild(circle)
        }
        // Always offer at least three meaningful *stat* choices even
        // when all tactical ranks and rate/mobility caps are reached.
        var pool = TacticalDraftRules.baseStatChoices
        if fireRate < 5 { pool.append("rate") }
        if mobilityRank < 5 { pool.append("mobility") }
        let tacticalOptions = lockedLoadout.availableTacticalUpgrades(
            chain: chainLevel, explosive: explosiveLevel,
            incendiary: incendiaryLevel, orbit: orbitLevel,
            frost: frostLevel, capacity: playerMastery.capacity)
        pool += tacticalOptions
        let orbitEvolutionAvailable = TacticalDraftRules.evolutionChoices(
            for: lockedLoadout, ranks: ["orbit": orbitLevel],
            masteryLevel: playerMastery.level, world: worldMapIndex + 1,
            synergyRanks: ["orbit": min(chainLevel, orbitLevel)],
            alreadyEvolved: energyWheelEvolved ? Set(["orbit"]) : Set<String>()
        ).contains("orbit")
        if orbitEvolutionAvailable { pool.append("evolveOrbit") }
        if health < maximumHealth { pool.append("heal") }
        // Three weighted nonduplicate cards. Rare/Epic traits are never
        // guaranteed; stat picks remain useful when waiting for a trait.
        var choices: [String] = []
        var available = pool
        while choices.count < 3 && !available.isEmpty {
            guard let next = TacticalDraftRules.pick(
                from: available, roll: Int.random(in: 0..<100_000)) else { break }
            choices.append(next)
            available.removeAll { $0 == next }
        }
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
            case "mobility":
                label = "MOBILITY \(mobilityRank) → \(mobilityRank + 1)"
                detail = "Move slightly faster when dodging"
                category = "MOVEMENT"
                symbol = "MOV"
                tint = SKColor(red: 0.36, green: 0.83, blue: 0.87, alpha: 1)
            case "supplies":
                label = "SUPPLY CACHE +40 COINS"
                detail = "Bank coins for repairs during this run"
                category = "SUPPLIES"
                symbol = "CR"
                tint = SKColor(red: 0.81, green: 0.74, blue: 0.38, alpha: 1)
            case "chain":
                label = "EPIC • CHAIN LIGHTNING  LV \(chainLevel + 1)"
                detail = AbilitySynergies.preview(
                    ability: "chain", chain: chainLevel,
                    explosive: explosiveLevel, incendiary: incendiaryLevel,
                    orbit: orbitLevel) ?? "Hits additional nearby enemies"
                category = "TACTICAL"
                symbol = "ARC"
                tint = SKColor(red: 0.51, green: 0.74, blue: 1, alpha: 1)
            case "explosive":
                label = "RARE • EXPLOSIVE ROUNDS  LV \(explosiveLevel + 1)"
                detail = AbilitySynergies.preview(
                    ability: "explosive", chain: chainLevel,
                    explosive: explosiveLevel, incendiary: incendiaryLevel,
                    orbit: orbitLevel) ?? "Weapon hits splash nearby enemies"
                category = "ORDNANCE"
                symbol = "AOE"
                tint = SKColor(red: 1, green: 0.57, blue: 0.38, alpha: 1)
            case "incendiary":
                label = "COMMON • INCENDIARY  LV \(incendiaryLevel + 1)"
                detail = AbilitySynergies.preview(
                    ability: "incendiary", chain: chainLevel,
                    explosive: explosiveLevel, incendiary: incendiaryLevel,
                    orbit: orbitLevel) ?? "Weapon hits inflict lasting burn damage"
                category = "ORDNANCE"
                symbol = "HOT"
                tint = SKColor(red: 1, green: 0.57, blue: 0.38, alpha: 1)
            case "frost":
                label = "COMMON • FROST ROUNDS  LV \(frostLevel + 1)"
                detail = "Chill targets to slow their approach"
                category = "CONTROL"
                symbol = "ICE"
                tint = SKColor(red: 0.46, green: 0.84, blue: 1, alpha: 1)
            case "evolveOrbit":
                label = "LEGENDARY • ENERGY WHEEL"
                detail = "Evolve orbiting spheres into a continuous ring"
                category = "EVOLUTION"
                symbol = "WHEEL"
                tint = SKColor(red: 0.40, green: 0.94, blue: 1, alpha: 1)
            case "orbit":
                label = "RARE • ENERGY ORBIT  LV \(orbitLevel + 1)"
                detail = AbilitySynergies.preview(
                    ability: "orbit", chain: chainLevel,
                    explosive: explosiveLevel, incendiary: incendiaryLevel,
                    orbit: orbitLevel) ?? "Wide energy orbs strike nearby foes"
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
            // Card rim always signals rarity for abilities; its interior
            // icon retains the effect-specific color.
            let rimTint: SKColor
            switch TacticalDraftRules.rarity(for: choice) {
            case .common: rimTint = SKColor(white: 0.78, alpha: 1)
            case .rare: rimTint = SKColor(red: 0.32, green: 0.62, blue: 1, alpha: 1)
            case .epic: rimTint = SKColor(red: 0.73, green: 0.44, blue: 1, alpha: 1)
            case .legendary: rimTint = SKColor(red: 1, green: 0.74, blue: 0.25, alpha: 1)
            case nil: rimTint = tint
            }
            card.strokeColor = rimTint.withAlphaComponent(0.86)
            card.lineWidth = 1.8
            card.zPosition = 1
            overlay.addChild(card)

            // A restrained lower-edge light reflects the upgrade's function;
            // the same weight is given to each of the three random choices.
            let lowerEdge = SKShapeNode(rect: CGRect(
                x: -cardWidth / 2 + 13, y: cardCenterY - 33,
                width: cardWidth - 26, height: 2), cornerRadius: 1)
            lowerEdge.fillColor = rimTint.withAlphaComponent(0.30)
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
            categoryLabel.fontColor = rimTint
            categoryLabel.horizontalAlignmentMode = .right
            categoryLabel.position = CGPoint(
                x: cardWidth / 2 - 14, y: cardCenterY + 24)
            categoryLabel.zPosition = 3
            overlay.addChild(categoryLabel)
            overlayButtons[choice] = frame
        }
        overlayText("COMBAT PAUSED  •  SELECT TO RESUME", y: -262,
                    fontSize: 11, name: "levelUpFooter")
        #if targetEnvironment(simulator)
        if let footer = overlay.childNode(withName: "levelUpFooter") {
            for index in 0..<slots {
                if let slot = overlay.childNode(withName: "tacticalSlot\(index)") {
                    precondition(!slot.calculateAccumulatedFrame().intersects(footer.frame),
                                 "Tactical slots must not overlap the level-up footer")
                }
            }
        }
        #endif
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
        guard phase == .levelUp, levelChoices.contains(choice),
              progress.pendingChoices > 0 else { return }
        // New abilities permanently occupy one of two beginner slots.
        // Existing skills can be ranked without consuming another slot.
        if AbilityLoadout.catalog.contains(choice),
           !lockedLoadout.contains(choice),
           !lockedLoadout.acquire(choice, capacity: playerMastery.capacity) {
            return
        }
        // Never consume an upgrade on a stale or no-longer-eligible evolution.
        if choice == "evolveOrbit" {
            guard TacticalDraftRules.canEvolve(
                "orbit", rank: orbitLevel,
                masteryLevel: playerMastery.level, world: worldMapIndex + 1,
                synergyRank: min(chainLevel, orbitLevel)),
                !energyWheelEvolved else { return }
        }
        guard progress.chooseUpgrade() else { return }
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
        case "mobility": mobilityRank = min(5, mobilityRank + 1)
        case "supplies": coins += 40
        case "chain": chainLevel = min(3, chainLevel + 1)
        case "explosive": explosiveLevel = min(3, explosiveLevel + 1)
        case "incendiary": incendiaryLevel = min(3, incendiaryLevel + 1)
        case "frost": frostLevel = min(3, frostLevel + 1)
        case "orbit":
            orbitLevel = min(3, orbitLevel + 1)
            rebuildOrbitingDefenses()
        case "evolveOrbit":
            _ = activateEnergyWheel(masteryLevel: playerMastery.level,
                                    world: worldMapIndex + 1,
                                    synergyRank: min(chainLevel, orbitLevel))
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
            : (activeEncounter == .equipmentDefense
                ? EquipmentDefenseRules.succeeds(
                    elapsed: waveElapsed,
                    duration: SurvivalEncounterRules.duration(
                        world: worldMapIndex, room: wave),
                    integrity: defenseIntegrity)
                : RoomRules.isCleared(
                    spawned: spawned, target: waveTarget, living: enemies.count))) {
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
        if extractionPortal.isHidden {
            extractionPortal.position = TerrainHazards.extractionPosition(
                near: pilot.position, in: roomBounds, patches: roomHazards)
        }
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
        zoneBanner.text = "SURVIVAL COMPLETE  •  REACH ORB"
        zoneBanner.fontColor = .systemCyan
        zoneBanner.alpha = 1
        // Keep the status underneath both corner controls, not in their row.
        zoneBanner.position = CGPoint(x: size.width / 2, y: size.height - 275)
        zoneBanner.fontSize = 13
        // Status is already in the HUD and on the illuminated portal. The
        // previous full-screen instruction obscured the portal itself.
        warning.removeAllActions()
        warning.isHidden = true
        controlsHint.isHidden = true
        updateHUD()
        saveRunRecovery()
    }

    private func showZoneGate() {
        if activeEncounter == .survival {
            showExtractionPortal()
            return
        }
        guard (activeEncounter == .equipmentDefense && roomCleared) ||
            RoomRules.isCleared(spawned: spawned, target: waveTarget, living: enemies.count) else { return }
        if activeEncounter == .equipmentDefense { markDefenseDeviceResolved() }
        phase = .gate
        arena.isPaused = false
        heldTouch = nil
        movementOrigin = nil
        movementTarget = nil
        clearOverlay()
        overlayBackdrop.isHidden = true
        // Exactly one exit is visible: tactical and defense rooms use the
        // upright campaign portal, never the timed-survival rescue orb.
        extractionPortal.isHidden = true
        passageGate.isHidden = false
        passageGate.fillColor = SKColor(red: 0.045, green: 0.12, blue: 0.25, alpha: 1)
        (passageGate.children.first(where: { $0 is SKLabelNode }) as? SKLabelNode)?.text = "ENTER"
        passageGate.childNode(withName: "gateArrow")?.isHidden = false
        passageGate.alpha = 1
        passageGate.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.position = CGPoint(x: 0, y: -24)
        passageGate.childNode(withName: "gateArrow")?.run(.repeatForever(.sequence([.moveBy(x: 0, y: 7, duration: 0.45), .moveBy(x: 0, y: -7, duration: 0.45)])))
        // Pulse only the portal energy, keeping its metal doorway solid.
        let energy = passageGate.childNode(withName: "portalEnergy")
        energy?.removeAllActions()
        energy?.run(.repeatForever(.sequence([
            .fadeAlpha(to: 0.35, duration: 0.65),
            .fadeAlpha(to: 0.88, duration: 0.65)
        ])))
        warning.text = activeEncounter == .equipmentDefense
            ? (defenseIntegrity > 0 ? "REACTOR SECURED — ENTER PORTAL"
                : "BONUS LOST — ENTER PORTAL")
            : (wave == 1 ? "ROOM CLEAR — ENTER PORTAL" : "ROOM CLEAR — PORTAL OPEN")
        controlsHint.isHidden = true
        warning.fontColor = activeEncounter == .equipmentDefense && defenseIntegrity == 0
            ? .systemOrange : .systemGreen
        warning.fontSize = 13
        warning.position = CGPoint(x: passageGate.position.x, y: passageGate.position.y - 52)
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
        _ = enterSelectedWorld()
    }

    private func completeWorld() {
        phase = .worldComplete
        ArcadeMusic.shared.play(.headquarters)
        lockMenuBriefly()
        clearOverlay()
        if !isCaptureMode {
            _ = WorldCatalog.recordBestRoom(worldMapIndex, room: worldWaveCount)
        }
        awardWorldCompletionCores(stars: progress.stars(forWorld: worldMapIndex))
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
        let stars = progress.stars(forWorld: worldMapIndex)
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
        if restorationReturnPhase != .worldComplete {
            installHubShell(active: "nav_pilot")
        }
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

    private func endGame(_ reason: String = "PILOT DEFEATED") {
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
        overlayText(reason, y: 97)
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
        pendingFlankSwarm = nil
        arena.children.filter { $0.name == "flankSwarmWarning" }
            .forEach { $0.removeFromParent() }
        bossNode = nil
        guardianArmorBroken = false
        guardianSupportDeployed = false
        scrapyardWardenEnraged = false
        guardianTransitionUntil = 0
        defenseDevice.removeFromParent()
        defenseIntegrity = EquipmentDefenseRules.maximumIntegrity
        nextDefenseHitAt = 0
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
        pilotTraveling = false
        pilotAnimationTime = 0
        pilotLastVisualShot = -10
        pilotRenderedHeading = -.pi / 2
        pilotStridePhase = 0
        pilotWalkBlend = 0
        pilotShotHeading = -.pi / 2
        pilotHeading = -.pi / 2
        pilotAimHeading = nil
        pilotVisualDirection = CharacterMotion.pilotSouthDirection
        if let art = pilot.childNode(withName: "pilotArt") as? SKSpriteNode {
            art.texture = pilotDirectionalTextures[CharacterMotion.pilotSouthDirection]
        }
        nextFootstepAt = 0
        pilot.removeAction(forKey: "hitFlash")
        pilot.childNode(withName: "pilotArt")?.xScale = 1
        pilot.childNode(withName: "pilotArt")?.yScale = 1
        passageGate.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.removeAllActions()
        passageGate.childNode(withName: "gateArrow")?.position = CGPoint(x: 0, y: -24)
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
        mobilityRank = 0
        chainLevel = 0
        explosiveLevel = 0
        incendiaryLevel = 0
        frostLevel = 0
        orbitLevel = 0
        energyWheelEvolved = false
        energyWheelNode?.removeFromParent()
        energyWheelNode = nil
        lastEnergyWheelHit.removeAll()
        chilledUntil.removeAll()
        lastOrbitalHit.removeAll()
        nextBladeArcAt = 0
        rebuildOrbitingDefenses()
        burns.removeAll()
        chilledUntil.removeAll()
        heldTouch = nil
        aimPoint = nil
        lastShot = -100
        streak = 0
        updateHUD()
        draftLoadout = AbilityLoadout()
        lockedLoadout = AbilityLoadout()
        showReady()
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
        let local = touch.location(in: overlay)
        let tapped = overlayButtons.first(where: { $0.value.contains(local) })?.key
        if (phase == .worldSelect || phase == .ready), tapped == nil {
            worldMapSwipeStart = point
            worldMapSwipeMoved = false
        }
        menuNeedsFreshTouch = false
        if [Phase.ready, .worldSelect, .headquarters, .gearBay, .abilityLab, .loadout, .restoration].contains(phase) {
            switch tapped {
            case "nav_home": showReady(); return
            case "nav_gear": showGearBay(); return
            case "nav_abilities": showAbilityLab(); return
            case "nav_pilot": showHeadquarters(); return
            default: break
            }
        }
        switch (phase, tapped) {
        case (.settings, "toggle_music"):
            ArcadeMusic.shared.toggle()
            showSettings()
        case (.settings, "toggle_speed"):
            toggleSpeedPreference()
            showSettings()
        case (.settings, "end_run") where settingsReturnPhase == .playing || settingsReturnPhase == .gate:
            endRunConfirmationVisible = true
            showSettings()
        case (.settings, "cancel_end_run"):
            endRunConfirmationVisible = false
            showSettings()
        case (.settings, "confirm_end_run"): confirmEndRun()
        case (.settings, "close_settings"): closeSettings()
        case (.interrupted, "resume_run"): resumeInterruptedRun()
        case (.ready, "recover_run"), (.worldSelect, "recover_run"):
            recoverSavedRun()
        case (.ready, "worlds"): showWorldSelector()
        case (.worldSelect, "home"): showReady()
        case (.ready, "gear_bay"): showGearBay()
        case (.ready, "ability_lab"): showAbilityLab()
        case (.ready, "headquarters"): showHeadquarters()
        case (.headquarters, "discard_run"): discardSavedRun()
        case (.headquarters, "switch_pilot"):
            profileSwitchArmed = true
            showHeadquarters()
        case (.headquarters, "cancel_pilot_switch"):
            profileSwitchArmed = false
            showHeadquarters()
        case (.headquarters, "confirm_pilot_switch") where profileSwitchArmed:
            switchPilotProfile()
        case (.gameOver, "headquarters"), (.worldComplete, "headquarters"):
            // Failed/completed runs must reset before choosing another world.
            // The already-banked Salvage and purchased gear persist.
            restart()
            showHeadquarters()
        case (.headquarters, "gear_bay"): showGearBay()
        case (.headquarters, "ability_lab"): showAbilityLab()
        case (.headquarters, "restore"): showRestoration()
        case (.headquarters, "hq_back"): showReady()
        case (.gearBay, "hq_back"), (.abilityLab, "hq_back"): showReady()
        case (.gearBay, let key?) where key.hasPrefix("buy_"):
            purchasePermanentUpgrade(String(key.dropFirst(4)))
        case (.abilityLab, let key?) where key.hasPrefix("buy_"):
            purchasePermanentUpgrade(String(key.dropFirst(4)))
        case (.ready, "start"), (.worldSelect, "start")
            where WorldCatalog.unlocked(worldMapIndex) &&
                  worldMapIndex < WorldCatalog.playableCount && recovery.load() == nil:
            _ = enterSelectedWorld()
        case (.ready, "world_prev"), (.worldSelect, "world_prev"):
            worldMapIndex = max(0, worldMapIndex - 1)
            showWorldSelector()
        case (.ready, "world_next"), (.worldSelect, "world_next"):
            worldMapIndex = min(WorldCatalog.worlds.count - 1, worldMapIndex + 1)
            showWorldSelector()
        case (.ready, "restore"), (.worldComplete, "restore"): showRestoration()
        case (.restoration, "back"):
            if restorationReturnPhase == .worldComplete { showWorldCompleteSummary() }
            else if restorationReturnPhase == .headquarters { showHeadquarters() }
            else { showReady() }
        case (.restoration, let key?) where key.hasPrefix("branch_"):
            if let index = Int(key.dropFirst(7)) { investCore(index) }
        case (.worldComplete, "next_world"): advanceToNextWorld()
        case (.gameOver, "restart"), (.worldComplete, "restart"):
            restart()
            _ = enterSelectedWorld()
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
        if (phase == .worldSelect || phase == .ready), let start = worldMapSwipeStart, let touch = touches.first {
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
        if (phase == .worldSelect || phase == .ready), let start = worldMapSwipeStart, let touch = touches.first {
            let dx = touch.location(in: self).x - start.x
            if abs(dx) > 65 {
                worldMapIndex = min(WorldCatalog.worlds.count - 1, max(0, worldMapIndex + (dx < 0 ? 1 : -1)))
                if phase == .ready { showReady() } else { showWorldSelector() }
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

