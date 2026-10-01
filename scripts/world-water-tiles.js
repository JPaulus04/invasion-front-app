#!/usr/bin/env node
/**
 * Last Stand Command — water / bridge tile system
 * Build 249: preserve both road axes at water turns/junctions.
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
   var mask=0;
   if(d.roads[t.id]){
    [[1,0,1],[-1,0,2],[0,1,4],[0,-1,8]].forEach(function(a){
     var id=(t.x+a[0])+','+(t.y+a[1]),next=tiles[id];
     if(d.roads[id]||next&&(id==='0,0'||next.town))mask|=a[2];
    });
    if(!mask)mask=3;
   }
   function ready(name){var im=terrainTiles248[name];return im&&im.complete&&im.naturalWidth;}
   function draw(name){g.drawImage(terrainTiles248[name],p.x-s/2,p.y-s/4,s,s/2);}
   var name=!mask?'water':!(mask&12)?'bridgeB':!(mask&3)?'bridgeA':null;
   if(name&&!ready(name))return false;
   if(!name&&(!ready('water')||!ready('bridgeA')||!ready('bridgeB')))return false;
   g.save();diamond(g,p,s+.8);g.clip();
   if(name)draw(name);
   else{
    // Each connected edge owns one triangular quarter of the complete tile.
    // This keeps a straight crossing intact when a branch is added and connects
    // corners/T/X layouts without rotated or stretched bridge objects.
    draw('water');
    [[1,'bridgeB',.5,0,0,.25],[2,'bridgeB',-.5,0,0,-.25],
     [4,'bridgeA',0,.25,-.5,0],[8,'bridgeA',0,-.25,.5,0]].forEach(function(a){
      if(!(mask&a[0]))return;
      g.save();g.beginPath();g.moveTo(p.x,p.y);
      g.lineTo(p.x+a[2]*s,p.y+a[3]*s);g.lineTo(p.x+a[4]*s,p.y+a[5]*s);
      g.closePath();g.clip();draw(a[1]);g.restore();
    });
   }
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
if(!out.includes("water-bridge-a.png"))throw Error('Build 248 Bridge A loader missing.');
if(!out.includes("water-bridge-b.png"))throw Error('Build 248 Bridge B loader missing.');
if(!out.includes("function waterTile248"))throw Error('Build 248 water tile renderer missing.');
if(out.includes("Exact bank boundaries"))throw Error('Build 247 procedural bridge renderer survived Build 248.');
if(out.includes("renderBridgeSpans242();"))throw Error('Procedural bridge call is still active.');

console.log('Water tiles ready: authored Bridge A/B with connected turns and junctions; procedural bridge renderer disabled.');
