// Dependency-free checks against the real inline game script. Run: node --test tests/regression.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];

function harness({storageBlocked=false,seed=42}={}){
  const elements=new Map(),timers=new Map(),saved=new Map();let seq=0;
  function element(){const classes=new Set();return {value:'',style:{setProperty(){}},dataset:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(){}},appendChild(){},addEventListener(){},querySelectorAll(){return []},setAttribute(){},removeAttribute(){}};}
  const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const context=vm.createContext({console,TextEncoder,TextDecoder,btoa,atob,Math:math,document:{querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s);},querySelectorAll(){return [];},createElement:element,addEventListener(){}},localStorage:{setItem(k,v){if(storageBlocked)throw Error('blocked');saved.set(k,v);},getItem:k=>saved.get(k),removeItem:k=>saved.delete(k)},setTimeout(f){timers.set(++seq,f);return seq;},clearTimeout:id=>timers.delete(id)});
  const run=code=>vm.runInContext(code,context,{timeout:15000});
  run(source);
  run("render=()=>autosave();renderTown=()=>autosave();renderLevelUp=()=>{};renderCampaign=()=>{};newGame();");
  return {run,timers,tick(){const entry=timers.entries().next().value;if(!entry)return false;timers.delete(entry[0]);entry[1]();return true;}};
}

test('combat level allocations survive autosave, reload, and confirmation',()=>{
  const {run}=harness();
  run("enterCombat({pool:['goblin']},'fixture');cancelTurn();game.phase='won';game.xpEarned=100;resolveCombat();const code=encodeSave(saveState());levelUp=null;applySave(decodeSave(code));");
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
  run("campaign.oath='wanderer';enterCombat({pool:['goblin']},'fixture');cancelTurn();party[3].hp=0;party[3].alive=false;game.phase='won';game.xpEarned=50;resolveCombat();");
  assert.equal(run('party[3].xp'),50);
  assert.equal(run('party[3].hp>1'),true);
});

test('final stairs require both the crown and a defeated king',()=>{
  const {run}=harness();
  run("nodeId='sunless_tomb';bag.relic=true;descendOrWin();");
  assert.equal(run("$('#banner').classList.contains('show')"),false);
  run('campaign.bossSlain=true;descendOrWin();');
  assert.equal(run("$('#banner').classList.contains('show')"),true);
  assert.equal(run('persistRead()'),undefined);
});

test('legacy saves remember an already defeated Crypt Lord',()=>{
  const {run}=harness();
  run("nodeId='sunless_tomb';explore.encounters={'2,2':{boss:true,lead:'crypt_lord'}};explore.cleared.add('2,2');const old=saveState();delete old.campaign;applySave(old);");
  assert.equal(run('campaign.bossSlain'),true);
});
