#!/usr/bin/env node
const fs=require('fs');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');

const loader="if(typeof Image!=='undefined')Object.keys(roadLayout).forEach(function(name){var im=new Image();im.onload=function(){roadMasks[name]=prepareRoad(name,im);revision++;};im.src='assets/roads/'+roadLayout[name].file;roadArt[name]=im;});";
if(!r.includes(loader))throw Error('Build 240 road loader baseline missing');

const addLoader=loader+`
 var roadPack240={};
 if(typeof Image!=='undefined'){
  [3,5,6,7,9,10,11,12,13,14,15].forEach(function(mask){
   var im=new Image();im.onload=function(){revision++;};im.src='assets/roads/sbs-dry/mask-'+mask+'.png';roadPack240[mask]=im;
  });
 }`;
r=r.replace(loader,addLoader);

const a=r.indexOf("  function improvedRoad("),b=r.indexOf("  function badge(",a);
if(a<0||b<0)throw Error('Build 240 road function baseline missing');

const funcs=`  function roadLevel(id){var levels=d.roadLevels||(d.roadLevels={});return Math.max(1,Math.min(3,levels[id]||1));}
  function packRoad240(p,mask){
   var im=roadPack240[mask];if(!im||!im.complete||!im.naturalWidth)return false;
   g.save();diamond(g,p,s+.8);g.clip();g.drawImage(im,p.x-s/2,p.y-s/4,s,s/2);g.restore();return true;
  }
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
   var dx=B.x-A.x,dy=B.y-A.y,L=Math.sqrt(dx*dx+dy*dy)||1,uy=dy/L,nx=-uy,ny=dx/L,w=s*.12,rise=s*.075;
   function C(f){var arch=Math.sin(Math.PI*f)*rise;return{x:A.x+dx*f,y:A.y+dy*f-arch};}
   function edge(f,side){var q=C(f);return{x:q.x+nx*w*.55*side,y:q.y+ny*w*.55*side};}
   g.save();g.lineJoin='round';g.lineCap='round';g.strokeStyle='#553823';g.lineWidth=w*1.38;g.beginPath();
   for(var i=0;i<=12;i++){var q=C(i/12);g[i?'lineTo':'moveTo'](q.x,q.y);}g.stroke();
   g.strokeStyle='#b47c43';g.lineWidth=w;g.beginPath();for(var j=0;j<=12;j++){var q2=C(j/12);g[j?'lineTo':'moveTo'](q2.x,q2.y);}g.stroke();
   g.strokeStyle='#6c472b';g.lineWidth=Math.max(1,s*.011);for(var f=.08;f<1;f+=.10){var e1=edge(f,1),e2=edge(f,-1);g.beginPath();g.moveTo(e1.x,e1.y);g.lineTo(e2.x,e2.y);g.stroke();}
   [-1,1].forEach(function(side){g.strokeStyle='#4e3422';g.lineWidth=Math.max(1.5,s*.018);g.beginPath();for(var k=0;k<=12;k++){var e=edge(k/12,side);e.y-=s*.045;g[k?'lineTo':'moveTo'](e.x,e.y);}g.stroke();});
   g.restore();return true;
  }
`;
r=r.slice(0,a)+funcs+r.slice(b);

const variants=[
"if(!roadPiece(p,mask,t.terrain==='water')){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}improvedRoad(p,t,mask,tier);",
"if(t.terrain==='water'){if(!bridge238(p,t,mask)&&!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if(!packRoad239(p,mask)&&!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}",
"if(t.terrain==='water'){if(!bridge238(p,t,mask)&&!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if(!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}"
];
const paint="if(t.terrain==='water'){if(!bridge238(p,t,mask)&&!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if(!packRoad240(p,mask)&&!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}";
let changed=false;
variants.forEach(function(x){if(r.includes(x)){r=r.replace(x,paint);changed=true;}});
if(!changed&&!r.includes("packRoad240(p,mask)"))throw Error('Build 240 road paint baseline missing');

const oldTown="ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;var p=at(t.id);[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a){var id=(t.x+a[0])+','+(t.y+a[1]);if(!d.roads[id])return;var q=at(id);if(!q)return;g.save();diamond(g,p,s);g.clip();g.lineCap='round';g.strokeStyle='#8d673e';g.lineWidth=s*.16;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+(q.x-p.x)*.55,p.y+(q.y-p.y)*.55);g.stroke();g.strokeStyle='#d2a667';g.lineWidth=s*.11;g.stroke();g.restore();});});";
if(r.includes(oldTown))r=r.replace(oldTown,"ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});");
r=r.replace("g.fillStyle='#030808';g.fillRect(0,0,v.w,v.h);","g.fillStyle='#414846';g.fillRect(0,0,v.w,v.h);");

fs.writeFileSync(P,r,'utf8');
console.log('Road system 240: SBS Dry authored road sprites integrated.');
