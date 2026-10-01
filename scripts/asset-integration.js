#!/usr/bin/env node
/**
 * Last Stand Command — Build 243 art integration.
 * Runs after Road System 242 and before set-build-version.js.
 *
 * Purpose:
 *  - wire the approved L1/L2/L3 settlement art into the current settlement renderer
 *  - remove the authored #FF00FF chroma background at load time
 *  - add the approved forest cluster/detail art without changing terrain simulation
 *  - keep future building families in assets/buildings/ until gameplay types exist
 */
const fs = require('fs');
const cp = require('child_process');
const path = require('path');


const required243 = [
  'farm-l1.png','farm-l2.png','farm-l3.png',
  'sawmill-l1.png','sawmill-l2.png','sawmill-l3.png',
  'homestead-l1.png','homestead-l2.png','homestead-l3.png',
  'stone-quarry-l1.png','stone-quarry-l2.png','stone-quarry-l3.png',
  'iron-mine-l1.png','iron-mine-l2.png','iron-mine-l3.png',
  'town-hall-l1.png','town-hall-l2.png','town-hall-l3.png',
  'scout-tower-l1.png','scout-tower-l2.png','scout-tower-l3.png',
  'dock-l1.png','dock-l2.png','dock-l3.png'
];
required243.forEach(function(file){
  if(!fs.existsSync(path.join('assets','buildings',file))) throw new Error('Build 243 asset missing: assets/buildings/'+file);
});
['forest-cluster-01.png','forest-cluster-02.png','forest-cluster-03.png','forest-details-01.png'].forEach(function(file){
  if(!fs.existsSync(path.join('assets','terrain',file))) throw new Error('Build 243 asset missing: assets/terrain/'+file);
});

const MAP = 'src/isometricMap221.js';
let r = fs.readFileSync(MAP, 'utf8');

function need(value, label) {
  if (!r.includes(value)) throw new Error('Build 243 baseline missing: ' + label);
}
function replaceOnce(oldValue, newValue, label) {
  if (r.includes(newValue)) return;
  need(oldValue, label);
  r = r.replace(oldValue, newValue);
}

// Add a dedicated terrain-art bucket. This leaves the underlying tile/terrain model untouched.
replaceOnce(
  "var revision=0,atlases={},buildingArt={},roadArt={},roadMasks={},buildingLayout={",
  "var revision=0,atlases={},buildingArt={},terrainArt={},roadArt={},roadMasks={},buildingLayout={",
  'art registries'
);

// Append layouts for the new authored building families. Existing 231/232 entries stay intact.
const layoutAnchor = "harborTown:{scale:.84,anchorX:.50,groundY:.18}\n }";
const layout243 = "harborTown:{scale:.84,anchorX:.50,groundY:.18},farm1:{scale:.70,anchorX:.50,groundY:.18},farm2:{scale:.74,anchorX:.50,groundY:.18},farm3:{scale:.78,anchorX:.50,groundY:.18},sawmill1:{scale:.69,anchorX:.50,groundY:.18},sawmill2:{scale:.73,anchorX:.50,groundY:.18},sawmill3:{scale:.78,anchorX:.50,groundY:.18},homestead1:{scale:.64,anchorX:.50,groundY:.18},homestead2:{scale:.68,anchorX:.50,groundY:.18},homestead3:{scale:.72,anchorX:.50,groundY:.18},stoneQuarry1:{scale:.67,anchorX:.50,groundY:.18},stoneQuarry2:{scale:.71,anchorX:.50,groundY:.18},stoneQuarry3:{scale:.75,anchorX:.50,groundY:.18},ironMine1:{scale:.67,anchorX:.50,groundY:.18},ironMine2:{scale:.71,anchorX:.50,groundY:.18},ironMine3:{scale:.75,anchorX:.50,groundY:.18},townHall1:{scale:.86,anchorX:.50,groundY:.18},townHall2:{scale:.93,anchorX:.50,groundY:.18},townHall3:{scale:1.00,anchorX:.50,groundY:.18}\n }";
replaceOnce(layoutAnchor, layout243, 'new building layouts');

// Chroma-key helper for the authored #FF00FF backgrounds.
const loaderAnchor = "if(typeof Image!=='undefined'){var priorityArt={workshop:'lumber-camp.png',quarry:'quarry.png',mine:'mine.png',forge:'forge.png',goldMine:'gold-mine.png',fishingBoat:'fishing-boat.png',scout1:'scout-tower-l1.png',scout2:'scout-tower-l2.png',scout3:'scout-tower-l3.png',dock1:'dock-l1.png',dock2:'dock-l2.png',dock3:'dock-l3.png',town1:'town-l1.png',town2:'town-l2.png',town3:'town-l3.png',woodlandVillage:'woodland-village.png',farmlandVillage:'farmland-village.png',industrialVillage:'industrial-village.png',highlandVillage:'highland-village.png',waterVillage:'water-village.png',harborTown:'harbor-town.png'};Object.keys(priorityArt).forEach(function(name){var im=new Image();im.onload=function(){revision++;};im.src='assets/buildings/'+priorityArt[name];buildingArt[name]=im;});}";
const loader243 = `function chroma243(im){
  if(typeof document==='undefined')return im;
  var cv=document.createElement('canvas'),cx,data,i,r0,g0,b0;
  cv.width=im.naturalWidth||im.width;cv.height=im.naturalHeight||im.height;
  cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(im,0,0);
  try{data=cx.getImageData(0,0,cv.width,cv.height);for(i=0;i<data.data.length;i+=4){r0=data.data[i];g0=data.data[i+1];b0=data.data[i+2];if(r0>205&&b0>205&&g0<105&&Math.abs(r0-b0)<65)data.data[i+3]=0;}cx.putImageData(data,0,0);}catch(e){return im;}
  return cv;
 }
 function loadBuilding243(name,file){var im=new Image();im.onload=function(){buildingArt[name]=chroma243(im);revision++;};im.src='assets/buildings/'+file;}
 function loadTerrain243(name,file){var im=new Image();im.onload=function(){
  var keyed=chroma243(im);
  // Keep the same cluster geometry; avoid resampling 1024px software canvases every draw.
  if(typeof document!=='undefined'&&keyed.width>256){
   var small=document.createElement('canvas');small.width=256;small.height=Math.max(1,Math.round(keyed.height*256/keyed.width));
   var pen=small.getContext('2d');pen.imageSmoothingEnabled=true;pen.imageSmoothingQuality='high';
   pen.drawImage(keyed,0,0,small.width,small.height);keyed=small;
  }
  terrainArt[name]=keyed;revision++;
 };im.src='assets/terrain/'+file;}
 if(typeof Image!=='undefined'){
  var priorityArt={workshop:'lumber-camp.png',quarry:'quarry.png',mine:'mine.png',forge:'forge.png',goldMine:'gold-mine.png',fishingBoat:'fishing-boat.png',scout1:'scout-tower-l1.png',scout2:'scout-tower-l2.png',scout3:'scout-tower-l3.png',dock1:'dock-l1.png',dock2:'dock-l2.png',dock3:'dock-l3.png',town1:'town-l1.png',town2:'town-l2.png',town3:'town-l3.png',woodlandVillage:'woodland-village.png',farmlandVillage:'farmland-village.png',industrialVillage:'industrial-village.png',highlandVillage:'highland-village.png',waterVillage:'water-village.png',harborTown:'harbor-town.png',farm1:'farm-l1.png',farm2:'farm-l2.png',farm3:'farm-l3.png',sawmill1:'sawmill-l1.png',sawmill2:'sawmill-l2.png',sawmill3:'sawmill-l3.png',homestead1:'homestead-l1.png',homestead2:'homestead-l2.png',homestead3:'homestead-l3.png',stoneQuarry1:'stone-quarry-l1.png',stoneQuarry2:'stone-quarry-l2.png',stoneQuarry3:'stone-quarry-l3.png',ironMine1:'iron-mine-l1.png',ironMine2:'iron-mine-l2.png',ironMine3:'iron-mine-l3.png',townHall1:'town-hall-l1.png',townHall2:'town-hall-l2.png',townHall3:'town-hall-l3.png'};
  Object.keys(priorityArt).forEach(function(name){loadBuilding243(name,priorityArt[name]);});
  loadTerrain243('forest1','forest-cluster-01.png');loadTerrain243('forest2','forest-cluster-02.png');loadTerrain243('forest3','forest-cluster-03.png');loadTerrain243('forestDetail','forest-details-01.png');
 }`;
replaceOnce(loaderAnchor, loader243, 'building/terrain asset loader');

// Canvas-backed chroma-key images use width/height rather than naturalWidth/naturalHeight.
replaceOnce(
  "if(!im||!im.complete||!im.naturalWidth)return false;var w=s*layout.scale,h=w*im.naturalHeight/im.naturalWidth;",
  "if(!im||(!im.naturalWidth&&!im.width))return false;var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=s*layout.scale,h=w*ih/iw;",
  'standalone canvas support'
);

// Render forest art as decoration only. It does not alter terrain, clearing, roads, or selection.
const standaloneEnd = "g.drawImage(im,p.x-w*layout.anchorX,p.y+s*layout.groundY-h,w,h);return true;}";
const standalonePlusForest = `g.drawImage(im,p.x-w*layout.anchorX,p.y+s*layout.groundY-h,w,h);return true;}
  function forest243(p,t){
   var pick=Math.abs(t.x*17+t.y*31)%7,name=pick===0?'forestDetail':'forest'+(1+Math.abs(t.x*13+t.y*19)%3),im=terrainArt[name];
   if(!im||(!im.naturalWidth&&!im.width))return false;
   var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=s*(name==='forestDetail'?.46:.58),h=w*ih/iw;
   g.drawImage(im,p.x-w*.5,p.y+s*.16-h,w,h);return true;
  }`;
replaceOnce(standaloneEnd, standalonePlusForest, 'forest renderer');

// Use the new authored family for the current gameplay building types.
const routeAnchor = "if(t.id==='0,0'){name=null;width=s*.88;}\n    else if(b){name=({farm:'farm',house:'house'}[b.kind]||null);width=s*.72;}";
const route243 = "if(t.id==='0,0'){name=null;width=s*.88;}\n    else if(b){name=null;width=s*.72;}";
replaceOnce(routeAnchor, route243, 'legacy building sprite route');

const hookAnchor = "if(t.id==='0,0'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'town'+Math.max(1,Math.min(3,api.villageLevel?api.villageLevel(m):1)));g.restore();}";
const hook243 = `var artTier243=Math.max(1,Math.min(3,api.villageLevel?api.villageLevel(m):1));
    if(t.id==='0,0'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'townHall'+artTier243);g.restore();}`;
replaceOnce(hookAnchor, hook243, 'HQ town hall route');

const workshopHook = "if(b&&b.kind==='workshop'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'workshop');g.restore();}\n    if(b&&b.kind==='quarry'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'quarry');g.restore();}\n    if(b&&b.kind==='ironMine'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'mine');g.restore();}";
const buildingHooks243 = "if(b&&b.kind==='farm'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'farm'+artTier243);g.restore();}\n    if(b&&b.kind==='house'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'homestead'+artTier243);g.restore();}\n    if(b&&b.kind==='workshop'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'sawmill'+artTier243);g.restore();}\n    if(b&&b.kind==='quarry'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'stoneQuarry'+artTier243);g.restore();}\n    if(b&&b.kind==='ironMine'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'ironMine'+artTier243);g.restore();}";
replaceOnce(workshopHook, buildingHooks243, 'current building family routes');

// Existing scout tower and dock already use L1-L3. Reuse the same art tier variable.
r = r.replace(/'scout'\+Math\.max\(1,Math\.min\(3,api\.villageLevel\?api\.villageLevel\(m\):1\)\)/g, "'scout'+artTier243");
r = r.replace(/'dock'\+Math\.max\(1,Math\.min\(3,api\.villageLevel\?api\.villageLevel\(m\):1\)\)/g, "'dock'+artTier243");

// Replace only decorative empty-plain trees with authored clusters.
const oldDecoration = "else if(!d.roads[t.id]){if(t.terrain==='hill'){name='mountain';width=s*.74;}else if(t.terrain==='plain'&&Math.abs(t.x*7+t.y*11)%4){name='tree';width=s*.48;}}";
const newDecoration = "else if(!d.roads[t.id]){if(t.terrain==='hill'){name='mountain';width=s*.74;}else if(t.terrain==='plain'&&Math.abs(t.x*7+t.y*11)%4){name=null;forest243(p,t);}}";
replaceOnce(oldDecoration, newDecoration, 'forest decoration route');

fs.writeFileSync(MAP, r, 'utf8');
// Validate the generated source itself. This catches generator-created syntax errors before bundling.
cp.execFileSync(process.execPath, ['--check', MAP], {stdio:'inherit'});
console.log('Build 243 art integration ready: authored settlement families + forest clusters + chroma cleanup. Generated map syntax verified.');
