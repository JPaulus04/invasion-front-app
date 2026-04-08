// ═══════════════════════════════════════════════════════
//  game.js — core game logic
//  Systems: doctrine, upgrades, troops, wave, enemies,
//           rewards, abilities, prestige, save/load
// ═══════════════════════════════════════════════════════






// ── Shared canvas geometry ────────────────────────────
const LANE_Y = [165, 355, 548];
const LANE_NAMES = ['Top', 'Mid', 'Bottom'];
const LANE_COLORS = ['var(--lt)', 'var(--lm)', 'var(--lb)'];

function laneName(i) { return LANE_NAMES[i]; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function laneTroopCount(lane) { return G.state.troops.filter(t => t.lane === lane).length; }
function troopSlots(prestige) { return UNLOCKS.troopSlots(prestige); }

// ── Game singleton (shared mutable state) ─────────────
// G is passed to callbacks that need it (rewards, etc.)
const G = { state: null, meta: null, log: null, canvasWidth: () => 1400 };

// ── Doctrine & Upgrades ───────────────────────────────
function applyDoctrine() {
  const s = G.state;
  const prev = s.baseHp;
  s.maxBaseHp = CFG.BASE_HP; s.baseMaxBase = CFG.BASE_HP;
  s.mods = freshMods();
  s.mods.orbitalCdFlat = s._savedOrbitalFlat ?? 0;
  s.mods.orbitalDamage += UNLOCKS.orbitalDmgBonus(s.prestige);
  const boost = UNLOCKS.docBoost(s.prestige);
  const d = DOCTRINES.find(x => x.id === s.selectedDoctrine);
  d.apply(s);
  if (boost > 1) {
    s.mods.damageMult    *= boost;
    if (s.mods.incomeMult > 0) s.mods.incomeMult *= boost;
    s.mods.ewPower       *= boost;
    s.mods.ewDamageMult  *= boost;
    s.mods.orbitalDamage  = Math.floor(s.mods.orbitalDamage * boost);
    s.mods.laneGunPower  *= boost;
  }
  s.baseHp = Math.min(prev, s.maxBaseHp);
}

function applyUpgrades() {
  UPGRADE_DEFS.forEach(u => u.apply(G.state));
  G.state.baseHp = Math.min(G.state.baseHp, G.state.maxBaseHp);
  _applyTreeNodeEffects(G.state);
  _applyOpsNodeEffects(G.state);
}

// V48 fix: reset all ops-owned perks to baseline before re-applying
// Only resets fields EXCLUSIVE to ops nodes — never touches reward-contributed perks
// Overlapping fields (rifleDamage, medicHeal, etc.) use separate opsXxx fields below
function _resetOpsPerks(s) {
  s.perks.opsRifleDmg       = 0;   // ops-exclusive: Rifle Corps damage
  s.perks.rifleFireRate      = 0;
  s.perks.heavyHpBonus       = 0;
  s.perks.heavyDeployCost    = 0;
  s.perks.opsMedicHeal       = 0;   // ops-exclusive: Medic Corps heal
  s.perks.passiveLaneRegen   = 0;
  s.perks.opsEwSlow          = 0;   // ops-exclusive: EW Division slow
  s.perks.ewSlowDuration     = 0;
  s.perks.opsGrenSplash      = 0;   // ops-exclusive: Grenadier School splash
  s.perks.grenFireRate       = 0;
  s.perks.sniperRange        = 0;
  s.perks.sniperArmorPen     = 0;
  s.perks.blitzFormation     = false;
  s.perks.fortressFormation  = false;
  s.perks.eliteRifleSuppression = false;
  s.perks.eliteHeavyShieldBreak = false;
  s.perks.eliteMedicRevive      = false;
  s.perks.eliteGrenAirburst     = false;
  s.perks.eliteSniperHeadshot   = false;
}

// V44 fix: reset tree-owned perks/mods before re-applying
// barricadeBoost and clearRepair are also used by rewards — handled via snapshot/restore
function _resetTreePerks(s) {
  s.perks.armorPierce      = 0;
  s.perks.extendedRange    = 0;
  s.perks.salvagePct       = 0;
  s.perks.emergencyFund    = false;
  s.perks.extraQueueSlot   = false;
  s.perks.bossOrbitalReset = false;
  s.perks.precisionTracking= false;
  s.perks.scarcityReduce   = false;
  s.perks.killChainCap     = 0;
  // barricadeBoost and clearRepair also used by rewards — snapshot reward portion
  s._rewardBarricade = s._rewardBarricade || 0;
  s._rewardClearRepair = s._rewardClearRepair || 0;
  s.perks.barricadeBoost   = s._rewardBarricade;
  s.perks.clearRepair      = s._rewardClearRepair;
  // Reset tree-contributed mods (doctrine-contributed mods are reset by applyDoctrine)
  s.mods.medicMult         = 0;
}

function _applyOpsNodeEffects(s) {
  if (!s.opsNodes || typeof OPS_NODES === 'undefined') return;
  _resetOpsPerks(s);
  OPS_NODES.forEach(function(node) {
    if (!s.opsNodes[node.id]) return;
    if (node.applyPerk) node.applyPerk(s);
  });
}

// V48: auto-unlock Rifle Corps on fresh state or load
function _initOpsNodes(s) {
  if (!s.opsNodes) s.opsNodes = {};
  if (!s.opsNodes['ops_t1_rifle']) {
    s.opsNodes['ops_t1_rifle'] = { completedAt: Date.now(), auto: true };
    // Do NOT apply perk here — applyUpgrades() will call _applyOpsNodeEffects after this
  }
}

function _applyTreeNodeEffects(s) {
  if (!s.researchNodes || typeof TREE_NODES === 'undefined') return;
  _resetTreePerks(s);
  TREE_NODES.forEach(function(node) {
    if (node.locked) return;
    const rec = s.researchNodes[node.id];
    if (!rec) return;
    if (rec.migrated) return;
    if (node.applyMod)  node.applyMod(s);
    if (node.applyPerk) node.applyPerk(s);
  });
}

// V44: infer tree progress from existing save data (migration)
function _inferTreeProgress(s) {
  if (!s.researchNodes) s.researchNodes = {};
  const lanes = s.lanes || [{},{},{}];
  const upg   = s.upgrades || {};
  const mark  = function(id) {
    if (!s.researchNodes[id]) s.researchNodes[id] = { completedAt: Date.now(), migrated: true };
  };

  // Map old upgrade levels to the closest tree node equivalent
  // Command
  if ((upg.weapons  || 0) >= 1) mark('cmd_t1_weapons');
  if ((upg.training || 0) >= 1) mark('cmd_t1_training');
  // Logistics
  if ((upg.logistics|| 0) >= 1) mark('log_t3_network');
  // Engineering
  if ((upg.fortify  || 0) >= 1) mark('eng_t4_fortress');
  if ((lanes[0].barricade || 0) >= 1) mark('eng_t1_earthworks');
  if ((lanes[0].gun       || 0) >= 1) mark('eng_t1_sentry');
  if ((lanes[0].medbay    || 0) >= 1) mark('eng_t2_aid');
  if ((lanes[0].sensor    || 0) >= 1) mark('eng_t3_sensor');
  if ((lanes[0].relay     || 0) >= 1) mark('eng_t4_relay');

  // Backfill prerequisites — if any node at tier N is complete,
  // all nodes in tiers 1 through N-1 of the same dept must also be complete.
  // This keeps the tree visually and logically consistent on migrated saves.
  _backfillTreePrereqs(s);
}

function _backfillTreePrereqs(s) {
  if (!s.researchNodes || typeof TREE_NODES === 'undefined') return;

  // Group active (non-locked) nodes by department
  var byDept = {};
  TREE_NODES.forEach(function(n) {
    if (n.locked) return;
    if (!byDept[n.dept]) byDept[n.dept] = [];
    byDept[n.dept].push(n);
  });

  Object.keys(byDept).forEach(function(dept) {
    var nodes = byDept[dept];

    // Find highest tier that has at least one completed node
    var maxCompletedTier = 0;
    nodes.forEach(function(n) {
      if (s.researchNodes[n.id] && n.tier > maxCompletedTier) maxCompletedTier = n.tier;
    });
    if (maxCompletedTier <= 1) return;

    // Backfill all nodes in tiers strictly below the max completed tier
    nodes.forEach(function(n) {
      if (n.tier < maxCompletedTier && !s.researchNodes[n.id]) {
        s.researchNodes[n.id] = { completedAt: Date.now(), migrated: true };
      }
    });
  });
}

// ── Cost helpers ──────────────────────────────────────
function troopCost(def) {
  const s = G.state;
  let baseCost = def.cost;
  // V48: heavy deploy cost reduction from Operations
  if (def.id === 'heavy' && s.perks.heavyDeployCost)
    baseCost = Math.max(1, Math.floor(baseCost * (1 + s.perks.heavyDeployCost)));
  const n = s.troops.filter(t => t.type.id === def.id).length;
  return Math.max(
    Math.floor(baseCost * Math.pow(CFG.TROOP_COST_SCALE, n) * (1 + s.mods.costMult)),
    Math.floor(baseCost * CFG.TROOP_COST_MIN)
  );
}
function upgradeCost(def) {
  const s = G.state;
  return Math.floor(def.baseCost * Math.pow(def.scale, s.upgrades[def.id]) * (1 - (s.perks.upgradeDiscount ?? 0)));
}
function laneUpgradeCost(id) {
  const s = G.state;
  const def = LANE_UPGRADE_DEFS.find(x => x.id === id);
  // V42: global upgrade — uses lane 0 as level ref, cost x2.2 covers all 3 lanes
  return Math.floor(def.baseCost * 2.2 * Math.pow(def.scale, s.lanes[0][id]) * (1 - (s.perks.laneDiscount ?? 0)));
}

// ── Troop creation ────────────────────────────────────
function createTroop(id, lane, hp = null, cooldown = 0, slotOverride = null) {
  const type = UNIT_DEFS.find(u => u.id === id);
  const slot = slotOverride ?? laneTroopCount(lane);
  // V48: heavy HP bonus from Operations
  let maxHp = type.hp;
  if (id === 'heavy' && G.state && G.state.perks.heavyHpBonus)
    maxHp = Math.floor(maxHp * (1 + G.state.perks.heavyHpBonus));
  return {
    type, lane, slot,
    x: 160 + Math.min(slot, 5) * 48,
    y: LANE_Y[lane] + (slot % 2 === 0 ? -20 : 20),
    hp: hp ?? maxHp, maxHp,
    cooldown: cooldown || Math.random() * 0.4,
    r: 13,
  };
}

function deployUnit(id) {
  const s = G.state;
  if (!s.started) return;
  if (id === 'sniper' && !UNLOCKS.has(s.prestige, 'u_sniper'))
    return G.log('Sniper locked — requires Command Rank 2.', 'warn');
  const def = UNIT_DEFS.find(u => u.id === id);
  const cost = troopCost(def);
  const slots = UNLOCKS.troopSlots(s.prestige);
  if (laneTroopCount(s.selectedLane) >= slots)
    return G.log(`${laneName(s.selectedLane)} lane at capacity.`, 'warn');
  if (s.credits < cost)
    return G.log(`Need ${cost - Math.floor(s.credits)} more cr for ${def.name}.`, 'warn');
  s.credits -= cost;
  const newTroop = createTroop(id, s.selectedLane);
  // Hard cap guard — reject if lane somehow over capacity after push
  if (laneTroopCount(s.selectedLane) >= slots) {
    s.credits += cost; // refund
    return G.log(`${laneName(s.selectedLane)} lane at capacity.`, 'warn');
  }
  s.troops.push(newTroop);
  G.log(`${def.name} → ${laneName(s.selectedLane)}. -${cost} cr`, 'good');
  playSfx('deploy');
}

function buyUpgrade(id) {
  const s = G.state;
  const def = UPGRADE_DEFS.find(u => u.id === id);
  const cost = upgradeCost(def);
  if (s.credits < cost) return G.log(`Need ${cost - Math.floor(s.credits)} more cr.`, 'warn');
  s.credits -= cost; s.upgrades[id]++;
  applyUpgrades();
  // V42: track prestige peak
  if (!G.meta.researchPeak) G.meta.researchPeak = {};
  const peakKey = 'global_' + id;
  G.meta.researchPeak[peakKey] = Math.max(G.meta.researchPeak[peakKey] || 0, s.upgrades[id]);
  G.log(`${def.name} Lv${s.upgrades[id]}. -${cost} cr`, 'info');
  playSfx('upgrade');
}

function buyLaneUpgrade(id) {
  const s = G.state;
  const cost = laneUpgradeCost(id);
  const def = LANE_UPGRADE_DEFS.find(x => x.id === id);
  if (s.credits < cost) return G.log(`Need ${cost - Math.floor(s.credits)} more cr.`, 'warn');
  s.credits -= cost;
  // V42: apply to all 3 lanes simultaneously
  s.lanes.forEach(l => l[id]++);
  const newLvl = s.lanes[0][id];
  // Update prestige peak in meta
  const peakKey = 'lane_' + id;
  if (!G.meta.researchPeak) G.meta.researchPeak = {};
  G.meta.researchPeak[peakKey] = Math.max(G.meta.researchPeak[peakKey] || 0, newLvl);
  G.log(`${def.name} → All Lanes Lv${newLvl}. -${cost} cr`, 'info');
  playSfx('upgrade');
}

// ── Wave system ───────────────────────────────────────
function startWave(onBoss, onModifier, onHint) {
  const s = G.state;
  if (s.waveInProgress || s.gameOver) return;
  s.waveInProgress = true;
  s.lastWaveStats = { credits: 0, baseDamage: 0, lanePressure: [0, 0, 0] };
  s.runtime = freshRuntime();
  s._killChainWaveCD = 0;     // V44: reset kill chain cap
  s._medicReviveUsed = false; // V48: reset medic revive once-per-wave

  const boss = s.wave % CFG.BOSS_WAVE_EVERY === 0;
  const pool = s.wave < 3
    ? ['none']
    : ['none', 'none', 'armored', 'air', 'scarcity', 'storm', 'surge', 'salvage', 'darkness', 'swarm'];
  const modId = pool[Math.floor(Math.random() * pool.length)];
  s.currentModifier = modId;
  const mod = WAVE_MODIFIERS.find(m => m.id === modId);
  mod.apply(s);

  s.enemiesToSpawn = boss
    ? CFG.BOSS_SPAWN_COUNT
    : Math.floor(CFG.SPAWN_BASE + s.wave * CFG.SPAWN_PER_WAVE) + s.runtime.spawnCountAdd;
  const rawInt = Math.max(CFG.SPAWN_INTERVAL_MIN, CFG.SPAWN_INTERVAL_BASE - s.wave * CFG.SPAWN_INTERVAL_SCALE);
  s.spawnInterval = rawInt / s.runtime.spawnSpeedMult;
  s.spawnTimer = 0;

  if (boss) {
    playSfx('bossAlarm');
    G.log(`⚠ BOSS WAVE ${s.wave}!`, 'danger');
    onBoss?.(s.wave);
  } else {
    G.log(`Wave ${s.wave} — ${mod.name}`, mod.id === 'none' ? 'info' : 'warn');
    playSfx('alarm');
  }

  onModifier?.(mod);

  if (!boss && s.wave >= 6 && s.wave % 6 === 0) triggerDoctrineEvent();

  // First-run hint
  if (s.wave === 1 && !s._firstRunHintShown && G.meta.totalRuns === 0) {
    s._firstRunHintShown = true;
    onHint?.();
  }
}

function triggerDoctrineEvent() {
  const s = G.state;
  const EVENTS = {
    blitz:     { text: 'BLITZ EVENT: Rifle Squads fire 2× faster this wave.',    apply: s => { s.runtime.blitzRifleBoost = true; } },
    fortress:  { text: 'FORTRESS EVENT: Barricades block 50% more this wave.',   apply: s => { s.runtime.fortressBarricadeBoost = true; } },
    logistics: { text: 'SUPPLY EVENT: Kill rewards +40% this wave.',             apply: s => { s.runtime.rewardMult += 0.40; } },
    ew:        { text: 'JAM EVENT: All enemies enter at half speed this wave.',  apply: s => { s.runtime.entryHalfSpeed = true; } },
    artillery: { text: 'BARRAGE EVENT: Orbital recharges at wave end.',          apply: s => { s.runtime.orbitalReset = true; } },
  };
  const ev = EVENTS[s.selectedDoctrine];
  if (!ev) return;
  ev.apply(s);
  return ev.text;
}

function getDoctrineEventText() {
  // called after startWave sets runtime flags, for display
  const s = G.state;
  if (!s.waveInProgress) return null;
  const LABELS = {
    blitz: 'BLITZ EVENT: Rifles 2× faster', fortress: 'FORTRESS: Barricades +50%',
    logistics: 'SUPPLY: Kills +40% rewards', ew: 'JAM: Enemies enter slowed',
    artillery: 'BARRAGE: Orbital auto-recharges',
  };
  if (s.wave >= 6 && s.wave % 6 === 0 && s.wave % CFG.BOSS_WAVE_EVERY !== 0)
    return LABELS[s.selectedDoctrine] ?? null;
  return null;
}

// ── Enemy system — 6 roles ───────────────────────────
// Conscript (baseline), Breacher (fast), Juggernaut (tank),
// Overwatch (ranged), Phalanx (shield), Warden (boss)
function enemyTemplate() {
  const s = G.state;
  const boss = s.wave % CFG.BOSS_WAVE_EVERY === 0;
  const lane = Math.floor(Math.random() * 3);
  const lY = LANE_Y[lane];
  const tough = 1 + s.wave * 0.10;
  const hm = s.runtime.hpMult ?? 1;
  const sw = s.runtime.swarmMult ?? 1;
  const sensorMult = 1 - s.lanes[lane].sensor * 0.10;
  const entryMult = s.runtime.entryHalfSpeed ? 0.5 : 1;
  const spd = v => v * sensorMult * entryMult;

  // ── WARDEN (boss) — 3 scripted phases ──────────────
  if (boss) {
    return {
      kind: 'warden', lane, y: lY, baseY: lY,
      hp: (400 + s.wave * 70) * hm,
      speed: spd(18 + s.wave * 0.5),
      damage: 16 + Math.floor(s.wave * 0.45),
      r: 36, shield: 0,
      color: '#cc3030',
      // Warden phase state
      _wardenPhase: 1,        // starts phase 1
      _wardenFireCd: 2.0,     // suppressive fire cooldown
      _wardenFireRate: 1.8,   // seconds between shots
      _wardenSpawned: false,  // phase 2 reinforcement flag
      _wardenMaxHp: (400 + s.wave * 70) * hm,
    };
  }

  // ── REGULAR ENEMIES — wave-gated composition ───────
  const { modArmored, modBreachRush } = s.runtime;
  const canJugg     = s.wave >= 6;
  const canOverwatch = s.wave >= 8;
  const canPhalanx  = s.wave >= 10;
  const roll = Math.random();

  // Breacher — fast, fragile pressure (boosted during Breach Rush)
  if ((modBreachRush && roll < 0.45) || roll < 0.22)
    return { kind:'breacher', lane, y:lY, baseY:lY, hp:14*tough*hm*sw, speed:spd(78+s.wave*1.8), damage:3+Math.floor(s.wave*.08), r:12, shield:0, color:'#d06060' };

  // Phalanx — shielded protector (wave 10+)
  if ((modArmored && roll < 0.42) || (canPhalanx && roll < 0.36))
    return { kind:'phalanx', lane, y:lY, baseY:lY, hp:28*tough*hm, speed:spd(30+s.wave*0.85), damage:5+Math.floor(s.wave*.10), r:16, shield:30+s.wave*5, color:'#e09050' };

  // Juggernaut — heavy tank (wave 6+)
  if ((modArmored && roll < 0.62) || (canJugg && roll < 0.52))
    return { kind:'juggernaut', lane, y:lY, baseY:lY, hp:55*tough*hm, speed:spd(20+s.wave*0.65), damage:8+Math.floor(s.wave*.14), r:22, shield:0, color:'#a08040' };

  // Overwatch — stops at range, fires at troops (wave 8+)
  if (canOverwatch && roll < 0.65)
    return { kind:'overwatch', lane, y:lY, baseY:lY, hp:22*tough*hm, speed:spd(35+s.wave*1.0), damage:6+Math.floor(s.wave*.12), r:14, shield:0, color:'#7090c0',
      _owRange: 320,          // stops at this X distance from base
      _owFireCd: 0,           // current cooldown
      _owFireRate: 1.4,       // seconds between shots
      _owStopped: false,      // has reached firing position
    };

  // Conscript — baseline filler
  return { kind:'conscript', lane, y:lY, baseY:lY, hp:22*tough*hm, speed:spd(38+s.wave*1.2), damage:4+Math.floor(s.wave*.09), r:14, shield:0, color:'#e06060' };
}

// ── Elite Enemy Variants ─────────────────────────────────────
// Elites are normal enemies with a special mutation applied
// They appear from Wave 15+ and become more common in later chapters
const ELITE_MUTATIONS = {
  berserker: {
    name: 'Berserker',
    color: '#FF2020',
    apply(e, wave) {
      e._mutation = 'berserker';
      e.hp   *= 1.4;
      e.speed *= 1.0; // normal speed but charges when damaged
      e.damage *= 1.6;
      e._berserkerThreshold = e.hp * 0.35; // charges below 35% HP
      e.color = '#FF2020';
      e.r = Math.round(e.r * 1.1);
    },
    desc: 'Charges at double speed below 35% HP'
  },
  armored: {
    name: 'Ironclad',
    color: '#8090A8',
    apply(e, wave) {
      e._mutation = 'ironclad';
      e.hp   *= 1.8;
      e.shield = (e.shield || 0) + 40 + wave * 3;
      e.speed *= 0.85;
      e.color = '#8090A8';
      e.r = Math.round(e.r * 1.15);
    },
    desc: 'Extra shield layer, only Grenadier/Orbital strips it fast'
  },
  phantom: {
    name: 'Phantom',
    color: '#60D0FF',
    apply(e, wave) {
      e._mutation = 'phantom';
      e.hp *= 1.2;
      e._phantomCd = 8 + Math.random() * 4; // seconds between phase-outs
      e._phantomActive = false;
      e.color = '#60D0FF';
    },
    desc: 'Briefly untargetable every 8-12 seconds'
  },
  toxic: {
    name: 'Toxic',
    color: '#60E060',
    apply(e, wave) {
      e._mutation = 'toxic';
      e.hp *= 1.3;
      e.damage *= 1.3;
      e._toxicPulse = 0;
      e.color = '#60E060';
    },
    desc: 'Pulses poison on nearby troops when in range'
  },
  commander: {
    name: 'Commander',
    color: '#E0A020',
    apply(e, wave) {
      e._mutation = 'commander';
      e.hp *= 2.0;
      e.speed *= 0.70;
      e.damage *= 1.4;
      e._commanderAura = true; // nearby enemies take 20% less damage
      e.color = '#E0A020';
      e.r = Math.round(e.r * 1.25);
    },
    desc: 'Nearby enemies take 20% less damage while alive'
  },
  razorbacked: {
    name: 'Razorbacked',
    color: '#FF8040',
    apply(e, wave) {
      e._mutation = 'razorbacked';
      e.hp *= 1.5;
      e.speed *= 1.25;
      e._reflectDmg = true; // reflects 15% of melee damage
      e.color = '#FF8040';
    },
    desc: 'Faster and reflects 15% of damage taken'
  },
};

function _trySpawnElite(e, wave) {
  if (wave < 15) return e; // no elites before wave 15
  const eliteChance = Math.min(0.35, 0.05 + (wave - 15) * 0.006);
  if (Math.random() > eliteChance) return e;
  const eligibleKinds = ['conscript','breacher','phalanx','juggernaut','overwatch'];
  if (!eligibleKinds.includes(e.kind)) return e;
  const pool = wave < 25
    ? ['berserker', 'armored']
    : wave < 40
    ? ['berserker', 'armored', 'toxic', 'razorbacked']
    : Object.keys(ELITE_MUTATIONS);
  const mutId = pool[Math.floor(Math.random() * pool.length)];
  const mut = ELITE_MUTATIONS[mutId];
  if (mut) {
    mut.apply(e, wave);
    e._elite = true;
    e._eliteName = mut.name;
  }
  return e;
}

function spawnEnemy() {
  const s = G.state;
  const t = enemyTemplate();
  const spawnX = G.canvasWidth ? G.canvasWidth() + 42 : 1842;
  const e = {
    x: spawnX, maxHp: t.hp, hp: t.hp,
    kind: t.kind, lane: t.lane, y: t.y, baseY: t.baseY ?? t.y,
    speed: t.speed, damage: t.damage, r: t.r,
    shield: t.shield ?? 0, maxShield: t.shield ?? 0,
    color: t.color, slow: 0,
    // Overwatch state
    _owRange: t._owRange ?? 0,
    _owFireCd: t._owFireCd ?? 0,
    _owFireRate: t._owFireRate ?? 1.4,
    _owStopped: t._owStopped ?? false,
    // Warden state
    _wardenPhase: t._wardenPhase ?? 0,
    _wardenFireCd: t._wardenFireCd ?? 0,
    _wardenFireRate: t._wardenFireRate ?? 1.8,
    _wardenSpawned: t._wardenSpawned ?? false,
    _wardenMaxHp: t._wardenMaxHp ?? 0,
  };
  if (s.perks.entryJam) e.slow = Math.max(e.slow, 1.5);
  s.enemies.push(e);
  s.enemiesToSpawn--;
}

function applyDamage(enemy, damage, source = 'normal') {
  const s = G.state;
  let dmg = damage;
  // Juggernaut: 15% damage reduction from normal sources
  if (enemy.kind === 'juggernaut' && source === 'normal') dmg *= 0.85;
  // Warden phase 2: reduced armor (takes 20% more damage)
  if (enemy.kind === 'warden' && enemy._wardenPhase === 2) dmg *= 1.20;
  // V44: armor pierce — bonus damage vs armored/shielded enemies
  if (s.perks.armorPierce && (enemy.kind === 'juggernaut' || enemy.kind === 'phalanx' || enemy._mutation === 'ironclad'))
    dmg *= (1 + s.perks.armorPierce);
  // V48: sniper armor pen — bonus damage vs armored (sniper source only)
  if (source === 'sniper' && s.perks.sniperArmorPen && (enemy.kind === 'juggernaut' || enemy.kind === 'phalanx' || enemy._mutation === 'ironclad'))
    dmg *= (1 + s.perks.sniperArmorPen);
  // V48: heavy shield break — bonus damage vs shielded
  if (source === 'heavy' && s.perks.eliteHeavyShieldBreak && (enemy.shield > 0 || enemy.maxShield > 0))
    dmg *= 1.20;
  // Phalanx shield absorbs damage first
  if (enemy.shield > 0) {
    const strip = s.mods.ewShieldStrip + s.perks.ewShield;
    const shHit = source === 'ew' ? dmg * (1.8 + strip) : dmg;
    const use = Math.min(enemy.shield, shHit);
    enemy.shield -= use;
    dmg -= source === 'ew' ? use / (1.8 + strip) : use;
    if (enemy.shield < 0.01) enemy.shield = 0;
  }
  if (dmg > 0) {
    enemy.hp -= dmg;
    GAME_STATS.damage_dealt += dmg;
  }
}

function nearestEnemy(t) {
  let best = null, bestD = Infinity;
  const s = G.state;
  const extRange   = s.perks.extendedRange || 0;
  const sniperBonus = (t.type.id === 'sniper' && s.perks.sniperRange) ? s.perks.sniperRange : 0;
  const effectiveRange = t.type.range * (1 + extRange + sniperBonus);
  for (const e of s.enemies) {
    const vis = !e.cloaked || e.slow > 0;
    const reach = e.lane === t.lane;
    if (!vis || !reach) continue;
    const d = Math.hypot(e.x - t.x, e.y - t.y);
    if (d < effectiveRange && d < bestD) { best = e; bestD = d; }
  }
  return best;
}

function unitDmgMult(id, troop) {
  const s = G.state;
  let m = 1 + s.mods.damageMult;
  if (id === 'rifle')     m += s.perks.rifleDamage + (s.perks.opsRifleDmg || 0);
  if (id === 'heavy')     m += s.perks.heavyDamage - s.runtime.heavyPenalty;
  if (id === 'ew')        m += s.mods.ewDamageMult;
  if (id === 'grenadier') m += s.perks.grenRate * 0.5;
  if (id === 'sniper')    m += s.perks.rifleDamage * 0.5;
  // V48: Blitz Formation — rifle+grenadier same lane +20% damage
  if (s.perks.blitzFormation && troop) {
    const lane = troop.lane;
    const paired = (id === 'rifle' && s.troops.some(function(t){ return t.lane===lane && t.type.id==='grenadier'; })) ||
                   (id === 'grenadier' && s.troops.some(function(t){ return t.lane===lane && t.type.id==='rifle'; }));
    if (paired) m += 0.20;
  }
  return m;
}

// ── Wave end & rewards ────────────────────────────────
function finishWave() {
  const s = G.state;
  s.waveInProgress = false;
  if (s.runtime.orbitalReset) { s.abilities.orbitalCd = 0; G.log('Artillery event: Orbital recharged!', 'event'); }

  const incUnlock = 1 + UNLOCKS.incomeBonus(s.prestige);
  const reward = Math.floor(
    (CFG.WAVE_REWARD_BASE + s.wave * CFG.WAVE_REWARD_SCALE) *
    s.global.income * (1 + s.mods.incomeMult) *
    s.runtime.rewardMult * (1 + s.prestige * CFG.PRESTIGE_INCOME_BONUS) * incUnlock
  );
  const deep = UNLOCKS.deepStrike(s.prestige, s.wave);
  s.credits += reward + deep;
  s.lastWaveStats.credits += reward;
  s.creditsEarned += reward;

  const repair = (6 + (s.prestige||0) * 3) + s.perks.clearRepair + s.lanes.reduce((a, l) => a + l.medbay * 0.8, 0);
  s.baseHp = Math.min(s.maxBaseHp, s.baseHp + repair);
  G.log(`Wave ${s.wave} cleared. +${reward}${deep ? ` (+${deep} deep)` : ''} cr  +${Math.floor(repair)} HP`, 'good');

  s.wave++;
  playSfx('victory');
  // V48: earn XP on wave clear
  s.xp = (s.xp || 0) + (CFG.OPS_XP_WAVE || 25);
  return { reward, deep, repair };
}

function buildRewardChoices() {
  const s = G.state;
  const doc = s.selectedDoctrine;
  const mastery = docMastery(G.meta, doc);
  const wave = s.wave;

  // Wave-gated tier system — rewards unlock progressively every 10 waves
  // W1-9:   Tier 1 only (basic buffs — rifle, economy, fortify, intel)
  // W10-19: Tier 1 + some Tier 2 (overdrive, rally, reinforce)
  // W20-29: Full Tier 1 + Tier 2 pool
  // W30-39: Tier 2 + some Tier 3 (doctrine exclusives start appearing)
  // W40+:   Full pool including all Tier 3 and doctrine exclusives
  const maxTier = wave < 10 ? 1 : wave < 20 ? 1.5 : wave < 30 ? 2 : wave < 40 ? 2.5 : 3;
  const exclPool = (mastery >= 7 && wave >= 40) ? REWARD_POOL.filter(r => r.docExclusive === doc) : [];

  const filterTier = pool => pool.filter(r => {
    if (r.tier === 1) return true;
    if (r.tier === 2) return maxTier >= 1.5 && (maxTier >= 2 || Math.random() < 0.4);
    if (r.tier === 3) return maxTier >= 2.5 && (maxTier >= 3 || Math.random() < 0.35);
    return false;
  });

  const synPool = REWARD_POOL.filter(r => !r.docExclusive && r.docSynergy.includes(doc));
  const genPool = REWARD_POOL.filter(r => !r.docExclusive && !r.docSynergy.includes(doc));

  let picks = [];
  if (exclPool.length) picks.push(exclPool[Math.floor(Math.random() * exclPool.length)]);
  picks = [...picks, ...filterTier(synPool).sort(() => Math.random() - 0.5), ...filterTier(genPool).sort(() => Math.random() - 0.5)];
  picks = [...new Map(picks.map(p => [p.id, p])).values()].slice(0, 3);
  return { picks, mastery, doc };
}

function applyReward(reward) {
  const s = G.state;
  reward.apply(s, { laneTroopCount, troopSlots, createTroop });
  s._savedOrbitalFlat = s.mods.orbitalCdFlat;
  // V49: snapshot reward-contributed portions of shared perk fields
  // so _resetTreePerks can restore them without wiping reward gains
  s._rewardBarricade   = s.perks.barricadeBoost || 0;
  s._rewardClearRepair = s.perks.clearRepair    || 0;
  G.log(`${reward.name} selected.`, 'info');
}

// ── Orbital strike ────────────────────────────────────
function orbitalStrike(canvas) {
  const s = G.state;
  if (s.abilities.orbitalCd > 0)
    return G.log(`Orbital recharging: ${Math.ceil(s.abilities.orbitalCd)}s`, 'warn');
  if (!s.enemies.length)
    return G.log('No targets.', 'warn');
  const cd = Math.max(8, CFG.ORBITAL_BASE_CD * (1 + s.mods.orbitalCdMult) - (s.mods.orbitalCdFlat ?? 0));
  s.abilities.orbitalCd = cd;
  const dmg = CFG.ORBITAL_BASE_DMG + s.wave * CFG.ORBITAL_WAVE_DMG + s.prestige * CFG.ORBITAL_PRESTIGE_DMG + s.mods.orbitalDamage;
  const gridLane = s.perks.orbitalGridFire ? s.selectedLane : null;
  const fire = () => {
    s.enemies.forEach(e => {
      const mult = (gridLane !== null && e.lane === gridLane) ? 3 : 1;
      applyDamage(e, dmg * mult, 'orbital');
      s.fx.push({ kind: 'orbital', x: e.x, y: e.y, life: 0.48, max: 0.48, r: e.r + 16 });
    });
  };
  fire();
  if (s.perks.orbitalDouble) setTimeout(() => { if (s.enemies.length) fire(); }, 420);
  G.log(`☄ Orbital — ${Math.floor(dmg)} dmg${s.perks.orbitalGridFire ? ' (Grid: ' + laneName(s.selectedLane) + ')' : ''}.`, 'info');
  playSfx('orbital');
}

// ── Prestige & game over ──────────────────────────────
function prestigeGain() {
  // Ranks earned = floor(wave / 10) — depth is rewarded, no cap
  return Math.max(1, Math.floor(G.state.wave / CFG.PRESTIGE_GAIN_DIV));
}

function canPrestige() {
  return G.state.wave >= CFG.PRESTIGE_WAVE_REQ || G.state.gameOver;
}

// ── ACHIEVEMENT SYSTEM ─────────────────────────────────────────────
const ACHIEVEMENTS = {
  first_blood: { id: 'first_blood', name: 'First Blood', desc: 'Kill your first boss', icon: '🩸' },
  wave_master: { id: 'wave_master', name: 'Wave Master', desc: 'Reach wave 50', icon: '👑' },
  prestige_elite: { id: 'prestige_elite', name: 'Prestige Elite', desc: 'Reach prestige rank 5', icon: '⭐' },
  troop_expert: { id: 'troop_expert', name: 'Troop Expert', desc: 'Deploy 1000 troops', icon: '🎖️', target: 1000 },
  doctrine_master: { id: 'doctrine_master', name: 'Doctrine Master', desc: 'Win 10 runs with each doctrine', icon: '🧭' },
  fortress_guardian: { id: 'fortress_guardian', name: 'Fortress Guardian', desc: 'Complete 10 waves without breaches', icon: '🛡️' },
  speed_runner: { id: 'speed_runner', name: 'Speed Runner', desc: 'Reach wave 30 in under 15 minutes', icon: '⚡' },
  unstoppable: { id: 'unstoppable', name: 'Unstoppable Force', desc: 'Kill 500 bosses', icon: '💀', target: 500 },
};

// Stat tracking object
const GAME_STATS = {
  bosses_killed_run: 0,
  troops_deployed_run: 0,
  troops_by_type: { rifle: 0, heavy: 0, medic: 0, ew: 0, grenadier: 0, sniper: 0 },
  damage_dealt: 0,
  damage_taken: 0,
  credits_earned: 0,
  breaches: 0,
  start_time: 0,
};

function _initRunStats() {
  GAME_STATS.bosses_killed_run = 0;
  GAME_STATS.troops_deployed_run = 0;
  GAME_STATS.troops_by_type = { rifle: 0, heavy: 0, medic: 0, ew: 0, grenadier: 0, sniper: 0 };
  GAME_STATS.damage_dealt = 0;
  GAME_STATS.damage_taken = 0;
  GAME_STATS.credits_earned = 0;
  GAME_STATS.breaches = 0;
  GAME_STATS.start_time = Date.now();
}

function _saveCareerStats() {
  try {
    let career = JSON.parse(localStorage.getItem('ifc_career_stats') || '{}');
    if (!career.total_bosses) career.total_bosses = 0;
    if (!career.total_troops) career.total_troops = 0;
    if (!career.total_runs) career.total_runs = 0;
    if (!career.total_playtime_ms) career.total_playtime_ms = 0;
    if (!career.troops_by_type) career.troops_by_type = { rifle: 0, heavy: 0, medic: 0, ew: 0, grenadier: 0, sniper: 0 };
    if (!career.doctrine_runs) career.doctrine_runs = { blitz: 0, fortress: 0, logistics: 0, ewar: 0 };
    
    career.total_bosses += GAME_STATS.bosses_killed_run;
    career.total_troops += GAME_STATS.troops_deployed_run;
    career.total_runs += 1;
    career.total_playtime_ms += (Date.now() - GAME_STATS.start_time);
    
    const doctrine = G.state.selectedDoctrine || 'blitz';
    const docKey = doctrine === 'blitzkrieg' ? 'blitz' : doctrine === 'fortress' ? 'fortress' : doctrine === 'logistics' ? 'logistics' : 'ewar';
    career.doctrine_runs[docKey] = (career.doctrine_runs[docKey] || 0) + 1;
    
    Object.keys(GAME_STATS.troops_by_type).forEach(t => {
      career.troops_by_type[t] = (career.troops_by_type[t] || 0) + (GAME_STATS.troops_by_type[t] || 0);
    });
    
    localStorage.setItem('ifc_career_stats', JSON.stringify(career));
  } catch(e) {
    console.warn('Career stats save failed:', e.message);
  }
}

function _loadCareerStats() {
  try {
    return JSON.parse(localStorage.getItem('ifc_career_stats') || '{}');
  } catch(e) {
    return {};
  }
}

function _checkAchievements() {
  try {
    let unlocked = JSON.parse(localStorage.getItem('ifc_achievements') || '{}');
    const career = _loadCareerStats();
    
    // First Blood — kill 1 boss
    if (!unlocked.first_blood && GAME_STATS.bosses_killed_run > 0) {
      _unlockAchievement('first_blood');
      unlocked.first_blood = true;
    }
    
    // Wave Master — reach wave 50
    if (!unlocked.wave_master && G.state.wave >= 50) {
      _unlockAchievement('wave_master');
      unlocked.wave_master = true;
    }
    
    // Prestige Elite — rank 5
    if (!unlocked.prestige_elite && G.meta.prestige >= 5) {
      _unlockAchievement('prestige_elite');
      unlocked.prestige_elite = true;
    }
    
    // Troop Expert — 1000 troops
    if (!unlocked.troop_expert && (career.total_troops || 0) >= 1000) {
      _unlockAchievement('troop_expert');
      unlocked.troop_expert = true;
    }
    
    // Unstoppable — 500 bosses
    if (!unlocked.unstoppable && (career.total_bosses || 0) >= 500) {
      _unlockAchievement('unstoppable');
      unlocked.unstoppable = true;
    }
    
    localStorage.setItem('ifc_achievements', JSON.stringify(unlocked));
  } catch(e) {
    console.warn('Achievement check failed:', e.message);
  }
}

function _unlockAchievement(id) {
  const ach = ACHIEVEMENTS[id];
  if (ach) {
    showToast('🏆 Achievement Unlocked: ' + ach.name);
    console.log('🏆 Achievement unlocked:', id);
  }
}

function _getUnlockedAchievements() {
  try {
    return JSON.parse(localStorage.getItem('ifc_achievements') || '{}');
  } catch(e) {
    return {};
  }
}

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  { rank: 1, name: 'ShadowCommander', prestige: 12 },
  { rank: 2, name: 'TacticalGem', prestige: 11 },
  { rank: 3, name: 'DefenseKing', prestige: 10 },
  { rank: 4, name: 'WaveRunner', prestige: 9 },
  { rank: 5, name: 'StrategyMaster', prestige: 8 },
];

// First-time player flag
function _isFirstTime() {
  return localStorage.getItem('ifc_first_time_done') !== '1';
}

function _markFirstTimeDone() {
  localStorage.setItem('ifc_first_time_done', '1');
}

function doPrestige(onComplete) {
  const gain = prestigeGain();
  recordRun(G.meta, G.state);
  _saveCareerStats();
  _checkAchievements();
  // Preserve quest progress across prestige (Orders are long-term progression)
  const savedQuests = G.state._quests ? JSON.parse(JSON.stringify(G.state._quests)) : null;
  G.meta.prestige += gain;
  if (savedQuests) G.meta._quests = savedQuests;
  saveMeta(G.meta);
  localStorage.removeItem(CFG.SAVE_KEY);
  G.state = freshState(G.meta.prestige);
  // Restore quest progress from meta
  if (G.meta._quests) {
    G.state._quests = JSON.parse(JSON.stringify(G.meta._quests));
  }
  // Prestige wave floor: each rank gives +5 starting wave, capped at 100
  const prestigeFloor = G.meta.prestige * 5;  // no cap — wave 400 → rank 40 → start wave 200
  if (prestigeFloor > 1) {
    G.state.wave = prestigeFloor;
    G.log(`Prestige floor: starting at wave ${prestigeFloor}.`, 'system');
  }
  applyDoctrine(); applyUpgrades();
  _initOpsNodes(G.state); // V48: auto-unlock Rifle Corps after prestige
  _restoreIAPPurchases();
  G.log(`Prestige! Rank → ${G.meta.prestige}.`, 'system');
  playSfx('prestige');
  
  // After prestige ceremony, show home then doctrine select
  setTimeout(() => {
    renderHomeScreen();
    $id('homeScreen').style.display = 'flex';
    $id('prestigeOverlay').style.display = 'none';
  }, 2000);
  
  onComplete?.();
}

function triggerGameOver() {
  const s = G.state;
  s.gameOver = true; s.paused = true;
  recordRun(G.meta, s);
  saveMeta(G.meta);
  playSfx('impact');
  G.log('✕ Base destroyed.', 'danger');

  const w = s.wave;
  const GRADES = { S: { min:25, color:'#3ab0d5', bg:'rgba(58,176,213,.06)',  tip:'Outstanding. The invasion met its match.' },
                   A: { min:15, color:'#2db858',  bg:'rgba(45,184,88,.06)',   tip:'Strong run. Doctrine synergy is working.' },
                   B: { min:10, color:'#d4a028',  bg:'rgba(212,160,40,.06)',  tip:'Solid defense. Prestige unlocks are worth pursuing.' },
                   C: { min:6,  color:'#d07030',  bg:'rgba(208,120,48,.06)',  tip:'Lane upgrades and synergy will help next run.' },
                   D: { min:0,  color:'#d04040',  bg:'rgba(208,64,64,.06)',   tip:'Early loss. Secure mid lane and barricades early.' } };
  const grade = Object.entries(GRADES).find(([, g]) => w >= g.min)?.[0] ?? 'D';
  return { grade, ...GRADES[grade], gain: canPrestige() ? prestigeGain() : 0 };
}

// ── Update — per-frame logic ──────────────────────────
function update(dt, canvas, onWaveEnd, onGameOver, onPhaseWarn) {
  const s = G.state;
  if (!s.started || s.paused || s.gameOver) return;
  s.time += dt;
  if (s.abilities.orbitalCd > 0) s.abilities.orbitalCd -= dt;
  if (s.perks.autoRepair && s.waveInProgress && s.baseHp < s.maxBaseHp)
    s.baseHp = Math.min(s.maxBaseHp, s.baseHp + 1 * dt);
  // V48: passive troop regen in clear lanes
  if (s.perks.passiveLaneRegen && s.waveInProgress) {
    [0,1,2].forEach(function(lane) {
      if (s.enemies.some(function(e){ return e.lane === lane; })) return;
      s.troops.filter(function(t){ return t.lane === lane && t.hp < t.maxHp; }).forEach(function(t) {
        t.hp = Math.min(t.maxHp, t.hp + s.perks.passiveLaneRegen * dt);
      });
    });
  }
  // V44: emergency requisition — one-use credit grant at critical HP
  if (s.perks.emergencyFund && !s._emergencyFundUsed && s.baseHp > 0 && s.baseHp < s.maxBaseHp * 0.25) {
    s.credits += 400; s._emergencyFundUsed = true;
    G.log('⚡ Emergency Requisition — +400 cr', 'good');
    if (typeof showToast === 'function') showToast('⚡ Emergency Requisition — +400 cr');
  }

  if (s.waveInProgress) {
    s.spawnTimer -= dt;
    if (s.enemiesToSpawn > 0 && s.spawnTimer <= 0) { spawnEnemy(); s.spawnTimer = s.spawnInterval; }
    if (s.enemiesToSpawn <= 0 && s.enemies.length === 0) { onWaveEnd?.(); return; }
  }

  // Lane infrastructure
  s.lanes.forEach((lane, idx) => {
    if (lane.gun > 0) {
      lane.gunCd -= dt;
      const target = s.enemies.filter(e => e.lane === idx).sort((a, b) => a.x - b.x)[0];
      if (target && lane.gunCd <= 0) {
        const dmg = (CFG.LANE_GUN_BASE_DMG + lane.gun * CFG.LANE_GUN_PER_LVL) * (1 + s.mods.laneGunPower);
        // V50: turret now at H - baseH - (50 + barricade*8)*dpr
        // fromY_scr = H - baseH - (20 + slot*24)*dpr → slot = (30 + barricade*8) / 24
        const barLvl = lane.barricade || 0;
        const turretSlot  = -1;
        const turretFromX = 164;
        const turretFrom  = { lane: idx, slot: turretSlot };
        s.projectiles.push({ from: turretFrom, x: turretFromX, y: LANE_Y[idx], target, speed: 415, damage: dmg, type: 'laneGun', color: '#80d0e8', splash: 0 });
        lane.gunCd = Math.max(CFG.LANE_GUN_CD_MIN, CFG.LANE_GUN_BASE_CD - lane.gun * 0.07) / (1 + s.mods.laneGunRate);
        playSfx('shoot');
      }
    }
    if (lane.medbay > 0) {
      lane.medCd -= dt;
      if (lane.medCd <= 0) {
        const ally = s.troops.filter(t => t.lane === idx && t.hp < t.maxHp)[0];
        if (ally) { ally.hp = Math.min(ally.maxHp, ally.hp + CFG.MEDBAY_HEAL * lane.medbay * s.global.heal); s.fx.push({ kind:'heal', x:ally.x, y:ally.y, life:.20, max:.20, r:7 }); }
        lane.medCd = CFG.MEDBAY_CD;
      }
    }
  });

  // Troops fire
  for (const t of s.troops) {
    t.cooldown -= dt;
    const relay = 1 + s.lanes[t.lane].relay * 0.10;
    const blitzBoost = (s.runtime.blitzRifleBoost && t.type.id === 'rifle') ? 2 : 1;
    if (t.type.id === 'medic') {
      if (t.cooldown <= 0) {
        let healed = false;
        for (const ally of s.troops) {
          if (ally.lane !== t.lane) continue;
          const d = Math.hypot(ally.x - t.x, ally.y - t.y);
          if (ally !== t && d < t.type.range && ally.hp < ally.maxHp) {
            ally.hp = Math.min(ally.maxHp, ally.hp + 5 * s.global.heal * (1 + s.perks.medicHeal + (s.perks.opsMedicHeal||0)) * (1 + s.mods.medicMult));
            healed = true;
            s.fx.push({ kind:'heal', x:ally.x, y:ally.y, life:.25, max:.25, r:9 });
          }
        }
        if (s.baseHp < s.maxBaseHp) {
          s.baseHp = Math.min(s.maxBaseHp, s.baseHp + 1.4 * s.global.heal * (1 + s.perks.medicHeal) * (1 + s.mods.medicMult));
          healed = true;
        }
        if (healed) playSfx('heal');
        t._lastFireTime = performance.now();
        t.cooldown = t.type.fireRate / (s.global.fireRate * (1 + s.mods.fireRateMult) * relay);
      }
      continue;
    }
    const target = nearestEnemy(t);
    if (!target || t.cooldown > 0) continue;
    const grenRate = t.type.id === 'grenadier' ? (1 + s.perks.grenRate) : 1;
    // V48: ops-specific fire rate bonuses per unit type
    const opsFireRate = t.type.id === 'rifle'     ? (1 + (s.perks.rifleFireRate || 0))
                      : t.type.id === 'grenadier' ? (1 + (s.perks.grenFireRate  || 0)) : 1;
    // V48: grenadier splash includes elite airburst bonus
    const splashBonus = s.perks.eliteGrenAirburst ? 0.15 : 0;
    const splash = t.type.id === 'grenadier' ? 48 * (1 + s.perks.grenadeSplash + (s.perks.opsGrenSplash || 0) + splashBonus) : 0;
    const spd = t.type.id === 'heavy' ? 295 : t.type.id === 'grenadier' ? 250 : t.type.id === 'sniper' ? 620 : 368;
    let dmg = t.type.damage * s.global.damage * unitDmgMult(t.type.id, t) * (1 + s.prestige * CFG.PRESTIGE_DMG_BONUS);
    // V48: sniper headshot passive — 20% chance 2x damage
    if (t.type.id === 'sniper' && s.perks.eliteSniperHeadshot && Math.random() < 0.20) dmg *= 2;
    const shots = s.perks.rifleVolley && t.type.id === 'rifle' ? 2 : 1;
    for (let i = 0; i < shots; i++)
      s.projectiles.push({ from: t, x: t.x + 10, y: t.y + i * 0.8, target, speed: spd, damage: dmg / shots, type: t.type.id, color: t.type.color, splash });
    s.fx.push({ kind:'muzzle', x:t.x+12, y:t.y, life:.07, max:.07, r:4 });
    t._lastFireTime = performance.now();
    t.cooldown = t.type.fireRate / (s.global.fireRate * (1 + s.mods.fireRateMult) * relay * grenRate * blitzBoost * opsFireRate);
    playSfx(t.type.id === 'heavy' ? 'heavy' : t.type.id === 'grenadier' ? 'grenade' : t.type.id === 'sniper' ? 'sniper' : 'shoot');
  }

  // Projectiles
  for (const p of s.projectiles) {
    if (!p.target || p.target.hp <= 0) { p.dead = true; continue; }
    const dx = p.target.x - p.x, dy = p.target.y - p.y, d = Math.hypot(dx, dy), step = p.speed * dt;
    if (d <= step + p.target.r) {
      if (p.splash > 0) {
        for (const e of s.enemies) {
          if (Math.abs(e.y - p.target.y) > 70) continue;
          const dist = Math.hypot(e.x - p.target.x, e.y - p.target.y);
          if (dist <= p.splash) applyDamage(e, p.damage * (1 - dist / (p.splash * 1.2)), 'grenadier');
        }
        s.fx.push({ kind:'boom', x:p.target.x, y:p.target.y, life:.24, max:.24, r:28 });
      } else {
        applyDamage(p.target, p.damage, p.type === 'ew' ? 'ew' : p.type);
        s.fx.push({ kind:'hit', x:p.target.x, y:p.target.y, life:.14, max:.14, r:7 });
      }
      if (p.type === 'ew') {
        const slow = 1.9 * (1 + s.mods.ewPower + s.perks.ewSlow + (s.perks.opsEwSlow || 0)) * (1 + (s.perks.ewSlowDuration || 0));
        p.target.slow = Math.max(p.target.slow, slow);
        if (p.target.cloaked) { p.target.cloaked = false; s.fx.push({ kind:'reveal', x:p.target.x, y:p.target.y, life:.4, max:.4, r:p.target.r }); }
        if (s.perks.ewChain) {
          let chain = 0;
          for (const e of s.enemies) {
            if (e === p.target || chain >= 2) continue;
            if (Math.hypot(e.x - p.target.x, e.y - p.target.y) < 85) {
              e.slow = Math.max(e.slow, slow * 0.7);
              if (e.cloaked) e.cloaked = false;
              chain++;
            }
          }
        }
      }
      p.dead = true;
    } else { p.x += dx / d * step; p.y += dy / d * step; }
  }
  s.projectiles = s.projectiles.filter(p => !p.dead);

  // Enemies
  for (const e of s.enemies) {
    if (e.slow > 0) e.slow -= dt;
    const sf = e.slow > 0 ? 0.45 : 1;
    const ps = 1 - s.perks.enemySlow;
    s.lastWaveStats.lanePressure[e.lane] += dt;

    // ── OVERWATCH: stop at range, fire at troops ──────
    if (e.kind === 'overwatch') {
      if (!e._owStopped && e.x <= e._owRange) {
        e._owStopped = true;
      }
      if (e._owStopped) {
        // Don't advance — fire at troops
        e._owFireCd -= dt;
        if (e._owFireCd <= 0) {
          const targets = s.troops.filter(t => t.lane === e.lane);
          if (targets.length) {
            const tgt = targets[Math.floor(Math.random() * targets.length)];
            tgt.hp -= e.damage * 0.4;
            tgt._lastHitTime = performance.now();
            if (tgt.hp <= 0) tgt.hp = 0;
            s.fx.push({ kind:'hit', x:tgt.x, y:tgt.y, life:.12, max:.12, r:6 });
            e._lastFireTime = performance.now();
          }
          e._owFireCd = e._owFireRate;
        }
      } else {
        e.x -= e.speed * sf * ps * dt;
      }

    // ── WARDEN: 3 scripted boss phases ────────────────
    } else if (e.kind === 'warden') {
      const hpFrac = e.hp / e._wardenMaxHp;

      // Phase transitions
      if (e._wardenPhase === 1 && hpFrac <= 0.6) {
        e._wardenPhase = 2;
        e.speed *= 0.7; // slows down
        e.color = '#e08020';
        G.log('⚠ Warden Phase 2 — Reinforcements!', 'danger');
        playSfx('bossAlarm');
      }
      if (e._wardenPhase === 2 && hpFrac <= 0.25) {
        e._wardenPhase = 3;
        e.speed *= 3.5; // charge!
        e.damage *= 1.5;
        e.color = '#ff2020';
        G.log('⚠ Warden Phase 3 — CHARGING!', 'danger');
        playSfx('alarm');
      }

      // Phase 1: slow advance + suppressive fire
      if (e._wardenPhase === 1) {
        e.x -= e.speed * sf * ps * dt;
        e._wardenFireCd -= dt;
        if (e._wardenFireCd <= 0) {
          const targets = s.troops.filter(t => t.lane === e.lane);
          if (targets.length) {
            const tgt = targets[Math.floor(Math.random() * targets.length)];
            tgt.hp -= e.damage * 0.3;
            tgt._lastHitTime = performance.now();
            if (tgt.hp <= 0) tgt.hp = 0;
            s.fx.push({ kind:'hit', x:tgt.x, y:tgt.y, life:.12, max:.12, r:8 });
            e._lastFireTime = performance.now();
          }
          e._wardenFireCd = e._wardenFireRate;
        }
      }

      // Phase 2: spawn reinforcements once, then slow advance
      if (e._wardenPhase === 2) {
        e.x -= e.speed * sf * ps * dt;
        if (!e._wardenSpawned) {
          e._wardenSpawned = true;
          // Spawn 2 conscripts in same lane
          for (let ri = 0; ri < 2; ri++) {
            const rein = {
              x: e.x + 60 + ri * 40, maxHp: 20 + s.wave * 2, hp: 20 + s.wave * 2,
              kind: 'conscript', lane: e.lane, y: e.y + (ri === 0 ? -15 : 15), baseY: e.y + (ri === 0 ? -15 : 15),
              speed: e.speed * 1.5, damage: Math.floor(e.damage * 0.4), r: 14,
              shield: 0, maxShield: 0, color: '#e06060', slow: 0,
              _owRange:0, _owFireCd:0, _owFireRate:1.4, _owStopped:false,
              _wardenPhase:0, _wardenFireCd:0, _wardenFireRate:1.8, _wardenSpawned:false, _wardenMaxHp:0,
            };
            s.enemies.push(rein);
          }
        }
      }

      // Phase 3: direct charge (just fast movement, handled by speed boost above)
      if (e._wardenPhase === 3) {
        e.x -= e.speed * sf * ps * dt;
      }

    // ── ALL OTHERS: standard advance ──────────────────
    } else {
      e.x -= e.speed * sf * ps * dt;
    }

    // Breach
    if (e.x <= 96) {
      const barBlock = CFG.BARRICADE_BLOCK + UNLOCKS.barricadeBonus(s.prestige);
      const block = s.lanes[e.lane].barricade * barBlock * (1 + (s.perks.barricadeBoost ?? 0)) * (s.runtime.fortressBarricadeBoost ? 1.5 : 1);
      let dmg = Math.max(1, e.damage - block);
      // V48: Fortress Formation — medic+heavy same lane reduces breach damage 15%
      if (s.perks.fortressFormation) {
        const hasMedic = s.troops.some(function(t){ return t.lane===e.lane && t.type.id==='medic'; });
        const hasHeavy = s.troops.some(function(t){ return t.lane===e.lane && t.type.id==='heavy'; });
        if (hasMedic && hasHeavy) dmg *= 0.85;
      }
      s.baseHp -= dmg;
      s.baseHp = Math.max(0, s.baseHp);
      s.lastWaveStats.baseDamage += dmg; e.hp = -999;
      GAME_STATS.damage_taken += dmg;
      GAME_STATS.breaches += 1;
      s.fx.push({ kind:'boom', x:96, y:e.y, life:.30, max:.30, r:e.r+8 });
      G.log(`${cap(e.kind)} breached! -${Math.floor(dmg)} HP`, 'danger');
      playSfx('impact');
      // V49: if base just died, flag immediately so remaining enemies this frame don't stack fx
      if (s.baseHp <= 0 && !s.gameOver) {
        s.gameOver = true;
        s.paused   = true;
        break; // stop processing remaining enemies this frame
      }
    }
  }

  // Kill rewards
  const incMult = 1 + UNLOCKS.incomeBonus(s.prestige);
  for (const e of s.enemies) {
    if (e.hp <= 0) {
      const base = CFG.KILL_REWARDS[e.kind] ?? 12;
      const reward = Math.floor(base * s.global.income * (1 + s.mods.incomeMult) * (1 + s.prestige * CFG.PRESTIGE_INCOME_BONUS) * incMult + s.mods.killBonus);
      s.credits += reward; s.lastWaveStats.credits += reward; s.killsTotal++; s.creditsEarned += reward;
      GAME_STATS.credits_earned += reward;
      // V48: earn XP for Operations tree
      const xpGain = isBoss ? (CFG.OPS_XP_BOSS || 15) : (CFG.OPS_XP_KILL || 2);
      s.xp = (s.xp || 0) + xpGain;
      const isBoss = e.kind === 'warden';
      if (isBoss) { s.bossKills++; GAME_STATS.bosses_killed_run++; G.log(`${cap(e.kind)} destroyed! +${reward} cr`, 'good'); }
      // Kill Chain — capped per wave via killChainCap
      if (s.perks.killChain && s.abilities.orbitalCd > 0) {
        const reduction = s.perks.killChainCap ? 0.5 : 0.4;
        if (!s.perks.killChainCap || (s._killChainWaveCD || 0) < s.perks.killChainCap) {
          s.abilities.orbitalCd = Math.max(0, s.abilities.orbitalCd - reduction);
          if (s.perks.killChainCap) s._killChainWaveCD = (s._killChainWaveCD || 0) + reduction;
        }
      }
      // Boss orbital reset (Combat Supremacy)
      if (isBoss && s.perks.bossOrbitalReset) {
        s.abilities.orbitalCd = 0;
        G.log('⚡ Combat Supremacy — Orbital recharged!', 'event');
      }
      // V48: elite rifle suppression — 15% chance +5 cr per kill
      if (!isBoss && s.perks.eliteRifleSuppression && Math.random() < 0.15) {
        s.credits += 5;
      }
      if (e._elite) s.fx.push({ kind:'boom', x:e.x, y:e.y, life:.45, max:.45, r:e.r+18 });
      s.fx.push({ kind:'boom', x:e.x, y:e.y, life:.28, max:.28, r:e.r+5 });
      playSfx(isBoss ? 'bossDown' : 'enemyDown');
    }
  }
  s.enemies = s.enemies.filter(e => e.hp > 0);
  s.fx.forEach(f => f.life -= dt);
  s.fx = s.fx.filter(f => f.life > 0);

  if (s.baseHp <= 0 && !s.paused) { s.baseHp = 0; onGameOver?.(); }
}

// ── Save / Load ───────────────────────────────────────
function saveGame() {
  const s = G.state;
  try {
    localStorage.setItem(CFG.SAVE_KEY, JSON.stringify({
      v: 9,
      selectedDoctrine: s.selectedDoctrine, credits: s.credits, wave: s.wave,
      baseHp: s.baseHp, maxBaseHp: s.maxBaseHp, prestige: s.prestige,
      upgrades: s.upgrades,
      lanes: s.lanes.map(l => ({ gun: l.gun, barricade: l.barricade, medbay: l.medbay, sensor: l.sensor, relay: l.relay })),
      perks: s.perks, orbitalCdFlat: s.mods.orbitalCdFlat ?? 0,
      _rewardBarricade: s._rewardBarricade || 0,
      _rewardClearRepair: s._rewardClearRepair || 0,
      killsTotal: s.killsTotal, bossKills: s.bossKills, creditsEarned: s.creditsEarned,
      troops: s.troops.map(t => ({ id: t.type.id, lane: t.lane, hp: t.hp, cooldown: t.cooldown, slot: t.slot, promoted: t._promoted || 0 })),
      researchNodes: s.researchNodes || {},
      opsNodes: s.opsNodes || {},
      xp: s.xp || 0,
      _emergencyFundUsed: s._emergencyFundUsed || false,
    }));
  } catch (e) { console.warn('Save failed', e); }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(CFG.SAVE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.v !== 8 && d.v !== 9) return; // accept both v8 and v9
    const s = G.state;
    s.selectedDoctrine = d.selectedDoctrine ?? s.selectedDoctrine;
    s.credits = d.credits ?? s.credits;
    s.wave = d.wave ?? s.wave;
    s.baseHp = d.baseHp ?? s.baseHp;
    s.maxBaseHp = d.maxBaseHp ?? s.maxBaseHp;
    s.prestige = d.prestige ?? s.prestige;
    s.killsTotal = d.killsTotal ?? 0;
    s.bossKills = d.bossKills ?? 0;
    s.creditsEarned = d.creditsEarned ?? 0;
    s._emergencyFundUsed = d._emergencyFundUsed ?? false;
    Object.assign(s.upgrades, d.upgrades ?? {});
    (d.lanes ?? []).forEach((l, i) => Object.assign(s.lanes[i], l));
    Object.assign(s.perks, d.perks ?? {});
    s._savedOrbitalFlat  = d.orbitalCdFlat ?? 0;
    s._rewardBarricade   = d._rewardBarricade   || 0;
    s._rewardClearRepair = d._rewardClearRepair || 0;
    // V44: restore or infer research tree progress
    s.researchNodes = d.researchNodes || {};
    _inferTreeProgress(s); // inference + backfill — safe on both v8 and v9
    // V48: restore ops nodes and XP
    s.opsNodes = d.opsNodes || {};
    s.xp = d.xp || 0;
    _initOpsNodes(s); // ensures Rifle Corps auto-unlocked, re-applies ops perks
    applyDoctrine(); applyUpgrades();
    s.troops = (d.troops ?? []).map(t => {
      const trp = createTroop(t.id, t.lane, t.hp, t.cooldown, t.slot);
      if (t.promoted) trp._promoted = t.promoted;
      return trp;
    });
    G.log('Save loaded.', 'system');
  } catch (e) { console.warn('Load failed', e); }
}

