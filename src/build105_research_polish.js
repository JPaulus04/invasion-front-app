// ═══════════════════════════════════════════════════════
//  build105_research_polish.js — Build 105 research UX polish
//  Loaded after Build 104 foundation.
//
//  Adds a clearer visual state system for Operations research:
//  COMPLETE / AVAILABLE / NEED XP / LOCKED TIER.
//  Collapses deep locked tiers so the player sees completed work,
//  current choices, and the next progression gate without clutter.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_BUILD105_RESEARCH_POLISH__) return;
  window.__LSC_BUILD105_RESEARCH_POLISH__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) {
    try { return fn(); }
    catch (e) { try { console.warn('[B105]', label, e); } catch (_) {} }
  }
  function getState() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); else console.log('[B105]', msg); }
  function buzz(kind) { try { if (typeof haptic === 'function') haptic(kind || 'light'); } catch (_) {} }

  var COLOR_DONE = '#d4a028';
  var COLOR_AVAILABLE = '#22d4ff';
  var COLOR_LOCKED = 'rgba(150,165,175,.42)';
  var COLOR_MUTED = 'rgba(166,188,168,.82)';

  function installStyles() {
    if ($('lsc-b105-style')) return;
    var style = document.createElement('style');
    style.id = 'lsc-b105-style';
    style.textContent = `
      @keyframes lscB105Pulse {
        0%, 100% { box-shadow: 0 0 9px rgba(34,212,255,.20), inset 0 0 0 1px rgba(34,212,255,.32); }
        50% { box-shadow: 0 0 18px rgba(34,212,255,.42), inset 0 0 0 1px rgba(34,212,255,.55); }
      }
      .lsc-b105-legend {
        display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin:0 0 12px;
      }
      .lsc-b105-legend div {
        border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:6px 7px;background:rgba(0,0,0,.22);
        font-family:'Share Tech Mono',monospace;font-size:7.5px;letter-spacing:.6px;color:var(--muted);text-transform:uppercase;
      }
      .lsc-b105-op-card {
        position:relative;overflow:hidden;border-radius:12px;padding:11px 10px;min-height:112px;
        transition:transform .12s ease, border-color .12s ease, background .12s ease;
      }
      .lsc-b105-op-card.available { animation:lscB105Pulse 1.8s ease-in-out infinite; }
      .lsc-b105-op-card.available:active { transform:scale(.985); }
      .lsc-b105-state {
        display:inline-flex;align-items:center;gap:4px;margin-bottom:6px;padding:3px 7px;border-radius:999px;
        font-family:'Share Tech Mono',monospace;font-size:7.5px;letter-spacing:.8px;text-transform:uppercase;
      }
      .lsc-b105-name { font-family:'Rajdhani',sans-serif;font-weight:800;font-size:13px;line-height:1.15;margin-bottom:5px; }
      .lsc-b105-desc { font-family:'Share Tech Mono',monospace;font-size:7.5px;color:var(--muted);line-height:1.35;margin-bottom:6px; }
      .lsc-b105-bullet { font-family:'Share Tech Mono',monospace;font-size:7.5px;line-height:1.4;margin-top:3px; }
      .lsc-b105-research-btn {
        width:100%;margin-top:9px;padding:7px 4px;border-radius:8px;border:1px solid var(--cyan);
        background:rgba(34,212,255,.15);color:var(--cyan);font-family:'Share Tech Mono',monospace;
        font-size:9px;letter-spacing:.7px;cursor:pointer;-webkit-appearance:none;
      }
      .lsc-b105-gate {
        margin:2px 0 10px;padding:12px 12px;border-radius:12px;border:1px dashed rgba(255,255,255,.11);
        background:linear-gradient(135deg,rgba(0,0,0,.38),rgba(10,20,34,.48));
        font-family:'Share Tech Mono',monospace;color:var(--muted);font-size:8px;line-height:1.5;text-align:center;
      }
    `;
    document.head.appendChild(style);
  }

  function opsDone(s, id) { return !!(s && s.opsNodes && s.opsNodes[id]); }
  function opsTierUnlocked(s, tier) {
    if (tier <= 1) return true;
    if (typeof OPS_NODES === 'undefined') return false;
    var prev = OPS_NODES.filter(function (n) { return n.tier === tier - 1; });
    return prev.some(function (n) { return opsDone(s, n.id); });
  }
  function opsTierAllDone(s, tier) {
    if (typeof OPS_NODES === 'undefined') return false;
    var nodes = OPS_NODES.filter(function (n) { return n.tier === tier; });
    return nodes.length > 0 && nodes.every(function (n) { return opsDone(s, n.id); });
  }

  function renderStateBadge(state, label) {
    var map = {
      done:      { bg:'rgba(212,160,40,.16)', border:'rgba(212,160,40,.46)', color:COLOR_DONE, icon:'✓' },
      available: { bg:'rgba(34,212,255,.14)', border:'rgba(34,212,255,.50)', color:COLOR_AVAILABLE, icon:'●' },
      need:      { bg:'rgba(255,255,255,.04)', border:'rgba(255,255,255,.10)', color:COLOR_MUTED, icon:'○' },
      locked:    { bg:'rgba(0,0,0,.22)', border:'rgba(255,255,255,.07)', color:COLOR_LOCKED, icon:'🔒' }
    };
    var m = map[state] || map.need;
    return '<div class="lsc-b105-state" style="background:' + m.bg + ';border:1px solid ' + m.border + ';color:' + m.color + '">' + m.icon + ' ' + label + '</div>';
  }

  function renderOpsCard(container, s, node, unlocked) {
    var done = opsDone(s, node.id);
    var xp = s.xp || 0;
    var canAfford = xp >= node.cost;
    var canAct = unlocked && !done && canAfford && !node.auto;
    var need = Math.max(0, node.cost - xp);
    var state = done ? 'done' : canAct ? 'available' : unlocked ? 'need' : 'locked';
    var label = done ? (node.auto ? 'ACTIVE' : 'COMPLETE') : canAct ? 'AVAILABLE' : unlocked ? ('NEED ' + need + ' XP') : 'LOCKED';

    var border = done ? 'rgba(212,160,40,.68)' : canAct ? 'rgba(34,212,255,.72)' : unlocked ? 'rgba(255,255,255,.11)' : 'rgba(255,255,255,.06)';
    var bg = done
      ? 'linear-gradient(145deg,rgba(212,160,40,.16),rgba(0,0,0,.24))'
      : canAct
        ? 'linear-gradient(145deg,rgba(34,212,255,.13),rgba(0,0,0,.24))'
        : unlocked
          ? 'linear-gradient(145deg,rgba(255,255,255,.035),rgba(0,0,0,.30))'
          : 'linear-gradient(145deg,rgba(0,0,0,.42),rgba(0,0,0,.22))';
    var nameColor = done ? COLOR_DONE : canAct ? '#eafcff' : unlocked ? COLOR_MUTED : 'rgba(150,165,175,.45)';
    var bulletColor = done ? COLOR_DONE : canAct ? COLOR_AVAILABLE : unlocked ? COLOR_MUTED : 'rgba(150,165,175,.42)';
    var opacity = unlocked || done ? '1' : '.38';

    var bullets = (node.effects || []).map(function (e) {
      return '<div class="lsc-b105-bullet" style="color:' + bulletColor + '">▸ ' + e + '</div>';
    }).join('');

    var card = document.createElement('div');
    card.className = 'lsc-b105-op-card ' + state;
    card.style.cssText = 'border:1px solid ' + border + ';background:' + bg + ';opacity:' + opacity + ';';
    card.innerHTML =
      renderStateBadge(state, label) +
      '<div class="lsc-b105-name" style="color:' + nameColor + '">' + node.name + '</div>' +
      '<div class="lsc-b105-desc">' + node.desc + '</div>' +
      bullets +
      (canAct ? '<button class="lsc-b105-research-btn" data-ops="' + node.id + '">RESEARCH · ' + node.cost + ' XP</button>' : '');

    if (canAct) {
      card.querySelector('[data-ops]').addEventListener('click', function (ev) {
        ev.stopPropagation();
        if ((s.xp || 0) < node.cost) return;
        s.xp -= node.cost;
        if (!s.opsNodes) s.opsNodes = {};
        s.opsNodes[node.id] = { completedAt: Date.now() };
        if (node.applyPerk) node.applyPerk(s);
        buzz('success');
        toast('✓ ' + node.name + ' unlocked');
        if (typeof renderResearchSheet === 'function') renderResearchSheet();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof saveGame === 'function') saveGame();
      });
    }

    container.appendChild(card);
  }

  function renderLockedGate(container, tier, tierName) {
    var gate = document.createElement('div');
    gate.className = 'lsc-b105-gate';
    gate.innerHTML =
      '<div style="font-size:12px;margin-bottom:3px">🔒</div>' +
      '<div style="color:rgba(220,230,235,.72);letter-spacing:1px">TIER ' + tier + ' — ' + tierName.toUpperCase() + '</div>' +
      '<div style="margin-top:4px">Complete at least one Tier ' + (tier - 1) + ' upgrade to reveal this command layer.</div>';
    container.appendChild(gate);
  }

  function renderTierLabel(container, s, tier, tierName, unlocked) {
    var allDone = opsTierAllDone(s, tier);
    var color = !unlocked ? 'var(--muted)' : allDone ? COLOR_DONE : COLOR_AVAILABLE;
    var label = 'T' + tier + ' — ' + tierName.toUpperCase();
    if (allDone) label = '✓ ' + label;
    var lbl = document.createElement('div');
    lbl.style.cssText = 'display:flex;align-items:center;gap:8px;margin:' + (tier > 1 ? '8px' : '0') + ' 0 8px;';
    lbl.innerHTML =
      '<div style="flex:1;height:1px;background:' + (unlocked ? 'rgba(34,212,255,.22)' : 'rgba(255,255,255,.07)') + '"></div>' +
      '<span style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:' + color + ';letter-spacing:1.05px;white-space:nowrap">' + label + '</span>' +
      '<div style="flex:1;height:1px;background:' + (unlocked ? 'rgba(34,212,255,.22)' : 'rgba(255,255,255,.07)') + '"></div>';
    container.appendChild(lbl);
  }

  function installOpsRenderer() {
    safe('install operations renderer', function () {
      if (typeof _renderOpsSheet !== 'function' || _renderOpsSheet.__b105) return;

      _renderOpsSheet = function (container, s) {
        installStyles();
        if (!s.opsNodes) s.opsNodes = {};

        var xpEl = document.createElement('div');
        xpEl.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;padding:9px 12px;border-radius:9px;border:1px solid rgba(212,160,40,.3);background:rgba(212,160,40,.06);';
        xpEl.innerHTML = '<span style="font-size:14px">⭐</span>' +
          '<span style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:15px;color:#d4a028">' + (s.xp || 0) + ' XP</span>' +
          '<span style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--muted);margin-left:4px">earned from kills + wave clears</span>';
        container.appendChild(xpEl);

        var tipEl = document.createElement('div');
        tipEl.style.cssText = 'font-size:9px;color:var(--muted);margin-bottom:10px;padding:0 2px;line-height:1.55;font-family:var(--font-mono,monospace);';
        tipEl.textContent = 'Build from foundation upgrades into elite command systems. Completed research persists through World Prestige.';
        container.appendChild(tipEl);

        var legend = document.createElement('div');
        legend.className = 'lsc-b105-legend';
        legend.innerHTML =
          '<div><span style="color:' + COLOR_DONE + '">✓ Complete</span></div>' +
          '<div><span style="color:' + COLOR_AVAILABLE + '">● Available</span></div>' +
          '<div><span style="color:' + COLOR_MUTED + '">○ Need XP</span></div>' +
          '<div><span style="color:' + COLOR_LOCKED + '">🔒 Locked tier</span></div>';
        container.appendChild(legend);

        if (typeof OPS_NODES === 'undefined' || !Array.isArray(OPS_NODES)) {
          var empty = document.createElement('div');
          empty.style.cssText = 'font-family:Share Tech Mono,monospace;font-size:9px;color:var(--muted);padding:12px;text-align:center;border:1px dashed var(--line);border-radius:10px;';
          empty.textContent = 'Operations research unavailable.';
          container.appendChild(empty);
          return;
        }

        var tierNames = {
          1: 'Foundation',
          2: 'Specialization',
          3: 'Advanced Training',
          4: 'Elite Doctrine',
          5: 'Command Supremacy'
        };

        var firstLockedGateShown = false;
        for (var tier = 1; tier <= 5; tier++) {
          var nodes = OPS_NODES.filter(function (n) { return n.tier === tier; });
          if (!nodes.length) continue;
          var unlocked = opsTierUnlocked(s, tier);

          if (!unlocked) {
            if (!firstLockedGateShown) {
              renderLockedGate(container, tier, tierNames[tier] || 'Locked');
              firstLockedGateShown = true;
            }
            continue;
          }

          renderTierLabel(container, s, tier, tierNames[tier] || ('Tier ' + tier), unlocked);

          var grid = document.createElement('div');
          grid.style.cssText = 'display:grid;grid-template-columns:repeat(' + Math.min(nodes.length, 2) + ',1fr);gap:8px;margin-bottom:6px;';
          nodes.forEach(function (node) { renderOpsCard(grid, s, node, unlocked); });
          container.appendChild(grid);
        }
      };
      _renderOpsSheet.__b105 = true;
    });
  }

  function polishExistingResearch() {
    safe('polish existing research DOM', function () {
      var root = $('upgrade-list-all');
      if (!root) return;
      // Make the active Operations tab label read better if present.
      var all = root.querySelectorAll('span,div');
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (!el || el.childNodes.length !== 1) continue;
        var txt = (el.textContent || '').trim();
        if (txt === 'T1 — ENLISTMENT') el.textContent = 'T1 — FOUNDATION';
        if (txt === 'T3 — ELITE TRAINING') el.textContent = 'T3 — ADVANCED TRAINING';
        if (txt === 'T4 — DOCTRINE FORMATIONS') el.textContent = 'T4 — ELITE DOCTRINE';
        if (txt === 'T5 — SPECIAL OPERATIONS') el.textContent = 'T5 — COMMAND SUPREMACY';
      }
    });
  }

  function boot() {
    installStyles();
    installOpsRenderer();
    if (typeof renderResearchSheet === 'function' && $('upgrade-list-all')) {
      safe('rerender research', function () { renderResearchSheet(); polishExistingResearch(); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); });
  else setTimeout(boot, 80);

  setInterval(function () {
    safe('periodic polish', function () { installOpsRenderer(); polishExistingResearch(); });
  }, 1800);

  window.LSC_B105 = { refreshResearch: boot };
})();
