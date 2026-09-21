#!/usr/bin/env node
const fs=require('fs');
function read(p){return fs.readFileSync(p,'utf8')}
function write(p,s){fs.writeFileSync(p,s,'utf8')}
function need(s,x,label){if(!s.includes(x))throw Error('Build 232 baseline missing: '+label)}

let c=read('src/config.js');
if(c.includes("const LSC_BUILD = '231';")) c=c.replace("const LSC_BUILD = '231';","const LSC_BUILD = '232';");
else need(c,"const LSC_BUILD = '232';",'config 231/232');
c=c.replace(/Build 231/g,'Build 232');
write('src/config.js',c);

let r=read('src/isometricMap221.js');

// Road System 2.0: curved visual hierarchy.
const start=r.indexOf("  function improvedRoad("), end=r.indexOf("  function badge(",start);
if(start<0||end<0)throw Error('Build 232 baseline missing: improvedRoad');
const road=`  function improvedRoad(p,t,mask,tier){
   if(t.terrain==='water')return;
   var links=[[1,0,1],[-1,0,2],[0,1,4],[0,-1,8]].filter(function(a){return mask&a[2];});
   if(!links.length)return;
   var nearTown=[[1,0],[-1,0],[0,1],[0,-1]].some(function(a){var q=tiles[(t.x+a[0])+','+(t.y+a[1])];return q&&(q.town||q.id==='0,0');});
   var b=d.buildings[t.id],spur=b&&['workshop','quarry','ironMine','harbor','tower'].indexOf(b.kind)>=0;
   var outer=nearTown?s*.17:spur?s*.095:s*.135,inner=nearTown?s*.112:spur?s*.058:s*.086;
   g.save();g.lineCap='round';g.lineJoin='round';
   links.forEach(function(a,i){var q=project({x:t.x+a[0]*.5,y:t.y+a[1]*.5},c,v),mx=(p.x+q.x)/2,my=(p.y+q.y)/2,dx=q.x-p.x,dy=q.y-p.y,len=Math.sqrt(dx*dx+dy*dy)||1,w=((Math.abs(t.x*19+t.y*23+i*11)%5)-2)*s*.018;mx+=-dy/len*w;my+=dx/len*w;g.beginPath();g.moveTo(p.x,p.y);g.quadraticCurveTo(mx,my,q.x,q.y);g.strokeStyle=nearTown?'#765638':spur?'#9c7951':'#8d673e';g.lineWidth=outer;g.stroke();g.strokeStyle=nearTown?'#d0aa72':spur?'#c8a77a':'#d7b77d';g.lineWidth=inner;g.stroke();});
   g.restore();
  }
  function settlementEntrance(t,p){
   var o=[[1,0],[-1,0],[0,1],[0,-1]].map(function(a){return {a:a,id:(t.x+a[0])+','+(t.y+a[1])};}).find(function(o){return d.roads[o.id];});if(!o)return;
   var a=o.a,start=project({x:t.x+a[0]*.18,y:t.y+a[1]*.18},c,v),finish=project({x:t.x+a[0]*.50,y:t.y+a[1]*.50},c,v);
   g.save();g.lineCap='round';g.strokeStyle='#805e3f';g.lineWidth=s*.11;g.beginPath();g.moveTo(start.x,start.y);g.lineTo(finish.x,finish.y);g.stroke();g.strokeStyle='#d2ad78';g.lineWidth=s*.07;g.stroke();g.restore();
  }
`;
r=r.slice(0,start)+road+r.slice(end);

const oldTownRoad="ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;var p=at(t.id);[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a){var id=(t.x+a[0])+','+(t.y+a[1]);if(!d.roads[id])return;var q=at(id);if(!q)return;g.save();diamond(g,p,s);g.clip();g.lineCap='round';g.strokeStyle='#8d673e';g.lineWidth=s*.16;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+(q.x-p.x)*.55,p.y+(q.y-p.y)*.55);g.stroke();g.strokeStyle='#d2a667';g.lineWidth=s*.11;g.stroke();g.restore();});});";
if(r.includes(oldTownRoad))r=r.replace(oldTownRoad,"ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});");
else if(!r.includes("settlementEntrance(t,at(t.id))"))throw Error('Build 232 baseline missing: town entrance');

// Normalize the approved asset hierarchy from 231.
r=r.replace("workshop:{scale:.74,anchorX:.50","workshop:{scale:.70,anchorX:.50")
 .replace("quarry:{scale:.76,anchorX:.50","quarry:{scale:.67,anchorX:.50")
 .replace("mine:{scale:.76,anchorX:.50","mine:{scale:.67,anchorX:.50")
 .replace("fishingBoat:{scale:.50,anchorX:.50","fishingBoat:{scale:.42,anchorX:.50")
 .replace("scout1:{scale:.50,anchorX:.50","scout1:{scale:.45,anchorX:.50")
 .replace("scout2:{scale:.52,anchorX:.50","scout2:{scale:.48,anchorX:.50")
 .replace("scout3:{scale:.54,anchorX:.50","scout3:{scale:.51,anchorX:.50")
 .replace("dock1:{scale:.82,anchorX:.50","dock1:{scale:.70,anchorX:.50")
 .replace("dock2:{scale:.86,anchorX:.50","dock2:{scale:.75,anchorX:.50")
 .replace("dock3:{scale:.90,anchorX:.50","dock3:{scale:.80,anchorX:.50")
 .replace("town1:{scale:.90,anchorX:.50","town1:{scale:.86,anchorX:.50")
 .replace("town2:{scale:.96,anchorX:.50","town2:{scale:.93,anchorX:.50")
 .replace("town3:{scale:1.02,anchorX:.50","town3:{scale:1.00,anchorX:.50")
 .replace(/woodlandVillage:\{scale:\.88/g,"woodlandVillage:{scale:.78")
 .replace(/farmlandVillage:\{scale:\.88/g,"farmlandVillage:{scale:.78")
 .replace(/industrialVillage:\{scale:\.88/g,"industrialVillage:{scale:.78")
 .replace(/highlandVillage:\{scale:\.88/g,"highlandVillage:{scale:.78")
 .replace(/waterVillage:\{scale:\.88/g,"waterVillage:{scale:.78")
 .replace(/harborTown:\{scale:\.92/g,"harborTown:{scale:.84");

write('src/isometricMap221.js',r);

let b=read('build.js');
b=b.replace(/Build 231/g,'Build 232').replace(/LSC_BUILD = '231'/g,"LSC_BUILD = '232'").replace(/Last Stand Command 231/g,'Last Stand Command 232');
write('build.js',b);
console.log('Last Stand Command Build 232 Road System 2.0 ready.');
