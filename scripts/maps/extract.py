"""Build a bounded ODbL game extract from a Geofabrik OSM PBF. No runtime OSM API calls."""
import osmium, json, math, sys, pathlib, re, hashlib
from shapely import wkb
from shapely.geometry import mapping, shape, box, LineString, Point
from shapely.ops import unary_union, polygonize
BBOX=(-.40,5.40,.12,5.83); region=box(*BBOX)
output=pathlib.Path(sys.argv[2]); output.mkdir(parents=True,exist_ok=True)
layers={k:[] for k in ['building','road','landuse','water','waterway','poi','place']}
points={}; roads=[]; restrictions=[]; coast=[]; places={}
def inside(p): return BBOX[0]<=p[0]<=BBOX[2] and BBOX[1]<=p[1]<=BBOX[3]
def feature(layer,id,geom,props):
 if geom.is_empty:return
 layers[layer].append({'type':'Feature','id':id,'geometry':mapping(geom),'properties':props})
def number(v,default):
 try:return float(re.search(r'[\d.]+',str(v))[0])
 except:return default
def poi(id,t,p):
 if not inside(p) or not t.get('name'):return
 kind=t.get('amenity') or t.get('shop') or t.get('tourism') or t.get('leisure') or t.get('place')
 if not kind:return
 props={'name':t['name'],'class':kind,'type':kind.replace('_',' ')}
 layer='place' if t.get('place') else 'poi'
 feature(layer,id,Point(p),props)
 places[str(id)]={'name':t['name'],'type':props['type'],'detail':t.get('addr:suburb') or t.get('addr:city') or 'Accra','lng':p[0],'lat':p[1]}
class Extract(osmium.SimpleHandler):
 count=0
 def node(self,n):
  if n.tags.get('name') and n.location.valid():poi(n.id,dict(n.tags),(n.location.lon,n.location.lat))
 def way(self,w):
  if not any(w.tags.get(k) for k in ['highway','natural','waterway']):return
  t=dict(w.tags)
  if not any(k in t for k in ['highway','natural','waterway']):return
  try:coords=[(round(n.lon,7),round(n.lat,7)) for n in w.nodes]
  except:return
  if len(coords)<2:return
  line=LineString(coords)
  if not line.intersects(region):return
  if t.get('natural')=='coastline':coast.append(line.intersection(region))
  if t.get('waterway'):feature('waterway',w.id,line.intersection(region),{'class':t['waterway'],'name':t.get('name','')})
  h=t.get('highway')
  if not h or h in ['proposed','construction','raceway']:return
  kind={'residential':'street','unclassified':'street','living_street':'street_limited','footway':'path','cycleway':'path','track':'service'}.get(h,h.replace('_link',''))
  props={'class':kind,'name':t.get('name',''),'surface':'unpaved' if t.get('surface') in ['unpaved','dirt','earth','ground','sand','gravel','laterite'] else t.get('surface','paved'),'oneway':-1 if t.get('oneway')=='-1' else 1 if t.get('oneway') in ['yes','1','true'] or t.get('junction')=='roundabout' else 0,'structure':'tunnel' if t.get('tunnel')=='yes' else 'bridge' if t.get('bridge')=='yes' else 'none','layer':int(number(t.get('layer'),0))}
  feature('road',w.id,line.intersection(region),props)
  public=t.get('access') not in ['no','private']; drive=public and h not in ['footway','path','pedestrian','steps','cycleway','bridleway','corridor'] and t.get('motor_vehicle',t.get('vehicle','yes')) not in ['no','private']; foot=public and h not in ['motorway','motorway_link','trunk','trunk_link'] and t.get('foot','yes') not in ['no','private']
  if not drive and not foot:return
  speed=min(100,number(t.get('maxspeed'),{'motorway':90,'trunk':70,'primary':50,'secondary':45,'tertiary':40,'service':20}.get(kind,30))) / 3.6
  flags=(1 if drive and props['oneway']!=-1 else 0)|(2 if drive and props['oneway']!=1 else 0)|(4 if foot else 0)
  refs=[]
  for n,p in zip(w.nodes,coords):
   if inside(p):points[n.ref]=p;refs.append(n.ref)
   else:refs.append(None)
  roads.append((w.id,refs,speed,flags,t.get('name','')))
 def area(self,a):
  self.count+=1
  if self.count%100000==0:print(f'Processed {self.count} areas; retained {len(layers["building"])} Accra buildings',flush=True)
  t=dict(a.tags)
  building=t.get('building') not in [None,'no']; water=t.get('natural')=='water' or t.get('water') or t.get('landuse')=='reservoir'
  land=t.get('landuse') or t.get('leisure') or t.get('natural')
  if t.get('boundary') or not (building or water or land in ['residential','commercial','industrial','retail','park','garden','pitch','grass','meadow','forest','wood','sand','beach','scrub','farmland','cemetery','parking','recreation_ground'] or any(t.get(k) for k in ['amenity','shop','tourism','leisure'])):return
  if building:
   try:
    if not any(inside((r[0].lon,r[0].lat)) for r in a.outer_rings()):return
   except:return
  try:g=wkb.loads(osmium.geom.WKBFactory().create_multipolygon(a),hex=True)
  except:return
  if not g.intersects(region):return
  try:g=g.intersection(region)
  except:g=g.buffer(0).intersection(region)
  if g.is_empty:return
  p=g.representative_point();poi(a.id,t,(p.x,p.y))
  if building:
   feature('building',a.id,g,{'height':max(3,number(t.get('height'),number(t.get('building:levels'),1.5)*3)),'min_height':number(t.get('min_height'),0),'class':t['building'],'name':t.get('name',''),'amenity':t.get('amenity',''),'shop':t.get('shop',''),'religion':t.get('religion',''),'building:colour':t.get('building:colour',''),'roof:colour':t.get('roof:colour',''),'roof:shape':t.get('roof:shape',''),'building:levels':t.get('building:levels','')})
  elif water:feature('water',a.id,g,{'class':'water','name':t.get('name','')})
  elif land:
   kind={'forest':'wood','meadow':'grass','farmland':'agriculture','beach':'sand','recreation_ground':'park'}.get(land,land)
   feature('landuse',a.id,g,{'class':kind,'name':t.get('name','')})
 def relation(self,r):
  t=dict(r.tags)
  if t.get('type')!='restriction' or not t.get('restriction'):return
  members={m.role:(m.type,m.ref) for m in r.members}
  if all(k in members for k in ['from','via','to']) and members['via'][0]=='n':restrictions.append([members['from'][1],members['via'][1],members['to'][1],t['restriction'],t.get('except','')])
print('Reading OSM roads, places and areas…',flush=True)
Extract().apply_file(sys.argv[1],locations=True,idx='flex_mem',filters=[osmium.filter.KeyFilter('name','highway','building','landuse','natural','water','waterway','leisure','amenity','shop','tourism','type')])
# The coast divides the extraction boundary into land and ocean; retain the sea side.
if coast:
 for p in polygonize(unary_union([region.boundary,*coast])):
  if p.contains(Point(.10,5.41)):feature('water',0,p,{'class':'ocean','name':'Gulf of Guinea'})
print('Writing map layers and routing graph…',flush=True)
node_ids=list(points);index={n:i for i,n in enumerate(node_ids)};nodes=[points[n] for n in node_ids];edges=[];names=[];way_index={}
for way,refs,speed,flags,name in roads:
 wi=len(names);way_index[way]=wi;names.append(name)
 for a,b in zip(refs,refs[1:]):
  if a is None or b is None or a==b:continue
  x,y=points[a],points[b];d=math.hypot((x[0]-y[0])*110800,(x[1]-y[1])*111320)
  if d>.05:edges.append([index[a],index[b],round(d,2),round(speed,2),flags,wi])
turns=[[way_index[a],index[v],way_index[b],kind] for a,v,b,kind,exc in restrictions if a in way_index and b in way_index and v in index and not any(x in exc for x in ['motorcar','motor_vehicle'])]
graph={'version':1,'bounds':BBOX,'nodes':nodes,'edges':edges,'names':names,'restrictions':turns}
for name,data in [('layers',layers),('graph',graph),('places',list(places.values()))]:
 (output/(name+'.json')).write_text(json.dumps(data,separators=(',',':')))
print(json.dumps({'layers':{k:len(v) for k,v in layers.items()},'nodes':len(nodes),'edges':len(edges),'restrictions':len(turns),'places':len(places)}))

with open(sys.argv[1],'rb') as source:checksum=hashlib.file_digest(source,'sha256').hexdigest()
(output/'source.json').write_text(json.dumps({'sha256':checksum,'source':'https://download.geofabrik.de/africa/ghana-latest.osm.pbf'}))
