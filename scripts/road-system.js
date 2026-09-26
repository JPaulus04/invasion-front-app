#!/usr/bin/env node
const fs=require('fs');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');

const loader="if(typeof Image!=='undefined')Object.keys(roadLayout).forEach(function(name){var im=new Image();im.onload=function(){roadMasks[name]=prepareRoad(name,im);revision++;};im.src='assets/roads/'+roadLayout[name].file;roadArt[name]=im;});";
if(!r.includes(loader))throw Error('Build 241 road loader baseline missing');

const addLoader=loader+`
 var roadPack241={},bridgeArt241={};
 if(typeof Image!=='undefined'){
  [3,5,6,7,9,10,11,12,13,14,15].forEach(function(mask){
   var im=new Image();im.onload=function(){revision++;};im.src='assets/roads/sbs-dry/mask-'+mask+'.png';roadPack241[mask]=im;
  });
  var bridge=new Image();bridge.onload=function(){revision++;};bridge.src='assets/bridges/bridge-l1-timber.png';bridgeArt241.l1=bridge;
 }`;
r=r.replace(loader,addLoader);

const a=r.indexOf("  function improvedRoad("),b=r.indexOf("  function badge(",a);
if(a<0||b<0)throw Error('Build 241 road function baseline missing');

const funcs=`  function roadLevel(id){var levels=d.roadLevels||(d.roadLevels={});return Math.max(1,Math.min(3,levels[id]||1));}
  function packRoad241(p,mask){
   var im=roadPack241[mask];if(!im||!im.complete||!im.naturalWidth)return false;
   g.save();diamond(g,p,s+.8);g.clip();g.drawImage(im,p.x-s/2,p.y-s/4,s,s/2);g.restore();return true;
  }
  function improvedRoad(p,t,mask,tier){return;}
  function dirtConnection241(p,q){
   g.save();g.lineCap='round';g.lineJoin='round';
   g.strokeStyle='#6f482c';g.lineWidth=s*.145;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();
   g.strokeStyle='#8a5a34';g.lineWidth=s*.105;g.stroke();g.restore();
  }
  function roadEnd241(p,t,mask){
   var dirs={1:[1,0],2:[-1,0],4:[0,1],8:[0,-1]},a=dirs[mask];if(!a)return false;
   var q=project({x:t.x+a[0]*.53,y:t.y+a[1]*.53},c,v);
   dirtConnection241(p,q);
   g.save();g.fillStyle='#7d5130';g.beginPath();g.arc(p.x,p.y,s*.052,0,Math.PI*2);g.fill();g.restore();return true;
  }
  function settlementEntrance(t,p){
   var links=[[1,0],[-1,0],[0,1],[0,-1]].filter(function(a){return d.roads[(t.x+a[0])+','+(t.y+a[1])];});if(!links.length)return;
   var a=links[0],q=project({x:t.x+a[0]*.60,y:t.y+a[1]*.60},c,v);dirtConnection241(p,q);
  }
  function bridge241(p,t,mask){
   var im=bridgeArt241.l1;if(!im||!im.complete||!im.naturalWidth)return false;
   var horizontal=(mask&1)&&(mask&2),vertical=(mask&4)&&(mask&8);if(!horizontal&&!vertical)return false;
   g.save();g.translate(p.x,p.y-s*.055);
   if(vertical)g.scale(-1,1);
   var w=s*1.18,h=w*.5;
   g.drawImage(im,-w/2,-h*.64,w,h);
   g.restore();return true;
  }
`;
r=r.slice(0,a)+funcs+r.slice(b);

const variants=[
"if(t.terrain==='water'){if(!bridge238(p,t,mask)&&!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if(!packRoad240(p,mask)&&!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}",
"if(!roadPiece(p,mask,t.terrain==='water')){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}improvedRoad(p,t,mask,tier);"
];
const paint="if(t.terrain==='water'){if(!bridge241(p,t,mask)&&!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if((mask===1||mask===2||mask===4||mask===8)?!roadEnd241(p,t,mask):!packRoad241(p,mask)){if(!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}";
let changed=false;variants.forEach(function(x){if(r.includes(x)){r=r.replace(x,paint);changed=true;}});
if(!changed&&!r.includes("bridge241(p,t,mask)"))throw Error('Build 241 road paint baseline missing');

const oldTown="ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;var p=at(t.id);[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a){var id=(t.x+a[0])+','+(t.y+a[1]);if(!d.roads[id])return;var q=at(id);if(!q)return;g.save();diamond(g,p,s);g.clip();g.lineCap='round';g.strokeStyle='#8d673e';g.lineWidth=s*.16;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+(q.x-p.x)*.55,p.y+(q.y-p.y)*.55);g.stroke();g.strokeStyle='#d2a667';g.lineWidth=s*.11;g.stroke();g.restore();});});";
if(r.includes(oldTown))r=r.replace(oldTown,"ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});");
r=r.replace("g.fillStyle='#030808';g.fillRect(0,0,v.w,v.h);","g.fillStyle='#414846';g.fillRect(0,0,v.w,v.h);");

fs.writeFileSync(P,r,'utf8');
console.log('Road system 241: cleaned SBS Dry roads + authored L1 timber bridge.');
