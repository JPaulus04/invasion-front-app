// Run after npm run build. No native/third-party test dependencies required.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/isometricMap221.js','utf8');
const pending=[],draws=[];let reads=0;
function pen(canvas={}){return new Proxy({
 drawImage:(im,...args)=>draws.push({im,args}),measureText:()=>({width:20}),
 createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
 getImageData:()=>{reads++;const data=new Uint8ClampedArray(256*128*4);
  for(let i=0;i<data.length;i+=4)data.set([120,80,50,255],i);
  data.set([255,0,255,80],(70*256+140)*4);return {data};},
 putImageData:p=>{canvas.pixels=p.data;}
},{get:(o,k)=>k in o?o[k]:()=>{}});}
class Image{constructor(){this.width=this.naturalWidth=256;this.height=this.naturalHeight=128;this.complete=true;pending.push(this);}}
const c={Image,console,document:{createElement:()=>{const canvas={width:0,height:0};canvas.getContext=()=>pen(canvas);return canvas;}}};
vm.createContext(c);
vm.runInContext(source.replace('root.LSCIso221={','root.__roads=roadPrepared255;root.LSCIso221={'),c);
assert.equal(Object.keys(c.__roads).length,0);
pending.filter(im=>/sbs-dry/.test(im.src)).forEach(im=>im.onload());
assert.equal(Object.keys(c.__roads).length,15,'all connected masks including four single-arm entrances');
assert.equal(reads,15,'one-time preparation only');
const dirs=[[1,0,1],[-1,0,2],[0,1,4],[0,-1,8]];
function alpha(mask,u,v){const x=Math.floor(128+(u-v)*128),y=Math.floor(64+(u+v)*64);return c.__roads[mask].pixels[(y*256+x)*4+3];}
for(let mask=1;mask<16;mask++){
 const pixels=c.__roads[mask].pixels;
 for(let i=0;i<pixels.length;i+=4)if(pixels[i+3])assert.ok(pixels[i]>pixels[i+2]&&pixels[i+1]>pixels[i+2],'clean dirt replaces matte without pink or transparent holes');
 for(const [u,v,bit] of dirs)assert.equal(alpha(mask,u*.4,v*.4)>200,!!(mask&bit),'arm '+bit+' in '+mask);
 assert.equal(alpha(mask,.35,.35),0,'off-road terrain remains transparent');
 if([3,7,11,12,13,14,15].includes(mask))assert.ok(alpha(mask,0,0)>240,'junction center has no seam');
 if([5,6,9,10].includes(mask)){
  const u=mask&1?.1375:-.1375,v=mask&4?.1375:-.1375;
  assert.ok(alpha(mask,u,v)>240,'rounded bend remains continuous');
  assert.equal(alpha(mask,0,0),0,'inside bend is rounded, not a protruding square');
 }
}
function setup(mask,town,hidden=false){
 const tile={id:'2,2',x:2,y:2,terrain:'plain',town:town?1:undefined},tiles={'2,2':tile};
 const d={visible:{'2,2':true},cleared:{'2,2':true},roads:town?{}:{'2,2':true},buildings:{},welcomed:{},defended:{},at:1000};
 dirs.forEach(([x,y,bit])=>{const id=(2+x)+','+(2+y);tiles[id]={id,x:2+x,y:2+y,terrain:'plain'};d.visible[id]=!hidden;if(mask&bit)d.roads[id]=true;});
 c.LSCSettlement={tiles,villageLevel:()=>1,currentRegionObjective:()=>null,jobs:()=>[],stars:()=>1};
 return {settlement204:d};
}
const view={w:390,h:844},camera={x:2,y:2,scale:100};
for(const town of [false,true])for(let mask=0;mask<16;mask++){
 const m=setup(mask,town),before=JSON.stringify(m);draws.length=0;
 c.LSCIso221.paint(pen(),m,view,camera,null,[],1000,{});
 const expected=town?mask:({0:3,1:3,2:3,4:12,8:12}[mask]||mask);
 // Neighbors draw earlier/later too, so identify the center tile by screen position.
 const center=draws.filter(d=>Object.values(c.__roads).includes(d.im)&&Math.abs(d.args[0]+d.args[2]/2-355)<.01&&Math.abs(d.args[1]+d.args[3]/2-582)<.01);
 assert.equal(center.length,expected?1:0,'center road count '+town+' '+mask);
 if(expected)assert.equal(center[0].im,c.__roads[expected],'selected mask '+town+' '+mask);
 assert.equal(JSON.stringify(m),before,'renderer does not mutate the save');
}
const hidden=setup(15,true,true);draws.length=0;
c.LSCIso221.paint(pen(),hidden,view,camera,null,[],1000,{});
assert.ok(!draws.some(d=>Object.values(c.__roads).includes(d.im)),'hidden neighbors do not reveal entrances');
const m=setup(15,true),cache={};
for(let i=0;i<120;i++)c.LSCIso221.paint(pen(),m,view,{...camera,x:2+i*.002},null,[],1000+i*16,cache);
assert.equal(cache.isoRebuilds,1,'camera pan reuses raster');
assert.equal(reads,15,'painting and panning never process road pixels');
console.log('PASS: matte cleanup, 15 road masks, junction continuity, every village entrance, hidden neighbors, unchanged saves, cached pan with no pixel reads.');
