// Final renderer-only pass. Road placement, saves and bridge geometry stay unchanged.
const fs=require('node:fs'),cp=require('node:child_process');
const file='src/isometricMap221.js';let r=fs.readFileSync(file,'utf8');
function swap(a,b){if(r.split(a).length!==2)throw Error('255 missing/repeated anchor: '+a);r=r.replace(a,b);}
function between(a,b,value){const start=r.indexOf(a),end=r.indexOf(b,start);if(start<0||end<0)throw Error('255 missing anchor: '+a);r=r.slice(0,start)+value+r.slice(end);}
swap(' var roadPack242={},bridgeArt242={};',` var roadPack242={},bridgeArt242={},roadPrepared255={};
 // Prepared once per loaded image, never during map painting or camera movement.
 function prepareRoad255(im,mask){
  if(typeof document==='undefined')return null;
  var canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  var ctx=canvas.getContext('2d');if(!ctx)return null;
  ctx.drawImage(im,0,0,256,128);
  var pixels=ctx.getImageData(0,0,256,128),data=pixels.data;
  for(var y=0;y<128;y++)for(var x=0;x<256;x++){
   var i=(y*256+x)*4;if(!data[i+3])continue;
   // Remove the source pack's translucent magenta matte, not brown dirt detail.
   if(data[i]>110&&data[i+2]>95&&data[i]>data[i+1]*1.3&&data[i+2]>data[i+1]*1.3){data[i+3]=0;continue;}
   var u=(x+.5-128)/256+(y+.5-64)/128,v=(y+.5-64)/128-(x+.5-128)/256;
   // Constant-width isometric corridors. Small edge variation fades at tile joins.
   var fade=Math.max(0,1-Math.max(Math.abs(u),Math.abs(v))*2);
   var width=.155+.006*Math.sin(u*39+v*27)*fade,dist=-10;
   if(mask&1)dist=Math.max(dist,Math.min(u,width-Math.abs(v)));
   if(mask&2)dist=Math.max(dist,Math.min(-u,width-Math.abs(v)));
   if(mask&4)dist=Math.max(dist,Math.min(v,width-Math.abs(u)));
   if(mask&8)dist=Math.max(dist,Math.min(-v,width-Math.abs(u)));
   // Opposite arms must not acquire a translucent seam at their shared center.
   if((mask&3)===3)dist=Math.max(dist,width-Math.abs(v));
   if((mask&12)===12)dist=Math.max(dist,width-Math.abs(u));
   if(mask&(mask-1))dist=Math.max(dist,width-Math.max(Math.abs(u),Math.abs(v)));
   data[i+3]=Math.round(data[i+3]*Math.max(0,Math.min(1,(dist+.006)/.012)));
  }
  ctx.putImageData(pixels,0,0);return canvas;
 }
 function cacheRoad255(im,mask){
  roadPrepared255[mask]=prepareRoad255(im,mask);
  if(mask===3){roadPrepared255[1]=prepareRoad255(im,1);roadPrepared255[2]=prepareRoad255(im,2);}
  if(mask===12){roadPrepared255[4]=prepareRoad255(im,4);roadPrepared255[8]=prepareRoad255(im,8);}
 }
`);
swap("var im=new Image();im.onload=function(){revision++;};im.src='assets/roads/sbs-dry/mask-'+mask+'.png';roadPack242[mask]=im;", "var im=new Image();im.onload=function(){cacheRoad255(im,mask);revision++;};im.src='assets/roads/sbs-dry/mask-'+mask+'.png';roadPack242[mask]=im;");
between('  function packRoad242(p,mask){','  function dirtConnection242',`  function packRoad242(p,mask){
   var im=roadPrepared255[mask];if(!im)return false;
   var size=s+1.2; // Subpixel overlap avoids hairline cracks between neighboring tiles.
   g.save();diamond(g,p,size);g.clip();g.drawImage(im,p.x-size/2,p.y-size/4,size,size/2);g.restore();return true;
  }

`);
swap('packRoad242(p,(mask===4||mask===8)?12:3);return true;','return packRoad242(p,(mask===4||mask===8)?12:3);');
between('  function settlementEntrance(t,p){','  var BRIDGE_TILE_UNIT_LEN',`  function settlementEntrance(t,p){
   var mask=0;
   [[1,0,1],[-1,0,2],[0,1,4],[0,-1,8]].forEach(function(a){
    var id=(t.x+a[0])+','+(t.y+a[1]);
    if(tiles[id]&&d.visible[id]&&d.roads[id])mask|=a[2];
   });
   // Draw below settlement art, with the same texture and width as adjoining roads.
   if(mask)packRoad242(p,mask);
  }

`);
fs.writeFileSync(file,r);cp.execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log('Build 255 road polish ready: clean textured edges and all revealed village entrances.');
