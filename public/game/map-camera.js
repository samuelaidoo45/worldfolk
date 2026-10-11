import * as THREE from './three.module.js';
// MapLibre supplies a combined clip matrix. Keeping it as Three's projection
// with an identity view puts the lighting camera at the player (0,0,0).
// Recover the perspective eye, then factor out its translation. The final clip
// transform is unchanged, but PBR view vectors and reflections use the real eye.
export function syncMapCamera(camera,combined){
 const eye=new THREE.Vector4(0,0,1,0).applyMatrix4(combined.clone().invert());
 if(Number.isFinite(eye.w)&&Math.abs(eye.w)>1e-12){eye.divideScalar(eye.w);camera.position.set(eye.x,eye.y,eye.z)}else camera.position.set(0,0,0);
 camera.updateMatrixWorld(true);
 camera.projectionMatrix.copy(combined).multiply(camera.matrixWorld);
 camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}
