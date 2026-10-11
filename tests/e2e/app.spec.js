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
  for(const section of ['today','words','grammar','library','progress']){
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
