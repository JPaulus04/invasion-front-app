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
const balance = require('./src/balance.js');

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
  'balance.js',    // Build 183: accepted v1.0 command-mode balance curves
  'data.js',
  'worlds.js',    // Campaign world framework must load before engine/renderer/UI
  'nativeRuntime.bundle.js', // Build 162: Capacitor-native iPhone haptics
  'audio.js',
  'engine.js',
];

const CONTROLLER_SCRIPTS = [
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

// The accepted Build 183 balance is a pure shared module, so RC packaging verifies
// the full curves rather than relying only on source-string markers.
requireMatch(balance.version === 183, 'Build 183 balance module is missing');
requireMatch(balance.ENERGY.max === 10 && balance.ENERGY.rechargeMs === 45 * 60 * 1000, 'campaign energy reserve or recharge changed');
requireMatch(balance.ECONOMY.startingCredits === 500 && balance.ECONOMY.startingParts === 12, 'tested starting economy changed');
requireMatch(JSON.stringify(balance.ENERGY.creditMultipliers) === JSON.stringify([1, 1.75, 2.40, 2.95, 3.45]), 'campaign credit multiplier ladder is incorrect');
for (let spend = 2; spend <= balance.ENERGY.maxSpend; spend++) {
  requireMatch(balance.energyMultiplier(spend) > balance.energyMultiplier(spend - 1), `energy multiplier does not increase at spend ${spend}`);
  requireMatch(balance.energyMultiplier(spend) / spend < balance.energyMultiplier(spend - 1) / (spend - 1), `energy efficiency does not diminish at spend ${spend}`);
}
const openingTargets = [[9,12,15],[11,15,20],[13,18,24],[15,21,28],[17,24,32],[20,28,37]];
openingTargets.forEach((targets, index) => requireMatch(JSON.stringify(balance.phaseBalance(index + 1).targets) === JSON.stringify(targets), `accepted Phase ${index + 1} contact curve changed`));
requireMatch(balance.campaignBaseCredits(1, 37) === 386, 'Phase 1 credit baseline is incorrect');
requireMatch(balance.campaignParts(5, true) === 4 && balance.campaignParts(5, false) === 3, 'campaign milestone Tech Part boundary is incorrect');
let priorCampaign = null;
let priorRecommended = 0;
let priorCampaignReward = 0;
for (let phase = 1; phase <= 500; phase++) {
  const curve = balance.phaseBalance(phase);
  const kills = curve.targets.reduce((total, count) => total + count, 0) + 1;
  const reward = balance.campaignBaseCredits(phase, kills);
  const recommended = balance.recommendedPower(phase);
  requireMatch(curve.targets.length === 3 && curve.targets.every(Number.isInteger), `Phase ${phase} targets are invalid`);
  requireMatch(curve.targets[0] <= curve.targets[1] && curve.targets[1] <= curve.targets[2], `Phase ${phase} assault order regressed`);
  requireMatch(curve.hp > 0 && curve.damage > 0 && curve.bossHp > 0 && curve.bossDamage > 0 && curve.barricadeHp > 0, `Phase ${phase} has a non-positive combat value`);
  requireMatch(recommended >= priorRecommended, `recommended power regressed at Phase ${phase}`);
  requireMatch(reward >= priorCampaignReward, `campaign reward regressed at Phase ${phase}`);
  if (priorCampaign) {
    requireMatch(curve.targets.every((count, index) => count >= priorCampaign.targets[index]), `contact count regressed at Phase ${phase}`);
    requireMatch(curve.hp >= priorCampaign.hp && curve.damage >= priorCampaign.damage && curve.bossHp >= priorCampaign.bossHp && curve.bossDamage >= priorCampaign.bossDamage, `difficulty regressed at Phase ${phase}`);
  }
  priorCampaign = curve;
  priorRecommended = recommended;
  priorCampaignReward = reward;
}
requireMatch(balance.phaseBalance(180).targets.reduce((total, count) => total + count, 0) <= 320, 'late-campaign contact budget is unbounded');
requireMatch(balance.OPERATIONS.junkyardSeconds === 70 && balance.junkyardVehicleHealth(1) === 4200, 'Junkyard opening objective changed');
requireMatch(balance.operationCredits('containment', 1) === 220 && balance.operationCredits('junkyard', 1) === 300, 'operation opening rewards are incorrect');
requireMatch(balance.operationParts('containment', 1) === 1 && balance.operationParts('junkyard', 9999) === 0, 'operation Tech Part boundary is incorrect');
let priorVehicleHealth = 0;
let priorContainmentCredits = 0;
let priorJunkyardCredits = 0;
let priorContainmentPower = 0;
let priorJunkyardPower = 0;
for (let level = 1; level <= 9999; level++) {
  const armor = balance.junkyardVehicleHealth(level);
  const containmentCredits = balance.operationCredits('containment', level);
  const junkyardCredits = balance.operationCredits('junkyard', level);
  const containmentPower = balance.operationRecommendedPower('containment', level);
  const junkyardPower = balance.operationRecommendedPower('junkyard', level);
  const containment = balance.containmentBalance(level);
  requireMatch(armor > priorVehicleHealth, `Junkyard armor does not increase at Level ${level}`);
  requireMatch(containmentCredits > priorContainmentCredits && junkyardCredits > priorJunkyardCredits, `operation credits do not increase at Level ${level}`);
  requireMatch(containmentPower >= priorContainmentPower && junkyardPower >= priorJunkyardPower, `operation recommended power regressed at Level ${level}`);
  requireMatch(containment.targets.reduce((total, count) => total + count, 0) <= 90, `Containment density exceeds its device budget at Level ${level}`);
  priorVehicleHealth = armor;
  priorContainmentCredits = containmentCredits;
  priorJunkyardCredits = junkyardCredits;
  priorContainmentPower = containmentPower;
  priorJunkyardPower = junkyardPower;
}
requireMatch(balance.performanceBudget({cores:2}).tier === 'low' && balance.performanceBudget({cores:8,memory:8}).tier === 'high', 'adaptive performance tiers are invalid');

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
requireMatch(html.includes('const LSC_BUILD = \'185\';'), 'Build 185 config is not present');
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
requireMatch(html.includes('Build 185 battlefield asset fallback:'), 'Build 185 renderer marker is missing');
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
requireMatch(html.includes('SALVAGE REWARD · ONE ENERGY-FREE RETRY AVAILABLE') && html.includes('campaignRetryPhase=clearedPhase'), 'Build 171 failure salvage and free-retry routing is missing');
requireMatch(html.includes('CURRENT POWER'), 'Build 162 current-power display is missing');
requireMatch(html.includes('function setMusicEnabled(on)'), 'Build 162 music channel control is missing');
requireMatch(html.includes('function setSfxEnabled(on)'), 'Build 162 SFX channel control is missing');
requireMatch(html.includes('musicToggleBtn') && html.includes('sfxToggleBtn'), 'Build 162 audio settings UI is missing');
requireMatch(html.includes('LSCNativeHaptics'), 'Build 162 native haptics bridge is missing');
requireMatch(html.includes("combatSfx('barrierBreak')"), 'Build 162 combat sound routing is missing');
requireMatch(html.includes("combatHaptic(source==='turret'?'medium':'light'"), 'Build 163 weapon-fire haptics are missing');
requireMatch(html.includes("if(isBoss){") && html.includes("if(!run||run.complete||run.bossDefeated)return;"), 'Build 163 boss promotion guard is missing');
requireMatch(html.includes('function phaseBalance(phase)') && html.includes('return BALANCE.phaseBalance(phase);'), 'Build 183 shared campaign balance routing is missing');
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
requireMatch(html.includes('MAXIMUM HQ LEVEL') && html.includes('if(meta.hq<5)'), 'Build 165 five-tier HQ cap is missing');
requireMatch(threeDSource.includes('HQ level 3 raised fortified walls'), 'Build 165 level 3 fortress geometry is missing');
requireMatch(threeDSource.includes('HQ level 4 armored perimeter wall'), 'Build 165 level 4 fortress geometry is missing');
requireMatch(threeDSource.includes('HQ level 5 command fortress wall'), 'Build 165 level 5 fortress geometry is missing');
requireMatch(threeDSource.includes('HQ level 4 armored barrier'), 'Build 165 perimeter growth is missing');
requireMatch(html.includes('var RESEARCH_SCHEMA = 166;'), 'Build 166 research schema is missing');
requireMatch((html.match(/branch:'fire-control'/g)||[]).length===8, 'Build 166 Fire Control branch must contain eight nodes');
requireMatch((html.match(/branch:'fortifications'/g)||[]).length===8, 'Build 166 Fortifications branch must contain eight nodes');
requireMatch((html.match(/branch:'combat-support'/g)||[]).length===8, 'Build 166 Combat Support branch must contain eight nodes');
requireMatch(html.includes("id:'fc-hunter-killer'") && html.includes("id:'fort-reconstruction'") && html.includes("id:'sup-network'"), 'Build 166 research capstones are incomplete');
requireMatch(html.includes('function researchRequirements(node)') && html.includes('CAPSTONES REQUIRE BOTH TIER 4 NODES'), 'Build 166 branching prerequisites are missing');
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
requireMatch(html.includes('l168-boss-hud') && html.includes("run.bossEntityId!=null&&e.id===run.bossEntityId"), 'Build 170 deterministic Siege Breaker HUD is missing');
requireMatch(threeDSource.includes('Command Bastion rooftop emplacement'), 'Build 169 rooftop Command Bastion is missing');
requireMatch(threeDSource.includes('COMMAND_BASTION_DECK_Y') && html.includes("x:cx-(operation?34:28)*s") && html.includes("x:cx+(operation?34:25)*s"), 'Build 172 campaign and forward-operation Holt/turret stations are missing');
requireMatch(html.includes('function firingLineClearsHolt(source,target)') && html.includes("a.source==='turret')a.aim=a.parkAim"), 'Build 170 turret firing clearance is missing');
requireMatch(html.includes('var HQ_ATTACK_WORLD_RADIUS = 6.75;') && html.includes('var BOSS_HQ_STOP_WORLD_RADIUS = 8.55;') && html.includes('run.operation?OPERATION_BOSS_HQ_STOP_WORLD_RADIUS:BOSS_HQ_STOP_WORLD_RADIUS'), 'Build 170 campaign enemy and boss stand-off geometry is missing');
requireMatch(threeDSource.includes('roughly fourteen percent broader') && threeDSource.includes('const BOSS_VISUAL_SCALE = 1.98;'), 'Build 170 Holt and boss scale tuning is missing');
requireMatch(html.includes('var ENERGY_SCHEMA = BALANCE.ENERGY.schema;') && html.includes('var ENERGY_MAX = BALANCE.ENERGY.max;') && html.includes('var ENERGY_RECHARGE_MS = BALANCE.ENERGY.rechargeMs;') && html.includes('function reserveEnergy(cost)'), 'Build 183 campaign energy ledger routing is missing');
requireMatch(html.includes('var CAMPAIGN_MAX_ENERGY_SPEND = BALANCE.ENERGY.maxSpend;') && html.includes('var CAMPAIGN_CREDIT_MULTIPLIERS = BALANCE.ENERGY.creditMultipliers;') && html.includes('data-campaign-energy="') && html.includes('campaignCreditReward(baseCampaignReward,run.energySpend||1)'), 'Build 183 selectable campaign credit balance is missing');
requireMatch(html.includes('reserveEnergy(settings.energySpend)') && !html.includes('energyCommitted<run.assault+1') && !html.includes('reserveEnergy(1)'), 'Build 176 whole-phase energy commitment is missing');
requireMatch(html.includes('campaignRetryPhase') && html.includes('ENERGY-FREE RETRY'), 'Build 176 free retry protection is missing');
requireMatch(html.includes('BALANCE.campaignBaseCredits(clearedPhase,run.kills)') && html.includes('BALANCE.campaignSalvageCredits(clearedPhase,run.kills)') && html.includes('BALANCE.campaignParts(clearedPhase,firstClear)'), 'Build 183 campaign reward routing is incomplete');
requireMatch(html.includes('function victoryPartPreview(phase)') && html.includes('resourcePair(previewCredits,previewParts)'), 'Build 183 campaign reward preview is incomplete');
requireMatch(html.includes('operationLastClearDay') && html.includes('meta.operationLastClearDay=localDayKey()'), 'Build 171 daily reward protection is missing');
requireMatch(html.includes('var OPERATION_LANES = [') && (html.match(/side:'forward'/g)||[]).length===3, 'Build 172 three-lane operation simulation is missing');
requireMatch(html.includes("if(target&&target.kind==='boss')return true") && html.includes("e.kind==='boss'?4"), 'Build 172 reliable boss targeting is missing');
requireMatch(html.includes('function drawOperationEnvironment(W,H,h)') && threeDSource.includes('Build 172 forward containment battlefield'), 'Build 172 distinct operation battlefield is missing');
requireMatch(threeDSource.includes('function setWorldMode(run)') && threeDSource.includes("camera.position.set(0, 7.4, 13.8)"), 'Build 172 lowered operation camera is missing');
requireMatch(threeDSource.includes('OPERATION_BOSS_VISUAL_SCALE') && threeDSource.includes('DAILY OPERATION · FORWARD CONTAINMENT LINE'), 'Build 172 operation boss presentation is missing');
requireMatch(html.includes('var COMMANDER_COMPOUND_RANGE_WORLD = 7.65;') && html.includes('var COMMANDER_APPROACH_DEPTH_WORLD = 1;') && html.includes('worldScale*COMMANDER_COMPOUND_RANGE_WORLD') && html.includes('range:commanderRange') && html.includes('function commanderTargetInPerimeter(source,target)') && html.includes('!commanderTargetInPerimeter(o,e)'), 'Build 173 balanced full-perimeter Holt targeting is missing');
requireMatch(html.includes('var OPERATION_BOSS_PADDING_WORLD = .2;') && html.includes('var OPERATION_BOSS_HQ_STOP_WORLD_RADIUS = 7.65;') && html.includes('run.operation?OPERATION_BOSS_HQ_STOP_WORLD_RADIUS:BOSS_HQ_STOP_WORLD_RADIUS'), 'Build 173 operation boss approach geometry is missing');
requireMatch(threeDSource.includes('record.hips.position.copy(record.hipsAnchor)'), 'Build 173 grounded zombie animation guard is missing');
requireMatch(html.includes('var OPERATION_SCHEMA = 182;') && html.includes('operationManualBest:0') && html.includes('junkyardManualBest:0') && html.includes('loaded.operationManualBest=Math.max(loaded.operationManualBest,loaded.operationLevel-1)'), 'Build 182 operation migration is missing');
requireMatch(html.includes('function operationDifficulty(level)') && html.includes('function operationTargets(level)') && html.includes('operationTargets(operationLevel)') && html.includes('operationScale.bossHealth') && !html.includes('operationTargets(phase,operationLevel)'), 'Build 183 Containment ladder is not independent from Campaign phase');
requireMatch(html.includes('function operationRewardCredits(level)') && html.includes('function operationRewardParts(level)') && html.includes('function operationRewardCreditsFor(kind,level)') && html.includes('Math.max(meta.operationLevel,operationLevel+1)'), 'Build 182 operation reward progression is missing');
requireMatch(html.includes('SPECIAL OPERATIONS · DAILY LADDER') && html.includes('CONTAINMENT LEVEL ') && html.includes('NEXT LEVEL '), 'Build 177 operation ladder presentation is missing');
requireMatch(html.includes('operationLevel:run.operationLevel') && html.includes('operationKind:operationKind') && html.includes('CONTAINMENT ALPHA · LEVEL '), 'Build 182 operation retry and HUD continuity is missing');
requireMatch(html.includes('function operationRewardAvailable()') && html.includes('operationRewardEligible') && html.includes('NO ADDITIONAL RESOURCES'), 'Build 184 daily reward protection is missing');
requireMatch(html.includes('function operationAutoClearState(level)') && html.includes('function autoClearOperation()') && html.includes('meta.operationManualBest>=manualRequired'), 'Build 175 guarded auto-clear is missing');
requireMatch(!commandBaseCode.includes('QA_TEST_ACCESS') && !commandBaseCode.includes('PRACTICE') && !commandBaseCode.includes('RESERVE UNLIMITED') && !commandBaseCode.includes('∞'), 'Build 184 QA access or copy is still present');
requireMatch(html.includes('function operationDayNumber(date)') && html.includes("function activeOperationId(date){return operationDayNumber(date)%2===1?'junkyard':'containment';}") && html.includes('function alternateOperationId(kind)'), 'Build 182 local-day operation rotation is missing');
requireMatch(html.includes("name:'JUNKYARD RECOVERY'") && html.includes("name:'CONTAINMENT SWEEP'") && html.includes('OPERATIONS ROTATE AT LOCAL MIDNIGHT'), 'Build 182 alternating operation identity is missing');
requireMatch(html.includes('junkyardLevel:1') && html.includes('junkyardManualBest:0') && html.includes("function operationLevelFor(kind){return kind==='junkyard'?meta.junkyardLevel:meta.operationLevel;}") && html.includes('operationLastClearDay'), 'Build 182 independent ladders or shared daily claim are missing');
requireMatch(html.includes('if(sourceOperationSchema<175)') && html.includes('loaded.junkyardLevel=Math.max(1') && html.includes('loaded.junkyardManualBest=Math.max(0'), 'Build 182 operation migration guard is missing');
requireMatch(html.includes('function operationAvailable(kind)') && html.includes('===activeOperationId()&&operationRewardAvailable()'), 'Build 184 active-rotation daily deployment gate is missing');
requireMatch(html.includes('function junkyardTimeLimit(){return BALANCE.OPERATIONS.junkyardSeconds;}') && html.includes('function junkyardVehicleHealth(level)') && html.includes("kind:'vehicle'") && html.includes("variant:'armored-transport'"), 'Build 183 timed armored vehicle objective is missing');
requireMatch(html.includes('function updateJunkyard(dt)') && html.includes('if(!run.vehicleDestroyed)run.objectiveTime=Math.max(0,run.objectiveTime-dt)') && html.includes('run.vehicleDestructionTimer<=0)finish(true)') && html.includes('if(run.objectiveTime<=0)'), 'Build 185 Junkyard destruction hold and extraction-failure routing are missing');
requireMatch(html.includes("layouts=junkyard?[]") && html.includes("if(run.operationKind==='junkyard'){updateJunkyard(dt);return;}"), 'Build 182 Junkyard must bypass zombie assault simulation');
requireMatch(html.includes('BALANCE.operationCredits(kind') && html.includes('BALANCE.operationParts(kind') && html.includes('BALANCE.junkyardVehicleHealth(') && html.includes('junkyardVehicleHealth(operationLevel)'), 'Build 183 escalating armor and operation rewards are missing');
requireMatch(html.includes('meta.junkyardManualBest=Math.max(meta.junkyardManualBest,operationLevel)') && html.includes('Math.max(meta.junkyardLevel,operationLevel+1)') && html.includes('meta.operationLastClearDay=localDayKey()'), 'Build 182 manual progression and shared reward claim are missing');
requireMatch(html.includes('function operationAutoClearStateFor(kind,level)') && html.includes("manualReady=kind==='junkyard'?meta.junkyardManualBest>=manualRequired") && html.includes('manualReady&&powerReady&&rewardReady'), 'Build 184 guarded per-operation auto-clear is missing');
requireMatch(html.includes('ARMORED TRANSPORT · ') && html.includes('% DESTROYED') && html.includes('TARGET ESCAPED') && html.includes('NO ADDITIONAL RESOURCES'), 'Build 182 Junkyard HUD and no-repeat-reward result copy are missing');
requireMatch(html.includes('function drawJunkyardEnvironment(W,H,h)') && html.includes('function drawArmoredVehicle(e,wreck)') && html.includes('JUNKYARD CONVOY ROUTE · EXTRACTION GATE ACTIVE'), 'Build 182 2D Junkyard battlefield is missing');
requireMatch(threeDSource.includes('Build 185 decisive-destruction junkyard convoy battlefield') && threeDSource.includes('Procedural armored convoy transport') && threeDSource.includes('Diagonal armored convoy route'), 'Build 185 procedural 3D Junkyard battlefield is missing');
requireMatch(threeDSource.includes('camera.position.set(11.4, 9.1, 14.9)') && threeDSource.includes('function syncArmoredVehicle(run)') && threeDSource.includes("if (unit.kind === 'vehicle') return;"), 'Build 182 Junkyard camera or armored transport renderer is missing');
requireMatch(html.includes('function pushParticle(particle)') && html.includes('run.performance&&run.performance.particleCap') && html.includes('run.performance&&run.performance.corpseCap'), 'Build 183 combat effect budgets are missing');
requireMatch(html.includes('function updateBattleControls(force)') && html.includes('hudNow-run.lastHudUpdate<hudInterval'), 'Build 183 HUD throttling is missing');
requireMatch(threeDSource.includes('const PERFORMANCE_BUDGET = window.LSCBalance.performanceBudget') && threeDSource.includes('function sampleAdaptiveQuality(dt)') && threeDSource.includes('if (width === renderWidth && height === renderHeight) return;'), 'Build 183 adaptive renderer budget is missing');
requireMatch(threeDSource.includes('function unitKey(entity)') && threeDSource.includes('const effectPool =') && threeDSource.includes('const effectGeometries ='), 'Build 183 3D reuse paths are missing');
requireMatch(html.includes('function renderOperationsTab(panel)') && html.includes('id="l176-ops-launch"') && html.includes("renderTab('operations')"), 'Build 177 Special Operations launcher is missing');
requireMatch(html.includes("classList.toggle('l177-operations-mode',operationsMode)") && html.includes('l177-ops-screen') && html.includes('← COMMAND BASE'), 'Build 177 full-screen Special Operations destination is missing');
requireMatch(html.includes('operationsReturnState={tab:activeCommandTab') && html.includes('renderTab(operationsReturnState.tab,{scrollTop:operationsReturnState.scrollTop})'), 'Build 177 Command Base return continuity is missing');
requireMatch(html.includes('lsc180-research-style') && html.includes('l180-doctrine-board') && html.includes('data-research-select') && html.includes('l180-selection-tray'), 'Build 180 unified Research board is missing');
requireMatch(html.includes('l180-research-mode') && html.includes('#lsc137-app.l180-research-mode .l137-hero'), 'Build 180 compact Research destination is missing');
requireMatch(html.includes('function researchNodeBadge(node)') && html.includes('function researchNodeState(node)') && html.includes('function researchStatMarkup(node)'), 'Build 180 concise Research node labels are missing');
requireMatch(html.includes("name:'Attack Power'") && html.includes("name:'Range'") && html.includes("name:'Barrier Health'") && html.includes("name:'Cooldown'"), 'Build 180 short Research names are missing');
requireMatch(!commandBaseCode.includes('function renderStoreTab(panel)') && !commandBaseCode.includes('id="l181-store-launch"') && !commandBaseCode.includes("renderTab('store')"), 'Build 184 still exposes the incomplete Supply Depot preview');
requireMatch(!CONTROLLER_SCRIPTS.includes('iap.js') && !read('main.js').includes('rcInitialize') && !read('main.js').includes('debugIAP') && commandBaseCode.includes("['storeBtn','homeStoreBtn','store-backdrop','store-sheet','quickbuy-barracks-btn','quickbuy-research-btn'].forEach(removeLegacyNode)"), 'Build 184 still initializes or exposes the inactive purchase framework');
requireMatch(commandBaseCode.includes('var META_BACKUP_KEY = META_KEY + \'_backup\';') && commandBaseCode.includes('readStoredMeta(META_KEY)||readStoredMeta(META_BACKUP_KEY)') && commandBaseCode.includes('Math.min(now,Number(loaded.energyUpdatedAt)||now)'), 'Build 184 save recovery migration is missing');
requireMatch(commandBaseCode.includes("window.addEventListener('pagehide', pauseForLifecycle)") && commandBaseCode.includes('if(document.hidden){pauseForLifecycle();return;}'), 'Build 184 device lifecycle pause guard is missing');
requireMatch(html.includes('function renderHqTab(panel)') && html.includes('MAXIMUM HQ LEVEL') && html.includes('FORTRESS FULLY DEPLOYED'), 'Build 181 maximum HQ presentation is missing');
requireMatch(html.includes('the Commander and main turret fire') && html.includes('Commander damage') && !html.includes('Holt damage +') && !html.includes('Holt fire rate +'), 'Build 181 Commander terminology cleanup is missing');
requireMatch(html.includes('top:calc(env(safe-area-inset-top,0px) + 18px)') && html.includes('top:calc(env(safe-area-inset-top,0px) + 17px)'), 'Build 181 combat safe-area spacing is missing');
requireMatch(html.includes('EXTRA ENERGY MULTIPLIES CREDITS ONLY') && html.includes('TECH PARTS, EQUIPMENT, AND PROGRESSION NEVER MULTIPLY'), 'Build 176 reward-boundary disclosure is missing');
requireMatch(threeDSource.includes('function zombieTint(kind, variant, bossGrade)') && threeDSource.includes('function buildBossSilhouette(root, bossGrade)') && threeDSource.includes('Juggernaut shoulder armor') && threeDSource.includes('Outbreak boss dorsal spine') && !threeDSource.includes('addBossArmor'), 'Build 185 stable boss silhouette grades are missing');
requireMatch(threeDSource.includes('Campaign tier 1 · Overrun Forward Outpost') && threeDSource.includes('Campaign tier 2 · Collapsed Industrial Sector') && threeDSource.includes('Campaign tier 3 · Ruined Urban Perimeter') && threeDSource.includes('function syncCampaignWorld(run, dt)'), 'Build 185 campaign theater progression is missing');
requireMatch(html.includes('Build 185 2D fallback mirrors the three authored campaign theaters') && html.includes('background:rgba(0,4,8,.58)'), 'Build 185 campaign fallback or promotion visibility polish is missing');
requireMatch(html.includes('function spawnVehicleExplosion(e)') && html.includes('vehicleDestructionTimer=1.45') && html.includes('ARMORED TRANSPORT · DESTROYED'), 'Build 185 decisive armored transport destruction is missing');
requireMatch(html.includes('function spawnArtilleryImpact(target,sequence)') && html.includes('FIRE MISSION · IMPACT') && threeDSource.includes("shockwave: new THREE.RingGeometry") && threeDSource.includes("fireball: new THREE.IcosahedronGeometry"), 'Build 185 heavy artillery strike presentation is missing');
requireMatch(threeDSource.includes('function applyCameraFeedback(run)') && threeDSource.includes('junkyardVehicleFlames') && threeDSource.includes('junkyardVehicleBlastLight'), 'Build 185 impact camera or vehicle fire feedback is missing');
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
