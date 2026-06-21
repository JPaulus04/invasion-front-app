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

  function installLoadoutStyles() {
    if (document.getElementById('lsc-loadout-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-loadout-style';
    css.textContent = `
      .lsc-loadout-panel{border:1px solid rgba(34,212,255,.20);border-radius:13px;background:rgba(34,212,255,.045);padding:9px;margin:8px 0 10px;box-shadow:inset 0 0 20px rgba(34,212,255,.035)}
      .lsc-loadout-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px}.lsc-loadout-head span{font-family:'Share Tech Mono',monospace;font-size:7.5px;letter-spacing:1.2px;color:var(--cyan)}.lsc-loadout-head b{font-family:'Rajdhani',sans-serif;font-size:14px;color:#eaf6ff}
      .lsc-loadout-desc{font-family:'Share Tech Mono',monospace;font-size:7.5px;color:var(--muted);line-height:1.45;margin-bottom:7px}.lsc-loadout-options{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.lsc-loadout-btn{min-height:54px;border-radius:10px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.20);color:rgba(220,232,240,.78);font-family:'Rajdhani',sans-serif;font-weight:900;font-size:15px;-webkit-appearance:none;padding:5px}.lsc-loadout-btn b{display:block;font-size:11px;line-height:1.05}.lsc-loadout-btn small{display:block;font-family:'Share Tech Mono',monospace;font-size:6.5px;line-height:1.1;color:rgba(185,207,210,.62);margin-top:2px}.lsc-loadout-btn.active{border-color:var(--cyan);background:rgba(34,212,255,.13);color:var(--cyan);box-shadow:0 0 13px rgba(34,212,255,.10)}
      .lsc-loadout-lanes{display:grid;grid-template-columns:1fr;gap:3px;margin:7px 0}.lsc-loadout-lanes div{display:grid;grid-template-columns:48px 1fr;gap:6px;border-top:1px solid rgba(255,255,255,.045);padding-top:3px}.lsc-loadout-lanes div:first-child{border-top:0}.lsc-loadout-lanes span{font-family:'Share Tech Mono',monospace;font-size:7px;color:var(--cyan);letter-spacing:.8px}.lsc-loadout-lanes em{font-family:'Share Tech Mono',monospace;font-size:7px;color:var(--muted);font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lsc-save-loadout{width:100%;margin-top:3px}
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { ensureLoadouts(); installLoadoutStyles(); });
  else setTimeout(function () { ensureLoadouts(); installLoadoutStyles(); }, 0);
})();
