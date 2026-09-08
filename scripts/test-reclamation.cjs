const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('src/reclamation.js','utf8'),context);
const r=context.LSCReclamation,save=()=>true;
function fresh(){return {bestPhase:0,phase:1,credits:500,parts:12};}
function clear(m,id){const t=r.find(m,id);assert.ok(t,id);while(r.progress(m,t)<t.actions){const result=r.act(m,id,save);assert.equal(result.ok,true,id+': '+result.reason);}return t;}
let m=fresh();assert.equal(r.initialize(m,save,1000).ok,true);assert.equal(r.ready(m,1),false);
assert.equal(r.state(m,r.find(m,'1,0')),'available');assert.equal(r.act(m,'7,0',save).ok,false);
const before=JSON.stringify(m);assert.equal(r.act(m,'1,0',()=>false).ok,false);assert.equal(JSON.stringify(m),before);
assert.equal(r.act(m,'1,0',()=>{throw Error('quota');}).ok,false);assert.equal(JSON.stringify(m),before);
clear(m,'1,0');clear(m,'2,0');assert.equal(m.credits,272,'affordable approach and 60-Credit first town bounty');assert.equal(r.ready(m,1),true);
const done=JSON.stringify(m);assert.equal(r.act(m,'2,0',save).ok,false);assert.equal(JSON.stringify(m),done);
m=JSON.parse(done);assert.equal(r.ready(m,1),true);
const loss=JSON.stringify(m.reclamation);m.phaseLosses={'1':1};assert.equal(JSON.stringify(m.reclamation),loss);
assert.equal(r.bonuses(m,1).hq,0);clear(m,'1,1');assert.equal(r.bonuses(m,1).hq,.1);
const battle=()=>({phase:1,hero:{damage:100},turret:{damage:50},hq:{hp:100,maxHp:100},abilityDamage:100});
let b=battle();r.applyBonuses(m,b);assert.equal(b.hq.hp,110);
b=battle();b.operation=true;r.applyBonuses(m,b);assert.equal(b.hq.hp,100);
b=battle();b.replay=true;r.applyBonuses(m,b);assert.equal(b.hq.hp,100);
m.bestPhase=1;m.phase=2;assert.equal(r.ready(m,1),true);assert.equal(r.ready(m,2),false);assert.equal(r.bonuses(m,2).hq,0);
assert.equal(r.state(m,r.find(m,r.zone(2).entry)),'available');m.credits=100000;
for(let n=2;n<=40;n++){assert.equal(r.phase(m),n);for(const id of r.zone(n).route)clear(m,id);assert.equal(r.ready(m,n),true);m.bestPhase=n;m.phase=n+1;}
const ids=new Set();for(let n=1;n<=40;n++)for(const t of r.zone(n).tiles){assert.ok(!ids.has(t.id),'unique district IDs');ids.add(t.id);}
assert.equal(ids.size,40*49-1);
let old={bestPhase:12,phase:13,credits:4913,parts:13,reclamation:{schema:193,progress:{}}};
for(const t of r.tiles)old.reclamation.progress[t.id]=t.actions;
old.reclamation.progress['1,0']=2;const oldProgress=JSON.stringify(old.reclamation.progress);
assert.equal(r.initialize(old,save,5000).ok,true);assert.equal(JSON.stringify(old.reclamation.progress),oldProgress);assert.equal(old.credits,4913);assert.equal(old.parts,13);
for(const t of r.tiles){const restored=r.find(old,t.id);for(const key of ['actions','cost','credits','parts'])assert.equal(restored[key],t[key]);}
assert.equal(r.progress(old,r.find(old,'1,0')),2);assert.equal(r.phase(old),13);assert.equal(r.income(old,65000).credits,26);
let snapshot=JSON.stringify(old);assert.equal(r.collect(old,()=>false,65000).ok,false);assert.equal(JSON.stringify(old),snapshot);
assert.equal(r.collect(old,save,65000).ok,true);assert.equal(old.credits,4939);assert.equal(r.collect(old,save,65000).ok,false);
assert.equal(r.income(old,0).credits,0);assert.equal(r.income(old,65000+999999999).minutes,480);
old.credits=10000;const hidden=r.find(old,'6,-3');assert.equal(r.visible(old,hidden),false);
assert.equal(r.buildTower(old,'0,-2',save).ok,true);assert.equal(r.visible(old,hidden),true);assert.equal(r.state(old,hidden),'locked');
assert.equal(r.visible(old,r.find(old,'8,-2')),true,'eight tiles revealed');assert.equal(r.visible(old,r.find(old,'9,-2')),false,'nine tiles still hidden');
assert.equal(r.buildTower(old,'0,-2',save).ok,false);assert.equal(r.find(old,'999,999'),null);
let empty=fresh();empty.credits=0;assert.equal(r.act(empty,'1,0',save).ok,false);r.initialize(empty,save,0);assert.equal(r.collect(empty,save,60000).ok,true);assert.equal(empty.credits,2);
let settling=fresh();r.initialize(settling,save,0);r.beforeVictory(settling,60000);settling.bestPhase=1;assert.equal(settling.credits,502);assert.equal(r.income(settling,120000).credits,4);
const source=fs.readFileSync('src/centralHQPrototype.js','utf8');
assert.ok(source.indexOf('window.LSCReclamation.ready(meta,settings.phase)')<source.indexOf('if(!reserveEnergy(settings.energySpend))'));
assert.ok(source.includes('window.LSCReclamation.applyBonuses(meta,created)'));
assert.ok(source.includes('else if(run.replay||won)returnHome()'));
console.log('PASS: 40-town expansion, affordable first approach, migration, rollback, reload, gating, bonuses, loss/replay/operations isolation, 8-tile towers, one-time rewards and capped income.');
