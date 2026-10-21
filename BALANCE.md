# Game balance — build 0.15.0

Default party; real Auto combat; loot-first exploration; complete route objectives and accept the first two shrine beacons encountered; camp below 70% HP; first offered boon; varied councils; no shop purchases.

Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.

| Oath | Wins / runs | Win rate | 95% interval | Mean depth |
| --- | --- | --- | --- | --- |
| wanderer | 24 / 32 | 75.0% | 57.9%–86.7% | 6.00 |
| delver | 24 / 32 | 75.0% | 57.9%–86.7% | 5.88 |
| ironbound | 7 / 32 | 21.9% | 11.0%–38.8% | 4.63 |

| Route | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| 0 | 7/8 | 5/8 | 0/8 |
| 1 | 6/8 | 6/8 | 2/8 |
| 2 | 5/8 | 6/8 | 3/8 |
| 3 | 6/8 | 7/8 | 2/8 |

Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.

Checks: PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.

Per-floor defeats, guardian pressure, and full seeded run records are in report.json.

## Guardian pressure

| Guardian | Oath | Wins / attempts | Mean rounds | Mean party HP remaining |
| --- | --- | --- | --- | --- |
| BellWarden | wanderer | 32/32 | 5.1 | 93.3% |
| BellWarden | delver | 32/32 | 7.8 | 79.5% |
| BellWarden | ironbound | 26/28 | 10.1 | 64.5% |
| AshCantor | wanderer | 32/32 | 6.2 | 87.1% |
| AshCantor | delver | 28/32 | 10.1 | 59.0% |
| AshCantor | ironbound | 9/18 | 10.4 | 27.6% |
| CryptLord | wanderer | 24/32 | 11.8 | 48.7% |
| CryptLord | delver | 24/27 | 11.6 | 51.9% |
| CryptLord | ironbound | 7/8 | 12.4 | 56.5% |

## Patrol interpretation

Compared with 0.14.0 (28/32 Wanderer, 23/32 Delver, 15/32 Ironbound), this sample produces 24/32, 24/32 and 7/32. Ordinary composition now reserves affordable complementary roles and uses distinct deployment. No enemy stats, existing budgets/count caps/slack or balance thresholds were increased. Boss templates/arena rules are unchanged, although earlier battles change subsequent RNG paths and progression. The results do not isolate one profile or estimate human difficulty.

All 96 runs terminate and every Wanderer route has a victory. The broad ordering check passes with a Wanderer/Delver tie; this sample does not demonstrate a clear gap between those two oaths. Do not tune or loosen criteria simply to manufacture one. Winning fresh runs retain both route objectives, five councils and a valid crown fate.

Defeat evidence is not part of combat decisions and draws no RNG. It records actual party HP losses after wards and excluding overkill; friendly fire is a spell subtotal. The Auto campaign policy does not use manual friendly-fire casts, so focused engine/browser tests exercise that report path separately.

## Separate guardian probes

All 288 isolated guardian strategy scenarios terminate with the same outcomes as 0.14.0. They use two squads, plain/ward fixtures and two scripted front-line priorities; casters/opponents use Auto, gear budget is held at zero, and council aid/attrition/shopping are absent. King probes retain many losses; prepared Astrax remains accessible. The separate 72 prepared level-three/four Observatory probes win. These are not human playtests, full-campaign rates or acquisition evidence.

## Reproduce and limits

Serve the repo and run `node tests/balance.cjs` for 96 campaigns. Seeds: `2718 + route + sample × 10000`; `BALANCE_SAMPLES` expands the sample and `BALANCE_OUTPUT` selects the output directory. `node tests/scenario-balance.cjs` writes isolated arena results. CI retains both JSON reports, including losses.

Native Safari/iPhone/iPad and human manual-play difficulty remain unverified. Reports stay in the repository and CI artifacts, without game or README Play-line links. Runtime is measured against a soft size target rather than rejected solely by bytes.
