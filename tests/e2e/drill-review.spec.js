const {test,expect}=require('@playwright/test');
const L=require('../../miniprogram/lib/learning');
async function makeMistakes(page,two=false){
  const p=L.drillPacks[0];await page.goto('/#drill/'+p.id);await page.getByRole('button',{name:'开始四步练习'}).click();
  for(const [i,q] of p.questions.entries()){
    if(q.kind==='choice')await page.locator('[data-action="drill-answer"]').filter({hasText:i===0&&two?'estoy':q.answers[0]}).click();
    else{await page.fill('#drill-answer',i===1?'esta':q.answers[0]);await page.getByRole('button',{name:'检查答案',exact:true}).click();}
    await page.getByRole('button',{name:i===3?'保存并查看结果':'下一步'}).click();
  }
}
test('集中订正实际错项、限次重排和首次统计，未达标包仍需完整重练',async({page})=>{
  await makeMistakes(page,true);await expect(page.locator('.result-score')).toHaveText('50%');
  await page.getByRole('button',{name:'返回分级练习'}).click();await page.getByRole('button',{name:'集中订正'}).click();await page.getByRole('button',{name:'开始集中订正'}).click();
  await page.locator('[data-action="review-answer"]').filter({hasText:'soy'}).click();await page.getByRole('button',{name:'下一项'}).click();
  await page.fill('#review-answer','esta');await page.getByRole('button',{name:'检查订正'}).click();await page.getByRole('button',{name:'下一项'}).click();
  await page.fill('#review-answer','está');await page.locator('#review-answer').press('Enter');await page.getByRole('button',{name:'查看订正结果'}).click();
  await expect(page.locator('.result-score')).toHaveText('50%');
  const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(s.drillMistakes).toEqual({});expect(s.drills['a1-place'].bestScore).toBe(50);expect(s.drills['a1-place'].attempts).toBe(1);expect(s.days).toEqual({});
  await page.getByRole('button',{name:'返回分级练习'}).click();await expect(page.locator('[data-id="a1-routine"]').first()).toContainText('预览');
});
test('集中订正写入失败保留答案与错项，重试后才显示已移除',async({page})=>{
  await makeMistakes(page);await page.goto('/#drill-review');await page.getByRole('button',{name:'开始集中订正'}).click();
  await page.fill('#review-answer','está');await page.evaluate(()=>{window.reviewWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('quota');};});
  await page.getByRole('button',{name:'检查订正'}).click();await expect(page.locator('.feedback')).toHaveCount(0);await expect(page.locator('#review-answer')).toHaveValue('está');
  expect(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('hola-learning-v1')).drillMistakes))).toHaveLength(1);
  await page.evaluate(()=>{Storage.prototype.setItem=window.reviewWrite;});await page.getByRole('button',{name:'检查订正'}).click();await expect(page.locator('.feedback')).toContainText('错项已移除');await page.getByRole('button',{name:'查看订正结果'}).click();await expect(page.locator('.result-score')).toHaveText('100%');
});
test('表达自查、版本恢复、撤销修改与备份保存，存储失败不会换版本',async({page})=>{
  await page.goto('/#drill/a1-place');await page.fill('#drill-draft','Soy estudiante.');await page.getByRole('button',{name:'保存表达草稿'}).click();
  await page.locator('[data-drill-check="0"]').check();await page.locator('[data-drill-check="2"]').check();
  await page.fill('#drill-draft','Estoy en casa.');await expect(page.locator('[data-drill-check="0"]')).toBeDisabled();await page.getByRole('button',{name:'撤销未保存修改'}).click();
  await expect(page.locator('#drill-draft')).toHaveValue('Soy estudiante.');await expect(page.locator('[data-drill-check="0"]')).toBeChecked();
  await page.fill('#drill-draft','Estoy en casa.');await page.getByRole('button',{name:'保存表达草稿'}).click();await expect(page.locator('#drill-draft-status')).toContainText('保存版本 2');await expect(page.locator('[data-drill-check="0"]')).not.toBeChecked();
  await page.evaluate(()=>{window.draftWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('quota');};});await page.getByRole('button',{name:'恢复上一保存版本'}).click();await expect(page.locator('#drill-draft')).toHaveValue('Estoy en casa.');
  await page.evaluate(()=>{Storage.prototype.setItem=window.draftWrite;});await page.getByRole('button',{name:'恢复上一保存版本'}).click();await expect(page.locator('#drill-draft')).toHaveValue('Soy estudiante.');await expect(page.locator('#drill-draft-status')).toContainText('保存版本 3');
  await page.locator('[data-drill-check="1"]').check();await page.reload();await expect(page.locator('[data-drill-check="1"]')).toBeChecked();
  const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('hola-learning-v1')));expect(s.drillDrafts['a1-place'].previousText).toBe('Estoy en casa.');expect(s.drillDrafts['a1-place'].checks).toEqual([1]);expect(s.drills).toEqual({});
  await page.goto('/#progress');page.once('dialog',d=>d.accept());const chooserPromise=page.waitForEvent('filechooser');await page.getByRole('button',{name:'导入备份',exact:true}).click();const chooser=await chooserPromise;await chooser.setFiles({name:'revision.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});await expect(page.locator('#toast')).toContainText('学习记录已导入');await page.goto('/#drill/a1-place');await expect(page.locator('#drill-draft')).toHaveValue('Soy estudiante.');await expect(page.locator('[data-drill-check="1"]')).toBeChecked();
});
