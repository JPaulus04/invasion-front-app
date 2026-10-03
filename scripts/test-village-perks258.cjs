const assert=require('node:assert/strict');
require('../src/settlement204.js');require('../src/settlement205.js');const a=global.LSCSettlement;
function world(){const m={credits:5000};a.initialize(m,()=>true,1000);const d=m.settlement204;Object.keys(a.tiles).forEach(k=>{d.visible[k]=true;d.roads[k]=true;});a.towns.forEach(t=>{d.defended[t.id]=d.welcomed[t.id]=true;});d.villageDevelopment={};return m;}
function close(x,y){assert.ok(Math.abs(x-y)<1e-8,`${x} != ${y}`);}
const m=world(),d=m.settlement204,base={storage:a.storage(m),food:a.foodUse(m),wood:a.materialRate(m),stone:a.stoneRate(m),iron:a.ironRate(m),radius:a.surveyRadius(m),build:a.speed(m,{kind:'house',crew:2}),study:a.speed(m,{kind:'study',crew:2}),income:a.income(m)};
for(let id=1;id<=6;id++)d.villageDevelopment[id]={level:2,target:0,workers:0};
assert.equal(a.storage(m),base.storage+1500);close(a.foodUse(m),base.food*.9);close(a.materialRate(m),base.wood*1.1);close(a.stoneRate(m),base.stone*1.15);close(a.ironRate(m),base.iron*1.15);assert.equal(a.surveyRadius(m),base.radius+1);close(a.speed(m,{kind:'house',crew:2}),base.build*1.15);close(a.speed(m,{kind:'study',crew:2}),base.study);assert.equal(a.income(m),base.income+6);
for(let id=1;id<=6;id++)d.villageDevelopment[id].level=3;
assert.equal(a.storage(m),base.storage+3000);close(a.foodUse(m),base.food*.8);assert.equal(a.surveyRadius(m),base.radius+2);
const extra=a.towns.find(t=>t.id>6&&a.townProfile(t.id).theme==='woodland');assert.ok(extra);d.villageDevelopment[extra.id]={level:3};close(a.materialRate(m),base.wood*1.2);assert.equal(a.storage(m),base.storage+4000,'depots stack but production specialties do not');
const cap=a.storage(m);d.materials=cap;assert.match(a.villageProductionStatus(m,1),/paused/);d.materials=100;assert.match(a.villageProductionStatus(m,1),/3.00 Timber/);
d.roads={};assert.equal(a.storage(m),cap,'permanent capacity survives supply loss');close(a.foodUse(m),base.food);assert.equal(a.surveyRadius(m),base.radius);assert.match(a.villageProductionStatus(m,1),/Inactive/);
// An established over-cap save never loses stock when loaded or disconnected.
d.materials=cap+100;const saved=JSON.stringify(m);a.initialize(m,()=>true,d.at);assert.equal(JSON.stringify(m),saved);a.tick(m,()=>true,d.at+60000);assert.equal(m.settlement204.materials,cap+100);
console.log('PASS: all six specialties, level scaling, strongest-only bonuses, permanent stacked storage, supply loss, honest production status and veteran save preservation.');
