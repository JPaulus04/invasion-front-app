#!/usr/bin/env node
const fs=require('fs');
let c=fs.readFileSync('src/config.js','utf8');
if(!/const LSC_BUILD = '\d+';/.test(c))throw Error('LSC build marker missing');
c=c.replace(/const LSC_BUILD = '\d+';/,"const LSC_BUILD = '257';").replace(/Build 2\d\d/g,'Build 257');
fs.writeFileSync('src/config.js',c,'utf8');

let b=fs.readFileSync('build.js','utf8');
b=b.replace(/Build 2\d\d/g,'Build 257')
   .replace(/LSC_BUILD = '2\d\d'/g,"LSC_BUILD = '257'")
   .replace(/Last Stand Command 2\d\d/g,'Last Stand Command 257');
fs.writeFileSync('build.js',b,'utf8');
console.log('LSC build marker: 257');
