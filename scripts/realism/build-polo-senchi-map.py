"""Retain bounded native rings and road context for the Polo / Senchi batch."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
source=json.loads((ROOT/'tests/fixtures/mall-airport-corridor-context.json').read_text())
building_ids={451713890,2904703356,981756484,981756486,981756490}
ground_ids={890787154,981756488,981756482}
road_ids={111557768,277792478,277792479,121772677,316575722,419694822,511790086,515537582,758665997,172920773,96638771,40650817,40650051,637682768,637698454,637698455,1076825772,1076825773,1076825774,1076825775,638194155,121772674}
def points(coords):
 if isinstance(coords[0],(float,int)):yield coords
 else:
  for c in coords:yield from points(c)
def intersects(f):
 ps=list(points(f['geometry']['coordinates']));xs,ys=zip(*ps)
 return max(xs)>-.1772 and min(xs)<-.1725 and max(ys)>5.61445 and min(ys)<5.6181
context={layer:[f for f in source[layer] if intersects(f)] for layer in ['building','landuse']}
context['road']=[f for f in source['road'] if f['geometry']['type']=='LineString' and f['id'] in road_ids]
context['road'].extend(f for f in source['road'] if f['geometry']['type']=='LineString' and f['id'] not in road_ids and any(-.1772<p[0]<-.1725 and 5.61445<p[1]<5.6181 for p in f['geometry']['coordinates']))
roads=[]
for f in context['road']:
 p=f['properties'];width=10.5 if p['class']=='trunk' else 9 if p['class']=='secondary' else 5 if p['class']=='service' else 2 if p['class'] in ['steps','path'] else 6
 roads.append(dict(id=f['id'],**p,width=width,coordinates=f['geometry']['coordinates']))
rings={f['id']:f['geometry']['coordinates'][0] for f in source['building'] if f['id'] in building_ids}
grounds={f['id']:f['geometry']['coordinates'][0] for f in source['landuse'] if f['id'] in ground_ids}
assert set(rings)==building_ids and set(grounds)==ground_ids
out='// Exact bundled source rings. Heights and appearance are reference interpretations.\n'
for name,value in [('POLO_RINGS',rings),('POLO_GROUNDS',grounds),('POLO_ROADS',roads),('POLO_CONTEXT_BUILDINGS',[f['geometry']['coordinates'] for f in context['building']])]:out+='export const '+name+'='+json.dumps(value,separators=(',',':'))+';\n'
(ROOT/'public/game/polo-senchi-map.js').write_text(out)
(ROOT/'tests/fixtures/polo-senchi-context.json').write_text(json.dumps(context,separators=(',',':'))+'\n')
print('Retained five native building rings, three ground rings and bounded road context.')
