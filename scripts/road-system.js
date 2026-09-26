#!/usr/bin/env node
// LSC Build 242 — road-system.js
// Scope: bridge span detection/placement, bridge<->road approach transitions,
// endpoint taper fix, settlement-entrance width fix.
// Does NOT touch src/isometricMap221.js by hand — this script patches it,
// same convention as build 241. No new art direction, no L2/L3, no economy.

const fs = require('fs');
const P = 'src/isometricMap221.js';
let r = fs.readFileSync(P, 'utf8');

// ---------------------------------------------------------------------
// 1. Baseline check: build 241 must already be applied.
// ---------------------------------------------------------------------
const need241 = ['bridge241(', 'packRoad241(', 'roadEnd241(', 'settlementEntrance('];
need241.forEach(function (tok) {
  if (!r.includes(tok)) throw Error('Build 242 requires Build 241 baseline — missing: ' + tok);
});

// ---------------------------------------------------------------------
// 2. Replace the function block (improvedRoad ... just before badge)
//    with the 242 versions: bridge span cache/render, tapered endpoints,
//    wider settlement connector.
// ---------------------------------------------------------------------
const fnStart = r.indexOf(' function improvedRoad(');
const fnEnd = r.indexOf(' function badge(', fnStart);
if (fnStart < 0 || fnEnd < 0) throw Error('Build 242 function-block anchors not found');

const funcs241Region = r.slice(fnStart, fnEnd);
['bridge241', 'packRoad241', 'roadEnd241'].forEach(function (tok) {
  if (!funcs241Region.includes(tok)) throw Error('Build 242: 241 baseline not found inside function block (' + tok + ')');
});

const funcs242 = ` function roadLevel(id){var levels=d.roadLevels||(d.roadLevels={});return Math.max(1,Math.min(3,levels[id]||1));}
function improvedRoad(p,t,mask,tier){return;}

function packRoad242(p,mask){
var im=roadPack241[mask];if(!im||!im.complete||!im.naturalWidth)return false;
g.save();diamond(g,p,s+.8);g.clip();g.drawImage(im,p.x-s/2,p.y-s/4,s,s/2);g.restore();return true;
}

function dirtConnection242(p,q,width){
width=width||s*.62;
g.save();g.lineCap='round';g.lineJoin='round';
g.strokeStyle='#7d5943';g.lineWidth=width;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();
g.strokeStyle='#8f6f52';g.lineWidth=width*.62;g.stroke();
g.restore();
}

function roadEnd242(p,t,mask){
var dirs={1:[1,0],2:[-1,0],4:[0,1],8:[0,-1]},a=dirs[mask];if(!a)return false;
var q=project({x:t.x+a[0]*.66,y:t.y+a[1]*.66},c,v);
var dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
var w0=s*.60,w1=s*.05;
g.save();
g.fillStyle='#7d5943';
g.beginPath();
g.moveTo(p.x+nx*w0/2,p.y+ny*w0/2);
g.lineTo(p.x-nx*w0/2,p.y-ny*w0/2);
g.lineTo(q.x-nx*w1/2,q.y-ny*w1/2);
g.lineTo(q.x+nx*w1/2,q.y+ny*w1/2);
g.closePath();g.fill();
g.globalAlpha=.55;g.fillStyle='#8f6f52';
g.beginPath();
g.moveTo(p.x+nx*w0*.34,p.y+ny*w0*.34);
g.lineTo(p.x-nx*w0*.34,p.y-ny*w0*.34);
g.lineTo(q.x-nx*w1*.34,q.y-ny*w1*.34);
g.lineTo(q.x+nx*w1*.34,q.y+ny*w1*.34);
g.closePath();g.fill();
g.restore();
return true;
}

function settlementEntrance(t,p){
var links=[[1,0],[-1,0],[0,1],[0,-1]].filter(function(a){return d.roads[(t.x+a[0])+','+(t.y+a[1])];});if(!links.length)return;
var a=links[0],q=project({x:t.x+a[0]*.62,y:t.y+a[1]*.62},c,v);
dirtConnection242(p,q,s*.62);
}

// --- Bridge span system -------------------------------------------------
// Tunable constants (safe to adjust without touching logic below):
var BRIDGE_TILE_UNIT_LEN=s*1.18;      // screen length representing one tile-equivalent, matches 241's single-tile scale
var BRIDGE_NATIVE_TILE_SPAN=2;        // measured: bridge-l1-timber.png is authored ~2 tile-widths long
var BRIDGE_APPROACH_OVERLAP=.32;      // how far the deck overlaps onto each bank tile, in tile-equivalents
var BRIDGE_MAX_STRETCH_RATIO=2.2;     // beyond this multiple of native span, switch to repeat mode instead of one giant stretched sprite

function buildBridgeSpans242(orderedTiles){
var idx={};orderedTiles.forEach(function(t){idx[t.id]=t;});
var byTile={},spans=[],seen={};
Object.keys(d.roads||{}).forEach(function(id){
if(seen[id])return;
var t=idx[id];if(!t||t.terrain!=='water')return;
[[1,0],[0,1]].forEach(function(dir){
if(seen[id])return;
var bx=t.x,by=t.y;
while(true){
var pid=(bx-dir[0])+','+(by-dir[1]),pt=idx[pid];
if(d.roads[pid]&&pt&&pt.terrain==='water'){bx-=dir[0];by-=dir[1];}else break;
}
var bankAId=(bx-dir[0])+','+(by-dir[1]),bankA=idx[bankAId];
if(!d.roads[bankAId]||!bankA||bankA.terrain==='water')return;
var wx=bx,wy=by,tiles=[];
while(true){
var wid=wx+','+wy,wt=idx[wid];
if(d.roads[wid]&&wt&&wt.terrain==='water'){tiles.push(wid);wx+=dir[0];wy+=dir[1];}else break;
}
if(!tiles.length)return;
var bankBId=wx+','+wy,bankB=idx[bankBId];
if(!d.roads[bankBId]||!bankB||bankB.terrain==='water')return;
if(seen[tiles[0]])return;
tiles.forEach(function(tid){seen[tid]=true;});
var span={tiles:tiles,bankA:bankAId,bankB:bankBId,dir:dir[0]?'ew':'ns'};
spans.push(span);
tiles.forEach(function(tid){byTile[tid]=span;});
});
});
buildBridgeSpans242.cache={byTile:byTile,spans:spans};
}

function renderBridgeSpans242(){
var cache=buildBridgeSpans242.cache;if(!cache)return;
var im=bridgeArt241.l1;if(!im||!im.complete||!im.naturalWidth)return;
cache.spans.forEach(function(span){
var pA=at(span.bankA),pB=at(span.bankB),p0=at(span.tiles[0]),p1=at(span.tiles[span.tiles.length-1]);
if(!pA||!pB||!p0||!p1)return;
var startX=pA.x+(p0.x-pA.x)*(1-BRIDGE_APPROACH_OVERLAP),startY=pA.y+(p0.y-pA.y)*(1-BRIDGE_APPROACH_OVERLAP);
var endX=pB.x+(p1.x-pB.x)*(1-BRIDGE_APPROACH_OVERLAP),endY=pB.y+(p1.y-pB.y)*(1-BRIDGE_APPROACH_OVERLAP);
var dx=endX-startX,dy=endY-startY,len=Math.hypot(dx,dy)||1;
var tileEquiv=span.tiles.length+BRIDGE_APPROACH_OVERLAP*2;
var stretchRatio=tileEquiv/BRIDGE_NATIVE_TILE_SPAN;
var midX=(startX+endX)/2,midY=(startY+endY)/2,ang=Math.atan2(dy,dx);
g.save();
g.translate(midX,midY-s*.055);
g.rotate(ang);
if(stretchRatio<=BRIDGE_MAX_STRETCH_RATIO){
var w=len,h=w*(im.naturalHeight/im.naturalWidth);
g.drawImage(im,-w/2,-h*.64,w,h);
}else{
var segW=BRIDGE_TILE_UNIT_LEN*BRIDGE_NATIVE_TILE_SPAN,segH=segW*(im.naturalHeight/im.naturalWidth);
var count=Math.max(1,Math.ceil(len/(segW*.94)));
var step=len/count;
for(var i=0;i<count;i++){
var cx=-len/2+step*(i+.5);
g.drawImage(im,cx-segW/2,-segH*.64,segW,segH);
}
}
g.restore();
});
}

function bridge242(){return false;}

`;

r = r.slice(0, fnStart) + funcs242 + r.slice(fnEnd);

// ---------------------------------------------------------------------
// 3. Replace the per-tile paint string (241 -> 242 function names).
//    bridge242 always returns false, so water tiles fall back to the
//    existing generic road-piece/sprite path during the main loop;
//    the actual bridge deck is drawn once, on top, by renderBridgeSpans242().
// ---------------------------------------------------------------------
const paint241 = "if(t.terrain==='water'){if(!bridge241(p,t,mask)&&!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if((mask===1||mask===2||mask===4||mask===8)?!roadEnd241(p,t,mask):!packRoad241(p,mask)){if(!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}";
const paint242 = "if(t.terrain==='water'){if(!bridge242(p,t,mask)&&!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if((mask===1||mask===2||mask===4||mask===8)?!roadEnd242(p,t,mask):!packRoad242(p,mask)){if(!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}";

if (!r.includes(paint241)) throw Error('Build 242 paint-string baseline (241) not found — cannot safely patch');
r = r.replace(paint241, paint242);

// ---------------------------------------------------------------------
// 4. Replace the settlement-connector pass to also build + render
//    the bridge span system, once per frame.
// ---------------------------------------------------------------------
const settle241 = "ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});";
const settle242 = "buildBridgeSpans242(ordered);\nordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});\nrenderBridgeSpans242();";

if (!r.includes(settle241)) throw Error('Build 242 settlement-pass baseline (241) not found — cannot safely patch');
r = r.replace(settle241, settle242);

fs.writeFileSync(P, r, 'utf8');
console.log('Road system 242: single-span bridges + bank approach blending + tapered endpoints + wider settlement connectors.');
