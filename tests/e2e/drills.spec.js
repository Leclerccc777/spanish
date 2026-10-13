const { test, expect } = require('@playwright/test');
const L = require('../../miniprogram/lib/learning');
async function complete(page, pack, wrongIndex = -1) {
  await page.getByRole('button', { name: '开始四步练习' }).click();
  for (const [i, q] of pack.questions.entries()) {
    if (q.kind === 'choice') await page.locator('[data-action="drill-answer"]').filter({ hasText: q.answers[0] }).click();
    else {
      await page.fill('#drill-answer', i === wrongIndex ? '错误' : q.answers[0]);
      await page.getByRole('button', { name: '检查答案', exact: true }).click();
    }
    await expect(page.locator('.feedback')).toContainText(i === wrongIndex ? '再看一下' : '答对了');
    await page.getByRole('button', { name: i === 3 ? '保存并查看结果' : '下一步' }).click();
  }
}

test('A1 到 B2 全路线真实逐包作答、错项订正、个人表达与备份往返', async ({ page }) => {
  test.setTimeout(300000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.getByRole('button',{name:'进入分级练习'}).click();
  await expect(page.locator('.drill-card')).toHaveCount(6);
  await page.getByRole('button',{name:'A2',exact:true}).click();await page.locator('[data-action="drill"][data-id="a2-weekend"]').click();
  await expect(page.getByRole('button',{name:'开始四步练习'})).toBeDisabled();await expect(page.locator('#drill-draft')).toBeDisabled();
  const first=L.drillPacks[0];await page.goto('/#drill/'+first.id);await complete(page,first,1);
  await expect(page.locator('.result-score')).toHaveText('75%');
  await page.getByRole('button',{name:'返回分级练习'}).click();
  await expect(page.locator('.drill-card').first()).toContainText('待订正 1 项');
  await page.locator('[data-action="drill"][data-id="a1-place"]').click();await complete(page,first);
  await page.getByRole('button',{name:'写自己的表达'}).click();
  await page.fill('#drill-draft','Soy estudiante. En mi casa hay una mesa. Mi libro está en la mesa.');
  await expect(page.getByRole('button',{name:'对照参考范文'})).toBeDisabled();
  await page.getByRole('button',{name:'保存表达草稿'}).click();await expect(page.locator('#drill-draft-status')).toContainText('草稿已保存');
  await page.getByRole('button',{name:'对照参考范文'}).click();await expect(page.locator('.expression-model')).toContainText(first.output.model);
  for(const p of L.drillPacks.slice(1)){
    await page.goto('/#drill/'+p.id);await complete(page,p);await expect(page.locator('.result-score')).toHaveText('100%');
  }
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));
  expect(Object.keys(saved.drills)).toHaveLength(24);expect(saved.drillMistakes).toEqual({});expect(saved.days).toEqual({});expect(saved.lessons).toEqual({});expect(saved.reviews).toEqual({});
  await page.goto('/#drill/a1-place');await page.reload();await expect(page.locator('#drill-draft')).toHaveValue(first.output.model);
  await page.goto('/#progress');page.once('dialog',dialog=>dialog.accept());
  const chooserPromise=page.waitForEvent('filechooser');await page.getByRole('button',{name:'导入备份',exact:true}).click();
  const chooser=await chooserPromise;await chooser.setFiles({name:'drills.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});
  await expect(page.locator('#toast')).toContainText('学习记录已导入');
  await page.goto('/#drills');await page.getByRole('button',{name:'B2',exact:true}).click();await expect(page.locator('.drill-card').last()).toContainText('最佳正确率 100%');
  expect(errors).toEqual([]);
});

test('分级练习与表达保存失败保留提交入口，恢复存储后可重试', async ({ page }) => {
  const p=L.drillPacks[0];await page.goto('/#drill/'+p.id);await page.getByRole('button',{name:'开始四步练习'}).click();
  for(const [i,q] of p.questions.entries()){
    if(q.kind==='choice')await page.locator('[data-action="drill-answer"]').filter({hasText:q.answers[0]}).click();
    else{await page.fill('#drill-answer',q.answers[0]);await page.locator('#drill-answer').press('Enter');}
    if(i<3)await page.getByRole('button',{name:'下一步'}).click();
  }
  await page.evaluate(()=>{window.drillOriginalWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('quota');};});
  await page.getByRole('button',{name:'保存并查看结果'}).click();await expect(page.locator('#toast')).toContainText('未保存');await expect(page.locator('.result-score')).toHaveCount(0);
  expect(await page.evaluate(()=>localStorage.getItem('hola-learning-v1'))).toBeNull();
  await page.evaluate(()=>{Storage.prototype.setItem=window.drillOriginalWrite;});await page.getByRole('button',{name:'保存并查看结果'}).click();
  await expect(page.locator('.result-score')).toHaveText('100%');await page.getByRole('button',{name:'写自己的表达'}).click();
  await page.fill('#drill-draft','Soy estudiante.');await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('quota');};});
  await page.getByRole('button',{name:'保存表达草稿'}).click();await expect(page.locator('#drill-draft-status')).toContainText('尚未保存');
  await expect(page.locator('#drill-draft')).toHaveValue('Soy estudiante.');await expect(page.getByRole('button',{name:'对照参考范文'})).toBeDisabled();
  await page.evaluate(()=>{Storage.prototype.setItem=window.drillOriginalWrite;});await page.getByRole('button',{name:'保存表达草稿'}).click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(saved.drills[p.id].attempts).toBe(1);expect(saved.drillDrafts[p.id].text).toBe('Soy estudiante.');
});

test('各级预览和输入页面在 320px / 平板上无横向溢出', async ({ page }) => {
  for(const width of [320,768]){
    await page.setViewportSize({width,height:840});await page.goto('/#drills');
    for(const level of ['A1','A2','B1','B2']){await page.getByRole('button',{name:level,exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
    for(const id of ['a1-place','a2-weekend','b1-advice','b2-report']){await page.goto('/#drill/'+id);await expect(page.locator('.reading')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
    await page.goto('/#drill/a1-place');await page.getByRole('button',{name:'开始四步练习'}).click();
    await page.locator('[data-action="drill-answer"]').filter({hasText:'soy'}).click();await page.getByRole('button',{name:'下一步'}).click();
    await page.fill('#drill-answer','est');await page.getByRole('button',{name:'添加 á',exact:true}).click();await expect(page.locator('#drill-answer')).toHaveValue('está');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.goto('/#drills');
  }
});
