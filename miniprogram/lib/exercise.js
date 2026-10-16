// 临时作答状态。只有最后一步的 save 成功，才进入结果页。
function createExerciseSession(id, questions, form = 0) {
  if (!Array.isArray(questions) || !questions.length) throw new Error('没有可练习的题目');
  return { id, questions, form, total: questions.length, index: 0, answers: [], input: '', feedback: null, result: null, showHint: false };
}

function answerExercise(session, answer, evaluate) {
  if (!session || session.feedback || session.result) return false;
  // 先检查，再记录，避免检查失败后留下半份答案。
  const feedback = evaluate(session.id, session.index, answer, session.form);
  session.answers[session.index] = answer;
  session.input = answer;
  session.feedback = feedback;
  return true;
}

function advanceExercise(session, save) {
  if (!session || !session.feedback || session.result) return false;
  if (session.index + 1 === session.total) {
    const result = save(session.id, session.answers);
    if (!result) return false;
    session.result = result;
  } else {
    session.index++;
    session.input = '';
    session.feedback = null;
    session.showHint = false;
  }
  return true;
}

function normalizeSpanish(text, { preservePunctuation = false, ignoreOpeningPunctuation = false } = {}) {
  let clean = text.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!preservePunctuation) {
    if (ignoreOpeningPunctuation) clean = clean.replace(/^[¿¡]+/, '');
    clean = clean.replace(/[.!?。！？]+$/, '').trim();
  }
  return clean;
}

function checkSpanishAnswer(answer, accepted, options) {
  const actual = normalizeSpanish(answer, options);
  const expected = accepted.map(text => normalizeSpanish(text, options));
  const correct = expected.includes(actual);
  const letters = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const attention = !correct && expected.some(text => letters(text) === letters(actual))
    ? '再对照答案检查重音、ü 和 ñ 的拼写。符号不同，词的读音或意思也可能不同。' : '';
  return { correct, answer: accepted.join(' / '), attention };
}

module.exports = { createExerciseSession, answerExercise, advanceExercise, normalizeSpanish, checkSpanishAnswer };
