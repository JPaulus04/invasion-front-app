(function(root){
 'use strict';
 var roster=[
  {id:'holt',name:'Colonel Holt',rarity:'Basic',cap:20,weight:65,unlock:0,color:'#a8c6b2',role:'Field leadership',strength:'Balanced rifle fire',weakness:'No specialist damage bonus',signature:'Steady Command',story:'Holt stayed when the evacuation orders came. With a battered field radio and a handful of volunteers, he held the crossing long enough for the last families to escape. He now measures victory in homes rebuilt, not ground taken.',damage:1,rate:1,boss:0,splash:0,protection:0},
  {id:'voss',name:'Captain Mara Voss',rarity:'Rare',cap:30,weight:25,unlock:10,color:'#78c7ff',role:'Precision fire',strength:'Bosses and armored transports',weakness:'Slower against scattered crowds',signature:'Marked Target',story:'Before the fall, Voss mapped mountain rescue routes. Today she studies the approaches to every settlement with the same patience. Her crews know the signal: one raised hand, one clear shot, everyone gets home.',damage:1.3,rate:.75,boss:.35,splash:0,protection:0},
  {id:'calder',name:'Sergeant Jax Calder',rarity:'Epic',cap:40,weight:8,unlock:15,color:'#c09aff',role:'Crowd control',strength:'Explosive rounds hit nearby enemies',weakness:'Slow firing; needs clustered targets',signature:'Breach Breaker',story:'Calder once cleared collapsed tunnels for the railway crews. When the roads fell silent, he turned his demolition tools toward the threats outside the barricades. Behind his booming laugh is an engineer who checks every escape route twice.',damage:1.4,rate:.55,boss:0,splash:.55,protection:0},
  {id:'vale',name:'Lieutenant Sera Vale',rarity:'Legendary',cap:50,weight:2,unlock:20,color:'#f4cf77',role:'Settlement protection',strength:'HQ and barriers take 15% less damage',weakness:'20% less direct weapon damage',signature:'Guardian Protocol',story:'Vale led the night watch at a settlement everyone else had written off. She learned to stretch a handful of supplies into another day of safety. Her field shield became a promise: the line holds until the last survivor is inside.',damage:.8,rate:1,boss:0,splash:0,protection:.15}
 ];
 function number(v,min,max,fallback){v=Number(v);return Number.isFinite(v)?Math.max(min,Math.min(max,Math.floor(v))):fallback;}
 function definition(id){return roster.find(function(d){return d.id===id;})||roster[0];}
 function day(now){var d=new Date(now===undefined?Date.now():now);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
 function ensure(meta){
  var old=meta.commanderCollection||{},units={},source=old.units||{};
  roster.forEach(function(d){var u=source[d.id]||{},legacy=d.id==='holt'?number(meta.commander,1,20,1):0;units[d.id]={level:Math.max(legacy,number(u.level,0,d.cap,0)),cards:number(u.cards,0,1000000,0)};});
  var active=roster.some(function(d){return d.id===old.active&&units[d.id].level>0;})?old.active:'holt';
  meta.commanderCollection={schema:260,active:active,units:units,lastDay:/^\d{4}-\d{2}-\d{2}$/.test(old.lastDay||'')?old.lastDay:'',draws:number(old.draws,0,1000000,0),lastReward:Array.isArray(old.lastReward)?old.lastReward.filter(function(r){return r&&roster.some(function(d){return d.id===r.id;})&&r.cards>0;}).map(function(r){return{id:r.id,cards:number(r.cards,1,20,1)};}).slice(0,4):[]};
  meta.commander=units.holt.level;return meta.commanderCollection;
 }
 function pool(meta){var c=ensure(meta),available=roster.filter(function(d){return c.units[d.id].level<d.cap;}),total=available.reduce(function(n,d){return n+d.weight;},0);return available.map(function(d){return{id:d.id,chance:d.weight/total};});}
 function chestReady(meta,now){return ensure(meta).lastDay<day(now)&&pool(meta).length>0;}
 function cost(meta,id){var u=ensure(meta).units[id],d=definition(id);if(!u||u.level>=d.cap)return null;return{cards:u.level?5+Math.floor(u.level/5)*5:d.unlock,credits:u.level?170+90*u.level:0};}
 function canUpgrade(meta,id){var price=cost(meta,id);return !!price&&ensure(meta).units[id].cards>=price.cards&&(Number(meta.credits)||0)>=price.credits;}
 function transaction(meta,save,change){
  ensure(meta);var before=JSON.parse(JSON.stringify(meta.commanderCollection)),credits=meta.credits,holt=meta.commander;
  try{var result=change(meta.commanderCollection);if(!result.ok)return result;meta.commander=meta.commanderCollection.units.holt.level;if(save()!==true)throw Error('save');return result;}catch(e){meta.commanderCollection=before;meta.credits=credits;meta.commander=holt;return{ok:false,message:'Could not save. Nothing was spent or claimed. Please try again.'};}
 }
 function openChest(meta,save,now,random){
  if(!chestReady(meta,now))return{ok:false,message:pool(meta).length?'Daily chest already claimed. Returns at local midnight.':'Every commander is at maximum level.'};
  var odds=pool(meta);random=random||Math.random;
  return transaction(meta,save,function(c){var rewards={};for(var i=0;i<4;i++){var roll=Math.max(0,Math.min(.999999999,Number(random())||0)),choice=odds[odds.length-1].id,cumulative=0;for(var j=0;j<odds.length;j++){cumulative+=odds[j].chance;if(roll<cumulative){choice=odds[j].id;break;}}rewards[choice]=(rewards[choice]||0)+5;c.units[choice].cards+=5;}c.lastDay=day(now);c.draws++;c.lastReward=Object.keys(rewards).map(function(id){return{id:id,cards:rewards[id]};});return{ok:true,rewards:c.lastReward,message:'20 commander cards added to your collection.'};});
 }
 function upgrade(meta,id,save){if(!roster.some(function(d){return d.id===id;})||!canUpgrade(meta,id))return{ok:false,message:'Collect the required cards and Credits first.'};var price=cost(meta,id);return transaction(meta,save,function(c){c.units[id].cards-=price.cards;meta.credits-=price.credits;c.units[id].level++;return{ok:true,message:definition(id).name+' '+(c.units[id].level===1?'recruited.':'advanced to level '+c.units[id].level+'.')};});}
 function assign(meta,id,save){var c=ensure(meta);if(!c.units[id]||!c.units[id].level)return{ok:false,message:'Recruit this commander first.'};return transaction(meta,save,function(state){state.active=id;return{ok:true,message:definition(id).name+' assigned to your next defense.'};});}
 function profile(meta,id){var c=ensure(meta),d=definition(id||c.active),level=c.units[d.id].level,l=Math.max(1,Math.min(20,level)),extra=Math.max(0,level-20);return{definition:d,level:level,tier:l>=20?5:l>=15?4:l>=10?3:l>=5?2:1,damageBonus:Math.min(4,l-1)*.15+Math.max(0,l-5)*.055+extra*.02,rateBonus:Math.min(4,l-1)*.06+Math.max(0,l-5)*.02+extra*.005,bossBonus:(l>=20?.2:l>=15?.1:0)+d.boss,commandUnlocked:level>=5,commandRate:l>=20?1.5:l>=10?1.4:1.35,commandDuration:l>=15?7:6,commandCooldown:l>=10?20:24};}
 function applyCombat(meta,run){var p=profile(meta),d=p.definition;run.commanderId=d.id;run.commanderName=d.name;run.commanderSplash=d.splash;run.hero.damage*=d.damage;run.hero.rate*=d.rate;run.hqDamageReduction=Math.min(.8,(run.hqDamageReduction||0)+d.protection);run.barrierDamageReduction=Math.min(.8,(run.barrierDamageReduction||0)+d.protection);return run;}
 root.LSCCommanders={roster:roster,definition:definition,ensure:ensure,day:day,pool:pool,chestReady:chestReady,cost:cost,canUpgrade:canUpgrade,openChest:openChest,upgrade:upgrade,assign:assign,profile:profile,applyCombat:applyCombat};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.LSCCommanders;
})(typeof window!=='undefined'?window:globalThis);
