(function loop(now) {
  try {
    resizeCanvasVertical();
    const rawDt = Math.min(0.033, (now - _lastTime) / 1000);
    _lastTime = now;
    const s = G.state;

    if (s.started && !s.paused && isOverlayClear() && !s.gameOver) {
      const dt = rawDt * _gameSpeed;
      _patchedUpdate(dt, canvas, onWaveEnd, onGameOver, onPhaseWarning);
      applyTroopCombat();
      _lastSave += rawDt;
      if (_lastSave >= CFG.AUTOSAVE_INTERVAL) { saveGame(); _lastSave = 0; }

      // Track kills for Orbital charge AND quest counter
      const newKills = (s.killsTotal || 0);
      // V75: if killsTotal reset to 0 (new run after prestige), sync _prevKills to avoid phantom delta
      if (newKills === 0 && _prevKills > 0) _prevKills = 0;
      if (newKills > _prevKills) {
        const killDelta = newKills - _prevKills;
        s._orbKills = ((s._orbKills || 0)) + killDelta;
        // Tick kill quests by actual engine-confirmed kills only
        _questTick('kills', killDelta);
        _prevKills  = newKills;
      }
      _prevWave = s.wave;

      // Process FX events (credit pops + hit flash)
      if (s.fx && s.fx.length > 0) {
        const dpr_     = window.devicePixelRatio || 1;
        const colW_    = canvas.width / 3;
        const tH_      = 52 * dpr_;
        const bH_      = 70 * dpr_;
        const fieldH_  = canvas.height - bH_ - tH_;

        for (const f of s.fx) {
          // Credit pop on boom
          if (f.kind === 'boom' && f.life > f.max - 0.05 && !f._popped) {
            f._popped = true;
            const lane_ = (f.y !== undefined) ? (f.y < 260 ? 0 : f.y < 450 ? 1 : 2) : 1;
            const sx_   = colW_ * (lane_ + 0.5) / dpr_;
            const sy_   = (tH_ + ((1400 - (f.x || 0)) / 1400) * fieldH_) / dpr_;
            const isBoss_ = (f.r || 0) > 25;
            spawnCreditPop(sx_, sy_, isBoss_ ? 160 : Math.floor(10 + (s.wave||1) * 3), isBoss_);
            _onKillForStreak(isBoss_);
            if (isBoss_) _questTick('bosses', 1);
            if (G.state.lastWaveStats) {
              G.state.lastWaveStats.kills = (G.state.lastWaveStats.kills || 0) + 1;
            }
            // Commander death — queue grunt spawns
            if (f._eliteKind === 'commander' && f._spawnsOnDeath) {
              if (!s._justDiedElites) s._justDiedElites = [];
              s._justDiedElites.push({ lane: lane_, x: f.x || 800, _spawnsOnDeath: f._spawnsOnDeath });
            }
          }
          // Hit flash on enemies
          if (f.kind === 'hit' && f.life > f.max - 0.05 && s.enemies) {
            let nearest = null, nearDist = 60;
            for (const e of s.enemies) {
              const d = Math.hypot(e.x - f.x, e.y - f.y);
              if (d < nearDist) { nearest = e; nearDist = d; }
            }
            if (nearest) nearest._hitFlash = 0.12;
          }
        }
      }
    }

    tickMusic(rawDt, s.started && !s.paused && isOverlayClear() && s.waveInProgress
      ? (s.enemies.length > 5 ? 'hot' : 'active') : null);
    tickWeather(rawDt);
    tickBossDrone(rawDt, s);
    drawVertical(s);
    updateHUD();
    // Refresh quest board ~once per second for wave-type quests
    if (!window._qfc) window._qfc = 0;
    if (++window._qfc % 60 === 0 && s.started && s._quests) {
      _checkQuestCompletions(s);
      renderQuestBoard();
      _tickAmbientAndHeartbeat();
    }
  } catch(err) {
    // Error boundary — shows actual error text on Safari instead of "Script error."
    let dbg = document.getElementById('_err_overlay');
    if (!dbg) {
      dbg = document.createElement('div');
      dbg.id = '_err_overlay';
      dbg.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:rgba(30,0,0,.97);color:#ff8080;font:11px monospace;padding:10px;word-break:break-all;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:2px solid red;';
      document.body.appendChild(dbg);
    }
    const msg = err.toString() + '\n' + (err.stack || '').split('\n').slice(0, 5).join('\n');
    if (!dbg.textContent.includes(err.message)) dbg.textContent += '\n' + msg;
  }
  requestAnimationFrame(loop);
})(performance.now());

// V87: Initialize RevenueCat when app loads
// Uses Capacitor bridge — no-op in browser, active in TestFlight/App Store
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to let Capacitor bridge register the native plugin
  setTimeout(function() { rcInitialize(); }, 500);
});

// Debug function - call debugIAP() in browser console to check purchase status
window.debugIAP = function() {
  console.log('=== IAP STATUS ===');
  console.log('Commander:', localStorage.getItem('ifc_iap_commander') === '1' ? '✓' : '✗');
  console.log('Autowav:', localStorage.getItem('ifc_autowav') === '1' ? '✓' : '✗');
  console.log('Quick Buy:', localStorage.getItem('ifc_quickbuy') === '1' ? '✓' : '✗');
  console.log('Supporter:', localStorage.getItem('ifc_iap_supporter') === '1' ? '✓' : '✗');
  if (G && G.state && _speeds) {
    console.log('×10 speed:', _speeds.find(s => s.val === 10) ? '✓' : '✗');
    console.log('Orbital:', G.state._orbPurchaseUnlocked ? '✓' : '✗');
  }
};

console.log('✓ IAP system ready');

window.addEventListener('resize', resizeCanvasVertical);
