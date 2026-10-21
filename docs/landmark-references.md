# Accra landmark reconstruction references

Updated 15 October 2026. [The active image register](realism/current-reference-images.md) and [structured provenance](realism/reference-images.json) replace the earlier primary source list. [The complete inventory reference queue](realism/reference-coverage.csv) exposes current-photo gaps for all 264 work items.

The references below use dated recent captures where verified and maintained owner/publisher galleries elsewhere. A current webpage does not prove its photographs are current. Unknown capture dates are explicitly retained. Prior 2013–2019 images and design concepts are in [the historical archive](realism/historical-references.md).

| Location | Active reference sources | Remaining evidence |
|---|---|---|
| Black Star Gate | [Black Star 1.jpg](https://commons.wikimedia.org/wiki/File:Black_Star_1.jpg) · [Black Star 3.jpg](https://commons.wikimedia.org/wiki/File:Black_Star_3.jpg) | Capture dates verified; finish remaining viewpoints. |
| Independence Arch and spectator stands | [Google Ghana Street View imagery update](https://blog.google/intl/en-africa/products/explore-get-answers/experience-the-vibrant-beauty-of-ghana-like-never-before-with-updated-street-view/) | Current panorama capture and exact arch/stand views still required. |
| Kwame Nkrumah Memorial Park | [Kwame Nkrumah -1.jpg](https://commons.wikimedia.org/wiki/File:Kwame_Nkrumah_-1.jpg) · [Original Statue of Kwame Nkrumah.jpg](https://commons.wikimedia.org/wiki/File:Original_Statue_of_Kwame_Nkrumah.jpg) · [KNMP operator virtual tour](https://knmp.gov.gh/new/virtual-tour/) | Post-renovation primary reference; museum and intact approach statue still need dated detail. |
| Accra Mall | [Accra mall.jpg](https://commons.wikimedia.org/wiki/File:Accra_mall.jpg) | September 2026 entrance 2 verified; full frontage and interiors need matching dated views. |
| University of Ghana / Balme Library | [Balme Library 1.jpg](https://commons.wikimedia.org/wiki/File:Balme_Library_1.jpg) · [University of Ghana entrance March 2025.jpg](https://commons.wikimedia.org/wiki/File:University_of_Ghana_entrance_March_2025.jpg) | Keep the library courtyard and campus gate distinct. |
| Ghana National Mosque | [Exterior National mosque of Ghana.jpg](https://commons.wikimedia.org/wiki/File:Exterior_National_mosque_of_Ghana.jpg) · [Ghana National Mosque at night front view.jpg](https://commons.wikimedia.org/wiki/File:Ghana_National_Mosque_at_night_front_view.jpg) | Dated arcade materials and exterior lighting. |
| National Theatre | [Google Ghana Street View imagery update](https://blog.google/intl/en-africa/products/explore-get-answers/experience-the-vibrant-beauty-of-ghana-like-never-before-with-updated-street-view/) | Use Google’s current published imagery; record the panorama capture date before acceptance. |
| National Museum | [National Museum Ghana Life exhibition photographs](https://gna.org.gh/2025/02/photo-exhibition-showcases-ghanas-vibrant-culture-livelihoods-and-everyday-life/) | Dated exhibition context; permanent exterior/interior views still required. |
| Kaneshie Market and terminal | [Kaneshie footbridge and roadside field report](https://gna.org.gh/2026/05/closure-of-kaneshie-footbridge-forces-traders-commuters-to-risk-crossing-highway-daily/) · [Kaneshie repair status update](https://www.citinewsroom.com/2026/08/kaneshie-footbridge-repairs-delayed-by-garid-project-accra-mayor/) | Recent road/bridge context; no complete current facade survey. |
| Jubilee House | [Presidency current media and photographs](https://presidency.gov.gh/media/) | Need a dated exact exterior frame, not an unrelated office/event room. |
| Kempinski | [Kempinski Gold Coast City operator gallery](https://www.kempinski.com/en/hotel-gold-coast-city) | Current operator gallery; capture dates not supplied. |
| Signature | [The Signature operator gallery](https://www.signaturegh.com/) · [The Signature current homepage pool photograph](https://www.signaturegh.com/) | Current operator photography, dated capture still pending. |
| Villaggio Vista | [Villaggio Vista commissioned built photography](https://www.sirenforever.com/villaggio-vista) | Built photographs only; do not use concept art as current interior evidence. |
| The Gallery | [The Gallery current operator gallery](https://www.galleryghana.com/) · [The Gallery one-bedroom operator photographs](https://www.galleryghana.com/gallery-1-bed-apartment) | Current operator photography; each unit and amenity needs capture dates. |
| Spanner / Tetteh Quarshie / outside shops | [Google Ghana Street View imagery update](https://blog.google/intl/en-africa/products/explore-get-answers/experience-the-vibrant-beauty-of-ghana-like-never-before-with-updated-street-view/) · [Installed Tetteh Quarshie cocoa-pod statue](https://www.tiktok.com/@musiq_buz/video/7583993473427049739) | Statue identified; precise bridge, stop seating, terminal and shop capture gaps remain. |
| Ghud Park | [Ghud Park Absa Auto Fair photographic report](https://www.citinewsroom.com/2026/08/day-one-of-absa-auto-fair-in-pictures/) · [Ghud Park current operator pages](https://www.ghudpark.com/) | As-built event photography replaces concept artwork; tents are temporary. |
| Jamestown Lighthouse, Osu Castle, Marina Mall, Holy Trinity Cathedral | [Google Ghana Street View imagery update](https://blog.google/intl/en-africa/products/explore-get-answers/experience-the-vibrant-beauty-of-ghana-like-never-before-with-updated-street-view/) | Exact current dated photographs remain required; a Street View search is not acceptance evidence. |
| Accra Sports Stadium | [Google Ghana Street View imagery update](https://blog.google/intl/en-africa/products/explore-get-answers/experience-the-vibrant-beauty-of-ghana-like-never-before-with-updated-street-view/) | Google links a stadium viewpoint; capture date and pitch/stand/interior angles still required. |

## Using references in a reconstruction

Resolve exact place identity and viewpoint first, then compare dated front, side, roof, ground and entrance images. Record the photo’s capture date separately from publication/upload/review dates. Do not use an image of a nearby bridge, room type, or different generation of vehicle just because its caption shares a place name. The dated mall image establishes entrance 2; the mosque arcade view does not establish the full dome silhouette.

OSM source IDs and footprints continue to establish geographic placement. Authored model dimensions remain estimates until measured evidence is available. Source photographs are not redistributed as game textures. Updating a reference does not automatically update an existing 3D model or complete its acceptance checks.

Build and validate the reference register with `python3 scripts/realism/build-reference-audit.py`. Maintain source dates and per-image review notes in `docs/realism/reference-images.json`; do not mark an undated source as a verified recent capture.


### Terminal 3 parking/access follow-up — 18 October 2026

[Implementation and evidence](realism/airport-parking-access.md): official GACL annex video visually reviewed; north/CIP placement user-confirmed. Three approach options, two exits, ticket equipment and kerb/exit cues inform a bounded playable sample. The former car park is closed and shared routes detour it. Exact gate offsets, perimeter, bay count and footage date remain unverified. No planned hotel/car-park building is represented as completed.


### Airport View Hotel — 18 October 2026

[Reference and implementation brief](realism/airport-view-hotel.md). Operator facade/reception/CIBO/pool/Luna photographs were visually reviewed; capture dates unknown. One native lower-wing outline is preserved; missing tower massing and compressed public-room plans are interpreted. A historical April 2023 Maps photo is contextual evidence, not current Street View acceptance.

## Lancaster Accra Hotel — 18 October 2026

See [Lancaster implementation and source review](realism/lancaster-accra.md). Official operator photographs informed the timber atrium, Branche dining room, outdoor pool, cream/X-trim guest wings and tennis court. Native building/pool/court outlines retained; canopy driveway stays open. Photos have unknown capture dates; room plan, roof heights and portal are estimates. No hotel/Google photographs are embedded in runtime. ACC-143 is In progress / Partial.

## Villa Monticello — 18 October 2026

See [Villa Monticello reference and implementation record](realism/villa-monticello.md). Grey three-storey facade uses a hotel-authored Google Maps photograph explicitly labelled **Image capture: Aug 2026**. Official reception/lounge/Brasserie/courtyard photographs supply wood, blue chairs, circular racks, square fountain and pergola cues; their capture dates are unknown. Native footprint 373795368 is preserved. Public courtyard access follows the operator FAQ; indoor guest/member dining is visible behind glazing. No source photograph is embedded in runtime textures. ACC-142 remains In progress / Partial.

### Oak Plaza East Airport — ACC-147

See [the Oak Plaza implementation/reference record](realism/oak-plaza.md). Operator [overview](https://oakplazahotel.com/accra/overview/) and [dining](https://oakplazahotel.com/accra/restaurant-bars/) establish the Spintex branch and its Lucida, Joe’s and wellness-pool public spaces. Original geometry follows the full native footprint and photo-observed blue glass, suspended navy canopy, cream/stone wings and pool-deck details. Capture dates for the operator gallery remain unknown; the Google Maps photo is November 2020 historical context, not a current Street View survey. East Legon remains a separate hotel. Local implementation is Partial.

## Airport Residential · Kofi Annan / Mary Dei (18 October 2026)

Regus at 19 Kofi Annan Street, the west Mary Dei residence and connected street details use native outlines plus March 2026 operator photos and July 2024 Street View. Official Regus marketing fallback stock was excluded. [Sources, native IDs, estimates and remaining gaps](realism/airport-residential-blocks.md). ACC-206/ACC-271 remain Partial, local only.
