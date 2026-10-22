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
async function details(page) {
  await page.locator('#account-trigger').click();
  await page.getByRole('menuitem', { name: '账号详情', exact: true }).click();
  await expect(page.getByRole('heading', { name: '账号详情', exact: true })).toBeVisible();
}
async function logout(page) {
  await page.locator('#account-trigger').click();
  await page.getByRole('menuitem', { name: '退出登录', exact: true }).click();
  await expect(page.getByRole('button', { name: '登录或注册账号', exact: true })).toBeVisible();
}
async function auth(page, username, mode, showDetails = true) {
  await page.getByRole('button', { name: '登录或注册账号', exact: true }).click();
  await page.locator('#account-username').fill(username);
  await page.locator('#account-password').fill(password);
  await page.locator(`#account-form button[value="${mode}"]`).click();
  await expect(page.locator('#account-dialog')).not.toBeVisible();
  await expect(page.locator('#account-trigger')).toHaveAttribute('aria-label', '账号菜单：' + username);
  if (showDetails) await details(page);
}
const username = () => 'student_' + randomUUID().replaceAll('-', '').slice(0, 14);
test('账号注册复制旧记录、自动同步、另一设备登录与退出隔离', async ({ page, browser }) => {
  await connect(page); await page.goto('/#progress');
  await page.getByRole('button', { name: '10 个词', exact: true }).click();
  const name = username(); await auth(page, name, 'register');
  await page.goto('/#progress'); await page.getByRole('button', { name: '3 个词', exact: true }).click();
  await expect(page.locator('#account-status')).toHaveText('已与账号同步');
  const context = await browser.newContext(), other = await context.newPage(); await connect(other); await other.goto('http://127.0.0.1:4173/#progress');
  await auth(other, name, 'login');
  expect(await other.evaluate(() => { const session = JSON.parse(localStorage.getItem('hola-account-session-v1')); return JSON.parse(localStorage.getItem('hola-account-progress-v1:' + session.user.id)).progress.goal; })).toBe(3);
  await logout(page);
  await page.getByRole('button', { name: '登录或注册账号', exact: true }).click();
  await expect(page.locator('#account-form')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('hola-learning-v1')).goal)).toBe(10);
  await context.close();
});
test('离线练习保留，重连同步；冲突选择云端前保留本机备份', async ({ page, browser }) => {
  await connect(page); await page.goto('/#progress'); const name = username(); await auth(page, name, 'register');
  const context = await browser.newContext(), other = await context.newPage(); await connect(other); await other.goto('http://127.0.0.1:4173/#progress'); await auth(other, name, 'login');
  await page.route('**/api/progress', route => route.abort());
  await page.goto('/#progress'); await page.getByRole('button', { name: '10 个词', exact: true }).click();
  await expect(page.locator('#account-status')).toContainText('本机');
  await other.goto('/#progress'); await other.getByRole('button', { name: '3 个词', exact: true }).click(); await expect(other.locator('#account-status')).toHaveText('已与账号同步');
  await page.unroute('**/api/progress');
  await details(page); await page.getByRole('button', { name: '立即同步', exact: true }).click();
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
test('头像打开登录弹窗，未开通服务时如实提示，关闭后草稿和焦点保留', async ({ page }) => {
  await page.goto('/#drill/a1-place');
  await page.locator('#drill-draft').fill('Soy estudiante. Texto sin guardar.');
  const before = await page.evaluate(() => localStorage.getItem('hola-learning-v1'));
  await page.getByRole('button', { name: '登录或注册账号', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#account-auth-status')).toContainText('尚未开通');
  await expect(page.locator('#account-password')).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.locator('#account-trigger')).toBeFocused();
  await expect(page.locator('#drill-draft')).toHaveValue('Soy estudiante. Texto sin guardar.');
  expect(await page.evaluate(() => localStorage.getItem('hola-learning-v1'))).toBe(before);
});
test('登录后头像菜单支持键盘和点击外部关闭，取消退出不丢未保存表达', async ({ page }) => {
  await connect(page); await page.goto('/'); const name = username(); await auth(page, name, 'register', false);
  await page.goto('/#drill/a1-place'); await page.locator('#drill-draft').fill('Texto que todavía no he guardado.');
  await page.locator('#account-trigger').focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitem', { name: '账号详情', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown'); await expect(page.getByRole('menuitem', { name: '退出登录', exact: true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.locator('#account-trigger')).toBeFocused();
  await expect(page.locator('#account-menu')).not.toBeVisible();
  await page.locator('#account-trigger').click(); await page.locator('.content').click({ position: { x: 8, y: 8 } });
  await expect(page.locator('#account-menu')).not.toBeVisible();
  await page.locator('#account-trigger').click(); page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('menuitem', { name: '退出登录', exact: true }).click();
  await expect(page.locator('#drill-draft')).toHaveValue('Texto que todavía no he guardado.');
  await expect(page.locator('#account-trigger')).toHaveAttribute('aria-label', '账号菜单：' + name);
});
test('固定编号跨设备相同，登录自动回到已同步的分级草稿', async ({ page, browser }) => {
  await connect(page); await page.goto('/'); const name = username(); await auth(page, name, 'register', false);
  await page.goto('/#drill/a1-place'); await page.locator('#drill-draft').fill('Soy estudiante. Mi libro está en la mesa.');
  await page.getByRole('button', { name: '保存表达草稿', exact: true }).click();
  await details(page); await page.getByRole('button', { name: '立即同步', exact: true }).click();
  await expect(page.locator('#account-status')).toHaveText('已与账号同步');
  const id = await page.locator('.account-user-id').textContent();
  const context = await browser.newContext(), other = await context.newPage();
  try {
    await connect(other); await other.goto('http://127.0.0.1:4173/'); await auth(other, name, 'login', false);
    await expect(other).toHaveURL(/#drill\/a1-place$/);
    await expect(other.locator('#drill-draft')).toHaveValue('Soy estudiante. Mi libro está en la mesa.');
    await details(other); await expect(other.locator('.account-user-id')).toHaveText(id);
    await expect(other.getByRole('button', { name: '接着上次的位置学习 →', exact: true })).toBeVisible();
  } finally { await context.close(); }
});
test('A 账号继续第七关，B 账号继续 A2，详情统计按各自记录展示', async ({ page }) => {
  const states = [L.emptyState(), L.emptyState()];
  for (const [i, state] of states.entries()) {
    for (const unit of L.course.units.slice(0, i ? 8 : 6)) {
      for (const word of L.course.curriculumWords.filter(w => w.unitId === unit.id).slice(0, 6)) L.review(state, word.id, 'remember', '2026-10-20');
      const lesson = L.course.lessons.find(l => l.unitId === unit.id); L.gradeLesson(state, lesson.id, lesson.questions.map(q => q.answer), '2026-10-20');
    }
  }
  const word = L.course.words[0]; L.practiceWord(states[0], word.id, 'incorrecto', 'spelling', '2026-10-21'); L.practiceWord(states[0], word.id, word.spanish, 'spelling', '2026-10-21');
  const names = [username(), username()];
  for (const [i, name] of names.entries()) { const response = await page.request.post(api + '/api/register', { data: { username: name, password, progress: states[i] } }); expect(response.ok()).toBe(true); }
  await connect(page); await page.goto('/'); await auth(page, names[0], 'login', false);
  await expect(page).toHaveURL(/#lesson\/g7$/); await details(page);
  await expect(page.locator('.account-resume')).toContainText('A1 · 第 7 关');
  await expect(page.locator('.account-accuracy')).toContainText('50%'); await expect(page.locator('.account-accuracy')).toContainText('100%');
  await expect(page.locator('.account-levels')).toContainText('完成 6 / 8 关');
  const firstId = await page.locator('.account-user-id').textContent(); await logout(page);
  await auth(page, names[1], 'login', false); await expect(page).toHaveURL(/#lesson\/g9$/); await details(page);
  await expect(page.locator('.account-resume')).toContainText('A2 · 第 1 关');
  expect(await page.locator('.account-user-id').textContent()).not.toBe(firstId);
  await expect(page.locator('.account-accuracy')).toContainText('尚未练习');
  for (const width of [320, 768, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
});
test('错误密码留在登录弹窗内反馈，不切换学习记录或保留密码', async ({ page }) => {
  await connect(page); await page.goto('/');
  const before = await page.evaluate(() => localStorage.getItem('hola-learning-v1'));
  await page.locator('#account-trigger').click();
  await page.locator('#account-username').fill(username()); await page.locator('#account-password').fill(password);
  await page.locator('#account-form button[value="login"]').click();
  await expect(page.locator('#account-auth-error')).toContainText('账号或密码不正确');
  await expect(page.locator('#account-password')).toHaveValue('');
  await expect(page.locator('#account-dialog')).toBeVisible();
  await expect(page.locator('#account-form button[value="login"]')).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem('hola-learning-v1'))).toBe(before);
  expect(await page.evaluate(() => localStorage.getItem('hola-account-session-v1'))).toBeNull();
});
