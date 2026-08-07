// ══════════════════════════════════════════════════════════════
// Build 136 — Central HQ Combat Prototype
// Owns the active stage-selection and combat flow. Legacy lane deployment,
// commander selection and war-room setup are intentionally bypassed.
// ══════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (window.__LSC_CENTRAL_HQ_136__) return;
  window.__LSC_CENTRAL_HQ_136__ = true;

  var oldUpdate = _patchedUpdate;
  var oldDraw = drawVertical;
  var canvas = document.getElementById('battlefield');
  var context = canvas && canvas.getContext('2d');
  var run = null;
  var pointer = { active: false, id: null, sx: 0, sy: 0, x: 0, y: 0 };
  var TAU = Math.PI * 2;

  function el(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function nowSeconds() { return performance.now() / 1000; }

  function installStyles() {
    if (el('central-hq-136-style')) return;
    var style = document.createElement('style');
    style.id = 'central-hq-136-style';
    style.textContent =
      '#pressure-overlay,#quest-board,#tutorialHint,.lsc-front-pill,.lsc-hero-ability,#onboarding-overlay,#autowav-strip,#waveSky,#weatherCanvas,#damage-vignette{display:none!important}' +
      'body.lsc-central-combat #hud,body.lsc-central-combat #controls{display:none!important}' +
      '#lsc-stage-screen{position:fixed;z-index:20000;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:calc(env(safe-area-inset-top,0px) + 24px) 20px calc(env(safe-area-inset-bottom,0px) + 24px);background:radial-gradient(circle at 50% 38%,rgba(34,212,255,.13),transparent 31%),linear-gradient(180deg,#08121a,#030608 72%);font-family:Rajdhani,sans-serif;color:#fff}' +
      '#lsc-stage-screen.hidden{display:none!important}.lsc136-brand{font:9px "Share Tech Mono",monospace;letter-spacing:3px;color:#75e8ff}.lsc136-title{margin-top:8px;font-size:34px;line-height:.95;font-weight:900;letter-spacing:1px}.lsc136-copy{margin-top:10px;max-width:330px;font:10px/1.55 "Share Tech Mono",monospace;color:rgba(225,238,244,.68)}' +
      '.lsc136-card{position:relative;padding:18px;border:1px solid rgba(34,212,255,.38);border-radius:22px;background:linear-gradient(155deg,rgba(13,35,48,.96),rgba(5,11,16,.97));box-shadow:0 22px 70px rgba(0,0,0,.55),inset 0 0 32px rgba(34,212,255,.06);overflow:hidden}.lsc136-kicker{font:8px "Share Tech Mono",monospace;letter-spacing:2.4px;color:#ffd166}.lsc136-stage{font-size:25px;font-weight:900;margin:5px 0 2px}.lsc136-sector{font:9px "Share Tech Mono",monospace;color:#8eeeff}.lsc136-objective{margin:16px 0;padding:11px;border-left:2px solid #22d4ff;background:rgba(34,212,255,.06);font:10px/1.5 "Share Tech Mono",monospace;color:rgba(235,245,248,.82)}' +
      '.lsc136-loadout{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}.lsc136-loadout div{padding:9px;border:1px solid rgba(255,255,255,.09);border-radius:11px;background:rgba(0,0,0,.2)}.lsc136-loadout b{display:block;font-size:12px;color:#fff}.lsc136-loadout span{font:8px "Share Tech Mono",monospace;color:rgba(220,235,240,.58)}' +
      '#lsc136-deploy{width:100%;padding:15px;border:1px solid rgba(24,240,106,.55);border-radius:14px;background:linear-gradient(180deg,#168e48,#0a5c30);box-shadow:0 0 28px rgba(24,240,106,.16);font:900 17px Rajdhani,sans-serif;letter-spacing:1.4px;color:#fff}.lsc136-note{text-align:center;margin-top:10px;font:8px "Share Tech Mono",monospace;color:rgba(220,235,240,.48)}' +
      '#wave-chip{border-color:rgba(255,209,102,.6)!important;color:#ffd166!important}' +
      '#hq-prototype-banner{position:absolute;z-index:30;top:10px;left:50%;transform:translateX(-50%);padding:6px 11px;border:1px solid rgba(255,209,102,.4);border-radius:999px;background:rgba(3,8,12,.8);font:9px "Share Tech Mono",monospace;letter-spacing:1.4px;color:#ffd166;white-space:nowrap;pointer-events:none}' +
      '#hq-upgrade-overlay{position:fixed;z-index:10020;inset:0;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,4,8,.86);backdrop-filter:blur(8px)}' +
      '#hq-upgrade-overlay.show{display:flex}' +
      '.hq-upgrade-modal{width:min(440px,100%);padding:20px;border:1px solid rgba(255,209,102,.42);border-radius:20px;background:linear-gradient(180deg,#101923,#070b10);box-shadow:0 25px 80px #000}' +
      '.hq-upgrade-title{font:900 24px Rajdhani,sans-serif;color:#fff;text-align:center}.hq-upgrade-sub{font:9px "Share Tech Mono",monospace;letter-spacing:2px;color:#ffd166;text-align:center;margin:2px 0 15px}' +
      '.hq-upgrade-grid{display:grid;gap:9px}.hq-upgrade-choice{padding:13px;border:1px solid rgba(34,212,255,.25);border-radius:13px;background:rgba(34,212,255,.05);color:#fff;text-align:left}' +
      '.hq-upgrade-choice b{display:block;font:800 15px Rajdhani,sans-serif;color:#9cecff}.hq-upgrade-choice span{display:block;margin-top:3px;font:9px "Share Tech Mono",monospace;color:rgba(230,240,245,.68);line-height:1.4}' +
      '#hq-joystick{position:absolute;z-index:25;display:none;width:78px;height:78px;margin:-39px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.3);pointer-events:none}' +
      '#hq-joystick:after{content:"";position:absolute;width:30px;height:30px;left:24px;top:24px;border-radius:50%;background:rgba(156,236,255,.7);box-shadow:0 0 18px rgba(34,212,255,.6);transform:translate(var(--jx,0px),var(--jy,0px))}';
    document.head.appendChild(style);
    var wrap = el('battlefield-wrap');
    if (wrap) {
      var banner = document.createElement('div');
      banner.id = 'hq-prototype-banner';
      banner.textContent = 'CENTRAL HQ PROTOTYPE · DRAG TO MOVE';
      wrap.appendChild(banner);
      var joy = document.createElement('div');
      joy.id = 'hq-joystick';
      wrap.appendChild(joy);
    }
    var overlay = document.createElement('div');
    overlay.id = 'hq-upgrade-overlay';
    overlay.innerHTML = '<div class="hq-upgrade-modal"><div class="hq-upgrade-title">FIELD PROMOTION</div><div class="hq-upgrade-sub">SELECT ONE COMBAT UPGRADE</div><div class="hq-upgrade-grid" id="hq-upgrade-grid"></div></div>';
    document.body.appendChild(overlay);
  }

  function installStageScreen() {
    if (el('lsc-stage-screen')) return;
    var screen = document.createElement('div');
    screen.id = 'lsc-stage-screen';
    screen.innerHTML = '<div><div class="lsc136-brand">LAST STAND COMMAND</div><div class="lsc136-title">DEFEND THE<br>CENTRAL HQ</div><div class="lsc136-copy">Choose the stage and deploy. Commander Holt, the defense squad, and the north turret deploy automatically.</div></div>' +
      '<div class="lsc136-card"><div class="lsc136-kicker">AVAILABLE OPERATION</div><div class="lsc136-stage">STAGE 1 · OUTER PERIMETER</div><div class="lsc136-sector">CENTRAL COMMAND SECTOR · STANDARD RISK</div><div class="lsc136-objective">Hold the headquarters against a three-minute radial assault. Eliminate the Siege Breaker to secure the sector.</div><div class="lsc136-loadout"><div><b>Commander Holt</b><span>AUTO-ASSIGNED · ASSAULT</span></div><div><b>Defense Squad ×4</b><span>AUTO-DEPLOY · NO REFILLING</span></div><div><b>North Turret</b><span>AUTOMATIC FIRE</span></div><div><b>HQ Core</b><span>300 STRUCTURAL HP</span></div></div><button id="lsc136-deploy">DEPLOY TO STAGE</button><div class="lsc136-note">DRAG TO MOVE · WEAPONS FIRE AUTOMATICALLY</div></div>';
    document.body.appendChild(screen);
    el('lsc136-deploy').addEventListener('click', launchStage);
  }

  function launchStage() {
    var home = el('homeScreen'); if (home) { home.style.display = 'none'; home.classList.remove('hs-visible'); }
    var start = el('startOverlay');
    if (G && G.state && !G.state.started) {
      if (!G.state.selectedDoctrine) G.state.selectedDoctrine = 'fortress';
      var begin = el('beginBtn'); if (begin) begin.click();
    }
    if (start) start.classList.add('hidden');
    el('lsc-stage-screen').classList.add('hidden');
    document.body.classList.remove('lsc-home-mode');
    document.body.classList.add('lsc-central-combat');
    beginPrototype();
  }

  function createRun() {
    var W = canvas.width || 390;
    var H = canvas.height || 600;
    var dpr = window.devicePixelRatio || 1;
    var cx = W / 2, cy = H * 0.52;
    return {
      active: true, complete: false, elapsed: 0, duration: 180, spawnClock: 0,
      hero: { x: cx, y: cy + 105*dpr, r: 13*dpr, speed: 155*dpr, hp: 100, maxHp: 100, damage: 15, fireRate: 2.8, range: 150*dpr, cooldown: 0 },
      hq: { x: cx, y: cy, r: 36*dpr, hp: 300, maxHp: 300 },
      turret: { angle: -Math.PI/2, range: 210*dpr, damage: 9, fireRate: 3.2, cooldown: 0 },
      squad: [0,1,2,3].map(function(i){var a=-Math.PI/2+i*TAU/4;return{x:cx+Math.cos(a)*70*dpr,y:cy+Math.sin(a)*70*dpr,r:8*dpr,range:125*dpr,damage:5,fireRate:1.25,cooldown:i*.12};}),
      enemies: [], bullets: [], particles: [], xp: 0, xpNext: 28, level: 1, kills: 0,
      bossSpawned: false, bossDefeated: false, upgradeOpen: false, lastHit: 0
    };
  }

  function beginPrototype() {
    if (!canvas || !G || !G.state) return;
    run = createRun();
    G.state._centralHQMode = true;
    G.state.waveInProgress = true;
    G.state.enemies = [];
    G.state.troops = [];
    G.state.gameOver = false;
    G.state.paused = false;
    var chip = el('wave-chip');
    if (chip) chip.textContent = 'STAGE 1 · OUTER PERIMETER';
    var buttonText = el('waveBtnSub');
    if (buttonText) buttonText.textContent = 'STAGE ACTIVE';
  }

  function enemyAtEdge(kind) {
    var angle = Math.random() * TAU;
    var margin = 34 * (window.devicePixelRatio || 1);
    var radius = Math.hypot(canvas.width, canvas.height) * 0.58 + margin;
    var hp = kind === 'boss' ? 1200 : kind === 'armored' ? 85 : kind === 'runner' ? 26 : 42;
    var scale = 1 + run.elapsed / 210;
    return {
      x: run.hq.x + Math.cos(angle) * radius, y: run.hq.y + Math.sin(angle) * radius,
      r: (kind === 'boss' ? 28 : kind === 'armored' ? 15 : 11) * (window.devicePixelRatio || 1),
      hp: hp * scale, maxHp: hp * scale, kind: kind,
      speed: (kind === 'boss' ? 25 : kind === 'armored' ? 35 : kind === 'runner' ? 68 : 46) * (window.devicePixelRatio || 1),
      damage: kind === 'boss' ? 34 : kind === 'armored' ? 15 : 9, attackCd: 0
    };
  }

  function spawnEnemy() {
    var roll = Math.random();
    var kind = run.elapsed > 55 && roll < .18 ? 'armored' : run.elapsed > 25 && roll > .83 ? 'runner' : 'grunt';
    run.enemies.push(enemyAtEdge(kind));
  }

  function nearest(origin, range) {
    var target = null, best = range;
    run.enemies.forEach(function (e) { var d = distance(origin, e); if (d < best) { best = d; target = e; } });
    return target;
  }

  function fire(origin, target, damage, color) {
    if (!target) return;
    var dx = target.x - origin.x, dy = target.y - origin.y, len = Math.hypot(dx, dy) || 1;
    run.bullets.push({ x: origin.x, y: origin.y, vx: dx/len*520*(window.devicePixelRatio||1), vy: dy/len*520*(window.devicePixelRatio||1), damage: damage, life: .7, color: color });
  }

  function killEnemy(index, enemy) {
    run.enemies.splice(index, 1);
    run.kills++;
    run.xp += enemy.kind === 'boss' ? 100 : enemy.kind === 'armored' ? 10 : 6;
    if (enemy.kind === 'boss') run.bossDefeated = true;
    for (var p=0; p<8; p++) run.particles.push({ x:enemy.x,y:enemy.y,vx:(Math.random()-.5)*90,vy:(Math.random()-.5)*90,life:.5,color:enemy.kind==='boss'?'#ff3c3c':'#ff9f43' });
    if (run.xp >= run.xpNext && !run.upgradeOpen) openUpgrade();
  }

  var UPGRADES = [
    { name:'Overclocked Rifle', desc:'+25% hero fire rate', apply:function(){run.hero.fireRate*=1.25;} },
    { name:'Armor-Piercing Rounds', desc:'+30% hero damage', apply:function(){run.hero.damage*=1.3;} },
    { name:'Combat Conditioning', desc:'+12% movement speed and restore 25 HP', apply:function(){run.hero.speed*=1.12;run.hero.hp=Math.min(run.hero.maxHp,run.hero.hp+25);} },
    { name:'Engineering Surge', desc:'+35% turret damage', apply:function(){run.turret.damage*=1.35;} },
    { name:'Fortify Headquarters', desc:'+75 maximum HQ health and repair 75', apply:function(){run.hq.maxHp+=75;run.hq.hp=Math.min(run.hq.maxHp,run.hq.hp+75);} },
    { name:'Extended Magazine', desc:'+22% attack range', apply:function(){run.hero.range*=1.22;} }
  ];

  function openUpgrade() {
    run.upgradeOpen = true;
    run.xp -= run.xpNext;
    run.level++;
    run.xpNext = Math.floor(run.xpNext * 1.35);
    var choices = UPGRADES.slice().sort(function(){return Math.random()-.5;}).slice(0,3);
    var grid = el('hq-upgrade-grid');
    grid.innerHTML = '';
    choices.forEach(function(u){
      var btn=document.createElement('button'); btn.className='hq-upgrade-choice';
      btn.innerHTML='<b>'+u.name+'</b><span>'+u.desc+'</span>';
      btn.addEventListener('click',function(){u.apply();run.upgradeOpen=false;el('hq-upgrade-overlay').classList.remove('show');});
      grid.appendChild(btn);
    });
    el('hq-upgrade-overlay').classList.add('show');
  }

  function finishRun(won) {
    if (!run || run.complete) return;
    run.complete = true; run.active = false;
    G.state.waveInProgress = false;
    G.state.baseHp = Math.max(0, Math.round(run.hq.hp / run.hq.maxHp * G.state.maxBaseHp));
    G.state.credits += won ? 250 + run.kills * 3 : Math.floor(run.kills * 1.5);
    var chip=el('wave-chip'); if(chip) chip.textContent=won?'STAGE CLEARED':'HQ OVERRUN';
    var buttonText=el('waveBtnSub'); if(buttonText) buttonText.textContent='RESTART STAGE';
    if (typeof showToast === 'function') showToast(won ? 'Outer Perimeter secured. Prototype stage complete.' : 'HQ lost. Reconfigure and redeploy.');
  }

  function updatePrototype(dt) {
    if (!run || !run.active || run.upgradeOpen) return;
    run.elapsed += dt;
    var hero=run.hero, hq=run.hq;
    if(pointer.active){
      var dx=pointer.x-pointer.sx,dy=pointer.y-pointer.sy,len=Math.hypot(dx,dy);
      if(len>7){hero.x+=dx/len*hero.speed*dt;hero.y+=dy/len*hero.speed*dt;}
    }
    var pad=hero.r+5; hero.x=clamp(hero.x,pad,canvas.width-pad);hero.y=clamp(hero.y,pad,canvas.height-pad);
    run.spawnClock-=dt;
    var interval=clamp(1.05-run.elapsed*.0045,.34,1.05);
    if(run.spawnClock<=0 && run.elapsed<165){spawnEnemy();run.spawnClock=interval;}
    if(run.elapsed>=150&&!run.bossSpawned){run.bossSpawned=true;run.enemies.push(enemyAtEdge('boss'));var chip=el('wave-chip');if(chip)chip.textContent='BOSS · SIEGE BREAKER';}
    hero.cooldown-=dt;
    var ht=nearest(hero,hero.range); if(ht&&hero.cooldown<=0){fire(hero,ht,hero.damage,'#9cecff');hero.cooldown=1/hero.fireRate;}
    run.turret.cooldown-=dt;
    var turretPos={x:hq.x+Math.cos(run.turret.angle)*hq.r*1.25,y:hq.y+Math.sin(run.turret.angle)*hq.r*1.25};
    var tt=nearest(turretPos,run.turret.range);if(tt&&run.turret.cooldown<=0){fire(turretPos,tt,run.turret.damage,'#ffd166');run.turret.cooldown=1/run.turret.fireRate;}
    run.squad.forEach(function(s){s.cooldown-=dt;var st=nearest(s,s.range);if(st&&s.cooldown<=0){fire(s,st,s.damage,'#8cff9c');s.cooldown=1/s.fireRate;}});
    for(var i=run.enemies.length-1;i>=0;i--){
      var e=run.enemies[i],dx=hq.x-e.x,dy=hq.y-e.y,d=Math.hypot(dx,dy)||1;
      if(d>hq.r+e.r){e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt;}else{e.attackCd-=dt;if(e.attackCd<=0){hq.hp-=e.damage;e.attackCd=e.kind==='boss'?.7:1.15;run.lastHit=nowSeconds();}}
    }
    for(var b=run.bullets.length-1;b>=0;b--){
      var bullet=run.bullets[b];bullet.x+=bullet.vx*dt;bullet.y+=bullet.vy*dt;bullet.life-=dt;
      var hit=-1;for(var j=0;j<run.enemies.length;j++){if(distance(bullet,run.enemies[j])<run.enemies[j].r+4){hit=j;break;}}
      if(hit>=0){var enemy=run.enemies[hit];enemy.hp-=bullet.damage;run.bullets.splice(b,1);if(enemy.hp<=0)killEnemy(hit,enemy);}else if(bullet.life<=0)run.bullets.splice(b,1);
    }
    for(var q=run.particles.length-1;q>=0;q--){var part=run.particles[q];part.x+=part.vx*dt;part.y+=part.vy*dt;part.life-=dt;if(part.life<=0)run.particles.splice(q,1);}
    G.state.baseHp = Math.max(0, Math.round(hq.hp / hq.maxHp * G.state.maxBaseHp));
    if(hq.hp<=0)finishRun(false);
    else if(run.elapsed>=run.duration && run.bossDefeated)finishRun(true);
  }

  function circle(ctx,x,y,r,fill,stroke,width){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width||1;ctx.stroke();}}
  function drawPrototype() {
    if(!run||!context)return oldDraw&&oldDraw(G.state);
    var ctx=context,W=canvas.width,H=canvas.height,dpr=window.devicePixelRatio||1,hq=run.hq,hero=run.hero;
    var bg=ctx.createRadialGradient(hq.x,hq.y,20,hq.x,hq.y,Math.max(W,H)*.7);bg.addColorStop(0,'#26301f');bg.addColorStop(.45,'#171d15');bg.addColorStop(1,'#080b09');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(120,145,100,.12)';ctx.lineWidth=1*dpr;for(var x=0;x<W;x+=34*dpr){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(var y=0;y<H;y+=34*dpr){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    circle(ctx,hq.x,hq.y,run.turret.range,null,'rgba(255,209,102,.07)',1*dpr);
    circle(ctx,hq.x,hq.y,hq.r+8*dpr,'rgba(34,212,255,.05)','rgba(34,212,255,.22)',2*dpr);
    circle(ctx,hq.x,hq.y,hq.r,'#172a31','#9cecff',3*dpr);circle(ctx,hq.x,hq.y,hq.r*.55,'#223d47','#ffd166',2*dpr);
    ctx.fillStyle='#fff';ctx.font=(10*dpr)+'px Rajdhani';ctx.textAlign='center';ctx.fillText('HQ',hq.x,hq.y+3*dpr);
    var tp={x:hq.x+Math.cos(run.turret.angle)*hq.r*1.25,y:hq.y+Math.sin(run.turret.angle)*hq.r*1.25};circle(ctx,tp.x,tp.y,10*dpr,'#5b4a20','#ffd166',2*dpr);
    run.squad.forEach(function(s){circle(ctx,s.x,s.y,s.r,'#214b2d','#8cff9c',2*dpr);ctx.fillStyle='#dfffe6';ctx.fillRect(s.x-1*dpr,s.y-7*dpr,2*dpr,7*dpr);});
    run.enemies.forEach(function(e){var color=e.kind==='boss'?'#8d1515':e.kind==='armored'?'#754a2c':e.kind==='runner'?'#8b305f':'#5f2720';circle(ctx,e.x,e.y,e.r,color,e.kind==='boss'?'#ff3c3c':'#ff8c61',2*dpr);if(e.hp<e.maxHp||e.kind==='boss'){ctx.fillStyle='#220707';ctx.fillRect(e.x-e.r,e.y-e.r-6*dpr,e.r*2,3*dpr);ctx.fillStyle=e.kind==='boss'?'#ff3c3c':'#ff9f43';ctx.fillRect(e.x-e.r,e.y-e.r-6*dpr,e.r*2*(e.hp/e.maxHp),3*dpr);}});
    run.bullets.forEach(function(b){circle(ctx,b.x,b.y,3*dpr,b.color);});run.particles.forEach(function(p){ctx.globalAlpha=Math.max(0,p.life*2);circle(ctx,p.x,p.y,2*dpr,p.color);ctx.globalAlpha=1;});
    circle(ctx,hero.x,hero.y,hero.range,null,'rgba(156,236,255,.08)',1*dpr);circle(ctx,hero.x,hero.y,hero.r,'#17475b','#9cecff',3*dpr);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(hero.x,hero.y-8*dpr);ctx.lineTo(hero.x+5*dpr,hero.y+6*dpr);ctx.lineTo(hero.x-5*dpr,hero.y+6*dpr);ctx.fill();
    var hpPct=clamp(hq.hp/hq.maxHp,0,1),xpPct=clamp(run.xp/run.xpNext,0,1);ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(12*dpr,H-31*dpr,W-24*dpr,19*dpr);ctx.fillStyle=hpPct>.35?'#18f06a':'#ff3c3c';ctx.fillRect(14*dpr,H-29*dpr,(W-28*dpr)*hpPct,6*dpr);ctx.fillStyle='#22d4ff';ctx.fillRect(14*dpr,H-19*dpr,(W-28*dpr)*xpPct,4*dpr);ctx.fillStyle='#fff';ctx.font=(8*dpr)+'px "Share Tech Mono"';ctx.textAlign='left';ctx.fillText('HQ '+Math.ceil(hq.hp)+'/'+hq.maxHp+'   LV '+run.level+'   KILLS '+run.kills,16*dpr,H-33*dpr);
    var remaining=Math.max(0,Math.ceil(run.duration-run.elapsed)),min=Math.floor(remaining/60),sec=remaining%60;ctx.textAlign='right';ctx.fillText(min+':'+String(sec).padStart(2,'0'),W-16*dpr,H-33*dpr);
    if(nowSeconds()-run.lastHit<.18){ctx.fillStyle='rgba(255,0,0,.09)';ctx.fillRect(0,0,W,H);}
  }

  function canvasPoint(ev){var r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*(canvas.width/r.width),y:(ev.clientY-r.top)*(canvas.height/r.height),cssX:ev.clientX-r.left,cssY:ev.clientY-r.top};}
  function pointerDown(ev){if(!run||!run.active||run.upgradeOpen)return;var p=canvasPoint(ev);pointer={active:true,id:ev.pointerId,sx:p.x,sy:p.y,x:p.x,y:p.y};var joy=el('hq-joystick');joy.style.display='block';joy.style.left=p.cssX+'px';joy.style.top=p.cssY+'px';canvas.setPointerCapture&&canvas.setPointerCapture(ev.pointerId);ev.preventDefault();}
  function pointerMove(ev){if(!pointer.active||pointer.id!==ev.pointerId)return;var p=canvasPoint(ev);pointer.x=p.x;pointer.y=p.y;var dx=clamp((p.x-pointer.sx)/(canvas.width/canvas.getBoundingClientRect().width),-25,25),dy=clamp((p.y-pointer.sy)/(canvas.height/canvas.getBoundingClientRect().height),-25,25);var joy=el('hq-joystick');joy.style.setProperty('--jx',dx+'px');joy.style.setProperty('--jy',dy+'px');ev.preventDefault();}
  function pointerUp(ev){if(pointer.id!==ev.pointerId)return;pointer.active=false;var joy=el('hq-joystick');if(joy){joy.style.display='none';joy.style.setProperty('--jx','0px');joy.style.setProperty('--jy','0px');}}

  installStyles();
  installStageScreen();
  if(canvas){canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);}
  var waveButton=el('waveBtn');if(waveButton)waveButton.addEventListener('click',function(ev){if(G&&G.state&&G.state.started){ev.stopImmediatePropagation();beginPrototype();}},true);
  _patchedUpdate=function(dt,c,onEnd,onGameOver,onWarn){if(run&&G.state&&G.state._centralHQMode){updatePrototype(dt);return;}return oldUpdate&&oldUpdate(dt,c,onEnd,onGameOver,onWarn);};
  drawVertical=function(state){if(run&&state&&state._centralHQMode)return drawPrototype();return oldDraw&&oldDraw(state);};
  setTimeout(function(){var home=el('homeScreen'),start=el('startOverlay');if(home){home.style.display='none';home.classList.remove('hs-visible');}if(start)start.classList.add('hidden');document.body.classList.remove('lsc-home-mode');},120);
})();
