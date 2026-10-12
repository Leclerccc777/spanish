const {test,expect}=require('@playwright/test');
test('52 周具体指南切换材料、保留前置与未来自检，短阅读入口可达',async({page})=>{
  await page.goto('/#year');await expect(page.locator('[data-action="week-guide"]')).toHaveCount(7);
  await page.selectOption('#year-week','29');await expect(page.locator('[data-action="week-guide"][data-kind="lesson"]').first()).toHaveAttribute('data-id','g17');
  await page.locator('[data-action="week-guide"][data-kind="lesson"]').first().click();await expect(page.locator('#toast')).toContainText('先学习前一单元');
  await expect(page.locator('[data-skill="listen"]')).toBeDisabled();await page.locator('[data-action="week-guide"][data-kind="drill"]').click();await expect(page.getByRole('heading',{name:'用背景衬托一次变化'})).toBeVisible();await expect(page.getByRole('button',{name:'开始四步练习'})).toBeDisabled();
  await page.goto('/#year');await page.selectOption('#year-week','49');await expect(page.locator('.rules').filter({has:page.locator('[data-action="week-guide"]')})).toContainText('综合复盘周少学新词');
});
test('周指南 A1 / A2 / B1 / 复盘视图在 320px 无横向溢出',async({page})=>{
  await page.setViewportSize({width:320,height:840});await page.goto('/#year');for(const week of ['1','13','29','52']){await page.selectOption('#year-week',week);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
