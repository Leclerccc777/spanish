// Audio follows the Spanish already used in lessons; do not synthesize Chinese glosses.
const C = require('../miniprogram/data/course');
const foundations = require('../miniprogram/data/foundations');
const drills = require('../miniprogram/data/drills');
const nouns = require('../miniprogram/data/noun-practice');
module.exports = [...new Set([
  ...C.words.map(w => w.spanish),
  ...C.lessons.flatMap(l => l.examples.map(e => e[0])),
  ...foundations.flatMap(f => f.examples.map(e => e[0].split(' → ')[0])),
  ...nouns.flatMap(n => [n.singular, n.plural, n.phrase, n.sentence]),
  ...drills.flatMap(p => [p.reading, ...p.examples.map(e => e[0]), ...p.words.map(w => w[0]), ...(p.article ? [...p.article.paragraphs, ...p.article.words.map(w => w[0])] : [])])
].filter(Boolean))];
if (require.main === module) process.stdout.write(JSON.stringify(module.exports));
