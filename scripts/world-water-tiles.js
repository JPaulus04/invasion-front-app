#!/usr/bin/env node
/**
 * Last Stand Command — water / bridge tile system
 * Build 248 target.
 *
 * Replaces runtime bridge construction with complete authored terrain tiles:
 *   water-tile.png
 *   water-bridge-a.png
 *   water-bridge-b.png
 *
 * The existing Build 247 road system remains intact on land.
 * The old procedural bridge renderer is disabled, not exposed underneath.
 */
const fs=require('fs');
const cp=require('child_process');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');

function need(s,label){if(!r.includes(s))throw Error('Build 248 baseline missing: '+label);}
function once(s,label){
  const n=r.split(s).length-1;
  if(n!==1)throw Error('Build 248 expected one '+label+', found '+n);
}

// Load the three complete terrain tiles. These PNGs already have transparency;
// no runtime magenta keying and no bridge scaling/rotation are used.
const projectAnchor=" function project(t,c,v){";
need(projectAnchor,'project anchor');
const tileLoader=` var terrainTiles248={};
 if(typeof Image!=='undefined'){
  [['water','water-tile.png'],['bridgeA','water-bridge-a.png'],['bridgeB','water-bridge-b.png']].forEach(function(a){
   var im=new Image();im.onload=function(){terrainTiles248[a[0]]=im;revision++;};
   im.src='assets/terrain/'+a[1];terrainTiles248[a[0]]=im;
  });
 }
`;
r=r.replace(projectAnchor,tileLoader+projectAnchor);

// Tile renderer lives inside paint() so it uses the current camera, tile size,
// settlement road data and canvas context without introducing another system.
const badgeAnchor="  function badge(";
need(badgeAnchor,'badge anchor');
const tileRenderer=`  function waterTile248(p,t){
   var name='water';
   if(d.roads[t.id]){
    var mask=0;
    [[1,0,1],[-1,0,2],[0,1,4],[0,-1,8]].forEach(function(a){
     var id=(t.x+a[0])+','+(t.y+a[1]),next=tiles[id];
     if(d.roads[id]||next&&(id==='0,0'||next.town))mask|=a[2];
    });
    var xAxis=mask&3,yAxis=mask&12;
    // Map x-axis projects upper-left <-> lower-right: mirrored authored tile (B).
    // Map y-axis projects lower-left <-> upper-right: approved authored tile (A).
    if(yAxis&&!xAxis)name='bridgeA';
    else if(xAxis&&!yAxis)name='bridgeB';
    else if(yAxis&&xAxis){
     // Water junctions are not intended; prefer the axis that actually continues
     // through another water-road tile rather than inventing T/cross bridge art.
     var yContinue=[[0,1],[0,-1]].some(function(a){var q=tiles[(t.x+a[0])+','+(t.y+a[1])];return q&&q.terrain==='water'&&d.roads[q.id];});
     name=yContinue?'bridgeA':'bridgeB';
    }else name='bridgeB';
   }
   var im=terrainTiles248[name];
   if(!im||!im.complete||!im.naturalWidth)return false;
   g.save();diamond(g,p,s+.8);g.clip();
   g.drawImage(im,p.x-s/2,p.y-s/4,s,s/2);
   g.restore();return true;
  }

`;
r=r.replace(badgeAnchor,tileRenderer+badgeAnchor);

// Draw the complete water/bridge tile after the legacy water base.
// The legacy blue water remains only as a sub-pixel fallback beneath transparent
// tile edges; no bridge object is layered on top.
const roadPaintAnchor="if(d.roads[t.id]&&t.id!=='0,0'&&!t.town){";
once(roadPaintAnchor,'road paint anchor');
r=r.replace(roadPaintAnchor,"if(t.terrain==='water')waterTile248(p,t);\n    "+roadPaintAnchor);

// Remove the old span calculation and procedural bridge draw from runtime.
once("buildBridgeSpans242(ordered);",'bridge span call');
r=r.replace("buildBridgeSpans242(ordered);","/* Build 248: complete bridge-water tiles need no span calculation. */");
once("renderBridgeSpans242();",'procedural bridge call');
r=r.replace("renderBridgeSpans242();","/* Build 248: procedural bridge renderer disabled. */");

// Remove the procedural renderer body as an additional guard against accidental reuse.
const bs=r.indexOf("  function renderBridgeSpans242(){");
const be=r.indexOf("  function waterTile248(",bs);
if(bs<0||be<0)throw Error('Build 248 could not isolate old bridge renderer.');
r=r.slice(0,bs)+"  function renderBridgeSpans242(){/* Build 248 disabled: bridge is terrain art. */}\n\n"+r.slice(be);

fs.writeFileSync(P,r,'utf8');
cp.execFileSync(process.execPath,['--check',P],{stdio:'inherit'});

const out=fs.readFileSync(P,'utf8');
if(!out.includes("assets/terrain/water-bridge-a.png"))throw Error('Build 248 Bridge A loader missing.');
if(!out.includes("assets/terrain/water-bridge-b.png"))throw Error('Build 248 Bridge B loader missing.');
if(!out.includes("function waterTile248"))throw Error('Build 248 water tile renderer missing.');
if(out.includes("Exact bank boundaries"))throw Error('Build 247 procedural bridge renderer survived Build 248.');
if(out.includes("renderBridgeSpans242();"))throw Error('Procedural bridge call is still active.');

console.log('Build 248 ready: complete water tiles + authored Bridge A/B; procedural bridge renderer removed.');
