// Release balance canary: real engines, seeded loot-first Auto policy, reported by oath/route/guardian.
const fs=require('node:fs');const path=require('node:path');
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
function summarize(results){
 const group=rows=>{const wins=rows.filter(r=>r.stop==='victory').length,n=rows.length,p=n?wins/n:0,z=1.96,den=1+z*z/(n||1),center=(p+z*z/(2*(n||1)))/den,margin=z*Math.sqrt((p*(1-p)+z*z/(4*(n||1)))/(n||1))/den;return {runs:n,wins,losses:n-wins,winRate:p,winRate95:[Math.max(0,center-margin),Math.min(1,center+margin)],meanDepth:mean(rows.map(r=>r.depth)),meanBattles:mean(rows.map(r=>r.fights.length)),defeatsByFloor:Object.fromEntries([...new Set(rows.filter(r=>r.stop==='defeat').map(r=>r.floor))].map(floor=>[floor,rows.filter(r=>r.stop==='defeat'&&r.floor===floor).length]))};};
 const oaths=Object.fromEntries(['wanderer','delver','ironbound'].map(o=>[o,group(results.filter(r=>r.oath===o))]));
 const routes=Object.fromEntries([0,1,2,3].map(branch=>[branch,Object.fromEntries(Object.keys(oaths).map(o=>[o,group(results.filter(r=>r.branch===branch&&r.oath===o))]))]));
 const allFights=results.flatMap(r=>r.fights.map(f=>({...f,oath:r.oath}))),guardians={};
 for(const cls of ['BellWarden','AshCantor','CryptLord'])guardians[cls]=Object.fromEntries(Object.keys(oaths).map(o=>{const rows=allFights.filter(f=>f.oath===o&&f.guardians.includes(cls));return [o,{attempts:rows.length,wins:rows.filter(f=>f.result==='won').length,meanRounds:mean(rows.map(f=>f.rounds)),meanHpRemaining:mean(rows.map(f=>f.hpAfter/f.maxHp))}];}));
 return {oaths,routes,guardians};
}
function checkBalance(summary,results){
 const flags=[],o=summary.oaths;const requireCheck=(ok,message)=>{if(!ok)flags.push(message);};
 requireCheck(results.every(r=>['victory','defeat'].includes(r.stop)),'A run stalled or exceeded its safety limit.');
 requireCheck(o.wanderer.winRate>=.5,'Wanderer Auto win rate fell below the 50% accessibility canary.');
 requireCheck(o.delver.winRate>=.1&&o.delver.winRate<=.9,'Delver Auto win rate is outside the broad 10–90% canary.');
 requireCheck(o.ironbound.wins>=1&&o.ironbound.winRate<=.6,'Ironbound needs at least one diagnostic victory and no more than 60% wins.');
 requireCheck(o.wanderer.winRate>=o.delver.winRate&&o.delver.winRate>=o.ironbound.winRate,'Difficulty win-rate ordering inverted: Wanderer ≥ Delver ≥ Ironbound is expected.');
 for(const [route,row] of Object.entries(summary.routes))requireCheck(row.wanderer.wins>=1,'No Wanderer victory on route '+route+'.');
 requireCheck(results.filter(r=>r.oath==='wanderer'&&r.stop==='defeat'&&r.depth===1).length<=o.wanderer.runs*.25,'More than 25% of Wanderer runs died on the first floor.');
 return flags;
}
module.exports={summarize,checkBalance};
if(require.main===module)(async()=>{
 const {runCampaigns,validateCampaigns}=require('./campaign.cjs');
 const samples=Number(process.env.BALANCE_SAMPLES||8);if(!Number.isInteger(samples)||samples<3||samples>50)throw Error('BALANCE_SAMPLES must be an integer from 3 to 50.');
 const {build,results,errors}=await runCampaigns(samples,(done,total)=>console.log('Balance seeds '+done+'/'+total)),summary=summarize(results),flags=checkBalance(summary,results);
 try{validateCampaigns(results,errors,samples);}catch(e){flags.push('Campaign integrity check: '+e.message);}
 const report={build,samplesPerOathRoute:samples,totalRuns:results.length,policy:'Default party; real Auto combat; loot-first exploration; complete route objectives and accept the first two shrine beacons encountered; camp below 70% HP; first offered boon; varied councils; no shop purchases.',limits:'Deterministic regression canary, not a human win-rate estimate. Wilson intervals describe this small sample and do not validate the policy as representative of players.',thresholds:{wandererMin:.5,delverRange:[.1,.9],ironboundMax:.6,ironboundMinWins:1,ordering:'wanderer >= delver >= ironbound',everyWandererRouteMinWins:1},passed:flags.length===0,flags,...summary,results};
 const directory=process.env.BALANCE_OUTPUT||path.join(process.cwd(),'artifacts','balance');fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify(report,null,2)+'\n');
 const percent=n=>(n*100).toFixed(1)+'%';const lines=['# Game balance — build '+build,'',report.policy,'',report.limits,'','| Oath | Wins / runs | Win rate | 95% interval | Mean depth |','| --- | --- | --- | --- | --- |',...Object.entries(summary.oaths).map(([name,r])=>'| '+name+' | '+r.wins+' / '+r.runs+' | '+percent(r.winRate)+' | '+r.winRate95.map(percent).join('–')+' | '+r.meanDepth.toFixed(2)+' |'),'','| Route | Wanderer | Delver | Ironbound |','| --- | --- | --- | --- |',...Object.entries(summary.routes).map(([route,r])=>'| '+route+' | '+Object.values(r).map(x=>x.wins+'/'+x.runs).join(' | ')+' |'),'','Routes: 0 Warren/Ossuary; 1 Warren/Pillared Road; 2 Gallery/Ossuary; 3 Gallery/Pillared Road.','','Checks: '+(flags.length?flags.join(' '):'PASS — no stalls, broad difficulty bands/order, every Wanderer route beatable in the diagnostic sample.'),'','Per-floor defeats, guardian pressure, and full seeded run records are in report.json.'];
 fs.writeFileSync(path.join(directory,'report.md'),lines.join('\n')+'\n');console.log(lines.join('\n'));
 if(flags.length)throw Error('Balance regression: '+flags.join(' '));
})().catch(e=>{console.error(e);process.exitCode=1;});
