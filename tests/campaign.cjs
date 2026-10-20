const browserName=process.env.GOLD_BOX_BROWSER||'chromium';const chromium=require('playwright')[browserName];const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(browserName==='chromium'?'/usr/bin/chromium':undefined),headless:true,args:browserName==='chromium'?['--no-sandbox']:[]});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');
const results=await page.evaluate(()=>{
  const results=[];
  // Drive the real controller and engines synchronously; rendering stays active.
  for(const sample of [0,1,2])for(const oath of ['wanderer','delver','ironbound'])for(const branch of [0,1,2,3]){
    let seed=2718+branch+sample*10000;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    showStart();document.querySelector('#oathChoice').value=oath;startDefault();
    let moves=0,turns=0,phases=0,stop='limit';
    while(moves++<1800){
      cancelTurn();
      if(mode==='combat'){
        let fightTurns=0;
        while(game.phase==='playing'&&fightTurns++<800){const c=game.current();if(!game.isIncapacitated(c))game.actAuto(c);if(game.phase==='playing')game.endTurn();}
        turns+=fightTurns;phases+=game.combatants.filter(c=>c.awakened).length;
        if(game.phase==='lost'){stop='defeat';break;}
        if(game.phase==='playing'){stop='combat stalled';break;}
        resolveCombat();continue;
      }
      if(document.querySelector('#banner').classList.contains('show')){stop='victory';break;}
      if(levelUp){autoAssignLevelUp();continue;}
      if(curEvent){const options=EVENTS[curEvent.id].options;let pick=options.findIndex(o=>o.fallback),best=-Infinity;options.forEach((o,i)=>{if(!o.fallback){const score=bestForStat(o.stat).mod-o.dc;if(score>best){best=score;pick=i;}}});resolveEventOption(pick);closeEvent();continue;}
      if(document.querySelector('#townScreen').classList.contains('show')){
        const offers=[...document.querySelectorAll('.boon-card')];if(offers.length)offers[0].click();townRest();autoAssignGear();document.querySelector('#partyScreen').classList.remove('show');
        const next=WORLD[nodeId].next;enterDungeon(next.length===1?next[0]:next[(floorDepth()===1?branch>>1:branch&1)]);continue;
      }
      autoAssignGear();document.querySelector('#partyScreen').classList.remove('show');
      if(party.reduce((n,h)=>n+h.hp,0)<party.reduce((n,h)=>n+h.maxHp,0)*.7&&bag.rations>0)makeCamp();
      const loot=Object.entries(explore.loot).sort((a,b)=>(a[1].type==='key'?-1:0)-(b[1].type==='key'?-1:0));
      const targets=loot.map(([k])=>k).concat(key(explore.exit.x,explore.exit.y));let path=null;
      for(const target of targets){
        const start=key(explore.pos.x,explore.pos.y),q=[start],prev=new Map([[start,null]]);
        while(q.length&&!prev.has(target)){
          const k=q.shift(),[x,y]=k.split(',').map(Number);
          for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nk=key(nx,ny);if(prev.has(nk)||explore.isWall(nx,ny)||explore.locked(nx,ny)&&!bag.keys)continue;prev.set(nk,k);q.push(nk);}
        }
        if(!prev.has(target)||target===start)continue;
        let k=target;while(prev.get(k)!==start)k=prev.get(k);const [x,y]=k.split(',').map(Number);path=[x-explore.pos.x,y-explore.pos.y];break;
      }
      if(!path){stop='no route '+JSON.stringify({pos:explore.pos,exit:explore.exit,keys:bag.keys,loot:explore.loot,doors:[...explore.doors],town:document.querySelector('#townScreen').className});break;}
      tryMove(...path);
    }
    cancelTurn();results.push({sample,oath,branch,stop,floor:nodeId,moves,turns,phases,level:party.map(h=>h.level),battles:campaign.battles,relic:bag.relic,contracts:campaign.contracts.length,chapters:campaign.completedFloors.length});
  }
  return results;
});
console.log(JSON.stringify(results,null,2));console.log('ERRORS',errors);await browser.close();assert.equal(results.length,36);assert(results.every(r=>['victory','defeat'].includes(r.stop)),'campaign stalled');assert.deepEqual(errors,[]);console.log('PASS: 36 campaigns, '+results.filter(r=>r.stop==='victory').length+' victories, '+results.filter(r=>r.stop==='defeat').length+' defeats, no stalls.');
})().catch(e=>{console.error(e);process.exitCode=1});
