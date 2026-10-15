const { test, expect } = require('@playwright/test');
const L = require('../../miniprogram/lib/learning');
const order = require('../../miniprogram/data/drill-path').order;

test('分级列表按教学顺序排列，步骤跳转和阅读依据保留草稿与键盘焦点', async ({ page }) => {
  await page.goto('/#drills');
  expect(await page.locator('.drill-card [data-action="drill"]').evaluateAll(nodes => nodes.map(n => n.dataset.id))).toEqual(order.slice(0, 6));
  await page.locator('[data-action="drill"][data-id="a1-place"]').click();
  await page.fill('#drill-draft', 'Soy estudiante. Mi libro está aquí.');
  for (const section of ['prepare','read','practice','express']) {
    await page.locator(`.study-steps [data-section="${section}"]`).click();
    await expect(page.locator('#drill-' + section)).toBeFocused();
    await expect(page.locator('#drill-draft')).toHaveValue('Soy estudiante. Mi libro está aquí.');
  }
  const evidence = page.getByRole('button', { name: '我想好了，看原文依据' });
  await evidence.click();
  await expect(page.locator('.reading-evidence')).toContainText(L.drillPacks[0].readingGuide[1]);
  await expect(page.getByRole('button', { name: '收起原文依据' })).toBeFocused();
  await page.getByRole('button', { name: '收起原文依据' }).press('Enter');
  await expect(page.locator('.reading-evidence')).toHaveCount(0);
  await page.getByRole('button', { name: '保存表达草稿' }).click();
  await page.reload();
  await expect(page.locator('#drill-draft')).toHaveValue('Soy estudiante. Mi libro está aquí.');
  await expect(page.locator('.reading-evidence')).toHaveCount(0);
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('hola-learning-v1')));
  expect(state.drills).toEqual({}); expect(state.days).toEqual({});
  expect(Object.keys(state.drillDrafts)).toEqual(['a1-place']);
});

test('四级文章可逐段阅读和核对依据，预览不解锁或写入记录', async ({ page }) => {
  for (const pack of L.drillPacks.filter(p => p.article)) {
    await page.goto('/#drill/' + pack.id);
    await expect(page.locator('.bridge-reading')).toHaveCount(0);
    await page.getByRole('button', { name: '试读本级长一点的文章' }).click();
    for (const paragraph of pack.article.paragraphs) await expect(page.getByText(paragraph, { exact: true })).toBeVisible();
    await expect(page.locator('.article-evidence')).toHaveCount(0);
    await page.getByRole('button', { name: '看文章依据与解释' }).click();
    for (const [, evidence] of pack.article.checks) await expect(page.locator('.article-evidence')).toContainText(evidence);
    await page.getByRole('button', { name: '去写自己的回答' }).click();
    await expect(page.locator('#drill-express')).toBeFocused();
    await expect(page.locator('#drill-draft')).toBeDisabled();
    await expect(page.getByRole('button', { name: '开始四步练习' })).toBeDisabled();
    expect(await page.evaluate(() => localStorage.getItem('hola-learning-v1'))).toBeNull();
    await page.reload(); await expect(page.locator('.bridge-reading')).toHaveCount(0);
  }
});

test('学习按钮留出空隙，320/768/1440 宽度的阅读与文章无溢出', async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['drills','grammar','foundations','year','first-month','drill/a1-place','drill/b1-anterior']) {
      await page.goto('/#' + route);
      if (route.startsWith('drill/')) {
        await page.getByRole('button', { name: '看词组解释', exact: true }).click();
        await page.getByRole('button', { name: '练一段自己的对话', exact: true }).click();
        if (route.endsWith('b1-anterior')) await page.getByRole('button', { name: '试读本级长一点的文章' }).click();
        const boxes = await page.locator('.study-steps .btn').evaluateAll(nodes => nodes.map(n => { const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom}; }));
        expect(boxes[1].x - boxes[0].right).toBeGreaterThanOrEqual(14);
        if (width === 320) expect(boxes[2].y - boxes[0].bottom).toBeGreaterThanOrEqual(14);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route + ' at ' + width).toBe(true);
    }
  }
});

test('Pages 子路径原样加载单文件，步骤和文章可用且旧备份不被预览修改', async ({ page, context }) => {
  const fs = require('node:fs');
  const path = require('node:path');
  const html = fs.readFileSync(path.resolve(__dirname, '../../dist/pages/index.html'), 'utf8');
  expect(html).toBe(fs.readFileSync(path.resolve(__dirname, '../../dist/hola-spanish.html'), 'utf8'));
  const entry = 'http://127.0.0.1:4173/spanish/';
  await context.route(entry, route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
  await context.setOffline(true);
  const errors = [], requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.resourceType() !== 'document') requests.push(r.url()); });
  await page.goto(entry + '#drill/a1-place');
  await page.locator('[data-section="express"]').click();
  await page.fill('#drill-draft', 'Soy estudiante.');
  await page.getByRole('button', { name: '保存表达草稿', exact: true }).click();
  const saved = await page.evaluate(() => localStorage.getItem('hola-learning-v1'));
  await page.goto(entry + '#drill/b1-anterior');
  await page.getByRole('button', { name: '试读本级长一点的文章' }).click();
  await page.getByRole('button', { name: '看文章依据与解释' }).click();
  await expect(page.locator('.article-evidence')).toContainText('专业文章仍需帮助');
  expect(await page.evaluate(() => localStorage.getItem('hola-learning-v1'))).toBe(saved);
  await page.goto(entry + '#drill/a1-place'); await page.reload();
  await expect(page.locator('#drill-draft')).toHaveValue('Soy estudiante.');
  expect(errors).toEqual([]); expect(requests).toEqual([]);
});
