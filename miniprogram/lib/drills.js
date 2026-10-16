const { parallelQuestions } = require('./variants');
const variants = require('../data/drill-variants');
const drillPacks = require('../data/drills');
const studyPacks = [...drillPacks].sort((a, b) => a.studyOrder - b.studyOrder);
const index = new Map(drillPacks.map(p => [p.id, p]));
const { checkSpanishAnswer } = require('./exercise');
function drillUnlocked(state, id) {
  let pack = index.get(id);
  if (!pack) return false;
  const seen = new Set([id]);
  while (pack.previousId) {
    if (seen.has(pack.previousId)) return false;
    seen.add(pack.previousId);
    const previous = index.get(pack.previousId), result = state.drills[pack.previousId];
    if (!previous || !result || result.bestScore < 75) return false;
    pack = previous;
  }
  return true;
}
function nextDrillPack(state, id) {
  const unfinished = p => drillUnlocked(state, p.id) && (!state.drills[p.id] || state.drills[p.id].bestScore < 75);
  const current = index.get(id);
  return (current && studyPacks.find(p => p.level === current.level && unfinished(p))) || studyPacks.find(unfinished) || null;
}
function drillProgress(state) {
  return studyPacks.map(p => ({ ...p, unlocked: drillUnlocked(state, p.id), bestScore: state.drills[p.id] ? state.drills[p.id].bestScore : null,
    mistakes: p.questions.filter(q => state.drillMistakes[q.id]).map(q => ({ ...drillQuestions(p.id, state.drillMistakes[q.id].form || 0).find(item => item.id === q.id), previousAnswer: state.drillMistakes[q.id].answer })) }));
}
function drillQuestions(id, form = 0) {
  const pack = index.get(id);
  if (!pack) throw new Error('未知练习包');
  return parallelQuestions(pack.questions, form, variants).map(q => ({...q, reading:q.reading || pack.reading, glossary:form ? '' : pack.glossary}));
}
function evaluateDrillAnswer(id, position, answer, form = 0) {
  const q = drillQuestions(id, form)[position];
  if (!q || !Number.isInteger(position) || typeof answer !== 'string' || !answer.trim() || answer.length > 500) throw new Error('请填写本题答案');
  return { ...checkSpanishAnswer(answer, q.answers, { preservePunctuation: q.preservePunctuation, ignoreOpeningPunctuation: true }), explanation: q.explanation };
}
function gradeDrill(state, id, answers, form = 0) {
  const pack = index.get(id);
  if (!pack || !drillUnlocked(state, id)) throw new Error('请先完成前面的练习包');
  if (!Array.isArray(answers) || answers.length !== pack.questions.length) throw new Error('请完整作答四道练习');
  const results = pack.questions.map((q, i) => evaluateDrillAnswer(id, i, answers[i], form));
  const correct = results.filter(r => r.correct).length, score = correct * 25;
  const previous = state.drills[id] || { bestScore: 0, attempts: 0 };
  state.drills[id] = { bestScore: Math.max(previous.bestScore, score), attempts: previous.attempts + 1 };
  pack.questions.forEach((q, i) => { if (results[i].correct) delete state.drillMistakes[q.id]; else state.drillMistakes[q.id] = { answer: answers[i], ...(form ? {form} : {}) }; });
  return { correct, total: results.length, score, passed: score >= 75, results };
}
function saveDrillDraft(state, id, text) {
  if (!index.has(id) || !drillUnlocked(state, id)) throw new Error('请先完成前面的练习包');
  if (typeof text !== 'string' || text.length > 3000) throw new Error('表达草稿最多 3000 字符');
  const previous = state.drillDrafts[id];
  if (previous && previous.text === text) return previous;
  state.drillDrafts[id] = { text, revisions: Math.min(Number.MAX_SAFE_INTEGER, (previous ? previous.revisions || 1 : 0) + 1), checks: [] };
  if (previous) state.drillDrafts[id].previousText = previous.text;
  return state.drillDrafts[id];
}
function revertDrillDraft(state, id) {
  const draft = state.drillDrafts[id];
  if (!index.has(id) || !drillUnlocked(state, id) || !draft || typeof draft.previousText !== 'string') throw new Error('没有可恢复的上一保存版本');
  return saveDrillDraft(state, id, draft.previousText);
}
function setDrillChecks(state, id, checks) {
  const pack = index.get(id), draft = state.drillDrafts[id];
  if (!pack || !drillUnlocked(state, id) || !draft || !draft.text.trim()) throw new Error('先写自己的表达并保存草稿');
  if (!Array.isArray(checks) || checks.length > pack.output.rubric.length || Array.from(checks).some(i => !Number.isInteger(i) || i < 0 || i >= pack.output.rubric.length)) throw new Error('无效的表达自查项');
  draft.checks = [...new Set(checks)].sort((a, b) => a - b);
  return draft;
}
function restoreDrills(raw) {
  const drills = {}, drillMistakes = {}, drillDrafts = {};
  for (const pack of drillPacks) {
    const r = raw.drills && raw.drills[pack.id];
    if (r && [0, 25, 50, 75, 100].includes(r.bestScore) && Number.isSafeInteger(r.attempts) && r.attempts > 0) drills[pack.id] = { bestScore: r.bestScore, attempts: r.attempts };
    const d = raw.drillDrafts && raw.drillDrafts[pack.id];
    if (d && typeof d.text === 'string' && d.text.length <= 3000) {
      drillDrafts[pack.id] = { text: d.text, revisions: Number.isSafeInteger(d.revisions) && d.revisions > 0 ? d.revisions : 1,
        checks: d.text.trim() && Array.isArray(d.checks) ? [...new Set(d.checks.filter(i => Number.isInteger(i) && i >= 0 && i < pack.output.rubric.length))].sort((a, b) => a - b) : [] };
      if (typeof d.previousText === 'string' && d.previousText.length <= 3000 && d.previousText !== d.text) drillDrafts[pack.id].previousText = d.previousText;
    }
    for (const q of pack.questions) {
      const m = raw.drillMistakes && raw.drillMistakes[q.id];
      if (m && typeof m.answer === 'string' && m.answer.trim() && m.answer.length <= 500) drillMistakes[q.id] = { answer: m.answer, ...(m.form === 1 ? {form:1} : {}) };
    }
  }
  return { drills, drillMistakes, drillDrafts };
}
module.exports = { drillQuestions, drillPacks, drillUnlocked, nextDrillPack, drillProgress, evaluateDrillAnswer, gradeDrill, saveDrillDraft, revertDrillDraft, setDrillChecks, restoreDrills };
