// Asset integrity: malformed rows used to silently cut holes in figures.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),ctx=vm.createContext({});
vm.runInContext(html.slice(html.indexOf('const PX ='),html.indexOf('/* ===== CONTROLLER'))+';globalThis.art={PX,SPX,SPRITES,px};',ctx);
const {PX,SPX,SPRITES,px}=ctx.art;
test('every sprite has valid palette, square geometry, distinct art and bounded opaque SVG runs',()=>{
 const unique=new Set();for(const [id,rows]of Object.entries(SPX)){
  assert.equal(rows.length,24,id);for(const row of rows){assert.equal(row.length,24,id);assert([...row].every(c=>c==='.'||PX[c]),id);}
  const svg=SPRITES[id];assert(!unique.has(svg),'duplicate '+id);unique.add(svg);assert.match(svg,/aria-hidden="true" focusable="false"/);assert.match(svg,/viewBox="0 0 24 24"/);
  for(const m of svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="1" fill="(#[a-f0-9]+)"\/>/g)){assert(+m[1]+ +m[3]<=24,id);assert(+m[2]<24,id);assert(Object.values(PX).includes(m[4]),id);}
  assert(!/undefined|NaN|<image|<script|href=/.test(svg),id);
 }
});
test('all class and monster sprite references resolve; guardians use unique identities',()=>{
 const registry=html.slice(html.indexOf('const CLASSES ='),html.indexOf('const BACKGROUNDS ='))+html.slice(html.indexOf('const BESTIARY ='),html.indexOf('function makeGroup'));
 for(const [,id]of registry.matchAll(/sprite:\s*'([^']+)'/g))assert(SPRITES[id],id);
 for(const id of ['bell_warden','ash_cantor','crypt_lord','eclipse_wyrm']){assert.match(registry,new RegExp(id+':[^\n]*sprite:\\s*\''+id+'\''));assert(SPRITES[id]);}
});
test('sprite compiler rejects invalid dimensions and unknown palette symbols',()=>{
 assert.throws(()=>px(['.']),/Invalid sprite/);const rows=Array(24).fill('.'.repeat(24));rows[3]='?'+'.'.repeat(23);assert.throws(()=>px(rows),/Invalid sprite/);
});
