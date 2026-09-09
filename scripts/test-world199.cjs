const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('src/reclamation.js','utf8'),c);const r=c.LSCReclamation;
for(let n=1;n<=25;n++){
 const m={bestPhase:n-1,credits:10000,parts:0,reclamation:{progress:{},towers:{}}};
 const chosen=r.discovery(m);if(chosen){assert.equal(chosen.zone,n);assert.equal(r.visible(m,chosen),true);assert.ok(r.progress(m,chosen)<chosen.actions||chosen.site==='hill');}
 const hill=r.zone(n).tiles.find(t=>t.site==='hill');m.reclamation.progress[hill.id]=hill.actions;
 const before=JSON.stringify(m),count=r.scouting(m,hill).unseen;assert.equal(JSON.stringify(m),before,'preview must be read-only');
 let visibleBefore=0,visibleAfter=0;for(let j=1;j<=n;j++)for(const t of r.zone(j).tiles)if(r.visible(m,t))visibleBefore++;
 assert.equal(r.buildTower(m,hill.id,()=>true).ok,true);
 for(let j=1;j<=n;j++)for(const t of r.zone(j).tiles)if(r.visible(m,t))visibleAfter++;
 assert.equal(visibleAfter-visibleBefore,count,'preview equals actual newly visible tiles');assert.equal(r.scouting(m,hill).unseen,0);
 const expected=['SIEGE BREAKER','JUGGERNAUT','OUTBREAK PRIME'][Math.floor((n-1)/5)%3];assert.equal(r.district(n).threat,expected);
}
console.log('PASS: 25 districts, accurate read-only scouting previews, visible current-town support targeting and campaign threat cycle.');
