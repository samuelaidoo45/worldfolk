# Rebuild the self-hosted Accra map

Runtime maps, glyphs, search and route data are static assets on this site's own
Cloudflare deployment. No public OSM tile, Nominatim or routing servers are used.
The extract covers [-0.40, 5.40, 0.12, 5.83]; the game remains bounded to Accra.

1. Download `https://download.geofabrik.de/africa/ghana-latest.osm.pbf` once.
2. Create a Python virtual environment and install `osmium==4.3.1 shapely==2.2.0`.
3. Run `python scripts/maps/extract.py /path/ghana.osm.pbf /tmp/accra-map`.
4. Run `python scripts/maps/compact-graph.py /tmp/accra-map/graph.json`, then
   `node scripts/maps/build-tiles.mjs /tmp/accra-map`.
5. Run `node scripts/maps/pack-graph.mjs`, then
   `node scripts/maps/fetch-fonts.mjs /tmp/accra-map`.
6. Run `node scripts/maps/build-street-search.mjs` to generate the named-street search index.
7. Run the map tests, build, then deploy the site normally.

The PBF, raw intermediate layers and tools are build-time only. The map asset
folder is versioned: use a new folder name when updating data, and update
`config.js` and the server graph asset path together. `_headers` caches map data;
reusing an immutable asset URL with different bytes is unsafe.

The source layers use a small documented schema aligned with the game's existing
road/building consumers. `building.height` comes from OSM height/levels, with a
4.5m default when unrecorded. Facades/interiors remain procedural game assets,
not photographic surveys. Road speed defaults and missing OSM access/turn tags
are approximations; the routing engine is for gameplay, not real navigation.
Node-via restrictions, road access, walking exclusions and one-way driving are
supported. Conditional and via-way turn restrictions are not supported yet.

Client routes run in a Web Worker using A* so pathfinding does not block drawing.
Public transport routes are recomputed server-side from the same graph; the
client cannot submit a fake path. No straight-line fallback passes through walls.
Search reads the complete place and named-street indexes locally, with paginated results.
Only locations in the extract exist. City-home exploration validates the selected
place and its name against these same indexes on the server before moving the
player to a walkable arrival point. Existing homes, inventory and balances persist.

Verified place logos are stored in `public/game/logos/`; `sources.json` records
the original official page and asset URL. `place-logo-catalog.js` matches exact
mapped names to those assets. Locations without a verified logo use category
icons. Add actual source artwork and a verified name mapping when expanding it.

Satellite is off by default. To add imagery you have rights to distribute, set
`ACCRALIFE_CONFIG.imagery = {tiles:["https://your-domain/{z}/{x}/{y}.jpg"],
attribution:"Provider attribution",maxzoom:19}`. The optional layer never uses a
Mapbox token. OpenStreetMap does not include aerial imagery.

For larger regions, move the versioned tile prefix to an owned CDN or R2 custom
domain with CORS, or build PMTiles and use its Range-request protocol. Regional
static tiles avoid introducing a tile API, server VM or R2 billing setup for the
current Accra region. Before million-player launch, separately load-test the
multiplayer database, live presence and ride computations; migration removes
Mapbox map usage charges, not all hosting costs.

## Accra rendering references (11 October 2026)

Visual review used Google Maps satellite imagery around Osu (5.556, -0.182)
and Oxford Street photographs as references only; no imagery was copied into
our tiles or textures. Mapped footprints/heights and explicit material/surface
tags take precedence. Unclassified land remains neutral instead of being
misrepresented as paved yards or grass. The next extraction retains land
`surface` and `building:material` tags; existing tiles retain their original
data and coverage. No claim of a photographic or surveyed building replica.

- Reference: https://www.google.com/maps/@5.556,-0.182,17z/data=!3m1!1e3
- Street photos: https://commons.wikimedia.org/wiki/Category:Oxford_Street_(Osu)
- Camera reference: https://www.rockstargames.com/newswire/article/25o2411812oa29/rockstar-game-tips-playing-with-perspective-in-gtav

Roadside food stalls, district-generated palm rows, umbrellas and benches are
not generated. Market interiors remain themed playable spaces. Sparse road
lighting, traffic signals, MoMo game services and ad billboards are gameplay
objects, not surveyed real-world objects. Camera defaults to third person with
speed pullback, smoothed motion and building obstruction checks; K cycles views.
