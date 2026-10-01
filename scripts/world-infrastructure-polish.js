#!/usr/bin/env node
/**
 * Last Stand Command — world infrastructure polish
 * Build 247 target.
 *
 * IMPORTANT:
 * This does NOT restore or re-enable any legacy road/bridge art.
 * It modifies the current Build 246 renderer in place:
 *  - dead-end roads become constant-width dirt strips with square/butt ends
 *  - bridge becomes one narrow procedural timber deck, bank edge to bank edge
 *  - quarry art remains the current authored quarry family but renders lower/flatter
 *  - forest direction remains unchanged
 *  - static map cache is reduced slightly to improve pan/zoom performance
 */
const fs=require('fs');
const cp=require('child_process');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');

function between(start,end,label,replacement){
  const a=r.indexOf(start),b=r.indexOf(end,a);
  if(a<0||b<0)throw Error('Build 247 baseline missing: '+label);
  r=r.slice(0,a)+replacement+r.slice(b);
}
function swap(oldValue,newValue,label){
  if(r.includes(newValue))return;
  if(!r.includes(oldValue))throw Error('Build 247 baseline missing: '+label);
  r=r.replace(oldValue,newValue);
}

// 1) SIMPLE ROAD ENDS.
// A one-connection tile is a full-width straight dirt strip across the tile.
// No taper, arrowhead, circle, bulb, or rounded cap.
const roadEnd247=`  function roadEnd242(p,t,mask){
   // Use the SAME authored SBS straight tile as the connecting road.
   // Preserve full-tile square ends without the untextured brown rectangle.
   packRoad242(p,(mask===4||mask===8)?12:3);return true;
  }

`;
between("  function roadEnd242(p,t,mask){","  function settlementEntrance", "roadEnd242", roadEnd247);

// Settlement/HQ approach uses the same simple geometry: no circular-looking round caps.
const dirt247=`  function dirtConnection242(p,q,width){
   width=width||s*.15;
   g.save();g.lineCap='butt';g.lineJoin='miter';
   g.strokeStyle='#6f482c';g.lineWidth=width;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();
   g.strokeStyle='#8a5a34';g.lineWidth=width*.72;g.stroke();g.restore();
  }

`;
between("  function dirtConnection242(p,q,width){","  function roadEnd242", "dirtConnection242", dirt247);

// 2) BRIDGE RESET.
// No bridge sprite, no old asset, no detached rails.
// One narrow procedural timber deck from the first bank edge to the second bank edge.
const bridge247=`  function renderBridgeSpans242(){
   var spans=buildBridgeSpans242.cache||[];
   spans.forEach(function(span){
    if(!span.tiles||!span.tiles.length||span.tiles.length>8)return;
    var pA=at(span.bankA),pB=at(span.bankB),p0=at(span.tiles[0]),p1=at(span.tiles[span.tiles.length-1]);
    if(!pA||!pB||!p0||!p1)return;

    // Exact bank boundaries: midpoint between land-bank tile center and water tile center.
    var start={x:(pA.x+p0.x)*.5,y:(pA.y+p0.y)*.5};
    var end={x:(pB.x+p1.x)*.5,y:(pB.y+p1.y)*.5};
    var dx=end.x-start.x,dy=end.y-start.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    var half=s*.075;

    g.save();g.lineCap='butt';g.lineJoin='miter';

    // Narrow dark timber edge, approximately the same visual width as the dirt road.
    g.strokeStyle='#51351f';g.lineWidth=s*.185;
    g.beginPath();g.moveTo(start.x,start.y);g.lineTo(end.x,end.y);g.stroke();

    // Main deck.
    g.strokeStyle='#a9743f';g.lineWidth=s*.145;
    g.stroke();

    // Subtle center highlight keeps the deck readable without adding rails or oversized pieces.
    g.strokeStyle='#bd874c';g.lineWidth=s*.105;
    g.stroke();

    // Plank seams stay inside the bridge footprint.
    var steps=Math.max(3,Math.round(len/(s*.18)));
    g.strokeStyle='#68452a';g.lineWidth=Math.max(1,s*.010);
    for(var i=1;i<steps;i++){
      var f=i/steps,cx=start.x+dx*f,cy=start.y+dy*f;
      g.beginPath();
      g.moveTo(cx+nx*half,cy+ny*half);
      g.lineTo(cx-nx*half,cy-ny*half);
      g.stroke();
    }
    g.restore();
   });
  }

`;
between("  function renderBridgeSpans242(){","  function badge(", "renderBridgeSpans242", bridge247);

// 3) LOWER-PROFILE QUARRIES.
// Keep the current stone-quarry L1/L2/L3 art. Do not fall back to quarry.png/mine.png.
// Add an independent height multiplier so quarry silhouette can be flattened without replacing art.
swap(
  "function standalone(p,name,mult){var im=buildingArt[name],layout=buildingLayout[name]||{scale:.7,anchorX:.5,groundY:.14};if(!im||(!im.naturalWidth&&!im.width))return false;var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=s*layout.scale*(mult||1),h=w*ih/iw;g.drawImage(im,p.x-w*layout.anchorX,p.y+s*layout.groundY-h,w,h);return true;}",
  "function standalone(p,name,mult,heightMult){var im=buildingArt[name],layout=buildingLayout[name]||{scale:.7,anchorX:.5,groundY:.14};if(!im||(!im.naturalWidth&&!im.width))return false;var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=s*layout.scale*(mult||1),h=w*ih/iw*(heightMult||1);g.drawImage(im,p.x-w*layout.anchorX,p.y+s*layout.groundY-h,w,h);return true;}",
  "standalone height multiplier"
);

swap(
  "if(b&&b.kind==='quarry'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'stoneQuarry'+artTier243,(Math.abs(t.x)+Math.abs(t.y)<=1)?.76:1);g.restore();}",
  "if(b&&b.kind==='quarry'){g.save();if(!colored)g.globalAlpha=.58;var nearHQ247=Math.abs(t.x)+Math.abs(t.y)<=1;standalone(p,'stoneQuarry'+artTier243,nearHQ247?.64:.78,nearHQ247?.55:.62);g.restore();}",
  "lower quarry profile"
);

// 4) PERFORMANCE.
// Preserve the Build 245/246 forest composition. Reduce only offscreen-cache pixel density.
swap(
  "var real=g,off=cache.isoCanvas,r=Math.min(1.5,root.devicePixelRatio||1);",
  "var real=g,off=cache.isoCanvas,r=Math.min(1.25,root.devicePixelRatio||1);",
  "map cache performance"
);

fs.writeFileSync(P,r,'utf8');

// Validate the ACTUAL generated map source after all Build 247 edits.
cp.execFileSync(process.execPath,['--check',P],{stdio:'inherit'});

// Guardrails: fail the CI build if an older road/bridge implementation accidentally becomes active again.
const out=fs.readFileSync(P,'utf8');
if(!out.includes("g.lineCap='butt';g.lineJoin='miter';"))throw Error('Build 247 road simplification guard failed.');
if(out.includes("g.lineTo(q.x-nx*w1/2"))throw Error('Build 247 tapered arrow road end is still active.');
if(!out.includes("Exact bank boundaries"))throw Error('Build 247 bridge reset guard failed.');
if(!out.includes("'stoneQuarry'+artTier243"))throw Error('Build 247 current quarry art route missing.');

console.log('Build 247 infrastructure polish ready: straight road ends, narrow bank-to-bank bridge, flatter current quarries, lighter map cache.');
