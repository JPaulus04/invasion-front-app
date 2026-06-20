// ═══════════════════════════════════════════════════════
//  officers.js — Command Staff / Officer foundation
//  Permanent gameplay module loaded by build.js.
//
//  Adds permanent officers, lane assignments, earnable-Gem
//  recruiting, visible crate odds, starter officer, and safe
//  lane auto-management hooks, detail cards, lane bonus summaries, recruit confirmations, optional quick assignment, clear Gem affordability states, and a starter Field Voucher. Paid Gem packs are not enabled.
// ═══════════════════════════════════════════════════════
(function () {
  if (window.__LSC_COMMAND_STAFF__) return;
  window.__LSC_COMMAND_STAFF__ = true;

  var STAFF_KEY = 'lsc_b109_staff_seen';
  var RARITY = {
    common:    { label:'COMMON',    color:'#8fa7b8', cost:100,  shardUnlock:30,  sort:1 },
    rare:      { label:'RARE',      color:'#34d5ff', cost:300,  shardUnlock:60,  sort:2 },
    elite:     { label:'ELITE',     color:'#a066ff', cost:750,  shardUnlock:90,  sort:3 },
    legendary: { label:'LEGENDARY', color:'#ffd35a', cost:1500, shardUnlock:120, sort:4 }
  };

  var OFFICER_DEFS = [
    { id:'mason', rarity:'common', icon:'🪖', name:'Sgt. Mason', title:'Infantry Lead', laneStyle:'Rifle priority', role:'deploy', units:['rifle'], short:'+8% rifle damage · auto-fills empty lane', bonus:{ troopHp:0.04, cost:0.03 }, event:'Earth Defense +5%' },
    { id:'hayes', rarity:'common', icon:'📦', name:'Cpl. Hayes', title:'Supply Runner', laneStyle:'Low-cost deployment', role:'supply', units:['rifle','medic'], short:'Assigned lane troops cost 5% less', bonus:{ cost:0.05, waveCredits:8 }, event:'Supply events +5%' },
    { id:'brooks', rarity:'common', icon:'🔧', name:'Tech. Brooks', title:'Turret Hand', laneStyle:'Turret support', role:'engineer', units:['rifle','heavy'], short:'Troops gain +5% HP near upgraded structures', bonus:{ troopHp:0.05, repair:1 }, event:'Engineering events +5%' },
    { id:'allen', rarity:'common', icon:'➕', name:'Medic Allen', title:'Field Aid', laneStyle:'Medic support', role:'medic', units:['medic','rifle'], short:'Troops in assigned lane heal between waves', bonus:{ troopHp:0.03, heal:2 }, event:'Moon events +5%' },
    { id:'carter', rarity:'common', icon:'🧱', name:'PFC Carter', title:'Wall Crew', laneStyle:'Defense priority', role:'defense', units:['rifle','heavy'], short:'Assigned lane receives minor repair support', bonus:{ troopHp:0.04, repair:2 }, event:'Fortress events +5%' },

    { id:'reyes', rarity:'rare', icon:'⚡', name:'Lt. Reyes', title:'Rapid Response', laneStyle:'Fast lane refill', role:'deploy', units:['rifle','heavy'], short:'First auto-deploy each wave is discounted', bonus:{ troopHp:0.08, cost:0.07 }, event:'Breachline +10%' },
    { id:'novak', rarity:'rare', icon:'💥', name:'Capt. Novak', title:'Fire Control', laneStyle:'Heavy damage lane', role:'assault', units:['heavy','grenadier','rifle'], short:'Heavy/Grenadier lane pressure bonus', bonus:{ troopHp:0.10, cost:0.04 }, event:'Iron Storm +10%' },
    { id:'kim', rarity:'rare', icon:'📡', name:'WO Kim', title:'Signal Support', laneStyle:'EW control', role:'ew', units:['ew','rifle'], short:'Enemy pressure is lightly disrupted in assigned lane', bonus:{ troopHp:0.06, slow:0.05 }, event:'Blackout +10%' },
    { id:'voss', rarity:'rare', icon:'💰', name:'Lt. Voss', title:'Supply Command', laneStyle:'Balanced economy', role:'supply', units:['rifle','medic','heavy'], short:'Small credit injection at wave start', bonus:{ troopHp:0.05, cost:0.05, waveCredits:14 }, event:'Logistics +10%' },

    { id:'briggs', rarity:'elite', icon:'🛡️', name:'Maj. Briggs', title:'Heavy Doctrine', laneStyle:'Fortress lane', role:'defense', units:['heavy','medic','rifle'], short:'Stronger lane survivability and repairs', bonus:{ troopHp:0.16, cost:0.06, repair:4 }, event:'Last Wall +15%' },
    { id:'vale', rarity:'elite', icon:'🎯', name:'Capt. Vale', title:'Sniper Command', laneStyle:'Boss hunter', role:'precision', units:['sniper','rifle','heavy'], short:'High-value target lane specialist', bonus:{ troopHp:0.10, cost:0.04, boss:0.08 }, event:'Red Dust +15%' },
    { id:'rhodes', rarity:'elite', icon:'☄️', name:'Col. Rhodes', title:'Artillery Liaison', laneStyle:'Orbital support', role:'command', units:['rifle','heavy','grenadier'], short:'Orbital doctrine support and lane HP bonus', bonus:{ troopHp:0.12, orbital:0.06 }, event:'Fire Grid +15%' },
    { id:'cross', rarity:'elite', icon:'🧠', name:'Cmdr. Cross', title:'Logistics Architect', laneStyle:'Optimization', role:'supply', units:['rifle','medic','ew'], short:'Efficient deployment and extra wave credits', bonus:{ troopHp:0.08, cost:0.10, waveCredits:18 }, event:'Supply Net +15%' },

    { id:'ironwood', rarity:'legendary', icon:'⭐', name:'Gen. Ironwood', title:'Last Wall', laneStyle:'Legendary fortress', role:'legendary', units:['heavy','medic','rifle'], short:'Powerful lane protection; mastery unlocks with rank', bonus:{ troopHp:0.22, cost:0.08, repair:6, legendary:true }, event:'Iron Storm featured officer' },
    { id:'ghost', rarity:'legendary', icon:'👁️', name:'The Ghost Signal', title:'EW Legend', laneStyle:'Signal denial', role:'legendary', units:['ew','sniper','rifle'], short:'Legendary disruption; mastery unlocks with rank', bonus:{ troopHp:0.14, cost:0.06, slow:0.10, legendary:true }, event:'Blackout featured officer' }
  ];

  var CRATES = {
    field: {
      label:'Field Crate', icon:'📦', cost:100, voucherKey:'field', desc:'Cheap recruitment pull. Good for building common and rare staff.',
      odds:{ common:70, rare:24, elite:5, legendary:1 }
    },
    command: {
      label:'Command Crate', icon:'🎖', cost:300, voucherKey:'command', desc:'Higher chance at rare and elite officers.',
      odds:{ common:45, rare:38, elite:14, legendary:3 }
    },
    strategic: {
      label:'Strategic Crate', icon:'🚀', cost:900, voucherKey:'strategic', desc:'10-pull system reserved for the next economy pass.',
      odds:{ common:40, rare:40, elite:16, legendary:4 }, disabled:true
    }
  };

  var LANE_LABELS = ['LEFT','CENTER','RIGHT'];

  function $(id) { return document.getElementById(id); }
  function safe(label, fn) { try { return fn(); } catch (e) { try { console.warn('[Officers]', label, e); } catch (_) {} } }
  function getState() { return (typeof G !== 'undefined' && G.state) ? G.state : null; }
  function getMeta() { if (typeof G === 'undefined') return null; if (!G.meta) G.meta = {}; return G.meta; }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); else console.log('[Officers]', msg); }
  function buzz(kind) { try { if (typeof haptic === 'function') haptic(kind || 'light'); } catch (_) {} }
  function saveMetaNow() { var m = getMeta(); if (m && typeof saveMeta === 'function') saveMeta(m); }
  function saveAll() { safe('save', function () { saveMetaNow(); if (typeof saveGame === 'function') saveGame(); }); }
  function officerById(id) { return OFFICER_DEFS.find(function (o) { return o.id === id; }) || null; }
  function rarityInfo(r) { return RARITY[r] || RARITY.common; }
  function rank() { var m = getMeta(); return (m && (m.prestige || 0)) || 0; }
  function confirmAction(msg) {
    try { return typeof window.confirm === 'function' ? window.confirm(msg) : true; }
    catch (_) { return true; }
  }
  function firstOpenLane() {
    var cs = ensureStaffMeta();
    if (!cs || !cs.assignments) return null;
    for (var i = 0; i < 3; i++) if (!cs.assignments[i]) return i;
    return null;
  }
  function markRecentOfficer(id, source, extra) {
    var cs = ensureStaffMeta();
    if (!cs) return;
    cs.lastRecruit = Object.assign({ id:id, source:source || 'recruitment', at:Date.now() }, extra || {});
  }
  function recentOfficerTag(id) {
    var cs = ensureStaffMeta();
    if (!cs || !cs.lastRecruit || cs.lastRecruit.id !== id) return '';
    if (Date.now() - (cs.lastRecruit.at || 0) > 1000 * 60 * 20) return '';
    return '<span class="lsc-new-tag">NEW</span>';
  }
  function tryQuickAssign(id) {
    var lane = firstOpenLane();
    var def = officerById(id);
    if (lane === null || !def) return;
    if (confirmAction('Assign ' + def.name + ' to ' + LANE_LABELS[lane] + ' lane now?')) {
      assignOfficer(id, lane);
      window.__lscStaffTab = 'assign';
    }
  }

  function ensureStaffMeta() {
    var m = getMeta();
    if (!m) return null;
    if (!m.commandStaff) m.commandStaff = {};
    var cs = m.commandStaff;
    if (!cs.unlocked) cs.unlocked = {};
    if (!cs.assignments) cs.assignments = { 0:null, 1:null, 2:null };
    if (!cs.shards) cs.shards = {};
    if (!cs.xp) cs.xp = {};
    if (!cs.draws) cs.draws = { total:0, pity:0 };
    if (!m.recruitmentVouchers) m.recruitmentVouchers = { field:0, command:0, strategic:0 };
    if (!m.officerShards) m.officerShards = { generic:0 };
    if (typeof m.gems !== 'number') m.gems = 0;

    // Starter officer: gives the system immediate value without purchase.
    if (!cs.unlocked.mason) cs.unlocked.mason = { unlockedAt: Date.now(), source:'starter' };
    return cs;
  }

  function grantStarterFieldVoucher() {
    var m = getMeta(), cs = ensureStaffMeta();
    if (!m || !cs) return false;
    if (cs.starterFieldVoucherGranted) return false;
    if (!m.recruitmentVouchers) m.recruitmentVouchers = { field:0, command:0, strategic:0 };
    m.recruitmentVouchers.field = (m.recruitmentVouchers.field || 0) + 1;
    cs.starterFieldVoucherGranted = true;
    cs.starterFieldVoucherAt = Date.now();
    saveAll();
    toast('Starter Field Voucher issued');
    return true;
  }

  function isUnlocked(id) { var cs = ensureStaffMeta(); return !!(cs && cs.unlocked && cs.unlocked[id]); }
  function ownedCount() { var cs = ensureStaffMeta(); return cs ? Object.keys(cs.unlocked || {}).length : 0; }
  function assignment(lane) { var cs = ensureStaffMeta(); return cs && cs.assignments ? cs.assignments[lane] || null : null; }
  function assignedLaneOf(id) { var cs = ensureStaffMeta(); if (!cs || !cs.assignments) return null; for (var k in cs.assignments) if (cs.assignments[k] === id) return parseInt(k, 10); return null; }

  function unlockOfficer(id, source) {
    var cs = ensureStaffMeta();
    if (!cs) return false;
    if (cs.unlocked[id]) return false;
    cs.unlocked[id] = { unlockedAt: Date.now(), source: source || 'recruitment' };
    saveAll();
    return true;
  }

  function addOfficerShards(id, n) {
    var cs = ensureStaffMeta();
    if (!cs) return;
    cs.shards[id] = (cs.shards[id] || 0) + n;
    var def = officerById(id), need = def ? rarityInfo(def.rarity).shardUnlock : 999;
    if (!isUnlocked(id) && cs.shards[id] >= need) {
      cs.shards[id] -= need;
      unlockOfficer(id, 'shards');
      toast('✓ Officer recruited from shards: ' + def.name);
    }
  }

  function buyOfficer(id) {
    var m = getMeta(), cs = ensureStaffMeta(), def = officerById(id);
    if (!m || !cs || !def) return;
    if (isUnlocked(id)) { toast(def.name + ' already recruited'); return; }
    var cost = rarityInfo(def.rarity).cost;
    if ((m.gems || 0) < cost) { toast('Need ' + (cost - (m.gems || 0)) + ' more Gems'); return; }
    if (!confirmAction('Recruit ' + def.name + ' for ' + cost + ' Gems?')) return;
    m.gems -= cost;
    unlockOfficer(id, 'gems');
    markRecentOfficer(id, 'gems');
    buzz('success');
    toast('✓ Recruited ' + def.name);
    tryQuickAssign(id);
    renderStaffModal();
    ensureStaffButton();
    if (typeof updateHUD === 'function') updateHUD();
  }

  function assignOfficer(id, lane) {
    var cs = ensureStaffMeta();
    if (!cs || !isUnlocked(id)) return;
    Object.keys(cs.assignments).forEach(function (k) { if (cs.assignments[k] === id) cs.assignments[k] = null; });
    cs.assignments[lane] = id;
    saveAll();
    buzz('light');
    var def = officerById(id);
    toast((def ? def.name : 'Officer') + ' assigned to ' + LANE_LABELS[lane]);
    renderStaffModal();
    ensureStaffButton();
  }

  function unassignLane(lane) {
    var cs = ensureStaffMeta(); if (!cs) return;
    cs.assignments[lane] = null;
    saveAll();
    renderStaffModal();
    ensureStaffButton();
  }

  function assignedBonus(lane) {
    var id = assignment(lane), def = officerById(id);
    if (!def || !isUnlocked(def.id)) return { cost:0, troopHp:0, heal:0, repair:0, waveCredits:0, slow:0, boss:0, orbital:0, legendary:false };
    var b = Object.assign({ cost:0, troopHp:0, heal:0, repair:0, waveCredits:0, slow:0, boss:0, orbital:0, legendary:false }, def.bonus || {});
    // Rank authority: legendary officers work early, but full power unlocks gradually.
    if (def.rarity === 'legendary') {
      var r = rank();
      var scale = r >= 15 ? 1 : r >= 10 ? 0.85 : r >= 5 ? 0.65 : 0.45;
      Object.keys(b).forEach(function (k) { if (typeof b[k] === 'number') b[k] = b[k] * scale; });
      b.legendary = true;
    }
    return b;
  }

  function fmtPct(v) { return Math.round((v || 0) * 100); }
  function bonusSummaryFromBonus(b) {
    var parts = [];
    if (!b) b = {};
    if (b.cost) parts.push('Cost -' + fmtPct(b.cost) + '%');
    if (b.troopHp) parts.push('HP +' + fmtPct(b.troopHp) + '%');
    if (b.waveCredits) parts.push('+' + Math.floor(b.waveCredits) + ' cr/wave');
    if (b.repair) parts.push('Repair +' + Math.floor(b.repair));
    if (b.heal) parts.push('Heal +' + Math.floor(b.heal));
    if (b.slow) parts.push('Disrupt +' + fmtPct(b.slow) + '%');
    if (b.boss) parts.push('Boss +' + fmtPct(b.boss) + '%');
    if (b.orbital) parts.push('Orbital +' + fmtPct(b.orbital) + '%');
    return parts.length ? parts.join(' · ') : 'Lane support';
  }
  function rawOfficerBonus(def) {
    return Object.assign({ cost:0, troopHp:0, heal:0, repair:0, waveCredits:0, slow:0, boss:0, orbital:0, legendary:false }, (def && def.bonus) || {});
  }
  function gemBalance() {
    var m = getMeta() || {};
    return Math.max(0, Math.floor(m.gems || 0));
  }
  function gemWalletHtml(context) {
    return '<div class="lsc-gem-wallet"><span>💎 Available Gems</span><b>' + gemBalance() + '</b>' + (context ? '<em>' + context + '</em>' : '') + '</div>';
  }
  function officerCost(def) { return rarityInfo(def.rarity).cost || 0; }
  function purchaseButtonHtml(def, extraClass) {
    var cost = officerCost(def), shortage = Math.max(0, cost - gemBalance());
    if (shortage > 0) return '<button class="lsc-staff-btn2 dim" disabled>Need ' + shortage + ' more 💎</button>';
    return '<button class="lsc-staff-btn2 gold purchase" data-buy-officer="' + def.id + '">Purchase · ' + cost + ' 💎</button>';
  }
  function officerGemStatus(def) {
    var cost = officerCost(def), shortage = Math.max(0, cost - gemBalance());
    return shortage > 0 ? 'Need ' + shortage + ' more Gems' : 'Affordable now';
  }
  function officerAuthorityText(def) {
    if (!def || def.rarity !== 'legendary') return '';
    var r = rank();
    var pct = r >= 15 ? 100 : r >= 10 ? 85 : r >= 5 ? 65 : 45;
    var next = r >= 15 ? 'Mastery active' : r >= 10 ? 'Rank 15 unlocks mastery' : r >= 5 ? 'Rank 10 increases authority' : 'Rank 5 increases authority';
    return 'Legendary authority: ' + pct + '% · ' + next;
  }
  function laneBonusSummaryHtml() {
    var html = '<div class="lsc-bonus-panel"><div class="lsc-bonus-title">ACTIVE LANE BONUSES</div>';
    [0,1,2].forEach(function (lane) {
      var id = assignment(lane), def = officerById(id);
      if (def && isUnlocked(def.id)) {
        var info = rarityInfo(def.rarity), b = assignedBonus(lane);
        html += '<div class="lsc-bonus-row"><span style="color:' + info.color + '">' + LANE_LABELS[lane] + '</span><b>' + def.name + '</b><em>' + bonusSummaryFromBonus(b) + '</em></div>';
      } else {
        html += '<div class="lsc-bonus-row empty"><span>' + LANE_LABELS[lane] + '</span><b>Open slot</b><em>No officer assigned</em></div>';
      }
    });
    return html + '</div>';
  }

  function installStyles() {
    if ($('lsc-officer-style')) return;
    var css = document.createElement('style');
    css.id = 'lsc-officer-style';
    css.textContent = `
      #lsc-staff-btn{position:fixed;z-index:42;right:10px;top:calc(env(safe-area-inset-top,0px) + 116px);padding:8px 10px;border-radius:12px;border:1px solid rgba(34,212,255,.45);background:rgba(0,0,0,.58);color:var(--cyan);font-family:'Rajdhani',sans-serif;font-weight:900;font-size:12px;letter-spacing:.4px;box-shadow:0 8px 24px rgba(0,0,0,.32);-webkit-appearance:none}
      #lsc-staff-modal{position:fixed;inset:0;z-index:161;display:none;align-items:center;justify-content:center;padding:14px;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
      #lsc-staff-card{width:min(460px,95vw);max-height:86vh;overflow:auto;border:1px solid rgba(34,212,255,.38);border-radius:18px;background:linear-gradient(180deg,rgba(10,19,34,.98),rgba(3,7,13,.96));box-shadow:0 22px 70px rgba(0,0,0,.66),inset 0 0 28px rgba(34,212,255,.05);padding:15px;color:white;-webkit-overflow-scrolling:touch}
      .lsc-staff-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0}.lsc-staff-tab{padding:8px 3px;border-radius:10px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);color:rgba(210,225,235,.72);font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:.8px;-webkit-appearance:none}.lsc-staff-tab.active{border-color:var(--cyan);background:rgba(34,212,255,.12);color:var(--cyan)}
      .lsc-staff-row{display:flex;align-items:center;gap:8px;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);margin-bottom:8px}.lsc-officer-icon{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:22px;background:rgba(0,0,0,.26);border:1px solid rgba(255,255,255,.08);flex-shrink:0}.lsc-officer-name{font-family:'Rajdhani',sans-serif;font-weight:900;font-size:15px;line-height:1.05}.lsc-officer-sub{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--muted);line-height:1.35;margin-top:2px}.lsc-officer-rarity{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:1px;text-transform:uppercase}.lsc-staff-btn2{padding:7px 9px;border-radius:9px;border:1px solid rgba(34,212,255,.45);background:rgba(34,212,255,.12);color:var(--cyan);font-family:'Rajdhani',sans-serif;font-weight:900;font-size:12px;-webkit-appearance:none}.lsc-staff-btn2.gold{border-color:rgba(212,160,40,.55);background:rgba(212,160,40,.13);color:#ffd35a}.lsc-staff-btn2.purchase{min-width:92px;box-shadow:0 0 12px rgba(255,211,90,.10)}.lsc-staff-btn2.dim{border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.035);color:rgba(210,220,230,.64)}.lsc-staff-btn2:disabled{opacity:.48;filter:saturate(.55);pointer-events:none}.lsc-staff-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lsc-lane-card{border-radius:13px;border:1px solid rgba(34,212,255,.18);background:rgba(34,212,255,.055);padding:11px;margin-bottom:8px}.lsc-lane-title{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--cyan);letter-spacing:1.2px}.lsc-odds{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:8px}.lsc-odds div{border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:5px 3px;text-align:center;font-family:'Share Tech Mono',monospace;font-size:7px;color:rgba(220,230,235,.72)}.lsc-staff-note{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--muted);line-height:1.55;margin-bottom:10px}.lsc-staff-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0 10px}.lsc-staff-mini div{border:1px solid rgba(34,212,255,.18);border-radius:10px;background:rgba(34,212,255,.05);padding:6px;text-align:center;font-family:'Share Tech Mono',monospace;font-size:7px;color:rgba(210,230,240,.82)}
      .lsc-gem-wallet{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid rgba(255,211,90,.28);border-radius:11px;background:rgba(255,211,90,.06);padding:7px 9px;margin:7px 0 8px;font-family:'Share Tech Mono',monospace;font-size:8px;color:#ffd35a}.lsc-gem-wallet b{font-family:'Rajdhani',sans-serif;font-size:17px;color:#fff;line-height:1}.lsc-gem-wallet em{font-style:normal;color:rgba(255,211,90,.72);font-size:7.5px}.lsc-detail-card{border:1px solid rgba(34,212,255,.34);border-radius:14px;background:linear-gradient(180deg,rgba(34,212,255,.10),rgba(255,255,255,.035));padding:10px;margin:0 0 10px;box-shadow:inset 0 0 22px rgba(34,212,255,.045)}.lsc-detail-head{display:flex;align-items:center;gap:8px}.lsc-detail-title{font-family:'Rajdhani',sans-serif;font-weight:900;font-size:18px;line-height:1}.lsc-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.lsc-detail-chip{border:1px solid rgba(255,255,255,.09);border-radius:9px;background:rgba(0,0,0,.18);padding:6px;font-family:'Share Tech Mono',monospace;font-size:7.5px;color:rgba(220,230,235,.78);line-height:1.35}.lsc-detail-chip b{display:block;font-family:'Rajdhani',sans-serif;font-size:12px;color:#fff;margin-bottom:1px}.lsc-detail-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.lsc-new-tag{display:inline-block;margin-left:5px;padding:1px 5px;border-radius:999px;background:rgba(24,240,106,.15);border:1px solid rgba(24,240,106,.38);color:#18f06a;font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:.8px;vertical-align:middle}.lsc-recruit-result{border:1px solid rgba(24,240,106,.28);border-radius:11px;background:rgba(24,240,106,.055);padding:8px;margin:6px 0 10px;font-family:'Share Tech Mono',monospace;font-size:8px;color:#9fe8b5;line-height:1.45}.lsc-bonus-panel{border:1px solid rgba(34,212,255,.16);border-radius:12px;background:rgba(34,212,255,.045);padding:8px;margin:8px 0 10px}.lsc-bonus-title{font-family:'Share Tech Mono',monospace;font-size:7.5px;letter-spacing:1.2px;color:var(--cyan);margin-bottom:5px}.lsc-bonus-row{display:grid;grid-template-columns:48px 1fr;gap:3px 6px;align-items:center;padding:4px 0;border-top:1px solid rgba(255,255,255,.045)}.lsc-bonus-row:first-of-type{border-top:0}.lsc-bonus-row span{font-family:'Share Tech Mono',monospace;font-size:7.5px;color:var(--cyan);letter-spacing:.8px}.lsc-bonus-row b{font-family:'Rajdhani',sans-serif;font-size:12px;color:#eaf6ff}.lsc-bonus-row em{grid-column:2;font-family:'Share Tech Mono',monospace;font-size:7.5px;color:var(--muted);font-style:normal}.lsc-bonus-row.empty{opacity:.62}
    `;
    document.head.appendChild(css);
  }

  function ensureStaffButton() {
    installStyles();
    var btn = $('lsc-staff-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'lsc-staff-btn';
      btn.type = 'button';
      btn.addEventListener('click', showStaffModal);
      document.body.appendChild(btn);
    }
    var cs = ensureStaffMeta();
    var assigns = cs && cs.assignments ? Object.keys(cs.assignments).filter(function (k) { return !!cs.assignments[k]; }).length : 0;
    btn.textContent = '👥 STAFF ' + assigns + '/3';
    btn.title = ownedCount() + ' officers recruited · ' + assigns + '/3 assigned';
  }

  function createModal() {
    if ($('lsc-staff-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'lsc-staff-modal';
    modal.innerHTML = '<div id="lsc-staff-card"><div style="display:flex;align-items:center;gap:10px"><div style="font-size:30px">👥</div><div style="flex:1"><div style="font-family:Share Tech Mono,monospace;font-size:9px;letter-spacing:2px;color:var(--cyan);text-transform:uppercase">Command Staff</div><div style="font-family:Rajdhani,sans-serif;font-weight:900;font-size:26px;line-height:1">Officers</div><div id="lsc-staff-summary" style="font-family:Share Tech Mono,monospace;font-size:8px;color:var(--muted);margin-top:3px"></div></div><button id="lsc-staff-close" style="font-size:26px;border:0;background:transparent;color:var(--cyan);-webkit-appearance:none">×</button></div><div class="lsc-staff-tabs"><button class="lsc-staff-tab active" data-staff-tab="roster">ROSTER</button><button class="lsc-staff-tab" data-staff-tab="assign">ASSIGN</button><button class="lsc-staff-tab" data-staff-tab="recruit">RECRUIT</button></div><div id="lsc-staff-body"></div></div>';
    document.body.appendChild(modal);
    $('lsc-staff-close').addEventListener('click', function () { $('lsc-staff-modal').style.display = 'none'; });
    modal.querySelectorAll('[data-staff-tab]').forEach(function (b) { b.addEventListener('click', function () { window.__lscStaffTab = b.dataset.staffTab; renderStaffModal(); }); });
  }

  function showStaffModal() {
    installStyles();
    createModal();
    ensureStaffMeta();
    grantStarterFieldVoucher();
    window.__lscStaffTab = window.__lscStaffTab || 'recruit';
    renderStaffModal();
    $('lsc-staff-modal').style.display = 'flex';
    try { localStorage.setItem(STAFF_KEY, '1'); } catch (_) {}
  }

  function headerSummary() {
    var m = getMeta(), cs = ensureStaffMeta();
    if (!m || !cs) return '';
    var assigns = Object.keys(cs.assignments || {}).filter(function (k) { return !!cs.assignments[k]; }).length;
    var vouchers = m.recruitmentVouchers || { field:0, command:0, strategic:0 };
    var voucherCount = (vouchers.field || 0) + (vouchers.command || 0) + (vouchers.strategic || 0);
    return ownedCount() + '/' + OFFICER_DEFS.length + ' officers · ' + assigns + '/3 assigned · ' + (m.gems || 0) + ' Gems' + (voucherCount ? ' · ' + voucherCount + ' vouchers' : '');
  }

  function renderStaffModal() {
    createModal();
    var body = $('lsc-staff-body'), summary = $('lsc-staff-summary');
    if (!body) return;
    ensureStaffMeta();
    if (summary) summary.textContent = headerSummary();
    var tab = window.__lscStaffTab || 'roster';
    document.querySelectorAll('.lsc-staff-tab').forEach(function (b) { b.classList.toggle('active', b.dataset.staffTab === tab); });
    if (tab === 'assign') renderAssignments(body);
    else if (tab === 'recruit') renderRecruitment(body);
    else renderRoster(body);
    renderOfficerDetail(body);
  }

  function renderOfficerDetail(body) {
    var id = window.__lscOfficerDetail;
    var def = officerById(id);
    if (!body || !def) return;
    var info = rarityInfo(def.rarity), owned = isUnlocked(def.id), lane = assignedLaneOf(def.id);
    var bonus = (owned && lane !== null) ? assignedBonus(lane) : rawOfficerBonus(def);
    var auth = officerAuthorityText(def);
    var m = getMeta() || {}, cost = info.cost, shortage = Math.max(0, cost - (m.gems || 0));
    var actions = '<div class="lsc-detail-actions">';
    if (!owned) {
      actions += purchaseButtonHtml(def);
    } else if (lane === null) {
      actions += [0,1,2].map(function (l) { return '<button class="lsc-staff-btn2" data-assign="' + def.id + '" data-lane="' + l + '">Assign ' + LANE_LABELS[l] + '</button>'; }).join('');
    } else {
      actions += '<button class="lsc-staff-btn2 gold" data-tab-assign="1">Assigned: ' + LANE_LABELS[lane] + '</button><button class="lsc-staff-btn2 dim" data-unassign-lane="' + lane + '">Clear Lane</button>';
    }
    actions += '</div>';
    var card = document.createElement('div');
    card.className = 'lsc-detail-card';
    card.innerHTML = '<div class="lsc-detail-head"><div class="lsc-officer-icon" style="color:' + info.color + ';border-color:' + info.color + '55">' + def.icon + '</div><div style="flex:1"><div class="lsc-officer-rarity" style="color:' + info.color + '">' + info.label + (owned ? ' · RECRUITED' : ' · NOT RECRUITED') + recentOfficerTag(def.id) + '</div><div class="lsc-detail-title" style="color:' + info.color + '">' + def.name + '</div><div class="lsc-officer-sub">' + def.title + ' · ' + def.laneStyle + '</div></div><button class="lsc-staff-btn2 dim" data-close-detail="1">Close</button></div>' +
      '<div class="lsc-detail-grid"><div class="lsc-detail-chip"><b>Lane Bonus</b>' + bonusSummaryFromBonus(bonus) + '</div><div class="lsc-detail-chip"><b>Auto Role</b>' + ((def.units || []).join(' → ') || 'support') + '</div><div class="lsc-detail-chip"><b>Event Specialty</b>' + (def.event || 'General operation support') + '</div><div class="lsc-detail-chip"><b>Status</b>' + (lane !== null ? 'Assigned to ' + LANE_LABELS[lane] : (owned ? 'Ready to assign' : officerGemStatus(def))) + '</div></div>' + (!owned ? gemWalletHtml('Cost: ' + cost + ' 💎') : '') + (auth ? '<div class="lsc-officer-sub" style="margin-top:8px;color:' + info.color + '">' + auth + '</div>' : '') + actions;
    body.insertBefore(card, body.firstChild);
    var close = card.querySelector('[data-close-detail]');
    if (close) close.addEventListener('click', function () { window.__lscOfficerDetail = null; renderStaffModal(); });
    wireOfficerButtons(card);
  }

  function officerRow(def, mode) {
    var owned = isUnlocked(def.id), info = rarityInfo(def.rarity), m = getMeta(), cs = ensureStaffMeta();
    var lane = assignedLaneOf(def.id);
    var shards = (cs.shards && cs.shards[def.id]) || 0;
    var need = info.shardUnlock;
    var powerNote = def.rarity === 'legendary' ? ' · authority scales with Rank ' + rank() : '';
    var action = '';

    if (mode === 'assign') {
      if (owned) {
        action = '<div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">' + [0,1,2].map(function (l) {
          return '<button class="lsc-staff-btn2 ' + (lane === l ? 'gold' : '') + '" data-assign="' + def.id + '" data-lane="' + l + '">' + LANE_LABELS[l][0] + '</button>';
        }).join('') + '</div>';
      }
    } else if (!owned) {
      var gems = (m && m.gems) || 0;
      var shortage = Math.max(0, info.cost - gems);
      action = purchaseButtonHtml(def);
    } else {
      action = lane !== null
        ? '<button class="lsc-staff-btn2 gold" data-tab-assign="1">' + LANE_LABELS[lane] + '</button>'
        : '<button class="lsc-staff-btn2" data-tab-assign="1">Assign</button>';
    }

    var ownedStyle = owned ? info.color + '66' : 'rgba(255,255,255,.09)';
    var laneText = lane !== null ? ' · ' + LANE_LABELS[lane] + ' lane' : '';
    var actionStack = '<div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end;flex-shrink:0">' + action + '<button class="lsc-staff-btn2 dim" data-officer-detail="' + def.id + '">Info</button></div>';
    return '<div class="lsc-staff-row" style="border-color:' + ownedStyle + ';opacity:' + (owned ? '1' : '.74') + '">' +
      '<div class="lsc-officer-icon" style="border-color:' + info.color + '44;color:' + info.color + '">' + def.icon + '</div>' +
      '<div style="flex:1;min-width:0"><div class="lsc-officer-rarity" style="color:' + info.color + '">' + info.label + (owned ? ' · RECRUITED' + laneText : ' · ' + shards + '/' + need + ' SHARDS') + recentOfficerTag(def.id) + '</div><div class="lsc-officer-name" style="color:' + (owned ? info.color : '#dfe8ee') + '">' + def.name + '</div><div class="lsc-officer-sub">' + def.title + ' · ' + def.short + powerNote + '</div></div>' +
      actionStack + '</div>';
  }

  function wireOfficerButtons(root) {
    root.querySelectorAll('[data-buy-officer]').forEach(function (b) { b.addEventListener('click', function () { buyOfficer(b.dataset.buyOfficer); }); });
    root.querySelectorAll('[data-tab-assign]').forEach(function (b) { b.addEventListener('click', function () { window.__lscStaffTab = 'assign'; renderStaffModal(); }); });
    root.querySelectorAll('[data-assign]').forEach(function (b) { b.addEventListener('click', function () { assignOfficer(b.dataset.assign, parseInt(b.dataset.lane, 10)); }); });
    root.querySelectorAll('[data-unassign-lane]').forEach(function (b) { b.addEventListener('click', function () { unassignLane(parseInt(b.dataset.unassignLane, 10)); }); });
    root.querySelectorAll('[data-open-crate]').forEach(function (b) { b.addEventListener('click', function () { openCrate(b.dataset.openCrate); }); });
    root.querySelectorAll('[data-officer-detail]').forEach(function (b) { b.addEventListener('click', function () { window.__lscOfficerDetail = b.dataset.officerDetail; renderStaffModal(); }); });
  }

  function renderRoster(body) {
    var ordered = OFFICER_DEFS.slice().sort(function (a, b) {
      var aOwned = isUnlocked(a.id) ? 0 : 1, bOwned = isUnlocked(b.id) ? 0 : 1;
      if (aOwned !== bOwned) return aOwned - bOwned;
      var aAssigned = assignedLaneOf(a.id) !== null ? 0 : 1, bAssigned = assignedLaneOf(b.id) !== null ? 0 : 1;
      if (aAssigned !== bAssigned) return aAssigned - bAssigned;
      return rarityInfo(a.rarity).sort - rarityInfo(b.rarity).sort || a.name.localeCompare(b.name);
    });
    var m = getMeta(), cs = ensureStaffMeta();
    var assigns = Object.keys((cs && cs.assignments) || {}).filter(function (k) { return !!cs.assignments[k]; }).length;
    body.innerHTML = '<div class="lsc-staff-note">Officers are permanent. Assign one per lane for passive bonuses and light auto-management. Gems are earned only in this build.</div>' +
      '<div class="lsc-staff-mini"><div>OWNED<br><b>' + ownedCount() + '/' + OFFICER_DEFS.length + '</b></div><div>ASSIGNED<br><b>' + assigns + '/3</b></div><div>AVAILABLE GEMS<br><b>' + gemBalance() + '</b></div></div>' +
      ordered.map(function (d) { return officerRow(d, 'roster'); }).join('');
    wireOfficerButtons(body);
  }

  function renderAssignments(body) {
    var cs = ensureStaffMeta();
    var html = '<div class="lsc-staff-note">Assigned officers auto-fill their lane once at wave start when credits and slots allow. Legendary officers can be owned early; full authority unlocks with rank.</div>' + laneBonusSummaryHtml();
    [0,1,2].forEach(function (lane) {
      var id = assignment(lane), def = officerById(id), bonus = assignedBonus(lane);
      html += '<div class="lsc-lane-card"><div class="lsc-lane-title">' + LANE_LABELS[lane] + ' LANE</div>';
      if (def) {
        var info = rarityInfo(def.rarity);
        html += '<div style="display:flex;align-items:center;gap:8px;margin-top:8px"><div class="lsc-officer-icon" style="color:' + info.color + '">' + def.icon + '</div><div style="flex:1"><div class="lsc-officer-rarity" style="color:' + info.color + '">' + info.label + '</div><div class="lsc-officer-name">' + def.name + '</div><div class="lsc-officer-sub">Cost -' + Math.round((bonus.cost||0)*100) + '% · HP +' + Math.round((bonus.troopHp||0)*100) + '% · auto ' + (def.units && def.units[0] || 'rifle') + '</div></div><button class="lsc-staff-btn2 dim" data-unassign-lane="' + lane + '">Clear</button></div>';
      } else {
        html += '<div class="lsc-officer-sub" style="margin-top:8px">No officer assigned.</div>';
      }
      html += '</div>';
    });
    var owned = OFFICER_DEFS.filter(function (d) { return isUnlocked(d.id); });
    html += '<div style="margin-top:10px;font-family:Share Tech Mono,monospace;font-size:8px;color:var(--muted);letter-spacing:1px">ASSIGN RECRUITED OFFICERS</div>';
    html += owned.length ? owned.map(function (d) { return officerRow(d, 'assign'); }).join('') : '<div class="lsc-staff-note">Recruit an officer first.</div>';
    body.innerHTML = html;
    wireOfficerButtons(body);
  }

  function renderRecruitment(body) {
    var m = getMeta(), cs = ensureStaffMeta();
    var featured = featuredOfficers();
    var vouchers = (m && m.recruitmentVouchers) || { field:0, command:0, strategic:0 };
    var html = '<div class="lsc-staff-note">Recruit officers with earned Gems or Field/Command vouchers. A starter Field Voucher is issued once so every player can try recruitment. Paid Gem packs are not enabled.</div>' + gemWalletHtml('Recruitment currency');
    html += '<div class="lsc-staff-mini"><div>FIELD VOUCHERS<br><b>' + (vouchers.field || 0) + '</b></div><div>COMMAND VOUCHERS<br><b>' + (vouchers.command || 0) + '</b></div><div>OWNED<br><b>' + ownedCount() + '/' + OFFICER_DEFS.length + '</b></div></div>';
    if (cs && cs.lastRecruit && Date.now() - (cs.lastRecruit.at || 0) < 1000 * 60 * 20) {
      var last = officerById(cs.lastRecruit.id);
      if (last) html += '<div class="lsc-recruit-result">LATEST RECRUITMENT<br><b>' + last.name + '</b> · ' + rarityInfo(last.rarity).label + ' · ' + (cs.lastRecruit.source || 'recruitment') + '</div>';
    }
    html += '<div style="font-family:Share Tech Mono,monospace;font-size:8px;color:var(--cyan);letter-spacing:1.2px;margin:6px 0">RECRUITMENT BOARD</div>';
    html += featured.map(function (d) { return officerRow(d, 'roster'); }).join('');
    var pity = cs && cs.draws ? (cs.draws.pity || 0) : 0;
    html += '<div style="font-family:Share Tech Mono,monospace;font-size:8px;color:var(--cyan);letter-spacing:1.2px;margin:12px 0 6px">RECRUITMENT CRATES</div>';
    html += '<div class="lsc-staff-note" style="margin-bottom:6px">Legendary safety: ' + pity + '/50 pulls since last Legendary.</div>';
    Object.keys(CRATES).forEach(function (key) {
      var c = CRATES[key], vouchers = (m.recruitmentVouchers && m.recruitmentVouchers[c.voucherKey]) || 0;
      var canVoucher = vouchers > 0 && !c.disabled, canGem = (m.gems || 0) >= c.cost && !c.disabled;
      var gemLabel = c.disabled ? 'Soon' : (canGem ? ('Open · ' + c.cost + ' 💎') : ('Need ' + Math.max(0, c.cost - (m.gems || 0)) + ' more 💎'));
      var voucherLabel = canVoucher ? 'Open Voucher' : ('Voucher ' + vouchers);
      html += '<div class="lsc-staff-row"><div class="lsc-officer-icon">' + c.icon + '</div><div style="flex:1"><div class="lsc-officer-name">' + c.label + '</div><div class="lsc-officer-sub">' + c.desc + '</div><div class="lsc-odds">' + Object.keys(c.odds).map(function (r) { return '<div><span style="color:' + rarityInfo(r).color + '">' + rarityInfo(r).label[0] + '</span><br>' + c.odds[r] + '%</div>'; }).join('') + '</div></div><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end"><button class="lsc-staff-btn2 ' + (canVoucher ? 'gold' : 'dim') + '" ' + (canVoucher ? 'data-open-crate="' + key + '"' : 'disabled') + '>' + voucherLabel + '</button><button class="lsc-staff-btn2 ' + (canGem ? 'gold' : 'dim') + '" ' + (canGem ? 'data-open-crate="' + key + '"' : 'disabled') + '>' + gemLabel + '</button></div></div>';
    });
    body.innerHTML = html;
    wireOfficerButtons(body);
  }

  function featuredOfficers() {
    // Deterministic daily rotation: common + rare + elite/legendary slot.
    var day = Math.floor(Date.now() / 86400000);
    var by = function (r) { return OFFICER_DEFS.filter(function (o) { return o.rarity === r; }); };
    var common = by('common'), rare = by('rare'), elite = by('elite'), leg = by('legendary');
    return [common[day % common.length], rare[(day + 1) % rare.length], (day % 3 === 0 ? leg[(day + 2) % leg.length] : elite[(day + 2) % elite.length])];
  }

  function pickRarity(odds) {
    var roll = Math.random() * 100, acc = 0;
    var order = ['common','rare','elite','legendary'];
    for (var i = 0; i < order.length; i++) { acc += odds[order[i]] || 0; if (roll <= acc) return order[i]; }
    return 'common';
  }

  function openCrate(type) {
    var c = CRATES[type], m = getMeta(), cs = ensureStaffMeta();
    if (!c || c.disabled || !m || !cs) return;
    var hasVoucher = !!(m.recruitmentVouchers && (m.recruitmentVouchers[c.voucherKey] || 0) > 0);
    if (!hasVoucher && (m.gems || 0) < c.cost) {
      toast('Need more Gems or a crate voucher');
      return;
    }
    if (!confirmAction('Open ' + c.label + (hasVoucher ? ' using 1 voucher?' : ' for ' + c.cost + ' Gems?') + '\n\nOdds are shown on the crate card before opening.')) return;
    var usedVoucher = false;
    if (hasVoucher) {
      m.recruitmentVouchers[c.voucherKey]--;
      usedVoucher = true;
    } else {
      m.gems -= c.cost;
    }
    var rarity = pickRarity(c.odds);
    // Pity protection: a Legendary is guaranteed after 50 non-Legendary crate pulls.
    if ((cs.draws.pity || 0) >= 49) rarity = 'legendary';
    var pool = OFFICER_DEFS.filter(function (o) { return o.rarity === rarity; });
    var def = pool[Math.floor(Math.random() * pool.length)] || OFFICER_DEFS[0];
    cs.draws.total = (cs.draws.total || 0) + 1;
    cs.draws.pity = (def.rarity === 'legendary') ? 0 : ((cs.draws.pity || 0) + 1);
    if (isUnlocked(def.id)) {
      var shards = def.rarity === 'legendary' ? 30 : def.rarity === 'elite' ? 20 : def.rarity === 'rare' ? 12 : 8;
      addOfficerShards(def.id, shards);
      markRecentOfficer(def.id, 'duplicate +' + shards + ' shards', { duplicate:true, shards:shards });
      toast(c.label + ': duplicate ' + def.name + ' → +' + shards + ' shards');
    } else {
      unlockOfficer(def.id, usedVoucher ? 'voucher' : 'crate');
      markRecentOfficer(def.id, usedVoucher ? 'voucher' : 'crate');
      toast(c.label + ': recruited ' + def.name + ' (' + rarityInfo(def.rarity).label + ')');
      tryQuickAssign(def.id);
    }
    buzz('success');
    saveAll();
    renderStaffModal();
    ensureStaffButton();
    if (typeof updateHUD === 'function') updateHUD();
  }

  function tryOfficerAutoManage() {
    var s = getState(), cs = ensureStaffMeta();
    if (!s || !s.started || !cs || !cs.assignments || typeof deployUnit !== 'function') return;
    if (s._officerAutoWave === s.wave) return;
    s._officerAutoWave = s.wave;
    var oldLane = s.selectedLane;
    [0,1,2].forEach(function (lane) {
      var id = assignment(lane), def = officerById(id);
      if (!def || !isUnlocked(def.id)) return;
      var slots = (typeof UNLOCKS !== 'undefined' && UNLOCKS.troopSlots) ? UNLOCKS.troopSlots(s.prestige) : 5;
      if (typeof laneTroopCount === 'function' && laneTroopCount(lane) >= slots) return;
      var unit = chooseAutoUnit(def, s);
      if (!unit) return;
      s.selectedLane = lane;
      deployUnit(unit);
    });
    s.selectedLane = oldLane;
  }

  function chooseAutoUnit(def, s) {
    if (!def.units || typeof UNIT_DEFS === 'undefined') return null;
    for (var i = 0; i < def.units.length; i++) {
      var id = def.units[i];
      var u = UNIT_DEFS.find(function (x) { return x.id === id; });
      if (!u) continue;
      if (typeof _isUnitUnlocked === 'function' && !_isUnitUnlocked(s, id)) continue;
      if (typeof troopCost === 'function' && s.credits < troopCost(u)) continue;
      return id;
    }
    return null;
  }

  function installGameplayHooks() {
    safe('hooks', function () {
      if (typeof troopCost === 'function' && !troopCost.__officers) {
        var oldTroopCost = troopCost;
        troopCost = function (def) {
          var c = oldTroopCost.apply(this, arguments), s = getState();
          if (s && typeof s.selectedLane === 'number') {
            var b = assignedBonus(s.selectedLane);
            if (b.cost) c = Math.max(1, Math.floor(c * (1 - b.cost)));
          }
          return c;
        };
        troopCost.__officers = true;
      }
      if (typeof createTroop === 'function' && !createTroop.__officers) {
        var oldCreateTroop = createTroop;
        createTroop = function (id, lane, hp, cooldown, slotOverride) {
          var t = oldCreateTroop.apply(this, arguments);
          var b = assignedBonus(lane);
          if (b.troopHp && t && t.maxHp) {
            var oldMax = t.maxHp;
            t.maxHp = Math.floor(t.maxHp * (1 + b.troopHp));
            if (hp == null) t.hp = t.maxHp;
            else t.hp = Math.min(t.maxHp, t.hp + (t.maxHp - oldMax));
          }
          return t;
        };
        createTroop.__officers = true;
      }
      if (typeof startWave === 'function' && !startWave.__officers) {
        var oldStartWave = startWave;
        startWave = function () {
          var result = oldStartWave.apply(this, arguments);
          safe('wave start auto manage', tryOfficerAutoManage);
          var s = getState();
          if (s && s.waveInProgress) {
            [0,1,2].forEach(function (lane) {
              var b = assignedBonus(lane);
              if (b.waveCredits) s.credits += Math.floor(b.waveCredits);
              if (b.repair && s.baseHp < s.maxBaseHp) s.baseHp = Math.min(s.maxBaseHp, s.baseHp + b.repair);
            });
          }
          return result;
        };
        startWave.__officers = true;
      }
      if (typeof updateHUD === 'function' && !updateHUD.__officers) {
        var oldUpdateHUD = updateHUD;
        updateHUD = function () { var r = oldUpdateHUD.apply(this, arguments); ensureStaffMeta(); ensureStaffButton(); return r; };
        updateHUD.__officers = true;
      }
      if (typeof saveMeta === 'function' && !saveMeta.__officers) {
        var oldSaveMeta = saveMeta;
        saveMeta = function (m) { if (m) { if (!m.commandStaff) m.commandStaff = { unlocked:{}, assignments:{0:null,1:null,2:null}, shards:{}, xp:{}, draws:{total:0,pity:0} }; } return oldSaveMeta.apply(this, arguments); };
        saveMeta.__officers = true;
      }
    });
  }

  function boot() {
    ensureStaffMeta();
    installStyles();
    installGameplayHooks();
    ensureStaffButton();
    saveMetaNow();
  }

  window.LSC_OFFICER_DEFS = OFFICER_DEFS;
  window.LSC_RARITY_DEFS = RARITY;
  window.LSC_CRATE_DEFS = CRATES;
  window.showCommandStaff = showStaffModal;
  window.getCommandStaffLaneBonus = assignedBonus;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
  setTimeout(boot, 600);
})();
