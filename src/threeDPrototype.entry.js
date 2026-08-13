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

  const units = new Map();
  const tracers = new Map();
  const effects = new Map();
  const staticGroup = new THREE.Group();
  const tracerAxis = new THREE.Vector3(0, 1, 0);
  const weaponForwardAxis = new THREE.Vector3(1, 0, 0);
  const weaponHandTarget = new THREE.Vector3();
  const weaponTargetQuaternion = new THREE.Quaternion();
  let firstFrameCallback = null;
  let firstFrameTimer = 0;

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
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function shapedMesh(name, geometry, position, color, parent, options, rotation) {
    const mesh = new THREE.Mesh(geometry, material(color, options));
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
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

  function buildWorld() {
    scene.add(staticGroup);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 38),
      material(0x46573d, { roughness: 1, metalness: 0 })
    );
    ground.name = 'Battlefield';
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    staticGroup.add(ground);

    const northSouth = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 34),
      material(0x343e31, { roughness: 1, metalness: 0 })
    );
    northSouth.rotation.x = -Math.PI / 2;
    northSouth.position.y = .012;
    northSouth.receiveShadow = true;
    staticGroup.add(northSouth);

    const eastWest = northSouth.clone();
    eastWest.rotation.z = Math.PI / 2;
    staticGroup.add(eastWest);

    box('HQ foundation', [3.7, .28, 3.2], [0, .14, 0], 0x26342e);
    commandBastionGroup = new THREE.Group();
    commandBastionGroup.name = 'Command Bastion shared Holt and turret fixture';
    box('Command Bastion Holt deck', [1.9, .16, 1.2], [0, .1, 1.72], 0x263d3b, commandBastionGroup, { metalness: .3, roughness: .52 });
    box('Command Bastion turret deck', [1.9, .16, 1.2], [0, .1, -1.5], 0x263d3b, commandBastionGroup, { metalness: .3, roughness: .52 });
    box('Command Bastion west spine', [.12, .12, 3.35], [-.94, .12, .1], 0x6e7d72, commandBastionGroup, { metalness: .48, roughness: .4 });
    box('Command Bastion east spine', [.12, .12, 3.35], [.94, .12, .1], 0x6e7d72, commandBastionGroup, { metalness: .48, roughness: .4 });
    staticGroup.add(commandBastionGroup);

    commandBastionTier2Group = new THREE.Group();
    commandBastionTier2Group.name = 'Command Bastion level 2 armored rails';
    box('Bastion west command rail', [.12, .48, 1.22], [-.91, .34, 1.72], 0x355a57, commandBastionTier2Group, { metalness: .48, roughness: .36 });
    box('Bastion east command rail', [.12, .48, 1.22], [.91, .34, 1.72], 0x355a57, commandBastionTier2Group, { metalness: .48, roughness: .36 });
    commandBastionTier2Group.visible = false;
    staticGroup.add(commandBastionTier2Group);

    commandBastionTier3Group = new THREE.Group();
    commandBastionTier3Group.name = 'Command Bastion level 3 raised deck';
    box('Bastion raised command pad', [1.72, .22, .94], [0, .21, 1.72], 0x47645f, commandBastionTier3Group, { metalness: .5, roughness: .36 });
    box('Bastion command step', [1.2, .16, .35], [0, .08, 2.45], 0x667770, commandBastionTier3Group, { metalness: .38, roughness: .48 });
    commandBastionTier3Group.visible = false;
    staticGroup.add(commandBastionTier3Group);

    commandBastionTier4Group = new THREE.Group();
    commandBastionTier4Group.name = 'Command Bastion level 4 armored nest';
    box('Bastion west armor screen', [.28, .82, .72], [-.78, .55, 1.72], 0x2e5556, commandBastionTier4Group, { metalness: .68, roughness: .28 });
    box('Bastion east armor screen', [.28, .82, .72], [.78, .55, 1.72], 0x2e5556, commandBastionTier4Group, { metalness: .68, roughness: .28 });
    [-1,1].forEach(side => shapedMesh('Bastion targeting light', new THREE.SphereGeometry(.07, 8, 6), [side*.79, .98, 1.92], 0x87f5ff, commandBastionTier4Group, { emissive: 0x2dbbd1, emissiveIntensity: 1.2 }));
    commandBastionTier4Group.visible = false;
    staticGroup.add(commandBastionTier4Group);

    commandBastionTier5Group = new THREE.Group();
    commandBastionTier5Group.name = 'Command Bastion level 5 command fortress';
    box('Bastion west energy rail', [.08, .08, 3.3], [-1.02, .82, .08], 0x8ef6ff, commandBastionTier5Group, { emissive: 0x26aabd, emissiveIntensity: 1.25 });
    box('Bastion east energy rail', [.08, .08, 3.3], [1.02, .82, .08], 0x8ef6ff, commandBastionTier5Group, { emissive: 0x26aabd, emissiveIntensity: 1.25 });
    box('Bastion command shield lip', [1.76, .18, .12], [0, .84, 2.14], 0x65dce7, commandBastionTier5Group, { metalness: .56, emissive: 0x1c7888, emissiveIntensity: .78 });
    commandBastionTier5Group.visible = false;
    staticGroup.add(commandBastionTier5Group);
    hqFallbackGroup = new THREE.Group();
    hqFallbackGroup.name = 'HQ loading fallback';
    staticGroup.add(hqFallbackGroup);
    box('HQ fallback body', [2.35, 1.45, 1.85], [0, 1.02, .2], 0x465c58, hqFallbackGroup);
    box('HQ fallback upper', [1.45, .65, 1.15], [0, 2.05, .28], 0x687c76, hqFallbackGroup);
    box('HQ fallback mast', [.08, 1.3, .08], [0, 3, .28], 0xd0ded8, hqFallbackGroup, { metalness: .4 });

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
      group.userData.faceMaterials = [left.material, right.material];
      group.userData.reinforced = reinforced;
      group.userData.fortress = fortress;
      barricadeGroups.push(group);
    }

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
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
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
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -14;
    sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -14;
    scene.add(sun);

    clock = new THREE.Clock();
    buildWorld();
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
      child.castShadow = true;
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
      child.castShadow = true;
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
      child.castShadow = true;
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
      child.castShadow = true;
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
        console.warn('Build 162 Commander Holt fallback:', holtError);
        if (heroFallbackGroup) heroFallbackGroup.visible = true;
      }

      try {
        await loadHQAssets();
      } catch (hqError) {
        console.warn('Build 162 modular HQ fallback:', hqError);
        hqFallbackGroup.visible = true;
      }

      badge.textContent = 'CENTRAL HQ · HOLT ON STATION';
      return true;
    })().catch(error => {
      console.warn('Build 162 zombie asset fallback:', error);
      badge.textContent = 'CENTRAL HQ · 2D FALLBACK';
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

  function zombieTint(kind, variant) {
    if (kind === 'boss') return 0x9b4038;
    if (kind === 'armored') return 0x786b4d;
    if (kind === 'runner') return 0x829ba6;
    if (variant === 'scout') return 0x9a8d83;
    return 0x789078;
  }

  function tintZombie(root, kind, variant) {
    const tintColor = new THREE.Color(zombieTint(kind, variant));
    const materials = [];

    root.traverse(child => {
      if (!child.isMesh) return;
      const sources = Array.isArray(child.material) ? child.material : [child.material];
      const tinted = sources.map(source => {
        if (!source) return source;
        const copy = source.clone();
        if (copy.color) copy.color.multiply(tintColor).lerp(new THREE.Color(0xffffff), .32);
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

  function addBossArmor(root, grade) {
    if (!root || grade < 2) return { materials: [], geometries: [] };
    const armor = new THREE.Group();
    armor.name = grade >= 3 ? 'Siege Breaker veteran armor' : 'Siege Breaker reinforced armor';
    box('Siege Breaker chest plate', [.82, .36, .22], [0, 1.12, .28], grade >= 3 ? 0x6a342d : 0x55443a, armor, { metalness: .58, roughness: .34 });
    shapedMesh('Siege Breaker left shoulder plate', new THREE.SphereGeometry(.23, 9, 7), [-.46, 1.3, .02], grade >= 3 ? 0x82382f : 0x645246, armor, { metalness: .46, roughness: .4 });
    shapedMesh('Siege Breaker right shoulder plate', new THREE.SphereGeometry(.23, 9, 7), [.46, 1.3, .02], grade >= 3 ? 0x82382f : 0x645246, armor, { metalness: .46, roughness: .4 });
    if (grade >= 3) {
      shapedMesh('Siege Breaker warning core', new THREE.SphereGeometry(.09, 9, 6), [0, 1.13, .41], 0xff6d3c, armor, { emissive: 0x8a1d0c, emissiveIntensity: 1.35 });
      box('Siege Breaker back spine', [.16, .62, .2], [0, 1.48, -.21], 0x3f2422, armor, { metalness: .62, roughness: .3 });
    }
    root.add(armor);
    const materials = [];
    const geometries = [];
    armor.traverse(child => {
      if (!child.isMesh) return;
      if (child.geometry) geometries.push(child.geometry);
      (Array.isArray(child.material) ? child.material : [child.material]).forEach(material => {
        if (material) materials.push(material);
      });
    });
    return { materials, geometries };
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

  function makeZombie(entity, scale) {
    const variant = zombieVariant(entity);
    const template = zombieTemplates[variant] || zombieTemplates.soldier;
    const model = SkeletonUtils.clone(template);
    const root = new THREE.Group();
    root.name = entity.kind === 'boss' ? 'Infected boss' : 'Infected enemy';
    root.add(model);
    root.scale.setScalar(scale || 1);
    const bossArmorResources = entity.kind === 'boss'
      ? addBossArmor(root, Math.max(1, Number(entity.bossGrade) || 1))
      : { materials: [], geometries: [] };
    scene.add(root);

    const materials = tintZombie(model, entity.kind, variant).concat(bossArmorResources.materials);
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
      ownedGeometries: bossArmorResources.geometries,
    };
    units.set(entity, record);
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

    record.materials.forEach(item => {
      if (!item) return;
      item.transparent = opacity < 1;
      item.opacity = opacity;
      item.depthWrite = opacity > .42;
      if (item.emissive) {
        item.emissive.setHex(hit ? 0x7a1b12 : 0x000000);
        item.emissiveIntensity = hit ? .85 : 0;
      }
    });
  }

  function syncZombie(entity, run, scale, dead, dt, live) {
    let record = units.get(entity);
    if (!record) record = makeZombie(entity, scale);
    live.add(entity);

    const position = world(entity, run);
    const rotation = -(entity.aim || 0) + Math.PI / 2;
    record.root.position.set(position[0], 0, position[1]);
    record.root.rotation.y = rotation;

    setZombieState(record, selectZombieState(entity, dead), dead ? entity.max : null);
    if (!dead && record.state === 'run') record.actions.run.setEffectiveTimeScale(1);
    record.mixer.update(dt);

    // Mixamo motion clips animate the hips directly. Reset their horizontal
    // translation after every mixer update, then reassert the entity transform.
    // The visible zombie therefore cannot wander away from its simulation slot.
    if (record.hips && record.hipsAnchor) {
      record.hips.position.x = record.hipsAnchor.x;
      record.hips.position.z = record.hipsAnchor.z;
    }
    record.root.position.set(position[0], 0, position[1]);
    record.root.rotation.y = rotation;
    updateZombieMaterials(record, entity, dead);
  }

  function syncHQ(run) {
    const level = Math.max(1, Number(run.hq && run.hq.level) || 1);
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
      badge.textContent = `CENTRAL HQ L${level} · HOLT ON STATION`;
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
    heroGroup.position.set(p[0], Math.sin(run.elapsed * 2.8) * .018, p[1]);
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
    turretGroup.position.set(p[0], 0, p[1]);
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

  function syncBarricades(run) {
    const level = Math.max(1, Number(run.hq && run.hq.level) || 1);
    const researchedPerimeter = !!(run.research && run.research.barrierHp > 0);
    const researchedArmor = !!(run.research && run.research.barrierDamageReduction > 0);
    barricadeGroups.forEach((group, index) => {
      const state = run.lanes && run.lanes[index] && run.lanes[index].barricade;
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
    });
  }

  function makeTracer(bullet) {
    const radius = bullet.source === 'turret' ? .038 : .026;
    const geometry = new THREE.CylinderGeometry(radius, radius * .72, 1, 6);
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
      const start = new THREE.Vector3(previous[0], .8, previous[1]);
      const end = new THREE.Vector3(current[0], .8, current[1]);
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
      record.geometry.dispose();
      record.tracer.material.dispose();
      tracers.delete(bullet);
    }
  }

  function makeEffect(particle) {
    const isArtillery = particle.type === 'artillery';
    const geometry = isArtillery
      ? new THREE.RingGeometry(.52, 1, 28)
      : particle.type === 'debris'
        ? new THREE.TetrahedronGeometry(1, 0)
        : new THREE.OctahedronGeometry(1, 1);
    const effect = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: particle.color || 0xffffff,
        transparent: true,
        opacity: .9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    effect.frustumCulled = false;
    if (isArtillery) effect.rotation.x = -Math.PI / 2;
    scene.add(effect);
    const record = { effect, geometry, isArtillery };
    effects.set(particle, record);
    return record;
  }

  function syncEffects(run, live) {
    const denominator = Math.min(sourceCanvas.width, sourceCanvas.height) * .54 + 45 * (devicePixelRatio || 1);
    const radiusScale = 8.2 / Math.max(1, denominator);
    run.particles.forEach(particle => {
      let record = effects.get(particle);
      if (!record) record = makeEffect(particle);
      live.add(particle);
      const position = world(particle, run);
      const ratio = Math.max(0, Math.min(1, particle.life / Math.max(.01, particle.max || 1)));
      const base = Math.max(.045, (particle.r || 8) * radiusScale);
      const growth = record.isArtillery ? 1.2 + (1 - ratio) * .9 : .75 + (1 - ratio) * .55;
      const height = record.isArtillery ? .055 : particle.type === 'barrier' ? .45 : .78;
      record.effect.position.set(position[0], height, position[1]);
      record.effect.scale.setScalar(base * growth);
      record.effect.material.opacity = record.isArtillery ? ratio * .78 : ratio * .92;
      if (particle.type === 'debris') {
        record.effect.rotation.x += .18;
        record.effect.rotation.y += .23;
      }
    });

    for (const [particle, record] of effects) {
      if (live.has(particle)) continue;
      scene.remove(record.effect);
      record.geometry.dispose();
      record.effect.material.dispose();
      effects.delete(particle);
    }
  }

  function removeZombie(entity, record) {
    record.mixer.stopAllAction();
    scene.remove(record.root);
    record.materials.forEach(item => item && item.dispose && item.dispose());
    (record.ownedGeometries || []).forEach(item => item && item.dispose && item.dispose());
    units.delete(entity);
  }

  function clearDynamic() {
    for (const [entity, record] of units) removeZombie(entity, record);
    for (const [, record] of tracers) {
      scene.remove(record.tracer);
      record.geometry.dispose();
      record.tracer.material.dispose();
    }
    tracers.clear();
    for (const [, record] of effects) {
      scene.remove(record.effect);
      record.geometry.dispose();
      record.effect.material.dispose();
    }
    effects.clear();
    if (heroGroup) heroGroup.visible = false;
    if (turretGroup) turretGroup.visible = false;
  }

  function resize() {
    const rect = sourceCanvas.getBoundingClientRect();
    const width = Math.max(2, rect.width | 0);
    const height = Math.max(2, rect.height | 0);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
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
      firstFrameCallback = typeof onReady === 'function' ? onReady : null;
      badge.style.display = 'block';
      badge.textContent = zombieTemplates.soldier ? 'CENTRAL HQ · HOLT ON STATION' : 'CENTRAL HQ · LOADING CONTACT';
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
      console.warn('Build 162 3D fallback:', error);
      active = false;
      if (view) view.style.display = 'none';
      sourceCanvas.style.visibility = 'visible';
      completeFirstFrame(false);
    }
  };

  api.stop = function () {
    active = false;
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

    resize();
    const dt = Math.min(.05, clock.getDelta());
    const liveUnits = new Set();
    const liveTracers = new Set();
    const liveEffects = new Set();

    syncHQ(run);
    syncHero(run, dt);
    syncTurret(run);
    syncBarricades(run);

    run.enemies.forEach(unit => {
      const scale = unit.kind === 'boss' ? 1.98 : unit.kind === 'armored' ? 1.24 : unit.kind === 'runner' ? .94 : 1.06;
      syncZombie(unit, run, scale, false, dt, liveUnits);
    });
    run.corpses.forEach(unit => {
      const scale = unit.kind === 'boss' ? 1.98 : unit.kind === 'armored' ? 1.24 : unit.kind === 'runner' ? .94 : 1.06;
      syncZombie(unit, run, scale, true, dt, liveUnits);
    });

    for (const [entity, record] of units) {
      if (!liveUnits.has(entity)) removeZombie(entity, record);
    }

    syncTracers(run, liveTracers);
    syncEffects(run, liveEffects);
    renderer.render(scene, camera);
    if (firstFrameCallback) completeFirstFrame(true);
    return true;
  };

  window.LSC3DPrototype = api;
})();
