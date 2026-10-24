const assert=require('node:assert/strict'),name=process.env.GOLD_BOX_BROWSER||'chromium';let browser;
(async()=>{browser=await require('playwright')[name].launch({executablePath:process.env.CHROMIUM_PATH||(name==='chromium'?'/usr/bin/chromium':undefined),args:name==='chromium'?['--no-sandbox']:[]});const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');await page.click('#btnDefault');
 await page.evaluate(()=>{cancelTurn();game=new CombatEngine(party,['bell_warden','ash_cantor','crypt_lord'].map((id,i)=>spawnMonster(id,i,false)),10,10,explore.theme);mode='combat';render();});
 for(const size of [{width:440,height:780},{width:956,height:350},{width:1024,height:1366},{width:1440,height:1000}]){await page.setViewportSize(size);assert.equal(await page.locator('.token.guardian').count(),3);assert.equal(await page.locator('.token.party').count(),4);
  for(const token of await page.locator('.token').all()){const svg=token.locator('svg');assert.equal(await svg.getAttribute('viewBox'),'0 0 24 24');assert.equal(await svg.getAttribute('aria-hidden'),'true');const a=await token.boundingBox(),b=await svg.boundingBox();assert(b.width<=a.width&&b.height<=a.height);assert.equal(await svg.evaluate(e=>getComputedStyle(e).pointerEvents),'none');}
  assert.equal(await page.locator('.token.party').first().evaluate(e=>getComputedStyle(e).borderRadius),'50%');assert.notEqual(await page.locator('.token.enemy').first().evaluate(e=>getComputedStyle(e).borderRadius),'50%');
 }
 await page.evaluate(()=>{game.living('enemy')[0].awakened=true;render();});assert.equal(await page.locator('.guardian.awakened').count(),1);assert.equal(await page.locator('#roster .roster-portrait svg').count(),7);
 await page.click('#btnJournal');assert.equal(await page.locator('.tactics-portrait svg').count(),3);assert.equal(await page.locator('.tactics-enemy strong').count(),3);await page.keyboard.press('Escape');
 // Render every identity on the real board, including all six specialists and the dragon.
 const ids=await page.evaluate(()=>Object.keys(BESTIARY));
 for(const size of [{width:440,height:780},{width:956,height:350},{width:820,height:1180},{width:1366,height:768}]){
  await page.setViewportSize(size);
  for(let at=0;at<ids.length;at+=6){
   const group=ids.slice(at,at+6);
   await page.evaluate(group=>{cancelTurn();game=new CombatEngine(party,group.map((id,i)=>spawnMonster(id,i,false)),10,10,explore.theme);mode='combat';render();},group);
   assert.equal(await page.locator('.token.enemy').count(),group.length);
   assert.equal(await page.locator('.token .hpbar i').count(),group.length+4);
   assert(await page.evaluate(()=>game.combatants.every(u=>{const holder=document.createElement('span');holder.innerHTML=combatWidth(u)!==combatHeight(u)?SPRITES[u.sprite].replace('<svg ','<svg preserveAspectRatio="none" '):SPRITES[u.sprite];return (combatSize(u)>1?document.querySelector('#board>.token[data-unit-id="'+u.id+'"] svg'):cellEls[u.pos.y*game.w+u.pos.x].querySelector('.token svg')).isEqualNode(holder.firstChild);})),group.join(','));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  // Effects Off and contrast must retain all artwork and the visible HP rail.
  await page.evaluate(()=>{preferences.effects=false;preferences.contrast=true;applyPreferences();render();});
  for(const rail of await page.locator('.token .hpbar').all())assert((await rail.boundingBox()).height>0);
  await page.click('#btnJournal');assert.equal(await page.locator('.tactics-portrait svg').count(),ids.length%6||6);await page.keyboard.press('Escape');
  if(process.env.SPRITE_CAPTURE_DIR)await page.waitForTimeout(1500);
  if(process.env.SPRITE_CAPTURE_DIR)await page.screenshot({path:require('path').join(process.env.SPRITE_CAPTURE_DIR,'combat-'+size.width+'.png')});
  await page.evaluate(()=>openCodex('bestiary'));assert.equal(await page.locator('.atlas-art svg').count(),ids.length);
  for(const svg of await page.locator('.atlas-art svg').all())assert.equal(await svg.getAttribute('viewBox'),'0 0 24 24');
  if(process.env.SPRITE_CAPTURE_DIR)await page.screenshot({path:require('path').join(process.env.SPRITE_CAPTURE_DIR,'bestiary-'+size.width+'.png')});
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{preferences.effects=true;preferences.contrast=false;applyPreferences();});
 }
 assert.deepEqual(errors,[]);console.log('PASS: all 21 monster identities, four heroes, unique guardian art, bounded SVG, HP rails, awakened frame, named roster/Tactics/Bestiary portraits, Effects Off and high contrast at four device sizes.');await browser.close();})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
