"""Refresh the coverage inventories without overwriting manually maintained progress.

CSV files in docs/realism are authoritative. The workbook is a portable snapshot.
Run from any directory; only the Python standard library is needed.
"""
import csv
import gzip
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / 'docs/realism'
OUT = ROOT / 'outputs/01a111ce-coverage'
DATE = '2026-10-21'
OUT.mkdir(parents=True, exist_ok=True)


def read(name):
    with (DOC / name).open(newline='') as f:
        return list(csv.DictReader(f))


def maintain(name, rows, key):
    old = {r[key]: r for r in read(name)} if (DOC / name).exists() else {}
    merged = [{**r, **old.pop(r[key], {})} for r in rows]
    merged.extend(old.values())
    assert len({r[key] for r in merged}) == len(merged), name
    with (DOC / name).open('w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]), lineterminator='\n')
        writer.writeheader()
        writer.writerows(merged)
    return merged


priority, places, streets = [read(f) for f in ('priority-places.csv', 'mapped-places.csv', 'mapped-streets.csv')]
stages = ['references', 'exterior', 'interior', 'ground_access', 'activities_people', 'physics', 'performance_multiplayer']


def item(id, name, area, category, priority='P2', unit='Named place', visual='', activity=''):
    return dict(id=id, name=name, area=area, category=category, priority=priority,
                unit=unit, status='Queued', **{k: 'Not assessed' for k in stages},
                next_action='Confirm exact address, current use and reference photographs; define a playable visit.',
                visual_scope=visual, activity_scope=activity, evidence='', updated=DATE)


items = []
for r in priority:
    unit = 'Named place'
    if any(x in r['area'].lower() for x in ('branch', 'mapped', 'every', 'all district', 'surveyed', 'verified', 'by branch')):
        unit = 'Address family'
    if r['category'] == 'Roads and neighborhood character':
        unit = 'Street or district package'
    if r['category'] == 'Residences and daily home life':
        unit = 'Housing type survey'
    x = item(r['id'], r['name'], r['area'], r['category'], r['priority'], unit, r['visual'], r['activity'])
    if 'wider metro' in r['activity'].lower() or r['id'] in ['ACC-157', 'ACC-179', 'ACC-193', 'ACC-212']:
        x['status'] = 'Expansion'
        x['next_action'] = 'Check map boundary and transport coverage; scope the metropolitan expansion before modelling.'
    if unit != 'Named place':
        x['next_action'] = 'Split into individual addresses or bounded street sections; attach map record IDs and current references.'
    items.append(x)

extras = [
 ('ACC-255','Unknown Soldier / Liberation Day Monument','Independence precinct','Heritage and civic landmarks','Bronze sentry, ceremonial bowl, plinth and steps','Memorial walk and photo spot'),
 ('ACC-256','The Signature apartments','Accra Mall / Shiashie','Residences and daily home life','Stepped twin volumes, balcony bands and courtyard','Public approach and authored residential visit'),
 ('ACC-257','Villaggio Vista','Tetteh Quarshie','Residences and daily home life','Distinct coloured towers, sky courts and grounds','Residence access and common areas'),
 ('ACC-258','The Gallery apartments','Behind Accra Mall / Shiashie','Residences and daily home life','White balcony blocks, courtyard planting and roof pool','Residential visit and rooftop recreation'),
 ('ACC-259','Spanner pedestrian footbridge','Accra Mall / Liberation Road','Transport stations and interchanges','Steel arches, hangers, stairs, deck and vehicle clearance','Walk across the highway'),
 ('ACC-260','Accra Mall roundabout and approaches','Accra Mall','Transport stations and interchanges','Mapped circle, kerbs, islands and crossings','Traffic flow and pedestrian navigation'),
 ('ACC-261','Accra Mall trotro terminal','Spintex Road / mall rear','Transport stations and interchanges','Verified boarding bays, shelters and pedestrian access','Board, drive, work and wait'),
 ('ACC-262','Spanner and mall bus-stop seating','Mall district stops','Transport stations and interchanges','Current shelter and bench design at each surveyed stop','Persistent sitting and vehicle boarding'),
 ('ACC-263','Accra Mall outside shop and vendor frontage','Mall boundary and station approach','Everyday services and workplaces','Current individual storefronts and trading pitches','Shopping and seller work'),
 ('ACC-264','Ghud Park','Accra Mall','Beaches parks recreation and sport','As-built lawn, paths, seating and recreation facilities','Walking, events, recreation and sitting'),
]
for id, name, area, cat, visual, activity in extras:
    items.append(item(id, name, area, cat, 'P1', visual=visual, activity=activity))

by_id = {r['id']: r for r in items}
for id in ['ACC-001','ACC-002','ACC-003','ACC-004','ACC-046','ACC-255']:
    x = by_id[id]
    x.update(status='In progress', **{k: 'Partial' for k in stages},
             evidence='implementation-progress.md; ' + ('accra-mall.md' if id=='ACC-046' else 'nkrumah-park.md' if id=='ACC-004' else '../landmark-references.md'))
    if id in ['ACC-001','ACC-002','ACC-003','ACC-255']:
        x['interior']='Not applicable'
    x['next_action'] = {
      'ACC-001':'Compare final proportions with current photos; verify full arrival-to-departure visit and multiplayer poses.',
      'ACC-002':'Review deck/stair visit, camera clearance, multiplayer elevation and phone frame times.',
      'ACC-003':'Finish event crowd scheduling, synchronized activities and mobile performance review.',
      'ACC-004':'Verify renovated museum/reception campus; refine sculpture and compare current views.',
      'ACC-046':'Finish roof detail, full tenant layout and parking; verify synchronized interior activities and mobile performance.',
      'ACC-255':'Refine sentry sculpture and current memorial references; complete visitor acceptance.'}[id]
for id in ['ACC-175'] + ['ACC-'+str(i) for i in range(256,265)]:
    by_id[id].update(status='Research', references='Partial', evidence='accra-mall-surroundings-references.md')
    by_id[id]['next_action'] = 'Finish reference/footprint checks, then author the exterior and its real pedestrian/road approach.'
by_id['ACC-261']['next_action']='Obtain current terminal shelter and loading-bay photos; keep approaches separate from traffic lanes.'
by_id['ACC-262']['next_action']='Obtain current close-ups of each bus-stop shelter and bench before choosing seat geometry.'
by_id['ACC-263']['next_action']='Survey current businesses individually; historical photos do not establish the current vendor roster.'
by_id['ACC-264']['next_action']='Confirm current park boundary and built facilities; separate concept artwork from as-built photographs.'
items = maintain('coverage-work-items.csv', items, 'id')

# A named settlement point is not an administrative boundary. Every recorded area
# remains a survey task, including areas containing a partially completed landmark.
area_types = {'suburb','neighbourhood','village','town','quarter','locality','hamlet'}
area_layers = ['homes','shops_food','workplaces','schools_worship','health_services','transport','streets_paths','ground_water','people_activities','performance_sync']
areas = []
for p in places:
    if p['category'] not in area_types:
        continue
    areas.append(dict(id='AREA-'+p['record_id'], name=p['name'], map_type=p['category'],
                      longitude=p['longitude'], latitude=p['latitude'], status='Not surveyed',
                      **{k:'Not assessed' for k in area_layers},
                      next_action='Draw survey boundary; inventory addresses and unnamed blocks; link each to a work item.',
                      notes='Map label point only; not a municipal boundary or proof of complete coverage.', updated=DATE))
areas = maintain('neighbourhood-coverage.csv', areas, 'id')

# Planned work chapters are production groupings, not official municipal divisions.
zone_specs = [
 ('Central heritage','Independence precinct; Victoriaborg; ministries; Nkrumah Park','P1','Partial landmark passes'),
 ('Central trading','Makola; Okaishie; Tudu; Kantamanto; Salaga; Tema Station','P1','Queued'),
 ('Historic coast','Jamestown; Usshertown; Korle Wokon; fishing harbour','P1','Queued'),
 ('Central residential','Adabraka; Asylum Down; West Ridge; North Ridge','P2','Queued'),
 ('Osu','Oxford Street; Osu side streets; Osu Night Market; coastal approaches','P1','Queued'),
 ('Diplomatic and residential east','Cantonments; Labone; Ringway Estates','P2','Queued'),
 ('La coast','La; South La; Labadi; beach access and fishing streets','P1','Queued'),
 ('Teshie','Teshie old town; Nungua-facing road; estates; beach','P2','Queued'),
 ('Nungua','Nungua old town; market; Junction Mall approaches; coast','P2','Queued'),
 ('Airport City','Terminal approaches; offices; hotels; public transport','P2','Queued'),
 ('Airport Residential','Residential streets; Dzorwulu edges; businesses','P2','Queued'),
 ('Mall district','Accra Mall; Spanner; Signature; Villaggio; Gallery; Ghud Park; interchange','P1','Mall pass and surroundings research'),
 ('Dzorwulu and Abelemkpe','Homes; schools; neighbourhood businesses; roads','P2','Queued'),
 ('Roman Ridge and Kanda','Residential blocks; institutions; Jubilee House public frontage','P2','Queued'),
 ('Nima and Maamobi','Markets; compound homes; religious spaces; paths','P1','Queued'),
 ('New Town and Kokomlemle','Retail; housing; workshops; media offices; streets','P2','Queued'),
 ('Circle corridor','Interchange; terminals; shops; pedestrian routes','P2','Queued'),
 ('Achimota and Tesano','School; forest edge; retail; terminals; homes','P2','Queued'),
 ('North Kaneshie and Bubuashie','Residential blocks; schools; markets; workshops','P2','Queued'),
 ('Kaneshie and Abossey Okai','Market; terminal; spare parts; repair streets','P1','Queued'),
 ('Dansoman and Mataheko','Estate housing; local commerce; schools; leisure','P2','Queued'),
 ('Korle Bu and Korle Gonno','Hospital public areas; homes; trading streets; beach','P2','Queued'),
 ('Chorkor and Mamprobi','Fishing communities; homes; markets; service streets','P2','Queued'),
 ('Odorkor and Darkuman','Transport; stores; workshops; housing','P2','Queued'),
 ('Kwashieman and Awoshie','Junctions; retail; housing; schools','P2','Queued'),
 ('Santa Maria and Anyaa','Residential streets; local services; transport','P3','Queued'),
 ('Lapaz and Abeka','Terminal approaches; high street; homes; shops','P2','Queued'),
 ('Dome and Taifa','Markets; homes; repair businesses; roads','P2','Queued'),
 ('Haatso and Agbogba','Homes; campus links; shops; local transport','P2','Queued'),
 ('Legon','University blocks; halls; libraries; gardens; pedestrian routes','P1','Queued'),
 ('Madina','Market; Zongo Junction; housing; schools; worship','P1','Queued'),
 ('Adenta and Frafraha','Residential neighbourhoods; transport; local services','P3','Boundary review'),
 ('East Legon and Okponglo','Homes; local businesses; campuses; street network','P2','Queued'),
 ('Adjiringanor and East Legon Hills','Housing; retail; access roads; services','P3','Boundary review'),
 ('Spintex and Baatsona','Commercial frontage; industry; housing; connecting roads','P2','Queued'),
 ('Sowutuom and Gbawe','Housing; education; markets; roads','P3','Queued'),
 ('Mallam and McCarthy Hill','Interchange; neighbourhood roads; housing','P3','Boundary review'),
 ('Pokuase and Amasaman','Interchange; terminals; markets; homes','P3','Boundary review'),
 ('Weija and coastal west','Weija; Tetegu; Bortianor; Kokrobite; reservoirs and coast','P3','Boundary review'),
 ('Tema metropolitan extension','Community neighbourhoods; port public edge; markets; offices','P3','Expansion'),
 ('Ashaiman metropolitan extension','Markets; terminals; housing; workshops','P3','Expansion'),
]
zones = maintain('coverage-chapters.csv', [dict(id=f'ZONE-{i:03}',chapter=n,neighbourhoods=a,priority=p,
    status=s,next_action='Define bounded blocks and connect individual place, road and building IDs.', updated=DATE)
    for i,(n,a,p,s) in enumerate(zone_specs,1)], 'id')

component_groups = {
 'Homes and compounds': ['Compound courtyards and shared facilities','Single-room and chamber-and-hall rentals','Bungalows and detached houses','Apartment common areas and stairwells','Mixed shop/home buildings','Student hostels and serviced residences','Gates, walls, balconies and construction plots'],
 'Everyday commerce': ['Provision shops and kiosks','Food stalls and chop bars at verified pitches','Bakeries and cold stores','Hair salons and barber shops','Tailors and clothing shops','MoMo and forex counters','Pharmacies and neighbourhood clinics','Hardware, furniture and electronics shops','Laundries, printers and photo studios'],
 'Workplaces and industry': ['Offices and coworking rooms','Mechanic and vulcanizer yards','Carpentry, welding and fabrication shops','Warehouses and loading yards','Industrial roofs and service roads','Delivery and courier counters'],
 'Public realm': ['Asphalt roads and correct lane markings','Concrete and block-paved pavements','Bare soil, gravel and worn pedestrian paths','Grass verges, trees and planted gardens','Open drains, gutters, culverts and covers','Crossings, dropped kerbs and pedestrian islands','Traffic signals at verified junctions','Street lights and electricity poles','Bus shelters, benches and boarding bays','Taxi ranks and station circulation','Footbridges, stairs, ramps and guardrails','Parking bays, forecourts and driveways','Signs, addresses and approved ad billboards','Public toilets and accessible entrances','Waste bins, collection and recycling points','Water tanks, standpipes and utility structures'],
 'Landscape and water': ['Beach sand, shoreline and surf','Lagoons, streams and wetland edges','Fishing landing areas and canoes','Flood channels and water crossings','Parks, gardens and recreation fields','Cemeteries and memorial grounds'],
 'People and everyday life': ['Human scale, body and facial variety','Walking, running, stairs and slopes','Casual clothing and home wardrobe','Persistent sitting, sleeping and showering','Eating, drinking, dancing and recreation','Work gestures and tools','Pedestrian routes, crossings and queues','School, service and visitor schedules','Handles, profiles and friends','Calls, chat and notifications'],
 'Vehicles and travel': ['Private cars, taxis and ride-hailing cars','Trotros, vans and buses','Trucks, pickups and delivery vehicles','Bicycles, motorcycles and aboboyaa','Wheel, steering and braking animation','Passenger cabins and boarding','Route following, stops and auto-driving','Traffic queues, junction priority and recovery','Collision response without trapping people','Sounds, headlights and suspension'],
 'Shared technical acceptance': ['Day/night lighting and weather','Stable streaming without location resets','LOD, culling and texture budgets','First-person, third-person and overview cameras','Mobile portrait and landscape controls','Authoritative work, buying and inventory','Multiplayer position, pose and activity replication','Save, reconnect, restart and home persistence'],
}
components = []
i=0
for group, names in component_groups.items():
    for name in names:
        i+=1
        components.append(dict(id=f'SYS-{i:03}',category=group,component=name,status='Not assessed',
          next_action='Review the existing implementation; attach a specific defect or reference and a testable acceptance result.',
          evidence='',updated=DATE))
known_partial = {
 'Human scale, body and facial variety':'implementation-progress.md: Human and camera foundation',
 'Walking, running, stairs and slopes':'implementation-progress.md: Walking and walkable precinct updates',
 'Casual clothing and home wardrobe':'implementation-progress.md: Walking, running and home wardrobe',
 'Private cars, taxis and ride-hailing cars':'accra-vehicles.md',
 'Trotros, vans and buses':'accra-vehicles.md',
 'Trucks, pickups and delivery vehicles':'accra-vehicles.md',
 'Bicycles, motorcycles and aboboyaa':'accra-vehicles.md',
 'Wheel, steering and braking animation':'implementation-progress.md: Bicycle rolling correction',
 'Passenger cabins and boarding':'implementation-progress.md: Vehicle animation and cabin pass',
 'First-person, third-person and overview cameras':'implementation-progress.md: Human and camera foundation',
}
for r in components:
    if r['component'] in known_partial:
        r.update(status='In progress', evidence=known_partial[r['component']],
                 next_action='Complete the remaining realism and device acceptance checks recorded in the release notes.')
components = maintain('shared-world-coverage.csv',components,'id')

stats = {}
for layer in ['building','road','landuse','water','waterway']:
    count=0; ids=set(); classes=Counter(); named=0
    for f in (ROOT/'public/maps/accra-v1').glob(f'source-{layer}-*.geojson.gz'):
        for feat in json.load(gzip.open(f,'rt'))['features']:
            count+=1; ids.add(str(feat.get('id'))); p=feat['properties']
            classes[p.get('class','unknown')]+=1; named+=bool(p.get('name'))
    stats[layer]=dict(records=count,unique_ids=len(ids),named=named,classes=dict(classes))

links={'af64f0bd6867':'ACC-001','1638b7a81760':'ACC-002','05a0e2007867':'ACC-003',
       '489a88f97f3c':'ACC-004','3320e1c00d35':'ACC-004','184736c3a68a':'ACC-046',
       'c4b6d720ba59':'ACC-046','5d925d7c9331':'ACC-255','ae2f6a25aa56':'ACC-257',
       '6a8fb6978a10':'ACC-257','e1a2a8598c3c':'ACC-257','8d927cb3cf2e':'ACC-261',
       '5eabe77c7038':'ACC-121','3273a127040c':'ACC-121','dff5a433314f':'ACC-126','b3359b642b38':'ACC-056','d4f6dbdd7189':'ACC-163',
       '603e026128ca':'ACC-288','4262524d3ba5':'ACC-291'}
for p in places:
    p['work_item']=links.get(p['record_id'],'')
    # Raw inventories remain intact; linked work items own reviewed progress.
    p['coverage_state']='Linked work item' if p['work_item'] else 'Not assessed'

data=dict(date=DATE,items=items,areas=areas,zones=zones,components=components,places=places,streets=streets,geometry=stats,
          categories=sorted(Counter(r['category'] for r in places).items()),status_counts=dict(Counter(r['status'] for r in items)))
(OUT/'coverage-data.json').write_text(json.dumps(data,ensure_ascii=False))
summary={k:len(data[k]) for k in ['items','areas','zones','components','places','streets']}
summary.update(status_counts=data['status_counts'],geometry={k:{x:v[x] for x in ['records','named']} for k,v in stats.items()})
(DOC/'coverage-summary.json').write_text(json.dumps(dict(as_of=DATE,**summary),indent=2)+'\n')
print(json.dumps(summary,indent=2))
