const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let clock=0,next=0,timers=new Map(),listeners=new Map(),active;
function later(fn,ms){timers.set(++next,{fn,at:clock+ms});return next;}
function tick(ms){const end=clock+ms;for(;;){const d=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!d)break;timers.delete(d[0]);clock=d[1].at;d[1].fn();}clock=end;}
const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
class E{constructor(){this.style={};this.children=[];this.nodes={};this.disabled=false;}set innerHTML(v){this.children=[];this.nodes={};for(const m of v.matchAll(/data-([a-z]+)/g))this.nodes['[data-'+m[1]+']']=new E();if(v.includes('<canvas'))this.nodes.canvas=new E();}appendChild(e){this.children.push(e);e.parentElement=this;if(e.id==='star-world')active=e;}querySelector(k){return this.nodes[k];}getContext(){return ctx;}getBoundingClientRect(){return{left:0,top:0,width:390,height:480};}setPointerCapture(){}remove(){this.removed=true;}click(){if(!this.disabled&&this.onclick)this.onclick();}}
const document={body:new E(),createElement:()=>new E(),addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)};
const c={document,setTimeout:later,clearTimeout:id=>timers.delete(id),setInterval:()=>99,clearInterval:()=>{},addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)};vm.createContext(c);for(const f of ['reclamation','worldMapArt','worldBuilding','starTowns'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c);
const m={bestPhase:0,credits:500,parts:12},cleanup=c.LSCStarTowns.mount(new E(),m,()=>true,()=>{},()=>{},()=>{},()=>300),canvas=active.querySelector('canvas');
function ev(x=251,y=240,id=1){return{clientX:x,clientY:y,pointerId:id,button:0,preventDefault(){}};}
canvas.onpointerdown(ev());tick(100);canvas.onpointerup(ev());assert.equal(m.credits,2500,'tap selects without purchase');
canvas.onpointerdown(ev());tick(2000);canvas.onpointerup(ev());assert.equal(m.credits,2452);assert.equal(m.starTowns.progress['1,0'],4);assert.equal(m.starTowns.progress['2,0'],undefined,'hold stops at tile completion');
canvas.onpointerdown(ev(307));tick(100);canvas.onpointermove(ev(350));tick(1000);canvas.onpointerup(ev(350));assert.equal(m.credits,2452,'drag cancels spend');
active.querySelector('[data-home]').click();canvas.onpointerdown(ev(307));canvas.onpointerdown(ev(200,240,2));tick(1000);canvas.onpointermove(ev(180,240,2));canvas.onpointerup(ev(180,240,2));tick(1000);canvas.onpointerup(ev(307));assert.equal(m.credits,2452,'pinch cancels spend');
active.querySelector('[data-build]').click();assert.equal(active.querySelector('[data-construction]').style.display,'block');assert.ok(active.querySelector('[data-construction]').children.length>=4,'building palette and recipes render');
cleanup();assert.equal(timers.size,0);assert.equal(listeners.size,0);assert.equal(active.removed,true);
console.log('PASS: production star UI tap/hold, no neighbor overspend, drag/pinch cancellation and cleanup. DOM harness only.');
