# The Signature apartments — ACC-256

Updated 13 October 2026. **In progress: exterior and courtyard visit implemented locally.**

## Active references — reviewed 15 October 2026

Use the [current reference register](current-reference-images.md) and its image-specific dates. Previous source lists are retained in [the historical archive](historical-references.md).

- [The Signature operator gallery](https://www.signaturegh.com/) — **capture date unknown**. Twin towers, terraces and amenities; no capture date supplied.
- [The Signature current homepage pool photograph](https://www.signaturegh.com/) — **capture date unknown**. Poolside courtyard and balcony facade, not a bedroom. Filename contains 2025-11-25, which is only a hint and is not accepted as a capture date.

Use the maintained operator gallery for real exterior/courtyard imagery. The pool image is explicitly a courtyard view. A date embedded in its filename is unverified. Exact current balcony finishes, entrances and apartment furniture still need dated photographs.

## Implemented

- Two individually positioned and rotated towers follow the mapped footprints. Their generic shells are suppressed without suppressing the neighbouring church.
- Stepped terraces, diagonal roof spines, recessed windows, balcony rails, bronze bands, white columns, privacy screens and rooftop volumes replace the low generic blocks.
- Parcel-shaped paving, a courtyard pool with coping, planters, bollards, an entrance sign and a bench provide a pedestrian visit.
- Search **The Signature Apartments** from city home to arrive at the approach. The location stays outdoors instead of opening the generic apartment room.
- Photograph the towers or sit beside the courtyard. Activities continue until the player stops them using the existing activity controls.
- Four daytime visitors follow continuous courtyard paths; one remains at night. Pool, towers, bench, sign and planters have shared collision geometry. Visitor routes avoid them.
- Static geometry is batched by material; the focused check requires fewer than 18 resulting draw groups.

## Accuracy and remaining work

This is a stylized, photo-referenced reconstruction. The 14-level stepping, approximately 49-metre upper structure and vertical proportions are estimates. Ground landscaping, pool position, furniture and visitor access are interpreted from limited views; they are not a verified site plan. Access in the game does not imply real-world public access to the residence.

Still required before full acceptance:

1. Validate tower heights, floor count, roof terraces, current gates and the full ground layout against additional current references or drawings.
2. Survey entrances, accessible routes, parking and boundary treatment; refine materials and planting.
3. Author verified common areas, lifts/stairs and apartment layouts before enabling residential interiors. A representative furnished apartment visit is now available; roof amenities and floor selection remain outstanding.
4. Synchronize visitor activities/poses where appropriate and verify multiplayer transitions. Ambient visitors and outdoor activity poses currently remain client-local.
5. Complete mobile frame-time and full day/night gameplay acceptance. No photorealism or complete replica is claimed.

## Verification

- 17 focused tests pass across `signature.test.mjs`, `city-landmarks.test.mjs` and `precinct-life.test.mjs`.
- Checks cover search/arrival, preservation of the neighbouring church, tower stepping, render batching, courtyard activity reachability, pool collision and retreat, and 300 seconds of continuous visitor paths.
- Full local game: searched and selected the location, arrived at its courtyard, resumed after a reload, and started/stopped the photo pose. No browser console errors were reported during that check.
- Review fixture: inspected tower overview and courtyard; started persistent seating. The fixture is `tests/fixtures/signature-review.html`.
- Production build passed. Deployed to worldfolk.world on 13 October 2026 (Cloudflare version `27c76abd-c270-422d-91a1-6b1d547d08b1`).

Visual evidence: [twin towers](../../review-artifacts/signature-towers.png), [courtyard seating](../../review-artifacts/signature-courtyard.png), [gameplay photo activity](../../review-artifacts/signature-gameplay.png).

Next separate location in the mall surroundings sequence: **Villaggio Vista (ACC-257)**.

## Furnished apartment follow-up

A distinct, walkable apartment with persistent furniture activities and a courtyard entrance is implemented. See [apartment interiors](apartment-interiors.md) for references, verification and remaining ownership/multiplayer work.
