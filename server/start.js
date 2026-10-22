const http = require('node:http');
const path = require('node:path');
const { createAccounts } = require('./accounts');
function startAccountServer(options = {}) {
  const accounts = createAccounts({
    file: options.file || process.env.HOLA_ACCOUNT_DB || path.resolve('.account-data/accounts.sqlite'),
    origins: options.origins || (process.env.HOLA_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean)
  });
  const server = http.createServer((req, res) => {
    if (req.url === '/healthz' && ['GET', 'HEAD'].includes(req.method)) {
      let healthy = true;
      try { accounts.db.prepare('SELECT 1').get(); } catch { healthy = false; }
      res.writeHead(healthy ? 200 : 503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ status: healthy ? 'ready' : 'unavailable' }));
      return;
    }
    accounts.handler(req, res).then(handled => { if (!handled) { res.writeHead(404); res.end(); } }).catch(() => {
      if (!res.headersSent) res.writeHead(500, { 'Cache-Control': 'no-store' });
      res.end();
    });
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 15000;
  let databaseClosed = false;
  function closeDatabase() { if (!databaseClosed) { databaseClosed = true; accounts.close(); } }
  server.once('close', closeDatabase);
  server.once('error', () => { if (!server.listening) closeDatabase(); });
  server.listen(options.port ?? Number(process.env.PORT || 4174), options.host || process.env.HOST || '127.0.0.1');
  return server;
}
if (require.main === module) {
  const server = startAccountServer();
  server.once('listening', () => console.log(`Hola account API listening on ${server.address().address}:${server.address().port}`));
  server.once('error', error => { console.error(`Hola account API startup failed: ${error.code || 'server_error'}`); process.exitCode = 1; });
  function close() { server.close(() => process.exit(0)); }
  process.on('SIGTERM', close); process.on('SIGINT', close);
}
module.exports = { startAccountServer };
