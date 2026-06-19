// ═══════════════════════════════════════════════════════
//  worlds.js — campaign world framework
//  Purpose:
//  - Defines campaign worlds/wave ranges
//  - Supports world-based prestige reset points
//  - Provides HUD/progress helpers
//  - Provides procedural background rendering hooks
//
//  Load order recommendation in build.js:
//  config.js, data.js, worlds.js, audio.js, engine.js, ...
// ═══════════════════════════════════════════════════════

// ── Campaign Worlds ───────────────────────────────────
// Waves are inclusive. Later worlds can be expanded without breaking old saves.
var CAMPAIGN_WORLDS = window.CAMPAIGN_WORLDS || [
  {
    id: 'earth',
    name: 'Earth Defense',
    shortName: 'Earth',
    icon: '🌍',
    startWave: 1,
    endWave: 30,
    color: '#36d67a',
    accent: '#22d4ff',
    skyTop: '#07111a',
    skyMid: '#101d26',
    skyBottom: '#1b1710',
    subtitle: 'Hold the final defense line against the first invasion front.',
    unlockText: 'Earth is under siege. Establish the last command defense network.',
    modifierText: 'Balanced battlefield. Standard invasion pressure.',
    prestigeReward: 'Earth Command Data',
  },
  {
    id: 'orbit',
    name: 'Orbital Front',
    shortName: 'Orbit',
    icon: '🛰️',
    startWave: 31,
    endWave: 60,
    color: '#22d4ff',
    accent: '#d4a028',
    skyTop: '#02050e',
    skyMid: '#070f20',
    skyBottom: '#10162b',
    subtitle: 'The war reaches low orbit. Satellite defenses come online.',
    unlockText: 'Orbital defenses unlocked. Enemy drop forces are entering from above.',
    modifierText: 'More fast-entry threats. Orbital support becomes more valuable.',
    prestigeReward: 'Orbital Command Data',
  },
  {
    id: 'moon',
    name: 'Lunar Outpost',
    shortName: 'Moon',
    icon: '🌕',
    startWave: 61,
    endWave: 90,
    color: '#b8c3d8',
    accent: '#8ea7ff',
    skyTop: '#03040a',
    skyMid: '#0b0c13',
    skyBottom: '#20232b',
    subtitle: 'Humanity pushes the defense perimeter to the Moon.',
    unlockText: 'Lunar command established. Low-gravity combat protocols are active.',
    modifierText: 'Long sightlines. Precision targeting and shields gain value.',
    prestigeReward: 'Lunar Command Data',
  },
  {
    id: 'mars',
    name: 'Mars Campaign',
    shortName: 'Mars',
    icon: '🔴',
    startWave: 91,
    endWave: 130,
    color: '#e06a35',
    accent: '#ffbf40',
    skyTop: '#210b08',
    skyMid: '#3a160e',
    skyBottom: '#6b2b14',
    subtitle: 'The first counteroffensive begins across the red front.',
    unlockText: 'Mars Campaign unlocked. Dust storms and armored pushes intensify.',
    modifierText: 'Armored pressure increases. Turrets and heavy units scale well.',
    prestigeReward: 'Mars Command Data',
  },
  {
    id: 'outer',
    name: 'Outer Worlds',
    shortName: 'Outer Worlds',
    icon: '🪐',
    startWave: 131,
    endWave: 180,
    color: '#9b5cff',
    accent: '#45ffd2',
    skyTop: '#080416',
    skyMid: '#16102a',
    skyBottom: '#102820',
    subtitle: 'The conflict spreads to alien moons and hostile colonies.',
    unlockText: 'Outer Worlds campaign unlocked. Environmental warfare is escalating.',
    modifierText: 'Elite enemy patterns. Officer and research bonuses matter more.',
    prestigeReward: 'Outer Worlds Command Data',
  },
  {
    id: 'homeworld',
    name: 'Enemy Homeworld',
    shortName: 'Homeworld',
    icon: '☄️',
    startWave: 181,
    endWave: 999999,
    color: '#ff4d6d',
    accent: '#f5f57a',
    skyTop: '#110208',
    skyMid: '#260717',
    skyBottom: '#401025',
    subtitle: 'The last defense becomes the first strike into enemy territory.',
    unlockText: 'Enemy Homeworld unlocked. Final invasion command authority granted.',
    modifierText: 'Endgame pressure. Bosses and elite waves become the primary threat.',
    prestigeReward: 'Homeworld Command Data',
  },
];

// ── World Lookup Helpers ──────────────────────────────
function getCampaignWorld(waveOrId) {
  if (typeof waveOrId === 'string') {
    for (var i = 0; i < CAMPAIGN_WORLDS.length; i++) {
      if (CAMPAIGN_WORLDS[i].id === waveOrId) return CAMPAIGN_WORLDS[i];
    }
    return CAMPAIGN_WORLDS[0];
  }

  var wave = Math.max(1, Math.floor(Number(waveOrId || 1)));
  for (var j = 0; j < CAMPAIGN_WORLDS.length; j++) {
    var w = CAMPAIGN_WORLDS[j];
    if (wave >= w.startWave && wave <= w.endWave) return w;
  }
  return CAMPAIGN_WORLDS[CAMPAIGN_WORLDS.length - 1];
}

function getCampaignWorldIndex(worldId) {
  for (var i = 0; i < CAMPAIGN_WORLDS.length; i++) {
    if (CAMPAIGN_WORLDS[i].id === worldId) return i;
  }
  return 0;
}

function getNextCampaignWorld(waveOrId) {
  var world = getCampaignWorld(waveOrId);
  var idx = getCampaignWorldIndex(world.id);
  return CAMPAIGN_WORLDS[idx + 1] || null;
}

function getWorldStartWave(waveOrId) {
  return getCampaignWorld(waveOrId).startWave;
}

function getWorldEndWave(waveOrId) {
  return getCampaignWorld(waveOrId).endWave;
}

function isFinalCampaignWorld(waveOrId) {
  return !getNextCampaignWorld(waveOrId);
}

function getWorldLocalWave(waveOrId) {
  var wave = Math.max(1, Math.floor(Number(waveOrId || 1)));
  var world = getCampaignWorld(wave);
  return Math.max(1, wave - world.startWave + 1);
}

function getWorldWaveTotal(waveOrId) {
  var world = getCampaignWorld(waveOrId);
  if (world.endWave >= 999999) return null;
  return world.endWave - world.startWave + 1;
}

function getWorldProgress(waveOrState) {
  var wave = typeof waveOrState === 'object'
    ? Math.max(1, Math.floor(Number(waveOrState.wave || 1)))
    : Math.max(1, Math.floor(Number(waveOrState || 1)));

  var world = getCampaignWorld(wave);
  var total = getWorldWaveTotal(wave);
  var local = getWorldLocalWave(wave);
  var next = getNextCampaignWorld(wave);

  var pct = total ? Math.max(0, Math.min(100, Math.round((local - 1) / total * 100))) : 100;
  var remaining = total ? Math.max(0, world.endWave - wave + 1) : null;

  return {
    world: world,
    nextWorld: next,
    wave: wave,
    localWave: local,
    totalWaves: total,
    percent: pct,
    remaining: remaining,
    label: total ? (world.name + ' · Wave ' + local + '/' + total) : (world.name + ' · Wave ' + wave + '+'),
    compactLabel: total ? (world.icon + ' ' + world.shortName + ' · ' + local + '/' + total) : (world.icon + ' ' + world.shortName + ' · ' + wave + '+'),
    nextLabel: next ? ('Next: ' + next.name) : 'Endgame Front',
  };
}

// ── Save/Migration Helpers ────────────────────────────
function ensureCampaignMeta(meta) {
  if (!meta) return meta;
  if (!meta.worldsUnlocked) meta.worldsUnlocked = { earth: true };
  if (!meta.worldBestWave) meta.worldBestWave = {};
  if (!meta.worldPrestige) meta.worldPrestige = {};
  if (typeof meta.commandData !== 'number') meta.commandData = 0;
  if (typeof meta.gems !== 'number') meta.gems = 0;

  // Always unlock worlds based on historic best wave so old saves are respected.
  unlockWorldsThroughWave(meta, meta.bestWave || 1);
  return meta;
}

function ensureCampaignState(state, meta) {
  if (!state) return state;
  ensureCampaignMeta(meta || (typeof G !== 'undefined' ? G.meta : null));

  var world = getCampaignWorld(state.wave || 1);
  state.currentWorldId = world.id;
  state.worldStartWave = world.startWave;
  state.worldEndWave = world.endWave;

  if (typeof state.gems !== 'number') {
    state.gems = (meta && typeof meta.gems === 'number') ? meta.gems : 0;
  }
  if (!state.commandResearch) state.commandResearch = {};
  if (!state.worldBonuses) state.worldBonuses = {};
  return state;
}

function unlockWorldsThroughWave(meta, wave) {
  if (!meta) return;
  if (!meta.worldsUnlocked) meta.worldsUnlocked = { earth: true };

  var maxWave = Math.max(1, Math.floor(Number(wave || 1)));
  for (var i = 0; i < CAMPAIGN_WORLDS.length; i++) {
    var w = CAMPAIGN_WORLDS[i];
    if (maxWave >= w.startWave) meta.worldsUnlocked[w.id] = true;
  }
}

function isWorldUnlocked(meta, worldId) {
  if (!meta) return worldId === 'earth';
  ensureCampaignMeta(meta);
  return !!(meta.worldsUnlocked && meta.worldsUnlocked[worldId]);
}

function recordWorldProgress(meta, state) {
  if (!meta || !state) return;
  ensureCampaignMeta(meta);
  var wave = Math.max(1, Math.floor(Number(state.wave || 1)));
  var world = getCampaignWorld(wave);
  meta.worldBestWave[world.id] = Math.max(meta.worldBestWave[world.id] || world.startWave, wave);
  unlockWorldsThroughWave(meta, wave);
}

// ── World Prestige Helpers ────────────────────────────
function getWorldPrestigeResetWave(state) {
  var wave = state && state.wave ? state.wave : 1;
  return getCampaignWorld(wave).startWave;
}

function getWorldPrestigePreview(state) {
  var wave = state && state.wave ? state.wave : 1;
  var world = getCampaignWorld(wave);
  var local = getWorldLocalWave(wave);
  var completedLocal = Math.max(0, local - 1);
  var commandData = Math.max(1, Math.floor(completedLocal / 5));
  var gems = Math.max(0, Math.floor(completedLocal / 10) * 5);

  return {
    world: world,
    resetWave: world.startWave,
    currentWave: wave,
    localWave: local,
    commandData: commandData,
    gems: gems,
    message: 'Reset to ' + world.name + ' Wave ' + world.startWave + ' and gain +' + commandData + ' Command Data' + (gems ? ' · +' + gems + ' Gems' : ''),
  };
}

function applyWorldPrestigeRewards(state, meta) {
  if (!state || !meta) return null;
  ensureCampaignMeta(meta);
  ensureCampaignState(state, meta);

  var preview = getWorldPrestigePreview(state);
  meta.commandData = (meta.commandData || 0) + preview.commandData;
  meta.gems = (meta.gems || 0) + preview.gems;
  meta.worldPrestige[preview.world.id] = (meta.worldPrestige[preview.world.id] || 0) + 1;

  state.gems = meta.gems;
  return preview;
}

// ── HUD Text Helpers ──────────────────────────────────
function getWorldHudLabel(state) {
  return getWorldProgress(state || { wave: 1 }).compactLabel;
}

function getWorldHudSubLabel(state) {
  var p = getWorldProgress(state || { wave: 1 });
  return p.nextWorld ? (p.percent + '% to ' + p.nextWorld.shortName) : 'Endgame Front';
}

function getWorldUnlockForWaveCross(prevWave, nextWave) {
  var prev = getCampaignWorld(prevWave || 1);
  var next = getCampaignWorld(nextWave || 1);
  if (prev.id === next.id) return null;
  return next;
}

// ── Procedural Background Helpers ─────────────────────
function _worldHexToRgb(hex) {
  var h = String(hex || '#ffffff').replace('#', '');
  if (h.length === 3) h = h.split('').map(function(c){ return c + c; }).join('');
  var n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function _worldRgba(hex, alpha) {
  var c = _worldHexToRgb(hex);
  return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
}

function _worldNoise(i, seed) {
  var x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function _drawWorldSky(ctx, W, H, world) {
  var g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, world.skyTop || '#050711');
  g.addColorStop(0.55, world.skyMid || '#101828');
  g.addColorStop(1, world.skyBottom || '#1a1420');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function _drawWorldStars(ctx, W, H, world, t, count, alpha) {
  var seed = getCampaignWorldIndex(world.id) + 1;
  ctx.save();
  for (var i = 0; i < count; i++) {
    var x = _worldNoise(i, seed) * W;
    var y = _worldNoise(i + 300, seed) * H * 0.68;
    var r = 0.6 + _worldNoise(i + 600, seed) * 1.4;
    var twinkle = alpha * (0.55 + 0.45 * Math.sin((t || 0) * (0.8 + r * 0.3) + i));
    ctx.fillStyle = 'rgba(220,235,255,' + Math.max(0.05, twinkle).toFixed(3) + ')';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function _drawWorldGround(ctx, W, H, world, t) {
  var idx = getCampaignWorldIndex(world.id);
  var baseY = H * 0.72;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, baseY);
  for (var x = 0; x <= W; x += Math.max(24, W / 34)) {
    var n = _worldNoise(Math.floor(x), idx + 7);
    var ridge = Math.sin(x * 0.013 + idx) * 10 + n * 24;
    if (world.id === 'moon') ridge *= 0.55;
    if (world.id === 'mars') ridge *= 1.15;
    ctx.lineTo(x, baseY + ridge);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = _worldRgba(world.color, world.id === 'earth' ? 0.12 : 0.18);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, baseY + H * 0.06);
  for (var x2 = 0; x2 <= W; x2 += Math.max(24, W / 30)) {
    var n2 = _worldNoise(Math.floor(x2), idx + 11);
    ctx.lineTo(x2, baseY + H * 0.06 + Math.sin(x2 * 0.018 + idx * 2) * 14 + n2 * 30);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.34)';
  ctx.fill();
  ctx.restore();
}

function _drawEarthDetails(ctx, W, H, world, t) {
  ctx.save();
  var skylineY = H * 0.66;
  for (var i = 0; i < 26; i++) {
    var bw = W / 40 + _worldNoise(i, 22) * W / 32;
    var bh = H * (0.05 + _worldNoise(i, 24) * 0.11);
    var x = (i / 26) * W + _worldNoise(i, 26) * 20;
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.fillRect(x, skylineY - bh, bw, bh);
    if (_worldNoise(i, 31) > 0.45) {
      ctx.fillStyle = _worldRgba(world.accent, 0.18);
      ctx.fillRect(x + bw * 0.22, skylineY - bh * 0.65, 2, 2);
    }
  }
  ctx.fillStyle = 'rgba(255,90,55,0.05)';
  ctx.fillRect(0, H * 0.62, W, H * 0.18);
  ctx.restore();
}

function _drawOrbitDetails(ctx, W, H, world, t) {
  ctx.save();
  _drawWorldStars(ctx, W, H, world, t, 90, 0.55);

  // Earth curve
  var g = ctx.createRadialGradient(W * 0.5, H * 1.13, W * 0.18, W * 0.5, H * 1.13, W * 0.72);
  g.addColorStop(0, _worldRgba('#2a77ff', 0.24));
  g.addColorStop(0.48, _worldRgba('#103d7a', 0.18));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 1.13, W * 0.72, Math.PI, Math.PI * 2);
  ctx.fill();

  // Orbital grid
  ctx.strokeStyle = _worldRgba(world.accent, 0.18);
  ctx.lineWidth = 1;
  for (var i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.74, W * (0.25 + i * 0.12), H * (0.07 + i * 0.025), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function _drawMoonDetails(ctx, W, H, world, t) {
  ctx.save();
  _drawWorldStars(ctx, W, H, world, t, 70, 0.48);
  for (var i = 0; i < 18; i++) {
    var x = _worldNoise(i, 61) * W;
    var y = H * (0.72 + _worldNoise(i, 63) * 0.22);
    var r = 8 + _worldNoise(i, 65) * 26;
    ctx.strokeStyle = 'rgba(220,225,235,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function _drawMarsDetails(ctx, W, H, world, t) {
  ctx.save();
  // Dust bands
  for (var i = 0; i < 6; i++) {
    var y = H * (0.28 + i * 0.075) + Math.sin((t || 0) * 0.35 + i) * 5;
    ctx.fillStyle = 'rgba(255,180,90,' + (0.025 + i * 0.004) + ')';
    ctx.fillRect(0, y, W, 2 + i);
  }
  ctx.fillStyle = 'rgba(255,80,35,0.055)';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function _drawOuterDetails(ctx, W, H, world, t) {
  ctx.save();
  _drawWorldStars(ctx, W, H, world, t, 110, 0.42);
  var g = ctx.createRadialGradient(W * 0.77, H * 0.24, 4, W * 0.77, H * 0.24, W * 0.28);
  g.addColorStop(0, _worldRgba(world.accent, 0.26));
  g.addColorStop(0.45, _worldRgba(world.color, 0.10));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H * 0.7);

  ctx.strokeStyle = _worldRgba(world.accent, 0.11);
  for (var i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(0, H * (0.42 + i * 0.06));
    for (var x = 0; x <= W; x += 30) {
      ctx.lineTo(x, H * (0.42 + i * 0.06) + Math.sin(x * 0.014 + (t || 0) * 0.25 + i) * 12);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function _drawHomeworldDetails(ctx, W, H, world, t) {
  ctx.save();
  _drawWorldStars(ctx, W, H, world, t, 80, 0.35);
  for (var i = 0; i < 9; i++) {
    var x = _worldNoise(i, 181) * W;
    var y = H * (0.16 + _worldNoise(i, 183) * 0.38);
    var r = 18 + _worldNoise(i, 185) * 45;
    var pulse = 0.06 + 0.035 * Math.sin((t || 0) * 0.8 + i);
    var rg = ctx.createRadialGradient(x, y, 2, x, y, r);
    rg.addColorStop(0, _worldRgba(world.accent, pulse * 1.6));
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}

// Main procedural background hook. Call near the start of the canvas background draw.
function drawCampaignWorldBackground(ctx, W, H, state) {
  if (!ctx || !W || !H) return;
  var s = state || (typeof G !== 'undefined' ? G.state : null) || { wave: 1, time: 0 };
  var world = getCampaignWorld(s.wave || 1);
  var t = s.time || 0;

  _drawWorldSky(ctx, W, H, world);

  if (world.id === 'earth') _drawEarthDetails(ctx, W, H, world, t);
  else if (world.id === 'orbit') _drawOrbitDetails(ctx, W, H, world, t);
  else if (world.id === 'moon') _drawMoonDetails(ctx, W, H, world, t);
  else if (world.id === 'mars') _drawMarsDetails(ctx, W, H, world, t);
  else if (world.id === 'outer') _drawOuterDetails(ctx, W, H, world, t);
  else if (world.id === 'homeworld') _drawHomeworldDetails(ctx, W, H, world, t);

  _drawWorldGround(ctx, W, H, world, t);

  // Subtle world-colored edge vignette.
  ctx.save();
  var vg = ctx.createRadialGradient(W * 0.5, H * 0.42, W * 0.12, W * 0.5, H * 0.5, W * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(0.72, _worldRgba(world.color, 0.035));
  vg.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ── Optional global exposure for debugging/late-loaded scripts ──
window.CAMPAIGN_WORLDS = CAMPAIGN_WORLDS;
window.getCampaignWorld = getCampaignWorld;
window.getCampaignWorldIndex = getCampaignWorldIndex;
window.getNextCampaignWorld = getNextCampaignWorld;
window.getWorldStartWave = getWorldStartWave;
window.getWorldEndWave = getWorldEndWave;
window.getWorldLocalWave = getWorldLocalWave;
window.getWorldWaveTotal = getWorldWaveTotal;
window.getWorldProgress = getWorldProgress;
window.ensureCampaignMeta = ensureCampaignMeta;
window.ensureCampaignState = ensureCampaignState;
window.unlockWorldsThroughWave = unlockWorldsThroughWave;
window.isWorldUnlocked = isWorldUnlocked;
window.recordWorldProgress = recordWorldProgress;
window.getWorldPrestigeResetWave = getWorldPrestigeResetWave;
window.getWorldPrestigePreview = getWorldPrestigePreview;
window.applyWorldPrestigeRewards = applyWorldPrestigeRewards;
window.getWorldHudLabel = getWorldHudLabel;
window.getWorldHudSubLabel = getWorldHudSubLabel;
window.getWorldUnlockForWaveCross = getWorldUnlockForWaveCross;
window.drawCampaignWorldBackground = drawCampaignWorldBackground;
