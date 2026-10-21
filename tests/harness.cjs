const fs=require('node:fs'),path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];

function harness({storageBlocked=false,seed=42}={}){
  const elements=new Map(),timers=new Map(),saved=new Map();let seq=0;
  function element(){const classes=new Set();return {value:'',style:{setProperty(){}},dataset:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(){}},appendChild(){},focus(){},addEventListener(){},querySelectorAll(){return []},setAttribute(){},removeAttribute(){}};}
  const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const context=vm.createContext({console,TextEncoder,TextDecoder,btoa,atob,Math:math,document:{querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s);},querySelectorAll(){return [];},createElement:element,addEventListener(){}},localStorage:{setItem(k,v){if(storageBlocked)throw Error('blocked');saved.set(k,v);},getItem:k=>saved.get(k),removeItem:k=>saved.delete(k)},setTimeout(f){timers.set(++seq,f);return seq;},clearTimeout:id=>timers.delete(id)});
  const run=code=>vm.runInContext(code,context,{timeout:15000});
  run(source);
  run("render=()=>autosave();renderTown=()=>autosave();renderLevelUp=()=>{};renderCampaign=()=>{};newGame();$('#startScreen').classList.remove('show');");
  return {run,timers,tick(){const entry=timers.entries().next().value;if(!entry)return false;timers.delete(entry[0]);entry[1]();return true;}};
}

module.exports={harness};
