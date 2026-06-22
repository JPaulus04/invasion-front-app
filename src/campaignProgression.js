// ═══════════════════════════════════════════════════════
//  campaignProgression.js — campaign progression, daily rewards, and world prestige
//  Permanent gameplay module loaded by build.js.
//
//  Adds campaign HUD, world prestige, permanent research preservation,
//  earnable Gems + daily rewards, AAR world report, and removes old
//  locked Operations placeholder tab. No new paid IAP products.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_CAMPAIGN_PROGRESSION__) return;
  window.__LSC_CAMPAIGN_PROGRESSION__ = true;

  var DAILY_KEY = 'lsc_b104_daily_rewards';
  var LAST_WORLD_KEY = 'lsc_b104_last_world_seen';
  var DAILY = [
    { day: 1, icon: '💎', label: '50 Gems', gems: 50 },
    { day: 2, icon: '¢',  label: '250 Credits', credits: 250 },
    { day: 3, icon: '📦', label: 'Field Crate Voucher', fieldCrates: 1 },
    { day: 4, icon: '⌁',  label: '2 Command Data', commandData: 2 },
    { day: 5, icon: '💎', label: '100 Gems', gems: 100 },
    { day: 6, icon: '★',  label: '10 Officer Shards', officerShards: 10 },
    { day: 7, icon: '🎖', label: 'Command Crate Voucher', commandCrates: 1 }
  ];

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) { try { return fn(); } catch (e) { try { console.warn('[Campaign]', label, e); } catch (_) {} } }
  function clone(obj) { try { return JSON.parse(JSON.stringify(obj || {})); } catch (_) { return {}; } }
  function getState() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function getMeta() { if (typeof G === 'undefined') return null; if (!G.meta) G.meta = {}; return G.meta; }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); else console.log('[Campaign]', msg); }
  function buzz(kind) { try { if (typeof haptic === 'function') haptic(kind || 'light'); } catch (_) {} }
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

  function ensureMeta() {
    var m = getMeta();
    if (!m) return null;
    if (typeof ensureCampaignMeta === 'function') ensureCampaignMeta(m);
    if (typeof m.gems !== 'number') m.gems = 0;
    if (typeof m.commandData !== 'number') m.commandData = 0;
    if (!m.commandResearchNodes) m.commandResearchNodes = {};
    if (!m.recruitmentVouchers) m.recruitmentVouchers = { field: 0, command: 0, strategic: 0 };
    if (!m.officerShards) m.officerShards = { generic: 0 };
    return m;
  }

  function saveMetaNow() { var m = ensureMeta(); if (m && typeof saveMeta === 'function') saveMeta(m); }

  safe('patch meta/state helpers', function () {
    if (typeof loadMeta === 'function' && !loadMeta.__campaignProgression) {
      var oldLoadMeta = loadMeta;
      loadMeta = function () { var m = oldLoadMeta.apply(this, arguments); if (typeof ensureCampaignMeta === 'function') ensureCampaignMeta(m); return Object.assign({ gems: 0, commandData: 0, commandResearchNodes: {}, recruitmentVouchers: { field:0, command:0, strategic:0 }, officerShards: { generic:0 } }, m); };
      loadMeta.__campaignProgression = true;
    }
    if (typeof saveMeta === 'function' && !saveMeta.__campaignProgression) {
      var oldSaveMeta = saveMeta;
      saveMeta = function (m) { if (typeof ensureCampaignMeta === 'function') ensureCampaignMeta(m); return oldSaveMeta.apply(this, arguments); };
      saveMeta.__campaignProgression = true;
    }
    if (typeof freshState === 'function' && !freshState.__campaignProgression) {
      var oldFreshState = freshState;
      freshState = function (prestige) { var s = oldFreshState.apply(this, arguments); if (typeof ensureCampaignState === 'function') ensureCampaignState(s, getMeta()); return s; };
      freshState.__campaignProgression = true;
    }
    if (typeof saveGame === 'function' && !saveGame.__campaignProgression) {
      var oldSaveGame = saveGame;
      saveGame = function () { var s = getState(), m = ensureMeta(); if (typeof ensureCampaignState === 'function') ensureCampaignState(s, m); if (typeof recordWorldProgress === 'function') recordWorldProgress(m, s); if (s && m) s.gems = m.gems || 0; return oldSaveGame.apply(this, arguments); };
      saveGame.__campaignProgression = true;
    }
    if (typeof recordRun === 'function' && !recordRun.__campaignProgression) {
      var oldRecordRun = recordRun;
      recordRun = function (m, s) { if (typeof recordWorldProgress === 'function') recordWorldProgress(m, s); return oldRecordRun.apply(this, arguments); };
      recordRun.__campaignProgression = true;
    }
  });

  function removeLockedResearchPlaceholder() {
    safe('remove locked Operations placeholder', function () {
      if (typeof RESEARCH_DEPARTMENTS === 'undefined' || !Array.isArray(RESEARCH_DEPARTMENTS)) return;
      for (var i = RESEARCH_DEPARTMENTS.length - 1; i >= 0; i--) {
        if (RESEARCH_DEPARTMENTS[i] && RESEARCH_DEPARTMENTS[i].id === 'operations' && RESEARCH_DEPARTMENTS[i].locked) RESEARCH_DEPARTMENTS.splice(i, 1);
      }
    });
  }

  function rememberResearchFromState() {
    safe('remember research', function () {
      var s = getState(), m = ensureMeta();
      if (!s || !m || !s.researchNodes) return;
      Object.keys(s.researchNodes).forEach(function (k) { if (s.researchNodes[k]) m.commandResearchNodes[k] = s.researchNodes[k]; });
      saveMetaNow();
    });
  }

  function mergePermanentResearch(s) {
    var m = ensureMeta();
    if (!s || !m) return;
    if (!s.researchNodes) s.researchNodes = {};
    Object.keys(m.commandResearchNodes || {}).forEach(function (k) { if (!s.researchNodes[k]) s.researchNodes[k] = m.commandResearchNodes[k]; });
  }

  function applyPermanentMappedResearchLevels(s) {
    if (!s || !s.researchNodes || typeof TREE_NODES === 'undefined') return;
    TREE_NODES.forEach(function (node) {
      if (!node || node.locked) return;
      var rec = s.researchNodes[node.id];
      if (!rec || rec.migrated) return;
      if (node.type === 'upgrade' && node.upgradeId && s.upgrades) s.upgrades[node.upgradeId] = (s.upgrades[node.upgradeId] || 0) + 1;
      if (node.type === 'lane' && node.laneUpgradeId && s.lanes) s.lanes.forEach(function (l) { l[node.laneUpgradeId] = (l[node.laneUpgradeId] || 0) + 1; });
    });
  }

  safe('patch tree purchases', function () {
    if (typeof _purchaseTreeNode === 'function' && !_purchaseTreeNode.__campaignProgression) {
      var oldPurchaseTreeNode = _purchaseTreeNode;
      _purchaseTreeNode = function (node, timerSecs) {
        var result = oldPurchaseTreeNode.apply(this, arguments);
        var s = getState(), m = ensureMeta();
        if (node && s && m && s.researchNodes && s.researchNodes[node.id]) { m.commandResearchNodes[node.id] = s.researchNodes[node.id]; saveMetaNow(); }
        return result;
      };
      _purchaseTreeNode.__campaignProgression = true;
    }
  });

  safe('patch prestige', function () {
    if (typeof doPrestige === 'function' && !doPrestige.__campaignProgression) {
      doPrestige = function (onComplete) {
        var gain = (typeof prestigeGain === 'function') ? prestigeGain() : 0;
        var oldState = getState();
        var resetWave = (typeof getWorldPrestigeResetWave === 'function') ? getWorldPrestigeResetWave(oldState) : 1;
        var preview = (typeof getWorldPrestigePreview === 'function') ? getWorldPrestigePreview(oldState) : null;
        var savedResearch = oldState && oldState.researchNodes ? clone(oldState.researchNodes) : {};
        var savedOps = oldState && oldState.opsNodes ? clone(oldState.opsNodes) : {};
        var savedXp = oldState ? (oldState.xp || 0) : 0;
        if (typeof recordRun === 'function') recordRun(G.meta, G.state);
        if (typeof _saveCareerStats === 'function') _saveCareerStats();
        if (typeof _checkAchievements === 'function') _checkAchievements();
        var m = ensureMeta();
        if (typeof applyWorldPrestigeRewards === 'function') applyWorldPrestigeRewards(oldState, m);
        if (m && m._quests) delete m._quests;
        m.prestige = (m.prestige || 0) + gain;
        Object.keys(savedResearch).forEach(function (k) { m.commandResearchNodes[k] = savedResearch[k]; });
        if (typeof saveMeta === 'function') saveMeta(m);
        try { localStorage.removeItem(CFG.SAVE_KEY); } catch (_) {}
        G.state = freshState(m.prestige);
        if (typeof ensureCampaignState === 'function') ensureCampaignState(G.state, m);
        if (m && m._quests) delete m._quests;
        G.state.researchNodes = clone(m.commandResearchNodes || savedResearch || {});
        G.state.opsNodes = savedOps;
        G.state.xp = savedXp;
        G.state.gems = m.gems || 0;
        G.state._orbUnlocked = true;
        G.state.wave = resetWave;
        G.state._runStartWave = resetWave;
        resetQuestStateForRun(G.state);
        applyPermanentMappedResearchLevels(G.state);
        G.state.waveInProgress = false; G.state.enemiesToSpawn = 0; G.state.spawnTimer = 0; G.state.spawnInterval = 0;
        G.state.enemies = []; G.state.projectiles = []; G.state.fx = []; G.state.currentModifier = 'none';
        G.state.runtime = (typeof freshRuntime === 'function') ? freshRuntime() : G.state.runtime;
        G.state._pendingRewardContext = null; G.state._stallCheck = null; G.state._stuckCheck = null; G.state._stuckLastCount = 0;
        G.state.paused = false; G.state.gameOver = false; G.state.started = false;
        if (typeof applyDoctrine === 'function') applyDoctrine();
        if (typeof applyUpgrades === 'function') applyUpgrades();
        if (typeof _initOpsNodes === 'function') _initOpsNodes(G.state);
        if (typeof _restoreIAPPurchases === 'function') _restoreIAPPurchases();
        if (G.log) G.log('World Prestige! Rank → ' + m.prestige + ' · reset to ' + ((preview && preview.world && preview.world.name) || 'current world') + '.', 'system');
        if (typeof playSfx === 'function') playSfx('prestige');
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof saveGame === 'function') saveGame();
        if (onComplete) onComplete();
      };
      doPrestige.__campaignProgression = true;
    }
  });

  function installStyles() {
    if ($('lsc-campaign-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-campaign-style';
    css.textContent = "#lsc-world-chip{position:fixed;z-index:41;left:10px;top:calc(env(safe-area-inset-top,0px) + 72px);width:min(230px,calc(100vw - 118px));padding:8px 10px 9px;border-radius:12px;border:1px solid rgba(255,255,255,.13);background:linear-gradient(135deg,rgba(4,8,14,.84),rgba(0,0,0,.52));box-shadow:0 8px 28px rgba(0,0,0,.35),inset 0 0 18px rgba(34,212,255,.05);backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);pointer-events:none}#lsc-world-main{font-family:'Rajdhani',sans-serif;font-weight:800;letter-spacing:.6px;font-size:12px;line-height:1.05;color:#fff;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#lsc-world-sub{margin-top:4px;font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(180,205,225,.86);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#lsc-world-bar-wrap{margin-top:6px;height:3px;border-radius:20px;background:rgba(255,255,255,.08);overflow:hidden}#lsc-world-bar{height:100%;width:0%;border-radius:20px;background:var(--cyan);box-shadow:0 0 8px currentColor}#lsc-daily-btn{position:fixed;z-index:42;right:10px;top:calc(env(safe-area-inset-top,0px) + 72px);padding:8px 10px;border-radius:12px;border:1px solid rgba(212,160,40,.45);background:rgba(0,0,0,.58);color:#f6c24a;font-family:'Rajdhani',sans-serif;font-weight:800;font-size:12px;letter-spacing:.4px;box-shadow:0 8px 24px rgba(0,0,0,.32);-webkit-appearance:none}#lsc-daily-btn.claimable{animation:lscDailyPulse 1.4s ease-in-out infinite}@keyframes lscDailyPulse{0%,100%{box-shadow:0 0 0 rgba(212,160,40,0)}50%{box-shadow:0 0 18px rgba(212,160,40,.55)}}#lsc-daily-modal,#lsc-world-unlock{position:fixed;inset:0;z-index:160;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}#lsc-daily-card,#lsc-world-unlock-card{width:min(430px,94vw);border:1px solid rgba(212,160,40,.35);border-radius:18px;background:linear-gradient(180deg,rgba(16,18,24,.98),rgba(4,6,10,.96));box-shadow:0 22px 70px rgba(0,0,0,.65),inset 0 0 28px rgba(212,160,40,.05);padding:16px;color:white}.lsc-daily-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin:13px 0 14px}.lsc-daily-day{min-height:58px;border-radius:10px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);padding:6px 3px;text-align:center}.lsc-daily-day.done{opacity:.55;border-color:rgba(24,240,106,.24)}.lsc-daily-day.active{border-color:#d4a028;background:rgba(212,160,40,.10);box-shadow:0 0 14px rgba(212,160,40,.18)}.lsc-daily-icon{font-size:16px;line-height:1.1}.lsc-daily-label{font-family:'Share Tech Mono',monospace;font-size:7px;color:rgba(210,225,235,.9);margin-top:4px;line-height:1.2}.lsc-campaign-btn{width:100%;padding:12px;border-radius:12px;border:1px solid #d4a028;background:rgba(212,160,40,.14);color:#ffd35a;font-family:'Rajdhani',sans-serif;font-weight:800;font-size:15px;-webkit-appearance:none}.lsc-campaign-btn.secondary{margin-top:8px;border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:rgba(210,220,230,.72)}.lsc-aar-panel{margin:10px 0;padding:10px 12px;border-radius:11px;border:1px solid rgba(34,212,255,.28);background:rgba(34,212,255,.055);font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(220,235,245,.92);line-height:1.55;text-align:left;white-space:pre-line}";
    document.head.appendChild(css);
  }

  function ensureWorldChip() { if ($('lsc-world-chip')) return; var chip = document.createElement('div'); chip.id = 'lsc-world-chip'; chip.innerHTML = '<div id="lsc-world-main">🌍 Earth Defense · 1/30</div><div id="lsc-world-sub">0% to Orbit</div><div id="lsc-world-bar-wrap"><div id="lsc-world-bar"></div></div>'; document.body.appendChild(chip); }
  function updateWorldChip() { var s = getState(); if (!s || typeof getWorldProgress !== 'function') return; var p = getWorldProgress(s), m = ensureMeta(); if ($('lsc-world-main')) { $('lsc-world-main').textContent = p.compactLabel; $('lsc-world-main').style.color = p.world.color || '#fff'; } if ($('lsc-world-sub')) $('lsc-world-sub').textContent = (p.nextWorld ? (p.percent + '% to ' + p.nextWorld.shortName) : 'Endgame Front') + ' · Gems ' + ((m && m.gems) || 0); if ($('lsc-world-bar')) { $('lsc-world-bar').style.width = p.percent + '%'; $('lsc-world-bar').style.background = p.world.color || 'var(--cyan)'; $('lsc-world-bar').style.color = p.world.color || 'var(--cyan)'; } }

  function showWorldUnlock(world) {
    if (!world) return;
    if (!$('lsc-world-unlock')) { var modal = document.createElement('div'); modal.id = 'lsc-world-unlock'; modal.innerHTML = '<div id="lsc-world-unlock-card" style="text-align:center"><div id="lsc-world-unlock-icon" style="font-size:38px;margin-bottom:6px">🌍</div><div style="font-family:Share Tech Mono,monospace;font-size:9px;letter-spacing:2px;color:var(--cyan);text-transform:uppercase">New Front Unlocked</div><div id="lsc-world-unlock-name" style="font-family:Rajdhani,sans-serif;font-weight:900;font-size:28px;margin-top:5px">Earth Defense</div><div id="lsc-world-unlock-desc" style="font-family:Share Tech Mono,monospace;font-size:10px;color:var(--muted);line-height:1.55;margin:10px 0 14px"></div><button class="lsc-campaign-btn" id="lsc-world-unlock-close">Continue Command</button></div>'; document.body.appendChild(modal); $('lsc-world-unlock-close').addEventListener('click', function () { $('lsc-world-unlock').style.display = 'none'; }); }
    $('lsc-world-unlock-icon').textContent = world.icon || '🌍'; $('lsc-world-unlock-name').textContent = world.name; $('lsc-world-unlock-name').style.color = world.color || '#fff'; $('lsc-world-unlock-desc').textContent = world.unlockText || world.subtitle || ''; $('lsc-world-unlock').style.display = 'flex'; buzz('success');
  }
  function checkWorldTransition() { var s = getState(), m = ensureMeta(); if (!s || typeof getCampaignWorld !== 'function') return; var world = getCampaignWorld(s.wave || 1), last = localStorage.getItem(LAST_WORLD_KEY); if (!last) localStorage.setItem(LAST_WORLD_KEY, world.id); else if (last !== world.id) { localStorage.setItem(LAST_WORLD_KEY, world.id); if (m && typeof unlockWorldsThroughWave === 'function') { unlockWorldsThroughWave(m, s.wave || 1); saveMetaNow(); } showWorldUnlock(world); } }

  function getDailyState() { try { return Object.assign({ totalClaims: 0, lastClaimDate: '', trackVersion: 1 }, JSON.parse(localStorage.getItem(DAILY_KEY) || '{}')); } catch (_) { return { totalClaims: 0, lastClaimDate: '', trackVersion: 1 }; } }
  function saveDailyState(st) { localStorage.setItem(DAILY_KEY, JSON.stringify(st)); }
  function isDailyClaimable() { return getDailyState().lastClaimDate !== todayKey(); }
  function currentDailyReward() { var st = getDailyState(); return DAILY[Math.min(st.totalClaims || 0, DAILY.length - 1)]; }
  function grantReward(r) { var m = ensureMeta(), s = getState(); if (!m || !r) return; if (r.gems) m.gems = (m.gems || 0) + r.gems; if (r.commandData) m.commandData = (m.commandData || 0) + r.commandData; if (r.fieldCrates) m.recruitmentVouchers.field = (m.recruitmentVouchers.field || 0) + r.fieldCrates; if (r.commandCrates) m.recruitmentVouchers.command = (m.recruitmentVouchers.command || 0) + r.commandCrates; if (r.officerShards) m.officerShards.generic = (m.officerShards.generic || 0) + r.officerShards; if (r.credits && s) s.credits = (s.credits || 0) + r.credits; if (s) s.gems = m.gems || 0; saveMetaNow(); if (typeof saveGame === 'function') saveGame(); }
  function ensureDailyButton() { if ($('lsc-daily-btn')) return; var btn = document.createElement('button'); btn.id = 'lsc-daily-btn'; btn.type = 'button'; btn.textContent = 'DAILY'; btn.addEventListener('click', showDailyModal); document.body.appendChild(btn); }
  function updateDailyButton() { ensureDailyButton(); var btn = $('lsc-daily-btn'); if (!btn) return; btn.classList.toggle('claimable', isDailyClaimable()); btn.textContent = isDailyClaimable() ? '🎁 DAILY' : '🎁 DAILY'; btn.title = isDailyClaimable() ? 'Daily reward available' : 'Daily rewards'; }
  function showDailyModal() { installStyles(); if (!$('lsc-daily-modal')) { var modal = document.createElement('div'); modal.id = 'lsc-daily-modal'; modal.innerHTML = '<div id="lsc-daily-card"><div style="font-family:Share Tech Mono,monospace;font-size:9px;letter-spacing:2px;color:#d4a028;text-transform:uppercase">Command Login Rewards</div><div style="font-family:Rajdhani,sans-serif;font-weight:900;font-size:26px;margin-top:4px">7-Day Supply Drop</div><div style="font-family:Share Tech Mono,monospace;font-size:9px;color:var(--muted);line-height:1.55;margin-top:4px">Earn Gems and future Command Staff resources. Paid Gem packs are not enabled in this build.</div><div id="lsc-daily-grid" class="lsc-daily-grid"></div><button id="lsc-daily-claim" class="lsc-campaign-btn">Claim Reward</button><button id="lsc-daily-close" class="lsc-campaign-btn secondary">Close</button></div>'; document.body.appendChild(modal); $('lsc-daily-close').addEventListener('click', function () { $('lsc-daily-modal').style.display = 'none'; }); $('lsc-daily-claim').addEventListener('click', claimDailyReward); } renderDailyModal(); $('lsc-daily-modal').style.display = 'flex'; }
  function renderDailyModal() { var st = getDailyState(), active = Math.min(st.totalClaims || 0, DAILY.length - 1), grid = $('lsc-daily-grid'); if (!grid) return; grid.innerHTML = DAILY.map(function (r, i) { var cls = 'lsc-daily-day' + (i < (st.totalClaims || 0) ? ' done' : '') + (i === active ? ' active' : ''); return '<div class="' + cls + '"><div style="font-family:Share Tech Mono,monospace;font-size:7px;color:rgba(255,255,255,.45)">DAY ' + r.day + '</div><div class="lsc-daily-icon">' + r.icon + '</div><div class="lsc-daily-label">' + r.label + '</div></div>'; }).join(''); if ($('lsc-daily-claim')) { var r = currentDailyReward(); $('lsc-daily-claim').disabled = !isDailyClaimable(); $('lsc-daily-claim').style.opacity = isDailyClaimable() ? '1' : '.45'; $('lsc-daily-claim').textContent = isDailyClaimable() ? ('Claim ' + r.label) : 'Reward Claimed Today'; } }
  function claimDailyReward() { if (!isDailyClaimable()) return renderDailyModal(); var st = getDailyState(), r = currentDailyReward(); grantReward(r); st.totalClaims = Math.min((st.totalClaims || 0) + 1, DAILY.length); st.lastClaimDate = todayKey(); saveDailyState(st); toast('Daily reward claimed: ' + r.label); buzz('success'); renderDailyModal(); updateDailyButton(); updateWorldChip(); if (typeof updateHUD === 'function') updateHUD(); }

  safe('patch HUD/rendering', function () {
    if (typeof updateHUD === 'function' && !updateHUD.__campaignProgression) { var oldUpdateHUD = updateHUD; updateHUD = function () { var result = oldUpdateHUD.apply(this, arguments); ensureWorldChip(); updateWorldChip(); updateDailyButton(); checkWorldTransition(); replaceOldResearchText(); return result; }; updateHUD.__campaignProgression = true; }
    if (typeof drawVertical === 'function' && !drawVertical.__campaignProgression) { var oldDrawVertical = drawVertical; drawVertical = function (state) { oldDrawVertical.apply(this, arguments); safe('world overlay', function () { if (!ctx || !canvas || !state || typeof getCampaignWorld !== 'function') return; var W = canvas.width, H = canvas.height, world = getCampaignWorld(state.wave || 1), t = state.time || 0; ctx.save(); if (world.id === 'orbit' || world.id === 'moon' || world.id === 'outer' || world.id === 'homeworld') { ctx.globalAlpha = world.id === 'orbit' ? 0.16 : 0.11; ctx.fillStyle = world.skyTop || '#050711'; ctx.fillRect(0, 0, W, H * 0.42); } if (world.id === 'mars') { ctx.globalAlpha = 0.16; ctx.fillStyle = 'rgba(220,85,28,.22)'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 0.28; ctx.fillStyle = 'rgba(255,170,80,.18)'; for (var i = 0; i < 5; i++) ctx.fillRect(0, H * (0.22 + i * .09) + Math.sin(t + i) * 5, W, 2 + i); } if (world.id === 'homeworld') { ctx.globalAlpha = 0.12; ctx.fillStyle = 'rgba(255,30,90,.22)'; ctx.fillRect(0, 0, W, H); } ctx.restore(); }); }; drawVertical.__campaignProgression = true; }
  });

  safe('patch AAR/prestige UI', function () {
    if (typeof renderGameOverUI === 'function' && !renderGameOverUI.__campaignProgression) { var oldRenderGameOverUI = renderGameOverUI; renderGameOverUI = function (gradeInfo) { var result = oldRenderGameOverUI.apply(this, arguments); var s = getState(), m = ensureMeta(); if (s && typeof getWorldProgress === 'function') { var p = getWorldProgress(s), preview = (typeof getWorldPrestigePreview === 'function') ? getWorldPrestigePreview(s) : null; var panel = $('lsc-aar-panel'); if (!panel) { panel = document.createElement('div'); panel.id = 'lsc-aar-panel'; panel.className = 'lsc-aar-panel'; var anchor = $('goRunTip') || $('goPrestigePreview'); if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(panel, anchor); } panel.textContent = 'AFTER-ACTION FRONT REPORT\n' + p.world.icon + ' Current World: ' + p.world.name + '\nWorld Progress: Wave ' + p.localWave + (p.totalWaves ? '/' + p.totalWaves : '+') + ' · ' + p.percent + '%\n' + (p.nextWorld ? 'Next Front: ' + p.nextWorld.name + ' at Wave ' + p.nextWorld.startWave : 'Endgame Front active') + '\nCommand Data: ' + ((m && m.commandData) || 0) + ' · Gems: ' + ((m && m.gems) || 0) + (preview ? '\nPrestige Reset: Wave ' + preview.resetWave + ' · Reward: +' + preview.commandData + ' Command Data' + (preview.gems ? ' · +' + preview.gems + ' Gems' : '') : ''); } return result; }; renderGameOverUI.__campaignProgression = true; }
    if (typeof openPrestigeUI === 'function' && !openPrestigeUI.__campaignProgression) { var oldOpenPrestigeUI = openPrestigeUI; openPrestigeUI = function () { var result = oldOpenPrestigeUI.apply(this, arguments); var s = getState(), desc = $('prestigeDesc'); if (s && desc && typeof getWorldPrestigePreview === 'function' && desc.innerHTML.indexOf('WORLD PRESTIGE') < 0) { var p = getWorldPrestigePreview(s); desc.innerHTML += '<div style="margin-top:10px;padding:8px 10px;border-radius:8px;background:rgba(34,212,255,.07);border:1px solid rgba(34,212,255,.25);font-family:\'Share Tech Mono\',monospace;font-size:8px;text-align:left;color:rgba(210,235,245,.92)"><b style="color:var(--cyan)">WORLD PRESTIGE</b><br>Reset to <b>' + p.world.name + ' Wave ' + p.resetWave + '</b>, not the beginning of the whole campaign.<br>Keep permanent research, Gems, XP, and world unlocks.<br>Reward: +' + p.commandData + ' Command Data' + (p.gems ? ' · +' + p.gems + ' Gems' : '') + '</div>'; } return result; }; openPrestigeUI.__campaignProgression = true; }
  });

  function replaceOldResearchText() { safe('replace research text', function () { var nodes = document.querySelectorAll('div,span'); for (var i = 0; i < nodes.length; i++) { var el = nodes[i], txt = el.textContent || ''; if (el.childNodes.length === 1 && txt.indexOf('Active this run only') >= 0) el.textContent = 'Spend XP to unlock passive bonuses for your unit classes. Command research now persists through World Prestige.'; } }); }


  // Build 122: orders are run-local and active-card-local, not lifetime achievements.
  // This prevents prestige/current-wave restores from instantly completing the visible Orders list.
  function questCounterBaseline(def, s) {
    if (!def || !s) return 0;
    var c = (s._quests && s._quests.counters) || {};
    if (def.type === 'wave') return Math.max(0, (s.wave || 1) - 1);
    return Math.max(0, c[def.type] || 0);
  }

  function ensureQuestCounters(q) {
    if (!q.counters) q.counters = {};
    ['kills','bosses','deploys','research','orbital','nodamage','fullpos'].forEach(function (k) {
      if (typeof q.counters[k] !== 'number') q.counters[k] = 0;
    });
  }

  function stampQuestBaselines(s, force) {
    if (!s || !s._quests || typeof QUEST_DEFS === 'undefined') return;
    var q = s._quests;
    ensureQuestCounters(q);
    if (!Array.isArray(q.active)) q.active = [];
    if (!Array.isArray(q.completed)) q.completed = [];

    if (force || q.baselineVersion !== 122) {
      // Old quest progress was lifetime-based. Reset visible Orders once into the new run-local model.
      q.completed = [];
      q.active.forEach(function (aq) {
        var def = QUEST_DEFS.find(function (d) { return d.id === aq.id; });
        aq.base = questCounterBaseline(def, s);
        aq.claimed = false;
        aq._rewarded = false;
      });
      q.baselineVersion = 122;
    } else {
      q.active.forEach(function (aq) {
        var def = QUEST_DEFS.find(function (d) { return d.id === aq.id; });
        if (typeof aq.base !== 'number') aq.base = questCounterBaseline(def, s);
      });
    }
  }

  function resetQuestStateForRun(s) {
    if (!s) return;
    s._quests = {
      active: [],
      completed: [],
      progress: {},
      counters: { kills:0, bosses:0, deploys:0, research:0, orbital:0, nodamage:0, fullpos:0 },
      baselineVersion: 122
    };
    if (typeof _refreshActiveQuests === 'function') _refreshActiveQuests(s);
    stampQuestBaselines(s, true);
  }

  function inferRunStartWave(s) {
    if (!s) return 1;
    if (typeof s._runStartWave === 'number' && s._runStartWave > 0) return s._runStartWave;
    var m = ensureMeta();
    var reset = (typeof getWorldPrestigeResetWave === 'function') ? getWorldPrestigeResetWave(s) : 1;
    // If the commander has prestiged, runs inside a world should be graded from that world's reset point.
    var inferred = (m && (m.prestige || 0) > 0 && (s.wave || 1) >= reset) ? reset : 1;
    s._runStartWave = inferred;
    return inferred;
  }

  function resetRunTracking(s) {
    if (!s) return;
    s._runStartWave = s.wave || 1;
    resetQuestStateForRun(s);
  }

  function patchQuestAndRunTracking() {
    safe('clear old persistent quests', function () {
      var m = ensureMeta();
      if (m && m._quests) { delete m._quests; saveMetaNow(); }
    });

    if (typeof _refreshActiveQuests === 'function' && !_refreshActiveQuests.__campaign122) {
      _refreshActiveQuests = function (s) {
        if (!s || !s._quests || typeof QUEST_DEFS === 'undefined') return;
        var q = s._quests;
        ensureQuestCounters(q);
        if (!Array.isArray(q.active)) q.active = [];
        if (!Array.isArray(q.completed)) q.completed = [];
        var done = new Set(q.completed || []);
        var active = new Set(q.active.map(function (a) { return a.id; }));
        var available = QUEST_DEFS.filter(function (d) { return !done.has(d.id) && !active.has(d.id); });
        while (q.active.length < 4 && available.length > 0) {
          var pick = available.shift();
          q.active.push({ id: pick.id, claimed: false, base: questCounterBaseline(pick, s) });
        }
        stampQuestBaselines(s, false);
      };
      _refreshActiveQuests.__campaign122 = true;
    }

    if (typeof _initQuestState === 'function' && !_initQuestState.__campaign122) {
      var oldInitQuestState = _initQuestState;
      _initQuestState = function (s) {
        oldInitQuestState.apply(this, arguments);
        stampQuestBaselines(s, false);
      };
      _initQuestState.__campaign122 = true;
    }

    if (typeof _questProgress === 'function' && !_questProgress.__campaign122) {
      _questProgress = function (s, def) {
        if (!s || !s._quests || !def) return 0;
        stampQuestBaselines(s, false);
        var q = s._quests;
        var aq = (q.active || []).find(function (a) { return a.id === def.id; });
        if (!aq) return 0;
        if (typeof aq.base !== 'number') aq.base = questCounterBaseline(def, s);
        var cur = questCounterBaseline(def, s);
        return Math.min(Math.max(0, cur - aq.base), def.target);
      };
      _questProgress.__campaign122 = true;
    }

    if (typeof triggerGameOver === 'function' && !triggerGameOver.__campaign122) {
      var oldTriggerGameOver = triggerGameOver;
      triggerGameOver = function () {
        var info = oldTriggerGameOver.apply(this, arguments) || {};
        var s = getState();
        var start = inferRunStartWave(s);
        var attempted = Math.max(1, ((s && s.wave) || 1) - start + 1);
        var GRADES = {
          S: { min:25, color:'#3ab0d5', bg:'rgba(58,176,213,.06)',  tip:'Outstanding. This run pushed deep into the front.' },
          A: { min:18, color:'#2db858', bg:'rgba(45,184,88,.06)',   tip:'Strong run. You pushed well beyond the reset line.' },
          B: { min:10, color:'#d4a028', bg:'rgba(212,160,40,.06)',  tip:'Solid defense. Tune lanes before the next push.' },
          C: { min:5,  color:'#d07030', bg:'rgba(208,120,48,.06)',  tip:'Early front-line loss. Strengthen formations before pushing.' },
          D: { min:0,  color:'#d04040', bg:'rgba(208,64,64,.06)',   tip:'Early loss after reset. Rebuild lanes before advancing.' }
        };
        var grade = Object.keys(GRADES).find(function (g) { return attempted >= GRADES[g].min; }) || 'D';
        return Object.assign({}, info, GRADES[grade], { grade: grade, runWaves: attempted, gain: info.gain || 0 });
      };
      triggerGameOver.__campaign122 = true;
    }

    var s = getState();
    if (s) {
      inferRunStartWave(s);
      if (!s._quests || s._quests.baselineVersion !== 122) resetQuestStateForRun(s);
    }
  }

  function boot() { installStyles(); removeLockedResearchPlaceholder(); ensureMeta(); patchQuestAndRunTracking(); if (typeof ensureCampaignState === 'function') ensureCampaignState(getState(), getMeta()); mergePermanentResearch(getState()); rememberResearchFromState(); ensureWorldChip(); updateWorldChip(); ensureDailyButton(); updateDailyButton(); checkWorldTransition(); replaceOldResearchText(); if (typeof renderResearchSheet === 'function' && $('upgrade-list-all')) safe('rerender research', renderResearchSheet); if (typeof updateHUD === 'function') updateHUD(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 60); }); else setTimeout(boot, 60);
  setInterval(function () { safe('periodic update', function () { ensureMeta(); ensureWorldChip(); updateWorldChip(); updateDailyButton(); checkWorldTransition(); replaceOldResearchText(); }); }, 1500);
  window.LSC_CAMPAIGN = { showDailyRewards: showDailyModal, getDailyState: getDailyState, isDailyClaimable: isDailyClaimable, updateWorldChip: updateWorldChip };
})();


// ═══════════════════════════════════════════════════════
//  Build 121 — Prestige screen clarity pass
//  Keeps world-prestige logic unchanged; only clarifies labels and choices.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_PRESTIGE_CLARITY_121__) return;
  window.__LSC_PRESTIGE_CLARITY_121__ = true;

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) { try { return fn(); } catch (e) { try { console.warn('[Prestige121]', label, e); } catch (_) {} } }
  function getState() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function getMeta() { return (typeof G !== 'undefined' && G.meta) ? G.meta : {}; }
  function prestigeGainSafe() { try { return (typeof prestigeGain === 'function') ? prestigeGain() : 0; } catch (_) { return 0; } }
  function rankAfter(gain) { var m = getMeta(); return (m.prestige || 0) + (gain || 0); }
  function previewSafe() { var s = getState(); try { return (s && typeof getWorldPrestigePreview === 'function') ? getWorldPrestigePreview(s) : null; } catch (_) { return null; } }
  function worldName(p) { return (p && p.world && p.world.name) ? p.world.name : 'Current Front'; }
  function rewardText(p) {
    if (!p) return 'Prestige reward available';
    return '+' + (p.commandData || 0) + ' Command Data' + (p.gems ? ' · +' + p.gems + ' Gems' : '');
  }

  function troopHpBonusForRank(rank) {
    try {
      if (typeof UNLOCKS !== 'undefined' && UNLOCKS.troopHpBonus) return UNLOCKS.troopHpBonus(rank || 0);
      if (typeof CFG !== 'undefined') return Math.min(CFG.PRESTIGE_HP_CAP || 0.40, Math.max(0, rank || 0) * (CFG.PRESTIGE_HP_BONUS || 0.04));
    } catch (_) {}
    return 0;
  }

  function troopHpText(rank) {
    return '+' + Math.round(troopHpBonusForRank(rank) * 100) + '% troop health';
  }

  function troopHpGainText(oldRank, newRank) {
    var before = Math.round(troopHpBonusForRank(oldRank || 0) * 100);
    var after = Math.round(troopHpBonusForRank(newRank || 0) * 100);
    var gain = Math.max(0, after - before);
    return '+' + gain + '% troop health this prestige · ' + after + '% total';
  }

  function installPrestigeClarityStyles() {
    if ($('lsc-prestige-clarity-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-prestige-clarity-style';
    css.textContent = '' +
      '.lsc-prestige-choice{margin:10px 0 12px;padding:10px 12px;border-radius:12px;border:1px solid rgba(144,96,208,.42);background:linear-gradient(180deg,rgba(144,96,208,.13),rgba(20,10,44,.28));font-family:\'Share Tech Mono\',monospace;font-size:9px;line-height:1.65;color:rgba(225,215,245,.95);text-align:left}' +
      '.lsc-prestige-choice b{color:#d6b2ff;font-family:\'Rajdhani\',sans-serif;font-size:14px;letter-spacing:.5px}' +
      '.lsc-prestige-carry{margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,.10);color:rgba(210,220,230,.82)}' +
      '.lsc-prestige-primary{display:block!important;width:100%!important;margin-top:8px!important;padding:13px 12px!important;border-radius:12px!important;border:1px solid rgba(144,96,208,.9)!important;background:linear-gradient(180deg,#4c2485,#25104a)!important;color:#d9b7ff!important;font-family:\'Rajdhani\',sans-serif!important;font-weight:900!important;font-size:16px!important;letter-spacing:.8px!important;box-shadow:0 0 18px rgba(144,96,208,.22)!important}' +
      '.lsc-newrun-secondary{background:linear-gradient(180deg,#18243a,#101827)!important;border-color:rgba(255,255,255,.14)!important;color:rgba(215,225,235,.78)!important}';
    document.head.appendChild(css);
  }

  function clarifyGameOverPrestige() {
    installPrestigeClarityStyles();
    var gain = prestigeGainSafe();
    var p = previewSafe();
    var currentRank = (getMeta().prestige || 0);
    var newRank = rankAfter(gain);
    var prestigeBtn = $('goPrestigeBtn');
    var prestigePlayBtn = $('goPrestigePlayBtn');
    var newRunBtn = $('goNewRunBtn');
    var preview = $('goPrestigePreview');
    var row = prestigeBtn && prestigeBtn.parentNode;

    if (newRunBtn) {
      newRunBtn.textContent = '↻ New Run Without Prestige';
      newRunBtn.title = 'Restart without gaining command rank or prestige rewards';
      newRunBtn.classList.add('lsc-newrun-secondary');
      newRunBtn.style.minHeight = '48px';
    }

    if (gain > 0) {
      if (preview) {
        preview.innerHTML = '<div class="lsc-prestige-choice">' +
          '<b>Prestige to Rank ' + newRank + '</b><br>' +
          'Gain: ' + rewardText(p) + '<br>' +
          'Training bonus: ' + troopHpGainText(currentRank, newRank) + '<br>' +
          'Reset point: ' + worldName(p) + ' · Wave ' + (p ? p.resetWave : '—') +
          '<div class="lsc-prestige-carry">Carries forward: officers, research, Gems, XP, purchases, world unlocks.</div>' +
          '</div>';
      }
      if (prestigeBtn) {
        prestigeBtn.style.display = 'none';
        prestigeBtn.disabled = true;
      }
      if (row) {
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1fr';
        row.style.gap = '8px';
      }
      if (prestigePlayBtn) {
        prestigePlayBtn.classList.add('lsc-prestige-primary');
        prestigePlayBtn.style.display = 'block';
        prestigePlayBtn.disabled = false;
        prestigePlayBtn.textContent = '★ Prestige to Rank ' + newRank;
        prestigePlayBtn.title = 'Prestige, claim rewards, and begin again at the current front reset point';
      }
    } else {
      if (preview) preview.textContent = 'Reach wave ' + ((typeof CFG !== 'undefined' && CFG.PRESTIGE_WAVE_REQ) || 30) + ' to unlock Prestige.';
      if (prestigeBtn) prestigeBtn.style.display = '';
      if (prestigePlayBtn) prestigePlayBtn.style.display = 'none';
    }
  }

  function buildUnlockList(newRank, currentRank) {
    try {
      if (typeof PERMANENT_UNLOCKS === 'undefined' || !Array.isArray(PERMANENT_UNLOCKS)) return '';
      var newUnlocks = PERMANENT_UNLOCKS.filter(function (u) { return u.rank > currentRank && u.rank <= newRank; });
      var nextUnlock = PERMANENT_UNLOCKS.find(function (u) { return u.rank > newRank; });
      var html = '';
      if (newUnlocks.length) {
        html += '<div style="margin-top:8px;color:var(--green)">' + newUnlocks.map(function (u) { return '★ ' + u.name + ' — ' + u.desc; }).join('<br>') + '</div>';
      }
      if (nextUnlock) html += '<div style="margin-top:7px;color:var(--muted)">Next: Rank ' + nextUnlock.rank + ' unlocks ' + nextUnlock.name + '</div>';
      return html;
    } catch (_) { return ''; }
  }

  function clarifyPrestigeConfirm() {
    installPrestigeClarityStyles();
    var gain = prestigeGainSafe();
    if (gain <= 0) return;
    var m = getMeta();
    var p = previewSafe();
    var currentRank = (getMeta().prestige || 0);
    var newRank = rankAfter(gain);
    var desc = $('prestigeDesc');
    var confirmBtn = $('confirmPrestigeBtn');
    var cancelBtn = $('cancelPrestigeBtn');
    var title = document.querySelector('#prestige-confirm-phase .modal-title');
    if (title) title.textContent = '★ Prestige to Rank ' + newRank;
    if (confirmBtn) confirmBtn.textContent = 'Confirm Prestige to Rank ' + newRank;
    if (cancelBtn) cancelBtn.textContent = 'Not Yet';
    if (desc) {
      var income = (typeof CFG !== 'undefined' && CFG.PRESTIGE_INCOME_BONUS) ? (newRank * CFG.PRESTIGE_INCOME_BONUS * 100).toFixed(0) : '—';
      var dmg = (typeof CFG !== 'undefined' && CFG.PRESTIGE_DMG_BONUS) ? (newRank * CFG.PRESTIGE_DMG_BONUS * 100).toFixed(0) : '—';
      var troopHp = troopHpGainText(currentRank, newRank);
      desc.innerHTML =
        '<div class="lsc-prestige-choice">' +
        '<b>World Prestige</b><br>' +
        'Reset to: ' + worldName(p) + ' · Wave ' + (p ? p.resetWave : '—') + '<br>' +
        'Reward: ' + rewardText(p) + '<br>' +
        'Rank bonuses after prestige: +' + income + '% income · +' + dmg + '% damage · ' + troopHp +
        '<div class="lsc-prestige-carry">Carries forward: permanent research, officers, Gems, XP, purchases, and world unlocks.</div>' +
        buildUnlockList(newRank, m.prestige || 0) +
        '</div>';
    }
  }

  safe('patch game-over prestige labels', function () {
    if (typeof renderGameOverUI === 'function' && !renderGameOverUI.__prestigeClarity121) {
      var oldRenderGameOverUI = renderGameOverUI;
      renderGameOverUI = function () {
        var result = oldRenderGameOverUI.apply(this, arguments);
        clarifyGameOverPrestige();
        return result;
      };
      renderGameOverUI.__prestigeClarity121 = true;
    }
  });

  safe('patch prestige confirm labels', function () {
    if (typeof openPrestigeUI === 'function' && !openPrestigeUI.__prestigeClarity121) {
      var oldOpenPrestigeUI = openPrestigeUI;
      openPrestigeUI = function () {
        var result = oldOpenPrestigeUI.apply(this, arguments);
        clarifyPrestigeConfirm();
        return result;
      };
      openPrestigeUI.__prestigeClarity121 = true;
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(clarifyGameOverPrestige, 120); });
  } else {
    setTimeout(clarifyGameOverPrestige, 120);
  }
})();
