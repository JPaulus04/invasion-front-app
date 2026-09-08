const assert=require('node:assert/strict'),fs=require('node:fs');
const world=fs.readFileSync('src/reclamation.js','utf8'),base=fs.readFileSync('src/centralHQPrototype.js','utf8');
function layer(source,id){const rule=source.match(new RegExp('#'+id+'\\{([^}]+)\\}'));assert.ok(rule,'Missing '+id+' CSS');assert.match(rule[1],/position:fixed/);const z=rule[1].match(/z-index:(\d+)/);assert.ok(z,'Missing '+id+' layer');return Number(z[1]);}
function check(source){const z=layer(source,'rc-world');assert.ok(z>layer(base,'lsc137-app'),'World is covered by Command Base');assert.ok(z<layer(base,'hq-upgrade-overlay'),'World must stay below combat dialogs');assert.ok(z<layer(base,'lsc137-result'));}
// Prove the check detects the actual released defect, not merely the new number.
assert.throws(()=>check(world.replace('z-index:30500;','z-index:10020;')),/World is covered/);
check(world);
assert.match(world,/document\.body\.appendChild\(shell\)/,'Sibling stacking context expected');
assert.match(base,/if\(reclamationCleanup\)\{reclamationCleanup\(\);reclamationCleanup=null;\}/);
const built=fs.readFileSync('www/index.html','utf8');check(built);assert.ok(built.includes("const LSC_BUILD = '195';"));
console.log('PASS: released layering defect reproduced; source and bundle place World above Base and below combat dialogs. CSS regression check, not an actual browser rendering test.');
