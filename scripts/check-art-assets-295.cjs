#!/usr/bin/env node
// Validate real PNG files before art-preview integration.
// Default permits an unfinished branch; --require-assets gates release.
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const required=['assets/new-art/hq-l1.png','assets/new-art/lumber-l1.png','assets/new-art/quarry-l1.png'];
const strict=process.argv.includes('--require-assets');
let missing=0;
for(const file of required){
 if(!fs.existsSync(file)){
  missing++;
  if(strict)throw Error('Missing production sprite: '+file);
  console.log('PENDING '+file+' (not yet installed)');
  continue;
 }
 const bytes=fs.readFileSync(file);
 assert.ok(bytes.length>32,file+': invalid PNG');
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',file+': not PNG');
 assert.equal(bytes.toString('ascii',12,16),'IHDR',file+': missing IHDR');
 const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);
 const depth=bytes[24],color=bytes[25];
 const minSide=file.includes('quarry-l1')?512:128;
 assert.ok(w>=minSide&&w<=2048&&h>=minSide&&h<=2048,file+': unsupported dimensions (minimum '+minSide+'px)');
 assert.equal(depth,8,file+': expected 8-bit channel depth');
 assert.ok(color===6||color===4,file+': requires true alpha channel (RGBA/gray-alpha)');
 console.log('PASS '+file+' '+w+'x'+h+' with alpha');
}
if(missing&&!strict)console.log('Art preview remains unavailable until binary assets are installed.');
