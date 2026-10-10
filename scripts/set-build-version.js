#!/usr/bin/env node
const fs=require('fs');
let c=fs.readFileSync('src/config.js','utf8');
if(!/const LSC_BUILD = '\d+';/.test(c))throw Error('LSC build marker missing');
c=c.replace(/const LSC_BUILD = '\d+';/,"const LSC_BUILD = '298';").replace(/Build 2\d\d/g,'Build 298');
fs.writeFileSync('src/config.js',c,'utf8');

let b=fs.readFileSync('build.js','utf8');
b=b.replace(/Build 2\d\d/g,'Build 298')
   .replace(/LSC_BUILD = '2\d\d'/g,"LSC_BUILD = '298'")
   .replace(/Last Stand Command 2\d\d/g,'Last Stand Command 298');
if(!b.includes("'commanders260.js'"))b=b.replace("  'campaignSaves.js',", "  'campaignSaves.js',\n  'commanders260.js',\n  'commanderView260.js',");
if(!b.includes("'defensePreparation268.js'"))b=b.replace("  'campaignSaves.js',", "  'campaignSaves.js',\n  'defensePreparation268.js',");
fs.writeFileSync('build.js',b,'utf8');
let map=fs.readFileSync('src/isometricMap221.js','utf8');
map=map.replace("else if(selected&&d.visible[selected]&&api.ironDeposit(selected))", "else if(selected==='0,0')badge(selected,'HEADQUARTERS','#efcf80');\n  else if(selected&&d.visible[selected]&&!api.tile(selected).town&&api.ironDeposit(selected))");
map=map.replace("else if(selected&&d.visible[selected]&&api.stoneDeposit(selected))", "else if(selected&&d.visible[selected]&&!api.tile(selected).town&&api.stoneDeposit(selected))");
fs.writeFileSync('src/isometricMap221.js',map,'utf8');
console.log('LSC build marker: 298');
