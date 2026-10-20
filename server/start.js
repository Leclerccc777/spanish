const http = require('node:http');
const path = require('node:path');
const { createAccounts } = require('./accounts');
const accounts = createAccounts({ file: process.env.HOLA_ACCOUNT_DB || path.resolve('.account-data/accounts.sqlite'), origins: (process.env.HOLA_ALLOWED_ORIGINS || '').split(',').filter(Boolean) });
const server = http.createServer((req, res) => { accounts.handler(req, res).then(handled => { if (!handled) { res.writeHead(404); res.end(); } }); });
server.requestTimeout = 15000;
server.listen(Number(process.env.PORT || 4174), '127.0.0.1', () => console.log('Hola account API ready (configure HTTPS reverse proxy for production).'));
function close() { server.close(() => { accounts.close(); process.exit(0); }); }
process.on('SIGTERM', close); process.on('SIGINT', close);
