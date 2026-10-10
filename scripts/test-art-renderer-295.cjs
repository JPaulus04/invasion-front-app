/* Run with: node scripts/test-art-renderer-295.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/artRenderer295.js','utf8');
let legacyCalls=0,draws=0;
class FakeImage {
 constructor(){this.naturalWidth=128;this.naturalHeight=160;}
 set src(v){this._src=v;this.onload&&this.onload();}
}
const ctx={Image:FakeImage,LSCIso221:{
 paint(){legacyCalls++;return 'legacy-result';},
 project(t,c,v){return {x:t.x*40,y:t.y*20};}
},LSCSettlement:{tiles:{'0,0':{id:'0,0',x:0,y:0},'1,0':{id:'1,0',x:1,y:0}}}};
vm.runInNewContext(source,ctx,{filename:'artRenderer295.js'});
const art=ctx.LSCArt295;
assert.equal(art.getMode(),'legacy');
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
const g={drawImage(){draws++;}};
const m={settlement204:{visible:{'0,0':true,'1,0':true},cleared:{'0,0':true,'1,0':true},buildings:{'1,0':{kind:'workshop'}}}};
assert.equal(art.paint(g,m,{w:320,h:480},{scale:100},null,[],0,{}),'legacy-result');
assert.equal(draws,1,'Only loaded HQ should overlay; missing lumber must fall back');
art.register('lumber-l1','assets/new-art/lumber-l1.png');
art.paint(g,m,{w:320,h:480},{scale:100},null,[],0,{});
assert.equal(draws,3,'Both HQ and lumber should render after assets load');
art.setMode('legacy');art.paint(g,m,{w:320,h:480},{scale:100},null,[],0,{});
assert.equal(draws,3,'Legacy mode must not draw preview sprites');
console.log('PASS: art renderer mode, safety, fallback, sprite loading and depth sorting');
