// Browser regressions for modal isolation, live feedback, manual combat, and clipboard recovery.
const browserName=process.env.GOLD_BOX_BROWSER||'chromium';const chromium=require('playwright')[browserName];const assert=require('node:assert/strict');let browser;
(async()=>{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(browserName==='chromium'?'/usr/bin/chromium':undefined),headless:true,args:browserName==='chromium'?['--no-sandbox']:[]});
 const page=await browser.newPage({viewport:{width:440,height:780},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');
 const buildId=await page.evaluate(()=>GAME_BUILD);assert.equal(await page.locator('#startScreen [data-build]').textContent(),'Build '+buildId);
 await page.click('#btnDefault');assert.equal(await page.locator('.header-meta [data-build]').textContent(),'Build '+buildId);assert.equal(await page.locator('#recentLog .l').count(),2);
 // A double click never exits the run; default focus and Escape both keep playing.
 const runBeforeRestart=await page.evaluate(()=>JSON.stringify(saveState()));await page.locator('#btnRestart').dblclick();assert.equal(await page.locator('#restartScreen').isVisible(),true);assert.equal(await page.evaluate(()=>mode),'explore');assert.equal(await page.evaluate(()=>document.activeElement.id),'btnKeepPlaying');
 await page.keyboard.press('Enter');assert.equal(await page.locator('#restartScreen').isVisible(),false);assert.equal(await page.evaluate(()=>JSON.stringify(saveState())),runBeforeRestart);
 await page.locator('#btnRestart').tap();await page.keyboard.press('Escape');assert.equal(await page.locator('#restartScreen').isVisible(),false);
 await page.click('#btnRestart');await page.click('#btnConfirmRestart');assert.equal(await page.locator('#startScreen').isVisible(),true);assert.equal(await page.locator('#btnContinue').isVisible(),true);await page.click('#btnContinue');assert.equal(await page.evaluate(()=>JSON.stringify(saveState())),runBeforeRestart);
 // Creation and inventory custom controls also work from a keyboard.
 await page.evaluate(()=>showStart());await page.click('#btnCreate');
 for(let hi=0;hi<4;hi++)for(let pi=0;pi<6;pi++){
  await page.locator('.chip[data-hi="'+hi+'"][data-pi="'+pi+'"]').focus();await page.keyboard.press('Enter');
  const stat=['str','dex','con','int','wis','cha'][pi];await page.locator('.slot[data-hi="'+hi+'"][data-slot="'+stat+'"]').focus();await page.keyboard.press('Space');
 }
 assert.equal(await page.locator('#btnBegin').isDisabled(),false);await page.locator('#btnBegin').focus();await page.keyboard.press('Enter');
 await page.evaluate(()=>bag.items.push('fine_sword'));await page.click('#btnParty');await page.getByRole('button',{name:'Select Fine Sword'}).focus();await page.keyboard.press('Enter');
 await page.getByRole('button',{name:/Give selected item/}).first().focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>party[0].equip.weapon),'fine_sword');await page.keyboard.press('Escape');
 // Nested menus keep focus inside the top sheet and restore their opener.
 await page.click('#btnParty');for(let i=0;i<12;i++){await page.keyboard.press(i%2?'Shift+Tab':'Tab');assert(await page.evaluate(()=>document.querySelector('#partyScreen').contains(document.activeElement)));}
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'btnParty');
 await page.click('#btnDetails');for(let i=0;i<5;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.querySelector('#fieldNotes').contains(document.activeElement)));}await page.keyboard.press('Escape');
 // Clipboard success, asynchronous denial with successful fallback, and total failure.
 await page.click('#btnSave');
 for(const kind of ['success','fallback','failure']){
  await page.evaluate(kind=>{window.fallbackCalls=0;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>kind==='success'?Promise.resolve():Promise.reject(new DOMException('Denied','NotAllowedError'))}});document.execCommand=()=>{window.fallbackCalls++;return kind==='fallback';};},kind);
  await page.click('#btnCopySave');await page.waitForTimeout(30);
  assert.equal(await page.locator('#btnCopySave').isDisabled(),false);
  assert.equal(await page.locator('#btnCopySave').textContent(),kind==='failure'?'Copy Code':'Copied');
  assert.equal(await page.evaluate(()=>window.fallbackCalls),kind==='success'?0:1);
  if(kind==='failure')assert.match(await page.locator('#saveMsg').textContent(),/blocked.*Select the code/);
 }
 await page.keyboard.press('Escape');
 // A storage-blocked browser can still export, reload, and import a portable code.
 const code=await page.evaluate(()=>{const code=encodeSave(saveState());localStorage.removeItem('goldbox_save_v1');return code;});
 await page.reload();await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked');};Storage.prototype.getItem=()=>null;});
 await page.click('#btnLoadToggle');await page.locator('#loadCode').fill(code);await page.click('#btnLoad');assert.equal(await page.evaluate(()=>mode),'explore');await page.click('#btnSave');assert.match(await page.locator('#saveMsg').textContent(),/Storage is blocked/);await page.keyboard.press('Escape');
 // Manually win a controlled fight through keyboard actions; fixed attack rolls isolate UI flow from dice.
 await page.evaluate(()=>{enterCombat({pool:['goblin'],budgetMul:.01},'2,2');cancelTurn();game.order=['p1',...game.order.filter(id=>id!=='p1')];game.turnIndex=0;game._begin();party[0].pos={x:1,y:1};const foe=game.living('enemy')[0];foe.pos={x:2,y:1};foe.hp=1;Rules.attack=()=>({hit:true,crit:false});render();});
 assert.match(await page.locator('#turnStatus').textContent(),/Move ready.*Action ready/);
 await page.click('#btnJournal');const actor=await page.evaluate(()=>game.current().id);
 for(let i=0;i<16;i++){await page.keyboard.press(i%2?'Shift+Tab':'Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'btnTacticsClose');}
 await page.evaluate(()=>{endTurn();guard();waitTurn();toggleAuto();document.querySelector('#btnEnd').click();});
 assert.equal(await page.evaluate(()=>game.current().id),actor);assert.equal(await page.evaluate(()=>game.current().acted.action),false);
 await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>game.current().id),actor);await page.keyboard.press('Escape');
 await page.click('#btnAttack');await page.locator('#board .cell').nth(12).focus();assert.match(await page.locator('#board .cell').nth(12).getAttribute('aria-label'),/% hit/);await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>mode),'explore');assert.match(await page.locator('#recentLog').innerText(),/victory|experience|Gold|wins|gains|find|battle/i);
 // Restart also suspends an enemy callback and returns to the same battle on cancel.
 await page.evaluate(()=>{enterCombat({pool:['skeleton']},'2,2');cancelTurn();game.order=['e0',...game.order.filter(id=>id!=='e0')];game.turnIndex=0;game._begin();beginTurnFlow();requestRestart();});
 const pausedActor=await page.evaluate(()=>game.current().id);await page.waitForTimeout(650);assert.equal(await page.evaluate(()=>game.current().id),pausedActor);await page.click('#btnKeepPlaying');await page.evaluate(()=>cancelTurn());assert.equal(await page.evaluate(()=>mode),'combat');
 // Mobile log is visible immediately and on desktop, with no need to open notes.
 assert(await page.locator('#recentLog').isVisible());await page.setViewportSize({width:1440,height:1000});assert(await page.locator('#recentLog').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS: protected restart/double tap/cancel/Continue, visible build, modal focus and guarded actions, clipboard success/fallback/failure, blocked-storage portable recovery, manual keyboard victory, hit odds, visible live log; no page errors.');await browser.close();
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
