// Build 183 — v1.0 economy, difficulty, energy, reward, and performance balance.
(function () {
  'use strict';
  if (window.__LSC_COMMAND_BASE_145__) return;
  window.__LSC_COMMAND_BASE_145__ = true;

  var oldUpdate = _patchedUpdate;
  var oldDraw = drawVertical;
  var canvas = document.getElementById('battlefield');
  var ctx = canvas && canvas.getContext('2d');
  var run = null;
  var TAU = Math.PI * 2;
  var LANE_COUNT = 8;
  var BOSS_LANE_INDEX = 6;
  // Two coordinated positions per side. These fixed points replace the oval
  // from Build 161 while preserving eight independent damage/pathing lanes.
  var COMPOUND_LANES = [
    {x:-1.55,y:-5.05,rotation:0,side:'north'},
    {x: 1.55,y:-5.05,rotation:0,side:'north'},
    {x: 3.15,y:-2.40,rotation:Math.PI/2,side:'east'},
    {x: 3.15,y: 2.40,rotation:Math.PI/2,side:'east'},
    {x: 1.55,y: 5.05,rotation:0,side:'south'},
    {x:-1.55,y: 5.05,rotation:0,side:'south'},
    {x:-3.15,y: 2.40,rotation:Math.PI/2,side:'west'},
    {x:-3.15,y:-2.40,rotation:Math.PI/2,side:'west'}
  ];
  // Daily Operations reuse the same combat simulation but replace the radial
  // fortress routes with three readable approach lanes. Zombies always enter
  // from the far end of the containment road and press toward Holt's line.
  var OPERATION_LANES = [
    {x:-2.15,y:-5.10,rotation:0,side:'forward'},
    {x: 0.00,y:-5.35,rotation:0,side:'forward'},
    {x: 2.15,y:-5.10,rotation:0,side:'forward'}
  ];
  // Junkyard Recovery is an intercept, not a defensive lane battle. The
  // armored transport follows this authored convoy route while Holt and the
  // main turret fire from a separate salvage-yard position.
  var JUNKYARD_VEHICLE_PATH = {
    start:{x:3.55,y:-7.35},
    end:{x:-2.95,y:5.75}
  };
  var BARRICADE_WORLD_RADIUS = 6.4;
  var BARRICADE_STOP_WORLD_RADIUS = 7.8;
  // Enemies attack the HQ from outside its authored footprint. The boss uses a
  // larger stand-off because its visual model is intentionally broader.
  var HQ_ATTACK_WORLD_RADIUS = 6.75;
  var BOSS_HQ_STOP_WORLD_RADIUS = 8.55;
  // Holt must cover every authored campaign barricade, including the two
  // southern positions. The approach-depth gate below prevents spawn fire.
  var COMMANDER_COMPOUND_RANGE_WORLD = 7.65;
  var COMMANDER_APPROACH_DEPTH_WORLD = 1;
  // The forward camera makes the normal campaign boss stand-off read too far
  // up-lane. Preserve its larger footprint with a smaller operation-only gap.
  var OPERATION_BOSS_PADDING_WORLD = .2;
  var OPERATION_BOSS_HQ_STOP_WORLD_RADIUS = 7.65;
  var QUEUE_START_WORLD_RADIUS = 8.75;
  var QUEUE_GAP_WORLD_RADIUS = .9;
  var SPAWN_WORLD_RADIUS = 9.9;
  var ENEMY_ATTACK_CYCLE = 1.05;
  var combatAtlas = new Image();
  combatAtlas.src = 'assets/visual144/combat-atlas.png';
  var animationAtlas = new Image();
  animationAtlas.src = 'assets/unit-animation-atlas.png';
  var META_KEY = 'lsc_command_base_137'; // Preserve Build 137 progression.
  var soundTimes = {};
  var hapticTimes = {};
  var activeResearchBranch = 'fire-control';
  var selectedResearchNodeId = null;
  var activeInventoryFilter = 'all';
  var selectedInventoryUid = null;
  var selectedCampaignEnergy = 1;
  var operationNotice = null;
  var activeCommandTab = 'campaign';
  var operationsReturnState = {tab:'campaign',scrollTop:0};
  var storeReturnState = {tab:'campaign',scrollTop:0};
  var RESEARCH_SCHEMA = 166;
  var EQUIPMENT_SCHEMA = 167;
  var COMMANDER_SCHEMA = 168;
  var BALANCE = window.LSCBalance;
  var ENERGY_SCHEMA = BALANCE.ENERGY.schema;
  var ENERGY_MAX = BALANCE.ENERGY.max;
  var ENERGY_RECHARGE_MS = BALANCE.ENERGY.rechargeMs;
  var CAMPAIGN_MAX_ENERGY_SPEND = BALANCE.ENERGY.maxSpend;
  var CAMPAIGN_CREDIT_MULTIPLIERS = BALANCE.ENERGY.creditMultipliers;
  var PERFORMANCE_BUDGET = BALANCE.performanceBudget({
    cores:navigator.hardwareConcurrency,
    memory:navigator.deviceMemory,
    reducedMotion:!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  });
  var OPERATION_SCHEMA = 182;
  // Build-scoped QA access deliberately expires as soon as LSC_BUILD changes.
  // It never mutates the stored energy reserve or duplicates daily resources.
  var QA_TEST_ACCESS = typeof LSC_BUILD !== 'undefined' && String(LSC_BUILD) === '183';
  // This is only a damaged-save guard, not a designed progression ceiling.
  var OPERATION_LEVEL_GUARD = 9999;
  var COMMANDER_MAX_LEVEL = 20;
  var INVENTORY_CAPACITY = 24;
  var HQ_TIER_NAMES = ['FIELD COMMAND POST','REINFORCED COMPOUND','FORTIFIED HEADQUARTERS','ARMORED CITADEL','COMMAND FORTRESS'];
  var COMMANDER_TIER_NAMES = ['FIELD READY','FORTIFIED','VETERAN','ELITE','LAST STAND'];
  var COMMANDER_TIER_LEVELS = [1,5,10,15,20];
  var RESEARCH_BRANCHES = [
    {id:'fire-control',short:'ATTACK',name:'ATTACK',description:'Attack power, fire rate, range, and boss damage.'},
    {id:'fortifications',short:'DEFENSE',name:'DEFENSE',description:'HQ health, barrier health, armor, and repairs.'},
    {id:'combat-support',short:'SUPPORT',name:'SUPPORT',description:'Artillery power, cooldown, and field experience.'}
  ];
  var RESEARCH_NODES = [
    // FIRE CONTROL — existing Build 165 IDs retain their purchases and power.
    {id:'fc-calibration',branch:'fire-control',tier:1,name:'Attack Power',effectText:'Attack power +15%.',cost:{credits:250,parts:3},power:30,effects:{turretDamage:.15}},
    {id:'fc-servos',branch:'fire-control',tier:2,name:'Fire Rate',effectText:'Fire rate +12%.',requires:['fc-calibration'],cost:{credits:400,parts:5},power:40,effects:{turretRate:.12}},
    {id:'fc-optics',branch:'fire-control',tier:2,name:'Range',effectText:'Range +12%.',requires:['fc-calibration'],cost:{credits:400,parts:5},power:55,effects:{turretRange:.12}},
    {id:'fc-cooling',branch:'fire-control',tier:3,name:'Fire Rate II',effectText:'Fire rate +10%.',requires:['fc-servos'],cost:{credits:600,parts:7},power:55,effects:{turretRate:.10}},
    {id:'fc-tracking',branch:'fire-control',tier:3,name:'Armor Damage',effectText:'Armor damage +30%.',requires:['fc-optics'],cost:{credits:600,parts:7},power:55,effects:{turretArmoredDamage:.30}},
    {id:'fc-siege',branch:'fire-control',tier:4,name:'Boss Damage',effectText:'Boss damage +35%.',requires:['fc-cooling'],cost:{credits:850,parts:10},power:75,effects:{turretBossDamage:.35}},
    {id:'fc-penetrators',branch:'fire-control',tier:4,name:'Attack Power II',effectText:'Attack power +18%.',requires:['fc-tracking'],cost:{credits:850,parts:10},power:75,effects:{turretDamage:.18}},
    {id:'fc-hunter-killer',branch:'fire-control',tier:5,name:'Target Priority',effectText:'Priority targeting; boss and armor damage +20%.',requires:['fc-siege','fc-penetrators'],cost:{credits:1200,parts:14},power:100,capstone:true,effects:{turretPriority:1,turretBossDamage:.20,turretArmoredDamage:.20}},

    // FORTIFICATIONS
    {id:'fort-perimeter',branch:'fortifications',tier:1,name:'Barrier Health',effectText:'Barrier health +20.',cost:{credits:250,parts:3},power:30,effects:{barrierHp:20}},
    {id:'fort-command',branch:'fortifications',tier:2,name:'HQ Health',effectText:'HQ health +100.',requires:['fort-perimeter'],cost:{credits:400,parts:5},power:40,effects:{hqHp:100}},
    {id:'fort-baffles',branch:'fortifications',tier:2,name:'Barrier Health II',effectText:'Barrier health +25.',requires:['fort-perimeter'],cost:{credits:400,parts:5},power:40,effects:{barrierHp:25}},
    {id:'fort-repair',branch:'fortifications',tier:3,name:'Field Repairs',effectText:'Repair HQ +35 and barriers +24 each assault.',requires:['fort-command'],cost:{credits:600,parts:7},power:55,effects:{assaultHqRepair:35,assaultBarrierRepair:24}},
    {id:'fort-reactive',branch:'fortifications',tier:3,name:'Barrier Armor',effectText:'Barrier damage -8%.',requires:['fort-baffles'],cost:{credits:600,parts:7},power:55,effects:{barrierDamageReduction:.08}},
    {id:'fort-grid',branch:'fortifications',tier:4,name:'Fortress Armor',effectText:'HQ and barrier damage -15%.',requires:['fort-repair'],cost:{credits:850,parts:10},power:75,effects:{hqDamageReduction:.15,barrierDamageReduction:.15}},
    {id:'fort-bulkheads',branch:'fortifications',tier:4,name:'Emergency Armor',effectText:'Low-health damage -20%.',requires:['fort-reactive'],cost:{credits:850,parts:10},power:75,effects:{hqEmergencyReduction:.20}},
    {id:'fort-reconstruction',branch:'fortifications',tier:5,name:'Reconstruction',effectText:'Rebuild a barrier at 45%; repair HQ +20.',requires:['fort-grid','fort-bulkheads'],cost:{credits:1200,parts:14},power:100,capstone:true,effects:{rebuildBarrierFraction:.45,assaultHqRepair:20}},

    // COMBAT SUPPORT
    {id:'sup-shells',branch:'combat-support',tier:1,name:'Artillery Power',effectText:'Artillery power +25.',cost:{credits:250,parts:3},power:30,effects:{artilleryDamage:25}},
    {id:'sup-relay',branch:'combat-support',tier:2,name:'Cooldown',effectText:'Cooldown -3 seconds.',requires:['sup-shells'],cost:{credits:400,parts:5},power:40,effects:{artilleryCooldown:3}},
    {id:'sup-telemetry',branch:'combat-support',tier:2,name:'Field XP',effectText:'Field XP +10%.',requires:['sup-shells'],cost:{credits:400,parts:5},power:40,effects:{fieldXp:.10}},
    {id:'sup-targeting',branch:'combat-support',tier:3,name:'Artillery Power II',effectText:'Artillery power +20.',requires:['sup-relay'],cost:{credits:600,parts:7},power:55,effects:{artilleryDamage:20}},
    {id:'sup-intel',branch:'combat-support',tier:3,name:'Field XP II',effectText:'Field XP +15%.',requires:['sup-telemetry'],cost:{credits:600,parts:7},power:55,effects:{fieldXp:.15}},
    {id:'sup-barrage',branch:'combat-support',tier:4,name:'Artillery Boost',effectText:'Artillery power +35%.',requires:['sup-targeting'],cost:{credits:850,parts:10},power:75,effects:{artilleryMultiplier:.35}},
    {id:'sup-kill-chain',branch:'combat-support',tier:4,name:'Kill Cooldown',effectText:'Cooldown -0.35 seconds per kill.',requires:['sup-intel'],cost:{credits:850,parts:10},power:75,effects:{artilleryKillCooldown:.35}},
    {id:'sup-network',branch:'combat-support',tier:5,name:'Battle Network',effectText:'Artillery ready each assault; +1 promotion choice.',requires:['sup-barrage','sup-kill-chain'],cost:{credits:1200,parts:14},power:100,capstone:true,effects:{assaultArtilleryReady:1,promotionChoiceBonus:1}}
  ];
  var EQUIPMENT_SLOTS = [
    {id:'weapon',label:'PRIMARY WEAPON',short:'WEAPON',description:'Commander damage, fire rate, and boss pressure.'},
    {id:'rig',label:'COMMAND RIG',short:'RIG',description:'Headquarters and perimeter protection.'},
    {id:'module',label:'TACTICAL MODULE',short:'MODULE',description:'Main-turret and artillery coordination.'}
  ];
  var EQUIPMENT_CATALOG = [
    {id:'weapon-service-rifle',slot:'weapon',rarity:'common',minPhase:1,name:'Service Rifle Mk II',effectText:'Commander damage +10%.',power:18,effects:{commanderDamage:.10}},
    {id:'weapon-cycling-kit',slot:'weapon',rarity:'common',minPhase:3,name:'Rapid-Cycle Carbine',effectText:'Commander fire rate +9%.',power:20,effects:{commanderRate:.09}},
    {id:'weapon-stabilized-carbine',slot:'weapon',rarity:'epic',minPhase:5,name:'Stabilized Carbine',effectText:'Commander damage +16% and fire rate +8%.',power:42,effects:{commanderDamage:.16,commanderRate:.08}},
    {id:'weapon-siege-rifle',slot:'weapon',rarity:'epic',minPhase:8,name:'Siege Rifle',effectText:'Commander damage +18%; boss damage +22%.',power:48,effects:{commanderDamage:.18,commanderBossDamage:.22}},
    {id:'weapon-last-word',slot:'weapon',rarity:'legendary',minPhase:10,name:'Last Word',effectText:'Commander damage +28%, fire rate +15%, and boss damage +25%.',power:72,effects:{commanderDamage:.28,commanderRate:.15,commanderBossDamage:.25}},

    {id:'rig-field-plates',slot:'rig',rarity:'common',minPhase:1,name:'Field Armor Plates',effectText:'Headquarters capacity +50.',power:18,effects:{hqHp:50}},
    {id:'rig-perimeter-braces',slot:'rig',rarity:'common',minPhase:3,name:'Perimeter Braces',effectText:'Every barrier gains 12 maximum health.',power:20,effects:{barrierHp:12}},
    {id:'rig-repair-harness',slot:'rig',rarity:'epic',minPhase:5,name:'Repair Crew Harness',effectText:'HQ capacity +75; repair HQ 15 between assaults.',power:42,effects:{hqHp:75,assaultHqRepair:15}},
    {id:'rig-bastion-frame',slot:'rig',rarity:'epic',minPhase:8,name:'Bastion Frame',effectText:'Barrier capacity +20; barrier damage taken -5%.',power:48,effects:{barrierHp:20,barrierDamageReduction:.05}},
    {id:'rig-citadel-aegis',slot:'rig',rarity:'legendary',minPhase:10,name:'Citadel Aegis',effectText:'HQ capacity +125, barrier capacity +25, and HQ damage taken -8%.',power:72,effects:{hqHp:125,barrierHp:25,hqDamageReduction:.08}},

    {id:'module-turret-link',slot:'module',rarity:'common',minPhase:1,name:'Turret Data Link',effectText:'Main-turret damage +8%.',power:18,effects:{turretDamage:.08}},
    {id:'module-fire-mission',slot:'module',rarity:'common',minPhase:3,name:'Fire Mission Board',effectText:'Artillery damage +15.',power:20,effects:{artilleryDamage:15}},
    {id:'module-combat-telemetry',slot:'module',rarity:'epic',minPhase:5,name:'Combat Telemetry Suite',effectText:'Turret fire rate +8%; field experience +10%.',power:42,effects:{turretRate:.08,fieldXp:.10}},
    {id:'module-strike-computer',slot:'module',rarity:'epic',minPhase:8,name:'Strike Computer',effectText:'Artillery damage +25 and cooldown -2 seconds.',power:48,effects:{artilleryDamage:25,artilleryCooldown:2}},
    {id:'module-omega-relay',slot:'module',rarity:'legendary',minPhase:10,name:'Omega Relay',effectText:'Turret damage +16%; artillery damage +35 and cooldown -2.5 seconds.',power:72,effects:{turretDamage:.16,artilleryDamage:35,artilleryCooldown:2.5}}
  ];
  var EQUIPMENT_COMPARE_EFFECTS = [
    {key:'commanderDamage',label:'COMMANDER DAMAGE',kind:'percent'},
    {key:'commanderRate',label:'COMMANDER FIRE RATE',kind:'percent'},
    {key:'commanderBossDamage',label:'COMMANDER BOSS DAMAGE',kind:'percent'},
    {key:'turretDamage',label:'TURRET DAMAGE',kind:'percent'},
    {key:'turretRate',label:'TURRET FIRE RATE',kind:'percent'},
    {key:'turretRange',label:'TURRET RANGE',kind:'percent'},
    {key:'hqHp',label:'HQ CAPACITY',kind:'number'},
    {key:'barrierHp',label:'BARRIER CAPACITY',kind:'number'},
    {key:'assaultHqRepair',label:'HQ REPAIR',kind:'number'},
    {key:'hqDamageReduction',label:'HQ REDUCTION',kind:'percent'},
    {key:'barrierDamageReduction',label:'BARRIER REDUCTION',kind:'percent'},
    {key:'artilleryDamage',label:'ARTILLERY DAMAGE',kind:'number'},
    {key:'artilleryCooldown',label:'COOLDOWN REDUCTION',kind:'seconds'},
    {key:'fieldXp',label:'FIELD EXPERIENCE',kind:'percent'}
  ];
  var meta = loadMeta();

  function id(x) { return document.getElementById(x); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function dpr() { return window.devicePixelRatio || 1; }
  function formatNumber(value){return Math.max(0,Math.floor(Number(value)||0)).toLocaleString('en-US');}
  function resourceIcon(type){
    if(type==='credits')return '<svg class="l166-resource-icon credits" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7.2" ry="3.2"></ellipse><path d="M4.8 6v4c0 1.8 3.2 3.2 7.2 3.2s7.2-1.4 7.2-3.2V6M4.8 10v4c0 1.8 3.2 3.2 7.2 3.2s7.2-1.4 7.2-3.2v-4M4.8 14v3.5c0 1.8 3.2 3.2 7.2 3.2s7.2-1.4 7.2-3.2V14"></path></svg>';
    if(type==='parts')return '<svg class="l166-resource-icon parts" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 2h5l.7 2.5 2 .9 2.3-1.2 2.5 4.3-2 1.7.2 2.2 2 1.7-2.5 4.3-2.4-1.1-2 .8-.8 2.5h-5L8.8 18l-2-.9-2.3 1.2L2 14l2-1.7-.2-2.2-2-1.7 2.5-4.3 2.4 1.1 2-.8L9.5 2z"></path><circle cx="12" cy="12" r="3.1"></circle></svg>';
    return '<svg class="l166-resource-icon power" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.8 1.8 5.4 13h5.1l-.6 9.2L18.6 10h-5.1l.3-8.2z"></path></svg>';
  }
  function resourceMarkup(type,value,label){return '<span class="l166-resource '+type+'">'+resourceIcon(type)+'<b>'+formatNumber(value)+'</b><span>'+label+'</span></span>';}
  function resourcePair(credits,parts){return resourceMarkup('credits',credits,'CREDITS')+'<i class="l166-resource-separator">·</i>'+resourceMarkup('parts',parts,'TECH PARTS');}
  function equipmentIcon(slot){
    if(slot==='weapon')return '<svg class="l167-equipment-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M4 18h16l5-5h3v4l-5 4H13l-4 7H5l3-7H4zM12 15V9h3v6M20 17l4 4"></path></svg>';
    if(slot==='rig')return '<svg class="l167-equipment-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 27 7v8c0 7-4.6 11.6-11 14-6.4-2.4-11-7-11-14V7zM10 12h12v9H10zM13 9v3M19 9v3"></path></svg>';
    return '<svg class="l167-equipment-icon" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="10"></circle><circle cx="16" cy="16" r="3"></circle><path d="M16 2v7M16 23v7M2 16h7M23 16h7"></path></svg>';
  }
  function equipmentSlot(slotId){return EQUIPMENT_SLOTS.filter(function(slot){return slot.id===slotId;})[0]||EQUIPMENT_SLOTS[0];}
  function equipmentDefinition(itemId){return EQUIPMENT_CATALOG.filter(function(item){return item.id===itemId;})[0]||null;}
  function equipmentRarity(rarity){
    if(rarity==='legendary')return{label:'LEGENDARY',rank:3,salvage:{credits:350,parts:2}};
    if(rarity==='epic')return{label:'EPIC',rank:2,salvage:{credits:180,parts:1}};
    return{label:'COMMON',rank:1,salvage:{credits:90,parts:0}};
  }
  function equipmentComparisonEffects(definition,peerDefinition){
    var effects=definition&&definition.effects||{},peerEffects=peerDefinition&&peerDefinition.effects||{};
    var chips=EQUIPMENT_COMPARE_EFFECTS.map(function(display){
      var difference=(Number(effects[display.key])||0)-(Number(peerEffects[display.key])||0);
      if(Math.abs(difference)<.0001)return'';
      var absolute=Math.abs(difference),value=display.kind==='percent'?Math.round(absolute*100)+'%':display.kind==='seconds'?absolute.toFixed(absolute%1?1:0)+'s':String(Math.round(absolute));
      return'<span class="'+(difference>0?'gain':'loss')+'">'+display.label+' '+(difference>0?'+':'−')+value+'</span>';
    }).join('');
    return chips||'<span class="even">SAME COMBAT EFFECTS</span>';
  }
  function combatSfx(kind,minGap){
    try{
      var now=performance.now(),gap=Math.max(0,Number(minGap)||0);
      if(gap&&now-(soundTimes[kind]||0)<gap)return;
      soundTimes[kind]=now;
      if(typeof ensureAudio==='function')ensureAudio();
      if(typeof playSfx==='function')playSfx(kind);
    }catch(e){}
  }
  function combatHaptic(kind,minGap){
    try{
      var now=performance.now(),key=kind||'light',gap=Math.max(0,Number(minGap)||0);
      if(gap&&now-(hapticTimes[key]||0)<gap)return;
      hapticTimes[key]=now;
      if(typeof haptic==='function')haptic(key);
    }catch(e){}
  }
  function defaults() { return { credits: BALANCE.ECONOMY.startingCredits, parts: BALANCE.ECONOMY.startingParts, phase: 1, bestPhase: 0, commander: 1, commanderSchema:COMMANDER_SCHEMA, commanderNotice:null, research: 0, researchSchema:RESEARCH_SCHEMA, researchNodes:{}, researchPoints:0, legacyResearchLevels:0, legacyResearchDamage:0, hq: 1, phaseLosses: {}, equipmentSchema:EQUIPMENT_SCHEMA, equipment:[], equipped:{weapon:null,rig:null,module:null}, equipmentNextId:1, equipmentNotice:null, energySchema:ENERGY_SCHEMA, energy:ENERGY_MAX, energyMax:ENERGY_MAX, energyUpdatedAt:Date.now(), campaignRetryPhase:null, operationSchema:OPERATION_SCHEMA, operationLevel:1, operationManualBest:0, junkyardLevel:1, junkyardManualBest:0, operationLastClearDay:'' }; }
  function loadMeta() {
    try {
      var source=JSON.parse(localStorage.getItem(META_KEY) || '{}');
      var loaded=Object.assign(defaults(), source);
      if(!loaded.phaseLosses||typeof loaded.phaseLosses!=='object'||Array.isArray(loaded.phaseLosses))loaded.phaseLosses={};
      if(!loaded.researchNodes||typeof loaded.researchNodes!=='object'||Array.isArray(loaded.researchNodes))loaded.researchNodes={};
      loaded.commander=Math.max(1,Math.min(COMMANDER_MAX_LEVEL,Math.floor(Number(loaded.commander)||1)));
      var sourceCommanderSchema=Math.max(0,Number(source.commanderSchema)||0);
      if(sourceCommanderSchema<COMMANDER_SCHEMA){
        // Build 168 expands the former open-ended upgrade into twenty authored
        // Mastery levels. Campaign veterans keep their purchased level and may
        // enter at the conservative phase checkpoint they have already earned.
        var priorCommander=loaded.commander;
        var veteranCommander=Math.min(COMMANDER_MAX_LEVEL,1+Math.floor(Math.max(0,Number(loaded.bestPhase)||0)/3));
        loaded.commander=Math.max(priorCommander,veteranCommander);
        if(loaded.commander>priorCommander)loaded.commanderNotice={type:'mastery',from:priorCommander,to:loaded.commander};
      }
      loaded.commanderSchema=COMMANDER_SCHEMA;
      loaded.researchPoints=Math.max(0,Math.floor(Number(loaded.researchPoints)||0));
      var sourceSchema=Math.max(0,Number(source.researchSchema)||0);
      if(sourceSchema<165){
        // Build 164 used one linear turret-research level. Each old level becomes
        // a free allocation point. Its existing turret bonus is also retained,
        // so installing the new tree can never make an established save weaker.
        var legacyLevels=Math.max(0,Math.floor(Number(source.research)||0));
        loaded.researchPoints+=legacyLevels;
        loaded.legacyResearchLevels=Math.max(Number(loaded.legacyResearchLevels)||0,legacyLevels);
        loaded.legacyResearchDamage=Math.max(Number(loaded.legacyResearchDamage)||0,legacyLevels*.12);
        loaded.research=0;
      }
      // Build 166 adds nodes around the existing Build 165 IDs. No purchased
      // node is renamed, removed, refunded, or silently granted.
      loaded.researchSchema=RESEARCH_SCHEMA;
      loaded.equipmentNextId=Math.max(1,Math.floor(Number(loaded.equipmentNextId)||1));
      if(!Array.isArray(loaded.equipment))loaded.equipment=[];
      var usedEquipmentIds={};
      loaded.equipment=loaded.equipment.filter(function(instance){return !!(instance&&equipmentDefinition(instance.itemId));}).map(function(instance){
        var uid=String(instance.uid||'');
        if(!uid||usedEquipmentIds[uid])uid='eq-'+loaded.equipmentNextId++;
        usedEquipmentIds[uid]=true;
        var numericId=Number(uid.replace(/^eq-/,''));
        if(Number.isFinite(numericId))loaded.equipmentNextId=Math.max(loaded.equipmentNextId,Math.floor(numericId)+1);
        return {uid:uid,itemId:instance.itemId,acquiredPhase:Math.max(0,Math.floor(Number(instance.acquiredPhase)||0)),acquiredAt:Math.max(0,Number(instance.acquiredAt)||Date.now()),locked:!!instance.locked,source:String(instance.source||'RECOVERED')};
      });
      if(!loaded.equipped||typeof loaded.equipped!=='object'||Array.isArray(loaded.equipped))loaded.equipped={};
      EQUIPMENT_SLOTS.forEach(function(slot){
        var uid=loaded.equipped[slot.id],instance=loaded.equipment.filter(function(item){return item.uid===uid;})[0],definition=instance&&equipmentDefinition(instance.itemId);
        loaded.equipped[slot.id]=definition&&definition.slot===slot.id?instance.uid:null;
      });
      if(Math.max(0,Number(source.equipmentSchema)||0)<EQUIPMENT_SCHEMA&&loaded.bestPhase>0){
        var veteranItemId=loaded.bestPhase>=10?'weapon-siege-rifle':loaded.bestPhase>=5?'weapon-stabilized-carbine':'weapon-service-rifle';
        var veteranUid='eq-'+loaded.equipmentNextId++;
        loaded.equipment.push({uid:veteranUid,itemId:veteranItemId,acquiredPhase:loaded.bestPhase,acquiredAt:Date.now(),locked:true,source:'VETERAN CACHE'});
        if(!loaded.equipped.weapon)loaded.equipped.weapon=veteranUid;
        loaded.equipmentNotice={type:'veteran',uid:veteranUid};
      }
      loaded.equipmentSchema=EQUIPMENT_SCHEMA;
      var now=Date.now(),sourceEnergySchema=Math.max(0,Number(source.energySchema)||0);
      loaded.energyMax=ENERGY_MAX;
      if(sourceEnergySchema<ENERGY_SCHEMA){
        // Build 176 expands the reserve to ten and changes campaign deployment
        // from three assault charges to one up-front phase commitment. Existing
        // commanders receive a full reserve so migration cannot strand a run.
        loaded.energy=ENERGY_MAX;
        loaded.energyUpdatedAt=now;
      }else{
        loaded.energy=Math.max(0,Math.min(loaded.energyMax,Math.floor(Number(loaded.energy)||0)));
        loaded.energyUpdatedAt=Math.max(0,Number(loaded.energyUpdatedAt)||now);
        if(loaded.energy<loaded.energyMax){
          var recovered=Math.floor(Math.max(0,now-loaded.energyUpdatedAt)/ENERGY_RECHARGE_MS);
          if(recovered>0){loaded.energy=Math.min(loaded.energyMax,loaded.energy+recovered);loaded.energyUpdatedAt+=recovered*ENERGY_RECHARGE_MS;}
        }else loaded.energyUpdatedAt=now;
      }
      loaded.campaignRetryPhase=loaded.campaignRetryPhase==null?null:Math.max(1,Math.floor(Number(loaded.campaignRetryPhase)||1));
      loaded.operationLastClearDay=String(loaded.operationLastClearDay||'');
      loaded.operationLevel=Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(loaded.operationLevel)||1)));
      var sourceOperationSchema=Math.max(0,Number(source.operationSchema)||0);
      if(sourceOperationSchema<174&&loaded.operationLastClearDay){
        // Anyone who already completed the original unnumbered operation has
        // earned Level 2. Its daily claim remains intact; migration never
        // grants a second reward on the same calendar day.
        loaded.operationLevel=Math.max(2,loaded.operationLevel);
      }
      loaded.operationManualBest=Math.max(0,Math.min(loaded.operationLevel-1,Math.floor(Number(loaded.operationManualBest)||0)));
      if(sourceOperationSchema<175){
        // Every pre-175 Operation clear was manual, so existing commanders
        // retain the auto-clear eligibility they already earned.
        loaded.operationManualBest=Math.max(loaded.operationManualBest,loaded.operationLevel-1);
      }
      // Junkyard Recovery starts on its own ladder. Containment progress and
      // the shared daily claim are preserved exactly; migration never grants a
      // second reward or treats a Containment clear as a Junkyard clear.
      loaded.junkyardLevel=Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(loaded.junkyardLevel)||1)));
      loaded.junkyardManualBest=Math.max(0,Math.min(loaded.junkyardLevel-1,Math.floor(Number(loaded.junkyardManualBest)||0)));
      loaded.operationSchema=OPERATION_SCHEMA;
      loaded.energySchema=ENERGY_SCHEMA;
      return loaded;
    }
    catch (e) { return defaults(); }
  }
  function saveMeta() { localStorage.setItem(META_KEY, JSON.stringify(meta)); }
  function availableEnergy(){
    if(QA_TEST_ACCESS)return meta.energyMax;
    var now=Date.now();
    if(meta.energy<meta.energyMax){
      var recovered=Math.floor(Math.max(0,now-meta.energyUpdatedAt)/ENERGY_RECHARGE_MS);
      if(recovered>0){meta.energy=Math.min(meta.energyMax,meta.energy+recovered);meta.energyUpdatedAt+=recovered*ENERGY_RECHARGE_MS;saveMeta();}
    }
    return meta.energy;
  }
  function reserveEnergy(cost){
    cost=Math.max(0,Math.floor(Number(cost)||0));
    if(QA_TEST_ACCESS)return true;
    if(availableEnergy()<cost)return false;
    if(meta.energy===meta.energyMax)meta.energyUpdatedAt=Date.now();
    meta.energy-=cost;saveMeta();return true;
  }
  function campaignEnergySpend(){
    var available=QA_TEST_ACCESS?CAMPAIGN_MAX_ENERGY_SPEND:Math.min(CAMPAIGN_MAX_ENERGY_SPEND,availableEnergy());
    selectedCampaignEnergy=Math.max(1,Math.min(CAMPAIGN_MAX_ENERGY_SPEND,Math.floor(Number(selectedCampaignEnergy)||1)));
    if(!QA_TEST_ACCESS&&available>0)selectedCampaignEnergy=Math.min(selectedCampaignEnergy,available);
    return selectedCampaignEnergy;
  }
  function campaignCreditMultiplier(spend){
    return BALANCE.energyMultiplier(spend);
  }
  function campaignCreditReward(baseCredits,spend){return Math.floor(Math.max(0,Number(baseCredits)||0)*campaignCreditMultiplier(spend));}
  function campaignMultiplierLabel(spend){return campaignCreditMultiplier(spend).toFixed(2)+'× CREDITS';}
  function localDayKey(date){
    var value=date||new Date();
    return value.getFullYear()+'-'+String(value.getMonth()+1).padStart(2,'0')+'-'+String(value.getDate()).padStart(2,'0');
  }
  function operationDayNumber(date){
    var value=date||new Date();
    return Math.floor(Date.UTC(value.getFullYear(),value.getMonth(),value.getDate())/86400000);
  }
  function activeOperationId(date){return operationDayNumber(date)%2===1?'junkyard':'containment';}
  function alternateOperationId(kind){return kind==='junkyard'?'containment':'junkyard';}
  function operationDefinition(kind){
    if(kind==='junkyard')return{id:'junkyard',short:'JUNKYARD',name:'JUNKYARD RECOVERY',levelLabel:'RECOVERY LEVEL',objective:'Destroy the armored convoy transport before it reaches the extraction gate.',failure:'TARGET ESCAPED',next:'CONTAINMENT SWEEP'};
    return{id:'containment',short:'CONTAINMENT',name:'CONTAINMENT SWEEP',levelLabel:'CONTAINMENT LEVEL',objective:'Hold the forward command line through three infected assaults and the Containment Alpha boss.',failure:'FORWARD LINE LOST',next:'JUNKYARD RECOVERY'};
  }
  function operationLevelFor(kind){return kind==='junkyard'?meta.junkyardLevel:meta.operationLevel;}
  function operationManualBestFor(kind){return kind==='junkyard'?meta.junkyardManualBest:meta.operationManualBest;}
  function operationRewardAvailable(){return meta.operationLastClearDay!==localDayKey();}
  function operationAvailable(kind){return (kind||activeOperationId())===activeOperationId()&&(QA_TEST_ACCESS||operationRewardAvailable());}
  function operationDifficulty(level){
    return BALANCE.containmentDifficulty(Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(level)||1))));
  }
  function operationTargets(level){
    return BALANCE.containmentTargets(Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(level)||1))));
  }
  function junkyardTimeLimit(){return BALANCE.OPERATIONS.junkyardSeconds;}
  function formatObjectiveTime(seconds){
    seconds=Math.max(0,Math.ceil(Number(seconds)||0));
    return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  }
  function junkyardVehicleHealth(level){
    return BALANCE.junkyardVehicleHealth(Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(level)||1))));
  }
  function operationRewardCredits(level){
    return operationRewardCreditsFor(activeOperationId(),level);
  }
  function operationRewardCreditsFor(kind,level){
    return BALANCE.operationCredits(kind,Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(level)||1))));
  }
  function operationRewardParts(level){
    return operationRewardPartsFor(activeOperationId(),level);
  }
  function operationRewardPartsFor(kind,level){
    return BALANCE.operationParts(kind,Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(level)||1))));
  }
  function operationRecommendedPower(level){
    return operationRecommendedPowerFor(activeOperationId(),level);
  }
  function operationRecommendedPowerFor(kind,level){
    return BALANCE.operationRecommendedPower(kind,Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(level)||1))));
  }
  function operationAutoClearState(level){
    return operationAutoClearStateFor(activeOperationId(),level);
  }
  function operationAutoClearStateFor(kind,level){
    level=Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(level)||1)));
    var recommended=operationRecommendedPowerFor(kind,level),required=Math.ceil(recommended*1.15/5)*5;
    var manualRequired=Math.max(1,level-1),containmentManualReady=meta.operationManualBest>=manualRequired,manualReady=kind==='junkyard'?meta.junkyardManualBest>=manualRequired:containmentManualReady,powerReady=currentPower()>=required,rewardReady=operationRewardAvailable();
    return {kind:kind,level:level,recommended:recommended,required:required,manualRequired:manualRequired,manualReady:manualReady,powerReady:powerReady,rewardReady:rewardReady,available:manualReady&&powerReady&&(QA_TEST_ACCESS||rewardReady)};
  }
  function autoClearOperation(){
    var kind=activeOperationId(),level=operationLevelFor(kind),state=operationAutoClearStateFor(kind,level);
    if(!state.available)return;
    var rewarded=operationRewardAvailable(),credits=rewarded?operationRewardCreditsFor(kind,level):0,parts=rewarded?operationRewardPartsFor(kind,level):0;
    meta.credits+=credits;meta.parts+=parts;
    if(rewarded)meta.operationLastClearDay=localDayKey();
    if(kind==='junkyard')meta.junkyardLevel=Math.min(OPERATION_LEVEL_GUARD,level+1);
    else meta.operationLevel=Math.min(OPERATION_LEVEL_GUARD,level+1);
    operationNotice={kind:kind,method:'auto',level:level,nextLevel:operationLevelFor(kind),rewarded:rewarded,credits:credits,parts:parts};
    saveMeta();combatSfx('victory');combatHaptic('success',250);renderTab('operations');
  }
  function isFreeCampaignRetry(phase){return meta.campaignRetryPhase===Math.max(1,Math.floor(Number(phase)||1));}
  function energyRechargeCopy(){
    if(QA_TEST_ACCESS)return'RESERVE UNLIMITED';
    availableEnergy();
    if(meta.energy>=meta.energyMax)return'RESERVE FULL';
    var remaining=Math.max(0,ENERGY_RECHARGE_MS-(Date.now()-meta.energyUpdatedAt));
    var minutes=Math.max(1,Math.ceil(remaining/60000));
    return'NEXT ENERGY IN '+Math.floor(minutes/60)+':'+String(minutes%60).padStart(2,'0');
  }
  function energyCardMarkup(freeRetry){
    var energy=availableEnergy(),pips='';
    for(var index=0;index<meta.energyMax;index++)pips+='<i class="'+(index<energy?'full':'')+'"></i>';
    if(freeRetry)return '<div class="l171-energy-card"><div class="l171-energy-head"><b>ENERGY-FREE RETRY</b><strong>0</strong></div><div class="l171-energy-copy"><span>ONE COMPLETE PHASE RETRY · BASE CREDIT REWARD</span><span>RETRY READY</span></div><div class="l171-energy-pips">'+pips+'</div><div class="l171-energy-copy"><span>NO ENERGY COMMITTED</span><span>TECH PARTS AND EQUIPMENT NORMAL</span></div></div>';
    var spend=campaignEnergySpend(),options='';
    for(var amount=1;amount<=CAMPAIGN_MAX_ENERGY_SPEND;amount++)options+='<button data-campaign-energy="'+amount+'" class="'+(amount===spend?'active':'')+'" '+(!QA_TEST_ACCESS&&energy<amount?'disabled':'')+'><b>'+amount+'</b><span>'+campaignCreditMultiplier(amount).toFixed(2)+'×</span></button>';
    var qaClass=QA_TEST_ACCESS?' l175-qa-energy':'';
    return '<div class="l171-energy-card'+qaClass+'"><div class="l171-energy-head"><b>COMMAND ENERGY</b><strong>'+(QA_TEST_ACCESS?'∞':energy+' / '+meta.energyMax)+'</strong></div><div class="l171-energy-copy"><span>ONE COMMITMENT COVERS THE ENTIRE THREE-ASSAULT PHASE.</span><span>'+energyRechargeCopy()+'</span></div><div class="l171-energy-pips">'+pips+'</div><div class="l176-energy-selector">'+options+'</div><div class="l176-energy-value"><b>'+spend+' ENERGY · '+campaignMultiplierLabel(spend)+'</b><span>EXTRA ENERGY MULTIPLIES CREDITS ONLY · TECH PARTS, EQUIPMENT, AND PROGRESSION NEVER MULTIPLY</span></div></div>';
  }
  function commanderTier(level){
    level=Math.max(1,Math.min(COMMANDER_MAX_LEVEL,Math.floor(Number(level)||1)));
    if(level>=20)return 5;if(level>=15)return 4;if(level>=10)return 3;if(level>=5)return 2;return 1;
  }
  function commanderMastery(level){
    level=Math.max(1,Math.min(COMMANDER_MAX_LEVEL,Math.floor(Number(level)||1)));
    var tier=commanderTier(level);
    var earlyLevels=Math.min(4,level-1),veteranLevels=Math.max(0,level-5);
    return{level:level,tier:tier,title:COMMANDER_TIER_NAMES[tier-1],damageBonus:earlyLevels*.15+veteranLevels*.055,rateBonus:earlyLevels*.06+veteranLevels*.02,bossBonus:level>=20?.20:level>=15?.10:0,commandUnlocked:level>=5,commandRate:level>=20?1.50:level>=10?1.40:1.35,commandDuration:level>=15?7:6,commandCooldown:level>=10?20:24};
  }
  function equipmentInstance(uid){return meta.equipment.filter(function(instance){return instance.uid===uid;})[0]||null;}
  function equippedInstance(slotId){return equipmentInstance(meta.equipped&&meta.equipped[slotId]);}
  function isEquipmentEquipped(uid){return EQUIPMENT_SLOTS.some(function(slot){return meta.equipped&&meta.equipped[slot.id]===uid;});}
  function equipmentPower(){
    return EQUIPMENT_SLOTS.reduce(function(total,slot){var instance=equippedInstance(slot.id),definition=instance&&equipmentDefinition(instance.itemId);return total+(definition?Number(definition.power)||0:0);},0);
  }
  function equipmentEffects(){
    var result={commanderDamage:0,commanderRate:0,commanderBossDamage:0,turretDamage:0,turretRate:0,turretRange:0,hqHp:0,barrierHp:0,assaultHqRepair:0,assaultBarrierRepair:0,hqDamageReduction:0,barrierDamageReduction:0,artilleryDamage:0,artilleryCooldown:0,fieldXp:0};
    EQUIPMENT_SLOTS.forEach(function(slot){
      var instance=equippedInstance(slot.id),definition=instance&&equipmentDefinition(instance.itemId);
      Object.keys(definition&&definition.effects||{}).forEach(function(key){result[key]=(result[key]||0)+(Number(definition.effects[key])||0);});
    });
    return result;
  }
  function nextEquipmentUid(){return'eq-'+meta.equipmentNextId++;}
  function salvageValue(definition){return equipmentRarity(definition&&definition.rarity).salvage;}
  function removeEquipmentInstance(instance,grantSalvage){
    if(!instance)return null;
    var definition=equipmentDefinition(instance.itemId),value=salvageValue(definition);
    meta.equipment=meta.equipment.filter(function(item){return item.uid!==instance.uid;});
    EQUIPMENT_SLOTS.forEach(function(slot){if(meta.equipped[slot.id]===instance.uid)meta.equipped[slot.id]=null;});
    if(grantSalvage){meta.credits+=value.credits;meta.parts+=value.parts;}
    return{instance:instance,definition:definition,value:value};
  }
  function addEquipment(definition,phase,source){
    var displaced=null;
    if(meta.equipment.length>=INVENTORY_CAPACITY){
      var disposable=meta.equipment.filter(function(instance){var item=equipmentDefinition(instance.itemId);return item&&item.rarity==='common'&&!instance.locked&&!isEquipmentEquipped(instance.uid);}).sort(function(a,b){return a.acquiredAt-b.acquiredAt;})[0];
      if(disposable)displaced=removeEquipmentInstance(disposable,true);
    }
    var instance={uid:nextEquipmentUid(),itemId:definition.id,acquiredPhase:Math.max(1,Math.floor(Number(phase)||1)),acquiredAt:Date.now(),locked:false,source:String(source||'RECOVERED')};
    meta.equipment.push(instance);
    return{instance:instance,definition:definition,displaced:displaced,overCapacity:meta.equipment.length>INVENTORY_CAPACITY};
  }
  function equipmentDropRarity(phase,firstClear){
    var roll=Math.random(),legendaryChance=phase>=15?.08:phase>=10?.04:phase>=8?.02:0,epicChance=phase>=15?.47:phase>=10?.41:phase>=8?.30:phase>=4?.18:0;
    if(roll<legendaryChance)return'legendary';
    if(roll<legendaryChance+epicChance)return'epic';
    return firstClear&&phase>=10?'epic':'common';
  }
  function chooseEquipmentDrop(phase,rarity){
    var candidates=EQUIPMENT_CATALOG.filter(function(item){return item.rarity===rarity&&item.minPhase<=phase;});
    if(!candidates.length&&rarity==='legendary')candidates=EQUIPMENT_CATALOG.filter(function(item){return item.rarity==='epic'&&item.minPhase<=phase;});
    if(!candidates.length)candidates=EQUIPMENT_CATALOG.filter(function(item){return item.rarity==='common'&&item.minPhase<=phase;});
    var owned={};meta.equipment.forEach(function(instance){owned[instance.itemId]=true;});
    var fresh=candidates.filter(function(item){return !owned[item.id];});if(fresh.length)candidates=fresh;
    var counts={weapon:0,rig:0,module:0};meta.equipment.forEach(function(instance){var item=equipmentDefinition(instance.itemId);if(item)counts[item.slot]++;});
    var least=Math.min.apply(Math,candidates.map(function(item){return counts[item.slot]||0;})),balanced=candidates.filter(function(item){return(counts[item.slot]||0)===least;});
    return balanced[Math.floor(Math.random()*balanced.length)]||candidates[0]||null;
  }
  function awardEquipmentDrop(phase,firstClear){
    if(!firstClear&&Math.random()>=.30)return null;
    var rarity=equipmentDropRarity(phase,firstClear),definition=chooseEquipmentDrop(phase,rarity);
    if(!definition)return null;
    var award=addEquipment(definition,phase,firstClear?'FIRST CLEAR':'PHASE REPLAY');
    award.firstClear=firstClear;
    return award;
  }
  function equipEquipment(uid,skipRender){
    var instance=equipmentInstance(uid),definition=instance&&equipmentDefinition(instance.itemId);if(!definition)return false;
    meta.equipped[definition.slot]=instance.uid;saveMeta();combatSfx('upgrade');combatHaptic('success',150);selectedInventoryUid=instance.uid;
    if(!skipRender)renderTab('inventory');
    return true;
  }
  function toggleEquipmentLock(uid){
    var instance=equipmentInstance(uid);if(!instance)return;instance.locked=!instance.locked;saveMeta();combatSfx('event');combatHaptic('light',120);selectedInventoryUid=uid;renderTab('inventory');
  }
  function salvageEquipment(uid){
    var instance=equipmentInstance(uid),definition=instance&&equipmentDefinition(instance.itemId);if(!definition||instance.locked||isEquipmentEquipped(uid))return;
    var value=salvageValue(definition);
    if(!confirm('Salvage '+definition.name+' for '+value.credits+' Credits'+(value.parts?' and '+value.parts+' Tech Part'+(value.parts===1?'':'s'):'')+'?'))return;
    removeEquipmentInstance(instance,true);selectedInventoryUid=null;saveMeta();combatSfx('upgrade');combatHaptic('medium',160);renderTab('inventory');
  }
  function researchNode(nodeId){
    for(var i=0;i<RESEARCH_NODES.length;i++)if(RESEARCH_NODES[i].id===nodeId)return RESEARCH_NODES[i];
    return null;
  }
  function researchPurchased(nodeId){return !!(meta.researchNodes&&meta.researchNodes[nodeId]);}
  function branchNodes(branchId){return RESEARCH_NODES.filter(function(node){return node.branch===branchId;}).sort(function(a,b){return a.tier-b.tier;});}
  function researchRequirements(node){return Array.isArray(node&&node.requires)?node.requires:[];}
  function researchUnlocked(node){
    return researchRequirements(node).every(function(nodeId){return researchPurchased(nodeId);});
  }
  function researchRequirementText(node){
    var missing=researchRequirements(node).filter(function(nodeId){return !researchPurchased(nodeId);}).map(function(nodeId){var requirement=researchNode(nodeId);return requirement?requirement.name:nodeId;});
    return missing.length?'REQUIRES '+missing.join(' + ').toUpperCase():'';
  }
  function purchasedResearchCount(){return RESEARCH_NODES.filter(function(node){return researchPurchased(node.id);}).length;}
  function researchPower(){
    // Build 167 rates upgrades by their actual share of battlefield output.
    // Build 166's tier values made a healthy save appear dramatically stronger
    // than the same save performed in combat.
    var tierPower=[0,16,22,28,36,48],total=Math.max(0,Number(meta.legacyResearchLevels)||0)*20;
    RESEARCH_NODES.forEach(function(node){if(researchPurchased(node.id))total+=tierPower[node.tier]||16;});
    return total;
  }
  function researchEffects(){
    var result={turretDamage:Math.max(0,Number(meta.legacyResearchDamage)||0),turretRate:0,turretRange:0,turretBossDamage:0,turretArmoredDamage:0,turretPriority:0,barrierHp:0,hqHp:0,assaultHqRepair:0,assaultBarrierRepair:0,hqDamageReduction:0,hqEmergencyReduction:0,barrierDamageReduction:0,rebuildBarrierFraction:0,artilleryDamage:0,artilleryCooldown:0,artilleryKillCooldown:0,assaultArtilleryReady:0,fieldXp:0,artilleryMultiplier:0,promotionChoiceBonus:0};
    RESEARCH_NODES.forEach(function(node){
      if(!researchPurchased(node.id))return;
      Object.keys(node.effects||{}).forEach(function(key){result[key]=(result[key]||0)+node.effects[key];});
    });
    return result;
  }
  var RESEARCH_EFFECT_DISPLAY={
    turretDamage:{label:'ATTACK POWER',kind:'percent'},turretRate:{label:'FIRE RATE',kind:'percent'},turretRange:{label:'RANGE',kind:'percent'},turretBossDamage:{label:'BOSS DAMAGE',kind:'percent'},turretArmoredDamage:{label:'ARMOR DAMAGE',kind:'percent'},turretPriority:{label:'TARGET PRIORITY',kind:'toggle'},
    barrierHp:{label:'BARRIER HEALTH',kind:'number'},hqHp:{label:'HQ HEALTH',kind:'number'},assaultHqRepair:{label:'HQ REPAIR',kind:'number'},assaultBarrierRepair:{label:'BARRIER REPAIR',kind:'number'},hqDamageReduction:{label:'HQ ARMOR',kind:'percent'},hqEmergencyReduction:{label:'EMERGENCY ARMOR',kind:'percent'},barrierDamageReduction:{label:'BARRIER ARMOR',kind:'percent'},rebuildBarrierFraction:{label:'BARRIER REBUILD',kind:'percent'},
    artilleryDamage:{label:'ARTILLERY POWER',kind:'number'},artilleryCooldown:{label:'COOLDOWN',kind:'seconds'},artilleryKillCooldown:{label:'KILL COOLDOWN',kind:'seconds'},assaultArtilleryReady:{label:'ASSAULT READY',kind:'toggle'},fieldXp:{label:'FIELD XP',kind:'percent'},artilleryMultiplier:{label:'ARTILLERY POWER',kind:'percent'},promotionChoiceBonus:{label:'PROMOTION CHOICE',kind:'choices'}
  };
  function researchEffectValue(key,value){
    var display=RESEARCH_EFFECT_DISPLAY[key],number=Number(value)||0;
    if(!display)return String(number);
    if(display.kind==='percent')return Math.round(number*100)+'%';
    if(display.kind==='seconds')return(number>0?'-':'')+number.toFixed(number%1?2:0)+'s';
    if(display.kind==='choices')return String(3+Math.round(number));
    if(display.kind==='toggle')return number>0?'ON':'OFF';
    return formatNumber(number);
  }
  function researchDeltaValue(key,value){
    var display=RESEARCH_EFFECT_DISPLAY[key],number=Number(value)||0;
    if(!display)return String(number);
    if(display.kind==='toggle')return'ON';
    if(display.kind==='choices')return'+'+Math.round(number);
    if(display.kind==='seconds')return'-'+number.toFixed(number%1?2:0)+'s';
    if(display.kind==='percent')return'+'+Math.round(number*100)+'%';
    return'+'+formatNumber(number);
  }
  function researchStatMarkup(node){
    return Object.keys(node.effects||{}).filter(function(key){return!!RESEARCH_EFFECT_DISPLAY[key];}).map(function(key){
      return'<span><b>'+researchDeltaValue(key,node.effects[key])+'</b>'+RESEARCH_EFFECT_DISPLAY[key].label+'</span>';
    }).join('');
  }
  function researchPreview(node,effects,purchased){
    var keys=Object.keys(node.effects||{}).filter(function(key){return !!RESEARCH_EFFECT_DISPLAY[key];}),key=keys[0];
    if(!key)return purchased?'ACTIVE SYSTEM':'NEW COMBAT SYSTEM';
    var display=RESEARCH_EFFECT_DISPLAY[key],current=Number(effects[key])||0,next=current+(purchased?0:Number(node.effects[key])||0);
    return purchased?'ACTIVE TOTAL · '+researchEffectValue(key,current):'TOTAL '+researchEffectValue(key,current)+' → '+researchEffectValue(key,next);
  }
  function researchPrimaryEffect(node){
    var key=Object.keys(node.effects||{}).filter(function(effectKey){return!!RESEARCH_EFFECT_DISPLAY[effectKey];})[0];
    if(!key)return'SYSTEM';
    return researchDeltaValue(key,node.effects[key])+' '+RESEARCH_EFFECT_DISPLAY[key].label;
  }
  function researchNodeBadge(node){
    var key=Object.keys(node.effects||{}).filter(function(effectKey){return!!RESEARCH_EFFECT_DISPLAY[effectKey];})[0];
    if(!key)return{value:'ON',label:'SYSTEM'};
    var labels={
      turretDamage:'POWER',turretRate:'RATE',turretRange:'RANGE',turretBossDamage:'BOSS',turretArmoredDamage:'ARMOR',turretPriority:'TARGET',
      barrierHp:'BARRIER',hqHp:'HQ',assaultHqRepair:'REPAIR',assaultBarrierRepair:'REPAIR',hqDamageReduction:'HQ ARMOR',hqEmergencyReduction:'EMERGENCY',barrierDamageReduction:'ARMOR',rebuildBarrierFraction:'REBUILD',
      artilleryDamage:'ARTILLERY',artilleryCooldown:'COOLDOWN',artilleryKillCooldown:'KILL CD',assaultArtilleryReady:'READY',fieldXp:'FIELD XP',artilleryMultiplier:'ARTILLERY',promotionChoiceBonus:'CHOICE'
    };
    return{value:researchDeltaValue(key,node.effects[key]),label:labels[key]||RESEARCH_EFFECT_DISPLAY[key].label};
  }
  function researchNodeState(node){
    if(researchPurchased(node.id))return'complete';
    return researchUnlocked(node)?'available':'locked';
  }
  function defaultResearchNode(){
    var selected=selectedResearchNodeId&&researchNode(selectedResearchNodeId);
    if(selected)return selected;
    return RESEARCH_NODES.filter(function(node){return researchUnlocked(node)&&!researchPurchased(node.id);})[0]||
      RESEARCH_NODES.filter(function(node){return researchPurchased(node.id);}).slice(-1)[0]||RESEARCH_NODES[0];
  }
  function buyResearchNode(nodeId){
    var node=researchNode(nodeId);
    if(!node||researchPurchased(node.id)||!researchUnlocked(node))return;
    if(meta.researchPoints>0)meta.researchPoints--;
    else{
      if(meta.credits<node.cost.credits||meta.parts<node.cost.parts)return;
      meta.credits-=node.cost.credits;
      meta.parts-=node.cost.parts;
    }
    meta.researchNodes[node.id]={purchasedAt:Date.now()};
    selectedResearchNodeId=node.id;
    saveMeta();
    combatSfx('upgrade');
    combatHaptic('success',180);
    var panel=id('l137-panel'),oldScroll=panel?panel.scrollTop:0;
    renderTab('research',{scrollTop:oldScroll});
  }
  saveMeta();
  function phaseLossCount(phase){return Math.max(0,Number(meta.phaseLosses[String(phase)])||0);}
  function retryAssist(phase){var losses=phaseLossCount(phase);return Math.min(.24,Math.max(0,losses-1)*.08);}
  function phaseBalance(phase){
    return BALANCE.phaseBalance(phase);
  }

  // Build 154: old TestFlight installs can retain tutorial/navigation flags from
  // the retired three-lane game. Initialize the underlying state once, then
  // permanently remove those obsolete entry screens without touching campaign,
  // purchases, research, inventory, or Command Base progression.
  function removeLegacyNode(nodeId) {
    var node = id(nodeId);
    if (!node) return;
    node.classList.remove('active');
    node.classList.add('hidden');
    node.setAttribute('aria-hidden', 'true');
    node.remove();
  }

  function markCommandReady() {
    if (document.documentElement.classList.contains('lsc-command-ready')) return;
    var raf = window.requestAnimationFrame || function (callback) { return setTimeout(callback, 16); };
    raf(function () {
      raf(function () {
        document.documentElement.classList.add('lsc-command-ready');
      });
    });
  }

  function enforceCommandBaseStartup() {
    try {
      localStorage.setItem('ifc_ob_done', '1');
      localStorage.setItem('lsc_startup_schema', '154');

      // The old engine still supplies shared audio/state helpers used in battle.
      // Complete its one-time initialization before detaching its retired start UI.
      if (G && G.state && !G.state.started) {
        if (!G.state.selectedDoctrine) G.state.selectedDoctrine = 'fortress';
        var begin = id('beginBtn');
        if (begin) begin.click();
        G.state.started = true;
      }

      if (typeof _obDismiss === 'function') _obDismiss();
      removeLegacyNode('onboarding-overlay');
      removeLegacyNode('startOverlay');

      var home = id('homeScreen');
      if (home) {
        home.style.display = 'none';
        home.classList.remove('hs-visible');
        home.setAttribute('aria-hidden', 'true');
      }
      document.body.classList.remove('lsc-home-mode');

      if (G && G.state) {
        G.state._centralHQMode = false;
        G.state.waveInProgress = false;
        G.state.gameOver = false;
        G.state.paused = false;
      }

      var commandBase = id('lsc137-app');
      if (commandBase) {
        commandBase.classList.remove('hidden');
        commandBase.setAttribute('aria-hidden', 'false');
      }
      markCommandReady();
    } catch (e) {
      console.warn('[Build 162] startup migration recovered:', e.message);
      var fallback = id('lsc137-app');
      if (fallback) fallback.classList.remove('hidden');
      markCommandReady();
    }
  }
  function levelCost(type) {
    if (type === 'commander') return { credits: 170 + 90 * meta.commander, parts: meta.commander>=10?2:meta.commander>=5?1:0 };
    if (type === 'research') return { credits: 300, parts: 5 };
    return { credits: 250 * meta.hq, parts: 0 };
  }

  function installStyles() {
    var s = document.createElement('style');
    s.id = 'lsc137-style';
    s.textContent =
      '#pressure-overlay,#quest-board,#tutorialHint,.lsc-front-pill,.lsc-hero-ability,#onboarding-overlay,#autowav-strip,#waveSky,#weatherCanvas,#damage-vignette,#wave-chip,#waveCountdown,#eventBanner,#phaseWarning,#bossSky,#bossAlert,#killStreak,#orbitalReticle,#waveClearedBanner{display:none!important}' +
      'body.lsc137-mode #hud,body.lsc137-mode #controls,body.lsc137-mode #world-progress-bar,body.lsc137-mode #autowav-strip,body.lsc137-mode #lsc-command-actions,body.lsc137-mode #lsc-front-status,body.lsc137-mode #lsc-front-pill,body.lsc137-mode #lsc-front-canvas,body.lsc137-mode #lsc-world-chip,body.lsc137-mode #lsc-daily-btn,body.lsc137-mode #lsc-staff-btn,body.lsc137-mode #lsc-hud-actions-dock,body.lsc137-mode #quest-hud,body.lsc137-mode #orbitalBtn,body.lsc137-mode #storeBtn,body.lsc137-mode .upgrade-badge{display:none!important}' +
      '#lsc137-app{position:fixed;z-index:30000;inset:0;color:#fff;font-family:Rajdhani,sans-serif;background:radial-gradient(circle at 50% 22%,#153343 0,#071119 42%,#03070a 100%)}' +
      '#lsc137-app.hidden{display:none}.l137-shell{height:100%;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top,0px) + 16px) 16px calc(env(safe-area-inset-bottom,0px) + 12px);box-sizing:border-box}' +
      '.l137-top{display:flex;justify-content:space-between;align-items:flex-start}.l137-brand{font:8px "Share Tech Mono",monospace;letter-spacing:2.5px;color:#74e9ff}.l137-title{font-size:28px;font-weight:900;line-height:1}.l137-res{font:9px "Share Tech Mono",monospace;color:#dcebf0;text-align:right}.l137-res b{color:#ffd166}' +
      '.l166-resource-row{display:flex;justify-content:flex-end;align-items:center;gap:4px;min-height:15px;white-space:nowrap}.l166-resource-row+.l166-resource-row{margin-top:2px}.l166-resource{display:inline-flex!important;align-items:center;gap:3px;color:#dcebf0;font:7px "Share Tech Mono",monospace;white-space:nowrap}.l166-resource b{font-size:9px;color:#fff}.l166-resource.credits,.l166-resource.credits b{color:#ffd166}.l166-resource.parts,.l166-resource.parts b{color:#8fefff}.l166-resource.power,.l166-resource.power b{color:#fff}.l166-resource-icon{width:12px;height:12px;overflow:visible;stroke:currentColor;fill:none;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}.l166-resource-icon.power{fill:#ffd166;stroke:#ffd166;width:11px}.l166-resource-separator{color:#52646d;font-style:normal;margin:0 2px}.l166-cost{display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap}.l166-cost .l166-resource{font-size:6px}.l166-cost .l166-resource b{font-size:7px}.l166-cost .l166-resource-icon{width:10px;height:10px}.l166-reward-resources{display:flex;justify-content:center;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:3px}.l166-reward-resources .l166-resource b{font-size:16px}.l166-reward-resources .l166-resource span{font-size:11px}.l166-reward-resources .l166-resource-icon{width:18px;height:18px}' +
      '.l137-hero{height:34%;min-height:180px;display:flex;align-items:center;justify-content:center;position:relative}.l137-hq-art{width:150px;height:102px;position:relative;border:2px solid #9a8653;border-radius:18px;background:linear-gradient(145deg,rgba(41,75,87,.75),rgba(7,17,23,.96));box-shadow:0 0 42px rgba(34,212,255,.18),inset 0 -20px 32px #071117;transition:width .3s,height .3s,border .3s,box-shadow .3s}.l137-hq-art[data-tier="2"]{width:162px;height:112px;border-width:3px}.l137-hq-art[data-tier="3"]{width:176px;height:124px;border-width:4px;border-color:#d4b45e;box-shadow:0 0 58px rgba(255,209,102,.25),inset 0 -22px 35px #071117}.l137-hq-art[data-tier="4"]{width:188px;height:134px;border-width:5px;border-color:#e0c56d}.l137-hq-art[data-tier="5"]{width:202px;height:144px;border-width:6px;border-color:#7ef8ff;box-shadow:0 0 76px rgba(65,229,255,.46),inset 0 -24px 38px #071117}.l165-hq-wall{position:absolute;inset:13px 10px 8px;border:2px solid #806d4a;border-radius:12px;transition:.3s}.l137-hq-art[data-tier="2"] .l165-hq-wall{border-width:4px;border-color:#a08b59}.l137-hq-art[data-tier="3"] .l165-hq-wall{border-width:6px;border-color:#bca366;box-shadow:inset 0 0 0 2px #4d5142}.l137-hq-art[data-tier="4"] .l165-hq-wall{border-width:8px;border-color:#879695;box-shadow:inset 0 0 0 3px #394b4b}.l137-hq-art[data-tier="5"] .l165-hq-wall{border-width:10px;border-color:#70cbd2;box-shadow:inset 0 0 0 3px #274a50,0 0 15px rgba(64,227,246,.34)}.l165-hq-core{position:absolute;left:50%;top:51%;width:68px;height:52px;transform:translate(-50%,-50%);display:grid;place-items:center;border:2px solid #ffd166;border-radius:14px;background:linear-gradient(145deg,#426467,#172a30);box-shadow:0 8px 15px rgba(0,0,0,.34);transition:.3s}.l165-hq-core span{font-size:23px;font-weight:900}.l137-hq-art[data-tier="2"] .l165-hq-core{width:76px;height:58px}.l137-hq-art[data-tier="3"] .l165-hq-core{width:84px;height:64px;border-width:3px}.l137-hq-art[data-tier="4"] .l165-hq-core{width:92px;height:70px;background:linear-gradient(145deg,#4d7073,#172b34)}.l137-hq-art[data-tier="5"] .l165-hq-core{width:100px;height:76px;border-color:#9cecff;box-shadow:0 0 19px rgba(80,225,245,.42)}.l165-hq-mast{position:absolute;left:50%;bottom:76%;width:5px;height:0;transform:translateX(-50%);border-radius:5px;background:#9cecff;box-shadow:0 0 10px #22d4ff;transition:.3s}.l137-hq-art[data-tier="2"] .l165-hq-mast,.l137-hq-art[data-tier="3"] .l165-hq-mast{height:34px}.l137-hq-art[data-tier="4"] .l165-hq-mast,.l137-hq-art[data-tier="5"] .l165-hq-mast{height:42px;box-shadow:-38px 27px 0 1px #45d9ff,38px 27px 0 1px #45d9ff,0 0 15px #22d4ff}.l165-hq-tower{display:none;position:absolute;width:18px;height:18px;border:2px solid #d7bd75;border-radius:4px;background:#2c4143;box-shadow:0 4px 8px rgba(0,0,0,.35)}.l137-hq-art[data-tier="3"] .l165-hq-tower,.l137-hq-art[data-tier="4"] .l165-hq-tower,.l137-hq-art[data-tier="5"] .l165-hq-tower{display:block}.l165-hq-tower.nw{left:-9px;top:-9px}.l165-hq-tower.ne{right:-9px;top:-9px}.l165-hq-tower.sw{left:-9px;bottom:-9px}.l165-hq-tower.se{right:-9px;bottom:-9px}.l137-hq-art[data-tier="5"] .l165-hq-tower{width:23px;height:23px;border-color:#7ef8ff;background:#274b50}.l137-hq-lv{position:absolute;bottom:7px;font:9px "Share Tech Mono",monospace;color:#9cecff;letter-spacing:.4px}' +
      '.l137-panel{flex:1;min-height:0;padding:15px;border:1px solid rgba(34,212,255,.22);border-radius:20px;background:rgba(6,16,23,.93);overflow:auto}.l137-kicker{font:8px "Share Tech Mono",monospace;letter-spacing:2px;color:#ffd166}.l137-h2{font-size:23px;font-weight:900;margin:3px 0 8px}.l137-copy{font:9px/1.55 "Share Tech Mono",monospace;color:#9eb1ba}.l137-card{margin-top:12px;padding:13px;border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.035)}' +
      '.l137-card-row{display:flex;justify-content:space-between;gap:12px;align-items:center}.l137-card b{font-size:15px}.l137-card small{display:block;font:8px/1.4 "Share Tech Mono",monospace;color:#82949d}.l137-btn{border:1px solid rgba(34,212,255,.35);border-radius:10px;padding:10px 13px;background:#103a4a;color:white;font:800 12px Rajdhani,sans-serif;white-space:nowrap}.l137-btn.good{background:#116c3b;border-color:#1ee873}.l137-btn:disabled{opacity:.38}.l137-deploy{width:100%;margin-top:14px;padding:14px;font-size:16px}' +
      '.l161-power-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.l161-power-metric{padding:9px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:rgba(0,0,0,.18)}.l161-power-metric span{display:block;font:7px "Share Tech Mono",monospace;letter-spacing:1px;color:#82949d}.l161-power-metric strong{display:block;margin-top:2px;font-size:22px;line-height:1;color:#fff}.l161-power-state{margin-top:8px;padding:8px 10px;border-radius:8px;text-align:center;font:800 10px "Share Tech Mono",monospace;letter-spacing:1px}.l161-power-state.underpowered{color:#ff8e78;background:rgba(140,39,26,.28);border:1px solid rgba(255,91,68,.38)}.l161-power-state.ready{color:#7fffae;background:rgba(17,108,59,.25);border:1px solid rgba(30,232,115,.34)}.l161-power-state.overmatch{color:#8fefff;background:rgba(16,91,117,.3);border:1px solid rgba(34,212,255,.4)}' +
      '.l165-research-points{margin:10px 0;padding:10px 12px;border:1px solid rgba(255,209,102,.48);border-radius:10px;background:rgba(106,74,12,.22)}.l165-research-points b,.l165-research-points span{display:block}.l165-research-points b{color:#ffd166;font-size:13px}.l165-research-points span{margin-top:3px;color:#bac8cd;font:7px/1.45 "Share Tech Mono",monospace}.l165-research-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:10px}.l165-research-summary div{padding:7px 4px;border:1px solid rgba(255,255,255,.09);border-radius:8px;background:rgba(0,0,0,.18);text-align:center}.l165-research-summary span,.l165-research-summary b{display:block}.l165-research-summary span{font:6px "Share Tech Mono",monospace;color:#82949d}.l165-research-summary b{margin-top:3px;font-size:12px;color:#fff}.l165-legacy-note{margin-top:6px;text-align:center;color:#8fefff;font:7px "Share Tech Mono",monospace}.l165-research-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:12px}.l165-research-tab{padding:8px 3px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:#09141b;color:#8da2ab;font:800 9px Rajdhani,sans-serif}.l165-research-tab span,.l165-research-tab small{display:block}.l165-research-tab small{margin-top:2px;font:6px "Share Tech Mono",monospace}.l165-research-tab.active{color:#fff;border-color:#22d4ff;background:#103040}.l165-branch-head{margin-top:11px}.l165-branch-head b,.l165-branch-head span{display:block}.l165-branch-head b{color:#ffd166;font-size:15px}.l165-branch-head span{font:7px/1.4 "Share Tech Mono",monospace;color:#8fa3ac}.l165-research-tree{display:grid;gap:7px;margin-top:8px}.l165-research-node{position:relative;padding:10px 10px 10px 42px;border:1px solid rgba(34,212,255,.28);border-radius:10px;background:rgba(12,28,36,.94)}.l165-research-node:before{content:"";position:absolute;left:19px;top:0;bottom:-8px;width:2px;background:rgba(34,212,255,.23)}.l165-research-node:last-child:before{bottom:50%}.l165-research-node:after{content:"";position:absolute;left:13px;top:21px;width:12px;height:12px;border:2px solid #22d4ff;border-radius:50%;background:#071119;box-shadow:0 0 8px rgba(34,212,255,.4)}.l165-research-node.complete{border-color:rgba(30,232,115,.42);background:rgba(15,70,43,.25)}.l165-research-node.complete:after{border-color:#1ee873;background:#1a9151}.l165-research-node.locked{opacity:.48;border-color:rgba(255,255,255,.1)}.l165-research-node.locked:after{border-color:#68757b;box-shadow:none}.l165-node-tier{color:#74e9ff;font:6px "Share Tech Mono",monospace;letter-spacing:1.3px}.l165-node-name{margin-top:2px;font-size:15px;font-weight:800}.l165-node-effect{margin:2px 0 7px;color:#aebcc1;font:7px/1.4 "Share Tech Mono",monospace}.l165-node-action{width:100%;padding:7px;border:1px solid rgba(30,232,115,.44);border-radius:7px;background:#115b38;color:#fff;font:800 9px Rajdhani,sans-serif}.l165-node-action small{display:block;margin-top:2px;color:#cce0d4;font:6px "Share Tech Mono",monospace}.l165-node-action:disabled{opacity:.55;background:#18242a;border-color:rgba(255,255,255,.12)}' +
      '.l166-research-tier{position:relative;margin-top:8px;padding-top:14px}.l166-research-tier:before{content:"";position:absolute;left:50%;top:-8px;width:1px;height:17px;background:rgba(34,212,255,.28)}.l166-research-tier:first-child:before{display:none}.l166-tier-label{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);z-index:2;padding:2px 7px;border:1px solid rgba(34,212,255,.3);border-radius:10px;background:#071119;color:#74e9ff;font:6px "Share Tech Mono",monospace;letter-spacing:1px;white-space:nowrap}.l166-tier-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.l166-research-tier.single .l166-tier-grid{grid-template-columns:1fr}.l166-research-tier.capstone .l166-tier-label{color:#ffd166;border-color:rgba(255,209,102,.48)}.l165-research-node{padding:9px;min-width:0}.l165-research-node:before,.l165-research-node:after{display:none}.l165-research-node.capstone{border-color:rgba(255,209,102,.62);background:linear-gradient(145deg,rgba(91,65,12,.44),rgba(12,28,36,.96));box-shadow:0 0 15px rgba(255,209,102,.1)}.l165-research-node.capstone.complete{border-color:#1ee873;background:linear-gradient(145deg,rgba(15,92,50,.42),rgba(12,28,36,.96))}.l165-node-name{font-size:13px;line-height:1.05}.l165-node-effect{min-height:39px;font-size:6.5px}.l166-node-preview{margin:-2px 0 6px;padding:4px 5px;border-radius:5px;background:rgba(0,0,0,.22);color:#8fefff;font:5.5px/1.3 "Share Tech Mono",monospace}.l165-research-node.complete .l166-node-preview{color:#7fffae}.l166-node-requires{min-height:17px;margin:-2px 0 6px;color:#f2b567;font:5.5px/1.35 "Share Tech Mono",monospace}.l165-research-node.complete .l166-node-requires{color:#78dca3}.l165-node-action{padding:6px 4px;font-size:8px}.l165-node-action small{font-size:5.5px}.l166-research-header{scroll-margin-top:0}.l166-research-footnote{margin-top:10px;padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#82949d;font:6px/1.45 "Share Tech Mono",monospace;text-align:center}' +
      '.l167-equipment-notice{margin:9px 0;padding:9px;border:1px solid rgba(255,209,102,.58);border-radius:9px;background:rgba(92,65,14,.28);color:#ffd166;font:7px/1.45 "Share Tech Mono",monospace}.l167-equipped-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:11px}.l167-equipped-slot{min-width:0;padding:8px 5px;border:1px solid rgba(34,212,255,.25);border-radius:10px;background:rgba(7,22,29,.92);text-align:center;color:#8fa4ad}.l167-equipped-slot.filled{color:#fff;border-color:rgba(30,232,115,.38);background:rgba(14,55,38,.45)}.l167-equipped-slot .l167-equipment-icon{width:25px;height:25px;margin:auto}.l167-equipped-slot span,.l167-equipped-slot b,.l167-equipped-slot small{display:block}.l167-equipped-slot span{margin-top:4px;color:#74e9ff;font:6px "Share Tech Mono",monospace}.l167-equipped-slot b{margin-top:3px;font-size:10px;line-height:1.05}.l167-equipped-slot small{margin-top:3px;color:#8598a1;font:5.5px/1.35 "Share Tech Mono",monospace}.l167-equipment-icon{width:30px;height:30px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.l167-inventory-summary{display:flex;justify-content:space-between;gap:8px;margin-top:9px;padding:7px 9px;border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#8fa3ac;font:6px "Share Tech Mono",monospace}.l167-inventory-summary strong{color:#fff}.l167-inventory-summary.over{border-color:#ff765e;color:#ff927f}.l167-inventory-filters{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:9px}.l167-filter{padding:6px 2px;border:1px solid rgba(255,255,255,.1);border-radius:7px;background:#09141b;color:#80939c;font:800 7px Rajdhani,sans-serif}.l167-filter.active{color:#fff;border-color:#22d4ff;background:#103040}.l167-inventory-list{display:grid;gap:7px;margin-top:8px}.l167-item-card{padding:9px;border:1px solid #63727a;border-radius:10px;background:#111d23;color:#fff}.l167-item-card.epic{border-color:#955fe0;background:#21152f}.l167-item-card.legendary{border-color:#d5a73a;background:#30250e}.l167-item-card.selected{box-shadow:0 0 0 1px #22d4ff,0 0 15px rgba(34,212,255,.16)}.l167-item-card.equipped{box-shadow:inset 3px 0 0 #1ee873}.l167-item-head{display:flex;align-items:center;gap:9px}.l167-item-head .l167-equipment-icon{flex:0 0 auto}.l167-item-copy{flex:1;min-width:0}.l167-item-copy small,.l167-item-copy b,.l167-item-copy span{display:block}.l167-item-copy small{color:#aab4b9;font:6px "Share Tech Mono",monospace;letter-spacing:1px}.l167-item-card.epic .l167-item-copy small{color:#ca9bff}.l167-item-card.legendary .l167-item-copy small{color:#ffd166}.l167-item-copy b{margin-top:2px;font-size:14px;line-height:1}.l167-item-copy span{margin-top:3px;color:#b4c0c5;font:7px/1.35 "Share Tech Mono",monospace}.l167-item-state{flex:0 0 auto;color:#7fffae;font:6px "Share Tech Mono",monospace;text-align:right}.l167-item-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08)}.l167-item-action{padding:7px 3px;border:1px solid rgba(34,212,255,.32);border-radius:7px;background:#103444;color:#fff;font:800 8px Rajdhani,sans-serif}.l167-item-action.good{border-color:#1ee873;background:#11643a}.l167-item-action.salvage{border-color:#a66b37;background:#3d2814}.l167-item-action:disabled{opacity:.35}.l167-empty{padding:18px 10px;border:1px dashed rgba(255,255,255,.16);border-radius:10px;color:#84969e;text-align:center;font:7px/1.5 "Share Tech Mono",monospace}.l167-result-survival{margin-top:5px;color:#8fefff!important}.l167-result-drop{margin-top:9px;padding:9px;border:1px solid #66747b;border-radius:10px;background:#111d23;text-align:left}.l167-result-drop.epic{border-color:#955fe0;background:#21152f}.l167-result-drop.legendary{border-color:#d5a73a;background:#30250e}.l167-result-drop-head{display:flex;align-items:center;gap:9px}.l167-result-drop .l167-equipment-icon{flex:0 0 auto}.l167-result-drop-copy{flex:1;min-width:0}.l167-result-drop-copy small,.l167-result-drop-copy b,.l167-result-drop-copy span{display:block}.l167-result-drop-copy small{color:#ffd166;font:6px "Share Tech Mono",monospace;letter-spacing:1px}.l167-result-drop-copy b{font-size:14px}.l167-result-drop-copy span{color:#bac4c8;font:7px/1.35 "Share Tech Mono",monospace}.l167-result-drop button{width:100%;margin-top:7px;padding:7px;border:1px solid #1ee873;border-radius:7px;background:#11643a;color:#fff;font:800 9px Rajdhani,sans-serif}.l167-result-drop button:disabled{opacity:.55}' +
      '.l168-commander-notice{margin:0 0 9px;padding:8px 10px;border:1px solid rgba(255,209,102,.52);border-radius:9px;background:rgba(84,62,18,.28);color:#ffd166;font:7px/1.45 "Share Tech Mono",monospace}.l168-command-profile{display:grid;grid-template-columns:72px 1fr;gap:11px;align-items:center;margin-top:10px;padding:11px;border:1px solid rgba(34,212,255,.3);border-radius:13px;background:linear-gradient(145deg,rgba(21,62,67,.54),rgba(6,17,23,.96))}.l168-command-portrait{position:relative;width:68px;height:76px;border:1px solid #d7bd75;border-radius:18px 18px 10px 10px;background:radial-gradient(circle at 50% 25%,#5b8074,#14272a 57%,#081116);overflow:hidden}.l168-command-portrait:before{content:"";position:absolute;left:50%;top:10px;width:22px;height:22px;transform:translateX(-50%);border-radius:50%;background:#314b46;box-shadow:0 24px 0 9px #365e55}.l168-command-portrait:after{content:"";position:absolute;left:50%;bottom:7px;width:46px;height:8px;transform:translateX(-50%);border-radius:7px;background:#ffd166;box-shadow:0 -18px 0 -2px #193d3d}.l168-command-portrait[data-tier="2"]:before{width:24px;height:24px;box-shadow:0 24px 0 10px #3c695e}.l168-command-portrait[data-tier="3"]:before{width:25px;height:25px;box-shadow:0 24px 0 12px #477669}.l168-command-portrait[data-tier="4"]:before,.l168-command-portrait[data-tier="5"]:before{width:26px;height:26px;box-shadow:0 24px 0 14px #527f72}.l168-command-portrait[data-tier="5"]{border-color:#7ef8ff;box-shadow:0 0 17px rgba(71,231,255,.34)}.l168-command-info small,.l168-command-info b,.l168-command-info span{display:block}.l168-command-info small{color:#74e9ff;font:6px "Share Tech Mono",monospace;letter-spacing:1.2px}.l168-command-info b{margin-top:2px;font-size:20px;line-height:1}.l168-command-info span{margin-top:4px;color:#b5c3c8;font:7px/1.4 "Share Tech Mono",monospace}.l168-mastery-track{height:6px;margin-top:8px;border-radius:6px;background:#172930;overflow:hidden}.l168-mastery-fill{height:100%;background:linear-gradient(90deg,#22d4ff,#ffd166)}.l168-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}.l168-stat-grid div{padding:8px 4px;border:1px solid rgba(255,255,255,.09);border-radius:8px;background:rgba(0,0,0,.2);text-align:center}.l168-stat-grid span,.l168-stat-grid b{display:block}.l168-stat-grid span{color:#83969f;font:5.5px "Share Tech Mono",monospace}.l168-stat-grid b{margin-top:3px;color:#fff;font-size:13px}.l168-milestones{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:10px}.l168-milestone{padding:6px 2px;border:1px solid rgba(255,255,255,.1);border-radius:7px;color:#71838c;text-align:center;font:5.5px/1.3 "Share Tech Mono",monospace}.l168-milestone.active{color:#fff;border-color:#d7bd75;background:rgba(90,66,18,.32)}.l168-signature{margin-top:9px;padding:9px;border:1px solid rgba(34,212,255,.28);border-radius:9px;background:rgba(7,29,38,.7)}.l168-signature b,.l168-signature span{display:block}.l168-signature b{color:#8fefff;font-size:13px}.l168-signature span{margin-top:3px;color:#aab9bf;font:7px/1.4 "Share Tech Mono",monospace}.l168-signature.locked{opacity:.54}.l168-command-gear{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:9px}.l168-command-gear div{min-width:0;padding:6px;border:1px solid rgba(255,255,255,.08);border-radius:7px;background:rgba(0,0,0,.18)}.l168-command-gear small,.l168-command-gear b{display:block}.l168-command-gear small{color:#74e9ff;font:5.5px "Share Tech Mono",monospace}.l168-command-gear b{overflow:hidden;margin-top:2px;font-size:8px;white-space:nowrap;text-overflow:ellipsis}.l168-upgrade-card{margin-top:9px}.l168-compare{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}.l168-compare span{padding:3px 5px;border-radius:5px;background:rgba(255,255,255,.06);font:5.5px "Share Tech Mono",monospace}.l168-compare .gain{color:#7fffae;background:rgba(30,160,90,.16)}.l168-compare .loss{color:#ff9b88;background:rgba(190,62,42,.15)}.l168-compare .even{color:#95a6ad}.l168-boss-hud .l139-progress-track{height:10px;border:1px solid rgba(255,209,102,.7);background:#2b0e0e;box-shadow:0 0 15px rgba(255,56,42,.24)}.l168-boss-hud .l139-progress-fill{background:linear-gradient(90deg,#ff392f,#b61d1d)!important;box-shadow:0 0 12px #ff3d2f!important}.l168-boss-hud .l139-progress-text{color:#ffd166;font-weight:700}.l168-boss-hud{height:40px}' +
      '.l137-nav{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:10px}.l137-nav button{padding:9px 2px;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:#09141b;color:#91a7b1;font:700 9px Rajdhani,sans-serif}.l137-nav button.active{color:#fff;border-color:#22d4ff;background:#103040}' +
      '#lsc137-result{position:fixed;z-index:32000;inset:0;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,4,7,.9);backdrop-filter:blur(8px)}#lsc137-result.show{display:flex}.l137-result-card{width:min(420px,100%);max-height:calc(100vh - 44px);overflow:auto;box-sizing:border-box;padding:22px;border:1px solid rgba(34,212,255,.35);border-radius:20px;background:#08131a;text-align:center}.l137-result-card h2{font-size:28px;margin:3px}.l137-actions{display:grid;gap:8px;margin-top:17px}' +
      '#hq-upgrade-overlay{position:fixed;z-index:31000;inset:0;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,4,8,.86)}#hq-upgrade-overlay.show{display:flex}.hq-upgrade-modal{width:min(420px,100%);padding:18px;border:1px solid #846e36;border-radius:18px;background:#09131a}.hq-upgrade-title{text-align:center;font-size:23px;font-weight:900}.hq-upgrade-sub{text-align:center;color:#ffd166;font:8px "Share Tech Mono",monospace;margin-bottom:12px}.hq-upgrade-grid{display:grid;gap:8px}.hq-upgrade-choice{text-align:left;padding:12px;border:1px solid #64727a;border-radius:11px;background:#121d23;color:#fff;box-shadow:inset 3px 0 0 #7e8a90}.hq-upgrade-choice b,.hq-upgrade-choice span,.hq-upgrade-choice small{display:block}.hq-upgrade-choice b{font-size:15px}.hq-upgrade-choice span{font:8px/1.45 "Share Tech Mono",monospace;color:#b8c2c7}.hq-upgrade-choice small{margin-bottom:4px;font:7px "Share Tech Mono",monospace;letter-spacing:1.5px;color:#aab4b9}.hq-upgrade-choice.epic{border-color:#8f58d8;background:#21152f;box-shadow:inset 3px 0 0 #b477ff,0 0 14px rgba(164,92,255,.12)}.hq-upgrade-choice.epic small{color:#c99aff}.hq-upgrade-choice.legendary{border-color:#c79c32;background:#30250e;box-shadow:inset 3px 0 0 #ffd166,0 0 16px rgba(255,209,102,.14)}.hq-upgrade-choice.legendary small{color:#ffd166}' +
      '#lsc137-ability,#lsc168-command{position:absolute;z-index:35;bottom:48px;width:68px;height:68px;border:2px solid #ffd166;border-radius:50%;color:white;font:800 9px Rajdhani,sans-serif}#lsc137-ability{right:14px;background:#513d0e;box-shadow:0 0 25px rgba(255,209,102,.25)}#lsc168-command{right:91px;border-color:#62e8ff;background:#0a4352;box-shadow:0 0 25px rgba(34,212,255,.22)}#lsc137-ability:disabled,#lsc168-command:disabled{opacity:.35}' +
      '#l140-controls{position:absolute;z-index:42;right:12px;top:calc(env(safe-area-inset-top,0px) + 18px);display:flex;gap:6px}#l139-menu-btn,#l140-speed-btn{height:34px;border:1px solid #58dfff;border-radius:9px;background:rgba(5,18,26,.94);color:#fff;font:800 12px Rajdhani,sans-serif}#l139-menu-btn{width:38px;font-size:18px}#l140-speed-btn{width:42px;color:#ffd166}' +
      '#l139-pause{position:fixed;z-index:33000;inset:0;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,4,8,.9);backdrop-filter:blur(8px)}#l139-pause.show{display:flex}.l139-pause-card{width:min(400px,100%);padding:20px;border:1px solid rgba(34,212,255,.4);border-radius:18px;background:#08141b}.l139-setting{display:flex;justify-content:space-between;align-items:center;margin:8px 0;padding:10px;border:1px solid rgba(255,255,255,.1);border-radius:9px}.l139-setting button{min-width:58px}' +
      '#lsc161-loading{position:fixed;z-index:32950;inset:0;display:none;place-items:center;padding:24px;background:radial-gradient(circle at 50% 42%,rgba(24,74,89,.78),transparent 38%),linear-gradient(180deg,#07131a,#02070a);color:#fff;text-align:center}#lsc161-loading.show{display:grid}.l161-load-mark{width:82px;height:82px;margin:0 auto 18px;border:2px solid #74e9ff;border-radius:24px;display:grid;place-items:center;color:#ffd166;font-size:31px;font-weight:900;box-shadow:0 0 36px rgba(34,212,255,.25),inset 0 0 22px rgba(34,212,255,.08)}.l161-load-title{font-size:24px;font-weight:900;letter-spacing:1px}.l161-load-copy{margin-top:6px;color:#74e9ff;font:8px "Share Tech Mono",monospace;letter-spacing:1.7px}.l161-load-track{width:min(260px,72vw);height:5px;margin:20px auto 0;overflow:hidden;border-radius:5px;background:#142731}.l161-load-bar{width:44%;height:100%;background:linear-gradient(90deg,transparent,#74e9ff,#ffd166,transparent);animation:l161LoadSweep 1.15s ease-in-out infinite}@keyframes l161LoadSweep{0%{transform:translateX(-115%)}100%{transform:translateX(255%)}}' +
      '.l139-progress{position:absolute;z-index:39;left:12px;right:108px;top:calc(env(safe-area-inset-top,0px) + 17px);height:35px;pointer-events:none}.l139-progress-track{height:6px;margin-top:4px;border-radius:6px;background:#182a32;overflow:hidden}.l139-progress-fill{height:100%;background:linear-gradient(90deg,#22d4ff,#18f06a);box-shadow:0 0 10px #22d4ff}.l139-progress-text{font:8px "Share Tech Mono",monospace;color:#fff;display:flex;justify-content:space-between}' +
      '.l171-energy-card{margin-top:10px;padding:11px 12px;border:1px solid rgba(255,209,102,.4);border-radius:13px;background:linear-gradient(145deg,rgba(68,51,17,.32),rgba(7,19,24,.96))}.l171-energy-head{display:flex;align-items:end;justify-content:space-between;gap:12px}.l171-energy-head b{color:#ffd166;font-size:14px}.l171-energy-head strong{font-size:20px}.l171-energy-copy{display:flex;justify-content:space-between;gap:8px;margin-top:3px;color:#97a7ad;font:6px "Share Tech Mono",monospace}.l171-energy-pips{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:9px}.l171-energy-pips i{height:6px;border-radius:6px;background:#17272d;box-shadow:inset 0 0 0 1px rgba(255,255,255,.05)}.l171-energy-pips i.full{background:#ffd166;box-shadow:0 0 8px rgba(255,209,102,.34)}.l171-operation-card{margin-top:10px;padding:12px;border:1px solid rgba(34,212,255,.34);border-radius:13px;background:linear-gradient(145deg,rgba(8,43,54,.74),rgba(6,16,22,.98))}.l171-operation-card h3{margin:2px 0 4px;color:#84efff;font-size:18px}.l171-operation-card p{margin:0;color:#aab8bd;font:7px/1.45 "Share Tech Mono",monospace}.l171-operation-state{display:flex;justify-content:space-between;gap:8px;margin:9px 0;padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:8px;font:6px "Share Tech Mono",monospace}.l171-operation-state span:last-child{text-align:right;color:#9cecff}.l171-pass-placeholder{margin-top:9px;padding:9px;border:1px dashed rgba(255,209,102,.35);border-radius:9px;color:#9eaaae;font:6px/1.4 "Share Tech Mono",monospace}.l171-pass-placeholder b{display:block;color:#ffd166;font-size:8px}.l171-energy-row{color:#ffd166!important}.l172-operation-mode #lsc168-command{border-color:#63efff;background:#073f50}.l172-operation-mode #lsc137-ability{border-color:#ffd166;background:#503b0b}.l172-operation-mode .l168-boss-hud .l139-progress-track{border-color:#ff9f54}.l172-operation-mode .l139-progress-fill{background:linear-gradient(90deg,#45e7ff,#68ffa9)}'+
      '.l175-qa-banner{margin-bottom:10px;padding:9px 11px;border:1px solid rgba(255,209,102,.6);border-radius:10px;background:rgba(78,55,8,.45);color:#d7e1e4;font:7px/1.45 "Share Tech Mono",monospace}.l175-qa-banner b{display:block;color:#ffd166;font-size:9px}.l175-qa-energy{box-shadow:0 0 18px rgba(255,209,102,.12)}.l175-operation-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:9px 0}.l175-operation-grid div{padding:7px 4px;border:1px solid rgba(255,255,255,.08);border-radius:8px;text-align:center}.l175-operation-grid span{display:block;color:#7e939a;font:6px "Share Tech Mono",monospace}.l175-operation-grid b{display:block;margin-top:2px;color:#eef6f7;font-size:12px}.l175-operation-notice{margin:8px 0;padding:8px;border:1px solid rgba(83,244,162,.55);border-radius:8px;background:rgba(13,80,51,.28);color:#9ff7c8;font:7px/1.4 "Share Tech Mono",monospace}.l175-operation-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.l175-operation-actions .l137-btn{margin-top:0;min-height:47px;padding:8px 5px;font-size:9px}.l175-auto-copy{margin:7px 0;color:#94a5aa;font:6px/1.4 "Share Tech Mono",monospace}.l175-no-reward{padding:8px;color:#9cecff;font:10px "Share Tech Mono",monospace;text-align:center}'+
      '.l176-ops-launch{position:absolute;left:0;bottom:25px;width:76px;min-height:58px;padding:7px 5px;border:1px solid rgba(34,212,255,.65);border-radius:13px;background:linear-gradient(145deg,rgba(7,57,72,.95),rgba(5,18,25,.98));color:#fff;box-shadow:0 0 20px rgba(34,212,255,.14);text-align:center}.l176-ops-launch span,.l176-ops-launch b,.l176-ops-launch small{display:block}.l176-ops-launch span{width:25px;height:25px;margin:0 auto 3px;display:grid;place-items:center;border:1px solid #7cecff;border-radius:50%;color:#ffd166;font:800 7px "Share Tech Mono",monospace}.l176-ops-launch b{font-size:9px;line-height:1}.l176-ops-launch small{margin-top:3px;color:#8fefff;font:6px "Share Tech Mono",monospace}.l176-energy-selector{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:9px}.l176-energy-selector button{padding:7px 2px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:#0b171d;color:#82949d}.l176-energy-selector button b,.l176-energy-selector button span{display:block}.l176-energy-selector button b{font-size:14px}.l176-energy-selector button span{font:6px "Share Tech Mono",monospace}.l176-energy-selector button.active{border-color:#ffd166;background:#4b3910;color:#fff;box-shadow:0 0 12px rgba(255,209,102,.18)}.l176-energy-selector button:disabled{opacity:.28}.l176-energy-value{margin-top:8px;padding:8px;border:1px solid rgba(255,209,102,.22);border-radius:8px;text-align:center}.l176-energy-value b,.l176-energy-value span{display:block}.l176-energy-value b{color:#ffd166;font-size:11px}.l176-energy-value span{margin-top:3px;color:#91a3aa;font:6px/1.4 "Share Tech Mono",monospace}.l176-ops-back{margin-bottom:10px;padding:7px 10px}.l176-ops-summary{margin:10px 0;padding:10px;border:1px solid rgba(34,212,255,.25);border-radius:10px;background:rgba(9,41,52,.35);color:#9cecff;font:7px/1.45 "Share Tech Mono",monospace}';
    document.head.appendChild(s);
    var operationsStyle=document.createElement('style');
    operationsStyle.id='lsc177-operations-style';
    operationsStyle.textContent=
      '#lsc137-app.l177-operations-mode{background:radial-gradient(circle at 50% 8%,#164050 0,#081820 36%,#02070a 100%)}'+
      '#lsc137-app.l177-operations-mode .l137-shell{padding:calc(env(safe-area-inset-top,0px) + 10px) 12px calc(env(safe-area-inset-bottom,0px) + 10px)}'+
      '#lsc137-app.l177-operations-mode .l137-top,#lsc137-app.l177-operations-mode .l137-hero,#lsc137-app.l177-operations-mode .l137-nav{display:none!important}'+
      '#lsc137-app.l177-operations-mode .l137-panel{padding:0;border:0;border-radius:0;background:transparent;overflow:auto;overscroll-behavior:contain}'+
      '.l177-ops-screen{width:min(560px,100%);min-height:100%;margin:0 auto;padding-bottom:4px;box-sizing:border-box}'+
      '.l177-ops-header{position:sticky;top:0;z-index:4;padding:2px 0 10px;background:linear-gradient(180deg,#0b2632 0,rgba(8,24,32,.98) 72%,rgba(8,24,32,0) 100%)}'+
      '.l177-ops-nav{display:flex;align-items:center;justify-content:space-between;gap:10px}.l177-ops-back{margin:0;padding:8px 10px;border-color:rgba(116,233,255,.55);background:#0b2b38}.l177-ops-status{text-align:right;color:#8fefff;font:7px/1.35 "Share Tech Mono",monospace}.l177-ops-status b{display:block;color:#ffd166;font-size:9px}'+
      '.l177-ops-heading{margin-top:10px}.l177-ops-heading .l137-h2{margin-bottom:4px;font-size:28px}.l177-ops-heading .l137-copy{max-width:480px}'+
      '.l177-ops-resources{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}.l177-ops-resource{min-width:0;padding:8px 4px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:rgba(2,10,14,.58);text-align:center}.l177-ops-resource .l166-resource{justify-content:center}.l177-ops-resource .l166-resource b{font-size:11px}'+
      '.l177-ops-screen>.l175-qa-banner{margin:4px 0 8px}.l177-ops-screen>.l176-ops-summary{margin:8px 0}.l177-ops-screen>.l171-operation-card{margin-top:8px}.l177-ops-screen>.l171-pass-placeholder{margin-bottom:2px}'+
      '@media (max-height:700px){.l177-ops-heading{margin-top:6px}.l177-ops-heading .l137-h2{font-size:24px}.l177-ops-resources{margin-top:7px}.l177-ops-screen>.l175-qa-banner{padding:7px 9px}.l177-ops-screen>.l171-operation-card{padding:10px}}';
    document.head.appendChild(operationsStyle);
    var researchStyle=document.createElement('style');
    researchStyle.id='lsc180-research-style';
    researchStyle.textContent=
      '#lsc137-app.l180-research-mode .l137-hero{display:none!important}'+
      '#lsc137-app.l180-research-mode .l137-panel{padding-top:10px}'+
      '.l180-research-header{display:flex;align-items:flex-end;justify-content:space-between;gap:8px}.l180-research-header .l137-h2{margin:2px 0 2px;font-size:21px}.l180-research-header .l137-copy{font-size:7px;line-height:1.35}'+
      '.l180-research-count{flex:0 0 auto;padding:6px 8px;border:1px solid rgba(116,233,255,.25);border-radius:9px;text-align:center}.l180-research-count b,.l180-research-count span{display:block}.l180-research-count b{font-size:15px}.l180-research-count span{font:5.5px "Share Tech Mono",monospace;color:#8da1a8}'+
      '.l180-research-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:7px}.l180-research-summary div{min-width:0;padding:5px 2px;border:1px solid rgba(255,255,255,.08);border-radius:7px;background:rgba(0,0,0,.18);text-align:center}.l180-research-summary span,.l180-research-summary b{display:block}.l180-research-summary span{font:5px "Share Tech Mono",monospace;color:#7f939a}.l180-research-summary b{margin-top:1px;font-size:10px}'+
      '.l180-doctrine-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:8px}.l180-doctrine-column{min-width:0;padding:5px 3px 6px;border:1px solid rgba(34,212,255,.25);border-radius:11px;background:linear-gradient(180deg,rgba(8,35,45,.78),rgba(5,15,20,.92))}'+
      '.l180-doctrine-head{display:flex;align-items:center;justify-content:space-between;gap:3px;padding:0 2px 4px;border-bottom:1px solid rgba(255,255,255,.08)}.l180-doctrine-head b{color:#86edff;font-size:9px}.l180-doctrine-head small{color:#9aa9ad;font:5.5px "Share Tech Mono",monospace}'+
      '.l180-tier-row{position:relative;min-height:48px;padding-top:7px;box-sizing:border-box}.l180-tier-row:before{content:"";position:absolute;top:11px;bottom:-2px;left:50%;width:1px;background:rgba(126,226,247,.16)}.l180-tier-label{position:absolute;z-index:1;top:1px;left:50%;transform:translateX(-50%);padding:0 3px;border:1px solid rgba(116,233,255,.18);border-radius:6px;background:#07141a;color:#7699a3;font:4.5px "Share Tech Mono",monospace}'+
      '.l180-tier-nodes{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:3px}.l180-node{width:42px;height:42px;min-width:42px;padding:3px 1px;border:1px solid #3a4d55;border-radius:50%;background:rgba(20,33,39,.96);color:#829299;box-sizing:border-box;overflow:hidden}.l180-node b,.l180-node span{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis}.l180-node b{font:800 10px/1 Rajdhani,sans-serif;white-space:nowrap}.l180-node span{margin-top:2px;font:4.5px/1.05 "Share Tech Mono",monospace;white-space:normal}'+
      '.l180-node.complete{border-color:#27dc80;background:rgba(13,78,55,.86);color:#c8ffe0}.l180-node.available{border-color:#42dfff;background:rgba(7,55,71,.94);color:#d5f9ff}.l180-node.locked{border-color:#35474e;background:rgba(17,28,33,.82);color:#64757c}.l180-node.capstone{width:46px;height:46px;border-color:#c69d3b;background:rgba(61,46,11,.88);color:#ffe7a3}.l180-node.selected{box-shadow:0 0 0 2px #edfaff,0 0 12px rgba(72,226,255,.5)}'+
      '.l180-grid-legend{display:flex;justify-content:center;gap:9px;margin:6px 0 0;color:#82969d;font:5px "Share Tech Mono",monospace}.l180-grid-legend i{display:inline-block;width:6px;height:6px;margin-right:3px;border:1px solid;border-radius:50%;vertical-align:-1px}.l180-grid-legend .done i{border-color:#27dc80;background:#165f45}.l180-grid-legend .ready i{border-color:#42dfff;background:#0d556b}.l180-grid-legend .blocked i{border-color:#47575e;background:#202d32}'+
      '.l180-selection-tray{margin-top:7px;padding:8px;border:1px solid rgba(34,212,255,.45);border-radius:11px;background:linear-gradient(145deg,rgba(7,38,49,.92),rgba(5,15,20,.98))}.l180-selection-tray.complete{border-color:rgba(39,220,128,.65)}.l180-selection-tray.capstone{border-color:rgba(214,173,74,.75)}'+
      '.l180-selection-top{display:flex;align-items:center;justify-content:space-between;gap:7px}.l180-selection-title{min-width:0}.l180-selection-title small{display:block;color:#85ddec;font:5.5px "Share Tech Mono",monospace}.l180-selection-title h3{margin:1px 0 0;font-size:17px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.l180-selection-state{flex:0 0 auto;padding:3px 6px;border:1px solid rgba(255,255,255,.14);border-radius:8px;color:#b8c7cb;font:5.5px "Share Tech Mono",monospace}'+
      '.l180-selection-stats{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}.l180-selection-stats span{display:flex;flex:1 1 82px;align-items:baseline;justify-content:center;gap:4px;padding:4px;border:1px solid rgba(116,233,255,.15);border-radius:7px;background:rgba(0,0,0,.2);color:#aebdc2;font:5px "Share Tech Mono",monospace}.l180-selection-stats b{color:#ffd166;font:800 11px Rajdhani,sans-serif}.l180-selection-tray.complete .l180-selection-stats b{color:#7fffae}'+
      '.l180-selection-meta{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:5px;color:#8ea2a8;font:5.5px/1.25 "Share Tech Mono",monospace}.l180-selection-meta span:last-child{text-align:right;color:#ffd166}'+
      '.l180-selection-tray .l165-node-action{min-height:38px;padding:6px;font-size:9px}.l180-selection-tray .l165-node-action small{font-size:5.5px}.l166-research-footnote{margin-top:6px;font-size:5.5px}'+
      '@media(max-width:380px){.l180-doctrine-board{gap:3px}.l180-doctrine-column{padding-left:2px;padding-right:2px}.l180-node{width:39px;height:39px;min-width:39px}.l180-node.capstone{width:43px;height:43px}.l180-node b{font-size:9px}.l180-node span{font-size:4px}}';
    document.head.appendChild(researchStyle);
  }

  function installReleaseStyles(){
    var releaseStyle=document.createElement('style');
    releaseStyle.id='lsc181-release-style';
    releaseStyle.textContent=
      '.l181-store-launch{position:absolute;right:0;bottom:25px;width:76px;min-height:58px;padding:7px 5px;border:1px solid rgba(255,209,102,.68);border-radius:13px;background:linear-gradient(145deg,rgba(77,56,12,.94),rgba(8,20,25,.98));color:#fff;box-shadow:0 0 20px rgba(255,209,102,.13);text-align:center}.l181-store-launch span,.l181-store-launch b,.l181-store-launch small{display:block}.l181-store-launch span{width:25px;height:25px;margin:0 auto 3px;display:grid;place-items:center;border:1px solid #ffd166;border-radius:50%;color:#8fefff;font:800 5.5px "Share Tech Mono",monospace}.l181-store-launch b{font-size:9px;line-height:1}.l181-store-launch small{margin-top:3px;color:#ffd166;font:6px "Share Tech Mono",monospace}'+
      '#lsc137-app.l181-store-mode{background:radial-gradient(circle at 50% 8%,#3a3015 0,#0b1b22 37%,#02070a 100%)}#lsc137-app.l181-store-mode .l137-shell{padding:calc(env(safe-area-inset-top,0px) + 10px) 12px calc(env(safe-area-inset-bottom,0px) + 10px)}#lsc137-app.l181-store-mode .l137-top,#lsc137-app.l181-store-mode .l137-hero,#lsc137-app.l181-store-mode .l137-nav{display:none!important}#lsc137-app.l181-store-mode .l137-panel{padding:0;border:0;border-radius:0;background:transparent;overflow:auto;overscroll-behavior:contain}'+
      '.l181-store-screen{width:min(560px,100%);min-height:100%;margin:0 auto;padding-bottom:6px;box-sizing:border-box}.l181-store-header{position:sticky;top:0;z-index:4;padding:2px 0 10px;background:linear-gradient(180deg,#172a2d 0,rgba(10,26,32,.98) 72%,rgba(10,26,32,0) 100%)}.l181-store-nav{display:flex;align-items:center;justify-content:space-between;gap:10px}.l181-store-state{text-align:right;color:#ffd166;font:7px/1.35 "Share Tech Mono",monospace}.l181-store-state b{display:block;color:#8fefff;font-size:9px}.l181-store-heading{margin-top:10px}.l181-store-heading .l137-h2{font-size:28px;margin-bottom:4px}.l181-store-lock{margin:8px 0;padding:10px;border:1px solid rgba(255,209,102,.55);border-radius:10px;background:rgba(76,55,10,.35);color:#ffd166;font:8px/1.45 "Share Tech Mono",monospace}.l181-store-lock b{display:block;font-size:10px}.l181-store-grid{display:grid;gap:8px;margin-top:8px}.l181-store-card{padding:12px;border:1px solid rgba(34,212,255,.27);border-radius:13px;background:linear-gradient(145deg,rgba(8,42,51,.72),rgba(6,16,22,.98))}.l181-store-card.featured{border-color:rgba(255,209,102,.55);background:linear-gradient(145deg,rgba(75,55,13,.55),rgba(6,16,22,.98))}.l181-store-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.l181-store-card h3{margin:0;font-size:18px}.l181-store-card em{padding:3px 6px;border:1px solid rgba(255,255,255,.14);border-radius:7px;color:#8fefff;font:normal 6px "Share Tech Mono",monospace}.l181-store-card p{margin:5px 0 9px;color:#a6b6bc;font:7px/1.5 "Share Tech Mono",monospace}.l181-store-benefits{display:flex;flex-wrap:wrap;gap:5px}.l181-store-benefits span{padding:5px 7px;border:1px solid rgba(255,255,255,.09);border-radius:7px;background:rgba(0,0,0,.2);color:#d5e0e3;font:6px "Share Tech Mono",monospace}.l181-store-card button{width:100%;margin-top:10px}.l181-store-foot{margin-top:8px;padding:9px;border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#899ca4;text-align:center;font:6px/1.45 "Share Tech Mono",monospace}'+
      '.l181-hq-max{margin-top:10px;padding:14px;border:1px solid rgba(126,248,255,.55);border-radius:16px;background:radial-gradient(circle at 50% 24%,rgba(37,131,143,.3),transparent 47%),linear-gradient(145deg,rgba(10,47,57,.88),rgba(5,16,22,.98));text-align:center;box-shadow:inset 0 0 30px rgba(68,224,242,.08)}.l181-hq-emblem{width:92px;height:92px;margin:3px auto 10px;display:grid;place-items:center;border:2px solid #7ef8ff;border-radius:23px;color:#ffd166;font-size:44px;font-weight:900;box-shadow:0 0 24px rgba(70,228,245,.28),inset 0 0 22px rgba(70,228,245,.12)}.l181-hq-max h3{margin:0;color:#e9feff;font-size:22px}.l181-hq-max-copy{max-width:360px;margin:5px auto 0;color:#a9bcc2;font:7px/1.55 "Share Tech Mono",monospace}.l181-hq-max-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px}.l181-hq-max-stats div{padding:8px 3px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(0,0,0,.2)}.l181-hq-max-stats b,.l181-hq-max-stats span{display:block}.l181-hq-max-stats b{color:#fff;font-size:14px}.l181-hq-max-stats span{margin-top:2px;color:#7f969e;font:5.5px "Share Tech Mono",monospace}.l181-hq-max-status{margin-top:10px;padding:9px;border:1px solid rgba(30,232,115,.45);border-radius:8px;background:rgba(16,94,56,.25);color:#7fffae;font:8px "Share Tech Mono",monospace;letter-spacing:1px}';
    document.head.appendChild(releaseStyle);
  }

  function installJunkyardStyles(){
    if(id('lsc182-junkyard-style'))return;
    var style=document.createElement('style');
    style.id='lsc182-junkyard-style';
    style.textContent=
      '.l182-rotation{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:3px 9px;margin:8px 0;padding:9px 10px;border:1px solid rgba(255,176,67,.38);border-radius:10px;background:linear-gradient(90deg,rgba(86,49,8,.38),rgba(6,22,28,.76));font-family:"Share Tech Mono",monospace}.l182-rotation span{grid-row:1/3;color:#ffbc5c;font-size:7px;letter-spacing:1px}.l182-rotation b{color:#fff;font-size:10px}.l182-rotation i{color:#92a7ae;font-size:6px;font-style:normal}'+
      '.l182-operation-card.junkyard{border-color:rgba(255,166,58,.5);background:linear-gradient(145deg,rgba(77,43,10,.72),rgba(12,20,22,.98))}.l182-operation-card.junkyard h3{color:#ffc469}.l182-objective-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:9px 0}.l182-objective-strip div{min-width:0;padding:8px 4px;border:1px solid rgba(255,181,75,.22);border-radius:8px;background:rgba(0,0,0,.22);text-align:center}.l182-objective-strip.containment div{border-color:rgba(80,229,246,.18)}.l182-objective-strip span,.l182-objective-strip b{display:block}.l182-objective-strip span{color:#8ea0a6;font:5.5px "Share Tech Mono",monospace}.l182-objective-strip b{margin-top:3px;color:#ffd083;font-size:10px}.l182-objective-strip.containment b{color:#91efff}'+
      '.l182-junkyard-screen .l177-ops-heading .l137-kicker{color:#ffb24d}.l182-junkyard-screen .l177-ops-status b{color:#ffbd61}.l182-junkyard-mode #lsc168-command{border-color:#ffbf63;background:#5a360d}.l182-junkyard-mode #lsc137-ability{border-color:#ff684c;background:#5a1710}.l182-junkyard-mode .l139-progress-track{border-color:rgba(255,166,74,.72)}.l182-junkyard-mode .l139-progress-fill{background:linear-gradient(90deg,#ff4f3d,#ffb13f)}.l182-junkyard-mode #lsc-3d-badge{border-color:rgba(255,181,75,.72)!important;color:#ffd083!important}'+
      '@media (max-width:370px){.l182-objective-strip{grid-template-columns:1fr}.l182-objective-strip div{display:flex;align-items:center;justify-content:space-between;padding:6px 8px}.l182-objective-strip b{margin:0}}';
    document.head.appendChild(style);
  }

  function battleHapticsEnabled(){return localStorage.getItem('lsc_haptic_off')!=='1'&&localStorage.getItem('lsc_haptics')!=='off';}
  function syncBattleSettings(){
    var audio=typeof getAudioSettings==='function'?getAudioSettings():{musicEnabled:true,sfxEnabled:true};
    Array.prototype.forEach.call(document.querySelectorAll('#l139-pause [data-setting]'),function(button){
      var enabled=button.dataset.setting==='music'?audio.musicEnabled:button.dataset.setting==='sound'?audio.sfxEnabled:battleHapticsEnabled();
      button.textContent=enabled?'ON':'OFF';
      button.classList.toggle('good',enabled);
      button.setAttribute('aria-pressed',enabled?'true':'false');
    });
  }

  function toggleBattleSetting(setting){
    if(setting==='music'){
      if(typeof ensureAudio==='function')ensureAudio();
      var music=typeof getAudioSettings==='function'?getAudioSettings().musicEnabled:true;
      if(typeof setMusicEnabled==='function')setMusicEnabled(!music);
    }else if(setting==='sound'){
      if(typeof ensureAudio==='function')ensureAudio();
      var effects=typeof getAudioSettings==='function'?getAudioSettings().sfxEnabled:true;
      if(typeof setSfxEnabled==='function')setSfxEnabled(!effects);
      if(!effects)combatSfx('event');
    }else if(setting==='haptics'){
      var enabled=!battleHapticsEnabled();
      localStorage.setItem('lsc_haptic_off',enabled?'0':'1');
      localStorage.setItem('lsc_haptics',enabled?'on':'off');
      if(enabled)combatHaptic('light');
    }
    syncBattleSettings();
    if(run&&run.paused&&typeof suspendAudio==='function')setTimeout(function(){suspendAudio();},100);
  }

  function installUI() {
    var app = document.createElement('div');
    app.id = 'lsc137-app';
    app.innerHTML = '<div class="l137-shell"><div class="l137-top"><div><div class="l137-brand">LAST STAND COMMAND</div><div class="l137-title">COMMAND BASE</div></div><div class="l137-res" id="l137-res"></div></div><div class="l137-hero"><button class="l176-ops-launch" id="l176-ops-launch" aria-label="Open Special Operations"><span>OPS</span><b>SPECIAL OPS</b><small id="l176-ops-badge">READY</small></button><div class="l137-hq-art"><div class="l165-hq-wall"><i class="l165-hq-tower nw"></i><i class="l165-hq-tower ne"></i><i class="l165-hq-tower sw"></i><i class="l165-hq-tower se"></i></div><div class="l165-hq-core"><span>HQ</span></div><i class="l165-hq-mast"></i></div><button class="l181-store-launch" id="l181-store-launch" aria-label="Open Supply Depot"><span>SUPPLY</span><b>DEPOT</b><small>PREVIEW</small></button><div class="l137-hq-lv" id="l137-hq-lv"></div></div><main class="l137-panel" id="l137-panel"></main><nav class="l137-nav" id="l137-nav"><button data-tab="campaign">CAMPAIGN</button><button data-tab="commander">COMMANDER</button><button data-tab="research">RESEARCH</button><button data-tab="hq">HQ</button><button data-tab="inventory">INVENTORY</button></nav></div>';
    document.body.appendChild(app);
    id('l137-nav').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) renderTab(b.dataset.tab); });
    id('l176-ops-launch').onclick=function(){var panel=id('l137-panel');operationsReturnState={tab:activeCommandTab==='operations'?'campaign':activeCommandTab,scrollTop:panel?panel.scrollTop:0};renderTab('operations');};
    id('l181-store-launch').onclick=function(){var panel=id('l137-panel');storeReturnState={tab:activeCommandTab==='store'?'campaign':activeCommandTab,scrollTop:panel?panel.scrollTop:0};renderTab('store');};
    var result = document.createElement('div');
    result.id = 'lsc137-result';
    result.innerHTML = '<div class="l137-result-card"><div class="l137-kicker" id="l137-result-kicker"></div><h2 id="l137-result-title"></h2><p class="l137-copy" id="l137-result-copy"></p><div class="l137-card" id="l137-result-reward"></div><div class="l137-actions"><button class="l137-btn good" id="l141-continue">CONTINUE</button><button class="l137-btn" id="l137-return">RETURN TO COMMAND BASE</button><button class="l137-btn" id="l137-retry">REPLAY PHASE</button></div></div>';
    document.body.appendChild(result);
    id('l141-continue').onclick = function () {
      if(!run)return;
      var operation=!!run.operation,won=!!run.won,phase=run.phase,operationLevel=run.operationLevel,operationKind=run.operationKind||'containment';
      id('lsc137-result').classList.remove('show');
      if(operation){if(won&&QA_TEST_ACCESS)launchPhase({phase:phase,operation:true,operationKind:operationKind,operationLevel:operationLevelFor(operationKind)});else if(won)returnHome();else launchPhase({phase:phase,operation:true,operationLevel:operationLevel,operationKind:operationKind,operationRewardEligible:run.operationRewardEligible});}
      else launchPhase({phase:won?meta.phase:phase});
    };
    id('l137-retry').onclick = function () { var phase = run && run.phase ? run.phase : meta.phase; id('lsc137-result').classList.remove('show'); launchPhase({phase:phase}); };
    id('l137-return').onclick = returnHome;
    var up = document.createElement('div');
    up.id = 'hq-upgrade-overlay';
    up.innerHTML = '<div class="hq-upgrade-modal"><div class="hq-upgrade-title">FIELD PROMOTION</div><div class="hq-upgrade-sub" id="hq-upgrade-sub">SELECT ONE COMBAT UPGRADE</div><div class="hq-upgrade-grid" id="hq-upgrade-grid"></div></div>';
    document.body.appendChild(up);
    var ability = document.createElement('button'); ability.id = 'lsc137-ability'; ability.textContent = 'ARTILLERY'; ability.onclick = useAbility;
    var command = document.createElement('button'); command.id = 'lsc168-command'; command.textContent = 'COMMAND'; command.onclick = useCommandAbility;
    var wrap = id('battlefield-wrap'); if (wrap) {
      wrap.appendChild(ability);
      wrap.appendChild(command);
      var progress=document.createElement('div');progress.className='l139-progress';progress.innerHTML='<div class="l139-progress-text"><span id="l139-progress-label">ASSAULT 1/3</span><span id="l139-progress-count">0 THREATS</span></div><div class="l139-progress-track"><div class="l139-progress-fill" id="l139-progress-fill"></div></div>';wrap.appendChild(progress);
      var controls=document.createElement('div');controls.id='l140-controls';controls.innerHTML='<button id="l140-speed-btn" aria-label="Battle speed">1×</button><button id="l139-menu-btn" aria-label="Battle menu">☰</button>';wrap.appendChild(controls);
      id('l139-menu-btn').onclick=openPause;id('l140-speed-btn').onclick=cycleSpeed;
    }
    var pause=document.createElement('div');pause.id='l139-pause';pause.innerHTML='<div class="l139-pause-card"><div class="l137-kicker">BATTLE PAUSED</div><div class="l137-h2">COMMAND MENU</div><div class="l137-actions"><button class="l137-btn good" id="l139-resume">RESUME BATTLE</button><button class="l137-btn" id="l139-restart">RESTART PHASE</button><button class="l137-btn" id="l139-return">RETURN TO COMMAND BASE</button></div><div class="l137-kicker" style="margin-top:16px">SETTINGS</div><div class="l139-setting"><span>Music</span><button class="l137-btn" data-setting="music">ON</button></div><div class="l139-setting"><span>Sound Effects</span><button class="l137-btn" data-setting="sound">ON</button></div><div class="l139-setting"><span>Haptics</span><button class="l137-btn" data-setting="haptics">ON</button></div></div>';document.body.appendChild(pause);
    id('l139-resume').onclick=closePause;
    id('l139-restart').onclick=function(){if(confirm('Restart this deployment? Current battle progress will be lost.')){var settings=run?{phase:run.phase,operation:!!run.operation,operationKind:run.operationKind,operationLevel:run.operationLevel,operationRewardEligible:run.operationRewardEligible,restart:true,freeRetry:!!run.freeRetry,energyCommitted:run.energyCommitted||0,energySpend:run.energySpend||1,creditMultiplier:run.creditMultiplier||1}:null;closePause();launchPhase(settings);}};
    id('l139-return').onclick=function(){if(confirm('Return to Command Base? Current battle progress will be lost.')){closePause();returnHome();}};
    pause.addEventListener('click',function(e){var b=e.target.closest('[data-setting]');if(!b)return;toggleBattleSetting(b.dataset.setting);});
    syncBattleSettings();
    var loadingScreen=document.createElement('div');loadingScreen.id='lsc161-loading';loadingScreen.setAttribute('aria-hidden','true');loadingScreen.innerHTML='<div><div class="l161-load-mark" id="l172-load-mark">HQ</div><div class="l161-load-title" id="l172-load-title">DEPLOYING TO OUTER PERIMETER</div><div class="l161-load-copy" id="l172-load-copy">INITIALIZING COMMAND SYSTEMS</div><div class="l161-load-track"><div class="l161-load-bar"></div></div></div>';document.body.appendChild(loadingScreen);
  }

  function setSimulationPaused(paused){if(run)run.paused=paused;if(G&&G.state)G.state.paused=paused;}
  function openPause(){if(!run||!run.active)return;setSimulationPaused(true);syncBattleSettings();if(typeof suspendAudio==='function')suspendAudio();id('l139-pause').classList.add('show');combatHaptic('light',120);}
  function closePause(){setSimulationPaused(false);id('l139-pause').classList.remove('show');if(typeof resumeAudio==='function')resumeAudio();}
  function setSpeed(value){if(!run)return;run.speed=value;_gameSpeed=value;var b=id('l140-speed-btn');if(b)b.textContent=value+'×';}
  function cycleSpeed(){if(!run||run.paused)return;setSpeed(run.speed===1?2:run.speed===2?3:1);}

  function showBattleLoading(){var loading=id('lsc161-loading');if(!loading)return;loading.classList.add('show');loading.setAttribute('aria-hidden','false');}
  function hideBattleLoading(){var loading=id('lsc161-loading');if(!loading)return;loading.classList.remove('show');loading.setAttribute('aria-hidden','true');}

  function currentPower() {
    return 320 + Math.max(0, meta.commander - 1) * 24 + (commanderTier(meta.commander)-1)*18 + Math.max(0, meta.hq - 1) * 50 + researchPower() + equipmentPower();
  }
  function recommendedPower(phase) { return BALANCE.recommendedPower(phase); }
  function victoryRewardPreview(phase) {
    var targets=phaseBalance(Math.max(1,Number(phase)||1)).targets;
    return BALANCE.campaignBaseCredits(phase,targets.reduce(function(total,count){return total+count;},0)+1);
  }
  function victoryPartPreview(phase){return BALANCE.campaignParts(phase,Math.max(1,Number(phase)||1)>meta.bestPhase);}
  function powerAssessment(phase) {
    var current=currentPower(),recommended=recommendedPower(phase),difference=current-recommended,percent=Math.round(Math.abs(difference)/Math.max(1,recommended)*100),ratio=current/recommended;
    if(ratio<.9)return{current:current,recommended:recommended,label:'UNDERPOWERED · '+percent+'% BELOW',className:'underpowered'};
    if(ratio>1.15)return{current:current,recommended:recommended,label:'OVERMATCH · '+percent+'% ABOVE',className:'overmatch'};
    return{current:current,recommended:recommended,label:'COMBAT READY · '+(difference>=0?percent+'% ABOVE':percent+'% BELOW'),className:'ready'};
  }

  function refreshHeader() {
    var energyResource=QA_TEST_ACCESS?'<span class="l166-resource power">'+resourceIcon('power')+'<b>∞</b><span>ENERGY</span></span>':resourceMarkup('power',availableEnergy(),'/ '+meta.energyMax+' ENERGY');
    id('l137-res').innerHTML = '<div class="l166-resource-row">'+resourceMarkup('power',currentPower(),'POWER')+'</div><div class="l166-resource-row">'+resourcePair(meta.credits,meta.parts)+'</div><div class="l166-resource-row l171-energy-row">'+energyResource+'</div>';
    var visibleTier=Math.min(5,Math.max(1,meta.hq));
    id('l137-hq-lv').textContent = HQ_TIER_NAMES[visibleTier-1]+' · LEVEL ' + meta.hq;
    var art=document.querySelector('.l137-hq-art');if(art)art.setAttribute('data-tier',String(Math.min(5,Math.max(1,meta.hq))));
    var operationsBadge=id('l176-ops-badge');
    if(operationsBadge){var kind=activeOperationId();operationsBadge.textContent=operationDefinition(kind).short+' '+operationLevelFor(kind)+' · '+(operationRewardAvailable()?'READY':QA_TEST_ACCESS?'PRACTICE':'CLAIMED');}
  }
  function renderResearchTab(panel){
    var effects=researchEffects(),legacy=Math.round((Number(meta.legacyResearchDamage)||0)*100),selected=defaultResearchNode();
    selectedResearchNodeId=selected.id;
    var columns=RESEARCH_BRANCHES.map(function(branch){
      var list=branchNodes(branch.id),count=list.filter(function(node){return researchPurchased(node.id);}).length;
      var tiers=[1,2,3,4,5].map(function(tier){
        var tierNodes=list.filter(function(node){return node.tier===tier;});
        if(!tierNodes.length)return'';
        var buttons=tierNodes.map(function(node){
          var nodeState=researchNodeState(node),badge=researchNodeBadge(node);
          return '<button class="l180-node '+nodeState+(node.capstone?' capstone':'')+(selected.id===node.id?' selected':'')+'" data-research-select="'+node.id+'" aria-label="'+node.name+', '+researchPrimaryEffect(node)+'"><b>'+badge.value+'</b><span>'+badge.label+'</span></button>';
        }).join('');
        return '<div class="l180-tier-row"><div class="l180-tier-label">'+(tier===5?'T5':'T'+tier)+'</div><div class="l180-tier-nodes">'+buttons+'</div></div>';
      }).join('');
      return '<section class="l180-doctrine-column"><div class="l180-doctrine-head"><b>'+branch.short+'</b><small>'+count+'/'+list.length+'</small></div>'+tiers+'</section>';
    }).join('');
    var purchased=researchPurchased(selected.id),unlocked=researchUnlocked(selected),short=meta.researchPoints<=0&&(meta.credits<selected.cost.credits||meta.parts<selected.cost.parts),disabled=purchased||!unlocked||short;
    var nodeState=researchNodeState(selected),stateLabel=purchased?'COMPLETE':!unlocked?'LOCKED':short?'NEED RESOURCES':meta.researchPoints>0?'USE LEGACY POINT':'RESEARCH';
    var requirement=purchased?(selected.capstone?'CAPSTONE ACTIVE':'RESEARCH ACTIVE'):researchRequirementText(selected)||(selected.capstone?'BRANCH CAPSTONE':'PATH AVAILABLE');
    var cost='<span class="l166-cost">'+resourcePair(selected.cost.credits,selected.cost.parts)+'</span>';
    if(meta.researchPoints>0&&!purchased&&unlocked)cost='<span class="l166-cost">LEGACY POINT AVAILABLE</span>'+cost;
    var selectedBranch=RESEARCH_BRANCHES.filter(function(branch){return branch.id===selected.branch;})[0];
    var detail='<section class="l180-selection-tray '+nodeState+(selected.capstone?' capstone':'')+'"><div class="l180-selection-top"><div class="l180-selection-title"><small>'+selectedBranch.short+' · '+(selected.capstone?'CAPSTONE':'TIER '+selected.tier)+'</small><h3>'+selected.name+'</h3></div><span class="l180-selection-state">'+(purchased?'ACTIVE':unlocked?'READY':'LOCKED')+'</span></div><div class="l180-selection-stats">'+researchStatMarkup(selected)+'</div><div class="l180-selection-meta"><span>'+requirement+'</span><span>'+researchPreview(selected,effects,purchased)+'</span></div><button class="l165-node-action" data-research-node="'+selected.id+'" '+(disabled?'disabled':'')+'>'+stateLabel+'<small>'+cost+'</small></button></section>';
    panel.innerHTML='<div class="l180-research-header"><div><div class="l137-kicker">PERMANENT PROGRESSION</div><div class="l137-h2" id="l166-research-title">COMMAND DOCTRINES</div><div class="l137-copy">Attack, Defense, and Support share one board. Tap any node to inspect it.</div></div><div class="l180-research-count"><b>'+purchasedResearchCount()+'</b><span>OF '+RESEARCH_NODES.length+'</span></div></div>'+
      (meta.researchPoints>0?'<div class="l165-research-points"><b>'+meta.researchPoints+' LEGACY RESEARCH POINT'+(meta.researchPoints===1?'':'S')+'</b><span>Converted from the previous Research Tier system. Spend these before Credits or Tech Parts.</span></div>':'')+
      '<div class="l180-research-summary"><div><span>ATTACK</span><b>+'+Math.round(effects.turretDamage*100)+'%</b></div><div><span>DEFENSE</span><b>+'+effects.hqHp+' HQ</b></div><div><span>SUPPORT</span><b>+'+effects.artilleryDamage+'</b></div></div>'+
      (legacy>0?'<div class="l165-legacy-note">LEGACY CALIBRATION RETAINED · ATTACK POWER +'+legacy+'%</div>':'')+
      '<div class="l180-doctrine-board">'+columns+'</div><div class="l180-grid-legend"><span class="done"><i></i>DONE</span><span class="ready"><i></i>READY</span><span class="blocked"><i></i>LOCKED</span></div>'+detail+'<div class="l166-research-footnote">CAPSTONES REQUIRE BOTH TIER 4 NODES · ALL PURCHASES REMAIN PERMANENT</div>';
    Array.prototype.forEach.call(panel.querySelectorAll('[data-research-select]'),function(button){button.onclick=function(){
      var node=researchNode(button.dataset.researchSelect),scrollTop=panel.scrollTop;
      if(node){selectedResearchNodeId=node.id;activeResearchBranch=node.branch;}
      renderTab('research',{scrollTop:scrollTop});
    };});
    Array.prototype.forEach.call(panel.querySelectorAll('[data-research-node]'),function(button){button.onclick=function(){buyResearchNode(button.dataset.researchNode);};});
  }
  function renderInventoryTab(panel){
    var notice='';
    if(meta.equipmentNotice&&meta.equipmentNotice.type==='veteran'){
      var veteran=equipmentInstance(meta.equipmentNotice.uid),veteranDefinition=veteran&&equipmentDefinition(veteran.itemId);
      if(veteranDefinition)notice='<div class="l167-equipment-notice"><b>VETERAN CACHE OPENED</b><br>'+veteranDefinition.name+' was issued for reaching Phase '+Math.max(1,meta.bestPhase)+'. It is equipped and locked for safekeeping.</div>';
      meta.equipmentNotice=null;saveMeta();
    }
    var equippedCards=EQUIPMENT_SLOTS.map(function(slot){
      var instance=equippedInstance(slot.id),definition=instance&&equipmentDefinition(instance.itemId);
      return '<div class="l167-equipped-slot '+(definition?'filled '+definition.rarity:'')+'" '+(instance?'data-equipment-select="'+instance.uid+'"':'')+'>'+equipmentIcon(slot.id)+'<span>'+slot.short+'</span><b>'+(definition?definition.name:'EMPTY SLOT')+'</b><small>'+(definition?definition.effectText:slot.description)+'</small></div>';
    }).join('');
    var filterButtons=[{id:'all',label:'ALL'}].concat(EQUIPMENT_SLOTS.map(function(slot){return{id:slot.id,label:slot.short};})).map(function(filter){return '<button class="l167-filter '+(activeInventoryFilter===filter.id?'active':'')+'" data-equipment-filter="'+filter.id+'">'+filter.label+'</button>';}).join('');
    var visible=meta.equipment.filter(function(instance){var definition=equipmentDefinition(instance.itemId);return definition&&(activeInventoryFilter==='all'||definition.slot===activeInventoryFilter);}).sort(function(a,b){
      var aEquipped=isEquipmentEquipped(a.uid)?1:0,bEquipped=isEquipmentEquipped(b.uid)?1:0;if(aEquipped!==bEquipped)return bEquipped-aEquipped;
      var aDefinition=equipmentDefinition(a.itemId),bDefinition=equipmentDefinition(b.itemId),rarityDifference=equipmentRarity(bDefinition.rarity).rank-equipmentRarity(aDefinition.rarity).rank;
      return rarityDifference||b.acquiredAt-a.acquiredAt;
    });
    if(selectedInventoryUid&&!equipmentInstance(selectedInventoryUid))selectedInventoryUid=null;
    var cards=visible.map(function(instance){
      var definition=equipmentDefinition(instance.itemId),rarity=equipmentRarity(definition.rarity),equipped=isEquipmentEquipped(instance.uid),selected=selectedInventoryUid===instance.uid,value=salvageValue(definition),slot=equipmentSlot(definition.slot);
      var state=equipped?'EQUIPPED':instance.locked?'LOCKED':'',equippedPeer=equippedInstance(definition.slot),peerDefinition=equippedPeer&&equipmentDefinition(equippedPeer.itemId);
      var comparison='';
      if(selected&&!equipped){
        var powerDelta=definition.power-(peerDefinition?peerDefinition.power:0),deltaClass=powerDelta>0?'gain':powerDelta<0?'loss':'even';
        comparison='<div class="l168-compare"><span class="'+deltaClass+'">POWER '+(powerDelta>0?'+':'')+powerDelta+'</span><span class="even">'+(peerDefinition?'VS '+peerDefinition.name.toUpperCase():'EMPTY '+slot.short+' SLOT')+'</span>'+equipmentComparisonEffects(definition,peerDefinition)+'</div>';
      }
      var actions=selected?'<div class="l167-item-actions"><button class="l167-item-action good" data-equipment-action="equip" data-equipment-uid="'+instance.uid+'" '+(equipped?'disabled':'')+'>'+(equipped?'EQUIPPED':'EQUIP')+'</button><button class="l167-item-action" data-equipment-action="lock" data-equipment-uid="'+instance.uid+'">'+(instance.locked?'UNLOCK':'LOCK')+'</button><button class="l167-item-action salvage" data-equipment-action="salvage" data-equipment-uid="'+instance.uid+'" '+(equipped||instance.locked?'disabled':'')+'>SALVAGE +'+value.credits+(value.parts?' / '+value.parts+' PART':'')+'</button></div>':'';
      return '<article class="l167-item-card '+definition.rarity+(selected?' selected':'')+(equipped?' equipped':'')+'" data-equipment-select="'+instance.uid+'"><div class="l167-item-head">'+equipmentIcon(definition.slot)+'<div class="l167-item-copy"><small>'+rarity.label+' · '+slot.label+'</small><b>'+definition.name+'</b><span>'+definition.effectText+' · POWER +'+definition.power+'</span>'+comparison+'</div><div class="l167-item-state">'+state+'</div></div>'+actions+'</article>';
    }).join('');
    var over=meta.equipment.length>INVENTORY_CAPACITY;
    panel.innerHTML='<div class="l137-kicker">ARMORY</div><div class="l137-h2">FIELD EQUIPMENT</div><div class="l137-copy">Recovered equipment is permanent, shared by future commanders, and active as soon as it is equipped.</div>'+notice+'<div class="l167-equipped-grid">'+equippedCards+'</div><div class="l167-inventory-summary '+(over?'over':'')+'"><span><strong>'+meta.equipment.length+'</strong> / '+INVENTORY_CAPACITY+' ITEMS'+(over?' · SALVAGE REQUIRED':'')+'</span><span>EQUIPPED POWER <strong>+'+equipmentPower()+'</strong></span></div><div class="l167-inventory-filters">'+filterButtons+'</div><div class="l167-inventory-list">'+(cards||'<div class="l167-empty">NO '+(activeInventoryFilter==='all'?'RECOVERED EQUIPMENT':equipmentSlot(activeInventoryFilter).label)+'<br>FIRST-CLEAR PHASE VICTORIES GUARANTEE A DROP.</div>')+'</div>';
    Array.prototype.forEach.call(panel.querySelectorAll('[data-equipment-filter]'),function(button){button.onclick=function(){activeInventoryFilter=button.dataset.equipmentFilter;selectedInventoryUid=null;renderTab('inventory',{scrollTop:0});};});
    Array.prototype.forEach.call(panel.querySelectorAll('[data-equipment-select]'),function(card){card.onclick=function(event){if(event.target.closest('[data-equipment-action]'))return;var oldScroll=panel.scrollTop;selectedInventoryUid=selectedInventoryUid===card.dataset.equipmentSelect?null:card.dataset.equipmentSelect;renderTab('inventory',{scrollTop:oldScroll});};});
    Array.prototype.forEach.call(panel.querySelectorAll('[data-equipment-action]'),function(button){button.onclick=function(event){event.stopPropagation();var action=button.dataset.equipmentAction,uid=button.dataset.equipmentUid;if(action==='equip')equipEquipment(uid);if(action==='lock')toggleEquipmentLock(uid);if(action==='salvage')salvageEquipment(uid);};});
  }
  function renderCommanderTab(panel){
    var mastery=commanderMastery(meta.commander),gear=equipmentEffects(),cost=levelCost('commander'),maximum=meta.commander>=COMMANDER_MAX_LEVEL,short=meta.credits<cost.credits||meta.parts<cost.parts;
    var baseDamage=16*(1+mastery.damageBonus)*(1+gear.commanderDamage),baseRate=2.7*(1+mastery.rateBonus)*(1+gear.commanderRate),bossBonus=mastery.bossBonus+gear.commanderBossDamage;
    var nextTier=COMMANDER_TIER_LEVELS.filter(function(level){return level>meta.commander;})[0]||COMMANDER_MAX_LEVEL,progress=maximum?100:Math.round((meta.commander-COMMANDER_TIER_LEVELS[mastery.tier-1])/Math.max(1,nextTier-COMMANDER_TIER_LEVELS[mastery.tier-1])*100);
    var notice='';if(meta.commanderNotice&&meta.commanderNotice.type==='mastery'){notice='<div class="l168-commander-notice">VETERAN SERVICE RECOGNIZED · CAMPAIGN PROGRESS SET HOLT TO MASTERY '+meta.commanderNotice.to+'. NO PURCHASED LEVEL WAS LOST.</div>';meta.commanderNotice=null;saveMeta();}
    var milestones=COMMANDER_TIER_LEVELS.map(function(level,index){return'<div class="l168-milestone '+(meta.commander>=level?'active':'')+'">L'+level+'<br>'+COMMANDER_TIER_NAMES[index]+'</div>';}).join('');
    var equippedGear=EQUIPMENT_SLOTS.map(function(slot){var instance=equippedInstance(slot.id),definition=instance&&equipmentDefinition(instance.itemId);return'<div><small>'+slot.short+'</small><b>'+(definition?definition.name:'EMPTY')+'</b></div>';}).join('');
    var price=cost.parts?resourcePair(cost.credits,cost.parts):resourceMarkup('credits',cost.credits,'CREDITS');
    panel.innerHTML=notice+'<div class="l137-kicker">COMMANDER MASTERY</div><div class="l137-h2">COLONEL HOLT</div><div class="l137-copy">Twenty permanent levels develop Holt through five readable combat tiers without turning him into an oversized unit.</div><div class="l168-command-profile"><div class="l168-command-portrait" data-tier="'+mastery.tier+'"></div><div class="l168-command-info"><small>MASTERY '+meta.commander+' / '+COMMANDER_MAX_LEVEL+' · TIER '+mastery.tier+'</small><b>'+mastery.title+'</b><span>'+(maximum?'MAXIMUM MASTERY ACHIEVED':'NEXT VISUAL TIER AT LEVEL '+nextTier)+'</span><div class="l168-mastery-track"><div class="l168-mastery-fill" style="width:'+progress+'%"></div></div></div></div><div class="l168-stat-grid"><div><span>RIFLE DAMAGE</span><b>'+baseDamage.toFixed(1)+'</b></div><div><span>FIRE RATE</span><b>'+baseRate.toFixed(1)+'/s</b></div><div><span>BOSS DAMAGE</span><b>+'+Math.round(bossBonus*100)+'%</b></div></div><div class="l168-milestones">'+milestones+'</div><div class="l168-signature '+(mastery.commandUnlocked?'':'locked')+'"><b>COMMAND BURST · '+(mastery.commandUnlocked?'ACTIVE':'UNLOCKS AT LEVEL 5')+'</b><span>'+(mastery.commandUnlocked?'Rally the Command Bastion for '+mastery.commandDuration+' seconds: the Commander and main turret fire '+Math.round((mastery.commandRate-1)*100)+'% faster. '+mastery.commandCooldown+' second cooldown.':'Reach Fortified tier to unlock Holt’s first signature battlefield command.')+'</span></div><div class="l168-command-gear">'+equippedGear+'</div><div class="l137-card l168-upgrade-card"><div class="l137-card-row"><div><b>'+(maximum?'MASTERY COMPLETE':'ADVANCE TO LEVEL '+(meta.commander+1))+'</b><small>'+(maximum?'ALL FIVE VISUAL TIERS DEPLOYED':'PERMANENT TRAINING COST')+'</small>'+(maximum?'':'<div class="l166-cost" style="justify-content:flex-start;margin-top:4px">'+price+'</div>')+'</div><button class="l137-btn good" id="l137-buy" '+(maximum||short?'disabled':'')+'>'+(maximum?'MAX LEVEL':short?'NEED RESOURCES':'TRAIN')+'</button></div></div>';
  }
  function renderOperationsTab(panel){
    var kind=activeOperationId(),definition=operationDefinition(kind),nextDefinition=operationDefinition(alternateOperationId(kind)),operationOpen=operationAvailable(kind),rewardOpen=operationRewardAvailable(),level=operationLevelFor(kind),credits=operationRewardCreditsFor(kind,level),parts=operationRewardPartsFor(kind,level),nextLevel=Math.min(OPERATION_LEVEL_GUARD,level+1),autoClear=operationAutoClearStateFor(kind,level),manualBest=operationManualBestFor(kind);
    var notice=operationNotice&&operationNotice.kind===kind?'<div class="l175-operation-notice">'+(operationNotice.method==='auto'?'AUTO-CLEAR ':'')+definition.levelLabel+' '+operationNotice.level+' COMPLETE · LEVEL '+operationNotice.nextLevel+' UNLOCKED · '+(operationNotice.rewarded?formatNumber(operationNotice.credits)+' CREDITS'+(operationNotice.parts?' + '+operationNotice.parts+' TECH PART'+(operationNotice.parts===1?'':'S'):''):'NO ADDITIONAL DAILY RESOURCES')+'</div>':'';
    var rewardState=rewardOpen?'DAILY REWARD AVAILABLE':QA_TEST_ACCESS?'DAILY REWARD CLAIMED · PRACTICE OPEN':'DAILY REWARD CLAIMED';
    var autoLabel=autoClear.available?'AUTO-CLEAR LEVEL '+level:!autoClear.manualReady?'AUTO-CLEAR LOCKED · MANUAL CLEAR '+autoClear.manualRequired:!autoClear.powerReady?'AUTO-CLEAR REQUIRES '+autoClear.required+' POWER':'AUTO-CLEAR USED TODAY';
    var rewardMarkup=parts?resourcePair(credits,parts):resourceMarkup('credits',credits,'CREDITS');
    var nextCredits=operationRewardCreditsFor(kind,nextLevel),objectiveStrip=kind==='junkyard'?'<div class="l182-objective-strip"><div><span>ARMORED VEHICLE</span><b>'+formatNumber(junkyardVehicleHealth(level))+' HP</b></div><div><span>EXTRACTION WINDOW</span><b>'+junkyardTimeLimit()+' SECONDS</b></div><div><span>OBJECTIVE</span><b>DESTROY TARGET</b></div></div>':'<div class="l182-objective-strip containment"><div><span>ASSAULTS</span><b>3</b></div><div><span>APPROACH LANES</span><b>3</b></div><div><span>FINAL TARGET</span><b>ALPHA</b></div></div>';
    var header='<header class="l177-ops-header"><div class="l177-ops-nav"><button class="l137-btn l176-ops-back l177-ops-back" id="l176-ops-back" aria-label="Return to Command Base">← COMMAND BASE</button><div class="l177-ops-status"><b>'+definition.short+' · LEVEL '+level+'</b>'+(rewardOpen?'DAILY REWARD READY':QA_TEST_ACCESS?'PRACTICE OPEN':'DAILY REWARD CLAIMED')+'</div></div><div class="l177-ops-heading"><div class="l137-kicker">SPECIAL OPERATIONS · DAILY LADDER</div><div class="l137-h2">'+definition.name+'</div><div class="l137-copy">'+definition.objective+'</div></div><div class="l177-ops-resources"><div class="l177-ops-resource">'+resourceMarkup('power',currentPower(),'POWER')+'</div><div class="l177-ops-resource">'+resourceMarkup('credits',meta.credits,'CREDITS')+'</div><div class="l177-ops-resource">'+resourceMarkup('parts',meta.parts,'TECH PARTS')+'</div></div></header>';
    panel.innerHTML='<div class="l177-ops-screen l182-'+kind+'-screen">'+header+'<div class="l182-rotation"><span>ACTIVE TODAY</span><b>'+definition.name+'</b><i>ROTATES NEXT: '+nextDefinition.name+'</i></div><section class="l171-operation-card l182-operation-card '+kind+'"><div class="l137-kicker">CURRENT OPERATION</div><h3>'+definition.levelLabel+' '+level+'</h3><p>'+definition.objective+'</p>'+notice+objectiveStrip+'<div class="l175-operation-grid"><div><span>CURRENT POWER</span><b>'+currentPower()+'</b></div><div><span>RECOMMENDED</span><b>'+autoClear.recommended+'</b></div><div><span>BEST MANUAL</span><b>LEVEL '+manualBest+'</b></div></div><div class="l171-operation-state"><span>'+rewardMarkup+'</span><span>LEVEL '+level+' DAILY REWARD<br>'+rewardState+'<br>NEXT LEVEL '+nextLevel+' · '+formatNumber(nextCredits)+' CREDITS</span></div><div class="l175-operation-actions"><button class="l137-btn good" id="l171-operation" '+(operationOpen?'':'disabled')+'>'+(operationOpen?(QA_TEST_ACCESS&&!rewardOpen?'DEPLOY LEVEL '+level+' · PRACTICE':'DEPLOY LEVEL '+level):'LEVEL '+level+' REWARD CLAIMED')+'</button><button class="l137-btn" id="l175-auto-clear" '+(autoClear.available?'':'disabled')+'>'+autoLabel+'</button></div><div class="l175-auto-copy">AUTO-CLEAR REQUIRES A MANUAL CLEAR OF THE PREVIOUS '+definition.short+' LEVEL AND '+autoClear.required+' POWER. IT ADVANCES ONE LEVEL AND USES THE SAME DAILY REWARD CLAIM.</div></section><div class="l176-ops-summary">OPERATIONS ROTATE AT LOCAL MIDNIGHT · CAMPAIGN ENERGY IS NEVER CONSUMED · ONE SHARED REWARDED CLEAR PER DAY · PRACTICE CLEARS GRANT NO ADDITIONAL RESOURCES</div><div class="l171-pass-placeholder"><b>COMMAND PASS · COMING SOON</b>Auto-clear remains a convenience placeholder. No purchase, ad skip, or production unlimited-energy benefit is active in this build.</div></div>';
  }
  function renderStoreTab(panel){
    panel.innerHTML='<div class="l181-store-screen"><header class="l181-store-header"><div class="l181-store-nav"><button class="l137-btn l176-ops-back" id="l181-store-back" aria-label="Return to Command Base">← COMMAND BASE</button><div class="l181-store-state"><b>PREVIEW</b>PURCHASES DISABLED</div></div></header><div class="l181-store-heading"><div class="l137-kicker">SUPPLY DEPOT</div><div class="l137-h2">STORE PREVIEW</div><div class="l137-copy">A first look at future convenience and resource offers. Nothing on this screen can charge an account or grant paid benefits.</div></div><div class="l181-store-lock"><b>PURCHASES DISABLED IN THIS BUILD</b>Pricing, entitlement delivery, restore-purchase behavior, and parental safeguards must be completed before any offer becomes active.</div><div class="l181-store-grid"><article class="l181-store-card featured"><div class="l181-store-card-top"><h3>COMMAND PASS</h3><em>COMING LATER</em></div><p>A monthly convenience option planned around fewer interruptions and more flexible play—not exclusive combat power.</p><div class="l181-store-benefits"><span>AD-FREE CONVENIENCE</span><span>AUTO-CLEAR ACCESS</span><span>ENERGY BENEFITS</span></div><button class="l137-btn" disabled>NOT AVAILABLE</button></article><article class="l181-store-card"><div class="l181-store-card-top"><h3>ENERGY RESUPPLY</h3><em>INACTIVE</em></div><p>Optional campaign-session flexibility. Final quantities, limits, and pricing remain intentionally unset.</p><div class="l181-store-benefits"><span>CAMPAIGN ENERGY</span><span>NO DUNGEON ADVANTAGE</span><span>NO EXCLUSIVE POWER</span></div><button class="l137-btn" disabled>NOT AVAILABLE</button></article><article class="l181-store-card"><div class="l181-store-card-top"><h3>RESOURCE PACKS</h3><em>INACTIVE</em></div><p>Future credit and tech-part bundles must preserve the value of campaign, research, and daily-operation progression.</p><div class="l181-store-benefits"><span>CREDITS</span><span>TECH PARTS</span><span>RATE LIMITED</span></div><button class="l137-btn" disabled>NOT AVAILABLE</button></article></div><div class="l181-store-foot">NO PURCHASE FRAMEWORK, RECEIPT VALIDATION, OR PAID ENTITLEMENT IS ACTIVE IN BUILD 183.</div></div>';
  }
  function renderHqTab(panel){
    if(meta.hq<5){
      panel.innerHTML=upgradePanel('hq','HEADQUARTERS','Grow the central base from a field post into a visibly larger fortified command fortress. Every level strengthens HQ health and all perimeter barriers.','UPGRADE TO LEVEL '+(meta.hq+1)+' · '+HQ_TIER_NAMES[Math.min(4,meta.hq)]);
      return;
    }
    panel.innerHTML='<div class="l137-kicker">PERMANENT UPGRADE</div><div class="l137-h2">COMMAND FORTRESS</div><div class="l137-copy">The headquarters has reached its final structural tier. Every wall, tower, and command system is fully deployed.</div><section class="l181-hq-max"><div class="l181-hq-emblem">V</div><h3>MAXIMUM HQ LEVEL</h3><div class="l181-hq-max-copy">All five fortress tiers are active. Further defensive growth comes from Research, equipment, and field promotions.</div><div class="l181-hq-max-stats"><div><b>+300</b><span>HQ CAPACITY</span></div><div><b>+40</b><span>BARRIER CAPACITY</span></div><div><b>5 / 5</b><span>FORTRESS TIERS</span></div></div><div class="l181-hq-max-status">FORTRESS FULLY DEPLOYED</div></section>';
  }
  function renderTab(tab,options) {
    var app=id('lsc137-app'),operationsMode=tab==='operations',researchMode=tab==='research',storeMode=tab==='store';
    if(app){
      app.classList.toggle('l177-operations-mode',operationsMode);
      app.classList.toggle('l180-research-mode',researchMode);
      app.classList.toggle('l181-store-mode',storeMode);
    }
    refreshHeader();
    var navigationTab=tab==='operations'||tab==='store'?'campaign':tab;
    Array.prototype.forEach.call(id('l137-nav').children, function (b) { b.classList.toggle('active', b.dataset.tab === navigationTab); });
    var p = id('l137-panel');
    if (tab === 'campaign') {
      var support=retryAssist(meta.phase),supportText=support>0?'<small>RETRY SUPPORT ACTIVE · ENEMY HEALTH AND DAMAGE -'+Math.round(support*100)+'%</small>':'',power=powerAssessment(meta.phase),energy=availableEnergy(),freeRetry=isFreeCampaignRetry(meta.phase),spend=freeRetry?1:campaignEnergySpend(),baseCredits=victoryRewardPreview(meta.phase),previewCredits=freeRetry?baseCredits:campaignCreditReward(baseCredits,spend),previewParts=victoryPartPreview(meta.phase);
      var campaignLabel=freeRetry?'RETRY PHASE '+meta.phase+' · ENERGY FREE':'CHALLENGE PHASE '+meta.phase+' · '+spend+' ENERGY · '+campaignMultiplierLabel(spend);
      p.innerHTML = '<div class="l137-kicker">ACTIVE THEATER</div><div class="l137-h2">PHASE ' + meta.phase + ' · OUTER PERIMETER</div><div class="l137-copy">Hold the central headquarters through three assaults, then eliminate the Siege Breaker.</div><div class="l137-card"><div class="l137-card-row"><div><b>Mission Readiness</b><small>'+(meta.phase<4?'OPENING OPERATION':'STANDARD RISK')+'</small></div><div><b>Victory Rewards</b><small class="l166-cost">' + resourcePair(previewCredits,previewParts) + '</small><small>'+(freeRetry?'BASE REWARD':campaignMultiplierLabel(spend)+' · CREDIT BOOST ONLY')+'</small></div></div><div class="l161-power-grid"><div class="l161-power-metric"><span>CURRENT POWER</span><strong>'+power.current+'</strong></div><div class="l161-power-metric"><span>RECOMMENDED</span><strong>'+power.recommended+'</strong></div></div><div class="l161-power-state '+power.className+'">'+power.label+'</div>'+supportText+'</div>'+energyCardMarkup(freeRetry)+'<button class="l137-btn good l137-deploy" id="l137-deploy" '+(!freeRetry&&energy<spend?'disabled':'')+'>'+campaignLabel+'</button>';
    }
    if (tab === 'operations') renderOperationsTab(p);
    if (tab === 'store') renderStoreTab(p);
    if (tab === 'commander') renderCommanderTab(p);
    if (tab === 'research') renderResearchTab(p);
    if (tab === 'hq') renderHqTab(p);
    if (tab === 'inventory') renderInventoryTab(p);
    var dep = id('l137-deploy'); if (dep) dep.onclick = function(){launchPhase({phase:meta.phase,energySpend:freeRetry?1:campaignEnergySpend()});};
    Array.prototype.forEach.call(p.querySelectorAll('[data-campaign-energy]'),function(button){button.onclick=function(){var scrollTop=p.scrollTop;selectedCampaignEnergy=Math.max(1,Math.min(CAMPAIGN_MAX_ENERGY_SPEND,Number(button.dataset.campaignEnergy)||1));renderTab('campaign',{scrollTop:scrollTop});};});
    var operationButton=id('l171-operation');if(operationButton)operationButton.onclick=function(){var kind=activeOperationId();launchPhase({phase:meta.phase,operation:true,operationKind:kind,operationLevel:operationLevelFor(kind)});};
    var autoClearButton=id('l175-auto-clear');if(autoClearButton)autoClearButton.onclick=autoClearOperation;
    var operationsBack=id('l176-ops-back');if(operationsBack)operationsBack.onclick=function(){renderTab(operationsReturnState.tab,{scrollTop:operationsReturnState.scrollTop});};
    var storeBack=id('l181-store-back');if(storeBack)storeBack.onclick=function(){renderTab(storeReturnState.tab,{scrollTop:storeReturnState.scrollTop});};
    var buy = id('l137-buy'); if (buy) buy.onclick = function () { buyUpgrade(tab); };
    if(p)p.scrollTop=options&&Number.isFinite(options.scrollTop)?Math.max(0,options.scrollTop):0;
    activeCommandTab=tab;
  }
  function upgradePanel(type, title, copy, level) {
    var cost = levelCost(type);
    var price = cost.parts?resourcePair(cost.credits,cost.parts):resourceMarkup('credits',cost.credits,'CREDITS');
    var maximum=(type==='hq'&&meta.hq>=5)||(type==='commander'&&meta.commander>=COMMANDER_MAX_LEVEL),short = meta.credits < cost.credits || meta.parts < cost.parts;
    return '<div class="l137-kicker">PERMANENT UPGRADE</div><div class="l137-h2">' + title + '</div><div class="l137-copy">' + copy + '</div><div class="l137-card"><div class="l137-card-row"><div><b>' + level + '</b><small>' + (maximum?'ALL FORTRESS TIERS DEPLOYED':'NEXT UPGRADE COST') + '</small>'+(maximum?'':'<div class="l166-cost" style="justify-content:flex-start;margin-top:4px">'+price+'</div>')+'</div><button class="l137-btn good" id="l137-buy" ' + (maximum||short ? 'disabled' : '') + '>' + (maximum?'MAX LEVEL':short ? 'NEED RESOURCES' : 'UPGRADE') + '</button></div></div>';
  }
  function buyUpgrade(type) {
    if(type==='research'||(type==='hq'&&meta.hq>=5)||(type==='commander'&&meta.commander>=COMMANDER_MAX_LEVEL))return;
    var cost = levelCost(type); if (meta.credits < cost.credits || meta.parts < cost.parts) return;
    meta.credits -= cost.credits; meta.parts -= cost.parts; meta[type]++; saveMeta(); combatSfx('upgrade'); combatHaptic('success',180); renderTab(type);
  }

  function launchPhase(phaseOverride) {
    var settings=phaseOverride&&typeof phaseOverride==='object'&&!phaseOverride.target?Object.assign({},phaseOverride):{phase:phaseOverride};
    settings.phase=Math.max(1,Number(settings.phase)||meta.phase);
    settings.operation=!!settings.operation;
    settings.operationKind=settings.operation&&(settings.operationKind==='junkyard'||settings.operationKind==='containment')?settings.operationKind:settings.operation?activeOperationId():null;
    settings.operationLevel=settings.operation?Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(settings.operationLevel)||operationLevelFor(settings.operationKind)))):0;
    if(settings.operation&&typeof settings.operationRewardEligible!=='boolean')settings.operationRewardEligible=operationRewardAvailable();
    settings.restart=!!settings.restart;
    settings.freeRetry=!settings.operation&&(!!settings.freeRetry||(!settings.restart&&isFreeCampaignRetry(settings.phase)));
    settings.energyCommitted=Math.max(0,Math.floor(Number(settings.energyCommitted)||0));
    settings.energySpend=settings.operation?0:Math.max(1,Math.min(CAMPAIGN_MAX_ENERGY_SPEND,Math.floor(Number(settings.energySpend)||campaignEnergySpend())));
    settings.creditMultiplier=settings.operation||settings.freeRetry?1:campaignCreditMultiplier(settings.energySpend);
    if(settings.operation&&!operationAvailable(settings.operationKind)){if(run&&run.complete)returnHome();else renderTab('operations');return;}
    if(!settings.operation&&!settings.restart&&!settings.freeRetry){
      if(availableEnergy()<settings.energySpend){if(run&&run.complete)returnHome();else renderTab('campaign');return;}
      if(!reserveEnergy(settings.energySpend)){if(run&&run.complete)returnHome();else renderTab('campaign');return;}
      settings.energyCommitted=settings.energySpend;
    }
    if(settings.freeRetry){settings.energySpend=1;settings.creditMultiplier=1;}
    if(settings.freeRetry&&!settings.restart&&isFreeCampaignRetry(settings.phase)){meta.campaignRetryPhase=null;saveMeta();}
    if(typeof ensureAudio==='function')ensureAudio();
    combatSfx('deploy');combatHaptic('medium',180);
    var home = id('homeScreen'); if (home) { home.style.display = 'none'; home.classList.remove('hs-visible'); }
    if (G && G.state && !G.state.started) { if (!G.state.selectedDoctrine) G.state.selectedDoctrine = 'fortress'; G.state.started = true; }
    id('lsc137-app').classList.add('hidden');
    document.body.classList.add('lsc137-mode');
    document.body.classList.toggle('l172-operation-mode',settings.operation);
    document.body.classList.toggle('l182-junkyard-mode',settings.operationKind==='junkyard');
    var loadMark=id('l172-load-mark'),loadTitle=id('l172-load-title'),loadCopy=id('l172-load-copy');
    if(loadMark)loadMark.textContent=settings.operationKind==='junkyard'?'JYD':settings.operation?'OPS':'HQ';
    if(loadTitle)loadTitle.textContent=settings.operationKind==='junkyard'?'DEPLOYING JUNKYARD RECOVERY LEVEL '+settings.operationLevel:settings.operation?'DEPLOYING CONTAINMENT LEVEL '+settings.operationLevel:'DEPLOYING TO OUTER PERIMETER';
    if(loadCopy)loadCopy.textContent=settings.operationKind==='junkyard'?'LOCATING ARMORED CONVOY TARGET':settings.operation?'ESTABLISHING LEVEL '+settings.operationLevel+' FORWARD LANES':'INITIALIZING COMMAND SYSTEMS';
    showBattleLoading();
    run = createRun(settings);setSpeed(1);
    if(window.LSC3DPrototype) window.LSC3DPrototype.start(canvas, run, hideBattleLoading);else hideBattleLoading();
    G.state._centralHQMode = true; G.state.waveInProgress = true; G.state.gameOver = false; G.state.paused = false;
    id('lsc137-ability').disabled = false; id('lsc137-ability').textContent = 'ARTILLERY';
    var commandButton=id('lsc168-command');if(commandButton){commandButton.disabled=meta.commander<5;commandButton.textContent=meta.commander<5?'LOCKED':settings.operation?'RALLY':'COMMAND';}
    var restartButton=id('l139-restart');if(restartButton)restartButton.textContent=settings.operation?'RESTART OPERATION':'RESTART PHASE';
    var progress=id('l139-progress');if(progress)progress.classList.remove('l168-boss-hud');
  }
  function createRun(settings) {
    var W = canvas.width || 390, H = canvas.height || 600, s = dpr(), cx = W / 2, cy = H * .52;
    settings=settings||{};
    var operation=!!settings.operation,operationKind=operation&&settings.operationKind==='junkyard'?'junkyard':operation?'containment':null,junkyard=operationKind==='junkyard',operationLevel=operation?Math.max(1,Math.min(OPERATION_LEVEL_GUARD,Math.floor(Number(settings.operationLevel)||operationLevelFor(operationKind)))):0,phase=Math.max(1,Number(settings.phase)||meta.phase),baseBalance=phaseBalance(phase),operationScale=operation&&!junkyard?operationDifficulty(operationLevel):null,balance=junkyard?{targets:[1],hp:1,damage:0,bossHp:junkyardVehicleHealth(operationLevel),bossDamage:0,barricadeHp:0}:operation?{targets:operationTargets(operationLevel),hp:operationScale.health,damage:operationScale.damage,bossHp:operationScale.bossHealth,bossDamage:operationScale.bossDamage,barricadeHp:operationScale.barricadeHp}:baseBalance,assist=operation?0:retryAssist(phase),targets=balance.targets.slice(),tech=researchEffects(),gear=equipmentEffects();
    var worldScale=(Math.min(W,H)*.54+45*s)/8.2;
    var barricadeHp=balance.barricadeHp+(meta.hq-1)*10+tech.barrierHp+gear.barrierHp;
    var lanes=[],layouts=junkyard?[]:operation?OPERATION_LANES:COMPOUND_LANES;
    for(var lane=0;lane<layouts.length;lane++){
      var layout=layouts[lane],angle=Math.atan2(layout.y,layout.x);
      lanes.push({index:lane,angle:angle,baseX:layout.x,baseY:layout.y,rotation:layout.rotation,side:layout.side,queue:[],barricade:{hp:barricadeHp,maxHp:barricadeHp,flash:0}});
    }
    var hqCapacity=300+(meta.hq-1)*75+tech.hqHp+gear.hqHp,artilleryDamage=(95+tech.artilleryDamage+gear.artilleryDamage)*(1+tech.artilleryMultiplier),mastery=commanderMastery(meta.commander),commanderRange=operation?335*s:Math.max(150*s,worldScale*COMMANDER_COMPOUND_RANGE_WORLD);
    var created={ active:true, paused:false, complete:false, won:false, operation:operation, operationKind:operationKind, operationLevel:operationLevel, operationRewardEligible:operation&&settings.operationRewardEligible!==false, freeRetry:!!settings.freeRetry, energyCommitted:Math.max(0,Math.floor(Number(settings.energyCommitted)||0)), energySpend:operation?0:Math.max(1,Math.floor(Number(settings.energySpend)||1)), creditMultiplier:operation?1:Math.max(1,Number(settings.creditMultiplier)||1), phase:phase, balance:balance, assist:assist, elapsed:0, speed:1, assault:1, assaultElapsed:0, assaultSpawned:0, assaultKills:0, assaultTargets:targets, transition:0, spawn:0, spawned:0, nextLane:0, lanes:lanes, worldScale:worldScale, kills:0, xp:0, xpNext:36, level:1, bossSpawned:false, bossDefeated:false, upgradeOpen:false, upgradeStacks:{}, lastUpgradeChoices:[], legendaryMisses:0, abilityCd:0, abilityMaxCd:Math.max(8,18-tech.artilleryCooldown-gear.artilleryCooldown), abilityDamage:artilleryDamage, artilleryKillCooldown:tech.artilleryKillCooldown, assaultArtilleryReady:tech.assaultArtilleryReady, fieldXpMultiplier:1+tech.fieldXp+gear.fieldXp, promotionChoiceBonus:tech.promotionChoiceBonus, commanderLevel:mastery.level,commanderVisualTier:mastery.tier,commanderBossDamage:mastery.bossBonus+gear.commanderBossDamage,commandUnlocked:mastery.commandUnlocked,commandCd:0,commandMaxCd:mastery.commandCooldown,commandDuration:mastery.commandDuration,commandRate:mastery.commandRate,commandActive:0, turretBossDamage:tech.turretBossDamage, turretArmoredDamage:tech.turretArmoredDamage, turretPriority:tech.turretPriority, assaultHqRepair:tech.assaultHqRepair+gear.assaultHqRepair, assaultBarrierRepair:tech.assaultBarrierRepair+gear.assaultBarrierRepair, rebuildBarrierFraction:tech.rebuildBarrierFraction, hqDamageReduction:tech.hqDamageReduction+gear.hqDamageReduction, hqEmergencyReduction:tech.hqEmergencyReduction, barrierDamageReduction:tech.barrierDamageReduction+gear.barrierDamageReduction, research:tech, equipment:gear, lastHit:0,
      hq:{x:cx,y:cy,r:37*s,level:meta.hq,hp:hqCapacity,maxHp:hqCapacity},
      hero:{source:'commander',x:cx-(operation?34:28)*s,y:cy+(operation?30:-19)*s,r:13*s,damage:16*(1+mastery.damageBonus)*(1+gear.commanderDamage),rate:2.7*(1+mastery.rateBonus)*(1+gear.commanderRate),range:commanderRange,cd:0},
      turret:{source:'turret',x:cx+(operation?34:25)*s,y:cy+(operation?9:-40)*s,r:10*s,damage:10*(1+tech.turretDamage+gear.turretDamage),rate:3.1*(1+tech.turretRate+gear.turretRate),range:(operation?350:215)*s*(1+tech.turretRange+gear.turretRange),cd:0,parkAim:-Math.PI/2},
      // Holt and the turret remain independent combat sources but occupy one
      // authored Command Bastion fixture in both the 2D and 3D renderers.
      squad:[],
      enemies:[],corpses:[],bullets:[],particles:[],performance:PERFORMANCE_BUDGET,lastHudUpdate:0,lastControlUpdate:0,damage:{commander:0,turret:0,squad:0,artillery:0},feedback:null };
    if(junkyard){
      created.objectiveDuration=junkyardTimeLimit();
      created.objectiveTime=created.objectiveDuration;
      created.vehicleDestroyed=false;
      created.hero.x=cx-4.65*worldScale;created.hero.y=cy+1.75*worldScale;created.hero.range=Math.max(created.hero.range,worldScale*11.4);
      created.turret.x=cx-4.05*worldScale;created.turret.y=cy+4.05*worldScale;created.turret.range=Math.max(created.turret.range,worldScale*11.8);created.turret.parkAim=-.95;
      var vehicleHp=junkyardVehicleHealth(operationLevel),vehicleAim=Math.atan2(JUNKYARD_VEHICLE_PATH.end.y-JUNKYARD_VEHICLE_PATH.start.y,JUNKYARD_VEHICLE_PATH.end.x-JUNKYARD_VEHICLE_PATH.start.x);
      var vehicle={id:0,variant:'armored-transport',x:cx+JUNKYARD_VEHICLE_PATH.start.x*worldScale,y:cy+JUNKYARD_VEHICLE_PATH.start.y*worldScale,r:36*s,hp:vehicleHp,maxHp:vehicleHp,kind:'vehicle',bossGrade:0,speed:0,damage:0,attackCycle:0,cd:0,age:0,moving:true,waiting:false,engaged:false,targetType:'extraction',lane:null,hit:0,flash:0,aim:vehicleAim};
      created.objectiveVehicle=vehicle;created.enemies.push(vehicle);created.spawned=1;created.assaultSpawned=1;created.bossSpawned=true;created.bossEntityId=vehicle.id;
    }
    return created;
  }
  function canvasRadius(worldRadius){return worldRadius*run.worldScale;}
  function lanePoint(lane,worldRadius,tangentWorld){var ratio=worldRadius/BARRICADE_WORLD_RADIUS,t=canvasRadius(tangentWorld||0),tx=-Math.sin(lane.angle),ty=Math.cos(lane.angle);return{x:run.hq.x+canvasRadius(lane.baseX*ratio)+tx*t,y:run.hq.y+canvasRadius(lane.baseY*ratio)+ty*t};}
  function chooseLane(){
    var best=run.nextLane,bestLength=Infinity;
    for(var offset=0;offset<run.lanes.length;offset++){
      var index=(run.nextLane+offset)%run.lanes.length,length=run.lanes[index].queue.length;
      if(length<bestLength){best=index;bestLength=length;if(length===0)break;}
    }
    run.nextLane=(best+1)%run.lanes.length;
    return run.lanes[best];
  }
  function removeFromLane(e){
    if(!run||e.lane==null||!run.lanes[e.lane])return;
    var queue=run.lanes[e.lane].queue,index=queue.indexOf(e);
    if(index>=0)queue.splice(index,1);
  }
  function enemy(kind) {
    var lane=kind==='boss'?run.lanes[run.operation?Math.floor(run.lanes.length/2):BOSS_LANE_INDEX]:chooseLane(),a=lane.angle,s=dpr(),assistScale=1-run.assist,profile=run.balance;
    var base=kind==='boss'?{hp:profile.bossHp,speed:25,damage:profile.bossDamage,cycle:1.2}:kind==='armored'?{hp:68,speed:31,damage:12,cycle:1.16}:kind==='runner'?{hp:20,speed:74,damage:5.5,cycle:.88}:{hp:34,speed:43,damage:7,cycle:ENEMY_ATTACK_CYCLE};
    var hpScale=kind==='boss'?assistScale:profile.hp*assistScale,damageScale=kind==='boss'?assistScale:profile.damage*assistScale;
    var tangentWorld=(Math.random()-.5)*.32,spawn=lanePoint(lane,SPAWN_WORLD_RADIUS+Math.random()*.3,tangentWorld);
    var nextId=run.spawned++,variant=kind==='runner'||(kind==='grunt'&&nextId%4===1)?'scout':'soldier';
    var unit={id:nextId,variant:variant,x:spawn.x,y:spawn.y,r:(kind==='boss'?34.5:kind==='armored'?17:13)*s,hp:base.hp*hpScale,maxHp:base.hp*hpScale,kind:kind,bossGrade:kind==='boss'?Math.min(3,1+Math.floor((run.phase-1)/5)):0,speed:base.speed*s,damage:base.damage*damageScale,attackCycle:base.cycle,cd:0,age:Math.random(),moving:true,waiting:false,engaged:false,targetType:null,lane:lane.index,hit:0,flash:0,aim:a+Math.PI};
    lane.queue.push(unit);
    return unit;
  }
  function nearest(o,range){
    var t=null,b=range,bestPriority=-1,priorityTarget=o&&o.source==='turret'&&run&&run.turretPriority>0;
    run.enemies.forEach(function(e){
      var objective=e.kind==='boss'||e.kind==='vehicle',x=dist(o,e),effectiveRange=objective?Math.max(range,canvasRadius(SPAWN_WORLD_RADIUS+1.5)):range;if(x>=effectiveRange||!commanderTargetInPerimeter(o,e)||(!objective&&!firingLineClearsHolt(o,e)))return;
      var priority=e.kind==='vehicle'?5:e.kind==='boss'?4:priorityTarget?(e.kind==='armored'?2:1):0;
      if(priority>bestPriority||(priority===bestPriority&&x<b)){bestPriority=priority;b=x;t=e;}
    });
    return t;
  }
  function commanderTargetInPerimeter(source,target){
    if(!run||run.operation||!source||source.source!=='commander'||target.kind==='boss'||target.engaged)return true;
    var lane=run.lanes[target.lane];
    if(!lane)return true;
    var stop=lanePoint(lane,BARRICADE_STOP_WORLD_RADIUS,0);
    return Math.hypot(target.x-stop.x,target.y-stop.y)<=canvasRadius(COMMANDER_APPROACH_DEPTH_WORLD);
  }
  function firingLineClearsHolt(source,target){
    if(target&&target.kind==='boss')return true;
    if(!run||!source||source.source!=='turret'||!run.hero)return true;
    var dx=target.x-source.x,dy=target.y-source.y,lengthSquared=dx*dx+dy*dy;
    if(lengthSquared<=0)return true;
    var hx=run.hero.x-source.x,hy=run.hero.y-source.y,projection=(hx*dx+hy*dy)/lengthSquared;
    if(projection<=0||projection>=1)return true;
    var closestX=source.x+dx*projection,closestY=source.y+dy*projection;
    return Math.hypot(run.hero.x-closestX,run.hero.y-closestY)>run.hero.r+8*dpr();
  }
  function fire(o,t,damage){
    if(!t)return;
    var x=t.x-o.x,y=t.y-o.y,l=Math.hypot(x,y)||1,source=o.source||'squad',speed=source==='turret'?390:source==='commander'?650:500;
    o.aim=Math.atan2(y,x);
    o.flash=.09;
    combatSfx(source==='commander'?'rifle':source==='turret'?'turret':'shoot',source==='turret'?185:source==='commander'?135:170);
    // Give weapon fire physical feedback without stacking simultaneous impacts.
    // Commander/squad fire shares the light channel; turret bursts use medium.
    combatHaptic(source==='turret'?'medium':'light',source==='turret'?240:source==='commander'?140:180);
    var shotDamage=damage;
    if(source==='commander'&&t.kind==='boss')shotDamage*=1+(run.commanderBossDamage||0);
    if(source==='turret'&&t.kind==='boss')shotDamage*=1+(run.turretBossDamage||0);
    if(source==='turret'&&t.kind==='armored')shotDamage*=1+(run.turretArmoredDamage||0);
    if(source==='commander'&&t.kind==='vehicle')shotDamage*=1+(run.commanderBossDamage||0);
    if(source==='turret'&&t.kind==='vehicle')shotDamage*=1+Math.max(run.turretBossDamage||0,run.turretArmoredDamage||0);
    run.bullets.push({x:o.x+Math.cos(o.aim)*10*dpr(),y:o.y+Math.sin(o.aim)*10*dpr(),px:o.x,py:o.y,vx:x/l*speed*dpr(),vy:y/l*speed*dpr(),damage:shotDamage,life:.9,source:source,color:source==='commander'?'#fff07a':source==='turret'?'#ff8a2a':'#8edcff'});
  }
  function pushParticle(particle){
    if(!run||!particle)return;
    var cap=Math.max(12,Number(run.performance&&run.performance.particleCap)||72),critical=particle.type==='artillery'||particle.type==='command'||particle.type==='hq-hit'||particle.type==='barrier';
    if(run.particles.length>=cap){
      if(!critical)return;
      var disposable=-1;
      for(var index=0;index<run.particles.length;index++)if(run.particles[index].type==='debris'||String(run.particles[index].type||'').indexOf('impact')>=0){disposable=index;break;}
      run.particles.splice(disposable>=0?disposable:0,1);
    }
    run.particles.push(particle);
  }
  function kill(i,e){
    var isBoss=e.kind==='boss',isVehicle=e.kind==='vehicle';
    for(var n=0;n<(isVehicle?28:isBoss?18:7);n++)pushParticle({x:e.x+(Math.random()-.5)*e.r,y:e.y+(Math.random()-.5)*e.r,life:.35+Math.random()*.3,max:.65,r:(2+Math.random()*5)*dpr(),color:isVehicle?(n%3?'#ff7a32':'#ffd166'):isBoss?'#ff6a38':'#e35238',filled:true,type:'debris'});
    removeFromLane(e);
    var corpseLife=isBoss?1.05:.8;
    if(!isVehicle)run.corpses.push({id:e.id,variant:e.variant,x:e.x,y:e.y,kind:e.kind,bossGrade:e.bossGrade||0,aim:e.aim,moving:false,waiting:false,engaged:false,life:corpseLife,max:corpseLife});
    while(run.corpses.length>Math.max(1,Number(run.performance&&run.performance.corpseCap)||3))run.corpses.shift();
    run.enemies.splice(i,1);
    run.kills++;
    if(isVehicle){
      run.vehicleDestroyed=true;run.bossDefeated=true;e.hp=0;e.moving=false;e.destroyed=true;
      combatSfx('bossDown');combatHaptic('heavy',300);
    }else if(isBoss){
      // The boss ends the run, so it must never create a final field promotion.
      run.bossDefeated=true;
      combatSfx('bossDown');
      combatHaptic('heavy',300);
    }else{
      run.assaultKills++;
      run.xp+=(e.kind==='armored'?10:6)*(run.fieldXpMultiplier||1);
      combatSfx('enemyDown',175);
      if(run.xp>=run.xpNext&&!run.upgradeOpen)openUpgrade();
    }
  }
  var FIELD_RARITY={common:{label:'COMMON',className:'common'},epic:{label:'EPIC',className:'epic'},legendary:{label:'LEGENDARY',className:'legendary'}};
  var upgrades=[
    {id:'rapid-fire',name:'Rapid Fire',description:'Commander fire rate +18%.',rarity:'common',minRank:2,maxStacks:3,source:'commander',apply:function(){run.hero.rate*=1.18;}},
    {id:'heavy-rounds',name:'Heavy Rounds',description:'Commander rifle damage +22%.',rarity:'common',minRank:2,maxStacks:3,source:'commander',apply:function(){run.hero.damage*=1.22;}},
    {id:'turret-calibration',name:'Turret Calibration',description:'Main-turret damage +22%.',rarity:'common',minRank:2,maxStacks:3,source:'turret',apply:function(){run.turret.damage*=1.22;}},
    {id:'reinforced-hq',name:'Reinforced HQ',description:'Maximum HQ health +50 and repair 50.',rarity:'common',minRank:2,maxStacks:3,source:'hq',apply:function(){run.hq.maxHp+=50;run.hq.hp=Math.min(run.hq.maxHp,run.hq.hp+50);}},
    {id:'field-repairs',name:'Field Repairs',description:'Restore 30 health to every surviving barrier.',rarity:'common',minRank:2,maxStacks:3,source:'compound',available:function(){return run.lanes.some(function(lane){return lane.barricade.hp>0&&lane.barricade.hp<lane.barricade.maxHp;});},apply:function(){run.lanes.forEach(function(lane){if(lane.barricade.hp>0)lane.barricade.hp=Math.min(lane.barricade.maxHp,lane.barricade.hp+30);});}},
    {id:'forward-observer',name:'Forward Observer',description:'Artillery damage +15 and cooldown -1.5 seconds.',rarity:'common',minRank:2,maxStacks:3,source:'artillery',apply:function(){run.abilityDamage+=15;run.abilityMaxCd=Math.max(8,run.abilityMaxCd-1.5);run.abilityCd=Math.min(run.abilityCd,run.abilityMaxCd);}},

    {id:'command-overdrive',name:'Command Overdrive',description:'Commander damage +25% and fire rate +20%.',rarity:'epic',minRank:3,maxStacks:2,source:'commander',apply:function(){run.hero.damage*=1.25;run.hero.rate*=1.20;}},
    {id:'turret-overdrive',name:'Turret Overdrive',description:'Main-turret damage +32% and fire rate +15%.',rarity:'epic',minRank:3,maxStacks:2,source:'turret',apply:function(){run.turret.damage*=1.32;run.turret.rate*=1.15;}},
    {id:'reactive-armor',name:'Reactive Armor',description:'Maximum HQ health +100 and repair 100.',rarity:'epic',minRank:3,maxStacks:2,source:'hq',apply:function(){run.hq.maxHp+=100;run.hq.hp=Math.min(run.hq.maxHp,run.hq.hp+100);}},
    {id:'barrier-rebuild',name:'Barrier Rebuild',description:'Barrier capacity +18; rebuild destroyed positions at 40%.',rarity:'epic',minRank:3,maxStacks:2,source:'compound',apply:function(){run.lanes.forEach(function(lane){var wasDestroyed=lane.barricade.hp<=0;lane.barricade.maxHp+=18;lane.barricade.hp=wasDestroyed?Math.ceil(lane.barricade.maxHp*.4):Math.min(lane.barricade.maxHp,lane.barricade.hp+40);});}},
    {id:'fire-support',name:'Fire Support',description:'Artillery damage +35 and cooldown -3 seconds.',rarity:'epic',minRank:3,maxStacks:2,source:'artillery',apply:function(){run.abilityDamage+=35;run.abilityMaxCd=Math.max(6,run.abilityMaxCd-3);run.abilityCd=Math.min(run.abilityCd,run.abilityMaxCd);}},
    {id:'crossfire',name:'Crossfire Protocol',description:'Commander and main-turret damage +16%.',rarity:'epic',minRank:3,maxStacks:2,source:'compound',apply:function(){run.hero.damage*=1.16;run.turret.damage*=1.16;}},

    {id:'apex-commander',name:'Apex Commander',description:'Commander damage +50% and fire rate +35%.',rarity:'legendary',minRank:5,maxStacks:1,source:'commander',apply:function(){run.hero.damage*=1.50;run.hero.rate*=1.35;}},
    {id:'siege-cannon',name:'Siege Cannon',description:'Main-turret damage +75% and fire rate +30%.',rarity:'legendary',minRank:5,maxStacks:1,source:'turret',apply:function(){run.turret.damage*=1.75;run.turret.rate*=1.30;}},
    {id:'fortress-protocol',name:'Fortress Protocol',description:'HQ capacity +200; fully restore HQ and every barrier.',rarity:'legendary',minRank:5,maxStacks:1,source:'hq',apply:function(){run.hq.maxHp+=200;run.hq.hp=run.hq.maxHp;run.lanes.forEach(function(lane){lane.barricade.maxHp+=35;lane.barricade.hp=lane.barricade.maxHp;});}},
    {id:'fire-mission-control',name:'Fire Mission Control',description:'Artillery damage +70 and cooldown -6 seconds.',rarity:'legendary',minRank:5,maxStacks:1,source:'artillery',apply:function(){run.abilityDamage+=70;run.abilityMaxCd=Math.max(6,run.abilityMaxCd-6);run.abilityCd=Math.min(run.abilityCd,run.abilityMaxCd);}},
    {id:'combined-arms',name:'Combined Arms',description:'Commander and turret damage +40%; range +12%.',rarity:'legendary',minRank:5,maxStacks:1,source:'compound',apply:function(){run.hero.damage*=1.40;run.turret.damage*=1.40;run.hero.range*=1.12;run.turret.range*=1.12;}}
  ];
  function upgradeSourceLabel(source){return source==='commander'?'HOLT':source==='turret'?'MAIN TURRET':source==='artillery'?'ARTILLERY':source==='compound'?'COMPOUND':'HEADQUARTERS';}
  function upgradeAvailable(upgrade){
    if(!run||run.level<upgrade.minRank)return false;
    if((run.upgradeStacks[upgrade.id]||0)>=upgrade.maxStacks)return false;
    return !upgrade.available||upgrade.available();
  }
  function shuffled(list){
    var copy=list.slice();
    for(var i=copy.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),held=copy[i];copy[i]=copy[j];copy[j]=held;}
    return copy;
  }
  function rarityPlan(rank){
    if(rank<=2)return['common','common','common'];
    if(rank===3)return['common','common','epic'];
    if(rank===4)return['common','epic','epic'];
    if(rank===5){run.legendaryMisses=0;return['common','epic','legendary'];}
    var legendaryAvailable=upgrades.some(function(upgrade){return upgrade.rarity==='legendary'&&upgradeAvailable(upgrade);});
    var includeLegendary=legendaryAvailable&&(run.legendaryMisses>=2||Math.random()<.30);
    if(includeLegendary){run.legendaryMisses=0;return['common','epic','legendary'];}
    if(legendaryAvailable)run.legendaryMisses++;
    return['common','epic','epic'];
  }
  function chooseFieldUpgrades(rank){
    var choices=[],recent=run.lastUpgradeChoices||[],plan=rarityPlan(rank),legendaryPlanned=plan.indexOf('legendary')>=0;
    if(run.promotionChoiceBonus>0)plan.push('common');
    plan.forEach(function(rarity){
      var candidates=upgrades.filter(function(upgrade){return upgrade.rarity===rarity&&upgradeAvailable(upgrade)&&!choices.some(function(choice){return choice.id===upgrade.id;});});
      var fresh=candidates.filter(function(upgrade){return recent.indexOf(upgrade.id)<0;});
      var choice=shuffled(fresh.length?fresh:candidates)[0];
      if(!choice){
        var fallback=upgrades.filter(function(upgrade){return upgradeAvailable(upgrade)&&(legendaryPlanned||upgrade.rarity!=='legendary')&&!choices.some(function(selected){return selected.id===upgrade.id;});});
        choice=shuffled(fallback)[0];
      }
      if(choice)choices.push(choice);
    });
    run.lastUpgradeChoices=choices.map(function(choice){return choice.id;});
    return choices;
  }
  function applyFieldUpgrade(upgrade){
    if(!run||!run.upgradeOpen)return;
    upgrade.apply();
    run.upgradeStacks[upgrade.id]=(run.upgradeStacks[upgrade.id]||0)+1;
    run.feedback={text:upgradeSourceLabel(upgrade.source)+' · '+upgrade.name.toUpperCase(),source:upgrade.source,life:1.7,max:1.7};
    combatSfx('promotion');
    combatHaptic(upgrade.rarity==='legendary'?'heavy':'success',160);
    run.upgradeOpen=false;
    id('hq-upgrade-overlay').classList.remove('show');
    if(run.xp>=run.xpNext&&!run.bossDefeated)setTimeout(function(){if(run&&run.active&&!run.upgradeOpen)openUpgrade();},180);
  }
  function openUpgrade(){
    if(!run||run.complete||run.bossDefeated)return;
    run.upgradeOpen=true;
    run.xp-=run.xpNext;
    run.level++;
    run.xpNext=Math.floor(run.xpNext*1.32);
    combatSfx('rankUp');
    combatHaptic('success',220);
    var subtitle=id('hq-upgrade-sub');
    if(subtitle)subtitle.textContent='FIELD RANK '+run.level+' · SELECT ONE UPGRADE';
    var grid=id('hq-upgrade-grid');
    grid.innerHTML='';
    chooseFieldUpgrades(run.level).forEach(function(upgrade){
      var rarity=FIELD_RARITY[upgrade.rarity],nextStack=(run.upgradeStacks[upgrade.id]||0)+1;
      var button=document.createElement('button');
      button.className='hq-upgrade-choice '+rarity.className;
      button.innerHTML='<small>'+rarity.label+' · '+upgradeSourceLabel(upgrade.source)+'</small><b>'+upgrade.name+'</b><span>'+upgrade.description+(upgrade.maxStacks>1?' · NEXT STACK '+nextStack+'/'+upgrade.maxStacks:'')+'</span>';
      button.onclick=function(){applyFieldUpgrade(upgrade);};
      grid.appendChild(button);
    });
    id('hq-upgrade-overlay').classList.add('show');
  }
  function useAbility(){
    if(!run||!run.active||run.abilityCd>0)return;
    run.abilityCd=run.abilityMaxCd;
    combatSfx('orbital');
    combatHaptic('heavy',300);
    run.enemies.forEach(function(e){var dealt=Math.min(run.abilityDamage,e.hp);e.hp-=run.abilityDamage;run.damage.artillery+=dealt;pushParticle({x:e.x,y:e.y,life:.55,max:.55,r:34*dpr(),color:'#ff3c27',type:'artillery'});});
    var artilleryEliminations=0;
    for(var i=run.enemies.length-1;i>=0;i--)if(run.enemies[i].hp<=0){artilleryEliminations++;kill(i,run.enemies[i]);}
    if(artilleryEliminations&&run.artilleryKillCooldown>0)run.abilityCd=Math.max(0,run.abilityCd-artilleryEliminations*run.artilleryKillCooldown);
  }
  function useCommandAbility(){
    if(!run||!run.active||!run.commandUnlocked||run.commandCd>0)return;
    run.commandCd=run.commandMaxCd;
    run.commandActive=run.commandDuration;
    run.feedback={text:'HOLT · COMMAND BURST',source:'commander',life:1.7,max:1.7};
    combatSfx('event');combatHaptic('success',220);
    pushParticle({x:run.hq.x,y:run.hq.y,life:.75,max:.75,r:70*dpr(),color:'#74e9ff',type:'command'});
  }
  function defeatAdvice(){
    if(meta.hq<2)return 'Recommended next: upgrade Headquarters for more health, stronger barriers, and the reinforced Level 2 compound.';
    if(purchasedResearchCount()<3)return 'Recommended next: open the Research Center and complete an available permanent upgrade.';
    if(meta.commander<4)return 'Recommended next: upgrade Commander Holt to increase damage and fire rate.';
    return 'Recommended next: advance the Fire Control or Fortifications research branch.';
  }
  function equipmentDropMarkup(award){
    if(!award||!award.definition||!award.instance)return'';
    var definition=award.definition,rarity=equipmentRarity(definition.rarity),slot=equipmentSlot(definition.slot),capacityNote='STORED IN INVENTORY';
    if(award.displaced)capacityNote='ARMORY FULL · '+award.displaced.definition.name.toUpperCase()+' AUTO-SALVAGED FOR '+award.displaced.value.credits+' CREDITS'+(award.displaced.value.parts?' + '+award.displaced.value.parts+' TECH PART'+(award.displaced.value.parts===1?'':'S'):'');
    else if(award.overCapacity)capacityNote='ARMORY OVER CAPACITY · LOCKED OR EQUIPPED ITEMS WERE PRESERVED';
    return '<div class="l167-result-drop '+definition.rarity+'"><div class="l167-result-drop-head">'+equipmentIcon(definition.slot)+'<div class="l167-result-drop-copy"><small>'+(award.firstClear?'FIRST-CLEAR EQUIPMENT':'EQUIPMENT RECOVERED')+' · '+rarity.label+' · '+slot.short+'</small><b>'+definition.name+'</b><span>'+definition.effectText+'</span><span>'+capacityNote+'</span></div></div><button id="l167-equip-drop" data-equipment-uid="'+award.instance.uid+'">EQUIP NOW · POWER +'+definition.power+'</button></div>';
  }
  function finish(won) {
    if (!run || run.complete) return;
    run.complete = true;
    run.active = false;
    run.won = !!won;
    run.upgradeOpen = false;
    combatSfx(won?'victory':'defeat');
    combatHaptic(won?'success':'error',300);
    id('hq-upgrade-overlay').classList.remove('show');
    G.state.waveInProgress = false;
    var clearedPhase = run.phase,operation=!!run.operation,operationKind=operation?(run.operationKind||'containment'):null,operationLevel=operation?run.operationLevel:0,operationRewarded=operation&&won&&!!run.operationRewardEligible&&operationRewardAvailable(),definition=operation?operationDefinition(operationKind):null;
    var firstClear=!operation&&won&&clearedPhase>meta.bestPhase;
    var baseCampaignReward=won?BALANCE.campaignBaseCredits(clearedPhase,run.kills):(run.freeRetry?0:BALANCE.campaignSalvageCredits(clearedPhase,run.kills));
    var reward = operation?(operationRewarded?operationRewardCreditsFor(operationKind,operationLevel):0):(won?campaignCreditReward(baseCampaignReward,run.energySpend||1):baseCampaignReward);
    var parts = won?(operation?(operationRewarded?operationRewardPartsFor(operationKind,operationLevel):0):BALANCE.campaignParts(clearedPhase,firstClear)):0;
    meta.credits += reward;
    meta.parts += parts;
    var equipmentAward=!operation&&won?awardEquipmentDrop(clearedPhase,firstClear):null;
    if(operation){
      if(won){
        if(operationRewarded)meta.operationLastClearDay=localDayKey();
        if(operationKind==='junkyard'){
          meta.junkyardManualBest=Math.max(meta.junkyardManualBest,operationLevel);
          meta.junkyardLevel=Math.min(OPERATION_LEVEL_GUARD,Math.max(meta.junkyardLevel,operationLevel+1));
        }else{
          meta.operationManualBest=Math.max(meta.operationManualBest,operationLevel);
          meta.operationLevel=Math.min(OPERATION_LEVEL_GUARD,Math.max(meta.operationLevel,operationLevel+1));
        }
        operationNotice={kind:operationKind,method:'manual',level:operationLevel,nextLevel:operationLevelFor(operationKind),rewarded:operationRewarded,credits:reward,parts:parts};
      }
    }else if (won) {
      meta.bestPhase = Math.max(meta.bestPhase, clearedPhase);
      if (clearedPhase >= meta.phase) meta.phase = clearedPhase + 1;
      delete meta.phaseLosses[String(clearedPhase)];
      if(meta.campaignRetryPhase===clearedPhase)meta.campaignRetryPhase=null;
    } else {
      if(!run.freeRetry){
        meta.phaseLosses[String(clearedPhase)]=phaseLossCount(clearedPhase)+1;
        meta.campaignRetryPhase=clearedPhase;
      }
    }
    saveMeta();
    var nextSupport=operation||won?0:retryAssist(clearedPhase),supportCopy=nextSupport>0?' Field support is active for the next paid attempt: enemy health and damage -'+Math.round(nextSupport*100)+'%.':'';
    var nextOperationLevel=operation?operationLevelFor(operationKind):0,vehicle=operationKind==='junkyard'?run.objectiveVehicle:null,vehicleArmor=Math.max(0,Math.ceil(vehicle?vehicle.hp:0)),vehicleArmorPct=vehicle?Math.max(0,Math.ceil(vehicle.hp/Math.max(1,vehicle.maxHp)*100)):0;
    id('l137-result-kicker').textContent = operation?(operationKind==='junkyard'?(won?'JUNKYARD RECOVERY COMPLETE':'JUNKYARD RECOVERY FAILED'):(won?'DAILY OPERATION COMPLETE':'DAILY OPERATION FAILED')):(won?'MISSION ACCOMPLISHED':'MISSION FAILED');
    id('l137-result-title').textContent = operation?(operationKind==='junkyard'?(won?'ARMORED CONVOY DESTROYED':'TARGET ESCAPED'):(won?'CONTAINMENT LEVEL '+operationLevel+' SECURED':'CONTAINMENT LEVEL '+operationLevel+' LOST')):(won?'PHASE '+clearedPhase+' SECURED':'HEADQUARTERS LOST');
    id('l137-result-copy').textContent = operation?(operationKind==='junkyard'?(won?(operationRewarded?'Recovery Level '+operationLevel+' is complete and today’s shared operation reward is claimed. Level '+nextOperationLevel+' is ready.':'Practice destruction recorded without additional resources. Recovery Level '+nextOperationLevel+' is ready for continued testing.'):'The armored transport reached extraction with '+formatNumber(vehicleArmor)+' armor remaining. Recovery Level '+operationLevel+' remains open.'):(won?(operationRewarded?'Containment Level '+operationLevel+' is secure and today’s shared operation reward is claimed. Level '+nextOperationLevel+' is ready.':'Practice clear recorded without additional resources. Containment Level '+nextOperationLevel+' is ready for continued testing.'):'The infected breached Containment Level '+operationLevel+'. This level remains open until its first successful clear.')):(won?'The Siege Breaker is destroyed. Phase '+meta.phase+' is ready for deployment.':defeatAdvice()+supportCopy);
    var integrity=Math.max(0,Math.round(run.hq.hp/Math.max(1,run.hq.maxHp)*100)),survivingBarriers=run.lanes.filter(function(lane){return lane.barricade.hp>0;}).length;
    var campaignBoost=!operation&&won&&campaignCreditMultiplier(run.energySpend||1)>1?' · '+campaignMultiplierLabel(run.energySpend||1)+' · '+(run.energySpend||1)+' ENERGY COMMITTED':'';
    var rewardLabel=operation?(won?(operationRewarded?definition.levelLabel+' '+operationLevel+' DAILY REWARD':'PRACTICE CLEAR · DAILY REWARD ALREADY CLAIMED'):'NO DAILY REWARD · '+definition.levelLabel+' '+operationLevel+' REMAINS OPEN'):(won?'VICTORY REWARD'+campaignBoost:run.freeRetry?'NO ADDITIONAL SALVAGE · FREE RETRY SPENT':'SALVAGE REWARD · ONE ENERGY-FREE RETRY AVAILABLE');
    var survivalLabel=operationKind==='junkyard'?(won?'TARGET DESTROYED · '+formatObjectiveTime(run.objectiveTime)+' REMAINING':'TARGET ESCAPED · '+vehicleArmorPct+'% ARMOR REMAINED'):operation?'FORWARD LINE '+integrity+'% · '+survivingBarriers+'/'+run.lanes.length+' LANES HELD':'HQ INTEGRITY '+integrity+'% · '+survivingBarriers+'/'+run.lanes.length+' BARRIERS SURVIVED';
    var resultMetric=operationKind==='junkyard'?(won?'ARMORED TRANSPORT DESTROYED':formatNumber(vehicleArmor)+' ARMOR REMAINING'):formatNumber(run.kills)+' ENEMIES ELIMINATED';
    var rewardResources=operation&&(!won||!operationRewarded)?'<div class="l175-no-reward">'+(won?'NO ADDITIONAL RESOURCES':'NO RESOURCES AWARDED')+'</div>':'<div class="l166-reward-resources">'+(parts?resourcePair(reward,parts):resourceMarkup('credits',reward,'CREDITS'))+'</div>';
    id('l137-result-reward').innerHTML = rewardResources+'<small>'+rewardLabel+'</small><small>'+resultMetric+'</small><small>HOLT '+formatNumber(run.damage.commander)+' · TURRET '+formatNumber(run.damage.turret)+' · ARTILLERY '+formatNumber(run.damage.artillery)+'</small><small class="l167-result-survival">'+survivalLabel+'</small>'+equipmentDropMarkup(equipmentAward);
    var equipDrop=id('l167-equip-drop');if(equipDrop)equipDrop.onclick=function(){if(equipEquipment(equipDrop.dataset.equipmentUid,true)){equipDrop.disabled=true;equipDrop.textContent='EQUIPPED · ACTIVE NEXT DEPLOYMENT';}};
    id('l141-continue').textContent = operation?(won?(QA_TEST_ACCESS?'DEPLOY '+definition.levelLabel+' '+nextOperationLevel:'RETURN TO COMMAND BASE'):'RETRY '+definition.levelLabel+' '+operationLevel):(won?'CONTINUE TO PHASE '+meta.phase:'RETRY PHASE '+clearedPhase+(run.freeRetry?'':' · ENERGY FREE'));
    id('l137-retry').textContent = 'REPLAY PHASE ' + clearedPhase;
    id('l137-retry').style.display = !operation&&won ? '' : 'none';
    id('lsc137-result').classList.add('show');
  }
  function returnHome(){
    var destination=run&&run.operation?'operations':'campaign';
    closePause();hideBattleLoading();_gameSpeed=1;id('lsc137-result').classList.remove('show');id('lsc137-app').classList.remove('hidden');document.body.classList.remove('lsc137-mode');document.body.classList.remove('l172-operation-mode');document.body.classList.remove('l182-junkyard-mode');var progress=id('l139-progress');if(progress)progress.classList.remove('l168-boss-hud');if(window.LSC3DPrototype)window.LSC3DPrototype.stop();if(run){run.enemies=[];run.corpses=[];run.bullets=[];run.lanes.forEach(function(lane){lane.queue=[];});run.active=false;}run=null;G.state._centralHQMode=false;G.state.waveInProgress=false;renderTab(destination);
  }

  function updateBattleHUD(force){
    if(!run)return;
    var hudNow=performance.now(),hudInterval=Math.max(50,Number(run.performance&&run.performance.hudIntervalMs)||84);
    if(!force&&run.lastHudUpdate&&hudNow-run.lastHudUpdate<hudInterval)return;
    run.lastHudUpdate=hudNow;
    if(run.operationKind==='junkyard'){
      var vehicle=run.objectiveVehicle,maxArmor=Math.max(1,vehicle?vehicle.maxHp:1),armor=Math.max(0,vehicle?vehicle.hp:0),destroyedPct=Math.min(100,Math.max(0,Math.round((1-armor/maxArmor)*100))),fill=id('l139-progress-fill'),label=id('l139-progress-label'),count=id('l139-progress-count'),progress=id('l139-progress');
      if(progress)progress.classList.add('l168-boss-hud');
      if(fill)fill.style.width=destroyedPct+'%';
      if(label)label.textContent='ARMORED TRANSPORT · '+destroyedPct+'% DESTROYED';
      if(count)count.textContent=formatObjectiveTime(run.objectiveTime)+' REMAINING · '+formatNumber(Math.ceil(armor))+' / '+formatNumber(Math.ceil(maxArmor))+' ARMOR';
      return;
    }
    var completed=0,total=1;for(var i=0;i<run.assaultTargets.length;i++){total+=run.assaultTargets[i];if(i<run.assault-1)completed+=run.assaultTargets[i];}completed+=run.assaultKills;if(run.bossDefeated)completed++;
    var pct=Math.min(100,Math.floor((completed/total)*100));
    var fill=id('l139-progress-fill'),label=id('l139-progress-label'),count=id('l139-progress-count'),progress=id('l139-progress'),boss=run.enemies.filter(function(e){return e.hp>0&&((run.bossEntityId!=null&&e.id===run.bossEntityId)||e.kind==='boss');})[0];
    if(progress)progress.classList.toggle('l168-boss-hud',!!boss);
    if(boss){
      var bossPct=Math.max(0,Math.ceil(boss.hp/Math.max(1,boss.maxHp)*100));
      if(fill)fill.style.width=bossPct+'%';
      if(label)label.textContent=(run.operation?'CONTAINMENT ALPHA · LEVEL '+run.operationLevel:'SIEGE BREAKER')+' · '+bossPct+'%';
      if(count)count.textContent=Math.ceil(boss.hp)+' / '+Math.ceil(boss.maxHp)+' HP';
    }else{
      if(fill)fill.style.width=pct+'%';
      if(label)label.textContent=(run.bossSpawned&&!run.bossDefeated?(run.operation?'FINAL PUSH · CONTAINMENT LEVEL '+run.operationLevel:'FINAL ASSAULT · SIEGE BREAKER'):(run.operation?'CONTAINMENT LEVEL '+run.operationLevel:'PHASE '+run.phase)+' · ASSAULT '+run.assault+'/3')+' · '+pct+'%'+(run.assist>0?' · SUPPORT '+Math.round(run.assist*100)+'%':'');
      if(count){var barriers=run.lanes.filter(function(lane){return lane.barricade.hp>0;}).length;count.textContent=run.enemies.filter(function(e){return e.hp>0;}).length+' THREATS · '+barriers+'/'+run.lanes.length+(run.operation?' LANES':' BARRIERS');}
    }
  }

  function assaultPacing(assault){
    if(assault===1)return{interval:1.18,group:2};
    if(assault===2)return{interval:1.02,group:2};
    return{interval:.90,group:3};
  }
  function chooseEnemyKind(assault){
    var roll=Math.random();
    if(assault===1)return roll>.82?'runner':'grunt';
    if(assault===2)return roll<.18?'armored':roll>.78?'runner':'grunt';
    return roll<.27?'armored':roll>.78?'runner':'grunt';
  }
  function recoverBetweenAssaults(){
    if(run.assaultHqRepair>0)run.hq.hp=Math.min(run.hq.maxHp,run.hq.hp+run.assaultHqRepair);
    if(run.assaultBarrierRepair>0)run.lanes.forEach(function(repairLane){if(repairLane.barricade.hp>0)repairLane.barricade.hp=Math.min(repairLane.barricade.maxHp,repairLane.barricade.hp+run.assaultBarrierRepair);});
    if(run.rebuildBarrierFraction>0){
      var destroyed=run.lanes.filter(function(repairLane){return repairLane.barricade.hp<=0;})[0];
      if(destroyed)destroyed.barricade.hp=Math.max(1,Math.ceil(destroyed.barricade.maxHp*run.rebuildBarrierFraction));
    }
    if(run.assaultArtilleryReady>0)run.abilityCd=0;
  }
  function updateJunkyard(dt){
    var vehicle=run.objectiveVehicle;
    run.objectiveTime=Math.max(0,run.objectiveTime-dt);
    var progress=clamp(1-run.objectiveTime/Math.max(.001,run.objectiveDuration),0,1),worldX=JUNKYARD_VEHICLE_PATH.start.x+(JUNKYARD_VEHICLE_PATH.end.x-JUNKYARD_VEHICLE_PATH.start.x)*progress,worldY=JUNKYARD_VEHICLE_PATH.start.y+(JUNKYARD_VEHICLE_PATH.end.y-JUNKYARD_VEHICLE_PATH.start.y)*progress;
    if(vehicle&&!run.vehicleDestroyed){vehicle.x=run.hq.x+worldX*run.worldScale;vehicle.y=run.hq.y+worldY*run.worldScale;vehicle.age+=dt;vehicle.hit=Math.max(0,vehicle.hit-dt);vehicle.flash=Math.max(0,vehicle.flash-dt);vehicle.moving=true;}
    [run.hero,run.turret].concat(run.squad).forEach(function(a){a.cd-=dt;var t=nearest(a,a.range);if(!t&&a.source==='turret')a.aim=a.parkAim;if(t&&a.cd<=0){fire(a,t,a.damage);var rally=a.source==='commander'||a.source==='turret'?run.commandActive>0?run.commandRate:1:1;a.cd=1/(a.rate*rally);}});
    for(var b=run.bullets.length-1;b>=0;b--){var q=run.bullets[b];q.px=q.x;q.py=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;var hit=-1;for(var j=0;j<run.enemies.length;j++)if(dist(q,run.enemies[j])<run.enemies[j].r+4*dpr()){hit=j;break;}if(hit>=0){var target=run.enemies[hit],dealt=Math.min(q.damage,target.hp);target.hp-=q.damage;target.hit=.16;run.damage[q.source]+=dealt;pushParticle({x:target.x,y:target.y,life:.32,max:.32,r:(q.source==='turret'?18:12)*dpr(),color:q.color,type:q.source==='turret'?'turret-impact':'commander-impact'});run.bullets.splice(b,1);if(target.hp<=0)kill(hit,target);}else if(q.life<=0)run.bullets.splice(b,1);}
    [run.hero,run.turret].concat(run.squad).forEach(function(a){a.flash=Math.max(0,(a.flash||0)-dt);});
    for(var p=run.particles.length-1;p>=0;p--){run.particles[p].life-=dt;if(run.particles[p].life<=0)run.particles.splice(p,1);}
    if(run.feedback){run.feedback.life-=dt;if(run.feedback.life<=0)run.feedback=null;}
    if(run.vehicleDestroyed){finish(true);return;}
    if(run.objectiveTime<=0){if(vehicle)vehicle.moving=false;finish(false);}
  }
  function updateBattleControls(force){
    if(!run)return;
    var controlNow=performance.now(),controlInterval=Math.max(50,Number(run.performance&&run.performance.hudIntervalMs)||84);
    if(!force&&run.lastControlUpdate&&controlNow-run.lastControlUpdate<controlInterval)return;
    run.lastControlUpdate=controlNow;
    var ab=id('lsc137-ability'),abilityText=run.abilityCd>0?Math.ceil(run.abilityCd)+'s':'ARTILLERY';
    if(ab){if(ab.disabled!==(run.abilityCd>0))ab.disabled=run.abilityCd>0;if(ab.textContent!==abilityText)ab.textContent=abilityText;}
    var command=id('lsc168-command'),commandText=!run.commandUnlocked?'LOCKED':run.commandActive>0?'RALLY':run.commandCd>0?Math.ceil(run.commandCd)+'s':run.operation?'RALLY':'COMMAND';
    if(command){var commandDisabled=!run.commandUnlocked||run.commandCd>0;if(command.disabled!==commandDisabled)command.disabled=commandDisabled;if(command.textContent!==commandText)command.textContent=commandText;}
  }
  function update(dt){
    if(!run||!run.active||run.paused||run.upgradeOpen)return;
    run.elapsed+=dt;
    run.assaultElapsed+=dt;
    run.spawn-=dt;
    run.abilityCd=Math.max(0,run.abilityCd-dt);
    run.commandCd=Math.max(0,run.commandCd-dt);
    run.commandActive=Math.max(0,run.commandActive-dt);
    updateBattleControls(false);
    if(run.operationKind==='junkyard'){updateJunkyard(dt);return;}
    var target=run.assaultTargets[run.assault-1],remaining=target-run.assaultSpawned,pacing=assaultPacing(run.assault);
    if(run.spawn<=0&&remaining>0){
      var group=Math.min(remaining,pacing.group);
      for(var g=0;g<group;g++){run.enemies.push(enemy(chooseEnemyKind(run.assault)));run.assaultSpawned++;}
      run.spawn=pacing.interval*(.92+Math.random()*.16);
    }
    if(run.assault===3&&run.assaultSpawned>=target&&!run.bossSpawned&&run.enemies.length===0&&run.bullets.length===0){var siegeBreaker=enemy('boss');run.bossSpawned=true;run.bossEntityId=siegeBreaker.id;run.enemies.push(siegeBreaker);updateBattleHUD(true);combatSfx('bossAlarm');combatHaptic('heavy',300);}
    [run.hero,run.turret].concat(run.squad).forEach(function(a){a.cd-=dt;var t=nearest(a,a.range);if(!t&&a.source==='turret')a.aim=a.parkAim;if(t&&a.cd<=0){fire(a,t,a.damage);var rally=a.source==='commander'||a.source==='turret'?run.commandActive>0?run.commandRate:1:1;a.cd=1/(a.rate*rally);}});
    run.lanes.forEach(function(lane){lane.barricade.flash=Math.max(0,lane.barricade.flash-dt);});
    for(var i=run.enemies.length-1;i>=0;i--){var e=run.enemies[i],lane=run.lanes[e.lane],queueIndex=lane?lane.queue.indexOf(e):-1;if(!lane||queueIndex<0)continue;var front=queueIndex===0,barrierUp=lane.barricade.hp>0,bossPadding=e.kind==='boss'?(run.operation?OPERATION_BOSS_PADDING_WORLD:.9):e.kind==='armored'?.25:0,hqStop=e.kind==='boss'?(run.operation?OPERATION_BOSS_HQ_STOP_WORLD_RADIUS:BOSS_HQ_STOP_WORLD_RADIUS):HQ_ATTACK_WORLD_RADIUS+bossPadding,targetWorld=front?(barrierUp?BARRICADE_STOP_WORLD_RADIUS+bossPadding:hqStop):QUEUE_START_WORLD_RADIUS+Math.max(0,queueIndex-1)*QUEUE_GAP_WORLD_RADIUS,targetPoint=lanePoint(lane,targetWorld,0),tx=targetPoint.x,ty=targetPoint.y,x=tx-e.x,y=ty-e.y,l=Math.hypot(x,y);e.age+=dt;e.hit=Math.max(0,e.hit-dt);e.flash=Math.max(0,e.flash-dt);e.aim=Math.atan2(run.hq.y-e.y,run.hq.x-e.x);e.waiting=!front;
      if(!front){e.engaged=false;e.targetType='queue';if(l>2*dpr()){e.moving=true;var queueStep=Math.min(l,e.speed*dt);e.x+=x/l*queueStep;e.y+=y/l*queueStep;}else{e.moving=false;e.x=tx;e.y=ty;}continue;}
      var targetType=barrierUp?'barricade':'hq';if(e.targetType!==targetType){e.engaged=false;e.targetType=targetType;e.cd=Math.min(e.cd,.18);}
      if(!e.engaged){if(l>2*dpr()){e.moving=true;var step=Math.min(l,e.speed*dt);e.x+=x/l*step;e.y+=y/l*step;}else{e.engaged=true;e.moving=false;e.x=tx;e.y=ty;e.cd=Math.min(e.cd,.18);}}else{e.x=tx;e.y=ty;e.moving=false;e.cd-=dt;if(e.cd<=0){if(targetType==='barricade'){var beforeHp=lane.barricade.hp,barrierDamage=e.damage*(1-(run.barrierDamageReduction||0));lane.barricade.hp=Math.max(0,beforeHp-barrierDamage);lane.barricade.flash=.2;var barrierFx=lanePoint(lane,BARRICADE_WORLD_RADIUS,0);pushParticle({x:barrierFx.x,y:barrierFx.y,life:.26,max:.26,r:11*dpr(),color:'#e1aa67',type:'barrier'});combatSfx('barrierHit',145);if(lane.barricade.hp<=0&&beforeHp>0){combatSfx('barrierBreak');combatHaptic('medium',260);e.engaged=false;e.targetType='hq';}}else{var hqReduction=run.hqDamageReduction||0;if(run.hq.maxHp>0&&run.hq.hp/run.hq.maxHp<=.35)hqReduction+=run.hqEmergencyReduction||0;run.hq.hp-=e.damage*(1-clamp(hqReduction,0,.8));run.lastHit=performance.now();pushParticle({x:run.hq.x+(Math.random()-.5)*run.hq.r,y:run.hq.y+(Math.random()-.5)*run.hq.r,life:.24,max:.24,r:13*dpr(),color:'#ff6248',type:'hq-hit'});combatSfx('hqHit',280);combatHaptic('medium',650);}e.cd=e.attackCycle||ENEMY_ATTACK_CYCLE;e.flash=.18;}}
    }
    for(var b=run.bullets.length-1;b>=0;b--){var q=run.bullets[b];q.px=q.x;q.py=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;var hit=-1;for(var j=0;j<run.enemies.length;j++)if(dist(q,run.enemies[j])<run.enemies[j].r+4*dpr()){hit=j;break;}if(hit>=0){var target=run.enemies[hit],dealt=Math.min(q.damage,target.hp);target.hp-=q.damage;target.hit=.16;run.damage[q.source]+=dealt;pushParticle({x:target.x,y:target.y,life:.26,max:.26,r:(q.source==='turret'?14:9)*dpr(),color:q.color,type:q.source==='turret'?'turret-impact':'commander-impact'});run.bullets.splice(b,1);if(target.hp<=0)kill(hit,target);}else if(q.life<=0)run.bullets.splice(b,1);}
    [run.hero,run.turret].concat(run.squad).forEach(function(a){a.flash=Math.max(0,(a.flash||0)-dt);});for(var c=run.corpses.length-1;c>=0;c--){run.corpses[c].life-=dt;if(run.corpses[c].life<=0)run.corpses.splice(c,1);}for(var p=run.particles.length-1;p>=0;p--){run.particles[p].life-=dt;if(run.particles[p].life<=0)run.particles.splice(p,1);}if(run.feedback){run.feedback.life-=dt;if(run.feedback.life<=0)run.feedback=null;}
    if(run.hq.hp<=0){finish(false);return;}
    var cleared=run.assaultSpawned>=target&&run.enemies.length===0&&run.bullets.length===0&&(run.assault<3||run.bossDefeated);
    if(cleared){
      run.transition+=dt;
      if(run.transition>=1.2){
        if(run.assault===3)finish(true);
        else{
          recoverBetweenAssaults();
          run.assault++;run.assaultElapsed=0;run.assaultSpawned=0;run.assaultKills=0;run.spawn=.6;run.transition=0;
          combatSfx('phase');combatHaptic('light',180);
        }
      }
    }else run.transition=0;
  }
  function circle(x,y,r,fill,stroke,w){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w||1;ctx.stroke();}}
  function poly(points,fill,stroke,w){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w||1;ctx.stroke();}}
  function spriteCell(index,x,y,w,h,alpha){if(!combatAtlas.complete||!combatAtlas.naturalWidth)return false;var col=index%4,row=Math.floor(index/4),sw=combatAtlas.naturalWidth/4,sh=combatAtlas.naturalHeight/2;ctx.save();ctx.globalAlpha=alpha==null?1:alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(combatAtlas,col*sw,row*sh,sw,sh,x-w/2,y-h,w,h);ctx.restore();return true;}
  function animationCell(row,frame,x,y,w,h,flip,alpha,rotation){if(!animationAtlas.complete||!animationAtlas.naturalWidth)return false;var sw=animationAtlas.naturalWidth/5,sh=animationAtlas.naturalHeight/5;ctx.save();ctx.translate(x,y);if(rotation)ctx.rotate(rotation);ctx.scale(flip?-1:1,1);ctx.globalAlpha=alpha==null?1:alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(animationAtlas,frame*sw,row*sh,sw,sh,-w/2,-h,w,h);ctx.restore();return true;}
  function animatedUnit(a,row,w,h,moving,dead){var s=dpr(),clock=(a.age==null?run.elapsed:a.age),frame=0,bob=0,rot=0;if(dead){frame=4;rot=(1-(a.life/a.max))*.12;}else if((a.hit||0)>0){frame=4;rot=Math.sin(clock*70)*.035;}else if((a.flash||0)>0){frame=3;rot=-.025;}else if(moving){frame=1+(Math.floor(clock*7)%2);bob=Math.sin(clock*14)*2.2*s;}else{bob=Math.sin(clock*3.2)*.8*s;}var aim=a.aim==null?-Math.PI/2:a.aim,flip=Math.cos(aim)<0;return animationCell(row,frame,a.x,a.y+bob,w*s,h*s,flip,dead?clamp(a.life/a.max,0,1):1,rot);}
  function drawProductionSoldier(a,hostile,heavy,commander){var s=dpr(),row=commander?0:hostile?(heavy?3:2):1;if(!animatedUnit(a,row,heavy?58:46,heavy?82:68,!!a.moving,false)){var cell=commander?0:hostile?(heavy?3:2):1;if(!spriteCell(cell,a.x,a.y+(heavy?22:17)*s,(heavy?52:43)*s,(heavy?76:65)*s))return drawSoldier(a,hostile,heavy,commander);}if(a.flash){var aim=a.aim==null?-Math.PI/2:a.aim,color=commander?'#fff07a':hostile?'#ff6a4a':'#8edcff';ctx.save();ctx.translate(a.x,a.y);ctx.rotate(aim);ctx.shadowColor=color;ctx.shadowBlur=12*s;poly([[29*s,0],[20*s,-5*s],[20*s,5*s]],color);ctx.restore();}}
  function drawProductionHQ(h){var s=dpr(),level=Math.min(5,Math.max(1,Number(h.level)||1)),wallW=(50+(level-1)*7)*s,wallH=(37+(level-1)*5)*s;ctx.save();ctx.translate(h.x,h.y+5*s);ctx.fillStyle=level>=4?'rgba(45,83,86,.72)':'rgba(61,76,67,.64)';ctx.strokeStyle=level>=5?'#7ef8ff':level>=3?'#d4b45e':'#9a8653';ctx.lineWidth=(1+level)*s;ctx.fillRect(-wallW,-wallH,wallW*2,wallH*2);ctx.strokeRect(-wallW,-wallH,wallW*2,wallH*2);if(level>=3){[[-wallW,-wallH],[wallW,-wallH],[-wallW,wallH],[wallW,wallH]].forEach(function(point){circle(point[0],point[1],(4+level)*s,level>=5?'#2e686e':'#526b68',level>=5?'#9cecff':'#d4b45e',2*s);});}ctx.restore();if(!spriteCell(4,h.x,h.y+43*s,(128+(level-1)*4)*s,(120+(level-1)*4)*s))drawHQ(h);}
  function drawProductionTurret(t){var s=dpr(),target=nearest(t,t.range),ang=target?Math.atan2(target.y-t.y,target.x-t.x):(t.aim==null?t.parkAim:t.aim);t.aim=ang;if(!spriteCell(5,t.x,t.y+26*s,88*s,80*s))return drawTurret(t);if(t.flash){ctx.save();ctx.translate(t.x,t.y);ctx.rotate(ang);ctx.shadowColor='#ff9d35';ctx.shadowBlur=18*s;poly([[47*s,0],[35*s,-8*s],[35*s,8*s]],'#ffd166');ctx.restore();}}
  function drawProductionBoss(e){var s=dpr();if(!animatedUnit(e,4,145,133,!!e.moving,false)&&!spriteCell(7,e.x,e.y+49*s,140*s,133*s))drawBoss(e);}
  function drawProductionPerimeter(h){var s=dpr(),level=Math.min(5,Math.max(1,Number(h.level)||1));if(!combatAtlas.complete||!combatAtlas.naturalWidth)return drawPerimeter(h);run.lanes.forEach(function(lane){if(lane.barricade.hp<=0)return;var point=lanePoint(lane,BARRICADE_WORLD_RADIUS,0),alpha=lane.barricade.flash>0?.58:1,width=(66+(level-1)*4)*s,height=(42+(level-1)*5)*s;ctx.save();ctx.translate(point.x,point.y);ctx.rotate(lane.rotation);spriteCell(6,0,12*s,width,height,alpha);if(level>=2){ctx.strokeStyle=level>=5?'#7ef8ff':level>=4?'#86a5a5':'#c3ad70';ctx.lineWidth=Math.max(1,level-1)*s;ctx.strokeRect(-width*.48,-height*.35,width*.96,height*.28);}ctx.restore();});}
  function drawEnvironment(W,H,h){var s=dpr(),lane='#2a3128';ctx.fillStyle='#111710';ctx.fillRect(0,0,W,H);var glow=ctx.createRadialGradient(h.x,h.y,30*s,h.x,h.y,Math.max(W,H)*.7);glow.addColorStop(0,'rgba(73,91,53,.78)');glow.addColorStop(.55,'rgba(37,48,31,.55)');glow.addColorStop(1,'rgba(7,10,8,.92)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(h.x,h.y);ctx.strokeStyle=lane;ctx.lineWidth=28*s;ctx.setLineDash([12*s,8*s]);for(var a=0;a<TAU;a+=Math.PI/2){ctx.beginPath();ctx.moveTo(Math.cos(a)*112*s,Math.sin(a)*112*s);ctx.lineTo(Math.cos(a)*Math.max(W,H),Math.sin(a)*Math.max(W,H));ctx.stroke();}ctx.restore();ctx.save();ctx.strokeStyle='rgba(219,205,140,.22)';ctx.lineWidth=8*s;ctx.setLineDash([18*s,7*s]);run.lanes.forEach(function(item,index){var p=lanePoint(item,BARRICADE_WORLD_RADIUS,0);if(index===0){ctx.beginPath();ctx.moveTo(p.x,p.y);}else ctx.lineTo(p.x,p.y);});ctx.closePath();ctx.stroke();ctx.restore();for(var i=0;i<34;i++){var px=(i*83%Math.max(1,W-20*s))+10*s,py=(i*137%Math.max(1,H-80*s))+46*s;ctx.fillStyle=i%3?'rgba(124,137,95,.14)':'rgba(73,83,62,.22)';ctx.fillRect(px,py,(i%4+2)*s,(i%3+1)*s);}drawProductionPerimeter(h);}
  function drawOperationEnvironment(W,H,h){var s=dpr(),horizon=H*.17,deckY=h.y+58*s;ctx.fillStyle='#081419';ctx.fillRect(0,0,W,H);var sky=ctx.createLinearGradient(0,horizon,0,H);sky.addColorStop(0,'#17262a');sky.addColorStop(.35,'#253b3b');sky.addColorStop(1,'#101b1d');ctx.fillStyle=sky;ctx.fillRect(0,horizon,W,H-horizon);ctx.fillStyle='rgba(5,12,15,.92)';for(var skyline=0;skyline<9;skyline++){var buildingW=(24+(skyline%3)*11)*s,buildingH=(24+(skyline%4)*13)*s,x=skyline*W/8-buildingW*.45;ctx.fillRect(x,horizon-buildingH,buildingW,buildingH);}ctx.fillStyle='#202c2d';poly([[W*.12,H],[W*.34,horizon],[W*.66,horizon],[W*.88,H]],'#202c2d');var laneCenters=[.32,.5,.68];laneCenters.forEach(function(center,index){var topX=W*(.44+(center-.5)*.35),bottomX=W*center,topWidth=14*s,bottomWidth=52*s;poly([[topX-topWidth/2,horizon],[topX+topWidth/2,horizon],[bottomX+bottomWidth/2,H],[bottomX-bottomWidth/2,H]],index===1?'rgba(43,70,73,.78)':'rgba(35,58,61,.72)','rgba(105,230,241,.18)',s);ctx.strokeStyle='rgba(255,209,102,.3)';ctx.lineWidth=2*s;ctx.setLineDash([10*s,10*s]);ctx.beginPath();ctx.moveTo(topX,horizon);ctx.lineTo(bottomX,H);ctx.stroke();ctx.setLineDash([]);});ctx.fillStyle='#13272b';ctx.fillRect(W*.18,deckY-10*s,W*.64,42*s);ctx.strokeStyle='#56d8e8';ctx.lineWidth=2*s;ctx.strokeRect(W*.18,deckY-10*s,W*.64,42*s);ctx.fillStyle='#d5b758';ctx.fillRect(W*.18,deckY+27*s,W*.64,4*s);ctx.fillStyle='rgba(7,15,18,.82)';ctx.fillRect(W*.27,44*s,W*.46,20*s);ctx.strokeStyle='rgba(94,234,247,.55)';ctx.strokeRect(W*.27,44*s,W*.46,20*s);ctx.fillStyle='#81efff';ctx.font='bold '+7*s+'px "Share Tech Mono"';ctx.textAlign='center';ctx.fillText('FORWARD CONTAINMENT LINE · THREE APPROACH LANES',W/2,57*s);drawProductionPerimeter(h);}
  function drawJunkyardEnvironment(W,H,h){
    var s=dpr(),scale=run.worldScale,start={x:h.x+JUNKYARD_VEHICLE_PATH.start.x*scale,y:h.y+JUNKYARD_VEHICLE_PATH.start.y*scale},end={x:h.x+JUNKYARD_VEHICLE_PATH.end.x*scale,y:h.y+JUNKYARD_VEHICLE_PATH.end.y*scale};
    ctx.fillStyle='#17130f';ctx.fillRect(0,0,W,H);
    var ground=ctx.createRadialGradient(W*.45,H*.48,20*s,W*.45,H*.48,Math.max(W,H)*.72);ground.addColorStop(0,'#4a3825');ground.addColorStop(.56,'#2b241b');ground.addColorStop(1,'#100f0d');ctx.fillStyle=ground;ctx.fillRect(0,0,W,H);
    for(var grit=0;grit<48;grit++){var gx=(grit*89%Math.max(1,W-12*s))+6*s,gy=(grit*151%Math.max(1,H-55*s))+42*s;ctx.fillStyle=grit%4?'rgba(194,146,78,.10)':'rgba(47,32,21,.35)';ctx.fillRect(gx,gy,(2+grit%5)*s,(1+grit%3)*s);}
    ctx.save();ctx.lineCap='round';ctx.strokeStyle='#16191a';ctx.lineWidth=scale*2.25;ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.strokeStyle='rgba(179,134,74,.42)';ctx.lineWidth=scale*2.47;ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.strokeStyle='#22272a';ctx.lineWidth=scale*2.12;ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.strokeStyle='rgba(255,196,83,.34)';ctx.lineWidth=2*s;ctx.setLineDash([12*s,13*s]);ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    var containers=[[-5.1,-5.6,-.12,'#6c3526'],[-5.45,-3.7,-.18,'#314b4c'],[5.15,-2.15,.18,'#775322'],[4.6,3.45,.12,'#4b5a51']];
    containers.forEach(function(item,index){var x=h.x+item[0]*scale,y=h.y+item[1]*scale;ctx.save();ctx.translate(x,y);ctx.rotate(item[2]);ctx.fillStyle='rgba(0,0,0,.38)';ctx.fillRect(-.72*scale,-.34*scale,1.58*scale,.78*scale);ctx.fillStyle=item[3];ctx.fillRect(-.78*scale,-.41*scale,1.56*scale,.72*scale);ctx.strokeStyle='rgba(255,204,125,.3)';ctx.lineWidth=1.2*s;ctx.strokeRect(-.78*scale,-.41*scale,1.56*scale,.72*scale);for(var rib=-.55;rib<.7;rib+=.32){ctx.beginPath();ctx.moveTo(rib*scale,-.39*scale);ctx.lineTo(rib*scale,.29*scale);ctx.stroke();}ctx.restore();});
    var scrap=[[-5.7,-1.4],[5.45,-5.2],[5.7,.55],[-5.3,5.05],[3.55,5.75]];
    scrap.forEach(function(item,index){var x=h.x+item[0]*scale,y=h.y+item[1]*scale;circle(x,y,.58*scale,'rgba(20,18,16,.78)','rgba(184,126,55,.35)',1.2*s);for(var bit=0;bit<5;bit++){var angle=(index*1.7+bit)*1.21,radius=(.16+bit*.07)*scale;circle(x+Math.cos(angle)*radius,y+Math.sin(angle)*radius,(.11+bit*.025)*scale,bit%2?'#71472d':'#3d4a47');}});
    var dx=end.x-start.x,dy=end.y-start.y,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;ctx.strokeStyle='#9b713f';ctx.lineWidth=5*s;ctx.beginPath();ctx.moveTo(end.x+nx*scale*1.3,end.y+ny*scale*1.3);ctx.lineTo(end.x-nx*scale*1.3,end.y-ny*scale*1.3);ctx.stroke();ctx.fillStyle='#ffc45e';circle(end.x+nx*scale*1.3,end.y+ny*scale*1.3,3*s,'#ffc45e');circle(end.x-nx*scale*1.3,end.y-ny*scale*1.3,3*s,'#ffc45e');
    ctx.fillStyle='rgba(31,38,38,.88)';ctx.strokeStyle='rgba(255,181,75,.55)';ctx.lineWidth=2*s;ctx.fillRect(h.x-5.55*scale,h.y+1.05*scale,2.25*scale,3.75*scale);ctx.strokeRect(h.x-5.55*scale,h.y+1.05*scale,2.25*scale,3.75*scale);
    ctx.fillStyle='rgba(17,12,8,.86)';ctx.fillRect(W*.19,43*s,W*.62,21*s);ctx.strokeStyle='rgba(255,181,75,.58)';ctx.strokeRect(W*.19,43*s,W*.62,21*s);ctx.fillStyle='#ffd083';ctx.font='bold '+7*s+'px "Share Tech Mono"';ctx.textAlign='center';ctx.fillText('JUNKYARD CONVOY ROUTE · EXTRACTION GATE ACTIVE',W/2,57*s);
  }
  function drawArmoredVehicle(e,wreck){
    var s=dpr(),flash=(e.hit||0)>0,body=wreck?'#3a2a22':flash?'#d48142':'#635640',trim=wreck?'#261b17':'#302e29';
    ctx.save();ctx.translate(e.x,e.y);ctx.rotate((e.aim||0)+Math.PI/2);ctx.globalAlpha=wreck ? .76 : 1;ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.ellipse(3*s,8*s,31*s,48*s,0,0,TAU);ctx.fill();
    [[-27,-29],[-27,22],[19,-29],[19,22]].forEach(function(wheel){ctx.fillStyle='#151719';ctx.fillRect(wheel[0]*s,wheel[1]*s,9*s,18*s);ctx.strokeStyle='#6b5b45';ctx.strokeRect(wheel[0]*s,wheel[1]*s,9*s,18*s);});
    poly([[-21*s,38*s],[21*s,38*s],[24*s,-17*s],[16*s,-42*s],[-16*s,-42*s],[-24*s,-17*s]],body,wreck?'#654536':'#d19b51',2*s);ctx.fillStyle=trim;ctx.fillRect(-18*s,-12*s,36*s,34*s);ctx.fillStyle=wreck?'#191515':'#26373a';ctx.fillRect(-13*s,-34*s,26*s,10*s);ctx.strokeStyle='#d1a45d';ctx.lineWidth=2*s;ctx.strokeRect(-16*s,-20*s,32*s,44*s);ctx.fillStyle=wreck?'#4b2720':'#ff5d3d';ctx.fillRect(-17*s,31*s,7*s,4*s);ctx.fillRect(10*s,31*s,7*s,4*s);ctx.fillStyle='#d6b46c';ctx.fillRect(-4*s,-48*s,8*s,12*s);circle(0,-49*s,5*s,wreck?'#38251f':'#ff9e3d','#ffd166',1.5*s);if(wreck){ctx.strokeStyle='#251815';ctx.lineWidth=4*s;ctx.beginPath();ctx.moveTo(-18*s,-31*s);ctx.lineTo(15*s,19*s);ctx.moveTo(17*s,-18*s);ctx.lineTo(-13*s,29*s);ctx.stroke();}ctx.restore();
    ctx.fillStyle=wreck?'#a67c55':'#ffd083';ctx.font='bold '+7*s+'px "Share Tech Mono"';ctx.textAlign='center';ctx.fillText(wreck?'CONVOY WRECK':'ARMORED TRANSPORT',e.x,e.y+55*s);
  }
  function drawPerimeter(h){var s=dpr();run.lanes.forEach(function(lane){if(lane.barricade.hp<=0)return;var point=lanePoint(lane,BARRICADE_WORLD_RADIUS,0),x=point.x,y=point.y;ctx.save();ctx.translate(x,y);ctx.rotate(lane.rotation);ctx.fillStyle=lane.barricade.flash>0?'#a24736':'#5d5138';ctx.fillRect(-27*s,-6*s,54*s,12*s);ctx.fillStyle='#887450';ctx.fillRect(-25*s,-6*s,50*s,4*s);ctx.strokeStyle='rgba(255,216,139,.3)';ctx.strokeRect(-27*s,-6*s,54*s,12*s);ctx.restore();});}
  function drawSoldier(a, hostile, heavy, commander) {
    var s=dpr(), aim=a.aim==null?(hostile?Math.atan2(run.hq.y-a.y,run.hq.x-a.x):-Math.PI/2):a.aim, armor=hostile?(heavy?'#7b3829':'#632d27'):(commander?'#8a7540':'#315d45'),light=hostile?'#ff7458':(commander?'#ffe36d':'#8fffc0'),dark=hostile?'#2b1514':'#14251d';
    ctx.save();ctx.translate(a.x,a.y);ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(1*s,10*s,(heavy?13:10)*s,4*s,0,0,TAU);ctx.fill();ctx.rotate(aim+Math.PI/2);poly([[-7*s,8*s],[7*s,8*s],[9*s,-3*s],[5*s,-9*s],[-5*s,-9*s],[-9*s,-3*s]],armor,light,1.2*s);ctx.fillStyle=dark;ctx.fillRect(-6*s,3*s,12*s,5*s);circle(0,-12*s,(heavy?7:6)*s,dark,light,1.2*s);ctx.fillStyle=light;ctx.fillRect(-5*s,-15*s,10*s,2*s);ctx.strokeStyle=commander?'#ffe36d':'#b8d7c5';ctx.lineWidth=(commander?3:2)*s;ctx.beginPath();ctx.moveTo(4*s,-2*s);ctx.lineTo(5*s,-19*s);ctx.stroke();if(a.flash){ctx.fillStyle=light;ctx.shadowColor=light;ctx.shadowBlur=10*s;poly([[5*s,-25*s],[1*s,-18*s],[9*s,-18*s]],light);}if(commander){ctx.fillStyle='#f1cf52';ctx.fillRect(-10*s,-2*s,3*s,7*s);ctx.fillStyle='#162029';ctx.fillRect(7*s,-4*s,4*s,9*s);}ctx.restore();
  }
  function drawHQ(h) {var s=dpr();ctx.save();ctx.translate(h.x,h.y);ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.ellipse(2*s,32*s,52*s,15*s,0,0,TAU);ctx.fill();poly([[-42*s,-20*s],[0,-39*s],[42*s,-20*s],[0,1*s]],'#42565a','#75e8ff',1.5*s);poly([[-42*s,-20*s],[0,1*s],[0,34*s],[-42*s,13*s]],'#26383b','#17252a');poly([[0,1*s],[42*s,-20*s],[42*s,13*s],[0,34*s]],'#1b2d32','#17252a');poly([[-25*s,-37*s],[0,-48*s],[25*s,-37*s],[0,-26*s]],'#66767a','#9cecff',s);poly([[-25*s,-37*s],[0,-26*s],[0,-12*s],[-25*s,-23*s]],'#344a50');poly([[0,-26*s],[25*s,-37*s],[25*s,-23*s],[0,-12*s]],'#263b42');ctx.fillStyle='#07151b';ctx.fillRect(-9*s,9*s,18*s,22*s);ctx.fillStyle='#ffd166';ctx.fillRect(-3*s,-57*s,6*s,11*s);ctx.strokeStyle='#ffd166';ctx.beginPath();ctx.moveTo(0,-57*s);ctx.lineTo(0,-68*s);ctx.stroke();circle(0,-70*s,3*s,'#ffd166');ctx.fillStyle='#baf3ff';ctx.font='bold '+8*s+'px Rajdhani';ctx.textAlign='center';ctx.fillText('HQ',0,-16*s);ctx.restore();}
  function drawTurret(t){var s=dpr(),target=nearest(t,t.range),ang=target?Math.atan2(target.y-t.y,target.x-t.x):(t.aim==null?t.parkAim:t.aim);t.aim=ang;ctx.save();ctx.translate(t.x,t.y);ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(0,10*s,18*s,6*s,0,0,TAU);ctx.fill();poly([[-15*s,7*s],[0,14*s],[15*s,7*s],[0,0]],'#3e463d','#ff9c3f',s);ctx.rotate(ang);circle(0,0,10*s,'#596154','#ffad52',1.5*s);ctx.fillStyle='#e27a25';ctx.fillRect(2*s,-5*s,28*s,4*s);ctx.fillRect(2*s,2*s,28*s,4*s);if(t.flash){ctx.shadowColor='#ff9d35';ctx.shadowBlur=14*s;poly([[38*s,0],[29*s,-7*s],[29*s,7*s]],'#ffd166');}ctx.restore();ctx.fillStyle='#ffb14a';ctx.font='bold '+7*s+'px "Share Tech Mono"';ctx.textAlign='center';ctx.fillText('MAIN TURRET',t.x,t.y+25*s);}
  function drawBoss(e){var s=dpr(),ang=Math.atan2(run.hq.y-e.y,run.hq.x-e.x);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(ang+Math.PI/2);ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.ellipse(0,18*s,31*s,9*s,0,0,TAU);ctx.fill();poly([[-25*s,17*s],[25*s,17*s],[21*s,-12*s],[12*s,-24*s],[-12*s,-24*s],[-21*s,-12*s]],'#5f2422','#ff553f',2*s);ctx.fillStyle='#2a1417';ctx.fillRect(-19*s,-10*s,38*s,20*s);ctx.fillStyle='#ff833d';ctx.fillRect(-15*s,-15*s,8*s,6*s);ctx.fillRect(7*s,-15*s,8*s,6*s);ctx.strokeStyle='#ffb14a';ctx.lineWidth=5*s;ctx.beginPath();ctx.moveTo(-16*s,-4*s);ctx.lineTo(-25*s,-26*s);ctx.moveTo(16*s,-4*s);ctx.lineTo(25*s,-26*s);ctx.stroke();ctx.restore();ctx.fillStyle='#ffb14a';ctx.font='bold '+8*s+'px "Share Tech Mono"';ctx.textAlign='center';ctx.fillText('SIEGE BREAKER',e.x,e.y+34*s);}
  function drawCommandBastion(){var s=dpr(),h=run.hq,tier=Math.min(5,Math.max(1,Number(h.level)||1));ctx.save();ctx.translate(h.x,h.y-31*s);ctx.fillStyle=tier>=4?'rgba(24,62,66,.92)':'rgba(37,55,51,.9)';ctx.strokeStyle=tier>=5?'#7ef8ff':tier>=3?'#d4b45e':'#78877c';ctx.lineWidth=(1+tier*.45)*s;ctx.beginPath();var w=116*s,hh=54*s,r=9*s,x=-w/2,y=-hh/2;ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+hh-r);ctx.quadraticCurveTo(x+w,y+hh,x+w-r,y+hh);ctx.lineTo(x+r,y+hh);ctx.quadraticCurveTo(x,y+hh,x,y+hh-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=tier>=5?'#7ef8ff':'#d4b45e';ctx.fillRect(-49*s,12*s,98*s,3*s);ctx.strokeStyle='rgba(116,233,255,.48)';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(-51*s,-19*s);ctx.lineTo(51*s,-19*s);ctx.moveTo(-51*s,-19*s);ctx.lineTo(-51*s,13*s);ctx.moveTo(51*s,-19*s);ctx.lineTo(51*s,13*s);ctx.stroke();if(tier>=3){ctx.fillStyle='rgba(22,47,49,.92)';ctx.fillRect(-8*s,-20*s,16*s,12*s);}if(tier>=4){circle(-51*s,-20*s,3*s,'#8fefff');circle(51*s,-20*s,3*s,'#8fefff');}ctx.restore();}
  function draw(){
    if(!run||!ctx)return oldDraw&&oldDraw(G.state);
    var W=canvas.width,H=canvas.height,s=dpr(),h=run.hq,junkyard=run.operationKind==='junkyard';
    if(junkyard){
      drawJunkyardEnvironment(W,H,h);
      circle(run.turret.x,run.turret.y,run.turret.range,null,'rgba(255,165,61,.04)',s);
      if(run.vehicleDestroyed&&run.objectiveVehicle)drawArmoredVehicle(run.objectiveVehicle,true);
    }else if(run.operation){
      drawOperationEnvironment(W,H,h);
      circle(run.turret.x,run.turret.y,run.turret.range,null,'rgba(94,234,247,.035)',s);
    }else{
      drawEnvironment(W,H,h);
      circle(h.x,h.y,112*s,'rgba(50,220,255,.018)','rgba(86,223,255,.075)',s);
      circle(run.turret.x,run.turret.y,run.turret.range,null,'rgba(255,151,55,.035)',s);
      drawProductionHQ(h);drawCommandBastion();
    }
    drawProductionTurret(run.turret);
    run.squad.forEach(function(a){a.age=run.elapsed;drawProductionSoldier(a,false,false,false);});
    circle(run.hero.x,run.hero.y,run.hero.range,null,'rgba(255,240,122,.04)',s);run.hero.age=run.elapsed;
    ctx.save();var heroWidth=1+(Math.max(1,run.commanderVisualTier||1)-1)*.035;ctx.translate(run.hero.x,run.hero.y);ctx.scale(heroWidth,1+(Math.max(1,run.commanderVisualTier||1)-1)*.008);ctx.translate(-run.hero.x,-run.hero.y);drawProductionSoldier(run.hero,false,true,true);ctx.restore();
    run.corpses.forEach(function(e){animatedUnit(e,e.kind==='boss'?4:e.kind==='armored'?3:2,e.kind==='boss'?145:e.kind==='armored'?58:46,e.kind==='boss'?133:e.kind==='armored'?82:68,false,true);});
    run.enemies.forEach(function(e){
      if(e.kind==='vehicle')drawArmoredVehicle(e,false);else if(e.kind==='boss')drawProductionBoss(e);else drawProductionSoldier(e,true,e.kind==='armored',false);
      if(e.hp<e.maxHp||e.kind==='boss'||e.kind==='vehicle'){var barRadius=e.kind==='vehicle'?e.r*1.15:e.r;ctx.fillStyle='rgba(35,3,3,.85)';ctx.fillRect(e.x-barRadius,e.y-e.r-15*s,barRadius*2,4*s);ctx.fillStyle=e.kind==='vehicle'?'#ff9f3d':e.kind==='boss'?'#ff3c3c':'#ff694d';ctx.fillRect(e.x-barRadius,e.y-e.r-15*s,barRadius*2*(e.hp/e.maxHp),4*s);}
    });
    run.bullets.forEach(function(b){ctx.save();ctx.strokeStyle=b.color;ctx.lineWidth=(b.source==='turret'?5:b.source==='commander'?2.5:1.7)*s;ctx.shadowColor=b.color;ctx.shadowBlur=(b.source==='turret'?14:8)*s;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();});
    run.particles.forEach(function(p){var a=p.life/p.max;ctx.globalAlpha=clamp(a,0,1);if(p.filled)circle(p.x,p.y,p.r*(1.2-a*.2),p.color);else circle(p.x,p.y,p.r*(1-a*.35),null,p.color,Math.max(1,4*a)*s);ctx.globalAlpha=1;});
    if(run.feedback){var fc=run.feedback.source==='commander'?'#fff07a':run.feedback.source==='turret'?'#ff8a2a':'#55e7ff',fa=Math.min(1,run.feedback.life/.35),fy=84*s;ctx.globalAlpha=fa;ctx.fillStyle='rgba(3,10,15,.92)';ctx.fillRect(W*.16,fy,W*.68,24*s);ctx.strokeStyle=fc;ctx.strokeRect(W*.16,fy,W*.68,24*s);ctx.fillStyle=fc;ctx.font='bold '+8*s+'px "Share Tech Mono"';ctx.textAlign='center';ctx.fillText(run.feedback.text,W/2,fy+15*s);ctx.globalAlpha=1;}
    var hp=clamp(h.hp/h.maxHp,0,1),xp=clamp(run.xp/run.xpNext,0,1),vehicle=run.objectiveVehicle,armorRatio=junkyard?clamp((vehicle?vehicle.hp:0)/Math.max(1,vehicle?vehicle.maxHp:1),0,1):0,timeRatio=junkyard?clamp(run.objectiveTime/Math.max(1,run.objectiveDuration),0,1):0;
    ctx.fillStyle='rgba(3,10,15,.9)';ctx.fillRect(0,0,W,42*s);ctx.strokeStyle=junkyard?'rgba(255,181,75,.48)':'rgba(34,212,255,.35)';ctx.beginPath();ctx.moveTo(0,42*s);ctx.lineTo(W,42*s);ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold '+9*s+'px "Share Tech Mono"';ctx.textAlign='left';ctx.fillText(junkyard?'JUNKYARD RECOVERY · LEVEL '+run.operationLevel:(run.operation?'CONTAINMENT LEVEL '+run.operationLevel:'PHASE '+run.phase)+' · ASSAULT '+run.assault+'/3',12*s,16*s);ctx.fillStyle=junkyard?'#ffd083':'#9cecff';ctx.fillText(junkyard?'EXTRACTION IN '+formatObjectiveTime(run.objectiveTime):'FIELD RANK '+run.level,12*s,31*s);
    ctx.fillStyle='rgba(0,0,0,.76)';ctx.fillRect(12*s,H-39*s,W-24*s,27*s);
    if(junkyard){ctx.fillStyle='#ff9f3d';ctx.fillRect(14*s,H-35*s,(W-28*s)*(1-armorRatio),8*s);ctx.fillStyle='#ffd166';ctx.fillRect(14*s,H-21*s,(W-28*s)*timeRatio,5*s);ctx.fillStyle='#fff';ctx.font=7*s+'px "Share Tech Mono"';ctx.textAlign='left';ctx.fillText('TARGET DAMAGE '+Math.round((1-armorRatio)*100)+'% · '+formatNumber(Math.ceil((vehicle&&vehicle.hp)||0))+' ARMOR',15*s,H-28*s);}else{ctx.fillStyle=hp>.35?'#18f06a':'#ff3c3c';ctx.fillRect(14*s,H-35*s,(W-28*s)*hp,8*s);ctx.fillStyle='#22d4ff';ctx.fillRect(14*s,H-21*s,(W-28*s)*xp,5*s);ctx.fillStyle='#fff';ctx.font=7*s+'px "Share Tech Mono"';ctx.textAlign='left';ctx.fillText((run.operation?'FORWARD LINE ':'HQ ')+Math.ceil(h.hp)+' / '+h.maxHp,15*s,H-28*s);if(performance.now()-run.lastHit<180){ctx.fillStyle='rgba(255,0,0,.1)';ctx.fillRect(0,0,W,H);}}
  }

  var draw2D = draw;
  draw = function(){
    if(run && window.LSC3DPrototype && window.LSC3DPrototype.render(run)) return;
    return draw2D();
  };

  installStyles(); installReleaseStyles(); installJunkyardStyles(); installUI(); renderTab('campaign'); enforceCommandBaseStartup();
  // iOS can restore a cached visual snapshot on pageshow. Reassert the current
  // route after restoration; no progression data is cleared by this safeguard.
  window.addEventListener('pageshow', function () { if (!run) enforceCommandBaseStartup(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !run) enforceCommandBaseStartup(); });
  _patchedUpdate=function(dt,c,onEnd,onGameOver,onWarn){if(run&&G.state&&G.state._centralHQMode){if(!run.paused)update(dt);updateBattleHUD();return;}return oldUpdate&&oldUpdate(dt,c,onEnd,onGameOver,onWarn);};
  drawVertical=function(state){if(run&&state&&state._centralHQMode)return draw();return oldDraw&&oldDraw(state);};
})();
