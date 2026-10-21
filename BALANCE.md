# Game balance — build 0.21.0

Default party; real Auto combat; loot-first exploration; complete route objectives and accept the first two shrine beacons encountered; camp below 70% HP; first offered boon; varied councils; varied companion vows with ready rewards claimed at waystations; no shop purchases.

Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.

| Oath | Wins / runs | Win rate | 95% interval | Mean depth |
| --- | --- | --- | --- | --- |
| wanderer | 29 / 32 | 90.6% | 75.8%–96.8% | 6.00 |
| delver | 20 / 32 | 62.5% | 45.3%–77.1% | 5.53 |
| ironbound | 18 / 32 | 56.3% | 39.3%–71.8% | 5.00 |

| Route | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| 0 | 8/8 | 5/8 | 3/8 |
| 1 | 6/8 | 5/8 | 5/8 |
| 2 | 8/8 | 3/8 | 5/8 |
| 3 | 7/8 | 7/8 | 5/8 |

Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.

Checks: PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.

Per-floor defeats, guardian pressure, and full seeded run records are in report.json.

## Six-slot interpretation

The 96-run loot-first/no-shopping policy, DIFFICULTY constants and broad canary thresholds are unchanged. Auto Gear now allocates six slots and accounts for occupied hands. Weapon/armour costs retain full encounter value; auxiliaries contribute 25% of cost, capped 40 per hero (maximum 160/company). The new slots therefore contribute at most 19.2 encounter-budget points before oath multiplication, rather than their full purchase prices. Added ground items alter layouts/RNG draw sequences; these are not paired battles or a controlled item ablation. Guardian templates and retinues were not tuned.

Previous 0.20.0 outcomes were 25/32 Wanderer, 14/32 Delver and 13/32 Ironbound. Current 0.21.0 outcomes: wanderer 29/32, delver 20/32, ironbound 18/32. These are deterministic Auto diagnostics, not human win rates. Do not attribute the change to a single piece of gear.

## Availability, discovery and actual equipment

All 32 generated six-chapter routes (192 floors) offer the existing four guarded class relics and two rare-cache trade finds. GEAR-08 additionally checks all six new head/feet/accessory relics on every route, and all six ordinary additions in shop stock. Opening ground loot includes a shield and helm. Head relics occur in Catacombs, footwear in Descent, accessories in Sunless Tomb. Existing saved floors are not retrofitted. No new map, encounter or story reward is introduced.

| Addition | Discovered in 96 loot-first runs | Discovered in 8 treasure-directed runs |
| --- | --- | --- |
| bellheart_aegis | 79/96 | 8/8 |
| ashen_covenant | 68/96 | 8/8 |
| mercy_reliquary | 47/96 | 8/8 |
| nightwarden_bow | 49/96 | 8/8 |
| pilgrim_boots | 96/96 | 8/8 |
| ward_charm | 47/96 | 8/8 |
| pilgrim_mace | 91/96 | 8/8 |
| scout_bow | 47/96 | 8/8 |
| smoke_phial | 95/96 | 8/8 |
| dawn_salt | 91/96 | 8/8 |
| dawn_seal | 0/96 | 8/8 |
| royal_astrolabe | 0/96 | 8/8 |
| round_shield | 96/96 | 8/8 |
| ember_focus | 0/96 | 8/8 |
| iron_helm | 95/96 | 8/8 |
| sage_circlet | 0/96 | 8/8 |
| trail_boots | 0/96 | 8/8 |
| copper_ring | 0/96 | 8/8 |
| dawnwarden_helm | 91/96 | 8/8 |
| starseer_circlet | 91/96 | 8/8 |
| ashwalker_boots | 85/96 | 8/8 |
| windstep_boots | 85/96 | 8/8 |
| oathkeeper_ring | 74/96 | 8/8 |
| moonwell_pendant | 74/96 | 8/8 |

Treasure-directed policy deliberately seeks hidden caches, prize guards and item loot before stairs, and buys unseen ordinary additions when affordable. The planner reads map metadata. Outcomes: 7 wins/1 defeats, no stalls. All 24 recent additions were acquired in all 8 companies, including all six new relics. This is a separate integration sample; no shopping or privileged cache seeking was added to the 96-run difficulty sample.

Companion-directed policy: 8 wins/0 defeats, no stalls. Each of the eight vow plans was fulfilled four times.

## Explicit tradeoffs

- Bellheart moves from armour to off-hand and drops AC 3→1. Weapon ward remains 1, movement−1. Boots can cancel its movement cost; a bow/axe/staff cannot share its hand.
- Road Boots move to feet. Charm moves to accessory and loses AC. Armour stats remain intact. AuxiliaryAC≤1 and movement gear totals−1…+1.
- Each weapon/spell/terrain/control ward and healing bonus uses the strongest equipped source. Aegis+Signet is still one-point weapon protection; Starweave+Helm still+2 control; Eclipsescale+Rainward still 2 spell protection; Returning Dawn+Moonwell still+2 healing.
- Head relics trade stronger control protection against mixed spell/control wards. Footwear trades ember protection against movement/control. Accessories trade weapon ward, spell ward and healing/control. No set bonus or mandatory relic is introduced.
- Auto Gear is a bounded per-slot recommendation with hand opportunity costs, not a global six-slot optimum. It preserves physical copies/classes and cannot replace manual tactical choices. Some wards overlap.

### Final treasure-directed equipment

| Class | Weapon choices | Off-hand choices | Head choices | Feet choices | Accessory choices |
| --- | --- | --- | --- | --- | --- |
| Fighter | dawnblade, fine_sword | bellheart_aegis | dawnwarden_helm, iron_helm | pilgrim_boots | oathkeeper_ring, ward_charm |
| Cleric | sunshard | round_shield | dawnwarden_helm, sage_circlet | trail_boots | moonwell_pendant |
| Thief | nightwarden_bow | empty | iron_helm, starseer_circlet | ashwalker_boots, windstep_boots | copper_ring, oathkeeper_ring |
| Mage | nightglass | ember_focus | sage_circlet, starseer_circlet | ashwalker_boots, windstep_boots | copper_ring, ward_charm |

## Guardian pressure and verification limits

All 288 isolated guardian probes terminate. Wanderer/Delver/Ironbound victories out of24 per guardian: Bell Warden 24/13/5; Ash Cantor 20/0/0; Crypt Lord 5/1/1; Observatory 24/24/24. These use prepared squads and prescribed target priorities; they are not full campaigns, human difficulty estimates or a controlled gear comparison. Seed consumption from initial generation changes probe sequences. Harder-oath Cantor pressure remains high.

Local acceptance: 114 existing regressions+12 treasure checks+8 loadout checks (134 total), four sprite/art checks, four policy checks, 192-floor availability audit, 288 guardian probes and all 18 Chromium browser suites. New browser flow covers six-slot keyboard/touch use, 44px controls, hand conflicts, portable migration and Continue at 440×780,956×350,820×1180 and1366×768. Exact-head Chromium/Firefox/WebKit job conclusions, uploaded artifacts, merged blob equality, Pages and live checks are recorded in the release PR.

Runtime 438,595 bytes (428.3 KiB), +13,215 bytes over 0.20.0. The 350 KiB target remains soft; there is no new runtime dependency. Overall grade remains B+. Physical Safari, broad human playtests and representative human campaign win rates remain unverified.
