const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const box={};vm.createContext(box);for(const f of ['worldMapArt','reclamation'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),box);
const r=box.LSCReclamation;
function setup(n){const m={bestPhase:n-1,credits:10000,parts:0,reclamation:{progress:{}}};for(const t of r.zone(n).tiles)m.reclamation.progress[t.id]=t.actions;return m;}
for(const n of [1,13,14]){
 const m=setup(n),t=r.find(m,r.zone(n).town);m.reclamation.progress[t.id]=t.actions-1;
 assert.equal(r.townReward(m,t),50+10*n);
 const before=JSON.stringify(m),failed=r.act(m,t.id,()=>false);
 assert.equal(failed.done,false);assert.equal(failed.rewards.length,0);assert.equal(JSON.stringify(m),before);
 const credits=m.credits,paid=r.act(m,t.id,()=>true);
 assert.equal(paid.done,true);assert.equal(m.credits,credits-t.cost+t.credits+50+10*n);
 assert.ok(paid.rewards.includes('+'+(t.credits+50+10*n)+' CREDITS'));
 assert.equal(r.act(m,t.id,()=>true).ok,false);assert.equal(r.townReward(m,t),0);
 const reloaded=JSON.parse(JSON.stringify(m));assert.equal(r.act(reloaded,t.id,()=>true).ok,false);
}
for(const site of ['armory','medical','artillery']){
 const m=setup(13),t=r.zone(13).tiles.find(t=>t.site===site);assert.ok(t);m.reclamation.progress[t.id]=t.actions-1;
 assert.ok(r.act(m,t.id,()=>true).rewards.some(s=>s.includes('TOWN 13')));
 m.bestPhase=13;m.reclamation.progress[t.id]=t.actions-1;
 assert.equal(r.act(m,t.id,()=>true).rewards.some(s=>/DAMAGE|HEALTH/.test(s)),false);
}
const old=setup(1),town=r.find(old,r.zone(1).town);old.bestPhase=12;old.reclamation.progress[town.id]=town.actions-1;
assert.equal(r.townReward(old,town),0);
if(process.env.CANVAS_MODULE){
 const {createCanvas}=require(process.env.CANVAS_MODULE),c=createCanvas(700,700),ctx=c.getContext('2d');
 const m={bestPhase:0,reclamation:{progress:{'1,0':4}}};
 box.LSCWorldArt.draw(ctx,m,{w:700,h:700},{x:0,y:0,scale:86},r,r.find(m,'1,0'));
 const pixel=(x,y)=>Array.from(ctx.getImageData(x,y,1,1).data).slice(0,3);
 assert.deepEqual(pixel(40,40),[0,0,0]);const gray=pixel(276,340);assert.equal(gray[0],gray[1]);assert.equal(gray[1],gray[2]);
 const color=pixel(448,340);assert.ok(new Set(color).size>1);
 console.log('PASS: production renderer black, grayscale and restored-color pixels.');
}
console.log('PASS: increasing town bounty, persistence rollback, reload/repeat protection and current-town-only bonus announcements.');
