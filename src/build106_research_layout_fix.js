// ═══════════════════════════════════════════════════════
//  build106_research_layout_fix.js — Build 106 research layout cleanup
//  Loaded after Build 105 research polish.
//
//  Fixes the sticky research queue bar overlapping the research tabs,
//  XP panel, and first row of nodes on iPhone/TestFlight.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_BUILD106_RESEARCH_LAYOUT_FIX__) return;
  window.__LSC_BUILD106_RESEARCH_LAYOUT_FIX__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) {
    try { return fn(); }
    catch (e) { try { console.warn('[B106]', label, e); } catch (_) {} }
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

  window.LSC_B106 = { refreshResearchLayout: normalizeResearchLayout };
})();
