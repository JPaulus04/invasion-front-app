// ══════════════════════════════════════════════════════════════
// Build 129 — War Room Identity Layer
// Purpose: make Last Stand Command immediately read as a distinct
// command-operations strategy game before combat begins.
// ══════════════════════════════════════════════════════════════
(function () {
  if (window.__LSC_OPERATION_IDENTITY_129__) return;
  window.__LSC_OPERATION_IDENTITY_129__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) { try { return fn(); } catch (e) { try { console.warn('[Ops129]', label, e); } catch (_) {} } }
  function state() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function meta() { return (typeof G !== 'undefined' && G.meta) ? G.meta : {}; }
  function hapticLight() { try { if (typeof haptic === 'function') haptic('light'); } catch (_) {} }

  var OPS = [
    {
      id: 'iron-net',
      icon: '🛰',
      short: 'Iron Net',
      name: 'Operation Iron Net',
      type: 'Defense Grid',
      sector: 'GRID A-17',
      risk: 'MED',
      objective: 'Hold three lanes while command systems map enemy movement.',
      threat: 'Mixed infantry with one armored contact likely.',
      reward: '+Command XP · +Credits · Formation intel',
      formation: 'Balanced: Rifle / Heavy / Medic',
      doctrineHint: 'Fortress or Artillery stabilizes the line.',
      x: 22,
      y: 63
    },
    {
      id: 'blackout-shield',
      icon: '📡',
      short: 'Blackout Shield',
      name: 'Operation Blackout Shield',
      type: 'Electronic Warfare',
      sector: 'SIGNAL ZONE 4',
      risk: 'HIGH',
      objective: 'Survive jamming conditions and protect the command base.',
      threat: 'Blackout, Ion Storm, and shielded enemies more likely.',
      reward: '+EW research pressure · +Officer readiness',
      formation: 'Control: EW / Rifle / Heavy',
      doctrineHint: 'EW Superiority excels against shields and storms.',
      x: 54,
      y: 39
    },
    {
      id: 'redline-hold',
      icon: '🎯',
      short: 'Redline Hold',
      name: 'Operation Redline Hold',
      type: 'High-Threat Contact',
      sector: 'REDLINE FRONT',
      risk: 'SEVERE',
      objective: 'Prepare for boss-class pressure and coordinated lane assaults.',
      threat: 'Boss wave indicators, heavy units, and breach rushes.',
      reward: '+Command Data chance · +Boss progression',
      formation: 'Boss Push: Heavy / Rifle / Medic',
      doctrineHint: 'Blitzkrieg or Artillery increases burst damage.',
      x: 78,
      y: 68
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

  function docName() {
    var s = state();
    var doc = (typeof DOCTRINES !== 'undefined') ? DOCTRINES.find(function (d) { return d.id === (s && s.selectedDoctrine); }) : null;
    return doc ? doc.name : 'Selected Protocol';
  }

  function installStyles() {
    if ($('lsc-ops129-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-ops129-style';
    css.textContent = '' +
      '.lsc-start-retitle .start-tag{background:rgba(34,212,255,.12)!important;border-color:rgba(34,212,255,.38)!important;color:#8eeeff!important}' +
      '.lsc-warroom{position:relative;margin:10px 0 14px;padding:12px;border-radius:18px;border:1px solid rgba(34,212,255,.38);background:linear-gradient(180deg,rgba(4,18,32,.92),rgba(3,8,16,.86));box-shadow:inset 0 0 28px rgba(34,212,255,.07),0 16px 44px rgba(0,0,0,.26);overflow:hidden}' +
      '.lsc-warroom:before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(34,212,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(34,212,255,.035) 1px,transparent 1px);background-size:18px 18px;opacity:.42;pointer-events:none}' +
      '.lsc-war-head{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}' +
      '.lsc-war-kicker{font-family:Share Tech Mono,monospace;font-size:8px;letter-spacing:2.6px;text-transform:uppercase;color:#22d4ff}' +
      '.lsc-war-title{font-family:Rajdhani,sans-serif;font-size:23px;line-height:1;font-weight:900;letter-spacing:1px;color:#fff;text-transform:uppercase}' +
      '.lsc-war-chip{font-family:Share Tech Mono,monospace;font-size:8px;letter-spacing:1px;color:#d8f7ff;border:1px solid rgba(34,212,255,.35);border-radius:999px;padding:5px 7px;background:rgba(34,212,255,.10);white-space:nowrap}' +
      '.lsc-war-map{position:relative;height:152px;border-radius:15px;border:1px solid rgba(255,255,255,.10);background:radial-gradient(circle at 18% 70%,rgba(34,212,255,.16),transparent 26%),radial-gradient(circle at 76% 34%,rgba(255,60,60,.18),transparent 28%),linear-gradient(135deg,rgba(2,7,15,.84),rgba(6,19,31,.74));overflow:hidden;margin-bottom:10px}' +
      '.lsc-war-route{position:absolute;height:2px;background:linear-gradient(90deg,rgba(34,212,255,.18),rgba(34,212,255,.72),rgba(255,60,60,.48));transform-origin:left center;opacity:.75}' +
      '.lsc-war-route.r1{left:23%;top:64%;width:36%;transform:rotate(-29deg)}.lsc-war-route.r2{left:54%;top:40%;width:31%;transform:rotate(32deg)}' +
      '.lsc-war-scan{position:absolute;left:-20%;top:0;width:20%;height:100%;background:linear-gradient(90deg,transparent,rgba(34,212,255,.16),transparent);animation:lscScan129 3.4s linear infinite}' +
      '@keyframes lscScan129{0%{left:-24%}100%{left:110%}}' +
      '.lsc-map-node{position:absolute;transform:translate(-50%,-50%);min-width:82px;padding:7px 7px 6px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.48);color:#eafaff;text-align:left;-webkit-appearance:none;box-shadow:0 10px 22px rgba(0,0,0,.32)}' +
      '.lsc-map-node.active{border-color:#22d4ff;box-shadow:0 0 18px rgba(34,212,255,.28),inset 0 0 12px rgba(34,212,255,.10)}' +
      '.lsc-map-node b{display:block;font-family:Rajdhani,sans-serif;font-size:12px;line-height:1;font-weight:900;letter-spacing:.5px;color:#fff}.lsc-map-node span{display:block;margin-top:3px;font-family:Share Tech Mono,monospace;font-size:7px;line-height:1.25;color:rgba(218,238,246,.72)}' +
      '.lsc-map-pulse{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:4px;background:#22d4ff;box-shadow:0 0 9px #22d4ff}' +
      '.lsc-intel-grid{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}' +
      '.lsc-intel-row{border-radius:11px;border:1px solid rgba(255,255,255,.09);background:rgba(0,0,0,.25);padding:8px 9px;min-height:46px}' +
      '.lsc-intel-row.wide{grid-column:1 / -1}.lsc-intel-row b{display:block;font-family:Rajdhani,sans-serif;font-size:11px;letter-spacing:.8px;text-transform:uppercase;color:#9cecff;margin-bottom:2px}.lsc-intel-row span{font-family:Share Tech Mono,monospace;font-size:8px;line-height:1.35;color:rgba(225,235,240,.82)}' +
      '.lsc-war-actions{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.lsc-war-actions button{border-radius:12px;border:1px solid rgba(34,212,255,.26);background:rgba(0,0,0,.28);color:#eafaff;font-family:Rajdhani,sans-serif;font-size:13px;font-weight:900;padding:10px 8px;-webkit-appearance:none}.lsc-war-actions button.good{background:linear-gradient(180deg,rgba(24,240,106,.26),rgba(8,90,40,.38));border-color:rgba(24,240,106,.42)}' +
      '.lsc-op-brief-backdrop{position:fixed;inset:0;z-index:190;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:18px}' +
      '.lsc-op-brief-card,.lsc-op-select-card{width:min(92vw,440px);max-height:86vh;overflow:auto;border-radius:18px;border:1px solid rgba(34,212,255,.38);background:linear-gradient(180deg,rgba(5,18,32,.97),rgba(2,6,12,.97));box-shadow:0 25px 70px rgba(0,0,0,.58),inset 0 0 28px rgba(34,212,255,.06);padding:18px;text-align:left}' +
      '.lsc-op-brief-top{font-family:Share Tech Mono,monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#22d4ff;margin-bottom:8px}.lsc-op-brief-title{font-family:Rajdhani,sans-serif;font-weight:900;font-size:25px;line-height:1.05;letter-spacing:.8px;color:#fff;text-transform:uppercase}.lsc-op-brief-type{font-family:Share Tech Mono,monospace;font-size:9px;color:rgba(210,225,235,.70);margin:5px 0 13px}.lsc-op-intel{display:grid;gap:8px;margin:10px 0 14px}.lsc-op-intel-row{border-radius:11px;border:1px solid rgba(255,255,255,.09);background:rgba(0,0,0,.25);padding:9px 10px}.lsc-op-intel-row b{display:block;font-family:Rajdhani,sans-serif;font-size:12px;letter-spacing:.8px;text-transform:uppercase;color:#9cecff;margin-bottom:2px}.lsc-op-intel-row span{font-family:Share Tech Mono,monospace;font-size:9px;line-height:1.45;color:rgba(225,235,240,.82)}.lsc-op-brief-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lsc-op-brief-actions .mBtn{font-size:13px!important;padding:11px 10px!important}' +
      '.lsc-hq-op-card{position:fixed;z-index:118;left:14px;right:14px;top:calc(env(safe-area-inset-top,0px) + 92px);display:none;text-align:left;padding:12px 13px;border-radius:15px;border:1px solid rgba(34,212,255,.45);background:linear-gradient(135deg,rgba(4,17,31,.94),rgba(5,6,12,.86));box-shadow:0 16px 38px rgba(0,0,0,.48),inset 0 0 24px rgba(34,212,255,.07);color:#e8f8ff;-webkit-appearance:none}' +
      '.lsc-hq-op-kicker{font-family:Share Tech Mono,monospace;font-size:8px;letter-spacing:2px;color:#22d4ff;text-transform:uppercase}.lsc-hq-op-name{margin-top:4px;font-family:Rajdhani,sans-serif;font-size:18px;line-height:1.05;font-weight:900;letter-spacing:.7px;text-transform:uppercase;color:#fff}.lsc-hq-op-sub{margin-top:4px;font-family:Share Tech Mono,monospace;font-size:9px;line-height:1.35;color:rgba(220,235,242,.78)}.lsc-hq-op-cta{margin-top:8px;display:inline-block;padding:5px 8px;border-radius:999px;background:rgba(34,212,255,.12);border:1px solid rgba(34,212,255,.35);font-family:Rajdhani,sans-serif;font-weight:900;font-size:10px;letter-spacing:.8px;color:#8eeeff}' +
      '.lsc-op-select-grid{display:grid;gap:9px;margin:12px 0 14px}.lsc-op-card{border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.28);padding:10px;text-align:left;color:#eafaff;-webkit-appearance:none}.lsc-op-card.active{border-color:#22d4ff;box-shadow:0 0 16px rgba(34,212,255,.20);background:linear-gradient(90deg,rgba(34,212,255,.14),rgba(0,0,0,.28))}.lsc-op-title{font-family:Rajdhani,sans-serif;font-size:15px;font-weight:900;color:#fff}.lsc-op-meta{font-family:Share Tech Mono,monospace;font-size:8.5px;line-height:1.4;color:rgba(220,235,242,.78)}' +
      '@media (max-width:370px){.lsc-war-map{height:135px}.lsc-map-node{min-width:72px;padding:6px}.lsc-intel-grid{grid-template-columns:1fr}.lsc-intel-row.wide{grid-column:auto}.lsc-war-title{font-size:20px}}' +
      '@media (min-width:420px){.lsc-hq-op-card{left:18px;right:auto;width:370px}.lsc-war-map{height:170px}}';
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
    if (sub) sub.textContent = 'WAR ROOM · DEPLOYMENT · HOLD';
    if (tag) tag.textContent = 'COMMAND OPERATIONS';
    if (intro) intro.textContent = 'Select a front-line operation, assign a command protocol, and deploy squads through escalating enemy contacts.';
    Array.from(overlay.querySelectorAll('div,span')).forEach(function (el) {
      var t = (el.textContent || '').trim().toUpperCase();
      if (t === 'CHOOSE YOUR DOCTRINE') el.textContent = 'Choose Your Command Protocol';
    });
    var begin = $('beginBtn');
    if (begin) begin.textContent = '▶ Launch Operation';
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
      '<div class="lsc-op-brief-actions"><button class="mBtn ghost" id="lsc-op-cancel">Close Intel</button><button class="mBtn good" id="lsc-op-return">Return to War Room</button></div>' +
    '</div>';
    document.body.appendChild(node);
    $('lsc-op-cancel').addEventListener('click', function () { node.style.display = 'none'; });
    $('lsc-op-return').addEventListener('click', function () { node.style.display = 'none'; });
  }

  function showBriefing() {
    ensureBriefingModal();
    var op = selectedOp();
    $('lsc-op-brief-title').textContent = op.name;
    $('lsc-op-brief-type').textContent = op.sector + ' · ' + op.type + ' · Risk ' + op.risk + ' · ' + docName();
    $('lsc-op-objective').textContent = op.objective;
    $('lsc-op-threat').textContent = op.threat;
    $('lsc-op-formation').textContent = op.formation + ' · ' + op.doctrineHint;
    $('lsc-op-reward').textContent = op.reward;
    $('lsc-op-brief').style.display = 'flex';
  }

  function ensureOperationPanel() {
    if ($('lsc-warroom')) return;
    var grid = $('doctrineGrid');
    if (!grid || !grid.parentNode) return;
    var panel = document.createElement('div');
    panel.id = 'lsc-warroom';
    panel.className = 'lsc-warroom';
    panel.innerHTML = '<div class="lsc-war-head">' +
        '<div><div class="lsc-war-kicker">Command War Room</div><div class="lsc-war-title">Select Front Operation</div></div>' +
        '<div class="lsc-war-chip" id="lsc-war-chip">RANK 0</div>' +
      '</div>' +
      '<div class="lsc-war-map" id="lsc-war-map">' +
        '<div class="lsc-war-scan"></div><div class="lsc-war-route r1"></div><div class="lsc-war-route r2"></div>' +
      '</div>' +
      '<div class="lsc-intel-grid">' +
        '<div class="lsc-intel-row"><b>Active Objective</b><span id="lsc-active-objective">—</span></div>' +
        '<div class="lsc-intel-row"><b>Threat Forecast</b><span id="lsc-active-threat">—</span></div>' +
        '<div class="lsc-intel-row wide"><b>Formation Guidance</b><span id="lsc-active-formation">—</span></div>' +
      '</div>' +
      '<div class="lsc-war-actions"><button type="button" id="lsc-intel-btn">Review Intel</button><button type="button" class="good" id="lsc-war-ready-btn">Operation Selected</button></div>';
    grid.parentNode.insertBefore(panel, grid);
    $('lsc-intel-btn').addEventListener('click', function () { showBriefing(); hapticLight(); });
    $('lsc-war-ready-btn').addEventListener('click', function () { hapticLight(); var b = $('beginBtn'); if (b) b.scrollIntoView({behavior:'smooth', block:'center'}); });
  }

  function renderOperationCards() {
    ensureOperationPanel();
    var map = $('lsc-war-map');
    var s = state();
    if (!map || !s) return;
    if (!s.selectedOperation) s.selectedOperation = chooseOperationForDoctrine(s.selectedDoctrine || 'blitz');
    Array.from(map.querySelectorAll('.lsc-map-node')).forEach(function (n) { n.remove(); });
    OPS.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lsc-map-node' + (s.selectedOperation === op.id ? ' active' : '');
      btn.style.left = op.x + '%';
      btn.style.top = op.y + '%';
      btn.innerHTML = '<b><i class="lsc-map-pulse"></i>' + op.short + '</b><span>' + op.sector + '<br>Risk ' + op.risk + '</span>';
      btn.addEventListener('click', function () {
        s.selectedOperation = op.id;
        s._manualOperationChoice = true;
        renderOperationCards();
        updateHQOperationCard();
        hapticLight();
      });
      map.appendChild(btn);
    });
    updateWarRoomIntel();
  }

  function updateWarRoomIntel() {
    var op = selectedOp();
    var chip = $('lsc-war-chip');
    var obj = $('lsc-active-objective');
    var th = $('lsc-active-threat');
    var fm = $('lsc-active-formation');
    if (chip) chip.textContent = 'RANK ' + ((meta().prestige || 0)) + ' · ' + op.risk;
    if (obj) obj.textContent = op.name + ': ' + op.objective;
    if (th) th.textContent = op.threat;
    if (fm) fm.textContent = op.formation + ' · ' + docName();
  }

  function patchDoctrineCards() {
    if (typeof buildDoctrineCards === 'function' && !buildDoctrineCards.__ops129) {
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
      buildDoctrineCards.__ops129 = true;
    }
  }

  function patchSummaries() {
    if (typeof renderWaveSummaryUI === 'function' && !renderWaveSummaryUI.__ops129) {
      var oldSummary = renderWaveSummaryUI;
      renderWaveSummaryUI = function () {
        var result = oldSummary.apply(this, arguments);
        var op = selectedOp();
        var title = $('sumTitle');
        var tag = $('sumChapterTag');
        if (title && /^✓ Wave /.test(title.textContent || '')) title.textContent = title.textContent.replace('✓ Wave ', '✓ Contact ') + ' Secured';
        if (tag && tag.textContent.indexOf(op.short) === -1) tag.textContent = op.short + ' · ' + tag.textContent;
        return result;
      };
      renderWaveSummaryUI.__ops129 = true;
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
      '<div class="lsc-hq-op-cta">OPEN WAR ROOM</div>';
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
    if (sub) sub.textContent = op.sector + ' · ' + op.type + ' · ' + op.formation;
  }

  function ensureOperationSelectModal() {
    if ($('lsc-op-select-modal')) return;
    var node = document.createElement('div');
    node.id = 'lsc-op-select-modal';
    node.className = 'lsc-op-brief-backdrop lsc-op-select-backdrop';
    node.innerHTML = '<div class="lsc-op-select-card">' +
      '<div class="lsc-op-brief-top">Command HQ</div>' +
      '<div class="lsc-op-brief-title">War Room</div>' +
      '<div class="lsc-op-brief-type">Choose the front operation before entering the battlefield. Current Rank ' + ((meta().prestige || 0)) + '</div>' +
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
      btn.className = 'lsc-op-card' + (s.selectedOperation === op.id ? ' active' : '');
      btn.innerHTML = '<div class="lsc-op-title">' + op.icon + ' ' + op.name + '</div>' +
        '<div class="lsc-op-meta"><b>' + op.sector + ' · ' + op.type + ' · Risk ' + op.risk + '</b><br>' + op.objective + '<br><br>Threat: ' + op.threat + '<br>Formation: ' + op.formation + '</div>';
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

  function patchStaticLanguage() {
    safe('language patch', function () {
      Array.from(document.querySelectorAll('button,div,span')).forEach(function (el) {
        var t = (el.textContent || '').trim();
        if (t === 'Choose Your Doctrine') el.textContent = 'Choose Your Command Protocol';
        if (t === 'Brief Operation') el.textContent = 'Launch Operation';
      });
    });
  }

  function boot() {
    installStyles();
    retitleStartScreen();
    ensureBriefingModal();
    patchDoctrineCards();
    renderOperationCards();
    patchSummaries();
    patchStaticLanguage();
    updateHQOperationCard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); });
  else setTimeout(boot, 80);
  setInterval(function () { safe('refresh operations panel', function () { retitleStartScreen(); renderOperationCards(); updateHQOperationCard(); }); }, 1200);
})();
