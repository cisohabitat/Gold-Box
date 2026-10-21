const browserName=process.env.GOLD_BOX_BROWSER||'chromium';const chromium=require('playwright')[browserName];const assert=require('node:assert/strict');
async function runCampaigns(samples=3,onSample=null,{pursueVows=false,pursueTreasure=false,varyRewards=false,oaths=['wanderer','delver','ironbound'],branches=[0,1,2,3]}={}){
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(browserName==='chromium'?'/usr/bin/chromium':undefined),headless:true,args:browserName==='chromium'?['--no-sandbox']:[]});
try{
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');
const results=[];for(let sample=0;sample<samples;sample++){results.push(...await page.evaluate(({sample,pursueVows,pursueTreasure,varyRewards,oaths,branches})=>{
  const results=[];
  // Drive the real controller and engines synchronously; rendering stays active.
  for(const oath of oaths)for(const branch of branches){
    const runSeed=2718+branch+sample*10000;let seed=runSeed;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    showStart();document.querySelector('#oathChoice').value=oath;startDefault();
    let moves=0,turns=0,phases=0,stop='limit';const fights=[],rewardChoices=[];let tasks=0;
    while(moves++<1800){
      cancelTurn();
      if(mode==='combat'){
        const fight={floor:nodeId,depth:floorDepth(),guardians:game.living('enemy').filter(e=>e.bossTitle).map(e=>e.cls),foes:game.living('enemy').length,level:partyLevelAvg(),hpBefore:party.reduce((n,h)=>n+Math.max(0,h.hp),0),maxHp:party.reduce((n,h)=>n+h.maxHp,0),supplies:bag.rations};
        let fightTurns=0;
        while(game.phase==='playing'&&fightTurns++<800){const c=game.current();if(!game.isIncapacitated(c))game.actAuto(c);if(game.phase==='playing')game.endTurn();}
        fights.push({...fight,turns:fightTurns,rounds:game.round,hpAfter:party.reduce((n,h)=>n+Math.max(0,h.hp),0),down:party.filter(h=>!h.alive).length,result:game.phase});
        turns+=fightTurns;phases+=game.combatants.filter(c=>c.awakened).length;
        if(game.phase==='lost'){stop='defeat';break;}
        if(game.phase==='playing'){stop='combat stalled';break;}
        resolveCombat();continue;
      }
      if(document.querySelector('#fateScreen').classList.contains('show')){chooseCrownFate(['break','bind','wear'][sample%3]);continue;}
      if(document.querySelector('#banner').classList.contains('show')){stop='victory';break;}
      if(levelUp){autoAssignLevelUp();continue;}
      if(document.querySelector('#aftermathScreen').classList.contains('show')){closeAftermath();continue;}
      if(treasureAtFeet()&&document.querySelector('#partyScreen').classList.contains('show')){const reward=treasureAtFeet(),index=varyRewards?(sample+floorDepth())%3:0,item=reward.reward.items[index];if(!chooseTreasure(reward.offer,index))throw Error('Diagnostic reward claim failed');rewardChoices.push({offer:reward.offer,index,item});closeParty();continue;}
      if(curEvent){const options=EVENTS[curEvent.id].options;let pick=options.findIndex(o=>o.fallback),best=-Infinity;options.forEach((o,i)=>{if(!o.fallback){const score=bestForStat(o.stat).mod-o.dc;if(score>best){best=score;pick=i;}}});resolveEventOption(pick);closeEvent();continue;}
      if(document.querySelector('#townScreen').classList.contains('show')){
        if(pursueTreasure)for(const id of ['smoke_phial','dawn_salt','pilgrim_boots','ward_charm','pilgrim_mace','scout_bow','round_shield','ember_focus','iron_helm','sage_circlet','trail_boots','copper_ring'])if(!campaign.discovered.includes(id)&&bag.gold>=ITEMS[id].cost)buyItem(id);
        const offers=[...document.querySelectorAll('.boon-card')];if(offers.length)offers[0].click();townRest();autoAssignGear();document.querySelector('#partyScreen').classList.remove('show');
        if(!campaign.decisions[nodeId])chooseCouncil(STORY[nodeId].plans[(sample+branch)%2].id);
        for(const [i,cls]of Object.keys(HERO_QUESTS).entries()){if(!campaign.heroQuests[cls])chooseHeroQuest(cls,HERO_QUESTS[cls].plans[(sample+branch+i)%2].id);if(campaign.heroQuests[cls])fulfillHeroQuest(cls);}
        if(explore.task){if(!explore.task.done)throw Error("unfinished chapter objective");tasks++;}const next=WORLD[nodeId].next;enterDungeon(next.length===1?next[0]:next[(floorDepth()===1?branch>>1:branch&1)]);continue;
      }
      autoAssignGear();document.querySelector('#partyScreen').classList.remove('show');
      if(party.reduce((n,h)=>n+h.hp,0)<party.reduce((n,h)=>n+h.maxHp,0)*.7&&bag.rations>0)makeCamp();
      const loot=Object.entries(explore.loot).sort((a,b)=>(a[1].type==='key'?-1:0)-(b[1].type==='key'?-1:0));
      const task=explore.task;let objectives=[];if(task&&!task.done){if(task.id==='gallery')objectives=[task.sites[task.used.length]];else if(task.id==='shrine_road')objectives=task.sites.filter((k,i)=>!task.used.includes(i));else if(task.used.length)objectives=[key(task.start.x,task.start.y)];else if(task.id==='warren')objectives=[task.sites[0]];}
      const vowTargets=[];
      if(pursueVows||pursueTreasure){const needed=metric=>Object.entries(campaign.heroQuests).some(([cls,q])=>q.stage==='pledged'&&heroQuestPlan(cls,q).metric===metric&&heroQuestProgress(cls,q)<heroQuestPlan(cls,q).goal);
        if(pursueVows&&needed('events'))vowTargets.push(...Object.keys(explore.events).filter(k=>!explore.eventsDone.has(k)));
        if(pursueVows&&needed('battles'))vowTargets.push(...Object.keys(explore.encounters).filter(k=>!explore.cleared.has(k)));
        if(pursueTreasure||needed('secrets'))for(const k of Object.keys(explore.secrets)){if(explore.foundSecrets.has(k)){vowTargets.push(k);continue;}const [cx,cy]=k.split(',').map(Number),near=[];for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)if(!explore.isWall(x,y)&&explore.tile(x,y)==='.')near.push({k:key(x,y),d:Math.max(Math.abs(x-cx),Math.abs(y-cy))});near.sort((a,b)=>a.d-b.d);vowTargets.push(...near.map(p=>p.k));}}
      if(pursueTreasure)vowTargets.push(...Object.keys(explore.encounters).filter(k=>explore.encounters[k].prize&&!explore.cleared.has(k)),...Object.keys(explore.loot).filter(k=>explore.loot[k].type==='item'||explore.loot[k].type==='choice'));
      const targets=vowTargets.concat(loot.map(([k])=>k),objectives,key(explore.exit.x,explore.exit.y));let path=null;
      for(const target of targets){
        if((pursueVows||pursueTreasure)&&vowTargets.length&&target===key(explore.exit.x,explore.exit.y))continue;
        const start=key(explore.pos.x,explore.pos.y),q=[start],prev=new Map([[start,null]]);
        while(q.length&&!prev.has(target)){
          const k=q.shift(),[x,y]=k.split(',').map(Number);
          for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nk=key(nx,ny);if((pursueVows||pursueTreasure)&&vowTargets.length&&nk===key(explore.exit.x,explore.exit.y)&&target!==nk||prev.has(nk)||explore.isWall(nx,ny)&&(!(pursueVows||pursueTreasure)||!explore.foundSecrets.has(nk))||explore.locked(nx,ny)&&!bag.keys)continue;prev.set(nk,k);q.push(nk);}
        }
        if(!prev.has(target)||target===start)continue;
        let k=target;while(prev.get(k)!==start)k=prev.get(k);const [x,y]=k.split(',').map(Number);path=[x-explore.pos.x,y-explore.pos.y];break;
      }
      if(!path){stop='no route '+JSON.stringify({pos:explore.pos,exit:explore.exit,keys:bag.keys,loot:explore.loot,doors:[...explore.doors],town:document.querySelector('#townScreen').className});break;}
      tryMove(...path);
    }
    cancelTurn();results.push({sample,seed:runSeed,oath,branch,stop,depth:floorDepth(),tasks,rewardChoices,fights,floor:nodeId,moves,turns,phases,level:party.map(h=>h.level),battles:campaign.battles,relic:bag.relic,contracts:campaign.contracts.length,chapters:campaign.completedFloors.length,decisions:Object.keys(campaign.decisions).length,fate:campaign.fate,discovered:[...campaign.discovered],gear:party.map(h=>({cls:h.cls,...h.equip})),heroVows:Object.entries(campaign.heroQuests).map(([cls,q])=>({cls,plan:q.plan,stage:q.stage,progress:heroQuestProgress(cls,q),origin:q.origin,resolvedAt:q.resolvedAt}))});
  }
  return results;
},{sample,pursueVows,pursueTreasure,varyRewards,oaths,branches}));if(onSample)onSample(sample+1,samples);}
const build=await page.evaluate(()=>GAME_BUILD);return {build,results,errors};
}finally{await browser.close();}
}
function validateCampaigns(results,errors,samples){
assert.equal(results.length,samples*12);assert(results.every(r=>['victory','defeat'].includes(r.stop)),'campaign stalled');assert(results.filter(r=>r.stop==='victory').every(r=>r.floor==='sunless_tomb'&&r.relic&&r.tasks===2&&r.decisions===5&&['break','bind','wear'].includes(r.fate)),'incomplete victory');assert.equal(new Set(results.filter(r=>r.stop==='victory').map(r=>r.fate)).size,3,'missing ending coverage');assert(results.filter(r=>r.stop==='victory').every(r=>r.heroVows.length===4&&['Fighter','Mage'].every(cls=>r.heroVows.some(q=>q.cls===cls&&q.stage==='fulfilled'))),'companion vow progression missing');assert.deepEqual(errors,[]);
}
module.exports={runCampaigns,validateCampaigns};
if(require.main===module){runCampaigns().then(({build,results,errors})=>{validateCampaigns(results,errors,3);console.log(JSON.stringify({build,results,errors},null,2));console.log('PASS: 36 campaigns, '+results.filter(r=>r.stop==='victory').length+' victories, '+results.filter(r=>r.stop==='defeat').length+' defeats, no stalls.');}).catch(e=>{console.error(e);process.exitCode=1;});}
