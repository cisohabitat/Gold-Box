# Game balance — build 0.7.0

Default party; real Auto combat; loot-first exploration; camp below 70% HP; first offered boon; varied councils; no shop purchases.

Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.

| Oath | Wins / runs | Win rate | 95% interval | Mean depth |
| --- | --- | --- | --- | --- |
| wanderer | 23 / 32 | 71.9% | 54.6%–84.4% | 6.00 |
| delver | 15 / 32 | 46.9% | 30.9%–63.6% | 5.31 |
| ironbound | 7 / 32 | 21.9% | 11.0%–38.8% | 4.47 |

| Route | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| 0 | 5/8 | 5/8 | 0/8 |
| 1 | 6/8 | 3/8 | 2/8 |
| 2 | 6/8 | 2/8 | 2/8 |
| 3 | 6/8 | 5/8 | 3/8 |

Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.

Checks: PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.

Per-floor defeats, guardian pressure, and full seeded run records are in report.json.

## Guardian pressure

| Guardian | Oath | Wins / attempts | Mean rounds | Mean party HP remaining |
| --- | --- | --- | --- | --- |
| BellWarden | wanderer | 32 / 32 | 5.0 | 93.2% |
| BellWarden | delver | 30 / 32 | 8.2 | 67.4% |
| BellWarden | ironbound | 20 / 26 | 9.8 | 48.4% |
| AshCantor | wanderer | 32 / 32 | 7.1 | 69.3% |
| AshCantor | delver | 15 / 29 | 10.2 | 22.0% |
| AshCantor | ironbound | 11 / 17 | 11.9 | 27.9% |
| CryptLord | wanderer | 23 / 32 | 13.0 | 43.0% |
| CryptLord | delver | 15 / 15 | 11.5 | 70.3% |
| CryptLord | ironbound | 7 / 10 | 10.2 | 41.8% |

## Review notes

The difficulty ordering and broad regression limits pass. Every Wanderer route has at least five wins in eight seeds; all Wanderer defeats occur in the final tomb. The Ash Cantor is the largest measured Delver pressure point: 14 defeats in 29 attempts. Delver groups that survived to the final king won 15/15 fights, which is subject to survivor selection and does not imply the whole campaign is easy. Ironbound has no Auto victories on Warren/Ossuary (0/8), so that combination merits further manual play and additional seeds before any targeted retuning.

This release changes Restart/build visibility and the balance verification, not encounter tuning. No result here is a promise that Auto or a human wins a particular run. The game has no telemetry; the policy is explicit and intentionally limited.

## Reproduce and inspect

Serve the repo and run `node tests/balance.cjs`. `BALANCE_SAMPLES=12` runs 144 campaigns; `BALANCE_OUTPUT` changes the report directory. The deterministic seeds are `2718 + route + sample × 10000`. Each oath uses the same seed schedule; branch-dependent draws and player actions still change subsequent RNG consumption. Final choices cycle through Break/Bind/Wear. Runs are batched between seeds to release browser work.

The Game quality CI job uploads per-build `report.json` and `report.md` artifacts, including failures. JSON includes all run seeds, outcomes, defeat floors, supplies, per-battle HP/rounds, guardians, and the build identifier. This checked-in snapshot is for build 0.7.0; rerun the checker after any rule/tuning change.
