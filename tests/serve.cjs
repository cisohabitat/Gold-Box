// Development-only static server; keeps CI independent of Python and apt mirrors.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),port=Number(process.env.GOLD_BOX_PORT||8000);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid GOLD_BOX_PORT');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let file;try{const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);file=path.resolve(root,'.'+name);if(file!==root&&!file.startsWith(root+path.sep))throw Error('Outside root');}catch{res.writeHead(400);res.end();return;}
 fs.stat(file,(error,stat)=>{if(!error&&stat.isDirectory())file=path.join(file,'index.html');fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data);});});
}).listen(port,'127.0.0.1',()=>console.log('Gold Box development server on '+port));
