# Game balance — build 0.12.0

Default party; real Auto combat; loot-first exploration; complete route objectives and accept the first two shrine beacons encountered; camp below 70% HP; first offered boon; varied councils; no shop purchases.

Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.

| Oath | Wins / runs | Win rate | 95% interval | Mean depth |
| --- | --- | --- | --- | --- |
| wanderer | 26 / 32 | 81.3% | 64.7%–91.1% | 6.00 |
| delver | 18 / 32 | 56.3% | 39.3%–71.8% | 5.53 |
| ironbound | 7 / 32 | 21.9% | 11.0%–38.8% | 4.50 |

| Route | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| 0 | 4/8 | 4/8 | 1/8 |
| 1 | 8/8 | 6/8 | 2/8 |
| 2 | 8/8 | 3/8 | 3/8 |
| 3 | 6/8 | 5/8 | 1/8 |

Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.

Checks: PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.

Per-floor defeats, guardian pressure, and full seeded run records are in report.json.


## Guardian pressure

| Guardian | Oath | Wins / attempts | Mean rounds | Mean party HP remaining |
| --- | --- | --- | --- | --- |
| BellWarden | wanderer | 32/32 | 5.2 | 90.2% |
| BellWarden | delver | 30/31 | 7.9 | 72.8% |
| BellWarden | ironbound | 21/28 | 10.3 | 45.2% |
| AshCantor | wanderer | 32/32 | 6.8 | 74.1% |
| AshCantor | delver | 23/28 | 11.4 | 39.4% |
| AshCantor | ironbound | 11/18 | 11.7 | 25.7% |
| CryptLord | wanderer | 26/32 | 12.9 | 44.5% |
| CryptLord | delver | 18/23 | 12.5 | 42.9% |
| CryptLord | ironbound | 7/11 | 10.9 | 42.9% |

## Route objectives and interpretation

The policy follows real movement to complete two distinct route objectives before its ending. It reads Gallery names in order, escorts scouts/returns Dawnblade to camp, and commits to the first two shrine beacons it enters while following loot/objective paths. All victorious fresh runs completed both objectives and all five councils. No reward or goal is bypassed by the runner. Shrine choice differs from choosing a council or claiming a boon.

This run is not a paired combat-tuning experiment against 0.11.0: new travel and bounded shrine benefits alter later actions and RNG consumption. No monster stats, guardian multipliers, oath settings or balance thresholds changed. The 0.11.0 snapshot was 24/32 Wanderer, 17/32 Delver and 8/32 Ironbound; interpretation must account for the new play policy.

Optional hunts are excluded from the main policy. Existing separate 72 prepared level-three/four hunt probes across all oaths remain a smoke check, not a claim of human difficulty.

## Reproduce and limits

Serve the repo and run `node tests/balance.cjs` for 96 runs. `BALANCE_SAMPLES=12` expands the sample; `BALANCE_OUTPUT` selects the report directory. Seeds: `2718 + route + sample × 10000`. The JSON includes route, outcome, fight records, task count, council count and ending; CI uploads it even on failure.

These deterministic Auto results do not estimate human win rates. Every Wanderer route has sampled victories and the broad accessibility/difficulty/stall checks pass without threshold changes. Native Safari, physical iPhone/iPad testing and human full-run balance remain unverified. Reports stay in the repository, with no game or README Play-line link.
