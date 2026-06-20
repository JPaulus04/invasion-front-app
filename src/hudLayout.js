// ═══════════════════════════════════════════════════════
//  hudLayout.js — battlefield HUD layout polish
//  Build 120: compact Auto-Wave pill and safe HUD stacking.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_HUD_LAYOUT_POLISH__) return;
  window.__LSC_HUD_LAYOUT_POLISH__ = true;

  function $(id) { return document.getElementById(id); }

  function installHudLayoutStyles() {
    var old = $('lsc-hud-layout-style');
    if (old && old.getAttribute('data-build') === '120') return;
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'lsc-hud-layout-style';
    style.setAttribute('data-build', '120');
    style.textContent = `
      /* Build 120 — no global z-index override for #controls. screenGuard.js owns screen mode. */
      /* Auto-Wave is a compact status pill now, not a full-width strip.
         It gets its own reserved row under the world card so it cannot hide behind
         the Earth progress bar or Orders. */
      #autowav-strip {
        position: fixed !important;
        z-index: 43 !important;
        left: 10px !important;
        top: calc(env(safe-area-inset-top,0px) + 130px) !important;
        width: min(220px, calc(100vw - 150px)) !important;
        height: 22px !important;
        min-height: 22px !important;
        max-height: 22px !important;
        padding: 3px 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 6px !important;
        border-radius: 9px !important;
        border: 1px solid rgba(34,212,255,.30) !important;
        background: linear-gradient(135deg, rgba(4,12,20,.78), rgba(0,0,0,.48)) !important;
        box-shadow: 0 6px 18px rgba(0,0,0,.28), inset 0 0 12px rgba(34,212,255,.05) !important;
        backdrop-filter: blur(7px) !important;
        -webkit-backdrop-filter: blur(7px) !important;
        pointer-events: auto !important;
        overflow: hidden !important;
        transform: none !important;
      }
      #autowav-label {
        font-family: 'Share Tech Mono', monospace !important;
        font-size: 8px !important;
        letter-spacing: 1.4px !important;
        line-height: 1 !important;
        color: var(--cyan) !important;
        white-space: nowrap !important;
        text-transform: uppercase !important;
        opacity: .92 !important;
      }
      #autowav-right {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        font-family: 'Share Tech Mono', monospace !important;
        font-size: 8px !important;
        letter-spacing: .8px !important;
        line-height: 1 !important;
        color: rgba(210,230,235,.76) !important;
        text-align: right !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      #autowav-strip:empty,
      #autowav-strip[style*="display: none"] {
        display: none !important;
      }

      /* Compact command action dock — Staff + Daily stay away from Orders */
      #lsc-hud-actions-dock {
        position: fixed;
        z-index: 44;
        left: 10px;
        top: calc(env(safe-area-inset-top,0px) + 158px);
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
        #autowav-strip {
          top: calc(env(safe-area-inset-top,0px) + 128px) !important;
          width: min(205px, calc(100vw - 142px)) !important;
          height: 21px !important;
          min-height: 21px !important;
          max-height: 21px !important;
          padding: 3px 7px !important;
        }
        #autowav-label,
        #autowav-right { font-size: 7.5px !important; }

        #lsc-hud-actions-dock {
          top: calc(env(safe-area-inset-top,0px) + 156px);
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
        #autowav-strip { top: calc(env(safe-area-inset-top,0px) + 124px) !important; }
        #lsc-hud-actions-dock { top: calc(env(safe-area-inset-top,0px) + 152px); }
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
    qb.setAttribute('data-lsc-compact', '120');
    markQuestCards(qb);
    // No touch/wheel guards in Build 113. They made Build 112 too aggressive on iOS.
  }


  function compactAutoWavePill() {
    installHudLayoutStyles();
    var strip = $('autowav-strip');
    if (!strip) return;
    strip.setAttribute('data-lsc-layout', 'compact-pill');

    var label = $('autowav-label');
    if (label) {
      var txt = (label.textContent || '').trim();
      if (!txt || txt === '⚡ AUTO') label.textContent = '⚡ AUTO WAVE';
    }
  }

  function tickHudLayout() {
    ensureActionDock();
    compactOrders();
    compactAutoWavePill();
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
