#!/usr/bin/env node
const fs=require('fs');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');

const a=r.indexOf("  function improvedRoad(");
const b=r.indexOf("  function badge(",a);
if(a<0||b<0)throw Error('Build 237 road baseline missing');

const funcs=`  function roadLevel(id){var levels=d.roadLevels||(d.roadLevels={});return Math.max(1,Math.min(3,levels[id]||1));}
  function improvedRoad(p,t,mask,tier){return;}
  function settlementEntrance(t,p){
   var links=[[1,0],[-1,0],[0,1],[0,-1]].filter(function(a){return d.roads[(t.x+a[0])+','+(t.y+a[1])];});
   if(!links.length)return;
   var a=links[0],q=project({x:t.x+a[0]*.58,y:t.y+a[1]*.58},c,v);
   g.save();diamond(g,p,s);g.clip();g.lineCap='butt';g.lineJoin='miter';
   g.strokeStyle='#795637';g.lineWidth=s*.13;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();
   g.strokeStyle='#bf925b';g.lineWidth=s*.09;g.stroke();g.restore();
  }
  function bridge237(p,t,mask){
   var horiz=(mask&1)&&(mask&2),vert=(mask&4)&&(mask&8);
   if(!horiz&&!vert)return false;
   var pair=horiz?[[1,0],[-1,0]]:[[0,1],[0,-1]];
   var A=project({x:t.x+pair[0][0]*.56,y:t.y+pair[0][1]*.56},c,v);
   var B=project({x:t.x+pair[1][0]*.56,y:t.y+pair[1][1]*.56},c,v);
   var dx=B.x-A.x,dy=B.y-A.y,L=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/L,ny=dx/L,w=s*.105;
   g.save();g.lineCap='butt';
   g.strokeStyle='#6f4a2d';g.lineWidth=w*1.22;g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B.x,B.y);g.stroke();
   g.strokeStyle='#b9854d';g.lineWidth=w;g.stroke();
   g.strokeStyle='#6d4a2f';g.lineWidth=Math.max(1,s*.012);
   for(var i=.08;i<1;i+=.11){var x=A.x+dx*i,y=A.y+dy*i;g.beginPath();g.moveTo(x+nx*w*.5,y+ny*w*.5);g.lineTo(x-nx*w*.5,y-ny*w*.5);g.stroke();}
   g.restore();return true;
  }
`;
r=r.slice(0,a)+funcs+r.slice(b);

const candidates=[
 "if(!roadPiece(p,mask,t.terrain==='water')){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}improvedRoad(p,t,mask,tier);",
 "if(!roadPiece(p,mask,t.terrain==='water')){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}",
 "if(t.terrain==='water'){proceduralBridge(p,t,mask);}else improvedRoad(p,t,mask,tier);",
 "if(t.terrain==='water'){if(!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else improvedRoad(p,t,mask,tier);"
];
const paint="if(t.terrain==='water'){if(!bridge237(p,t,mask)&&!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if(!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}";
let replaced=false;
candidates.forEach(function(x){if(r.includes(x)){r=r.replace(x,paint);replaced=true;}});
if(!replaced&&!r.includes("bridge237(p,t,mask)"))throw Error('Build 237 road paint baseline missing');

const oldTown="ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;var p=at(t.id);[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a){var id=(t.x+a[0])+','+(t.y+a[1]);if(!d.roads[id])return;var q=at(id);if(!q)return;g.save();diamond(g,p,s);g.clip();g.lineCap='round';g.strokeStyle='#8d673e';g.lineWidth=s*.16;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+(q.x-p.x)*.55,p.y+(q.y-p.y)*.55);g.stroke();g.strokeStyle='#d2a667';g.lineWidth=s*.11;g.stroke();g.restore();});});";
if(r.includes(oldTown))r=r.replace(oldTown,"ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});");

r=r.replace("g.fillStyle='#030808';g.fillRect(0,0,v.w,v.h);","g.fillStyle='#414846';g.fillRect(0,0,v.w,v.h);");

fs.writeFileSync(P,r,'utf8');
console.log('Build 237 road system applied.');
