# Gold Box — Crown of the Sunless King

A single-file, browser-based tactical RPG in the spirit of the classic SSI Gold Box games. Four heroes descend beneath a ruined kingdom to recover the Sunless King's crown and bring back the dawn. Play **The Last Dawn**, a six-chapter campaign: explore a fogged dungeon, rally a kingdom, make lasting war-council decisions, and decide the fate of the Sunless King’s crown.

The whole game is one HTML file. No build step, no install, no dependencies. Open it and play.

![Gold Box Slice — the Upper Crypt, with the party panel, event log, and fogged overhead map](Gold-Box.JPG)

## Play

**[▶ Play it now](https://cisohabitat.github.io/Gold-Box/)**

Or just open `index.html` in any modern browser. It works offline (the only network calls are optional Google Fonts; without them it falls back to system fonts). The layout adapts to the screen — a fitted board/control shell on every device, with a live sidebar in wide windows and a separate Party & Log panel in smaller windows. **How to Play** on the title screen explains the rules.

The live version is served from GitHub Pages: the repo’s **Settings → Pages** source is set to the main branch root. Changes on a pull request branch become live only after they reach `main`; download that branch's `index.html` to play its version locally.

### Playing on desktop, iPad, and iPhone

The play area adapts to the current browser height, including Safari's expanding or collapsing bars, and leaves safe-area space around the display cutout and home indicator. In portrait, the board sits above the action buttons and movement pad. In short landscape windows at least 600px wide, the board and controls sit side by side. In very small portrait windows the play panel can scroll, keeping the board at least 160px tall and every action reachable. The boss bar and horizontally scrollable spell menu fit inside that same play area.

The two latest events stay visible beneath the board, during exploration and combat. The full history remains available in **Party & Log** (labelled **Log** in very narrow landscape windows). Combat also shows the active hero and whether movement and the action are ready or spent.

Tap **Party & Log** to inspect the roster and battle history, then **Back to Game** to return. This panel replaces the sidebar on phones, most iPad windows, and smaller desktop windows. Windows at least 1200×650 pixels keep the live sidebar. iPad split view and rotation adapt without restarting the run. Equipment, creation, save, and other menus scroll independently when their contents are taller than the screen. Main action and movement buttons have touch targets at least 44 pixels across and tall; pinch zoom remains available.

Use a mouse or touch to choose actions. With a keyboard, explore using arrows or WASD; in combat, Tab to the grid, move focus with arrows, and press Enter or Space to use the selected action. Area spells still require confirmation. Focus a flagged enemy during Attack to see its hit chance. Score assignment, equipment slots, and level choices accept Enter/Space too; open menus keep focus inside and return it when closed. Reduced-motion preferences disable animations and transitions.

The layout was checked at 440 × 956, 440 × 780, and 440 × 680 portrait viewports, 956 × 440 and 956 × 350 landscape viewports, and 390 × 844, with simulated safe-area insets. These are Chromium viewport checks for iPhone-sized screens, not physical iPhone or Safari certification. Reload the live page after an update to get the latest layout.

## The game

You lead a party of four down through a six-floor dungeon, picking your route at each fork. Defeat the Bell Warden in the Catacombs and the Ash Cantor in the Descent. The crown rests in the deepest tomb; lifting it wakes roaming dead, turning the last stretch across that floor into a fighting retreat. Defeat the Crypt Lord, reach the final stairs, then choose whether to break, bind, or wear the crown. Choose which hero bears its oath if you bind or wear it.

Every floor is generated fresh each run, so the layout, loot, and encounters change every time, while the arc stays the same.

### The Last Dawn campaign

Captain Ilyra holds the last gate. Archivist Eren has discovered where the king imprisoned every lost sunrise. Your four heroes descend through six chapters, with two route forks changing the places, people, and choices you encounter:

1. **A Kingdom Without Morning** — open the refugee road or recover the royal arsenal.
2. **The Drowned Standard / A Thousand Forgotten Names** — send Nessa beneath the throne, recover the drowned pay, carry the lost register, or take the ancestral vigil, depending on your route.
3. **The Bell That Commands the Dead** — free the bound choir or forge the Bell Warden’s iron into weapons.
4. **The Legion Beneath the Mountain / The Procession of Small Gods** — rally the lost legion, bear its shields, relight village hearths, or carry the procession’s ward.
5. **The Last Fire** — send Ilyra’s survivors against the throne or carry the final ember yourselves.
6. **The Throne at the End of Night** — defeat the king and decide what replaces his rule.

At each of the five waystations, a **War Council** appears before the trader. Read both plans and their exact benefits, then commit to one before descending. There are seven authored councils across the branching world and fourteen possible plans; one run encounters five councils. Supplies and permanent bonuses help on the road. Other choices weaken the final king, draw away part of his retinue, deny one bloodied-phase reinforcement, or grant a three-turn opening ward. The battle log explains your allies’ help. Decisions and rewards save immediately and cannot be claimed twice; Chronicle recalls the road and its consequences.

The finale offers three distinct endings: **Break** releases the dawn, **Bind** leaves your chosen hero as Warden, and **Wear** places your chosen hero on the throne. The epilogue remembers the named company, refugees, and route. The choice only opens with the crown, the king defeated, and the final stairs reached. Reloading before you choose returns to that decision. Older portable saves remain supported; earlier chapters receive no retroactive story rewards.

### Features

- **Battlefields with rules.** Crypt, Catacomb, and Tomb fights have distinct terrain layouts. Cover gives +2 AC against ranged weapons; spells and melee ignore it. Sanctums restore up to 3 HP at turn end. Embers deal 2 damage at turn end and can knock a unit out. Both sides follow the same rules, and the AI considers terrain when moving.
- **Readable tactics and safe aiming.** Open **Tactics** during combat to pause and read enemy roles, current stats, remaining spells, and statuses. Area spells require an aim tap followed by a second tap or confirmation. The blast is highlighted and the confirmation reports allies and foes in the area, including a friendly-fire warning for damaging spells.
- **A reward for every chapter.** Each nonfinal chapter exit grants every hero `100 + 50 × floor tier` XP once. It remains separate from survivor-only battle XP on harder oaths. Exits resume after combat and pending level choices without requiring a step off the stairs.
- **Promises to the kingdom.** Chronicle tracks three optional contracts. Win four battles for Sunshard (Mage/Cleric weapon, +2 attack/+2 damage); open two hidden caches for Lantern Mantle (+2 AC); succeed at three event checks for 120 gold and two supplies. Rewards are automatic, saved, and paid once. Skips and failed checks do not count as successes.
- **Guardians before the finale.** The Bell Warden rallies its retinue; the Ash Cantor uses hexes and fire. Each gains a small buff and calls one skeleton at half health while alive. Their capped encounter budgets keep these milestones within the existing campaign. The Crypt Lord retains its stronger two-skeleton phase.
- **Choose your oath.** Wanderer starts selected: smaller enemy forces, 25% party HP recovery after victory, and victory XP for downed heroes too. Delver uses the standard encounter multiplier and survivor-only battle XP; Ironbound increases that budget by 25%. Elite rolls and party strength still affect the result.
- **Class signatures.** Each hero has a special action usable once per battle. Fighter: Rally the Line (+2 party attack and AC for two turns). Cleric: Dawn's Mercy (heal all standing allies for 6 + twice the Cleric's level). Thief: Cloak of Shadows (+4 AC and weapon damage for three turns). Mage: Arcane Wellspring (restore one use per spell and gain +2 AC for two turns). Buff durations tick at the affected actor's turn end. Signatures spend an action, and Auto uses them too.
- **Embers of the old kingdom.** Each waystation offers three of the remaining blessings. Claim one free blessing there: permanent party attack, armour, or damage bonuses, or immediate supplies, gold, or potions. Each blessing is unique within a run. You may descend without claiming one.
- **Legendary finds.** Find Dawnblade in the Ossuary, Starweave Mantle on the Pillared Road, and Nightglass in the Sunless Tomb. The first fork and second fork still determine your route and rewards.
- **A king who fights back.** The Crypt Lord gains attack and damage and calls two skeleton guards when reduced to half health while still alive. A boss HP display marks the phase change. Escape requires both the crown and the king's defeat.
- **A chronicle of your company.** Track your route, oath, blessings, battles, defeated foes, steps, secrets, and resolved events. The ending remembers your run.
- **Branching world.** Six floors over one of four routes, forking twice and reconverging. Each fork is a real choice between a fight-heavy, loot-rich path and a quieter, supply-led one.
- **Tactical grid combat.** Turn-based battles with movement, attacks of opportunity, ranged penalties in melee, spells (damage, healing, area blasts, control, buffs, debuffs, summons), and a full enemy AI. An auto-fight toggle plays out a battle for you.
- **Four classes.** Fighter, Cleric, Thief, and Mage, each with its own stats, growth, and build path. Roll your own party or jump in with a pre-made one.
- **Per-character progression.** Each hero earns its own XP and levels independently up to level 8. On Delver and Ironbound, heroes knocked out in a fight miss that battle's XP; chapter XP goes to everyone. Every level grants one ability bump plus a build choice (learn a spell or take a perk). Pending level allocations survive saving and reloading.
- **Exploration that rewards your stats.** Line-of-sight fog, a Dexterity-driven scout radius, and twelve stat-check events spanning all six abilities. Hidden wall caches reward a perceptive (high-Wisdom) party — find them by walking past, or miss them entirely.
- **Backgrounds.** Each hero has an origin with a small mechanical edge and in-character barks at story beats.
- **Self-scaling difficulty.** Encounter strength is budgeted from floor tier, party level, equipped gear, and oath, with tougher “elite” foes appearing on deeper floors. Gear contributes 0.12 budget per gold of equipped value, reduced from 0.5 so modest upgrades no longer add disproportionate forces. Full Auto is convenient but does not guarantee victory; positioning, equipment, route choices, and supplies still matter.
- **Portable saves.** Save to a copyable code that works anywhere, plus an automatic browser save with a Continue button when storage is available.

### Controls

- **Move** with the on-screen compass pad, or the arrow keys / WASD on desktop. The party faces the way it steps.
- **Explore** to reveal the map, pick up loot, trigger events, and find the stairs down. Foes engage when you step adjacent.
- **Fight** with the current hero in initiative order, then move and act (attack, cast, guard). Or hit **Auto** to let the party fight on its own.
- **Waystation** between floors: rest, shop, manage equipment, and choose your next path.
- **Signature** uses the current hero's class ability. Its explanation appears below the board while available; the button disables after use.
- **Chronicle** opens your route and run statistics during exploration.
- **Tactics** replaces Chronicle during combat and pauses the turn loop while its guide is open. Close it to resume.
- **Area spells:** the first tap aims; a second tap on the same tile or the confirmation button casts. A different tile changes the preview without spending a charge. Single-target spells retain one-tap casting.
- **Party & Log** opens the roster and battle history on phones; **Back to Game** closes it. In portrait, use the four-arrow movement pad. Desktop turning controls and keyboard movement remain available.

## How it’s built

The codebase is deliberately structured so content is **data**, and game logic never touches the screen:

- Two pure engines — `CombatEngine` (grid combat) and `ExploreEngine` (dungeon) — hold all the rules and return plain typed signals. They never read or write the DOM.
- A single controller layer owns the screen and the state machine, reacting to those signals.
- Content lives in **registries**: `SPELLS`, `ITEMS`, `PERKS`, `CLASSES`, `BESTIARY`, `EVENTS`, `OATHS`, `BOONS`, `SIGNATURES`, `TERRAIN`, `BATTLEFIELDS`, `CONTRACTS`, the `WORLD` graph, and the `DIFFICULTY` / `XP_TABLE` tuning tables. The controller keeps campaign statistics and applies blessing bonuses to hero data before combat.

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

The tactical-depth release adds chapter completion, contract IDs, and successful-event counts to the same version 2 payload. Older saves infer previously completed chapters from their route and town state without awarding retroactive chapter XP. Successful-event history starts at zero when absent. Contract rewards already recorded in a new save cannot be collected again.

Malformed imports are validated and prepared before replacing the active run. Newly generated cache walls cannot bypass sealed vaults. Supply pickups preserve their configured amount: the quiet Gallery and Pillared Road each provide two, while legacy pickups without an amount still give one. Existing saved floor layouts are preserved rather than regenerated.

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

The 48 checks execute the actual inline script with DOM stubs. They cover the original defects and the requirement IDs in [REQUIREMENTS.md](REQUIREMENTS.md), including atomic imports, legacy saves, rewards, terrain, aim confirmation, paused Tactics, guardians, exit resumption, and the 350 KiB runtime budget. Generator checks cover 96 exit/key layouts plus 160 layouts with every secret cache opened while vault doors stay blocked.

Chromium checks covered help, journal contracts, chapter rewards, terrain labels, paused Tactics, touch preview and friendly-fire confirmation, rejected imports during combat, saved rewards, and offline interaction after loading. The six phone viewport scenarios above also passed with the boss bar, spell menu, and aim confirmation open; desktop layout passed. No JavaScript page errors occurred.

Twelve seeded, controller-driven campaigns exercised all four routes under all three oaths: six victories and six defeats, with no stalled runs. All four Wanderer routes and two Delver routes reached the ending; the four Ironbound Auto runs lost. This is limited balance evidence, not a promise that Auto wins or exhaustive testing. Physical iPhone/Safari remain unverified. Direct `file://` verification is blocked by this managed browser's administrator policy; local HTTP and offline interaction after loading were checked.

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
- `REVIEW.md` — baseline findings and reproduced defects.
- `ROADMAP.md` — bounded delivery stages and explicitly deferred work.
- `REQUIREMENTS.md` — detailed rules, acceptance criteria, and validation record.
- `Gold-Box.JPG` — the gameplay screenshot above.

## Credits & licence

Built as an homage to the SSI Gold Box engine of the late 1980s. This is an original implementation — no original assets or code are used.

Add a licence of your choice (e.g. [MIT](https://choosealicense.com/licenses/mit/)) by dropping a `LICENSE` file in the repo root.


### Optional device checks

With Playwright available to Node and Chromium at `/usr/bin/chromium`, serve this directory with `python3 -m http.server 8000`, then run `node tests/devices.cjs`. Set `GOLD_BOX_URL` to check another served URL. The game itself needs neither tool. The matrix covers 25 phone/tablet/desktop window sizes, including iPad split view and short desktop windows; it checks fitted exploration/boss/spell layouts, 44px controls, keyboard grid focus, independently scrolling menus, resize state, reduced motion, and page errors. These are Chromium checks; actual Safari and physical-device testing remain unverified.


### Release quality checks

With the local server running and development browser tools installed:

```bash
node tests/regression.cjs
node tests/devices.cjs
node tests/quality.cjs
node tests/flow.cjs
node tests/epic.cjs
node tests/campaign.cjs
```

The quality checks reproduce the paused-menu and clipboard bugs, create a party and assign equipment with keyboard controls, win a controlled manual battle, and recover portable saves with storage blocked. The flow check exercises rewards, touch aiming, save/reload, and offline play. The epic-campaign check exercises touch/keyboard councils, saved rewards, Chronicle, finale reload, crown-bearer selection, and all three endings at phone/tablet/desktop sizes. The campaign check runs three seeds over every oath/route combination: 36 runs, currently 17 victories and 19 defeats without stalls. With varied council choices, Wanderer wins 10/12, Delver 6/12, and Ironbound 1/12 in this Auto diagnostic; victories cover all three crown fates. Wanderer defeats occurred in the final tomb; harder-oath defeats occurred across several floors. This sample supports the intended difficulty ordering, but does not establish human win rates or justify broad retuning.

The **Game quality** GitHub Actions workflow runs engine, device, quality, flow, and epic-campaign checks on Chromium, Firefox, and WebKit; Chromium also runs the campaign sample. Before automatic merge/publication, wait for every PR quality job to pass and verify the final Pages deployment. This is the release procedure; branch protection has not been configured by this change. Use `GOLD_BOX_BROWSER=firefox` or `webkit` for development checks with those Playwright browsers installed. `CHROMIUM_PATH` overrides the browser executable for CI/local installations. WebKit automation is useful compatibility evidence; physical Safari on an iPhone/iPad and real hardware performance still require manual testing.

For hardware validation, try portrait/landscape, browser-bar resizing, iPad split view, pinch zoom, opening/closing each menu, aimed spells with allies nearby, browser Continue, and a save-code transfer between devices. These cannot be certified from this environment.
