const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function build() {
  const output = path.join(root, 'dist');
  fs.mkdirSync(output, { recursive: true });
  for (const name of ['index.html', 'styles.css', 'exercise-ui.js', 'audio.js', 'app.js']) fs.copyFileSync(path.join(root, 'web', name), path.join(output, name));
  const modules = ['data/sources', 'data/vocabulary-review', 'data/course-extension', 'data/expression-tasks', 'data/lexicon/entries', 'data/lexicon/index', 'data/lexicon/tasks', 'data/course', 'data/foundations', 'data/year-plan', 'data/noun-practice', 'data/drill-extension', 'data/drill-coaching', 'data/drill-practice', 'data/drill-path', 'data/drill-articles', 'data/drills', 'data/first-month', 'data/week-guide', 'data/lesson-variants', 'data/drill-variants', 'data/foundation-variants', 'data/noun-variants', 'lib/variants', 'lib/exercise', 'lib/journey', 'lib/nouns', 'lib/drills', 'lib/drill-review', 'lib/first-month', 'lib/drill-progress', 'lib/learning'];
  const definitions = modules.map(id => `${JSON.stringify(id)}: function(module, exports, require) {\n${fs.readFileSync(path.join(root, 'miniprogram', `${id}.js`), 'utf8')}\n}`).join(',\n');
  const bundle = `(function(){'use strict'; const modules={${definitions}}; const cache={}; function load(id){ if(cache[id])return cache[id].exports; const module=cache[id]={exports:{}}; modules[id](module,module.exports,function(relative){const parts=id.split('/');parts.pop();for(const p of relative.split('/')){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);}return load(parts.join('/'));});return module.exports;} window.HolaLearning=load('lib/learning');})();\n`;
  fs.writeFileSync(path.join(output, 'learning.bundle.js'), bundle);
  const audioManifest=require('../miniprogram/data/audio-manifest');
  const clips=Object.fromEntries(Object.entries(audioManifest).map(([text,file])=>[text,'data:audio/mpeg;base64,'+fs.readFileSync(path.join(root,'miniprogram',file)).toString('base64')]));
  fs.writeFileSync(path.join(output,'audio.bundle.js'),'window.HolaAudioClips='+JSON.stringify(clips)+';\n');
  // Classic scripts run in document order, including under file://. No fetch or CDN.
  let standalone = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');
  standalone = standalone.replace('<link rel="stylesheet" href="/styles.css" />', () => `<style>\n${fs.readFileSync(path.join(root, 'web/styles.css'), 'utf8')}\n</style>`);
  for (const name of ['learning.bundle.js', 'audio.bundle.js', 'exercise-ui.js', 'audio.js', 'app.js']) {
    const source = fs.readFileSync(path.join(output, name), 'utf8').replace(/<\/script/gi, '<\\/script');
    standalone = standalone.replace(`<script src="/${name}" defer></script>`, () => `<script>\n${source}\n</script>`);
  }
  // The scripts need #app and #toast to exist before they execute.
  const scripts = standalone.match(/<script>[\s\S]*?<\/script>/g).join('\n');
  standalone = standalone.replace(/<script>[\s\S]*?<\/script>\n?/g, '').replace('</body>', () => `${scripts}\n</body>`);
  fs.writeFileSync(path.join(output, 'hola-spanish.html'), standalone);
  const pages = path.join(output, 'pages');
  fs.mkdirSync(pages, { recursive: true });
  fs.writeFileSync(path.join(pages, 'index.html'), standalone);
  fs.writeFileSync(path.join(pages, '.nojekyll'), '');
  console.log('Built browser companion in dist/ (shared mini program course and learning engine).');
  console.log('Standalone HTML: dist/hola-spanish.html (open directly in a desktop browser).');
  console.log('GitHub Pages: dist/pages/ (self-contained index.html, supports repository subpaths).');
  return output;
}
if (require.main === module) build();
module.exports = build;
