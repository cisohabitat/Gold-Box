# Roadmap — deeper choices within a small game

## Current size policy — user override for 0.14.0

The user clarified that **350 KiB is a soft target**, superseding earlier hard-cap wording in this document. Keep one offline HTML file and avoid unnecessary dependencies/assets. Report actual bytes and review growth for play value and device performance; do not fail a release solely for exceeding 358,400 bytes or invent a replacement hard ceiling. Historical byte measurements below remain historical. Save compatibility, accessible device fit, correctness and the full release gates remain mandatory.

## Goal and limits

Make the existing six-floor game feel like a complete tactical adventure: understandable fights, meaningful positioning, optional goals, steady chapter progress, and distinctive encounters before the finale.

Release limits: one offline-capable HTML file, no build step or runtime packages, a soft 350 KiB target with measured, justified growth, the current eight world nodes and four routes, version 2 save compatibility, and visible iPhone controls in portrait and landscape. New information belongs in existing menus or an optional sheet, not another permanent phone HUD row. Keep desktop play intact.

## Delivery order

| Stage | Deliverable | Why it comes here | Exit condition |
| --- | --- | --- | --- |
| 1 — Trust the run | Atomic save validation, sealed-cache generation, correct supply amounts, and exit resumption after combat. | Rewards and new persistent goals depend on reliable state. | Original failures reproduced by regression tests, then corrected; old valid codes still load. |
| 2 — Understand the fight | Help/tactics sheet, enemy role descriptions, two-step area targeting. | Players need to see consequences before terrain and guardians add complexity. | Touch aim does not consume a spell; explicit confirmation does; tactics pauses and resumes one turn loop. |
| 3 — Make position matter | Three themed battlefield layouts with cover, sanctums, and embers; consistent rules for both sides; AI tile preferences. | Tactical variety without another map system or blocked paths. | Terrain rules, end-turn effects, and AI movement pass engine checks and are readable on phones. |
| 4 — Give the journey a spine | One-time chapter XP, three optional contracts, Bell Warden and Ash Cantor guardians, journal and ending updates; reduce disproportionate gear scaling. | A stronger middle campaign and optional goals build on the corrected systems. | Rewards cannot repeat after reload; guardians have bounded phases; modest gear gains add a bounded encounter surcharge; a full campaign reaches the ending in browser-driven validation. |
| 5 — Release | Documentation, regression suite, mobile/desktop checks, automatic publication. | Features are finished only when the real flows remain playable. | Requirements acceptance record completed; reviewed files match published blobs; GitHub Pages deployment succeeds. |

All five stages are in scope for this implementation. [REQUIREMENTS.md](REQUIREMENTS.md) defines the rules and acceptance checks used to develop them.

## Definition of done

- No known regression in the existing 19 checks.
- Focused tests cover every corrected defect and new persistent mechanic.
- Combat rules remain in `CombatEngine`; the controller handles menus, journal, quest rewards, and saves.
- At least the existing six mobile viewport scenarios plus desktop are checked, including an open spell menu and boss bar.
- A seeded full-run simulation exercises chapter progression, contracts, guardians, the crown, and the final victory gate. Report victories and defeats honestly; simulation is not exhaustive balance testing.
- README and AGENTS explain the final game and how to maintain it. Publish automatically under the user's standing instruction after verification passes.

## Later backlog, outside this release

- Seeded challenge codes and run-wide deterministic RNG: requires a deliberate save/RNG migration.
- More classes, floors, or equipment slots: expands balance and mobile inventory complexity.
- Procedural sound and music: optional polish after the tactical and progression work stabilises.
- Accounts, multiplayer, purchases, telemetry, external assets, or a 3D engine: outside the standalone offline game's limits.

## Delivery record

Stages 1–4 are implemented. Stage 5 passed 40 regression checks, the mobile/desktop browser scenarios, and 12 seeded campaigns without stalls; publication follows the repository's automatic-publication instruction. The [acceptance record](REQUIREMENTS.md#acceptance-record) contains the evidence and remaining platform limitations. The later backlog above remains explicitly deferred.

## Cross-device release: desktop, iPad, and iPhone

The tactical release above remains the gameplay foundation. This extension delivers the same campaign across input methods and available window sizes, within the existing standalone/offline and 350 KiB limits.

1. **Fit the available window.** Use a dynamic-height shell on every device, retain the roster sidebar only when the window has at least 1200×650 CSS pixels, and offer Party & Log otherwise. Use side-by-side board/controls in short landscape windows. Keep all gameplay actions visible.
2. **Support touch, mouse, and keyboard.** Keep 44×44 minimum main controls, preserve touch aim confirmation, add a focusable combat grid navigated by arrows and activated with Enter/Space, and protect typing and browser shortcuts from exploration bindings.
3. **Preserve a run through resizing.** Rotation, iPad split view, and desktop resizing must not recreate the engine, spend an action, or retain a hidden notes overlay. Menus scroll independently; safe areas, zoom, and reduced-motion preferences remain supported.
4. **Verify and release.** Exercise phone, tablet, split-view, and desktop sizes with exploration, boss combat, and spells; test keyboard focus and resize state; rerun engine regressions; update maintenance/player docs and publish automatically.

Detailed acceptance criteria are DEV-01–06 in REQUIREMENTS.md. More content, networking, and audio remain in the deferred backlog; this release concentrates on making the existing game consistently playable across devices.

Cross-device stages 1–4 are implemented and verified against DEV-01–06. The runtime remains 265,834 bytes; all 40 regressions, 19-size browser matrix, and existing touch/save/offline flow pass. Publication is automatic after these checks; merge/deployment evidence is recorded in the implementation pull request.


## Reliability, readability, and visible history release

1. Fix all three reproduced follow-up defects (modal isolation, short/narrow layout, clipboard outcomes).
2. Keep two recent log events visible on the play surface; show movement/action resources and keyboard hit odds without another menu.
3. Complete keyboard equivalents for custom creation/equipment/level controls, with nested-menu focus isolation and restoration.
4. Expand the device matrix to 25 sizes and campaigns to 36 seeds/oath/routes; promote feature/save/offline checks into committed scripts and run cross-browser CI before auto-publication.

These implementation stages are complete locally. PR quality jobs and Pages are the final release gate. Real-device Safari/performance and a human full-campaign playthrough remain external validation tasks; the automated diagnostic is not a substitute. No added classes, assets, audio, networking, or save migration is needed for this release.

## Epic campaign: The Last Dawn

Build a six-chapter story on the existing eight-node/four-route world. Keep the 350 KiB single-file runtime, offline play, v2 saves, tactical engines, and visible log.

1. Give every world node an authored chapter, objective, antagonist presence, and route-specific consequences. Captain Ilyra and Archivist Eren recur across the descent.
2. Add one two-option war council at each nonfinal waystation. Show costs/rewards before commitment; resolve once, save immediately, and require a plan before descending. Route-specific choices provide supplies, bounded permanent bonuses, or aid against the final king.
3. Reflect plans in the final encounter without mutating bestiary registries: weaken the king, reduce retinue budget, release one bound reinforcement, or grant an opening ward. Explain those effects in the battle log and Chronicle.
4. Replace the automatic victory with a three-way crown decision after both existing gates are met. Give each fate a distinct epilogue that recalls the route, allies, and company.
5. Verify exactly-once choices/rewards, old-save defaults, final encounter effects, all endings, complete campaign routes, and the established cross-browser/device gate. Update player and maintenance docs, then publish automatically.

The Last Dawn stages 1–4 are implemented. Stage 5 passes the local 48-check suite, 25-size matrix, story/save/ending UI checks, and 36 varied-plan campaign simulations (17 victories/19 defeats; no stalls). Runtime is 294,028 bytes. Cross-browser PR jobs and publication are the remaining release gate, recorded in the implementation PR.

## Safe restart and balance visibility

1. Replace immediate Restart with a safe-default confirmation; pause/resume combat without spending actions, and preserve Continue on confirmed return to title.
2. Display the release build on title/gameplay screens and link the title screen to a readable balance report.
3. Expand the balance diagnostic to 96 oath/route/seed campaigns, with per-route/guardian/death-floor data, uncertainty, explicit regression bands, and tested failure criteria. Save build-tagged reports in CI and summarize the result in BALANCE.md.
4. Run device/browser/input/save checks and publish only after all quality jobs pass.


Safe Restart/build/report stages 1–3 are implemented. Local stage-4 checks pass 51 engine tests, four gate-criteria tests, 25 device sizes and the affected browser flows. The 96-run balance gate passes (23/32 Wanderer, 15/32 Delver, 7/32 Ironbound); BALANCE.md records the policy, uncertainty and specific pressure points. Cross-browser CI and Pages publication are the final release gate.

## Presentation and feedback polish (build 0.8.0)

Bring the standalone game toward an A-level player experience within the existing 350 KiB runtime, offline, save, and device limits. Add themed materials/lighting and chapter/ending illustrations; visible HP-change feedback and target inspection; opt-in synthesized sound/ambience; persistent contrast/effects/Auto-pace preferences; and clear victory feedback. Keep engines, balance rules, safe Restart, recent log, and campaign choices intact. Verify settings pause/resume, persistence/storage failures, audio failure recovery, reduced motion, device fitting and the 96-run release gate before auto-publication. This is a bounded polish release, not a claim of commercial AAA production scale.

Implementation: themed materials and inline chapter/end artwork, actual-HP tile feedback, inspection, opt-in synthesized sound/ambient tones, persisted display/audio/pace options, modal combat pause, and cross-browser polish checks are implemented in 0.8.0. The 96-run diagnostic retains the prior 23/15/7 oath victories with no stalls. Remaining work toward a stronger A: physical Safari/device validation, human onboarding and balance sessions, more authored encounters within budget, and richer art direction through careful replacement rather than unlimited payload growth. Commercial AAA content volume/production remains outside this project’s limits.

## Sprite art pass (0.9.0)

Completed: review the old contact sheet; repair malformed palette data; rebuild all 19 figures on a consistent 24×24 grid; give guardians unique art; clarify hero/enemy/guardian framing; reuse art in roster/Tactics; validate geometry, references, tiny-screen rendering and existing campaign gates. Sprite art grades C+ → A− within the project scope. See SPRITE_REVIEW.md. Remaining: physical Safari art/input review and human recognition/playtesting before claiming broader quality gains.

## Campaign and Field Atlas expansion (0.10.0)

1. Review the six-chapter arc, existing guardian identity and treasure acquisition gaps.
2. Add authored chapter set pieces, guardian aftermaths and a foreshadowed optional sky-dragon legend without changing the required world graph.
3. Build an illustrated in-game Bestiary, Treasure & Relics and Legends pages from authored lore plus registry-backed rules/sources; include search, relevant filters and current ownership.
4. Implement the stage-gated Observatory hunt, a fixed-area telegraphed breath, bounded second phase, unique art, exactly-once mantle reward, town/save recovery and ending acknowledgement.
5. Verify old saves, optional progression, timing/aim/focus, danger readability, device fitting, hunt smoke samples and the complete campaign/browser gate; update docs and publish automatically.

Stages 1–4 are implemented. Local stage-5 evidence and scope limits appear in CAMPAIGN_REVIEW.md; final cross-browser/publication evidence is recorded in the implementation PR. Human playtesting and physical Safari remain follow-up validation, not claims of completion.

## Treasure identity correction (0.10.1)

Replace the three generic slot illustrations with 16 identity-specific designs; give every legendary item a story motif and larger framed display. Preserve exact item rules and inventory state. Review all silhouettes together and on a phone, verify complete/unique artwork mappings and unclipped responsive SVG, then pass existing cross-browser/balance gates before automatic publication. Implemented designs and evidence are recorded in TREASURE_ART_REVIEW.md.

## Campaign payoff (0.11.0)

1. Preserve guardian victory prose in a dedicated illustrated acknowledgement, with pending levels first and reliable stairs/focus recovery.
2. Recall every later council in the ending; retain legacy defaults and derive guardian history in Chronicle from saved progress.
3. Give Eclipsescale a bounded spell-protection identity and truthful equipment/atlas descriptions.
4. Expand seeded campaign diagnostics, inspect the Ash Cantor/finale curve, and document limits before changing difficulty.
5. Verify on all three CI browsers and publish automatically after the exact head passes.

Steps 1–3 are implemented; current validation and balance evidence are recorded in CAMPAIGN_REVIEW.md and BALANCE.md. Human playtesting and physical Safari remain follow-up validation.

## Distinct route play (0.12.0)

1. Implement escort-return, ordered discovery, relic-to-standard and two-of-three shrine goals through one small map-task seam.
2. Surface labelled beacons, progress and readable briefings; preserve key/door solvability and existing guardian/council/finale flow.
3. Persist task progress with safe legacy defaults and atomic validation; keep all rewards bounded and once-only.
4. Verify real movement/Continue/import and all device/browser gates; make full campaign diagnostics complete both route tasks and record balance.
5. Publish automatically after all exact-head jobs pass. Tactical guardian expansion and physical-device/human testing remain later work.

## Guardian counterplay (0.13.0)

1. Give Bell Warden a delayed rally and Ash Cantor a fixed delayed hymn, with weapon interruption as an alternative to escape.
2. Make imminent actions readable in the board, boss header, tile inspection and paused Tactics; teach Auto to escape through legal movement.
3. Strengthen Astrax's durability/breath while preserving its existing phase limits and escape window.
4. Verify timing, costs, incapacity/death, reactions, manual input and four device classes, then run all release checks and publish after exact-head CI.

Implemented in this release. Next priorities: observed human campaign sessions and physical Safari/iPad testing; use that evidence before further difficulty tuning. New chapters or a rendering rewrite remain outside the current scope.

## Fresh review and manual-play confidence (0.13.1)

1. Reproduce inventory reload loss and full-HP potion waste; add focused regressions before changing behavior.
2. Persist successful Party actions immediately and protect healing resources in both modes.
3. Add read-only upcoming turns and movement-risk forecasts using actual engine data, with no extra main-screen row or RNG draws. Fix the reproduced Tactics jump to its bottom Return button; start at the top with a sticky close control.
4. Exercise real controls and reloads, focused/fitted device views, all prior browser flows and the unchanged full balance gate; publish only after exact-head CI.

Implemented. Next: observe human full campaigns (especially Warden/Cantor pacing and optional hunt) and validate actual Safari devices. Keep a B+ overall assessment until that evidence supports a higher grade.

## Guardian arenas and concrete fixes (0.14.0)

1. Adopt the user's soft size target; keep offline simplicity and device/recovery requirements.
2. Reproduce and fix dead-active-hero turns after lethal movement reactions and self-cast blasts.
3. Give the four guardians authored terrain and once-only arena shifts, using existing rules and phase gates.
4. Bring three existing council plans onto those battlefields as bounded protected sanctums, with explicit previews and no new save fields.
5. Differentiate Lantern/Starweave wards, retain Eclipsescale, and explain gear tradeoffs in Party and atlas.
6. Verify scripted strategy variants, real manual browser interactions and the full campaign/cross-browser/publication gates.

Implemented. Physical Safari and observed human full runs remain necessary follow-up evidence; fixture victories and Auto percentages do not establish subjective epicness or human win rates.

## Ordinary fights and defeat learning (0.15.0)

1. Author five patrol patterns using existing enemies, complementary budget-safe roles and distinct front/rear deployment.
2. Explain actual patterns and counters through the opening log and paused Tactics; keep boss arenas and legacy saves compatible.
3. Capture transient, ward-aware damage/control/attack evidence and derive two grounded suggestions after a defeat.
4. Verify controlled enemy/friendly-fire losses, replay/focus/escaping, descriptor Continue, all prior suites and full campaign balance; publish after exact-head CI.

Implemented. New guardian mechanics, hero-background events and physical-device/human playtesting remain separate work; this release does not claim to complete those suggestions.


## A broader enemy ecology (0.16.0)

1. Specify six distinct ordinary roles with bounded actions, readable counters and chapter habitats.
2. Implement shield protection, one-use leap, delayed death blast, silence, bounded siphon and one-tile hook in the pure engine; preserve existing action economy, damage evidence, reactions and saves.
3. Give each role unique 24×24 art and authored bestiary context. Show live wards, silence and exact blast deadlines through existing UI.
4. Verify isolated mechanics, controller/device flows, guardian invariance, full campaign balance and exact-head three-browser CI, then publish automatically.

Implemented. The following requirements document the acceptance boundaries. Human observation of all six roles and physical Safari play remain follow-up evidence; quantity alone does not establish an A grade.


## Readable ranged action feedback (0.17.0)

1. Record bounded, immutable snapshots of actual ranged attacks/spell releases in the pure engine.
2. Draw arrows and distinct spell shapes in a separate decorative layer that survives board redraws, with target pulses and a miss marker.
3. Respect effects preferences/reduced motion; bound and clear visual work without touching turn scheduling or game outcomes.
4. Verify real manual spell confirmation, arrow flight, both redraw and cleanup paths, full balance, cross-browser CI and live publication.

Implemented. Animation is presentation only; battle-ending results can immediately replace it. Human full campaigns and physical Safari remain follow-up evidence.


## Personal stakes and consequences (0.18.0)

1. Author four class spotlight quests with two plans each and eight background voices. Tie goals to existing company actions and chapter completion.
2. Offer and resolve vows through existing waystations; cap resources, ownership and once-only rewards. Keep them optional for every party composition.
3. Persist owner/choice/baseline/fulfillment in compatible v2 state with atomic validation and legacy defaults.
4. Carry promises into chapter arrivals, Chronicle and all endings, including a companion’s response to a crowned owner.
5. Verify actual controller progress, UI/save/level recovery and the full campaign/cross-browser/publication gates, with varied quest choices included in the balance policy.

Implemented. Authored combat set pieces and observed human/physical Safari playtests remain separate follow-up work. This release does not add combat allies, floors or a higher grade by assertion.
