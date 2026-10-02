// Run after the complete generator/build chain. No third-party test dependencies.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/isometricMap221.js','utf8');
assert.ok(source.includes('var groundArt250={}'),'ground loader must survive generators');
const pending=[],draws=[];let reads=0,canvases=0;
function pen(){return new Proxy({
 drawImage:(im,...args)=>draws.push({im,args}),measureText:()=>({width:20}),
 createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
 getImageData:()=>{reads++;const data=new Uint8ClampedArray(256*128*4);for(let i=0;i<data.length;i+=4)data.set([100,150,50,255],i);return {data};},
 putImageData:p=>{assert.ok(p.data.length>0);}
},{get:(o,k)=>k in o?o[k]:()=>{}});}
class Image{constructor(){this.width=this.naturalWidth=1774;this.height=this.naturalHeight=887;this.complete=true;pending.push(this);}}
const c={Image,console,document:{createElement:()=>({id:++canvases,width:0,height:0,getContext:pen})}};
vm.createContext(c);
// Test-only introspection, never included in the bundle.
vm.runInContext(source.replace('root.LSCIso221={','root.__ground=groundArt250;root.LSCIso221={'),c);
const ground=pending.filter(im=>/\/(grass|stone|sand)-tile.png$/.test(im.src));
assert.equal(ground.length,3);
assert.equal(Object.keys(c.__ground).length,0,'atlas fallback until images load');
ground.forEach(im=>im.onload());
for(const name of ['grass','rock','sand']){
 assert.equal(c.__ground[name].color.width,256);assert.equal(c.__ground[name].color.height,128);
 assert.equal(c.__ground[name].surveyed.width,256);
 assert.equal(c.__ground[name].colorEdges.length,4);
 assert.equal(c.__ground[name].surveyedEdges.length,4);
}
assert.equal(reads,3,'one pixel read per ground asset');
for(const [terrain,name] of [['plain','grass'],['hill','rock'],['bank','sand']])for(const colored of [true,false]){
 const tile={id:'2,2',x:2,y:2,terrain},d={visible:{'2,2':true},cleared:colored?{'2,2':true}:{},roads:{},buildings:{},at:1000};
 c.LSCSettlement={tiles:{'2,2':tile},villageLevel:()=>1,currentRegionObjective:()=>null,jobs:()=>[]};
 draws.length=0;
 c.LSCIso221.paint(pen(),{settlement204:d},{w:390,h:844},{x:2,y:2,scale:100},null,[],1000,{});
 assert.ok(draws.some(d=>d.im===c.__ground[name][colored?'color':'surveyed']),terrain+' '+colored);
}
assert.equal(reads,3,'painting must not process texture pixels');
// Every land edge direction must choose the neighbor texture, never water or
// an unrevealed/differently reclaimed tile. Capture the actual draw calls.
for(const [dx,dy,edge] of [[1,0,0],[-1,0,1],[0,1,2],[0,-1,3]]){
 for(const state of ['clear','surveyed','hidden','mixed','water']){
  const id=(2+dx)+','+(2+dy),tiles={'2,2':{id:'2,2',x:2,y:2,terrain:'plain'}};
  tiles[id]={id,x:2+dx,y:2+dy,terrain:state==='water'?'water':'hill'};
  const cleared=state==='surveyed'?{}:{'2,2':true};if(state!=='mixed'&&state!=='surveyed')cleared[id]=true;
  const d={visible:{'2,2':true,[id]:state!=='hidden'},cleared,roads:{},buildings:{},at:1000};
  c.LSCSettlement={tiles,villageLevel:()=>1,currentRegionObjective:()=>null,jobs:()=>[]};draws.length=0;
  c.LSCIso221.paint(pen(),{settlement204:d},{w:390,h:844},{x:2,y:2,scale:100},null,[],1000,{});
  const expected=c.__ground.rock[state==='surveyed'?'surveyedEdges':'colorEdges'][edge];
  assert.equal(draws.some(d=>d.im===expected),state==='clear'||state==='surveyed',state+' edge '+edge);
 }
}
assert.equal(reads,3,'transitions must not read pixels during painting');
for(const file of ['grass-tile.png','stone-tile.png','sand-tile.png']){
 const bytes=fs.readFileSync('assets/terrain/'+file);
 assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');
 assert.equal(bytes.readUInt32BE(16),1774);assert.equal(bytes.readUInt32BE(20),887);
 assert.equal(bytes[25],6,'RGBA PNG');
 assert.ok(bytes.equals(fs.readFileSync('www/assets/terrain/'+file)),'bundled asset matches '+file);
}
console.log('PASS: generated ground routes, fallback before load, cached 256x128 color/surveyed textures, no per-frame pixel processing, bundled PNG integrity.');
