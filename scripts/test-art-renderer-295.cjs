/* Run with: node scripts/test-art-renderer-295.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/artRenderer295.js','utf8');
let legacyCalls=0,draws=0;
let availableAssets=new Set(['hq-l1.png']);
class FakeImage {
 constructor(){this.naturalWidth=128;this.naturalHeight=160;}
 set src(v){this._src=v;if(availableAssets.has(v.split('/').pop()))this.onload&&this.onload();else this.onerror&&this.onerror();}
}
const ctx={Image:FakeImage,LSCIso221:{
 paint(){legacyCalls++;return 'legacy-result';},
 project(t,c,v){return {x:t.x*40,y:t.y*20};}
},LSCSettlement:{tiles:{'0,0':{id:'0,0',x:0,y:0},'1,0':{id:'1,0',x:1,y:0}}}};
vm.runInNewContext(source,ctx,{filename:'artRenderer295.js'});
const art=ctx.LSCArt295;
assert.equal(art.getMode(),'preview','Modern art must be the default');
assert.equal(art.installPreviewControl(),false,'No DOM should leave the preview UI disabled');
assert.equal(art.toggleMode(),'legacy');
assert.equal(art.toggleMode(),'preview');
assert.equal(art.paint({},null,null,null), 'legacy-result');
assert.equal(legacyCalls,1);
assert.throws(()=>art.setMode('broken'),/Unknown art mode/);
assert.throws(()=>art.register('bad','https://example.com/a.png'),/Invalid asset path/);
assert.throws(()=>art.register('bad','assets/../secret.png'),/Invalid asset path/);
assert.equal(art.register('hq-l1','assets/new-art/hq-l1.png'),true);
assert.equal(art.ready('hq-l1'),true);
assert.equal(art.previewAvailable(),true);
assert.deepEqual(Array.from(art.sort([{id:'b',depth:3,x:0},{id:'a',depth:1,x:0}]),v=>v.id),['a','b']);
art.setMode('preview');
let selectionStrokes=0;
const g={drawImage(){draws++;},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},stroke(){selectionStrokes++;}};
const m={settlement204:{visible:{'0,0':true,'1,0':true},cleared:{'0,0':true,'1,0':true},buildings:{'1,0':{kind:'workshop'}}}};
assert.equal(art.paint(g,m,{w:320,h:480},{scale:100},null,[],0,{}),'legacy-result');
assert.equal(draws,1,'Only loaded HQ should overlay; missing lumber must fall back');
// HQ must remain rendered if a resumed save temporarily omits origin visibility.
delete m.settlement204.visible['0,0'];
art.paint(g,m,{w:320,h:480},{scale:100},null,[],0,{});
assert.equal(draws,2,'HQ should not disappear when fog visibility omits origin');
m.settlement204.visible['0,0']=true;
// HQ is the origin and may not be present in the cleared-tile map.
delete m.settlement204.cleared['0,0'];
art.paint(g,m,{w:320,h:480},{scale:100},null,[],0,{});
assert.equal(draws,3,'HQ must render even without a cleared flag');
m.settlement204.cleared['0,0']=true;
availableAssets.add('lumber-l1.png');
art.register('lumber-l1','assets/new-art/lumber-l1.png');
art.paint(g,m,{w:320,h:480},{scale:100},null,[],0,{});
assert.equal(draws,5,'Both HQ and lumber should render after assets load');
art.paint(g,m,{w:320,h:480},{scale:100},'0,0',[],0,{});
assert.equal(selectionStrokes,1,'Preview must restore selected tile outline above new sprites');
art.setMode('legacy');art.paint(g,m,{w:320,h:480},{scale:100},null,[],0,{});
assert.equal(draws,7,'Legacy mode must not draw preview sprites');
// Quarry must stay hidden until its PNG loads, then draw alongside the other buildings.
ctx.LSCSettlement.tiles['2,0']={id:'2,0',x:2,y:0};
m.settlement204.visible['2,0']=true;
m.settlement204.cleared['2,0']=true;
m.settlement204.buildings['2,0']={kind:'quarry'};
art.setMode('preview');
art.paint(g,m,{w:320,h:480},{scale:100},null,[],0,{});
assert.equal(draws,9,'Missing quarry must not overlay');
availableAssets.add('quarry-l1.png');
art.register('quarry-l1','assets/new-art/quarry-l1.png');
art.paint(g,m,{w:320,h:480},{scale:100},null,[],0,{});
assert.equal(draws,12,'Loaded HQ, lumber and quarry should all render');
console.log('PASS: art renderer mode, safety, fallback, sprite loading and depth sorting');
