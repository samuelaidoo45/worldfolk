"""Validate reference provenance and render the per-item reference queue.

Run after editing docs/realism/reference-images.json. This does not fetch media,
mark models complete, or turn a website check date into a photo capture date.
"""
import csv
import json
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.parse import quote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / 'docs/realism'
registry = json.loads((DOC / 'reference-images.json').read_text())
review_date = date.fromisoformat(registry['as_of'])
threshold = date.fromisoformat(registry['recent_capture_threshold'])
refs = registry['references']
ids = {r['id'] for r in refs}
assert len(ids) == len(refs), 'Duplicate reference ID'
allowed = {'recent_photo', 'dated_publication', 'current_gallery', 'historical_context'}
for r in refs:
    assert r['kind'] in allowed, r['id']
    for key in ('source_url', 'image_url'):
        if r.get(key):
            u = urlsplit(r[key])
            assert u.scheme == 'https' and u.netloc, (r['id'], key)
    assert date.fromisoformat(r['checked_on']) <= review_date, r['id']
    for field in ('captured_on', 'published_on', 'uploaded_on'):
        if r.get(field):
            assert date.fromisoformat(r[field]) <= review_date, (r['id'], field)
    if r.get('captured_month'):
        assert len(r['captured_month']) == 7, r['id']
        assert date.fromisoformat(r['captured_month'] + '-01') <= review_date, r['id']
        assert not r.get('captured_on'), 'Do not invent a capture day from month-only evidence'
    if r['kind'] == 'recent_photo':
        # Preserve month-only capture evidence without inventing a day. The
        # first day provides a conservative comparison against the threshold.
        capture = r.get('captured_on') or (r['captured_month'] + '-01' if r.get('captured_month') else None)
        assert capture and date.fromisoformat(capture) >= threshold, r['id']
        assert r.get('image_url') and r.get('credit') and r.get('license'), r['id']
    if r['kind'] == 'dated_publication':
        assert r.get('published_on'), r['id']

with (DOC / 'coverage-work-items.csv').open(newline='') as f:
    items = list(csv.DictReader(f))
item_ids = {i['id'] for i in items}
for r in refs:
    assert all(s == 'FLEET' or s in item_ids for s in r['subjects']), r['id']

def links(rows):
    return '; '.join(r['id'] for r in rows)

queue = []
for item in items:
    related = [r for r in refs if item['id'] in r['subjects']]
    dated = [r for r in related if r['kind'] == 'recent_photo']
    publications = [r for r in related if r['kind'] == 'dated_publication' and r['id'] != 'google-ghana-refresh']
    galleries = [r for r in related if r['kind'] == 'current_gallery']
    if dated:
        status = 'Recent dated capture available'
        next_action = 'Compare only the photographed component; complete missing angles and record any later changes.'
    elif publications:
        status = 'Dated publication; capture date pending'
        next_action = 'Verify the individual image capture date and exact viewpoint; publication date alone is insufficient.'
    elif galleries:
        status = 'Current source; capture date pending'
        next_action = 'Obtain a dated exterior/interior view; do not label undated gallery images as 2026 captures.'
    elif related:
        status = 'Current photo required'
        next_action = 'Inspect the exact location and record a dated photograph; historical/context links are not acceptance evidence.'
    else:
        status = 'Not yet researched'
        next_action = 'Resolve the exact address or bounded survey area, then attach current dated reference views.'
    queue.append(dict(item_id=item['id'],name=item['name'],priority=item['priority'],reference_status=status,
                      reference_ids=links(related),audited_on=registry['as_of'] if related else '',
                      inspection_target='https://www.google.com/maps/search/?api=1&query='+quote(item['name']+', '+item['area']+', Accra, Ghana'),
                      next_action=next_action))
assert len(queue) == len(items) and len({r['item_id'] for r in queue}) == len(items)
with (DOC / 'reference-coverage.csv').open('w', newline='') as f:
    writer = csv.DictWriter(f,fieldnames=list(queue[0]),lineterminator='\n')
    writer.writeheader(); writer.writerows(queue)

lines = ['# Current image reference register', '', f"Reviewed {registry['as_of']}. This is the active source register for every reconstruction brief.", '',
         'Photo capture, source publication, upload and review dates are different. A 2026 website footer, filename or recent repost does not prove a 2026 photograph. Unknown dates stay unknown. Current-source links identify maintained galleries; they do not certify current physical condition.', '',
         'Dated 2025–2026 photographs replace older primary images where verified. Historical photographs and concepts are archived below and must not establish current paint, tenants, furniture, kiosks, road works or access. Models still need to be compared with the new photographs; changing this register does not change geometry or mark locations complete.', '',
         f'[Structured source records](reference-images.json) · [All {len(items)} inventory items and capture gaps](reference-coverage.csv) · [Archived implementation references](historical-references.md)', '',
         '## Capture checklist', '',
         'For each named place record its exact map/entrance identity, capture date, creator and source URL. Collect front, sides/rear, roof/massing, ground/kerbs and entry views. Interiors require photographs of the actual room type and furnishings. Capture street-level views for paving, bare earth, grass, markings, drainage and signs. Use dated local vehicle photos for generation, livery, wear and passenger layout; manufacturer images only establish the selected product.', '',
         'Google announced refreshed Ghana Street View on 17 June 2026. Use the source and per-item inspection targets to locate views, then record the date displayed by the panorama. A Maps search link is a research target, not a verified image. Do not import Google imagery or third-party photographs into game textures through this workflow.', '']
sections = [('recent_photo','Dated photographs'),('dated_publication','Dated publisher imagery and reports'),('current_gallery','Maintained galleries with unknown capture dates'),('historical_context','Historical and rejected sources')]
for kind,title in sections:
    lines += ['## '+title,'']
    for r in refs:
        if r['kind'] != kind: continue
        date_text = ('Captured '+r['captured_on']) if r.get('captured_on') else ('Captured '+r['captured_month']+' (month only)') if r.get('captured_month') else ('Published '+r['published_on']+'; capture unknown') if r.get('published_on') else 'Capture date unknown'
        lines += [f"### {r['id']}", '', f"**{r['title']}** — {date_text}. Applies to: {', '.join(r['subjects'])}.", '',
                  f"[Source]({r['source_url']})"+(f" · [Image]({r['image_url']})" if r.get('image_url') else ''), '',
                  r['notes'], '', *(([f"Uploaded {r['uploaded_on']}. {r.get('date_evidence', '')}", '']) if r.get('uploaded_on') else []), f"Review: {r['review']}. Credit: {r['credit'] or 'See source'}. Rights: {r['license']}.", '']
counts = Counter(q['reference_status'] for q in queue)
lines += ['## Remaining coverage', '', '| Reference state | Inventory items |', '|---|---:|']
lines += [f'| {state} | {count} |' for state,count in counts.items()]
lines += ['', 'These counts describe evidence availability, not building implementation or acceptance. All unmatched inventory locations remain visible in the CSV instead of receiving a generic photo.', '']
(DOC / 'current-reference-images.md').write_text('\n'.join(lines))
(DOC / 'reference-summary.json').write_text(json.dumps(dict(as_of=registry['as_of'],source_records=len(refs),source_kinds=dict(Counter(r['kind'] for r in refs)),inventory_items=len(queue),reference_status=dict(counts)),indent=2)+'\n')
print(json.dumps(dict(source_records=len(refs),inventory_items=len(queue),reference_status=dict(counts)),indent=2))
