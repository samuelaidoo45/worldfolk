"""Regenerate bounded native-road context from the checked-in Airport City fixture."""
import json,pathlib
root=pathlib.Path(__file__).resolve().parents[2]
import os
os.chdir(root)
fixtures=[json.load(open('tests/fixtures/'+name+'-context.json')) for name in ['airport-business','airport-t2','airport-t3']]
j={key:list({r['id']:r for f in fixtures for r in f[key]}.values()) for key in ['road','building']}
ids=[120726241,419694823,4790599,11287152,105550266,637704090,33821774,343681377,343681378,343681379,448732033,4790603,670348801,1098504095,1098504096,1540073309,187955047,400795333,1005601030,1259200513,1364098820,4790615,172920770,419694819,419694820,419694821,340844849,510791931,510791928,514484049,637899315,637899316,96639918,96639921,418520464,448732034,515063424,511032948,623707814]
# Airport Bypass / Big Six circle, T2 approach and ground-level T3 connectors.
# Raised departure ways 626883872/873/875 remain exclusively in airport-t3-roads.
ids += [514484050,514484051,514484052,514484053,514484054,514484055,514484056,4790608,447788347,447788348,447788349,447788350,4790594,4790632,4790600,4790602,4790596,4790591,139973716,400795326,447788933,447788934,670348799,670348795,670348794,1098367933,520275736,765383568,623707805,623707806,623707807,623707815,623707816]
ids += [4845628,1343473211,1343473212] # North/CIP annex approach and return loop.
roundabouts={514484050,514484051,514484052,514484053,514484054,514484055,514484056,4790608,4790600,4790591,670348799}
roads=[]
for f in j['road']:
 if f['id'] in ids:
  p={**f['properties'],**({'roundabout':True} if f['id'] in roundabouts else {})};roads.append(dict(id=f['id'],**p,coordinates=f['geometry']['coordinates'],width=3.8 if f['id'] in [637899315,637899316] else 5.8 if f['id'] in [96639918,96639921,418520464,448732034] else 2 if p['class']=='path' else 10.5 if p['class']=='trunk' else 9 if p['class']=='secondary' else 6 if p['class']=='tertiary' else 5 if p['class']=='service' else 7))
assert len(roads)==len(ids),(len(roads),set(ids)-{r['id'] for r in roads})
# Exact native geometry; the context prevents paving across mapped driveways or structures.
with open('public/game/airport-corridor-map.js','w') as f:
 f.write('// Bundled OSM extract: native way coordinates, not hand-drawn roads. Widths are photo estimates.\nexport const CORRIDOR_ROADS='+json.dumps(roads,separators=(',',':'))+';\n')
 f.write('export const CORRIDOR_CONTEXT='+json.dumps([dict(id=r['id'],**r['properties'],coordinates=r['geometry']['coordinates']) for r in j['road'] if r['properties']['class'] not in ['steps','pedestrian']],separators=(',',':'))+';\n')
 f.write('export const CORRIDOR_BUILDINGS='+json.dumps([r['geometry']['coordinates'] for r in j['building']],separators=(',',':'))+';\n')
