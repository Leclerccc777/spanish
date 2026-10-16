const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const L=require('../../miniprogram/lib/learning');

test('首页优先展示双打卡入口，预览不冒充完成，窄屏按钮不重叠',async({page})=>{
 await page.goto('/');const daily=page.getByRole('region',{name:'今日打卡'});
 await expect(daily.getByRole('button',{name:'开始今日词汇',exact:true})).toBeVisible();
 await expect(daily.getByRole('button',{name:'开始今日语法',exact:true})).toBeVisible();
 const a=await daily.boundingBox(),b=await page.locator('.beginner-start').first().boundingBox();expect(a.y+a.height).toBeLessThan(b.y);
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const boxes=await daily.locator('.btn').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));expect(boxes[0].bottom+14<=boxes[1].y||boxes[0].right+14<=boxes[1].x).toBe(true);}
 await daily.getByRole('button',{name:'开始今日语法',exact:true}).click();await expect(page).toHaveURL(/lesson\/g1$/);
 await page.goto('/');await expect(daily).toContainText('尚未达标');expect(await page.evaluate(()=>localStorage.getItem('hola-learning-v1'))).toBeNull();
});

test('每日语法失败后重开换题并按新答案评分，保存失败保留当前题组',async({page})=>{
 await page.goto('/#lesson/g1');await page.getByRole('button',{name:'开始 4 道练习'}).click();
 for(const [i,q] of L.lessonQuestions('g1',0).entries()){await page.locator('.choice').nth((q.answer+1)%3).click();await page.getByRole('button',{name:i===3?'查看结果':'下一题'}).click();}
 await expect(page.locator('.result-score')).toHaveText('0%');await page.reload();await page.getByRole('button',{name:'开始 4 道练习'}).click();
 const questions=L.lessonQuestions('g1',1);
 for(const [i,q] of questions.entries()){
  await expect(page.locator('.question-title')).toHaveText(q.prompt);await page.locator('.choice').nth(q.answer).click();await expect(page.locator('.feedback')).toContainText('答对了');
  if(i===3){await page.evaluate(()=>{window.savedSetItem=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota');};});await page.getByRole('button',{name:'查看结果'}).click();await expect(page.locator('.question-title')).toHaveText(q.prompt);await expect(page.locator('.result-score')).toHaveCount(0);await page.evaluate(()=>{Storage.prototype.setItem=window.savedSetItem;});}
  await page.getByRole('button',{name:i===3?'查看结果':'下一题'}).click();
 }
 await expect(page.locator('.result-score')).toHaveText('100%');const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(state.lessons.g1.attempts).toBe(2);expect(state.mistakes).toEqual({});expect(L.summary(state).checkedIn).toBe(false);
 await page.getByRole('button',{name:'回到今日',exact:true}).click();await expect(page.locator('.daily-checkin')).toContainText('今天已有达标练习');
});

async function instrumentAudio(page){
 await page.addInitScript(()=>{
  const NativeAudio=window.Audio;window.Audio=class extends NativeAudio{constructor(...args){super(...args);window.lastRealAudio=this;this.maxPlayed=0;this.addEventListener('timeupdate',()=>{this.maxPlayed=Math.max(this.maxPlayed,this.currentTime);});this.addEventListener('playing',()=>{this.playedSource=this.src;this.playedRate=this.playbackRate;});}};
  if(window.speechSynthesis)window.speechSynthesis.getVoices=()=>[];
 });
}
async function playAndCheck(page,button,rate){
 await button.click();await expect.poll(()=>page.evaluate(()=>window.lastRealAudio?.maxPlayed||0)).toBeGreaterThan(.05);
 expect(await page.evaluate(()=>({error:window.lastRealAudio.error?.code||null,rate:window.lastRealAudio.playedRate,src:(window.lastRealAudio.playedSource||'').startsWith('data:audio/mpeg;base64,')}))).toEqual({error:null,rate,src:true});
 // Short words can finish before the next automation command reaches the browser.
 const stopped=await page.locator('[data-action="audio-stop"]').evaluate(button=>{if(!button.hidden)button.click();return window.lastRealAudio.paused;});expect(stopped).toBe(true);
}
test('没有系统西语音色仍可真实播放内置词卡、短文和文章，慢速与离页停止有效',async({page})=>{
 await instrumentAudio(page);await page.goto('/#foundation/sounds');
 await playAndCheck(page,page.getByRole('button',{name:'听发音',exact:true}).first(),1);
 await playAndCheck(page,page.getByRole('button',{name:'慢速听',exact:true}).first(),.75);
 await page.goto('/#drill/a1-place');await playAndCheck(page,page.locator('#drill-read').getByRole('button',{name:'听发音',exact:true}),1);
 await page.goto('/#drill/b1-anterior');await page.getByRole('button',{name:'试读本级长一点的文章'}).click();await playAndCheck(page,page.locator('.bridge-reading').getByRole('button',{name:'听发音',exact:true}).first(),1);
 await page.locator('.bridge-reading').getByRole('button',{name:'听发音',exact:true}).first().click();await expect.poll(()=>page.evaluate(()=>window.lastRealAudio.currentTime)).toBeGreaterThan(.05);
 await page.evaluate(()=>{location.hash='today';});await expect(page.locator('.daily-checkin')).toBeVisible();expect(await page.evaluate(()=>window.lastRealAudio.paused)).toBe(true);
 expect(await page.evaluate(()=>localStorage.getItem('hola-learning-v1'))).toBeNull();
});

test('Pages 子路径的单文件离线播放，493 段音频都能解码且无需外部音源',async({page,context})=>{
 test.setTimeout(180000);await instrumentAudio(page);const html=fs.readFileSync(path.join(__dirname,'../../dist/pages/index.html'),'utf8');
 const url='http://127.0.0.1:4173/spanish/';const requests=[];page.on('request',r=>{if(!r.url().startsWith('data:'))requests.push(r.url());});
 await context.route(url,route=>route.fulfill({status:200,contentType:'text/html',body:html}));await context.setOffline(true);await page.goto(url+'#foundation/sounds');
 await playAndCheck(page,page.getByRole('button',{name:'听发音',exact:true}).first(),1);
 const decoded=await page.evaluate(async()=>{const audio=new AudioContext(),durations=[];try{for(const src of Object.values(window.HolaAudioClips)){const bytes=Uint8Array.from(atob(src.split(',')[1]),c=>c.charCodeAt(0));const result=await audio.decodeAudioData(bytes.buffer);if(result.duration<=0||!result.getChannelData(0).some(n=>Math.abs(n)>.001))throw Error('Empty audio');durations.push(result.duration);}return {count:durations.length,min:Math.min(...durations),max:Math.max(...durations)};}finally{await audio.close();}});
 expect(decoded.count).toBe(493);expect(decoded.min).toBeGreaterThan(.1);expect(decoded.max).toBeGreaterThan(20);expect(requests).toEqual([url]);
});
