import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

(function () {
  'use strict';
  const api = {};
  const ASSET_ROOT = 'assets/prototype4/';
  const FILES = {
    idle: 'Idle.fbx',
    aim: 'Idle-Aiming.fbx',
    run: 'Run-Forward.fbx',
    fire: 'Firing-Rifle.fbx',
    death: 'Death-Front-Headshot.fbx',
  };
  const TEXTURES = ['6_packed0_diffuse.png', '6_packed1_diffuse.png', '6_packed2_diffuse.png'];
  const WEAPON_ROOT = `${ASSET_ROOT}weapons/`;
  const WEAPON_FILE = 'Rifle-Pack-2-In-1.fbx';
  const WEAPON_TEXTURES = {
    color: 'Rifle_2_Mat_AlbedoTransparency.png',
    normal: 'Rifle_2_Mat_Normal.png',
  };
  let sourceCanvas, view, renderer, scene, camera, clock, active = false;
  let modelTemplate = null, clips = {}, skinMaps = [], loading = null, badge = null;
  let rifleTemplate = null;
  const units = new Map();
  const staticGroup = new THREE.Group();

  function makeBadge() {
    badge = document.createElement('div');
    badge.id = 'lsc-3d-badge';
    badge.textContent = '3D PROTOTYPE 5 · RIFLE COMBAT';
    badge.style.cssText = 'position:absolute;z-index:38;left:12px;top:calc(env(safe-area-inset-top,0px) + 48px);padding:5px 8px;border:1px solid rgba(116,233,255,.5);border-radius:6px;background:rgba(3,10,15,.78);color:#74e9ff;font:7px "Share Tech Mono",monospace;letter-spacing:1.3px;pointer-events:none';
    sourceCanvas.parentNode.appendChild(badge);
  }

  function box(name, size, position, color, parent = staticGroup) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      new THREE.MeshStandardMaterial({ color, roughness: .76, metalness: .12 })
    );
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function buildWorld() {
    scene.add(staticGroup);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.MeshStandardMaterial({ color: 0x506044, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    staticGroup.add(ground);
    for (let q = 0; q < 4; q++) {
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 18), new THREE.MeshStandardMaterial({ color: 0x3f4939, roughness: 1 }));
      lane.rotation.x = -Math.PI / 2;
      lane.rotation.z = q * Math.PI / 2;
      lane.position.y = .012;
      lane.position.z = q % 2 === 0 ? (q === 0 ? -9 : 9) : 0;
      lane.position.x = q % 2 ? (q === 1 ? 9 : -9) : 0;
      staticGroup.add(lane);
    }
    box('HQ foundation', [3.2, .35, 2.7], [0, .18, 0], 0x26342e);
    box('HQ', [2.35, 1.45, 1.85], [0, 1.02, .2], 0x465c58);
    box('HQ upper', [1.45, .65, 1.15], [0, 2.05, .28], 0x687c76);
    box('HQ mast', [.08, 1.3, .08], [0, 3.0, .28], 0xd0ded8);
    box('Turret base', [1.15, .38, 1.15], [-3.45, .2, 1.8], 0x343d37);
    box('Turret head', [.75, .48, .8], [-3.45, .62, 1.8], 0x687469);
    box('Turret barrel', [.18, .18, 1.7], [-3.45, .72, .85], 0xd1772e);
    for (let q = 0; q < 4; q++) for (let i = -2; i <= 2; i++) {
      const a = q * Math.PI / 2, side = i * 1.05;
      box('Barricade', [.78, .48, .36], [Math.sin(a) * side + Math.cos(a) * 5.7, .25, Math.cos(a) * side - Math.sin(a) * 5.7], 0x806d4a);
    }
  }

  function init() {
    view = document.createElement('canvas');
    view.id = 'lsc-3d-prototype';
    view.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;background:#283425';
    sourceCanvas.parentNode.insertBefore(view, sourceCanvas.nextSibling);
    makeBadge();
    renderer = new THREE.WebGLRenderer({ canvas: view, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x516653);
    scene.fog = new THREE.Fog(0x516653, 34, 58);
    camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    camera.position.set(0, 25, 26);
    camera.lookAt(0, 0, 2.2);
    scene.add(new THREE.HemisphereLight(0xe8f5ff, 0x59664a, 3.15));
    const fill = new THREE.DirectionalLight(0xb8d9ff, 1.35);
    fill.position.set(14, 10, -10);
    scene.add(fill);
    const sun = new THREE.DirectionalLight(0xfff3d8, 4.35);
    sun.position.set(-10, 22, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    clock = new THREE.Clock();
    buildWorld();
  }

  function loadFBX(loader, file) {
    return new Promise((resolve, reject) => loader.load(ASSET_ROOT + file, resolve, undefined, reject));
  }

  function makeClipInPlace(clip) {
    const result = clip.clone();
    result.tracks.forEach(track => {
      if (!/hips\.position$/i.test(track.name)) return;
      const itemSize = track.getValueSize();
      const baseX = track.values[0], baseZ = track.values[2];
      for (let i = 0; i < track.values.length; i += itemSize) {
        track.values[i] = baseX;
        track.values[i + 2] = baseZ;
      }
    });
    return result;
  }

  function prepareRifle(object, colorMap, normalMap) {
    const discard = [];
    object.traverse(child => {
      if (!child.isMesh) return;
      if (!/^Rifle_2(?:001|002)?$/i.test(child.name)) {
        discard.push(child);
        return;
      }
      child.castShadow = true;
      child.frustumCulled = false;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      child.material = materials.map(source => {
        const material = source.clone();
        material.map = colorMap;
        material.normalMap = normalMap;
        material.metalness = .48;
        material.roughness = .44;
        material.needsUpdate = true;
        return material;
      });
      if (child.material.length === 1) child.material = child.material[0];
    });
    discard.forEach(child => child.parent && child.parent.remove(child));
    const bounds = new THREE.Box3().setFromObject(object);
    const center = bounds.getCenter(new THREE.Vector3());
    object.position.sub(center);
    object.name = 'Rifle 2 · mobile assault rifle';
    return object;
  }

  function prepareModel(object) {
    const bounds = new THREE.Box3().setFromObject(object);
    const height = Math.max(.01, bounds.max.y - bounds.min.y);
    object.scale.setScalar(1.72 / height);
    const scaled = new THREE.Box3().setFromObject(object);
    object.position.y -= scaled.min.y;
    let meshIndex = 0;
    object.traverse(child => {
      if (!child.isMesh) return;
      child.castShadow = child.receiveShadow = true;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      child.material = mats.map(m => {
        const copy = m.clone();
        if (!copy.map && skinMaps.length) copy.map = skinMaps[meshIndex % skinMaps.length];
        copy.roughness = copy.roughness == null ? .7 : copy.roughness;
        copy.metalness = copy.metalness == null ? .05 : copy.metalness;
        copy.needsUpdate = true;
        return copy;
      });
      if (child.material.length === 1) child.material = child.material[0];
      meshIndex++;
    });
  }

  async function loadAssets() {
    if (loading) return loading;
    loading = (async () => {
      const loader = new FBXLoader();
      loader.setResourcePath(ASSET_ROOT);
      const textureLoader = new THREE.TextureLoader();
      skinMaps = await Promise.all(TEXTURES.map(file => textureLoader.loadAsync(ASSET_ROOT + file)));
      skinMaps.forEach(map => { map.colorSpace = THREE.SRGBColorSpace; map.flipY = true; });
      const loaded = {};
      for (const key of Object.keys(FILES)) loaded[key] = await loadFBX(loader, FILES[key]);
      const weaponLoader = new FBXLoader();
      weaponLoader.setResourcePath(WEAPON_ROOT);
      const [weapon, weaponColor, weaponNormal] = await Promise.all([
        new Promise((resolve, reject) => weaponLoader.load(WEAPON_ROOT + WEAPON_FILE, resolve, undefined, reject)),
        textureLoader.loadAsync(WEAPON_ROOT + WEAPON_TEXTURES.color),
        textureLoader.loadAsync(WEAPON_ROOT + WEAPON_TEXTURES.normal),
      ]);
      weaponColor.colorSpace = THREE.SRGBColorSpace;
      weaponColor.flipY = true;
      weaponNormal.flipY = true;
      rifleTemplate = prepareRifle(weapon, weaponColor, weaponNormal);
      modelTemplate = loaded.idle;
      prepareModel(modelTemplate);
      Object.keys(loaded).forEach(key => { clips[key] = makeClipInPlace(loaded[key].animations[0]); });
      if (!clips.idle || !clips.run || !clips.fire || !clips.death) throw new Error('Required soldier animation missing');
      badge.textContent = '3D PROTOTYPE 5 · RIFLES ACTIVE';
      return true;
    })().catch(error => {
      console.warn('Prototype 5 asset fallback:', error);
      badge.textContent = '3D PROTOTYPE 5 · ASSET FALLBACK';
      active = false;
      if (view) view.style.display = 'none';
      if (sourceCanvas) sourceCanvas.style.visibility = 'visible';
      return false;
    });
    return loading;
  }

  function tint(root, hex) {
    const tintColor = new THREE.Color(hex);
    root.traverse(child => {
      if (!child.isMesh) return;
      const materials = (Array.isArray(child.material) ? child.material : [child.material]).map(source => {
        const m = source.clone();
        if (m.color) m.color.multiply(tintColor).lerp(new THREE.Color(0xffffff), .42);
        return m;
      });
      child.material = Array.isArray(child.material) ? materials : materials[0];
    });
  }

  function attachRifle(root) {
    let hand = null;
    root.traverse(node => {
      const name = (node.name || '').toLowerCase();
      if (!hand && node.isBone && /right.*hand|hand.*right|r[_ .-]?hand|hand[_ .-]?r/.test(name)) hand = node;
    });
    if (!hand) root.traverse(node => { if (!hand && node.isBone && /hand/.test((node.name || '').toLowerCase())) hand = node; });
    if (!rifleTemplate) return;
    const rifle = rifleTemplate.clone(true);
    (hand || root).add(rifle);
    if (hand) {
      // Mixamo bones use centimeter-scale local coordinates. The soldier root
      // is normalized later, so the imported rifle must remain large in this
      // local space to be visible after inheriting that root scale.
      rifle.position.set(5, -2, -31);
      rifle.rotation.set(0, Math.PI, Math.PI / 2);
      rifle.scale.setScalar(.16);
    } else {
      rifle.position.set(34, 112, -45);
      rifle.rotation.set(0, Math.PI, Math.PI / 2);
      rifle.scale.setScalar(.16);
    }
  }

  function makeUnit(entity, faction, scale) {
    const root = SkeletonUtils.clone(modelTemplate);
    tint(root, faction === 'enemy' ? 0xb83f32 : faction === 'holt' ? 0xd5b441 : 0x4b9a68);
    attachRifle(root);
    root.scale.multiplyScalar(scale || 1);
    scene.add(root);
    const mixer = new THREE.AnimationMixer(root), actions = {};
    Object.keys(clips).forEach(key => { actions[key] = mixer.clipAction(clips[key]); actions[key].enabled = true; });
    actions.idle.play();
    const record = { entity, root, mixer, actions, state: 'idle', faction };
    units.set(entity, record);
    return record;
  }

  function selectState(entity, dead) {
    if (dead) return 'death';
    if ((entity.flash || 0) > 0) return 'fire';
    if (entity.moving) return 'run';
    return entity.aim == null ? 'idle' : 'aim';
  }

  function setState(record, next) {
    if (!record.actions[next]) next = 'idle';
    if (record.state === next) return;
    const previous = record.actions[record.state], action = record.actions[next];
    action.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
    action.setLoop(next === 'death' ? THREE.LoopOnce : THREE.LoopRepeat, next === 'death' ? 1 : Infinity);
    action.clampWhenFinished = next === 'death';
    action.play();
    if (previous) action.crossFadeFrom(previous, next === 'fire' ? .08 : .18, true);
    record.state = next;
  }

  function world(entity, run) {
    const k = 8.2 / (Math.min(sourceCanvas.width, sourceCanvas.height) * .54 + 45 * (devicePixelRatio || 1));
    return [(entity.x - run.hq.x) * k, (entity.y - run.hq.y) * k];
  }

  function syncUnit(entity, run, faction, scale, dead, dt, live) {
    let record = units.get(entity);
    if (!record) record = makeUnit(entity, faction, scale);
    live.add(entity);
    const p = world(entity, run);
    record.root.position.x = p[0];
    record.root.position.z = p[1];
    record.root.rotation.y = -(entity.aim || 0) + Math.PI / 2;
    record.root.traverse(child => {
      if (!child.isMesh || !child.material) return;
      const opacity = dead ? Math.min(1, Math.max(0, (entity.life || 0) / .35)) : 1;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(material => { material.transparent = opacity < 1; material.opacity = opacity; });
    });
    setState(record, selectState(entity, dead));
    record.mixer.update(dt);
  }

  function resize() {
    const rect = sourceCanvas.getBoundingClientRect();
    const w = Math.max(2, rect.width | 0), h = Math.max(2, rect.height | 0);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  api.start = function (canvas) {
    sourceCanvas = canvas;
    try {
      if (!renderer) init();
      active = true;
      view.style.display = 'block';
      badge.style.display = 'block';
      sourceCanvas.style.visibility = 'hidden';
      loadAssets();
    } catch (error) {
      console.warn('3D fallback:', error);
      active = false;
      if (view) view.style.display = 'none';
      sourceCanvas.style.visibility = 'visible';
    }
  };

  api.stop = function () {
    active = false;
    if (view) view.style.display = 'none';
    if (badge) badge.style.display = 'none';
    if (sourceCanvas) sourceCanvas.style.visibility = 'visible';
  };

  api.render = function (run) {
    if (!active || !renderer || !modelTemplate) return false;
    resize();
    const dt = Math.min(.05, clock.getDelta()), live = new Set();
    run.squad.forEach(unit => syncUnit(unit, run, 'ally', .84, false, dt, live));
    syncUnit(run.hero, run, 'holt', 1.0, false, dt, live);
    run.enemies.forEach(unit => syncUnit(unit, run, 'enemy', unit.kind === 'boss' ? 1.55 : unit.kind === 'armored' ? 1.12 : .9, false, dt, live));
    run.corpses.forEach(unit => syncUnit(unit, run, 'enemy', unit.kind === 'boss' ? 1.55 : unit.kind === 'armored' ? 1.12 : .9, true, dt, live));
    for (const [entity, record] of units) if (!live.has(entity)) {
      record.mixer.stopAllAction();
      scene.remove(record.root);
      units.delete(entity);
    }
    renderer.render(scene, camera);
    return true;
  };

  window.LSC3DPrototype = api;
})();
