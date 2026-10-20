// Presentation preferences, optional audio, and paused combat must work together.
const assert=require('node:assert/strict');const name=process.env.GOLD_BOX_BROWSER||'chromium';let browser;
(async()=>{
 browser=await require('playwright')[name].launch({executablePath:process.env.CHROMIUM_PATH||(name==='chromium'?'/usr/bin/chromium':undefined),args:name==='chromium'?['--no-sandbox']:[]});
 const page=await browser.newPage({viewport:{width:440,height:780}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');
 await page.click('#btnTitleSettings');assert.equal(await page.locator('#prefSound').isChecked(),false);assert.equal(await page.evaluate(()=>soundState.context),null);
 await page.check('#prefContrast');await page.uncheck('#prefEffects');await page.selectOption('#prefPace','quick');await page.check('#prefSound');await page.check('#prefMusic');
 await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>preferences.sound),true);assert.equal(await page.evaluate(()=>soundState.ambient.length),0); // title is silent
 for(let i=0;i<14;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.querySelector('#settingsScreen').contains(document.activeElement)));}
 await page.keyboard.press('Escape');await page.reload();assert.equal(await page.evaluate(()=>preferences.contrast),true);assert.equal(await page.evaluate(()=>preferences.pace),'quick');assert.equal(await page.evaluate(()=>preferences.effects),false);
 await page.click('#btnDefault');await page.click('#btnDetails');await page.click('#btnGameSettings');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'btnDetails');
 await page.evaluate(()=>{enterCombat({pool:['skeleton']},'2,2');cancelTurn();game.order=['e0',...game.order.filter(id=>id!=='e0')];game.turnIndex=0;game._begin();beginTurnFlow();openSettings();});
 const before=await page.evaluate(()=>JSON.stringify(game.combatants.map(c=>[c.id,c.hp,c.pos,c.acted])));await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>JSON.stringify(game.combatants.map(c=>[c.id,c.hp,c.pos,c.acted]))),before);
 await page.uncheck('#prefSound');await page.keyboard.press('Escape');await page.evaluate(()=>cancelTurn());assert.equal(await page.evaluate(()=>soundState.ambient.length),0);
 // HP deltas are derived from actual state and do not change rolls or actions.
 await page.evaluate(()=>{const unit=game.combatants[0];unit.hp=Math.max(1,unit.hp-2);render();});assert(await page.locator('.combat-float').count()>0);
 await page.evaluate(()=>inspectTile(game.combatants[0].pos.x,game.combatants[0].pos.y));assert.match(await page.locator('#tileInspect').textContent(),/HP.*AC/);
 assert.equal(await page.locator('.combat-float').first().evaluate(e=>getComputedStyle(e).display),'none');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--dim').trim()),'#d8caa8');
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.combat-float').first().evaluate(e=>getComputedStyle(e).display),'none');
 await page.evaluate(()=>{showStart();Storage.prototype.setItem=()=>{throw Error('blocked');};});await page.click('#btnTitleSettings');await page.check('#prefEffects');assert.match(await page.locator('#preferenceStatus').textContent(),/session|blocked/i);
 await page.keyboard.press('Escape');await page.evaluate(()=>{if(soundState.context)soundState.context.close();soundState.context=null;soundState.master=null;soundState.ambient=[];soundState.unavailable=false;Object.defineProperty(window,'AudioContext',{configurable:true,value:undefined});Object.defineProperty(window,'webkitAudioContext',{configurable:true,value:undefined});});await page.click('#btnTitleSettings');await page.uncheck('#prefSound');await page.check('#prefSound');await page.waitForTimeout(50);assert.match(await page.locator('#audioStatus').textContent(),/unavailable/);
 assert.deepEqual(errors,[]);console.log('PASS: persistent settings, opt-in audio, silent title, modal focus, paused combat, HP feedback, inspection, reduced motion, and blocked preference storage.');await browser.close();
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
