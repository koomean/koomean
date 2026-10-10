import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const theme=fs.readFileSync('assets/theme-v1.js','utf8'),preferences=fs.readFileSync('src/preferences.js','utf8');
function setup(values={},dark=false,reduce=false,blocked=false) {
 const data=new Map(Object.entries(values)),events={},documentEvents={},mediaEvents={};
 const media={matches:dark,addEventListener:(_name,fn)=>mediaEvents.theme=fn},motionMedia={matches:reduce,addEventListener:(_name,fn)=>mediaEvents.motion=fn};
 const document={documentElement:{dataset:{},style:{}},querySelectorAll:()=>[],getElementById:()=>null,addEventListener:(name,fn)=>{(documentEvents[name]??=[]).push(fn)}};
 const window={matchMedia:()=>media,addEventListener:(name,fn)=>{(events[name]??=[]).push(fn)},dispatchEvent:()=>{}};
 const storage={getItem:k=>{if(blocked)throw Error('blocked');return data.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');data.set(k,v);}};
 const ctx=vm.createContext({document,window,localStorage:storage,matchMedia:()=>motionMedia,CustomEvent:class {constructor(name,detail){this.type=name;this.detail=detail;}}});vm.runInContext(theme,ctx);vm.runInContext(preferences,ctx);
 return {window,document,data,media,motionMedia,events,documentEvents,mediaEvents,change(el){documentEvents.change.forEach(fn=>fn({target:el}));}};
}
test('no saved theme follows system and saved selection overrides system',()=>{
 const x=setup({},true);assert.equal(x.document.documentElement.dataset.theme,'dark');x.media.matches=false;x.mediaEvents.theme();assert.equal(x.document.documentElement.dataset.theme,'light');x.window.KooTheme.set('dark');assert.equal(x.data.get('koomean_site_theme_v1'),'dark');assert.equal(x.document.documentElement.dataset.theme,'dark');
 const restored=setup(Object.fromEntries(x.data),false);assert.equal(restored.document.documentElement.dataset.theme,'dark');
});
test('corrupt storage and blocked storage retain a usable system theme',()=>{
 for(const blocked of [false,true]) {const x=setup({'koomean_site_theme_v1':'garbage','koomean_site_prefs_v1':'{'},true,false,blocked);assert.equal(x.document.documentElement.dataset.theme,'dark');x.window.KooTheme.set('light');assert.equal(x.document.documentElement.dataset.theme,'light');assert.equal(x.window.SitePreferences.value.showVideo,true);}
});
test('settings persist and reset, with motion always honoring system accessibility',()=>{
 const x=setup({},false,true);assert.equal(x.document.documentElement.dataset.reduceMotion,'true');
 x.change({matches:s=>s==='[data-site-pref]',dataset:{sitePref:'showVideo'},type:'checkbox',checked:false});assert.equal(JSON.parse(x.data.get('koomean_site_prefs_v1')).showVideo,false);
 const restored=setup(Object.fromEntries(x.data));assert.equal(restored.window.SitePreferences.value.showVideo,false);restored.window.SitePreferences.reset();assert.equal(restored.window.SitePreferences.value.showVideo,true);assert.equal(restored.window.KooTheme.preference,'auto');
});
test('same-origin tabs receive preference updates through storage events',()=>{
 const x=setup();x.data.set('koomean_site_theme_v1','dark');x.events.storage.forEach(fn=>fn({key:'koomean_site_theme_v1'}));assert.equal(x.document.documentElement.dataset.theme,'dark');
 x.data.set('koomean_site_prefs_v1',JSON.stringify({motion:'reduce',dataSaver:true,showVideo:false}));x.events.storage.forEach(fn=>fn({key:'koomean_site_prefs_v1'}));assert.equal(x.window.SitePreferences.value.showVideo,false);assert.equal(x.document.documentElement.dataset.dataSaver,'true');
});
