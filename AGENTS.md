# Contributor instructions

## Current size policy — user override for 0.14.0

The user clarified that **350 KiB is a soft target**, superseding earlier hard-cap wording in this document. Keep one offline HTML file and avoid unnecessary dependencies/assets. Report actual bytes and review growth for play value and device performance; do not fail a release solely for exceeding 358,400 bytes or invent a replacement hard ceiling. Historical byte measurements below remain historical. Save compatibility, accessible device fit, correctness and the full release gates remain mandatory.

## Scope and project shape

These instructions apply to the entire repository. Gold Box — Crown of the Sunless King is a single-file browser tactical RPG. `index.html` contains its HTML, CSS, data registries, engines, controller, and rendering. There is no build step or package manifest. The dependency-free regression suite is `tests/regression.cjs`. Keep the game playable by opening the file directly, including offline with system font fallbacks.

Read `README.md` before changing behavior. It describes the controls, architecture, save compatibility, and manual verification scenarios. The tactical-depth release is defined by `REVIEW.md`, `ROADMAP.md`, and `REQUIREMENTS.md`; preserve their acceptance rules when extending related systems. Keep those documents accurate when behavior or repository contents change.

## Publication preference

The user has authorized automatic publication for future requested changes to this game. Complete the relevant verification, keep README.md and AGENTS.md current, merge the finished changes into `main`, and verify the GitHub Pages deployment without requesting publication approval again. Apply any later user instruction that changes this preference.

## Architecture

- Keep `CombatEngine` and `ExploreEngine` independent of the DOM. The controller owns UI updates and transitions between exploration, combat, town, events, and level-up screens.
- Add content through the existing registries (`SPELLS`, `ITEMS`, `PERKS`, `CLASSES`, `BACKGROUNDS`, `BESTIARY`, `EVENTS`, `WORLD`, `OATHS`, `BOONS`, `SIGNATURES`, `TERRAIN`, `BATTLEFIELDS`, and `CONTRACTS`) where possible.
- Keep encounter tuning in `DIFFICULTY`, `ELITE`, and the progression tables rather than scattering new constants through the controller.
- Preserve the `WORLD` graph's reachable routes and procedural generation's key/door solvability guarantees.
- Follow the surrounding vanilla JavaScript and CSS conventions. Avoid introducing a build dependency for a change that fits the existing design.

## Saves and asynchronous turns

- Save data currently uses payload version `2`, the `GBS1:` prefix, and localStorage key `goldbox_save_v1`. These identifiers are distinct; do not assume the prefix or key describes the payload version.
- Preserve existing valid portable saves when changing serialization, or provide explicit migration handling. Keep storage failures recoverable through portable codes.
- Include pending progression choices when fixing save recovery; combat and events can both grant levels. Restoring XP and level alone does not restore an unspent allocation.
- Turn callbacks must belong to the current combat instance and turn. Prevent duplicate scheduling and invalidate stale callbacks on Auto changes, restart, load, and combat completion.
- Apply movement reactions consistently across manual movement and AI movement, including ranged retreat.
- Area damage affects allies as well as enemies. Automated targeting should account for that cost.
- Campaign state belongs to the controller. Apply blessing bonuses as hero data through `applyBoons`; engines should not read controller globals or manipulate journal DOM. Keep each boon unique and each waystation claim limited to one.
- Class signatures reset when a new `CombatEngine` is constructed and spend the actor's action. Boss phase reinforcements trigger once while a living Crypt Lord is at or below half HP.
- New campaign fields must default safely when loading version 2 codes from before the expansion. Older final-floor saves infer a defeated king from cleared encounter descriptors.
- Validate save input and prepare candidate heroes, map, bag, and campaign locally before touching the active run or cancelling its timer. Malformed imports must leave combat and UI state intact.
- Preserve supply amounts in both level generators and the pickup handler. New secret cache walls must not bridge the sealed side of a locked vault; test flood-fill with all cache tiles opened.
- Chapter XP is awarded once per completed nonfinal floor, before autosaving, and goes to every hero. Infer completed chapters for older saves without retroactively granting XP. Contracts pay once using persisted IDs; only successful event checks increment `successes`.
- Terrain is engine data. Cover affects ranged weapons only; sanctum/ember effects tick once at turn end, with death checked before healing. Plain `CombatEngine` constructor calls must remain supported for tests and extensions.
- Guardian phases live in bestiary `bloodied` data and are capped at two reinforcements. The two intermediate guardians are pinned by the generated vault exit. Keep the Crypt Lord/crown victory gate intact.
- Area spells use a transient aim tied to the combat instance, actor, and selected spell. First touch must not spend the action; confirmation must expose allied collateral even in landscape where the long hint is hidden.
- Tactics pauses queued combat and resumes one loop on close. Resolve deferred exploration exits after combat and confirmed level-up choices; do not require the party to step off and back onto the stairs.

## Review baseline and resolved defects

Review baseline: `a80cb6be43c7ab86feb4d88b7f786b07092518c4` on `main`, reviewed October 20, 2026. Four defects were reproduced using the actual inline script in a Node harness with DOM stubs:

1. **P1 — Lost level-up allocations on reload.** `resolveCombat` calls `render` (which autosaves) after granting levels and before `openLevelUp`. `saveState` omits pending choices; loading retains the level but loses its ability/build allocation. Event XP also autosaves before its allocation is confirmed.
2. **P1 — Duplicate Auto turn loops.** Auto on/off/on before the pending timer fires leaves multiple callbacks. A reproduced sequence acted with the same enemy twice and skipped the following enemy. Check `toggleAuto` and `beginTurnFlow`.
3. **P2 — Auto area damage ignores allies.** `_bestPointTile` scores only foes, while `castSpell` damages every living combatant in the blast. A reproduced Fireball killed three wounded allies surrounding one enemy.
4. **P2 — Archer retreat skips opportunity attacks.** `_rangedTurn` assigns the retreat position without `_provoke`, unlike `_casterTurn` and `_stepToward`.

The expansion addresses all four findings and includes regression coverage for each. Pending levels are stored on heroes until confirmation; turn scheduling uses `queueTurn`/`cancelTurn` with combat and actor identity checks; automatic area-damage targeting rejects allied collateral; archer retreat invokes `_provoke`. Casters now approach spell range before casting. Incapacitation is enforced in the engine as well as the UI.

Keep this history accurate when behavior changes. Prefer function names to line references because this single file changes frequently. The original review baseline describes the failures before these fixes, not current unresolved bugs.

## Verification and reporting

- Preserve the mobile viewport shell: use dynamic viewport height and safe-area insets without disabling pinch zoom. Keep the board and controls visible together; long menus and field notes scroll independently. Landscape touch layouts use a compact action grid beside the board.
- Main mobile buttons must remain at least 44 CSS pixels wide and tall. Check boss bars, long class signatures, and an open spell menu at reduced browser heights, not only a full-height device viewport. Do not hide game actions to make a layout fit.
- Keep the desktop roster/log sidebar and mobile **Party & Log** panel accessible. Close field notes on restart, load, game completion, and transition out of the mobile breakpoint; prevent exploration keyboard movement behind the open panel.
- Mobile layout validation covered 440 × 956/780/680 portrait, 956 × 440/350 landscape, and 390 × 844 with simulated safe areas, plus desktop. This was Chromium emulation; physical iPhone and Safari behavior remain unverified.

- Run `node tests/regression.cjs` with Node.js 18 or newer after behavioral changes. It executes the real inline script with DOM stubs and seeded randomness. Extend it for meaningful regressions rather than duplicating implementation details.
- Syntax-check extracted inline JavaScript after script edits. This does not validate browser APIs, rendering, or game flow.
- Use `python3 -m http.server 8000` for browser checks. Follow the relevant scenarios in the README, including narrow mobile layouts for UI changes.
- For save changes, check both portable codes and browser Continue, including a reload during pending level-up.
- For turn changes, check rapid Auto toggles, incapacitated actors, combat completion, and restart with queued callbacks.
- Distinguish static inspection, DOM-stub execution, and browser testing in reports. Expansion validation passed 19 regression checks (including 96 generated floors). Chromium checks covered save recovery, signatures, blessings, journal, and a 390-pixel viewport. Six seeded controller-driven campaign simulations produced one Wanderer victory and five defeats without page errors; this is not exhaustive balance testing.
- Report remaining failures and limitations plainly. Do not describe documented defects as fixed unless the implementation and verification support that claim.
- The tactical-depth acceptance record supersedes the historical 19-test/six-run baseline above: 40 checks, 256 generator probes, six phone viewport scenarios, and 12 seeded campaigns (six victories/six defeats, no stalls). These are DOM-stub and Chromium checks, not physical Safari or exhaustive balance testing. Keep `index.html` near the soft 350 KiB target, with no runtime dependencies.

## Cross-device maintenance

- Fit desktop, iPad (including split view), and iPhone to the current dynamic viewport. The wide roster breakpoint is `(min-width:1200px) and (min-height:650px)`; narrower windows use field notes. Keep CSS and the drawer breakpoint listener aligned.
- Short landscape layout applies at height ≤600px and width ≥600px for mouse and touch alike. Preserve the 44px main controls, independently scrolling menus, safe areas, and pinch zoom.
- Combat has a roving grid tab stop: arrows navigate, Enter/Space activates, and rerenders retain focus. Keep keyboard actions behind overlay guards and preserve two-step spell aiming. Ignore form typing and browser modifiers in exploration bindings.
- Run `node tests/regression.cjs` and the optional `node tests/devices.cjs` against a local HTTP server for layout/input changes. Browser tooling is not a runtime dependency. Report Chromium emulation separately from physical Safari/iPad/iPhone testing.


## Release polish and quality gate

- Keep the two-line `recentLog` visible in normal play; `drawLog` updates it only when recent entries change, alongside the full history. Do not spend all small-screen space on controls or hide the log again. Very small portrait windows may scroll the play panel; preserve a 160px board and reachable 44px actions.
- Maintain `turnStatus` movement/action feedback and keyboard-visible attack odds. Short landscape may shorten Signature/Log labels; preserve accessible names and all actions.
- All layered menus use focus isolation and inert background branches. Manual combat handlers also reject overlays. Preserve nesting (town → equipment/save, event → level), mandatory choices, focus restoration, and existing Tactics timer semantics.
- Custom score/slot/inventory/level controls use `keyboardControl` for Enter/Space and focus retention. Keep pointer and keyboard behavior equivalent; do not add a second activation through bubbling.
- Await Clipboard API results; try the fallback after rejection; report failure with manual-copy instructions. Never show Copied for an unconfirmed result.
- Before automatic merging/publication, require all Game quality PR jobs to succeed. The workflow runs all browser suites in Chromium, Firefox and WebKit, plus the 96-run release balance gate in Chromium. The publisher must inspect the exact tested head and verify Pages success after merge. This procedure does not imply configured branch protection.
- The local polish baseline passes 41 engine checks, 25 device sizes, keyboard creation/equipment/manual battle, clipboard success/fallback/failure, portable recovery with blocked storage, and touch/save/offline flow. The 36-campaign Auto sample yielded 17 wins/19 defeats with no stalls; physical Safari/hardware and human full-run balance remain unverified. Record final cross-browser workflow evidence in the release PR.


## The Last Dawn campaign

- Author campaign chapters and two-plan councils in `STORY`, and ending stakes in `CROWN_FATES`. Keep the eight-node/four-route graph. Each run encounters five councils before its sixth/final chapter.
- Store decisions by world-node ID in campaign state. `chooseCouncil` must require the active town and no pending level/menu, pay once, derive bonuses through `applyBoons`, and save choice and reward together. `enterDungeon` requires a council decision. Keep costs/benefits visible before choosing.
- Older v2 saves infer `legacy` decisions for prior visited nodes without rewards; the current old-save council remains available. Validate plan IDs and crown-bearer hero IDs before mutating a run. Do not stack story bonuses on load.
- `storyEffects` caps attack/AC/damage contributions at +2 each, opening wards at +2 AC for three turns, retinue reductions at 20%, and denied bloodied reinforcements at one. `prepareStoryBattle` changes spawned final-enemy data only; never mutate bestiary templates or make engines read campaign globals.
- Crown possession, defeated king, and final stairs all remain necessary. `openCrownFate` autosaves the pending finale, which Continue/import reopens. Only `chooseCrownFate` commits Break/Bind/Wear and the chosen bearer before ending the run. Preserve mandatory final-choice focus isolation and restart/load cleanup.
- Add `tests/epic.cjs` to the cross-browser release gate. Latest local engine suite has 48 checks, including all 14 council plans, old-save migration, idempotent bonuses, final aid, and three endings. The 36 varied-plan campaign diagnostic produced 17 victories/19 defeats, all endings, no stalls: Wanderer 10/12, Delver 6/12, Ironbound 1/12. This is Auto evidence, not human win-rate certification.

## Safe Restart, build labels, and balance reports

- `btnRestart` must invoke `requestRestart`, never `showStart` directly. Keep Playing is the safe initial focus. `cancelRestart` preserves the run and resumes one appropriate combat timer; `confirmRestart` explicitly returns to title and preserves the latest browser save. Opening/cancelling the dialog must not spend actions, reset Auto, or invalidate manual spell aim.
- Keep `restartScreen` in overlay guards and cleanup, including combat-loop scheduling. Prevent rapid backdrop taps from moving the dialog focus outside its safe default. Explain unsaved battle progress and unavailable browser storage accurately.
- Increment `GAME_BUILD` for releases that change the game. Populate all `[data-build]` labels from that constant; keep title and gameplay labels visible and record it in the balance output. Keep balance reports in the repository for maintenance; do not expose report links in the game or beside the README Play link.
- `node tests/balance.cjs` is the release balance gate (8 seeds × 4 routes × 3 oaths = 96 runs). `BALANCE_SAMPLES` accepts 3–50; `BALANCE_OUTPUT` selects its report directory. `tests/campaign.cjs` remains a 36-run quick check and exports the shared runner. Cycle final fates with `sample % 3` for expanded samples.
- `tests/balance-checks.cjs` verifies that broad canary criteria reject real regression patterns. Do not loosen thresholds simply to obtain a green release; investigate game behavior and the diagnostic policy first. Report Auto/no-shopping policy and sample limitations.
- CI runs the balance gate in Chromium and uploads `artifacts/balance/` even on failure. Keep generated artifacts out of source control, summarize reviewed evidence in BALANCE.md, and wait for all cross-browser quality jobs before automatic merge/publication.

- Restart confirmation arms after 600 ms. Cancel/load/new game/title must invalidate and clear the arming timer; an early confirmation is rejected. Keep this timing independent of the combat timer and retain the 600×350 double-tap regression in the device matrix.

## Presentation and preferences (0.8.0)

- Presentation must derive from actual HP/state; never consume gameplay RNG or mutate engine data. Keep overlays pointer-transparent, the log visible, and report runtime size against the soft 350 KiB target. Transient feedback has its own timer/token and clears on load/new game/title.
- Store player options under `goldbox_preferences_v1`, independently of v2 campaign saves. Defaults: sound/music off, normal pace, effects on, clean contrast off. Respect OS reduced motion even if effects are on; handle blocked storage and unavailable Web Audio.
- Audio is opt-in after a gesture, bounded to six effect voices and two ambient voices; mute/visibility/modal/title transitions silence ambience. Do not couple sound to action scheduling or random rolls.
- Keep settings in overlay guards, cleanup and focus isolation. Opening pauses combat; closing preserves manual aim and resumes one appropriate loop. Mobile settings return focus to Party & Log.
- Run `tests/polish.cjs` in the three-browser gate for persisted preferences, real disabled effects/contrast styling, audio opt-in/failure, focus, paused combat, HP feedback and blocked storage. Report emulation and deterministic Auto separately from hardware/human validation.

## Sprite art maintenance (0.9.0)

- `SPX` contains 26 authored 24×24 grids. Only `.` is transparent; all other symbols must exist in `PX`. `px` rejects invalid geometry/palette data. Keep keylines, lighting, and silhouettes consistent, and art within the square.
- Preserve sprite IDs used in hero saves. Every class and bestiary reference must resolve. Guardians have unique `bell_warden`, `ash_cantor`, and `crypt_lord` art; never alias them to ordinary enemies. Art remains independent of engine rules and RNG.
- Hero frames are round, enemy frames square; guardians have a diamond and awakened state frame. Preserve active/elite/HP/status indicators and pointer-transparent SVG. Existing names/labels remain authoritative; portraits are decorative. Keep larger Tactics portraits for tiny-board inspection.
- Run `node tests/sprites.cjs` for palette/geometry/reference/identity checks and `node tests/sprite-browser.cjs` for actual board/roster/Tactics rendering. Both are part of the three-browser gate. See SPRITE_REVIEW.md for review evidence, grading, and physical-device limits.

## Field Atlas and optional legend (0.10.0)

- Keep all monster lore in MONSTER_LORE, relic lore in RELIC_LORE and chapter set pieces in SAGAS. Bestiary and treasure rules/sources must derive from the actual registries. The atlas is a complete spoiler-bearing guide, not a discovery archive; ownership means current carried/equipped gear. Do not show abandoned-run ownership on the title.
- `codexScreen` participates in overlay guards, cleanup, input/focus isolation and combat pause/resume. Closing preserves manual aim and starts one appropriate loop. Restore opener focus after inert branches clear; mobile notes return to Party & Log. Keep internal navigation and 44px controls on all devices.
- Astrax is optional, unlocked at a waystation after four completed chapters and its council decision. Save the town before starting; `legendHunt` is transient combat state. Victory sets `campaign.hunt` and grants one Eclipsescale Mantle and one supply atomically, then reopens the same town before level choices. Never add null/non-coordinate hunt markers to explore.cleared. New games/import/title clear transient hunt state. Legacy saves default hunt=false; malformed nonboolean values reject before mutation.
- Starless Breath uses a pure-engine intent: one action marks a fixed area, next active turn releases it and consumes one charge. Death removes the displayed warning; incapacitation delays release. Preserve friendly-fire semantics and accessible danger labels. Bloodied spell recharge is capped at the existing max and occurs once, alongside at most one wyrm skeleton. Existing guardian counts remain capped at two.
- Keep dragon art unique and the core eight-node graph/crown gates intact. Hunt completion affects its reward and story acknowledgement, never bypasses the king. Item sources must be truthful; War Axe now belongs to SHOP_STOCK.
- Run tests/atlas.cjs in all three browsers, plus the expanded 58 regression checks and existing gates. The 96-campaign policy skips the optional hunt; report hunt samples separately. See CAMPAIGN_REVIEW.md for assumptions and unverified physical-device/human difficulty limits.

## Treasure identity (0.10.1)

- TREASURE_ART maps every item ID plus sunless_crown to its own illustration; relicArtwork accepts identity, never equipment slot. Do not restore generic slot pictures or silently reuse/recolour a silhouette. Legendary designs must reflect their authored lore. rp builds compact SVG paths without altering art or rules.
- Keep large relic-card art displays, readable names/rules/ownership, responsive scrolling and decorative pointer-transparent SVG. Art uses no external assets, SVG IDs/references, animations, RNG or game-state mutation. Review growth against the soft 350 KiB target.
- tests/sprites.cjs checks complete mappings and unique path geometry independent of colour; tests/atlas.cjs checks all 16 rendered IDs, seven relic displays, SVG bounds and phone/landscape/tablet/desktop fitting. See TREASURE_ART_REVIEW.md for the review and remaining physical-device limits.

## Campaign payoff (0.11.0)

- Guardian wins open `aftermathScreen` after rewards commit. Pending level choices take priority at z-index 90 over the aftermath's 85; acknowledgement/Escape resumes deferred exploration/stairs only after levels finish. Include it in overlay guards, town/council exclusions, import/title/new-game cleanup and focus isolation. Never replay or duplicate rewards. The panel is transient; Chronicle derives persistent guardian outcomes from cleared encounters/completed chapters/bossSlain/hunt after reload.
- `campaignEpilogue` must distinguish both plans of every council encountered, including Gallery, Catacombs, second fork and Deep Stair. Skip missing/legacy decisions; do not invent outcomes or grant retroactive benefits. Keep three crown fates and named bearers.
- Eclipsescale's registry `spellGuard:2` reduces each equipped wearer's damaging spell hit to a minimum of zero. Apply in the pure combat engine to single-target and area spells, including friendly fire. It never alters healing, weapons, poison, terrain or status saves. Equipment transfer/removal must immediately transfer/remove protection. Report absorption in combat and exact rules in gear/atlas/hunt descriptions. Auto Gear uses it only to break equal-AC ties.
- Run 62 engine regressions and `tests/campaign-payoff.cjs` alongside existing gates. The latter covers portrait/short landscape/tablet/desktop, level priority, movement/focus isolation, Escape, deferred stairs, town Continue and Chronicle persistence. It runs in all three CI browsers. Keep new panels efficient and offline; 350 KiB is a soft target; retain the visible two-line log.

- Campaign pacing tuning changes only the Ash Cantor encounter multiplier from 0.55 to 0.50; retain its full spells, stats, and once-only phase. Compare seeded outcomes and guardian pressure in BALANCE.md; do not compensate with unmeasured king buffs or loosen balance gates.

## Route objectives (0.12.0)

- `CHAPTER_TASKS` defines Warren escort, ordered Gallery names, Ossuary standard/Dawnblade and choosing two Pillared Road shrines. `placeTask` is pure and consumes no RNG; generated configs carry their chapter ID. Beacons/camp must be reachable before the vault, stay off loot, and not alter existing loot/door/key geometry. Cover procedural and fallback layouts. The overhead map is the playable renderer; unused first-person drawing was removed for payload space. Preserve the shared map palette/shading and movement APIs.
- `ExploreEngine.task` stores id/start/sites/used/done. The controller advances it after noncombat entry and deferred combat/event/level exits. Escort/standard require return to camp; Gallery later names never consume/reset progress. Dawnblade remains owned. Shrines commit on entry and pay at most two distinct once-only benefits: +1 supply, up to +4 HP/hero or one spent spell charge/hero (capped at max). No objective XP or new encounters.
- Gate chapter exit and town departure on objective completion. Show progress in the main objective and full instructions in Chronicle; blue labelled beacons are known through fog without exposing enemies/geometry. Preserve all existing controls and visible log.
- Serialize task inside existing v2 exploration data. Missing/null task means the legacy current floor remains ungated; never retrofit sites or rewards. New floors receive tasks normally. Validate IDs, cardinalities, unique bounded indices/coordinates, ordered names, reachable floor camp/sites, booleans and completed/town state before mutating a run. Rewards and used flags autosave together.
- Run 66 regressions (including 256 objective layout/fallback probes), four-size `tests/objectives.cjs`, all existing suites and 96 real controller campaigns before publication. Successful fresh campaigns must complete both route objectives; document the objective/shrine policy. Existing synthetic chapter-skip fixtures explicitly mark their task complete, while the new suite and full campaigns use actual movement. No balance-threshold loosening.

## Guardian channels (0.13.0)

- Bestiary `channel` marks interruptible War Chant/Cinderburst only. Starting spends the action, not the charge; next active turn releases once. Damaging weapon/reaction hits interrupt and spend one charge; misses, magic and passive damage do not. Incapacitation delays; death clears intent. Ordinary casters remain immediate, wyrm breath uninterruptible. No intent is persisted in exploration saves.
- Damage warnings derive from live intents with fixed coordinates; buffs never paint damage tiles. Keep compact boss labels, accessible spell/next-turn labels, caster outline, inspection and Tactics counters consistent.
- Auto escape uses reachable movement with opportunity/Guard reactions, preserves the action and stops on death. Terrain scores discourage moving into warned tiles on either side. No extra timer or loop.
- Astrax base HP is 46; Starless Breath is 3d6. Retain charge/phase/summon caps and Eclipsescale protection. Prepared hunt Auto wins are accessibility smoke checks, not evidence of a hard encounter.
- Require 70 regressions, sprite/policy checks, `tests/guardians.cjs`, all existing browser suites and unchanged 96-campaign balance canaries. Cross-browser exact-head CI and successful Pages/live verification precede automatic publication. Physical Safari and human full-run testing remain outstanding.

## Manual-play confidence (0.13.1)

- Commit successful exploration equip/unequip, Auto Gear and healing with `autosave()` before returning from the action, while Party may still be open. Save HP, equipment and satchel together; do not change v2 shape or claim success if browser storage is unavailable.
- Full-HP healing must consume neither potion, action nor dice roll. Both exploration and combat handlers enforce this; the combat menu disables/labels unusable healing. Fury is unaffected.
- `CombatEngine.turnPreview` reads the current order without mutation/RNG, skips dead units, retains incapacitated turns and reports actual round wrapping. Tactics displays up to twelve entries; predictions may change after Wait/summons. Open it at scrollTop 0 with a sticky top Return button and preventScroll focus; never jump past threats to a bottom close button.
- `movementRisk` shares opportunity-attack eligibility with `_provoke`. Marker/label/inspection data must respect used reactions and incapacitation, fixed blast coordinates and ember end-turn damage. Markers are decorative and do not prevent legal risky moves, modify combat, or add HUD height. Do not present forecast as a damage guarantee.
- Require 75 engine checks, all prior suites, new `tests/confidence.cjs` on each CI browser and unchanged 96-campaign canaries. The new suite reloads from actual inventory interactions before modal close. Keep grade evidence current; do not turn test counts into automatic letter-grade upgrades.

## Guardian arenas, relic builds and actor recovery (0.14.0)

- `GUARDIAN_ARENAS` maps guardian encounter lead IDs to authored `BATTLEFIELDS` entries. Ordinary encounters retain their theme and plain/null constructor calls remain valid. Terrain uses existing cover/sanctum/ember rules for both sides; do not add impassable paths or block spell line of sight implicitly.
- Arena `shift` data applies only to the matching living guardian's existing once-only bloodied phase. Never mutate templates, grant an extra action or deal immediate terrain damage. End-turn ticks remain authoritative; descriptions warn of the phase before it occurs.
- Campaign-aware `applyCouncilArena` stays in the controller. Valid plans may add bounded sanctums, tracked in transient `arenaShelter`; those cells survive the phase shift. Legacy/other plans grant no new aid. Keep support previews, logs and Tactics truthful. No new saved rewards or schema.
- Lantern's `emberGuard:2` protects only terrain embers; it also affects terrain scoring/risk warnings. Starweave's `controlWard:2` adds to saves against spell status/debuff effects only. No poison, attack or damage-spell protection. Eclipsescale retains its per-hit damage ward. Read equipment at use time, including after old-save load or a swap.
- `itemRules`, `ITEM_TACTICS` and `gearComparison` expose exact passives, replaced-item tradeoffs and class locks. Do not imply weapon bonuses amplify spells. Auto Gear still prefers spell protection at equal AC; manual contextual choices may differ.
- A hero killed by a movement reaction or its own spell must yield to the next living unit automatically. Use `beginTurnFlow`/the existing scheduler; keep exactly one timer and check terminal combat before advancing. Dead units must not receive enabled action controls.
- Require 84 regression checks, sprite/policy checks, 288 scripted arena probes, all existing browser suites and new `tests/arenas.cjs`, then the unchanged 96-campaign canary and exact-head cross-browser CI before automatic publication. Scripted boss/retinue priorities and fixture gear are not human playtests or acquisition evidence. Shared VM harness lives in `tests/harness.cjs`.

## Patrol formations and defeat evidence (0.15.0)

- `PATROL_TACTICS` is data; `patrolRole` classifies current kit, `encounterTactic` derives legacy defaults and `deploymentTactic` chooses a truthful display/deployment for the actual group. Bosses ignore patrol profiles. Lone units get no formation; groups missing their promised specialist fall back to Split Watch.
- Role packets come only from the descriptor pool, must be affordable without slack and respect the enemy cap. Elite selection reserves the other role's base cost. Remaining composition retains existing budget/slack rules and stats. Do not force unaffordable specialists or add hidden difficulty multipliers.
- `patrolPositions` uses unique in-bounds cells away from occupied party cells, with a bounded fallback. Front/rear positions differ by pattern; normal five-argument CombatEngine construction and guardian deployment remain supported. No RNG in classification/deployment.
- Optional `tactic` metadata round-trips in existing v2 descriptors. Known IDs only; malformed IDs reject before active state/timer mutation. Old codes without the field derive from their original pool. No schema bump or map/reward changes.
- `battleReport` is transient engine evidence: record actual party HP loss before subtraction, clamped against HP remaining and after wards. Friendly spell loss is a subset, not a second damage category. Include normal/reaction weapon strike attempts, actual skipped Sleep/Hold turns and first fall. Do not parse truncated prose logs or change gameplay RNG/state to produce advice.
- `defeatSummary` returns facts and at most two grounded suggestions; unknown/empty evidence must say so. The controller renders with textContent, keeps feedback ahead of run totals, opens at scroll zero with visible heading focus, and clears it on new run/title/win. Do not add a retry/save-recovery promise or expose maintenance reports.
- Require 92 engine checks, sprite/policy checks, the existing 288 guardian scenarios, all thirteen browser suites including `tests/patrols.cjs`, unchanged 96-campaign canaries and exact-head three-browser CI before automatic publication. Report actual bytes under the soft size policy and distinguish scripted evidence from human testing.


## Enemy ecology (0.16.0)

- Bestiary now has 21 types: 17 regular enemies plus four guardians, and 26 unique SPX grids including heroes/banner. Preserve existing IDs/art and all guardian retinue pools. New ordinary enemies enter staged WORLD pools; generated legacy descriptors are never retrofitted.
- Sentinel `shieldAura` gives other adjacent allies +2 weapon AC once, never self or stacked. Incapacitation/death disables it. Use `weaponWard` consistently for normal/reaction strikes and `attackPreview`; spells bypass it. Surface live protection in grid labels and Tactics.
- Stalker `leap` is once per battle, up to four tiles to a free in-bounds square beside a foe. Spend movement; preserve normal departure/Guard reactions, stop on death and spend the normal attack action. AI uses it when unengaged; no extra action or timer.
- Wisp `deathBurst` creates one transient fixed 3×3 echo due at the start of death-round+2. Every unit gets a full intervening round. `_burstTick` runs only on initiative wrap, once per due echo, for 4 spell damage to both sides with Eclipsescale and actual-loss reporting. Skip newly dead actors; chained wisp deaths get their own later deadline. Terminal combat clears echoes. Labels/log/Tactics state the exact round; Auto/risk use existing `dangerAt`. No persisted combat state.
- Silence is a two-active-turn debuff with Wisdom DC13 and Starweave control saves. Block spell actions/usable lists without spending charges; retain weapons/potions/signatures. Pending channels postpone until expiry. Enemy hush has two base charges; normal elite spell-charge rule applies.
- Grave Siphon restores one wounded ally within three tiles (including caster), capped by three HP, actual post-ward HP lost and missing HP. Never heal from overkill/absorbed damage. Three base uses, range four, 1d4+1 damage.
- Chain Hook has two base uses, range four, 1d4 damage and one free-square pull toward caster for surviving targets. Forced movement spends neither target move nor action and triggers no movement reactions. No occupied/blocked/out-of-bounds destination; terrain still resolves on turn end.
- Keep 102 engine regressions, four sprite and four policy checks, 288 guardian scenarios, all fourteen browser suites including `tests/enemies.cjs`, unchanged 96-campaign canaries and exact-head Chromium/Firefox/WebKit CI before publication. Preserve v2/import atomicity, visible log/build, 44px controls and the soft size policy. Record actual bytes and human/device limitations.


## Arrow and spell presentation (0.17.0)

- CombatEngine records only transient resolved-action metadata in `visualEvents`: monotonic seq, copied origin/target coordinates, kind, spell ID and weapon hit/miss. Bound the buffer to 24. No DOM, preferences, extra dice, gameplay mutations or saved fields in this event path.
- Accepted ranged weapon attacks/reactions emit arrows on hits and misses; melee emits none. Accepted spells emit once, with source/target captured before damage/pulls. Preview, failed actions and channel preparation emit none; release emits normally.
- The controller’s pointer-transparent, aria-hidden SVG layer sits beside the board so its children survive `renderCombat` rebuilding cells. Read events by seq once per combat, using actual cell centres. Keep six effects maximum and at most six cleanup timers; cleanup at 720 ms. Never delay damage, input or the existing combat scheduler for animation.
- Spell families use distinct shapes and colours, with a pulse for self-centred casts. Misses glance beside the target. The log/HP remain authoritative; terminal combat may clear a last-shot effect when its result opens.
- Effects Off and OS reduced motion suppress spawning and replay; turning them back on must not replay old shots. Clear on modal opening, resize, hidden tab, combat change/exit, load and title. Cleanup timers are independent of turn/cue timers and must be cancelled when cleared.
- Require 106 engine checks, sprite/policy checks, 288 guardian scenarios, all fifteen browser suites including `tests/projectiles.cjs`, unchanged 96-campaign canaries, exact-head three-browser CI and Pages/live verification. Cosmetic enabled/disabled runs must preserve game outcomes and the random stream. Keep offline/device-fit/log/44px controls and soft-size requirements.


## Companion vows (0.18.0)

- `HERO_QUESTS` defines four class quests/eight plans; `HERO_VOICES` defines eight background openings/closures. One named owner per class, chosen from the first matching hero when pledged. Missing/duplicate classes never gate the run or duplicate rewards. Offer only at completed waystations from class minimum depth 1/2/3/4 through depth 4; existing vows can resolve at depth 5.
- `campaign.heroQuests` is optional in v2 input and defaults to `{}` without invented history. Records contain hero ID, plan, origin, stat baseline, pledged/fulfilled stage and null/valid resolvedAt. Save/restore copies records. Validate known class/plan, matching owner, origin/path/completed chapter, offering window, bounded baseline not exceeding current metric, status and later valid fulfillment/progress before touching active state/timers. Keep old saves and pending allocations valid.
- Quest progress comes from company counters after acceptance, or completion of deep_stair for Mage. No individual kill attribution, new map targets, RNG, XP or hidden stat bonuses. Fulfill only after a later completed chapter, at an unobstructed active waystation with no pending allocations. Reject double pledge/claim and capacity overflow atomically. Stage/reward autosave together.
- Rewards per plan are exactly one healing potion, 20 gold or one camp supply. Maximum one reward/class/run; do not exceed inventory 1000/currency 10M/supply 10M validation bounds. A full reward destination leaves the vow pledged so the player can free capacity.
- Keep choices/progress/rewards in the existing town panel and read-only Chronicle, using unique IDs for each view, escaped/textContent names, 44px buttons and retained focus. Refresh quest buttons after confirming waystation level-ups. No new overlay or main-HUD row; never block departure/endings with vows.
- `heroQuestEchoes` adds current/past-appropriate road or fulfilled consequences only after origin; never back-project fulfillment before resolvedAt. `heroQuestEnding` distinguishes unfinished/kept promises and adds a challenge for the named owner wearing the crown or remembrance for the owner binding it. Engines remain free of campaign/DOM dependencies.
- Require 114 engine checks, four sprite/art and four policy checks, 288 guardian scenarios, all sixteen browser suites including `tests/companions.cjs`, unchanged 96-run canaries with varied vows/rewards included, exact-head three-browser CI and Pages/live verification. Default-party victories must have all four vows started and Fighter/Mage fulfilled. Report policy changes, source bytes under the soft target, and human/physical-device limitations.

Additional companion integration gate: `node tests/companion-campaign.cjs` runs eight Wanderer campaigns with quest-directed exploration, all four routes/two seeds. Require all eight authored plans fulfilled across the sample, no stalls, and all vows fulfilled for each victory. Keep this privileged planning policy separate from the 96-run loot-first canary; upload `artifacts/companions/` with CI evidence.
