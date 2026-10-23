const {test}=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');

test('PLAYTEST-01: stale sale callbacks cannot sell a different item after a satchel change',()=>{
 const {run}=harness();run("bag.items=['starseer_circlet','copper_ring','oak_staff','fine_sword'];bag.gold=40;const displayed=bag.items.slice();pickItem=0;applyItem(party[3]);pickItem=0;applyItem(party[1]);const before=JSON.stringify(bag);sellItem(2,displayed[2]);sellItem(0,displayed[0]);");
 assert.equal(run('JSON.stringify(bag)'),run('before'));
 run("sellItem(bag.items.indexOf('oak_staff'),'oak_staff');");assert.equal(run('bag.gold'),85);assert(!run("bag.items.includes('oak_staff')"));
});

// Independent cardinal BFS uses rendered floor tiles, not generation helpers.
function path(d,start,target,locked=false){const q=[start],prev=new Map([[start,null]]);for(let i=0;i<q.length;i++){const [x,y]=q[i].split(',').map(Number);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,k=a+','+b;if(d.tiles[b]?.[a]!=='.'||prev.has(k)||locked&&d.doors.has(k))continue;prev.set(k,q[i]);q.push(k);}}if(!prev.has(target))return null;const out=[];for(let k=target;k!==start;k=prev.get(k))out.unshift(k);return out;}
for(const seed of [8,291,20261023,1947])test('PLAYTEST-02: key, king, crown and final stairs connect across 256 maps, seed '+seed,()=>{
 const {run}=harness({seed});for(let i=0;i<256;i++){
  const d=run('buildDungeon(generateLevel(WORLD.sunless_tomb))'),start=d.start.x+','+d.start.y,exit=d.exit.x+','+d.exit.y,keyTile=Object.keys(d.loot).find(k=>d.loot[k].type==='key'),crown=Object.keys(d.loot).find(k=>d.loot[k].type==='relic'),king=Object.keys(d.encounters).find(k=>d.encounters[k].lead==='crypt_lord');
  if(d.doors.size)assert(path(d,start,keyTile,true),'key '+seed+'/'+i);
  assert(path(d,start,king),'king '+seed+'/'+i);assert(path(d,king,crown),'crown '+seed+'/'+i);assert(path(d,crown,exit),'exit '+seed+'/'+i);
  if(i<8){
   // Traverse real movement/unlock and round-trip the map, preserving geometry.
   run('const walkMap'+i+'='+JSON.stringify({...d,doors:[...d.doors]})+';walkMap'+i+'.doors=new Set(walkMap'+i+'.doors);');
   run('explore=new ExploreEngine(walkMap'+i+');explore.cleared=new Set(Object.keys(explore.encounters));explore.eventsDone=new Set(Object.keys(explore.events));explore.wanderCap=0;');
   for(const target of [keyTile,king,crown,exit].filter(Boolean)){
    const pos=run('key(explore.pos.x,explore.pos.y)'),route=path(d,pos,target);
    assert(route);for(const k of route){const [x,y]=k.split(',').map(Number),r=run(`(()=>{const dx=${x}-explore.pos.x,dy=${y}-explore.pos.y;let r=explore.move(dx,dy);if(r.type==='locked')r=explore.unlock(r.x,r.y);return r;})()`);assert.notEqual(r.type,'blocked');assert.equal(run('key(explore.pos.x,explore.pos.y)'),k);}
    run('const savedWalk'+i+'_'+target.replace(',','_')+'=serializeExplore(explore);explore=reviveExplore(savedWalk'+i+'_'+target.replace(',','_')+');explore.wanderCap=0;');
   }
   assert.equal(run('explore.pos.x'),d.exit.x);assert.equal(run('explore.pos.y'),d.exit.y);
  }
 }
});
