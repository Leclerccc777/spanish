const { test } = require('node:test');
const assert = require('node:assert/strict');
const E = require('../miniprogram/lib/exercise');
const L = require('../miniprogram/lib/learning');

test('共享作答流程拒绝重复提交，保存失败可重试且不提前结束', () => {
  const pack = L.drillPacks[0];
  const session = E.createExerciseSession(pack.id, pack.questions);
  const state = L.emptyState();
  let writes = 0;
  assert.equal(E.advanceExercise(session, () => { writes++; }), false);
  for (const [index, question] of pack.questions.entries()) {
    session.showHint = true;
    assert.equal(E.answerExercise(session, question.answers[0], L.evaluateDrillAnswer), true);
    assert.equal(E.answerExercise(session, 'wrong', L.evaluateDrillAnswer), false);
    if (index < 3) {
      assert.equal(E.advanceExercise(session, () => { writes++; }), true);
      assert.equal(session.showHint, false);
      assert.equal(session.feedback, null);
    }
  }
  const before = structuredClone(session);
  assert.equal(E.advanceExercise(session, () => null), false);
  assert.deepEqual(session, before);
  assert.equal(writes, 0);
  assert.equal(E.advanceExercise(session, (id, answers) => { writes++; return L.gradeDrill(state, id, answers); }), true);
  assert.equal(session.result.score, 100);
  assert.equal(E.advanceExercise(session, () => { writes++; }), false);
  assert.equal(writes, 1);
  assert.equal(state.drills[pack.id].attempts, 1);
});

test('答案检查失败不留下临时答案，提示不写成绩或改变前置关系', () => {
  const pack = L.drillPacks[0];
  const session = E.createExerciseSession(pack.id, pack.questions);
  const state = L.emptyState();
  const before = structuredClone(state);
  assert.throws(() => E.answerExercise(session, '', L.evaluateDrillAnswer));
  assert.deepEqual(session.answers, []);
  assert.equal(session.feedback, null);
  session.showHint = true;
  assert.deepEqual(state, before);
  assert.equal(L.drillUnlocked(state, 'a1-routine'), false);
});

test('重音提示只在字母和词序已匹配时出现，不放宽 ñ、ü 或明确标点要求', () => {
  assert.equal(L.evaluateNounAnswer('w21', 1, 'pequenos').correct, false);
  assert.match(L.evaluateNounAnswer('w21', 1, 'pequenos').attention, /拼写/);
  assert.equal(L.evaluateNounAnswer('w22', 1, 'pequeños').attention, '');
  assert.match(L.evaluateDrillAnswer('a1-place', 1, 'esta').attention, /重音/);
  assert.equal(L.evaluateDrillAnswer('a1-place', 1, 'está').attention, '');
  assert.equal(E.checkSpanishAnswer('pinguino', ['pingüino']).correct, false);
  assert.match(E.checkSpanishAnswer('pinguino', ['pingüino']).attention, /ü/);
  assert.equal(L.evaluateDrillAnswer('a1-greetings', 2, 'Cómo estás?').attention, '');
  assert.equal(L.evaluateDrillAnswer('a1-greetings', 2, 'Cómo estás?').correct, false);
  assert.equal(L.evaluateDrillAnswer('b2-hypothesis', 1, 'TUVIESE').correct, true);
});
