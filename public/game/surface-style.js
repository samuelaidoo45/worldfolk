// Prefer surveyed surface tags; a land-use zone is not evidence of paving.
const paved=['paved','asphalt','concrete','concrete:plates','concrete:lanes','paving_stones','sett','cobblestone'];
const bare=['unpaved','dirt','earth','ground','sand','gravel','fine_gravel','compacted','laterite'];
const green=['grass','park','garden','wood','forest','meadow','pitch','recreation_ground'];
export const surfaceClass=['case',
 ['in',['get','surface'],['literal',paved]],'paving',
 ['in',['get','surface'],['literal',bare]],'earth',
 ['in',['get','surface'],['literal',['grass','grass_paver']]],'grass',
 ['in',['get','class'],['literal',green]],'grass',
 ['in',['get','class'],['literal',['sand','beach','bare_rock','quarry','construction','brownfield']]],'earth',
 ['==',['get','class'],'parking'],'paving','unknown'];
export const groundColour=['match',surfaceClass,'paving','#969893','earth','#b09b7c','grass',
 ['match',['get','class'],['wood','forest'],'#526c49','pitch','#79865d','#8c9b70'],'#a8a398'];
export const unpavedRoad=['in',['get','surface'],['literal',bare]];
export function roadSurface(properties={}){
 if(bare.includes(properties.surface))return 'earth';
 if(['grass','grass_paver'].includes(properties.surface))return 'grass';
 return ['path','pedestrian','steps'].includes(properties.class)?'paving':'asphalt';
}
