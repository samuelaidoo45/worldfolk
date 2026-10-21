# The Signature and Villaggio Vista — apartment interiors

Implemented locally, 13 October 2026. Coverage: **ACC-256 / ACC-257**, both still In progress.

## Active references — reviewed 15 October 2026

Use the [current reference register](current-reference-images.md) and its image-specific dates. Previous source lists are retained in [the historical archive](historical-references.md).

- [The Signature operator gallery](https://www.signaturegh.com/) — **capture date unknown**. Twin towers, terraces and amenities; no capture date supplied.
- [The Signature current homepage pool photograph](https://www.signaturegh.com/) — **capture date unknown**. Poolside courtyard and balcony facade, not a bedroom. Filename contains 2025-11-25, which is only a hint and is not accepted as a capture date.
- [Villaggio Vista commissioned built photography](https://www.sirenforever.com/villaggio-vista) — **capture date unknown**. Built photography commissioned by AHMM. Not a dated 2026 survey and not proof of current furniture or public roof access.
- [The Gallery one-bedroom operator photographs](https://www.galleryghana.com/gallery-1-bed-apartment) — **capture date unknown**. Use the actual apartment gallery for furniture; representative units differ from one another.

Use photographs of built interiors for their exact room types. The Villaggio sky-garden concept is no longer active interior evidence. All apartment floor plans remain original representative game layouts, with current capture dates and unit-by-unit furniture checks still pending.

## Playable visit

1. Choose The Signature Apartments or Villaggio Vista on the city map.
2. Walk from the courtyard arrival to the glowing entrance. Press **E / Enter furnished apartment**.
3. Walk through the lounge, bedrooms, kitchen and bathroom, or through the sliding-door opening onto the terrace.
4. Approach a furnishing and press E to sleep, sit, shower, prepare food or change clothes. Persistent activities expose Wake up, Stand up, Finish shower or Finish cooking. Movement stays stopped until the activity ends.
5. Walk to the entry door and choose **Return to the courtyard**. The outdoor position is retained.

The server recognizes both entrance coordinates and requires a registered session and proximity within five metres. Existing private-home invitation checks remain intact. These named-location visits do not allocate ownership of a unit or move the player's assigned home. Room poses are local to the visit and do not award money, food or needs recovery; wardrobe changes use the existing account outfit system. Shared room presence, apartment leases, server-persisted rest/recovery, lifts and floor selection remain outstanding.

## Rendering and navigation

- Distinct plans and palettes, enclosed ceilings, separated bedrooms/bathrooms and clear door openings.
- Furnished sofas, beds and pillows, curtains, lighting, AC, fitted cabinets, hob, sink, dining table, media console, shower, vanity, toilet, plants and terrace seating.
- Swept movement against walls, glass, railings and furniture. Activity approaches are separate from furniture collision. Camera segments are checked against partitions; height remains below the ceiling.
- Static materials are batched. Both plans stay below 50 static draw groups in the focused test; no mobile performance certification is claimed.

## Verification

- Four apartment tests cover distinct selection, safe exterior approaches, navigable room/exit paths, collision, draw budget and persistent actions.
- Seventeen combined apartment, mall, Signature and Villaggio checks pass. Production build passes.
- Browser review: both named entries work through the normal authenticated game; Signature exit returns to its courtyard. Fixture navigation covers bedroom, shower, kitchen and terrace routes; seating, sleeping and showering expose explicit stop controls.
- Review fixture: `tests/fixtures/apartment-review.html`.
- Screenshots: [Signature apartment](../../review-artifacts/signature-apartment.png), [Villaggio apartment](../../review-artifacts/villaggio-apartment.png).

Deployed to worldfolk.world on 13 October 2026 (Cloudflare version `27c76abd-c270-422d-91a1-6b1d547d08b1`).

## The Gallery addition — 13 October 2026

The Gallery now has its own one-bedroom layout and entrance, grey paired sofas, teal furnishings, pale finishes and balcony. See [The Gallery reference record](the-gallery.md) for the official interior photographs, checks and remaining limits. The same persistent activity and wardrobe controls apply.
