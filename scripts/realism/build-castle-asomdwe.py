"""Native Castle Drive frontage / Asomdwe inventory; annotations are estimates."""
import gzip,json,math,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BOUNDS=[-.19105,5.5467,-.18625,5.5500]
def points(c):
 if isinstance(c[0],(int,float)):yield c
 else:
  for r in c:yield from points(r)
def distance(p,a,b):
 x,y=(p[0]-a[0])*110800,(p[1]-a[1])*111320;dx,dy=(b[0]-a[0])*110800,(b[1]-a[1])*111320;t=max(0,min(1,(x*dx+y*dy)/(dx*dx+dy*dy or 1)));return math.hypot(x-dx*t,y-dy*t)
context={};sources={}
for layer in ['building','road','landuse']:
 rows=[]
 for path in sorted((ROOT/'public/maps/accra-v1').glob('source-'+layer+'-*.geojson.gz')):
  used=False
  for f in json.load(gzip.open(path,'rt'))['features']:
   ps=list(points(f['geometry']['coordinates']));xs,ys=zip(*ps)
   if max(xs)>=BOUNDS[0] and min(xs)<=BOUNDS[2] and max(ys)>=BOUNDS[1] and min(ys)<=BOUNDS[3]:rows.append(f);used=True
  if used:sources[str(path.relative_to(ROOT))]=hashlib.sha256(path.read_bytes()).hexdigest()
 context[layer+'s']=rows
park=next(f for f in context['landuses'] if f['id']==1167624598)
memorial=1764968092;rock_gardens={1757735492,1757735494,1757735496}
front_roads=[r for r in context['roads'] if r['id'] in {524496336,622231595}]
front=[]
for f in context['buildings']:
 r=f['geometry']['coordinates'][0]
 d=min(distance(p,a,b) for p in r for road in front_roads for a,b in zip(road['geometry']['coordinates'],road['geometry']['coordinates'][1:]))
 if d<32 and min(p[0] for p in r)>-.1905 and min(p[1] for p in r)>5.54813:front.append(f)
assert len(front)==9
masses=[]
for f in front:
 r=f['geometry']['coordinates'];cx=sum(p[0] for p in r[0])/len(r[0]);masses.append(dict(id=f['id'],zone='castle-west' if cx<-.188 else 'castle-east',rings=r,wallHeight=f['properties']['height'],roofRise=1,roof='hip',wallColor='#c7c2af',roofColor='#8d6e5b',dimensionsEstimated=True,facadesEstimated=True))
owned={memorial,*rock_gardens,*(f['id'] for f in front)}
record=dict(bounds=BOUNDS,buildings=[f for f in context['buildings'] if f['id'] in owned],roads=context['roads'],landuses=[park])
(ROOT/'tests/fixtures/castle-asomdwe-context.json').write_text(json.dumps(record,separators=(',',':'))+'\n')
values={'CASTLE_SOURCE_HASHES':sources,'CASTLE_BOUNDS':BOUNDS,'ASOM_NATIVE_PARK':park,'ASOM_NATIVE_TERRACE':next(f for f in context['buildings'] if f['id']==memorial),'ASOM_NATIVE_GARDENS':[f for f in context['buildings'] if f['id'] in rock_gardens],'CASTLE_BUILDINGS':masses,'CASTLE_ROADS':[dict(id=f['id'],**f['properties'],coordinates=f['geometry']['coordinates']) for f in context['roads'] if f['geometry']['type']=='LineString']}
(ROOT/'public/game/castle-asomdwe-map.js').write_text('// Native OSM/ODbL contours. Rendering classifications / facade details are estimates.\n'+'\n'.join('export const '+k+'='+json.dumps(v,separators=(',',':'))+';' for k,v in values.items())+'\n')
print('9 roadside buildings, native memorial terrace and 3 garden plates; exact park contour retained')
