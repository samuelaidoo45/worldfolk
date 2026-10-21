"""Mirage/KASS skyline and connected C04 exteriors; no reference pixels in runtime.
The IDs pin the forty previously unmodelled C04 plates plus eight KASS neighbours.
Heights and concealed elevations are estimates; native geometry isn't a survey.
"""
import csv,gzip,json,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
IDS={int(x) for x in '''2904703330,2904703350,2904703328,2904703320,2904703360,2904703346,2904703348,2904703324,2904703326,1330252044,2491216760,1330242204,2904703322,2883827430,2491216758,2491216746,2883827432,2625105222,2883827412,2883827408,2883827410,2883827406,2491216740,2491216744,2491216742,2904703366,2904703368,2904703364,3107069822,2625104802,3107069824,3107069830,3107069832,3107069826,2491216748,2625104806,3107069828,2625105216,2491216750,896570614,2491216756,2625104804,2491216752,2625105220,2625105218,1208162266,1208162264,1208162268'''.split(',')}
BOUNDS=[-.17865,5.6104,-.17585,5.61435]
def points(cs):
 if isinstance(cs[0],(float,int)):yield cs
 else:
  for c in cs:yield from points(c)
def centre(f):
 ps=list(points(f['geometry']['coordinates']));xs,ys=zip(*ps);return [(min(xs)+max(xs))/2,(min(ys)+max(ys))/2]
context={}
for layer in ['building','road','landuse']:
 records=[]
 for path in sorted((ROOT/'public/maps/accra-v1').glob('source-'+layer+'-*.geojson.gz')):
  for f in json.load(gzip.open(path,'rt'))['features']:
   ps=list(points(f['geometry']['coordinates']));xs,ys=zip(*ps)
   selected=BOUNDS[0]<=centre(f)[0]<=BOUNDS[2] and BOUNDS[1]<=centre(f)[1]<=BOUNDS[3] if layer=='building' else max(xs)>=BOUNDS[0] and min(xs)<=BOUNDS[2] and max(ys)>=BOUNDS[1] and min(ys)<=BOUNDS[3]
   if selected:records.append(f)
 context[layer]=records
assert IDS<={f['id'] for f in context['building']}
# Exterior annotations keep the ordinary roof families visible in overhead views
# apart. Unseen storeys/openings are estimates, not inferred business identities.
annotations='''2904703330 north 3.1 1.1 hip #d0c5ae #967364
2904703350 north 3.0 1.0 hip #d3c6af #9d9180
2904703328 north 3.0 .7 gable #bfb6a1 #898d84
2904703320 north 3.1 1.2 hip #ccc1a9 #885f4d
2904703360 north 3.2 .7 gable #c6c0b0 #a3a494
2904703346 north 3.0 .6 gable #bfb59e #968574
2904703348 north 3.0 1.2 hip #c5b9a0 #885f4d
2904703324 north 3.1 .8 hip #c9c0a9 #9d9180
2904703326 north 3.0 .8 hip #d0c5af #a5a49a
1330252044 north 3.0 1.1 hip #d3c7af #967364
2491216760 north 3.0 1.2 hip #c2b59c #885f4d
1330242204 north 3.0 .7 gable #bfb39c #898d84
2904703322 north 3.2 1.1 hip #d4c8af #967364
2883827430 north 3.0 .9 hip #c7bfab #9d9180
2491216758 middle-west 6.1 1.5 hip #d3c8b0 #885f4d
2491216746 mirage 3.2 .8 hip #ccc4b0 #898d84
2883827432 mirage 9.3 .2 flat #d5d4c5 #a9aaa0
2625105222 middle-west 3.0 .8 gable #c5bca7 #9d9180
2883827412 middle-west 6.0 1.1 hip #d0c5af #885f4d
2883827408 middle-west 3.1 1.0 hip #c6bda7 #9d9180
2883827410 middle-west 3.0 .7 gable #c6bca4 #967364
2883827406 middle-west 6.2 1.7 hip #d1c7b2 #885f4d
2491216740 mirage 55.8 1.0 flat #777973 #92978f
2491216744 middle-west 6.0 1.5 hip #d2c6b0 #885f4d
2491216742 middle-west 6.1 1.6 hip #c7bca4 #967364
2904703366 mirage 6.2 1.7 hip #d3c9b5 #885f4d
2904703368 mirage 6.0 1.5 hip #cbc3b0 #885f4d
2904703364 mirage 3.3 1.3 hip #c8c0aa #967364
3107069822 mirage 3.1 .9 gable #c9c1ac #9d9180
2625104802 middle-west 3.0 .6 gable #bfb59d #898d84
3107069824 kass 3.2 .8 hip #c9c4b0 #a9aaa0
3107069830 middle-west 3.1 .9 hip #d0c4aa #967364
3107069832 middle-west 3.0 1.1 hip #c4b79e #885f4d
3107069826 kass 3.1 .7 gable #c5bda5 #898d84
2491216748 kass 6.1 1.6 hip #d0c2a8 #885f4d
2625104806 kass 3.0 .8 hip #ccc1a7 #9d9180
3107069828 kass 2.7 1.0 hip #c39793 #967364
2625105216 kass 3.0 .6 gable #c7ac49 #a9aaa0
2491216750 kass 6.2 1.5 hip #d0c5ab #885f4d
896570614 kass 50.1 1.3 flat #797c76 #a9aaa0
2491216756 kass 3.1 .8 hip #c7ac49 #a9aaa0
2625104804 kass 3.0 .8 gable #c5bca3 #898d84
2491216752 kass 6.1 1.5 hip #cec1a6 #885f4d
2625105220 kass 3.1 1.0 hip #d0c6ae #967364
2625105218 kass 3.0 .6 mono #bdb49b #898d84
1208162266 kass 3.0 .9 hip #cbc1a8 #9d9180
1208162264 kass 3.1 .7 gable #c4baa0 #898d84
1208162268 kass 3.2 1.0 hip #d2c6ae #967364'''
ann={}
for line in annotations.splitlines():
 i,z,h,r,roof,w,c=line.split();i=int(i);ann[i]=dict(zone=z,wallHeight=float(h),roofRise=float(r),roof=roof,wallColor=w,roofColor=c,dimensionsEstimated=True,facadesEstimated=True,geometrySource='bundled-native-polygon',family='mirage' if i==2491216740 else 'kass' if i==896570614 else 'sunshine-clinic' if i in [2491216756,2625105216] else 'sunshine-lodge' if i==3107069828 else 'residential' if float(h)>5 else 'compound')
assert set(ann)==IDS
buildings=[dict(id=f['id'],rings=f['geometry']['coordinates'],**ann[f['id']]) for f in context['building'] if f['id'] in IDS]
# The western edge of this small source plate intrudes into the native Senchi
# carriageway buffer. Preserve its raw polygon and mark the effective plate as
# an estimated trim, rather than putting a new house/collider in the traffic lane.
for b in buildings:
 if b['id']==3107069828:
  r=b['rings'][0];cut=-.177335;out=[]
  for a,c in zip(r,r[1:]):
   ai=a[0]>=cut;ci=c[0]>=cut
   if ai:out.append(a)
   if ai!=ci:
    t=(cut-a[0])/(c[0]-a[0]);out.append([cut,a[1]+t*(c[1]-a[1])])
  out.append(out[0]);b['renderRings']=[out];b['footprintAdjustment']='estimated-west-edge-trim-to-clear-native-Senchi-road-buffer'
roadIds={103189879,277792478,515063426,316575722,419694822}
roads=[dict(id=f['id'],coordinates=f['geometry']['coordinates'],**f['properties'],width=10.5 if f['properties']['class']=='trunk' else 6,widthEstimated=True) for f in context['road'] if f['id'] in roadIds]
assert len(roads)==5
out='// Generated by build-senchi-skyline.py. Native plates; heights/hidden facades estimated.\n'
for key,value in [('SKY_BOUNDS',BOUNDS),('SKY_BUILDINGS',buildings),('SKY_ROADS',roads),('SKY_CONTEXT_ROADS',[dict(id=f['id'],coordinates=f['geometry']['coordinates'],**f['properties']) for f in context['road'] if f['geometry']['type']=='LineString'])]:out+='export const '+key+'='+json.dumps(value,separators=(',',':'))+';\n'
(ROOT/'public/game/senchi-skyline-map.js').write_text(out)
(ROOT/'tests/fixtures/senchi-skyline-context.json').write_text(json.dumps(context,separators=(',',':'))+'\n')
with (ROOT/'docs/realism/senchi-skyline-buildings.csv').open('w') as fp:
 w=csv.writer(fp);w.writerow(['source_id','zone','family','geometry_source','wall_height_estimate_m','roof_rise_estimate_m','roof_form','reference_evidence','footprint_adjustment','remaining_work'])
 for b in buildings:w.writerow([b['id'],b['zone'],b['family'],b['geometrySource'],b['wallHeight'],b['roofRise'],b['roof'],'September/August 2024 facade and official Mirage gallery' if b['family'] in ['mirage','kass','sunshine-clinic','sunshine-lodge'] else 'overhead roof context; unverified hidden elevations',b.get('footprintAdjustment','none'),'Measured dimensions, current capture, hidden facade and private access; exterior only'])
 w.writerow(['reference:sunshine-front-canopy','kass','manual-canopy','manual-Street-View-overhead-estimate',3.45,.45,'arched-metal-sheet','August 2024 eastward Senchi panorama','Separate manual estimate; not a native record','Measured canopy footprint, support positions and clearance'])
print(len(buildings),'new native exteriors:',2,'towers +',len(buildings)-2,'neighbours')
