const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createAccounts } = require('../server/accounts');
const { createAccountClient, GUEST, SESSION } = require('../miniprogram/lib/account');
const L = require('../miniprogram/lib/learning');
async function setup(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hola-accounts-'));
  const file = path.join(dir, 'db.sqlite');
  let clock = Date.now(), service = createAccounts({ file, origins: ['https://learn.example'], now: () => clock });
  const server = http.createServer((req, res) => service.handler(req, res));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const api = `http://127.0.0.1:${server.address().port}/api`;
  async function request(url, method, body, token, headers = {}) {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.error), { status: response.status });
    return result;
  }
  const device = () => {
    const values = new Map(); let failWrite = false;
    const client = createAccountClient({ api, request, get: key => structuredClone(values.get(key)), set: (key, value) => { if (failWrite) throw new Error('storage full'); values.set(key, structuredClone(value)); }, remove: key => values.delete(key) });
    return { client, values, failWrite(value) { failWrite = value; } };
  };
  t.after(async () => { await new Promise(resolve => server.close(resolve)); service.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  return { api, request, device, get db() { return service.db; }, restart() { service.close(); service = createAccounts({ file, now: () => clock }); }, expire() { clock += 31 * 86400000; } };
}
const password = 'my-passphrase-123';
test('注册绑定旧进度、另一设备登录、账号隔离、服务重启和会话撤销', async t => {
  const r = await setup(t), a = r.device(), b = r.device();
  const guest = L.emptyState(); L.setGoal(guest, 10); L.saveDrillDraft(guest, 'a1-place', 'Soy estudiante.');
  a.client.write(guest);
  await a.client.authenticate('register', 'Learner_one', password, a.client.read());
  assert.deepEqual(a.values.get(GUEST), guest);
  assert.equal(a.client.status().user.username, 'learner_one');
  const stored = r.db.prepare('SELECT * FROM users').get(); assert.notEqual(stored.password, password); assert.equal(stored.password.length, 128);
  const firstToken = a.values.get(SESSION).token;
  assert.notEqual(r.db.prepare('SELECT token FROM sessions').get().token, firstToken);
  await b.client.authenticate('login', 'learner_ONE', password);
  assert.equal(b.client.read().drillDrafts['a1-place'].text, 'Soy estudiante.');
  const progress = b.client.read(); L.setGoal(progress, 3); b.client.write(progress); await b.client.sync();
  await a.client.sync(); assert.equal(a.client.read().goal, 3);
  r.restart(); await a.client.sync(); assert.equal(a.client.read().goal, 3);
  await b.client.logout();
  await b.client.authenticate('register', 'learner_two', password, L.emptyState());
  assert.equal(b.client.read().goal, 5); assert.deepEqual(b.client.read().drillDrafts, {});
  const token = a.values.get(SESSION).token; await a.client.logout();
  assert.equal(a.client.read().goal, 10);
  await assert.rejects(r.request(r.api + '/progress', 'GET', undefined, token), { status: 401 });
});
test('多设备冲突不覆盖草稿，显式选本机或云端均留备份', async t => {
  const r = await setup(t), a = r.device(), b = r.device();
  await a.client.authenticate('register', 'conflict_user', password, L.emptyState());
  await b.client.authenticate('login', 'conflict_user', password);
  const local = a.client.read(); L.saveDrillDraft(local, 'a1-place', 'Soy profesora.'); a.client.write(local);
  const remote = b.client.read(); L.saveDrillDraft(remote, 'a1-place', 'Soy estudiante.'); b.client.write(remote); await b.client.sync();
  await assert.rejects(a.client.sync(), { status: 409 });
  assert.equal(a.client.read().drillDrafts['a1-place'].text, 'Soy profesora.');
  await a.client.sync('cloud'); assert.equal(a.client.read().drillDrafts['a1-place'].text, 'Soy estudiante.');
  assert.equal(a.client.previous().drillDrafts['a1-place'].text, 'Soy profesora.');
  a.client.write(local); await a.client.sync('local'); await b.client.sync();
  assert.equal(b.client.read().drillDrafts['a1-place'].text, 'Soy profesora.');
  assert.equal(JSON.parse(r.db.prepare('SELECT previous_json FROM progress').get().previous_json).drillDrafts['a1-place'].text, 'Soy estudiante.');
});
test('密码、重复注册、未知备份与跨来源请求被拒绝，过期后离线进度重登恢复', async t => {
  const r = await setup(t), a = r.device();
  await a.client.authenticate('register', 'safe_user', password, L.emptyState());
  await assert.rejects(r.request(r.api + '/register', 'POST', { username: 'safe_user', password, progress: L.emptyState() }), { status: 409 });
  await assert.rejects(r.request(r.api + '/login', 'POST', { username: 'safe_user', password: password + 'wrong' }), { status: 401 });
  const token = a.values.get(SESSION).token;
  await assert.rejects(r.request(r.api + '/progress', 'PUT', { progress: { ...L.emptyState(), version: 99 }, revision: 1 }, token), { status: 400 });
  await assert.rejects(r.request(r.api + '/progress', 'GET', undefined, token, { Origin: 'https://evil.example' }), { status: 403 });
  const progress = a.client.read(); progress.goal = 10; a.client.write(progress); r.expire();
  await assert.rejects(a.client.sync(), { status: 401 }); assert.equal(a.client.read().goal, 10);
  await a.client.logout(); await a.client.authenticate('login', 'safe_user', password); await a.client.sync(); assert.equal(a.client.read().goal, 10);
  a.failWrite(true); assert.throws(() => a.client.write(L.emptyState()), /storage full/); assert.equal(a.client.read().goal, 10);
});
test('损坏账号进度不降级为空记录；坏会话可退出，访客记录和备份不含密码', async t => {
  const r = await setup(t), a = r.device(); a.client.write(L.emptyState());
  await a.client.authenticate('register', 'broken_user', password, L.emptyState());
  a.values.set(a.client.key(), { progress: { version: 99 }, revision: 1, pending: false });
  assert.throws(() => a.client.read(), /未能读取/); assert.throws(() => a.client.write(L.emptyState()), /未能读取/);
  a.values.set(SESSION, { token: 'broken' }); assert.equal(a.client.status().broken, true);
  await a.client.logout(); assert.deepEqual(a.client.read(), L.emptyState()); assert.equal(JSON.stringify(a.client.read()).includes(password), false);
});
test('登录尝试限流', async t => {
  const r = await setup(t);
  for (let i = 0; i < 20; i++) await assert.rejects(r.request(r.api + '/login', 'POST', { username: 'missing_user', password }), { status: 401 });
  await assert.rejects(r.request(r.api + '/login', 'POST', { username: 'missing_user', password }), { status: 429 });
});
test('原生账号页面注册、同步、导出与保存失败保护，退出后恢复访客记录', async t => {
  const r = await setup(t), device = r.device(), vm = require('node:vm');
  const messages = []; let clipboard = '';
  const wx = { showToast: data => messages.push(data.title), setClipboardData: data => { clipboard = data.data; } };
  const storageModule = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.resolve('miniprogram/lib/storage.js'), 'utf8'), { module: storageModule, require: () => L, wx, setTimeout: () => 1, clearTimeout() {} });
  const S = storageModule.exports; S.configureAccount(device.client);
  const guest = L.emptyState(); guest.goal = 10; S.save(guest);
  let page;
  vm.runInNewContext(fs.readFileSync(path.resolve('miniprogram/pages/account/index.js'), 'utf8'), { Page: p => { page = p; }, wx, require: id => id.endsWith('storage') ? S : { getAccount: () => device.client } });
  page.data = structuredClone(page.data); page.setData = values => Object.assign(page.data, values); page.onShow();
  page.username({ detail: { value: 'native_user' } }); page.password({ detail: { value: password } });
  await page.authenticate({ currentTarget: { dataset: { mode: 'register' } } });
  assert.equal(page.data.password, ''); assert.equal(page.data.account.user.username, 'native_user');
  assert.equal(S.read().goal, 10);
  device.failWrite(true); assert.equal(S.commit(state => L.setGoal(state, 3)), null); assert.equal(S.read().goal, 10);
  device.failWrite(false); assert.ok(S.commit(state => L.setGoal(state, 3))); await page.sync();
  page.exportData({ currentTarget: { dataset: {} } }); assert.equal(JSON.parse(clipboard).goal, 3); assert.ok(!clipboard.includes(password));
  await page.logout(); assert.equal(S.read().goal, 10);
});
