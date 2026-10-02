// Run after the water generator: presentation only, never edits settlement data.
const fs=require('node:fs'),cp=require('node:child_process');
const file='src/isometricMap221.js';let source=fs.readFileSync(file,'utf8');
function replace(old,next){if(source.split(old).length!==2)throw Error('253 anchor missing or repeated: '+old);source=source.replace(old,next);}
replace(' function project(t,c,v){',` // Small immutable shoreline stamps; generated once, included in the map cache.
 var shores253=[];
 if(typeof document!=='undefined')[[1,1],[-1,-1],[-1,1],[1,-1]].forEach(function(axis){
  var cv=document.createElement('canvas');cv.width=256;cv.height=128;
  var ctx=cv.getContext('2d'),pixels=ctx.createImageData(256,128),data=pixels.data;
  for(var y=0;y<128;y++)for(var x=0;x<256;x++){
   var u=(x+.5-128)/128,v=(y+.5-64)/64;
   if(Math.abs(u)+Math.abs(v)>1)continue;
   var distance=1-axis[0]*u-axis[1]*v,along=axis[0]*u-axis[1]*v;
   // Variation returns to the same width at both tips, avoiding corner breaks.
   var width=.115+.035*Math.sin(Math.PI*along)*Math.sin(3*Math.PI*along);
   if(distance>width+.08)continue;
   var i=(y*256+x)*4,wet=distance>width;
   data[i]=wet?132:57;data[i+1]=wet?127:144;data[i+2]=wet?103:182;
   data[i+3]=Math.round(wet?60*(1-(distance-width)/.08):215*Math.min(1,(width-distance)/.045));
  }
  ctx.putImageData(pixels,0,0);shores253.push(cv);
 });
 function project(t,c,v){`);
replace('  function standalone(',`  function shore253(p,t){
   if(t.terrain!=='bank')return;
   [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a,edge){
    var id=(t.x+a[0])+','+(t.y+a[1]),q=tiles[id];
    if(q&&d.visible[id]&&q.terrain==='water'&&shores253[edge])g.drawImage(shores253[edge],p.x-s/2,p.y-s/4,s,s/2);
   });
  }
  function harborWater253(t){
   return [[1,0],[-1,0],[0,1],[0,-1]].find(function(a){var id=(t.x+a[0])+','+(t.y+a[1]),q=tiles[id];return q&&d.visible[id]&&q.terrain==='water';});
  }
  function dockPoint253(p,t){
   var a=harborWater253(t);return a?project({x:t.x+a[0]*.32,y:t.y+a[1]*.32},c,v):p;
  }
  function standalone(`);
replace('if(!colored)g.stroke();groundTransition251(p,t,colored);','groundTransition251(p,t,colored);shore253(p,t);');
replace("standalone(p,'dock'+artTier243);","standalone(dockPoint253(p,t),'dock'+artTier243);");
// The separate fishing boat belongs farther offshore than the dock itself.
const old="var a=[[1,0],[-1,0],[0,1],[0,-1]].find(function(a){var q=tiles[(t.x+a[0])+','+(t.y+a[1])];return q&&q.terrain==='water';})||[1,0],q=project({x:t.x+a[0]*.47,y:t.y+a[1]*.47},c,v);";
replace("if(b&&b.kind==='harbor'){g.save();"+old,"if(b&&b.kind==='harbor'&&harborWater253(t)){g.save();var a=harborWater253(t),q=project({x:t.x+a[0]*.85,y:t.y+a[1]*.85},c,v);");
fs.writeFileSync(file,source);cp.execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log('Build 253 shoreline stamps and water-facing harbor anchors ready.');
