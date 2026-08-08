// Build 140 — true pause, test speed controls, and threat-driven assaults.
(function () {
  'use strict';
  if (window.__LSC_COMMAND_BASE_140__) return;
  window.__LSC_COMMAND_BASE_140__ = true;

  var oldUpdate = _patchedUpdate;
  var oldDraw = drawVertical;
  var canvas = document.getElementById('battlefield');
  var ctx = canvas && canvas.getContext('2d');
  var run = null;
  var TAU = Math.PI * 2;
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
      'body.lsc137-mode #hud,body.lsc137-mode #controls,body.lsc137-mode #world-progress-bar,body.lsc137-mode #autowav-strip,body.lsc137-mode #lsc-command-actions,body.lsc137-mode #lsc-front-status,body.lsc137-mode #lsc-front-pill,body.lsc137-mode #lsc-front-canvas,body.lsc137-mode #lsc-world-chip,body.lsc137-mode #lsc-daily-btn,body.lsc137-mode #lsc-staff-btn,body.lsc137-mode #lsc-hud-actions-dock,body.lsc137-mode #quest-hud,body.lsc137-mode #orbitalBtn,body.lsc137-mode #storeBtn{display:none!important}' +
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
    result.innerHTML = '<div class="l137-result-card"><div class="l137-kicker" id="l137-result-kicker"></div><h2 id="l137-result-title"></h2><p class="l137-copy" id="l137-result-copy"></p><div class="l137-card" id="l137-result-reward"></div><div class="l137-actions"><button class="l137-btn good" id="l137-retry">RETRY PHASE</button><button class="l137-btn" id="l137-return">RETURN TO COMMAND BASE</button></div></div>';
    document.body.appendChild(result);
    id('l137-retry').onclick = function () { id('lsc137-result').classList.remove('show'); launchPhase(); };
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

  function launchPhase() {
    var home = id('homeScreen'); if (home) { home.style.display = 'none'; home.classList.remove('hs-visible'); }
    var start = id('startOverlay');
    if (G && G.state && !G.state.started) { if (!G.state.selectedDoctrine) G.state.selectedDoctrine = 'fortress'; var begin = id('beginBtn'); if (begin) begin.click(); }
    if (start) start.classList.add('hidden');
    id('lsc137-app').classList.add('hidden');
    document.body.classList.add('lsc137-mode');
    run = createRun();setSpeed(1);
    G.state._centralHQMode = true; G.state.waveInProgress = true; G.state.gameOver = false; G.state.paused = false;
    id('lsc137-ability').disabled = false; id('lsc137-ability').textContent = 'ARTILLERY';
  }
  function createRun() {
    var W = canvas.width || 390, H = canvas.height || 600, s = dpr(), cx = W / 2, cy = H * .56;
    var targets=[8+meta.phase*2,12+meta.phase*2,16+meta.phase*2];
    return { active:true, paused:false, complete:false, elapsed:0, speed:1, assault:1, assaultElapsed:0, assaultSpawned:0, assaultKills:0, assaultTargets:targets, transition:0, spawn:0, spawned:0, kills:0, xp:0, xpNext:30, level:1, bossSpawned:false, bossDefeated:false, upgradeOpen:false, abilityCd:0, lastHit:0,
      hq:{x:cx,y:cy,r:37*s,hp:300+(meta.hq-1)*75,maxHp:300+(meta.hq-1)*75},
      hero:{x:cx,y:cy+70*s,r:13*s,damage:16*(1+(meta.commander-1)*.15),rate:2.7*(1+(meta.commander-1)*.06),range:150*s,cd:0},
      turret:{x:cx,y:cy-58*s,r:10*s,damage:10*(1+meta.research*.12),rate:3.1,range:215*s,cd:0},
      squad:[0,1,2,3].map(function(i){var a=i*TAU/4+.78;return{x:cx+Math.cos(a)*76*s,y:cy+Math.sin(a)*76*s,r:7*s,damage:5*(1+meta.research*.1),range:130*s,rate:1.25,cd:i*.12};}),
      enemies:[],bullets:[],particles:[] };
  }
  function enemy(kind) {
    var a=Math.random()*TAU,s=dpr(),radius=Math.min(canvas.width,canvas.height)*.54+45*s,scale=1+(meta.phase-1)*.16;
    var hp=kind==='boss'?900:kind==='armored'?82:kind==='runner'?25:40;
    run.spawned++;return{x:run.hq.x+Math.cos(a)*radius,y:run.hq.y+Math.sin(a)*radius,r:(kind==='boss'?28:kind==='armored'?15:11)*s,hp:hp*scale,maxHp:hp*scale,kind:kind,speed:(kind==='boss'?25:kind==='armored'?34:kind==='runner'?66:44)*s,damage:(kind==='boss'?28:kind==='armored'?14:8)*scale,cd:0};
  }
  function nearest(o,range){var t=null,b=range;run.enemies.forEach(function(e){var x=dist(o,e);if(x<b){b=x;t=e;}});return t;}
  function fire(o,t,damage,color){if(!t)return;var x=t.x-o.x,y=t.y-o.y,l=Math.hypot(x,y)||1;run.bullets.push({x:o.x,y:o.y,vx:x/l*520*dpr(),vy:y/l*520*dpr(),damage:damage,life:.8,color:color});}
  function kill(i,e){run.enemies.splice(i,1);run.kills++;if(e.kind!=='boss')run.assaultKills++;run.xp+=e.kind==='boss'?100:e.kind==='armored'?10:6;if(e.kind==='boss')run.bossDefeated=true;if(run.xp>=run.xpNext&&!run.upgradeOpen)openUpgrade();}
  var upgrades=[['Rapid Fire','+25% commander fire rate',function(){run.hero.rate*=1.25;}],['Heavy Rounds','+30% commander damage',function(){run.hero.damage*=1.3;}],['Fortify HQ','Repair 75 and add 75 maximum HP',function(){run.hq.maxHp+=75;run.hq.hp=Math.min(run.hq.maxHp,run.hq.hp+75);}],["Turret Surge","+35% turret damage",function(){run.turret.damage*=1.35;}]];
  function openUpgrade(){run.upgradeOpen=true;run.xp-=run.xpNext;run.level++;run.xpNext=Math.floor(run.xpNext*1.4);var grid=id('hq-upgrade-grid');grid.innerHTML='';upgrades.slice().sort(function(){return Math.random()-.5;}).slice(0,3).forEach(function(u){var b=document.createElement('button');b.className='hq-upgrade-choice';b.innerHTML='<b>'+u[0]+'</b><span>'+u[1]+'</span>';b.onclick=function(){u[2]();run.upgradeOpen=false;id('hq-upgrade-overlay').classList.remove('show');};grid.appendChild(b);});id('hq-upgrade-overlay').classList.add('show');}
  function useAbility(){if(!run||!run.active||run.abilityCd>0)return;run.abilityCd=18;run.enemies.forEach(function(e){e.hp-=95;});for(var i=run.enemies.length-1;i>=0;i--)if(run.enemies[i].hp<=0)kill(i,run.enemies[i]);}
  function finish(won){if(!run||run.complete)return;run.complete=true;run.active=false;run.upgradeOpen=false;id('hq-upgrade-overlay').classList.remove('show');G.state.waveInProgress=false;var reward=won?250+run.kills*3:Math.floor(run.kills*1.5);var parts=won?3:0;meta.credits+=reward;meta.parts+=parts;if(won){meta.bestPhase=Math.max(meta.bestPhase,meta.phase);meta.phase++;}saveMeta();id('l137-result-kicker').textContent=won?'MISSION ACCOMPLISHED':'MISSION FAILED';id('l137-result-title').textContent=won?'PHASE SECURED':'HEADQUARTERS LOST';id('l137-result-copy').textContent=won?'The Siege Breaker is destroyed. The next defensive phase is now available.':'The combat state has been safely cleared. Upgrade at Command Base or retry immediately.';id('l137-result-reward').innerHTML='<b>'+reward+' CREDITS' +(parts?' · '+parts+' TECH PARTS':'')+'</b><small>'+run.kills+' ENEMIES ELIMINATED</small>';id('lsc137-result').classList.add('show');}
  function returnHome(){closePause();_gameSpeed=1;id('lsc137-result').classList.remove('show');id('lsc137-app').classList.remove('hidden');document.body.classList.remove('lsc137-mode');if(run){run.enemies=[];run.bullets=[];run.active=false;}run=null;G.state._centralHQMode=false;G.state.waveInProgress=false;renderTab('campaign');}

  function updateBattleHUD(){
    if(!run)return;
    var completed=0,total=1;for(var i=0;i<run.assaultTargets.length;i++){total+=run.assaultTargets[i];if(i<run.assault-1)completed+=run.assaultTargets[i];}completed+=run.assaultKills;if(run.bossDefeated)completed++;
    var pct=Math.min(100,Math.floor((completed/total)*100));
    var fill=id('l139-progress-fill'),label=id('l139-progress-label'),count=id('l139-progress-count');
    if(fill)fill.style.width=pct+'%';
    if(label)label.textContent=(run.bossSpawned&&!run.bossDefeated?'FINAL ASSAULT · SIEGE BREAKER':'PHASE '+meta.phase+' · ASSAULT '+run.assault+'/3')+' · '+pct+'%';
    if(count)count.textContent=run.enemies.length+' THREATS ACTIVE';
  }

  function update(dt){if(!run||!run.active||run.paused||run.upgradeOpen)return;run.elapsed+=dt;run.assaultElapsed+=dt;run.spawn-=dt;run.abilityCd=Math.max(0,run.abilityCd-dt);var ab=id('lsc137-ability');if(ab){ab.disabled=run.abilityCd>0;ab.textContent=run.abilityCd>0?Math.ceil(run.abilityCd)+'s':'ARTILLERY';}var target=run.assaultTargets[run.assault-1],remaining=target-run.assaultSpawned;var interval=clamp(1.35-run.assault*.12,.7,1.3);if(run.spawn<=0&&remaining>0){var r=Math.random(),k=run.assault>1&&r<.2?'armored':r>.84?'runner':'grunt';var group=Math.min(remaining,run.assault===1?2:3);for(var g=0;g<group;g++){run.enemies.push(enemy(k));run.assaultSpawned++;}run.spawn=interval;}if(run.assault===3&&run.assaultSpawned>=target&&!run.bossSpawned){run.bossSpawned=true;run.enemies.push(enemy('boss'));}
    [run.hero,run.turret].concat(run.squad).forEach(function(a,n){a.cd-=dt;var t=nearest(a,a.range);if(t&&a.cd<=0){fire(a,t,a.damage,n===0?'#9cecff':n===1?'#ffd166':'#8cff9c');a.cd=1/a.rate;}});
    for(var i=run.enemies.length-1;i>=0;i--){var e=run.enemies[i],x=run.hq.x-e.x,y=run.hq.y-e.y,l=Math.hypot(x,y)||1;if(l>run.hq.r+e.r){e.x+=x/l*e.speed*dt;e.y+=y/l*e.speed*dt;}else{e.cd-=dt;if(e.cd<=0){run.hq.hp-=e.damage;e.cd=e.kind==='boss'?.75:1.2;run.lastHit=performance.now();}}}
    for(var b=run.bullets.length-1;b>=0;b--){var q=run.bullets[b];q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;var hit=-1;for(var j=0;j<run.enemies.length;j++)if(dist(q,run.enemies[j])<run.enemies[j].r+4*dpr()){hit=j;break;}if(hit>=0){var target=run.enemies[hit];target.hp-=q.damage;run.bullets.splice(b,1);if(target.hp<=0)kill(hit,target);}else if(q.life<=0)run.bullets.splice(b,1);}
    if(run.hq.hp<=0){finish(false);return;}var cleared=run.assaultSpawned>=target&&run.enemies.length===0&&run.bullets.length===0&&(run.assault<3||run.bossDefeated);if(cleared){run.transition+=dt;if(run.transition>=1.2){if(run.assault===3)finish(true);else{run.assault++;run.assaultElapsed=0;run.assaultSpawned=0;run.assaultKills=0;run.spawn=.6;run.transition=0;}}}else run.transition=0;
  }
  function circle(x,y,r,fill,stroke,w){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w||1;ctx.stroke();}}
  function drawSoldier(a, hostile, heavy) {
    var s=dpr(), body=hostile?(heavy?'#713a24':'#572821'):'#204d39', edge=hostile?'#ff7958':'#8cffb0';
    ctx.save();ctx.translate(a.x,a.y);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,10*s,11*s,4*s,0,0,TAU);ctx.fill();
    ctx.fillStyle=body;ctx.strokeStyle=edge;ctx.lineWidth=1.5*s;ctx.fillRect(-7*s,-2*s,14*s,15*s);ctx.strokeRect(-7*s,-2*s,14*s,15*s);
    circle(0,-7*s,(heavy?7:6)*s,body,edge,1.5*s);ctx.fillStyle='#172126';ctx.fillRect(-7*s,-10*s,14*s,4*s);
    ctx.strokeStyle=edge;ctx.lineWidth=3*s;ctx.beginPath();ctx.moveTo(5*s,1*s);ctx.lineTo(15*s,-3*s);ctx.stroke();ctx.restore();
  }
  function drawHQ(h) {
    var s=dpr();ctx.save();ctx.translate(h.x,h.y);ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(0,30*s,48*s,13*s,0,0,TAU);ctx.fill();
    ctx.fillStyle='#18323d';ctx.strokeStyle='#67e2ff';ctx.lineWidth=2*s;ctx.fillRect(-34*s,-24*s,68*s,52*s);ctx.strokeRect(-34*s,-24*s,68*s,52*s);
    ctx.fillStyle='#294a55';ctx.fillRect(-25*s,-36*s,50*s,15*s);ctx.strokeRect(-25*s,-36*s,50*s,15*s);ctx.fillStyle='#ffd166';ctx.fillRect(-5*s,-48*s,10*s,13*s);
    ctx.strokeStyle='#ffd166';ctx.beginPath();ctx.moveTo(0,-48*s);ctx.lineTo(0,-61*s);ctx.stroke();circle(0,-64*s,3*s,'#ffd166');
    ctx.fillStyle='#07151b';ctx.fillRect(-11*s,3*s,22*s,25*s);ctx.fillStyle='#9cecff';ctx.font='bold '+9*s+'px Rajdhani';ctx.textAlign='center';ctx.fillText('HQ',0,-5*s);ctx.restore();
  }
  function drawTurret(t){var s=dpr();ctx.save();ctx.translate(t.x,t.y);ctx.fillStyle='#55451d';ctx.strokeStyle='#ffd166';ctx.lineWidth=2*s;ctx.fillRect(-9*s,-7*s,18*s,15*s);ctx.strokeRect(-9*s,-7*s,18*s,15*s);circle(0,-7*s,7*s,'#776126','#ffd166',2*s);ctx.fillStyle='#ffd166';ctx.fillRect(4*s,-9*s,16*s,4*s);ctx.restore();}
  function draw(){if(!run||!ctx)return oldDraw&&oldDraw(G.state);var W=canvas.width,H=canvas.height,s=dpr(),h=run.hq;var bg=ctx.createRadialGradient(h.x,h.y,20,h.x,h.y,Math.max(W,H)*.7);bg.addColorStop(0,'#26301f');bg.addColorStop(1,'#080b09');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(120,145,100,.11)';for(var x=0;x<W;x+=34*s){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(var y=0;y<H;y+=34*s){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    circle(h.x,h.y,105*s,'rgba(34,212,255,.025)','rgba(34,212,255,.16)',s);drawHQ(h);drawTurret(run.turret);run.squad.forEach(function(a){drawSoldier(a,false,false);});circle(run.hero.x,run.hero.y,run.hero.range,null,'rgba(156,236,255,.06)',s);drawSoldier(run.hero,false,true);
    run.enemies.forEach(function(e){if(e.kind==='boss'){circle(e.x,e.y,e.r,'#751719','#ff3c3c',3*s);ctx.fillStyle='#ffb14a';ctx.fillRect(e.x-15*s,e.y-5*s,30*s,10*s);ctx.fillStyle='#fff';ctx.font='bold '+7*s+'px Rajdhani';ctx.textAlign='center';ctx.fillText('SIEGE',e.x,e.y+3*s);}else drawSoldier(e,true,e.kind==='armored');if(e.hp<e.maxHp||e.kind==='boss'){ctx.fillStyle='#220707';ctx.fillRect(e.x-e.r,e.y-e.r-12*s,e.r*2,3*s);ctx.fillStyle='#ff694d';ctx.fillRect(e.x-e.r,e.y-e.r-12*s,e.r*2*(e.hp/e.maxHp),3*s);}});run.bullets.forEach(function(b){circle(b.x,b.y,3*s,b.color);});
    var hp=clamp(h.hp/h.maxHp,0,1),xp=clamp(run.xp/run.xpNext,0,1);ctx.fillStyle='rgba(3,10,15,.9)';ctx.fillRect(0,0,W,42*s);ctx.strokeStyle='rgba(34,212,255,.35)';ctx.beginPath();ctx.moveTo(0,42*s);ctx.lineTo(W,42*s);ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold '+9*s+'px "Share Tech Mono"';ctx.textAlign='left';ctx.fillText('PHASE '+meta.phase+' · ASSAULT '+run.assault+'/3',12*s,16*s);ctx.fillStyle='#9cecff';ctx.fillText('FIELD RANK '+run.level,12*s,31*s);ctx.textAlign='right';ctx.fillStyle='#ffd166';ctx.fillText(run.speed+'×',W-12*s,16*s);ctx.fillStyle='rgba(0,0,0,.76)';ctx.fillRect(12*s,H-39*s,W-24*s,27*s);ctx.fillStyle=hp>.35?'#18f06a':'#ff3c3c';ctx.fillRect(14*s,H-35*s,(W-28*s)*hp,8*s);ctx.fillStyle='#22d4ff';ctx.fillRect(14*s,H-21*s,(W-28*s)*xp,5*s);ctx.fillStyle='#fff';ctx.font=7*s+'px "Share Tech Mono"';ctx.textAlign='left';ctx.fillText('HQ '+Math.ceil(h.hp)+' / '+h.maxHp,15*s,H-28*s);if(performance.now()-run.lastHit<180){ctx.fillStyle='rgba(255,0,0,.1)';ctx.fillRect(0,0,W,H);}}

  installStyles(); installUI(); renderTab('campaign');
  var home=id('homeScreen'),start=id('startOverlay');if(home){home.style.display='none';home.classList.remove('hs-visible');}if(start)start.classList.add('hidden');document.body.classList.remove('lsc-home-mode');
  _patchedUpdate=function(dt,c,onEnd,onGameOver,onWarn){if(run&&G.state&&G.state._centralHQMode){if(!run.paused)update(dt);updateBattleHUD();return;}return oldUpdate&&oldUpdate(dt,c,onEnd,onGameOver,onWarn);};
  drawVertical=function(state){if(run&&state&&state._centralHQMode)return draw();return oldDraw&&oldDraw(state);};
})();
