const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const c={};vm.createContext(c);for(const f of ['reclamation','starTowns'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c);const r=c.LSCStarTowns;
function fresh(){const m={bestPhase:0,credits:500,parts:12};assert.equal(r.initialize(m,()=>true).ok,true);return m;}
function clear(m,id){const t=r.tile(id);for(let i=0;i<t.actions;i++)if(r.status(m,t)!=='reclaimed')assert.equal(r.restore(m,id,()=>true).ok,true,id);}
let m=fresh();assert.equal(r.status(m,r.tile(r.zone(2).town)),'fog');assert.equal(r.ready(m,1),false);const snapshot=JSON.stringify(m);assert.equal(r.restore(m,'1,0',()=>false).ok,false);assert.equal(JSON.stringify(m),snapshot);
clear(m,'1,0');clear(m,'2,0');assert.equal(m.credits,2392,'no town discovery bounty');assert.equal(r.ready(m,1),true);assert.equal(r.rate(m),2,'connected alone gives no town income');assert.equal(r.win(m,1),true);assert.equal(r.rate(m),4);assert.equal(r.win(m,1),false);assert.equal(r.ready(m,1),false);
m=JSON.parse(JSON.stringify(m));assert.equal(r.rate(m),4,'reload retains secured income');
// A discovered or restored disconnected town earns nothing and cannot be defended.
m.starTowns=JSON.parse(JSON.stringify(m.starTowns));const town=r.tile(r.zone(8).town);m.starTowns.progress[town.id]=town.actions;m.starTowns.secured[8]=true;assert.equal(r.rate(m),4);assert.equal(r.ready(m,8),false);
// Reveal and connect can cross districts without defeating Town 2 first.
m=fresh();m.credits=100000;for(let x=1;x<=10;x++)clear(m,x+',0');assert.equal(r.ready(m,2),true);assert.equal(r.held(m),0);assert.equal(r.win(m,2),true);assert.equal(r.ready(m,1),true,'earlier town remains defendable');assert.equal(r.held(m),1);
// Tower no-op is blocked and successful preview is read-only.
const hill=r.tile('0,-2');clear(m,'0,-1');clear(m,'0,-2');let count=r.scouting(m,hill);assert.ok(count>0);let before=JSON.stringify(m);assert.equal(r.tower(m,hill.id,()=>false).ok,false);assert.equal(JSON.stringify(m),before);assert.equal(r.tower(m,hill.id,()=>true).ok,true);assert.equal(r.tower(m,hill.id,()=>true).ok,false);
// Full map explored leaves no useful towers.
m.starTowns=JSON.parse(JSON.stringify(m.starTowns));for(let n=1;n<=81;n++)for(const t of r.zone(n).tiles)m.starTowns.progress[t.id]=t.actions;
assert.equal(r.scouting(m,r.tile(r.zone(2).tiles.find(t=>t.site==='hill').id)),0);assert.equal(r.tower(m,r.zone(2).tiles.find(t=>t.site==='hill').id,()=>true).ok,false);
for(let best=1;best<=20;best++){let old={bestPhase:best,credits:500,parts:12};assert.equal(r.initialize(old,()=>true).ok,true);assert.equal(r.held(old),best);for(let n=1;n<=best;n++)assert.equal(r.network(old).connected.has(r.zone(n).town),true,'migrated town connected '+n);}
const levels=new Set();for(let n=1;n<=81;n++){levels.add(r.stars(n));assert.equal(r.combat(n),n<=3?n:1+(r.stars(n)-1)*5);}assert.equal(levels.size,5);
console.log('PASS: star tiers, connected frontier, nonsequential capture, no discovery bounty, secured income, migration, persistence rollback and zero-benefit tower blocking.');
