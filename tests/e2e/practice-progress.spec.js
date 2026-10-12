const {test,expect}=require('@playwright/test');const L=require('../../miniprogram/lib/learning');
test('首页推荐按实际练习推进，进度页分开显示规则、错项和表达',async({page})=>{
  await page.goto('/');await expect(page.locator('.practice-advice')).toContainText('我是谁');await page.getByRole('button',{name:'继续建议练习'}).click();await page.getByRole('button',{name:'开始四步练习'}).click();
  const p=L.drillPacks[0];for(const [i,q] of p.questions.entries()){if(q.kind==='choice')await page.locator('[data-action="drill-answer"]').filter({hasText:q.answers[0]}).click();else{await page.fill('#drill-answer',i===1?'wrong':q.answers[0]);await page.getByRole('button',{name:'检查答案',exact:true}).click();}await page.getByRole('button',{name:i===3?'保存并查看结果':'下一步'}).click();}
  await page.goto('/#today');await expect(page.locator('.practice-advice')).toContainText('先订正 1 个错项');await page.getByRole('button',{name:'去集中订正'}).click();await page.getByRole('button',{name:'开始集中订正'}).click();await page.fill('#review-answer','está');await page.getByRole('button',{name:'检查订正'}).click();await page.goto('/#today');await expect(page.locator('.practice-advice')).toContainText('把每天的动作说出来');
  await page.goto('/#progress');await expect(page.locator('.practice-level-card[data-level="A1"]')).toContainText('规则题达标 1 / 6');await expect(page.locator('.practice-level-card[data-level="A2"]')).toContainText('规则题达标 0 / 6');await expect(page.locator('.stat-value').nth(2)).toContainText('0');
  await page.locator('.practice-level-card[data-level="B2"]').getByRole('button',{name:'查看本级练习'}).click();await expect(page.locator('[data-action="drills-level"][data-level="B2"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.drill-card')).toHaveCount(6);
});
test('练习进度默认无虚构完成数，320px 看板无横向溢出',async({page})=>{
  await page.setViewportSize({width:320,height:840});await page.goto('/#progress');await expect(page.locator('.practice-progress')).toContainText('规则题达标 0 / 24');await expect(page.locator('.practice-progress')).toContainText('已保存表达 0 份');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
