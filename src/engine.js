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
}

// ── Cost helpers ──────────────────────────────────────
function troopCost(def) {
  const s = G.state;
  const n = s.troops.filter(t => t.type.id === def.id).length;
  return Math.max(
    Math.floor(def.cost * Math.pow(CFG.TROOP_COST_SCALE, n) * (1 + s.mods.costMult)),
    Math.floor(def.cost * CFG.TROOP_COST_MIN)
  );
}
function upgradeCost(def) {
  const s = G.state;
  return Math.floor(def.baseCost * Math.pow(def.scale, s.upgrades[def.id]) * (1 - (s.perks.upgradeDiscount ?? 0)));
}
function laneUpgradeCost(id, lane) {
  const s = G.state;
  const def = LANE_UPGRADE_DEFS.find(x => x.id === id);
  return Math.floor(def.baseCost * Math.pow(def.scale, s.lanes[lane][id]) * (1 - (s.perks.laneDiscount ?? 0)));
}

// ── Troop creation ────────────────────────────────────
function createTroop(id, lane, hp = null, cooldown = 0, slotOverride = null) {
  const type = UNIT_DEFS.find(u => u.id === id);
  const slot = slotOverride ?? laneTroopCount(lane);
  return {
    type, lane, slot,
    x: 160 + Math.min(slot, 5) * 48,
    y: LANE_Y[lane] + (slot % 2 === 0 ? -20 : 20),
    hp: hp ?? type.hp, maxHp: type.hp,
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
  s.troops.push(createTroop(id, s.selectedLane));
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
  G.log(`${def.name} Lv${s.upgrades[id]}. -${cost} cr`, 'info');
  playSfx('upgrade');
}

function buyLaneUpgrade(id) {
  const s = G.state;
  const lane = s.selectedLane;
  const cost = laneUpgradeCost(id, lane);
  const def = LANE_UPGRADE_DEFS.find(x => x.id === id);
  if (s.credits < cost) return G.log(`Need ${cost - Math.floor(s.credits)} more cr.`, 'warn');
  s.credits -= cost; s.lanes[lane][id]++;
  G.log(`${def.name} → ${laneName(lane)} Lv${s.lanes[lane][id]}. -${cost} cr`, 'info');
  playSfx('upgrade');
}

// ── Wave system ───────────────────────────────────────
function startWave(onBoss, onModifier, onHint) {
  const s = G.state;
  if (s.waveInProgress || s.gameOver) return;
  s.waveInProgress = true;
  s.lastWaveStats = { credits: 0, baseDamage: 0, lanePressure: [0, 0, 0] };
  s.runtime = freshRuntime();

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

// ── Enemy system ──────────────────────────────────────
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

  if (boss) {
    const canPhase = s.wave >= 10;
    const r = Math.random();
    if (r < 0.34) return { kind:'siege',    lane, y:lY, hp:(320+s.wave*62)*hm, speed:spd(22+s.wave*.70), damage:18+Math.floor(s.wave*.50), r:34, shield:0,              color:'#c05050' };
    if (r < (canPhase ? 0.67 : 0.99)) return { kind:'warlord',  lane, y:lY, hp:(258+s.wave*54)*hm, speed:spd(26+s.wave*.74), damage:11+Math.floor(s.wave*.38), r:30, shield:84+s.wave*11, color:'#e07050' };
    if (canPhase) return { kind:'phaselord', lane, y:lY, hp:(295+s.wave*57)*hm, speed:spd(30+s.wave*.78), damage:14+Math.floor(s.wave*.41), r:28, shield:0,              color:'#b050c8', phaseCd:CFG.PHASE_LORD_TELEPORT_CD };
    return { kind:'siege', lane, y:lY, hp:(320+s.wave*62)*hm, speed:spd(22+s.wave*.70), damage:18+Math.floor(s.wave*.50), r:34, shield:0, color:'#c05050' };
  }

  const { modArmored, modAir } = s.runtime;
  const canStalker   = s.wave >= 5;
  const canRazorwing = s.wave >= 6;
  const roll = Math.random();
  if      ((modAir&&roll<.36)||roll<.22)     return { kind:'runner',   lane, y:lY,    hp:16*tough*hm*sw, speed:spd(72+s.wave*1.7),  damage:4+Math.floor(s.wave*.09), r:12, shield:0,               color:'#d08080' };
  else if ((modAir&&roll<.58)||roll<.34)     return { kind:'flyer',    lane, y:lY-44, hp:20*tough*hm*sw, speed:spd(60+s.wave*1.4),  damage:5+Math.floor(s.wave*.10), r:13, shield:0,               color:'#b090e8', flying:true };
  else if ((modArmored&&roll<.72)||roll<.50) return { kind:'shield',   lane, y:lY,    hp:25*tough*hm,    speed:spd(32+s.wave*.9),   damage:4+Math.floor(s.wave*.10), r:15, shield:24+s.wave*4.5,   color:'#e09050' };
  else if ((modArmored&&roll<.90)||roll<.75) return { kind:'brute',    lane, y:lY,    hp:50*tough*hm,    speed:spd(23+s.wave*.8),   damage:7+Math.floor(s.wave*.14), r:21, shield:0,               color:'#d0a050' };
  else if (roll<.87&&canStalker)             return { kind:'stalker',  lane, y:lY,    hp:28*tough*hm,    speed:spd(46+s.wave*1.1),  damage:5+Math.floor(s.wave*.11), r:14, shield:0,               color:'#50c090', cloaked:false };
  else if (roll<.94&&canRazorwing)           return { kind:'razorwing',lane, y:lY-20, hp:18*tough*hm*sw, speed:spd(55+s.wave*1.2),  damage:4+Math.floor(s.wave*.09), r:11, shield:0,               color:'#d8d050', flying:true, multiLane:true };
  else                                       return { kind:'grunt',    lane, y:lY,    hp:22*tough*hm,    speed:spd(38+s.wave*1.2),  damage:4+Math.floor(s.wave*.09), r:14, shield:0,               color:'#e06060' };
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
  warden: {
    name: 'Warden',
    color: '#E0A020',
    apply(e, wave) {
      e._mutation = 'warden';
      e.hp *= 2.0;
      e.speed *= 0.70;
      e.damage *= 1.4;
      e._wardenAura = true; // nearby enemies take 20% less damage
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
  // Elite chance scales with wave: 5% at W15, 20% at W40, 35% at W70+
  const eliteChance = Math.min(0.35, 0.05 + (wave - 15) * 0.006);
  if (Math.random() > eliteChance) return e;
  // Only certain enemy kinds can become elite
  const eligibleKinds = ['runner','grunt','shield','brute','flyer','stalker'];
  if (!eligibleKinds.includes(e.kind)) return e;
  // Pick a mutation weighted by wave
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
    kind: t.kind, lane: t.lane, y: t.y, baseY: t.y,
    speed: t.speed, damage: t.damage, r: t.r,
    shield: t.shield ?? 0, maxShield: t.shield ?? 0,
    color: t.color, slow: 0,
    disruptCd: t.kind === 'warlord' ? CFG.WARLORD_DISRUPT_CD : 0,
    phaseCd: t.phaseCd ?? 0,
    phaseWarn: 0,
    cloaked: t.cloaked ?? false,
    multiLane: t.multiLane ?? false,
  };
  if (s.perks.entryJam) e.slow = Math.max(e.slow, 1.5);
  s.enemies.push(e);
  s.enemiesToSpawn--;
}

function applyDamage(enemy, damage, source = 'normal') {
  const s = G.state;
  let dmg = damage;
  if (enemy.cloaked && source === 'normal') dmg *= CFG.STALKER_CLOAK_DMG_FRAC;
  if (enemy.kind === 'brute'   && source === 'normal') dmg *= 0.90;
  if (enemy.kind === 'warlord' && source === 'normal') dmg *= 0.88;
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
  for (const e of G.state.enemies) {
    const vis = !e.cloaked || e.slow > 0;
    const reach = e.lane === t.lane || (e.kind === 'flyer' && Math.abs(e.lane - t.lane) <= 1) || e.multiLane;
    if (!vis || !reach) continue;
    const d = Math.hypot(e.x - t.x, e.y - t.y);
    if (d < t.type.range && d < bestD) { best = e; bestD = d; }
  }
  return best;
}

function unitDmgMult(id) {
  const s = G.state;
  let m = 1 + s.mods.damageMult;
  if (id === 'rifle')     m += s.perks.rifleDamage;
  if (id === 'heavy')     m += s.perks.heavyDamage - s.runtime.heavyPenalty;
  if (id === 'ew')        m += s.mods.ewDamageMult;
  if (id === 'grenadier') m += s.perks.grenRate * 0.5;
  if (id === 'sniper')    m += s.perks.rifleDamage * 0.5;
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
  // Pass G as second arg for rewards that need createTroop (r_reinforce)
  reward.apply(s, { laneTroopCount, troopSlots, createTroop });
  s._savedOrbitalFlat = s.mods.orbitalCdFlat;
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
        s.projectiles.push({ x: 124, y: LANE_Y[idx], target, speed: 415, damage: dmg, type: 'laneGun', color: '#80d0e8', splash: 0 });
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
            ally.hp = Math.min(ally.maxHp, ally.hp + 5 * s.global.heal * (1 + s.perks.medicHeal) * (1 + s.mods.medicMult));
            healed = true;
            s.fx.push({ kind:'heal', x:ally.x, y:ally.y, life:.25, max:.25, r:9 });
          }
        }
        if (s.baseHp < s.maxBaseHp) {
          s.baseHp = Math.min(s.maxBaseHp, s.baseHp + 1.4 * s.global.heal * (1 + s.perks.medicHeal) * (1 + s.mods.medicMult));
          healed = true;
        }
        if (healed) playSfx('heal');
        t.cooldown = t.type.fireRate / (s.global.fireRate * (1 + s.mods.fireRateMult) * relay);
      }
      continue;
    }
    const target = nearestEnemy(t);
    if (!target || t.cooldown > 0) continue;
    const grenRate = t.type.id === 'grenadier' ? (1 + s.perks.grenRate) : 1;
    const splash = t.type.id === 'grenadier' ? 48 * (1 + s.perks.grenadeSplash) : 0;
    const spd = t.type.id === 'heavy' ? 295 : t.type.id === 'grenadier' ? 250 : t.type.id === 'sniper' ? 620 : 368;
    const dmg = t.type.damage * s.global.damage * unitDmgMult(t.type.id) * (1 + s.prestige * CFG.PRESTIGE_DMG_BONUS);
    const shots = s.perks.rifleVolley && t.type.id === 'rifle' ? 2 : 1;
    for (let i = 0; i < shots; i++)
      s.projectiles.push({ from: t, x: t.x + 10, y: t.y + i * 0.8, target, speed: spd, damage: dmg / shots, type: t.type.id, color: t.type.color, splash });
    s.fx.push({ kind:'muzzle', x:t.x+12, y:t.y, life:.07, max:.07, r:4 });
    t.cooldown = t.type.fireRate / (s.global.fireRate * (1 + s.mods.fireRateMult) * relay * grenRate * blitzBoost);
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
        applyDamage(p.target, p.damage, p.type === 'ew' ? 'ew' : 'normal');
        s.fx.push({ kind:'hit', x:p.target.x, y:p.target.y, life:.14, max:.14, r:7 });
      }
      if (p.type === 'ew') {
        const slow = 1.9 * (1 + s.mods.ewPower + s.perks.ewSlow);
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
    if (e.kind === 'stalker') e.cloaked = e.slow <= 0;
    if (e.kind === 'flyer' || e.multiLane) e.y = e.baseY + Math.sin(s.time * 5.5 + e.x * 0.01) * 11;
    const sf = e.slow > 0 ? 0.45 : 1;
    const ps = 1 - s.perks.enemySlow;
    e.x -= e.speed * sf * ps * dt;
    s.lastWaveStats.lanePressure[e.lane] += dt;

    if (e.kind === 'warlord') {
      e.disruptCd -= dt;
      if (e.disruptCd <= 0) {
        const troops = s.troops.filter(t => t.lane === e.lane);
        if (troops.length) {
          const tgt = troops[Math.floor(Math.random() * troops.length)];
          tgt.cooldown += CFG.WARLORD_DISRUPT_AMT;
          s.fx.push({ kind:'emp', x:tgt.x, y:tgt.y, life:.40, max:.40, r:18 });
          G.log(`Warlord disrupted ${laneName(e.lane)}!`, 'danger');
        }
        e.disruptCd = CFG.WARLORD_DISRUPT_CD;
      }
    }

    if (e.kind === 'phaselord') {
      e.phaseCd -= dt;
      if (e.phaseCd <= CFG.PHASE_LORD_WARN_TIME && e.phaseWarn === 0) {
        e.phaseWarn = CFG.PHASE_LORD_WARN_TIME;
        onPhaseWarn?.(true);
        playSfx('phase');
      }
      if (e.phaseWarn > 0) {
        e.phaseWarn -= dt;
        if (e.phaseWarn <= 0) {
          e.phaseWarn = 0;
          onPhaseWarn?.(false);
          const counts = [0, 1, 2].map(l => laneTroopCount(l));
          const weakest = counts.indexOf(Math.min(...counts));
          s.fx.push({ kind:'phase', x:e.x, y:e.y, life:.5, max:.5, r:e.r });
          e.lane = weakest; e.y = LANE_Y[weakest]; e.baseY = LANE_Y[weakest];
          e.x = Math.min(e.x, canvas.width * 0.58);
          e.phaseCd = CFG.PHASE_LORD_TELEPORT_CD;
          G.log(`Phase Lord teleported → ${laneName(weakest)} lane!`, 'danger');
        }
      }
    }

    // Breach
    if (e.x <= 96) {
      const barBlock = CFG.BARRICADE_BLOCK + UNLOCKS.barricadeBonus(s.prestige);
      const block = s.lanes[e.lane].barricade * barBlock * (1 + (s.perks.barricadeBoost ?? 0)) * (s.runtime.fortressBarricadeBoost ? 1.5 : 1);
      const dmg = Math.max(1, e.damage - block);
      s.baseHp -= dmg; s.lastWaveStats.baseDamage += dmg; e.hp = -999;
      GAME_STATS.damage_taken += dmg;
      GAME_STATS.breaches += 1;
      s.fx.push({ kind:'boom', x:96, y:e.y, life:.30, max:.30, r:e.r+8 });
      G.log(`${cap(e.kind)} breached! -${Math.floor(dmg)} HP`, 'danger');
      playSfx('impact');
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
      const isBoss = ['warlord','siege','phaselord'].includes(e.kind);
      if (isBoss) { s.bossKills++; GAME_STATS.bosses_killed_run++; G.log(`${cap(e.kind)} destroyed! +${reward} cr`, 'good'); }
      if (s.perks.killChain && s.abilities.orbitalCd > 0) s.abilities.orbitalCd = Math.max(0, s.abilities.orbitalCd - 0.4);
      if (e._elite) s.fx.push({ kind:'boom', x:e.x, y:e.y, life:.45, max:.45, r:e.r+18 });
      s.fx.push({ kind:'boom', x:e.x, y:e.y, life:.28, max:.28, r:e.r+5 });
      playSfx(isBoss ? 'bossDown' : 'enemyDown');
    }
  }
  s.enemies = s.enemies.filter(e => e.hp > 0);
  s.fx.forEach(f => f.life -= dt);
  s.fx = s.fx.filter(f => f.life > 0);

  if (s.baseHp <= 0) { s.baseHp = 0; onGameOver?.(); }
}

// ── Save / Load ───────────────────────────────────────
function saveGame() {
  const s = G.state;
  try {
    localStorage.setItem(CFG.SAVE_KEY, JSON.stringify({
      v: 8,
      selectedDoctrine: s.selectedDoctrine, credits: s.credits, wave: s.wave,
      baseHp: s.baseHp, maxBaseHp: s.maxBaseHp, prestige: s.prestige,
      upgrades: s.upgrades,
      lanes: s.lanes.map(l => ({ gun: l.gun, barricade: l.barricade, medbay: l.medbay, sensor: l.sensor, relay: l.relay })),
      perks: s.perks, orbitalCdFlat: s.mods.orbitalCdFlat ?? 0,
      killsTotal: s.killsTotal, bossKills: s.bossKills, creditsEarned: s.creditsEarned,
      troops: s.troops.map(t => ({ id: t.type.id, lane: t.lane, hp: t.hp, cooldown: t.cooldown, slot: t.slot })),
    }));
  } catch (e) { console.warn('Save failed', e); }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(CFG.SAVE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.v !== 8) return;
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
    Object.assign(s.upgrades, d.upgrades ?? {});
    (d.lanes ?? []).forEach((l, i) => Object.assign(s.lanes[i], l));
    Object.assign(s.perks, d.perks ?? {});
    s._savedOrbitalFlat = d.orbitalCdFlat ?? 0;
    applyDoctrine(); applyUpgrades();
    s.troops = (d.troops ?? []).map(t => createTroop(t.id, t.lane, t.hp, t.cooldown, t.slot));
    G.log('Save loaded.', 'system');
  } catch (e) { console.warn('Load failed', e); }
}

