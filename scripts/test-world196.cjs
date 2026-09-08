const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const balance=require('../src/balance.js');
assert.equal(balance.campaignPressure(1),1);assert.equal(balance.campaignPressure(6),1);
assert.equal(balance.campaignPressure(13),.9475);assert.equal(balance.campaignPressure(22),.88);assert.equal(balance.campaignPressure(100),.88);
for(let n=7;n<60;n++)assert.ok(balance.campaignPressure(n)<=balance.campaignPressure(n-1));
const context={};vm.createContext(context);for(const file of ['worldMapArt','reclamation'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),context);
const r=context.LSCReclamation,a=context.LSCWorldArt,m={bestPhase:12,credits:4000,parts:13};
const supply=r.supply(m);assert.ok(supply.has('0,0'));assert.ok(supply.has(r.zone(13).entry));assert.ok(!supply.has(r.zone(13).town),'supply does not clear current approach');
const seen=new Set(['0,0']),queue=['0,0'];while(queue.length){const id=queue.shift(),[x,y]=id.split(',').map(Number);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const next=(x+dx)+','+(y+dy);if(supply.has(next)&&!seen.has(next)){seen.add(next);queue.push(next);}}}assert.equal(seen.size,supply.size,'all supply roads physically connected');
for(let n=1;n<=12;n++)assert.ok(supply.has(r.zone(n).town));
const terrain=new Set();for(let n=1;n<=13;n++)for(const t of r.zone(n).tiles){terrain.add(a.terrain(t));assert.equal(a.terrain(t),a.terrain({...t}));}
for(const type of ['forest','meadow','highland','water','bank'])assert.ok(terrain.has(type));
assert.equal(r.ready(m,13),false);assert.equal(r.buildTower(m,r.zone(13).entry,()=>true).ok,false,'cannot build tower on a road');
assert.equal(m.credits,4000);assert.equal(m.reclamation,undefined,'cartography does not mutate saves');
console.log('PASS: capped arrival pressure, connected historical supply routes, no current-town bypass, stable terrain variety and hill-only construction.');
