#!/usr/bin/env node
/**
 * build.js — Last Stand Command Build 230
 * Bundles modular source into www/index.html for Capacitor / WebView deployment.
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const balance = require('./src/balance.js');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'www');
const ASSETS = path.join(__dirname, 'assets');

function requireMatch(condition, message) {
  if (!condition) throw new Error(`Build validation failed: ${message}`);
}
function read(file) {
  return fs.readFileSync(path.join(SRC, file), 'utf8');
}

esbuild.buildSync({
  entryPoints: [path.join(SRC, 'nativeRuntime.entry.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['ios15'],
  outfile: path.join(SRC, 'nativeRuntime.bundle.js'),
});

esbuild.buildSync({
  entryPoints: [path.join(SRC, 'threeDPrototype.entry.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['ios15'],
  outfile: path.join(SRC, 'threeDPrototype.bundle.js'),
});

const ENGINE_SCRIPTS = [
  'config.js',
  'balance.js',
  'data.js',
  'worlds.js',
  'nativeRuntime.bundle.js',
  'gameCenter.js',
  'audio.js',
  'engine.js',
];

const CONTROLLER_SCRIPTS = [
  'campaignSaves.js',
  'worldMapArt.js',
  'reclamation.js',
  'worldBuilding.js',
  'settlement204.js',
  'settlementView204.js',
  'settlement205.js',
  'isometricAssets221.js',
  'isometricMap221.js',
  'artRenderer295.js',
  'settlementView205.js',
  'starTowns.js',
  'renderer.js',
  'enemyVisuals.js',
  'ui.js',
  'screens.js',
  'systems.js',
  'main.js',
  'hotfixes.js',
  'campaignProgression.js',
  'operationsIdentity.js',
  'singleFrontCommand.js',
  'research.js',
  'loadouts.js',
  'officers.js',
  'hudLayout.js',
  'screenGuard.js',
  'threeDPrototype.bundle.js',
];

let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = read('style.css');
const threeDSource = read('threeDPrototype.entry.js');
const commandBaseCode = read('centralHQPrototype.js');

requireMatch(balance.version === 186, 'accepted Build 186 balance module is missing');
requireMatch(html.includes('</body>') && html.includes('</html>'), 'source index.html shell is incomplete');
requireMatch(html.includes('id="beginBtn"'), 'source index.html is missing Begin Operation');
requireMatch(html.includes('<script src="src/main.js"></script>'), 'source main.js marker is missing');

html = html.replace(
  /<link rel="stylesheet" href="src\/style\.css">/,
  `<style>\n${css}\n</style>`
);

const engineCode = ENGINE_SCRIPTS.map(f => `// ── ${f} ──\n${read(f)}`).join('\n\n');
const controllerCode = CONTROLLER_SCRIPTS.map(f => `// ── ${f} ──\n${f === 'artRenderer295.js' ? 'window.LSC_BUILD_ART_PREVIEW = true;\n' : ''}${read(f)}`).join('\n\n');

const firstScript = '<script src="src/config.js"></script>';
const lastScript = '<script src="src/main.js"></script>';
const scriptStart = html.indexOf(firstScript);
const scriptEnd = html.indexOf(lastScript, scriptStart);

requireMatch(scriptStart >= 0, 'config.js script boundary is missing');
requireMatch(scriptEnd >= scriptStart, 'main.js script boundary is missing');

html =
  html.slice(0, scriptStart) +
  `<script>\n${engineCode}\n</script>\n\n` +
  `<script>\n${controllerCode}\n</script>\n\n` +
  `<script>\n// ── centralHQPrototype.js ──\n${commandBaseCode}\n</script>` +
  html.slice(scriptEnd + lastScript.length);

html = html.replace('<script src="src/centralHQPrototype.js"></script>', '');

requireMatch(!html.includes('<script src="src/main.js"></script>'), 'game scripts were not bundled');
requireMatch(!html.includes('<script src="src/centralHQPrototype.js"></script>'), 'Command Base script was not bundled');
requireMatch(html.includes("const LSC_BUILD = '230';"), 'Build 230 config is not present');

/* Preserve the accepted Build 229 road behavior. */
requireMatch(html.includes('Mountain terrain blocks roads. Build around it.'), 'Build 229 mountain road restriction is missing');
requireMatch(html.includes('Roads stop beside settlements.'), 'Build 229 settlement road boundary is missing');

/* Core world / combat regression guards retained for Build 230. */
requireMatch(
  html.includes('root.LSCWorldArt=Object.freeze') &&
  html.indexOf('root.LSCWorldArt=Object.freeze') < html.indexOf('root.LSCReclamation=Object.freeze'),
  'World art must be bundled before reclamation'
);
requireMatch(html.includes('Zombie-Soldier.fbx'), 'primary zombie renderer is missing');
requireMatch(html.includes('Zombie-Scout.fbx'), 'second zombie renderer is missing');
requireMatch(html.includes('Zombie-Punch.fbx'), 'melee animation is missing');
requireMatch(html.includes('var LANE_COUNT = 8;'), 'eight-lane simulation is missing');
requireMatch(threeDSource.includes('const COMPOUND_LANES = ['), '3D compound layout is missing');
requireMatch(html.includes('window.LSCGameCenter'), 'Game Center integration is missing');
requireMatch(html.includes('function renderOperationsTab(panel)'), 'Special Operations launcher is missing');
requireMatch(html.includes('function campaignMapMarkup(phase)'), 'campaign map is missing');
requireMatch(html.includes('function renderHqTab(panel)'), 'HQ presentation is missing');
requireMatch(html.includes('function researchEffects()'), 'research behavior is missing');
requireMatch(html.includes('</body>') && html.includes('</html>'), 'output shell is incomplete');
requireMatch(html.trimEnd().endsWith('</html>'), 'output contains a truncated tail');

/* Modern 2.5D renderer validation. Keep the renderer wired into the bundle,
 * but do not require retired Build 230 building-art routes.
 * The art-readiness workflow separately validates new PNG assets. */
requireMatch(
  html.includes('root.LSCArt295=Object.freeze') &&
  html.includes('assets/new-art/hq-l1.png') &&
  html.includes('assets/new-art/lumber-l1.png') &&
  html.includes('assets/new-art/quarry-l1.png') &&
  html.includes('window.LSC_BUILD_ART_PREVIEW = true;'),
  'Build 297 modern art renderer integration is missing'
);

/* Required imported battlefield assets. */
[
  'Zombie-Soldier.fbx',
  'Zombie-Scout.fbx',
  'Zombie-Run.fbx',
  'Zombie-Punch.fbx',
  'Zombie-Death.fbx',
  'Idle-Aiming.fbx',
  'Firing-Rifle.fbx',
].forEach(file => {
  requireMatch(fs.existsSync(path.join(ASSETS, 'prototype4', file)), `required battlefield asset is missing: ${file}`);
});
[
  'Center-Base.fbx',
  'Center-Base-BaseColor.jpg',
  'Radio-Tower.fbx',
  'Radio-Tower-BaseColor.jpg',
  'Security-Tower.fbx',
  'Security-Tower-BaseColor.jpg',
].forEach(file => {
  requireMatch(fs.existsSync(path.join(ASSETS, 'prototype4', 'hq', file)), `required HQ asset is missing: ${file}`);
});
[
  'M4A1.fbx',
  'texture.png',
].forEach(file => {
  requireMatch(fs.existsSync(path.join(ASSETS, 'prototype4', 'holt', file)), `required Holt asset is missing: ${file}`);
});

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const sp = path.join(src, entry.name);
    const dp = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirSync(sp, dp);
    else if (entry.name !== '.gitkeep') fs.copyFileSync(sp, dp);
  }
}

if (fs.existsSync(ASSETS)) {
  copyDirSync(ASSETS, path.join(OUT, 'assets'));
  console.log('📦 Copied assets/ → www/assets/');
}

const outPath = path.join(OUT, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');

const written = fs.readFileSync(outPath, 'utf8');
requireMatch(written.length === html.length, 'written output length does not match generated output');
requireMatch(written.trimEnd().endsWith('</html>'), 'written output is truncated');

const size = (fs.statSync(outPath).size / 1024).toFixed(0);
console.log(`✅ Built Last Stand Command 230 — www/index.html (${size} KB)`);
