const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let active;const listeners=new Map(),ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
class E{constructor(){this.style={};this.children=[];this.nodes={};}set innerHTML(v){this.children=[];this.nodes={};for(const m of v.matchAll(/data-([a-z]+)/g))this.nodes['[data-'+m[1]+']']=new E();if(v.includes('<canvas'))this.nodes.canvas=new E();}appendChild(e){this.children.push(e);e.parentElement=this;if(e.id==='settlement-world')active=e;}querySelector(k){return this.nodes[k];}getContext(){return ctx;}getBoundingClientRect(){return{left:0,top:0,width:390,height:480};}setPointerCapture(){}remove(){this.removed=true;}click(){if(!this.disabled&&this.onclick)this.onclick();}}
const document={body:new E(),createElement:()=>new E()};
const c={document,Date,setInterval:()=>1,clearInterval:()=>{},addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)};vm.createContext(c);for(const f of ['settlement204','settlementView204'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c);
const m={credits:500},cleanup=c.LSCSettlementView.mount(new E(),m,()=>true,()=>{},()=>{},()=>{},()=> 'Power 300'),sheet=active.querySelector('[data-sheet]');
const clickText=t=>{const b=sheet.children.find(e=>e.textContent===t);assert.ok(b,'missing '+t);b.click();};
active.querySelector('[data-objective]').click();clickText('+ WORKER');clickText('+ WORKER');assert.equal(m.settlement204.buildings['1,0'].workers,2);
active.querySelector('[data-people]').click();assert.ok(sheet.children.some(e=>(e.textContent||'').includes('12 residents')));
active.querySelector('[data-build]').click();clickText('Housing · 30 MAT / 100 CR');
const canvas=active.querySelector('canvas'),credits=m.credits,ev={clientX:99,clientY:240,pointerId:1,button:0,preventDefault(){}};
canvas.onpointerdown(ev);canvas.onpointerup(ev);assert.equal(m.credits,credits,'placement never spends before confirmation');
clickText('CONFIRM BUILD');assert.equal(m.credits,credits-100);assert.equal(m.settlement204.job.kind,'house');
cleanup();assert.equal(active.removed,true);assert.equal(listeners.size,0);
console.log('PASS settlement UI DOM harness: mount, objective, worker assignment, People panel, placement confirmation and cleanup.');
