// Deterministic event/timer harness. It does NOT replace physical Safari testing.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
let now=0,next=1,timers=new Map(),nodes=new Map(),listeners=new Map(),intervals=[];
function delay(fn,ms){const id=next++;timers.set(id,{fn,at:now+ms});return id;}
function tick(ms){const end=now+ms;for(;;){const due=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;now=due[1].at;timers.delete(due[0]);due[1].fn();}now=end;}
const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.disabled=false;this.style={};}
 set id(value){this._id=value;nodes.set(value,this);}get id(){return this._id;}
 set innerHTML(value){this.html=value;for(const match of value.matchAll(/<(\w+)[^>]*id="([^"]+)"/g)){const e=new Element(match[1]);e.id=match[2];this.children.push(e);}if(value.includes('rw-map')){const e=new Element('div');e.id='map';}if(value.includes('rw-tools')){const e=new Element('div');e.id='tools';}}
 setAttribute(){}appendChild(el){this.children.push(el);}remove(){this.removed=true;nodes.delete(this.id);}
 querySelector(key){return nodes.get(key==='canvas'?'rw-canvas':key==='.rw-tools'?'tools':key==='.rw-map'?'map':key.slice(1));}
 getContext(){return ctx;}getBoundingClientRect(){return {left:0,top:0,width:390,height:480};}setPointerCapture(){}click(){if(!this.disabled&&this.onclick)this.onclick();}
}
const document={hidden:false,head:new Element('head'),body:new Element('body'),createElement:t=>new Element(t),getElementById:id=>nodes.get(id),addEventListener:(type,fn)=>listeners.set('doc'+type,fn),removeEventListener:type=>listeners.delete('doc'+type)};
const context={document,devicePixelRatio:1,setTimeout:delay,clearTimeout:id=>timers.delete(id),setInterval:fn=>{intervals.push(fn);return 9999;},clearInterval:()=>{},addEventListener:(t,fn)=>listeners.set(t,fn),removeEventListener:t=>listeners.delete(t)};
vm.createContext(context);vm.runInContext(fs.readFileSync('src/worldMapArt.js','utf8'),context);vm.runInContext(fs.readFileSync('src/reclamation.js','utf8'),context);
const r=context.LSCReclamation;
function mount(){let m={bestPhase:0,phase:1,credits:500,parts:12},saved=0,back=0;const cleanup=r.mount(new Element('main'),m,()=>{saved++;return true;},()=>{},()=>{back++;},()=>{back++;});return {m,cleanup,canvas:nodes.get('rw-canvas'),saved:()=>saved,back:()=>back};}
function event(x=195,y=240,id=1){return {clientX:x,clientY:y,pointerId:id,button:0,preventDefault(){}};}
let app=mount();
const fight=nodes.get('rw-fight');assert.equal(fight.disabled,true);fight.textContent='PREPARE TOWN DEFENSE';const stable=fight.textContent;for(let i=0;i<5;i++)intervals[0]();assert.equal(fight.textContent,stable,'income refresh leaves defense label untouched');
// Tapping selects without charging; the dock is always available for discrete steps.
app.canvas.onpointerdown(event());tick(100);app.canvas.onpointerup(event());assert.equal(app.m.credits,500);
nodes.get('rw-action').click();assert.equal(app.m.credits,488);assert.equal(app.m.reclamation.progress['1,0'],1);
// Drag starts before hold threshold: never spends.
app.canvas.onpointerdown(event());tick(100);app.canvas.onpointermove(event(245,240));tick(1000);app.canvas.onpointerup(event(245,240));assert.equal(app.m.credits,488);
nodes.get('rw-center').click();
// Hold repeats only on selected tile; completing it must not purchase its neighbor.
app.canvas.onpointerdown(event());tick(2000);app.canvas.onpointerup(event());assert.equal(app.m.credits,452);assert.equal(app.m.reclamation.progress['1,0'],4);assert.equal(app.m.reclamation.progress['2,0'],undefined);
nodes.get('rw-center').click();app.canvas.onpointerdown(event());tick(100);app.canvas.onpointerdown(event(255,240,2));tick(1000);app.canvas.onpointermove(event(285,240,2));app.canvas.onpointerup(event(285,240,2));tick(1000);app.canvas.onpointerup(event());assert.equal(app.m.credits,452,'pinch cancels spending until all fingers lift');
// Interruptions cancel pending work, including hidden tabs and screen transitions.
app.canvas.onpointerdown(event());tick(100);listeners.get('docvisibilitychange')();tick(800);assert.equal(app.m.credits,452);
app.canvas.onpointerdown(event());tick(100);app.canvas.onpointercancel(event());tick(800);assert.equal(app.m.credits,452);
app.canvas.onpointerdown(event());tick(100);app.cleanup();tick(800);assert.equal(app.m.credits,452);assert.equal(nodes.has('rc-world'),false);assert.equal(listeners.size,0);
app=mount();nodes.get('rw-briefing').click();assert.equal(app.back(),1);app.cleanup();
console.log('PASS: tap selection, fixed-dock spend, hold repeat, no neighbor overspend, drag/pinch cancellation, pointer cancellation, visibility cancellation, cleanup and briefing navigation. DOM harness only; Safari layout remains a device check.');
