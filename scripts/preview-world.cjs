// Deterministic full-renderer visual QA. Native canvas is a separate QA dependency.
// LSC_CANVAS_MODULE=/path/to/@napi-rs/canvas node scripts/preview-world.cjs source.js output-dir
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {createCanvas,Image:NativeImage}=require(process.env.LSC_CANVAS_MODULE||'@napi-rs/canvas');
const source=fs.readFileSync(process.argv[2]||'src/isometricMap221.js','utf8'),out=process.argv[3]||'/tmp/lsc-preview';
fs.mkdirSync(out,{recursive:true});const pending=[];
class Image extends NativeImage{
 set src(file){this.file=file;const cb=this.onload;pending.push(new Promise((resolve,reject)=>{this.onload=()=>{try{if(cb)cb();resolve();}catch(e){reject(e);}};this.onerror=reject;}));super.src=fs.readFileSync(file);}
 get src(){return this.file;}
}
const context={console,Image,document:{createElement:()=>createCanvas(1,1)},devicePixelRatio:1};
vm.createContext(context);vm.runInContext(source,context);
function fixture(){
 const tiles={},d={visible:{},cleared:{},roads:{},buildings:{},welcomed:{1:true,3:true},defended:{},at:1000};
 for(let x=-8;x<=8;x++)for(let y=-7;y<=8;y++){
  const id=x+','+y,water=(x<1&&y>=-1&&y<=1)||(x>=1&&x<=3&&y>=-1&&y<=4)||((x-4)**2/9+(y-5)**2/4<=1);
  tiles[id]={id,x,y,terrain:water?'water':(x*7+y*11)%5===0?'hill':(x+y)%3===0?'bank':'plain'};
  d.visible[id]=true;d.cleared[id]=x<5;
 }
 tiles['0,0'].terrain='plain'; // HQ island exercises shores on every edge.
 tiles['-4,3'].town=3;tiles['0,3'].town=1;
 function road(x,y){d.roads[x+','+y]=true;}
 for(let x=-6;x<=0;x++)road(x,3);
 for(let y=-4;y<=3;y++)road(0,y);
 for(let x=-5;x<=0;x++)road(x,-4);
 for(let y=-6;y<=-4;y++)road(-5,y);
 d.buildings['-2,2']={kind:'harbor'};d.buildings['-3,5']={kind:'quarry'};
 context.LSCSettlement={tiles,villageLevel:()=>1,currentRegionObjective:()=>null,jobs:()=>[],stars:()=>1,mountain:id=>['-5,5','-4,-6','5,1'].includes(id)};
 return {settlement204:d};
}
(async()=>{
 await Promise.all(pending);const world=fixture();
 for(const [name,w,h,x,y,scale] of [['overview',1200,1000,0,1,135],['shore',706,1100,2,2,210],['roads',706,1100,-3,-4,210],['village',706,1100,-2,3,210]]){
  const canvas=createCanvas(w,h),g=canvas.getContext('2d');context.LSCIso221.paint(g,world,{w,h},{x,y,scale},null,[],1000,{});
  fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));
 }
 console.log('Rendered four deterministic scenes to '+out);
})().catch(e=>{console.error(e);process.exitCode=1;});
