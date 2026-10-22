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

The prior 36-run campaign exercise verified progression but did not enforce balance bands or publish a structured route/guardian report. The new balance canary covers 96 seeded oath/route combinations, records pressure and defeat locations, checks broad difficulty/order/accessibility criteria, and writes build-tagged reports even on failure. Build 0.7.0 originally linked BALANCE.md from the title; that link was later removed at the user’s request. Detailed JSON/Markdown reports remain CI artifacts. Auto-policy outcomes are diagnostic evidence, not measured player win rates.

The expanded double-click matrix reproduced a second-tap landing on confirmation at 600×350. A 600 ms confirmation arming delay now blocks that transition; cancellation is immediate, and the delay timer is independent of combat scheduling. All 25 device scenarios now exercise rapid restart activation.

## Grade and improvements — 0.13.0

Scope: a standalone six-chapter tactical RPG under 350 KiB. Baseline 0.12.0 earns **B+ overall**: persistent route goals and councils work, but the middle guardians offer limited visible counterplay. This is an editorial scope assessment, not a commercial AAA certification.

This release adds interruptible Warden tolls and Cantor hymns, fixed warnings with explicit counter instructions, and legal Auto escape movement. Astrax gains 46 base HP and 3d6 breath; phase and charge caps remain intact. The implementation targets **A− within this scope**, conditional on the release gate. Campaign structure/identity and save/device engineering are strongest; human-tested difficulty, encounter variety and native-device evidence still limit the grade. Automated victories cannot establish whether these bosses feel epic to a person.

Evidence: 70 engine/controller regressions plus four sprite and four balance-policy checks; a new real manual-attack/telegraph browser suite at phone, short landscape, tablet and desktop sizes. Full seeded balance and exact-head cross-browser/publication results are recorded with the release. Native Safari/physical hardware and human full-run testing remain unverified.

Local 0.13.0 balance: Wanderer 27/32, Delver 16/32, Ironbound 10/32; 96 completed runs, no stalls, unchanged canaries pass and every Wanderer route has a victory. Runtime 345,004 bytes (<350 KiB). All existing Chromium browser suites and the new guardian suite pass. Exact-head Chromium/Firefox/WebKit CI and live deployment evidence belong in the release PR.

## Fresh review — 0.13.1

Reviewed published 0.13.0 (`bb7568d9a3f9d006ab5952a9d67c41745421f0fa`) independently of the previous grade. **B+ overall** is more defensible than the earlier A−: automated reliability received too much weight, while manual tactical readability, encounter variety and observed human difficulty remain incomplete.

| Area | Fresh assessment | Improvement / remaining gap |
| --- | --- | --- |
| Recovery and input | B+ before fixes; A− within automated scope after | Equipment and exploration healing were not saved until closing Party. Successful actions now persist immediately; reload/Continue tests reproduce the original loss and verify the correction. |
| Manual tactical clarity | B → B+ | Tactics now opens at the top and exposes upcoming units/rounds; Move marks reaction, blast and ember risk with accessible inspection. The compact board still requires opening Tactics for the complete forecast. |
| Resource safety | B → A− for the specific interaction | Healing at full HP wasted a potion and combat action. Both handlers now reject it, and the combat choice is visibly disabled. |
| Campaign and visual identity | B+ | Authored routes, councils, aftermaths and unique monsters/relics remain strengths. Encounter variety is still bounded by the small registries. No new content or art is claimed. |
| Balance evidence | B | Strong deterministic canaries; human decision-making and challenge are not measured. No combat stats, rewards, thresholds or RNG policy changed here. |
| Device support | A− in automation | Existing matrix plus new confidence interactions; physical Safari/iPhone/iPad remain unverified. |

Reproduced before fixing: a Fine Sword equip left saved equipment null; exploration healing left old saved HP/satchel; a full-HP combat potion consumed one item and an action. The three regression checks failed on 0.13.0. New forecast tests specify dead/incapacitated units, Wait/round wrapping, reaction availability, blast/ember risks and no mutation.

Improvements keep the overall grade **B+**. They resolve concrete weaknesses without claiming the untested experience has reached A or AAA. The next evidence needed is observed human full runs and physical Safari testing; further content/difficulty work should respond to those findings.

Visual phone review also reproduced Tactics scrolling directly to its bottom Return control and hiding imminent threats. Return now stays at the top; initial/reopened scroll position and visible keyboard focus are checked in all four confidence viewports.

Build 0.13.1 local evidence: 75 engine/controller checks, four sprite/art checks and four balance-policy checks pass; all eleven Chromium browser suites pass. The 96-run canary remains 27/32 Wanderer, 16/32 Delver, 10/32 Ironbound with no stalls. Runtime 347,155 bytes (<350 KiB). Exact-head cross-browser and live publication results are recorded in the release PR; physical Safari/human difficulty remain unverified.

## Concrete fixes and guardian variety — 0.14.0

The user clarified that 350 KiB is a soft target. Earlier hard-cap requirements are superseded; size is now reported while offline simplicity, device fit, save compatibility and release verification remain enforced.

Two reproduced P2 issues were corrected: a hero killed by an opportunity attack during manual movement remained the active actor, and a caster killed by its own blast also retained its turn. Both old-source checks failed. The controller now resolves/advances once through the existing scheduler and excludes dead actors from player controls.

The next gameplay weaknesses were repetitive guardian terrain, council support that mainly waited until the finale, and generic armour tradeoffs. Four authored arenas now change in the existing once-only bloodied phase; three councils supply protected sanctums; Lantern and Starweave gain bounded, distinct wards. Party comparisons and atlas notes explain what is gained and lost. No new floors, classes, enemy types or persistent schema were introduced.

The scope grade remains B+ pending observed human difficulty and physical-device evidence. More authored tactics and corrected defects are concrete improvements; automated checks alone do not justify another whole-game grade increase. Arena fires have pre-described positions/areas and apply only at turn end; they can still punish poor positioning. Scripted scenario losses are retained, especially unprepared King fights.

Build 0.14.0 local evidence: 84 engine/controller checks, four sprite/art checks and four policy checks pass; all twelve Chromium browser suites pass. The full 96-campaign canary gives 28/32 Wanderer, 23/32 Delver and 15/32 Ironbound with zero stalls and unchanged thresholds. All 288 isolated strategy scenarios terminate; 72 prepared Observatory hunt probes win. Runtime 354,308 bytes (346.0 KiB), reported against the soft 350 KiB target. Exact-head cross-browser/publication evidence is recorded in the release PR. Human/physical-device limits remain open.

## Ordinary encounter variety and defeat feedback — 0.15.0

The review found two experience gaps: normal fights used the same right-column deployment with random mixtures, and defeat provided a story line/run totals without explaining the battle. Five budget-safe patrol patterns now combine compatible roles and use distinct initial formations. A new transient report records actual HP losses, control turns, missed strikes and first fall; two suggestions follow observed evidence.

The report is deliberately limited: damage totals are not a causal model, damage may exceed starting HP after healing, friendly fire is a spell subtotal, and no report is fabricated from missing data. Formations do not block spell line of sight or alter ordinary AI rules. Specialist guarantees apply only when affordable; a label is not shown for a lone enemy or a missing specialist.

The scope grade remains B+ pending human difficulty and physical-device evidence. This release addresses repeated fights and unhelpful defeats; it adds no chapters/classes/enemy types or save schema. Enemy budgets/stats, guardian arenas and all existing balance thresholds remain intact. Full campaign outcomes can still change because composition/deployment changes subsequent RNG paths.

Build 0.15.0 local evidence: 92 engine/controller checks, four sprite/art checks and four policy checks pass; all thirteen Chromium browser suites pass. The full 96-campaign canary gives 24/32 Wanderer, 24/32 Delver and 7/32 Ironbound, with zero stalls and unchanged criteria. All 288 guardian probes terminate, with unchanged outcomes. Runtime 363,723 bytes (355.2 KiB), slightly above the user-approved soft 350 KiB target. Exact-head cross-browser and live publication evidence is recorded in the release PR. Human/physical-device limitations remain open.


## Ordinary enemy breadth — 0.16.0

The 0.15 roster had eleven regular enemies and four guardians; patrol formations reused a small set of tactical problems. Six new ordinary roles expand this to seventeen regular enemies and four guardians. Each introduces a bounded mechanic and an explicit counter: weapon ward, single leap, delayed death blast, silence, actual-loss siphon and one-tile forced pull. Existing guardian templates/retinues, opening chapter and difficulty formulas remain intact.

All six have distinct authored pixel art, inspected together, complete bestiary context and staged route habitats. Exact live shield protection, silence and death-blast deadlines are readable without adding a phone HUD row. Engine tests cover protection, damage accounting, reaction deaths, round-wrap deaths/Auto escape, control expiry, postponed channels, bounded healing and old/new saves. Browser checks cover the four supported device classes and actual disabled/restored casting controls.

The overall grade remains B+. Scripted correctness and increased variety support this release’s claims; human full campaigns and physical Safari remain unverified. Balance and final publication evidence are recorded in BALANCE.md and the release PR.

Build 0.16.0 local evidence: 102 engine checks, four sprite/art and four policy checks, 288 guardian scenarios and all fourteen Chromium browser suites pass. Full 96-campaign Auto canary: wanderer 25/32, delver 20/32, ironbound 13/32; zero stalls, all existing criteria pass. Runtime 377,562 bytes (368.7 KiB). Exact-head cross-browser CI and Pages/live evidence are recorded in the release PR.


## Missing ranged projectiles — 0.17.0

Review confirmed that ranged attacks/spells produced damage, flashes and logs but no visible projectile travel. The engine now emits bounded resolved-action snapshots, and a separate SVG layer draws arrows and distinct spell effects. It survives immediate turn/board redraws, uses target coordinates captured before movement/damage, and provides a glancing miss marker and target pulse.

The layer never controls turns or game state. Effects/preferences, reduced motion, cleanup caps, menus, resize, visibility and new/load/title transitions are covered. A deterministic enabled/disabled combat check verifies identical outcomes and random streams; real browser checks verify intermediate flight and manual confirmation. Phone arrow and Fireball frames were visually inspected. The overall assessment remains B+; this addresses a concrete presentation gap, without claiming human or physical Safari validation.

Build 0.17.0 local evidence: 106 engine checks, four sprite/art and four policy checks, 288 guardian scenarios and all fifteen Chromium browser suites pass. Full 96-campaign Auto outcomes remain 25/32 Wanderer, 20/32 Delver, 13/32 Ironbound, with zero stalls and unchanged canaries. Runtime 384,016 bytes (375.0 KiB). Exact-head three-browser CI and Pages/live evidence are recorded in the release PR.


## Personal stakes for the company — 0.18.0

The campaign’s public councils had consequences, but hero backgrounds mostly supplied passive edges and brief barks. Four optional companion vows now give a named owner two authored paths, existing-play goals, a later return and a once-only bounded reward. Eight background openings/closures connect those choices to the company’s origins. Tamsin, Vey, Mother Alis and Eren carry the outcomes forward through chapter arrivals, Chronicle and crown endings; a crowned quest owner is held to the promise.

Review/testing corrected two integration defects before release: waystation claim controls remained disabled after level allocation, and town/Chronicle quest cards reused IDs. Controls now refresh on confirmation and each view has its own IDs. Phone review prompted left-aligned, sentence-case choice prose with readable spacing. Save validation rejects impossible ownership, plan/baseline/status/payoff records before cancelling an active battle timer; legacy codes gain no invented vows. Overflow rewards leave the pledge intact.

The full campaign diagnostic now takes varied vows and claims ready rewards, so its policy differs from 0.17.0’s no-vow sample. Report that distinction with outcomes in BALANCE.md. Controlled browser fixtures complement the actual exploration/campaign runs. Overall assessment remains B+; human campaign pacing and physical Safari are unverified. Authored combat set pieces are separate follow-up work.

Final local evidence: 114 engine checks, four sprite/art and four policy checks, 288 guardian probes, sixteen Chromium browser suites and unchanged 96-run canary outcomes 25/32, 20/32, 13/32. Eight extra directed campaigns complete every vow plan four times (6 wins/2 defeats), with zero stalls. Source 403,219 bytes (393.8 KiB); exact-head CI/publication evidence belongs to the release PR.


## Treasure expansion — 0.20.0

Twelve additions, unique identity art, guarded-cache acquisition, route finds, two tactical consumables, saleable historical treasures, discovery/ownership filters and equipment tradeoffs are implemented. Existing slots, world graph, guardian rules and v2 saves are preserved. Detailed acceptance and audit evidence are in REQUIREMENTS.md and BALANCE.md.

The 96-run Auto canary passes with 25/32 Wanderer, 14/32 Delver and 13/32 Ironbound victories, zero stalls; Delver is lower than 0.19.0 and is not evidence of unchanged balance. Eight acquisition-directed runs collect every addition (7 wins/1 defeat), while eight companion-directed runs fulfill all plans (7 wins/1 defeat). Those planners use map metadata and do not estimate human choices or win rates. Auto Gear favours existing offensive caster weapons in this sample; the new healing/artillery relics are manual tactical alternatives, not certified universal improvements. Physical Safari and human pacing/recognition remain outstanding; the overall assessment remains B+. Exact-head three-browser/publication evidence is in the release PR.


## Six-slot review — 0.21.0

The two-slot model forced boots, charms and shields to replace armour. The expanded loadout addresses that cost while avoiding unrestricted stacking: auxiliaryAC≤1, movement−1…+1, each ward/healing uses the strongest source. Aegis moves to off-hand and drops AC 3→1; Charm losesAC. Bows/axe/staff use both hands; swaps and Auto Gear preserve physical copies/capacity. Legacy migration is locally prepared and validated before active state/timers change, including full-bag bow/Aegis recovery.

Twelve new equipment identities support the slots: six early ordinary options and six relics at shared chapter sources. Each has unique art/lore/tactics. The two-column loadout stays inside the existing Party screen with 44px controls. Extra slot value receives discounted, capped encounter scaling rather than fullprice scaling.

New source/regression/browser checks cover migration, malformed imports, full-bag conservation, hand conflicts, nonstacking effects, bounded allocation and every-route acquisition. Exact-head cross-browser/publication evidence belongs in the release PR; measured campaign results are recorded in BALANCE.md. Overall grade remains B+ pending physical Safari and human full campaigns.

Build 0.21.0 runtime: **438,595 bytes (428.3 KiB)**, +13,215 bytes over 0.20.0; one offline HTML file, no added runtime dependencies. The 350 KiB target remains soft. CI job timeout is 30 minutes for the expanded UI/campaign work; test counts, per-run limits and balance thresholds remain unchanged.

Build 0.21.0 local acceptance: 134 engine/controller checks, four sprite/art checks, four policy checks, 192-floor sources, 288 guardian probes and 18 Chromium browser suites pass. The unchanged 96-run canary gives wanderer 29/32, delver 20/32, ironbound 18/32 victories, zero stalls. Eight extra companion campaigns win 8/8 and fulfill every plan four times; eight treasure-directed campaigns win 7/8 and each acquire all 24 recent additions. These directed policies are separate from difficulty estimates. Exact-head CI/Pages/live evidence is recorded in the release PR.


## Equipment-decision review — 0.22.0

Six slots created useful combinations but obscured effective protections and overlapping items. Per-hero summaries now report actual movement/range, four gear wards and healing, with explicit nonstacking/cancellation explanations. Seen patrol reports connect that information to possible threats before combat; they do not compose enemies or leak unseen nodes.

Three existing single finds become authored one-of-three lockboxes with class and hand comparisons, a nearby deferral action, full-bag safety and map-based once-only save recovery. First options preserve previous rewards and generation consumes no extra RNG. Alternative options are practical equipment rather than extra relic grants. Legacy generated floors are left intact.

The browser review caught two useful edge cases: duplicate synthetic cache fixtures were correctly rejected by the new chapter/uniqueness validator; pending-choice focus after Continue needed a guarded microtask so the title’s inert state could clear before focusing the non-claim heading. Fixture imports now assert success, and actual reload/focus/Enter/deferral flows are checked. Existing chapter-teleport fixtures strip chapter-bound offers rather than relaxing production validation.

Visually reviewed the 440×780 reward, scouting and overlap panels. They scroll inside existing Party, with 44px controls and decorative individual artwork. All-option campaigns supplement the first-option canary; neither substitutes for physical Safari or human balance testing. Overall grade remains B+.

Final interaction review also found that a selected bag item could be equipped by bubbling a click from the new overlap disclosure into the hero card. Read-only summaries now stop that assignment path, with a browser regression that compares inventory/equipment before and after reading. Successful claims focus a visible status message; the four-size suites check its viewport position.

Build 0.22.0 local acceptance: 142 engine/controller checks, four sprite/art and four policy checks, 192-floor source audit, 288 guardian probes and all 19 Chromium browser suites pass. The new decision flow also passes local Firefox at all four device sizes. Unchanged 96-run canaries: wanderer 29/32, delver 20/32, ironbound 18/32 victories, zero stalls. Companion-directed 8/8 and treasure-directed 7/8 victories; all eight vows and all 24 recent item additions acquired across their respective samples. Three varied-choice campaigns win 3/3 and acquire all nine cache alternatives. These diagnostic policies are not human difficulty estimates. Runtime 451,387 bytes (440.8 KiB), +12,792 bytes over 0.21.0; soft size policy, offline single file and overall B+ remain. Exact-head three-browser and Pages/live evidence is recorded in the release PR.


### Placement review — 0.23.0

A 1,024-floor seeded baseline found zero unreachable enemies (1,792 encounter placements). Adversarial corridor inspection nevertheless reproduced a real defect: pathfinding treated the automatic exit as an ordinary bridge, and pinned coordinates bypassed reachability checks. Live spawns also selected by proximity without connectivity, and could overwrite cleared keys while leaving the replacement cleared.

Placement now blocks stairs, relocates unsafe pinned enemies, and checks current unlocked connectivity for dynamic spawns. Legacy repair preserves cleared records/reward drops and runs before active-save mutation. Old saves lack entrance coordinates, so repair uses the current side; on stairs it chooses the largest neighboring component. New independent tests cover 2,048 generated floors and targeted counterexamples. Overall grade remains B+; publication evidence belongs in the release PR.


### Tactical chapter review — 0.24.0

The preceding access fix proved enemies could be reached but did not give random patrol sites a tactical purpose. Patrol placement now scores existing reachable ground by formation: bow lanes, junctions, narrow controller posts and treasure approaches, with spacing when possible. This changes campaign paths and therefore seeded battle RNG; evaluate the full canaries rather than claiming a controlled difficulty comparison.

Eight authored ordinary arenas add optional terrain objectives to existing fights. Raising barricades, opening sluices/vents and kindling vigils changes cover, embers or sanctums with one hero action per numbered station. The same terrain serves enemies; previewing exact edited tiles and explicit confirmation makes the tradeoff reviewable. They are secondary battlefield goals, not alternate win conditions or extra loot. Old floors keep their descriptors. Existing guardian phases, crown gates and composition budgets remain.

New rule checks exercise all sixteen actions, shared effects, once-only/action costs, invalid/stale confirmations, Auto opportunities and atomic legacy/portable handling. Browser coverage exercises remote rejection, real movement, exact previews, keyboard/touch confirmation, Tactics, weapon victories and Continue at phone, short landscape, tablet and desktop sizes. Final balance/cross-browser/publication evidence belongs in the release PR. Overall B+ remains; no claim of AAA production, human pacing certification or physical Safari testing.


### Exploration review — 0.25.0

The first shortcut prototype opened only single wall tiles; paired generation probes showed negligible benefit on real maps. Bounded short corridor connections now preserve every vault/secret seal and save at least eight steps locally when present. Most existing floors already have useful loops, so these rare connections are not presented as a campaign-wide speedup.

The larger source of avoidable travel was objective placement: scouts were placed far from camp independently of the key outing, and the Gallery assigned ordered names by spatial separation rather than the required walking circuit. New scout sites combine the key/escort outing; new name labels minimize the complete circuit across the same selected sites. Old saves keep their labels. Independent paired probes report actual graph costs, not human play time.

Departure feedback uses the existing waystation, crown choice and Chronicle. It lists known unclaimed ground finds and sensed caches, with no hidden cache contents. Returning is explicit, preserves chapter/council/reward records and does not commit an ending. The final fate remains necessary to finish. This adds a practical recovery route for full bags or overlooked known treasure. Full browser/save/campaign/publication evidence belongs in the release PR. Physical Safari and human pacing remain unverified; grade stays B+.

CI caught the 2,048-map audit exceeding its existing 15-second execution limit on one runner. Numeric bounded path searches, reused pre-door reachability, tactic-specific scoring, cached loot anchors and one-pass objective selection remove redundant work. The complete audit now takes about 7.9 seconds locally; the 15-second gate and map count remain unchanged. Local 256-map comparisons preserve passage selections, placements, task labels and RNG states; paired route metrics remain identical. Final-head CI repeats all release gates.


## Bell Warden review — 0.26.0

The first guardian already had a rally interrupt and a generic once-only bloodied phase, but little stage-specific tactical identity, personalised aftermath or reward decision. Bound Watch/Broken Bell now frames a new one-charge delayed Last Toll. It consumes normal preparation/release turns, marks fixed ground, can be escaped or interrupted, and leaves the prior half-health effects intact. Low 1d4+1 damage and shared sanctums bound its cost; the unchanged full canary must still validate integration.

The bequest trades Fighter physical defence/movement against any-class control saves without giving both. New offline Choirglass art depicts five inscribed glass tongues inside a split silver bell frame. Council/vow reactions and persistent aftermath give the battle personal stakes without new bonuses. Existing drops/saves remain supported. The first guardian is the scope of this release; do not describe all bosses as redesigned or the overall game as AAA. Grade remains B+ pending human pacing and physical iPhone/iPad Safari evidence. Final test, balance and publication evidence belongs in the release PR.


Runtime for build 0.26.0: **484,417 bytes (473.1 KiB)**, +7,883 over 0.25.0. One offline HTML file, no runtime dependencies or downloaded assets added. The 350 KiB target remains soft.


## Ash Cantor review — 0.27.0

The second guardian had a readable channel but a generic bloodied stat bump and noninteractive fire shift. Measured Hymn/Last Procession now changes its positioning: approach before casting or strike in reach, with ordinary action and reaction rules. Two optional braziers reuse deliberate one-action field interactions; either lane can be cooled before or after half HP, and its quenched tiles stay cool. Council shelters and spell dangers remain distinct.

The choice of offensive Covenant or off-hand healing/ember censer creates a bounded build decision with one reward. Actual choir, road and companion history gives the aftermath personal consequences; no extra bonuses, quest progress or invented legacy decisions are granted. Old single drops and saved exploration remain compatible. The phone review identified a clipped Cancel label, now shortened with its full accessible name retained; previews describe future effects before commitment. The king/dragon remain separate future work. Overall B+ remains until human pacing and physical Safari evidence exist. Exact-head tests/campaigns and publication proof are recorded in the release PR.


Runtime for build 0.27.0: **492,134 bytes (480.6 KiB)**, +7,717 over 0.26.0. One offline HTML file; no runtime dependencies or downloaded assets added. The 350 KiB target remains soft.
