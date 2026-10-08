import test from 'node:test';
import assert from 'node:assert/strict';
import {requestDisplayOrientation,mobileCameraScale,mobileFieldOfView} from '../public/game/display-settings.js';
import {chaseCamera} from '../public/game/chase-camera.js';
test('orientation request enters fullscreen before locking from a user action',async()=>{
 const calls=[],doc={fullscreenEnabled:true,documentElement:{requestFullscreen:async()=>calls.push('fullscreen')}},orientation={unlock:()=>calls.push('unlock'),lock:async mode=>calls.push(mode)};
 assert.deepEqual(await requestDisplayOrientation('landscape',doc,orientation),{locked:true,mode:'landscape'});
 assert.deepEqual(calls,['unlock','fullscreen','landscape']);
});
test('Auto releases rotation without requesting fullscreen',async()=>{
 let unlocks=0;assert.deepEqual(await requestDisplayOrientation('auto',{}, {unlock:()=>unlocks++}),{locked:false,mode:'auto'});assert.equal(unlocks,1);
});
test('unsupported devices return manual rotation without entering fullscreen',async()=>{
 const doc={fullscreenEnabled:true,documentElement:{requestFullscreen:()=>{throw Error('must not run')}}};
 assert.deepEqual(await requestDisplayOrientation('portrait',doc,{}),{locked:false,mode:'portrait'});
});
test('rejected fullscreen and lock return a usable manual fallback',async()=>{
 const doc={fullscreenEnabled:true,documentElement:{requestFullscreen:async()=>{throw Error('denied')}}};
 assert.deepEqual(await requestDisplayOrientation('landscape',doc,{lock:async()=>{throw Error('unsupported')}}),{locked:false,mode:'landscape'});
});
test('already fullscreen does not re-request fullscreen',async()=>{
 const doc={fullscreenElement:{},documentElement:{requestFullscreen:()=>{throw Error('must not run')}}};
 assert.equal((await requestDisplayOrientation('portrait',doc,{lock:async()=>{}})).locked,true);
});
test('phone portrait framing widens while desktop framing stays unchanged',()=>{
 assert.equal(mobileCameraScale(390,844,false),1);
 assert.ok(mobileCameraScale(390,844,true)>mobileCameraScale(844,390,true));
 assert.ok(mobileCameraScale(320,900,true)<=1.55);
 assert.ok(mobileFieldOfView(58,390,844,true)>58);
 assert.equal(mobileFieldOfView(58,844,390,true),58);
 assert.equal(mobileFieldOfView(58,390,844,false),58);
 assert.ok(mobileFieldOfView(72,320,900,true)<=95);
});
test('wider framing preserves first-person position and collision safety',()=>{
 const position=[-.19,5.56],scale=mobileCameraScale(390,844,true);
 assert.ok(chaseCamera({position,heading:0,street:true,viewScale:scale}).distance>8);
 assert.equal(chaseCamera({position,heading:0,cabin:true,viewScale:scale}).distance,0);
 const blocked=chaseCamera({position,heading:0,street:true,viewScale:scale,physics:{collision:()=>true}});
 assert.ok(blocked.distance<.5);
});
