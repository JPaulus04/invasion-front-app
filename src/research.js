// ═══════════════════════════════════════════════════════
//  research.js — consolidated permanent research UI module
//  Replaces build105/build106/build107 patch files.
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
//  research.js — Operations research visual state renderer
//  Consolidated into permanent research module.
//
//  Adds a clearer visual state system for Operations research:
//  COMPLETE / AVAILABLE / NEED XP / LOCKED TIER.
//  Collapses deep locked tiers so the player sees completed work,
//  current choices, and the next progression gate without clutter.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_RESEARCH_VISUALS__) return;
  window.__LSC_RESEARCH_VISUALS__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) {
    try { return fn(); }
    catch (e) { try { console.warn('[Research]', label, e); } catch (_) {} }
  }
  function getState() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); else console.log('[Research]', msg); }
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
        display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:0 0 8px;
      }
      .lsc-b105-legend div {
        border:1px solid rgba(255,255,255,.07);border-radius:7px;padding:4px 4px;background:rgba(0,0,0,.18);
        font-family:'Share Tech Mono',monospace;font-size:6.8px;letter-spacing:.45px;color:var(--muted);text-transform:uppercase;text-align:center;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
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
          '<div><span style="color:' + COLOR_DONE + '">✓ Done</span></div>' +
          '<div><span style="color:' + COLOR_AVAILABLE + '">● Now</span></div>' +
          '<div><span style="color:' + COLOR_MUTED + '">○ Need XP</span></div>' +
          '<div><span style="color:' + COLOR_LOCKED + '">🔒 Locked</span></div>';
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

  window.LSC_RESEARCH_VISUALS = { refreshResearch: boot };
})();


// ═══════════════════════════════════════════════════════
//  research.js — research layout normalization
//  Consolidated into permanent research module.
//
//  Fixes the sticky research queue bar overlapping the research tabs,
//  XP panel, and first row of nodes on iPhone/TestFlight.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_RESEARCH_LAYOUT_FIX__) return;
  window.__LSC_RESEARCH_LAYOUT_FIX__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) {
    try { return fn(); }
    catch (e) { try { console.warn('[Research]', label, e); } catch (_) {} }
  }

  function installStyles() {
    if ($('lsc-b106-style')) return;
    var style = document.createElement('style');
    style.id = 'lsc-b106-style';
    style.textContent = `
      #upgrade-list-all {
        overflow-x:hidden !important;
        scroll-padding-top:0 !important;
      }
      .lsc-b106-queue-normalized {
        position:relative !important;
        top:auto !important;
        z-index:1 !important;
        transform:none !important;
        margin:0 -16px 14px !important;
        box-shadow:none !important;
      }
      .lsc-b106-tab-safe-row {
        position:relative !important;
        z-index:2 !important;
        margin-top:0 !important;
      }
      .lsc-b106-header-safe {
        position:relative !important;
        z-index:2 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function findQueueBar(root) {
    if (!root) return null;
    var kids = Array.prototype.slice.call(root.children || []);
    for (var i = 0; i < kids.length; i++) {
      var txt = (kids[i].textContent || '').replace(/\s+/g, ' ').trim();
      if (/\bQUEUE\b/i.test(txt) && /\d+\s*\/\s*\d+/.test(txt)) return kids[i];
    }
    return null;
  }

  function normalizeQueueBar(root) {
    var qBar = findQueueBar(root);
    if (!qBar) return;
    qBar.classList.add('lsc-b106-queue-normalized');
    qBar.style.position = 'relative';
    qBar.style.top = 'auto';
    qBar.style.zIndex = '1';
    qBar.style.transform = 'none';
    qBar.style.margin = '0 -16px 14px';
    qBar.style.boxShadow = 'none';
  }

  function normalizeRows(root) {
    if (!root) return;
    var qBar = findQueueBar(root);
    var kids = Array.prototype.slice.call(root.children || []);

    // The branch tab row is usually the first flex row after the queue bar.
    // Keep it above normal content but below the sheet header.
    for (var i = 0; i < kids.length; i++) {
      if (kids[i] === qBar) continue;
      var st = (kids[i].getAttribute('style') || '');
      var txt = (kids[i].textContent || '').replace(/\s+/g, ' ').trim();
      if (/display\s*:\s*flex/i.test(st) && /DONE|\d+\/\d+|OPS|TIER/i.test(txt)) {
        kids[i].classList.add('lsc-b106-tab-safe-row');
        break;
      }
    }

    // Protect the first non-queue information block so it does not visually slip
    // under the normalized queue row during fast scroll/re-render on mobile Safari.
    for (var j = 0; j < kids.length; j++) {
      if (kids[j] !== qBar) {
        kids[j].classList.add('lsc-b106-header-safe');
        break;
      }
    }
  }

  function normalizeResearchLayout() {
    safe('normalize research layout', function () {
      installStyles();
      var root = $('upgrade-list-all');
      if (!root) return;
      normalizeQueueBar(root);
      normalizeRows(root);
    });
  }

  function wrapRenderResearch() {
    safe('wrap renderResearchSheet', function () {
      if (typeof renderResearchSheet !== 'function' || renderResearchSheet.__b106) return;
      var original = renderResearchSheet;
      renderResearchSheet = function () {
        var result = original.apply(this, arguments);
        setTimeout(normalizeResearchLayout, 0);
        setTimeout(normalizeResearchLayout, 80);
        return result;
      };
      renderResearchSheet.__b106 = true;
    });
  }

  function boot() {
    installStyles();
    wrapRenderResearch();
    normalizeResearchLayout();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); });
  } else {
    setTimeout(boot, 80);
  }

  // Sheets are re-rendered often; keep the fix resilient without touching gameplay.
  setInterval(function () {
    wrapRenderResearch();
    normalizeResearchLayout();
  }, 1200);

  window.LSC_RESEARCH_LAYOUT = { refreshResearchLayout: normalizeResearchLayout };
})();


// ═══════════════════════════════════════════════════════
//  research.js — research queue polish
//  Consolidated into permanent research module.
//
//  Focus:
//  • Queue-full cards read as QUEUE FULL instead of looking purchasable
//  • Queued/researching cards show a stronger active state + progress bar
//  • Locked future tiers collapse their locked card grids until unlocked
//  • Adds safer spacing below the Upgrades header on mobile
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_RESEARCH_QUEUE_POLISH__) return;
  window.__LSC_RESEARCH_QUEUE_POLISH__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) {
    try { return fn(); }
    catch (e) { try { console.warn('[Research]', label, e); } catch (_) {} }
  }
  function toast(msg) { try { if (typeof showToast === 'function') showToast(msg); } catch (_) {} }
  function buzz(kind) { try { if (typeof haptic === 'function') haptic(kind || 'light'); } catch (_) {} }

  function installStyles() {
    if ($('lsc-b107-style')) return;
    var style = document.createElement('style');
    style.id = 'lsc-b107-style';
    style.textContent = `
      #upgrade-list-all {
        padding-top:10px !important;
        box-sizing:border-box !important;
      }
      .lsc-b107-safe-top-spacer {
        height:6px !important;
        min-height:6px !important;
        flex:0 0 auto !important;
      }
      .lsc-b107-queue-full-card {
        opacity:.62 !important;
        filter:saturate(.72) brightness(.82) !important;
        box-shadow:none !important;
      }
      .lsc-b107-queue-full-chip {
        display:inline-flex;align-items:center;gap:4px;margin-bottom:6px;padding:3px 7px;border-radius:999px;
        border:1px solid rgba(255,190,70,.28);background:rgba(255,190,70,.07);color:#d4a028;
        font-family:'Share Tech Mono',monospace;font-size:7.5px;letter-spacing:.8px;text-transform:uppercase;
      }
      .lsc-b107-disabled-btn {
        color:#d4a028 !important;border-color:rgba(212,160,40,.28) !important;background:rgba(212,160,40,.06) !important;
        opacity:.9 !important;cursor:default !important;
      }
      .lsc-b107-researching-card {
        border-color:rgba(34,212,255,.92) !important;
        background:linear-gradient(145deg,rgba(34,212,255,.13),rgba(0,0,0,.26)) !important;
        box-shadow:0 0 14px rgba(34,212,255,.24), inset 0 0 0 1px rgba(34,212,255,.24) !important;
        opacity:1 !important;
      }
      .lsc-b107-research-progress {
        width:100%;height:4px;border-radius:999px;overflow:hidden;margin-top:9px;background:rgba(255,255,255,.10);
        border:1px solid rgba(34,212,255,.18);
      }
      .lsc-b107-research-progress > div {
        height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(34,212,255,.55),rgba(34,212,255,1));
        box-shadow:0 0 8px rgba(34,212,255,.45);
      }
      .lsc-b107-hidden-locked-grid {
        display:none !important;
      }
      .lsc-b107-locked-tier-note {
        margin:-2px 0 10px;padding:8px 10px;border-radius:10px;border:1px dashed rgba(255,255,255,.10);
        background:rgba(0,0,0,.20);color:rgba(155,170,175,.72);font-family:'Share Tech Mono',monospace;
        font-size:7.5px;text-align:center;letter-spacing:.55px;
      }
      .lsc-b108-hidden-tier {
        display:none !important;
      }
      .lsc-b108-single-lock-note {
        margin:0 0 12px;padding:8px 10px;border-radius:10px;border:1px dashed rgba(255,255,255,.10);
        background:rgba(0,0,0,.18);color:rgba(155,170,175,.76);font-family:'Share Tech Mono',monospace;
        font-size:7.5px;text-align:center;letter-spacing:.55px;
      }
    `;
    document.head.appendChild(style);
  }

  function findQueueBar(root) {
    if (!root) return null;
    var kids = Array.prototype.slice.call(root.children || []);
    for (var i = 0; i < kids.length; i++) {
      var txt = (kids[i].textContent || '').replace(/\s+/g, ' ').trim();
      if (/\bQUEUE\b/i.test(txt) && /\d+\s*\/\s*\d+/.test(txt)) return kids[i];
    }
    return null;
  }

  function getQueueInfo(root) {
    var q = findQueueBar(root);
    var out = { bar:q, used:0, max:0, full:false };
    if (!q) return out;
    var txt = (q.textContent || '').replace(/\s+/g, ' ');
    var m = txt.match(/(\d+)\s*\/\s*(\d+)/);
    if (m) {
      out.used = parseInt(m[1], 10) || 0;
      out.max  = parseInt(m[2], 10) || 0;
      out.full = out.max > 0 && out.used >= out.max;
    }
    return out;
  }

  function ensureSafeTopSpacer(root) {
    if (!root) return;
    if (root.firstElementChild && root.firstElementChild.classList && root.firstElementChild.classList.contains('lsc-b107-safe-top-spacer')) return;
    var spacer = document.createElement('div');
    spacer.className = 'lsc-b107-safe-top-spacer';
    root.insertBefore(spacer, root.firstChild);
  }

  function cardForButton(btn) {
    var el = btn;
    for (var i = 0; i < 5 && el; i++, el = el.parentElement) {
      var txt = (el.textContent || '');
      if (/AVAILABLE|RESEARCHING|COMPLETE|LOCKED|NEED/i.test(txt) && el !== btn) return el;
    }
    return btn.parentElement;
  }

  function replaceAvailableBadgeWithQueueFull(card) {
    if (!card || card.querySelector('.lsc-b107-queue-full-chip')) return;
    var walkers = card.querySelectorAll('div,span');
    for (var i = 0; i < walkers.length; i++) {
      var el = walkers[i];
      if ((el.textContent || '').trim() === 'AVAILABLE') {
        el.textContent = 'QUEUE FULL';
        el.style.color = '#d4a028';
        if (el.previousElementSibling) {
          try { el.previousElementSibling.style.background = '#d4a028'; } catch (_) {}
        }
        return;
      }
    }
    var chip = document.createElement('div');
    chip.className = 'lsc-b107-queue-full-chip';
    chip.textContent = '● QUEUE FULL';
    card.insertBefore(chip, card.firstChild);
  }

  function polishNeedCreditButton(btn) {
    if (!btn) return;
    var txt = (btn.textContent || '').trim();
    var m = txt.match(/[–-]\s*(\d+)\s*cr/i);
    if (m) {
      btn.textContent = 'NEED ' + m[1] + ' CR';
      btn.style.color = '#d76b6b';
      btn.style.borderColor = 'rgba(215,107,107,.28)';
      btn.style.background = 'rgba(120,25,25,.06)';
    }
  }

  function polishQueueFull(root, info) {
    if (!root || !info.full) return;
    var buttons = Array.prototype.slice.call(root.querySelectorAll('button[data-node]'));
    buttons.forEach(function (btn) {
      var card = cardForButton(btn);
      if (!card) return;
      var text = (card.textContent || '').toUpperCase();
      if (/COMPLETE|RESEARCHING|LOCKED/.test(text)) return;
      if (!/AVAILABLE/.test(text)) return;
      btn.disabled = true;
      btn.textContent = 'QUEUE FULL';
      btn.classList.add('lsc-b107-disabled-btn');
      card.classList.add('lsc-b107-queue-full-card');
      replaceAvailableBadgeWithQueueFull(card);
    });
  }

  function getResearchQueue() {
    try { if (typeof _researchQueue !== 'undefined' && Array.isArray(_researchQueue)) return _researchQueue; } catch (_) {}
    try { if (window._researchQueue && Array.isArray(window._researchQueue)) return window._researchQueue; } catch (_) {}
    return [];
  }

  function appendProgress(card, pct) {
    if (!card || card.querySelector('.lsc-b107-research-progress')) return;
    var wrap = document.createElement('div');
    wrap.className = 'lsc-b107-research-progress';
    var fill = document.createElement('div');
    fill.style.width = Math.max(4, Math.min(100, pct || 4)) + '%';
    wrap.appendChild(fill);
    card.appendChild(wrap);
  }

  function polishResearching(root) {
    if (!root) return;
    var q = getResearchQueue();
    var all = Array.prototype.slice.call(root.querySelectorAll('div'));
    all.forEach(function (el) {
      var txt = (el.textContent || '');
      if (!/RESEARCHING/i.test(txt)) return;
      var card = el;
      for (var i = 0; i < 4 && card && card.parentElement; i++) {
        if (/RESEARCHING/i.test(card.textContent || '') && (card.textContent || '').length < 900) break;
        card = card.parentElement;
      }
      if (!card) return;
      card.classList.add('lsc-b107-researching-card');
      var pct = 18;
      for (var qi = 0; qi < q.length; qi++) {
        if (q[qi].name && txt.indexOf(q[qi].name) >= 0) {
          var total = Math.max(1, q[qi].totalMs || 1);
          var left = Math.max(0, (q[qi].completesAt || Date.now()) - Date.now());
          pct = Math.round((1 - left / total) * 100);
          break;
        }
      }
      appendProgress(card, pct);
    });
  }

  function collapseLockedFutureTiers(root) {
    if (!root) return;
    var kids = Array.prototype.slice.call(root.children || []);
    var firstLockedTierKept = false;

    function hide(el) {
      if (el && el.classList) {
        el.classList.add('lsc-b107-hidden-locked-grid');
        el.classList.add('lsc-b108-hidden-tier');
      }
    }

    function looksLikeLockedGrid(el) {
      return !!(el && /LOCKED|Future upgrades hidden/i.test(el.textContent || ''));
    }

    for (var i = 0; i < kids.length; i++) {
      var label = kids[i];
      var txt = (label.textContent || '').replace(/\s+/g, ' ').trim();
      if (!/🔒|LOCKED/i.test(txt)) continue;
      if (!/TIER\s+\d+\s+[-—]\s+Complete\s+Tier/i.test(txt)) continue;

      var grid = kids[i + 1];
      var arrow = kids[i + 2];
      var nextNote = (grid && grid.nextElementSibling && grid.nextElementSibling.classList && grid.nextElementSibling.classList.contains('lsc-b107-locked-tier-note')) ? grid.nextElementSibling : null;

      if (!firstLockedTierKept) {
        firstLockedTierKept = true;
        if (looksLikeLockedGrid(grid)) hide(grid);
        if (nextNote) hide(nextNote);
        if (arrow && (arrow.textContent || '').trim() === '▼') hide(arrow);

        if (!label.nextElementSibling || !label.nextElementSibling.classList || !label.nextElementSibling.classList.contains('lsc-b108-single-lock-note')) {
          var note = document.createElement('div');
          note.className = 'lsc-b108-single-lock-note';
          note.textContent = 'Future tiers unlock as you complete the current tier.';
          label.parentNode.insertBefore(note, label.nextSibling);
          kids.splice(i + 1, 0, note);
        }
      } else {
        hide(label);
        if (looksLikeLockedGrid(grid)) hide(grid);
        if (nextNote) hide(nextNote);
        if (arrow && (arrow.textContent || '').trim() === '▼') hide(arrow);
      }
    }
  }

  function polishButtons(root) {
    if (!root) return;
    var buttons = Array.prototype.slice.call(root.querySelectorAll('button[data-node]'));
    buttons.forEach(polishNeedCreditButton);
  }

  function interceptQueueFullClicks() {
    var root = $('upgrade-list-all');
    if (!root || root.__b107ClickGuard) return;
    root.addEventListener('click', function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest('button[data-node]') : null;
      if (!btn) return;
      var info = getQueueInfo(root);
      if (!info.full) return;
      var card = cardForButton(btn);
      if (card && /RESEARCHING|COMPLETE|LOCKED/i.test(card.textContent || '')) return;
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      toast('Research queue full — wait for a slot to open');
      buzz('light');
    }, true);
    root.__b107ClickGuard = true;
  }

  function polishResearchLayout() {
    safe('polish research layout', function () {
      installStyles();
      var root = $('upgrade-list-all');
      if (!root) return;
      ensureSafeTopSpacer(root);
      var info = getQueueInfo(root);
      polishButtons(root);
      polishQueueFull(root, info);
      polishResearching(root);
      collapseLockedFutureTiers(root);
      interceptQueueFullClicks();
    });
  }

  function wrapRenderResearch() {
    safe('wrap renderResearchSheet', function () {
      if (typeof renderResearchSheet !== 'function' || renderResearchSheet.__b107) return;
      var original = renderResearchSheet;
      renderResearchSheet = function () {
        var result = original.apply(this, arguments);
        setTimeout(polishResearchLayout, 0);
        setTimeout(polishResearchLayout, 90);
        setTimeout(polishResearchLayout, 260);
        return result;
      };
      renderResearchSheet.__b107 = true;
    });
  }

  function boot() {
    installStyles();
    wrapRenderResearch();
    polishResearchLayout();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); });
  } else {
    setTimeout(boot, 80);
  }

  setInterval(function () {
    wrapRenderResearch();
    polishResearchLayout();
  }, 1000);

  window.LSC_RESEARCH_QUEUE = { refreshResearchPolish: polishResearchLayout };
})();


// Build 108 final pass: compact research legend and single locked-tier gate behavior.
