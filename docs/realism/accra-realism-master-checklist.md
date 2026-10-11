# Accra realism master checklist

Worldfolk production backlog • 11 October 2026

## Purpose and coverage

Build a recognisable, inhabited Accra: the correct place, the correct architecture, the correct ground and streets, and activities that belong there. Complete one place and its surrounding street before moving to the next. Human characters, vehicles and camera behaviour are shared foundations for every location.

This checklist contains **254 priority work items across 16 categories**, plus the full **12,038 place records** and **6,209 street-search records** currently bundled with the game. Some priority items are whole districts or branch families; split those into individual addresses before building them. These counts describe project data, not an audited census of all businesses, homes or roads in Accra. A named map point does not prove a building's present appearance, interior or operating status.

The current extract covers longitude −0.40 to 0.12 and latitude 5.40 to 5.83. Check each proposed site's position against those bounds. Kokrobite and other outlying locations require coverage review or expansion. Tema and Ashaiman are a wider metropolitan phase; Ada, Prampram, Shai Hills and Aburi belong in a later regional expansion, not a claimed completed Accra map.

### Working files

- [Implementation progress](implementation-progress.md): completed passes, verification and remaining acceptance work.

- [Priority work queue](priority-places.csv): category, area, priority, visual requirements, proposed activities and status.
- [Every bundled place record](mapped-places.csv): names, coordinates, categories and empty reference/review fields.
- [Every bundled street-search record](mapped-streets.csv): street names and representative coordinates. These are search records, not complete road geometry.
- [Existing landmark reference notes](../landmark-references.md): earlier reference work. Existing procedural models still require visual acceptance against this checklist.

**Status convention:** every row starts at “Needs current reference pack” or “Not assessed”. No row is marked realistic merely because the game already draws it. Curated names are survey candidates; exact branches, current names, access, activities and interior layouts must be confirmed before authoring. Activities below are proposed game experiences, not claims about real services offered.

## Build order

**Progress as of 11 October 2026:** first human/camera and vehicle passes are deployed. Work packages 1 and 2 remain in progress; no location has been newly accepted by these releases. Independence precinct now has a verified exterior reconstruction pass; its full visit acceptance remains open. See [implementation progress](implementation-progress.md) for release IDs, verification and remaining work.

| Order | Work package | Acceptance result |
|---|---|---|
| 1 | Human character, animations, scale and camera | A convincing person who can run, sit, sleep and interact without sliding or snapping |
| 2 | Shared materials, vehicles, lighting and street surfaces | Consistent physical scale, believable paint/glass/skin, stable daylight and night views |
| 3 | Independence precinct | Gate, arch, square, stands and connecting street read as one recognisable place |
| 4 | Accra Mall and its approach | Exterior, parking, entrance, shop concourse, food court and shops form one playable visit |
| 5 | Osu street block | Oxford Street segment, one verified restaurant, neighboring homes and transport stop |
| 6 | Makola market block | Recognisable market frontage, navigable trading lanes, sellers and shopping |
| 7 | University of Ghana route | Balme Library, Great Hall approach, one lecture room and one student residence |
| 8 | Labadi Beach | Correct shore, sand, access, surf, people and recreation |
| 9 | Holy Trinity Cathedral and National Mosque | Two genuinely different, properly furnished and animated religious spaces |
| 10 | Nkrumah Memorial Park, National Theatre and Jamestown | Distinct heritage experiences with researched surrounding context |
| 11 | One home, one office, one bank and one hospital | Complete daily-life loop: home → transport → work → shop → home |
| 12 | Remaining P2 then P3 areas | Expand with the same reference and gameplay standard |

P1 means first recognisable districts and daily-life essentials. P2 extends city coverage. P3 is later neighborhood depth or metro expansion. These are production priorities, not judgments about the importance of communities.

## What each place must include

1. **Identity and references:** exact name and aliases, coordinates, mapped footprint IDs, date of imagery, front/side/rear/street references, source URLs and asset licence. Distinguish a pin from a building and a campus from one block.
2. **Exterior:** surveyed or reference-supported dimensions, silhouette, roofs, storeys, facade rhythm, columns, entrances, signs, glass, walls, gates and visible materials. Match recognizable features before adding small decorative detail.
3. **Ground and approach:** classify pavement, concrete, asphalt, bare soil, sand, planted grass and water from evidence. Include kerbs, drainage, steps, driveways and safe pedestrian paths. No citywide orange ground or white slab covering every plot.
4. **Interior:** room plan appropriate to the specific place, believable wall thickness, windows aligned with the exterior, stairs/lifts, doors, furniture and bathrooms. Use authored, clearly fictional layouts where public interior references are unavailable.
5. **People and sound:** appropriate staff, visitors, queues, seated occupants and schedules; localized original or licensed sound with distance falloff. Nearby conversation must remain intelligible.
6. **Activities:** at least one complete visitor action and one relevant work/social loop. Purchases alter inventory and game balance; work produces earnings; activities use the actual furniture or facilities.
7. **Travel and access:** walk/run entry, vehicle drop-off, sensible parking, collision geometry and access rules. Arrival must land on a verified walkable approach, never inside a wall, on a roof or in highway traffic.
8. **Performance:** detailed nearby assets, simpler distant assets, streamed textures and interiors, reliable culling and no visible holes in the current camera frame. Keep state stable while assets load.

## Priority locations

The table entries describe what to research and build. A category template is a starting point only; each named site still needs its own reference pack and acceptance screenshots.

### Heritage and civic landmarks

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-001 | **Black Star Gate** · Independence area | P1 | Star silhouette, inscription panels, arch openings and roundabout | Walk around the monument and photograph it |
| ACC-002 | **Independence Arch** · Independence Square | P1 | Distinct arch, columns and seaward orientation | Explore the public square and view ceremonies |
| ACC-003 | **Independence Square and spectator stands** · Osu | P1 | Full plaza, stands, paving joints and coastal boundary | Attend events, meet friends and sit in stands |
| ACC-004 | **Kwame Nkrumah Memorial Park and Mausoleum** · Accra Central | P1 | Mausoleum geometry, water features, paths and museum | Guided history visit and gardens |
| ACC-005 | **National Theatre** · Victoriaborg | P1 | Sculptural roof volumes, entrance forecourt and auditorium | Watch performances and work backstage |
| ACC-006 | **Jamestown Lighthouse** · Jamestown | P1 | Red and white tower, lantern, gallery and compound | Coastal sightseeing |
| ACC-007 | **Ussher Fort** · Usshertown | P2 | Fort walls, courtyard and historic facade | Museum visit where access is verified |
| ACC-008 | **James Fort** · Jamestown | P2 | Fort proportions, gateways and street context | Exterior heritage walk |
| ACC-009 | **Osu Castle** · Osu coast | P2 | White coastal fort, courtyards and shore relationship | Verified visitor route and historical exhibits |
| ACC-010 | **National Museum** · Adabraka | P2 | Museum roof, entrance and exhibition layout | Browse exhibits and guided tours |
| ACC-011 | **W. E. B. Du Bois Memorial Centre** · Cantonments | P2 | House, memorial grounds and exhibition rooms | Read, tour and attend cultural events |
| ACC-012 | **Arts Centre** · Accra Central | P1 | Craft stalls, courtyards and actual stall circulation | Buy crafts and practise a craft profession |
| ACC-013 | **Asomdwe Park** · Osu | P2 | Memorial landscape, paths and planting | Quiet walking and reflection |
| ACC-014 | **Jamestown fishing harbour and shore** · Jamestown | P1 | Harbour edge, canoes, landing areas and shore surfaces | Fishing economy, repairs and fish trading |
| ACC-015 | **Brazil House** · Jamestown | P2 | Historic facade, windows and courtyard | Cultural visit |
| ACC-016 | **Ga Mantse Palace** · Kaneshie area | P2 | Verified palace frontage and public approach | Public cultural events where appropriate |

### Government and major offices

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-017 | **Jubilee House** · Kanda | P1 | Stool-inspired building silhouette, facade and landscaped public approach | Exterior sightseeing; access-controlled game spaces |
| ACC-018 | **Parliament House and State House** · Ridge area | P2 | Distinct public facades, approaches and forecourts | Visitor reception and civic activities |
| ACC-019 | **Accra International Conference Centre** · Central Accra | P2 | Conference frontage, foyer and hall arrangement | Conferences, exhibitions and event work |
| ACC-020 | **Supreme Court complex** · High Street area | P2 | Court frontage, columns and public circulation | Public reception and fictional civic quests |
| ACC-021 | **Accra City Hall** · Accra Central | P2 | Municipal frontage, signage and service counters | Permits and city services |
| ACC-022 | **Ministries district** · Central Accra | P2 | Separate ministry blocks, compounds and pedestrian routes | Office work and public services |
| ACC-023 | **World Trade Centre Accra** · Ridge | P2 | Tower silhouette, facade modules and lobby | Office jobs and meetings |
| ACC-024 | **Cedi House** · Accra Central | P2 | Tower massing, cladding and entrance | Office work and finance-themed activities |
| ACC-025 | **SSNIT Pension House** · Accra | P2 | Verify exact building and facade before authoring | Office reception and work |
| ACC-026 | **Ridge Towers** · Ridge | P2 | Individual tower profiles and street frontage | Office work |
| ACC-027 | **One Airport Square** · Airport City | P1 | Distinct structural facade and ground plaza | Meetings, office jobs and cafe visits |
| ACC-028 | **Atlantic Tower** · Airport City | P2 | Glazed tower proportions and podium | Office jobs and lobby activities |
| ACC-029 | **Stanbic Heights** · Airport City | P2 | Recognizable tower facade and street-level entrance | Office and banking activities |
| ACC-030 | **Ecobank Head Office** · Ridge | P2 | Building envelope, forecourt and branded entrance | Reception and office work |
| ACC-031 | **MTN House** · Ridge | P2 | Verified facade, signage and public service areas | Telecom jobs and customer services |
| ACC-032 | **Ghana Broadcasting Corporation** · Kanda | P2 | Public frontage and distinct studio buildings | Broadcasting and media jobs in authored studios |
| ACC-033 | **Graphic Communications premises** · Graphic Road | P2 | Office frontage and visible industrial character | Journalism and print-delivery jobs |

### Banks and financial services

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-034 | **The Bank Square** · Ridge | P1 | Current Bank of Ghana complex, tower and podium geometry | Exterior exploration and fictional visitor reception |
| ACC-035 | **Bank of Ghana historic High Street premises** · Accra Central | P2 | Historic street frontage kept distinct from Bank Square | Heritage and finance district exploration |
| ACC-036 | **GCB Bank branches** · Branch by branch | P2 | Exact branch address, signs, ATM enclosure and banking hall | Deposits, withdrawals and bank work using game currency |
| ACC-037 | **Absa branches** · Branch by branch | P2 | Branch-specific frontage and counter layout | Banking and customer-service jobs |
| ACC-038 | **Ecobank branches** · Branch by branch | P2 | Correct branch building and ATM position | Banking and bill payments |
| ACC-039 | **Stanbic Bank branches** · Branch by branch | P2 | Branch-specific signage and lobby | Banking and office activities |
| ACC-040 | **Standard Chartered branches** · Branch by branch | P2 | Verify operating branch and facade | Banking and customer service |
| ACC-041 | **Fidelity Bank branches** · Branch by branch | P2 | Correct storefront and interior counter scheme | Banking and teller work |
| ACC-042 | **CalBank branches** · Branch by branch | P2 | Verified frontage and customer hall | Banking and services |
| ACC-043 | **Zenith Bank branches** · Branch by branch | P2 | Branch-specific facade and signs | Banking and services |
| ACC-044 | **Access Bank and UBA branches** · Branch by branch | P2 | Separate each bank and address into its own work item | Banking and services |
| ACC-045 | **MoMo agents and forex bureaux** · Mapped addresses | P1 | Actual kiosk or shop frontage, canopy and counter | Agent profession, queues and game-money transfers |

### Malls and retail centres

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-046 | **Accra Mall** · Tetteh Quarshie area | P1 | Complete mall footprint, recognizable roof, entrances and parking | Shopfronts, food court, cinema, shopping and retail jobs |
| ACC-047 | **Marina Mall** · Airport City | P1 | Glass frontage, vertical circulation and retail floors | Shopping, dining and work |
| ACC-048 | **Achimota Retail Centre** · Dome area | P2 | Entrance signs, retail layout and parking | Shopping, groceries and retail work |
| ACC-049 | **West Hills Mall** · Dunkonah corridor | P2 | Large frontage, entry plazas and internal concourse | Shopping, cinema and dining; boundary check |
| ACC-050 | **A&C Mall** · East Legon | P2 | Individual blocks, open circulation and site layout | Shopping, eating and fitness activities |
| ACC-051 | **The Junction Mall** · Nungua | P2 | Mall roof, entrances, retail concourse and forecourt | Shopping and social activities |
| ACC-052 | **Palace Mall** · Spintex corridor | P2 | Verify branch footprint, facade and interior aisles | Homeware and grocery shopping |
| ACC-053 | **China Mall branches** · Branch by branch | P3 | Verify each branch, shopfront and loading area | Shopping and warehouse jobs |
| ACC-054 | **Melcom branches** · Branch by branch | P2 | Actual branch building, signs and retail floors | Shopping and retail work |
| ACC-055 | **MaxMart branches** · Branch by branch | P2 | Actual storefront, bakery and supermarket aisles | Groceries, cashier work and deliveries |
| ACC-056 | **Oxford Street Mall** · Osu | P2 | Street-facing shops and local frontage | Shopping and street exploration |

### Markets and trading streets

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-057 | **Makola Market** · Accra Central | P1 | Real blocks, fabric displays, narrow lanes and loading edges | Bargain, sell, carry goods and buy food |
| ACC-058 | **Kaneshie Market Complex** · Kaneshie | P1 | Recognizable multilevel market, stairs and covered walkways | Shopping, trading and porter jobs |
| ACC-059 | **Kantamanto Market** · Accra Central | P1 | Current surveyed layout and roofing; verify reconstruction stage | Clothing resale, tailoring and sorting work |
| ACC-060 | **Agbogbloshie Market** · Central Accra | P2 | Current market footprint, produce stalls and road edges | Produce trading and deliveries |
| ACC-061 | **Mallam Atta Market** · New Town | P2 | Stall lanes, sheds and surrounding shops | Food shopping and seller work |
| ACC-062 | **Nima Market** · Nima | P1 | Street-market arrangement and neighborhood frontage | Trading, food and delivery tasks |
| ACC-063 | **Madina Market** · Madina | P1 | Market lanes, transport edge and covered stalls | Trading and grocery shopping |
| ACC-064 | **Dome Market** · Dome | P2 | Market footprint and bus-stop relationship | Buy food and work as a seller |
| ACC-065 | **Tema Station Market** · Accra Central | P2 | Separate market stalls from vehicle circulation | Food purchases and transport connections |
| ACC-066 | **Osu Night Market** · Osu | P1 | Verified food stalls, cooking areas, seating and night lighting | Eat, cook and meet friends |
| ACC-067 | **Tuesday Market** · Korle Gonno area | P2 | Current ground surface and stall layout | Fish and produce trading |
| ACC-068 | **Salaga Market** · Accra Central | P2 | Historic frontage and current trading layout | Shopping and local history |
| ACC-069 | **La Market** · La | P2 | Verified stalls, drainage and lane surfaces | Groceries and deliveries |
| ACC-070 | **Teshie Market** · Teshie | P2 | Neighborhood market frontage and circulation | Shopping and market work |
| ACC-071 | **Nungua Market** · Nungua | P2 | Current market buildings and trading streets | Groceries and seller work |
| ACC-072 | **Abossey Okai spare-parts district** · Abossey Okai | P1 | Actual shop rows, parts displays and workshops | Vehicle parts sales and mechanic jobs |
| ACC-073 | **Okaishie trading streets** · Accra Central | P2 | Dense storefronts and pedestrian routes | Wholesale and delivery work |
| ACC-074 | **Ashaiman Main Market** · Ashaiman | P3 | Verify footprint and current layout | Trading; wider metro phase |
| ACC-075 | **Tema Community 1 Market** · Tema | P3 | Market blocks and surrounding transport routes | Trading; wider metro phase |

### Churches and mosques

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-076 | **Holy Trinity Cathedral** · Accra Central | P1 | Brick facade, tower, nave and church grounds | Service, choir, sitting and church staff activities |
| ACC-077 | **Holy Spirit Cathedral** · Adabraka | P1 | Distinct roof, facade, altar and seating | Mass-inspired fictional service and community activities |
| ACC-078 | **Christ the King Catholic Church** · Cantonments | P2 | Actual church silhouette, entrance and nave | Service and choir participation |
| ACC-079 | **Accra Ridge Church** · Ridge | P2 | Specific frontage, roof and interior seating | Service and community gathering |
| ACC-080 | **Ebenezer Presbyterian Church** · Osu | P2 | Historic church facade and tower details | Service and choir |
| ACC-081 | **Wesley Methodist Cathedral** · Accra Central | P2 | Verify facade, windows, pulpit and pews | Service and community activities |
| ACC-082 | **ICGC Christ Temple East** · Teshie | P2 | Large auditorium, entrance and site circulation | Service and usher work |
| ACC-083 | **ICGC Christ Temple at Abossey Okai** · Abossey Okai | P2 | Verify current use and distinctive exterior | Service and community programmes |
| ACC-084 | **Action Chapel International Prayer Cathedral** · Spintex corridor | P2 | Auditorium frontage and congregation space | Service and church staff activities |
| ACC-085 | **Perez Chapel Dzorwulu** · Dzorwulu | P2 | Auditorium, compound and stage layout | Service and music |
| ACC-086 | **Qodesh** · North Kaneshie | P2 | Verify current venue name and building reference | Service and community events |
| ACC-087 | **Latter-day Saints Accra Temple** · Cantonments | P2 | Recognizable temple exterior and landscaped grounds | Exterior and public visitor activities |
| ACC-088 | **Ghana National Mosque** · Kanda | P1 | Domes, minarets, courtyard, prayer hall and ablution areas | Prayer, teaching and community gathering |
| ACC-089 | **Cantonments Mosque** · Cantonments | P2 | Actual facade, minaret and courtyard | Prayer and community activities |
| ACC-090 | **Abelenkpe Central Mosque** · Abelenkpe | P2 | Verified facade and prayer-space layout | Prayer and teaching |
| ACC-091 | **East Legon Central Mosque** · East Legon | P2 | Actual roof, entrance and prayer hall | Prayer and community activities |
| ACC-092 | **Madina Central Mosque** · Madina | P2 | Survey exact site, frontage and courtyard | Prayer and teaching |
| ACC-093 | **Neighborhood churches and mosques** · All districts | P3 | Every mapped venue gets its own verified religion and exterior | Denomination-appropriate furniture, schedules and activities |

### Universities colleges and schools

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-094 | **University of Ghana Balme Library** · Legon | P1 | Clock tower, wings, courtyard and reading rooms | Study, library work and meet classmates |
| ACC-095 | **University of Ghana Great Hall and tower** · Legon Hill | P1 | Hill setting, tower, hall proportions and roof | Ceremonies, lectures and campus exploration |
| ACC-096 | **University of Ghana lecture blocks** · Legon | P1 | Separate departmental buildings and room layouts | Attend or teach lessons and coding classes |
| ACC-097 | **University of Ghana residence halls** · Legon | P2 | Individual hall architecture and courtyards | Student homes, dining, sleep and social life |
| ACC-098 | **University of Ghana City Campus** · Adabraka | P2 | Campus entrance and actual teaching blocks | Classes and office work |
| ACC-099 | **University of Professional Studies Accra** · Madina area | P2 | Campus frontage, academic blocks and hostels | Business studies, teaching and student life |
| ACC-100 | **GIMPA** · Greenhill | P2 | Campus terrain, academic buildings and landscaping | Classes, training and office jobs |
| ACC-101 | **Ghana Communication Technology University** · Tesano | P2 | Campus buildings, classrooms and laboratories | Technology study and coding work |
| ACC-102 | **Accra Technical University** · Accra Central | P2 | Urban campus footprint, labs and teaching blocks | Trades, practical work and lectures |
| ACC-103 | **University of Media Arts and Communication** · Accra campuses | P2 | Create separate campus tasks after address verification | Journalism, media and creative courses |
| ACC-104 | **Lancaster University Ghana** · Current campus to verify | P3 | Confirm current site before modelling | Classes and campus life |
| ACC-105 | **Wisconsin International University College** · Haatso area | P3 | Verified academic and residence buildings | Study and teaching |
| ACC-106 | **Pentecost University** · Sowutuom | P3 | Campus footprint and teaching blocks | Study and campus activities |
| ACC-107 | **Regional Maritime University** · Nungua area | P3 | Campus frontage and training buildings | Maritime study and training |
| ACC-108 | **Achimota School** · Achimota | P1 | Distinct school blocks, grounds and dormitories | Classes, sports and school activities |
| ACC-109 | **Accra Academy** · Bubuashie | P2 | School entrance, classroom blocks and grounds | Learning and sports |
| ACC-110 | **Accra High School** · Asylum Down area | P2 | Verified campus and teaching blocks | Classes and sports |
| ACC-111 | **Presbyterian Boys Secondary School** · Legon | P2 | School gate, classrooms, dormitories and fields | Lessons and sports |
| ACC-112 | **St. Mary's Senior High School** · Korle Gonno | P2 | Verified school compound and classroom design | School activities |
| ACC-113 | **St. Thomas Aquinas Senior High School** · Cantonments | P2 | Actual campus buildings and sports grounds | Classes and sports |
| ACC-114 | **Labone Senior High School** · Labone | P2 | Teaching blocks, compound and sports field | Learning and sports |
| ACC-115 | **Ghana International School** · Cantonments | P2 | School campus buildings and landscape | Lessons and staff work |
| ACC-116 | **Lincoln Community School** · Abelemkpe | P2 | Verified campus architecture and facilities | Learning and recreation |
| ACC-117 | **Public basic schools and preschools** · Every district | P3 | School-specific yards, classrooms and signs | Teaching, learning and age-appropriate NPC routines |

### Restaurants cafes and nightlife

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-118 | **Buka Restaurant** · Osu | P1 | Verify facade, entrance, terrace and dining furniture | Order Ghanaian food, serve and cook |
| ACC-119 | **Azmera Restaurant** · Roman Ridge | P1 | Current dining rooms, buffet and exterior | Buffet dining and hospitality work |
| ACC-120 | **Bistro 22** · Labone | P1 | Indoor dining, outdoor terrace and bar | Dining, serving and meeting friends |
| ACC-121 | **Frankie's** · Osu | P2 | Street storefront, counter and seating | Dining and hospitality work |
| ACC-122 | **Noble House** · Branch by branch | P2 | Branch-specific frontage and dining room | Restaurant work and meals |
| ACC-123 | **La Chaumière** · Airport area | P2 | Verify current premises and room design | Dining and service |
| ACC-124 | **DNR Turkish Restaurant** · Accra | P2 | Verify exact location, dining room and frontage | Dining and kitchen work |
| ACC-125 | **Chez Clarisse** · Osu | P2 | Verified entrance, courtyard and dining layout | Meals and social activity |
| ACC-126 | **Papaye branches** · Branch by branch | P1 | Correct shopfront, counter, kitchen and takeaway queue | Fast food, cashier work and deliveries |
| ACC-127 | **KFC and other chain restaurants** · Mapped branches | P2 | Branch-specific building and seating | Food purchases and delivery work |
| ACC-128 | **Cafes and bakeries** · Mapped addresses | P2 | Actual counters, ovens, displays and tables | Coffee, pastries, study and barista work |
| ACC-129 | **Republic Bar and Grill** · Osu | P1 | Verify current frontage, bar and performance space | Original live music, dancing and socialising |
| ACC-130 | **+233 Jazz Bar and Grill** · North Ridge | P2 | Stage, seating and outdoor atmosphere | Live music and hospitality jobs |
| ACC-131 | **Alliance Française Accra** · Airport area | P2 | Cultural centre, stage and classroom spaces | Concerts, language learning and events |
| ACC-132 | **National Theatre performance spaces** · Victoriaborg | P2 | Distinct stage, seats and foyer | Performances and backstage work |
| ACC-133 | **Sandbox Beach Club** · South Labadi area | P2 | Verify operating site, terrace and beach boundary | Beach socialising, dining and music |
| ACC-134 | **Nightclubs and lounges** · Verified current venues | P2 | Venue-specific lighting, stage, seating and dance floor | Dancing, DJ work and door staff |
| ACC-135 | **Local chop bars and food vendors** · Verified mapped sites | P1 | Survey actual stalls; no random stalls across the map | Buy food, prepare meals and seller work |

### Hotels and hospitality

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-136 | **Kempinski Hotel Gold Coast City** · Ridge area | P1 | Complete complex, wings, courtyards and entrance | Lobby, guestrooms, dining, pool and hotel work |
| ACC-137 | **Mövenpick Ambassador Hotel** · Central Accra | P1 | Main block, facade, grounds and pool | Reception, rooms, restaurant and hotel jobs |
| ACC-138 | **Labadi Beach Hotel** · La | P1 | Low-rise resort buildings, gardens and beach approach | Rooms, dining, recreation and hospitality work |
| ACC-139 | **La Palm Royal Beach Hotel** · La | P2 | Verify current compound, resort blocks and public rooms | Hotel stay and recreation |
| ACC-140 | **Accra Marriott Hotel** · Airport City | P2 | Tower, facade, lobby and drop-off | Hotel stay and service work |
| ACC-141 | **Kwarleyz Residence** · Airport Residential | P2 | Distinct massing, facade and apartment layouts | Serviced apartment stays |
| ACC-142 | **Villa Monticello** · Airport Residential | P2 | Boutique compound and individual room treatment | Stay, dining and hospitality jobs |
| ACC-143 | **Lancaster Accra** · Airport area | P2 | Verify current branding, facade and grounds | Hotel activities |
| ACC-144 | **Accra City Hotel** · Central Accra | P2 | Facade, entry and interior circulation | Accommodation and restaurant work |
| ACC-145 | **Alisa Hotel North Ridge** · North Ridge | P2 | Building wings, entry and conference rooms | Hotel stays and conferences |
| ACC-146 | **Airport View Hotel** · Airport area | P2 | Hotel frontage and guest facilities | Accommodation and airport transfers |
| ACC-147 | **Oak Plaza Hotel** · East Airport | P2 | Distinct frontage, lobby and rooms | Accommodation and events |
| ACC-148 | **Coconut Grove Regency Hotel** · North Ridge | P2 | Compound, frontage and room arrangement | Hotel stays |
| ACC-149 | **Fiesta Royale Hotel** · Dzorwulu | P2 | Hotel compound, landscape and public rooms | Stay and hospitality work |
| ACC-150 | **Guesthouses and budget hotels** · Mapped addresses | P3 | Real frontage with different room sizes and facilities | Affordable stays and work |

### Beaches parks recreation and sport

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-151 | **Labadi Beach** · La | P1 | Actual coastline, sand, access paths and verified facilities | Swim, walk, play, sit and meet friends |
| ACC-152 | **Laboma Beach** · La | P2 | Separate entrance and beachfront setting | Beach recreation and social activity |
| ACC-153 | **Korle Gonno beach** · Korle Gonno | P2 | Coastal roads, shore and neighborhood relationship | Walking and community recreation |
| ACC-154 | **Teshie beach and fishing community** · Teshie | P2 | Shoreline, canoe areas and village frontage | Fishing and beach activities |
| ACC-155 | **Nungua beachfront** · Nungua | P2 | Verified shore surfaces and public access | Coastal activities |
| ACC-156 | **Bojo Beach** · Western coastal corridor | P3 | Verify access, lagoon edge and beach infrastructure | Beach recreation; boundary review |
| ACC-157 | **Kokrobite beach** · Western expansion | P3 | Village, boats and shore geometry | Beach, music and fishing; map extension |
| ACC-158 | **Legon Botanical Gardens** · Legon | P2 | Current paths, water features and facilities | Walk, relax and recreation after current-use check |
| ACC-159 | **Achimota Forest and Accra Zoo** · Achimota | P2 | Vegetation, public paths and verified visitor facilities | Nature walks and educational visits |
| ACC-160 | **Efua Sutherland Children's Park** · Central Accra | P2 | Current paths, vegetation and equipment condition | Park recreation after current-condition survey |
| ACC-161 | **Lakeside Marina Park** · Lakeside area | P3 | Lake edge, paths and recreation areas | Boating and recreation where represented |
| ACC-162 | **Mmofra Place** · Dzorwulu | P2 | Garden play spaces and community structures | Family recreation and learning |
| ACC-163 | **Accra Sports Stadium** · Osu | P1 | Full bowl, stands, pitch, tunnels and exterior | Watch matches, play football and stadium jobs |
| ACC-164 | **El-Wak Stadium** · Cantonments area | P2 | Track, pitch and stand geometry | Sports and training |
| ACC-165 | **University of Ghana Sports Stadium** · Legon | P2 | Stadium stands, pitch and public access | Matches and athletics |
| ACC-166 | **Bukom Boxing Arena** · Bukom | P1 | Recognizable arena shell, seating and ring | Boxing events and training |
| ACC-167 | **Theodosia Okoh Hockey Stadium** · Accra Central | P2 | Hockey pitch, stands and perimeter | Play and watch hockey |
| ACC-168 | **Accra Polo Club** · Airport area | P2 | Fields, club frontage and verified public areas | Spectating and recreation |
| ACC-169 | **Achimota Golf Club** · Achimota | P2 | Course terrain, paths and clubhouse | Golf and social activities |
| ACC-170 | **Accra Lawn Tennis Club** · Accra Central | P2 | Court surfaces, boundaries and clubhouse | Tennis and recreation |
| ACC-171 | **Community pitches and sports courts** · Every district | P1 | Distinguish dirt pitches, grass and hard courts | Football, basketball and exercise |

### Transport stations and interchanges

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-172 | **Accra airport Terminal 3** · Airport | P1 | Current airport name, terminal facade, drop-off and public concourse | Check-in, arrivals, taxi work and virtual travel |
| ACC-173 | **Accra airport domestic terminal** · Airport | P2 | Separate terminal frontage and passenger circulation | Domestic virtual travel |
| ACC-174 | **Kwame Nkrumah Circle Interchange** · Circle | P1 | Correct bridge levels, ramps, pillars and pedestrian links | Drive, transfer and navigate without lane overlap |
| ACC-175 | **Tetteh Quarshie Interchange** · Airport and mall area | P1 | Exact road decks, ramps, slopes and merges | Driving and transport connections |
| ACC-176 | **Obetsebi Lamptey Interchange** · Kaneshie corridor | P1 | Current completed road levels and ramp geometry | Driving and public transport |
| ACC-177 | **Pokuase Interchange** · Pokuase | P2 | Multi-level geometry and safe pedestrian links | Driving; northwest coverage review |
| ACC-178 | **Flower Pot Interchange** · Spintex corridor | P1 | Current bridge alignment, ramps and roadside context | Driving and public transport |
| ACC-179 | **Tema Motorway Interchange** · Tema | P3 | Current road geometry, lanes and approaches | Wider metro travel |
| ACC-180 | **Ako Adjei Interchange** · Ring Road | P2 | Actual ramp connections and signage | Driving and public transport |
| ACC-181 | **Mallam Interchange** · Western Accra | P2 | Road levels, curved ramps and approaches | Driving and travel |
| ACC-182 | **Apenkwa Interchange** · Achimota corridor | P2 | Bridge, slip roads and roadside edges | Driving and public transport |
| ACC-183 | **Kaneshie transport terminals** · Kaneshie | P1 | Marked boarding lanes, loading bays and market pedestrian routes | Tro-tro, taxi driving and boarding |
| ACC-184 | **Circle Neoplan and VIP terminal areas** · Circle | P1 | Separate operators and actual boarding layouts | Bus travel and driver jobs |
| ACC-185 | **STC terminal** · Kaneshie corridor | P2 | Verified terminal, departure bays and passenger areas | Intercity virtual travel |
| ACC-186 | **Tema Station** · Accra Central | P1 | Bays, pedestrian queues and neighboring market | Tro-tro boarding and driving work |
| ACC-187 | **Tudu transport terminals** · Accra Central | P2 | Actual station entrances and vehicle circulation | Transport and deliveries |
| ACC-188 | **Madina Zongo Junction and station** · Madina | P1 | Junction, stops, footpaths and commercial frontage | Tro-tro and taxi trips |
| ACC-189 | **Achimota bus terminal** · Achimota | P2 | Actual bays and passenger shelter layout | Bus connections and jobs |
| ACC-190 | **37 transport station** · 37 area | P2 | Verified station footprint and pickup lanes | Tro-tro, taxi and commuting |
| ACC-191 | **La and Teshie lorry stations** · La and Teshie | P2 | Separate each mapped station and queue layout | Public transport and driver work |
| ACC-192 | **Accra railway station** · Accra Central | P2 | Station frontage, platforms and verified current track use | Station exploration; service simulation labelled fictional |
| ACC-193 | **Tema Harbour and fishing harbour** · Tema | P3 | Publicly visible port frontage and commercial setting | Wider metro logistics in authored game areas |

### Roads and neighborhood character

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-194 | **Oxford Street and Osu side streets** · Osu | P1 | Mixed storefronts, paving, drains, signs and night lighting | Walk, shop, eat and drive |
| ACC-195 | **High Street and coastal heritage route** · Central Accra | P1 | Actual road edges, monuments and historic frontage | Heritage walk and driving |
| ACC-196 | **Independence Avenue** · Central Accra | P1 | Civic frontage, medians and signal placement | Driving and walking |
| ACC-197 | **Liberation Road** · 37 and Airport corridor | P1 | Lane geometry, commercial frontage and junctions | Commuting and driving |
| ACC-198 | **Ring Road corridors** · Central Accra | P1 | Segment-specific lanes, medians and intersections | Commuting and transport |
| ACC-199 | **Spintex Road** · East Accra | P1 | Commercial buildings, junctions and varying road edges | Shopping, work and driving |
| ACC-200 | **George Walker Bush Highway N1** · Accra | P2 | Grade separation, barriers, signs and crossings | Vehicle travel; pedestrians use appropriate routes |
| ACC-201 | **Accra Tema Motorway** · Eastward corridor | P2 | Current lanes, shoulders and interchange connections | Longer vehicle trips |
| ACC-202 | **Graphic Road and Abossey Okai roads** · Central west | P2 | Workshop frontage, freight loading and industrial surfaces | Repairs and deliveries |
| ACC-203 | **Nima and Maamobi streets** · Nima and Maamobi | P1 | Dense frontage, verified surfaces and local activity | Daily life and neighborhood work |
| ACC-204 | **New Town and Kokomlemle streets** · Central north | P2 | Mixed housing, shops and local street geometry | Daily life and commuting |
| ACC-205 | **Labone and Cantonments streets** · Labone and Cantonments | P2 | Walls, mature trees, setbacks and mixed uses | Residential and office activities |
| ACC-206 | **Airport Residential and Dzorwulu** · North-central Accra | P2 | Actual apartment blocks, houses and commercial plots | Living, working and socialising |
| ACC-207 | **East Legon and Adjiringanor** · Northeast Accra | P2 | Different plot boundaries, homes and shops | Residential and leisure activities |
| ACC-208 | **Dansoman and Mataheko** · West Accra | P2 | Estate streets, homes and local retail | Daily life and commuting |
| ACC-209 | **Adabraka and Asylum Down** · Central Accra | P2 | Mixed older homes, shops and offices | Living and working |
| ACC-210 | **Teshie and Nungua streets** · East coast | P2 | Local residential streets, coastal settings and markets | Daily life and coastal activities |
| ACC-211 | **Madina and Adenta** · Northern corridor | P2 | Neighborhood-specific building mix and road surfaces | Commuting, learning and trade |
| ACC-212 | **Tema communities and Ashaiman** · Wider metro | P3 | Different planned and mixed-use street patterns | Expansion phase living and work |

### Residences and daily home life

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-213 | **Traditional compound homes** · Surveyed neighborhoods | P1 | Shared courtyard, room entrances, cooking and wash spaces | Private rooms, cooking, sleep, washing and neighbor conversations |
| ACC-214 | **Single-room and chamber-and-hall rentals** · Surveyed neighborhoods | P1 | Accurate room sizes, furnishings and shared facilities | Affordable living, rent and household tasks |
| ACC-215 | **Estate bungalows** · Dansoman and similar surveyed areas | P2 | Actual roof form, setbacks, gardens and boundary walls | Home ownership and family routines |
| ACC-216 | **Detached houses** · Cantonments, East Legon and other sites | P2 | Property-specific roofs, gates and gardens | Living, furnishing and hosting friends |
| ACC-217 | **Apartment buildings** · Mapped residential sites | P1 | Actual building exterior, stairs, corridors and varied flat plans | Renting, lift or stair access and domestic routines |
| ACC-218 | **Serviced apartment towers** · Airport and Cantonments sites | P2 | Real facade with authored apartment types | Higher-cost residences and services |
| ACC-219 | **Student hostels** · Legon, UPSA and other campus areas | P2 | Shared corridors, room types and communal spaces | Student life and socialising |
| ACC-220 | **Mixed shop and residential buildings** · Citywide | P1 | Ground-floor commerce and separate home entrance | Shopkeeper homes and local work |
| ACC-221 | **Homes under construction** · Verified plots | P3 | Visible structural stage and site boundary | Construction profession and future property work |

### Health emergency and public services

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-222 | **Korle Bu Teaching Hospital** · Korle Bu | P1 | Individual hospital blocks and legible public entrances | Reception, treatment and healthcare professions |
| ACC-223 | **Greater Accra Regional Hospital** · Ridge | P1 | Modern hospital frontage and public interior routes | Healthcare and recovery |
| ACC-224 | **37 Military Hospital** · 37 area | P2 | Verified public hospital entrance and civilian-facing areas | Healthcare and hospital work |
| ACC-225 | **University of Ghana Medical Centre** · Legon area | P2 | Hospital massing and public reception spaces | Healthcare and hospital professions |
| ACC-226 | **Police Hospital** · Cantonments | P2 | Public frontage and hospital circulation | Healthcare and service jobs |
| ACC-227 | **Nyaho Medical Centre** · Airport Residential | P2 | Clinic-specific frontage and reception | Healthcare |
| ACC-228 | **The Trust Hospital** · Osu | P2 | Verified building, entrance and reception | Healthcare and work |
| ACC-229 | **Community clinics and pharmacies** · Mapped branches | P1 | Actual shopfront or clinic, counter and waiting area | Care, medicine and pharmacist work |
| ACC-230 | **Ghana Police Headquarters** · Cantonments | P2 | Public-facing buildings and approach | Fictional police career and public reporting |
| ACC-231 | **Police stations** · Every mapped district | P2 | Branch-specific frontage, reception and parking | Report incidents and police work |
| ACC-232 | **Fire stations** · Mapped districts | P2 | Station facade, appliance bays and forecourt | Firefighter profession and emergency simulation |
| ACC-233 | **Accra Central Post Office** · Accra Central | P2 | Historic frontage, customer hall and parcel counters | Mail and parcel delivery jobs |
| ACC-234 | **DVLA offices** · Verified branches | P2 | Actual public counters and vehicle-testing space | In-game driver licensing and services |
| ACC-235 | **Libraries and community centres** · Mapped sites | P2 | Real frontage, reading rooms and halls | Reading, learning and community events |
| ACC-236 | **Public toilets and water points** · Mapped sites | P2 | Actual location, entrance and surface treatment | Basic city facilities and maintenance jobs |

### Military compounds and civic boundaries

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-237 | **Burma Camp** · Accra | P2 | Publicly visible frontage, signs, boundary and broad setting | Exterior recognition and access-controlled fictional game spaces |
| ACC-238 | **El-Wak Barracks area** · Cantonments area | P2 | Current condition survey; avoid relying on old imagery | Exterior recognition |
| ACC-239 | **Ghana Military Academy** · Teshie | P2 | Public frontage and campus silhouette | Exterior recognition and authored career scenes |
| ACC-240 | **Military hospital and community facilities** · Verified public-facing sites | P2 | Separate public facilities from restricted compounds | Appropriate public services |

### Everyday services and workplaces

| Item | Place and area | Priority | Visual work | Proposed experience |
|---|---|---|---|---|
| ACC-241 | **Fuel and charging stations** · Mapped branches | P1 | Real canopy, pumps, shop, entry and exit lanes | Refuel, shop and attendant work |
| ACC-242 | **Mechanic and vulcanizer workshops** · Mapped or surveyed sites | P1 | Actual yard, tools, bays and roadside position | Vehicle repair and mechanic profession |
| ACC-243 | **Car washes and dealerships** · Mapped sites | P2 | Real wash bays, showrooms and vehicle parking | Wash, service and buy vehicles |
| ACC-244 | **Barbers and hair salons** · Mapped sites | P1 | Shop-specific mirrors, chairs and frontage | Haircuts and barber jobs |
| ACC-245 | **Tailors and clothing shops** · Mapped sites | P1 | Sewing workstations, fabrics and real storefronts | Tailoring, clothing purchases and work |
| ACC-246 | **Carpentry and furniture workshops** · Mapped sites | P2 | Work areas, displays and workshop structure | Furniture production and home purchases |
| ACC-247 | **Internet cafes and coding offices** · Verified sites | P1 | Computers, desks, power and shop or office layout | Coding tasks, computer lessons and work |
| ACC-248 | **Cold stores and provision shops** · Mapped sites | P2 | Freezers, counters, shelves and shopfronts | Groceries and retail jobs |
| ACC-249 | **Hardware and building-material shops** · Mapped sites | P2 | Displays, loading areas and storefronts | Supplies and construction jobs |
| ACC-250 | **Laundries and dry cleaners** · Mapped sites | P2 | Counter, washing equipment and collection area | Laundry services and work |
| ACC-251 | **Photo studios and print shops** · Mapped sites | P2 | Backdrop, cameras, printers and customer area | Photography and printing professions |
| ACC-252 | **Warehouses and light industry** · North Industrial Area and other sites | P2 | Verified roofs, yards, loading docks and access roads | Logistics and manufacturing jobs |
| ACC-253 | **Cemeteries and memorial grounds** · Verified sites | P3 | Site-specific paths, walls and planting | Respectful memorial visits |
| ACC-254 | **Waste collection and recycling sites** · Verified current sites | P3 | Correct footprint and current activity | Sanitation and recycling professions |

## Humans and character animation

The current simple character must be replaced by a skinned, articulated human model. Adding face textures to the existing thin body will not solve its proportions or motion.

| Component | Required result | Acceptance check |
|---|---|---|
| Body proportions | Believable head, neck, shoulders, torso, pelvis, limbs, hands and feet; varied height and build | Compare person, doorway, seat and vehicle at the same metre scale |
| Faces | Recognisable facial structure, eyes, eyelids, lips, ears, expressions and natural blinking | Face reads well at conversational distance in daylight and shade |
| Skin | Varied Ghanaian and other skin tones with physically plausible materials | No grey cast, plastic shine or crushed dark skin under changing light |
| Hair | Multiple believable haircuts, braids, natural hair and facial hair | Good silhouette without flicker or excessive mobile transparency cost |
| Clothing | Contemporary everyday wear, office wear, uniforms, sportswear, traditional dress and footwear | Clothing follows the body and does not clip during sitting and dancing |
| Rig | Skeleton for shoulders, spine, hips, elbows, knees, hands and feet | Natural joint bending and stable retargeting of animations |
| Locomotion | Idle, walking, running, acceleration, braking, turning, stairs and slopes | Foot contact matches travel speed; no moonwalking or abrupt pose switches |
| Sitting | Approach chair, turn, sit, rest, converse and stand | Remain seated until player stops; hips and feet align with the chair |
| Sleeping | Approach bed, lie down, breathe, wake and stand | Remain asleep until the player wakes; persist state safely across reconnects |
| Dancing | Several looping dances with transitions and nearby-person avoidance | Dance until stopped; blend smoothly into walking |
| Showering | Enter shower, suitable covered presentation, wash and exit | Stay in the activity until stopped; water and sound end correctly |
| Eating and drinking | Seated and standing animations using cups, plates and hands | Props attach to the correct hand and do not float |
| Work | Driving, typing, teaching, cashier work, serving, repair and carrying goods | Hands and gaze reach the relevant tool or workstation |
| Vehicles | Open door, enter, sit, steer, look around, exit | Driver and passengers fit the cabin; doors and limbs avoid obvious clipping |
| Social interaction | Look toward speaker, greet, wave, converse and use phone | Handles stay readable and profile/chat targets are selectable |
| NPC routines | Travel to work, shop, queue, wait, eat and return home | Pedestrians choose pavements and crossings; they avoid roads and occupied seats |
| Multiplayer | Replicate action state, target furniture and animation phase | Other players see the same sitting/sleeping/dancing state without snapping |
| Diversity | Distinct people through body, face, hair, clothing and animation variation | Crowds do not look like identical copies in different shirt colours |
| Accessibility | Readable captions, adjustable sound, comfortable camera and reduced shake | Actions remain understandable without audio or motion effects |

**Suggested first character milestone:** one high-quality adult avatar with idle/run/walk/sit/sleep/dance/shower/drive animations and three clothing variations. Validate it in a home, on a pavement and in a tro-tro before extending the crowd library. Use licensed rigged models and animation assets; do not promise photorealism from a few extra primitive shapes.

## Vehicles and traffic

Create distinct, proportionally correct assets for sedan taxis, tro-tro minibuses, private hatchbacks/sedans/SUVs, pickups, delivery vans, large buses, motorcycles, bicycles, trucks, ambulances, fire engines and police vehicles. Aircraft and boats belong to the transport expansion after the street vehicles work well.

- Match local vehicle references: paint schemes, body panels, windscreens, wheel sizes, lights, number-plate format, mirrors and appropriate wear. Different bodies are needed, not just different colours on one box.
- Model cabins with seats, driver position, dashboard, windows and door openings. Outside view is the default public-transport view; interior/window views remain selectable.
- Use suspension, wheel rotation, steering, braking and weighted collision response. Vehicles should not overlap, permanently lock together or fly away from tiny impacts.
- Follow road geometry, driving direction, lane changes, merges, queues and traffic lights. Interchange decks need elevation-aware routing; one crossing on the map is not always a junction.
- Put stops, parking and traffic furniture at verified locations. Deduplicate signals by real junction and approach; avoid rows of arbitrary signal poles.
- Maintain fast-forward and skip-arrival options without teleporting into another car or a building. Resolve arrivals to safe pickup/drop-off locations.

## Shared city environment

| System | Accra-specific work |
|---|---|
| Surfaces | Record paved and unpaved parcels individually; layered asphalt, concrete, paving stones, soil, sand and vegetation |
| Roofs | Reference-specific corrugated metal, hipped roofs, concrete slabs, roof tanks and drainage; no identical roof on every building |
| Facades | Plaster, paint, exposed blockwork, masonry, metal, glass and weathering appropriate to the actual building |
| Street edges | Actual footpaths, gutters, open or covered drains, kerbs, walls, utility poles and crossings |
| Landscape | Correct coastal/urban planting and trees in observed locations; avoid random palm trees inside roads or buildings |
| Coast and water | Shoreline, wave direction, foam, beaches, lagoon/drainage edges and water levels supported by references |
| Atmosphere | Clear daylight, overcast, rain, dusk and night; distance haze without hiding the whole scene |
| Lighting | Sun direction, readable skin and facades, interior lighting, headlights and justified street lighting |
| Signs and businesses | Correct place names, current verified logos and real storefront placement; track asset permission separately |
| Street furniture | Verified kiosks, shelters, benches, bins, bus stops and utility structures; no randomly scattered food stalls |
| Sound | Traffic, engines, surf, market activity, interiors and original or licensed music; spatial attenuation and mute controls |
| Camera | Stable third-person framing with horizon and surroundings visible, first-person option, obstacle avoidance and smooth transitions |
| Navigation | Clear map icons, neighborhood/place identity, entrance markers and routes appropriate to the transport mode |
| World state | No spontaneous reset, random relocation, lost job progress or repeated initial spawn during streaming/reconnect |

## Venue experiences that must differ

- **Church:** actual nave/auditorium design, pews or chairs, altar/stage, congregation and staff; original contextual teaching and music. Match the denomination and location rather than using one service everywhere.
- **Mosque:** appropriate prayer hall, entrance/footwear handling, ablution area where referenced, prayer and community teaching. Use respectful contextual animation and reviewed audio.
- **School or university:** classrooms, lecture halls, laboratories and library spaces; teachers, students, lessons and practical work.
- **Market:** lane-specific stalls, different merchandise, seller/customer exchanges, bargaining and carrying goods. Preserve clear pedestrian routes.
- **Mall:** continuous concourse connecting different shopfronts, groceries, food court and cinema; real transitions between public and shop spaces.
- **Stadium:** public entrance → concourse → stand seat → view of pitch; match activity, crowd reaction and separate player/staff access.
- **Restaurant:** entrance, host or counter, seat, order, prepared meal, payment and exit; kitchen/service work when employed.
- **Hotel:** reception, booking, room, bed/bathroom, dining and any referenced leisure facilities; distinct room categories.
- **Nightclub:** dance floor, bar, booth/stage and seating with spatial music and dancing NPCs; no classroom-like interior.
- **Home:** persistent personal furniture, bed, seating, cooking and washing; sleep/sit remain active until stopped.
- **Bank or office:** customer/public lobby separated from staff workspace; profession-specific tasks and game currency.
- **Beach or park:** open landscape, walking, seating, recreation and social activity appropriate to the actual site.

For private residences, Jubilee House and military sites, use public exterior references and clearly authored game interiors where needed. Do not present an invented interior as the real building's plan. Public visibility does not imply unrestricted entry in the game.

## Per-location production card

Copy this card for each address before modelling:

- **Name and work item:**
- **Neighborhood and coordinates:**
- **OSM feature IDs and boundary:**
- **Current name and use checked on:**
- **Reference URLs and photo dates:**
- **Image/model/texture rights:**
- **Five features that make it recognisable:**
- **Measured or estimated dimensions and confidence:**
- **Roof and facade materials:**
- **Pavement, soil, grass, water and drainage:**
- **Entrances, drop-off and pedestrian route:**
- **Interior spaces supported by references:**
- **Authored interior spaces:**
- **Staff, visitors, schedules and ambient sound:**
- **Visitor, work, shopping and social activities:**
- **Colliders and navigation mesh:**
- **Near, medium and distant models:**
- **Phone and desktop performance capture:**
- **Day, night, street-level and overhead screenshots:**
- **Reference comparison and local reviewer feedback:**
- **Status:** Research → reference approval → exterior → interior → interaction → performance → acceptance.

## Definition of finished

A place is finished only when:

- A person familiar with Accra can identify it without relying on its floating label.
- Its footprint, scale, roof, entrances and surroundings match the selected reference date.
- A complete visit works from arrival through an activity to departure.
- Appropriate people use the space, furniture and routes naturally.
- Sitting, sleeping and other sustained actions remain stable until stopped.
- Collision, doors, stairs, vehicles and camera transitions do not trap the player.
- Other players see the correct location, pose and actions.
- The scene streams without resets, missing foreground geometry or major frame stalls.
- Mobile portrait, mobile landscape and desktop controls leave the scene usable.
- Reference screenshots and performance results are attached to the completed work item.

Suggested performance targets, to measure on named test devices: stable 30 fps on the agreed mid-range phone and 60 fps on the agreed desktop at their documented graphics settings. Treat these as acceptance targets, not current performance claims. Lower distant detail before degrading close-up human faces or the defining landmark silhouette.

## Reference sources and current-name checks

These sources seed reference packs; they do not verify every row above or license copying their images as game textures.

- [Ghana Tourism Authority on Independence Square](https://visitghana.com/independence-square/): distinguishes the square, Independence Arch and Black Star Gate; use separate models and correctly positioned components.
- [Ghana Tourism Authority Greater Accra overview](https://visitghana.com/greater-accra-region/): heritage, markets, coast and regional context.
- [Accra Mall official description](https://www.accramall.com/accra-mall-about): enclosed retail centre with cinema and restaurants; validate current shop tenants individually.
- [University of Ghana academic facilities](https://www.ug.edu.gh/aad/resources/academic-facilities): different academic spaces, including lecture facilities, libraries and laboratories.
- [Bank of Ghana Bank Square notice](https://www.bog.gov.gh/news/notice-on-the-relocation-of-the-banking-department-to-the-bank-square/): current Bank Square address; keep it separate from historic bank premises.
- [Ghana Airports Company airport page](https://www.gacl.com.gh/accra-international-airport/): current page calls it Accra International Airport; verify current signage and preserve Kotoka as a search alias where useful.
- [Bistro 22 official site](https://www.bistro-22.com/): photographic and descriptive references for indoor dining, terrace and bar.
- [Ghana Armed Forces public El-Wak relocation notice](https://gafonline.mil.gh/blog-details/gaf-relocates-troops-from-el-wak-barracks): current changes mean older barracks images should not be assumed current.
- [Project map extraction notes](../../scripts/maps/README.md): geographic bounds and map-data limitations.
- [OpenStreetMap attribution and licence](https://www.openstreetmap.org/copyright): retain attribution and review obligations for distributed derived map data.

Google Maps/Earth and street photographs may be used to compare appearance where permitted. Building a reference-based model is distinct from extracting or redistributing another provider's imagery or 3D meshes. Store original authored assets or assets with usable licences.

## Bundled place inventory by category

Each record is included in mapped-places.csv. Preserve distinct branches and nearby same-name sites. Flag duplicates for review rather than deleting all repeated names. The “place of worship” category does not distinguish churches from mosques in this simplified index; recover religion and denomination tags or inspect references before assignment. Residences and offices are especially incomplete in a POI index: enumerate building footprints and parcels district by district as well.

| Map category | Records |
|---|---:|
| place of worship | 1,033 |
| school | 899 |
| bank | 636 |
| fuel | 608 |
| restaurant | 528 |
| pharmacy | 523 |
| fast food | 456 |
| hotel | 410 |
| hairdresser | 405 |
| kiosk | 365 |
| clothes | 269 |
| beauty | 242 |
| pub | 223 |
| convenience | 210 |
| bar | 208 |
| suburb | 207 |
| tailor | 207 |
| atm | 203 |
| copyshop | 189 |
| electronics | 183 |
| supermarket | 132 |
| hospital | 130 |
| clinic | 126 |
| hardware | 125 |
| guest house | 116 |
| village | 103 |
| bus station | 98 |
| police | 96 |
| pitch | 96 |
| kindergarten | 95 |
| mobile money agent | 88 |
| neighbourhood | 87 |
| chemist | 82 |
| bureau de change | 81 |
| butcher | 80 |
| post office | 75 |
| cafe | 65 |
| hostel | 64 |
| furniture | 63 |
| car | 59 |
| mobile phone | 58 |
| laundry | 56 |
| boutique | 54 |
| computer | 53 |
| college | 52 |
| studio | 51 |
| apartment | 51 |
| books | 50 |
| car repair | 48 |
| marketplace | 47 |
| cosmetics | 47 |
| car wash | 46 |
| recycling | 42 |
| doctors | 40 |
| university | 39 |
| park | 37 |
| bakery | 36 |
| taxi | 34 |
| car parts | 34 |
| parking | 33 |
| town | 30 |
| bookmaker | 30 |
| attraction | 29 |
| greengrocer | 29 |
| telecommunication | 27 |
| internet cafe | 26 |
| mall | 26 |
| jewelry | 26 |
| toilets | 24 |
| stationery | 23 |
| yes | 23 |
| nightclub | 22 |
| ice cream | 21 |
| shoes | 21 |
| fitness centre | 20 |
| library | 20 |
| driving school | 20 |
| events venue | 20 |
| dentist | 19 |
| photo | 18 |
| paint | 18 |
| gift | 17 |
| department store | 17 |
| beverages | 17 |
| beach resort | 16 |
| electrical | 16 |
| lottery | 16 |
| sports centre | 15 |
| tyres | 15 |
| food court | 15 |
| pastry | 15 |
| fire station | 14 |
| community centre | 14 |
| casino | 13 |
| fabric | 11 |
| golf course | 11 |
| courthouse | 11 |
| stadium | 11 |
| playground | 11 |
| money transfer | 11 |
| baby goods | 11 |
| travel agency | 11 |
| bed | 11 |
| interior decoration | 11 |
| artwork | 10 |
| alcohol | 9 |
| art | 9 |
| houseware | 9 |
| optician | 9 |
| social centre | 9 |
| gambling | 9 |
| dry cleaning | 8 |
| veterinary | 8 |
| museum | 8 |
| cinema | 8 |
| payment centre | 8 |
| fountain | 8 |
| craft | 8 |
| sports | 7 |
| perfumery | 7 |
| pet | 7 |
| rental | 7 |
| wine | 7 |
| polling station | 7 |
| fixme | 7 |
| hamlet | 6 |
| quarter | 6 |
| variety store | 6 |
| florist | 6 |
| car rental | 6 |
| wholesale | 6 |
| toys | 5 |
| farm | 5 |
| garden centre | 5 |
| massage | 5 |
| childcare | 5 |
| water | 5 |
| agrarian | 5 |
| gas | 5 |
| waste disposal | 5 |
| locality | 4 |
| sanitary dump station | 4 |
| bag | 4 |
| trade | 4 |
| funeral directors | 4 |
| coffee | 4 |
| coworking space | 4 |
| kitchen | 4 |
| training | 4 |
| herbalist | 4 |
| music | 4 |
| water point | 4 |
| prep school | 4 |
| allotments | 4 |
| hifi | 4 |
| doors | 4 |
| fashion accessories | 4 |
| conference centre | 4 |
| swimming pool | 4 |
| theatre | 3 |
| bicycle | 3 |
| social facility | 3 |
| locksmith | 3 |
| curtain | 3 |
| video | 3 |
| pawnbroker | 3 |
| general | 3 |
| shelter | 3 |
| printer ink | 3 |
| parking space | 3 |
| compressed air | 3 |
| wigs | 3 |
| city | 2 |
| arts centre | 2 |
| chalet | 2 |
| planetarium | 2 |
| confectionery | 2 |
| doityourself | 2 |
| antiques | 2 |
| ticket | 2 |
| convenience;supermarket | 2 |
| musical instrument | 2 |
| mortuary | 2 |
| frozen food | 2 |
| music school | 2 |
| drinking water | 2 |
| motorcycle | 2 |
| photo studio | 2 |
| food | 2 |
| townhall | 2 |
| medical supply | 2 |
| garden | 2 |
| car sharing | 2 |
| grocery | 2 |
| prison | 2 |
| vehicle inspection | 2 |
| post box | 1 |
| military | 1 |
| miniature golf | 1 |
| state | 1 |
| resort | 1 |
| biergarten | 1 |
| information | 1 |
| outdoor | 1 |
| gallery | 1 |
| bathroom furniture | 1 |
| Diagnostic Centre | 1 |
| frame | 1 |
| industrial | 1 |
| microfinance | 1 |
| cosmetics;gift | 1 |
| party | 1 |
| sewing | 1 |
| tattoo | 1 |
| hvac | 1 |
| appliance | 1 |
| public bookcase | 1 |
| health food | 1 |
| dairy | 1 |
| camera | 1 |
| chocolate | 1 |
| charity | 1 |
| video games | 1 |
| games | 1 |
| radiotechnics | 1 |
| watches | 1 |
| animal shelter | 1 |
| language school | 1 |
| glaziery | 1 |
| lighting | 1 |
| candles | 1 |
| aquarium | 1 |
| research institute | 1 |
| household appliances, furniture | 1 |
| tobacco | 1 |
| repair | 1 |
| bowling alley | 1 |
| marina | 1 |
| common | 1 |
| zoo | 1 |
| theme park | 1 |
| track | 1 |
| seafood | 1 |
| animal breeding | 1 |
| newsagent | 1 |
| public bath | 1 |
