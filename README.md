# Worldfolk

### Live a virtual life in a real city — starting with Accra, Ghana.

**Worldfolk is a browser-based multiplayer life simulation built around real city geography.** Choose a place on the map, step into a 3D world, meet other players, travel by taxi or tro-tro, work for in-game cedis, and spend them on your virtual life.

Accra is the first playable city. The longer-term vision is to let people explore and experience more cities through their places, culture and everyday activities.

**[Play Worldfolk →](https://worldfolk.world/)** · [Documentation](docs/README.md) · [Contribute](CONTRIBUTING.md) · [Roadmap](docs/roadmap.md) · [Local setup](docs/development.md)

> **Project stage:** playable prototype under active development. Real map data supports the world; landmark models, characters, interiors and gameplay are being improved incrementally. This is not yet a photorealistic replica of all Accra.

## Version and project status

**Current source release: [v0.1.0-alpha.1](https://github.com/samuelaidoo45/worldfolk/releases/tag/v0.1.0-alpha.1)** — an early, playable alpha. See the [changelog](CHANGELOG.md) for release scope and known limits, and the [versioning policy](docs/contributing/versioning.md) for how releases are numbered.

The live site is [worldfolk.world](https://worldfolk.world/); gameplay is at [/game/](https://worldfolk.world/game/). A GitHub release identifies a source snapshot. It does not automatically deploy that revision or certify city-wide realism, smooth phone performance or large-scale capacity.

## Why Worldfolk exists

A map can show where a place is. Worldfolk asks: **what if you could build a life around those places with other people?**

The project brings a Ghanaian setting into an open-world social game: tro-tros, markets, MoMo game roles, local landmarks and neighbourhoods are part of the experience. It is designed for players who enjoy exploration, social role-play and life simulation, and for people curious about Accra.

The central loop is simple:

**Choose a place → explore → meet people → work → earn → spend → keep building your life.**

## Getting started

A desktop or laptop with a modern WebGL-capable browser is recommended for your first visit. Mobile touch controls support portrait and landscape. No game installation or Mapbox key is needed.

1. **Open [Worldfolk](https://worldfolk.world/).** Browse the city map, search a location, or select **Independence Square**. Registration is required before entering gameplay.
2. **Create your player.** Choose an `@handle` and a memorable password or passphrase of at least 8 characters. Save the recovery code shown during registration. New players start with **₵100,000 in fictional game money** and a virtual home; the selected map location determines where exploration begins.
3. **Explore Independence Square.** Look for the distinctive monuments and grandstands. Walk through the precinct, use its stairs and platforms, and approach a seat or photo marker. Press **E** or tap **Interact** to start an activity, then use the same control to stop it.
4. **Try the life and travel loop.** Open the game menu → **Work**, select a profession and travel to its workplace. Complete its task steps to collect wages. Try **Public transport** for a taxi or tro-tro journey; accelerated travel and **Skip ride** are available. Use **My life** to browse shops, home options and leisure activities.
5. **Try multiplayer with a second person or device.** Register a separate account, open **Friends & messages**, and search the other player's `@handle`. Send a private message, add and accept a friend request, then try **Friends & calls**. Incoming messages and calls produce in-game notifications. Voice requires microphone permission from each participant.

**Only have one account?** Exploration, NPCs, work, transport and home activities can be enjoyed solo. NPC visitors are computer-controlled characters; they do not count as online players. Calls require a second online player who has accepted the friendship.

Use **City home** to return to the city-selection map and choose another place. Progress belongs to the registered player account.

## What players can do today

| System | Current experience |
| --- | --- |
| **Explore Accra** | Search mapped places and named streets, switch between 2D and 3D, follow a mini-map, and choose different camera views. |
| **Travel** | Walk or run, drive vehicles, request a taxi or tro-tro, and use route-based auto-driving, fast-forward or skip travel. |
| **Work and earn** | Select task-based professions including driving, teaching, coding, market selling, MoMo agent work and football. Travel to workplaces and complete assignments for wages. |
| **Build a virtual life** | Manage needs and inventory, buy game goods and services, use a home, change outfits, and rest until choosing to wake or stand. |
| **Meet other players** | Use visible handles, profiles, profile pictures and social links; add friends; use public or private text chat and private voice calls. |
| **Receive notifications** | See private-message previews, unread counts and a reply shortcut; answer or decline incoming calls from an on-screen alert. Sounds follow the game's mute setting. |
| **Visit venues** | Enter purpose-specific game environments for malls, markets, restaurants, schools, places of worship, stadiums and other venue types. Activities and ambience vary by setting. |
| **Experience a living setting** | Encounter NPCs and traffic, changing time and weather, character activities, vehicle animation and synthesized sound. |
| **Advertise in the world** | Submit a billboard campaign for administrator review. Publication requires approval and manual confirmation of real-money payment. |

Jobs, balances, purchases, property and MoMo activities are **fictional game systems**, not real earnings or financial services. Advertising is a separate real-money workflow: the current submission form lists **GH₵50 for individuals** and **GH₵100 for businesses** for 24 hours. Payment is arranged manually; there is no automatic checkout.

## What makes it distinctive

- **Accra shapes the gameplay.** Neighbourhoods, landmarks, local transport and professions give the world a specific cultural setting.
- **The map and game share geography.** Roads, building footprints, search, directions and the mini-map use the same self-hosted OpenStreetMap extract.
- **Players choose where to begin.** The game menu leads to a city map where a selected location becomes the starting point for exploration.
- **Social play connects to everyday life.** Friends, conversations, work, home activities and transport sit within the same persistent player experience.
- **It runs in the browser.** The client renders the 3D scene, while Cloudflare services handle accounts, saved state and multiplayer coordination.

## Realism: implemented work and remaining work

The most developed landmark package is the **Independence precinct**: Black Star Gate, Independence Arch, the parade ground, grandstands, walkable stairs/platforms and the Unknown Soldier Memorial. It includes local visitors, seating, photo poses and ambient sound.

Other locations have mapped geometry and/or themed game environments, with varying levels of custom detail. **A mapped location does not mean its exterior and interior have both been faithfully reconstructed.** Buildings with missing source detail use approximations; interiors are designed game spaces rather than surveyed replicas.

**Kwame Nkrumah Memorial Park** now has a distinct mausoleum, statue, fountain walk, gardens and an interactive interpretive museum. See the [reference record and accuracy notes](docs/realism/nkrumah-park.md). **Accra Mall** has a mapped exterior, steel entrance tower, walkable shopping concourses, food court and upstairs cinema, with purchases and retail jobs connected to the game economy. See its [references and reconstruction limits](docs/realism/accra-mall.md). The wider roadmap includes Osu, Makola, the University of Ghana and Labadi, alongside better character animation, vehicles, lighting and device performance.

See the [realism checklist](docs/realism/accra-realism-master-checklist.md), [place inventory](docs/realism/priority-places.csv) and [implementation progress](docs/realism/implementation-progress.md) for the detailed sequence and evidence.

The [current visual reference register](docs/realism/current-reference-images.md) records image dates, credits and remaining capture gaps. [Reference coverage](docs/realism/reference-coverage.csv) tracks evidence for every planned location.

## Controls

| Action | Desktop control |
| --- | --- |
| Move / steer | **WASD** or **arrow keys** |
| Run | **Run** toggle or **Shift** |
| Interact with a nearby place or activity | **E** |
| Enter / leave a nearby vehicle | **F** |
| Change camera | **K**; **Q / R** turn the camera |
| Choose a destination | **N** |
| Request public transport | **T** |
| Open My life | **I** |
| Open text chat | **C** |

On phones and tablets, use the movement joystick, contextual action buttons and game menu. **City home**, the view switch and mini-map controls are also available on screen. Sound starts after user interaction and can be muted in the game.

## How it works

| Layer | Technology and responsibility |
| --- | --- |
| **3D world** | **Three.js / WebGL** renders characters, vehicles, landmark geometry, interiors and game objects on the player's device. |
| **Map and navigation** | **MapLibre GL JS**, self-hosted **OpenStreetMap** vector tiles, local place/street indexes and a shared routing graph. Client pathfinding runs in a Web Worker. |
| **Application and API** | **TypeScript, React, Vinext and Vite**, deployed as a **Cloudflare Worker**. The game client is primarily JavaScript under `public/game/`. |
| **Live multiplayer** | WebSockets and **Cloudflare Durable Objects** coordinate player sessions, district admission and bounded simulation rooms. |
| **Persistence** | **Cloudflare D1 / SQLite** stores accounts, game progress, friendships, chat and other game records; **R2** stores uploaded media. |
| **Voice** | **WebRTC** carries private voice audio with authenticated signaling. TURN relay configuration is needed for reliable connectivity across restrictive networks. |
| **Sound** | **Web Audio** synthesized effects and ambience, with speech synthesis for selected venue programmes. |

Runtime maps, place search and routing do **not** depend on Mapbox or public OSM tile/search servers. Self-hosting controls the mapping architecture; it does not make hosting free. Satellite imagery is not included by default and would require a separately licensed source.

### Multiplayer scope

The app is not limited to 128 registered players. Individual simulation rooms are bounded to 128 live connections, with district overflow allocating additional instances. Players in different instances are not necessarily visible to one another, and party-based instance selection remains future work.

**Million-player operation is an ambition, not a verified capacity claim.** Database partitioning, lower-cost scoped communication, operational safeguards and sustained load tests are still required. See [multiplayer architecture and limits](docs/multiplayer-capacity.md).

### Account and communication scope

Registration uses player-chosen credentials and server-side sessions. Saved progress persists between visits. Account recovery uses a recovery code; email recovery is not implemented. See [account design](docs/accounts.md).

In-game notifications watch new messages while the game is open; unread alert state resets when the page reloads. They are not offline push notifications. Private voice depends on browser permissions and network connectivity. See [calls and notifications](docs/voice-calls.md).

## For developers

**Requirements:** Node.js **22.13.0 or newer**, npm, and a modern browser. A local D1 schema must be initialized before account/game API features work.

```sh
git clone https://github.com/samuelaidoo45/worldfolk.git
cd worldfolk
npm run install:ci
npm run doctor
npm run build
npm run db:setup
npm run start -- --port 3001
```

Open `http://127.0.0.1:3001/game/`. The database command is for **fresh local state** and refuses existing SQLite data. Continue with the [setup and troubleshooting guide](docs/development.md). The live demo above is the fastest way to try Worldfolk; cloning is optional.

### Contribute

Help with gameplay, recognizable Accra locations, original art/animation, multiplayer, testing or documentation. Start with [CONTRIBUTING.md](CONTRIBUTING.md), choose a bounded [roadmap task](docs/roadmap.md), and follow the [engineering standards](docs/contributing/standards.md). Issue and pull-request templates describe the evidence reviewers need.

```sh
npm run check       # contributor docs + offline smoke tests
npm run test:unit   # broader offline suite
```

[Architecture](docs/architecture.md) explains the module boundaries. [Testing](docs/contributing/testing.md) covers local API fixtures and browser/device acceptance. CI runs smoke checks and a build without deploying. The [documentation hub](docs/README.md) links the detailed systems and location records.

### Repository guide

| Path | Contents |
| --- | --- |
| [`public/game/`](public/game/) | Game client, rendering, controls, characters, vehicles, activities and UI. |
| [`app/api/`](app/api/) | Account, gameplay, profile, chat, call and advertising endpoints. |
| [`server/`](server/) | Multiplayer rooms, sessions, map routing and server helpers. |
| [`drizzle/`](drizzle/) | Database migrations. |
| [`scripts/maps/`](scripts/maps/) | OSM extraction, tiles, search and routing data build tools. |
| [`tests/`](tests/) | Unit, API, multiplayer and rendering checks; local review fixtures. |
| [`docs/`](docs/) | Architecture notes, setup, realism references and implementation progress. |

## Map and asset credits

Map data is **© OpenStreetMap contributors**, provided under the ODbL. See the [map attribution and data licence](public/maps/README.html) and [map build documentation](scripts/maps/README.md).

Third-party assets retain their notices: [character assets](public/game/assets/humans/LICENSE.txt), [Three.js](public/game/THREE-LICENSE.txt), [MapLibre](public/game/vendor/MAPLIBRE-LICENSE.txt), and [verified place-logo sources](public/game/logos/sources.json). Real place names and logos identify locations; they do not imply endorsement or partnership.


## Project stewardship

See the [code of conduct](CODE_OF_CONDUCT.md), [security reporting policy](SECURITY.md) and [release checklist](docs/contributing/releases.md). Original Worldfolk source and documentation are licensed under [Apache 2.0](LICENSE); see [NOTICE](NOTICE) and the [asset rules](docs/contributing/assets-and-licensing.md). Third-party map, engine, character and logo rights remain separate.
