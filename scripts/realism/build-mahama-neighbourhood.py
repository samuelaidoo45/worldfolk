"""Bounded native-building closure; appearance annotations are deliberate, not random.
Google overhead/September 2024 Street View are viewing references, never game textures.
"""
import csv,gzip,json,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BOUNDS=[-.17725,5.6158,-.1705,5.6206]
existing={888975158,888975160,888975162,888975164,888975166,888975168,888975172,888975174,1025799036,2469962810,2475835060,2475838246,2475838248,2475838476}
# id: zone, wall height, roof rise, roof construction, wall and roof colour.
# Heights/hidden elevations estimated. Colours are restrained interpretations of
# overhead roof families; they are not evidence of present occupancy or tenancy.
annotations='''20332079 north 6.8 2.8 courtyard #c4b798 #795b49
2175558972 yard 2.8 .7 hip #b8b2a0 #aaa99c
2175558974 yard 2.3 .3 mono #a8a18c #898d84
2175558976 yard 2.5 .6 hip #b6ae97 #a9aaa0
2175558978 yard 3.1 1.2 hip #b3ad98 #8e8d7b
2266652078 west 5.8 2.2 hip #c9c4b1 #865d52
2469962812 west 3.0 1.2 hip #b8b5a3 #7f6b5c
2475835058 west 2.4 .3 mono #ada68c #8e7b65
2475835062 west 3.0 1.4 hip #c1bdae #9b9b8a
2475835066 west 2.2 .25 mono #a29e8c #887e6b
2475835068 west 2.4 .35 mono #aea58d #91705d
2475835070 west 2.8 .7 hip #bdb8a4 #9d9480
2475835072 west 2.8 .7 gable #bcb6a1 #8d6e5b
2475835988 west 3.1 1.3 hip #bdb7a7 #9d9180
2475838250 west 2.8 .9 hip #c3b79f #9a7c6a
2475838252 west 2.7 .8 gable #b9ad94 #897e6f
2475838254 west 2.9 1.0 gable #c2b9a3 #967364
2475838256 west 2.6 .7 hip #aea58f #929182
2475838260 west 2.1 .2 mono #9e9b8a #8b8170
2475838262 west 2.7 .6 gable #b9b29d #9b8c78
2475838264 west 2.6 .45 mono #c2b398 #8b7563
2475838266 west 2.6 .55 gable #b5ae99 #9a998b
2475838268 west 2.7 .7 hip #b9b59e #8b7b68
2475838270 west 2.7 .8 hip #b9b09a #9f8f7d
2475838272 west 2.4 .35 mono #ada88f #948a76
2475838274 west 2.6 .6 gable #b9b09d #9b755f
2475838276 west 2.8 .9 hip #bdb5a1 #9e998a
2475838278 west 2.5 .4 mono #aca38a #8e725e
2475838280 west 2.2 .25 mono #b1a88f #a19785
2475838282 west 2.6 .55 gable #b8af94 #958671
2475838284 west 3.0 1.2 hip #c6bca6 #a78a76
2475838286 west 2.8 .9 hip #c3b69c #92836f
2475838888 west 2.8 1.0 hip #c9c0aa #9b7d65
2475838890 west 2.3 .3 mono #b0a88f #9e9a8b
2475838892 west 2.5 .4 mono #b9b39c #888b80
2475838894 west 2.0 .2 mono #a5a28e #928977
2475838896 west 2.1 .2 mono #a9a089 #9d8e78
2491216764 court 6.4 2.0 hip #d4c7b4 #7b5c50'''
ann={}
for line in annotations.splitlines():
 i,zone,h,rise,roof,wall,color=line.split();ann[int(i)]=dict(zone=zone,wallHeight=float(h),roofRise=float(rise),roof=roof,wallColor=wall,roofColor=color,dimensionsEstimated=True,facadesEstimated=i!='20332079')
def points(cs):
 if isinstance(cs[0],(float,int)):yield cs
 else:
  for c in cs:yield from points(c)
context={}
for layer in ['building','road','landuse']:
 records=[]
 for path in sorted((ROOT/'public/maps/accra-v1').glob('source-'+layer+'-*.geojson.gz')):
  for f in json.load(gzip.open(path,'rt'))['features']:
   ps=list(points(f['geometry']['coordinates']));xs,ys=zip(*ps);x,y,X,Y=min(xs),min(ys),max(xs),max(ys)
   selected=BOUNDS[0]<=(x+X)/2<=BOUNDS[2] and BOUNDS[1]<=(y+Y)/2<=BOUNDS[3] if layer=='building' else X>=BOUNDS[0] and x<=BOUNDS[2] and Y>=BOUNDS[1] and y<=BOUNDS[3]
   if selected:records.append(f)
 context[layer]=records
assert {f['id'] for f in context['building']}==existing|ann.keys()
assert not existing&ann.keys()
(ROOT/'tests/fixtures/mahama-neighbourhood-context.json').write_text(json.dumps(context,separators=(',',':'))+'\n')
buildings=[dict(id=f['id'],rings=f['geometry']['coordinates'],**ann[f['id']]) for f in context['building'] if f['id'] in ann]
# Additional visible structures absent from this extract. Manual viewing estimates
# retain a separate identity/provenance; never passed off as OSM source rings.
def rect(p,w,d,yaw=0):
 a=math.radians(yaw);out=[]
 for x,z in [(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2),(-w/2,-d/2)]:
  xx=x*math.cos(a)+z*math.sin(a);zz=-x*math.sin(a)+z*math.cos(a)
  out.append([round(p[0]+xx/(111320*math.cos(math.radians(p[1]))),8),round(p[1]-zz/111320,8)])
 return [out]
manual=[]
for id,p,w,d,yaw in [('court-north',[-.174826,5.617127],32,17,-9),('court-west-north',[-.175095,5.616929],16,35,1),('court-west-middle',[-.175079,5.616596],16,35,1),('court-west-south',[-.175068,5.61629],16,26,1),('court-east-south',[-.174546,5.616321],17,33,1)]:
 manual.append(dict(id=id,zone='court',rings=rect(p,w,d,yaw),wallHeight=6.4,roofRise=2,roof='hip',wallColor='#d4c7b4',roofColor='#7b5c50',dimensionsEstimated=True,facadesEstimated=True,geometrySource='manual-overhead-estimate'))
for id,zone,p,w,d,h,rise,roof,color in [('stable-west-red-shed','yard',[-.173948,5.617982],29,70,3.6,1.7,'gable','#885a4c'),('north-unfinished-frame','north',[-.173734,5.620628],29,26,7.2,0,'frame','#8f8e80'),('court-central-service','court',[-.174815,5.61686],15,9,2.8,.4,'mono','#a5a198')]:
 manual.append(dict(id=id,zone=zone,rings=rect(p,w,d,1),wallHeight=h,roofRise=rise,roof=roof,wallColor='#bcb5a2',roofColor=color,dimensionsEstimated=True,facadesEstimated=True,geometrySource='manual-overhead-estimate'))
land=[f for f in context['landuse'] if f['id'] in [36668683,2675940202,555584954]]
out='// Generated by build-mahama-neighbourhood.py; bounded reference interpretations, not a survey.\n'
for key,val in [('MAHAMA_AREA_BOUNDS',BOUNDS),('MAHAMA_EXISTING_IDS',sorted(existing)),('AREA_BUILDINGS',buildings),('AREA_REFERENCE_BUILDINGS',manual),('AREA_LAND',land)]:out+='export const '+key+'='+json.dumps(val,separators=(',',':'))+';\n'
(ROOT/'public/game/mahama-neighbourhood-map.js').write_text(out)
with (ROOT/'docs/realism/mahama-neighbourhood-buildings.csv').open('w') as fp:
 fields=['source_id','model_id','zone','geometry_source','wall_height_estimate_m','roof_rise_estimate_m','roof_form','reference_status','remaining_work']
 writer=csv.DictWriter(fp,fieldnames=fields);writer.writeheader()
 for f in context['building']:
  i=f['id'];a=ann.get(i,{})
  writer.writerow(dict(source_id=i,model_id='existing authored exterior' if i in existing else 'mahama-area:'+str(i),zone=a.get('zone','existing'),geometry_source='bundled OSM native polygon',wall_height_estimate_m=a.get('wallHeight','see existing model'),roof_rise_estimate_m=a.get('roofRise','see existing model'),roof_form=a.get('roof','see existing model'),reference_status='overhead + September 2024 facade' if i==20332079 else 'overhead roof context; hidden elevations estimated' if i in ann else 'see earlier model reference record',remaining_work='current capture; measured dimensions; concealed facade/access'))
 for a in manual:writer.writerow(dict(source_id='',model_id=a['id'],zone=a['zone'],geometry_source=a['geometrySource'],wall_height_estimate_m=a['wallHeight'],roof_rise_estimate_m=a['roofRise'],roof_form=a['roof'],reference_status='visually reviewed overhead; capture date unknown',remaining_work='survey footprint/height and current facade; no private interior'))
print(len(context['building']),'native buildings:',len(existing),'existing +',len(buildings),'new;',len(manual),'reference-only estimates')
