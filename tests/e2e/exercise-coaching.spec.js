const { test, expect } = require('@playwright/test');
const L = require('../../miniprogram/lib/learning');

test('分级提示默认收起，输入不丢失，重音反馈准确且翻题后收起', async ({ page }) => {
  await page.goto('/#drill/a1-place');
  await expect(page.locator('.reading')).toContainText(L.drillPacks[0].approach);
  await expect(page.locator('.reading')).toContainText(L.drillPacks[0].transfer);
  await page.getByRole('button', { name: '开始四步练习' }).click();
  const hint = L.drillPacks[0].questions[0].hint;
  await expect(page.getByText(hint, { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '需要一点提示' }).click();
  await expect(page.getByText(hint, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('hola-learning-v1'))).toBeNull();
  await page.locator('[data-action="drill-answer"][data-answer="soy"]').click();
  await expect(page.getByRole('button', { name: '需要一点提示' })).toHaveCount(0);
  await page.getByRole('button', { name: '下一步' }).click();
  await page.fill('#drill-answer', 'esta');
  await page.getByRole('button', { name: '需要一点提示' }).click();
  await expect(page.locator('#drill-answer')).toHaveValue('esta');
  await page.getByRole('button', { name: '收起思路提示' }).click();
  await expect(page.locator('#drill-answer')).toHaveValue('esta');
  await page.getByRole('button', { name: '检查答案', exact: true }).click();
  await expect(page.locator('.feedback')).toContainText('再对照答案检查');
  await expect(page.locator('.feedback')).toContainText('重音');
  await page.getByRole('button', { name: '下一步' }).click();
  await expect(page.getByRole('button', { name: '需要一点提示' })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#drill-answer')).toHaveValue('');
  expect(await page.evaluate(() => localStorage.getItem('hola-learning-v1'))).toBeNull();
});

test('名词和各级订正沿用同一提示，查看不会修改学习记录', async ({ page }) => {
  await page.goto('/#noun/w24');
  await page.getByRole('button', { name: '开始三步练习' }).click();
  await page.getByRole('button', { name: '需要一点提示' }).click();
  await expect(page.getByText(L.nounLessons.find(n => n.id === 'w24').questions[0].hint, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('hola-learning-v1'))).toBeNull();

  const state = L.emptyState();
  for (const pack of L.drillPacks) {
    const answers = pack.questions.map(q => q.answers[0]); answers[1] = '错误';
    L.gradeDrill(state, pack.id, answers);
  }
  await page.evaluate(s => localStorage.setItem('hola-learning-v1', JSON.stringify(s)), state);
  for (const level of ['A1', 'A2', 'B1', 'B2']) {
    await page.goto('/#drill-review'); await page.reload();
    await page.getByRole('button', { name: level, exact: true }).click();
    await page.getByRole('button', { name: '开始集中订正' }).click();
    const question = L.drillReviewQueue(state, level)[0];
    await page.fill('#review-answer', '想一想');
    await page.getByRole('button', { name: '需要一点提示' }).click();
    await expect(page.getByText(question.hint, { exact: true })).toBeVisible();
    await expect(page.locator('#review-answer')).toHaveValue('想一想');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('hola-learning-v1')))).toEqual(state);
  }
});

test('24 包中文大意可选展开，换包或刷新收起，作答时只展示西语', async ({ page }) => {
  test.setTimeout(180000);
  for (const pack of L.drillPacks) {
    await page.goto('/#drill/' + pack.id);
    await expect(page.locator('.reading-meaning')).toHaveCount(0);
    await page.getByRole('button', { name: '看中文大意', exact: true }).click();
    await expect(page.locator('.reading-meaning')).toHaveText(pack.meaning);
    await expect(page.getByText(pack.reading, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '收起中文大意', exact: true }).click();
    await expect(page.locator('.reading-meaning')).toHaveCount(0);
  }
  expect(await page.evaluate(() => localStorage.getItem('hola-learning-v1'))).toBeNull();
  await page.goto('/#drill/a1-place');
  await page.getByRole('button', { name: '看中文大意', exact: true }).click();
  await page.reload(); await expect(page.locator('.reading-meaning')).toHaveCount(0);
  await page.getByRole('button', { name: '看中文大意', exact: true }).click();
  await page.getByRole('button', { name: '开始四步练习' }).click();
  await expect(page.locator('.reading-meaning')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '看中文大意', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('hola-learning-v1'))).toBeNull();
});

test('24 包词组解释、个人对话及情景迁移可预览，保留输入与旧进度', async ({ page }) => {
  test.setTimeout(300000);
  const saved = L.emptyState();
  L.gradeDrill(saved, 'a1-place', L.drillPacks[0].questions.map(q => q.answers[0]));
  L.saveDrillDraft(saved, 'a1-place', 'Soy estudiante.');
  await page.goto('/');
  await page.evaluate(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), { key: 'hola-learning-v1', saved });
  await page.reload();
  if (test.info().project.name === 'mobile') await page.setViewportSize({ width: 320, height: 720 });
  for (const pack of L.drillPacks) {
    await page.goto('/#drill/' + pack.id);
    await expect(page.locator('.reading-words')).toHaveCount(0);
    await expect(page.locator('.personal-dialogue')).toHaveCount(0);
    const unlocked = L.drillUnlocked(saved, pack.id);
    await expect(page.locator('#drill-draft')).toBeEnabled({ enabled: unlocked });
    if (unlocked) await page.fill('#drill-draft', '自己的回答，尚未保存');
    await page.getByRole('button', { name: '看词组解释', exact: true }).click();
    const wordText = await page.locator('.reading-words').textContent();
    for (const [phrase, meaning, note] of pack.words) {
      expect(wordText).toContain(phrase); expect(wordText).toContain(meaning); expect(wordText).toContain(note);
    }
    await page.getByRole('button', { name: '练一段自己的对话', exact: true }).click();
    const dialogueText = await page.locator('.personal-dialogue').textContent();
    expect(dialogueText).toContain(pack.dialogue.personalize);
    expect(dialogueText).toContain(pack.newScene.prompt); expect(dialogueText).toContain(pack.newScene.check);
    if (unlocked) await expect(page.locator('#drill-draft')).toHaveValue('自己的回答，尚未保存');
    await page.getByRole('button', { name: '收起词组解释', exact: true }).click();
    await page.getByRole('button', { name: '收起个人对话', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('hola-learning-v1')))).toEqual(saved);
  await page.goto('/#drill/a1-place');
  await page.getByRole('button', { name: '看词组解释', exact: true }).click();
  await page.getByRole('button', { name: '练一段自己的对话', exact: true }).click();
  await page.reload();
  await expect(page.locator('.reading-words')).toHaveCount(0);
  await expect(page.locator('.personal-dialogue')).toHaveCount(0);
  await expect(page.locator('#drill-draft')).toHaveValue('Soy estudiante.');
  await page.getByRole('button', { name: '开始四步练习' }).click();
  await expect(page.getByRole('button', { name: '看词组解释', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '练一段自己的对话', exact: true })).toHaveCount(0);
});
