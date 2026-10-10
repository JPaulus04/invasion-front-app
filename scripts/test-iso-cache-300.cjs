'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('src/isometricMap221.js','utf8');
const operations=[];
function pen(){
 const p={drawImage(...args){operations.push({type:'draw',args});},fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},save(){},restore(){},clip(){},setTransform(){},translate(){},transform(){},arc(){},fillText(){},measureText(t){return {width:String(t).length*7};},setLineDash(){}};
 return p;
}
const off={width:0,height:0,getContext(){return pen();}};
const doc={createElement(type){assert.equal(type,'canvas');return off;}};
const tiles={'0,0':{id:'0,0',x:0,y:0,terrain:'plain'}};
const api={tiles,currentRegionObjective(){return null;},jobs(){return [];},stoneDeposit(){return false;},ironDeposit(){return false;}};
const root={document:doc,devicePixelRatio:2,LSCSettlement:api,LSCArt295:{getMode(){return 'preview';},ready(){return false;}}};
vm.runInNewContext(src,root,{filename:'isometricMap221.js'});
const g=pen(),m={settlement204:{visible:{'0,0':true},cleared:{'0,0':true},buildings:{},roads:{},welcomed:{},defended:{},fishing:{},queue:[],at:1}},v={w:390,h:700},c={x:0,y:0,scale:70},cache={};
function paint(time){operations.length=0;root.LSCIso221.paint(g,m,v,c,null,[],time,cache);const d=operations.filter(x=>x.type==='draw'&&x.args[0]===off);assert.equal(d.length,1,'One cached map blit required');const a=d[0].args;assert.ok(a.slice(1).every(Number.isFinite),'Cache blit must have finite geometry');assert.ok(a[3]>=v.w&&a[4]>=v.h,'Cache must cover viewport');return a;}
let a=paint(0);assert.equal(a[1],-160);assert.equal(a[2],-160);assert.equal(a[3],710);assert.equal(a[4],1020);
assert.equal(cache.isoView.w,710);assert.equal(cache.isoView.h,1020);
a=paint(30);assert.equal(a[1],-160,'Static cache must retain origin');
c.x=1;a=paint(60);assert.ok(a[1]<0&&a[1]+a[3]>=v.w,'Pan must not leave horizontal gaps');
c.x=-1;a=paint(90);assert.ok(a[1]<0&&a[1]+a[3]>=v.w,'Reverse pan must not leave horizontal gaps');
c.scale=45;a=paint(120);assert.ok(a[3]>=v.w&&a[4]>=v.h,'Zoom out must cover viewport');
c.scale=100;a=paint(160);assert.ok(a[3]>=v.w&&a[4]>=v.h,'Zoom in must cover viewport');
console.log('PASS: Build 300 camera cache blit coverage, pan and zoom');
