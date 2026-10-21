# Game balance — build 0.16.0

Default party; real Auto combat; loot-first exploration; complete route objectives and accept the first two shrine beacons encountered; camp below 70% HP; first offered boon; varied councils; no shop purchases.

Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.

| Oath | Wins / runs | Win rate | 95% interval | Mean depth |
| --- | --- | --- | --- | --- |
| wanderer | 25 / 32 | 78.1% | 61.2%–89.0% | 6.00 |
| delver | 20 / 32 | 62.5% | 45.3%–77.1% | 5.81 |
| ironbound | 13 / 32 | 40.6% | 25.5%–57.7% | 5.41 |

| Route | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| 0 | 6/8 | 5/8 | 5/8 |
| 1 | 8/8 | 6/8 | 4/8 |
| 2 | 5/8 | 4/8 | 2/8 |
| 3 | 6/8 | 5/8 | 2/8 |

Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.

Checks: PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.

Per-floor defeats, guardian pressure, and full seeded run records are in report.json.

## Guardian pressure

| Guardian | Oath | Wins / attempts | Mean rounds | Mean party HP remaining |
| --- | --- | --- | --- | --- |
| BellWarden | wanderer | 32/32 | 5.2 | 92.0% |
| BellWarden | delver | 32/32 | 7.8 | 79.0% |
| BellWarden | ironbound | 31/31 | 9.6 | 68.3% |
| AshCantor | wanderer | 32/32 | 6.5 | 88.2% |
| AshCantor | delver | 27/31 | 11.6 | 45.7% |
| AshCantor | ironbound | 17/29 | 12.3 | 28.4% |
| CryptLord | wanderer | 25/32 | 11.6 | 48.4% |
| CryptLord | delver | 20/27 | 12.5 | 42.9% |
| CryptLord | ironbound | 13/17 | 13.8 | 35.8% |

## Enemy-ecology interpretation

The 0.15.0 baseline was 24/32 Wanderer, 24/32 Delver and 7/32 Ironbound. Six new ordinary enemy roles now enter staged chapter pools with explicit threat costs. Existing difficulty formulas, eight-enemy cap, elite rules, guardian retinues, opening floor and canary thresholds are unchanged. Earlier encounters change RNG paths and progression, so these outcomes do not isolate a particular new mechanic or estimate human difficulty.

Every run terminates, every Wanderer route has a sampled victory, and successful fresh campaigns retain both route objectives, five councils and a valid crown fate. Human pacing, bestiary use and counterplay need observed full runs; physical Safari remains unverified.

## Isolated guardian scenarios

All 288 probes terminate with outcomes unchanged from 0.15.0. Bell Warden wins: Wanderer24/24, Delver11/24, Ironbound2/24; Ash Cantor21/24,3/24,0/24; Sunless King5/24,0/24,0/24; Astrax24/24 on each oath. These are isolated fixture/Auto checks, not acquisition evidence or a hard optional-hunt claim. CI uploads complete seeded records separately from the source tree.
