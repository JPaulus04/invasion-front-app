const assert=require('node:assert/strict');
require('../src/settlement204.js');
require('../src/settlementView204.js');
require('../src/settlement205.js');
require('../src/isometricMap221.js');
require('../src/settlementView205.js');
const iso=global.LSCIso221,api=global.LSCSettlement;
const v={w:390,h:844},points=Object.values(api.tiles);
for(const scale of [8,38,80,150]){
 const c={x:2.7,y:-4.2,scale};
 for(const t of points){
  const p=iso.project(t,c,v),back=iso.unproject(p.x,p.y,c,v);
  assert.ok(Math.abs(back.x-t.x)<1e-10&&Math.abs(back.y-t.y)<1e-10,'round-trip tile coordinates');
  const inside=iso.project({x:t.x+.49,y:t.y-.49},c,v),hit=iso.unproject(inside.x,inside.y,c,v);
  assert.equal(Math.round(hit.x)+','+Math.round(hit.y),t.id,'diamond edge hit belongs to its tile');
 }
}
for(const top of [150,220])for(const bottom of [90,360]){
 const c={};iso.fit(c,v,points,top,bottom);
 for(const t of points){const p=iso.project(t,c,v);assert.ok(p.x>=0&&p.x<=v.w&&p.y>=top&&p.y<=v.h-bottom,'fit avoids overlays');}
 iso.clamp(c,v,points,top,bottom);const before=JSON.stringify(c);iso.clamp(c,v,points,top,bottom);assert.equal(JSON.stringify(c),before,'camera clamp is stable');
}
const m={credits:500},now=Date.now();assert.ok(api.initialize(m,()=>true,now).ok);
const snapshot=JSON.stringify(m);assert.ok(api.initialize(m,()=>true,now).ok);assert.equal(JSON.stringify(m),snapshot,'existing campaign unchanged by reopening');
const pen=new Proxy({measureText:t=>({width:t.length*7})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
function readOnlyPaint(){const before=JSON.stringify(m);global.LSCSettlementView.paint(pen,m,v,{x:0,y:0,scale:80},'0,0',[],now+1000);assert.equal(JSON.stringify(m),before,'rendering cannot alter resources, map or jobs');}
readOnlyPaint();
const id=Object.keys(m.settlement204.visible).find(id=>api.placement(m,'road',id,[]).ok);
assert.ok(id,'opening has a valid road site');assert.ok(api.action(m,()=>true,'quickRoad',{id,type:'road',crew:1},now).ok);readOnlyPaint();
const before=JSON.stringify(m);assert.equal(api.action(m,()=>false,'tick',{},now).ok,false);assert.equal(JSON.stringify(m),before,'failed save rolls back');
console.log('PASS 221: tile hits at four zoom levels, overlay-aware fit, stable camera, retained campaign, active job rendering and save rollback.');
