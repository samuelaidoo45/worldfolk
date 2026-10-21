"""Regenerate the bounded bypass model context from bundled OSM and the retained rail supplement.

Refresh the fixture deliberately after reviewing dated sources; no runtime OSM requests.
"""
import json,gzip,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
os.chdir(ROOT)
rail_source=json.loads(Path('tests/fixtures/mahama-rail-source.json').read_text())
rails=rail_source['rails']
# Clip the long native west approach to this review envelope; preserve the source in the fixture.
west=rail_source['west_approach'];a,b=west['coordinates'][:2];t=(-.17675-a[0])/(b[0]-a[0]);approach={**west,'coordinates':[a,[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]]}
buildings=[];roads=[];landuse=[]
for layer in ['building','road','landuse']:
 out={'building':buildings,'road':roads,'landuse':landuse}[layer]
 for path in sorted(Path('public/maps/accra-v1').glob('source-'+layer+'-*.geojson.gz')):
  for f in json.load(gzip.open(path,'rt'))['features']:
   def points(cs):
    if isinstance(cs[0],(float,int)):yield cs
    else:
     for c in cs:yield from points(c)
   ps=list(points(f['geometry']['coordinates']));xs,ys=zip(*ps)
   if max(xs)<-.1766 or min(xs)>-.1715 or max(ys)<5.6164 or min(ys)>5.6205:continue
   out.append(f)
ctx={'building':buildings,'road':roads,'landuse':landuse}
Path('tests/fixtures/mahama-bypass-context.json').write_text(json.dumps(ctx,separators=(',',':'))+'\n')
bids={888975158,888975160,888975162,888975164,888975166,888975168,888975172,888975174}
# Seven stable blocks plus the long north shed: eight native source records.
assert len([f for f in buildings if f['id'] in bids])==8
rs={187792813,510192633,510151406,515537582,1175817494,690493777,1052595503}
out='// OSM-native footprints/ways. Railway is a bounded 20 October 2026 OSM API supplement; see fixtures.\n'
for name,value in [('MAHAMA_RAILS',rails),('MAHAMA_WEST_APPROACH',approach),('NORTH_POLO_BUILDINGS',[f for f in buildings if f['id'] in bids]),('MAHAMA_ROADS',[dict(id=f['id'],**f['properties'],coordinates=f['geometry']['coordinates'],width=7.2 if f['id'] in [187792813,510192633] else 10.5 if f['properties']['class']=='trunk' else 4) for f in roads if f['id'] in rs]),('MAHAMA_CONTEXT_BUILDINGS',buildings)]:out+='export const '+name+'='+json.dumps(value,separators=(',',':'))+';\n'
Path('public/game/mahama-bypass-map.js').write_text(out)
print('Retained',len(buildings),'context buildings;',len(bids),'authored source rings;',len(rails),'rail ways')
