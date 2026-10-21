# Sprite review — build 0.9.0

Visual assessment: **C+ → A− for the pixel-art set within this standalone game's scope**. The overall game remains A−; an art pass alone does not establish AAA quality or replace human playtesting.

## Findings and changes

| Before | Implemented |
| --- | --- |
| Nine rows used unsupported palette symbols: seven space-bearing rows and two `a` entries. The compiler silently dropped those pixels. | All 19 sprites use validated 24×24 square grids and explicit palette symbols. The compiler rejects malformed dimensions and unknown symbols. |
| Patchy outlines and inconsistent anatomy, including a partly open skull. | Shared one-pixel keylines, consistent lighting, separated limbs and readable skull/ribcage anatomy. |
| Cleric and dark acolyte shared pale, cross-like robes. | Armored sun cleric with mace versus hooded acolyte with red stole, book and candle. |
| Several casters were similar purple columns. | Mage's star hat/crystal staff; necromancer's skull staff; horned hex mask/orb; bone caller's skeletal mantle. |
| Bell Warden reused the ogre; Ash Cantor reused the necromancer. | Dedicated bell-and-steel Warden, flame-crowned Cantor and crowned, sword-bearing Sunless King. |
| Bright team backplates competed with figure colours. | Dark medallions, round hero frames and square enemy frames, guardian diamonds and a distinct awakened frame. Side identity uses shape and colour. |
| Roster used letters and Tactics lacked visual identification. | Matching decorative portraits beside existing names and statistics; larger Tactics portraits make tiny-board figures inspectable. |

All four heroes, fourteen enemies/guardians, and the party standard have authored art. Art stays inline and offline; no external images, runtime dependencies, animation loop, RNG consumption or combat-rule changes. Existing sprite IDs remain valid; only the two guardian templates point to their new identities. Battle saves are not persisted, so legacy campaign saves rebuild guardian enemies from current templates.

## Validation and limits

Reviewed enlarged and 32px contact sheets plus actual 440px-wide combat and Tactics captures. Browser checks cover four representative screen classes for unique guardian art, party/enemy frame shapes, bounded non-interactive SVG, awakened styling and named roster/Tactics portraits. The existing 25-size layout matrix and game-flow checks remain release gates, together with 51 engine checks, sprite integrity checks, balance-policy checks and the 96-run balance gate. CI runs Chromium, Firefox and WebKit before merge.

Runtime HTML: **324,527 bytes**, below **358,400 bytes (350 KiB)**. The 24×24 grid improves silhouettes and prop identity; it cannot preserve every detail on a 16px tile. Names, HP, focus labels, tile inspection and 56px Tactics portraits remain the readable reference. No physical iPhone/iPad or human art-recognition study was performed. The grade is an editorial assessment, not a measured accessibility certification.

Run `node tests/sprites.cjs` without dependencies. With the local server and optional Playwright tooling, run `node tests/sprite-browser.cjs`; the standard workflow runs both. Keep all sprites unique, correctly mapped, within bounds, and composed only of palette symbols and `.` transparency.


## Six enemy silhouettes — 0.16.0

Six additional authored 24×24 grids bring SPX to 26 entries. Shield Sentinel carries a broad sun-cross tower shield and spear; Crypt Stalker has a low lunging cloak and twin hooks; Ember Wisp is a floating ribbed funeral lantern with detached sparks; Spellbreaker has a split mitre, sealed mask and tuning fork; Grave Leech curls around a pale rib reservoir; Chain Warden wears a brass diving helm and trailing anchor-chain. All are distinct geometry using the existing palette/compiler, with bounded decorative SVG and no downloaded assets.

The six were inspected in a contact sheet; geometry, palette, uniqueness, registry resolution and device rendering are checked automatically. Readability on physical hardware remains unverified; this is small pixel-art scope, not a commercial AAA art claim.
