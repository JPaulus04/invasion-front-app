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

// Bundle Capacitor's native haptics bridge into a classic script before the
// legacy controller files are concatenated into the single WebView document.
esbuild.buildSync({
  entryPoints: [path.join(SRC, 'nativeRuntime.entry.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['ios15'],
  outfile: path.join(SRC, 'nativeRuntime.bundle.js'),
});

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
  'nativeRuntime.bundle.js', // Build 162: Capacitor-native iPhone haptics
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
const threeDSource = read('threeDPrototype.entry.js');

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

// centralHQPrototype.js is appended after the renderer/controller block so it
// can install the Command Base override last; remove its development-only tag.
html = html.replace('<script src="src/centralHQPrototype.js"></script>', '');

requireMatch(!html.includes('<script src="src/main.js"></script>'), 'game scripts were not bundled');
requireMatch(!html.includes('<script src="src/centralHQPrototype.js"></script>'), 'prototype script was not bundled');
requireMatch(html.includes('const LSC_BUILD = \'169\';'), 'Build 169 config is not present');
requireMatch(html.includes('Zombie-Soldier.fbx'), 'Build 162 primary zombie renderer is missing');
requireMatch(html.includes('Zombie-Scout.fbx'), 'Build 162 second zombie renderer is missing');
requireMatch(html.includes('Zombie-Punch.fbx'), 'Build 162 clean melee animation is missing');
requireMatch(!html.includes('Rifle-Pack-2-In-1.fbx'), 'retired detached-rifle loader is still bundled');
requireMatch(html.includes('var LANE_COUNT = 8;'), 'Build 162 eight-lane simulation is missing');
requireMatch(html.includes('var COMPOUND_LANES = ['), 'Build 162 compound pathing layout is missing');
requireMatch(!html.includes('var LANE_X_SCALE = .52;'), 'Build 161 oval lane compression is still active');
requireMatch(html.includes('var BARRICADE_STOP_WORLD_RADIUS = 7.8;'), 'Build 162 barrier stop geometry is missing');
requireMatch(html.includes('var QUEUE_START_WORLD_RADIUS = 8.75;'), 'Build 162 queue geometry is missing');
requireMatch(html.includes('var SPAWN_WORLD_RADIUS = 9.9;'), 'Build 162 spawn geometry is missing');
requireMatch(threeDSource.includes('const COMPOUND_LANES = ['), 'Build 162 3D compound layout is missing');
requireMatch(threeDSource.includes('Defensive compound north pad'), 'Build 162 connected compound footprint is missing');
requireMatch(threeDSource.includes('new THREE.PerspectiveCamera(45'), 'Build 162 portrait camera framing is missing');
requireMatch(html.includes('Barricade lane '), 'Build 162 eight-lane renderer is missing');
requireMatch(html.includes("targetType==='barricade'"), 'Build 162 barricade damage routing is missing');
requireMatch(html.includes('Build 162 zombie asset fallback:'), 'Build 162 renderer marker is missing');
requireMatch(html.includes('Commander Holt animated model'), 'Build 162 animated Holt model is missing');
requireMatch(html.includes('Commander Holt two-hand rifle mount'), 'Build 162 two-hand rifle alignment is missing');
requireMatch(html.includes('holt-rifle-fire'), 'Build 162 Holt firing animation is missing');
requireMatch(html.includes('zombie-ready'), 'Build 162 upright waiting pose is missing');
requireMatch(html.includes("level:meta.hq"), 'Build 162 HQ level routing is missing');
requireMatch(html.includes('HQ level 2 reinforced compound'), 'Build 162 reinforced HQ tier is missing');
requireMatch(html.includes('HQ level 2 turret reinforcement'), 'Build 162 upgraded turret tier is missing');
requireMatch(html.includes('HQ level 4 laser upgrade'), 'Build 162 visual HQ tiers are missing');
requireMatch(html.includes("BOSS_LANE_INDEX = 6"), 'Build 162 exclusive boss lane is missing');
requireMatch(html.includes('function phaseBalance(phase)'), 'Build 162 opening balance curve is missing');
requireMatch(html.includes('function retryAssist(phase)'), 'Build 162 retry assistance is missing');
requireMatch(html.includes('PROGRESS IS NEVER LOST'), 'Build 162 failure reward is missing');
requireMatch(html.includes('CURRENT POWER'), 'Build 162 current-power display is missing');
requireMatch(html.includes('function setMusicEnabled(on)'), 'Build 162 music channel control is missing');
requireMatch(html.includes('function setSfxEnabled(on)'), 'Build 162 SFX channel control is missing');
requireMatch(html.includes('musicToggleBtn') && html.includes('sfxToggleBtn'), 'Build 162 audio settings UI is missing');
requireMatch(html.includes('LSCNativeHaptics'), 'Build 162 native haptics bridge is missing');
requireMatch(html.includes("combatSfx('barrierBreak')"), 'Build 162 combat sound routing is missing');
requireMatch(html.includes("combatHaptic(source==='turret'?'medium':'light'"), 'Build 163 weapon-fire haptics are missing');
requireMatch(html.includes("if(isBoss){") && html.includes("if(!run||run.complete||run.bossDefeated)return;"), 'Build 163 boss promotion guard is missing');
requireMatch(html.includes('1:{targets:[9,12,15]') && html.includes('6:{targets:[20,28,37]'), 'Build 164 extended assault counts are missing');
requireMatch(html.includes('function assaultPacing(assault)') && html.includes('function chooseEnemyKind(assault)'), 'Build 164 staged spawn pacing is missing');
requireMatch(html.includes('var FIELD_RARITY=') && html.includes("legendary:{label:'LEGENDARY'"), 'Build 164 promotion rarity system is missing');
requireMatch(html.includes('function chooseFieldUpgrades(rank)') && html.includes('function rarityPlan(rank)'), 'Build 164 promotion choice routing is missing');
requireMatch(html.includes('xpNext:36') && html.includes('run.xpNext*1.32'), 'Build 164 field-rank pacing is missing');
requireMatch(html.includes("button.className='hq-upgrade-choice '+rarity.className"), 'Build 164 rarity presentation is missing');
requireMatch(html.includes('function victoryRewardPreview(phase)') && html.includes('victoryRewardPreview(meta.phase)'), 'Build 164 reward preview is missing');
requireMatch(html.includes('var RESEARCH_BRANCHES = [') && html.includes('var RESEARCH_NODES = ['), 'Build 165 permanent research tree is missing');
requireMatch(html.includes("id:'fire-control'") && html.includes("id:'fortifications'") && html.includes("id:'combat-support'"), 'Build 165 research branches are incomplete');
requireMatch(html.includes('function researchEffects()') && html.includes('function buyResearchNode(nodeId)'), 'Build 165 research behavior is missing');
requireMatch(html.includes('legacyResearchDamage') && html.includes('LEGACY RESEARCH POINT'), 'Build 165 research migration is missing');
requireMatch(html.includes("if(rank===5){run.legendaryMisses=0") && html.includes('Math.random()<.30'), 'Build 165 legendary cadence is missing');
requireMatch(html.includes('NEXT STACK '), 'Build 165 field-promotion stack labeling is missing');
requireMatch(html.includes('COMMAND FORTRESS · MAXIMUM LEVEL') && html.includes('meta.hq>=5'), 'Build 165 five-tier HQ cap is missing');
requireMatch(threeDSource.includes('HQ level 3 raised fortified walls'), 'Build 165 level 3 fortress geometry is missing');
requireMatch(threeDSource.includes('HQ level 4 armored perimeter wall'), 'Build 165 level 4 fortress geometry is missing');
requireMatch(threeDSource.includes('HQ level 5 command fortress wall'), 'Build 165 level 5 fortress geometry is missing');
requireMatch(threeDSource.includes('HQ level 4 armored barrier'), 'Build 165 perimeter growth is missing');
requireMatch(html.includes('var RESEARCH_SCHEMA = 166;'), 'Build 166 research schema is missing');
requireMatch((html.match(/branch:'fire-control'/g)||[]).length===8, 'Build 166 Fire Control branch must contain eight nodes');
requireMatch((html.match(/branch:'fortifications'/g)||[]).length===8, 'Build 166 Fortifications branch must contain eight nodes');
requireMatch((html.match(/branch:'combat-support'/g)||[]).length===8, 'Build 166 Combat Support branch must contain eight nodes');
requireMatch(html.includes("id:'fc-hunter-killer'") && html.includes("id:'fort-reconstruction'") && html.includes("id:'sup-network'"), 'Build 166 research capstones are incomplete');
requireMatch(html.includes('function researchRequirements(node)') && html.includes('COMPLETE BOTH TIER 4 NODES'), 'Build 166 branching prerequisites are missing');
requireMatch(html.includes('function researchPreview(node,effects,purchased)') && html.includes('l166-node-preview'), 'Build 166 current-versus-upgraded research previews are missing');
requireMatch(html.includes('function recoverBetweenAssaults()') && html.includes('artilleryKillCooldown'), 'Build 166 capstone combat effects are missing');
requireMatch(html.includes('l166-resource-icon credits') && html.includes('l166-resource-icon parts'), 'Build 166 resource icons are missing');
requireMatch(html.includes("el.closest('#lsc137-app')"), 'Build 166 Research Center terminology guard is missing');
requireMatch(threeDSource.includes('Level 4 gate pillar west') && !threeDSource.includes('Level 4 fortified gate header'), 'Build 166 Holt visibility gate is missing');
requireMatch(html.includes('var EQUIPMENT_SCHEMA = 167;') && html.includes('var INVENTORY_CAPACITY = 24;'), 'Build 167 equipment schema is missing');
requireMatch((html.match(/minPhase:/g)||[]).length===15, 'Build 167 must contain fifteen curated equipment items');
requireMatch(html.includes("id:'weapon-last-word'") && html.includes("id:'rig-citadel-aegis'") && html.includes("id:'module-omega-relay'"), 'Build 167 legendary equipment set is incomplete');
requireMatch(html.includes('function awardEquipmentDrop(phase,firstClear)') && html.includes("firstClear?'FIRST CLEAR':'PHASE REPLAY'"), 'Build 167 equipment drop routing is missing');
requireMatch(html.includes('VETERAN CACHE') && html.includes('equipmentNotice'), 'Build 167 veteran save migration is missing');
requireMatch(html.includes('function renderInventoryTab(panel)') && html.includes('data-equipment-action="salvage"'), 'Build 167 Inventory controls are missing');
requireMatch(html.includes('function equipmentEffects()') && html.includes('gear.commanderBossDamage'), 'Build 167 equipped combat effects are missing');
requireMatch(html.includes('researchPower() + equipmentPower()') && html.includes('recommendedPower(phase)'), 'Build 167 readiness recalibration is missing');
requireMatch(html.includes('HQ INTEGRITY ') && html.includes('BARRIERS SURVIVED'), 'Build 167 survival reporting is missing');
requireMatch(html.includes('var COMMANDER_SCHEMA = 168;') && html.includes('var COMMANDER_MAX_LEVEL = 20;'), 'Build 168 Commander Mastery schema is missing');
requireMatch(html.includes('function commanderMastery(level)') && html.includes('function renderCommanderTab(panel)'), 'Build 168 Commander profile is missing');
requireMatch(html.includes('COMMAND BURST') && html.includes('function useCommandAbility()'), 'Build 168 signature command is missing');
requireMatch(html.includes('l168-boss-hud') && html.includes("e.kind==='boss'&&e.hp>0"), 'Build 168 Siege Breaker HUD is missing');
requireMatch(threeDSource.includes('Command Bastion rooftop emplacement'), 'Build 169 rooftop Command Bastion is missing');
requireMatch(threeDSource.includes('COMMAND_BASTION_DECK_Y') && html.includes("x:cx-24*s,y:cy-31*s") && html.includes("x:cx+24*s,y:cy-31*s"), 'Build 169 Holt and turret station alignment is missing');
requireMatch(threeDSource.includes('roughly fourteen percent broader') && threeDSource.includes('1.98'), 'Build 168 Holt and boss scale tuning is missing');
requireMatch(threeDSource.includes('function zombieTint(kind, variant, bossGrade)') && !threeDSource.includes('addBossArmor') && !threeDSource.includes('Siege Breaker left shoulder plate'), 'Build 169 stable boss material grades are missing');
requireMatch(html.includes('l168-compare') && html.includes('function equipmentComparisonEffects(definition,peerDefinition)') && html.includes('peerDefinition.name.toUpperCase()'), 'Build 168 equipment comparison is missing');
requireMatch(html.includes('lsc161-loading'), 'Build 162 battle loading screen is missing');
requireMatch(html.includes('html:not(.lsc-command-ready)::before'), 'Build 162 startup shield is missing');
requireMatch(html.includes("classList.add('lsc-command-ready')"), 'Build 162 startup-ready handoff is missing');
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
  'Idle-Aiming.fbx',
  'Firing-Rifle.fbx',
].forEach(file => {
  requireMatch(fs.existsSync(path.join(ASSETS, 'prototype4', file)), `required Build 162 asset is missing: ${file}`);
});
[
  'Center-Base.fbx',
  'Center-Base-BaseColor.jpg',
  'Radio-Tower.fbx',
  'Radio-Tower-BaseColor.jpg',
  'Security-Tower.fbx',
  'Security-Tower-BaseColor.jpg',
].forEach(file => {
  requireMatch(fs.existsSync(path.join(ASSETS, 'prototype4', 'hq', file)), `required Build 162 HQ asset is missing: ${file}`);
});
[
  'M4A1.fbx',
  'texture.png',
].forEach(file => {
  requireMatch(fs.existsSync(path.join(ASSETS, 'prototype4', 'holt', file)), `required Build 162 Holt asset is missing: ${file}`);
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
