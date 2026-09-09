(function(root){
  'use strict';
  function valid(meta){return meta&&typeof meta==='object'&&!Array.isArray(meta)&&Number.isFinite(meta.phase)&&meta.phase>=1&&Number.isFinite(meta.credits)&&meta.credits>=0;}
  function list(storage,key){var raw=storage.getItem(key);if(!raw)return [];var value=JSON.parse(raw);if(!Array.isArray(value)||!value.every(function(s){return s&&valid(s.meta)&&typeof s.id==='string';}))throw Error('Backup data is unreadable. No save was changed.');return value;}
  function activate(storage,activeKey,backupKey,current,next){
    try{
      if(!valid(current)||!valid(next))throw Error('Invalid campaign. No save was changed.');
      var snapshots=list(storage,backupKey);
      if(snapshots.length>=20)throw Error('20 campaign backups already exist. Restart cancelled to preserve them.');
      var previous=JSON.stringify(current),target=JSON.stringify(next),stamp=Date.now();
      snapshots.push({id:String(stamp)+'-'+snapshots.length,createdAt:stamp,meta:JSON.parse(previous)});
      var archive=JSON.stringify(snapshots);
      storage.setItem(backupKey,archive);
      if(storage.getItem(backupKey)!==archive)throw Error('Backup verification failed. Restart cancelled.');
      storage.setItem(activeKey,target);
      return {ok:true};
    }catch(e){return {ok:false,reason:e.message||'Unable to save. Your active campaign was not switched.'};}
  }
  root.LSCCampaignSaves=Object.freeze({list:list,activate:activate});
})(typeof window!=='undefined'?window:globalThis);
