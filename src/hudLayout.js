// ═══════════════════════════════════════════════════════
//  hudLayout.js — battlefield HUD layout polish
//  Build 112: fixed Orders panel, no clipped scroll, clearer Daily label.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_HUD_LAYOUT_POLISH__) return;
  window.__LSC_HUD_LAYOUT_POLISH__ = true;

  function $(id) { return document.getElementById(id); }

  function installHudLayoutStyles() {
    var old = $('lsc-hud-layout-style');
    if (old && old.getAttribute('data-build') === '112') return;
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'lsc-hud-layout-style';
    style.setAttribute('data-build', '112');
    style.textContent = `
      /* Build 112 — compact command action dock */
      #lsc-hud-actions-dock {
        position: fixed;
        z-index: 44;
        left: 10px;
        top: calc(env(safe-area-inset-top,0px) + 138px);
        width: min(220px, calc(100vw - 150px));
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
      }

      /* Build 112 — Orders fixed panel, no clipped internal scroll */
      #quest-board {
        right: 7px !important;
        top: 78px !important;
        width: 116px !important;
        max-height: min(226px, 34vh) !important;
        overflow-y: hidden !important;
        overflow-x: hidden !important;
        padding-right: 1px !important;
        scrollbar-width: none !important;
        -webkit-overflow-scrolling: auto !important;
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
        margin: 0 0 5px 0 !important;
        padding: 7px 8px !important;
        border-radius: 10px !important;
        min-height: 0 !important;
        max-width: 116px !important;
      }
      #quest-board .lsc-order-card * {
        line-height: 1.08 !important;
      }
      #quest-board .lsc-order-card button {
        min-height: 24px !important;
        padding: 3px 5px !important;
        border-radius: 7px !important;
        font-size: 9px !important;
      }

      /* Completed orders collapse into quick claim rows */
      #quest-board .lsc-order-complete {
        padding: 4px 7px !important;
        border-radius: 9px !important;
        min-height: 38px !important;
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
      #quest-board .lsc-order-active {
        min-height: 60px !important;
      }
      #quest-board .lsc-order-active * {
        font-size: 10.5px !important;
      }


      /* Show a stable top-three mission stack. Extra orders wait behind the scenes. */
      #quest-board .lsc-order-card.lsc-order-hidden-extra {
        display: none !important;
      }
      #lsc-orders-more {
        display: none;
        margin: 1px 0 0 0;
        padding: 3px 6px;
        border-radius: 8px;
        border: 1px dashed rgba(34,212,255,.20);
        color: rgba(180,205,225,.62);
        background: rgba(0,0,0,.20);
        font-family: 'Share Tech Mono', monospace;
        font-size: 7px;
        letter-spacing: 1px;
        text-align: center;
        pointer-events: none;
      }
      #lsc-orders-more.show { display: block; }

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
          max-height: min(210px, 32vh) !important;
        }
        #quest-board .lsc-order-card { max-width: 110px !important; }
      }

      @media (max-height: 740px) {
        #lsc-hud-actions-dock { top: calc(env(safe-area-inset-top,0px) + 132px); }
        #quest-board { max-height: min(206px, 32vh) !important; }
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
    var children = Array.prototype.slice.call(qb.children || []);
    var cards = [];

    children.forEach(function (card) {
      if (!card || card.id === 'quest-board-head' || card.id === 'lsc-orders-more') return;
      card.classList.add('lsc-order-card');

      var txt = (card.textContent || '').replace(/\s+/g, ' ').trim();
      var hasCheck = txt.indexOf('✓') !== -1 || txt.indexOf('✔') !== -1;
      var hasClaim = /\bClaim\b/i.test(txt);
      var isComplete = hasCheck || hasClaim || !!card.querySelector('button:not(:disabled)');

      card.classList.toggle('lsc-order-complete', !!isComplete);
      card.classList.toggle('lsc-order-active', !isComplete);
      cards.push(card);
    });

    cards.forEach(function (card, idx) {
      card.classList.toggle('lsc-order-hidden-extra', idx >= 3);
    });

    var more = $('lsc-orders-more');
    if (!more) {
      more = document.createElement('div');
      more.id = 'lsc-orders-more';
      qb.appendChild(more);
    } else if (more.parentNode !== qb) {
      qb.appendChild(more);
    }

    var hiddenCount = Math.max(0, cards.length - 3);
    more.textContent = hiddenCount ? ('+' + hiddenCount + ' MORE ORDERS') : '';
    more.classList.toggle('show', hiddenCount > 0);

    if (qb.scrollTop) qb.scrollTop = 0;
  }

  function compactOrders() {
    installHudLayoutStyles();
    var qb = $('quest-board');
    if (!qb) return;
    qb.setAttribute('data-lsc-compact', '112');
    markQuestCards(qb);

    // Keep only the top three orders visible. This prevents clipped scroll states on the battlefield.
    if (!qb.__lscQuestScrollGuard) {
      qb.__lscQuestScrollGuard = true;
      qb.addEventListener('touchstart', function (ev) { ev.stopPropagation(); }, { passive: true });
      qb.addEventListener('touchmove', function (ev) { ev.stopPropagation(); }, { passive: true });
      qb.addEventListener('wheel', function (ev) { ev.stopPropagation(); }, { passive: true });
    }
  }

  function tickHudLayout() {
    ensureActionDock();
    compactOrders();
  }

  function bootHudLayout() {
    tickHudLayout();
    var obs = new MutationObserver(function () { tickHudLayout(); });
    try { obs.observe(document.body, { childList: true, subtree: true, characterData: true }); } catch (_) {}
    setInterval(tickHudLayout, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootHudLayout);
  else bootHudLayout();
})();
