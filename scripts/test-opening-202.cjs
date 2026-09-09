const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const c={};vm.createContext(c);for(const f of ['reclamation','starTowns'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c);const r=c.LSCStarTowns;
function fresh(){let m={credits:500,parts:12,bestPhase:0};assert.ok(r.initialize(m,()=>true).ok);return m;}
function clear(m,t){while(r.status(m,t)!=='reclaimed')assert.ok(r.restore(m,t.id,()=>true).ok,'affordable '+t.id);}
function route(m,n){let guard=0;while(!r.ready(m,n)){assert.ok(++guard<100);let o=r.objective(m);assert.ok(o.tile);clear(m,o.tile);}}
let m=fresh();assert.equal(m.credits,2500);r.initialize(m,()=>true);assert.equal(m.credits,2500,'grant once');m=JSON.parse(JSON.stringify(m));r.initialize(m,()=>true);assert.equal(m.credits,2500,'reload no duplicate');
// Spend on an upgrade and multiple optional tiles BEFORE the first defense.
m.credits-=250;
for(const id of ['0,1','1,1','-1,0','-1,-1','0,-1','0,-2'])clear(m,r.tile(id));assert.ok(r.tower(m,'0,-2',()=>true).ok);
let completed=0;for(let n=1;n<=3;n++){route(m,n);const before=m.credits;assert.equal(r.victoryBonus(m,n),600);m.credits+=r.victoryBonus(m,n);assert.ok(r.win(m,n));assert.equal(r.victoryBonus(m,n),0);completed++;console.log('Town',n,'connected and defended; balance',m.credits,'(excludes standard combat rewards)');assert.ok(m.credits>=0);}
assert.equal(completed,3);assert.equal(r.rate(m),8);assert.equal(r.combat(1),1);assert.equal(r.combat(2),2);assert.equal(r.combat(3),3);
// Existing struggling save gets grant once; veteran is unchanged; failure rolls back.
let old={credits:8,parts:12,bestPhase:0,starTowns:{version:201,progress:{},secured:{},towers:{},incomeAt:Date.now()}};let snap=JSON.stringify(old);assert.equal(r.initialize(old,()=>false).ok,false);assert.equal(JSON.stringify(old),snap);assert.ok(r.initialize(old,()=>true).ok);assert.equal(old.credits,2008);
let veteran={credits:900,parts:12,bestPhase:13};assert.ok(r.initialize(veteran,()=>true).ok);assert.equal(veteran.credits,900);
const source=fs.readFileSync('src/centralHQPrototype.js','utf8');assert.ok(source.includes('reward+=expeditionBonus'));assert.ok(source.indexOf('reward+=expeditionBonus')<source.indexOf('var resultSaved=saveMeta()'));
console.log('PASS opening: 3 defenses funded with optional support, a tower and upgrade, without passive income or standard battle rewards; grant rollback and reload protection. Combat wins simulated, not device timed.');
