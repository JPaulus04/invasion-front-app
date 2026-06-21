// ═══════════════════════════════════════════════════════
//  loadouts.js — Saved troop formation loadouts
//  Permanent module. Defines player-selectable lane formations
//  that officers use when auto-filling troops at wave start.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_FORMATION_LOADOUTS__) return;
  window.__LSC_FORMATION_LOADOUTS__ = true;

  var PRESET_LOADOUTS = {
    balanced: {
      id:'balanced', icon:'⚖️', label:'Balanced',
      desc:'Reliable mix for pushing normal waves.',
      lanes:{
        0:['rifle','heavy','medic','rifle','heavy'],
        1:['heavy','rifle','medic','heavy','rifle'],
        2:['rifle','heavy','medic','rifle','heavy']
      }
    },
    bossPush: {
      id:'bossPush', icon:'🎯', label:'Boss Push',
      desc:'More heavy pressure with support mixed in.',
      lanes:{
        0:['heavy','medic','heavy','sniper','rifle'],
        1:['heavy','heavy','medic','grenadier','rifle'],
        2:['heavy','medic','heavy','sniper','rifle']
      }
    },
    creditFarm: {
      id:'creditFarm', icon:'💰', label:'Credit Farm',
      desc:'Lower-cost sustain while building credits.',
      lanes:{
        0:['rifle','rifle','medic','rifle','heavy'],
        1:['rifle','medic','rifle','heavy','rifle'],
        2:['rifle','rifle','medic','rifle','heavy']
      }
    }
  };

  var CUSTOM_ID = 'custom';
  var LANE_NAMES = ['LEFT','CENTER','RIGHT'];

  function state() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function meta() { if (typeof G === 'undefined') return null; if (!G.meta) G.meta = {}; return G.meta; }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); else console.log('[Loadouts]', msg); }
  function buzz(kind) { try { if (typeof haptic === 'function') haptic(kind || 'light'); } catch (_) {} }
  function saveAll() {
    try { if (typeof saveMeta === 'function' && G && G.meta) saveMeta(G.meta); } catch (_) {}
    try { if (typeof saveGame === 'function') saveGame(); } catch (_) {}
  }

  function ensureLoadouts() {
    var m = meta();
    if (!m) return null;
    if (!m.commandLoadouts) {
      m.commandLoadouts = {
        selected: 'balanced',
        custom: null,
        seen: Date.now()
      };
    }
    if (!m.commandLoadouts.selected) m.commandLoadouts.selected = 'balanced';
    return m.commandLoadouts;
  }

  function selectedId() {
    var l = ensureLoadouts();
    return (l && l.selected) || 'balanced';
  }

  function getLoadout(id) {
    var l = ensureLoadouts();
    if (id === CUSTOM_ID && l && l.custom && l.custom.lanes) return l.custom;
    return PRESET_LOADOUTS[id] || PRESET_LOADOUTS.balanced;
  }

  function getSelectedLoadout() {
    return getLoadout(selectedId());
  }

  function laneTroopsFromState(lane) {
    var s = state();
    return ((s && s.troops) || [])
      .filter(function (t) { return t && t.lane === lane && t.type && t.type.id; })
      .sort(function (a, b) { return (a.slot || 0) - (b.slot || 0); })
      .map(function (t) { return t.type.id; });
  }

  function captureCurrentFormation() {
    var s = state(), l = ensureLoadouts();
    if (!s || !l) return false;
    var lanes = { 0:laneTroopsFromState(0), 1:laneTroopsFromState(1), 2:laneTroopsFromState(2) };
    var total = lanes[0].length + lanes[1].length + lanes[2].length;
    if (!total) {
      toast('Deploy troops first, then save the formation.');
      return false;
    }
    // Backfill empty lanes from Balanced so officers still have a usable pattern.
    [0,1,2].forEach(function (lane) {
      if (!lanes[lane].length) lanes[lane] = PRESET_LOADOUTS.balanced.lanes[lane].slice();
    });
    l.custom = {
      id:CUSTOM_ID,
      icon:'🧩',
      label:'My Formation',
      desc:'Saved from your current lanes.',
      lanes:lanes,
      savedAt:Date.now(),
      wave:s.wave || 1
    };
    l.selected = CUSTOM_ID;
    saveAll();
    buzz('success');
    toast('Saved My Formation for officer auto-fill');
    return true;
  }

  function setSelectedLoadout(id) {
    var l = ensureLoadouts();
    if (!l) return;
    if (id === CUSTOM_ID && (!l.custom || !l.custom.lanes)) {
      toast('No custom formation saved yet.');
      return;
    }
    l.selected = id;
    saveAll();
    buzz('light');
    toast('Formation selected: ' + getLoadout(id).label);
  }

  function uniqueInOrder(list) {
    var seen = {}, out = [];
    (list || []).forEach(function (id) {
      if (!id || seen[id]) return;
      seen[id] = true;
      out.push(id);
    });
    return out;
  }

  function getLoadoutUnitCandidates(s, lane) {
    var loadout = getSelectedLoadout();
    if (!loadout || !loadout.lanes) return [];
    var pattern = loadout.lanes[lane] || loadout.lanes[String(lane)] || [];
    if (!pattern.length) return [];
    var existing = ((s && s.troops) || []).filter(function (t) { return t && t.lane === lane; }).length;
    var start = existing % pattern.length;
    var ordered = [];
    for (var i = 0; i < pattern.length; i++) ordered.push(pattern[(start + i) % pattern.length]);
    return uniqueInOrder(ordered);
  }

  function shortPattern(loadout, lane) {
    var p = (loadout && loadout.lanes && (loadout.lanes[lane] || loadout.lanes[String(lane)])) || [];
    return p.map(function (id) { return id.replace('grenadier','gren').replace('rifle','rif').replace('heavy','hvy').replace('medic','med').replace('sniper','snp'); }).join(' · ');
  }

  function renderLoadoutPanel() {
    var l = ensureLoadouts();
    var selected = (l && l.selected) || 'balanced';
    var selectedLoadout = getLoadout(selected);
    var options = [PRESET_LOADOUTS.balanced, PRESET_LOADOUTS.bossPush, PRESET_LOADOUTS.creditFarm];
    if (l && l.custom && l.custom.lanes) options.push(l.custom);

    var html = '<div class="lsc-loadout-panel">' +
      '<div class="lsc-loadout-head"><span>FORMATION LOADOUT</span><b>' + selectedLoadout.icon + ' ' + selectedLoadout.label + '</b></div>' +
      '<div class="lsc-loadout-desc">Officers refill lanes toward the selected formation instead of forcing one troop type.</div>' +
      '<div class="lsc-loadout-options">' + options.map(function (o) {
        return '<button class="lsc-loadout-btn ' + (selected === o.id ? 'active' : '') + '" data-loadout-select="' + o.id + '">' + o.icon + '<b>' + o.label + '</b><small>' + o.desc + '</small></button>';
      }).join('') + '</div>' +
      '<div class="lsc-loadout-lanes">' + [0,1,2].map(function (lane) {
        return '<div><span>' + LANE_NAMES[lane] + '</span><em>' + shortPattern(selectedLoadout, lane) + '</em></div>';
      }).join('') + '</div>' +
      '<button class="lsc-staff-btn2 gold lsc-save-loadout" data-loadout-save="current">Save Current Lanes as My Formation</button>' +
      '</div>';
    return html;
  }

  function wireLoadoutPanel(root, rerender) {
    if (!root) return;
    root.querySelectorAll('[data-loadout-select]').forEach(function (b) {
      b.addEventListener('click', function () {
        setSelectedLoadout(b.dataset.loadoutSelect);
        if (typeof rerender === 'function') rerender();
      });
    });
    root.querySelectorAll('[data-loadout-save]').forEach(function (b) {
      b.addEventListener('click', function () {
        captureCurrentFormation();
        if (typeof rerender === 'function') rerender();
      });
    });
  }



  // ── Barracks quick formation reload ─────────────────────────────
  function laneCount(lane) {
    var s = state();
    return ((s && s.troops) || []).filter(function (t) { return t && t.lane === lane; }).length;
  }

  function troopSlotsSafe(s) {
    try { return UNLOCKS.troopSlots(s.prestige); } catch (_) { return 5; }
  }

  function unitDef(id) {
    try { return (UNIT_DEFS || []).find(function (u) { return u && u.id === id; }); } catch (_) { return null; }
  }

  function unitReady(s, id) {
    try { if (typeof _isUnitUnlocked === 'function') return !!_isUnitUnlocked(s, id); } catch (_) {}
    return !!unitDef(id);
  }

  function unitCost(s, id) {
    var def = unitDef(id);
    if (!def) return Infinity;
    try { return troopCost(def); } catch (_) { return def.baseCost || def.cost || 0; }
  }

  function lanePattern(lane) {
    var loadout = getSelectedLoadout();
    var pattern = (loadout && loadout.lanes && (loadout.lanes[lane] || loadout.lanes[String(lane)])) || [];
    return pattern.slice();
  }

  function pickNextLoadoutUnit(s, lane) {
    var pattern = lanePattern(lane);
    if (!pattern.length) return null;
    var existing = laneCount(lane);
    // Try the next desired slot first, then continue through the saved pattern.
    for (var i = 0; i < pattern.length * 2; i++) {
      var id = pattern[(existing + i) % pattern.length];
      if (!unitReady(s, id)) continue;
      var cost = unitCost(s, id);
      if (s.credits >= cost) return id;
    }
    return null;
  }

  function deployLoadoutUnitToLane(id, lane) {
    var s = state();
    if (!s || !id) return false;
    var beforeCount = laneCount(lane);
    var beforeCredits = s.credits || 0;
    var oldLane = s.selectedLane;
    s.selectedLane = lane;
    try {
      if (typeof _deployUnitPatched === 'function') _deployUnitPatched(id);
      else if (typeof deployUnit === 'function') deployUnit(id);
    } catch (_) {}
    s.selectedLane = oldLane;
    var afterCount = laneCount(lane);
    var spent = beforeCredits - (s.credits || 0);
    if (afterCount > beforeCount) {
      try { if (typeof _questTick === 'function') _questTick('deploys', 1); } catch (_) {}
      try {
        var slots = troopSlotsSafe(s);
        if (laneCount(lane) >= slots && typeof _questTick === 'function') _questTick('fullpos', 1);
      } catch (_) {}
      return { ok:true, spent:Math.max(0, spent), id:id };
    }
    return { ok:false, spent:0, id:id };
  }

  function fillLaneFromSelectedLoadout(lane) {
    var s = state();
    if (!s) return { added:0, spent:0, reason:'No active run' };
    var slots = troopSlotsSafe(s);
    var added = 0, spent = 0, attempts = 0;
    while (laneCount(lane) < slots && attempts < slots + 3) {
      attempts++;
      var id = pickNextLoadoutUnit(s, lane);
      if (!id) break;
      var result = deployLoadoutUnitToLane(id, lane);
      if (!result || !result.ok) break;
      added++;
      spent += result.spent || 0;
    }
    return { added:added, spent:spent, reason: added ? '' : 'No affordable matching troops' };
  }

  function fillAllLanesFromSelectedLoadout() {
    var totals = { added:0, spent:0 };
    [0,1,2].forEach(function (lane) {
      var r = fillLaneFromSelectedLoadout(lane);
      totals.added += r.added || 0;
      totals.spent += r.spent || 0;
    });
    return totals;
  }

  function selectedLaneName() {
    var s = state();
    return LANE_NAMES[(s && typeof s.selectedLane === 'number') ? s.selectedLane : 0] || 'LANE';
  }

  function renderBarracksQuickLoadoutPanel() {
    var s = state();
    if (!s) return null;
    var loadout = getSelectedLoadout();
    var lane = (typeof s.selectedLane === 'number') ? s.selectedLane : 0;
    var slots = troopSlotsSafe(s);
    var count = laneCount(lane);
    var panel = document.createElement('div');
    panel.id = 'lsc-barracks-loadout-quick';
    panel.className = 'lsc-barracks-loadout-quick';
    panel.innerHTML =
      '<div class="lsc-bq-head"><span>FORMATION QUICK RELOAD</span><b>' + (loadout.icon || '🧩') + ' ' + loadout.label + '</b></div>' +
      '<div class="lsc-bq-sub">' + selectedLaneName() + ' lane · ' + count + '/' + slots + ' deployed · ' + Math.floor(s.credits || 0) + ' cr</div>' +
      '<div class="lsc-bq-pattern"><span>Target</span><em>' + shortPattern(loadout, lane) + '</em></div>' +
      '<div class="lsc-bq-actions">' +
        '<button type="button" class="lsc-bq-btn primary" data-bq-fill-lane="1">Fill ' + selectedLaneName() + '</button>' +
        '<button type="button" class="lsc-bq-btn" data-bq-fill-all="1">Fill All Lanes</button>' +
      '</div>' +
      '<button type="button" class="lsc-bq-save" data-bq-save-current="1">Save Current Battlefield as My Formation</button>';
    return panel;
  }

  function injectBarracksQuickPanel() {
    var list = document.getElementById('troop-list');
    if (!list) return;
    var old = document.getElementById('lsc-barracks-loadout-quick');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var panel = renderBarracksQuickLoadoutPanel();
    if (!panel) return;
    list.insertBefore(panel, list.firstChild);
    panel.querySelectorAll('[data-bq-fill-lane]').forEach(function (b) {
      b.addEventListener('click', function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        var s = state();
        var lane = (s && typeof s.selectedLane === 'number') ? s.selectedLane : 0;
        var r = fillLaneFromSelectedLoadout(lane);
        saveAll();
        buzz(r.added ? 'success' : 'light');
        toast(r.added ? ('Filled ' + LANE_NAMES[lane] + ' +' + r.added + ' troops') : (r.reason || 'No troops added'));
        try { if (typeof updateHUD === 'function') updateHUD(); } catch (_) {}
        try { if (typeof renderEnlistSheet === 'function') renderEnlistSheet(); } catch (_) {}
      });
    });
    panel.querySelectorAll('[data-bq-fill-all]').forEach(function (b) {
      b.addEventListener('click', function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        var r = fillAllLanesFromSelectedLoadout();
        saveAll();
        buzz(r.added ? 'success' : 'light');
        toast(r.added ? ('Formation reloaded +' + r.added + ' troops') : 'No affordable matching troops');
        try { if (typeof updateHUD === 'function') updateHUD(); } catch (_) {}
        try { if (typeof renderEnlistSheet === 'function') renderEnlistSheet(); } catch (_) {}
      });
    });
    panel.querySelectorAll('[data-bq-save-current]').forEach(function (b) {
      b.addEventListener('click', function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        captureCurrentFormation();
        try { if (typeof renderEnlistSheet === 'function') renderEnlistSheet(); } catch (_) {}
      });
    });
  }

  function installBarracksQuickReloadPatch() {
    var fn = null;
    try { fn = window.renderEnlistSheet || (typeof renderEnlistSheet === 'function' ? renderEnlistSheet : null); } catch (_) {}
    if (!fn || fn.__lscLoadoutQuickReloadPatched) return false;
    var patched = function () {
      var out = fn.apply(this, arguments);
      try { injectBarracksQuickPanel(); } catch (_) {}
      return out;
    };
    patched.__lscLoadoutQuickReloadPatched = true;
    window.renderEnlistSheet = patched;
    try { renderEnlistSheet = patched; } catch (_) {}
    return true;
  }

  function tryInstallBarracksQuickReloadPatch() {
    if (installBarracksQuickReloadPatch()) return;
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (installBarracksQuickReloadPatch() || tries > 20) clearInterval(timer);
    }, 150);
  }

  function installLoadoutStyles() {
    if (document.getElementById('lsc-loadout-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-loadout-style';
    css.textContent = `
      .lsc-loadout-panel{border:1px solid rgba(34,212,255,.20);border-radius:13px;background:rgba(34,212,255,.045);padding:9px;margin:8px 0 10px;box-shadow:inset 0 0 20px rgba(34,212,255,.035)}
      .lsc-loadout-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px}.lsc-loadout-head span{font-family:'Share Tech Mono',monospace;font-size:7.5px;letter-spacing:1.2px;color:var(--cyan)}.lsc-loadout-head b{font-family:'Rajdhani',sans-serif;font-size:14px;color:#eaf6ff}
      .lsc-loadout-desc{font-family:'Share Tech Mono',monospace;font-size:7.5px;color:var(--muted);line-height:1.45;margin-bottom:7px}.lsc-loadout-options{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.lsc-loadout-btn{min-height:54px;border-radius:10px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.20);color:rgba(220,232,240,.78);font-family:'Rajdhani',sans-serif;font-weight:900;font-size:15px;-webkit-appearance:none;padding:5px}.lsc-loadout-btn b{display:block;font-size:11px;line-height:1.05}.lsc-loadout-btn small{display:block;font-family:'Share Tech Mono',monospace;font-size:6.5px;line-height:1.1;color:rgba(185,207,210,.62);margin-top:2px}.lsc-loadout-btn.active{border-color:var(--cyan);background:rgba(34,212,255,.13);color:var(--cyan);box-shadow:0 0 13px rgba(34,212,255,.10)}
      .lsc-loadout-lanes{display:grid;grid-template-columns:1fr;gap:3px;margin:7px 0}.lsc-loadout-lanes div{display:grid;grid-template-columns:48px 1fr;gap:6px;border-top:1px solid rgba(255,255,255,.045);padding-top:3px}.lsc-loadout-lanes div:first-child{border-top:0}.lsc-loadout-lanes span{font-family:'Share Tech Mono',monospace;font-size:7px;color:var(--cyan);letter-spacing:.8px}.lsc-loadout-lanes em{font-family:'Share Tech Mono',monospace;font-size:7px;color:var(--muted);font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lsc-save-loadout{width:100%;margin-top:3px}

      .lsc-barracks-loadout-quick{border:1px solid rgba(34,212,255,.24);border-radius:13px;background:rgba(34,212,255,.055);padding:9px 10px;margin:0 0 12px;box-shadow:inset 0 0 18px rgba(34,212,255,.035)}
      .lsc-bq-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px}.lsc-bq-head span{font-family:'Share Tech Mono',monospace;font-size:7.5px;letter-spacing:1.3px;color:var(--cyan)}.lsc-bq-head b{font-family:'Rajdhani',sans-serif;font-size:14px;color:#eaf6ff}.lsc-bq-sub{font-family:'Share Tech Mono',monospace;font-size:7.5px;color:var(--muted);margin-bottom:5px}.lsc-bq-pattern{display:grid;grid-template-columns:46px 1fr;gap:7px;border-top:1px solid rgba(255,255,255,.055);border-bottom:1px solid rgba(255,255,255,.055);padding:5px 0;margin-bottom:7px}.lsc-bq-pattern span{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:.8px;color:var(--cyan)}.lsc-bq-pattern em{font-family:'Share Tech Mono',monospace;font-size:7.5px;color:var(--muted);font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lsc-bq-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:6px}.lsc-bq-btn,.lsc-bq-save{border-radius:10px;border:1px solid rgba(34,212,255,.55);background:rgba(34,212,255,.08);color:var(--cyan);font-family:'Rajdhani',sans-serif;font-weight:900;font-size:13px;letter-spacing:.5px;padding:8px 7px;-webkit-appearance:none}.lsc-bq-btn.primary{border-color:var(--amber);background:rgba(255,190,0,.09);color:var(--amber)}.lsc-bq-save{width:100%;font-size:11.5px;border-color:rgba(255,190,0,.38);background:rgba(255,190,0,.055);color:rgba(255,216,130,.9)}
    `;
    document.head.appendChild(css);
  }

  window.LSC_LOADOUT_PRESETS = PRESET_LOADOUTS;
  window.LSC_getSelectedLoadout = getSelectedLoadout;
  window.LSC_getLoadoutUnitCandidates = getLoadoutUnitCandidates;
  window.LSC_renderLoadoutPanel = renderLoadoutPanel;
  window.LSC_wireLoadoutPanel = wireLoadoutPanel;
  window.LSC_captureCurrentFormation = captureCurrentFormation;
  window.LSC_selectFormationLoadout = setSelectedLoadout;
  window.LSC_fillCurrentLaneFromLoadout = function () { var s = state(); return fillLaneFromSelectedLoadout(s && typeof s.selectedLane === 'number' ? s.selectedLane : 0); };
  window.LSC_fillAllLanesFromLoadout = fillAllLanesFromSelectedLoadout;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { ensureLoadouts(); installLoadoutStyles(); tryInstallBarracksQuickReloadPatch(); });
  else setTimeout(function () { ensureLoadouts(); installLoadoutStyles(); tryInstallBarracksQuickReloadPatch(); }, 0);
})();
