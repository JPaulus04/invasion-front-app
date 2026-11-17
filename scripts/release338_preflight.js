// Read-only Apple lookup. No secrets, JWTs or raw error bodies are logged.
const crypto = require('node:crypto');
const fs = require('node:fs');
async function main() {
  const key = crypto.createPrivateKey(Buffer.from(process.env.ASC_API_KEY, 'base64'));
  const now = Math.floor(Date.now()/1000);
  const b64 = x => Buffer.from(JSON.stringify(x)).toString('base64url');
  const unsigned = b64({alg:'ES256',kid:process.env.ASC_KEY_ID,typ:'JWT'})+'.'+b64({iss:process.env.ASC_ISSUER_ID,iat:now,exp:now+300,aud:'appstoreconnect-v1'});
  const token = unsigned+'.'+crypto.sign('sha256',Buffer.from(unsigned),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');
  async function get(path) {
    const r = await fetch('https://api.appstoreconnect.apple.com/v1/'+path,{headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(30000)});
    if(!r.ok) throw new Error('Apple preflight HTTP '+r.status);
    return r.json();
  }
  const apps = await get('apps?filter[bundleId]=com.paulus.laststandcommand');
  const app = apps.data?.find(a=>a.attributes.bundleId==='com.paulus.laststandcommand');
  if(!app) throw new Error('Apple preflight: app not accessible');
  const number = process.env.RELEASE_BUILD_NUMBER;
  if(!/^\d+$/.test(number)) throw new Error('Apple preflight: invalid build number');
  const builds = await get('builds?filter[app]='+encodeURIComponent(app.id)+'&filter[version]='+number+'&limit=1');
  if(builds.data?.length) throw new Error('Apple preflight: build '+number+' already exists; refusing duplicate upload');
  const url = 'https://appstoreconnect.apple.com/apps/'+app.id+'/testflight/ios';
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, 'Build '+number+' is unused. App: '+url+'\n');
  console.log('Apple preflight passed: build '+number+' unused. '+url);
}
main().catch(e=>{console.error(e.message.startsWith('Apple preflight')?e.message:'Apple preflight failed; sensitive details withheld');process.exitCode=1;});
