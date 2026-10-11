const { test, expect } = require('@playwright/test');
const L = require('../../miniprogram/lib/learning');
test('完整日学习、自动打卡、刷新保存及资料筛选', async ({ page }) => {
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'把西语，变成日常。'})).toBeVisible();
  await expect(page.locator('.stat-value').first()).toContainText('0');
  await page.getByRole('button',{name:'开始今日学习'}).click();
  for(let i=0;i<5;i++){
    await expect(page.locator('.flash-word')).toBeVisible();
    await page.getByRole('button',{name:'查看释义与例句'}).click();
    await expect(page.locator('.flash-answer .example')).toBeVisible();
    await page.getByRole('button',{name:'想起来了',exact:true}).click();
  }
  await expect(page.getByRole('heading',{name:'这一轮结束了。'})).toBeVisible();
  await page.getByRole('button',{name:'去练语法'}).click();
  await page.getByRole('button',{name:'开始 4 道练习'}).click();
  const lesson=L.course.lessons[0];
  for(let i=0;i<lesson.questions.length;i++){
    const q=lesson.questions[i];
    await page.locator('.choice').nth(q.answer).click();
    await expect(page.locator('.feedback')).toContainText('答对了');
    await page.getByRole('button',{name:i===3?'查看结果':'下一题'}).click();
  }
  await expect(page.getByRole('heading',{name:'¡Muy bien! 本课已达标'})).toBeVisible();
  await expect(page.getByText('✓ 今日目标完成，已自动打卡。')).toBeVisible();
  await page.getByRole('button',{name:'回到今日',exact:true}).click();
  await page.reload();
  await expect(page.locator('.topbar')).toContainText('今日已打卡');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));
  expect(Object.keys(stored.reviews)).toHaveLength(5);expect(stored.lessons.g1.bestScore).toBe(100);
  await page.getByRole('link',{name:'资料库',exact:true}).click();
  await page.selectOption('#source-filter',{label:'词典'});
  await expect(page.locator('.source-card')).toHaveCount(1);
  await expect(page.locator('.source-card')).toContainText('RAE / ASALE');
  expect(errors).toEqual([]);
});
test('锁定课程、词汇搜索、错题回顾与 75% 达标线', async ({ page })=>{
  await page.goto('/#grammar');
  await page.locator('[data-id="g2"]').click();
  await expect(page.locator('#toast')).toContainText('至少 6 个词');
  await page.goto('/#words');
  await page.fill('#word-search','咖啡');
  await expect(page.locator('.word-card')).toHaveCount(1);
  await page.locator('summary').click();
  await expect(page.getByText('Quiero un café.',{exact:true})).toBeVisible();
  await page.fill('#word-search','不存在');await expect(page.locator('.empty')).toBeVisible();
  await page.goto('/#lesson/g1');await page.getByRole('button',{name:'开始 4 道练习'}).click();
  for(let i=0;i<4;i++){
    const q=L.course.lessons[0].questions[i];await page.locator('.choice').nth(i===0?(q.answer+1)%3:q.answer).click();
    await page.getByRole('button',{name:i===3?'查看结果':'下一题'}).click();
  }
  await expect(page.locator('.result-score')).toHaveText('75%');
  await expect(page.getByRole('heading',{name:'¡Muy bien! 本课已达标'})).toBeVisible();
  await page.getByRole('link',{name:'学习进度',exact:true}).click();
  await expect(page.locator('.mistake')).toHaveCount(1);
  await expect(page.locator('.mistake')).toContainText('正确答案');
  await expect(page.locator('.calendar-day')).toHaveCount(14);
});
test('所有主页面在桌面和手机上无横向溢出，浏览器备份可下载', async ({ page })=>{
  for(const section of ['today','words','grammar','library','bank','progress']){
    await page.goto(`/#${section}`);
    await expect(page.locator('.content')).toBeVisible();
    const dimensions=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
  }
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'导出备份',exact:true}).click();
  const download=await downloadPromise;expect(download.suggestedFilename()).toMatch(/^hola-\d{4}-\d{2}-\d{2}\.json$/);
});
test('浏览器备份导入恢复学习记录且内容不被当作 HTML 执行',async({page})=>{
  const s=L.emptyState(); L.review(s,'w1','remember');s.days[L.dateKey()].unknown='<script>alert(1)</script>';
  await page.goto('/#progress');
  page.on('dialog',dialog=>dialog.accept());
  const chooserPromise=page.waitForEvent('filechooser');await page.getByRole('button',{name:'导入备份',exact:true}).click();
  const chooser=await chooserPromise;await chooser.setFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});
  await expect(page.locator('#toast')).toContainText('学习记录已导入');
  await expect(page.locator('.stat-value').nth(2)).toContainText('1');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));
  expect(Object.keys(stored.reviews)).toHaveLength(1);expect(stored.days[L.dateKey()].unknown).toBeUndefined();
});

test('拼写测验错词重练、首答统计与保存',async({page})=>{
 await page.goto('/#words');await page.getByRole('button',{name:'词义与拼写测验'}).click();
 await page.getByRole('button',{name:'看中文，拼西语'}).click();await page.getByRole('button',{name:'开始词汇测验'}).click();
 const sequence=[...L.course.words.slice(0,5),L.course.words[0]];
 for(let i=0;i<sequence.length;i++){
   await page.fill('#spelling-answer',i===0?'错误':sequence[i].spanish);
   await page.getByRole('button',{name:'检查答案',exact:true}).click();
   await expect(page.locator('.feedback')).toContainText(i===0?'再记一遍':'答对了');
   if(i===0){const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(s.days[L.dateKey()].words).toHaveLength(0);expect(s.wordMistakes.w1).toBeTruthy();}
   await page.getByRole('button',{name:i===sequence.length-1?'查看结果':'下一词'}).click();
 }
 await expect(page.locator('.result-score')).toHaveText('80%');
 await page.reload();await page.goto('/#progress');
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));
 expect(s.days[L.dateKey()].words).toHaveLength(5);expect(Object.keys(s.wordMistakes)).toHaveLength(0);
});
test('A1 到 A2 路线、词汇等级筛选与输出草稿往返',async({page})=>{
 const s=L.emptyState();for(const unit of L.course.units.slice(0,8)){
   for(const w of L.course.words.filter(w=>w.unitId===unit.id).slice(0,6))L.review(s,w.id,'remember');
   const lesson=L.course.lessons.find(l=>l.unitId===unit.id);L.gradeLesson(s,lesson.id,lesson.questions.map(q=>q.answer));
 }
 await page.goto('/');await page.evaluate(value=>localStorage.setItem('hola-learning-v1',JSON.stringify(value)),s);await page.reload();
 await expect(page.locator('.topbar')).toContainText('A2');
 await page.goto('/#grammar');await page.getByRole('button',{name:'A2',exact:true}).click();
 await expect(page.locator('.unit-card')).toHaveCount(8);await expect(page.locator('.unit-card').first()).toContainText('可学习');
 await page.getByRole('button',{name:'B1',exact:true}).click();await expect(page.locator('.unit-card').first()).toContainText('待解锁');
 await page.goto('/#words');await page.selectOption('#level-filter','B2');await expect(page.locator('.word-card')).toHaveCount(80);
 await expect(page.locator('.word-card').first()).toContainText('igualdad');
 const task=L.course.tasks.find(t=>t.id==='e9');await page.goto('/#expression/e9');
 await page.fill('#expression-text',task.model);await page.getByRole('button',{name:'保存草稿',exact:true}).click();await expect(page.locator('#expression-status')).toHaveText('草稿已保存。');
 await page.reload();await expect(page.locator('#expression-text')).toHaveValue(task.model);
 await page.getByRole('button',{name:'检查词汇覆盖',exact:true}).click();await expect(page.locator('.expression-feedback')).toContainText('形式要求已完成');
 await page.getByRole('button',{name:'对照参考范文'}).click();await expect(page.locator('.expression-model')).toHaveText(task.model);
 await page.goto('/#expression/e17');await expect(page.locator('#expression-text')).toBeDisabled();
});
test('综合输出跨阶段复用词汇、多段要求、备份保存与手机布局',async({page})=>{
 const s=L.emptyState();for(const lesson of L.course.lessons){for(const w of L.course.words.filter(w=>w.unitId===lesson.unitId).slice(0,6))L.review(s,w.id,'remember');L.gradeLesson(s,lesson.id,lesson.questions.map(q=>q.answer));}
 await page.goto('/');await page.evaluate(value=>localStorage.setItem('hola-learning-v1',JSON.stringify(value)),s);await page.goto('/#expression/final');await page.reload();
 await page.fill('#expression-text','Mi propuesta es útil.');await page.getByRole('button',{name:'检查词汇覆盖',exact:true}).click();await expect(page.locator('.expression-feedback')).toContainText('继续补充');
 const task=L.course.tasks.find(t=>t.final);await page.fill('#expression-text',task.model);await page.getByRole('button',{name:'检查词汇覆盖',exact:true}).click();await expect(page.locator('.expression-feedback')).toContainText('形式要求已完成');
 await page.reload();await expect(page.locator('#expression-text')).toHaveValue(task.model);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(stored.expressions.final.attempts).toBe(2);
 await page.getByRole('button',{name:'对照参考范文'}).click();
 const d=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));expect(d.scroll).toBeLessThanOrEqual(d.width);
});
test('6500 词库分页、中文英文搜索、阶段锁定和扩展模式保存',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#bank');
 await expect(page.getByRole('heading',{name:'6,500 个词，从认识到表达。'})).toBeVisible();
 await expect(page.locator('#bank-count')).toContainText('800 个去重条目');await expect(page.locator('.word-card')).toHaveCount(30);
 await page.getByRole('button',{name:'全部',exact:true}).click();await expect(page.locator('#bank-count')).toContainText('6500 个去重条目');
 const first=await page.locator('.word-title').first().textContent();await page.getByRole('button',{name:'下一页',exact:true}).click();
 await expect(page.locator('#bank-count')).toContainText('第 2 /');expect(await page.locator('.word-title').first().textContent()).not.toBe(first);
 await page.fill('#bank-search','不可能找到的词');await expect(page.locator('.empty')).toBeVisible();await expect(page.locator('#bank-count')).toContainText('第 1 / 1');
 await page.fill('#bank-search','superintend');await expect(page.locator('.word-card')).not.toHaveCount(0);await expect(page.locator('.word-card').filter({hasText:'supervisar'})).toHaveCount(1);
 const matched=page.locator('.word-card').filter({hasText:'supervisar'});await matched.locator('summary').click();await expect(matched).toContainText('to supervise');
 await page.fill('#bank-search','监督');await expect(page.locator('.word-card')).not.toHaveCount(0);
 await page.fill('#bank-search','');await page.getByRole('button',{name:'B2',exact:true}).click();await expect(page.locator('#bank-count')).toContainText('2200 个');
 await expect(page.getByRole('button',{name:'词卡训练',exact:true}).first()).toBeDisabled();
 await page.getByRole('button',{name:'预览表达'}).first().click();await expect(page.locator('#expression-text')).toBeDisabled();
 await page.goto('/#bank');await page.getByRole('button',{name:'启用扩展词库',exact:true}).click();await page.reload();
 await expect(page.getByText('当前：扩展词库。',{exact:false})).toBeVisible();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(stored.track).toBe('bank');expect(errors).toEqual([]);
});
test('词包词卡与拼写训练、全部表达组和草稿保存',async({page})=>{
 const pack=L.course.lexicon.packs[0],word=L.findWord(pack.wordIds[0]);await page.goto('/#bank');
 await page.getByRole('button',{name:'词卡训练',exact:true}).first().click();await expect(page.locator('.flash-word')).toHaveText(word.spanish);
 await page.getByRole('button',{name:'查看释义与例句'}).click();await expect(page.locator('.flash-answer .example')).toHaveText(word.definition);
 await expect(page.locator('.flash-answer')).toContainText('辅助释义');await page.getByRole('button',{name:'想起来了',exact:true}).click();
 await page.goto('/#bank');await page.getByRole('button',{name:'词义与拼写',exact:true}).first().click();
 await page.getByRole('button',{name:'看中文，拼西语'}).click();await page.getByRole('button',{name:'开始词汇测验'}).click();
 // The reviewed first word is postponed; unlearned words come first.
 const next=L.findWord(pack.wordIds[1]);await page.fill('#spelling-answer',next.spanish);await page.getByRole('button',{name:'检查答案',exact:true}).click();
 await expect(page.locator('.feedback')).toContainText('答对了');
 await page.goto('/#bank');await page.getByRole('button',{name:'串联表达',exact:true}).first().click();
 await expect(page.getByRole('button',{name:'表达 4',exact:true})).toBeVisible();
 const draft='Mi casa es bonita. Soy una persona.';await page.fill('#expression-text',draft);await page.getByRole('button',{name:'保存草稿',exact:true}).click();
 await page.getByRole('button',{name:'表达 4',exact:true}).click();await expect(page.locator('#expression-text')).toHaveValue('');
 await page.getByRole('button',{name:'表达 1',exact:true}).click();await expect(page.locator('#expression-text')).toHaveValue(draft);
 await page.getByRole('button',{name:'检查词汇覆盖',exact:true}).click();await page.getByRole('button',{name:'查看待填写句型框架',exact:true}).click();
 await expect(page.locator('.expression-model')).toContainText('Soy…');await page.reload();await expect(page.locator('#expression-text')).toHaveValue(draft);
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(s.wordPractice[next.id].correct).toBe(1);expect(s.expressions[pack.id].attempts).toBe(1);
});
test('完整词库备份支持最后 B2 词的测验与表达',async({page})=>{
 const s=L.emptyState();s.track='bank';for(const w of L.course.words)s.reviews[w.id]={interval:3,due:'2099-01-01',lastReviewed:L.dateKey(),repetitions:1,confirmed:true};
 for(const l of L.course.lessons)s.lessons[l.id]={bestScore:100,attempts:1};
 const last=L.course.lexicon.imported.at(-1),pack=L.course.lexicon.packs.at(-1);s.reviews[last.id].due=L.dateKey();
 await page.goto('/');await page.evaluate(value=>localStorage.setItem('hola-learning-v1',JSON.stringify(value)),s);await page.goto('/#bank');await page.reload();
 await page.getByRole('button',{name:'B2',exact:true}).click();
 for(let i=0;i<17;i++)await page.getByRole('button',{name:'后一组词包',exact:true}).click();
 const card=page.locator('.pack-card').filter({hasText:`词包 ${pack.number}`});await card.getByRole('button',{name:'词义与拼写',exact:true}).click();
 await page.getByRole('button',{name:'看中文，拼西语'}).click();await page.getByRole('button',{name:'开始词汇测验'}).click();
 await expect(page.locator('.flash-word')).toHaveText(last.meaning);await page.fill('#spelling-answer',last.spanish);await page.getByRole('button',{name:'检查答案',exact:true}).click();await expect(page.locator('.feedback')).toContainText('答对了');
 await page.goto('/#progress');await expect(page.locator('.stat-value').nth(2)).toContainText('6500');
 const finalGroup=L.course.tasks.filter(t=>t.packId===pack.id).at(-1);await page.goto(`/#expression/${finalGroup.id}`);await expect(page.locator('#expression-text')).toBeEnabled();
 await expect(page.locator('.expression-targets').first()).toContainText(last.spanish);
 const dimensions=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
});
test('新手四步入门从首页到全部规则练习，75% 保存与旧进度独立',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.getByRole('button',{name:'四步入门 · 0 / 4 达标',exact:true}).click();await expect(page.getByRole('heading',{name:'先学会第一句话。'})).toBeVisible();
 for(const f of L.foundations){
  await page.locator(`[data-action="foundation"][data-id="${f.id}"]`).click();
  if(f.id==='gender'){await expect(page.locator('.rules')).toContainText('el día');await expect(page.locator('.rules')).toContainText('la mano');await expect(page.locator('.rules')).toContainText('el agua fría');}
  if(f.id==='sounds'){await page.evaluate(()=>{speechSynthesis.getVoices=()=>[];});await page.getByRole('button',{name:'听设备合成语音'}).first().click();await expect(page.locator('#toast')).toContainText('暂无西班牙语音色');}
  await page.getByRole('button',{name:'做 4 道小练习'}).click();
  for(let i=0;i<f.questions.length;i++){
   const q=f.questions[i],wrong=f.id==='gender'&&i===0;await page.locator('.choice').nth(wrong?(q.answer+1)%3:q.answer).click();await expect(page.locator('.feedback')).toContainText(q.explanation);
   await page.getByRole('button',{name:i===3?'查看结果':'下一题'}).click();
  }
  await expect(page.locator('.result-score')).toHaveText(f.id==='gender'?'75%':'100%');await page.getByRole('button',{name:'继续下一微课'}).click();
 }
 await page.goto('/');await page.reload();await expect(page.getByRole('button',{name:'四步入门 · 4 / 4 达标',exact:true})).toBeVisible();
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(s.foundations.gender.bestScore).toBe(75);expect(Object.keys(s.days)).toHaveLength(0);expect(Object.keys(s.lessons)).toHaveLength(0);expect(errors).toEqual([]);
});
test('一年计划周自检、未来周预览、写入失败及备份往返',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#year');await expect(page.getByRole('heading',{name:'一年，慢慢走向 B1。'})).toBeVisible();
 await expect(page.locator('[data-skill="words"]')).toBeDisabled();await page.getByRole('button',{name:'开始一年计划',exact:true}).click();
 await expect(page.getByText('经过 1 天',{exact:false})).toBeVisible();await page.selectOption('#year-week','13');await expect(page.locator('[data-skill="words"]')).toBeDisabled();
 await page.getByRole('button',{name:'查看课程前置要求',exact:true}).click();await expect(page.locator('#toast')).toContainText('至少 6 个词');
 await page.getByRole('button',{name:'回到建议的本周'}).click();for(const skill of L.yearPlan.skills)await page.locator(`[data-skill="${skill.id}"]`).check();
 await expect(page.getByText('周自检已勾选 1 / 52',{exact:false})).toBeVisible();await page.reload();await expect(page.locator('[data-skill="speak"]')).toBeChecked();
 await page.locator('[data-skill="speak"]').uncheck();await expect(page.getByText('周自检已勾选 0 / 52',{exact:false})).toBeVisible();
 const backup=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(backup.journey.startDate).toBe(L.dateKey());expect(Object.keys(backup.days)).toHaveLength(0);
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('quota');};});await page.locator('[data-skill="speak"]').click();await expect(page.locator('#toast')).toContainText('未保存');await expect(page.locator('[data-skill="speak"]')).not.toBeChecked();
 await page.reload();await page.goto('/#progress');page.on('dialog',d=>d.accept());
 const chooserPromise=page.waitForEvent('filechooser');await page.getByRole('button',{name:'导入备份',exact:true}).click();const chooser=await chooserPromise;await chooser.setFiles({name:'journey.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
 await expect(page.locator('#toast')).toContainText('学习记录已导入');await page.goto('/#year');await expect(page.locator('[data-skill="words"]')).toBeChecked();expect(errors).toEqual([]);
});
test('新手与年度页面在手机和桌面上无横向溢出',async({page})=>{
 for(const route of ['foundations','foundation/sounds','foundation/stress','foundation/gender','foundation/agreement','year']){
  await page.goto('/#'+route);await expect(page.locator('.content')).toBeVisible();const d=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));expect(d.scroll).toBeLessThanOrEqual(d.width);
 }
 await page.selectOption('#year-week','52');await expect(page.locator('.content')).toContainText('复盘并安排下一阶段');await expect(page.locator('[data-skill="write"]')).toBeDisabled();
});
