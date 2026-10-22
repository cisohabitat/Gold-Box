// Optional browser check: requires Playwright and Chromium; see README.
const browserName=process.env.GOLD_BOX_BROWSER||'chromium';const chromium=require('playwright')[browserName];const assert=require('node:assert/strict');
let browser;
(async()=>{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(browserName==='chromium'?'/usr/bin/chromium':undefined),headless:true,args:browserName==='chromium'?['--no-sandbox']:[]});
 const context=await browser.newContext({viewport:{width:440,height:956},deviceScaleFactor:3,isMobile:browserName!=='firefox',hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://fonts.**/*',r=>r.abort());await page.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');
 const scenarios=[...[[320,568],[375,667],[600,350],[744,500],[700,440],[760,350],[768,1024],[820,1180],[1024,768],[1180,820],[1024,1366],[1366,1024],[744,1133],[1133,744],[507,1024],[1280,720],[1366,768],[1920,1080],[1024,600]].map(([width,height])=>({width,height,safe:[0,0,0,0]})),{width:440,height:956,safe:[62,0,34,0]},{width:440,height:780,safe:[0,0,0,0]},{width:440,height:680,safe:[0,0,0,0]},{width:956,height:440,safe:[0,62,21,62]},{width:956,height:350,safe:[0,0,0,0]},{width:390,height:844,safe:[47,0,34,0]}];
 async function bounds(label){
  const result=await page.evaluate(()=>{
   const r=s=>{const a=document.querySelector(s).getBoundingClientRect();return {x:a.x,y:a.y,w:a.width,h:a.height,right:a.right,bottom:a.bottom};};
   return {mode,width:innerWidth,height:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,board:r('#board'),controls:r('.controls'),buttons:[...document.querySelectorAll('.controls button')].filter(el=>el.getClientRects().length).map(el=>({id:el.id,h:el.getBoundingClientRect().height,w:el.getBoundingClientRect().width,bottom:el.getBoundingClientRect().bottom}))};
  });
  console.log(label,JSON.stringify(result));
  assert(result.scrollW<=result.width,label+' horizontal overflow');assert(result.scrollH<=result.height+1,label+' page vertical overflow');
  assert(result.board.h>=160,label+' board too small');assert(result.board.bottom<=result.controls.y+1||result.board.right<=result.controls.x+1,label+' board overlaps controls');
  for(const b of result.buttons){assert(b.h>=43.9&&b.w>=43.9,label+' target smaller than 44px: '+b.id);if(result.width>=600||result.height>=640)assert(b.bottom<=result.height+1,label+' offscreen: '+b.id);else{await page.locator('#'+b.id).scrollIntoViewIfNeeded();assert(await page.locator('#'+b.id).evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight+1),label+' unreachable: '+b.id);}}
  await page.locator('#recentLog').scrollIntoViewIfNeeded();assert(await page.locator('#recentLog').isVisible(),label+' recent log missing');assert((await page.locator('#recentLog .l').count())>0,label+' recent log empty');
 }
 for(const s of scenarios){
  await page.setViewportSize({width:s.width,height:s.height});
  await page.evaluate(s=>{const root=document.documentElement;['top','right','bottom','left'].forEach((key,i)=>root.style.setProperty('--safe-'+key,s.safe[i]+'px'));showStart();},s);
  await page.click('#btnDefault');await bounds('Explore '+s.width+'x'+s.height);
  const beforeRestart=await page.evaluate(()=>JSON.stringify(saveState()));await page.locator('#btnRestart').dblclick();assert.equal(await page.evaluate(()=>mode),'explore','double click left game');assert.equal(await page.locator('#startScreen').isVisible(),false);assert.equal(await page.evaluate(()=>JSON.stringify(saveState())),beforeRestart,'double click changed the run');if(await page.locator('#restartScreen').isVisible())await page.click('#btnKeepPlaying');
  if(await page.locator('#btnDetails').isVisible()){await page.click('#btnDetails');assert.equal(await page.locator('#fieldNotes').isVisible(),true);
  const position=await page.evaluate(()=>JSON.stringify(explore.pos));await page.keyboard.press('ArrowUp');assert.equal(await page.evaluate(()=>JSON.stringify(explore.pos)),position);
  await page.click('#btnDetailsClose');}
  await page.evaluate(()=>{document.querySelector('.board-wrap').scrollTop=0;enterCombat({boss:true,lead:'crypt_lord',pool:['skeleton']},'fixture');cancelTurn();game.order=['p4',...game.order.filter(id=>id!=='p4')];game.turnIndex=0;game._begin();render();});
  await bounds('Combat '+s.width+'x'+s.height);
  await page.click('#btnCast');await bounds('Spells '+s.width+'x'+s.height);

 }
 await page.setViewportSize({width:820,height:1180});await page.evaluate(()=>showStart());await page.click('#btnCreate');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('#btnBack').scrollIntoViewIfNeeded();await page.click('#btnBack');await page.click('#btnDefault');await page.click('#btnParty');await page.locator('#btnPartyClose').scrollIntoViewIfNeeded();await page.click('#btnPartyClose');
 const desktop=await browser.newPage({viewport:{width:1440,height:1000}});desktop.on('pageerror',e=>errors.push(String(e)));await desktop.route('https://fonts.**/*',r=>r.abort());await desktop.goto(process.env.GOLD_BOX_URL||'http://127.0.0.1:8000');await desktop.click('#btnDefault');assert.equal(await desktop.locator('#fieldNotes').isVisible(),true);assert.equal(await desktop.locator('#btnDetails').isVisible(),false);

 // Desktop keyboard combat uses the same controller as clicks and touch.
 await desktop.evaluate(()=>{enterCombat({boss:true,lead:'crypt_lord',pool:['skeleton']},'2,2');cancelTurn();game.order=['p4',...game.order.filter(id=>id!=='p4')];game.turnIndex=0;game._begin();render();});
 await desktop.locator('#board [tabindex="0"]').focus();await desktop.keyboard.press('ArrowRight');
 assert.equal(await desktop.evaluate(()=>gridCursor.x),1);
 await desktop.keyboard.press('ArrowDown');assert.equal(await desktop.evaluate(()=>gridCursor.y),1);
 await desktop.click('#btnMove');
 const target=await desktop.evaluate(()=>{const c=game.current();const k=[...reachCache.keys()].find(k=>{const [x,y]=k.split(',').map(Number);return !game.at(x,y)&&!(x===c.pos.x&&y===c.pos.y);});const [x,y]=k.split(',').map(Number);return {x,y,index:y*game.w+x};});
 await desktop.locator('#board .cell').nth(target.index).focus();await desktop.keyboard.press('Enter');
 assert.deepEqual(await desktop.evaluate(()=>game.current().pos),{x:target.x,y:target.y});
 await desktop.click('#btnCast');await desktop.getByRole('button',{name:/^Fireball \(/}).click();
 const aimIndex=await desktop.evaluate(()=>{const p=game.spellPointTiles(game.current(),selectedSpell)[0];return p.y*game.w+p.x;});
 const uses=await desktop.evaluate(()=>game.current().spells.find(s=>s.id==='fireball').uses);
 await desktop.locator('#board .cell').nth(aimIndex).focus();await desktop.keyboard.press('Enter');
 assert.equal(await desktop.evaluate(()=>validAim()),true);
 assert.equal(await desktop.evaluate(()=>game.current().spells.find(s=>s.id==='fireball').uses),uses);
 await desktop.keyboard.press('Space');assert.equal(await desktop.evaluate(()=>game.current().spells.find(s=>s.id==='fireball').uses),uses-1);
 assert.equal(await desktop.evaluate(()=>board.contains(document.activeElement)),true);
 // Crossing sidebar boundaries closes a drawer without changing run state.
 await desktop.setViewportSize({width:820,height:1180});await desktop.click('#btnDetails');
 const snapshot=await desktop.evaluate(()=>JSON.stringify({party:party.map(h=>h.hp),round:game.round,pos:explore.pos}));
 await desktop.setViewportSize({width:1440,height:1000});await desktop.waitForTimeout(100);
 assert.equal(await desktop.locator('#fieldNotes').evaluate(el=>el.classList.contains('open')),false);
 await desktop.setViewportSize({width:820,height:1180});assert.equal(await desktop.locator('#fieldNotes').isVisible(),false);
 assert.equal(await desktop.evaluate(()=>JSON.stringify({party:party.map(h=>h.hp),round:game.round,pos:explore.pos})),snapshot);
 await desktop.screenshot({path:process.env.GOLD_BOX_SCREENSHOT||'/tmp/gold-box-ipad.png'});
 await desktop.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await desktop.locator('button').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.deepEqual(errors,[]);console.log('PASS: 25 device sizes, 44px controls, safe areas, boss/spells, menus, keyboard grid, rotation/breakpoint state, reduced motion, desktop sidebar; no page errors.');
 await browser.close();
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
