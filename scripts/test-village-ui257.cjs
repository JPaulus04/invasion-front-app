const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');let mounted;
const pen=new Proxy({measureText:t=>({width:String(t).length*7}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
class Element{
 constructor(tag='div'){this.tag=tag;this.style={setProperty(){}};this.children=[];this.nodes={};this.dataset={};this.classList={add(){},remove(){},toggle(){},contains:()=>false};}
 set innerHTML(value){this.children=[];this.nodes={};for(const m of value.matchAll(/data-([a-z-]+)/g))this.nodes['[data-'+m[1]+']']=new Element();for(const k of ['canvas','main','nav','header','.map-controls'])this.nodes[k]=new Element(k);}
 appendChild(e){this.children.push(e);e.parentElement=this;if(e.id==='settlement-world')mounted=e;return e;}
 querySelector(k){return this.nodes[k]||null;}querySelectorAll(){return [];}setAttribute(){}getContext(){return pen;}
 getBoundingClientRect(){return {left:0,top:0,right:390,bottom:844,width:390,height:844};}
 setPointerCapture(){}releasePointerCapture(){}remove(){}click(){if(!this.disabled&&this.onclick)this.onclick();}
}
const c={console,document:{body:new Element(),createElement:t=>new Element(t)},Date,setInterval:()=>1,clearInterval(){},addEventListener(){},removeEventListener(){}};
vm.createContext(c);for(const f of ['settlement204','settlementView204','settlement205','isometricMap221','settlementView205'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c);
const api=c.LSCSettlement,m={credits:5000};api.initialize(m,()=>true,Date.now());const d=m.settlement204;
d.population=12;d.housingBase=20;d.food=300;d.materials=300;d.stone=200;d.priority='manual';d.targets={farm:2,workshop:0,quarry:0,ironMine:0};
for(let x=0;x<=5;x++){d.visible[x+',0']=true;d.roads[x+',0']=true;}d.defended[1]=d.welcomed[1]=true;api.rebalance(m);
const cleanup=c.LSCSettlementView.mount(new Element(),m,()=>true,()=>{},()=>{},()=>{},()=> '300');
const sheet=mounted.querySelector('[data-sheet]');
function text(e){return (e.textContent||'')+' '+e.children.map(text).join(' ');}
function click(label){function find(e){if(e.textContent===label)return e;return e.children.map(find).find(Boolean);}const b=find(sheet);assert.ok(b,'button exists: '+label);assert.ok(!b.disabled,'button enabled: '+label);b.click();}
mounted.querySelector('[data-people]').click();assert.ok(text(sheet).includes('VILLAGE WORKERS · 0'));
click('MANAGE VILLAGES');click('DEVELOP '+api.town(1).name.toUpperCase());
assert.ok(text(sheet).includes('Unlock: +500 permanent shared storage'));
assert.equal(sheet.className,'expanded-panel');assert.ok(text(sheet).includes('Automatic: 1/min'));
click('+ WORKER');assert.equal(api.villageDevelopment(m,1).workers,1);assert.ok(text(sheet).includes('1.75 Timber/min'));
click('DEVELOP TO LEVEL 2');assert.equal(api.villageDevelopment(m,1).level,2);assert.ok(text(sheet).includes('Automatic: 2/min'));assert.ok(text(sheet).includes('Upgrade HQ to level 2'));
assert.ok(text(sheet).includes('Specialty active · no workers required'));
click('MANAGE WORKERS');assert.ok(text(sheet).includes('VILLAGE WORKERS · 1'));
d.materials=api.storage(m);click('MANAGE VILLAGES');assert.ok(text(sheet).includes('Storage full · resource production paused'));
click('DEVELOP '+api.town(1).name.toUpperCase());assert.ok(text(sheet).includes('Storage full · resource production paused'));
cleanup();console.log('PASS: mounted mobile panel, People → villages → development navigation, live staffing, upgrade, HQ gate and worker totals.');
