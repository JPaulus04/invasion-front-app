// ═══════════════════════════════════════════════════════
// hotfixes.js — final App Store review fixes
// Build 102: boss warning cleanup, wave-launch lock, tutorial replay fixes
// Loads last so it can safely override older handlers without invasive rewrites.
// ═══════════════════════════════════════════════════════
(function lscHotfixes() {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
  }

  // ── Boss visual cleanup ───────────────────────────────────────
  // The older build stacked three red layers: bossAlert, bossSky, and a paused render.
  // Keep the threat identity, but remove the full-screen/half-screen red wash.
  function injectBossCss() {
    if (byId('lsc-hotfix-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-hotfix-style';
    css.textContent = [
      '#bossSky{display:none!important;background:transparent!important;opacity:0!important;}',
      '#bossAlert{display:none!important;background:transparent!important;opacity:0!important;pointer-events:none!important;}',
      '#lscBossCard{position:fixed;left:50%;top:42%;transform:translate(-50%,-50%) scale(.94);z-index:10020;pointer-events:none;opacity:0;transition:opacity .18s ease,transform .18s ease;}',
      '#lscBossCard.show{opacity:1;transform:translate(-50%,-50%) scale(1);}',
      '#lscBossCard .lsc-boss-inner{min-width:min(340px,86vw);padding:18px 20px;border-radius:16px;border:2px solid #ff3c3c;background:rgba(8,4,4,.94);box-shadow:0 0 36px rgba(255,49,49,.45),inset 0 0 24px rgba(255,49,49,.08);text-align:center;}',
      '#lscBossCard .lsc-boss-kicker{font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:3px;color:#ff8888;margin-bottom:6px;}',
      '#lscBossCard .lsc-boss-title{font-family:\'Rajdhani\',sans-serif;font-weight:800;font-size:38px;line-height:1;color:#ff3c3c;text-shadow:0 0 28px rgba(255,60,60,.7);}',
      '#lscBossCard .lsc-boss-wave{font-family:\'Share Tech Mono\',monospace;font-size:12px;color:#ffbe00;letter-spacing:2px;margin-top:7px;}',
      '#lscBossCard .lsc-boss-sub{font-family:\'Share Tech Mono\',monospace;font-size:8.5px;color:#c86868;letter-spacing:1.5px;margin-top:10px;}'
    ].join('\n');
    document.head.appendChild(css);
  }

  function hideLegacyBossLayers() {
    var sky = byId('bossSky');
    if (sky) {
      sky.style.display = 'none';
      sky.style.opacity = '0';
      sky.style.background = 'transparent';
    }
    var alert = byId('bossAlert');
    if (alert) {
      alert.style.display = 'none';
      alert.style.opacity = '0';
      alert.style.background = 'transparent';
    }
  }

  function showBossCard() {
    injectBossCss();
    hideLegacyBossLayers();
    var existing = byId('lscBossCard');
    if (existing) existing.remove();

    var wave = (window.G && G.state && G.state.wave) ? G.state.wave : '?';
    var card = document.createElement('div');
    card.id = 'lscBossCard';
    card.innerHTML =
      '<div class="lsc-boss-inner">' +
        '<div class="lsc-boss-kicker">⚠ INCOMING THREAT ⚠</div>' +
        '<div class="lsc-boss-title">BOSS WAVE</div>' +
        '<div class="lsc-boss-wave">— WAVE ' + wave + ' —</div>' +
        '<div class="lsc-boss-sub">WARDEN-CLASS ENEMY DETECTED · DEPLOY HEAVY SUPPORT</div>' +
      '</div>';
    document.body.appendChild(card);
    requestAnimationFrame(function() { card.classList.add('show'); });
    return card;
  }

  function fixedShowCountdown(isBoss, callback) {
    var el = byId('waveCountdown');
    if (!el) {
      if (typeof callback === 'function') callback();
      return;
    }

    hideLegacyBossLayers();

    function runCountdown() {
      var nums = isBoss ? ['⚠', '3', '2', '1', '▶'] : ['3', '2', '1', '▶'];
      var colors = isBoss
        ? ['#ff3c3c', '#ff3c3c', '#ff8800', '#ffbe00', '#18f06a']
        : ['#22d4ff', '#ffbe00', '#ff8800', '#18f06a'];
      var idx = 0;

      function next() {
        hideLegacyBossLayers();
        if (idx >= nums.length) {
          el.style.display = 'none';
          if (typeof callback === 'function') callback();
          return;
        }
        el.textContent = nums[idx];
        el.style.color = colors[idx] || '#18f06a';
        el.style.display = 'block';
        el.style.animation = 'none';
        requestAnimationFrame(function() {
          el.style.animation = 'countPop .85s ease-out forwards';
        });
        idx += 1;
        setTimeout(next, 700);
      }

      next();
    }

    if (!isBoss) {
      runCountdown();
      return;
    }

    var card = showBossCard();
    if (typeof haptic === 'function') haptic('error');
    if (typeof triggerShake === 'function') triggerShake('heavy');

    setTimeout(function() {
      if (card) card.classList.remove('show');
      setTimeout(function() {
        if (card && card.parentNode) card.remove();
        hideLegacyBossLayers();
        runCountdown();
      }, 220);
    }, 1400);
  }

  window.showCountdown = fixedShowCountdown;
  try { showCountdown = fixedShowCountdown; } catch (e) {}

  function fixedBossAlert() {
    hideLegacyBossLayers();
    if (typeof triggerShake === 'function') {
      triggerShake('heavy');
      setTimeout(function() { triggerShake('heavy'); }, 500);
    }
    if (typeof _triggerBossGlitch === 'function') _triggerBossGlitch();
  }

  window.onBossAlert = fixedBossAlert;
  try { onBossAlert = fixedBossAlert; } catch (e) {}

  // ── Wave launch lock ─────────────────────────────────────────
  // Do not set s.paused during countdown. That caused the PAUSED render state
  // and made the red overlay appear clipped/half-screen on iOS.
  var waveLaunchPending = false;

  function installWaveButtonOverride() {
    var btn = byId('waveBtn');
    if (!btn || btn.__lscHotfixWave) return;
    btn.__lscHotfixWave = true;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (typeof ensureAudio === 'function') ensureAudio();
      var s = window.G && G.state;
      if (!s) return;

      if (!s.started) {
        var begin = byId('beginBtn');
        if (begin) begin.click();
        return;
      }

      if (typeof _obActionTaken === 'function') _obActionTaken('wave');
      if (s.waveInProgress || s.gameOver || waveLaunchPending) {
        if (typeof updateHUD === 'function') updateHUD();
        return;
      }

      var isBoss = s.wave % CFG.BOSS_WAVE_EVERY === 0;
      waveLaunchPending = true;
      hideLegacyBossLayers();

      showCountdown(isBoss, function() {
        waveLaunchPending = false;
        hideLegacyBossLayers();
        startWave(onBossAlert, onModifier, onFirstRunHint);
        if (typeof updateHUD === 'function') updateHUD();

        // Failsafe from original handler, but without pause toggling.
        setTimeout(function() {
          var st = window.G && G.state;
          if (!st || st.gameOver || st.waveInProgress || !st.started) return;
          var nothingQueued = (st.enemiesToSpawn || 0) <= 0 && (!st.enemies || st.enemies.length === 0);
          if (!nothingQueued) return;
          st.currentModifier = 'none';
          st.spawnTimer = 0;
          st.spawnInterval = 0;
          startWave(onBossAlert, onModifier, onFirstRunHint);
          if (typeof updateHUD === 'function') updateHUD();
          if (typeof showToast === 'function') showToast('Wave launch recovered');
        }, 900);
      });

      if (typeof updateHUD === 'function') updateHUD();
    }, true);
  }

  // ── Tutorial fixes ───────────────────────────────────────────
  function fixedFreeDeployEligible(laneIdx) {
    try {
      // Deploy step is Step 3 of 8, array index 2.
      if (!_obActive || _obStep !== 2) return false;
      var s = window.G && G.state;
      if (!s || !s.troops) return false;
      return s.troops.filter(function(t) { return t.lane === laneIdx; }).length === 0;
    } catch (e) {
      return false;
    }
  }

  window._obIsFreeDeployEligible = fixedFreeDeployEligible;
  try { _obIsFreeDeployEligible = fixedFreeDeployEligible; } catch (e) {}

  function fixedShowTutorialHint() {
    try {
      if (localStorage.getItem('ifc_ob_done') === '1') return;
      if (_obActive) return;
      _obDone = false;
      _obShowStep(0);
    } catch (e) {}
  }

  window.showTutorialHint = fixedShowTutorialHint;
  try { showTutorialHint = fixedShowTutorialHint; } catch (e) {}

  function resetTutorialNow() {
    try {
      localStorage.removeItem('ifc_ob_done');
      _obStep = 0;
      _obActive = false;
      _obDone = false;
      var overlay = byId('onboarding-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        overlay.style.opacity = '';
        overlay.style.transition = '';
      }
      var ring = byId('ob-target-ring');
      if (ring) ring.removeAttribute('style');
      if (typeof showToast === 'function') showToast('Tutorial reset — it will replay on the next launch/wave');
      if (typeof haptic === 'function') haptic('medium');
    } catch (e) {
      console.warn('[LSC hotfix] tutorial reset failed:', e.message);
    }
  }

  window.lscResetTutorial = resetTutorialNow;

  function installTutorialReplayOverride() {
    var btn = byId('settingsReplayTutBtn');
    if (!btn || btn.__lscHotfixReplay) return;
    btn.__lscHotfixReplay = true;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      resetTutorialNow();
      var panel = byId('settingsPanel');
      if (panel) panel.style.display = 'none';
    }, true);
  }

  function installAll() {
    injectBossCss();
    hideLegacyBossLayers();
    installWaveButtonOverride();
    installTutorialReplayOverride();
  }

  installAll();
  document.addEventListener('DOMContentLoaded', installAll);
  window.addEventListener('load', installAll);
  setTimeout(installAll, 500);

  console.log('✓ LSC hotfixes active — boss visuals, wave launch, tutorial replay');
})();
