# Roadmap — deeper choices within a small game

## Goal and limits

Make the existing six-floor game feel like a complete tactical adventure: understandable fights, meaningful positioning, optional goals, steady chapter progress, and distinctive encounters before the finale.

Release limits: one offline-capable HTML file, no build step or runtime packages, `index.html` at most 350 KiB (358,400 bytes), the current eight world nodes and four routes, version 2 save compatibility, and visible iPhone controls in portrait and landscape. New information belongs in existing menus or an optional sheet, not another permanent phone HUD row. Keep desktop play intact.

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
