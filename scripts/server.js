const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const build = require('./build-web');
const root = build();
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let file;
  try { const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  if (!file.startsWith(`${root}${path.sep}`)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; media-src 'self' data: blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'" });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});
server.listen(port, '0.0.0.0', () => console.log(`Hola browser companion listening on port ${port}.`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
