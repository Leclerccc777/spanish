const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {manifest,audioPage}=require('../miniprogram/lib/audio');
test('内置音频完整覆盖发布清单，分包路径存在且无缺失文件',()=>{
 const texts=require('../scripts/audio-texts'),app=require('../miniprogram/app.json');
 assert.equal(texts.length,6788);assert.equal(Object.keys(manifest).length,texts.length);
 for(const text of texts){const file=manifest[text];assert(app.subPackages.some(p=>file.startsWith(p.root+'/')));const bytes=fs.readFileSync(path.join(__dirname,'../miniprogram',file));assert(bytes.length>500);assert.equal(bytes.toString('ascii',0,3),'ID3');}
 const C=require('../miniprogram/data/course');
 assert.equal(new Set(C.words.map(w=>w.spanish)).size,6500);
 for(const w of C.words)assert(manifest[w.spanish],w.spanish);
 const onDisk=app.subPackages.flatMap(p=>fs.readdirSync(path.join(__dirname,'../miniprogram',p.root)).filter(n=>n.endsWith('.mp3')).map(n=>p.root+'/'+n));
 assert.deepEqual(onDisk.sort(),Object.values(manifest).sort(),'No stale or orphaned MP3 files');
 const bytesIn=dir=>fs.readdirSync(dir,{withFileTypes:true}).reduce((n,f)=>n+(f.isDirectory()?bytesIn(path.join(dir,f.name)):fs.statSync(path.join(dir,f.name)).size),0);
 const total=bytesIn(path.join(__dirname,'../miniprogram'));
 let subpackages=0;
 for(const pack of app.subPackages){const size=bytesIn(path.join(__dirname,'../miniprogram',pack.root));subpackages+=size;assert(size<2*1024*1024);}
 assert(total-subpackages<2*1024*1024,'Main package below 2 MiB');assert(total<20*1024*1024,'Complete mini program below 20 MiB');
});
test('原生音频加载竞态、停止、离页、慢速与失败不影响学习记录',()=>{
 const loads=[],players=[],messages=[];
 const platform={loadSubpackage(options){loads.push(options);},showToast(o){messages.push(o.title);},createInnerAudioContext(){const p={play(){p.played=true;},destroy(){p.destroyed=true;},onError(fn){p.error=fn;},onEnded(fn){p.end=fn;}};players.push(p);return p;}};
 const page=audioPage(platform),event=(text,rate=1)=>({currentTarget:{dataset:{text,rate}}});
 page.playAudio(event('hola'));page.playAudio(event('casa',.75));loads[0].success();assert.equal(players.length,0);loads[1].success();
 assert(players[0].played);assert.equal(players[0].playbackRate,.75);assert.equal(players[0].src,'/'+manifest.casa);
 page.onHide();assert(players[0].destroyed);
 page.playAudio(event('hola'));page.onUnload();loads[2].success();assert.equal(players.length,1);
 page.playAudio(event('不存在的音频'));assert.match(messages.at(-1),/还没有/);
 page.playAudio(event('hola'));loads[3].fail();assert.match(messages.at(-1),/加载失败/);
 page.playAudio(event('hola'));loads[4].success();players[1].error();assert(players[1].destroyed);assert.match(messages.at(-1),/未能播放/);
});

test('阅读词组与文章提示逐项对应原文，名词搭配有完整试听文本',()=>{
 const drills=require('../miniprogram/data/drills'),nouns=require('../miniprogram/data/noun-practice');
 let phrases=0,articleWords=0;
 for(const p of drills){
  for(const [es,zh,note] of p.words){phrases++;assert(p.reading.toLocaleLowerCase('es').includes(es.toLocaleLowerCase('es')),p.id+': '+es);assert(zh&&note);assert(manifest[es],es);}
  if(p.article)for(const [es,zh] of p.article.words){articleWords++;assert(p.article.paragraphs.join(' ').toLocaleLowerCase('es').includes(es.toLocaleLowerCase('es')),es);assert(zh);assert(manifest[es],es);}
 }
 assert.equal(phrases,72);assert.equal(articleWords,21);
 for(const n of nouns)for(const text of [n.singular,n.plural,n.phrase,n.sentence])assert(manifest[text],text);
 const report=drills.find(p=>p.id==='b2-report').words.find(w=>w[0]==='lo había presentado');assert(!report[1].includes('是否'));assert(report[2].includes('si'));
});
