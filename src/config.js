// ═══════════════════════════════════════════════════════
//  config.js — legacy engine balance tunables
//  Build 230 Priority A world-art integration.
// ═══════════════════════════════════════════════════════
const LSC_BUILD = '230';

const CFG = Object.freeze({

  // ── Economy ──────────────────────────────────────────
  BASE_CREDITS:            200,
  TROOP_COST_SCALE:        1.13,
  TROOP_COST_MIN:          0.45,
  WAVE_REWARD_BASE:        45,
  WAVE_REWARD_SCALE:       12,
  KILL_REWARDS: Object.freeze({
    conscript:8, breacher:10, juggernaut:22, overwatch:16,
    phalanx:14, warden:160
  }),

  // ── Base ─────────────────────────────────────────────
  BASE_HP:                 100,
  TROOP_SLOTS:             5,

  // ── Spawning ─────────────────────────────────────────
  SPAWN_BASE:              3,
  SPAWN_PER_WAVE:          0.9,
  SPAWN_INTERVAL_BASE:     0.78,
  SPAWN_INTERVAL_MIN:      0.15,
  SPAWN_INTERVAL_SCALE:    0.017,
  BOSS_WAVE_EVERY:         5,
  BOSS_SPAWN_COUNT:        3,

  // ── Combat ───────────────────────────────────────────
  BARRICADE_BLOCK:         3.0,
  BARRICADE_UNLOCK_BONUS:  0.5,
  MEDBAY_HEAL:             2.0,
  MEDBAY_CD:               1.0,
  LANE_GUN_BASE_DMG:       10,
  LANE_GUN_PER_LVL:        5,
  LANE_GUN_BASE_CD:        0.75,
  LANE_GUN_CD_MIN:         0.28,

  // ── Orbital ──────────────────────────────────────────
  ORBITAL_BASE_CD:         22,
  ORBITAL_BASE_DMG:        75,
  ORBITAL_WAVE_DMG:        5,
  ORBITAL_PRESTIGE_DMG:    18,
  ORBITAL_UNLOCK_DMG:      22,

  // ── Progression ──────────────────────────────────────
  PRESTIGE_WAVE_REQ:       25,
  PRESTIGE_GAIN_DIV:       10,
  PRESTIGE_INCOME_BONUS:   0.14,
  PRESTIGE_DMG_BONUS:      0.10,
  PRESTIGE_HP_BONUS:       0.04,
  PRESTIGE_HP_CAP:         0.40,
  UNLOCK_INCOME_BONUS:     0.10,

  // ── Phase Lord ───────────────────────────────────────
  PHASE_LORD_TELEPORT_CD:  13,
  PHASE_LORD_WARN_TIME:    2.2,

  // ── Stalker ──────────────────────────────────────────
  STALKER_CLOAK_DMG_FRAC:  0.28,

  // ── Warlord disruption ───────────────────────────────
  WARLORD_DISRUPT_CD:      6.5,
  WARLORD_DISRUPT_AMT:     1.5,

  // ── Swarm cap ────────────────────────────────────────
  SWARM_EXTRA_CAP:         6,

  // ── Operations XP ────────────────────────────────────
  OPS_XP_KILL:             2,
  OPS_XP_BOSS:            15,
  OPS_XP_WAVE:            25,

  // ── Research Tree ────────────────────────────────────
  RESEARCH_TIMERS:    Object.freeze([0, 15*60, 60*60, 3*60*60, 8*60*60, 24*60*60]),
  MAX_RESEARCH_QUEUE: 3,

  // ── Meta ─────────────────────────────────────────────
  AUTOSAVE_INTERVAL:       8,
  SAVE_KEY:                'ifc_v8_run',
  META_KEY:                'ifc_v8_meta',
});

// ═══════════════════════════════════════════════════════
//  unlocks.js — single source of truth for unlock effects
// ═══════════════════════════════════════════════════════

const UNLOCKS = Object.freeze({
  active:          p => new Set(PERMANENT_UNLOCKS.filter(u => p >= u.rank).map(u => u.id)),
  has:             (p, id) => p >= (PERMANENT_UNLOCKS.find(u => u.id === id)?.rank ?? 99),
  troopSlots:      p => CFG.TROOP_SLOTS,
  startCr: p => CFG.BASE_CREDITS + (UNLOCKS.has(p, 'u_startcr') ? 80 : 0) + (UNLOCKS.has(p, 'u_startcr2') ? 60 : 0) + p * 12,
  orbitalDmgBonus: p => UNLOCKS.has(p, 'u_orbital') ? CFG.ORBITAL_UNLOCK_DMG : 0,
  incomeBonus:     p => UNLOCKS.has(p, 'u_income') ? CFG.UNLOCK_INCOME_BONUS : 0,
  killBonus:       p => UNLOCKS.has(p, 'u_surge') ? 0.08 : 0,
  barricadeBonus:  p => (UNLOCKS.has(p, 'u_barricade') ? CFG.BARRICADE_UNLOCK_BONUS : 0) + (UNLOCKS.has(p, 'u_hardened') ? 0.5 : 0),
  deepStrike:      (p, wave) => UNLOCKS.has(p, 'u_wave15') && wave > 15 ? 30 : 0,
  docBoost:        p => {
    let boost = 1;
    if (UNLOCKS.has(p, 'u_doctrine')) boost *= 1.05;
    if (UNLOCKS.has(p, 'u_mastery'))  boost *= 1.08;
    return boost;
  },
  baseHpBonus:     p => (UNLOCKS.has(p, 'u_iron') ? 25 : 0) + (UNLOCKS.has(p, 'u_hardened') ? 40 : 0),
  troopHpBonus:    p => Math.min(CFG.PRESTIGE_HP_CAP, Math.max(0, p) * CFG.PRESTIGE_HP_BONUS),
});
