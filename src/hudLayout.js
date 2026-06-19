// ═══════════════════════════════════════════════════════
//  hudLayout.js — battlefield HUD layout polish
//  Build 110: keeps Daily + Staff away from Orders and compacts Orders.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_HUD_LAYOUT_POLISH__) return;
  window.__LSC_HUD_LAYOUT_POLISH__ = true;

  function $(id) { return document.getElementById(id); }

  function installHudLayoutStyles() {
    if ($('lsc-hud-layout-style')) return;
    var style = document.createElement('style');
    style.id = 'lsc-hud-layout-style';
    style.textContent = `
      /* Build 110 — compact command action dock */
      #lsc-hud-actions-dock {
        position: fixed;
        z-index: 44;
        left: 10px;
        top: calc(env(safe-area-inset-top,0px) + 138px);
        width: min(230px, calc(100vw - 158px));
        display: flex;
        gap: 6px;
        align-items: stretch;
        pointer-events: auto;
      }
      #lsc-hud-actions-dock #lsc-daily-btn,
      #lsc-hud-actions-dock #lsc-staff-btn {
        position: static !important;
        inset: auto !important;
        width: auto !important;
        min-width: 0 !important;
        flex: 1 1 0 !important;
        height: 34px !important;
        padding: 6px 7px !important;
        border-radius: 11px !important;
        font-size: 11px !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      /* Compact Orders board so it no longer owns the right side of the battlefield */
      #quest-board {
        right: 8px !important;
        top: 78px !important;
        width: 124px !important;
        max-height: min(300px, 44vh) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        padding-right: 1px !important;
        scrollbar-width: none !important;
        -webkit-overflow-scrolling: touch !important;
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
      #quest-board > :not(#quest-board-head) {
        margin: 0 0 7px 0 !important;
        padding: 8px 9px !important;
        border-radius: 11px !important;
        min-height: 0 !important;
      }
      #quest-board > :not(#quest-board-head) * {
        line-height: 1.18 !important;
      }
      #quest-board button {
        min-height: 26px !important;
        padding: 4px 6px !important;
        border-radius: 8px !important;
        font-size: 10px !important;
      }

      @media (max-width: 380px) {
        #lsc-hud-actions-dock {
          top: calc(env(safe-area-inset-top,0px) + 136px);
          width: min(214px, calc(100vw - 148px));
          gap: 5px;
        }
        #lsc-hud-actions-dock #lsc-daily-btn,
        #lsc-hud-actions-dock #lsc-staff-btn {
          height: 32px !important;
          padding: 5px 6px !important;
          font-size: 10px !important;
        }
        #quest-board {
          width: 118px !important;
          right: 6px !important;
          max-height: min(270px, 40vh) !important;
        }
      }

      @media (max-height: 740px) {
        #lsc-hud-actions-dock { top: calc(env(safe-area-inset-top,0px) + 132px); }
        #quest-board { max-height: min(245px, 38vh) !important; }
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
    if (daily && daily.parentNode !== dock) dock.appendChild(daily);
    if (staff && staff.parentNode !== dock) dock.appendChild(staff);
  }

  function compactOrders() {
    installHudLayoutStyles();
    var qb = $('quest-board');
    if (!qb) return;
    qb.setAttribute('data-lsc-compact', '1');
    // Keep the newest/active order cards visible but scrollable; do not hide claims.
    if (!qb.__lscQuestScrollGuard) {
      qb.__lscQuestScrollGuard = true;
      qb.addEventListener('touchstart', function (ev) { ev.stopPropagation(); }, { passive: true });
      qb.addEventListener('touchmove', function (ev) { ev.stopPropagation(); }, { passive: true });
    }
  }

  function tickHudLayout() {
    ensureActionDock();
    compactOrders();
  }

  function bootHudLayout() {
    tickHudLayout();
    var obs = new MutationObserver(function () { tickHudLayout(); });
    try { obs.observe(document.body, { childList: true, subtree: true }); } catch (_) {}
    setInterval(tickHudLayout, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootHudLayout);
  else bootHudLayout();
})();
