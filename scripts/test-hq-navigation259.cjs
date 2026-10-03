// Optional rendered QA: LSC_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/test-hq-navigation259.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.LSC_PLAYWRIGHT_MODULE||'playwright');
const base=path.resolve('www');
const server=http.createServer((req,res)=>{const file=path.resolve(base,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403);res.end();return;}try{res.end(fs.readFileSync(file===base?path.join(base,'index.html'):file));}catch(e){res.writeHead(404);res.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await chromium.launch({headless:true,args:['--no-sandbox']});for(const width of [320,390,430]){const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
async function dock(){assert.equal(await page.locator('nav.l259-dock:visible').count(),1);for(const button of await page.locator('nav.l259-dock:visible button:visible').all()){const r=await button.boundingBox();assert.ok(r.height>=44&&r.x>=0&&r.x+r.width<=width+.5&&r.y+r.height<=844.5,'navigation stays visible and tappable');}}
await page.locator('#settlement-world [data-hqhub]').click();await dock();assert.match(await page.locator('[data-sheet]').innerText(),/Headquarters/);
await page.getByRole('button',{name:'DEFENSE UPGRADES',exact:true}).click();await dock();assert.match(await page.locator('#l137-panel').innerText(),/DEFENSE UPGRADES/);
for(const section of ['commander','inventory','hq']){await page.locator('#l259-external-dock [data-section-'+section+']').click();await dock();assert.equal(await page.locator('#l259-external-dock [data-section-'+section+']').getAttribute('aria-pressed'),'true');}
await page.locator('#l259-external-dock [data-section-settlement]').click();await dock();assert.match(await page.locator('[data-sheet]').innerText(),/Settlement Development/);
await page.locator('#settlement-world [data-world]').click();assert.equal(await page.locator('[data-hq-sections]').isVisible(),false);
await page.locator('#settlement-world [data-home]').click();assert.match(await page.locator('[data-sheet]').innerText(),/Headquarters/);
for(const route of ['build','people','research','hqhub','world']){await page.locator('#settlement-world [data-hqhub]').click();await page.locator('#settlement-world [data-section-hq]').click();await page.locator('#l259-external-dock [data-'+route+']').click();await dock();assert.equal(await page.locator('#l259-external-dock').count(),0);}
assert.deepEqual(errors,[]);await page.close();console.log('PASS rendered HQ navigation at '+width+'px');}}finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
