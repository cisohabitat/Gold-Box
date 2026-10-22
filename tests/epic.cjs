// Authored campaign UI, one-time decisions, reload at the ending, and each crown fate.
const browserName=process.env.GOLD_BOX_BROWSER||'chromium';const launcher=require('playwright')[browserName];const assert=require('node:assert/strict');let browser;
(async()=>{
 browser=await launcher.launch({executablePath:process.env.CHROMIUM_PATH||(browserName==='chromium'?'/usr/bin/chromium':undefined),headless:true,args:browserName==='chromium'?['--no-sandbox']:[]});
 const errors=[];
 for(const [width,height,touch] of [[440,780,true],[820,1180,true],[1366,768,false]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch&&browserName!=='firefox'}),page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');
  assert.match(await page.locator('.intro-copy').textContent(),/Last Dawn/);await page.click('#btnDefault');await page.evaluate(()=>{if(explore.task){explore.task.used=[0];explore.task.done=true;}descendOrWin();});await page.click('#btnLevelAuto');await page.click('#btnLevelDone');
  assert.equal(await page.locator('#councilPlans button').count(),2);assert.equal(await page.locator('#forkBox button').first().isDisabled(),true);assert.match(await page.locator('#councilStory').textContent(),/Ilyra.*Eren/);
  if(width===440)await page.screenshot({path:'/tmp/gold-box-epic-council.png'});
  const rations=await page.evaluate(()=>bag.rations);const first=page.locator('#councilPlans button').first();await first.scrollIntoViewIfNeeded();
  if(touch)await first.tap();else{await first.focus();await page.keyboard.press('Enter');}
  assert.equal(await page.evaluate(()=>bag.rations),rations+2);assert.equal(await page.locator('#councilPlans button').count(),0);assert.equal(await page.locator('#forkBox button').first().isDisabled(),false);
  assert.match(await page.locator('#councilResult').textContent(),/lanterns/);await page.reload();await page.click('#btnContinue');assert.equal(await page.evaluate(()=>campaign.decisions.entrance),'lanterns');assert.equal(await page.evaluate(()=>bag.rations),rations+2);
  await page.locator('#forkBox button').first().click();assert.equal(await page.evaluate(()=>nodeId),'warren');await page.click('#btnJournal');assert.match(await page.locator('#journalStory').textContent(),/lantern road.*Ilyra/s);await page.locator('#btnJournalClose').scrollIntoViewIfNeeded();await page.click('#btnJournalClose');
  await page.evaluate(()=>{if(explore.task){explore.task.used=[0];explore.task.done=true;}descendOrWin();});if(await page.locator('#levelScreen').isVisible()){await page.click('#btnLevelAuto');await page.click('#btnLevelDone');}assert.match(await page.locator('#councilStory').textContent(),/Nessa/);await page.locator('#councilPlans button').first().click();assert.equal(await page.evaluate(()=>campaign.decisions.warren),'flood');
  // Prepare an actual final-floor save; only the final gate is fast-forwarded.
  const finalCode=await page.evaluate(()=>{nodeId='sunless_tomb';worldPath=['entrance','warren','catacombs','ossuary','deep_stair','sunless_tomb'];explore=new ExploreEngine(buildDungeon(generateLevel(WORLD.sunless_tomb)));campaign.bossSlain=true;bag.relic=true;explore.pos={...explore.exit};document.querySelector('#townScreen').classList.remove('show');render();descendOrWin();return encodeSave(saveState());});
  assert.equal(await page.locator('#fateScreen').isVisible(),true);if(width===440)await page.screenshot({path:'/tmp/gold-box-epic-fate.png'});await page.reload();await page.click('#btnContinue');assert.equal(await page.locator('#fateScreen').isVisible(),true);
  for(let n=0;n<7;n++){await page.keyboard.press(n%2?'Shift+Tab':'Tab');assert(await page.evaluate(()=>document.querySelector('#fateScreen').contains(document.activeElement)));}await page.keyboard.press('Escape');assert.equal(await page.locator('#fateScreen').isVisible(),true);
  const endings=[];
  for(const [i,id] of ['break','bind','wear'].entries()){
   if(i){await page.reload();await page.click('#btnLoadToggle');await page.locator('#loadCode').fill(finalCode);await page.click('#btnLoad');}
   assert.equal(await page.locator('#fateChoices button').count(),3);if(id!=='break')await page.selectOption('#crownBearer','p4');const choice=page.locator('#fateChoices button').nth(i);await choice.scrollIntoViewIfNeeded();const bounds=await choice.boundingBox();assert(bounds.width>=44&&bounds.height>=44);
   if(touch)await choice.tap();else{await choice.focus();await page.keyboard.press('Enter');}
   assert.equal(await page.evaluate(()=>campaign.fate),id);assert.equal(await page.locator('#banner').isVisible(),true);assert.match(await page.locator('#endingStory').textContent(),/Ilyra/);assert.match(await page.locator('#endingStory').textContent(),/Nessa/);if(id!=='break'){assert.equal(await page.evaluate(()=>campaign.crownBearer),'p4');assert.match(await page.locator('#endingStory').textContent(),/Aldric/);}endings.push(await page.locator('#endingStory').textContent());
   await page.locator('#bannerBtn').scrollIntoViewIfNeeded();assert((await page.locator('#bannerBtn').boundingBox()).y<height);
  }
  assert.equal(new Set(endings).size,3);await context.close();
 }
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: touch and keyboard councils, blocked departure, once-only saved rewards, story Chronicle, final-choice reload, all 3 epilogues at phone/tablet/desktop sizes; no page errors.');
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
