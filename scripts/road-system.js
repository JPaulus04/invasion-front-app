#!/usr/bin/env node
const fs=require('fs');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');
const a=r.indexOf("  function improvedRoad("),b=r.indexOf("  function badge(",a);
if(a<0||b<0)throw Error('Road system baseline missing');

const funcs=`  function roadLevel(id){var levels=d.roadLevels||(d.roadLevels={});return Math.max(1,Math.min(3,levels[id]||1));}
  function improvedRoad(p,t,mask,tier){return;}
  function settlementEntrance(t,p){
   var links=[[1,0],[-1,0],[0,1],[0,-1]].filter(function(a){return d.roads[(t.x+a[0])+','+(t.y+a[1])];});if(!links.length)return;
   var a=links[0],q=project({x:t.x+a[0]*.58,y:t.y+a[1]*.58},c,v);
   g.save();diamond(g,p,s);g.clip();g.lineCap='butt';g.strokeStyle='#795637';g.lineWidth=s*.13;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();g.strokeStyle='#bf925b';g.lineWidth=s*.09;g.stroke();g.restore();
  }
  function bridge238(p,t,mask){
   var h=(mask&1)&&(mask&2),v2=(mask&4)&&(mask&8);if(!h&&!v2)return false;
   var z=h?[[1,0],[-1,0]]:[[0,1],[0,-1]];
   var A=project({x:t.x+z[0][0]*.58,y:t.y+z[0][1]*.58},c,v),B=project({x:t.x+z[1][0]*.58,y:t.y+z[1][1]*.58},c,v);
   var dx=B.x-A.x,dy=B.y-A.y,L=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux,w=s*.12,rise=s*.075;
   function C(f){var arch=Math.sin(Math.PI*f)*rise;return{x:A.x+dx*f,y:A.y+dy*f-arch};}
   function edge(f,side){var q=C(f);return{x:q.x+nx*w*.55*side,y:q.y+ny*w*.55*side};}
   g.save();g.lineJoin='round';g.lineCap='round';
   // dark structural underside follows the crown, making the bridge read as raised above water
   g.strokeStyle='#553823';g.lineWidth=w*1.38;g.beginPath();for(var i=0;i<=12;i++){var q=C(i/12);g[i?'lineTo':'moveTo'](q.x,q.y);}g.stroke();
   // wooden deck
   g.strokeStyle='#b47c43';g.lineWidth=w;g.beginPath();for(var j=0;j<=12;j++){var q2=C(j/12);g[j?'lineTo':'moveTo'](q2.x,q2.y);}g.stroke();
   // plank joints wrap across the deck
   g.strokeStyle='#6c472b';g.lineWidth=Math.max(1,s*.011);
   for(var f=.08;f<1;f+=.10){var e1=edge(f,1),e2=edge(f,-1);g.beginPath();g.moveTo(e1.x,e1.y);g.lineTo(e2.x,e2.y);g.stroke();}
   // raised side rails; posts rise vertically on screen so the structure does not look twisted
   [-1,1].forEach(function(side){
    g.strokeStyle='#4e3422';g.lineWidth=Math.max(1.5,s*.018);g.beginPath();
    for(var k=0;k<=12;k++){var e=edge(k/12,side);e.y-=s*.045;g[k?'lineTo':'moveTo'](e.x,e.y);}g.stroke();
    [.12,.32,.52,.72,.92].forEach(function(f){var e=edge(f,side);g.beginPath();g.moveTo(e.x,e.y+s*.018);g.lineTo(e.x,e.y-s*.07);g.stroke();});
   });
   // abutments visually lock both ends into the banks
   [0,1].forEach(function(f){var e1=edge(f,1),e2=edge(f,-1);g.strokeStyle='#80664a';g.lineWidth=Math.max(2,s*.035);g.beginPath();g.moveTo(e1.x,e1.y);g.lineTo(e2.x,e2.y);g.stroke();});
   g.restore();return true;
  }
`;
r=r.slice(0,a)+funcs+r.slice(b);

const paints=[
 "if(t.terrain==='water'){if(!bridge237(p,t,mask)&&!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if(!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}",
 "if(t.terrain==='water'){if(!bridge238(p,t,mask)&&!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if(!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}"
];
if(r.includes(paints[0]))r=r.replace(paints[0],paints[1]);
else if(!r.includes("bridge238(p,t,mask)"))throw Error('Build 238 paint baseline missing');

r=r.replace("g.fillStyle='#030808';g.fillRect(0,0,v.w,v.h);","g.fillStyle='#414846';g.fillRect(0,0,v.w,v.h);");
fs.writeFileSync(P,r,'utf8');
console.log('Road system 238: crowned wooden bridge with rails and bank abutments.');
