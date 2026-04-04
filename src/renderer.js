// ─────────────────────────────────────────────────────────────
//  iOS CONTROLLER
//  Wires the redesigned portrait UI to the existing game engine
// ─────────────────────────────────────────────────────────────

const canvas = document.getElementById('battlefield');
const ctx    = canvas ? canvas.getContext('2d') : null;

// ── Troop sprite preloader ─────────────────────────────────
const TROOP_SPRITES = {};
const TROOP_SPRITE_MAP = {
  rifle:     'assets/troops/rifle_squad.png',
  heavy:     'assets/troops/heavy_team.png',
  medic:     'assets/troops/combat_medic.png',
  grenadier: 'assets/troops/grenadier.png',
  ew:        'assets/troops/ew_specialist.png',
  sniper:    'assets/troops/sniper_team.png',
};
Object.entries(TROOP_SPRITE_MAP).forEach(([id, src]) => {
  const img = new Image();
  img.src = src;
  TROOP_SPRITES[id] = img;
});

function $id(id) {
  const el = document.getElementById(id);
  if (el) return el;
  // Return a no-op proxy so .textContent = x, .style.x = y, .addEventListener etc.
  // all silently do nothing instead of crashing
  return new Proxy({}, {
    get(_, prop) {
      if (prop === 'classList') return { add:()=>{}, remove:()=>{}, toggle:()=>{}, contains:()=>false };
      if (prop === 'style')     return new Proxy({}, { set:()=>true, get:()=>'' });
      if (prop === 'innerHTML' || prop === 'textContent' || prop === 'value') return '';
      if (prop === 'disabled' || prop === 'checked') return false;
      if (typeof prop === 'string') return () => {};
      return undefined;
    },
    set() { return true; }
  });
}
function showOverlay(id) { $id(id).classList.remove('hidden'); }
function hideOverlay(id) { $id(id).classList.add('hidden'); }
function isOverlayClear() {
  return ['rewardOverlay','summaryOverlay','gameoverOverlay','prestigeOverlay']
    .every(id => $id(id).classList.contains('hidden'));
}

// ── Sheet helpers ─────────────────────────────────────────────
function openSheet(sheetId, backdropId) {
  const s = $id(sheetId), b = $id(backdropId);
  s.style.display = 'block';
  b.classList.add('open');
  requestAnimationFrame(() => s.classList.add('open'));
}
function closeSheet(sheetId, backdropId) {
  const s = $id(sheetId), b = $id(backdropId);
  s.classList.remove('open');
  b.classList.remove('open');
  setTimeout(() => { s.style.display = 'none'; }, 320);
}
// Close on backdrop tap
$id('enlist-backdrop').addEventListener('click',   () => closeSheet('enlist-sheet',   'enlist-backdrop'));
$id('research-backdrop').addEventListener('click',  () => closeSheet('research-sheet', 'research-backdrop'));
$id('enlist-close').addEventListener('click',   () => closeSheet('enlist-sheet',   'enlist-backdrop'));
$id('research-close').addEventListener('click',  () => closeSheet('research-sheet', 'research-backdrop'));

// ── Shared log helper ─────────────────────────────────────────
function addLog(msg, type = '') {
  const ts = new Date().toLocaleTimeString('en', {hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
  // No visible log pane in portrait — just keep in G for intel drawer
  const drawerLog = $id('drawerLog');
  if (drawerLog) {
    const d = document.createElement('div');
    d.className = 'log-entry ' + type;
    d.textContent = '[' + ts + '] ' + msg;
    drawerLog.prepend(d);
    while (drawerLog.children.length > 60) drawerLog.removeChild(drawerLog.lastChild);
  }
}

// ── Error display helper ──────────────────────────────────────
function _showErr(label, err) {
  let dbg = document.getElementById('_err_overlay');
  if (!dbg) {
    dbg = document.createElement('div');
    dbg.id = '_err_overlay';
    dbg.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:rgba(30,0,0,.97);color:#ff9090;font:11px monospace;padding:10px;word-break:break-all;white-space:pre-wrap;max-height:60vh;overflow:auto;border-bottom:2px solid #f00;';
    document.body.appendChild(dbg);
  }
  dbg.textContent += '\n[' + label + '] ' + err.toString() + '\n' + (err.stack||'').split('\n').slice(0,3).join('\n') + '\n---';
}

// ── Bootstrap engine ──────────────────────────────────────────
try { G.meta  = loadMeta(); } catch(e) { _showErr('loadMeta', e); G.meta = { prestige:0, totalRuns:0, bestWave:0, totalKills:0, totalBosses:0, totalCredits:0, docRuns:{}, runHistory:[] }; }
try { G.state = freshState(G.meta.prestige); } catch(e) { _showErr('freshState', e); }
G.log   = addLog;
G.canvasWidth = () => canvas.width;
try { loadGame(); } catch(e) { _showErr('loadGame', e); }
// Restore quest progress from meta if available (persists through prestige)
try { if (G.meta._quests && !G.state._quests) G.state._quests = JSON.parse(JSON.stringify(G.meta._quests)); } catch(e) {}
try { applyDoctrine(); } catch(e) { _showErr('applyDoctrine', e); }
try { applyUpgrades(); } catch(e) { _showErr('applyUpgrades', e); }
try { _restoreIAPPurchases(); } catch(e) { _showErr('restoreIAP', e); }

// Show Home Screen on app start
(function() {
  try {
    _initRunStats();
    
    // Check if first time
    if (_isFirstTime()) {
      console.log('👋 First time player - showing tutorial');
      // Show tutorial modal over home screen
      showToast('Welcome, Commander! Tap the question mark for tutorial.');
      _markFirstTimeDone();
    }
    
    // Render and show home screen
    renderHomeScreen();
    const homeScreen = $id('homeScreen');
    const startOv = $id('startOverlay');
    if (homeScreen) {
      homeScreen.style.display = 'flex';
      console.log('✓ Home screen displayed');
    }
    if (startOv) {
      startOv.classList.add('hidden');
    }
  } catch(e) {
    console.warn('Home screen init failed:', e.message);
  }
})();

// ── Canvas resize (vertical orientation) ─────────────────────
function resizeCanvasVertical() {
  const wrap = $id('battlefield-wrap');
  if (!wrap || !canvas) return;
  const r = wrap.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const w = Math.floor(r.width  * ratio);
  const h = Math.floor(r.height * ratio);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width  = w;
    canvas.height = h;
  }
}

// ── Vertical renderer ─────────────────────────────────────────
// Transforms the original horizontal battlefield into vertical:
// enemies come from top (treeline), base is at bottom (fortified camp)
function drawVertical(state) {
  if (!ctx || !canvas) return;
  const W = canvas.width, H = canvas.height;
  const dpr = window.devicePixelRatio || 1;
  const t = state.time;

  // Charcoal black base — required for crimson silhouette contrast per art spec
  ctx.fillStyle = '#0a0b0c';
  ctx.fillRect(0, 0, W, H);

  // ── Map coordinate transform ──────────────────────────────
  const ORIG_W = 1400;
  const colW   = W / 3;
  const laneX  = [colW * 0.5, colW * 1.5, colW * 2.5];
  const baseH  = 70 * dpr;
  const treeH  = 52 * dpr;

  function mapLane(lane) { return laneX[lane]; }

  // ── BATTLEFIELD SKY — dark oppressive warzone atmosphere ──────
  const skyGrad = ctx.createLinearGradient(0, 0, 0, treeH + 20*dpr);
  skyGrad.addColorStop(0,   '#080c0a');
  skyGrad.addColorStop(0.4, '#0d1408');
  skyGrad.addColorStop(1,   '#121a0c');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, treeH + 20*dpr);

  // ── WARZONE GROUND — scorched, churned, layered dirt ──────────
  const fieldH = H - baseH - treeH;

  // Base ground — dark churned earth
  const groundGrad = ctx.createLinearGradient(0, treeH, 0, H - baseH);
  groundGrad.addColorStop(0,   '#1a1208');
  groundGrad.addColorStop(0.2, '#221808');
  groundGrad.addColorStop(0.5, '#1e1608');
  groundGrad.addColorStop(0.8, '#261c0a');
  groundGrad.addColorStop(1,   '#1a1208');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, treeH, W, fieldH);

  // Ground texture — fine dirt variation streaks
  ctx.globalAlpha = 0.12;
  for (let gx = 0; gx < W; gx += 4*dpr) {
    const shade = Math.sin(gx * 0.04 + 0.7) * 0.5 + 0.5;
    ctx.fillStyle = shade > 0.7 ? '#3a2a10' : shade > 0.4 ? '#2a1e08' : '#150e04';
    ctx.fillRect(gx, treeH, 2*dpr, fieldH);
  }
  ctx.globalAlpha = 1;

  // Scorched patches — blast marks scattered across field
  const scorchSeeds = [0.12, 0.28, 0.45, 0.61, 0.77, 0.38, 0.55, 0.88];
  scorchSeeds.forEach(function(seed, i) {
    const sx  = W * seed;
    const sy  = treeH + fieldH * (0.15 + (Math.sin(seed * 7.3) * 0.5 + 0.5) * 0.7);
    const sr  = (12 + Math.sin(seed * 11.2) * 6) * dpr;
    const sg  = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sg.addColorStop(0,   'rgba(8,6,4,.85)');
    sg.addColorStop(0.4, 'rgba(20,14,6,.55)');
    sg.addColorStop(0.8, 'rgba(30,20,8,.2)');
    sg.addColorStop(1,   'transparent');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr*0.65, 0, 0, Math.PI*2); ctx.fill();
    // Scorch ring
    ctx.strokeStyle = 'rgba(50,30,10,.3)';
    ctx.lineWidth = 1.2*dpr;
    ctx.beginPath(); ctx.ellipse(sx, sy, sr*0.85, sr*0.5, 0, 0, Math.PI*2); ctx.stroke();
  });

  // Shell craters — deepen as waves progress
  const craterCount = Math.min(Math.floor((state.wave || 1) * 0.8), 8);
  for (let ci = 0; ci < craterCount; ci++) {
    const cseed  = ci * 137.508 + 42;
    const cx2    = W * (0.08 + (Math.sin(cseed * 0.31) * 0.5 + 0.5) * 0.84);
    const cy2    = treeH + fieldH * (0.18 + (Math.sin(cseed * 0.47) * 0.5 + 0.5) * 0.68);
    const cr     = (10 + Math.sin(cseed * 0.23) * 5) * dpr;
    // Crater shadow
    const cg = ctx.createRadialGradient(cx2, cy2 + cr*0.25, 0, cx2, cy2, cr);
    cg.addColorStop(0,   'rgba(5,3,2,.9)');
    cg.addColorStop(0.5, 'rgba(18,12,5,.55)');
    cg.addColorStop(0.85,'rgba(30,20,8,.2)');
    cg.addColorStop(1,   'transparent');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.ellipse(cx2, cy2, cr, cr*0.6, 0, 0, Math.PI*2); ctx.fill();
    // Rim — dirt thrown outward
    ctx.strokeStyle = 'rgba(70,45,18,.4)';
    ctx.lineWidth = 2.5*dpr;
    ctx.beginPath(); ctx.ellipse(cx2, cy2 - cr*0.1, cr*0.95, cr*0.5, 0, 0, Math.PI*2); ctx.stroke();
    // Rim highlight top edge
    ctx.strokeStyle = 'rgba(90,60,22,.25)';
    ctx.lineWidth = 1.2*dpr;
    ctx.beginPath(); ctx.arc(cx2, cy2, cr*0.85, Math.PI*1.1, Math.PI*1.9); ctx.stroke();
  }

  // Trench lines — horizontal fortification channels
  const trenchY1 = treeH + fieldH * 0.4;
  const trenchY2 = treeH + fieldH * 0.72;
  [trenchY1, trenchY2].forEach(function(ty, ti) {
    const tg = ctx.createLinearGradient(0, ty - 4*dpr, 0, ty + 6*dpr);
    tg.addColorStop(0,   'rgba(8,5,2,.7)');
    tg.addColorStop(0.5, 'rgba(4,3,1,.9)');
    tg.addColorStop(1,   'rgba(20,14,5,.3)');
    ctx.fillStyle = tg;
    // Trench with slight waviness
    ctx.beginPath();
    ctx.moveTo(0, ty);
    for (let tx2 = 0; tx2 <= W; tx2 += W/20) {
      ctx.lineTo(tx2, ty + Math.sin(tx2*0.015 + ti*2.3)*3*dpr);
    }
    ctx.lineTo(W, ty + 8*dpr); ctx.lineTo(0, ty + 8*dpr); ctx.closePath();
    ctx.fill();
    // Trench top edge shadow
    ctx.strokeStyle = 'rgba(60,40,15,.35)';
    ctx.lineWidth = 1.5*dpr;
    ctx.beginPath();
    for (let tx2 = 0; tx2 <= W; tx2 += W/20) {
      if (tx2 === 0) ctx.moveTo(tx2, ty + Math.sin(tx2*0.015 + ti*2.3)*3*dpr);
      else ctx.lineTo(tx2, ty + Math.sin(tx2*0.015 + ti*2.3)*3*dpr);
    }
    ctx.stroke();
  });

  // Debris scatter — shell casings, rubble, wire fragments
  const debrisItems = [
    {x:0.07,y:0.28,type:'rubble'},{x:0.19,y:0.55,type:'casing'},{x:0.34,y:0.38,type:'rubble'},
    {x:0.48,y:0.65,type:'wire'  },{x:0.62,y:0.42,type:'casing'},{x:0.74,y:0.72,type:'rubble'},
    {x:0.85,y:0.33,type:'wire'  },{x:0.93,y:0.58,type:'casing'},{x:0.22,y:0.80,type:'rubble'},
    {x:0.56,y:0.82,type:'casing'},{x:0.79,y:0.25,type:'wire'  },
  ];
  debrisItems.forEach(function(db) {
    const dx = W * db.x, dy = treeH + fieldH * db.y;
    if (db.type === 'rubble') {
      ctx.fillStyle = 'rgba(55,42,28,.6)';
      ctx.beginPath(); ctx.ellipse(dx, dy, 4*dpr, 2.5*dpr, 0.4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(70,55,35,.4)';
      ctx.beginPath(); ctx.ellipse(dx-2*dpr, dy-1*dpr, 2.5*dpr, 1.5*dpr, 0.2, 0, Math.PI*2); ctx.fill();
    } else if (db.type === 'casing') {
      ctx.fillStyle = 'rgba(100,80,30,.5)';
      ctx.fillRect(dx - 0.8*dpr, dy - 3*dpr, 1.6*dpr, 5*dpr);
    } else if (db.type === 'wire') {
      ctx.strokeStyle = 'rgba(80,75,55,.4)';
      ctx.lineWidth = 0.8*dpr;
      ctx.beginPath();
      ctx.moveTo(dx-5*dpr, dy); ctx.lineTo(dx+2*dpr, dy-2*dpr);
      ctx.moveTo(dx, dy-1*dpr); ctx.lineTo(dx+5*dpr, dy+1*dpr);
      ctx.stroke();
    }
  });

  // Ground fog / smoke layers — low-lying battlefield haze
  const fogLayers = [
    { y: treeH + fieldH*0.15, alpha: 0.06 + 0.02*Math.sin(t*0.3), w: 1.2 },
    { y: treeH + fieldH*0.45, alpha: 0.04 + 0.02*Math.sin(t*0.4+1), w: 1.0 },
    { y: treeH + fieldH*0.78, alpha: 0.08 + 0.03*Math.sin(t*0.25+2), w: 1.3 },
  ];
  fogLayers.forEach(function(fog) {
    const fg = ctx.createLinearGradient(0, fog.y - 10*dpr, 0, fog.y + 16*dpr);
    fg.addColorStop(0,   'transparent');
    fg.addColorStop(0.3, 'rgba(120,130,100,' + fog.alpha + ')');
    fg.addColorStop(0.7, 'rgba(100,110,85,' + fog.alpha + ')');
    fg.addColorStop(1,   'transparent');
    ctx.fillStyle = fg;
    ctx.fillRect(-W*0.1, fog.y - 10*dpr, W*fog.w, 26*dpr);
  });

  // ── OPEN BATTLEFIELD — selected lane dim glow near base ──────
  const LANE_COLORS_RAW = ['#22d4ff', '#b060ff', '#18f06a'];
  const selLane = state.selectedLane;
  const selCx   = laneX[selLane];
  const selGlow = ctx.createLinearGradient(0, H - baseH - 70*dpr, 0, H - baseH);
  selGlow.addColorStop(0, 'transparent');
  selGlow.addColorStop(1, LANE_COLORS_RAW[selLane] + '14');
  ctx.fillStyle = selGlow;
  ctx.fillRect(selCx - colW * 0.45, H - baseH - 70*dpr, colW * 0.9, 70*dpr);

  // ── DAMAGED TREELINE — war-ravaged forest ─────────────────────
  const swayAmt = (state.waveInProgress && state.wave % CFG.BOSS_WAVE_EVERY === 0) ? 4.5 : 1.8;
  const treeCount = Math.floor(W / (10*dpr));

  // Dark sky behind trees — smoke-filled
  const skyBehindTrees = ctx.createLinearGradient(0, 0, 0, treeH);
  skyBehindTrees.addColorStop(0, '#060908');
  skyBehindTrees.addColorStop(1, '#0e1408');
  ctx.fillStyle = skyBehindTrees;
  ctx.fillRect(0, 0, W, treeH);

  // Distant smoke columns
  for (let sc = 0; sc < 4; sc++) {
    const scx = W * (0.15 + sc * 0.24);
    const smokeAmt = 0.3 + 0.15*Math.sin(t*0.2 + sc);
    const scg = ctx.createRadialGradient(scx, 0, 0, scx, treeH*0.5, W*0.06);
    scg.addColorStop(0,   'rgba(40,40,35,' + smokeAmt + ')');
    scg.addColorStop(0.6, 'rgba(25,25,20,' + smokeAmt*0.4 + ')');
    scg.addColorStop(1,   'transparent');
    ctx.fillStyle = scg;
    ctx.fillRect(scx - W*0.08, 0, W*0.16, treeH);
  }

  for (let ti = 0; ti <= treeCount; ti++) {
    const tx     = (ti / treeCount) * W;
    const seed   = ti * 17.3;
    const sway   = Math.sin(t * 0.7 + ti * 0.9) * swayAmt * dpr;
    const treeType = (ti * 7 + Math.floor(Math.sin(seed)*3)) % 5;
    const warDamaged = (ti * 3 + Math.floor(seed)) % 4 === 0; // 25% damaged/burned

    if (treeType === 3 || warDamaged) {
      // Dead/burned tree — charred trunk, broken branches
      const th = (18 + Math.sin(seed*0.4)*8) * dpr;
      const trunkColor = warDamaged ? '#1a0e04' : '#221408';
      ctx.strokeStyle = trunkColor; ctx.lineWidth = (warDamaged ? 2.5 : 2)*dpr; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tx, treeH); ctx.lineTo(tx + sway*0.4, treeH - th); ctx.stroke();
      ctx.lineWidth = 1*dpr;
      ctx.strokeStyle = warDamaged ? '#120a02' : '#2a1c08';
      [0.35,0.55,0.7].forEach(function(frac) {
        const by   = treeH - th * frac;
        const bLen = (4 + Math.sin(seed*frac)*3) * dpr * (warDamaged ? 0.6 : 1);
        ctx.beginPath(); ctx.moveTo(tx+sway*0.3, by); ctx.lineTo(tx-bLen+sway*0.4, by-3*dpr); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tx+sway*0.3, by); ctx.lineTo(tx+bLen*0.6+sway*0.4, by-2*dpr); ctx.stroke();
      });
      ctx.lineCap = 'butt';
      continue;
    }

    const treeHeight = (22 + Math.sin(seed*0.23)*9 + Math.sin(seed*0.11)*5) * dpr;
    const treeW      = (8 + Math.sin(seed*0.17)*3) * dpr;
    const treeY      = treeH - treeHeight;

    ctx.fillStyle = '#1a0e04';
    ctx.fillRect(tx - 1.5*dpr, treeH - 10*dpr, 3*dpr, 10*dpr);

    if (treeType === 4) {
      // Sparse deciduous — dark, war-worn foliage
      const greens = ['#142808','#183010','#10220a'];
      ctx.fillStyle = greens[ti % 3];
      ctx.beginPath(); ctx.arc(tx + sway*0.7, treeY + treeHeight*0.4, treeW*0.8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a3010';
      ctx.beginPath(); ctx.arc(tx - treeW*0.3 + sway*0.5, treeY+treeHeight*0.5, treeW*0.5, 0, Math.PI*2); ctx.fill();
    } else {
      // Dark pine — deep shadows
      const shades = ['#142008','#182810','#101c08'];
      const shade  = shades[treeType % 3];
      ctx.fillStyle = shade;
      ctx.beginPath(); ctx.moveTo(tx+sway, treeY); ctx.lineTo(tx-treeW+sway*0.5, treeH-4*dpr); ctx.lineTo(tx+treeW+sway*0.5, treeH-4*dpr); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1c3012';
      ctx.beginPath(); ctx.moveTo(tx+sway*1.1, treeY-3*dpr); ctx.lineTo(tx-treeW*0.65+sway*0.7, treeH-14*dpr); ctx.lineTo(tx+treeW*0.65+sway*0.7, treeH-14*dpr); ctx.closePath(); ctx.fill();
    }
  }

  // Sparse dead undergrowth at treeline
  for (let bi = 0; bi <= treeCount; bi += 3) {
    const bx    = (bi / treeCount) * W + Math.sin(bi*2.3)*6*dpr;
    const bsway = Math.sin(t * 0.8 + bi * 0.7) * 1.0 * dpr;
    const bsize = (4 + Math.sin(bi*1.7)*2) * dpr;
    ctx.fillStyle = 'rgba(14,10,4,.75)';
    ctx.beginPath(); ctx.ellipse(bx+bsway, treeH-1*dpr, bsize, bsize*0.5, 0, 0, Math.PI*2); ctx.fill();
  }

  // Treeline smoke/mist
  const mistGrad = ctx.createLinearGradient(0, treeH - 6*dpr, 0, treeH + 24*dpr);
  mistGrad.addColorStop(0,   'rgba(20,24,16,.6)');
  mistGrad.addColorStop(0.5, 'rgba(15,18,12,.3)');
  mistGrad.addColorStop(1,   'transparent');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, treeH - 6*dpr, W, 30*dpr);

  // Treeline fire — Wave 100+ trees are burning
  if (state.wave >= 100) {
    const fireIntensity = Math.min(1, (state.wave - 100) / 50); // ramps up to W150
    const fireCount = Math.floor(W / (22*dpr));
    for (var fi = 0; fi < fireCount; fi++) {
      const fx  = (fi / fireCount) * W + Math.sin(fi * 2.3) * 8*dpr;
      const fy  = treeH - (8 + Math.sin(fi * 1.7) * 4) * dpr;
      const fh  = (20 + Math.sin(t * 3 + fi) * 8 + fireIntensity * 10) * dpr;
      const fw  = (6 + Math.sin(fi * 1.3) * 2) * dpr;
      const flicker = 0.6 + 0.4 * Math.sin(t * (8 + fi * 0.5));
      // Outer smoke
      const smk = ctx.createRadialGradient(fx, fy - fh * 0.3, 0, fx, fy, fw * 2.5);
      smk.addColorStop(0,   'rgba(40,35,30,' + (fireIntensity * 0.35 * flicker) + ')');
      smk.addColorStop(1,   'transparent');
      ctx.fillStyle = smk;
      ctx.beginPath(); ctx.ellipse(fx, fy - fh * 0.5, fw * 2, fh * 0.8, 0, 0, Math.PI*2); ctx.fill();
      // Fire core — orange/yellow
      const fireG = ctx.createLinearGradient(fx, fy, fx, fy - fh);
      fireG.addColorStop(0,   'rgba(255,60,0,' + (0.7 * flicker * fireIntensity) + ')');
      fireG.addColorStop(0.4, 'rgba(255,140,0,' + (0.85 * flicker * fireIntensity) + ')');
      fireG.addColorStop(0.8, 'rgba(255,220,60,' + (0.6 * flicker * fireIntensity) + ')');
      fireG.addColorStop(1,   'transparent');
      ctx.fillStyle = fireG;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx - fw, fy);
      ctx.quadraticCurveTo(fx - fw * 0.5, fy - fh * 0.6, fx, fy - fh);
      ctx.quadraticCurveTo(fx + fw * 0.5, fy - fh * 0.6, fx + fw, fy);
      ctx.closePath();
      ctx.fill();
    }
    // Glow across treeline base
    const treeGlow = ctx.createLinearGradient(0, treeH - 20*dpr, 0, treeH + 10*dpr);
    treeGlow.addColorStop(0, 'rgba(255,80,0,' + (0.12 * fireIntensity * (0.8 + 0.2*Math.sin(t*2))) + ')');
    treeGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = treeGlow;
    ctx.fillRect(0, treeH - 20*dpr, W, 30*dpr);
  }

  // ── Persistent FX: scorch marks + shell casings ──────────────
  // Tick life values
  var gs = (_gameSpeed || 1);
  for (var pi = _scorchMarks.length - 1; pi >= 0; pi--) {
    _scorchMarks[pi].life -= 0.00015 * gs; // very slow fade — marks persist
    if (_scorchMarks[pi].life <= 0) { _scorchMarks.splice(pi, 1); continue; }
    var sm = _scorchMarks[pi];
    var sg = ctx.createRadialGradient(sm.x, sm.y, 0, sm.x, sm.y, sm.r);
    sg.addColorStop(0,   'rgba(8,6,2,' + (sm.life * 0.55) + ')');
    sg.addColorStop(0.5, 'rgba(15,10,4,' + (sm.life * 0.28) + ')');
    sg.addColorStop(1,   'transparent');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.ellipse(sm.x, sm.y, sm.r, sm.r * 0.55, 0, 0, Math.PI*2); ctx.fill();
    // Scorch ring
    ctx.strokeStyle = 'rgba(40,24,8,' + (sm.life * 0.3) + ')';
    ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath(); ctx.ellipse(sm.x, sm.y, sm.r * 0.8, sm.r * 0.44, 0, 0, Math.PI*2); ctx.stroke();
    ctx.lineWidth = 1;
  }

  for (var ci = _shellCasings.length - 1; ci >= 0; ci--) {
    var cs = _shellCasings[ci];
    cs.life -= 0.004 * gs;
    cs.x += cs.vx * gs * 0.3;
    cs.y += cs.vy * gs * 0.3;
    cs.vx *= 0.92; cs.vy *= 0.92;
    if (cs.life <= 0) { _shellCasings.splice(ci, 1); continue; }
    ctx.globalAlpha = Math.min(cs.life * 1.5, 0.7);
    ctx.fillStyle = '#a07820';
    ctx.save();
    ctx.translate(cs.x, cs.y);
    ctx.rotate(cs.angle + (1 - cs.life) * 4);
    ctx.fillRect(-1.2*dpr, -0.5*dpr, 2.4*dpr, 1*dpr); // tiny casing rectangle
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Muzzle glow illumination — brief warm circle on ground
  for (var mi = _muzzleGlows.length - 1; mi >= 0; mi--) {
    _muzzleGlows[mi].life -= 0.08 * gs;
    if (_muzzleGlows[mi].life <= 0) { _muzzleGlows.splice(mi, 1); continue; }
    var mg2 = _muzzleGlows[mi];
    var mgg = ctx.createRadialGradient(mg2.x, mg2.y, 0, mg2.x, mg2.y, mg2.r);
    mgg.addColorStop(0,   'rgba(255,200,80,' + (mg2.life * 0.18) + ')');
    mgg.addColorStop(0.5, 'rgba(255,140,40,' + (mg2.life * 0.08) + ')');
    mgg.addColorStop(1,   'transparent');
    ctx.fillStyle = mgg;
    ctx.beginPath(); ctx.ellipse(mg2.x, mg2.y, mg2.r, mg2.r * 0.4, 0, 0, Math.PI*2); ctx.fill();
  }

  // Death decals — oil/rust stains that accumulate on ground
  for (var di = 0; di < _deathDecals.length; di++) {
    var dd = _deathDecals[di];
    // Very slow fade — stay for many waves
    dd.life -= 0.00008 * gs;
    if (dd.life <= 0) { _deathDecals.splice(di, 1); di--; continue; }
    var dg = ctx.createRadialGradient(dd.x, dd.y, 0, dd.x, dd.y, dd.r * dpr);
    if (dd.kind === 'oil') {
      dg.addColorStop(0,   'rgba(30,20,10,' + (dd.life * 0.65) + ')');
      dg.addColorStop(0.6, 'rgba(20,12,6,' + (dd.life * 0.3) + ')');
    } else {
      dg.addColorStop(0,   'rgba(80,12,8,' + (dd.life * 0.55) + ')');
      dg.addColorStop(0.6, 'rgba(50,8,4,' + (dd.life * 0.25) + ')');
    }
    dg.addColorStop(1, 'transparent');
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.ellipse(dd.x, dd.y, dd.r * dpr, dd.r * dpr * 0.5, 0, 0, Math.PI*2); ctx.fill();
  }

  // Dust puffs — concrete impact particles
  for (var dpi = _dustPuffs.length - 1; dpi >= 0; dpi--) {
    var dp2 = _dustPuffs[dpi];
    dp2.life -= 0.04 * gs;
    dp2.r += 0.8 * gs;
    dp2.x += dp2.vx * gs;
    dp2.y += dp2.vy * gs;
    if (dp2.life <= 0) { _dustPuffs.splice(dpi, 1); continue; }
    ctx.globalAlpha = dp2.life * 0.5;
    ctx.fillStyle = 'rgba(180,155,110,' + dp2.life + ')';
    ctx.beginPath(); ctx.arc(dp2.x, dp2.y, dp2.r * dpr, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ── LANE INFRASTRUCTURE ───────────────────────────────────
  for (let i = 0; i < 3; i++) {
    const cx = laneX[i];
    const lane = state.lanes[i];

    // Sandbag barricade — stacked bags near base
    if (lane.barricade > 0) {
      const rows = Math.min(lane.barricade, 4);
      const bagY = H - baseH - (8 + rows * 10) * dpr;
      const bagW = colW * 0.6;
      for (let row = 0; row < rows; row++) {
        const rowY = bagY + row * 10*dpr;
        const bags = 3 + (row % 2);
        const bagSpacing = bagW / bags;
        ctx.fillStyle = row % 2 === 0 ? '#8b7340' : '#7a6530';
        ctx.strokeStyle = '#5a4820';
        ctx.lineWidth = 0.8*dpr;
        for (let b = 0; b < bags; b++) {
          const bx = cx - bagW/2 + b * bagSpacing + (row % 2 === 1 ? bagSpacing/2 : 0);
          ctx.beginPath();
          ctx.ellipse(bx + bagSpacing*0.4, rowY + 4*dpr, bagSpacing*0.4, 5*dpr, 0, 0, Math.PI*2);
          ctx.fill();
          ctx.stroke();
        }
      }
      // Sandbag shadow
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.fillRect(cx - bagW/2 + 2*dpr, H - baseH - 4*dpr, bagW, 4*dpr);
    }

    // Gun turret — angular military emplacement
    if (lane.gun > 0) {
      const ty = H - baseH - (50 + (lane.barricade || 0) * 10) * dpr;
      // Sandbag base
      ctx.fillStyle = '#7a6530';
      ctx.beginPath();
      ctx.ellipse(cx, ty + 6*dpr, 14*dpr, 6*dpr, 0, 0, Math.PI*2);
      ctx.fill();
      // Turret body
      ctx.fillStyle = '#3a4a28';
      ctx.fillRect(cx - 9*dpr, ty - 8*dpr, 18*dpr, 14*dpr);
      ctx.fillStyle = '#4a5c34';
      ctx.fillRect(cx - 7*dpr, ty - 6*dpr, 14*dpr, 10*dpr);
      // Gun barrel pointing up
      ctx.fillStyle = '#2a3420';
      ctx.fillRect(cx - 2.5*dpr, ty - 22*dpr, 5*dpr, 16*dpr);
      ctx.fillRect(cx - 3.5*dpr, ty - 24*dpr, 7*dpr, 4*dpr); // muzzle
      // Turret glow if active
      ctx.shadowColor = '#88ff44'; ctx.shadowBlur = 8;
      ctx.strokeStyle = '#88ff44aa'; ctx.lineWidth = 1*dpr;
      ctx.strokeRect(cx - 9*dpr, ty - 8*dpr, 18*dpr, 14*dpr);
      ctx.shadowBlur = 0;
    }

    // Med tent — red cross tent
    if (lane.medbay > 0) {
      const my = H - baseH - 38*dpr;
      ctx.fillStyle = '#8b2020';
      // Tent shape
      ctx.beginPath();
      ctx.moveTo(cx, my - 12*dpr);
      ctx.lineTo(cx - 14*dpr, my + 6*dpr);
      ctx.lineTo(cx + 14*dpr, my + 6*dpr);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#cc3030';
      ctx.beginPath();
      ctx.moveTo(cx, my - 10*dpr);
      ctx.lineTo(cx - 11*dpr, my + 5*dpr);
      ctx.lineTo(cx + 11*dpr, my + 5*dpr);
      ctx.closePath();
      ctx.fill();
      // White cross
      ctx.fillStyle = 'white';
      ctx.fillRect(cx - 1.5*dpr, my - 6*dpr, 3*dpr, 10*dpr);
      ctx.fillRect(cx - 5*dpr, my - 2*dpr, 10*dpr, 3*dpr);
      // Heal pulse
      const hp2 = 0.3 + 0.3 * Math.sin(t * 2.5);
      ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 8 * hp2;
      ctx.strokeStyle = 'rgba(255,80,80,' + hp2 + ')'; ctx.lineWidth = 1*dpr;
      ctx.beginPath(); ctx.arc(cx, my, 18*dpr, 0, Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Sensor array — radar dish on pole
    if (lane.sensor > 0) {
      const sy = H - baseH - 55*dpr;
      // Pole
      ctx.fillStyle = '#4a5030';
      ctx.fillRect(cx - 1.5*dpr, sy, 3*dpr, 20*dpr);
      // Dish
      ctx.strokeStyle = '#88cc44'; ctx.lineWidth = 2*dpr;
      ctx.beginPath();
      ctx.arc(cx, sy, 9*dpr, Math.PI + 0.3, Math.PI * 2 - 0.3);
      ctx.stroke();
      // Sweep pulse
      const sweep = (t * 1.5) % (Math.PI * 2);
      ctx.strokeStyle = 'rgba(136,220,68,' + (0.4 + 0.3*Math.sin(t*3)) + ')'; ctx.lineWidth = 1*dpr;
      ctx.beginPath();
      ctx.arc(cx, sy, (12 + lane.sensor * 8) * dpr, sweep, sweep + 0.6);
      ctx.stroke();
    }
  }

  // ── BASE FORTIFICATION (bottom) ───────────────────────────
  // Dirt/gravel perimeter
  const perimGrad = ctx.createLinearGradient(0, H - baseH - 8*dpr, 0, H - baseH);
  perimGrad.addColorStop(0, '#4a3618');
  perimGrad.addColorStop(1, '#5a4222');
  ctx.fillStyle = perimGrad;
  ctx.fillRect(0, H - baseH - 6*dpr, W, 6*dpr);

  // Concertina wire strip
  ctx.strokeStyle = '#888870';
  ctx.lineWidth = 1*dpr;
  for (let wx = 0; wx < W; wx += 8*dpr) {
    ctx.beginPath();
    ctx.arc(wx + 4*dpr, H - baseH - 3*dpr, 4*dpr, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── EVOLVING BASE — visual tier matches HP upgrades ──────────
  // hpf_tier drives base appearance:
  //   0.00–0.25 → Tier 0: basic dirt berm, crude posts (damaged/ruined)
  //   0.25–0.50 → Tier 1: sandbag wall, wood structures
  //   0.50–0.75 → Tier 2: timber reinforced, watchtowers beginning
  //   0.75–1.00 → Tier 3: concrete & steel, full fortification
  // maxHp drives long-term tier (upgrades increase maxHp):
  const baseTier = state.maxBaseHp <= 100 ? 0
                 : state.maxBaseHp <= 130 ? 1
                 : state.maxBaseHp <= 170 ? 2
                 : 3;
  const hpf_base = state.baseHp / state.maxBaseHp;

  // ── BASE FLOOR ────────────────────────────────────────────
  // Color gets progressively more refined with tier
  const floorColors = ['#3a2c18','#3a2e1c','#3d3020','#3a3830'];
  ctx.fillStyle = floorColors[baseTier];
  ctx.fillRect(0, H - baseH, W, baseH);

  // Interior surface
  const surfaceColors = ['#4a3a20','#48402a','#484438','#464440'];
  const surfGrad = ctx.createLinearGradient(0, H - baseH, 0, H);
  surfGrad.addColorStop(0, surfaceColors[baseTier]);
  surfGrad.addColorStop(1, '#2a2820');
  ctx.fillStyle = surfGrad;
  ctx.fillRect(W * 0.03, H - baseH + 3*dpr, W * 0.94, baseH - 6*dpr);

  // ── TIER 0: DIRT BERM — crude earthwork, basic survival ──
  if (baseTier === 0) {
    // Rough dirt piled up — irregular lumps
    ctx.fillStyle = '#6a4a22';
    for (let xi = 0; xi < 8; xi++) {
      const bx = W * (xi / 7);
      const bh = (6 + Math.sin(xi * 1.7) * 3) * dpr;
      ctx.beginPath(); ctx.ellipse(bx, H - baseH, W/7 * 0.7, bh, 0, 0, Math.PI*2); ctx.fill();
    }
    // Crude wooden stakes
    ctx.fillStyle = '#5a3a18';
    ctx.strokeStyle = '#3a2410';
    ctx.lineWidth = 1*dpr;
    for (let si = 0; si < 5; si++) {
      const sx = W * 0.1 + si * W * 0.2;
      ctx.fillRect(sx - 1.5*dpr, H - baseH - 12*dpr, 3*dpr, 14*dpr);
      // Pointed top
      ctx.beginPath(); ctx.moveTo(sx - 2*dpr, H-baseH-12*dpr); ctx.lineTo(sx, H-baseH-17*dpr); ctx.lineTo(sx+2*dpr, H-baseH-12*dpr); ctx.fill();
    }
    // Barbed wire suggestion
    ctx.strokeStyle = 'rgba(120,100,60,.5)'; ctx.lineWidth = 0.8*dpr;
    ctx.beginPath(); ctx.moveTo(0, H-baseH-4*dpr);
    for (let wi = 0; wi <= 10; wi++) ctx.lineTo(W*wi/10, H-baseH-4*dpr + Math.sin(wi*1.2)*2*dpr);
    ctx.stroke();
  }

  // ── TIER 1: SANDBAG WALL + WOOD STRUCTURES ───────────────
  if (baseTier >= 1) {
    const wallY1 = H - baseH - 2*dpr;
    const bc1    = Math.floor(W / (10*dpr * 0.9));
    for (let bi = 0; bi < bc1; bi++) {
      const bx = bi * (W / bc1);
      ctx.fillStyle = bi%2===0 ? '#8a7340' : '#7a6330';
      ctx.beginPath(); ctx.ellipse(bx + W/(bc1*2), wallY1+3*dpr, W/(bc1*2)*0.88, 4*dpr, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#5a4820'; ctx.lineWidth = 0.6*dpr; ctx.stroke();
      if (bi < bc1-1) {
        ctx.fillStyle = bi%2===0 ? '#7a6330' : '#8a7340';
        ctx.beginPath(); ctx.ellipse(bx+W/bc1, wallY1-2*dpr, W/(bc1*2)*0.82, 3.5*dpr, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle='#4a3818'; ctx.lineWidth=0.5*dpr; ctx.stroke();
      }
    }
    // Wall shadow
    const ws1 = ctx.createLinearGradient(0, wallY1+6*dpr, 0, wallY1+16*dpr);
    ws1.addColorStop(0,'rgba(0,0,0,.4)'); ws1.addColorStop(1,'transparent');
    ctx.fillStyle = ws1;
    ctx.fillRect(0, wallY1+6*dpr, W, 10*dpr);
  }

  // ── TIER 2: TIMBER-REINFORCED — add log frame and basic towers ─
  if (baseTier >= 2) {
    // Timber frame along wall top — dark logs between sandbag sections
    ctx.fillStyle = '#3a2810';
    ctx.fillRect(0, H-baseH-8*dpr, W, 4*dpr);
    // Log bolt details
    ctx.fillStyle = '#5a4020';
    for (let li = 0; li < 6; li++) {
      ctx.beginPath(); ctx.arc(W*(li+0.5)/6, H-baseH-6*dpr, 2.5*dpr, 0, Math.PI*2); ctx.fill();
    }
    // Timber side posts
    ctx.fillStyle = '#4a3018';
    [0.05, 0.33, 0.67, 0.95].forEach(function(fx) {
      ctx.fillRect(W*fx - 2*dpr, H-baseH-16*dpr, 4*dpr, 16*dpr);
    });
  }

  // ── TIER 3: CONCRETE & STEEL — full fortification ─────────
  if (baseTier >= 3) {
    // Concrete parapet across top
    ctx.fillStyle = '#5a5850';
    ctx.fillRect(0, H-baseH-12*dpr, W, 10*dpr);
    ctx.fillStyle = '#6a6860';
    ctx.fillRect(2*dpr, H-baseH-10*dpr, W-4*dpr, 6*dpr);
    // Crenellations
    const crw = 18*dpr, crh = 8*dpr, crg = 14*dpr;
    const crCount = Math.floor(W / (crw + crg));
    for (let ci = 0; ci < crCount; ci++) {
      const crx = (W - crCount*(crw+crg) + crg)/2 + ci*(crw+crg);
      ctx.fillStyle = '#5a5850';
      ctx.fillRect(crx, H-baseH-20*dpr, crw, crh);
      ctx.fillStyle = '#6a6860';
      ctx.fillRect(crx+1*dpr, H-baseH-18*dpr, crw-2*dpr, crh-2*dpr);
    }
    // Steel reinforcement strips
    ctx.strokeStyle = '#3a3830'; ctx.lineWidth = 2*dpr;
    [0.25, 0.50, 0.75].forEach(function(fx) {
      ctx.beginPath(); ctx.moveTo(W*fx, H-baseH-12*dpr); ctx.lineTo(W*fx, H); ctx.stroke();
    });
  }

  // ── CONCERTINA WIRE STRIP (all tiers) ─────────────────────
  const wireY = H - baseH - (baseTier === 0 ? 4 : baseTier <= 1 ? 10 : 14)*dpr;
  ctx.strokeStyle = baseTier <= 1 ? 'rgba(120,100,50,.45)' : '#888870';
  ctx.lineWidth = 0.8*dpr;
  const wireSpacing = baseTier === 0 ? 14*dpr : 8*dpr;
  for (let wx = 0; wx < W; wx += wireSpacing) {
    ctx.beginPath(); ctx.arc(wx+wireSpacing/2, wireY, wireSpacing/2, 0, Math.PI*2); ctx.stroke();
  }

  // ── COMMAND BUNKER — evolves with base tier ────────────────
  const bunkerW = W * 0.36;
  const bunkerH = baseH * 0.72;
  const bunkerX = W/2 - bunkerW/2;
  const bunkerY = H - baseH + (baseH - bunkerH) / 2;

  if (baseTier === 0) {
    // Tier 0: crude dug-out, rough timber frame
    ctx.fillStyle = '#4a3a20';
    ctx.fillRect(bunkerX, bunkerY + bunkerH*0.3, bunkerW, bunkerH*0.7);
    // Rough timber posts
    ctx.fillStyle = '#3a2810';
    ctx.fillRect(bunkerX, bunkerY + bunkerH*0.3, 4*dpr, bunkerH*0.7);
    ctx.fillRect(bunkerX + bunkerW - 4*dpr, bunkerY + bunkerH*0.3, 4*dpr, bunkerH*0.7);
    // Canvas/tarp roof
    ctx.fillStyle = '#5a6840';
    ctx.beginPath();
    ctx.moveTo(bunkerX - 4*dpr, bunkerY + bunkerH*0.3);
    ctx.lineTo(W/2, bunkerY + bunkerH*0.1);
    ctx.lineTo(bunkerX + bunkerW + 4*dpr, bunkerY + bunkerH*0.3);
    ctx.closePath(); ctx.fill();
    // Entry gap
    ctx.fillStyle = '#1a1208';
    ctx.fillRect(W/2 - 8*dpr, bunkerY + bunkerH*0.35, 16*dpr, bunkerH*0.65);

  } else if (baseTier === 1) {
    // Tier 1: sandbag bunker
    ctx.fillStyle = '#5a4a28';
    ctx.fillRect(bunkerX, bunkerY, bunkerW, bunkerH);
    ctx.fillStyle = '#6a5a34';
    ctx.fillRect(bunkerX + 2*dpr, bunkerY + 2*dpr, bunkerW - 4*dpr, bunkerH - 4*dpr);
    // Sandbag front face
    for (let sb = 0; sb < 5; sb++) {
      ctx.fillStyle = sb%2===0 ? '#8a7340' : '#7a6330';
      ctx.beginPath(); ctx.ellipse(bunkerX + (sb+0.5)*(bunkerW/5), bunkerY + bunkerH*0.15, bunkerW/10*0.85, 5*dpr, 0, 0, Math.PI*2); ctx.fill();
    }
    // Door
    ctx.fillStyle = '#2a2010';
    ctx.fillRect(W/2 - 8*dpr, bunkerY + bunkerH*0.35, 16*dpr, bunkerH*0.65);
    // Window slits
    ctx.fillStyle = '#ffaa44'; ctx.shadowColor = '#ffaa44'; ctx.shadowBlur = 4;
    ctx.fillRect(bunkerX + 8*dpr, bunkerY + bunkerH*0.2, 10*dpr, 4*dpr);
    ctx.fillRect(bunkerX + bunkerW - 18*dpr, bunkerY + bunkerH*0.2, 10*dpr, 4*dpr);
    ctx.shadowBlur = 0;

  } else if (baseTier === 2) {
    // Tier 2: timber-reinforced bunker
    ctx.fillStyle = '#524838';
    ctx.fillRect(bunkerX, bunkerY, bunkerW, bunkerH);
    ctx.fillStyle = '#625848';
    ctx.fillRect(bunkerX + 2*dpr, bunkerY + 2*dpr, bunkerW - 4*dpr, bunkerH - 4*dpr);
    // Timber frame
    ctx.fillStyle = '#3a2810';
    ctx.fillRect(bunkerX, bunkerY, 5*dpr, bunkerH);
    ctx.fillRect(bunkerX + bunkerW - 5*dpr, bunkerY, 5*dpr, bunkerH);
    ctx.fillRect(bunkerX, bunkerY, bunkerW, 4*dpr);
    // Blast door
    ctx.fillStyle = '#2a2418';
    ctx.fillRect(W/2 - 9*dpr, bunkerY + bunkerH*0.28, 18*dpr, bunkerH*0.72);
    ctx.fillStyle = '#3a3428'; ctx.fillRect(W/2-7*dpr, bunkerY+bunkerH*0.33, 6*dpr, bunkerH*0.62);
    ctx.fillRect(W/2+1*dpr, bunkerY+bunkerH*0.33, 6*dpr, bunkerH*0.62);
    // Windows
    ctx.fillStyle = '#ff8800'; ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 6;
    ctx.fillRect(bunkerX+6*dpr, bunkerY+5*dpr, 8*dpr, 5*dpr);
    ctx.fillRect(bunkerX+bunkerW-14*dpr, bunkerY+5*dpr, 8*dpr, 5*dpr);
    ctx.shadowBlur = 0;

  } else {
    // Tier 3: concrete & steel command post
    ctx.fillStyle = '#5a5848';
    ctx.fillRect(bunkerX, bunkerY, bunkerW, bunkerH);
    ctx.fillStyle = '#6a6858';
    ctx.fillRect(bunkerX+2*dpr, bunkerY+2*dpr, bunkerW-4*dpr, bunkerH-4*dpr);
    // Steel corner reinforcements
    ctx.fillStyle = '#404038';
    ctx.fillRect(bunkerX, bunkerY, 6*dpr, bunkerH);
    ctx.fillRect(bunkerX+bunkerW-6*dpr, bunkerY, 6*dpr, bunkerH);
    // Armored parapet on top
    ctx.fillStyle = '#4a4840';
    ctx.fillRect(bunkerX-3*dpr, bunkerY-5*dpr, bunkerW+6*dpr, 7*dpr);
    // Blast door — heavy steel
    ctx.fillStyle = '#303028';
    ctx.fillRect(W/2-9*dpr, bunkerY+bunkerH*0.28, 18*dpr, bunkerH*0.72);
    ctx.fillStyle = '#3a3830'; ctx.fillRect(W/2-7*dpr, bunkerY+bunkerH*0.33, 6*dpr, bunkerH*0.62);
    ctx.fillRect(W/2+1*dpr, bunkerY+bunkerH*0.33, 6*dpr, bunkerH*0.62);
    // Glowing windows
    ctx.fillStyle = '#ff8800'; ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 8;
    ctx.fillRect(bunkerX+6*dpr, bunkerY+5*dpr, 8*dpr, 5*dpr);
    ctx.fillRect(bunkerX+bunkerW-14*dpr, bunkerY+5*dpr, 8*dpr, 5*dpr);
    ctx.shadowBlur = 0;
  }

  // Antenna (all tiers — grows more sophisticated)
  ctx.fillStyle = '#7a7870';
  const antennaH = (10 + baseTier * 4) * dpr;
  ctx.fillRect(W/2 - 1*dpr, bunkerY - antennaH, 2*dpr, antennaH);
  if (baseTier >= 1) {
    ctx.strokeStyle = '#aaa898'; ctx.lineWidth = 1*dpr;
    ctx.beginPath(); ctx.arc(W/2, bunkerY - antennaH, (2+baseTier)*dpr, Math.PI, Math.PI*2); ctx.stroke();
  }
  // Blinking light
  const blink = Math.sin(t * 3) > 0;
  ctx.fillStyle = blink ? '#ff2222' : '#880000';
  ctx.shadowColor = '#ff2222'; ctx.shadowBlur = blink ? 8 : 0;
  ctx.beginPath(); ctx.arc(W/2, bunkerY - antennaH - 1*dpr, 2*dpr, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── ANIMATED FLAG ─────────────────────────────────────────
  const flagPole = W/2 + 2*dpr;
  const flagTop  = bunkerY - antennaH - 10*dpr;
  ctx.strokeStyle = '#8a8070'; ctx.lineWidth = 1*dpr;
  ctx.beginPath(); ctx.moveTo(flagPole, bunkerY - 2*dpr); ctx.lineTo(flagPole, flagTop); ctx.stroke();
  const flagW = 14*dpr, flagH = 8*dpr;
  const wave1 = Math.sin(t * 2.5) * 2*dpr;
  const wave2 = Math.sin(t * 2.5 + 0.8) * 2*dpr;
  const wave3 = Math.sin(t * 2.5 + 1.6) * 2*dpr;
  ctx.fillStyle = '#cc2020';
  ctx.beginPath();
  ctx.moveTo(flagPole, flagTop);
  ctx.lineTo(flagPole+flagW*0.33, flagTop+wave1); ctx.lineTo(flagPole+flagW*0.66, flagTop+wave2);
  ctx.lineTo(flagPole+flagW, flagTop+wave3); ctx.lineTo(flagPole+flagW, flagTop+flagH+wave3);
  ctx.lineTo(flagPole+flagW*0.66, flagTop+flagH+wave2); ctx.lineTo(flagPole+flagW*0.33, flagTop+flagH+wave1);
  ctx.lineTo(flagPole, flagTop+flagH); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  ctx.beginPath(); ctx.arc(flagPole+flagW*0.45, flagTop+flagH*0.5+wave2*0.5, 2.5*dpr, 0, Math.PI*2); ctx.fill();

  // ── SIDE GUARD TOWERS — evolve with tier ──────────────────
  [[W*0.06, H-baseH+3*dpr, 0], [W*0.94, H-baseH+3*dpr, 1]].forEach(function(td) {
    const tx = td[0], ty = td[1], side = td[2];
    const towerW = (8 + baseTier * 2.5) * dpr;
    const towerH = baseH - 6*dpr;

    if (baseTier === 0) {
      // Simple wooden watchtower post
      ctx.fillStyle = '#4a3418';
      ctx.fillRect(tx - 2*dpr, ty, 4*dpr, towerH);
      ctx.fillStyle = '#5a4222';
      ctx.fillRect(tx - 5*dpr, ty, 10*dpr, 6*dpr);
    } else if (baseTier === 1) {
      // Sandbag tower
      ctx.fillStyle = '#6a5430';
      ctx.fillRect(tx - towerW/2, ty, towerW, towerH);
      ctx.fillStyle = '#7a6340';
      ctx.fillRect(tx - towerW/2 - 2*dpr, ty, towerW+4*dpr, 7*dpr);
    } else if (baseTier === 2) {
      // Timber frame tower
      ctx.fillStyle = '#5a4a30';
      ctx.fillRect(tx-towerW/2, ty, towerW, towerH);
      ctx.fillStyle = '#3a2a18';
      ctx.fillRect(tx-towerW/2, ty, 3*dpr, towerH);
      ctx.fillRect(tx+towerW/2-3*dpr, ty, 3*dpr, towerH);
      ctx.fillStyle = '#6a5a40';
      ctx.fillRect(tx-towerW/2-3*dpr, ty, towerW+6*dpr, 8*dpr);
    } else {
      // Concrete watchtower
      ctx.fillStyle = '#545048';
      ctx.fillRect(tx-towerW/2, ty, towerW, towerH);
      ctx.fillStyle = '#646058';
      ctx.fillRect(tx-towerW/2+1*dpr, ty+1*dpr, towerW-2*dpr, towerH-2*dpr);
      ctx.fillStyle = '#484440';
      ctx.fillRect(tx-towerW/2-3*dpr, ty, towerW+6*dpr, 8*dpr); // parapet
    }

    // Tower window — glows warmer with each tier
    const winCols = ['rgba(180,140,60,.6)', '#ccaa44', '#ddaa44', '#ffcc44'];
    ctx.fillStyle = winCols[baseTier];
    ctx.shadowColor = winCols[baseTier]; ctx.shadowBlur = 4+baseTier*2;
    ctx.fillRect(tx-2.5*dpr, ty+3*dpr, 5*dpr, 4*dpr);
    ctx.shadowBlur = 0;
  });

  // ── SPOTLIGHT from left tower (tier 1+) ───────────────────
  if (baseTier >= 1) {
    const towerLX = W*0.06;
    const towerTY = H - baseH + 3*dpr;
    const spotAngle = Math.sin(t * 0.6) * 0.55 + 0.1;
    const spotLen   = (60 + baseTier * 20) * dpr;
    const spotGrad  = ctx.createRadialGradient(towerLX, towerTY, 0, towerLX, towerTY, spotLen);
    spotGrad.addColorStop(0,   'rgba(255,240,180,.16)');
    spotGrad.addColorStop(0.6, 'rgba(255,240,180,.05)');
    spotGrad.addColorStop(1,   'transparent');
    ctx.fillStyle = spotGrad;
    const beamW = Math.tan(0.08) * spotLen;
    ctx.save();
    ctx.translate(towerLX, towerTY);
    ctx.rotate(spotAngle - Math.PI/2);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-beamW,-spotLen); ctx.lineTo(beamW,-spotLen); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Feature 2: Progressive base damage visuals ────────────
  if (hpf_base < 0.75) {
    // Crack overlays on concrete — appear as HP drops
    const crackAlpha = Math.min(1, (0.75 - hpf_base) / 0.5);
    ctx.globalAlpha = crackAlpha * 0.7;
    ctx.strokeStyle = '#1a1610';
    ctx.lineWidth   = 1.5 * dpr;
    // Static cracks (seeded by position)
    const cracks = [
      [W*0.2, H-baseH+2*dpr, W*0.32, H-baseH+baseH*0.6],
      [W*0.5, H-baseH,       W*0.44, H-baseH+baseH*0.8],
      [W*0.7, H-baseH+4*dpr, W*0.62, H],
      [W*0.35,H-baseH+baseH*0.4, W*0.28, H],
      [W*0.8, H-baseH+2*dpr, W*0.88, H-baseH+baseH*0.7],
    ];
    cracks.forEach(([x1,y1,x2,y2], ci) => {
      if (ci >= Math.floor((1 - hpf_base) * 6)) return; // cracks appear progressively
      ctx.beginPath(); ctx.moveTo(x1,y1);
      // Add a mid-point jag for realism
      const mx = (x1+x2)/2 + (ci%2===0?8:-8)*dpr;
      const my = (y1+y2)/2;
      ctx.lineTo(mx, my); ctx.lineTo(x2, y2); ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  if (hpf_base < 0.5) {
    // Smoke particles from damaged bunker
    const smokeAlpha = (0.5 - hpf_base) / 0.5;
    for (let sp = 0; sp < 4; sp++) {
      const st = (t * 0.6 + sp * 0.8) % 1;
      const sx = bunkerX + bunkerW * 0.3 + sp * bunkerW * 0.15;
      const sy = bunkerY - st * 28 * dpr;
      const sr = (4 + st * 12) * dpr;
      ctx.globalAlpha = smokeAlpha * (1 - st) * 0.5;
      ctx.fillStyle   = '#888880';
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (hpf_base < 0.25) {
    // Fire flickering from windows at critical HP
    const fireInt = 0.6 + 0.4 * Math.sin(t * 12);
    // Left window fire
    ctx.globalAlpha = fireInt;
    const fireGrad = ctx.createRadialGradient(
      bunkerX + 10*dpr, bunkerY + 7*dpr, 1,
      bunkerX + 10*dpr, bunkerY + 7*dpr, 10*dpr
    );
    fireGrad.addColorStop(0, '#ffee00');
    fireGrad.addColorStop(0.4, '#ff6600');
    fireGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = fireGrad;
    ctx.fillRect(bunkerX + 2*dpr, bunkerY, 20*dpr, 18*dpr);
    // Right window fire
    const fireGrad2 = ctx.createRadialGradient(
      bunkerX + bunkerW - 10*dpr, bunkerY + 7*dpr, 1,
      bunkerX + bunkerW - 10*dpr, bunkerY + 7*dpr, 10*dpr
    );
    fireGrad2.addColorStop(0, '#ffee00');
    fireGrad2.addColorStop(0.4, '#ff4400');
    fireGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = fireGrad2;
    ctx.fillRect(bunkerX + bunkerW - 22*dpr, bunkerY, 20*dpr, 18*dpr);
    ctx.globalAlpha = 1;

    // Pulsing danger glow along HP bar edge
    ctx.strokeStyle = 'rgba(255,60,60,' + (0.4 + 0.4*Math.sin(t*8)) + ')';
    ctx.lineWidth   = 3 * dpr;
    ctx.strokeRect(0, H - baseH - 9*dpr, W, 6*dpr);
    ctx.lineWidth = 1;
  }

  // ── BARRACKS (left) — tap to Enlist, evolves with tier ────
  const bkX = W * 0.22, bkY = H - baseH + 4*dpr;
  const bkW = W * 0.18, bkH = baseH * 0.82;

  // Building body varies by tier
  const bkBodyCols  = ['#3a3020','#3a4828','#3e4a2c','#3a4828'];
  const bkInnerCols = ['#4a3e28','#4a5c34','#4e5c38','#4a5c34'];
  ctx.fillStyle = bkBodyCols[baseTier];
  ctx.fillRect(bkX, bkY, bkW, bkH);
  ctx.fillStyle = bkInnerCols[baseTier];
  ctx.fillRect(bkX+2*dpr, bkY+2*dpr, bkW-4*dpr, bkH-4*dpr);

  // Roof style by tier
  if (baseTier === 0) {
    // Canvas tarp
    ctx.fillStyle = '#4a5030';
    ctx.beginPath(); ctx.moveTo(bkX-2*dpr, bkY); ctx.lineTo(bkX+bkW/2, bkY-5*dpr); ctx.lineTo(bkX+bkW+2*dpr, bkY); ctx.closePath(); ctx.fill();
  } else if (baseTier === 1) {
    ctx.fillStyle = '#2e3a20';
    ctx.fillRect(bkX-2*dpr, bkY, bkW+4*dpr, 5*dpr);
  } else {
    // Proper roof with overhang
    ctx.fillStyle = baseTier===2 ? '#283220' : '#1e2a18';
    ctx.fillRect(bkX-3*dpr, bkY-2*dpr, bkW+6*dpr, 6*dpr);
    if (baseTier===3) { ctx.fillStyle='#303820'; ctx.fillRect(bkX-1*dpr,bkY-1*dpr,bkW+2*dpr,3*dpr); }
  }

  // Door
  ctx.fillStyle = '#1e2814';
  ctx.fillRect(bkX+bkW/2-4*dpr, bkY+bkH*0.45, 8*dpr, bkH*0.55);

  // Window with soldiers visible inside
  const winGlow = ['rgba(140,180,80,.7)','#88cc44','#88cc44','#aaf060'];
  ctx.fillStyle = winGlow[baseTier];
  ctx.shadowColor = winGlow[baseTier]; ctx.shadowBlur = 4+baseTier*2;
  ctx.fillRect(bkX+4*dpr, bkY+4*dpr, 7*dpr, 5*dpr);
  ctx.shadowBlur = 0;

  // Soldier silhouettes in window
  const bob1 = Math.sin(t*1.8)*0.8*dpr, bob2 = Math.sin(t*1.8+1.2)*0.8*dpr;
  ctx.fillStyle = '#1a3018';
  ctx.fillRect(bkX+4*dpr, bkY+4*dpr, 7*dpr, 5*dpr);
  ctx.fillStyle = '#60aa44';
  ctx.beginPath(); ctx.arc(bkX+6*dpr, bkY+6.5*dpr+bob1, 1.3*dpr, 0, Math.PI*2); ctx.fill();
  ctx.fillRect(bkX+4.8*dpr, bkY+7*dpr+bob1, 2.5*dpr, 2*dpr);
  ctx.fillStyle = '#50a038';
  ctx.beginPath(); ctx.arc(bkX+9*dpr, bkY+7*dpr+bob2, 1.2*dpr, 0, Math.PI*2); ctx.fill();
  ctx.fillRect(bkX+7.8*dpr, bkY+7.5*dpr+bob2, 2.4*dpr, 1.8*dpr);

  // Label
  ctx.fillStyle = '#aaffaa';
  ctx.font = 'bold ' + (7*dpr) + 'px Share Tech Mono,monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BARRACKS', bkX+bkW/2, bkY+bkH-3*dpr);
  ctx.textAlign = 'left';

  // Pulsing border
  const bkPulse = 0.4 + 0.35*Math.sin(t*2.2);
  ctx.strokeStyle = 'rgba(136,255,68,' + bkPulse + ')'; ctx.lineWidth = 1.5*dpr;
  ctx.strokeRect(bkX, bkY, bkW, bkH);
  _baseHitRects.barracks = { x:bkX/dpr, y:bkY/dpr, w:bkW/dpr, h:bkH/dpr };

  // ── RESEARCH LAB (right) — tap to Upgrades ────────────────
  const rlX = W*0.60, rlY = H-baseH+4*dpr;
  const rlW = W*0.18, rlH = baseH*0.82;

  const rlBodyCols  = ['#201c28','#28384a','#2c3e52','#28384a'];
  const rlInnerCols = ['#2c2838','#344a5c','#384e60','#344a5c'];
  ctx.fillStyle = rlBodyCols[baseTier];
  ctx.fillRect(rlX, rlY, rlW, rlH);
  ctx.fillStyle = rlInnerCols[baseTier];
  ctx.fillRect(rlX+2*dpr, rlY+2*dpr, rlW-4*dpr, rlH-4*dpr);

  // Roof
  if (baseTier===0) {
    ctx.fillStyle = '#303040';
    ctx.beginPath(); ctx.moveTo(rlX-2*dpr,rlY); ctx.lineTo(rlX+rlW/2,rlY-5*dpr); ctx.lineTo(rlX+rlW+2*dpr,rlY); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = baseTier>=2 ? '#1a2430' : '#1e2e3a';
    ctx.fillRect(rlX-2*dpr, rlY-(baseTier>=2?2:0), rlW+4*dpr, 5*dpr+(baseTier>=2?2:0));
  }

  // Dish/antenna — grows with tier
  const dishH = (6 + baseTier*3)*dpr;
  ctx.fillStyle = '#5a8090';
  ctx.fillRect(rlX+rlW/2-1*dpr, rlY-dishH, 2*dpr, dishH);
  ctx.strokeStyle = '#22d4ff'; ctx.lineWidth = (1+baseTier*0.4)*dpr;
  ctx.beginPath(); ctx.arc(rlX+rlW/2, rlY-dishH, (4+baseTier*1.5)*dpr, Math.PI, Math.PI*2); ctx.stroke();

  // Windows
  ctx.fillStyle = '#22d4ff'; ctx.shadowColor = '#22d4ff'; ctx.shadowBlur = 5+baseTier*2;
  ctx.fillRect(rlX+4*dpr, rlY+4*dpr, 6*dpr, 4*dpr);
  ctx.fillRect(rlX+rlW-10*dpr, rlY+4*dpr, 6*dpr, 4*dpr);
  ctx.shadowBlur = 0;

  // Door
  ctx.fillStyle = '#0e1820';
  ctx.fillRect(rlX+rlW/2-4*dpr, rlY+rlH*0.45, 8*dpr, rlH*0.55);

  // Label
  ctx.fillStyle = '#aaddff';
  ctx.font = 'bold ' + (7*dpr) + 'px Share Tech Mono,monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RESEARCH', rlX+rlW/2, rlY+rlH-3*dpr);
  ctx.textAlign = 'left';

  // Pulsing border
  const rlPulse = 0.4+0.35*Math.sin(t*2.2+1.0);
  ctx.strokeStyle = 'rgba(34,212,255,' + rlPulse + ')'; ctx.lineWidth = 1.5*dpr;
  ctx.strokeRect(rlX, rlY, rlW, rlH);
  _baseHitRects.research = { x:rlX/dpr, y:rlY/dpr, w:rlW/dpr, h:rlH/dpr };

  // Signal rings on research antenna
  const antX = rlX+rlW/2, antY = rlY - dishH;
  for (let ri=0; ri<3; ri++) {
    const rp = (t*1.2 + ri*0.55) % 1;
    ctx.strokeStyle = 'rgba(34,212,255,' + ((1-rp)*0.5) + ')';
    ctx.lineWidth = (1.5-rp)*dpr;
    ctx.shadowColor = '#22d4ff'; ctx.shadowBlur = 4*(1-rp);
    ctx.beginPath(); ctx.arc(antX, antY, 6*dpr + rp*22*dpr, 0, Math.PI*2); ctx.stroke();
  }
  ctx.shadowBlur = 0;

  ctx.textAlign = 'left';

  // HP bar — thick armored bar above base
  const hpf = state.baseHp / state.maxBaseHp;
  const hpCol = hpf > 0.5 ? '#18f06a' : hpf > 0.25 ? '#ffbe00' : '#ff3c3c';
  const hpBarH = 6*dpr;
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  ctx.fillRect(0, H - baseH - hpBarH, W, hpBarH);
  const hpGrad = ctx.createLinearGradient(0, 0, W * hpf, 0);
  hpGrad.addColorStop(0, hpCol);
  hpGrad.addColorStop(1, hpf > 0.5 ? '#80ffb0' : hpf > 0.25 ? '#ffe080' : '#ff8080');
  ctx.fillStyle = hpGrad;
  ctx.shadowColor = hpCol; ctx.shadowBlur = hpf < 0.5 ? 14 : 8;
  ctx.fillRect(0, H - baseH - hpBarH, W * hpf, hpBarH);
  ctx.shadowBlur = 0;

  // Base label
  ctx.fillStyle = '#a09080';
  ctx.font = 'bold ' + (8*dpr) + 'px Share Tech Mono,monospace';
  ctx.textAlign = 'center';
  ctx.fillText('COMMAND BASE', W/2, H - 4*dpr);
  ctx.textAlign = 'left';

  // ── FIGHTING POSITIONS — grouped near base wall ───────────
  // Three classic fighting positions packed close to the sandbag wall,
  // like WW1/WW2 trench formations. Each position has 5 men in a
  // 2-front + 3-back chevron. Positions are evenly spread left→right.
  //
  // Engine lane 0 = Left position, 1 = Center, 2 = Right
  // Engine slot 0-1 = front fire row, 2-4 = back support row

  const wallTop   = H - baseH - 8*dpr;  // top of the sandbag wall
  const posSpread = W / 3;              // each position owns 1/3 of width

  // Position centers (X) for left / center / right
  const posCenterX = [posSpread * 0.5, posSpread * 1.5, posSpread * 2.5];

  // Slot layout within each position — 2+3 chevron facing the enemy (upward)
  // Front row (slots 0-1): 2 men at the wall edge
  // Back row (slots 2-4): 3 men standing behind (further from wall = higher Y = deeper into field)
  const unitSpread = 17*dpr;  // horizontal spacing between men in same row
  const rowDepth   = 22*dpr;  // vertical gap between front and back row (negative = toward field)

  const slotLayout = [
    { dx: -unitSpread*0.5, dy: -rowDepth * 0.3 }, // slot 0 — front left (just above wall)
    { dx:  unitSpread*0.5, dy: -rowDepth * 0.3 }, // slot 1 — front right
    { dx: -unitSpread,     dy: -rowDepth * 1.2 }, // slot 2 — back left (higher in field)
    { dx:  0,              dy: -rowDepth * 1.2 }, // slot 3 — back center
    { dx:  unitSpread,     dy: -rowDepth * 1.2 }, // slot 4 — back right
  ];

  // Draw each fighting position with sandbag emplacement
  for (let pos = 0; pos < 3; pos++) {
    const pcx = posCenterX[pos];
    const posY = wallTop - 4*dpr; // anchored just above the wall

    const posColors = ['#22d4ff', '#b060ff', '#18f06a']; // L / C / R
    const posNames  = ['LEFT', 'CTR', 'RIGHT'];

    // Count troops in this position
    const troopsHere = state.troops.filter(trp => trp.lane === pos);

    // Sandbag emplacement — a small forward position marker
    const emplacW = unitSpread * 3.5;
    // Back sandbag arc
    ctx.fillStyle = troopsHere.length > 0 ? '#7a6330' : '#5a4820';
    ctx.beginPath();
    ctx.ellipse(pcx, posY + rowDepth + 8*dpr, emplacW*0.55, 5*dpr, 0, 0, Math.PI*2);
    ctx.fill();
    // Front sandbag row
    for (let bi = -2; bi <= 2; bi++) {
      const bx = pcx + bi * (emplacW * 0.22);
      ctx.fillStyle = bi % 2 === 0 ? '#8a7340' : '#7a6530';
      ctx.beginPath();
      ctx.ellipse(bx, posY + 4*dpr, emplacW*0.115, 3.5*dpr, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#4a3818'; ctx.lineWidth = 0.5*dpr;
      ctx.stroke();
    }

    // Position label + slot count
    const col = troopsHere.length > 0 ? posColors[pos] : 'rgba(100,110,120,.4)';
    ctx.fillStyle = col;
    ctx.font = 'bold ' + (6.5*dpr) + 'px Share Tech Mono,monospace';
    ctx.textAlign = 'center';
    ctx.fillText(posNames[pos] + ' ' + troopsHere.length + '/5', pcx, posY + rowDepth + 18*dpr);
    ctx.textAlign = 'left';

    // Empty slot markers
    for (let sl = 0; sl < 5; sl++) {
      const off  = slotLayout[sl];
      const px   = pcx + off.dx;
      const py   = posY + off.dy;
      const occ  = state.troops.find(trp => trp.lane === pos && trp.slot === sl);

      if (!occ) {
        ctx.strokeStyle = 'rgba(150,160,170,.2)';
        ctx.lineWidth   = 1*dpr;
        ctx.setLineDash([3*dpr, 3*dpr]);
        ctx.beginPath(); ctx.arc(px, py, 9*dpr, 0, Math.PI*2); ctx.stroke();
        ctx.setLineDash([]); ctx.lineWidth = 1;
      } else {
        // Shadow under occupied slot
        const sg = ctx.createRadialGradient(px, py + 9*dpr, 0, px, py + 9*dpr, 13*dpr);
        sg.addColorStop(0, 'rgba(0,0,0,.35)');
        sg.addColorStop(1, 'transparent');
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.ellipse(px, py + 9*dpr, 13*dpr, 5*dpr, 0, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  // Draw all troops at their fighting position slots
  for (const trp of state.troops) {
    const pos = trp.lane;
    const sl  = Math.min(trp.slot, 4);
    const off = slotLayout[sl];
    const px  = posCenterX[pos] + off.dx;
    const py  = (wallTop - 4*dpr) + off.dy;
    // Drop shadow — grounds each unit on the terrain
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.ellipse(px, py + 16*dpr, 9*dpr, 3*dpr, 0, 0, Math.PI*2);
    ctx.fill();

    _drawTroopV(ctx, px, py, trp, t, dpr);

    // Store for tap-to-swap
    trp._screenX = px / dpr;
    trp._screenY = py / dpr;
  }

  // ── Enemies ───────────────────────────────────────────────
  const _now = performance.now();
  for (const e of state.enemies) {
    if (e._spawnTime === undefined) e._spawnTime = _now;
    const spawnAge   = (_now - e._spawnTime) / 400;
    const spawnAlpha = Math.min(1, spawnAge);
    const ex = mapLane(e.lane);
    const ey = treeH + ((ORIG_W - e.x) / ORIG_W) * (H - baseH - treeH);

    // Ground shadow beneath each unit
    if (spawnAlpha > 0.3) {
      const er = Math.max(e.r * dpr * 0.75, 8*dpr);
      const shadowW = er * (e.kind === 'brute' ? 2.2 : e.kind === 'flyer' || e.kind === 'razorwing' ? 2.8 : 1.6);
      const shadowH = er * 0.3;
      const shadowY = ey + er * (e.kind === 'flyer' || e.kind === 'razorwing' ? 1.8 : 0.9);
      const sg = ctx.createRadialGradient(ex, shadowY, 0, ex, shadowY, shadowW);
      sg.addColorStop(0,   'rgba(0,0,0,' + (0.35 * spawnAlpha) + ')');
      sg.addColorStop(0.6, 'rgba(0,0,0,' + (0.15 * spawnAlpha) + ')');
      sg.addColorStop(1,   'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.ellipse(ex, shadowY, shadowW, shadowH, 0, 0, Math.PI*2); ctx.fill();
    }

    // Dust trail for brutes — heavy footfall kicks up dirt
    if (e.kind === 'brute' && spawnAlpha > 0.5 && !e.cloaked) {
      for (let di = 1; di <= 3; di++) {
        const dustProgress = ((ORIG_W - e.x + di * 80) / ORIG_W);
        const dustY = treeH + Math.min(dustProgress, 1) * (H - baseH - treeH);
        if (dustY > ey + 5*dpr) {
          const da = (0.12 - di * 0.035) * spawnAlpha;
          const dr = (8 + di * 4) * dpr;
          ctx.globalAlpha = da;
          ctx.fillStyle = '#8a6840';
          ctx.beginPath(); ctx.ellipse(ex + Math.sin(di*1.3)*6*dpr, dustY, dr, dr*0.4, 0, 0, Math.PI*2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    ctx.globalAlpha = spawnAlpha;
    _drawEnemyV(ctx, ex, ey, e, t, dpr);
    ctx.globalAlpha = 1;
  }

  // ── Projectiles — tracer rounds with muzzle flash ─────────
  for (const p of state.projectiles) {
    if (!p.target || p.target.hp <= 0) continue;
    const fromLane  = p.from ? p.from.lane : p.target.lane;
    const fromSlot  = p.from ? p.from.slot : 0;
    const fromX_scr = mapLane(fromLane);
    const fromY_scr = H - baseH - (20 + fromSlot * 24) * dpr;
    const toX_scr   = mapLane(p.target.lane);
    const toY_scr   = treeH + ((ORIG_W - p.target.x) / ORIG_W) * (H - baseH - treeH);
    const origFromX = 160 + fromSlot * 48;
    const frac      = Math.max(0, Math.min(1, (p.x - origFromX) / Math.max(1, p.target.x - origFromX)));
    const drawX_scr = fromX_scr + (toX_scr - fromX_scr) * frac;
    const drawY_scr = fromY_scr + (toY_scr - fromY_scr) * frac;
    const angle     = Math.atan2(toY_scr - fromY_scr, toX_scr - fromX_scr);
    const dist      = Math.hypot(toX_scr - fromX_scr, toY_scr - fromY_scr);

    ctx.save();
    ctx.translate(drawX_scr, drawY_scr);
    ctx.rotate(angle);

    if (p.type === 'sniper') {
      // Long bright tracer — glowing streak with hot core
      const len = Math.min(dist * 0.35, 40*dpr);
      const tg = ctx.createLinearGradient(-len, 0, 4*dpr, 0);
      tg.addColorStop(0,   'transparent');
      tg.addColorStop(0.5, p.color + '88');
      tg.addColorStop(1,   p.color);
      ctx.fillStyle = tg;
      ctx.shadowColor = p.color; ctx.shadowBlur = 10;
      ctx.fillRect(-len, -1.5*dpr, len + 4*dpr, 3*dpr);
      // Bright hot tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -1*dpr, 5*dpr, 2*dpr);

    } else if (p.type === 'grenadier') {
      // Tumbling grenade — round with spin lines
      ctx.shadowColor = p.color; ctx.shadowBlur = 8;
      ctx.fillStyle = p.color;
      const gr = 5*dpr;
      const wobble = Math.sin(frac * Math.PI * 4) * 5*dpr;
      ctx.translate(wobble, 0);
      ctx.beginPath(); ctx.arc(0, 0, gr, 0, Math.PI*2); ctx.fill();
      // Spin indicator
      const spinAngle = frac * Math.PI * 6;
      ctx.strokeStyle = '#ffffff55'; ctx.lineWidth = 1*dpr;
      ctx.beginPath(); ctx.moveTo(Math.cos(spinAngle)*gr, Math.sin(spinAngle)*gr);
      ctx.lineTo(Math.cos(spinAngle+Math.PI)*gr, Math.sin(spinAngle+Math.PI)*gr); ctx.stroke();
      // Short smoke trail
      for (let si = 1; si <= 3; si++) {
        ctx.globalAlpha = 0.15 / si;
        ctx.fillStyle = '#aaaaaa';
        ctx.beginPath(); ctx.arc(-si*7*dpr - wobble, 0, gr*(1-si*0.2), 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;

    } else if (p.type === 'heavy') {
      // Heavy round — thick tracer, pulsing glow
      const len = Math.min(dist * 0.25, 20*dpr);
      const tg = ctx.createLinearGradient(-len, 0, 6*dpr, 0);
      tg.addColorStop(0, 'transparent');
      tg.addColorStop(1, p.color);
      ctx.fillStyle = tg;
      ctx.shadowColor = p.color; ctx.shadowBlur = 12;
      ctx.fillRect(-len, -3*dpr, len + 6*dpr, 6*dpr);
      // Bright nose
      ctx.fillStyle = '#ffeeaa';
      ctx.beginPath(); ctx.arc(4*dpr, 0, 3.5*dpr, 0, Math.PI*2); ctx.fill();

    } else {
      // Standard rifle bullet — short bright tracer
      const len = Math.min(dist * 0.2, 14*dpr);
      const tg = ctx.createLinearGradient(-len, 0, 3*dpr, 0);
      tg.addColorStop(0, 'transparent');
      tg.addColorStop(1, p.color);
      ctx.fillStyle = tg;
      ctx.shadowColor = p.color; ctx.shadowBlur = 6;
      ctx.fillRect(-len, -1*dpr, len + 3*dpr, 2*dpr);
      // Tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -1*dpr, 3*dpr, 2*dpr);
    }

    ctx.shadowBlur = 0;
    ctx.restore();

    // Muzzle flash at troop position when bullet just spawned
    if (frac < 0.08) {
      const flashSize = (p.type === 'heavy' ? 9 : p.type === 'sniper' ? 7 : 5) * dpr;
      const flashAlpha = 1 - frac / 0.08;
      ctx.globalAlpha = flashAlpha * 0.85;
      ctx.shadowColor = p.color; ctx.shadowBlur = 15;
      // Flash cross
      ctx.fillStyle = '#ffeeaa';
      ctx.fillRect(fromX_scr - 1*dpr, fromY_scr - flashSize, 2*dpr, flashSize*2);
      ctx.fillRect(fromX_scr - flashSize, fromY_scr - 1*dpr, flashSize*2, 2*dpr);
      // Bloom
      const bg = ctx.createRadialGradient(fromX_scr, fromY_scr, 0, fromX_scr, fromY_scr, flashSize*1.5);
      bg.addColorStop(0, p.color + 'cc');
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(fromX_scr, fromY_scr, flashSize*1.5, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
  }

  // ── FX — combat spectacle ─────────────────────────────────
  for (const f of state.fx) {
    const a = f.life / f.max;
    ctx.globalAlpha = a;
    const fx_scr_y = f.x !== undefined
      ? treeH + ((ORIG_W - f.x) / ORIG_W) * (H - baseH - treeH)
      : H * 0.5;
    let fx_lane = 1;
    if (f.y !== undefined) { if (f.y < 260) fx_lane = 0; else if (f.y < 450) fx_lane = 1; else fx_lane = 2; }
    const fcx = mapLane(fx_lane);
    const fcy = fx_scr_y;

    if (f.kind === 'boom') {
      // Add persistent scorch mark at explosion site
      if (f.life / f.max > 0.95) {
        _addScorch(fcx, fcy, f.r * dpr * 2.2);
      }
      // Explosion — layered blast with shockwave ring
      const blastR = f.r * dpr * (1.4 + (1-a) * 2.2);
      const coreR  = f.r * dpr * a * 1.2;
      // Outer shockwave ring
      ctx.globalAlpha = a * 0.5;
      ctx.strokeStyle = 'rgba(255,180,60,' + a*0.6 + ')';
      ctx.lineWidth = 3*dpr;
      ctx.shadowColor = '#ff8820'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(fcx, fcy, blastR, 0, Math.PI*2); ctx.stroke();
      // Second ring
      ctx.strokeStyle = 'rgba(255,120,30,' + a*0.3 + ')';
      ctx.lineWidth = 1.5*dpr;
      ctx.beginPath(); ctx.arc(fcx, fcy, blastR * 0.65, 0, Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;
      // Fireball core
      ctx.globalAlpha = a;
      const fireGrad = ctx.createRadialGradient(fcx, fcy - coreR*0.2, 0, fcx, fcy, coreR);
      fireGrad.addColorStop(0,   'rgba(255,255,200,' + a + ')');
      fireGrad.addColorStop(0.3, 'rgba(255,200,60,' + a*0.95 + ')');
      fireGrad.addColorStop(0.7, 'rgba(255,80,20,' + a*0.7 + ')');
      fireGrad.addColorStop(1,   'rgba(100,30,5,0)');
      ctx.fillStyle = fireGrad;
      ctx.beginPath(); ctx.arc(fcx, fcy, coreR, 0, Math.PI*2); ctx.fill();
      // Smoke puff above explosion
      ctx.globalAlpha = a * 0.4;
      ctx.fillStyle = 'rgba(60,55,45,' + a*0.5 + ')';
      ctx.beginPath(); ctx.ellipse(fcx, fcy - coreR*0.8, coreR*0.9, coreR*0.6, 0, 0, Math.PI*2); ctx.fill();

    } else if (f.kind === 'orbital') {
      // Orbital strike — massive energy beam impact
      const orbR = f.r * dpr * (1.8 + (1-a) * 3.0);
      // Beam column from above
      ctx.globalAlpha = a * 0.7;
      const beamGrad = ctx.createLinearGradient(fcx - 8*dpr, 0, fcx + 8*dpr, 0);
      beamGrad.addColorStop(0,   'transparent');
      beamGrad.addColorStop(0.3, 'rgba(180,210,255,' + a*0.8 + ')');
      beamGrad.addColorStop(0.5, 'rgba(220,240,255,' + a + ')');
      beamGrad.addColorStop(0.7, 'rgba(180,210,255,' + a*0.8 + ')');
      beamGrad.addColorStop(1,   'transparent');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(fcx - 12*dpr, 0, 24*dpr, fcy);
      // Impact blast
      ctx.globalAlpha = a;
      const orbGrad = ctx.createRadialGradient(fcx, fcy, 0, fcx, fcy, orbR);
      orbGrad.addColorStop(0,   'rgba(240,250,255,' + a + ')');
      orbGrad.addColorStop(0.25,'rgba(160,210,255,' + a*0.9 + ')');
      orbGrad.addColorStop(0.6, 'rgba(80,150,255,' + a*0.5 + ')');
      orbGrad.addColorStop(1,   'rgba(40,80,255,0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath(); ctx.arc(fcx, fcy, orbR, 0, Math.PI*2); ctx.fill();
      // Shockwave rings
      for (let ri = 0; ri < 3; ri++) {
        ctx.globalAlpha = a * (0.6 - ri*0.15);
        ctx.strokeStyle = 'rgba(140,200,255,' + a + ')';
        ctx.lineWidth = (3-ri)*dpr;
        ctx.shadowColor = '#88ccff'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(fcx, fcy, orbR * (0.5 + ri*0.22), 0, Math.PI*2); ctx.stroke();
      }
      ctx.shadowBlur = 0;

    } else if (f.kind === 'heal') {
      ctx.globalAlpha = a;
      ctx.shadowColor = '#18f06a'; ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(24,240,106,' + a + ')'; ctx.lineWidth = 2*dpr;
      ctx.strokeRect(fcx - 7*dpr, fcy - 7*dpr, 14*dpr, 14*dpr);
      ctx.fillStyle = 'rgba(24,240,106,' + a*0.25 + ')';
      ctx.fillRect(fcx - 2*dpr, fcy - 7*dpr, 4*dpr, 14*dpr);
      ctx.fillRect(fcx - 7*dpr, fcy - 2*dpr, 14*dpr, 4*dpr);
      ctx.shadowBlur = 0;

    } else if (f.kind === 'hit') {
      // Impact spark — sharper, more energetic
      ctx.globalAlpha = a;
      ctx.shadowColor = '#ffdd44'; ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(255,230,80,' + a + ')';
      for (let si = 0; si < 4; si++) {
        const ang = (si / 4) * Math.PI * 2 + t * 3;
        const len = (4 + a*8) * dpr;
        ctx.fillRect(
          fcx + Math.cos(ang)*2*dpr - 1*dpr,
          fcy + Math.sin(ang)*2*dpr - len/2,
          2*dpr, len
        );
      }
      ctx.shadowBlur = 0;

    } else if (f.kind === 'emp') {
      ctx.globalAlpha = a;
      ctx.shadowColor = '#b060ff'; ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(176,96,255,' + a + ')'; ctx.lineWidth = 2.5*dpr;
      ctx.beginPath(); ctx.arc(fcx, fcy, (4+(1-a)*28)*dpr, 0, Math.PI*2); ctx.stroke();
      ctx.lineWidth = 1*dpr;
      ctx.strokeStyle = 'rgba(200,140,255,' + a*0.4 + ')';
      ctx.beginPath(); ctx.arc(fcx, fcy, (4+(1-a)*16)*dpr, 0, Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;

    } else if (f.kind === 'muzzle') {
      // Add muzzle glow on ground and shell casing
      if (f.life / f.max > 0.85) {
        _addMuzzleGlow(fcx, fcy + 10*dpr, 28*dpr);
        _addCasing(fcx + (Math.random()-0.5)*8*dpr, fcy + 4*dpr);
      }
      ctx.globalAlpha = a;
      ctx.shadowColor = '#ffcc88'; ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(255,220,140,' + a + ')';
      ctx.beginPath(); ctx.arc(fcx, fcy, (3+(1-a)*7)*dpr, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(180,170,150,' + a*0.4 + ')';
      ctx.beginPath(); ctx.arc(fcx, fcy - 3*dpr*(1-a), (5+(1-a)*10)*dpr, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

    } else if (f.kind === 'reveal') {
      ctx.globalAlpha = a;
      ctx.shadowColor = '#50c890'; ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(80,200,144,' + a + ')'; ctx.lineWidth = 2*dpr;
      ctx.beginPath(); ctx.arc(fcx, fcy, (4+(1-a)*26)*dpr, 0, Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;

    } else if (f.kind === 'phase') {
      ctx.globalAlpha = a;
      ctx.shadowColor = '#c050d8'; ctx.shadowBlur = 14;
      ctx.strokeStyle = 'rgba(192,80,216,' + a + ')'; ctx.lineWidth = 3*dpr;
      ctx.beginPath(); ctx.arc(fcx, fcy, (4+(1-a)*34)*dpr, 0, Math.PI*2); ctx.stroke();
      ctx.lineWidth = 1.5*dpr;
      ctx.strokeStyle = 'rgba(220,120,240,' + a*0.5 + ')';
      ctx.beginPath(); ctx.arc(fcx, fcy, (4+(1-a)*20)*dpr, 0, Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
  ctx.globalAlpha = 1;

  // ── Boss wave full-screen atmosphere ──────────────────────
  if (state.waveInProgress && state.wave % CFG.BOSS_WAVE_EVERY === 0) {
    const bossIntensity = 0.18 + 0.08 * Math.sin(t * 1.8);
    // Deep crimson vignette
    const bossVig = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*0.8);
    bossVig.addColorStop(0,   'transparent');
    bossVig.addColorStop(0.6, 'rgba(80,0,0,' + bossIntensity*0.5 + ')');
    bossVig.addColorStop(1,   'rgba(120,0,0,' + bossIntensity + ')');
    ctx.fillStyle = bossVig;
    ctx.fillRect(0, 0, W, H);
    // Top and bottom edge bars
    const edgeGrad = ctx.createLinearGradient(0, 0, 0, H*0.12);
    edgeGrad.addColorStop(0, 'rgba(180,0,0,' + bossIntensity*0.6 + ')');
    edgeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, W, H*0.12);
    const botGrad = ctx.createLinearGradient(0, H*0.88, 0, H);
    botGrad.addColorStop(0, 'transparent');
    botGrad.addColorStop(1, 'rgba(180,0,0,' + bossIntensity*0.4 + ')');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H*0.88, W, H*0.12);
    // Occasional lightning flash in sky
    if (Math.sin(t * 7.3) > 0.92) {
      ctx.globalAlpha = (Math.sin(t*7.3) - 0.92) * 8;
      ctx.fillStyle = 'rgba(255,220,180,.3)';
      ctx.fillRect(0, 0, W, treeH * 1.5);
      ctx.globalAlpha = 1;
    }
  }

  // ── Paused overlay ────────────────────────────────────────
  if (state.paused && state.started && !state.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.shadowColor = '#22d4ff'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#22d4ff';
    ctx.font = 'bold ' + (36*dpr) + 'px Rajdhani,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', W/2, H/2);
    ctx.shadowBlur = 0; ctx.textAlign = 'left';
  }
}

// ── Troop drawing (vertical) — representative silhouettes ─────
function _drawTroopV(ctx, x, y, t, time, dpr) {
  // Mil-spec palette: Tactical Olive armor, IFF Cyan accent lights
  const OLIVE   = '#4B5320';
  const OLIVE2  = '#5a6428';  // lighter olive highlight
  const OLIVE3  = '#3a4118';  // shadow/legs
  const IFF     = '#00E5FF';  // IFF cyan — identification markings
  // Promotion overlay palette — declared here to avoid temporal dead zone
  const OLIVE_P = '#4B5320';
  const IFF_P   = '#00E5FF';
  const promoted = t._promoted || 0;
  const hf      = t.hp / t.maxHp;  // health fraction — used for HP bar and danger ring

  // Use IFF cyan glow intensity based on promotion tier
  const iffGlow = 4 + promoted * 3;
  const s = dpr;
  ctx.save();
  const swayX = Math.sin(time * 1.4 + t.slot * 1.8) * 0.8 * dpr;
  const swayY = Math.sin(time * 1.1 + t.slot * 2.2) * 0.5 * dpr;
  ctx.translate(x + swayX, y + swayY);
  ctx.shadowColor = IFF; ctx.shadowBlur = iffGlow;

  // Draw troop sprite image (replaces procedural drawing)
  const sprite = TROOP_SPRITES[t.type.id];
  const TROOP_SZ = { rifle: 42, heavy: 50, medic: 42, grenadier: 46, ew: 42, sniper: 44 };
  const sz = (TROOP_SZ[t.type.id] || 42) * s;
  ctx.shadowBlur = 0; // no glow on sprite itself
  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    ctx.drawImage(sprite, -sz/2, -sz * 0.64, sz, sz);
  } else {
    // Fallback circle if image not yet loaded
    ctx.fillStyle = OLIVE;
    ctx.beginPath(); ctx.arc(0, 0, 9*s, 0, Math.PI*2); ctx.fill();
  }

  // Animated class-specific FX overlays (on top of sprite)
  if (t.type.id === 'medic') {
    // Healing pulse ring
    var pr = 0.3 + 0.3 * Math.sin(time * 2.5);
    ctx.strokeStyle = 'rgba(0,229,255,' + pr + ')';
    ctx.lineWidth = 1.5*s;
    ctx.beginPath(); ctx.arc(0, 0, (14 + pr*4)*s, 0, Math.PI*2); ctx.stroke();
  } else if (t.type.id === 'ew') {
    // Signal wave arcs above unit
    var wav = 0.4 + 0.4 * Math.sin(time * 3);
    for (var si = 1; si <= 3; si++) {
      ctx.strokeStyle = 'rgba(0,229,255,' + (wav * (0.5 - si*0.12)) + ')';
      ctx.lineWidth = 1*s;
      ctx.beginPath();
      ctx.arc(0, -26*s, si * 5*s, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
    }
  }

  ctx.shadowBlur = 0;
  ctx.restore();

  // ── Promotion visual tier overlay ─────────────────────
  const swayXp   = Math.sin(time * 1.4 + t.slot * 1.8) * 0.8 * dpr;
  const swayYp   = Math.sin(time * 1.1 + t.slot * 2.2) * 0.5 * dpr;
  if (promoted > 0) {
    ctx.save();
    ctx.translate(x + swayXp, y + swayYp);

    // Tier 1+: class-specific upgrade
    if (t.type.id === 'rifle') {
      ctx.fillStyle = '#ffd166';
      ctx.shadowColor = '#ffd166'; ctx.shadowBlur = promoted >= 3 ? 8 : 4;
      ctx.fillRect(-5*s, -1*s, 2*s, 5*s);
      ctx.fillRect(-5*s, 1*s, 10*s, 1.2*s);
      ctx.shadowBlur = 0;
      if (promoted >= 2) { ctx.fillStyle = '#aaaaaa'; ctx.fillRect(2.5*s, -12*s, 4*s, 2*s); }
      if (promoted >= 3) { // red dot scope
        ctx.fillStyle = '#ff4444'; ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.arc(4.5*s, -11*s, 1.5*s, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
      }
      if (promoted >= 4) { // underbarrel grenade launcher stub
        ctx.fillStyle = '#888';
        ctx.fillRect(2*s, -5*s, 3*s, 5*s);
      }
      if (promoted >= 5) { // gold barrel tip
        ctx.fillStyle = '#ffd166'; ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 6;
        ctx.fillRect(2.8*s, -17*s, 1.5*s, 2*s); ctx.shadowBlur = 0;
      }

    } else if (t.type.id === 'heavy') {
      ctx.fillStyle = '#e0c060';
      ctx.shadowColor = '#e0c060'; ctx.shadowBlur = promoted >= 3 ? 8 : 4;
      ctx.fillRect(-10*s, -4*s, 3*s, 6*s);
      ctx.fillRect(7*s, -4*s, 3*s, 6*s);
      ctx.shadowBlur = 0;
      if (promoted >= 2) { ctx.fillStyle = '#888'; ctx.fillRect(4.5*s, -16*s, 5*s, 3*s); }
      if (promoted >= 3) { // extra chest armour
        ctx.fillStyle = '#e0c060aa';
        ctx.fillRect(-6*s, -2*s, 12*s, 4*s);
      }
      if (promoted >= 4) { // dual barrel
        ctx.fillStyle = OLIVE_P;
        ctx.fillRect(9*s, -18*s, 3*s, 14*s);
      }
      if (promoted >= 5) { // golden trim
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1*s; ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 6;
        ctx.strokeRect(-9*s, -3*s, 18*s, 12*s); ctx.shadowBlur = 0;
      }

    } else if (t.type.id === 'medic') {
      const crossCol = promoted >= 3 ? '#44aaff' : promoted >= 2 ? '#66ccff' : '#4488ff';
      ctx.fillStyle = crossCol;
      ctx.shadowColor = crossCol; ctx.shadowBlur = promoted >= 3 ? 10 : 6;
      ctx.fillRect(-1.2*s, -4*s, 2.4*s, 8*s);
      ctx.fillRect(-4*s, -0.5*s, 8*s, 2*s);
      ctx.shadowBlur = 0;
      if (promoted >= 2) { ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(0, -8*s, 2*s, 0, Math.PI*2); ctx.fill(); }
      if (promoted >= 4) { // second med bag
        ctx.fillStyle = '#ffffff88'; ctx.fillRect(-9*s, 1*s, 5*s, 4*s);
      }
      if (promoted >= 5) { // halo ring
        ctx.strokeStyle = '#44aaff'; ctx.lineWidth = 1.2*s; ctx.shadowColor = '#44aaff'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(0, -10*s, 5*s, 0, Math.PI*2); ctx.stroke(); ctx.shadowBlur = 0;
      }

    } else if (t.type.id === 'ew') {
      ctx.fillStyle = OLIVE_P;
      ctx.fillRect(2*s, -18*s, 1.5*s, 12*s);
      ctx.strokeStyle = '#b060ff';
      ctx.shadowColor = '#b060ff'; ctx.shadowBlur = promoted >= 3 ? 10 : 6;
      ctx.lineWidth = 1.2*s;
      ctx.beginPath(); ctx.arc(2.5*s, -18*s, (3 + promoted)*s, 0.2, Math.PI-0.2); ctx.stroke();
      ctx.shadowBlur = 0;
      if (promoted >= 3) { // third antenna
        ctx.fillStyle = OLIVE_P; ctx.fillRect(5*s, -14*s, 1.2*s, 8*s);
      }
      if (promoted >= 5) { // neural net halo
        ctx.strokeStyle = '#b060ff'; ctx.lineWidth = s; ctx.shadowColor = '#b060ff'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(0, 0, 18*s, 0, Math.PI*2); ctx.stroke(); ctx.shadowBlur = 0;
      }

    } else if (t.type.id === 'grenadier') {
      ctx.fillStyle = '#cc8833';
      ctx.shadowColor = '#cc8833'; ctx.shadowBlur = promoted >= 3 ? 8 : 4;
      for (var gi = 0; gi < Math.min(promoted + 3, 6); gi++) {
        ctx.beginPath(); ctx.ellipse(-6*s + gi*2.8*s, -1*s, 1.5*s, 2*s, 0, 0, Math.PI*2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      if (promoted >= 2) { ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(5.5*s, -18*s, 1.8*s, 0, Math.PI*2); ctx.fill(); }
      if (promoted >= 3) { // wider muzzle bell
        ctx.fillStyle = OLIVE_P; ctx.fillRect(1*s, -23*s, 9*s, 3*s);
      }
      if (promoted >= 5) { // dual launcher
        ctx.fillStyle = OLIVE_P; ctx.fillRect(-8*s, -20*s, 4*s, 16*s); ctx.fillRect(-9*s, -22*s, 6*s, 3*s);
      }

    } else if (t.type.id === 'sniper') {
      ctx.fillStyle = '#888888';
      ctx.fillRect(4.5*s, -(28 + promoted*1.5)*s, 6*s, 4*s);
      if (promoted >= 2) { ctx.fillStyle = '#ffd166'; ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(7*s, -(27+promoted)*s, 1.5*s, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0; }
      if (promoted >= 3) { // laser sight line
        ctx.strokeStyle = 'rgba(255,80,80,.4)'; ctx.lineWidth = 0.8*s;
        ctx.beginPath(); ctx.moveTo(7*s, -26*s); ctx.lineTo(7*s, -60*s); ctx.stroke();
      }
      if (promoted >= 4) { // ghillie glow
        ctx.strokeStyle = c + '44'; ctx.lineWidth = 2*s;
        ctx.beginPath(); ctx.ellipse(0, 0, 12*s, 5*s, 0, 0, Math.PI*2); ctx.stroke();
      }
      if (promoted >= 5) { // gold stock
        ctx.fillStyle = '#ffd166'; ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 6;
        ctx.fillRect(-11*s, -3*s, 5*s, 5*s); ctx.shadowBlur = 0;
      }
    }

    // Star rank indicators — 1 to 5 stars above unit
    const starCount = promoted;
    const starSpacing = 5*s;
    const starStartX  = -(starCount-1)*starSpacing/2;
    ctx.font = (5 + Math.min(promoted,3))*s + 'px serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd166';
    ctx.shadowColor = '#ffd166'; ctx.shadowBlur = promoted >= 5 ? 10 : 5;
    for (var si = 0; si < starCount; si++) {
      ctx.fillText('★', starStartX + si*starSpacing, -29*s);
    }
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';

    ctx.restore();
  }
  const bw = 28*dpr;
  ctx.fillStyle = 'rgba(0,0,0,.65)';
  ctx.fillRect(x - bw/2, y - 26*dpr, bw, 3*dpr);
  const troopHpCol = hf > 0.5 ? '#30b048' : hf > 0.25 ? '#c89020' : '#c04040';
  ctx.fillStyle = troopHpCol;
  ctx.shadowColor = troopHpCol; ctx.shadowBlur = hf < 0.25 ? 6 : 0;
  ctx.fillRect(x - bw/2, y - 26*dpr, bw * hf, 3*dpr);
  ctx.shadowBlur = 0;

  // Update 4: Low-HP danger pulse ring around troop
  if (hf < 0.35) {
    const pulse = 0.4 + 0.6 * Math.abs(Math.sin(time * 4 + t.slot));
    ctx.strokeStyle = 'rgba(255,60,60,' + (pulse * 0.7) + ')';
    ctx.lineWidth   = 2 * dpr;
    ctx.shadowColor = '#ff3c3c';
    ctx.shadowBlur  = 8 * pulse;
    ctx.beginPath();
    ctx.arc(x, y, 14 * dpr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth  = 1;
  }
}

// ── Enemy drawing — Crimson Red palette, tiered silhouettes ───
// TIER 1 (W1-20):  Drones (grunt), Specters (runner)
// TIER 2 (W20-50): Bulwarks (brute/shield), Seekers (razorwing)
// TIER 3 (W50+):   Titan (siege), Commanders (warlord/phaselord)
// MUTATIONS: W100+ Toxic Green, W200+ Phantom Blue
//
// Core palette: Crimson #DC143C with 0.5px bloom glow
const CRIMSON = '#DC143C';
const CRIMSON_DIM = 'rgba(220,20,60,';
const TOXIC  = '#39FF14';
const PHANTOM = '#001CFF';

function _enemyColor(e, wave) {
  // Mutation overrides at high waves
  if (wave >= 200 && (e.kind === 'grunt' || e.kind === 'runner') && e._mutation === 'phantom')
    return PHANTOM;
  if (wave >= 100 && (e.kind === 'grunt' || e.kind === 'runner') && e._mutation === 'toxic')
    return TOXIC;
  // All enemies use crimson palette — override engine colors
  if (e.kind === 'phaselord') return '#cc44ee'; // keep phaselord purple identity
  return CRIMSON;
}

function _enemyGlow(e, wave) {
  const c = _enemyColor(e, wave);
  if (c === TOXIC)   return '#39FF14';
  if (c === PHANTOM) return '#4466ff';
  if (e.kind === 'phaselord') return '#cc44ee';
  return CRIMSON;
}

function _drawEnemyV(ctx, x, y, e, time, dpr) {
  const { r, kind, hp, maxHp, shield, maxShield, slow, cloaked } = e;
  const hf    = hp / maxHp;
  const wave  = (typeof G !== 'undefined' && G.state) ? (G.state.wave || 1) : 1;

  // Mutation assignment — seeded per enemy so it's consistent
  if (!e._mutation && wave >= 100) {
    const roll = ((e.x || 0) * 7 + (e.y || 0) * 3 + wave) % 100;
    if (wave >= 200 && roll < 15) e._mutation = 'phantom';
    else if (wave >= 100 && roll < 30) e._mutation = 'toxic';
    else e._mutation = 'normal';
  }

  const drawColor = _enemyColor(e, wave);
  const glowColor = _enemyGlow(e, wave);

  // Specter / phantom camo
  const isSpecter = kind === 'runner';
  const isCamoActive = isSpecter && !e._mutation && Math.sin(time * 3.2 + (e.x || 0) * 0.01) > 0.55;
  const phantomInvis = e._mutation === 'phantom' && slow <= 0;
  const baseAlpha = phantomInvis ? 0.12 : (cloaked && slow <= 0) ? 0.18 : isCamoActive ? 0.35 : 1;
  ctx.globalAlpha = baseAlpha;

  // Hit flash
  const hitFlash = e._hitFlash || 0;
  if (hitFlash > 0) e._hitFlash = Math.max(0, hitFlash - 0.016 * (_gameSpeed || 1));

  // Core glow — crimson bloom
  ctx.shadowColor = hitFlash > 0 ? '#ffffff' : glowColor;
  ctx.shadowBlur  = hitFlash > 0 ? 22 : 6; // tight 0.5px-feel bloom

  const s  = dpr;
  const er = Math.max(r * s * 0.75, 8 * s);

  // Movement
  const spd = slow > 0 ? 0.35 : 1.0;
  let moveX = 0, moveY = 0;
  if (kind === 'runner')   { moveY = Math.sin(time*14*spd+e.lane)*2.5*s; moveX = Math.cos(time*7*spd+e.lane)*1.0*s; }
  else if (kind === 'brute')   { moveY = Math.abs(Math.sin(time*3.5*spd+e.lane))*3*s; moveX = Math.sin(time*1.8*spd)*1.5*s; }
  else if (kind === 'flyer' || kind === 'razorwing') { moveX = Math.sin(time*2.8*spd+e.lane*1.3)*7*s; moveY = Math.cos(time*2.0*spd+e.lane)*3*s; }
  else if (kind === 'stalker') { moveX = Math.sin(time*2.5*spd+e.lane)*5*s; moveY = Math.cos(time*3.0*spd)*2*s; }
  else { moveX = Math.sin(time*4*spd+e.lane*0.8)*1.5*s; moveY = Math.abs(Math.sin(time*4*spd+e.lane))*1.5*s; }

  // Drone pixelated trail (grunt + runner)
  if ((kind === 'grunt' || kind === 'runner') && baseAlpha > 0.3) {
    const trailColor = drawColor;
    for (var ti = 1; ti <= 4; ti++) {
      const ta = (0.18 - ti * 0.04) * baseAlpha;
      const tx2 = x + moveX + ti * 6 * s;
      const ty2 = y + moveY;
      const tr  = Math.max(2, (er * 0.4 - ti * 0.5)) * s;
      ctx.globalAlpha = ta;
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = trailColor;
      // Pixelated — small squares not circles
      const ps = Math.max(1.5, tr * 0.7);
      ctx.fillRect(tx2 - ps/2, ty2 - ps/2, ps, ps);
    }
    ctx.globalAlpha = baseAlpha;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur  = hitFlash > 0 ? 22 : 6;
  }

  ctx.save();
  ctx.translate(x + moveX, y + moveY);
  ctx.fillStyle = drawColor;

  // ── TIER 1: DRONES (grunt) — sharp chevron/triangle silhouette ──
  if (kind === 'grunt') {
    // Angular chevron body — sleek, forward-leaning
    ctx.beginPath();
    ctx.moveTo(0, -14*s);      // nose tip
    ctx.lineTo(10*s, 4*s);     // right wing back
    ctx.lineTo(5*s, 1*s);      // right wing notch
    ctx.lineTo(0, 6*s);        // tail center
    ctx.lineTo(-5*s, 1*s);     // left wing notch
    ctx.lineTo(-10*s, 4*s);    // left wing back
    ctx.closePath();
    ctx.fill();
    // Engine glow dot at tail
    ctx.shadowColor = glowColor; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(0, 4*s, 2*s, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 6;

  // ── TIER 1: SPECTERS (runner) — razor-thin W silhouette ──
  } else if (kind === 'runner') {
    // Stealth fighter W shape
    ctx.beginPath();
    ctx.moveTo(0, -16*s);         // center nose
    ctx.lineTo(6*s, -4*s);        // right inner
    ctx.lineTo(12*s, -12*s);      // right outer tip
    ctx.lineTo(14*s, 2*s);        // right trailing
    ctx.lineTo(6*s, -2*s);        // right inner trailing
    ctx.lineTo(0, 4*s);           // center tail
    ctx.lineTo(-6*s, -2*s);       // left inner trailing
    ctx.lineTo(-14*s, 2*s);       // left trailing
    ctx.lineTo(-12*s, -12*s);     // left outer tip
    ctx.lineTo(-6*s, -4*s);       // left inner
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 6;

  // ── TIER 2: BULWARKS (brute) — heavy hexagonal armored plate ──
  } else if (kind === 'brute') {
    // Hexagonal shield-like body — forward-leaning slab
    const hw = 13*s, hh = 10*s;
    ctx.beginPath();
    ctx.moveTo(0, -hh*1.3);          // top point (forward lean)
    ctx.lineTo(hw, -hh*0.4);
    ctx.lineTo(hw*0.9, hh*0.8);
    ctx.lineTo(0, hh*1.1);
    ctx.lineTo(-hw*0.9, hh*0.8);
    ctx.lineTo(-hw, -hh*0.4);
    ctx.closePath();
    ctx.fill();
    // Armored plate lines
    ctx.globalAlpha = baseAlpha * 0.4;
    ctx.strokeStyle = glowColor; ctx.lineWidth = 1*s;
    ctx.beginPath(); ctx.moveTo(-hw*0.6, -hh*0.2); ctx.lineTo(hw*0.6, -hh*0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hw*0.4, hh*0.4); ctx.lineTo(hw*0.4, hh*0.4); ctx.stroke();
    ctx.globalAlpha = baseAlpha;
    ctx.shadowBlur = 6;
    // Shield flare on hit
    if (hitFlash > 0) {
      ctx.globalAlpha = hitFlash * 0.8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5*s;
      ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(0, -hh*1.3); ctx.lineTo(hw, -hh*0.4);
      ctx.lineTo(hw*0.9, hh*0.8); ctx.lineTo(0, hh*1.1);
      ctx.lineTo(-hw*0.9, hh*0.8); ctx.lineTo(-hw, -hh*0.4);
      ctx.closePath(); ctx.stroke();
      ctx.shadowBlur = 6;
      ctx.globalAlpha = baseAlpha;
    }

  // ── TIER 2: SEEKERS (razorwing) — erratic segmented energy orb ──
  } else if (kind === 'razorwing') {
    // Jagged segmented square — unstable data cluster
    const jitter = Math.sin(time * 18) * 1.5*s;
    ctx.beginPath();
    ctx.moveTo(-8*s + jitter, -10*s);
    ctx.lineTo(10*s, -8*s - jitter);
    ctx.lineTo(11*s + jitter, 6*s);
    ctx.lineTo(3*s, 11*s + jitter);
    ctx.lineTo(-10*s, 9*s - jitter);
    ctx.lineTo(-11*s - jitter, -3*s);
    ctx.closePath();
    ctx.fill();
    // Flashing red warning light
    const flashPulse = Math.abs(Math.sin(time * 8 + (e.x||0)*0.05));
    ctx.globalAlpha = baseAlpha * flashPulse;
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(0, 0, 3.5*s, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = baseAlpha;
    ctx.shadowColor = glowColor; ctx.shadowBlur = 6;

  // ── SHIELD ENEMY — keep existing but crimson palette ──
  } else if (kind === 'shield') {
    ctx.beginPath(); ctx.arc(0, 0, er, 0, Math.PI*2); ctx.fill();
    if (shield > 0) {
      const shf = shield / maxShield;
      ctx.strokeStyle = CRIMSON_DIM + (0.4 + shf*0.6) + ')';
      ctx.lineWidth = 3*s;
      ctx.shadowColor = glowColor; ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0,-16*s); ctx.lineTo(8*s,-8*s); ctx.lineTo(7*s,2*s);
      ctx.lineTo(0,6*s); ctx.lineTo(-7*s,2*s); ctx.lineTo(-8*s,-8*s);
      ctx.closePath(); ctx.stroke();
      ctx.shadowBlur = 6;
    }

  // ── FLYER — crimson palette, keep silhouette ──
  } else if (kind === 'flyer') {
    const flap = Math.sin(time * 7 * spd) * 4*s;
    ctx.beginPath(); ctx.ellipse(0, 0, 4*s, 7*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -9*s, 3.5*s, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = CRIMSON_DIM + '0.7)';
    ctx.beginPath(); ctx.moveTo(-4*s,-2*s); ctx.lineTo(-20*s,-8*s+flap); ctx.lineTo(-14*s,2*s+flap); ctx.lineTo(-4*s,4*s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4*s,-2*s);  ctx.lineTo(20*s,-8*s+flap);  ctx.lineTo(14*s,2*s+flap);  ctx.lineTo(4*s,4*s);  ctx.closePath(); ctx.fill();

  // ── STALKER — crimson palette ──
  } else if (kind === 'stalker') {
    ctx.beginPath(); ctx.ellipse(0, 0, 5*s, 7*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = CRIMSON_DIM + '1)';
    ctx.beginPath(); ctx.arc(0, -4*s, 2*s, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = drawColor; ctx.lineWidth = 1.5*s; ctx.lineCap = 'round';
    [-0.8,-0.4,0.4,0.8].forEach(function(a) {
      var lx = Math.sin(a)*6*s + Math.sin(time*4+a)*1*s;
      ctx.beginPath(); ctx.moveTo(lx,-2*s); ctx.lineTo(lx*2.2,-10*s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx,2*s);  ctx.lineTo(lx*2.2,10*s);  ctx.stroke();
    });
    ctx.lineCap = 'butt';

  // ── TIER 3: TITAN (siege) — industrial walker, pulsing energy core ──
  } else if (kind === 'siege') {
    // Massive walker body — dominates lane width
    // Lower body / treads
    ctx.fillRect(-18*s, 2*s, 36*s, 10*s);
    ctx.fillRect(-20*s, 8*s, 40*s, 6*s); // wider tread base
    // Upper chassis
    ctx.fillRect(-14*s, -8*s, 28*s, 12*s);
    // Shoulder pylons
    ctx.fillRect(-22*s, -4*s, 6*s, 10*s);
    ctx.fillRect(16*s,  -4*s, 6*s, 10*s);
    // Head/turret
    ctx.beginPath(); ctx.arc(0, -12*s, 9*s, 0, Math.PI*2); ctx.fill();
    // Main cannon
    ctx.fillRect(-3*s, -28*s, 6*s, 18*s);
    ctx.fillRect(-5*s, -30*s, 10*s, 5*s); // muzzle
    // Outline glow
    ctx.shadowColor = glowColor; ctx.shadowBlur = 16;
    ctx.strokeStyle = CRIMSON_DIM + '0.5)'; ctx.lineWidth = 1.5*s;
    ctx.strokeRect(-14*s, -8*s, 28*s, 12*s);
    ctx.shadowBlur = 6;
    // Pulsing energy core — the ONLY non-red part
    const corePulse = 0.5 + 0.5 * Math.sin(time * 3.2);
    const coreSize  = (4 + corePulse * 2) * s;
    ctx.globalAlpha = baseAlpha;
    ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 12 + corePulse * 8;
    ctx.fillStyle = 'rgba(0,220,255,' + (0.7 + corePulse * 0.3) + ')';
    ctx.beginPath(); ctx.arc(0, -2*s, coreSize, 0, Math.PI*2); ctx.fill();
    ctx.shadowColor = glowColor; ctx.shadowBlur = 6;
    ctx.fillStyle = drawColor;

  // ── WARLORD — crimson palette with gold crown ──
  } else if (kind === 'warlord') {
    ctx.fillRect(-9*s,-4*s,18*s,16*s);
    ctx.beginPath(); ctx.arc(0,-8*s,7*s,0,Math.PI*2); ctx.fill();
    // Crown spikes in brighter crimson
    ctx.fillStyle = CRIMSON_DIM + '0.5)';
    ctx.shadowColor = glowColor; ctx.shadowBlur = 10;
    for (var i=-2;i<=2;i++) {
      ctx.beginPath(); ctx.moveTo(i*3*s,-14*s); ctx.lineTo(i*3*s-2*s,-18*s); ctx.lineTo(i*3*s+2*s,-18*s); ctx.closePath(); ctx.fill();
    }
    ctx.shadowBlur = 6;
    ctx.fillStyle = drawColor;
    ctx.fillRect(-14*s,-6*s,7*s,6*s);
    ctx.fillRect(7*s,-6*s,7*s,6*s);
    var dp = 0.3+0.3*Math.sin(time*2);
    ctx.strokeStyle = CRIMSON_DIM + dp + ')'; ctx.lineWidth = 1.5*s;
    ctx.beginPath(); ctx.arc(0,0,20*s,0,Math.PI*2); ctx.stroke();

  // ── PHASELORD — keep purple identity, add crimson accents ──
  } else if (kind === 'phaselord') {
    ctx.fillStyle = '#aa2288';
    ctx.beginPath();
    ctx.moveTo(0,-14*s); ctx.lineTo(10*s,0); ctx.lineTo(12*s,12*s);
    ctx.lineTo(0,15*s); ctx.lineTo(-12*s,12*s); ctx.lineTo(-10*s,0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = drawColor;
    ctx.beginPath(); ctx.arc(0,-16*s,6*s,0,Math.PI*2); ctx.fill();
    for (var ring=1;ring<=3;ring++) {
      var rot = time*(ring*0.8)*(ring%2===0?-1:1);
      var rr  = (8+ring*5)*s;
      ctx.save(); ctx.rotate(rot);
      ctx.strokeStyle = 'rgba(220,20,60,'+(0.5-ring*0.12)+')'; ctx.lineWidth = 1.5*s;
      ctx.beginPath(); ctx.ellipse(0,0,rr,rr*0.4,0,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    if (e.phaseWarn > 0) {
      var wf = e.phaseWarn/2.2;
      ctx.shadowColor=CRIMSON; ctx.shadowBlur=20;
      ctx.strokeStyle=CRIMSON_DIM+wf+')'; ctx.lineWidth=3*s;
      ctx.beginPath(); ctx.arc(0,0,22*s,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=6;
    }

  } else {
    ctx.beginPath(); ctx.arc(0, 0, er, 0, Math.PI*2); ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.restore();

  // ── Wave 50+ visual mutations — glowing veins/spikes ─────────
  if (wave >= 50 && !e._mutation) {
    const mutAlpha = Math.min(1, (wave - 50) / 30) * 0.7; // ramps up W50-80
    const veinPulse = 0.5 + 0.5 * Math.sin(time * 4 + (e.x || 0) * 0.02);
    // Glowing red veins overlaid on silhouette
    ctx.save();
    ctx.translate(x + moveX, y + moveY);
    ctx.strokeStyle = 'rgba(255,30,0,' + (mutAlpha * veinPulse * 0.6) + ')';
    ctx.lineWidth = 1.2 * s;
    ctx.shadowColor = '#ff2000'; ctx.shadowBlur = 4 * mutAlpha;
    // Vein lines radiating from center
    for (var vi = 0; vi < 4; vi++) {
      var vang = (vi / 4) * Math.PI * 2 + time * 0.5;
      var vlen = er * (0.6 + 0.2 * Math.sin(time * 3 + vi));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(vang) * vlen, Math.sin(vang) * vlen);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  // Wave 100+ spikes — physical protrusions glow before charge
  if (wave >= 100) {
    const spikeAlpha = Math.min(1, (wave - 100) / 40);
    const spikePulse = 0.6 + 0.4 * Math.abs(Math.sin(time * 6 + (e.x || 0) * 0.01));
    ctx.save();
    ctx.translate(x + moveX, y + moveY);
    ctx.strokeStyle = 'rgba(255,20,0,' + (spikeAlpha * spikePulse * 0.8) + ')';
    ctx.lineWidth = 2 * s;
    ctx.shadowColor = '#ff1000'; ctx.shadowBlur = 8 * spikeAlpha;
    var spikeLen = er * 0.55 * spikePulse;
    for (var spi2 = 0; spi2 < 6; spi2++) {
      var spAng = (spi2 / 6) * Math.PI * 2;
      var spBase = er * 0.7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(spAng) * spBase, Math.sin(spAng) * spBase);
      ctx.lineTo(Math.cos(spAng) * (spBase + spikeLen), Math.sin(spAng) * (spBase + spikeLen));
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ── Elite visual overlay ───────────────────────────────
  if (e._elite && e._eliteKind) {
    ctx.save();
    ctx.translate(x + moveX, y + moveY);
    const ec = e._eliteColor || '#ffffff';

    if (e._eliteKind === 'berserker') {
      // Red flame aura around body
      const flicker = 0.5 + 0.5 * Math.sin(time * 12 + e.lane);
      ctx.strokeStyle = 'rgba(255,32,32,' + (flicker * 0.7) + ')';
      ctx.lineWidth = 2.5 * s;
      ctx.shadowColor = '#ff2020'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(0, 0, er * 1.3, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;
      // ELITE label
      ctx.fillStyle = '#ff4040';
      ctx.font = 'bold ' + (6*s) + 'px Share Tech Mono,monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BRSRKR', 0, -er - 22*s);

    } else if (e._eliteKind === 'ironclad') {
      // Cyan shield ring with regen glow
      if (e.shield > 0) {
        const shf = e.shield / e.maxShield;
        ctx.strokeStyle = 'rgba(96,208,255,' + (0.4 + shf * 0.6) + ')';
        ctx.lineWidth = 3 * s;
        ctx.shadowColor = '#60d0ff'; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(0, 0, er * 1.4, 0, Math.PI * 2 * shf); ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = '#60d0ff';
      ctx.font = 'bold ' + (6*s) + 'px Share Tech Mono,monospace';
      ctx.textAlign = 'center';
      ctx.fillText('IRONCLAD', 0, -er - 22*s);

    } else if (e._eliteKind === 'phantom') {
      // Green ghost trails when visible
      if (!e.cloaked || e.slow > 0) {
        const trail = 0.3 + 0.3 * Math.sin(time * 5);
        ctx.strokeStyle = 'rgba(64,255,160,' + trail + ')';
        ctx.lineWidth = 2 * s;
        ctx.shadowColor = '#40ffa0'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(0, 0, er * 1.5, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = '#40ffa0';
      ctx.font = 'bold ' + (6*s) + 'px Share Tech Mono,monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PHANTOM', 0, -er - 22*s);

    } else if (e._eliteKind === 'commander') {
      // Gold crown above warlord
      ctx.fillStyle = '#ffd166';
      ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 12;
      const cY = -er - 10*s;
      ctx.beginPath();
      ctx.moveTo(-8*s, cY); ctx.lineTo(-8*s, cY-8*s);
      ctx.lineTo(-4*s, cY-4*s); ctx.lineTo(0, cY-10*s);
      ctx.lineTo(4*s, cY-4*s); ctx.lineTo(8*s, cY-8*s);
      ctx.lineTo(8*s, cY); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold ' + (6*s) + 'px Share Tech Mono,monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CMDR', 0, -er - 24*s);
    }

    ctx.textAlign = 'left';
    ctx.restore();
  }
  if (hitFlash > 0) {
    ctx.globalAlpha = hitFlash * 0.65;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x + moveX, y + moveY, er * 1.1, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = baseAlpha;
  }
  ctx.globalAlpha = 1;

  // HP bar — black track, colored fill
  var bw = Math.max(er * 2.2, 28*s);
  ctx.fillStyle = 'rgba(0,0,0,.82)';
  ctx.fillRect(x - bw/2, y - er - 20*s, bw, 6*s);
  // HP fill color: match mutation glow
  var hpFillCol = e._mutation === 'toxic' ? '#39FF14'
                : e._mutation === 'phantom' ? '#4466ff'
                : hf > 0.6 ? '#ff4444' : hf > 0.3 ? '#ff8800' : '#ff2020';
  ctx.fillStyle = hpFillCol;
  ctx.shadowColor = hpFillCol; ctx.shadowBlur = hf < 0.4 ? 5 : 0;
  ctx.fillRect(x - bw/2, y - er - 20*s, bw * hf, 6*s);
  ctx.shadowBlur = 0;

  // Health glow ring — tighter, matches crimson theme
  if (hf < 0.99) {
    var gc = hf > 0.6 ? CRIMSON_DIM + '0.22)' : hf > 0.3 ? 'rgba(255,140,0,.28)' : 'rgba(255,20,20,.4)';
    ctx.strokeStyle = gc; ctx.lineWidth = 1.5*s;
    ctx.beginPath(); ctx.arc(x+moveX, y+moveY, er+2.5*s, 0, Math.PI*2); ctx.stroke();
    ctx.lineWidth = 1;
  }

  // Type label — updated to design codenames
  var labels = {
    grunt:     'DRONE',
    runner:    'SPECTER',
    brute:     'BULWARK',
    razorwing: 'SEEKER',
    shield:    'SHIELD',
    flyer:     'FLYER',
    stalker:   'STALKER',
    siege:     'TITAN',
    warlord:   'WARLORD',
    phaselord: 'PHASE',
  };
  // Mutation suffix
  var mutSuffix = e._mutation === 'toxic' ? '-TOX' : e._mutation === 'phantom' ? '-PHT' : '';
  var labelCol = e._mutation === 'toxic' ? '#39FF14'
               : e._mutation === 'phantom' ? '#6688ff'
               : hf < 0.3 ? '#ff8080' : 'rgba(220,20,60,.65)';
  ctx.fillStyle = labelCol;
  ctx.font = 'bold ' + (5.5*s) + 'px Share Tech Mono,monospace';
  ctx.textAlign = 'center';
  ctx.fillText((labels[kind] || kind.toUpperCase()) + mutSuffix, x, y - er - 24*s);
  ctx.textAlign = 'left';

  // Shield bar — crimson-toned gold
  if (maxShield > 0 && shield > 0) {
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(x-bw/2, y-er-13*s, bw, 4*s);
    ctx.fillStyle = '#ffcc44';
    ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 4;
    ctx.fillRect(x-bw/2, y-er-13*s, bw*(shield/maxShield), 4*s);
    ctx.shadowBlur = 0;
  }

  // Slow ring
  if (slow > 0) {
    ctx.strokeStyle = 'rgba(80,190,230,.55)'; ctx.lineWidth = 1.5*s;
    ctx.beginPath(); ctx.arc(x+moveX, y+moveY, er+5*s, 0, Math.PI*2); ctx.stroke();
    ctx.lineWidth = 1;
  }
}


