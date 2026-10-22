const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { startAccountServer } = require('../server/start');
const L = require('../miniprogram/lib/learning');
test('云托管入口监听公开接口、健康检查不泄漏账号，数据库随重启保留', async t => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'hola-hosted-server-'));
  const file = path.join(folder, 'accounts.sqlite');
  let server;
  async function open() {
    server = startAccountServer({ file, port: 0, host: '0.0.0.0', origins: ['https://leclerccc777.github.io'] });
    await once(server, 'listening');
    assert.equal(server.address().address, '0.0.0.0');
    return `http://127.0.0.1:${server.address().port}`;
  }
  async function close() { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); server = null; }
  t.after(async () => { if (server) await close(); fs.rmSync(folder, { recursive: true, force: true }); });
  let origin = await open();
  let health = await fetch(origin + '/healthz'); assert.equal(health.status, 200); assert.deepEqual(await health.json(), { status: 'ready' });
  const head = await fetch(origin + '/healthz', { method: 'HEAD' }); assert.equal(head.status, 200); assert.equal(await head.text(), '');
  const progress = L.emptyState(); progress.goal = 10; L.saveDrillDraft(progress, 'a1-place', 'Soy estudiante.');
  const credentials = { username: 'hosted_learner', password: 'example-password-123' };
  const register = await fetch(origin + '/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://leclerccc777.github.io' }, body: JSON.stringify({ ...credentials, progress }) });
  assert.equal(register.status, 200); assert.equal(register.headers.get('access-control-allow-origin'), 'https://leclerccc777.github.io');
  const account = await register.json();
  const preflight = await fetch(origin + '/api/progress', { method: 'OPTIONS', headers: { Origin: 'https://leclerccc777.github.io' } });
  assert.equal(preflight.status, 204); assert.match(preflight.headers.get('access-control-allow-headers'), /Authorization/);
  await close(); origin = await open();
  const login = await fetch(origin + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://leclerccc777.github.io' }, body: JSON.stringify(credentials) });
  assert.equal(login.status, 200); const restored = await login.json();
  assert.equal(restored.user.id, account.user.id); assert.equal(restored.progress.goal, 10); assert.equal(restored.progress.drillDrafts['a1-place'].text, 'Soy estudiante.');
  health = await fetch(origin + '/healthz'); assert.deepEqual(await health.json(), { status: 'ready' });
  assert.equal((await fetch(origin + '/')).status, 404);
});
test('生产启动入口读取 HOST、PORT 和磁盘变量，并响应 SIGTERM 正常退出', async t => {
  const { spawn } = require('node:child_process');
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'hola-production-start-'));
  const child = spawn(process.execPath, ['server/start.js'], { cwd: path.resolve(__dirname, '..'), env: { ...process.env, HOST: '0.0.0.0', PORT: '0', HOLA_ACCOUNT_DB: path.join(folder, 'volume', 'accounts.sqlite') }, stdio: ['ignore', 'pipe', 'pipe'] });
  let exited = false; child.once('exit', () => { exited = true; });
  t.after(async () => { if (!exited) { child.kill('SIGTERM'); await once(child, 'exit'); } fs.rmSync(folder, { recursive: true, force: true }); });
  const port = await new Promise((resolve, reject) => {
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; const match = /listening on 0\.0\.0\.0:(\d+)/.exec(output); if (match) resolve(Number(match[1])); });
    child.once('error', reject); child.once('exit', code => reject(new Error('Account API exited before readiness: ' + code)));
  });
  const response = await fetch(`http://127.0.0.1:${port}/healthz`); assert.equal(response.status, 200);
  assert.ok(fs.existsSync(path.join(folder, 'volume', 'accounts.sqlite')));
  const stopped = once(child, 'exit'); child.kill('SIGTERM'); const [code, signal] = await stopped;
  assert.equal(code, 0); assert.equal(signal, null);
});
