const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createAccountClient } = require('../miniprogram/lib/account');
const L = require('../miniprogram/lib/learning');
const user = { id: '12345678-1234-1234-1234-123456789012', username: 'student' };
function runtime() {
  const values = new Map(); let delay, resolve, reject;
  const client = createAccountClient({ api: '/api', get: key => structuredClone(values.get(key)), set: (key, value) => values.set(key, structuredClone(value)), remove: key => values.delete(key), request: async (url, method, body) => {
    if (url.endsWith('/login')) return { user, token: 'a'.repeat(64), progress: L.emptyState(), revision: 1 };
    if (url.endsWith('/logout')) return {};
    if (delay) { delay = false; return new Promise((yes, no) => { resolve = yes; reject = no; }); }
    return method === 'PUT' ? { revision: body.revision + 1 } : { progress: L.emptyState(), revision: 1 };
  } });
  return { client, values, pause() { delay = true; }, finish(value) { resolve(value); }, fail() { reject(new Error('offline')); } };
}
test('上传期间新练习仍待同步；退出或换账号后旧响应不覆盖访客', async () => {
  const r = runtime(), a = r.client; a.write(L.emptyState()); await a.authenticate('login', 'student', 'password');
  let progress = a.read(); progress.goal = 10; a.write(progress); r.pause();
  const uploading = a.sync(); progress = a.read(); progress.goal = 3; a.write(progress);
  assert.equal(r.values.get(a.key()).pending, true); r.finish({ revision: 2 }); await uploading; assert.equal(a.read().goal, 3); assert.equal(r.values.get(a.key()).pending, false);
  progress = a.read(); progress.goal = 10; a.write(progress); r.pause();
  const late = a.sync(); await a.logout(); r.finish({ revision: 3 }); await late;
  assert.equal(a.read().goal, 5); assert.equal(a.status().user, null);
});
test('断网与未知云端版本均保留本机记录；明确导入可修复损坏账号记录', async () => {
  const r = runtime(), a = r.client; await a.authenticate('login', 'student', 'password');
  const original = a.read(); r.pause(); const bad = a.sync(); r.finish({ progress: { version: 99 }, revision: 2 });
  await assert.rejects(bad, /未受支持/); assert.deepEqual(a.read(), original);
  original.goal = 10; a.write(original); r.pause(); const offline = a.sync(); r.fail(); await assert.rejects(offline, /offline/); assert.equal(a.read().goal, 10);
  r.values.set(a.key(), { progress: { version: 99 }, revision: 2, pending: false }); assert.throws(() => a.read(), /未能读取/);
  a.write(original, true); assert.equal(a.read().goal, 10); assert.equal(r.values.get(a.key() + ':before-replace').progress.version, 99);
});
