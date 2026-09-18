#!/usr/bin/env node
// Build 230 source preparation.
// Safe to run repeatedly: already-applied Build 230 changes are accepted.
const fs=require('fs');

function read(path){return fs.readFileSync(path,'utf8');}
function write(path,s){fs.writeFileSync(path,s,'utf8');}
function replaceOnce(s,oldText,newText,label){
  if(s.includes(newText)) return s;
  if(!s.includes(oldText)) throw Error('Build 230 baseline not found: '+label);
  return s.replace(oldText,newText);
}

// config.js: accept either 229 baseline or already-updated 230.
{
 let s=read('src/config.js');
 if(!s.includes("const LSC_BUILD = '230';")){
   if(!s.includes("const LSC_BUILD = '229';")) throw Error('Build 229/230 config baseline not found');
   s=s.replace("const LSC_BUILD = '229';","const LSC_BUILD = '230';");
   write('src/config.js',s);
 }
 console.log('Build 230 config ready');
}

// build.js: accept either 229 validation or already-updated 230.
{
 let s=read('build.js');
 if(!s.includes("html.includes(\"const LSC_BUILD = '230';\")") &&
    !s.includes("html.includes('const LSC_BUILD = \\'230\\';')") &&
    !s.includes("Build 230 config is not present")){
   s=s.replace("html.includes('const LSC_BUILD = \\'229\\';')","html.includes('const LSC_BUILD = \\'230\\';')")
      .replace('Build 229 config is not present','Build 230 config is not present');
   write('build.js',s);
 }
 console.log('Build 230 validator ready');
}

// Permanent Priority A renderer integration.
{
 let s=read('src/isometricMap221.js');

 const oldLayout=`buildingArt={},roadArt={},roadMasks={},buildingLayout={
  workshop:{scale:.74,anchorX:.42,groundY:.18}
 }`;
 const newLayout=`buildingArt={},roadArt={},roadMasks={},buildingLayout={
  workshop:{scale:.74,anchorX:.50,groundY:.18},quarry:{scale:.76,anchorX:.50,groundY:.18},mine:{scale:.76,anchorX:.50,groundY:.18},forge:{scale:.72,anchorX:.50,groundY:.18},goldMine:{scale:.76,anchorX:.50,groundY:.18},fishingBoat:{scale:.50,anchorX:.50,groundY:.14},scout1:{scale:.50,anchorX:.50,groundY:.18},scout2:{scale:.52,anchorX:.50,groundY:.18},scout3:{scale:.54,anchorX:.50,groundY:.18},dock1:{scale:.82,anchorX:.50,groundY:.18},dock2:{scale:.86,anchorX:.50,groundY:.18},dock3:{scale:.90,anchorX:.50,groundY:.18},town1:{scale:.90,anchorX:.50,groundY:.18},town2:{scale:.96,anchorX:.50,groundY:.18},town3:{scale:1.02,anchorX:.50,groundY:.18},woodlandVillage:{scale:.88,anchorX:.50,groundY:.18},farmlandVillage:{scale:.88,anchorX:.50,groundY:.18},industrialVillage:{scale:.88,anchorX:.50,groundY:.18},highlandVillage:{scale:.88,anchorX:.50,groundY:.18},waterVillage:{scale:.88,anchorX:.50,groundY:.18},harborTown:{scale:.92,anchorX:.50,groundY:.18}
 }`;
 s=replaceOnce(s,oldLayout,newLayout,'building layout');

 const oldLoader=`if(typeof Image!=='undefined'){var lumber=new Image();lumber.onload=function(){revision++;};lumber.src='assets/buildings/lumber-camp.png';buildingArt.workshop=lumber;}`;
 const newLoader=`if(typeof Image!=='undefined'){var priorityArt={workshop:'lumber-camp.png',quarry:'quarry.png',mine:'mine.png',forge:'forge.png',goldMine:'gold-mine.png',fishingBoat:'fishing-boat.png',scout1:'scout-tower-l1.png',scout2:'scout-tower-l2.png',scout3:'scout-tower-l3.png',dock1:'dock-l1.png',dock2:'dock-l2.png',dock3:'dock-l3.png',town1:'town-l1.png',town2:'town-l2.png',town3:'town-l3.png',woodlandVillage:'woodland-village.png',farmlandVillage:'farmland-village.png',industrialVillage:'industrial-village.png',highlandVillage:'highland-village.png',waterVillage:'water-village.png',harborTown:'harbor-town.png'};Object.keys(priorityArt).forEach(function(name){var im=new Image();im.onload=function(){revision++;};im.src='assets/buildings/'+priorityArt[name];buildingArt[name]=im;});}`;
 s=replaceOnce(s,oldLoader,newLoader,'Priority A loader');

 const oldRoute=`if(t.id==='0,0'){name='town1';width=s*.88;}
    else if(b){name=b.kind==='workshop'?null:({farm:'farm',quarry:'mine',ironMine:'mine',house:'house',tower:'tower',harbor:'house'}[b.kind]||'house');width=b.kind==='tower'?s*.43:s*.72;}
    else if(t.town){name=t.town%2?'town1':'town2';width=s*.85;}`;
 const newRoute=`if(t.id==='0,0'){name=null;width=s*.88;}
    else if(b){name=({farm:'farm',house:'house'}[b.kind]||null);width=s*.72;}
    else if(t.town){name=null;width=s*.85;}`;
 s=replaceOnce(s,oldRoute,newRoute,'building route');

 const oldHook=`if(b&&b.kind==='workshop'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'workshop');g.restore();}`;
 const newHook=`if(t.id==='0,0'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'town'+Math.max(1,Math.min(3,api.villageLevel?api.villageLevel(m):1)));g.restore();}
    if(t.town){var villageArt={1:'woodlandVillage',2:'farmlandVillage',3:'industrialVillage',4:'highlandVillage',5:'waterVillage',6:'harborTown'}[t.town];if(villageArt){g.save();if(!colored)g.globalAlpha=.58;standalone(p,villageArt);g.restore();}}
    if(b&&b.kind==='workshop'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'workshop');g.restore();}
    if(b&&b.kind==='quarry'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'quarry');g.restore();}
    if(b&&b.kind==='ironMine'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'mine');g.restore();}
    if(b&&b.kind==='tower'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'scout'+Math.max(1,Math.min(3,api.villageLevel?api.villageLevel(m):1)));g.restore();}
    if(b&&b.kind==='harbor'){g.save();if(!colored)g.globalAlpha=.58;standalone(p,'dock'+Math.max(1,Math.min(3,api.villageLevel?api.villageLevel(m):1)));g.restore();}`;
 s=replaceOnce(s,oldHook,newHook,'Priority A draw hook');

 if(!s.includes("if(!standalone(q,'fishingBoat'))boat(q,s*.13);")){
   if(!s.includes("boat(q,s*.13);")) throw Error('Fishing boat draw hook baseline not found');
   s=s.replace("boat(q,s*.13);","if(!standalone(q,'fishingBoat'))boat(q,s*.13);");
 }

 write('src/isometricMap221.js',s);
 console.log('Build 230 Priority A renderer ready');
}

console.log('Last Stand Command Build 230 source preparation complete.');
