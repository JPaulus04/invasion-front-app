const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
require('../src/settlement204.js');require('../src/settlement205.js');const api=global.LSCSettlement;
function world(){const m={credits:5000};assert.ok(api.initialize(m,()=>true,1000).ok);const d=m.settlement204;
 d.food=300;d.materials=300;d.stone=200;d.population=20;d.housingBase=30;d.priority='manual';d.targets={farm:2,workshop:0,quarry:0,ironMine:0};
 for(let x=0;x<=5;x++){d.visible[x+',0']=true;d.cleared[x+',0']=true;d.roads[x+',0']=true;}
 d.scout=null;d.study=null;d.job=null;d.projects=[];d.queue=[];api.rebalance(m);return m;}
function act(m,kind,payload,save=()=>true,at=m.settlement204.at){return api.action(m,save,kind,payload,at);}
let m=world(),d=m.settlement204;
const original=JSON.stringify(m);assert.ok(api.initialize(m,()=>true,1000).ok);assert.equal(JSON.stringify(m),original,'old campaigns reopen without migration changes');
assert.equal(api.villageDevelopment(m,1).rate,0,'connected but undefeated produces nothing');
assert.equal(act(m,'villageStaff',{town:1,count:1}).ok,false);
d=m.settlement204;d.defended[1]=true;
let v=api.villageDevelopment(m,1);assert.equal(v.base,1);assert.equal(v.rate,1,'defense + connection grants automatic output before welcome');
assert.equal(v.level,1);assert.equal(v.workers,0);
const timber=d.materials;assert.ok(api.tick(m,()=>true,d.at+60000).ok);assert.ok(Math.abs(m.settlement204.materials-timber-1)<1e-6,'one minute accrues the advertised base');
assert.ok(act(m,'welcome',{town:1}).ok);d=m.settlement204;
assert.ok(act(m,'villageStaff',{town:1,count:2}).ok);v=api.villageDevelopment(m,1);
assert.equal(v.workers,2);assert.equal(v.rate,2.5);assert.equal(api.workers(m).villagers,2);assert.ok(api.workers(m).available>=0);
assert.equal(api.rates(m).materials,2.5,'village output appears in economy totals');
const beforeUpgrade={credits:m.credits,timber:d.materials,stone:d.stone};
assert.ok(act(m,'developVillage',{town:1}).ok);v=api.villageDevelopment(m,1);
assert.equal(v.level,1,'benefits wait until completion');assert.equal(act(m,'developVillage',{town:1}).ok,false,'duplicate upgrade blocked');d=m.settlement204;assert.equal(m.credits,beforeUpgrade.credits-200);assert.equal(d.materials,beforeUpgrade.timber-40);assert.equal(d.stone,beforeUpgrade.stone-20);api.advance(m,d.at+(api.eta(m,api.developmentJob(m,1))+1)*1000);v=api.villageDevelopment(m,1);assert.equal(v.level,2);assert.equal(v.rate,5);
assert.equal(act(m,'developVillage',{town:1}).ok,false,'level 3 requires HQ level 2');
d=m.settlement204;d.villageLevel=2;m.credits=5000;d.materials=300;d.stone=200;
assert.ok(act(m,'developVillage',{town:1}).ok);api.advance(m,m.settlement204.at+(api.eta(m,api.developmentJob(m,1))+1)*1000);assert.equal(api.villageDevelopment(m,1).level,3);
assert.equal(act(m,'developVillage',{town:1}).ok,false,'maximum level enforced');
for(const count of [-1,1.5,5,NaN,Infinity])assert.equal(act(m,'villageStaff',{town:1,count}).ok,false,'invalid staff '+count);
d=m.settlement204;const target=d.villageDevelopment[1].target;delete d.roads['3,0'];api.rebalance(m);
assert.equal(api.villageDevelopment(m,1).rate,0);assert.equal(api.villageWorkers(m),0,'disconnection releases workers');assert.equal(d.villageDevelopment[1].target,target);
d.roads['3,0']=true;api.rebalance(m);assert.equal(api.villageDevelopment(m,1).workers,target,'reconnection resumes staffing');
d.materials=api.storage(m);api.rebalance(m);assert.equal(api.villageWorkers(m),0,'full storage releases staff');
const capped=d.materials;assert.ok(api.tick(m,()=>true,d.at+60000).ok);assert.equal(m.settlement204.materials,capped,'base production respects storage');
d=m.settlement204;d.materials=100;api.rebalance(m);assert.equal(api.villageWorkers(m),target,'staff resume after storage opens');
let saved=JSON.stringify(m);assert.equal(act(m,'villageStaff',{town:1,count:0},()=>false).ok,false);assert.equal(JSON.stringify(m),saved,'failed staffing save rolls back');
m=world();d=m.settlement204;d.defended[1]=d.welcomed[1]=true;api.rebalance(m);saved=JSON.stringify(m);
assert.equal(act(m,'developVillage',{town:1},()=>false).ok,false);assert.equal(JSON.stringify(m),saved,'failed upgrade save restores resources and level');
assert.equal(act(m,'developVillage',{town:999}).ok,false);
// Long offline advancement must equal minute-by-minute advancement.
const a=JSON.parse(JSON.stringify(m)),b=JSON.parse(JSON.stringify(m));
assert.ok(api.tick(a,()=>true,d.at+3600000).ok);for(let i=1;i<=60;i++)assert.ok(api.tick(b,()=>true,d.at+i*60000).ok);
assert.ok(Math.abs(a.settlement204.materials-b.settlement204.materials)<1e-6);assert.equal(a.credits,b.credits);
// Exhausted workers cannot be double-assigned or taken away from protected food.
m=world();d=m.settlement204;d.defended[1]=d.welcomed[1]=true;d.population=2;api.rebalance(m);
assert.equal(act(m,'villageStaff',{town:1,count:2}).ok,false);assert.ok(api.workers(m).available>=0);
// Exercise the actual panel function against a minimal DOM adapter.
m=world();d=m.settlement204;d.defended[1]=d.welcomed[1]=true;api.rebalance(m);
const view=fs.readFileSync('src/settlementView205.js','utf8');const start=view.indexOf('  function developmentPanel(){'),end=view.indexOf('  function inspect(){',start);assert.ok(start>=0&&end>start);
const lines=[],buttons=[],ctx={developmentControl275:(id,label,cost,enabled)=>buttons.push({label,disabled:!enabled}),api,m,selected:'5,0',line:t=>lines.push(t),button:(label,fn,disabled)=>buttons.push({label,fn,disabled}),execute:(kind,payload)=>act(m,kind,payload),update:()=>{}};
vm.createContext(ctx);vm.runInContext(view.slice(start,end)+'developmentPanel();',ctx);
assert.ok(lines.some(s=>s.includes('Automatic: 1/min')));assert.ok(buttons.find(b=>b.label==='DEVELOP TO LEVEL 2'&&!b.disabled));
buttons.find(b=>b.label==='+ WORKER').fn();assert.equal(api.villageDevelopment(m,1).workers,1,'panel assigns to selected village');
console.log('PASS: legacy saves, defense/connection gates, welcome, passive/staffed production, upgrade costs and HQ gate, worker accounting, disconnection/reconnection, storage, offline parity, rollback and development controls.');
