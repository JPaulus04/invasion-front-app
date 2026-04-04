// ── HUD update ────────────────────────────────────────────────
function updateHUD() {
  const s = G.state;
  if (!s) return;
  const credEl = $id('hud-credits'); if (credEl) credEl.textContent = Math.floor(s.credits);
  const waveEl = $id('hud-wave');    if (waveEl) waveEl.textContent = s.wave;
  const hpf = s.baseHp / s.maxBaseHp;
  const hpEl = $id('hud-hp');
  if (hpEl) { hpEl.textContent = Math.floor(s.baseHp); hpEl.className = 'hud-value ' + (hpf > 0.5 ? 'v-good' : hpf > 0.25 ? 'v-warn' : 'v-bad'); }
  const bar = $id('hud-hpbar');
  if (bar) { bar.style.width = (hpf*100).toFixed(1) + '%'; bar.style.background = hpf > 0.5 ? 'var(--green)' : hpf > 0.25 ? 'var(--amber)' : 'var(--red)'; }
  const rankEl = $id('hud-rank'); if (rankEl) rankEl.textContent = G.meta.prestige;

  // Damage vignette — update edge effect based on HP
  const vig = $id('damage-vignette');
  if (vig) {
    vig.classList.remove('dmg-low','dmg-crit');
    if (hpf < 0.25) vig.classList.add('dmg-crit');
    else if (hpf < 0.55) vig.classList.add('dmg-low');
  }

  // ── Orbital button state ──────────────────────────────────
  const cd = (s.abilities && s.abilities.orbitalCd || 0);
  const orb = $id('orbitalBtn');
  // Re-check IAP flag from localStorage in case state was freshly reset
  if (!s._orbPurchaseUnlocked && localStorage.getItem('ifc_iap_supporter') === '1') {
    s._orbPurchaseUnlocked = true;
  }
  if (!s._orbPurchaseUnlocked && localStorage.getItem('ifc_iap_commander') === '1') {
    s._orbPurchaseUnlocked = true;
  }
  const orbWaveLock = s.wave < 20 && !s._orbPurchaseUnlocked;
  const killCharge  = (s._orbKills || 0);
  const orbUnlocked = s._orbUnlocked || killCharge >= 8;
  if (orbUnlocked) s._orbUnlocked = true;

  const orbSub = $id('orbBtnSub');
  if (orbWaveLock) {
    orb.disabled = true; orb.style.opacity = '0.35';
    orb.querySelector('.act-icon').textContent = '🔒';
    if (orbSub) orbSub.textContent = 'WAVE 20';
    orb.classList.remove('ready');
  } else if (!orbUnlocked) {
    orb.disabled = true; orb.style.opacity = '0.6';
    orb.querySelector('.act-icon').textContent = '☄';
    if (orbSub) orbSub.textContent = killCharge + '/8 KILLS';
    orb.classList.remove('ready');
  } else if (cd > 0) {
    orb.disabled = true; orb.style.opacity = '0.55';
    orb.querySelector('.act-icon').textContent = '☄';
    if (orbSub) orbSub.textContent = 'COOLING';
    orb.classList.remove('ready');
  } else {
    orb.disabled = false; orb.style.opacity = '1';
    orb.querySelector('.act-icon').textContent = '☄';
    if (orbSub) orbSub.textContent = 'ORBITAL';
    orb.classList.add('ready');
  }

  // ── Wave button state ─────────────────────────────────────
  const wb    = $id('waveBtn');
  const wbSub = $id('waveBtnSub');
  if (s.waveInProgress) {
    wb.disabled = true;
    wb.querySelector('.act-icon').textContent = '↺';
    if (wbSub) wbSub.textContent = 'IN PROGRESS';
    wb.classList.remove('ready');
  } else {
    wb.disabled = false;
    const isBossNext = s.wave % CFG.BOSS_WAVE_EVERY === 0;
    wb.querySelector('.act-icon').textContent = isBossNext ? '⚠' : '▶';
    if (wbSub) wbSub.textContent = isBossNext ? 'BOSS WAVE' : 'LAUNCH WAVE';
    wb.classList.add('ready');
  }

  // ── Pause button state ────────────────────────────────────
  const pb    = $id('pauseBtn');
  const pbSub = $id('pauseBtnSub');
  const pIcon = $id('pauseIcon');
  if (pb) {
    pb.disabled = !s.started || s.gameOver;
    pb.classList.toggle('paused', !!s.paused);
    if (pIcon) pIcon.textContent = s.paused ? '▶' : '⏸';
    if (pbSub) pbSub.textContent = s.paused ? 'RESUME' : 'PAUSE';
  }

  // Doctrine (guard — pill element removed from DOM)
  const d = DOCTRINES.find(x => x.id === s.selectedDoctrine);
  if (d) {
    const di = $id('doc-icon'); if (di) di.textContent = d.icon;
    const dn = $id('doc-name'); if (dn) dn.textContent = d.name;
    const df = $id('doc-fx');   if (df) df.textContent = d.effects.slice(0,2).join(' · ');
    // #8: Doctrine chip in HUD
    const hudIcon = $id('hud-doc-icon'); if (hudIcon) hudIcon.textContent = d.icon;
    const hudName = $id('hud-doc-name');
    if (hudName) hudName.textContent = d.name.split(' ')[0]; // first word fits
  }

  // Wave chip — show chapter and modifier stack
  const chip = $id('wave-chip');
  const mod  = WAVE_MODIFIERS.find(m => m.id === s.currentModifier);
  const chap = _getChapter(s.wave);
  if (chip) {
    if (s.waveInProgress) {
      const modText = mod && mod.id !== 'none' ? ' · ' + mod.name : '';
      chip.textContent = 'Ch' + Math.ceil(chap.wave / 10) + ': ' + chap.name + modText + ' · ' + (s.enemies.length + s.enemiesToSpawn) + ' left';
    } else {
      chip.textContent = 'Ch' + Math.ceil(chap.wave / 10) + ' · Wave ' + s.wave + ' ready';
    }
  }

  // #1: Wave sky escalation
  if (typeof updateWaveSky === 'function') updateWaveSky(s.wave);

  // Panel pulse
  const wrap = $id('battlefield-wrap');
  if (wrap) wrap.classList.toggle('pulse-danger', hpf < 0.25);

  // ── Live lane pressure bars ───────────────────────────
  const pOverlay = $id('pressure-overlay');
  if (s.waveInProgress) {
    const laneCounts = [0, 1, 2].map(i => s.enemies.filter(e => e.lane === i).length);
    const maxCount = Math.max(...laneCounts, 1);
    for (let i = 0; i < 3; i++) {
      const fill  = $id('press-fill-' + i);
      const count = $id('press-count-' + i);
      if (fill)  fill.style.width  = (laneCounts[i] / maxCount * 100).toFixed(0) + '%';
      if (count) count.textContent = laneCounts[i] > 0 ? laneCounts[i] + ' ▼' : '';
    }
    if (pOverlay) pOverlay.style.opacity = '1';
  } else {
    for (let i = 0; i < 3; i++) {
      const fill  = $id('press-fill-' + i);
      const count = $id('press-count-' + i);
      if (fill)  fill.style.width  = '0%';
      if (count) count.textContent = '';
    }
    if (pOverlay) pOverlay.style.opacity = '0.4';
  }

  // #3: Upgrade available badges on base buildings
  if (typeof updateUpgradeBadges === 'function') updateUpgradeBadges();
}

// ── Enlist sheet ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
// UNIT UNLOCK SYSTEM
// Rifle is always available. All others must be researched & paid.
// ══════════════════════════════════════════════════════════════

const UNIT_UNLOCK_DEFS = {
  rifle:     { always: true },
  heavy:     { waveReq: 20, unlockCost: 120, label: 'Reach Wave 20 + 120 cr', reward: 'Free Heavy Team deployed to strongest lane' },
  medic:     { waveReq: 30, unlockCost: 160, label: 'Reach Wave 30 + 160 cr', reward: 'Free Medic deployed + base healed 20 HP' },
  grenadier: { waveReq: 40, unlockCost: 220, label: 'Reach Wave 40 + 220 cr', reward: 'Free Grenadier deployed + +25% splash this wave' },
  ew:        { waveReq: 50, unlockCost: 280, label: 'Reach Wave 50 + 280 cr', reward: 'Free EW Specialist + all enemies slowed on entry' },
  sniper:    { waveReq: 65, unlockCost: 380, label: 'Reach Wave 65 + 380 cr', reward: 'Free Sniper Team + Orbital damage +30 permanently' },
};

// Promotion tiers — each troop can be promoted once
// ── Troop promotion tiers — 5 levels per class ────────────────
// Each level: name, hpBonus, dmgBonus, rateBonus (fire rate mult), cost
// Costs escalate, bonuses compound. Max = level 5 (index 4).
const PROMO_TIERS = {
  // ★ costs scale steeply — 5-star is a late-game luxury costing ~1000 cr total
  // Each promotion also requires the troop to have survived N waves (wavesSurvived check in _buildPromoteCard)
  rifle: [
    { name:'Veteran Rifles',    hpBonus:12, dmgBonus:4,  rateBonus:0,    cost:80,  waveReq:5  },
    { name:'Seasoned Infantry', hpBonus:16, dmgBonus:7,  rateBonus:0.06, cost:160, waveReq:12 },
    { name:'Elite Rifles',      hpBonus:22, dmgBonus:11, rateBonus:0.10, cost:280, waveReq:22 },
    { name:'Shock Troopers',    hpBonus:30, dmgBonus:16, rateBonus:0.15, cost:440, waveReq:35 },
    { name:'Legion Guard',      hpBonus:42, dmgBonus:24, rateBonus:0.22, cost:650, waveReq:50, reward:'All Rifle Squads gain +10% dmg permanently' },
  ],
  heavy: [
    { name:'Heavy Veterans',    hpBonus:20, dmgBonus:9,  rateBonus:0,    cost:100, waveReq:5  },
    { name:'Hardened Gunners',  hpBonus:28, dmgBonus:14, rateBonus:0,    cost:200, waveReq:14 },
    { name:'Iron Corps',        hpBonus:38, dmgBonus:20, rateBonus:0.06, cost:340, waveReq:26 },
    { name:'Siege Breakers',    hpBonus:50, dmgBonus:28, rateBonus:0.10, cost:520, waveReq:40 },
    { name:'Devastators',       hpBonus:68, dmgBonus:40, rateBonus:0.16, cost:760, waveReq:55, reward:'This unit becomes unkillable for 1 wave after promotion' },
  ],
  medic: [
    { name:'Field Surgeons',    hpBonus:10, dmgBonus:0,  rateBonus:0.12, cost:90,  waveReq:5  },
    { name:'Combat Medics',     hpBonus:14, dmgBonus:0,  rateBonus:0.20, cost:180, waveReq:14 },
    { name:'Trauma Specialists',hpBonus:18, dmgBonus:0,  rateBonus:0.30, cost:300, waveReq:26 },
    { name:'Battlefield Docs',  hpBonus:24, dmgBonus:3,  rateBonus:0.42, cost:460, waveReq:40 },
    { name:'Miracle Workers',   hpBonus:32, dmgBonus:5,  rateBonus:0.60, cost:680, waveReq:55, reward:'+25 base HP restored immediately' },
  ],
  ew: [
    { name:'EW Operators',      hpBonus:10, dmgBonus:4,  rateBonus:0.10, cost:95,  waveReq:5  },
    { name:'Signal Specialists',hpBonus:14, dmgBonus:7,  rateBonus:0.16, cost:190, waveReq:14 },
    { name:'Cyber Warfare',     hpBonus:18, dmgBonus:11, rateBonus:0.22, cost:320, waveReq:26 },
    { name:'Ghost Network',     hpBonus:24, dmgBonus:15, rateBonus:0.30, cost:490, waveReq:40 },
    { name:'Phantom Corps',     hpBonus:32, dmgBonus:20, rateBonus:0.42, cost:720, waveReq:55, reward:'EW slow chains to 2 nearby enemies permanently' },
  ],
  grenadier: [
    { name:'Demo Experts',      hpBonus:12, dmgBonus:7,  rateBonus:0.06, cost:105, waveReq:5  },
    { name:'Blast Specialists', hpBonus:16, dmgBonus:12, rateBonus:0.10, cost:210, waveReq:14 },
    { name:'Ordnance Corps',    hpBonus:22, dmgBonus:18, rateBonus:0.14, cost:355, waveReq:26 },
    { name:'Hellfire Squad',    hpBonus:30, dmgBonus:26, rateBonus:0.18, cost:540, waveReq:40 },
    { name:'Armageddon Unit',   hpBonus:42, dmgBonus:38, rateBonus:0.26, cost:800, waveReq:55, reward:'Next Orbital Strike deals double damage' },
  ],
  sniper: [
    { name:'Elite Snipers',     hpBonus:10, dmgBonus:14, rateBonus:0.06, cost:120, waveReq:5  },
    { name:'Marksmen',          hpBonus:14, dmgBonus:22, rateBonus:0.10, cost:240, waveReq:14 },
    { name:'Designated Hunters',hpBonus:18, dmgBonus:32, rateBonus:0.14, cost:400, waveReq:26 },
    { name:'Shadow Operatives', hpBonus:24, dmgBonus:44, rateBonus:0.18, cost:600, waveReq:40 },
    { name:'Ghost Protocol',    hpBonus:32, dmgBonus:60, rateBonus:0.24, cost:880, waveReq:55, reward:'Orbital Strike cooldown permanently -6s' },
  ],
};

function _initUnlockState(s) {
  if (!s._unlockedUnits) s._unlockedUnits = { rifle: true };
}

function _isUnitUnlocked(s, id) {
  _initUnlockState(s);
  return !!(s._unlockedUnits[id]);
}

function _canUnlockUnit(s, id) {
  const def = UNIT_UNLOCK_DEFS[id];
  if (!def || def.always) return false;
  const waveOk = (s.wave || 1) > (def.waveReq || 0);
  const crOk   = s.credits >= def.unlockCost;
  return { waveOk, crOk, both: waveOk && crOk, cost: def.unlockCost, waveReq: def.waveReq };
}

// ── Promote card builder — shared by promote tab ──────────────
function _applyPromoReward(tier, s) {
  if (!tier.reward) return;
  const r = tier.reward;
  if (r.includes('Rifle Squads gain')) { s.perks.rifleDamage = (s.perks.rifleDamage||0) + 0.10; showToast('★★★★★ ' + r); }
  else if (r.includes('unkillable')) { s._heavyShield = true; showToast('★★★★★ ' + r); }
  else if (r.includes('+25 base HP')) { s.baseHp = Math.min(s.maxBaseHp, s.baseHp + 25); showToast('★★★★★ ' + r); }
  else if (r.includes('chains to 2')) { s.perks.ewChain = true; showToast('★★★★★ ' + r); }
  else if (r.includes('double damage')) { s.perks._nextOrbDouble = true; showToast('★★★★★ ' + r); }
  else if (r.includes('cooldown permanently')) { s.mods.orbitalCdFlat = (s.mods.orbitalCdFlat||0) + 6; showToast('★★★★★ ' + r); }
  playSfx('prestige');
}

function _buildPromoteCard(trp, s) {
  const promoList = PROMO_TIERS[trp.type.id];
  if (!promoList) return document.createElement('div');
  const promoted  = trp._promoted || 0;
  const maxTier   = promoList.length;
  const nextPromo = promoList[promoted];
  const posNames  = ['Left','Center','Right'];
  const slotNames = ['Front-L','Front-R','Back-L','Back-Ctr','Back-R'];
  const hpPct     = Math.round(trp.hp / trp.maxHp * 100);
  const hpCol     = hpPct > 60 ? 'var(--green)' : hpPct > 30 ? 'var(--amber)' : 'var(--red)';
  const tierLabel = promoted > 0 ? promoList[promoted-1].name : trp.type.name;
  const canPromo  = nextPromo && s.credits >= nextPromo.cost;
  const isMaxed   = promoted >= maxTier;
  const starsHtml = '★'.repeat(promoted) + '☆'.repeat(maxTier - promoted);

  const card = document.createElement('div');
  card.style.cssText =
    'border:1px solid ' + (isMaxed ? 'rgba(24,240,106,.25)' : promoted > 0 ? trp.type.color + '44' : 'var(--line2)') + ';' +
    'border-radius:12px;padding:10px 12px;margin-bottom:8px;' +
    'background:' + (isMaxed ? 'rgba(24,240,106,.03)' : 'rgba(255,255,255,.015)') + ';' +
    (isMaxed ? 'opacity:.7;' : '');

  card.innerHTML =
    '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px">' +
      '<div style="width:9px;height:9px;border-radius:50%;background:' + trp.type.color + ';box-shadow:0 0 6px ' + trp.type.color + ';flex-shrink:0;margin-top:3px"></div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:14px;color:' + trp.type.color + '">' + tierLabel + '</div>' +
        '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--muted);margin-top:1px">' + posNames[trp.lane] + ' · ' + slotNames[Math.min(trp.slot,4)] + '</div>' +
      '</div>' +
      '<div style="text-align:right">' +
        '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;color:' + (isMaxed ? 'var(--green)' : 'var(--amber)') + ';letter-spacing:1px">' + starsHtml + '</div>' +
        '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--muted);margin-top:2px">' + promoted + '/' + maxTier + '</div>' +
      '</div>' +
    '</div>' +
    '<div style="height:3px;background:rgba(255,255,255,.08);border-radius:2px;margin-bottom:7px;overflow:hidden">' +
      '<div style="height:100%;width:' + (promoted/maxTier*100) + '%;background:' + trp.type.color + ';border-radius:2px"></div>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">' +
      '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--muted);width:20px">HP</div>' +
      '<div style="flex:1;height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden">' +
        '<div style="height:100%;width:' + hpPct + '%;background:' + hpCol + ';border-radius:2px"></div>' +
      '</div>' +
      '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:' + hpCol + ';width:28px;text-align:right">' + hpPct + '%</div>' +
    '</div>' +
    (nextPromo
      ? '<div style="display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:8px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06)">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:12px;color:var(--text)">↑ ' + nextPromo.name + '</div>' +
            '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--muted);margin-top:2px">' +
              '+' + nextPromo.hpBonus + ' HP · +' + nextPromo.dmgBonus + ' dmg' +
              (nextPromo.rateBonus > 0 ? ' · +' + Math.round(nextPromo.rateBonus*100) + '% rate' : '') +
            '</div>' +
            (nextPromo.reward ? '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--amber);margin-top:3px">★ ' + nextPromo.reward + '</div>' : '') +
          '</div>' +
          (function() {
            const wl = nextPromo.waveReq && (s.wave||1) < nextPromo.waveReq;
            const btnLabel = wl ? ('🔒 W' + nextPromo.waveReq) : canPromo ? (nextPromo.cost + ' cr' + (nextPromo.reward ? ' ★' : '')) : ('⚠ ' + nextPromo.cost + ' cr');
            const btnDis = wl || !canPromo;
            return '<button class="promote-btn" ' + (btnDis ? 'disabled' : '') + ' style="' + (!btnDis ? 'border-color:' + trp.type.color + ';color:' + trp.type.color + ';' : '') + '">' + btnLabel + '</button>';
          })() +
        '</div>'
      : '<div style="text-align:center;padding:7px;font-family:\'Share Tech Mono\',monospace;font-size:9px;color:var(--green)">★★★★★ FULLY PROMOTED</div>'
    );

  if (nextPromo) {
    card.querySelector('.promote-btn').addEventListener('click', function() {
      const waveBlocked = nextPromo.waveReq && (s.wave||1) < nextPromo.waveReq;
      if (waveBlocked) { showToast('⚠ Reach Wave ' + nextPromo.waveReq + ' to promote'); haptic('medium'); return; }
      if (!canPromo) return;
      s.credits -= nextPromo.cost;
      trp.maxHp += nextPromo.hpBonus;
      trp.hp = Math.min(trp.hp + nextPromo.hpBonus, trp.maxHp);
      if (nextPromo.dmgBonus) trp.type = Object.assign({}, trp.type, { damage: (trp.type.damage || 0) + nextPromo.dmgBonus });
      if (nextPromo.rateBonus) trp.type = Object.assign({}, trp.type, { fireRate: (trp.type.fireRate || 1) * (1 - nextPromo.rateBonus) });
      trp._promoted = (trp._promoted || 0) + 1;
      if (nextPromo.reward) _applyPromoReward({ reward: nextPromo.reward }, s);
      _sfxPromotion();
      haptic('success');
      const newStars = '★'.repeat(trp._promoted) + '☆'.repeat(5 - trp._promoted);
      showToast(newStars + ' ' + trp.type.name + ' → ' + nextPromo.name + (nextPromo.reward ? ' ★' : '') + '!');
      renderEnlistSheet(); updateHUD();
    });
  }
  return card;
}

// ── Active Barracks tab ───────────────────────────────────────
let _bkTab = 'deploy';
let _promoteLane = 0; // which lane is shown in promote tab

function _setBkTab(tab) {
  _bkTab = tab;
  document.querySelectorAll('.bk-tab').forEach(function(b) {
    b.classList.toggle('active', b.dataset.bk === tab);
  });
  const laneRow = $id('bk-lane-row');
  if (laneRow) laneRow.style.display = tab === 'deploy' ? 'grid' : 'none';
  renderEnlistSheet();
}

// Wire tab buttons
document.querySelectorAll('.bk-tab').forEach(function(btn) {
  btn.addEventListener('click', function() { _setBkTab(btn.dataset.bk); });
});

// ── Main render function ───────────────────────────────────────
function renderEnlistSheet() {
  const s = G.state;
  _initUnlockState(s);
  const slots     = UNLOCKS.troopSlots(s.prestige);
  const lc        = laneTroopCount(s.selectedLane);
  const laneNames = ['Left','Center','Right'];
  const list      = $id('troop-list');
  if (!list) return;
  list.innerHTML  = '';

  // Update lane buttons
  for (let i = 0; i < 3; i++) {
    const btn = $id('es-lane' + i);
    if (!btn) continue;
    const count = laneTroopCount(i);
    btn.classList.toggle('active', i === s.selectedLane);
    btn.innerHTML = ['◀','◆','▶'][i] + ' ' + laneNames[i] +
      '<span style="display:block;font-family:\'Share Tech Mono\',monospace;font-size:9px;opacity:.7;margin-top:1px">' + count + '/' + slots + '</span>';
  }

  $id('enlist-subtitle').textContent = laneNames[s.selectedLane] + ' · ' + lc + '/' + slots + ' · ' + Math.floor(s.credits) + ' cr';

  // ── DEPLOY TAB ─────────────────────────────────────────────
  if (_bkTab === 'deploy') {
    // ── Current roster in this lane ─────────────────────────
    const laneTroops = s.troops.filter(function(t) { return t.lane === s.selectedLane; });
    if (laneTroops.length > 0) {
      const rosterHead = document.createElement('div');
      rosterHead.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:7px;padding-bottom:6px;border-bottom:1px solid var(--line);';
      rosterHead.textContent = laneNames[s.selectedLane] + ' position — ' + lc + '/' + slots + ' deployed';
      list.appendChild(rosterHead);

      const rosterRow = document.createElement('div');
      rosterRow.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-bottom:14px;';
      laneTroops.forEach(function(t) {
        const hpPct  = Math.round(t.hp / t.maxHp * 100);
        const hpCol  = hpPct > 60 ? 'var(--green)' : hpPct > 30 ? 'var(--amber)' : 'var(--red)';
        const promo  = t._promoted > 0 ? ' ' + '★'.repeat(Math.min(t._promoted, 5)) : '';
        const chip   = document.createElement('div');
        chip.style.cssText =
          'display:flex;align-items:center;gap:8px;padding:7px 10px;' +
          'border:1px solid ' + t.type.color + '33;border-radius:10px;' +
          'background:rgba(0,0,0,.35);';
        chip.innerHTML =
          // Color dot
          '<div style="width:8px;height:8px;border-radius:50%;background:' + t.type.color + ';box-shadow:0 0 5px ' + t.type.color + ';flex-shrink:0"></div>' +
          // Name + HP
          '<div style="flex:1;min-width:0">' +
            '<div style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:13px;color:' + t.type.color + '">' + t.type.name + promo + '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;margin-top:2px">' +
              '<div style="flex:1;height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden">' +
                '<div style="height:100%;width:' + hpPct + '%;background:' + hpCol + ';border-radius:2px"></div>' +
              '</div>' +
              '<span style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:' + hpCol + '">' + hpPct + '%</span>' +
            '</div>' +
          '</div>' +
          // Swap button
          '<button class="troop-swap-chip-btn" style="padding:4px 9px;border-radius:7px;border:1px solid ' + t.type.color + '66;background:rgba(0,0,0,.3);color:' + t.type.color + ';font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:11px;cursor:pointer;-webkit-appearance:none;flex-shrink:0">⇄ Swap</button>' +
          // Dismiss button
          '<button class="troop-dismiss-chip-btn" style="padding:4px 9px;border-radius:7px;border:1px solid rgba(255,60,60,.4);background:rgba(255,30,30,.06);color:rgba(255,80,80,.8);font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:11px;cursor:pointer;-webkit-appearance:none;flex-shrink:0">✕</button>';

        // Swap → open swap sheet for this troop
        chip.querySelector('.troop-swap-chip-btn').addEventListener('click', function(ev) {
          ev.stopPropagation();
          closeSheet('enlist-sheet', 'enlist-backdrop');
          setTimeout(function() { openSwapSheet(t, true); }, 180); // true = came from barracks
        });

        // Dismiss → remove troop, re-render (slot refund)
        chip.querySelector('.troop-dismiss-chip-btn').addEventListener('click', function(ev) {
          ev.stopPropagation();
          const idx = s.troops.indexOf(t);
          if (idx !== -1) {
            s.troops.splice(idx, 1);
            s.troops.filter(function(tr) { return tr.lane === t.lane; })
                    .forEach(function(tr, i) { tr.slot = i; });
            // Partial refund: 50% of troop cost
            const refund = Math.floor(troopCost(t.type) * 0.5);
            if (refund > 0) { s.credits += refund; showToast(t.type.name + ' dismissed · +'+ refund +' cr refund'); }
            else showToast(t.type.name + ' dismissed');
            haptic('medium');
          }
          renderEnlistSheet(); updateHUD();
        });

        rosterRow.appendChild(chip);
      });
      list.appendChild(rosterRow);
    } else {
      const emptyNote = document.createElement('div');
      emptyNote.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:9px;color:var(--muted);margin-bottom:12px;padding:8px 10px;border:1px dashed var(--line);border-radius:8px;text-align:center;';
      emptyNote.textContent = laneNames[s.selectedLane] + ' position is empty';
      list.appendChild(emptyNote);
    }

    const deployHead = document.createElement('div');
    deployHead.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;';
    deployHead.textContent = lc >= slots ? 'Position full — promote or swap' : 'Deploy to ' + laneNames[s.selectedLane];
    list.appendChild(deployHead);

    UNIT_DEFS.forEach(function(def) {
      const unlocked = _isUnitUnlocked(s, def.id);
      const cost     = troopCost(def);
      // Tutorial free deploy: first rifle in each empty lane is free on step 0
      const isTutorialFree = def.id === 'rifle' && _obIsFreeDeployEligible(s.selectedLane);
      const effectiveCost  = isTutorialFree ? 0 : cost;
      const canDeploy = unlocked && (isTutorialFree || s.credits >= cost) && lc < slots;

      const card = document.createElement('div');
      card.className = 'troop-card' + (canDeploy ? '' : ' disabled');

      if (!unlocked) {
        const unlockDef2 = UNIT_UNLOCK_DEFS[def.id];
        const waveLeft2 = (unlockDef2 && unlockDef2.waveReq) ? Math.max(0, unlockDef2.waveReq - (s.wave||1)) : 0;
        card.innerHTML =
          '<div class="troop-dot" style="background:#444;box-shadow:none"></div>' +
          '<div class="troop-info">' +
            '<div class="troop-name" style="color:var(--muted)">🔒 ' + def.name + '</div>' +
            '<div class="troop-desc">' + (waveLeft2 > 0 ? waveLeft2 + ' more waves' : (unlockDef2 && unlockDef2.label) || '') + '</div>' +
          '</div>' +
          '<button class="troop-deploy-btn" style="background:rgba(255,190,0,.08);border-color:var(--amber);color:var(--amber)">Unlock</button>';
        card.querySelector('.troop-deploy-btn').addEventListener('click', function(ev) {
          ev.stopPropagation();
          _setBkTab('unlock');
        });
      } else {
        const costLabel = isTutorialFree ? 'FREE' : cost + ' cr';
        const btnStyle  = isTutorialFree ? 'border-color:var(--green);color:var(--green);' : '';
        card.innerHTML =
          '<div class="troop-dot" style="background:' + def.color + ';box-shadow:0 0 6px ' + def.color + '"></div>' +
          '<div class="troop-info">' +
            '<div class="troop-name" style="color:' + def.color + '">' + def.name + (isTutorialFree ? ' ★' : '') + '</div>' +
            '<div class="troop-desc">' + (isTutorialFree ? 'First deploy free — tutorial' : def.desc) + '</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
            '<div class="troop-cost">' + costLabel + '</div>' +
            '<button class="troop-deploy-btn" ' + (canDeploy ? '' : 'disabled') + ' style="' + btnStyle + '">' +
              (canDeploy ? 'Deploy' : s.credits < cost ? 'Need cr' : 'Full') +
            '</button>' +
          '</div>';
        card.querySelector('.troop-deploy-btn').addEventListener('click', function(ev) {
          ev.stopPropagation();
          ensureAudio();
          if (!canDeploy) {
            const btn = card.querySelector('.troop-deploy-btn');
            btn.classList.remove('btn-shake'); void btn.offsetWidth; btn.classList.add('btn-shake');
            setTimeout(function() { btn.classList.remove('btn-shake'); }, 400);
            if (s.credits < cost) showToast('Need ' + (cost - Math.floor(s.credits)) + ' more cr');
            haptic('light'); return;
          }
          // Tutorial free: inject credits temporarily, deploy, restore
          if (isTutorialFree) {
            const held = s.credits;
            s.credits = Math.max(s.credits, cost + 1);
            _deployUnitPatched(def.id);
            s.credits = held; // restore — no charge
            haptic('success');
            showToast('★ Rifle Squad deployed free!');
            _questTick('deploys', 1);
            renderEnlistSheet(); updateHUD();
            return;
          }
          const costBefore = s.credits;
          _deployUnitPatched(def.id);
          const costSpent = costBefore - s.credits;
          if (costSpent > 0) {
            _questTick('deploys', 1);
            const fullPos = [0,1,2].filter(function(l) {
              return (s.troops||[]).filter(function(t){ return t.lane===l; }).length >= 5;
            });
            if (fullPos.length > 0) _questTick('fullpos', 1);
            if (s.troops.length > 0) showRefundBar(s.troops[s.troops.length-1], costSpent);
          }
          haptic('light');
          renderEnlistSheet(); updateHUD();
        });
      }
      list.appendChild(card);
    });

  // ── UNLOCK TAB ─────────────────────────────────────────────
  } else if (_bkTab === 'unlock') {
    const head = document.createElement('div');
    head.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;';
    head.textContent = 'Research & unlock unit classes';
    list.appendChild(head);

    UNIT_DEFS.forEach(function(def) {
      const unlockDef = UNIT_UNLOCK_DEFS[def.id];
      const card = document.createElement('div');

      if (unlockDef.always) {
        card.className = 'unit-unlock-card owned';
        card.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<div>' +
              '<div class="unlock-unit-name" style="color:' + def.color + '">' + def.name + '</div>' +
              '<div class="tiny" style="color:var(--muted);margin-top:2px">' + def.desc + '</div>' +
            '</div>' +
            '<span style="color:var(--green);font-family:\'Share Tech Mono\',monospace;font-size:10px">✓ ISSUED</span>' +
          '</div>';
      } else {
        const owned = _isUnitUnlocked(s, def.id);
        const check = _canUnlockUnit(s, def.id);
        card.className = 'unit-unlock-card ' + (owned ? 'owned' : 'locked');
        const reqMet = check.waveOk;
        const waveLeft = !reqMet ? (check.waveReq - (s.wave || 1)) : 0;
        card.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
            '<div style="flex:1">' +
              '<div class="unlock-unit-name" style="color:' + (owned ? def.color : 'var(--muted)') + '">' +
                (owned ? '' : '🔒 ') + def.name +
              '</div>' +
              '<div class="tiny" style="color:var(--muted);margin-top:2px">' + def.desc + '</div>' +
              '<div class="unlock-req ' + (reqMet ? 'met' : '') + '">' +
                (reqMet ? '✓ Wave ' + check.waveReq + ' reached' : '⚠ ' + waveLeft + ' more waves needed') +
              '</div>' +
            '</div>' +
            (owned
              ? '<span style="color:var(--green);font-family:\'Share Tech Mono\',monospace;font-size:10px;flex-shrink:0;margin-top:2px">✓ UNLOCKED</span>'
              : '<button class="troop-deploy-btn" style="flex-shrink:0;margin-top:2px;' +
                  (check.both ? 'border-color:var(--green);color:var(--green)' : '') + '"' +
                  (check.both ? '' : ' disabled') + '>' +
                  (check.both ? 'Unlock ' + def.unlockCost + ' cr' :
                   !check.waveOk ? 'Wave ' + check.waveReq : 'Need ' + def.unlockCost + ' cr') +
                '</button>'
            ) +
          '</div>';

        if (!owned) {
          const btn = card.querySelector('.troop-deploy-btn');
          if (btn) btn.addEventListener('click', function() {
            if (!check.both) return;
            s.credits -= unlockDef.unlockCost;
            s._unlockedUnits[def.id] = true;
            haptic('success');
            showToast('🔓 ' + def.name + ' unlocked!');
            _questTick('research', 1);
            renderEnlistSheet(); updateHUD();
          });
        }
      }
      list.appendChild(card);
    });

  // ── PROMOTE TAB ────────────────────────────────────────────
  } else if (_bkTab === 'promote') {
    if (s.troops.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:var(--muted);text-align:center;padding:30px 0;font-family:"Share Tech Mono",monospace;font-size:10px;';
      empty.textContent = 'No troops deployed yet.';
      list.appendChild(empty);
      return;
    }

    const laneNames  = ['Left','Center','Right'];
    const laneColors = ['var(--lt)','var(--lm)','var(--lb)'];
    const laneRaw    = ['#3ab0d5','#8855e8','#2db858'];
    const laneIcons  = ['◀','◆','▶'];

    // ── Big lane selector blocks ──────────────────────────────
    const lanePicker = document.createElement('div');
    lanePicker.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;';

    [0, 1, 2].forEach(function(li) {
      const troopsInLane = s.troops.filter(function(t) { return t.lane === li; });
      const maxedCount   = troopsInLane.filter(function(t) {
        const pl = PROMO_TIERS[t.type.id];
        return pl && (t._promoted||0) >= pl.length;
      }).length;
      const isActive = li === _promoteLane;
      const btn = document.createElement('button');
      btn.style.cssText =
        'padding:10px 6px;border-radius:11px;border:2px solid ' + (isActive ? laneColors[li] : 'var(--line)') + ';' +
        'background:' + (isActive ? 'rgba(' + (li===0?'58,176,213':li===1?'136,85,232':'45,184,88') + ',.12)' : 'rgba(0,0,0,.25)') + ';' +
        'color:' + (isActive ? laneColors[li] : 'var(--muted)') + ';' +
        'font-family:"Rajdhani",sans-serif;font-weight:700;font-size:16px;' +
        'cursor:pointer;-webkit-appearance:none;text-align:center;' +
        (isActive ? 'box-shadow:0 0 12px ' + laneColors[li] + '44;' : '');
      btn.innerHTML =
        '<div style="font-size:18px;margin-bottom:2px">' + laneIcons[li] + '</div>' +
        '<div>' + laneNames[li] + '</div>' +
        '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;margin-top:3px;opacity:.7">' +
          troopsInLane.length + ' troops' +
          (maxedCount > 0 ? '<br>★' + maxedCount + ' max' : '') +
        '</div>';
      btn.addEventListener('click', function() {
        _promoteLane = li;
        renderEnlistSheet();
      });
      lanePicker.appendChild(btn);
    });
    list.appendChild(lanePicker);

    // ── Troops for selected lane ──────────────────────────────
    const laneTroopsAll = s.troops.filter(function(t) { return t.lane === _promoteLane; });
    const laneActive    = laneTroopsAll.filter(function(t) {
      const pl = PROMO_TIERS[t.type.id];
      return pl && (t._promoted||0) < pl.length;
    });
    const laneMaxed     = laneTroopsAll.filter(function(t) {
      const pl = PROMO_TIERS[t.type.id];
      return pl && (t._promoted||0) >= pl.length;
    });

    if (laneTroopsAll.length === 0) {
      const noTroops = document.createElement('div');
      noTroops.style.cssText = 'text-align:center;padding:20px 0;font-family:"Share Tech Mono",monospace;font-size:9px;color:var(--muted);';
      noTroops.textContent = 'No troops in ' + laneNames[_promoteLane] + ' lane';
      list.appendChild(noTroops);
    } else {
      // Active (promotable) first
      laneActive.forEach(function(trp) {
        list.appendChild(_buildPromoteCard(trp, s));
      });

      // Maxed at bottom with separator
      if (laneMaxed.length > 0) {
        const maxHead = document.createElement('div');
        maxHead.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:12px;margin-bottom:8px;';
        maxHead.innerHTML =
          '<div style="flex:1;height:1px;background:rgba(24,240,106,.2)"></div>' +
          '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:rgba(24,240,106,.5)">★ FULLY PROMOTED</div>' +
          '<div style="flex:1;height:1px;background:rgba(24,240,106,.2)"></div>';
        list.appendChild(maxHead);
        laneMaxed.forEach(function(trp) {
          list.appendChild(_buildPromoteCard(trp, s));
        });
      }
    }

  // ── HEAL TAB ───────────────────────────────────────────────
  } else if (_bkTab === 'heal') {
    const head = document.createElement('div');
    head.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:4px;';
    head.textContent = 'Heal wounded troops';
    list.appendChild(head);

    // Heal all button
    const woundedTroops = s.troops.filter(function(t) { return t.hp < t.maxHp; });
    const totalHealCost = woundedTroops.reduce(function(sum, t) {
      return sum + Math.ceil((t.maxHp - t.hp) * 0.8);
    }, 0);
    const healAllBtn = document.createElement('button');
    healAllBtn.style.cssText = 'width:100%;padding:9px;border-radius:10px;border:1px solid var(--green);background:rgba(24,240,106,.07);color:var(--green);font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:13px;cursor:pointer;-webkit-appearance:none;margin-bottom:12px;';
    healAllBtn.textContent = woundedTroops.length > 0
      ? '+ Heal All (' + totalHealCost + ' cr)'
      : '✓ All troops at full HP';
    healAllBtn.disabled = woundedTroops.length === 0 || s.credits < totalHealCost;
    healAllBtn.addEventListener('click', function() {
      if (s.credits < totalHealCost) return;
      s.credits -= totalHealCost;
      woundedTroops.forEach(function(t) { t.hp = t.maxHp; });
      haptic('success'); showToast('All troops healed!');
      renderEnlistSheet(); updateHUD();
    });
    list.appendChild(healAllBtn);

    if (s.troops.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'tiny';
      empty.style.cssText = 'color:var(--muted);text-align:center;padding:16px 0';
      empty.textContent = 'No troops deployed.';
      list.appendChild(empty);
      return;
    }

    const posNames  = ['Left','Center','Right'];
    const slotNames = ['Front-L','Front-R','Back-L','Back-Ctr','Back-R'];

    s.troops.forEach(function(trp) {
      const hpPct    = Math.round(trp.hp / trp.maxHp * 100);
      const missing  = trp.maxHp - trp.hp;
      const healCost = Math.ceil(missing * 0.8); // 0.8 cr per HP
      const hpCol    = hpPct > 60 ? 'var(--green)' : hpPct > 30 ? 'var(--amber)' : 'var(--red)';
      const canHeal  = missing > 0 && s.credits >= healCost;

      const card = document.createElement('div');
      card.className = 'heal-card';
      card.innerHTML =
        '<div style="width:8px;height:8px;border-radius:50%;background:' + trp.type.color + ';flex-shrink:0"></div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:12px;color:' + trp.type.color + '">' + trp.type.name + '</div>' +
          '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--muted)">' + posNames[trp.lane] + ' · ' + slotNames[Math.min(trp.slot,4)] + '</div>' +
          '<div class="heal-bar-wrap" style="margin-top:4px">' +
            '<div class="heal-bar-fill" style="width:' + hpPct + '%;background:' + hpCol + '"></div>' +
          '</div>' +
          '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:' + hpCol + ';margin-top:2px">' + hpPct + '% HP</div>' +
        '</div>' +
        (missing > 0
          ? '<button class="heal-btn" ' + (canHeal ? '' : 'disabled') + '>' +
              (canHeal ? '+ ' + healCost + ' cr' : 'Need cr') +
            '</button>'
          : '<span style="font-family:\'Share Tech Mono\',monospace;font-size:9px;color:var(--green)">✓ Full</span>'
        );

      if (missing > 0) {
        card.querySelector('.heal-btn').addEventListener('click', function() {
          if (!canHeal) return;
          s.credits -= healCost;
          trp.hp = trp.maxHp;
          haptic('light'); showToast(trp.type.name + ' healed +' + missing + ' HP');
          renderEnlistSheet(); updateHUD();
        });
      }
      list.appendChild(card);
    });
  }

  // ── Dismiss / close button at bottom of every tab ────────────
  const dismissBtn = document.createElement('button');
  dismissBtn.style.cssText =
    'width:100%;margin-top:16px;padding:11px;border-radius:10px;' +
    'border:1px solid var(--line);background:rgba(255,255,255,.03);' +
    'color:var(--muted);font-family:"Rajdhani",sans-serif;font-weight:700;' +
    'font-size:14px;cursor:pointer;-webkit-appearance:none;letter-spacing:.5px;';
  dismissBtn.textContent = '✕ Close Barracks';
  dismissBtn.addEventListener('click', function() {
    closeSheet('enlist-sheet', 'enlist-backdrop');
    haptic('light');
  });
  list.appendChild(dismissBtn);
}
function renderResearchSheet() {
  const s = G.state;
  const container = $id('upgrade-list-all');
  if (!container) return;

  const crEl = $id('research-credits');
  if (crEl) crEl.textContent = Math.floor(s.credits) + ' cr available';

  container.innerHTML = '';

  const LANE_META = [
    { name:'Left Lane',   color:'var(--lt)', key:0 },
    { name:'Center Lane', color:'var(--lm)', key:1 },
    { name:'Right Lane',  color:'var(--lb)', key:2 },
  ];

  // ── Lane upgrades ──────────────────────────────────────────
  const lHead = document.createElement('div');
  lHead.className = 'upgrade-section-head';
  lHead.textContent = 'Lane Upgrades';
  container.appendChild(lHead);

  LANE_UPGRADE_DEFS.forEach(function(def) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.018);padding:10px 12px;margin-bottom:8px;';

    const nameRow = document.createElement('div');
    nameRow.innerHTML =
      '<div class="upgrade-name">' + def.name + '</div>' +
      '<div class="upgrade-desc" style="margin-top:2px">' + def.desc + '</div>';
    wrapper.appendChild(nameRow);

    const laneRow = document.createElement('div');
    laneRow.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:6px;';

    LANE_META.forEach(function(lm) {
      const lane      = lm.key;
      const lvl       = s.lanes[lane][def.id];
      const cost      = laneUpgradeCost(def.id, lane);
      const ok        = s.credits >= cost;
      const inQueue   = _researchQueueStatus(def.id, true, lane);
      const queueFull = !inQueue && _researchQueue.length >= 3;
      const canAct    = ok && !inQueue && !queueFull;
      const btn       = document.createElement('button');
      // Visual state: in-queue = cyan, can-afford = lane color, queue-full or can't-afford = locked
      var locked = !ok || queueFull;
      var btnBorder = inQueue ? 'var(--cyan)' : canAct ? lm.color : 'rgba(255,255,255,.08)';
      var btnBg     = inQueue ? 'rgba(34,212,255,.08)' : canAct ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.55)';
      var btnColor  = inQueue ? 'var(--cyan)' : canAct ? lm.color : 'rgba(255,255,255,.2)';
      var btnFilter = locked && !inQueue ? 'opacity:.28;filter:saturate(0)' : '';
      btn.style.cssText = 'min-height:48px;border-radius:9px;border:1px solid ' + btnBorder + ';background:' + btnBg + ';color:' + btnColor + ';font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:12px;cursor:' + (canAct ? 'pointer' : 'default') + ';padding:5px 4px;' + btnFilter + ';';
      btn.disabled = !canAct;

      if (inQueue) {
        const secsLeft = Math.max(0, Math.ceil((inQueue.completesAt - Date.now()) / 1000));
        const pct = Math.max(5, Math.round((1 - (inQueue.completesAt - Date.now()) / inQueue.totalMs) * 100));
        btn.innerHTML = '<span style="display:block;font-family:\'Share Tech Mono\',monospace;font-size:7px;letter-spacing:.8px;margin-bottom:2px">' + lm.name.split(' ')[0].toUpperCase() + ' Lv' + lvl + '</span>' +
          '<span style="font-size:8px">🔬 ' + _fmtTime(secsLeft) + '</span>';
      } else {
        var deficit = cost - Math.floor(s.credits);
        btn.innerHTML = '<span style="display:block;font-family:\'Share Tech Mono\',monospace;font-size:8px;letter-spacing:1px;opacity:.5;margin-bottom:2px">' + lm.name.split(' ')[0].toUpperCase() + ' Lv' + lvl + '</span>' +
          (inQueue ? '' : queueFull ? '<span style="font-size:9px;opacity:.4">Queue full</span>' : ok ? cost + ' cr' : '<span style="font-size:10px;opacity:.45">-' + deficit + ' cr</span>');
      }

      btn.addEventListener('click', function() {
        if (inQueue) return;
        if (!ok) return;
        if (_researchQueue.length >= 3) { showToast('Max 3 research items queued'); haptic('light'); return; }
        const secs = _researchSeconds(lvl + 1);
        if (secs === 0) {
          G.state.selectedLane = lane;
          buyLaneUpgrade(def.id);
          _questTick('research', 1);
          haptic('medium');
          renderResearchSheet(); updateHUD();
        } else {
          if (s.credits < cost) return;
          s.credits -= cost;
          _researchQueue.push({
            id: def.id, isLane: true, lane: lane,
            completesAt: Date.now() + secs * 1000,
            totalMs: secs * 1000,
            level: lvl + 1, name: def.name
          });
          _questTick('research', 1);
          haptic('light');
          showToast(def.name + ': ' + _fmtTime(secs));
          renderResearchSheet(); updateHUD();
        }
      });
      laneRow.appendChild(btn);
    });

    wrapper.appendChild(laneRow);
    container.appendChild(wrapper);
  });

  // ── Global upgrades ────────────────────────────────────────
  const gHead = document.createElement('div');
  gHead.className = 'upgrade-section-head';
  gHead.textContent = 'Global Tech';
  container.appendChild(gHead);

  UPGRADE_DEFS.forEach(function(def) {
    const cost      = upgradeCost(def);
    const ok        = s.credits >= cost;
    const maxLvl    = def.id === 'fortify' ? 8 : def.id === 'weapons' || def.id === 'training' ? 6 : 5;
    const isMaxed   = s.upgrades[def.id] >= maxLvl;
    const inQueue   = _researchQueueStatus(def.id, false, -1);
    const queueFull = !inQueue && _researchQueue.length >= 3;
    const curLvl    = s.upgrades[def.id];
    const canAct    = ok && !isMaxed && !inQueue && !queueFull;

    // Fortify prereq check
    let prereqBlock = null;
    if (def.id === 'fortify') {
      const prereq = getFortifyPrereq(curLvl);
      if (prereq && !prereq.check(s)) prereqBlock = prereq.label;
    }

    const row = document.createElement('div');
    row.className = 'upgrade-row' +
      (isMaxed    ? ' upgrade-maxed'      :
       inQueue    ? ' upgrade-queued'     :
       queueFull  ? ''                    :  // locked — gets the unaffordable dim CSS
       (ok && !prereqBlock) ? ' upgrade-affordable' : '');

    let btnHTML;
    if (isMaxed)        { btnHTML = 'MAX'; }
    else if (inQueue)   { const secsLeft = Math.max(0, Math.ceil((inQueue.completesAt - Date.now()) / 1000)); btnHTML = '🔬 ' + _fmtTime(secsLeft); }
    else if (queueFull) { btnHTML = 'Queue full'; }
    else if (prereqBlock){ btnHTML = 'Locked'; }
    else if (ok)        { btnHTML = cost + ' cr'; }
    else                { btnHTML = 'Need<br>' + (cost - Math.floor(s.credits)) + ' cr'; }

    row.innerHTML =
      '<div class="upgrade-info">' +
        '<div class="upgrade-name">' + def.name + '</div>' +
        '<div class="upgrade-desc">' + def.desc + '</div>' +
      '</div>' +
      '<span class="upgrade-level">Lv ' + curLvl + '</span>' +
      '<button class="upgrade-btn ' + (canAct ? 'upgrade-btn-glow' : '') + '" ' +
        (canAct ? '' : 'disabled') +
        ' data-up="' + def.id + '">' + btnHTML + '</button>';

    if (prereqBlock) {
      const prereqEl = document.createElement('div');
      prereqEl.className = 'upgrade-prereq';
      prereqEl.textContent = '⚠ Requires: ' + prereqBlock;
      row.appendChild(prereqEl);
    }

    if (inQueue) {
      const secsLeft2 = Math.max(0, Math.ceil((inQueue.completesAt - Date.now()) / 1000));
      const pct = Math.max(5, Math.min(95, Math.round((1 - (inQueue.completesAt - Date.now()) / inQueue.totalMs) * 100)));
      const timerEl = document.createElement('div');
      timerEl.className = 'upgrade-timer';
      timerEl.innerHTML = '<div class="upgrade-timer-bar"><div class="upgrade-timer-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="upgrade-timer-label">' + _fmtTime(secsLeft2) + '</span>';
      row.appendChild(timerEl);
    }

    row.querySelector('[data-up]').addEventListener('click', function() {
      if (inQueue || isMaxed || prereqBlock) return;
      if (!ok) return;
      if (_researchQueue.length >= 3) { showToast('Max 3 research items queued'); haptic('light'); return; }
      const secs = _researchSeconds(curLvl + 1);
      if (secs === 0) {
        buyUpgrade(def.id);
        _questTick('research', 1);
        haptic('medium');
        renderResearchSheet(); updateHUD();
      } else {
        if (s.credits < cost) return;
        s.credits -= cost;
        _researchQueue.push({
          id: def.id, isLane: false, lane: -1,
          completesAt: Date.now() + secs * 1000,
          totalMs: secs * 1000,
          level: curLvl + 1, name: def.name
        });
        _questTick('research', 1);
        haptic('light');
        showToast(def.name + ': ' + _fmtTime(secs));
        renderResearchSheet(); updateHUD();
      }
    });
    container.appendChild(row);
  });
}

// Lane selection (enlist sheet + research sheet only)
function selectLane(i) {
  G.state.selectedLane = i;
  document.querySelectorAll('.lane-btn[data-lane]').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.lane) === i);
  });
  updateHUD();
}

// Wire enlist sheet lane buttons
['es-lane0','es-lane1','es-lane2'].forEach((id, i) => {
  $id(id).addEventListener('click', () => { selectLane(i); renderEnlistSheet(); });
});

// ── Main action buttons ───────────────────────────────────────
// Career button — accessible from battlefield at any time
$id('careerBtn').addEventListener('click', () => {
  G.state._pausedBeforeMeta = G.state.paused;
  G.state.paused = true;
  renderMetaUI();
  $id('metaOverlay').style.display = 'block';
});

// ── Store sheet ────────────────────────────────────────────────
$id('storeBtn').addEventListener('click', () => {
  renderStoreSheet();
  openSheet('store-sheet', 'store-backdrop');
  haptic('light');
});
$id('store-close').addEventListener('click', () => closeSheet('store-sheet', 'store-backdrop'));
$id('store-backdrop').addEventListener('click', () => closeSheet('store-sheet', 'store-backdrop'));

// ── DOCTRINE INFO HELPER ───────────────────────────────────────────
function _getDoctrineInfo(docId) {
  // Normalize internal keys (game uses 'blitz','ew' internally)
  const keyMap = { blitz:'blitzkrieg', ew:'ewar' };
  docId = keyMap[docId] || docId;
  const doctrines = {
    blitzkrieg: { name: 'BLITZKRIEG COMMAND', icon: '⚡', tagline: 'Aggressive Firepower', color: '#ff6b35' },
    fortress: { name: 'FORTRESS COMMAND', icon: '🛡️', tagline: 'Impenetrable Defense', color: '#00e5ff' },
    logistics: { name: 'LOGISTICS COMMAND', icon: '⚙️', tagline: 'Economic Superiority', color: '#88bb66' },
    ewar: { name: 'EW SUPERIORITY COMMAND', icon: '📡', tagline: 'Total Information Control', color: '#bb88dd' },
    artillery: { name: 'ARTILLERY NETWORK', icon: '🎯', tagline: 'Infrastructure is Firepower', color: '#d4a028' },
  };
  return doctrines[docId] || doctrines.blitzkrieg;
}

function renderHomeScreen() {
  try {
    const home = $id('homeScreen');
    if (!home) return;
    
    // Get last saved game or current game state
    const raw = localStorage.getItem(CFG.SAVE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    const lastWave = saved ? saved.wave : (G.state ? G.state.wave : 1);
    const doctrine = saved ? saved.selectedDoctrine : (G.state ? G.state.selectedDoctrine : 'blitzkrieg');
    
    // Update wave display
    $id('homeWaveNum').textContent = lastWave;
    $id('homeResumeWave').textContent = lastWave;
    
    // Update doctrine banner
    const docInfo = _getDoctrineInfo(doctrine);
    $id('doctrineBannerIcon').textContent = docInfo.icon;
    $id('doctrineBannerName').textContent = docInfo.name;
    $id('doctrineBannerRank').textContent = 'RANK ' + (G.meta?.prestige || 0);
    $id('doctrineBannerTagline').textContent = docInfo.tagline;

    // Update rank label in top-left nav btn
    const rankLabel = $id('homeRankLabel');
    if (rankLabel) rankLabel.textContent = 'RANK ' + (G.meta?.prestige || 0);

    // Update doctrine stat icons per doctrine
    const DOCTRINE_STATS = {
      blitzkrieg: [{lbl:'SPEED',icon:'⚡'},{lbl:'DAMAGE',icon:'💥'},{lbl:'CRIT',icon:'🎯'}],
      blitz:      [{lbl:'SPEED',icon:'⚡'},{lbl:'DAMAGE',icon:'💥'},{lbl:'CRIT',icon:'🎯'}],
      fortress:   [{lbl:'DEFENSE',icon:'🛡️'},{lbl:'REPAIR',icon:'❤️'},{lbl:'BARRICADE',icon:'🧱'}],
      logistics:  [{lbl:'INCOME',icon:'💰'},{lbl:'SUPPLY',icon:'⚙️'},{lbl:'DISCOUNT',icon:'📦'}],
      ew:         [{lbl:'JAMMING',icon:'📡'},{lbl:'SLOW',icon:'🌀'},{lbl:'SHIELD',icon:'🔵'}],
      ewar:       [{lbl:'JAMMING',icon:'📡'},{lbl:'SLOW',icon:'🌀'},{lbl:'SHIELD',icon:'🔵'}],
      artillery:  [{lbl:'RANGE',icon:'🎯'},{lbl:'BLAST',icon:'💣'},{lbl:'ORBITAL',icon:'☄️'}],
    };
    const stats = DOCTRINE_STATS[doctrine] || DOCTRINE_STATS.blitzkrieg;
    const statEls = document.querySelectorAll('.hs-dc-stat');
    statEls.forEach((el, i) => {
      if (!stats[i]) return;
      const lbl  = el.querySelector('.hs-dc-stat-label');
      const icon = el.querySelector('.hs-dc-stat-icon');
      if (lbl)  lbl.textContent  = stats[i].lbl;
      if (icon) icon.textContent = stats[i].icon;
    });
    // Set doctrine background image
    const bgEl = $id('hsDoctrineBg');
    if (bgEl) {
      const DOCTRINE_BG_CLASSES = ['blitzkrieg','fortress','logistics','ew-superiority','artillery','ewar'];
      DOCTRINE_BG_CLASSES.forEach(c => bgEl.classList.remove(c));
      // Map internal doctrine keys to CSS classes
      const bgClassMap = { blitzkrieg:'blitzkrieg', blitz:'blitzkrieg', fortress:'fortress', logistics:'logistics', ewar:'ew-superiority', ew:'ew-superiority', artillery:'artillery' };
      const bgClass = bgClassMap[doctrine] || 'blitzkrieg';
      bgEl.classList.add(bgClass);
    }

    // Update doctrine flag banner color
    const flagBanner = document.querySelector('.hs-flag-banner');
    if (flagBanner) {
      flagBanner.style.background = 'linear-gradient(180deg, ' + docInfo.color + 'cc 0%, ' + docInfo.color + '88 100%)';
      flagBanner.style.boxShadow = '0 0 20px ' + docInfo.color + '66, inset 0 0 12px ' + docInfo.color + '22';
    }
    
    // Update spawn/resume button
    const resumeBtn = $id('homeResumeBtn');
    if (resumeBtn) {
      // Update spawn label text and color
      const spawnLabel = resumeBtn.querySelector('.hs-spawn-label');
      const chevrons = resumeBtn.querySelector('.hs-spawn-chevrons');
      if (spawnLabel) {
        spawnLabel.style.color = docInfo.color;
        spawnLabel.style.textShadow = '0 0 10px ' + docInfo.color + '88';
        spawnLabel.textContent = saved ? ('▶ RESUME W' + lastWave) : 'SPAWN COMMAND';
      }
      if (chevrons) {
        const cvs = chevrons.querySelectorAll('.hs-spawn-chevron');
        cvs.forEach(c => { c.style.background = docInfo.color; c.style.filter = 'drop-shadow(0 0 3px ' + docInfo.color + ')'; });
      }
      
      if (saved) {
        resumeBtn.onclick = () => {
          home.style.display = 'none';
          $id('startOverlay').classList.add('hidden');
          G.state.started = true;
          updateHUD();
        };
      } else {
        resumeBtn.onclick = () => {
          home.style.display = 'none';
          $id('startOverlay').classList.remove('hidden');
        };
      }
    }
  } catch(e) {
    console.warn('Home screen render failed:', e.message);
  }
}

function renderStatsScreen() {
  try {
    const content = $id('statsContent');
    if (!content) return;
    content.innerHTML = '';
    
    const career = _loadCareerStats();
    const unlocked = _getUnlockedAchievements();
    const raw = localStorage.getItem(CFG.SAVE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    const doctrine = saved?.selectedDoctrine || G.state?.selectedDoctrine || 'blitzkrieg';
    
    // Current Run Section
    let html = '<div style="margin-bottom:24px;padding:16px;border:1px solid rgba(0,200,255,.3);border-radius:8px;background:rgba(0,200,255,.05)">';
    html += '<div style="font-size:12px;color:#00e5ff;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">CURRENT RUN</div>';
    html += '<div style="font-size:11px;color:#aabbcc;line-height:1.8">';
    html += '<div>Wave Reached: <span style="color:#fff">' + (saved?.wave || 1) + '</span></div>';
    html += '<div>Bosses Killed: <span style="color:#fff">' + GAME_STATS.bosses_killed_run + '</span></div>';
    html += '<div>Troops Deployed: <span style="color:#fff">' + GAME_STATS.troops_deployed_run + '</span></div>';
    html += '<div>Credits Earned: <span style="color:#fff">' + GAME_STATS.credits_earned + '</span></div>';
    html += '<div>Damage Dealt: <span style="color:#fff">' + GAME_STATS.damage_dealt + '</span></div>';
    html += '<div>Damage Taken: <span style="color:#fff">' + GAME_STATS.damage_taken + '</span></div>';
    html += '</div></div>';
    
    // Troop Roster
    html += '<div style="margin-bottom:24px;padding:16px;border:1px solid rgba(136,187,102,.3);border-radius:8px;background:rgba(136,187,102,.05)">';
    html += '<div style="font-size:12px;color:#88bb66;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">TROOP ROSTER</div>';
    html += '<div style="font-size:11px;color:#aabbcc;line-height:1.8">';
    const troopNames = { rifle: 'Rifle Squad', heavy: 'Heavy Team', medic: 'Combat Medic', ew: 'EW Specialist', grenadier: 'Grenadier', sniper: 'Sniper Team' };
    Object.keys(career.troops_by_type || {}).forEach(t => {
      const count = career.troops_by_type[t] || 0;
      html += '<div>' + troopNames[t] + ': <span style="color:#fff">' + count + '× deployed</span></div>';
    });
    html += '</div></div>';
    
    // Career Stats
    html += '<div style="margin-bottom:24px;padding:16px;border:1px solid rgba(0,200,255,.3);border-radius:8px;background:rgba(0,200,255,.05)">';
    html += '<div style="font-size:12px;color:#00e5ff;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">CAREER STATS</div>';
    html += '<div style="font-size:11px;color:#aabbcc;line-height:1.8">';
    html += '<div>Total Runs: <span style="color:#fff">' + (career.total_runs || 0) + '</span></div>';
    html += '<div>Total Bosses Killed: <span style="color:#fff">' + (career.total_bosses || 0) + '</span></div>';
    html += '<div>Total Troops Deployed: <span style="color:#fff">' + (career.total_troops || 0) + '</span></div>';
    const playHours = Math.floor((career.total_playtime_ms || 0) / 3600000);
    const playMins = Math.floor(((career.total_playtime_ms || 0) % 3600000) / 60000);
    html += '<div>Total Playtime: <span style="color:#fff">' + playHours + 'h ' + playMins + 'm</span></div>';
    html += '<div>Prestige Rank: <span style="color:#fff">' + (G.meta?.prestige || 0) + '</span></div>';
    html += '</div></div>';
    
    // Achievements
    html += '<div style="margin-bottom:24px;padding:16px;border:1px solid rgba(255,170,68,.3);border-radius:8px;background:rgba(255,170,68,.05)">';
    html += '<div style="font-size:12px;color:#ffaa44;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">ACHIEVEMENTS (' + Object.keys(unlocked).length + '/' + Object.keys(ACHIEVEMENTS).length + ')</div>';
    html += '<div style="font-size:10px;color:#aabbcc;line-height:1.8">';
    Object.values(ACHIEVEMENTS).forEach(ach => {
      const isUnlocked = unlocked[ach.id];
      html += '<div style="opacity:' + (isUnlocked ? '1' : '0.4') + '">' + (isUnlocked ? '✓' : '✗') + ' ' + ach.icon + ' ' + ach.name + '</div>';
    });
    html += '</div></div>';
    
    // Leaderboard
    html += '<div style="margin-bottom:24px;padding:16px;border:1px solid rgba(136,85,221,.3);border-radius:8px;background:rgba(136,85,221,.05)">';
    html += '<div style="font-size:12px;color:#bb88dd;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">TOP PRESTIGE</div>';
    html += '<div style="font-size:10px;color:#aabbcc;line-height:1.8">';
    MOCK_LEADERBOARD.forEach(player => {
      const isYou = player.prestige === (G.meta?.prestige || 0);
      html += '<div style="color:' + (isYou ? '#ffaa44' : '#aabbcc') + '">#' + player.rank + ' ' + player.name + ' - Rank ' + player.prestige + (isYou ? ' (YOU)' : '') + '</div>';
    });
    html += '</div></div>';
    
    content.innerHTML = html;
  } catch(e) {
    console.warn('Stats screen render failed:', e.message);
  }
}

function renderStoreSheet() {
  const body = $id('store-body');
  if (!body) return;
  body.innerHTML = '';

  // ── Store items ──────────────────────────────────────────────
  const STORE_ITEMS = [
    {
      id: 'autowav',
      title: 'Auto-Wave',
      price: '$0.99',
      badge: 'QoL',
      badgeColor: 'var(--cyan)',
      icon: '⚡',
      color: 'var(--cyan)',
      desc: 'Automatically launch the next wave after a short delay.',
      perks: [
        'Long-press the LAUNCH WAVE button to toggle Auto-Wave on/off',
        '5-second countdown between waves — stays active all run',
        'Shows countdown bar on the wave summary screen',
      ],
      owned: _autoWaveUnlocked,
    },
    {
      id: 'quickbuy',
      title: 'Quick Buy Pack',
      price: '$0.99',
      badge: 'UTILITY',
      badgeColor: 'var(--amber)',
      icon: '🛒',
      color: 'var(--amber)',
      desc: 'One-tap upgrade buttons on Research and Barracks.',
      perks: [
        '⚡ Buy All on Research — queues every affordable upgrade instantly',
        '⚡ Buy All on Barracks — heals all troops + promotes everyone you can afford',
      ],
      owned: _quickBuyUnlocked,
    },
    {
      id: 'supporter',
      title: 'Supporter Pack',
      price: '$4.99',
      badge: 'POPULAR',
      badgeColor: 'var(--green)',
      icon: '🎖',
      color: '#60c878',
      desc: 'Boost your speed and unlock key units early.',
      perks: [
        '×5 Speed unlock — play faster',
        'Orbital Strike unlocked immediately',
        'Heavy Team pre-unlocked (skip Wave 15 grind)',
        'Grenadier pre-unlocked (skip Wave 25 grind)',
        'Supporter badge in HUD',
      ],
      owned: localStorage.getItem('ifc_iap_supporter') === '1',
      includedWithCommander: localStorage.getItem('ifc_iap_commander') === '1',
    },
    {
      id: 'commander',
      title: 'Commander Edition',
      price: '$19.99',
      badge: 'BEST VALUE',
      badgeColor: '#ffd166',
      icon: '👑',
      color: '#b08cff',
      desc: 'The full arsenal. Everything unlocked, nothing held back.',
      perks: [
        '×10 Speed (exclusive — members only)',
        'All 6 troop classes pre-unlocked from start',
        'All doctrines available immediately',
        'Commander base skin (exclusive visual)',
        '+50 bonus credits every run',
        'Commander rank badge in HUD',
        'Includes Quick Buy Pack + Auto-Wave',
      ],
      owned: localStorage.getItem('ifc_iap_commander') === '1',
    },
  ];

  // Section header
  const intro = document.createElement('div');
  intro.style.cssText = 'text-align:center;padding:8px 0 16px;font-family:"Share Tech Mono",monospace;font-size:9px;color:var(--muted);letter-spacing:1px;line-height:1.6;';
  intro.textContent = 'All purchases are one-time · No subscriptions · Restore Purchases below';
  body.appendChild(intro);

  STORE_ITEMS.forEach(function(item) {
    const card = document.createElement('div');
    // Owned: grayed out, not green
    const isOwned = item.owned;
    card.style.cssText =
      'border:1px solid ' + (isOwned ? 'rgba(255,255,255,.12)' : item.color + '55') + ';' +
      'border-radius:14px;padding:14px 14px;margin-bottom:12px;' +
      'background:' + (isOwned ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.35)') + ';' +
      'position:relative;overflow:hidden;' +
      (isOwned ? 'opacity:.55;' : '');

    // Accent bar — gray if owned
    card.innerHTML = '<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:' + (isOwned ? 'rgba(255,255,255,.2)' : item.color) + ';border-radius:3px 0 0 3px"></div>';

    // Badge — hide if owned
    if (item.badge && !isOwned) {
      card.innerHTML += '<div style="position:absolute;top:10px;right:10px;padding:2px 8px;border-radius:10px;background:' + item.badgeColor + '22;border:1px solid ' + item.badgeColor + '66;font-family:\'Share Tech Mono\',monospace;font-size:7.5px;color:' + item.badgeColor + ';letter-spacing:1px">' + item.badge + '</div>';
    }

    // Header
    const titleColor = isOwned ? 'rgba(180,190,200,.5)' : item.color;
    card.innerHTML +=
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding-left:6px">' +
        '<span style="font-size:22px;' + (isOwned ? 'filter:grayscale(1);opacity:.5' : '') + '">' + item.icon + '</span>' +
        '<div>' +
          '<div style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:18px;color:' + titleColor + '">' + item.title + '</div>' +
          '<div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;color:var(--muted);margin-top:1px">' + item.desc + '</div>' +
        '</div>' +
      '</div>';

    // Perks list
    const perkColor = isOwned ? 'rgba(150,160,170,.5)' : '#c8d8e8';
    const checkColor = isOwned ? 'rgba(150,160,170,.4)' : item.color;
    const perkList = item.perks.map(function(p) {
      return '<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:4px">' +
        '<span style="color:' + checkColor + ';flex-shrink:0;font-size:10px;margin-top:1px">✓</span>' +
        '<span style="font-family:\'Share Tech Mono\',monospace;font-size:8.5px;color:' + perkColor + ';line-height:1.4">' + p + '</span>' +
      '</div>';
    }).join('');
    card.innerHTML += '<div style="padding-left:6px;margin-bottom:12px">' + perkList + '</div>';

    // Buy button or owned state
    let buttonText = '';
    if (item.includedWithCommander) {
      buttonText = 'INCLUDED WITH COMMANDER EDITION';
    } else if (isOwned) {
      buttonText = 'PURCHASED';
    } else {
      buttonText = 'Purchase ' + item.price;
    }
    
    if (item.includedWithCommander || isOwned) {
      card.innerHTML += '<div style="text-align:center;padding:9px;border-radius:9px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:14px;color:rgba(180,190,200,.45)">' + buttonText + '</div>';
    } else {
      const btn = document.createElement('button');
      btn.style.cssText = 'width:100%;padding:11px;border-radius:10px;border:1px solid ' + item.color + ';background:' + item.color + '18;color:' + item.color + ';font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:16px;cursor:pointer;-webkit-appearance:none;letter-spacing:.5px;';
      btn.textContent = buttonText;
      btn.addEventListener('click', function() { _storePurchase(item.id); });
      card.appendChild(btn);
    }

    body.appendChild(card);
  });

  // Restore purchases button
  const restore = document.createElement('button');
  restore.style.cssText = 'width:100%;padding:10px;border-radius:9px;border:1px solid var(--line);background:transparent;color:var(--muted);font-family:\'Share Tech Mono\',monospace;font-size:9px;cursor:pointer;-webkit-appearance:none;margin-top:4px;letter-spacing:1px;';
  restore.textContent = 'Restore Purchases';
  restore.addEventListener('click', function() { showToast('Restore Purchases — IAP not yet connected'); });
  body.appendChild(restore);
}

// IAP stub — replace with RevenueCat calls in Capacitor wrapper
function _storePurchase(id) {
  const ok = confirm(_storeConfirmMessage(id));
  if (!ok) return;
  _storeApplyPurchase(id);
}

// Restore IAP purchases from localStorage (persists across prestige)
function _restoreIAPPurchases() {
  try {
    const s = G.state;
    if (!s) return; // Safety check
    
    // ALWAYS initialize Rifle Squad as unlocked
    _initUnlockState(s);
    console.log('🔄 Initialized unlock state (Rifle Squad unlocked)');
    
    console.log('🔄 Checking for IAP purchases to restore...');
    
    // Restore Supporter Pack
    if (localStorage.getItem('ifc_iap_supporter') === '1') {
      try {
        console.log('🔄 Restoring Supporter Pack');
        if (!s._unlockedUnits) s._unlockedUnits = {};
        s._unlockedUnits.heavy = true;
        s._unlockedUnits.grenadier = true;
        
        // Apply unlock rewards if function exists
        if (typeof _applyUnlockReward === 'function') {
          _applyUnlockReward('heavy', s);
          _applyUnlockReward('grenadier', s);
          console.log('✓ Applied unlock rewards');
        }
        
        // Add ×5 speed if array exists
        if (typeof _speeds !== 'undefined' && Array.isArray(_speeds)) {
          if (!_speeds.find(function(sp) { return sp.val === 5; })) {
            _speeds.splice(3, 0, { val: 5, label: '5×', cls: 's3' });
            console.log('✓ Restored ×5 speed');
          }
        }
        
        s._orbPurchaseUnlocked = true;
        console.log('✓ Restored Supporter Pack');
      } catch(e) {
        console.error('⚠️ Supporter restore error:', e.message);
      }
    }
    
    // Restore Commander Edition
    if (localStorage.getItem('ifc_iap_commander') === '1') {
      try {
        console.log('🔄 Restoring Commander Edition');
        if (!s._unlockedUnits) s._unlockedUnits = {};
        
        // Unlock all 5 troops
        ['heavy','medic','ew','grenadier','sniper'].forEach(function(u) {
          s._unlockedUnits[u] = true;
          if (typeof _applyUnlockReward === 'function') {
            _applyUnlockReward(u, s);
          }
        });
        console.log('✓ Unlocked all troops');
        
        // Add ×10 speed if array exists
        if (typeof _speeds !== 'undefined' && Array.isArray(_speeds)) {
          if (!_speeds.find(function(sp) { return sp.val === 10; })) {
            _speeds.push({ val: 10, label: '10×', cls: 's6' });
            console.log('✓ Restored ×10 speed');
          }
        }
        
        s._orbPurchaseUnlocked = true;
        
        // Commander includes Quick Buy + Auto-Wave
        _quickBuyUnlocked = true;
        _autoWaveUnlocked = true;
        
        console.log('✓ Restored Commander Edition');
      } catch(e) {
        console.error('⚠️ Commander restore error:', e.message);
      }
    }
    
    // Restore Auto-Wave
    if (localStorage.getItem('ifc_autowav') === '1') {
      try {
        console.log('🔄 Restoring Auto-Wave');
        _autoWaveUnlocked = true;
        if (typeof _updateAutowavStrip === 'function') _updateAutowavStrip();
      } catch(e) {
        console.error('⚠️ Auto-Wave restore error:', e.message);
      }
    }
    
    // Restore Quick Buy
    if (localStorage.getItem('ifc_quickbuy') === '1') {
      try {
        console.log('🔄 Restoring Quick Buy');
        _quickBuyUnlocked = true;
        if (typeof _updateQuickBuyButtons === 'function') _updateQuickBuyButtons();
      } catch(e) {
        console.error('⚠️ Quick Buy restore error:', e.message);
      }
    }
    
    // Re-render UI to show restored unlocks
    if (typeof renderStoreSheet === 'function') {
      renderStoreSheet();
      console.log('✓ Re-rendered store');
    }
    if (typeof updateHUD === 'function') {
      updateHUD();
      console.log('✓ Updated HUD');
    }
    
    console.log('✓ IAP restoration complete');
  } catch(e) {
    console.error('⚠️ IAP restoration failed:', e.message, e.stack);
  }
}

function _storeConfirmMessage(id) {
  if (id === 'autowav')    return 'Auto-Wave — $0.99\nLong-press LAUNCH WAVE to toggle automatic wave start.\n\nPermanent unlock (persists after prestige).\nPurchase now?';
  if (id === 'supporter')  return 'Supporter Pack — $4.99\n×5 speed + Heavy & Grenadier unlocked + Orbital Strike\n\nPermanent unlock (persists after prestige).\nPurchase now?';
  if (id === 'commander')  return 'Commander Edition — $19.99\nAll troops unlocked + ×10 speed + Quick Buy + Orbital Strike\n\nPermanent unlock (persists after prestige).\nPurchase now?';
  if (id === 'quickbuy')   return 'Quick Buy Pack — $0.99\n⚡ Buy All buttons on Research & Barracks\n\nPermanent unlock (persists after prestige).\nPurchase now?';
  return 'Purchase?';
}

function _storeApplyPurchase(id) {
  const s = G.state;
  if (id === 'autowav') {
    localStorage.setItem('ifc_autowav', '1');
    _autoWaveUnlocked = true;
    haptic('success'); showToast('⚡ Auto-Wave unlocked!');
    _updateAutowavStrip();
  } else if (id === 'supporter') {
    console.log('🌟 Supporter Pack Purchase Started');
    localStorage.setItem('ifc_iap_supporter', '1');
    
    // Ensure state exists
    if (!G.state._unlockedUnits) G.state._unlockedUnits = {};
    console.log('📦 Before unlock:', G.state._unlockedUnits);
    
    // Unlock Heavy + Grenadier
    G.state._unlockedUnits.heavy = true;
    G.state._unlockedUnits.grenadier = true;
    console.log('📦 After setting flags:', G.state._unlockedUnits);
    
    if (typeof _applyUnlockReward === 'function') {
      _applyUnlockReward('heavy', G.state);
      console.log('✓ Applied reward for heavy');
    } else {
      console.warn('⚠️ _applyUnlockReward not found!');
    }
    
    if (typeof _applyUnlockReward === 'function') {
      _applyUnlockReward('grenadier', G.state);
      console.log('✓ Applied reward for grenadier');
    }
    console.log('✓ Unlocked: heavy, grenadier');
    
    // Add ×5 speed to cycle
    if (typeof _speeds !== 'undefined' && Array.isArray(_speeds)) {
      if (!_speeds.find(function(sp) { return sp.val === 5; })) {
        _speeds.splice(3, 0, { val: 5, label: '5×', cls: 's3' });
        console.log('✓ Added ×5 speed. Current speeds:', _speeds.map(s => s.val).join(','));
      } else {
        console.log('⚠️ ×5 speed already exists');
      }
    } else {
      console.warn('⚠️ _speeds not initialized!');
    }
    
    // Unlock Orbital Strike
    G.state._orbPurchaseUnlocked = true;
    console.log('✓ Orbital Strike unlocked');
    
    if (typeof haptic === 'function') haptic('success');
    if (typeof showToast === 'function') {
      showToast('⭐ Supporter Pack activated! Heavy, Grenadier, Orbital Strike unlocked!');
      console.log('✓ Toast shown');
    } else {
      console.warn('⚠️ showToast not found!');
    }
    
    renderStoreSheet();
    updateHUD();
    console.log('✓ Rendered UI');
    console.log('🌟 Supporter Pack Complete');
    
  } else if (id === 'commander') {
    console.log('👑 Commander Edition Purchase Started');
    localStorage.setItem('ifc_iap_commander', '1');
    
    // Ensure state exists
    if (!G.state._unlockedUnits) G.state._unlockedUnits = {};
    console.log('📦 Before unlock:', G.state._unlockedUnits);
    
    // Unlock all 5 troop types
    ['heavy','medic','ew','grenadier','sniper'].forEach(function(u) {
      G.state._unlockedUnits[u] = true;
      console.log('🔓 Setting:', u, 'to true');
    });
    console.log('📦 After setting flags:', G.state._unlockedUnits);
    
    // Apply unlock rewards
    ['heavy','medic','ew','grenadier','sniper'].forEach(function(u) {
      if (typeof _applyUnlockReward === 'function') {
        _applyUnlockReward(u, G.state);
        console.log('✓ Applied reward for:', u);
      }
    });
    
    // Unlock Orbital Strike
    G.state._orbPurchaseUnlocked = true;
    console.log('✓ Orbital Strike unlocked');
    
    // Add ×10 speed
    if (typeof _speeds !== 'undefined' && Array.isArray(_speeds)) {
      if (!_speeds.find(function(sp) { return sp.val === 10; })) {
        _speeds.push({ val: 10, label: '10×', cls: 's6' });
        console.log('✓ Added ×10 speed. Current speeds:', _speeds.map(s => s.val).join(','));
      } else {
        console.log('⚠️ ×10 speed already exists');
      }
    } else {
      console.warn('⚠️ _speeds not initialized!');
    }
    
    // Apply Quick Buy + Auto-Wave (directly, don't recurse)
    localStorage.setItem('ifc_quickbuy', '1');
    _quickBuyUnlocked = true;
    if (typeof _updateQuickBuyButtons === 'function') _updateQuickBuyButtons();
    console.log('✓ Quick Buy unlocked');
    
    localStorage.setItem('ifc_autowav', '1');
    _autoWaveUnlocked = true;
    if (typeof _updateAutowavStrip === 'function') _updateAutowavStrip();
    console.log('✓ Auto-Wave unlocked');
    
    if (typeof haptic === 'function') haptic('success');
    if (typeof showToast === 'function') {
      showToast('👑 Commander Edition activated! All troops, ×10 speed, Orbital Strike unlocked!');
      console.log('✓ Toast shown');
    } else {
      console.warn('⚠️ showToast not found!');
    }
    
    console.log('👑 Commander Edition Complete');
  } else if (id === 'quickbuy') {
    localStorage.setItem('ifc_quickbuy', '1');
    _quickBuyUnlocked = true;
    _updateQuickBuyButtons();
    haptic('success'); showToast('⚡ Quick Buy unlocked!');
  }
  renderStoreSheet();
  updateHUD();
}

// ── Controller-side SFX additions ─────────────────────────────
function _sfxBreachBase() {
  try {
    ensureAudio();
    var ac = (typeof _ctx !== 'undefined') ? _ctx : null;
    if (!ac) return;
    var o1 = ac.createOscillator(), g1 = ac.createGain();
    o1.type = 'sawtooth'; o1.frequency.value = 55;
    g1.gain.setValueAtTime(0.0001, ac.currentTime);
    g1.gain.linearRampToValueAtTime(0.15, ac.currentTime + 0.02);
    g1.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.6);
    o1.connect(g1); g1.connect(ac.destination);
    o1.start(); o1.stop(ac.currentTime + 0.65);
    var o2 = ac.createOscillator(), g2 = ac.createGain();
    o2.type = 'square'; o2.frequency.value = 72;
    g2.gain.setValueAtTime(0.0001, ac.currentTime + 0.04);
    g2.gain.linearRampToValueAtTime(0.08, ac.currentTime + 0.06);
    g2.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35);
    o2.connect(g2); g2.connect(ac.destination);
    o2.start(ac.currentTime + 0.04); o2.stop(ac.currentTime + 0.4);
  } catch(e) {}
}

function _sfxPromotion() {
  try { ensureAudio(); playSfx('victory'); } catch(e) {}
}

function _sfxResearchDone() {
  try { ensureAudio(); playSfx('rankUp'); } catch(e) {}
}

function _sfxWaveCleared() {
  try { ensureAudio(); playSfx('victory'); } catch(e) {}
}

// Unlock available — rising 2-note chime, distinct from promotion
function _sfxUnlockAvailable() {
  try {
    ensureAudio();
    var ac = (typeof _ctx !== 'undefined') ? _ctx : null;
    if (!ac) return;
    [[440, 0], [660, 0.12], [880, 0.24]].forEach(function(pair) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle'; o.frequency.value = pair[0];
      g.gain.setValueAtTime(0.0001, ac.currentTime + pair[1]);
      g.gain.linearRampToValueAtTime(0.045, ac.currentTime + pair[1] + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + pair[1] + 0.18);
      o.connect(g); g.connect(ac.destination);
      o.start(ac.currentTime + pair[1]); o.stop(ac.currentTime + pair[1] + 0.22);
    });
  } catch(e) {}
}

// Chapter transition — deep resonant chord swell
function _sfxChapterTransition() {
  try {
    ensureAudio();
    var ac = (typeof _ctx !== 'undefined') ? _ctx : null;
    if (!ac) return;
    [[110, 0, 'sawtooth', .06], [165, 0.1, 'sine', .04], [220, 0.2, 'triangle', .03]].forEach(function(p) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = p[2]; o.frequency.value = p[0];
      g.gain.setValueAtTime(0.0001, ac.currentTime + p[1]);
      g.gain.linearRampToValueAtTime(p[3], ac.currentTime + p[1] + 0.3);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + p[1] + 1.8);
      o.connect(g); g.connect(ac.destination);
      o.start(ac.currentTime + p[1]); o.stop(ac.currentTime + p[1] + 2.0);
    });
  } catch(e) {}
}

// ── Ambient sound system ───────────────────────────────────────
// Runs continuously while game is active
let _ambientNodes = null;
let _heartbeatInterval = null;
let _lastHeartbeatHp = 1;

function _startAmbient() {
  try {
    var ac = (typeof _ctx !== 'undefined') ? _ctx : null;
    if (!ac || _ambientNodes) return;

    // Wind noise removed — caused white noise on mobile devices

    // ── Background music — simple pentatonic minor melody ──
    // Notes in A minor pentatonic: A2, C3, D3, E3, G3 (in Hz)
    // Two-bar phrase that loops: feels tense without being annoying
    var melody = [
      { f: 110.0, d: 0.6, v: 0.018 },  // A2 — root, long
      { f: 0,     d: 0.2, v: 0     },  // rest
      { f: 130.8, d: 0.4, v: 0.014 },  // C3
      { f: 146.8, d: 0.4, v: 0.014 },  // D3
      { f: 0,     d: 0.3, v: 0     },  // rest
      { f: 164.8, d: 0.5, v: 0.016 },  // E3
      { f: 0,     d: 0.2, v: 0     },  // rest
      { f: 196.0, d: 0.3, v: 0.012 },  // G3 — higher tension
      { f: 164.8, d: 0.3, v: 0.012 },  // E3 back down
      { f: 0,     d: 0.4, v: 0     },  // rest
      { f: 110.0, d: 0.8, v: 0.018 },  // A2 — resolve to root
      { f: 0,     d: 0.5, v: 0     },  // long rest
    ];

    var melodyGain = ac.createGain();
    melodyGain.gain.value = 1.0;
    melodyGain.connect(ac.destination);

    var melStep = 0;
    var melScheduled = false;

    function _scheduleMelStep() {
      if (melScheduled) return;
      melScheduled = false;
      try {
        var note = melody[melStep % melody.length];
        melStep++;
        if (note.f > 0) {
          var o = ac.createOscillator();
          var g = ac.createGain();
          o.type = 'triangle'; // triangle is warmer and less harsh than sine
          o.frequency.value = note.f;
          var now = ac.currentTime;
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(note.v, now + 0.06);  // quick attack
          g.gain.setValueAtTime(note.v, now + note.d * 0.7);
          g.gain.linearRampToValueAtTime(0.0001, now + note.d); // fade out
          o.connect(g); g.connect(melodyGain);
          o.start(now); o.stop(now + note.d + 0.05);
        }
        var melInterval2 = setTimeout(_scheduleMelStep, note.d * 1000);
        _ambientNodes._melTimer = melInterval2;
      } catch(e2) {}
    }

    _ambientNodes = { melodyGain, _melTimer: null };
    _scheduleMelStep(); // kick off melody

  } catch(e) {}
}

function _stopAmbient() {
  try {
    if (_ambientNodes) {
      var t = (typeof _ctx !== 'undefined' && _ctx) ? _ctx.currentTime : 0;
      if (_ambientNodes.melodyGain) _ambientNodes.melodyGain.gain.setTargetAtTime(0, t, 0.3);
      if (_ambientNodes._melTimer) clearTimeout(_ambientNodes._melTimer);
      if (_ambientNodes.droneGain) _ambientNodes.droneGain.gain.setTargetAtTime(0, t, 0.3);
      if (_ambientNodes.droneInterval) clearInterval(_ambientNodes.droneInterval);
      _ambientNodes = null;
    }
  } catch(e) {}
}

function _tickAmbientAndHeartbeat() {
  try {
    var ac = (typeof _ctx !== 'undefined') ? _ctx : null;
    if (!ac || !G.state || !G.state.started) return;
    var s = G.state;
    var hpf = s.baseHp / (s.maxBaseHp || 100);

    // Wind removed — no wind gain to update

    // Heartbeat: only below 40% HP
    if (hpf < 0.40 && hpf > 0) {
      var bpm = 60 + Math.round((1 - hpf) * 80); // 60-140 BPM based on damage
      var interval = Math.round(60000 / bpm);
      if (!_heartbeatInterval || Math.abs(_lastHeartbeatHp - hpf) > 0.05) {
        _lastHeartbeatHp = hpf;
        if (_heartbeatInterval) clearInterval(_heartbeatInterval);
        _heartbeatInterval = setInterval(function() {
          if (!G.state || G.state.gameOver || G.state.baseHp / G.state.maxBaseHp >= 0.40) {
            clearInterval(_heartbeatInterval);
            _heartbeatInterval = null;
            return;
          }
          _playHeartbeat(G.state.baseHp / G.state.maxBaseHp);
        }, interval);
      }
    } else if (_heartbeatInterval && hpf >= 0.40) {
      clearInterval(_heartbeatInterval);
      _heartbeatInterval = null;
    }
  } catch(e) {}
}

function _playHeartbeat(hpf) {
  try {
    var ac = (typeof _ctx !== 'undefined') ? _ctx : null;
    if (!ac) return;
    var vol = 0.04 + (1 - hpf) * 0.08; // louder as HP drops
    var freq = 55 + (1 - hpf) * 20;    // slightly higher pitch when critical
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.linearRampToValueAtTime(vol, ac.currentTime + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.12);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.15);
    // Double beat (lub-dub)
    var o2 = ac.createOscillator(), g2 = ac.createGain();
    o2.type = 'sine'; o2.frequency.value = freq * 0.85;
    g2.gain.setValueAtTime(0.0001, ac.currentTime + 0.14);
    g2.gain.linearRampToValueAtTime(vol * 0.7, ac.currentTime + 0.155);
    g2.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.28);
    o2.connect(g2); g2.connect(ac.destination);
    o2.start(ac.currentTime + 0.14); o2.stop(ac.currentTime + 0.30);
  } catch(e) {}
}
let _autoWave = false;
let _autoWaveTimer = null;
const AUTO_WAVE_DELAY = 5; // seconds between wave end and auto-start
// Auto-wave is a $0.99 IAP — true by default for dev testing
let _autoWaveUnlocked = localStorage.getItem('ifc_autowav') === '1';

function _scheduleAutoWave() {
  clearTimeout(_autoWaveTimer);
  if (!_autoWave) return;
  _autoWaveTimer = setTimeout(function() {
    const s = G.state;
    if (!s || !s.started || s.waveInProgress || s.gameOver || s.paused) return;
    // Only auto-start if all overlays are clear
    if (!isOverlayClear()) { _scheduleAutoWave(); return; }
    $id('waveBtn').click();
  }, AUTO_WAVE_DELAY * 1000);
}

$id('waveBtn').addEventListener('click', () => {
  ensureAudio();
  const s = G.state;
  if (!s.started) { $id('beginBtn').click(); return; }
  _obActionTaken('wave');
  if (!s.waveInProgress) {
    const isBoss = s.wave % CFG.BOSS_WAVE_EVERY === 0;
    s.paused = true;
    showCountdown(isBoss, () => {
      s.paused = false;
      startWave(onBossAlert, onModifier, onFirstRunHint);
      updateHUD();
    });
  }
  updateHUD();
});

// Auto-wave toggle moved to strip above battlefield

$id('pauseBtn').addEventListener('click', () => {
  const s = G.state;
  if (!s.started || s.gameOver) return;
  s.paused = !s.paused;
  const pauseMenu = $id('pauseMenuOverlay');
  if (pauseMenu) {
    pauseMenu.style.display = s.paused ? 'flex' : 'none';
  }
  updateHUD();
});

// Pause menu buttons
$id('pauseResumeBtn')?.addEventListener('click', () => {
  G.state.paused = false;
  $id('pauseMenuOverlay').style.display = 'none';
  $id('settingsPanel').style.display = 'none';
  updateHUD();
});

$id('pauseSettingsBtn')?.addEventListener('click', () => {
  $id('pauseMenuOverlay').style.display = 'none';
  $id('settingsPanel').style.display = 'flex';
});

$id('pauseCareerBtn')?.addEventListener('click', () => {
  G.state.paused = false;
  $id('pauseMenuOverlay').style.display = 'none';
  $id('settingsPanel').style.display = 'none';
  renderMetaUI();
  $id('metaOverlay').style.display = 'block';
  updateHUD();
});

$id('pauseExitBtn')?.addEventListener('click', () => {
  if (confirm('Exit to doctrine select? Your run will be lost.')) {
    localStorage.removeItem(CFG.SAVE_KEY);
    G.state = freshState(G.meta.prestige);
    G.state.paused = false;
    $id('pauseMenuOverlay').style.display = 'none';
    $id('settingsPanel').style.display = 'none';
    $id('startOverlay').classList.remove('hidden');
    updateHUD();
  }
});

// Settings panel buttons
$id('settingsCloseBtn')?.addEventListener('click', () => {
  $id('settingsPanel').style.display = 'none';
  $id('pauseMenuOverlay').style.display = 'flex';
});

// Sound controls
let _soundUIEnabled = localStorage.getItem('ifc_sound_enabled') !== '0';
function _updateSoundUI() {
  const btn = $id('soundToggleBtn');
  const slider = $id('volumeSlider');
  if (btn) btn.textContent = _soundUIEnabled ? '🔊' : '🔇';
  if (slider) slider.style.opacity = _soundUIEnabled ? '1' : '0.3';
}

$id('soundToggleBtn')?.addEventListener('click', () => {
  _soundUIEnabled = !_soundUIEnabled;
  localStorage.setItem('ifc_sound_enabled', _soundUIEnabled ? '1' : '0');
  setSoundEnabled(_soundUIEnabled);
  _updateSoundUI();
  showToast(_soundUIEnabled ? '🔊 Sound enabled' : '🔇 Sound disabled');
});

$id('volumeSlider')?.addEventListener('input', (e) => {
  const vol = parseInt(e.target.value);
  localStorage.setItem('ifc_volume', vol.toString());
  $id('volumeLabel').textContent = vol + '%';
  _soundUIEnabled = vol > 0;
  localStorage.setItem('ifc_sound_enabled', _soundUIEnabled ? '1' : '0');
  setMasterVolume(vol / 100);
  setSoundEnabled(_soundUIEnabled);
  _updateSoundUI();
});

// Initialize sound UI
(function() {
  const savedVol = parseInt(localStorage.getItem('ifc_volume') || '100');
  const slider = $id('volumeSlider');
  if (slider) slider.value = savedVol;
  const label = $id('volumeLabel');
  if (label) label.textContent = savedVol + '%';
  // Apply saved volume to audio engine
  setMasterVolume(savedVol / 100);
  setSoundEnabled(_soundUIEnabled);
  _updateSoundUI();
})();

// ── HOME SCREEN BUTTONS ────────────────────────────────────────────
