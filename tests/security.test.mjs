import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync('src/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function section(start,end) { return source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start))); }
function runtime(code, extra={}) { const ctx=vm.createContext({URL,URLSearchParams,AbortController,setTimeout,clearTimeout,console,...extra});vm.runInContext(code,ctx);return ctx; }
test('links reject executable URLs, credentials and control characters',()=>{
 const x=runtime(section('    function isSafeUrl','    function getIconColor'));
 for(const url of ['javascript:alert(1)','data:text/html,hi','https://user:pass@example.com','https://example.com/\nx','https://example.com/ x'])assert.equal(x.isSafeUrl(url),false,url);
 assert.equal(x.isSafeUrl('https://example.com/a?q=hello%20world'),true);
});
test('neutral brand icons follow the selected palette',()=>{
 const x=runtime(section('    function getIconColor','    function decodeJwt'));
 for(const icon of ['fab fa-github','fab fa-tiktok','fab fa-x-twitter'])assert.equal(x.getIconColor(icon),'var(--text-main)');
});
test('YouTube ID extraction only accepts supported HTTPS hosts',()=>{
 const x=runtime(section('    function youtubeId','    function setFeaturedVideo'));
 for(const url of ['https://youtu.be/abcdefghijk','https://www.youtube.com/watch?v=abcdefghijk','https://www.youtube.com/shorts/abcdefghijk'])assert.equal(x.youtubeId(url),'abcdefghijk');
 for(const url of ['https://evil.example/youtu.be/abcdefghijk','http://youtu.be/abcdefghijk','https://youtube.com.evil.example/watch?v=abcdefghijk','https://youtu.be/too-short','https://user@youtu.be/abcdefghijk'])assert.equal(x.youtubeId(url),'');
});
test('session migration removes persistent tokens and saves in tab storage',()=>{
 const persistent=new Map([['koomean_session_v3','old-token']]), tab=new Map();
 const storage=map=>({getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)});
 const x=runtime("const SESSION_KEY='koomean_session_v4',LEGACY_SESSION_KEY='koomean_session_v3';"+section('    function saveSession','    // ═',),{localStorage:storage(persistent),sessionStorage:storage(tab)});
 assert.equal(x.loadSession(),null);assert.equal(persistent.size,0);
 x.saveSession('user@example.test','User','','test-only-token');assert.equal(persistent.size,0);assert.equal(JSON.parse(tab.get('koomean_session_v4')).idToken,'test-only-token');x.clearSession();assert.equal(tab.size,0);
});
function fetchRuntime(fetch) {
 return runtime('const FETCH_TIMEOUT=1000,MAX_RETRIES=2;let identityEpoch=0;const state={idToken:"test",inflightCtrl:null};const inCooldown=()=>false;const CLIENT_UA="test";const API_URL="https://api.example";let rateLimited=0;const noteRateLimited=()=>rateLimited++;'+section('    async function requestJson','    // ═'),{fetch});
}
test('429 is not retried; the retry header is observed',async()=>{
 let calls=0;const x=fetchRuntime(async()=>{calls++;return{status:429,ok:false,headers:{get:()=> '60'}}});
 await assert.rejects(x.robustFetch('https://api.example'),/429/);assert.equal(calls,1);assert.equal(vm.runInContext('rateLimited',x),1);
});
test('5xx is retried and authenticated writes are not retried',async()=>{
 let calls=0;const x=fetchRuntime(async()=>{calls++;return calls===1?{status:503,ok:false,headers:{get:()=>null}}:{status:200,ok:true,json:async()=>({success:true})}});
 await x.robustFetch('https://api.example');assert.equal(calls,2);
 calls=0;await assert.rejects(x.postData('updateLink'),/503/);assert.equal(calls,1);
});
test('an authenticated response cannot commit after the identity changes',async()=>{
 let resolve;const x=fetchRuntime(()=>new Promise(r=>{resolve=r}));const pending=x.postData('updateLink');vm.runInContext('identityEpoch++',x);resolve({status:200,ok:true,json:async()=>({success:true})});await assert.rejects(pending,/superseded/);
});
test('CSP build has no inline executable code or countdown theme controls',()=>{
 const html=fs.readFileSync('index.html','utf8');assert.match(html,/script-src-attr 'none'/);assert.doesNotMatch(html,/<script(?:\s[^>]*)?>\s*[^<\s]/);assert.doesNotMatch(html,/\son(?:click|error|load)=/i);
 const countdown=html.slice(html.indexOf('id="global-maintenance-overlay"'),html.indexOf('<div id="scroll-progress"'));
 assert.doesNotMatch(countdown,/<select|data-koo-theme/);assert.match(html,/id="settings-theme" data-koo-theme/);
 assert.doesNotMatch(html,/cdnjs.cloudflare.com|fonts.googleapis.com|fonts.gstatic.com/);
 const manifest=JSON.parse(fs.readFileSync('build-manifest.json'));for(const file of manifest.assets)assert.ok(fs.existsSync(file));
});
test('a bootstrap that completes after logout cannot restore login or private links',async()=>{
 let resolve;const x=runtime('let identityEpoch=0,loadSequence=0,apiHealthyAt=0;const state={idToken:"test",isLoggedIn:false,allLinks:[]};const API_URL="https://api.example",CLIENT_UA="test",MAX_RETRIES=2;'+section('    async function loadData','    // ═'),{robustFetch:()=>new Promise(r=>{resolve=r})});
 const pending=x.loadData('user@example.test','User');vm.runInContext('identityEpoch++;loadSequence++;state.idToken=null;',x);
 resolve({success:true,user:{email:'user@example.test',role:'admin'},links:[{title:'Private',group:'admin'}]});await pending;
 assert.equal(vm.runInContext('state.isLoggedIn',x),false);assert.equal(vm.runInContext('state.allLinks.length',x),0);
});
test('the request timeout remains active while JSON body is being read',async()=>{
 let timer,cleared=false;
 const x=fetchRuntime(async(_url,opts)=>({status:200,ok:true,json:()=>new Promise((_resolve,reject)=>{opts.signal.addEventListener('abort',()=>reject(Object.assign(new Error('aborted'),{name:'AbortError'})));})}));
 x.setTimeout=fn=>{timer=fn;return 1;};x.clearTimeout=()=>{cleared=true;};
 const pending=x.requestJson('https://api.example');await new Promise(r=>setImmediate(r));assert.equal(cleared,false);timer();await assert.rejects(pending,/aborted/);assert.equal(cleared,true);
});
test('an empty initial image is pending rather than an outage',()=>{
 const img={getAttribute:()=>'',complete:true,naturalWidth:0};const x=runtime(section('    function mediaComponentsStatus','    DOM.mainProfileImg.addEventListener'),{DOM:{mainProfileImg:img}});
 assert.equal(x.mediaComponentsStatus(),'checking');img.getAttribute=()=>'/assets/avatar.svg';img.complete=false;assert.equal(x.mediaComponentsStatus(),'checking');img.complete=true;img.naturalWidth=100;assert.equal(x.mediaComponentsStatus(),'ok');img.naturalWidth=0;assert.equal(x.mediaComponentsStatus(),'error');
});
