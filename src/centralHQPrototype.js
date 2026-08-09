// Build 145 — animated 2.5D unit integration.
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
  var combatAtlas = new Image();
  combatAtlas.src = 'assets/visual144/combat-atlas.png';
  var animationAtlas = new Image();
  animationAtlas.src = 'assets/unit-animation-atlas.png';
  var META_KEY = 'lsc_command_base_137'; // Preserve Build 137 progression.
  var meta = loadMeta();

  function id(x) { return document.getElementById(x); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function dpr() { return window.devicePixelRatio || 1; }
  function defaults() { return { credits: 500, parts: 12, phase: 1, bestPhase: 0, commander: 1, research: 0, hq: 1 }; }
  function loadMeta() {
    try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(META_KEY) || '{}')); }
    catch (e) { return defaults(); }
  }
  function saveMeta() { localStorage.setItem(META_KEY, JSON.stringify(meta)); }
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
      '.l137-hero{height:34%;min-height:180px;display:flex;align-items:center;justify-content:center;position:relative}.l137-hq-art{width:150px;height:112px;border:2px solid #75e8ff;border-radius:18px 18px 28px 28px;background:linear-gradient(145deg,#294b57,#0d2028);box-shadow:0 0 55px rgba(34,212,255,.25),inset 0 -22px 35px #071117;position:relative}.l137-hq-art:before{content:"HQ";position:absolute;inset:28px 38px;border:2px solid #ffd166;border-radius:50%;display:grid;place-items:center;font-size:28px;font-weight:900;color:#fff}.l137-hq-lv{position:absolute;bottom:12px;font:9px "Share Tech Mono",monospace;color:#9cecff}' +
      '.l137-panel{flex:1;min-height:0;padding:15px;border:1px solid rgba(34,212,255,.22);border-radius:20px;background:rgba(6,16,23,.93);overflow:auto}.l137-kicker{font:8px "Share Tech Mono",monospace;letter-spacing:2px;color:#ffd166}.l137-h2{font-size:23px;font-weight:900;margin:3px 0 8px}.l137-copy{font:9px/1.55 "Share Tech Mono",monospace;color:#9eb1ba}.l137-card{margin-top:12px;padding:13px;border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.035)}' +
      '.l137-card-row{display:flex;justify-content:space-between;gap:12px;align-items:center}.l137-card b{font-size:15px}.l137-card small{display:block;font:8px/1.4 "Share Tech Mono",monospace;color:#82949d}.l137-btn{border:1px solid rgba(34,212,255,.35);border-radius:10px;padding:10px 13px;background:#103a4a;color:white;font:800 12px Rajdhani,sans-serif;white-space:nowrap}.l137-btn.good{background:#116c3b;border-color:#1ee873}.l137-btn:disabled{opacity:.38}.l137-deploy{width:100%;margin-top:14px;padding:14px;font-size:16px}' +
      '.l137-nav{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:10px}.l137-nav button{padding:9px 2px;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:#09141b;color:#91a7b1;font:700 9px Rajdhani,sans-serif}.l137-nav button.active{color:#fff;border-color:#22d4ff;background:#103040}' +
      '#lsc137-result{position:fixed;z-index:32000;inset:0;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,4,7,.9);backdrop-filter:blur(8px)}#lsc137-result.show{display:flex}.l137-result-card{width:min(420px,100%);padding:22px;border:1px solid rgba(34,212,255,.35);border-radius:20px;background:#08131a;text-align:center}.l137-result-card h2{font-size:28px;margin:3px}.l137-actions{display:grid;gap:8px;margin-top:17px}' +
      '#hq-upgrade-overlay{position:fixed;z-index:31000;inset:0;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,4,8,.86)}#hq-upgrade-overlay.show{display:flex}.hq-upgrade-modal{width:min(420px,100%);padding:18px;border:1px solid #846e36;border-radius:18px;background:#09131a}.hq-upgrade-title{text-align:center;font-size:23px;font-weight:900}.hq-upgrade-sub{text-align:center;color:#ffd166;font:8px "Share Tech Mono",monospace;margin-bottom:12px}.hq-upgrade-grid{display:grid;gap:8px}.hq-upgrade-choice{text-align:left;padding:12px;border:1px solid #245363;border-radius:11px;background:#10252e;color:#fff}.hq-upgrade-choice b,.hq-upgrade-choice span{display:block}.hq-upgrade-choice span{font:8px/1.4 "Share Tech Mono",monospace;color:#9dafb8}' +
      '#lsc137-ability{position:absolute;z-index:35;right:14px;bottom:48px;width:68px;height:68px;border:2px solid #ffd166;border-radius:50%;background:#513d0e;color:white;font:800 10px Rajdhani,sans-serif;box-shadow:0 0 25px rgba(255,209,102,.25)}#lsc137-ability:disabled{opacity:.35}' +
      '#l140-controls{position:absolute;z-index:42;right:12px;top:calc(env(safe-area-inset-top,0px) + 8px);display:flex;gap:6px}#l139-menu-btn,#l140-speed-btn{height:34px;border:1px solid #58dfff;border-radius:9px;background:rgba(5,18,26,.94);color:#fff;font:800 12px Rajdhani,sans-serif}#l139-menu-btn{width:38px;font-size:18px}#l140-speed-btn{width:42px;color:#ffd166}' +
      '#l139-pause{position:fixed;z-index:33000;inset:0;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,4,8,.9);backdrop-filter:blur(8px)}#l139-pause.show{display:flex}.l139-pause-card{width:min(400px,100%);padding:20px;border:1px solid rgba(34,212,255,.4);border-radius:18px;background:#08141b}.l139-setting{display:flex;justify-content:space-between;align-items:center;margin:8px 0;padding:10px;border:1px solid rgba(255,255,255,.1);border-radius:9px}.l139-setting button{min-width:58px}' +
      '.l139-progress{position:absolute;z-index:39;left:12px;right:108px;top:calc(env(safe-area-inset-top,0px) + 7px);height:35px;pointer-events:none}.l139-progress-track{height:6px;margin-top:4px;border-radius:6px;background:#182a32;overflow:hidden}.l139-progress-fill{height:100%;background:linear-gradient(90deg,#22d4ff,#18f06a);box-shadow:0 0 10px #22d4ff}.l139-progress-text{font:8px "Share Tech Mono",monospace;color:#fff;display:flex;justify-content:space-between}';
    document.head.appendChild(s);
  }

  function installUI() {
    var app = document.createElement('div');
    app.id = 'lsc137-app';
    app.innerHTML = '<div class="l137-shell"><div class="l137-top"><div><div class="l137-brand">LAST STAND COMMAND</div><div class="l137-title">COMMAND BASE</div></div><div class="l137-res" id="l137-res"></div></div><div class="l137-hero"><div class="l137-hq-art"></div><div class="l137-hq-lv" id="l137-hq-lv"></div></div><main class="l137-panel" id="l137-panel"></main><nav class="l137-nav" id="l137-nav"><button data-tab="campaign">CAMPAIGN</button><button data-tab="commander">COMMANDER</button><button data-tab="research">RESEARCH</button><button data-tab="hq">HQ</button><button data-tab="inventory">INVENTORY</button></nav></div>';
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
    up.innerHTML = '<div class="hq-upgrade-modal"><div class="hq-upgrade-title">FIELD PROMOTION</div><div class="hq-upgrade-sub">SELECT ONE COMBAT UPGRADE</div><div class="hq-upgrade-grid" id="hq-upgrade-grid"></div></div>';
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
    pause.addEventListener('click',function(e){var b=e.target.closest('[data-setting]');if(!b)return;var key='lsc_'+b.dataset.setting;var on=localStorage.getItem(key)!=='off';localStorage.setItem(key,on?'off':'on');b.textContent=on?'OFF':'ON';});
  }

  function setSimulationPaused(paused){if(run)run.paused=paused;if(G&&G.state)G.state.paused=paused;}
  function openPause(){if(!run||!run.active)return;setSimulationPaused(true);id('l139-pause').classList.add('show');}
  function closePause(){setSimulationPaused(false);id('l139-pause').classList.remove('show');}
  function setSpeed(value){if(!run)return;run.speed=value;_gameSpeed=value;var b=id('l140-speed-btn');if(b)b.textContent=value+'×';}
  function cycleSpeed(){if(!run||run.paused)return;setSpeed(run.speed===1?2:run.speed===2?3:1);}

  function refreshHeader() {
    id('l137-res').innerHTML = '<b>' + meta.credits + '</b> CREDITS<br><b>' + meta.parts + '</b> TECH PARTS';
    id('l137-hq-lv').textContent = 'HEADQUARTERS · LEVEL ' + meta.hq;
  }
  function renderTab(tab) {
    refreshHeader();
    Array.prototype.forEach.call(id('l137-nav').children, function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
    var p = id('l137-panel');
    if (tab === 'campaign') p.innerHTML = '<div class="l137-kicker">ACTIVE THEATER</div><div class="l137-h2">PHASE ' + meta.phase + ' · OUTER PERIMETER</div><div class="l137-copy">Hold the central headquarters through three assaults, then eliminate the Siege Breaker.</div><div class="l137-card"><div class="l137-card-row"><div><b>Recommended Power</b><small>' + (360 + meta.phase * 40) + ' · STANDARD RISK</small></div><div><b>Victory Rewards</b><small>' + (150 + meta.phase * 75) + '+ CREDITS · 3 TECH PARTS</small></div></div></div><button class="l137-btn good l137-deploy" id="l137-deploy">CHALLENGE PHASE ' + meta.phase + '</button>';
    if (tab === 'commander') p.innerHTML = upgradePanel('commander', 'COMMANDER HOLT', 'Permanent rifle damage and fire-rate training.', 'Combat Level ' + meta.commander);
    if (tab === 'research') p.innerHTML = upgradePanel('research', 'DEFENSE RESEARCH', 'Permanent turret and support-squad effectiveness.', 'Research Tier ' + meta.research);
    if (tab === 'hq') p.innerHTML = upgradePanel('hq', 'HEADQUARTERS', 'Permanent structural health for every phase.', 'Upgrade to HQ Level ' + (meta.hq + 1));
    if (tab === 'inventory') p.innerHTML = '<div class="l137-kicker">ARMORY</div><div class="l137-h2">INVENTORY</div><div class="l137-copy">Recovered equipment will appear here. The first functional equipment drops arrive after the core phase loop is balanced.</div><div class="l137-card"><b>Standard Issue Rifle</b><small>EQUIPPED · ASSAULT CLASS</small></div><div class="l137-card"><b>Field Armor</b><small>EQUIPPED · STANDARD PROTECTION</small></div>';
    var dep = id('l137-deploy'); if (dep) dep.onclick = launchPhase;
    var buy = id('l137-buy'); if (buy) buy.onclick = function () { buyUpgrade(tab); };
  }
  function upgradePanel(type, title, copy, level) {
    var cost = levelCost(type);
    var price = cost.credits + ' CREDITS' + (cost.parts ? ' · ' + cost.parts + ' TECH PARTS' : '');
    var short = meta.credits < cost.credits || meta.parts < cost.parts;
    return '<div class="l137-kicker">PERMANENT UPGRADE</div><div class="l137-h2">' + title + '</div><div class="l137-copy">' + copy + '</div><div class="l137-card"><div class="l137-card-row"><div><b>' + level + '</b><small>NEXT UPGRADE COST · ' + price + '</small></div><button class="l137-btn good" id="l137-buy" ' + (short ? 'disabled' : '') + '>' + (short ? 'NEED RESOURCES' : 'UPGRADE') + '</button></div></div>';
  }
  function buyUpgrade(type) {
    var cost = levelCost(type); if (meta.credits < cost.credits || meta.parts < cost.parts) return;
    meta.credits -= cost.credits; meta.parts -= cost.parts; meta[type]++; saveMeta(); renderTab(type);
  }

  function launchPhase(phaseOverride) {
    var home = id('homeScreen'); if (home) { home.style.display = 'none'; home.classList.remove('hs-visible'); }
    var start = id('startOverlay');
    if (G && G.state && !G.state.started) { if (!G.state.selectedDoctrine) G.state.selectedDoctrine = 'fortress'; var begin = id('beginBtn'); if (begin) begin.click(); }
    if (start) start.classList.add('hidden');
    id('lsc137-app').classList.add('hidden');
    document.body.classList.add('lsc137-mode');
    run = createRun(phaseOverride);setSpeed(1);
    G.state._centralHQMode = true; G.state.waveInProgress = true; G.state.gameOver = false; G.state.paused = false;
    id('lsc137-ability').disabled = false; id('lsc137-ability').textContent = 'ARTILLERY';
  }
  function createRun(phaseOverride) {
    var W = canvas.width || 390, H = canvas.height || 600, s = dpr(), cx = W / 2, cy = H * .56;
    var phase=Math.max(1,Number(phaseOverride)||meta.phase),targets=[8+phase*2,12+phase*2,16+phase*2];
    return { active:true, paused:false, complete:false, phase:phase, elapsed:0, speed:1, assault:1, assaultElapsed:0, assaultSpawned:0, assaultKills:0, assaultTargets:targets, transition:0, spawn:0, spawned:0, kills:0, xp:0, xpNext:30, level:1, bossSpawned:false, bossDefeated:false, upgradeOpen:false, abilityCd:0, lastHit:0,
      hq:{x:cx,y:cy,r:37*s,hp:300+(meta.hq-1)*75,maxHp:300+(meta.hq-1)*75},
      hero:{source:'commander',x:cx,y:cy+70*s,r:13*s,damage:16*(1+(meta.commander-1)*.15),rate:2.7*(1+(meta.commander-1)*.06),range:150*s,cd:0},
      turret:{source:'turret',x:cx,y:cy-58*s,r:10*s,damage:10*(1+meta.research*.12),rate:3.1,range:215*s,cd:0},
      squad:[0,1,2,3].map(function(i){var a=i*TAU/4+.78;return{source:'squad',x:cx+Math.cos(a)*76*s,y:cy+Math.sin(a)*76*s,r:7*s,damage:5*(1+meta.research*.1),range:130*s,rate:1.25,cd:i*.12};}),
      enemies:[],corpses:[],bullets:[],particles:[],damage:{commander:0,turret:0,squad:0,artillery:0},feedback:null };
  }
  function enemy(kind) {
    var a=Math.random()*TAU,s=dpr(),radius=Math.min(canvas.width,canvas.height)*.54+45*s,scale=1+(run.phase-1)*.16;
    var hp=kind==='boss'?900:kind==='armored'?82:kind==='runner'?25:40;
    run.spawned++;return{x:run.hq.x+Math.cos(a)*radius,y:run.hq.y+Math.sin(a)*radius,r:(kind==='boss'?28:kind==='armored'?15:11)*s,hp:hp*scale,maxHp:hp*scale,kind:kind,speed:(kind==='boss'?25:kind==='armored'?34:kind==='runner'?66:44)*s,damage:(kind==='boss'?28:kind==='armored'?14:8)*scale,cd:0,age:Math.random(),moving:true,hit:0,flash:0,aim:Math.atan2(run.hq.y-(run.hq.y+Math.sin(a)*radius),run.hq.x-(run.hq.x+Math.cos(a)*radius))};
  }
  function nearest(o,range){var t=null,b=range;run.enemies.forEach(function(e){var x=dist(o,e);if(x<b){b=x;t=e;}});return t;}
  function fire(o,t,damage){if(!t)return;var x=t.x-o.x,y=t.y-o.y,l=Math.hypot(x,y)||1,source=o.source||'squad',speed=source==='turret'?390:source==='commander'?650:500;o.aim=Math.atan2(y,x);o.flash=.09;run.bullets.push({x:o.x+Math.cos(o.aim)*10*dpr(),y:o.y+Math.sin(o.aim)*10*dpr(),px:o.x,py:o.y,vx:x/l*speed*dpr(),vy:y/l*speed*dpr(),damage:damage,life:.9,source:source,color:source==='commander'?'#fff07a':source==='turret'?'#ff8a2a':'#8edcff'});}
  function kill(i,e){for(var n=0;n<(e.kind==='boss'?18:7);n++)run.particles.push({x:e.x+(Math.random()-.5)*e.r,y:e.y+(Math.random()-.5)*e.r,life:.35+Math.random()*.3,max:.65,r:(2+Math.random()*5)*dpr(),color:e.kind==='boss'?'#ff6a38':'#e35238',filled:true});run.corpses.push({x:e.x,y:e.y,kind:e.kind,aim:e.aim,life:e.kind==='boss'?1.35:.75,max:e.kind==='boss'?1.35:.75});run.enemies.splice(i,1);run.kills++;if(e.kind!=='boss')run.assaultKills++;run.xp+=e.kind==='boss'?100:e.kind==='armored'?10:6;if(e.kind==='boss')run.bossDefeated=true;if(run.xp>=run.xpNext&&!run.upgradeOpen)openUpgrade();}
  var upgrades=[['Rapid Fire','+25% commander fire rate',function(){run.hero.rate*=1.25;}],['Heavy Rounds','+30% commander damage',function(){run.hero.damage*=1.3;}],['Fortify HQ','Repair 75 and add 75 maximum HP',function(){run.hq.maxHp+=75;run.hq.hp=Math.min(run.hq.maxHp,run.hq.hp+75);}],["Turret Surge","+35% turret damage",function(){run.turret.damage*=1.35;}]];
  function openUpgrade(){run.upgradeOpen=true;run.xp-=run.xpNext;run.level++;run.xpNext=Math.floor(run.xpNext*1.4);var grid=id('hq-upgrade-grid');grid.innerHTML='';upgrades.slice().sort(function(){return Math.random()-.5;}).slice(0,3).forEach(function(u){var b=document.createElement('button');b.className='hq-upgrade-choice';b.innerHTML='<b>'+u[0]+'</b><span>'+u[1]+'</span>';b.onclick=function(){u[2]();var source=u[0].indexOf('Turret')>=0?'turret':u[0].indexOf('HQ')>=0?'hq':'commander';run.feedback={text:(source==='commander'?'HOLT':source==='turret'?'MAIN TURRET':'HEADQUARTERS')+' · '+u[0].toUpperCase(),source:source,life:1.7,max:1.7};run.upgradeOpen=false;id('hq-upgrade-overlay').classList.remove('show');};grid.appendChild(b);});id('hq-upgrade-overlay').classList.add('show');}
  function useAbility(){if(!run||!run.active||run.abilityCd>0)return;run.abilityCd=18;run.enemies.forEach(function(e){var dealt=Math.min(95,e.hp);e.hp-=95;run.damage.artillery+=dealt;run.particles.push({x:e.x,y:e.y,life:.55,max:.55,r:34*dpr(),color:'#ff3c27'});});for(var i=run.enemies.length-1;i>=0;i--)if(run.enemies[i].hp<=0)kill(i,run.enemies[i]);}
  function finish(won) {
    if (!run || run.complete) return;
    run.complete = true;
    run.active = false;
    run.upgradeOpen = false;
    id('hq-upgrade-overlay').classList.remove('show');
    G.state.waveInProgress = false;
    var clearedPhase = run.phase;
    var reward = won ? 250 + run.kills * 3 : Math.floor(run.kills * 1.5);
    var parts = won ? 3 : 0;
    meta.credits += reward;
    meta.parts += parts;
    if (won) {
      meta.bestPhase = Math.max(meta.bestPhase, clearedPhase);
      if (clearedPhase >= meta.phase) meta.phase = clearedPhase + 1;
    }
    saveMeta();
    id('l137-result-kicker').textContent = won ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED';
    id('l137-result-title').textContent = won ? 'PHASE ' + clearedPhase + ' SECURED' : 'HEADQUARTERS LOST';
    id('l137-result-copy').textContent = won ? 'The Siege Breaker is destroyed. Phase ' + meta.phase + ' is ready for deployment.' : 'The combat state has been safely cleared. Upgrade at Command Base or retry immediately.';
    id('l137-result-reward').innerHTML = '<b>' + reward + ' CREDITS' + (parts ? ' · ' + parts + ' TECH PARTS' : '') + '</b><small>' + run.kills + ' ENEMIES ELIMINATED</small><small>HOLT '+Math.round(run.damage.commander)+' · TURRET '+Math.round(run.damage.turret)+' · SQUAD '+Math.round(run.damage.squad)+' · ARTILLERY '+Math.round(run.damage.artillery)+'</small>';
    id('l141-continue').textContent = won ? 'CONTINUE TO PHASE ' + meta.phase : 'RETRY PHASE ' + clearedPhase;
    id('l137-retry').textContent = 'REPLAY PHASE ' + clearedPhase;
    id('l137-retry').style.display = won ? '' : 'none';
    id('lsc137-result').classList.add('show');
  }
  function returnHome(){closePause();_gameSpeed=1;id('lsc137-result').classList.remove('show');id('lsc137-app').classList.remove('hidden');document.body.classList.remove('lsc137-mode');if(run){run.enemies=[];run.bullets=[];run.active=false;}run=null;G.state._centralHQMode=false;G.state.waveInProgress=false;renderTab('campaign');}

  function updateBattleHUD(){
    if(!run)return;
    var completed=0,total=1;for(var i=0;i<run.assaultTargets.length;i++){total+=run.assaultTargets[i];if(i<run.assault-1)completed+=run.assaultTargets[i];}completed+=run.assaultKills;if(run.bossDefeated)completed++;
    var pct=Math.min(100,Math.floor((completed/total)*100));
    var fill=id('l139-progress-fill'),label=id('l139-progress-label'),count=id('l139-progress-count');
    if(fill)fill.style.width=pct+'%';
    if(label)label.textContent=(run.bossSpawned&&!run.bossDefeated?'FINAL ASSAULT · SIEGE BREAKER':'PHASE '+run.phase+' · ASSAULT '+run.assault+'/3')+' · '+pct+'%';
    if(count)count.textContent=run.enemies.length+' THREATS ACTIVE';
  }

  function update(dt){if(!run||!run.active||run.paused||run.upgradeOpen)return;run.elapsed+=dt;run.assaultElapsed+=dt;run.spawn-=dt;run.abilityCd=Math.max(0,run.abilityCd-dt);var ab=id('lsc137-ability');if(ab){ab.disabled=run.abilityCd>0;ab.textContent=run.abilityCd>0?Math.ceil(run.abilityCd)+'s':'ARTILLERY';}var target=run.assaultTargets[run.assault-1],remaining=target-run.assaultSpawned;var interval=clamp(1.35-run.assault*.12,.7,1.3);if(run.spawn<=0&&remaining>0){var r=Math.random(),k=run.assault>1&&r<.2?'armored':r>.84?'runner':'grunt';var group=Math.min(remaining,run.assault===1?2:3);for(var g=0;g<group;g++){run.enemies.push(enemy(k));run.assaultSpawned++;}run.spawn=interval;}if(run.assault===3&&run.assaultSpawned>=target&&!run.bossSpawned){run.bossSpawned=true;run.enemies.push(enemy('boss'));}
    [run.hero,run.turret].concat(run.squad).forEach(function(a){a.cd-=dt;var t=nearest(a,a.range);if(t&&a.cd<=0){fire(a,t,a.damage);a.cd=1/a.rate;}});
    for(var i=run.enemies.length-1;i>=0;i--){var e=run.enemies[i],x=run.hq.x-e.x,y=run.hq.y-e.y,l=Math.hypot(x,y)||1;e.age+=dt;e.hit=Math.max(0,e.hit-dt);e.flash=Math.max(0,e.flash-dt);e.aim=Math.atan2(y,x);if(l>run.hq.r+e.r){e.moving=true;e.x+=x/l*e.speed*dt;e.y+=y/l*e.speed*dt;}else{e.moving=false;e.cd-=dt;if(e.cd<=0){run.hq.hp-=e.damage;e.cd=e.kind==='boss'?.75:1.2;e.flash=.18;run.lastHit=performance.now();}}}
    for(var b=run.bullets.length-1;b>=0;b--){var q=run.bullets[b];q.px=q.x;q.py=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;var hit=-1;for(var j=0;j<run.enemies.length;j++)if(dist(q,run.enemies[j])<run.enemies[j].r+4*dpr()){hit=j;break;}if(hit>=0){var target=run.enemies[hit],dealt=Math.min(q.damage,target.hp);target.hp-=q.damage;target.hit=.16;run.damage[q.source]+=dealt;run.particles.push({x:target.x,y:target.y,life:.22,max:.22,r:(q.source==='turret'?12:7)*dpr(),color:q.color});run.bullets.splice(b,1);if(target.hp<=0)kill(hit,target);}else if(q.life<=0)run.bullets.splice(b,1);}
    [run.hero,run.turret].concat(run.squad).forEach(function(a){a.flash=Math.max(0,(a.flash||0)-dt);});for(var c=run.corpses.length-1;c>=0;c--){run.corpses[c].life-=dt;if(run.corpses[c].life<=0)run.corpses.splice(c,1);}for(var p=run.particles.length-1;p>=0;p--){run.particles[p].life-=dt;if(run.particles[p].life<=0)run.particles.splice(p,1);}if(run.feedback){run.feedback.life-=dt;if(run.feedback.life<=0)run.feedback=null;}
    if(run.hq.hp<=0){finish(false);return;}var cleared=run.assaultSpawned>=target&&run.enemies.length===0&&run.bullets.length===0&&(run.assault<3||run.bossDefeated);if(cleared){run.transition+=dt;if(run.transition>=1.2){if(run.assault===3)finish(true);else{run.assault++;run.assaultElapsed=0;run.assaultSpawned=0;run.assaultKills=0;run.spawn=.6;run.transition=0;}}}else run.transition=0;
  }
  function circle(x,y,r,fill,stroke,w){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w||1;ctx.stroke();}}
  function poly(points,fill,stroke,w){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w||1;ctx.stroke();}}
  function spriteCell(index,x,y,w,h,alpha){if(!combatAtlas.complete||!combatAtlas.naturalWidth)return false;var col=index%4,row=Math.floor(index/4),sw=combatAtlas.naturalWidth/4,sh=combatAtlas.naturalHeight/2;ctx.save();ctx.globalAlpha=alpha==null?1:alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(combatAtlas,col*sw,row*sh,sw,sh,x-w/2,y-h,w,h);ctx.restore();return true;}
  function animationCell(row,frame,x,y,w,h,flip,alpha,rotation){if(!animationAtlas.complete||!animationAtlas.naturalWidth)return false;var sw=animationAtlas.naturalWidth/5,sh=animationAtlas.naturalHeight/5;ctx.save();ctx.translate(x,y);if(rotation)ctx.rotate(rotation);ctx.scale(flip?-1:1,1);ctx.globalAlpha=alpha==null?1:alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(animationAtlas,frame*sw,row*sh,sw,sh,-w/2,-h,w,h);ctx.restore();return true;}
  function animatedUnit(a,row,w,h,moving,dead){var s=dpr(),clock=(a.age==null?run.elapsed:a.age),frame=0,bob=0,rot=0;if(dead){frame=4;rot=(1-(a.life/a.max))*.12;}else if((a.hit||0)>0){frame=4;rot=Math.sin(clock*70)*.035;}else if((a.flash||0)>0){frame=3;rot=-.025;}else if(moving){frame=1+(Math.floor(clock*7)%2);bob=Math.sin(clock*14)*2.2*s;}else{bob=Math.sin(clock*3.2)*.8*s;}var aim=a.aim==null?-Math.PI/2:a.aim,flip=Math.cos(aim)<0;return animationCell(row,frame,a.x,a.y+bob,w*s,h*s,flip,dead?clamp(a.life/a.max,0,1):1,rot);}
  function drawProductionSoldier(a,hostile,heavy,commander){var s=dpr(),row=commander?0:hostile?(heavy?3:2):1;if(!animatedUnit(a,row,heavy?58:46,heavy?82:68,!!a.moving,false)){var cell=commander?0:hostile?(heavy?3:2):1;if(!spriteCell(cell,a.x,a.y+(heavy?22:17)*s,(heavy?52:43)*s,(heavy?76:65)*s))return drawSoldier(a,hostile,heavy,commander);}if(a.flash){var aim=a.aim==null?-Math.PI/2:a.aim,color=commander?'#fff07a':hostile?'#ff6a4a':'#8edcff';ctx.save();ctx.translate(a.x,a.y);ctx.rotate(aim);ctx.shadowColor=color;ctx.shadowBlur=12*s;poly([[29*s,0],[20*s,-5*s],[20*s,5*s]],color);ctx.restore();}}
  function drawProductionHQ(h){var s=dpr();if(!spriteCell(4,h.x,h.y+43*s,128*s,120*s))drawHQ(h);}
  function drawProductionTurret(t){var s=dpr(),target=nearest(t,t.range),ang=target?Math.atan2(target.y-t.y,target.x-t.x):(t.aim||0);t.aim=ang;if(!spriteCell(5,t.x,t.y+26*s,88*s,80*s))return drawTurret(t);if(t.flash){ctx.save();ctx.translate(t.x,t.y);ctx.rotate(ang);ctx.shadowColor='#ff9d35';ctx.shadowBlur=18*s;poly([[47*s,0],[35*s,-8*s],[35*s,8*s]],'#ffd166');ctx.restore();}}
  function drawProductionBoss(e){var s=dpr();if(!animatedUnit(e,4,126,116,!!e.moving,false)&&!spriteCell(7,e.x,e.y+43*s,122*s,116*s))drawBoss(e);}
  function drawProductionPerimeter(h){var s=dpr();if(!combatAtlas.complete||!combatAtlas.naturalWidth)return drawPerimeter(h);for(var q=0;q<4;q++){var a=q*Math.PI/2;for(var i=-1;i<=1;i++){var side=i*38*s,x=h.x+Math.cos(a)*104*s+Math.cos(a+Math.PI/2)*side,y=h.y+Math.sin(a)*104*s+Math.sin(a+Math.PI/2)*side;spriteCell(6,x,y+12*s,46*s,36*s);}}}
  function drawEnvironment(W,H,h){var s=dpr(),lane='#2a3128';ctx.fillStyle='#111710';ctx.fillRect(0,0,W,H);var glow=ctx.createRadialGradient(h.x,h.y,30*s,h.x,h.y,Math.max(W,H)*.7);glow.addColorStop(0,'rgba(73,91,53,.78)');glow.addColorStop(.55,'rgba(37,48,31,.55)');glow.addColorStop(1,'rgba(7,10,8,.92)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(h.x,h.y);ctx.strokeStyle=lane;ctx.lineWidth=28*s;ctx.setLineDash([12*s,8*s]);for(var a=0;a<TAU;a+=Math.PI/2){ctx.beginPath();ctx.moveTo(Math.cos(a)*112*s,Math.sin(a)*112*s);ctx.lineTo(Math.cos(a)*Math.max(W,H),Math.sin(a)*Math.max(W,H));ctx.stroke();}ctx.setLineDash([]);ctx.strokeStyle='rgba(188,206,145,.14)';ctx.lineWidth=s;for(var r=126;r<250;r+=42){ctx.beginPath();ctx.arc(0,0,r*s,0,TAU);ctx.stroke();}ctx.restore();for(var i=0;i<34;i++){var px=(i*83%Math.max(1,W-20*s))+10*s,py=(i*137%Math.max(1,H-80*s))+46*s;ctx.fillStyle=i%3?'rgba(124,137,95,.14)':'rgba(73,83,62,.22)';ctx.fillRect(px,py,(i%4+2)*s,(i%3+1)*s);}drawProductionPerimeter(h);}
  function drawPerimeter(h){var s=dpr();ctx.save();ctx.translate(h.x,h.y);for(var q=0;q<4;q++){ctx.save();ctx.rotate(q*Math.PI/2);for(var i=-2;i<=2;i++){var x=i*22*s,y=-105*s;ctx.fillStyle='#5d5138';ctx.fillRect(x-9*s,y-5*s,18*s,10*s);ctx.fillStyle='#887450';ctx.fillRect(x-8*s,y-5*s,16*s,3*s);ctx.strokeStyle='rgba(255,216,139,.25)';ctx.strokeRect(x-9*s,y-5*s,18*s,10*s);}ctx.fillStyle='#343b2f';ctx.fillRect(-47*s,-115*s,10*s,20*s);ctx.fillRect(37*s,-115*s,10*s,20*s);ctx.restore();}ctx.restore();}
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

  installStyles(); installUI(); renderTab('campaign');
  var home=id('homeScreen'),start=id('startOverlay');if(home){home.style.display='none';home.classList.remove('hs-visible');}if(start)start.classList.add('hidden');document.body.classList.remove('lsc-home-mode');
  _patchedUpdate=function(dt,c,onEnd,onGameOver,onWarn){if(run&&G.state&&G.state._centralHQMode){if(!run.paused)update(dt);updateBattleHUD();return;}return oldUpdate&&oldUpdate(dt,c,onEnd,onGameOver,onWarn);};
  drawVertical=function(state){if(run&&state&&state._centralHQMode)return draw();return oldDraw&&oldDraw(state);};
})();
