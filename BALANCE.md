# Game balance — build 0.20.0

Default party; real Auto combat; loot-first exploration; complete route objectives and accept the first two shrine beacons encountered; camp below 70% HP; first offered boon; varied councils; varied companion vows with ready rewards claimed at waystations; no shop purchases.

Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.

| Oath | Wins / runs | Win rate | 95% interval | Mean depth |
| --- | --- | --- | --- | --- |
| wanderer | 25 / 32 | 78.1% | 61.2%–89.0% | 5.94 |
| delver | 14 / 32 | 43.8% | 28.2%–60.7% | 5.25 |
| ironbound | 13 / 32 | 40.6% | 25.5%–57.7% | 4.72 |

| Route | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| 0 | 6/8 | 2/8 | 5/8 |
| 1 | 5/8 | 1/8 | 1/8 |
| 2 | 6/8 | 4/8 | 3/8 |
| 3 | 8/8 | 7/8 | 4/8 |

Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.

Checks: PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.

Per-floor defeats, guardian pressure, and full seeded run records are in report.json.

## Interpretation and comparison

The existing canary thresholds and loot-first/no-shopping policy are unchanged. Auto Gear now scores specialist equipment, and the campaign includes new loot, cache contents and guarded prizes. Added map loot changes placement and the RNG draw sequence; these are not paired encounters or a controlled item ablation.

0.19.0 had 25/32 Wanderer, 20/32 Delver and 13/32 Ironbound victories. 0.20.0 has 25/32, 14/32 and 13/32: the Delver sample is lower, while all broad canaries pass and every Wanderer route has a sampled victory. Do not attribute that change to one item, claim unchanged balance, or treat these Auto results as human win rates. No guardian stats, encounter multipliers, difficulty thresholds or per-run safety limits were changed.

## Treasure availability and actual acquisition

The source audit covers 32 generated six-chapter routes (192 floors), all four routes/eight seeds. Each offers one source for each new class relic and two rare-cache trade treasures; six nonlegendary additions are stocked by the trader. Every new item has art/lore/rules and a genuine source. Reward metadata leaves matching-seed encounter composition identical. Fallback descriptors retain guarded relic prizes; fallback layouts do not promise hidden-cache treasure. These are opportunities, not automatic collection probabilities.

| New find | Discovered in 96 loot-first runs | Discovered in 8 treasure-directed runs |
| --- | --- | --- |
| bellheart_aegis | 73/96 | 8/8 |
| ashen_covenant | 62/96 | 8/8 |
| mercy_reliquary | 39/96 | 8/8 |
| nightwarden_bow | 38/96 | 8/8 |
| pilgrim_boots | 96/96 | 8/8 |
| ward_charm | 48/96 | 8/8 |
| pilgrim_mace | 89/96 | 8/8 |
| scout_bow | 48/96 | 8/8 |
| smoke_phial | 96/96 | 8/8 |
| dawn_salt | 89/96 | 8/8 |
| dawn_seal | 0/96 | 8/8 |
| royal_astrolabe | 0/96 | 8/8 |

The eight extra treasure-directed Wanderer campaigns deliberately seek hidden-cache approaches, guarded relics and item loot before stairs, and buy unseen additions when affordable. Their planner reads map metadata. All twelve additions were acquired in **all eight** companies; all four relics were acquired before the finale, including the defeated company. Outcomes: **7 wins/1 defeats**, zero stalls. This is separate integration evidence, not an extension of the 96-run difficulty sample.

Eight companion-directed campaigns keep their existing policy: **7 wins/1 defeats**, zero stalls, each of the eight plans fulfilled four times. Complete run records are CI artifacts.

## Equipment choices and tradeoffs

| Build alternative | Gain | Cost/limit |
| --- | --- | --- |
| Bellheart vs Starweave | One less damage per weapon hit | −1 move; no +2 spell-control save ward |
| Covenant vs Sunshard/Nightglass | One extra 2d6 area cast each battle | No attack/damage bonuses, range four, friendly-fire risk; Wellspring cannot refill it |
| Reliquary vs Sunshard/Dawnblade | +2 HP on each healing spell | Less weapon accuracy/damage; does not improve potions/signature |
| Nightwarden vs Nightglass | Range six, +2 damage at distance four or more | Less base attack/damage, no poison, adjacent damage loss and normal ranged melee pressure |
| Boots vs protective armour | +1 movement | No AC or passive wards |
| Hospice Mace vs Oak Staff | +1 HP per healing spell | One less weapon attack bonus |
| Scout Bow vs Fine Sword | Range four | One less weapon attack bonus |

Boundary tests exercise actual normal/reaction damage, healing, reach, spell/action/charge behavior and replacement. The scripted runs also record final equipment. All eight treasure-directed companies finish with Bellheart on the Fighter and Nightwarden on the Thief; Auto Gear prefers Sunshard on the Cleric and Nightglass on the Mage in this sample. The specialist casting/healing relics therefore remain manual alternatives, rather than demonstrated universal Auto upgrades. Human decisions and broader builds remain unmeasured; do not infer that a score-based recommendation establishes item dominance or usefulness in every fight.

## Guardian pressure in full campaigns

| Guardian | Oath | Wins / attempts | Mean rounds | Mean party HP remaining |
| --- | --- | --- | --- | --- |
| BellWarden | wanderer | 32/32 | 6.1 | 88.0% |
| BellWarden | delver | 28/30 | 8.8 | 67.4% |
| BellWarden | ironbound | 22/27 | 11.5 | 53.7% |
| AshCantor | wanderer | 31/31 | 7.6 | 86.1% |
| AshCantor | delver | 19/26 | 12.0 | 37.5% |
| AshCantor | ironbound | 16/21 | 13.3 | 37.7% |
| CryptLord | wanderer | 25/31 | 12.6 | 50.4% |
| CryptLord | delver | 14/18 | 13.9 | 36.6% |
| CryptLord | ironbound | 13/16 | 13.0 | 42.5% |

## Isolated guardian probes

All 288 staged probes terminate, with sampled Wanderer wins for each guardian. These use fixed squads/ward gear, zero gear-budget contribution and scripted front-line priorities; they do not model acquisition or human strategy. Expanded generation in the harness shifts its RNG prelude, so old/new probe counts are not a controlled equipment comparison.

| Guardian | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| bell_warden | 24/24 | 9/24 | 0/24 |
| ash_cantor | 18/24 | 3/24 | 1/24 |
| crypt_lord | 5/24 | 0/24 | 0/24 |
| eclipse_wyrm | 24/24 | 24/24 | 24/24 |

Runtime: **425,367 bytes (415.4 KiB), +22,174 bytes over 0.19.0**. The 350 KiB target stays soft. Local gates: 114 existing engine regressions plus 12 treasure checks, four sprite/art/four policy checks, source audit, 288 guardian probes and all seventeen browser suites. Cosmetic marker/card/charge-count refinements were checked with the relevant browser suite after the local campaign batch; exact final-head CI reruns the complete gate before publication. The job budget is 20 minutes to accommodate the added treasure campaigns and full browser suite; campaign move/turn safety limits and difficulty thresholds are unchanged.

Exact-head three-browser CI, merged SHA and Pages/live evidence are recorded in the release PR. Physical iPhone/iPad Safari, human campaign pacing and human art recognition remain unverified. Overall assessment remains B+.
