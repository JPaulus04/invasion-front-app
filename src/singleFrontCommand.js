// ══════════════════════════════════════════════════════════════
// Build 130 — Single Front Command Prototype
// Purpose: make Last Stand Command read as a hero-led single-front
// squad defense game instead of a standard three-lane tower defense.
// Keeps the old lane data internally as formation pods for stability.
// ══════════════════════════════════════════════════════════════
(function () {
  if (window.__LSC_SINGLE_FRONT_130__) return;
  window.__LSC_SINGLE_FRONT_130__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) { try { return fn(); } catch (e) { try { console.warn('[SingleFront130]', label, e); } catch (_) {} } }
  function state() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function meta() { return (typeof G !== 'undefined' && G.meta) ? G.meta : {}; }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); else console.log('[SingleFront130]', msg); }
  function hapticLight() { try { if (typeof haptic === 'function') haptic('light'); } catch (_) {} }

  var FORMATION_NAMES = ['Support Row', 'Fireline Row', 'Vanguard Row'];
  var FORMATION_SHORT = ['SUPPORT', 'FIRELINE', 'VANGUARD'];

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
    if ($('lsc-singlefront130-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-singlefront130-style';
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
      '.lsc-hero-ability{position:fixed;z-index:124;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 86px);min-width:128px;padding:10px 11px;border-radius:15px;border:1px solid rgba(255,209,102,.50);background:linear-gradient(180deg,rgba(32,22,6,.95),rgba(5,7,10,.92));box-shadow:0 16px 38px rgba(0,0,0,.48),inset 0 0 18px rgba(255,209,102,.07);color:#fff;text-align:left;-webkit-appearance:none;display:none}' +
      '.lsc-hero-ability b{display:block;font-family:Rajdhani,sans-serif;font-size:13px;letter-spacing:.8px;text-transform:uppercase;color:#ffd166}' +
      '.lsc-hero-ability span{display:block;margin-top:2px;font-family:Share Tech Mono,monospace;font-size:8px;line-height:1.3;color:rgba(235,230,210,.78)}' +
      '.lsc-hero-ability.cooling{opacity:.55;border-color:rgba(255,255,255,.18)}' +
      '@media (min-width:420px){.lsc-hero-grid{grid-template-columns:1fr 1fr}.lsc-hero-ability{right:20px;bottom:110px}}';
    document.head.appendChild(css);
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
      Array.from(document.querySelectorAll('button,div,span')).forEach(function (el) {
        var t = (el.textContent || '').trim();
        if (t === 'Top') el.textContent = 'Support';
        if (t === 'Mid') el.textContent = 'Fireline';
        if (t === 'Bottom') el.textContent = 'Vanguard';
        if (t === 'LAUNCH WAVE') el.textContent = 'LAUNCH CONTACT';
        if (t === 'BOSS WAVE') el.textContent = 'BOSS CONTACT';
        if (t === 'Fill All Lanes') el.textContent = 'Fill Formation';
        if (t === 'Save Current Lanes') el.textContent = 'Save Current Formation';
      });
    });
  }

  // ── Internal game reinterpretation ───────────────────────────
  // Keep three lane arrays for stability, but treat them as formation rows.
  safe('patch laneName', function () {
    if (typeof laneName === 'function' && !laneName.__singleFront130) {
      var oldLaneName = laneName;
      laneName = function (i) { return FORMATION_NAMES[i] || oldLaneName(i); };
      laneName.__singleFront130 = true;
    }
  });

  safe('patch spawnEnemy', function () {
    if (typeof spawnEnemy === 'function' && !spawnEnemy.__singleFront130) {
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
        }
        return result;
      };
      spawnEnemy.__singleFront130 = true;
    }
  });

  safe('patch nearestEnemy', function () {
    if (typeof nearestEnemy === 'function' && !nearestEnemy.__singleFront130) {
      var oldNearestEnemy = nearestEnemy;
      nearestEnemy = function (t) {
        var s = state();
        if (!s || !s._singleFrontMode) return oldNearestEnemy(t);
        var best = null, bestD = Infinity;
        var extRange = (s.perks && s.perks.extendedRange) || 0;
        var sniperBonus = (t.type && t.type.id === 'sniper' && s.perks && s.perks.sniperRange) ? s.perks.sniperRange : 0;
        var effectiveRange = (t.type.range || 500) * (1 + extRange + sniperBonus + 0.35);
        for (var i = 0; i < s.enemies.length; i++) {
          var e = s.enemies[i];
          var vis = !e.cloaked || e.slow > 0;
          if (!vis) continue;
          // Single-front command: all formation rows can fire into the central contact corridor.
          var d = Math.abs((e.x || 0) - (t.x || 0));
          if (d < effectiveRange && d < bestD) { best = e; bestD = d; }
        }
        return best;
      };
      nearestEnemy.__singleFront130 = true;
    }
  });

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
    btn.innerHTML = '<b>' + h.icon + ' ' + h.name.replace('Commander ', '').replace('Artillery ', '') + '</b><span>' + (cd > 0 ? ('Cooling ' + cd + 's') : h.active) + '</span>';
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

    // Hero command badge behind formation.
    var hro = selectedHero();
    ctx.fillStyle = 'rgba(0,0,0,.60)';
    ctx.strokeStyle = 'rgba(255,209,102,.50)';
    ctx.lineWidth = 1.2 * dpr;
    roundRect(ctx, W * .50 - 92*dpr, H - baseH + 7*dpr, 184*dpr, 22*dpr, 11*dpr); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold ' + (9*dpr) + 'px Share Tech Mono,monospace';
    ctx.textAlign = 'center';
    ctx.fillText(hro.icon + ' HERO COMMAND: ' + hro.name.replace('Commander ', '').toUpperCase(), W * .50, H - baseH + 22*dpr);

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
    if (typeof drawVertical === 'function' && !drawVertical.__singleFront130) {
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
      drawVertical.__singleFront130 = true;
    }
  });

  safe('patch updateHUD', function () {
    if (typeof updateHUD === 'function' && !updateHUD.__singleFront130) {
      var oldUpdateHUD = updateHUD;
      updateHUD = function () {
        applyHeroPassiveMarkers();
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
      updateHUD.__singleFront130 = true;
    }
  });

  function boot() {
    installStyles();
    renderHeroCards();
    retitleForSingleFront();
    applyHeroPassiveMarkers();
    ensureHeroAbilityButton();
    updateHeroAbilityButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 120); });
  else setTimeout(boot, 120);
  setInterval(function () { safe('single front refresh', function () { renderHeroCards(); retitleForSingleFront(); applyHeroPassiveMarkers(); updateHeroAbilityButton(); }); }, 1200);
})();
