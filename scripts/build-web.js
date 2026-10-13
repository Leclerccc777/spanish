const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function build() {
  const output = path.join(root, 'dist');
  fs.mkdirSync(output, { recursive: true });
  for (const name of ['index.html', 'styles.css', 'exercise-ui.js', 'app.js']) fs.copyFileSync(path.join(root, 'web', name), path.join(output, name));
  const modules = ['data/sources', 'data/vocabulary-review', 'data/course-extension', 'data/expression-tasks', 'data/lexicon/entries', 'data/lexicon/index', 'data/lexicon/tasks', 'data/course', 'data/foundations', 'data/year-plan', 'data/noun-practice', 'data/drill-extension', 'data/drill-coaching', 'data/drills', 'data/first-month', 'data/week-guide', 'lib/exercise', 'lib/journey', 'lib/nouns', 'lib/drills', 'lib/drill-review', 'lib/first-month', 'lib/drill-progress', 'lib/learning'];
  const definitions = modules.map(id => `${JSON.stringify(id)}: function(module, exports, require) {\n${fs.readFileSync(path.join(root, 'miniprogram', `${id}.js`), 'utf8')}\n}`).join(',\n');
  const bundle = `(function(){'use strict'; const modules={${definitions}}; const cache={}; function load(id){ if(cache[id])return cache[id].exports; const module=cache[id]={exports:{}}; modules[id](module,module.exports,function(relative){const parts=id.split('/');parts.pop();for(const p of relative.split('/')){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);}return load(parts.join('/'));});return module.exports;} window.HolaLearning=load('lib/learning');})();\n`;
  fs.writeFileSync(path.join(output, 'learning.bundle.js'), bundle);
  console.log('Built browser companion in dist/ (shared mini program course and learning engine).');
  return output;
}
if (require.main === module) build();
module.exports = build;
