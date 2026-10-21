"""Airport-bound bypass: bounded native inventory + explicitly separate visual estimates.
No reference pixels are used by the game. Capture dates are documented, not inferred.
"""
import csv,gzip,json,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BOUNDS=[-.1775,5.6054,-.1695,5.6187]
EXISTING={451713890,888975158,888975162,888975164,888975168,888975172,888975174,981756484,981756486,981756490,2904703356}
def points(cs):
 if isinstance(cs[0],(float,int)): yield cs
 else:
  for c in cs: yield from points(c)
def centre(f):
 ps=list(points(f['geometry']['coordinates']));xs,ys=zip(*ps);return [(min(xs)+max(xs))/2,(min(ys)+max(ys))/2]
def distance(p,a,b):
 c=math.cos(math.radians(p[1]));dx=(b[0]-a[0])*c;dy=b[1]-a[1];t=max(0,min(1,((p[0]-a[0])*c*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy or 1)))
 return math.hypot((p[0]-a[0])*c-t*dx,p[1]-a[1]-t*dy)*111320
context={}
for layer in ['building','road','landuse']:
 records=[]
 for path in sorted((ROOT/'public/maps/accra-v1').glob('source-'+layer+'-*.geojson.gz')):
  for f in json.load(gzip.open(path,'rt'))['features']:
   ps=list(points(f['geometry']['coordinates']));xs,ys=zip(*ps)
   if max(xs)>=BOUNDS[0] and min(xs)<=BOUNDS[2] and max(ys)>=BOUNDS[1] and min(ys)<=BOUNDS[3]: records.append(f)
 context[layer]=records
spine=[f for f in context['road'] if f['properties'].get('name')=='Airport Bypass' and f['geometry']['type']=='LineString']
def selected(f):
 x,y=centre(f)
 near=5.60565<=y<=5.61855 and -.1775<=x<=-.1695 and min(distance([x,y],a,b) for r in spine for a,b in zip(r['geometry']['coordinates'],r['geometry']['coordinates'][1:]))<=160
 campus=-.1742<x<-.1711 and 5.6094<y<5.6144
 hotel=-.1772<x<-.1763 and 5.6128<y<5.61385
 return near or campus or hotel
context['building']=[f for f in context['building'] if selected(f)]
assert len(context['building'])==137
assert EXISTING <= {f['id'] for f in context['building']}
# Deliberate, restrained roof families. Ordinary hidden elevations are estimates;
# these rules never invent tenant identities or turn default OSM height into evidence.
def annotate(f):
 x,y=centre(f);ps=list(points(f['geometry']['coordinates']));xs,ys=zip(*ps);w=(max(xs)-min(xs))*110785;d=(max(ys)-min(ys))*111320
 zone='polo-south' if y>=5.615 else 'senchi' if x<-.17625 and y>5.6127 else 'upper-west' if x<-.1744 and y>=5.6134 else 'upper-east' if x>=-.1744 and y>=5.6121 else 'middle-west' if y>=5.6118 else 'aviation' if x>-.1742 else 'quarters-north' if y>=5.6079 else 'quarters-south'
 roof='hip' if min(w,d)>9 else 'gable' if max(w,d)>14 else 'mono'
 h=3.0;rise=1.0 if roof=='hip' else .55
 color='#b6b1a0';wall='#d4c7b4'
 if zone in ['upper-west','middle-west','senchi']: color='#885f4d' if min(w,d)>12 else '#98998b';h=5.9 if min(w,d)>14 else 2.9;rise=1.6 if roof=='hip' else .6
 if zone.startswith('quarters'): color='#aeafa2';wall='#c8bfa5';h=2.9;rise=.65
 if zone in ['upper-east','aviation']:color='#9da49f';roof='gable' if max(w,d)>22 else 'hip';rise=.8
 a=dict(id=f['id'],zone=zone,rings=f['geometry']['coordinates'],wallHeight=h,roofRise=rise,roof=roof,wallColor=wall,roofColor=color,dimensionsEstimated=True,facadesEstimated=True,geometrySource='bundled-native-polygon',family='compound')
 overrides={81300070:dict(wallHeight=9.3,roofRise=1.3,family='residential'),981756492:dict(wallHeight=3.1,roofRise=.5),2904703374:dict(wallHeight=6.2,roofRise=1.3,family='spiral-compound',roofColor='#ada99b'),2904703362:dict(wallHeight=12.8,roofRise=.1,roof='flat',wallColor='#be8051',family='orange-office'),2158196648:dict(wallHeight=4.1,roofRise=.1,roof='flat',family='hotel-podium'),2174158622:dict(wallHeight=33.5,roofRise=.35,roof='flat',wallColor='#b6a380',family='polo-views'),1197118814:dict(wallHeight=30.5,roofRise=.2,roof='flat',wallColor='#d6d1bb',family='gcaa')}
 a.update(overrides.get(f['id'],{}));return a
buildings=[annotate(f) for f in context['building'] if f['id'] not in EXISTING]
def rect(p,w,d,yaw=0):
 a=math.radians(yaw);r=[]
 for x,z in [(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2),(-w/2,-d/2)]:
  xx=x*math.cos(a)+z*math.sin(a);zz=-x*math.sin(a)+z*math.cos(a);r.append([round(p[0]+xx/(111320*math.cos(math.radians(p[1]))),8),round(p[1]-zz/111320,8)])
 return [r]
manual=[]
# Towers visible in photos but absent/incomplete in the older extract. The hotel
# podium and Polo B service plates stay native; new tower envelopes are separate.
for id,zone,p,w,d,h,family in [('four-points-tower','senchi',[-.17660,5.61326],27,32,46.5,'four-points'),('gata-training-tower','aviation',[-.17138,5.61035],26,30,27.2,'gata'),('polo-views-east-tower','upper-east',[-.171685,5.614355],16,24,29.4,'polo-views')]:
 manual.append(dict(id=id,zone=zone,rings=rect(p,w,d,0),wallHeight=h,roofRise=.2,roof='flat',wallColor='#b6a380' if family=='polo-views' else '#d4c7b4',roofColor='#999c94',family=family,dimensionsEstimated=True,facadesEstimated=True,geometrySource='manual-viewing-estimate'))
land=[f for f in context['landuse'] if f['id']==2673930316]
roadIds={96638771,172920772,172920773,303442830,448728568,448728569,637685666,644621659,1213594169}
roads=[dict(id=f['id'],coordinates=f['geometry']['coordinates'],**f['properties'],width=9 if f['id'] in [96638771,172920773] else 8.4 if f['id']==172920772 else 7.2,widthEstimated=True) for f in spine if f['id'] in roadIds]
(ROOT/'tests/fixtures/airport-bound-context.json').write_text(json.dumps(context,separators=(',',':'))+'\n')
out='// Generated by build-airport-bound.py. Native geometry; viewing estimates remain explicit.\n'
for k,v in [('BOUND_BOUNDS',BOUNDS),('BOUND_EXISTING_IDS',sorted(EXISTING)),('BOUND_BUILDINGS',buildings),('BOUND_REFERENCE_BUILDINGS',manual),('BOUND_LAND',land),('BOUND_ROADS',roads),('BOUND_CONTEXT_ROADS',[dict(id=f['id'],coordinates=f['geometry']['coordinates'],**f['properties']) for f in context['road'] if f['geometry']['type']=='LineString'])]:out+='export const '+k+'='+json.dumps(v,separators=(',',':'))+';\n'
(ROOT/'public/game/airport-bound-map.js').write_text(out)
with (ROOT/'docs/realism/airport-bound-buildings.csv').open('w') as fp:
 writer=csv.writer(fp);writer.writerow(['source_id','model_id','zone','family','geometry_source','wall_height_estimate_m','roof_rise_estimate_m','remaining_work'])
 for f in context['building']:
  a=next((a for a in buildings if a['id']==f['id']),None)
  writer.writerow([f['id'],'existing authored exterior' if a is None else 'airport-bound:'+str(a['id']),a['zone'] if a else 'existing',a['family'] if a else 'existing','bundled-native-polygon',a['wallHeight'] if a else '',a['roofRise'] if a else '','Measured heights, current hidden elevations and access; exteriors only'])
 for a in manual:writer.writerow(['',a['id'],a['zone'],a['family'],a['geometrySource'],a['wallHeight'],a['roofRise'],'Survey footprint, height, concealed facade; exterior only'])
print(len(context['building']),'native records:',len(EXISTING),'retained,',len(buildings),'new;',len(manual),'separate tower estimates')
