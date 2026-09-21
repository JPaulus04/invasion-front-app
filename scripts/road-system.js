#!/usr/bin/env node
const fs=require('fs');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');

function replaceRange(startMark,endMark,replacement,label){
 const a=r.indexOf(startMark), b=r.indexOf(endMark,a);
 if(a<0||b<0)throw Error('Road system baseline missing: '+label);
 r=r.slice(0,a)+replacement+r.slice(b);
}

// Seamless road surface: each logical road tile renders continuously through its edges.
// Individual road level is read from settlement roadLevels when available; default = 1.
const funcs=`  function roadLevel(id){var levels=d.roadLevels||(d.roadLevels={});return Math.max(1,Math.min(3,levels[id]||1));}
  function roadPalette(level){return level>=3?{edge:'#68665f',fill:'#bcb7a6'}:level===2?{edge:'#8b704d',fill:'#c7a774'}:{edge:'#765638',fill:'#c79b62'};}
  function improvedRoad(p,t,mask,tier){
   if(t.terrain==='water')return;
   var level=roadLevel(t.id),pal=roadPalette(level),links=[[1,0,1],[-1,0,2],[0,1,4],[0,-1,8]].filter(function(a){return mask&a[2];});
   if(!links.length)return;
   var edge=level>=3?s*.17:level===2?s*.15:s*.135,fill=level>=3?s*.125:level===2?s*.105:s*.09;
   g.save();g.lineCap='butt';g.lineJoin='round';
   links.forEach(function(a){var q=project({x:t.x+a[0]*.52,y:t.y+a[1]*.52},c,v);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.strokeStyle=pal.edge;g.lineWidth=edge;g.stroke();g.strokeStyle=pal.fill;g.lineWidth=fill;g.stroke();});
   g.fillStyle=pal.fill;g.beginPath();g.arc(p.x,p.y,fill*.52,0,Math.PI*2);g.fill();g.restore();
  }
  function settlementEntrance(t,p){
   var links=[[1,0],[-1,0],[0,1],[0,-1]].filter(function(a){return d.roads[(t.x+a[0])+','+(t.y+a[1])];});if(!links.length)return;
   var a=links[0],id=(t.x+a[0])+','+(t.y+a[1]),level=roadLevel(id),pal=roadPalette(level),finish=project({x:t.x+a[0]*.52,y:t.y+a[1]*.52},c,v);
   g.save();g.lineCap='butt';g.strokeStyle=pal.edge;g.lineWidth=level>=3?s*.17:level===2?s*.15:s*.135;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(finish.x,finish.y);g.stroke();g.strokeStyle=pal.fill;g.lineWidth=level>=3?s*.125:level===2?s*.105:s*.09;g.stroke();g.restore();
  }
`;
replaceRange("  function improvedRoad(","  function badge(",funcs+"  function badge(","road renderer");

// Avoid drawing old textured pieces underneath the new continuous road surface.
const old="if(!roadPiece(p,mask,t.terrain==='water')){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}improvedRoad(p,t,mask,tier);";
if(r.includes(old))r=r.replace(old,"if(t.terrain==='water'){if(!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else improvedRoad(p,t,mask,tier);");
else if(!r.includes("else improvedRoad(p,t,mask,tier)")) throw Error('Road system baseline missing: road paint');

// One clean settlement entrance instead of drawing all adjacent connection stubs.
const oldTown="ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;var p=at(t.id);[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a){var id=(t.x+a[0])+','+(t.y+a[1]);if(!d.roads[id])return;var q=at(id);if(!q)return;g.save();diamond(g,p,s);g.clip();g.lineCap='round';g.strokeStyle='#8d673e';g.lineWidth=s*.16;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+(q.x-p.x)*.55,p.y+(q.y-p.y)*.55);g.stroke();g.strokeStyle='#d2a667';g.lineWidth=s*.11;g.stroke();g.restore();});});";
if(r.includes(oldTown))r=r.replace(oldTown,"ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});");

fs.writeFileSync(P,r,'utf8');
console.log('Road system updated: seamless continuous roads + per-segment level foundation.');
