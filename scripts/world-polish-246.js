#!/usr/bin/env node
/**
 * Last Stand Command — Build 246
 * Performance + world hierarchy + bridge reset.
 */
const fs=require('fs');
const cp=require('child_process');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');

function need(s,label){if(!r.includes(s))throw Error('Build 246 baseline missing: '+label);}
function swap(a,b,label){if(r.includes(b))return;need(a,label);r=r.replace(a,b);}

// Landmark / production hierarchy.
[
 ["scout1:{scale:.45,anchorX:.50","scout1:{scale:.68,anchorX:.50"],
 ["scout2:{scale:.48,anchorX:.50","scout2:{scale:.73,anchorX:.50"],
 ["scout3:{scale:.51,anchorX:.50","scout3:{scale:.78,anchorX:.50"],
 ["townHall1:{scale:.86,anchorX:.50","townHall1:{scale:1.10,anchorX:.50"],
 ["townHall2:{scale:.93,anchorX:.50","townHall2:{scale:1.18,anchorX:.50"],
 ["townHall3:{scale:1.00,anchorX:.50","townHall3:{scale:1.26,anchorX:.50"],
 ["stoneQuarry1:{scale:.67,anchorX:.50","stoneQuarry1:{scale:.62,anchorX:.50"],
 ["stoneQuarry2:{scale:.71,anchorX:.50","stoneQuarry2:{scale:.66,anchorX:.50"],
 ["stoneQuarry3:{scale:.75,anchorX:.50","stoneQuarry3:{scale:.70,anchorX:.50"],
 ["ironMine1:{scale:.67,anchorX:.50","ironMine1:{scale:.62,anchorX:.50"],
 ["ironMine2:{scale:.71,anchorX:.50","ironMine2:{scale:.66,anchorX:.50"],
 ["ironMine3:{scale:.75,anchorX:.50","ironMine3:{scale:.70,anchorX:.50"]
].forEach(function(x){swap(x[0],x[1],x[0]);});

const oldStandalone="function standalone(p,name){var im=buildingArt[name],layout=buildingLayout[name]||{scale:.7,anchorX:.5,groundY:.14};if(!im||(!im.naturalWidth&&!im.width))return false;var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=s*layout.scale,h=w*ih/iw;g.drawImage(im,p.x-w*layout.anchorX,p.y+s*layout.groundY-h,w,h);return true;}";
const newStandalone="function standalone(p,name,mult){var im=buildingArt[name],layout=buildingLayout[name]||{scale:.7,anchorX:.5,groundY:.14};if(!im||(!im.naturalWidth&&!im.width))return false;var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=s*layout.scale*(mult||1),h=w*ih/iw;g.drawImage(im,p.x-w*layout.anchorX,p.y+s*layout.groundY-h,w,h);return true;}";
swap(oldStandalone,newStandalone,'standalone scale multiplier');

// The modern art-preview renderer routes quarry/ironMine through its own
// sprite-aware branch. Preserve that branch rather than demanding the legacy
// standalone quarry hook; only adjust old-style hooks when present.
[
 ['quarry','stoneQuarry'],
 ['ironMine','ironMine']
].forEach(function(entry){
 const kind=entry[0],art=entry[1];
 const old="if(b&&b.kind==='"+kind+"'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'"+art+"'+artTier243);g.restore();}";
 const next="if(b&&b.kind==='"+kind+"'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'"+art+"'+artTier243,(Math.abs(t.x)+Math.abs(t.y)<=1)?.76:1);g.restore();}";
 if(r.includes(old))swap(old,next,kind+' HQ clearance');
 else if(!r.includes(next)&&!r.includes("b.kind==='"+kind+"'"))
  throw Error('Build 246 missing '+kind+' renderer');
});

// Keep Build 245 forest geography, but reduce large sprite draws dramatically.
const oldForest=`function forest243(p,t){
   if(!forestRegion244(t))return false;
   var h=Math.abs(t.x*47+t.y*71),edge=0;
   [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a){if(!forestRegion244({x:t.x+a[0],y:t.y+a[1]}))edge++;});
   var dense=edge===0,count=dense?3:(edge===1?2:1),drawn=false;
   var offsets=[[0,0],[-.23,.055],[.24,.045],[.02,-.09]];
   for(var i=0;i<count;i++){
    var name='forest'+(1+Math.abs(h+i*5)%3),sc=(dense?.62:.55)+(Math.abs(h+i*13)%5)*.018;
    drawn=forestSprite244(p,t,name,sc,offsets[i][0],offsets[i][1])||drawn;
   }
   if(dense&&h%5===0)forestSprite244(p,t,'forestDetail',.34,.17,.10);
   return drawn;
  }`;
const newForest=`function forest243(p,t){
   if(!forestRegion244(t))return false;
   var h=Math.abs(t.x*47+t.y*71),edge=0;
   [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a){if(!forestRegion244({x:t.x+a[0],y:t.y+a[1]}))edge++;});
   var dense=edge===0,name='forest'+(1+h%3);
   var sc=dense?.82:(edge===1?.72:.62);
   var ox=((h%5)-2)*.018,oy=((Math.floor(h/5)%3)-1)*.014;
   var drawn=forestSprite244(p,t,name,sc,ox,oy);
   if(dense&&h%9===0)forestSprite244(p,t,'forestDetail',.28,.18,.08);
   return drawn;
  }`;
swap(oldForest,newForest,'optimized regional forest');

swap(
 "var real=g,off=cache.isoCanvas,r=Math.min(2,root.devicePixelRatio||1);",
 "var real=g,off=cache.isoCanvas,r=Math.min(1.5,root.devicePixelRatio||1);",
 'map cache resolution cap'
);

// Replace the rotated authored bridge with one connected timber corridor.
// This removes the floating/oversized bridge path entirely.
const bridgeStart=r.indexOf("  function renderBridgeSpans242(){");
const bridgeEnd=r.indexOf("  function badge(",bridgeStart);
if(bridgeStart<0||bridgeEnd<0)throw Error('Build 246 baseline missing: bridge renderer');
const bridge246=`  function renderBridgeSpans242(){
   var spans=buildBridgeSpans242.cache||[];
   spans.forEach(function(span){
    if(!span.tiles||!span.tiles.length||span.tiles.length>8)return;
    var pA=at(span.bankA),pB=at(span.bankB),p0=at(span.tiles[0]),p1=at(span.tiles[span.tiles.length-1]);
    if(!pA||!pB||!p0||!p1)return;
    var start={x:pA.x+(p0.x-pA.x)*.58,y:pA.y+(p0.y-pA.y)*.58};
    var end={x:pB.x+(p1.x-pB.x)*.58,y:pB.y+(p1.y-pB.y)*.58};
    var dx=end.x-start.x,dy=end.y-start.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    var half=s*.105,rail=s*.145;
    g.save();g.lineCap='butt';g.lineJoin='round';

    g.strokeStyle='#493321';g.lineWidth=s*.27;
    g.beginPath();g.moveTo(start.x,start.y+s*.035);g.lineTo(end.x,end.y+s*.035);g.stroke();

    g.strokeStyle='#a8733f';g.lineWidth=s*.205;
    g.beginPath();g.moveTo(start.x,start.y);g.lineTo(end.x,end.y);g.stroke();
    g.strokeStyle='#c28b4f';g.lineWidth=s*.155;g.stroke();

    var steps=Math.max(4,Math.round(len/(s*.14)));
    g.strokeStyle='#704a2c';g.lineWidth=Math.max(1,s*.012);
    for(var i=1;i<steps;i++){
     var f=i/steps,cx=start.x+dx*f,cy=start.y+dy*f;
     g.beginPath();g.moveTo(cx+nx*half,cy+ny*half);g.lineTo(cx-nx*half,cy-ny*half);g.stroke();
    }

    g.strokeStyle='#5c3b22';g.lineWidth=Math.max(2,s*.035);
    [-1,1].forEach(function(side){
     g.beginPath();g.moveTo(start.x+nx*rail*side,start.y+ny*rail*side-s*.035);
     g.lineTo(end.x+nx*rail*side,end.y+ny*rail*side-s*.035);g.stroke();
    });
    g.restore();
   });
  }
`;
r=r.slice(0,bridgeStart)+bridge246+r.slice(bridgeEnd);

fs.writeFileSync(P,r,'utf8');
cp.execFileSync(process.execPath,['--check',P],{stdio:'inherit'});
console.log('Build 246 ready: forest performance, landmark hierarchy, HQ clearance and bridge reset.');
