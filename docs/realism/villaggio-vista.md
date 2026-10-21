# Villaggio Vista — ACC-257

Updated 13 October 2026. **In progress: local exterior and garden-approach pass.**

## Active references — reviewed 15 October 2026

Use the [current reference register](current-reference-images.md) and its image-specific dates. Previous source lists are retained in [the historical archive](historical-references.md).

- [Villaggio Vista commissioned built photography](https://www.sirenforever.com/villaggio-vista) — **capture date unknown**. Built photography commissioned by AHMM. Not a dated 2026 survey and not proof of current furniture or public roof access.

Use built photography, with its capture date marked unknown. The architect’s 2016 project account and aerial/sky-garden concepts are archived design context and cannot establish current furniture, planting or roof access.

## Placement and modelling

Five bundled OSM building-part IDs are replaced: `1216282334` (Alto), `1216282338` (Aqua), and `1216282324`, `1216282326`, `1216282328` (the red group). Their underlying way IDs are half those encoded IDs. Nearby hotel and residential footprints remain intact.

The model aligns with the approximately orthogonal footprint axes, using separate ground cores and elevated parts. The yellow upper section projects beyond its ground core; the red projection is also open below. The green wing has an independently raised end. White recessed end loggias and upper openings add depth to the three distinct colour families.

Elevations are estimates informed by map attributes and photographs: yellow approximately 72 m, green wing 21 m with a 39 m end, red main 42 m with an 18 m low volume. Floor count, roof services and panel layout have not been surveyed. Rectangular massing approximates slightly irregular source polygons.

## Gameplay included

- Search **Villaggio Vista** on city home and select it to arrive on the approach. The nearby mapped “Villaggio” alias also resolves to the authored outdoor visit; unrelated hotels do not.
- Photograph the towers or sit on the garden bench. Activities remain active until stopped.
- A narrow paved walk, planted strip and trees provide an interpreted common-area approach. Their precise real-world positions and public access are not established by the references.
- Three local daytime pedestrians walk the route; one remains at night. Ground cores and furniture collide, while elevated overhangs do not create invisible walls at ground level.
- The façade colours share one material using vertex colours. The batching utility now retains those colours. The model stays below 18 static draw groups in the focused test.

## Verification and remaining work

- 20 landmark, Signature, Villaggio and precinct-life checks pass; five existing Accra rendering checks and one static-batching regression also pass (**26 total**).
- Checks include search/aliases, neighbouring-building preservation, safe arrival, physical and mesh-level overhang clearance, collision retreat, seat reachability, colour preservation and four minutes of continuous pedestrian routes.
- Browser review covers the coloured exterior, seated garden pose and city-home search-to-arrival in the full local game. The photo pose starts and stops, and no console errors were reported during arrival.
- Production build passes. Visual evidence: [towers](../../review-artifacts/villaggio-towers.png), [garden seating](../../review-artifacts/villaggio-garden.png), [in-game photo activity](../../review-artifacts/villaggio-gameplay.png).

Still open: current full-site survey, exact façade/panel proportions, confirmed entrances and landscape, additional residential/common interiors, roof amenity access, synchronized activity poses and mobile frame-time acceptance. NPCs and outdoor activities remain client-local. A representative furnished apartment visit is now available; owned units and roof amenities remain outstanding. This is a stylized reconstruction, not a photorealistic or complete replica. **Deployed to worldfolk.world on 13 October 2026 (Cloudflare version `27c76abd-c270-422d-91a1-6b1d547d08b1`).**

Next separate location: **The Gallery apartments (ACC-258)**.

## Furnished apartment follow-up

A distinct, walkable apartment with persistent furniture activities and a courtyard entrance is implemented. See [apartment interiors](apartment-interiors.md) for references, verification and remaining ownership/multiplayer work.
