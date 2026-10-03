// Render the production bundle, including campaign persistence and the shared HQ dock.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.LSC_PLAYWRIGHT_MODULE||'playwright');
const base=path.resolve('www'),output=process.env.LSC_SCREENSHOTS||'/tmp/lsc260-preview';fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(base,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403);res.end();return;}try{res.end(fs.readFileSync(file===base?path.join(base,'index.html'):file));}catch(e){res.writeHead(404);res.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of [320,390,430]){const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{if(!localStorage.getItem('lsc_command_base_137'))localStorage.setItem('lsc_command_base_137',JSON.stringify({phase:1,settlementMode:204,commander:20,commanderSchema:168,credits:100000}));});await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});

 async function open(){await page.locator('#settlement-world [data-hqhub]').click();await page.locator('#settlement-world [data-section-commander]').click();await page.locator('section.c260').waitFor();}
 await open();assert.match(await page.locator('.c260-name').innerText(),/Level 20 \/ 20/);
 assert.equal(await page.locator('.c260-roster img').evaluateAll(images=>images.every(im=>im.complete&&im.naturalWidth>0)),true);
 await page.locator('[data-flip]').evaluate(el=>el.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(output,'holt-front-'+width+'.png')});
 const oldSave=await page.evaluate(()=>JSON.parse(localStorage.getItem('lsc_command_base_137')).commanderCollection);
 await page.locator('[data-flip]').click();await page.waitForTimeout(500);assert.equal(await page.locator('[data-flip]').getAttribute('aria-pressed'),'true');await page.screenshot({path:path.join(output,'holt-story-'+width+'.png')});
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('lsc_command_base_137')).commanderCollection),oldSave,'reading lore has no saved flag or reward');
 await page.locator('[data-flip]').click();await page.evaluate(()=>Math.random=()=>0);await page.locator('[data-chest]').click();assert.match(await page.locator('.c260-reward').innerText(),/Voss \+20/);assert.equal(await page.locator('[data-chest]').isDisabled(),true);
 await page.locator('[data-select=voss]').click();await page.locator('[data-upgrade]').click();await page.locator('[data-assign]').click();assert.match(await page.locator('[data-assign]').innerText(),/ASSIGNED/);
 await page.locator('[data-upgrade]').click();assert.match(await page.locator('.c260-name').innerText(),/Level 2 \/ 30/);assert.equal(await page.locator('.l205-back').count(),1,'sticky navigation survives card actions');
 await page.reload();await open();assert.match(await page.locator('.c260-name').innerText(),/Mara Voss/);assert.match(await page.locator('.c260-name').innerText(),/Level 2 \/ 30/);assert.equal(await page.locator('.l205-back').count(),1,'sticky navigation survives card actions');assert.equal(await page.locator('[data-chest]').isDisabled(),true);
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('lsc_command_base_137')));assert.equal(data.commander,20);assert.equal(data.commanderCollection.active,'voss');
 await page.locator('[data-select=vale]').click();await page.locator('[data-flip]').evaluate(el=>el.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(output,'vale-'+width+'.png')});assert.equal(await page.locator('[data-assign]').isDisabled(),true);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no page horizontal overflow');
 for(const b of await page.locator('nav.l259-dock:visible button:visible').all()){const r=await b.boundingBox();assert.ok(r.height>=44&&r.x>=0&&r.x+r.width<=width+.5&&r.y+r.height<=844.5);}
 await page.locator('[data-equipment]').click();assert.match(await page.locator('#l137-panel').innerText(),/FIELD EQUIPMENT/);
 await page.locator('#l259-external-dock [data-hqhub]').click();await page.screenshot({path:path.join(output,'hq-'+width+'.png')});
 assert.equal(await page.locator('.hq260-grid button').count(),4);assert.deepEqual(errors,[]);await page.close();console.log('PASS rendered commander flows, migration, daily claim, recruit, assign, upgrade, reload and story at '+width+'px');
 }
 }finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
