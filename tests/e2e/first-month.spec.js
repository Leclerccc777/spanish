const {test,expect}=require('@playwright/test');
test('前四周任务开始、记录、反选、未来预览与备份往返',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'前四周每日小任务'}).click();await expect(page.locator('[data-month-task="focus"]')).toBeDisabled();
  await page.getByRole('button',{name:'从今天开始计划'}).click();await page.locator('[data-month-task="focus"]').check();await expect(page.locator('[data-month-task="focus"]')).toBeChecked();
  await page.selectOption('#month-day','15');await expect(page.locator('[data-month-task="focus"]')).toBeDisabled();
  await page.getByRole('button',{name:'打开本日配套内容'}).click();await expect(page.locator('#toast')).toContainText('先学习前一单元');
  await page.getByRole('button',{name:'回到建议的今天'}).click();await expect(page.locator('#month-day')).toHaveValue('1');await page.getByRole('button',{name:'打开本日配套内容'}).click();await expect(page.getByRole('heading',{name:'先把五个元音读清楚'})).toBeVisible();
  await page.goto('/#first-month');await page.reload();await expect(page.locator('[data-month-task="focus"]')).toBeChecked();
  const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(s.monthChecks['1'].tasks).toEqual(['focus']);expect(s.days).toEqual({});expect(s.lessons).toEqual({});
  await page.locator('[data-month-task="focus"]').uncheck();await page.goto('/#progress');page.once('dialog',d=>d.accept());const chooserPromise=page.waitForEvent('filechooser');await page.getByRole('button',{name:'导入备份',exact:true}).click();const chooser=await chooserPromise;await chooser.setFiles({name:'month.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});await expect(page.locator('#toast')).toContainText('学习记录已导入');await page.goto('/#first-month');await expect(page.locator('[data-month-task="focus"]')).toBeChecked();
});
test('每日任务写入失败保持原勾选，各天在 320px 无溢出',async({page})=>{
  await page.goto('/#first-month');await page.getByRole('button',{name:'从今天开始计划'}).click();
  await page.evaluate(()=>{window.monthWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('quota');};});await page.locator('[data-month-task="output"]').click();await expect(page.locator('[data-month-task="output"]')).not.toBeChecked();
  await page.evaluate(()=>{Storage.prototype.setItem=window.monthWrite;});await page.locator('[data-month-task="output"]').check();await expect(page.locator('[data-month-task="output"]')).toBeChecked();
  await page.setViewportSize({width:320,height:840});for(const day of ['1','7','15','28']){await page.selectOption('#month-day',day);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  await page.goto('/#year');await page.getByRole('button',{name:'前四周每日小任务'}).click();await expect(page.locator('#month-day')).toHaveValue('1');
});
