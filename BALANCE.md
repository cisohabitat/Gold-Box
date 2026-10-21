# Game balance — build 0.17.0

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

## Cosmetic-projectile interpretation

All 96 seeded outcomes match 0.16.0: 25/32 Wanderer, 20/32 Delver, 13/32 Ironbound. Projectile metadata and rendering consume no gameplay randomness and do not control action/turn timing. A separate enabled/disabled engine simulation verifies identical combatants, phase, rounds, XP and next RNG value. Existing budgets, caps, enemy kits, guardian retinues and canary thresholds are unchanged.

Every run terminates and each Wanderer route has sampled victories. Winning fresh campaigns retain both route objectives, five councils and a valid crown fate. These are deterministic Auto checks, not human win-rate estimates or physical Safari validation.

All 288 isolated guardian scenarios also retain their 0.16.0 outcomes with zero stalls. Bell Warden:24/24,11/24,2/24; Ash Cantor:21/24,3/24,0/24; Sunless King:5/24,0/24,0/24; Astrax:24/24 on each oath (Wanderer/Delver/Ironbound). CI uploads complete seeded records separately from source.
