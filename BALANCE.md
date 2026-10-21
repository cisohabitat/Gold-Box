# Game balance — build 0.13.0

Default party; real Auto combat; loot-first exploration; complete route objectives and accept the first two shrine beacons encountered; camp below 70% HP; first offered boon; varied councils; no shop purchases.

Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.

| Oath | Wins / runs | Win rate | 95% interval | Mean depth |
| --- | --- | --- | --- | --- |
| wanderer | 27 / 32 | 84.4% | 68.2%–93.1% | 6.00 |
| delver | 16 / 32 | 50.0% | 33.6%–66.4% | 5.53 |
| ironbound | 10 / 32 | 31.3% | 18.0%–48.6% | 4.72 |

| Route | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| 0 | 7/8 | 6/8 | 2/8 |
| 1 | 8/8 | 2/8 | 4/8 |
| 2 | 6/8 | 3/8 | 2/8 |
| 3 | 6/8 | 5/8 | 2/8 |

Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.

Checks: PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.

Per-floor defeats, guardian pressure, and full seeded run records are in report.json.

## Guardian pressure

| Guardian | Oath | Wins / attempts | Mean rounds | Mean party HP remaining |
| --- | --- | --- | --- | --- |
| BellWarden | wanderer | 32/32 | 5.3 | 91.6% |
| BellWarden | delver | 31/31 | 7.5 | 78.0% |
| BellWarden | ironbound | 24/28 | 9.7 | 57.4% |
| AshCantor | wanderer | 32/32 | 6.8 | 88.6% |
| AshCantor | delver | 22/28 | 11.7 | 42.5% |
| AshCantor | ironbound | 12/21 | 11.0 | 24.9% |
| CryptLord | wanderer | 27/32 | 13.6 | 51.2% |
| CryptLord | delver | 16/21 | 12.6 | 40.2% |
| CryptLord | ironbound | 10/12 | 12.4 | 45.6% |

## Interpretation and reproduction

Compared with 0.12.0 (26/32 Wanderer, 18/32 Delver, 7/32 Ironbound), this release changes delayed guardian spells and Auto escape decisions, so subsequent RNG paths differ. The objective-aware policy is unchanged. This is a regression canary, not evidence that a particular boss is harder or easier for a person. All successful fresh campaigns complete two route objectives, five councils and a crown fate. No balance threshold was relaxed.

Optional hunts are excluded. Separately, 72 prepared level-three/four Auto hunt probes across all oaths still win without stalls after Astrax's HP/breath increases. This establishes sampled accessibility, not a challenging human encounter; further difficulty tuning needs observed play.

Serve the repo and run `node tests/balance.cjs` for 96 runs. Seeds are `2718 + route + sample × 10000`. `BALANCE_SAMPLES=12` expands the sample; `BALANCE_OUTPUT` selects the output directory. CI uploads report.json with fight records and outcome detail.

Physical Safari/iPhone/iPad and human full-run difficulty remain unverified. Reports stay in the repository and are not linked from the game or README Play line.
