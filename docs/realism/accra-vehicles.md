# Accra vehicle reference and implementation pass

Updated 13 October 2026.

The fleet now has twelve distinguishable ground-vehicle families. These are original, lightweight procedural models informed by photographs and manufacturer material; they are **not licensed replicas, scans or a complete inventory of every make on Accra's roads**. Source photographs are reference links, not game textures. Vehicle names, prices and number plates in the game are fictional.

## Reference register

| Family | Reference | Details carried into the model |
|---|---|---|
| Taxi | [Accra Corolla taxi photograph](https://gh.zimcompass.com/product?id=168841) | Silver sedan body, orange front/rear wing panels, compact roof sign, separate bonnet/cabin/boot and window trim |
| Commuter tro-tro | [Toyota at Accra Central, sliding door open](https://accratrotro.com/trotro-bus-door-opened/), [Ghana commercial vehicle study](https://link.springer.com/article/10.1007/s44327-025-00081-3) | Cab-forward minibus proportions, continuous dark windows, yellow waist stripe, passenger sliding door rail and step, seat rows and rear doors |
| Larger public bus | [Toyota Ghana Coaster](https://gh.toyotacfao.com/en/range/toyota-ghana/coaster), [Accra terminal photographs](https://accratrotro.com/category/pictures-of-trotro-buses/) | Taller passenger shell, larger wheels, repeated window bays, visible seats, destination panel, mirrors and twin wipers |
| Sedan, hatchback, SUV | [Toyota Ghana range](https://gh.toyotacfao.com/en/range/toyota-ghana), [Corolla](https://gh.toyotacfao.com/en/range/toyota-ghana/corolla-Sedan), [RAV4](https://gh.toyotacfao.com/en/range/toyota-ghana/rav4) | Different wheelbases, widths, roof heights and rear profiles, crowned bonnets, tapered glazing and family-specific front grilles; representative shapes rather than exact current models |
| Pickup | [Toyota Ghana Hilux](https://gh.toyotacfao.com/en/range/toyota-ghana/hilux) | Raised double cab, rear seat, open ribbed load bed, separate bed sides and tailgate |
| Delivery van | [Toyota Ghana Hiace](https://gh.toyotacfao.com/en/range/toyota-ghana/Hiace-GD) | Long cargo body, taller roof, solid rear cargo panels and sliding-door seam; model remains an approximate delivery-van family |
| Truck | [Toyota Ghana's Hino listing](https://www.toyotaghana.com/sales/vehicle/HILUX/vehicle/HILUX/), [manufacturer Hino 300 specification/reference sheet](https://www.toyotazambia.co.zm/hino/brochureHino300.pdf) | Cab-over proportions, separate cargo body/chassis, six wheels including rear duals, steps, mirrors, cargo-door bars and marker lamps. The regional manufacturer sheet supplements Ghana distribution evidence; it is not an Accra street photograph |
| Motorcycle | [Ofoe Amegavie's Accra motorcycle photo essay](https://www.thefader.com/2019/09/18/12-oclock-in-accra-ghana-bikes-photo-essay) | Visible frame, fork, separate tank/seat, engine fins, exhaust, suspension, mirrors, lamps and posed rider. The commuter model is an interpretation; the essay also includes dirt bikes not yet separately modelled |
| Bicycle | [WHO Accra Urban Health Initiative photographs](https://www.who.int/news-room/facts-in-pictures/detail/urban-health-initiative-accra-story) | Diamond frame, narrow tyres, open spoked wheels, saddle, chain run, pedals and alternating pedalling pose |
| Aboboyaa | [UNEP's North Industrial Area scrap transport photograph](https://www.unep.org/switchafricagreen/news-and-stories/beneficiaries-story/scrap-metal-dealer-develops-sustainable-e-waste-management) | Motorcycle front, two rear wheels, blue open pressed-steel cargo bed, raised rails and rear panel |

## What is integrated

- One factory supplies local/player-owned, ambient and remote-player 3D vehicles.
- Tro-tros, trucks, bicycles and cargo tricycles appear in the existing shop with virtual prices. Existing server purchase/ownership validation still applies.
- Ambient selection avoids heavy vehicles on narrow roads and bicycles/cargo tricycles on highways, including at subsequent junctions.
- Shared dimensions feed both movable-object collision solvers and wall sampling; long vehicles test their whole length. Truck following clearance accounts for length. Bicycles have a sensible pedal-speed cap and no engine audio.
- Independently rolling and steering wheels use two instanced draws per vehicle. Wheel geometry and sign textures are cached. Lamps react to night and braking.
- 2D vehicle footprints reflect each family's size. No map data, API credentials or external image services were added.

## Acceptance and remaining work

Use `tests/fixtures/vehicle-review.html` through a local static review server. It contains commuter, private, commercial and cycle groups, steering, rolling, braking and night controls. This fixture is not part of the published app.

Focused tests cover all twelve factories, finite geometry, wheel counts, render budgets, purchase catalogue entries, road eligibility, matching collision dimensions, long-vehicle wall stopping/reversing, minibus windows, and silent bicycle audio.

These assets remain stylized browser-game models. Further realism needs higher-detail authored body panels, varied real fleet liveries, suspension travel, articulated door operation, accurately fitted rider/driver IK, projected headlight beams and wider mobile performance testing. Aircraft, articulated lorries, tankers, refuse trucks, ambulances and dirt-bike variants remain outside this ground-fleet pass. The reference list is not a claim to have surveyed every vehicle in Accra.
