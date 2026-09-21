#!/usr/bin/env node
const fs=require('fs');
let c=fs.readFileSync('src/config.js','utf8');
c=c.replace(/const LSC_BUILD = '\d+';/,"const LSC_BUILD = '235';").replace(/Build 23[0-9]/g,'Build 235');
fs.writeFileSync('src/config.js',c,'utf8');
let b=fs.readFileSync('build.js','utf8');
b=b.replace(/Build 23[0-9]/g,'Build 235').replace(/LSC_BUILD = '23[0-9]'/g,"LSC_BUILD = '235'").replace(/Last Stand Command 23[0-9]/g,'Last Stand Command 235');
fs.writeFileSync('build.js',b,'utf8');
console.log('LSC build marker: 235');
