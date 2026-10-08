import test from 'node:test';
import assert from 'node:assert/strict';
import {mobileViewport} from '../public/game/mobile-viewport.js';
test('phones and tablets choose orientation from available screen dimensions',()=>{
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1024,1366]]){
  assert.equal(mobileViewport({width,height}).orientation,'portrait');
  assert.equal(mobileViewport({width:height,height:width}).orientation,'landscape');
 }
});
test('an iOS visual keyboard preserves portrait and reports visible height',()=>{
 assert.deepEqual(mobileViewport({width:390,height:844,visibleHeight:330,offsetTop:25,editing:true,previousOrientation:'portrait'}),{orientation:'portrait',keyboard:true,height:330,top:25});
});
test('Android layout viewport shrinking for the keyboard does not select landscape',()=>{
 assert.equal(mobileViewport({width:390,height:300,editing:true,previousHeight:844,previousWidth:390,previousOrientation:'portrait'}).orientation,'portrait');
 assert.equal(mobileViewport({width:390,height:300,editing:true,previousHeight:844,previousWidth:390,previousOrientation:'portrait'}).keyboard,true);
});
test('rotation changes orientation while focused when screen width changes',()=>{
 const result=mobileViewport({width:844,height:390,editing:true,previousWidth:390,previousHeight:844,previousOrientation:'portrait'});
 assert.equal(result.orientation,'landscape');assert.equal(result.keyboard,false);
});
test('closing keyboard restores the full visible area',()=>{
 const result=mobileViewport({width:390,height:844,editing:false,previousOrientation:'portrait'});
 assert.equal(result.height,844);assert.equal(result.keyboard,false);
});
test('browser toolbar resizing does not imply an open keyboard',()=>{
 assert.equal(mobileViewport({width:390,height:844,visibleHeight:720,editing:false}).keyboard,false);
});
