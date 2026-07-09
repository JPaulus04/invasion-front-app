// ══════════════════════════════════════════════════════════════
// Build 129 — Enemy Squad Visual Identity Pass
// Replaces tiny/flat enemy sprite presentation with procedural tactical
// multi-contact squad silhouettes so incoming enemies read as advancing soldiers, shield teams, heavy units, and commanders.
// ══════════════════════════════════════════════════════════════
(function () {
  if (window.__LSC_ENEMY_VISUALS_127__) return;
  window.__LSC_ENEMY_VISUALS_127__ = true;

  function colorForEnemy(e) {
    if (e._mutation === 'phantom') return '#6aa5ff';
    if (e._mutation === 'toxic') return '#39ff7a';
    if (e._eliteColor) return e._eliteColor;
    return {
      conscript:  '#d34242',
      breacher:   '#ff5c52',
      juggernaut: '#b87432',
      overwatch:  '#6e9ed8',
      phalanx:    '#d79a36',
      warden:     '#ff3333'
    }[e.kind] || '#dc143c';
  }

  function glowForEnemy(e) { return colorForEnemy(e); }

  function bodyScale(kind) {
    return ({ conscript:1, breacher:.9, juggernaut:1.38, overwatch:1.02, phalanx:1.18, warden:1.75 }[kind] || 1);
  }


  function formationForKind(kind) {
    if (kind === 'juggernaut') return [{x:0,y:0,scale:1.15,label:'HVY'}];
    if (kind === 'warden') return [{x:0,y:0,scale:1.1,label:'CMD'}];
    if (kind === 'phalanx') return [
      {x:-7,y:1,scale:.86,label:'SHD'},
      {x:6,y:-1,scale:.92,label:'SHD'}
    ];
    if (kind === 'overwatch') return [
      {x:0,y:0,scale:.95,label:'OW'},
      {x:8,y:6,scale:.70,label:'SPT'}
    ];
    if (kind === 'breacher') return [
      {x:-8,y:4,scale:.78,label:'BCH'},
      {x:0,y:-1,scale:.88,label:'BCH'},
      {x:8,y:5,scale:.74,label:'BCH'}
    ];
    return [
      {x:-8,y:4,scale:.72,label:'INF'},
      {x:0,y:-2,scale:.88,label:'INF'},
      {x:8,y:5,scale:.70,label:'INF'}
    ];
  }

  function drawContactTag(ctx, label, col, s) {
    ctx.save();
    ctx.font = (6.5 * s) + 'px Share Tech Mono,monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var w = Math.max(20 * s, ctx.measureText(label).width + 8 * s);
    var y = -28 * s;
    ctx.fillStyle = 'rgba(0,0,0,.62)';
    ctx.strokeStyle = col + 'aa';
    ctx.lineWidth = 1 * s;
    var x0 = -w/2, y0 = y - 5*s, h = 10*s, r = 4*s;
    ctx.beginPath();
    ctx.moveTo(x0 + r, y0);
    ctx.lineTo(x0 + w - r, y0);
    ctx.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    ctx.lineTo(x0 + w, y0 + h - r);
    ctx.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
    ctx.lineTo(x0 + r, y0 + h);
    ctx.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
    ctx.lineTo(x0, y0 + r);
    ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f6fbff';
    ctx.fillText(label, 0, y);
    ctx.restore();
  }

  function drawContactSilhouette(ctx, kind, col, time, s, phase) {
    var scale = bodyScale(kind);
    var step = Math.sin(time * (kind === 'breacher' ? 8.0 : 5.0) + phase) * s;
    var headR = 4.2 * scale * s;
    var torsoW = 10 * scale * s;
    var torsoH = 15 * scale * s;
    var legH = 8 * scale * s;

    ctx.save();
    ctx.translate(0, step * 0.35);

    // Contact bloom / faction marker.
    var aura = ctx.createRadialGradient(0, 0, 0, 0, 0, 20 * scale * s);
    aura.addColorStop(0, col + '33');
    aura.addColorStop(.72, col + '10');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, 20 * scale * s, 0, Math.PI * 2); ctx.fill();

    // Legs.
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#180b0b';
    ctx.lineWidth = 3.2 * scale * s;
    ctx.beginPath();
    ctx.moveTo(-3.5 * scale * s, 7 * scale * s);
    ctx.lineTo(-5.5 * scale * s + step * .35, 7 * scale * s + legH);
    ctx.moveTo(3.5 * scale * s, 7 * scale * s);
    ctx.lineTo(5.5 * scale * s - step * .35, 7 * scale * s + legH);
    ctx.stroke();

    // Torso armor.
    var armorGrad = ctx.createLinearGradient(0, -10 * scale * s, 0, 9 * scale * s);
    armorGrad.addColorStop(0, col);
    armorGrad.addColorStop(.45, '#3c1111');
    armorGrad.addColorStop(1, '#140808');
    ctx.fillStyle = armorGrad;
    ctx.strokeStyle = col + 'aa';
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(-torsoW * .55, -7 * scale * s);
    ctx.lineTo(torsoW * .55, -7 * scale * s);
    ctx.lineTo(torsoW * .42, torsoH * .45);
    ctx.lineTo(0, torsoH * .72);
    ctx.lineTo(-torsoW * .42, torsoH * .45);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Chest sensor / unit marker.
    ctx.fillStyle = '#fff3';
    ctx.fillRect(-1.2 * s, -2 * scale * s, 2.4 * s, 5 * scale * s);
    ctx.fillStyle = col;
    ctx.shadowColor = col; ctx.shadowBlur = 6 * s;
    ctx.beginPath(); ctx.arc(0, -1 * scale * s, 1.7 * s, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Head and helmet.
    ctx.fillStyle = '#120707';
    ctx.beginPath(); ctx.arc(0, -13 * scale * s, headR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col;
    ctx.globalAlpha = .85;
    ctx.beginPath(); ctx.arc(0, -14 * scale * s, headR * .92, Math.PI, 0); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffd9a0';
    ctx.fillRect(-2.6 * scale * s, -13.5 * scale * s, 5.2 * scale * s, 1.3 * s);

    // Weapon profile.
    ctx.strokeStyle = '#1a1a18';
    ctx.lineWidth = (kind === 'juggernaut' || kind === 'warden') ? 3.2 * s : 2.2 * s;
    ctx.beginPath();
    if (kind === 'overwatch') {
      ctx.moveTo(-7 * scale * s, -2 * scale * s); ctx.lineTo(12 * scale * s, -7 * scale * s);
      ctx.moveTo(11 * scale * s, -7 * scale * s); ctx.lineTo(19 * scale * s, -8 * scale * s);
    } else if (kind === 'breacher') {
      ctx.moveTo(-8 * scale * s, 1 * scale * s); ctx.lineTo(9 * scale * s, 8 * scale * s);
    } else {
      ctx.moveTo(-8 * scale * s, -1 * scale * s); ctx.lineTo(12 * scale * s, 2 * scale * s);
    }
    ctx.stroke();

    // Type-specific silhouette.
    if (kind === 'phalanx') {
      ctx.fillStyle = 'rgba(230,160,45,.28)';
      ctx.strokeStyle = '#f0b03c'; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.ellipse(-11 * s, 1 * s, 6 * s, 11 * s, -0.15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    }
    if (kind === 'juggernaut' || kind === 'warden') {
      ctx.strokeStyle = col + '88'; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(0, -1 * s, 15 * scale * s, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = col + '44';
      ctx.fillRect(-torsoW * .62, -9 * scale * s, 3 * s, torsoH);
      ctx.fillRect(torsoW * .42, -9 * scale * s, 3 * s, torsoH);
    }
    if (kind === 'warden') {
      ctx.fillStyle = 'rgba(255,40,40,.18)';
      ctx.beginPath(); ctx.arc(0, 0, 25 * s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ff3030'; ctx.lineWidth = 2.2 * s;
      ctx.beginPath(); ctx.arc(0, 0, 26 * s, 0, Math.PI * 2); ctx.stroke();
      ctx.font = (9 * s) + 'px Share Tech Mono,monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = '#ffd0d0';
      ctx.fillText('CMD', 0, 23 * s);
    }
    if (kind === 'breacher') {
      ctx.strokeStyle = col + '88'; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(-10*s, 11*s); ctx.lineTo(10*s, 14*s); ctx.stroke();
    }

    ctx.restore();
  }

  function drawEnemyBars(ctx, x, y, e, moveX, moveY, er, time, s) {
    var hf = Math.max(0, Math.min(1, (e.hp || 0) / Math.max(1, e.maxHp || e.hp || 1)));
    var barW = (e.r * 1.8 + 8) * s;
    var barY = y + moveY - er - 10 * s;
    ctx.fillStyle = 'rgba(0,0,0,.62)';
    ctx.fillRect(x + moveX - barW / 2, barY, barW, 3 * s);
    ctx.fillStyle = hf > .5 ? '#df3040' : hf > .25 ? '#ff7a2d' : '#ff2020';
    ctx.fillRect(x + moveX - barW / 2, barY, barW * hf, 3 * s);
    if ((e.maxShield || 0) > 0) {
      var sh = Math.max(0, Math.min(1, (e.shield || 0) / Math.max(1, e.maxShield || 1)));
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x + moveX - barW/2, barY + 4*s, barW, 2.5*s);
      ctx.fillStyle = '#e8b34a'; ctx.fillRect(x + moveX - barW/2, barY + 4*s, barW * sh, 2.5*s);
    }
    if ((e.slow || 0) > 0) {
      ctx.strokeStyle = 'rgba(80,190,230,.65)'; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.arc(x + moveX, y + moveY, er + 7 * s, 0, Math.PI*2); ctx.stroke();
    }
  }

  if (typeof _drawEnemyV === 'function') {
    var previousEnemyDraw = _drawEnemyV;
    _drawEnemyV = function (ctx, x, y, e, time, dpr) {
      try {
        var kind = e.kind || 'conscript';
        var col = glowForEnemy(e);
        var s = dpr || 1;
        var phase = (e.x || 0) * 0.03 + (e.lane || 0) * 1.1;
        var moveX = Math.sin(time * 4.2 + phase) * 1.2 * s;
        var moveY = Math.sin(time * 3.1 + phase) * 0.8 * s;
        var er = Math.max((e.r || 14) * s * 0.78, 9 * s);
        ctx.save();
        ctx.globalAlpha = Math.max(.55, ctx.globalAlpha || 1);
        if (e._elite) {
          ctx.shadowColor = col; ctx.shadowBlur = 14 * s;
          ctx.strokeStyle = col + 'bb'; ctx.lineWidth = 2 * s;
          ctx.beginPath(); ctx.arc(x + moveX, y + moveY, er + 7*s, 0, Math.PI*2); ctx.stroke();
          ctx.shadowBlur = 0;
        }
        var hitDelta = performance.now() - (e._lastHitTime || 0);
        if (hitDelta < 150) ctx.filter = 'brightness(1.8) saturate(2)';
        ctx.translate(x + moveX, y + moveY);
        var squad = formationForKind(kind);
        squad.forEach(function(member, idx) {
          ctx.save();
          ctx.translate(member.x * s, member.y * s);
          ctx.scale(member.scale || 1, member.scale || 1);
          drawContactSilhouette(ctx, kind, col, time + idx * 0.13, s, phase + idx * 0.7);
          ctx.restore();
        });
        drawContactTag(ctx, squad[0] && squad[0].label ? squad[0].label : kind.toUpperCase().slice(0,3), col, s);
        ctx.restore();
        ctx.filter = 'none';
        if (kind === 'overwatch' && e._owStopped && e._lastFireTime) {
          var fd = performance.now() - e._lastFireTime;
          if (fd < 120) {
            var fa = 1 - fd / 120;
            ctx.fillStyle = 'rgba(255,215,90,' + fa + ')';
            ctx.shadowColor = '#ffcc55'; ctx.shadowBlur = 10 * fa;
            ctx.beginPath(); ctx.arc(x + moveX + 13*s, y + moveY - 7*s, 3.5*s*fa, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
        if (e.kind === 'phalanx' && (e.shield || 0) > 0) {
          var sg = .30 + .22 * Math.sin(time * 3);
          ctx.strokeStyle = 'rgba(236,178,58,' + sg + ')'; ctx.lineWidth = 2 * s;
          ctx.shadowColor = '#e8b34a'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(x + moveX, y + moveY, er + 5*s, 0, Math.PI*2); ctx.stroke();
          ctx.shadowBlur = 0;
        }
        drawEnemyBars(ctx, x, y, e, moveX, moveY, er, time, s);
      } catch (err) {
        try { previousEnemyDraw(ctx, x, y, e, time, dpr); } catch (_) {}
      }
    };
  }
})();
