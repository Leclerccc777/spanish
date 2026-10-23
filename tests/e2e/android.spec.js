const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const entry = 'https://appassets.androidplatform.net/assets/index.html';
const key = 'hola-learning-v1';

test('安卓主导航和内部课程链接留在应用内', async ({ page }) => {
  await page.goto(entry + '#today');
  for (const target of ['words', 'grammar', 'library', 'progress', 'today']) {
    await page.locator(`nav a[href="#${target}"]`).click();
    await expect(page).toHaveURL(entry + '#' + target);
    await expect(page.locator(`nav a[href="#${target}"]`)).toHaveAttribute('aria-current', 'page');
  }
  await page.getByRole('link', { name: '全部课程 →', exact: true }).click();
  await expect(page).toHaveURL(entry + '#grammar');
  expect(await page.evaluate(() => window.nativeReferences)).toEqual([]);
});

// Browser-side bridge contract, not a substitute for Android device testing.
test.beforeEach(async ({ context }) => {
  test.setTimeout(120000);
  await context.route(entry, route => route.fulfill({
    contentType: 'text/html; charset=utf-8',
    headers: { 'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'" },
    body: fs.readFileSync(path.resolve(__dirname, '../../dist/hola-spanish.html'))
  }));
  await context.addInitScript(() => {
    window.nativeExports = []; window.nativeReferences = [];
    window.HolaAndroid = {
      saveBackup: (json, filename) => window.nativeExports.push({ json, filename }),
      openReference: url => window.nativeReferences.push(url)
    };
  });
  await context.setOffline(true);
});

test('安卓备份接口沿用旧记录，导入和损坏保护有效', async ({ page }) => {
  await page.goto(entry + '#progress');
  await page.locator('[data-action="goal"][data-goal="3"]').click();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  await page.getByRole('button', { name: '导出备份', exact: true }).click();
  const exported = await page.evaluate(() => window.nativeExports[0]);
  expect(JSON.parse(exported.json)).toEqual(saved);
  expect(exported.filename).toMatch(/^hola-\d{4}-\d{2}-\d{2}\.json$/);
  await page.locator('[data-action="goal"][data-goal="10"]').click();
  page.once('dialog', dialog => dialog.accept());
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '导入备份', exact: true }).click();
  await (await chooser).setFiles({ name: exported.filename, mimeType: 'application/json', buffer: Buffer.from(exported.json) });
  await expect(page.locator('#toast')).toContainText('学习记录已导入');
  await page.reload();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)).toEqual(saved);
  await page.evaluate(key => localStorage.setItem(key, 'broken-android-record'), key);
  await page.reload();
  await page.getByRole('button', { name: '导出备份', exact: true }).click();
  await expect(page.locator('#toast')).toContainText('暂不导出空备份');
  expect(await page.evaluate(() => window.nativeExports.length)).toBe(0);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe('broken-android-record');
});

test('安卓返回保护草稿，外链交给系统浏览器，内置音频可播放', async ({ page }) => {
  await page.goto(entry + '#drill/a1-place');
  await page.fill('#drill-draft', 'Soy estudiante.');
  page.once('dialog', dialog => dialog.dismiss());
  expect(await page.evaluate(() => window.HolaNativeBack())).toBe(true);
  await expect(page.locator('#drill-draft')).toHaveValue('Soy estudiante.');
  await page.getByRole('button', { name: '保存表达草稿', exact: true }).click();
  expect(await page.evaluate(() => window.HolaNativeBack())).toBe(false);
  await page.getByRole('button', { name: '听发音', exact: true }).first().click();
  await expect(page.locator('#audio-status')).toContainText('正在播放内置西语合成音');
  expect(await page.evaluate(() => Object.keys(window.HolaAudioClips).length)).toBe(6788);
  await page.goto(entry + '#library');
  const link = page.locator('a[target="_blank"]').first();
  const url = await link.getAttribute('href');
  await link.click();
  expect(await page.evaluate(() => window.nativeReferences)).toEqual([url]);
  expect(page.url()).toBe(entry + '#library');
  await page.locator('#account-trigger').click();
  expect(await page.evaluate(() => window.HolaNativeBack())).toBe(true);
  await expect(page.locator('dialog')).not.toBeVisible();
});
