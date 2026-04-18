// ═══════════════════════════════════════════════════════
//  state.js — game state factories
// ═══════════════════════════════════════════════════════


function freshState(prestige = 0) {
  return {
    started: false, paused: false, gameOver: false,
    prestige,
    selectedDoctrine: 'blitz',
    selectedLane: 1,
    credits: UNLOCKS.startCr(prestige),
    wave: 1,
    baseHp: CFG.BASE_HP, maxBaseHp: CFG.BASE_HP, baseMaxBase: CFG.BASE_HP,
    waveInProgress: false, enemiesToSpawn: 0, spawnTimer: 0, spawnInterval: 0,
    troops: [], enemies: [], projectiles: [], fx: [],
    time: 0, lastSave: 0,
    killsTotal: 0, bossKills: 0, creditsEarned: 0,
    global: { damage: 1, income: 1, fireRate: 1, heal: 1 },
    upgrades: { weapons: 0, logistics: 0, training: 0, medical: 0, fortify: 0 },
    lanes: [0, 1, 2].map(() => ({
      gun: 0, barricade: 0, medbay: 0, sensor: 0, relay: 0,
      gunCd: 0, medCd: 0,
    })),
    perks: {
      rifleDamage: 0, heavyDamage: 0, medicHeal: 0, grenadeSplash: 0, grenRate: 0,
      ewSlow: 0, ewShield: 0, clearRepair: 0, enemySlow: 0,
      laneDiscount: 0, upgradeDiscount: 0,
      killChain: false, rifleVolley: false, barricadeBoost: 0,
      autoRepair: false, entryJam: false, ewChain: false,
      orbitalDouble: false, orbitalGridFire: false,
      // V44 tree perks
      armorPierce: 0, extendedRange: 0, salvagePct: 0,
      emergencyFund: false, extraQueueSlot: false,
      bossOrbitalReset: false, precisionTracking: false,
      scarcityReduce: false, killChainCap: 0,
      // V48 Operations perks — ops-exclusive fields (never touched by reward pool)
      opsRifleDmg: 0,          // Rifle Corps damage bonus
      rifleFireRate: 0,
      heavyHpBonus: 0,
      heavyDeployCost: 0,
      opsMedicHeal: 0,         // Combat Medic Corps heal bonus
      passiveLaneRegen: 0,
      opsEwSlow: 0,            // EW Division slow bonus
      ewSlowDuration: 0,
      opsGrenSplash: 0,        // Grenadier School splash bonus
      grenFireRate: 0,
      sniperRange: 0,          // sniper-specific range bonus
      sniperArmorPen: 0,       // sniper bonus damage vs armored
      blitzFormation: false,   // rifle+grenadier same lane +20% damage
      fortressFormation: false,// medic+heavy same lane -15% breach damage
      eliteRifleSuppression: false, // rifle kills 15% chance +5 cr
      eliteHeavyShieldBreak: false, // heavy +20% damage vs shielded
      eliteMedicRevive: false,      // medic 10% chance revive KO'd troop at 50% HP
      eliteGrenAirburst: false,     // grenadier splash +15% beyond school
      eliteSniperHeadshot: false,   // sniper 20% chance 2x damage
    },
    mods: freshMods(),
    runtime: freshRuntime(),
    currentModifier: 'none',
    lastWaveStats: { credits: 0, baseDamage: 0, lanePressure: [0, 0, 0] },
    abilities: { orbitalCd: 0 },
    _savedOrbitalFlat: 0,
    _firstRunHintShown: false,
    _pausedBeforeMeta: false,
    researchNodes: {},          // V44: tree node completion state { nodeId: { completedAt, migrated } }
    opsNodes: {},               // V48: Operations node completion state
    xp: 0,                      // V48: Operations XP currency
    _emergencyFundUsed: false,  // V44: emergency requisition one-use flag
    _killChainWaveCD: 0,        // V44: kill chain cap accumulator per wave
    stars: Array.from({ length: 200 }, () => ({
      x: Math.random() * 1600,
      y: Math.random() * 900,
      s: Math.random() * 2 + 0.4,
      phase: Math.random() * Math.PI * 2,
    })),
  };
}

function freshMods() {
  return {
    damageMult: 0, incomeMult: 0, costMult: 0, fireRateMult: 0,
    ewPower: 0, ewShieldStrip: 0, ewDamageMult: 0,
    orbitalCdMult: 0, orbitalCdFlat: 0, orbitalDamage: 0,
    laneGunPower: 0, laneGunRate: 0,
    medicMult: 0, killBonus: 0,
  };
}

function freshRuntime() {
  return {
    modArmored: false, modBreachRush: false,
    rewardMult: 1, spawnCountAdd: 0,
    ewBonus: 0, heavyPenalty: 0,
    spawnSpeedMult: 1, hpMult: 1, swarmMult: 1,
    blitzRifleBoost: false,
    fortressBarricadeBoost: false,
    entryHalfSpeed: false,
    orbitalReset: false,
  };
}

// ═══════════════════════════════════════════════════════
//  meta.js — career persistence
// ═══════════════════════════════════════════════════════

function freshMeta() {
  return {
    prestige: 0, totalRuns: 0, bestWave: 0,
    totalKills: 0, totalBosses: 0, totalCredits: 0,
    docRuns: {}, runHistory: [],
    researchPeak: {},   // V42: tracks highest level ever reached per upgrade
  };
}

function loadMeta() {
  try {
    const raw = localStorage.getItem(CFG.META_KEY);
    if (!raw) return freshMeta();
    const m = Object.assign(freshMeta(), JSON.parse(raw));
    if (!m.researchPeak) m.researchPeak = {};
    return m;
  } catch (_) { return freshMeta(); }
}

function saveMeta(m) {
  try { localStorage.setItem(CFG.META_KEY, JSON.stringify(m)); } catch (_) {}
}

function recordRun(m, s) {
  m.totalRuns++;
  m.bestWave = Math.max(m.bestWave, s.wave);
  m.totalKills += s.killsTotal;
  m.totalBosses += s.bossKills;
  m.totalCredits += s.creditsEarned;
  m.docRuns[s.selectedDoctrine] = (m.docRuns[s.selectedDoctrine] ?? 0) + 1;
  m.runHistory.unshift({ wave: s.wave, doctrine: s.selectedDoctrine, kills: s.killsTotal, rank: s.prestige });
  if (m.runHistory.length > 10) m.runHistory.pop();
}

function docMastery(m, docId) { return m.docRuns[docId] ?? 0; }

// ═══════════════════════════════════════════════════════
//  data.js — all game definitions
//  Doctrines, modifiers, rewards, units, upgrades, unlocks
// ═══════════════════════════════════════════════════════

// ── Doctrines ──────────────────────────────────────────
// Balance notes V8:
//  Blitz:     -30 HP (was -35) + +5% income. Still aggressive but less punishing wave 1.
//  Fortress:  income penalty -12% (was -18%). Late-game scaling was too throttled.
//  Logistics: added -8% fire rate back as soft counterweight.
//  EW:        +8% troop dmg (was +5%). Needed more help in non-shield waves.
//  Artillery: unchanged — barricade+turret start is strong enough.
const DOCTRINES = [
  { id:'blitz', name:'Blitzkrieg', icon:'⚡',
    tagline:'Hit hard, kill fast. Leave no room for error.',
    difficulty:'Aggressive', diffColor:'#d04040',
    effects:['+28% all troop dmg','-30 base HP','Orbital CD -20%','Kills +3 bonus cr','+5% income'],
    synergy:'Rifle / Grenadier / Orbital', weakness:'Thin base — every breach hurts',
    exclusiveRewards:['r_killchain','r_volleys'],
    apply(s){ s.mods.damageMult+=0.28; s.maxBaseHp-=30; s.baseHp=Math.min(s.baseHp,s.maxBaseHp); s.mods.orbitalCdMult-=0.20; s.mods.killBonus=3; s.mods.incomeMult+=0.05; }
  },
  { id:'fortress', name:'Fortress', icon:'🛡',
    tagline:'The line does not break.',
    difficulty:'Defensive', diffColor:'#3ab0d5',
    effects:['+50 base HP','Barricade Lv1 all lanes','+25% medic heal','-12% income'],
    synergy:'Medic / Barricade / Medbay', weakness:'Tight economy — prioritize carefully',
    exclusiveRewards:['r_ironwall','r_citadel'],
    apply(s){ s.maxBaseHp+=50; s.baseHp+=50; s.lanes.forEach(l=>l.barricade+=1); s.mods.medicMult+=0.25; s.mods.incomeMult-=0.12; }
  },
  { id:'logistics', name:'Logistics Corps', icon:'⚙',
    tagline:'Outbuild the enemy. Supply wins wars.',
    difficulty:'Economic', diffColor:'#2db858',
    effects:['+80 starting cr','Troops 22% cheaper','+18% income','-8% fire rate'],
    synergy:'Global upgrades / Lane infrastructure', weakness:'Slower early pressure response',
    exclusiveRewards:['r_windfall','r_oversupply'],
    apply(s){ s.credits+=80; s.mods.costMult-=0.22; s.mods.incomeMult+=0.18; s.mods.fireRateMult-=0.08; }
  },
  { id:'ew', name:'EW Superiority', icon:'📡',
    tagline:'Jam. Slow. Strip. Control is the weapon.',
    difficulty:'Technical', diffColor:'#8855e8',
    effects:['EW slow +65%','Shield strip +90%','Orbital CD -25%','+35% EW dmg','+8% troop dmg'],
    synergy:'EW Specialist / Ion Storm / Shielded enemies', weakness:'Low raw damage — unshielded waves require support',
    exclusiveRewards:['r_jamfield','r_disruptnet'],
    apply(s){ s.mods.ewPower+=0.65; s.mods.ewShieldStrip+=0.90; s.mods.orbitalCdMult-=0.25; s.mods.ewDamageMult+=0.35; s.mods.damageMult+=0.08; }
  },
  { id:'artillery', name:'Artillery Network', icon:'🎯',
    tagline:'Infrastructure is firepower.',
    difficulty:'Strategic', diffColor:'#d4a028',
    effects:['Orbital dmg +40','Turrets +55%','Turret rate +18%','Barricade Lv1 all lanes','Troops rate -10%'],
    synergy:'Lane Turrets / Orbital / Sensor Array', weakness:'Slow ramp — fragile before turrets online',
    exclusiveRewards:['r_overcharge','r_gridfire'],
    apply(s){ s.mods.orbitalDamage+=40; s.mods.laneGunPower+=0.55; s.mods.laneGunRate+=0.18; s.lanes.forEach(l=>l.barricade+=1); s.mods.fireRateMult-=0.10; }
  },
];

// ── Wave Modifiers ─────────────────────────────────────
const WAVE_MODIFIERS = [
  { id:'none',     name:'Standard',          icon:'—',  css:'standard',    text:'No special conditions this wave.',                           tip:'', apply:()=>{} },
  { id:'armored',  name:'Armored Push',       icon:'🛡', css:'threat',      text:'High ratio of phalanx and juggernaut enemies.',                  tip:'EW strips shields fast. Grenadiers punish clusters.', apply:s=>{s.runtime.modArmored=true;} },
  { id:'air',      name:'Breach Rush',        icon:'💨', css:'threat',      text:'High ratio of fast breacher units.',                            tip:'Deploy snipers and keep barricades upgraded.', apply:s=>{s.runtime.modBreachRush=true;} },
  { id:'scarcity', name:'Resource Strain',    icon:'📉', css:'threat',      text:'Wave rewards -18%. Enemy count +5.',                         tip:'Tighten spending. Prioritize core upgrades only.', apply:s=>{const pen=s.perks&&s.perks.scarcityReduce?0.40:1.0; s.runtime.rewardMult-=0.18*pen; s.runtime.spawnCountAdd+=5;} },
  { id:'storm',    name:'Ion Storm',          icon:'⚡', css:'electrical',  text:'EW amplified +45%. Heavy teams penalized -15%.',             tip:'EW Superiority thrives here. Deploy EW Specialists.', apply:s=>{s.runtime.ewBonus+=0.45; s.runtime.heavyPenalty+=0.15;} },
  { id:'surge',    name:'Surge Protocol',     icon:'🔴', css:'threat',      text:'Enemies spawn 35% faster.',                                  tip:'Barricades and turrets become critical.', apply:s=>{s.runtime.spawnSpeedMult=1.35;} },
  { id:'salvage',  name:'Salvage Wave',       icon:'💰', css:'opportunity', text:'Kill rewards +30%. Fewer enemies this wave.',                tip:'Invest aggressively — this wave funds the next.', apply:s=>{s.runtime.rewardMult+=0.30; s.runtime.spawnCountAdd-=3;} },
  { id:'darkness', name:'Blackout Protocol',  icon:'🌑', css:'threat',      text:'Enemy HP +28%. Spawn rate -22%.',                            tip:'High-damage units essential. Heavy teams shine here.', apply:s=>{s.runtime.hpMult=1.28; s.runtime.spawnSpeedMult=0.78;} },
  { id:'swarm',    name:'Swarm Wave',         icon:'🐝', css:'threat',      text:`Enemy count +${CFG.SWARM_EXTRA_CAP}. Smaller, faster units.`, tip:'Grenadier AoE and Orbital are ideal counters.', apply:s=>{s.runtime.spawnCountAdd+=CFG.SWARM_EXTRA_CAP; s.runtime.swarmMult=0.72;} },
];

// ── Reward Pool ────────────────────────────────────────
// Note: r_reinforce uses GAME.createTroop — resolved at call time, not import time.
const REWARD_POOL = [
  // Tier 1 — common
  { id:'r_rifle',      tier:1, docSynergy:['blitz'],           docExclusive:null,        name:'Veteran Rifle Squads',     text:'Rifle damage +25%.',                                     apply:s=>{s.perks.rifleDamage+=0.25;} },
  { id:'r_heavy',      tier:1, docSynergy:['blitz'],           docExclusive:null,        name:'Armor Breakers',           text:'Heavy team damage +30%.',                                apply:s=>{s.perks.heavyDamage+=0.30;} },
  { id:'r_medic',      tier:1, docSynergy:['fortress'],        docExclusive:null,        name:'Forward Aid Stations',     text:'Medic heal +40%. +8 HP on wave clear.',                  apply:s=>{s.perks.medicHeal+=0.40; s.perks.clearRepair+=8;} },
  { id:'r_gren',       tier:1, docSynergy:['blitz'],           docExclusive:null,        name:'Frag Stockpile',           text:'Grenadier splash +28%, fire rate +10%.',                  apply:s=>{s.perks.grenadeSplash+=0.28; s.perks.grenRate+=0.10;} },
  { id:'r_ew',         tier:1, docSynergy:['ew'],              docExclusive:null,        name:'Signal Overmatch',         text:'EW slow +40%, shield strip +45%.',                       apply:s=>{s.perks.ewSlow+=0.40; s.perks.ewShield+=0.45;} },
  { id:'r_economy',    tier:1, docSynergy:['logistics'],       docExclusive:null,        name:'Supply Windfall',          text:'+120 credits, +10% future income.',                      apply:s=>{s.credits+=120; s.mods.incomeMult+=0.10;} },
  { id:'r_fortify',    tier:1, docSynergy:['fortress'],        docExclusive:null,        name:'Emergency Fortification',  text:'+30 max HP, restore 22 HP.',                             apply:s=>{s.maxBaseHp+=30; s.baseHp=Math.min(s.maxBaseHp,s.baseHp+22);} },
  { id:'r_intel',      tier:1, docSynergy:[],                  docExclusive:null,        name:'Combat Intel',             text:'All enemy speeds -8%.',                                  apply:s=>{s.perks.enemySlow+=0.08;} },
  // Tier 2 — uncommon
  { id:'r_autogun',    tier:2, docSynergy:['artillery'],       docExclusive:null,        name:'Forward Supply Cache',     text:'+180 credits, +12% wave clear income.',                  apply:s=>{s.credits+=180; s.mods.incomeMult+=0.12;} },
  { id:'r_overdrive',  tier:2, docSynergy:['blitz'],           docExclusive:null,        name:'Overdrive Protocols',      text:'Fire rate +20% for rest of run.',                        apply:s=>{s.mods.fireRateMult+=0.20;} },
  { id:'r_rally',      tier:2, docSynergy:['fortress'],        docExclusive:null,        name:'Rally Point',              text:'All troops restored to 80% HP.',                         apply:s=>{s.troops.forEach(t=>{t.hp=Math.max(t.hp,t.maxHp*0.80);});} },
  { id:'r_orbital2',   tier:2, docSynergy:['blitz','ew'],      docExclusive:null,        name:'Orbital Overcharge',       text:'Orbital dmg +45, cooldown -4s permanently.',             apply:s=>{s.mods.orbitalDamage+=45; s.mods.orbitalCdFlat=(s.mods.orbitalCdFlat||0)+4;} },
  { id:'r_reinforce',  tier:2, docSynergy:['logistics'],       docExclusive:null,        name:'Forward Deployment',       text:'Free Rifle Squad to each lane with open slots. +60 cr if all lanes full.',  apply:(s,G)=>{let deployed=0;const cap=G.troopSlots(s.prestige);[0,1,2].forEach(l=>{if(G.laneTroopCount(l)<cap){s.troops.push(G.createTroop('rifle',l));deployed++;}});if(deployed===0)s.credits+=60;} },
  // Tier 3 — rare
  { id:'r_overhaul',   tier:3, docSynergy:['fortress'],        docExclusive:null,        name:'Base Overhaul',            text:'+55 max HP, +40 HP restored, barricades all +1.',        apply:s=>{s.maxBaseHp+=55; s.baseHp=Math.min(s.maxBaseHp,s.baseHp+40); s.lanes.forEach(l=>l.barricade+=1);} },
  { id:'r_annihilate', tier:3, docSynergy:['blitz'],           docExclusive:null,        name:'Annihilation Protocol',    text:'Orbital fires twice per strike.',                        apply:s=>{s.perks.orbitalDouble=true;} },
  { id:'r_blacksite',  tier:3, docSynergy:['artillery','logistics'], docExclusive:null,  name:'Black Site Infrastructure',text:'All lane upgrade costs -25%.',                           apply:s=>{s.perks.laneDiscount=(s.perks.laneDiscount||0)+0.25;} },
  // Doctrine exclusives
  { id:'r_killchain',  tier:2, docSynergy:['blitz'],           docExclusive:'blitz',     name:'Kill Chain',               text:'Each kill reduces Orbital CD by 0.4s.',                  apply:s=>{s.perks.killChain=true;} },
  { id:'r_volleys',    tier:2, docSynergy:['blitz'],           docExclusive:'blitz',     name:'Volley Fire',              text:'Rifle Squads fire 2 shots per attack.',                  apply:s=>{s.perks.rifleVolley=true;} },
  { id:'r_ironwall',   tier:2, docSynergy:['fortress'],        docExclusive:'fortress',  name:'Iron Wall',                text:'Barricades block 60% more damage.',                      apply:s=>{s.perks.barricadeBoost=(s.perks.barricadeBoost||0)+0.60;} },
  { id:'r_citadel',    tier:3, docSynergy:['fortress'],        docExclusive:'fortress',  name:'Citadel Mode',             text:'Base auto-repairs 1 HP/sec during waves.',               apply:s=>{s.perks.autoRepair=true;} },
  { id:'r_windfall',   tier:2, docSynergy:['logistics'],       docExclusive:'logistics', name:'Logistics Windfall',       text:'Wave clear rewards +35%.',                               apply:s=>{s.mods.incomeMult+=0.35;} },
  { id:'r_oversupply', tier:3, docSynergy:['logistics'],       docExclusive:'logistics', name:'Oversupply',               text:'All upgrade costs -20%.',                                apply:s=>{s.perks.upgradeDiscount=(s.perks.upgradeDiscount||0)+0.20;} },
  { id:'r_jamfield',   tier:2, docSynergy:['ew'],              docExclusive:'ew',        name:'Jam Field',                text:'All enemies enter slowed for 1.5s.',                     apply:s=>{s.perks.entryJam=true;} },
  { id:'r_disruptnet', tier:3, docSynergy:['ew'],              docExclusive:'ew',        name:'Disruption Network',       text:'EW chains slow to 2 nearby enemies.',                    apply:s=>{s.perks.ewChain=true;} },
  { id:'r_overcharge', tier:2, docSynergy:['artillery'],       docExclusive:'artillery', name:'Turret Overcharge',        text:'Turrets fire 40% faster, +20% dmg.',                     apply:s=>{s.mods.laneGunRate+=0.40; s.mods.laneGunPower+=0.20;} },
  { id:'r_gridfire',   tier:3, docSynergy:['artillery'],       docExclusive:'artillery', name:'Grid Fire Protocol',       text:'Orbital hits selected lane 3× harder.',                  apply:s=>{s.perks.orbitalGridFire=true;} },
];

// ── Units ──────────────────────────────────────────────
const UNIT_DEFS = [
  { id:'rifle',    name:'Rifle Squad',   cost:30,  hp:38, damage:9,  range:200, fireRate:0.78, color:'#5ab8e0', desc:'Reliable infantry. Scales well with Calibration upgrades.' },
  { id:'heavy',    name:'Heavy Team',    cost:88,  hp:58, damage:27, range:188, fireRate:1.45, color:'#e0b830', desc:'High single-target damage. Best against bosses and Brutes.' },
  { id:'medic',    name:'Combat Medic',  cost:72,  hp:28, damage:0,  range:145, fireRate:1.30, color:'#30c050', desc:'Heals allies and base. Best in Mid (Sustain) lane.' },
  { id:'ew',       name:'EW Specialist', cost:96,  hp:26, damage:7,  range:240, fireRate:0.95, color:'#9860e8', desc:'Slows enemies, strips shields, reveals Stalkers. Best in Top (Control) lane.' },
  { id:'grenadier',name:'Grenadier',     cost:108, hp:34, damage:18, range:178, fireRate:1.50, color:'#e08030', desc:'Area splash damage. Best in Bot (Strike) lane when enemies cluster.' },
  { id:'sniper',   name:'Sniper Team',   cost:118, hp:28, damage:46, range:320, fireRate:1.90, color:'#d8e050', desc:'Extreme range and strong damage. Slow fire rate. Rank 2 unlock required.' },
];

// ── Global Upgrades ────────────────────────────────────
const UPGRADE_DEFS = [
  { id:'weapons',   name:'Weapon Calibration', baseCost:90,  scale:1.65, desc:'+20% troop damage per level.',   apply:s=>s.global.damage  =1+s.upgrades.weapons  *0.20 },
  { id:'logistics', name:'Logistics Network',  baseCost:108, scale:1.70, desc:'+22% credit income per level.',  apply:s=>s.global.income  =1+s.upgrades.logistics*0.22 },
  { id:'training',  name:'Fire Discipline',    baseCost:100, scale:1.68, desc:'+15% fire rate per level.',      apply:s=>s.global.fireRate=1+s.upgrades.training *0.15 },
  { id:'medical',   name:'Field Triage',       baseCost:88,  scale:1.62, desc:'+30% all healing per level.',    apply:s=>s.global.heal    =1+s.upgrades.medical  *0.30 },
  { id:'fortify',   name:'Fortify Base',       baseCost:128, scale:1.78, desc:'+20 max base HP per level.',     apply:s=>s.maxBaseHp=s.baseMaxBase+s.upgrades.fortify*20 },
];

// ── Lane Upgrades ──────────────────────────────────────
const LANE_UPGRADE_DEFS = [
  { id:'gun',       name:'Lane Turret',   baseCost:75,  scale:1.58, desc:'Auto-fires at the leading enemy in this lane.' },
  { id:'barricade', name:'Barricade',     baseCost:65,  scale:1.52, desc:'Reduces breach damage by 3.0 per level.' },
  { id:'medbay',    name:'Med Station',   baseCost:82,  scale:1.58, desc:'Heals lane troops passively. Best in Mid lane.' },
  { id:'sensor',    name:'Sensor Array',  baseCost:90,  scale:1.62, desc:'Enemies slow 10% on entry per level. Best in Top lane.' },
  { id:'relay',     name:'Fire Relay',    baseCost:102, scale:1.65, desc:'Troops +10% fire rate per level. Best in Bot lane.' },
];

// ── Research Departments (V44) ─────────────────────────
// Each department groups related upgrades into a tree.
// docSynergy: doctrines that unlock a deeper branch in this dept.
const RESEARCH_DEPARTMENTS = [
  {
    id: 'logistics',
    name: 'Logistics',
    icon: '⚙',
    color: '#2db858',
    desc: 'Supply chain, income, and credit efficiency.',
    docSynergy: ['logistics'],
    upgrades: ['logistics'],          // global UPGRADE_DEFS ids
    laneUpgrades: [],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    icon: '🏗',
    color: '#d4a028',
    desc: 'Lane infrastructure and defensive structures.',
    docSynergy: ['fortress', 'artillery'],
    upgrades: ['medical', 'fortify'],
    laneUpgrades: ['gun', 'barricade', 'medbay', 'sensor', 'relay'],
  },
  {
    id: 'command',
    name: 'Command',
    icon: '📡',
    color: '#3ab0d5',
    desc: 'Weapons, fire discipline, and orbital systems.',
    docSynergy: ['blitz', 'ew'],
    upgrades: ['weapons', 'training'],
    laneUpgrades: [],
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: '🎖',
    color: '#8855e8',
    desc: 'Unit training and field doctrine. Coming soon.',
    docSynergy: [],
    upgrades: [],
    laneUpgrades: [],
    locked: true,   // V44: stub — fully implemented in V45
  },
];

// ── Permanent Unlocks ──────────────────────────────────
const PERMANENT_UNLOCKS = [
  { id:'u_startcr',   rank:1,  name:'Veteran Stipend',    desc:'Start every run with +80 cr.' },
  { id:'u_sniper',    rank:2,  name:'Sniper Program',      desc:'Sniper Team unit unlocked for deployment.' },
  { id:'u_barricade', rank:2,  name:'Reinforced Walls',    desc:'Barricades block +0.5 extra damage per level.' },
  { id:'u_orbital',   rank:3,  name:'Satellite Priority',  desc:'Orbital damage +22 permanently.' },
  { id:'u_troop7',    rank:4,  name:'Expanded Roster',     desc:'Lane troop cap: 5 per lane.' },
  { id:'u_income',    rank:5,  name:'Supply Command',      desc:'+10% income from all sources.' },
  { id:'u_wave15',    rank:6,  name:'Deep Strike Bonus',   desc:'+30 cr bonus per wave survived past wave 15.' },
  { id:'u_doctrine',  rank:8,  name:'Doctrine Refinement', desc:'+5% to all doctrine stat bonuses.' },
  // V81: new unlocks for ranks 10–24
  { id:'u_iron',      rank:10, name:'Iron Reserves',       desc:'Base starts every run with +25 max HP.' },
  { id:'u_surge',     rank:12, name:'Combat Surge',        desc:'Kill rewards permanently +8%.' },
  { id:'u_veteran',   rank:15, name:'Veteran\'s Edge',     desc:'All troops start each run with +20% max HP.' },
  { id:'u_startcr2',  rank:18, name:'Strategic Reserves',  desc:'Start every run with an additional +60 cr.' },
  { id:'u_mastery',   rank:20, name:'Command Mastery',     desc:'+8% to all doctrine stat bonuses (stacks with R8).' },
  { id:'u_hardened',  rank:24, name:'Hardened Command',    desc:'Base max HP +40. Barricades block +0.5 more per level.' },
];


// ── Research Tree Nodes (V44) ──────────────────────────
// Each node belongs to a department and tier.
// type:'upgrade'    → calls buyUpgrade(upgradeId) — maps to existing s.upgrades path
// type:'lane'       → calls buyLaneUpgrade(laneId) — increments all 3 lanes
// type:'mod'        → applyMod(s) re-applied every applyUpgrades() call
// type:'perk'       → applyPerk(s) sets s.perks field, re-applied every applyUpgrades()
// Migration: nodes matching existing save state are inferred complete on load.
const TREE_NODES = [

  // ════════════ LOGISTICS ════════════════════════════════

  { id:'log_t1_supply', dept:'logistics', tier:1, cost:80, timerLevel:1,
    name:'Supply Routes', effect:'+18% wave clear rewards',
    desc:'Forward supply lines increase income from cleared waves.',
    type:'mod', applyMod: s => { s.mods.incomeMult += 0.18; } },

  { id:'log_t1_procurement', dept:'logistics', tier:1, cost:80, timerLevel:1,
    name:'Field Procurement', effect:'Troops cost 10% less',
    desc:'Streamlined requisition reduces deployment costs across all units.',
    type:'mod', applyMod: s => { s.mods.costMult -= 0.10; } },

  { id:'log_t2_bounties', dept:'logistics', tier:2, cost:160, timerLevel:2,
    name:'Kill Bounties', effect:'+3 cr per enemy kill',
    desc:'Field commanders earn bonus credits for each confirmed elimination.',
    type:'mod', applyMod: s => { s.mods.killBonus += 3; } },

  { id:'log_t2_scarcity', dept:'logistics', tier:2, cost:160, timerLevel:2,
    name:'Scarcity Protocols', effect:'Resource Strain wave penalty -40%',
    desc:'Pre-positioned reserves soften the impact of supply shortage waves.',
    type:'perk', applyPerk: s => { s.perks.scarcityReduce = true; } },

  { id:'log_t3_network', dept:'logistics', tier:3, cost:280, timerLevel:3,
    name:'Logistics Network', effect:'+22% income from all sources',
    desc:'A fully operational network maximizes credit flow from all activities.',
    type:'upgrade', upgradeId:'logistics' },

  { id:'log_t3_salvage', dept:'logistics', tier:3, cost:280, timerLevel:3,
    name:'Salvage Operations', effect:'Recover 25% credits when a troop is lost',
    desc:'Field teams recover equipment from fallen units.',
    type:'perk', applyPerk: s => { s.perks.salvagePct = 0.25; } },

  { id:'log_t4_emergency', dept:'logistics', tier:4, cost:420, timerLevel:4,
    name:'Emergency Requisition', effect:'Auto-grants 400cr once when base HP < 25%',
    desc:'Emergency funding activates when the base is critically damaged.',
    type:'perk', applyPerk: s => { s.perks.emergencyFund = true; } },

  { id:'log_t4_contracts', dept:'logistics', tier:4, cost:420, timerLevel:4,
    name:'Veteran Contracts', effect:'+2% income per prestige rank (max +20%)',
    desc:'Long-term service contracts scale efficiency with experience.',
    type:'mod', applyMod: s => { s.mods.incomeMult += Math.min((s.prestige||0)*0.02, 0.20); } },

  { id:'log_t5_doctrine', dept:'logistics', tier:5, cost:680, timerLevel:5,
    name:'Total Supply Doctrine', effect:'+20% wave rewards · +5 kill bonus · +1 queue slot',
    desc:'Total war logistics activates all supply systems simultaneously.',
    type:'mod',
    applyMod:  s => { s.mods.incomeMult += 0.20; s.mods.killBonus += 5; },
    applyPerk: s => { s.perks.extraQueueSlot = true; } },

  // ════════════ ENGINEERING ══════════════════════════════

  { id:'eng_t1_earthworks', dept:'engineering', tier:1, cost:90, timerLevel:1,
    name:'Earthworks', effect:'Barricades unlocked — All Lanes Lv1',
    desc:'Field fortifications reduce breach damage in all lanes.',
    type:'lane', laneUpgradeId:'barricade' },

  { id:'eng_t1_sentry', dept:'engineering', tier:1, cost:90, timerLevel:1,
    name:'Sentry Posts', effect:'Lane Turrets unlocked — All Lanes Lv1',
    desc:'Automated sentry guns engage the leading enemy in each lane.',
    type:'lane', laneUpgradeId:'gun' },

  { id:'eng_t2_walls', dept:'engineering', tier:2, cost:185, timerLevel:2,
    name:'Reinforced Walls', effect:'Barricades block 35% more damage',
    desc:'Upgraded materials increase barricade effectiveness across all lanes.',
    type:'perk', applyPerk: s => { s.perks.barricadeBoost = (s.perks.barricadeBoost||0) + 0.35; } },

  { id:'eng_t2_calibration', dept:'engineering', tier:2, cost:185, timerLevel:2,
    name:'Turret Calibration', effect:'Lane Turrets fire 22% faster',
    desc:'Precision targeting systems improve turret fire rate across all lanes.',
    type:'mod', applyMod: s => { s.mods.laneGunRate += 0.22; } },

  { id:'eng_t2_aid', dept:'engineering', tier:2, cost:185, timerLevel:2,
    name:'Aid Station', effect:'Med Stations unlocked — All Lanes Lv1',
    desc:'Forward medical stations passively heal troops in each lane.',
    type:'lane', laneUpgradeId:'medbay' },

  { id:'eng_t3_sensor', dept:'engineering', tier:3, cost:310, timerLevel:3,
    name:'Sensor Net', effect:'Sensor Arrays unlocked — All Lanes Lv1',
    desc:'Sensor networks slow enemy entry speed in all lanes.',
    type:'lane', laneUpgradeId:'sensor' },

  { id:'eng_t3_medexpand', dept:'engineering', tier:3, cost:310, timerLevel:3,
    name:'Med Station Expansion', effect:'Med Station healing +40%',
    desc:'Expanded medical facilities significantly increase healing output.',
    type:'mod', applyMod: s => { s.mods.medicMult += 0.40; } },

  { id:'eng_t3_hardened', dept:'engineering', tier:3, cost:310, timerLevel:3,
    name:'Hardened Emplacements', effect:'Lane Turrets deal 20% more damage · +5 HP repair per wave clear',
    desc:'Reinforced turret mounts maintain firing effectiveness and improve structural resilience.',
    type:'mod',
    applyMod:  s => { s.mods.laneGunPower += 0.20; },
    applyPerk: s => { s.perks.clearRepair = (s.perks.clearRepair || 0) + 5; } },

  { id:'eng_t4_relay', dept:'engineering', tier:4, cost:450, timerLevel:4,
    name:'Fire Relay Network', effect:'Fire Relays unlocked — All Lanes Lv1',
    desc:'Communication relays improve troop fire rate in all lanes.',
    type:'lane', laneUpgradeId:'relay' },

  { id:'eng_t4_fortress', dept:'engineering', tier:4, cost:450, timerLevel:4,
    name:'Fortress Walls', effect:'+35 max base HP · Barricades gain +3 bonus damage reduction',
    desc:'Fortress-grade construction strengthens the base and all barricade structures.',
    type:'upgrade', upgradeId:'fortify',
    applyPerk: s => { s.perks.barricadeBoost = (s.perks.barricadeBoost||0) + 0.15; } },

  { id:'eng_t5_protocol', dept:'engineering', tier:5, cost:750, timerLevel:5,
    name:'Total Fortification', effect:'All lane structure effects +25%',
    desc:'Maximum fortification enhances all lane infrastructure simultaneously.',
    type:'mod',
    applyMod:  s => { s.mods.laneGunPower += 0.25; s.mods.laneGunRate += 0.10; s.mods.medicMult += 0.25; },
    applyPerk: s => { s.perks.barricadeBoost = (s.perks.barricadeBoost||0) + 0.25; } },

  // ════════════ COMMAND ══════════════════════════════════

  { id:'cmd_t1_weapons', dept:'command', tier:1, cost:100, timerLevel:1,
    name:'Weapon Calibration', effect:'+20% troop damage',
    desc:'Standard calibration protocols improve accuracy and damage output.',
    type:'upgrade', upgradeId:'weapons' },

  { id:'cmd_t1_training', dept:'command', tier:1, cost:100, timerLevel:1,
    name:'Fire Discipline', effect:'+15% troop fire rate',
    desc:'Disciplined fire control improves engagement tempo across all units.',
    type:'upgrade', upgradeId:'training' },

  { id:'cmd_t2_piercing', dept:'command', tier:2, cost:200, timerLevel:2,
    name:'Armor Piercing', effect:'+30% damage vs armored and shielded enemies',
    desc:'Specialized munitions tear through enemy armor and shield systems.',
    type:'perk', applyPerk: s => { s.perks.armorPierce = 0.30; } },

  { id:'cmd_t2_targeting', dept:'command', tier:2, cost:200, timerLevel:2,
    name:'Target Acquisition', effect:'Troop effective range +15%',
    desc:'Advanced optics allow troops to engage enemies at greater distances.',
    type:'perk', applyPerk: s => { s.perks.extendedRange = 0.15; } },

  { id:'cmd_t3_orbital', dept:'command', tier:3, cost:340, timerLevel:3,
    name:'Orbital Designation', effect:'Orbital damage +55 · cooldown -5s',
    desc:'Dedicated targeting dramatically increases orbital strike effectiveness.',
    type:'mod', applyMod: s => { s.mods.orbitalDamage += 55; s.mods.orbitalCdFlat = (s.mods.orbitalCdFlat||0) + 5; } },

  { id:'cmd_t3_rapidfire', dept:'command', tier:3, cost:340, timerLevel:3,
    name:'Rapid Fire Protocols', effect:'+12% fire rate (additive)',
    desc:'Sustained fire protocols improve tempo without sacrificing accuracy.',
    type:'mod', applyMod: s => { s.mods.fireRateMult += 0.12; } },

  { id:'cmd_t3_killchain', dept:'command', tier:3, cost:340, timerLevel:3,
    name:'Kill Chain', effect:'Each kill reduces Orbital CD by 0.5s (max 3s per wave)',
    desc:'Confirmed kills relay to orbital command for accelerated recharge.',
    type:'perk', applyPerk: s => { s.perks.killChain = true; s.perks.killChainCap = 3.0; } },

  { id:'cmd_t4_precision', dept:'command', tier:4, cost:500, timerLevel:4,
    name:'Precision Targeting', effect:'Projectiles track fast enemies 20% better',
    desc:'Advanced fire control reduces missed shots on high-speed targets.',
    type:'perk', applyPerk: s => { s.perks.precisionTracking = true; } },

  { id:'cmd_t4_grid', dept:'command', tier:4, cost:500, timerLevel:4,
    name:'Orbital Grid', effect:'Orbital hits selected lane at 2x intensity',
    desc:'Grid targeting focuses orbital fire on the active lane.',
    type:'perk', applyPerk: s => { s.perks.orbitalGridFire = true; } },

  { id:'cmd_t5_supremacy', dept:'command', tier:5, cost:800, timerLevel:5,
    name:'Combat Supremacy', effect:'+20% damage · +10% fire rate · Orbital resets on boss kill',
    desc:'Total combat supremacy activates all Command systems simultaneously.',
    type:'mod',
    applyMod:  s => { s.mods.damageMult += 0.20; s.mods.fireRateMult += 0.10; },
    applyPerk: s => { s.perks.bossOrbitalReset = true; } },

  // ════════════ OPERATIONS (locked — V45) ════════════════

  { id:'ops_t1_rifle',    dept:'operations', tier:1, locked:true, cost:0, timerLevel:1,
    name:'Rifle Corps',           effect:'Rifle Squad damage and HP +20%',
    desc:'Global training program improves all Rifle Squad units.' },
  { id:'ops_t1_heavy',    dept:'operations', tier:1, locked:true, cost:0, timerLevel:1,
    name:'Heavy Weapons Program', effect:'Heavy Team damage +20%',
    desc:'Specialized heavy weapons training program.' },
  { id:'ops_t2_medic',    dept:'operations', tier:2, locked:true, cost:0, timerLevel:2,
    name:'Combat Medic Corps',    effect:'Medic heal +35%, suppresses nearby enemies',
    desc:'Advanced medical field training program.' },
  { id:'ops_t2_ew',       dept:'operations', tier:2, locked:true, cost:0, timerLevel:2,
    name:'EW Division',           effect:'EW slow +50%, auto-reveals cloaked units',
    desc:'Electronic warfare specialization program.' },
  { id:'ops_t3_gren',     dept:'operations', tier:3, locked:true, cost:0, timerLevel:3,
    name:'Grenadier School',      effect:'Grenadier splash +40%, cluster munitions',
    desc:'Advanced explosive ordnance training.' },
  { id:'ops_t3_sniper',   dept:'operations', tier:3, locked:true, cost:0, timerLevel:3,
    name:'Sniper Designation',    effect:'Sniper range +25%, penetrates elite enemies',
    desc:'Long-range precision fire training.' },
  { id:'ops_t4_blitz',    dept:'operations', tier:4, locked:true, cost:0, timerLevel:4,
    name:'Blitz Formation',       effect:'Rifle + Grenadier in same lane +20% damage',
    desc:'Combined arms doctrine for aggressive formations.' },
  { id:'ops_t4_fortress', dept:'operations', tier:4, locked:true, cost:0, timerLevel:4,
    name:'Fortress Formation',    effect:'Medic + Heavy reduce breach damage 15%',
    desc:'Defensive doctrine for sustained engagements.' },
  { id:'ops_t5_elite',    dept:'operations', tier:5, locked:true, cost:0, timerLevel:5,
    name:'Special Operations',    effect:'All unit classes gain unique passive ability',
    desc:'Elite force designation unlocks class-specific passive abilities.' },
];

// ── Operations Nodes (V48) ─────────────────────────────
// All purchases are instant XP spends. No timers.
// Rifle Corps is auto-unlocked at game start (cost 0, auto: true).
const OPS_NODES = [

  // ── TIER 1 — ENLISTMENT ────────────────────────────
  {
    id: 'ops_t1_rifle', tier: 1, auto: true, cost: 0,
    name: 'Rifle Corps',
    desc: 'Infantry training baseline. Standard rifle units authorized.',
    effects: ['+10% rifle damage', 'Fire rate +8%'],
    applyPerk: s => { s.perks.opsRifleDmg += 0.10; s.perks.rifleFireRate += 0.08; },
  },
  {
    id: 'ops_t1_heavy', tier: 1, auto: false, cost: 60,
    name: 'Heavy Weapons Program',
    desc: 'Authorize heavy weapons deployment and training protocols.',
    effects: ['+15% Heavy Team max HP', 'Deploy cost -5%'],
    applyPerk: s => { s.perks.heavyHpBonus += 0.15; s.perks.heavyDeployCost -= 0.05; },
  },

  // ── TIER 2 — SPECIALIZATION ────────────────────────
  {
    id: 'ops_t2_medic', tier: 2, auto: false, cost: 150,
    name: 'Combat Medic Corps',
    desc: 'Field medicine doctrine. Injured units recover between engagements.',
    effects: ['Medic heal +35%', 'Troops passively recover 1 HP/s in clear lanes'],
    applyPerk: s => { s.perks.opsMedicHeal += 0.35; s.perks.passiveLaneRegen = 1.0; },
  },
  {
    id: 'ops_t2_ew', tier: 2, auto: false, cost: 150,
    name: 'EW Division',
    desc: 'Electronic warfare authorization. Enhanced slow and disruption protocols.',
    effects: ['EW slow strength +40%', 'EW slow duration +50%'],
    applyPerk: s => { s.perks.opsEwSlow += 0.40; s.perks.ewSlowDuration += 0.50; },
  },

  // ── TIER 3 — ELITE TRAINING ────────────────────────
  {
    id: 'ops_t3_gren', tier: 3, auto: false, cost: 260,
    name: 'Grenadier School',
    desc: 'Advanced explosive ordnance training. Grenadier class unlocked.',
    effects: ['Grenadier splash +40%', 'Fire rate +15%'],
    applyPerk: s => { s.perks.opsGrenSplash += 0.40; s.perks.grenFireRate += 0.15; },
  },
  {
    id: 'ops_t3_sniper', tier: 3, auto: false, cost: 260,
    name: 'Sniper Designation',
    desc: 'Long-range marksman certification. Sniper class unlocked.',
    effects: ['Sniper range +25%', '+30% damage vs armored enemies'],
    applyPerk: s => { s.perks.sniperRange += 0.25; s.perks.sniperArmorPen += 0.30; },
  },

  // ── TIER 4 — DOCTRINE FORMATIONS ──────────────────
  {
    id: 'ops_t4_blitz', tier: 4, auto: false, cost: 400,
    name: 'Blitz Formation',
    desc: 'Rifle and Grenadier in the same lane operate as a coordinated strike team.',
    effects: ['Rifle + Grenadier same lane: +20% damage'],
    applyPerk: s => { s.perks.blitzFormation = true; },
  },
  {
    id: 'ops_t4_fortress', tier: 4, auto: false, cost: 400,
    name: 'Fortress Formation',
    desc: 'Medic and Heavy in the same lane form a resilient defensive anchor.',
    effects: ['Medic + Heavy same lane: breach damage -15%'],
    applyPerk: s => { s.perks.fortressFormation = true; },
  },

  // ── TIER 5 — SPECIAL OPERATIONS ───────────────────
  {
    id: 'ops_t5_elite', tier: 5, auto: false, cost: 600,
    name: 'Elite Force',
    desc: 'Each unit class gains a unique passive ability tied to its combat role.',
    effects: [
      'Rifle: kills grant +5 cr (15% chance)',
      'Heavy: +20% damage vs shielded enemies',
      'Medic: 10% chance to revive a KO\'d lane troop at 50% HP',
      'EW: slow chains to 1 nearby enemy',
      'Grenadier: splash +15% bonus',
      'Sniper: 20% headshot chance (2× damage)',
    ],
    applyPerk: s => {
      s.perks.eliteRifleSuppression = true;
      s.perks.eliteHeavyShieldBreak = true;
      s.perks.eliteMedicRevive      = true;
      s.perks.ewChain               = true;
      s.perks.eliteGrenAirburst     = true;
      s.perks.eliteSniperHeadshot   = true;
    },
  },
];
