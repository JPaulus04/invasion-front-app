const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const api=require('../src/commanders260');
const today=new Date(2026,9,3,12).getTime(),tomorrow=new Date(2026,9,4,12).getTime();
const veteran={commander:20,credits:100000,equipment:[{uid:'my-weapon'}],equipped:{weapon:'my-weapon'}};
api.ensure(veteran);assert.equal(veteran.commanderCollection.units.holt.level,20);
const once=JSON.stringify(veteran);api.ensure(veteran);assert.equal(JSON.stringify(veteran),once,'migration is idempotent');
assert.deepEqual(veteran.equipped,{weapon:'my-weapon'});assert.deepEqual(veteran.equipment,[{uid:'my-weapon'}]);
assert.ok(api.pool(veteran).every(x=>x.id!=='holt'),'no wasted max-level draws');
assert.ok(Math.abs(api.pool(veteran).reduce((n,x)=>n+x.chance,0)-1)<1e-10);
let saved;const persist=()=>{saved=JSON.stringify(veteran);return true;};
let result=api.openChest(veteran,persist,today,()=>0);assert.equal(result.ok,true);assert.equal(result.rewards.reduce((n,r)=>n+r.cards,0),20);assert.equal(veteran.commanderCollection.units.voss.cards,20);
assert.equal(api.openChest(veteran,persist,today).ok,false);
const restored=JSON.parse(saved);assert.equal(api.chestReady(restored,today),false);assert.equal(api.chestReady(restored,today-86400000),false);assert.equal(api.chestReady(restored,tomorrow),true);
assert.equal(api.assign(veteran,'vale',persist).ok,false);
assert.equal(api.upgrade(veteran,'voss',persist).ok,true);assert.equal(veteran.commanderCollection.units.voss.level,1);assert.equal(veteran.commanderCollection.units.voss.cards,10);
assert.equal(api.assign(veteran,'voss',persist).ok,true);assert.equal(veteran.commander,20,'switching never overwrites Holt');
const before=JSON.stringify(veteran);assert.equal(api.upgrade(veteran,'voss',()=>false).ok,false);assert.equal(JSON.stringify(veteran),before,'failed writes refund cards and credits');
assert.equal(api.openChest(veteran,()=>{throw Error('disk full');},tomorrow).ok,false);assert.equal(JSON.stringify(veteran),before,'failed chest save does not claim');
assert.equal(api.assign(veteran,'holt',()=>false).ok,false);assert.equal(JSON.stringify(veteran),before);
assert.ok(Math.abs(api.profile(veteran,'holt').damageBonus-1.425)<1e-10);assert.equal(api.profile(veteran,'holt').rateBonus,.54);assert.equal(api.profile(veteran,'holt').commandRate,1.5);
for(const d of api.roster){const m={commander:1,credits:1000000};api.ensure(m);m.commanderCollection.units[d.id]={level:d.cap-1,cards:1000};assert.equal(api.upgrade(m,d.id,()=>true).ok,true);assert.equal(api.upgrade(m,d.id,()=>true).ok,false);assert.equal(m.commanderCollection.units[d.id].level,d.cap);}
for(const [roll,id] of [[0,'holt'],[.65,'voss'],[.9,'calder'],[.98,'vale']]){const m={commander:1,credits:0};api.openChest(m,()=>true,today,()=>roll);assert.equal(m.commanderCollection.lastReward[0].id,id);}
for(const d of api.roster){veteran.commanderCollection.units[d.id].level=d.cap;veteran.commanderCollection.active=d.id;const run={hero:{damage:100,rate:10},hqDamageReduction:.1,barrierDamageReduction:.1};api.applyCombat(veteran,run);assert.equal(run.commanderId,d.id);assert.equal(run.hero.damage,100*d.damage);assert.equal(run.hero.rate,10*d.rate);assert.equal(run.commanderSplash,d.splash);assert.equal(run.hqDamageReduction,.1+d.protection);}
assert.equal(api.chestReady(veteran,tomorrow),false,'complete collection has no meaningless claim');
// Verify the battle constructor really consumes the assigned commander and shared equipment.
const gameSource=fs.readFileSync('src/centralHQPrototype.js','utf8');
const zero=new Proxy({},{get:()=>0}),combatMeta={commander:20,hq:1,phase:1};api.ensure(combatMeta);
const combat={canvas:{width:390,height:844},dpr:()=>1,meta:combatMeta,phaseBalance:()=>({targets:[1,1,1],barricadeHp:50}),retryAssist:()=>0,researchEffects:()=>zero,equipmentEffects:()=>new Proxy({commanderDamage:.16,commanderRate:.08},{get:(o,k)=>o[k]||0}),hqProfile:()=>zero,PERFORMANCE_BUDGET:{},COMPOUND_LANES:[{x:1,y:0}],COMMANDER_COMPOUND_RANGE_WORLD:5,window:{LSCCommanders:api,LSCReclamation:{applyBonuses:()=>{}}}};
vm.createContext(combat);vm.runInContext(gameSource.slice(gameSource.indexOf('  function createRun('),gameSource.indexOf('  function canvasRadius(')),combat);
let battle=combat.createRun({});assert.ok(Math.abs(battle.hero.damage-45.008)<1e-8);assert.equal(battle.commanderLevel,20);assert.equal(battle.commanderBossDamage,.2);assert.equal(battle.commandUnlocked,true);
combatMeta.commanderCollection.units.vale.level=1;combatMeta.commanderCollection.active='vale';battle=combat.createRun({});assert.equal(battle.commanderName,'Lieutenant Sera Vale');assert.equal(battle.commanderLevel,1);assert.equal(battle.commandUnlocked,false);assert.equal(battle.hqDamageReduction,.15);assert.equal(battle.barrierDamageReduction,.15);assert.ok(Math.abs(battle.hero.damage-16*1.16*.8)<1e-8);
combatMeta.commanderCollection.units.calder.level=10;combatMeta.commanderCollection.active='calder';battle=combat.createRun({});assert.equal(battle.commanderSplash,.55);assert.equal(battle.commandUnlocked,true);assert.equal(battle.commandMaxCd,20);
// Exercise the actual splash implementation, including killed targets and source attribution.
const source=fs.readFileSync('src/centralHQPrototype.js','utf8'),start=source.indexOf('  function commanderSplash('),end=source.indexOf('  function updateJunkyard(',start);
const target={x:0,y:0,hp:0,r:3},near={x:10,y:0,hp:20,r:3},far={x:200,y:0,hp:100,r:3};
const ctx={run:{commanderSplash:.55,enemies:[near,far],damage:{commander:0}},dpr:()=>1,dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),pushParticle:()=>{},applyDamage:(e,n)=>{const damage=Math.min(e.hp,n);e.hp-=damage;return damage;},kill:i=>ctx.run.enemies.splice(i,1)};
vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);ctx.commanderSplash(target,{source:'turret',damage:100});assert.equal(near.hp,20);ctx.commanderSplash(target,{source:'commander',damage:100});assert.equal(ctx.run.enemies.length,1);assert.equal(far.hp,100);assert.equal(ctx.run.damage.commander,20);
console.log('PASS commander migration, fixed daily rewards, odds boundaries, save rollback, recruitment, assignment, caps and combat roles.');
