# Detailed requirements — tactical-depth release

Baseline review: [REVIEW.md](REVIEW.md). Delivery order: [ROADMAP.md](ROADMAP.md).

## Product constraints

| ID | Requirement | Acceptance |
| --- | --- | --- |
| LIMIT-01 | Keep runtime HTML, CSS, SVG, data, and JavaScript in `index.html`, at most 358,400 bytes. | Check file bytes; no external scripts or runtime packages. Optional font requests retain system fallbacks. |
| LIMIT-02 | Preserve four classes, three oaths, eight world nodes, six-floor routes, and existing valid version 2 saves. | Regression checks plus legacy-save round trips. New campaign fields default safely. |
| LIMIT-03 | Preserve iPhone safe areas, pinch zoom, minimum 44px main buttons, and a fitted board/control shell. | Chromium touch checks at 440×956/780/680, 956×440/350, 390×844, plus desktop. Distinguish emulation from physical Safari testing. |
| LIMIT-04 | Keep game engines independent of the DOM. | Review new engine methods; terrain and enemy descriptions return plain data. |

## Reliability and rewards

| ID | Detailed rule | Acceptance |
| --- | --- | --- |
| SAFE-01 | Validate save envelope, bag, party IDs/classes/abilities, numeric values, equipment references, map dimensions/tiles, coordinates, and persisted set-like arrays before changing live state. Bound dimensions and collection sizes. | Malformed imports return false and leave the active party, bag, map, combat, and timers intact. |
| SAFE-02 | Prepare revived heroes, campaign, and exploration in local variables before committing them together. Optional old fields may be absent. | A valid old snapshot loads; a failed preparation does not partially replace state. |
| MAP-01 | A newly generated hidden cache must not connect the entrance side to any floor behind a locked door. | Open all cache tiles in a flood-fill probe while blocking doors; the exit remains inaccessible. |
| SUP-01 | Ration pickups preserve each floor's configured quantity; old pickups without an amount count as one. | Generated and fallback quiet routes grant two supplies, and a legacy pickup grants one. |
| FLOW-01 | Victory while standing on stairs resumes the exit transition after pending level choices are confirmed. Resolve any deferred loot, cache, or event underfoot before exiting. | No extra step off and back is needed; chapter reward still occurs once; a pending level screen is not skipped. |
| PROG-01 | Reaching a nonfinal chapter exit grants each hero `100 + 50 × floor tier` XP once. Record the completed floor before saving. | Revisiting the stairs or reloading a town save cannot grant the reward again. Pending level choices persist. |
| PROG-02 | Legacy saves infer previously completed floors from their route and current town state. Do not retroactively invent their historical rewards or contract success counts. | Old town/route saves do not duplicate chapter XP. New fields survive portable saves. |
| BAL-01 | Reduce the price-based gear contribution to encounter budget from 0.5 to 0.12 per gold. Keep floor/level scaling, oath multipliers, and enemy caps. | An 80-gold upgrade adds less than 10 budget rather than 40; later floors still increase the budget; campaign results are reported without claiming exhaustive balance. |

## Learn and aim

| ID | Detailed rule | Acceptance |
| --- | --- | --- |
| UX-01 | Provide How to Play from the title screen and Tactics in combat through the existing campaign-strip button. Explain turns, movement, signatures, friendly fire, terrain, supplies, and goals. | Both entry points open a scrollable sheet with a reachable close button; no permanent HUD row is added. |
| UX-02 | Tactics shows living enemies' names, HP, AC, weapon range, remaining spells, statuses, and role descriptions. Roles describe capabilities, not guaranteed future actions. | Content derives from current combatants and stays escaped. No inaccurate exact-intent promise. |
| UX-03 | Opening Tactics cancels the queued turn without spending it; closing resumes normal enemy/skip/Auto flow once. | No duplicate actions, no lost turn, and an unchanged actor while the sheet is open. Restart/load/completion clears it. |
| AIM-01 | An area spell's first board tap stores an aim point, highlights the blast, and reports living allies and foes caught. It consumes neither action nor charge. | Engine state unchanged after first tap. Preview works without hover. |
| AIM-02 | A second tap on the same tile or the Confirm cast button commits the spell. A different tile changes aim. Action/mode/spell/actor/combat changes clear stale aim. | Charges decrement exactly once, friendly fire is disclosed, and stale aim cannot cast on a later turn. Auto still rejects allied collateral. |

## Battlefield rules

| ID | Detailed rule | Acceptance |
| --- | --- | --- |
| FIELD-01 | Define Crypt, Catacomb, and Tomb layouts as small data registries on the existing 10×10 board. Terrain does not block movement or occupy spawn cells. Plain constructor defaults remain valid. | All combatants spawn on plain in-bounds cells; every terrain tile has a known kind. |
| FIELD-02 | Cover grants +2 AC against ranged weapon attacks. Melee and spells ignore cover. | Same rule for heroes and enemies, including attack preview; ranged-in-melee penalty still applies. |
| FIELD-03 | At the end of a living actor's turn, sanctum heals up to 3 HP; ember ground deals 2 damage and can knock the actor out. Apply once per turn and log it. | No healing above max HP, no effect after death, correct victory/loss handling. |
| FIELD-04 | Render terrain with distinct colours, visible symbols, accessible cell labels, and explanations in Tactics. AI prefers healing when hurt and penalises embers without preventing movement. | Rules remain legible on the fitted phone board; AI checks use terrain in positional scoring. |

## Optional goals and guardians

| ID | Detailed rule | Acceptance |
| --- | --- | --- |
| QUEST-01 | Three contracts: win four battles (Sunshard staff); discover two caches (Lantern Mantle); succeed at three event checks (120 gold and two supplies). | Progress in Chronicle; fallback/failed event choices do not count as successful checks. |
| QUEST-02 | Pay each contract once, automatically at the triggering outcome, using unique persisted IDs. Rewards use the normal bag/equipment rules. | Rechecking, saving/loading, and revisiting an event cannot duplicate rewards. Older saves start successful-check progress at zero. |
| BOSS-01 | Replace one convergence encounter in the Catacombs with the Bell Warden and one in the Descent with the Ash Cantor. Retain the Crypt Lord finale and existing route graph. | Each new guardian is a boss lead, with a limited retinue budget, distinctive spells/role text, and an HP display. |
| BOSS-02 | Guardian bloodied phases are registry data. A living guardian at half HP or less gains its specified buff and at most its specified reinforcements once. | Phase cannot repeat; ordinary enemies do not gain phases; Crypt Lord regression remains valid. |
| END-01 | Chronicle and ending show contract completion and chapter progress. Escape still requires the crown and defeated Crypt Lord. | Correct state after reload and a full-run victory scenario. |

## Acceptance record

All in-scope feature requirements are implemented. Verification used the actual inline script rather than a separate game implementation.

| Requirements | Implementation and evidence |
| --- | --- |
| SAFE-01/02 | `validSave` bounds and validates the full snapshot; `applySave` prepares local candidates before committing. Invalid bag, geometry, IDs, abilities, equipment, and unknown references are rejected while live references and queued timers remain unchanged. Legacy version 2 and storage-blocked round trips pass. |
| MAP-01, SUP-01 | Cache candidates cannot bridge to the sealed side. A 160-floor probe opens every cache and blocks doors; the exit stays gated. The existing 96-floor reachability check also passes. Both generators and the pickup handler preserve ration quantities, with a legacy default of one. |
| FLOW-01, PROG-01/02 | `resumeExplore` handles deferred underfoot content and stairs after battle or confirmed level-up. Chapter XP is recorded once. Tests cover exit timing, repeat entry, reload, pending choices, and older town saves without retroactive XP. |
| BAL-01 | An 80-gold upgrade adds 9.6 budget instead of 40; floor/level scaling remains. Twelve full-route simulations finish with victory or defeat, without stuck transitions or combat loops. |
| UX-01/02/03 | Title help and combat Tactics render rules and current enemy data. A queued enemy remains the current actor while Tactics is open; closing schedules one action. Chromium verified scrolling, returning to play, and the live Bell Warden sheet. |
| AIM-01/02 | First touch preserves charges/action and displays blast/collateral; confirmation spends one charge. Mode/actor changes reject stale aim. Chromium touch checks verified the warning and confirmation; counts also remain visible on the confirmation button in landscape. |
| FIELD-01/02/03/04 | Three themed terrain registries feed engine data. Tests cover plain spawn cells, cover odds, capped healing, lethal embers, and AI choices. Phone/desktop checks verified labelled terrain and the fitted board. |
| QUEST-01/02 | All three contract rewards are one-time across repeated checks and portable saves. Failed/skipped/repeated events do not inflate successful-check progress. Browser reload retained the claimed Lantern Mantle and journal state. |
| BOSS-01/02, END-01 | Both intermediate guardians guard their generated exit; their bloodied phases trigger once and summon one guard. Crypt Lord's two-guard phase and crown victory requirement pass. Successful runs exercised guardians, chapter progress, contracts, and the final ending. |
| LIMIT-01/02/03/04 | Runtime remains below 350 KiB, without external scripts or runtime packages. Existing campaign graph/classes/oaths remain. New engine methods return data and never touch the DOM. All six phone viewport scenarios and desktop pass with boss/spells/confirmation visible. |

Commands and results:

- Standalone runtime: **263,967 bytes** (about 258 KiB), below the 358,400-byte limit. No build step or runtime packages added.
- `node tests/regression.cjs`: **40 passed, 0 failed**, including 256 generator probes and the original 19 regressions.
- `node --check` on the extracted inline script: passed. Unique HTML IDs, local documentation links, final newlines, and trailing whitespace checked before publication.
- Chromium touch emulation: 440×956/780/680, 956×440/350, and 390×844 with simulated safe areas; exploration, boss combat, spell selection, and aim confirmation remain inside the viewport with 44px main controls. Creation/equipment menus and field notes remain usable; desktop sidebar preserved.
- Browser feature flow: help, chapter XP and allocation, Tactics pause, terrain, collateral preview/confirmation, invalid-import atomicity, contracts, portable/browser save recovery, and offline interaction after loading passed with no page errors.
- Twelve seeded controller-driven campaigns, one per oath/route combination: **6 victories, 6 defeats, 0 stalls, 0 page errors**. Wanderer: 4/4 victories. Delver: 2/4 victories. Ironbound Auto: 0/4 victories. This is a small diagnostic sample, not a statistical win-rate claim or assurance that Auto can beat every run.

Limits: physical iPhone and Safari are unavailable here; viewport checks use Chromium. The managed browser blocks direct `file://` verification; local HTTP play and offline interaction after loading were checked. Old saves retain their generated layouts, and historical successful checks cannot be reconstructed. Deferred roadmap ideas remain deferred.

Publication uses the standing automatic-publication instruction after these checks. The corresponding merge and GitHub Pages result are recorded in the implementation pull request and [deployment history](https://github.com/cisohabitat/Gold-Box/actions).

## Cross-device requirements

All dimensions below are CSS pixels. Device labels describe representative browser windows, not claims of hardware certification.

| ID | Detailed requirement and acceptance |
| --- | --- |
| DEV-01 | Fit exploration, boss combat, and an open spell menu within the current dynamic viewport with no page overflow or board/control overlap. Board height remains at least 160px in the supported matrix. Keep every main action and movement target at least 44×44px. |
| DEV-02 | Show a separately scrollable live roster at width ≥1200 and height ≥650. Otherwise expose Party & Log and Back to Game. At width ≥600 and height ≤600 put the board beside the controls, independent of pointer type. Never require a touch-only media query for desktop window fitting. |
| DEV-03 | Touch and mouse use the same action handlers. Combat exposes one tab stop in the labelled grid; arrow keys move focus with edge clamping, Enter/Space uses the selected action, and rendering preserves grid focus. A held activation key does not repeatedly spend actions. Keep visible focus and existing two-step area-spell confirmation. |
| DEV-04 | Rotation, split-view, and window resizing preserve hero HP, map position, battle round, and active engine. Crossing the sidebar breakpoint clears drawer state so an invisible overlay cannot block input. Exploration ignores typing fields and Alt/Ctrl/Meta shortcuts. Open menus block gameplay keys. |
| DEV-05 | Respect safe-area insets, allow pinch zoom, keep menus independently scrollable, use readable save input text, and disable animation/transitions for reduced-motion preference. Offline gameplay and portable v2 saves remain intact; no new runtime dependency. |
| DEV-06 | Reproducible browser checks cover iPad sizes 768×1024, 820×1180, 1024×768, 1180×820, 1024×1366, 1366×1024, 744×1133, 1133×744; split view 507×1024; desktop 1280×720, 1366×768, 1920×1080 and short 1024×600; plus the six existing phone scenarios. Check keyboard, menus, resize state, reduced motion, and page errors. Run the 40 engine regressions and keep runtime below 350 KiB. |

The optional `tests/devices.cjs` browser harness implements the device matrix. It requires a separately installed Playwright package and Chromium; these are development tools and are not game dependencies. Native Safari, Firefox, physical iPad/iPhone, and on-device performance remain manual verification limits.

### Cross-device acceptance record

DEV-01–06 are implemented. `node tests/devices.cjs` passes all 19 window sizes with exploration, boss combat, and spell menus; main target bounds are at least 44px and the board remains inside the viewport. Keyboard movement changes the actor's position, area-spell Enter previews without spending a charge, and Space confirms exactly one charge while focus remains on the grid. Crossing the drawer/sidebar breakpoint preserves HP, map position, and battle round and clears drawer state. Reduced-motion styling, scrollable creation/equipment menus, and page-error checks pass. The existing touch/save/offline browser flow passes, as do all 40 engine regressions. Latest runtime: **265,834 bytes**, below 358,400 bytes. No runtime packages or save migration added. Platform limitations above still apply.


## Reliability and live feedback requirements

| ID | Requirement and acceptance |
| --- | --- |
| LOG-01 | Exploration/combat show the two most recent events in a 40px strip beneath the board, with the full history in Party & Log. Latest entries update without rebuilding an unchanged live region; long lines truncate visually with full text in the history. The strip remains present in all 25 device scenarios. |
| READ-01 | Show current actor and movement/action readiness/spent state in combat; announce changes politely. Attack targets expose hit odds to keyboard users visibly on focus and in their accessible labels. Preserve area collateral preview/confirmation. |
| MODAL-01 | The active sheet traps Tab/Shift+Tab, isolates background branches using inert, blocks background clicks, and restores focus. Nested menus return to their parent. Manual action handlers cannot spend actions or advance the paused battle behind an overlay. Required event/level choices cannot be dismissed accidentally. |
| KEY-01 | Score chips, stat slots, backgrounds, inventory/equipment, and level choices support Enter/Space and visible focus. Rerendering preserves focus on the replacement control. Keyboard creation and equipment assignment reach actual game state, followed by a manual keyboard combat victory. |
| COPY-01 | Await Clipboard API success; handle async denial; check fallback return value; show Copied only after confirmed success. If both fail, leave the selected code available and explain manual copy. Portable import/export remains usable with browser storage blocked. |
| FIT-01 | Short landscape begins at 600px wide and ≤600px tall. Add 320×568, 375×667, 600×350, 744×500, 700×440, and 760×350 to the previous matrix. Preserve a board ≥160px high, 44px controls, and the live log. For very small portrait windows, allow the play panel to scroll rather than shrinking the board or clipping actions; controls must be reachable. This refines DEV-01's no-scroll fit for these exceptional windows. |
| RELEASE-01 | Commit engine/device/quality/flow/campaign scripts; run PR quality jobs on Chromium, Firefox, WebKit, and 36 seeded campaigns in Chromium. The auto-publisher must wait for all jobs on the tested head before merge, then verify Pages success. Keep runtime <350 KiB, no runtime packages, and v2 saves. Native Safari, physical devices, real hardware performance, and human full-campaign balance remain explicit manual limits. |

Local acceptance: all seven polish requirements pass the relevant Node/Chromium checks. Engine count is now 41; device count is 25. Campaigns: Wanderer 10/12, Delver 5/12, Ironbound 2/12 victories, with 0 stalls and 0 page errors. The latest standalone runtime is **273,891 bytes**. Earlier acceptance records describe their historical releases. Cross-browser and publication evidence belongs to the implementation PR; do not equate desktop WebKit automation with physical Safari certification.

## Epic campaign requirements

| ID | Requirement and acceptance |
| --- | --- |
| EPIC-01 | All eight world nodes have authored chapter titles, concrete objectives, and story text. Ilyra/Eren and the Sunless King connect the six-floor arc. Keep eight nodes/four routes and existing key/guardian/crown gates. |
| EPIC-02 | Each nonfinal waystation offers exactly two distinct, previewed plans. Choose once before descent; reject remote/out-of-town/repeated choices, disable departing until chosen, and persist choice plus reward together. Route councils have distinct writing and outcomes. |
| EPIC-03 | Persist validated decision IDs in v2 saves, derive bounded party story bonuses from them, and default old visited chapters without retroactive rewards. Current old-save waystations can still choose. Repeated loads cannot stack bonuses or pay rewards again. |
| EPIC-04 | Plans influence the final battle through explicit bounded engine inputs: king HP, retinue budget (never below 80% of baseline), a released reinforcement (never below one), and/or a three-turn opening ward. Never mutate BESTIARY templates; ordinary engine constructor behavior remains unchanged. Show contributions in the battle log/Chronicle. |
| EPIC-05 | Victory requires crown, defeated king, and final stairs, followed by an accessible choice of Break, Bind, or Wear. Show stakes before choosing. Choose the hero who bears the crown for Bind/Wear. Each yields a distinct epilogue recalling decisions and the named company. Reload before choosing returns to the decision; rejected/duplicate/out-of-context choices cannot finish a run. |
| EPIC-06 | Council, Chronicle and finale work with touch/mouse/keyboard, modal isolation, independently scrolling menus, 44px actions, and safe areas. Keep the recent log visible during normal play and the runtime under 350 KiB. |
| EPIC-07 | Add regression/browser coverage for all council options, migration, no duplicate rewards, final-battle effects, and all three endings. Full campaigns vary council plans and final fates. All existing engine/device/quality/flow checks and Chromium/Firefox/WebKit PR jobs must pass before automatic publication. |


### The Last Dawn acceptance record

EPIC-01–07 are implemented. Local checks pass: **48 engine regressions**, including all fourteen council options and migration/idempotency/final aid/endings; **25 device sizes**; existing keyboard/clipboard and touch/save/offline checks; and the new campaign UI check across phone, tablet, and desktop, exercising touch/keyboard choices, reward reload, Chronicle, pending-finale recovery, crown-bearer selection, and all three epilogues. All successful full-route simulations made five council decisions, reached the final tomb with the crown, and chose a valid ending. Across 36 varied-plan/oath/route runs: **17 victories, 19 defeats, no stalls or page errors**; Wanderer 10/12, Delver 6/12, Ironbound 1/12. Successful runs cover Break (6), Bind (6), Wear (5).

Runtime: **294028 bytes**, under 358,400. No new runtime dependency, world node, equipment slot, or save version. The release gate includes `tests/epic.cjs` in Chromium, Firefox, and WebKit. The final cross-browser/merge/Pages evidence is recorded in the implementation PR. Physical-device Safari and human full-campaign balance remain unverified.

## Restart, build identity, and balance gate

| ID | Requirement and acceptance |
| --- | --- |
| RESTART-01 | Restart opens a separate confirmation without changing the run or saved progress. Keep Playing receives initial focus; Enter on that safe default and Escape cancel. Rapid double clicks/taps must not reach the confirmation action, including at 600×350. Disable confirmation for the first 600 ms while keeping cancellation immediate; clear/invalidate that UI timer on close/restart/load. Confirming explicitly returns to title and preserves the latest browser Continue save. Explain that battles are not saved mid-fight and warn when no browser save is available. |
| RESTART-02 | Opening the dialog cancels queued combat callbacks; the current actor, actions and Auto setting remain unchanged. Cancel resumes at most one appropriate callback. Manual player turns retain aiming state. Restart/load/new game clear the dialog. |
| BUILD-01 | A single `GAME_BUILD` version populates visible labels on the title screen and gameplay header. The balance report records the same build. Show a title-screen link to the checked-in balance report. Keep current board/log/control layouts and 44px controls. |
| BALANCE-01 | Run 8 reproducible seeds over every oath/route: 96 campaigns with the actual controller/engines and a documented Auto policy. Record seed, outcome, depth, decisions, fate, resources, and per-battle/guardian pressure. Batch browser work between seeds and close browsers on failure. |
| BALANCE-02 | Write JSON/Markdown reports before failing checks. Fail on stalls/incomplete endings/page errors; Wanderer <50% wins; Delver outside 10–90%; Ironbound with no victory or >60% wins; inverted oath ordering; any route without a Wanderer victory; or >25% first-floor Wanderer defeats. These broad deterministic canaries detect regressions and are not promised human win rates. Report sample uncertainty and per-floor defeats. |
| BALANCE-03 | Commit readable results in BALANCE.md and upload per-build CI artifacts, including failed-run reports. Check that the criteria reject deliberately inverted, stalled, or inaccessible-route fixtures. Require the expanded balance job and existing cross-browser release jobs to pass before auto-publication. |


Restart/build/balance acceptance: **51 engine regressions + 4 balance-criteria checks** pass locally, as do the 25-size device matrix and keyboard/touch restart, double-click, cancel, paused-enemy, Continue, clipboard and build-label scenarios. Build **0.7.0** runs the 96-campaign balance sample without stalls: Wanderer **23/32**, Delver **15/32**, Ironbound **7/32**. Broad balance gates pass; guardian/route watch points and sample limits are documented in BALANCE.md. Runtime: **297,855 bytes**, below 350 KiB. Final cross-browser and publication evidence is recorded in the implementation PR.

## Presentation polish requirements

| ID | Requirement and acceptance |
| --- | --- |
| POLISH-01 | Distinct crypt/catacomb/tomb lighting and battlefield materials, improved token/terrain contrast, plus lightweight inline chapter and ending artwork. No external assets, runtime dependencies, or additional world nodes; stay below 350 KiB. |
| POLISH-02 | Show actual HP changes on the affected tile without obscuring inputs, and expose target HP/AC/range/attack odds through mouse hover or keyboard focus. Victory feedback must not block play. Existing accessible labels and recent/full logs remain authoritative. No presentation code may consume gameplay RNG or mutate engine state. |
| POLISH-03 | Add persistent player options for effects, high contrast, Auto pace, opt-in sound/ambience, and volume. Defaults keep sound/ambience off and existing pace. Respect OS reduced-motion preference even when effects are enabled; handle blocked storage safely. |
| POLISH-04 | Settings are reachable from title and Party & Log, isolate focus/input, pause queued combat, preserve manual aim, and resume exactly one appropriate loop. Escape/Close return to the opener or game. Restart/load/new game clear transient settings/feedback safely. |
| POLISH-05 | Synthesized audio requires a user gesture and preference opt-in, uses bounded voices, stops when muted/hidden/outside active play, and fails gracefully when Web Audio is unavailable. Audio never controls gameplay timing, RNG, saves, or action resolution. |
| POLISH-06 | Add meaningful browser checks for feedback/inspection, settings persistence, disabled effects/reduced motion, contrast, sound opt-in/failure, pause/resume and existing safe Restart. All engine/device/story/save checks and the 96-run balance gate must pass in the existing cross-browser release workflow. Document quality grades as scope-limited assessments and report remaining hardware/human validation limits. |

0.8.0 local acceptance: extracted script syntax, 51 engine checks, 4 balance-policy checks, 25 Chromium device sizes, existing quality/flow/epic checks, and new presentation/settings checks pass. The 96-run Auto balance gate reproduces Wanderer 23/32, Delver 15/32, Ironbound 7/32, no stalls. Runtime is 315,271 bytes. Cross-browser release/publication evidence is recorded in the implementation PR; physical Safari and human playtesting remain unverified.

## Sprite requirements (0.9.0)

| ID | Acceptance |
| --- | --- |
| ART-01 | All 19 figures use unique, valid 24×24 palette grids, explicit dot transparency, consistent keylines and distinct silhouettes. Invalid geometry and symbols fail validation instead of silently dropping pixels. |
| ART-02 | Every class/monster sprite reference resolves; the three guardians have dedicated identities and props. Existing hero save IDs remain valid; no combat-rule or RNG changes. |
| ART-03 | Round hero and square enemy frames distinguish sides beyond colour. Keep active, elite, guardian, awakened, dead, HP and status indicators readable without changing hit areas. |
| ART-04 | Roster and Tactics show the matching art beside names and stats. SVG is decorative, pointer-transparent in tokens, local/offline and bounded. Preserve accessible cell names, inspection, log and 44px controls. |
| ART-05 | Validate art integrity and actual board/portrait rendering at phone, short landscape, tablet and desktop sizes, plus all existing cross-browser and 96-run balance gates. Stay under 350 KiB and report physical-device/human recognition limits honestly. |

Local sprite integrity and four-size sprite browser checks pass, together with syntax and 51 engine regressions. Runtime: 324,527 bytes. Cross-browser and balance release evidence is recorded in the implementation PR.

Sprite release balance acceptance: 96 campaigns, Wanderer 23/32, Delver 15/32, Ironbound 7/32; no stalls, identical to 0.8.0. Final 25-size matrix passes after roster/portrait changes.

## Campaign, monsters and collections (0.10.0)

| ID | Requirement and acceptance |
| --- | --- |
| SAGA-01 | Add authored set pieces for every world node and immediate aftermath for the three required guardians. Foreshadow Astrax on both fourth-chapter routes; defeated-hunt status changes the king’s arrival and all three endings. Preserve route/council/final-crown gates. |
| ATLAS-01 | In-game Bestiary covers all 15 monsters with unique art, authored lore/counterplay, base stats, actual spell charges and habitats. Clearly distinguish base from elite/live stats and identify run guardian completions when known. |
| ATLAS-02 | Treasure page covers 15 registered items plus the story crown: exact effects including poison, class eligibility, value, true acquisition sources, carried count and equipped names. Crown has no passive equipment bonus. Ownership is current inventory, not permanent collection history. Keep title browsing independent of an abandoned run. |
| ATLAS-03 | Pages are reachable from title/notes/town, with internal tabs, search, relevant filters, empty results, 44px controls and independently scrolling content. Keyboard focus stays within the top overlay and returns correctly. Opening pauses combat; closing preserves aim and resumes exactly one appropriate loop. Cleanup covers load/new game/restart/title. |
| HUNT-01 | Hunt acceptance requires an active waystation, four completed chapters, current council decision and no pending allocation/menu. Explain risk/preparation/reward before accepting. It is optional and does not block the main campaign. Save the town before entering. |
| HUNT-02 | Wyrm has unique 24×24 art and a pure-engine fixed-area telegraph. Charge action spends no breath use/damage; next active turn consumes one use and hits the marked 3×3 area for 2d6, including allies. Amber tile marks, grid labels and boss text expose the warning. Moving out avoids damage; incapacitation delays release; a dead wyrm cannot release. |
| HUNT-03 | At half health while alive, trigger one phase: +1 attack, at most one replenished breath use up to max, and one skeleton. Repeated end checks do not duplicate recharge/summons or mutate templates. |
| HUNT-04 | Victory grants one +2 AC universal Eclipsescale Mantle, one supply and normal XP once, then reopens the same town before pending level choices. Persist completion and reward together; no invalid map-cleared markers. Legacy v2 defaults safely; malformed hunt flags reject atomically. Continue before an abandoned battle restores the pre-hunt town; Continue after victory retains completion. |
| SAGA-02 | War Axe has a real obtainable source in SHOP_STOCK. No invented sources in the collection guide. Keep runtime below 350 KiB, offline, dependency-free and v2-save compatible. |
| SAGA-03 | Require syntax, 58 regressions, sprite integrity, existing browser/device/story/save gates and new atlas/hunt browser scenarios across Chromium/Firefox/WebKit before auto-publication. Retain the 96-run main-campaign gate and disclose that its policy skips the optional hunt; record separate hunt evidence and physical/human limits. |

Local expansion acceptance: 58 regressions, sprite/policy checks, atlas/hunt browser flow and existing device/game-flow checks pass. Runtime 350,700 bytes. The 96-run required-path sample is unchanged at 23/32 Wanderer, 15/32 Delver and 7/32 Ironbound wins, no stalls; its policy excludes the optional hunt. The prepared level-four Wanderer hunt smoke sample is 12/12, with no stalls. Final tested-head browser and publication evidence is recorded in the implementation PR.

## Treasure artwork correction (0.10.1)

| ID | Acceptance |
| --- | --- |
| RELIC-ART-01 | All 15 items and the story crown have distinct identity-keyed illustrations; silhouette/path geometry must differ, beyond colour. No generic weapon/armour/potion fallback. Every registry ID resolves. |
| RELIC-ART-02 | Legendary designs reflect their lore: solar Dawnblade, hooked Nightglass, crystal Sunshard, lantern-bearing mantle, constellation Starweave, winged Eclipsescale, chained-sun crown. Provide larger 176px framed relic art without replacing readable names, exact rules or ownership. |
| RELIC-ART-03 | All artwork remains bounded, decorative, pointer-transparent, inline and offline. No duplicate SVG IDs/references, assets, animation loop, RNG consumption or rule/save changes. Verify phone/landscape/tablet/desktop layouts and existing atlas input/hunt recovery. Stay below 350 KiB. |

Local art/engine checks pass: 58 engine/controller regressions and 4 sprite/art checks. Runtime is 356,903 bytes of the 358,400-byte budget. Final browser, balance and publication evidence is recorded in the implementation PR.

## Campaign payoff requirements (0.11.0)

| ID | Acceptance |
| --- | --- |
| SAGA-04 | Bell Warden, Ash Cantor, Crypt Lord and Astrax wins show an illustrated, scrollable aftermath that cannot be displaced by XP log lines. Level allocations precede acknowledgement; movement remains blocked; touch/keyboard/Escape dismiss and resume stairs once. Reload clears transient panels while Chronicle reconstructs known guardian aftermaths from existing saved progress. |
| SAGA-05 | Both plans of every visited council produce distinct ending callbacks. Preserve Break/Bind/Wear, named bearer and hunt acknowledgement. Missing/legacy decisions produce no invented callbacks or rewards. |
| RELIC-04 | Eclipsescale retains +2 AC, any class, and reduces each damaging spell hit by 2 (minimum zero). Include enemy spells and allied area damage. Exclude weapons/terrain/poison/healing/status saves; equipment transfer and removal take immediate effect. Exact rules visible in atlas, hunt and inventory. Auto Gear prefers it over equal AC only. |
| SAGA-06 | Investigate difficulty using expanded deterministic oath/route evidence, compare a bounded Ash Cantor retinue-budget reduction against the same seeds, report guardian pressure and optional hunt separately, and keep balance thresholds unchanged. Do not claim Auto results establish human difficulty. Require 62 regressions, four sprite checks, policy checks, existing browser suites and new payoff suite on Chromium/Firefox/WebKit before automatic publication. Runtime <350 KiB; preserve graph, offline play and v2 saves. |

## Distinct route objectives (0.12.0)

| ID | Acceptance |
| --- | --- |
| OBJ-01 | Four authored goals, two per run: escort Warren scouts back to camp, read Gallery stones 1/2/3 in order, bring recovered Dawnblade to the Ossuary standard without consuming it, choose any two Pillared Road shrines. Placement is deterministic without RNG draws; camp/sites stay reachable before the vault, including fallback maps; preserve key/door/loot geometry. |
| OBJ-02 | Actual movement triggers progress; wrong-order names wait without reset. Progress survives encounters, events and pending levels. Require completion before chapter exit/town departure. Show named blue beacons through fog, concise HUD progress and full Chronicle instructions. Keep device fitting and 44px controls. |
| OBJ-03 | Shrine entry commits one choice: B +1 supply, R up to +4 HP/hero, M one spent spell charge/hero. Two distinct rewards maximum; never repeat, over-heal or exceed spell maxima. No additional XP, enemies or timer. Dawnblade is retained. |
| OBJ-04 | Preserve v2 codes and current legacy floors (no task retrofit or rewards). Persist partial and completed task state; validate malformed/unreachable/duplicate/out-of-order task data before touching active state. New route floors still generate objectives after a legacy load. |
| OBJ-05 | Require 66 engine/controller regressions, 256 generated/fallback objective layouts, new actual-movement browser suite across phone/landscape/tablet/desktop, all existing suites and full 96-campaign gate on the tested PR head before automatic publication. Completed fresh campaigns must finish two route objectives and a crown fate. Stay under 350 KiB and record Auto policy and hardware/human limits. |
