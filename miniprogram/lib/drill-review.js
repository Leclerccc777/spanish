const D = require('./drills');
function drillWrongQuestions(state, level = '') {
  if (!['', 'A1', 'A2', 'B1', 'B2'].includes(level)) throw new Error('未知练习等级');
  return D.drillPacks.filter(p => (!level || p.level === level) && D.drillUnlocked(state, p.id)).flatMap(p =>
    p.questions.flatMap((q, position) => state.drillMistakes[q.id] ? [{ ...D.drillQuestions(p.id, state.drillMistakes[q.id].form || 0)[position], packId: p.id, position, packTitle: p.title, level: p.level }] : []));
}
function nextDrillReviewQuestion(q) { return {...q, ...D.drillQuestions(q.packId, q.form === 1 ? 0 : 1)[q.position]}; }
function drillReviewQueue(state, level = '') { return drillWrongQuestions(state, level).slice(0, 12).map(nextDrillReviewQuestion); }
function reviewDrillMistake(state, questionId, answer, form = 0) {
  const pack = D.drillPacks.find(p => p.questions.some(q => q.id === questionId));
  if (!pack || !D.drillUnlocked(state, pack.id)) throw new Error('请先完成前面的练习包');
  const position = pack.questions.findIndex(q => q.id === questionId);
  const result = D.evaluateDrillAnswer(pack.id, position, answer, form);
  if (!state.drillMistakes[questionId]) return { ...result, alreadyCleared: true };
  if (result.correct) delete state.drillMistakes[questionId];
  else state.drillMistakes[questionId] = { answer, ...(form ? {form} : {}) };
  return result;
}
module.exports = { nextDrillReviewQuestion, drillWrongQuestions, drillReviewQueue, reviewDrillMistake };
