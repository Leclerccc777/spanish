const nounLessons = require('../data/noun-practice');
const byId = new Map(nounLessons.map(n => [n.id, n]));
const normalize = text => text.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?。！？]+$/, '').trim();
function evaluateNounAnswer(id, position, answer) {
  const lesson = byId.get(id), question = lesson && lesson.questions[position];
  if (!question || !Number.isInteger(position) || typeof answer !== 'string' || !answer.trim() || answer.length > 200) throw new Error('请填写本题答案');
  return { correct: normalize(answer) === normalize(question.answer), answer: question.answer, explanation: question.explanation };
}
function restoreNouns(raw) {
  const nounPractice = {}, nounMistakes = {};
  for (const n of nounLessons) {
    const r = raw.nounPractice && raw.nounPractice[n.id];
    if (r && [0, 33, 67, 100].includes(r.bestScore) && Number.isSafeInteger(r.attempts) && r.attempts > 0) nounPractice[n.id] = { bestScore: r.bestScore, attempts: r.attempts };
    for (const q of n.questions) {
      const m = raw.nounMistakes && raw.nounMistakes[q.id];
      if (m && typeof m.answer === 'string' && m.answer.trim() && m.answer.length <= 200) nounMistakes[q.id] = { answer: m.answer };
    }
  }
  return { nounPractice, nounMistakes };
}
function nounProgress(state) {
  return nounLessons.map(n => ({ ...n, bestScore: state.nounPractice[n.id] ? state.nounPractice[n.id].bestScore : null, mistakes: n.questions.filter(q => state.nounMistakes[q.id]).map(q => ({ ...q, previousAnswer: state.nounMistakes[q.id].answer })) }));
}
function gradeNoun(state, id, answers) {
  const lesson = byId.get(id);
  if (!lesson || !Array.isArray(answers) || answers.length !== lesson.questions.length) throw new Error('请完成名词的三步练习');
  // 先完整校验，再修改记录，保证无效答案不会留下半份进度。
  const results = lesson.questions.map((q, i) => evaluateNounAnswer(id, i, answers[i]));
  const correct = results.filter(r => r.correct).length, score = Math.round(correct / results.length * 100);
  const previous = state.nounPractice[id] || { bestScore: 0, attempts: 0 };
  state.nounPractice[id] = { bestScore: Math.max(previous.bestScore, score), attempts: previous.attempts + 1 };
  lesson.questions.forEach((q, i) => { if (results[i].correct) delete state.nounMistakes[q.id]; else state.nounMistakes[q.id] = { answer: answers[i] }; });
  return { correct, total: results.length, score, results };
}
module.exports = { nounLessons, evaluateNounAnswer, restoreNouns, nounProgress, gradeNoun };
