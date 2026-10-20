# Game review — October 20, 2026

Baseline: `219fd0d4e7f638666fd622fab2b8791d30e9a6e7` on `main`. This review precedes the tactical-depth release described in [ROADMAP.md](ROADMAP.md) and [REQUIREMENTS.md](REQUIREMENTS.md).

## What already works

The game has an original six-floor branching campaign, four classes, signatures, portable saves, three difficulties, legendary equipment, a two-phase final boss, and a viewport-fitting mobile shell. The existing 19 regression checks pass. Keep those strengths and the standalone HTML format.

## Verified defects

| ID | Priority | Finding and consequence | Evidence before the change |
| --- | --- | --- | --- |
| R1 | P1 | Failed save imports can mutate the active run. | `applySave` assigns revived heroes before reading `s.bag`. Setting a valid snapshot's bag to `null` returns `false` but replaces the party reference. Validate and prepare the entire snapshot before changing live state. |
| R2 | P2 | Secret caches can bypass a locked vault. | Cache generation requires a wall beside reachable floor but does not check its other neighbours. A seeded batch found a floor where opening caches made the exit reachable while its door remained locked. Exclude caches that bridge the sealed side. |
| R3 | P2 | Quiet routes under-deliver supplies. | Gallery and Pillared Road specify `rations:2`; both generators create one ration pickup without an amount, and `collect` adds one. Preserve the configured amount, including the fallback generator. |
| R11 | P2 | A fight on the stairs leaves progression waiting for another entry. | Full-route simulations stopped with the party standing on an exit after combat, no loot remaining, and no town screen. `resolveCombat` collects loot underfoot but does not resume the exit. A player can step away and back, but the controller should resume the exit after pending level choices. |

The probes ran the real inline script with DOM stubs. R1 checks failed-import state identity; R2 flood-fills with all cache walls opened and doors blocked; R3 compares floor specifications with generated pickups and collected resources. They establish concrete failures, not a claim of exhaustive review.

## Gameplay and usability findings

| ID | Observation | Direction |
| --- | --- | --- |
| R4 | Combat boards offer little positional texture beyond distance and occupancy. | Theme-specific cover, healing sanctums, and ember hazards, with clear rules and AI awareness. |
| R5 | Area spells commit on the first touch; preview currently relies on mouse hover. | First touch aims and shows allies/foes caught; confirmation spends the action. |
| R6 | Enemy capabilities and combat rules are hard to learn during a run. | A small help/tactics sheet with readable roles, live spell uses, statuses, and terrain explanations. Pause queued combat while it is open. |
| R7 | Avoiding early encounters can leave heroes entering deeper tiers with little progression. | One-time chapter XP, recorded in saves, without removing survivor-only battle XP on harder oaths. |
| R8 | Optional exploration has rewards but few long-term goals. | Three persistent optional contracts with visible progress and one-time rewards. |
| R9 | The middle chapters lack named campaign encounters. | Two data-defined guardians at the convergence floors, using the existing combat engine and bounded reinforcements. |
| R10 | Gear price strongly increases encounter size: an 80-gold Fine Sword adds 40 budget for only +1 attack/+1 damage, more than three regular goblins' threat. | Reduce gear's budget contribution from 0.5 to 0.12 per gold while retaining floor, level, oath, and enemy caps. Verify the deterministic surcharge and run campaign simulations rather than promising universal balance. |

## Scope decision

Improve decisions, readability, and progression before adding more floors or another rendering engine. Preserve iPhone fit, offline play, old version 2 codes, and the existing campaign. The implementation must stay below 350 KiB for `index.html` and add no runtime dependencies, accounts, or network services. Deferred ideas are listed in the roadmap rather than silently treated as implemented.

## Release outcome

R1, R2, R3, and R11 are corrected with focused regression coverage. The gameplay directions R4–R10 are implemented in the scoped release. See the [requirements acceptance record](REQUIREMENTS.md#acceptance-record) for actual verification and limits. This baseline review remains intact so later contributors can distinguish the original failures from their fixes.
