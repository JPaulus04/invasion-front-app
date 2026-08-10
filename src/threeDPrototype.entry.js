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
  let sourceCanvas, view, renderer, scene, camera, clock, active = false;
  let modelTemplate = null, clips = {}, loading = null, badge = null;
  const units = new Map();
  const staticGroup = new THREE.Group();

  function makeBadge() {
    badge = document.createElement('div');
    badge.id = 'lsc-3d-badge';
    badge.textContent = '3D PROTOTYPE 4 · IMPORTED SOLDIER';
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
    renderer.toneMappingExposure = 1.2;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x283425);
    scene.fog = new THREE.Fog(0x283425, 24, 46);
    camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
    camera.position.set(0, 28, 30);
    camera.lookAt(0, 0, -2.4);
    scene.add(new THREE.HemisphereLight(0xcce8ff, 0x334029, 2.2));
    const sun = new THREE.DirectionalLight(0xfff1d1, 3.1);
    sun.position.set(-12, 24, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    clock = new THREE.Clock();
    buildWorld();
  }

  function loadFBX(loader, file) {
    return new Promise((resolve, reject) => loader.load(ASSET_ROOT + file, resolve, undefined, reject));
  }

  function prepareModel(object) {
    const bounds = new THREE.Box3().setFromObject(object);
    const height = Math.max(.01, bounds.max.y - bounds.min.y);
    object.scale.setScalar(1.72 / height);
    const scaled = new THREE.Box3().setFromObject(object);
    object.position.y -= scaled.min.y;
    object.traverse(child => {
      if (!child.isMesh) return;
      child.castShadow = child.receiveShadow = true;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      child.material = mats.map(m => {
        const copy = m.clone();
        copy.roughness = copy.roughness == null ? .7 : copy.roughness;
        copy.metalness = copy.metalness == null ? .05 : copy.metalness;
        return copy;
      });
      if (child.material.length === 1) child.material = child.material[0];
    });
  }

  async function loadAssets() {
    if (loading) return loading;
    loading = (async () => {
      const loader = new FBXLoader();
      loader.setResourcePath(ASSET_ROOT);
      const loaded = {};
      for (const key of Object.keys(FILES)) loaded[key] = await loadFBX(loader, FILES[key]);
      modelTemplate = loaded.idle;
      prepareModel(modelTemplate);
      Object.keys(loaded).forEach(key => { clips[key] = loaded[key].animations[0]; });
      if (!clips.idle || !clips.run || !clips.fire || !clips.death) throw new Error('Required soldier animation missing');
      badge.textContent = '3D PROTOTYPE 4 · REAL ANIMATION ACTIVE';
      return true;
    })().catch(error => {
      console.warn('Prototype 4 asset fallback:', error);
      badge.textContent = '3D PROTOTYPE 4 · ASSET FALLBACK';
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
        if (m.color) m.color.lerp(tintColor, .22);
        return m;
      });
      child.material = Array.isArray(child.material) ? materials : materials[0];
    });
  }

  function makeUnit(entity, faction, scale) {
    const root = SkeletonUtils.clone(modelTemplate);
    tint(root, faction === 'enemy' ? 0xb83f32 : faction === 'holt' ? 0xd5b441 : 0x4b9a68);
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
