"""Inventory every mapped object in the active Mall–Airport View corridor.

Native OSM geometry is evidence of mapped shape, not current appearance or height.
This generator does not render buildings or assign a business to its neighbours.
CSV review/status fields survive regeneration by layer/source ID.
"""
import csv, gzip, json, math, subprocess
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
DOC=ROOT/'docs/realism'; MAP=ROOT/'public/maps/accra-v1'
DATE='2026-10-20'
SCALE=111320; COS=math.cos(math.radians(5.615))
# Production scope, not administrative/ownership boundaries. Both sides of the
# native Liberation Road centre lines, plus explicit mall, Polo and AIS spurs.
MIN_LAT,MAX_LAT=5.6046,5.624
SPURS=[('mall',[-.1793,5.6193,-.1703,5.624]),('polo',[-.1756,5.6143,-.1712,5.619]),('school',[-.1794,5.6088,-.1770,5.6111])]
BANDS=[('C01','Mall / interchange / Villaggio',5.6193),('C02','Regent / Shangri-La',5.6166),('C03','Polo / Elizabeth / Senchi',5.6142),('C04','Mirage / KASS / offices',5.6110),('C05','Association / Opeibea',5.6088),('C06','Airport View approach',MIN_LAT)]
def read_layer(name):
 for p in sorted(MAP.glob(f'source-{name}-*.geojson.gz')):
  yield from json.load(gzip.open(p,'rt'))['features']
def points(coords):
 if isinstance(coords[0],(float,int)):yield coords
 else:
  for c in coords:yield from points(c)
def bounds(f):
 ps=list(points(f['geometry']['coordinates']));xs,ys=zip(*ps);return min(xs),min(ys),max(xs),max(ys)
def mid(f):
 x,y,X,Y=bounds(f);return [(x+X)/2,(y+Y)/2]
def distance(p,a,b):
 x,y=(p[0]-a[0])*SCALE*COS,(p[1]-a[1])*SCALE
 dx,dy=(b[0]-a[0])*SCALE*COS,(b[1]-a[1])*SCALE
 t=max(0,min(1,(x*dx+y*dy)/(dx*dx+dy*dy))) if dx or dy else 0
 return math.hypot(x-dx*t,y-dy*t)
def inside(p,r):
 yes=False
 for a,b in zip(r,r[1:]):
  if (a[1]>p[1])!=(b[1]>p[1]) and p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]:yes=not yes
 return yes
roads=list(read_layer('road'))
spine=[]
for f in roads:
 if f['properties'].get('name')!='Liberation Road' or f['geometry']['type']!='LineString':continue
 for a,b in zip(f['geometry']['coordinates'],f['geometry']['coordinates'][1:]):
  if max(a[1],b[1])>=MIN_LAT and min(a[1],b[1])<=MAX_LAT:spine.append((a,b))
assert spine

def selected(p):
 if not MIN_LAT<=p[1]<=MAX_LAT:return False
 if not -.183<p[0]<-.169:return False
 return any(x<=p[0]<=X and y<=p[1]<=Y for _,(x,y,X,Y) in SPURS) or min(distance(p,a,b) for a,b in spine)<=220

def selected_feature(f):
 # Vertex, edge-midpoint and bbox-centre checks include narrow intersecting
 # frontage shapes; this is a bounded inventory, not a parcel census.
 ps=list(points(f['geometry']['coordinates']))
 return selected(mid(f)) or any(selected(p) for p in ps) or any(selected([(a[0]+b[0])/2,(a[1]+b[1])/2]) for a,b in zip(ps,ps[1:]))

def band(p):return next((i for i,_,lat in BANDS if p[1]>=lat),'C06')
code="import {CITY_LANDMARKS} from './public/game/city-landmarks.js';console.log(JSON.stringify(CITY_LANDMARKS.flatMap(s=>(s.sourceIds||[]).map(id=>({id,site:s.id,name:s.name})))));"
registry=json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True))
authored={str(r['id']):r for r in registry}
path=DOC/'mall-airport-corridor-objects.csv'
old={}
if path.exists():
 with path.open(newline='') as f:old={r['object_id']:r for r in csv.DictReader(f)}
rows=[];context={};named=[]
for layer in ['building','road','landuse','waterway','water']:
 fs=[]
 for f in roads if layer=='road' else read_layer(layer):
  bb=bounds(f)
  if bb[2]<-.183 or bb[0]>-.169 or bb[3]<MIN_LAT or bb[1]>MAX_LAT:continue
  if not selected_feature(f):continue
  fs.append(f);p=mid(f);props=f['properties'];rid=str(f['id']);custom=authored.get(rid) if layer=='building' else None
  row=dict(object_id=f'{layer}:{rid}',layer=layer,source_id=rid,section=band(p),map_name=props.get('name',''),map_class=props.get('class',''),longitude=round(p[0],8),latitude=round(p[1],8),source_height=props.get('height',''),height_evidence='Unverified extract value; may be default' if layer=='building' else '',authored_site=custom['site'] if custom else '',geometry_state='Authored Partial' if custom else 'Native map only',reference_state='Survey required',exterior_review='Not accepted',ground_access_review='Not accepted',status='Review existing pass' if custom else 'Queued',reference_urls='',notes='')
  prior=old.pop(row['object_id'],{})
  for k in ['reference_state','exterior_review','ground_access_review','status','reference_urls','notes']:
   if k in prior:row[k]=prior[k]
  rows.append(row)
  if props.get('name'):named.append((layer,rid,props['name'],p))
 context[layer]=fs
assert len({r['object_id'] for r in rows})==len(rows)
rows.sort(key=lambda r:(r['section'],r['layer'],-r['latitude'],r['source_id']))
with path.open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
# Preserve vanished records separately rather than dropping manual work.
if old:(DOC/'mall-airport-corridor-retired.json').write_text(json.dumps(list(old.values()),indent=2)+'\n')
places=[]
with (DOC/'mapped-places.csv').open(newline='') as f:
 for r in csv.DictReader(f):
  p=[float(r['longitude']),float(r['latitude'])]
  if not selected(p):continue
  matching=[]
  for b in context['building']:
   geometry=b['geometry']
   polys=[geometry['coordinates']] if geometry['type']=='Polygon' else geometry['coordinates']
   if any(inside(p,rs[0]) and not any(inside(p,h) for h in rs[1:]) for rs in polys):matching.append(str(b['id']))
  places.append(dict(record_id=r['record_id'],section=band(p),map_name=r['name'],map_type=r['category'],longitude=p[0],latitude=p[1],containing_source_buildings=';'.join(matching),identity_evidence='Map label only; verify current identity and parcel',reference_urls=r['reference_urls']))
with (DOC/'mall-airport-corridor-places.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(places[0]),lineterminator='\n');w.writeheader();w.writerows(sorted(places,key=lambda p:(p['section'],-p['latitude'],p['map_name'])))
summary=dict(as_of=DATE,scope='Both sides of native Liberation Road within 220 m, clipped to 5.6046–5.624 latitude, with explicit mall/Polo/Association spurs. Vertex/midpoint selection, not surveyed parcels.',spurs=SPURS,counts=dict(Counter(r['layer'] for r in rows)),place_records=len(places),authored_buildings=sum(r['layer']=='building' and bool(r['authored_site']) for r in rows),native_only_buildings=sum(r['layer']=='building' and not r['authored_site'] for r in rows),sections=[dict(id=i,name=name,objects=sum(r['section']==i for r in rows),buildings=sum(r['section']==i and r['layer']=='building' for r in rows),place_records=sum(p['section']==i for p in places)) for i,name,_ in BANDS],limitations=['Inventory is not a count of unique real-world properties; building parts and overlapping labels remain separate.','Native building height values may be defaults and do not prove tower height.','Authored Partial identifies a source-ID link, not current accuracy or acceptance.','No appearance, business ownership or private access is inferred from proximity.','Road segments can extend beyond the review boundary.','Waterway/land-use records can cross other records; never add layers as unique places.'])
(DOC/'mall-airport-corridor-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
(ROOT/'tests/fixtures/mall-airport-corridor-context.json').write_text(json.dumps(context,separators=(',',':'))+'\n')
print(json.dumps(summary,ensure_ascii=False,indent=2))
