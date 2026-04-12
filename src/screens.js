$id('homeSettingsBtn')?.addEventListener('click', () => {
  $id('homeScreen').style.display = 'none';
  $id('settingsPanel').style.display = 'flex';
});

$id('homeStatsBtn')?.addEventListener('click', () => {
  renderStatsScreen();
  $id('homeScreen').style.display = 'none';
  $id('statsScreen').style.display = 'block';
});

$id('homeCareerBtn')?.addEventListener('click', () => {
  $id('homeScreen').style.display = 'none';
  renderMetaUI();
  $id('metaOverlay').style.display = 'block';
});

$id('homeStoreBtn')?.addEventListener('click', () => {
  $id('homeScreen').style.display = 'none';
  renderStoreSheet();
  $id('storeOverlay').classList.remove('hidden');
});

// Stats screen close
$id('statsCloseBtn')?.addEventListener('click', () => {
  $id('statsScreen').style.display = 'none';
  $id('homeScreen').style.display = 'flex';
});

// Retreat to Base button (in pause menu)
$id('pauseRetreatBtn')?.addEventListener('click', () => {
  // V42: resume audio before confirm() — browser suspends AudioContext on dialog open
  // We'll re-suspend if they confirm (going to home), or stay resumed if they cancel
  resumeAudio();
  if (confirm('Retreat to Base? Your run progress will be saved.')) {
    _saveCareerStats();
    _checkAchievements();
    saveGame();
    // Stop auto-wave so it doesn't run in background
    _autoWave = false;
    clearTimeout(_autoWaveTimer);
    _autoWaveTimer = null;
    G.state.paused = false;
    $id('pauseMenuOverlay').style.display = 'none';
    $id('settingsPanel').style.display = 'none';
    renderHomeScreen();
    $id('homeScreen').style.display = 'flex';
    updateHUD();
  } else {
    // Cancelled — re-suspend since we're still paused
    suspendAudio();
  }
});

$id('orbitalBtn').addEventListener('click', () => {
  const s = G.state;
  if (s.wave < 20 && !G.state._orbPurchaseUnlocked) {
    showToast('Orbital unlocks at Wave 20 — or purchase Supporter Pack');
    return;
  }
  if (!s._orbUnlocked && ((s._orbKills || 0)) < 8) {
    showToast('Orbital unlocks at Wave 20 — or get Supporter Pack');
    return;
  }
  if (((s.abilities && s.abilities.orbitalCd || 0)) > 0) {
    showToast('Orbital cooling down');
    return;
  }
  ensureAudio();
  s._orbUnlocked = true;
  _questTick('orbital', 1); // Quest: orbital fired
  fireOrbitalWithReticle();
});

// ── Wave events ───────────────────────────────────────────────
function onWaveEnd() {
  const { reward, deep } = finishWave();
  renderWaveSummaryUI(reward, deep);

  // Check if any new troop class just became unlockable this wave
  const s = G.state;
  Object.keys(UNIT_UNLOCK_DEFS).forEach(function(id) {
    const def = UNIT_UNLOCK_DEFS[id];
    if (def.always || _isUnitUnlocked(s, id)) return;
    // Just crossed the wave threshold this wave
    if (def.waveReq && s.wave >= def.waveReq && (s.wave - 1) < def.waveReq) {
      setTimeout(function() {
        _sfxUnlockAvailable();
        showToast('🔓 ' + (UNIT_DEFS.find(function(u){return u.id===id;})||{name:''}).name + ' now available to unlock!');
      }, 1200);
    }
  });

  // Tactical warning at Wave 45 — armor scaling pivot incoming
  if (s.wave === 45) {
    setTimeout(function() {
      _showTacticalWarning(
        '⚠ ARMOR THRESHOLD INCOMING',
        'Wave 50+ enemy armor scales exponentially. Current weapons are 50% less effective against hardened units. Prestige or upgrade Heavy teams before the pivot.',
        '#ff3131'
      );
    }, 2000);
  }
  // Wave 50 confirmation
  if (s.wave === 50) {
    setTimeout(function() {
      _showTacticalWarning(
        '⚡ ARMOR SCALING ACTIVE',
        'Enemy HP and damage now scale exponentially. Standard rifles are below threshold — redeploy Heavy, Grenadier, or Sniper units.',
        '#ff8800'
      );
    }, 1500);
  }

  // Quest: no-damage tracking
  if (G.state.lastWaveStats && G.state.lastWaveStats.baseDamage === 0) {
    _questTick('nodamage', 1);
  }

  // Feature 3: Wave cleared fanfare
  _sfxWaveCleared();
  const banner = $id('waveClearedBanner');
  const sub    = $id('wcbSub');
  if (sub) sub.textContent = '+' + reward + ' CR · WAVE ' + (G.state.wave - 1);
  banner.classList.remove('show');
  void banner.offsetWidth; // reflow
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 1900);

  // Flash the whole battlefield green briefly
  const sky = $id('waveSky');
  if (sky) {
    sky.style.background = 'rgba(24,240,106,0.12)';
    sky.style.transition = 'background 0.1s';
    setTimeout(() => { sky.style.background = 'transparent'; sky.style.transition = 'background 1s'; }, 150);
  }

  showOverlay('summaryOverlay');
  const bossSky = $id('bossSky');
  if (bossSky) bossSky.style.display = 'none';
  setWeather(false);
  haptic('success');
  updateHUD();
  // Schedule auto-wave after summary dismiss
  _scheduleAutoWave();

  // Auto-close summary when auto-wave is on
  if (_autoWave) {
    const AUTO_CLOSE = AUTO_WAVE_DELAY - 0.5; // close summary just before wave fires
    let _summaryTimer = AUTO_CLOSE;
    let _summaryInterval = null;

    // Add/update countdown bar inside summary
    const modal = document.querySelector('#summaryOverlay .modal');
    let countBar = document.getElementById('_sumCountBar');
    if (!countBar && modal) {
      countBar = document.createElement('div');
      countBar.id = '_sumCountBar';
      countBar.style.cssText = 'height:3px;background:rgba(255,255,255,.08);border-radius:2px;margin-top:10px;overflow:hidden;';
      countBar.innerHTML = '<div id="_sumCountFill" style="height:100%;background:var(--green);border-radius:2px;width:100%;transition:width .5s linear;"></div>';
      modal.appendChild(countBar);
    }

    _summaryInterval = setInterval(function() {
      _summaryTimer -= 0.25;
      const pct = Math.max(0, _summaryTimer / AUTO_CLOSE * 100);
      const fill = document.getElementById('_sumCountFill');
      if (fill) fill.style.width = pct + '%';
      if (_summaryTimer <= 0) {
        clearInterval(_summaryInterval);
        // Auto-dismiss if still open
        const overlay = $id('summaryOverlay');
        if (overlay && !overlay.classList.contains('hidden')) {
          $id('continueBtn').click();
        }
      }
    }, 250);
  }
}

function onGameOver() {
  const gradeInfo = triggerGameOver();
  renderGameOverUI(gradeInfo);
  showOverlay('gameoverOverlay');
  setWeather(false);
  haptic('error'); // #10
  updateHUD();
}

// ── Swap sheet ─────────────────────────────────────────────────
let _swapTarget = null;
let _swapFromBarracks = false; // track whether swap was opened from barracks roster

function openSwapSheet(troop, fromBarracks) {
  _swapFromBarracks = !!fromBarracks;
  const backBtn = $id('swap-back-btn');
  if (backBtn) backBtn.style.display = _swapFromBarracks ? 'block' : 'none';
  _swapTarget = troop;
  const s = G.state;
  const bandNames = ['Rear','Mid','Front'];
  const slotNames = ['Back-Left','Back-Right','Front-Left','Front-Center','Front-Right'];

  $id('swap-subtitle').textContent =
    troop.type.name + ' · ' + bandNames[troop.lane] + ' · ' + slotNames[Math.min(troop.slot,4)];

  // Show current unit info + dismiss button
  const curEl = $id('swap-current');
  const hpPct = Math.round(troop.hp / troop.maxHp * 100);
  const hpCol = hpPct > 60 ? 'var(--green)' : hpPct > 30 ? 'var(--amber)' : 'var(--red)';
  curEl.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid ' + troop.type.color + '44;border-radius:10px;background:rgba(0,0,0,.3)">' +
      '<div style="width:12px;height:12px;border-radius:50%;background:' + troop.type.color + ';box-shadow:0 0 8px ' + troop.type.color + ';flex-shrink:0"></div>' +
      '<div style="flex:1">' +
        '<div style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:14px;color:' + troop.type.color + '">' + troop.type.name + '</div>' +
        '<div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;color:' + hpCol + '">' + hpPct + '% HP</div>' +
      '</div>' +
      '<button id="swapDismissBtn" style="padding:6px 12px;border-radius:8px;border:1px solid var(--red);background:rgba(255,60,60,.1);color:var(--red);font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:12px;cursor:pointer;-webkit-appearance:none">✕ Dismiss</button>' +
    '</div>';

  document.getElementById('swapDismissBtn').addEventListener('click', () => {
    if (!_swapTarget) return;
    const idx = s.troops.indexOf(_swapTarget);
    if (idx !== -1) {
      s.troops.splice(idx, 1);
      // Re-slot remaining troops in that lane
      s.troops.filter(t => t.lane === _swapTarget.lane).forEach((t, i) => { t.slot = i; });
      showToast(_swapTarget.type.name + ' dismissed');
      haptic('medium');
    }
    closeSheet('swap-sheet', 'swap-backdrop');
    _swapTarget = null;
    updateHUD();
  });

  // Show replacement options
  const list = $id('swap-list');
  list.innerHTML = '';
  _initUnlockState(s);

  UNIT_DEFS.forEach(function(def) {
    if (!_isUnitUnlocked(s, def.id)) return; // only show unlocked classes
    if (def.id === troop.type.id) return;
    const cost = troopCost(def);
    const canAfford = s.credits >= cost;
    const card = document.createElement('div');
    card.className = 'troop-card' + (canAfford ? '' : ' disabled');
    card.style.marginBottom = '8px';
    card.innerHTML =
      '<div class="troop-dot" style="background:' + def.color + ';box-shadow:0 0 6px ' + def.color + '"></div>' +
      '<div class="troop-info">' +
        '<div class="troop-name" style="color:' + def.color + '">' + def.name + '</div>' +
        '<div class="troop-desc">' + def.desc + '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
        '<div class="troop-cost">' + cost + ' cr</div>' +
        '<button class="troop-deploy-btn" ' + (canAfford ? '' : 'disabled') + '>' + (canAfford ? 'Swap' : 'Need cr') + '</button>' +
      '</div>';
    card.querySelector('.troop-deploy-btn').addEventListener('click', () => {
      if (!_swapTarget || s.credits < cost) return;
      const idx = s.troops.indexOf(_swapTarget);
      if (idx !== -1) {
        const lane = _swapTarget.lane;
        const slot = _swapTarget.slot;
        s.troops.splice(idx, 1);
        s.credits -= cost;
        const newTroop = createTroop(def.id, lane, null, 0, slot);
        s.troops.splice(idx, 0, newTroop);
        showToast(troop.type.name + ' → ' + def.name);
        haptic('medium');
        playSfx('deploy');
      }
      const goBack = _swapFromBarracks;
      closeSheet('swap-sheet', 'swap-backdrop');
      _swapTarget = null;
      _swapFromBarracks = false;
      updateHUD();
      // Return to barracks if that's where we came from
      if (goBack) {
        setTimeout(function() {
          renderEnlistSheet();
          openSheet('enlist-sheet', 'enlist-backdrop');
        }, 200);
      }
    });
    list.appendChild(card);
  });

  openSheet('swap-sheet', 'swap-backdrop');
}

$id('swap-close').addEventListener('click', () => {
  closeSheet('swap-sheet', 'swap-backdrop');
  _swapTarget = null;
});

// Backdrop tap closes swap sheet
$id('swap-backdrop').addEventListener('click', () => {
  closeSheet('swap-sheet', 'swap-backdrop');
  _swapTarget = null;
});

// Back to Barracks button
try {
  $id('swap-back-btn').addEventListener('click', function() {
    closeSheet('swap-sheet', 'swap-backdrop');
    _swapTarget = null;
    setTimeout(function() {
      renderEnlistSheet();
      openSheet('enlist-sheet', 'enlist-backdrop');
    }, 180);
  });
} catch(e) {}
function showCountdown(isBoss, callback) {
  const el = $id('waveCountdown');
  if (!el) { callback(); return; }
  const nums = isBoss ? ['⚠', '3', '2', '1', '▶'] : ['3', '2', '1', '▶'];
  let idx = 0;
  const colors = isBoss
    ? ['#ff3c3c','#ff3c3c','#ff8800','#ffbe00','#18f06a']
    : ['#22d4ff','#ffbe00','#ff8800','#18f06a'];

  function showNext() {
    if (idx >= nums.length) { el.style.display = 'none'; callback(); return; }
    el.textContent = nums[idx];
    el.style.color = (colors[idx] !== undefined ? colors[idx] : '#18f06a');
    el.style.display = 'block';
    el.style.animation = 'none';
    requestAnimationFrame(() => {
      el.style.animation = 'countPop .85s ease-out forwards';
    });
    idx++;
    setTimeout(showNext, 700);
  }
  showNext();
}

// ── Screen shake ──────────────────────────────────────────────
function triggerShake(intensity = 'light') {
  const wrap = $id('battlefield-wrap');
  if (!wrap) return;
  wrap.classList.remove('screen-shake');
  void wrap.offsetWidth; // reflow to restart
  wrap.classList.add('screen-shake');
  setTimeout(() => wrap.classList.remove('screen-shake'), 400);
}

// ── Tutorial hint (first run only) ───────────────────────────
// ══════════════════════════════════════════════════════════════
// ONBOARDING — guided first 3 waves for new players
// Triggered only on first ever run (G.meta.totalRuns === 0)
// Steps: Wave 1 → Barracks, Wave 2 → Research, Wave 3 → dismiss
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// QUICK-BUY SYSTEM — one-time IAP unlock enables Buy All buttons
// IAP stub: _quickBuyUnlocked flag wired to real IAP later
// DEV MODE: set to true for testing — flip to false before release
// ══════════════════════════════════════════════════════════════
let _quickBuyUnlocked = localStorage.getItem('ifc_quickbuy') === '1';

function _unlockQuickBuy() {
  // IAP stub — in production this triggers RevenueCat purchase flow
  // For now simulate purchase with a confirm dialog
  if (_quickBuyUnlocked) return;
  const ok = confirm('Quick Buy Pack — $0.99\nUnlocks "Buy All" buttons on Research and Barracks.\nPurchase?');
  if (!ok) return;
  _quickBuyUnlocked = true;
  localStorage.setItem('ifc_quickbuy', '1');
  haptic('success');
  showToast('⚡ Quick Buy unlocked!');
  _updateQuickBuyButtons();
}

function _updateQuickBuyButtons() {
  const rb = $id('quickbuy-research-btn');
  const bb = $id('quickbuy-barracks-btn');
  if (rb) rb.style.display = _quickBuyUnlocked ? 'block' : 'none';
  if (bb) bb.style.display = _quickBuyUnlocked ? 'block' : 'none';
}

function _quickBuyResearch() {
  // Purchase all affordable upgrades not already maxed/queued
  const s = G.state;
  let bought = 0, spent = 0;
  UPGRADE_DEFS.forEach(function(def) {
    const maxLvl = def.id === 'fortify' ? 8 : def.id === 'weapons' || def.id === 'training' ? 6 : 5;
    const curLvl = s.upgrades[def.id];
    if (curLvl >= maxLvl) return;
    if (_researchQueueStatus(def.id, false, -1)) return;
    if (_researchQueue.length >= 3) return;
    const cost = upgradeCost(def);
    if (s.credits < cost) return;
    const prereq = def.id === 'fortify' ? getFortifyPrereq(curLvl) : null;
    if (prereq && !prereq.check(s)) return;
    const secs = _researchSeconds(curLvl + 1);
    s.credits -= cost;
    if (secs === 0) {
      buyUpgrade(def.id);
    } else {
      _researchQueue.push({ id: def.id, isLane: false, lane: -1, completesAt: Date.now() + secs * 1000, totalMs: secs * 1000, level: curLvl + 1, name: def.name });
    }
    bought++; spent += cost;
  });
  // Flash button for confirmation
  var btn = $id('quickbuy-research-btn');
  if (btn) {
    btn.style.background = bought > 0 ? 'rgba(24,240,106,.25)' : 'rgba(255,60,60,.15)';
    btn.style.borderColor = bought > 0 ? 'var(--green)' : 'var(--red)';
    setTimeout(function() { btn.style.background = ''; btn.style.borderColor = ''; }, 800);
  }
  if (bought > 0) {
    haptic('success');
    showToast('⚡ ' + bought + ' upgrades queued — ' + spent + ' cr spent');
    renderResearchSheet(); updateHUD();
  } else {
    showToast('Nothing affordable to upgrade');
  }
}

function _quickBuyBarracks() {
  // Heal all + promote all affordable
  const s = G.state;
  let spent = 0, actions = 0;
  // Heal all
  s.troops.forEach(function(t) {
    const missing = t.maxHp - t.hp;
    if (missing <= 0) return;
    const cost = Math.ceil(missing * 0.8);
    if (s.credits < cost) return;
    s.credits -= cost; t.hp = t.maxHp;
    spent += cost; actions++;
  });
  // Promote all affordable (one tier each)
  s.troops.forEach(function(t) {
    const promoList = PROMO_TIERS[t.type.id];
    if (!promoList) return;
    const promoted = t._promoted || 0;
    const nextPromo = promoList[promoted];
    if (!nextPromo || s.credits < nextPromo.cost) return;
    s.credits -= nextPromo.cost;
    t.maxHp += nextPromo.hpBonus; t.hp += nextPromo.hpBonus;
    if (nextPromo.dmgBonus) t.type = Object.assign({}, t.type, { damage: (t.type.damage || 0) + nextPromo.dmgBonus });
    if (nextPromo.rateBonus) t.type = Object.assign({}, t.type, { fireRate: (t.type.fireRate || 1) * (1 - nextPromo.rateBonus) });
    t._promoted = promoted + 1;
    spent += nextPromo.cost; actions++;
  });
  if (actions > 0) {
    haptic('success');
    showToast('⚡ ' + actions + ' actions — ' + spent + ' cr spent');
    renderEnlistSheet(); updateHUD();
  } else {
    showToast('Nothing affordable right now');
  }
  // Flash button for confirmation
  var bbtn = $id('quickbuy-barracks-btn');
  if (bbtn) {
    bbtn.style.background = actions > 0 ? 'rgba(24,240,106,.25)' : 'rgba(255,60,60,.15)';
    bbtn.style.borderColor = actions > 0 ? 'var(--green)' : 'var(--red)';
    setTimeout(function() { bbtn.style.background = ''; bbtn.style.borderColor = ''; }, 800);
  }
}

// Wire quick-buy buttons
try {
  $id('quickbuy-research-btn').addEventListener('click', function() {
    if (!_quickBuyUnlocked) { _unlockQuickBuy(); return; }
    _quickBuyResearch();
  });
  $id('quickbuy-barracks-btn').addEventListener('click', function() {
    if (!_quickBuyUnlocked) { _unlockQuickBuy(); return; }
    _quickBuyBarracks();
  });
  _updateQuickBuyButtons();
} catch(e) {}

const OB_KEY = 'ifc_ob_done';

// ── Onboarding steps ──────────────────────────────────────────
// spotlight: {type:'base-left'|'base-right'|'action-btn'|'none', id?}
// freeAction: what to do automatically when step activates
const OB_STEPS = [
  {
    step: '1 of 4', title: 'Deploy Your Troops',
    body: 'Tap the glowing BARRACKS building at the bottom left. Your first Rifle Squad in each lane is free — no credits needed.',
    arrow: 'down', cardPos: 'top:18%',
    spotlight: 'barracks',
    waitForAction: 'barracks',
    actionLabel: '▼ Tap Barracks',
  },
  {
    step: '2 of 4', title: 'Research an Upgrade — Free!',
    body: 'Tap the RESEARCH LAB at the bottom right. Weapon Calibration Lv1 will be applied free of charge.',
    arrow: 'down', cardPos: 'top:18%',
    spotlight: 'research',
    waitForAction: 'research',
    actionLabel: '▼ Tap Research Lab',
  },
  {
    step: '3 of 4', title: 'Launch the First Wave',
    body: 'Tap the green LAUNCH WAVE button below to begin. Your troops fire automatically.',
    arrow: null, cardPos: 'top:35%',
    spotlight: 'wave',
    waitForAction: 'wave',
    actionLabel: '▼ Tap Launch Wave',
  },
  {
    step: '4 of 4', title: "You're Ready, Commander",
    body: 'Survive each wave, earn credits, unlock new unit classes in the Barracks, and upgrade your base.',
    arrow: null, cardPos: 'top:30%',
    spotlight: 'none',
    waitForAction: null,
    actionLabel: "Let's go ▶",
  },
];

let _obStep  = 0;
let _obActive = false;
let _obDone   = false;

function _isFirstRun() {
  return G.meta.totalRuns === 0;
}

function _obDismiss() {
  localStorage.setItem(OB_KEY, '1');
  _obActive = false;
  _obDone   = true;
  const overlay = $id('onboarding-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .4s';
    setTimeout(function() {
      overlay.classList.remove('active');
      overlay.style.opacity = '';
      overlay.style.transition = '';
    }, 400);
  }
}

// Compute spotlight rect for a given target type
function _obGetSpotlightRect(target) {
  const bfRect = canvas ? canvas.getBoundingClientRect() : null;
  if (!bfRect) return null;

  if (target === 'barracks') {
    const r = _baseHitRects.barracks;
    if (!r) return null;
    const scaleX = bfRect.width  / (canvas.width  / (window.devicePixelRatio||1));
    const scaleY = bfRect.height / (canvas.height / (window.devicePixelRatio||1));
    return {
      x: bfRect.left + r.x * scaleX,
      y: bfRect.top  + r.y * scaleY,
      w: r.w * scaleX,
      h: r.h * scaleY,
    };
  }
  if (target === 'research') {
    const r = _baseHitRects.research;
    if (!r) return null;
    const scaleX = bfRect.width  / (canvas.width  / (window.devicePixelRatio||1));
    const scaleY = bfRect.height / (canvas.height / (window.devicePixelRatio||1));
    return {
      x: bfRect.left + r.x * scaleX,
      y: bfRect.top  + r.y * scaleY,
      w: r.w * scaleX,
      h: r.h * scaleY,
    };
  }
  if (target === 'wave') {
    const btn = $id('waveBtn');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }
  return null;
}

function _obUpdateSpotlight(target) {
  const sp = $id('ob-spotlight');
  if (!sp) return;
  if (!target || target === 'none') {
    sp.style.background = 'rgba(0,0,0,.7)';
    sp.style.webkitMaskImage = '';
    sp.style.maskImage = '';
    return;
  }
  const rect = _obGetSpotlightRect(target);
  if (!rect) {
    sp.style.background = 'rgba(0,0,0,.72)';
    return;
  }
  // Convert to % of viewport for the mask
  const cx = ((rect.x + rect.w/2) / window.innerWidth  * 100).toFixed(1) + '%';
  const cy = ((rect.y + rect.h/2) / window.innerHeight * 100).toFixed(1) + '%';
  const rw = Math.max(rect.w * 0.65, 40);
  const rh = Math.max(rect.h * 0.65, 40);
  const mask = 'radial-gradient(ellipse ' + rw + 'px ' + rh + 'px at ' + cx + ' ' + cy + ', transparent 0%, transparent 80%, rgba(0,0,0,.75) 100%)';
  sp.style.background = 'rgba(0,0,0,.78)';
  sp.style.webkitMaskImage = mask;
  sp.style.maskImage = mask;

  // Draw a pulsing amber ring around the target
  const ring = $id('ob-target-ring');
  if (ring) {
    ring.style.cssText =
      'position:fixed;pointer-events:none;z-index:92;border-radius:10px;' +
      'left:' + (rect.x - 6) + 'px;top:' + (rect.y - 6) + 'px;' +
      'width:' + (rect.w + 12) + 'px;height:' + (rect.h + 12) + 'px;' +
      'border:2.5px solid var(--amber);' +
      'box-shadow:0 0 16px rgba(255,190,0,.5),inset 0 0 12px rgba(255,190,0,.08);' +
      'animation:obRingPulse 1.2s ease-in-out infinite;';
  }
}

function _obShowStep(idx) {
  if (idx >= OB_STEPS.length) { _obDismiss(); return; }
  // Don't re-show if already dismissed
  if (_obDone) return;

  const step   = OB_STEPS[idx];
  const overlay = $id('onboarding-overlay');
  const card    = $id('ob-card');
  const arrow   = $id('ob-arrow');

  if (!overlay || !card) return;
  _obActive = true;
  _obStep   = idx;

  overlay.classList.add('active');

  $id('ob-step').textContent  = step.step;
  $id('ob-title').textContent = step.title;
  $id('ob-body').textContent  = step.body;

  // Position card — reset first then apply
  card.removeAttribute('style');
  card.style.left = '50%';
  card.style.transform = 'translateX(-50%)';
  card.style.position = 'fixed';
  card.style.animation = 'none';
  // Force reflow then re-apply animation
  void card.offsetWidth;
  card.style.animation = 'obCardIn .3s cubic-bezier(.2,.8,.3,1)';
  // Apply vertical position from step
  const posKey = step.cardPos.split(':')[0]; // 'top' or 'bottom'
  const posVal = step.cardPos.split(':')[1]; // e.g. '18%'
  card.style[posKey] = posVal;
  if (posKey === 'top') card.style.bottom = 'auto';
  else card.style.top = 'auto';

  // Arrow
  if (arrow) {
    arrow.style.display = step.arrow ? 'block' : 'none';
    if (step.arrow) arrow.className = 'ob-arrow ' + step.arrow;
  }

  // Spotlight — update after a brief delay so hit rects are populated
  setTimeout(function() { _obUpdateSpotlight(step.spotlight); }, 150);

  // Wire button
  const nextBtn = $id('ob-next');
  const newBtn  = nextBtn.cloneNode(true);
  newBtn.textContent = step.waitForAction ? step.actionLabel : (step.actionLabel || 'Got it ▶');
  nextBtn.parentNode.replaceChild(newBtn, nextBtn);

  if (!step.waitForAction) {
    newBtn.style.opacity = '1';
    newBtn.style.pointerEvents = 'auto';
    newBtn.addEventListener('click', function() { _obShowStep(idx + 1); });
  } else {
    // Greyed — advances automatically when player takes the action
    newBtn.style.opacity = '0.35';
    newBtn.style.pointerEvents = 'none';
  }
}

// Called when player performs a tutorialized action
function _obActionTaken(action) {
  if (_obDone) return;
  if (!_obActive) return;
  const step = OB_STEPS[_obStep];
  if (step && step.waitForAction === action) {
    // Clear spotlight ring
    const ring = $id('ob-target-ring');
    if (ring) ring.style.border = 'none';
    setTimeout(function() { _obShowStep(_obStep + 1); }, 500);
  }
}

function showTutorialHint() {
  if (!_isFirstRun()) return;
  _obShowStep(0);
}

// Tutorial free deploy — called from deploy tab during step 0
// First rifle squad in each lane costs 0 credits during onboarding
function _obIsFreeDeployEligible(laneIdx) {
  if (!_obActive || _obStep !== 0) return false;
  const s = G.state;
  return s.troops.filter(function(t) { return t.lane === laneIdx; }).length === 0;
}

// Wire skip button
try {
  $id('ob-skip').addEventListener('click', function() { _obDismiss(); });
} catch(e) {}

function onPhaseWarning(visible) {
  $id('phaseWarning').style.display = visible ? 'block' : 'none';
}

// Floating unit tag — shows kills + rank on unit tap
function _showUnitTag(trp, x, y) {
  var existing = document.getElementById('_unitTag');
  if (existing) existing.remove();
  var promoted = trp._promoted || 0;
  var kills    = trp._kills || 0;
  var stars    = promoted > 0 ? '★'.repeat(Math.min(promoted, 5)) : '—';
  var el = document.createElement('div');
  el.id = '_unitTag';
  el.style.cssText =
    'position:fixed;left:' + x + 'px;top:' + (y - 60) + 'px;' +
    'transform:translateX(-50%);z-index:400;pointer-events:none;' +
    'background:rgba(5,8,4,.92);border:1px solid #00E5FF;border-radius:8px;' +
    'padding:5px 10px;white-space:nowrap;' +
    'box-shadow:0 0 12px rgba(0,229,255,.35);' +
    'opacity:0;transition:opacity .15s;';
  el.innerHTML =
    '<div style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:12px;color:#00E5FF">' + trp.type.name + '</div>' +
    '<div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;color:#c8d8c8">Kills: <span style="color:#FF3131">' + kills + '</span> &nbsp; Rank: <span style="color:#ffd166">' + stars + '</span></div>';
  document.body.appendChild(el);
  requestAnimationFrame(function() { el.style.opacity = '1'; });
  setTimeout(function() {
    el.style.opacity = '0';
    setTimeout(function() { el.remove(); }, 200);
  }, 2200);
}

function onBossAlert() {
  const b = $id('bossAlert');
  b.style.display = 'block';
  setTimeout(() => b.style.display = 'none', 5000);
  const sky = $id('bossSky');
  if (sky) sky.style.display = 'block';
  triggerShake('heavy');
  setTimeout(() => triggerShake('heavy'), 500);
  haptic('heavy');
  // Phase 2: EW static glitch on boss wave start
  _triggerBossGlitch();
}

// Boss EW glitch — red static interference for 600ms
function _triggerBossGlitch() {
  var app = $id('app');
  if (!app) return;
  app.classList.add('boss-glitch');
  setTimeout(function() { app.classList.remove('boss-glitch'); }, 600);
}

// Tactical warning overlay — Phase 3 armor pivot notification
function _showTacticalWarning(title, body, color) {
  var existing = document.getElementById('_tacticalWarn');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.id = '_tacticalWarn';
  el.style.cssText =
    'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);z-index:300;' +
    'background:rgba(5,4,3,.97);border:2px solid ' + (color||'#ff3131') + ';border-radius:14px;' +
    'padding:20px 22px;max-width:80vw;text-align:center;pointer-events:none;' +
    'box-shadow:0 0 40px ' + (color||'#ff3131') + '44;' +
    'opacity:0;transition:opacity .3s, transform .3s;';
  el.innerHTML =
    '<div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;letter-spacing:3px;' +
      'color:' + (color||'#ff3131') + ';text-transform:uppercase;margin-bottom:8px">⚠ TACTICAL WARNING</div>' +
    '<div style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:17px;' +
      'color:' + (color||'#ff3131') + ';margin-bottom:8px;line-height:1.2">' + title + '</div>' +
    '<div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;color:rgba(200,210,180,.8);line-height:1.6">' + body + '</div>';
  document.body.appendChild(el);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      el.style.opacity = '1';
      el.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
  setTimeout(function() {
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%,-50%) scale(0.9)';
    setTimeout(function() { el.remove(); }, 350);
  }, 5500);
  haptic('heavy');
}

// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
// ATMOSPHERIC PROGRESSION — Wave 1 vs Wave 100
// Sky, ground tint, and battlefield evolve as war escalates
// ══════════════════════════════════════════════════════════
const ATMOSPHERE_STAGES = [
  {
    wave: 1,
    skyGrad: ['#0a1a2e','#0d1a14'],   // Night — blue/green teal
    groundTint: 'rgba(0,0,0,0)',
    fogColor: 'transparent',
    smokeAlpha: 0,
    label: 'Dawn Perimeter',
  },
  {
    wave: 11,
    skyGrad: ['#1a1008','#0a1208'],   // Dusk orange creeps in
    groundTint: 'rgba(40,20,0,0.08)',
    fogColor: 'rgba(200,140,60,0.04)',
    smokeAlpha: 0.05,
    label: 'Burning Horizon',
  },
  {
    wave: 21,
    skyGrad: ['#1a0808','#0a0e08'],   // Red war sky
    groundTint: 'rgba(60,10,0,0.12)',
    fogColor: 'rgba(200,80,40,0.07)',
    smokeAlpha: 0.10,
    label: 'Red Sky Protocol',
  },
  {
    wave: 31,
    skyGrad: ['#200808','#100808'],   // Deep crimson
    groundTint: 'rgba(80,0,0,0.15)',
    fogColor: 'rgba(180,40,20,0.10)',
    smokeAlpha: 0.18,
    label: 'Siege Atmosphere',
  },
  {
    wave: 51,
    skyGrad: ['#180010','#0a0008'],   // Purple-black apocalypse
    groundTint: 'rgba(60,0,40,0.20)',
    fogColor: 'rgba(120,20,80,0.13)',
    smokeAlpha: 0.28,
    label: 'Iron Tide',
  },
  {
    wave: 71,
    skyGrad: ['#100010','#080008'],   // Near-black with purple
    groundTint: 'rgba(30,0,30,0.30)',
    fogColor: 'rgba(80,0,60,0.18)',
    smokeAlpha: 0.40,
    label: 'Endgame',
  },
  {
    wave: 91,
    skyGrad: ['#080008','#040004'],   // Total blackout
    groundTint: 'rgba(10,0,10,0.40)',
    fogColor: 'rgba(40,0,40,0.25)',
    smokeAlpha: 0.55,
    label: 'Beyond the Line',
  },
];

function _getAtmosphereStage(wave) {
  let stage = ATMOSPHERE_STAGES[0];
  for (const a of ATMOSPHERE_STAGES) { if (wave >= a.wave) stage = a; else break; }
  return stage;
}

let _lastAtmoWave = -1;
function _updateAtmosphere(wave) {
  if (wave === _lastAtmoWave) return;
  _lastAtmoWave = wave;

  const stage = _getAtmosphereStage(wave);
  const bfWrap = document.getElementById('battlefield-wrap');
  if (!bfWrap) return;

  // Sky gradient on the battlefield background
  bfWrap.style.transition = 'background 2s ease';
  bfWrap.style.background = 'linear-gradient(180deg, ' + stage.skyGrad[0] + ', ' + stage.skyGrad[1] + ')';

  // Ground tint overlay using waveSky div
  const sky = document.getElementById('waveSky');
  if (sky) {
    sky.style.transition = 'background 2s ease';
    sky.style.background = stage.groundTint;
  }

  // Smoke/fog particles increase with wave — update CSS variable
  document.documentElement.style.setProperty('--smoke-alpha', stage.smokeAlpha.toString());

  // Add a vignette pulse on chapter transitions
  const vignette = document.getElementById('damage-vignette');
  if (vignette && wave % 10 === 1 && wave > 1) {
    vignette.style.transition = 'opacity 0.1s';
    vignette.style.opacity = '0.4';
    setTimeout(() => { vignette.style.transition = 'opacity 2s'; vignette.style.opacity = ''; }, 200);
  }
}

// CHAPTER STRUCTURE — every 10 waves is a named chapter
// ══════════════════════════════════════════════════════════════
const CHAPTERS = [
  { wave:  1, name: 'First Contact',    desc: 'The enemy tests your perimeter. Hold the line.',                 color: '#22d4ff' },
  { wave: 11, name: 'Escalation',       desc: 'Armored units and air support enter the field.',                 color: '#ffbe00' },
  { wave: 21, name: 'Coordinated Push', desc: 'Multi-vector assaults. Every lane is a target.',                 color: '#ff8800' },
  { wave: 31, name: 'Siege Protocol',   desc: 'Boss-class units now appear in regular waves.',                  color: '#ff4444' },
  { wave: 41, name: 'Blackout War',     desc: 'Stealth and electronic warfare at full intensity.',              color: '#b060ff' },
  { wave: 51, name: 'Iron Tide',        desc: 'Relentless armored columns. No quarter given.',                  color: '#ff3c3c' },
  { wave: 61, name: 'The Purge',        desc: 'Swarm tactics and heavy armor simultaneously.',               color: '#ff2020' },
  { wave: 71, name: 'Endgame',          desc: 'Maximum threat. Your upgrades are the only advantage.',         color: '#ff0000' },
  { wave: 81, name: 'Beyond the Line',  desc: 'No doctrine predicts this. Adapt or fall.',                     color: '#ffffff' },
];

function _getChapter(wave) {
  let ch = CHAPTERS[0];
  for (const c of CHAPTERS) { if (wave >= c.wave) ch = c; else break; }
  return ch;
}

// ── Modifier stacking — more modifiers stack as waves increase ─
// Wave 1-4:   no modifier
// Wave 5-14:  1 modifier
// Wave 15-24: 1-2 modifiers
// Wave 25-39: 2 modifiers
// Wave 40+:   2-3 modifiers
function _getModifierCount(wave) {
  if (wave < 5)  return 0;
  if (wave < 15) return 1;
  if (wave < 25) return Math.random() < 0.4 ? 2 : 1;
  if (wave < 40) return 2;
  return Math.random() < 0.5 ? 3 : 2;
}

// Apply extra modifiers on top of the primary one (engine applies first already)
function _applyStackedModifiers(wave) {
  const s = G.state;
  const count = _getModifierCount(wave) - 1; // primary already applied by engine
  if (count <= 0) return [];

  const allMods = ['armored','air','scarcity','storm','surge','salvage','darkness','swarm'];
  const primary = s.currentModifier;
  const available = allMods.filter(m => m !== primary && m !== 'none');
  const picked = [];

  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    const modId = available.splice(idx, 1)[0];
    const mod = WAVE_MODIFIERS.find(m => m.id === modId);
    if (mod) { mod.apply(s); picked.push(mod); }
  }
  return picked;
}

function onModifier(mod) {
  const banner = $id('eventBanner');
  const s = G.state;
  const wave = s.wave;

  // Weather
  setWeather(mod.id === 'storm');
  // Auto-rain at Wave 50+ regardless of modifier
  if (G.state && G.state.wave >= 50 && !_weatherActive) {
    setWeather(true);
  }
  // Update full atmosphere
  _updateAtmosphere(wave);

  // Apply stacked modifiers and collect them for display
  const extraMods = _applyStackedModifiers(wave);

  // Chapter milestone check — show chapter card on first wave of chapter
  const chapter = _getChapter(wave);
  const prevChapter = wave > 1 ? _getChapter(wave - 1) : null;
  const isNewChapter = !prevChapter || chapter.wave !== prevChapter.wave;

  if (isNewChapter && wave > 1) {
    _showChapterCard(chapter);
    return; // chapter card takes precedence over modifier banner
  }

  // Doctrine event banner (every 6 waves)
  if (wave >= 6 && wave % 6 === 0 && wave % CFG.BOSS_WAVE_EVERY !== 0) {
    const EVENTS = {
      blitz:'BLITZ: Rifles 2× faster', fortress:'FORTRESS: Barricades +50%',
      logistics:'SUPPLY: Kills +40%', ew:'JAM: Enemies enter slowed',
      artillery:'BARRAGE: Orbital recharges',
    };
    const txt = EVENTS[s.selectedDoctrine];
    if (txt) {
      banner.textContent = '★ ' + txt;
      banner.style.display = 'block';
      playSfx('event');
      setTimeout(() => banner.style.display = 'none', 6000);
      return;
    }
  }

  // Modifier stack banner
  if (mod.id !== 'none' || extraMods.length > 0) {
    const allNames = [mod.id !== 'none' ? mod.name : null, ...extraMods.map(m => m.name)].filter(Boolean);
    if (allNames.length > 0) {
      banner.textContent = '⚡ ' + allNames.join(' + ');
      banner.style.display = 'block';
      setTimeout(() => banner.style.display = 'none', 5000);
    }
  }
}

function _showChapterCard(chapter) {
  // Remove existing chapter card if any
  const existing = document.getElementById('_chapterCard');
  if (existing) existing.remove();

  const card = document.createElement('div');
  card.id = '_chapterCard';
  card.style.cssText =
    'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.85);z-index:200;' +
    'background:rgba(5,10,20,.97);border:1px solid ' + chapter.color + ';border-radius:16px;' +
    'padding:22px 28px;text-align:center;' +
    'box-shadow:0 0 40px ' + chapter.color + '44, 0 0 80px ' + chapter.color + '22;' +
    'pointer-events:none;opacity:0;transition:opacity .4s ease, transform .4s ease;max-width:78vw;';
  card.innerHTML =
    '<div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;letter-spacing:3px;color:' + chapter.color + ';opacity:.7;text-transform:uppercase;margin-bottom:8px">Chapter ' + Math.ceil(chapter.wave / 10) + '</div>' +
    '<div style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:26px;color:' + chapter.color + ';letter-spacing:1px;text-shadow:0 0 20px ' + chapter.color + ';line-height:1.1;margin-bottom:10px">' + chapter.name + '</div>' +
    '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;color:rgba(200,220,240,.6);line-height:1.5">' + chapter.desc + '</div>';

  document.body.appendChild(card);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
  setTimeout(() => {
    card.style.opacity = '0';
    card.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => card.remove(), 500);
  }, 4000);
  _sfxChapterTransition();
  haptic('heavy');
}

function onFirstRunHint() {
  const b = $id('eventBanner');
  b.textContent = 'Tap BARRACKS to deploy troops · Tap RESEARCH to upgrade';
  b.style.display = 'block';
  setTimeout(() => b.style.display = 'none', 7000);
  showTutorialHint();
}

// ══════════════════════════════════════════════════════════════
// ── Fix: deployUnit sniper prestige gate bypass ───────────────
// Engine's deployUnit checks UNLOCKS.has(prestige,'u_sniper') which
// blocks sniper. We call this wrapper everywhere instead.
function _deployUnitPatched(id) {
  if (id === 'sniper') {
    const s = G.state;
    if (!s || !s.started) return;
    const def   = UNIT_DEFS.find(function(u) { return u.id === id; });
    const cost  = troopCost(def);
    const slots = UNLOCKS.troopSlots(s.prestige);
    if (laneTroopCount(s.selectedLane) >= slots)
      return G.log(laneName(s.selectedLane) + ' lane at capacity.', 'warn');
    if (s.credits < cost)
      return G.log('Need ' + Math.ceil(cost - s.credits) + ' more cr.', 'warn');
    s.credits -= cost;
    s.troops.push(createTroop(id, s.selectedLane));
    // Track deployment for stats
    GAME_STATS.troops_deployed_run += 1;
    if (GAME_STATS.troops_by_type[id] !== undefined) GAME_STATS.troops_by_type[id] += 1;
    G.log(def.name + ' deployed. -' + cost + ' cr', 'good');
    playSfx('deploy');
    return;
  }
  deployUnit(id);
}

// BALANCE PATCH — Enemy scaling post-spawn hook
// The engine's enemyTemplate() uses linear tough = 1 + wave*0.10.
// We intercept after spawnEnemy() pushes to s.enemies and apply
// steeper curves. Early game (W1-4) unchanged.
// ══════════════════════════════════════════════════════════════
function _toughness(wave) {
  // Linear phase W1-49, exponential pivot at W50 — forces prestige loop
  if (wave < 50) {
    return 1 + wave * 0.12 + 0.004 * Math.pow(wave, 1.65);
  }
  // Exponential: base of W49 × 1.1^(wave-49)
  var base49 = 1 + 49 * 0.12 + 0.004 * Math.pow(49, 1.65);
  return base49 * Math.pow(1.10, wave - 49);
}
function _dmgScale(wave) {
  if (wave < 50) {
    return 1 + wave * 0.032 + 0.0008 * Math.pow(wave, 1.5);
  }
  var base49 = 1 + 49 * 0.032 + 0.0008 * Math.pow(49, 1.5);
  return base49 * Math.pow(1.08, wave - 49);
}
function _spdScale(wave) {
  return 1 + Math.max(0, wave - 10) * 0.008;
}

// Patch wrapper — replaces the game loop call with a version that
// intercepts new enemies and applies steeper scaling curves.
// Called from the RAF loop below as _patchedUpdate instead of update.
const _origUpdate = update;
function _patchedUpdate(dt, canvas, onWaveEnd, onGameOver, onPhaseWarn) {
  const s = G.state;
  if (!s) return;
  const prevCount  = s.enemies.length;
  const prevBaseHp = s.baseHp;

  // Track enemies alive before update for death detection
  const prevEnemies = s.enemies.slice();

  try {
    _origUpdate(dt, canvas, onWaveEnd, onGameOver, onPhaseWarn);
  } catch(e) {
    console.error('Update error:', e);
    // Failsafe: if update crashed, check for wave stall
    if (s.waveInProgress && s.enemiesToSpawn <= 0 && s.enemies.length === 0) {
      console.warn('Wave stall detected after crash — forcing wave end');
      try { onWaveEnd?.(); } catch(e2) { console.error('onWaveEnd failsafe error:', e2); }
    }
    return;
  }

  // Wave stall safeguard — if wave is in progress but no enemies and nothing to spawn
  if (s.waveInProgress && s.enemiesToSpawn <= 0 && s.enemies.length === 0) {
    if (!s._stallCheck) { s._stallCheck = performance.now(); }
    else if (performance.now() - s._stallCheck > 2000) {
      console.warn('Wave stall detected — forcing wave end');
      s._stallCheck = null;
      try { onWaveEnd?.(); } catch(e2) { console.error('onWaveEnd stall error:', e2); }
    }
  } else {
    s._stallCheck = null;
  }

  // Spawn death decals for enemies that died this frame
  if (s && prevEnemies.length > s.enemies.length) {
    try {
      var bCanvas2 = (typeof canvas !== 'undefined') ? canvas : null;
      for (var dei = 0; dei < prevEnemies.length; dei++) {
        var de = prevEnemies[dei];
        if (de.hp > 0) continue;
        if (s.enemies.indexOf(de) !== -1) continue;
        // Compute lane X directly — canvas width split into 3 columns
        var dex, dey2;
        if (bCanvas2) {
          var dpr2  = window.devicePixelRatio || 1;
          var bW    = bCanvas2.width;
          var bH2   = bCanvas2.height;
          var colW2 = bW / 3;
          dex  = colW2 * (de.lane + 0.5);
          var treeH2  = bH2 * 0.18;
          var baseH2  = bH2 * 0.22;
          var ORIG_W2 = 1400;
          dey2 = treeH2 + ((ORIG_W2 - (de.x || 0)) / ORIG_W2) * (bH2 - baseH2 - treeH2);
          var kind2 = (de.kind === 'warden' || de.kind === 'juggernaut') ? 'oil' : 'rust';
          _addDeathDecal(dex, dey2, de.r || 12, kind2);
          if (de.kind === 'warden') {
            _addScorch(dex, dey2, (de.r || 12) * dpr2 * 2.5);
          }
        }
      }
    } catch(e2) {}
  }

  // Base breach sound — fires when base takes damage this frame
  if (s && s.baseHp < prevBaseHp && prevBaseHp > 0 && _audioUnlocked) {
    if (!s._lastBreachTime || s.time - s._lastBreachTime > 0.8) {
      s._lastBreachTime = s.time;
      _sfxBreachBase();
      triggerShake('medium');
      // Concrete dust puffs along base wall on breach
      try {
        var bCanvas = (typeof canvas !== 'undefined') ? canvas : null;
        if (bCanvas) {
          var bH = bCanvas.height, bDpr = window.devicePixelRatio || 1;
          var bY = (bH - bH * 0.22) / bDpr;
          for (var bdi = 0; bdi < 6; bdi++) {
            _addDustPuff(
              (0.15 + Math.random() * 0.7) * bCanvas.width / bDpr,
              bY + (Math.random() - 0.5) * 10
            );
          }
        }
      } catch(e2) {}
    }
  }

  // Apply elite init functions (one-time, first frame after spawn)
  for (const e of s.enemies) {
    if (e._elite && e._eliteInit) {
      e._eliteInit(e);
      delete e._eliteInit;
    }
    // Ironclad shield regen
    if (e._regenShield && e.maxShield > 0 && e.shield < e.maxShield) {
      e.shield = Math.min(e.maxShield, e.shield + 4 * dt);
    }
    // Phantom: re-cloak when not in melee range of base
    if (e._eliteKind === 'phantom' && e._phantomRange) {
      e.cloaked = e.x > e._phantomRange;
    }
  }

  // Death spawn — commander elites spawn conscripts
  const justDied = s._justDiedElites || [];
  s._justDiedElites = [];
  for (const dead of justDied) {
    if (dead._spawnsOnDeath && dead._spawnsOnDeath > 0) {
      for (let g = 0; g < dead._spawnsOnDeath; g++) {
        spawnEnemy();
        const rein = s.enemies[s.enemies.length - 1];
        if (rein) {
          rein.lane  = dead.lane;
          rein.x     = dead.x + (Math.random() - 0.5) * 60;
          rein.kind  = 'conscript';
          rein.color = '#e06060';
          rein._scaled = true;
          rein._spawnedByCommander = true;
        }
      }
    }
  }

  if (s.enemies.length > prevCount) {
    const w    = s.wave;
    const ratio = _toughness(w) / (1 + w * 0.10);
    const dmgR  = _dmgScale(w);
    const spdR  = _spdScale(w);

    for (let i = prevCount; i < s.enemies.length; i++) {
      const e = s.enemies[i];
      if (e._scaled) continue;
      try {
        e.hp      = Math.round(e.hp * ratio) || 10;
        e.maxHp   = e.hp;
        e.damage  = Math.round(e.damage * dmgR) || 1;
        e.speed   = (e.speed * spdR) || 30;
        e.r       = e.r || 14; // ensure radius is never undefined
        if (e.maxShield > 0) {
          const ns    = Math.round(e.maxShield * ratio * 0.85);
          e.shield    = ns;
          e.maxShield = ns;
        }
        e._scaled = true;

        // ── Elite variants — Chapter 4+ (wave 31+) ──────────
        if (w >= 31 && !e._elite) {
          const eliteRoll = Math.random();
          const eliteChance = Math.min(0.05 + (w - 31) * 0.004, 0.30);
          if (eliteRoll < eliteChance) {
            const eliteType = _pickEliteVariant(e.kind, w);
            if (eliteType) {
              Object.assign(e, eliteType);
              e._elite = true;
            }
          }
        }
      } catch(scaleErr) {
        console.warn('Enemy scale error:', scaleErr);
        e._scaled = true; // mark as scaled to prevent retry loop
      }
    }
  }
}

// Elite variant definitions — layered on top of base enemy
function _pickEliteVariant(kind, wave) {
  // Berserker: conscript/breacher that moves 40% faster, glows red
  if ((kind === 'breacher' || kind === 'conscript') && Math.random() < 0.5) {
    return { _eliteKind: 'berserker', speed: undefined, _eliteColor: '#ff2020',
      _eliteInit: function(e) { e.speed *= 1.4; e.color = '#ff4040'; } };
  }
  // Ironclad: juggernaut/phalanx with regenerating shield
  if ((kind === 'juggernaut' || kind === 'phalanx') && Math.random() < 0.5) {
    const shield = Math.round(40 + wave * 6);
    return { _eliteKind: 'ironclad', _eliteColor: '#60d0ff',
      shield, maxShield: shield, _regenShield: true };
  }
  // Marksman: overwatch with faster fire rate and more damage
  if (kind === 'overwatch' && Math.random() < 0.5) {
    return { _eliteKind: 'marksman', _eliteColor: '#ff8040',
      _eliteInit: function(e) { e._owFireRate *= 0.65; e.damage *= 1.4; e.color = '#ff8040'; } };
  }
  return null;
}

// ── Start / begin ─────────────────────────────────────────────
try { buildDoctrineCards(d => { applyDoctrine(); updateHUD(); }); } catch(e) { _showErr('buildDoctrineCards', e); }

$id('beginBtn').addEventListener('click', () => {
  ensureAudio();
  applyDoctrine();
  applyUpgrades();
  $id('startOverlay').classList.add('hidden');
  G.state.started = true;
  addLog('▶ Operation started.', 'system');
  showTutorialHint();
  _updateAutowavStrip();
  // Init quest + unlock systems
  _initQuestState(G.state);
  _initUnlockState(G.state);
  // Start ambient sound
  setTimeout(_startAmbient, 300);
  _updateAtmosphere(G.state.wave || 1);
  renderQuestBoard();
  // Start research timer tick — runs every second regardless of pause
  if (!window._researchTickInterval) {
    window._researchTickInterval = setInterval(function() {
      if (!G.state || !G.state.started) return;
      _tickResearchQueue();
      // Refresh research sheet timer display if open
      if (document.getElementById('research-sheet') &&
          document.getElementById('research-sheet').style.transform !== 'translateY(100%)') {
        renderResearchSheet();
      }
    }, 1000);
  }
  updateHUD();
});

$id('wipeBtn').addEventListener('click', () => {
  localStorage.removeItem(CFG.SAVE_KEY);
  localStorage.removeItem(CFG.META_KEY);
  localStorage.removeItem('ifc_ob_done');
  location.reload();
});

$id('metaStartBtn').addEventListener('click', () => {
  renderMetaUI();
  $id('metaOverlay').style.display = 'block';
});

$id('helpBtn').addEventListener('click', () => {
  $id('helpStartBtn').style.display = 'block';
  $id('helpClose2Btn').style.display = 'none';
  $id('helpOverlay').style.display = 'block';
});

// ── Summary overlay ───────────────────────────────────────────
function renderWaveSummaryUI(reward, deep) {
  const s    = G.state;
  const p    = s.lastWaveStats.lanePressure;
  const pMax = Math.max(...p, 1);
  const heaviest = p.indexOf(Math.max(...p));
  const lightest  = p.indexOf(Math.min(...p));
  const laneNames = ['Left','Center','Right'];
  const waveJustCleared = s.wave - 1;
  const nextWave = s.wave;

  // Title + chapter tag
  const chap = _getChapter(s.wave);
  const sumTitle = $id('sumTitle');
  if (sumTitle) { sumTitle.textContent = '✓ Wave ' + waveJustCleared + ' Cleared'; sumTitle.style.color = ''; }
  const chapTag = $id('sumChapterTag');
  if (chapTag) { chapTag.textContent = chap.name; chapTag.style.color = chap.color; }

  // Core stats — kills replaces "Hardest Lane" tile
  $id('sumWave').textContent    = waveJustCleared;
  $id('sumCredits').textContent = '+' + reward;
  $id('sumDamage').textContent  = Math.floor(s.lastWaveStats.baseDamage);
  const killsEl = $id('sumKills');
  if (killsEl) killsEl.textContent = s.lastWaveStats.kills || s.killsTotal || 0;

  // Good / advice cards
  const hpPct = s.baseHp / s.maxBaseHp;
  const sg = $id('sumGood');
  let good = '';
  if (s.lastWaveStats.baseDamage === 0) good = '✓ Perfect defense — no damage taken.';
  else if (hpPct > 0.85) good = '✓ Base at ' + Math.floor(hpPct*100) + '%. ' + laneNames[lightest] + ' held well.';
  sg.textContent = good; sg.style.display = good ? 'block' : 'none';

  const sa = $id('sumAdvice');
  let advice = '';
  if (p[heaviest]/pMax > 0.65 && laneTroopCount(heaviest) < 3)
    advice = laneNames[heaviest] + ' took most pressure and is understaffed.';
  else if (hpPct < 0.32) advice = 'Base integrity critical — heal troops and reinforce barricades.';
  else if (hpPct < 0.55) advice = 'Base took heavy damage. Consider healing or a Medic.';
  sa.textContent = advice ? '⚠ ' + advice : ''; sa.style.display = advice ? 'block' : 'none';

  // Next wave preview
  const nwEl = $id('sumNextWave');
  if (nwEl) {
    const isBossNext = nextWave % CFG.BOSS_WAVE_EVERY === 0;
    const modCount   = _getModifierCount(nextWave);
    const isNewChap  = _getChapter(nextWave).wave !== _getChapter(nextWave - 1).wave;
    let preview = '';
    if (isBossNext) {
      preview = '⚠ WAVE ' + nextWave + ' IS A BOSS WAVE\nSave your Orbital. Deploy heavy-damage units.';
    } else {
      const lines = ['▶ Next: Wave ' + nextWave];
      if (isNewChap) lines.push('★ New chapter: ' + _getChapter(nextWave).name);
      if (modCount >= 2) lines.push('⚡ Expect ' + modCount + ' stacked modifiers');
      else if (modCount === 1) lines.push('Modifier wave incoming');
      preview = lines.join('\n');
    }
    nwEl.textContent = preview;
    nwEl.style.display = 'block';
    nwEl.style.borderColor = isBossNext ? 'rgba(255,60,60,.4)' : 'rgba(255,190,0,.25)';
    nwEl.style.background  = isBossNext ? 'rgba(255,60,60,.06)' : 'rgba(255,190,0,.05)';
    nwEl.style.color       = isBossNext ? 'var(--red)' : 'var(--amber)';
  }

  // Research in progress
  const resEl = $id('sumResearch');
  if (resEl) {
    if (_researchQueue.length > 0) {
      const lines = _researchQueue.map(function(r) {
        const secsLeft = Math.max(0, Math.ceil((r.completesAt - Date.now()) / 1000));
        return '🔬 ' + r.name + ' — ' + _fmtTime(secsLeft);
      });
      resEl.textContent = lines.join('\n');
      resEl.style.display = 'block';
    } else {
      resEl.style.display = 'none';
    }
  }

  // Lane pressure bars
  $id('sumPressure').innerHTML = [0,1,2].map(function(i) {
    const cols = ['var(--lt)','var(--lm)','var(--lb)'];
    const pct  = (p[i]/pMax*100).toFixed(0);
    return '<div class="pressure-row"><span class="p-label" style="color:' + cols[i] + '">' + laneNames[i].slice(0,3).toUpperCase() + '</span><div class="p-bar-wrap"><div class="p-bar" style="width:' + pct + '%;background:' + cols[i] + '"></div></div><span style="font-size:9px;color:var(--muted);font-family:\'Share Tech Mono\',monospace;width:28px;text-align:right">' + pct + '%</span></div>';
  }).join('');

  // Next action hint
  const sn = $id('sumNextAction');
  if (sn) { sn.style.display = 'none'; }
}

$id('continueBtn').addEventListener('click', () => {
  hideOverlay('summaryOverlay');
  const s = G.state;
  // V71: show reward overlay only on boss waves, using context built by finishWave()
  const ctx = s._pendingRewardContext;
  if (ctx && ctx.bossWave) {
    renderRewardChoiceUI(() => { hideOverlay('rewardOverlay'); updateHUD(); });
    showOverlay('rewardOverlay');
  }
});

// Update 3: Deploy Now shortcut — opens Barracks without dismissing summary
$id('sumDeployBtn').addEventListener('click', () => {
  hideOverlay('summaryOverlay');
  renderEnlistSheet();
  openSheet('enlist-sheet', 'enlist-backdrop');
});

// ── Reward choice ─────────────────────────────────────────────
function renderRewardChoiceUI(onPick) {
  const { picks, mastery, doc } = buildRewardChoices();
  const rWave = G.state.wave - 1;
  const tierLabel = rWave < 10 ? 'Basic Intel' : rWave < 20 ? 'Field Upgrades' : rWave < 30 ? 'Advanced Protocols' : rWave < 40 ? 'Elite Programs' : 'Classified Assets';
  const exclAvail = mastery >= 7 && rWave >= 40;
  $id('rewardSub').textContent = exclAvail
    ? 'Mastery unlocked — doctrine exclusives available.'
    : '◆ Wave ' + rWave + ' · ' + tierLabel + (mastery >= 3 ? ' · Synergy active' : '');
  const grid = $id('rewardGrid');
  grid.innerHTML = '';
  picks.forEach(p => {
    const isSyn  = p.docSynergy.includes(doc) && !p.docExclusive;
    const isExcl = p.docExclusive === doc;
    const isRare = p.tier === 3;
    const card   = document.createElement('div');
    card.className = 'choice-card' + (isExcl||isRare ? ' rare-card' : isSyn ? ' syn-card' : '');
    card.innerHTML =
      '<div class="choice-title">' + (isRare ? '★ ' : '') + p.name + '</div>' +
      '<div class="choice-body">' + p.text + '</div>' +
      (isExcl ? '<div class="rare-label">⚡ Exclusive</div>' : isSyn ? '<div class="syn-label">◆ Synergy</div>' : isRare ? '<div class="rare-label">★ Rare</div>' : '') +
      '<div style="margin-top:8px"><button class="mBtn ' + (isRare||isExcl ? 'purple' : 'good') + '" style="font-size:13px;padding:9px">Select</button></div>';
    card.querySelector('button').addEventListener('click', () => {
      applyReward(p);
      if(onPick)onPick();
    });
    grid.appendChild(card);
  });
}

// ── Game over ─────────────────────────────────────────────────
function renderGameOverUI(gradeInfo) {
  const s = G.state, m = G.meta;
  const { grade, color, bg, tip, gain } = gradeInfo;
  const chap = _getChapter(s.wave);

  // Title — reflects chapter
  const titleEl = $id('goTitle');
  if (titleEl) titleEl.textContent = '✕ Base Destroyed — ' + chap.name;

  const chapLine = $id('goChapterLine');
  if (chapLine) { chapLine.textContent = 'Chapter ' + Math.ceil(chap.wave/10) + ' · Wave ' + s.wave; chapLine.style.color = chap.color; }

  // Core stats
  $id('goWave').textContent      = s.wave;
  $id('goRank').textContent      = m.prestige;
  $id('goKills').textContent     = s.killsTotal.toLocaleString();
  $id('goBossKills').textContent = (s.bossKills || 0);
  $id('goCreditsEarned').textContent = (s.creditsEarned || 0).toLocaleString();
  $id('goDoctrine').textContent  = (DOCTRINES.find(function(d){return d.id===s.selectedDoctrine;})||{name:'—'}).name;

  // Chapter stat
  const chapEl = $id('goChapter');
  if (chapEl) { chapEl.textContent = chap.name; chapEl.style.color = chap.color; }

  // Grade box
  const gBox = $id('goGradeBox');
  gBox.style.borderColor = color; gBox.style.background = bg;
  $id('goGradeLetter').textContent = grade;
  $id('goGradeLetter').style.color = color;

  // Death cause — what killed you
  const causeEl = $id('goDeathCause');
  if (causeEl) {
    const mod = WAVE_MODIFIERS.find(function(m) { return m.id === s.currentModifier; });
    const isBoss = s.wave % CFG.BOSS_WAVE_EVERY === 0;
    let cause = '⚠ Cause of defeat\n';
    if (isBoss) cause += 'Boss wave ' + s.wave + ' overwhelmed the base.';
    else if (mod && mod.id !== 'none') cause += 'Wave ' + s.wave + ' with ' + mod.name + ' modifier breached the perimeter.';
    else cause += 'Wave ' + s.wave + ' enemy forces broke through.';
    const dmg = (s.lastWaveStats && s.lastWaveStats.baseDamage || 0);
    if (dmg > 0) cause += '\nFinal wave dealt ' + Math.floor(dmg) + ' damage to the base.';
    causeEl.textContent = cause;
    causeEl.style.display = 'block';
  }

  // Best troop this run
  const bestEl = $id('goBestTroop');
  if (bestEl && s.troops && s.troops.length > 0) {
    // Find most-promoted troop, break ties by HP%
    const best = s.troops.reduce(function(a, b) {
      const ap = (a._promoted || 0), bp = (b._promoted || 0);
      if (ap !== bp) return ap > bp ? a : b;
      return (a.hp / a.maxHp) > (b.hp / b.maxHp) ? a : b;
    });
    const posNames = ['Left','Center','Right'];
    const hpPct = Math.round(best.hp / best.maxHp * 100);
    const promoLabel = best._promoted > 0 ? ' (★ Promoted)' : '';
    bestEl.textContent = '★ Best unit: ' + best.type.name + promoLabel + '\n' + posNames[best.lane] + ' position · ' + hpPct + '% HP remaining';
    bestEl.style.borderColor = best.type.color + '44';
    bestEl.style.color = best.type.color;
    bestEl.style.display = 'block';
  } else if (bestEl) {
    bestEl.style.display = 'none';
  }

  // Lane pressure
  const laneNames  = ['Left','Ctr','Right'];
  const laneColors = ['var(--lt)','var(--lm)','var(--lb)'];
  const pressure   = (s.lastWaveStats && s.lastWaveStats.lanePressure || [0,0,0]);
  const maxP = Math.max(...pressure, 1);
  const laneDebrief = $id('goLaneDebrief');
  if (laneDebrief) {
    laneDebrief.innerHTML = laneNames.map(function(name, i) {
      const pct = Math.round(pressure[i] / maxP * 100);
      return '<div class="lane-debrief-item">' +
        '<div class="ldi-name" style="color:' + laneColors[i] + '">' + name + '</div>' +
        '<div class="ldi-kills" style="color:' + laneColors[i] + '">' + pct + '%</div>' +
        '<div class="ldi-bar-wrap"><div class="ldi-bar" style="width:' + pct + '%;background:' + laneColors[i] + '"></div></div>' +
      '</div>';
    }).join('');
  }

  $id('goRunTip').textContent = tip;
  $id('goPrestigePreview').textContent = gain > 0
    ? '★ Prestige available — advance to Rank ' + (m.prestige + gain) + ' and carry bonuses forward.'
    : 'Reach wave ' + CFG.PRESTIGE_WAVE_REQ + ' to unlock Prestige.';
  $id('goPrestigeBtn').disabled = gain <= 0;

  // Show one-tap prestige+play when available
  const ppBtn = $id('goPrestigePlayBtn');
  if (ppBtn) ppBtn.style.display = gain > 0 ? 'block' : 'none';
}

$id('goPrestigeBtn').addEventListener('click', () => {
  if (canPrestige()) { openPrestigeUI(); hideOverlay('gameoverOverlay'); }
});
$id('confirmPrestigeBtn').addEventListener('click', () => _runPrestigeCeremony());
$id('cancelPrestigeBtn').addEventListener('click', () => hideOverlay('prestigeOverlay'));
$id('prestigeContinueBtn').addEventListener('click', () => {
  ['prestigeOverlay','gameoverOverlay','summaryOverlay','rewardOverlay'].forEach(hideOverlay);
  $id('startOverlay').classList.remove('hidden');
  // Reset ceremony phase for next time
  $id('prestige-confirm-phase').style.display = 'block';
  $id('prestige-ceremony-phase').style.display = 'none';
  buildDoctrineCards(function(d) { applyDoctrine(); updateHUD(); });
  updateHUD();
});

function _runPrestigeCeremony() {
  const s = G.state, m = G.meta;
  const gain     = prestigeGain();
  const newRank  = m.prestige + gain;
  const newUnlocks = PERMANENT_UNLOCKS.filter(function(u) { return u.rank > m.prestige && u.rank <= newRank; });

  // Capture run stats BEFORE doPrestige resets state
  const runStats = {
    wave:     s.wave,
    kills:    s.killsTotal,
    bosses:   s.bossKills,
    credits:  s.creditsEarned,
    doctrine: (DOCTRINES.find(function(d){return d.id===s.selectedDoctrine;})||{name:'—'}).name,
    chapter:  _getChapter(s.wave).name,
    troops:   s.troops.length,
    maxPromo: s.troops.reduce(function(max, t) { return Math.max(max, t._promoted || 0); }, 0),
    oldRank:  m.prestige,
  };

  // Switch to ceremony phase
  $id('prestige-confirm-phase').style.display = 'none';
  $id('prestige-ceremony-phase').style.display = 'block';

  // Execute the actual prestige
  doPrestige(function() {});

  // Clear stale research queue (it's module-scoped, not on G.state)
  _researchQueue.length = 0;

  // Animate rank number counting up
  const rankEl = $id('prestige-rank-display');
  rankEl.textContent = runStats.oldRank;
  rankEl.style.color = 'var(--muted)';
  rankEl.style.textShadow = '';
  let currentDisplay = runStats.oldRank;

  let animStep = 0;
  const animInterval = setInterval(function() {
    animStep++;
    if (animStep <= gain) {
      currentDisplay++;
      rankEl.textContent = currentDisplay;
      rankEl.style.color = 'var(--purple)';
      rankEl.style.textShadow = '0 0 ' + (20 + animStep*10) + 'px rgba(136,85,232,.9)';
      haptic('light');
      playSfx('rankUp');
      // Flash screen on final rank
      if (animStep === gain) {
        document.body.style.background = 'rgba(136,85,232,.12)';
        setTimeout(function() { document.body.style.background = ''; }, 400);
      }
    } else {
      clearInterval(animInterval);
      haptic('success');
      playSfx('prestige');
    }
  }, 320);

  // New unlocks badges
  const unlockEl = $id('prestige-new-unlocks');
  if (newUnlocks.length > 0) {
    unlockEl.innerHTML = newUnlocks.map(function(u) {
      return '<div style="display:inline-block;margin:3px 4px;padding:5px 12px;border-radius:8px;' +
             'border:1px solid rgba(24,240,106,.5);background:rgba(24,240,106,.08);' +
             'font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:12px;color:var(--green)">' +
             '★ ' + u.name + '</div>';
    }).join('');
  } else {
    unlockEl.innerHTML = '<div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;color:var(--muted)">No new unlocks at this rank</div>';
  }

  // Rank-specific perks that activate this run
  const rankPerks = _getRankPerks(newRank);
  const bonusLines = [
    '⚡ +' + (newRank * CFG.PRESTIGE_INCOME_BONUS * 100).toFixed(0) + '% wave income',
    '⚔ +' + (newRank * CFG.PRESTIGE_DMG_BONUS * 100).toFixed(0) + '% all troop damage',
    '🛡 +' + (newRank * CFG.PRESTIGE_HP_BONUS * 100).toFixed(0) + '% all troop HP',
    '🔧 +' + (newRank * 3) + ' HP repaired per wave clear',
    '☄ Orbital damage +' + (newRank * CFG.ORBITAL_PRESTIGE_DMG) + ' permanently',
  ];
  if (rankPerks.length > 0) bonusLines.push(...rankPerks);
  const bonusEl = $id('prestige-bonuses');
  bonusEl.innerHTML = bonusLines.map(function(l) {
    return '<div style="color:' + (l.startsWith('+') ? 'var(--cyan)' : 'var(--amber)') + '">' + l + '</div>';
  }).join('');

  // Run recap
  $id('prestige-run-recap').innerHTML =
    '<div style="color:var(--cyan);margin-bottom:6px;letter-spacing:1px;font-weight:700">RUN DEBRIEF</div>' +
    '<div style="color:var(--text)">Doctrine: <span style="color:var(--amber)">' + runStats.doctrine + '</span></div>' +
    '<div>Chapter reached: <span style="color:var(--cyan)">' + runStats.chapter + '</span> · Wave ' + runStats.wave + '</div>' +
    '<div>Kills: <span style="color:var(--red)">' + runStats.kills.toLocaleString() + '</span> · Bosses: ' + runStats.bosses + '</div>' +
    '<div>Troops: ' + runStats.troops + (runStats.maxPromo > 0 ? ' · Best tier: <span style="color:#ffd166">' + '★'.repeat(runStats.maxPromo) + '</span>' : '') + '</div>' +
    '<div>Credits earned: ' + runStats.credits.toLocaleString() + '</div>';
}

// Returns human-readable perk lines for a given rank
function _getRankPerks(rank) {
  const perks = [];
  if (rank >= 1) perks.push('★ Veteran Stipend: +50 starting credits');
  if (rank >= 2) perks.push('★ Sniper Program: Sniper unlocks at Wave 20 (was 25)');
  if (rank >= 3) perks.push('★ Satellite Priority: Orbital damage permanently +22');
  if (rank >= 4) perks.push('★ Expanded Roster: Lane troop cap raised to 7');
  if (rank >= 5) perks.push('★ Supply Command: +10% income from all sources');
  if (rank >= 6) perks.push('★ Deep Strike Bonus: +30 cr per wave past Wave 15');
  if (rank >= 8) perks.push('★ Doctrine Refinement: All doctrine bonuses +5%');
  return perks.slice(-3); // show most recent 3 to keep card compact
}

// ── Doctrine cards (start screen) ─────────────────────────────
function buildDoctrineCards(onSelect) {
  const s = G.state, m = G.meta;
  const grid = $id('doctrineGrid');
  grid.innerHTML = '';
  const srl = $id('startRankLine');
  if (srl) srl.textContent = m.prestige > 0
    ? '★ Rank ' + m.prestige + ' · Troops +' + (m.prestige*15) + '% HP · +' + (m.prestige*14) + '% income · +' + (m.prestige*10) + '% dmg · ' + UNLOCKS.active(m.prestige).size + ' unlock(s) active'
    : 'Each doctrine has unique synergies, rewards, and weaknesses.';

  // Update 8: doctrine → accent color class map
  const DOC_CLASS = {
    blitz:'doc-blitz', fortress:'doc-fortress', logistics:'doc-logistics',
    ew:'doc-ew', artillery:'doc-artillery'
  };
  // Update 8: doctrine → accent color for icon/title
  const DOC_COLOR = {
    blitz:'#ff3c3c', fortress:'#22d4ff', logistics:'#18f06a',
    ew:'#b060ff', artillery:'#ffbe00'
  };

  DOCTRINES.forEach(d => {
    const mastery   = docMastery(m, d.id);
    const docClass  = DOC_CLASS[d.id] || '';
    const docColor  = DOC_COLOR[d.id] || 'var(--text)';
    const card = document.createElement('div');
    card.className = 'choice-card ' + docClass + (d.id === s.selectedDoctrine ? ' selected' : '');
    card.innerHTML =
      '<div class="choice-title" style="color:' + docColor + '">' + d.icon + ' ' + d.name +
        '<span style="font-size:9px;color:' + d.diffColor + ';background:rgba(0,0,0,.3);padding:1px 5px;border-radius:3px;margin-left:4px">' + d.difficulty + '</span>' +
        (mastery > 0 ? '<span style="color:var(--purple);font-size:9.5px;margin-left:4px">\xd7' + mastery + '</span>' : '') +
      '</div>' +
      '<div class="choice-body">' + d.tagline + '</div>' +
      '<div style="font-size:9.5px;color:var(--muted);margin-top:3px">' + d.effects.slice(0,3).join(' · ') + '</div>' +
      '<div style="font-size:9.5px;color:' + docColor + ';opacity:.8;margin-top:2px">▲ ' + d.synergy + '</div>';
    card.addEventListener('click', () => {
      s.selectedDoctrine = d.id;
      document.querySelectorAll('#doctrineGrid .choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if(onSelect)onSelect(d);
    });
    grid.appendChild(card);
  });
}

// ── Meta screen ───────────────────────────────────────────────
function renderMetaUI() {
  const m = G.meta, s = G.state;
  $id('metaRank').textContent     = m.prestige;
  $id('metaNextRank').textContent = m.prestige + 1;
  const prog = Math.min(100, (s.wave / CFG.PRESTIGE_WAVE_REQ) * 100);
  $id('rankBar').style.width = prog + '%';
  $id('rankBonusText').textContent =
    '+' + (m.prestige*CFG.PRESTIGE_INCOME_BONUS*100).toFixed(0) + '% income, +' + (m.prestige*CFG.PRESTIGE_DMG_BONUS*100).toFixed(0) + '% damage.';
  const nextU = PERMANENT_UNLOCKS.find(u => m.prestige < u.rank);
  $id('nextUnlockText').textContent = nextU
    ? 'Next unlock Rank ' + nextU.rank + ': ' + nextU.name
    : 'All unlocks achieved!';
  $id('mTotalRuns').textContent = m.totalRuns;
  $id('mBestWave').textContent  = m.bestWave;
  $id('mKills').textContent     = m.totalKills;
  $id('mBosses').textContent    = m.totalBosses;
  const fav = Object.entries(m.docRuns).sort((a,b)=>b[1]-a[1])[0];
  $id('mFavDoc').textContent = fav ? (DOCTRINES.find(function(d){return d.id===fav[0];})||{icon:'—'}).icon : '—';
  $id('mCredits').textContent = m.totalCredits.toLocaleString();
  $id('docMasteryGrid').innerHTML = DOCTRINES.map(function(d) {
    var r = m.docRuns[d.id] || 0;
    return '<div class="dm-card' + (r>0?' has-runs':'') + '"><div class="dm-icon">' + d.icon + '</div><div class="dm-name">' + d.name.split(' ')[0] + '</div><div class="dm-count">' + r + '</div></div>';
  }).join('');
  $id('unlockGrid').innerHTML = PERMANENT_UNLOCKS.map(function(u) {
    var has = m.prestige >= u.rank;
    return '<div class="unlock-card' + (has?' unlocked':'') + '"><div class="unlock-name">' + u.name + '</div><div class="tiny">' + u.desc + '</div><div class="tiny" style="color:' + (has?'var(--green)':'var(--muted)') + ';margin-top:2px">Rank ' + u.rank + '</div></div>';
  }).join('');

  const progressEl = $id('unlockProgress');
  if (progressEl) {
    const allUnlocks = PERMANENT_UNLOCKS.slice().sort(function(a,b){return a.rank-b.rank;});
    const upcoming   = allUnlocks.filter(function(u){return m.prestige < u.rank;}).slice(0, 5);
    const earned     = allUnlocks.filter(function(u){return m.prestige >= u.rank;});
    var pHtml =
      '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px">' +
        earned.length + '/' + allUnlocks.length + ' Unlocked · Rank ' + m.prestige +
      '</div>' +
      '<div style="height:4px;background:rgba(0,0,0,.4);border-radius:2px;margin-bottom:10px;overflow:hidden">' +
        '<div style="height:100%;width:' + Math.round(earned.length/allUnlocks.length*100) + '%;background:var(--purple);border-radius:2px;"></div>' +
      '</div>' +
      upcoming.map(function(u) {
        return '<div class="pul-row"><span class="pul-rank">R' + u.rank + '</span><span class="pul-name">' + u.name + '</span><span class="pul-todo">+' + (u.rank - m.prestige) + ' ranks</span></div>';
      }).join('') +
      (upcoming.length === 0 ? '<div class="tiny" style="color:var(--green)">✓ All unlocks achieved!</div>' : '');
    progressEl.innerHTML = pHtml;
  }
  $id('runHistory').innerHTML = m.runHistory.length === 0
    ? '<div class="tiny">No runs yet.</div>'
    : m.runHistory.map(function(r, i) {
        var doc = DOCTRINES.find(function(d){return d.id===r.doctrine;});
        return '<div class="history-row"><span style="color:var(--muted);font-family:\'Share Tech Mono\',monospace;font-size:9px">#' + (i+1) + '</span><span>' + (doc?doc.icon:'?') + ' ' + (doc?doc.name:r.doctrine) + '</span><span style="color:var(--cyan);margin-left:auto">W' + r.wave + '</span><span style="color:var(--muted);margin-left:8px">' + r.kills + 'k</span></div>';
      }).join('');
  $id('metaPrestigeBtn').disabled = s.wave < CFG.PRESTIGE_WAVE_REQ && !s.gameOver;
}

$id('metaCloseBtn').addEventListener('click', () => {
  $id('metaOverlay').style.display = 'none';
  G.state.paused = (G.state._pausedBeforeMeta || false);
  updateHUD();
});
$id('metaPrestigeBtn').addEventListener('click', () => {
  $id('metaOverlay').style.display = 'none';
  openPrestigeUI();
});
$id('metaNewRunBtn').addEventListener('click', () => {
  localStorage.removeItem(CFG.SAVE_KEY); location.reload();
});
document.querySelectorAll('[id^="metaBtn"],[id="metaStartBtn"]').forEach(btn => {
  btn.addEventListener('click', () => {
    G.state._pausedBeforeMeta = G.state.paused;
    G.state.paused = true;
    renderMetaUI();
    $id('metaOverlay').style.display = 'block';
  });
});

// ── Prestige UI ────────────────────────────────────────────────
$id('goNewRunBtn').addEventListener('click', () => { localStorage.removeItem(CFG.SAVE_KEY); location.reload(); });

// One-tap prestige & play — skip confirm, run ceremony, then go straight to doctrine selection
try {
  $id('goPrestigePlayBtn').addEventListener('click', function() {
    if (!canPrestige()) return;
    ['gameoverOverlay','summaryOverlay','rewardOverlay'].forEach(hideOverlay);
    showOverlay('prestigeOverlay');
    _runPrestigeCeremony();
  });
} catch(e) {}

function openPrestigeUI() {
  if (!canPrestige()) return addLog('Reach wave ' + CFG.PRESTIGE_WAVE_REQ + ' to prestige.', 'warn');
  const gain     = prestigeGain();
  const newRank  = G.meta.prestige + gain;
  const newUnlocks = PERMANENT_UNLOCKS.filter(function(u) { return u.rank > G.meta.prestige && u.rank <= newRank; });
  const nextUnlock = PERMANENT_UNLOCKS.find(function(u) { return u.rank > newRank; });

  $id('prestige-confirm-phase').style.display = 'block';
  $id('prestige-ceremony-phase').style.display = 'none';

  const newPerks = _getRankPerks(newRank);
  const unlockList = newUnlocks.length > 0
    ? newUnlocks.map(function(u) { return '<div style="color:var(--green);margin-top:3px">★ ' + u.name + ' — ' + u.desc + '</div>'; }).join('')
    : '<div style="color:var(--muted);margin-top:3px">No new unlocks (bonuses only)</div>';

  $id('prestigeDesc').innerHTML =
    'Advance to <b style="color:var(--purple);font-size:16px">Command Rank ' + newRank + '</b><br>' +
    '<span style="color:var(--cyan)">+' + (newRank * CFG.PRESTIGE_INCOME_BONUS * 100).toFixed(0) + '% income · +' + (newRank * CFG.PRESTIGE_DMG_BONUS * 100).toFixed(0) + '% damage</span>' +
    '<div style="margin-top:10px;padding:8px 10px;border-radius:8px;background:rgba(0,0,0,.3);border:1px solid var(--line2);font-family:\'Share Tech Mono\',monospace;font-size:9px;text-align:left">' +
    unlockList + '</div>' +
    (nextUnlock ? '<div style="margin-top:8px;font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--muted)">Next: Rank ' + nextUnlock.rank + ' unlocks ' + nextUnlock.name + '</div>' : '') +
    '<div style="margin-top:6px;font-family:\'Share Tech Mono\',monospace;font-size:8px;color:rgba(255,80,80,.6)">Current run will be reset</div>';

  showOverlay('prestigeOverlay');
}

// ── Help ───────────────────────────────────────────────────────
$id('helpCloseBtn').addEventListener('click', () => $id('helpOverlay').style.display = 'none');
$id('helpClose2Btn').addEventListener('click', () => $id('helpOverlay').style.display = 'none');
$id('helpStartBtn').addEventListener('click', () => { $id('helpOverlay').style.display = 'none'; $id('beginBtn').click(); });

// ── Audio volume boost (override engine's quiet defaults) ─────
// The engine's tone() function uses very quiet gains (.015-.056).
// We patch the SFX table after engine loads with louder versions.
// This is safe — SFX is a plain object in global scope.
try {
if (typeof SFX !== 'undefined') {
  const _origTone = tone;
  const _boostedTone = (freq, dur, type = 'sine', vol = 0.03, when = 0) =>
    _origTone(freq, dur, type, Math.min(0.4, vol * 2.8), when);
  SFX.shoot     = () => { _boostedTone(380, .04, 'square', .038); _boostedTone(220, .06, 'sawtooth', .018, .02); };
  // Heavy: deep thud with low sub-bass punch
  SFX.heavy     = () => { _boostedTone(85, .14, 'sawtooth', .13); _boostedTone(48, .18, 'sine', .08, .02); };
  // Sniper: sharp high crack followed by low rumble (supersonic crack + distant echo)
  SFX.sniper    = () => {
    _boostedTone(980, .02, 'square', .08);
    _boostedTone(440, .04, 'sawtooth', .06, .015);
    _boostedTone(110, .18, 'sine', .05, .04);
  };
  // Grenade: hollow tube thump + explosion crunch
  SFX.grenade   = () => {
    _boostedTone(140, .06, 'triangle', .07);
    _boostedTone(75,  .18, 'square',   .09, .05);
    _boostedTone(200, .08, 'sawtooth', .04, .08);
  };
  SFX.heal      = () => { _boostedTone(660, .07, 'sine', .048); _boostedTone(880, .09, 'sine', .028, .05); };
  SFX.enemyDown = () => { _boostedTone(118, .10, 'triangle', .055); _boostedTone(80, .08, 'square', .03, .04); };
  SFX.bossDown  = () => { _boostedTone(220, .20, 'sawtooth', .13); _boostedTone(330, .18, 'triangle', .07, .15); _boostedTone(110, .25, 'sine', .06, .25); };
  SFX.impact    = () => { _boostedTone(78,  .15, 'square',   .14); _boostedTone(55, .12, 'sawtooth', .08, .03); };
  SFX.upgrade   = () => { _boostedTone(440, .09, 'triangle', .075); _boostedTone(620, .12, 'triangle', .06, .07); };
  SFX.deploy    = () => { _boostedTone(285, .07, 'square',   .048); _boostedTone(360, .05, 'triangle', .028, .04); };
  SFX.victory   = () => { _boostedTone(392, .12, 'triangle', .075); _boostedTone(523, .14, 'triangle', .075, .10); _boostedTone(659, .18, 'triangle', .075, .22); };
  SFX.alarm     = () => { _boostedTone(218, .12, 'sawtooth', .075); _boostedTone(168, .12, 'sawtooth', .075, .14); };
  SFX.orbital   = () => { _boostedTone(108, .28, 'sawtooth', .16); _boostedTone(62,  .32, 'square',   .10, .07); _boostedTone(180, .20, 'sine', .05, .15); };
  // Boss alarm: more threatening — rising then dropping tone
  SFX.bossAlarm = () => {
    _boostedTone(220, .18, 'sawtooth', .12);
    _boostedTone(180, .18, 'sawtooth', .12, .20);
    _boostedTone(140, .20, 'sawtooth', .10, .40);
    _boostedTone(110, .24, 'square',   .08, .62);
  };
  SFX.prestige  = () => { _boostedTone(523, .12, 'triangle', .10); _boostedTone(659, .14, 'triangle', .10, .12); _boostedTone(784, .20, 'triangle', .10, .26); };
  // Missing SFX slots — engine calls these, silence = crash if undefined
  SFX.rankUp    = () => { _boostedTone(440, .08, 'triangle', .06); _boostedTone(554, .10, 'triangle', .06, .10); };
  SFX.event     = () => { _boostedTone(330, .10, 'sine', .05); _boostedTone(415, .12, 'sine', .04, .10); };
  SFX.phase     = () => { _boostedTone(180, .22, 'sawtooth', .08); _boostedTone(240, .18, 'square', .06, .12); _boostedTone(160, .20, 'sine', .04, .22); };
}
} catch(e) { _showErr('SFX boost', e); }
// Safari requires a user gesture to start AudioContext.
// We hook the FIRST touch/click on the document to ensure audio
// is unlocked before any game sounds fire.
let _audioUnlocked = false;
