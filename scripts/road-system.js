#!/usr/bin/env node
const fs=require('fs');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');
const a=r.indexOf("  function improvedRoad("), b=r.indexOf("  function badge(",a);
if(a<0||b<0)throw Error('Road system baseline missing');

const funcs=`  function roadLevel(id){var levels=d.roadLevels||(d.roadLevels={});return Math.max(1,Math.min(3,levels[id]||1));}
  function roadPalette(level){return level>=3?{edge:'#615f59',fill:'#b7b19e',mark:'#d2ccba'}:level===2?{edge:'#806747',fill:'#bd9866',mark:'#d8b783'}:{edge:'#765638',fill:'#b98a56',mark:'#d2a46d'};}
  function roadLinks(t,mask){return [[1,0,1],[-1,0,2],[0,1,4],[0,-1,8]].filter(function(a){return mask&a[2];});}
  function roadPoint(t,a,f){return project({x:t.x+a[0]*f,y:t.y+a[1]*f},c,v);}
  function roadStroke(p,q,pal,level,cap){
   var edge=level>=3?s*.17:level===2?s*.15:s*.135,fill=level>=3?s*.125:level===2?s*.105:s*.09;
   g.lineCap=cap||'butt';g.lineJoin='round';g.strokeStyle=pal.edge;g.lineWidth=edge;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();
   g.strokeStyle=pal.fill;g.lineWidth=fill;g.stroke();
  }
  function improvedRoad(p,t,mask,tier){
   if(t.terrain==='water')return;
   var level=roadLevel(t.id),pal=roadPalette(level),links=roadLinks(t,mask);if(!links.length)return;
   g.save();
   links.forEach(function(a){roadStroke(p,roadPoint(t,a,.54),pal,level,'round');});
   var fill=level>=3?s*.125:level===2?s*.105:s*.09;
   g.fillStyle=pal.fill;g.beginPath();g.arc(p.x,p.y,fill*.54,0,Math.PI*2);g.fill();
   g.restore();
  }
  function settlementEntrance(t,p){
   var links=[[1,0],[-1,0],[0,1],[0,-1]].filter(function(a){return d.roads[(t.x+a[0])+','+(t.y+a[1])];});if(!links.length)return;
   var a=links[0],id=(t.x+a[0])+','+(t.y+a[1]),level=roadLevel(id),pal=roadPalette(level);
   g.save();roadStroke(p,roadPoint(t,a,.56),pal,level,'round');g.restore();
  }
  function proceduralBridge(p,t,mask){
   var links=roadLinks(t,mask);if(links.length<2)return false;
   var horiz=(mask&1)&&(mask&2),vert=(mask&4)&&(mask&8);if(!horiz&&!vert)return false;
   var pair=horiz?[[1,0],[-1,0]]:[[0,1],[0,-1]],A=roadPoint(t,pair[0],.56),B=roadPoint(t,pair[1],.56);
   var dx=B.x-A.x,dy=B.y-A.y,L=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/L,ny=dx/L,w=s*.13;
   g.save();g.lineCap='butt';
   g.strokeStyle='#5b3c27';g.lineWidth=w*1.32;g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B.x,B.y);g.stroke();
   g.strokeStyle='#a87643';g.lineWidth=w;g.stroke();
   g.strokeStyle='rgba(55,35,22,.58)';g.lineWidth=Math.max(1,s*.012);
   for(var i=.08;i<1;i+=.12){var x=A.x+dx*i,y=A.y+dy*i;g.beginPath();g.moveTo(x+nx*w*.55,y+ny*w*.55);g.lineTo(x-nx*w*.55,y-ny*w*.55);g.stroke();}
   g.strokeStyle='#4b3325';g.lineWidth=Math.max(1,s*.018);
   [-.72,.72].forEach(function(side){g.beginPath();g.moveTo(A.x+nx*w*side,A.y+ny*w*side);g.lineTo(B.x+nx*w*side,B.y+ny*w*side);g.stroke();});
   [.18,.5,.82].forEach(function(i){var x=A.x+dx*i,y=A.y+dy*i;g.fillStyle='#493222';g.beginPath();g.arc(x+nx*w*.78,y+ny*w*.78,s*.025,0,Math.PI*2);g.arc(x-nx*w*.78,y-ny*w*.78,s*.025,0,Math.PI*2);g.fill();});
   g.restore();return true;
  }
`;
r=r.slice(0,a)+funcs+r.slice(b);

// Replace the 233 water-road behavior with the procedural bridge.
const current="if(t.terrain==='water'){if(!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else improvedRoad(p,t,mask,tier);";
const legacy="if(!roadPiece(p,mask,t.terrain==='water')){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}improvedRoad(p,t,mask,tier);";
if(r.includes(current))r=r.replace(current,"if(t.terrain==='water'){proceduralBridge(p,t,mask);}else improvedRoad(p,t,mask,tier);");
else if(r.includes(legacy))r=r.replace(legacy,"if(t.terrain==='water'){proceduralBridge(p,t,mask);}else improvedRoad(p,t,mask,tier);");
else if(!r.includes("proceduralBridge(p,t,mask)"))throw Error('Road paint baseline missing');

const oldTown="ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;var p=at(t.id);[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a){var id=(t.x+a[0])+','+(t.y+a[1]);if(!d.roads[id])return;var q=at(id);if(!q)return;g.save();diamond(g,p,s);g.clip();g.lineCap='round';g.strokeStyle='#8d673e';g.lineWidth=s*.16;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+(q.x-p.x)*.55,p.y+(q.y-p.y)*.55);g.stroke();g.strokeStyle='#d2a667';g.lineWidth=s*.11;g.stroke();g.restore();});});";
if(r.includes(oldTown))r=r.replace(oldTown,"ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});");

fs.writeFileSync(P,r,'utf8');
console.log('Road system 235: clean junctions/corners/endpoints + procedural bridges.');
