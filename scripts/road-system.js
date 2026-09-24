#!/usr/bin/env node
const fs=require('fs');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');
const a=r.indexOf("  function improvedRoad("), b=r.indexOf("  function badge(",a);
if(a<0||b<0)throw Error('Road system baseline missing');
const funcs=`  function roadLevel(id){var levels=d.roadLevels||(d.roadLevels={});return Math.max(1,Math.min(3,levels[id]||1));}\n  function improvedRoad(p,t,mask,tier){return;}\n  function settlementEntrance(t,p){\n   var links=[[1,0],[-1,0],[0,1],[0,-1]].filter(function(a){return d.roads[(t.x+a[0])+','+(t.y+a[1])];});if(!links.length)return;\n   var a=links[0],q=project({x:t.x+a[0]*.54,y:t.y+a[1]*.54},c,v);\n   g.save();diamond(g,p,s);g.clip();g.lineCap='butt';g.lineJoin='miter';\n   g.strokeStyle='#795637';g.lineWidth=s*.13;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();\n   g.strokeStyle='#bf925b';g.lineWidth=s*.09;g.stroke();g.restore();\n  }\n`;
r=r.slice(0,a)+funcs+r.slice(b);
const patterns=[
 "if(t.terrain==='water'){proceduralBridge(p,t,mask);}else improvedRoad(p,t,mask,tier);",
 "if(t.terrain==='water'){if(!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else improvedRoad(p,t,mask,tier);",
 "if(!roadPiece(p,mask,t.terrain==='water')){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}improvedRoad(p,t,mask,tier);"
];
const nativeRoad="if(!roadPiece(p,mask,t.terrain==='water')){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}";
let changed=false;patterns.forEach(function(x){if(r.includes(x)){r=r.replace(x,nativeRoad);changed=true;}});
if(!changed&&!r.includes(nativeRoad))throw Error('Road paint baseline missing');
const oldTown="ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;var p=at(t.id);[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a){var id=(t.x+a[0])+','+(t.y+a[1]);if(!d.roads[id])return;var q=at(id);if(!q)return;g.save();diamond(g,p,s);g.clip();g.lineCap='round';g.strokeStyle='#8d673e';g.lineWidth=s*.16;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+(q.x-p.x)*.55,p.y+(q.y-p.y)*.55);g.stroke();g.strokeStyle='#d2a667';g.lineWidth=s*.11;g.stroke();g.restore();});});";
if(r.includes(oldTown))r=r.replace(oldTown,"ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});");
fs.writeFileSync(P,r,'utf8');
console.log('Road system 236: native isometric tiles restored; 235 capsule renderer removed.');
