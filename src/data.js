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
    },
    mods: freshMods(),
    runtime: freshRuntime(),
    currentModifier: 'none',
    lastWaveStats: { credits: 0, baseDamage: 0, lanePressure: [0, 0, 0] },
    abilities: { orbitalCd: 0 },
    _savedOrbitalFlat: 0,
    _firstRunHintShown: false,
    _pausedBeforeMeta: false,   // V8: track pause state before meta screen
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
    modArmored: false, modAir: false,
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
  };
}

function loadMeta() {
  try {
    const raw = localStorage.getItem(CFG.META_KEY);
    return raw ? Object.assign(freshMeta(), JSON.parse(raw)) : freshMeta();
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
  { id:'armored',  name:'Armored Push',       icon:'🛡', css:'threat',      text:'High ratio of shielded and brute enemies.',                  tip:'EW strips shields fast. Grenadiers punish clusters.', apply:s=>{s.runtime.modArmored=true;} },
  { id:'air',      name:'Air Assault',        icon:'✈', css:'threat',      text:'Flyers and Razorwings dominate.',                            tip:'Flyers hit adjacent lanes. Cover all three.', apply:s=>{s.runtime.modAir=true;} },
  { id:'scarcity', name:'Resource Strain',    icon:'📉', css:'threat',      text:'Wave rewards -18%. Enemy count +5.',                         tip:'Tighten spending. Prioritize core upgrades only.', apply:s=>{s.runtime.rewardMult-=0.18; s.runtime.spawnCountAdd+=5;} },
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
  { id:'r_autogun',    tier:2, docSynergy:['artillery'],       docExclusive:null,        name:'Lane Automation',          text:'All lane turrets +1 level.',                             apply:s=>{s.lanes.forEach(l=>l.gun+=1);} },
  { id:'r_overdrive',  tier:2, docSynergy:['blitz'],           docExclusive:null,        name:'Overdrive Protocols',      text:'Fire rate +20% for rest of run.',                        apply:s=>{s.mods.fireRateMult+=0.20;} },
  { id:'r_rally',      tier:2, docSynergy:['fortress'],        docExclusive:null,        name:'Rally Point',              text:'All troops restored to 80% HP.',                         apply:s=>{s.troops.forEach(t=>{t.hp=Math.max(t.hp,t.maxHp*0.80);});} },
  { id:'r_orbital2',   tier:2, docSynergy:['blitz','ew'],      docExclusive:null,        name:'Orbital Overcharge',       text:'Orbital dmg +45, cooldown -4s permanently.',             apply:s=>{s.mods.orbitalDamage+=45; s.mods.orbitalCdFlat=(s.mods.orbitalCdFlat||0)+4;} },
  { id:'r_reinforce',  tier:2, docSynergy:['logistics'],       docExclusive:null,        name:'Forward Deployment',       text:'Free Rifle Squad to every lane.',                        apply:(s,G)=>{[0,1,2].forEach(l=>{if(G.laneTroopCount(l)<G.troopSlots(s.prestige))s.troops.push(G.createTroop('rifle',l));});} },
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

// ── Permanent Unlocks ──────────────────────────────────
const PERMANENT_UNLOCKS = [
  { id:'u_startcr',   rank:1, name:'Veteran Stipend',    desc:'Start every run with +80 cr. Unlocked at Rank 1.' },
  { id:'u_sniper',    rank:2, name:'Sniper Program',      desc:'Sniper Team unit unlocked for deployment.' },
  { id:'u_barricade', rank:2, name:'Reinforced Walls',    desc:'Barricades block +0.5 extra damage per level.' },
  { id:'u_orbital',   rank:3, name:'Satellite Priority',  desc:'Orbital damage +22 permanently.' },
  { id:'u_troop7',    rank:4, name:'Expanded Roster',     desc:'Lane troop cap increased from 6 to 7.' },
  { id:'u_income',    rank:5, name:'Supply Command',      desc:'+10% income from all sources.' },
  { id:'u_wave15',    rank:6, name:'Deep Strike Bonus',   desc:'+30 cr bonus per wave survived past wave 15.' },
  { id:'u_doctrine',  rank:8, name:'Doctrine Refinement', desc:'+5% to all doctrine stat bonuses.' },
];

