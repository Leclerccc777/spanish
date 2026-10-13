const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function build() {
  const output = path.join(root, 'dist');
  fs.mkdirSync(output, { recursive: true });
  for (const name of ['index.html', 'styles.css', 'exercise-ui.js', 'app.js']) fs.copyFileSync(path.join(root, 'web', name), path.join(output, name));
  const modules = ['data/sources', 'data/vocabulary-review', 'data/course-extension', 'data/expression-tasks', 'data/lexicon/entries', 'data/lexicon/index', 'data/lexicon/tasks', 'data/course', 'data/foundations', 'data/year-plan', 'data/noun-practice', 'data/drill-extension', 'data/drill-coaching', 'data/drill-practice', 'data/drills', 'data/first-month', 'data/week-guide', 'lib/exercise', 'lib/journey', 'lib/nouns', 'lib/drills', 'lib/drill-review', 'lib/first-month', 'lib/drill-progress', 'lib/learning'];
  const definitions = modules.map(id => `${JSON.stringify(id)}: function(module, exports, require) {\n${fs.readFileSync(path.join(root, 'miniprogram', `${id}.js`), 'utf8')}\n}`).join(',\n');
  const bundle = `(function(){'use strict'; const modules={${definitions}}; const cache={}; function load(id){ if(cache[id])return cache[id].exports; const module=cache[id]={exports:{}}; modules[id](module,module.exports,function(relative){const parts=id.split('/');parts.pop();for(const p of relative.split('/')){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);}return load(parts.join('/'));});return module.exports;} window.HolaLearning=load('lib/learning');})();\n`;
  fs.writeFileSync(path.join(output, 'learning.bundle.js'), bundle);
  // Classic scripts run in document order, including under file://. No fetch or CDN.
  let standalone = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');
  standalone = standalone.replace('<link rel="stylesheet" href="/styles.css" />', () => `<style>\n${fs.readFileSync(path.join(root, 'web/styles.css'), 'utf8')}\n</style>`);
  for (const name of ['learning.bundle.js', 'exercise-ui.js', 'app.js']) {
    const source = fs.readFileSync(path.join(output, name), 'utf8').replace(/<\/script/gi, '<\\/script');
    standalone = standalone.replace(`<script src="/${name}" defer></script>`, () => `<script>\n${source}\n</script>`);
  }
  // The scripts need #app and #toast to exist before they execute.
  const scripts = standalone.match(/<script>[\s\S]*?<\/script>/g).join('\n');
  standalone = standalone.replace(/<script>[\s\S]*?<\/script>\n?/g, '').replace('</body>', () => `${scripts}\n</body>`);
  fs.writeFileSync(path.join(output, 'hola-spanish.html'), standalone);
  console.log('Built browser companion in dist/ (shared mini program course and learning engine).');
  console.log('Standalone HTML: dist/hola-spanish.html (open directly in a desktop browser).');
  return output;
}
if (require.main === module) build();
module.exports = build;
