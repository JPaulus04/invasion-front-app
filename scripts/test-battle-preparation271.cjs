const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('src/centralHQPrototype.js','utf8'),commanders=require('../src/commanders260.js');
const ctx={window:{LSCCommanders:commanders},meta:{commander:{level:20}},equipmentEffects:()=>({commanderDamage:.16,commanderRate:.08})};vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('  function defenseReadiness270('),source.indexOf('  function defenseAdvice270(')),ctx);
let c=commanders.ensure(ctx.meta);c.units.holt.level=20;c.units.voss.level=4;c.active='voss';
let recommendation=ctx.commanderRecommendation271();assert.equal(recommendation.id,'holt');assert.ok(recommendation.gain>100);assert.equal(commanders.ensure(ctx.meta).active,'voss','recommendation never changes assignment');
c=commanders.ensure(ctx.meta);c.active='holt';assert.equal(ctx.commanderRecommendation271(),null,'no suggestion when no substantial sustained damage improvement');
c=commanders.ensure(ctx.meta);c.units.holt.level=1;c.active='holt';c.units.voss.level=0;assert.equal(ctx.commanderRecommendation271(),null,'never recommend unrecruited commanders');
function run(fire,hp){return {balance:{hp:4,damage:3},hero:{damage:fire,rate:1},turret:{damage:0,rate:1},hq:{maxHp:hp},lanes:Array.from({length:8},()=>({barricade:{maxHp:hp/8}})),squad:[]};}
let weak=ctx.defenseReadiness270(run(30,20000));assert.equal(weak.firepower,'LOW');assert.equal(weak.durability,'STRONG');assert.equal(weak.label,'EXTREME','durability cannot disguise critically low firepower');let stronger=ctx.defenseReadiness270(run(250,3000));assert.ok(stronger.score>weak.score);let protectedRun=run(250,3000);protectedRun.hqDamageReduction=.15;protectedRun.barrierDamageReduction=.15;assert.ok(ctx.defenseReadiness270(protectedRun).score>=stronger.score);
console.log('PASS owned-commander recommendations, explicit comparison, separate readiness and weak-firepower protection.');
