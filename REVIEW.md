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

## Desktop, iPad, and iPhone follow-up

Reviewed the tactical release at `11a31dd7b457339dda799cf220e441003565b8ea` for the requested cross-device support.

- **Tablet layout gap:** phone fitting ended at 760px, leaving common iPad windows with the fixed 300px sidebar and unfitted desktop board. Resolved by making the fitted shell universal and reserving the sidebar for windows at least 1200×650px.
- **Short desktop windows:** compact landscape depended on a coarse pointer. Resolved with a height/width rule independent of input hardware.
- **Keyboard combat gap:** clickable grid cells lacked a keyboard route. Resolved with a roving tab stop, labelled coordinates, bounded arrow navigation, Enter/Space activation, visible focus, and focus retention after rendering. Exploration now ignores typing fields and browser modifier shortcuts.
- **Resize overlay risk:** drawer state could outlive the sidebar layout. The layout and media-query listener now share a breakpoint and clear transient drawer state when crossing it.

Validation: 40 engine regressions pass. The committed optional browser harness passes 19 device sizes, including iPad split view and desktop windows, with fitted board/controls, boss/spell menus, 44px main targets, keyboard movement/casting, resize state, reduced motion, and no page errors. The existing touch-preview, save/reload, rejected-import, contract, and offline feature flow also passes. Native Safari and physical-device testing remain unavailable.


## Follow-up fixes and visible log

The review of `0e8e39b027dc30478dfd5b6f866885d4e9ae2b4c` reproduced three P2 defects: keyboard activation behind paused Tactics, an unusably small board in short windows under 761px wide, and false Copied feedback after asynchronous clipboard rejection.

The polish release fixes all three. Layered menus isolate focus and background input, while manual combat handlers reject overlays. Compact landscape starts at 600px; minimum board height and a scrolling fallback protect very small portrait windows. Clipboard copying awaits success, checks fallback results, and offers manual-copy guidance on failure. A new 40px log strip shows the latest two events without opening field notes. Movement/action status, hit-odds feedback, and keyboard creation/inventory/level controls improve readability and access.

Reproducible local evidence: 41 engine regressions; 25-size device matrix; actual keyboard party creation, equipment assignment, controlled manual victory, and modal focus tests; clipboard success/fallback/failure; portable saves with storage blocked; existing touch/save/offline flow; 36 seeded campaigns with 17 victories, 19 defeats, and no stalls. The three-oath difficulty ordering holds in this small Auto sample. No new engine balance defect was established, so this release preserves tuning. CI now exercises Chromium, Firefox, and WebKit before publication; exact workflow results are recorded in the release PR. Physical Safari/iPad/iPhone validation remains unavailable.


## The Last Dawn campaign review

Baseline: `113c10c5ec76a45278afbe635f8eeecbb18ce409`. The tactical campaign had strong encounters but no consequential story decisions between its six floors and only one automatic ending. The authored expansion keeps the existing map/guardian gates and adds seven route-specific two-plan councils (five per run), recurring allies, bounded final-battle support, a story Chronicle, and three crown fates with a chosen bearer.

Verification targets the new persistent risks: pay a plan exactly once; do not stack derived bonuses or retroactively reward older saves; leave bestiary templates untouched; do not finish without the crown/king/stairs gates; preserve the final decision on reload. The expanded 48-check regression suite passes locally, as do the 25-size device matrix, existing quality/touch/save/offline flows, and dedicated phone/tablet/desktop council/finale UI checks. Thirty-six varied-plan campaigns yield 17 victories/19 defeats, all three endings, and no stalls/errors. Cross-browser PR jobs and publication remain the release gate; their final evidence is recorded in the implementation PR.

## Restart and balance follow-up

The user reported accidental Restart activation. The previous button directly invoked `showStart`, immediately discarding the active battle session without confirmation. It now opens an isolated safe-default dialog, pauses combat, and requires a separate confirmation action. Keep Playing, Escape, and rapid double taps preserve the active run; confirmed return keeps the latest exploration Continue save. Build 0.7.0 is visible on title and gameplay screens.

The prior 36-run campaign exercise verified progression but did not enforce balance bands or publish a structured route/guardian report. The new balance canary covers 96 seeded oath/route combinations, records pressure and defeat locations, checks broad difficulty/order/accessibility criteria, and writes build-tagged reports even on failure. The title screen links to BALANCE.md; detailed JSON/Markdown reports become CI artifacts. Auto-policy outcomes are diagnostic evidence, not measured player win rates.
