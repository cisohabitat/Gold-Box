# Game balance — build 0.14.0

Default party; real Auto combat; loot-first exploration; complete route objectives and accept the first two shrine beacons encountered; camp below 70% HP; first offered boon; varied councils; no shop purchases.

Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.

| Oath | Wins / runs | Win rate | 95% interval | Mean depth |
| --- | --- | --- | --- | --- |
| wanderer | 28 / 32 | 87.5% | 71.9%–95.0% | 6.00 |
| delver | 23 / 32 | 71.9% | 54.6%–84.4% | 5.72 |
| ironbound | 15 / 32 | 46.9% | 30.9%–63.6% | 5.00 |

| Route | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| 0 | 7/8 | 4/8 | 1/8 |
| 1 | 6/8 | 6/8 | 6/8 |
| 2 | 8/8 | 6/8 | 4/8 |
| 3 | 7/8 | 7/8 | 4/8 |

Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.

Checks: PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.

Per-floor defeats, guardian pressure, and full seeded run records are in report.json.

## Guardian pressure

| Guardian | Oath | Wins / attempts | Mean rounds | Mean party HP remaining |
| --- | --- | --- | --- | --- |
| BellWarden | wanderer | 32/32 | 5.3 | 91.0% |
| BellWarden | delver | 31/31 | 7.4 | 79.6% |
| BellWarden | ironbound | 25/28 | 10.2 | 56.7% |
| AshCantor | wanderer | 32/32 | 6.6 | 86.6% |
| AshCantor | delver | 27/29 | 10.5 | 56.2% |
| AshCantor | ironbound | 18/22 | 12.2 | 45.6% |
| CryptLord | wanderer | 28/32 | 11.8 | 52.7% |
| CryptLord | delver | 23/26 | 11.7 | 60.0% |
| CryptLord | ironbound | 15/18 | 12.1 | 44.4% |

## Interpretation

The 0.13.1 snapshot was 27/32 Wanderer, 16/32 Delver and 10/32 Ironbound. The current 28/32, 23/32 and 15/32 sample passes all unchanged canaries with zero stalls and victories on every Wanderer route. Enemy stats/budgets and existing threshold bands are unchanged; authored terrain, council sanctums and armour wards change combat decisions and subsequent RNG paths. The combined changes make this sample more forgiving; these results do not isolate one feature's effect or estimate human difficulty. Ironbound's 95% interval is broad and extends above the point canary's 60% ceiling. More human/seed evidence is needed before further difficulty tuning.

Completed fresh victories still require two route objectives, five councils and a valid crown fate. Reports remain in the repository/CI artifacts and are not linked from the game or README Play line.

## Separate scripted arena probes

Scripted front-line guardian-first or retinue-first targeting; casters and enemies use Auto. Two squads, plain or ward relic fixtures, three oaths, three seeds per combination. Isolated stage-level arenas; no council bonuses, campaign attrition or shopping. Gear budget contribution is held at zero in both fixtures; actual campaign budgets still scale with equipped value. Not human testing or a difficulty guarantee.

| Guardian | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| bell_warden | 24/24 | 11/24 | 2/24 |
| ash_cantor | 21/24 | 3/24 | 0/24 |
| crypt_lord | 5/24 | 0/24 | 0/24 |
| eclipse_wyrm | 24/24 | 24/24 | 24/24 |

All 288 scenarios terminate. Underprepared King probes have few Wanderer wins and no sampled harder-oath wins; these omit actual campaign gear/story benefits and attrition. Optional Astrax remains highly accessible in these prepared level-four fixtures. Separately, 72 prepared level-three/four Auto hunt probes now use the authored Observatory arena and all win. These are diagnostic observations, not proof of exciting or hard human encounters. Results retain losses; fixture equipment does not establish acquisition.

## Reproduce and limits

Serve the repo and run `node tests/balance.cjs` for 96 campaigns. Seeds: `2718 + route + sample × 10000`. `BALANCE_SAMPLES=12` expands the sample; `BALANCE_OUTPUT` selects the report directory. Run `node tests/scenario-balance.cjs` for isolated probes; `SCENARIO_OUTPUT` selects its directory. The JSON reports include seeds, loadouts/policies and outcomes; CI uploads both reports.

Physical Safari/iPhone/iPad and human full-run balance remain unverified. Runtime bytes are reported against the user's soft 350 KiB target, without an arbitrary hard byte ceiling.
