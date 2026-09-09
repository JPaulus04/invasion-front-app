(function(root){
  'use strict';
  // Build 194: stable world coordinates; the first 48 tiles retain 193 costs/rewards.
  var legacy=[],x=0,y=0,dx=1,dy=0,length=1;
  while(legacy.length<48){
    for(var side=0;side<2;side++){
      for(var step=0;step<length;step++){
        x+=dx;y+=dy;
        if(Math.abs(x)<=3&&Math.abs(y)<=3){
          var i=legacy.length,r=Math.max(Math.abs(x),Math.abs(y));
          legacy.push({id:x+','+y,x:x,y:y,actions:3+r,cost:12*r*r,
            kind:i%8===7?'depot':i%4===2?'cache':'grove',credits:i%4===2?24*r:0,parts:i%8===7?1:0});
        }
      }
      var old=dx;dx=-dy;dy=old;
    }
    length++;
  }
  var oldTiles={};legacy.forEach(function(t){oldTiles[t.id]=t;});
  var centers=[{x:0,y:0}],cx=0,cy=0,vx=1,vy=0,span=1;
  // Safety ceiling, not an unlock purchased by players. Generate terrain only as needed.
  while(centers.length<1001){for(var s=0;s<2;s++){for(var j=0;j<span;j++){cx+=vx;cy+=vy;centers.push({x:cx*7,y:cy*7});}var v=vx;vx=-vy;vy=v;}span++;}
  var cache={};
  function phase(meta){return Math.min(1000,Math.max(1,Math.floor(Number(meta.bestPhase)||0)+1));}
  function zone(n){
    n=Math.max(1,Math.min(1000,Math.floor(n)));if(cache[n])return cache[n];
    var c=centers[n-1],previous=centers[Math.max(0,n-2)],ex=Math.sign(previous.x-c.x),ey=Math.sign(previous.y-c.y);
    var route=n===1?['1,0','2,0']:[],tiles=[],byId={};
    if(n>1)for(var d=3;d>=0;d--)route.push((c.x+ex*d)+','+(c.y+ey*d));
    for(var yy=-3;yy<=3;yy++)for(var xx=-3;xx<=3;xx++){
      var tx=c.x+xx,ty=c.y+yy,id=tx+','+ty;
      if(id==='0,0')continue;
      var hash=Math.abs((tx*73856093)^(ty*19349663)),required=route.indexOf(id)>=0;
      var t=Object.assign({},oldTiles[id]||{id:id,x:tx,y:ty,actions:3,cost:8+Math.min(n,25),kind:hash%9===0?'cache':hash%13===0?'depot':'grove',credits:hash%9===0?30+n*2:0,parts:hash%13===0?1:0});
      t.zone=n;t.required=required;
      // Authored sites per district ensure useful discoveries, without revealing them all.
      t.site=xx===-1&&yy===-1?'armory':xx===1&&yy===1?'medical':xx===-1&&yy===2?'artillery':xx===0&&yy===-2?'hill':null;
      if(n===1&&id==='1,1')t.site='medical';
      if(required){t.site=null;if(n>1)t.kind='road';}
      tiles.push(t);byId[id]=t;
    }
    // North-entry routes can occupy the original hill. Keep a valid scouting site off-road.
    if(!tiles.some(function(t){return t.site==='hill';})){var fallback=byId[(c.x+2)+','+(c.y-2)];if(fallback&&!fallback.required)fallback.site='hill';}
    return cache[n]={number:n,x:c.x,y:c.y,tiles:tiles,byId:byId,route:route,entry:route[0],town:route[route.length-1]};
  }
  function data(meta){return meta.reclamation||{};}
  var supplyCache={};
  function supply(meta){
    var best=Math.min(999,Math.max(0,Math.floor(Number(meta.bestPhase)||0)));
    if(supplyCache[best])return supplyCache[best];
    var roads=new Set(['0,0']);
    function connect(a,b){var x=a.x,y=a.y;roads.add(x+','+y);while(x!==b.x||y!==b.y){if(x!==b.x)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);roads.add(x+','+y);}}
    for(var n=1;n<=best;n++){var z=zone(n);connect(centers[Math.max(0,n-2)],centers[n-1]);if(n===1)connect({x:0,y:0},{x:2,y:0});}
    if(best){var next=zone(best+1);connect(centers[best-1],next.byId[next.entry]);}
    supplyCache[best]=roads;return roads;
  }
  function progress(meta,t){var p=Number(data(meta).progress&&data(meta).progress[t.id]);return Number.isFinite(p)?Math.max(0,Math.min(t.actions,Math.floor(p))):0;}
  function complete(meta,t){return progress(meta,t)===t.actions;}
  function find(meta,id){
    var xy=String(id).split(',').map(Number);if(xy.length!==2||!xy.every(Number.isInteger))return null;
    for(var n=1;n<=phase(meta);n++){var z=zone(n);if(Math.abs(xy[0]-z.x)<=3&&Math.abs(xy[1]-z.y)<=3)return z.byId[id]||null;}
    return null;
  }
  function adjacent(meta,t){
    if(supply(meta).has(t.id))return true;
    if(t.id===zone(t.zone).entry)return true; // Liberation establishes the next supply entry.
    return [[1,0],[-1,0],[0,1],[0,-1]].some(function(d){var id=(t.x+d[0])+','+(t.y+d[1]);if(id==='0,0')return true;var neighbor=find(meta,id);return neighbor&&complete(meta,neighbor);});
  }
  function visible(meta,t){
    if(progress(meta,t)>0)return true;
    var roads=supply(meta);for(var sx=-1;sx<=1;sx++)for(var sy=-1;sy<=1;sy++)if(roads.has((t.x+sx)+','+(t.y+sy)))return true;
    var z=zone(t.zone),entry=z.byId[z.entry];
    if(Math.max(Math.abs(t.x-entry.x),Math.abs(t.y-entry.y))<=2)return true;
    // Only nearby chunks can influence visibility. Towers reveal, never clear or unlock.
    for(var n=1;n<=phase(meta);n++){
      var near=zone(n);if(Math.abs(near.x-t.x)>11||Math.abs(near.y-t.y)>11)continue;
      for(var k=0;k<near.tiles.length;k++){
        var other=near.tiles[k];if(!complete(meta,other))continue;
        var radius=data(meta).towers&&data(meta).towers[other.id]?8:1;
        if(Math.max(Math.abs(other.x-t.x),Math.abs(other.y-t.y))<=radius)return true;
      }
    }
    return false;
  }
  function state(meta,t){
    if(!t||t.zone>phase(meta))return 'locked';
    if(complete(meta,t))return 'reclaimed';
    if(!visible(meta,t))return 'fog';
    if(!adjacent(meta,t))return 'locked';
    return progress(meta,t)?'restoring':'available';
  }
  function transaction(meta,persist,change){
    var old=meta.reclamation,credits=meta.credits,parts=meta.parts;
    meta.reclamation=Object.assign({},old,{schema:194,progress:Object.assign({},old&&old.progress),towers:Object.assign({},old&&old.towers)});
    change(meta.reclamation);
    try{if(persist()!==true)throw Error('save');}
    catch(e){if(old===undefined)delete meta.reclamation;else meta.reclamation=old;meta.credits=credits;meta.parts=parts;return {ok:false,reason:'Save failed. Nothing spent; try again.'};}
    return {ok:true};
  }
  function initialize(meta,persist,now){
    now=now==null?Date.now():now;
    if(data(meta).schema===194&&Number.isFinite(data(meta).incomeAt))return {ok:true};
    return transaction(meta,persist,function(d){d.incomeAt=now;});
  }
  function act(meta,id,persist){
    var t=find(meta,id),status=state(meta,t);
    if(status!=='available'&&status!=='restoring')return {ok:false,reason:'Clear a connected, visible tile first.'};
    if(!Number.isFinite(meta.credits)||meta.credits<t.cost)return {ok:false,reason:'Not enough Credits. Collect supply income or play Special Ops.'};
    var next=progress(meta,t)+1,done=next===t.actions;
    var city=done?townReward(meta,t):0;
    var result=transaction(meta,persist,function(d){d.progress[id]=next;meta.credits-=t.cost;if(done){meta.credits+=t.credits+city;meta.parts=(Number(meta.parts)||0)+t.parts;}});
    result.tile=t;result.done=result.ok&&done;
    result.rewards=[];
    if(result.done){
      if(t.credits+city)result.rewards.push('+'+(t.credits+city)+' CREDITS');
      if(t.parts)result.rewards.push('+'+t.parts+' TECH PART'+(t.parts===1?'':'S'));
      if(t.zone===phase(meta)){
        var label={armory:'+10% WEAPON DAMAGE',medical:'+10% COMMAND-POST HEALTH',artillery:'+15% ARTILLERY DAMAGE'}[t.site];
        if(label)result.rewards.push(label+' · TOWN '+t.zone);
      }
    }
    return result;
  }
  function townReward(meta,t){return t.id===zone(t.zone).town&&t.zone===phase(meta)&&!complete(meta,t)?50+10*t.zone:0;}
  function buildTower(meta,id,persist){
    var t=find(meta,id),cost=75;
    if(!t||t.site!=='hill'||!complete(meta,t)||data(meta).towers&&data(meta).towers[id])return {ok:false,reason:'Restore an unbuilt hill first.'};
    if(meta.credits<cost)return {ok:false,reason:'Tower needs 75 Credits.'};
    return transaction(meta,persist,function(d){d.towers[id]=true;meta.credits-=cost;});
  }
  function ready(meta,n){if(n<=Number(meta.bestPhase||0))return true;if(n!==phase(meta))return false;var z=zone(n);return z.route.every(function(id){return complete(meta,z.byId[id]);});}
  function bonuses(meta,n){
    var b={damage:0,hq:0,artillery:0};
    if(n<=Number(meta.bestPhase||0)||n!==phase(meta))return b;
    zone(n).tiles.forEach(function(t){if(!complete(meta,t))return;if(t.site==='armory')b.damage=.1;if(t.site==='medical')b.hq=.1;if(t.site==='artillery')b.artillery=.15;});
    return b;
  }
  function applyBonuses(meta,battle){
    if(battle.operation||battle.replay)return;
    var b=bonuses(meta,battle.phase);battle.explorationBonuses=b;
    battle.hero.damage*=1+b.damage;battle.turret.damage*=1+b.damage;
    battle.hq.maxHp=Math.round(battle.hq.maxHp*(1+b.hq));battle.hq.hp=battle.hq.maxHp;
    battle.abilityDamage*=1+b.artillery;
  }
  function income(meta,now){
    var at=data(meta).incomeAt,rate=2+2*Math.min(50,Math.max(0,Math.floor(Number(meta.bestPhase)||0)));
    var minutes=Number.isFinite(at)?Math.min(480,Math.max(0,Math.floor(((now==null?Date.now():now)-at)/60000))):0;
    return {credits:minutes*rate,rate:rate,minutes:minutes};
  }
  function collect(meta,persist,now){
    now=now==null?Date.now():now;var earned=income(meta,now);
    if(!earned.credits)return {ok:false,reason:'Supplies accrue each minute. Up to 8 hours stored.'};
    return transaction(meta,persist,function(d){meta.credits+=earned.credits;d.incomeAt=now;});
  }
  // Settle elapsed income at the OLD town count before recording a first victory.
  function beforeVictory(meta,now){var d=data(meta);if(!Number.isFinite(d.incomeAt))return;var earned=income(meta,now);meta.credits+=earned.credits;meta.reclamation=Object.assign({},d,{incomeAt:now});}

  function district(n){
    var cycle=Math.floor((n-1)/5)%3;
    return cycle===1?{name:'INDUSTRIAL FRONT',threat:'JUGGERNAUT',priority:['armory','artillery','medical'],advice:'Find weapon and artillery support before challenging the armored boss.'}:cycle===2?{name:'QUARANTINE DISTRICT',threat:'OUTBREAK PRIME',priority:['artillery','medical','armory'],advice:'Prepare artillery and medical support for the swarm.'}:{name:'FORTIFIED OUTSKIRTS',threat:'SIEGE BREAKER',priority:['medical','armory','artillery'],advice:'Secure medical support and weapons for the high-impact assault.'};
  }
  function scouting(meta,t){
    var unseen=0;if(!t||t.site!=='hill')return {unseen:0,radius:8};
    for(var n=1;n<=phase(meta);n++)zone(n).tiles.forEach(function(other){if(Math.max(Math.abs(t.x-other.x),Math.abs(t.y-other.y))<=8&&!visible(meta,other))unseen++;});
    return {unseen:unseen,radius:8};
  }
  function discovery(meta){
    var n=phase(meta),z=zone(n),profile=district(n);
    for(var site of profile.priority){var t=z.tiles.find(function(t){return t.site===site&&!complete(meta,t)&&visible(meta,t);});if(t)return t;}
    return z.tiles.find(function(t){return t.site==='hill'&&visible(meta,t)&&!(data(meta).towers&&data(meta).towers[t.id]);})||null;
  }
  function mount(panel,meta,persist,refresh,back,deploy){
    var start=initialize(meta,persist),n=phase(meta),z=zone(n),selected=z.byId[z.entry],dead=false,timer=null,repeat=null;
    var camera={x:selected.x,y:selected.y,scale:64},pointers=new Map(),gesture=null,pinching=false,view={w:1,h:1},rendered=[],popups=[];
    var names={grove:'WOODLAND',cache:'SUPPLY CACHE',depot:'SALVAGE DEPOT',road:'APPROACH ROAD',armory:'FIELD ARMORY',medical:'MEDICAL STATION',artillery:'ARTILLERY CACHE',hill:'SCOUTING HILL'};
    var shell=document.createElement('section');shell.id='rc-world';shell.setAttribute('aria-label','Reclamation world');
    shell.innerHTML='<header class="rw-top"><div><small>LAST STAND COMMAND · WORLD</small><h2 id="rw-location">TOWN '+n+' APPROACH</h2><span id="rw-wallet"></span></div><button id="rw-back">BASE</button></header><div class="rw-map"><canvas id="rw-canvas" aria-label="World map. Drag to explore, pinch to zoom, hold a visible connected tile to reclaim." tabindex="0"></canvas><div class="rw-tools"><button id="rw-minus" aria-label="Zoom out">−</button><button id="rw-plus" aria-label="Zoom in">+</button><button id="rw-center">NEXT ROUTE TILE</button></div><div id="rw-hint">BLACK · UNSEEN / GRAY · SCOUTED / COLOR · RESTORED</div></div><footer class="rw-dock"><div class="rw-row"><b id="rw-title"></b><span id="rw-progress"></span></div><details id="rw-inspect"><summary id="rw-summary">Tile details</summary><button id="rw-range" type="button">PREVIEW SCOUTING RANGE</button><div id="rw-detail"></div><div id="rw-status" role="status" aria-live="polite"></div></details><div class="rw-row"><button id="rw-action"></button><button id="rw-collect"></button></div><div id="rw-purpose" style="font-size:11px;color:#c3d8cf;margin:5px 0"></div><div id="rw-route"></div><div id="rw-bonuses"></div><button id="rw-fight">PREPARE TOWN DEFENSE</button></footer>';
    if(!document.getElementById('rw-style')){
      // Body-level sibling: above Command Base (30000), below battle dialogs (31000+).
      // Build 194 used 10020, which rendered the world behind the opaque base.
      var style=document.createElement('style');style.id='rw-style';style.textContent=`
      #rc-world{position:fixed;inset:0;z-index:30500;background:#08181e;color:#e8f3e9;display:flex;flex-direction:column;font-family:system-ui,sans-serif;padding-top:env(safe-area-inset-top);box-sizing:border-box;overscroll-behavior:none}#rc-world *{box-sizing:border-box}#rc-world button{font:700 11px system-ui;color:#e6f6ee;background:#15383c;border:1px solid #497b78;border-radius:9px;min-height:42px;padding:8px 12px;touch-action:manipulation}#rc-world button:disabled{opacity:.5}.rw-top{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;gap:10px;border-bottom:1px solid #31515b}.rw-top small{font-size:9px;color:#8bbfbc;letter-spacing:1px}.rw-top h2{font-size:19px;margin:4px 0}.rw-top span{font-size:11px;color:#eed48f}.rw-map{position:relative;flex:1;min-height:100px;overflow:hidden}#rw-canvas{display:block;width:100%;height:100%;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}.rw-tools{position:absolute;top:10px;right:10px;display:flex;gap:5px}#rw-hint{position:absolute;bottom:8px;left:10px;right:10px;text-align:center;color:#c4d4d1;background:#07151dcc;padding:6px;font-size:10px;pointer-events:none;border-radius:8px}.rw-dock{padding:10px 14px max(10px,env(safe-area-inset-bottom));border-top:1px solid #527266;background:#0b2028;flex:none}.rw-row{display:flex;align-items:center;justify-content:space-between;gap:8px}.rw-row b{font-size:13px}.rw-row span{font-size:11px;color:#e8cb84}#rw-detail{font-size:11px;line-height:1.4;color:#b0c9c6;min-height:34px;margin:5px 0}#rw-action{flex:1;border-color:#c9b877!important}#rw-status{font-size:11px;min-height:28px;line-height:1.3;padding:5px 0;color:#efcf86}#rw-fight{width:100%;background:#16603d!important;border-color:#66c991!important}#rw-canvas:focus-visible{outline:2px solid #eed38c;outline-offset:-3px}@media(max-height:600px){.rw-top{padding:5px 12px}.rw-top h2{font-size:15px}.rw-dock{padding-top:5px}#rw-status{min-height:20px}#rw-hint{display:none}}
      #rw-route{font:700 11px system-ui;color:#e3cb8e;margin-top:5px}#rw-bonuses{font-size:11px;color:#9bd5b5;min-height:30px;padding:5px 0}#rw-fight{min-height:44px}#rw-status{min-height:30px;max-height:44px;overflow:hidden}.rw-top{padding:8px 14px}.rw-top h2{font-size:18px}.rw-tools{gap:4px}#rc-world .rw-tools button{font-size:10px;padding:6px 9px}.rw-dock{padding-top:8px}#rw-detail{min-height:34px;max-height:48px;overflow:auto}
      #rw-inspect{font-size:11px;color:#b0c9c6;margin:3px 0}#rw-inspect summary{cursor:pointer;min-height:30px;padding:7px 0;color:#b8ccc8}#rw-inspect[open]{max-height:110px;overflow:auto}#rw-detail{min-height:0;max-height:none;margin:0 0 4px}#rw-status{min-height:0;max-height:none;padding:2px 0 5px}#rw-route{font-size:10px;margin-top:6px}#rw-bonuses{font-size:10px;min-height:22px;padding:4px 0}.rw-dock{padding-top:7px}.rw-discovery{position:absolute;z-index:3;pointer-events:none;border:2px solid #a6e8a8;background:#9bdd8e44;transform:translate(-50%,-50%);animation:rw-discover 1s ease-out forwards}.rw-city-discovery{border:3px solid #ffe6a3;background:#f2cd7244;animation-duration:1.6s;box-shadow:0 0 18px #f2cd72aa}@keyframes rw-discover{0%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.25)}}@media(prefers-reduced-motion:reduce){.rw-discovery,.rw-city-discovery{animation:none;opacity:.35}.rw-reward{animation:none!important;transform:translate(-50%,-15px)}}
      `;document.head.appendChild(style);
    }
    panel.innerHTML='';document.body.appendChild(shell);
    var briefing=document.createElement('button');briefing.id='rw-briefing';briefing.textContent='FIND SUPPORT';shell.querySelector('.rw-tools').appendChild(briefing);
    var canvas=shell.querySelector('canvas'),ctx=canvas.getContext('2d'),status=shell.querySelector('#rw-status'),action=shell.querySelector('#rw-action');
    var popupStyle=document.createElement('style');popupStyle.textContent='.rw-reward{position:absolute;z-index:4;pointer-events:none;white-space:pre-line;text-align:center;width:max-content;max-width:180px;padding:3px 6px;border-radius:5px;background:#071610bb;color:#e9d383;font:700 11px/1.35 system-ui;text-shadow:0 1px 3px #000;box-shadow:none;animation:rw-reward-rise 2.6s ease-out forwards}@keyframes rw-reward-rise{0%{opacity:0;transform:translate(-50%,0)}12%{opacity:1}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-28px)}}';shell.appendChild(popupStyle);
    function positionPopups(){popups.forEach(function(p){p.el.style.left=Math.max(92,Math.min(view.w-92,(p.t.x-camera.x)*camera.scale+view.w/2))+'px';p.el.style.top=Math.max(55,Math.min(view.h-65,(p.t.y-camera.y)*camera.scale+view.h/2-camera.scale*.65-30))+'px';if(p.glow){p.glow.style.left=((p.t.x-camera.x)*camera.scale+view.w/2)+'px';p.glow.style.top=((p.t.y-camera.y)*camera.scale+view.h/2)+'px';p.glow.style.width=camera.scale+'px';p.glow.style.height=camera.scale+'px';}});}
    function showReward(t,labels){
      // Completion glow also marks ordinary terrain without inventing a reward.
      if(popups.length>=4){var first=popups.shift();clearTimeout(first.timer);first.el.remove();if(first.glow)first.glow.remove();}
      var el=document.createElement('div');el.className='rw-reward';el.textContent=labels.join('\n');el.setAttribute('role','status');shell.querySelector('.rw-map').appendChild(el);
      if(!labels.length)el.style.display='none';var glow=document.createElement('div');glow.className='rw-discovery'+(t.id===zone(t.zone).town?' rw-city-discovery':'');shell.querySelector('.rw-map').appendChild(glow);var item={el:el,t:t,glow:glow};popups.push(item);positionPopups();item.timer=setTimeout(function(){el.remove();glow.remove();popups=popups.filter(function(p){return p!==item;});},2700);
    }
    function stop(){clearTimeout(timer);clearTimeout(repeat);timer=repeat=null;}
    function message(text){status.textContent=text;if(/failed|Not enough/i.test(text))shell.querySelector('#rw-inspect').open=true;}
    function textAt(id,value){var el=shell.querySelector(id);if(el.textContent!==value)el.textContent=value;}
    function wallet(){
      textAt('#rw-wallet',Math.floor(meta.credits).toLocaleString()+' CREDITS · '+Number(meta.bestPhase||0)+' TOWNS HELD');
      var inc=income(meta);textAt('#rw-collect','COLLECT '+inc.credits+' · +'+inc.rate+'/MIN');
    }
    function detail(){
      var s=state(meta,selected),p=progress(meta,selected),tower=data(meta).towers&&data(meta).towers[selected.id];
      wallet();
      textAt('#rw-location','DISTRICT '+selected.zone+' · '+(selected.zone<n?'LIBERATED':district(n).name));
      var plan=district(n),target=discovery(meta);textAt('#rw-purpose','OBJECTIVE: TOWN '+n+' · '+plan.threat+' — '+(target?'Find '+names[target.site]+'.':'Clear the approach or defend the town.'));
      var rangeButton=shell.querySelector('#rw-range');rangeButton.style.display=selected.site==='hill'&&!tower?'block':'none';textAt('#rw-summary',selected.site==='hill'&&!tower?'Tower preview · '+scouting(meta,selected).unseen+' unseen tiles':'Tile details');
      var terrainName={forest:'WOODLAND',meadow:'FALLOW FIELD',highland:'ROCKY GROUND',water:'WATERWAY',bank:'RIVERBANK'}[root.LSCWorldArt.terrain(selected)];
      shell.querySelector('#rw-title').textContent=s==='fog'?'UNEXPLORED':selected.id===zone(selected.zone).town?'TOWN '+selected.zone+' STAGING SITE':selected.kind==='grove'&&!selected.site?terrainName:names[selected.site||selected.kind];
      shell.querySelector('#rw-progress').textContent=s==='fog'?'?':p+'/'+selected.actions;
      var extra=selected.site==='armory'?'+10% commander / turret damage':selected.site==='medical'?'+10% command-post health':selected.site==='artillery'?'+15% artillery damage':selected.site==='hill'?'Build a tower for 75 Credits: reveal an 8-tile radius.':selected.parts?'Discover '+selected.parts+' Tech Part.':selected.credits?'Discover '+selected.credits+' Credits.':'Expand visibility and access to adjacent tiles.';
      if(selected.site&&selected.site!=='hill'&&selected.zone<n)extra='Town '+selected.zone+' site. No bonus to your current Town '+n+' defense.';
      if(selected.site==='hill'&&!tower){var preview=scouting(meta,selected);extra='Tower: 75 Credits · '+preview.unseen+' unseen tiles in range. Reveals terrain; does not restore it.';}
      var cityPreview=townReward(meta,selected);if(cityPreview)extra='On restoration: +'+cityPreview+' Credits. Defense victory is still required to secure the town.';
      shell.querySelector('#rw-detail').textContent=s==='fog'?'Explore the frontier or build a hill tower to reveal this tile.':(selected.required?'Required route. ':'Optional discovery. ')+(s==='reclaimed'?extra:((selected.actions-p)*selected.cost)+' Credits remaining · '+extra)+(selected.site&&selected.site!=='hill'&&selected.zone===n?' Applies to Town '+n+' first-clear attempts.':'');
      action.disabled=s==='fog'||s==='locked'||(s==='reclaimed'&&!(selected.site==='hill'&&!tower))||meta.credits<(s==='reclaimed'?75:selected.cost);
      action.textContent=s==='reclaimed'?(selected.site==='hill'?(tower?'TOWER ACTIVE':'BUILD TOWER · 75'):'RESTORED'):s==='locked'?'CONNECT A NEIGHBOR':s==='fog'?'HIDDEN':'RESTORE · '+selected.cost+' / STEP';

      var left=z.route.filter(function(id){return !complete(meta,z.byId[id]);}).length,b=bonuses(meta,n),bonus=[];
      if(b.damage)bonus.push('DMG +10%');if(b.hq)bonus.push('HP +10%');if(b.artillery)bonus.push('ART +15%');
      textAt('#rw-route',left?'APPROACH: '+(z.route.length-left)+' / '+z.route.length+' TILES RESTORED':'APPROACH SECURED · TOWN '+n);
      textAt('#rw-bonuses',bonus.length?'PREPARATION: '+bonus.join(' · '):'Optional discoveries improve this town’s defense.');
      shell.querySelector('#rw-fight').disabled=left>0;
    }
    function project(t){return {x:(t.x-camera.x)*camera.scale+view.w/2,y:(t.y-camera.y)*camera.scale+view.h/2};}
    function draw(){
      if(dead)return;
      rendered=root.LSCWorldArt.draw(ctx,meta,view,camera,root.LSCReclamation,selected);
      if(selected.site==='hill'&&!(data(meta).towers&&data(meta).towers[selected.id])&&visible(meta,selected)){
        var center=project(selected);ctx.save();ctx.strokeStyle='#79d6e5';ctx.lineWidth=2;ctx.fillStyle='rgba(95,200,220,.08)';ctx.strokeRect(center.x-camera.scale*8.5,center.y-camera.scale*8.5,camera.scale*17,camera.scale*17);ctx.restore();
      }
      positionPopups();
    }
    function redraw(){detail();draw();}
    function resize(){var box=canvas.getBoundingClientRect(),ratio=Math.min(2,root.devicePixelRatio||1);view={w:box.width,h:box.height};canvas.width=Math.round(box.width*ratio);canvas.height=Math.round(box.height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw();}
    function perform(t){
      if(dead||document.hidden)return false;
      selected=t;var result=act(meta,t.id,persist);refresh();redraw();
      if(result.done)showReward(t,result.rewards);
      message(!result.ok?result.reason:result.done?(result.rewards.length?result.rewards.join(' · '):t.site&&t.site!=='hill'&&t.zone<n?'Restored for Town '+t.zone+'. No current defense bonus.':'Tile restored.'):'Restoration saved. Release to stop.');
      return result.ok&&!result.done;
    }
    function hit(e){var rect=canvas.getBoundingClientRect(),px=e.clientX-rect.left,py=e.clientY-rect.top;return rendered.find(function(p){return Math.abs(p.x-px)<camera.scale/2&&Math.abs(p.y-py)<camera.scale/2;});}
    canvas.onpointerdown=function(e){
      if(e.button!==0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});stop();
      if(pointers.size>1){pinching=true;gesture=null;return;}
      pinching=false;var h=hit(e);gesture={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y,moved:false,held:false,t:h&&h.t};
      if(h){selected=h.t;redraw();timer=setTimeout(function(){if(!gesture||gesture.moved||pinching)return;gesture.held=true;var tile=gesture.t;function work(){if(perform(tile))repeat=setTimeout(work,(!tile.site&&!tile.required&&tile.kind==='grove')?100:350);}work();},450);}
    };
    canvas.onpointermove=function(e){
      if(!pointers.has(e.pointerId))return;e.preventDefault();var before=Array.from(pointers.values());pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size>1){stop();var after=Array.from(pointers.values()),dist=function(a){return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);};camera.scale=Math.max(18,Math.min(100,camera.scale*dist(after)/Math.max(1,dist(before))));draw();return;}
      if(!gesture||pinching)return;var ddx=e.clientX-gesture.x,ddy=e.clientY-gesture.y;
      if(Math.hypot(ddx,ddy)>10){gesture.moved=true;stop();camera.x=gesture.cx-ddx/camera.scale;camera.y=gesture.cy-ddy/camera.scale;draw();}
    };
    function end(e){stop();pointers.delete(e.pointerId);gesture=null;if(!pointers.size)pinching=false;}
    canvas.onpointerup=end;canvas.onpointercancel=end;canvas.onlostpointercapture=end;
    canvas.oncontextmenu=function(e){e.preventDefault();};
    canvas.onkeydown=function(e){var delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(delta){e.preventDefault();var t=find(meta,(selected.x+delta[0])+','+(selected.y+delta[1]));if(t){selected=t;camera.x=t.x;camera.y=t.y;redraw();}}if(e.key==='Enter'||e.key===' '){e.preventDefault();action.click();}};
    shell.querySelector('#rw-range').onclick=function(){stop();camera.x=selected.x;camera.y=selected.y;camera.scale=Math.max(8,Math.min(30,Math.min(view.w,view.h)/18));draw();};
    action.onclick=function(){stop();if(selected.site==='hill'&&complete(meta,selected)){var result=buildTower(meta,selected.id,persist);message(result.ok?'Tower online. Fog revealed up to 8 tiles away.':result.reason);refresh();redraw();if(result.ok)showReward(selected,['SCOUTING · 8-TILE RADIUS']);}else perform(selected);};
    shell.querySelector('#rw-collect').onclick=function(){stop();var result=collect(meta,persist);message(result.ok?'Supply Credits collected.':result.reason);refresh();redraw();};
    shell.querySelector('#rw-fight').onclick=function(){stop();if(ready(meta,n))back();};
    shell.querySelector('#rw-back').onclick=function(){stop();if(deploy)deploy('hq');else back();};
    briefing.onclick=function(){stop();var target=discovery(meta);if(target){selected=target;camera.x=target.x;camera.y=target.y;redraw();shell.querySelector('#rw-inspect').open=true;message(district(n).advice);}else{message('No unfinished support site is currently visible. Scout from a hill, or prepare the town defense.');shell.querySelector('#rw-inspect').open=true;}};
    shell.querySelector('#rw-center').onclick=function(){stop();selected=z.byId[z.route.find(function(id){return !complete(meta,z.byId[id]);})||z.town];camera.x=selected.x;camera.y=selected.y;redraw();};
    shell.querySelector('#rw-plus').onclick=function(){stop();camera.scale=Math.min(100,camera.scale*1.25);draw();};
    shell.querySelector('#rw-minus').onclick=function(){stop();camera.scale=Math.max(18,camera.scale/1.25);draw();};
    function suspend(){stop();gesture=null;pointers.clear();}
    root.addEventListener('resize',resize);root.addEventListener('blur',suspend);root.addEventListener('pagehide',suspend);document.addEventListener('visibilitychange',suspend);
    var observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;if(observer)observer.observe(canvas.parentElement);
    var clock=setInterval(function(){if(!dead&&!document.hidden)wallet();},1000);
    resize();redraw();message(start.ok?(Number(meta.bestPhase)>0?'Your '+meta.bestPhase+' previous Campaign victories are retained as secured towns.':'Explore from HQ. Towers can only be built on restored hills.'):start.reason);
    return function(){dead=true;stop();popups.forEach(function(p){clearTimeout(p.timer);p.el.remove();if(p.glow)p.glow.remove();});popups=[];if(observer)observer.disconnect();clearInterval(clock);root.removeEventListener('resize',resize);root.removeEventListener('blur',suspend);root.removeEventListener('pagehide',suspend);document.removeEventListener('visibilitychange',suspend);shell.remove();};
  }
  root.LSCReclamation=Object.freeze({district:district,scouting:scouting,discovery:discovery,tiles:legacy,zone:zone,phase:phase,supply:supply,find:find,progress:progress,state:state,visible:visible,act:act,initialize:initialize,buildTower:buildTower,townReward:townReward,ready:ready,bonuses:bonuses,applyBonuses:applyBonuses,income:income,collect:collect,beforeVictory:beforeVictory,mount:mount});
})(typeof window!=='undefined'?window:globalThis);
