function _unlockAudio() {
  if (_audioUnlocked) return;
  // Initialize and resume the shared AudioContext from audio.js
  ensureAudio();
  // Play a silent buffer on the shared context to fully satisfy iOS autoplay policy
  try {
    if (_ctx) {
      const buf = _ctx.createBuffer(1, 1, 22050);
      const src = _ctx.createBufferSource();
      src.buffer = buf;
      src.connect(_masterGain || _ctx.destination);
      src.start(0);
      _ctx.resume().catch(() => {});
    }
  } catch(e) {}
  // Restore saved volume
  const savedVol = parseInt(localStorage.getItem('ifc_volume') || '100');
  const savedOn = localStorage.getItem('ifc_sound_enabled') !== '0';
  setMasterVolume(savedVol / 100);
  setSoundEnabled(savedOn);
  _audioUnlocked = true;
  document.removeEventListener('touchstart', _unlockAudio);
  document.removeEventListener('mousedown', _unlockAudio);
}
document.addEventListener('touchstart', _unlockAudio, { passive: true });
document.addEventListener('mousedown', _unlockAudio);


// Boss drone disabled — uses engine-internal vars
function tickBossDrone() {}

// ── Weather stubs (rain canvas removed but calls remain) ──────
const weatherCvs = document.getElementById('weatherCanvas');
const weatherCtx = weatherCvs ? weatherCvs.getContext('2d') : null;
let _weatherActive = false;
let _rainDrops = [];

function setWeather(active) {
  _weatherActive = active;
  if (weatherCvs) weatherCvs.style.display = active ? 'block' : 'none';
  if (active) initRain();
}

function initRain() {
  if (!weatherCvs) return;
  weatherCvs.width  = weatherCvs.offsetWidth  * (window.devicePixelRatio || 1);
  weatherCvs.height = weatherCvs.offsetHeight * (window.devicePixelRatio || 1);
  var dpr = window.devicePixelRatio || 1;
  var W = weatherCvs.width, H = weatherCvs.height;
  var wave = (typeof G !== 'undefined' && G.state) ? (G.state.wave || 1) : 1;
  var isHeavy = wave >= 50;
  var count = isHeavy ? 180 : 100;
  _rainDrops = [];
  for (var i = 0; i < count; i++) {
    _rainDrops.push({
      x:     Math.random() * W,
      y:     Math.random() * H,
      len:   (isHeavy ? 28 + Math.random()*22 : 16 + Math.random()*20) * dpr,
      speed: (isHeavy ? 14 + Math.random()*12 : 7 + Math.random()*9)  * dpr,
      alpha: isHeavy ? 0.3 + Math.random()*0.35 : 0.15 + Math.random()*0.3,
      // Splash state
      splashing: false, splashR: 0, splashX: 0, splashY: 0, splashA: 0,
    });
  }
}

function tickWeather(dt) {
  if (!weatherCtx || !_weatherActive || !weatherCvs) return;
  var W = weatherCvs.width, H = weatherCvs.height;
  var dpr = window.devicePixelRatio || 1;
  var gs = (typeof _gameSpeed !== 'undefined') ? _gameSpeed : 1;
  var wave = (typeof G !== 'undefined' && G.state) ? (G.state.wave || 1) : 1;
  var isHeavy = wave >= 50;
  var t = (typeof G !== 'undefined' && G.state) ? (G.state.time || 0) : 0;

  weatherCtx.clearRect(0, 0, W, H);

  // Thunderstorm sky overlay at Wave 50+
  if (isHeavy) {
    var stormA = 0.04 + 0.02 * Math.sin(t * 0.4);
    weatherCtx.fillStyle = 'rgba(20,16,8,' + stormA + ')';
    weatherCtx.fillRect(0, 0, W, H);
    // Occasional lightning flash
    if (Math.sin(t * 11.7) > 0.96) {
      weatherCtx.fillStyle = 'rgba(220,230,255,' + (Math.sin(t*11.7) - 0.96) * 15 + ')';
      weatherCtx.fillRect(0, 0, W, H * 0.35);
    }
  }

  // Rain drops
  weatherCtx.lineWidth = isHeavy ? 1.5 : 1;
  for (var i = 0; i < _rainDrops.length; i++) {
    var drop = _rainDrops[i];

    // Draw streak
    weatherCtx.globalAlpha = drop.alpha;
    weatherCtx.strokeStyle = isHeavy ? 'rgba(140,180,220,0.6)' : 'rgba(150,200,255,0.35)';
    weatherCtx.beginPath();
    weatherCtx.moveTo(drop.x, drop.y);
    weatherCtx.lineTo(drop.x - drop.len * 0.18, drop.y + drop.len);
    weatherCtx.stroke();

    // Draw active splash ring
    if (drop.splashing) {
      drop.splashR += 1.5 * dpr * gs;
      drop.splashA -= 0.07 * gs;
      if (drop.splashA <= 0) {
        drop.splashing = false;
      } else {
        weatherCtx.globalAlpha = drop.splashA;
        weatherCtx.strokeStyle = isHeavy ? 'rgba(140,180,220,0.8)' : 'rgba(150,200,255,0.5)';
        weatherCtx.lineWidth = 0.8 * dpr;
        weatherCtx.beginPath();
        weatherCtx.ellipse(drop.splashX, drop.splashY, drop.splashR, drop.splashR * 0.3, 0, 0, Math.PI * 2);
        weatherCtx.stroke();
        weatherCtx.lineWidth = isHeavy ? 1.5 : 1;
      }
    }

    // Advance position
    drop.y += drop.speed * gs;
    drop.x -= drop.speed * 0.18 * gs;

    // Hit ground — trigger splash on bottom 20% of screen
    if (drop.y > H) {
      if (drop.y - drop.speed * gs < H && drop.y > H * 0.8) {
        // Splash
        drop.splashing = true;
        drop.splashR   = dpr;
        drop.splashX   = drop.x;
        drop.splashY   = H - 2 * dpr;
        drop.splashA   = isHeavy ? 0.55 : 0.35;
      }
      drop.y = -drop.len;
      drop.x = Math.random() * W;
    }
    if (drop.x < 0) { drop.x = W; }
  }
  weatherCtx.globalAlpha = 1;
  weatherCtx.lineWidth = 1;
}

// ── Restored feature functions ────────────────────────────────

// ══════════════════════════════════════════════════════════════
// QUEST SYSTEM — 4 active quests, credit rewards on completion
// ══════════════════════════════════════════════════════════════

const QUEST_DEFS = [
  // Wave-survival quests
  { id:'q_wave3',    title:'Survive 3 Waves',       type:'wave',     target:3,   reward:80,  color:'var(--cyan)' },
  { id:'q_wave5',    title:'Survive 5 Waves',       type:'wave',     target:5,   reward:140, color:'var(--cyan)' },
  { id:'q_wave8',    title:'Reach Wave 8',           type:'wave',     target:8,   reward:200, color:'var(--cyan)' },
  { id:'q_wave12',   title:'Reach Wave 12',          type:'wave',     target:12,  reward:300, color:'var(--cyan)' },
  // Kill quests
  { id:'q_kill20',   title:'Kill 20 Enemies',        type:'kills',    target:20,  reward:60,  color:'var(--red)' },
  { id:'q_kill50',   title:'Kill 50 Enemies',        type:'kills',    target:50,  reward:120, color:'var(--red)' },
  { id:'q_kill100',  title:'Kill 100 Enemies',       type:'kills',    target:100, reward:220, color:'var(--red)' },
  { id:'q_boss1',    title:'Defeat a Boss',          type:'bosses',   target:1,   reward:150, color:'var(--amber)' },
  { id:'q_boss3',    title:'Defeat 3 Bosses',        type:'bosses',   target:3,   reward:320, color:'var(--amber)' },
  // Deployment quests
  { id:'q_deploy5',  title:'Deploy 5 Troops',        type:'deploys',  target:5,   reward:50,  color:'var(--green)' },
  { id:'q_fill1',    title:'Fill a Position (5/5)',   type:'fullpos',  target:1,   reward:90,  color:'var(--green)' },
  // Research quests
  { id:'q_research1',title:'Research Any Upgrade',   type:'research', target:1,   reward:55,  color:'var(--purple)' },
  { id:'q_research3',title:'Research 3 Upgrades',    type:'research', target:3,   reward:130, color:'var(--purple)' },
  // No-damage quest
  { id:'q_nodmg',    title:'Survive a Wave Unharmed',type:'nodamage', target:1,   reward:110, color:'var(--green)' },
  // Orbital
  { id:'q_orbital1', title:'Fire the Orbital Strike', type:'orbital', target:1,   reward:70,  color:'var(--amber)' },
];

// Quest state — lives on G.state
function _initQuestState(s) {
  if (!s._quests) {
    s._quests = { active:[], completed:[], progress:{}, counters:{kills:0,bosses:0,deploys:0,research:0,orbital:0,nodamage:0,fullpos:0} };
    _refreshActiveQuests(s);
  }
}
function _refreshActiveQuests(s) {
  const q = s._quests;
  const done = new Set(q.completed);
  const active = new Set(q.active.map(a => a.id));
  // Fill up to 4 active quests from available defs
  const available = QUEST_DEFS.filter(d => !done.has(d.id) && !active.has(d.id));
  while (q.active.length < 4 && available.length > 0) {
    const pick = available.shift();
    q.active.push({ id: pick.id, claimed: false });
  }
}

// Increment a quest counter and check completions
function _questTick(counterKey, amount) {
  try {
    const s = G.state;
    if (!s || !s._quests) return;
    s._quests.counters[counterKey] = (s._quests.counters[counterKey] || 0) + amount;
    _checkQuestCompletions(s);
    renderQuestBoard();
  } catch(e) {}
}

function _checkQuestCompletions(s) {
  const q = s._quests;
  let anyNew = false;
  q.active.forEach(function(aq) {
    if (aq.claimed) return;
    const def  = QUEST_DEFS.find(function(d) { return d.id === aq.id; });
    if (!def) return;
    const prog = _questProgress(s, def);
    if (prog >= def.target) {
      aq.claimed = true;
      anyNew = true;
    }
  });
  if (anyNew) {
    // Flash the quest board
    const board = $id('quest-board');
    if (board) {
      board.style.filter = 'brightness(1.8)';
      setTimeout(function() { board.style.filter = ''; }, 400);
    }
  }
}

function _questProgress(s, def) {
  const c = s._quests.counters;
  if (def.type === 'wave')     return Math.min(s.wave - 1, def.target);
  if (def.type === 'kills')    return Math.min(c.kills    || 0, def.target);
  if (def.type === 'bosses')   return Math.min(c.bosses   || 0, def.target);
  if (def.type === 'deploys')  return Math.min(c.deploys  || 0, def.target);
  if (def.type === 'research') return Math.min(c.research || 0, def.target);
  if (def.type === 'orbital')  return Math.min(c.orbital  || 0, def.target);
  if (def.type === 'nodamage') return Math.min(c.nodamage || 0, def.target);
  if (def.type === 'fullpos')  return Math.min(c.fullpos  || 0, def.target);
  return 0;
}

function renderQuestBoard() {
  try {
    const board = $id('quest-board');
    if (!board) return;
    const s = G.state;
    if (!s || !s._quests) return;
    const q = s._quests;

    // Clear old cards (keep header)
    const head = $id('quest-board-head');
    board.innerHTML = '';
    board.appendChild(head);

    q.active.forEach(function(aq) {
      const def  = QUEST_DEFS.find(function(d) { return d.id === aq.id; });
      if (!def) return;
      const prog = _questProgress(s, def);
      const pct  = Math.min(100, Math.round(prog / def.target * 100));
      const done = aq.claimed;

      const card = document.createElement('div');
      card.className = 'quest-card' + (done ? ' complete' : '');
      card.style.setProperty('--quest-col', def.color);
      card.innerHTML =
        '<div class="quest-title">' + def.title + '</div>' +
        '<div class="quest-progress-bar"><div class="quest-progress-fill" style="width:' + pct + '%;background:' + def.color + '"></div></div>' +
        '<div class="quest-reward">' + (done ? '★ Claim ' : '') + def.reward + ' cr</div>';

      card.addEventListener('click', function() {
        if (!done) return;
        // Already claimed the reward?
        if (aq._rewarded) return;
        aq._rewarded = true;
        s.credits += def.reward;
        spawnCreditPop(window.innerWidth - 80, 120, def.reward, false);
        haptic('success');
        showToast('Quest complete! +' + def.reward + ' cr');
        updateHUD();
        // Move to completed, refresh active quests
        q.completed.push(def.id);
        q.active = q.active.filter(function(a) { return a.id !== def.id; });
        _refreshActiveQuests(s);
        renderQuestBoard();
      });

      board.appendChild(card);
    });
  } catch(e) {}
}

// ══════════════════════════════════════════════════════════════
// RESEARCH TIMERS — real clock time, scales with level
// Lv1: 30s  Lv2: 60s  Lv3-4: 90s  Lv5+: scales up to 4 min
// Timer ticks even when paused (real wall-clock time)
// ══════════════════════════════════════════════════════════════

function _researchSeconds(level) {
  if (level <= 1) return 0;    // first purchase always instant
  if (level === 2) return 30;
  if (level === 3) return 60;
  if (level === 4) return 90;
  if (level === 5) return 120;
  if (level === 6) return 180;
  return Math.min(level * 30, 240); // max 4 min
}

function _fmtTime(sec) {
  if (sec <= 0) return 'Done';
  if (sec < 60) return sec + 's';
  return Math.ceil(sec / 60) + 'm ' + (sec % 60) + 's';
}

// Queue: [{id, isLane, lane, completesAt (Date.now ms), totalMs, level, name}]
let _researchQueue = [];

function _startResearch(id, isLane, lane, level, name) {
  const secs = _researchSeconds(level);
  if (secs === 0) return true; // instant
  if (_researchQueue.find(function(r) { return r.id === id && r.lane === ((lane !== undefined ? lane : -1)); })) return false;
  _researchQueue.push({
    id, isLane, lane: (lane !== undefined ? lane : -1),
    completesAt: Date.now() + secs * 1000,
    totalMs: secs * 1000,
    level, name: name || id
  });
  return false;
}

function _tickResearchQueue() {
  if (!_researchQueue.length) return;
  const now = Date.now();
  const completed = [];
  _researchQueue = _researchQueue.filter(function(r) {
    if (now >= r.completesAt) { completed.push(r); return false; }
    return true;
  });
  completed.forEach(function(r) {
    // Apply the upgrade (already paid for — just apply effect)
    if (r.isLane) {
      G.state.lanes[r.lane][r.id]++;
      applyUpgrades();
      G.log(r.name + ' complete (Lane ' + r.lane + ')', 'good');
    } else {
      G.state.upgrades[r.id]++;
      applyUpgrades();
      G.log(r.name + ' Lv' + r.level + ' complete!', 'good');
    }
    showToast('✓ ' + r.name + ' complete!');
    _sfxResearchDone();
    haptic('success');
    renderResearchSheet();
    renderQuestBoard();
    updateHUD();
  });
}

function _researchQueueStatus(id, isLane, lane) {
  return _researchQueue.find(function(r) {
    return r.id === id && r.lane === ((lane !== undefined ? lane : -1));
  }) || null;
}

// ══════════════════════════════════════════════════════════════
// FORTIFY PREREQUISITES — base tier gating
// ══════════════════════════════════════════════════════════════

// Each tier of Fortify Base requires certain research levels
const FORTIFY_PREREQS = [
  // To buy Fortify Lv1: no prereqs
  null,
  // To buy Fortify Lv2: need at least 1 Lane Turret somewhere + Weapon Calibration Lv1
  { label:'Lane Turret (any) Lv1 · Weapon Cal Lv1', check: function(s) {
    return [0,1,2].some(function(l) { return s.lanes[l].gun >= 1; }) && s.upgrades.weapons >= 1;
  }},
  // Lv3: need Barricade Lv1 all lanes + Fire Discipline Lv1
  { label:'Barricade all lanes Lv1 · Fire Discipline Lv1', check: function(s) {
    return s.lanes.every(function(l) { return l.barricade >= 1; }) && s.upgrades.training >= 1;
  }},
  // Lv4: need Med Station (any) Lv2 + Field Triage Lv2
  { label:'Med Station (any) Lv2 · Field Triage Lv2', check: function(s) {
    return [0,1,2].some(function(l) { return s.lanes[l].medbay >= 2; }) && s.upgrades.medical >= 2;
  }},
  // Lv5+: need all lane upgrades Lv2+ + all global upgrades Lv2+
  { label:'All upgrades Lv2+', check: function(s) {
    const allLane = LANE_UPGRADE_DEFS.every(function(def) {
      return [0,1,2].some(function(l) { return s.lanes[l][def.id] >= 2; });
    });
    const allGlob = ['weapons','logistics','training','medical'].every(function(k) { return s.upgrades[k] >= 2; });
    return allLane && allGlob;
  }},
];

function getFortifyPrereq(level) {
  if (level < FORTIFY_PREREQS.length) return FORTIFY_PREREQS[level];
  return FORTIFY_PREREQS[FORTIFY_PREREQS.length - 1];
}

// Kill streak counter
let _streakCount = 0, _streakTimer = null;
function _onKillForStreak(isBoss) {
  try {
    _streakCount += isBoss ? 3 : 1;
    clearTimeout(_streakTimer);
    _streakTimer = setTimeout(function() { _streakCount = 0; }, 3500);
    const milestones = [3, 5, 8, 12, 20];
    if (milestones.indexOf(_streakCount) >= 0 || (_streakCount >= 20 && _streakCount % 5 === 0)) {
      const el  = $id('killStreak');
      const num = $id('ksNum');
      if (num) num.textContent = '\xd7' + _streakCount;
      el.classList.remove('show');
      void el.offsetWidth;
      el.classList.add('show');
      setTimeout(function() { el.classList.remove('show'); }, 1500);
      if (_streakCount >= 8) haptic('medium');
    }
  } catch(e) {}
}

// Floating credit pop
function spawnCreditPop(x, y, amount, isBoss) {
  try {
    const wrap = $id('battlefield-wrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'credit-pop' + (isBoss ? ' boss' : amount >= 20 ? ' kill' : '');
    el.textContent = '+' + amount + ' cr';
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    wrap.appendChild(el);
    setTimeout(function() { el.remove(); }, 950);
  } catch(e) {}
}

// Orbital reticle then fire
function fireOrbitalWithReticle() {
  try {
    const reticle = $id('orbitalReticle');
    reticle.classList.remove('show');
    void reticle.offsetWidth;
    reticle.classList.add('show');
    setTimeout(function() {
      reticle.classList.remove('show');
      orbitalStrike(canvas);
      triggerShake('heavy');
      updateHUD();
    }, 900);
  } catch(e) {
    // Fallback if reticle missing
    try { orbitalStrike(canvas); triggerShake('heavy'); updateHUD(); } catch(e2) {}
  }
}

// Haptic feedback
function haptic(type) {
  try {
    if (navigator.vibrate) {
      if (type === 'light')   navigator.vibrate(8);
      if (type === 'medium')  navigator.vibrate(20);
      if (type === 'heavy')   navigator.vibrate([30,10,30]);
      if (type === 'success') navigator.vibrate([10,5,10,5,20]);
      if (type === 'error')   navigator.vibrate([50,20,50]);
    }
  } catch(e) {}
}

// Wave sky escalation
function updateWaveSky(wave) {
  try {
    const sky = $id('waveSky');
    if (!sky) return;
    sky.style.transition = 'background 3s ease';
    const w = Math.min(wave, 15);
    if (w <= 1) {
      sky.style.background = 'transparent';
    } else if (w <= 3) {
      const i = (w - 1) / 2;
      sky.style.background = 'linear-gradient(180deg,rgba(' + Math.floor(30*i) + ',' + Math.floor(10*i) + ',0,' + (.06*i).toFixed(2) + ') 0%,transparent 40%)';
    } else if (w <= 6) {
      const i = (w - 3) / 3;
      sky.style.background = 'linear-gradient(180deg,rgba(' + Math.floor(60+20*i) + ',' + Math.floor(15-10*i) + ',0,' + (.12+.08*i).toFixed(2) + ') 0%,transparent 45%)';
    } else if (w <= 10) {
      const i = (w - 6) / 4;
      sky.style.background = 'linear-gradient(180deg,rgba(' + Math.floor(80+30*i) + ',' + Math.floor(5-5*i) + ',0,' + (.20+.12*i).toFixed(2) + ') 0%,transparent 50%)';
    } else {
      const i = Math.min((w - 10) / 5, 1);
      sky.style.background = 'linear-gradient(180deg,rgba(' + Math.floor(110+30*i) + ',0,0,' + (.32+.18*i).toFixed(2) + ') 0%,rgba(80,0,0,' + (.08*i).toFixed(2) + ') 65%,transparent 100%)';
    }
  } catch(e) {}
}

// Upgrade badges on base buildings
function _getUpgradeBadgeCount() {
  try {
    const s = G.state;
    if (!s) return {barracks:0, research:0};
    const slots    = UNLOCKS.troopSlots(s.prestige);
    const canEnlist = UNIT_DEFS.some(function(def) {
      if (def.id === 'sniper' && !UNLOCKS.has(s.prestige, 'u_sniper')) return false;
      return s.credits >= troopCost(def) && [0,1,2].some(function(l) { return laneTroopCount(l) < slots; });
    });
    let rc = 0;
    UPGRADE_DEFS.forEach(function(def) { if (s.credits >= upgradeCost(def)) rc++; });
    LANE_UPGRADE_DEFS.forEach(function(def) {
      [0,1,2].forEach(function(lane) { if (s.credits >= laneUpgradeCost(def.id, lane)) rc++; });
    });
    return {barracks: canEnlist ? 1 : 0, research: Math.min(rc, 9)};
  } catch(e) { return {barracks:0, research:0}; }
}

function updateUpgradeBadges() {
  try {
    const counts = _getUpgradeBadgeCount();
    const wrap   = $id('battlefield-wrap');
    if (!wrap) return;
    ['barracks','research'].forEach(function(key) {
      const rect  = _baseHitRects[key];
      const count = counts[key];
      let badge   = document.getElementById('badge-'+key);
      if (!rect || count === 0) { if (badge) badge.style.display = 'none'; return; }
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'badge-'+key;
        badge.className = 'upgrade-badge';
        wrap.appendChild(badge);
      }
      badge.style.display = 'flex';
      badge.style.left = (rect.x + rect.w - 4) + 'px';
      badge.style.top  = (rect.y - 4) + 'px';
      badge.textContent = count > 1 ? count : '!';
    });
  } catch(e) {}
}

// Deploy refund
let _lastDeployedTroop = null, _refundTimer = null;
function showRefundBar(troop, cost) {
  try {
    _lastDeployedTroop = {troop:troop, cost:cost};
    const bar = $id('refundBar');
    if (!bar) return;
    bar.style.display = 'block';
    clearTimeout(_refundTimer);
    _refundTimer = setTimeout(function() {
      bar.style.display = 'none';
      _lastDeployedTroop = null;
    }, 4000);
  } catch(e) {}
}

let _gameSpeed = 1; // declared here, used throughout

// ── Persistent battlefield FX ─────────────────────────────────
// Scorch marks: { x, y, r, life } — accumulate, fade slowly
const _scorchMarks = [];
const SCORCH_MAX = 40;
// Shell casings: { x, y, angle, life } — brief, tumble and stop
const _shellCasings = [];
const CASING_MAX = 60;
// Muzzle illumination: { x, y, r, life } — brief ground light
const _muzzleGlows = [];
// Death decals — oil/blood stains that persist per wave (cleared on wave start)
const _deathDecals = [];
const DECAL_MAX = 80;
// Dust puffs — concrete impact particles, brief
const _dustPuffs = [];

function _addScorch(x, y, radius) {
  if (_scorchMarks.length >= SCORCH_MAX) _scorchMarks.shift();
  _scorchMarks.push({ x: x, y: y, r: radius, life: 1.0 });
}
function _addCasing(x, y) {
  if (_shellCasings.length >= CASING_MAX) _shellCasings.shift();
  _shellCasings.push({ x: x, y: y, angle: Math.random() * Math.PI, vx: (Math.random()-0.5)*3, vy: Math.random()*2, life: 1.0 });
}
function _addMuzzleGlow(x, y, r) {
  _muzzleGlows.push({ x: x, y: y, r: r, life: 1.0 });
}
function _addDeathDecal(x, y, kind) {
  if (_deathDecals.length >= DECAL_MAX) _deathDecals.shift();
  _deathDecals.push({ x: x, y: y, r: (4 + Math.random()*5), kind: kind || 'oil', life: 1.0 });
}
function _addDustPuff(x, y) {
  _dustPuffs.push({ x: x, y: y, r: 2, life: 1.0, vx: (Math.random()-0.5)*2, vy: -Math.random()*2 });
}

// Member/dev flag — set to true to unlock ×10 mode
const _MEMBER_MODE = false; // flip to false to hide from regular players

// Build speed options based on IAP purchases (checked at definition time)
const _hasSupporter = localStorage.getItem('ifc_iap_supporter') === '1';
const _hasCommander = localStorage.getItem('ifc_iap_commander') === '1';
const _speeds = (function() {
  const s = [
    { val: 1,  label: '1×', cls: 's1' },
    { val: 2,  label: '2×', cls: 's2' },
    { val: 3,  label: '3×', cls: 's3' },
  ];
  if (_hasSupporter || _hasCommander) s.push({ val: 5, label: '5×', cls: 's3' });
  if (_hasCommander || _MEMBER_MODE)  s.push({ val: 10, label: '10×', cls: 's6' });
  return s;
})();
let _speedIdx = 0;
function _applySpeed() {
  const sp = _speeds[_speedIdx];
  _gameSpeed = sp.val;
  const btn = $id('speedCycleBtn');
  if (!btn) return;
  btn.textContent = sp.label;
  btn.className   = sp.cls;
  btn.id = 'speedCycleBtn';
  // Visual flag for dev/member mode
  btn.style.color = sp.val === 10 ? '#ff3cff' : '';
  btn.style.textShadow = sp.val === 10 ? '0 0 8px #ff3cff' : '';
}
try { _applySpeed(); } catch(e) { _showErr('_applySpeed', e); }
setTimeout(function() { try { _updateAutowavStrip(); } catch(e) {} }, 500);
$id('speedCycleBtn').addEventListener('click', () => {
  _speedIdx = (_speedIdx + 1) % _speeds.length;
  _applySpeed();
});

// ── Base building hit rects (written each frame by drawVertical) ──
const _baseHitRects = { barracks: null, research: null };

// ── Canvas tap → building ─────────────────────────────────────
function _onCanvasTap(evt) {
  const isTouch = !!evt.touches;
  const rect  = canvas.getBoundingClientRect();
  const touch = isTouch ? evt.touches[0] : evt;
  const tapX  = touch.clientX - rect.left;
  const tapY  = touch.clientY - rect.top;

  function inRect(r) {
    return r && tapX >= r.x && tapX <= r.x + r.w && tapY >= r.y && tapY <= r.y + r.h;
  }
  function spawnRipple(cx, cy) {
    const wrap = $id('battlefield-wrap');
    const wRect = wrap.getBoundingClientRect();
    const rpl = document.createElement('div');
    rpl.className = 'tap-ripple';
    rpl.style.left = (rect.left - wRect.left + tapX) + 'px';
    rpl.style.top  = (rect.top  - wRect.top  + tapY) + 'px';
    wrap.appendChild(rpl);
    setTimeout(() => rpl.remove(), 500);
  }

  // Check if tapping a deployed troop (swap mechanic)
  const TAP_RADIUS = 22; // CSS pixels
  const tappedTroop = G.state.troops.find(trp => {
    if (trp._screenX === undefined) return false;
    const dx = tapX - trp._screenX;
    const dy = tapY - trp._screenY;
    return Math.hypot(dx, dy) < TAP_RADIUS;
  });
  if (tappedTroop) {
    evt.preventDefault();
    spawnRipple(tapX, tapY);
    // Show floating kill/rank tag above the unit
    _showUnitTag(tappedTroop, tapX, tapY);
    openSwapSheet(tappedTroop);
    return;
  }

  if (inRect(_baseHitRects.barracks)) {
    evt.preventDefault();
    spawnRipple(tapX, tapY);
    renderEnlistSheet();
    openSheet('enlist-sheet', 'enlist-backdrop');
    _obActionTaken('barracks');
    return;
  }
  if (inRect(_baseHitRects.research)) {
    evt.preventDefault();
    spawnRipple(tapX, tapY);
    // Free first research upgrade during onboarding
    if (_obActive && _obStep === 1 && G.state.upgrades.weapons === 0) {
      G.state.upgrades.weapons = 1;
      applyUpgrades();
      showToast('✓ Weapon Calibration Lv1 — Free!');
      haptic('success');
    }
    renderResearchSheet();
    openSheet('research-sheet', 'research-backdrop');
    _obActionTaken('research');
    return;
  }
}
canvas.addEventListener('touchstart', _onCanvasTap, { passive: false });
canvas.addEventListener('click', _onCanvasTap);
function showToast(msg) {
  console.log('🔔 TOAST CALLED:', msg);
  
  try {
    // Create or get toast element
    let t = document.getElementById('toast-msg');
    
    if (!t) {
      console.log('📦 Creating new toast element');
      t = document.createElement('div');
      t.id = 'toast-msg';
      t.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 999999;
        background: rgba(26,200,156,.95);
        border: 2px solid rgba(26,200,156,1);
        border-radius: 12px;
        padding: 16px 28px;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 700;
        font-size: 16px;
        color: #ffffff;
        letter-spacing: 0.5px;
        white-space: normal;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 8px 32px rgba(26,200,156,.4);
        pointer-events: auto;
        opacity: 1;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(t);
      console.log('✓ Toast element created and appended');
    }
    
    // Set message and show
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.display = 'block';
    console.log('✓ Toast visible:', msg);
    
    // Auto-hide after 3 seconds
    if (t._hideTimer) clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(function() {
      console.log('🔔 Hiding toast');
      t.style.opacity = '0';
      setTimeout(function() {
        t.style.display = 'none';
      }, 300);
    }, 3000);
    
  } catch(e) {
    console.error('⚠️ Toast error:', e.message);
  }
}

// ── Game loop ──────────────────────────────────────────────────
let _lastTime = performance.now();
let _lastSave  = 0;
let _prevKills = 0;
let _prevWave  = 1;
try { resizeCanvasVertical(); } catch(e) { _showErr('resizeCanvas', e); }
try { updateHUD(); } catch(e) { _showErr('updateHUD', e); }

// ── Troop-first combat: enemies fight troops before reaching base ──
// We intercept after each update tick and redirect enemies that have
// reached the base threshold to attack troops in their lane first.
function applyTroopCombat() {
  const s = G.state;
  const BASE_X = 96; // original horizontal threshold
  for (const e of s.enemies) {
    if (e.hp <= 0) continue;
    // In vertical layout enemy "x" maps to progress; near-base means x is low
    if (e.x > BASE_X + 60) continue; // not close enough yet
    const laneTroops = s.troops.filter(t => t.lane === e.lane && t.hp > 0);
    if (laneTroops.length === 0) continue; // no troops to fight — falls through to base

    // Enemy engages the nearest troop (lowest slot = frontmost)
    const target = laneTroops.reduce((a, b) => a.slot < b.slot ? a : b);

    // Enemy deals melee damage to troop every ~0.6s (tracked via e._meleeCd)
    // We do this each call (called once per frame step), so spread across frames
    if (e._meleeCd === undefined) e._meleeCd = 0;
    e._meleeCd -= 0.016 * _gameSpeed; // approx per-frame dt
    if (e._meleeCd <= 0) {
      const meleeDmg = Math.max(1, e.damage * 0.6); // melee does 60% of breach damage
      target.hp -= meleeDmg;
      s.fx.push({ kind: 'hit', x: e.x, y: e.y, life: .12, max: .12, r: 6 });
      e._meleeCd = 0.6; // attack every 0.6s

      if (target.hp <= 0) {
        target.hp = 0;
        G.log(target.type.name + " KO'd in " + ['Left','Ctr','Right'][e.lane] + ' lane!', 'danger');
        playSfx('impact');
        triggerShake('light');
        // Remove dead troop
        s.troops = s.troops.filter(t => t !== target);
        // Re-slot remaining troops so positions stay clean
        s.troops.filter(t => t.lane === e.lane).forEach((t, i) => {
          t.slot = i;
          t.x    = 160 + i * 48;
          t.y    = LANE_Y[t.lane] + (i % 2 === 0 ? -20 : 20);
        });
      }
    }

    // While troops remain, stall the enemy — stop it from reaching the base threshold
    if (laneTroops.some(t => t.hp > 0)) {
      e.x = Math.max(e.x, BASE_X + 30); // hold just outside base
    }
  }
}


// ── Auto-Wave Strip UI ────────────────────────────────────────
function _updateAutowavStrip() {
  var strip = document.getElementById('autowav-strip');
  var label = document.getElementById('autowav-label');
  var right = document.getElementById('autowav-right');
  if (!strip || !label || !right) return;

  if (!_autoWaveUnlocked) {
    // Not purchased — show unlock button
    label.className = '';
    label.textContent = '⚡ AUTO-WAVE';
    right.innerHTML = '<button id="autowav-unlock-btn">🔒 Unlock in Store</button>';
    var btn = document.getElementById('autowav-unlock-btn');
    if (btn) btn.addEventListener('click', function() {
      renderStoreSheet();
      openSheet('store-sheet', 'store-backdrop');
      haptic('light');
    });
  } else {
    // Purchased — show toggle switch
    label.className = _autoWave ? 'active' : '';
    label.textContent = '⚡ AUTO-WAVE';
    right.innerHTML =
      '<div id="autowav-toggle-wrap">' +
        '<span id="autowav-status" class="' + (_autoWave ? 'on' : '') + '">' +
          (_autoWave ? 'ON' : 'OFF') +
        '</span>' +
        '<label id="autowav-switch">' +
          '<input type="checkbox" id="autowav-checkbox"' + (_autoWave ? ' checked' : '') + '>' +
          '<div id="autowav-slider"></div>' +
        '</label>' +
      '</div>';
    var cb = document.getElementById('autowav-checkbox');
    if (cb) cb.addEventListener('change', function() {
      _autoWave = cb.checked;
      haptic(_autoWave ? 'success' : 'medium');
      showToast(_autoWave ? '⚡ Auto-Wave ON — next wave in ' + AUTO_WAVE_DELAY + 's' : 'Auto-Wave OFF');
      if (_autoWave && !G.state.waveInProgress) _scheduleAutoWave();
      else clearTimeout(_autoWaveTimer);
      _updateAutowavStrip();
      updateHUD();
    });
  }
}

