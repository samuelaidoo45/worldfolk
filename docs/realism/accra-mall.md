# Accra Mall — references and playable reconstruction

Updated 13 October 2026. This milestone replaces the generic mall model and room with a dedicated exterior and interior. It is a stylized reconstruction with estimated dimensions; it is not photogrammetry or a surveyed replica.

## Image reference set

| Reference | What it establishes | How it is used |
|---|---|---|
| [Entrance panorama, Nkansahrexford, 2015](https://commons.wikimedia.org/wiki/File:Accra_Mall_Entrance_Panorama_2.jpg) · [view image](https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Accra_Mall_Entrance_Panorama_2.jpg/960px-Accra_Mall_Entrance_Panorama_2.jpg) | Cream low facade, brick piers, exposed steel tower, horizontal members, flared metal canopy, glazed entrance and forecourt bollards | Original geometry at the mapped north entrance; dimensions estimated from photographs |
| [Interior panorama, jbdodane, 2013](https://commons.wikimedia.org/wiki/File:Accra_Mall_(Interior)_Panorama.jpg) · [view image](https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Accra_Mall_%28Interior%29_Panorama.jpg/960px-Accra_Mall_%28Interior%29_Panorama.jpg) | Glass shopfronts, light tiled corridors, darker floor bands and recessed ceiling lights | Materials, shop glazing and concourse details |
| [Official store directory](https://www.accramall.com/accra-mall-stores) | Tenant names and unit numbers | Woodin 52, Ashfoam 39, Compu-Ghana 22, Shoprite G46, Decathlon 1B, Melcom 01A, Vida e Caffè 69/70 and Silverbird FF1/FF2 |
| [Official floor map](https://cdn.prod.website-files.com/651590ace3ae5c8295a6ce8f/65238402e331313328703587_AccraMall_Map23.png) | Ground-floor shopping arms, open central court, anchor shops and separate first-floor cinema area | A compressed two-floor playable arrangement, not exact tenant positions or a tracing of the full plan |
| [Silverbird photo listing](https://mindtrip.ai/attraction/accra-greater/silverbird-cinemas-accra-mall/at-DbZueoGT) | Secondary visual reference for auditorium seating and wall colours | Red/dark seating and blue interior palette; auditorium dimensions remain interpreted |

The Wikimedia exterior photograph is CC BY-SA 4.0; the interior photograph is CC BY 2.0. Refer to their file pages for full attribution and licensing. Photographs and the official floor-map image are linked as references, not bundled as game textures. Geometry, signs, merchandise displays and the animated cinema short are authored in code. Tenant names identify real locations; game goods/prices are fictional and do not imply tenant endorsement.

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
