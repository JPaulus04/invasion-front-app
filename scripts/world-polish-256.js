const fs=require('node:fs'),cp=require('node:child_process');
const file='src/isometricMap221.js';let r=fs.readFileSync(file,'utf8');
function swap(a,b){if(r.split(a).length!==2)throw Error('256 missing/repeated anchor: '+a);r=r.replace(a,b);}
function between(a,b,value){const start=r.indexOf(a),end=r.indexOf(b,start);if(start<0||end<0)throw Error('256 missing anchor: '+a);r=r.slice(0,start)+value+r.slice(end);}
// Retire the opaque bank/rubble composites and first-generation water bitmap.
// The new overlays replace them; retaining both would waste startup work and memory.
between(' function prepare254(){',' function deck254(im){',' function prepare254(){connected254.ready=true;}\n');
swap(' function project(t,c,v){',fs.readFileSync('scripts/terrain-256.txt','utf8')+'\n function project(t,c,v){');
swap('  function mask254(t){','  function mask254(t,land){');
swap("q&&d.visible[id]&&q.terrain==='water')m|=a[2]","q&&d.visible[id]&&(land?q.terrain!=='water':q.terrain==='water'))m|=a[2]");
swap('  function water254(p,t){',`  function coastStamp256(p,t,water){
   var mask=mask254(t,water);if(!mask)return;
   var art=(water?coast256.water:coast256.land)[mask];if(!art)return;
   if(!water)waterCorners256(p,t,mask);
   g.save();diamond(g,p,s+1);g.clip();g.drawImage(art,p.x-(s+1)/2,p.y-(s+1)/4,s+1,(s+1)/2);g.restore();
  }
  function waterCorners256(p,t,mask){
   [[1,4,1,1],[1,8,1,-1],[2,4,-1,1],[2,8,-1,-1]].forEach(function(q){
    if(!(mask&q[0])||!(mask&q[1]))return;
    function point(u,v){u*=q[2];v*=q[3];return [p.x+(u-v)*(s+1.2)/2,p.y+(u+v)*(s+1.2)/4];}
    var a=point(.5,.5),b=point(.1,.5),c1=point(.321,.5),c2=point(.5,.321),e=point(.5,.1);
    g.save();g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.bezierCurveTo(c1[0],c1[1],c2[0],c2[1],e[0],e[1]);g.closePath();g.clip();water254(p,t,true);g.restore();
   });
  }
  function shoreLine256(t,p){
   if(t.terrain==='water'||d.roads[t.id])return;var mask=mask254(t);if(!mask)return;
   function point(u,v){return [p.x+(u-v)*s/2,p.y+(u+v)*s/4];}
   function line(u,v,x,y){var a=point(u,v),b=point(x,y);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);}
   g.save();g.beginPath();
   if(mask&1)line(.5,mask&8?-.1:-.5,.5,mask&4?.1:.5);
   if(mask&2)line(-.5,mask&8?-.1:-.5,-.5,mask&4?.1:.5);
   if(mask&4)line(mask&2?-.1:-.5,.5,mask&1?.1:.5,.5);
   if(mask&8)line(mask&2?-.1:-.5,-.5,mask&1?.1:.5,-.5);
   [[1,4,1,1],[1,8,1,-1],[2,4,-1,1],[2,8,-1,-1]].forEach(function(q){
    if(!(mask&q[0])||!(mask&q[1]))return;
    var a=point(.1*q[2],.5*q[3]),b=point(.321*q[2],.5*q[3]),c1=point(.5*q[2],.321*q[3]),e=point(.5*q[2],.1*q[3]);
    g.moveTo(a[0],a[1]);g.bezierCurveTo(b[0],b[1],c1[0],c1[1],e[0],e[1]);
   });
   g.lineCap='butt';g.strokeStyle='rgba(85,173,177,.16)';g.lineWidth=s*.055;g.stroke();
   g.restore();
  }
  function water254(p,t,surfaceOnly){`);
// Water stays one continuous field. Shore tint is drawn against the land contour,
// avoiding overlapping per-water-tile gradients at river and lake corners.
between('  function ground254(p,t,colored){','  function standalone(',`  function ground254(p,t,colored){
   if(t.terrain==='water'){water254(p,t);return;}
   var smallRock=ordinary254(t);
   sprite(p,t.terrain==='hill'&&!smallRock?'rock':'grass',s+1,colored,true);
   if(smallRock&&!d.roads[t.id]&&!d.buildings[t.id]&&coast256.stones.length){
    g.save();if(!colored)g.globalAlpha=.72;
    g.drawImage(coast256.stones[Math.abs(t.x*7+t.y*13)%4],p.x-s/2,p.y-s/4,s,s/2);g.restore();
   }
  }
`);
// After all ground-edge blends, before roads: every land type can own a shoreline.
swap('groundTransition251(p,t,colored);','groundTransition251(p,t,colored);if(t.terrain!==\'water\')coastStamp256(p,t,false);');
swap("q.terrain==='plain'||ordinary254(q)?'grass'","q.terrain==='plain'||q.terrain==='bank'||ordinary254(q)?'grass'");
swap("ordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});","ordered.forEach(function(t){if(t.terrain!=='water')waterCorners256(at(t.id),t,mask254(t));});\nordered.forEach(function(t){shoreLine256(t,at(t.id));});\nordered.forEach(function(t){if(t.id!=='0,0'&&!t.town)return;settlementEntrance(t,at(t.id));});");
swap("(t.terrain==='water'?'#438fd0':t.terrain==='bank'?'#cbb873':t.terrain==='hill'?'#817759':'#83a841')","(t.terrain==='water'?'#1c6f94':t.terrain==='hill'?'#817759':'#738044')");
// Rounded road centerlines, sampled once at image load, with authored dirt colors.
between(' function prepareRoad255(im,mask){',' function cacheRoad255(',fs.readFileSync('scripts/roads-256.txt','utf8'));
fs.writeFileSync(file,r);cp.execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log('Build 256: continuous coasts, textured water, shaded stone and curved road junctions.');
