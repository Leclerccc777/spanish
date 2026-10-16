const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {manifest,audioPage}=require('../miniprogram/lib/audio');
test('内置音频完整覆盖发布清单，分包路径存在且无缺失文件',()=>{
 const texts=require('../scripts/audio-texts'),app=require('../miniprogram/app.json');
 assert.equal(texts.length,493);assert.equal(Object.keys(manifest).length,texts.length);
 for(const text of texts){const file=manifest[text];assert(app.subPackages.some(p=>file.startsWith(p.root+'/')));const bytes=fs.readFileSync(path.join(__dirname,'../miniprogram',file));assert(bytes.length>1000);assert.equal(bytes.toString('ascii',0,3),'ID3');}
 for(const pack of app.subPackages){const dir=path.join(__dirname,'../miniprogram',pack.root);const size=fs.readdirSync(dir).reduce((n,f)=>n+fs.statSync(path.join(dir,f)).size,0);assert(size<2*1024*1024);}
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
