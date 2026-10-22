// Guardian victory delivery, deferred progression and persistent Chronicle on real layouts.
const assert=require('node:assert/strict'),name=process.env.GOLD_BOX_BROWSER||'chromium';let browser;
(async()=>{
 browser=await require('playwright')[name].launch({executablePath:process.env.CHROMIUM_PATH||(name==='chromium'?'/usr/bin/chromium':undefined),args:name==='chromium'?['--no-sandbox']:[]});const errors=[];
 for(const viewport of [{width:320,height:568},{width:956,height:350},{width:820,height:1180},{width:1366,height:768}]){
  const page=await browser.newPage({viewport,hasTouch:true});page.on('pageerror',e=>errors.push(String(e)));await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');await page.click('#btnDefault');
  await page.evaluate(()=>{nodeId='catacombs';worldPath=['entrance','gallery','catacombs'];campaign.completedFloors=['entrance','gallery'];explore=new ExploreEngine(buildDungeon(generateLevel(WORLD.catacombs)));explore.pos={...explore.exit};const [at,desc]=Object.entries(explore.encounters).find(([k,e])=>e.lead==='bell_warden');enterCombat(desc,at);cancelTurn();game.phase='won';game.xpEarned=100;resolveCombat();});
  assert(await page.locator('#levelScreen').isVisible());assert.equal(await page.evaluate(()=>{closeAftermath();return document.querySelector('#aftermathScreen').classList.contains('show');}),true);await page.click('#btnLevelAuto');await page.click('#btnLevelDone');
  assert(await page.locator('#aftermathScreen').isVisible());assert.match(await page.locator('#aftermathStory').innerText(),/bell splits/);assert.equal(await page.locator('#aftermathArt svg').count(),1);
  assert.equal(await page.evaluate(()=>campaign.completedFloors.includes('catacombs')),false);const before=await page.evaluate(()=>JSON.stringify(explore.pos));await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>JSON.stringify(explore.pos)),before);
  for(let n=0;n<5;n++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.querySelector('#aftermathScreen').contains(document.activeElement)));}
  const button=page.locator('#btnAftermathClose');await button.scrollIntoViewIfNeeded();const box=await button.boundingBox();assert(box.height>=44&&box.width>=44&&box.y>=0&&box.y+box.height<=viewport.height+1,JSON.stringify({viewport,box}));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(viewport.width===320)await page.screenshot({path:'/tmp/gold-box-guardian-aftermath.png'});
  await page.keyboard.press('Escape');assert.equal(await page.locator('#aftermathScreen').isVisible(),false);if(await page.locator('#levelScreen').isVisible()){await page.click('#btnLevelAuto');await page.click('#btnLevelDone');}assert(await page.locator('#townScreen').isVisible());
  await page.reload();await page.click('#btnContinue');assert(await page.locator('#townScreen').isVisible());await page.evaluate(()=>{chooseCouncil('choir');enterDungeon('shrine_road');});await page.click('#btnJournal');assert.match(await page.locator('#journalStory').textContent(),/bell splits/);await page.keyboard.press('Escape');await page.close();
 }
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: guardian portrait/aftermath, level priority, blocked movement, focus trap, Escape, deferred stairs, town Continue and persistent Chronicle at four device sizes.');
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
