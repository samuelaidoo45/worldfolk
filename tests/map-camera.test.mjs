import test from 'node:test';import assert from 'node:assert/strict';
import * as T from '../public/game/three.module.js';import {syncMapCamera} from '../public/game/map-camera.js';
test('map PBR camera uses the actual eye without moving geometry or player labels',()=>{
 for(const eye of [[12,4,7],[-38,21,140],[0,1.65,0]]){
  const original=new T.PerspectiveCamera(58,16/9,.1,4000);original.position.set(...eye);original.lookAt(0,1,-8);original.updateMatrixWorld();const combined=original.projectionMatrix.clone().multiply(original.matrixWorldInverse),camera=new T.Camera();syncMapCamera(camera,combined);
  assert.ok(camera.position.distanceTo(original.position)<1e-7);
  for(const point of [[1,2,3],[-50,30,-100],[10,0,25]]){const a=new T.Vector3(...point).applyMatrix4(combined),b=new T.Vector3(...point).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);assert.ok(a.distanceTo(b)<1e-7)}
 }
});
