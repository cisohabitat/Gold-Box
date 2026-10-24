# Game balance — build 0.22.0

Default party; real Auto combat; loot-first exploration, route objectives, usual camp/boon/council/vow rules; take the first offered item in encountered three-way caches; no shopping. First options match the previous single rewards. Geometry, encounter placement and RNG consumption are unchanged by cache substitution.

Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.

| Oath | Wins / runs | Win rate | 95% interval | Mean depth |
| --- | --- | --- | --- | --- |
| wanderer | 29 / 32 | 90.6% | 75.8%–96.8% | 6.00 |
| delver | 20 / 32 | 62.5% | 45.3%–77.1% | 5.53 |
| ironbound | 18 / 32 | 56.3% | 39.3%–71.8% | 5.00 |

| Route | Wanderer | Delver | Ironbound |
| --- | --- | --- | --- |
| 0 | 8/8 | 5/8 | 3/8 |
| 1 | 6/8 | 5/8 | 5/8 |
| 2 | 8/8 | 3/8 | 5/8 |
| 3 | 7/8 | 7/8 | 5/8 |

Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.

Checks: PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.

Per-floor defeats, guardian pressure, and full seeded run records are in report.json.


## Equipment-decision interpretation — 0.22.0

Existing canary thresholds, encounter constants, item/guardian stats and safety limits are unchanged. The three caches replace one ordinary ground item each, without extra reward count or gameplay RNG. First-option diagnostics preserve the former reward identities. Equipment summaries and scouting previews are read-only and add no combat bonuses. The first-option policy intentionally does not certify balance for every human loadout/choice; alternative integration coverage is separate below.

The previous 0.21.0 sample was Wanderer 29/32, Delver 20/32, Ironbound 18/32. This sample is wanderer 29/32, delver 20/32, ironbound 18/32. Compare only within the stated policy. Loot planners read map metadata, so these are not human win-rate estimates.

## Alternative reward integration

Three additional default-party Wanderer campaigns use Warren/Ossuary, no shopping and cache index `(sample + chapter depth) % 3`. The planner reads map metadata as in the canary. All three complete, all three win, with no stalls. Each of the three alternatives in each of the three caches is acquired through actual map movement, claiming and continued campaign play. No alternative adds an extra item on top of the replaced find.

| Sample | Scout’s Lockbox | Vigil’s Bequest | Courier’s Pack | Outcome |
| --- | --- | --- | --- | --- |
| 0 | scout_bow | potion_heal | ward_charm | victory |
| 1 | ember_focus | iron_helm | potion_heal | victory |
| 2 | smoke_phial | copper_ring | pilgrim_boots | victory |

This three-run integration sample covers options, not all routes/oaths/human strategies. The unchanged first-option 96-run canary remains the release balance gate.

## Acquisition, companion and source checks

Eight companion-directed campaigns: 8 wins/0 defeats, zero stalls; each of the eight plans fulfilled four times. Eight treasure-directed campaigns: 7 wins/1 defeats, zero stalls; all 24 recent additions acquired in every company. The treasure planner prioritizes choice caches as item loot, takes index 0, and seeks guarded/hidden sources/shop stock as before. These privileged directed policies remain separate from the difficulty sample.

The 192-floor source audit counts choice options as mutually exclusive opportunities; it does not claim all three items are awarded. All six head/feet/accessory relics and four class relics retain their sources. Item/art count stays 39 plus the crown. Matching-RNG buildDungeon probes cover 24 configurations and fallback layouts, with identical geometry/encounters/events and first reward after replacing choice records by their first option. No old generated floor is retrofitted.

## Safety and presentation evidence

142 engine/controller checks include once-only claims, full bags, no class fit, stale/invalid indices, malformed/wrong-chapter/duplicate/noncanonical cache records, atomic rejection before combat callbacks change, portable recovery, unclaimed/claimed Continue and RNG/base-stat isolation. Scouting excludes unseen, unspotted and cleared descriptors; never composes an encounter; and distinguishes spell damage, spell control, poison, weapon AC/wards and terrain. Coverage counts standing heroes and is not immunity.

All 19 Chromium suites pass, including actual four-size reward deferral/claim/reload, class/hand comparisons, safe heading/status focus, full-bag recovery and fog-limited reports. Local Firefox passes the new four-size decision suite. All 288 isolated guardian probes terminate; outcomes remain the 0.21.0 figures. Physical Safari and human full campaigns remain unverified. Exact-head Chromium/Firefox/WebKit conclusions, artifacts, merged blobs, Pages and live checks belong in the release PR.

Build 0.22.0 local acceptance: 142 engine/controller checks, four sprite/art and four policy checks, 192-floor source audit, 288 guardian probes and all 19 Chromium browser suites pass. The new decision flow also passes local Firefox at all four device sizes. Unchanged 96-run canaries: wanderer 29/32, delver 20/32, ironbound 18/32 victories, zero stalls. Companion-directed 8/8 and treasure-directed 7/8 victories; all eight vows and all 24 recent item additions acquired across their respective samples. Three varied-choice campaigns win 3/3 and acquire all nine cache alternatives. These diagnostic policies are not human difficulty estimates. Runtime 451,387 bytes (440.8 KiB), +12,792 bytes over 0.21.0; soft size policy, offline single file and overall B+ remain. Exact-head three-browser and Pages/live evidence is recorded in the release PR.


### 0.23.0 placement correction

No encounter budgets, enemy stats, reward quantities, difficulty coefficients or canary thresholds change. Reachability excludes stairs; dynamic spawns also exclude locked doors and cleared encounter keys. Rare unsafe pinned placements move to the accessible side without losing their prizes. The full 96-run canary and 19 browser suites remain release requirements, alongside the separate 8 companion, 8 treasure and 3 varied-choice campaigns. Record actual new evidence in the release PR; previous samples remain historical.


### 0.24.0 tactical chapter encounters

The new strategic post selection and eight ordinary terrain arenas change which battles the loot-first route meets and how those battles unfold. Optional one-action stations alter shared cover/sanctum/ember tiles; Auto claims only immediately helpful adjacent stations, without pursuing remote ones. Enemy composition budgets/stats, fight counts, XP/prizes, guardian arenas and difficulty coefficients are unchanged. This is not a matching-RNG ablation of difficulty.

Retain the 96-run no-shopping canary and all existing thresholds. Companion (8), treasure (8) and varied-cache (3) campaigns remain separate integration policies. All sixteen authored field actions also require rule/browser coverage, including victories with ignored objectives. Final counts and policy limits are recorded in the release PR. Physical devices and human full-run pacing remain unverified.

Local 0.24.0 canary acceptance (same gameplay rules as the final source): **30/32 Wanderer, 24/32 Delver, 15/32 Ironbound victories**, zero stalls, all unchanged canaries pass. Routes 0–3 W/D/I: 7/6/4, 7/6/2, 8/7/4, 8/5/5 (each out of eight). This seeded loot-first/no-shopping policy is not a human win-rate estimate. Exact-head CI and separate directed campaign evidence are recorded in the release PR.


### 0.25.0 exploration changes

Scout/key trips and ordered-name circuits now reduce unnecessary movement. Rare service routes shorten existing detours while preserving locks/secrets. This can change hazards, patrol contacts and seeded RNG; budgets, enemy stats, task rewards and difficulty coefficients remain unchanged. The waystation’s existing free rest/trading can now be followed by a deliberate return to finish exploring the completed floor; finite encounters, XP, councils and loot remain once-only.

Keep all 96-run canary thresholds and the separate 8+8+3 directed policies. Paired graph-distance evidence is not a human-time estimate or a matching-RNG difficulty ablation. Report actual final canaries and directed outcomes in the release PR. Physical-device/human balance remains open.

Paired route audit: 192 maps contain 23 useful service connections on 21 maps, saving at least eight steps per connection; separate entrance-to-find distances change only 17,641→17,637, so no broad shortcut speedup is claimed. In 24 paired probes each, scout/key/camp circuits total 1,168→576 steps and ordered-name circuits 2,563→1,799, with every sampled circuit improved. These fixed-map graph probes are not played-campaign distances or human time estimates.

Local full 0.25.0 canary: Wanderer 31/32, Delver 28/32, Ironbound 14/32 victories, zero stalls; all original thresholds pass. The shortcut-search allocation optimization is separately checked against 256 identical passage selections/carved maps; full final-head CI repeats the campaigns.


## Bell Warden climax — build 0.26.0

The only guardian combat addition is one half-health Last Toll: 1d4+1 spell damage to a fixed 3×3 area after a normal preparation action, releasing on the next active turn. Movement or damaging weapon interruption counters it. Existing Warden base/elite stats, encounter budget, +1 attack, single skeleton, phase sanctums, XP and other guardians remain unchanged. The bequest replaces its Aegis drop with Aegis-or-Choirglass, never both; default campaigns keep taking Aegis. Choirglass is controlWard2 in the existing accessory slot, without AC/movement/damage bonuses or stacking. No difficulty threshold changes.

Local 288 scripted arena probes complete without stalls. Bell Warden victories are Wanderer 24/24, Delver 11/24, Ironbound 4/24; these are prepared tactical probes, not full-run or human estimates. Three full varied-cache campaigns win 3/3, retain all nine road-cache alternatives and acquire both guardian bequests, including Choirglass through actual map play. Choice policy now uses modulo the current option count, preserving the three road-cache cycles and covering the two guardian options. First-option policies remain unchanged.

The release still requires the full 96-run canary, eight companion-directed, eight treasure-directed and three varied-choice campaigns on the exact tested head, plus all three browser jobs. Final seed/route outcomes, artifact and publication evidence are recorded in the release PR. The guardian/treasure-directed policies are separate evidence; do not mix them into human difficulty claims. Physical-device and human campaign pacing validation remain open; overall grade remains B+.

Runtime for build 0.26.0: **484,417 bytes (473.1 KiB)**, +7,883 over 0.25.0. One offline HTML file, no runtime dependencies or downloaded assets added. The 350 KiB target remains soft.

Local unchanged 96-run canary passes with zero stalls: Wanderer **31/32**, Delver **24/32**, Ironbound **16/32** victories. Per-route W/D/I: 0 = 7/8, 5/8, 2/8; 1 = 8/8, 7/8, 5/8; 2 = 8/8, 6/8, 4/8; 3 = 8/8, 6/8, 5/8. Every Wanderer route has victories; all original difficulty bands/order checks pass. Changing one fight can alter downstream random rolls and Auto choices, so this is not a controlled attribution of each outcome to Last Toll. Final-head CI repeats the full sample and directed checks before publication.


## Ash Cantor climax — build 0.27.0

Cantor base/elite stats, budget 0.50, original three spell slots/charges and once-only +1 attack/damage/skeleton remain unchanged. Last Procession changes its positioning: advance using normal movement before a ranged cast, or strike in reach. Pending Cinderburst releases first at its original coordinates. Two optional one-action braziers remove four terrain-fire tiles each and keep their lanes cool at ignition; Auto only uses an adjacent station when it immediately protects a standing ally. No extra spell, turn, XP, reward or mandatory gate is added.

The bequest replaces Covenant with Covenant-or-Censer. First-option diagnostics still take Covenant; the support relic appears only in the separate varied-choice sample. Censer is wearer-only emberGuard2/healPower1 in the existing off-hand slot, with strongest-source healing/wards and normal hand conflicts; no AC or spell-damage protection.

The unchanged 96-run canary passes with zero stalls: Wanderer 30/32, Delver 25/32, Ironbound 16/32 victories. Per-route W/D/I: 0 =7/8,5/8,2/8; 1 =7/8,8/8,5/8; 2 =8/8,5/8,4/8; 3 =8/8,7/8,5/8. All original difficulty bands/order and Wanderer route criteria pass. These seeded outcomes are not a controlled attribution to a single tactic or a human difficulty estimate.

All 288 prepared guardian scenarios complete without stalls; Cantor wins are Wanderer 21/24, Delver 6/24, Ironbound 6/24. Three varied-choice full campaigns win 3/3, acquire all nine road-cache alternatives, both Warden alternatives and both Cantor alternatives, including the new censer through actual map play. Full exact-head CI repeats 96+8 companion+8 treasure+3 choice campaigns before publication. Final outcome/artifact/three-browser and Pages/live evidence is recorded in the release PR. Human pacing and physical iPhone/iPad Safari remain unverified; overall B+ remains.

Runtime for build 0.27.0: **492,132 bytes (480.6 KiB)**, +7,715 over 0.26.0. One offline HTML file; no runtime dependencies or downloaded assets added. The 350 KiB target remains soft.

## 0.28.0 — visual/manual-play fixes

The release changes presentation and input only: explicit Guard & End, current-actor HP, optional enlarged targeting, map guidance, equipment/waystation pages and decorative arena architecture. Difficulty tables, encounter budgets, enemy/hero stats, movement/reactions, AI, damage, XP, supply rules, rewards and the 96-run policy remain unchanged. New page navigation spends nothing and precise inspection cannot act until its explicit button passes the normal legality checks. Arena scenery grants no terrain benefit.

Retain all existing 96 release canaries plus 8 companion-directed, 8 treasure-directed and 3 varied-choice campaigns, and 288 prepared guardian probes. The exact-head CI artifact and release PR record the current outcomes; this UI work does not justify retuning thresholds or treating Auto outcomes as human difficulty measurements.

## Fresh playthrough pacing correction — 0.29.0

A live unseeded Wanderer/UI run finished all six chapters and the optional dragon: 13 battles, 70 foes, four fulfilled vows, 821 steps; ordinary fights and some guardian turns used Auto. Cantor entered Last Procession at 4/43 HP after a critical hit and reaction, while king victory to final review took two steps. These observations motivate targeted timing/placement changes, not a global difficulty claim.

Cantor now shifts at two-thirds HP, retaining its stats, budget, original spell charges, once-only buff/skeleton and normal actions. Other guardians retain half HP. New final maps place the crown 8–12 walking steps from the exit, with the king beside its approach in the original pre-stair reachable component; existing saved maps keep their positions. No extra HP, forced invulnerability or extra action is added. The 256-map audit checks distance/key safety and registry immutability; all previous map/source/guardian probes and the unchanged 96+8+8+3 release campaigns remain mandatory. Record actual final canary outcomes in the release PR; do not loosen bands to accommodate the change.


## Large-footprint release — 0.30.0

The local unchanged 96-campaign canary passed with **28/32 Wanderer**, **26/32 Delver** and **15/32 Ironbound** victories, **zero stalls**, and every Wanderer route completed. These replace the previous 0.29.3 sample's 29/32, 26/32 and 14/32 for this build. All base monster HP, attack/damage, speed, spell charges, encounter budgets and gate thresholds remain unchanged; Astrax, ogres and giant spiders now occupy real 2×2 footprints.

Policy remains default party, loot-first exploration with map metadata, Auto combat/gear, no shopping, camping below 70% party HP and the existing objective/council/vow/reward policy. This is a broad regression canary, not a human win-rate estimate. New geometry changes positions, targeting and later RNG consumption, so results are not a controlled single-encounter comparison. Gallery/Pillared Road won all eight Ironbound attempts in this sample while Warren/Pillared Road won one of eight; route and human balance need broader evidence. Cross-browser and the additional 8+8+3 acquisition/vow campaigns remain release gates, with exact-head results recorded in the PR.

Local validation passed the engine/controller checks, existing policy/art/source/map audits and 288 guardian scenarios, all 27 Chromium browser suites, and the new large-creature edge, occupancy, reaction, terrain, spell-count and old-save checks. Browser emulation does not establish physical iPhone/iPad Safari behavior. Runtime: 512,641 bytes (500.6 KiB), +3,681 over 0.29.3; one offline HTML file with reused inline art and no new dependency.

The separate three varied-choice campaigns use the normal Return to floor action when arriving at a waystation with pending choice loot, then prioritize claiming those finds before descending. A guardian defeated while standing on the stairs can otherwise leave its bequest behind. This repairs the diagnostic driver's acquisition path; its three seeds, no-shopping Auto combat and all option-coverage assertions remain unchanged. The other 112 campaign policies are unchanged.
