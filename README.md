# Gold Box — Crown of the Sunless King

A single-file, browser-based tactical RPG in the spirit of the classic SSI Gold Box games. Four heroes descend beneath a ruined kingdom to recover the Sunless King's crown and bring back the dawn. Explore a fogged dungeon, build a company around class signatures and permanent blessings, and overcome a two-phase final boss.

The whole game is one HTML file. No build step, no install, no dependencies. Open it and play.

![Gold Box Slice — the Upper Crypt, with the party panel, event log, and fogged overhead map](Gold-Box.JPG)

## Play

**[▶ Play it now](https://cisohabitat.github.io/Gold-Box/)**

Or just open `index.html` in any modern browser. It works offline (the only network calls are two optional Google Fonts; without them it falls back to system fonts). The layout adapts to the screen — a board-plus-panel view on desktop, stacked panels with large touch targets on a phone.

The live version is served from GitHub Pages: the repo’s **Settings → Pages** source is set to the main branch root. Changes on a pull request branch become live only after they reach `main`; download that branch's `index.html` to play its version locally.

### Playing on iPhone

The play area adapts to the current browser height, including Safari's expanding or collapsing bars, and leaves safe-area space around the display cutout and home indicator. In portrait, the board sits above the action buttons and movement pad. In landscape, the board and controls sit side by side. The boss bar and horizontally scrollable spell menu fit inside that same play area.

Tap **Party & Log** to inspect the roster and battle history, then **Back to Game** to return. This panel replaces the desktop sidebar on a phone. Equipment, creation, save, and other menus scroll independently when their contents are taller than the screen. Main action and movement buttons have touch targets at least 44 pixels across and tall; pinch zoom remains available.

The layout was checked at 440 × 956, 440 × 780, and 440 × 680 portrait viewports, 956 × 440 and 956 × 350 landscape viewports, and 390 × 844, with simulated safe-area insets. These are Chromium viewport checks for iPhone-sized screens, not physical iPhone or Safari certification. Reload the live page after an update to get the latest layout.

## The game

You lead a party of four down through a six-floor dungeon, picking your route at each fork. The relic rests in the deepest tomb; lifting it wakes the place — the dead rise to bar your road out and the Crypt Lord seals the only exit, so the back half of a run is a fighting retreat. Win the fight at the sealed door to escape with the relic.

Every floor is generated fresh each run, so the layout, loot, and encounters change every time, while the arc stays the same.

### Features

- **Choose your oath.** Wanderer starts selected: smaller enemy forces, 25% party HP recovery after victory, and victory XP for downed heroes too. Delver keeps the original encounter budget and survivor-only XP; Ironbound increases that budget by 25%. Elite rolls and party strength still affect the result.
- **Class signatures.** Each hero has a special action usable once per battle. Fighter: Rally the Line (+2 party attack and AC for two turns). Cleric: Dawn's Mercy (heal all standing allies for 6 + twice the Cleric's level). Thief: Cloak of Shadows (+4 AC and weapon damage for three turns). Mage: Arcane Wellspring (restore one use per spell and gain +2 AC for two turns). Buff durations tick at the affected actor's turn end. Signatures spend an action, and Auto uses them too.
- **Embers of the old kingdom.** Each waystation offers three of the remaining blessings. Claim one free blessing there: permanent party attack, armour, or damage bonuses, or immediate supplies, gold, or potions. Each blessing is unique within a run. You may descend without claiming one.
- **Legendary finds.** Find Dawnblade in the Ossuary, Starweave Mantle on the Pillared Road, and Nightglass in the Sunless Tomb. The first fork and second fork still determine your route and rewards.
- **A king who fights back.** The Crypt Lord gains attack and damage and calls two skeleton guards when reduced to half health while still alive. A boss HP display marks the phase change. Escape requires both the crown and the king's defeat.
- **A chronicle of your company.** Track your route, oath, blessings, battles, defeated foes, steps, secrets, and resolved events. The ending remembers your run.
- **Branching world.** Six floors over one of four routes, forking twice and reconverging. Each fork is a real choice between a fight-heavy, loot-rich path and a quieter, supply-led one.
- **Tactical grid combat.** Turn-based battles with movement, attacks of opportunity, ranged penalties in melee, spells (damage, healing, area blasts, control, buffs, debuffs, summons), and a full enemy AI. An auto-fight toggle plays out a battle for you.
- **Four classes.** Fighter, Cleric, Thief, and Mage, each with its own stats, growth, and build path. Roll your own party or jump in with a pre-made one.
- **Per-character progression.** Each hero earns its own XP and levels independently up to level 8. On Delver and Ironbound, heroes knocked out in a fight miss that victory's XP. Every level grants one ability bump plus a build choice (learn a spell or take a perk). Pending level allocations survive saving and reloading.
- **Exploration that rewards your stats.** Line-of-sight fog, a Dexterity-driven scout radius, and twelve stat-check events spanning all six abilities. Hidden wall caches reward a perceptive (high-Wisdom) party — find them by walking past, or miss them entirely.
- **Backgrounds.** Each hero has an origin with a small mechanical edge and in-character barks at story beats.
- **Self-scaling difficulty.** Encounter strength is budgeted from floor tier, party level, equipped gear, and oath, with tougher “elite” foes appearing on deeper floors. Full Auto is convenient but does not guarantee victory; positioning, equipment, route choices, and supplies still matter.
- **Portable saves.** Save to a copyable code that works anywhere, plus an automatic browser save with a Continue button when storage is available.

### Controls

- **Move** with the on-screen compass pad, or the arrow keys / WASD on desktop. The party faces the way it steps.
- **Explore** to reveal the map, pick up loot, trigger events, and find the stairs down. Foes engage when you step adjacent.
- **Fight** by selecting a hero, then moving and acting (attack, cast, guard). Or hit **Auto** to let the party fight on its own.
- **Waystation** between floors: rest, shop, manage equipment, and choose your next path.
- **Signature** uses the current hero's class ability. Its explanation appears below the board while available; the button disables after use.
- **Chronicle** opens your route and run statistics during exploration.
- **Party & Log** opens the roster and battle history on phones; **Back to Game** closes it. In portrait, use the four-arrow movement pad. Desktop turning controls and keyboard movement remain available.

## How it’s built

The codebase is deliberately structured so content is **data**, and game logic never touches the screen:

- Two pure engines — `CombatEngine` (grid combat) and `ExploreEngine` (dungeon) — hold all the rules and return plain typed signals. They never read or write the DOM.
- A single controller layer owns the screen and the state machine, reacting to those signals.
- Content lives in **registries**: `SPELLS`, `ITEMS`, `PERKS`, `CLASSES`, `BESTIARY`, `EVENTS`, `OATHS`, `BOONS`, `SIGNATURES`, the `WORLD` graph, and the `DIFFICULTY` / `XP_TABLE` tuning tables. The controller keeps campaign statistics and applies blessing bonuses to hero data before combat.

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

## Save compatibility and fixes

Existing version 2 portable codes still load. Saves without campaign fields default to Delver with no claimed blessings or historical counters. An already-cleared Crypt Lord encounter is recognised when loading an older final-floor save. New saves retain the oath, blessings, statistics, and pending level allocations. A lost allocation from an older save cannot be reconstructed retroactively.

The four defects reproduced in the October 20, 2026 review are addressed in this version:

- Combat and event level-up allocations persist and reopen on load.
- Auto uses one active turn timer and invalidates callbacks when combat or the menu state changes.
- Auto area-damage spells reject targets that would hit allies; manual casts still permit friendly fire.
- Archer retreat triggers opportunity attacks before the archer can shoot.

Casters also advance to spell range instead of charging into melee, and incapacitated actors cannot perform attacks, movement, spells, or signatures.

## Validation

No tooling is needed to play. For contributors, run the dependency-free checks with Node.js 18 or newer:

```bash
node tests/regression.cjs
```

The 19 checks execute the actual inline script with DOM stubs. They cover the original defects, legacy and storage-blocked saves, class signatures, blessings, oath strength, boss phases, final victory requirements, caster positioning, and 96 generated floors' exit/key reachability.

The expansion was also checked in Chromium: default and custom parties, journal, portable code loading, unique waystation blessings, signature actions, pending level-up recovery, boss phases, and the Party screen at a 390-pixel mobile viewport. Six seeded campaign simulations exercised both fork choices across all three oaths; one Wanderer run reached the ending through the boss's second phase, while the other runs ended in defeat. No JavaScript page errors occurred. These checks demonstrate a completable route, not exhaustive balance or cross-browser coverage. Direct `file://` verification was blocked by the managed browser's administrator policy; local HTTP play and offline interaction after loading were checked separately.

For changes to game behavior, serve the file locally and exercise the affected flow in a browser. Useful regression checks are:

- Start both a default and a custom party, move, reveal terrain, collect loot, and enter combat.
- Complete combat manually and with Auto; test rapid toggles and restarting while a turn is pending.
- Test melee, ranged retreat, guard reactions, and area spells with allies nearby.
- Earn a level through combat and an event; confirm ability and build choices, then save and reload. Reload with choices pending and confirm the allocation screen returns.
- Round-trip a portable save code and browser Continue; check town, equipment, HP, spell uses, and progression. Confirm portable codes still work when browser storage is unavailable.
- Check the board and Party screen on desktop and a narrow mobile viewport.

Check new scenarios when their related behavior changes; the DOM-stub checks do not replace browser verification.

## Repository

- `index.html` — the complete game (one file).
- `AGENTS.md` — contributor instructions, architecture boundaries, and regression guidance.
- `README.md` — play instructions, architecture overview, save compatibility, and validation checklist.
- `tests/regression.cjs` — dependency-free behavioral regression checks.
- `Gold-Box.JPG` — the gameplay screenshot above.

## Credits & licence

Built as an homage to the SSI Gold Box engine of the late 1980s. This is an original implementation — no original assets or code are used.

Add a licence of your choice (e.g. [MIT](https://choosealicense.com/licenses/mit/)) by dropping a `LICENSE` file in the repo root.
