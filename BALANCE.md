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
