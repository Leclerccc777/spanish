const D = require('./drills');
const monthDays = require('../data/first-month');
function practiceSummary(state) {
  const progress = D.drillProgress(state);
  const levels = ['A1','A2','B1','B2'].map(level => {
    const packs = progress.filter(p => p.level === level);
    const drafts = packs.filter(p => state.drillDrafts[p.id] && state.drillDrafts[p.id].text.trim());
    return { level, total: packs.length, passed: packs.filter(p => p.bestScore >= 75).length,
      practiced: packs.filter(p => p.bestScore !== null).length, available: packs.filter(p => p.unlocked).length,
      wrong: packs.filter(p => p.unlocked).reduce((n,p) => n+p.mistakes.length,0),
      drafts: drafts.length, selfChecked: drafts.filter(p => (state.drillDrafts[p.id].checks || []).length === p.output.rubric.length).length };
  });
  const sum = key => levels.reduce((n,l) => n+l[key],0);
  const monthCompleted = monthDays.filter(d => { const r=(state.monthChecks || {})[d.day]; return r && Array.isArray(r.tasks) && d.tasks.every(t => r.tasks.includes(t.id)); }).length;
  return { levels, total: sum('total'), passed: sum('passed'), wrong: sum('wrong'), drafts: sum('drafts'), selfChecked: sum('selfChecked'), monthCompleted, next: D.nextDrillPack(state) };
}
module.exports = { practiceSummary };
