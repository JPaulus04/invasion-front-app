// ══════════════════════════════════════════════════════════════
// Build 126 — Command Operations Identity Layer
// Purpose: make Last Stand Command read as a distinct command-operations
// strategy game before combat begins, rather than a generic wave-defense app.
// ══════════════════════════════════════════════════════════════
(function () {
  if (window.__LSC_OPERATION_IDENTITY_126__) return;
  window.__LSC_OPERATION_IDENTITY_126__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) { try { return fn(); } catch (e) { try { console.warn('[Ops126]', label, e); } catch (_) {} } }
  function state() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function meta() { return (typeof G !== 'undefined' && G.meta) ? G.meta : {}; }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); else console.log('[Ops126]', msg); }
  function hapticLight() { try { if (typeof haptic === 'function') haptic('light'); } catch (_) {} }

  var OPS = [
    {
      id: 'iron-net',
      icon: '🛰',
      name: 'Operation Iron Net',
      type: 'Defense Grid',
      objective: 'Hold three lanes while command systems map enemy movement.',
      threat: 'Mixed infantry with one armored contact likely.',
      reward: '+Command XP · +Credits · Formation intel',
      formation: 'Balanced: Rifle / Heavy / Medic',
      doctrineHint: 'Fortress or Artillery stabilizes the line.'
    },
    {
      id: 'blackout-shield',
      icon: '📡',
      name: 'Operation Blackout Shield',
      type: 'Electronic Warfare',
      objective: 'Survive jamming conditions and protect the command base.',
      threat: 'Blackout, Ion Storm, and shielded enemies more likely.',
      reward: '+EW research pressure · +Officer readiness',
      formation: 'Control: EW / Rifle / Heavy',
      doctrineHint: 'EW Superiority excels against shields and storms.'
    },
    {
      id: 'redline-hold',
      icon: '🎯',
      name: 'Operation Redline Hold',
      type: 'High-Threat Contact',
      objective: 'Prepare for boss-class pressure and coordinated lane assaults.',
      threat: 'Boss wave indicators, heavy units, and breach rushes.',
      reward: '+Command Data chance · +Boss progression',
      formation: 'Boss Push: Heavy / Rifle / Medic',
      doctrineHint: 'Blitzkrieg or Artillery increases burst damage.'
    }
  ];

  function selectedOp() {
    var s = state();
    var id = (s && s.selectedOperation) || 'iron-net';
    return OPS.find(function (o) { return o.id === id; }) || OPS[0];
  }

  function chooseOperationForDoctrine(docId) {
    if (docId === 'ew') return 'blackout-shield';
    if (docId === 'blitz' || docId === 'artillery') return 'redline-hold';
    return 'iron-net';
  }

  function installStyles() {
    if ($('lsc-ops126-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-ops126-style';
    css.textContent = '' +
      '.lsc-ops-panel{margin:10px 0 12px;padding:10px;border-radius:14px;border:1px solid rgba(34,212,255,.20);background:linear-gradient(180deg,rgba(3,16,28,.82),rgba(2,6,12,.70));box-shadow:inset 0 0 22px rgba(34,212,255,.05)}' +
      '.lsc-ops-kicker{font-family:\'Share Tech Mono\',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:rgba(34,212,255,.82);margin-bottom:7px}' +
      '.lsc-ops-grid{display:grid;grid-template-columns:1fr;gap:7px}' +
      '.lsc-op-card{border-radius:11px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.26);padding:9px 10px;text-align:left;color:rgba(225,235,240,.88);-webkit-appearance:none}' +
      '.lsc-op-card.active{border-color:rgba(34,212,255,.75);box-shadow:0 0 16px rgba(34,212,255,.14);background:linear-gradient(90deg,rgba(34,212,255,.12),rgba(0,0,0,.22))}' +
      '.lsc-op-title{font-family:\'Rajdhani\',sans-serif;font-weight:900;font-size:13px;letter-spacing:.5px;color:#e8f8ff}' +
      '.lsc-op-meta{margin-top:2px;font-family:\'Share Tech Mono\',monospace;font-size:8px;color:rgba(178,210,220,.78);line-height:1.45}' +
      '.lsc-op-brief-backdrop{position:fixed;inset:0;z-index:190;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:18px}' +
      '.lsc-op-brief-card{width:min(92vw,430px);border-radius:18px;border:1px solid rgba(34,212,255,.38);background:linear-gradient(180deg,rgba(5,18,32,.96),rgba(2,6,12,.96));box-shadow:0 25px 70px rgba(0,0,0,.55),inset 0 0 28px rgba(34,212,255,.06);padding:18px;text-align:left}' +
      '.lsc-op-brief-top{font-family:\'Share Tech Mono\',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#22d4ff;margin-bottom:8px}' +
      '.lsc-op-brief-title{font-family:\'Rajdhani\',sans-serif;font-weight:900;font-size:25px;line-height:1.05;letter-spacing:.8px;color:#fff;text-transform:uppercase}' +
      '.lsc-op-brief-type{font-family:\'Share Tech Mono\',monospace;font-size:9px;color:rgba(210,225,235,.70);margin:5px 0 13px}' +
      '.lsc-op-intel{display:grid;gap:8px;margin:10px 0 14px}' +
      '.lsc-op-intel-row{border-radius:11px;border:1px solid rgba(255,255,255,.09);background:rgba(0,0,0,.25);padding:9px 10px}' +
      '.lsc-op-intel-row b{display:block;font-family:\'Rajdhani\',sans-serif;font-size:12px;letter-spacing:.8px;text-transform:uppercase;color:#9cecff;margin-bottom:2px}' +
      '.lsc-op-intel-row span{font-family:\'Share Tech Mono\',monospace;font-size:9px;line-height:1.45;color:rgba(225,235,240,.82)}' +
      '.lsc-op-brief-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lsc-op-brief-actions .mBtn{font-size:13px!important;padding:11px 10px!important}' +
      '.lsc-start-retitle .start-tag{background:rgba(34,212,255,.12)!important;border-color:rgba(34,212,255,.38)!important;color:#8eeeff!important}' +
      '@media (min-width:420px){.lsc-ops-grid{grid-template-columns:1fr 1fr 1fr}.lsc-op-card{min-height:86px}}';
    document.head.appendChild(css);
  }

  function retitleStartScreen() {
    var overlay = $('startOverlay');
    if (!overlay) return;
    overlay.classList.add('lsc-start-retitle');
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
    if (begin) begin.textContent = '▶ Brief Operation';
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
        renderOperationCards();
        hapticLight();
      });
      grid.appendChild(btn);
    });
  }

  function ensureBriefingModal() {
    if ($('lsc-op-brief')) return;
    var node = document.createElement('div');
    node.id = 'lsc-op-brief';
    node.className = 'lsc-op-brief-backdrop';
    node.innerHTML = '<div class="lsc-op-brief-card">' +
      '<div class="lsc-op-brief-top">Mission Briefing</div>' +
      '<div class="lsc-op-brief-title" id="lsc-op-brief-title">Operation</div>' +
      '<div class="lsc-op-brief-type" id="lsc-op-brief-type">—</div>' +
      '<div class="lsc-op-intel">' +
        '<div class="lsc-op-intel-row"><b>Objective</b><span id="lsc-op-objective">—</span></div>' +
        '<div class="lsc-op-intel-row"><b>Threat Forecast</b><span id="lsc-op-threat">—</span></div>' +
        '<div class="lsc-op-intel-row"><b>Recommended Formation</b><span id="lsc-op-formation">—</span></div>' +
        '<div class="lsc-op-intel-row"><b>Reward Path</b><span id="lsc-op-reward">—</span></div>' +
      '</div>' +
      '<div class="lsc-op-brief-actions"><button class="mBtn ghost" id="lsc-op-cancel">Adjust Plan</button><button class="mBtn good" id="lsc-op-launch">Launch Operation</button></div>' +
    '</div>';
    document.body.appendChild(node);
    $('lsc-op-cancel').addEventListener('click', function () { node.style.display = 'none'; });
    $('lsc-op-launch').addEventListener('click', function () {
      node.style.display = 'none';
      window.__LSC_OPS126_APPROVED_START__ = true;
      var b = $('beginBtn');
      if (b) b.click();
    });
  }

  function showBriefing() {
    ensureBriefingModal();
    var op = selectedOp();
    var s = state();
    var doc = (typeof DOCTRINES !== 'undefined') ? DOCTRINES.find(function (d) { return d.id === (s && s.selectedDoctrine); }) : null;
    var doctrineName = doc ? doc.name : 'Selected Protocol';
    $('lsc-op-brief-title').textContent = op.name;
    $('lsc-op-brief-type').textContent = op.type + ' · ' + doctrineName + ' · Command Rank ' + ((meta().prestige || 0));
    $('lsc-op-objective').textContent = op.objective;
    $('lsc-op-threat').textContent = op.threat;
    $('lsc-op-formation').textContent = op.formation + ' · ' + op.doctrineHint;
    $('lsc-op-reward').textContent = op.reward;
    $('lsc-op-brief').style.display = 'flex';
  }

  function patchBeginButton() {
    var b = $('beginBtn');
    if (!b || b.__ops126Patched) return;
    b.__ops126Patched = true;
    b.addEventListener('click', function (ev) {
      if (window.__LSC_OPS126_APPROVED_START__) {
        window.__LSC_OPS126_APPROVED_START__ = false;
        return;
      }
      ev.preventDefault();
      ev.stopImmediatePropagation();
      showBriefing();
      hapticLight();
    }, true);
  }

  function patchDoctrineCards() {
    if (typeof buildDoctrineCards === 'function' && !buildDoctrineCards.__ops126) {
      var oldBuild = buildDoctrineCards;
      buildDoctrineCards = function (onSelect) {
        var wrapped = function (d) {
          var s = state();
          if (s && d && !s._manualOperationChoice) s.selectedOperation = chooseOperationForDoctrine(d.id);
          renderOperationCards();
          if (onSelect) onSelect(d);
        };
        var result = oldBuild.call(this, wrapped);
        renderOperationCards();
        return result;
      };
      buildDoctrineCards.__ops126 = true;
    }
  }

  function patchSummaries() {
    if (typeof renderWaveSummaryUI === 'function' && !renderWaveSummaryUI.__ops126) {
      var oldSummary = renderWaveSummaryUI;
      renderWaveSummaryUI = function () {
        var result = oldSummary.apply(this, arguments);
        var op = selectedOp();
        var title = $('sumTitle');
        var tag = $('sumChapterTag');
        if (title && /^✓ Wave /.test(title.textContent || '')) title.textContent = title.textContent.replace('✓ Wave ', '✓ Contact ') + ' Secured';
        if (tag) tag.textContent = op.name.replace('Operation ', '') + ' · ' + tag.textContent;
        return result;
      };
      renderWaveSummaryUI.__ops126 = true;
    }
    if (typeof renderMetaUI === 'function' && !renderMetaUI.__ops126) {
      var oldMeta = renderMetaUI;
      renderMetaUI = function () {
        var result = oldMeta.apply(this, arguments);
        var next = $('nextUnlockText');
        if (next && next.textContent === 'All unlocks achieved!') next.textContent = 'All command programs achieved — continue mastering operations.';
        return result;
      };
      renderMetaUI.__ops126 = true;
    }
  }

  function patchStaticLanguage() {
    safe('language patch', function () {
      Array.from(document.querySelectorAll('button,div,span')).forEach(function (el) {
        var t = (el.textContent || '').trim();
        if (t === 'Choose Your Doctrine') el.textContent = 'Choose Your Command Protocol';
        if (t === 'Begin Operation') el.textContent = 'Brief Operation';
      });
    });
  }

  function boot() {
    installStyles();
    retitleStartScreen();
    patchDoctrineCards();
    renderOperationCards();
    ensureBriefingModal();
    patchBeginButton();
    patchSummaries();
    patchStaticLanguage();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); });
  else setTimeout(boot, 80);
  setInterval(function () { safe('refresh operations panel', function () { retitleStartScreen(); renderOperationCards(); patchBeginButton(); }); }, 2500);
})();
