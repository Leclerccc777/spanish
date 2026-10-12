const drillPacks = require('../data/drills');
const index = new Map(drillPacks.map(p => [p.id, p]));
const normalize = text => text.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ').replace(/^[¿¡]+/, '').replace(/[.!?。！？]+$/, '').trim();
function drillUnlocked(state, id) {
  const position = drillPacks.findIndex(p => p.id === id);
  return position >= 0 && drillPacks.slice(0, position).every(p => state.drills[p.id] && state.drills[p.id].bestScore >= 75);
}
function drillProgress(state) {
  return drillPacks.map(p => ({ ...p, unlocked: drillUnlocked(state, p.id), bestScore: state.drills[p.id] ? state.drills[p.id].bestScore : null,
    mistakes: p.questions.filter(q => state.drillMistakes[q.id]).map(q => ({ ...q, previousAnswer: state.drillMistakes[q.id].answer })) }));
}
function evaluateDrillAnswer(id, position, answer) {
  const pack = index.get(id), q = pack && pack.questions[position];
  if (!q || !Number.isInteger(position) || typeof answer !== 'string' || !answer.trim() || answer.length > 500) throw new Error('请填写本题答案');
  return { correct: q.answers.some(a => normalize(a) === normalize(answer)), answer: q.answers.join(' / '), explanation: q.explanation };
}
function gradeDrill(state, id, answers) {
  const pack = index.get(id);
  if (!pack || !drillUnlocked(state, id)) throw new Error('请先完成前面的练习包');
  if (!Array.isArray(answers) || answers.length !== pack.questions.length) throw new Error('请完整作答四道练习');
  const results = pack.questions.map((q, i) => evaluateDrillAnswer(id, i, answers[i]));
  const correct = results.filter(r => r.correct).length, score = correct * 25;
  const previous = state.drills[id] || { bestScore: 0, attempts: 0 };
  state.drills[id] = { bestScore: Math.max(previous.bestScore, score), attempts: previous.attempts + 1 };
  pack.questions.forEach((q, i) => { if (results[i].correct) delete state.drillMistakes[q.id]; else state.drillMistakes[q.id] = { answer: answers[i] }; });
  return { correct, total: results.length, score, passed: score >= 75, results };
}
function saveDrillDraft(state, id, text) {
  if (!index.has(id) || !drillUnlocked(state, id)) throw new Error('请先完成前面的练习包');
  if (typeof text !== 'string' || text.length > 3000) throw new Error('表达草稿最多 3000 字符');
  state.drillDrafts[id] = { text };
  return state.drillDrafts[id];
}
function restoreDrills(raw) {
  const drills = {}, drillMistakes = {}, drillDrafts = {};
  for (const pack of drillPacks) {
    const r = raw.drills && raw.drills[pack.id];
    if (r && [0, 25, 50, 75, 100].includes(r.bestScore) && Number.isSafeInteger(r.attempts) && r.attempts > 0) drills[pack.id] = { bestScore: r.bestScore, attempts: r.attempts };
    const d = raw.drillDrafts && raw.drillDrafts[pack.id];
    if (d && typeof d.text === 'string' && d.text.length <= 3000) drillDrafts[pack.id] = { text: d.text };
    for (const q of pack.questions) {
      const m = raw.drillMistakes && raw.drillMistakes[q.id];
      if (m && typeof m.answer === 'string' && m.answer.trim() && m.answer.length <= 500) drillMistakes[q.id] = { answer: m.answer };
    }
  }
  return { drills, drillMistakes, drillDrafts };
}
module.exports = { drillPacks, drillUnlocked, drillProgress, evaluateDrillAnswer, gradeDrill, saveDrillDraft, restoreDrills };
