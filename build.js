#!/usr/bin/env node
/**
 * build.js — Bundles the modular source into a single index.html
 * for Capacitor / WebView deployment.
 *
 * Usage: node build.js
 * Output: www/index.html (single file, no ES modules)
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'www');

// Bundle Three.js, FBXLoader and SkeletonUtils into a classic script that the
// existing single-file Capacitor build can execute without ES-module support.
esbuild.buildSync({
  entryPoints: [path.join(SRC, 'threeDPrototype.entry.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['ios15'],
  outfile: path.join(SRC, 'threeDPrototype.bundle.js'),
});

// Order matters — later files depend on earlier ones
const ENGINE_SCRIPTS = [
  'config.js',
  'data.js',
  'worlds.js',    // Campaign world framework must load before engine/renderer/UI
  'audio.js',
  'engine.js',
];

const CONTROLLER_SCRIPTS = [
  'iap.js',       // V87: RevenueCat integration — must load before ui.js store functions
  'renderer.js',
  'enemyVisuals.js',      // Build 127+: stronger procedural enemy/contact visuals
  'ui.js',
  'screens.js',
  'systems.js',
  'main.js',
  'hotfixes.js',  // Build 102/103: final boss/tutorial launch hotfixes
  'campaignProgression.js', // Campaign worlds, world prestige, daily rewards, permanent research persistence
  'operationsIdentity.js',  // Build 126+: Command Operations identity layer and mission briefing
  'singleFrontCommand.js',  // Build 130: hero-led single-front command prototype
  'research.js',            // Consolidated research visuals/layout/queue polish
  'loadouts.js',           // Saved troop formation loadouts for officer auto-fill
  'officers.js',            // Command Staff / Officers foundation
  'hudLayout.js',           // Battlefield floating HUD layout polish
  'screenGuard.js',         // Screen-state/input isolation for Home vs Battlefield
  'threeDPrototype.bundle.js', // Prototype 4: imported skinned FBX renderer
];

function read(file) {
  return fs.readFileSync(path.join(SRC, file), 'utf8');
}

// Read the dev index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function requireMatch(condition, message) {
  if (!condition) throw new Error(`Build validation failed: ${message}`);
}

// Refuse to bundle a damaged source shell. This specifically catches the
// Build 149 failure where index.html ended inside an embedded base64 image.
requireMatch(html.includes('</body>'), 'source index.html is missing </body>');
requireMatch(html.includes('</html>'), 'source index.html is missing </html>');
requireMatch(html.includes('id="beginBtn"'), 'source index.html is missing Begin Operation');
requireMatch(html.includes('<script src="src/main.js"></script>'), 'source main.js script marker is missing');

// Read CSS
const css = read('style.css');

// Replace the <link rel="stylesheet"> with inline <style>
html = html.replace(
  /<link rel="stylesheet" href="src\/style\.css">/,
  `<style>\n${css}\n</style>`
);

// Build engine script block
const engineCode = ENGINE_SCRIPTS.map(f => `// ── ${f} ──\n${read(f)}`).join('\n\n');

// Build controller script block
const controllerCode = CONTROLLER_SCRIPTS.map(f => `// ── ${f} ──\n${read(f)}`).join('\n\n');
const commandBaseCode = read('centralHQPrototype.js');

// Replace the full external-script region by explicit boundary tags. This is
// deliberately independent of decorative comment width/characters.
const firstScript = '<script src="src/config.js"></script>';
const lastScript = '<script src="src/main.js"></script>';
const scriptStart = html.indexOf(firstScript);
const scriptEnd = html.indexOf(lastScript, scriptStart);
requireMatch(scriptStart >= 0, 'config.js script boundary is missing');
requireMatch(scriptEnd >= scriptStart, 'main.js script boundary is missing');
html =
  html.slice(0, scriptStart) +
  `<script>\n${engineCode}\n</script>\n\n<script>\n${controllerCode}\n</script>\n\n` +
  `<script>\n// ── centralHQPrototype.js ──\n${commandBaseCode}\n</script>` +
  html.slice(scriptEnd + lastScript.length);

// centralHQPrototype.js is already included in CONTROLLER_SCRIPTS for the
// production bundle; remove its development-only external script tag.
html = html.replace('<script src="src/centralHQPrototype.js"></script>', '');

requireMatch(!html.includes('<script src="src/main.js"></script>'), 'game scripts were not bundled');
requireMatch(!html.includes('<script src="src/centralHQPrototype.js"></script>'), 'prototype script was not bundled');
requireMatch(html.includes('const LSC_BUILD = \'158\';'), 'Build 158 config is not present');
requireMatch(html.includes('Zombie-Soldier.fbx'), 'Build 158 primary zombie renderer is missing');
requireMatch(html.includes('Zombie-Scout.fbx'), 'Build 158 second zombie renderer is missing');
requireMatch(html.includes('Zombie-Punch.fbx'), 'Build 158 clean melee animation is missing');
requireMatch(!html.includes('Rifle-Pack-2-In-1.fbx'), 'retired detached-rifle loader is still bundled');
requireMatch(html.includes('var LANE_COUNT = 8;'), 'Build 158 eight-lane simulation is missing');
requireMatch(html.includes('Barricade lane '), 'Build 158 eight-lane renderer is missing');
requireMatch(html.includes("targetType==='barricade'"), 'Build 158 barricade damage routing is missing');
requireMatch(html.includes('Build 158 zombie asset fallback:'), 'Build 158 renderer marker is missing');
requireMatch(html.includes("level:meta.hq"), 'Build 158 HQ level routing is missing');
requireMatch(html.includes('HQ level 4 laser upgrade'), 'Build 158 visual HQ tiers are missing');
requireMatch(html.includes("BOSS_LANE_INDEX = 6"), 'Build 158 exclusive boss lane is missing');
requireMatch(html.includes('</body>') && html.includes('</html>'), 'output shell is incomplete');
requireMatch(html.trimEnd().endsWith('</html>'), 'output contains a truncated tail');
requireMatch(html.includes('id="beginBtn"') && html.includes('id="helpBtn"'), 'start controls are missing');
requireMatch(html.includes('function enforceCommandBaseStartup()'), 'Build 154 startup migration is missing');
requireMatch(html.includes("removeLegacyNode('onboarding-overlay')"), 'legacy onboarding removal is missing');
requireMatch(html.includes("removeLegacyNode('startOverlay')"), 'legacy start-screen removal is missing');

// Ensure output dir exists
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Copy assets directory to www/assets
const ASSETS = path.join(__dirname, 'assets');
[
  'Zombie-Soldier.fbx',
  'Zombie-Scout.fbx',
  'Zombie-Run.fbx',
  'Zombie-Punch.fbx',
  'Zombie-Death.fbx',
].forEach(file => {
  requireMatch(fs.existsSync(path.join(ASSETS, 'prototype4', file)), `required Build 158 asset is missing: ${file}`);
});
[
  'Center-Base.fbx',
  'Center-Base-BaseColor.jpg',
  'Radio-Tower.fbx',
  'Radio-Tower-BaseColor.jpg',
  'Security-Tower.fbx',
  'Security-Tower-BaseColor.jpg',
].forEach(file => {
  requireMatch(fs.existsSync(path.join(ASSETS, 'prototype4', 'hq', file)), `required Build 158 HQ asset is missing: ${file}`);
});
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
console.log(`✅ Built www/index.html (${size} KB)`);
