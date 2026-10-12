const {test,expect}=require('@playwright/test');const L=require('../../miniprogram/lib/learning');const KEY='hola-learning-v1';
test('读取失败不覆盖旧数据，重新读取恢复进度，再确认操作才保存',async({page})=>{
  const s=L.emptyState();L.review(s,'w1','remember');
  await page.addInitScript(({key,saved})=>{localStorage.setItem(key,JSON.stringify(saved));window.readOriginal=Storage.prototype.getItem;Storage.prototype.getItem=function(){throw new Error('read failed');};},{key:KEY,saved:s});
  await page.goto('/');await page.getByRole('button',{name:'开始今日学习'}).click();await page.getByRole('button',{name:'查看释义与例句'}).click();await page.getByRole('button',{name:'想起来了',exact:true}).click();
  await expect(page.locator('#toast')).toContainText('旧记录不会被覆盖');expect(await page.evaluate(key=>JSON.parse(window.readOriginal.call(localStorage,key)),KEY)).toEqual(s);
  await page.evaluate(()=>{Storage.prototype.getItem=window.readOriginal;});await page.goto('/#progress');await page.getByRole('button',{name:'重新读取记录'}).click();
  await expect(page.locator('.stat-value').nth(2)).toContainText('1');expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY)).toEqual(s);
});
test('损坏 JSON 不被学习操作或空备份覆盖，明确导入后解除保护',async({page})=>{
  await page.addInitScript(key=>localStorage.setItem(key,'broken-json'),KEY);await page.goto('/#progress');
  await page.locator('[data-action="goal"][data-goal="3"]').click();expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBe('broken-json');
  await page.getByRole('button',{name:'导出备份',exact:true}).click();await expect(page.locator('#toast')).toContainText('暂不导出空备份');
  const s=L.emptyState();L.review(s,'w1','remember');page.once('dialog',d=>d.accept());const promise=page.waitForEvent('filechooser');await page.getByRole('button',{name:'导入备份',exact:true}).click();const chooser=await promise;await chooser.setFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});await expect(page.locator('#toast')).toContainText('学习记录已导入');
  await page.locator('[data-action="goal"][data-goal="3"]').click();expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).goal,KEY)).toBe(3);
});
test('未知版本和另一窗口的坏记录保持原值，允许清晰地重读恢复',async({page})=>{
  const raw={version:2,reviews:{future:'keep'},days:{},lessons:{}};await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:KEY,value:raw});
  await page.goto('/#progress');await page.locator('[data-action="goal"][data-goal="3"]').click();expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY)).toEqual(raw);
  const s=L.emptyState();L.review(s,'w1','remember');await page.evaluate(({key,value})=>{localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new StorageEvent('storage',{key,newValue:JSON.stringify(value)}));},{key:KEY,value:s});
  await expect(page.locator('.stat-value').nth(2)).toContainText('1');await page.evaluate(key=>{localStorage.setItem(key,'bad-other-window');window.dispatchEvent(new StorageEvent('storage',{key,newValue:'bad-other-window'}));},KEY);
  await page.locator('[data-action="goal"][data-goal="3"]').click();expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBe('bad-other-window');
});
