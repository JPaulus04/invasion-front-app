const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('lsc_command_base_137',JSON.stringify({phase:13,bestPhase:12,credits:1500,parts:10,commander:4,hq:4}));});
 await page.goto('http://127.0.0.1:8193',{waitUntil:'load'});
 await page.locator('#l193-region').click();
 await page.locator('#rc-action').tap();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('lsc_command_base_137')).reclamation.progress['1,0']),1);
 await page.screenshot({path:'/workspace/scratch/5a61c896c72b/Build_193_Reclamation_Preview.png'});
 await page.locator('#rc-back').tap();
 assert.ok(await page.locator('#l137-deploy').isVisible());
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 console.log(JSON.stringify({result:'PASS: mobile tap saves progress, Campaign return works, no horizontal overflow',pageErrors:errors}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
