#!/usr/bin/env node
const fs=require('fs');
let c=fs.readFileSync('src/config.js','utf8');
if(!/const LSC_BUILD = '\d+';/.test(c))throw Error('LSC build marker missing');
c=c.replace(/const LSC_BUILD = '\d+';/,"const LSC_BUILD = '239';").replace(/Build 23[0-9]/g,'Build 239');
fs.writeFileSync('src/config.js',c,'utf8');
let b=fs.readFileSync('build.js','utf8');
b=b.replace(/Build 23[0-9]/g,'Build 239').replace(/LSC_BUILD = '23[0-9]'/g,"LSC_BUILD = '239'").replace(/Last Stand Command 23[0-9]/g,'Last Stand Command 239');
fs.writeFileSync('build.js',b,'utf8');
console.log('LSC build marker: 239');
