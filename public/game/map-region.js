// Matches the self-hosted OSM extract and routing graph.
export const ACCRA_BOUNDS=Object.freeze({west:-.40,south:5.40,east:.12,north:5.83});
export const inAccra=(lng,lat)=>Number.isFinite(lng)&&Number.isFinite(lat)&&lng>=ACCRA_BOUNDS.west&&lng<=ACCRA_BOUNDS.east&&lat>=ACCRA_BOUNDS.south&&lat<=ACCRA_BOUNDS.north;
