export type Ride={routeId:string;startedAt:number;endsAt:number;coordinates?:number[][];name?:string;kind?:string;fare?:number;rideId?:string;progress?:number;progressAt?:number};
export async function roadRoute(from:number[],to:number[]){
 const url=new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${from.join(',')};${to.join(',')}`);
 url.search=new URLSearchParams({access_token:TOKEN,geometries:'geojson',overview:'full',steps:'false',radiuses:'100;100'}).toString();
 const response=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error('Routing unavailable');
 const data=await response.json() as {routes?:{distance:number;duration:number;geometry:{coordinates:number[][]}}[]};const route=data.routes?.[0];
 if(!route||!Number.isFinite(route.duration)||route.geometry.coordinates.length<2||route.geometry.coordinates.length>20000)throw new Error('No road route');
 return {coordinates:route.geometry.coordinates,seconds:Math.max(25,Math.min(1800,Math.round(route.duration)))};
}
const TOKEN='REMOVED';
