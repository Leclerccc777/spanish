const fs = require('node:fs');
const path = require('node:path');

// Offline APK deliberately excludes the optional account endpoint.
process.env.HOLA_ACCOUNT_API = '';
const output = require('./build-web')();
const assets = path.resolve(__dirname, '../android/app/src/main/assets');
fs.mkdirSync(assets, { recursive: true });
fs.copyFileSync(path.join(output, 'hola-spanish.html'), path.join(assets, 'index.html'));
fs.copyFileSync(path.resolve(__dirname, '../THIRD_PARTY_NOTICES.md'), path.join(assets, 'THIRD_PARTY_NOTICES.md'));
console.log('Android assets prepared: full offline course and 6788 audio clips.');
