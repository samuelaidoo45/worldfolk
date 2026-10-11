import {distanceMetres,bearingTo} from './motion.js';
const radians=Math.PI/180;
// Render animation follows travelled distance, including accelerated rides. A
// location jump resets the sample instead of spinning wheels or flashing brakes.
export function updateVehicleMotion(model,position,heading,dt,preset='day'){
 if(!model?.animateVehicle)return;
 const previous=model.motionSample;model.motionSample={position:[...position],heading};
 if(!previous||dt<=0){model.animateVehicle({preset},0);return}
 const distance=distanceMetres(previous.position,position);
 if(distance>35){model.motionSpeed=0;model.animateVehicle({preset},0);return}
 const direction=distance>.001?Math.cos((bearingTo(previous.position,position)-heading)*radians):1;
 const signed=distance*(direction<0?-1:1),speed=distance/Math.max(.001,dt);
 const turn=((heading-previous.heading+540)%360-180)*radians;
 const steer=distance>.015?Math.max(-.48,Math.min(.48,-Math.atan(turn*2.34/signed))):0;
 const braking=(model.motionSpeed||0)>1&&(model.motionSpeed-speed)/dt>1.8;
 model.motionSpeed=speed;
 model.animateVehicle({distance:signed,steer,braking,preset},dt);
}
