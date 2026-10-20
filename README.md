# Gold Box Slice

A single-file, browser-based tactical RPG in the spirit of the classic SSI Gold Box games. Explore a fogged dungeon from a top-down map that fills in as you go, fight turn-based battles on a grid, and descend through a branching underworld to claim a relic — then cut your way back out past the tomb’s guardian.

The whole game is one HTML file. No build step, no install, no dependencies. Open it and play.

![Gold Box Slice — the Upper Crypt, with the party panel, event log, and fogged overhead map](Gold-Box.JPG)

## Play

**[▶ Play it now](https://cisohabitat.github.io/Gold-Box/)**

Or just open `index.html` in any modern browser. It works offline (the only network calls are two optional Google Fonts; without them it falls back to system fonts). The layout adapts to the screen — a board-plus-panel view on desktop, stacked panels with large touch targets on a phone.

The live version is served from GitHub Pages: the repo’s **Settings → Pages** source is set to the main branch root, so `index.html` is published automatically at the link above.

## The game

You lead a party of four down through a six-floor dungeon, picking your route at each fork. The relic rests in the deepest tomb; lifting it wakes the place — the dead rise to bar your road out and the Crypt Lord seals the only exit, so the back half of a run is a fighting retreat. Win the fight at the sealed door to escape with the relic.

Every floor is generated fresh each run, so the layout, loot, and encounters change every time, while the arc stays the same.

### Features

- **Branching world.** Six floors over one of four routes, forking twice and reconverging. Each fork is a real choice between a fight-heavy, loot-rich path and a quieter, supply-led one.
- **Tactical grid combat.** Turn-based battles with movement, attacks of opportunity, ranged penalties in melee, spells (damage, healing, area blasts, control, buffs, debuffs, summons), and a full enemy AI. An auto-fight toggle plays out a battle for you.
- **Four classes.** Fighter, Cleric, Thief, and Mage, each with its own stats, growth, and build path. Roll your own party or jump in with a pre-made one.
- **Per-character progression.** Each hero earns its own XP and levels independently up to level 8 — heroes knocked out in a fight fall behind. Every level is one ability bump plus a build choice (learn a spell or take a perk), with pools deep enough to keep the choice meaningful all the way to the cap.
- **Exploration that rewards your stats.** Line-of-sight fog, a Dexterity-driven scout radius, and twelve stat-check events spanning all six abilities. Hidden wall caches reward a perceptive (high-Wisdom) party — find them by walking past, or miss them entirely.
- **Backgrounds.** Each hero has an origin with a small mechanical edge and in-character barks at story beats.
- **Self-scaling difficulty.** Encounter strength is budgeted from floor tier, party level, and equipped gear, with tougher “elite” foes appearing on deeper floors. The curve was tuned with a headless combat simulator rather than by guesswork.
- **Portable saves.** Save to a copyable code that works anywhere, plus an automatic browser save with a Continue button when storage is available.

### Controls

- **Move** with the on-screen compass pad, or the arrow keys / WASD on desktop. The party faces the way it steps.
- **Explore** to reveal the map, pick up loot, trigger events, and find the stairs down. Foes engage when you step adjacent.
- **Fight** by selecting a hero, then moving and acting (attack, cast, guard). Or hit **Auto** to let the party fight on its own.
- **Waystation** between floors: rest, shop, manage equipment, and choose your next path.

## How it’s built

The codebase is deliberately structured so content is **data**, and game logic never touches the screen:

- Two pure engines — `CombatEngine` (grid combat) and `ExploreEngine` (dungeon) — hold all the rules and return plain typed signals. They never read or write the DOM.
- A single controller layer owns the screen and the state machine, reacting to those signals.
- Everything else is **registries**: `SPELLS`, `ITEMS`, `PERKS`, `CLASSES`, `BESTIARY`, `EVENTS`, the `WORLD` graph of floors, the procedural level generator, and the `DIFFICULTY` / `XP_TABLE` tuning tables.

This means most changes — a new spell, monster, item, perk, event, or whole floor — are a new entry in a registry, not new engine code. See [AGENTS.md](AGENTS.md) for contributor guidance, validation expectations, and the areas identified during review.

### Add a floor (example)

A floor is a node in the `WORLD` graph. It describes *what* the floor contains, not how it’s laid out — the generator produces a fresh, solvable map every run:

```js
my_vault: {
  id: 'my_vault', name: 'The Forgotten Vault', theme: 'tomb',
  gen: { cols: 4, rows: 3 }, tier: 2,
  lockedExit: true, key: true,
  gold: 100, rations: 1,
  items: ['oak_staff', 'potion_heal'],   // loot to scatter
  events: 3,                             // stat-check events to place
  secrets: 2, secretItems: ['potion_heal'],  // hidden wall caches
  encounters: [ { pool: ['skeleton', 'necromancer'] } ],
  teaser: 'Quieter going, but the walls hide more than dust.',
  next: ['deep_stair']                   // successor floor id(s); [] = finale
}
```

Give a node more than one `next` to create a fork; the waystation offers the choice automatically. Paths can reconverge (it’s a DAG, not a tree).

## Run locally

No tooling required. Clone the repo and open the file:

```bash
git clone https://github.com/cisohabitat/Gold-Box.git
cd Gold-Box

open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Or serve it (handy for testing the auto-save, which some browsers gate behind `http://` rather than `file://`):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Known issues

The following issues were reproduced against `main` at `a80cb6be43c7ab86feb4d88b7f786b07092518c4` during the October 20, 2026 review. They remain unresolved; this documentation update does not change gameplay.

- **Level-up saves:** refreshing or closing the game before confirming level-up choices can permanently lose the unspent ability point and spell/perk choice. Complete the allocation before leaving the page.
- **Auto timing:** rapidly switching Auto on, off, and on can duplicate actions and skip turns. Avoid rapid toggles while a turn is pending.
- **Auto friendly fire:** automated area-damage targeting ignores allies in the blast. A Mage can injure or kill nearby party members with Fireball.
- **Archer reactions:** an archer retreating out of melee does not trigger opportunity attacks.

## Validation

There is currently no checked-in automated test suite or package manifest. The review used the actual inline JavaScript in a Node harness with DOM stubs to reproduce the four issues above, and JavaScript syntax checking passed. That harness is not included in the repository; full browser behavior was not verified by those checks.

For changes to game behavior, serve the file locally and exercise the affected flow in a browser. Useful regression checks are:

- Start both a default and a custom party, move, reveal terrain, collect loot, and enter combat.
- Complete combat manually and with Auto; test rapid toggles and restarting while a turn is pending.
- Test melee, ranged retreat, guard reactions, and area spells with allies nearby.
- Earn a level through combat and an event; confirm ability and build choices, then save and reload. Reload with choices pending when testing a fix for the known save issue.
- Round-trip a portable save code and browser Continue; check town, equipment, HP, spell uses, and progression. Confirm portable codes still work when browser storage is unavailable.
- Check the board and Party screen on desktop and a narrow mobile viewport.

These are verification scenarios, not a claim that the known issues currently pass.

## Repository

- `index.html` — the complete game (one file).
- `AGENTS.md` — contributor instructions, architecture boundaries, and regression guidance.
- `README.md` — play instructions, architecture overview, known issues, and validation checklist.
- `Gold-Box.JPG` — the gameplay screenshot above.

## Credits & licence

Built as an homage to the SSI Gold Box engine of the late 1980s. This is an original implementation — no original assets or code are used.

Add a licence of your choice (e.g. [MIT](https://choosealicense.com/licenses/mit/)) by dropping a `LICENSE` file in the repo root.
