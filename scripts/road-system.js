#!/usr/bin/env node
// LSC Build 242 FIXED — self-contained against the normal Build 232 output.
// Does not require Build 241 to have already modified src/isometricMap221.js.
const fs=require('fs');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');

const loader="if(typeof Image!=='undefined')Object.keys(roadLayout).forEach(function(name){var im=new Image();im.onload=function(){roadMasks[name]=prepareRoad(name,im);revision++;};im.src='assets/roads/'+roadLayout[name].file;roadArt[name]=im;});";
if(!r.includes(loader)) throw Error('Build 242 baseline missing: road asset loader');
const loader242=loader+`
 var roadPack242={},bridgeArt242={};
 if(typeof Image!=='undefined'){
  [3,5,6,7,9,10,11,12,13,14,15].forEach(function(mask){
   var im=new Image();im.onload=function(){revision++;};im.src='assets/roads/sbs-dry/mask-'+mask+'.png';roadPack242[mask]=im;
  });
  var bridge=new Image();bridge.onload=function(){revision++;};bridge.src='assets/bridges/bridge-l1-timber.png';bridgeArt242.l1=bridge;
 }`;
r=r.replace(loader,loader242);

const fnStart=r.indexOf("  function improvedRoad("),fnEnd=r.indexOf("  function badge(",fnStart);
if(fnStart<0||fnEnd<0) throw Error('Build 242 baseline missing: improvedRoad/badge anchors');

const funcs=`  function roadLevel(id){var levels=d.roadLevels||(d.roadLevels={});return Math.max(1,Math.min(3,levels[id]||1));}
  function improvedRoad(p,t,mask,tier){return;}

  function packRoad242(p,mask){
   var im=roadPack242[mask];if(!im||!im.complete||!im.naturalWidth)return false;
   g.save();diamond(g,p,s+.8);g.clip();g.drawImage(im,p.x-s/2,p.y-s/4,s,s/2);g.restore();return true;
  }

  function dirtConnection242(p,q,width){
   width=width||s*.15;
   g.save();g.lineCap='round';g.lineJoin='round';
   g.strokeStyle='#6f482c';g.lineWidth=width;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();
   g.strokeStyle='#8a5a34';g.lineWidth=width*.72;g.stroke();g.restore();
  }

  function roadEnd242(p,t,mask){
   var dirs={1:[1,0],2:[-1,0],4:[0,1],8:[0,-1]},a=dirs[mask];if(!a)return false;
   var q=project({x:t.x+a[0]*.54,y:t.y+a[1]*.54},c,v);
   var dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
   var w0=s*.15,w1=s*.025;
   g.save();g.fillStyle='#795033';g.beginPath();
   g.moveTo(p.x+nx*w0/2,p.y+ny*w0/2);g.lineTo(p.x-nx*w0/2,p.y-ny*w0/2);
   g.lineTo(q.x-nx*w1/2,q.y-ny*w1/2);g.lineTo(q.x+nx*w1/2,q.y+ny*w1/2);
   g.closePath();g.fill();g.restore();return true;
  }

  function settlementEntrance(t,p){
   var links=[[1,0],[-1,0],[0,1],[0,-1]].filter(function(a){return d.roads[(t.x+a[0])+','+(t.y+a[1])];});if(!links.length)return;
   var a=links[0],q=project({x:t.x+a[0]*.58,y:t.y+a[1]*.58},c,v);
   dirtConnection242(p,q,s*.15);
  }

  var BRIDGE_TILE_UNIT_LEN=s*1.18;
  var BRIDGE_NATIVE_TILE_SPAN=2;
  var BRIDGE_APPROACH_OVERLAP=.32;
  var BRIDGE_MAX_STRETCH_RATIO=2.2;

  function buildBridgeSpans242(orderedTiles){
   var idx={};orderedTiles.forEach(function(t){idx[t.id]=t;});
   var spans=[],seen={};
   Object.keys(d.roads||{}).forEach(function(id){
    if(seen[id])return;
    var t=idx[id];if(!t||t.terrain!=='water')return;
    [[1,0],[0,1]].forEach(function(dir){
     if(seen[id])return;
     var bx=t.x,by=t.y;
     while(true){var pid=(bx-dir[0])+','+(by-dir[1]),pt=idx[pid];if(d.roads[pid]&&pt&&pt.terrain==='water'){bx-=dir[0];by-=dir[1];}else break;}
     var bankAId=(bx-dir[0])+','+(by-dir[1]),bankA=idx[bankAId];
     if(!d.roads[bankAId]||!bankA||bankA.terrain==='water')return;
     var wx=bx,wy=by,water=[];
     while(true){var wid=wx+','+wy,wt=idx[wid];if(d.roads[wid]&&wt&&wt.terrain==='water'){water.push(wid);wx+=dir[0];wy+=dir[1];}else break;}
     if(!water.length)return;
     var bankBId=wx+','+wy,bankB=idx[bankBId];
     if(!d.roads[bankBId]||!bankB||bankB.terrain==='water')return;
     if(seen[water[0]])return;
     water.forEach(function(tid){seen[tid]=true;});
     spans.push({tiles:water,bankA:bankAId,bankB:bankBId});
    });
   });
   buildBridgeSpans242.cache=spans;
  }

  function renderBridgeSpans242(){
   var spans=buildBridgeSpans242.cache||[],im=bridgeArt242.l1;
   if(!im||!im.complete||!im.naturalWidth)return;
   spans.forEach(function(span){
    var pA=at(span.bankA),pB=at(span.bankB),p0=at(span.tiles[0]),p1=at(span.tiles[span.tiles.length-1]);
    if(!pA||!pB||!p0||!p1)return;
    var startX=pA.x+(p0.x-pA.x)*(1-BRIDGE_APPROACH_OVERLAP),startY=pA.y+(p0.y-pA.y)*(1-BRIDGE_APPROACH_OVERLAP);
    var endX=pB.x+(p1.x-pB.x)*(1-BRIDGE_APPROACH_OVERLAP),endY=pB.y+(p1.y-pB.y)*(1-BRIDGE_APPROACH_OVERLAP);
    var dx=endX-startX,dy=endY-startY,len=Math.hypot(dx,dy)||1;
    var tileEquiv=span.tiles.length+BRIDGE_APPROACH_OVERLAP*2,stretchRatio=tileEquiv/BRIDGE_NATIVE_TILE_SPAN;
    var midX=(startX+endX)/2,midY=(startY+endY)/2,ang=Math.atan2(dy,dx);
    g.save();g.translate(midX,midY-s*.055);g.rotate(ang);
    if(stretchRatio<=BRIDGE_MAX_STRETCH_RATIO){
     var w=len,h=w*(im.naturalHeight/im.naturalWidth);g.drawImage(im,-w/2,-h*.64,w,h);
    }else{
     var segW=BRIDGE_TILE_UNIT_LEN*BRIDGE_NATIVE_TILE_SPAN,segH=segW*(im.naturalHeight/im.naturalWidth);
     var count=Math.max(1,Math.ceil(len/(segW*.94))),step=len/count;
     for(var i=0;i<count;i++){var cx=-len/2+step*(i+.5);g.drawImage(im,cx-segW/2,-segH*.64,segW,segH);}
    }
    g.restore();
   });
  }
`;
r=r.slice(0,fnStart)+funcs+r.slice(fnEnd);

const paint232="if(!roadPiece(p,mask,t.terrain==='water')){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}improvedRoad(p,t,mask,tier);";
const paint242="if(t.terrain==='water'){if(!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if((mask===1||mask===2||mask===4||mask===8)?!roadEnd242(p,t,mask):!packRoad242(p,mask)){if(!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}";
if(!r.includes(paint232)) throw Error('Build 242 baseline missing: Build 232 road paint');
r=r.replace(paint232,paint242);

const settle232="ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});";
if(!r.includes(settle232)) throw Error('Build 242 baseline missing: Build 232 settlement pass');
r=r.replace(settle232,"buildBridgeSpans242(ordered);\nordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});\nrenderBridgeSpans242();");

r=r.replace("g.fillStyle='#030808';g.fillRect(0,0,v.w,v.h);","g.fillStyle='#414846';g.fillRect(0,0,v.w,v.h);");
fs.writeFileSync(P,r,'utf8');
console.log('Road system 242 FIXED: self-contained from Build 232 output; L1 roads + single-span timber bridges.');
