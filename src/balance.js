// ═══════════════════════════════════════════════════════
//  balance.js — Build 183 v1.0 command-mode balance
//  Pure functions are shared by the game and build-time validation.
// ═══════════════════════════════════════════════════════
(function (root, factory) {
  var api = factory();
  if (root) root.LSCBalance = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? (globalThis.window || globalThis) : this, function () {
  'use strict';

  var VERSION = 183;
  var LOG_TWO = Math.LN2;
  var ENERGY = Object.freeze({
    schema: 176,
    max: 10,
    rechargeMs: 45 * 60 * 1000,
    maxSpend: 5,
    creditMultipliers: Object.freeze([1, 1.75, 2.40, 2.95, 3.45])
  });
  var ECONOMY = Object.freeze({
    startingCredits: 500,
    startingParts: 12,
    campaignCreditBase: 275,
    campaignCreditsPerKill: 3,
    campaignPhaseCredits: 10,
    campaignLateCredits: 60,
    campaignBaseParts: 3,
    campaignMilestoneEvery: 5,
    campaignMilestoneParts: 1
  });
  var OPERATIONS = Object.freeze({
    containmentBaseCredits: 220,
    containmentCreditsPerLevel: 2,
    containmentLogCredits: 72,
    junkyardBaseCredits: 300,
    junkyardCreditsPerLevel: 3,
    junkyardLogCredits: 84,
    junkyardSeconds: 70,
    junkyardBaseHealth: 4200
  });

  var OPENING_PHASES = Object.freeze({
    1: Object.freeze({targets:Object.freeze([9,12,15]),hp:.72,damage:.52,bossHp:300,bossDamage:11,barricadeHp:58}),
    2: Object.freeze({targets:Object.freeze([11,15,20]),hp:.82,damage:.65,bossHp:400,bossDamage:14,barricadeHp:60}),
    3: Object.freeze({targets:Object.freeze([13,18,24]),hp:.90,damage:.72,bossHp:520,bossDamage:17,barricadeHp:62}),
    4: Object.freeze({targets:Object.freeze([15,21,28]),hp:1.03,damage:.88,bossHp:700,bossDamage:21,barricadeHp:64}),
    5: Object.freeze({targets:Object.freeze([17,24,32]),hp:1.15,damage:1,bossHp:850,bossDamage:24,barricadeHp:66}),
    6: Object.freeze({targets:Object.freeze([20,28,37]),hp:1.30,damage:1.12,bossHp:1050,bossDamage:28,barricadeHp:68})
  });

  function positiveInteger(value, fallback, maximum) {
    var result = Math.max(1, Math.floor(Number(value) || fallback || 1));
    return maximum ? Math.min(maximum, result) : result;
  }

  function logTwo(value) {
    return Math.log(Math.max(1, Number(value) || 1)) / LOG_TWO;
  }

  function clonePhase(profile) {
    return {
      targets: profile.targets.slice(),
      hp: profile.hp,
      damage: profile.damage,
      bossHp: profile.bossHp,
      bossDamage: profile.bossDamage,
      barricadeHp: profile.barricadeHp
    };
  }

  function phaseBalance(phase) {
    phase = positiveInteger(phase, 1);
    if (OPENING_PHASES[phase]) return clonePhase(OPENING_PHASES[phase]);

    // Phases 7–30 retain the accepted opening curve's pressure while moving a
    // little of the growth from contact count into durability. After Phase 30,
    // every value grows logarithmically so endgame sessions remain bounded.
    if (phase <= 30) {
      var extra = phase - 6;
      return {
        targets: [
          20 + Math.round(extra * 1.50),
          28 + Math.round(extra * 2.25),
          37 + Math.round(extra * 3.00)
        ],
        hp: 1.30 + extra * .11,
        damage: 1.12 + extra * .09,
        bossHp: 1050 + extra * 140,
        bossDamage: 28 + extra * 2.4,
        barricadeHp: 68 + extra * 6
      };
    }

    var late = phase - 30;
    var lateDepth = logTwo(1 + late / 10);
    return {
      targets: [56 + Math.floor(lateDepth * 3), 82 + Math.floor(lateDepth * 4), 109 + Math.floor(lateDepth * 5)],
      hp: 3.94 + lateDepth * .32,
      damage: 3.28 + lateDepth * .24,
      bossHp: Math.floor(4410 + lateDepth * 750),
      bossDamage: 85.6 + lateDepth * 12,
      barricadeHp: Math.floor(212 + lateDepth * 30)
    };
  }

  function recommendedPower(phase) {
    phase = positiveInteger(phase, 1);
    if (phase <= 30) return 300 + phase * 40;
    return Math.round((1500 + logTwo(1 + (phase - 30) / 10) * 170) / 5) * 5;
  }

  function campaignPhaseCreditBonus(phase) {
    phase = positiveInteger(phase, 1);
    var opening = Math.min(29, phase - 1) * ECONOMY.campaignPhaseCredits;
    var late = phase > 30 ? Math.floor(logTwo(1 + (phase - 30) / 10) * ECONOMY.campaignLateCredits) : 0;
    return opening + late;
  }

  function campaignBaseCredits(phase, kills) {
    kills = Math.max(0, Math.floor(Number(kills) || 0));
    return ECONOMY.campaignCreditBase + kills * ECONOMY.campaignCreditsPerKill + campaignPhaseCreditBonus(phase);
  }

  function energyMultiplier(spend) {
    spend = Math.max(1, Math.min(ENERGY.maxSpend, Math.floor(Number(spend) || 1)));
    return ENERGY.creditMultipliers[spend - 1] || 1;
  }

  function campaignVictoryCredits(phase, kills, spend) {
    return Math.floor(campaignBaseCredits(phase, kills) * energyMultiplier(spend));
  }

  function campaignParts(phase, firstClear) {
    phase = positiveInteger(phase, 1);
    var milestone = firstClear && phase % ECONOMY.campaignMilestoneEvery === 0 ? ECONOMY.campaignMilestoneParts : 0;
    return ECONOMY.campaignBaseParts + milestone;
  }

  function campaignSalvageCredits(phase, kills) {
    phase = positiveInteger(phase, 1);
    kills = Math.max(0, Math.floor(Number(kills) || 0));
    return Math.min(260, 100 + phase * 20 + Math.floor(kills * 1.5));
  }

  function containmentDifficulty(level) {
    level = positiveInteger(level, 1, 9999);
    var depth = logTwo(level);
    var veteranDepth = Math.sqrt(level - 1);
    var targetBonus = Math.min(8, Math.floor(depth));
    return {
      health: .74 * (1 + depth * .10 + veteranDepth * .025),
      damage: .58 * (1 + depth * .07 + veteranDepth * .018),
      bossHealth: Math.floor(480 * (1 + depth * .15 + veteranDepth * .04) + Math.min(level - 1, 120) * 4),
      bossDamage: 13 * (1 + depth * .08 + veteranDepth * .018),
      barricadeHp: 68 + Math.min(24, Math.floor(depth) * 2),
      targetBonus: targetBonus
    };
  }

  function containmentTargets(level) {
    var bonus = containmentDifficulty(level).targetBonus;
    return [10 + bonus, 14 + bonus * 2, 18 + bonus * 3];
  }

  function containmentBalance(level) {
    var curve = containmentDifficulty(level);
    return {
      targets: containmentTargets(level),
      hp: curve.health,
      damage: curve.damage,
      bossHp: curve.bossHealth,
      bossDamage: curve.bossDamage,
      barricadeHp: curve.barricadeHp
    };
  }

  function junkyardVehicleHealth(level) {
    level = positiveInteger(level, 1, 9999);
    var depth = logTwo(level);
    return Math.floor(OPERATIONS.junkyardBaseHealth * (1 + depth * .13) + Math.min(level - 1, 60) * 34 + (level - 1) * 8);
  }

  function operationCredits(kind, level) {
    level = positiveInteger(level, 1, 9999);
    var depth = logTwo(level);
    if (kind === 'junkyard') return OPERATIONS.junkyardBaseCredits + (level - 1) * OPERATIONS.junkyardCreditsPerLevel + Math.floor(depth * OPERATIONS.junkyardLogCredits);
    return OPERATIONS.containmentBaseCredits + (level - 1) * OPERATIONS.containmentCreditsPerLevel + Math.floor(depth * OPERATIONS.containmentLogCredits);
  }

  function operationParts(kind, level) {
    level = positiveInteger(level, 1, 9999);
    if (kind === 'junkyard') return 0;
    return Math.min(3, 1 + Math.floor(logTwo(level) / 3));
  }

  function operationRecommendedPower(kind, level) {
    level = positiveInteger(level, 1, 9999);
    if (kind === 'junkyard') {
      var armorPressure = junkyardVehicleHealth(level) / Math.max(1, junkyardVehicleHealth(1));
      return Math.max(320, Math.round(320 * Math.pow(armorPressure, .88) / 5) * 5);
    }
    var curve = containmentDifficulty(level);
    var pressure = curve.health / .74 * .32 + curve.damage / .58 * .23 + curve.bossHealth / 480 * .30 + curve.bossDamage / 13 * .15;
    return Math.max(300, Math.round(300 * Math.pow(pressure, .82) / 5) * 5);
  }

  function performanceBudget(signals) {
    signals = signals || {};
    var cores = Math.max(1, Number(signals.cores) || 4);
    var memory = Math.max(0, Number(signals.memory) || 0);
    var reducedMotion = !!signals.reducedMotion;
    var tier = reducedMotion || cores <= 2 || (memory > 0 && memory <= 2) ? 'low' : cores <= 4 || (memory > 0 && memory <= 4) ? 'medium' : 'high';
    if (tier === 'low') return Object.freeze({tier:tier,particleCap:36,corpseCap:2,hudIntervalMs:100,effectPoolCap:36,maxPixelRatio:1,minPixelRatio:.85,shadowMapSize:512,shadows:false,adaptiveSampleFrames:120});
    if (tier === 'medium') return Object.freeze({tier:tier,particleCap:54,corpseCap:3,hudIntervalMs:84,effectPoolCap:54,maxPixelRatio:1.30,minPixelRatio:1,shadowMapSize:768,shadows:true,adaptiveSampleFrames:120});
    return Object.freeze({tier:tier,particleCap:72,corpseCap:3,hudIntervalMs:67,effectPoolCap:72,maxPixelRatio:1.50,minPixelRatio:1.15,shadowMapSize:1024,shadows:true,adaptiveSampleFrames:120});
  }

  return Object.freeze({
    version: VERSION,
    ENERGY: ENERGY,
    ECONOMY: ECONOMY,
    OPERATIONS: OPERATIONS,
    phaseBalance: phaseBalance,
    recommendedPower: recommendedPower,
    campaignBaseCredits: campaignBaseCredits,
    campaignVictoryCredits: campaignVictoryCredits,
    campaignParts: campaignParts,
    campaignSalvageCredits: campaignSalvageCredits,
    energyMultiplier: energyMultiplier,
    containmentDifficulty: containmentDifficulty,
    containmentTargets: containmentTargets,
    containmentBalance: containmentBalance,
    junkyardVehicleHealth: junkyardVehicleHealth,
    operationCredits: operationCredits,
    operationParts: operationParts,
    operationRecommendedPower: operationRecommendedPower,
    performanceBudget: performanceBudget
  });
});
