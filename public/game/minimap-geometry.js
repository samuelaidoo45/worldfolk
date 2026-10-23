// Keep bounds with each tile snapshot. Coordinates remain untouched so polygon
// holes, long crossing roads and the existing canvas projection stay intact.
function boundsFor(coords){
 if(!coords?.length)return null;
 let west=Infinity,south=Infinity,east=-Infinity,north=-Infinity;
 for(const [lng,lat] of coords){west=Math.min(west,lng);south=Math.min(south,lat);east=Math.max(east,lng);north=Math.max(north,lat)}
 return [west,south,east,north];
}

export function createMiniMapGeometry({land=[],water=[],buildings=[],roads=[]}){
 const polygons=[],segments=[];
 function addPolygons(features,color,stroke){
  for(const feature of features){
   const g=feature.geometry,polys=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
   for(const rings of polys){
    const bounds=boundsFor(rings[0]);
    if(bounds)polygons.push({rings,bounds,color:typeof color==='function'?color(feature):color,stroke});
   }
  }
 }
 addPolygons(land,f=>/park|grass|wood|scrub|pitch|cemetery/.test(f.properties?.class||'')?'#9db891':'#d2d4c7');
 addPolygons(water,'#8cbcc9');
 addPolygons(buildings,'#b6b9ad','#9ba499');
 for(const feature of roads){
  const kind=feature.properties?.class||'street';if(/rail|ferry/.test(kind))continue;
  const width=/motorway|trunk|primary/.test(kind)?15:/secondary|tertiary/.test(kind)?11:/path|pedestrian|steps/.test(kind)?3:7;
  const color=/path|pedestrian|steps/.test(kind)?'#c1b394':'#f3f2e7';
  const g=feature.geometry,lines=g.type==='LineString'?[g.coordinates]:g.type==='MultiLineString'?g.coordinates:[];
  for(const coords of lines){const bounds=boundsFor(coords);if(bounds)segments.push({coords,bounds,width,color})}
 }
 return {polygons,segments};
}

export function createMiniMapProjection(position,size=440,scale=1.4){
 const mid=size/2,cos=Math.cos(position[1]*Math.PI/180);
 // Preserve the original order of arithmetic for the visible canvas paths.
 const x=lng=>mid+(lng-position[0])*111320*cos*scale;
 const y=lat=>mid-(lat-position[1])*111320*scale;
 return {
  point:coords=>[x(coords[0]),y(coords[1])],
  visible(bounds,padding=0){
   return !(x(bounds[2]) < -padding || x(bounds[0]) > size+padding || y(bounds[1]) < -padding || y(bounds[3]) > size+padding);
  },
 };
}
