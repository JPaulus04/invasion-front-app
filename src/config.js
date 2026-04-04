// ═══════════════════════════════════════════════════════
//  config.js — all balance tunables
//  Edit here. Nowhere else.
// ═══════════════════════════════════════════════════════
const CFG = Object.freeze({

  // ── Economy ──────────────────────────────────────────
  BASE_CREDITS:            100,
  TROOP_COST_SCALE:        1.13,   // each extra copy of same unit costs more
  TROOP_COST_MIN:          0.45,   // floor as fraction of base cost
  WAVE_REWARD_BASE:        45,     // tightened economy — fewer freebie credits
  WAVE_REWARD_SCALE:       12,
  KILL_REWARDS: Object.freeze({
    runner:7,  grunt:10, shield:13, brute:22,   // reduced — credits should feel earned
    flyer:14,  stalker:15,                       // stalker still rewards patience
    razorwing:11, warlord:120, siege:145, phaselord:160
  }),

  // ── Base ─────────────────────────────────────────────
  BASE_HP:                 100,
  TROOP_SLOTS:             5,

  // ── Spawning ─────────────────────────────────────────
  SPAWN_BASE:              9,      // V8: -1, waves 1-4 slightly lighter
  SPAWN_PER_WAVE:          2.8,    // V8: -0.1, gentler growth curve
  SPAWN_INTERVAL_BASE:     0.78,   // V8: slightly slower early spawns
  SPAWN_INTERVAL_MIN:      0.15,
  SPAWN_INTERVAL_SCALE:    0.017,
  BOSS_WAVE_EVERY:         5,
  BOSS_SPAWN_COUNT:        3,      // V8: +1 boss spawn (2 felt thin vs regular waves)

  // ── Combat ───────────────────────────────────────────
  BARRICADE_BLOCK:         3.0,    // V8: 2.8→3.0, slightly more value per level
  BARRICADE_UNLOCK_BONUS:  0.5,
  MEDBAY_HEAL:             2.0,    // V8: 1.9→2.0
  MEDBAY_CD:               1.0,    // V8: 1.1→1.0, slightly more responsive
  LANE_GUN_BASE_DMG:       10,     // V8: 9→10
  LANE_GUN_PER_LVL:        5,
  LANE_GUN_BASE_CD:        0.75,
  LANE_GUN_CD_MIN:         0.28,

  // ── Orbital ──────────────────────────────────────────
  ORBITAL_BASE_CD:         22,
  ORBITAL_BASE_DMG:        75,     // V8: 72→75
  ORBITAL_WAVE_DMG:        5,
  ORBITAL_PRESTIGE_DMG:    18,
  ORBITAL_UNLOCK_DMG:      22,

  // ── Progression ──────────────────────────────────────
  PRESTIGE_WAVE_REQ:       20,
  PRESTIGE_GAIN_DIV:       10,  // ranks gained = floor(wave / 10)
  PRESTIGE_INCOME_BONUS:   0.14,
  PRESTIGE_DMG_BONUS:      0.10,
  PRESTIGE_HP_BONUS:       0.15,  // +15% troop max HP per rank
  UNLOCK_INCOME_BONUS:     0.10,

  // ── Phase Lord ───────────────────────────────────────
  PHASE_LORD_TELEPORT_CD:  13,     // V8: 12→13, a touch more breathing room
  PHASE_LORD_WARN_TIME:    2.2,

  // ── Stalker ──────────────────────────────────────────
  STALKER_CLOAK_DMG_FRAC:  0.28,   // fraction of damage that lands while cloaked

  // ── Warlord disruption ───────────────────────────────
  WARLORD_DISRUPT_CD:      6.5,    // V8: 5→6.5s (less oppressive in double-boss waves)
  WARLORD_DISRUPT_AMT:     1.5,    // V8: 1.8→1.5s cooldown added to disrupted troop

  // ── Swarm cap ────────────────────────────────────────
  SWARM_EXTRA_CAP:         6,      // V8: swarm adds max 6 enemies (was uncapped +8)

  // ── Meta ─────────────────────────────────────────────
  AUTOSAVE_INTERVAL:       8,
  SAVE_KEY:                'ifc_v8_run',
  META_KEY:                'ifc_v8_meta',
});

// ═══════════════════════════════════════════════════════
//  unlocks.js — single source of truth for unlock effects
//  All unlock resolution flows through here.
// ═══════════════════════════════════════════════════════


const UNLOCKS = Object.freeze({
  active:          p => new Set(PERMANENT_UNLOCKS.filter(u => p >= u.rank).map(u => u.id)),
  has:             (p, id) => p >= (PERMANENT_UNLOCKS.find(u => u.id === id)?.rank ?? 99),
  troopSlots:      p => UNLOCKS.has(p, 'u_troop7') ? 6 : CFG.TROOP_SLOTS,
  startCr:         p => CFG.BASE_CREDITS + (UNLOCKS.has(p, 'u_startcr') ? 80 : 0),
  orbitalDmgBonus: p => UNLOCKS.has(p, 'u_orbital') ? CFG.ORBITAL_UNLOCK_DMG : 0,
  incomeBonus:     p => UNLOCKS.has(p, 'u_income') ? CFG.UNLOCK_INCOME_BONUS : 0,
  barricadeBonus:  p => UNLOCKS.has(p, 'u_barricade') ? CFG.BARRICADE_UNLOCK_BONUS : 0,
  deepStrike:      (p, wave) => UNLOCKS.has(p, 'u_wave15') && wave > 15 ? 30 : 0,
  docBoost:        p => UNLOCKS.has(p, 'u_doctrine') ? 1.05 : 1,
});

