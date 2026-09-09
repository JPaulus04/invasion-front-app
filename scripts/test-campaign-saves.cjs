const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/campaignSaves.js','utf8'),ctx);const api=ctx.LSCCampaignSaves;
const old={phase:14,bestPhase:13,credits:9000,reclamation:{progress:{'1,0':4}}},fresh={phase:1,bestPhase:0,credits:500};
function store(fail){const values=new Map([['active',JSON.stringify(old)],['unrelated','preserve']]);return {values,getItem:k=>values.get(k)||null,setItem:(k,v)=>{if(fail===k)throw Error('quota');values.set(k,v);}};}
let s=store();assert.equal(api.list(s,'archive').length,0);assert.equal(api.activate(s,'active','archive',old,fresh).ok,true);
assert.deepEqual(JSON.parse(s.getItem('active')),fresh);assert.deepEqual(JSON.parse(JSON.stringify(api.list(s,'archive')[0].meta)),old);assert.equal(s.getItem('unrelated'),'preserve');
assert.equal(api.activate(s,'active','archive',fresh,old).ok,true);assert.equal(api.list(s,'archive').length,2);assert.deepEqual(JSON.parse(s.getItem('active')),old);assert.equal(api.list(s,'archive')[1].meta.phase,1,'restoration backs up outgoing campaign');
for(const failure of ['archive','active']){s=store(failure);assert.equal(api.activate(s,'active','archive',old,fresh).ok,false);assert.deepEqual(JSON.parse(s.getItem('active')),old);}
s=store();s.values.set('archive','corrupted');assert.equal(api.activate(s,'active','archive',old,fresh).ok,false);assert.equal(s.getItem('archive'),'corrupted');
s=store();for(let i=0;i<20;i++)assert.equal(api.activate(s,'active','archive',old,fresh).ok,true);assert.equal(api.activate(s,'active','archive',old,fresh).ok,false);assert.equal(api.list(s,'archive').length,20,'never evicts backups');
const ui=fs.readFileSync('src/centralHQPrototype.js','utf8');assert.ok(ui.includes('BACK UP AND CONFIRM'));assert.ok(ui.includes('Cancelled. Current campaign unchanged.'));assert.ok(ui.includes('target.operationLastClearDay=meta.operationLastClearDay'));
console.log('PASS: restart and restore snapshots, storage failures, corrupt archives, backup limit, unrelated-key preservation and confirmation wiring.');
