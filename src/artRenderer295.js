/* Last Stand Command: opt-in 2.5D visual foundation.
 * No gameplay/save mutations. Default is the accepted legacy renderer.
 * New sprite layers register only after their image has loaded successfully.
 */
(function(root){
'use strict';
var sprites=Object.create(null),mode='legacy',fallback=root.LSCIso221;
function register(key,url,options){
 if(!/^[a-z][a-z0-9_-]*$/.test(key))throw Error('Invalid sprite key');
 if(!/^assets\/[a-zA-Z0-9_./-]+\.(png|webp)$/.test(url)||url.includes('..'))throw Error('Invalid asset path');
 if(typeof Image==='undefined')return false;
 var image=new Image(),slot={ready:false,image:image,anchorX:.5,anchorY:1,scale:1};
 options=options||{};
 ['anchorX','anchorY','scale'].forEach(function(k){if(Number.isFinite(options[k]))slot[k]=options[k];});
 image.onload=function(){if(image.naturalWidth&&image.naturalHeight)slot.ready=true;};
 image.onerror=function(){slot.ready=false;};
 image.src=url;sprites[key]=slot;return true;
}
function draw(g,key,x,y,width){
 var a=sprites[key];if(!a||!a.ready||!g||!width)return false;
 var h=width*a.image.naturalHeight/a.image.naturalWidth*a.scale,w=width*a.scale;
 g.drawImage(a.image,x-w*a.anchorX,y-h*a.anchorY,w,h);return true;
}
function sort(items){
 return items.slice().sort(function(a,b){
  return (a.depth-b.depth)||(a.x-b.x)||(a.id||'').localeCompare(b.id||'');
 });
}
function setMode(next){if(next!=='legacy'&&next!=='preview')throw Error('Unknown art mode');mode=next;return mode;}
function paint(g,m,v,c,selected,path,now,cache){
 // Existing map remains authoritative for input, overlays and selection.
 var result=fallback.paint(g,m,v,c,selected,path,now,cache);
 if(mode!=='preview'||!m||!m.settlement204||!root.LSCSettlement)return result;
 var d=m.settlement204,api=root.LSCSettlement,tiles=api.tiles;
 if(!tiles)return result;
 var items=[];
 Object.keys(d.visible||{}).forEach(function(id){
  if(!d.visible[id]||!d.cleared[id]||!tiles[id])return;
  var t=tiles[id],key=id==='0,0'?'hq-l1':d.buildings&&d.buildings[id]&&d.buildings[id].kind==='workshop'?'lumber-l1':null;
  if(!key||!sprites[key]||!sprites[key].ready)return;
  var p=fallback.project(t,c,v);
  items.push({id:id,key:key,x:p.x,y:p.y,depth:p.y});
 });
 sort(items).forEach(function(item){draw(g,item.key,item.x,item.y+c.scale*.14,c.scale*.88);});
 // Preview sprites are painted after the legacy scene; restore the selection
 // indicator so tall art cannot hide the player's active tile.
 if(selected&&tiles[selected]&&d.visible[selected]){
  var focus=fallback.project(tiles[selected],c,v),scale=c.scale;
  g.save();g.beginPath();
  g.moveTo(focus.x,focus.y-scale*.25);
  g.lineTo(focus.x+scale*.5,focus.y);
  g.lineTo(focus.x,focus.y+scale*.25);
  g.lineTo(focus.x-scale*.5,focus.y);
  g.closePath();g.strokeStyle='#ffe79b';g.lineWidth=Math.max(2,scale*.035);g.stroke();g.restore();
 }
 return result;
}
root.LSCArt295=Object.freeze({register:register,draw:draw,sort:sort,setMode:setMode,getMode:function(){return mode;},paint:paint,ready:function(key){return !!(sprites[key]&&sprites[key].ready);},previewAvailable:function(){return !!(sprites['hq-l1']&&sprites['hq-l1'].ready);}}});
})(typeof window!=='undefined'?window:globalThis);
