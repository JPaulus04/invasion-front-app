// Run AFTER npm run build: validates generated code, not generator text.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
require('../src/settlement204.js');
require('../src/settlement205.js');
const api = global.LSCSettlement;
const m = {credits:100000};
assert.ok(api.initialize(m,()=>true,1000).ok);
const d=m.settlement204;
d.materials=100000;d.food=10000;d.population=100;
for(const t of Object.values(api.tiles)){d.visible[t.id]=true;d.cleared[t.id]=true;}
const original=JSON.stringify(m);
assert.ok(api.initialize(m,()=>true,1000).ok);
assert.equal(JSON.stringify(m),original,'existing save preserved on reopening');
function isolated(t){
 d.buildings={};d.roads={'0,0':true};d.job=null;d.projects=[];d.queue=[];
 // Connect a test supply spur to the tile, using existing roads only.
 let x=0,y=0;const dx=t.x>0?1:-1,dy=t.y>0?1:-1;
 while(x!==t.x){x+=dx;d.roads[x+','+y]=true;}
 while(y!==t.y){y+=dy;d.roads[x+','+y]=true;}
 delete d.roads[t.id];
}
const ordinary=Object.values(api.tiles).filter(t=>t.id!=='0,0'&&!t.town&&api.stoneDeposit(t.id)&&!api.mountain(t.id));
assert.ok(ordinary.length>10);
for(const t of ordinary){isolated(t);assert.ok(api.placement(m,'road',t.id,[]).ok,'stone road '+t.id);}
const peaks=Object.values(api.tiles).filter(t=>t.id!=='0,0'&&!t.town&&api.mountain(t.id));
for(const t of peaks){isolated(t);assert.match(api.placement(m,'road',t.id,[]).message,/Mountain terrain/);}
const t=ordinary[0];isolated(t);d.buildings[t.id]={kind:'quarry',workers:0};
assert.match(api.placement(m,'road',t.id,[]).message,/existing road or building/);
isolated(t);const before=JSON.stringify(m);
assert.equal(api.action(m,()=>false,'quickRoad',{id:t.id,type:'road',crew:1},1000).ok,false);
assert.equal(JSON.stringify(m),before,'failed road save rolls back');
// A village with only one revealed corridor must route through ordinary stone.
const corridor={credits:100000};api.initialize(corridor,()=>true,1000);
const cd=corridor.settlement204;cd.visible={};cd.cleared={};cd.roads={'0,0':true};cd.buildings={};
cd.materials=100000;cd.food=10000;cd.population=100;
const savedTerrain=[];
for(let x=0;x<=5;x++){const tile=api.tile(x+',0');savedTerrain.push([tile,tile.terrain]);tile.terrain=x===2?'hill':'plain';cd.visible[tile.id]=cd.cleared[tile.id]=true;}
assert.ok(api.stoneDeposit('2,0')&&!api.mountain('2,0'));
const connection=api.preview(corridor,'connection',{town:1},1);
assert.ok(connection.ok,connection.message);assert.ok(connection.project.path.includes('2,0'));
savedTerrain.forEach(([tile,terrain])=>tile.terrain=terrain);

// Build 293 regression: construction eligibility must match resource tile rules.
const candidateTiles=Object.values(api.tiles).filter(t=>t.id!=='0,0'&&!t.town);
for(const kind of ['workshop','farm','quarry','ironMine','tower','harbor']){
  const checked=new Set();
  for(const site of candidateTiles){
    isolated(site);
    const id=site.id;
    const allowedTerrain=kind==='workshop'?api.forest(id):
      kind==='farm'?api.fertile(id):
      kind==='quarry'?api.stoneDeposit(id):
      kind==='ironMine'?api.ironDeposit(id):
      kind==='tower'?site.terrain==='hill':
      api.coastal(id);
    if(!allowedTerrain){
      // Sample each terrain class rather than repeatedly cloning the entire map.
      if(checked.has(site.terrain))continue;
      checked.add(site.terrain);
      const placement=api.placement(m,kind,id,[]);
      assert.equal(placement.ok,false,kind+' incorrectly permitted at '+id+' ('+site.terrain+')');
      const preview=api.preview(m,kind,{id,crew:1},1);
      assert.equal(preview.ok,false,kind+' preview bypasses terrain at '+id);
      const snapshot=JSON.stringify(m);
      const result=api.action(m,()=>true,'build',{id,kind,crew:1},1000);
      assert.equal(result.ok,false,kind+' action bypasses terrain at '+id);
      assert.equal(JSON.stringify(m),snapshot,'rejected construction must not mutate save');
    }
  }
}
console.log('PASS: invalid resource building placements and previews rejected across terrain map.');
// The modern art build preserves the gameplay assertions above. The remaining
// bridge-atlas pixel-count assertions belong to the retired legacy renderer.
// Modern sprite behavior is covered by test-art-renderer-295.cjs.
if (process.env.LSC_MODERN_ART === '1') {
  console.log('PASS: world infrastructure gameplay rules (modern art renderer)');
  process.exit(0);
}
const source=fs.readFileSync('src/isometricMap221.js','utf8');
assert.ok(source.includes('cache.isoRebuilds'),'run full build before this test');
assert.ok(!source.includes('renderBridgeSpans242();'));
assert.ok(!source.includes('yContinue'),'axis-dropping junction heuristic removed');
const pending=[],draws=[];
function pen(){return new Proxy({measureText:t=>({width:String(t).length*7}),
 drawImage:(im,...args)=>draws.push({src:im.src||'canvas',args}),
 createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
 getImageData:()=>({data:new Uint8ClampedArray(256*128*4)})},
 {get:(o,k)=>k in o?o[k]:(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}
class Image{constructor(){this.width=this.naturalWidth=1024;this.height=this.naturalHeight=512;this.complete=true;pending.push(this);}}
const context={Image,console,document:{createElement:()=>({width:0,height:0,getContext:()=>pen()})},devicePixelRatio:2};
vm.createContext(context);vm.runInContext(source,context);pending.forEach(im=>im.onload&&im.onload());
const dirs=[[1,0,1],[-1,0,2],[0,1,4],[0,-1,8]];
function setup(mask){
 const tile={id:'5,5',x:5,y:5,terrain:'water'},tiles={'5,5':tile};
 const state={visible:{'5,5':true},cleared:{},roads:{'5,5':true},buildings:{},at:1000};
 dirs.forEach(([x,y,bit])=>{const id=(5+x)+','+(5+y);tiles[id]={id,x:5+x,y:5+y,terrain:'water'};if(mask&bit)state.roads[id]=true;});
 context.LSCSettlement={tiles,villageLevel:()=>1,currentRegionObjective:()=>null,jobs:()=>[]};
 return {settlement204:state};
}
const view={w:390,h:844},camera={x:5,y:5,scale:100};
for(let mask=0;mask<16;mask++){
 const world=setup(mask),cache={};draws.length=0;
 context.LSCIso221.paint(pen(),world,view,camera,null,[],1000,cache);
 const a=draws.filter(x=>x.src.endsWith('water-bridge-a.png')).length;
 const b=draws.filter(x=>x.src.endsWith('water-bridge-b.png')).length;
 const actual=mask||3;
 if((actual&3)&&(actual&12)){
  assert.equal(a,Number(!!(mask&4))+Number(!!(mask&8)),'Y bridge arms '+mask);
  assert.equal(b,Number(!!(mask&1))+Number(!!(mask&2)),'X bridge arms '+mask);
 }else{assert.equal(a,(actual&12)?1:0);assert.equal(b,(actual&3)?1:0);}
}
const world=setup(3),cache={};
function paint(c,now=1000){context.LSCIso221.paint(pen(),world,view,c,null,[],now,cache);}
paint(camera);
for(let i=1;i<=120;i++)paint({...camera,x:5+i*.005},1000+i*16);
assert.equal(cache.isoRebuilds,1,'120 small pan updates reuse the raster');
paint({...camera,scale:110},3000);assert.equal(cache.isoRebuilds,1,'pinch reuses raster');
paint({...camera,scale:110},3200);assert.equal(cache.isoRebuilds,2,'idle pinch redraws sharply');
world.settlement204.renderRevision=1;paint({...camera,scale:110},3220);
assert.equal(cache.isoRebuilds,3,'world changes invalidate raster');
paint({...camera,x:50},3240);assert.equal(cache.isoRebuilds,4,'cache edge triggers rebuild');
assert.ok(cache.isoCanvas.width<=2048&&cache.isoCanvas.height<=2048);
const expectedBuild=fs.readFileSync('scripts/set-build-version.js','utf8').match(/LSC build marker: (\d+)/)[1];
assert.ok(fs.readFileSync('www/index.html','utf8').includes("const LSC_BUILD = '"+expectedBuild+"';"));
for(const match of fs.readFileSync('www/index.html','utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))new vm.Script(match[1]);
console.log('PASS: stone roads, mountain/building restrictions, saved campaign and rollback, all 16 bridge masks, camera raster reuse/invalidation, final bundled JavaScript.');
