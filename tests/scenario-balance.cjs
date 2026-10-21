// Scripted strategy probes, not human playtesting or full-campaign win rates.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{harness}=require('./harness.cjs');
const bosses={bell_warden:{floor:1,level:2},ash_cantor:{floor:2,level:3},crypt_lord:{floor:3,level:4},eclipse_wyrm:{floor:2,level:4}},results=[];
for(const [boss,stage]of Object.entries(bosses))for(const oath of ['wanderer','delver','ironbound'])for(const squad of ['company','double-cleric'])for(const gear of ['plain','wards'])for(const priority of ['guardian','retinue'])for(const seed of [1103,2909,4411]){
 const {run}=harness({seed});const result=run(`
 const classIds=${JSON.stringify(squad==='company'?['Fighter','Cleric','Thief','Mage']:['Fighter','Cleric','Cleric','Mage'])};
 const heroes=classIds.map((cls,i)=>{const b=DEFAULT_BLOCKS.find(b=>b.cls===cls);return buildHero(CLASSES[cls],b.name,b.ab,'p'+(i+1),${stage.level},b.bg);});
 if('${gear}'==='wards')heroes.forEach((h,i)=>h.equip.armor=i%2?'starweave':'lantern_mantle');
 const desc={boss:true,lead:'${boss}',pool:['skeleton'],...('${boss}'==='eclipse_wyrm'?{budgetMul:.45}:{})};
 const foes=composeEncounter(desc,{floor:${stage.floor},partyLevel:${stage.level},gear:0,difficulty:OATHS.${oath}.budget});
 const battle=new CombatEngine(heroes,foes,10,10,GUARDIAN_ARENAS.${boss});
 function frontline(c){
   if(!c.alive||battle.isIncapacitated(c))return;
   if(c.spells?.length){battle.actAuto(c);return;}
   battle._evade(c);if(!c.alive||battle.phase!=='playing')return;
   if(!c.signatureUsed&&battle.signature(c))return;
   const candidates=battle._foes(c).sort((a,b)=>{
     const score=u=>('${priority}'==='guardian'?!!u.bossTitle:!u.bossTitle)?100:0;
     return score(b)-score(a)||battle.cheb(c.pos,a.pos)-battle.cheb(c.pos,b.pos);
   });
   const target=candidates[0];if(!target)return;
   if(!battle.canAttack(c,target))battle._stepToward(c,target.pos);
   if(c.alive&&target.alive&&battle.canAttack(c,target))battle.doAttack(c,target);
 }
 let turns=0;while(battle.phase==='playing'&&turns++<600){const c=battle.current();if(c.side==='party')frontline(c);else battle.actAuto(c);if(battle.phase==='playing')battle.endTurn();}
 ({result:battle.phase,turns,rounds:battle.round,hp:heroes.reduce((n,h)=>n+Math.max(0,h.hp),0),maxHp:heroes.reduce((n,h)=>n+h.maxHp,0),phaseTriggered:battle.combatants.some(c=>c.bossTitle&&c.awakened),arena:battle.battlefield});
 `);
 assert(['won','lost'].includes(result.result),'Scenario stalled: '+JSON.stringify({boss,oath,squad,gear,priority,seed}));results.push({boss,oath,squad,gear,priority,seed,...result});
}
for(const boss of Object.keys(bosses))assert(results.some(r=>r.boss===boss&&r.oath==='wanderer'&&r.result==='won'),'No sampled Wanderer win: '+boss);
const summary=Object.fromEntries(Object.keys(bosses).map(boss=>[boss,Object.fromEntries(['wanderer','delver','ironbound'].map(oath=>{const rows=results.filter(r=>r.boss===boss&&r.oath===oath);return [oath,{wins:rows.filter(r=>r.result==='won').length,runs:rows.length}];}))]));
const report={build:harness().run('GAME_BUILD'),policy:'Scripted front-line guardian-first or retinue-first targeting; casters and enemies use Auto. Two squads, plain or ward relic fixtures, three oaths, three seeds per combination. Isolated stage-level arenas; no council bonuses, campaign attrition or shopping. Gear budget contribution is held at zero in both fixtures; actual campaign budgets still scale with equipped value. Not human testing or a difficulty guarantee.',total:results.length,stalls:0,summary,results};
const output=process.env.SCENARIO_OUTPUT||path.join(process.cwd(),'artifacts','scenarios');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('PASS: '+results.length+' scripted arena scenarios, zero stalls; each guardian has sampled Wanderer wins.');console.log(JSON.stringify(summary));
