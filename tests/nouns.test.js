const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../miniprogram/lib/learning');
const answers = id => L.nounLessons.find(n => n.id === id).questions.map(q => q.answer);

test('名词首批范围只复用已核对课内词，覆盖性数、复数重音与 agua 例外', () => {
  assert.equal(L.nounLessons.length, 8);
  assert.equal(new Set(L.nounLessons.map(n => n.id)).size, 8);
  for (const n of L.nounLessons) {
    const word = L.findWord(n.id);
    assert.equal(word.verification.status, 'reviewed');
    assert.equal(word.spanish, n.noun);
    assert.equal(n.questions.length, 3);
    for (const ref of n.references) assert.ok(L.course.sources.some(s => s.id === ref.sourceId));
    assert.ok(n.reviewScope.includes('待教师审稿'));
  }
  const agua = L.nounLessons.find(n => n.id === 'w24');
  assert.equal(agua.gender, '阴性'); assert.equal(agua.singular, 'el agua'); assert.equal(agua.plural, 'las aguas');
  assert.equal(agua.questions[1].answer, 'fría'); assert.ok(agua.note.includes('不能直接理解成几杯水'));
  assert.equal(L.nounLessons.find(n => n.id === 'w18').plural, 'los países');
});

test('名词输入容忍大小写空格与 NFC，但拒绝漏重音、ñ、错性数与缺词', () => {
  assert.equal(L.evaluateNounAnswer('w24', 2, '  EL  AGUA está fri\u0301a.  ').correct, true);
  assert.equal(L.evaluateNounAnswer('w24', 1, 'frío').correct, false);
  assert.equal(L.evaluateNounAnswer('w24', 2, 'El agua está fria.').correct, false);
  assert.equal(L.evaluateNounAnswer('w18', 2, 'Los paises son pequeños.').correct, false);
  assert.equal(L.evaluateNounAnswer('w21', 1, 'pequenos').correct, false);
  assert.equal(L.evaluateNounAnswer('w22', 1, 'pequeños').correct, false);
  assert.equal(L.evaluateNounAnswer('w22', 2, 'pequeñas').correct, false);
  assert.equal(L.evaluateNounAnswer('w22', 2, 'Las mesas son pequeñas!').correct, true);
  assert.throws(() => L.evaluateNounAnswer('w24', 1, ' '));
});

test('名词首次结果、错项订正与最佳分保存，独立于词量打卡及解锁', () => {
  const s = L.emptyState(); const before = L.summary(s);
  const a = answers('w24'); a[0] = 'la'; a[1] = 'frío';
  assert.equal(L.gradeNoun(s, 'w24', a).score, 33);
  assert.equal(L.nounProgress(s).find(n => n.id === 'w24').mistakes.length, 2);
  assert.deepEqual(L.restore(JSON.parse(JSON.stringify(s))), s);
  L.gradeNoun(s, 'w24', answers('w24'));
  assert.deepEqual(s.nounMistakes, {}); assert.equal(s.nounPractice.w24.bestScore, 100);
  L.gradeNoun(s, 'w24', a); assert.equal(s.nounPractice.w24.bestScore, 100); assert.equal(s.nounPractice.w24.attempts, 3);
  assert.deepEqual(L.summary(s), before); assert.deepEqual(s.reviews, {}); assert.deepEqual(s.lessons, {});
  assert.equal(L.isUnlocked(s, 'u2'), false);
  const snapshot = structuredClone(s);
  assert.throws(() => L.gradeNoun(s, 'w24', ['el', 'fría', '']));
  assert.deepEqual(s, snapshot);
  assert.throws(() => L.gradeNoun(s, 'w24', ['el']));
  assert.throws(() => L.gradeNoun(s, 'w24', new Array(3)));
  assert.deepEqual(s, snapshot);
});

test('名词可选备份字段兼容旧记录，并过滤未知 ID 和无效结果', () => {
  const old = L.emptyState(); L.review(old, 'w1', 'remember'); delete old.nounPractice; delete old.nounMistakes;
  const clean = L.restore(old); assert.equal(L.summary(clean).learned, 1); assert.deepEqual(clean.nounPractice, {});
  old.nounPractice = { w24: { bestScore: 67, attempts: 1 }, w21: { bestScore: 75, attempts: 1 }, unknown: { bestScore: 100, attempts: 1 } };
  old.nounMistakes = { 'w24-adjective': { answer: 'frío' }, unknown: { answer: 'wrong' }, 'w21-article': { answer: 'x'.repeat(201) } };
  const restored = L.restore(old);
  assert.deepEqual(restored.nounPractice, { w24: { bestScore: 67, attempts: 1 } });
  assert.deepEqual(restored.nounMistakes, { 'w24-adjective': { answer: 'frío' } });
});
