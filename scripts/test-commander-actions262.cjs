// Production bundle in WebKit, with injected native safe-area dimensions.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {webkit}=require(process.env.LSC_PLAYWRIGHT_MODULE||'playwright');
const base=path.resolve('www'),out='/tmp/lsc262-preview';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(base,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403);res.end();return;}try{let data=fs.readFileSync(file===base?path.join(base,'index.html'):file);if(file===base||file.endsWith('index.html'))data=data.toString().replace(/env\(safe-area-inset-top(?:,[^)]*)?\)/g,'59px').replace(/env\(safe-area-inset-bottom(?:,[^)]*)?\)/g,'34px');res.end(data);}catch(e){res.writeHead(404);res.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await webkit.launch({headless:true});
for(const size of [{width:393,height:852},{width:320,height:568}]){
 const page=await browser.newPage({viewport:size,isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{if(!localStorage.getItem('lsc_command_base_137'))localStorage.setItem('lsc_command_base_137',JSON.stringify({phase:1,settlementMode:204,commander:20,commanderSchema:168,credits:100000,commanderCollection:{active:'holt',units:{holt:{level:20,cards:0},voss:{level:2,cards:5}}}}));});
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 await page.locator('#settlement-world [data-hqhub]').click();await page.locator('#settlement-world [data-section-commander]').click();
 const panel=page.locator('#l137-panel');
 async function controls(){await page.waitForTimeout(100);const bar=await page.locator('.c262-actions').boundingBox(),nav=await page.locator('nav.l259-dock:visible').boundingBox(),p=await panel.boundingBox();assert.ok(Math.abs(bar.y+bar.height-nav.y)<1,'actions touch navigation with no gap');assert.ok(Math.abs(p.y+p.height-bar.y)<1,'scroll viewport stops above actions');assert.ok(p.y>=59);for(const selector of ['[data-assign]','[data-upgrade]']){assert.equal(await page.locator(selector).count(),1);const b=await page.locator(selector).boundingBox();assert.ok(b.height>=44&&b.x>=0&&b.x+b.width<=size.width&&b.y>=bar.y&&b.y+b.height<=nav.y);}}
 await controls();assert.match(await page.locator('[data-comparison]').innerText(),/Currently assigned/);
 await page.locator('[data-select=voss]').click();await controls();assert.match(await page.locator('[data-comparison]').innerText(),/Colonel Holt/);assert.match(await page.locator('[data-comparison]').innerText(),/Captain Mara Voss/);assert.equal(await page.locator('[data-metric=dps] .loss').count(),1);assert.equal(await page.locator('[data-metric=boss] .gain').count(),1);
 await page.screenshot({path:path.join(out,'comparison-'+size.width+'.png')});
 await page.locator('[data-flip]').evaluate(el=>el.scrollIntoView({block:'start'}));await controls();await page.locator('[data-flip]').click();await page.waitForTimeout(500);await controls();assert.equal(await page.locator('.c260-name').evaluate(el=>getComputedStyle(el).visibility),'hidden');
 await page.screenshot({path:path.join(out,'story-actions-'+size.width+'.png')});
 await page.locator('[data-upgrade]').click();await controls();assert.match(await page.locator('.c262-actions strong').innerText(),/Level 3/);assert.match(await page.locator('[data-upgrade]').innerText(),/NEED 5 CARDS/);assert.match(await page.locator('[data-comparison]').innerText(),/Level 3/);
 await page.locator('[data-assign]').click();await controls();assert.match(await page.locator('[data-assign]').innerText(),/ASSIGNED/);assert.match(await page.locator('[data-comparison]').innerText(),/Currently assigned/);
 await panel.evaluate(el=>el.scrollTop=0);await controls();await page.locator('[data-select=vale]').click();await controls();assert.match(await page.locator('[data-comparison]').innerText(),/Level 1 preview/);assert.equal(await page.locator('[data-assign]').isDisabled(),true);
 await panel.evaluate(el=>el.scrollTop=el.scrollHeight);await controls();const equip=await page.locator('[data-equipment]').boundingBox(),bar=await page.locator('.c262-actions').boundingBox();assert.ok(equip.y+equip.height<=bar.y,'last content action is not covered');await page.locator('[data-equipment]').click();assert.equal(await page.locator('.c262-actions').count(),0);assert.equal(await panel.evaluate(el=>el.classList.contains('c262-commanders')),false);
 assert.deepEqual(errors,[]);await page.close();console.log('PASS persistent actions at all scroll positions, story flip, comparison, upgrade, assignment and cleanup at '+size.width+'px');
}
}finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
