# Contributor instructions

## Scope and project shape

These instructions apply to the entire repository. Gold Box — Crown of the Sunless King is a single-file browser tactical RPG. `index.html` contains its HTML, CSS, data registries, engines, controller, and rendering. There is no build step or package manifest. The dependency-free regression suite is `tests/regression.cjs`. Keep the game playable by opening the file directly, including offline with system font fallbacks.

Read `README.md` before changing behavior. It describes the controls, architecture, known issues, and manual verification scenarios. Keep that documentation accurate when behavior or repository contents change.

## Architecture

- Keep `CombatEngine` and `ExploreEngine` independent of the DOM. The controller owns UI updates and transitions between exploration, combat, town, events, and level-up screens.
- Add content through the existing registries (`SPELLS`, `ITEMS`, `PERKS`, `CLASSES`, `BACKGROUNDS`, `BESTIARY`, `EVENTS`, `WORLD`, `OATHS`, `BOONS`, and `SIGNATURES`) where possible.
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
