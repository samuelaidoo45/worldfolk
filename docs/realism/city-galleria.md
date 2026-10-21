# City Galleria — ACC-265

Status: **In progress, deployed 15 October 2026**. Cloudflare version `8da6c8c6-a1c9-416d-a7c4-e6e5ed5fa666`. Deployment does not close the accuracy and acceptance gaps below.

## Identity and references

This is **City Galleria beside Accra Mall on Spintex Road**, at longitude −0.1724068, latitude 5.6213165. The bundled OSM footprint is way **1137453837**, represented by osmium area **2274907674**. It is separate from The Gallery Apartments and downtown The Galleria Accra.

- [Google Street View panorama](https://www.google.com/maps/@?api=1&map_action=pano&pano=1U1girtocLLGOdROCS4plA&heading=120&pitch=4&fov=95), **August 2024 capture**, visually inspected and panned across both wings. Establishes five visible levels, a blue wing, white wing, rounded inner bay, glazed bands, ground-floor columns and open forecourt. It does not establish October 2026 tenants or current paint condition.
- [City Galleria listing](https://apartments.com.gh/real-estate/commercial-for-rent/city-galleria-mall_1809), published **28 October 2024**, photo capture dates unknown. Reviewed exterior [7526.jpg](https://apartments.com.gh/oc-content/uploads/18/7526.jpg), lobby [7533.jpg](https://apartments.com.gh/oc-content/uploads/18/7533.jpg) and corridor [7530.jpg](https://apartments.com.gh/oc-content/uploads/18/7530.jpg). Cues include tan polished tiling, glass shop fronts, lift/stair access and curved ceiling details.
- [Sky Light Properties portfolio](https://skylightpropertiesgh.com/portfolio/city-galleria-mall/): five floors, 7,600 square metres, offices, parking and rooftop terrace. Text reviewed; gallery images did not load. No current image review is claimed for this source.
- [MyJoyOnline rooftop report](https://www.myjoyonline.com/photos-joy-fm-90s-jam-resurrects-era-of-fun-and-excitement-after-3-years-hiatus/), published **6 January 2024**, identifies the 5 January rooftop event. Individual event images were not visually inspected; this establishes use only.

References are for visual study. No Google imagery, advertiser photographs, campaign art or event recordings are imported as game textures. Historical storefront names are not treated as a current tenant list. See the structured [reference register](reference-images.json).

## Implemented

- Replaces the generic low extrusion for the mapped building with an L-shaped, five-level blue/white model: glazed bands, mullions, metal seams, rounded inner bay, covered entrance, roof rails, terrace furniture, grey forecourt and three stationary parked vehicles.
- One canonical search/map/destination identity, safe arrival beside the service lane and a nearby entrance interaction. Source road centre lines remain open to the sampled minibus envelope. The original generic building and its duplicate collider are suppressed by both source IDs.
- Three playable interpreted areas: retail lobby, upper offices and rooftop terrace. Lifts connect them with a return path to the lobby exit. Furniture and shop glazing have collision; the camera checks walls and stays below the interior ceiling. Decorative stair treads are not advertised as walkable access to additional floors.
- Three clearly labelled game counters offer water, shirt, trainers and phone through existing server-owned prices and balances. The City Galleria office assistant is a game role, with three tasks and a base ₵145 shift wage. It is not an offer from a real tenant.
- Five local NPC shoppers/hosts/terrace guests; persistent sitting and rooftop dancing until explicit stop. Dancing exposes the existing original procedural music programme when game sound is enabled. NPCs are scenery and do not increase the online-player count.
- Static surfaces are batched. Materials, geometry, textures and the interior WebGL context are disposed on leaving. No new API polling or map provider is added.

## Verification and gaps

**20 focused/regression tests pass**: 18 geometry/search/activity checks across City Galleria, Ghud Park, the frontage and bus stops, plus two local API tests. Coverage includes clear arrival and entrance, sampled road/minibus clearance, all interior hotspot routes, lift transitions, local interaction gates, persistent activities, finite geometry, batching, server-owned prices, proximity/driving restrictions, task order, wrong answers and exactly one wage payout under concurrent completion. Production build, reference audit and whitespace checks pass.

Browser component review verified exterior, corrected shop frontage, walking from lobby to office lift, both lift transitions, seated movement lock, explicit standing, rooftop dancing, stopping and return to the retail exit. The production controller was exercised through the isolated fixture; a browser policy block prevented reloading the existing full-game tab. **Full-game integration is therefore not claimed browser-verified in this pass.** Local server/API verification succeeded.

Evidence: [exterior](../../review-artifacts/city-galleria-exterior.png), [lobby](../../review-artifacts/city-galleria-lobby.png), [offices](../../review-artifacts/city-galleria-offices.png), [sitting](../../review-artifacts/city-galleria-seated.png), [rooftop](../../review-artifacts/city-galleria-rooftop.png). The isolated preview omits neighbouring buildings and the wider city.

Dimensions, 20-metre massing, the 2.1-metre corner bulge, fit-outs and internal room arrangement are estimates. The three game areas do not recreate all five surveyed floor plans. Current tenant identity, detailed facade measurement, actual lift/stair positions, rooftop city panorama, extra floors, shared interior poses, reload persistence for local activities and physical-device frame times remain open. This is a recognisable first pass, not a photogrammetric or fully accepted replica.

## Deployment verification

Published to [worldfolk.world](https://worldfolk.world/game/) with the existing D1, R2 and Durable Object bindings. No database schema migration was required. Production build passed; live HTML and 15 game modules match the build byte-for-byte. Apex/www game routes and anonymous game API return HTTP 200, with no anonymous player session. Browser verification reaches startup, the menu, one canonical City Galleria search result and the rendered destination on the map, with no captured console errors. [Live deployment evidence](../../review-artifacts/city-galleria-live-deployment.png). Authenticated entry and interior activity acceptance were not repeated on a production player account.
