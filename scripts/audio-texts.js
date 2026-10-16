// Audio follows the Spanish already used in lessons; do not synthesize Chinese glosses.
const C = require('../miniprogram/data/course');
const foundations = require('../miniprogram/data/foundations');
const drills = require('../miniprogram/data/drills');
module.exports = [...new Set([
  ...C.curriculumWords.map(w => w.spanish),
  ...C.lessons.flatMap(l => l.examples.map(e => e[0])),
  ...foundations.flatMap(f => f.examples.flatMap(e => e[0].split(' → ').map((s,i) => i ? '' : s))),
  ...drills.flatMap(p => [p.reading, ...p.examples.map(e => e[0]), ...(p.article ? p.article.paragraphs : [])])
].filter(Boolean))];
if (require.main === module) process.stdout.write(JSON.stringify(module.exports));
