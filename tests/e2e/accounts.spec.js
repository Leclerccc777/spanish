const { test, expect } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { createAccounts } = require('../../server/accounts');
const L = require('../../miniprogram/lib/learning');
let accounts, server, api, folder;
const password = 'learn-spanish-123';
test.beforeAll(async () => {
  folder = fs.mkdtempSync(path.join(os.tmpdir(), 'hola-account-e2e-'));
  accounts = createAccounts({ file: path.join(folder, 'db.sqlite') });
  server = http.createServer((req, res) => accounts.handler(req, res));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  api = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => { await new Promise(resolve => server.close(resolve)); accounts.close(); fs.rmSync(folder, { recursive: true, force: true }); });
async function connect(page) {
  // Test configuration only: the browser still uses the real account client and real HTTP API.
  await page.addInitScript(() => Object.defineProperty(window, 'HolaAccountApi', { get: () => '/api', set: () => {} }));
  await page.route('**/api/**', async route => {
    const req = route.request();
    const response = await page.request.fetch(api + new URL(req.url()).pathname, { method: req.method(), headers: { 'Content-Type': 'application/json', ...(req.headers().authorization ? { Authorization: req.headers().authorization } : {}) }, data: req.postData() || undefined });
    await route.fulfill({ status: response.status(), contentType: 'application/json', body: await response.body() });
  });
}
async function auth(page, username, mode) {
  await page.locator('#account-username').fill(username);
  await page.locator('#account-password').fill(password);
  await page.locator(`#account-form button[value="${mode}"]`).click();
  await expect(page.getByRole('button', { name: '退出账号', exact: true })).toBeVisible();
}
const username = () => 'student_' + randomUUID().replaceAll('-', '').slice(0, 14);
test('账号注册复制旧记录、自动同步、另一设备登录与退出隔离', async ({ page, browser }) => {
  await connect(page); await page.goto('/#progress');
  await page.getByRole('button', { name: '10 个词', exact: true }).click();
  const name = username(); await auth(page, name, 'register');
  await page.getByRole('button', { name: '3 个词', exact: true }).click();
  await expect(page.locator('#account-status')).toHaveText('已与账号同步');
  const context = await browser.newContext(), other = await context.newPage(); await connect(other); await other.goto('http://127.0.0.1:4173/#progress');
  await auth(other, name, 'login');
  expect(await other.evaluate(() => { const session = JSON.parse(localStorage.getItem('hola-account-session-v1')); return JSON.parse(localStorage.getItem('hola-account-progress-v1:' + session.user.id)).progress.goal; })).toBe(3);
  await page.getByRole('button', { name: '退出账号', exact: true }).click();
  await expect(page.locator('#account-form')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('hola-learning-v1')).goal)).toBe(10);
  await context.close();
});
test('离线练习保留，重连同步；冲突选择云端前保留本机备份', async ({ page, browser }) => {
  await connect(page); await page.goto('/#progress'); const name = username(); await auth(page, name, 'register');
  const context = await browser.newContext(), other = await context.newPage(); await connect(other); await other.goto('http://127.0.0.1:4173/#progress'); await auth(other, name, 'login');
  await page.route('**/api/progress', route => route.abort());
  await page.getByRole('button', { name: '10 个词', exact: true }).click();
  await expect(page.locator('#account-status')).toContainText('本机');
  await other.getByRole('button', { name: '3 个词', exact: true }).click(); await expect(other.locator('#account-status')).toHaveText('已与账号同步');
  await page.unroute('**/api/progress');
  await page.getByRole('button', { name: '立即同步', exact: true }).click();
  await expect(page.locator('#account-status')).toContainText('同步冲突');
  await page.getByText('两台设备的进度不一致？', { exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '使用云端进度', exact: true }).click();
  await expect(page.locator('#account-status')).toContainText('已使用云端进度');
  const values = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('hola-account-session-v1')), key = 'hola-account-progress-v1:' + s.user.id; return [JSON.parse(localStorage.getItem(key)).progress.goal, JSON.parse(localStorage.getItem(key + ':before-replace')).progress.goal]; });
  expect(values).toEqual([3, 10]); await context.close();
});
test('注册带走表达草稿，旧备份仍可导出，窄屏账号界面可用', async ({ page }) => {
  const seed = L.emptyState(); L.saveDrillDraft(seed, 'a1-place', 'Soy estudiante. Mi libro está en la mesa.');
  await connect(page); await page.goto('/'); await page.evaluate(seed => localStorage.setItem('hola-learning-v1', JSON.stringify(seed)), seed);
  await page.goto('/#progress'); await page.reload();
  await page.setViewportSize({ width: 320, height: 840 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await auth(page, username(), 'register');
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: '导出备份', exact: true }).click(); const download = await downloadPromise;
  const data = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  expect(data.drillDrafts['a1-place'].text).toContain('Soy estudiante'); expect(JSON.stringify(data)).not.toContain(password);
  await page.goto('/#drill/a1-place'); await expect(page.locator('#drill-draft')).toHaveValue(seed.drillDrafts['a1-place'].text);
});
