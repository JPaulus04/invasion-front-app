// Build 165 — permanent research branches and visible fortress progression.
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
  var BARRICADE_WORLD_RADIUS = 6.4;
  var BARRICADE_STOP_WORLD_RADIUS = 7.8;
  var HQ_ATTACK_WORLD_RADIUS = 3.95;
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
  var RESEARCH_SCHEMA = 165;
  var HQ_TIER_NAMES = ['FIELD COMMAND POST','REINFORCED COMPOUND','FORTIFIED HEADQUARTERS','ARMORED CITADEL','COMMAND FORTRESS'];
  var RESEARCH_BRANCHES = [
    {id:'fire-control',short:'FIRE',name:'FIRE CONTROL',description:'Main-turret targeting, output, range, and boss-killing capability.'},
    {id:'fortifications',short:'DEFENSE',name:'FORTIFICATIONS',description:'Headquarters capacity, perimeter durability, repairs, and damage resistance.'},
    {id:'combat-support',short:'SUPPORT',name:'COMBAT SUPPORT',description:'Artillery effectiveness and faster access to field promotions.'}
  ];
  var RESEARCH_NODES = [
    {id:'fc-calibration',branch:'fire-control',tier:1,name:'Targeting Calibration',effectText:'Main-turret damage +15%.',cost:{credits:250,parts:3},effects:{turretDamage:.15}},
    {id:'fc-servos',branch:'fire-control',tier:2,name:'Servo Motors',effectText:'Main-turret fire rate +12%.',cost:{credits:400,parts:5},effects:{turretRate:.12}},
    {id:'fc-optics',branch:'fire-control',tier:3,name:'Extended Optics',effectText:'Main-turret range +12%.',cost:{credits:600,parts:7},effects:{turretRange:.12}},
    {id:'fc-siege',branch:'fire-control',tier:4,name:'Siege Ammunition',effectText:'Main-turret damage against bosses +35%.',cost:{credits:850,parts:10},effects:{turretBossDamage:.35}},
    {id:'fort-perimeter',branch:'fortifications',tier:1,name:'Reinforced Perimeter',effectText:'Every barrier gains 20 maximum health.',cost:{credits:250,parts:3},effects:{barrierHp:20}},
    {id:'fort-command',branch:'fortifications',tier:2,name:'Hardened Command',effectText:'Headquarters capacity +100.',cost:{credits:400,parts:5},effects:{hqHp:100}},
    {id:'fort-repair',branch:'fortifications',tier:3,name:'Repair Crews',effectText:'Between assaults: repair HQ 35 and surviving barriers 24.',cost:{credits:600,parts:7},effects:{assaultHqRepair:35,assaultBarrierRepair:24}},
    {id:'fort-grid',branch:'fortifications',tier:4,name:'Fortress Grid',effectText:'HQ and barriers take 15% less damage.',cost:{credits:850,parts:10},effects:{hqDamageReduction:.15,barrierDamageReduction:.15}},
    {id:'sup-shells',branch:'combat-support',tier:1,name:'Improved Shells',effectText:'Artillery damage +25.',cost:{credits:250,parts:3},effects:{artilleryDamage:25}},
    {id:'sup-relay',branch:'combat-support',tier:2,name:'Fire Mission Relay',effectText:'Artillery cooldown -3 seconds.',cost:{credits:400,parts:5},effects:{artilleryCooldown:3}},
    {id:'sup-intel',branch:'combat-support',tier:3,name:'Combat Intelligence',effectText:'Field experience earned +15%.',cost:{credits:600,parts:7},effects:{fieldXp:.15}},
    {id:'sup-barrage',branch:'combat-support',tier:4,name:'Saturation Barrage',effectText:'Artillery damage +35%.',cost:{credits:850,parts:10},effects:{artilleryMultiplier:.35}}
  ];
  var meta = loadMeta();

  function id(x) { return document.getElementById(x); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function dpr() { return window.devicePixelRatio || 1; }
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
  function defaults() { return { credits: 500, parts: 12, phase: 1, bestPhase: 0, commander: 1, research: 0, researchSchema:RESEARCH_SCHEMA, researchNodes:{}, researchPoints:0, legacyResearchLevels:0, legacyResearchDamage:0, hq: 1, phaseLosses: {} }; }
  function loadMeta() {
    try {
      var source=JSON.parse(localStorage.getItem(META_KEY) || '{}');
      var loaded=Object.assign(defaults(), source);
      if(!loaded.phaseLosses||typeof loaded.phaseLosses!=='object'||Array.isArray(loaded.phaseLosses))loaded.phaseLosses={};
      if(!loaded.researchNodes||typeof loaded.researchNodes!=='object'||Array.isArray(loaded.researchNodes))loaded.researchNodes={};
      loaded.researchPoints=Math.max(0,Math.floor(Number(loaded.researchPoints)||0));
      if(Number(source.researchSchema)!==RESEARCH_SCHEMA){
        // Build 164 used one linear turret-research level. Each old level becomes
        // a free allocation point. Its existing turret bonus is also retained,
        // so installing the new tree can never make an established save weaker.
        var legacyLevels=Math.max(0,Math.floor(Number(source.research)||0));
        loaded.researchPoints+=legacyLevels;
        loaded.legacyResearchLevels=Math.max(Number(loaded.legacyResearchLevels)||0,legacyLevels);
        loaded.legacyResearchDamage=Math.max(Number(loaded.legacyResearchDamage)||0,legacyLevels*.12);
        loaded.research=0;
        loaded.researchSchema=RESEARCH_SCHEMA;
      }
      return loaded;
    }
    catch (e) { return defaults(); }
  }
  function saveMeta() { localStorage.setItem(META_KEY, JSON.stringify(meta)); }
  function researchNode(nodeId){
    for(var i=0;i<RESEARCH_NODES.length;i++)if(RESEARCH_NODES[i].id===nodeId)return RESEARCH_NODES[i];
    return null;
  }
  function researchPurchased(nodeId){return !!(meta.researchNodes&&meta.researchNodes[nodeId]);}
  function branchNodes(branchId){return RESEARCH_NODES.filter(function(node){return node.branch===branchId;}).sort(function(a,b){return a.tier-b.tier;});}
  function researchUnlocked(node){
    if(node.tier<=1)return true;
    var previous=branchNodes(node.branch).filter(function(candidate){return candidate.tier===node.tier-1;})[0];
    return !!previous&&researchPurchased(previous.id);
  }
  function purchasedResearchCount(){return RESEARCH_NODES.filter(function(node){return researchPurchased(node.id);}).length;}
  function researchPower(){
    var tierPower=[0,30,40,55,75],total=Math.max(0,Number(meta.legacyResearchLevels)||0)*50;
    RESEARCH_NODES.forEach(function(node){if(researchPurchased(node.id))total+=tierPower[node.tier]||30;});
    return total;
  }
  function researchEffects(){
    var result={turretDamage:Math.max(0,Number(meta.legacyResearchDamage)||0),turretRate:0,turretRange:0,turretBossDamage:0,barrierHp:0,hqHp:0,assaultHqRepair:0,assaultBarrierRepair:0,hqDamageReduction:0,barrierDamageReduction:0,artilleryDamage:0,artilleryCooldown:0,fieldXp:0,artilleryMultiplier:0};
    RESEARCH_NODES.forEach(function(node){
      if(!researchPurchased(node.id))return;
      Object.keys(node.effects||{}).forEach(function(key){result[key]=(result[key]||0)+node.effects[key];});
    });
    return result;
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
    saveMeta();
    combatSfx('upgrade');
    combatHaptic('success',180);
    renderTab('research');
  }
  saveMeta();
  function phaseLossCount(phase){return Math.max(0,Number(meta.phaseLosses[String(phase)])||0);}
  function retryAssist(phase){var losses=phaseLossCount(phase);return Math.min(.24,Math.max(0,losses-1)*.08);}
  function phaseBalance(phase){
    var profiles={
      // Build 164 lengthens runs with additional contacts, not inflated health.
      // Assault totals rise about 45–50% while all verified HP/damage values stay put.
      1:{targets:[9,12,15],hp:.72,damage:.52,bossHp:300,bossDamage:11,barricadeHp:58},
      2:{targets:[11,15,20],hp:.82,damage:.65,bossHp:400,bossDamage:14,barricadeHp:60},
      3:{targets:[13,18,24],hp:.90,damage:.72,bossHp:520,bossDamage:17,barricadeHp:62},
      4:{targets:[15,21,28],hp:1.03,damage:.88,bossHp:700,bossDamage:21,barricadeHp:64},
      5:{targets:[17,24,32],hp:1.15,damage:1,bossHp:850,bossDamage:24,barricadeHp:66},
      6:{targets:[20,28,37],hp:1.30,damage:1.12,bossHp:1050,bossDamage:28,barricadeHp:68}
    };
    if(profiles[phase])return profiles[phase];
    var extra=phase-6;
    return {targets:[20+extra*2,28+extra*3,37+extra*4],hp:1.30+extra*.11,damage:1.12+extra*.09,bossHp:1050+extra*140,bossDamage:28+extra*2.4,barricadeHp:68+extra*6};
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
    if (type === 'commander') return { credits: 200 * meta.commander, parts: 0 };
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
      '.l137-hero{height:34%;min-height:180px;display:flex;align-items:center;justify-content:center;position:relative}.l137-hq-art{width:150px;height:102px;position:relative;border:2px solid #9a8653;border-radius:18px;background:linear-gradient(145deg,rgba(41,75,87,.75),rgba(7,17,23,.96));box-shadow:0 0 42px rgba(34,212,255,.18),inset 0 -20px 32px #071117;transition:width .3s,height .3s,border .3s,box-shadow .3s}.l137-hq-art[data-tier="2"]{width:162px;height:112px;border-width:3px}.l137-hq-art[data-tier="3"]{width:176px;height:124px;border-width:4px;border-color:#d4b45e;box-shadow:0 0 58px rgba(255,209,102,.25),inset 0 -22px 35px #071117}.l137-hq-art[data-tier="4"]{width:188px;height:134px;border-width:5px;border-color:#e0c56d}.l137-hq-art[data-tier="5"]{width:202px;height:144px;border-width:6px;border-color:#7ef8ff;box-shadow:0 0 76px rgba(65,229,255,.46),inset 0 -24px 38px #071117}.l165-hq-wall{position:absolute;inset:13px 10px 8px;border:2px solid #806d4a;border-radius:12px;transition:.3s}.l137-hq-art[data-tier="2"] .l165-hq-wall{border-width:4px;border-color:#a08b59}.l137-hq-art[data-tier="3"] .l165-hq-wall{border-width:6px;border-color:#bca366;box-shadow:inset 0 0 0 2px #4d5142}.l137-hq-art[data-tier="4"] .l165-hq-wall{border-width:8px;border-color:#879695;box-shadow:inset 0 0 0 3px #394b4b}.l137-hq-art[data-tier="5"] .l165-hq-wall{border-width:10px;border-color:#70cbd2;box-shadow:inset 0 0 0 3px #274a50,0 0 15px rgba(64,227,246,.34)}.l165-hq-core{position:absolute;left:50%;top:51%;width:68px;height:52px;transform:translate(-50%,-50%);display:grid;place-items:center;border:2px solid #ffd166;border-radius:14px;background:linear-gradient(145deg,#426467,#172a30);box-shadow:0 8px 15px rgba(0,0,0,.34);transition:.3s}.l165-hq-core span{font-size:23px;font-weight:900}.l137-hq-art[data-tier="2"] .l165-hq-core{width:76px;height:58px}.l137-hq-art[data-tier="3"] .l165-hq-core{width:84px;height:64px;border-width:3px}.l137-hq-art[data-tier="4"] .l165-hq-core{width:92px;height:70px;background:linear-gradient(145deg,#4d7073,#172b34)}.l137-hq-art[data-tier="5"] .l165-hq-core{width:100px;height:76px;border-color:#9cecff;box-shadow:0 0 19px rgba(80,225,245,.42)}.l165-hq-mast{position:absolute;left:50%;bottom:76%;width:5px;height:0;transform:translateX(-50%);border-radius:5px;background:#9cecff;box-shadow:0 0 10px #22d4ff;transition:.3s}.l137-hq-art[data-tier="2"] .l165-hq-mast,.l137-hq-art[data-tier="3"] .l165-hq-mast{height:34px}.l137-hq-art[data-tier="4"] .l165-hq-mast,.l137-hq-art[data-tier="5"] .l165-hq-mast{height:42px;box-shadow:-38px 27px 0 1px #45d9ff,38px 27px 0 1px #45d9ff,0 0 15px #22d4ff}.l165-hq-tower{display:none;position:absolute;width:18px;height:18px;border:2px solid #d7bd75;border-radius:4px;background:#2c4143;box-shadow:0 4px 8px rgba(0,0,0,.35)}.l137-hq-art[data-tier="3"] .l165-hq-tower,.l137-hq-art[data-tier="4"] .l165-hq-tower,.l137-hq-art[data-tier="5"] .l165-hq-tower{display:block}.l165-hq-tower.nw{left:-9px;top:-9px}.l165-hq-tower.ne{right:-9px;top:-9px}.l165-hq-tower.sw{left:-9px;bottom:-9px}.l165-hq-tower.se{right:-9px;bottom:-9px}.l137-hq-art[data-tier="5"] .l165-hq-tower{width:23px;height:23px;border-color:#7ef8ff;background:#274b50}.l137-hq-lv{position:absolute;bottom:7px;font:9px "Share Tech Mono",monospace;color:#9cecff;letter-spacing:.4px}' +
      '.l137-panel{flex:1;min-height:0;padding:15px;border:1px solid rgba(34,212,255,.22);border-radius:20px;background:rgba(6,16,23,.93);overflow:auto}.l137-kicker{font:8px "Share Tech Mono",monospace;letter-spacing:2px;color:#ffd166}.l137-h2{font-size:23px;font-weight:900;margin:3px 0 8px}.l137-copy{font:9px/1.55 "Share Tech Mono",monospace;color:#9eb1ba}.l137-card{margin-top:12px;padding:13px;border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.035)}' +
      '.l137-card-row{display:flex;justify-content:space-between;gap:12px;align-items:center}.l137-card b{font-size:15px}.l137-card small{display:block;font:8px/1.4 "Share Tech Mono",monospace;color:#82949d}.l137-btn{border:1px solid rgba(34,212,255,.35);border-radius:10px;padding:10px 13px;background:#103a4a;color:white;font:800 12px Rajdhani,sans-serif;white-space:nowrap}.l137-btn.good{background:#116c3b;border-color:#1ee873}.l137-btn:disabled{opacity:.38}.l137-deploy{width:100%;margin-top:14px;padding:14px;font-size:16px}' +
      '.l161-power-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.l161-power-metric{padding:9px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:rgba(0,0,0,.18)}.l161-power-metric span{display:block;font:7px "Share Tech Mono",monospace;letter-spacing:1px;color:#82949d}.l161-power-metric strong{display:block;margin-top:2px;font-size:22px;line-height:1;color:#fff}.l161-power-state{margin-top:8px;padding:8px 10px;border-radius:8px;text-align:center;font:800 10px "Share Tech Mono",monospace;letter-spacing:1px}.l161-power-state.underpowered{color:#ff8e78;background:rgba(140,39,26,.28);border:1px solid rgba(255,91,68,.38)}.l161-power-state.ready{color:#7fffae;background:rgba(17,108,59,.25);border:1px solid rgba(30,232,115,.34)}.l161-power-state.overmatch{color:#8fefff;background:rgba(16,91,117,.3);border:1px solid rgba(34,212,255,.4)}' +
      '.l165-research-points{margin:10px 0;padding:10px 12px;border:1px solid rgba(255,209,102,.48);border-radius:10px;background:rgba(106,74,12,.22)}.l165-research-points b,.l165-research-points span{display:block}.l165-research-points b{color:#ffd166;font-size:13px}.l165-research-points span{margin-top:3px;color:#bac8cd;font:7px/1.45 "Share Tech Mono",monospace}.l165-research-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:10px}.l165-research-summary div{padding:7px 4px;border:1px solid rgba(255,255,255,.09);border-radius:8px;background:rgba(0,0,0,.18);text-align:center}.l165-research-summary span,.l165-research-summary b{display:block}.l165-research-summary span{font:6px "Share Tech Mono",monospace;color:#82949d}.l165-research-summary b{margin-top:3px;font-size:12px;color:#fff}.l165-legacy-note{margin-top:6px;text-align:center;color:#8fefff;font:7px "Share Tech Mono",monospace}.l165-research-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:12px}.l165-research-tab{padding:8px 3px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:#09141b;color:#8da2ab;font:800 9px Rajdhani,sans-serif}.l165-research-tab span,.l165-research-tab small{display:block}.l165-research-tab small{margin-top:2px;font:6px "Share Tech Mono",monospace}.l165-research-tab.active{color:#fff;border-color:#22d4ff;background:#103040}.l165-branch-head{margin-top:11px}.l165-branch-head b,.l165-branch-head span{display:block}.l165-branch-head b{color:#ffd166;font-size:15px}.l165-branch-head span{font:7px/1.4 "Share Tech Mono",monospace;color:#8fa3ac}.l165-research-tree{display:grid;gap:7px;margin-top:8px}.l165-research-node{position:relative;padding:10px 10px 10px 42px;border:1px solid rgba(34,212,255,.28);border-radius:10px;background:rgba(12,28,36,.94)}.l165-research-node:before{content:"";position:absolute;left:19px;top:0;bottom:-8px;width:2px;background:rgba(34,212,255,.23)}.l165-research-node:last-child:before{bottom:50%}.l165-research-node:after{content:"";position:absolute;left:13px;top:21px;width:12px;height:12px;border:2px solid #22d4ff;border-radius:50%;background:#071119;box-shadow:0 0 8px rgba(34,212,255,.4)}.l165-research-node.complete{border-color:rgba(30,232,115,.42);background:rgba(15,70,43,.25)}.l165-research-node.complete:after{border-color:#1ee873;background:#1a9151}.l165-research-node.locked{opacity:.48;border-color:rgba(255,255,255,.1)}.l165-research-node.locked:after{border-color:#68757b;box-shadow:none}.l165-node-tier{color:#74e9ff;font:6px "Share Tech Mono",monospace;letter-spacing:1.3px}.l165-node-name{margin-top:2px;font-size:15px;font-weight:800}.l165-node-effect{margin:2px 0 7px;color:#aebcc1;font:7px/1.4 "Share Tech Mono",monospace}.l165-node-action{width:100%;padding:7px;border:1px solid rgba(30,232,115,.44);border-radius:7px;background:#115b38;color:#fff;font:800 9px Rajdhani,sans-serif}.l165-node-action small{display:block;margin-top:2px;color:#cce0d4;font:6px "Share Tech Mono",monospace}.l165-node-action:disabled{opacity:.55;background:#18242a;border-color:rgba(255,255,255,.12)}' +
      '.l137-nav{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:10px}.l137-nav button{padding:9px 2px;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:#09141b;color:#91a7b1;font:700 9px Rajdhani,sans-serif}.l137-nav button.active{color:#fff;border-color:#22d4ff;background:#103040}' +
      '#lsc137-result{position:fixed;z-index:32000;inset:0;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,4,7,.9);backdrop-filter:blur(8px)}#lsc137-result.show{display:flex}.l137-result-card{width:min(420px,100%);padding:22px;border:1px solid rgba(34,212,255,.35);border-radius:20px;background:#08131a;text-align:center}.l137-result-card h2{font-size:28px;margin:3px}.l137-actions{display:grid;gap:8px;margin-top:17px}' +
      '#hq-upgrade-overlay{position:fixed;z-index:31000;inset:0;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,4,8,.86)}#hq-upgrade-overlay.show{display:flex}.hq-upgrade-modal{width:min(420px,100%);padding:18px;border:1px solid #846e36;border-radius:18px;background:#09131a}.hq-upgrade-title{text-align:center;font-size:23px;font-weight:900}.hq-upgrade-sub{text-align:center;color:#ffd166;font:8px "Share Tech Mono",monospace;margin-bottom:12px}.hq-upgrade-grid{display:grid;gap:8px}.hq-upgrade-choice{text-align:left;padding:12px;border:1px solid #64727a;border-radius:11px;background:#121d23;color:#fff;box-shadow:inset 3px 0 0 #7e8a90}.hq-upgrade-choice b,.hq-upgrade-choice span,.hq-upgrade-choice small{display:block}.hq-upgrade-choice b{font-size:15px}.hq-upgrade-choice span{font:8px/1.45 "Share Tech Mono",monospace;color:#b8c2c7}.hq-upgrade-choice small{margin-bottom:4px;font:7px "Share Tech Mono",monospace;letter-spacing:1.5px;color:#aab4b9}.hq-upgrade-choice.epic{border-color:#8f58d8;background:#21152f;box-shadow:inset 3px 0 0 #b477ff,0 0 14px rgba(164,92,255,.12)}.hq-upgrade-choice.epic small{color:#c99aff}.hq-upgrade-choice.legendary{border-color:#c79c32;background:#30250e;box-shadow:inset 3px 0 0 #ffd166,0 0 16px rgba(255,209,102,.14)}.hq-upgrade-choice.legendary small{color:#ffd166}' +
      '#lsc137-ability{position:absolute;z-index:35;right:14px;bottom:48px;width:68px;height:68px;border:2px solid #ffd166;border-radius:50%;background:#513d0e;color:white;font:800 10px Rajdhani,sans-serif;box-shadow:0 0 25px rgba(255,209,102,.25)}#lsc137-ability:disabled{opacity:.35}' +
      '#l140-controls{position:absolute;z-index:42;right:12px;top:calc(env(safe-area-inset-top,0px) + 8px);display:flex;gap:6px}#l139-menu-btn,#l140-speed-btn{height:34px;border:1px solid #58dfff;border-radius:9px;background:rgba(5,18,26,.94);color:#fff;font:800 12px Rajdhani,sans-serif}#l139-menu-btn{width:38px;font-size:18px}#l140-speed-btn{width:42px;color:#ffd166}' +
      '#l139-pause{position:fixed;z-index:33000;inset:0;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,4,8,.9);backdrop-filter:blur(8px)}#l139-pause.show{display:flex}.l139-pause-card{width:min(400px,100%);padding:20px;border:1px solid rgba(34,212,255,.4);border-radius:18px;background:#08141b}.l139-setting{display:flex;justify-content:space-between;align-items:center;margin:8px 0;padding:10px;border:1px solid rgba(255,255,255,.1);border-radius:9px}.l139-setting button{min-width:58px}' +
      '#lsc161-loading{position:fixed;z-index:32950;inset:0;display:none;place-items:center;padding:24px;background:radial-gradient(circle at 50% 42%,rgba(24,74,89,.78),transparent 38%),linear-gradient(180deg,#07131a,#02070a);color:#fff;text-align:center}#lsc161-loading.show{display:grid}.l161-load-mark{width:82px;height:82px;margin:0 auto 18px;border:2px solid #74e9ff;border-radius:24px;display:grid;place-items:center;color:#ffd166;font-size:31px;font-weight:900;box-shadow:0 0 36px rgba(34,212,255,.25),inset 0 0 22px rgba(34,212,255,.08)}.l161-load-title{font-size:24px;font-weight:900;letter-spacing:1px}.l161-load-copy{margin-top:6px;color:#74e9ff;font:8px "Share Tech Mono",monospace;letter-spacing:1.7px}.l161-load-track{width:min(260px,72vw);height:5px;margin:20px auto 0;overflow:hidden;border-radius:5px;background:#142731}.l161-load-bar{width:44%;height:100%;background:linear-gradient(90deg,transparent,#74e9ff,#ffd166,transparent);animation:l161LoadSweep 1.15s ease-in-out infinite}@keyframes l161LoadSweep{0%{transform:translateX(-115%)}100%{transform:translateX(255%)}}' +
      '.l139-progress{position:absolute;z-index:39;left:12px;right:108px;top:calc(env(safe-area-inset-top,0px) + 7px);height:35px;pointer-events:none}.l139-progress-track{height:6px;margin-top:4px;border-radius:6px;background:#182a32;overflow:hidden}.l139-progress-fill{height:100%;background:linear-gradient(90deg,#22d4ff,#18f06a);box-shadow:0 0 10px #22d4ff}.l139-progress-text{font:8px "Share Tech Mono",monospace;color:#fff;display:flex;justify-content:space-between}';
    document.head.appendChild(s);
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
    app.innerHTML = '<div class="l137-shell"><div class="l137-top"><div><div class="l137-brand">LAST STAND COMMAND</div><div class="l137-title">COMMAND BASE</div></div><div class="l137-res" id="l137-res"></div></div><div class="l137-hero"><div class="l137-hq-art"><div class="l165-hq-wall"><i class="l165-hq-tower nw"></i><i class="l165-hq-tower ne"></i><i class="l165-hq-tower sw"></i><i class="l165-hq-tower se"></i></div><div class="l165-hq-core"><span>HQ</span></div><i class="l165-hq-mast"></i></div><div class="l137-hq-lv" id="l137-hq-lv"></div></div><main class="l137-panel" id="l137-panel"></main><nav class="l137-nav" id="l137-nav"><button data-tab="campaign">CAMPAIGN</button><button data-tab="commander">COMMANDER</button><button data-tab="research">RESEARCH</button><button data-tab="hq">HQ</button><button data-tab="inventory">INVENTORY</button></nav></div>';
    document.body.appendChild(app);
    id('l137-nav').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) renderTab(b.dataset.tab); });
    var result = document.createElement('div');
    result.id = 'lsc137-result';
    result.innerHTML = '<div class="l137-result-card"><div class="l137-kicker" id="l137-result-kicker"></div><h2 id="l137-result-title"></h2><p class="l137-copy" id="l137-result-copy"></p><div class="l137-card" id="l137-result-reward"></div><div class="l137-actions"><button class="l137-btn good" id="l141-continue">CONTINUE</button><button class="l137-btn" id="l137-return">RETURN TO COMMAND BASE</button><button class="l137-btn" id="l137-retry">REPLAY PHASE</button></div></div>';
    document.body.appendChild(result);
    id('l141-continue').onclick = function () { var retryPhase = id('l137-result-kicker').textContent === 'MISSION FAILED' && run ? run.phase : null; id('lsc137-result').classList.remove('show'); launchPhase(retryPhase); };
    id('l137-retry').onclick = function () { var phase = run && run.phase ? run.phase : meta.phase; id('lsc137-result').classList.remove('show'); launchPhase(phase); };
    id('l137-return').onclick = returnHome;
    var up = document.createElement('div');
    up.id = 'hq-upgrade-overlay';
    up.innerHTML = '<div class="hq-upgrade-modal"><div class="hq-upgrade-title">FIELD PROMOTION</div><div class="hq-upgrade-sub" id="hq-upgrade-sub">SELECT ONE COMBAT UPGRADE</div><div class="hq-upgrade-grid" id="hq-upgrade-grid"></div></div>';
    document.body.appendChild(up);
    var ability = document.createElement('button'); ability.id = 'lsc137-ability'; ability.textContent = 'ARTILLERY'; ability.onclick = useAbility;
    var wrap = id('battlefield-wrap'); if (wrap) {
      wrap.appendChild(ability);
      var progress=document.createElement('div');progress.className='l139-progress';progress.innerHTML='<div class="l139-progress-text"><span id="l139-progress-label">ASSAULT 1/3</span><span id="l139-progress-count">0 THREATS</span></div><div class="l139-progress-track"><div class="l139-progress-fill" id="l139-progress-fill"></div></div>';wrap.appendChild(progress);
      var controls=document.createElement('div');controls.id='l140-controls';controls.innerHTML='<button id="l140-speed-btn" aria-label="Battle speed">1×</button><button id="l139-menu-btn" aria-label="Battle menu">☰</button>';wrap.appendChild(controls);
      id('l139-menu-btn').onclick=openPause;id('l140-speed-btn').onclick=cycleSpeed;
    }
    var pause=document.createElement('div');pause.id='l139-pause';pause.innerHTML='<div class="l139-pause-card"><div class="l137-kicker">BATTLE PAUSED</div><div class="l137-h2">COMMAND MENU</div><div class="l137-actions"><button class="l137-btn good" id="l139-resume">RESUME BATTLE</button><button class="l137-btn" id="l139-restart">RESTART PHASE</button><button class="l137-btn" id="l139-return">RETURN TO COMMAND BASE</button></div><div class="l137-kicker" style="margin-top:16px">SETTINGS</div><div class="l139-setting"><span>Music</span><button class="l137-btn" data-setting="music">ON</button></div><div class="l139-setting"><span>Sound Effects</span><button class="l137-btn" data-setting="sound">ON</button></div><div class="l139-setting"><span>Haptics</span><button class="l137-btn" data-setting="haptics">ON</button></div></div>';document.body.appendChild(pause);
    id('l139-resume').onclick=closePause;
    id('l139-restart').onclick=function(){if(confirm('Restart this phase? Current battle progress will be lost.')){closePause();launchPhase();}};
    id('l139-return').onclick=function(){if(confirm('Return to Command Base? Current battle progress will be lost.')){closePause();returnHome();}};
    pause.addEventListener('click',function(e){var b=e.target.closest('[data-setting]');if(!b)return;toggleBattleSetting(b.dataset.setting);});
    syncBattleSettings();
    var loadingScreen=document.createElement('div');loadingScreen.id='lsc161-loading';loadingScreen.setAttribute('aria-hidden','true');loadingScreen.innerHTML='<div><div class="l161-load-mark">HQ</div><div class="l161-load-title">DEPLOYING TO OUTER PERIMETER</div><div class="l161-load-copy">INITIALIZING COMMAND SYSTEMS</div><div class="l161-load-track"><div class="l161-load-bar"></div></div></div>';document.body.appendChild(loadingScreen);
  }

  function setSimulationPaused(paused){if(run)run.paused=paused;if(G&&G.state)G.state.paused=paused;}
  function openPause(){if(!run||!run.active)return;setSimulationPaused(true);syncBattleSettings();if(typeof suspendAudio==='function')suspendAudio();id('l139-pause').classList.add('show');combatHaptic('light',120);}
  function closePause(){setSimulationPaused(false);id('l139-pause').classList.remove('show');if(typeof resumeAudio==='function')resumeAudio();}
  function setSpeed(value){if(!run)return;run.speed=value;_gameSpeed=value;var b=id('l140-speed-btn');if(b)b.textContent=value+'×';}
  function cycleSpeed(){if(!run||run.paused)return;setSpeed(run.speed===1?2:run.speed===2?3:1);}

  function showBattleLoading(){var loading=id('lsc161-loading');if(!loading)return;loading.classList.add('show');loading.setAttribute('aria-hidden','false');}
  function hideBattleLoading(){var loading=id('lsc161-loading');if(!loading)return;loading.classList.remove('show');loading.setAttribute('aria-hidden','true');}

  function currentPower() {
    return 355 + Math.max(0, meta.commander - 1) * 55 + Math.max(0, meta.hq - 1) * 65 + researchPower();
  }
  function recommendedPower(phase) { return 320 + Math.max(1, Number(phase) || 1) * 35; }
  function victoryRewardPreview(phase) {
    var targets=phaseBalance(Math.max(1,Number(phase)||1)).targets;
    return 250+(targets.reduce(function(total,count){return total+count;},0)+1)*3;
  }
  function powerAssessment(phase) {
    var current=currentPower(),recommended=recommendedPower(phase),difference=current-recommended,percent=Math.round(Math.abs(difference)/Math.max(1,recommended)*100),ratio=current/recommended;
    if(ratio<.9)return{current:current,recommended:recommended,label:'UNDERPOWERED · '+percent+'% BELOW',className:'underpowered'};
    if(ratio>1.15)return{current:current,recommended:recommended,label:'OVERMATCH · '+percent+'% ABOVE',className:'overmatch'};
    return{current:current,recommended:recommended,label:'COMBAT READY · '+(difference>=0?percent+'% ABOVE':percent+'% BELOW'),className:'ready'};
  }

  function refreshHeader() {
    id('l137-res').innerHTML = '<b>' + currentPower() + '</b> POWER<br><b>' + meta.credits + '</b> CREDITS · <b>' + meta.parts + '</b> PARTS';
    var visibleTier=Math.min(5,Math.max(1,meta.hq));
    id('l137-hq-lv').textContent = HQ_TIER_NAMES[visibleTier-1]+' · LEVEL ' + meta.hq;
    var art=document.querySelector('.l137-hq-art');if(art)art.setAttribute('data-tier',String(Math.min(5,Math.max(1,meta.hq))));
  }
  function renderResearchTab(panel){
    var branch=RESEARCH_BRANCHES.filter(function(item){return item.id===activeResearchBranch;})[0]||RESEARCH_BRANCHES[0];
    var nodes=branchNodes(branch.id),effects=researchEffects(),legacy=Math.round((Number(meta.legacyResearchDamage)||0)*100);
    var tabs=RESEARCH_BRANCHES.map(function(item){
      var count=branchNodes(item.id).filter(function(node){return researchPurchased(node.id);}).length;
      return '<button class="l165-research-tab '+(item.id===branch.id?'active':'')+'" data-research-branch="'+item.id+'"><span>'+item.short+'</span><small>'+count+'/4</small></button>';
    }).join('');
    var cards=nodes.map(function(node){
      var purchased=researchPurchased(node.id),unlocked=researchUnlocked(node),short=meta.researchPoints<=0&&(meta.credits<node.cost.credits||meta.parts<node.cost.parts),disabled=purchased||!unlocked||short;
      var state=purchased?'COMPLETE':!unlocked?'LOCKED':short?'NEED RESOURCES':meta.researchPoints>0?'USE LEGACY POINT':'RESEARCH';
      var cost=node.cost.credits+' CREDITS · '+node.cost.parts+' TECH PARTS';
      if(meta.researchPoints>0&&!purchased&&unlocked)cost='LEGACY POINT AVAILABLE · '+cost;
      return '<div class="l165-research-node '+(purchased?'complete':!unlocked?'locked':'available')+'"><div class="l165-node-tier">TIER '+node.tier+'</div><div class="l165-node-name">'+node.name+'</div><div class="l165-node-effect">'+node.effectText+'</div><button class="l165-node-action" data-research-node="'+node.id+'" '+(disabled?'disabled':'')+'>'+state+'<small>'+cost+'</small></button></div>';
    }).join('');
    panel.innerHTML='<div class="l137-kicker">PERMANENT PROGRESSION</div><div class="l137-h2">RESEARCH CENTER</div><div class="l137-copy">Choose a branch and build from Tier 1 through Tier 4. Research is immediate and remains active in every phase.</div>'+
      (meta.researchPoints>0?'<div class="l165-research-points"><b>'+meta.researchPoints+' LEGACY RESEARCH POINT'+(meta.researchPoints===1?'':'S')+'</b><span>Converted from the previous Research Tier system. Spend these before Credits or Tech Parts.</span></div>':'')+
      '<div class="l165-research-summary"><div><span>RESEARCHED</span><b>'+purchasedResearchCount()+' / '+RESEARCH_NODES.length+'</b></div><div><span>TURRET DAMAGE</span><b>+'+Math.round(effects.turretDamage*100)+'%</b></div><div><span>HQ CAPACITY</span><b>+'+effects.hqHp+'</b></div><div><span>ARTILLERY</span><b>+'+effects.artilleryDamage+'</b></div></div>'+
      (legacy>0?'<div class="l165-legacy-note">LEGACY CALIBRATION RETAINED · TURRET DAMAGE +'+legacy+'%</div>':'')+
      '<div class="l165-research-tabs">'+tabs+'</div><div class="l165-branch-head"><b>'+branch.name+'</b><span>'+branch.description+'</span></div><div class="l165-research-tree">'+cards+'</div>';
    Array.prototype.forEach.call(panel.querySelectorAll('[data-research-branch]'),function(button){button.onclick=function(){activeResearchBranch=button.dataset.researchBranch;renderTab('research');};});
    Array.prototype.forEach.call(panel.querySelectorAll('[data-research-node]'),function(button){button.onclick=function(){buyResearchNode(button.dataset.researchNode);};});
  }
  function renderTab(tab) {
    refreshHeader();
    Array.prototype.forEach.call(id('l137-nav').children, function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
    var p = id('l137-panel');
    if (tab === 'campaign') {
      var support=retryAssist(meta.phase),supportText=support>0?'<small>RETRY SUPPORT ACTIVE · ENEMY HEALTH AND DAMAGE -'+Math.round(support*100)+'%</small>':'',power=powerAssessment(meta.phase);
      p.innerHTML = '<div class="l137-kicker">ACTIVE THEATER</div><div class="l137-h2">PHASE ' + meta.phase + ' · OUTER PERIMETER</div><div class="l137-copy">Hold the central headquarters through three assaults, then eliminate the Siege Breaker.</div><div class="l137-card"><div class="l137-card-row"><div><b>Mission Readiness</b><small>'+(meta.phase<4?'OPENING OPERATION':'STANDARD RISK')+'</small></div><div><b>Victory Rewards</b><small>' + victoryRewardPreview(meta.phase) + ' CREDITS · 3 TECH PARTS</small></div></div><div class="l161-power-grid"><div class="l161-power-metric"><span>CURRENT POWER</span><strong>'+power.current+'</strong></div><div class="l161-power-metric"><span>RECOMMENDED</span><strong>'+power.recommended+'</strong></div></div><div class="l161-power-state '+power.className+'">'+power.label+'</div>'+supportText+'</div><button class="l137-btn good l137-deploy" id="l137-deploy">CHALLENGE PHASE ' + meta.phase + '</button>';
    }
    if (tab === 'commander') p.innerHTML = upgradePanel('commander', 'COMMANDER HOLT', 'Permanent rifle damage and fire-rate training.', 'Combat Level ' + meta.commander);
    if (tab === 'research') renderResearchTab(p);
    if (tab === 'hq') p.innerHTML = upgradePanel('hq', 'HEADQUARTERS', 'Grow the central base from a field post into a visibly larger fortified command fortress. Every level strengthens HQ health and all perimeter barriers.', meta.hq>=5?'COMMAND FORTRESS · MAXIMUM LEVEL':'UPGRADE TO LEVEL '+(meta.hq+1)+' · '+HQ_TIER_NAMES[Math.min(4,meta.hq)]);
    if (tab === 'inventory') p.innerHTML = '<div class="l137-kicker">ARMORY</div><div class="l137-h2">INVENTORY</div><div class="l137-copy">Recovered equipment will appear here. The first functional equipment drops arrive after the core phase loop is balanced.</div><div class="l137-card"><b>Standard Issue Rifle</b><small>EQUIPPED · ASSAULT CLASS</small></div><div class="l137-card"><b>Field Armor</b><small>EQUIPPED · STANDARD PROTECTION</small></div>';
    var dep = id('l137-deploy'); if (dep) dep.onclick = launchPhase;
    var buy = id('l137-buy'); if (buy) buy.onclick = function () { buyUpgrade(tab); };
  }
  function upgradePanel(type, title, copy, level) {
    var cost = levelCost(type);
    var price = cost.credits + ' CREDITS' + (cost.parts ? ' · ' + cost.parts + ' TECH PARTS' : '');
    var maximum=type==='hq'&&meta.hq>=5,short = meta.credits < cost.credits || meta.parts < cost.parts;
    return '<div class="l137-kicker">PERMANENT UPGRADE</div><div class="l137-h2">' + title + '</div><div class="l137-copy">' + copy + '</div><div class="l137-card"><div class="l137-card-row"><div><b>' + level + '</b><small>' + (maximum?'ALL FORTRESS TIERS DEPLOYED':'NEXT UPGRADE COST · '+price) + '</small></div><button class="l137-btn good" id="l137-buy" ' + (maximum||short ? 'disabled' : '') + '>' + (maximum?'MAX LEVEL':short ? 'NEED RESOURCES' : 'UPGRADE') + '</button></div></div>';
  }
  function buyUpgrade(type) {
    if(type==='research'||(type==='hq'&&meta.hq>=5))return;
    var cost = levelCost(type); if (meta.credits < cost.credits || meta.parts < cost.parts) return;
    meta.credits -= cost.credits; meta.parts -= cost.parts; meta[type]++; saveMeta(); combatSfx('upgrade'); combatHaptic('success',180); renderTab(type);
  }

  function launchPhase(phaseOverride) {
    if(typeof ensureAudio==='function')ensureAudio();
    combatSfx('deploy');combatHaptic('medium',180);
    var home = id('homeScreen'); if (home) { home.style.display = 'none'; home.classList.remove('hs-visible'); }
    if (G && G.state && !G.state.started) { if (!G.state.selectedDoctrine) G.state.selectedDoctrine = 'fortress'; G.state.started = true; }
    id('lsc137-app').classList.add('hidden');
    document.body.classList.add('lsc137-mode');
    showBattleLoading();
    run = createRun(phaseOverride);setSpeed(1);
    if(window.LSC3DPrototype) window.LSC3DPrototype.start(canvas, run, hideBattleLoading);else hideBattleLoading();
    G.state._centralHQMode = true; G.state.waveInProgress = true; G.state.gameOver = false; G.state.paused = false;
    id('lsc137-ability').disabled = false; id('lsc137-ability').textContent = 'ARTILLERY';
  }
  function createRun(phaseOverride) {
    var W = canvas.width || 390, H = canvas.height || 600, s = dpr(), cx = W / 2, cy = H * .52;
    var phase=Math.max(1,Number(phaseOverride)||meta.phase),balance=phaseBalance(phase),assist=retryAssist(phase),targets=balance.targets.slice(),tech=researchEffects();
    var worldScale=(Math.min(W,H)*.54+45*s)/8.2;
    var barricadeHp=balance.barricadeHp+(meta.hq-1)*10+tech.barrierHp;
    var lanes=[];
    for(var lane=0;lane<LANE_COUNT;lane++){
      var layout=COMPOUND_LANES[lane],angle=Math.atan2(layout.y,layout.x);
      lanes.push({index:lane,angle:angle,baseX:layout.x,baseY:layout.y,rotation:layout.rotation,side:layout.side,queue:[],barricade:{hp:barricadeHp,maxHp:barricadeHp,flash:0}});
    }
    var hqCapacity=300+(meta.hq-1)*75+tech.hqHp,artilleryDamage=(95+tech.artilleryDamage)*(1+tech.artilleryMultiplier);
    return { active:true, paused:false, complete:false, phase:phase, balance:balance, assist:assist, elapsed:0, speed:1, assault:1, assaultElapsed:0, assaultSpawned:0, assaultKills:0, assaultTargets:targets, transition:0, spawn:0, spawned:0, nextLane:0, lanes:lanes, worldScale:worldScale, kills:0, xp:0, xpNext:36, level:1, bossSpawned:false, bossDefeated:false, upgradeOpen:false, upgradeStacks:{}, lastUpgradeChoices:[], legendaryMisses:0, abilityCd:0, abilityMaxCd:Math.max(8,18-tech.artilleryCooldown), abilityDamage:artilleryDamage, fieldXpMultiplier:1+tech.fieldXp, turretBossDamage:tech.turretBossDamage, assaultHqRepair:tech.assaultHqRepair, assaultBarrierRepair:tech.assaultBarrierRepair, hqDamageReduction:tech.hqDamageReduction, barrierDamageReduction:tech.barrierDamageReduction, research:tech, lastHit:0,
      hq:{x:cx,y:cy,r:37*s,level:meta.hq,hp:hqCapacity,maxHp:hqCapacity},
      hero:{source:'commander',x:cx,y:cy+70*s,r:13*s,damage:16*(1+(meta.commander-1)*.15),rate:2.7*(1+(meta.commander-1)*.06),range:150*s,cd:0},
      turret:{source:'turret',x:cx,y:cy-58*s,r:10*s,damage:10*(1+tech.turretDamage),rate:3.1*(1+tech.turretRate),range:215*s*(1+tech.turretRange),cd:0},
      // Commander Holt + the main turret remain the readable defense line
      // defense line while mixed infected use the eight barricade lanes.
      squad:[],
      enemies:[],corpses:[],bullets:[],particles:[],damage:{commander:0,turret:0,squad:0,artillery:0},feedback:null };
  }
  function canvasRadius(worldRadius){return worldRadius*run.worldScale;}
  function lanePoint(lane,worldRadius,tangentWorld){var ratio=worldRadius/BARRICADE_WORLD_RADIUS,t=canvasRadius(tangentWorld||0),tx=-Math.sin(lane.angle),ty=Math.cos(lane.angle);return{x:run.hq.x+canvasRadius(lane.baseX*ratio)+tx*t,y:run.hq.y+canvasRadius(lane.baseY*ratio)+ty*t};}
  function chooseLane(){
    var best=run.nextLane,bestLength=Infinity;
    for(var offset=0;offset<LANE_COUNT;offset++){
      var index=(run.nextLane+offset)%LANE_COUNT,length=run.lanes[index].queue.length;
      if(length<bestLength){best=index;bestLength=length;if(length===0)break;}
    }
    run.nextLane=(best+1)%LANE_COUNT;
    return run.lanes[best];
  }
  function removeFromLane(e){
    if(!run||e.lane==null||!run.lanes[e.lane])return;
    var queue=run.lanes[e.lane].queue,index=queue.indexOf(e);
    if(index>=0)queue.splice(index,1);
  }
  function enemy(kind) {
    var lane=kind==='boss'?run.lanes[BOSS_LANE_INDEX]:chooseLane(),a=lane.angle,s=dpr(),assistScale=1-run.assist,profile=run.balance;
    var base=kind==='boss'?{hp:profile.bossHp,speed:25,damage:profile.bossDamage,cycle:1.2}:kind==='armored'?{hp:68,speed:31,damage:12,cycle:1.16}:kind==='runner'?{hp:20,speed:74,damage:5.5,cycle:.88}:{hp:34,speed:43,damage:7,cycle:ENEMY_ATTACK_CYCLE};
    var hpScale=kind==='boss'?assistScale:profile.hp*assistScale,damageScale=kind==='boss'?assistScale:profile.damage*assistScale;
    var tangentWorld=(Math.random()-.5)*.32,spawn=lanePoint(lane,SPAWN_WORLD_RADIUS+Math.random()*.3,tangentWorld);
    var nextId=run.spawned++,variant=kind==='runner'||(kind==='grunt'&&nextId%4===1)?'scout':'soldier';
    var unit={id:nextId,variant:variant,x:spawn.x,y:spawn.y,r:(kind==='boss'?30:kind==='armored'?17:13)*s,hp:base.hp*hpScale,maxHp:base.hp*hpScale,kind:kind,speed:base.speed*s,damage:base.damage*damageScale,attackCycle:base.cycle,cd:0,age:Math.random(),moving:true,waiting:false,engaged:false,targetType:null,lane:lane.index,hit:0,flash:0,aim:a+Math.PI};
    lane.queue.push(unit);
    return unit;
  }
  function nearest(o,range){var t=null,b=range;run.enemies.forEach(function(e){var x=dist(o,e);if(x<b){b=x;t=e;}});return t;}
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
    if(source==='turret'&&t.kind==='boss')shotDamage*=1+(run.turretBossDamage||0);
    run.bullets.push({x:o.x+Math.cos(o.aim)*10*dpr(),y:o.y+Math.sin(o.aim)*10*dpr(),px:o.x,py:o.y,vx:x/l*speed*dpr(),vy:y/l*speed*dpr(),damage:shotDamage,life:.9,source:source,color:source==='commander'?'#fff07a':source==='turret'?'#ff8a2a':'#8edcff'});
  }
  function kill(i,e){
    var isBoss=e.kind==='boss';
    for(var n=0;n<(isBoss?18:7);n++)run.particles.push({x:e.x+(Math.random()-.5)*e.r,y:e.y+(Math.random()-.5)*e.r,life:.35+Math.random()*.3,max:.65,r:(2+Math.random()*5)*dpr(),color:isBoss?'#ff6a38':'#e35238',filled:true,type:'debris'});
    removeFromLane(e);
    var corpseLife=isBoss?1.05:.8;
    run.corpses.push({id:e.id,variant:e.variant,x:e.x,y:e.y,kind:e.kind,aim:e.aim,moving:false,waiting:false,engaged:false,life:corpseLife,max:corpseLife});
    while(run.corpses.length>3)run.corpses.shift();
    run.enemies.splice(i,1);
    run.kills++;
    if(isBoss){
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
    run.enemies.forEach(function(e){var dealt=Math.min(run.abilityDamage,e.hp);e.hp-=run.abilityDamage;run.damage.artillery+=dealt;run.particles.push({x:e.x,y:e.y,life:.55,max:.55,r:34*dpr(),color:'#ff3c27',type:'artillery'});});
    for(var i=run.enemies.length-1;i>=0;i--)if(run.enemies[i].hp<=0)kill(i,run.enemies[i]);
  }
  function defeatAdvice(){
    if(meta.hq<2)return 'Recommended next: upgrade Headquarters for more health, stronger barriers, and the reinforced Level 2 compound.';
    if(purchasedResearchCount()<3)return 'Recommended next: open the Research Center and complete an available permanent upgrade.';
    if(meta.commander<4)return 'Recommended next: upgrade Commander Holt to increase damage and fire rate.';
    return 'Recommended next: advance the Fire Control or Fortifications research branch.';
  }
  function finish(won) {
    if (!run || run.complete) return;
    run.complete = true;
    run.active = false;
    run.upgradeOpen = false;
    combatSfx(won?'victory':'defeat');
    combatHaptic(won?'success':'error',300);
    id('hq-upgrade-overlay').classList.remove('show');
    G.state.waveInProgress = false;
    var clearedPhase = run.phase;
    var reward = won ? 250 + run.kills * 3 : Math.min(250,100+clearedPhase*25+Math.floor(run.kills*2));
    var parts = won ? 3 : 0;
    meta.credits += reward;
    meta.parts += parts;
    if (won) {
      meta.bestPhase = Math.max(meta.bestPhase, clearedPhase);
      if (clearedPhase >= meta.phase) meta.phase = clearedPhase + 1;
      delete meta.phaseLosses[String(clearedPhase)];
    } else {
      meta.phaseLosses[String(clearedPhase)]=phaseLossCount(clearedPhase)+1;
    }
    saveMeta();
    var nextSupport=won?0:retryAssist(clearedPhase),supportCopy=nextSupport>0?' Field support is active for the next attempt: enemy health and damage -'+Math.round(nextSupport*100)+'%.':'';
    id('l137-result-kicker').textContent = won ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED';
    id('l137-result-title').textContent = won ? 'PHASE ' + clearedPhase + ' SECURED' : 'HEADQUARTERS LOST';
    id('l137-result-copy').textContent = won ? 'The Siege Breaker is destroyed. Phase ' + meta.phase + ' is ready for deployment.' : defeatAdvice()+supportCopy;
    id('l137-result-reward').innerHTML = '<b>' + reward + ' CREDITS' + (parts ? ' · ' + parts + ' TECH PARTS' : '') + '</b><small>' + (won?'VICTORY REWARD':'SALVAGE REWARD · PROGRESS IS NEVER LOST') + '</small><small>' + run.kills + ' ENEMIES ELIMINATED</small><small>HOLT '+Math.round(run.damage.commander)+' · TURRET '+Math.round(run.damage.turret)+' · ARTILLERY '+Math.round(run.damage.artillery)+'</small>';
    id('l141-continue').textContent = won ? 'CONTINUE TO PHASE ' + meta.phase : 'RETRY PHASE ' + clearedPhase;
    id('l137-retry').textContent = 'REPLAY PHASE ' + clearedPhase;
    id('l137-retry').style.display = won ? '' : 'none';
    id('lsc137-result').classList.add('show');
  }
  function returnHome(){closePause();hideBattleLoading();_gameSpeed=1;id('lsc137-result').classList.remove('show');id('lsc137-app').classList.remove('hidden');document.body.classList.remove('lsc137-mode');if(window.LSC3DPrototype)window.LSC3DPrototype.stop();if(run){run.enemies=[];run.corpses=[];run.bullets=[];run.lanes.forEach(function(lane){lane.queue=[];});run.active=false;}run=null;G.state._centralHQMode=false;G.state.waveInProgress=false;renderTab('campaign');}

  function updateBattleHUD(){
    if(!run)return;
    var completed=0,total=1;for(var i=0;i<run.assaultTargets.length;i++){total+=run.assaultTargets[i];if(i<run.assault-1)completed+=run.assaultTargets[i];}completed+=run.assaultKills;if(run.bossDefeated)completed++;
    var pct=Math.min(100,Math.floor((completed/total)*100));
    var fill=id('l139-progress-fill'),label=id('l139-progress-label'),count=id('l139-progress-count');
    if(fill)fill.style.width=pct+'%';
    if(label)label.textContent=(run.bossSpawned&&!run.bossDefeated?'FINAL ASSAULT · SIEGE BREAKER':'PHASE '+run.phase+' · ASSAULT '+run.assault+'/3')+' · '+pct+'%'+(run.assist>0?' · SUPPORT '+Math.round(run.assist*100)+'%':'');
    if(count){var barriers=run.lanes.filter(function(lane){return lane.barricade.hp>0;}).length;count.textContent=run.enemies.filter(function(e){return e.hp>0;}).length+' THREATS · '+barriers+'/'+LANE_COUNT+' BARRIERS';}
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
  function update(dt){
    if(!run||!run.active||run.paused||run.upgradeOpen)return;
    run.elapsed+=dt;
    run.assaultElapsed+=dt;
    run.spawn-=dt;
    run.abilityCd=Math.max(0,run.abilityCd-dt);
    var ab=id('lsc137-ability');
    if(ab){ab.disabled=run.abilityCd>0;ab.textContent=run.abilityCd>0?Math.ceil(run.abilityCd)+'s':'ARTILLERY';}
    var target=run.assaultTargets[run.assault-1],remaining=target-run.assaultSpawned,pacing=assaultPacing(run.assault);
    if(run.spawn<=0&&remaining>0){
      var group=Math.min(remaining,pacing.group);
      for(var g=0;g<group;g++){run.enemies.push(enemy(chooseEnemyKind(run.assault)));run.assaultSpawned++;}
      run.spawn=pacing.interval*(.92+Math.random()*.16);
    }
    if(run.assault===3&&run.assaultSpawned>=target&&!run.bossSpawned&&run.enemies.length===0&&run.bullets.length===0){run.bossSpawned=true;run.enemies.push(enemy('boss'));combatSfx('bossAlarm');combatHaptic('heavy',300);}
    [run.hero,run.turret].concat(run.squad).forEach(function(a){a.cd-=dt;var t=nearest(a,a.range);if(t&&a.cd<=0){fire(a,t,a.damage);a.cd=1/a.rate;}});
    run.lanes.forEach(function(lane){lane.barricade.flash=Math.max(0,lane.barricade.flash-dt);});
    for(var i=run.enemies.length-1;i>=0;i--){var e=run.enemies[i],lane=run.lanes[e.lane],queueIndex=lane?lane.queue.indexOf(e):-1;if(!lane||queueIndex<0)continue;var front=queueIndex===0,barrierUp=lane.barricade.hp>0,bossPadding=e.kind==='boss'?.72:e.kind==='armored'?.2:0,targetWorld=front?(barrierUp?BARRICADE_STOP_WORLD_RADIUS+bossPadding:HQ_ATTACK_WORLD_RADIUS+bossPadding):QUEUE_START_WORLD_RADIUS+Math.max(0,queueIndex-1)*QUEUE_GAP_WORLD_RADIUS,targetPoint=lanePoint(lane,targetWorld,0),tx=targetPoint.x,ty=targetPoint.y,x=tx-e.x,y=ty-e.y,l=Math.hypot(x,y);e.age+=dt;e.hit=Math.max(0,e.hit-dt);e.flash=Math.max(0,e.flash-dt);e.aim=Math.atan2(run.hq.y-e.y,run.hq.x-e.x);e.waiting=!front;
      if(!front){e.engaged=false;e.targetType='queue';if(l>2*dpr()){e.moving=true;var queueStep=Math.min(l,e.speed*dt);e.x+=x/l*queueStep;e.y+=y/l*queueStep;}else{e.moving=false;e.x=tx;e.y=ty;}continue;}
      var targetType=barrierUp?'barricade':'hq';if(e.targetType!==targetType){e.engaged=false;e.targetType=targetType;e.cd=Math.min(e.cd,.18);}
      if(!e.engaged){if(l>2*dpr()){e.moving=true;var step=Math.min(l,e.speed*dt);e.x+=x/l*step;e.y+=y/l*step;}else{e.engaged=true;e.moving=false;e.x=tx;e.y=ty;e.cd=Math.min(e.cd,.18);}}else{e.x=tx;e.y=ty;e.moving=false;e.cd-=dt;if(e.cd<=0){if(targetType==='barricade'){var beforeHp=lane.barricade.hp,barrierDamage=e.damage*(1-(run.barrierDamageReduction||0));lane.barricade.hp=Math.max(0,beforeHp-barrierDamage);lane.barricade.flash=.2;var barrierFx=lanePoint(lane,BARRICADE_WORLD_RADIUS,0);run.particles.push({x:barrierFx.x,y:barrierFx.y,life:.26,max:.26,r:11*dpr(),color:'#e1aa67',type:'barrier'});combatSfx('barrierHit',145);if(lane.barricade.hp<=0&&beforeHp>0){combatSfx('barrierBreak');combatHaptic('medium',260);e.engaged=false;e.targetType='hq';}}else{run.hq.hp-=e.damage*(1-(run.hqDamageReduction||0));run.lastHit=performance.now();run.particles.push({x:run.hq.x+(Math.random()-.5)*run.hq.r,y:run.hq.y+(Math.random()-.5)*run.hq.r,life:.24,max:.24,r:13*dpr(),color:'#ff6248',type:'hq-hit'});combatSfx('hqHit',280);combatHaptic('medium',650);}e.cd=e.attackCycle||ENEMY_ATTACK_CYCLE;e.flash=.18;}}
    }
    for(var b=run.bullets.length-1;b>=0;b--){var q=run.bullets[b];q.px=q.x;q.py=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;var hit=-1;for(var j=0;j<run.enemies.length;j++)if(dist(q,run.enemies[j])<run.enemies[j].r+4*dpr()){hit=j;break;}if(hit>=0){var target=run.enemies[hit],dealt=Math.min(q.damage,target.hp);target.hp-=q.damage;target.hit=.16;run.damage[q.source]+=dealt;run.particles.push({x:target.x,y:target.y,life:.26,max:.26,r:(q.source==='turret'?14:9)*dpr(),color:q.color,type:q.source==='turret'?'turret-impact':'commander-impact'});run.bullets.splice(b,1);if(target.hp<=0)kill(hit,target);}else if(q.life<=0)run.bullets.splice(b,1);}
    [run.hero,run.turret].concat(run.squad).forEach(function(a){a.flash=Math.max(0,(a.flash||0)-dt);});for(var c=run.corpses.length-1;c>=0;c--){run.corpses[c].life-=dt;if(run.corpses[c].life<=0)run.corpses.splice(c,1);}for(var p=run.particles.length-1;p>=0;p--){run.particles[p].life-=dt;if(run.particles[p].life<=0)run.particles.splice(p,1);}if(run.feedback){run.feedback.life-=dt;if(run.feedback.life<=0)run.feedback=null;}
    if(run.hq.hp<=0){finish(false);return;}var cleared=run.assaultSpawned>=target&&run.enemies.length===0&&run.bullets.length===0&&(run.assault<3||run.bossDefeated);if(cleared){run.transition+=dt;if(run.transition>=1.2){if(run.assault===3)finish(true);else{if(run.assaultHqRepair>0)run.hq.hp=Math.min(run.hq.maxHp,run.hq.hp+run.assaultHqRepair);if(run.assaultBarrierRepair>0)run.lanes.forEach(function(repairLane){if(repairLane.barricade.hp>0)repairLane.barricade.hp=Math.min(repairLane.barricade.maxHp,repairLane.barricade.hp+run.assaultBarrierRepair);});run.assault++;run.assaultElapsed=0;run.assaultSpawned=0;run.assaultKills=0;run.spawn=.6;run.transition=0;combatSfx('phase');combatHaptic('light',180);}}}else run.transition=0;
  }
  function circle(x,y,r,fill,stroke,w){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w||1;ctx.stroke();}}
  function poly(points,fill,stroke,w){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w||1;ctx.stroke();}}
  function spriteCell(index,x,y,w,h,alpha){if(!combatAtlas.complete||!combatAtlas.naturalWidth)return false;var col=index%4,row=Math.floor(index/4),sw=combatAtlas.naturalWidth/4,sh=combatAtlas.naturalHeight/2;ctx.save();ctx.globalAlpha=alpha==null?1:alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(combatAtlas,col*sw,row*sh,sw,sh,x-w/2,y-h,w,h);ctx.restore();return true;}
  function animationCell(row,frame,x,y,w,h,flip,alpha,rotation){if(!animationAtlas.complete||!animationAtlas.naturalWidth)return false;var sw=animationAtlas.naturalWidth/5,sh=animationAtlas.naturalHeight/5;ctx.save();ctx.translate(x,y);if(rotation)ctx.rotate(rotation);ctx.scale(flip?-1:1,1);ctx.globalAlpha=alpha==null?1:alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(animationAtlas,frame*sw,row*sh,sw,sh,-w/2,-h,w,h);ctx.restore();return true;}
  function animatedUnit(a,row,w,h,moving,dead){var s=dpr(),clock=(a.age==null?run.elapsed:a.age),frame=0,bob=0,rot=0;if(dead){frame=4;rot=(1-(a.life/a.max))*.12;}else if((a.hit||0)>0){frame=4;rot=Math.sin(clock*70)*.035;}else if((a.flash||0)>0){frame=3;rot=-.025;}else if(moving){frame=1+(Math.floor(clock*7)%2);bob=Math.sin(clock*14)*2.2*s;}else{bob=Math.sin(clock*3.2)*.8*s;}var aim=a.aim==null?-Math.PI/2:a.aim,flip=Math.cos(aim)<0;return animationCell(row,frame,a.x,a.y+bob,w*s,h*s,flip,dead?clamp(a.life/a.max,0,1):1,rot);}
  function drawProductionSoldier(a,hostile,heavy,commander){var s=dpr(),row=commander?0:hostile?(heavy?3:2):1;if(!animatedUnit(a,row,heavy?58:46,heavy?82:68,!!a.moving,false)){var cell=commander?0:hostile?(heavy?3:2):1;if(!spriteCell(cell,a.x,a.y+(heavy?22:17)*s,(heavy?52:43)*s,(heavy?76:65)*s))return drawSoldier(a,hostile,heavy,commander);}if(a.flash){var aim=a.aim==null?-Math.PI/2:a.aim,color=commander?'#fff07a':hostile?'#ff6a4a':'#8edcff';ctx.save();ctx.translate(a.x,a.y);ctx.rotate(aim);ctx.shadowColor=color;ctx.shadowBlur=12*s;poly([[29*s,0],[20*s,-5*s],[20*s,5*s]],color);ctx.restore();}}
  function drawProductionHQ(h){var s=dpr(),level=Math.min(5,Math.max(1,Number(h.level)||1)),wallW=(50+(level-1)*7)*s,wallH=(37+(level-1)*5)*s;ctx.save();ctx.translate(h.x,h.y+5*s);ctx.fillStyle=level>=4?'rgba(45,83,86,.72)':'rgba(61,76,67,.64)';ctx.strokeStyle=level>=5?'#7ef8ff':level>=3?'#d4b45e':'#9a8653';ctx.lineWidth=(1+level)*s;ctx.fillRect(-wallW,-wallH,wallW*2,wallH*2);ctx.strokeRect(-wallW,-wallH,wallW*2,wallH*2);if(level>=3){[[-wallW,-wallH],[wallW,-wallH],[-wallW,wallH],[wallW,wallH]].forEach(function(point){circle(point[0],point[1],(4+level)*s,level>=5?'#2e686e':'#526b68',level>=5?'#9cecff':'#d4b45e',2*s);});}ctx.restore();if(!spriteCell(4,h.x,h.y+43*s,(128+(level-1)*4)*s,(120+(level-1)*4)*s))drawHQ(h);}
  function drawProductionTurret(t){var s=dpr(),target=nearest(t,t.range),ang=target?Math.atan2(target.y-t.y,target.x-t.x):(t.aim||0);t.aim=ang;if(!spriteCell(5,t.x,t.y+26*s,88*s,80*s))return drawTurret(t);if(t.flash){ctx.save();ctx.translate(t.x,t.y);ctx.rotate(ang);ctx.shadowColor='#ff9d35';ctx.shadowBlur=18*s;poly([[47*s,0],[35*s,-8*s],[35*s,8*s]],'#ffd166');ctx.restore();}}
  function drawProductionBoss(e){var s=dpr();if(!animatedUnit(e,4,126,116,!!e.moving,false)&&!spriteCell(7,e.x,e.y+43*s,122*s,116*s))drawBoss(e);}
  function drawProductionPerimeter(h){var s=dpr(),level=Math.min(5,Math.max(1,Number(h.level)||1));if(!combatAtlas.complete||!combatAtlas.naturalWidth)return drawPerimeter(h);run.lanes.forEach(function(lane){if(lane.barricade.hp<=0)return;var point=lanePoint(lane,BARRICADE_WORLD_RADIUS,0),alpha=lane.barricade.flash>0?.58:1,width=(66+(level-1)*4)*s,height=(42+(level-1)*5)*s;ctx.save();ctx.translate(point.x,point.y);ctx.rotate(lane.rotation);spriteCell(6,0,12*s,width,height,alpha);if(level>=2){ctx.strokeStyle=level>=5?'#7ef8ff':level>=4?'#86a5a5':'#c3ad70';ctx.lineWidth=Math.max(1,level-1)*s;ctx.strokeRect(-width*.48,-height*.35,width*.96,height*.28);}ctx.restore();});}
  function drawEnvironment(W,H,h){var s=dpr(),lane='#2a3128';ctx.fillStyle='#111710';ctx.fillRect(0,0,W,H);var glow=ctx.createRadialGradient(h.x,h.y,30*s,h.x,h.y,Math.max(W,H)*.7);glow.addColorStop(0,'rgba(73,91,53,.78)');glow.addColorStop(.55,'rgba(37,48,31,.55)');glow.addColorStop(1,'rgba(7,10,8,.92)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(h.x,h.y);ctx.strokeStyle=lane;ctx.lineWidth=28*s;ctx.setLineDash([12*s,8*s]);for(var a=0;a<TAU;a+=Math.PI/2){ctx.beginPath();ctx.moveTo(Math.cos(a)*112*s,Math.sin(a)*112*s);ctx.lineTo(Math.cos(a)*Math.max(W,H),Math.sin(a)*Math.max(W,H));ctx.stroke();}ctx.restore();ctx.save();ctx.strokeStyle='rgba(219,205,140,.22)';ctx.lineWidth=8*s;ctx.setLineDash([18*s,7*s]);run.lanes.forEach(function(item,index){var p=lanePoint(item,BARRICADE_WORLD_RADIUS,0);if(index===0){ctx.beginPath();ctx.moveTo(p.x,p.y);}else ctx.lineTo(p.x,p.y);});ctx.closePath();ctx.stroke();ctx.restore();for(var i=0;i<34;i++){var px=(i*83%Math.max(1,W-20*s))+10*s,py=(i*137%Math.max(1,H-80*s))+46*s;ctx.fillStyle=i%3?'rgba(124,137,95,.14)':'rgba(73,83,62,.22)';ctx.fillRect(px,py,(i%4+2)*s,(i%3+1)*s);}drawProductionPerimeter(h);}
  function drawPerimeter(h){var s=dpr();run.lanes.forEach(function(lane){if(lane.barricade.hp<=0)return;var point=lanePoint(lane,BARRICADE_WORLD_RADIUS,0),x=point.x,y=point.y;ctx.save();ctx.translate(x,y);ctx.rotate(lane.rotation);ctx.fillStyle=lane.barricade.flash>0?'#a24736':'#5d5138';ctx.fillRect(-27*s,-6*s,54*s,12*s);ctx.fillStyle='#887450';ctx.fillRect(-25*s,-6*s,50*s,4*s);ctx.strokeStyle='rgba(255,216,139,.3)';ctx.strokeRect(-27*s,-6*s,54*s,12*s);ctx.restore();});}
  function drawSoldier(a, hostile, heavy, commander) {
    var s=dpr(), aim=a.aim==null?(hostile?Math.atan2(run.hq.y-a.y,run.hq.x-a.x):-Math.PI/2):a.aim, armor=hostile?(heavy?'#7b3829':'#632d27'):(commander?'#8a7540':'#315d45'),light=hostile?'#ff7458':(commander?'#ffe36d':'#8fffc0'),dark=hostile?'#2b1514':'#14251d';
    ctx.save();ctx.translate(a.x,a.y);ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(1*s,10*s,(heavy?13:10)*s,4*s,0,0,TAU);ctx.fill();ctx.rotate(aim+Math.PI/2);poly([[-7*s,8*s],[7*s,8*s],[9*s,-3*s],[5*s,-9*s],[-5*s,-9*s],[-9*s,-3*s]],armor,light,1.2*s);ctx.fillStyle=dark;ctx.fillRect(-6*s,3*s,12*s,5*s);circle(0,-12*s,(heavy?7:6)*s,dark,light,1.2*s);ctx.fillStyle=light;ctx.fillRect(-5*s,-15*s,10*s,2*s);ctx.strokeStyle=commander?'#ffe36d':'#b8d7c5';ctx.lineWidth=(commander?3:2)*s;ctx.beginPath();ctx.moveTo(4*s,-2*s);ctx.lineTo(5*s,-19*s);ctx.stroke();if(a.flash){ctx.fillStyle=light;ctx.shadowColor=light;ctx.shadowBlur=10*s;poly([[5*s,-25*s],[1*s,-18*s],[9*s,-18*s]],light);}if(commander){ctx.fillStyle='#f1cf52';ctx.fillRect(-10*s,-2*s,3*s,7*s);ctx.fillStyle='#162029';ctx.fillRect(7*s,-4*s,4*s,9*s);}ctx.restore();
  }
  function drawHQ(h) {var s=dpr();ctx.save();ctx.translate(h.x,h.y);ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.ellipse(2*s,32*s,52*s,15*s,0,0,TAU);ctx.fill();poly([[-42*s,-20*s],[0,-39*s],[42*s,-20*s],[0,1*s]],'#42565a','#75e8ff',1.5*s);poly([[-42*s,-20*s],[0,1*s],[0,34*s],[-42*s,13*s]],'#26383b','#17252a');poly([[0,1*s],[42*s,-20*s],[42*s,13*s],[0,34*s]],'#1b2d32','#17252a');poly([[-25*s,-37*s],[0,-48*s],[25*s,-37*s],[0,-26*s]],'#66767a','#9cecff',s);poly([[-25*s,-37*s],[0,-26*s],[0,-12*s],[-25*s,-23*s]],'#344a50');poly([[0,-26*s],[25*s,-37*s],[25*s,-23*s],[0,-12*s]],'#263b42');ctx.fillStyle='#07151b';ctx.fillRect(-9*s,9*s,18*s,22*s);ctx.fillStyle='#ffd166';ctx.fillRect(-3*s,-57*s,6*s,11*s);ctx.strokeStyle='#ffd166';ctx.beginPath();ctx.moveTo(0,-57*s);ctx.lineTo(0,-68*s);ctx.stroke();circle(0,-70*s,3*s,'#ffd166');ctx.fillStyle='#baf3ff';ctx.font='bold '+8*s+'px Rajdhani';ctx.textAlign='center';ctx.fillText('HQ',0,-16*s);ctx.restore();}
  function drawTurret(t){var s=dpr(),target=nearest(t,t.range),ang=target?Math.atan2(target.y-t.y,target.x-t.x):(t.aim||0);t.aim=ang;ctx.save();ctx.translate(t.x,t.y);ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(0,10*s,18*s,6*s,0,0,TAU);ctx.fill();poly([[-15*s,7*s],[0,14*s],[15*s,7*s],[0,0]],'#3e463d','#ff9c3f',s);ctx.rotate(ang);circle(0,0,10*s,'#596154','#ffad52',1.5*s);ctx.fillStyle='#e27a25';ctx.fillRect(2*s,-5*s,28*s,4*s);ctx.fillRect(2*s,2*s,28*s,4*s);if(t.flash){ctx.shadowColor='#ff9d35';ctx.shadowBlur=14*s;poly([[38*s,0],[29*s,-7*s],[29*s,7*s]],'#ffd166');}ctx.restore();ctx.fillStyle='#ffb14a';ctx.font='bold '+7*s+'px "Share Tech Mono"';ctx.textAlign='center';ctx.fillText('MAIN TURRET',t.x,t.y+25*s);}
  function drawBoss(e){var s=dpr(),ang=Math.atan2(run.hq.y-e.y,run.hq.x-e.x);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(ang+Math.PI/2);ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.ellipse(0,18*s,31*s,9*s,0,0,TAU);ctx.fill();poly([[-25*s,17*s],[25*s,17*s],[21*s,-12*s],[12*s,-24*s],[-12*s,-24*s],[-21*s,-12*s]],'#5f2422','#ff553f',2*s);ctx.fillStyle='#2a1417';ctx.fillRect(-19*s,-10*s,38*s,20*s);ctx.fillStyle='#ff833d';ctx.fillRect(-15*s,-15*s,8*s,6*s);ctx.fillRect(7*s,-15*s,8*s,6*s);ctx.strokeStyle='#ffb14a';ctx.lineWidth=5*s;ctx.beginPath();ctx.moveTo(-16*s,-4*s);ctx.lineTo(-25*s,-26*s);ctx.moveTo(16*s,-4*s);ctx.lineTo(25*s,-26*s);ctx.stroke();ctx.restore();ctx.fillStyle='#ffb14a';ctx.font='bold '+8*s+'px "Share Tech Mono"';ctx.textAlign='center';ctx.fillText('SIEGE BREAKER',e.x,e.y+34*s);}
  function draw(){if(!run||!ctx)return oldDraw&&oldDraw(G.state);var W=canvas.width,H=canvas.height,s=dpr(),h=run.hq;drawEnvironment(W,H,h);circle(h.x,h.y,112*s,'rgba(50,220,255,.018)','rgba(86,223,255,.075)',s);circle(run.turret.x,run.turret.y,run.turret.range,null,'rgba(255,151,55,.035)',s);drawProductionHQ(h);drawProductionTurret(run.turret);run.squad.forEach(function(a){a.age=run.elapsed;drawProductionSoldier(a,false,false,false);});circle(run.hero.x,run.hero.y,run.hero.range,null,'rgba(255,240,122,.04)',s);run.hero.age=run.elapsed;drawProductionSoldier(run.hero,false,true,true);run.corpses.forEach(function(e){animatedUnit(e,e.kind==='boss'?4:e.kind==='armored'?3:2,e.kind==='boss'?126:e.kind==='armored'?58:46,e.kind==='boss'?116:e.kind==='armored'?82:68,false,true);});
    run.enemies.forEach(function(e){if(e.kind==='boss')drawProductionBoss(e);else drawProductionSoldier(e,true,e.kind==='armored',false);if(e.hp<e.maxHp||e.kind==='boss'){ctx.fillStyle='rgba(35,3,3,.85)';ctx.fillRect(e.x-e.r,e.y-e.r-15*s,e.r*2,4*s);ctx.fillStyle=e.kind==='boss'?'#ff3c3c':'#ff694d';ctx.fillRect(e.x-e.r,e.y-e.r-15*s,e.r*2*(e.hp/e.maxHp),4*s);}});run.bullets.forEach(function(b){ctx.save();ctx.strokeStyle=b.color;ctx.lineWidth=(b.source==='turret'?5:b.source==='commander'?2.5:1.7)*s;ctx.shadowColor=b.color;ctx.shadowBlur=(b.source==='turret'?14:8)*s;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();});run.particles.forEach(function(p){var a=p.life/p.max;ctx.globalAlpha=clamp(a,0,1);if(p.filled)circle(p.x,p.y,p.r*(1.2-a*.2),p.color);else circle(p.x,p.y,p.r*(1-a*.35),null,p.color,Math.max(1,4*a)*s);ctx.globalAlpha=1;});
    if(run.feedback){var fc=run.feedback.source==='commander'?'#fff07a':run.feedback.source==='turret'?'#ff8a2a':'#55e7ff',fa=Math.min(1,run.feedback.life/.35),fy=84*s;ctx.globalAlpha=fa;ctx.fillStyle='rgba(3,10,15,.92)';ctx.fillRect(W*.16,fy,W*.68,24*s);ctx.strokeStyle=fc;ctx.strokeRect(W*.16,fy,W*.68,24*s);ctx.fillStyle=fc;ctx.font='bold '+8*s+'px "Share Tech Mono"';ctx.textAlign='center';ctx.fillText(run.feedback.text,W/2,fy+15*s);ctx.globalAlpha=1;}var hp=clamp(h.hp/h.maxHp,0,1),xp=clamp(run.xp/run.xpNext,0,1);ctx.fillStyle='rgba(3,10,15,.9)';ctx.fillRect(0,0,W,42*s);ctx.strokeStyle='rgba(34,212,255,.35)';ctx.beginPath();ctx.moveTo(0,42*s);ctx.lineTo(W,42*s);ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold '+9*s+'px "Share Tech Mono"';ctx.textAlign='left';ctx.fillText('PHASE '+run.phase+' · ASSAULT '+run.assault+'/3',12*s,16*s);ctx.fillStyle='#9cecff';ctx.fillText('FIELD RANK '+run.level,12*s,31*s);ctx.fillStyle='rgba(0,0,0,.76)';ctx.fillRect(12*s,H-39*s,W-24*s,27*s);ctx.fillStyle=hp>.35?'#18f06a':'#ff3c3c';ctx.fillRect(14*s,H-35*s,(W-28*s)*hp,8*s);ctx.fillStyle='#22d4ff';ctx.fillRect(14*s,H-21*s,(W-28*s)*xp,5*s);ctx.fillStyle='#fff';ctx.font=7*s+'px "Share Tech Mono"';ctx.textAlign='left';ctx.fillText('HQ '+Math.ceil(h.hp)+' / '+h.maxHp,15*s,H-28*s);if(performance.now()-run.lastHit<180){ctx.fillStyle='rgba(255,0,0,.1)';ctx.fillRect(0,0,W,H);}}

  var draw2D = draw;
  draw = function(){
    if(run && window.LSC3DPrototype && window.LSC3DPrototype.render(run)) return;
    return draw2D();
  };

  installStyles(); installUI(); renderTab('campaign'); enforceCommandBaseStartup();
  // iOS can restore a cached visual snapshot on pageshow. Reassert the current
  // route after restoration; no progression data is cleared by this safeguard.
  window.addEventListener('pageshow', function () { if (!run) enforceCommandBaseStartup(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !run) enforceCommandBaseStartup(); });
  _patchedUpdate=function(dt,c,onEnd,onGameOver,onWarn){if(run&&G.state&&G.state._centralHQMode){if(!run.paused)update(dt);updateBattleHUD();return;}return oldUpdate&&oldUpdate(dt,c,onEnd,onGameOver,onWarn);};
  drawVertical=function(state){if(run&&state&&state._centralHQMode)return draw();return oldDraw&&oldDraw(state);};
})();
