# Contributor instructions

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
- The tactical-depth acceptance record supersedes the historical 19-test/six-run baseline above: 40 checks, 256 generator probes, six phone viewport scenarios, and 12 seeded campaigns (six victories/six defeats, no stalls). These are DOM-stub and Chromium checks, not physical Safari or exhaustive balance testing. Keep `index.html` within 350 KiB with no runtime dependencies.

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
- Before automatic merging/publication, require all Game quality PR jobs to succeed. The workflow runs engine/device/quality/flow checks in Chromium, Firefox, and WebKit, plus 36 seeded campaigns in Chromium. The publisher must inspect the exact tested head and verify Pages success after merge. This procedure does not imply configured branch protection.
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

- Presentation must derive from actual HP/state; never consume gameplay RNG or mutate engine data. Keep overlays pointer-transparent, the log visible, and the 350 KiB budget. Transient feedback has its own timer/token and clears on load/new game/title.
- Store player options under `goldbox_preferences_v1`, independently of v2 campaign saves. Defaults: sound/music off, normal pace, effects on, clean contrast off. Respect OS reduced motion even if effects are on; handle blocked storage and unavailable Web Audio.
- Audio is opt-in after a gesture, bounded to six effect voices and two ambient voices; mute/visibility/modal/title transitions silence ambience. Do not couple sound to action scheduling or random rolls.
- Keep settings in overlay guards, cleanup and focus isolation. Opening pauses combat; closing preserves manual aim and resumes one appropriate loop. Mobile settings return focus to Party & Log.
- Run `tests/polish.cjs` in the three-browser gate for persisted preferences, real disabled effects/contrast styling, audio opt-in/failure, focus, paused combat, HP feedback and blocked storage. Report emulation and deterministic Auto separately from hardware/human validation.

## Sprite art maintenance (0.9.0)

- `SPX` contains 20 authored 24×24 grids. Only `.` is transparent; all other symbols must exist in `PX`. `px` rejects invalid geometry/palette data. Keep keylines, lighting, and silhouettes consistent, and art within the square.
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
