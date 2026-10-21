# Game balance — build 0.19.0

0.19.0 changes sprite grids/palette and the build label only. All remaining runtime source is byte-for-byte identical to 0.18.0. The exact-head release gate reruns the same campaign policies and canaries; final results and publication evidence are recorded in the release PR.

Default party; real Auto combat; loot-first exploration; complete route objectives and accept the first two shrine beacons encountered; camp below 70% HP; first offered boon; varied councils; varied companion vows with ready rewards claimed at waystations; no shop purchases.

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

## Companion participation in the loot-first canary

| Class | Pledged | Fulfilled |
| --- | --- | --- |
| Fighter | 3 | 93 |
| Thief | 76 | 20 |
| Cleric | 48 | 47 |
| Mage | 16 | 76 |

All 58 winning companies started four vows and fulfilled Fighter/Mage. Many event/cache vows stay unfinished under loot-first exploration; taking a promise is not equivalent to pursuing it. This canary retains its exploration/rest/shopping policy and unchanged balance thresholds, with varied vow choices and ready claims added. Outcome totals happen to match 0.17.0 (25/32,20/32,13/32), but the policy now includes rewards, so it is not a controlled no-vow comparison or a human win-rate estimate.

## Quest-directed integration sample

Eight additional Wanderer campaigns prioritize encounters, events and cache approaches needed for pledged vows before loot/stairs. This planner reads map metadata and deliberately revisits cache approaches for discovery; it is privileged scripted exploration, not a model of human behavior. Both seeds and all four routes are covered. Each of the eight plans was fulfilled four times, and all eight companies fulfilled all four vows before the final battle. All route objectives/councils/fate checks still apply to victories.

Outcomes: 6 victories, 2 defeats, zero stalls. This is a separate integration sample, not an extension of the 96-run difficulty canary. Complete records are in the CI companions artifact.

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

All 288 isolated guardian probes terminate with unchanged outcomes. These fixtures do not model quest acquisition or human play. Physical Safari and human campaign pacing remain unverified.
