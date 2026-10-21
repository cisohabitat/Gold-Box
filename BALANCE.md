# Game balance — build 0.11.0

Default party; real Auto combat; loot-first exploration; camp below 70% HP; first offered boon; varied councils; no shop purchases.

Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.

| Oath | Wins / runs | Win rate | 95% interval | Mean depth |
| --- | --- | --- | --- | --- |
| wanderer | 24 / 32 | 75.0% | 57.9%–86.7% | 6.00 |
| delver | 17 / 32 | 53.1% | 36.4%–69.1% | 5.53 |
| ironbound | 8 / 32 | 25.0% | 13.3%–42.1% | 4.47 |

| Route | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| 0 | 6/8 | 4/8 | 0/8 |
| 1 | 4/8 | 2/8 | 2/8 |
| 2 | 7/8 | 6/8 | 2/8 |
| 3 | 7/8 | 5/8 | 4/8 |

Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.

Checks: PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.

Per-floor defeats, guardian pressure, and full seeded run records are in report.json.


## Guardian pressure

| Guardian | Oath | Wins / attempts | Mean rounds | Mean party HP remaining |
| --- | --- | --- | --- | --- |
| BellWarden | wanderer | 32 / 32 | 5.0 | 93.2% |
| BellWarden | delver | 30 / 32 | 8.2 | 67.4% |
| BellWarden | ironbound | 20 / 26 | 9.8 | 48.4% |
| AshCantor | wanderer | 32 / 32 | 6.6 | 73.9% |
| AshCantor | delver | 22 / 29 | 10.4 | 35.2% |
| AshCantor | ironbound | 11 / 17 | 10.9 | 29.9% |
| CryptLord | wanderer | 24 / 32 | 12.3 | 41.0% |
| CryptLord | delver | 17 / 21 | 12.9 | 43.2% |
| CryptLord | ironbound | 8 / 10 | 10.7 | 48.7% |

## Pacing comparison

The Ash Cantor encounter multiplier changes from 0.55 to 0.50. Its own stats, spells and one-time bloodied phase are unchanged; the lower budget reduces its supporting force. Other required encounters, camp recovery, oath settings and balance thresholds are unchanged.

The paired default sample uses the same eight seeds per oath/route (32 runs per oath):

| Oath | Before | After |
| --- | --- | --- |
| wanderer | 23/32 | 24/32 |
| delver | 15/32 | 17/32 |
| ironbound | 7/32 | 8/32 |

Delver Ash Cantor victories change from 15/29 to 22/29; final-king victories change from 15/15 to 17/21. Final-king figures concern survivors only, so they cannot establish the difficulty of the whole campaign. New encounter composition changes subsequent random draws; equal initial seeds do not imply identical later worlds.

Before tuning, an expanded 144-run sample (12 seeds per route/oath) recorded Wanderer 37/48, Delver 23/48 and Ironbound 11/48 victories, with no stalls. Delver lost 22/45 Ash Cantor attempts, while all 23 surviving groups defeated the king. That repeated pressure point motivated the bounded support-budget reduction. The first eight seeds reproduce the previous 23/32, 15/32 and 7/32 baseline exactly.

The main-campaign policy skips optional hunts and shopping. Separate real-engine hunt samples at levels three and four across all three oaths record 72/72 prepared Auto victories, no stalls, without gear/boons/shopping. This shows prepared accessibility, not human difficulty. Eclipsescale now adds a bounded defensive option (+2 AC, 2 less damage per spell hit) for players who choose that hunt.

## Reproduce and limitations

Serve the repository and run `node tests/balance.cjs` for the default 96-run gate. `BALANCE_SAMPLES=12` expands to 144 campaigns; `BALANCE_OUTPUT` selects the report directory. Seeds are `2718 + route + sample × 10000`. JSON artifacts include every outcome, seed, route, decision count, finale and guardian fight. CI uploads the default report even on failure. Run `node tests/regression.cjs` for the 72 separate hunt probes.

These are deterministic Auto diagnostics, not estimates of human win rates. The broader baseline and paired tuning comparison justify a measured pacing adjustment; neither proves optimal balance. Human full-run testing and physical Safari/iPhone/iPad validation remain outstanding. The game and README Play line contain no balance-report links.
