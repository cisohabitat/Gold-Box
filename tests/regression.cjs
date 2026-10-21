// Dependency-free checks against the real inline game script. Run: node tests/regression.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {harness}=require('./harness.cjs');

test('combat level allocations survive autosave, reload, and confirmation',()=>{
  const {run}=harness();
  run("enterCombat({pool:['goblin']},'2,2');cancelTurn();game.phase='won';game.xpEarned=100;resolveCombat();const code=encodeSave(saveState());levelUp=null;applySave(decodeSave(code));");
  assert.equal(run('party[0].level'),2);
  assert.equal(run('levelUp.entries.length'),4);
  assert.equal(run('party.every(h=>h.pendingLevels===1)'),true);
  run('autoAssignLevelUp();');
  assert.equal(run('party.every(h=>h.pendingLevels===0)'),true);
  assert.equal(run('party[0].perks.length'),1);
  assert.equal(run("decodeSave(persistRead()).party.every(h=>h.pending===0)"),true);
});

test('event level allocations also survive loading before the event modal closes',()=>{
  const {run}=harness();
  run("applyEventOutcome({xp:100},party[0]);autosave();const code=persistRead();eventLevelUp=null;applySave(decodeSave(code));");
  assert.equal(run('levelUp.entries.length'),4);
});

test('legacy v2 codes load with safe defaults and keep inventory and equipment',()=>{
  const {run}=harness();
  run("bag.items.push('potion_heal');party[0].equip.weapon='fine_sword';const old=saveState();delete old.campaign;old.party.forEach(h=>delete h.pending);const ok=applySave(decodeSave(encodeSave(old))); ");
  assert.equal(run('ok'),true);assert.equal(run('campaign.oath'),'delver');
  assert.equal(run('campaign.boons.length'),0);assert.equal(run('party[0].equip.weapon'),'fine_sword');
  assert.equal(run("bag.items.includes('potion_heal')"),true);
});

test('portable save works with localStorage blocked',()=>{
  const {run}=harness({storageBlocked:true});
  assert.equal(run('storageOK'),false);
  assert.equal(run('applySave(decodeSave(encodeSave(saveState())))'),true);
});

test('archer retreat provokes an adjacent hero before shooting',()=>{
  const {run}=harness();
  run("const h=makeParty()[0],ar=spawnMonster('archer',0,false);const battle=new CombatEngine([h],[ar],10,10);h.pos={x:3,y:3};ar.pos={x:4,y:3};Rules.attack=()=>({hit:true,crit:false});battle._rangedTurn(ar,[h]);");
  assert.equal(run('h.aooUsed'),true);
  assert.equal(run("battle.log.some(e=>e.t.includes('seizes the opening'))"),true);
});

test('auto Fireball avoids all allied collateral',()=>{
  const {run}=harness();
  run("const team=makeParty(),mage=team[3],foe=spawnMonster('ogre',0,false);const battle=new CombatEngine(team,[foe],10,10);mage.pos={x:0,y:0};team[0].pos={x:4,y:4};team[1].pos={x:4,y:5};team[2].pos={x:5,y:4};foe.pos={x:5,y:5};mage.spells=[{id:'fireball',uses:1,max:1}];mage.signatureUsed=true;team[0].hp=team[1].hp=team[2].hp=1;battle.actAuto(mage);");
  assert.equal(run('team.every(h=>h.alive)'),true);
  assert.equal(run('team.slice(0,3).every(h=>h.hp===1)'),true);
});

test('Auto on/off/on maintains one timer and each actor acts once',()=>{
  const h=harness(),{run}=h;
  run("game=new CombatEngine(party,[spawnMonster('goblin',0,false),spawnMonster('orc',1,false)],10,10);mode='combat';game.order=['p1','e0','e1','p2','p3','p4'];game.turnIndex=0;game._begin();const calls=[];game.actAuto=c=>calls.push(c.id);toggleAuto();toggleAuto();toggleAuto();");
  assert.equal(h.timers.size,1);
  h.tick();h.tick();h.tick();
  assert.equal(run('JSON.stringify(calls)'),JSON.stringify(['p1','e0','e1']));
});

test('restart invalidates a queued enemy turn',()=>{
  const h=harness(),{run}=h;
  run("game=new CombatEngine(party,[spawnMonster('goblin',0,false)],10,10);mode='combat';game.order=['e0','p1','p2','p3','p4'];game.turnIndex=0;beginTurnFlow();showStart();newGame();");
  assert.equal(h.timers.size,0);assert.equal(h.tick(),false);
  assert.equal(run('game'),null);assert.equal(run('mode'),'explore');
});

test('incapacitated actors cannot attack, move, cast, or use a signature',()=>{
  const {run}=harness();
  run("const h=party[3],foe=spawnMonster('goblin',0,false),battle=new CombatEngine(party,[foe],10,10);h.statuses=[{type:'hold',duration:2}];foe.pos={x:1,y:7};");
  assert.equal(run('battle.doAttack(h,foe)'),false);
  assert.equal(run('battle.moveTo(h,1,7)'),false);
  assert.equal(run('battle.castSpell(h,SPELLS.magic_missile,foe)'),false);
  assert.equal(run('battle.signature(h)'),false);
});

test('every class signature works once per battle and resets next battle',()=>{
  const {run}=harness();
  run("const battle=new CombatEngine(party,[spawnMonster('ogre',0,false)],10,10);party.forEach(h=>h.hp=1);party[3].spells.forEach(sp=>sp.uses=0);");
  assert.equal(run('battle.signature(party[0])'),true);
  assert.equal(run("party.every(h=>h.statuses.some(s=>s.type==='rally'))"),true);
  assert.equal(run('battle.signature(party[0])'),false);
  assert.equal(run('battle.signature(party[1])'),true);
  assert.equal(run('party.every(h=>h.hp>1)'),true);
  assert.equal(run('battle.signature(party[2])'),true);
  assert.equal(run('battle.signature(party[3])'),true);
  assert.equal(run('party[3].spells.every(sp=>sp.uses===1)'),true);
  run("new CombatEngine(party,[spawnMonster('ogre',0,false)],10,10);");
  assert.equal(run('party.every(h=>!h.signatureUsed)'),true);
});

test('Crypt Lord bloodied phase summons exactly two guards once',()=>{
  const {run}=harness();
  run("const boss=spawnMonster('crypt_lord',0,true),battle=new CombatEngine(party,[boss],10,10);boss.hp=Math.floor(boss.maxHp/2);battle._checkEnd();battle._checkEnd();");
  assert.equal(run('boss.awakened'),true);
  assert.equal(run('battle.living("enemy").length'),3);
  assert.equal(run('boss.statuses.filter(s=>s.type==="sunless_wrath").length'),1);
});

test('blessings cannot be duplicated and survive portable saves',()=>{
  const {run}=harness();
  run("openTown();claimBoon('steel');claimBoon('steel');const code=encodeSave(saveState());applySave(decodeSave(code));");
  assert.equal(run('campaign.boons.length'),1);assert.equal(run('party[0].campaignBonus.atk'),1);
  assert.equal(run('campaign.shrines.length'),1);
});

test('oath changes encounter strength and its choice persists',()=>{
  const {run}=harness();
  run("Math.random=()=>0.5;const easy=composeEncounter({pool:['goblin']},{floor:0,difficulty:OATHS.wanderer.budget});const hard=composeEncounter({pool:['goblin']},{floor:0,difficulty:OATHS.ironbound.budget});campaign.oath='ironbound';applySave(decodeSave(encodeSave(saveState())));");
  assert.equal(run('hard.length>easy.length'),true);assert.equal(run('campaign.oath'),'ironbound');
});

test('generated floors keep exits reachable and keys outside the locked vault',()=>{
  const {run}=harness();
  const failures=run(`(()=>{const errors=[];for(const spec of Object.values(WORLD))for(let i=0;i<12;i++){
    const cfg=generateLevel(spec),d=buildDungeon(cfg),carved=new Set();for(let y=0;y<d.h;y++)for(let x=0;x<d.w;x++)if(d.tiles[y][x]!=='#')carved.add(key(x,y));
    const all=_flood(carved,d.start,new Set());if(!all.has(key(d.exit.x,d.exit.y)))errors.push(spec.id+': exit unreachable');
    if(d.doors.size){const before=_flood(carved,d.start,d.doors);const keys=Object.entries(d.loot).filter(([k,v])=>v.type==='key');if(!keys.some(([k])=>before.has(k)))errors.push(spec.id+': no reachable key');}
  }return errors;})()`);
  assert.equal(failures.length,0,JSON.stringify(failures));
});

test('legendary equipment remains class compatible and hero names escape HTML',()=>{
  const {run}=harness();
  assert.equal(run('canUse(ITEMS.dawnblade,party[0])'),true);
  assert.equal(run('canUse(ITEMS.dawnblade,party[3])'),false);
  assert.equal(run('canUse(ITEMS.starweave,party[3])'),true);
  assert.equal(run('escapeHTML("<b>Hero</b>")'),'&lt;b&gt;Hero&lt;/b&gt;');
});

test('casters advance to casting range and cast instead of rushing into melee',()=>{
  const {run}=harness();
  run("const h=party[3],foe=spawnMonster('ogre',0,false),battle=new CombatEngine([h],[foe],10,10);h.pos={x:0,y:0};foe.pos={x:9,y:9};h.signatureUsed=true;h.spells=[{id:'magic_missile',uses:1,max:1}];battle.actAuto(h);");
  assert.equal(run('battle.cheb(h.pos,foe.pos)>1'),true);
  assert.equal(run('h.spells[0].uses'),0);
  assert.equal(run('foe.hp<foe.maxHp'),true);
});

test('Wanderer restores health and gives downed heroes victory XP',()=>{
  const {run}=harness();
  run("campaign.oath='wanderer';enterCombat({pool:['goblin']},'2,2');cancelTurn();party[3].hp=0;party[3].alive=false;game.phase='won';game.xpEarned=50;resolveCombat();");
  assert.equal(run('party[3].xp'),50);
  assert.equal(run('party[3].hp>1'),true);
});

test('final stairs require both the crown and a defeated king',()=>{
  const {run}=harness();
  run("nodeId='sunless_tomb';explore.pos={...explore.exit};bag.relic=true;descendOrWin();");
  assert.equal(run("$('#banner').classList.contains('show')"),false);
  run('campaign.bossSlain=true;descendOrWin();');
  assert.equal(run("$('#fateScreen').classList.contains('show')"),true);
  assert.equal(run("$('#banner').classList.contains('show')"),false);
  run("chooseCrownFate('break');");
  assert.equal(run("$('#banner').classList.contains('show')"),true);
  assert.equal(run('persistRead()'),undefined);
});

test('legacy saves remember an already defeated Crypt Lord',()=>{
  const {run}=harness();
  run("nodeId='sunless_tomb';explore.encounters={'2,2':{boss:true,lead:'crypt_lord'}};explore.cleared.add('2,2');const old=saveState();delete old.campaign;applySave(old);");
  assert.equal(run('campaign.bossSlain'),true);
});

test('SAFE-01: rejected imports preserve active state and queued combat',()=>{
  const h=harness(),{run}=h;
  run("const snapshot=JSON.parse(JSON.stringify(saveState()));game=new CombatEngine(party,[spawnMonster('goblin',0,false)],10,10);game.order=['e0','p1','p2','p3','p4'];game.turnIndex=0;mode='combat';beginTurnFlow();const prior={party,bag,explore,game};const malformed=JSON.parse(JSON.stringify(snapshot));malformed.bag=null;const accepted=applySave(malformed);");
  assert.equal(run('accepted'),false);assert.equal(run('party===prior.party&&bag===prior.bag&&explore===prior.explore&&game===prior.game'),true);assert.equal(h.timers.size,1);
});

test('SAFE-01: invalid geometry, IDs, abilities, and equipment are rejected atomically',()=>{
  const {run}=harness();
  const results=run(`(()=>{const edits=[s=>s.explore.w=10000,s=>s.explore.tiles.pop(),s=>s.explore.pos.x=-1,s=>s.party[1].id=s.party[0].id,s=>s.party[0].ab.dex=null,s=>s.party[3].eq.weapon='dawnblade',s=>s.explore.encounters['1,1']={pool:['unknown']},s=>s.bag.items.push('unknown')];return edits.map(edit=>{const before=party,s=JSON.parse(JSON.stringify(saveState()));edit(s);return !applySave(s)&&party===before;});})()`);
  assert.equal(results.every(Boolean),true);
});

test('MAP-01: opening every hidden cache preserves locked vault gates',()=>{
  const {run}=harness();
  const failures=run(`(()=>{const errors=[];for(const spec of Object.values(WORLD))for(let n=0;n<20;n++){
    const d=buildDungeon(generateLevel(spec)),open=new Set();for(let y=0;y<d.h;y++)for(let x=0;x<d.w;x++)if(d.tiles[y][x]!== '#')open.add(key(x,y));
    for(const k of Object.keys(d.secrets))open.add(k);
    if(d.doors.size&&_flood(open,d.start,d.doors).has(key(d.exit.x,d.exit.y)))errors.push(spec.id);
  }return errors;})()`);
  assert.equal(failures.length,0,JSON.stringify(failures));
});

test('SUP-01: generated and fallback quiet routes preserve two supplies',()=>{
  const {run}=harness();
  run("const cfg=generateLevel(WORLD.gallery),fallback=_fallbackLevel(WORLD.shrine_road,20,20);const ration=Object.values(cfg.loot).find(v=>v.type==='ration'),fallbackRation=Object.values(fallback.loot).find(v=>v.type==='ration');const before=bag.rations;collect(ration);collect({type:'ration'});");
  assert.equal(run('ration.amount'),2);assert.equal(run('fallbackRation.amount'),2);assert.equal(run('bag.rations-before'),3);
});

test('PROG-01: chapter XP is awarded once and pending allocations survive reload',()=>{
  const {run}=harness();
  run("descendOrWin();const earned=party[0].xp;const code=encodeSave(saveState());applySave(decodeSave(code));descendOrWin();");
  assert.equal(run('earned'),100);assert.equal(run('party[0].xp'),100);assert.equal(run('campaign.completedFloors.length'),1);assert.equal(run('party[0].pendingLevels'),1);assert.equal(run('levelUp.entries.length'),4);
});

test('PROG-02: older town saves infer completed chapters without granting retroactive XP',()=>{
  const {run}=harness();
  run("const old=JSON.parse(JSON.stringify(saveState()));old.inTown=true;delete old.campaign.completedFloors;applySave(old);descendOrWin();");
  assert.equal(run('party[0].xp'),0);assert.equal(run("campaign.completedFloors.includes('entrance')"),true);
});

test('FIELD-01: every theme has valid terrain and leaves spawn cells plain',()=>{
  const {run}=harness();
  assert.equal(run("Object.keys(BATTLEFIELDS).every(theme=>{const g=new CombatEngine(makeParty(),makeGroup([['goblin',8]]),10,10,theme);return g.terrain.size>0&&g.combatants.every(c=>!g.terrainAt(c.pos))&&[...g.terrain.values()].every(t=>TERRAIN[t]);})"),true);
});

test('FIELD-02: cover changes ranged hit odds by ten points and does not protect against melee',()=>{
  const {run}=harness();
  run("const hero=party[0],ar=spawnMonster('archer',0,false),battle=new CombatEngine([hero],[ar],10,10);hero.pos={x:4,y:4};ar.pos={x:7,y:4};const plain=battle.attackPreview(ar,hero).chance;battle.terrain.set('4,4','cover');const covered=battle.attackPreview(ar,hero).chance;");
  assert.equal(run('plain-covered'),10);assert.equal(run('battle.coverBonus(hero,ar)'),0);
  run("Dice.d20=()=>10;hero.ac=14;hero.bg=null;ar.attackBonus=4;ar.statuses=[];const noCover=Rules.attack(ar,hero,0,0).hit,withCover=Rules.attack(ar,hero,0,battle.coverBonus(ar,hero)).hit;");
  assert.equal(run('noCover'),true);assert.equal(run('withCover'),false);
});

test('FIELD-03: sanctum heals once at turn end and caps at maximum HP',()=>{
  const {run}=harness();
  run("const hero=party[0],battle=new CombatEngine(party,[spawnMonster('ogre',0,false)],10,10);battle.order=['p1','e0','p2','p3','p4'];battle.turnIndex=0;battle.terrain.set(key(hero.pos.x,hero.pos.y),'sanctum');hero.hp=hero.maxHp-2;battle.endTurn();");
  assert.equal(run('hero.hp'),run('hero.maxHp'));assert.equal(run("battle.log.filter(e=>e.t.includes('in the sanctum')).length"),1);
});

test('FIELD-03: embers can end combat and never revive a fallen actor',()=>{
  const {run}=harness();
  run("const hero=party[0],battle=new CombatEngine([hero],[spawnMonster('ogre',0,false)],10,10);battle.order=['p1','e0'];battle.turnIndex=0;hero.hp=2;battle.terrain.set(key(hero.pos.x,hero.pos.y),'ember');battle.endTurn();battle.terrain.set(key(hero.pos.x,hero.pos.y),'sanctum');battle._terrainTick(hero);");
  assert.equal(run('battle.phase'),'lost');assert.equal(run('hero.hp'),0);assert.equal(run('hero.alive'),false);
});

test('FIELD-04: melee AI avoids an ember tie and seeks an equally close sanctum when hurt',()=>{
  const {run}=harness();
  run("const hero=party[0],foe=spawnMonster('orc',0,false),battle=new CombatEngine([hero],[foe],10,10);hero.pos={x:0,y:5};foe.pos={x:7,y:5};foe.hp=5;battle.terrain.set('3,5','ember');battle._meleeTurn(foe,[hero]);const avoided=key(foe.pos.x,foe.pos.y)!=='3,5';foe.pos={x:7,y:5};foe.acted={move:false,action:false};battle.terrain.clear();battle.terrain.set('3,5','sanctum');battle._meleeTurn(foe,[hero]);");
  assert.equal(run('avoided'),true);assert.equal(run('key(foe.pos.x,foe.pos.y)'),'3,5');
});

test('AIM-01/02: first touch previews collateral and confirmation spends exactly one charge',()=>{
  const {run}=harness();
  run("game=new CombatEngine(party,[spawnMonster('ogre',0,false)],10,10);mode='combat';game.order=['p4','p1','p2','p3','e0'];game.turnIndex=0;game._begin();party[3].pos={x:2,y:2};party[0].pos={x:4,y:4};game.byId('e0').pos={x:5,y:5};selectSpell('fireball');const before=party[3].spells.find(sp=>sp.id==='fireball').uses;combatClick(4,4);");
  assert.equal(run('validAim()'),true);assert.equal(run('aimSummary().allies'),1);assert.equal(run('aimSummary().foes'),1);assert.equal(run('party[3].acted.action'),false);assert.equal(run("party[3].spells.find(sp=>sp.id==='fireball').uses"),run('before'));
  run('combatClick(4,4);');
  assert.equal(run("party[3].spells.find(sp=>sp.id==='fireball').uses"),run('before-1'));assert.equal(run('party[3].acted.action'),true);assert.equal(run('confirmAim()'),false);
});

test('AIM-02: changing mode or actor invalidates an old aim',()=>{
  const {run}=harness();
  run("game=new CombatEngine(party,[spawnMonster('ogre',0,false)],10,10);mode='combat';game.order=['p4','p1','p2','p3','e0'];game.turnIndex=0;game._begin();selectSpell('fireball');combatClick(4,4);setMode('move');");
  assert.equal(run('validAim()'),false);assert.equal(run('confirmAim()'),false);
  run("selectSpell('fireball');combatClick(4,4);game.turnIndex=1;");assert.equal(run('confirmAim()'),false);
});

test('UX-03: Tactics pauses a queued enemy and resumes one action',()=>{
  const h=harness(),{run}=h;
  run("game=new CombatEngine(party,[spawnMonster('goblin',0,false)],10,10);game.order=['e0','p1','p2','p3','p4'];game.turnIndex=0;mode='combat';const calls=[];game.actAuto=c=>calls.push(c.id);beginTurnFlow();openTactics();");
  assert.equal(h.timers.size,0);assert.equal(h.tick(),false);assert.equal(run('game.current().id'),'e0');
  run('closeTactics();');assert.equal(h.timers.size,1);h.tick();assert.equal(run('JSON.stringify(calls)'),JSON.stringify(['e0']));
});

test('QUEST-01/02: rewards are unique across rechecks and portable saves',()=>{
  const {run}=harness();
  run("campaign.battles=4;campaign.secrets=2;campaign.successes=3;const gold=bag.gold,rations=bag.rations;checkContracts();checkContracts();const code=encodeSave(saveState());applySave(decodeSave(code));checkContracts();");
  assert.equal(run('campaign.contracts.length'),3);assert.equal(run('bag.gold-gold'),120);assert.equal(run('bag.rations-rations'),2);assert.equal(run("bag.items.filter(id=>id==='sunshard').length"),1);assert.equal(run("bag.items.filter(id=>id==='lantern_mantle').length"),1);
});

test('QUEST-01: failed, skipped, or repeated events do not count as successful checks',()=>{
  const {run}=harness();
  run("Dice.d20=()=>1;openEvent('shrine','2,2');resolveEventOption(0);openEvent('shrine','3,3');resolveEventOption(2);Dice.d20=()=>20;openEvent('shrine','4,4');resolveEventOption(0);resolveEventOption(0);");
  assert.equal(run('campaign.successes'),1);assert.equal(run('campaign.events'),3);
});

test('BOSS-01/02: convergence guardians have unique, bounded one-time phases',()=>{
  const {run}=harness();
  assert.equal(run("WORLD.catacombs.encounters.some(e=>e.lead==='bell_warden'&&e.boss)"),true);assert.equal(run("WORLD.deep_stair.encounters.some(e=>e.lead==='ash_cantor'&&e.boss)"),true);
  assert.equal(run("['bell_warden','ash_cantor'].every(type=>{const boss=spawnMonster(type,0,true),g=new CombatEngine(makeParty(),[boss],10,10);boss.hp=Math.floor(boss.maxHp/2);g._checkEnd();g._checkEnd();return boss.awakened&&g.living('enemy').length===2&&g.describeRole(boss).length>30;})"),true);
});

test('LIMIT-01: standalone payload reports its soft size target and keeps scripts self-contained',t=>{
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');const bytes=Buffer.byteLength(html);t.diagnostic('Payload '+bytes+' bytes; 350 KiB is a soft target, '+(bytes>358400?'exceeded for reviewed features':'within target')+'.');assert.equal(/<script[^>]+src=/i.test(html),false);assert.equal((html.match(/<script>/g)||[]).length,1);
});

test('BAL-01: a modest equipment upgrade adds a bounded encounter surcharge',()=>{
  const {run}=harness();
  assert.equal(run('encounterBudget({floor:0,partyLevel:1,gear:80})-encounterBudget({floor:0,partyLevel:1,gear:0})<10'),true);
  assert.equal(run('encounterBudget({floor:3,partyLevel:5,gear:0})>encounterBudget({floor:0,partyLevel:1,gear:0})'),true);
});

test('FLOW-01: combat on stairs resumes the chapter exit without another step',()=>{
  const {run}=harness();
  run("$('#startScreen').classList.remove('show');explore.pos={...explore.exit};enterCombat({pool:['goblin']},key(explore.exit.x,explore.exit.y));cancelTurn();game.phase='won';game.xpEarned=0;resolveCombat();");
  assert.equal(run("$('#townScreen').classList.contains('show')"),true);assert.equal(run("campaign.completedFloors.includes('entrance')"),true);
});

test('FLOW-01: a battle level-up is confirmed before the deferred exit advances',()=>{
  const {run}=harness();
  run("$('#startScreen').classList.remove('show');party.forEach(h=>h.xp=90);explore.pos={...explore.exit};enterCombat({pool:['goblin']},key(explore.exit.x,explore.exit.y));cancelTurn();game.phase='won';game.xpEarned=20;resolveCombat();");
  assert.equal(run("$('#townScreen').classList.contains('show')"),false);assert.equal(run('levelUp.entries.length'),4);
  run('autoAssignLevelUp();');assert.equal(run("$('#townScreen').classList.contains('show')"),true);assert.equal(run('party[0].xp'),210);
});


test('MODAL-01: direct manual combat actions cannot change a paused battle',()=>{
  const {run}=harness();
  run("enterCombat({pool:['skeleton']},'2,2');cancelTurn();game.order=['p1',...game.order.filter(id=>id!=='p1')];game.turnIndex=0;game._begin();const actor=game.current(),order=JSON.stringify(game.order),round=game.round;$('#tacticsScreen').classList.add('show');endTurn();guard();waitTurn();toggleAuto();setMode('move');selectSpell('fireball');combatClick(0,0);");
  assert.equal(run('game.current()===actor'),true);assert.equal(run('JSON.stringify(game.order)'),run('order'));assert.equal(run('game.round'),run('round'));assert.equal(run('autoFight'),false);assert.equal(run('actor.acted.action'),false);assert.equal(run('mover'),null);
});


test('EPIC-01/02: all seven councils have two distinct once-only, saved plans',()=>{
  const {run}=harness();
  run("const councils=Object.entries(STORY).filter(([id])=>WORLD[id].next.length);let checked=0;for(const [id,chapter] of councils){if(chapter.plans.length!==2||new Set(chapter.plans.map(p=>p.id)).size!==2)throw Error(id);for(const plan of chapter.plans){newGame();$('#startScreen').classList.remove('show');nodeId=id;worldPath=[id];openTown();const gold=bag.gold,rations=bag.rations,items=bag.items.length;if(!chooseCouncil(plan.id))throw Error('rejected '+id);const after=JSON.stringify(saveState());if(chooseCouncil(chapter.plans[1].id)||JSON.stringify(saveState())!==after)throw Error('duplicate '+id);if(bag.gold!==gold+(plan.gold||0)||bag.rations!==rations+(plan.rations||0)||bag.items.length!==items+(plan.potions||0))throw Error('reward '+id);if(decodeSave(persistRead()).campaign.decisions[id]!==plan.id)throw Error('save '+id);checked++;}}");
  assert.equal(run('checked'),14);
});

test('EPIC-02: council decisions require a town, reject pending levels, and gate descent',()=>{
  const {run}=harness();
  assert.equal(run("chooseCouncil('arsenal')"),false);
  run("openTown();enterDungeon('warren');");assert.equal(run('nodeId'),'entrance');
  run("$('#levelScreen').classList.add('show');");assert.equal(run("chooseCouncil('arsenal')"),false);
  run("$('#levelScreen').classList.remove('show');chooseCouncil('arsenal');enterDungeon('warren');");assert.equal(run('nodeId'),'warren');assert.equal(run("chooseCouncil('flood')"),false);
});

test('EPIC-03: old visited chapters migrate without rewards and current town remains choosable',()=>{
  const {run}=harness();
  run("const old=JSON.parse(JSON.stringify(saveState()));old.nodeId='catacombs';old.worldPath=['entrance','warren','catacombs'];old.inTown=true;delete old.campaign.decisions;delete old.campaign.fate;const beforeGold=bag.gold;applySave(old);");
  assert.equal(run('campaign.decisions.entrance'),'legacy');assert.equal(run('campaign.decisions.warren'),'legacy');assert.equal(run('campaign.decisions.catacombs'),undefined);assert.equal(run('bag.gold'),run('beforeGold'));assert.equal(run('party[0].campaignBonus.atk'),0);
  assert.equal(run("chooseCouncil('choir')"),true);
});

test('EPIC-03: story bonuses are bounded, derived, and cannot stack on repeated loads',()=>{
  const {run}=harness();
  run("campaign.decisions={entrance:'arsenal',gallery:'vigil',catacombs:'belliron',ossuary:'shields',deep_stair:'lastember'};applyBoons();const code=encodeSave(saveState());applySave(decodeSave(code));applySave(decodeSave(code));");
  assert.equal(run('party[0].campaignBonus.atk'),2);assert.equal(run('party[0].campaignBonus.ac'),2);assert.equal(run('party[0].campaignBonus.dmg'),1);
});

test('EPIC-03: malformed story decisions are rejected without touching the run',()=>{
  const {run}=harness();
  run("const epicOriginalParty=party,bad=JSON.parse(JSON.stringify(saveState()));bad.campaign.decisions={entrance:'not-a-plan'};const accepted=applySave(bad);");assert.equal(run('accepted'),false);assert.equal(run('party===epicOriginalParty'),true);
});

test('EPIC-04: final aid changes the king and opening ward without mutating bestiary',()=>{
  const {run}=harness();
  run("campaign.decisions={warren:'flood',gallery:'names',catacombs:'choir',ossuary:'legion',deep_stair:'vanguard'};const base=spawnMonster('crypt_lord',0,true);const hp=base.maxHp;enterCombat({boss:true,lead:'crypt_lord',pool:['skeleton']},'2,2');cancelTurn();const king=game.combatants.find(e=>e.cls==='CryptLord');const retinue=storyEffects().retinue;");
  assert.equal(run('king.maxHp'),run('Math.round(hp*.85)'));assert.equal(run('king.bloodied.count'),1);assert.equal(run('BESTIARY.crypt_lord.bloodied.count'),2);assert.equal(run('base.bloodied.count'),2);assert.equal(run('retinue'),.81);
  assert.equal(run("party.every(h=>h.statuses.filter(s=>s.type==='dawnward').length===1)"),true);assert.equal(run("party[0].statuses.find(s=>s.type==='dawnward').duration"),3);
  run("king.hp=Math.floor(king.maxHp/2);const count=game.living('enemy').length;game._bossPhase();game._bossPhase();");assert.equal(run("game.living('enemy').length"),run('count+1'));
});

test('EPIC-05: all crown fates enforce the final gates and yield distinct company epilogues',()=>{
  const {run}=harness();
  run("const endings=[];for(const id of Object.keys(CROWN_FATES)){newGame();$('#startScreen').classList.remove('show');if(chooseCrownFate(id))throw Error('early');nodeId='sunless_tomb';bag.relic=true;explore.pos={...explore.exit};if(openCrownFate())throw Error('king alive');campaign.bossSlain=true;openCrownFate();if(!chooseCrownFate(id)||chooseCrownFate(id))throw Error('fate count');endings.push($('#endingStory').textContent);if(!endings.at(-1).includes(party[0].name))throw Error('missing company');if(persistRead()!==undefined)throw Error('completed save');}");
  assert.equal(run('new Set(endings).size'),3);
});

test('RESTART-01: accidental restart and cancellation preserve the exploration run and save',()=>{
  const {run}=harness();run("const originalParty=party,originalMap=explore,originalSave=persistRead();const requested=requestRestart();const duplicate=requestRestart();");
  assert.equal(run('requested'),true);assert.equal(run('duplicate'),false);assert.equal(run('mode'),'explore');assert.equal(run('party===originalParty&&explore===originalMap'),true);assert.equal(run('persistRead()'),run('originalSave'));
  run('cancelRestart();');assert.equal(run("$('#restartScreen').classList.contains('show')"),false);assert.equal(run('mode'),'explore');assert.equal(run('persistRead()'),run('originalSave'));
});

test('RESTART-02: pending enemy pauses, cancellation resumes one turn, confirmation preserves Continue',()=>{
 const h=harness(),{run}=h;run("enterCombat({pool:['goblin']},'2,2');cancelTurn();game.order=['e0',...game.order.filter(id=>id!=='e0')];game.turnIndex=0;game._begin();const restartActor=game.current(),savedBeforeRestart=persistRead();beginTurnFlow();requestRestart();");
 assert.equal(run('turnTimer'),null);assert.equal(run('confirmRestart()'),false);assert.equal(h.tick(),true);assert.equal(run('game.current()===restartActor'),true);
 run('cancelRestart();');assert.equal(h.timers.size,1);run('requestRestart();');h.tick();run('confirmRestart();');assert.equal(h.timers.size,0);assert.equal(run('mode'),'start');assert.equal(run("$('#restartScreen').classList.contains('show')"),false);assert.equal(run('persistRead()'),run('savedBeforeRestart'));
});

test('RESTART-03: cancelling retains a manual spell aim and unspent action',()=>{
 const {run}=harness();run("enterCombat({pool:['goblin']},'2,2');cancelTurn();game.order=['p4',...game.order.filter(id=>id!=='p4')];game.turnIndex=0;game._begin();selectSpell('fireball');combatClick(4,4);const restartAim=spellAim,chargesBeforeRestart=party[3].spells.find(s=>s.id==='fireball').uses;requestRestart();cancelRestart();");
 assert.equal(run('validAim()'),true);assert.equal(run('spellAim===restartAim'),true);assert.equal(run('game.current().acted.action'),false);assert.equal(run("party[3].spells.find(s=>s.id==='fireball').uses"),run('chargesBeforeRestart'));
});

test('ATLAS-01: every monster/item has authored context and valid spell/art references',()=>{
 const {run}=harness();assert.equal(run("Object.entries(BESTIARY).every(([id,m])=>MONSTER_LORE[id]?.length===3&&SPRITES[m.sprite]&&(m.spells||[]).every(s=>SPELLS[s.id]))"),true);assert.equal(run("Object.keys(ITEMS).every(id=>RELIC_LORE[id]&&itemSources(id)&&itemRules(ITEMS[id]))"),true);assert.equal(run('Object.keys(SAGAS).length===Object.keys(WORLD).length'),true);
});
test('HUNT-01: legendary hunt is optional, stage-gated, and saved before combat',()=>{
 const {run}=harness();assert.equal(run("$('#codexScreen').classList.add('show');codexTab='legends';beginLegendHunt()"),false);
 run("campaign.completedFloors=['entrance','gallery','catacombs','shrine_road'];nodeId='shrine_road';worldPath=[...campaign.completedFloors];campaign.decisions.shrine_road='hearths';openTown();$('#codexScreen').classList.add('show');codexTab='legends';const beforeHunt=JSON.stringify(saveState());");
 assert.equal(run('beginLegendHunt()'),true);assert.equal(run("mode==='combat'&&legendHunt&&game.combatants.some(c=>c.cls==='EclipseWyrm')"),true);assert.equal(run('decodeSave(persistRead()).inTown'),true);assert.equal(run('decodeSave(persistRead()).campaign.hunt'),false);
});
test('HUNT-02: victory grants one reward, preserves map geometry, and survives town reload',()=>{
 const {run}=harness();run("campaign.completedFloors=['entrance','gallery','catacombs','shrine_road'];nodeId='shrine_road';worldPath=[...campaign.completedFloors];campaign.decisions.shrine_road='hearths';openTown();$('#codexScreen').classList.add('show');codexTab='legends';beginLegendHunt();cancelTurn();game.phase='won';game.xpEarned=0;const supplyBefore=bag.rations;resolveCombat();const huntCode=encodeSave(saveState());");
 assert.equal(run('campaign.hunt'),true);assert.equal(run("bag.items.filter(x=>x==='eclipsescale').length"),1);assert.equal(run('bag.rations===supplyBefore+1'),true);assert.equal(run("[...explore.cleared].every(k=>/^\\d+,\\d+$/.test(k))"),true);assert.equal(run('applySave(decodeSave(huntCode))'),true);assert.equal(run('campaign.hunt'),true);assert.equal(run("$('#townScreen').classList.contains('show')"),true);run("$('#codexScreen').classList.add('show');codexTab='legends';");assert.equal(run('beginLegendHunt()'),false);assert.equal(run("campaignEpilogue('break').includes('freed constellations')"),true);
});
test('HUNT-03: malformed hunt state is rejected atomically; legacy codes default safely',()=>{
 const {run}=harness();run("const old=saveState();delete old.campaign.hunt;applySave(old);");assert.equal(run('campaign.hunt'),false);run("const bad=saveState();bad.campaign.hunt='yes';const intact=JSON.stringify(saveState());");assert.equal(run('applySave(bad)'),false);assert.equal(run('JSON.stringify(saveState())===intact'),true);
});
test('HUNT-04: wyrm has one bounded living phase and no template mutation',()=>{
 const {run}=harness();run("const wyrm=spawnMonster('eclipse_wyrm',0,true),wyrmBattle=new CombatEngine(makeParty(),[wyrm],10,10);wyrm.hp=Math.floor(wyrm.maxHp/2);wyrm.spells[0].uses=0;wyrmBattle._checkEnd();wyrmBattle._checkEnd();");assert.equal(run('wyrm.awakened'),true);assert.equal(run("wyrmBattle.living('enemy').length"),2);assert.equal(run('BESTIARY.eclipse_wyrm.bloodied.count'),1);assert.equal(run('wyrm.spells[0].uses'),1);
});
test('HUNT-05: prepared level-three/four hunts across every oath complete without stalls',()=>{
 const report=[];for(const level of [3,4])for(const oath of ['wanderer','delver','ironbound']){
  const outcomes=[];for(let seed=31;seed<43;seed++){
   const {run}=harness({seed});outcomes.push(run(`const heroes=DEFAULT_BLOCKS.map((b,i)=>buildHero(CLASSES[b.cls],b.name,b.ab,'p'+(i+1),${level},b.bg));const mob=composeEncounter({boss:true,lead:'eclipse_wyrm',pool:['skeleton'],budgetMul:.45},{floor:2,partyLevel:${level},gear:0,difficulty:OATHS.${oath}.budget});const battle=new CombatEngine(heroes,mob,10,10,GUARDIAN_ARENAS.eclipse_wyrm);let turns=0;while(battle.phase==='playing'&&turns++<1000){battle.actAuto(battle.current());if(battle.phase==='playing')battle.endTurn();}battle.phase;`));
  }
  assert(outcomes.every(x=>['won','lost'].includes(x)),'hunt stalled');if(oath==='wanderer')assert(outcomes.includes('won'),'prepared Wanderer hunt has no sampled wins');report.push({level,oath,wins:outcomes.filter(x=>x==='won').length,runs:outcomes.length});
 }
 console.log('Optional hunt sample (Auto, no gear/boons/shopping): '+JSON.stringify(report));
});

test('HUNT-06: breath telegraphs without damage or charge use; moving out avoids the later fixed blast',()=>{
 const {run}=harness();run("const dragon=spawnMonster('eclipse_wyrm',0,false),crew=makeParty(),b=new CombatEngine(crew,[dragon],10,10);dragon.pos={x:6,y:5};crew.forEach((h,i)=>h.pos={x:1,y:i});const hp=crew.map(h=>h.hp).join();b._castPoint(dragon,SPELLS.starless_breath,{x:1,y:1});const charges=dragon.spells[0].uses;");assert.equal(run('crew.map(h=>h.hp).join()===hp'),true);assert.equal(run('charges'),2);assert.equal(run('dragon.intent.x'),1);run("crew.forEach((h,i)=>h.pos={x:4,y:i});dragon.acted.action=false;b.actAuto(dragon);");assert.equal(run('dragon.intent'),null);assert.equal(run('dragon.spells[0].uses'),1);assert.equal(run('crew.map(h=>h.hp).join()===hp'),true);
});

test('SAGA-04: guardian aftermath blocks movement and defers stairs until acknowledged',()=>{
 const {run}=harness();run("explore.pos={...explore.exit};enterCombat({boss:true,lead:'bell_warden',pool:['skeleton']},'2,2');cancelTurn();game.phase='won';game.xpEarned=0;resolveCombat();");
 assert.equal(run("$('#aftermathScreen').classList.contains('show')"),true);
 assert.match(run("$('#aftermathStory').textContent"),/bell splits/);
 assert.equal(run('campaign.completedFloors.length'),0);
 assert.equal(run('overlayOpen()'),true);
 run('closeAftermath();');assert.equal(run('campaign.completedFloors.length'),1);
 assert.equal(run("$('#townScreen').classList.contains('show')"),true);
 const final=harness().run;final("nodeId='sunless_tomb';worldPath=['entrance','warren','catacombs','ossuary','deep_stair','sunless_tomb'];explore=new ExploreEngine(buildDungeon(generateLevel(WORLD.sunless_tomb)));explore.pos={...explore.exit};bag.relic=true;enterCombat({boss:true,lead:'crypt_lord',pool:['skeleton']},'2,2');cancelTurn();game.phase='won';game.xpEarned=0;resolveCombat();");assert.equal(final("$('#fateScreen').classList.contains('show')"),false);final('closeAftermath();');assert.equal(final("$('#fateScreen').classList.contains('show')"),true);
});

test('SAGA-04: level choices precede aftermath and load clears transient panels',()=>{
 const {run}=harness();run("enterCombat({boss:true,lead:'ash_cantor',pool:['skeleton']},'2,2');cancelTurn();game.phase='won';game.xpEarned=100;resolveCombat();closeAftermath();");
 assert.equal(run("$('#aftermathScreen').classList.contains('show')"),true);
 assert.equal(run('party.every(h=>h.pendingLevels>0)'),true);
 run('autoAssignLevelUp();');assert.equal(run("$('#aftermathScreen').classList.contains('show')"),true);
 run('closeAftermath();');assert.equal(run("$('#aftermathScreen').classList.contains('show')"),false);
 run("$('#aftermathScreen').classList.add('show');applySave(decodeSave(encodeSave(saveState())));");assert.equal(run("$('#aftermathScreen').classList.contains('show')"),false);
});

test('SAGA-05: every later council plan changes the epilogue without inventing legacy rewards',()=>{
 const {run}=harness();
 for(const node of ['gallery','catacombs','ossuary','shrine_road','deep_stair']){
  run(`worldPath=['entrance','${node}','sunless_tomb'];campaign.decisions={};`);
  const endings=run(`STORY['${node}'].plans.map(p=>{campaign.decisions['${node}']=p.id;return campaignEpilogue('break');})`);
  assert.notEqual(endings[0],endings[1],node);
 }
 run("campaign.decisions={gallery:'legacy',catacombs:'legacy'};worldPath=['entrance','gallery','catacombs','sunless_tomb'];");
 assert.doesNotMatch(run("campaignEpilogue('break')"),/recovered names|freed choir|bell-forged/);
 run("campaign.decisions={gallery:'names'};worldPath=['entrance','warren','sunless_tomb'];");assert.doesNotMatch(run("campaignEpilogue('break')"),/recovered names/);
});

test('RELIC-04: Eclipsescale reduces spell hits only, clamps at zero, and follows equipment',()=>{
 const {run}=harness();run("const caster=party[3],wearer=party[0],other=party[1],foe=spawnMonster('ogre',0,false),battle=new CombatEngine(party,[foe],10,10);wearer.equip.armor='eclipsescale';wearer.hp=other.hp=100;Rules.spellAmount=()=>5;caster.spells=[{id:'fireball',uses:4,max:4},{id:'magic_missile',uses:4,max:4}];wearer.pos={x:4,y:4};other.pos={x:5,y:4};foe.pos={x:9,y:9};battle.castSpell(caster,SPELLS.fireball,{x:4,y:4});");
 assert.equal(run('wearer.hp'),97);assert.equal(run('other.hp'),95);
 run("caster.acted.action=false;battle.castSpell(caster,SPELLS.magic_missile,wearer);");assert.equal(run('wearer.hp'),94);
 run("Rules.spellAmount=()=>1;caster.acted.action=false;battle.castSpell(caster,SPELLS.magic_missile,wearer);");assert.equal(run('wearer.hp'),94);
 run("wearer.equip.armor=null;other.equip.armor='eclipsescale';Rules.spellAmount=()=>5;caster.acted.action=false;battle.castSpell(caster,SPELLS.magic_missile,wearer);");assert.equal(run('wearer.hp'),89);
 run("foe.pos={x:4,y:5};Rules.attack=()=>({hit:true,crit:false});Rules.damage=()=>5;battle.doAttack(foe,wearer);");assert.equal(run('wearer.hp'),84);
 assert.match(run("itemRules(ITEMS.eclipsescale)"),/2 less damage per spell hit/);
});

test('OBJ-01: generated objectives remain reachable before the vault, including fallback floors',()=>{
 const {run}=harness();assert.equal(run(`(()=>{for(const id of Object.keys(CHAPTER_TASKS))for(let n=0;n<64;n++){const cfg=n===0?Object.assign(_fallbackLevel(WORLD[id],26,20),{chapter:id}):generateLevel(WORLD[id]);const e=new ExploreEngine(buildDungeon(cfg)),q=e.task;if(!q||q.id!==id)throw Error('missing task');const reach=new Set([key(q.start.x,q.start.y)]),queue=[q.start];for(let i=0;i<queue.length;i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const p={x:queue[i].x+dx,y:queue[i].y+dy},k=key(p.x,p.y);if(!e.isWall(p.x,p.y)&&!e.locked(p.x,p.y)&&!reach.has(k)){reach.add(k);queue.push(p);}}if(q.sites.some(k=>!reach.has(k)||e.loot[k]))throw Error('unreachable task');if(id==='shrine_road'){const safe=new Set([key(q.start.x,q.start.y)]),open=[q.start];for(let j=0;j<open.length;j++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const p={x:open[j].x+dx,y:open[j].y+dy},k=key(p.x,p.y);if(!e.isWall(p.x,p.y)&&!e.locked(p.x,p.y)&&!q.sites.includes(k)&&!safe.has(k)){safe.add(k);open.push(p);}}if(q.sites.some(k=>{const [x,y]=k.split(',').map(Number);return ![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>safe.has(key(x+dx,y+dy)));}))throw Error('shrine choice forced by path');}}return true;})()`),true);
});

test('OBJ-02: scouts must reach camp; Gallery stones require order; Dawnblade is kept',()=>{
 const {run}=harness();
 for(const id of ['warren','gallery','ossuary']){
  run(`nodeId='${id}';worldPath=['entrance',nodeId];explore=new ExploreEngine(buildDungeon(generateLevel(WORLD[nodeId])));`);
  run('descendOrWin();');assert.equal(run("$('#townScreen').classList.contains('show')"),false);
  if(id==='gallery'){
   run("const last=explore.task.sites[2].split(',').map(Number);explore.pos={x:last[0],y:last[1]};advanceTask();");assert.equal(run('explore.task.used.length'),0);
   run("for(const k of explore.task.sites){const [x,y]=k.split(',').map(Number);explore.pos={x,y};advanceTask();}");
  }else{
   if(id==='warren')run("const [x,y]=explore.task.sites[0].split(',').map(Number);explore.pos={x,y};advanceTask();");
   else run("collect({type:'item',item:'dawnblade'});");
   assert.equal(run('explore.task.done'),false);run('explore.pos={...explore.task.start};advanceTask();');
  }
  assert.equal(run('explore.task.done'),true);if(id==='ossuary')assert.equal(run("bag.items.includes('dawnblade')"),true);
 }
});

test('OBJ-03: shrine choices pay only once and recovery is capped',()=>{
 const {run}=harness();run("nodeId='shrine_road';worldPath=['entrance','gallery','catacombs',nodeId];explore=new ExploreEngine(buildDungeon(generateLevel(WORLD[nodeId])));const q=explore.task;const supplies=bag.rations;function visit(i){const [x,y]=q.sites[i].split(',').map(Number);explore.pos={x,y};advanceTask();}visit(0);visit(0);party.forEach(h=>h.hp=h.maxHp-1);visit(1);visit(2);");
 assert.equal(run('bag.rations'),run('supplies+1'));assert.equal(run('q.used.join()'),'0,1');assert.equal(run('q.done'),true);assert.equal(run('party.every(h=>h.hp===h.maxHp)'),true);
 run("explore.task=placeTask('shrine_road',explore.tiles,explore.task.start,explore.exit,explore.doors,explore.loot,explore.encounters,explore.events);party[3].spells[0].uses=0;const max=party[3].spells[0].max;const k=explore.task.sites[2].split(',').map(Number);explore.pos={x:k[0],y:k[1]};advanceTask();advanceTask();");assert.equal(run('party[3].spells[0].uses'),1);assert.equal(run('party[3].spells[0].uses<=max'),true);
});

test('OBJ-04: partial objective saves reload; malformed imports are atomic; legacy floors stay ungated',()=>{
 const {run}=harness();run("nodeId='gallery';worldPath=['entrance','gallery'];explore=new ExploreEngine(buildDungeon(generateLevel(WORLD.gallery)));const [x,y]=explore.task.sites[0].split(',').map(Number);explore.pos={x,y};advanceTask();const saved=saveState();");
 assert.equal(run('applySave(decodeSave(encodeSave(saved)))'),true);assert.equal(run('explore.task.used.join()'),'0');
 run("const intact=JSON.stringify(saveState());const bad=JSON.parse(JSON.stringify(saved));bad.explore.task.used=[1];");assert.equal(run('applySave(bad)'),false);assert.equal(run('JSON.stringify(saveState())===intact'),true);
 run("bad.explore.task.used=[0];bad.explore.task.sites[0]='0,0';");assert.equal(run('applySave(bad)'),false);
 run('delete saved.explore.task;');assert.equal(run('applySave(saved)'),true);assert.equal(run('explore.task'),null);run('descendOrWin();');assert.equal(run("$('#townScreen').classList.contains('show')"),true);
});

test('GUARD-01: Warden toll delays its buff; release is once-only and ordinary chants stay immediate',()=>{
 const {run}=harness();run("const crew=makeParty(),w=spawnMonster('bell_warden',0,false),b=new CombatEngine(crew,[w],10,10);w.pos={x:5,y:5};const uses=w.spells.find(s=>s.id==='war_chant').uses;b._castPoint(w,SPELLS.war_chant,w.pos);");assert.equal(run('w.statuses.length'),0);assert.equal(run("w.spells.find(s=>s.id==='war_chant').uses===uses"),true);assert.equal(run('b.dangerAt(w.pos).length'),0);run('w.acted.action=false;b.actAuto(w);');assert.equal(run('w.intent'),null);assert.equal(run("w.spells.find(s=>s.id==='war_chant').uses"),run('uses-1'));assert(run('w.statuses.length>0'));
 run("const sh=spawnMonster('shaman',0,false),s=new CombatEngine(makeParty(),[sh],10,10);sh.spells=[{id:'war_chant',uses:1,max:1}];s._castPoint(sh,SPELLS.war_chant,sh.pos);");assert.equal(run('sh.spells[0].uses'),0);assert.equal(run('!!sh.intent'),false);
});
test('GUARD-02: only damaging weapon hits interrupt channels and spend the charge',()=>{
 const {run}=harness();run("const crew=makeParty(),w=spawnMonster('bell_warden',0,false),b=new CombatEngine(crew,[w],10,10),h=crew[0];w.pos={x:4,y:4};h.pos={x:3,y:4};b._castPoint(w,SPELLS.war_chant,w.pos);const uses=w.spells.find(s=>s.id==='war_chant').uses;Rules.attack=()=>({hit:false});b.doAttack(h,w);");assert.equal(run('!!w.intent'),true);run("const mage=crew[3];mage.spells=[{id:'magic_missile',uses:1,max:1}];Rules.spellAmount=()=>1;b.castSpell(mage,SPELLS.magic_missile,w);");assert.equal(run('!!w.intent'),true);run('h.acted.action=false;Rules.attack=()=>({hit:true,crit:false});Rules.damage=()=>1;b.doAttack(h,w);');assert.equal(run('w.intent'),null);assert.equal(run("w.spells.find(s=>s.id==='war_chant').uses"),run('uses-1'));
 run("const d=spawnMonster('eclipse_wyrm',0,false),db=new CombatEngine(makeParty(),[d],10,10);db._castPoint(d,SPELLS.starless_breath,{x:3,y:3});db._interrupt(d);");assert.equal(run('!!d.intent'),true);assert.equal(run('d.spells[0].uses'),2);run("w.acted.action=false;w.spells.find(s=>s.id==='war_chant').uses=1;b._castPoint(w,SPELLS.war_chant,w.pos);b._reactStrike(h,w,'guard');");assert.equal(run('w.intent'),null);assert.equal(run("w.spells.find(s=>s.id==='war_chant').uses"),0);
});
test('GUARD-03: hymn marks fixed danger, incapacitation delays it, death removes it',()=>{
 const {run}=harness();run("const crew=makeParty(),w=spawnMonster('ash_cantor',0,false),b=new CombatEngine(crew,[w],10,10);w.pos={x:8,y:8};b._castPoint(w,SPELLS.cinder,{x:3,y:3});w.acted.action=false;w.statuses.push({type:'hold',duration:2});b.actAuto(w);");assert.equal(run('b.dangerAt({x:2,y:2}).length'),1);assert.equal(run('b.dangerAt({x:5,y:3}).length'),0);assert.equal(run('!!w.intent'),true);run('w.statuses=[];w.hp=0;b._drop(w);');assert.equal(run('b.dangerAt({x:3,y:3}).length'),0);assert.equal(run('w.intent'),null);
});
test('GUARD-04: Auto evades fixed blasts legally without spending its action; reactions can stop it',()=>{
 const {run}=harness();run("const crew=makeParty(),w=spawnMonster('ash_cantor',0,false),b=new CombatEngine(crew,[w],10,10),h=crew[0];w.pos={x:8,y:8};h.pos={x:3,y:3};b._castPoint(w,SPELLS.cinder,{x:3,y:3});const legal=b.reachable(h);b._evade(h);");assert.equal(run('b.dangerAt(h.pos).length'),0);assert.equal(run("legal.has(h.pos.x+','+h.pos.y)"),true);assert.equal(run('h.acted.move'),true);assert.equal(run('h.acted.action'),false);
 run("h.acted.move=false;h.pos={x:3,y:3};b._provoke=()=>{h.hp=0;b._drop(h);};b._evade(h);");assert.equal(run('h.alive'),false);assert(!run("b.log.at(-1).t.includes('moves clear')"));
});

test('CONF-01: equipment and Auto Gear persist before the Party screen closes',()=>{
 const {run}=harness();run("renderParty=()=>{};bag.items.push('fine_sword');autosave();pickItem=bag.items.length-1;applyItem(party[0]);const equipped=decodeSave(persistRead());");assert.equal(run('equipped.party[0].eq.weapon'),'fine_sword');
 run("unequip(party[0],'weapon');const removed=decodeSave(persistRead());");assert.equal(run('removed.party[0].eq.weapon'),null);assert(run("removed.bag.items.includes('fine_sword')"));
 run('autoAssignGear();const assigned=decodeSave(persistRead());');assert.equal(run('assigned.party[0].eq.weapon'),run('party[0].equip.weapon'));assert.equal(run('assigned.bag.items.join()'),run('bag.items.join()'));const blocked=harness({storageBlocked:true});blocked.run("renderParty=()=>{};bag.items.push('fine_sword');pickItem=bag.items.length-1;applyItem(party[0]);");assert.equal(blocked.run('decodeSave(encodeSave(saveState())).party[0].eq.weapon'),'fine_sword');
});
test('CONF-02: exploration healing saves HP and consumed potion together; full HP preserves the potion',()=>{
 const {run}=harness();run("renderParty=()=>{};party[0].hp=1;bag.items.push('potion_heal');pickItem=bag.items.length-1;applyItem(party[0]);const healed=decodeSave(persistRead());");assert.equal(run('healed.party[0].hp'),run('party[0].hp'));assert.equal(run('healed.bag.items.join()'),run('bag.items.join()'));
 run("party[0].hp=party[0].maxHp;bag.items.push('potion_heal');pickItem=bag.items.length-1;const before=bag.items.length;applyItem(party[0]);");assert.equal(run('bag.items.length'),run('before'));assert.match(run("$('#partySub').textContent"),/full HP/);
});
test('CONF-03: full-HP combat healing spends neither potion nor action; wounded heroes still heal',()=>{
 const {run}=harness();run("enterCombat({pool:['skeleton']},'2,2');cancelTurn();game.order=['p1',...game.order.filter(id=>id!=='p1')];game.turnIndex=0;game._begin();bag.items.push('potion_heal');const index=bag.items.length-1,before=bag.items.length;const originalRoll=Dice.roll;let potionRolls=0;Dice.roll=(...args)=>{potionRolls++;return originalRoll(...args);};useItem(index);");assert.equal(run('bag.items.length'),run('before'));assert.equal(run('party[0].acted.action'),false);assert.equal(run('potionRolls'),0);
 run('party[0].hp=1;useItem(index);');assert.equal(run('bag.items.length'),run('before-1'));assert.equal(run('party[0].acted.action'),true);assert(run('party[0].hp>1'));
});
test('CONF-04: turn forecast skips dead units, keeps incapacitated turns, wraps rounds and follows Wait',()=>{
 const {run}=harness();run("const crew=makeParty(),foe=spawnMonster('ogre',0,false),b=new CombatEngine(crew,[foe],10,10);b.order=['p1','p2','e0','p3','p4'];b.turnIndex=2;b.round=3;crew[2].alive=false;crew[3].statuses=[{type:'hold',duration:2}];const original=b.order.join(),forecast=b.turnPreview();");assert.equal(run('forecast.map(t=>t.unit.id).join()'),'e0,p4,p1,p2');assert.equal(run('forecast.map(t=>t.round).join()'),'3,3,4,4');assert.equal(run('b.order.join()'),run('original'));assert.equal(run('b.turnPreview(1).length'),1);run('b.delay();');assert.equal(run('b.turnPreview().slice(0,2).map(t=>t.unit.id).join()'),'p4,e0');assert.equal(run('b.turnPreview()[1].round'),3);
});
test('CONF-05: movement warnings match available reactions, marked areas and embers without mutation',()=>{
 const {run}=harness();run("const crew=makeParty(),w=spawnMonster('ash_cantor',0,false),b=new CombatEngine(crew,[w],10,10),h=crew[0];h.pos={x:3,y:3};w.pos={x:4,y:3};b._castPoint(w,SPELLS.cinder,{x:6,y:6});b.terrain.set('6,6','ember');const before=JSON.stringify([h,w]);const risk=b.movementRisk(h,{x:6,y:6});");assert.equal(run('risk.opportunity.length'),1);assert.equal(run('risk.blast.length'),1);assert.equal(run('risk.ember'),true);assert.equal(run('JSON.stringify([h,w])===before'),true);
 run('w.aooUsed=true;');assert.equal(run('b.movementRisk(h,{x:6,y:6}).opportunity.length'),0);run("w.aooUsed=false;w.statuses.push({type:'hold',duration:2});");assert.equal(run('b.movementRisk(h,{x:6,y:6}).opportunity.length'),0);assert.equal(run('b.movementRisk(h,{x:3,y:4}).opportunity.length'),0);
});

test('ACTOR-01: a hero killed by a movement reaction yields the turn automatically',()=>{
 const h=harness(),{run}=h;run("enterCombat({pool:['ogre'],budgetMul:.01},'2,2');cancelTurn();game.order=['p1','p2','p3','p4',...game.order.filter(id=>id.startsWith('e'))];game.turnIndex=0;game._begin();game.combatants.forEach((c,i)=>c.pos={x:i,y:0});party[0].pos={x:3,y:3};game.living('enemy')[0].pos={x:4,y:3};party[0].hp=1;Rules.attack=()=>({hit:true,crit:false});Rules.damage=()=>99;setMode('move');combatClick(2,5);");assert.equal(run('party[0].alive'),false);assert.equal(run('game.current().id'),'p2');assert.equal(h.timers.size,0);
});
test('ACTOR-02: a caster killed by its own area spell yields once and never skips the next living hero',()=>{
 const h=harness(),{run}=h;run("enterCombat({pool:['ogre'],budgetMul:.01},'2,2');cancelTurn();game.order=['p4','p1','p2','p3',...game.order.filter(id=>id.startsWith('e'))];game.turnIndex=0;game._begin();party[3].pos={x:2,y:2};party[3].hp=1;party.slice(0,3).forEach((c,i)=>c.pos={x:0,y:i*2});game.living('enemy')[0].pos={x:8,y:8};Rules.spellAmount=()=>20;selectSpell('fireball');combatClick(2,2);combatClick(2,2);");assert.equal(run('party[3].alive'),false);assert.equal(run('game.current().id'),'p1');assert.equal(h.timers.size,0);
});

test('ARENA-01: each controller guardian receives its authored arena; ordinary battles retain their theme',()=>{
 for(const id of ['bell_warden','ash_cantor','crypt_lord','eclipse_wyrm']){const {run}=harness();run(`enterCombat({boss:true,lead:'${id}',pool:['skeleton']},'2,2');cancelTurn();`);assert.equal(run('game.battlefield'),run(`GUARDIAN_ARENAS.${id}`));assert(run('BATTLEFIELDS[game.battlefield].desc.length>40'));}
 const {run}=harness();run("enterCombat({pool:['skeleton']},'2,2');cancelTurn();");assert.equal(run('game.battlefield'),run('explore.theme'));
});
test('ARENA-02: authored terrain stays bounded, has no duplicate cells, and leaves every spawn traversable',()=>{
 const {run}=harness();assert(run("Object.values(BATTLEFIELDS).every(a=>{const cells=['cover','sanctum','ember'].flatMap(t=>a[t].map(p=>p.join()));return cells.length===new Set(cells).size&&['cover','sanctum','ember'].every(t=>a[t].every(([x,y])=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<10&&y>=0&&y<10));})"));
 for(const id of ['bell_warden','ash_cantor','crypt_lord','eclipse_wyrm']){run(`const b${id}=new CombatEngine(makeParty(),[spawnMonster('${id}',0,true)],10,10,GUARDIAN_ARENAS.${id});`);assert(run(`b${id}.combatants.every(c=>b${id}.passable(c.pos.x,c.pos.y,c)&&b${id}.reachable(c).size>0)`));}
});
test('ARENA-03: living half-health shifts happen once, keep templates immutable and inflict no immediate HP damage',()=>{
 for(const id of ['bell_warden','ash_cantor','crypt_lord','eclipse_wyrm']){const {run}=harness();run(`const template=JSON.stringify(BATTLEFIELDS),boss=spawnMonster('${id}',0,true),b=new CombatEngine(makeParty(),[boss],10,10,GUARDIAN_ARENAS.${id});boss.hp=Math.floor(boss.maxHp/2);const hp=b.combatants.map(c=>c.hp).join();b._checkEnd();const shifted=JSON.stringify([...b.terrain]);b._checkEnd();`);assert.equal(run('JSON.stringify([...b.terrain])'),run('shifted'));assert.equal(run('JSON.stringify(BATTLEFIELDS)'),run('template'));assert.equal(run('b.combatants.slice(0,5).map(c=>c.hp).join()'),run('hp'));assert.equal(run('b.log.filter(e=>e.t===BATTLEFIELDS[b.battlefield].shift.text).length'),1);}
 const {run}=harness();run("const dead=spawnMonster('ash_cantor',0,false),b=new CombatEngine(makeParty(),[dead],10,10,'cinder_choir');dead.hp=0;dead.alive=false;b._checkEnd();");assert.equal(run('!!dead.awakened'),false);
});
test('ARENA-04: saved councils add bounded sanctums and shelter them through the phase; legacy grants no aid',()=>{
 const {run}=harness();run("campaign.decisions={entrance:'lanterns',gallery:'names',catacombs:'choir'};const before=JSON.stringify(STORY);enterCombat({boss:true,lead:'bell_warden',pool:['skeleton']},'2,2');cancelTurn();");assert.equal(run('game.arenaShelter.size'),2);assert.equal(run("game.terrain.get('2,5')"),'sanctum');assert.equal(run("game.terrain.get('3,2')"),'sanctum');run("enterCombat({boss:true,lead:'ash_cantor',pool:['skeleton']},'2,2');cancelTurn();const boss=game.living('enemy').find(c=>c.cls==='AshCantor');boss.hp=Math.floor(boss.maxHp/2);game._checkEnd();");assert.equal(run("game.terrain.get('3,4')"),'sanctum');assert.equal(run("game.terrain.get('3,5')"),'ember');assert.equal(run('JSON.stringify(STORY)'),run('before'));run("campaign.decisions.catacombs='legacy';enterCombat({boss:true,lead:'ash_cantor',pool:['skeleton']},'2,2');cancelTurn();");assert.equal(run('game.arenaShelter.size'),0);
});
test('RELIC-05: Lantern protects terrain embers at use time, while spell damage remains unmodified',()=>{
 const {run}=harness();run("const heroes=makeParty(),b=new CombatEngine(heroes,[spawnMonster('ogre',0,false)],10,10),h=heroes[0];h.hp=1;h.equip.armor='lantern_mantle';b.terrain.set(key(h.pos.x,h.pos.y),'ember');b._terrainTick(h);");assert.equal(run('h.hp'),1);assert.equal(run('h.alive'),true);assert.equal(run('b._spellDamage(h,5)'),5);assert.equal(run('b.movementRisk(h,h.pos).ember'),false);run("h.equip.armor=null;b._terrainTick(h);");assert.equal(run('h.alive'),false);
});
test('RELIC-06: Starweave improves only spell-control saves, including a successful marginal save',()=>{
 const {run}=harness();run("const heroes=makeParty(),caster=spawnMonster('necromancer',0,false),b=new CombatEngine(heroes,[caster],10,10),h=heroes[0];h.equip.armor='starweave';const calls=[];Rules.save=(target,dc,stat)=>{calls.push({dc,stat});return dc<=SPELLS.hold.effect.dc-2;};b.castSpell(caster,SPELLS.hold,h);");assert.equal(run('h.statuses.length'),0);assert.equal(run('calls[0].dc'),run('SPELLS.hold.effect.dc-2'));assert.equal(run('b._spellDamage(h,5)'),5);run("h.equip.armor=null;caster.acted.action=false;b.castSpell(caster,SPELLS.hold,h);");assert(run('h.statuses.some(s=>s.type===\'hold\')'));assert.equal(run('calls[1].dc'),run('SPELLS.hold.effect.dc'));run("h.equip.armor='starweave';h.statuses=[];caster.spells.push({id:'hex',uses:1,max:1});caster.acted.action=false;b.castSpell(caster,SPELLS.hex,h);");assert.equal(run('calls[2].dc'),run('SPELLS.hex.effect.dc-2'));run("Rules.save(h,14,'con');");assert.equal(run('calls[3].dc'),14);
});
test('RELIC-07: comparisons expose replaced passives and class locks; old equipment IDs acquire current rules on load',()=>{
 const {run}=harness();run("party[0].equip.armor='lantern_mantle';const comparison=gearComparison(party[0],ITEMS.starweave);const saved=encodeSave(saveState());applySave(decodeSave(saved));");assert.match(run('comparison'),/\+1 AC/);assert.match(run('comparison'),/terrain ember/);assert.match(run('comparison'),/spell control/);assert.match(run('gearComparison(party[3],ITEMS.dawnblade)'),/cannot use/);assert.equal(run('ITEMS[party[0].equip.armor].emberGuard'),2);assert.match(run('itemRules(ITEMS.eclipsescale)'),/less damage per spell hit/);
});

test('PATROL-01: affordable patrols field complementary roles from their own pool',()=>{
 const {run}=harness();for(const [tactic,pool,roles]of [['volley',['goblin','archer'],['vanguard','archer']],['hexnet',['skeleton','hexer'],['vanguard','controller']],['warband',['orc','shaman'],['vanguard','support']],['procession',['skeleton','bonecaller'],['vanguard','support']],['pincer',['goblin','skeleton'],['vanguard','vanguard']]]){run(`var squad=composeEncounter({tactic:'${tactic}',pool:${JSON.stringify(pool)}},{floor:3,partyLevel:4,gear:100,difficulty:1});`);assert.equal(run('squad.slice(0,2).map(patrolRole).join()'),roles.join());assert(run(`squad.every(c=>${JSON.stringify(pool)}.some(id=>BESTIARY[id].cls===c.cls))`));}
});
test('PATROL-02: role guarantees respect budgets/caps, bosses ignore patrols and low budgets fall back safely',()=>{
 const {run}=harness();assert(run("Object.entries(PATROL_TACTICS).every(([tactic])=>[.65,1,1.25].every(difficulty=>[0,1,2,3].every(floor=>{for(let i=0;i<12;i++){const ctx={floor,partyLevel:floor+1,gear:0,difficulty},budget=Math.round(encounterBudget(ctx)*difficulty),squad=composeEncounter({tactic,pool:['goblin','skeleton','archer','hexer','shaman','bonecaller']},ctx),cost=squad.reduce((n,c)=>n+threatOf(Object.keys(BESTIARY).find(id=>BESTIARY[id].cls===c.cls))*(c.elite?ELITE.threat:1),0);if(!squad.length||squad.length>DIFFICULTY.maxEnemies||cost>budget+DIFFICULTY.slack)return false;}return true;})))"));
 const a=harness({seed:314}),b=harness({seed:314});assert.equal(a.run("JSON.stringify(composeEncounter({boss:true,lead:'bell_warden',pool:['skeleton']},{floor:2,partyLevel:3}))"),b.run("JSON.stringify(composeEncounter({boss:true,tactic:'hexnet',lead:'bell_warden',pool:['skeleton']},{floor:2,partyLevel:3}))"));assert.equal(run("deploymentTactic({pool:['goblin','archer']},[spawnMonster('goblin',0,false)])"),null);assert.equal(run("deploymentTactic({tactic:'volley',pool:['goblin']},[spawnMonster('goblin',0,false),spawnMonster('goblin',1,false)])"),'pincer');
});
test('PATROL-03: formations keep units unique/in bounds, vary deployment and leave plain/boss constructors intact',()=>{
 const {run}=harness();assert(run("[8,10].every(size=>Object.keys(PATROL_TACTICS).every(tactic=>{const heroes=makeParty(),foes=['goblin','skeleton','archer','hexer','shaman','bonecaller'].map((id,i)=>spawnMonster(id,i,false)),b=new CombatEngine(heroes,foes,size,size,null,tactic),keys=b.combatants.map(c=>key(c.pos.x,c.pos.y));return keys.length===new Set(keys).size&&b.combatants.every(c=>b.inBounds(c.pos.x,c.pos.y));}))"));assert(run("new Set(Object.keys(PATROL_TACTICS).map(tactic=>JSON.stringify(patrolPositions([spawnMonster('goblin',0,false),spawnMonster('archer',1,false)],makeParty().map((c,i)=>({...c,pos:{x:0,y:1+i*2}})),10,10,tactic)))).size===5"));run("const b=new CombatEngine(makeParty(),[spawnMonster('ogre',0,false)],10,10);");assert.equal(run('b.tactic'),null);assert.equal(run('b.living(\'enemy\')[0].pos.x'),8);
});
test('PATROL-04: tactic descriptors round-trip, old saves derive safely and unknown tactics reject atomically',()=>{
 const h=harness(),{run}=h;run("const saved=saveState(),entry=Object.values(saved.explore.encounters)[0];entry.tactic='volley';");assert.equal(run('applySave(decodeSave(encodeSave(saved)))'),true);run("const intact=JSON.stringify(saveState());entry.tactic='unknown';");assert.equal(run('applySave(saved)'),false);assert.equal(run('JSON.stringify(saveState())===intact'),true);run('delete entry.tactic;');assert.equal(run('applySave(saved)'),true);assert.equal(run("encounterTactic({pool:['skeleton','hexer']})"),'hexnet');
});
test('DEFEAT-01: damage evidence clamps overkill and respects wards; friendly spell loss is a subset',()=>{
 const {run}=harness();run("const heroes=makeParty(),foe=spawnMonster('ogre',0,false),b=new CombatEngine(heroes,[foe],10,10),h=heroes[0];h.hp=3;Rules.attack=()=>({hit:true,crit:false});Rules.damage=()=>99;h.pos={x:3,y:3};foe.pos={x:4,y:3};b.doAttack(foe,h);");assert.equal(run('b.battleReport.damage.weapon'),3);assert.equal(run('b.battleReport.firstFall.name'),run('h.name'));
 run("heroes[1].equip.armor='eclipsescale';heroes[1].hp=10;heroes[1].pos={x:4,y:4};heroes[3].spells=[{id:'fireball',uses:1,max:1}];heroes[3].pos={x:0,y:0};heroes[3].acted.action=false;Rules.spellAmount=()=>5;b.castSpell(heroes[3],SPELLS.fireball,{x:4,y:4});");assert.equal(run('b.battleReport.damage.spell'),3);assert.equal(run('b.battleReport.friendlyFire'),3);run("heroes[1].equip.armor='lantern_mantle';b.terrain.set('4,4','ember');b._terrainTick(heroes[1]);");assert.equal(run('b.battleReport.damage.ember'),0);
});
test('DEFEAT-02: actual misses, reactions, poison, embers and skipped turns are counted without duplicate ticks',()=>{
 const {run}=harness();run("const crew=makeParty(),foe=spawnMonster('ogre',0,false),b=new CombatEngine(crew,[foe],10,10),h=crew[0];h.pos={x:3,y:3};foe.pos={x:4,y:3};Rules.attack=()=>({hit:false});b.doAttack(h,foe);b._reactStrike(h,foe,'guard');h.hp=10;h.statuses=[{type:'hold',duration:2},{type:'poison',duration:2,dmg:2}];b.terrain.set('3,3','ember');b.order=['p1','p2','p3','p4','e0'];b.turnIndex=0;b.endTurn();");assert.equal(run('b.battleReport.strikes'),2);assert.equal(run('b.battleReport.misses'),2);assert.equal(run('b.battleReport.controlTurns'),1);assert.equal(run('b.battleReport.damage.poison'),2);assert.equal(run('b.battleReport.damage.ember'),2);assert.equal(run('h.hp'),6);
});
test('DEFEAT-03: advice follows observed losses, empty evidence stays honest, and wins clear defeat content',()=>{
 const {run}=harness();run("const b=new CombatEngine(makeParty(),[spawnMonster('ogre',0,false)],10,10);b.phase='lost';b.battleReport.startHp=1;b.battleReport.damage.spell=10;b.battleReport.friendlyFire=10;const result=b.defeatSummary();");assert.equal(run('result.advice.length'),2);assert.match(run('result.advice[0]'),/Re-aim/);assert.match(run('result.advice[1]'),/rested/);run("b.battleReport={startHp:100,maxHp:100,damage:{weapon:0,spell:0,ember:0,poison:0},friendlyFire:0,controlTurns:0,strikes:0,misses:0,firstFall:null};");assert(run("b.defeatSummary().facts.includes('No damage breakdown was recorded.')"));run("game=b;mode='combat';endRun('lose');game.phase='won';endRun('win');");assert.equal(run("$('#defeatReview').hidden"),true);assert.equal(run("$('#defeatFacts').textContent"),'');
});
test('DEFEAT-04: evidence collection and summary are read-only for gameplay state and RNG',()=>{
 const a=harness({seed:919}),b=harness({seed:919});a.run("const engine=new CombatEngine(makeParty(),[spawnMonster('ogre',0,false)],10,10);const before=JSON.stringify(engine.combatants);engine._recordDamage(engine.combatants[0],4,'spell',engine.combatants[1]);engine.phase='lost';engine.defeatSummary();");b.run("const engine=new CombatEngine(makeParty(),[spawnMonster('ogre',0,false)],10,10);");assert.equal(a.run('JSON.stringify(engine.combatants)'),a.run('before'));assert.equal(a.run('Math.random()'),b.run('Math.random()'));
});

test('ENEMY-01: 21 distinct creatures, six bounded kits, staged habitats and unchanged guardian pools',()=>{
 const {run}=harness();assert.equal(run('Object.keys(BESTIARY).length'),21);assert.equal(run('Object.keys(SPX).length'),26);assert(run("['shield_sentinel','crypt_stalker','ember_wisp','spellbreaker','grave_leech','chain_warden'].every(id=>SPRITES[id]&&MONSTER_LORE[id]&&Object.values(WORLD).some(w=>w.encounters.some(e=>!e.boss&&e.pool.includes(id))))"));assert(run("WORLD.entrance.encounters.every(e=>e.pool.every(id=>!['shield_sentinel','crypt_stalker','ember_wisp','spellbreaker','grave_leech','chain_warden'].includes(id)))"));assert.equal(run("JSON.stringify(WORLD.sunless_tomb.encounters[0].pool)"),'["skeleton","necromancer","acolyte","bonecaller"]');
});
test('ENEMY-02: sentinel weapon ward is adjacent, nonstacking, disabled by control/death; previews and reactions agree',()=>{
 const {run}=harness();run("const crew=makeParty(),a=spawnMonster('shield_sentinel',0,false),d=spawnMonster('goblin',1,false),z=spawnMonster('shield_sentinel',2,false),b=new CombatEngine(crew,[a,d,z],10,10);a.pos={x:4,y:4};d.pos={x:5,y:4};z.pos={x:6,y:4};crew[0].pos={x:5,y:3};");assert.equal(run('b.shieldBonus(d)'),2);assert.equal(run('b.attackPreview(crew[0],d).shield'),2);assert.equal(run('b.shieldBonus(a)'),0);run("a.statuses=[{type:'hold',duration:2}];z.hp=0;b._drop(z);");assert.equal(run('b.shieldBonus(d)'),0);run("a.statuses=[];let wards=[];Rules.attack=(x,y,p,w)=>{wards.push(w);return {hit:false};};b.doAttack(crew[0],d);b._reactStrike(crew[0],d,'guard');");assert.equal(run('wards.join()'),'2,2');assert.equal(run('b._spellDamage(d,5)'),5);
});
test('ENEMY-03: stalker leap is once, bounded/free, spends movement and obeys Guard and leaving reactions',()=>{
 const {run}=harness();run("const crew=makeParty(),s=spawnMonster('crypt_stalker',0,false),b=new CombatEngine(crew,[s],10,10);s.pos={x:4,y:4};crew.forEach((h,i)=>h.pos={x:0,y:i*2+1});crew[0].range=10;crew[0].guarding=true;");
 run("crew[0].guardUsed=false;Rules.attack=()=>({hit:true,crit:false});Rules.damage=()=>99;b._leapTurn(s,crew);");assert.equal(run('s.leapUsed'),true);assert.equal(run('s.acted.move'),true);assert.equal(run('s.alive'),false);assert.equal(run('crew[0].guardUsed'),true);assert(run('b.inBounds(s.pos.x,s.pos.y)&&!crew.some(h=>h.pos.x===s.pos.x&&h.pos.y===s.pos.y)'));
 const second=harness().run;second("const crew=makeParty(),s=spawnMonster('crypt_stalker',0,false),b=new CombatEngine(crew,[s],10,10);s.pos={x:5,y:5};crew[0].pos={x:4,y:5};crew[3].pos={x:1,y:1};Rules.attack=()=>({hit:true,crit:false});Rules.damage=()=>1;b._leapTurn(s,[crew[3]]);");assert.equal(second('crew[0].aooUsed'),true);
});
test('ENEMY-04: dying wisp warns a full round, bursts once on both sides with wards/evidence, and victory disperses it',()=>{
 const {run}=harness();run("const crew=makeParty(),w=spawnMonster('ember_wisp',0,false),o=spawnMonster('ogre',1,false),b=new CombatEngine(crew,[w,o],10,10);w.pos={x:3,y:3};o.pos={x:4,y:4};crew[0].pos={x:3,y:2};crew[0].equip.armor='eclipsescale';crew[0].hp=10;w.hp=0;b._drop(w);b._drop(w);");assert.equal(run('b.echoes.length'),1);assert.equal(run('b.echoes[0].dueRound'),3);assert.equal(run('b.dangerAt({x:3,y:3}).length'),1);run('b.round=2;b._burstTick();');assert.equal(run('crew[0].hp'),10);run('b.round=3;b._burstTick();');assert.equal(run('crew[0].hp'),8);assert.equal(run('o.hp'),run('o.maxHp-4'));assert.equal(run('b.battleReport.damage.spell'),2);assert.equal(run('b.echoes.length'),0);run('b._burstTick();');assert.equal(run('crew[0].hp'),8);run("const lone=spawnMonster('ember_wisp',0,false),v=new CombatEngine(makeParty(),[lone],10,10);lone.hp=0;v._drop(lone);v._checkEnd();");assert.equal(run('v.phase'),'won');assert.equal(run('v.echoes.length'),0);
});
test('ENEMY-05: silence saves respect Starweave, prevents spells without charges, retains weapons/signatures and expires',()=>{
 const {run}=harness();run("const crew=makeParty(),s=spawnMonster('spellbreaker',0,false),b=new CombatEngine(crew,[s],10,10),h=crew[3];h.equip.armor='starweave';let dc;Rules.save=(target,n)=>{dc=n;return true;};b.castSpell(s,SPELLS.hush,h);");assert.equal(run('dc'),11);assert.equal(run('b.isSilenced(h)'),false);run("s.acted.action=false;Rules.save=()=>false;b.castSpell(s,SPELLS.hush,h);const uses=h.spells[0].uses;");assert.equal(run('b.usableSpells(h).length'),0);assert.equal(run('b.castSpell(h,SPELLS[h.spells[0].id],s)'),false);assert.equal(run('h.spells[0].uses'),run('uses'));assert.equal(run('h.acted.action'),false);assert.equal(run('b.signature(h)'),true);run('b._tick(h);');assert.equal(run('b.isSilenced(h)'),true);run('b._tick(h);');assert.equal(run('b.isSilenced(h)'),false);assert(run('b.usableSpells(h).length>0'));
});
test('ENEMY-06: siphon heals one nearby wounded ally from actual post-ward loss, with a three HP cap',()=>{
 const {run}=harness();run("const crew=makeParty(),s=spawnMonster('grave_leech',0,false),o=spawnMonster('ogre',1,false),b=new CombatEngine(crew,[s,o],10,10),h=crew[0];s.pos={x:3,y:3};o.pos={x:4,y:3};o.hp=10;h.hp=1;h.equip.armor='eclipsescale';Rules.spellAmount=()=>5;b.castSpell(s,SPELLS.grave_siphon,h);");assert.equal(run('o.hp'),11);assert.equal(run('b.battleReport.damage.spell'),1);run("s.acted.action=false;crew[1].hp=10;crew[1].equip.armor='eclipsescale';Rules.spellAmount=()=>1;b.castSpell(s,SPELLS.grave_siphon,crew[1]);");assert.equal(run('o.hp'),11);run("s.acted.action=false;crew[2].hp=10;Rules.spellAmount=()=>9;b.castSpell(s,SPELLS.grave_siphon,crew[2]);");assert.equal(run('o.hp'),14);
});
test('ENEMY-07: hook pulls once toward gaoler, respects occupied squares and leaves movement/action and reactions unspent',()=>{
 const {run}=harness();run("const crew=makeParty(),s=spawnMonster('chain_warden',0,false),b=new CombatEngine(crew,[s],10,10),h=crew[0];s.pos={x:5,y:5};h.pos={x:2,y:2};Rules.spellAmount=()=>1;b.castSpell(s,SPELLS.chain_hook,h);");assert.equal(run('JSON.stringify(h.pos)'),'{"x":3,"y":3}');assert.equal(run('h.acted.move'),false);assert.equal(run('s.aooUsed'),false);run("s.acted.action=false;crew[1].pos={x:4,y:4};b.castSpell(s,SPELLS.chain_hook,h);");assert.equal(run('JSON.stringify(h.pos)'),'{"x":3,"y":3}');assert.equal(run('s.spells[0].uses'),0);
});
test('ENEMY-08: old encounter pools stay unchanged on import; new creatures round-trip, unknown ones reject atomically',()=>{
 const {run}=harness();run("const save=saveState(),enc=Object.values(save.explore.encounters)[0];enc.pool=['goblin','skeleton'];const old=JSON.stringify(save.explore.encounters);");assert.equal(run('applySave(decodeSave(encodeSave(save)))'),true);assert.equal(run('JSON.stringify(saveState().explore.encounters)'),run('old'));run("enc.pool=['shield_sentinel','crypt_stalker','ember_wisp','spellbreaker','grave_leech','chain_warden'];");assert.equal(run('applySave(save)'),true);run("const before=party;enc.pool=['bad_creature'];");assert.equal(run('applySave(save)'),false);assert.equal(run('party===before'),true);
});
test('ENEMY-09: round-boundary burst grants a full cycle, skips a newly fallen first actor and Auto evades its warning',()=>{
 const {run}=harness();run("const crew=makeParty(),w=spawnMonster('ember_wisp',0,false),o=spawnMonster('ogre',1,false),b=new CombatEngine(crew,[w,o],10,10);w.pos={x:3,y:3};crew[0].pos={x:3,y:2};crew[0].hp=1;w.hp=0;b._drop(w);b.order=['p1','p2','p3','p4','e0','e1'];b.turnIndex=5;b.endTurn();");assert.equal(run('b.round'),2);assert.equal(run('crew[0].alive'),true);run('for(let i=0;i<5;i++)b.endTurn();');assert.equal(run('b.round'),3);assert.equal(run('crew[0].alive'),false);assert.equal(run('b.current().id'),'p2');assert.equal(run('b.echoes.length'),0);
 const evade=harness().run;evade("const crew=makeParty(),w=spawnMonster('ember_wisp',0,false),o=spawnMonster('ogre',1,false),b=new CombatEngine(crew,[w,o],10,10);w.pos={x:3,y:3};crew[0].pos={x:3,y:2};w.hp=0;b._drop(w);b._evade(crew[0]);");assert.equal(evade('b.dangerAt(crew[0].pos).length'),0);assert.equal(evade('crew[0].acted.action'),false);
});
test('ENEMY-10: silenced channel is postponed without charge loss, then resumes once after expiry',()=>{
 const {run}=harness();run("const crew=makeParty(),w=spawnMonster('bell_warden',0,false),b=new CombatEngine(crew,[w],10,10);b._castPoint(w,SPELLS.war_chant,w.pos);w.acted.action=false;w.statuses.push({type:'silence',duration:2});b.actAuto(w);");assert.equal(run('!!w.intent'),true);assert.equal(run('w.spells[0].uses'),1);run('b._tick(w);b._tick(w);b.actAuto(w);');assert.equal(run('w.intent'),null);assert.equal(run('w.spells[0].uses'),0);assert.equal(run('w.acted.action'),true);
});
