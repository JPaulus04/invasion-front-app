const fs=require('node:fs'),cp=require('node:child_process');
const file='src/isometricMap221.js';let r=fs.readFileSync(file,'utf8');
function swap(a,b){if(r.split(a).length!==2)throw Error('254 missing/repeated anchor: '+a);r=r.replace(a,b);}
swap(' function project(t,c,v){',fs.readFileSync('scripts/connected-terrain-254.txt','utf8')+'\n function project(t,c,v){');
swap('surveyedEdges:groundEdges251(pixels)};revision++;','surveyedEdges:groundEdges251(pixels)};revision++;prepare254();');
swap('terrainTiles248[a[0]]=im;revision++;',"terrainTiles248[a[0]]=a[0]==='water'?im:deck254(im);revision++;");
swap('return im&&im.complete&&im.naturalWidth;','return im&&(im.naturalWidth||im.width);');
swap("function draw(name){g.drawImage(terrainTiles248[name],p.x-s/2,p.y-s/4,s,s/2);}","function draw(name){if(name==='water'){water254(p,t);return;}g.drawImage(terrainTiles248[name],p.x-s/2,p.y-s/4,s,s/2);}");
swap('if(name)draw(name);',"water254(p,t);if(name)draw(name);");
swap('  function standalone(',`  function mask254(t){var m=0;[[1,0,1],[-1,0,2],[0,1,4],[0,-1,8],[1,1,16],[1,-1,32],[-1,1,64],[-1,-1,128]].forEach(function(a){var id=(t.x+a[0])+','+(t.y+a[1]),q=tiles[id];if(q&&d.visible[id]&&q.terrain==='water')m|=a[2];});return canonical254(m);}
  function ordinary254(t){return t.terrain==='hill'&&!(api.mountain?api.mountain(t.id):Math.abs(t.x*11+t.y*17)%3===0);}
  function water254(p,t){
   if(!connected254.water)return;var pattern=g.createPattern(connected254.water,'repeat');if(!pattern)return;
   g.save();diamond(g,p,s+1.2);g.clip();var x=(t.x-t.y)*64,y=(t.x+t.y)*32;
   g.translate(p.x-x*s/128,p.y-y*s/128);g.scale(s/128,s/128);g.fillStyle=pattern;g.fillRect(x-65,y-33,130,66);g.restore();
  }
  function ground254(p,t,colored){
   if(t.terrain==='water'){water254(p,t);return;}
   if(connected254.ready&&(t.terrain==='bank'||ordinary254(t))){
    var mask=t.terrain==='bank'?mask254(t):0,pair=t.terrain==='bank'?connected254.banks[mask]:connected254.rubble[Math.abs(t.x*7+t.y*13)%4];
    g.drawImage(pair[colored?0:1],p.x-(s+1)/2,p.y-(s+1)/4,s+1,(s+1)/2);return;
   }sprite(p,t.terrain==='bank'?'sand':t.terrain==='hill'?'rock':'grass',s+1,colored,true);
  }
  function standalone(`);
swap("sprite(p,t.terrain==='water'?'water':t.terrain==='bank'?'sand':t.terrain==='hill'?'rock':'grass',s+1,colored,true);",'ground254(p,t,colored);');
swap('groundTransition251(p,t,colored);shore253(p,t);','groundTransition251(p,t,colored);');
swap("function name(q){return q.terrain==='plain'?'grass':q.terrain==='hill'?'rock':q.terrain==='bank'?'sand':null;}","function name(q){return q.terrain==='plain'||ordinary254(q)?'grass':q.terrain==='hill'?'rock':null;}");
swap('if(!next||!d.visible[id]||!!d.cleared[id]!==colored)return;','if(!next||!d.visible[id])return;');
swap('if(!art||other===own)return;','if(!art||(other===own&&!!d.cleared[id]===colored))return;');
swap("art[colored?'colorEdges':'surveyedEdges'][edge]","art[d.cleared[id]?'colorEdges':'surveyedEdges'][edge]");
fs.writeFileSync(file,r);cp.execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log('Build 254 connected terrain ready.');
