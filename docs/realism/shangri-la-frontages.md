# Shangri-La / Liberation Road roadside batch

**Release update — 19 October 2026:** this exterior pass is deployed at [worldfolk.world/game](https://worldfolk.world/game/) as Cloudflare version `ebe7f7be-0083-4d56-b719-6be29c9fd66c`. Implementation remains Partial; the local-only statements below describe the pre-release review. See [deployment evidence](implementation-progress.md#19-october-2026--roadside-release-acc-272276).

ACC-275 · local exterior pass · reviewed 19 October 2026 · **In progress / Partial**.

## Bounded coverage

The Kofi Annan / Liberation Road junction: Christman House to the north-west, the turquoise First National Bank branch to the south-west, and the opposite fenced roadside. Native source geometry is retained for building ways **2469962810** and **2475835060**. The small security lodge is a photo-based authored prop, not a newly claimed OSM building. Unidentified neighbouring structures, including western bank-side way **2475835062**, remain native geometry.

Model limits: longitude −0.1770 to −0.17555, latitude 5.61665 to 5.61835. East-boundary treatment covers approximately 150 m from 5.61696 to 5.61831; its exact fence line and the corrugated-to-masonry transition are estimates. The hidden redevelopment parcel is not asserted to be fully surveyed.

## Visually inspected references

| Source | Capture / evidence | Use |
|---|---|---|
| [Christman House / Kofi Annan junction](https://www.google.com/maps/@?api=1&map_action=pano&pano=LhLlTsChj48CBs7ZYEpWtg&heading=320&pitch=0) | September 2024 Street View | Three-storey tan facade, brown structural framing, horizontal glazing, deep roof cornice, raised roof panel, low pale wall, narrow trees and bare-soil forecourt |
| [Bank frontage](https://www.google.com/maps/@?api=1&map_action=pano&pano=LhLlTsChj48CBs7ZYEpWtg&heading=210&pitch=0) | September 2024 | Turquoise/cream two-storey building, central reflective glass, open rooftop shade, security lodge, sign stele, compound lawn, driveway and covered drain |
| [West bank boundary](https://www.google.com/maps/@?api=1&map_action=pano&pano=0diIx6DC7WLuFpRzSaDuuA&heading=180&pitch=0) | September 2024 | Bank's blue frontage beyond wall and vegetation; insufficient evidence to remodel the separate western native building |
| [Shangri-La east frontage](https://www.google.com/maps/@?api=1&map_action=pano&pano=eJaEkU8QbbfKVT2J2EDIDQ&heading=90&pitch=0) | September 2024 | Corrugated metal panels, patchy rust, dense trees behind, broad public paving |
| [Northern boundary](https://www.google.com/maps/@?api=1&map_action=pano&pano=iu4v2IUfPHOrmkBGcXjHOA&heading=90&pitch=0) | September 2024; date selector offers September 2024 and May 2016 | Pale masonry wall, scrub/grass strip, paving and slotted concrete drain covers |
| [Perennial developer project page](https://www.perennialholdings.com/properties/ghana/gh-accra-integrated-development.html) | Checked 19 October 2026; proposal and artist impressions, no verified construction/capture date | Establishes proposed redevelopment context only. Not evidence that the illustrated towers are built |
| [First National Bank operator history](https://www.firstnationalbank.com.gh/about-us/) | Checked 19 October 2026 | Confirms GHL merger/name context. The facade itself is from the dated Street View, not this page |

No 2025–2026 dated capture of these particular frontages was verified. The check date is not a capture date. Operator names/occupancy and any works since 2024 require current photography before accuracy acceptance. Street View screenshots are review evidence only; no Google imagery, advertising artwork or photographic texture was shipped into the game.

## Local implementation

- Separate native outlines and distinct facade treatments, front details aligned to Christman House's sloping street edge. Native outline notches remain open; hidden elevations and dimensions are estimates.
- Bank rooftop shade, glazing, turquoise framing, name signs, independent security lodge/sign stele and one reference-supported solar lamp. No invented hotel tower, generic shop stalls or extra traffic-light array.
- Curve-following east corrugated/masonry boundary; reference-informed tree, palm and grass/soil treatments. Median-facing sidewalk strips are excluded.
- Public paving/drains sampled against all native road and building geometry; driveway openings are cut at native service lanes. Shared road cache and width profiles agree for the eleven authored ways, while unrelated interchange profiles are retained.
- Searchable Shangri-La, Christman House and bank-frontage visits. Nearby old GHL/FNB map labels resolve to the public bank approach without redirecting other branches. Three explicit start/stop outdoor guides and two local pavement pedestrians.
- Existing interiors, profiles, balances, traffic rules and the wider district work remain intact. These are exterior visits, not access to private compounds or actual banking services.

## Verification and remaining work

`node --test tests/shangri-la.test.mjs tests/residential-frontages.test.mjs tests/airport-residential.test.mjs tests/kofi-annan.test.mjs` covers exact source IDs, retained unknown neighbours, public arrival/guide clearance, public 20 m service approaches, main carriageway passage, common road profiles, pavement pedestrian safety, bank search/branch matching, native roof notches, finite geometry and batching. All **28 focused checks** and the production build passed. The new scene has **18 static draws / 166,150 vertices** in Node; counts exclude canvas signs and are not device FPS. The full game was launched and searched, both junction guides were opened/stopped, movement between the frontages resumed, and camera clearance was inspected. No console errors were captured. Evidence: `review-artifacts/shangri-gameplay-christman-guide.png`, `shangri-gameplay-bank-frontage.png` and the three daylight model previews.

The rear/private loop of native way **974540788** comes within about a metre of the existing native Christman footprint. That source conflict is unresolved: the building is not reshaped to make the map look cleaner, and public-entry clearance does not certify the full rear loop for vehicles. Obtain survey/current overhead and ground imagery before enabling private circulation there.

Need current photos, facade/roof dimensions, exact parcel/wall alignment, hidden elevation references, physical-device frame times and multiplayer camera acceptance. This batch is local only and does not complete Shangri-La. Next: the adjoining road-facing frontage north towards the African Regent / interchange connection, followed by the Opeibea roadside blocks, keeping interiors for the later phase.
