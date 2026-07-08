// ══════════════════════════════════════════════════════════════
// Build 128 — Command Operations Identity Safe Start Fix
// Purpose: keep the new Command Operations identity visible, but never trap
// the player on the protocol/doctrine screen. The normal Start/Begin button
// now launches the game directly again.
// ══════════════════════════════════════════════════════════════
(function () {
  if (window.__LSC_OPERATION_IDENTITY_128__) return;
  window.__LSC_OPERATION_IDENTITY_128__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) { try { return fn(); } catch (e) { try { console.warn('[Ops128]', label, e); } catch (_) {} } }
  function state() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function meta() { return (typeof G !== 'undefined' && G.meta) ? G.meta : {}; }
  function hapticLight() { try { if (typeof haptic === 'function') haptic('light'); } catch (_) {} }

  var OPS = [
    {
      id: 'iron-net', icon: '🛰', name: 'Operation Iron Net', type: 'Defense Grid',
      objective: 'Hold three lanes while command systems map enemy movement.',
      threat: 'Mixed infantry with one armored contact likely.',
      reward: '+Command XP · +Credits · Formation intel',
      formation: 'Balanced: Rifle / Heavy / Medic',
      doctrineHint: 'Fortress or Artillery stabilizes the line.'
    },
    {
      id: 'blackout-shield', icon: '📡', name: 'Operation Blackout Shield', type: 'Electronic Warfare',
      objective: 'Survive jamming conditions and protect the command base.',
      threat: 'Blackout, Ion Storm, and shielded enemies more likely.',
      reward: '+EW research pressure · +Officer readiness',
      formation: 'Control: EW / Rifle / Heavy',
      doctrineHint: 'EW Superiority excels against shields and storms.'
    },
    {
      id: 'redline-hold', icon: '🎯', name: 'Operation Redline Hold', type: 'High-Threat Contact',
      objective: 'Prepare for boss-class pressure and coordinated lane assaults.',
      threat: 'Boss wave indicators, heavy units, and breach rushes.',
      reward: '+Command Data chance · +Boss progression',
      formation: 'Boss Push: Heavy / Rifle / Medic',
      doctrineHint: 'Blitzkrieg or Artillery increases burst damage.'
    }
  ];

  function chooseOperationForDoctrine(docId) {
    if (docId === 'ew') return 'blackout-shield';
    if (docId === 'blitz' || docId === 'artillery') return 'redline-hold';
    return 'iron-net';
  }

  function selectedOp() {
    var s = state();
    var id = (s && s.selectedOperation) || chooseOperationForDoctrine((s && s.selectedDoctrine) || 'blitz');
    return OPS.find(function (o) { return o.id === id; }) || OPS[0];
  }

  function installStyles() {
    if ($('lsc-ops128-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-ops128-style';
    css.textContent = '' +
      '.lsc-ops-panel{margin:10px 0 12px;padding:10px;border-radius:14px;border:1px solid rgba(34,212,255,.20);background:linear-gradient(180deg,rgba(3,16,28,.82),rgba(2,6,12,.70));box-shadow:inset 0 0 22px rgba(34,212,255,.05)}' +
      '.lsc-ops-kicker{font-family:\'Share Tech Mono\',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:rgba(34,212,255,.82);margin-bottom:7px}' +
      '.lsc-ops-grid{display:grid;grid-template-columns:1fr;gap:7px}' +
      '.lsc-op-card{border-radius:11px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.26);padding:9px 10px;text-align:left;color:rgba(225,235,240,.88);-webkit-appearance:none}' +
      '.lsc-op-card.active{border-color:rgba(34,212,255,.75);box-shadow:0 0 16px rgba(34,212,255,.14);background:linear-gradient(90deg,rgba(34,212,255,.12),rgba(0,0,0,.22))}' +
      '.lsc-op-title{font-family:\'Rajdhani\',sans-serif;font-weight:900;font-size:13px;letter-spacing:.5px;color:#e8f8ff}' +
      '.lsc-op-meta{margin-top:2px;font-family:\'Share Tech Mono\',monospace;font-size:8px;color:rgba(178,210,220,.78);line-height:1.45}' +
      '.lsc-op-brief-backdrop{position:fixed;inset:0;z-index:190;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:18px}' +
      '.lsc-op-select-card{width:min(94vw,460px);max-height:86vh;overflow:auto;border-radius:18px;border:1px solid rgba(34,212,255,.38);background:linear-gradient(180deg,rgba(5,18,32,.97),rgba(2,6,12,.97));box-shadow:0 25px 70px rgba(0,0,0,.58),inset 0 0 28px rgba(34,212,255,.06);padding:18px;text-align:left}' +
      '.lsc-op-brief-top{font-family:\'Share Tech Mono\',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#22d4ff;margin-bottom:8px}' +
      '.lsc-op-brief-title{font-family:\'Rajdhani\',sans-serif;font-weight:900;font-size:25px;line-height:1.05;letter-spacing:.8px;color:#fff;text-transform:uppercase}' +
      '.lsc-op-brief-type{font-family:\'Share Tech Mono\',monospace;font-size:9px;color:rgba(210,225,235,.70);margin:5px 0 13px}' +
      '.lsc-op-select-grid{display:grid;gap:9px;margin:12px 0 14px}.lsc-op-select-card-btn{width:100%;min-height:98px}' +
      '.lsc-op-brief-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lsc-op-brief-actions .mBtn{font-size:13px!important;padding:11px 10px!important}' +
      '.lsc-hq-op-card{position:fixed;z-index:118;left:14px;right:14px;top:calc(env(safe-area-inset-top,0px) + 92px);display:none;text-align:left;padding:12px 13px;border-radius:15px;border:1px solid rgba(34,212,255,.45);background:linear-gradient(135deg,rgba(4,17,31,.94),rgba(5,6,12,.86));box-shadow:0 16px 38px rgba(0,0,0,.48),inset 0 0 24px rgba(34,212,255,.07);color:#e8f8ff;-webkit-appearance:none}' +
      '.lsc-hq-op-kicker{font-family:Share Tech Mono,monospace;font-size:8px;letter-spacing:2px;color:#22d4ff;text-transform:uppercase}' +
      '.lsc-hq-op-name{margin-top:4px;font-family:Rajdhani,sans-serif;font-size:18px;line-height:1.05;font-weight:900;letter-spacing:.7px;text-transform:uppercase;color:#fff}' +
      '.lsc-hq-op-sub{margin-top:4px;font-family:Share Tech Mono,monospace;font-size:9px;line-height:1.35;color:rgba(220,235,242,.78)}' +
      '.lsc-hq-op-cta{margin-top:8px;display:inline-block;padding:5px 8px;border-radius:999px;background:rgba(34,212,255,.12);border:1px solid rgba(34,212,255,.35);font-family:Rajdhani,sans-serif;font-weight:900;font-size:10px;letter-spacing:.8px;color:#8eeeff}' +
      '@media (min-width:420px){.lsc-ops-grid{grid-template-columns:1fr 1fr 1fr}.lsc-op-card{min-height:86px}.lsc-hq-op-card{left:18px;right:auto;width:370px}}';
    document.head.appendChild(css);
  }

  function retitleStartScreen() {
    var overlay = $('startOverlay');
    if (!overlay) return;
    var title = overlay.querySelector('.start-title');
    var sub = overlay.querySelector('.start-sub');
    var tag = overlay.querySelector('.start-tag');
    var intro = overlay.querySelector('.start-intro');
    if (title) title.textContent = 'Last Stand Command';
    if (sub) sub.textContent = 'PLAN · DEPLOY · HOLD';
    if (tag) tag.textContent = 'COMMAND OPERATIONS';
    if (intro) intro.textContent = 'Select an operation, assign a command protocol, and lead three lanes through escalating enemy contacts.';
    var label = Array.from(overlay.querySelectorAll('div')).find(function (el) { return (el.textContent || '').trim().toUpperCase() === 'CHOOSE YOUR DOCTRINE'; });
    if (label) label.textContent = 'Choose Your Command Protocol';
    var begin = $('beginBtn');
    if (begin) begin.textContent = '▶ Launch Operation';
  }

  function ensureOperationPanel() {
    if ($('lsc-ops-panel')) return;
    var grid = $('doctrineGrid');
    if (!grid || !grid.parentNode) return;
    var panel = document.createElement('div');
    panel.id = 'lsc-ops-panel';
    panel.className = 'lsc-ops-panel';
    panel.innerHTML = '<div class="lsc-ops-kicker">Operation Select</div><div class="lsc-ops-grid" id="lsc-ops-grid"></div>';
    grid.parentNode.insertBefore(panel, grid);
  }

  function renderOperationCards() {
    ensureOperationPanel();
    var grid = $('lsc-ops-grid');
    var s = state();
    if (!grid || !s) return;
    if (!s.selectedOperation) s.selectedOperation = chooseOperationForDoctrine(s.selectedDoctrine || 'blitz');
    grid.innerHTML = '';
    OPS.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lsc-op-card' + (s.selectedOperation === op.id ? ' active' : '');
      btn.innerHTML = '<div class="lsc-op-title">' + op.icon + ' ' + op.name.replace('Operation ', '') + '</div>' +
        '<div class="lsc-op-meta">' + op.type + '<br>' + op.objective + '</div>';
      btn.addEventListener('click', function () {
        s.selectedOperation = op.id;
        s._manualOperationChoice = true;
        renderOperationCards();
        updateHQOperationCard();
        hapticLight();
      });
      grid.appendChild(btn);
    });
  }

  function patchDoctrineCards() {
    if (typeof buildDoctrineCards === 'function' && !buildDoctrineCards.__ops128) {
      var oldBuild = buildDoctrineCards;
      buildDoctrineCards = function (onSelect) {
        var wrapped = function (d) {
          var s = state();
          if (s && d && !s._manualOperationChoice) s.selectedOperation = chooseOperationForDoctrine(d.id);
          renderOperationCards();
          updateHQOperationCard();
          if (onSelect) onSelect(d);
        };
        var result = oldBuild.call(this, wrapped);
        renderOperationCards();
        return result;
      };
      buildDoctrineCards.__ops128 = true;
    }
  }

  function patchSummaries() {
    if (typeof renderWaveSummaryUI === 'function' && !renderWaveSummaryUI.__ops128) {
      var oldSummary = renderWaveSummaryUI;
      renderWaveSummaryUI = function () {
        var result = oldSummary.apply(this, arguments);
        var op = selectedOp();
        var title = $('sumTitle');
        var tag = $('sumChapterTag');
        if (title && /^✓ Wave /.test(title.textContent || '')) title.textContent = title.textContent.replace('✓ Wave ', '✓ Contact ') + ' Secured';
        if (tag && tag.textContent.indexOf(op.name.replace('Operation ', '')) === -1) tag.textContent = op.name.replace('Operation ', '') + ' · ' + tag.textContent;
        return result;
      };
      renderWaveSummaryUI.__ops128 = true;
    }
  }

  function isHomeVisible() {
    var home = $('homeScreen');
    if (!home) return false;
    var cs = window.getComputedStyle ? window.getComputedStyle(home) : home.style;
    return cs && cs.display !== 'none' && !home.classList.contains('hidden');
  }

  function ensureHQOperationCard() {
    if ($('lsc-hq-op-card')) return;
    var card = document.createElement('button');
    card.type = 'button';
    card.id = 'lsc-hq-op-card';
    card.className = 'lsc-hq-op-card';
    card.innerHTML = '<div class="lsc-hq-op-kicker">ACTIVE COMMAND OPERATION</div>' +
      '<div class="lsc-hq-op-name" id="lsc-hq-op-name">Operation Iron Net</div>' +
      '<div class="lsc-hq-op-sub" id="lsc-hq-op-sub">Tap to review or change mission plan</div>' +
      '<div class="lsc-hq-op-cta">CHANGE OPERATION</div>';
    card.addEventListener('click', function () { showOperationSelectModal(); hapticLight(); });
    document.body.appendChild(card);
  }

  function updateHQOperationCard() {
    ensureHQOperationCard();
    var card = $('lsc-hq-op-card');
    if (!card) return;
    card.style.display = isHomeVisible() ? 'block' : 'none';
    var op = selectedOp();
    var n = $('lsc-hq-op-name');
    var sub = $('lsc-hq-op-sub');
    if (n) n.textContent = op.name;
    if (sub) sub.textContent = op.type + ' · ' + op.formation;
  }

  function ensureOperationSelectModal() {
    if ($('lsc-op-select-modal')) return;
    var node = document.createElement('div');
    node.id = 'lsc-op-select-modal';
    node.className = 'lsc-op-brief-backdrop lsc-op-select-backdrop';
    node.innerHTML = '<div class="lsc-op-select-card">' +
      '<div class="lsc-op-brief-top">Command HQ</div>' +
      '<div class="lsc-op-brief-title">Select Operation</div>' +
      '<div class="lsc-op-brief-type">Choose the mission framing before entering the front. Current Rank ' + ((meta().prestige || 0)) + '</div>' +
      '<div class="lsc-op-select-grid" id="lsc-op-select-grid"></div>' +
      '<div class="lsc-op-brief-actions"><button class="mBtn ghost" id="lsc-op-select-close">Close HQ</button><button class="mBtn good" id="lsc-op-select-start">Start From Home</button></div>' +
    '</div>';
    document.body.appendChild(node);
    $('lsc-op-select-close').addEventListener('click', function () { node.style.display = 'none'; });
    $('lsc-op-select-start').addEventListener('click', function () {
      node.style.display = 'none';
      var start = $('homeStartBtn');
      if (start) start.click();
    });
  }

  function renderOperationSelectModalCards() {
    ensureOperationSelectModal();
    var grid = $('lsc-op-select-grid');
    var s = state();
    if (!grid || !s) return;
    if (!s.selectedOperation) s.selectedOperation = chooseOperationForDoctrine(s.selectedDoctrine || 'blitz');
    grid.innerHTML = '';
    OPS.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lsc-op-card lsc-op-select-card-btn' + (s.selectedOperation === op.id ? ' active' : '');
      btn.innerHTML = '<div class="lsc-op-title">' + op.icon + ' ' + op.name + '</div>' +
        '<div class="lsc-op-meta"><b>' + op.type + '</b><br>' + op.objective + '<br><br>Threat: ' + op.threat + '<br>Formation: ' + op.formation + '<br>Reward: ' + op.reward + '</div>';
      btn.addEventListener('click', function () {
        s.selectedOperation = op.id;
        s._manualOperationChoice = true;
        renderOperationSelectModalCards();
        renderOperationCards();
        updateHQOperationCard();
        hapticLight();
      });
      grid.appendChild(btn);
    });
  }

  function showOperationSelectModal() {
    ensureOperationSelectModal();
    renderOperationSelectModalCards();
    var m = $('lsc-op-select-modal');
    if (m) m.style.display = 'flex';
  }

  function boot() {
    installStyles();
    retitleStartScreen();
    patchDoctrineCards();
    renderOperationCards();
    patchSummaries();
    updateHQOperationCard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); });
  else setTimeout(boot, 80);
  setInterval(function () { safe('refresh operations identity', function () { retitleStartScreen(); renderOperationCards(); updateHQOperationCard(); }); }, 1000);
})();
