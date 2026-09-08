(function(root){
  'use strict';
  // Authored, deterministic spiral. IDs and rewards must remain stable across releases.
  var tiles=[],x=0,y=0,dx=1,dy=0,length=1;
  while(tiles.length<48){
    for(var side=0;side<2;side++){
      for(var step=0;step<length;step++){
        x+=dx;y+=dy;
        if(Math.abs(x)<=3&&Math.abs(y)<=3){
          var i=tiles.length,r=Math.max(Math.abs(x),Math.abs(y));
          tiles.push(Object.freeze({id:x+','+y,x:x,y:y,phase:Math.floor(i/3)+1,
            actions:3+r,cost:12*r*r,kind:i%8===7?'depot':i%4===2?'cache':'grove',
            credits:i%4===2?24*r:0,parts:i%8===7?1:0}));
        }
      }
      var old=dx;dx=-dy;dy=old;
    }
    length++;
  }
  function progress(meta,t){
    var n=Number(meta.reclamation&&meta.reclamation.progress&&meta.reclamation.progress[t.id]);
    return Number.isFinite(n)?Math.max(0,Math.min(t.actions,Math.floor(n))):0;
  }
  function adjacent(meta,t){
    return [[1,0],[-1,0],[0,1],[0,-1]].some(function(d){
      var nx=t.x+d[0],ny=t.y+d[1];if(nx===0&&ny===0)return true;
      var other=tiles.find(function(v){return v.x===nx&&v.y===ny;});
      return other&&progress(meta,other)===other.actions;
    });
  }
  function state(meta,t){
    var p=progress(meta,t);if(p===t.actions)return 'reclaimed';
    if((Number(meta.bestPhase)||0)<t.phase||!adjacent(meta,t))return 'locked';
    return p?'restoring':'available';
  }
  function act(meta,id,persist){
    var t=tiles.find(function(v){return v.id===id;});
    if(!t||state(meta,t)==='locked'||state(meta,t)==='reclaimed')return {ok:false,reason:'Tile unavailable.'};
    if(!Number.isFinite(meta.credits)||meta.credits<t.cost)return {ok:false,reason:'Not enough Credits. Earn more in Campaign.'};
    var old=meta.reclamation,credits=meta.credits,parts=meta.parts;
    var next=progress(meta,t)+1,done=next===t.actions;
    meta.reclamation={schema:193,progress:Object.assign({},old&&old.progress)};
    meta.reclamation.progress[t.id]=next;
    meta.credits=credits-t.cost+(done?t.credits:0);
    meta.parts=(Number(parts)||0)+(done?t.parts:0);
    try{if(persist()!==true)throw new Error('save failed');}
    catch(e){meta.reclamation=old;meta.credits=credits;meta.parts=parts;return {ok:false,reason:'Could not save. No Credits spent. Try again.'};}
    return {ok:true,done:done,tile:t};
  }
  function mount(panel,meta,persist,refresh,back){
    var selected=tiles.find(function(t){return state(meta,t)==='available'||state(meta,t)==='restoring';})||tiles[0];
    var timer=null,held=false,destroyed=false;
    if(!document.getElementById('reclaim-style')){
      var style=document.createElement('style');style.id='reclaim-style';style.textContent=`
      .rc{color:#e6f3ee;font-family:inherit;padding:4px 0 24px}.rc button{font:inherit;cursor:pointer}.rc-top{display:flex;justify-content:space-between;align-items:center;gap:12px}.rc-top button,.rc-action{border:1px solid #70c9ba;border-radius:10px;background:#123d38;color:#e6fff5;padding:12px}.rc h2{margin:14px 0 5px;font-size:24px}.rc p{color:#a5bdbb;font-size:13px;line-height:1.5}.rc-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;padding:8px;background:#071820;border:1px solid #42716d;border-radius:14px;margin:16px 0}.rc-tile{position:relative;aspect-ratio:1;min-width:0;border:1px solid #344448;border-radius:5px;background:linear-gradient(135deg,#344046,#162329);color:#8d9da0;padding:2px!important;overflow:hidden}.rc-tile svg{width:100%;height:100%}.rc-tile.available{background:linear-gradient(140deg,#655438,#263e3b);border-color:#d5b76b}.rc-tile.restoring{background:linear-gradient(140deg,#456d52,#29413c);border-color:#73dbb1}.rc-tile.reclaimed{background:linear-gradient(135deg,#71924d,#274a3c);color:#e3f7ba;border-color:#6caa7e}.rc-tile.selected{outline:2px solid #f4d78e;outline-offset:0;z-index:1}.rc-tile.locked svg{opacity:.35}.rc-tile small{position:absolute;bottom:1px;right:2px;font-size:9px;color:#fff;background:#071820bb;padding:0 2px}.rc-hq{display:grid;place-items:center;color:#ffe091;background:#20535b;border-color:#f2d68a;font-weight:bold;font-size:12px}.rc-card{padding:16px;background:#0a252d;border:1px solid #365e61;border-radius:14px}.rc-card h3{margin:0 0 8px}.rc-card progress{width:100%;accent-color:#7bdfac;height:14px}.rc-action{width:100%;margin-top:12px;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;min-height:52px}.rc-action:disabled{opacity:.5}.rc-status{min-height:36px;color:#f3d994!important}.rc-summary{font-size:12px;color:#9fdbca}.rc-legend{font-size:11px;color:#b8ccbd;line-height:1.6}
      `;document.head.appendChild(style);
    }
    function art(t){
      var shape=t.kind==='grove'?'<path d="M12 38 23 14 34 38H28L36 48H10L18 38Z" fill="currentColor"/><path d="M23 44v10" stroke="#624831" stroke-width="4"/>':t.kind==='depot'?'<path d="M9 24 30 12 51 24V50H9Z" fill="currentColor"/><path d="M23 50V31H37V50M12 26H48" fill="#17333b" stroke="#d3ae69" stroke-width="2"/>':'<path d="M10 23 30 13 50 23V46L30 55 10 46Z" fill="currentColor"/><path d="M10 23 30 33 50 23M30 33V55M20 18 40 28" fill="none" stroke="#20363a" stroke-width="3"/>';
      return '<svg viewBox="0 0 60 60" aria-hidden="true">'+shape+'</svg>';
    }
    panel.innerHTML='<section class="rc"><div class="rc-top"><span class="rc-summary">REGION 01 · HQ PERIMETER</span><button type="button" id="rc-back">CAMPAIGN</button></div><h2>RECLAIM THE PERIMETER</h2><p>Win Campaign phases to secure territory. Restore adjacent tiles with Credits to expand from your HQ.</p><div class="rc-summary" id="rc-summary"></div><div class="rc-grid" id="rc-grid" role="group" aria-label="Reclamation region"></div><div class="rc-legend">GRAY · LOCKED / GOLD · AVAILABLE<br>TEAL · RESTORING / GREEN · RECLAIMED</div><div class="rc-card"><div id="rc-detail"></div><button type="button" class="rc-action" id="rc-action"></button><p class="rc-status" id="rc-status" role="status" aria-live="polite">Select a tile. Tap once or hold RESTORE to repeat.</p></div></section>';
    var grid=panel.querySelector('#rc-grid'),button=panel.querySelector('#rc-action'),status=panel.querySelector('#rc-status');
    for(var row=-3;row<=3;row++)for(var col=-3;col<=3;col++){
      if(!row&&!col){grid.insertAdjacentHTML('beforeend','<div class="rc-tile rc-hq">HQ</div>');continue;}
      var t=tiles.find(function(v){return v.x===col&&v.y===row;});
      var b=document.createElement('button');b.type='button';b.dataset.tile=t.id;b.innerHTML=art(t)+'<small></small>';grid.appendChild(b);
    }
    function draw(){
      var count=tiles.filter(function(t){return state(meta,t)==='reclaimed';}).length;
      panel.querySelector('#rc-summary').textContent=count+'/48 RESTORED · '+Math.floor(meta.credits).toLocaleString()+' CREDITS';
      tiles.forEach(function(t){var b=grid.querySelector('[data-tile="'+t.id+'"]'),s=state(meta,t);b.className='rc-tile '+s+(selected===t?' selected':'');b.setAttribute('aria-label',t.id+' '+t.kind+', '+s+', requires Phase '+t.phase);b.setAttribute('aria-pressed',String(selected===t));b.querySelector('small').textContent=s==='locked'?'P'+t.phase:s==='reclaimed'?'✓':progress(meta,t)+'/'+t.actions;});
      var s=state(meta,selected),p=progress(meta,selected),reward=selected.parts?'1 Tech Part':selected.credits?selected.credits+' Credits':'Restored woodland';
      panel.querySelector('#rc-detail').innerHTML='<h3>'+({grove:'WOODLAND',cache:'SUPPLY CACHE',depot:'SALVAGE DEPOT'}[selected.kind])+'</h3><p>Tile '+selected.id+' · Phase '+selected.phase+' authorization</p><progress value="'+p+'" max="'+selected.actions+'"></progress><p>'+p+'/'+selected.actions+' actions · '+selected.cost+' Credits/action<br>Remaining cost: '+((selected.actions-p)*selected.cost)+' Credits<br>One-time discovery: '+reward+'</p>';
      button.disabled=s==='locked'||s==='reclaimed'||meta.credits<selected.cost;
      button.textContent=s==='reclaimed'?'RECLAIMED':s==='locked'?(meta.bestPhase<selected.phase?'CLEAR PHASE '+selected.phase:'RESTORE A NEIGHBOR FIRST'):meta.credits<selected.cost?'NEED '+selected.cost+' CREDITS':'RESTORE · '+selected.cost+' CREDITS';
      if(count===48)status.textContent='Perimeter restored. More regions are planned for a future build.';
    }
    function stop(){clearTimeout(timer);timer=null;held=false;}
    function perform(){
      if(destroyed||!panel.contains(button)||document.hidden){stop();return;}
      var result=act(meta,selected.id,persist);refresh();draw();
      status.textContent=!result.ok?result.reason:result.done?'Tile restored. '+(selected.parts?'Recovered 1 Tech Part.':selected.credits?'Recovered '+selected.credits+' Credits.':'Woodland recovered.'):'Restoration saved.';
      if(!result.ok||result.done||button.disabled)stop();
    }
    grid.onclick=function(e){var b=e.target.closest('[data-tile]');if(!b)return;stop();selected=tiles.find(function(t){return t.id===b.dataset.tile;});status.textContent='Select RESTORE to work on this tile.';draw();};
    button.onpointerdown=function(e){if(e.button!==0||button.disabled)return;e.preventDefault();stop();held=true;button.setPointerCapture(e.pointerId);perform();if(held)timer=setTimeout(function repeat(){if(!held)return;perform();if(held)timer=setTimeout(repeat,350);},450);};
    button.onpointerup=stop;button.onpointercancel=stop;button.onlostpointercapture=stop;
    button.oncontextmenu=function(e){e.preventDefault();};
    button.onclick=function(e){if(e.detail===0)perform();};
    panel.querySelector('#rc-back').onclick=function(){stop();back();};
    document.addEventListener('visibilitychange',stop);window.addEventListener('pagehide',stop);
    draw();return function(){destroyed=true;stop();document.removeEventListener('visibilitychange',stop);window.removeEventListener('pagehide',stop);};
  }
  root.LSCReclamation=Object.freeze({tiles:Object.freeze(tiles),progress:progress,state:state,act:act,mount:mount});
})(typeof window!=='undefined'?window:globalThis);
