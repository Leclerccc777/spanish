const C = require('../data/course');
const foundations = require('../data/foundations');
const nouns = require('../data/noun-practice');
const packs = require('../data/drills');
const targets = { lesson: C.lessons, drill: packs, expression: C.tasks, foundation: foundations, noun: nouns };
function restorePosition(value) {
  if (!value || typeof value !== 'object') return null;
  if (Array.isArray(targets[value.kind]) && targets[value.kind].some(item => item.id === value.id)) return { kind: value.kind, id: value.id };
  if (value.kind === 'study') return { kind: 'study' };
  if (value.kind === 'month' && Number.isInteger(value.day) && value.day >= 1 && value.day <= 28) return { kind: 'month', day: value.day };
  if (value.kind === 'year' && Number.isInteger(value.week) && value.week >= 1 && value.week <= 52) return { kind: 'year', week: value.week };
  return null;
}
function createProfile(L) {
  function available(state, position, today) {
    const p = restorePosition(position); if (!p) return false;
    if (p.kind === 'lesson') return L.isUnlocked(state, C.lessons.find(l => l.id === p.id).unitId);
    if (p.kind === 'drill') return L.drillUnlocked(state, p.id);
    if (p.kind === 'expression') return L.expressionUnlocked(state, p.id);
    if (p.kind === 'month' || p.kind === 'year') {
      const year = L.yearSummary(state, today);
      return year.started && year.day > 0 && (p.kind === 'month' ? p.day <= year.day : p.week <= year.weekNumber);
    }
    return true;
  }
  function setLearningPosition(state, value, today = L.dateKey()) {
    if (!available(state, value, today)) return false;
    state.resume = restorePosition(value); return true;
  }
  function learningDestination(state, today = L.dateKey()) {
    const unit = L.currentUnit(state), lesson = C.lessons.find(l => l.unitId === unit.id);
    const unitLabel = u => `${u.levelCode} · 第 ${C.units.filter(item => item.levelCode === u.levelCode).findIndex(item => item.id === u.id) + 1} 关`;
    const fallback = { kind: 'lesson', id: lesson.id, route: `lesson/${lesson.id}`, label: `${unitLabel(unit)} · ${unit.title}` };
    const p = restorePosition(state.resume);
    if (!available(state, p, today)) return fallback;
    if (p.kind === 'lesson') {
      const item = C.lessons.find(l => l.id === p.id), u = C.units.find(u => u.id === item.unitId);
      return L.unitProgress(state, u.id).complete ? fallback : { ...p, route: `lesson/${p.id}`, label: `${unitLabel(u)} · ${item.title}` };
    }
    if (p.kind === 'drill') {
      const pack = packs.find(item => item.id === p.id), next = state.drills[p.id]?.bestScore >= 75 ? L.nextDrillPack(state, p.id) : pack;
      return next ? { kind: 'drill', id: next.id, route: `drill/${next.id}`, label: `${next.level} · ${next.title}` } : fallback;
    }
    if (p.kind === 'expression') return { ...p, route: `expression/${p.id}`, label: `继续表达 · ${C.tasks.find(t => t.id === p.id).title}` };
    if (p.kind === 'foundation') return { ...p, route: `foundation/${p.id}`, label: `四步入门 · ${foundations.find(f => f.id === p.id).title}` };
    if (p.kind === 'noun') return { ...p, route: `noun/${p.id}`, label: `名词练习 · ${nouns.find(n => n.id === p.id).singular}` };
    if (p.kind === 'month') return { ...p, route: 'first-month', label: `前四周任务 · 第 ${p.day} 天` };
    if (p.kind === 'year') return { ...p, route: 'year', label: `年度计划 · 第 ${p.week} 周` };
    return { ...p, route: 'study', label: '继续词卡与到期复习' };
  }
  function profileSummary(state, today = L.dateKey()) {
    const summary = L.summary(state, today), practice = L.practiceSummary(state);
    const words = C.words.map(w => state.wordPractice[w.id]).filter(Boolean);
    const attempts = words.reduce((n, r) => n + r.attempts, 0), correct = words.reduce((n, r) => n + r.correct, 0);
    const best = records => records.length ? Math.round(records.reduce((n, r) => n + r.bestScore, 0) / records.length) : null;
    const levels = C.levels.map(level => {
      const units = C.units.filter(u => u.levelCode === level.id).map(unit => {
        const lesson = C.lessons.find(l => l.unitId === unit.id), result = state.lessons[lesson.id];
        return { ...unit, ...L.unitProgress(state, unit.id), lessonId: lesson.id, unlocked: L.isUnlocked(state, unit.id), bestScore: result?.bestScore ?? null, attempts: result?.attempts || 0 };
      });
      return { level: level.id, units, total: units.length, completed: units.filter(u => u.complete).length, available: units.filter(u => u.unlocked).length, bestScore: best(units.filter(u => u.bestScore !== null)) };
    });
    return { ...summary, practice, levels, resume: learningDestination(state, today), year: L.yearSummary(state, today),
      completed: levels.reduce((n, l) => n + l.completed, 0),
      learningDays: Object.keys(state.days).length,
      wordAccuracy: attempts ? Math.round(100 * correct / attempts) : null, wordAttempts: attempts, wordCorrect: correct,
      grammarBest: best(C.lessons.map(l => state.lessons[l.id]).filter(Boolean)),
      drillBest: best(packs.map(p => state.drills[p.id]).filter(Boolean)),
      wordMistakes: L.wrongWords(state).length, grammarMistakes: L.mistakes(state).length,
      expressionDrafts: C.tasks.filter(t => state.expressions[t.id]?.text.trim()).length,
      foundationPassed: L.foundationProgress(state).filter(f => f.passed).length
    };
  }
  return { setLearningPosition, learningDestination, profileSummary };
}
module.exports = { restorePosition, createProfile };
