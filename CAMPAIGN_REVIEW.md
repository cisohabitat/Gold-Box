# Campaign, monsters and collections review — 0.10.0

The Last Dawn had a sound six-chapter, four-route structure and consequential councils. The gaps were presentation and reference: important encounters lacked immediate narrative aftermath, two route relics had little context, players could only inspect living opposition, and there was no browsable treasure guide. The War Axe existed in data but had no acquisition source.

## Delivered

- Eight authored chapter set pieces develop Ilyra, Eren, Nessa and the kingdom above the dungeon. Bell Warden, Ash Cantor and king victories now have immediate story aftermath. Chronicle retains the expanded chapter accounts.
- Astrax, the Star-Eater is an optional fourth guardian at the Observatory of Ash. The dragon is foreshadowed early, revealed along both fourth-chapter routes, and acknowledged by the king and all three endings if defeated. The original required world path and crown gates remain intact.
- Its distinctive mechanic is a telegraphed Starless Breath. The dragon spends an action marking a 3×3 area, then releases 2d6 damage there on its next active turn. The coordinates remain fixed so heroes can leave the amber tiles. Incapacitation delays release; killing the dragon removes the threat. The blast can hit either side. At half health, its once-only phase grants +1 attack, restores at most one breath charge up to the existing maximum, and summons one skeleton.
- A rested company can accept the hunt at a waystation after four completed chapters and the current council decision. The acceptance button follows a page explaining the danger, preparation and reward. It is optional and never required to reach the king. Defeat ends the run; voluntary Restart preserves the pre-hunt town Continue when storage is available, following existing combat-save semantics.
- Victory grants the Eclipsescale Mantle (+2 AC, any class), one supply and normal battle XP once, then returns to the same waystation, including any pending level choices. A saved boolean prevents duplicate rewards and adds the freed constellations to the ending. Old v2 saves default to no hunt completion and receive no retroactive reward.
- An illustrated Bestiary covers all 15 creatures with authored lore, base HP/AC/attack/damage/movement/range, registry-backed spell charges, known locations and counterplay. The four guardians show run completion when known. Elite/council/live changes are explicitly distinguished from reference statistics.
- Treasure & Relics covers all 15 equipment/consumable entries plus the Sunless Crown, including exact effects, classes, value, acquisition sources, current satchel counts and equipped heroes. The War Axe is now sold by the trader. Ownership is current inventory, not a permanent collection achievement. Title browsing shows reference data without presenting an abandoned run as an active collection.
- A Legends page joins the hunt briefing to all eight chapter set pieces. The pages are reachable from title, Party & Log and waystations; search, relevant category filters, empty states, internal navigation and Back work without external links. Combat pauses for the atlas and resumes one appropriate loop while preserving manual aim.

## Limits and validation

These changes strengthen the campaign's authored arc and monster identity within the standalone scope. They do not establish a commercial AAA rating. Fine details on tiny combat tiles remain available through larger portraits and readable reference text. The full guide intentionally contains campaign spoilers; it is not an encounter-unlock system.

Local checks include script syntax, 58 engine/controller regressions, 4 balance-policy checks, 3 sprite-integrity checks, the 25-size device matrix, existing quality/flow/epic/polish/sprite browser scenarios, and the new atlas/hunt flow. The atlas scenarios cover search/filtering, equipment counts/escaped names, phone/landscape/tablet/desktop layout, focus isolation/return, paused enemy resumption, retained aim, nine danger tiles, a real controller hunt, exactly-once reward and town Continue. Final Chromium/Firefox/WebKit and 96-campaign evidence is recorded in the implementation PR.

The deterministic main-campaign policy skips the optional hunt; its report does not measure hunt difficulty. A separate prepared level-four Wanderer sample (12 seeds, no gear/boons/shopping) records 12 Auto victories with no stalls. This is an accessibility smoke check, not a human difficulty estimate or proof that an unprepared company wins. Broader oath/level, human and physical Safari testing remain useful follow-up work.

No external assets or runtime dependencies were added. The eight-node graph, v2 save format, safe Restart, visible log and 350 KiB limit remain release constraints. The runtime is 350,700 bytes (below 358,400 bytes / 350 KiB); final publication evidence is recorded in the implementation PR.

## Campaign payoff review — 0.11.0

The review reproduced two delivery problems: guardian story text fell out of the two visible log entries immediately, and changing the choir, second fork and final-fire decisions left the ending identical. Both now have targeted engine and real-browser regressions.

Guardian wins open a portrait and authored aftermath, with pending level choices first. Acknowledgement or Escape resumes deferred stairs. Movement and town/council actions remain blocked behind it; title/import/new-game clear the transient panel. Existing saved progress reconstructs guardian aftermaths in Chronicle, so reloading does not grant rewards again or require a new save schema. The new four-size browser suite covers keyboard focus, short landscape scrolling, level priority, deferred stairs and town Continue.

The epilogue now recalls Gallery, the choir/bell iron, the legion/shrines and the vanguard/last ember, in addition to the existing refugees, first fork, named company, fate/bearer and hunt. Missing and legacy choices do not invent plan outcomes. Every later council’s two plans are checked for distinct epilogues.

Eclipsescale now grants +2 AC and reduces each damaging spell hit by 2, to a minimum of zero. This applies to single-target and area spells, including friendly fire, only while equipped. It does not block weapons, poison, terrain or spell statuses. Starweave retains its higher +3 AC; Auto Gear only prefers Eclipsescale at equal AC. Inventory, hunt briefing and atlas disclose the rule. Targeted checks cover transfer/removal, friendly fire and zero clamping.

The expanded optional-hunt diagnostic runs 12 seeds for each of three oaths at levels three and four: 72/72 Auto victories, no stalls, with no gear, boons or shopping. It is now reproducible through HUNT-05 in tests/regression.cjs. This exposes how accessible the prepared hunt is; it does not certify human difficulty or justify calling it a hard challenge. The hunt remains optional, with telegraphed counterplay and a distinctive reward. Main-campaign evidence is recorded separately in BALANCE.md.

Local checks: inline syntax, 62 regressions, four sprite/art checks, four balance-policy fixtures, the 25-size device matrix, keyboard/clipboard/Restart/flow/polish/sprite/epic/atlas suites and the new four-size campaign-payoff suite pass in Chromium. All three CI browsers remain the publication gate. Physical Safari and human complete-run playtesting remain unverified. Long source-only block comments were trimmed to preserve readable runtime code and the 350 KiB cap; runtime is 354,352 bytes.

Pacing investigation: an expanded pre-tuning 144-run baseline reproduced the original default outcomes, confirmed Delver’s Ash Cantor pressure (22 defeats/45 attempts), and showed 23/23 king victories among survivors. The bounded change lowers only the Cantor encounter budget multiplier from 0.55 to 0.50, preserving its stats, spells and phase. The paired 96-run after sample passes all existing criteria: Wanderer 24/32, Delver 17/32, Ironbound 8/32, with no stalls. Delver Cantor victories are 22/29 and final-king victories 17/21; see BALANCE.md for interpretation and selection limits.

## Distinct route objectives — 0.12.0

Four branch chapters now have different map actions: find/escort scouts to entrance camp, read ordered name stones without resetting mistakes, return the recovered Dawnblade to the legion standard while retaining it, and choose two of three shrines with bounded once-only benefits. Each fresh run encounters two goals. The original guardian/council/finale sequence remains; there are no new enemies or timers, and chapter XP is unchanged. Blue labelled beacons are known from Eren’s map through fog without revealing corridors or enemies. Progress appears in the HUD, with the full briefing at the top of Chronicle. Shrine choices commit on entry.

Task placement consumes no RNG and leaves loot/key/door geometry intact. Camp and sites are reachable before the vault. The exploration task stores partial/complete state inside v2 saves. Missing/null tasks preserve existing legacy floors without adding sites or benefits; later floors receive the new goals. Invalid geometry, duplicate/out-of-order indices, IDs, completion states and unfinished town tasks reject before mutation.

The unused first-person drawing functions were removed to fund gameplay under the 350 KiB cap. Shared map palettes/shading, overhead rendering and movement APIs remain. Runtime: 342,507 bytes. No runtime dependencies.

Local evidence: 66 regression checks including 256 generated/fallback objective probes; four sprite/art checks; four balance-policy fixtures; the existing 25-size device/quality/flow/epic/guardian-payoff/atlas/polish/sprite suites; and a new actual-movement objective suite at 320×568, 956×350, 820×1180 and 1440×900. The latter covers exit gates, beacons/Chronicle/HUD, scout return, ordered-name Continue, retained sword, alternate shrine choice and saved completion. Controlled older flow fixtures explicitly mark their synthetic chapter-skip task complete; the new suite and campaign runner traverse actual maps.

The full 96-campaign Auto gate passes: wanderer 26/32, delver 18/32, ironbound 7/32, no stalls; successful runs completed two objectives and five councils. The policy takes the first two shrine beacons encountered on loot/objective paths and excludes optional hunts/shopping. New movement and shrine benefits affect later RNG/actions, so comparison with 0.11.0 is not a paired tuning experiment. All cross-browser/publication evidence belongs in the release PR. Physical-device/human validation remains outstanding.

## Guardian follow-up — 0.13.0

The earlier 2d6 breath above records the 0.10 baseline. Current Astrax uses 3d6 and 46 base HP. The Warden's rally and Cantor's Cinderburst now spend one turn channeling; weapon damage interrupts these two channels and consumes their charge. Their deaths remove warnings; incapacitation postpones release. Auto can escape damaging fixed areas without bypassing movement reactions. Spell damage and misses do not break channels; Astrax remains uninterruptible.

The grade moves from B+ toward A− within the single-file scope, subject to the full release gate. More warning/counterplay improves tactical agency; it does not prove harder bosses or human balance. No floors, mandatory encounters, save schema or council rewards changed.

Local 0.13.0 balance: Wanderer 27/32, Delver 16/32, Ironbound 10/32; 96 completed runs, no stalls, unchanged canaries pass and every Wanderer route has a victory. Runtime 345,004 bytes (<350 KiB). All existing Chromium browser suites and the new guardian suite pass. Exact-head Chromium/Firefox/WebKit CI and live deployment evidence belong in the release PR.

## Fresh review — 0.13.1

Overall grade reassessed to B+; the previous A− weighted automated reliability too heavily. This release improves immediate inventory recovery and manual combat information (current turn forecast and destination risks), and prevents wasted healing at full HP. It adds no chapters, encounters, rewards or combat-stat changes. Human campaign difficulty and native Safari remain open validation gaps; campaign structure and existing unique artwork are retained.

Build 0.13.1 local evidence: 75 engine/controller checks, four sprite/art checks and four balance-policy checks pass; all eleven Chromium browser suites pass. The 96-run canary remains 27/32 Wanderer, 16/32 Delver, 10/32 Ironbound with no stalls. Runtime 347,155 bytes (<350 KiB). Exact-head cross-browser and live publication results are recorded in the release PR; physical Safari/human difficulty remain unverified.

## Guardian arenas and council support — 0.14.0

Distinct arena terrain now gives each convergence guardian, King and optional dragon its own battlefield. Their existing bounded bloodied phases also change terrain once, with no immediate damage or new summon/action. Lantern road/remembered names add healing anchors before the Bell; releasing the choir shelters two tiles from the Cantor's fire. Existing council/finale gates and saves remain compatible.

Lantern Mantle's terrain-fire protection and Starweave's spell-control save ward create contextual armour choices alongside Eclipsescale. Party and atlas expose their exact tradeoffs. Full-campaign and isolated scripted strategy evidence are reported separately; neither measures human win rates. Size is a soft target under the user's updated preference. Overall B+ remains the current assessment.

Build 0.14.0 local evidence: 84 engine/controller checks, four sprite/art checks and four policy checks pass; all twelve Chromium browser suites pass. The full 96-campaign canary gives 28/32 Wanderer, 23/32 Delver and 15/32 Ironbound with zero stalls and unchanged thresholds. All 288 isolated strategy scenarios terminate; 72 prepared Observatory hunt probes win. Runtime 354,308 bytes (346.0 KiB), reported against the soft 350 KiB target. Exact-head cross-browser/publication evidence is recorded in the release PR. Human/physical-device limits remain open.

## Patrol patterns and defeat learning — 0.15.0

Ordinary encounters now use Shield & Bow, Split Watch, Hex Cell, Rallying Warband or Grave Procession, with budget-safe role packets and distinct deployment. Existing enemies, arena/guardian rules, chapter goals, council rewards and ending gates remain intact. Older encounter descriptors derive profiles from their saved pools.

After defeat, actual battle evidence and two relevant suggestions help plan the next run. Reports are transient and do not restore lost runs or replace the existing save rules. Automated balance and browser evidence remain separate from human difficulty and physical Safari testing.

Build 0.15.0 local evidence: 92 engine/controller checks, four sprite/art checks and four policy checks pass; all thirteen Chromium browser suites pass. The full 96-campaign canary gives 24/32 Wanderer, 24/32 Delver and 7/32 Ironbound, with zero stalls and unchanged criteria. All 288 guardian probes terminate, with unchanged outcomes. Runtime 363,723 bytes (355.2 KiB), slightly above the user-approved soft 350 KiB target. Exact-head cross-browser and live publication evidence is recorded in the release PR. Human/physical-device limitations remain open.


## Chapter ecology — 0.16.0

The four routes now introduce different ordinary threats: Warren stalkers and Gallery sentinels first, Catacomb wisps next, then Ossuary chains/leeches/silencers or Pillared Road sentinels/leeches/silencers/stalkers. Deep Stair and Tomb patrols recombine these kits. All choices remain within the existing encounter budget/cap and six-chapter graph. Guardian retinue pools and the opening floor remain unchanged; old generated encounters keep their saved creatures. The Bestiary records each habitat and counter.

Full-campaign Auto results belong in BALANCE.md; these are regression diagnostics, not observed human pacing or a claim that every run encounters every new species.


## The company’s own promises — 0.18.0

Four staged companion vows add eight choices alongside the five public councils. The Fighter teaches Tamsin what a watch owes the living or the fallen; the Thief helps Vey break debt chains or restore grave-goods; the Cleric joins Mother Alis’s refuge or vigil; the Mage shares Eren’s theorem or destroys the binding. Eight existing backgrounds supply personal openings and closure. Later roads and all crown fates remember the named owner and consequence, with a challenge when that owner becomes ruler.

Goals use existing company victories, resolved events, caches and completion of the Descent of Ash. Tasks start at pledge and require a later completed waystation to resolve. Rewards are one potion, 20 gold or one supply according to plan, once per class; no new combat ally, permanent bonus, map or mandatory gate. Duplicate/missing classes and legacy runs remain supported. Unfinished promises stay unfinished in endings. See current BALANCE.md for the changed varied-vow Auto policy and its limits; this is not human playtest evidence.
