// ═══════════════════════════════════════════════════════
//  balance.js — Build 186 campaign resistance and milestone balance
//  Pure functions are shared by the game and build-time validation.
// ═══════════════════════════════════════════════════════
(function (root, factory) {
  var api = factory();
  if (root) root.LSCBalance = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? (globalThis.window || globalThis) : this, function () {
  'use strict';

  var VERSION = 186;
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
    4: Object.freeze({targets:Object.freeze([15,21,28]),hp:1.10,damage:.96,bossHp:1050,bossDamage:24,barricadeHp:64}),
    5: Object.freeze({targets:Object.freeze([18,25,34]),hp:1.28,damage:1.12,bossHp:3200,bossDamage:31,barricadeHp:66}),
    6: Object.freeze({targets:Object.freeze([20,29,39]),hp:1.48,damage:1.30,bossHp:3300,bossDamage:35,barricadeHp:68})
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

    // Contact counts stay capped for mobile performance. Resistance compounds
    // through durability, damage and boss pressure instead. Campaign barriers
    // no longer gain free health with phase depth: defensive progression now
    // comes from Headquarters, Research and equipped rigs.
    var depth = phase - 6;
    var milestone = phase % 5 === 0;
    var veteranDepth = Math.min(14, depth);
    var lateDepth = Math.max(0, depth - 14);
    var hp = 1.48 * Math.pow(1.105, veteranDepth) * Math.pow(1.085, lateDepth);
    var damage = 1.30 * Math.pow(1.078, veteranDepth) * Math.pow(1.065, lateDepth);
    var bossHp = 3300 * Math.pow(1.13, veteranDepth) * Math.pow(1.105, lateDepth);
    var bossDamage = 35 * Math.pow(1.085, veteranDepth) * Math.pow(1.07, lateDepth);
    return {
      targets: [
        Math.min(60, 20 + Math.round(depth * 1.45)),
        Math.min(86, 29 + Math.round(depth * 2.05)),
        Math.min(112, 39 + Math.round(depth * 2.70))
      ],
      hp: hp,
      damage: damage,
      bossHp: Math.floor(bossHp * (milestone ? 1.35 : 1)),
      bossDamage: bossDamage * (milestone ? 1.15 : 1),
      barricadeHp: 68
    };
  }

  function recommendedPower(phase) {
    phase = positiveInteger(phase, 1);
    var opening = [0,300,340,390,450,500,570];
    if (phase <= 6) return opening[phase];
    var depth = phase - 6;
    var power = 570 * Math.pow(1.09, Math.min(14, depth)) * Math.pow(1.075, Math.max(0, depth - 14));
    if (phase % 5 === 0) power *= 1.04;
    return Math.round(power / 5) * 5;
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
