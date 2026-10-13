const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const L = require('../../miniprogram/lib/learning');
const fileURL = pathToFileURL(path.resolve(__dirname, '../../dist/hola-spanish.html')).href;
const directFile = process.env.HOLA_STANDALONE_FILE === '1';
const entryURL = directFile ? fileURL : 'http://127.0.0.1:4173/hola-spanish.html';
const KEY = 'hola-learning-v1';

test.beforeEach(async ({ context }) => {
  test.setTimeout(120000);
  // Managed Chromium may block file:// by policy. Serve the exact file via a
  // local intercepted navigation; HOLA_STANDALONE_FILE=1 exercises file://.
  if (!directFile) await context.route(entryURL, route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: fs.readFileSync(path.resolve(__dirname, '../../dist/hola-spanish.html'), 'utf8') }));
  await context.setOffline(true);
});

test('单文件无资源依赖，真实练习、草稿重载、6500 词搜索及备份往返', async ({ page }) => {
  test.setTimeout(120000);
  const errors = [], requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.resourceType() !== 'document') requests.push(r.url()); });
  await page.goto(entryURL + '#drill/a1-place');
  await page.getByRole('button', { name: '看词组解释', exact: true }).click();
  await expect(page.locator('.reading-words')).toContainText('en mi habitación');
  await page.getByRole('button', { name: '练一段自己的对话', exact: true }).click();
  await expect(page.locator('.personal-dialogue')).toContainText('换到办公室');
  await page.getByRole('button', { name: '开始四步练习' }).click();
  const pack = L.drillPacks[0];
  for (const [index, q] of pack.questions.entries()) {
    if (q.kind === 'choice') await page.getByRole('button', { name: q.answers[0], exact: true }).click();
    else { await page.fill('#drill-answer', q.answers[0]); await page.getByRole('button', { name: '检查答案', exact: true }).click(); }
    await page.getByRole('button', { name: index === 3 ? '保存并查看结果' : '下一步' }).click();
  }
  await expect(page.locator('.result-score')).toHaveText('100%');
  await page.getByRole('button', { name: '写自己的表达' }).click();
  const draft = 'Soy estudiante. En mi oficina hay una mesa. Mi teléfono está en la mesa.';
  await page.fill('#drill-draft', draft);
  await page.getByRole('button', { name: '保存表达草稿', exact: true }).click();
  await page.reload(); await expect(page.locator('#drill-draft')).toHaveValue(draft);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);
  expect(saved.drills['a1-place'].bestScore).toBe(100); expect(saved.days).toEqual({});
  await page.goto(entryURL + '#bank');
  await page.getByRole('button', { name: '全部', exact: true }).click();
  await expect(page.locator('#bank-count')).toContainText('6500 个去重条目');
  await expect(page.locator('#app')).toContainText('6500');
  const search = page.locator('#bank-search');
  await search.fill('biblioteca');
  await expect(page.locator('#app')).toContainText('biblioteca');
  await page.goto(entryURL + '#progress');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出备份', exact: true }).click();
  const download = await downloading;
  expect(JSON.parse(fs.readFileSync(await download.path(), 'utf8'))).toEqual(saved);
  await page.locator('[data-action="goal"][data-goal="3"]').click();
  page.once('dialog', d => d.accept());
  const choosing = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '导入备份', exact: true }).click();
  const chooser = await choosing;
  await chooser.setFiles({ name: 'progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(saved)) });
  await expect(page.locator('#toast')).toContainText('学习记录已导入');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY)).toEqual(saved);
  expect(errors).toEqual([]); expect(requests).toEqual([]);
});

test('单文件中的损坏记录不会被学习保存或导出覆盖', async ({ page }) => {
  await page.goto(entryURL + '#progress');
  await page.evaluate(key => localStorage.setItem(key, 'broken-file-record'), KEY);
  await page.reload();
  await page.getByRole('button', { name: '导出备份', exact: true }).click();
  await expect(page.locator('#toast')).toContainText('暂不导出空备份');
  await page.goto(entryURL + '#drill/a1-place');
  await page.getByRole('button', { name: '看词组解释', exact: true }).click();
  await page.getByRole('button', { name: '练一段自己的对话', exact: true }).click();
  await page.fill('#drill-draft', 'Soy estudiante.');
  await page.getByRole('button', { name: '保存表达草稿', exact: true }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), KEY)).toBe('broken-file-record');
});
