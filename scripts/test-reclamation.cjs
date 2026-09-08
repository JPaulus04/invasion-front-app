const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('src/reclamation.js','utf8'),context);
const r=context.LSCReclamation;
assert.equal(r.tiles.length,48);assert.equal(new Set(r.tiles.map(t=>t.id)).size,48);
let m={bestPhase:0,credits:100000,parts:0};
assert.ok(r.tiles.every(t=>r.state(m,t)==='locked'));
m.bestPhase=1;
assert.equal(r.act(m,r.tiles[3].id,()=>true).ok,false);
let saved;
const save=()=>{saved=JSON.stringify(m);return true;};
const first=r.tiles[0];
assert.equal(r.act(m,first.id,save).ok,true);
assert.equal(m.credits,100000-first.cost);
m=JSON.parse(saved);assert.equal(r.progress(m,first),1);
const before=JSON.stringify(m);
assert.equal(r.act(m,first.id,()=>false).ok,false);assert.equal(JSON.stringify(m),before);
assert.equal(r.act(m,first.id,()=>{throw Error('disk');}).ok,false);assert.equal(JSON.stringify(m),before);
m.credits=0;assert.equal(r.act(m,first.id,save).ok,false);assert.equal(r.progress(m,first),1);
m.credits=100000;m.bestPhase=16;
let earned=0;
for(const tile of r.tiles){
  while(r.progress(m,tile)<tile.actions){assert.notEqual(r.state(m,tile),'locked');assert.equal(r.act(m,tile.id,save).ok,true);}
  earned+=tile.parts;
  const completed=JSON.stringify(m);assert.equal(r.act(m,tile.id,save).ok,false);assert.equal(JSON.stringify(m),completed);
}
assert.equal(m.parts,earned);assert.equal(earned,6);
m=JSON.parse(saved);assert.ok(r.tiles.every(t=>r.state(m,t)==='reclaimed'));
const territory=JSON.stringify(m.reclamation);m.bestPhase=0;assert.equal(JSON.stringify(m.reclamation),territory);
assert.ok(r.tiles.every(t=>r.state(m,t)==='reclaimed'));
console.log('PASS: 48 tiles, campaign gates, connected expansion, costs, reload, failed-save rollback, insufficient funds, one-time rewards, permanent restoration.');
