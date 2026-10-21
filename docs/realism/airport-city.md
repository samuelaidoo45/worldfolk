# Airport City — Marina Mall and One Airport Square

Implementation: **17 October 2026. Local only; not deployed.** Partial reconstructions of ACC-047 and ACC-027, with exact native ground footprints and photo-interpreted architecture. Neither location is Accepted or a surveyed digital twin.

## References actually inspected

- [Marina Mall operator](https://marinamallgh.com/) and [about page](https://marinamallgh.com/home/about-us/): exterior photograph visually reviewed, describing its mixed retail/office use. Checker-panel office tower, turquoise glazing, low curved white retail wing and entrance canopy. Photograph capture date unknown; website copyright is not capture evidence. Screenshot: `review-artifacts/airport-city-marina-operator-reference.png`.
- [Marina frontage Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=dSCwfYIjYovh8fgaOuRatg&heading=275&pitch=0): visually inspected and panned, **August 2024 capture overlay**. Raised parking podium/louvres and the front service carriageways remain reference evidence for later grading work. Screenshot: `review-artifacts/airport-city-marina-street-reference-2024.png`.
- [Ghana Rising's 2013 Marina interior article](https://ghanarising.blogspot.com/2013/04/architecture-design-marina-mall-and.html), Quarets Photography: actual escalators, central void/lightwell, pale tiles, glass rails and seating visually reviewed. This historical reference does not establish present tenants, shop fitting or an exact floor plan. Screenshot: `review-artifacts/airport-city-marina-interior-reference.png`.
- [One Airport Square architect project](https://www.mcarchitects.it/en/projects/one-airport-square): project text supports commercial ground plus nine office levels, a northeastern public square, inclined concrete piers, terraces and a ventilation atrium. The architect CDN image was blocked by browser safety and was not inspected or fetched through another route.
- [Micheletti's One Airport Square gallery](https://michelettighana.com/nu/portfolio/one-airport-square/): OAS7 close facade and OAS2 broad context photographs visually reviewed. Concrete diamond lattice, recessed glazing, changing terrace plates and low retail arm guide the model. Capture dates unknown; the 2021 upload directory does not establish image age. Screenshots: `review-artifacts/airport-city-square-contractor-reference.png`, `airport-city-square-context-reference.png`.

Only original procedural geometry, materials, simplified signs and game shop displays ship at runtime. Reference photographs and third-party advertisements are not used as textures. Search results for other cities' Marina Malls were excluded.

## Exterior and access

Exactly two native source shells are replaced: **626143418** for Marina and **749853156** for One Airport Square. The old generic Marina shell and destination are filtered out so they cannot create duplicate architecture or map icons. Nearby source-name search aliases resolve to one canonical destination; distant places with the same name do not redirect here.

Marina has its curved low retail wing, checker-panel/glazed office tower, roof sign, entrance canopy, narrow pavement, planters and seating. Its approach grades are flattened; the real raised parking podium and ramps are **not yet reconstructed**. Tower heights, facade modules and internal subdivisions are estimates. The building footprint alone does not establish these details.

One Airport Square has the native low retail arm and tower outline, a central atrium opening, recessed glass, projecting terrace plates and crossed inclined concrete members. Its public plaza includes benches, planters, a visitor guide and photography. Upper offices and private fit-outs remain closed; no generic office interior is substituted. The atrium is a visual feature rather than a complete walk-through courtyard.

Pedestrian surface patches avoid native service roads. Arrival, camera, activities and NPC approaches are checked against neighbouring footprints and road widths. Canopies have height-bounded colliders so the floor beneath remains walkable. Two local visitors per site stay on pavement and do not increase the real online count.

## Marina visit

The entrance is proximity checked on the server and leads to three **compressed, interpreted game levels**:

1. Supermarket: stocked aisles, grocery/essentials counters, directory and stock-assistant work desk.
2. Shopping gallery: clothing/technology displays, glass balustrades and a persistent seat.
3. Food court: meal counter, tables/chairs, terrace-side glazing and persistent seating.

Lift interactions connect the levels; the supermarket exit returns outdoors. Escalator forms communicate circulation but are not walkable stairs. Shop inventory is fictional Worldfolk stock, not a claim about current tenants. Purchases use the existing saved balance and bag. The existing `mall-stock` profession is now tied to canonical Marina Mall: three timed tasks are required before the first ₵110 wage. It is a game role, not a real vacancy.

Sitting locks movement until the player chooses **Stand up**. It persists during the visit, not across page reloads; shared interior occupancy/poses remain future work.

## Verification and open work

Automated coverage checks exact source IDs, canonical search/map deduplication, safe arrivals/cameras, native road and activity clearance, canopy traversal, continuous local visitors, finite geometry/UVs, static batching, reachable interior hotspots, lift/exit flow and persistent seat release. Local API tests check identity/balance preservation, remote-entry rejection, saved purchases, task gates and recorded wages. Final totals, build and browser evidence are in [implementation progress](implementation-progress.md).

Open: dated current exterior/interior captures, surveyed heights and entry grades, accurate parking podium/ramps, complete tenant fit-outs, accessible real circulation, private office interiors, shared interior activities and physical-device frame times. Isolated model previews omit surrounding city buildings/roads; full-game evidence is identified separately.
