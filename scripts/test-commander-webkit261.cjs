// Production bundle in WebKit, with injected native safe-area dimensions.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {webkit}=require(process.env.LSC_PLAYWRIGHT_MODULE||'playwright');
const base=path.resolve('www'),out='/tmp/lsc261-preview';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(base,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403);res.end();return;}try{let data=fs.readFileSync(file===base?path.join(base,'index.html'):file);if(file===base||file.endsWith('index.html'))data=data.toString().replace(/env\(safe-area-inset-top(?:,[^)]*)?\)/g,'59px').replace(/env\(safe-area-inset-bottom(?:,[^)]*)?\)/g,'34px');res.end(data);}catch(e){res.writeHead(404);res.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await webkit.launch({headless:true});
for(const size of [{width:393,height:852},{width:320,height:568}]){
 const page=await browser.newPage({viewport:size,isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{if(!localStorage.getItem('lsc_command_base_137'))localStorage.setItem('lsc_command_base_137',JSON.stringify({phase:1,settlementMode:204,commander:20,commanderSchema:168,credits:100000,commanderCollection:{active:'voss',units:{holt:{level:20,cards:0},voss:{level:2,cards:0}}}}));});
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 await page.locator('#settlement-world [data-hqhub]').click();await page.locator('#settlement-world [data-section-commander]').click();
 const panel=page.locator('#l137-panel'),dock=page.locator('nav.l259-dock:visible');
 async function bounds(){const p=await panel.boundingBox(),d=await dock.boundingBox();assert.ok(p.y>=59,'scroll viewport excludes status bar');assert.ok(p.y+p.height<=d.y,'scroll viewport ends above bottom dock');assert.ok(p.width<=size.width);}
 await bounds();await page.locator('[data-flip]').evaluate(el=>el.scrollIntoView({block:'start'}));
 assert.equal(await page.locator('.c260-back').evaluate(el=>getComputedStyle(el).visibility),'hidden');
 await page.locator('[data-flip]').click();await page.waitForTimeout(550);
 assert.equal(await page.locator('.c260-name').evaluate(el=>getComputedStyle(el).visibility),'hidden','front descendants cannot bleed through story');
 assert.equal(await page.locator('.c260-back').evaluate(el=>getComputedStyle(el).visibility),'visible');
 await page.screenshot({path:path.join(out,'story-webkit-'+size.width+'.png')});
 for(let i=0;i<4;i++)await page.locator('[data-flip]').click({force:true});await page.waitForTimeout(550);
 assert.equal(await page.locator('.c260-name').evaluate(el=>getComputedStyle(el).visibility),'hidden','rapid flips remain on the correct face');
 await page.locator('[data-flip]').click();await page.waitForTimeout(550);assert.equal(await page.locator('.c260-back').evaluate(el=>getComputedStyle(el).visibility),'hidden');
 await page.screenshot({path:path.join(out,'front-webkit-'+size.width+'.png')});
 assert.equal(await page.locator('[data-upgrade]').innerText(),'NEED 5 CARDS');assert.equal(await page.locator('[data-upgrade]').isDisabled(),true);
 await page.locator('[data-equipment]').scrollIntoViewIfNeeded();await bounds();const equip=await page.locator('[data-equipment]').boundingBox(),nav=await dock.boundingBox();assert.ok(equip.y+equip.height<=nav.y,'last action can scroll entirely above dock');
 await page.locator('[data-equipment]').click();await bounds();await page.locator('#l259-external-dock [data-section-hq]').click();await bounds();
 assert.deepEqual(errors,[]);await page.close();console.log('PASS WebKit faces, rapid flips, safe-area clipping, bottom actions and upgrade explanation at '+size.width+'px');
}
}finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
