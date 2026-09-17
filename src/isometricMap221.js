/* Build 221: presentation only. Tile IDs and settlement simulation stay unchanged. */
(function(root){
 'use strict';
 var revision=0,atlases={},buildingArt={},roadArt={},buildingLayout={
  workshop:{scale:.74,anchorX:.42,groundY:.18}
 },roadLayout={
  straight:{file:'dirt-straight.png',crop:[68,280,887,497]},
  corner:{file:'dirt-corner.jpg',crop:[67,281,894,496]},
  tee:{file:'dirt-t-junction.jpg',crop:[68,281,887,496]},
  cross:{file:'dirt-crossroads.jpg',crop:[47,262,924,511]},
  bridge:{file:'dirt-bridge.jpg',crop:[51,246,920,544]},
  end:{file:'dirt-ending.jpg',crop:[63,274,898,502]}
 };
 if(typeof Image!=='undefined')['color','surveyed'].forEach(function(k){var im=new Image();im.onload=function(){revision++;};im.src='assets/isometric221/'+k+'.png';atlases[k]=im;});
 if(typeof Image!=='undefined'){var lumber=new Image();lumber.onload=function(){revision++;};lumber.src='assets/buildings/lumber-camp.png';buildingArt.workshop=lumber;}
 if(typeof Image!=='undefined')Object.keys(roadLayout).forEach(function(name){var im=new Image();im.onload=function(){revision++;};im.src='assets/roads/'+roadLayout[name].file;roadArt[name]=im;});
 function project(t,c,v){return {x:v.w/2+(t.x-c.x-t.y+c.y)*c.scale/2,y:v.h/2+(t.x-c.x+t.y-c.y)*c.scale/4};}
 function unproject(x,y,c,v){x-=v.w/2;y-=v.h/2;return {x:c.x+x/c.scale+2*y/c.scale,y:c.y-x/c.scale+2*y/c.scale};}
 function diamond(g,p,s){g.beginPath();g.moveTo(p.x,p.y-s/4);g.lineTo(p.x+s/2,p.y);g.lineTo(p.x,p.y+s/4);g.lineTo(p.x-s/2,p.y);g.closePath();}
 function extent(points){var u=points.map(function(t){return t.x-t.y;}),v=points.map(function(t){return t.x+t.y;});return {u0:Math.min.apply(null,u)-2,u1:Math.max.apply(null,u)+2,v0:Math.min.apply(null,v)-2,v1:Math.max.apply(null,v)+2};}
 function fit(c,v,points,top,bottom){if(!points.length)return;var e=extent(points),h=Math.max(80,v.h-top-bottom);c.scale=Math.max(4,Math.min(100,(v.w-28)*2/(e.u1-e.u0),h*4/(e.v1-e.v0)));var u=(e.u0+e.u1)/2,w=(e.v0+e.v1)/2-(top-bottom)*2/c.scale;c.x=(u+w)/2;c.y=(w-u)/2;}
 function clamp(c,v,points,top,bottom){if(!points.length)return;var e=extent(points),pad=3,u=c.x-c.y,w=c.x+c.y,halfU=v.w/c.scale,halfV=Math.max(80,v.h-top-bottom)*2/c.scale,offset=(top-bottom)*2/c.scale;
  function limit(n,a,b,half){return a+half>b-half?(a+b)/2:Math.max(a+half,Math.min(b-half,n));}
  u=limit(u,e.u0-pad,e.u1+pad,halfU);w=limit(w+offset,e.v0-pad,e.v1+pad,halfV)-offset;c.x=(u+w)/2;c.y=(w-u)/2;
 }
 function roadPlan(mask,water){var land={0:['straight',0],1:['end',2],2:['end',0],3:['straight',0],4:['end',3],5:['corner',2],6:['corner',3],7:['tee',2],8:['end',1],9:['corner',1],10:['corner',0],11:['tee',0],12:['straight',1],13:['tee',1],14:['tee',3],15:['cross',0]};return water?(mask===3||!mask?['bridge',0]:mask===12?['bridge',1]:null):(land[mask]||land[0]);}
 function paint(g,m,v,c,selected,path,now,cache){
  var api=root.LSCSettlement,d=m.settlement204,s=c.scale,tiles=api.tiles,point=selected&&tiles[selected],selection=point&&project(point,c,v);
  var stamp=[revision,d.at,d.renderRevision||0,c.x,c.y,s,v.w,v.h,selected,(path||[]).join('|')].join(':');
  function at(id){return tiles[id]&&project(tiles[id],c,v);}
  function sprite(p,name,w,colored,ground){var a=atlases[colored?'color':'surveyed'],r=(root.LSCIsoAssets221||{})[name];if(!a||!a.complete||!a.naturalWidth||!r)return false;var h=ground?w/2:w*r[3]/r[2];g.drawImage(a,r[0],r[1],r[2],r[3],p.x-w/2,ground?p.y-h/2:p.y+s*.14-h,w,h);return true;}
  function standalone(p,name){var im=buildingArt[name],layout=buildingLayout[name]||{scale:.7,anchorX:.5,groundY:.14};if(!im||!im.complete||!im.naturalWidth)return false;var w=s*layout.scale,h=w*im.naturalHeight/im.naturalWidth;g.drawImage(im,p.x-w*layout.anchorX,p.y+s*layout.groundY-h,w,h);return true;}
  function roadPiece(p,mask,water){var plan=roadPlan(mask,water);if(!plan)return false;var im=roadArt[plan[0]],layout=roadLayout[plan[0]];if(!im||!im.complete||!im.naturalWidth||!layout)return false;var a=[[1,0,0,1],[0,.5,-2,0],[-1,0,0,-1],[0,-.5,2,0]][plan[1]||0],r=layout.crop;g.save();diamond(g,p,s+.8);g.clip();g.translate(p.x,p.y);g.transform(a[0],a[1],a[2],a[3],0,0);g.drawImage(im,r[0],r[1],r[2],r[3],-s/2,-s/4,s,s/2);g.restore();return true;}
  function improvedRoad(p,t,mask,tier){if(tier<2||t.terrain==='water')return;var connections=[[1,0,1],[-1,0,2],[0,1,4],[0,-1,8]].filter(function(a){return mask&a[2];});if(!connections.length)connections=[[1,0,1],[-1,0,2]];g.save();g.lineCap='round';g.lineJoin='round';connections.forEach(function(a){var q=project({x:t.x+a[0]*.5,y:t.y+a[1]*.5},c,v);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.strokeStyle=tier>=3?'#66645b99':'#d8b87c77';g.lineWidth=tier>=3?s*.13:s*.075;g.stroke();if(tier>=3){g.strokeStyle='#c9c4adbb';g.lineWidth=s*.075;g.stroke();}});g.fillStyle=tier>=3?'#c9c4adbb':'#d8b87c77';g.beginPath();g.arc(p.x,p.y,tier>=3?s*.038:s*.024,0,Math.PI*2);g.fill();g.restore();}
  function badge(id,text,color){var p=at(id);if(!p)return;g.font='bold 11px system-ui';g.textAlign='center';var w=Math.min(260,g.measureText(text).width+12);g.fillStyle='#092125ed';g.fillRect(p.x-w/2,p.y+s*.21,w,18);g.fillStyle=color||'#f9e2a2';g.fillText(text,p.x,p.y+s*.21+13,w-8);}
  function base(){
   g.fillStyle='#030808';g.fillRect(0,0,v.w,v.h);
   var ordered=Object.keys(d.visible).filter(function(id){return d.visible[id]&&tiles[id];}).map(function(id){return tiles[id];}).sort(function(a,b){return a.x+a.y-b.x-b.y||a.x-b.x;});
   ordered.forEach(function(t){var p=at(t.id);if(p.x+s<0||p.x-s>v.w||p.y+s<0||p.y-s*2>v.h)return;var colored=!!d.cleared[t.id]||t.terrain==='water';diamond(g,p,s+.6);g.fillStyle=colored?(t.terrain==='water'?'#438fd0':t.terrain==='bank'?'#cbb873':t.terrain==='hill'?'#817759':'#83a841'):'#64696a';g.fill();g.save();diamond(g,p,s+.6);g.clip();sprite(p,t.terrain==='water'?'water':t.terrain==='bank'?'sand':t.terrain==='hill'?'rock':'grass',s+1,colored,true);g.restore();diamond(g,p,s);g.lineWidth=.6;g.strokeStyle=colored?'#25381d33':'#bac1c12a';g.stroke();
    if(d.roads[t.id]){var mask=0;[[1,0,1],[-1,0,2],[0,1,4],[0,-1,8]].forEach(function(a){if(d.roads[(t.x+a[0])+','+(t.y+a[1])])mask|=a[2];});if(!mask)mask=3;var full={1:3,2:3,4:12,8:12}[mask]||mask,tier=api.villageLevel?api.villageLevel(m):1;if(!roadPiece(p,mask,t.terrain==='water')){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}improvedRoad(p,t,mask,tier);}
   });
   ordered.forEach(function(t){var p=at(t.id);if(p.x+s<0||p.x-s>v.w||p.y+s<0||p.y-s*2>v.h)return;var b=d.buildings[t.id],colored=!!d.cleared[t.id]||t.terrain==='water',name=null,width=s*.68;
    if(t.id==='0,0'){name='town1';width=s*.88;}
    else if(b){name=b.kind==='workshop'?null:({farm:'farm',quarry:'mine',ironMine:'mine',house:'house',tower:'tower',harbor:'house'}[b.kind]||'house');width=b.kind==='tower'?s*.43:s*.72;}
    else if(t.town){name=t.town%2?'town1':'town2';width=s*.85;}
    else if(t.landmark){name='house';width=s*.64;}
    else if(!d.roads[t.id]){if(t.terrain==='hill'){name='mountain';width=s*.74;}else if(t.terrain==='plain'&&Math.abs(t.x*7+t.y*11)%4){name='tree';width=s*.48;}}
    if(name){g.save();if(selection&&selected!==t.id&&p.y>selection.y&&p.y-selection.y<s&&Math.abs(p.x-selection.x)<s*.5)g.globalAlpha=.35;sprite(p,name,width,colored,false);g.restore();}
    if(b&&b.kind==='workshop'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'workshop');g.restore();}
    if(b&&b.kind==='harbor'){g.save();var a=[[1,0],[-1,0],[0,1],[0,-1]].find(function(a){var q=tiles[(t.x+a[0])+','+(t.y+a[1])];return q&&q.terrain==='water';})||[1,0],q=project({x:t.x+a[0]*.47,y:t.y+a[1]*.47},c,v);g.strokeStyle='#755436';g.lineWidth=s*.12;g.beginPath();g.moveTo(p.x,p.y+s*.08);g.lineTo(q.x,q.y);g.stroke();g.strokeStyle='#d9b577';g.lineWidth=s*.07;g.stroke();g.restore();boat(q,s*.13);}
   });
   ordered.forEach(function(t){
    if(t.id==='0,0')badge(t.id,d.study?'HQ · Researching':'HQ','#fff0ba');
    else if(selected===t.id&&t.town)badge(t.id,api.town(t.town).name);
    else if(t.town&&s>=55)badge(t.id,d.welcomed[t.town]?(cache.net&&cache.net.has(t.id)?'✓ Connected village':'✓ Welcomed'):d.defended[t.town]?'Survivors waiting':'★'.repeat(api.stars(t.town)),d.welcomed[t.town]?'#a7f0b3':'#ffd278');
    if(t.id===selected&&!d.buildings[t.id]&&api.stoneDeposit&&api.stoneDeposit(t.id))badge(t.id,'STONE DEPOSIT','#d6e2e5');
    if(t.landmark&&s>55)badge(t.id,(d.claimed||{})[t.id]?'✓':'!');
   });
   (path||[]).forEach(function(id){var p=at(id);if(p){diamond(g,p,s*.94);g.strokeStyle='#91ebd6';g.lineWidth=3;g.stroke();}});
   if(selection){diamond(g,selection,s*.97);g.strokeStyle='#ffe79b';g.lineWidth=3;g.stroke();}
  }
  function boat(p,size){g.fillStyle='#f0d6a1';g.beginPath();g.moveTo(p.x-size,p.y-size*.4);g.lineTo(p.x+size,p.y-size*.4);g.lineTo(p.x+size*.6,p.y+size*.4);g.lineTo(p.x-size*.6,p.y+size*.4);g.closePath();g.fill();g.fillStyle='#ac653e';g.fillRect(p.x-1,p.y-size,size*.6,size*.7);}
  if(typeof document!=='undefined'){
   if(!cache.isoCanvas)cache.isoCanvas=document.createElement('canvas');
   if(cache.isoStamp!==stamp){var real=g,off=cache.isoCanvas,r=Math.min(2,root.devicePixelRatio||1);off.width=v.w*r;off.height=v.h*r;g=off.getContext('2d');g.setTransform(r,0,0,r,0,0);base();g=real;cache.isoStamp=stamp;}
   g.drawImage(cache.isoCanvas,0,0,v.w,v.h);
  }else base();
  var zone=api.currentRegionObjective(m);if(zone){var open=[];zone.tiles.forEach(function(id){if(!d.visible[id]||d.cleared[id])return;open.push(id);var p=at(id);if(!p)return;var pulse=1+Math.sin((now||0)/280)*.035;diamond(g,p,s*.91*pulse);g.fillStyle='#f2cc4966';g.fill();g.strokeStyle='#ffe077';g.lineWidth=Math.max(3,s*.045);g.stroke();if(s>=34){g.fillStyle='#102729ee';g.beginPath();g.arc(p.x,p.y-s*.13,Math.max(8,s*.10),0,Math.PI*2);g.fill();g.fillStyle='#ffe077';g.font='bold '+Math.max(11,Math.round(s*.14))+'px system-ui';g.textAlign='center';g.fillText('★',p.x,p.y-s*.13+4);}});badge(zone.town.x+','+zone.town.y,'SECURE '+zone.secured+'/'+zone.required,'#ffe077');var target=open[0]&&at(open[0]);if(target&&(target.x<18||target.x>v.w-18||target.y<72||target.y>v.h-76)){var edge={x:Math.max(24,Math.min(v.w-24,target.x)),y:Math.max(86,Math.min(v.h-90,target.y))};g.fillStyle='#102729ee';g.strokeStyle='#ffe077';g.lineWidth=3;g.beginPath();g.arc(edge.x,edge.y,15,0,Math.PI*2);g.fill();g.stroke();g.fillStyle='#ffe077';g.font='bold 15px system-ui';g.textAlign='center';g.fillText('★',edge.x,edge.y+5);}}
  (d.queue||[]).forEach(function(q){q.project.path.forEach(function(id){var p=at(id);if(p){diamond(g,p,s*.9);g.strokeStyle='#d3b87988';g.lineWidth=1;g.stroke();}});});
  function crew(p,count,color){g.fillStyle=color;for(var i=0;i<Math.min(6,count);i++){g.beginPath();g.arc(p.x+(i%3-1)*5,p.y+Math.floor(i/3)*6,2.5,0,Math.PI*2);g.fill();}}
  api.jobs(m).forEach(function(j){j.path.slice((j.done||0)+1).forEach(function(id){var p=at(id);if(p){diamond(g,p,s*.9);g.strokeStyle='#d5bd7988';g.lineWidth=1;g.stroke();}});var id=j.path[j.done||0],p=at(id);if(!p)return;var total=j.work[j.done||0]||1,progress=Math.min(total,(j.progress||0)+Math.max(0,(now-d.at)/1000)*api.speed(m,j)),f=progress/total,from=at(j.done?j.path[j.done-1]:j.origin)||p;diamond(g,p,s*.9);g.strokeStyle='#ffdc80';g.lineWidth=2;g.stroke();g.fillStyle='#10282b';g.fillRect(p.x-s*.3,p.y,s*.6,5);g.fillStyle='#efc56b';g.fillRect(p.x-s*.3,p.y,s*.6*f,5);crew({x:from.x+(p.x-from.x)*Math.min(1,f*5),y:from.y+(p.y-from.y)*Math.min(1,f*5)-7},j.crew,'#f5cc75');if(selected===id)badge(id,j.crew+' builders · '+Math.round(f*100)+'%');});
  if(d.scout){var j=d.scout,total=j.work[0]||1,progress=Math.min(total,(j.progress||0)+Math.max(0,(now-d.at)/1000)*api.speed(m,j)),out=Math.max(1,j.path.length-1)*20,returning=progress>=j.revealAt,f=returning?1-(progress-j.revealAt)/Math.max(1,total-j.revealAt):Math.min(1,progress/out);f=Math.max(0,Math.min(1,f));var n=f*(j.path.length-1),a=at(j.path[Math.floor(n)]),b=at(j.path[Math.min(j.path.length-1,Math.floor(n)+1)]);if(a&&b)crew({x:a.x+(b.x-a.x)*(n%1),y:a.y+(b.y-a.y)*(n%1)},j.crew,'#8de7ed');badge(j.target,returning?'Scouts returning':progress>=out?'Surveying':'Scouts traveling','#9ce4ed');}
  (cache.routes||[]).forEach(function(r){if(!r.path||!r.path.length)return;g.beginPath();r.path.forEach(function(id,i){var p=at(id);if(p)g[i?'lineTo':'moveTo'](p.x,p.y);});g.strokeStyle='#9bcfdf66';g.lineWidth=1;g.setLineDash([3,5]);g.stroke();g.setLineDash([]);});
  Object.keys(d.fishing||{}).forEach(function(id){var f=d.fishing[id];if(!f.workers||!f.path||!f.path.length)return;var remaining=Math.max(0,f.travelRemaining-Math.max(0,(now-d.at)/1000)),ratio=f.travelTotal?Math.min(1,1-remaining/f.travelTotal):1,n=ratio*(f.path.length-1),a=at(f.path[Math.floor(n)]),b=at(f.path[Math.min(f.path.length-1,Math.floor(n)+1)]);if(a&&b)boat({x:a.x+(b.x-a.x)*(n%1),y:a.y+(b.y-a.y)*(n%1)},Math.max(4,s*.12));});
  if(selected&&d.buildings[selected]){var b=d.buildings[selected];if(b.kind==='farm'||b.kind==='workshop'||b.kind==='quarry'||b.kind==='ironMine')badge(selected,api.connected(m,selected)?b.workers+' workers':'Needs supply road','#d6ead4');}
  else if(selected&&d.visible[selected]&&api.ironDeposit(selected))badge(selected,'IRON DEPOSIT','#c9b2a2');
  else if(selected&&d.visible[selected]&&api.stoneDeposit(selected))badge(selected,'STONE DEPOSIT','#d7d0bc');
 }
 root.LSCIso221={project:project,unproject:unproject,diamond:diamond,fit:fit,clamp:clamp,paint:paint,roadPlan:roadPlan};
})(typeof window!=='undefined'?window:globalThis);
