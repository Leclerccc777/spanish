// Optional single-process account service. Node >=22.13, durable SQLite volume required.
const { DatabaseSync } = require('node:sqlite');
const { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } = require('node:crypto');
const { promisify } = require('node:util');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../miniprogram/lib/learning');
const derive = promisify(scrypt);
const digest = token => createHash('sha256').update(token).digest('hex');
function validProgress(raw) {
  if (!raw || raw.version !== 1 || !['reviews', 'days', 'lessons'].every(k => raw[k] && typeof raw[k] === 'object' && !Array.isArray(raw[k]))) throw Object.assign(new Error('不是受支持的学习记录'), { status: 400 });
  return L.restore(raw);
}
function createAccounts({ file, origins = [], now = Date.now } = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(file);
  fs.chmodSync(file, 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS progress(user_id TEXT PRIMARY KEY REFERENCES users(id), revision INTEGER NOT NULL, json TEXT NOT NULL, previous_json TEXT);`);
  const limits = new Map(); let hashing = 0;
  function fail(status, message) { throw Object.assign(new Error(message), { status }); }
  async function passwordHash(password, salt) {
    if (hashing >= 4) fail(429, '请求较多，请稍后重试');
    hashing++;
    try { return (await derive(password, salt, 64)).toString('hex'); } finally { hashing--; }
  }
  function rateLimit(key) {
    const time = now();
    for (const [k, v] of limits) if (v.until <= time) limits.delete(k);
    const entry = limits.get(key) || { count: 0, until: time + 15 * 60000 };
    if (entry.count >= 20 || limits.size >= 10000) fail(429, '尝试次数较多，请稍后重试');
    entry.count++; limits.set(key, entry);
  }
  async function handler(req, res) {
    let pathname;
    try { pathname = new URL(req.url, 'http://localhost').pathname; }
    catch { res.writeHead(400); res.end(); return true; }
    if (!pathname.startsWith('/api/')) return false;
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };
    try {
      const origin = req.headers.origin;
      if (origin && !origins.includes(origin)) fail(403, '此页面未获准连接账号服务');
      if (origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS'); send(204, {}); return true;
      }
      let body = {};
      if (['POST', 'PUT'].includes(req.method)) {
        if (!String(req.headers['content-type']).startsWith('application/json')) fail(415, '请使用 JSON 请求');
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 8000000) fail(413, '学习记录过大，请先导出备份'); chunks.push(chunk); }
        try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch { fail(400, '请求内容无效'); }
        if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, '请求内容无效');
      }
      if (req.method === 'POST' && ['/api/register', '/api/login'].includes(pathname)) {
        rateLimit('ip:' + req.socket.remoteAddress);
        const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
        if (!/^[a-z0-9_]{4,32}$/.test(username) || typeof body.password !== 'string' || body.password.length < 10 || body.password.length > 128) fail(400, '账号用 4–32 位字母、数字或下划线；密码用 10–128 个字符');
        rateLimit('user:' + username);
        let user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
        if (pathname === '/api/register') {
          const progress = validProgress(body.progress);
          if (user) fail(409, '这个账号已被注册，请换一个');
          const salt = randomBytes(16).toString('hex'), password = await passwordHash(body.password, salt);
          user = { id: randomUUID(), username, salt, password };
          db.exec('BEGIN IMMEDIATE');
          try {
            db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(user.id, username, salt, password);
            db.prepare('INSERT INTO progress VALUES(?,1,?,NULL)').run(user.id, JSON.stringify(progress)); db.exec('COMMIT');
          } catch (error) { db.exec('ROLLBACK'); if (error.code === 'ERR_SQLITE_ERROR' && /UNIQUE/.test(error.message)) fail(409, '这个账号已被注册，请换一个'); throw error; }
        } else {
          // Derive even for unknown users; never keep plaintext credentials.
          const hash = await passwordHash(body.password, user?.salt || 'unknown-account-salt');
          if (!user || !timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.password, 'hex'))) fail(401, '账号或密码不正确');
        }
        const token = randomBytes(32).toString('hex');
        db.prepare('DELETE FROM sessions WHERE expires<=?').run(now());
        db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(digest(token), user.id, now() + 30 * 86400000);
        const record = db.prepare('SELECT revision,json FROM progress WHERE user_id=?').get(user.id);
        send(200, { token, user: { id: user.id, username }, revision: record.revision, progress: JSON.parse(record.json) }); return true;
      }
      const token = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || '')?.[1];
      const session = token && db.prepare('SELECT * FROM sessions WHERE token=? AND expires>?').get(digest(token), now());
      if (!session) fail(401, '登录已过期，请重新登录；本机进度仍保留');
      if (pathname === '/api/logout' && req.method === 'POST') { db.prepare('DELETE FROM sessions WHERE token=?').run(digest(token)); send(200, { ok: true }); return true; }
      if (pathname === '/api/progress' && req.method === 'GET') {
        const record = db.prepare('SELECT revision,json FROM progress WHERE user_id=?').get(session.user_id);
        send(200, { revision: record.revision, progress: JSON.parse(record.json) }); return true;
      }
      if (pathname === '/api/progress' && req.method === 'PUT') {
        const progress = validProgress(body.progress);
        if (!Number.isSafeInteger(body.revision) || body.revision < 1) fail(400, '记录版本无效');
        const result = db.prepare('UPDATE progress SET previous_json=json,json=?,revision=revision+1 WHERE user_id=? AND revision=?').run(JSON.stringify(progress), session.user_id, body.revision);
        if (!result.changes) fail(409, '另一台设备已有新进度。两份均保留，请先导出本机备份，再选择使用哪份');
        send(200, { revision: body.revision + 1 }); return true;
      }
      fail(404, '没有这个账号接口');
    } catch (error) { send(error.status || 500, { error: error.status ? error.message : '账号服务暂不可用，本机记录仍保留' }); }
    return true;
  }
  return { handler, close: () => db.close(), db };
}
module.exports = { createAccounts, validProgress };
