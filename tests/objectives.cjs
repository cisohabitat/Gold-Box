const assert=require('node:assert/strict'),name=process.env.GOLD_BOX_BROWSER||'chromium';let browser;
async function visit(page,target){await page.evaluate(target=>{
 const start=key(explore.pos.x,explore.pos.y),queue=[start],previous=new Map([[start,null]]);
 for(let i=0;i<queue.length&&!previous.has(target);i++){const [x,y]=queue[i].split(',').map(Number);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(explore.task?.id==='shrine_road'&&!explore.task.done&&k!==target&&explore.task.sites.includes(k)&&!explore.task.used.includes(explore.task.sites.indexOf(k)))continue;if(!previous.has(k)&&!explore.isWall(nx,ny)&&!explore.locked(nx,ny)){previous.set(k,queue[i]);queue.push(k);}}}
 if(!previous.has(target))throw Error('Objective inaccessible');const path=[];for(let k=target;k!==start;k=previous.get(k))path.unshift(k);
 for(const k of path){const [x,y]=k.split(',').map(Number);tryMove(x-explore.pos.x,y-explore.pos.y);cancelTurn();if(mode==='combat'){game.phase='won';game.xpEarned=0;resolveCombat();}if(curEvent){const n=EVENTS[curEvent.id].options.findIndex(o=>o.fallback);resolveEventOption(n<0?0:n);closeEvent();}if(levelUp)autoAssignLevelUp();if(document.querySelector('#aftermathScreen').classList.contains('show'))closeAftermath();}
 },target);}
(async()=>{browser=await require('playwright')[name].launch({executablePath:process.env.CHROMIUM_PATH||(name==='chromium'?'/usr/bin/chromium':undefined),args:name==='chromium'?['--no-sandbox']:[]});const errors=[];
 for(const viewport of [{width:320,height:568},{width:956,height:350},{width:820,height:1180},{width:1440,height:900}]){
  const page=await browser.newPage({viewport,hasTouch:true});page.on('pageerror',e=>errors.push(String(e)));await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');await page.click('#btnDefault');
  for(const id of ['warren','gallery','ossuary','shrine_road']){
   await page.evaluate(id=>{newGame();nodeId=id;worldPath=['entrance',id];explore=new ExploreEngine(buildDungeon(generateLevel(WORLD[id])));render();},id);
   assert.equal(await page.evaluate(()=>explore.task.id),id);assert(await page.locator('[data-task-site]').count()>0);await page.evaluate(()=>descendOrWin());assert.equal(await page.locator('#townScreen').isVisible(),false);assert.equal(await page.evaluate(()=>campaign.completedFloors.length),0);
   await page.click('#btnJournal');assert.match(await page.locator('#journalTask').textContent(),/Escort the scouts|register of names|legion’s standard|small gods/);await page.keyboard.press('Escape');
   if(id==='gallery'){
    const sites=await page.evaluate(()=>explore.task.sites);await visit(page,sites[0]);assert.equal(await page.evaluate(()=>explore.task.used.join()),'0');await page.reload();await page.click('#btnContinue');assert.equal(await page.evaluate(()=>explore.task.used.join()),'0');for(const k of sites.slice(1))await visit(page,k);
   }else if(id==='shrine_road'){
    const sites=await page.evaluate(()=>explore.task.sites);await visit(page,sites[2]);assert.equal(await page.evaluate(()=>explore.task.done),false);await visit(page,sites[0]);assert.equal(await page.evaluate(()=>explore.task.used.join()),'2,0');
   }else{
    const target=await page.evaluate(()=>explore.task.id==='warren'?explore.task.sites[0]:Object.entries(explore.loot).find(([k,v])=>v.item==='dawnblade')[0]);await visit(page,target);assert.equal(await page.evaluate(()=>explore.task.done),false);await visit(page,await page.evaluate(()=>key(explore.task.start.x,explore.task.start.y)));if(id==='ossuary')assert.equal(await page.evaluate(()=>bag.items.includes('dawnblade')),true);
   }
   assert.equal(await page.evaluate(()=>explore.task.done),true);assert.equal(await page.locator('[data-task-site]').count(),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert((await page.locator('#btnFwd').boundingBox()).height>=44);
   await page.evaluate(()=>{const code=encodeSave(saveState());if(!applySave(decodeSave(code)))throw Error('Completed task import rejected');});assert.equal(await page.evaluate(()=>explore.task.done),true);
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: actual map movement for scout escort, ordered names with Continue, retained Dawnblade, choice of two shrines, exit gates, progress/Chronicle/beacons, saved completion, four device layouts and no page errors.');
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
