const {test}=require('node:test'),assert=require('node:assert/strict');
const {harness}=require('./harness.cjs');
function setup(){const h=harness();h.run("newGame(DEFAULT_BLOCKS.map((b,i)=>buildHero(CLASSES[b.cls],b.name,b.ab,'p'+(i+1),3,b.bg)));$('#startScreen').classList.remove('show');");return h;}
test('LOOT-01: twelve additions have class coverage, art, lore, exact rules and genuine sources',()=>{
 const {run}=setup();assert.equal(run('Object.keys(ITEMS).length'),41);assert.equal(run('Object.values(ITEMS).filter(it=>it.legendary).length'),18);
 assert.equal(run("Object.values(ITEMS).every(it=>TREASURE_ART[it.id]&&RELIC_LORE[it.id]&&itemRules(it)&&!itemSources(it.id).includes('No current'))"),true);
 assert.equal(run("['Fighter','Mage','Cleric','Thief'].every(cls=>Object.values(ITEMS).some(it=>it.legendary&&it.classes?.length===1&&it.classes[0]===cls))"),true);
});
test('LOOT-02: Bellheart applies weapon ward and movement loss to normal/reaction hits, never spell damage',()=>{
 const {run}=setup();run("const f=party.find(h=>h.cls==='Fighter');f.equip.offhand='bellheart_aegis';const e=spawnMonster('goblin',0,false);game=new CombatEngine(party,[e],10,10);f.pos={x:3,y:3};e.pos={x:4,y:3};Rules.attack=()=>({hit:true,crit:false});Rules.damage=()=>5;windowDummy=0;");
 assert.equal(run('effSpeed(f)'),3);assert.equal(run('game.reachable(f).has(key(0,2))'),true);assert.equal(run('game.reachable(f).has(key(7,3))'),false);
 run("const start=f.hp;e.acted.action=false;game.doAttack(e,f);normalLost=start-f.hp;const next=f.hp;game._reactStrike(e,f,'aoo');reactionLost=next-f.hp;");assert.equal(run('normalLost'),4);assert.equal(run('reactionLost'),4);assert.equal(run('game._spellDamage(f,5)'),5);
 run("e.intent={spell:'war_chant',interrupt:true,x:e.pos.x,y:e.pos.y};e.equip={offhand:'bellheart_aegis'};Rules.damage=()=>1;f.acted.action=false;game.doAttack(f,e);");assert.equal(run('!!e.intent'),true);
 run("f.equip.offhand=null;");assert.equal(run('effSpeed(f)'),4);
});
test('LOOT-03: bows share range, cover, melee pressure, distance damage, reactions and arrows',()=>{
 const {run}=setup();run("const t=party.find(h=>h.cls==='Thief');t.equip.weapon='nightwarden_bow';const e=spawnMonster('ogre',0,false);e.maxHp=500;game=new CombatEngine(party,[e],10,10);t.pos={x:2,y:2};e.pos={x:6,y:2};Rules.attack=()=>({hit:true,crit:false});Rules.damage=()=>5;const start=e.hp;game.doAttack(t,e);farLoss=start-e.hp;");assert.equal(run('effRange(t)'),6);assert.equal(run('farLoss'),7);assert.equal(run('game.visualEvents.at(-1).kind'),'arrow');
 run("t.acted.action=false;e.pos={x:3,y:2};combatTiles(e).forEach(p=>game.terrain.set(key(p.x,p.y),'cover'));const before=e.hp;game.doAttack(t,e);nearLoss=before-e.hp;");assert.equal(run('nearLoss'),3);assert.equal(run('game.attackPreview(t,e).penalty'),4);assert.equal(run('game.attackPreview(t,e).cover'),2);
 run("e.pos={x:6,y:2};const beforeReact=e.hp;game._reactStrike(t,e,'guard');reactLoss=beforeReact-e.hp;");assert.equal(run('reactLoss'),7);
 run("t.equip.weapon='scout_bow';e.pos={x:7,y:2};");assert.equal(run('effRange(t)'),4);assert.equal(run('game.canAttack(t,e)'),false);run('t.equip.weapon=null;');assert.equal(run('effRange(t)'),1);
});
test('LOOT-04: healing weapons replace rather than stack, cap healing and exclude signatures/potions',()=>{
 const {run}=setup();run("const c=party.find(h=>h.cls==='Cleric'),f=party.find(h=>h.cls==='Fighter');c.equip.weapon='mercy_reliquary';game=new CombatEngine(party,[spawnMonster('ogre',0,false)],10,10);Rules.spellAmount=()=>4;f.hp=1;const before=f.hp;game.castSpell(c,SPELLS.cure,f);healed=f.hp-before;");assert.equal(run('healed'),6);
 run("c.acted.action=false;c.equip.weapon='pilgrim_mace';f.hp=1;game.castSpell(c,SPELLS.cure,f);");assert.equal(run('f.hp'),6);assert.equal(run('healingPower(c)'),1);
 run("c.acted.action=false;c.equip.weapon='mercy_reliquary';f.hp=f.maxHp-1;game.castSpell(c,SPELLS.cure,f);");assert.equal(run('f.hp===f.maxHp'),true);
 run("c.acted.action=false;c.signatureUsed=false;f.hp=1;game.signature(c);");assert.equal(run('f.hp'),13); // 6 + 2*level, plus initial 1; no relic bonus
});
test('LOOT-05: Covenant has one separate charge per battle, respects silence, friendly fire and signature boundaries',()=>{
 const {run}=setup();run("const m=party.find(h=>h.cls==='Mage');m.equip.weapon='ashen_covenant';game=new CombatEngine(party,[spawnMonster('ogre',0,false)],10,10);m.pos={x:3,y:3};m.hp=m.maxHp;Rules.spellAmount=()=>4;const old=m.hp;game.castSpell(m,SPELLS.ashen_flare,{x:3,y:3});flareLoss=old-m.hp;");assert.equal(run('flareLoss'),4);assert.equal(run('m.relicSpell.uses'),0);assert.equal(run("game.castSpell(m,SPELLS.ashen_flare,{x:3,y:3})"),false);
 run('m.acted.action=false;game.signature(m);');assert.equal(run('m.relicSpell.uses'),0);
 assert.equal(run("JSON.stringify(saveState()).includes('relicSpell')"),false);assert.equal(run("m.spells.some(s=>s.id==='ashen_flare')"),false);
 run("game=new CombatEngine(party,[spawnMonster('ogre',0,false)],10,10);m.statuses.push({type:'silence',duration:2});");assert.equal(run('m.relicSpell.uses'),1);assert.equal(run("game.castSpell(m,SPELLS.ashen_flare,{x:5,y:3})"),false);assert.equal(run('m.relicSpell.uses'),1);
 run("m.statuses=[];party.forEach((h,i)=>h.pos={x:3+i%2,y:3+Math.floor(i/2)});game.living('enemy')[0].pos={x:3,y:3};");assert.equal(run('game._bestPointTile(m,SPELLS.ashen_flare)'),null);
});
test('LOOT-06: footwear accompanies armour and does not bake movement or wards into saves',()=>{
 const {run}=setup();run("const f=party[0];f.equip.armor='chain';const oldAC=effAc(f);bag.items.push('pilgrim_boots');pickItem=bag.items.length-1;applyItem(f);");assert.equal(run('effSpeed(f)'),5);assert.equal(run('effAc(f)'),run('oldAC'));assert.match(run('gearComparison(f,ITEMS.bellheart_aegis)'),/Movement 5 → 4/);
 run("applySave(decodeSave(encodeSave(saveState())));");assert.equal(run('effSpeed(party[0])'),5);assert.equal(run('party[0].speed'),4);
 run("party[0].equip.accessory='ward_charm';game=new CombatEngine(party,[spawnMonster('hexer',0,false)],10,10);Rules.save=(c,dc)=>dc===12;");assert.equal(run("game._controlSave(party[0],{dc:13,saveStat:'wis'})"),true);
});
test('LOOT-07: tactical consumables preserve no-op items/actions, cleanse during silence, and cannot bypass incapacitation',()=>{
 const {run}=setup();run("game=new CombatEngine(party,[spawnMonster('ogre',0,false)],10,10);mode='combat';game.order=party.map(h=>h.id).concat('e0');game.turnIndex=0;game._begin();bag.items=['dawn_salt','smoke_phial'];useItem(0);");assert.equal(run('bag.items.length'),2);assert.equal(run('party[0].acted.action'),false);
 run("party[0].statuses=[{type:'poison',duration:3,dmg:2},{type:'silence',duration:2},{type:'hex',duration:2,ac:-2},{type:'weaken',duration:2,atk:-3},{type:'ward',duration:2,buff:true,ac:3}];useItem(0);");assert.equal(run("party[0].statuses.map(s=>s.type).join(',')"),'ward');assert.equal(run('party[0].acted.action'),true);assert.equal(run('bag.items.length'),1);
 run("party[0].acted.action=false;useItem(0);party[0].acted.action=false;bag.items.push('smoke_phial');useItem(0);");assert.equal(run('bag.items.length'),1);assert.equal(run('party[0].acted.action'),false);assert.equal(run("party[0].statuses.filter(s=>s.type==='smokeveil').length"),1);
 run("game._tick(party[0]);game._tick(party[0]);");assert.equal(run("party[0].statuses.some(s=>s.type==='smokeveil')"),false);
 run("party[0].statuses.push({type:'hold',duration:2});useItem(0);");assert.equal(run('bag.items.length'),1);
});
test('LOOT-08: saleable finds cannot equip and retain discovery after sale and portable Continue',()=>{
 const {run}=setup();run("bag.items=[];collect({type:'item',item:'dawn_seal'});pickItem=0;applyItem(party[0]);const gold=bag.gold;sellItem(0);");assert.equal(run('bag.gold-gold'),60);assert.equal(run('party[0].equip.treasure'),undefined);assert.equal(run("campaign.discovered.includes('dawn_seal')"),true);
 run("applySave(decodeSave(encodeSave(saveState())));");assert.equal(run("campaign.discovered.includes('dawn_seal')&&!bag.items.includes('dawn_seal')"),true);
 run("bag.items.push('royal_astrolabe');bag.gold=9999990;sellItem(0);");assert.equal(run('bag.items.includes(\'royal_astrolabe\')'),true);assert.equal(run('bag.gold'),9999990);
});
test('LOOT-09: defeated encounter drops one saved relic on its tile; repeated resolution cannot duplicate it',()=>{
 const {run}=setup();run("const at=key(explore.pos.x,explore.pos.y);explore.encounters[at]={pool:['skeleton'],prize:'bellheart_aegis'};enterCombat(explore.encounters[at],at);cancelTurn();game.phase='won';game.xpEarned=0;resolveCombat();");assert.equal(run("bag.items.filter(id=>id==='bellheart_aegis').length"),1);assert.equal(run('explore.cleared.has(at)'),true);
 run("applySave(decodeSave(encodeSave(saveState())));enterCombat(explore.encounters[at],at);cancelTurn();game.phase='won';game.xpEarned=0;resolveCombat();");assert.equal(run("bag.items.filter(id=>id==='bellheart_aegis').length"),1);
});
test('LOOT-10: full bag preserves ground/cache/relic loot, rejects purchases and avoids partial currency changes',()=>{
 const {run}=setup();run("bag.items=Array(1000).fill('potion_heal');const at=key(explore.pos.x,explore.pos.y);handleEnter({type:'loot',item:{type:'item',item:'nightwarden_bow'},at});const beforeGold=bag.gold;buyItem('dawn_salt');");assert.equal(run('bag.items.length'),1000);assert.equal(run("explore.loot[at].item"),'nightwarden_bow');assert.equal(run('bag.gold'),run('beforeGold'));
 run("const secretsBefore=campaign.secrets;const g=bag.gold;handleEnter({type:'secret',cache:{gold:50,item:'royal_astrolabe'},at});");assert.equal(run('campaign.secrets'),run('secretsBefore'));assert.equal(run('bag.gold'),run('g'));assert.equal(run("explore.secrets[at].item"),'royal_astrolabe');
 run("delete explore.secrets[at];bag.items.pop();resumeExplore();");assert.equal(run("bag.items.includes('nightwarden_bow')"),true);assert.equal(run('explore.loot[at]'),undefined);
});
test('LOOT-11: discovery snapshots clone, legacy infers only held items, malformed metadata rejects before state/timer mutation',()=>{
 const {run}=setup();run("collect({type:'item',item:'dawn_seal'});const snapshot=saveState();campaign.discovered.push('royal_astrolabe');");assert.equal(run("snapshot.campaign.discovered.includes('royal_astrolabe')"),false);
 run("delete snapshot.campaign.discovered;delete snapshot.campaign.lastFind;applySave(snapshot);");assert.equal(run("campaign.discovered.includes('dawn_seal')"),true);assert.equal(run("campaign.discovered.includes('royal_astrolabe')"),false);assert.equal(run('campaign.lastFind'),null);
 run("enterCombat({pool:['skeleton']},'2,2');const combat=game,timer=turnTimer;const valid=saveState();");
 for(const code of ["s.campaign.discovered=['missing']","s.campaign.discovered=['dawn_seal','dawn_seal']","s.campaign.discovered=['dawn_seal'];s.campaign.lastFind='royal_astrolabe'","s.campaign.discovered={}","s.explore.encounters['1,1']={pool:['skeleton'],prize:'missing'}"]){assert.equal(run(`(()=>{const s=JSON.parse(JSON.stringify(valid));${code};return applySave(s);})()`),false);assert.equal(run('game===combat&&turnTimer===timer'),true);}
});
test('LOOT-12: all new rules/art/comparisons/discovery rendering preserve RNG and base stats',()=>{
 const {run}=setup();run("const before=JSON.stringify(party.map(h=>[h.speed,h.range,h.attackBonus,h.ac,h.damage]));Math.random=()=>{throw Error('Presentation consumed RNG');};for(const it of Object.values(ITEMS)){itemRules(it);itemSources(it.id);relicArtwork(it.id);for(const h of party)gearComparison(h,it);}collect({type:'item',item:'bellheart_aegis'});renderTreasureFind();");assert.equal(run('JSON.stringify(party.map(h=>[h.speed,h.range,h.attackBonus,h.ac,h.damage]))===before'),true);
});
