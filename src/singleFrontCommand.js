// ══════════════════════════════════════════════════════════════
// Build 133 — Orders Collapse + Turret Alignment
// Purpose: make Last Stand Command read as a hero-led single-front
// squad defense game instead of a standard three-lane tower defense.
// Keeps the old lane data internally as formation pods for stability.
// ══════════════════════════════════════════════════════════════
(function () {
  if (window.__LSC_SINGLE_FRONT_133__) return;
  window.__LSC_SINGLE_FRONT_133__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) { try { return fn(); } catch (e) { try { console.warn('[SingleFront133]' , label, e); } catch (_) {} } }
  function state() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function meta() { return (typeof G !== 'undefined' && G.meta) ? G.meta : {}; }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); else console.log('[SingleFront133]' , msg); }
  function hapticLight() { try { if (typeof haptic === 'function') haptic('light'); } catch (_) {} }

  var FORMATION_NAMES = ['Support Row', 'Fireline Row', 'Vanguard Row'];
  var FORMATION_SHORT = ['SUPPORT', 'FIRELINE', 'VANGUARD'];
  var SINGLE_FRONT_ENGAGE_X = 540;      // Lower number = closer to the command base before troops open fire.
  var SINGLE_FRONT_SNIPER_BONUS = 130;  // Snipers can acquire earlier without making early rifle waves vanish.

  var HEROES = [
    {
      id: 'holt', icon: '★', name: 'Commander Holt', role: 'Infantry Commander',
      unlock: 'Default commander', world: 'Earth Front',
      passive: '+5% rifle and heavy effectiveness', active: 'Rally Fire — reset squad firing rhythm',
      readyAt: function () { return true; }
    },
    {
      id: 'vale', icon: '◆', name: 'Engineer Vale', role: 'Fortification Lead',
      unlock: 'Reach Wave 15', world: 'Earth / Ruined Cities',
      passive: '+1 emergency barricade strength', active: 'Field Repair — restore base HP and reinforce the line',
      readyAt: function () { return (meta().bestWave || 0) >= 15 || ((state()||{}).wave || 0) >= 15; }
    },
    {
      id: 'cross', icon: '✚', name: 'Medic Cross', role: 'Combat Recovery',
      unlock: 'Reach Wave 25 or Command Rank 1', world: 'Lunar Outpost',
      passive: '+10% troop survival emphasis', active: 'Emergency Triage — heal all deployed squads',
      readyAt: function () { return (meta().bestWave || 0) >= 25 || (meta().prestige || 0) >= 1; }
    },
    {
      id: 'warden', icon: '◈', name: 'Signal Warden', role: 'EW Controller',
      unlock: 'Command Rank 2', world: 'Orbital / Blackout Operations',
      passive: 'Opening contacts enter under signal pressure', active: 'Jam Pulse — slow all current contacts',
      readyAt: function () { return (meta().prestige || 0) >= 2; }
    },
    {
      id: 'knox', icon: '▲', name: 'Artillery Knox', role: 'Fire Support Chief',
      unlock: 'Command Rank 4', world: 'Redline Boss Operations',
      passive: '+Orbital strike command identity', active: 'Fire Mission — damage all visible contacts',
      readyAt: function () { return (meta().prestige || 0) >= 4; }
    }
  ];

  function getHero(id) { return HEROES.find(function (h) { return h.id === id; }) || HEROES[0]; }
  function selectedHero() {
    var s = state();
    if (!s) return HEROES[0];
    if (!s.selectedHero) s.selectedHero = 'holt';
    return getHero(s.selectedHero);
  }

  function installStyles() {
    if ($('lsc-singlefront133-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-singlefront133-style';
    css.textContent = '' +
      '.lsc-hero-panel{margin:10px 0 12px;padding:11px;border-radius:15px;border:1px solid rgba(255,209,102,.24);background:linear-gradient(180deg,rgba(30,21,5,.72),rgba(5,10,16,.74));box-shadow:inset 0 0 24px rgba(255,209,102,.06)}' +
      '.lsc-hero-kicker{font-family:Share Tech Mono,monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,209,102,.88);margin-bottom:7px}' +
      '.lsc-hero-grid{display:grid;grid-template-columns:1fr;gap:7px}' +
      '.lsc-hero-card{border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.27);padding:9px 10px;text-align:left;color:rgba(235,238,240,.88);-webkit-appearance:none}' +
      '.lsc-hero-card.active{border-color:rgba(255,209,102,.72);box-shadow:0 0 18px rgba(255,209,102,.14);background:linear-gradient(90deg,rgba(255,209,102,.13),rgba(0,0,0,.24))}' +
      '.lsc-hero-card.locked{opacity:.46;filter:grayscale(.25)}' +
      '.lsc-hero-title{font-family:Rajdhani,sans-serif;font-weight:900;font-size:13px;letter-spacing:.5px;color:#fff}' +
      '.lsc-hero-meta{margin-top:2px;font-family:Share Tech Mono,monospace;font-size:8px;color:rgba(230,220,190,.78);line-height:1.45}' +
      '.lsc-front-pill{position:fixed;z-index:121;left:50%;top:calc(env(safe-area-inset-top,0px) + 54px);transform:translateX(-50%);padding:6px 10px;border-radius:999px;border:1px solid rgba(255,209,102,.42);background:rgba(3,8,13,.72);box-shadow:0 10px 28px rgba(0,0,0,.35);font-family:Share Tech Mono,monospace;font-size:9px;letter-spacing:1.5px;color:#ffd166;text-transform:uppercase;pointer-events:none;display:none}' +
      '.lsc-hero-ability{position:fixed;z-index:124;left:12px;right:auto;top:calc(env(safe-area-inset-top,0px) + 258px);bottom:auto;width:178px;max-width:178px;padding:8px 10px;border-radius:13px;border:1px solid rgba(255,209,102,.50);background:linear-gradient(180deg,rgba(32,22,6,.95),rgba(5,7,10,.92));box-shadow:0 12px 28px rgba(0,0,0,.46),inset 0 0 16px rgba(255,209,102,.07);color:#fff;text-align:left;-webkit-appearance:none;display:none}' +
      '.lsc-hero-ability b{display:block;font-family:Rajdhani,sans-serif;font-size:12px;line-height:1;letter-spacing:.8px;text-transform:uppercase;color:#ffd166;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.lsc-hero-ability span{display:block;margin-top:4px;font-family:Share Tech Mono,monospace;font-size:8px;line-height:1.2;color:rgba(235,230,210,.78);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.lsc-hero-ability.cooling{opacity:.60;border-color:rgba(255,255,255,.18)}' +
      '.lsc-orders-compact{cursor:pointer!important;max-height:48px!important;overflow:hidden!important;transition:max-height .2s ease,width .2s ease,opacity .2s ease!important}' +
      '.lsc-orders-compact.expanded{max-height:360px!important;overflow:visible!important}' +
      '.lsc-orders-compact:not(.expanded) .quest-card{display:none!important}' +
      '.lsc-orders-compact #quest-board-head{position:relative;padding-right:18px!important}' +
      '.lsc-orders-compact #quest-board-head:after{content:"TAP";position:absolute;right:2px;top:0;font-size:7px;color:rgba(255,209,102,.72);letter-spacing:1px}' +
      '.lsc-orders-compact.expanded #quest-board-head:after{content:"HIDE"}' +
      '.lsc-order-summary{margin-top:6px;border-radius:10px;border:1px solid rgba(34,212,255,.34);background:rgba(3,11,20,.82);padding:7px 9px;font-family:Share Tech Mono,monospace;color:#dff7ff;box-shadow:0 10px 26px rgba(0,0,0,.35)}' +
      '.lsc-orders-compact.expanded .lsc-order-summary{display:none!important}' +
      '.lsc-order-summary-title{font-family:Rajdhani,sans-serif;font-weight:900;font-size:12px;line-height:1;color:#9cecff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.lsc-order-summary-meta{margin-top:4px;font-size:8px;color:rgba(255,209,102,.86);letter-spacing:.8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '@media (min-width:420px){.lsc-hero-grid{grid-template-columns:1fr 1fr}.lsc-hero-ability{left:16px;top:calc(env(safe-area-inset-top,0px) + 262px);width:188px;max-width:188px}}';
    document.head.appendChild(css);
  }


  function compactOrdersBoard() {
    safe('compactOrdersBoard', function () {
      var board = $('quest-board');
      var head = $('quest-board-head');
      if (!board || !head) return;
      board.classList.add('lsc-orders-compact');
      if (board.dataset.lscOrdersInit !== '1') {
        board.dataset.lscOrdersInit = '1';
        board.classList.remove('expanded');
        board.addEventListener('click', function (ev) {
          // A completed quest card should still be claimable while expanded.
          if (board.classList.contains('expanded') && ev.target && ev.target.closest && ev.target.closest('.quest-card')) return;
          board.classList.toggle('expanded');
          hapticLight();
        });
      }
      var old = board.querySelector('.lsc-order-summary');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var s = state();
      var title = 'Orders Ready';
      var metaText = 'Tap to view objectives';
      try {
        if (s && s._quests && typeof QUEST_DEFS !== 'undefined' && typeof _questProgress === 'function') {
          var active = s._quests.active || [];
          var ready = 0;
          var firstDef = null;
          var firstPct = 0;
          active.forEach(function (aq) {
            var def = QUEST_DEFS.find(function (d) { return d.id === aq.id; });
            if (!def) return;
            var prog = _questProgress(s, def);
            var pct = Math.min(100, Math.round(prog / def.target * 100));
            if (aq.claimed || pct >= 100) ready++;
            if (!firstDef) { firstDef = def; firstPct = pct; }
          });
          if (firstDef) title = (ready > 0 ? '★ ' : '') + firstDef.title;
          metaText = (ready > 0 ? ready + ' ready · ' : '') + active.length + ' active · ' + firstPct + '%';
        }
      } catch (_) {}
      var summary = document.createElement('div');
      summary.className = 'lsc-order-summary';
      summary.innerHTML = '<div class="lsc-order-summary-title">' + title + '</div><div class="lsc-order-summary-meta">' + metaText + '</div>';
      if (head.nextSibling) board.insertBefore(summary, head.nextSibling);
      else board.appendChild(summary);
    });
  }

  function patchOrdersBoard() {
    if (typeof renderQuestBoard === 'function' && !renderQuestBoard.__singleFront133) {
      var oldRenderQuestBoard = renderQuestBoard;
      renderQuestBoard = function () {
        var result = oldRenderQuestBoard.apply(this, arguments);
        compactOrdersBoard();
        return result;
      };
      renderQuestBoard.__singleFront133 = true;
    }
    compactOrdersBoard();
  }

  function ensureHeroPanel() {
    if ($('lsc-hero-panel')) return;
    var grid = $('doctrineGrid');
    if (!grid || !grid.parentNode) return;
    var panel = document.createElement('div');
    panel.id = 'lsc-hero-panel';
    panel.className = 'lsc-hero-panel';
    panel.innerHTML = '<div class="lsc-hero-kicker">Commander Select</div><div class="lsc-hero-grid" id="lsc-hero-grid"></div>';
    grid.parentNode.insertBefore(panel, grid);
  }

  function renderHeroCards() {
    ensureHeroPanel();
    var grid = $('lsc-hero-grid');
    var s = state();
    if (!grid || !s) return;
    if (!s.selectedHero) s.selectedHero = 'holt';
    grid.innerHTML = '';
    HEROES.forEach(function (h) {
      var unlocked = !!h.readyAt();
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lsc-hero-card' + (s.selectedHero === h.id ? ' active' : '') + (unlocked ? '' : ' locked');
      btn.innerHTML = '<div class="lsc-hero-title">' + h.icon + ' ' + h.name + '</div>' +
        '<div class="lsc-hero-meta">' + h.role + '<br>' +
        (unlocked ? h.passive : 'Locked: ' + h.unlock) + '<br>World Focus: ' + h.world + '</div>';
      btn.addEventListener('click', function () {
        if (!unlocked) { toast(h.name + ' locked — ' + h.unlock); hapticLight(); return; }
        s.selectedHero = h.id;
        renderHeroCards();
        updateHeroAbilityButton();
        toast(h.name + ' assigned to command front.');
        hapticLight();
      });
      grid.appendChild(btn);
    });
  }

  function retitleForSingleFront() {
    safe('retitleForSingleFront', function () {
      var overlay = $('startOverlay');
      if (overlay) {
        var intro = overlay.querySelector('.start-intro');
        var sub = overlay.querySelector('.start-sub');
        var tag = overlay.querySelector('.start-tag');
        if (sub) sub.textContent = 'HERO · FORMATION · HOLD THE FRONT';
        if (tag) tag.textContent = 'SINGLE FRONT COMMAND';
        if (intro) intro.textContent = 'Choose a commander, arrange squad rows, and hold one command front against escalating enemy contacts.';
      }
      Array.from(document.querySelectorAll('button,div,span,p')).forEach(function (el) {
        // Only rewrite leaf text nodes so we do not flatten complex cards or lose nested layout.
        if (el.children && el.children.length > 0) return;
        var t = (el.textContent || '').trim();
        if (!t) return;
        var nt = t;
        var exact = {
          'Top':'Support', 'Mid':'Fireline', 'Bottom':'Vanguard',
          'Left':'Support', 'Center':'Fireline', 'Right':'Vanguard',
          'LEFT':'SUPPORT', 'CTR':'FIRELINE', 'CENTER':'FIRELINE', 'RIGHT':'VANGUARD',
          'LAUNCH WAVE':'LAUNCH CONTACT', 'BOSS WAVE':'BOSS CONTACT',
          'Fill All Lanes':'Fill Formation', 'Fill all lanes':'Fill Formation',
          'Save Current Lanes':'Save Current Formation',
          'Save Current Battlefield as My Formation':'Save Current Front as My Formation'
        };
        if (exact[nt]) nt = exact[nt];
        nt = nt
          .replace(/\bLEFT\b/g, 'SUPPORT')
          .replace(/\bCTR\b/g, 'FIRELINE')
          .replace(/\bCENTER\b/g, 'FIRELINE')
          .replace(/\bRIGHT\b/g, 'VANGUARD')
          .replace(/\bLeft\b/g, 'Support')
          .replace(/\bCenter\b/g, 'Fireline')
          .replace(/\bRight\b/g, 'Vanguard')
          .replace(/\bleft lane\b/gi, 'support row')
          .replace(/\bcenter lane\b/gi, 'fireline row')
          .replace(/\bright lane\b/gi, 'vanguard row')
          .replace(/\bleft position\b/gi, 'support row position')
          .replace(/\bcenter position\b/gi, 'fireline row position')
          .replace(/\bright position\b/gi, 'vanguard row position')
          .replace(/\blane\b/g, 'row')
          .replace(/\bLane\b/g, 'Row');
        if (nt !== t) el.textContent = nt;
      });
    });
  }

  // ── Internal game reinterpretation ───────────────────────────
  // Keep three lane arrays for stability, but treat them as formation rows.
  safe('patch laneName', function () {
    if (typeof laneName === 'function' && !laneName.__singleFront133) {
      var oldLaneName = laneName;
      laneName = function (i) { return FORMATION_NAMES[i] || oldLaneName(i); };
      laneName.__singleFront133 = true;
    }
  });

  safe('patch spawnEnemy', function () {
    if (typeof spawnEnemy === 'function' && !spawnEnemy.__singleFront133) {
      var oldSpawnEnemy = spawnEnemy;
      spawnEnemy = function () {
        var s = state();
        var before = s && s.enemies ? s.enemies.length : 0;
        var result = oldSpawnEnemy.apply(this, arguments);
        s = state();
        if (s && s.enemies && s.enemies.length > before) {
          var e = s.enemies[s.enemies.length - 1];
          e.lane = 1; // One enemy approach corridor.
          if (typeof LANE_Y !== 'undefined' && LANE_Y[1] !== undefined) {
            e.y = LANE_Y[1];
            e.baseY = LANE_Y[1];
          }
          e._singleFrontContact = true;
          // Single-front has all rows focusing one corridor, so contacts need a little more screen time.
          if (!e._sfBuffed) {
            var hpMult = e.kind === 'warden' ? 1.00 : 1.18;
            e.maxHp = Math.max(1, Math.ceil((e.maxHp || e.hp || 1) * hpMult));
            e.hp = Math.max(e.hp || 1, e.maxHp);
            e.speed = Math.max(30, (e.speed || 80) * 0.92);
            e._sfBuffed = true;
          }
        }
        return result;
      };
      spawnEnemy.__singleFront133 = true;
    }
  });

  safe('patch nearestEnemy', function () {
    if (typeof nearestEnemy === 'function' && !nearestEnemy.__singleFront133) {
      var oldNearestEnemy = nearestEnemy;
      nearestEnemy = function (t) {
        var s = state();
        if (!s || !s._singleFrontMode) return oldNearestEnemy(t);
        var best = null, bestD = Infinity;
        var extRange = (s.perks && s.perks.extendedRange) || 0;
        var sniperBonus = (t.type && t.type.id === 'sniper' && s.perks && s.perks.sniperRange) ? s.perks.sniperRange : 0;
        var earlyAcquire = (t.type && t.type.id === 'sniper') ? SINGLE_FRONT_SNIPER_BONUS : 0;
        var engageX = SINGLE_FRONT_ENGAGE_X + earlyAcquire;
        var effectiveRange = (t.type.range || 500) * (1 + extRange + sniperBonus + 0.12);
        for (var i = 0; i < s.enemies.length; i++) {
          var e = s.enemies[i];
          var vis = !e.cloaked || e.slow > 0;
          if (!vis) continue;
          // Contacts must cross the visible engagement line before most squads open fire.
          // This prevents early waves from disappearing halfway down the front before the player sees combat.
          if ((e.x || 9999) > engageX && e.kind !== 'warden') continue;
          e._sfAcquired = true;
          var d = Math.abs((e.x || 0) - (t.x || 0));
          if (d < effectiveRange && d < bestD) { best = e; bestD = d; }
        }
        return best;
      };
      nearestEnemy.__singleFront133 = true;
    }
  });


  safe('patch applyDamage visuals', function () {
    if (typeof applyDamage === 'function' && !applyDamage.__singleFront133) {
      var oldApplyDamage = applyDamage;
      applyDamage = function (enemy, damage, source) {
        var beforeHp = enemy ? (enemy.hp || 0) : 0;
        var beforeShield = enemy ? (enemy.shield || 0) : 0;
        var result = oldApplyDamage.apply(this, arguments);
        try {
          if (enemy) {
            var hpLoss = Math.max(0, beforeHp - (enemy.hp || 0));
            var shieldLoss = Math.max(0, beforeShield - (enemy.shield || 0));
            var visualLoss = hpLoss + shieldLoss * 0.35;
            if (visualLoss > 0) {
              enemy._lastHitTime = performance.now();
              enemy._sfDamageUntil = performance.now() + 650;
              enemy._sfLastDamage = Math.max(1, Math.round(visualLoss));
              enemy._sfHitSeed = Math.random();
              enemy._sfAcquired = true;
            }
          }
        } catch (_) {}
        return result;
      };
      applyDamage.__singleFront133 = true;
    }
  });


  function normalizeTurretProjectiles() {
    var s = state();
    if (!s || !s.projectiles) return;
    s.projectiles.forEach(function (p) {
      if (!p || p._sfTurretAligned) return;
      if (p.type === 'laneGun') {
        // Make legacy lane-gun shots visually line up with the single-front emplacements.
        var lane = (p.from && typeof p.from.lane === 'number') ? p.from.lane : 1;
        p.from = { lane: lane, slot: lane === 1 ? 4 : 3 };
        p.color = '#ffd166';
        p._sfTurretAligned = true;
      }
    });
  }

  function applyHeroPassiveMarkers() {
    var s = state();
    if (!s) return;
    s._singleFrontMode = true;
    if (!s.selectedHero) s.selectedHero = 'holt';
    var h = selectedHero();
    s._heroPassiveLabel = h.passive;
    // Low-risk passive nudges only. Avoid rewriting core balance.
    if (h.id === 'warden') s.perks.entryJam = Math.max(s.perks.entryJam || 0, 0.7);
    if (h.id === 'vale') s._heroFortifyReady = true;
  }

  function ensureHeroAbilityButton() {
    if ($('lsc-hero-ability')) return;
    var btn = document.createElement('button');
    btn.id = 'lsc-hero-ability';
    btn.type = 'button';
    btn.className = 'lsc-hero-ability';
    btn.innerHTML = '<b>Hero Ability</b><span>Ready</span>';
    btn.addEventListener('click', activateHeroAbility);
    document.body.appendChild(btn);

    var pill = document.createElement('div');
    pill.id = 'lsc-front-pill';
    pill.className = 'lsc-front-pill';
    pill.textContent = 'Single Front Command';
    document.body.appendChild(pill);
  }

  function heroCooldownSeconds() {
    var s = state();
    if (!s || !s._heroReadyAt) return 0;
    return Math.max(0, Math.ceil((s._heroReadyAt - Date.now()) / 1000));
  }

  function setHeroCooldown(seconds) {
    var s = state();
    if (!s) return;
    s._heroReadyAt = Date.now() + seconds * 1000;
  }

  function activateHeroAbility() {
    var s = state();
    if (!s || !s.started || s.gameOver) return;
    var cd = heroCooldownSeconds();
    if (cd > 0) { toast('Hero ability cooling: ' + cd + 's'); hapticLight(); return; }
    var h = selectedHero();
    if (h.id === 'holt') {
      (s.troops || []).forEach(function (t) { t.cooldown = 0; t._lastFireTime = performance.now(); });
      toast('Rally Fire — squads re-engaged.');
      setHeroCooldown(24);
    } else if (h.id === 'vale') {
      s.baseHp = Math.min(s.maxBaseHp, s.baseHp + 26);
      if (s.lanes) s.lanes.forEach(function (l) { l.barricade = Math.max(l.barricade || 0, 1); });
      toast('Field Repair — command front reinforced.');
      setHeroCooldown(34);
    } else if (h.id === 'cross') {
      (s.troops || []).forEach(function (t) { t.hp = Math.min(t.maxHp, t.hp + Math.max(14, Math.floor(t.maxHp * 0.28))); });
      toast('Emergency Triage — squad rows healed.');
      setHeroCooldown(36);
    } else if (h.id === 'warden') {
      (s.enemies || []).forEach(function (e) { e.slow = Math.max(e.slow || 0, 2.6); });
      toast('Jam Pulse — contacts slowed.');
      setHeroCooldown(30);
    } else if (h.id === 'knox') {
      (s.enemies || []).slice().forEach(function (e) { if (typeof applyDamage === 'function') applyDamage(e, 46 + (s.wave || 1) * 2, 'orbital'); else e.hp -= 50; });
      toast('Fire Mission — visible contacts hit.');
      setHeroCooldown(38);
    }
    hapticLight();
    if (typeof updateHUD === 'function') updateHUD();
  }

  function updateHeroAbilityButton() {
    ensureHeroAbilityButton();
    var s = state();
    var btn = $('lsc-hero-ability');
    var pill = $('lsc-front-pill');
    if (!btn || !pill || !s) return;
    var visible = !!(s.started && !s.gameOver);
    btn.style.display = visible ? 'block' : 'none';
    pill.style.display = visible ? 'block' : 'none';
    if (!visible) return;
    var h = selectedHero();
    var cd = heroCooldownSeconds();
    btn.classList.toggle('cooling', cd > 0);
    var shortName = h.name.replace('Commander ', '').replace('Artillery ', '');
    var shortActive = (h.active || 'Ready').split('—')[0].trim();
    btn.title = h.name + ' · ' + h.active;
    btn.innerHTML = '<b>' + h.icon + ' ' + shortName + '</b><span>' + (cd > 0 ? ('Cooling ' + cd + 's') : shortActive) + '</span>';
  }

  function drawSingleFrontOverlay(ctx, stateObj) {
    if (!ctx || !stateObj || !stateObj.started) return;
    var canvas = ctx.canvas;
    var W = canvas.width, H = canvas.height;
    var dpr = window.devicePixelRatio || 1;
    var baseH = 70 * dpr;
    var treeH = 52 * dpr;
    var fieldH = H - baseH - treeH;
    var cx = W / 2;
    ctx.save();

    // Central command front corridor. This reads as one enemy approach instead of three lanes.
    var corrWTop = W * 0.34;
    var corrWBot = W * 0.56;
    var g = ctx.createLinearGradient(0, treeH, 0, H - baseH);
    g.addColorStop(0, 'rgba(255,209,102,.05)');
    g.addColorStop(.55, 'rgba(34,212,255,.055)');
    g.addColorStop(1, 'rgba(255,209,102,.07)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx - corrWTop/2, treeH + 2*dpr);
    ctx.lineTo(cx + corrWTop/2, treeH + 2*dpr);
    ctx.lineTo(cx + corrWBot/2, H - baseH - 4*dpr);
    ctx.lineTo(cx - corrWBot/2, H - baseH - 4*dpr);
    ctx.closePath(); ctx.fill();

    ctx.strokeStyle = 'rgba(255,209,102,.22)';
    ctx.lineWidth = 1.2 * dpr;
    ctx.setLineDash([8*dpr, 7*dpr]);
    ctx.beginPath();
    ctx.moveTo(cx - corrWTop/2, treeH + 2*dpr); ctx.lineTo(cx - corrWBot/2, H - baseH - 4*dpr);
    ctx.moveTo(cx + corrWTop/2, treeH + 2*dpr); ctx.lineTo(cx + corrWBot/2, H - baseH - 4*dpr);
    ctx.stroke();
    ctx.setLineDash([]);

    // Contact vector arrows down the single front.
    ctx.globalAlpha = .55;
    ctx.fillStyle = '#ffd166';
    for (var i = 0; i < 4; i++) {
      var y = treeH + fieldH * (0.16 + i * 0.18);
      var pulse = Math.sin((stateObj.time || 0) * 2.2 + i) * 3 * dpr;
      ctx.beginPath();
      ctx.moveTo(cx, y + 10*dpr + pulse);
      ctx.lineTo(cx - 8*dpr, y - 3*dpr + pulse);
      ctx.lineTo(cx + 8*dpr, y - 3*dpr + pulse);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Engagement line — squads hold fire until contacts cross this line, so combat reads on-screen.
    var engageY = treeH + ((1400 - SINGLE_FRONT_ENGAGE_X) / 1400) * fieldH;
    ctx.strokeStyle = 'rgba(255,209,102,.34)';
    ctx.lineWidth = 1 * dpr;
    ctx.setLineDash([5*dpr, 5*dpr]);
    ctx.beginPath(); ctx.moveTo(cx - corrWBot * .36, engageY); ctx.lineTo(cx + corrWBot * .36, engageY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,0,0,.48)';
    roundRect(ctx, cx - 60*dpr, engageY - 13*dpr, 120*dpr, 17*dpr, 8*dpr); ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold ' + (7*dpr) + 'px Share Tech Mono,monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ENGAGEMENT LINE', cx, engageY - 2*dpr);

    // Stronger hit feedback: red flash rings and damage chips on contacts that were just hit.
    var now = performance.now();
    (stateObj.enemies || []).forEach(function (e) {
      if (!e || !e._sfDamageUntil || e._sfDamageUntil < now) return;
      var ex = cx;
      var ey = treeH + ((1400 - (e.x || 0)) / 1400) * fieldH;
      var a = Math.max(0, Math.min(1, (e._sfDamageUntil - now) / 650));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = 'rgba(255,70,70,.92)';
      ctx.lineWidth = 2.2 * dpr;
      ctx.shadowColor = '#ff3030'; ctx.shadowBlur = 12 * a;
      ctx.beginPath(); ctx.arc(ex, ey, (18 + (1-a) * 12) * dpr, 0, Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;
      // Small spark cross so rifle hits are visible even when the enemy dies quickly.
      ctx.strokeStyle = 'rgba(255,220,120,.90)';
      ctx.lineWidth = 1.5 * dpr;
      var spark = 8 * dpr;
      ctx.beginPath();
      ctx.moveTo(ex - spark, ey); ctx.lineTo(ex + spark, ey);
      ctx.moveTo(ex, ey - spark); ctx.lineTo(ex, ey + spark);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.70)';
      roundRect(ctx, ex + 11*dpr, ey - 25*dpr - (1-a)*8*dpr, 42*dpr, 17*dpr, 8*dpr); ctx.fill();
      ctx.fillStyle = '#ffdddd';
      ctx.font = 'bold ' + (8*dpr) + 'px Share Tech Mono,monospace';
      ctx.textAlign = 'center';
      ctx.fillText('-' + (e._sfLastDamage || 1), ex + 32*dpr, ey - 13*dpr - (1-a)*8*dpr);
      ctx.restore();
    });

    // Formation row labels over the three existing internal slots.
    var rowX = [W * 0.18, W * 0.50, W * 0.82];
    var rowY = H - baseH - 38 * dpr;
    for (var r = 0; r < 3; r++) {
      var count = (stateObj.troops || []).filter(function (t) { return t.lane === r; }).length;
      ctx.fillStyle = 'rgba(2,8,13,.68)';
      ctx.strokeStyle = r === 2 ? 'rgba(255,209,102,.42)' : r === 1 ? 'rgba(34,212,255,.38)' : 'rgba(170,210,255,.30)';
      ctx.lineWidth = 1 * dpr;
      var w = 78 * dpr, h = 19 * dpr;
      roundRect(ctx, rowX[r] - w/2, rowY - h/2, w, h, 8*dpr); ctx.fill(); ctx.stroke();
      ctx.font = 'bold ' + (8*dpr) + 'px Share Tech Mono,monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = r === 2 ? '#ffd166' : r === 1 ? '#9cecff' : '#cfe4ff';
      ctx.fillText(FORMATION_SHORT[r] + ' ' + count + '/5', rowX[r], rowY + 3*dpr);
    }

    // Build 132: move Hero Command out of the command-base canvas stack.
    // The active hero is now controlled by the compact DOM button in the upper-right field area.

    // Cover legacy LEFT / CTR / RIGHT base labels from the older three-lane layout.
    ctx.fillStyle = 'rgba(4,8,11,.76)';
    roundRect(ctx, W * .03, H - baseH + 28*dpr, W * .94, 18*dpr, 9*dpr); ctx.fill();
    var coverNames = ['SUPPORT ROW', 'FIRELINE ROW', 'VANGUARD ROW'];
    ctx.font = 'bold ' + (7*dpr) + 'px Share Tech Mono,monospace';
    ctx.textAlign = 'center';
    for (var cr = 0; cr < 3; cr++) {
      ctx.fillStyle = cr === 2 ? '#ffd166' : cr === 1 ? '#9cecff' : '#cfe4ff';
      ctx.fillText(coverNames[cr], rowX[cr], H - baseH + 40*dpr);
    }

    // Single-front turret/emplacement overlay — covers the old lane-gun sprites and re-presents them as one front-defense battery.
    var guns = (stateObj.lanes || []).map(function (l) { return (l && l.gun) || 0; });
    if (guns[0] || guns[1] || guns[2]) {
      var legacyX = [W * .18, W * .50, W * .82];
      var emps = [
        { x: legacyX[0], y: H - baseH - 66*dpr, label:'SUP', lvl:guns[0] },
        { x: legacyX[1], y: H - baseH - 86*dpr, label:'FIRE', lvl:guns[1] },
        { x: legacyX[2], y: H - baseH - 66*dpr, label:'VAN', lvl:guns[2] }
      ];
      emps.forEach(function (em) {
        if (!em.lvl) return;
        ctx.save();
        ctx.translate(em.x, em.y);
        // Dark cover hides the old sprite-based turret underneath without touching squad controls.
        ctx.fillStyle = 'rgba(4,7,8,.88)';
        ctx.strokeStyle = 'rgba(255,209,102,.28)';
        ctx.lineWidth = 1 * dpr;
        roundRect(ctx, -22*dpr, -23*dpr, 44*dpr, 43*dpr, 10*dpr); ctx.fill(); ctx.stroke();
        var glow = ctx.createRadialGradient(0, -4*dpr, 0, 0, -4*dpr, 26*dpr);
        glow.addColorStop(0, 'rgba(255,209,102,.20)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, -4*dpr, 26*dpr, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.54)';
        ctx.strokeStyle = 'rgba(255,209,102,.55)';
        roundRect(ctx, -18*dpr, 3*dpr, 36*dpr, 13*dpr, 6*dpr); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = (2 + Math.min(2, em.lvl*.35)) * dpr; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 2*dpr); ctx.lineTo(0, -22*dpr); ctx.stroke();
        ctx.fillStyle = '#1d2a24'; ctx.strokeStyle = '#9cecff'; ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath(); ctx.arc(0, -2*dpr, 9*dpr, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffd166'; ctx.font = 'bold ' + (6*dpr) + 'px Share Tech Mono,monospace'; ctx.textAlign = 'center';
        ctx.fillText('T' + em.lvl, 0, 2*dpr);
        ctx.fillStyle = 'rgba(230,245,255,.78)'; ctx.font = 'bold ' + (5*dpr) + 'px Share Tech Mono,monospace';
        ctx.fillText(em.label, 0, 13*dpr);
        ctx.restore();
      });
    }

    // Operation stage label.
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    roundRect(ctx, 9*dpr, treeH + 8*dpr, 132*dpr, 30*dpr, 10*dpr); ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold ' + (8*dpr) + 'px Share Tech Mono,monospace';
    ctx.fillText('SINGLE FRONT', 18*dpr, treeH + 22*dpr);
    ctx.fillStyle = 'rgba(232,245,250,.80)';
    ctx.font = (7*dpr) + 'px Share Tech Mono,monospace';
    ctx.fillText('Contact Phase ' + (stateObj.wave || 1), 18*dpr, treeH + 34*dpr);

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  safe('patch drawVertical', function () {
    if (typeof drawVertical === 'function' && !drawVertical.__singleFront133) {
      var oldDrawVertical = drawVertical;
      drawVertical = function (s) {
        if (s) s._singleFrontMode = true;
        var result = oldDrawVertical.apply(this, arguments);
        try {
          var c = document.getElementById('battlefield');
          var context = c ? c.getContext('2d') : null;
          drawSingleFrontOverlay(context, s);
        } catch (_) {}
        return result;
      };
      drawVertical.__singleFront133 = true;
    }
  });

  safe('patch updateHUD', function () {
    if (typeof updateHUD === 'function' && !updateHUD.__singleFront133) {
      var oldUpdateHUD = updateHUD;
      updateHUD = function () {
        applyHeroPassiveMarkers();
        normalizeTurretProjectiles();
        var result = oldUpdateHUD.apply(this, arguments);
        updateHeroAbilityButton();
        var s = state();
        var chip = $('wave-chip');
        if (chip && s) {
          var hero = selectedHero();
          if (s.waveInProgress) chip.textContent = 'Single Front · Contact Phase ' + s.wave + ' · ' + ((s.enemies||[]).length + (s.enemiesToSpawn||0)) + ' contacts';
          else chip.textContent = 'Single Front · Phase ' + s.wave + ' ready · ' + hero.name;
        }
        var wbSub = $('waveBtnSub');
        if (wbSub && wbSub.textContent === 'LAUNCH WAVE') wbSub.textContent = 'LAUNCH CONTACT';
        if (wbSub && wbSub.textContent === 'BOSS WAVE') wbSub.textContent = 'BOSS CONTACT';
        return result;
      };
      updateHUD.__singleFront133 = true;
    }
  });

  function boot() {
    installStyles();
    renderHeroCards();
    retitleForSingleFront();
    applyHeroPassiveMarkers();
    ensureHeroAbilityButton();
    patchOrdersBoard();
    updateHeroAbilityButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 120); });
  else setTimeout(boot, 120);
  setInterval(function () { safe('single front refresh', function () { renderHeroCards(); retitleForSingleFront(); applyHeroPassiveMarkers(); normalizeTurretProjectiles(); patchOrdersBoard(); updateHeroAbilityButton(); }); }, 1200);
})();
