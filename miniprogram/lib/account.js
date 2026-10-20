// Platform adapters store objects, send JSON and throw {status,message} on API errors.
const SESSION = 'hola-account-session-v1';
const GUEST = 'hola-learning-v1';
function createAccountClient({ get, set, remove, request, api, changed = () => {} }) {
  let message = '', busy = null;
  function session() {
    const value = get(SESSION);
    if (!value) return null;
    if (!value.user || !/^[a-f0-9-]{36}$/.test(value.user.id) || typeof value.token !== 'string' || !/^[a-f0-9]{64}$/.test(value.token)) throw new Error('登录记录未能读取，请先退出账号；学习记录仍保留');
    return value;
  }
  const keyFor = user => `hola-account-progress-v1:${user.id}`;
  const key = () => { const s = session(); return s ? keyFor(s.user) : GUEST; };
  function record(s = session()) {
    const value = get(keyFor(s.user));
    if (!value || !Number.isSafeInteger(value.revision) || value.revision < 1 || typeof value.pending !== 'boolean' || value.progress?.version !== 1) throw new Error('账号学习记录未能读取，旧记录不会被覆盖');
    return value;
  }
  function read() { const s = session(); return s ? record(s).progress : get(GUEST); }
  function status() {
    try { const s = session(); return { enabled: !!api, user: s?.user || null, message: message || (s ? (record(s).pending ? '本机已保存，等待同步' : '已与账号同步') : (api ? '注册后可把当前学习记录保存到账号' : '账号服务尚未开通，当前学习与备份可继续使用')) }; }
    catch (error) { return { enabled: !!api, user: null, message: error.message, broken: true }; }
  }
  function announce(text) { message = text; changed(status()); }
  async function call(path, method, body, s) {
    if (!api) throw new Error('账号服务尚未开通');
    const result = await request(api + path, method, body, s?.token);
    if (result.progress !== undefined && (result.progress?.version !== 1 || !Number.isSafeInteger(result.revision) || result.revision < 1)) throw new Error('云端记录版本未受支持，未替换本机进度');
    return result;
  }
  function current(s) { return session()?.token === s.token; }
  function write(progress, replacing = false) {
    const s = session();
    if (!s) set(GUEST, progress);
    else {
      const old = replacing ? get(keyFor(s.user)) : record(s);
      if (replacing && old) set(keyFor(s.user) + ':before-replace', old);
      const revision = Number.isSafeInteger(old?.revision) && old.revision >= 1 ? old.revision : 1;
      set(keyFor(s.user), { revision, progress, pending: true });
    }
    message = s ? '本机已保存，等待同步' : ''; changed(status());
  }
  async function authenticate(mode, username, password, progress) {
    if (session()) throw new Error('请先退出当前账号');
    const result = await call('/' + mode, 'POST', { username, password, ...(mode === 'register' ? { progress } : {}) });
    const accountKey = keyFor(result.user), existing = get(accountKey);
    // A previous offline draft must survive re-authentication, including expired sessions.
    if (existing) {
      if (existing.progress?.version !== 1 || !Number.isSafeInteger(existing.revision) || typeof existing.pending !== 'boolean') throw new Error('本机账号记录未能读取，未替换旧记录');
      if (!existing.pending) set(accountKey, { progress: result.progress, revision: result.revision, pending: false });
    } else set(accountKey, { progress: result.progress, revision: result.revision, pending: false });
    set(SESSION, { user: result.user, token: result.token });
    announce('已登录；原来的本机学习记录仍保留');
    return result.user;
  }
  async function performSync(choice) {
    const s = session(); if (!s) return;
    try {
      const snapshot = record(s), serialized = JSON.stringify(snapshot);
      if (choice) {
        const remote = await call('/progress', 'GET', undefined, s);
        if (!current(s)) return;
        if (JSON.stringify(record(s)) !== serialized) throw new Error('学习记录刚有变化，请重新选择');
        // Keep a recoverable local snapshot before either explicit replacement.
        set(keyFor(s.user) + ':before-replace', snapshot);
        if (choice === 'cloud') {
          set(keyFor(s.user), { progress: remote.progress, revision: remote.revision, pending: false });
          announce('已使用云端进度；替换前的本机记录已保留'); return { downloaded: true };
        }
        const result = await call('/progress', 'PUT', { progress: snapshot.progress, revision: remote.revision }, s);
        if (!current(s)) return;
        const live = record(s);
        set(keyFor(s.user), { ...live, revision: result.revision, pending: JSON.stringify(live.progress) !== JSON.stringify(snapshot.progress) });
      } else if (snapshot.pending) {
        const result = await call('/progress', 'PUT', { progress: snapshot.progress, revision: snapshot.revision }, s);
        if (!current(s)) return;
        const live = record(s);
        set(keyFor(s.user), { ...live, revision: result.revision, pending: JSON.stringify(live.progress) !== JSON.stringify(snapshot.progress) });
      } else {
        const remote = await call('/progress', 'GET', undefined, s);
        if (!current(s)) return;
        if (JSON.stringify(record(s)) !== serialized) return;
        if (remote.revision !== snapshot.revision) {
          set(keyFor(s.user) + ':before-replace', snapshot);
          set(keyFor(s.user), { progress: remote.progress, revision: remote.revision, pending: false });
          announce('已读取云端最新学习记录'); return { downloaded: true };
        }
      }
      announce(record(s).pending ? '本机有新变化，请再同步一次' : '已与账号同步');
    } catch (error) {
      if (current(s)) announce(error.status === 409 ? '同步冲突：两份进度均保留。请先导出本机备份，再选择使用本机或云端进度' : error.status === 401 ? '登录已过期，请退出后重新登录；本机进度仍保留' : (error.message || '网络暂不可用，本机记录仍保留，可稍后同步'));
      throw error;
    }
  }
  function sync(choice) {
    if (busy) {
      if (choice) return Promise.reject(new Error('正在同步，请完成后再选择进度'));
      return busy;
    }
    let token;
    try { token = session()?.token; } catch (error) { return Promise.reject(error); }
    busy = (async () => {
      const result = await performSync(choice);
      // A save during upload shares the in-flight promise; drain its newer snapshot too.
      while (token && session()?.token === token && record().pending) await performSync();
      return result;
    })().finally(() => { busy = null; });
    return busy;
  }
  async function logout() {
    let s; try { s = session(); } catch { /* Exit a damaged session without touching progress. */ }
    remove(SESSION); announce('已退出，账号的本机记录仍保留；现在显示原来的本机进度');
    if (s) { try { await call('/logout', 'POST', {}, s); } catch { /* Local exit works offline. */ } }
  }
  function previous() { const s = session(); return s ? get(keyFor(s.user) + ':before-replace')?.progress : null; }
  return { key, read, write, status, authenticate, sync, logout, previous };
}
module.exports = { createAccountClient, SESSION, GUEST };
