// ═══════════════════════════════════════════════════════
//  screenGuard.js — screen-state and input isolation
//  Build 114: prevents battlefield controls/HUD from overlaying Home.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_SCREEN_GUARD__) return;
  window.__LSC_SCREEN_GUARD__ = true;

  function $(id) { return document.getElementById(id); }

  function installScreenGuardStyles() {
    var old = $('lsc-screen-guard-style');
    if (old && old.getAttribute('data-build') === '114') return;
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'lsc-screen-guard-style';
    style.setAttribute('data-build', '114');
    style.textContent = `
      /* Home must own the whole touch plane when visible. */
      body.lsc-home-mode #homeScreen {
        z-index: 700 !important;
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }
      body.lsc-home-mode #homeScreen * {
        pointer-events: auto;
      }

      /* Hide battlefield-only UI while the dashboard/home screen is open. */
      body.lsc-home-mode #hud,
      body.lsc-home-mode #battlefield-wrap,
      body.lsc-home-mode #controls,
      body.lsc-home-mode #wave-chip,
      body.lsc-home-mode #bossAlert,
      body.lsc-home-mode #eventBanner,
      body.lsc-home-mode #phaseWarning,
      body.lsc-home-mode #waveCountdown,
      body.lsc-home-mode #waveClearedBanner,
      body.lsc-home-mode #killStreak,
      body.lsc-home-mode #refundBar,
      body.lsc-home-mode #lsc-world-chip,
      body.lsc-home-mode #lsc-hud-actions-dock,
      body.lsc-home-mode #quest-board {
        visibility: hidden !important;
        pointer-events: none !important;
      }

      /* In battlefield mode, bottom controls use the normal document flow.
         Do not float them above full-screen dashboards. */
      body:not(.lsc-home-mode) #controls {
        visibility: visible;
        pointer-events: auto;
      }

      /* Modal overlays should always sit above battlefield helpers. */
      #lsc-staff-modal,
      #lsc-daily-modal,
      #lsc-world-unlock,
      #metaOverlay,
      #statsOverlay,
      .overlay,
      .sheet-backdrop,
      .sheet {
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);
  }

  function isVisible(el) {
    if (!el) return false;
    var cs;
    try { cs = window.getComputedStyle(el); } catch (_) { return false; }
    if (!cs || cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    // Fixed elements often have no offsetParent; use size and style instead.
    var r;
    try { r = el.getBoundingClientRect(); } catch (_) { return true; }
    return (r.width > 0 && r.height > 0) || el.classList.contains('hs-visible');
  }

  function homeIsActive() {
    var home = $('homeScreen');
    if (!home) return false;
    if (home.classList && home.classList.contains('hs-visible')) return true;
    if (home.style && home.style.display && home.style.display !== 'none') return true;
    return isVisible(home);
  }

  function applyMode() {
    installScreenGuardStyles();
    var active = homeIsActive();
    document.body.classList.toggle('lsc-home-mode', active);

    // Defensive cleanup for any older patch that left inline z-index on controls.
    var controls = $('controls');
    if (controls) {
      if (active) {
        controls.setAttribute('data-lsc-screen-hidden', '1');
      } else {
        controls.removeAttribute('data-lsc-screen-hidden');
        // Do not set a high z-index. Let normal layout own controls.
        if (controls.style && controls.style.zIndex === '120') controls.style.zIndex = '';
      }
    }
  }

  function attachResumeSafeguard() {
    var btn = $('homeResumeBtn');
    if (!btn || btn.__lscScreenGuardAttached) return;
    btn.__lscScreenGuardAttached = true;
    btn.addEventListener('click', function () {
      // Let the existing home resume code run first, then re-evaluate screen ownership.
      setTimeout(applyMode, 0);
      setTimeout(applyMode, 80);
      setTimeout(applyMode, 250);
    }, false);
  }

  function bootScreenGuard() {
    installScreenGuardStyles();
    attachResumeSafeguard();
    applyMode();

    var home = $('homeScreen');
    try {
      if (home) {
        var homeObs = new MutationObserver(function () { applyMode(); attachResumeSafeguard(); });
        homeObs.observe(home, { attributes: true, attributeFilter: ['class', 'style'] });
      }
      var bodyObs = new MutationObserver(function () { applyMode(); attachResumeSafeguard(); });
      bodyObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    } catch (_) {}

    window.addEventListener('resize', applyMode, { passive: true });
    window.addEventListener('orientationchange', function () { setTimeout(applyMode, 120); }, { passive: true });
    setInterval(function () { attachResumeSafeguard(); applyMode(); }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootScreenGuard);
  else bootScreenGuard();
})();
