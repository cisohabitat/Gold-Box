# Contributor instructions

## Scope and project shape

These instructions apply to the entire repository. Gold Box Slice is a single-file browser tactical RPG. `index.html` contains its HTML, CSS, data registries, engines, controller, and rendering. There is no build step, package manifest, or checked-in automated test suite. Keep the game playable by opening the file directly, including offline with system font fallbacks.

Read `README.md` before changing behavior. It describes the controls, architecture, known issues, and manual verification scenarios. Keep that documentation accurate when behavior or repository contents change.

## Architecture

- Keep `CombatEngine` and `ExploreEngine` independent of the DOM. The controller owns UI updates and transitions between exploration, combat, town, events, and level-up screens.
- Add content through the existing registries (`SPELLS`, `ITEMS`, `PERKS`, `CLASSES`, `BACKGROUNDS`, `BESTIARY`, `EVENTS`, and `WORLD`) where possible.
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

## Review baseline and open defects

Review baseline: `a80cb6be43c7ab86feb4d88b7f786b07092518c4` on `main`, reviewed October 20, 2026. Four defects were reproduced using the actual inline script in a Node harness with DOM stubs:

1. **P1 — Lost level-up allocations on reload.** `resolveCombat` calls `render` (which autosaves) after granting levels and before `openLevelUp`. `saveState` omits pending choices; loading retains the level but loses its ability/build allocation. Event XP also autosaves before its allocation is confirmed.
2. **P1 — Duplicate Auto turn loops.** Auto on/off/on before the pending timer fires leaves multiple callbacks. A reproduced sequence acted with the same enemy twice and skipped the following enemy. Check `toggleAuto` and `beginTurnFlow`.
3. **P2 — Auto area damage ignores allies.** `_bestPointTile` scores only foes, while `castSpell` damages every living combatant in the blast. A reproduced Fireball killed three wounded allies surrounding one enemy.
4. **P2 — Archer retreat skips opportunity attacks.** `_rangedTurn` assigns the retreat position without `_provoke`, unlike `_casterTurn` and `_stepToward`.

These are open findings, not implemented fixes. Update this list and the README when fixes are verified. Prefer function names to line references because this single file changes frequently.

## Verification and reporting

- Run focused verification appropriate to the change. For behavioral fixes, reproduce the original failure and check the corrected result; add meaningful regression coverage if introducing a test harness.
- Syntax-check extracted inline JavaScript after script edits. This does not validate browser APIs, rendering, or game flow.
- Use `python3 -m http.server 8000` for browser checks. Follow the relevant scenarios in the README, including narrow mobile layouts for UI changes.
- For save changes, check both portable codes and browser Continue, including a reload during pending level-up.
- For turn changes, check rapid Auto toggles, incapacitated actors, combat completion, and restart with queued callbacks.
- Distinguish static inspection, DOM-stub execution, and browser testing in reports. The baseline review passed JavaScript syntax checking but did not perform full browser verification; its temporary harness is not checked in.
- Report remaining failures and limitations plainly. Do not describe documented defects as fixed unless the implementation and verification support that claim.
