const fs = require('node:fs');
const path = require('node:path');
const build = require('./build-web');
const output = path.resolve(__dirname, '../releases');
fs.mkdirSync(output, { recursive: true });
fs.copyFileSync(path.join(build(), 'hola-spanish.html'), path.join(output, 'hola-spanish.html'));
console.log('Packaged releases/hola-spanish.html — open this one file in a desktop browser.');
