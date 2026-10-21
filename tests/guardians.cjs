const assert=require('node:assert/strict'),name=process.env.GOLD_BOX_BROWSER||'chromium';let browser;
(async()=>{
 browser=await require('playwright')[name].launch({executablePath:process.env.CHROMIUM_PATH||(name==='chromium'?'/usr/bin/chromium':undefined),args:name==='chromium'?['--no-sandbox']:[]});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');await page.click('#btnDefault');
 for(const viewport of [{width:440,height:780},{width:956,height:350},{width:820,height:1180},{width:1366,height:768}]){
  await page.setViewportSize(viewport);
  await page.evaluate(()=>{newGame();$('#startScreen').classList.remove('show');enterCombat({boss:true,lead:'bell_warden',pool:['skeleton']},'2,2');cancelTurn();autoFight=false;const w=game.living('enemy').find(c=>c.cls==='BellWarden');game._castPoint(w,SPELLS.war_chant,w.pos);render();});
  assert.match(await page.locator('#bossName').innerText(),/TOLL NEXT TURN/);assert.equal(await page.locator('.breath-zone').count(),0);assert.equal(await page.locator('.channeling').count(),1);
  await page.evaluate(()=>openTactics());assert.match(await page.locator('#tacticsContent').innerText(),/Imminent threats/);assert.match(await page.locator('#tacticsContent').innerText(),/weapon hit/i);await page.keyboard.press('Escape');
  await page.evaluate(()=>{cancelTurn();const w=game.living('enemy').find(c=>c.cls==='BellWarden'),h=party[0];game.combatants.forEach((c,i)=>c.pos={x:i,y:0});w.pos={x:4,y:4};h.pos={x:3,y:4};game.order=[h.id,...game.combatants.filter(c=>c!==h).map(c=>c.id)];game.turnIndex=0;game._begin();mover='attack';Rules.attack=()=>({hit:true,crit:false});Rules.damage=()=>1;render();});
  await page.locator('[role="gridcell"][aria-label^="Column 5, row 5."]').click();assert.equal(await page.locator('.channeling').count(),0);assert.doesNotMatch(await page.locator('#bossName').innerText(),/TOLL NEXT TURN/);
  await page.evaluate(()=>{enterCombat({boss:true,lead:'ash_cantor',pool:['skeleton']},'2,2');cancelTurn();const w=game.living('enemy').find(c=>c.cls==='AshCantor');game._castPoint(w,SPELLS.cinder,{x:3,y:3});render();});
  assert.equal(await page.locator('.breath-zone').count(),9);assert.match(await page.locator('.breath-zone').first().getAttribute('aria-label'),/Cinderburst.*next active turn/);assert.match(await page.locator('#bossName').innerText(),/HYMN NEXT TURN/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.evaluate(()=>openTactics());assert.match(await page.locator('#tacticsContent').innerText(),/Cinderburst/);await page.keyboard.press('Escape');await page.evaluate(()=>cancelTurn());
  await page.evaluate(()=>{const w=game.living('enemy').find(c=>c.cls==='AshCantor');party.forEach((h,i)=>h.pos={x:8,y:i});window.preHymn=party.map(h=>h.hp).join();w.acted.action=false;game.actAuto(w);render();});assert.equal(await page.locator('.breath-zone').count(),0);assert(await page.evaluate(()=>party.map(h=>h.hp).join()===window.preHymn));
 }
 assert.deepEqual(errors,[]);console.log('PASS: four device classes, toll/hymn telegraphs, accessible threat details, real manual weapon interruption, fixed blast escape and once-only release.');await browser.close();
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
