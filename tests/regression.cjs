// Dependency-free checks against the real inline game script. Run: node tests/regression.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];

function harness({storageBlocked=false,seed=42}={}){
  const elements=new Map(),timers=new Map(),saved=new Map();let seq=0;
  function element(){const classes=new Set();return {value:'',style:{setProperty(){}},dataset:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(){}},appendChild(){},focus(){},addEventListener(){},querySelectorAll(){return []},setAttribute(){},removeAttribute(){}};}
  const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const context=vm.createContext({console,TextEncoder,TextDecoder,btoa,atob,Math:math,document:{querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s);},querySelectorAll(){return [];},createElement:element,addEventListener(){}},localStorage:{setItem(k,v){if(storageBlocked)throw Error('blocked');saved.set(k,v);},getItem:k=>saved.get(k),removeItem:k=>saved.delete(k)},setTimeout(f){timers.set(++seq,f);return seq;},clearTimeout:id=>timers.delete(id)});
  const run=code=>vm.runInContext(code,context,{timeout:15000});
  run(source);
  run("render=()=>autosave();renderTown=()=>autosave();renderLevelUp=()=>{};renderCampaign=()=>{};newGame();$('#startScreen').classList.remove('show');");
  return {run,timers,tick(){const entry=timers.entries().next().value;if(!entry)return false;timers.delete(entry[0]);entry[1]();return true;}};
}

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

test('LIMIT-01: standalone payload stays below the 350 KiB budget',()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');assert(Buffer.byteLength(html)<=358400);assert.equal(/<script[^>]+src=/i.test(html),false);
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
   const {run}=harness({seed});outcomes.push(run(`const heroes=DEFAULT_BLOCKS.map((b,i)=>buildHero(CLASSES[b.cls],b.name,b.ab,'p'+(i+1),${level},b.bg));const mob=composeEncounter({boss:true,lead:'eclipse_wyrm',pool:['skeleton'],budgetMul:.45},{floor:2,partyLevel:${level},gear:0,difficulty:OATHS.${oath}.budget});const battle=new CombatEngine(heroes,mob,10,10,'tomb');let turns=0;while(battle.phase==='playing'&&turns++<1000){battle.actAuto(battle.current());if(battle.phase==='playing')battle.endTurn();}battle.phase;`));
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
