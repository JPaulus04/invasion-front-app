import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

(function () {
  'use strict';

  const api = {};
  const ASSET_ROOT = 'assets/prototype4/';
  const HQ_ASSET_ROOT = 'assets/prototype4/hq/';
  const LANE_COUNT = 8;
  const LANE_ANGLE_OFFSET = Math.PI / 8;
  const BARRICADE_WORLD_RADIUS = 5.7;
  const ATTACK_CYCLE_SECONDS = 1.05;
  const FILES = {
    model: 'Zombie-Soldier.fbx',
    scout: 'Zombie-Scout.fbx',
    run: 'Zombie-Run.fbx',
    attack: 'Zombie-Punch.fbx',
    death: 'Zombie-Death.fbx',
  };
  const HQ_FILES = {
    base: ['Center-Base.fbx', 'Center-Base-BaseColor.jpg'],
    radio: ['Radio-Tower.fbx', 'Radio-Tower-BaseColor.jpg'],
    tower: ['Security-Tower.fbx', 'Security-Tower-BaseColor.jpg'],
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
  let heroMuzzle = null;
  let turretGroup = null;
  let turretYaw = null;
  let turretMuzzle = null;
  let hqFallbackGroup = null;
  let hqAssetGroup = null;
  let hqBase = null;
  let hqRadio = null;
  const hqTowers = [];
  let hqCommsGroup = null;
  let hqLaserGroup = null;
  let hqShield = null;
  let displayedHQLevel = 0;
  const barricadeGroups = [];

  const units = new Map();
  const tracers = new Map();
  const staticGroup = new THREE.Group();

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
    heroGroup = new THREE.Group();
    heroGroup.name = 'Commander Holt';

    // A compact armored silhouette reads far better from the top-down camera
    // than the old stack of rectangular blocks. The weapon is an integrated
    // forearm cannon, so it cannot detach from the commander.
    shapedMesh('Holt left leg', new THREE.CylinderGeometry(.105, .12, .5, 9), [-.15, .31, 0], 0x172322, heroGroup, { metalness: .2 });
    shapedMesh('Holt right leg', new THREE.CylinderGeometry(.105, .12, .5, 9), [.15, .31, 0], 0x172322, heroGroup, { metalness: .2 });
    box('Holt left boot', [.25, .18, .38], [-.15, .1, .07], 0x101918, heroGroup, { metalness: .25 });
    box('Holt right boot', [.25, .18, .38], [.15, .1, .07], 0x101918, heroGroup, { metalness: .25 });
    shapedMesh('Holt torso', new THREE.CapsuleGeometry(.31, .48, 5, 10), [0, .88, 0], 0x2f7569, heroGroup, { metalness: .22, roughness: .56 });
    box('Holt chest plate', [.56, .35, .2], [0, .96, .24], 0x163f40, heroGroup, { metalness: .42, roughness: .38 });
    box('Holt command stripe', [.4, .055, .215], [0, 1.04, .255], 0xf0bf4b, heroGroup, { metalness: .32, emissive: 0x4a2700, emissiveIntensity: .24 });
    shapedMesh('Holt left shoulder', new THREE.SphereGeometry(.17, 10, 7), [-.36, 1.07, .02], 0x245b57, heroGroup, { metalness: .26 });
    shapedMesh('Holt right shoulder', new THREE.SphereGeometry(.19, 10, 7), [.36, 1.07, .02], 0x245b57, heroGroup, { metalness: .26 });
    shapedMesh('Holt left forearm', new THREE.CylinderGeometry(.085, .11, .58, 9), [-.29, .92, .3], 0x244f4b, heroGroup, { metalness: .28 }, [Math.PI / 2, 0, 0]);
    shapedMesh('Holt arm cannon', new THREE.CylinderGeometry(.105, .15, .82, 10), [.31, 1.02, .45], 0x18282d, heroGroup, { metalness: .62, roughness: .28 }, [Math.PI / 2, 0, 0]);
    shapedMesh('Holt cannon ring', new THREE.TorusGeometry(.13, .035, 6, 12), [.31, 1.02, .85], 0x73e8ff, heroGroup, { metalness: .42, emissive: 0x1d7890, emissiveIntensity: .8 }, [0, 0, 0]);
    shapedMesh('Holt helmet', new THREE.SphereGeometry(.25, 14, 9), [0, 1.43, 0], 0x263b3d, heroGroup, { metalness: .38, roughness: .42 });
    box('Holt visor', [.37, .115, .21], [0, 1.43, .2], 0x81efff, heroGroup, { metalness: .28, emissive: 0x17667a, emissiveIntensity: .78 });
    box('Holt helmet crest', [.07, .13, .34], [0, 1.66, -.01], 0xe7b64a, heroGroup, { metalness: .34 });

    heroMuzzle = new THREE.Mesh(
      new THREE.ConeGeometry(.14, .34, 7),
      new THREE.MeshBasicMaterial({ color: 0xffef75, transparent: true, opacity: .94 })
    );
    heroMuzzle.name = 'Holt muzzle flash';
    heroMuzzle.rotation.x = Math.PI / 2;
    heroMuzzle.position.set(.31, 1.02, .98);
    heroMuzzle.visible = false;
    heroGroup.add(heroMuzzle);
    staticGroup.add(heroGroup);
  }

  function buildTurret() {
    turretGroup = new THREE.Group();
    turretGroup.name = 'Main turret';
    box('Turret base', [1.05, .34, 1.05], [0, .18, 0], 0x303a36, turretGroup, { metalness: .25 });

    turretYaw = new THREE.Group();
    turretYaw.position.y = .42;
    turretGroup.add(turretYaw);
    box('Turret head', [.72, .5, .76], [0, .2, 0], 0x60736c, turretYaw, { metalness: .32 });
    box('Turret barrel left', [.13, .13, 1.38], [-.14, .27, .8], 0xd2712c, turretYaw, { metalness: .55, roughness: .35 });
    box('Turret barrel right', [.13, .13, 1.38], [.14, .27, .8], 0xd2712c, turretYaw, { metalness: .55, roughness: .35 });

    turretMuzzle = new THREE.PointLight(0xffa83b, 0, 3.4, 2);
    turretMuzzle.position.set(0, .27, 1.58);
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
    hqFallbackGroup = new THREE.Group();
    hqFallbackGroup.name = 'HQ loading fallback';
    staticGroup.add(hqFallbackGroup);
    box('HQ fallback body', [2.35, 1.45, 1.85], [0, 1.02, .2], 0x465c58, hqFallbackGroup);
    box('HQ fallback upper', [1.45, .65, 1.15], [0, 2.05, .28], 0x687c76, hqFallbackGroup);
    box('HQ fallback mast', [.08, 1.3, .08], [0, 3, .28], 0xd0ded8, hqFallbackGroup, { metalness: .4 });

    hqCommsGroup = new THREE.Group();
    hqCommsGroup.name = 'HQ level 2 communications';
    shapedMesh('HQ comms beacon', new THREE.SphereGeometry(.11, 10, 7), [-2.35, 3.28, -1.35], 0x6eeeff, hqCommsGroup, { emissive: 0x1f9ab5, emissiveIntensity: 1.2 });
    const commsLight = new THREE.PointLight(0x6eeeff, 2.2, 4, 2);
    commsLight.position.set(-2.35, 3.22, -1.35);
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

    for (let lane = 0; lane < LANE_COUNT; lane++) {
      const angle = LANE_ANGLE_OFFSET + lane / LANE_COUNT * Math.PI * 2;
      const group = new THREE.Group();
      group.name = `Barricade lane ${lane + 1}`;
      group.position.set(
        Math.cos(angle) * BARRICADE_WORLD_RADIUS,
        0,
        Math.sin(angle) * BARRICADE_WORLD_RADIUS
      );
      group.rotation.y = Math.PI / 2 - angle;
      staticGroup.add(group);

      const left = box('Barricade left', [.78, .5, .42], [-.4, .26, 0], 0x806d4a, group);
      const right = box('Barricade right', [.78, .5, .42], [.4, .26, 0], 0x806d4a, group);
      box('Barricade brace left', [.12, .62, .58], [-.78, .31, 0], 0x4d4d3d, group, { metalness: .22 });
      box('Barricade brace right', [.12, .62, .58], [.78, .31, 0], 0x4d4d3d, group, { metalness: .22 });
      group.userData.faceMaterials = [left.material, right.material];
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

    camera = new THREE.PerspectiveCamera(39, 1, .1, 90);
    camera.position.set(0, 25.5, 25);
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

    hqBase = prepareHQModel(baseObject, baseTexture, { footprint: 3.55 });
    hqBase.name = 'HQ level 1 center base';
    hqBase.position.z += .18;
    hqAssetGroup.add(hqBase);

    hqRadio = prepareHQModel(radioObject, radioTexture, { height: 3.25 });
    hqRadio.name = 'HQ level 2 radio tower';
    hqRadio.position.set(-2.35, 0, -1.35);
    hqAssetGroup.add(hqRadio);

    const preparedTower = prepareHQModel(towerObject, towerTexture, { height: 1.9 });
    const leftTower = preparedTower;
    leftTower.name = 'HQ level 3 west security tower';
    leftTower.position.set(-2.55, 0, .9);
    hqAssetGroup.add(leftTower);
    hqTowers.push(leftTower);

    const rightTower = preparedTower.clone(true);
    rightTower.name = 'HQ level 3 east security tower';
    rightTower.position.set(2.55, 0, .9);
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
        death: makeClipInPlace(death, 'zombie-death', false),
      };

      try {
        await loadHQAssets();
      } catch (hqError) {
        console.warn('Build 158 modular HQ fallback:', hqError);
        hqFallbackGroup.visible = true;
      }

      badge.textContent = 'CENTRAL HQ · MIXED INFECTED CONTACT';
      return true;
    })().catch(error => {
      console.warn('Build 158 zombie asset fallback:', error);
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
    scene.add(root);

    const materials = tintZombie(model, entity.kind, variant);
    const mixer = new THREE.AnimationMixer(root);
    const actions = {
      run: mixer.clipAction(clips.run),
      attack: mixer.clipAction(clips.attack),
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
    };
    units.set(entity, record);
    return record;
  }

  function selectZombieState(entity, dead) {
    if (dead) return 'death';
    if (entity.moving) return 'run';
    if (entity.engaged) return 'attack';
    return 'run';
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
    const opacity = dead ? Math.min(1, Math.max(0, (entity.life || 0) / Math.max(.01, entity.max || 1))) : 1;
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
    if (!dead && record.state === 'run') {
      record.actions.run.setEffectiveTimeScale(entity.waiting ? .38 : 1);
    }
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
      hqBase.visible = true;
      hqRadio.visible = level >= 2;
      hqTowers.forEach(tower => { tower.visible = level >= 3; });
      hqFallbackGroup.visible = false;
    } else if (hqFallbackGroup) {
      hqFallbackGroup.visible = true;
    }
    if (hqCommsGroup) hqCommsGroup.visible = level >= 2;
    if (hqLaserGroup) hqLaserGroup.visible = level >= 4;
    if (hqShield) hqShield.visible = level >= 5;

    if (displayedHQLevel !== level) {
      displayedHQLevel = level;
      badge.textContent = `CENTRAL HQ L${level} · MIXED INFECTED CONTACT`;
    }
  }

  function syncHero(run) {
    if (!heroGroup) return;
    const p = world(run.hero, run);
    heroGroup.position.set(p[0], Math.sin(run.elapsed * 2.8) * .025, p[1]);
    heroGroup.rotation.y = -(run.hero.aim || -Math.PI / 2) + Math.PI / 2;
    heroGroup.visible = true;
    heroMuzzle.visible = (run.hero.flash || 0) > 0;
    if (heroMuzzle.visible) heroMuzzle.scale.setScalar(.82 + Math.random() * .4);
  }

  function syncTurret(run) {
    if (!turretGroup || !turretYaw) return;
    const p = world(run.turret, run);
    turretGroup.position.set(p[0], 0, p[1]);
    turretYaw.rotation.y = -(run.turret.aim || 0) + Math.PI / 2;
    turretGroup.visible = true;
    turretMuzzle.intensity = (run.turret.flash || 0) > 0 ? 7 : 0;
  }

  function syncBarricades(run) {
    barricadeGroups.forEach((group, index) => {
      const state = run.lanes && run.lanes[index] && run.lanes[index].barricade;
      const alive = !!state && state.hp > 0;
      group.visible = alive;
      if (!alive) return;

      const ratio = Math.max(0, Math.min(1, state.hp / Math.max(1, state.maxHp)));
      const color = state.flash > 0 ? 0xb34835 : ratio < .35 ? 0x594734 : ratio < .7 ? 0x705b3e : 0x806d4a;
      group.userData.faceMaterials.forEach(item => {
        item.color.setHex(color);
        item.emissive.setHex(state.flash > 0 ? 0x45150e : 0x000000);
        item.emissiveIntensity = state.flash > 0 ? .8 : 0;
      });
    });
  }

  function makeTracer(bullet) {
    const positions = new Float32Array(6);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: bullet.color || 0xffef75, transparent: true, opacity: .95 })
    );
    line.frustumCulled = false;
    scene.add(line);
    const record = { line, geometry, positions };
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
      record.positions[0] = previous[0];
      record.positions[1] = .78;
      record.positions[2] = previous[1];
      record.positions[3] = current[0];
      record.positions[4] = .78;
      record.positions[5] = current[1];
      record.geometry.attributes.position.needsUpdate = true;
    });

    for (const [bullet, record] of tracers) {
      if (live.has(bullet)) continue;
      scene.remove(record.line);
      record.geometry.dispose();
      record.line.material.dispose();
      tracers.delete(bullet);
    }
  }

  function removeZombie(entity, record) {
    record.mixer.stopAllAction();
    scene.remove(record.root);
    record.materials.forEach(item => item && item.dispose && item.dispose());
    units.delete(entity);
  }

  function clearDynamic() {
    for (const [entity, record] of units) removeZombie(entity, record);
    for (const [, record] of tracers) {
      scene.remove(record.line);
      record.geometry.dispose();
      record.line.material.dispose();
    }
    tracers.clear();
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

  api.start = function (canvas) {
    sourceCanvas = canvas;
    try {
      if (!renderer) init();
      active = true;
      badge.style.display = 'block';
      badge.textContent = zombieTemplates.soldier ? 'CENTRAL HQ · MIXED INFECTED CONTACT' : 'CENTRAL HQ · LOADING CONTACT';
      sourceCanvas.style.visibility = 'visible';
      view.style.display = 'none';

      loadAssets().then(ready => {
        if (!active || !ready) return;
        view.style.display = 'block';
        sourceCanvas.style.visibility = 'hidden';
      });
    } catch (error) {
      console.warn('Build 158 3D fallback:', error);
      active = false;
      if (view) view.style.display = 'none';
      sourceCanvas.style.visibility = 'visible';
    }
  };

  api.stop = function () {
    active = false;
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

    syncHQ(run);
    syncHero(run);
    syncTurret(run);
    syncBarricades(run);

    run.enemies.forEach(unit => {
      const scale = unit.kind === 'boss' ? 1.72 : unit.kind === 'armored' ? 1.24 : unit.kind === 'runner' ? .94 : 1.06;
      syncZombie(unit, run, scale, false, dt, liveUnits);
    });
    run.corpses.forEach(unit => {
      const scale = unit.kind === 'boss' ? 1.72 : unit.kind === 'armored' ? 1.24 : unit.kind === 'runner' ? .94 : 1.06;
      syncZombie(unit, run, scale, true, dt, liveUnits);
    });

    for (const [entity, record] of units) {
      if (!liveUnits.has(entity)) removeZombie(entity, record);
    }

    syncTracers(run, liveTracers);
    renderer.render(scene, camera);
    return true;
  };

  window.LSC3DPrototype = api;
})();
