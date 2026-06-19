// ═══════════════════════════════════════════════════════
//  hudLayout.js — battlefield HUD layout polish
//  Build 114: layout only; screen-state safety moved to screenGuard.js.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_HUD_LAYOUT_POLISH__) return;
  window.__LSC_HUD_LAYOUT_POLISH__ = true;

  function $(id) { return document.getElementById(id); }

  function installHudLayoutStyles() {
    var old = $('lsc-hud-layout-style');
    if (old && old.getAttribute('data-build') === '114') return;
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'lsc-hud-layout-style';
    style.setAttribute('data-build', '114');
    style.textContent = `
      /* Build 114 — no global z-index override for #controls. screenGuard.js owns screen mode. */
      /* Compact command action dock — Staff + Daily stay away from Orders */
      #lsc-hud-actions-dock {
        position: fixed;
        z-index: 44;
        left: 10px;
        top: calc(env(safe-area-inset-top,0px) + 138px);
        width: min(220px, calc(100vw - 150px));
        display: flex;
        gap: 6px;
        align-items: stretch;
        pointer-events: none;
      }
      #lsc-hud-actions-dock #lsc-daily-btn,
      #lsc-hud-actions-dock #lsc-staff-btn {
        position: static !important;
        inset: auto !important;
        width: auto !important;
        min-width: 0 !important;
        flex: 1 1 0 !important;
        height: 30px !important;
        min-height: 30px !important;
        padding: 5px 7px !important;
        border-radius: 10px !important;
        font-size: 10px !important;
        line-height: 1 !important;
        letter-spacing: 1.2px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        pointer-events: auto !important;
      }

      /* Orders are compact but still scrollable. No fixed hidden stack and no touch guard. */
      #quest-board {
        right: 7px !important;
        top: 78px !important;
        width: 116px !important;
        max-height: min(242px, 36vh) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        padding-right: 1px !important;
        scrollbar-width: none !important;
        -webkit-overflow-scrolling: touch !important;
        pointer-events: auto !important;
        z-index: 45 !important;
      }
      #quest-board::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
      #quest-board-head {
        font-size: 8px !important;
        line-height: 1 !important;
        letter-spacing: 3px !important;
        margin: 0 0 5px 0 !important;
        opacity: .78 !important;
        text-align: center !important;
      }
      #quest-board .lsc-order-card {
        margin: 0 0 6px 0 !important;
        padding: 7px 8px !important;
        border-radius: 10px !important;
        min-height: 0 !important;
        max-width: 116px !important;
      }
      #quest-board .lsc-order-card * { line-height: 1.08 !important; }
      #quest-board .lsc-order-card button {
        min-height: 24px !important;
        padding: 3px 5px !important;
        border-radius: 7px !important;
        font-size: 9px !important;
        pointer-events: auto !important;
      }

      /* Completed orders collapse into quick claim rows */
      #quest-board .lsc-order-complete {
        padding: 5px 7px !important;
        border-radius: 9px !important;
        min-height: 44px !important;
      }
      #quest-board .lsc-order-complete * {
        font-size: 10px !important;
        line-height: 1.02 !important;
      }
      #quest-board .lsc-order-complete div,
      #quest-board .lsc-order-complete span {
        margin-top: 1px !important;
        margin-bottom: 1px !important;
      }
      #quest-board .lsc-order-complete [style*="height: 7"],
      #quest-board .lsc-order-complete [style*="height:7"],
      #quest-board .lsc-order-complete [style*="height: 8"],
      #quest-board .lsc-order-complete [style*="height:8"] {
        max-height: 4px !important;
      }

      /* Non-complete orders keep readable objective text, but tighter */
      #quest-board .lsc-order-active { min-height: 68px !important; }
      #quest-board .lsc-order-active * { font-size: 10.5px !important; }

      /* Remove any Build 112 hidden extra-order helper if it exists from a hot reload. */
      #lsc-orders-more { display: none !important; }
      #quest-board .lsc-order-hidden-extra { display: block !important; }

      @media (max-width: 380px) {
        #lsc-hud-actions-dock {
          top: calc(env(safe-area-inset-top,0px) + 136px);
          width: min(205px, calc(100vw - 142px));
          gap: 5px;
        }
        #lsc-hud-actions-dock #lsc-daily-btn,
        #lsc-hud-actions-dock #lsc-staff-btn {
          height: 28px !important;
          min-height: 28px !important;
          padding: 4px 6px !important;
          font-size: 9.5px !important;
        }
        #quest-board {
          width: 110px !important;
          right: 6px !important;
          max-height: min(224px, 34vh) !important;
        }
        #quest-board .lsc-order-card { max-width: 110px !important; }
      }

      @media (max-height: 740px) {
        #lsc-hud-actions-dock { top: calc(env(safe-area-inset-top,0px) + 132px); }
        #quest-board { max-height: min(218px, 34vh) !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureActionDock() {
    installHudLayoutStyles();
    var daily = $('lsc-daily-btn');
    var staff = $('lsc-staff-btn');
    if (!daily && !staff) return;

    var dock = $('lsc-hud-actions-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'lsc-hud-actions-dock';
      document.body.appendChild(dock);
    }

    // Move existing buttons into one layout zone. Listeners remain attached.
    if (staff && staff.parentNode !== dock) dock.appendChild(staff);
    if (daily && daily.parentNode !== dock) dock.appendChild(daily);
  }

  function markQuestCards(qb) {
    var more = $('lsc-orders-more');
    if (more && more.parentNode) more.parentNode.removeChild(more);

    var children = Array.prototype.slice.call(qb.children || []);
    children.forEach(function (card) {
      if (!card || card.id === 'quest-board-head') return;
      card.classList.remove('lsc-order-hidden-extra');
      card.classList.add('lsc-order-card');

      var txt = (card.textContent || '').replace(/\s+/g, ' ').trim();
      var hasCheck = txt.indexOf('✓') !== -1 || txt.indexOf('✔') !== -1;
      var hasClaim = /\bClaim\b/i.test(txt);
      var isComplete = hasCheck || hasClaim || !!card.querySelector('button:not(:disabled)');

      card.classList.toggle('lsc-order-complete', !!isComplete);
      card.classList.toggle('lsc-order-active', !isComplete);
    });
  }

  function compactOrders() {
    installHudLayoutStyles();
    var qb = $('quest-board');
    if (!qb) return;
    qb.setAttribute('data-lsc-compact', '114');
    markQuestCards(qb);
    // No touch/wheel guards in Build 113. They made Build 112 too aggressive on iOS.
  }

  function tickHudLayout() {
    ensureActionDock();
    compactOrders();
  }

  function bootHudLayout() {
    tickHudLayout();
    var obs = new MutationObserver(function () { tickHudLayout(); });
    try { obs.observe(document.body, { childList: true, subtree: true }); } catch (_) {}
    setInterval(tickHudLayout, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootHudLayout);
  else bootHudLayout();
})();
