const assert=require('node:assert/strict'),fs=require('node:fs'),name=process.env.GOLD_BOX_BROWSER||'chromium';let browser,page;
(async()=>{
 browser=await require('playwright')[name].launch({executablePath:process.env.CHROMIUM_PATH||(name==='chromium'?'/usr/bin/chromium':undefined),args:name==='chromium'?['--no-sandbox']:[]});
 const errors=[];
 for(const viewport of [{width:375,height:667},{width:956,height:350},{width:820,height:1180},{width:1366,height:768}]){
  page=await browser.newPage({viewport,hasTouch:true});page.on('pageerror',e=>errors.push(String(e)));await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');await page.click('#btnDefault');
  await page.evaluate(()=>{bag.items=['starseer_circlet','copper_ring','oak_staff','fine_sword'];bag.gold=40;openTown();});
  await page.click('#townTradeTab');assert.match(await page.locator('#townStatus').innerText(),/Carried items 4/);
  await page.click('#btnTownParty');await page.getByRole('button',{name:'Select Starseer’s Broken Halo',exact:true}).click();await page.click('#partyHeroTab3');await page.locator('#partyHero3').getByRole('button',{name:/Give selected item/}).click();
  await page.getByRole('button',{name:'Select Rainward Ring',exact:true}).click();await page.click('#partyHeroTab1');await page.locator('#partyHero1').getByRole('button',{name:/Give selected item/}).click();
  await page.click('#btnPartyClose');assert(await page.locator('#townTradePage').isVisible());
  assert.match(await page.locator('#townStatus').innerText(),/Carried items 2/);assert.equal(await page.locator('#sellList .shrow').count(),2);assert.doesNotMatch(await page.locator('#sellList').innerText(),/Halo|Rainward/);
  await page.locator('#sellList .shrow').filter({hasText:'Oak Staff'}).getByRole('button',{name:'Sell'}).click();assert.equal(await page.evaluate(()=>bag.gold),85);assert.equal(await page.locator('#sellList .shrow').filter({hasText:'Oak Staff'}).count(),0);
  // Unequip and Auto Gear also refresh without leaving the waystation.
  await page.click('#btnTownParty');await page.evaluate(()=>unequip(party[1],'accessory'));await page.keyboard.press('Escape');assert.match(await page.locator('#sellList').innerText(),/Rainward/);
  await page.click('#btnTownParty');await page.evaluate(()=>autoAssignGear());await page.keyboard.press('Escape');assert.equal(await page.locator('#sellList .shrow').count(),await page.evaluate(()=>bag.items.length));
  await page.reload();await page.click('#btnContinue');await page.click('#townTradeTab');assert.equal(await page.locator('#sellList .shrow').count(),await page.evaluate(()=>bag.items.length));
  // The accessible name follows current headings across reused event panels.
  await page.evaluate(()=>{showStart();startDefault();openEvent('snare','fixture');});assert(await page.getByRole('dialog',{name:'Sprung Snare',exact:true}).isVisible());
  await page.evaluate(()=>{closeEvent();openEvent('gambler','fixture');});assert(await page.getByRole('dialog',{name:'Gambler’s Bones',exact:true}).isVisible());assert.equal(await page.getByRole('dialog',{name:'Sprung Snare',exact:true}).count(),0);
  // Native disabled controls expose the cap, and keyboard allocation still commits once.
  await page.evaluate(()=>{showStart();startDefault();party[3].abilities.int=20;party[3].pendingLevels=1;openLevelUp([{hero:party[3],by:1}]);});
  const capped=page.locator('.lvab[data-k="int"]');assert(await capped.isDisabled());assert.match(await capped.innerText(),/Maximum 20/i);assert.match(await capped.getAttribute('aria-label'),/Maximum 20/);assert(await page.locator('#btnLevelDone').isDisabled());assert.match(await page.locator('#levelSub').innerText(),/Spend all remaining ability points/);
  const before=await page.evaluate(()=>party[3].abilities.con);await page.locator('.lvab[data-k="con"]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>levelUp.entries[0].picks.con),1);assert(await page.locator('.lvab[data-k="con"]').isDisabled());await page.click('#btnLevelDone');assert.equal(await page.evaluate(()=>party[3].abilities.con),before+1);assert.equal(await page.evaluate(()=>party[3].abilities.int),20);
  // All three endings in the same tab must announce their actual title.
  for(const fate of ['break','bind','wear']){
   await page.evaluate(()=>{showStart();startDefault();nodeId='sunless_tomb';worldPath=['entrance','gallery','catacombs','ossuary','deep_stair','sunless_tomb'];campaign.completedFloors=worldPath.slice(0,-1);explore=new ExploreEngine(buildDungeon(generateLevel(WORLD.sunless_tomb)));explore.pos={...explore.exit};campaign.bossSlain=true;bag.relic=true;render();descendOrWin();});
   await page.getByRole('button',{name:new RegExp('^'+fate,'i')}).click();const title=await page.locator('#bannerText').innerText();assert(await page.getByRole('dialog',{name:title,exact:true}).isVisible());assert.equal(await page.locator('#banner').getAttribute('aria-label'),null);
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.close();console.log('PASS playtest fixes '+viewport.width+'×'+viewport.height);
 }
 assert.deepEqual(errors,[]);await browser.close();
})().catch(async e=>{console.error(e);if(page&&!page.isClosed()){fs.mkdirSync('artifacts/playtest',{recursive:true});await page.screenshot({path:'artifacts/playtest/failure.png'}).catch(()=>{});}if(browser)await browser.close();process.exitCode=1;});
