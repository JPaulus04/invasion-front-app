import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

(function () {
  'use strict';

  const api = {};
  const ASSET_ROOT = 'assets/prototype4/';
  const HQ_ASSET_ROOT = 'assets/prototype4/hq/';
  const HOLT_ASSET_ROOT = 'assets/prototype4/holt/';
  const LANE_COUNT = 8;
  // Holt and the main turret stay as independent combat sources, but both
  // stand on this authored rooftop deck. Keeping one shared elevation and one
  // simulation row prevents the fixture from splitting apart visually.
  const COMMAND_BASTION_DECK_Y = 1.15;
  const COMMAND_BASTION_CENTER_Z = -1.0;
  const BOSS_VISUAL_SCALE = 1.76;
  const OPERATION_BOSS_VISUAL_SCALE = 2.14;
  const OPERATION_DECK_Y = .24;
  const JUNKYARD_DECK_Y = .28;
  const OPERATION_LANES = [
    { x: -2.15, z: -5.10 },
    { x:  0.00, z: -5.35 },
    { x:  2.15, z: -5.10 },
  ];
  const COMPOUND_LANES = [
    { x: -1.55, z: -5.05, rotation: 0, side: 'north' },
    { x:  1.55, z: -5.05, rotation: 0, side: 'north' },
    { x:  3.15, z: -2.40, rotation: Math.PI / 2, side: 'east' },
    { x:  3.15, z:  2.40, rotation: Math.PI / 2, side: 'east' },
    { x:  1.55, z:  5.05, rotation: 0, side: 'south' },
    { x: -1.55, z:  5.05, rotation: 0, side: 'south' },
    { x: -3.15, z:  2.40, rotation: Math.PI / 2, side: 'west' },
    { x: -3.15, z: -2.40, rotation: Math.PI / 2, side: 'west' },
  ];
  const ATTACK_CYCLE_SECONDS = 1.05;
  const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const PERFORMANCE_BUDGET = window.LSCBalance.performanceBudget({
    cores: navigator.hardwareConcurrency,
    memory: navigator.deviceMemory,
    reducedMotion: REDUCED_MOTION,
  });
  const FILES = {
    model: 'Zombie-Soldier.fbx',
    scout: 'Zombie-Scout.fbx',
    run: 'Zombie-Run.fbx',
    attack: 'Zombie-Punch.fbx',
    death: 'Zombie-Death.fbx',
    holtModel: 'Idle-Aiming.fbx',
    holtFire: 'Firing-Rifle.fbx',
  };
  const HQ_FILES = {
    base: ['Center-Base.fbx', 'Center-Base-BaseColor.jpg'],
    radio: ['Radio-Tower.fbx', 'Radio-Tower-BaseColor.jpg'],
    tower: ['Security-Tower.fbx', 'Security-Tower-BaseColor.jpg'],
  };
  const HOLT_FILES = {
    weapon: 'M4A1.fbx',
    texture: 'texture.png',
  };

  let sourceCanvas;
  let view;
  let renderer;
  let scene;
  let camera;
  let clock;
  let badge;
  let active = false;
  let loading = null;
  const zombieTemplates = {};
  let clips = {};
  let heroGroup = null;
  let heroFallbackGroup = null;
  let heroBaseScale = new THREE.Vector3(1, 1, 1);
  let heroMuzzle = null;
  let heroMuzzleLight = null;
  let heroMixer = null;
  let heroIdleAction = null;
  let heroFireAction = null;
  let heroWeaponMount = null;
  let heroWeapon = null;
  let heroRightHand = null;
  let heroLeftHand = null;
  let heroFireTime = 0;
  let heroWasFlashing = false;
  let turretGroup = null;
  let turretYaw = null;
  let turretMuzzle = null;
  let turretFlashGroup = null;
  let turretLevel2Group = null;
  let turretLevel4Group = null;
  let commandBastionGroup = null;
  let commandBastionTier2Group = null;
  let commandBastionTier3Group = null;
  let commandBastionTier4Group = null;
  let commandBastionTier5Group = null;
  let hqFallbackGroup = null;
  let hqAssetGroup = null;
  let hqBase = null;
  let hqRadio = null;
  const hqTowers = [];
  let hqCommsGroup = null;
  let hqReinforcementGroup = null;
  let hqTier3WallGroup = null;
  let hqTier4WallGroup = null;
  let hqTier5WallGroup = null;
  let hqLaserGroup = null;
  let hqShield = null;
  let displayedHQLevel = 0;
  const barricadeGroups = [];
  const operationBarricadeGroups = [];
  let operationWorldGroup = null;
  let junkyardWorldGroup = null;
  let junkyardVehicleGroup = null;
  let junkyardVehicleBody = [];
  let junkyardVehicleBeacon = null;
  let junkyardVehicleHeadlights = [];
  let junkyardVehicleFlames = [];
  let junkyardVehicleBlastLight = null;
  let campaignWorldObjects = [];
  const campaignTierGroups = [];
  const campaignDamageGroups = [];
  const campaignAtmosphere = [];
  let campaignGroundMaterial = null;
  const campaignRoadMaterials = [];
  let displayedCampaignTier = 0;
  let activeWorldMode = '';

  const units = new Map();
  const tracers = new Map();
  const effects = new Map();
  const staticGroup = new THREE.Group();
  const tracerAxis = new THREE.Vector3(0, 1, 0);
  const weaponForwardAxis = new THREE.Vector3(1, 0, 0);
  const weaponHandTarget = new THREE.Vector3();
  const weaponTargetQuaternion = new THREE.Quaternion();
  const cameraHomePosition = new THREE.Vector3(0, 24.5, 24.2);
  const cameraHomeTarget = new THREE.Vector3(0, 0, -1.1);
  const cameraShakeTarget = new THREE.Vector3();
  let firstFrameCallback = null;
  let firstFrameTimer = 0;
  let renderWidth = 0;
  let renderHeight = 0;
  let adaptivePixelRatio = Math.min(PERFORMANCE_BUDGET.maxPixelRatio, devicePixelRatio || 1);
  const adaptiveMinPixelRatio = Math.min(adaptivePixelRatio, PERFORMANCE_BUDGET.minPixelRatio);
  let adaptiveFrameTotal = 0;
  let adaptiveFrameCount = 0;
  let adaptiveRecoverySamples = 0;
  const tracerGeometries = {
    turret: new THREE.CylinderGeometry(.038, .038 * .72, 1, 6),
    standard: new THREE.CylinderGeometry(.026, .026 * .72, 1, 6),
  };
  const effectGeometries = {
    artillery: new THREE.CylinderGeometry(.16, .48, 3.8, 10, 1, true),
    shockwave: new THREE.RingGeometry(.48, 1, 28),
    fireball: new THREE.IcosahedronGeometry(1, 1),
    smoke: new THREE.DodecahedronGeometry(1, 0),
    'vehicle-explosion': new THREE.IcosahedronGeometry(1, 2),
    debris: new THREE.TetrahedronGeometry(1, 0),
    impact: new THREE.OctahedronGeometry(1, 1),
  };
  const effectPool = { artillery: [], shockwave: [], fireball: [], smoke: [], 'vehicle-explosion': [], debris: [], impact: [] };

  function setBadgeText(value) {
    if (badge && badge.textContent !== value) badge.textContent = value;
  }

  function material(color, options = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness == null ? 0.76 : options.roughness,
      metalness: options.metalness == null ? 0.08 : options.metalness,
      emissive: options.emissive || 0x000000,
      emissiveIntensity: options.emissiveIntensity || 0,
    });
  }

  function box(name, size, position, color, parent = staticGroup, options) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      material(color, options)
    );
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = PERFORMANCE_BUDGET.shadows;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function shapedMesh(name, geometry, position, color, parent, options, rotation) {
    const mesh = new THREE.Mesh(geometry, material(color, options));
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = PERFORMANCE_BUDGET.shadows;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function makeBadge() {
    badge = document.createElement('div');
    badge.id = 'lsc-3d-badge';
    badge.textContent = 'CENTRAL HQ · LOADING CONTACT';
    badge.style.cssText = 'position:absolute;z-index:38;left:12px;top:calc(env(safe-area-inset-top,0px) + 48px);padding:5px 8px;border:1px solid rgba(116,233,255,.5);border-radius:6px;background:rgba(3,10,15,.78);color:#74e9ff;font:7px "Share Tech Mono",monospace;letter-spacing:1.3px;pointer-events:none';
    sourceCanvas.parentNode.appendChild(badge);
  }

  function battlefieldBadge(run, loadingState) {
    if (run && run.operationKind === 'junkyard') {
      const level = Math.max(1, Number(run.operationLevel) || 1);
      if (loadingState) return `JUNKYARD RECOVERY L${level} · LOCATING ARMORED CONVOY`;
      return `JUNKYARD RECOVERY L${level} · ${Math.max(0, Math.ceil(Number(run.objectiveTime) || 0))}s TO EXTRACTION`;
    }
    if (run && run.operation) return `CONTAINMENT LEVEL ${Math.max(1, Number(run.operationLevel) || 1)} · FORWARD LINE`;
    return 'CENTRAL HQ · HOLT ON STATION';
  }

  function buildHero() {
    heroFallbackGroup = new THREE.Group();
    heroFallbackGroup.name = 'Commander Holt fallback';
    heroGroup = heroFallbackGroup;
    heroBaseScale.copy(heroGroup.scale);

    // A compact armored silhouette reads far better from the top-down camera
    // than the old stack of rectangular blocks. The weapon is an integrated
    // forearm cannon, so it cannot detach from the commander.
    shapedMesh('Holt left leg', new THREE.CylinderGeometry(.105, .12, .5, 9), [-.15, .31, 0], 0x172322, heroFallbackGroup, { metalness: .2 });
    shapedMesh('Holt right leg', new THREE.CylinderGeometry(.105, .12, .5, 9), [.15, .31, 0], 0x172322, heroFallbackGroup, { metalness: .2 });
    box('Holt left boot', [.25, .18, .38], [-.15, .1, .07], 0x101918, heroFallbackGroup, { metalness: .25 });
    box('Holt right boot', [.25, .18, .38], [.15, .1, .07], 0x101918, heroFallbackGroup, { metalness: .25 });
    shapedMesh('Holt torso', new THREE.CapsuleGeometry(.31, .48, 5, 10), [0, .88, 0], 0x2f7569, heroFallbackGroup, { metalness: .22, roughness: .56 });
    box('Holt chest plate', [.56, .35, .2], [0, .96, .24], 0x163f40, heroFallbackGroup, { metalness: .42, roughness: .38 });
    box('Holt command stripe', [.4, .055, .215], [0, 1.04, .255], 0xf0bf4b, heroFallbackGroup, { metalness: .32, emissive: 0x4a2700, emissiveIntensity: .24 });
    shapedMesh('Holt left shoulder', new THREE.SphereGeometry(.17, 10, 7), [-.36, 1.07, .02], 0x245b57, heroFallbackGroup, { metalness: .26 });
    shapedMesh('Holt right shoulder', new THREE.SphereGeometry(.19, 10, 7), [.36, 1.07, .02], 0x245b57, heroFallbackGroup, { metalness: .26 });
    shapedMesh('Holt left forearm', new THREE.CylinderGeometry(.085, .11, .58, 9), [-.29, .92, .3], 0x244f4b, heroFallbackGroup, { metalness: .28 }, [Math.PI / 2, 0, 0]);
    shapedMesh('Holt arm cannon', new THREE.CylinderGeometry(.105, .15, .82, 10), [.31, 1.02, .45], 0x18282d, heroFallbackGroup, { metalness: .62, roughness: .28 }, [Math.PI / 2, 0, 0]);
    shapedMesh('Holt cannon ring', new THREE.TorusGeometry(.13, .035, 6, 12), [.31, 1.02, .85], 0x73e8ff, heroFallbackGroup, { metalness: .42, emissive: 0x1d7890, emissiveIntensity: .8 }, [0, 0, 0]);
    shapedMesh('Holt helmet', new THREE.SphereGeometry(.25, 14, 9), [0, 1.43, 0], 0x263b3d, heroFallbackGroup, { metalness: .38, roughness: .42 });
    box('Holt visor', [.37, .115, .21], [0, 1.43, .2], 0x81efff, heroFallbackGroup, { metalness: .28, emissive: 0x17667a, emissiveIntensity: .78 });
    box('Holt helmet crest', [.07, .13, .34], [0, 1.66, -.01], 0xe7b64a, heroFallbackGroup, { metalness: .34 });

    heroMuzzle = new THREE.Mesh(
      new THREE.ConeGeometry(.14, .34, 7),
      new THREE.MeshBasicMaterial({ color: 0xffef75, transparent: true, opacity: .94 })
    );
    heroMuzzle.name = 'Holt muzzle flash';
    heroMuzzle.rotation.x = Math.PI / 2;
    heroMuzzle.position.set(.31, 1.02, .98);
    heroMuzzle.visible = false;
    heroFallbackGroup.add(heroMuzzle);
    heroMuzzleLight = new THREE.PointLight(0xffd05a, 0, 2.2, 2);
    heroMuzzleLight.position.copy(heroMuzzle.position);
    heroFallbackGroup.add(heroMuzzleLight);
    staticGroup.add(heroFallbackGroup);
  }

  function buildTurret() {
    turretGroup = new THREE.Group();
    turretGroup.name = 'Main turret';
    shapedMesh('Turret armored base', new THREE.CylinderGeometry(.68, .82, .36, 12), [0, .18, 0], 0x303d3a, turretGroup, { metalness: .38, roughness: .48 });
    shapedMesh('Turret rotation ring', new THREE.CylinderGeometry(.58, .58, .12, 16), [0, .4, 0], 0x79c7c9, turretGroup, { metalness: .58, roughness: .3, emissive: 0x103f43, emissiveIntensity: .35 });

    turretYaw = new THREE.Group();
    turretYaw.position.y = .45;
    turretGroup.add(turretYaw);
    shapedMesh('Turret gun housing', new THREE.CylinderGeometry(.48, .58, .48, 10), [0, .22, 0], 0x566a66, turretYaw, { metalness: .42, roughness: .4 });
    box('Turret front armor', [.82, .42, .48], [0, .24, .25], 0x425653, turretYaw, { metalness: .46, roughness: .36 });
    box('Turret barrel cradle', [.48, .22, .42], [0, .27, .52], 0x263535, turretYaw, { metalness: .58, roughness: .28 });
    shapedMesh('Turret barrel left', new THREE.CylinderGeometry(.065, .09, 1.42, 9), [-.13, .28, 1.12], 0x1d292b, turretYaw, { metalness: .78, roughness: .22 }, [Math.PI / 2, 0, 0]);
    shapedMesh('Turret barrel right', new THREE.CylinderGeometry(.065, .09, 1.42, 9), [.13, .28, 1.12], 0x1d292b, turretYaw, { metalness: .78, roughness: .22 }, [Math.PI / 2, 0, 0]);
    shapedMesh('Turret muzzle left', new THREE.TorusGeometry(.085, .024, 6, 12), [-.13, .28, 1.82], 0x9cecff, turretYaw, { metalness: .52, emissive: 0x176b7a, emissiveIntensity: .75 });
    shapedMesh('Turret muzzle right', new THREE.TorusGeometry(.085, .024, 6, 12), [.13, .28, 1.82], 0x9cecff, turretYaw, { metalness: .52, emissive: 0x176b7a, emissiveIntensity: .75 });

    turretFlashGroup = new THREE.Group();
    turretFlashGroup.name = 'Turret muzzle flashes';
    [-.13, .13].forEach(x => {
      const flash = new THREE.Mesh(
        new THREE.ConeGeometry(.13, .42, 7),
        new THREE.MeshBasicMaterial({ color: 0xffd168, transparent: true, opacity: .96 })
      );
      flash.position.set(x, .28, 2.03);
      flash.rotation.x = Math.PI / 2;
      turretFlashGroup.add(flash);
    });
    turretFlashGroup.visible = false;
    turretYaw.add(turretFlashGroup);

    turretLevel2Group = new THREE.Group();
    turretLevel2Group.name = 'HQ level 2 turret reinforcement';
    box('Turret left armor wing', [.22, .5, .72], [-.53, .19, .08], 0x2e595b, turretLevel2Group, { metalness: .48, roughness: .34 });
    box('Turret right armor wing', [.22, .5, .72], [.53, .19, .08], 0x2e595b, turretLevel2Group, { metalness: .48, roughness: .34 });
    shapedMesh('Turret targeting sensor', new THREE.SphereGeometry(.13, 10, 7), [0, .62, .02], 0x7ef8ff, turretLevel2Group, { metalness: .36, emissive: 0x17788a, emissiveIntensity: 1.05 });
    turretLevel2Group.visible = false;
    turretYaw.add(turretLevel2Group);

    turretLevel4Group = new THREE.Group();
    turretLevel4Group.name = 'HQ level 4 turret laser conversion';
    shapedMesh('Turret laser barrel', new THREE.CylinderGeometry(.1, .14, 1.34, 10), [0, .48, 1.12], 0x52e7ff, turretLevel4Group, { metalness: .7, roughness: .18, emissive: 0x176f84, emissiveIntensity: .85 }, [Math.PI / 2, 0, 0]);
    shapedMesh('Turret laser focusing ring', new THREE.TorusGeometry(.14, .035, 7, 14), [0, .48, 1.8], 0xc8fbff, turretLevel4Group, { metalness: .52, emissive: 0x2dbbd1, emissiveIntensity: 1.2 });
    turretLevel4Group.visible = false;
    turretYaw.add(turretLevel4Group);

    turretMuzzle = new THREE.PointLight(0xffa83b, 0, 3.4, 2);
    turretMuzzle.position.set(0, .32, 1.88);
    turretYaw.add(turretMuzzle);
    staticGroup.add(turretGroup);
  }

  function buildOperationWorld() {
    operationWorldGroup = new THREE.Group();
    operationWorldGroup.name = 'Build 172 forward containment battlefield';
    operationWorldGroup.visible = false;
    staticGroup.add(operationWorldGroup);

    const yard = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 27),
      material(0x172326, { roughness: 1, metalness: 0 })
    );
    yard.name = 'Containment yard asphalt';
    yard.rotation.x = -Math.PI / 2;
    yard.position.set(0, 0, -2.6);
    yard.receiveShadow = true;
    operationWorldGroup.add(yard);

    box('Containment approach bed', [8.8, .07, 20.8], [0, .035, -3.2], 0x243336, operationWorldGroup, { roughness: .96 });
    OPERATION_LANES.forEach((layout, index) => {
      box(`Forward lane ${index + 1}`, [1.62, .035, 18.5], [layout.x, .085, -3.4], index === 1 ? 0x31484b : 0x293d40, operationWorldGroup, { roughness: .91 });
      [-.76, .76].forEach(offset => {
        box(`Forward lane ${index + 1} guide`, [.055, .025, 18.2], [layout.x + offset, .115, -3.4], 0x52747a, operationWorldGroup, { emissive: 0x183b43, emissiveIntensity: .38 });
      });
      for (let marker = 0; marker < 6; marker++) {
        box(`Forward lane ${index + 1} marker ${marker + 1}`, [.12, .03, .75], [layout.x, .12, 3.2 - marker * 2.85], 0xd0ad54, operationWorldGroup, { emissive: 0x473000, emissiveIntensity: .18 });
      }
    });

    [-4.72, 4.72].forEach((x, sideIndex) => {
      box(`Containment fence ${sideIndex + 1}`, [.12, .72, 21.5], [x, .37, -3.0], 0x59686a, operationWorldGroup, { metalness: .62, roughness: .34 });
      for (let post = 0; post < 8; post++) {
        box(`Containment fence post ${sideIndex + 1}-${post + 1}`, [.18, 1.25, .18], [x, .63, 5.6 - post * 2.45], 0x839092, operationWorldGroup, { metalness: .66, roughness: .3 });
      }
    });
    box('Quarantine gate header', [9.65, .46, .38], [0, 2.02, -11.1], 0x263c42, operationWorldGroup, { metalness: .52, roughness: .36 });
    [-4.35, 4.35].forEach((x, index) => {
      box(`Quarantine gate column ${index + 1}`, [.56, 3.8, .56], [x, 1.9, -11.1], 0x344b50, operationWorldGroup, { metalness: .48, roughness: .4 });
      shapedMesh(`Quarantine warning lamp ${index + 1}`, new THREE.SphereGeometry(.12, 9, 6), [x, 3.92, -11.05], 0xffb34e, operationWorldGroup, { emissive: 0xb74d08, emissiveIntensity: 1.25 });
      const warningLight = new THREE.PointLight(0xff8b35, 1.7, 4.8, 2);
      warningLight.position.set(x, 3.7, -10.8);
      operationWorldGroup.add(warningLight);
    });
    box('Quarantine warning stripe', [7.5, .08, .42], [0, 1.99, -10.86], 0xd0ad54, operationWorldGroup, { emissive: 0x4a2b00, emissiveIntensity: .24 });

    box('Forward command platform', [5.6, .24, 2.8], [0, .12, 1.25], 0x29484a, operationWorldGroup, { metalness: .38, roughness: .46 });
    box('Forward command platform lip', [5.6, .46, .18], [0, .32, -.08], 0x173438, operationWorldGroup, { metalness: .58, roughness: .32 });
    box('Forward command rear rail', [5.6, .72, .12], [0, .5, 2.58], 0x687b7d, operationWorldGroup, { metalness: .62, roughness: .3 });
    [-2.55, 2.55].forEach((x, index) => {
      box(`Forward command side rail ${index + 1}`, [.12, .72, 2.55], [x, .5, 1.25], 0x687b7d, operationWorldGroup, { metalness: .62, roughness: .3 });
      shapedMesh(`Forward command beacon ${index + 1}`, new THREE.SphereGeometry(.09, 8, 6), [x, .94, .12], 0x85f5ff, operationWorldGroup, { emissive: 0x2dbbd1, emissiveIntensity: 1.35 });
    });
    box('Forward command stripe', [4.7, .035, .16], [0, .255, .2], 0xd4b45e, operationWorldGroup, { emissive: 0x473000, emissiveIntensity: .2 });

    OPERATION_LANES.forEach((layout, index) => {
      const group = new THREE.Group();
      group.name = `Forward barricade lane ${index + 1}`;
      group.position.set(layout.x, 0, layout.z);
      operationWorldGroup.add(group);
      const left = box('Forward barricade left', [.66, .68, .52], [-.35, .36, 0], 0x52706e, group, { metalness: .42, roughness: .42 });
      const right = box('Forward barricade right', [.66, .68, .52], [.35, .36, 0], 0x52706e, group, { metalness: .42, roughness: .42 });
      box('Forward barricade brace', [1.5, .13, .68], [0, .76, 0], 0x839591, group, { metalness: .58, roughness: .3 });
      box('Forward barricade energy strip', [1.22, .065, .7], [0, .79, -.02], 0x7eeeff, group, { emissive: 0x238a98, emissiveIntensity: .92 });
      const damageMarks = new THREE.Group();
      damageMarks.name = `Forward barricade damage marks ${index + 1}`;
      const forwardCrackA = box('Forward barricade crack A', [.05, .5, .025], [-.24, .46, -.275], 0x160f0b, damageMarks, { roughness: 1 });
      const forwardCrackB = box('Forward barricade crack B', [.05, .42, .025], [.27, .39, -.275], 0x160f0b, damageMarks, { roughness: 1 });
      forwardCrackA.rotation.z = -.62;forwardCrackB.rotation.z = .72;damageMarks.visible = false;group.add(damageMarks);
      group.userData.faceMaterials = [left.material, right.material];
      group.userData.damageMarks = damageMarks;
      operationBarricadeGroups.push(group);
    });
  }

  function buildJunkyardWorld() {
    junkyardWorldGroup = new THREE.Group();
    junkyardWorldGroup.name = 'Build 185 decisive-destruction junkyard convoy battlefield';
    junkyardWorldGroup.visible = false;
    staticGroup.add(junkyardWorldGroup);

    const yard = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 30),
      material(0x33291e, { roughness: 1, metalness: 0 })
    );
    yard.name = 'Junkyard packed earth';
    yard.rotation.x = -Math.PI / 2;
    yard.position.set(0, 0, -1);
    yard.receiveShadow = true;
    junkyardWorldGroup.add(yard);

    const routeStart = new THREE.Vector2(3.55, -7.35);
    const routeEnd = new THREE.Vector2(-2.95, 5.75);
    const routeDelta = routeEnd.clone().sub(routeStart);
    const routeLength = routeDelta.length();
    const routeAngle = Math.atan2(routeDelta.x, routeDelta.y);
    const routeCenter = routeStart.clone().add(routeEnd).multiplyScalar(.5);
    const road = new THREE.Group();
    road.name = 'Diagonal armored convoy route';
    road.position.set(routeCenter.x, 0, routeCenter.y);
    road.rotation.y = routeAngle;
    junkyardWorldGroup.add(road);
    box('Convoy road shoulder', [3.25, .07, routeLength + 5.4], [0, .035, 0], 0x5b4630, road, { roughness: 1 });
    box('Convoy road bed', [2.72, .085, routeLength + 5.1], [0, .08, 0], 0x24282a, road, { roughness: .94 });
    [-1.24, 1.24].forEach((x, index) => {
      box(`Convoy route edge ${index + 1}`, [.065, .028, routeLength + 4.8], [x, .14, 0], 0x9a7545, road, { emissive: 0x382000, emissiveIntensity: .18 });
    });
    for (let marker = -6; marker <= 6; marker += 2) {
      box(`Convoy route marker ${marker + 7}`, [.11, .03, .82], [0, .145, marker], 0xd29d43, road, { emissive: 0x4a2700, emissiveIntensity: .2 });
    }

    const makeContainer = (name, position, color, rotation) => {
      const group = new THREE.Group();
      group.name = name;
      group.position.set(position[0], 0, position[1]);
      group.rotation.y = rotation || 0;
      junkyardWorldGroup.add(group);
      box(`${name} shell`, [3.05, 1.35, 1.42], [0, .69, 0], color, group, { metalness: .38, roughness: .62 });
      for (let rib = -1.28; rib <= 1.28; rib += .43) box(`${name} rib`, [.055, 1.18, 1.46], [rib, .69, 0], 0x8a6743, group, { metalness: .5, roughness: .45 });
      box(`${name} frame`, [3.14, .1, 1.5], [0, 1.33, 0], 0x342c25, group, { metalness: .58 });
    };
    makeContainer('Oxide freight container', [-6.25, -5.25], 0x733a29, -.15);
    makeContainer('Teal freight container', [-6.0, -3.52], 0x34585a, -.15);
    makeContainer('Ochre freight container', [5.55, -2.6], 0x745323, .16);
    makeContainer('Salvage freight container', [4.6, 4.25], 0x46574d, .12);

    const makeScrapPile = (name, x, z, seed) => {
      const group = new THREE.Group();
      group.name = name;
      group.position.set(x, 0, z);
      junkyardWorldGroup.add(group);
      shapedMesh(`${name} mound`, new THREE.CylinderGeometry(1.08, 1.42, .55, 9), [0, .28, 0], 0x3a3128, group, { roughness: .96 });
      for (let piece = 0; piece < 8; piece++) {
        const angle = seed + piece * 1.37;
        const radius = .28 + (piece % 3) * .25;
        const mesh = box(`${name} scrap ${piece + 1}`, [.24 + (piece % 2) * .28, .18 + (piece % 3) * .12, .62], [Math.cos(angle) * radius, .52 + (piece % 2) * .17, Math.sin(angle) * radius], piece % 3 === 0 ? 0x7c492c : piece % 3 === 1 ? 0x4b5b56 : 0x292d2d, group, { metalness: .68, roughness: .42 });
        mesh.rotation.set(angle * .22, angle, angle * .13);
      }
    };
    makeScrapPile('Northwest scrap heap', -5.65, -.65, .2);
    makeScrapPile('Northeast scrap heap', 5.8, -5.55, 1.1);
    makeScrapPile('East scrap heap', 5.9, .7, 2.4);
    makeScrapPile('Southwest scrap heap', -5.55, 6.05, 3.3);

    const wreck = new THREE.Group();
    wreck.name = 'Stripped convoy wreck';
    wreck.position.set(3.55, 6.25, 0);
    wreck.rotation.y = -.72;
    junkyardWorldGroup.add(wreck);
    box('Wreck chassis', [2.1, .38, 3.5], [0, .42, 0], 0x4f3528, wreck, { metalness: .58, roughness: .55 });
    box('Wreck cab', [1.75, .84, 1.35], [0, .85, 1.0], 0x3e2b25, wreck, { metalness: .52, roughness: .6 });
    [[-1.05, -1.15], [1.05, -1.15], [-1.05, 1.1]].forEach((wheel, index) => {
      shapedMesh(`Wreck wheel ${index + 1}`, new THREE.CylinderGeometry(.42, .42, .3, 12), [wheel[0], .42, wheel[1]], 0x161716, wreck, { metalness: .24, roughness: .86 }, [0, 0, Math.PI / 2]);
    });

    const crane = new THREE.Group();
    crane.name = 'Junkyard recovery crane';
    crane.position.set(6.65, 5.25, 0);
    junkyardWorldGroup.add(crane);
    box('Crane mast', [.48, 5.4, .48], [0, 2.7, 0], 0x76562d, crane, { metalness: .56, roughness: .42 });
    box('Crane boom', [4.2, .34, .34], [-1.78, 5.18, 0], 0x8c6835, crane, { metalness: .58, roughness: .4 });
    box('Crane cable', [.035, 2.7, .035], [-3.72, 3.72, 0], 0x222322, crane, { metalness: .72 });
    shapedMesh('Crane hook', new THREE.TorusGeometry(.18, .055, 7, 13, Math.PI * 1.55), [-3.72, 2.35, 0], 0xa78045, crane, { metalness: .72 }, [0, 0, Math.PI / 2]);

    const gate = new THREE.Group();
    gate.name = 'Convoy extraction gate';
    gate.position.set(routeEnd.x, 0, routeEnd.y);
    gate.rotation.y = routeAngle;
    junkyardWorldGroup.add(gate);
    [-2.0, 2.0].forEach((x, index) => {
      box(`Extraction gate column ${index + 1}`, [.48, 3.35, .48], [x, 1.68, .42], 0x514536, gate, { metalness: .52, roughness: .42 });
      shapedMesh(`Extraction gate beacon ${index + 1}`, new THREE.SphereGeometry(.13, 9, 6), [x, 3.48, .42], 0xffa742, gate, { emissive: 0xd04b08, emissiveIntensity: 1.45 });
      const gateLight = new THREE.PointLight(0xff7f32, 2.2, 5.2, 2);
      gateLight.position.set(x, 3.32, .2);
      gate.add(gateLight);
    });
    box('Extraction gate header', [4.5, .42, .46], [0, 3.16, .42], 0x493d30, gate, { metalness: .54, roughness: .4 });
    box('Extraction hazard stripe', [3.35, .09, .5], [0, 3.13, .16], 0xd29d43, gate, { emissive: 0x4a2700, emissiveIntensity: .25 });

    box('Recovery firing platform', [3.25, .24, 4.75], [-4.35, .12, 2.9], 0x3d4642, junkyardWorldGroup, { metalness: .42, roughness: .5 });
    box('Recovery platform road wall', [.22, .74, 4.75], [-2.72, .45, 2.9], 0x775b37, junkyardWorldGroup, { metalness: .48, roughness: .42 });
    box('Recovery platform rear rail', [3.25, .68, .12], [-4.35, .52, 5.22], 0x8a7758, junkyardWorldGroup, { metalness: .58, roughness: .34 });
    box('Recovery platform stripe', [2.92, .035, .15], [-4.35, .265, .75], 0xe3a847, junkyardWorldGroup, { emissive: 0x4a2700, emissiveIntensity: .22 });

    const warmLight = new THREE.PointLight(0xffa144, 2.4, 10, 2);
    warmLight.position.set(-4.7, 5.2, 3.6);
    junkyardWorldGroup.add(warmLight);

    junkyardVehicleGroup = new THREE.Group();
    junkyardVehicleGroup.name = 'Procedural armored convoy transport';
    junkyardVehicleGroup.visible = false;
    staticGroup.add(junkyardVehicleGroup);
    const vehiclePart = (name, size, position, color, options) => {
      const mesh = box(name, size, position, color, junkyardVehicleGroup, options);
      mesh.material.userData.baseColor = mesh.material.color.getHex();
      junkyardVehicleBody.push(mesh.material);
      return mesh;
    };
    vehiclePart('Armored transport chassis', [2.25, .42, 4.5], [0, .55, 0], 0x363a35, { metalness: .66, roughness: .35 });
    vehiclePart('Armored transport cargo shell', [2.02, 1.35, 2.48], [0, 1.25, -.72], 0x5d5848, { metalness: .58, roughness: .42 });
    vehiclePart('Armored transport cab', [1.96, 1.18, 1.42], [0, 1.17, 1.34], 0x655b47, { metalness: .6, roughness: .4 });
    vehiclePart('Armored transport hood', [1.82, .58, .64], [0, .88, 2.18], 0x4b4c40, { metalness: .65, roughness: .36 });
    vehiclePart('Armored transport front plate', [2.08, .74, .18], [0, .91, 2.5], 0x303631, { metalness: .72, roughness: .3 });
    vehiclePart('Armored transport roof armor', [2.18, .22, 2.75], [0, 2.02, -.48], 0x41443b, { metalness: .68, roughness: .34 });
    [-1.08, 1.08].forEach((x, sideIndex) => {
      [-1.42, 1.5].forEach((z, axleIndex) => {
        shapedMesh(`Armored transport wheel ${sideIndex + 1}-${axleIndex + 1}`, new THREE.CylinderGeometry(.48, .48, .36, 14), [x, .53, z], 0x131514, junkyardVehicleGroup, { metalness: .24, roughness: .88 }, [0, 0, Math.PI / 2]);
        shapedMesh(`Armored transport hub ${sideIndex + 1}-${axleIndex + 1}`, new THREE.CylinderGeometry(.2, .2, .38, 12), [x, .53, z], 0x8c7044, junkyardVehicleGroup, { metalness: .72, roughness: .32 }, [0, 0, Math.PI / 2]);
      });
    });
    shapedMesh('Armored transport roof hatch', new THREE.CylinderGeometry(.48, .56, .24, 12), [0, 2.22, -.45], 0x333833, junkyardVehicleGroup, { metalness: .7, roughness: .32 });
    box('Armored transport windshield', [1.5, .44, .08], [0, 1.43, 2.07], 0x172b2e, junkyardVehicleGroup, { metalness: .38, roughness: .24, emissive: 0x07191c, emissiveIntensity: .32 });
    junkyardVehicleHeadlights = [-.62, .62].map((x, index) => shapedMesh(`Armored transport headlight ${index + 1}`, new THREE.SphereGeometry(.13, 9, 6), [x, .78, 2.61], 0xffd66b, junkyardVehicleGroup, { emissive: 0xffa51e, emissiveIntensity: 1.35 }));
    shapedMesh('Armored transport beacon housing', new THREE.CylinderGeometry(.13, .16, .18, 10), [0, 2.31, .5], 0x35281f, junkyardVehicleGroup, { metalness: .6 });
    const beaconMesh = shapedMesh('Armored transport warning beacon', new THREE.SphereGeometry(.12, 10, 7), [0, 2.45, .5], 0xff702e, junkyardVehicleGroup, { emissive: 0xe53b08, emissiveIntensity: 1.5 });
    junkyardVehicleBeacon = new THREE.PointLight(0xff5b23, 2.8, 4.6, 2);
    junkyardVehicleBeacon.position.copy(beaconMesh.position);
    junkyardVehicleGroup.add(junkyardVehicleBeacon);
    [[-.62,1.34,-.55,.66],[.52,1.12,.38,.52],[0,1.72,-1.12,.72]].forEach((flame, index) => {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(flame[3], 1),
        new THREE.MeshBasicMaterial({ color: index === 1 ? 0xffd45c : 0xff5b21, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      mesh.name = `Armored transport destruction flame ${index + 1}`;
      mesh.position.set(flame[0], flame[1], flame[2]);
      mesh.visible = false;
      junkyardVehicleGroup.add(mesh);
      junkyardVehicleFlames.push(mesh);
    });
    junkyardVehicleBlastLight = new THREE.PointLight(0xff5a21, 0, 10, 2);
    junkyardVehicleBlastLight.position.set(0, 1.5, 0);
    junkyardVehicleGroup.add(junkyardVehicleBlastLight);
  }

  function buildCampaignWorldTiers() {
    const makeSmoke = (name, position, color, parent, tier, damageTier) => {
      const mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(.62, 0),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .28, depthWrite: false })
      );
      mesh.name = name;
      mesh.position.set(position[0], position[1], position[2]);
      mesh.scale.set(1, 1.45, 1);
      parent.add(mesh);
      campaignAtmosphere.push({ mesh, tier, damageTier, baseY: position[1], drift: .12 + campaignAtmosphere.length * .015 });
      return mesh;
    };
    const makeFence = (name, x, z, rotation, parent) => {
      const group = new THREE.Group();
      group.name = name;
      group.position.set(x, 0, z);
      group.rotation.y = rotation;
      parent.add(group);
      box(`${name} lower rail`, [4.2, .07, .07], [0, .42, 0], 0x596260, group, { metalness: .72, roughness: .42 });
      box(`${name} upper rail`, [4.2, .07, .07], [0, 1.12, 0], 0x596260, group, { metalness: .72, roughness: .42 });
      for (let post = -2; post <= 2; post++) box(`${name} post ${post + 3}`, [.07, 1.42, .07], [post, .71, 0], 0x707876, group, { metalness: .72, roughness: .42 });
    };
    const makeRoadCracks = (parent, prefix, color) => {
      [[-1.8,-7,.44],[1.6,-10,-.38],[-8,1.2,1.08],[8,-1.5,-1.04],[-1.4,8,.22]].forEach((crack, index) => {
        const mesh = box(`${prefix} road crack ${index + 1}`, [1.7 + (index % 2) * .7, .018, .065], [crack[0], .035, crack[1]], color, parent, { roughness: 1 });
        mesh.rotation.y = crack[2];
      });
    };

    const outpost = new THREE.Group();
    outpost.name = 'Campaign tier 1 · Overrun Forward Outpost';
    staticGroup.add(outpost);
    campaignTierGroups.push(outpost);
    makeRoadCracks(outpost, 'Outpost', 0x202820);
    [[-7.7,-7.1],[7.8,-6.7],[-7.4,6.6],[7.5,7.1]].forEach((position, index) => {
      const station = new THREE.Group();
      station.name = `Abandoned outpost position ${index + 1}`;
      station.position.set(position[0], 0, position[1]);
      station.rotation.y = index * .46;
      outpost.add(station);
      box('Outpost sandbag course', [3.2, .5, .72], [0, .27, 0], 0x766a47, station, { roughness: .98 });
      for (let bag = -1; bag <= 1; bag++) shapedMesh(`Outpost sandbag ${bag + 2}`, new THREE.CapsuleGeometry(.22, .64, 3, 6), [bag * .82, .58, 0], 0x8a7b54, station, { roughness: .98 }, [0, 0, Math.PI / 2]);
      box('Outpost supply crate', [.86, .72, .86], [1.5, .38, .75], index % 2 ? 0x3f564d : 0x5d5438, station, { metalness: .22, roughness: .72 });
    });
    makeFence('Broken west perimeter fence', -10.4, -1.2, Math.PI / 2, outpost);
    makeFence('Broken east perimeter fence', 10.4, 2.1, Math.PI / 2, outpost);
    const outpostLight = new THREE.PointLight(0xffc067, 1.8, 11, 2);
    outpostLight.position.set(-7.3, 4.8, -5.6);
    outpost.add(outpostLight);
    box('Outpost floodlight mast', [.16, 4.8, .16], [-7.3, 2.4, -5.6], 0x58635f, outpost, { metalness: .68 });

    const industrial = new THREE.Group();
    industrial.name = 'Campaign tier 2 · Collapsed Industrial Sector';
    industrial.visible = false;
    staticGroup.add(industrial);
    campaignTierGroups.push(industrial);
    makeRoadCracks(industrial, 'Industrial', 0x1d201e);
    [[-9.1,-8.2,0x59452f],[8.8,-7.5,0x3c5a59],[-8.6,7.7,0x6b3d2d]].forEach((data, index) => {
      const container = new THREE.Group();
      container.name = `Collapsed freight stack ${index + 1}`;
      container.position.set(data[0], .62, data[1]);
      container.rotation.y = (index - 1) * .32;
      industrial.add(container);
      box('Industrial freight container', [4.2, 1.25, 1.72], [0, 0, 0], data[2], container, { metalness: .48, roughness: .56 });
      for (let rib = -1.7; rib <= 1.7; rib += .57) box('Container rib', [.055, 1.12, 1.76], [rib, 0, 0], 0x302f2b, container, { metalness: .56 });
    });
    [-10.2, 10.1].forEach((x, index) => {
      shapedMesh(`Industrial storage silo ${index + 1}`, new THREE.CylinderGeometry(1.35, 1.48, 5.8, 14), [x, 2.9, 1.5 - index * 4], 0x4e5551, industrial, { metalness: .5, roughness: .58 });
      shapedMesh(`Industrial silo cap ${index + 1}`, new THREE.ConeGeometry(1.48, .8, 14), [x, 6.2, 1.5 - index * 4], 0x424845, industrial, { metalness: .52, roughness: .54 });
    });
    box('Collapsed warehouse west wall', [6.4, 3.8, .42], [-8.1, 1.9, 11.2], 0x4a504d, industrial, { metalness: .3, roughness: .78 });
    box('Collapsed warehouse east return', [.42, 2.7, 5.4], [-11.1, 1.35, 8.7], 0x404643, industrial, { metalness: .3, roughness: .8 });
    makeSmoke('Industrial stack haze', [-10.2, 7.3, 1.5], 0x414541, industrial, 2, 0);
    makeSmoke('Industrial yard haze', [9.5, 3.4, 7.8], 0x343a38, industrial, 2, 0);

    const urban = new THREE.Group();
    urban.name = 'Campaign tier 3 · Ruined Urban Perimeter';
    urban.visible = false;
    staticGroup.add(urban);
    campaignTierGroups.push(urban);
    makeRoadCracks(urban, 'Urban', 0x17191a);
    [[-10.6,-9.6,5.8,7.5],[9.8,-9.7,6.2,9.4],[-10.4,9.7,7.2,8.3],[10.2,9.6,5.4,7.1]].forEach((data, index) => {
      const ruin = new THREE.Group();
      ruin.name = `Urban building shell ${index + 1}`;
      ruin.position.set(data[0], 0, data[1]);
      urban.add(ruin);
      box('Ruined building rear wall', [data[2], data[3], .52], [0, data[3] / 2, 0], index % 2 ? 0x494b49 : 0x52504a, ruin, { roughness: .9 });
      box('Ruined building side wall', [.52, data[3] * .72, 4.4], [-data[2] / 2 + .24, data[3] * .36, 2.0], 0x414340, ruin, { roughness: .92 });
      for (let floor = 1; floor <= 2; floor++) box('Exposed ruined floor', [data[2] - .6, .18, 3.8], [0, floor * 2.15, 1.7], 0x343634, ruin, { roughness: .92 });
      for (let window = -1; window <= 1; window++) box('Burned window opening', [.78, 1.1, .08], [window * 1.55, 2.2 + (index % 2) * 1.8, -.3], 0x111514, ruin, { emissive: 0x090b0a, emissiveIntensity: .25 });
    });
    const wreck = new THREE.Group();
    wreck.name = 'Burned evacuation vehicle';
    wreck.position.set(7.0, .38, 3.3);
    wreck.rotation.y = -.62;
    urban.add(wreck);
    box('Evacuation wreck chassis', [1.8, .42, 3.4], [0, 0, 0], 0x282b29, wreck, { metalness: .58, roughness: .7 });
    box('Evacuation wreck cabin', [1.55, .88, 1.4], [0, .58, .78], 0x32322e, wreck, { metalness: .48, roughness: .74 });
    makeSmoke('Urban ruin haze west', [-8.9, 6.2, -8.7], 0x353637, urban, 3, 0);
    makeSmoke('Urban ruin haze east', [9.0, 7.2, -7.8], 0x303133, urban, 3, 0);

    const assaultDamage = new THREE.Group();
    assaultDamage.name = 'Campaign assault 2 battlefield damage';
    assaultDamage.visible = false;
    staticGroup.add(assaultDamage);
    campaignDamageGroups.push(assaultDamage);
    [[-4.9,-7.2],[7.2,4.8],[-7.4,4.1]].forEach((position, index) => {
      shapedMesh(`Fresh impact crater ${index + 1}`, new THREE.CylinderGeometry(.42, 1.12, .14, 15), [position[0], .055, position[1]], 0x20241f, assaultDamage, { roughness: 1 });
      makeSmoke(`Fresh crater smoke ${index + 1}`, [position[0], .78, position[1]], 0x393b37, assaultDamage, 0, 2);
    });
    const siegeDamage = new THREE.Group();
    siegeDamage.name = 'Campaign assault 3 siege damage';
    siegeDamage.visible = false;
    staticGroup.add(siegeDamage);
    campaignDamageGroups.push(siegeDamage);
    [[-6.2,-2.2],[6.4,-3.1]].forEach((position, index) => {
      shapedMesh(`Siege fire ${index + 1}`, new THREE.ConeGeometry(.34, 1.25, 9), [position[0], .68, position[1]], 0xff6a21, siegeDamage, { emissive: 0xff2a00, emissiveIntensity: 2.2 });
      const fireLight = new THREE.PointLight(0xff5722, 2.4, 6.5, 2);
      fireLight.position.set(position[0], 1.3, position[1]);
      siegeDamage.add(fireLight);
      makeSmoke(`Siege column ${index + 1}`, [position[0], 1.55, position[1]], 0x2b2d2c, siegeDamage, 0, 3);
    });
  }

  function buildWorld() {
    scene.add(staticGroup);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 38),
      material(0x46573d, { roughness: 1, metalness: 0 })
    );
    ground.name = 'Battlefield';
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    campaignGroundMaterial = ground.material;
    staticGroup.add(ground);

    const northSouth = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 34),
      material(0x343e31, { roughness: 1, metalness: 0 })
    );
    northSouth.rotation.x = -Math.PI / 2;
    northSouth.position.y = .012;
    northSouth.receiveShadow = true;
    campaignRoadMaterials.push(northSouth.material);
    staticGroup.add(northSouth);

    const eastWest = northSouth.clone();
    eastWest.rotation.z = Math.PI / 2;
    staticGroup.add(eastWest);

    buildCampaignWorldTiers();

    box('HQ foundation', [3.7, .28, 3.2], [0, .14, 0], 0x26342e);
    commandBastionGroup = new THREE.Group();
    commandBastionGroup.name = 'Command Bastion rooftop emplacement';
    box('Command Bastion shared rooftop deck', [3.55, .22, 1.55], [0, COMMAND_BASTION_DECK_Y - .11, COMMAND_BASTION_CENTER_Z], 0x314c49, commandBastionGroup, { metalness: .42, roughness: .42 });
    box('Command Bastion front armored lip', [3.55, .34, .16], [0, COMMAND_BASTION_DECK_Y - .02, COMMAND_BASTION_CENTER_Z + .69], 0x203b3c, commandBastionGroup, { metalness: .56, roughness: .34 });
    box('Command Bastion rear safety rail', [3.55, .42, .12], [0, COMMAND_BASTION_DECK_Y + .18, COMMAND_BASTION_CENTER_Z - .70], 0x6e7d72, commandBastionGroup, { metalness: .58, roughness: .34 });
    [-1.48, 1.48].forEach(x => {
      box('Command Bastion rooftop support', [.22, 1.02, .88], [x, .54, COMMAND_BASTION_CENTER_Z], 0x263d3b, commandBastionGroup, { metalness: .46, roughness: .46 });
      box('Command Bastion side rail', [.12, .42, 1.45], [x, COMMAND_BASTION_DECK_Y + .18, COMMAND_BASTION_CENTER_Z], 0x6e7d72, commandBastionGroup, { metalness: .58, roughness: .34 });
    });
    box('Command Bastion access step', [.68, .18, .42], [0, .91, COMMAND_BASTION_CENTER_Z + 1.0], 0x667770, commandBastionGroup, { metalness: .38, roughness: .48 });
    box('Command Bastion command stripe', [3.18, .025, .18], [0, COMMAND_BASTION_DECK_Y + .015, COMMAND_BASTION_CENTER_Z + .42], 0xd4b45e, commandBastionGroup, { metalness: .42, emissive: 0x473000, emissiveIntensity: .18 });
    staticGroup.add(commandBastionGroup);

    commandBastionTier2Group = new THREE.Group();
    commandBastionTier2Group.name = 'Command Bastion level 2 armored rails';
    box('Bastion west command shield', [.26, .62, 1.15], [-1.44, COMMAND_BASTION_DECK_Y + .28, COMMAND_BASTION_CENTER_Z], 0x355a57, commandBastionTier2Group, { metalness: .52, roughness: .34 });
    box('Bastion east command shield', [.26, .62, 1.15], [1.44, COMMAND_BASTION_DECK_Y + .28, COMMAND_BASTION_CENTER_Z], 0x355a57, commandBastionTier2Group, { metalness: .52, roughness: .34 });
    commandBastionTier2Group.visible = false;
    staticGroup.add(commandBastionTier2Group);

    commandBastionTier3Group = new THREE.Group();
    commandBastionTier3Group.name = 'Command Bastion level 3 reinforced deck';
    box('Bastion reinforced front plate', [2.15, .54, .18], [0, COMMAND_BASTION_DECK_Y - .02, COMMAND_BASTION_CENTER_Z + .71], 0x47645f, commandBastionTier3Group, { metalness: .58, roughness: .32 });
    box('Bastion stair tread', [1.05, .16, .34], [0, .73, COMMAND_BASTION_CENTER_Z + 1.24], 0x667770, commandBastionTier3Group, { metalness: .4, roughness: .46 });
    commandBastionTier3Group.visible = false;
    staticGroup.add(commandBastionTier3Group);

    commandBastionTier4Group = new THREE.Group();
    commandBastionTier4Group.name = 'Command Bastion level 4 armored nest';
    box('Bastion center command console', [.46, .52, .42], [0, COMMAND_BASTION_DECK_Y + .25, COMMAND_BASTION_CENTER_Z - .34], 0x2e5556, commandBastionTier4Group, { metalness: .68, roughness: .28 });
    [-1,1].forEach(side => shapedMesh('Bastion targeting light', new THREE.SphereGeometry(.07, 8, 6), [side*1.47, COMMAND_BASTION_DECK_Y + .66, COMMAND_BASTION_CENTER_Z - .50], 0x87f5ff, commandBastionTier4Group, { emissive: 0x2dbbd1, emissiveIntensity: 1.2 }));
    commandBastionTier4Group.visible = false;
    staticGroup.add(commandBastionTier4Group);

    commandBastionTier5Group = new THREE.Group();
    commandBastionTier5Group.name = 'Command Bastion level 5 command fortress';
    box('Bastion west energy rail', [.08, .08, 1.35], [-1.62, COMMAND_BASTION_DECK_Y + .52, COMMAND_BASTION_CENTER_Z], 0x8ef6ff, commandBastionTier5Group, { emissive: 0x26aabd, emissiveIntensity: 1.25 });
    box('Bastion east energy rail', [.08, .08, 1.35], [1.62, COMMAND_BASTION_DECK_Y + .52, COMMAND_BASTION_CENTER_Z], 0x8ef6ff, commandBastionTier5Group, { emissive: 0x26aabd, emissiveIntensity: 1.25 });
    box('Bastion command shield lip', [3.1, .12, .12], [0, COMMAND_BASTION_DECK_Y + .56, COMMAND_BASTION_CENTER_Z - .64], 0x65dce7, commandBastionTier5Group, { metalness: .56, emissive: 0x1c7888, emissiveIntensity: .78 });
    commandBastionTier5Group.visible = false;
    staticGroup.add(commandBastionTier5Group);
    hqFallbackGroup = new THREE.Group();
    hqFallbackGroup.name = 'HQ loading fallback';
    staticGroup.add(hqFallbackGroup);
    box('HQ fallback body', [2.35, .72, 1.85], [0, .5, .2], 0x465c58, hqFallbackGroup);
    box('HQ fallback upper', [1.45, .28, 1.15], [0, .91, .28], 0x687c76, hqFallbackGroup);
    box('HQ fallback mast', [.08, 1.3, .08], [0, 1.68, .28], 0xd0ded8, hqFallbackGroup, { metalness: .4 });

    hqReinforcementGroup = new THREE.Group();
    hqReinforcementGroup.name = 'HQ level 2 reinforced compound';
    box('HQ rear blast wall', [4.75, .62, .28], [0, .33, -2.12], 0x334b48, hqReinforcementGroup, { metalness: .28, roughness: .62 });
    box('HQ west blast wall', [.28, .62, 4.0], [-2.38, .33, 0], 0x334b48, hqReinforcementGroup, { metalness: .28, roughness: .62 });
    box('HQ east blast wall', [.28, .62, 4.0], [2.38, .33, 0], 0x334b48, hqReinforcementGroup, { metalness: .28, roughness: .62 });
    box('HQ front wall west', [1.72, .62, .28], [-1.5, .33, 2.12], 0x334b48, hqReinforcementGroup, { metalness: .28, roughness: .62 });
    box('HQ front wall east', [1.72, .62, .28], [1.5, .33, 2.12], 0x334b48, hqReinforcementGroup, { metalness: .28, roughness: .62 });
    [-1, 1].forEach(side => {
      shapedMesh('HQ reinforced corner post', new THREE.CylinderGeometry(.2, .25, .88, 8), [side * 2.38, .45, -2.12], 0x6f8580, hqReinforcementGroup, { metalness: .5, roughness: .34 });
      box('HQ powered equipment crate', [.72, .48, .58], [side * 1.48, .25, 1.72], side < 0 ? 0x536455 : 0x475e63, hqReinforcementGroup, { metalness: .2, roughness: .66 });
      box('HQ floodlight pole', [.08, 1.5, .08], [side * 2.05, .75, 1.78], 0x87928e, hqReinforcementGroup, { metalness: .5 });
      shapedMesh('HQ floodlight', new THREE.SphereGeometry(.1, 9, 6), [side * 2.05, 1.55, 1.78], 0xd6fbff, hqReinforcementGroup, { emissive: 0x75ddeb, emissiveIntensity: 1.25 });
      const flood = new THREE.PointLight(0x9cecff, 1.35, 4.2, 2);
      flood.position.set(side * 2.05, 1.5, 1.65);
      hqReinforcementGroup.add(flood);
    });
    hqReinforcementGroup.visible = false;
    staticGroup.add(hqReinforcementGroup);

    hqTier3WallGroup = new THREE.Group();
    hqTier3WallGroup.name = 'HQ level 3 raised fortified walls';
    box('Level 3 rear upper wall', [5.05, .42, .38], [0, .78, -2.18], 0x64746c, hqTier3WallGroup, { metalness: .42, roughness: .46 });
    box('Level 3 west upper wall', [.38, .42, 4.35], [-2.44, .78, 0], 0x64746c, hqTier3WallGroup, { metalness: .42, roughness: .46 });
    box('Level 3 east upper wall', [.38, .42, 4.35], [2.44, .78, 0], 0x64746c, hqTier3WallGroup, { metalness: .42, roughness: .46 });
    box('Level 3 front upper wall west', [1.82, .42, .38], [-1.56, .78, 2.18], 0x64746c, hqTier3WallGroup, { metalness: .42, roughness: .46 });
    box('Level 3 front upper wall east', [1.82, .42, .38], [1.56, .78, 2.18], 0x64746c, hqTier3WallGroup, { metalness: .42, roughness: .46 });
    [[-2.44,-2.18],[2.44,-2.18],[-2.44,2.18],[2.44,2.18]].forEach((position, index) => {
      shapedMesh(`Level 3 corner bastion ${index + 1}`, new THREE.CylinderGeometry(.31, .38, 1.42, 8), [position[0], .71, position[1]], 0x526b68, hqTier3WallGroup, { metalness: .48, roughness: .4 });
    });
    hqTier3WallGroup.visible = false;
    staticGroup.add(hqTier3WallGroup);

    hqTier4WallGroup = new THREE.Group();
    hqTier4WallGroup.name = 'HQ level 4 armored perimeter wall';
    box('Level 4 rear armor course', [5.34, .5, .46], [0, 1.18, -2.25], 0x3f5e60, hqTier4WallGroup, { metalness: .62, roughness: .32 });
    box('Level 4 west armor course', [.46, .5, 4.56], [-2.55, 1.18, 0], 0x3f5e60, hqTier4WallGroup, { metalness: .62, roughness: .32 });
    box('Level 4 east armor course', [.46, .5, 4.56], [2.55, 1.18, 0], 0x3f5e60, hqTier4WallGroup, { metalness: .62, roughness: .32 });
    box('Level 4 front armor west', [1.94, .5, .46], [-1.67, 1.18, 2.25], 0x3f5e60, hqTier4WallGroup, { metalness: .62, roughness: .32 });
    box('Level 4 front armor east', [1.94, .5, .46], [1.67, 1.18, 2.25], 0x3f5e60, hqTier4WallGroup, { metalness: .62, roughness: .32 });
    // Keep the front gate visibly fortified without placing a solid header
    // directly between the portrait camera and Commander Holt.
    box('Level 4 gate pillar west', [.22, 1.34, .5], [-.72, .67, 2.25], 0x2d484c, hqTier4WallGroup, { metalness: .68, roughness: .28 });
    box('Level 4 gate pillar east', [.22, 1.34, .5], [.72, .67, 2.25], 0x2d484c, hqTier4WallGroup, { metalness: .68, roughness: .28 });
    box('Level 4 gate threshold', [1.28, .1, .58], [0, .05, 2.25], 0x6f8580, hqTier4WallGroup, { metalness: .5, roughness: .38 });
    hqTier4WallGroup.visible = false;
    staticGroup.add(hqTier4WallGroup);

    hqTier5WallGroup = new THREE.Group();
    hqTier5WallGroup.name = 'HQ level 5 command fortress wall';
    [[-2.72,-2.42],[2.72,-2.42],[-2.72,2.42],[2.72,2.42]].forEach((position, index) => {
      shapedMesh(`Level 5 heavy bastion ${index + 1}`, new THREE.CylinderGeometry(.46, .58, 2.05, 10), [position[0], 1.03, position[1]], 0x2e5e64, hqTier5WallGroup, { metalness: .68, roughness: .28, emissive: 0x092e35, emissiveIntensity: .32 });
      shapedMesh(`Level 5 bastion beacon ${index + 1}`, new THREE.SphereGeometry(.1, 9, 6), [position[0], 2.12, position[1]], 0x86f6ff, hqTier5WallGroup, { emissive: 0x2dbbd1, emissiveIntensity: 1.35 });
    });
    box('Level 5 rear energy rail', [5.3, .08, .08], [0, 1.52, -2.42], 0x8ef6ff, hqTier5WallGroup, { emissive: 0x26aabd, emissiveIntensity: 1.2 });
    box('Level 5 west energy rail', [.08, .08, 4.8], [-2.72, 1.52, 0], 0x8ef6ff, hqTier5WallGroup, { emissive: 0x26aabd, emissiveIntensity: 1.2 });
    box('Level 5 east energy rail', [.08, .08, 4.8], [2.72, 1.52, 0], 0x8ef6ff, hqTier5WallGroup, { emissive: 0x26aabd, emissiveIntensity: 1.2 });
    hqTier5WallGroup.visible = false;
    staticGroup.add(hqTier5WallGroup);

    hqCommsGroup = new THREE.Group();
    hqCommsGroup.name = 'HQ level 2 communications';
    shapedMesh('HQ comms beacon', new THREE.SphereGeometry(.11, 10, 7), [-1.82, 3.18, -1.18], 0x6eeeff, hqCommsGroup, { emissive: 0x1f9ab5, emissiveIntensity: 1.2 });
    const commsLight = new THREE.PointLight(0x6eeeff, 2.2, 4, 2);
    commsLight.position.set(-1.82, 3.12, -1.18);
    hqCommsGroup.add(commsLight);
    hqCommsGroup.visible = false;
    staticGroup.add(hqCommsGroup);

    hqLaserGroup = new THREE.Group();
    hqLaserGroup.name = 'HQ level 4 laser upgrade';
    [-1, 1].forEach(side => {
      box('Laser pedestal', [.5, .28, .56], [side * 2.25, .18, .85], 0x273f42, hqLaserGroup, { metalness: .42 });
      shapedMesh('Laser emitter', new THREE.CylinderGeometry(.1, .16, .95, 10), [side * 2.25, .75, .85], 0x4acfe8, hqLaserGroup, { metalness: .62, emissive: 0x176b7a, emissiveIntensity: .72 });
    });
    hqLaserGroup.visible = false;
    staticGroup.add(hqLaserGroup);

    hqShield = shapedMesh('HQ level 5 shield ring', new THREE.TorusGeometry(3.35, .035, 8, 48), [0, .12, 0], 0x55dffc, staticGroup, { emissive: 0x0d7088, emissiveIntensity: 1.1 }, [Math.PI / 2, 0, 0]);
    hqShield.visible = false;

    // A connected concrete service strip gives the eight positions one clear
    // rectangular/octagonal compound footprint instead of an oval of props.
    box('Defensive compound north pad', [7.05, .09, .78], [0, .045, -5.05], 0x3b4338, staticGroup, { roughness: .96 });
    box('Defensive compound south pad', [7.05, .09, .78], [0, .045, 5.05], 0x3b4338, staticGroup, { roughness: .96 });
    box('Defensive compound east pad', [.78, .09, 10.1], [3.15, .045, 0], 0x3b4338, staticGroup, { roughness: .96 });
    box('Defensive compound west pad', [.78, .09, 10.1], [-3.15, .045, 0], 0x3b4338, staticGroup, { roughness: .96 });
    box('Defensive compound north rail', [7.0, .16, .1], [0, .13, -5.47], 0x9a8653, staticGroup, { metalness: .18, roughness: .66 });
    box('Defensive compound south rail', [7.0, .16, .1], [0, .13, 5.47], 0x9a8653, staticGroup, { metalness: .18, roughness: .66 });
    box('Defensive compound east rail', [.1, .16, 10.0], [3.57, .13, 0], 0x9a8653, staticGroup, { metalness: .18, roughness: .66 });
    box('Defensive compound west rail', [.1, .16, 10.0], [-3.57, .13, 0], 0x9a8653, staticGroup, { metalness: .18, roughness: .66 });

    for (let lane = 0; lane < LANE_COUNT; lane++) {
      const layout = COMPOUND_LANES[lane];
      const group = new THREE.Group();
      group.name = `Barricade lane ${lane + 1}`;
      group.position.set(layout.x, 0, layout.z);
      group.rotation.y = layout.rotation;
      group.userData.side = layout.side;
      staticGroup.add(group);

      const left = box('Barricade left', [1.02, .54, .46], [-.52, .29, 0], 0x806d4a, group);
      const right = box('Barricade right', [1.02, .54, .46], [.52, .29, 0], 0x806d4a, group);
      box('Barricade brace left', [.14, .68, .62], [-1.03, .34, 0], 0x4d4d3d, group, { metalness: .22 });
      box('Barricade brace center', [.12, .62, .58], [0, .31, 0], 0x4d4d3d, group, { metalness: .22 });
      box('Barricade brace right', [.14, .68, .62], [1.03, .34, 0], 0x4d4d3d, group, { metalness: .22 });
      const reinforced = new THREE.Group();
      reinforced.name = `HQ level 2 reinforced barrier ${lane + 1}`;
      box('Reinforced barrier upper plate', [2.22, .42, .5], [0, .76, 0], 0x6f7d65, reinforced, { metalness: .34, roughness: .5 });
      box('Reinforced barrier top rail', [2.42, .12, .62], [0, 1.02, 0], 0x95a27b, reinforced, { metalness: .46, roughness: .38 });
      reinforced.visible = false;
      group.add(reinforced);
      const fortress = new THREE.Group();
      fortress.name = `HQ level 4 armored barrier ${lane + 1}`;
      box('Armored barrier face', [2.34, .58, .62], [0, .88, -.035], 0x3f6263, fortress, { metalness: .62, roughness: .3 });
      box('Armored barrier energy strip', [1.86, .07, .66], [0, 1.04, -.045], 0x75e8ff, fortress, { emissive: 0x208a9b, emissiveIntensity: 1.05 });
      fortress.visible = false;
      group.add(fortress);
      const damageMarks = new THREE.Group();
      damageMarks.name = `Barricade damage marks ${lane + 1}`;
      const crackA = box('Barricade crack A', [.055, .62, .03], [-.42, .55, -.335], 0x17110c, damageMarks, { roughness: 1 });
      const crackB = box('Barricade crack B', [.055, .55, .03], [.47, .48, -.335], 0x17110c, damageMarks, { roughness: 1 });
      crackA.rotation.z = -.68;crackB.rotation.z = .74;damageMarks.visible = false;group.add(damageMarks);
      group.userData.faceMaterials = [left.material, right.material];
      group.userData.reinforced = reinforced;
      group.userData.fortress = fortress;
      group.userData.damageMarks = damageMarks;
      barricadeGroups.push(group);
    }

    campaignWorldObjects = staticGroup.children.slice();
    buildOperationWorld();
    buildJunkyardWorld();
    buildHero();
    buildTurret();
  }

  function init() {
    view = document.createElement('canvas');
    view.id = 'lsc-3d-prototype';
    view.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;background:#283425;display:none';
    sourceCanvas.parentNode.insertBefore(view, sourceCanvas.nextSibling);
    makeBadge();

    renderer = new THREE.WebGLRenderer({
      canvas: view,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(adaptivePixelRatio);
    renderer.shadowMap.enabled = PERFORMANCE_BUDGET.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.38;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x41513f);
    scene.fog = new THREE.Fog(0x41513f, 31, 52);

    camera = new THREE.PerspectiveCamera(45, 1, .1, 90);
    camera.position.set(0, 24.5, 24.2);
    camera.lookAt(0, 0, -1.1);

    scene.add(new THREE.HemisphereLight(0xeaf7ff, 0x46513c, 2.7));

    const fill = new THREE.DirectionalLight(0xaacfff, 1.15);
    fill.position.set(13, 9, -9);
    scene.add(fill);

    const sun = new THREE.DirectionalLight(0xffefd1, 3.75);
    sun.position.set(-11, 21, 12);
    sun.castShadow = PERFORMANCE_BUDGET.shadows;
    sun.shadow.mapSize.set(PERFORMANCE_BUDGET.shadowMapSize, PERFORMANCE_BUDGET.shadowMapSize);
    sun.shadow.camera.left = -14;
    sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -14;
    scene.add(sun);

    clock = new THREE.Clock();
    buildWorld();
  }

  function campaignTierForPhase(phase) {
    return 1 + (Math.floor((Math.max(1, Number(phase) || 1) - 1) / 5) % 3);
  }

  function campaignTierLabel(tier) {
    return tier === 3 ? 'RUINED URBAN PERIMETER' : tier === 2 ? 'COLLAPSED INDUSTRIAL SECTOR' : 'OVERRUN FORWARD OUTPOST';
  }

  function campaignSectorLabel(phase) {
    const index = Math.floor((Math.max(1, Number(phase) || 1) - 1) / 5);
    return ['REDHAVEN OUTSKIRTS', 'BLACKRIDGE INDUSTRIAL', 'WESTBRIDGE QUARANTINE', 'EVACUATION CORRIDOR', 'RUINED CITY CENTER', 'GROUND ZERO'][Math.min(index, 5)] || 'GROUND ZERO';
  }

  function campaignBossLabel(phase) {
    const cycle = Math.floor((Math.max(1, Number(phase) || 1) - 1) / 5) % 3;
    return cycle === 1 ? 'JUGGERNAUT' : cycle === 2 ? 'OUTBREAK PRIME' : 'SIEGE BREAKER';
  }

  function syncCampaignWorld(run, dt) {
    if (!run || run.operation) return;
    const tier = campaignTierForPhase(run.phase);
    const assault = Math.max(1, Math.min(3, Number(run.assault) || 1));
    campaignTierGroups.forEach((group, index) => { group.visible = index === tier - 1; });
    campaignDamageGroups.forEach((group, index) => { group.visible = assault >= index + 2; });
    const palette = tier === 3
      ? { ground: 0x343638, road: 0x272a2c, sky: 0x303438, near: 25, far: 45 }
      : tier === 2
        ? { ground: 0x3d4238, road: 0x2d312e, sky: 0x363c35, near: 28, far: 48 }
        : { ground: 0x46573d, road: 0x343e31, sky: 0x41513f, near: 31, far: 52 };
    if (campaignGroundMaterial) campaignGroundMaterial.color.setHex(palette.ground);
    campaignRoadMaterials.forEach(roadMaterial => roadMaterial.color.setHex(palette.road));
    scene.background.setHex(palette.sky);
    scene.fog.color.setHex(palette.sky);
    scene.fog.near = palette.near - (assault - 1) * 1.5;
    scene.fog.far = palette.far - (assault - 1) * 2;
    campaignAtmosphere.forEach((record, index) => {
      const time = (run.elapsed || 0) * record.drift + index;
      record.mesh.position.y = record.baseY + Math.sin(time * 1.7) * .24 + ((run.elapsed || 0) * record.drift) % 1.1;
      record.mesh.rotation.y += dt * (.08 + index * .006);
      if (record.mesh.material) record.mesh.material.opacity = .18 + Math.sin(time) * .045 + (assault - 1) * .025;
    });
    if (displayedCampaignTier !== tier || badge) {
      const alert = run.bossSpawned && !run.bossDefeated ? ` · ${campaignBossLabel(run.phase)}` : assault === 3 ? ' · FINAL ASSAULT' : '';
      setBadgeText(`PHASE ${run.phase} · ${campaignSectorLabel(run.phase)}${alert}`);
      displayedCampaignTier = tier;
    }
  }

  function applyCameraFeedback(run) {
    camera.position.copy(cameraHomePosition);
    cameraShakeTarget.copy(cameraHomeTarget);
    if (REDUCED_MOTION || !run) {
      camera.lookAt(cameraShakeTarget);
      return;
    }
    const pulse = Math.max(Number(run.artilleryPulse) || 0, Number(run.destructionPulse) || 0);
    if (pulse > 0) {
      const time = (run.elapsed || 0) * 46;
      const strength = Math.min(.14, pulse * .13);
      camera.position.x += Math.sin(time * 1.7) * strength;
      camera.position.y += Math.cos(time * 2.3) * strength * .45;
      camera.position.z += Math.sin(time * 2.9) * strength * .6;
      cameraShakeTarget.x += Math.cos(time * 1.3) * strength * .32;
    }
    camera.lookAt(cameraShakeTarget);
  }

  function setWorldMode(run) {
    const nextMode = run && run.operationKind === 'junkyard' ? 'junkyard' : run && run.operation ? 'operation' : 'campaign';
    if (activeWorldMode === nextMode) return;
    activeWorldMode = nextMode;
    const operation = nextMode === 'operation';
    const junkyard = nextMode === 'junkyard';
    const specialOperation = operation || junkyard;
    campaignWorldObjects.forEach(object => { object.visible = !specialOperation; });
    if (operationWorldGroup) operationWorldGroup.visible = operation;
    if (junkyardWorldGroup) junkyardWorldGroup.visible = junkyard;
    if (junkyardVehicleGroup && !junkyard) junkyardVehicleGroup.visible = false;
    if (junkyard) {
      camera.fov = 49;
      cameraHomePosition.set(11.4, 9.1, 14.9);
      cameraHomeTarget.set(-.45, .58, -.8);
      camera.position.set(11.4, 9.1, 14.9);
      camera.lookAt(-.45, .58, -.8);
      scene.background.setHex(0x211810);
      scene.fog.color.setHex(0x211810);
      scene.fog.near = 19;
      scene.fog.far = 40;
      setBadgeText(battlefieldBadge(run));
    } else if (operation) {
      camera.fov = 51;
      cameraHomePosition.set(0, 7.4, 13.8);
      cameraHomeTarget.set(0, .65, -3.9);
      camera.position.set(0, 7.4, 13.8);
      camera.lookAt(0, .65, -3.9);
      scene.background.setHex(0x111d22);
      scene.fog.color.setHex(0x111d22);
      scene.fog.near = 18;
      scene.fog.far = 38;
      setBadgeText(battlefieldBadge(run));
    } else {
      camera.fov = 45;
      cameraHomePosition.set(0, 24.5, 24.2);
      cameraHomeTarget.set(0, 0, -1.1);
      camera.position.set(0, 24.5, 24.2);
      camera.lookAt(0, 0, -1.1);
      scene.background.setHex(0x41513f);
      scene.fog.color.setHex(0x41513f);
      scene.fog.near = 31;
      scene.fog.far = 52;
      setBadgeText('CENTRAL HQ · HOLT ON STATION');
    }
    camera.updateProjectionMatrix();
  }

  function loadFBX(file, root = ASSET_ROOT) {
    const loader = new FBXLoader();
    loader.setResourcePath(root);
    return new Promise((resolve, reject) => {
      loader.load(root + file, resolve, undefined, reject);
    });
  }

  function loadTexture(file, root = HQ_ASSET_ROOT) {
    const loader = new THREE.TextureLoader();
    return new Promise((resolve, reject) => {
      loader.load(root + file, texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        resolve(texture);
      }, undefined, reject);
    });
  }

  function makeClipInPlace(source, name, lockVertical) {
    if (!source || !source.animations || !source.animations[0]) {
      throw new Error(`Missing ${name} animation`);
    }

    const clip = source.animations[0].clone();
    clip.name = name;
    clip.tracks.forEach(track => {
      if (!/hips\.position$/i.test(track.name)) return;
      const itemSize = track.getValueSize();
      const baseX = track.values[0];
      const baseY = track.values[1];
      const baseZ = track.values[2];
      for (let i = 0; i < track.values.length; i += itemSize) {
        track.values[i] = baseX;
        if (lockVertical) track.values[i + 1] = baseY;
        track.values[i + 2] = baseZ;
      }
    });
    return clip;
  }

  function makeStaticPoseClip(source, name, sampleTime) {
    if (!source || !source.animations || !source.animations[0]) {
      throw new Error(`Missing ${name} pose source`);
    }
    const sourceClip = source.animations[0];
    const time = Math.max(0, Math.min(sourceClip.duration - .0001, sampleTime || 0));
    const tracks = sourceClip.tracks.map(track => {
      const itemSize = track.getValueSize();
      const sampled = track.createInterpolant(new Float32Array(itemSize)).evaluate(time);
      const values = new Float32Array(itemSize * 2);
      values.set(sampled, 0);
      values.set(sampled, itemSize);
      return new track.constructor(track.name, [0, 1], values, track.getInterpolation());
    });
    return new THREE.AnimationClip(name, 1, tracks);
  }

  function prepareZombieModel(object) {
    const bounds = new THREE.Box3().setFromObject(object);
    const height = Math.max(.01, bounds.max.y - bounds.min.y);
    object.scale.setScalar(1.72 / height);

    const scaled = new THREE.Box3().setFromObject(object);
    object.position.y -= scaled.min.y;

    object.traverse(child => {
      if (!child.isMesh) return;
      child.castShadow = PERFORMANCE_BUDGET.shadows;
      child.receiveShadow = true;
      child.frustumCulled = false;
      const sources = Array.isArray(child.material) ? child.material : [child.material];
      const prepared = sources.map(source => {
        if (!source) return source;
        const copy = source.clone();
        if ('roughness' in copy && copy.roughness == null) copy.roughness = .76;
        if ('metalness' in copy && copy.metalness == null) copy.metalness = .03;
        copy.needsUpdate = true;
        return copy;
      });
      child.material = Array.isArray(child.material) ? prepared : prepared[0];
    });
  }

  function prepareHQModel(object, texture, sizing) {
    object.animations = [];
    object.traverse(child => {
      if (!child.isMesh) return;
      child.material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        roughness: .78,
        metalness: .08,
      });
      child.castShadow = PERFORMANCE_BUDGET.shadows;
      child.receiveShadow = true;
    });

    const bounds = new THREE.Box3().setFromObject(object);
    const size = bounds.getSize(new THREE.Vector3());
    const scale = sizing.height
      ? sizing.height / Math.max(.01, size.y)
      : sizing.footprint / Math.max(.01, size.x, size.z);
    object.scale.setScalar(scale);
    const wrapper = new THREE.Group();
    wrapper.add(object);
    const scaledBounds = new THREE.Box3().setFromObject(object);
    const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());
    object.position.x -= scaledCenter.x;
    object.position.y -= scaledBounds.min.y;
    object.position.z -= scaledCenter.z;
    return wrapper;
  }

  function prepareHoltModel(object) {
    const colors = {
      Body: 0xb98163,
      Eyes: 0x18201f,
      Eyelashes: 0x101514,
      Shoes: 0x111816,
      Bottoms: 0x293b34,
      Eyewear: 0x8fe8f5,
      Hats: 0x20342f,
      Tops: 0x3e5f52,
    };
    object.traverse(child => {
      if (!child.isMesh) return;
      child.material = new THREE.MeshStandardMaterial({
        color: colors[child.name] || 0x405a50,
        roughness: child.name === 'Eyewear' ? .34 : .7,
        metalness: child.name === 'Eyewear' ? .24 : .04,
        emissive: child.name === 'Eyewear' ? 0x0b3440 : 0x000000,
        emissiveIntensity: child.name === 'Eyewear' ? .45 : 0,
      });
      child.castShadow = PERFORMANCE_BUDGET.shadows;
      child.receiveShadow = true;
      child.frustumCulled = false;
    });

    const bounds = new THREE.Box3().setFromObject(object);
    const height = Math.max(.01, bounds.max.y - bounds.min.y);
    object.scale.setScalar(1.82 / height);
    object.updateMatrixWorld(true);
    const scaled = new THREE.Box3().setFromObject(object);
    const center = scaled.getCenter(new THREE.Vector3());
    object.position.x -= center.x;
    object.position.y -= scaled.min.y;
    object.position.z -= center.z;

    const wrapper = new THREE.Group();
    wrapper.name = 'Commander Holt animated model';
    wrapper.add(object);
    return wrapper;
  }

  async function loadHoltAssets() {
    const [model, firing, weapon, weaponTexture] = await Promise.all([
      loadFBX(FILES.holtModel),
      loadFBX(FILES.holtFire),
      loadFBX(HOLT_FILES.weapon, HOLT_ASSET_ROOT),
      loadTexture(HOLT_FILES.texture, HOLT_ASSET_ROOT),
    ]);

    const idleClip = makeClipInPlace(model, 'holt-idle-aim', true);
    const firingClip = makeClipInPlace(firing, 'holt-rifle-fire', true);
    const wrapper = prepareHoltModel(model);

    weapon.traverse(child => {
      if (!child.isMesh) return;
      child.material = new THREE.MeshStandardMaterial({
        map: weaponTexture,
        color: 0x4b5552,
        roughness: .4,
        metalness: .46,
      });
      child.castShadow = PERFORMANCE_BUDGET.shadows;
      child.receiveShadow = true;
    });
    weapon.position.set(-2, -1.2, 0);
    weapon.rotation.set(0, 0, 0);

    let rightHand = null;
    let leftHand = null;
    model.traverse(node => {
      if (!rightHand && node.isBone && node.name === 'mixamorigRightHand') rightHand = node;
      if (!leftHand && node.isBone && node.name === 'mixamorigLeftHand') leftHand = node;
    });
    if (!rightHand) throw new Error('Commander Holt right-hand bone is missing');
    if (!leftHand) throw new Error('Commander Holt support-hand bone is missing');
    heroRightHand = rightHand;
    heroLeftHand = leftHand;
    heroWeaponMount = new THREE.Group();
    heroWeaponMount.name = 'Commander Holt two-hand rifle mount';
    heroRightHand.add(heroWeaponMount);
    heroWeaponMount.add(weapon);
    heroWeapon = weapon;

    heroMuzzle = new THREE.Mesh(
      new THREE.ConeGeometry(4.2, 13, 7),
      new THREE.MeshBasicMaterial({ color: 0xffef76, transparent: true, opacity: .96 })
    );
    heroMuzzle.name = 'Commander Holt rifle flash';
    heroMuzzle.position.set(55.5, 6.4, 0);
    heroMuzzle.rotation.z = -Math.PI / 2;
    heroMuzzle.visible = false;
    weapon.add(heroMuzzle);

    heroMuzzleLight = new THREE.PointLight(0xffcf55, 0, 2.6, 2);
    heroMuzzleLight.position.copy(heroMuzzle.position);
    weapon.add(heroMuzzleLight);

    heroMixer = new THREE.AnimationMixer(model);
    heroIdleAction = heroMixer.clipAction(idleClip);
    heroIdleAction.setLoop(THREE.LoopRepeat, Infinity);
    heroIdleAction.play();
    heroFireAction = heroMixer.clipAction(firingClip);
    heroFireAction.setLoop(THREE.LoopOnce, 1);
    heroFireAction.clampWhenFinished = true;

    if (heroFallbackGroup) heroFallbackGroup.visible = false;
    heroGroup = wrapper;
    heroBaseScale.copy(heroGroup.scale);
    staticGroup.add(heroGroup);
  }

  async function loadHQAssets() {
    const [baseObject, baseTexture, radioObject, radioTexture, towerObject, towerTexture] = await Promise.all([
      loadFBX(HQ_FILES.base[0], HQ_ASSET_ROOT),
      loadTexture(HQ_FILES.base[1]),
      loadFBX(HQ_FILES.radio[0], HQ_ASSET_ROOT),
      loadTexture(HQ_FILES.radio[1]),
      loadFBX(HQ_FILES.tower[0], HQ_ASSET_ROOT),
      loadTexture(HQ_FILES.tower[1]),
    ]);

    hqAssetGroup = new THREE.Group();
    hqAssetGroup.name = 'Modular headquarters';
    staticGroup.add(hqAssetGroup);

    hqBase = prepareHQModel(baseObject, baseTexture, { footprint: 3.05 });
    hqBase.name = 'HQ level 1 center base';
    hqBase.position.z += .18;
    hqAssetGroup.add(hqBase);

    hqRadio = prepareHQModel(radioObject, radioTexture, { height: 3.15 });
    hqRadio.name = 'HQ level 2 radio tower';
    hqRadio.position.set(-1.82, 0, -1.18);
    hqAssetGroup.add(hqRadio);

    const preparedTower = prepareHQModel(towerObject, towerTexture, { height: 1.9 });
    const leftTower = preparedTower;
    leftTower.name = 'HQ level 3 west security tower';
    leftTower.position.set(-2.02, 0, .82);
    hqAssetGroup.add(leftTower);
    hqTowers.push(leftTower);

    const rightTower = preparedTower.clone(true);
    rightTower.name = 'HQ level 3 east security tower';
    rightTower.position.set(2.02, 0, .82);
    rightTower.rotation.y = Math.PI;
    hqAssetGroup.add(rightTower);
    hqTowers.push(rightTower);

    hqFallbackGroup.visible = false;
  }

  async function loadAssets() {
    if (loading) return loading;

    loading = (async () => {
      const [model, scout, run, attack, death] = await Promise.all([
        loadFBX(FILES.model),
        loadFBX(FILES.scout),
        loadFBX(FILES.run),
        loadFBX(FILES.attack),
        loadFBX(FILES.death),
      ]);

      prepareZombieModel(model);
      prepareZombieModel(scout);
      zombieTemplates.soldier = model;
      zombieTemplates.scout = scout;
      clips = {
        run: makeClipInPlace(run, 'zombie-run', false),
        attack: makeClipInPlace(attack, 'zombie-punch', true),
        waiting: makeStaticPoseClip(attack, 'zombie-ready', 0),
        death: makeClipInPlace(death, 'zombie-death', false),
      };

      try {
        await loadHoltAssets();
      } catch (holtError) {
        console.warn('Build 187 Commander Holt fallback:', holtError);
        if (heroFallbackGroup) heroFallbackGroup.visible = true;
      }

      try {
        await loadHQAssets();
      } catch (hqError) {
        console.warn('Build 187 modular HQ fallback:', hqError);
        hqFallbackGroup.visible = true;
      }

      setBadgeText(activeWorldMode === 'junkyard' ? 'JUNKYARD RECOVERY · ARMORED CONVOY' : activeWorldMode === 'operation' ? 'DAILY OPERATION · FORWARD CONTAINMENT LINE' : 'CENTRAL HQ · HOLT ON STATION');
      return true;
    })().catch(error => {
      console.warn('Build 187 battlefield asset fallback:', error);
      setBadgeText('CENTRAL HQ · 2D FALLBACK');
      if (view) view.style.display = 'none';
      if (sourceCanvas) sourceCanvas.style.visibility = 'visible';
      return false;
    });

    return loading;
  }

  function zombieVariant(entity) {
    if (entity.variant) return entity.variant;
    if (entity.kind === 'runner') return 'scout';
    if (entity.kind === 'grunt' && entity.id % 4 === 1) return 'scout';
    return 'soldier';
  }

  function zombieTint(kind, variant, bossGrade, bossArchetype) {
    if (kind === 'boss') {
      return bossArchetype === 'outbreak' ? 0x563848 : bossArchetype === 'juggernaut' ? 0x52615a : 0x7b402e;
    }
    if (kind === 'armored') return 0x786b4d;
    if (kind === 'runner') return 0x829ba6;
    if (variant === 'scout') return 0x9a8d83;
    return 0x789078;
  }

  function tintZombie(root, kind, variant, bossGrade, bossArchetype) {
    const tintColor = new THREE.Color(zombieTint(kind, variant, bossGrade, bossArchetype));
    const grade = kind === 'boss' ? Math.max(1, Math.min(3, Number(bossGrade) || 1)) : 0;
    const materials = [];

    root.traverse(child => {
      if (!child.isMesh) return;
      const sources = Array.isArray(child.material) ? child.material : [child.material];
      const tinted = sources.map(source => {
        if (!source) return source;
        const copy = source.clone();
        if (copy.color) {
          if (kind === 'boss') copy.color.lerp(tintColor, .72);
          else copy.color.multiply(tintColor).lerp(new THREE.Color(0xffffff), .32);
        }
        if (kind === 'boss') {
          copy.roughness = grade >= 3 ? .9 : grade === 2 ? .82 : .74;
          copy.metalness = Math.min(.16, Number(copy.metalness) || 0);
        }
        copy.transparent = false;
        copy.opacity = 1;
        copy.needsUpdate = true;
        materials.push(copy);
        return copy;
      });
      child.material = Array.isArray(child.material) ? tinted : tinted[0];
    });

    return materials;
  }

  function buildBossSkin(root, bossArchetype) {
    const type = bossArchetype || 'siege';
    const skin = { materials: [], armorParts: [] };
    const addPart = (mesh, baseEmissive) => {
      mesh.castShadow = PERFORMANCE_BUDGET.shadows;
      mesh.receiveShadow = true;
      mesh.material.userData.baseEmissive = baseEmissive || 0;
      skin.materials.push(mesh.material);
      root.add(mesh);
      return mesh;
    };
    if (type === 'juggernaut') {
      const chest = new THREE.Mesh(new THREE.SphereGeometry(.34, 12, 8), material(0x4e5c59, { metalness: .56, roughness: .5 }));
      chest.name = 'Juggernaut fitted chest plate';
      chest.scale.set(1.04, .82, .42);chest.position.set(0, 1.02, -.14);skin.armorParts.push(addPart(chest));
      [-.34, .34].forEach((x, index) => {
        const plate = new THREE.Mesh(new THREE.SphereGeometry(.2, 10, 7), material(0x697772, { metalness: .52, roughness: .48 }));
        plate.name = `Juggernaut fitted shoulder plate ${index + 1}`;
        plate.scale.set(1.18, .7, .72);plate.position.set(x, 1.29, -.02);plate.rotation.z = x < 0 ? -.18 : .18;skin.armorParts.push(addPart(plate));
      });
      const guard = new THREE.Mesh(new THREE.TorusGeometry(.21, .045, 7, 12, Math.PI), material(0x3e4b4a, { metalness: .64, roughness: .4 }));
      guard.name = 'Juggernaut fitted neck guard';guard.position.set(0, 1.48, -.04);guard.rotation.x = Math.PI / 2;skin.armorParts.push(addPart(guard));
    } else if (type === 'outbreak') {
      [[0,.76,.25,.02],[-.2,1.03,.23,-.18],[.2,1.27,.21,.18],[0,1.49,.18,0]].forEach((spine, index) => {
        const mesh = new THREE.Mesh(
          new THREE.ConeGeometry(.11 + index * .01, .4 + index * .035, 7),
          material(0x743654, { roughness: .9, emissive: 0x5d103c, emissiveIntensity: .7 })
        );
        mesh.name = `Outbreak fitted dorsal spine ${index + 1}`;
        mesh.position.set(spine[0], spine[1], spine[2]);
        mesh.rotation.set(Math.PI / 2 + spine[3], 0, spine[3]);
        addPart(mesh, 0x5d103c);
      });
      [[-.35,1.25,.01],[.35,1.25,.01],[-.23,.79,.15],[.23,.79,.15]].forEach((position, index) => {
        const node = new THREE.Mesh(
          new THREE.IcosahedronGeometry(.135 + (index % 2) * .025, 1),
          material(index < 2 ? 0xa34278 : 0x783a61, { roughness: .84, emissive: 0x6b1249, emissiveIntensity: .85 })
        );
        node.name = `Outbreak fitted growth ${index + 1}`;
        node.position.set(position[0], position[1], position[2]);
        addPart(node, 0x6b1249);
      });
    } else {
      const harness = new THREE.Mesh(new THREE.TorusGeometry(.3, .035, 7, 16), material(0x9a6337, { metalness: .35, roughness: .58 }));
      harness.name = 'Siege Breaker command harness';harness.position.set(0, 1.05, -.12);harness.rotation.x = Math.PI / 2;addPart(harness);
    }
    return skin;
  }

  function findHips(root) {
    let hips = null;
    root.traverse(node => {
      if (hips || !node.isBone) return;
      const name = (node.name || '').toLowerCase().replace(/[^a-z]/g, '');
      if (name.endsWith('hips')) hips = node;
    });
    return hips;
  }

  function unitKey(entity) {
    return entity && entity.id != null ? `unit-${entity.id}` : entity;
  }

  function makeZombie(entity, scale, key) {
    const variant = zombieVariant(entity);
    const template = zombieTemplates[variant] || zombieTemplates.soldier;
    const model = SkeletonUtils.clone(template);
    const root = new THREE.Group();
    root.name = entity.kind === 'boss' ? 'Infected boss' : 'Infected enemy';
    root.add(model);
    root.scale.setScalar(scale || 1);
    scene.add(root);

    // Boss identity pieces stay close to the animated body so each target is
    // recognizable without the oversized floating boxes used by older builds.
    const materials = tintZombie(model, entity.kind, variant, entity.bossGrade, entity.bossArchetype);
    const bossSkin = entity.kind === 'boss' ? buildBossSkin(root, entity.bossArchetype) : { materials: [], armorParts: [] };
    materials.push(...bossSkin.materials);
    const mixer = new THREE.AnimationMixer(root);
    const actions = {
      run: mixer.clipAction(clips.run),
      attack: mixer.clipAction(clips.attack),
      waiting: mixer.clipAction(clips.waiting),
      death: mixer.clipAction(clips.death),
    };

    const hips = findHips(model);
    const record = {
      entity,
      root,
      model,
      mixer,
      actions,
      state: null,
      variant,
      hips,
      hipsAnchor: hips ? hips.position.clone() : null,
      materials,
      bossArmorParts: bossSkin.armorParts,
    };
    units.set(key, record);
    return record;
  }

  function selectZombieState(entity, dead) {
    if (dead) return 'death';
    if (entity.moving) return 'run';
    if (entity.engaged) return 'attack';
    return 'waiting';
  }

  function setZombieState(record, next, deathDuration) {
    if (record.state === next) return;
    const previous = record.state ? record.actions[record.state] : null;
    const action = record.actions[next];
    if (!action) return;

    action.reset();
    action.enabled = true;
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(1);
    action.setLoop(next === 'death' ? THREE.LoopOnce : THREE.LoopRepeat, next === 'death' ? 1 : Infinity);
    action.clampWhenFinished = next === 'death';
    if (next === 'death' && deathDuration) action.setDuration(Math.max(.35, deathDuration));
    if (next === 'attack') action.setDuration(ATTACK_CYCLE_SECONDS);
    action.play();
    if (previous) action.crossFadeFrom(previous, next === 'death' ? .08 : .16, true);
    record.state = next;
  }

  function world(entity, run) {
    const denominator = Math.min(sourceCanvas.width, sourceCanvas.height) * .54 + 45 * (devicePixelRatio || 1);
    const k = 8.2 / Math.max(1, denominator);
    return [(entity.x - run.hq.x) * k, (entity.y - run.hq.y) * k];
  }

  function updateZombieMaterials(record, entity, dead) {
    const fadeWindow = entity.kind === 'boss' ? .38 : .24;
    const opacity = dead
      ? (entity.life > fadeWindow ? 1 : Math.min(1, Math.max(0, (entity.life || 0) / fadeWindow)))
      : 1;
    const hit = !dead && (entity.hit || 0) > 0;
    const armorHit = !dead && (entity.armorHit || 0) > 0;

    record.materials.forEach(item => {
      if (!item) return;
      item.transparent = opacity < 1;
      item.opacity = opacity;
      item.depthWrite = opacity > .42;
      if (item.emissive) {
        const baseEmissive = Number(item.userData && item.userData.baseEmissive) || 0;
        item.emissive.setHex(armorHit ? 0x4aafc8 : hit ? 0x7a1b12 : baseEmissive);
        item.emissiveIntensity = armorHit ? 1.15 : hit ? .85 : baseEmissive ? .72 : 0;
      }
    });
  }

  function syncZombie(entity, run, scale, dead, dt, live) {
    const key = unitKey(entity);
    let record = units.get(key);
    if (!record) record = makeZombie(entity, scale, key);
    record.entity = entity;
    live.add(key);

    const position = world(entity, run);
    const rotation = -(entity.aim || 0) + Math.PI / 2;
    record.root.position.set(position[0], 0, position[1]);
    record.root.rotation.y = rotation;

    setZombieState(record, selectZombieState(entity, dead), dead ? entity.max : null);
    if (!dead && record.state === 'run') record.actions.run.setEffectiveTimeScale(1);
    record.mixer.update(dt);

    // Mixamo motion clips animate the hips directly. Reset their translation
    // after every mixer update, then reassert the entity transform. This keeps
    // every unit grounded; the enlarged operation boss made vertical drift
    // especially visible in the forward camera.
    if (record.hips && record.hipsAnchor) {
      record.hips.position.copy(record.hipsAnchor);
    }
    record.root.position.set(position[0], 0, position[1]);
    record.root.rotation.y = rotation;
    if (record.bossArmorParts && record.bossArmorParts.length) {
      const armorVisible = !dead && Number(entity.armor) > 0;
      record.bossArmorParts.forEach(part => { part.visible = armorVisible; });
    }
    updateZombieMaterials(record, entity, dead);
  }

  function bossVisualScale(unit, run) {
    if (run.operation) return OPERATION_BOSS_VISUAL_SCALE;
    if (unit.bossArchetype === 'juggernaut') return 1.82;
    if (unit.bossArchetype === 'outbreak') return 1.74;
    return BOSS_VISUAL_SCALE;
  }

  function syncHQ(run) {
    if (run.operation) {
      [hqAssetGroup, hqFallbackGroup, hqCommsGroup, hqReinforcementGroup, hqTier3WallGroup, hqTier4WallGroup, hqTier5WallGroup, hqLaserGroup, hqShield, commandBastionGroup, commandBastionTier2Group, commandBastionTier3Group, commandBastionTier4Group, commandBastionTier5Group].forEach(group => {
        if (group) group.visible = false;
      });
      displayedHQLevel = 0;
      setBadgeText(battlefieldBadge(run));
      return;
    }
    const level = Math.max(1, Number(run.hq && run.hq.level) || 1);
    if (commandBastionGroup) commandBastionGroup.visible = true;
    if (hqAssetGroup) {
      hqAssetGroup.visible = true;
      hqAssetGroup.scale.setScalar(1 + Math.min(4, level - 1) * .035);
      hqBase.visible = true;
      hqRadio.visible = level >= 2;
      hqTowers.forEach(tower => { tower.visible = level >= 3; });
      hqFallbackGroup.visible = false;
    } else if (hqFallbackGroup) {
      hqFallbackGroup.visible = true;
      hqFallbackGroup.scale.setScalar(1 + Math.min(4, level - 1) * .06);
    }
    if (hqCommsGroup) hqCommsGroup.visible = level >= 2;
    if (hqReinforcementGroup) hqReinforcementGroup.visible = level >= 2;
    if (hqTier3WallGroup) hqTier3WallGroup.visible = level >= 3;
    if (hqTier4WallGroup) hqTier4WallGroup.visible = level >= 4;
    if (hqTier5WallGroup) hqTier5WallGroup.visible = level >= 5;
    if (hqLaserGroup) hqLaserGroup.visible = level >= 4;
    if (hqShield) hqShield.visible = level >= 5;
    if (commandBastionTier2Group) commandBastionTier2Group.visible = level >= 2;
    if (commandBastionTier3Group) commandBastionTier3Group.visible = level >= 3;
    if (commandBastionTier4Group) commandBastionTier4Group.visible = level >= 4;
    if (commandBastionTier5Group) commandBastionTier5Group.visible = level >= 5;

    if (displayedHQLevel !== level) {
      displayedHQLevel = level;
      setBadgeText(`CENTRAL HQ L${level} · HOLT ON STATION`);
    }
  }

  function alignHoltWeapon() {
    if (!heroWeaponMount || !heroWeapon || !heroRightHand || !heroLeftHand) return;
    heroGroup.updateMatrixWorld(true);
    heroLeftHand.getWorldPosition(weaponHandTarget);
    heroRightHand.worldToLocal(weaponHandTarget);
    if (weaponHandTarget.lengthSq() < .0001) return;
    weaponHandTarget.normalize();
    weaponTargetQuaternion.setFromUnitVectors(weaponForwardAxis, weaponHandTarget);
    // The mount follows both animated hands exactly. Interpolating here creates
    // a visible lag during the short firing clip, making the grip look detached.
    heroWeaponMount.quaternion.copy(weaponTargetQuaternion);
  }

  function syncHero(run, dt) {
    if (!heroGroup) return;
    const flashing = (run.hero.flash || 0) > 0;
    if (heroMixer && heroIdleAction && heroFireAction) {
      if (flashing && !heroWasFlashing) {
        heroFireTime = .24;
        heroIdleAction.enabled = true;
        heroIdleAction.setEffectiveWeight(.18);
        heroFireAction.reset();
        heroFireAction.enabled = true;
        heroFireAction.setEffectiveWeight(1);
        heroFireAction.setDuration(.24);
        heroFireAction.play();
      }
      heroWasFlashing = flashing;
      heroFireTime = Math.max(0, heroFireTime - dt);
      if (heroFireTime <= 0 && heroFireAction.isRunning()) {
        heroFireAction.stop();
        heroIdleAction.enabled = true;
        heroIdleAction.setEffectiveWeight(1);
      }
      heroMixer.update(dt);
    }
    const p = world(run.hero, run);
    const deckY = run.operationKind === 'junkyard' ? JUNKYARD_DECK_Y : run.operation ? OPERATION_DECK_Y : COMMAND_BASTION_DECK_Y;
    heroGroup.position.set(p[0], deckY + Math.sin(run.elapsed * 2.8) * .018, p[1]);
    const visualTier = Math.max(1, Math.min(5, Number(run.commanderVisualTier) || 1));
    // Mastery adds armor mass and presence, not giant height. The final tier is
    // roughly fourteen percent broader and only three percent taller.
    heroGroup.scale.set(
      heroBaseScale.x * (1 + (visualTier - 1) * .035),
      heroBaseScale.y * (1 + (visualTier - 1) * .0075),
      heroBaseScale.z * (1 + (visualTier - 1) * .035)
    );
    heroGroup.rotation.y = -(run.hero.aim || -Math.PI / 2) + Math.PI / 2;
    heroGroup.visible = true;
    alignHoltWeapon();
    heroMuzzle.visible = flashing;
    if (heroMuzzle.visible) heroMuzzle.scale.setScalar(.82 + Math.random() * .4);
    if (heroMuzzleLight) heroMuzzleLight.intensity = flashing ? 6.5 : 0;
  }

  function syncTurret(run) {
    if (!turretGroup || !turretYaw) return;
    const p = world(run.turret, run);
    turretGroup.position.set(p[0], run.operationKind === 'junkyard' ? JUNKYARD_DECK_Y : run.operation ? OPERATION_DECK_Y : COMMAND_BASTION_DECK_Y, p[1]);
    turretYaw.rotation.y = -(run.turret.aim || 0) + Math.PI / 2;
    turretGroup.visible = true;
    const level = Math.max(1, Number(run.hq && run.hq.level) || 1);
    if (turretLevel2Group) turretLevel2Group.visible = level >= 2;
    if (turretLevel4Group) turretLevel4Group.visible = level >= 4;
    turretMuzzle.color.setHex(level >= 4 ? 0x6eeeff : level >= 2 ? 0x9cecff : 0xffc05b);
    const flashing = (run.turret.flash || 0) > 0;
    turretMuzzle.intensity = flashing ? 8.5 : 0;
    if (turretFlashGroup) {
      turretFlashGroup.visible = flashing;
      if (flashing) turretFlashGroup.scale.setScalar(.86 + Math.random() * .34);
      turretFlashGroup.children.forEach(child => {
        if (child.material) child.material.color.setHex(level >= 4 ? 0x8ef6ff : 0xffd168);
      });
    }
  }

  function syncArmoredVehicle(run) {
    if (!junkyardVehicleGroup) return;
    if (!run || run.operationKind !== 'junkyard') {
      junkyardVehicleGroup.visible = false;
      return;
    }
    const entity = run.objectiveVehicle || (run.enemies && run.enemies.find(unit => unit.kind === 'vehicle'));
    if (!entity) {
      junkyardVehicleGroup.visible = false;
      return;
    }
    const p = world(entity, run);
    const destroyed = !!(run.vehicleDestroyed || entity.destroyed);
    const hit = !destroyed && (entity.hit || 0) > 0;
    const destructionRatio = destroyed ? Math.max(0, Math.min(1, (Number(run.vehicleDestructionTimer) || 0) / 1.45)) : 0;
    junkyardVehicleGroup.visible = true;
    junkyardVehicleGroup.position.set(p[0], .04, p[1]);
    junkyardVehicleGroup.rotation.set(destroyed ? -.035 : 0, -(entity.aim || 0) + Math.PI / 2, destroyed ? .14 : 0);
    junkyardVehicleBody.forEach(item => {
      const baseColor = item.userData.baseColor == null ? item.color.getHex() : item.userData.baseColor;
      item.color.setHex(baseColor);
      if (destroyed) item.color.multiplyScalar(.48);
      item.emissive.setHex(hit ? 0xa82b0c : destroyed ? 0x170704 : 0x000000);
      item.emissiveIntensity = hit ? 1.15 : destroyed ? .28 : 0;
    });
    junkyardVehicleHeadlights.forEach(mesh => {
      if (mesh.material) mesh.material.emissiveIntensity = destroyed ? .04 : 1.35;
    });
    if (junkyardVehicleBeacon) junkyardVehicleBeacon.intensity = destroyed ? 0 : 2.2 + Math.sin((run.elapsed || 0) * 8) * .8;
    junkyardVehicleFlames.forEach((mesh, index) => {
      mesh.visible = destroyed && destructionRatio > 0;
      if (!mesh.visible) return;
      const flicker = .76 + Math.sin((run.elapsed || 0) * (17 + index * 4) + index) * .18 + Math.random() * .16;
      const openingBurst = Math.min(1.55, .45 + (1 - destructionRatio) * 5.5);
      mesh.scale.setScalar(flicker * Math.min(openingBurst, .55 + destructionRatio * 1.15));
      mesh.rotation.y += .12 + index * .035;
      mesh.material.opacity = Math.min(.96, .35 + destructionRatio * .7);
    });
    if (junkyardVehicleBlastLight) junkyardVehicleBlastLight.intensity = destroyed ? 2.2 + destructionRatio * 7.5 + Math.sin((run.elapsed || 0) * 22) * .8 : 0;
  }

  function syncBarricadeGroup(group, state, level, researchedPerimeter, researchedArmor) {
    const alive = !!state && state.hp > 0;
    group.visible = alive;
    if (!alive) return;
    const ratio = Math.max(0, Math.min(1, state.hp / Math.max(1, state.maxHp)));
    const healthyColor = level >= 5 ? 0x3c6d70 : level >= 4 ? 0x526b68 : level >= 3 ? 0x73785d : level >= 2 ? 0x85744e : 0x806d4a;
    const color = state.flash > 0 ? 0xb34835 : ratio < .35 ? 0x594734 : ratio < .7 ? 0x705b3e : healthyColor;
    group.userData.faceMaterials.forEach(item => {
      item.color.setHex(color);
      item.emissive.setHex(state.flash > 0 ? 0x45150e : 0x000000);
      item.emissiveIntensity = state.flash > 0 ? .8 : 0;
    });
    if (group.userData.reinforced) {
      group.userData.reinforced.visible = level >= 2 || researchedPerimeter;
      group.userData.reinforced.scale.y = level >= 3 ? 1.18 : 1;
    }
    if (group.userData.fortress) {
      group.userData.fortress.visible = level >= 4 || researchedArmor;
      group.userData.fortress.scale.y = level >= 5 ? 1.22 : 1;
    }
    if (group.userData.damageMarks) {
      group.userData.damageMarks.visible = ratio < .7;
      group.userData.damageMarks.children.forEach((mark, index) => { mark.visible = ratio < (index ? .35 : .7); });
    }
    const stress = Math.max(0, Number(state.stress) || 0);
    group.position.y = stress > 0 ? Math.sin(stress * 95) * .025 : 0;
  }

  function syncBarricades(run) {
    if (run.operationKind === 'junkyard') {
      barricadeGroups.concat(operationBarricadeGroups).forEach(group => { group.visible = false; });
      return;
    }
    const level = Math.max(1, Number(run.hq && run.hq.level) || 1);
    const researchedPerimeter = !!(run.research && run.research.barrierHp > 0);
    const researchedArmor = !!(run.research && run.research.barrierDamageReduction > 0);
    const activeGroups = run.operation ? operationBarricadeGroups : barricadeGroups;
    const inactiveGroups = run.operation ? barricadeGroups : operationBarricadeGroups;
    inactiveGroups.forEach(group => { group.visible = false; });
    activeGroups.forEach((group, index) => {
      const state = run.lanes && run.lanes[index] && run.lanes[index].barricade;
      syncBarricadeGroup(group, state, level, researchedPerimeter, researchedArmor);
    });
  }

  function makeTracer(bullet) {
    const geometry = bullet.source === 'turret' ? tracerGeometries.turret : tracerGeometries.standard;
    const tracer = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: bullet.color || 0xffef75,
        transparent: true,
        opacity: .98,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    tracer.frustumCulled = false;
    scene.add(tracer);
    const record = { tracer, geometry };
    tracers.set(bullet, record);
    return record;
  }

  function syncTracers(run, live) {
    run.bullets.forEach(bullet => {
      let record = tracers.get(bullet);
      if (!record) record = makeTracer(bullet);
      live.add(bullet);
      const previous = world({ x: bullet.px, y: bullet.py }, run);
      const current = world(bullet, run);
      const deckY = run.operationKind === 'junkyard' ? JUNKYARD_DECK_Y : run.operation ? OPERATION_DECK_Y : COMMAND_BASTION_DECK_Y;
      const tracerHeight = bullet.source === 'commander'
        ? deckY + 1.08
        : bullet.source === 'turret'
          ? deckY + .76
          : .8;
      const start = new THREE.Vector3(previous[0], tracerHeight, previous[1]);
      const end = new THREE.Vector3(current[0], tracerHeight, current[1]);
      const direction = end.clone().sub(start);
      const length = Math.max(.05, direction.length());
      record.tracer.position.copy(start).add(end).multiplyScalar(.5);
      record.tracer.quaternion.setFromUnitVectors(tracerAxis, direction.normalize());
      record.tracer.scale.set(1, length, 1);
      record.tracer.material.opacity = Math.min(1, Math.max(.42, bullet.life * 2.2));
    });

    for (const [bullet, record] of tracers) {
      if (live.has(bullet)) continue;
      scene.remove(record.tracer);
      record.tracer.material.dispose();
      tracers.delete(bullet);
    }
  }

  function effectKind(particle) {
    const type = String(particle && particle.type || '');
    return Object.prototype.hasOwnProperty.call(effectPool, type) ? type : 'impact';
  }

  function makeEffect(particle) {
    const key = effectKind(particle);
    const isFlat = key === 'shockwave';
    const isSmoke = key === 'smoke';
    const pooled = effectPool[key].pop();
    if (pooled) {
      pooled.effect.visible = true;
      pooled.effect.position.set(0, 0, 0);
      pooled.effect.scale.setScalar(1);
      pooled.effect.rotation.set(isFlat ? -Math.PI / 2 : 0, 0, 0);
      pooled.effect.material.color.set(particle.color || 0xffffff);
      pooled.effect.material.opacity = isSmoke ? .32 : .9;
      pooled.effect.material.blending = isSmoke ? THREE.NormalBlending : THREE.AdditiveBlending;
      scene.add(pooled.effect);
      effects.set(particle, pooled);
      return pooled;
    }
    const geometry = effectGeometries[key];
    const effect = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: particle.color || 0xffffff,
        transparent: true,
        opacity: isSmoke ? .32 : .9,
        blending: isSmoke ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    effect.frustumCulled = false;
    if (isFlat) effect.rotation.x = -Math.PI / 2;
    scene.add(effect);
    const record = { effect, geometry, isFlat, isSmoke, key };
    effects.set(particle, record);
    return record;
  }

  function pooledEffectCount() {
    return Object.keys(effectPool).reduce((total, key) => total + effectPool[key].length, 0);
  }

  function releaseEffect(particle, record) {
    scene.remove(record.effect);
    effects.delete(particle);
    record.effect.visible = false;
    if (pooledEffectCount() < PERFORMANCE_BUDGET.effectPoolCap) effectPool[record.key].push(record);
    else record.effect.material.dispose();
  }

  function syncEffects(run, live) {
    const denominator = Math.min(sourceCanvas.width, sourceCanvas.height) * .54 + 45 * (devicePixelRatio || 1);
    const radiusScale = 8.2 / Math.max(1, denominator);
    run.particles.forEach(particle => {
      if ((particle.delay || 0) > 0) return;
      let record = effects.get(particle);
      if (!record) record = makeEffect(particle);
      live.add(particle);
      const position = world(particle, run);
      const ratio = Math.max(0, Math.min(1, particle.life / Math.max(.01, particle.max || 1)));
      const phase = 1 - ratio;
      const base = Math.max(.045, (particle.r || 8) * radiusScale);
      if (record.key === 'artillery') {
        record.effect.position.set(position[0], 2.15 + phase * .35, position[1]);
        record.effect.scale.set(base * (.28 + phase * .16), .88 + ratio * .34, base * (.28 + phase * .16));
        record.effect.material.opacity = Math.min(1, ratio * 1.35);
      } else if (record.key === 'shockwave') {
        record.effect.position.set(position[0], .07, position[1]);
        record.effect.scale.setScalar(base * (.4 + phase * 1.35));
        record.effect.material.opacity = ratio * .82;
      } else if (record.key === 'fireball' || record.key === 'vehicle-explosion') {
        const vehicleBlast = record.key === 'vehicle-explosion';
        record.effect.position.set(position[0], (vehicleBlast ? 1.15 : .86) + phase * .46, position[1]);
        record.effect.scale.setScalar(base * ((vehicleBlast ? .34 : .28) + phase * (vehicleBlast ? 1.25 : .95)));
        record.effect.rotation.y += .19;
        record.effect.rotation.z += .11;
        record.effect.material.opacity = Math.min(1, ratio * 1.55);
      } else if (record.key === 'smoke') {
        record.effect.position.set(position[0] + Math.sin(phase * 7) * .18, .62 + phase * 2.4, position[1]);
        record.effect.scale.set(base * (.5 + phase * .8), base * (.68 + phase * 1.2), base * (.5 + phase * .8));
        record.effect.rotation.y += .035;
        record.effect.material.opacity = ratio * .34;
      } else {
        const height = particle.type === 'barrier' ? .45 : .78 + Math.sin(phase * Math.PI) * .5;
        record.effect.position.set(position[0], height, position[1]);
        record.effect.scale.setScalar(base * (.72 + phase * .58));
        record.effect.material.opacity = ratio * .92;
      }
      if (record.key === 'debris') {
        record.effect.rotation.x += .18;
        record.effect.rotation.y += .23;
      }
    });

    for (const [particle, record] of effects) {
      if (live.has(particle)) continue;
      releaseEffect(particle, record);
    }
  }

  function removeZombie(key, record) {
    record.mixer.stopAllAction();
    scene.remove(record.root);
    record.materials.forEach(item => item && item.dispose && item.dispose());
    units.delete(key);
  }

  function clearDynamic() {
    for (const [key, record] of units) removeZombie(key, record);
    for (const [, record] of tracers) {
      scene.remove(record.tracer);
      record.tracer.material.dispose();
    }
    tracers.clear();
    for (const [particle, record] of Array.from(effects)) releaseEffect(particle, record);
    if (heroGroup) heroGroup.visible = false;
    if (turretGroup) turretGroup.visible = false;
    if (junkyardVehicleGroup) junkyardVehicleGroup.visible = false;
  }

  function resize() {
    const rect = sourceCanvas.getBoundingClientRect();
    const width = Math.max(2, rect.width | 0);
    const height = Math.max(2, rect.height | 0);
    if (width === renderWidth && height === renderHeight) return;
    renderWidth = width;
    renderHeight = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function sampleAdaptiveQuality(dt) {
    // Keep genuinely slow frames in the sample so sustained sub-22 FPS play
    // still triggers a resolution step-down. Background frames are already
    // excluded by document.hidden and the render clock clamps extreme gaps.
    if (!renderer || document.hidden || dt <= 0) return;
    adaptiveFrameTotal += dt;
    adaptiveFrameCount++;
    if (adaptiveFrameCount < PERFORMANCE_BUDGET.adaptiveSampleFrames) return;
    const average = adaptiveFrameTotal / adaptiveFrameCount;
    adaptiveFrameTotal = 0;
    adaptiveFrameCount = 0;
    let next = adaptivePixelRatio;
    if (average > .025 && adaptivePixelRatio > adaptiveMinPixelRatio) {
      next = Math.max(adaptiveMinPixelRatio, adaptivePixelRatio - .15);
      adaptiveRecoverySamples = 0;
    } else if (average < .018 && adaptivePixelRatio < Math.min(PERFORMANCE_BUDGET.maxPixelRatio, devicePixelRatio || 1)) {
      adaptiveRecoverySamples++;
      if (adaptiveRecoverySamples >= 3) {
        next = Math.min(Math.min(PERFORMANCE_BUDGET.maxPixelRatio, devicePixelRatio || 1), adaptivePixelRatio + .10);
        adaptiveRecoverySamples = 0;
      }
    } else adaptiveRecoverySamples = 0;
    if (Math.abs(next - adaptivePixelRatio) < .01) return;
    adaptivePixelRatio = next;
    renderer.setPixelRatio(adaptivePixelRatio);
    renderWidth = 0;
    renderHeight = 0;
  }

  function completeFirstFrame(ready) {
    if (firstFrameTimer) {
      clearTimeout(firstFrameTimer);
      firstFrameTimer = 0;
    }
    const callback = firstFrameCallback;
    firstFrameCallback = null;
    if (callback) callback(ready);
  }

  api.start = function (canvas, initialRun, onReady) {
    sourceCanvas = canvas;
    try {
      if (!renderer) init();
      active = true;
      setWorldMode(initialRun || { operation: false });
      firstFrameCallback = typeof onReady === 'function' ? onReady : null;
      badge.style.display = 'block';
      setBadgeText(battlefieldBadge(initialRun, !zombieTemplates.soldier));
      sourceCanvas.style.visibility = 'hidden';
      view.style.display = 'none';
      if (firstFrameTimer) clearTimeout(firstFrameTimer);
      firstFrameTimer = setTimeout(() => {
        if (!firstFrameCallback) return;
        active = false;
        view.style.display = 'none';
        sourceCanvas.style.visibility = 'visible';
        completeFirstFrame(false);
      }, 12000);

      loadAssets().then(ready => {
        if (!active) return;
        if (!ready) {
          sourceCanvas.style.visibility = 'visible';
          completeFirstFrame(false);
          return;
        }
        view.style.display = 'block';
        if (initialRun) api.render(initialRun);
      });
    } catch (error) {
      console.warn('Build 187 3D fallback:', error);
      active = false;
      if (view) view.style.display = 'none';
      sourceCanvas.style.visibility = 'visible';
      completeFirstFrame(false);
    }
  };

  api.stop = function () {
    active = false;
    activeWorldMode = '';
    completeFirstFrame(false);
    heroWasFlashing = false;
    heroFireTime = 0;
    if (heroMuzzleLight) heroMuzzleLight.intensity = 0;
    if (heroFireAction) heroFireAction.stop();
    if (heroIdleAction) {
      heroIdleAction.enabled = true;
      heroIdleAction.setEffectiveWeight(1);
      if (!heroIdleAction.isRunning()) heroIdleAction.play();
    }
    clearDynamic();
    if (view) view.style.display = 'none';
    if (badge) badge.style.display = 'none';
    if (sourceCanvas) sourceCanvas.style.visibility = 'visible';
  };

  api.render = function (run) {
    if (!active || !renderer || !zombieTemplates.soldier) return false;

    setWorldMode(run);
    resize();
    const dt = Math.min(.05, clock.getDelta());
    const liveUnits = new Set();
    const liveTracers = new Set();
    const liveEffects = new Set();

    syncCampaignWorld(run, dt);
    syncHQ(run);
    syncHero(run, dt);
    syncTurret(run);
    syncArmoredVehicle(run);
    syncBarricades(run);

    run.enemies.forEach(unit => {
      if (unit.kind === 'vehicle') return;
      const scale = unit.kind === 'boss' ? bossVisualScale(unit, run) : unit.kind === 'armored' ? 1.24 : unit.kind === 'runner' ? .94 : 1.06;
      syncZombie(unit, run, scale, false, dt, liveUnits);
    });
    run.corpses.forEach(unit => {
      const scale = unit.kind === 'boss' ? bossVisualScale(unit, run) : unit.kind === 'armored' ? 1.24 : unit.kind === 'runner' ? .94 : 1.06;
      syncZombie(unit, run, scale, true, dt, liveUnits);
    });

    for (const [key, record] of units) {
      if (!liveUnits.has(key)) removeZombie(key, record);
    }

    syncTracers(run, liveTracers);
    syncEffects(run, liveEffects);
    applyCameraFeedback(run);
    renderer.render(scene, camera);
    sampleAdaptiveQuality(dt);
    if (firstFrameCallback) completeFirstFrame(true);
    return true;
  };

  window.LSC3DPrototype = api;
})();
