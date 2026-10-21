import {accraRoute} from '../../../server/maps/router';
export type Ride={terminalId?:string;serviceId?:string;destinationId?:string;vehicle?:string;vehicleColor?:number;routeId:string;startedAt:number;endsAt:number;coordinates?:number[][];name?:string;kind?:string;fare?:number;rideId?:string;progress?:number;progressAt?:number};
export async function roadRoute(from:number[],to:number[]){
 const route=await accraRoute(from,to,'driving');
 return {coordinates:route.geometry.coordinates,seconds:Math.max(25,Math.min(1800,Math.round(route.duration)))};
}
