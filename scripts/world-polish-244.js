#!/usr/bin/env node
/**
 * Last Stand Command — Build 244 world-art corrective pass.
 * Runs after Build 243 asset integration and before set-build-version.js.
 *
 * Scope:
 *  - turn authored forest clusters into overlapping regional forests
 *  - remove the legacy narrow water-road layer underneath authored bridges
 *  - tighten authored bridge scale/placement
 *  - strengthen magenta-key cleanup on authored building/terrain art
 *  - reduce repetitive/oversized mountain decoration
 */
const fs=require('fs');
const cp=require('child_process');
const P='src/isometricMap221.js';
let r=fs.readFileSync(P,'utf8');

function need(s,label){if(!r.includes(s))throw Error('Build 244 baseline missing: '+label);}
function swap(a,b,label){if(r.includes(b))return;need(a,label);r=r.replace(a,b);}

// Stronger magenta removal. Build 243 only removed nearly pure #FF00FF.
const cs=r.indexOf('function chroma243(im){'),ce=r.indexOf(' function loadBuilding243',cs);
if(cs<0||ce<0)throw Error('Build 244 baseline missing: chroma243');
const chroma244=`function chroma243(im){
  if(typeof document==='undefined')return im;
  var cv=document.createElement('canvas'),cx,data,i,r0,g0,b0,mag,diff;
  cv.width=im.naturalWidth||im.width;cv.height=im.naturalHeight||im.height;
  cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(im,0,0);
  try{
   data=cx.getImageData(0,0,cv.width,cv.height);
   for(i=0;i<data.data.length;i+=4){
    r0=data.data[i];g0=data.data[i+1];b0=data.data[i+2];mag=(r0+b0)*.5-g0;diff=Math.abs(r0-b0);
    if(r0>145&&b0>145&&g0<175&&mag>42&&diff<115){data.data[i+3]=0;continue;}
    if(r0>125&&b0>125&&mag>30&&diff<125){data.data[i+3]=Math.min(data.data[i+3],Math.max(0,255-(mag-30)*7));}
   }
   cx.putImageData(data,0,0);
  }catch(e){return im;}
  return cv;
 }`;
r=r.slice(0,cs)+chroma244+r.slice(ce);

// Regional forest renderer: overlapping clusters with dense interiors and irregular edges.
const oldForest=`function forest243(p,t){
   var pick=Math.abs(t.x*17+t.y*31)%7,name=pick===0?'forestDetail':'forest'+(1+Math.abs(t.x*13+t.y*19)%3),im=terrainArt[name];
   if(!im||(!im.naturalWidth&&!im.width))return false;
   var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=s*(name==='forestDetail'?.46:.58),h=w*ih/iw;
   g.drawImage(im,p.x-w*.5,p.y+s*.16-h,w,h);return true;
  }`;
const newForest=`function forestRegion244(t){
   var field=Math.sin((t.x+2)*.73)+Math.cos((t.y-1)*.61)+Math.sin((t.x+t.y)*.37)*.72;
   return field>-.20;
  }
  function forestSprite244(p,t,name,scale,ox,oy){
   var im=terrainArt[name];if(!im||(!im.naturalWidth&&!im.width))return false;
   var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=s*scale,h=w*ih/iw;
   g.drawImage(im,p.x+ox*s-w*.5,p.y+oy*s+s*.18-h,w,h);return true;
  }
  function forest243(p,t){
   if(!forestRegion244(t))return false;
   var h=Math.abs(t.x*47+t.y*71),edge=0;
   [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(a){if(!forestRegion244({x:t.x+a[0],y:t.y+a[1]}))edge++;});
   var dense=edge===0,count=dense?3:(edge===1?2:1),drawn=false;
   var offsets=[[0,0],[-.23,.055],[.24,.045],[.02,-.09]];
   for(var i=0;i<count;i++){
    var name='forest'+(1+Math.abs(h+i*5)%3),sc=(dense?.62:.55)+(Math.abs(h+i*13)%5)*.018;
    drawn=forestSprite244(p,t,name,sc,offsets[i][0],offsets[i][1])||drawn;
   }
   if(dense&&h%5===0)forestSprite244(p,t,'forestDetail',.34,.17,.10);
   return drawn;
  }`;
swap(oldForest,newForest,'forest renderer');

const oldDecor="else if(!d.roads[t.id]){if(t.terrain==='hill'){name='mountain';width=s*.74;}else if(t.terrain==='plain'&&Math.abs(t.x*7+t.y*11)%4){name=null;forest243(p,t);}}";
const newDecor="else if(!d.roads[t.id]){if(t.terrain==='hill'&&Math.abs(t.x*11+t.y*17)%3===0){name='mountain';width=s*.56;}else if(t.terrain==='plain'){name=null;forest243(p,t);}}";
swap(oldDecor,newDecor,'forest/mountain decoration route');

// Suppress the old narrow water-road. The authored bridge span owns water crossings.
const oldWater="if(t.terrain==='water'){if(!roadPiece(p,mask,true)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}else if((mask===1||mask===2||mask===4||mask===8)?!roadEnd242(p,t,mask):!packRoad242(p,mask)){if(!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}";
const newWater="if(t.terrain==='water'){/* Build 244: authored bridge span renders this crossing; no legacy water-road underlay. */}else if((mask===1||mask===2||mask===4||mask===8)?!roadEnd242(p,t,mask):!packRoad242(p,mask)){if(!roadPiece(p,mask,false)){g.save();diamond(g,p,s);g.clip();sprite(p,'road'+full,s,true,true);g.restore();}}";
swap(oldWater,newWater,'water-road suppression');

// Keep the bridge visually subordinate to settlements/terrain and aligned to its approaches.
const oldBridge="var w=len,h=w*(im.naturalHeight/im.naturalWidth);g.drawImage(im,-w/2,-h*.64,w,h);";
const newBridge="var w=len*.90,h=w*(im.naturalHeight/im.naturalWidth);g.drawImage(im,-w/2,-h*.58,w,h);";
swap(oldBridge,newBridge,'bridge scale');

r=r.replace(
 "var count=Math.max(1,Math.ceil(len/(segW*.94))),step=len/count;",
 "var count=Math.max(1,Math.ceil(len/(segW*.90))),step=len/count;"
);

fs.writeFileSync(P,r,'utf8');
cp.execFileSync(process.execPath,['--check',P],{stdio:'inherit'});
console.log('Build 244 world polish ready: regional forests, clean bridge crossing, stronger chroma cleanup, restrained mountains.');
