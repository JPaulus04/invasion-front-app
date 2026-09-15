const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
require('../src/settlement204.js');require('../src/settlement205.js');
const a=global.LSCSettlement,save=()=>true,m={credits:500};let now=100000;
const act=(kind,p={})=>{const r=a.action(m,save,kind,p,now);assert.ok(r.ok,r.message);return r;};
const advance=seconds=>{now+=seconds*1000;assert.ok(a.tick(m,save,now).ok);assert.ok(a.workers(m).available>=0);assert.ok(m.settlement204.food>=0&&m.settlement204.materials>=0&&m.settlement204.stone>=0);};
assert.ok(a.initialize(m,save,now).ok);assert.equal(m.settlement204.population,6);assert.equal(m.credits,900);assert.equal(m.settlement204.materials,120);assert.equal(a.housing(m),8);assert.equal(a.survivors(1),2);assert.equal(a.survivors(10),4);
assert.equal(a.placement(m,'quarry','2,0',[]).ok,false,'not every tile is a deposit');assert.equal(a.placement(m,'workshop','0,1',[]).ok,false,'new lumber camps cannot be placed on hills');
act('build',{type:'quarry',id:'0,1',crew:1});act('scout',{id:'2,0',crew:1});act('research',{node:'tools',crew:1});assert.equal(a.workers(m).builders,1);assert.equal(a.workers(m).scouts,1);assert.equal(a.workers(m).scholars,1);
advance(121);assert.ok(m.settlement204.buildings['0,1']);assert.ok(a.learned(m,'tools'));assert.ok(m.settlement204.visible['5,0']);assert.equal(a.productionCapacity(m,'quarry'),2);
act('connection',{town:1,crew:1});advance(300);
// Combat has its own regression tests: model a successful defense after two minutes.
advance(120);m.settlement204.defended[1]=true;act('welcome',{town:1});assert.equal(m.settlement204.population,8);assert.equal(a.action(m,save,'welcome',{town:1},now).ok,false,'survivors cannot be claimed twice');
act('research',{node:'masonry',crew:1});advance(121);
while(!a.villageUpgrade(m).ok&&now<100000+15*60000)advance(10);
assert.ok(a.villageUpgrade(m).ok,a.villageUpgrade(m).message);const elapsed=(now-100000)/60000;act('upgradeVillage');assert.equal(a.villageLevel(m),2);assert.equal(a.housing(m),12);assert.equal(a.storage(m),700);assert.equal(a.productionCapacity(m,'quarry'),4);
assert.equal(a.villageUpgrade(m).ok,false,'higher upgrade needs population and research');
const later=JSON.parse(JSON.stringify(m));later.credits=5000;later.settlement204.population=12;later.settlement204.materials=500;later.settlement204.stone=500;
assert.ok(a.action(later,save,'research',{node:'stonecutting',crew:1},now).ok);assert.equal(later.settlement204.stone,480,'Stoneworking charges its displayed Stone cost');assert.ok(a.tick(later,save,now+181000).ok);assert.ok(a.learned(later,'stonecutting'));assert.ok(a.villageUpgrade(later).ok);assert.ok(a.action(later,save,'upgradeVillage',{},now+181000).ok);assert.equal(a.villageLevel(later),3);assert.equal(a.housing(later),16);assert.equal(a.storage(later),900);assert.equal(a.defenseBonuses(later).hq,.1);assert.equal(a.action(later,save,'upgradeVillage',{},now+181000).ok,false,'no duplicate or unimplemented upgrade');
const snapshot=JSON.stringify(m);assert.equal(a.action(m,()=>false,'priority',{value:'growth'},now+60000).ok,false);assert.equal(JSON.stringify(m),snapshot,'resource accrual and edits roll back on save failure');
// Disconnect a quarry: production must stop even when its staffing target remains.
const q=JSON.parse(JSON.stringify(m));q.settlement204.buildings['20,0']={kind:'quarry',workers:2};q.settlement204.buildings['0,1'].workers=0;assert.equal(a.rates(q).stone,0);
q.settlement204.stone=a.storage(q);a.rebalance(q);assert.equal(q.settlement204.buildings['0,1'].workers,0,'full stone storage releases miners');
// Produce a real 221 save, then migrate it with earned stock/population and pending jobs.
const veteran=JSON.parse(fs.readFileSync(__dirname+'/fixtures/settlement221.json','utf8'));veteran.settlement204.at=now;veteran.settlement204.population=18;veteran.settlement204.materials=811;veteran.settlement204.food=777;veteran.settlement204.knowledge={masonry:false};
const before=JSON.stringify(veteran);assert.equal(a.initialize(veteran,()=>false,now).ok,false);assert.equal(JSON.stringify(veteran),before,'failed migration leaves the entire campaign intact');assert.ok(a.initialize(veteran,save,now).ok);assert.equal(veteran.settlement204.population,18);assert.equal(veteran.settlement204.materials,811);assert.equal(veteran.settlement204.food,777);assert.equal(veteran.settlement204.housingBase,12);
const migrated=JSON.stringify(veteran);assert.ok(a.initialize(veteran,save,now).ok);assert.equal(JSON.stringify(veteran),migrated,'migration only runs once');
assert.ok(veteran.settlement204.queue[0].payload.legacyWorkshop222,'legacy hill workshop order retains placement permission');assert.ok(a.tick(veteran,save,now+120000).ok);assert.equal(veteran.settlement204.buildings['1,1'].kind,'workshop','legacy queued workshop completes after migration');
console.log('PASS 222: six-worker opening; simultaneous crews; deposits and production; survivors; upgrade in '+elapsed.toFixed(1)+' simulated minutes (including 2-minute defense allowance); storage; disconnection; failed saves; veteran migration.');
