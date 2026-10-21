# Accra Mall — references and playable reconstruction

Updated 13 October 2026. This milestone replaces the generic mall model and room with a dedicated exterior and interior. It is a stylized reconstruction with estimated dimensions; it is not photogrammetry or a surveyed replica.

## Active references — reviewed 15 October 2026

Use the [current reference register](current-reference-images.md) and its image-specific dates. Previous source lists are retained in [the historical archive](historical-references.md).

- [Accra mall.jpg](https://commons.wikimedia.org/wiki/File:Accra_mall.jpg) — **captured 2026-09-12**. ENTRANCE 2 only: grey steel frame and sign, stacked horizontal members, stone side pier and glazed doors. Do not apply this entrance number to every mall entrance.

The dated photo establishes entrance 2. Obtain a recent full frontage, each entrance and concourse/tenant views before accepting their current layouts. The old 2013 interior panorama and 2015 entrance panorama no longer establish current finishes. The [live operator site](https://www.accramall.com/) and [store directory](https://www.accramall.com/accra-mall-stores) remain operational cross-checks; the previously used Map23 plan is historical, not a 2026 survey.

## Implemented components

- OSM way 16836193 supplies the exterior footprint and courtyard opening; no new rectangular shell is drawn across that courtyard.
- North entrance tower with steel legs, louvers, canopy, brick piers, glass doors, sign and bollards.
- Dedicated concourses with six shop interiors: clothing racks, furniture, electronics, groceries and sports displays.
- Open dining court with tables, shade umbrellas, seats and food counters. Sit until the player chooses **Stand up**.
- Staff dialogue, security, shoppers constrained to clear concourse lanes and seated cinema guests.
- Upstairs auditorium, clear central/side aisles and an original animated short. A ₵45 game ticket uses the existing server economy. Watch until **Leave your seat**; return downstairs at the rear.
- Guest-services desk opens the Retail Assistant job, including the existing timed tasks and wages.
- Shared arrival constants connect the city map, backend entry checks and shop/job proximity checks.

## Accuracy boundaries and next refinement

The requested district expansion has a separate [visual reference register](accra-mall-surroundings-references.md) covering The Signature, Villaggio Vista, The Gallery, Spanner footbridge, the roundabout/interchange, Ghud Park, transport stops and outside shops. It records which images have been reviewed and where current reference photographs are still missing. The register does not mark those surroundings as implemented.

The rendered interior is 70 × 84 game metres with a compact upstairs auditorium. These are gameplay dimensions. It does not reproduce every tenant, corridor angle, cinema foyer, parking space or service passage. The exterior retains the map footprint but still simplifies some roof sections and facades. References span different years; the live directory is not proof that all historical photos depict the current layout.

The crowd and sit/watch poses are local to each client; they do not establish synchronized multiplayer seating or realistic crowd capacity. No licensed commercial film, live showtime feed or real-money ticketing is included.

## Verification

```sh
node --test tests/accra-mall.test.mjs tests/city-landmarks.test.mjs tests/nkrumah-park.test.mjs
# With the built local game running on port 3001:
node --test tests/accra-mall-api.test.mjs
npm run build
```

The API test registers its own temporary local player, advances only that player's work timers and signs it out. It rejects non-local targets. No production player records are edited by the fixture.

`tests/fixtures/accra-mall-review.html` supports exterior, shop, dining and cinema visual review. HTTP fixtures must map `/game/` to `public/game/` for its module imports. Full-game review separately exercises actual server purchases and entry transitions.
