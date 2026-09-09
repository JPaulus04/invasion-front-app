(function(root){
  'use strict';
  // Original canvas cartography. Global coordinates keep rivers and ground continuous.
  function noise(x,y,seed){var n=Math.sin(x*127.1+y*311.7+(seed||0)*74.7)*43758.5453;return n-Math.floor(n);}
  function terrain(t){
    if(t.site==='hill')return 'highland';
    var river=4+Math.sin(t.y*.23)*3+Math.sin(t.y*.071)*4;
    if(Math.abs(t.x-river)<.65)return 'water';
    if(Math.abs(t.x-river)<1.4)return 'bank';
    var elevation=Math.sin(t.x*.37)+Math.cos(t.y*.29)+Math.sin((t.x+t.y)*.19);
    return elevation>1.5?'highland':elevation<-.7?'meadow':'forest';
  }
  function draw(ctx,meta,view,camera,api,selected){
    var scale=camera.scale,hits=[],visible=[],known=new Set(),supply=api.supply(meta);
    function point(t){return {x:(t.x-camera.x)*scale+view.w/2,y:(t.y-camera.y)*scale+view.h/2};}
    ctx.fillStyle='#000000';ctx.fillRect(0,0,view.w,view.h);
    for(var n=1;n<=api.phase(meta);n++){
      var z=api.zone(n),center=point(z);
      if(center.x+4*scale<0||center.x-4*scale>view.w||center.y+4*scale<0||center.y-4*scale>view.h)continue;
      z.tiles.forEach(function(t){
        var p=point(t);if(p.x+scale<0||p.x-scale>view.w||p.y+scale<0||p.y-scale>view.h)return;
        var state=api.state(meta,t);hits.push({t:t,x:p.x,y:p.y});
        if(state==='fog'){
          ctx.fillStyle='#000000';ctx.fillRect(p.x-scale/2,p.y-scale/2,scale+1,scale+1);return;
        }
        known.add(t.id);visible.push({t:t,p:p,state:state,z:z});
        ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale/64,scale/64);
        var type=terrain(t),restored=state==='reclaimed',palette={forest:['#3e613c','#577344'],meadow:['#69764c','#839158'],highland:['#6a7062','#828774'],water:['#285362','#316577'],bank:['#7b7854','#939068']};
        ctx.fillStyle=palette[type][restored?1:0];ctx.fillRect(-32,-32,65,65);
        // Soft, globally aligned vegetation patches break up uniform square surfaces.
        ctx.save();ctx.beginPath();ctx.rect(-32,-32,64,64);ctx.clip();
        for(var patch=0;patch<5;patch++){
          var px=noise(t.x,t.y,patch+120)*80-40,py=noise(t.y,t.x,patch+140)*80-40;
          ctx.fillStyle=patch%2?'rgba(197,205,139,.04)':'rgba(18,44,28,.05)';
          ctx.beginPath();ctx.ellipse(px,py,18+noise(t.x,t.y,patch)*16,8+noise(t.y,t.x,patch)*12,noise(t.x,t.y,patch+5)*3,0,Math.PI*2);ctx.fill();
        }
        ctx.restore();
        // Stable granular ground detail.
        for(var k=0;k<12;k++){
          ctx.fillStyle=k%2?'rgba(210,216,164,.12)':'rgba(18,38,25,.16)';
          ctx.fillRect(noise(t.x,t.y,k)*62-31,noise(t.y,t.x,k+30)*62-31,type==='water'?8:2,type==='water'?1:2);
        }
        // A continuous winding channel crosses tile edges; tile ownership stays unchanged.
        ctx.save();ctx.beginPath();ctx.rect(-32,-32,64,64);ctx.clip();
        ctx.beginPath();for(var step=0;step<=8;step++){var gy=t.y-.6+step*.15,gx=4+Math.sin(gy*.23)*3+Math.sin(gy*.071)*4;var rx=(gx-t.x)*64,ry=(gy-t.y)*64;if(step===0)ctx.moveTo(rx,ry);else ctx.lineTo(rx,ry);}
        ctx.strokeStyle='#898563';ctx.lineWidth=56;ctx.stroke();ctx.strokeStyle=restored?'#316577':'#285362';ctx.lineWidth=35;ctx.stroke();ctx.restore();
        if(type==='water'){
          ctx.strokeStyle='#508393';ctx.lineWidth=.6;for(var wave=0;wave<4;wave++){var wy=wave*15-22;ctx.beginPath();ctx.moveTo(-24,wy);ctx.quadraticCurveTo(-8,wy-3,10,wy);ctx.stroke();}
        }else if(!t.site&&t.kind==='grove'&&!t.required){
          if(type==='forest')for(var tree=0;tree<4+Math.floor(noise(t.x,t.y,88)*5);tree++){
            var a=noise(t.x,t.y,tree+70)*44-22,b=noise(t.y,t.x,tree+90)*44-20;
            ctx.fillStyle='#263d2c';ctx.beginPath();ctx.ellipse(a+3,b+6,8,4,0,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#675b3b';ctx.fillRect(a-1,b,2,10);
            ctx.fillStyle=restored?'#294e30':'#304833';ctx.beginPath();ctx.moveTo(a,b-14);ctx.lineTo(a-9,b+6);ctx.lineTo(a+9,b+6);ctx.fill();
            ctx.fillStyle=restored?'#659153':'#5d7950';ctx.beginPath();ctx.moveTo(a,b-14);ctx.lineTo(a,b+4);ctx.lineTo(a-7,b+4);ctx.fill();
          }
          if(type==='highland')rocks(ctx,t);
          if(type==='meadow'){ctx.strokeStyle='#a09b61';ctx.lineWidth=.7;for(var tuft=0;tuft<10;tuft++){var tx=noise(t.x,t.y,tuft+170)*54-27,ty=noise(t.y,t.x,tuft+190)*54-27;ctx.beginPath();ctx.moveTo(tx-2,ty-3);ctx.lineTo(tx,ty);ctx.lineTo(tx+2,ty-4);ctx.stroke();}}
        }
        if(!restored){ctx.fillStyle='rgba(25,34,30,.18)';ctx.fillRect(-32,-32,65,65);}
        ctx.restore();
      });
    }
    // Supply roads are continuous between previously secured towns and the frontier.
    visible.forEach(function(v){
      var t=v.t,p=v.p,road=supply.has(t.id)||t.required;
      if(!road)return;var connections=[];
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var id=(t.x+d[0])+','+(t.y+d[1]),other=api.find(meta,id);if((supply.has(id)||other&&other.required)&&(known.has(id)||id==='0,0'))connections.push(d);});
      ctx.lineCap='square';ctx.strokeStyle=terrain(t)==='water'?'#b4a078':'#827a60';ctx.lineWidth=scale*.19;
      if(!connections.length)connections=[[0,0]];
      connections.forEach(function(d){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+d[0]*scale*.52+.01,p.y+d[1]*scale*.52);ctx.stroke();});
      ctx.strokeStyle='#b9af85';ctx.lineWidth=scale*.025;connections.forEach(function(d){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+d[0]*scale*.5,p.y+d[1]*scale*.5);ctx.stroke();});
    });
    visible.forEach(function(v){
      var t=v.t,p=v.p,state=v.state,isTown=t.id===v.z.town,restored=state==='reclaimed';
      ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale/64,scale/64);
      if(isTown){
        ctx.fillStyle='#797962';ctx.beginPath();ctx.moveTo(-27,-15);ctx.lineTo(-17,-27);ctx.lineTo(18,-24);ctx.lineTo(27,-10);ctx.lineTo(23,21);ctx.lineTo(5,27);ctx.lineTo(-25,18);ctx.closePath();ctx.fill();
        [[-17,-17,11,13],[1,-18,15,11],[-19,4,12,14],[2,1,16,18]].forEach(function(b){house(ctx,b[0]+noise(t.x,b[1],t.zone)*4-2,b[1]+noise(t.y,b[0],t.zone)*4-2,b[2],b[3],(api.isSecured?api.isSecured(meta,t.zone):t.zone<=Number(meta.bestPhase))?'#b39263':'#807d68');});
        ctx.fillStyle='#d4c99c';ctx.fillRect(-4,-24,4,48);ctx.fillRect(-25,-2,50,3);
        ctx.strokeStyle='#d8d1ac';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(19,18);ctx.lineTo(19,-3);ctx.stroke();ctx.fillStyle=(api.isSecured?api.isSecured(meta,t.zone):t.zone<=Number(meta.bestPhase))?'#79b989':'#e2b967';ctx.fillRect(20,-3,10,6);
      }else if(t.site==='hill'){
        rocks(ctx,t);ctx.strokeStyle='#aab19a';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(0,7,24,13,0,0,Math.PI*2);ctx.stroke();
        if(meta.reclamation&&meta.reclamation.towers&&meta.reclamation.towers[t.id]){
          ctx.strokeStyle='#dfc48b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,14);ctx.lineTo(-4,-21);ctx.lineTo(4,-21);ctx.lineTo(10,14);ctx.moveTo(-8,6);ctx.lineTo(7,-11);ctx.moveTo(8,6);ctx.lineTo(-7,-11);ctx.stroke();
          ctx.fillStyle='#d4ba7d';ctx.fillRect(-9,-26,18,7);ctx.strokeStyle='#a4d6ce';ctx.beginPath();ctx.arc(0,-29,13,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
        }
      }else if(t.site||t.kind==='depot'){
        ctx.fillStyle='#4c5447';ctx.fillRect(-22,-20,44,40);house(ctx,-16,-10,32,22,restored?'#a89872':'#7b7c69');
        ctx.fillStyle='#303d37';ctx.fillRect(-18,17,12,6);ctx.fillRect(8,17,10,6);
        ctx.fillStyle=t.site==='medical'?'#d3e3c1':'#dbbc73';
        if(t.site==='medical'){ctx.fillRect(-2,-7,4,13);ctx.fillRect(-6,-3,12,4);}else if(t.site==='artillery'){
          ctx.fillStyle='#374a42';ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d8d0a2';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(15,-15);ctx.stroke();
        }else if(t.site==='armory'){ctx.fillStyle='#34433c';ctx.fillRect(-15,-5,30,7);ctx.fillStyle='#e7c77e';ctx.fillRect(-12,-4,24,2);ctx.fillRect(5,2,4,9);ctx.fillRect(-10,-11,5,7);}else{ctx.fillRect(-5,-3,10,4);}
        if(t.kind==='depot'&&!t.site){ctx.fillStyle='#bd9b60';ctx.fillRect(-23,8,9,8);ctx.fillRect(14,5,10,10);ctx.strokeStyle='#665334';ctx.strokeRect(14,5,10,10);}

      }else if(t.kind==='cache'){
        [[-12,-6],[3,1],[-7,9]].forEach(function(c){ctx.fillStyle='#293b30';ctx.fillRect(c[0]+2,c[1]+3,12,9);ctx.fillStyle='#b29965';ctx.fillRect(c[0],c[1],12,9);ctx.strokeStyle='#665b3d';ctx.lineWidth=1;ctx.strokeRect(c[0],c[1],12,9);ctx.beginPath();ctx.moveTo(c[0]+6,c[1]);ctx.lineTo(c[0]+6,c[1]+9);ctx.stroke();});
      }
      if(t.site&&scale>55){ctx.fillStyle='#10251edf';ctx.fillRect(-23,-30,46,9);ctx.fillStyle='#e8dec0';ctx.font='bold 7px system-ui';ctx.textAlign='center';ctx.fillText({armory:'ARMORY',medical:'MEDICAL',artillery:'ARTILLERY',hill:'SCOUT'}[t.site],0,-23);}
      ctx.restore();
      // Desaturate every visible but unfinished tile, including its structures and roads.
      // Gold selection / route outlines are UI markers, drawn afterward.
      if(!restored){ctx.save();ctx.globalCompositeOperation='saturation';ctx.fillStyle='#808080';ctx.fillRect(p.x-scale/2,p.y-scale/2,scale,scale);ctx.restore();}
      if(!api.stars&&t.required&&t.zone===api.phase(meta)){ctx.strokeStyle=restored?'#9ab878':'#d9b967';ctx.lineWidth=1.5;ctx.strokeRect(p.x-scale*.47,p.y-scale*.47,scale*.94,scale*.94);}
      if(scale>42&&(isTown||restored||t.required||selected.id===t.id)){
        var label=isTown?((api.isSecured?api.isSecured(meta,t.zone):t.zone<=Number(meta.bestPhase))?'HELD '+t.zone:'TOWN '+t.zone):restored?'✓':api.progress(meta,t)+'/'+t.actions;
        if(isTown&&api.stars){ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillStyle='#142523';ctx.fillRect(p.x-24,p.y-scale*.45,48,13);ctx.fillStyle='#eed681';ctx.fillText('★'.repeat(api.stars(t.zone)),p.x,p.y-scale*.45+10);}
        ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillStyle='#11271dd9';ctx.fillRect(p.x-23,p.y+scale*.28,46,13);ctx.fillStyle='#f1e6bb';ctx.fillText(label,p.x,p.y+scale*.28+10);
      }
      if(selected.id===t.id){ctx.strokeStyle='#ffe7a6';ctx.lineWidth=3;ctx.strokeRect(p.x-scale*.46,p.y-scale*.46,scale*.92,scale*.92);}
    });
    var hq=point({x:0,y:0});ctx.save();ctx.translate(hq.x,hq.y);ctx.scale(scale/64,scale/64);ctx.fillStyle='#5d705a';ctx.fillRect(-32,-32,64,64);ctx.strokeStyle='#d5c496';ctx.lineWidth=3;ctx.strokeRect(-23,-23,46,46);house(ctx,-15,-12,30,24,'#a4aa8f');ctx.fillStyle='#f3df9b';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('HQ',0,27);ctx.restore();
    return hits;
  }
  function house(ctx,x,y,w,h,roof){ctx.fillStyle='rgba(8,22,17,.35)';ctx.fillRect(x+3,y+5,w,h);ctx.fillStyle='#c0b497';ctx.fillRect(x,y,w,h);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(x-2,y+2);ctx.lineTo(x+w/2,y-6);ctx.lineTo(x+w+2,y+2);ctx.lineTo(x+w,y+8);ctx.lineTo(x,y+8);ctx.fill();ctx.fillStyle='#2b433e';ctx.fillRect(x+w*.4,y+h-6,5,6);ctx.fillStyle='#d9d9ac';ctx.fillRect(x+3,y+10,3,3);}
  function rocks(ctx,t){for(var r=0;r<4;r++){var x=noise(t.x,t.y,r+1)*28-14,y=noise(t.y,t.x,r+9)*22-5;ctx.fillStyle='#444f49';ctx.beginPath();ctx.moveTo(x-13,y+10);ctx.lineTo(x-5,y-14);ctx.lineTo(x+6,y-19);ctx.lineTo(x+16,y+8);ctx.fill();ctx.fillStyle='#a1a28b';ctx.beginPath();ctx.moveTo(x-5,y-14);ctx.lineTo(x+6,y-19);ctx.lineTo(x+3,y+3);ctx.lineTo(x-13,y+10);ctx.fill();}}
  root.LSCWorldArt=Object.freeze({terrain:terrain,draw:draw});
})(typeof window!=='undefined'?window:globalThis);
