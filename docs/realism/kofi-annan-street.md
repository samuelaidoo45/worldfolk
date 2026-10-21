# Kofi Annan Street — Villaggio surroundings, second batch

Implementation and deployment: **16 October 2026.** Deployed to https://worldfolk.world/game/ as Cloudflare version **08169025-2327-4975-b03d-c74b152fa902**. This pass groups three nearby addresses south of Villaggio. It is a partial photo-referenced reconstruction, with native map outlines and estimated vertical/detail geometry.

| Inventory | Site / source way | Exterior in this pass |
|---|---|---|
| ACC-269 | Octavia 154 / 2514066478 | White projecting balcony frames, glazed ground floor, setback penthouse, roof pool and open portal |
| ACC-270 | Airport Women’s Hospital / 2518616880 | Blue-grey clinical block, lower red-roofed entrance, hospital boards, driveway and forecourt |
| ACC-141 | Kwarleyz Residence / 1388256660 | Stepped stone wings, dark curtain wall and opening panels, top shade roof, entrance canopy, palms and simplified original wall art |

## Reference decisions

- [Kwarleyz operator](https://www.kwarleyzresidence.com/about-us) confirms the 15 Kofi Annan Street identity and tribute to Aunte Kwarley. Visually reviewed the operator’s [exterior photograph](https://ik.imagekit.io/pwkorufib/img/home_2.jpg): curtain-wall modules, open panels, stepped end wall, mural and roof shade. Capture date unknown. `review-artifacts/kwarleyz-operator-reference.png` records the inspected photo.
- [Airport Women’s Hospital contact page](https://www.airportwomenshospital.com/contact/) confirms 16 Kofi Annan Street. The exterior follows the **July 2024** Google Street View panorama, not an old yellow-painted photograph or an unrelated Adenta annex. Panned [the street view](https://www.google.com/maps/@?api=1&map_action=pano&pano=jbjmOo-nkRAlsiSJ4zzkog&heading=20&pitch=0) across both buildings, driveway, gates and forecourt. This is historical context, not proof of October 2026 conditions. Evidence: `review-artifacts/kofi-annan-street-reference-2024.png`.
- [Octavia 154 completed-building gallery](https://www.corner.inc/place/pM2is3t4nSDc): inspected front and side photos with projecting white frames and roof pool. Its page update date is not a photo capture date. Evidence: `review-artifacts/octavia-built-reference.png`.
- Nearby Google Street View at 162 Nii Amaah Ollenu Street shows **February 2016 construction** with no later timeline offered at the visited viewpoint. It establishes street context only. [The architect’s project](https://archinect.com/Konzepten/project/octavia-multi-story-housing-project-accra-ghana) includes a rejected tall proposal as well as a lower proposal; those concept views were not used as proof of the completed facade.
- Shala Yoga’s published address places it at Octavia 154, while the map POI is elsewhere. No separate unverified house was relabelled as a current studio. Its current access, operating status and interior remain research gaps.

No third-party photograph is shipped as a runtime texture. Stone, glazing, roof seams and wall line work are authored locally. The Kwarleyz line motif acknowledges the real facade art but **does not reproduce the actual portrait**; its likeness, exact position and licensed artwork remain a refinement item.

## Playable scope

Three canonical destinations appear in city-home search/icons and support server exploration. Nearby mapped aliases resolve to the authored arrivals; distant same-name branches remain searchable. Only these three source shells are replaced. Existing neighbouring buildings, streets, landmarks and player state remain in place.

Each site has a photo point and outdoor seat, explicit activity start/stop, and a small local visitor pair. NPC scenery does not count as online players. Arrivals, standing access and visitor paths are checked against native buildings and roads; the overview camera clears the surrounding geometry. Bench, stepped building volumes and entrance canopy/posts have collision geometry. Players can move away after contact.

The visit remains outdoors: hospital treatment, private hotel/apartment interiors, rooftop access, ownership and new paid work are not implemented in this pass. Keeping these sites out of the generic-interior fallback avoids presenting one fabricated room as all three buildings.

## Verification and acceptance gaps

Tests cover source IDs, aliases/search, all three local API arrivals with identity/money preservation, native neighbour/road clearance, overview framing, activity access, NPC continuity, collision recovery, finite mesh/UV data and bounded static draw batches. Browser review checks the separate silhouettes and full-game search/arrival. Evidence and totals are in `implementation-progress.md`.

Heights, floor divisions, setbacks, roof pools, the Kwarleyz internal mass splits, facade bays, small landscaping and furniture placement are photo interpretations. The outer OSM outlines are not a cadastral survey. Obtain dated current front/side/rear photos, measured entrance dimensions, current tenants/signs and precise ground/kerb/drain detail. Full interiors, exact portrait art, shared activity poses and physical mobile performance remain open. These three packages are **In progress**, not Accepted.
