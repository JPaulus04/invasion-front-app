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
 // Keep all legacy overlays, selection and animations until the new scene passes parity checks.
 // Preview mode is opt-in; it cannot silently replace missing assets.
 return fallback.paint(g,m,v,c,selected,path,now,cache);
}
root.LSCArt295=Object.freeze({register:register,draw:draw,sort:sort,setMode:setMode,getMode:function(){return mode;},paint:paint,ready:function(key){return !!(sprites[key]&&sprites[key].ready);}});
})(typeof window!=='undefined'?window:globalThis);
